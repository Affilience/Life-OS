// Supabase Edge Function: nova-embeddings
// Generates embeddings using OpenAI and stores/searches in Supabase

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmbeddingRequest {
  action: "embed" | "embed_and_store" | "search";
  text: string;
  userId?: string;
  contentType?: string;
  sourceId?: string;
  metadata?: Record<string, unknown>;
  limit?: number;
}

// Sleep helper for retries
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Generate embedding using OpenAI with retry logic
async function generateEmbedding(text: string, retries = 2): Promise<number[]> {
  if (!OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY not configured");
  }

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch("https://api.openai.com/v1/embeddings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "text-embedding-3-small", // Newer, better, cheaper model
          input: text.slice(0, 8000), // Limit input length
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error(`OpenAI API error (attempt ${attempt + 1}):`, response.status, error);

        // Don't retry on auth errors or invalid requests
        if (response.status === 401 || response.status === 400) {
          throw new Error(`OpenAI API error (${response.status}): ${error}`);
        }

        // Retry on rate limits or server errors
        if (attempt < retries && (response.status === 429 || response.status >= 500)) {
          const retryDelay = response.status === 429 ? 2000 : 500;
          await sleep(retryDelay * (attempt + 1));
          continue;
        }

        throw new Error(`OpenAI API error (${response.status}): ${error}`);
      }

      const data = await response.json();
      return data.data[0].embedding;
    } catch (error) {
      lastError = error as Error;
      if (attempt < retries) {
        console.log(`Retry ${attempt + 1}/${retries} after error:`, error);
        await sleep(500 * (attempt + 1));
      }
    }
  }

  throw lastError || new Error("Failed to generate embedding after retries");
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check for API key first
    if (!OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY is not set in environment");
      return new Response(
        JSON.stringify({
          error: "OpenAI API key not configured",
          hint: "Set OPENAI_API_KEY using: supabase secrets set OPENAI_API_KEY=sk-..."
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Log that we have a key (but not the key itself)
    console.log("OPENAI_API_KEY present:", OPENAI_API_KEY.substring(0, 10) + "...");

    const { action, text, userId, contentType, sourceId, metadata, limit = 5 } =
      await req.json() as EmbeddingRequest;

    if (!text) {
      return new Response(
        JSON.stringify({ error: "text is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with service role for database operations
    const supabase = createClient(
      SUPABASE_URL!,
      SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    );

    // Action: Just generate embedding
    if (action === "embed") {
      const embedding = await generateEmbedding(text);
      return new Response(
        JSON.stringify({ success: true, embedding }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Action: Generate and store embedding
    if (action === "embed_and_store") {
      if (!userId) {
        return new Response(
          JSON.stringify({ error: "userId is required for storage" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const embedding = await generateEmbedding(text);

      // Store in database
      const { data, error } = await supabase
        .from("nova_memory_embeddings")
        .insert({
          user_id: userId,
          content: text,
          content_type: contentType || "message",
          source_id: sourceId,
          embedding: embedding,
          metadata: metadata || {},
        })
        .select("id")
        .single();

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      return new Response(
        JSON.stringify({ success: true, id: data.id }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Action: Search similar memories
    if (action === "search") {
      if (!userId) {
        return new Response(
          JSON.stringify({ error: "userId is required for search" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const embedding = await generateEmbedding(text);

      // Use the match function from nova_memories table
      const { data, error } = await supabase
        .rpc("match_nova_memories", {
          query_embedding: embedding,
          p_user_id: userId,
          match_threshold: 0.7,
          match_count: limit,
        });

      if (error) {
        throw new Error(`Search error: ${error.message}`);
      }

      return new Response(
        JSON.stringify({ success: true, results: data || [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action. Use: embed, embed_and_store, or search" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Embeddings error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
