/**
 * Nova RAG (Retrieval Augmented Generation) Service
 *
 * Implements intelligent context retrieval:
 * 1. Embed user query
 * 2. Search relevant system knowledge
 * 3. Search relevant user memories
 * 4. Search relevant conversation history
 * 5. Score and prioritize results
 * 6. Build optimized context within token budget
 */

import { semanticSearch, storeWithEmbedding } from './embeddingService';
import { tokenManager, PRIORITY_WEIGHTS } from './tokenManager';
import { supabase, getCurrentUserId } from '../../../lib/supabase';

// Content type definitions for semantic search
const CONTENT_TYPES = {
  SYSTEM_KNOWLEDGE: 'system_knowledge',
  USER_MEMORY: 'user_memory',
  USER_FACT: 'user_fact',
  USER_ROUTINE: 'user_routine',
  CONVERSATION: 'conversation',
  PATTERN_INSIGHT: 'pattern_insight',
  CORRELATION: 'correlation',
  USER_PREFERENCE: 'user_preference'
};

/**
 * Initialize system knowledge embeddings
 * Call once on app startup or when knowledge base updates
 */
export async function initializeSystemKnowledge(knowledgeDocuments) {
  const userId = await getCurrentUserId();
  if (!userId) return { success: false, error: 'No user' };

  console.log('Initializing system knowledge embeddings...');
  let stored = 0;
  let errors = 0;

  for (const doc of knowledgeDocuments) {
    try {
      // Create a searchable chunk for each document
      const content = formatKnowledgeForEmbedding(doc);

      const id = await storeWithEmbedding(
        content,
        CONTENT_TYPES.SYSTEM_KNOWLEDGE,
        {
          docType: doc.type || 'general',
          module: doc.module || null,
          route: doc.route || null,
          keywords: doc.keywords || []
        },
        5 // High importance for system knowledge
      );

      if (id) stored++;
      else errors++;
    } catch (e) {
      console.error('Failed to store knowledge:', doc.title, e);
      errors++;
    }
  }

  console.log(`System knowledge initialized: ${stored} stored, ${errors} errors`);
  return { success: true, stored, errors };
}

/**
 * Format knowledge document for embedding
 */
function formatKnowledgeForEmbedding(doc) {
  const parts = [];

  if (doc.title) parts.push(`Title: ${doc.title}`);
  if (doc.module) parts.push(`Module: ${doc.module}`);
  if (doc.route) parts.push(`Route: ${doc.route}`);
  if (doc.navigation) parts.push(`Navigation: ${doc.navigation}`);
  if (doc.purpose) parts.push(`Purpose: ${doc.purpose}`);
  if (doc.description) parts.push(`Description: ${doc.description}`);
  if (doc.features) parts.push(`Features: ${doc.features.join(', ')}`);
  if (doc.commonActions) parts.push(`Common actions: ${doc.commonActions.join(', ')}`);

  return parts.join('\n');
}

/**
 * Retrieve relevant context for a query
 * Main RAG entry point
 * OPTIMIZED: Single search call with all content types for speed
 */
export async function retrieveContext(query, options = {}) {
  const {
    includeSystemKnowledge = true,
    includeMemories = true,
    includePatterns = true,
    maxResults = 10,
    minRelevance = 0.6
  } = options;

  // Build list of content types to search
  const contentTypes = [];
  if (includeSystemKnowledge) {
    contentTypes.push(CONTENT_TYPES.SYSTEM_KNOWLEDGE);
  }
  if (includeMemories) {
    contentTypes.push(
      CONTENT_TYPES.USER_MEMORY,
      CONTENT_TYPES.USER_FACT,
      CONTENT_TYPES.USER_ROUTINE,
      CONTENT_TYPES.USER_PREFERENCE
    );
  }
  if (includePatterns) {
    contentTypes.push(
      CONTENT_TYPES.PATTERN_INSIGHT,
      CONTENT_TYPES.CORRELATION
    );
  }

  // Single search call with all content types (much faster!)
  const allResults = await semanticSearch(query, {
    limit: maxResults + 5, // Get a few extra to allow for filtering
    threshold: minRelevance,
    contentTypes: contentTypes.length > 0 ? contentTypes : null
  });

  // Map results to context items with appropriate priorities
  const retrievedContext = allResults.map(r => {
    let type = 'unknown';
    let priority = PRIORITY_WEIGHTS.LOW * r.similarity;

    if (r.contentType === CONTENT_TYPES.SYSTEM_KNOWLEDGE) {
      type = 'system_knowledge';
      priority = PRIORITY_WEIGHTS.HIGH * r.similarity;
    } else if ([CONTENT_TYPES.USER_MEMORY, CONTENT_TYPES.USER_FACT,
                CONTENT_TYPES.USER_ROUTINE, CONTENT_TYPES.USER_PREFERENCE].includes(r.contentType)) {
      type = 'user_memory';
      priority = PRIORITY_WEIGHTS.MEDIUM * r.similarity * (r.importance / 5);
    } else if ([CONTENT_TYPES.PATTERN_INSIGHT, CONTENT_TYPES.CORRELATION].includes(r.contentType)) {
      type = 'pattern';
      priority = PRIORITY_WEIGHTS.MEDIUM * r.similarity;
    }

    return {
      type,
      content: r.content,
      priority,
      source: 'semantic_search',
      metadata: r.metadata
    };
  });

  // Sort by priority and limit
  retrievedContext.sort((a, b) => b.priority - a.priority);
  return retrievedContext.slice(0, maxResults);
}

/**
 * Build complete context for Nova
 * Combines retrieved context with current user state
 */
export async function buildRAGContext(query, currentUserContext, options = {}) {
  const {
    maxTokens = tokenManager.CONTEXT_BUDGET.TOTAL_MAX,
    includeDebug = false
  } = options;

  // Retrieve semantically relevant content
  const retrievedContent = await retrieveContext(query, options);

  // Combine with current user context
  const contextSources = [
    // Current user state (always high priority)
    {
      type: 'current_context',
      content: formatCurrentContext(currentUserContext),
      priority: PRIORITY_WEIGHTS.HIGH
    },
    // Retrieved semantic content
    ...retrievedContent
  ];

  // Build optimized context within token budget
  const optimized = tokenManager.buildOptimizedContext(
    contextSources,
    query,
    { maxTokens, includeDebugInfo: includeDebug }
  );

  return {
    context: tokenManager.assembleContext(optimized),
    metadata: {
      retrievedCount: retrievedContent.length,
      includedCount: optimized.sections.length,
      totalTokens: optimized.totalTokens,
      truncated: optimized.truncated,
      excluded: optimized.excluded,
      debug: optimized.debugInfo
    }
  };
}

/**
 * Format current user context for inclusion
 * Uses the NEW comprehensive crossModuleData structure
 * NOTE: This is a QUICK summary - the full context is built by novaCore
 */
function formatCurrentContext(ctx) {
  if (!ctx) return '';

  const parts = [];

  // Quick summary of key data points (no expensive operations)
  // Full detailed context is provided by generateContextSummary in novaCore

  // Gamification
  if (ctx.gamification) {
    parts.push(`LEVEL: ${ctx.gamification.level || 1} (${ctx.gamification.stage || 'spark'})`);
    parts.push(`XP: ${ctx.gamification.totalXP?.toLocaleString() || 0}`);
    if (ctx.gamification.streaks?.active?.length > 0) {
      parts.push(`STREAKS: ${ctx.gamification.streaks.active.length} active`);
    }
  }

  // Today's tasks
  if (ctx.dailyTasks?.today) {
    const t = ctx.dailyTasks.today;
    parts.push(`TASKS TODAY: ${t.completed}/${t.total} (${t.completionRate}%)`);
  }

  // Nutrition
  if (ctx.health?.todayNutrition) {
    const n = ctx.health.todayNutrition;
    if (n.mealsLogged > 0) {
      parts.push(`NUTRITION: ${n.calories} cal, ${n.protein}g protein`);
    }
  }

  // Fitness - include PRs summary
  if (ctx.fitness) {
    parts.push(`WORKOUTS THIS WEEK: ${ctx.fitness.workoutsThisWeek || 0} strength, ${ctx.fitness.cardioThisWeek || 0} cardio`);
    const prCount = Object.keys(ctx.fitness.personalRecords || {}).length;
    if (prCount > 0) {
      parts.push(`PERSONAL RECORDS: ${prCount} exercises tracked`);
    }
  }

  // Financial
  if (ctx.financial?.totalBudget > 0) {
    const remaining = ctx.financial.totalBudget - ctx.financial.totalSpent;
    const status = remaining >= 0 ? 'remaining' : 'over';
    parts.push(`BUDGET: $${Math.abs(remaining).toFixed(0)} ${status}`);
  }

  // Learning
  if (ctx.knowledge?.booksInProgress?.length > 0) {
    parts.push(`READING: ${ctx.knowledge.booksInProgress.length} books in progress`);
  }

  // Skills
  if (ctx.skills?.totalSkills > 0) {
    parts.push(`SKILLS: ${ctx.skills.totalSkills} tracked, ${ctx.skills.totalPracticeHours}h total`);
  }

  return parts.join('\n');
}

/**
 * Store user interaction as memory
 * Call after significant user actions
 */
export async function recordInteraction(action, details, importance = 1) {
  const content = `User ${action}: ${details}`;

  return storeWithEmbedding(
    content,
    CONTENT_TYPES.USER_MEMORY,
    {
      action,
      recordedAt: new Date().toISOString()
    },
    importance
  );
}

/**
 * Store learned user fact
 */
export async function recordUserFact(factKey, factValue, confidence = 0.7) {
  const content = `User ${factKey}: ${factValue}`;

  return storeWithEmbedding(
    content,
    CONTENT_TYPES.USER_FACT,
    {
      factKey,
      confidence,
      learnedAt: new Date().toISOString()
    },
    Math.ceil(confidence * 5) // Importance based on confidence
  );
}

/**
 * Store pattern insight
 */
export async function recordPatternInsight(patternType, insight, dataPoints) {
  const content = `Pattern (${patternType}): ${insight}`;

  return storeWithEmbedding(
    content,
    CONTENT_TYPES.PATTERN_INSIGHT,
    {
      patternType,
      dataPoints,
      analyzedAt: new Date().toISOString()
    },
    3 // Medium-high importance for patterns
  );
}

/**
 * Check if system knowledge is initialized
 */
export async function isKnowledgeInitialized() {
  const userId = await getCurrentUserId();
  if (!userId) return false;

  try {
    const { count } = await supabase
      .from('nova_memory_embeddings')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('content_type', CONTENT_TYPES.SYSTEM_KNOWLEDGE);

    return count > 0;
  } catch {
    return false;
  }
}

export const ragService = {
  CONTENT_TYPES,
  initializeSystemKnowledge,
  retrieveContext,
  buildRAGContext,
  recordInteraction,
  recordUserFact,
  recordPatternInsight,
  isKnowledgeInitialized
};

export default ragService;
