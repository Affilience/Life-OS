/**
 * Nova Service - The Unified AI Interface
 *
 * This is the main entry point for all Nova AI functionality.
 * It brings together:
 * - Master Brain (system prompt building)
 * - Data Explainer (metric explanations)
 * - Proactive Insights (automatic notifications)
 * - Personality System (emotional intelligence)
 * - Correlation Engine (pattern detection)
 *
 * Use this service to interact with Nova from any component.
 */

import { getCrossModuleContext, generateContextSummary } from '../crossModuleData';
import { buildMasterPrompt, buildQuickPrompt, masterBrain } from './masterBrain';
import { explainMetric, explainMetricNaturally, generateLifeSummary, dataExplainer } from './dataExplainer';
import { generateAllInsights, getTopInsights, getUrgentInsights, formatInsightsForPrompt, proactiveInsights } from './proactiveInsights';
import { generatePersonalityPrompt, getCurrentStage, detectEmotionalState, personality } from './personality';
import { analyzeUserData, getAnalysisForPrompt, getRecommendations, correlationEngine } from './correlationEngine';
import { memoryService, storeMessage, getMemoryContext, extractMemoriesFromConversation } from './memoryService';
import { supabase, getCurrentUserId } from '../../../lib/supabase';

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  // Edge function URLs
  edgeFunctionUrl: import.meta.env.VITE_SUPABASE_URL + '/functions/v1/nova-chat-v2',
  fallbackUrl: import.meta.env.VITE_SUPABASE_URL + '/functions/v1/nova-chat',

  // Default settings
  defaultMode: 'standard', // 'quick', 'standard', 'comprehensive'
  enableStreaming: true,
  maxRetries: 2,

  // Cache settings
  contextCacheTTL: 30000, // 30 seconds
  insightsCacheTTL: 60000, // 1 minute

  // Auto memory extraction settings
  autoExtractAfterMessages: 6, // Extract memories after every N messages (3 exchanges)
  autoExtractOnSignificant: true, // Extract when significant content detected
};

// ============================================================================
// CONVERSATION TRACKING (for auto memory extraction)
// ============================================================================

const conversationTracker = {
  messageCount: 0,
  recentMessages: [],
  lastExtractionTime: 0,
  minExtractionInterval: 60000, // Don't extract more than once per minute
};

// ============================================================================
// CONTEXT CACHING
// ============================================================================

let contextCache = {
  data: null,
  timestamp: 0,
};

let insightsCache = {
  data: null,
  timestamp: 0,
};

/**
 * Get cached context or regenerate if stale
 */
function getCachedContext() {
  const now = Date.now();
  if (contextCache.data && now - contextCache.timestamp < CONFIG.contextCacheTTL) {
    return contextCache.data;
  }

  const context = getCrossModuleContext();
  contextCache = { data: context, timestamp: now };
  return context;
}

/**
 * Get cached insights or regenerate if stale
 */
function getCachedInsights() {
  const now = Date.now();
  if (insightsCache.data && now - insightsCache.timestamp < CONFIG.insightsCacheTTL) {
    return insightsCache.data;
  }

  const insights = generateAllInsights();
  insightsCache = { data: insights, timestamp: now };
  return insights;
}

/**
 * Invalidate all caches (call after significant data changes)
 */
export function invalidateCaches() {
  contextCache = { data: null, timestamp: 0 };
  insightsCache = { data: null, timestamp: 0 };
}

// ============================================================================
// AUTO MEMORY EXTRACTION
// ============================================================================

/**
 * Patterns that indicate significant content worth remembering
 */
const SIGNIFICANT_PATTERNS = [
  /\b(my name is|i('m| am) called|call me)\b/i,
  /\b(i('m| am) \d+ years? old|i('m| am) (a |an )?[a-z]+ (student|developer|engineer|designer|worker))\b/i,
  /\b(my goal|i want to|i('m| am) trying to|i need to)\b/i,
  /\b(i (love|hate|prefer|like|dislike|enjoy))\b/i,
  /\b(i (always|never|usually|often|sometimes))\b/i,
  /\b(i struggle with|i('m| am) bad at|i find it (hard|difficult))\b/i,
  /\b(i achieved|i completed|i finished|i hit|i reached)\b/i,
  /\b(remind me|remember that|don't forget)\b/i,
  /\b(important to me|matters to me|i care about)\b/i,
];

/**
 * Check if a message contains significant content worth extracting
 */
function hasSignificantContent(message) {
  if (!message || message.length < 20) return false;
  return SIGNIFICANT_PATTERNS.some(pattern => pattern.test(message));
}

/**
 * Track a message and trigger auto-extraction if needed
 */
function trackMessage(role, content) {
  conversationTracker.messageCount++;
  conversationTracker.recentMessages.push({ role, content });

  // Keep only last 10 messages for extraction
  if (conversationTracker.recentMessages.length > 10) {
    conversationTracker.recentMessages.shift();
  }
}

/**
 * Check if we should trigger memory extraction
 */
function shouldExtractMemories(latestMessage) {
  const now = Date.now();

  // Don't extract too frequently
  if (now - conversationTracker.lastExtractionTime < conversationTracker.minExtractionInterval) {
    return false;
  }

  // Extract after N messages
  if (conversationTracker.messageCount >= CONFIG.autoExtractAfterMessages) {
    return true;
  }

  // Extract if significant content detected
  if (CONFIG.autoExtractOnSignificant && hasSignificantContent(latestMessage)) {
    return true;
  }

  return false;
}

/**
 * Trigger memory extraction in the background
 */
async function triggerAutoExtraction() {
  if (conversationTracker.recentMessages.length < 2) return;

  conversationTracker.lastExtractionTime = Date.now();
  const messagesToExtract = [...conversationTracker.recentMessages];

  // Reset counter but keep messages for context
  conversationTracker.messageCount = 0;

  // Extract in background (don't await)
  extractMemoriesFromConversation(messagesToExtract)
    .then(memories => {
      if (memories && memories.length > 0) {
        console.log(`[Nova] Auto-extracted ${memories.length} memories`);
      }
    })
    .catch(err => {
      console.warn('[Nova] Auto-extraction failed:', err);
    });
}

/**
 * Reset conversation tracking (call when starting new conversation)
 */
export function resetConversationTracking() {
  conversationTracker.messageCount = 0;
  conversationTracker.recentMessages = [];
}

// ============================================================================
// SYSTEM PROMPT BUILDING
// ============================================================================

/**
 * Build the complete system prompt for Nova
 * This is the "brain" that gets sent to Claude
 */
export function buildSystemPrompt(options = {}) {
  const {
    mode = 'standard', // 'quick', 'standard', 'comprehensive'
    includeInsights = true,
    includeCorrelations = true,
    includePersonality = true,
    includeMemory = true,
    conversationContext = '',
    userQuery = '',
    memoryContext = null, // Memory context from memoryService
  } = options;

  const context = getCachedContext();

  // Quick mode - minimal context for fast responses
  if (mode === 'quick') {
    return buildQuickPrompt(context);
  }

  // Build comprehensive prompt
  const sections = [];

  // 1. Master brain (core prompt with user profile and state)
  sections.push(buildMasterPrompt(context, {
    conversationContext,
    userQuery,
    mode,
  }));

  // 2. Add personality system
  if (includePersonality) {
    sections.push(generatePersonalityPrompt(context));
  }

  // 3. Add long-term memory context
  if (includeMemory && memoryContext && memoryContext.formatted) {
    sections.push('# YOUR MEMORIES OF THIS USER\n\n' + memoryContext.formatted);
  }

  // 4. Add proactive insights
  if (includeInsights && mode !== 'quick') {
    const insights = getCachedInsights();
    if (insights.length > 0) {
      sections.push(formatInsightsForPrompt(insights.slice(0, 5)));
    }
  }

  // 5. Add correlations and patterns
  if (includeCorrelations && mode === 'comprehensive') {
    const analysisPrompt = getAnalysisForPrompt();
    if (analysisPrompt !== 'No significant patterns detected yet.') {
      sections.push('# PATTERNS & CORRELATIONS DETECTED\n\n' + analysisPrompt);
    }
  }

  return sections.join('\n\n---\n\n');
}

// ============================================================================
// CHAT FUNCTIONS
// ============================================================================

/**
 * Send a message to Nova and get a response
 *
 * @param {string} message - The user's message
 * @param {Object} options - Configuration options
 * @returns {Promise<Object>} Response object
 */
export async function chat(message, options = {}) {
  const {
    mode = CONFIG.defaultMode,
    stream = CONFIG.enableStreaming,
    conversationHistory = [],
    conversationId = null,
    onStream = null, // Callback for streaming: (text) => void
    enableMemory = true, // Use long-term memory system
  } = options;

  try {
    // Detect if this is a simple query - skip heavy operations for instant response
    const isSimpleQuery = /^(hi|hey|hello|thanks|ok|yes|no|bye|what'?s up|how are you)[\s!?.]*$/i.test(message.trim());

    // Start all async operations in PARALLEL for speed
    const [sessionResult, memoryContextResult] = await Promise.all([
      // 1. Get auth session (fast, cached)
      supabase.auth.getSession(),

      // 2. Memory context - skip for simple queries, run in parallel otherwise
      (enableMemory && !isSimpleQuery && mode !== 'quick')
        ? getMemoryContext(message).catch(e => {
            console.warn('Memory retrieval failed:', e);
            return null;
          })
        : Promise.resolve(null),
    ]);

    const authToken = sessionResult.data?.session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY;
    const memoryContext = memoryContextResult;

    // Build system prompt (fast, client-side) - skip for simple queries
    // The edge function already has personality + user data, so we can send minimal prompt
    const systemPrompt = isSimpleQuery ? null : buildSystemPrompt({
      mode,
      userQuery: message,
      memoryContext,
    });

    // Prepare messages
    const messages = [
      ...conversationHistory,
      { role: 'user', content: message },
    ];

    // Store user message in background (don't wait)
    if (enableMemory) {
      storeMessage('user', message, conversationId).catch(() => {});
      trackMessage('user', message);
    }

    // Make request to edge function
    const response = await fetch(CONFIG.edgeFunctionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        messages,
        systemPrompt,
        stream,
        mode,
      }),
    });

    if (!response.ok) {
      // Try fallback
      return await chatFallback(systemPrompt, messages, stream, onStream);
    }

    // Handle streaming response
    if (stream && onStream) {
      const result = await handleStreamResponse(response, onStream);

      // Store assistant response in memory system and check for auto-extraction
      if (enableMemory && result.success && result.content) {
        storeMessage('assistant', result.content, conversationId).catch(e =>
          console.warn('Failed to store assistant message:', e)
        );
        trackMessage('assistant', result.content);

        // Check if we should auto-extract memories
        if (shouldExtractMemories(message)) {
          triggerAutoExtraction();
        }
      }

      return result;
    }

    // Handle regular response
    const data = await response.json();

    // Store assistant response in memory system and check for auto-extraction
    if (enableMemory && data.content) {
      storeMessage('assistant', data.content, conversationId).catch(e =>
        console.warn('Failed to store assistant message:', e)
      );
      trackMessage('assistant', data.content);

      // Check if we should auto-extract memories
      if (shouldExtractMemories(message)) {
        triggerAutoExtraction();
      }
    }

    return {
      success: true,
      content: data.content,
      model: data.model,
      mode: data.mode,
    };
  } catch (error) {
    console.error('Nova chat error:', error);
    return {
      success: false,
      error: error.message,
      content: "I'm having trouble connecting right now. Please try again in a moment.",
    };
  }
}

/**
 * Fallback to original edge function
 */
async function chatFallback(systemPrompt, messages, stream, onStream) {
  // Get user's actual session token
  const { data: { session } } = await supabase.auth.getSession();
  const authToken = session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY;

  const response = await fetch(CONFIG.fallbackUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`,
    },
    body: JSON.stringify({
      messages,
      system: systemPrompt,
      stream,
      userContext: generateContextSummary(getCachedContext()),
    }),
  });

  if (!response.ok) {
    throw new Error('Both Nova endpoints failed');
  }

  if (stream && onStream) {
    return await handleStreamResponse(response, onStream);
  }

  const data = await response.json();
  return {
    success: true,
    content: data.content,
    fallback: true,
  };
}

/**
 * Handle SSE streaming response
 */
async function handleStreamResponse(response, onStream) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let fullContent = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6).trim();

          if (data === '[DONE]') {
            continue;
          }

          try {
            const parsed = JSON.parse(data);
            if (parsed.text) {
              fullContent += parsed.text;
              onStream(parsed.text);
            }
            if (parsed.error) {
              console.error('Stream error:', parsed.error);
            }
          } catch (e) {
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
  } catch (error) {
    console.error('Stream read error:', error);
    return {
      success: false,
      error: error.message,
      content: fullContent || "Stream interrupted.",
    };
  }
}

/**
 * Quick chat - fast response for simple queries
 */
export async function quickChat(message, onStream = null) {
  return chat(message, {
    mode: 'quick',
    stream: !!onStream,
    onStream,
  });
}

// ============================================================================
// PROACTIVE FEATURES
// ============================================================================

/**
 * Get Nova's current insights about the user
 */
export function getInsights() {
  return getCachedInsights();
}

/**
 * Get only urgent insights (things that need immediate attention)
 */
export function getUrgent() {
  return getUrgentInsights();
}

/**
 * Get recommendations based on pattern analysis
 */
export function getActionableRecommendations() {
  return getRecommendations();
}

/**
 * Get Nova's analysis of user data patterns
 */
export function getPatternAnalysis() {
  return analyzeUserData();
}

/**
 * Get a natural language explanation of any metric
 */
export function explain(metricKey, value, additionalContext = {}) {
  return explainMetricNaturally(metricKey, value, additionalContext);
}

/**
 * Get a full explanation object for a metric
 */
export function explainFull(metricKey, value, additionalContext = {}) {
  return explainMetric(metricKey, value, additionalContext);
}

/**
 * Get Nova's current stage/evolution
 */
export function getStage() {
  const context = getCachedContext();
  return getCurrentStage(context.gamification.level);
}

/**
 * Detect user's emotional state
 */
export function getEmotionalState() {
  const context = getCachedContext();
  return detectEmotionalState(context);
}

/**
 * Get a life summary for the user
 */
export function getLifeSummary() {
  return generateLifeSummary();
}

// ============================================================================
// GREETING & PROACTIVE MESSAGES
// ============================================================================

/**
 * Get an appropriate greeting based on time and context
 */
export function getGreeting() {
  const context = getCachedContext();
  const stage = getCurrentStage(context.gamification.level);
  const hour = new Date().getHours();

  let timeGreeting;
  if (hour >= 5 && hour < 12) timeGreeting = stage.greetings.morning;
  else if (hour >= 12 && hour < 17) timeGreeting = stage.greetings.afternoon;
  else if (hour >= 17 && hour < 22) timeGreeting = stage.greetings.evening;
  else timeGreeting = stage.greetings.night;

  return {
    greeting: timeGreeting,
    stage: stage.name,
    avatar: stage.avatar,
  };
}

/**
 * Get a proactive message Nova might say unprompted
 */
export function getProactiveMessage() {
  const insights = getUrgent();

  if (insights.length > 0) {
    const top = insights[0];
    return {
      type: 'urgent',
      title: top.title,
      message: top.message,
      action: top.action,
    };
  }

  // No urgent items - check for celebrations
  const allInsights = getCachedInsights();
  const celebrations = allInsights.filter((i) => i.celebratory);

  if (celebrations.length > 0) {
    const celebration = celebrations[0];
    return {
      type: 'celebration',
      title: celebration.title,
      message: celebration.message,
    };
  }

  // Nothing proactive - return greeting
  return {
    type: 'greeting',
    ...getGreeting(),
  };
}

// ============================================================================
// MEMORY FUNCTIONS
// ============================================================================

/**
 * Trigger memory extraction from recent conversation
 * Call this when a conversation ends or after significant exchanges
 *
 * @param {Array} recentMessages - Array of {role, content} messages
 * @returns {Promise<Object>} Extraction result
 */
export async function learnFromConversation(recentMessages) {
  try {
    if (!recentMessages || recentMessages.length < 2) {
      return { success: false, message: 'Not enough messages to learn from' };
    }

    const extracted = await extractMemoriesFromConversation(recentMessages);
    return {
      success: true,
      memoriesExtracted: extracted.length,
      memories: extracted,
    };
  } catch (error) {
    console.error('Failed to learn from conversation:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Manually teach Nova a fact about the user
 *
 * @param {string} fact - The fact to remember
 * @param {string} type - Memory type: 'profile', 'semantic', 'procedural', 'episodic'
 */
export async function teachNova(fact, type = 'semantic') {
  const { rememberFact } = await import('./memoryService');
  return rememberFact(fact, type);
}

/**
 * Get Nova's memory statistics
 */
export async function getMemoryStats() {
  const { getMemoryStats: getStats } = await import('./memoryService');
  return getStats();
}

// ============================================================================
// STORAGE & LEARNING
// ============================================================================

/**
 * Record an interaction for Nova to learn from
 */
export async function recordInteraction(type, data) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return;

    await supabase.from('nova_interactions').insert({
      user_id: userId,
      interaction_type: type,
      data,
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    console.warn('Failed to record interaction:', error);
  }
}

/**
 * Record user feedback on Nova's response
 */
export async function recordFeedback(responseId, feedback) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return;

    await supabase.from('nova_feedback').insert({
      user_id: userId,
      response_id: responseId,
      feedback, // 'helpful', 'not_helpful', 'wrong'
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    console.warn('Failed to record feedback:', error);
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export const novaService = {
  // Core chat
  chat,
  quickChat,
  buildSystemPrompt,

  // Insights & Analysis
  getInsights,
  getUrgent,
  getActionableRecommendations,
  getPatternAnalysis,

  // Explanations
  explain,
  explainFull,
  getLifeSummary,

  // Personality & State
  getStage,
  getEmotionalState,
  getGreeting,
  getProactiveMessage,

  // Storage & Learning
  recordInteraction,
  recordFeedback,
  invalidateCaches,
  resetConversationTracking,

  // Memory System
  learnFromConversation,
  teachNova,
  getMemoryStats,

  // Sub-services (for advanced usage)
  masterBrain,
  dataExplainer,
  proactiveInsights,
  personality,
  correlationEngine,
  memoryService,
};

export default novaService;
