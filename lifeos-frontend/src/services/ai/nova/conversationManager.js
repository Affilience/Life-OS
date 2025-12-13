/**
 * Nova Conversation Manager
 *
 * Handles conversation lifecycle:
 * - Message history with token limits
 * - Conversation summarization
 * - Entity extraction
 * - Topic tracking
 * - Context carryover between sessions
 */

import { supabase, getCurrentUserId } from '../../../lib/supabase';
import { tokenManager } from './tokenManager';
import { storeWithEmbedding } from './embeddingService';

// Conversation limits
const LIMITS = {
  MAX_MESSAGES_IN_CONTEXT: 20,
  MAX_TOKENS_HISTORY: 2000,
  SUMMARIZE_AFTER_MESSAGES: 10,
  MAX_STORED_MESSAGES: 100
};

// Entity types to extract
const ENTITY_TYPES = {
  GOAL: 'goal',
  PREFERENCE: 'preference',
  CONCERN: 'concern',
  ACHIEVEMENT: 'achievement',
  PLAN: 'plan',
  QUESTION: 'question'
};

/**
 * Get optimized conversation history
 * Returns messages prioritized by recency and relevance
 */
export async function getOptimizedHistory(conversationId, currentQuery = '') {
  const userId = await getCurrentUserId();
  if (!userId) return [];

  try {
    const { data: messages, error } = await supabase
      .from('nova_messages')
      .select('role, content, created_at, metadata')
      .eq('conversation_id', conversationId)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(LIMITS.MAX_MESSAGES_IN_CONTEXT);

    if (error || !messages) return [];

    // Prioritize and fit within token budget
    const prioritized = tokenManager.prioritizeConversationHistory(
      messages.reverse(), // Chronological order
      LIMITS.MAX_TOKENS_HISTORY
    );

    return prioritized;
  } catch (error) {
    console.error('Failed to get conversation history:', error);
    return [];
  }
}

/**
 * Generate conversation summary
 * Called when conversation exceeds threshold
 */
export async function summarizeConversation(conversationId) {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  try {
    // Get all messages in conversation
    const { data: messages, error } = await supabase
      .from('nova_messages')
      .select('role, content, created_at')
      .eq('conversation_id', conversationId)
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error || !messages || messages.length < 5) return null;

    // Extract key information
    const summary = extractConversationSummary(messages);

    // Store summary
    const { error: updateError } = await supabase
      .from('nova_conversations')
      .update({
        summary: summary.text,
        metadata: {
          topics: summary.topics,
          entities: summary.entities,
          summarizedAt: new Date().toISOString(),
          messageCount: messages.length
        }
      })
      .eq('id', conversationId);

    if (updateError) throw updateError;

    // Store summary as searchable memory
    await storeWithEmbedding(
      `Conversation summary: ${summary.text}`,
      'conversation',
      {
        conversationId,
        topics: summary.topics,
        summarizedAt: new Date().toISOString()
      },
      2
    );

    return summary;
  } catch (error) {
    console.error('Failed to summarize conversation:', error);
    return null;
  }
}

/**
 * Extract summary from messages
 * Uses heuristics since we don't call AI for this
 */
function extractConversationSummary(messages) {
  const userMessages = messages.filter(m => m.role === 'user');
  const assistantMessages = messages.filter(m => m.role === 'assistant');

  // Extract topics from user messages
  const topics = extractTopics(userMessages.map(m => m.content));

  // Extract entities
  const entities = extractEntities(userMessages.map(m => m.content));

  // Generate summary text
  const summaryParts = [];

  if (topics.length > 0) {
    summaryParts.push(`Discussed: ${topics.slice(0, 5).join(', ')}`);
  }

  if (entities.goals.length > 0) {
    summaryParts.push(`Goals mentioned: ${entities.goals.slice(0, 3).join(', ')}`);
  }

  if (entities.concerns.length > 0) {
    summaryParts.push(`Concerns: ${entities.concerns.slice(0, 2).join(', ')}`);
  }

  // Add first and last exchange context
  if (userMessages.length > 0) {
    const firstQuestion = userMessages[0].content.slice(0, 100);
    summaryParts.push(`Started with: "${firstQuestion}..."`);
  }

  return {
    text: summaryParts.join('. '),
    topics,
    entities,
    messageCount: messages.length,
    duration: calculateDuration(messages)
  };
}

/**
 * Extract topics from text
 */
function extractTopics(texts) {
  const topicKeywords = {
    'productivity': ['task', 'work', 'project', 'deadline', 'focus', 'productivity'],
    'health': ['workout', 'exercise', 'sleep', 'nutrition', 'health', 'fitness', 'meal'],
    'finance': ['budget', 'money', 'expense', 'income', 'savings', 'spending'],
    'learning': ['learn', 'study', 'book', 'course', 'skill', 'knowledge'],
    'journal': ['feel', 'journal', 'reflect', 'mood', 'thought'],
    'goals': ['goal', 'target', 'achieve', 'progress', 'milestone'],
    'habits': ['habit', 'streak', 'routine', 'daily', 'consistent'],
    'planning': ['plan', 'schedule', 'calendar', 'tomorrow', 'week']
  };

  const combinedText = texts.join(' ').toLowerCase();
  const foundTopics = [];

  for (const [topic, keywords] of Object.entries(topicKeywords)) {
    if (keywords.some(kw => combinedText.includes(kw))) {
      foundTopics.push(topic);
    }
  }

  return foundTopics;
}

/**
 * Extract entities from text
 */
function extractEntities(texts) {
  const entities = {
    goals: [],
    preferences: [],
    concerns: [],
    achievements: [],
    plans: [],
    questions: []
  };

  const combinedText = texts.join(' ');

  // Goal patterns
  const goalPatterns = [
    /i want to ([^.!?]+)/gi,
    /my goal is ([^.!?]+)/gi,
    /i'm trying to ([^.!?]+)/gi,
    /i need to ([^.!?]+)/gi
  ];

  goalPatterns.forEach(pattern => {
    const matches = combinedText.matchAll(pattern);
    for (const match of matches) {
      if (match[1] && match[1].length < 100) {
        entities.goals.push(match[1].trim());
      }
    }
  });

  // Concern patterns
  const concernPatterns = [
    /i'm worried about ([^.!?]+)/gi,
    /i'm struggling with ([^.!?]+)/gi,
    /i can't seem to ([^.!?]+)/gi,
    /having trouble ([^.!?]+)/gi
  ];

  concernPatterns.forEach(pattern => {
    const matches = combinedText.matchAll(pattern);
    for (const match of matches) {
      if (match[1] && match[1].length < 100) {
        entities.concerns.push(match[1].trim());
      }
    }
  });

  // Achievement patterns
  const achievementPatterns = [
    /i (completed|finished|achieved|did) ([^.!?]+)/gi,
    /i've been ([^.!?]+)/gi
  ];

  achievementPatterns.forEach(pattern => {
    const matches = combinedText.matchAll(pattern);
    for (const match of matches) {
      const text = match[2] || match[1];
      if (text && text.length < 100) {
        entities.achievements.push(text.trim());
      }
    }
  });

  // Questions (for follow-up)
  const questionCount = (combinedText.match(/\?/g) || []).length;
  if (questionCount > 0) {
    entities.questions.push(`${questionCount} questions asked`);
  }

  return entities;
}

/**
 * Calculate conversation duration
 */
function calculateDuration(messages) {
  if (messages.length < 2) return 0;
  const first = new Date(messages[0].created_at);
  const last = new Date(messages[messages.length - 1].created_at);
  return Math.round((last - first) / 1000 / 60); // Minutes
}

/**
 * Get conversation context for new session
 * Loads summary OR recent messages from previous conversations
 */
export async function getPreviousContext() {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  try {
    // Get most recent conversations (not just those with summaries)
    const { data: conversations, error } = await supabase
      .from('nova_conversations')
      .select('id, summary, metadata, last_message_at')
      .eq('user_id', userId)
      .order('last_message_at', { ascending: false })
      .limit(3);

    if (error || !conversations || conversations.length === 0) return null;

    // Check if recent enough to be relevant (within 7 days)
    const mostRecent = conversations[0];
    const lastMessage = new Date(mostRecent.last_message_at);
    const daysSince = (Date.now() - lastMessage.getTime()) / (1000 * 60 * 60 * 24);

    if (daysSince > 7) return null;

    // If we have a summary, use it
    if (mostRecent.summary) {
      return {
        summary: mostRecent.summary,
        topics: mostRecent.metadata?.topics || [],
        entities: mostRecent.metadata?.entities || {},
        daysSince: Math.round(daysSince)
      };
    }

    // No summary - load recent messages from previous conversations to build context
    const conversationIds = conversations.map(c => c.id);
    const { data: recentMessages, error: msgError } = await supabase
      .from('nova_messages')
      .select('role, content, created_at')
      .in('conversation_id', conversationIds)
      .order('created_at', { ascending: false })
      .limit(20);

    if (msgError || !recentMessages || recentMessages.length === 0) return null;

    // Get the last few exchanges in chronological order
    const lastExchanges = recentMessages.slice(0, 10).reverse();

    // Build conversation history string
    const historyLines = lastExchanges.map(m => {
      const role = m.role === 'user' ? 'User' : 'Nova';
      return `${role}: ${m.content.slice(0, 150)}${m.content.length > 150 ? '...' : ''}`;
    });

    // Extract topics from user messages
    const userMessages = recentMessages
      .filter(m => m.role === 'user')
      .slice(0, 5)
      .map(m => m.content.slice(0, 100));

    const topics = extractTopics(userMessages);
    const entities = extractEntities(userMessages);

    return {
      summary: `Recent conversation:\n${historyLines.join('\n')}`,
      topics,
      entities,
      daysSince: Math.round(daysSince),
      fromMessages: true
    };
  } catch (error) {
    console.error('Failed to get previous context:', error);
    return null;
  }
}

/**
 * Check if conversation needs summarization
 */
export async function shouldSummarize(conversationId) {
  const userId = await getCurrentUserId();
  if (!userId) return false;

  try {
    const { count, error } = await supabase
      .from('nova_messages')
      .select('*', { count: 'exact', head: true })
      .eq('conversation_id', conversationId)
      .eq('user_id', userId);

    if (error) return false;

    // Check if already summarized
    const { data: conversation } = await supabase
      .from('nova_conversations')
      .select('summary, metadata')
      .eq('id', conversationId)
      .single();

    const lastSummarizedAt = conversation?.metadata?.summarizedAt;
    const summarizedCount = conversation?.metadata?.messageCount || 0;

    // Summarize if we have enough new messages since last summary
    return count >= LIMITS.SUMMARIZE_AFTER_MESSAGES &&
           count - summarizedCount >= LIMITS.SUMMARIZE_AFTER_MESSAGES;
  } catch (error) {
    return false;
  }
}

/**
 * Build conversation context string for Nova
 */
export async function buildConversationContext(conversationId, currentQuery) {
  const [history, previousContext] = await Promise.all([
    conversationId ? getOptimizedHistory(conversationId, currentQuery) : Promise.resolve([]),
    getPreviousContext()
  ]);

  let context = '';

  // Add previous session context if relevant (within 7 days)
  if (previousContext) {
    const label = previousContext.fromMessages ? 'PREVIOUS MESSAGES' : 'PREVIOUS SESSION';
    const timeAgo = previousContext.daysSince === 0 ? 'earlier today' : `${previousContext.daysSince} day(s) ago`;
    context += `\n${label} (${timeAgo}):\n`;
    context += previousContext.summary + '\n';

    if (previousContext.topics?.length > 0) {
      context += `Topics: ${previousContext.topics.join(', ')}\n`;
    }
  }

  // Add current conversation history
  if (history.length > 0) {
    context += '\nCURRENT CONVERSATION:\n';
    history.forEach(msg => {
      const role = msg.role === 'user' ? 'User' : 'Nova';
      const content = msg.truncated ? msg.content + '...' : msg.content;
      context += `${role}: ${content}\n`;
    });
  }

  return context;
}

/**
 * Clean up old conversations
 */
export async function cleanupOldConversations(maxAge = 90) {
  const userId = await getCurrentUserId();
  if (!userId) return 0;

  try {
    const cutoff = new Date(Date.now() - maxAge * 24 * 60 * 60 * 1000).toISOString();

    // Delete old messages first (due to foreign key)
    const { data: oldConversations } = await supabase
      .from('nova_conversations')
      .select('id')
      .eq('user_id', userId)
      .lt('last_message_at', cutoff);

    if (!oldConversations || oldConversations.length === 0) return 0;

    const conversationIds = oldConversations.map(c => c.id);

    // Delete messages
    await supabase
      .from('nova_messages')
      .delete()
      .in('conversation_id', conversationIds);

    // Delete conversations
    const { error } = await supabase
      .from('nova_conversations')
      .delete()
      .in('id', conversationIds);

    return error ? 0 : conversationIds.length;
  } catch (error) {
    console.error('Failed to cleanup conversations:', error);
    return 0;
  }
}

export const conversationManager = {
  LIMITS,
  ENTITY_TYPES,
  getOptimizedHistory,
  summarizeConversation,
  getPreviousContext,
  shouldSummarize,
  buildConversationContext,
  cleanupOldConversations
};

export default conversationManager;
