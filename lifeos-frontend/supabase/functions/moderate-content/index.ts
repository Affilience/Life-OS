/**
 * Content Moderation Edge Function
 * Analyzes text content for toxicity, spam, and guideline violations
 */

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Toxicity patterns (basic keyword detection)
const TOXIC_PATTERNS = {
  hate_speech: [
    /\b(hate|kill|die|murder)\s+(all|every)\s+\w+/gi,
    /\b(racial|ethnic)\s+slur/gi,
  ],
  harassment: [
    /\b(you('re|r)?\s+)?(stupid|idiot|moron|dumb|loser|pathetic)\b/gi,
    /\bkill\s+your\s*self\b/gi,
    /\bgo\s+die\b/gi,
  ],
  threats: [
    /\bi('ll|m\s+going\s+to|will)\s+(kill|hurt|harm|destroy)\s+(you|u)\b/gi,
    /\b(threat|threaten)\w*\b/gi,
  ],
  spam: [
    /(.)\1{5,}/g, // Repeated characters
    /(https?:\/\/[^\s]+\s*){3,}/gi, // Multiple links
    /\b(buy|click|subscribe|follow)\s+(now|here|this)\b/gi,
  ],
  sexual_content: [
    /\b(porn|xxx|nsfw|nude|naked)\b/gi,
  ],
  personal_info: [
    /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g, // Phone numbers
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, // Emails
    /\b\d{3}[-.\s]?\d{2}[-.\s]?\d{4}\b/g, // SSN pattern
  ],
};

// Profanity list (basic - can be expanded)
const PROFANITY_LIST = [
  'fuck', 'shit', 'ass', 'bitch', 'damn', 'crap', 'bastard',
  'dick', 'cock', 'pussy', 'cunt', 'fag', 'retard', 'nigger', 'nigga'
];

// Severity weights
const SEVERITY_WEIGHTS = {
  hate_speech: 1.0,
  harassment: 0.9,
  threats: 1.0,
  spam: 0.5,
  sexual_content: 0.7,
  personal_info: 0.8,
  profanity: 0.4,
};

interface ModerationResult {
  is_safe: boolean;
  should_block: boolean;
  requires_review: boolean;
  toxicity_score: number;
  categories: {
    hate_speech: number;
    harassment: number;
    threats: number;
    spam: number;
    sexual_content: number;
    personal_info: number;
    profanity: number;
  };
  flagged_items: string[];
  filtered_content: string;
}

function analyzeContent(text: string): ModerationResult {
  const categories = {
    hate_speech: 0,
    harassment: 0,
    threats: 0,
    spam: 0,
    sexual_content: 0,
    personal_info: 0,
    profanity: 0,
  };

  const flaggedItems: string[] = [];
  let filteredContent = text;
  const lowerText = text.toLowerCase();

  // Check each toxic pattern category
  for (const [category, patterns] of Object.entries(TOXIC_PATTERNS)) {
    for (const pattern of patterns) {
      const matches = text.match(pattern);
      if (matches) {
        categories[category as keyof typeof categories] = Math.min(
          1,
          categories[category as keyof typeof categories] + matches.length * 0.3
        );
        flaggedItems.push(`${category}: ${matches.join(', ')}`);
      }
    }
  }

  // Check profanity
  for (const word of PROFANITY_LIST) {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = lowerText.match(regex);
    if (matches) {
      categories.profanity = Math.min(1, categories.profanity + matches.length * 0.2);
      flaggedItems.push(`profanity: ${word}`);
      // Replace profanity with asterisks
      filteredContent = filteredContent.replace(regex, '*'.repeat(word.length));
    }
  }

  // Calculate overall toxicity score
  let toxicityScore = 0;
  for (const [category, score] of Object.entries(categories)) {
    toxicityScore += score * SEVERITY_WEIGHTS[category as keyof typeof SEVERITY_WEIGHTS];
  }
  toxicityScore = Math.min(1, toxicityScore / Object.keys(categories).length);

  // Determine action thresholds
  const maxCategoryScore = Math.max(...Object.values(categories));
  const shouldBlock = maxCategoryScore >= 0.85 ||
    categories.threats >= 0.5 ||
    categories.hate_speech >= 0.7;
  const requiresReview = maxCategoryScore >= 0.5 && !shouldBlock;
  const isSafe = maxCategoryScore < 0.3;

  return {
    is_safe: isSafe,
    should_block: shouldBlock,
    requires_review: requiresReview,
    toxicity_score: Math.round(toxicityScore * 1000) / 1000,
    categories,
    flagged_items: flaggedItems,
    filtered_content: filteredContent,
  };
}

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { content, content_type, user_id, store_result } = await req.json();

    if (!content || typeof content !== 'string') {
      return new Response(JSON.stringify({
        error: 'Content is required and must be a string'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Analyze the content
    const result = analyzeContent(content);

    // Optionally store the result in database for review
    if (store_result && (result.should_block || result.requires_review)) {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      await supabase.from('content_flags').insert({
        user_id: user_id || null,
        content_type: content_type || 'unknown',
        content_text: content,
        toxicity_score: result.toxicity_score,
        categories: result.categories,
        auto_blocked: result.should_block,
        requires_review: result.requires_review,
      });
    }

    return new Response(JSON.stringify({
      success: true,
      data: result,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Moderation error:', error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Internal server error',
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
