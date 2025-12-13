/**
 * Nova Memory Manager
 *
 * Manages long-term memory with:
 * - Importance scoring (1-5 scale)
 * - Time-based decay
 * - Reinforcement on access
 * - Memory consolidation
 * - Forgetting curves
 */

import { supabase, getCurrentUserId } from '../../../lib/supabase';
import { statisticsService } from './statisticsService';

// Memory decay constants
const DECAY_CONFIG = {
  HALF_LIFE_DAYS: 30, // Memory importance halves every 30 days
  MIN_IMPORTANCE: 0.1, // Memories below this get cleaned up
  REINFORCEMENT_BOOST: 0.5, // Boost when memory is accessed
  MAX_IMPORTANCE: 5,
  CONSOLIDATION_THRESHOLD: 3 // Similar memories consolidated after this count
};

// Memory type weights
const TYPE_WEIGHTS = {
  user_fact: 1.2, // Facts about user are important
  user_routine: 1.3, // Routines are very important
  user_preference: 1.1,
  pattern_insight: 1.0,
  correlation: 0.9,
  conversation: 0.7, // Conversations decay faster
  user_memory: 0.8
};

/**
 * Calculate decayed importance based on age
 */
export function calculateDecayedImportance(originalImportance, createdAt) {
  const now = Date.now();
  const created = new Date(createdAt).getTime();
  const ageInDays = (now - created) / (1000 * 60 * 60 * 24);

  // Exponential decay: importance * 0.5^(age/halfLife)
  const decayFactor = Math.pow(0.5, ageInDays / DECAY_CONFIG.HALF_LIFE_DAYS);
  return originalImportance * decayFactor;
}

/**
 * Reinforce a memory when it's accessed
 */
export async function reinforceMemory(memoryId) {
  const userId = await getCurrentUserId();
  if (!userId) return false;

  try {
    // Get current memory
    const { data: memory, error: fetchError } = await supabase
      .from('nova_memory_embeddings')
      .select('importance, metadata')
      .eq('id', memoryId)
      .eq('user_id', userId)
      .single();

    if (fetchError || !memory) return false;

    // Calculate new importance with reinforcement
    const currentImportance = memory.importance || 1;
    const accessCount = (memory.metadata?.accessCount || 0) + 1;
    const newImportance = Math.min(
      DECAY_CONFIG.MAX_IMPORTANCE,
      currentImportance + DECAY_CONFIG.REINFORCEMENT_BOOST * (1 / Math.sqrt(accessCount))
    );

    // Update memory (round to integer since DB column is integer)
    const { error: updateError } = await supabase
      .from('nova_memory_embeddings')
      .update({
        importance: Math.round(newImportance),
        metadata: {
          ...memory.metadata,
          accessCount,
          lastAccessed: new Date().toISOString()
        }
      })
      .eq('id', memoryId);

    return !updateError;
  } catch (error) {
    console.error('Failed to reinforce memory:', error);
    return false;
  }
}

/**
 * Apply decay to all memories (run periodically)
 */
export async function applyMemoryDecay() {
  const userId = await getCurrentUserId();
  if (!userId) return { updated: 0, deleted: 0 };

  try {
    // Get all memories
    const { data: memories, error } = await supabase
      .from('nova_memory_embeddings')
      .select('id, importance, content_type, created_at, metadata')
      .eq('user_id', userId);

    if (error || !memories) return { updated: 0, deleted: 0 };

    let updated = 0;
    let deleted = 0;

    for (const memory of memories) {
      const typeWeight = TYPE_WEIGHTS[memory.content_type] || 1;
      const decayedImportance = calculateDecayedImportance(
        memory.importance * typeWeight,
        memory.created_at
      );

      if (decayedImportance < DECAY_CONFIG.MIN_IMPORTANCE) {
        // Delete very old/unimportant memories
        await supabase
          .from('nova_memory_embeddings')
          .delete()
          .eq('id', memory.id);
        deleted++;
      } else if (Math.abs(decayedImportance - memory.importance) > 0.5) {
        // Update importance if significantly changed (round to integer for DB)
        await supabase
          .from('nova_memory_embeddings')
          .update({
            importance: Math.round(decayedImportance),
            metadata: {
              ...memory.metadata,
              lastDecayApplied: new Date().toISOString()
            }
          })
          .eq('id', memory.id);
        updated++;
      }
    }

    return { updated, deleted };
  } catch (error) {
    console.error('Failed to apply memory decay:', error);
    return { updated: 0, deleted: 0 };
  }
}

/**
 * Score new memory importance based on content analysis
 */
export function scoreMemoryImportance(content, contentType, metadata = {}) {
  let score = 2; // Base score

  // Type-based scoring
  const typeWeight = TYPE_WEIGHTS[contentType] || 1;
  score *= typeWeight;

  // Content-based scoring
  const contentLower = content.toLowerCase();

  // Important keywords boost
  const importantKeywords = ['always', 'never', 'prefer', 'hate', 'love', 'goal', 'dream', 'important'];
  const keywordMatches = importantKeywords.filter(k => contentLower.includes(k)).length;
  score += keywordMatches * 0.3;

  // Milestone/achievement boost
  if (contentLower.includes('milestone') || contentLower.includes('achievement') || contentLower.includes('completed')) {
    score += 0.5;
  }

  // Pattern/insight boost
  if (contentLower.includes('pattern') || contentLower.includes('correlation') || contentLower.includes('tend to')) {
    score += 0.4;
  }

  // Confidence boost from metadata
  if (metadata.confidence) {
    score += metadata.confidence * 0.5;
  }

  // Statistical significance boost
  if (metadata.statistically_significant) {
    score += 0.5;
  }

  return Math.min(DECAY_CONFIG.MAX_IMPORTANCE, Math.max(1, Math.round(score * 100) / 100));
}

/**
 * Find similar memories for potential consolidation
 */
export async function findSimilarMemories(content, threshold = 0.85) {
  const userId = await getCurrentUserId();
  if (!userId) return [];

  try {
    const { data, error } = await supabase.functions.invoke('nova-embeddings', {
      body: {
        action: 'search',
        text: content,
        userId,
        limit: 5
      }
    });

    if (error) return [];

    return (data?.results || []).filter(r => r.similarity >= threshold);
  } catch (error) {
    console.error('Failed to find similar memories:', error);
    return [];
  }
}

/**
 * Consolidate similar memories into a stronger single memory
 */
export async function consolidateMemories(memoryIds) {
  const userId = await getCurrentUserId();
  if (!userId || memoryIds.length < 2) return null;

  try {
    // Get all memories to consolidate
    const { data: memories, error } = await supabase
      .from('nova_memory_embeddings')
      .select('*')
      .eq('user_id', userId)
      .in('id', memoryIds);

    if (error || !memories || memories.length < 2) return null;

    // Find highest importance memory as base
    const base = memories.reduce((best, m) =>
      m.importance > best.importance ? m : best
    );

    // Calculate combined importance (capped at max)
    const combinedImportance = Math.min(
      DECAY_CONFIG.MAX_IMPORTANCE,
      memories.reduce((sum, m) => sum + m.importance * 0.3, base.importance)
    );

    // Update base memory (round to integer for DB)
    const { error: updateError } = await supabase
      .from('nova_memory_embeddings')
      .update({
        importance: Math.round(combinedImportance),
        metadata: {
          ...base.metadata,
          consolidatedFrom: memoryIds,
          consolidatedAt: new Date().toISOString(),
          originalCount: memories.length
        }
      })
      .eq('id', base.id);

    if (updateError) return null;

    // Delete other memories
    const idsToDelete = memoryIds.filter(id => id !== base.id);
    await supabase
      .from('nova_memory_embeddings')
      .delete()
      .in('id', idsToDelete);

    return base.id;
  } catch (error) {
    console.error('Failed to consolidate memories:', error);
    return null;
  }
}

/**
 * Get memory statistics
 */
export async function getMemoryStats() {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  try {
    const { data: memories, error } = await supabase
      .from('nova_memory_embeddings')
      .select('content_type, importance, created_at')
      .eq('user_id', userId);

    if (error || !memories) return null;

    // Group by type
    const byType = {};
    memories.forEach(m => {
      if (!byType[m.content_type]) {
        byType[m.content_type] = { count: 0, avgImportance: 0, importances: [] };
      }
      byType[m.content_type].count++;
      byType[m.content_type].importances.push(m.importance);
    });

    // Calculate averages
    Object.keys(byType).forEach(type => {
      byType[type].avgImportance = statisticsService.mean(byType[type].importances);
      delete byType[type].importances;
    });

    // Age distribution
    const ages = memories.map(m => {
      const age = (Date.now() - new Date(m.created_at).getTime()) / (1000 * 60 * 60 * 24);
      return Math.floor(age);
    });

    return {
      total: memories.length,
      byType,
      ageStats: {
        oldest: Math.max(...ages),
        newest: Math.min(...ages),
        median: statisticsService.median(ages)
      },
      importanceStats: {
        mean: statisticsService.mean(memories.map(m => m.importance)),
        median: statisticsService.median(memories.map(m => m.importance))
      }
    };
  } catch (error) {
    console.error('Failed to get memory stats:', error);
    return null;
  }
}

/**
 * Clean up old, low-importance memories
 */
export async function cleanupMemories(maxMemories = 1000) {
  const userId = await getCurrentUserId();
  if (!userId) return 0;

  try {
    const { count } = await supabase
      .from('nova_memory_embeddings')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (count <= maxMemories) return 0;

    // Get memories sorted by effective importance (importance * recency)
    const { data: memories, error } = await supabase
      .from('nova_memory_embeddings')
      .select('id, importance, created_at')
      .eq('user_id', userId)
      .order('importance', { ascending: true })
      .limit(count - maxMemories + 100); // Delete extras plus buffer

    if (error || !memories) return 0;

    // Calculate effective importance and find lowest
    const withEffective = memories.map(m => ({
      id: m.id,
      effective: calculateDecayedImportance(m.importance, m.created_at)
    })).sort((a, b) => a.effective - b.effective);

    const toDelete = withEffective.slice(0, count - maxMemories).map(m => m.id);

    const { error: deleteError } = await supabase
      .from('nova_memory_embeddings')
      .delete()
      .in('id', toDelete);

    return deleteError ? 0 : toDelete.length;
  } catch (error) {
    console.error('Failed to cleanup memories:', error);
    return 0;
  }
}

export const memoryManager = {
  DECAY_CONFIG,
  TYPE_WEIGHTS,
  calculateDecayedImportance,
  reinforceMemory,
  applyMemoryDecay,
  scoreMemoryImportance,
  findSimilarMemories,
  consolidateMemories,
  getMemoryStats,
  cleanupMemories
};

export default memoryManager;
