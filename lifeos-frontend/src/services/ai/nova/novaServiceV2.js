/**
 * Nova Service V2 - Fully Optimized AI Companion Service
 *
 * This is the upgraded Nova service integrating all improvements:
 * 1. Knowledge base for accurate system information
 * 2. Trend analysis for data-driven insights
 * 3. Personality learning for adaptive responses
 * 4. Memory consolidation for efficient storage
 * 5. Offline mode with graceful fallbacks
 * 6. Proactive intelligence with smart timing
 * 7. Response caching for common queries
 * 8. Pre-warming for instant responses
 */

import { supabase, getCurrentUserId } from '../../../lib/supabase';
import { getCrossModuleContext, generateContextSummary } from '../crossModuleData';

// Import new services
import { novaKnowledgeBase, buildKnowledgeContext } from './knowledgeBase';
import { generateTrendAnalysis, formatTrendsForPrompt } from './trendAnalysis';
import {
  loadPreferences,
  getPersonalityAdaptations,
  getResponseParameters,
  getVariedGreeting,
  trackResponse,
  updateResponseReaction,
  analyzeUserSentiment,
  detectAskingForMore,
  detectAskingForLess,
} from './personalityLearning';
import {
  queueForExtraction,
  forceExtraction,
  scheduleMemoryMaintenance,
} from './memoryConsolidation';
import {
  initNetworkListeners,
  checkOnline,
  withErrorHandling,
  cacheForOffline,
  getOfflineResponse,
  getFallbackResponse,
} from './offlineMode';
import {
  selectNudge,
  recordNudgeShown,
  recordNudgeReaction,
  startProactiveChecks,
  stopProactiveChecks,
} from './proactiveIntelligence';

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  edgeFunctionUrl: import.meta.env.VITE_SUPABASE_URL + '/functions/v1/nova-chat-v3',
  fallbackUrl: import.meta.env.VITE_SUPABASE_URL + '/functions/v1/nova-chat-v2',

  // Cache settings
  contextCacheTTLMs: 30 * 1000, // 30 seconds
  profileMemoryCacheTTLMs: 5 * 60 * 1000, // 5 minutes

  // Streaming settings
  defaultStream: true,

  // Mode settings
  defaultMode: 'auto',
};

// ============================================================================
// CACHE MANAGEMENT
// ============================================================================

let contextCache = null;
let contextCacheTime = 0;
let profileMemoriesCache = null;
let profileMemoriesCacheTime = 0;
let trendsCache = null;
let trendsCacheTime = 0;

/**
 * Invalidate all caches
 */
export function invalidateCaches() {
  contextCache = null;
  contextCacheTime = 0;
  profileMemoriesCache = null;
  profileMemoriesCacheTime = 0;
  trendsCache = null;
  trendsCacheTime = 0;
}

/**
 * Pre-warm caches for instant responses
 */
export async function prewarmCaches() {
  console.log('Nova: Pre-warming caches...');
  const startTime = performance.now();

  try {
    // Get context
    contextCache = getCrossModuleContext();
    contextCacheTime = Date.now();

    // Generate trends
    trendsCache = generateTrendAnalysis(contextCache);
    trendsCacheTime = Date.now();

    // Load profile memories
    const userId = await getCurrentUserId();
    if (userId) {
      const { data } = await supabase.rpc('get_nova_profile_memories', {
        p_user_id: userId,
      });
      if (data) {
        profileMemoriesCache = data;
        profileMemoriesCacheTime = Date.now();
      }
    }

    const elapsed = Math.round(performance.now() - startTime);
    console.log(`Nova: Caches pre-warmed in ${elapsed}ms`);

    return true;
  } catch (e) {
    console.warn('Nova: Cache pre-warming failed:', e);
    return false;
  }
}

/**
 * Get cached or fresh context
 */
function getContext() {
  if (contextCache && Date.now() - contextCacheTime < CONFIG.contextCacheTTLMs) {
    return contextCache;
  }

  contextCache = getCrossModuleContext();
  contextCacheTime = Date.now();
  return contextCache;
}

/**
 * Get cached or fresh trends
 */
function getTrends() {
  if (trendsCache && Date.now() - trendsCacheTime < CONFIG.contextCacheTTLMs) {
    return trendsCache;
  }

  const context = getContext();
  trendsCache = generateTrendAnalysis(context);
  trendsCacheTime = Date.now();
  return trendsCache;
}

// ============================================================================
// MESSAGE CLASSIFICATION
// ============================================================================

/**
 * Classify message for routing decisions
 */
function classifyMessage(message) {
  const lower = message.toLowerCase().trim();

  // Greeting
  if (/^(hi|hey|hello|yo|sup|good morning|good afternoon|good evening|what's up|how are you)[\s!?.]*$/i.test(lower)) {
    return { type: 'greeting', complexity: 'trivial' };
  }

  // Navigation
  if (/where|how do i get to|how do i find|go to|take me to|show me the/i.test(lower)) {
    return { type: 'navigation', complexity: 'simple' };
  }

  // Stats/Data query
  if (/how many|what is my|what's my|show me my|status|progress|stats/i.test(lower)) {
    return { type: 'stats', complexity: 'moderate' };
  }

  // Analysis/Insight request
  if (/analyze|why|explain|compare|trend|insight|recommend|suggest|plan|strategy/i.test(lower)) {
    return { type: 'analysis', complexity: 'complex' };
  }

  // Help/Troubleshooting
  if (/help|how does|how do i|problem|issue|not working|error/i.test(lower)) {
    return { type: 'help', complexity: 'moderate' };
  }

  // Default
  return { type: 'general', complexity: 'moderate' };
}

// ============================================================================
// CONTEXT BUILDING
// ============================================================================

/**
 * Build optimized context based on message type
 */
function buildOptimizedContext(message, classification) {
  const parts = [];

  // For greetings, minimal context
  if (classification.type === 'greeting') {
    const context = getContext();
    const today = context.dailyTasks?.today || {};
    const streaks = context.gamification?.streaks?.global || 0;

    if (today.total > 0) {
      parts.push(`Tasks: ${today.completed}/${today.total} done`);
    }
    if (streaks > 0) {
      parts.push(`Streak: ${streaks} days`);
    }

    return parts.join(' | ');
  }

  // For navigation, include knowledge context
  if (classification.type === 'navigation') {
    return buildKnowledgeContext(message);
  }

  // For stats queries, include relevant data
  if (classification.type === 'stats') {
    const context = getContext();
    return generateContextSummary(context).slice(0, 2000);
  }

  // For analysis, include trends and full context
  if (classification.type === 'analysis') {
    const context = getContext();
    const trends = getTrends();

    parts.push(generateContextSummary(context));
    parts.push(formatTrendsForPrompt(trends));

    return parts.join('\n\n').slice(0, 4000);
  }

  // For help, include knowledge base
  if (classification.type === 'help') {
    return buildKnowledgeContext(message);
  }

  // Default: moderate context
  const context = getContext();
  return generateContextSummary(context).slice(0, 2000);
}

// ============================================================================
// MAIN CHAT FUNCTION
// ============================================================================

/**
 * Send a message to Nova and get a response
 */
export async function chat(message, options = {}) {
  const {
    conversationHistory = [],
    stream = CONFIG.defaultStream,
    mode = CONFIG.defaultMode,
    onStream = null,
    skipCache = false,
  } = options;

  // Initialize network listeners
  initNetworkListeners();

  // Classify message
  const classification = classifyMessage(message);

  // Check for cached response (greetings, navigation)
  if (!skipCache && (classification.type === 'greeting' || classification.type === 'navigation')) {
    const cached = getOfflineResponse(message);
    if (cached) {
      return {
        success: true,
        content: cached,
        fromCache: true,
        classification,
      };
    }
  }

  // Build context based on classification
  const userContext = buildOptimizedContext(message, classification);

  // Get personality adaptations
  const adaptations = getPersonalityAdaptations();

  // Prepare messages
  const messages = [
    ...conversationHistory.slice(-6), // Keep last 6 messages
    { role: 'user', content: message },
  ];

  // API call with error handling
  const result = await withErrorHandling(
    async () => {
      const session = await supabase.auth.getSession();
      const authToken = session.data?.session?.access_token;

      if (!authToken) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(CONFIG.edgeFunctionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          messages,
          stream,
          mode,
          userContext,
          adaptations,
          skipCache,
        }),
      });

      if (!response.ok) {
        // Try fallback
        const fallbackResponse = await fetch(CONFIG.fallbackUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            messages,
            stream,
            mode,
          }),
        });

        if (!fallbackResponse.ok) {
          throw new Error(`API error: ${fallbackResponse.status}`);
        }

        return handleResponse(fallbackResponse, stream, onStream);
      }

      return handleResponse(response, stream, onStream);
    },
    message
  );

  // Track response for personality learning
  if (result.success && result.content) {
    const responseIndex = trackResponse(result.content, {
      topic: classification.type,
      hadData: classification.type === 'stats',
    });

    // Store for later reaction tracking
    result.responseIndex = responseIndex;

    // Cache for offline use
    cacheForOffline(message, result.content);

    // Queue for memory extraction
    queueForExtraction({ role: 'user', content: message });
    queueForExtraction({ role: 'assistant', content: result.content });
  }

  return {
    ...result,
    classification,
  };
}

/**
 * Handle API response (streaming or non-streaming)
 */
async function handleResponse(response, stream, onStream) {
  if (stream && onStream) {
    return handleStreamingResponse(response, onStream);
  }

  const data = await response.json();
  return {
    success: true,
    content: data.content || data.response,
    model: data.model,
    usage: data.usage,
  };
}

/**
 * Handle streaming response
 */
async function handleStreamingResponse(response, onStream) {
  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('No response body');
  }

  const decoder = new TextDecoder();
  let fullContent = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6).trim();

          if (data === '[DONE]') {
            onStream({ done: true, content: fullContent });
            break;
          }

          try {
            const parsed = JSON.parse(data);
            if (parsed.text) {
              fullContent += parsed.text;
              onStream({ text: parsed.text, content: fullContent });
            }
          } catch {
            // Ignore parse errors
          }
        }
      }
    }

    return {
      success: true,
      content: fullContent,
      streamed: true,
    };
  } finally {
    reader.releaseLock();
  }
}

// ============================================================================
// QUICK RESPONSES
// ============================================================================

/**
 * Get a quick greeting response without API call
 */
export function getQuickGreeting() {
  return getVariedGreeting();
}

/**
 * Get navigation response without API call
 */
export function getQuickNavigation(query) {
  const routeInfo = novaKnowledgeBase.getRouteInfo(query);

  if (routeInfo) {
    return `Go to ${routeInfo.path} for ${routeInfo.name}. ${routeInfo.description}`;
  }

  return null;
}

// ============================================================================
// INSIGHT GENERATION
// ============================================================================

/**
 * Generate proactive insights based on current data
 */
export function generateInsights() {
  const trends = getTrends();

  return {
    priority: trends.priorityInsights || [],
    insights: trends.allInsights || [],
    summary: trends.summary,
  };
}

/**
 * Check for proactive nudge
 */
export function checkForNudge() {
  return selectNudge();
}

// ============================================================================
// USER FEEDBACK
// ============================================================================

/**
 * Record user reaction to last response
 */
export function recordReaction(responseIndex, reaction) {
  updateResponseReaction(responseIndex, reaction);
}

/**
 * Analyze and adapt from user's follow-up message
 */
export function analyzeFollowUp(message, responseIndex) {
  const sentiment = analyzeUserSentiment(message);
  const askedForMore = detectAskingForMore(message);
  const askedForLess = detectAskingForLess(message);

  updateResponseReaction(responseIndex, {
    sentiment,
    askedForMore,
    askedForLess,
    seemedSatisfied: sentiment === 'positive' && !askedForMore && !askedForLess,
  });

  return { sentiment, askedForMore, askedForLess };
}

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initialize Nova service
 */
export async function initializeNova() {
  console.log('Nova: Initializing...');

  // Initialize network listeners
  initNetworkListeners();

  // Pre-warm caches
  await prewarmCaches();

  // Schedule memory maintenance
  scheduleMemoryMaintenance();

  console.log('Nova: Initialization complete');
}

/**
 * Start proactive nudges
 */
export function startNudges(onNudge) {
  startProactiveChecks((nudge) => {
    recordNudgeShown(nudge);
    onNudge(nudge);
  });
}

/**
 * Stop proactive nudges
 */
export function stopNudges() {
  stopProactiveChecks();
}

/**
 * Record nudge action
 */
export function recordNudgeAction(type, actedOn) {
  recordNudgeReaction(type, actedOn);
}

// ============================================================================
// CLEANUP
// ============================================================================

/**
 * Cleanup on unmount
 */
export async function cleanup() {
  stopProactiveChecks();
  await forceExtraction();
}

// ============================================================================
// EXPORTS
// ============================================================================

export const novaServiceV2 = {
  // Main chat
  chat,

  // Quick responses
  getQuickGreeting,
  getQuickNavigation,

  // Insights
  generateInsights,
  checkForNudge,

  // Caching
  prewarmCaches,
  invalidateCaches,

  // Feedback
  recordReaction,
  analyzeFollowUp,

  // Proactive
  startNudges,
  stopNudges,
  recordNudgeAction,

  // Lifecycle
  initializeNova,
  cleanup,

  // Utilities
  classifyMessage,
  checkOnline,
};

export default novaServiceV2;
