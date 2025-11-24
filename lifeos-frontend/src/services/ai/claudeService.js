/**
 * Claude AI Service
 * Handles all interactions with Claude API via backend proxy
 */

const API_BASE = 'http://localhost:3001';

export const claudeService = {
  /**
   * Send a message to Claude and get a response
   * @param {Array} messages - Array of {role: 'user'|'assistant', content: string}
   * @param {Object} options - Additional options (system prompt, max_tokens, etc.)
   */
  async chat(messages, options = {}) {
    try {
      const response = await fetch(`${API_BASE}/api/claude/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages,
          options
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to get response from Claude');
      }

      return await response.json();
    } catch (error) {
      console.error('Claude API Error:', error);
      throw new Error(`Failed to get response from Claude: ${error.message}`);
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
      const response = await fetch(`${API_BASE}/api/claude/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages,
          options
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to stream response');
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
  }
};
