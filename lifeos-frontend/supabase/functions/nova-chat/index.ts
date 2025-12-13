// Supabase Edge Function: nova-chat
// Nova AI companion chat using Claude Sonnet
// Supports both regular and streaming responses

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatRequest {
  messages: Message[];
  system?: string;
  stream?: boolean;
  userContext?: string; // Optional context summary from frontend
}

// LifeOS Knowledge Base - baked in for fast access
const LIFEOS_KNOWLEDGE = {
  routes: {
    dashboard: { path: "/", description: "Main dashboard with widgets, stats overview, quick actions" },
    modules: { path: "/modules", description: "Grid of all available modules" },
    productivity: { path: "/productivity", description: "Tasks, projects, deep work tracking, daily planning" },
    health: { path: "/health", description: "Nutrition tracking, workouts, sleep, cardio, supplements" },
    knowledge: { path: "/knowledge", description: "Notes, books, learning logs, ideas, quotes" },
    journal: { path: "/journal", description: "Daily journal entries, mood tracking, reflection prompts" },
    calendar: { path: "/calendar", description: "Time blocking, schedule, day/week/month views" },
    skills: { path: "/skills", description: "Skill tracking, practice logs, perk trees" },
    financial: { path: "/financial", description: "Budget, expenses, income, goals, net worth" },
    character: { path: "/character", description: "Avatar, equipment, evolution stages, companions" },
    quests: { path: "/quests", description: "Daily/weekly quests, achievements, streaks, missions" },
    social: { path: "/social", description: "Friends, leaderboard, guilds" },
    settings: { path: "/settings", description: "App settings, theme, notifications, data export" },
    resolutions: { path: "/resolutions", description: "New Year resolutions, yearly goals" }
  },
  features: {
    gamification: "XP system, 40 evolution stages (Dreamer to Avatar of Mastery), streaks, achievements, equipment with stat bonuses",
    avatar: "Evolves through 40 stages based on level. Equipment provides bonuses. Companions can be unlocked.",
    streaks: "Consecutive day tracking for habits. Breaking streaks loses progress. Shields can protect streaks.",
    quests: "Daily quests reset at midnight. Weekly quests on Monday. Achievements are permanent unlocks.",
    nova: "AI companion (that's you!) that evolves: Spark (Lv 0-9), Nova (Lv 10-24), Stellar (Lv 25-49), Cosmos (Lv 50+)"
  }
};

// Build knowledge context string
const KNOWLEDGE_CONTEXT = `
LIFEOS NAVIGATION (tell users these exact routes):
${Object.entries(LIFEOS_KNOWLEDGE.routes).map(([name, info]) => `- ${name}: ${info.path} - ${info.description}`).join('\n')}

KEY FEATURES:
${Object.entries(LIFEOS_KNOWLEDGE.features).map(([name, desc]) => `- ${name}: ${desc}`).join('\n')}
`;

// Default system prompt for Nova
const DEFAULT_SYSTEM_PROMPT = `You are Nova, a mystical AI companion for LifeOS - a personal operating system for life optimization.

${KNOWLEDGE_CONTEXT}

YOUR PERSONALITY:
- You are wise, encouraging, and genuinely invested in the user's growth
- You speak in a warm but professional tone - supportive without being sycophantic
- You're direct and give actionable advice
- You celebrate wins enthusiastically but don't overdo it
- When concerned (low progress, broken streaks), you're supportive not judgmental

GUIDELINES:
- Keep responses SHORT (2-3 sentences max) unless asked for detailed help
- When asked "where" questions, give the EXACT route path (e.g., "Go to /health for nutrition tracking")
- Provide specific, actionable suggestions
- Use a warm, supportive, PROFESSIONAL tone
- NEVER use asterisks (*), excessive emojis, or roleplay actions
- Write in clear, direct sentences without decorative formatting
- If they're doing well, acknowledge it briefly
- If they're struggling, offer concrete help without being preachy`;

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY not configured");
    }

    const { messages, system, stream, userContext } = await req.json() as ChatRequest;

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "messages array is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build system prompt with user context if provided
    let systemPrompt = system || DEFAULT_SYSTEM_PROMPT;
    if (userContext) {
      systemPrompt = `${systemPrompt}\n\nCURRENT USER CONTEXT:\n${userContext}`;
    }

    // Streaming response
    if (stream) {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-3-5-haiku-20241022",
          max_tokens: 256, // Reduced for faster responses
          system: systemPrompt,
          messages,
          stream: true,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Claude API error: ${error}`);
      }

      // Transform the response stream
      const transformStream = new TransformStream({
        async transform(chunk, controller) {
          const text = new TextDecoder().decode(chunk);
          const lines = text.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") {
                controller.enqueue(new TextEncoder().encode("data: [DONE]\n\n"));
                continue;
              }

              try {
                const parsed = JSON.parse(data);
                if (parsed.type === "content_block_delta" && parsed.delta?.text) {
                  controller.enqueue(
                    new TextEncoder().encode(`data: ${JSON.stringify({ text: parsed.delta.text })}\n\n`)
                  );
                }
              } catch {
                // Ignore parse errors for incomplete chunks
              }
            }
          }
        },
      });

      const readableStream = response.body?.pipeThrough(transformStream);

      return new Response(readableStream, {
        headers: {
          ...corsHeaders,
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
        },
      });
    }

    // Non-streaming response
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-5-haiku-20241022",
        max_tokens: 256, // Reduced for faster responses
        system: systemPrompt,
        messages,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Claude API error: ${error}`);
    }

    const data = await response.json();

    // Extract the text content
    const content = data.content?.[0]?.text || "";

    return new Response(
      JSON.stringify({
        success: true,
        content,
        usage: data.usage,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Nova chat error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
