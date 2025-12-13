/**
 * Nova Memory Extraction Edge Function
 *
 * Uses Claude to extract key facts, preferences, and insights from conversations.
 * This is the "subconscious" memory formation process that runs after conversations.
 *
 * Memory Types Extracted:
 * - profile: User identity info (name, age, preferences)
 * - semantic: Facts and knowledge about the user
 * - episodic: Specific events and achievements
 * - procedural: How the user likes to be helped
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ExtractedMemory {
  type: "episodic" | "semantic" | "procedural" | "profile";
  content: string;
  importance: number;
  structuredData?: Record<string, unknown>;
}

interface ExtractionRequest {
  messages: Message[];
  userId: string;
}

/**
 * System prompt for memory extraction
 * Guides Claude to extract meaningful facts from conversations
 */
const EXTRACTION_SYSTEM_PROMPT = `You are a memory extraction system for Nova, an AI companion. Your job is to analyze conversations and extract key facts worth remembering.

Extract ONLY genuinely useful information. Don't extract:
- Generic statements or small talk
- Things Nova said (only extract user info)
- Temporary states ("I'm tired today")
- Obvious inferences

DO extract:
- User's name, age, or identity info → type: "profile"
- Preferences and habits → type: "semantic"
- Specific achievements or events → type: "episodic"
- How the user likes to communicate → type: "procedural"

For each memory, assign an importance score (0.0-1.0):
- 1.0: Core identity info (name, major life facts)
- 0.8: Strong preferences or significant achievements
- 0.6: Useful facts and patterns
- 0.4: Minor preferences
- 0.2: Weak signals

Output format (JSON array):
[
  {
    "type": "profile",
    "content": "User's name is Taylor",
    "importance": 1.0,
    "structuredData": {"subject": "user", "predicate": "name_is", "object": "Taylor"}
  },
  {
    "type": "semantic",
    "content": "User prefers morning workouts",
    "importance": 0.7,
    "structuredData": {"subject": "user", "predicate": "prefers", "object": "morning workouts"}
  }
]

If there's nothing meaningful to extract, return an empty array: []

Remember: Quality over quantity. Only extract memories that would genuinely help Nova be a better companion.`;

/**
 * Extract memories using Claude
 */
async function extractWithClaude(
  messages: Message[]
): Promise<ExtractedMemory[]> {
  if (!ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY not configured");
  }

  // Format conversation for analysis
  const conversationText = messages
    .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
    .join("\n\n");

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-3-5-haiku-20241022", // Fast and cheap for extraction
      max_tokens: 1024,
      system: EXTRACTION_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Analyze this conversation and extract memorable facts:\n\n${conversationText}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("Claude API error:", error);
    throw new Error(`Claude API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.content?.[0]?.text || "[]";

  // Parse the JSON response
  try {
    // Handle markdown code blocks
    let jsonStr = content.trim();
    if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/```json?\n?/g, "").replace(/```/g, "");
    }

    const memories = JSON.parse(jsonStr);
    return Array.isArray(memories) ? memories : [];
  } catch (e) {
    console.error("Failed to parse extraction response:", content);
    return [];
  }
}

/**
 * Generate embedding for a memory
 */
async function generateEmbedding(text: string): Promise<number[] | null> {
  if (!OPENAI_API_KEY) {
    console.warn("OPENAI_API_KEY not set, skipping embedding generation");
    return null;
  }

  try {
    const response = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "text-embedding-3-small",
        input: text.slice(0, 8000),
      }),
    });

    if (!response.ok) {
      console.error("Embedding generation failed:", await response.text());
      return null;
    }

    const data = await response.json();
    return data.data[0].embedding;
  } catch (error) {
    console.error("Error generating embedding:", error);
    return null;
  }
}

/**
 * Store extracted memories in the database
 */
async function storeMemories(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  memories: ExtractedMemory[]
): Promise<number> {
  let stored = 0;

  for (const memory of memories) {
    try {
      // Generate embedding for semantic search
      const embedding = await generateEmbedding(memory.content);

      const { error } = await supabase.from("nova_memories").insert({
        user_id: userId,
        memory_type: memory.type,
        content: memory.content,
        structured_data: memory.structuredData || {},
        embedding,
        importance: memory.importance,
        source_type: "conversation",
      });

      if (error) {
        console.error("Error storing memory:", error);
      } else {
        stored++;
      }
    } catch (error) {
      console.error("Error processing memory:", error);
    }
  }

  return stored;
}

/**
 * Check for duplicate/similar memories before storing
 */
async function filterDuplicates(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  memories: ExtractedMemory[]
): Promise<ExtractedMemory[]> {
  const unique: ExtractedMemory[] = [];

  for (const memory of memories) {
    // Check for existing similar memory
    const { data: existing } = await supabase
      .from("nova_memories")
      .select("content")
      .eq("user_id", userId)
      .eq("memory_type", memory.type)
      .eq("is_active", true)
      .ilike("content", `%${memory.content.slice(0, 50)}%`)
      .limit(1);

    if (!existing || existing.length === 0) {
      unique.push(memory);
    }
  }

  return unique;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, userId } = (await req.json()) as ExtractionRequest;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "messages array is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!userId) {
      return new Response(JSON.stringify({ error: "userId is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create Supabase client
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!, {
      auth: { persistSession: false },
    });

    // Extract memories using Claude
    console.log(`Extracting memories from ${messages.length} messages...`);
    const extracted = await extractWithClaude(messages);
    console.log(`Extracted ${extracted.length} potential memories`);

    if (extracted.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          memories: [],
          stored: 0,
          message: "No memorable facts found in conversation",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Filter out duplicates
    const unique = await filterDuplicates(supabase, userId, extracted);
    console.log(`${unique.length} unique memories after filtering`);

    // Store the memories
    const stored = await storeMemories(supabase, userId, unique);

    return new Response(
      JSON.stringify({
        success: true,
        memories: unique,
        stored,
        filtered: extracted.length - unique.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Memory extraction error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
