/**
 * Claude AI Service
 * Handles all interactions with Claude API via Supabase Edge Functions
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Edge function endpoint
const NOVA_CHAT_URL = `${SUPABASE_URL}/functions/v1/nova-chat`;

export const claudeService = {
  /**
   * Send a message to Claude and get a response
   * @param {Array} messages - Array of {role: 'user'|'assistant', content: string}
   * @param {Object} options - Additional options (system prompt, userContext, etc.)
   */
  async chat(messages, options = {}) {
    try {
      if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
        throw new Error('Supabase configuration missing. Check your .env.local file.');
      }

      const response = await fetch(NOVA_CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'apikey': SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          messages,
          system: options.system,
          userContext: options.userContext,
          stream: false,
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to get response (${response.status})`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Unknown error occurred');
      }

      return { content: data.content, usage: data.usage };
    } catch (error) {
      console.error('Claude API Error:', error);
      throw new Error(`Failed to get response from Nova: ${error.message}`);
    }
  },

  /**
   * Stream a response from Claude (for better UX)
   * @param {Array} messages - Array of messages
   * @param {Function} onChunk - Callback for each text chunk
   * @param {Object} options - Additional options
   */
  async streamChat(messages, onChunk, options = {}) {
    try {
      if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
        throw new Error('Supabase configuration missing. Check your .env.local file.');
      }

      const response = await fetch(NOVA_CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'apikey': SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          messages,
          system: options.system,
          userContext: options.userContext,
          stream: true,
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to stream response (${response.status})`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') break;

            try {
              const parsed = JSON.parse(data);
              if (parsed.text) {
                fullText += parsed.text;
                onChunk(parsed.text);
              }
            } catch (e) {
              // Ignore parsing errors for incomplete chunks
            }
          }
        }
      }

      return fullText;
    } catch (error) {
      console.error('Claude Streaming Error:', error);
      throw new Error(`Failed to stream response: ${error.message}`);
    }
  },

  /**
   * Check if the service is configured and available
   */
  isConfigured() {
    return !!(SUPABASE_URL && SUPABASE_ANON_KEY);
  }
};
