import express from 'express';
import cors from 'cors';
import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const app = express();
const PORT = 3001;

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.VITE_ANTHROPIC_API_KEY
});

// Middleware
app.use(cors());
app.use(express.json());

/**
 * POST /api/claude/chat
 * Proxy endpoint for Claude API chat completions
 */
app.post('/api/claude/chat', async (req, res) => {
  try {
    const { messages, options = {} } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    const response = await anthropic.messages.create({
      model: options.model || 'claude-3-5-haiku-20241022',
      max_tokens: options.max_tokens || 4096,
      system: options.system || 'You are a helpful AI life coach integrated into LifeOS.',
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      temperature: options.temperature || 1.0
    });

    res.json({
      content: response.content[0].text,
      usage: response.usage,
      model: response.model
    });
  } catch (error) {
    console.error('Claude API Error:', error);
    res.status(500).json({
      error: 'Failed to get response from Claude',
      message: error.message
    });
  }
});

/**
 * POST /api/claude/stream
 * Streaming endpoint for Claude API
 */
app.post('/api/claude/stream', async (req, res) => {
  try {
    const { messages, options = {} } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    // Set up SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const stream = await anthropic.messages.create({
      model: options.model || 'claude-3-5-haiku-20241022',
      max_tokens: options.max_tokens || 4096,
      system: options.system || 'You are a helpful AI life coach integrated into LifeOS.',
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      temperature: options.temperature || 1.0,
      stream: true
    });

    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        res.write(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    console.error('Claude Streaming Error:', error);
    res.status(500).json({
      error: 'Failed to stream response',
      message: error.message
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Nova AI Backend running on http://localhost:${PORT}`);
  console.log(`✅ Claude API proxy ready`);
});
