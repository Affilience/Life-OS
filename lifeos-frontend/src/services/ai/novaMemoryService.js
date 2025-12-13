/**
 * Nova Memory Service
 * Implements three types of memory for long-term AI personalization:
 *
 * 1. EPISODIC MEMORY - Specific events and conversations
 *    "On January 15, user set a goal to read 52 books"
 *
 * 2. SEMANTIC MEMORY - General facts about the user
 *    "User prefers HIIT workouts" (learned from patterns)
 *
 * 3. PROCEDURAL MEMORY - Routines and workflows
 *    "User's morning routine: wake 6am, journal, workout, work"
 */

import { supabase, getCurrentUserId } from '../../lib/supabase';

/**
 * Memory Types
 */
export const MEMORY_TYPES = {
  EPISODIC: 'episodic',      // Specific events/conversations
  SEMANTIC: 'semantic',       // General facts about user
  PROCEDURAL: 'procedural'    // Routines and patterns
};

/**
 * Store an episodic memory (specific event)
 */
export async function storeEpisodicMemory(eventType, content, metadata = {}) {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  try {
    const { data, error } = await supabase
      .from('nova_insights')
      .insert({
        user_id: userId,
        insight_type: `episodic_${eventType}`,
        content: content,
        metadata: {
          ...metadata,
          memory_type: MEMORY_TYPES.EPISODIC,
          recorded_at: new Date().toISOString()
        },
        is_active: true
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Failed to store episodic memory:', error);
    return null;
  }
}

/**
 * Store a semantic memory (learned fact about user)
 */
export async function storeSemanticMemory(key, value, confidence = 0.5, source = 'observed') {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  try {
    // Check if this semantic memory already exists
    const { data: existing } = await supabase
      .from('nova_insights')
      .select('*')
      .eq('user_id', userId)
      .eq('insight_type', `semantic_${key}`)
      .single();

    if (existing) {
      // Update existing memory, potentially increasing confidence
      const newConfidence = Math.min(1, existing.metadata?.confidence + 0.1 || confidence);
      const { data, error } = await supabase
        .from('nova_insights')
        .update({
          content: value,
          metadata: {
            ...existing.metadata,
            confidence: newConfidence,
            last_updated: new Date().toISOString(),
            update_count: (existing.metadata?.update_count || 0) + 1
          }
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    }

    // Create new semantic memory
    const { data, error } = await supabase
      .from('nova_insights')
      .insert({
        user_id: userId,
        insight_type: `semantic_${key}`,
        content: value,
        metadata: {
          memory_type: MEMORY_TYPES.SEMANTIC,
          confidence: confidence,
          source: source,
          created_at: new Date().toISOString()
        },
        is_active: true
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Failed to store semantic memory:', error);
    return null;
  }
}

/**
 * Store a procedural memory (routine/workflow)
 */
export async function storeProceduralMemory(routineName, steps, consistency = 0.5) {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  try {
    const { data, error } = await supabase
      .from('nova_insights')
      .upsert({
        user_id: userId,
        insight_type: `procedural_${routineName}`,
        content: JSON.stringify(steps),
        metadata: {
          memory_type: MEMORY_TYPES.PROCEDURAL,
          routine_name: routineName,
          consistency: consistency,
          step_count: steps.length,
          last_updated: new Date().toISOString()
        },
        is_active: true
      }, {
        onConflict: 'user_id,insight_type'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Failed to store procedural memory:', error);
    return null;
  }
}

/**
 * Retrieve memories by type
 */
export async function getMemoriesByType(memoryType, limit = 20) {
  const userId = await getCurrentUserId();
  if (!userId) return [];

  try {
    const { data, error } = await supabase
      .from('nova_insights')
      .select('*')
      .eq('user_id', userId)
      .like('insight_type', `${memoryType}_%`)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return data.map(item => ({
      id: item.id,
      type: memoryType,
      key: item.insight_type.replace(`${memoryType}_`, ''),
      content: item.content,
      metadata: item.metadata,
      createdAt: item.created_at
    }));
  } catch (error) {
    console.error(`Failed to get ${memoryType} memories:`, error);
    return [];
  }
}

/**
 * Get all semantic facts about the user (preferences, learned behaviors)
 */
export async function getUserFacts() {
  const memories = await getMemoriesByType(MEMORY_TYPES.SEMANTIC, 50);

  return memories.reduce((facts, mem) => {
    facts[mem.key] = {
      value: mem.content,
      confidence: mem.metadata?.confidence || 0.5,
      source: mem.metadata?.source || 'unknown'
    };
    return facts;
  }, {});
}

/**
 * Get user's known routines
 */
export async function getUserRoutines() {
  const memories = await getMemoriesByType(MEMORY_TYPES.PROCEDURAL, 20);

  return memories.map(mem => ({
    name: mem.metadata?.routine_name || mem.key,
    steps: JSON.parse(mem.content || '[]'),
    consistency: mem.metadata?.consistency || 0
  }));
}

/**
 * Get recent significant events
 */
export async function getRecentEpisodicMemories(limit = 10) {
  return getMemoriesByType(MEMORY_TYPES.EPISODIC, limit);
}

/**
 * Build a comprehensive memory context for Nova
 */
export async function buildMemoryContext() {
  const [facts, routines, recentEvents] = await Promise.all([
    getUserFacts(),
    getUserRoutines(),
    getRecentEpisodicMemories(5)
  ]);

  let context = '';

  // Add semantic facts
  const factEntries = Object.entries(facts);
  if (factEntries.length > 0) {
    context += '\nLEARNED USER PREFERENCES:\n';
    factEntries.forEach(([key, data]) => {
      if (data.confidence >= 0.5) {
        context += `- ${key}: ${data.value} (${Math.round(data.confidence * 100)}% confident)\n`;
      }
    });
  }

  // Add routines
  if (routines.length > 0) {
    context += '\nKNOWN ROUTINES:\n';
    routines.forEach(routine => {
      if (routine.consistency >= 0.5) {
        context += `- ${routine.name}: ${routine.steps.map(s => s.action || s).join(' → ')}\n`;
      }
    });
  }

  // Add recent significant events
  if (recentEvents.length > 0) {
    context += '\nRECENT SIGNIFICANT EVENTS:\n';
    recentEvents.forEach(event => {
      const date = new Date(event.createdAt).toLocaleDateString();
      context += `- ${date}: ${event.content}\n`;
    });
  }

  return context;
}

/**
 * Analyze user activity and extract learnable patterns
 * Call this periodically to update semantic and procedural memories
 */
export async function learnFromActivity() {
  const userId = await getCurrentUserId();
  if (!userId) return;

  try {
    // Get recent events
    const { data: events } = await supabase
      .from('nova_user_events')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(200);

    if (!events || events.length < 10) return;

    // Analyze workout patterns
    const workoutEvents = events.filter(e => e.event_type === 'log_workout');
    if (workoutEvents.length >= 3) {
      const workoutHours = workoutEvents.map(e => new Date(e.created_at).getHours());
      const avgHour = Math.round(workoutHours.reduce((a, b) => a + b, 0) / workoutHours.length);
      await storeSemanticMemory(
        'preferred_workout_time',
        `${avgHour}:00`,
        workoutEvents.length / 10,
        'activity_analysis'
      );
    }

    // Analyze productivity patterns
    const taskEvents = events.filter(e => e.event_type === 'complete_task');
    if (taskEvents.length >= 5) {
      const taskHours = taskEvents.map(e => new Date(e.created_at).getHours());
      const hourCounts = {};
      taskHours.forEach(h => { hourCounts[h] = (hourCounts[h] || 0) + 1; });
      const peakHour = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
      if (peakHour) {
        await storeSemanticMemory(
          'peak_productivity_hour',
          `${peakHour}:00`,
          taskEvents.length / 20,
          'activity_analysis'
        );
      }
    }

    // Detect morning routine
    const morningEvents = events.filter(e => {
      const hour = new Date(e.created_at).getHours();
      return hour >= 5 && hour <= 10;
    });

    if (morningEvents.length >= 10) {
      const morningActions = morningEvents.reduce((acc, e) => {
        const hour = new Date(e.created_at).getHours();
        const key = `${hour}:00`;
        if (!acc[key]) acc[key] = [];
        acc[key].push(e.event_type);
        return acc;
      }, {});

      const routineSteps = Object.entries(morningActions)
        .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
        .map(([time, actions]) => {
          const mostCommon = actions.sort((a, b) =>
            actions.filter(x => x === b).length - actions.filter(x => x === a).length
          )[0];
          return { time, action: mostCommon };
        });

      if (routineSteps.length >= 2) {
        await storeProceduralMemory('morning_routine', routineSteps, morningEvents.length / 30);
      }
    }

    console.log('Memory learning completed');
  } catch (error) {
    console.error('Failed to learn from activity:', error);
  }
}

/**
 * Record a significant event for episodic memory
 */
export async function recordSignificantEvent(eventType, description) {
  return storeEpisodicMemory(eventType, description, {
    auto_recorded: true
  });
}

/**
 * Export memory service
 */
export const novaMemoryService = {
  MEMORY_TYPES,
  storeEpisodicMemory,
  storeSemanticMemory,
  storeProceduralMemory,
  getMemoriesByType,
  getUserFacts,
  getUserRoutines,
  getRecentEpisodicMemories,
  buildMemoryContext,
  learnFromActivity,
  recordSignificantEvent
};

export default novaMemoryService;
