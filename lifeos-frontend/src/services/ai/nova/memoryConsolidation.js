/**
 * Nova Memory Consolidation Service
 *
 * Manages memory efficiency by:
 * 1. Consolidating similar/redundant memories
 * 2. Promoting important memories
 * 3. Decaying old, unused memories
 * 4. Batching memory extraction
 */

import { supabase, getCurrentUserId } from '../../../lib/supabase';

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  // Consolidation thresholds
  similarityThreshold: 0.85, // Memories must be 85%+ similar to consolidate
  minMemoriesForConsolidation: 3, // Need at least 3 similar memories

  // Decay settings
  decayThreshold: 0.2, // Memories below this strength get marked for decay
  accessBoost: 0.1, // How much to boost strength when accessed
  idleDecayRate: 0.02, // Strength decay per week of no access

  // Extraction batching
  minMessagesForExtraction: 10, // Batch this many messages before extracting
  extractionCooldownMs: 5 * 60 * 1000, // Wait 5 min between extractions

  // Profile memory protection
  profileMemoryMinStrength: 0.5, // Profile memories never decay below this
};

// ============================================================================
// CONSOLIDATION
// ============================================================================

/**
 * Find and consolidate similar memories
 * This reduces storage and improves retrieval quality
 */
export async function consolidateMemories() {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return { consolidated: 0, removed: 0 };

    // Get all active memories
    const { data: memories, error } = await supabase
      .from('nova_memories')
      .select('id, memory_type, content, structured_data, importance, access_count, created_at')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error || !memories) return { consolidated: 0, removed: 0 };

    // Group by memory type
    const byType = {};
    memories.forEach(m => {
      if (!byType[m.memory_type]) byType[m.memory_type] = [];
      byType[m.memory_type].push(m);
    });

    let consolidated = 0;
    let removed = 0;

    // Process each type
    for (const [type, typeMemories] of Object.entries(byType)) {
      const result = await consolidateMemoryGroup(userId, typeMemories, type);
      consolidated += result.consolidated;
      removed += result.removed;
    }

    console.log(`Memory consolidation: ${consolidated} consolidated, ${removed} removed`);
    return { consolidated, removed };
  } catch (e) {
    console.error('Consolidation error:', e);
    return { consolidated: 0, removed: 0 };
  }
}

/**
 * Consolidate a group of memories of the same type
 */
async function consolidateMemoryGroup(userId, memories, type) {
  if (memories.length < CONFIG.minMemoriesForConsolidation) {
    return { consolidated: 0, removed: 0 };
  }

  let consolidated = 0;
  let removed = 0;

  // Find clusters of similar memories
  const clusters = findSimilarClusters(memories);

  for (const cluster of clusters) {
    if (cluster.length < CONFIG.minMemoriesForConsolidation) continue;

    // Create consolidated memory
    const consolidatedContent = createConsolidatedContent(cluster);
    const highestImportance = Math.max(...cluster.map(m => m.importance || 0.5));
    const totalAccess = cluster.reduce((sum, m) => sum + (m.access_count || 0), 0);

    // Insert consolidated memory
    const { data: newMemory, error: insertError } = await supabase
      .from('nova_memories')
      .insert({
        user_id: userId,
        memory_type: type,
        content: consolidatedContent,
        importance: Math.min(1, highestImportance + 0.1), // Slight boost
        access_count: totalAccess,
        source_type: 'consolidation',
        metadata: {
          consolidated_from: cluster.map(m => m.id),
          consolidated_at: new Date().toISOString(),
        },
      })
      .select()
      .single();

    if (insertError) continue;

    // Deactivate old memories
    const oldIds = cluster.map(m => m.id);
    const { error: updateError } = await supabase
      .from('nova_memories')
      .update({
        is_active: false,
        superseded_by: newMemory.id,
      })
      .in('id', oldIds)
      .eq('user_id', userId);

    if (!updateError) {
      consolidated++;
      removed += oldIds.length;
    }
  }

  return { consolidated, removed };
}

/**
 * Find clusters of similar memories using simple text similarity
 */
function findSimilarClusters(memories) {
  const clusters = [];
  const used = new Set();

  for (let i = 0; i < memories.length; i++) {
    if (used.has(i)) continue;

    const cluster = [memories[i]];
    used.add(i);

    for (let j = i + 1; j < memories.length; j++) {
      if (used.has(j)) continue;

      const similarity = calculateSimilarity(memories[i].content, memories[j].content);
      if (similarity >= CONFIG.similarityThreshold) {
        cluster.push(memories[j]);
        used.add(j);
      }
    }

    if (cluster.length >= CONFIG.minMemoriesForConsolidation) {
      clusters.push(cluster);
    }
  }

  return clusters;
}

/**
 * Calculate text similarity using Jaccard index
 */
function calculateSimilarity(text1, text2) {
  if (!text1 || !text2) return 0;

  const words1 = new Set(text1.toLowerCase().split(/\s+/));
  const words2 = new Set(text2.toLowerCase().split(/\s+/));

  const intersection = [...words1].filter(w => words2.has(w)).length;
  const union = new Set([...words1, ...words2]).size;

  return union > 0 ? intersection / union : 0;
}

/**
 * Create consolidated content from a cluster
 */
function createConsolidatedContent(cluster) {
  // Sort by importance and recency
  const sorted = cluster.sort((a, b) => {
    const importanceDiff = (b.importance || 0.5) - (a.importance || 0.5);
    if (importanceDiff !== 0) return importanceDiff;
    return new Date(b.created_at) - new Date(a.created_at);
  });

  // Use the most important/recent as base
  let content = sorted[0].content;

  // Add any unique information from others
  for (let i = 1; i < sorted.length; i++) {
    const otherWords = new Set(sorted[i].content.toLowerCase().split(/\s+/));
    const baseWords = new Set(content.toLowerCase().split(/\s+/));

    // Find unique words
    const unique = [...otherWords].filter(w => !baseWords.has(w) && w.length > 3);

    // If there's significant unique info, append it
    if (unique.length > 3) {
      content += ` (also: ${unique.slice(0, 5).join(', ')})`;
    }
  }

  return content;
}

// ============================================================================
// MEMORY DECAY
// ============================================================================

/**
 * Apply decay to old, unused memories
 */
export async function applyMemoryDecay() {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return { decayed: 0, deactivated: 0 };

    // Get memories that haven't been accessed recently
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 14); // 2 weeks

    const { data: memories, error } = await supabase
      .from('nova_memories')
      .select('id, memory_type, importance, access_count, last_accessed_at')
      .eq('user_id', userId)
      .eq('is_active', true)
      .lt('last_accessed_at', cutoffDate.toISOString());

    if (error || !memories) return { decayed: 0, deactivated: 0 };

    let decayed = 0;
    let deactivated = 0;

    for (const memory of memories) {
      // Calculate weeks since last access
      const lastAccess = new Date(memory.last_accessed_at || memory.created_at);
      const weeksSinceAccess = (Date.now() - lastAccess.getTime()) / (7 * 24 * 60 * 60 * 1000);

      // Calculate new importance
      let newImportance = (memory.importance || 0.5) - (weeksSinceAccess * CONFIG.idleDecayRate);

      // Protect profile memories
      if (memory.memory_type === 'profile') {
        newImportance = Math.max(CONFIG.profileMemoryMinStrength, newImportance);
      }

      // Deactivate if below threshold
      if (newImportance < CONFIG.decayThreshold) {
        await supabase
          .from('nova_memories')
          .update({ is_active: false, decay_reason: 'low_importance' })
          .eq('id', memory.id)
          .eq('user_id', userId);
        deactivated++;
      } else if (newImportance < memory.importance) {
        await supabase
          .from('nova_memories')
          .update({ importance: newImportance })
          .eq('id', memory.id)
          .eq('user_id', userId);
        decayed++;
      }
    }

    console.log(`Memory decay: ${decayed} decayed, ${deactivated} deactivated`);
    return { decayed, deactivated };
  } catch (e) {
    console.error('Decay error:', e);
    return { decayed: 0, deactivated: 0 };
  }
}

// ============================================================================
// EXTRACTION BATCHING
// ============================================================================

let pendingMessages = [];
let lastExtractionTime = 0;

/**
 * Queue a message for batched extraction
 */
export function queueForExtraction(message) {
  pendingMessages.push({
    ...message,
    queuedAt: Date.now(),
  });

  // Check if we should trigger extraction
  if (shouldTriggerExtraction()) {
    triggerExtraction();
  }
}

/**
 * Check if extraction should be triggered
 */
function shouldTriggerExtraction() {
  // Not enough messages
  if (pendingMessages.length < CONFIG.minMessagesForExtraction) {
    return false;
  }

  // Cooldown not passed
  if (Date.now() - lastExtractionTime < CONFIG.extractionCooldownMs) {
    return false;
  }

  return true;
}

/**
 * Trigger memory extraction
 */
async function triggerExtraction() {
  if (pendingMessages.length === 0) return;

  const messagesToProcess = [...pendingMessages];
  pendingMessages = [];
  lastExtractionTime = Date.now();

  try {
    // Call extraction service
    const { extractMemoriesFromConversation } = await import('./memoryService');
    await extractMemoriesFromConversation(messagesToProcess);

    console.log(`Extracted memories from ${messagesToProcess.length} messages`);
  } catch (e) {
    console.error('Extraction error:', e);
    // Re-queue failed messages
    pendingMessages = [...messagesToProcess, ...pendingMessages];
  }
}

/**
 * Force extraction (e.g., on page unload)
 */
export async function forceExtraction() {
  if (pendingMessages.length >= 3) {
    await triggerExtraction();
  }
}

// ============================================================================
// MEMORY PROMOTION
// ============================================================================

/**
 * Promote a memory's importance based on access
 */
export async function promoteMemory(memoryId) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return;

    const { data: memory, error: fetchError } = await supabase
      .from('nova_memories')
      .select('importance, access_count')
      .eq('id', memoryId)
      .eq('user_id', userId)
      .single();

    if (fetchError || !memory) return;

    const newImportance = Math.min(1, (memory.importance || 0.5) + CONFIG.accessBoost);
    const newAccessCount = (memory.access_count || 0) + 1;

    await supabase
      .from('nova_memories')
      .update({
        importance: newImportance,
        access_count: newAccessCount,
        last_accessed_at: new Date().toISOString(),
      })
      .eq('id', memoryId)
      .eq('user_id', userId);
  } catch (e) {
    console.warn('Memory promotion error:', e);
  }
}

// ============================================================================
// MAINTENANCE SCHEDULER
// ============================================================================

/**
 * Run full memory maintenance
 */
export async function runMemoryMaintenance() {
  console.log('Starting memory maintenance...');

  try {
    // 1. Apply decay
    const decayResult = await applyMemoryDecay();

    // 2. Consolidate similar memories
    const consolidationResult = await consolidateMemories();

    // 3. Force pending extractions
    await forceExtraction();

    console.log('Memory maintenance complete:', {
      decay: decayResult,
      consolidation: consolidationResult,
    });

    return {
      success: true,
      ...decayResult,
      ...consolidationResult,
    };
  } catch (e) {
    console.error('Maintenance error:', e);
    return { success: false, error: e.message };
  }
}

/**
 * Schedule periodic maintenance (call on app init)
 */
let maintenanceInterval = null;

export function scheduleMemoryMaintenance() {
  // Run maintenance every 24 hours
  if (maintenanceInterval) clearInterval(maintenanceInterval);

  maintenanceInterval = setInterval(() => {
    runMemoryMaintenance();
  }, 24 * 60 * 60 * 1000);

  // Also run on startup after a delay
  setTimeout(() => {
    runMemoryMaintenance();
  }, 30 * 1000); // 30 seconds after startup
}

export function stopMemoryMaintenance() {
  if (maintenanceInterval) {
    clearInterval(maintenanceInterval);
    maintenanceInterval = null;
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export const memoryConsolidation = {
  // Core functions
  consolidateMemories,
  applyMemoryDecay,
  runMemoryMaintenance,

  // Extraction batching
  queueForExtraction,
  forceExtraction,

  // Promotion
  promoteMemory,

  // Scheduling
  scheduleMemoryMaintenance,
  stopMemoryMaintenance,
};

export default memoryConsolidation;
