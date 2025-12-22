/**
 * Update Battle Progress Edge Function
 *
 * Records daily task progress and calculates damage dealt in PvP battles.
 * Handles critical hits, streak bonuses, and battle completion.
 */

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Battle configuration
const BATTLE_CONFIG = {
  BASE_DAMAGE_PER_TASK: 10,
  STREAK_BONUS_MULTIPLIER: 0.1, // 10% per streak day
  MAX_STREAK_BONUS: 0.5, // 50% max
  CRIT_CHANCE: 0.15, // 15% crit chance
  CRIT_MULTIPLIER: 1.5,
  BASE_HP: 100,
};

interface UpdateProgressRequest {
  battle_id: string;
  user_id: string;
  tasks_completed: number;
  streak_days?: number;
}

// Calculate damage based on tasks and bonuses
function calculateDamage(tasksCompleted: number, streakDays: number): { damage: number; crit: boolean } {
  let baseDamage = tasksCompleted * BATTLE_CONFIG.BASE_DAMAGE_PER_TASK;

  // Apply streak bonus
  const streakBonus = Math.min(
    streakDays * BATTLE_CONFIG.STREAK_BONUS_MULTIPLIER,
    BATTLE_CONFIG.MAX_STREAK_BONUS
  );
  baseDamage *= (1 + streakBonus);

  // Check for critical hit
  const crit = Math.random() < BATTLE_CONFIG.CRIT_CHANCE;
  if (crit) {
    baseDamage *= BATTLE_CONFIG.CRIT_MULTIPLIER;
  }

  return {
    damage: Math.round(baseDamage),
    crit,
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

    const body: UpdateProgressRequest = await req.json();
    const { battle_id, user_id, tasks_completed, streak_days = 0 } = body;

    if (!battle_id || !user_id) {
      return new Response(
        JSON.stringify({ error: 'battle_id and user_id are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (tasks_completed < 0) {
      return new Response(
        JSON.stringify({ error: 'tasks_completed must be non-negative' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the battle
    const { data: battle, error: battleError } = await supabase
      .from('pvp_battles')
      .select('*')
      .eq('id', battle_id)
      .single();

    if (battleError || !battle) {
      return new Response(
        JSON.stringify({ error: 'Battle not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (battle.status !== 'active') {
      return new Response(
        JSON.stringify({ error: 'Battle is not active' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Determine which player is attacking
    const isPlayer1 = battle.player1_id === user_id;
    const isPlayer2 = battle.player2_id === user_id;

    if (!isPlayer1 && !isPlayer2) {
      return new Response(
        JSON.stringify({ error: 'User is not part of this battle' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate damage
    const { damage, crit } = calculateDamage(tasks_completed, streak_days);

    // Get current HP values
    const defenderCurrentHP = isPlayer1 ? battle.player2_hp : battle.player1_hp;
    const newDefenderHP = Math.max(0, defenderCurrentHP - damage);

    // Build update object
    const battleUpdate: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (isPlayer1) {
      battleUpdate.player2_hp = newDefenderHP;
      battleUpdate.player1_total_damage = (battle.player1_total_damage || 0) + damage;
      battleUpdate.player1_total_tasks = (battle.player1_total_tasks || 0) + tasks_completed;
    } else {
      battleUpdate.player1_hp = newDefenderHP;
      battleUpdate.player2_total_damage = (battle.player2_total_damage || 0) + damage;
      battleUpdate.player2_total_tasks = (battle.player2_total_tasks || 0) + tasks_completed;
    }

    // Check if battle should end (opponent HP at 0)
    let battleEnded = false;
    if (newDefenderHP <= 0) {
      battleEnded = true;
      battleUpdate.status = 'completed';
      battleUpdate.winner_id = user_id;
      battleUpdate.completed_at = new Date().toISOString();
    }

    // Update battle
    const { error: updateError } = await supabase
      .from('pvp_battles')
      .update(battleUpdate)
      .eq('id', battle_id);

    if (updateError) throw updateError;

    // Update today's battle day entry
    const today = new Date().toISOString().split('T')[0];
    const dayColumn = isPlayer1 ? 'player1' : 'player2';

    const { data: existingDay } = await supabase
      .from('pvp_battle_days')
      .select('*')
      .eq('battle_id', battle_id)
      .eq('day_date', today)
      .single();

    if (existingDay) {
      await supabase
        .from('pvp_battle_days')
        .update({
          [`${dayColumn}_tasks`]: existingDay[`${dayColumn}_tasks`] + tasks_completed,
          [`${dayColumn}_damage`]: existingDay[`${dayColumn}_damage`] + damage,
        })
        .eq('id', existingDay.id);
    }

    return new Response(
      JSON.stringify({
        damage,
        defenderHP: newDefenderHP,
        battleEnded,
        crit,
        tasksRecorded: tasks_completed,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Update progress error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
