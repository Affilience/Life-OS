/**
 * Nova Offline Mode & Error Handling
 *
 * Provides graceful degradation when:
 * 1. Network is unavailable
 * 2. API rate limits are hit
 * 3. Server errors occur
 *
 * Features:
 * - Cached responses for common queries
 * - Exponential backoff for retries
 * - Offline-friendly fallback messages
 * - Rate limit awareness
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  // Retry settings
  maxRetries: 3,
  baseRetryDelayMs: 1000,
  maxRetryDelayMs: 30000,

  // Rate limiting
  rateLimitWindowMs: 60 * 1000, // 1 minute
  maxRequestsPerWindow: 30,

  // Cache settings
  offlineCacheTTLMs: 24 * 60 * 60 * 1000, // 24 hours
};

// ============================================================================
// NETWORK STATUS
// ============================================================================

let isOnline = navigator.onLine;
let networkListenersAttached = false;

/**
 * Initialize network status listeners
 */
export function initNetworkListeners() {
  if (networkListenersAttached) return;

  window.addEventListener('online', () => {
    isOnline = true;
    console.log('Nova: Network connection restored');
    dispatchNetworkEvent('online');
  });

  window.addEventListener('offline', () => {
    isOnline = false;
    console.log('Nova: Network connection lost');
    dispatchNetworkEvent('offline');
  });

  networkListenersAttached = true;
}

function dispatchNetworkEvent(status) {
  window.dispatchEvent(new CustomEvent('nova-network-status', {
    detail: { status, timestamp: Date.now() }
  }));
}

/**
 * Check if we're online
 */
export function checkOnline() {
  return isOnline && navigator.onLine;
}

// ============================================================================
// RATE LIMITING
// ============================================================================

const requestLog = [];

/**
 * Check if we're rate limited
 */
export function isRateLimited() {
  const now = Date.now();
  const windowStart = now - CONFIG.rateLimitWindowMs;

  // Clean old entries
  while (requestLog.length > 0 && requestLog[0] < windowStart) {
    requestLog.shift();
  }

  return requestLog.length >= CONFIG.maxRequestsPerWindow;
}

/**
 * Log a request for rate limiting
 */
export function logRequest() {
  requestLog.push(Date.now());
}

/**
 * Get time until rate limit resets
 */
export function getTimeUntilReset() {
  if (requestLog.length === 0) return 0;

  const oldestInWindow = requestLog[0];
  const resetTime = oldestInWindow + CONFIG.rateLimitWindowMs;
  const remaining = resetTime - Date.now();

  return Math.max(0, remaining);
}

// ============================================================================
// RETRY LOGIC
// ============================================================================

/**
 * Execute a function with exponential backoff retry
 */
export async function withRetry(fn, options = {}) {
  const {
    maxRetries = CONFIG.maxRetries,
    baseDelay = CONFIG.baseRetryDelayMs,
    maxDelay = CONFIG.maxRetryDelayMs,
    shouldRetry = (error) => true,
  } = options;

  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Check if we should retry
      if (attempt === maxRetries || !shouldRetry(error)) {
        throw error;
      }

      // Calculate delay with exponential backoff + jitter
      const exponentialDelay = baseDelay * Math.pow(2, attempt);
      const jitter = Math.random() * 0.3 * exponentialDelay;
      const delay = Math.min(exponentialDelay + jitter, maxDelay);

      console.log(`Nova: Retry attempt ${attempt + 1}/${maxRetries} after ${Math.round(delay)}ms`);
      await sleep(delay);
    }
  }

  throw lastError;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Determine if an error is retryable
 */
export function isRetryableError(error) {
  // Network errors
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return true;
  }

  // Rate limit (429)
  if (error.status === 429) {
    return true;
  }

  // Server errors (5xx)
  if (error.status >= 500 && error.status < 600) {
    return true;
  }

  // Timeout
  if (error.name === 'AbortError' || error.message?.includes('timeout')) {
    return true;
  }

  return false;
}

// ============================================================================
// OFFLINE RESPONSE CACHE
// ============================================================================

const CACHE_KEY = 'nova_offline_cache';

/**
 * Get cached responses
 */
function getOfflineCache() {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return {};

    const parsed = JSON.parse(cached);

    // Clean expired entries
    const now = Date.now();
    const cleaned = {};
    Object.entries(parsed).forEach(([key, entry]) => {
      if (entry.expiresAt > now) {
        cleaned[key] = entry;
      }
    });

    return cleaned;
  } catch {
    return {};
  }
}

/**
 * Save to offline cache
 */
function saveOfflineCache(cache) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch (e) {
    console.warn('Failed to save offline cache:', e);
  }
}

/**
 * Cache a response for offline use
 */
export function cacheForOffline(query, response) {
  const cache = getOfflineCache();
  const key = normalizeQuery(query);

  cache[key] = {
    response,
    cachedAt: Date.now(),
    expiresAt: Date.now() + CONFIG.offlineCacheTTLMs,
  };

  saveOfflineCache(cache);
}

/**
 * Get cached response for offline use
 */
export function getOfflineResponse(query) {
  const cache = getOfflineCache();
  const key = normalizeQuery(query);

  const entry = cache[key];
  if (entry && entry.expiresAt > Date.now()) {
    return entry.response;
  }

  return null;
}

function normalizeQuery(query) {
  return query.toLowerCase().trim().replace(/[^\w\s]/g, '').slice(0, 100);
}

// ============================================================================
// FALLBACK RESPONSES
// ============================================================================

const FALLBACK_RESPONSES = {
  offline: [
    "I'm having trouble connecting right now. Your data is still being tracked locally, and I'll sync up once we're back online.",
    "Looks like we're offline. Don't worry - everything you do is saved and I'll catch up when the connection returns.",
    "Can't reach my brain at the moment (network issue). Keep going though - your progress is safe!",
  ],

  rate_limited: [
    "I need a quick breather - too many messages too fast. Give me a minute and try again?",
    "Whoa, slow down! I'm getting overwhelmed. Let's take a brief pause.",
    "Rate limit hit - I can only process so many messages per minute. Back in a sec!",
  ],

  server_error: [
    "Something went wrong on my end. Try again in a moment?",
    "I hit a snag. Give me a second to sort things out.",
    "Technical difficulties - but I'll be back shortly!",
  ],

  timeout: [
    "That's taking longer than expected. Want to try a simpler question?",
    "I'm thinking really hard about this one... maybe too hard. Let me try again.",
    "Request timed out. Let's give it another shot.",
  ],

  generic: [
    "I'm having some trouble right now. Try again in a moment?",
    "Something's not quite right. Let's try that again.",
    "Hmm, that didn't work. Give it another go?",
  ],
};

/**
 * Get a fallback response for an error type
 */
export function getFallbackResponse(errorType = 'generic') {
  const responses = FALLBACK_RESPONSES[errorType] || FALLBACK_RESPONSES.generic;
  const index = Math.floor(Math.random() * responses.length);
  return responses[index];
}

/**
 * Determine error type from error object
 */
export function categorizeError(error) {
  if (!checkOnline()) {
    return 'offline';
  }

  if (error.status === 429 || isRateLimited()) {
    return 'rate_limited';
  }

  if (error.status >= 500) {
    return 'server_error';
  }

  if (error.name === 'AbortError' || error.message?.includes('timeout')) {
    return 'timeout';
  }

  return 'generic';
}

// ============================================================================
// ERROR HANDLING WRAPPER
// ============================================================================

/**
 * Wrap a Nova API call with full error handling
 */
export async function withErrorHandling(apiCall, query = '') {
  // Check network first
  if (!checkOnline()) {
    const cached = getOfflineResponse(query);
    if (cached) {
      return { success: true, content: cached, fromCache: true, offline: true };
    }
    return {
      success: false,
      content: getFallbackResponse('offline'),
      error: 'offline',
      offline: true,
    };
  }

  // Check rate limit
  if (isRateLimited()) {
    return {
      success: false,
      content: getFallbackResponse('rate_limited'),
      error: 'rate_limited',
      retryAfterMs: getTimeUntilReset(),
    };
  }

  try {
    logRequest();

    const result = await withRetry(apiCall, {
      shouldRetry: isRetryableError,
    });

    // Cache successful response
    if (result.content) {
      cacheForOffline(query, result.content);
    }

    return { success: true, ...result };
  } catch (error) {
    const errorType = categorizeError(error);

    // Try offline cache as last resort
    const cached = getOfflineResponse(query);
    if (cached) {
      return {
        success: true,
        content: cached,
        fromCache: true,
        hadError: true,
      };
    }

    return {
      success: false,
      content: getFallbackResponse(errorType),
      error: errorType,
      originalError: error.message,
    };
  }
}

// ============================================================================
// PROACTIVE STATUS MESSAGES
// ============================================================================

/**
 * Get a status message for the current state
 */
export function getStatusMessage() {
  if (!checkOnline()) {
    return {
      type: 'warning',
      message: "You're offline. I'll sync up when you reconnect.",
    };
  }

  if (isRateLimited()) {
    const resetIn = Math.ceil(getTimeUntilReset() / 1000);
    return {
      type: 'info',
      message: `Cooling down... try again in ${resetIn}s`,
    };
  }

  return null;
}

// ============================================================================
// EXPORTS
// ============================================================================

export const offlineMode = {
  // Network
  initNetworkListeners,
  checkOnline,

  // Rate limiting
  isRateLimited,
  logRequest,
  getTimeUntilReset,

  // Retry
  withRetry,
  isRetryableError,

  // Cache
  cacheForOffline,
  getOfflineResponse,

  // Fallbacks
  getFallbackResponse,
  categorizeError,

  // Main wrapper
  withErrorHandling,

  // Status
  getStatusMessage,
};

export default offlineMode;
