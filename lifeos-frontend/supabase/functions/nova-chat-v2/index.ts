/**
 * Nova Chat V2 - Cost-Optimized Edge Function
 *
 * Optimizations implemented:
 * 1. Prompt Caching - 90% reduction on system prompt costs
 * 2. Smart Model Routing - Auto-select Haiku vs Sonnet based on query complexity
 * 3. Context-Aware Data - Only inject relevant user data based on topic
 * 4. Conversation Summarization - Compress long chat histories
 * 5. Dynamic Token Limits - Adjust based on query type
 * 6. Two-tier caching - Memory + Database for user context
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// ============================================================================
// TYPES
// ============================================================================

interface Message {
  role: "user" | "assistant";
  content: string | ContentBlock[];
}

interface ContentBlock {
  type: "text";
  text: string;
  cache_control?: { type: "ephemeral" };
}

interface ChatRequest {
  messages: Message[];
  systemPrompt?: string;
  stream?: boolean;
  mode?: "auto" | "quick" | "standard" | "comprehensive";
  maxTokens?: number;
  temperature?: number;
}

interface UserContext {
  user_id: string;
  profile: Record<string, any>;
  stats: Record<string, any>;
  gamification: { modules: any[] };
  currency: { cosmic_credits: number };
  streaks: { streaks: any[] };
  today: {
    date: string;
    day_of_week: string;
    time_of_day: string;
    tasks: { total_count: number; completed_count: number; tasks: any[] };
    nutrition: { calories: number; protein: number; carbs: number; fat: number; meals_logged: number };
  };
  fitness: { workouts_this_week: number; recent: any[] };
  pets: { total_pets: number; active_pets: any[] };
  equipment: { equipped: any[] };
  journal: { total_entries: number; recent_entries: any[] };
  financial: { total_budget: number; total_spent: number; savings_goals: number };
  skills: { active_skills: number; total_practice_hours: number; top_skills: any[] };
  memories: { total_memories: number; memory_types: Record<string, number>; profile_memories: any[] };
  fetched_at: string;
}

type QueryComplexity = "simple" | "moderate" | "complex";
type QueryTopic = "general" | "fitness" | "nutrition" | "tasks" | "finance" | "skills" | "journal" | "stats" | "navigation";

// ============================================================================
// QUERY ANALYSIS - Smart routing to minimize costs
// ============================================================================

const SIMPLE_PATTERNS = [
  /^(hi|hey|hello|yo|sup|hiya|howdy)[\s!?.]*$/i,
  /^(thanks|thank you|thx|ty)[\s!?.]*$/i,
  /^(ok|okay|sure|cool|nice|great|awesome)[\s!?.]*$/i,
  /^(yes|no|yeah|nah|yep|nope)[\s!?.]*$/i,
  /^(bye|goodbye|later|see ya|cya)[\s!?.]*$/i,
  /^what('s| is) up\??$/i,
  /^how are you\??$/i,
  /^good (morning|afternoon|evening|night)[\s!?.]*$/i,
];

const COMPLEX_PATTERNS = [
  /\b(analyze|analysis|explain|why|how come|compare|correlation|pattern|trend|insight)\b/i,
  /\b(plan|strategy|recommend|suggest|advice|help me (with|to|figure))\b/i,
  /\b(summarize|summary|overview|report|breakdown)\b/i,
  /\b(what should i|how can i|how do i)\b/i,
  /\b(improve|optimize|better|increase|decrease)\b/i,
];

const TOPIC_KEYWORDS: Record<QueryTopic, RegExp[]> = {
  fitness: [/\b(workout|exercise|gym|fitness|training|cardio|strength|run|lift)\b/i],
  nutrition: [/\b(calorie|protein|carb|fat|meal|food|eat|diet|nutrition|macro)\b/i],
  tasks: [/\b(task|todo|productivity|project|work|deadline|complete|done)\b/i],
  finance: [/\b(money|budget|expense|saving|spend|financial|cost|income)\b/i],
  skills: [/\b(skill|learn|practice|level|progress|perk|ability)\b/i],
  journal: [/\b(journal|diary|mood|reflect|entry|write|feeling)\b/i],
  stats: [/\b(stat|level|xp|experience|progress|streak|achievement)\b/i],
  navigation: [/\b(where|find|go to|navigate|page|section|how do i get)\b/i],
  general: [],
};

function analyzeQuery(message: string): { complexity: QueryComplexity; topics: QueryTopic[] } {
  const normalizedMsg = message.trim().toLowerCase();

  // Check for simple patterns first
  for (const pattern of SIMPLE_PATTERNS) {
    if (pattern.test(normalizedMsg)) {
      return { complexity: "simple", topics: ["general"] };
    }
  }

  // Check for complex patterns
  for (const pattern of COMPLEX_PATTERNS) {
    if (pattern.test(normalizedMsg)) {
      const topics = detectTopics(normalizedMsg);
      return { complexity: "complex", topics };
    }
  }

  // Check message length and question marks
  const wordCount = normalizedMsg.split(/\s+/).length;
  const hasQuestion = normalizedMsg.includes("?");

  if (wordCount <= 5 && !hasQuestion) {
    return { complexity: "simple", topics: detectTopics(normalizedMsg) };
  }

  if (wordCount > 20 || (hasQuestion && wordCount > 10)) {
    return { complexity: "complex", topics: detectTopics(normalizedMsg) };
  }

  return { complexity: "moderate", topics: detectTopics(normalizedMsg) };
}

function detectTopics(message: string): QueryTopic[] {
  const topics: QueryTopic[] = [];

  for (const [topic, patterns] of Object.entries(TOPIC_KEYWORDS)) {
    if (topic === "general") continue;
    for (const pattern of patterns) {
      if (pattern.test(message)) {
        topics.push(topic as QueryTopic);
        break;
      }
    }
  }

  return topics.length > 0 ? topics : ["general"];
}

// ============================================================================
// MODEL CONFIGURATION
// ============================================================================

interface ModelConfig {
  model: string;
  maxTokens: number;
  temperature: number;
}

function getModelConfig(complexity: QueryComplexity, explicitMode?: string): ModelConfig {
  // If user explicitly sets mode, respect it
  if (explicitMode && explicitMode !== "auto") {
    const configs: Record<string, ModelConfig> = {
      quick: { model: "claude-3-5-haiku-20241022", maxTokens: 150, temperature: 0.7 },
      standard: { model: "claude-sonnet-4-20250514", maxTokens: 300, temperature: 0.7 },
      comprehensive: { model: "claude-sonnet-4-20250514", maxTokens: 800, temperature: 0.8 },
    };
    return configs[explicitMode] || configs.standard;
  }

  // Auto-select based on complexity
  switch (complexity) {
    case "simple":
      return { model: "claude-3-5-haiku-20241022", maxTokens: 100, temperature: 0.7 };
    case "moderate":
      return { model: "claude-3-5-haiku-20241022", maxTokens: 200, temperature: 0.7 };
    case "complex":
      return { model: "claude-sonnet-4-20250514", maxTokens: 400, temperature: 0.7 };
  }
}

// ============================================================================
// CONTEXT-AWARE DATA INJECTION
// ============================================================================

function buildContextForTopics(context: UserContext, topics: QueryTopic[]): string {
  const sections: string[] = [];

  // Always include basic context (minimal tokens)
  sections.push(`Date: ${context.today.date} (${context.today.day_of_week}), ${context.today.time_of_day}`);

  // Only include relevant data based on detected topics
  const includeAll = topics.includes("general") || topics.includes("stats");

  if (includeAll || topics.includes("tasks")) {
    const t = context.today.tasks;
    if (t.total_count > 0) {
      sections.push(`Tasks: ${t.completed_count}/${t.total_count} done`);
    }
  }

  if (includeAll || topics.includes("nutrition")) {
    const n = context.today.nutrition;
    if (n.calories > 0) {
      sections.push(`Nutrition: ${n.calories}cal, ${n.protein}g protein`);
    }
  }

  if (includeAll || topics.includes("fitness")) {
    if (context.fitness?.workouts_this_week > 0) {
      sections.push(`Fitness: ${context.fitness.workouts_this_week} workouts this week`);
    }
  }

  if (includeAll || topics.includes("finance")) {
    const f = context.financial;
    if (f.total_budget > 0) {
      sections.push(`Budget: $${f.total_spent}/$${f.total_budget} spent`);
    }
  }

  if (includeAll || topics.includes("skills")) {
    if (context.skills?.active_skills > 0) {
      sections.push(`Skills: ${context.skills.active_skills} active, ${context.skills.total_practice_hours}h practice`);
    }
  }

  if (includeAll || topics.includes("stats")) {
    // Include streaks and currency for stats queries
    if (context.streaks?.streaks?.length > 0) {
      const topStreak = context.streaks.streaks[0];
      sections.push(`Top streak: ${topStreak.name || topStreak.module} - ${topStreak.current_count || topStreak.count} days`);
    }
    if (context.currency?.cosmic_credits > 0) {
      sections.push(`Credits: ${context.currency.cosmic_credits}`);
    }
  }

  // Always include profile memories if available (important context)
  if (context.memories?.profile_memories?.length > 0) {
    const memories = context.memories.profile_memories
      .slice(0, 3)
      .map((m: any) => m.content)
      .join("; ");
    sections.push(`Remember: ${memories}`);
  }

  return sections.join(" | ");
}

// ============================================================================
// CONVERSATION SUMMARIZATION
// ============================================================================

function optimizeConversationHistory(messages: Message[]): Message[] {
  // Keep last 4 messages verbatim, summarize older ones
  if (messages.length <= 4) {
    return messages;
  }

  const recentMessages = messages.slice(-4);
  const olderMessages = messages.slice(0, -4);

  // Create a compact summary of older messages
  const summary = olderMessages
    .map(m => {
      const content = typeof m.content === "string" ? m.content : m.content.map(c => c.text).join(" ");
      // Truncate long messages
      const truncated = content.length > 100 ? content.slice(0, 100) + "..." : content;
      return `${m.role === "user" ? "U" : "A"}: ${truncated}`;
    })
    .join(" | ");

  // Prepend summary as a system-like context
  const summaryMessage: Message = {
    role: "user",
    content: `[Earlier conversation summary: ${summary}]`
  };

  return [summaryMessage, ...recentMessages];
}

// ============================================================================
// PROMPT CACHING SYSTEM
// ============================================================================

// Compact system prompt optimized for tokens while maintaining personality
const CACHED_SYSTEM_PROMPT = `You are Nova, the AI companion in LifeOS - a personal life optimization system.

PERSONALITY: Friendly, genuine, adapts to user needs. Sound human, not robotic.
- Use contractions (you're, don't, I've)
- Vary sentence length, match their energy
- Never use markdown formatting, asterisks, or excessive emojis

BEHAVIOR:
- Greetings: Just say "Hey!" or "What's up?" - don't recite stats
- Data questions: Be conversational, not clinical ("You're at 60% of your goal" not "Your intake is 1200/2000")
- Struggles: Empathize first, don't lecture
- Keep responses to 2-3 sentences unless they ask for detail

NAVIGATION (when asked "where" or "how do I find"):
Dashboard:/, Productivity:/productivity, Health:/health, Journal:/journal, Calendar:/calendar, Skills:/skills, Financial:/financial, Character:/character, Quests:/quests, Social:/social, Settings:/settings

MEMORY: You remember past conversations. Reference naturally, don't announce "I remember..."`;

function buildSystemWithCache(userContext: string): ContentBlock[] {
  return [
    {
      type: "text",
      text: CACHED_SYSTEM_PROMPT,
      cache_control: { type: "ephemeral" }
    },
    {
      type: "text",
      text: userContext ? `\n\nUSER DATA: ${userContext}` : ""
    }
  ];
}

// ============================================================================
// USER CONTEXT FETCHING (with caching)
// ============================================================================

const contextCache = new Map<string, { context: UserContext; expiresAt: number }>();
const MEMORY_CACHE_TTL_MS = 60 * 1000;

async function fetchUserContext(userId: string): Promise<UserContext | null> {
  try {
    const cached = contextCache.get(userId);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.context;
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data, error } = await supabase.rpc('get_nova_user_context_cached', {
      p_user_id: userId,
      p_cache_ttl_minutes: 5
    });

    if (error) {
      const { data: uncached } = await supabase.rpc('get_nova_user_context', { p_user_id: userId });
      return uncached as UserContext;
    }

    contextCache.set(userId, { context: data as UserContext, expiresAt: Date.now() + MEMORY_CACHE_TTL_MS });
    if (contextCache.size > 100) {
      const oldestKey = contextCache.keys().next().value;
      if (oldestKey) contextCache.delete(oldestKey);
    }

    return data as UserContext;
  } catch (err) {
    console.error('Failed to fetch user context:', err);
    return null;
  }
}

async function getUserIdFromAuth(req: Request): Promise<string | null> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;

  try {
    const token = authHeader.replace('Bearer ', '');
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: { user }, error } = await supabase.auth.getUser(token);
    return error || !user ? null : user.id;
  } catch {
    return null;
  }
}

// ============================================================================
// STREAMING HANDLER
// ============================================================================

function createStreamTransform(): TransformStream {
  return new TransformStream({
    transform(chunk, controller) {
      const text = new TextDecoder().decode(chunk);
      for (const line of text.split("\n")) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6).trim();
          if (data === "[DONE]") {
            controller.enqueue(new TextEncoder().encode("data: [DONE]\n\n"));
            continue;
          }
          try {
            const parsed = JSON.parse(data);
            if (parsed.type === "content_block_delta" && parsed.delta?.text) {
              controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ text: parsed.delta.text })}\n\n`));
            } else if (parsed.type === "message_stop") {
              controller.enqueue(new TextEncoder().encode("data: [DONE]\n\n"));
            }
          } catch { /* ignore parse errors */ }
        }
      }
    },
  });
}

// ============================================================================
// MAIN HANDLER
// ============================================================================

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY not configured");

    const body = (await req.json()) as ChatRequest;
    const { messages, stream = true, mode = "auto" } = body;

    if (!messages?.length) {
      return new Response(JSON.stringify({ error: "messages required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get the latest user message for analysis
    const lastUserMsg = [...messages].reverse().find(m => m.role === "user");
    const queryText = typeof lastUserMsg?.content === "string"
      ? lastUserMsg.content
      : lastUserMsg?.content?.map(c => c.text).join(" ") || "";

    // Analyze query for smart routing
    const { complexity, topics } = analyzeQuery(queryText);
    const config = getModelConfig(complexity, mode);

    console.log(`Query analysis: complexity=${complexity}, topics=${topics.join(",")}, model=${config.model}`);

    // Fetch user context
    let userContextStr = "";
    const userId = await getUserIdFromAuth(req);
    if (userId) {
      const userContext = await fetchUserContext(userId);
      if (userContext) {
        userContextStr = buildContextForTopics(userContext, topics);
      }
    }

    // Optimize conversation history
    const optimizedMessages = optimizeConversationHistory(messages);

    // Build request with prompt caching
    const systemBlocks = buildSystemWithCache(userContextStr);

    const apiPayload = {
      model: config.model,
      max_tokens: config.maxTokens,
      temperature: config.temperature,
      system: systemBlocks,
      messages: optimizedMessages.map(m => ({
        role: m.role,
        content: typeof m.content === "string" ? m.content : m.content
      })),
      stream,
    };

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "anthropic-beta": "prompt-caching-2024-07-31",
      },
      body: JSON.stringify(apiPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Claude API error:", errorText);

      // Fallback to Haiku without caching if there's an error
      if (config.model.includes("sonnet") && (response.status === 429 || response.status === 503)) {
        const fallbackPayload = {
          ...apiPayload,
          model: "claude-3-5-haiku-20241022",
          max_tokens: Math.min(config.maxTokens, 200),
          system: CACHED_SYSTEM_PROMPT + (userContextStr ? `\n\nUSER DATA: ${userContextStr}` : ""),
        };

        const fallbackResponse = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": ANTHROPIC_API_KEY,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify(fallbackPayload),
        });

        if (fallbackResponse.ok && stream) {
          return new Response(fallbackResponse.body?.pipeThrough(createStreamTransform()), {
            headers: { ...corsHeaders, "Content-Type": "text/event-stream", "X-Model": "haiku-fallback" },
          });
        }
      }

      throw new Error(`Claude API error: ${response.status}`);
    }

    if (stream) {
      return new Response(response.body?.pipeThrough(createStreamTransform()), {
        headers: {
          ...corsHeaders,
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "X-Model": config.model,
          "X-Complexity": complexity,
        },
      });
    }

    const data = await response.json();
    return new Response(
      JSON.stringify({
        success: true,
        content: data.content?.[0]?.text || "",
        model: config.model,
        complexity,
        usage: data.usage,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Nova chat error:", error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
