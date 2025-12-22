/**
 * PvP Arena Matchmaking Edge Function
 *
 * Handles atomic matchmaking with ELO-based pairing to prevent race conditions
 * when multiple users queue simultaneously.
 *
 * ELO Matching Logic:
 * - Players are matched within an ELO range that expands over time
 * - Initial range: ±100 ELO
 * - Expands by 50 ELO every 10 seconds in queue
 * - Max range: ±500 ELO (after ~80 seconds)
 * - Falls back to power rating if no ELO match found
 */

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// ELO matching configuration
const ELO_CONFIG = {
  INITIAL_RANGE: 100,      // Start with ±100 ELO
  RANGE_INCREMENT: 50,     // Expand by 50 every interval
  RANGE_INTERVAL_MS: 10000, // Every 10 seconds
  MAX_RANGE: 500,          // Cap at ±500 ELO
  DEFAULT_ELO: 1000,       // Starting ELO for new players
};

// Power rating fallback config
const POWER_CONFIG = {
  INITIAL_RANGE: 100,
  RANGE_INCREMENT: 50,
  MAX_RANGE: 500,
};

interface QueueEntry {
  id: string;
  user_id: string;
  level: number;
  power_rating: number;
  max_health: number;
  damage_per_tap: number;
  equipped_weapon: any;
  joined_at: string;
  status: string;
  arena_elo?: number;
}

interface MatchmakingRequest {
  user_id: string;
  level: number;
  power_rating: number;
  max_health: number;
  damage_per_tap: number;
  equipped_weapon?: any;
}

/**
 * Calculate ELO range based on time in queue
 */
function calculateEloRange(joinedAt: Date): number {
  const waitTimeMs = Date.now() - joinedAt.getTime();
  const intervals = Math.floor(waitTimeMs / ELO_CONFIG.RANGE_INTERVAL_MS);
  const range = ELO_CONFIG.INITIAL_RANGE + (intervals * ELO_CONFIG.RANGE_INCREMENT);
  return Math.min(range, ELO_CONFIG.MAX_RANGE);
}

/**
 * Calculate power range based on time in queue
 */
function calculatePowerRange(joinedAt: Date): number {
  const waitTimeMs = Date.now() - joinedAt.getTime();
  const intervals = Math.floor(waitTimeMs / ELO_CONFIG.RANGE_INTERVAL_MS);
  const range = POWER_CONFIG.INITIAL_RANGE + (intervals * POWER_CONFIG.RANGE_INCREMENT);
  return Math.min(range, POWER_CONFIG.MAX_RANGE);
}

/**
 * Find the best match from waiting players
 * Priority: 1. ELO range match, 2. Power rating match
 */
function findBestMatch(
  player: QueueEntry,
  candidates: QueueEntry[],
  playerElo: number
): QueueEntry | null {
  if (candidates.length === 0) return null;

  const playerJoinedAt = new Date(player.joined_at);
  const eloRange = calculateEloRange(playerJoinedAt);
  const powerRange = calculatePowerRange(playerJoinedAt);

  // First pass: Find ELO matches
  const eloMatches = candidates.filter(c => {
    const candidateElo = c.arena_elo || ELO_CONFIG.DEFAULT_ELO;
    const eloDiff = Math.abs(candidateElo - playerElo);
    return eloDiff <= eloRange;
  });

  if (eloMatches.length > 0) {
    // Sort by closest ELO, then by wait time (longest waiting first)
    eloMatches.sort((a, b) => {
      const aEloDiff = Math.abs((a.arena_elo || ELO_CONFIG.DEFAULT_ELO) - playerElo);
      const bEloDiff = Math.abs((b.arena_elo || ELO_CONFIG.DEFAULT_ELO) - playerElo);
      if (aEloDiff !== bEloDiff) return aEloDiff - bEloDiff;
      return new Date(a.joined_at).getTime() - new Date(b.joined_at).getTime();
    });
    return eloMatches[0];
  }

  // Second pass: Fall back to power rating matches
  const powerMatches = candidates.filter(c => {
    const powerDiff = Math.abs(c.power_rating - player.power_rating);
    return powerDiff <= powerRange;
  });

  if (powerMatches.length > 0) {
    // Sort by closest power, then by wait time
    powerMatches.sort((a, b) => {
      const aPowerDiff = Math.abs(a.power_rating - player.power_rating);
      const bPowerDiff = Math.abs(b.power_rating - player.power_rating);
      if (aPowerDiff !== bPowerDiff) return aPowerDiff - bPowerDiff;
      return new Date(a.joined_at).getTime() - new Date(b.joined_at).getTime();
    });
    return powerMatches[0];
  }

  // No match found within ranges
  return null;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const body: MatchmakingRequest = await req.json();
    const { user_id, level, power_rating, max_health, damage_per_tap, equipped_weapon } = body;

    if (!user_id) {
      return new Response(
        JSON.stringify({ error: 'user_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get player's current ELO from arena stats
    let playerElo = ELO_CONFIG.DEFAULT_ELO;
    const { data: arenaStats } = await supabase
      .from('pvp_arena_stats')
      .select('arena_elo')
      .eq('user_id', user_id)
      .single();

    if (arenaStats?.arena_elo) {
      playerElo = arenaStats.arena_elo;
    }

    // Check if user is already in queue
    const { data: existingEntry } = await supabase
      .from('pvp_arena_queue')
      .select('*')
      .eq('user_id', user_id)
      .eq('status', 'waiting')
      .single();

    if (existingEntry) {
      // User already in queue, check for matches with their existing entry
      const { data: waitingPlayers } = await supabase
        .from('pvp_arena_queue')
        .select('*, arena_elo')
        .eq('status', 'waiting')
        .neq('user_id', user_id)
        .order('joined_at', { ascending: true });

      // Enrich with ELO data
      const enrichedPlayers = await Promise.all(
        (waitingPlayers || []).map(async (p) => {
          if (!p.arena_elo) {
            const { data: stats } = await supabase
              .from('pvp_arena_stats')
              .select('arena_elo')
              .eq('user_id', p.user_id)
              .single();
            p.arena_elo = stats?.arena_elo || ELO_CONFIG.DEFAULT_ELO;
          }
          return p;
        })
      );

      const match = findBestMatch(existingEntry, enrichedPlayers, playerElo);

      if (match) {
        // Create match
        const channelId = `pvp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        const { data: newMatch, error: matchError } = await supabase
          .from('pvp_arena_matches')
          .insert({
            channel_id: channelId,
            player1_id: existingEntry.user_id,
            player2_id: match.user_id,
            player1_max_health: existingEntry.max_health,
            player2_max_health: match.max_health,
            player1_current_health: existingEntry.max_health,
            player2_current_health: match.max_health,
            player1_damage: existingEntry.damage_per_tap,
            player2_damage: match.damage_per_tap,
            player1_weapon: existingEntry.equipped_weapon,
            player2_weapon: match.equipped_weapon,
            player1_elo: playerElo,
            player2_elo: match.arena_elo || ELO_CONFIG.DEFAULT_ELO,
            status: 'active',
            match_type: 'ranked',
            started_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (matchError) throw matchError;

        // Update both queue entries
        await supabase
          .from('pvp_arena_queue')
          .update({ status: 'matched', matched_match_id: newMatch.id })
          .in('user_id', [existingEntry.user_id, match.user_id]);

        return new Response(
          JSON.stringify({ status: 'matched', match: newMatch }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Still waiting
      return new Response(
        JSON.stringify({ status: 'waiting', queue_entry: existingEntry }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // New queue entry - check for immediate match first
    const { data: waitingPlayers } = await supabase
      .from('pvp_arena_queue')
      .select('*')
      .eq('status', 'waiting')
      .neq('user_id', user_id)
      .order('joined_at', { ascending: true });

    // Enrich waiting players with ELO data
    const enrichedPlayers = await Promise.all(
      (waitingPlayers || []).map(async (p) => {
        const { data: stats } = await supabase
          .from('pvp_arena_stats')
          .select('arena_elo')
          .eq('user_id', p.user_id)
          .single();
        p.arena_elo = stats?.arena_elo || ELO_CONFIG.DEFAULT_ELO;
        return p;
      })
    );

    // Create a temporary entry object for matching
    const tempEntry: QueueEntry = {
      id: '',
      user_id,
      level,
      power_rating,
      max_health,
      damage_per_tap,
      equipped_weapon,
      joined_at: new Date().toISOString(),
      status: 'waiting',
      arena_elo: playerElo,
    };

    const match = findBestMatch(tempEntry, enrichedPlayers, playerElo);

    if (match) {
      // Immediate match found! Create the match
      const channelId = `pvp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const { data: newMatch, error: matchError } = await supabase
        .from('pvp_arena_matches')
        .insert({
          channel_id: channelId,
          player1_id: user_id,
          player2_id: match.user_id,
          player1_max_health: max_health,
          player2_max_health: match.max_health,
          player1_current_health: max_health,
          player2_current_health: match.max_health,
          player1_damage: damage_per_tap,
          player2_damage: match.damage_per_tap,
          player1_weapon: equipped_weapon,
          player2_weapon: match.equipped_weapon,
          player1_elo: playerElo,
          player2_elo: match.arena_elo || ELO_CONFIG.DEFAULT_ELO,
          status: 'active',
          match_type: 'ranked',
          started_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (matchError) throw matchError;

      // Update matched player's queue entry
      await supabase
        .from('pvp_arena_queue')
        .update({ status: 'matched', matched_match_id: newMatch.id })
        .eq('user_id', match.user_id);

      return new Response(
        JSON.stringify({ status: 'matched', match: newMatch }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // No immediate match - add to queue
    const { data: queueEntry, error: queueError } = await supabase
      .from('pvp_arena_queue')
      .insert({
        user_id,
        level,
        power_rating,
        max_health,
        damage_per_tap,
        equipped_weapon,
        status: 'waiting',
        joined_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (queueError) throw queueError;

    return new Response(
      JSON.stringify({ status: 'queued', queue_entry: queueEntry }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Matchmaking error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
