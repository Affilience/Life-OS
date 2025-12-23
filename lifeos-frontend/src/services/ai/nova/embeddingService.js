/**
 * Nova Embedding Service
 *
 * Handles all embedding operations:
 * - Generate embeddings via Supabase Edge Function
 * - Store embeddings with proper metadata
 * - Semantic search with relevance scoring
 * - Batch operations for efficiency
 *
 * NOTE: This service requires:
 * - OPENAI_API_KEY set in Supabase Edge Function secrets
 * - nova_memory_embeddings table in database
 * - search_nova_memories database function
 *
 * If not configured, all operations will gracefully return null/empty results.
 */

import { supabase, getCurrentUserId } from '../../../lib/supabase';
import { checkRateLimit } from '../../redis';

// Embedding dimensions for text-embedding-ada-002
const EMBEDDING_DIMENSIONS = 1536;

// Cache for recent embeddings to avoid redundant API calls
const embeddingCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Track if embedding service is available (avoid repeated error logs)
let embeddingServiceAvailable = true;
let consecutiveFailures = 0;
let lastAvailabilityCheck = 0;
const AVAILABILITY_CHECK_INTERVAL = 30 * 1000; // Re-check every 30 seconds
const MAX_CONSECUTIVE_FAILURES = 3; // Only mark unavailable after 3 failures

/**
 * Check if embedding service should be attempted
 * Prevents spamming errors when service is not configured
 */
function shouldAttemptEmbedding() {
  const now = Date.now();
  if (!embeddingServiceAvailable && now - lastAvailabilityCheck < AVAILABILITY_CHECK_INTERVAL) {
    return false;
  }
  // Reset availability check for retry
  if (!embeddingServiceAvailable) {
    lastAvailabilityCheck = now;
  }
  return true;
}

/**
 * Mark service as having a failure
 * Only marks fully unavailable after multiple consecutive failures
 */
function markServiceFailure(isConfigError = false) {
  consecutiveFailures++;

  // If it's a config error (missing API key), mark unavailable immediately
  if (isConfigError) {
    if (embeddingServiceAvailable) {
      console.warn('Nova embedding service is not available. This feature requires OPENAI_API_KEY to be configured in Supabase Edge Functions.');
    }
    embeddingServiceAvailable = false;
    lastAvailabilityCheck = Date.now();
    return;
  }

  // For transient errors, only mark unavailable after multiple failures
  if (consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
    if (embeddingServiceAvailable) {
      console.warn(`Nova embedding service temporarily unavailable after ${consecutiveFailures} consecutive failures. Will retry in ${AVAILABILITY_CHECK_INTERVAL / 1000}s.`);
    }
    embeddingServiceAvailable = false;
    lastAvailabilityCheck = Date.now();
  }
}

/**
 * Mark service as available again
 */
function markServiceAvailable() {
  embeddingServiceAvailable = true;
  consecutiveFailures = 0;
}

/**
 * Check if error indicates missing API key configuration
 */
function isConfigurationError(error) {
  if (!error) return false;
  const errorStr = typeof error === 'string' ? error : (error.message || JSON.stringify(error));
  return errorStr.includes('not configured') ||
         errorStr.includes('API key') ||
         errorStr.includes('OPENAI_API_KEY');
}

/**
 * Retry wrapper for transient failures
 */
async function withRetry(fn, maxRetries = 2, delayMs = 500) {
  let lastError;
  for (let i = 0; i <= maxRetries; i++) {
    try {
      const result = await fn();
      return result;
    } catch (error) {
      lastError = error;
      // Don't retry configuration errors
      if (isConfigurationError(error)) throw error;
      // Wait before retry (with exponential backoff)
      if (i < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delayMs * Math.pow(2, i)));
      }
    }
  }
  throw lastError;
}

/**
 * Generate embedding for text via Edge Function
 */
export async function generateEmbedding(text) {
  if (!text || text.trim().length === 0) {
    return null;
  }

  // Skip if service is known to be unavailable
  if (!shouldAttemptEmbedding()) {
    return null;
  }

  // Rate limiting: 60 embeddings per minute (OpenAI API cost control)
  const userId = await getCurrentUserId();
  if (userId) {
    const rateLimitKey = `nova:embeddings:${userId}`;
    const allowed = await checkRateLimit(rateLimitKey, 60, 60);
    if (!allowed) {
      console.warn(`Embedding rate limit exceeded for user ${userId}`);
      return null;
    }
  }

  // Check cache first
  const cacheKey = text.slice(0, 200); // Use first 200 chars as key
  const cached = embeddingCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.embedding;
  }

  try {
    const { data, error } = await supabase.functions.invoke('nova-embeddings', {
      body: {
        action: 'embed',
        text: text.slice(0, 8000) // API limit
      }
    });

    if (error) {
      // Check if it's a configuration error vs transient error
      markServiceFailure(isConfigurationError(error));
      return null;
    }

    // Check if response indicates configuration error
    if (data?.error && isConfigurationError(data.error)) {
      markServiceFailure(true);
      return null;
    }

    // Service is working
    markServiceAvailable();

    // Cache the result
    embeddingCache.set(cacheKey, {
      embedding: data.embedding,
      timestamp: Date.now()
    });

    return data.embedding;
  } catch (error) {
    markServiceFailure(isConfigurationError(error));
    return null;
  }
}

/**
 * Store content with embedding
 */
export async function storeWithEmbedding(content, contentType, metadata = {}, importance = 1) {
  // Skip if service is known to be unavailable
  if (!shouldAttemptEmbedding()) {
    return null;
  }

  const userId = await getCurrentUserId();
  if (!userId) return null;

  try {
    const { data, error } = await supabase.functions.invoke('nova-embeddings', {
      body: {
        action: 'embed_and_store',
        text: content,
        userId,
        contentType,
        metadata: {
          ...metadata,
          storedAt: new Date().toISOString()
        }
      }
    });

    if (error) {
      markServiceFailure(isConfigurationError(error));
      return null;
    }

    // Check if response indicates configuration error
    if (data?.error && isConfigurationError(data.error)) {
      markServiceFailure(true);
      return null;
    }

    // Service is working
    markServiceAvailable();

    // Update importance separately (Edge Function doesn't handle this)
    if (importance !== 1 && data?.id) {
      await supabase
        .from('nova_memory_embeddings')
        .update({ importance })
        .eq('id', data.id);
    }

    return data?.id;
  } catch (error) {
    markServiceFailure(isConfigurationError(error));
    return null;
  }
}

/**
 * Semantic search for similar content
 * Returns results with similarity scores
 */
export async function semanticSearch(query, options = {}) {
  // Skip if service is known to be unavailable
  if (!shouldAttemptEmbedding()) {
    return [];
  }

  const userId = await getCurrentUserId();
  if (!userId) return [];

  const {
    limit = 5,
    threshold = 0.7,
    contentTypes = null,
    minImportance = 0,
    excludeIds = []
  } = options;

  try {
    const { data, error } = await supabase.functions.invoke('nova-embeddings', {
      body: {
        action: 'search',
        text: query,
        userId,
        limit: limit * 2 // Get more to filter
      }
    });

    if (error) {
      markServiceFailure(isConfigurationError(error));
      return [];
    }

    // Check if response indicates configuration error
    if (data?.error && isConfigurationError(data.error)) {
      markServiceFailure(true);
      return [];
    }

    // Service is working
    markServiceAvailable();

    let results = data?.results || [];

    // Apply additional filters
    results = results.filter(r => {
      if (r.similarity < threshold) return false;
      if (contentTypes && !contentTypes.includes(r.content_type)) return false;
      if (r.importance < minImportance) return false;
      if (excludeIds.includes(r.id)) return false;
      return true;
    });

    // Return top N after filtering
    return results.slice(0, limit).map(r => ({
      id: r.id,
      content: r.content,
      contentType: r.content_type,
      similarity: r.similarity,
      importance: r.importance,
      metadata: r.metadata,
      createdAt: r.created_at
    }));
  } catch (error) {
    markServiceFailure(isConfigurationError(error));
    return [];
  }
}

/**
 * Batch store multiple items efficiently
 */
export async function batchStoreWithEmbeddings(items) {
  const results = await Promise.all(
    items.map(item =>
      storeWithEmbedding(
        item.content,
        item.contentType,
        item.metadata,
        item.importance
      )
    )
  );

  return results.filter(id => id !== null);
}

/**
 * Delete embedding by ID
 */
export async function deleteEmbedding(id) {
  const userId = await getCurrentUserId();
  if (!userId) return false;

  try {
    const { error } = await supabase
      .from('nova_memory_embeddings')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    return !error;
  } catch (error) {
    console.error('Failed to delete embedding:', error);
    return false;
  }
}

/**
 * Update importance score for an embedding
 */
export async function updateImportance(id, importance) {
  const userId = await getCurrentUserId();
  if (!userId) return false;

  try {
    const { error } = await supabase
      .from('nova_memory_embeddings')
      .update({ importance })
      .eq('id', id)
      .eq('user_id', userId);

    return !error;
  } catch (error) {
    console.error('Failed to update importance:', error);
    return false;
  }
}

/**
 * Clear embedding cache
 */
export function clearCache() {
  embeddingCache.clear();
}

/**
 * Get embedding count for user
 */
export async function getEmbeddingCount() {
  const userId = await getCurrentUserId();
  if (!userId) return 0;

  try {
    const { count, error } = await supabase
      .from('nova_memory_embeddings')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    return error ? 0 : count;
  } catch (error) {
    return 0;
  }
}

export const embeddingService = {
  generateEmbedding,
  storeWithEmbedding,
  semanticSearch,
  batchStoreWithEmbeddings,
  deleteEmbedding,
  updateImportance,
  clearCache,
  getEmbeddingCount
};

export default embeddingService;
