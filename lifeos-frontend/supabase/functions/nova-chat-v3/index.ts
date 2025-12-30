/**
 * Nova Chat V3 - Fully Optimized Edge Function
 *
 * Major improvements over V2:
 * 1. Single source of truth for system prompt (no client override)
 * 2. Response caching for common queries (greetings, navigation)
 * 3. Smarter model routing with Haiku-first approach
 * 4. Extended prompt caching with knowledge base
 * 5. Improved context injection (only relevant data)
 * 6. Better streaming with usage tracking
 * 7. Trend analysis integration
 * 8. Offline-friendly error responses
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
  stream?: boolean;
  mode?: "auto" | "quick" | "standard" | "comprehensive";
  maxTokens?: number;
  temperature?: number;
  skipCache?: boolean;
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
  trends?: Record<string, any>;
  fetched_at: string;
}

type QueryComplexity = "trivial" | "simple" | "moderate" | "complex";
type QueryTopic = "general" | "greeting" | "navigation" | "fitness" | "nutrition" | "tasks" | "finance" | "skills" | "journal" | "stats" | "help" | "streaks";

// ============================================================================
// RESPONSE CACHE - For common queries
// ============================================================================

interface CachedResponse {
  response: string;
  expiresAt: number;
}

const responseCache = new Map<string, CachedResponse>();
const RESPONSE_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

// Pre-defined responses for very common queries
const STATIC_RESPONSES: Record<string, string> = {
  // Greetings - with slight variations
  greeting_morning: "Good morning! Ready to tackle the day? I see you've got things to work on.",
  greeting_afternoon: "Hey there! How's your afternoon going?",
  greeting_evening: "Good evening! Winding down or still pushing through?",
  greeting_night: "Burning the midnight oil? Don't forget to rest.",
  greeting_generic: "Hey! What's on your mind?",

  // Navigation
  nav_dashboard: "Head to / for the Dashboard - your command center with all your stats and widgets.",
  nav_productivity: "Go to /productivity for tasks, projects, and focus tracking.",
  nav_health: "Visit /health for nutrition, meals, sleep tracking, and wellness.",
  nav_fitness: "Workouts are in /health - that's where you'll find the fitness tab.",
  nav_journal: "Your journal is at /journal - daily entries and reflection.",
  nav_calendar: "The calendar lives at /calendar - time blocks and scheduling.",
  nav_skills: "Skill tracking is at /skills - practice logs and perk trees.",
  nav_financial: "Financial tracking is at /financial - budget and expenses.",
  nav_character: "Your character page is at /character - avatar, equipment, and stats.",
  nav_quests: "Quests and achievements are at /quests.",
  nav_settings: "Settings are at /settings.",
  nav_social: "Social features are at /social - friends, guilds, leaderboards.",
};

function getCacheKey(query: string, topic: QueryTopic): string {
  const normalizedQuery = query.toLowerCase().trim();

  // Map specific queries to static responses
  if (topic === "greeting") {
    const hour = new Date().getHours();
    if (hour < 12) return "greeting_morning";
    if (hour < 17) return "greeting_afternoon";
    if (hour < 21) return "greeting_evening";
    return "greeting_night";
  }

  if (topic === "navigation") {
    if (/dashboard|home|main/i.test(normalizedQuery)) return "nav_dashboard";
    if (/productivity|task|todo|project/i.test(normalizedQuery)) return "nav_productivity";
    if (/health|nutrition|meal|eat|food|sleep/i.test(normalizedQuery)) return "nav_health";
    if (/fitness|workout|exercise|gym|training/i.test(normalizedQuery)) return "nav_fitness";
    if (/journal|diary/i.test(normalizedQuery)) return "nav_journal";
    if (/calendar|schedule|time block/i.test(normalizedQuery)) return "nav_calendar";
    if (/skill|practice|learn/i.test(normalizedQuery)) return "nav_skills";
    if (/financ|budget|money|expense/i.test(normalizedQuery)) return "nav_financial";
    if (/character|avatar|equipment/i.test(normalizedQuery)) return "nav_character";
    if (/quest|achievement/i.test(normalizedQuery)) return "nav_quests";
    if (/setting|preference/i.test(normalizedQuery)) return "nav_settings";
    if (/social|friend|guild/i.test(normalizedQuery)) return "nav_social";
  }

  return "";
}

function tryGetCachedResponse(query: string, topic: QueryTopic): string | null {
  const cacheKey = getCacheKey(query, topic);

  // Check static responses first
  if (cacheKey && STATIC_RESPONSES[cacheKey]) {
    return STATIC_RESPONSES[cacheKey];
  }

  // Check dynamic cache
  const cached = responseCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.response;
  }

  return null;
}

// ============================================================================
// QUERY ANALYSIS - Improved classification
// ============================================================================

const TRIVIAL_PATTERNS = [
  /^(hi|hey|hello|yo|sup|hiya|howdy)[\s!?.]*$/i,
  /^(thanks|thank you|thx|ty)[\s!?.]*$/i,
  /^(ok|okay|sure|cool|nice|great|awesome)[\s!?.]*$/i,
  /^(yes|no|yeah|nah|yep|nope)[\s!?.]*$/i,
  /^(bye|goodbye|later|see ya|cya)[\s!?.]*$/i,
  /^what('s| is) up\??$/i,
  /^how are you\??$/i,
  /^good (morning|afternoon|evening|night)[\s!?.]*$/i,
];

const SIMPLE_NAV_PATTERNS = [
  /^where (is|are|can i find|do i go)/i,
  /^how do i (get to|find|access|open)/i,
  /^go to/i,
  /^take me to/i,
  /^show me/i,
];

const COMPLEX_PATTERNS = [
  /\b(analyze|analysis|explain|why|how come|compare|correlation|pattern|trend|insight)\b/i,
  /\b(plan|strategy|recommend|suggest|advice|help me (with|to|figure))\b/i,
  /\b(summarize|summary|overview|report|breakdown)\b/i,
  /\b(what should i|how can i|how do i) (?!get to|find|access)/i,
  /\b(improve|optimize|better|increase|decrease)\b/i,
  /\b(over the (past|last)|this (week|month)|compared to|vs|versus)\b/i,
];

const TOPIC_KEYWORDS: Record<QueryTopic, RegExp[]> = {
  greeting: [/^(hi|hey|hello|yo|sup|hiya|howdy|good morning|good afternoon|good evening)/i],
  navigation: [/\b(where|find|go to|navigate|page|section|how do i get|show me|take me)\b/i],
  fitness: [/\b(workout|exercise|gym|fitness|training|cardio|strength|run|lift|pr|personal record)\b/i],
  nutrition: [/\b(calorie|protein|carb|fat|meal|food|eat|diet|nutrition|macro)\b/i],
  tasks: [/\b(task|todo|productivity|project|work|deadline|complete|done)\b/i],
  finance: [/\b(money|budget|expense|saving|spend|financial|cost|income)\b/i],
  skills: [/\b(skill|learn|practice|level|progress|perk|ability)\b/i],
  journal: [/\b(journal|diary|mood|reflect|entry|write|feeling)\b/i],
  stats: [/\b(stat|level|xp|experience|progress|achievement)\b/i],
  streaks: [/\b(streak|consecutive|daily|maintain|break|lost)\b/i],
  help: [/\b(help|how does|what is|explain|tell me about)\b/i],
  general: [],
};

function analyzeQuery(message: string): { complexity: QueryComplexity; topics: QueryTopic[]; primaryTopic: QueryTopic } {
  const normalizedMsg = message.trim().toLowerCase();

  // Check for trivial patterns first (greetings, acknowledgments)
  for (const pattern of TRIVIAL_PATTERNS) {
    if (pattern.test(normalizedMsg)) {
      return { complexity: "trivial", topics: ["greeting"], primaryTopic: "greeting" };
    }
  }

  // Check for simple navigation
  for (const pattern of SIMPLE_NAV_PATTERNS) {
    if (pattern.test(normalizedMsg)) {
      return { complexity: "simple", topics: ["navigation"], primaryTopic: "navigation" };
    }
  }

  // Check for complex patterns
  for (const pattern of COMPLEX_PATTERNS) {
    if (pattern.test(normalizedMsg)) {
      const topics = detectTopics(normalizedMsg);
      return { complexity: "complex", topics, primaryTopic: topics[0] || "general" };
    }
  }

  // Detect topics
  const topics = detectTopics(normalizedMsg);

  // Determine complexity based on message characteristics
  const wordCount = normalizedMsg.split(/\s+/).length;
  const hasQuestion = normalizedMsg.includes("?");

  if (wordCount <= 5 && !hasQuestion) {
    return { complexity: "simple", topics, primaryTopic: topics[0] || "general" };
  }

  if (wordCount > 20 || (hasQuestion && wordCount > 10)) {
    return { complexity: "moderate", topics, primaryTopic: topics[0] || "general" };
  }

  return { complexity: "simple", topics, primaryTopic: topics[0] || "general" };
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
// MODEL CONFIGURATION - Haiku-first approach
// ============================================================================

interface ModelConfig {
  model: string;
  maxTokens: number;
  temperature: number;
}

function getModelConfig(complexity: QueryComplexity, explicitMode?: string): ModelConfig {
  // Respect explicit mode
  if (explicitMode && explicitMode !== "auto") {
    const configs: Record<string, ModelConfig> = {
      quick: { model: "claude-3-5-haiku-20241022", maxTokens: 100, temperature: 0.7 },
      standard: { model: "claude-3-5-haiku-20241022", maxTokens: 250, temperature: 0.7 },
      comprehensive: { model: "claude-sonnet-4-20250514", maxTokens: 600, temperature: 0.7 },
    };
    return configs[explicitMode] || configs.standard;
  }

  // Auto-select based on complexity - Haiku for most things
  switch (complexity) {
    case "trivial":
      return { model: "claude-3-5-haiku-20241022", maxTokens: 60, temperature: 0.8 };
    case "simple":
      return { model: "claude-3-5-haiku-20241022", maxTokens: 120, temperature: 0.7 };
    case "moderate":
      return { model: "claude-3-5-haiku-20241022", maxTokens: 200, temperature: 0.7 };
    case "complex":
      return { model: "claude-sonnet-4-20250514", maxTokens: 400, temperature: 0.7 };
  }
}

// ============================================================================
// SYSTEM PROMPT - Single source of truth
// ============================================================================

const CORE_PERSONALITY = `You are Nova, a wise and warm AI companion in LifeOS - a gamified personal life optimization app.

CORE IDENTITY:
- Calm, wise, genuinely caring - not robotic or overly enthusiastic
- Speak naturally like a trusted friend having a conversation
- You see the bigger picture of their life and growth journey

CRITICAL RULES (MUST follow):
- Use complete, grammatically correct sentences with natural contractions
- Vary sentence length - mix short and longer sentences
- Keep responses concise: 1-2 sentences for simple queries, 2-4 for detailed ones
- Match their energy - casual for casual, thoughtful for serious
- Ask at most ONE clarifying question per response - multiple questions overwhelm
- If the next step is obvious, just do it - don't ask for permission

ABSOLUTELY FORBIDDEN (NEVER do these):
- NEVER use asterisks, markdown formatting, or bullet points
- NEVER use excessive emojis or exclamation marks
- NEVER start responses with flattery ("Great question!", "That's awesome!", "I love that!")
- NEVER end with opt-in questions ("Would you like me to...?", "Want me to explain more?", "Should I...?")
- NEVER recite data unprompted - only mention stats when specifically asked
- NEVER give medical, legal, or professional financial advice - you present their data, not diagnose

HANDLING DIFFICULT MOMENTS:
- If user seems frustrated or struggling: empathise first, then offer help
- If user mentions mental health struggles: be supportive, suggest professional resources if serious
- If you don't have data for something: say so directly, don't make things up`;

const NAVIGATION_KNOWLEDGE = `
ROUTES (use these exact paths when asked "where"):
Dashboard: / | Productivity: /productivity | Health: /health | Journal: /journal
Calendar: /calendar | Skills: /skills | Financial: /financial | Character: /character
Quests: /quests | Social: /social | Settings: /settings | Modules: /modules`;

const GAMEPLAY_KNOWLEDGE = `
GAMEPLAY:
- XP: Earned from tasks (10-50), workouts (50-100), meals (10), journal (25), quests (50-500)
- Levels: XP requirements increase each level, unlock new features
- Streaks: Consecutive days of activity, break = reset, shields can protect
- Stats: Strength (workouts), Vitality (health), Intelligence (learning), Wisdom (+XP), Defense (streak protection)
- Prestige: Reset at level 100 for permanent 1.5x/2x XP bonus`;

const TONE_GUIDANCE = `
TONE BY SITUATION:
- Greeting: Warm, brief ("Hey! What's on your mind?")
- Stats query: Conversational, not clinical ("You've knocked out 5 tasks today - solid momentum!")
- Struggling: Empathize first ("That sounds tough. Want to talk through it?")
- Achievement: Genuine pride ("Now that's what I'm talking about.")
- Navigation: Direct and helpful ("Your journal is at /journal")`;

// Build the full cached system prompt
function buildSystemPrompt(): ContentBlock[] {
  const fullPrompt = `${CORE_PERSONALITY}

${NAVIGATION_KNOWLEDGE}

${GAMEPLAY_KNOWLEDGE}

${TONE_GUIDANCE}`;

  return [
    {
      type: "text",
      text: fullPrompt,
      cache_control: { type: "ephemeral" }
    }
  ];
}

// ============================================================================
// CONTEXT BUILDING - Topic-aware, minimal
// ============================================================================

function buildContextForTopics(context: UserContext | null, topics: QueryTopic[], primaryTopic: QueryTopic): string {
  if (!context) return "";

  const sections: string[] = [];
  const today = context.today;

  // Always include minimal context (with null checks)
  if (today?.date) {
    sections.push(`Time: ${today.date} (${today.day_of_week || 'Unknown'}, ${today.time_of_day || ''})`.trim());
  }

  // For greetings, just include the most important current info
  if (primaryTopic === "greeting") {
    if (today?.tasks?.total_count > 0) {
      sections.push(`Tasks: ${today.tasks.completed_count}/${today.tasks.total_count} done`);
    }
    if (context.streaks?.streaks?.[0]) {
      const s = context.streaks.streaks[0];
      sections.push(`Streak: ${s.current_count || s.count} days`);
    }
    return sections.join(" | ");
  }

  // For navigation, no extra context needed
  if (primaryTopic === "navigation") {
    return sections.join(" | ");
  }

  // Topic-specific context
  const includeAll = topics.includes("general") || topics.includes("stats");

  if (includeAll || topics.includes("tasks")) {
    if (today?.tasks?.total_count > 0) {
      sections.push(`Tasks: ${today.tasks.completed_count}/${today.tasks.total_count} done`);
      if (today.tasks.tasks?.length > 0) {
        const remaining = today.tasks.tasks.filter((t: any) => !t.completed).slice(0, 3);
        if (remaining.length > 0) {
          sections.push(`Remaining: ${remaining.map((t: any) => t.name).join(", ")}`);
        }
      }
    }
  }

  if (includeAll || topics.includes("nutrition")) {
    if (today?.nutrition?.calories > 0) {
      sections.push(`Nutrition: ${today.nutrition.calories}cal, ${today.nutrition.protein}g protein`);
    }
  }

  if (includeAll || topics.includes("fitness")) {
    if (context.fitness?.workouts_this_week > 0) {
      sections.push(`Workouts this week: ${context.fitness.workouts_this_week}`);
    }
  }

  if (includeAll || topics.includes("finance")) {
    const f = context.financial;
    if (f?.total_budget > 0) {
      const remaining = f.total_budget - (f.total_spent || 0);
      sections.push(`Budget: $${remaining.toFixed(0)} remaining of $${f.total_budget.toFixed(0)}`);
    }
  }

  if (includeAll || topics.includes("skills")) {
    if (context.skills?.active_skills > 0) {
      sections.push(`Skills: ${context.skills.active_skills} tracked, ${context.skills.total_practice_hours}h total`);
    }
  }

  if (includeAll || topics.includes("stats") || topics.includes("streaks")) {
    if (context.streaks?.streaks?.length > 0) {
      const topStreak = context.streaks.streaks[0];
      sections.push(`Top streak: ${topStreak.name || topStreak.module} - ${topStreak.current_count || topStreak.count} days`);
    }
    if (context.currency?.cosmic_credits > 0) {
      sections.push(`Credits: ${context.currency.cosmic_credits}`);
    }
  }

  // Include trend insights if available
  if (context.trends?.priorityInsights?.length > 0) {
    sections.push(`Alert: ${context.trends.priorityInsights[0]}`);
  }

  // Profile memories (important personal context)
  if (context.memories?.profile_memories?.length > 0) {
    const memories = context.memories.profile_memories
      .slice(0, 2)
      .map((m: any) => m.content)
      .join("; ");
    sections.push(`Remember: ${memories}`);
  }

  return sections.join(" | ");
}

// ============================================================================
// CONVERSATION OPTIMIZATION
// ============================================================================

function optimizeConversationHistory(messages: Message[], complexity: QueryComplexity): Message[] {
  // For trivial/simple queries, minimal history
  if (complexity === "trivial") {
    return messages.slice(-2);
  }

  if (complexity === "simple") {
    return messages.slice(-4);
  }

  // For moderate/complex, keep more but summarize old ones
  if (messages.length <= 6) {
    return messages;
  }

  const recentMessages = messages.slice(-4);
  const olderMessages = messages.slice(0, -4);

  // Create compact summary
  const summary = olderMessages
    .map(m => {
      const content = typeof m.content === "string" ? m.content : m.content.map(c => c.text).join(" ");
      const truncated = content.length > 80 ? content.slice(0, 80) + "..." : content;
      return `${m.role === "user" ? "U" : "A"}: ${truncated}`;
    })
    .join(" | ");

  const summaryMessage: Message = {
    role: "user",
    content: `[Earlier: ${summary}]`
  };

  return [summaryMessage, ...recentMessages];
}

// ============================================================================
// USER CONTEXT FETCHING
// ============================================================================

const contextCache = new Map<string, { context: UserContext; expiresAt: number }>();
const CONTEXT_CACHE_TTL_MS = 60 * 1000; // 1 minute

async function fetchUserContext(userId: string): Promise<UserContext | null> {
  try {
    // Check memory cache
    const cached = contextCache.get(userId);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.context;
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Try cached RPC first
    const { data, error } = await supabase.rpc('get_nova_user_context_cached', {
      p_user_id: userId,
      p_cache_ttl_minutes: 5
    });

    if (error) {
      // Fallback to uncached
      const { data: uncached } = await supabase.rpc('get_nova_user_context', { p_user_id: userId });
      return uncached as UserContext;
    }

    // Store in memory cache
    contextCache.set(userId, { context: data as UserContext, expiresAt: Date.now() + CONTEXT_CACHE_TTL_MS });

    // Limit cache size
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
    const { messages, stream = true, mode = "auto", skipCache = false } = body;

    if (!messages?.length) {
      return new Response(JSON.stringify({ error: "messages required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get the latest user message
    const lastUserMsg = [...messages].reverse().find(m => m.role === "user");
    const queryText = typeof lastUserMsg?.content === "string"
      ? lastUserMsg.content
      : lastUserMsg?.content?.map(c => c.text).join(" ") || "";

    // Analyze query
    const { complexity, topics, primaryTopic } = analyzeQuery(queryText);
    const config = getModelConfig(complexity, mode);

    console.log(`Nova V3: complexity=${complexity}, topic=${primaryTopic}, model=${config.model}`);

    // Try cached response for trivial/simple queries
    if (!skipCache && (complexity === "trivial" || complexity === "simple")) {
      const cachedResponse = tryGetCachedResponse(queryText, primaryTopic);
      if (cachedResponse) {
        console.log(`Nova V3: Using cached response for ${primaryTopic}`);

        if (stream) {
          // Stream the cached response
          const encoder = new TextEncoder();
          const readable = new ReadableStream({
            start(controller) {
              // Send words with slight delay for natural feel
              const words = cachedResponse.split(" ");
              words.forEach((word, i) => {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: (i > 0 ? " " : "") + word })}\n\n`));
              });
              controller.enqueue(encoder.encode("data: [DONE]\n\n"));
              controller.close();
            }
          });

          return new Response(readable, {
            headers: {
              ...corsHeaders,
              "Content-Type": "text/event-stream",
              "Cache-Control": "no-cache",
              "X-Model": "cached",
              "X-Complexity": complexity,
            },
          });
        }

        return new Response(
          JSON.stringify({
            success: true,
            content: cachedResponse,
            model: "cached",
            complexity,
            cached: true,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Fetch user context (only if needed)
    let userContextStr = "";
    const userId = await getUserIdFromAuth(req);
    if (userId && complexity !== "trivial") {
      const userContext = await fetchUserContext(userId);
      if (userContext) {
        userContextStr = buildContextForTopics(userContext, topics, primaryTopic);
      }
    }

    // Optimize conversation history
    const optimizedMessages = optimizeConversationHistory(messages, complexity);

    // Build system prompt with caching
    const systemBlocks = buildSystemPrompt();

    // Add user context if available
    if (userContextStr) {
      systemBlocks.push({
        type: "text",
        text: `\n\nUSER DATA: ${userContextStr}`
      });
    }

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

      // Fallback to Haiku if Sonnet fails
      if (config.model.includes("sonnet") && (response.status === 429 || response.status === 503)) {
        const fallbackPayload = {
          ...apiPayload,
          model: "claude-3-5-haiku-20241022",
          max_tokens: Math.min(config.maxTokens, 200),
        };

        const fallbackResponse = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": ANTHROPIC_API_KEY,
            "anthropic-version": "2023-06-01",
            "anthropic-beta": "prompt-caching-2024-07-31",
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
    console.error("Nova V3 error:", error);

    // Offline-friendly error response
    return new Response(JSON.stringify({
      error: (error as Error).message,
      offline_response: "I'm having trouble connecting right now. Check your internet connection and try again.",
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
