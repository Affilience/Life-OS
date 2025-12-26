/**
 * PvP Arena Store - Real-time tap combat matchmaking and battles
 * Similar mechanics to boss battles but against other players
 */

import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { calculatePlayerStats } from '../data/bossDatabase';
import { EQUIPMENT_DATABASE } from '../data/equipmentDatabase';
import { useGamificationStore } from './gamificationStore';
import { calculateEloChange, getRankTier } from '../utils/pvpCalculations';

// Helper to get current user ID with timeout protection
const getCurrentUserId = async (timeoutMs = 3000) => {
  try {
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Auth timeout')), timeoutMs)
    );
    const authPromise = supabase.auth.getUser();
    const { data: { user } } = await Promise.race([authPromise, timeoutPromise]);
    return user?.id || null;
  } catch (error) {
    console.warn('[PvpArenaStore] getCurrentUserId error:', error.message);
    return null;
  }
};

const usePvpArenaStore = create((set, get) => ({
  // === STATE ===

  // Queue state
  inQueue: false,
  queueStartTime: null,

  // Match state
  currentMatch: null,
  matchChannel: null,
  isInMatch: false,
  matchResult: null,

  // Player profiles for display
  myProfile: null,
  opponentProfile: null,

  // Player states during match
  myHealth: 0,
  myMaxHealth: 0,
  opponentHealth: 0,
  opponentMaxHealth: 0,
  myTaps: 0,
  opponentTaps: 0,
  myDamageDealt: 0,
  opponentDamageDealt: 0,

  // Arena stats
  arenaStats: null,

  // Match history
  matchHistory: [],

  // UI state
  isLoading: false,
  error: null,

  // === INITIALIZATION ===

  initialize: async (userId) => {
    if (!userId) return;

    // Helper to wrap queries with timeout (silent - only log final success/fail)
    const withTimeout = async (queryFn, name, timeoutMs = 10000) => {
      try {
        return await Promise.race([
          queryFn(),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error(`${name} timeout`)), timeoutMs)
          )
        ]);
      } catch (e) {
        return { data: null };
      }
    };

    try {
      // Fetch or create arena stats with timeout
      await withTimeout(() => get().fetchArenaStats(userId), 'fetchArenaStats');

      // Check if already in queue with timeout
      const { data: queueEntry } = await withTimeout(
        () => supabase
          .from('pvp_arena_queue')
          .select('*')
          .eq('user_id', userId)
          .eq('status', 'waiting')
          .single(),
        'checkQueue'
      );

      if (queueEntry) {
        set({
          inQueue: true,
          queueStartTime: new Date(queueEntry.joined_at)
        });
        get().subscribeToQueue(userId);
      }

      // Check if in active match with timeout
      const { data: activeMatch } = await withTimeout(
        () => supabase
          .from('pvp_arena_matches')
          .select('*')
          .or(`player1_id.eq.${userId},player2_id.eq.${userId}`)
          .eq('status', 'active')
          .single(),
        'checkActiveMatch'
      );

      if (activeMatch) {
        set({ currentMatch: activeMatch, isInMatch: true });
        get().subscribeToMatch(activeMatch.channel_id, userId);
      }

      console.log('[PvpArenaStore] ✅ Initialized');
    } catch (error) {
      console.error('Arena initialization error:', error);
    }
  },

  // === PROFILE FETCHING ===

  fetchPlayerProfile: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, display_name, avatar_url, current_level, character_gender, equipped_items, dye_colors, skin_tone, prestige, current_tier')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }
      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  },

  fetchMatchProfiles: async (match, myUserId) => {
    const isPlayer1 = match.player1_id === myUserId;
    const opponentId = isPlayer1 ? match.player2_id : match.player1_id;

    const [myProfile, opponentProfile] = await Promise.all([
      get().fetchPlayerProfile(myUserId),
      get().fetchPlayerProfile(opponentId),
    ]);

    set({ myProfile, opponentProfile });
    return { myProfile, opponentProfile };
  },

  // === MATCH HISTORY ===

  fetchMatchHistory: async (userId, limit = 20) => {
    try {
      const { data, error } = await supabase
        .from('pvp_arena_matches')
        .select('*')
        .or(`player1_id.eq.${userId},player2_id.eq.${userId}`)
        .eq('status', 'completed')
        .order('ended_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      // Fetch profiles for all opponents in history
      const opponentIds = data?.map(match =>
        match.player1_id === userId ? match.player2_id : match.player1_id
      ).filter((id, index, arr) => arr.indexOf(id) === index) || [];

      let profileMap = {};
      if (opponentIds.length > 0) {
        const { data: profiles } = await supabase
          .from('user_profiles')
          .select('id, display_name, avatar_url')
          .in('id', opponentIds);

        if (profiles) {
          profileMap = profiles.reduce((acc, p) => {
            acc[p.id] = p;
            return acc;
          }, {});
        }
      }

      // Attach opponent profiles to matches
      const matchesWithProfiles = data?.map(match => ({
        ...match,
        opponentProfile: profileMap[match.player1_id === userId ? match.player2_id : match.player1_id] || null,
      })) || [];

      set({ matchHistory: matchesWithProfiles });
      return matchesWithProfiles;
    } catch (error) {
      console.error('Error fetching match history:', error);
      return [];
    }
  },

  // === ARENA STATS ===

  fetchArenaStats: async (userId) => {
    let { data, error } = await supabase
      .from('pvp_arena_stats')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code === 'PGRST116') {
      // Create default stats
      const { data: newStats } = await supabase
        .from('pvp_arena_stats')
        .insert({ user_id: userId })
        .select()
        .single();
      data = newStats;
    }

    set({ arenaStats: data });
    return data;
  },

  // === MATCHMAKING ===

  joinQueue: async (userId, playerData) => {
    set({ isLoading: true, error: null });

    try {
      // Calculate combat stats from player data
      const combatStats = calculatePlayerStats(
        playerData.level,
        playerData.equipped,
        playerData.activePet,
        EQUIPMENT_DATABASE
      );

      // Get equipped weapon info
      const weaponId = playerData.equipped?.weapon;
      const weapon = weaponId ? EQUIPMENT_DATABASE[weaponId] : null;

      // Call Edge Function for atomic matchmaking
      // This prevents race conditions when multiple users queue simultaneously
      const response = await supabase.functions.invoke('pvp-arena-matchmaking', {
        body: {
          user_id: userId,
          level: playerData.level,
          power_rating: combatStats.maxHealth + (combatStats.damage * 10),
          max_health: combatStats.maxHealth,
          damage_per_tap: combatStats.damage,
          equipped_weapon: weapon ? {
            id: weapon.id,
            name: weapon.name,
            sprite: weapon.sprite,
            ability: weapon.ability,
          } : null,
        },
      });

      if (response.error) throw new Error(response.error.message || 'Matchmaking failed');

      const { status, match, queue_entry } = response.data;

      if (status === 'matched' && match) {
        // Immediately matched! Set up the match
        const isPlayer1 = match.player1_id === userId;

        set({
          inQueue: false,
          currentMatch: match,
          isInMatch: true,
          myHealth: isPlayer1 ? match.player1_current_health : match.player2_current_health,
          myMaxHealth: isPlayer1 ? match.player1_max_health : match.player2_max_health,
          opponentHealth: isPlayer1 ? match.player2_current_health : match.player1_current_health,
          opponentMaxHealth: isPlayer1 ? match.player2_max_health : match.player1_max_health,
          myTaps: 0,
          opponentTaps: 0,
          myDamageDealt: 0,
          opponentDamageDealt: 0,
          isLoading: false,
        });

        // Fetch player profiles for display
        get().fetchMatchProfiles(match, userId);

        get().subscribeToMatch(match.channel_id, userId);
      } else {
        // Added to queue, waiting for opponent
        set({
          inQueue: true,
          queueStartTime: new Date(),
          isLoading: false,
        });

        // Subscribe to queue updates for when we get matched
        get().subscribeToQueue(userId);
      }

      return response.data;
    } catch (error) {
      console.error('Join queue error:', error);
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  leaveQueue: async (userId) => {
    try {
      await supabase
        .from('pvp_arena_queue')
        .delete()
        .eq('user_id', userId);

      get().unsubscribeFromQueue();

      set({
        inQueue: false,
        queueStartTime: null,
      });
    } catch (error) {
      console.error('Leave queue error:', error);
    }
  },

  // === QUEUE SUBSCRIPTION ===

  subscribeToQueue: (userId) => {
    const channel = supabase
      .channel(`arena-queue-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'pvp_arena_queue',
          filter: `user_id=eq.${userId}`,
        },
        async (payload) => {
          if (payload.new.status === 'matched' && payload.new.matched_match_id) {
            // We got matched! Fetch the match
            const { data: match } = await supabase
              .from('pvp_arena_matches')
              .select('*')
              .eq('id', payload.new.matched_match_id)
              .single();

            if (match) {
              const isPlayer1 = match.player1_id === userId;

              set({
                inQueue: false,
                currentMatch: match,
                isInMatch: true,
                myHealth: isPlayer1 ? match.player1_current_health : match.player2_current_health,
                myMaxHealth: isPlayer1 ? match.player1_max_health : match.player2_max_health,
                opponentHealth: isPlayer1 ? match.player2_current_health : match.player1_current_health,
                opponentMaxHealth: isPlayer1 ? match.player2_max_health : match.player1_max_health,
                myTaps: 0,
                opponentTaps: 0,
                myDamageDealt: 0,
                opponentDamageDealt: 0,
              });

              // Fetch player profiles for display
              get().fetchMatchProfiles(match, userId);

              get().unsubscribeFromQueue();
              get().subscribeToMatch(match.channel_id, userId);
            }
          }
        }
      )
      .subscribe();

    set({ queueChannel: channel });
  },

  unsubscribeFromQueue: () => {
    const { queueChannel } = get();
    if (queueChannel) {
      supabase.removeChannel(queueChannel);
      set({ queueChannel: null });
    }
  },

  // === MATCH SUBSCRIPTION (Real-time combat) ===

  subscribeToMatch: (channelId, userId) => {
    const channel = supabase
      .channel(`arena-match-${channelId}`)
      // Listen for opponent attacks via broadcast
      .on('broadcast', { event: 'attack' }, (payload) => {
        if (payload.payload.attackerId !== userId) {
          // Opponent attacked us
          const damage = payload.payload.damage;
          const isCrit = payload.payload.isCrit;

          set(state => ({
            myHealth: Math.max(0, state.myHealth - damage),
            opponentTaps: state.opponentTaps + 1,
            opponentDamageDealt: state.opponentDamageDealt + damage,
          }));

          // Check if we died
          const { myHealth, currentMatch } = get();
          if (myHealth <= 0 && currentMatch) {
            get().endMatch(currentMatch.id, payload.payload.attackerId);
          }
        }
      })
      // Listen for match end
      .on('broadcast', { event: 'match_end' }, (payload) => {
        set({
          matchResult: {
            winnerId: payload.payload.winnerId,
            isWinner: payload.payload.winnerId === userId,
          },
        });
      })
      // Listen for database updates
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'pvp_arena_matches',
          filter: `channel_id=eq.${channelId}`,
        },
        (payload) => {
          if (payload.new.status === 'completed') {
            set({
              currentMatch: payload.new,
              matchResult: {
                winnerId: payload.new.winner_id,
                isWinner: payload.new.winner_id === userId,
              },
            });
          }
        }
      )
      .subscribe();

    set({ matchChannel: channel });
  },

  unsubscribeFromMatch: () => {
    const { matchChannel } = get();
    if (matchChannel) {
      supabase.removeChannel(matchChannel);
      set({ matchChannel: null });
    }
  },

  // === COMBAT ACTIONS ===

  attack: async (userId, damage, isCrit = false) => {
    const { currentMatch, matchChannel } = get();
    if (!currentMatch || !matchChannel) return;

    // Broadcast attack to opponent
    await matchChannel.send({
      type: 'broadcast',
      event: 'attack',
      payload: {
        attackerId: userId,
        damage,
        isCrit,
        timestamp: Date.now(),
      },
    });

    // Update local state
    set(state => ({
      myTaps: state.myTaps + 1,
      myDamageDealt: state.myDamageDealt + damage,
      opponentHealth: Math.max(0, state.opponentHealth - damage),
    }));

    // Check if opponent died
    const { opponentHealth } = get();
    if (opponentHealth <= 0) {
      await get().endMatch(currentMatch.id, userId);
    }
  },

  useAbility: async (userId, ability, damage) => {
    const { currentMatch, matchChannel } = get();
    if (!currentMatch || !matchChannel) return;

    // Broadcast ability use
    await matchChannel.send({
      type: 'broadcast',
      event: 'attack',
      payload: {
        attackerId: userId,
        damage,
        ability: ability.name,
        isCrit: false,
        timestamp: Date.now(),
      },
    });

    set(state => ({
      myDamageDealt: state.myDamageDealt + damage,
      opponentHealth: Math.max(0, state.opponentHealth - damage),
    }));

    const { opponentHealth } = get();
    if (opponentHealth <= 0) {
      await get().endMatch(currentMatch.id, userId);
    }
  },

  // === MATCH END ===

  endMatch: async (matchId, winnerId) => {
    const { currentMatch, matchChannel, myTaps, opponentTaps, myDamageDealt, opponentDamageDealt } = get();
    if (!currentMatch) return;

    const isPlayer1 = currentMatch.player1_id === winnerId;
    const loserId = isPlayer1 ? currentMatch.player2_id : currentMatch.player1_id;

    // Calculate rewards
    const winnerXp = currentMatch.match_type === 'ranked' ? 150 : 75;
    const winnerCredits = currentMatch.match_type === 'ranked' ? 50 : 25;
    const loserXp = currentMatch.match_type === 'ranked' ? 50 : 25;
    const loserCredits = currentMatch.match_type === 'ranked' ? 15 : 10;

    try {
      // Fetch both players' current ELO for proper calculation
      const [winnerStats, loserStats] = await Promise.all([
        supabase.from('pvp_arena_stats').select('arena_elo').eq('user_id', winnerId).single(),
        supabase.from('pvp_arena_stats').select('arena_elo').eq('user_id', loserId).single(),
      ]);

      const winnerElo = winnerStats.data?.arena_elo || 1000;
      const loserElo = loserStats.data?.arena_elo || 1000;

      // Calculate proper ELO changes using the formula
      const eloChanges = calculateEloChange(winnerElo, loserElo);

      // Update match in database with ELO changes
      await supabase
        .from('pvp_arena_matches')
        .update({
          status: 'completed',
          winner_id: winnerId,
          player1_current_health: isPlayer1 ? currentMatch.player1_current_health : 0,
          player2_current_health: isPlayer1 ? 0 : currentMatch.player2_current_health,
          player1_taps: isPlayer1 ? myTaps : opponentTaps,
          player2_taps: isPlayer1 ? opponentTaps : myTaps,
          player1_damage_dealt: isPlayer1 ? myDamageDealt : opponentDamageDealt,
          player2_damage_dealt: isPlayer1 ? opponentDamageDealt : myDamageDealt,
          ended_at: new Date().toISOString(),
          winner_xp: winnerXp,
          winner_credits: winnerCredits,
          loser_xp: loserXp,
          loser_credits: loserCredits,
          winner_elo_change: eloChanges.winnerChange,
          loser_elo_change: eloChanges.loserChange,
        })
        .eq('id', matchId);

      // Broadcast match end
      if (matchChannel) {
        await matchChannel.send({
          type: 'broadcast',
          event: 'match_end',
          payload: { winnerId, matchId, eloChanges },
        });
      }

      // Update arena stats for both players with calculated ELO changes
      await get().updateArenaStats(winnerId, true, myDamageDealt, myTaps, eloChanges.winnerChange);
      await get().updateArenaStats(loserId, false, opponentDamageDealt, opponentTaps, eloChanges.loserChange);

      // Clean up queue entries
      await supabase
        .from('pvp_arena_queue')
        .delete()
        .in('user_id', [currentMatch.player1_id, currentMatch.player2_id]);

      // Get current user ID to determine if we're the winner
      const currentUserId = await getCurrentUserId();

      // Award XP and credits to the current user via gamificationStore
      if (currentUserId) {
        const gamificationStore = useGamificationStore.getState();
        const isCurrentUserWinner = winnerId === currentUserId;
        const xpReward = isCurrentUserWinner ? winnerXp : loserXp;
        const creditReward = isCurrentUserWinner ? winnerCredits : loserCredits;

        try {
          if (gamificationStore.addXP) {
            await gamificationStore.addXP(xpReward, 'pvp_arena');
          }
          if (gamificationStore.addCredits) {
            await gamificationStore.addCredits(creditReward, 'pvp_arena');
          }
          console.log(`[PvP Arena] Awarded ${xpReward} XP and ${creditReward} credits to user`);
        } catch (rewardError) {
          console.error('[PvP Arena] Error awarding rewards:', rewardError);
        }
      }

      set({
        matchResult: {
          winnerId,
          isWinner: winnerId === currentMatch.player1_id || winnerId === currentMatch.player2_id,
          winnerXp,
          winnerCredits,
          loserXp,
          loserCredits,
        },
      });
    } catch (error) {
      console.error('End match error:', error);
    }
  },

  updateArenaStats: async (userId, isWinner, damageDealt, taps, eloChange = null) => {
    try {
      const { data: currentStats } = await supabase
        .from('pvp_arena_stats')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (!currentStats) return;

      // Use provided ELO change (from proper calculation) or fall back to simple values
      const actualEloChange = eloChange !== null ? eloChange : (isWinner ? 25 : -20);
      const newElo = Math.max(0, currentStats.arena_elo + actualEloChange);

      // Determine rank tier using the utility function
      const rankTier = getRankTier(newElo);

      await supabase
        .from('pvp_arena_stats')
        .update({
          arena_elo: newElo,
          season_high_elo: Math.max(currentStats.season_high_elo || 0, newElo),
          rank_tier: rankTier,
          total_matches: currentStats.total_matches + 1,
          wins: isWinner ? currentStats.wins + 1 : currentStats.wins,
          losses: isWinner ? currentStats.losses : currentStats.losses + 1,
          current_win_streak: isWinner ? currentStats.current_win_streak + 1 : 0,
          longest_win_streak: isWinner
            ? Math.max(currentStats.longest_win_streak || 0, currentStats.current_win_streak + 1)
            : currentStats.longest_win_streak || 0,
          total_taps: (currentStats.total_taps || 0) + taps,
          total_damage_dealt: (currentStats.total_damage_dealt || 0) + damageDealt,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      console.log(`[PvP Arena] Updated ELO for ${userId}: ${currentStats.arena_elo} → ${newElo} (${actualEloChange > 0 ? '+' : ''}${actualEloChange})`);
    } catch (error) {
      console.error('Update arena stats error:', error);
    }
  },

  // === CLEANUP ===

  exitMatch: () => {
    get().unsubscribeFromMatch();
    set({
      currentMatch: null,
      isInMatch: false,
      matchResult: null,
      myHealth: 0,
      myMaxHealth: 0,
      opponentHealth: 0,
      opponentMaxHealth: 0,
      myTaps: 0,
      opponentTaps: 0,
      myDamageDealt: 0,
      opponentDamageDealt: 0,
      myProfile: null,
      opponentProfile: null,
    });
  },

  reset: () => {
    get().unsubscribeFromQueue();
    get().unsubscribeFromMatch();
    set({
      inQueue: false,
      queueStartTime: null,
      currentMatch: null,
      matchChannel: null,
      isInMatch: false,
      matchResult: null,
      myProfile: null,
      opponentProfile: null,
      myHealth: 0,
      myMaxHealth: 0,
      opponentHealth: 0,
      opponentMaxHealth: 0,
      myTaps: 0,
      opponentTaps: 0,
      myDamageDealt: 0,
      opponentDamageDealt: 0,
      arenaStats: null,
      matchHistory: [],
      isLoading: false,
      error: null,
    });
  },
}));

export default usePvpArenaStore;
