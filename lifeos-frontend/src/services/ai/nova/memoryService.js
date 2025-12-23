/**
 * Nova Memory Service
 *
 * A sophisticated memory system for Nova that enables:
 * - Long-term memory of user interactions
 * - Semantic search through past conversations
 * - Automatic extraction of facts, preferences, and insights
 * - Memory reinforcement and decay
 *
 * Memory Types:
 * - episodic: Specific events and experiences ("User achieved 30-day streak")
 * - semantic: Facts and preferences ("User prefers morning workouts")
 * - procedural: How-to knowledge ("User likes step-by-step guidance")
 * - profile: Identity info ("User is named Taylor, 18 years old")
 */

import { supabase, getCurrentUserId } from '../../../lib/supabase';
import { checkRateLimit } from '../../redis';

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  // Memory retrieval settings
  matchThreshold: 0.7,        // Minimum similarity for memory match
  maxMemories: 10,            // Max memories to retrieve per query
  maxRecentMessages: 20,      // Max recent messages for context

  // Embedding settings (using OpenAI text-embedding-3-small via edge function)
  embeddingDimensions: 1536,

  // Memory extraction settings
  extractionBatchSize: 5,     // Process 5 messages at a time for extraction
  minMessageLength: 10,       // Minimum message length to consider for extraction

  // Edge function URLs
  embeddingFunctionUrl: import.meta.env.VITE_SUPABASE_URL + '/functions/v1/nova-embeddings',
  extractionFunctionUrl: import.meta.env.VITE_SUPABASE_URL + '/functions/v1/nova-extract-memories',
};

// ============================================================================
// CONVERSATION STORAGE
// ============================================================================

/**
 * Store a message in the conversation history
 * @param {string} role - 'user' or 'assistant'
 * @param {string} content - The message content
 * @param {string} conversationId - Optional conversation ID
 * @returns {Promise<Object>} The stored message
 */
export async function storeMessage(role, content, conversationId = null) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      console.warn('Cannot store message: No user ID');
      return null;
    }

    const { data, error } = await supabase
      .from('nova_messages')
      .insert({
        user_id: userId,
        conversation_id: conversationId,
        role,
        content,
        metadata: {
          timestamp: new Date().toISOString(),
        },
      })
      .select()
      .single();

    if (error) {
      console.error('Error storing message:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in storeMessage:', error);
    return null;
  }
}

/**
 * Get recent messages for context
 * @param {string} conversationId - Optional conversation ID
 * @param {number} limit - Max messages to retrieve
 * @returns {Promise<Array>} Recent messages
 */
export async function getRecentMessages(conversationId = null, limit = CONFIG.maxRecentMessages) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return [];

    const { data, error } = await supabase.rpc('get_nova_conversation_context', {
      p_user_id: userId,
      p_conversation_id: conversationId,
      p_limit: limit,
    });

    if (error) {
      console.error('Error getting recent messages:', error);
      return [];
    }

    // Reverse to get chronological order (oldest first)
    return (data || []).reverse();
  } catch (error) {
    console.error('Error in getRecentMessages:', error);
    return [];
  }
}

// ============================================================================
// MEMORY RETRIEVAL
// ============================================================================

/**
 * Search for relevant memories based on a query
 * Uses semantic similarity search with vector embeddings
 *
 * @param {string} query - The search query (usually the user's current message)
 * @param {Object} options - Search options
 * @returns {Promise<Array>} Matching memories
 */
export async function searchMemories(query, options = {}) {
  const {
    memoryTypes = null,       // Filter by type: ['episodic', 'semantic', 'procedural', 'profile']
    matchThreshold = CONFIG.matchThreshold,
    maxResults = CONFIG.maxMemories,
  } = options;

  try {
    const userId = await getCurrentUserId();
    if (!userId) return [];

    // Generate embedding for the query
    const embedding = await generateEmbedding(query);
    if (!embedding) {
      console.warn('Could not generate embedding for query');
      return [];
    }

    // Search using the match function
    const { data, error } = await supabase.rpc('match_nova_memories', {
      query_embedding: embedding,
      p_user_id: userId,
      match_threshold: matchThreshold,
      match_count: maxResults,
      memory_types: memoryTypes,
    });

    if (error) {
      console.error('Error searching memories:', error);
      return [];
    }

    // Touch accessed memories to reinforce them
    if (data && data.length > 0) {
      touchMemories(data.map(m => m.id));
    }

    return data || [];
  } catch (error) {
    console.error('Error in searchMemories:', error);
    return [];
  }
}

/**
 * Get all profile memories (always relevant context)
 * @returns {Promise<Array>} Profile memories
 */
export async function getProfileMemories() {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return [];

    const { data, error } = await supabase.rpc('get_nova_profile_memories', {
      p_user_id: userId,
    });

    if (error) {
      console.error('Error getting profile memories:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getProfileMemories:', error);
    return [];
  }
}

/**
 * Get memories relevant to the current context
 * Combines semantic search with profile memories
 *
 * @param {string} currentMessage - The user's current message
 * @returns {Promise<Object>} Combined memory context
 */
export async function getMemoryContext(currentMessage) {
  try {
    // Get profile memories (always include)
    const profileMemories = await getProfileMemories();

    // Search for semantically relevant memories
    const relevantMemories = await searchMemories(currentMessage, {
      memoryTypes: ['episodic', 'semantic', 'procedural'],
      maxResults: 8,
    });

    // Format for prompt injection
    return {
      profileMemories,
      relevantMemories,
      formatted: formatMemoriesForPrompt(profileMemories, relevantMemories),
    };
  } catch (error) {
    console.error('Error in getMemoryContext:', error);
    return {
      profileMemories: [],
      relevantMemories: [],
      formatted: '',
    };
  }
}

/**
 * Format memories for injection into the system prompt
 */
function formatMemoriesForPrompt(profileMemories, relevantMemories) {
  const sections = [];

  // Profile section
  if (profileMemories.length > 0) {
    const profileItems = profileMemories.map(m => `- ${m.content}`).join('\n');
    sections.push(`## What You Know About This User\n${profileItems}`);
  }

  // Relevant memories section
  if (relevantMemories.length > 0) {
    const memoryItems = relevantMemories.map(m => {
      const dateInfo = m.memory_date ? ` (${m.memory_date})` : '';
      return `- ${m.content}${dateInfo}`;
    }).join('\n');
    sections.push(`## Relevant Memories\n${memoryItems}`);
  }

  return sections.join('\n\n');
}

// ============================================================================
// MEMORY CREATION
// ============================================================================

/**
 * Store a new memory
 * @param {Object} memory - Memory data
 * @returns {Promise<Object>} The stored memory
 */
export async function storeMemory(memory) {
  const {
    type,           // 'episodic', 'semantic', 'procedural', 'profile'
    content,        // The memory text
    structuredData = {},
    importance = 0.5,
    sourceMessageId = null,
    memoryDate = null,
  } = memory;

  try {
    const userId = await getCurrentUserId();
    if (!userId) return null;

    // Generate embedding for the memory
    const embedding = await generateEmbedding(content);

    const { data, error } = await supabase
      .from('nova_memories')
      .insert({
        user_id: userId,
        memory_type: type,
        content,
        structured_data: structuredData,
        embedding,
        importance,
        source_message_id: sourceMessageId,
        source_type: sourceMessageId ? 'conversation' : 'explicit',
        memory_date: memoryDate,
      })
      .select()
      .single();

    if (error) {
      console.error('Error storing memory:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in storeMemory:', error);
    return null;
  }
}

/**
 * Update an existing memory (supersedes old version)
 * @param {string} oldMemoryId - ID of memory to supersede
 * @param {Object} newMemory - New memory data
 * @returns {Promise<Object>} The new memory
 */
export async function updateMemory(oldMemoryId, newMemory) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return null;

    // Store new memory
    const newData = await storeMemory(newMemory);
    if (!newData) return null;

    // Mark old memory as superseded
    await supabase
      .from('nova_memories')
      .update({
        is_active: false,
        superseded_by: newData.id,
      })
      .eq('id', oldMemoryId)
      .eq('user_id', userId);

    return newData;
  } catch (error) {
    console.error('Error in updateMemory:', error);
    return null;
  }
}

/**
 * Delete a memory (soft delete)
 * @param {string} memoryId - Memory ID
 */
export async function deleteMemory(memoryId) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return;

    await supabase
      .from('nova_memories')
      .update({ is_active: false })
      .eq('id', memoryId)
      .eq('user_id', userId);
  } catch (error) {
    console.error('Error in deleteMemory:', error);
  }
}

// ============================================================================
// MEMORY EXTRACTION (LLM-Powered)
// ============================================================================

/**
 * Extract memories from a conversation exchange
 * This is called after a conversation to extract learnings
 *
 * @param {Array} messages - Recent conversation messages
 * @returns {Promise<Array>} Extracted memories
 */
export async function extractMemoriesFromConversation(messages) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return [];

    // Rate limiting: 10 memory extractions per minute (expensive operation)
    const rateLimitKey = `nova:memory-extract:${userId}`;
    const allowed = await checkRateLimit(rateLimitKey, 10, 60);
    if (!allowed) {
      console.warn(`Memory extraction rate limit exceeded for user ${userId}`);
      return [];
    }

    // Filter to messages with enough content
    const substantiveMessages = messages.filter(
      m => m.content && m.content.length >= CONFIG.minMessageLength
    );

    if (substantiveMessages.length === 0) return [];

    // Get user's actual session token
    const { data: { session } } = await supabase.auth.getSession();
    const authToken = session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY;

    // Call the extraction edge function
    const response = await fetch(CONFIG.extractionFunctionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        messages: substantiveMessages,
        userId,
      }),
    });

    if (!response.ok) {
      console.warn('Memory extraction failed');
      return [];
    }

    const { memories } = await response.json();

    // Store extracted memories
    const stored = [];
    for (const memory of memories || []) {
      const result = await storeMemory(memory);
      if (result) stored.push(result);
    }

    return stored;
  } catch (error) {
    console.error('Error in extractMemoriesFromConversation:', error);
    return [];
  }
}

/**
 * Manually add a user fact/preference
 * @param {string} fact - The fact to remember
 * @param {string} type - Memory type (default: 'semantic')
 */
export async function rememberFact(fact, type = 'semantic') {
  return storeMemory({
    type,
    content: fact,
    importance: 0.7, // User-provided facts are important
    sourceType: 'explicit',
  });
}

// ============================================================================
// EMBEDDING GENERATION
// ============================================================================

/**
 * Generate embedding for text using edge function
 * @param {string} text - Text to embed
 * @returns {Promise<Array>} Embedding vector
 */
async function generateEmbedding(text) {
  try {
    // Get user's actual session token
    const { data: { session } } = await supabase.auth.getSession();
    const authToken = session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY;

    const response = await fetch(CONFIG.embeddingFunctionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        action: 'embed',
        text,
      }),
    });

    if (!response.ok) {
      console.warn('Embedding generation failed');
      return null;
    }

    const { embedding } = await response.json();
    return embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    return null;
  }
}

// ============================================================================
// MEMORY MAINTENANCE
// ============================================================================

/**
 * Touch memories to reinforce them (called on access)
 * @param {Array<string>} memoryIds - IDs of accessed memories
 */
async function touchMemories(memoryIds) {
  try {
    // Touch each memory (reinforces strength)
    for (const id of memoryIds) {
      await supabase.rpc('touch_nova_memory', { p_memory_id: id });
    }
  } catch (error) {
    console.warn('Error touching memories:', error);
  }
}

/**
 * Get memory statistics for the user
 */
export async function getMemoryStats() {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return null;

    const { data, error } = await supabase
      .from('nova_memories')
      .select('memory_type, is_active')
      .eq('user_id', userId);

    if (error) return null;

    const stats = {
      total: data.length,
      active: data.filter(m => m.is_active).length,
      byType: {
        episodic: data.filter(m => m.memory_type === 'episodic' && m.is_active).length,
        semantic: data.filter(m => m.memory_type === 'semantic' && m.is_active).length,
        procedural: data.filter(m => m.memory_type === 'procedural' && m.is_active).length,
        profile: data.filter(m => m.memory_type === 'profile' && m.is_active).length,
      },
    };

    return stats;
  } catch (error) {
    console.error('Error getting memory stats:', error);
    return null;
  }
}

/**
 * Clear all memories for the user (dangerous!)
 */
export async function clearAllMemories() {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return;

    await supabase
      .from('nova_memories')
      .update({ is_active: false })
      .eq('user_id', userId);

    console.log('All memories cleared');
  } catch (error) {
    console.error('Error clearing memories:', error);
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export const memoryService = {
  // Conversation storage
  storeMessage,
  getRecentMessages,

  // Memory retrieval
  searchMemories,
  getProfileMemories,
  getMemoryContext,

  // Memory creation
  storeMemory,
  updateMemory,
  deleteMemory,
  rememberFact,

  // Memory extraction
  extractMemoriesFromConversation,

  // Maintenance
  getMemoryStats,
  clearAllMemories,
};

export default memoryService;
