/**
 * PVP Store - Zustand State Management
 *
 * Manages all PVP-related state including:
 * - Active battles
 * - Battle invites
 * - User PVP stats
 * - Loadout presets
 */

import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import {
  calculatePowerRating,
  calculateEloChange,
  getRankTier,
  calculateBattleRewards,
} from '../utils/pvpCalculations';

const usePvpStore = create((set, get) => ({
  // === STATE ===

  // Active battles
  activeBattles: [],
  currentBattle: null,

  // Invites
  pendingInvites: [],
  sentInvites: [],

  // User stats
  userStats: null,

  // Loadouts
  loadouts: [],
  activeLoadout: null,

  // UI state
  isLoading: false,
  error: null,

  // === INITIALIZATION ===

  initialize: async (userId) => {
    if (!userId) return;

    set({ isLoading: true, error: null });

    try {
      // Finalize any expired battles first
      await get().finalizePendingBattles();

      // Load all PVP data in parallel
      await Promise.all([
        get().fetchActiveBattles(userId),
        get().fetchPendingInvites(userId),
        get().fetchUserStats(userId),
        get().fetchLoadouts(userId),
      ]);

      set({ isLoading: false });
    } catch (error) {
      console.error('PVP initialization error:', error);
      set({ isLoading: false, error: error.message });
    }
  },

  // === BATTLES ===

  fetchActiveBattles: async (userId) => {
    const { data, error } = await supabase
      .from('pvp_battles')
      .select('*')
      .or(`player1_id.eq.${userId},player2_id.eq.${userId}`)
      .in('status', ['pending', 'active'])
      .order('created_at', { ascending: false });

    if (error) throw error;
    set({ activeBattles: data || [] });
    return data;
  },

  fetchBattleById: async (battleId) => {
    const { data, error } = await supabase
      .from('pvp_battles')
      .select('*')
      .eq('id', battleId)
      .single();

    if (error) throw error;
    set({ currentBattle: data });
    return data;
  },

  fetchBattleDays: async (battleId) => {
    const { data, error } = await supabase
      .from('pvp_battle_days')
      .select('*')
      .eq('battle_id', battleId)
      .order('day_number', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  // === CREATE BATTLE ===

  createBattle: async ({
    challengerId,
    opponentId,
    battleType = 'standard',
    durationDays = 7,
    challengerLoadout,
  }) => {
    set({ isLoading: true, error: null });

    try {
      // Call edge function to create battle and invite
      const response = await supabase.functions.invoke('create-pvp-battle', {
        body: {
          inviter_id: challengerId,
          invitee_id: opponentId,
          battle_type: battleType,
          duration_days: durationDays,
          inviter_loadout: challengerLoadout,
        },
      });

      if (response.error) throw new Error(response.error.message || 'Failed to create battle');
      const { battle, invite } = response.data;

      // Update state
      set((state) => ({
        activeBattles: [battle, ...state.activeBattles],
        sentInvites: [...state.sentInvites, { battle_id: battle.id, invitee_id: opponentId }],
        isLoading: false,
      }));

      return battle;
    } catch (error) {
      console.error('Create battle error:', error);
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  // === INVITES ===

  fetchPendingInvites: async (userId) => {
    const { data, error } = await supabase
      .from('pvp_invites')
      .select('*, pvp_battles(*)')
      .eq('invitee_id', userId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw error;
    set({ pendingInvites: data || [] });
    return data;
  },

  acceptInvite: async (inviteId, accepterLoadout) => {
    set({ isLoading: true, error: null });

    try {
      // Call edge function to accept invite
      const response = await supabase.functions.invoke('accept-pvp-invite', {
        body: {
          invite_id: inviteId,
          accepter_loadout: accepterLoadout,
        },
      });

      if (response.error) throw new Error(response.error.message || 'Failed to accept invite');
      const { battle } = response.data;

      // Get the invitee ID from invite to refresh state
      const { data: invite } = await supabase
        .from('pvp_invites')
        .select('invitee_id')
        .eq('id', inviteId)
        .single();

      const userId = invite?.invitee_id;
      if (userId) {
        await get().fetchActiveBattles(userId);
        await get().fetchPendingInvites(userId);
      }

      set({ isLoading: false });
      return battle.id;
    } catch (error) {
      console.error('Accept invite error:', error);
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  declineInvite: async (inviteId) => {
    set({ isLoading: true, error: null });

    try {
      // Get invite to find battle
      const { data: invite, error: inviteError } = await supabase
        .from('pvp_invites')
        .select('battle_id, invitee_id')
        .eq('id', inviteId)
        .single();

      if (inviteError) throw inviteError;

      // Update invite status
      await supabase
        .from('pvp_invites')
        .update({
          status: 'declined',
          responded_at: new Date().toISOString(),
        })
        .eq('id', inviteId);

      // Cancel the battle
      await supabase
        .from('pvp_battles')
        .update({ status: 'cancelled' })
        .eq('id', invite.battle_id);

      // Refresh invites
      await get().fetchPendingInvites(invite.invitee_id);

      set({ isLoading: false });
    } catch (error) {
      console.error('Decline invite error:', error);
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  // === BATTLE PROGRESS ===

  /**
   * Record daily battle progress using edge function
   * Call this when a user completes tasks to deal damage in active battles
   */
  recordDailyProgress: async ({
    battleId,
    userId,
    tasksCompleted,
    streakDays = 0,
  }) => {
    try {
      // Call edge function to update battle progress
      const response = await supabase.functions.invoke('update-battle-progress', {
        body: {
          battle_id: battleId,
          user_id: userId,
          tasks_completed: tasksCompleted,
          streak_days: streakDays,
        },
      });

      if (response.error) throw new Error(response.error.message || 'Failed to record progress');

      const { damage, defenderHP, battleEnded, crit } = response.data;

      // Refresh battle state
      await get().fetchBattleById(battleId);

      // If battle ended, refresh active battles
      if (battleEnded) {
        await get().fetchActiveBattles(userId);
      }

      return {
        damage,
        defenderHP,
        battleEnded,
        criticalHit: crit,
      };
    } catch (error) {
      console.error('Record daily progress error:', error);
      throw error;
    }
  },

  /**
   * Record progress for all active battles at once
   * Useful for daily task completion hooks
   */
  recordProgressForAllBattles: async (userId, tasksCompleted, streakDays = 0) => {
    const { activeBattles } = get();
    const activeOnes = activeBattles.filter(b => b.status === 'active');

    const results = [];
    for (const battle of activeOnes) {
      try {
        const result = await get().recordDailyProgress({
          battleId: battle.id,
          userId,
          tasksCompleted,
          streakDays,
        });
        results.push({ battleId: battle.id, ...result });
      } catch (err) {
        console.error(`Failed to record progress for battle ${battle.id}:`, err);
      }
    }

    return results;
  },

  /**
   * Call finalize-battles edge function to end expired battles
   * This should be called periodically (e.g., on app load)
   */
  finalizePendingBattles: async () => {
    try {
      const response = await supabase.functions.invoke('finalize-battles', {});
      if (response.error) throw new Error(response.error.message);
      return response.data;
    } catch (error) {
      console.error('Finalize battles error:', error);
      return null;
    }
  },

  // === USER STATS ===

  fetchUserStats: async (userId) => {
    let { data, error } = await supabase
      .from('pvp_user_stats')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code === 'PGRST116') {
      // No stats exist, create default
      const { data: newStats, error: insertError } = await supabase
        .from('pvp_user_stats')
        .insert({ user_id: userId })
        .select()
        .single();

      if (insertError) throw insertError;
      data = newStats;
    } else if (error) {
      throw error;
    }

    set({ userStats: data });
    return data;
  },

  updateUserStatsAfterBattle: async (userId, isWinner, isDraw, battle) => {
    const currentStats = await get().fetchUserStats(userId);

    const updates = {
      total_battles: currentStats.total_battles + 1,
      updated_at: new Date().toISOString(),
    };

    if (isDraw) {
      updates.draws = currentStats.draws + 1;
      updates.current_win_streak = 0;
    } else if (isWinner) {
      updates.wins = currentStats.wins + 1;
      updates.current_win_streak = currentStats.current_win_streak + 1;
      updates.longest_win_streak = Math.max(
        currentStats.longest_win_streak,
        updates.current_win_streak
      );
    } else {
      updates.losses = currentStats.losses + 1;
      updates.current_win_streak = 0;
    }

    // ELO for ranked battles
    if (battle.battle_type === 'ranked') {
      const opponentId = battle.player1_id === userId ? battle.player2_id : battle.player1_id;
      const opponentStats = await get().fetchUserStats(opponentId);

      const eloChange = calculateEloChange(
        isWinner ? currentStats.elo_rating : opponentStats.elo_rating,
        isWinner ? opponentStats.elo_rating : currentStats.elo_rating,
        isDraw
      );

      const newElo = currentStats.elo_rating + (isWinner ? eloChange.winnerChange : eloChange.loserChange);
      updates.elo_rating = Math.max(0, newElo);
      updates.rank_tier = getRankTier(updates.elo_rating);
      updates.season_highest_elo = Math.max(currentStats.season_highest_elo, updates.elo_rating);
    }

    // Calculate rewards
    const rewards = calculateBattleRewards(battle.battle_type, isWinner, isDraw);
    updates.total_xp_from_pvp = currentStats.total_xp_from_pvp + rewards.xp;
    updates.total_credits_from_pvp = currentStats.total_credits_from_pvp + rewards.credits;

    await supabase
      .from('pvp_user_stats')
      .update(updates)
      .eq('user_id', userId);

    // Refresh stats
    await get().fetchUserStats(userId);
  },

  // === LOADOUTS ===

  fetchLoadouts: async (userId) => {
    const { data, error } = await supabase
      .from('pvp_loadouts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const loadouts = data || [];
    const defaultLoadout = loadouts.find((l) => l.is_default) || loadouts[0] || null;

    set({ loadouts, activeLoadout: defaultLoadout });
    return loadouts;
  },

  saveLoadout: async (userId, loadoutData) => {
    const { data, error } = await supabase
      .from('pvp_loadouts')
      .insert({
        user_id: userId,
        ...loadoutData,
        power_rating: calculatePowerRating(loadoutData),
      })
      .select()
      .single();

    if (error) throw error;

    set((state) => ({
      loadouts: [data, ...state.loadouts],
    }));

    return data;
  },

  updateLoadout: async (loadoutId, updates) => {
    const { data, error } = await supabase
      .from('pvp_loadouts')
      .update({
        ...updates,
        power_rating: calculatePowerRating(updates),
        updated_at: new Date().toISOString(),
      })
      .eq('id', loadoutId)
      .select()
      .single();

    if (error) throw error;

    set((state) => ({
      loadouts: state.loadouts.map((l) => (l.id === loadoutId ? data : l)),
      activeLoadout: state.activeLoadout?.id === loadoutId ? data : state.activeLoadout,
    }));

    return data;
  },

  setActiveLoadout: (loadout) => {
    set({ activeLoadout: loadout });
  },

  deleteLoadout: async (loadoutId) => {
    const { error } = await supabase
      .from('pvp_loadouts')
      .delete()
      .eq('id', loadoutId);

    if (error) throw error;

    set((state) => ({
      loadouts: state.loadouts.filter((l) => l.id !== loadoutId),
      activeLoadout: state.activeLoadout?.id === loadoutId ? null : state.activeLoadout,
    }));
  },

  // === FORFEIT ===

  forfeitBattle: async (battleId, userId) => {
    const battle = await get().fetchBattleById(battleId);
    if (!battle || battle.status !== 'active') return;

    const winnerId = battle.player1_id === userId ? battle.player2_id : battle.player1_id;

    await supabase
      .from('pvp_battles')
      .update({
        status: 'forfeited',
        winner_id: winnerId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', battleId);

    // Update forfeiter's stats
    const currentStats = await get().fetchUserStats(userId);
    await supabase
      .from('pvp_user_stats')
      .update({
        forfeits: currentStats.forfeits + 1,
        losses: currentStats.losses + 1,
        current_win_streak: 0,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    // Refresh battles
    await get().fetchActiveBattles(userId);
  },

  // === LEADERBOARD ===

  fetchLeaderboard: async (limit = 50) => {
    const { data, error } = await supabase
      .from('pvp_user_stats')
      .select('*')
      .order('elo_rating', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  // === BATTLE HISTORY ===

  fetchBattleHistory: async (userId, limit = 20) => {
    const { data, error } = await supabase
      .from('pvp_battles')
      .select('*')
      .or(`player1_id.eq.${userId},player2_id.eq.${userId}`)
      .eq('status', 'completed')
      .order('updated_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  // === RESET ===

  reset: () => {
    set({
      activeBattles: [],
      currentBattle: null,
      pendingInvites: [],
      sentInvites: [],
      userStats: null,
      loadouts: [],
      activeLoadout: null,
      isLoading: false,
      error: null,
    });
  },
}));

export default usePvpStore;
