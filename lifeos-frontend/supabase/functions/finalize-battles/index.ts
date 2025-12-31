/**
 * Finalize Battles Edge Function
 *
 * Checks for expired battles and finalizes them by:
 * - Determining winners based on HP or damage dealt
 * - Updating battle status to completed
 * - Handling draws when damage is equal
 *
 * Should be called periodically (on app load, via cron, etc.)
 */

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface BattleResult {
  battle_id: string;
  winner_id: string | null;
  is_draw: boolean;
  player1_final_hp: number;
  player2_final_hp: number;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Allow both POST and GET for flexibility (cron jobs often use GET)
  if (req.method !== 'POST' && req.method !== 'GET') {
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

    const now = new Date();

    // Find all expired active battles (using ends_at column)
    const { data: expiredBattles, error: fetchError } = await supabase
      .from('pvp_battles')
      .select('*')
      .eq('status', 'active')
      .lt('ends_at', now.toISOString());

    if (fetchError) throw fetchError;

    if (!expiredBattles || expiredBattles.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No expired battles to finalize', finalized: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const results: BattleResult[] = [];

    for (const battle of expiredBattles) {
      // Determine winner based on HP remaining
      const player1HP = battle.player1_current_hp ?? battle.player1_max_hp ?? 100;
      const player2HP = battle.player2_current_hp ?? battle.player2_max_hp ?? 100;

      let winnerId: string | null = null;
      let isDraw = false;

      // Compare HP - higher HP wins
      if (player1HP !== player2HP) {
        winnerId = player1HP > player2HP ? battle.player1_id : battle.player2_id;
      } else {
        // True draw - same HP
        isDraw = true;
      }

      // Update battle
      const { error: updateError } = await supabase
        .from('pvp_battles')
        .update({
          status: 'completed',
          winner_id: winnerId,
          updated_at: now.toISOString(),
        })
        .eq('id', battle.id);

      if (updateError) {
        console.error(`Failed to finalize battle ${battle.id}:`, updateError);
        continue;
      }

      results.push({
        battle_id: battle.id,
        winner_id: winnerId,
        is_draw: isDraw,
        player1_final_hp: player1HP,
        player2_final_hp: player2HP,
      });
    }

    // Also clean up stale pending battles (invites not accepted within 7 days)
    const staleDate = new Date();
    staleDate.setDate(staleDate.getDate() - 7);

    const { data: staleBattles } = await supabase
      .from('pvp_battles')
      .select('id')
      .eq('status', 'pending')
      .lt('created_at', staleDate.toISOString());

    if (staleBattles && staleBattles.length > 0) {
      await supabase
        .from('pvp_battles')
        .update({ status: 'expired' })
        .in('id', staleBattles.map(b => b.id));

      // Also expire the related invites
      await supabase
        .from('pvp_invites')
        .update({ status: 'expired' })
        .in('battle_id', staleBattles.map(b => b.id));
    }

    return new Response(
      JSON.stringify({
        message: `Finalized ${results.length} battles`,
        finalized: results.length,
        stale_expired: staleBattles?.length || 0,
        results,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Finalize battles error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
