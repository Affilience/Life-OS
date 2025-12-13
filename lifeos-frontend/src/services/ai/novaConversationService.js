/**
 * Nova Conversation Service
 * Handles saving and loading conversations from Supabase
 * Provides long-term memory for the Nova AI companion
 */

import { supabase, getCurrentUserId, safeQuery } from '../../lib/supabase';

// Session ID persists for the current browser session
let currentSessionId = null;
let currentConversationId = null;

/**
 * Get or create a conversation for the current session
 */
export async function getOrCreateConversation() {
  const userId = await getCurrentUserId();
  if (!userId) {
    console.warn('No user ID available for conversation');
    return null;
  }

  // If we already have a conversation for this session, return it
  if (currentConversationId) {
    return currentConversationId;
  }

  // Create a new conversation for this session
  const { data, error } = await supabase
    .from('nova_conversations')
    .insert({
      user_id: userId,
      title: `Session ${new Date().toLocaleDateString()}`,
      metadata: {
        started_at: new Date().toISOString(),
        user_agent: navigator.userAgent
      }
    })
    .select('id')
    .single();

  if (error) {
    console.error('Failed to create conversation:', error);
    return null;
  }

  currentConversationId = data.id;
  return currentConversationId;
}

/**
 * Save a message to the current conversation
 */
export async function saveMessage(role, content, metadata = {}) {
  const userId = await getCurrentUserId();
  if (!userId) {
    console.warn('No user ID available for saving message');
    return null;
  }

  const conversationId = await getOrCreateConversation();
  if (!conversationId) return null;

  const { data, error } = await supabase
    .from('nova_messages')
    .insert({
      conversation_id: conversationId,
      user_id: userId,
      role,
      content,
      metadata
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to save message:', error);
    return null;
  }

  // Also save to embeddings for semantic search (async, don't wait)
  if (content.length > 20) {
    createEmbedding(content, role, conversationId).catch(err =>
      console.warn('Embedding creation failed:', err)
    );
  }

  return data;
}

/**
 * Load recent messages for context
 * @param {number} limit - Number of messages to load
 */
export async function loadRecentMessages(limit = 20) {
  const userId = await getCurrentUserId();
  if (!userId) return [];

  // Get the most recent conversation
  const { data: conversations, error: convError } = await supabase
    .from('nova_conversations')
    .select('id')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(1);

  if (convError || !conversations?.length) {
    return [];
  }

  const conversationId = conversations[0].id;
  currentConversationId = conversationId;

  // Load messages from that conversation
  const { data: messages, error: msgError } = await supabase
    .from('nova_messages')
    .select('role, content, created_at')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
    .limit(limit);

  if (msgError) {
    console.error('Failed to load messages:', msgError);
    return [];
  }

  return messages.map(m => ({
    role: m.role,
    content: m.content
  }));
}

/**
 * Load conversation history across all conversations
 * @param {number} limit - Number of conversations to load
 */
export async function loadConversationHistory(limit = 5) {
  const userId = await getCurrentUserId();
  if (!userId) return [];

  const { data, error } = await supabase
    .from('nova_conversations')
    .select(`
      id,
      title,
      summary,
      created_at,
      updated_at,
      nova_messages (
        role,
        content,
        created_at
      )
    `)
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Failed to load conversation history:', error);
    return [];
  }

  return data;
}

/**
 * Create an embedding for semantic search
 */
async function createEmbedding(text, contentType, sourceId) {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  try {
    // Call the embeddings edge function
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/nova-embeddings`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          action: 'embed_and_store',
          text,
          userId,
          contentType,
          sourceId,
          metadata: {
            created_at: new Date().toISOString()
          }
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Embedding API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.warn('Failed to create embedding:', error);
    return null;
  }
}

/**
 * Search past conversations semantically
 * @param {string} query - Search query
 * @param {number} limit - Number of results
 */
export async function searchMemories(query, limit = 5) {
  const userId = await getCurrentUserId();
  if (!userId) return [];

  try {
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/nova-embeddings`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          action: 'search',
          text: query,
          userId,
          limit
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Search API error: ${response.status}`);
    }

    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.warn('Memory search failed:', error);
    return [];
  }
}

/**
 * Log a user event for activity tracking
 */
export async function logUserEvent(eventType, eventData = {}, module = null) {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  const { data, error } = await supabase
    .from('nova_user_events')
    .insert({
      user_id: userId,
      event_type: eventType,
      event_data: eventData,
      module,
      metadata: {
        url: window.location.pathname,
        timestamp: new Date().toISOString()
      }
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to log event:', error);
    return null;
  }

  return data;
}

/**
 * Get recent user events for context building
 */
export async function getRecentEvents(limit = 50) {
  const userId = await getCurrentUserId();
  if (!userId) return [];

  const { data, error } = await supabase
    .from('nova_user_events')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Failed to load events:', error);
    return [];
  }

  return data;
}

/**
 * Update conversation with AI-generated summary
 */
export async function updateConversationSummary(conversationId, summary) {
  const { error } = await supabase
    .from('nova_conversations')
    .update({ summary })
    .eq('id', conversationId);

  if (error) {
    console.error('Failed to update summary:', error);
    return false;
  }

  return true;
}

/**
 * Save an AI-generated insight
 */
export async function saveInsight(insightType, content, metadata = {}) {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  const { data, error } = await supabase
    .from('nova_insights')
    .insert({
      user_id: userId,
      insight_type: insightType,
      content,
      metadata,
      is_active: true
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to save insight:', error);
    return null;
  }

  return data;
}

/**
 * Get active insights for the user
 */
export async function getActiveInsights(limit = 10) {
  const userId = await getCurrentUserId();
  if (!userId) return [];

  const { data, error } = await supabase
    .from('nova_insights')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Failed to load insights:', error);
    return [];
  }

  return data;
}

/**
 * Clear current conversation (start fresh)
 */
export function startNewConversation() {
  currentConversationId = null;
}

/**
 * Get the current conversation ID
 */
export function getCurrentConversationId() {
  return currentConversationId;
}

/**
 * Export conversation service for use in components
 */
export const novaConversationService = {
  getOrCreateConversation,
  saveMessage,
  loadRecentMessages,
  loadConversationHistory,
  searchMemories,
  logUserEvent,
  getRecentEvents,
  updateConversationSummary,
  saveInsight,
  getActiveInsights,
  startNewConversation,
  getCurrentConversationId,
  // Getter for current conversation ID
  get currentConversationId() {
    return currentConversationId;
  }
};

export default novaConversationService;
