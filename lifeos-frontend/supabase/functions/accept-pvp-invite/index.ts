/**
 * Accept PvP Invite Edge Function
 *
 * Handles accepting a PvP battle invite and starting the battle.
 * Updates invite status and sets battle to active.
 */

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface AcceptInviteRequest {
  invite_id: string;
  accepter_loadout?: {
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

    const body: AcceptInviteRequest = await req.json();
    const { invite_id, accepter_loadout } = body;

    if (!invite_id) {
      return new Response(
        JSON.stringify({ error: 'invite_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the invite with battle details
    const { data: invite, error: inviteError } = await supabase
      .from('pvp_invites')
      .select('*, pvp_battles(*)')
      .eq('id', invite_id)
      .single();

    if (inviteError || !invite) {
      return new Response(
        JSON.stringify({ error: 'Invite not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (invite.status !== 'pending') {
      return new Response(
        JSON.stringify({ error: 'Invite is no longer pending' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const battle = invite.pvp_battles;
    if (!battle) {
      return new Response(
        JSON.stringify({ error: 'Battle not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate start and end dates
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + (battle.duration_days || 7));

    // Update the invite status
    const { error: updateInviteError } = await supabase
      .from('pvp_invites')
      .update({
        status: 'accepted',
        responded_at: startDate.toISOString(),
      })
      .eq('id', invite_id);

    if (updateInviteError) throw updateInviteError;

    // Update the battle to active
    const battleUpdate: Record<string, unknown> = {
      status: 'active',
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
      updated_at: startDate.toISOString(),
    };

    // Add accepter's loadout if provided
    if (accepter_loadout) {
      battleUpdate.player2_loadout = accepter_loadout;
      if (accepter_loadout.power_rating) {
        battleUpdate.player2_power = accepter_loadout.power_rating;
      }
    }

    const { data: updatedBattle, error: updateBattleError } = await supabase
      .from('pvp_battles')
      .update(battleUpdate)
      .eq('id', battle.id)
      .select()
      .single();

    if (updateBattleError) throw updateBattleError;

    // Create battle day entries for tracking
    const battleDays = [];
    for (let i = 1; i <= (battle.duration_days || 7); i++) {
      const dayDate = new Date(startDate);
      dayDate.setDate(dayDate.getDate() + i - 1);

      battleDays.push({
        battle_id: battle.id,
        day_number: i,
        day_date: dayDate.toISOString().split('T')[0],
        player1_tasks: 0,
        player2_tasks: 0,
        player1_damage: 0,
        player2_damage: 0,
      });
    }

    if (battleDays.length > 0) {
      await supabase.from('pvp_battle_days').insert(battleDays);
    }

    return new Response(
      JSON.stringify({ battle: updatedBattle }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Accept invite error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
