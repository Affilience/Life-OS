import express from 'express';
import cors from 'cors';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const app = express();
const PORT = 3001;

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.VITE_ANTHROPIC_API_KEY
});

// Initialize Supabase admin client for server-side operations
const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

// In-memory job storage (use Redis/DB in production)
const avatarJobs = new Map();
const equipmentJobs = new Map();

// Middleware
app.use(cors());
app.use(express.json());

// Auth middleware - verify JWT token
const verifyAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

  if (error || !user) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  req.user = user;
  next();
};

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

/**
 * Avatar Evolution Stage Descriptions
 * Maps level/prestige to character appearance
 */
const AVATAR_STAGES = {
  // Tier 1: Levels 1-10
  ordinary_human: { tier: 1, description: 'young adventurer in simple clothes, brown hair, determined expression' },
  awakened: { tier: 1, description: 'adventurer with glowing aura, simple leather armor, alert stance' },
  initiate: { tier: 1, description: 'novice warrior with basic sword and wooden shield, training gear' },

  // Tier 2: Levels 11-25
  apprentice: { tier: 2, description: 'skilled apprentice in chainmail, steel sword, confident pose' },
  journeyman: { tier: 2, description: 'experienced fighter in studded armor, dual weapons, battle-ready' },
  adept: { tier: 2, description: 'adept warrior with glowing runes on armor, magical enhancement aura' },

  // Tier 3: Levels 26-50
  expert: { tier: 3, description: 'elite warrior in plate armor, masterwork sword, cape flowing' },
  master: { tier: 3, description: 'battle master in ornate armor, glowing weapons, commanding presence' },
  grandmaster: { tier: 3, description: 'legendary warrior in enchanted armor, aura of power, regal bearing' },

  // Tier 4: Levels 51-75
  champion: { tier: 4, description: 'champion in celestial armor, divine weapons, heroic light radiating' },
  legend: { tier: 4, description: 'legendary hero in mythic armor, constellation patterns, ethereal glow' },

  // Tier 5: Levels 76-100
  ascendant: { tier: 5, description: 'ascended being in cosmic armor, stars orbiting, transcendent form' },
  cosmic_being: { tier: 5, description: 'cosmic entity in starforged armor, galaxy patterns, divine presence' },
};

/**
 * POST /api/avatars/generate
 * Generate a new avatar sprite using PixelLab
 *
 * Note: This endpoint queues a generation job.
 * The frontend should poll /api/avatars/jobs/:jobId for status.
 */
app.post('/api/avatars/generate', verifyAuth, async (req, res) => {
  try {
    const { stage_name, level, prestige = 0, generate_animations = true } = req.body;
    const userId = req.user.id;

    // Get stage description
    const stage = AVATAR_STAGES[stage_name] || AVATAR_STAGES.ordinary_human;

    // Build character description based on stage and prestige
    let description = `pixel art RPG character, ${stage.description}`;
    if (prestige > 0) {
      description += `, prestige ${prestige} glow effect, golden trim on armor`;
    }

    // Create job record
    const jobId = `avatar-${Date.now()}-${userId.slice(0, 8)}`;
    const job = {
      id: jobId,
      userId,
      stageName: stage_name,
      level,
      prestige,
      status: 'pending',
      createdAt: new Date().toISOString(),
      characterId: null,
      result: null,
      error: null,
    };
    avatarJobs.set(jobId, job);

    // Return immediately with job ID
    // In production, this would trigger an async worker/queue
    res.json({
      success: true,
      jobId,
      message: 'Avatar generation queued. Poll /api/avatars/jobs/:jobId for status.',
      estimatedTime: generate_animations ? '3-5 minutes' : '2-3 minutes',
    });

    // Note: Actual PixelLab generation would happen here via MCP
    // Since we can't call MCP from Express directly, this would need to be:
    // 1. A separate worker process with MCP client
    // 2. Or store the job and have Claude Code process it
    // 3. Or use PixelLab's REST API directly if available

    // For now, mark as needing processing
    job.status = 'queued';
    job.message = 'Job queued for PixelLab processing via MCP';

  } catch (error) {
    console.error('Avatar generation error:', error);
    res.status(500).json({
      error: 'Failed to queue avatar generation',
      message: error.message,
    });
  }
});

/**
 * GET /api/avatars/jobs/:jobId
 * Check status of an avatar generation job
 */
app.get('/api/avatars/jobs/:jobId', verifyAuth, async (req, res) => {
  const { jobId } = req.params;
  const job = avatarJobs.get(jobId);

  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }

  // Verify ownership
  if (job.userId !== req.user.id) {
    return res.status(403).json({ error: 'Access denied' });
  }

  res.json(job);
});

/**
 * GET /api/avatars/jobs
 * List all avatar generation jobs for current user
 */
app.get('/api/avatars/jobs', verifyAuth, async (req, res) => {
  const userId = req.user.id;
  const userJobs = Array.from(avatarJobs.values())
    .filter(job => job.userId === userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.json(userJobs);
});

/**
 * Equipment slot configurations
 */
const EQUIPMENT_SLOTS = {
  helmet: { view: 'low top-down', size: 32 },
  chest: { view: 'low top-down', size: 48 },
  weapon: { view: 'side', size: 48 },
  shield: { view: 'side', size: 40 },
  cape: { view: 'low top-down', size: 48 },
  ring: { view: 'high top-down', size: 24 },
  amulet: { view: 'high top-down', size: 32 },
};

const RARITY_MODIFIERS = {
  common: { detail: 'low detail', shading: 'basic shading', outline: 'single color black outline' },
  uncommon: { detail: 'medium detail', shading: 'basic shading', outline: 'single color black outline' },
  rare: { detail: 'medium detail', shading: 'medium shading', outline: 'selective outline' },
  epic: { detail: 'high detail', shading: 'medium shading', outline: 'selective outline' },
  legendary: { detail: 'high detail', shading: 'detailed shading', outline: 'selective outline' },
};

/**
 * POST /api/avatars/generate-equipment
 * Generate equipment sprite using PixelLab
 */
app.post('/api/avatars/generate-equipment', verifyAuth, async (req, res) => {
  try {
    const { equipment_name, slot, rarity = 'common', description: customDesc } = req.body;
    const userId = req.user.id;

    // Validate slot
    const slotConfig = EQUIPMENT_SLOTS[slot];
    if (!slotConfig) {
      return res.status(400).json({
        error: 'Invalid slot',
        validSlots: Object.keys(EQUIPMENT_SLOTS)
      });
    }

    // Get rarity modifiers
    const rarityMods = RARITY_MODIFIERS[rarity] || RARITY_MODIFIERS.common;

    // Build description
    const description = customDesc || `pixel art ${rarity} ${slot}, ${equipment_name}, RPG game item`;

    // Create job record
    const jobId = `equip-${Date.now()}-${userId.slice(0, 8)}`;
    const job = {
      id: jobId,
      userId,
      equipmentName: equipment_name,
      slot,
      rarity,
      description,
      status: 'queued',
      createdAt: new Date().toISOString(),
      result: null,
      error: null,
      config: {
        ...slotConfig,
        ...rarityMods,
      },
    };
    equipmentJobs.set(jobId, job);

    res.json({
      success: true,
      jobId,
      message: 'Equipment generation queued. Poll /api/avatars/equipment-jobs/:jobId for status.',
      estimatedTime: '15-30 seconds',
    });

  } catch (error) {
    console.error('Equipment generation error:', error);
    res.status(500).json({
      error: 'Failed to queue equipment generation',
      message: error.message,
    });
  }
});

/**
 * GET /api/avatars/equipment-jobs/:jobId
 * Check status of an equipment generation job
 */
app.get('/api/avatars/equipment-jobs/:jobId', verifyAuth, async (req, res) => {
  const { jobId } = req.params;
  const job = equipmentJobs.get(jobId);

  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }

  if (job.userId !== req.user.id) {
    return res.status(403).json({ error: 'Access denied' });
  }

  res.json(job);
});

/**
 * POST /api/avatars/complete-job
 * Internal endpoint to mark a job as complete (called by MCP processor)
 */
app.post('/api/avatars/complete-job', async (req, res) => {
  // This would be called by a separate MCP worker process
  // For security, should use an internal API key
  const { jobId, type, result, error } = req.body;

  const jobs = type === 'avatar' ? avatarJobs : equipmentJobs;
  const job = jobs.get(jobId);

  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }

  if (error) {
    job.status = 'failed';
    job.error = error;
  } else {
    job.status = 'completed';
    job.result = result;
    job.completedAt = new Date().toISOString();
  }

  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`🚀 Nova AI Backend running on http://localhost:${PORT}`);
  console.log(`✅ Claude API proxy ready`);
  console.log(`✅ Avatar generation endpoints ready`);
  console.log(`✅ Equipment generation endpoints ready`);
});
