/**
 * Nova AI Core
 *
 * Main orchestrator that combines all Nova services into a cohesive AI system.
 * This is the primary interface for the NovaWidget and other components.
 *
 * V2 ADDITIONS:
 * - Knowledge base for accurate system information
 * - Trend analysis for data-driven insights
 * - Personality learning for adaptive responses
 * - Memory consolidation for efficient storage
 * - Offline mode with graceful fallbacks
 * - Proactive intelligence with smart timing
 */

import { embeddingService } from './embeddingService';
import { tokenManager } from './tokenManager';
import { ragService } from './ragService';
import { statisticsService } from './statisticsService';
import { memoryManager } from './memoryManager';
import { feedbackLearning } from './feedbackLearning';
import { conversationManager } from './conversationManager';
import { getCrossModuleContext, generateContextSummary } from '../crossModuleData';
import { supabase, getCurrentUserId } from '../../../lib/supabase';

// NEW V2 SERVICES
import { novaKnowledgeBase, buildKnowledgeContext } from './knowledgeBase';
import { generateTrendAnalysis, formatTrendsForPrompt } from './trendAnalysis';
import {
  loadPreferences as loadPersonalityPreferences,
  getPersonalityAdaptations,
  getResponseParameters,
  getVariedGreeting,
} from './personalityLearning';
import {
  scheduleMemoryMaintenance,
  runMemoryMaintenance as runMemoryConsolidation,
} from './memoryConsolidation';
import {
  initNetworkListeners,
  checkOnline,
  withErrorHandling,
} from './offlineMode';
import {
  selectNudge,
  startProactiveChecks,
  stopProactiveChecks,
} from './proactiveIntelligence';

// NEW: Optimized context system with Redis caching
import {
  buildOptimizedContext,
  classifyQueryIntent,
  determineContextTier,
  generateHotSummary,
  hotSummaryToText,
  invalidateSummaryCache,
} from '../novaContextSummary';
import {
  findSimilarCachedResponse,
  cacheSemanticResponse,
} from '../../redis';

// System knowledge documents (loaded from JSON files)
import systemOverview from '../../../ai/knowledge_base/system_overview.json';

// Initialization state
let isInitialized = false;
let initializationPromise = null;

/**
 * Initialize Nova AI system
 * Should be called once on app startup
 */
export async function initializeNova() {
  if (isInitialized) return { success: true, cached: true };
  if (initializationPromise) return initializationPromise;

  initializationPromise = (async () => {
    console.log('Initializing Nova AI...');

    try {
      // Initialize V2 network listeners
      initNetworkListeners();

      // Check if system knowledge is already embedded
      const hasKnowledge = await ragService.isKnowledgeInitialized();

      if (!hasKnowledge) {
        console.log('Embedding system knowledge...');
        // Load all knowledge documents
        const knowledgeDocs = await loadKnowledgeDocuments();
        await ragService.initializeSystemKnowledge(knowledgeDocs);
      }

      // Apply memory decay (cleanup old memories)
      const decayResult = await memoryManager.applyMemoryDecay();
      console.log(`Memory decay applied: ${decayResult.updated} updated, ${decayResult.deleted} deleted`);

      // Cleanup old conversations
      const cleanedConversations = await conversationManager.cleanupOldConversations(90);
      if (cleanedConversations > 0) {
        console.log(`Cleaned up ${cleanedConversations} old conversations`);
      }

      // V2: Schedule memory maintenance
      scheduleMemoryMaintenance();

      // V2: Pre-warm hot context cache
      try {
        const summary = generateHotSummary();
        console.log('Nova: Hot summary pre-warmed');
      } catch (e) {
        console.warn('Failed to pre-warm hot summary:', e);
      }

      isInitialized = true;
      console.log('Nova AI initialized successfully (V2 features enabled)');

      return { success: true };
    } catch (error) {
      console.error('Failed to initialize Nova:', error);
      return { success: false, error: error.message };
    }
  })();

  return initializationPromise;
}

/**
 * Load all knowledge documents for embedding
 */
async function loadKnowledgeDocuments() {
  const docs = [
    {
      title: 'LifeOS Overview',
      type: 'system',
      ...systemOverview
    }
  ];

  // Dynamically import module docs
  const modules = [
    'dashboard', 'productivity', 'health', 'knowledge',
    'journal', 'calendar', 'skills', 'financial',
    'character', 'quests', 'social', 'settings'
  ];

  for (const mod of modules) {
    try {
      const moduleDoc = await import(`../../../ai/knowledge_base/modules/${mod}.json`);
      docs.push({
        title: moduleDoc.name || mod,
        type: 'module',
        module: mod,
        ...moduleDoc.default || moduleDoc
      });
    } catch (e) {
      console.warn(`Failed to load knowledge for ${mod}:`, e);
    }
  }

  return docs;
}

// Cache for personalization context (doesn't change often)
let personalizationCache = null;
let personalizationCacheTime = 0;
const PERSONALIZATION_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Determine if a query is simple/casual and doesn't need full RAG
 * Simple queries: greetings, status checks, quick questions
 */
function isSimpleQuery(query) {
  const lowerQuery = query.toLowerCase().trim();

  // Simple greetings and casual chat
  const simplePatterns = [
    /^(hi|hey|hello|yo|sup|what'?s up|howdy|hiya)/,
    /^(how are you|how's it going|what's new)/,
    /^(thanks|thank you|thx|ty|cool|ok|okay|great|nice|awesome)/,
    /^(bye|goodbye|see you|later|gotta go|ttyl)/,
    /^(yes|no|yeah|nah|yep|nope|sure|maybe)/,
  ];

  // Quick status checks that only need current context
  const statusPatterns = [
    /^(what('?s| is| are) my|show me my|how('?s| is| are) my)/,
    /^(what did i|how many|how much)/,
    /^(what'?s today|today'?s)/,
    /^(what time|when)/,
  ];

  // Check if it matches simple patterns
  for (const pattern of simplePatterns) {
    if (pattern.test(lowerQuery)) return true;
  }

  // Check if it's a short status check
  for (const pattern of statusPatterns) {
    if (pattern.test(lowerQuery) && query.length < 50) return true;
  }

  // Very short queries are usually simple
  if (query.length < 15 && !lowerQuery.includes('how do') && !lowerQuery.includes('what is')) {
    return true;
  }

  return false;
}

/**
 * Build QUICK context - fast path for simple queries
 * Uses only in-memory/cached data, no API calls
 * Target: <50ms
 *
 * OPTIMIZED: Now uses the new tiered context system with Redis caching
 */
export function buildQuickContext() {
  const startTime = Date.now();

  // Use new optimized hot summary (much lighter than full getCrossModuleContext)
  const summary = generateHotSummary();
  const context = hotSummaryToText(summary);
  const buildTime = Date.now() - startTime;

  return {
    context,
    summary, // Include raw summary for edge function
    metadata: {
      buildTimeMs: buildTime,
      mode: 'quick',
      tier: 'hot',
      totalTokens: Math.ceil(context.length / 4)
    }
  };
}

/**
 * Build comprehensive context for a user query
 * Main entry point for getting AI context
 *
 * OPTIMIZED v2: Uses 3-tier caching system
 * - HOT: Redis cached summaries (<50ms)
 * - WARM: Module-specific data (50-200ms)
 * - COLD: Full RAG + historical analysis (200-500ms)
 */
export async function buildContext(userQuery, options = {}) {
  const {
    conversationId = null,
    includeConversationHistory = true,
    maxTokens = tokenManager.CONTEXT_BUDGET.TOTAL_MAX,
    forceQuickMode = false,
    skipSemanticCache = false,
    userId
  } = options;

  const startTime = Date.now();

  // Warn if userId not provided - caching will be disabled
  if (!userId) {
    console.warn('buildContext called without userId - caching disabled');
  }

  // 1. Check semantic cache first (fastest path)
  if (!skipSemanticCache && userId) {
    try {
      const cachedResponse = await findSimilarCachedResponse(userQuery, userId);
      if (cachedResponse) {
        console.log(`Semantic cache hit (${cachedResponse.matchType})`);
        return {
          context: cachedResponse.response?.context || cachedResponse.context || '',
          summary: cachedResponse.response?.summary || cachedResponse.summary,
          metadata: {
            buildTimeMs: Date.now() - startTime,
            mode: 'cached',
            tier: 'cached',
            cacheType: cachedResponse.matchType,
            cached: true
          }
        };
      }
    } catch (e) {
      console.warn('Semantic cache check failed:', e);
    }
  }

  // 2. Classify query intent and determine tier
  const intent = classifyQueryIntent(userQuery);
  const tier = determineContextTier(intent);

  // 3. Use quick mode for simple queries (no API calls, very fast)
  if (forceQuickMode || isSimpleQuery(userQuery) || tier === 'hot') {
    const quickResult = buildQuickContext();

    // Cache for future similar queries (background, don't block)
    cacheSemanticResponse(userQuery, {
      context: quickResult.context,
      summary: quickResult.summary,
      intent,
      tier: 'hot'
    }, userId).catch(() => {});

    return {
      ...quickResult,
      intent,
      metadata: {
        ...quickResult.metadata,
        intent,
        tier: 'hot'
      }
    };
  }

  // Don't wait for initialization - it runs in background on app start
  if (!isInitialized && !initializationPromise) {
    initializeNova(); // Start but don't await
  }

  // 4. For WARM tier - use optimized context with module-specific data
  if (tier === 'warm') {
    const optimizedResult = await buildOptimizedContext(userQuery, userId);

    // Add conversation context if needed
    let conversationContext = '';
    if (includeConversationHistory) {
      try {
        conversationContext = await conversationManager.buildConversationContext(conversationId, userQuery);
      } catch (e) {
        console.warn('Failed to build conversation context:', e);
      }
    }

    const fullContext = conversationContext
      ? `${optimizedResult.context}\n\n${conversationContext}`
      : optimizedResult.context;

    const buildTime = Date.now() - startTime;

    // Cache for future (background)
    cacheSemanticResponse(userQuery, {
      context: fullContext,
      summary: optimizedResult.summary,
      intent,
      tier: 'warm'
    }, userId).catch(() => {});

    return {
      context: fullContext,
      summary: optimizedResult.summary,
      intent,
      metadata: {
        buildTimeMs: buildTime,
        mode: 'optimized',
        tier: 'warm',
        totalTokens: optimizedResult.tokenEstimate,
        hasConversationHistory: conversationContext.length > 0
      }
    };
  }

  // 5. COLD tier - full RAG + historical analysis (expensive)
  // Get current user state
  const currentContext = getCrossModuleContext();

  // Check if we have cached personalization context
  const now = Date.now();
  let personalizationPromise;
  if (personalizationCache && (now - personalizationCacheTime) < PERSONALIZATION_CACHE_TTL) {
    personalizationPromise = Promise.resolve(personalizationCache);
  } else {
    personalizationPromise = feedbackLearning.buildPersonalizationContext().then(ctx => {
      personalizationCache = ctx;
      personalizationCacheTime = Date.now();
      return ctx;
    });
  }

  // Run all async operations in PARALLEL for speed
  const [ragContext, personalizationContext, conversationContext] = await Promise.all([
    // Build RAG context (semantic search + current state)
    ragService.buildRAGContext(userQuery, currentContext, {
      maxTokens: maxTokens * 0.6 // Reserve 40% for other context
    }),

    // Build personalization context from learned preferences (with caching)
    personalizationPromise,

    // Build conversation context
    includeConversationHistory
      ? conversationManager.buildConversationContext(conversationId, userQuery)
      : Promise.resolve('')
  ]);

  // Check summarization in background (don't block)
  if (conversationId && includeConversationHistory) {
    conversationManager.shouldSummarize(conversationId).then(shouldSummarize => {
      if (shouldSummarize) {
        conversationManager.summarizeConversation(conversationId).catch(console.warn);
      }
    }).catch(() => {});
  }

  // Combine all context
  const fullContext = [
    ragContext.context,
    personalizationContext,
    conversationContext
  ].filter(Boolean).join('\n\n');

  const buildTime = Date.now() - startTime;
  if (buildTime > 1000) {
    console.warn(`Context build took ${buildTime}ms (cold tier)`);
  }

  // Cache the result (background)
  cacheSemanticResponse(userQuery, {
    context: fullContext,
    intent,
    tier: 'cold'
  }, userId).catch(() => {});

  return {
    context: fullContext,
    intent,
    metadata: {
      buildTimeMs: buildTime,
      mode: 'full',
      tier: 'cold',
      totalTokens: tokenManager.estimateTokens(fullContext),
      ragMetadata: ragContext.metadata,
      hasPersonalization: personalizationContext.length > 0,
      hasConversationHistory: conversationContext.length > 0
    }
  };
}

/**
 * Record user interaction for learning
 */
export async function recordInteraction(interactionType, data) {
  switch (interactionType) {
    case 'message_sent':
      // Store message content for future context
      await ragService.recordInteraction('sent message', data.content, 1);
      break;

    case 'advice_followed':
      await feedbackLearning.trackAdviceOutcome(data.adviceId, true, data.outcome);
      break;

    case 'advice_ignored':
      await feedbackLearning.trackAdviceOutcome(data.adviceId, false);
      break;

    case 'suggestion_accepted':
      await feedbackLearning.trackSuggestionResponse(data.type, true, data);
      break;

    case 'suggestion_dismissed':
      await feedbackLearning.trackSuggestionResponse(data.type, false, data);
      break;

    case 'topic_engaged':
      await feedbackLearning.trackTopicEngagement(data.topic, true, data.duration);
      break;

    case 'significant_event':
      await ragService.recordInteraction(data.eventType, data.description, data.importance || 2);
      break;

    default:
      console.warn('Unknown interaction type:', interactionType);
  }
}

/**
 * Learn a new fact about the user
 */
export async function learnFact(factKey, factValue, confidence = 0.7) {
  return ragService.recordUserFact(factKey, factValue, confidence);
}

/**
 * Store a pattern insight from analysis
 */
export async function storePatternInsight(patternType, insight, dataPoints) {
  return ragService.recordPatternInsight(patternType, insight, dataPoints);
}

/**
 * Run pattern analysis and store insights
 */
export async function analyzeAndStorePatterns() {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  try {
    // Get user events for analysis
    const { data: events } = await supabase
      .from('nova_user_events')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(500);

    if (!events || events.length < 20) {
      return { insufficient_data: true };
    }

    const insights = [];

    // Analyze time patterns
    const timestamps = events.map(e => e.created_at);
    const timeAnalysis = statisticsService.analyzeTimeDistribution(timestamps);

    if (timeAnalysis.peakHours?.length > 0 && !timeAnalysis.evenlyDistributed) {
      const peakHour = timeAnalysis.peakHours[0];
      const insight = `User is most active around ${peakHour.hour}:00 (${peakHour.percentage.toFixed(1)}% of activity)`;
      await storePatternInsight('activity_time', insight, timeAnalysis);
      insights.push(insight);
    }

    // Analyze day patterns
    const dayAnalysis = statisticsService.analyzeDayDistribution(timestamps);
    if (dayAnalysis.bestDays?.length > 0) {
      const bestDay = dayAnalysis.bestDays[0];
      if (bestDay.zScore > 1) { // Significantly above average
        const insight = `${bestDay.day} is the most productive day`;
        await storePatternInsight('activity_day', insight, dayAnalysis);
        insights.push(insight);
      }
    }

    // Analyze module usage
    const moduleUsage = {};
    events.forEach(e => {
      moduleUsage[e.module] = (moduleUsage[e.module] || 0) + 1;
    });

    const sortedModules = Object.entries(moduleUsage)
      .sort((a, b) => b[1] - a[1]);

    if (sortedModules.length > 0) {
      const topModule = sortedModules[0][0];
      const usagePercent = (sortedModules[0][1] / events.length * 100).toFixed(1);
      const insight = `Most used module: ${topModule} (${usagePercent}% of activity)`;
      await storePatternInsight('module_preference', insight, { moduleUsage });
      insights.push(insight);
    }

    return {
      insights,
      analyzedEvents: events.length,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Failed to analyze patterns:', error);
    return null;
  }
}

/**
 * Get Nova's memory statistics
 */
export async function getMemoryStats() {
  return memoryManager.getMemoryStats();
}

/**
 * Get advice effectiveness report
 */
export async function getAdviceReport() {
  return feedbackLearning.getAdviceEffectiveness();
}

/**
 * Perform maintenance tasks
 * Run periodically (daily recommended)
 */
export async function performMaintenance() {
  console.log('Running Nova maintenance...');

  const results = {
    memoryDecay: await memoryManager.applyMemoryDecay(),
    memoryCleanup: await memoryManager.cleanupMemories(1000),
    conversationCleanup: await conversationManager.cleanupOldConversations(90),
    patternAnalysis: await analyzeAndStorePatterns()
  };

  console.log('Maintenance complete:', results);
  return results;
}

/**
 * Semantic search across all Nova memories
 */
export async function search(query, options = {}) {
  return embeddingService.semanticSearch(query, options);
}

/**
 * Export all services for advanced usage
 */
export {
  embeddingService,
  tokenManager,
  ragService,
  statisticsService,
  memoryManager,
  feedbackLearning,
  conversationManager
};

/**
 * Invalidate cached context for a user
 * Call this when significant user data changes
 */
export async function invalidateCache(userId) {
  if (!userId) {
    console.warn('invalidateCache called without userId - skipping');
    return false;
  }
  try {
    await invalidateSummaryCache(userId);
    console.log(`Cache invalidated for user ${userId}`);
    return true;
  } catch (e) {
    console.warn('Failed to invalidate cache:', e);
    return false;
  }
}

/**
 * Default export: Main Nova interface
 */
export const novaCore = {
  initialize: initializeNova,
  buildContext,
  buildQuickContext,
  isSimpleQuery,
  recordInteraction,
  learnFact,
  storePatternInsight,
  analyzeAndStorePatterns,
  getMemoryStats,
  getAdviceReport,
  performMaintenance,
  invalidateCache,
  search,
  // Expose new optimized functions
  classifyQueryIntent,
  determineContextTier,

  // V2 ADDITIONS
  // Knowledge base
  knowledgeBase: novaKnowledgeBase,
  buildKnowledgeContext,

  // Trend analysis
  generateTrendAnalysis,
  formatTrendsForPrompt,

  // Personality
  getPersonalityAdaptations,
  getResponseParameters,
  getVariedGreeting,

  // Memory consolidation
  runMemoryConsolidation,
  scheduleMemoryMaintenance,

  // Offline mode
  checkOnline,
  withErrorHandling,

  // Proactive intelligence
  selectNudge,
  startProactiveChecks,
  stopProactiveChecks,
};

// Re-export V2 services for direct import
export {
  novaKnowledgeBase,
  buildKnowledgeContext,
  generateTrendAnalysis,
  formatTrendsForPrompt,
  getPersonalityAdaptations,
  getResponseParameters,
  getVariedGreeting,
  scheduleMemoryMaintenance,
  runMemoryConsolidation,
  checkOnline,
  withErrorHandling,
  selectNudge,
  startProactiveChecks,
  stopProactiveChecks,
};

export default novaCore;
