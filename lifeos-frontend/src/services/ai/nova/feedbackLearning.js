/**
 * Nova Feedback Learning System
 *
 * Learns from user behavior to improve recommendations:
 * - Tracks if advice was followed
 * - Learns from dismissed suggestions
 * - Adapts communication style
 * - Builds preference model
 */

import { supabase, getCurrentUserId } from '../../../lib/supabase';
import { storeWithEmbedding } from './embeddingService';
import { statisticsService } from './statisticsService';

// Feedback types
const FEEDBACK_TYPES = {
  ADVICE_FOLLOWED: 'advice_followed',
  ADVICE_IGNORED: 'advice_ignored',
  SUGGESTION_ACCEPTED: 'suggestion_accepted',
  SUGGESTION_DISMISSED: 'suggestion_dismissed',
  POSITIVE_REACTION: 'positive_reaction',
  NEGATIVE_REACTION: 'negative_reaction',
  TOPIC_ENGAGED: 'topic_engaged',
  TOPIC_AVOIDED: 'topic_avoided'
};

// Learning categories
const LEARNING_CATEGORIES = {
  COMMUNICATION_STYLE: 'communication_style',
  TOPIC_PREFERENCE: 'topic_preference',
  TIMING_PREFERENCE: 'timing_preference',
  ADVICE_EFFECTIVENESS: 'advice_effectiveness',
  FEATURE_USAGE: 'feature_usage'
};

/**
 * Record feedback event
 */
export async function recordFeedback(feedbackType, context, metadata = {}) {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  try {
    const { data, error } = await supabase
      .from('nova_user_events')
      .insert({
        user_id: userId,
        module: 'nova',
        action: feedbackType,
        metadata: {
          ...metadata,
          context,
          recordedAt: new Date().toISOString()
        },
        importance: calculateFeedbackImportance(feedbackType)
      })
      .select('id')
      .single();

    if (error) throw error;

    // Trigger learning update
    await updateLearning(feedbackType, context, metadata);

    return data?.id;
  } catch (error) {
    console.error('Failed to record feedback:', error);
    return null;
  }
}

/**
 * Calculate importance based on feedback type
 */
function calculateFeedbackImportance(feedbackType) {
  const importanceMap = {
    [FEEDBACK_TYPES.ADVICE_FOLLOWED]: 3,
    [FEEDBACK_TYPES.ADVICE_IGNORED]: 2,
    [FEEDBACK_TYPES.SUGGESTION_ACCEPTED]: 3,
    [FEEDBACK_TYPES.SUGGESTION_DISMISSED]: 2,
    [FEEDBACK_TYPES.POSITIVE_REACTION]: 2,
    [FEEDBACK_TYPES.NEGATIVE_REACTION]: 3, // Negative feedback is important to learn from
    [FEEDBACK_TYPES.TOPIC_ENGAGED]: 2,
    [FEEDBACK_TYPES.TOPIC_AVOIDED]: 2
  };
  return importanceMap[feedbackType] || 1;
}

/**
 * Update learning based on feedback
 */
async function updateLearning(feedbackType, context, metadata) {
  const userId = await getCurrentUserId();
  if (!userId) return;

  try {
    // Get existing learning for this category
    const category = categorizeFeedback(feedbackType, context);
    const key = `learning_${category}_${context.topic || 'general'}`;

    const { data: existing } = await supabase
      .from('nova_insights')
      .select('*')
      .eq('user_id', userId)
      .eq('insight_type', key)
      .single();

    const isPositive = [
      FEEDBACK_TYPES.ADVICE_FOLLOWED,
      FEEDBACK_TYPES.SUGGESTION_ACCEPTED,
      FEEDBACK_TYPES.POSITIVE_REACTION,
      FEEDBACK_TYPES.TOPIC_ENGAGED
    ].includes(feedbackType);

    if (existing) {
      // Update existing learning
      const currentScore = existing.data_points?.score || 0;
      const currentCount = existing.data_points?.count || 0;
      const newScore = currentScore + (isPositive ? 1 : -1);
      const newCount = currentCount + 1;

      await supabase
        .from('nova_insights')
        .update({
          confidence: Math.min(1, newCount / 20), // Confidence grows with data
          data_points: {
            score: newScore,
            count: newCount,
            lastUpdated: new Date().toISOString(),
            successRate: (newScore + newCount) / (2 * newCount) // Normalized 0-1
          }
        })
        .eq('id', existing.id);
    } else {
      // Create new learning
      await supabase
        .from('nova_insights')
        .insert({
          user_id: userId,
          insight_type: key,
          title: `Learning: ${category}`,
          content: `User ${isPositive ? 'responds well to' : 'dislikes'} ${context.topic || context.type || 'this'}`,
          confidence: 0.1,
          data_points: {
            score: isPositive ? 1 : -1,
            count: 1,
            firstRecorded: new Date().toISOString()
          },
          is_active: true
        });
    }
  } catch (error) {
    console.error('Failed to update learning:', error);
  }
}

/**
 * Categorize feedback for learning
 */
function categorizeFeedback(feedbackType, context) {
  if (context.communicationStyle) return LEARNING_CATEGORIES.COMMUNICATION_STYLE;
  if (context.topic) return LEARNING_CATEGORIES.TOPIC_PREFERENCE;
  if (context.timing) return LEARNING_CATEGORIES.TIMING_PREFERENCE;
  if (context.advice) return LEARNING_CATEGORIES.ADVICE_EFFECTIVENESS;
  return LEARNING_CATEGORIES.FEATURE_USAGE;
}

/**
 * Track if user followed Nova's advice
 */
export async function trackAdviceOutcome(adviceId, wasFollowed, outcome = null) {
  return recordFeedback(
    wasFollowed ? FEEDBACK_TYPES.ADVICE_FOLLOWED : FEEDBACK_TYPES.ADVICE_IGNORED,
    { adviceId, type: 'advice' },
    { outcome, followedAt: wasFollowed ? new Date().toISOString() : null }
  );
}

/**
 * Track suggestion response
 */
export async function trackSuggestionResponse(suggestionType, wasAccepted, context = {}) {
  return recordFeedback(
    wasAccepted ? FEEDBACK_TYPES.SUGGESTION_ACCEPTED : FEEDBACK_TYPES.SUGGESTION_DISMISSED,
    { topic: suggestionType, type: 'suggestion', ...context },
    { respondedAt: new Date().toISOString() }
  );
}

/**
 * Track topic engagement
 */
export async function trackTopicEngagement(topic, engaged, duration = null) {
  return recordFeedback(
    engaged ? FEEDBACK_TYPES.TOPIC_ENGAGED : FEEDBACK_TYPES.TOPIC_AVOIDED,
    { topic, type: 'topic' },
    { duration, engagedAt: engaged ? new Date().toISOString() : null }
  );
}

/**
 * Get user preferences learned from feedback
 */
export async function getLearnedPreferences() {
  const userId = await getCurrentUserId();
  if (!userId) return {};

  try {
    const { data: learnings, error } = await supabase
      .from('nova_insights')
      .select('*')
      .eq('user_id', userId)
      .like('insight_type', 'learning_%')
      .gte('confidence', 0.3); // Only return reasonably confident learnings

    if (error || !learnings) return {};

    const preferences = {
      topics: { preferred: [], avoided: [] },
      communication: {},
      timing: {},
      advice: { effective: [], ineffective: [] }
    };

    learnings.forEach(learning => {
      const score = learning.data_points?.score || 0;
      const successRate = learning.data_points?.successRate || 0.5;
      const parts = learning.insight_type.split('_');
      const category = parts[1];
      const topic = parts.slice(2).join('_');

      if (category === 'topic') {
        if (successRate > 0.6) preferences.topics.preferred.push(topic);
        else if (successRate < 0.4) preferences.topics.avoided.push(topic);
      } else if (category === 'advice') {
        if (successRate > 0.6) preferences.advice.effective.push(topic);
        else if (successRate < 0.4) preferences.advice.ineffective.push(topic);
      } else if (category === 'communication') {
        preferences.communication[topic] = successRate;
      } else if (category === 'timing') {
        preferences.timing[topic] = successRate;
      }
    });

    return preferences;
  } catch (error) {
    console.error('Failed to get learned preferences:', error);
    return {};
  }
}

/**
 * Get advice effectiveness statistics
 */
export async function getAdviceEffectiveness() {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  try {
    const { data: events, error } = await supabase
      .from('nova_user_events')
      .select('action, metadata, created_at')
      .eq('user_id', userId)
      .eq('module', 'nova')
      .in('action', [FEEDBACK_TYPES.ADVICE_FOLLOWED, FEEDBACK_TYPES.ADVICE_IGNORED])
      .order('created_at', { ascending: false })
      .limit(100);

    if (error || !events || events.length < 5) {
      return { insufficient_data: true };
    }

    const followed = events.filter(e => e.action === FEEDBACK_TYPES.ADVICE_FOLLOWED);
    const ignored = events.filter(e => e.action === FEEDBACK_TYPES.ADVICE_IGNORED);

    const followRate = followed.length / events.length;

    // Analyze by topic
    const byTopic = {};
    events.forEach(e => {
      const topic = e.metadata?.context?.topic || 'general';
      if (!byTopic[topic]) byTopic[topic] = { followed: 0, ignored: 0 };
      if (e.action === FEEDBACK_TYPES.ADVICE_FOLLOWED) byTopic[topic].followed++;
      else byTopic[topic].ignored++;
    });

    // Calculate follow rate by topic
    const topicEffectiveness = Object.entries(byTopic)
      .map(([topic, data]) => ({
        topic,
        followRate: data.followed / (data.followed + data.ignored),
        sampleSize: data.followed + data.ignored
      }))
      .filter(t => t.sampleSize >= 3)
      .sort((a, b) => b.followRate - a.followRate);

    return {
      overall: {
        followRate: Math.round(followRate * 100),
        totalAdvice: events.length,
        followed: followed.length,
        ignored: ignored.length
      },
      byTopic: topicEffectiveness,
      trend: analyzeTrend(events),
      confidence: statisticsService.confidenceInterval(
        events.map(e => e.action === FEEDBACK_TYPES.ADVICE_FOLLOWED ? 1 : 0)
      )
    };
  } catch (error) {
    console.error('Failed to get advice effectiveness:', error);
    return null;
  }
}

/**
 * Analyze trend in advice following
 */
function analyzeTrend(events) {
  if (events.length < 10) return 'insufficient_data';

  // Split into halves
  const mid = Math.floor(events.length / 2);
  const recent = events.slice(0, mid);
  const older = events.slice(mid);

  const recentRate = recent.filter(e => e.action === FEEDBACK_TYPES.ADVICE_FOLLOWED).length / recent.length;
  const olderRate = older.filter(e => e.action === FEEDBACK_TYPES.ADVICE_FOLLOWED).length / older.length;

  const change = recentRate - olderRate;

  if (change > 0.1) return 'improving';
  if (change < -0.1) return 'declining';
  return 'stable';
}

/**
 * Build context for personalized responses
 * OPTIMIZED: Run database calls in parallel
 */
export async function buildPersonalizationContext() {
  // Run both queries in parallel for speed
  const [preferences, effectiveness] = await Promise.all([
    getLearnedPreferences(),
    getAdviceEffectiveness()
  ]);

  let context = '';

  if (preferences.topics?.preferred?.length > 0) {
    context += `\nUSER PREFERENCES (learned from behavior):\n`;
    context += `- Engages well with: ${preferences.topics.preferred.join(', ')}\n`;
  }

  if (preferences.topics?.avoided?.length > 0) {
    context += `- Tends to avoid: ${preferences.topics.avoided.join(', ')}\n`;
  }

  if (preferences.advice?.effective?.length > 0) {
    context += `- Follows advice about: ${preferences.advice.effective.join(', ')}\n`;
  }

  if (effectiveness && !effectiveness.insufficient_data) {
    context += `\nADVICE EFFECTIVENESS:\n`;
    context += `- Overall follow rate: ${effectiveness.overall.followRate}%\n`;
    if (effectiveness.trend !== 'stable') {
      context += `- Trend: ${effectiveness.trend}\n`;
    }
  }

  return context;
}

/**
 * Store successful interaction pattern
 */
export async function recordSuccessfulPattern(pattern, context) {
  const content = `Successful interaction pattern: ${pattern}. Context: ${JSON.stringify(context)}`;

  return storeWithEmbedding(
    content,
    'user_preference',
    {
      patternType: 'successful_interaction',
      context,
      recordedAt: new Date().toISOString()
    },
    3 // Medium-high importance
  );
}

export const feedbackLearning = {
  FEEDBACK_TYPES,
  LEARNING_CATEGORIES,
  recordFeedback,
  trackAdviceOutcome,
  trackSuggestionResponse,
  trackTopicEngagement,
  getLearnedPreferences,
  getAdviceEffectiveness,
  buildPersonalizationContext,
  recordSuccessfulPattern
};

export default feedbackLearning;
