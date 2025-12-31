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

  // Friend invite state
  pendingArenaInvites: [],
  sentArenaInvites: [],
  arenaInviteChannel: null,

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
          .maybeSingle(),
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
          .maybeSingle(),
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

  // === FRIEND ARENA INVITES ===

  sendArenaInvite: async (targetUserId) => {
    const currentUserId = await getCurrentUserId();
    if (!currentUserId) throw new Error('Not authenticated');

    try {
      // Get inviter's profile and combat stats
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('id, display_name, avatar_url, current_level, equipped_items')
        .eq('id', currentUserId)
        .single();

      const combatStats = calculatePlayerStats(
        profile?.current_level || 1,
        profile?.equipped_items || {},
        null,
        EQUIPMENT_DATABASE
      );

      // Create the invite
      const { data: invite, error } = await supabase
        .from('pvp_arena_invites')
        .insert({
          inviter_id: currentUserId,
          invitee_id: targetUserId,
          inviter_stats: {
            level: profile?.current_level || 1,
            maxHealth: combatStats.maxHealth,
            damage: combatStats.damage,
          },
          inviter_profile: {
            display_name: profile?.display_name || 'Anonymous',
            avatar_url: profile?.avatar_url,
          },
        })
        .select()
        .single();

      if (error) throw error;

      // Subscribe to this invite for status updates
      get().subscribeToSentInvite(invite.id, currentUserId);

      set(state => ({
        sentArenaInvites: [...state.sentArenaInvites, invite],
      }));

      return invite;
    } catch (error) {
      console.error('Send arena invite error:', error);
      throw error;
    }
  },

  fetchPendingArenaInvites: async () => {
    const currentUserId = await getCurrentUserId();
    if (!currentUserId) return [];

    try {
      const { data: invites, error } = await supabase
        .from('pvp_arena_invites')
        .select('*')
        .eq('invitee_id', currentUserId)
        .eq('status', 'pending')
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      set({ pendingArenaInvites: invites || [] });
      return invites || [];
    } catch (error) {
      console.error('Fetch pending invites error:', error);
      return [];
    }
  },

  acceptArenaInvite: async (inviteId) => {
    const currentUserId = await getCurrentUserId();
    if (!currentUserId) throw new Error('Not authenticated');

    try {
      // First, get the invite to validate and get inviter info
      const { data: invite, error: fetchError } = await supabase
        .from('pvp_arena_invites')
        .select('*')
        .eq('id', inviteId)
        .single();

      if (fetchError) throw fetchError;
      if (!invite) throw new Error('Invite not found');
      if (invite.status !== 'pending') throw new Error('Invite already processed');
      if (new Date(invite.expires_at) < new Date()) throw new Error('Invite expired');

      // Get both players' profiles and calculate stats
      const [inviterProfile, inviteeProfile] = await Promise.all([
        get().fetchPlayerProfile(invite.inviter_id),
        get().fetchPlayerProfile(currentUserId),
      ]);

      const inviterStats = calculatePlayerStats(
        inviterProfile?.current_level || 1,
        inviterProfile?.equipped_items || {},
        null,
        EQUIPMENT_DATABASE
      );

      const inviteeStats = calculatePlayerStats(
        inviteeProfile?.current_level || 1,
        inviteeProfile?.equipped_items || {},
        null,
        EQUIPMENT_DATABASE
      );

      // Create the match (channel_id is generated for realtime communication)
      const channelId = `friend-arena-${Date.now()}-${Math.random().toString(36).substring(7)}`;

      const { data: match, error: matchError } = await supabase
        .from('pvp_arena_matches')
        .insert({
          player1_id: invite.inviter_id,
          player2_id: currentUserId,
          player1_max_health: inviterStats.maxHealth,
          player1_current_health: inviterStats.maxHealth,
          player1_damage_per_tap: inviterStats.damage,
          player2_max_health: inviteeStats.maxHealth,
          player2_current_health: inviteeStats.maxHealth,
          player2_damage_per_tap: inviteeStats.damage,
          channel_id: channelId,
          status: 'active',
          match_type: 'friendly',
        })
        .select()
        .single();

      if (matchError) throw matchError;

      // Update invite with match_id and status
      await supabase
        .from('pvp_arena_invites')
        .update({
          status: 'accepted',
          match_id: match.id,
        })
        .eq('id', inviteId);

      // Remove from pending invites
      set(state => ({
        pendingArenaInvites: state.pendingArenaInvites.filter(inv => inv.id !== inviteId),
      }));

      // Set up match state (as player 2)
      set({
        currentMatch: match,
        isInMatch: true,
        myProfile: inviteeProfile,
        opponentProfile: inviterProfile,
        myHealth: inviteeStats.maxHealth,
        myMaxHealth: inviteeStats.maxHealth,
        opponentHealth: inviterStats.maxHealth,
        opponentMaxHealth: inviterStats.maxHealth,
        myTaps: 0,
        opponentTaps: 0,
        myDamageDealt: 0,
        opponentDamageDealt: 0,
      });

      // Subscribe to match channel
      get().subscribeToMatch(channelId, currentUserId);

      return match;
    } catch (error) {
      console.error('Accept arena invite error:', error);
      throw error;
    }
  },

  declineArenaInvite: async (inviteId) => {
    try {
      await supabase
        .from('pvp_arena_invites')
        .update({ status: 'declined' })
        .eq('id', inviteId);

      set(state => ({
        pendingArenaInvites: state.pendingArenaInvites.filter(inv => inv.id !== inviteId),
      }));
    } catch (error) {
      console.error('Decline arena invite error:', error);
    }
  },

  cancelArenaInvite: async (inviteId) => {
    const currentUserId = await getCurrentUserId();
    if (!currentUserId) return;

    try {
      await supabase
        .from('pvp_arena_invites')
        .delete()
        .eq('id', inviteId)
        .eq('inviter_id', currentUserId);

      set(state => ({
        sentArenaInvites: state.sentArenaInvites.filter(inv => inv.id !== inviteId),
      }));
    } catch (error) {
      console.error('Cancel arena invite error:', error);
    }
  },

  subscribeToArenaInvites: (userId, onInviteReceived) => {
    const channel = supabase
      .channel(`arena-invites-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'pvp_arena_invites',
          filter: `invitee_id=eq.${userId}`,
        },
        (payload) => {
          // New invite received
          set(state => ({
            pendingArenaInvites: [payload.new, ...state.pendingArenaInvites],
          }));
          if (onInviteReceived) {
            onInviteReceived(payload.new);
          }
        }
      )
      .subscribe();

    set({ arenaInviteChannel: channel });
    return () => {
      supabase.removeChannel(channel);
      set({ arenaInviteChannel: null });
    };
  },

  subscribeToSentInvite: (inviteId, userId) => {
    const channel = supabase
      .channel(`sent-invite-${inviteId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'pvp_arena_invites',
          filter: `id=eq.${inviteId}`,
        },
        async (payload) => {
          const invite = payload.new;

          if (invite.status === 'accepted' && invite.match_id) {
            // Invite was accepted! Fetch the match and join
            const { data: match } = await supabase
              .from('pvp_arena_matches')
              .select('*')
              .eq('id', invite.match_id)
              .single();

            if (match) {
              // Fetch profiles
              const [myProfile, opponentProfile] = await Promise.all([
                get().fetchPlayerProfile(userId),
                get().fetchPlayerProfile(invite.invitee_id),
              ]);

              // Set up match state (as player 1 / inviter)
              set({
                currentMatch: match,
                isInMatch: true,
                myProfile,
                opponentProfile,
                myHealth: match.player1_current_health,
                myMaxHealth: match.player1_max_health,
                opponentHealth: match.player2_current_health,
                opponentMaxHealth: match.player2_max_health,
                myTaps: 0,
                opponentTaps: 0,
                myDamageDealt: 0,
                opponentDamageDealt: 0,
                sentArenaInvites: get().sentArenaInvites.filter(inv => inv.id !== inviteId),
              });

              // Subscribe to match channel
              get().subscribeToMatch(match.channel_id, userId);
            }
          } else if (invite.status === 'declined') {
            // Invite was declined
            set(state => ({
              sentArenaInvites: state.sentArenaInvites.filter(inv => inv.id !== inviteId),
            }));
          }

          // Cleanup this subscription
          supabase.removeChannel(channel);
        }
      )
      .subscribe();
  },

  unsubscribeFromArenaInvites: () => {
    const { arenaInviteChannel } = get();
    if (arenaInviteChannel) {
      supabase.removeChannel(arenaInviteChannel);
      set({ arenaInviteChannel: null });
    }
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
          const { damage, isCrit, element, attackType, weaponColor } = payload.payload;

          set(state => ({
            myHealth: Math.max(0, state.myHealth - damage),
            opponentTaps: state.opponentTaps + 1,
            opponentDamageDealt: state.opponentDamageDealt + damage,
          }));

          // Trigger incoming attack visual via callback
          const { onIncomingAttack } = get();
          if (onIncomingAttack) {
            onIncomingAttack({
              type: 'attack',
              damage,
              isCrit,
              element,
              attackType,
              weaponColor,
            });
          }

          // Check if we died
          const { myHealth, currentMatch } = get();
          if (myHealth <= 0 && currentMatch) {
            get().endMatch(currentMatch.id, payload.payload.attackerId);
          }
        }
      })
      // Listen for opponent abilities via broadcast
      .on('broadcast', { event: 'ability' }, (payload) => {
        if (payload.payload.attackerId !== userId) {
          // Opponent used an ability on us
          const { damage, abilityId, abilityName, element } = payload.payload;

          set(state => ({
            myHealth: Math.max(0, state.myHealth - damage),
            opponentDamageDealt: state.opponentDamageDealt + damage,
          }));

          // Trigger incoming ability visual via callback
          const { onIncomingAttack } = get();
          if (onIncomingAttack) {
            onIncomingAttack({
              type: 'ability',
              damage,
              abilityId,
              abilityName,
              element,
              isCrit: true, // Abilities always show as "big" hits
            });
          }

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

  // Callback for incoming attack visuals (set by PvPArena component)
  onIncomingAttack: null,
  setOnIncomingAttack: (callback) => set({ onIncomingAttack: callback }),

  attack: async (userId, damage, isCrit = false, visualData = {}) => {
    const { currentMatch, matchChannel } = get();
    if (!currentMatch || !matchChannel) return;

    // Broadcast attack to opponent with visual data for CombatCanvas effects
    await matchChannel.send({
      type: 'broadcast',
      event: 'attack',
      payload: {
        attackerId: userId,
        damage,
        isCrit,
        timestamp: Date.now(),
        // Visual data for opponent's CombatCanvas
        element: visualData.element || 'physical',
        attackType: visualData.attackType || 'slash',
        weaponColor: visualData.weaponColor || '#22c55e',
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

    // Broadcast ability use with full ability data for opponent's visuals
    await matchChannel.send({
      type: 'broadcast',
      event: 'ability',
      payload: {
        attackerId: userId,
        damage,
        abilityId: ability.id,
        abilityName: ability.name,
        element: ability.element || ability.elementColor || 'arcane',
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
    get().unsubscribeFromArenaInvites();
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
      pendingArenaInvites: [],
      sentArenaInvites: [],
      isLoading: false,
      error: null,
    });
  },
}));

export default usePvpArenaStore;
