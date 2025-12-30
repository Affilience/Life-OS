/**
 * Nova Context Builder
 * Unified service that combines all context sources for Nova AI
 *
 * Sources:
 * - System Knowledge (what Ascynt is and how it works)
 * - User Data (current state from all modules)
 * - Memory (learned facts, routines, past events)
 * - Patterns (productivity peaks, correlations)
 * - Predictions (goal trajectories)
 */

import { getCrossModuleContext, generateContextSummary } from './crossModuleData';
import { novaMemoryService } from './novaMemoryService';
import { patternRecognitionService } from './patternRecognitionService';
import { correlationEngine } from './correlationEngine';
import { systemKnowledgeService } from '../../ai/systemKnowledgeService';

// Cache for expensive computations
let patternCache = null;
let patternCacheTime = 0;
const PATTERN_CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

/**
 * Build comprehensive context for Nova
 * This is the main function called before each AI interaction
 */
export async function buildNovaContext(userQuery = '') {
  const startTime = Date.now();

  try {
    // 1. Get system knowledge relevant to query
    const systemKnowledge = systemKnowledgeService.buildSystemContext(userQuery);

    // 2. Get current user data from stores
    const currentContext = getCrossModuleContext();
    const userDataSummary = generateContextSummary(currentContext);

    // 3. Get learned memories (cached if recent)
    let memoryContext = '';
    try {
      memoryContext = await novaMemoryService.buildMemoryContext();
    } catch (e) {
      console.warn('Memory context unavailable:', e);
    }

    // 4. Get patterns (cached for performance)
    let patternContext = '';
    try {
      if (!patternCache || Date.now() - patternCacheTime > PATTERN_CACHE_DURATION) {
        patternContext = await patternRecognitionService.buildPatternContext();
        patternCache = patternContext;
        patternCacheTime = Date.now();
      } else {
        patternContext = patternCache;
      }
    } catch (e) {
      console.warn('Pattern context unavailable:', e);
    }

    // 5. Get correlations (only if query seems to need it)
    let correlationContext = '';
    const correlationKeywords = ['why', 'correlation', 'affect', 'impact', 'relationship', 'when', 'better', 'worse'];
    const needsCorrelations = correlationKeywords.some(k => userQuery.toLowerCase().includes(k));

    if (needsCorrelations) {
      try {
        correlationContext = await correlationEngine.buildCorrelationContext();
      } catch (e) {
        console.warn('Correlation context unavailable:', e);
      }
    }

    // Combine all contexts
    const fullContext = `
${systemKnowledge}

CURRENT USER STATE:
${userDataSummary}
${memoryContext}
${patternContext}
${correlationContext}
`.trim();

    const buildTime = Date.now() - startTime;
    if (buildTime > 1000) {
      console.warn(`Context build took ${buildTime}ms - consider optimisation`);
    }

    return fullContext;

  } catch (error) {
    console.error('Failed to build Nova context:', error);

    // Return minimal context on error
    const currentContext = getCrossModuleContext();
    return generateContextSummary(currentContext);
  }
}

/**
 * Build a quick context for simple queries
 * Skips expensive pattern analysis
 */
export async function buildQuickContext(userQuery = '') {
  const systemKnowledge = systemKnowledgeService.buildSystemContext(userQuery);
  const currentContext = getCrossModuleContext();
  const userDataSummary = generateContextSummary(currentContext);

  return `
${systemKnowledge}

CURRENT USER STATE:
${userDataSummary}
`.trim();
}

/**
 * Get a summary for display (not for AI)
 */
export function getUserSummary() {
  const context = getCrossModuleContext();

  return {
    level: context.gamification?.level || 1,
    stage: context.gamification?.stage || 'spark',
    xp: context.gamification?.totalXP || 0,
    tasksToday: context.dailyTasks?.today || { total: 0, completed: 0 },
    activeStreaks: context.gamification?.streaks?.active?.length || 0,
    workoutsThisWeek: context.fitness?.workoutsThisWeek || 0
  };
}

/**
 * Trigger background learning
 * Call this periodically or after significant actions
 */
export async function triggerLearning() {
  try {
    await novaMemoryService.learnFromActivity();
    console.log('Background learning completed');
  } catch (error) {
    console.warn('Background learning failed:', error);
  }
}

/**
 * Record a significant event for Nova to remember
 */
export async function recordEvent(eventType, description) {
  return novaMemoryService.recordSignificantEvent(eventType, description);
}

/**
 * Clear pattern cache (call after significant data changes)
 */
export function clearPatternCache() {
  patternCache = null;
  patternCacheTime = 0;
}

/**
 * Export context builder
 */
export const novaContextBuilder = {
  buildNovaContext,
  buildQuickContext,
  getUserSummary,
  triggerLearning,
  recordEvent,
  clearPatternCache
};

export default novaContextBuilder;
