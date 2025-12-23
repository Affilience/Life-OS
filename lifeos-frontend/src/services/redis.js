/**
 * Redis Service for LifeOS
 * Uses Upstash Redis for leaderboards and caching
 *
 * SECURITY: User IDs are hashed before use in cache keys to prevent:
 * - Enumeration attacks (guessing user IDs)
 * - Cache key prediction
 */

const REDIS_URL = 'redis://default:AZPyAAIncDJmYjY1OWFjNDQ2MTk0ZThhOGMzZDhjYjhjNDBmNmY4M3AyMzc4NzQ@major-ghoul-37874.upstash.io:6379';

// Simple hash function for cache key security (not cryptographic, just obfuscation)
// Uses djb2 algorithm - fast and gives good distribution
function hashUserId(userId) {
  if (!userId) return 'anonymous';
  let hash = 5381;
  for (let i = 0; i < userId.length; i++) {
    hash = ((hash << 5) + hash) + userId.charCodeAt(i);
    hash = hash & hash; // Convert to 32-bit integer
  }
  // Convert to hex string with prefix for readability
  return 'u_' + Math.abs(hash).toString(16);
}

// Parse Redis URL for REST API
const getRestConfig = () => {
  // Upstash REST API endpoint
  const baseUrl = 'https://major-ghoul-37874.upstash.io';
  const token = 'AZPyAAIncDJmYjY1OWFjNDQ2MTk0ZThhOGMzZDhjYjhjNDBmNmY4M3AyMzc4NzQ';
  return { baseUrl, token };
};

const { baseUrl, token } = getRestConfig();

/**
 * Execute a Redis command via Upstash REST API with timeout
 */
async function redisCommand(command, ...args) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

  try {
    const response = await fetch(`${baseUrl}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([command, ...args]),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Redis error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.result;
  } catch (error) {
    clearTimeout(timeoutId);
    // Log warning only once per minute to avoid console spam
    const now = Date.now();
    const lastWarning = redisCommand._lastWarning || 0;
    if (now - lastWarning > 60000) {
      if (error.name === 'AbortError') {
        console.warn('[Redis] Command timed out - leaderboards/presence may be unavailable');
      } else {
        console.warn('[Redis] Connection issue:', error.message);
      }
      redisCommand._lastWarning = now;
    }
    // Return null instead of throwing - allows graceful degradation
    return null;
  }
}

/**
 * Pipeline multiple commands for efficiency with timeout
 */
async function redisPipeline(commands) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout for pipeline

  try {
    const response = await fetch(`${baseUrl}/pipeline`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(commands),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Redis pipeline error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.map(r => r.result);
  } catch (error) {
    clearTimeout(timeoutId);
    // Log warning only once per minute to avoid console spam
    const now = Date.now();
    const lastWarning = redisPipeline._lastWarning || 0;
    if (now - lastWarning > 60000) {
      console.warn('[Redis] Pipeline issue - leaderboards may be unavailable');
      redisPipeline._lastWarning = now;
    }
    // Return empty array instead of throwing
    return commands.map(() => null);
  }
}

// ============================================
// LEADERBOARD OPERATIONS
// ============================================

const LEADERBOARD_KEYS = {
  GLOBAL_XP: 'leaderboard:global:xp',
  WEEKLY_XP: 'leaderboard:weekly:xp',
  MONTHLY_XP: 'leaderboard:monthly:xp',
  STREAK: 'leaderboard:streak',
  GUILD_XP: 'leaderboard:guild:xp',
};

/**
 * Update a user's score on a leaderboard
 */
export async function updateLeaderboardScore(leaderboardKey, userId, score) {
  return redisCommand('ZADD', leaderboardKey, score, userId);
}

/**
 * Increment a user's score on a leaderboard
 */
export async function incrementLeaderboardScore(leaderboardKey, userId, increment) {
  return redisCommand('ZINCRBY', leaderboardKey, increment, userId);
}

/**
 * Get a user's rank on a leaderboard (0-indexed, lower is better)
 */
export async function getLeaderboardRank(leaderboardKey, userId) {
  const rank = await redisCommand('ZREVRANK', leaderboardKey, userId);
  return rank !== null ? rank + 1 : null; // Convert to 1-indexed
}

/**
 * Get a user's score on a leaderboard
 */
export async function getLeaderboardScore(leaderboardKey, userId) {
  const score = await redisCommand('ZSCORE', leaderboardKey, userId);
  return score !== null ? parseFloat(score) : 0;
}

/**
 * Get top N users from a leaderboard
 */
export async function getLeaderboardTop(leaderboardKey, count = 100) {
  const results = await redisCommand('ZREVRANGE', leaderboardKey, '0', String(count - 1), 'WITHSCORES');

  // Handle null/undefined results (Redis unavailable or timeout)
  if (!results || !Array.isArray(results)) {
    return [];
  }

  // Parse results into array of {userId, score}
  const entries = [];
  for (let i = 0; i < results.length; i += 2) {
    entries.push({
      userId: results[i],
      score: parseFloat(results[i + 1]),
      rank: Math.floor(i / 2) + 1,
    });
  }
  return entries;
}

/**
 * Get users around a specific user (for context)
 */
export async function getLeaderboardAround(leaderboardKey, userId, range = 5) {
  const rank = await redisCommand('ZREVRANK', leaderboardKey, userId);
  if (rank === null) return [];

  const start = Math.max(0, rank - range);
  const end = rank + range;

  const results = await redisCommand('ZREVRANGE', leaderboardKey, String(start), String(end), 'WITHSCORES');

  const entries = [];
  for (let i = 0; i < results.length; i += 2) {
    entries.push({
      userId: results[i],
      score: parseFloat(results[i + 1]),
      rank: start + Math.floor(i / 2) + 1,
    });
  }
  return entries;
}

/**
 * Get total number of users on a leaderboard
 */
export async function getLeaderboardCount(leaderboardKey) {
  return redisCommand('ZCARD', leaderboardKey);
}

/**
 * Remove a user from a leaderboard
 */
export async function removeFromLeaderboard(leaderboardKey, userId) {
  return redisCommand('ZREM', leaderboardKey, userId);
}

// ============================================
// USER XP OPERATIONS
// ============================================

/**
 * Update user XP across all relevant leaderboards
 */
export async function updateUserXP(userId, totalXP, xpGained = 0) {
  const commands = [
    ['ZADD', LEADERBOARD_KEYS.GLOBAL_XP, totalXP, userId],
  ];

  // Also increment weekly and monthly if XP was gained
  if (xpGained > 0) {
    commands.push(
      ['ZINCRBY', LEADERBOARD_KEYS.WEEKLY_XP, xpGained, userId],
      ['ZINCRBY', LEADERBOARD_KEYS.MONTHLY_XP, xpGained, userId]
    );
  }

  return redisPipeline(commands);
}

/**
 * Update user streak
 */
export async function updateUserStreak(userId, streakDays) {
  return redisCommand('ZADD', LEADERBOARD_KEYS.STREAK, streakDays, userId);
}

/**
 * Update guild XP
 */
export async function updateGuildXP(guildId, totalXP) {
  return redisCommand('ZADD', LEADERBOARD_KEYS.GUILD_XP, totalXP, guildId);
}

// ============================================
// CACHING OPERATIONS
// ============================================

/**
 * Set a cached value with optional TTL
 */
export async function setCache(key, value, ttlSeconds = null) {
  const serialized = JSON.stringify(value);
  if (ttlSeconds) {
    return redisCommand('SETEX', key, ttlSeconds, serialized);
  }
  return redisCommand('SET', key, serialized);
}

/**
 * Get a cached value
 */
export async function getCache(key) {
  const value = await redisCommand('GET', key);
  if (value === null) return null;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

/**
 * Delete a cached value
 */
export async function deleteCache(key) {
  return redisCommand('DEL', key);
}

/**
 * Check if a key exists
 */
export async function cacheExists(key) {
  const result = await redisCommand('EXISTS', key);
  return result === 1;
}

// ============================================
// PRESENCE / ONLINE STATUS
// ============================================

const ONLINE_USERS_KEY = 'presence:online';
const PRESENCE_TTL = 300; // 5 minutes

/**
 * Mark user as online
 */
export async function setUserOnline(userId) {
  const now = Date.now();
  return redisCommand('ZADD', ONLINE_USERS_KEY, now, userId);
}

/**
 * Mark user as offline
 */
export async function setUserOffline(userId) {
  return redisCommand('ZREM', ONLINE_USERS_KEY, userId);
}

/**
 * Get online users (active in last 5 minutes)
 */
export async function getOnlineUsers() {
  const cutoff = Date.now() - (PRESENCE_TTL * 1000);
  return redisCommand('ZRANGEBYSCORE', ONLINE_USERS_KEY, cutoff, '+inf');
}

/**
 * Check if a specific user is online
 */
export async function isUserOnline(userId) {
  const cutoff = Date.now() - (PRESENCE_TTL * 1000);
  const score = await redisCommand('ZSCORE', ONLINE_USERS_KEY, userId);
  return score !== null && parseFloat(score) > cutoff;
}

/**
 * Clean up stale presence entries
 */
export async function cleanupPresence() {
  const cutoff = Date.now() - (PRESENCE_TTL * 1000);
  return redisCommand('ZREMRANGEBYSCORE', ONLINE_USERS_KEY, '-inf', cutoff);
}

// ============================================
// SEMANTIC CACHING FOR NOVA AI
// ============================================

const SEMANTIC_CACHE_KEY = 'nova:semantic';
const SEMANTIC_CACHE_TTL = 300; // 5 minutes

/**
 * Simple hash function for query normalization
 * Creates a deterministic hash for similar queries
 */
function hashQuery(query) {
  // Normalize: lowercase, remove extra spaces, sort words for similarity
  const normalized = query
    .toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .replace(/\s+/g, ' ')    // Normalize spaces
    .trim();

  // Simple hash
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    const char = normalized.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Extract key terms from a query for similarity matching
 */
function extractQueryTerms(query) {
  const stopWords = new Set([
    'a', 'an', 'the', 'is', 'are', 'was', 'were', 'am', 'be', 'been',
    'i', 'me', 'my', 'you', 'your', 'we', 'our', 'they', 'their',
    'what', 'how', 'why', 'when', 'where', 'who', 'which',
    'can', 'could', 'would', 'should', 'will', 'do', 'does', 'did',
    'have', 'has', 'had', 'to', 'of', 'in', 'for', 'on', 'with',
    'at', 'by', 'from', 'up', 'about', 'into', 'through', 'during',
    'and', 'or', 'but', 'if', 'then', 'so', 'just', 'also', 'too',
    'please', 'tell', 'show', 'give', 'help', 'me', 'know',
  ]);

  return query
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.has(word))
    .sort()
    .slice(0, 8); // Max 8 key terms
}

/**
 * Generate a semantic key based on query intent and key terms
 * SECURITY: userId is hashed to prevent cache key enumeration
 */
function generateSemanticKey(query, userId) {
  if (!userId) {
    console.warn('generateSemanticKey called without userId');
    return null;
  }
  const terms = extractQueryTerms(query);
  const queryHash = hashQuery(query);
  const hashedUserId = hashUserId(userId); // Hash userId for security

  // Create a key that groups similar queries
  const termKey = terms.join('_') || 'general';
  return `${SEMANTIC_CACHE_KEY}:${hashedUserId}:${termKey}:${queryHash}`;
}

/**
 * Find similar cached responses
 * Returns cached response if a similar query was recently asked
 */
export async function findSimilarCachedResponse(query, userId) {
  if (!userId) {
    console.warn('findSimilarCachedResponse called without userId - skipping cache');
    return null;
  }
  try {
    const terms = extractQueryTerms(query);
    if (terms.length === 0) return null;

    // Try exact semantic key first
    const exactKey = generateSemanticKey(query, userId);
    const exactMatch = await getCache(exactKey);
    if (exactMatch) {
      return { ...exactMatch, matchType: 'exact' };
    }

    // Try term-based key (without hash) for broader matching
    const hashedUserId = hashUserId(userId);
    const termKey = `${SEMANTIC_CACHE_KEY}:${hashedUserId}:${terms.join('_')}`;

    // Get all keys matching this pattern using SCAN
    // Since Upstash doesn't support SCAN well via REST, we'll use a different approach:
    // Store a list of query hashes under the term key
    const termIndex = await getCache(termKey);
    if (termIndex && Array.isArray(termIndex.hashes)) {
      // Try each cached hash
      for (const hash of termIndex.hashes.slice(-5)) { // Check last 5 similar queries
        const cachedKey = `${SEMANTIC_CACHE_KEY}:${hashedUserId}:${terms.join('_')}:${hash}`;
        const cached = await getCache(cachedKey);
        if (cached && Date.now() - cached.timestamp < SEMANTIC_CACHE_TTL * 1000) {
          return { ...cached, matchType: 'similar' };
        }
      }
    }

    return null;
  } catch (error) {
    console.warn('Semantic cache lookup failed:', error);
    return null;
  }
}

/**
 * Cache a Nova response with semantic indexing
 */
export async function cacheSemanticResponse(query, response, userId) {
  if (!userId) {
    console.warn('cacheSemanticResponse called without userId - skipping cache');
    return false;
  }
  try {
    const terms = extractQueryTerms(query);
    const queryHash = hashQuery(query);
    const semanticKey = generateSemanticKey(query, userId);

    const cacheEntry = {
      query,
      response,
      userId,
      timestamp: Date.now(),
      terms,
    };

    // Store the response
    await setCache(semanticKey, cacheEntry, SEMANTIC_CACHE_TTL);

    // Update the term index for similarity matching
    if (terms.length > 0) {
      const hashedUserId = hashUserId(userId);
      const termKey = `${SEMANTIC_CACHE_KEY}:${hashedUserId}:${terms.join('_')}`;
      const existingIndex = await getCache(termKey) || { hashes: [] };

      // Add this hash to the index (keep last 10)
      const hashes = [...existingIndex.hashes, queryHash].slice(-10);
      await setCache(termKey, { hashes }, SEMANTIC_CACHE_TTL);
    }

    return true;
  } catch (error) {
    console.warn('Semantic cache write failed:', error);
    return false;
  }
}

/**
 * Clear semantic cache for a user (call after significant data changes)
 */
export async function clearSemanticCache(userId) {
  if (!userId) {
    console.warn('clearSemanticCache called without userId - skipping');
    return false;
  }
  // Since we can't easily scan keys, we'll just let them expire
  // For more aggressive clearing, we'd need to track keys in a set
  console.log(`Semantic cache will expire naturally for user ${userId}`);
  return true;
}

// ============================================
// NOVA CONTEXT CACHING
// ============================================

const CONTEXT_CACHE_KEY = 'nova:context';
const CONTEXT_CACHE_TTL = 60; // 1 minute - context changes frequently

/**
 * Cache user's context summary
 * SECURITY: userId is hashed in cache key
 */
export async function cacheContextSummary(userId, summary) {
  const hashedUserId = hashUserId(userId);
  const key = `${CONTEXT_CACHE_KEY}:${hashedUserId}`;
  return setCache(key, summary, CONTEXT_CACHE_TTL);
}

/**
 * Get cached context summary
 * SECURITY: userId is hashed in cache key
 */
export async function getCachedContextSummary(userId) {
  const hashedUserId = hashUserId(userId);
  const key = `${CONTEXT_CACHE_KEY}:${hashedUserId}`;
  return getCache(key);
}

/**
 * Invalidate context cache (call when user data changes)
 * SECURITY: userId is hashed in cache key
 */
export async function invalidateContextCache(userId) {
  const hashedUserId = hashUserId(userId);
  const key = `${CONTEXT_CACHE_KEY}:${hashedUserId}`;
  return deleteCache(key);
}

// ============================================
// RATE LIMITING
// ============================================

/**
 * Check and increment rate limit
 * Returns true if within limit, false if exceeded
 */
export async function checkRateLimit(key, maxRequests, windowSeconds) {
  const now = Date.now();
  const windowStart = now - (windowSeconds * 1000);

  // Remove old entries and count recent ones
  await redisCommand('ZREMRANGEBYSCORE', key, '-inf', windowStart);
  const count = await redisCommand('ZCARD', key);

  if (count >= maxRequests) {
    return false;
  }

  // Add this request
  await redisCommand('ZADD', key, now, `${now}-${Math.random()}`);
  await redisCommand('EXPIRE', key, windowSeconds);

  return true;
}

// ============================================
// EXPORT LEADERBOARD KEYS
// ============================================

export { LEADERBOARD_KEYS };

export default {
  updateLeaderboardScore,
  incrementLeaderboardScore,
  getLeaderboardRank,
  getLeaderboardScore,
  getLeaderboardTop,
  getLeaderboardAround,
  getLeaderboardCount,
  removeFromLeaderboard,
  updateUserXP,
  updateUserStreak,
  updateGuildXP,
  setCache,
  getCache,
  deleteCache,
  cacheExists,
  setUserOnline,
  setUserOffline,
  getOnlineUsers,
  isUserOnline,
  cleanupPresence,
  checkRateLimit,
  // Semantic caching for Nova AI
  findSimilarCachedResponse,
  cacheSemanticResponse,
  clearSemanticCache,
  // Context caching
  cacheContextSummary,
  getCachedContextSummary,
  invalidateContextCache,
  LEADERBOARD_KEYS,
};
