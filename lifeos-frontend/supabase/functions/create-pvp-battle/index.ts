/**
 * Create PvP Battle Edge Function
 *
 * Creates a new PvP battle and sends an invite to the opponent.
 * Returns both the battle and invite objects.
 */

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Default battle configuration
const DEFAULT_CONFIG = {
  DURATION_DAYS: 7,
  BASE_HP: 100,
  DEFAULT_POWER: 100,
};

interface CreateBattleRequest {
  inviter_id: string;
  invitee_id: string;
  battle_type?: 'standard' | 'ranked' | 'casual';
  duration_days?: number;
  inviter_loadout?: {
    perks?: string[];
    equipment?: Record<string, unknown>;
    power_rating?: number;
  };
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

    const body: CreateBattleRequest = await req.json();
    const {
      inviter_id,
      invitee_id,
      battle_type = 'standard',
      duration_days = DEFAULT_CONFIG.DURATION_DAYS,
      inviter_loadout,
    } = body;

    // Validate required fields
    if (!inviter_id || !invitee_id) {
      return new Response(
        JSON.stringify({ error: 'inviter_id and invitee_id are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (inviter_id === invitee_id) {
      return new Response(
        JSON.stringify({ error: 'Cannot challenge yourself' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check for existing pending battle between these players
    const { data: existingBattle } = await supabase
      .from('pvp_battles')
      .select('id')
      .or(`player1_id.eq.${inviter_id},player2_id.eq.${inviter_id}`)
      .or(`player1_id.eq.${invitee_id},player2_id.eq.${invitee_id}`)
      .in('status', ['pending', 'active'])
      .single();

    if (existingBattle) {
      return new Response(
        JSON.stringify({ error: 'An active or pending battle already exists between these players' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get inviter's power rating from loadout or stats
    let inviterPower = inviter_loadout?.power_rating || DEFAULT_CONFIG.DEFAULT_POWER;

    // Create the battle
    const { data: battle, error: battleError } = await supabase
      .from('pvp_battles')
      .insert({
        player1_id: inviter_id,
        player2_id: invitee_id,
        battle_type,
        duration_days,
        status: 'pending',
        player1_hp: DEFAULT_CONFIG.BASE_HP,
        player2_hp: DEFAULT_CONFIG.BASE_HP,
        player1_power: inviterPower,
        player1_loadout: inviter_loadout,
        player1_total_damage: 0,
        player2_total_damage: 0,
        player1_total_tasks: 0,
        player2_total_tasks: 0,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (battleError) throw battleError;

    // Create the invite
    const { data: invite, error: inviteError } = await supabase
      .from('pvp_invites')
      .insert({
        battle_id: battle.id,
        inviter_id,
        invitee_id,
        status: 'pending',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (inviteError) {
      // Clean up battle if invite creation fails
      await supabase.from('pvp_battles').delete().eq('id', battle.id);
      throw inviteError;
    }

    return new Response(
      JSON.stringify({ battle, invite }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Create battle error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
