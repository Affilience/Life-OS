/**
 * Nova Optimized Context Builder
 *
 * This is the new, performance-optimized context builder for Nova AI.
 * It uses a 3-tier caching strategy:
 *
 * HOT TIER (< 50ms): Pre-computed summaries cached in Redis
 * WARM TIER (50-200ms): On-demand module data from Zustand stores
 * COLD TIER (200-500ms): Full historical analysis (patterns, correlations)
 *
 * Performance targets:
 * - Simple greetings: < 50ms
 * - Status checks: < 100ms
 * - Module queries: < 200ms
 * - Deep analysis: < 500ms
 */

import { systemKnowledgeService } from '../../ai/systemKnowledgeService';
import {
  buildOptimizedContext,
  classifyQueryIntent,
  determineContextTier,
  generateHotSummary,
  hotSummaryToText,
} from './novaContextSummary';
import {
  findSimilarCachedResponse,
  cacheSemanticResponse,
  getCachedContextSummary,
  cacheContextSummary,
} from '../redis';

// Performance tracking
let performanceStats = {
  hotHits: 0,
  warmHits: 0,
  coldHits: 0,
  cacheHits: 0,
  avgBuildTime: 0,
  totalBuilds: 0,
};

/**
 * Get performance statistics
 */
export function getPerformanceStats() {
  return { ...performanceStats };
}

/**
 * Reset performance statistics
 */
export function resetPerformanceStats() {
  performanceStats = {
    hotHits: 0,
    warmHits: 0,
    coldHits: 0,
    cacheHits: 0,
    avgBuildTime: 0,
    totalBuilds: 0,
  };
}

/**
 * Build context for Nova with caching and optimisation
 *
 * @param {string} query - The user's query
 * @param {Object} options - Configuration options
 * @param {string} options.userId - User ID for caching
 * @param {boolean} options.skipCache - Skip cache lookup
 * @param {boolean} options.includeSystemKnowledge - Include system knowledge
 * @param {boolean} options.verbose - Include performance metadata
 * @returns {Promise<Object>} Context and metadata
 */
export async function buildNovaContextOptimized(query, options = {}) {
  const startTime = performance.now();
  const {
    userId,
    skipCache = false,
    includeSystemKnowledge = true,
    verbose = false,
  } = options;

  // Validate userId for proper multi-user isolation
  if (!userId) {
    console.warn('buildNovaContextOptimized called without userId - cache disabled');
  }

  // Track this build
  performanceStats.totalBuilds++;

  // 1. Check semantic cache first (fastest path)
  if (!skipCache) {
    try {
      const cached = await findSimilarCachedResponse(query, userId);
      if (cached) {
        performanceStats.cacheHits++;
        const buildTime = performance.now() - startTime;

        return {
          context: cached.response.context,
          summary: cached.response.summary,
          cached: true,
          cacheType: cached.matchType,
          tier: 'cached',
          buildTimeMs: Math.round(buildTime),
          ...(verbose && { originalQuery: cached.query }),
        };
      }
    } catch (e) {
      console.warn('Semantic cache check failed:', e);
    }
  }

  // 2. Classify query intent
  const intent = classifyQueryIntent(query);
  const tier = determineContextTier(intent);

  // Track tier usage
  if (tier === 'hot') performanceStats.hotHits++;
  else if (tier === 'warm') performanceStats.warmHits++;
  else performanceStats.coldHits++;

  // 3. Build context based on tier
  const result = await buildOptimizedContext(query, userId);

  // 4. Add system knowledge if needed
  let fullContext = '';
  if (includeSystemKnowledge) {
    const systemContext = systemKnowledgeService?.buildSystemContext?.(query) || '';
    fullContext = systemContext ? `${systemContext}\n\n${result.context}` : result.context;
  } else {
    fullContext = result.context;
  }

  // 5. Calculate final build time
  const buildTime = performance.now() - startTime;

  // Update average build time
  const oldAvg = performanceStats.avgBuildTime;
  const oldCount = performanceStats.totalBuilds - 1;
  performanceStats.avgBuildTime = oldCount > 0
    ? (oldAvg * oldCount + buildTime) / performanceStats.totalBuilds
    : buildTime;

  // 6. Cache the result for future similar queries
  if (!skipCache && buildTime > 100) { // Only cache if it took meaningful time
    try {
      await cacheSemanticResponse(query, {
        context: fullContext,
        summary: result.summary,
        intent,
        tier,
      }, userId);
    } catch (e) {
      console.warn('Failed to cache response:', e);
    }
  }

  return {
    context: fullContext,
    summary: result.summary,
    intent,
    tier,
    cached: false,
    buildTimeMs: Math.round(buildTime),
    tokenEstimate: result.tokenEstimate,
    ...(verbose && { performanceStats: getPerformanceStats() }),
  };
}

/**
 * Quick context for simple interactions
 * Bypasses heavy analysis for greetings and simple questions
 */
export async function buildQuickContext(query, userId) {
  const startTime = performance.now();

  if (!userId) {
    console.warn('buildQuickContext called without userId');
  }

  // Get hot summary
  const summary = generateHotSummary();
  const contextText = hotSummaryToText(summary);

  // Get minimal system knowledge
  const systemContext = systemKnowledgeService?.getMinimalContext?.() ||
    'You are Nova, the AI companion for Ascynt. Be helpful, friendly, and concise.';

  const fullContext = `${systemContext}\n\nUSER STATUS:\n${contextText}`;

  const buildTime = performance.now() - startTime;

  return {
    context: fullContext,
    summary,
    tier: 'quick',
    buildTimeMs: Math.round(buildTime),
    tokenEstimate: Math.ceil(fullContext.length / 4),
  };
}

/**
 * Streaming-friendly context builder
 * Returns context in chunks for progressive rendering
 */
export async function* buildContextStream(query, userId) {
  const startTime = performance.now();

  if (!userId) {
    console.warn('buildContextStream called without userId');
  }

  // First yield: hot summary (immediate)
  const summary = generateHotSummary();
  yield {
    type: 'summary',
    data: summary,
    timeMs: Math.round(performance.now() - startTime),
  };

  // Second yield: intent classification
  const intent = classifyQueryIntent(query);
  yield {
    type: 'intent',
    data: intent,
    timeMs: Math.round(performance.now() - startTime),
  };

  // Third yield: context text
  const contextText = hotSummaryToText(summary);
  yield {
    type: 'context',
    data: contextText,
    timeMs: Math.round(performance.now() - startTime),
  };

  // Fourth yield: system knowledge (if needed)
  const tier = determineContextTier(intent);
  if (tier !== 'hot') {
    const systemContext = systemKnowledgeService?.buildSystemContext?.(query) || '';
    yield {
      type: 'system',
      data: systemContext,
      timeMs: Math.round(performance.now() - startTime),
    };
  }

  // Final yield: complete
  yield {
    type: 'complete',
    timeMs: Math.round(performance.now() - startTime),
  };
}

/**
 * Pre-warm the cache for a user
 * Call this on app load or login to reduce first-query latency
 */
export async function prewarmCache(userId) {
  if (!userId) {
    console.warn('prewarmCache called without userId - skipping');
    return false;
  }
  try {
    const summary = generateHotSummary();
    await cacheContextSummary(userId, summary);
    console.log(`Cache pre-warmed for user ${userId}`);
    return true;
  } catch (e) {
    console.warn('Cache pre-warm failed:', e);
    return false;
  }
}

/**
 * Determine if we should use quick vs full context
 * Based on query complexity and user preferences
 */
export function shouldUseQuickContext(query) {
  const intent = classifyQueryIntent(query);

  // Use quick context for:
  // - Greetings
  // - Very short queries (< 20 chars)
  // - Simple questions without module-specific needs
  if (intent.isGreeting) return true;
  if (query.length < 20 && intent.isSimpleQuestion) return true;

  // Count how many module-specific needs
  const moduleNeeds = [
    intent.needsTaskData,
    intent.needsHealthData,
    intent.needsFinanceData,
    intent.needsKnowledgeData,
    intent.needsCalendarData,
    intent.needsSkillsData,
    intent.needsSocialData,
    intent.needsStreakData,
    intent.needsXPData,
  ].filter(Boolean).length;

  // If no specific module needs and no deep analysis, use quick
  if (moduleNeeds === 0 && !intent.needsHistoricalData && !intent.needsCorrelations) {
    return true;
  }

  return false;
}

/**
 * Main entry point - automatically chooses best strategy
 */
export async function getNovaContext(query, options = {}) {
  if (shouldUseQuickContext(query)) {
    return buildQuickContext(query, options.userId);
  }
  return buildNovaContextOptimized(query, options);
}

/**
 * Export the optimized context builder
 */
export const novaOptimizedContextBuilder = {
  buildNovaContextOptimized,
  buildQuickContext,
  buildContextStream,
  getNovaContext,
  prewarmCache,
  shouldUseQuickContext,
  classifyQueryIntent,
  determineContextTier,
  getPerformanceStats,
  resetPerformanceStats,
};

export default novaOptimizedContextBuilder;
