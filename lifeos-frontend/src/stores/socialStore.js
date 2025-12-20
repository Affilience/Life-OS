/**
 * Social Store - State management for social features
 * Handles friends, guilds, activity feed, leaderboards, and challenges
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import redis, { LEADERBOARD_KEYS } from '../services/redis';
import { moderateComment, validateDisplayName, validateBio } from '../services/contentModeration';
import { initializeSocialRealtime, cleanupSocialRealtime } from '../services/socialRealtime';
import { DEV_USER_ID, isDevMode } from '../lib/dev-auth';
import { triggerGamification } from '../hooks/useGamification';

// Helper to get current user ID (supports dev mode)
const getCurrentUserId = async () => {
  if (isDevMode()) {
    return DEV_USER_ID;
  }
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id || null;
};

// Initial state
const initialState = {
  // Profile
  socialProfile: null,

  // Friends
  friends: [],
  pendingRequests: [],
  sentRequests: [],
  blockedUsers: [],
  onlineFriends: [],

  // Guilds
  currentGuild: null,
  guildMembers: [],
  guildInvites: [],
  availableGuilds: [],

  // Activity Feed
  feed: [],
  feedLoading: false,
  feedHasMore: true,

  // Leaderboards
  leaderboards: {
    global: [],
    weekly: [],
    monthly: [],
    streak: [],
    guild: [],
    friends: [],
  },
  myRanks: {
    global: null,
    weekly: null,
    monthly: null,
    streak: null,
    percentile: null,
  },

  // Challenges
  activeChallenges: [],
  availableChallenges: [],
  myChallenges: [],

  // Guild Management
  guildApplications: [],
  guildInvitesSent: [],

  // Head-to-Head Challenges
  headToHeadChallenges: [],
  pendingH2HInvites: [],

  // Notifications
  notifications: [],
  unreadNotificationCount: 0,

  // Real-time state
  realtimeInitialized: false,

  // UI State
  loading: false,
  error: null,
};

export const useSocialStore = create(
  persist(
    (set, get) => ({
      ...initialState,

      // ============================================
      // PROFILE ACTIONS
      // ============================================

      fetchSocialProfile: async () => {
        const userId = await getCurrentUserId();
        if (!userId) return;

        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (error) {
          console.error('Error fetching social profile:', error);
          return;
        }

        if (data) {
          set({ socialProfile: data });
        }
      },

      updateSocialProfile: async (updates) => {
        const userId = await getCurrentUserId();
        if (!userId) return { error: 'Not authenticated' };

        const { data, error } = await supabase
          .from('user_profiles')
          .update(updates)
          .eq('id', userId)
          .select()
          .single();

        if (data) {
          set({ socialProfile: data });
        }
        return { data, error };
      },

      // Search for users to add as friends (by username or display name)
      searchUsers: async (query) => {
        if (!query || query.length < 2) return [];

        const userId = await getCurrentUserId();
        if (!userId) return [];

        // Escape special characters for PostgREST filter
        const escapedQuery = query.replace(/[%_\\]/g, '\\$&');

        // Search by username (exact prefix match prioritized) OR display name
        const { data, error } = await supabase
          .from('user_profiles')
          .select('id, username, display_name, avatar_url, current_level, total_xp')
          .neq('id', userId) // Exclude self
          .or(`username.ilike.${escapedQuery}%,display_name.ilike.%${escapedQuery}%`)
          .limit(10);

        if (error) {
          console.error('Error searching users:', error);
          return [];
        }

        // Filter out existing friends and pending requests (client-side filtering)
        const { friends, pendingRequests, sentRequests, blockedUsers } = get();
        const friendIds = (friends || []).map(f => f.id || f.user_id).filter(Boolean);
        const pendingIds = (pendingRequests || []).map(p => p.requester?.id || p.requester?.user_id).filter(Boolean);
        const sentIds = (sentRequests || []).map(s => s.addressee?.id || s.addressee?.user_id).filter(Boolean);
        const blockedIds = (blockedUsers || []).map(b => b.blocked_id).filter(Boolean);

        const excludeIds = [...friendIds, ...pendingIds, ...sentIds, ...blockedIds];

        // Sort: exact username matches first, then prefix matches, then display name matches
        const filteredResults = (data || []).filter(u => u.id && !excludeIds.includes(u.id));
        return filteredResults.sort((a, b) => {
          const queryLower = query.toLowerCase();
          const aUsernameExact = a.username?.toLowerCase() === queryLower;
          const bUsernameExact = b.username?.toLowerCase() === queryLower;
          const aUsernamePrefix = a.username?.toLowerCase().startsWith(queryLower);
          const bUsernamePrefix = b.username?.toLowerCase().startsWith(queryLower);

          if (aUsernameExact && !bUsernameExact) return -1;
          if (!aUsernameExact && bUsernameExact) return 1;
          if (aUsernamePrefix && !bUsernamePrefix) return -1;
          if (!aUsernamePrefix && bUsernamePrefix) return 1;
          return 0;
        });
      },

      // Check if a username is available
      checkUsernameAvailable: async (username) => {
        if (!username || username.length < 3) return { available: false, error: 'Username must be at least 3 characters' };
        if (username.length > 30) return { available: false, error: 'Username must be 30 characters or less' };
        if (!/^[a-zA-Z][a-zA-Z0-9_]{2,29}$/.test(username)) {
          return { available: false, error: 'Username must start with a letter and contain only letters, numbers, and underscores' };
        }

        // Get current user ID
        const userId = await getCurrentUserId();

        // Use case-insensitive search with filter syntax
        const { data, error } = await supabase
          .from('user_profiles')
          .select('id')
          .filter('username', 'ilike', username)
          .maybeSingle();

        if (error) {
          console.error('Error checking username:', error);
          return { available: false, error: 'Failed to check username availability' };
        }

        // No matching record found - username is available
        if (!data) {
          return { available: true };
        }

        // Check if it's the current user's username
        if (data.id === userId) {
          return { available: true }; // User's own username
        }

        return { available: false, error: 'Username is already taken' };
      },

      // Update username
      updateUsername: async (username) => {
        const userId = await getCurrentUserId();
        if (!userId) return { error: 'Not authenticated' };

        // Validate format
        if (!username || username.length < 3 || username.length > 30) {
          return { error: 'Username must be 3-30 characters' };
        }
        if (!/^[a-zA-Z][a-zA-Z0-9_]{2,29}$/.test(username)) {
          return { error: 'Username must start with a letter and contain only letters, numbers, and underscores' };
        }

        // Check availability
        const { available, error: checkError } = await get().checkUsernameAvailable(username);
        if (!available) {
          return { error: checkError || 'Username is not available' };
        }

        const { data, error } = await supabase
          .from('user_profiles')
          .update({ username })
          .eq('id', userId)
          .select()
          .single();

        if (!error && data) {
          set({ socialProfile: { ...get().socialProfile, username: data.username } });
        }

        return { success: !error, data, error: error?.message };
      },

      // ============================================
      // FRIENDS ACTIONS
      // ============================================

      fetchFriends: async () => {
        const userId = await getCurrentUserId();
        if (!userId) return;

        // Get accepted friendships
        const { data: friendships } = await supabase
          .from('friendships')
          .select(`
            id,
            requester_id,
            addressee_id,
            accepted_at,
            requester:user_profiles!friendships_requester_id_fkey(id, display_name, avatar_url, current_level, total_xp),
            addressee:user_profiles!friendships_addressee_id_fkey(id, display_name, avatar_url, current_level, total_xp)
          `)
          .eq('status', 'accepted')
          .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`);

        if (friendships) {
          const friends = friendships.map(f => {
            const friendProfile = f.requester_id === userId ? f.addressee : f.requester;
            return {
              friendshipId: f.id,
              ...friendProfile,
              user_id: friendProfile?.id, // Ensure user_id is set for filtering
              acceptedAt: f.accepted_at,
            };
          });
          set({ friends });
        }
      },

      fetchPendingRequests: async () => {
        const userId = await getCurrentUserId();
        if (!userId) return;

        // Requests sent TO me
        const { data: pending } = await supabase
          .from('friendships')
          .select(`
            id,
            created_at,
            requester:user_profiles!friendships_requester_id_fkey(id, display_name, avatar_url, current_level)
          `)
          .eq('addressee_id', userId)
          .eq('status', 'pending');

        // Requests sent BY me
        const { data: sent } = await supabase
          .from('friendships')
          .select(`
            id,
            created_at,
            addressee:user_profiles!friendships_addressee_id_fkey(id, display_name, avatar_url, current_level)
          `)
          .eq('requester_id', userId)
          .eq('status', 'pending');

        set({
          pendingRequests: pending || [],
          sentRequests: sent || [],
        });
      },

      sendFriendRequest: async (targetUserId) => {
        const userId = await getCurrentUserId();
        if (!userId) return { error: 'Not authenticated' };

        // Check if blocked
        const { data: blocked } = await supabase
          .from('user_blocks')
          .select('id')
          .or(`blocker_id.eq.${targetUserId},blocked_id.eq.${targetUserId}`)
          .or(`blocker_id.eq.${userId},blocked_id.eq.${userId}`);

        if (blocked && blocked.length > 0) {
          return { error: 'Cannot send friend request' };
        }

        const { data, error } = await supabase
          .from('friendships')
          .insert({
            requester_id: userId,
            addressee_id: targetUserId,
            status: 'pending',
          })
          .select()
          .single();

        if (!error) {
          get().fetchPendingRequests();
        }
        return { data, error };
      },

      acceptFriendRequest: async (friendshipId) => {
        const { data, error } = await supabase
          .from('friendships')
          .update({
            status: 'accepted',
            accepted_at: new Date().toISOString(),
          })
          .eq('id', friendshipId)
          .select()
          .single();

        if (!error) {
          get().fetchFriends();
          get().fetchPendingRequests();
          // Award XP for making a new friend
          triggerGamification('friendAdded', { xpOverride: 15, module: 'social' });
        }
        return { data, error };
      },

      declineFriendRequest: async (friendshipId) => {
        const { error } = await supabase
          .from('friendships')
          .update({ status: 'declined' })
          .eq('id', friendshipId);

        if (!error) {
          get().fetchPendingRequests();
        }
        return { error };
      },

      removeFriend: async (friendshipId) => {
        const { error } = await supabase
          .from('friendships')
          .delete()
          .eq('id', friendshipId);

        if (!error) {
          get().fetchFriends();
        }
        return { error };
      },

      // ============================================
      // BLOCK ACTIONS
      // ============================================

      blockUser: async (targetUserId, reason = '') => {
        const userId = await getCurrentUserId();
        if (!userId) return { error: 'Not authenticated' };

        // Remove any existing friendship
        await supabase
          .from('friendships')
          .delete()
          .or(`requester_id.eq.${targetUserId},addressee_id.eq.${targetUserId}`)
          .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`);

        const { data, error } = await supabase
          .from('user_blocks')
          .insert({
            blocker_id: userId,
            blocked_id: targetUserId,
            reason,
          })
          .select()
          .single();

        if (!error) {
          get().fetchBlockedUsers();
          get().fetchFriends();
        }
        return { data, error };
      },

      unblockUser: async (blockId) => {
        const { error } = await supabase
          .from('user_blocks')
          .delete()
          .eq('id', blockId);

        if (!error) {
          get().fetchBlockedUsers();
        }
        return { error };
      },

      fetchBlockedUsers: async () => {
        const userId = await getCurrentUserId();
        if (!userId) return;

        const { data } = await supabase
          .from('user_blocks')
          .select(`
            id,
            blocked_id,
            reason,
            created_at,
            blocked:user_profiles!user_blocks_blocked_id_fkey(id, display_name, avatar_url)
          `)
          .eq('blocker_id', userId);

        set({ blockedUsers: data || [] });
      },

      // ============================================
      // GUILD ACTIONS
      // ============================================

      fetchGuilds: async () => {
        const { data } = await supabase
          .from('guilds')
          .select('*')
          .order('total_xp', { ascending: false })
          .limit(50);

        set({ availableGuilds: data || [] });
      },

      fetchMyGuild: async () => {
        const userId = await getCurrentUserId();
        if (!userId) return;

        try {
          const { data: membership, error } = await supabase
            .from('guild_members')
            .select(`
              role,
              xp_contributed,
              joined_at,
              guild:guilds(*)
            `)
            .eq('user_id', userId)
            .maybeSingle();

          // Handle case where guild_members table doesn't exist yet
          if (error) {
            console.warn('[Social] Guild members query failed (table may not exist):', error.message);
            set({ currentGuild: null, guildMembers: [] });
            return;
          }

          if (membership?.guild) {
            set({ currentGuild: { ...membership.guild, myRole: membership.role } });
            get().fetchGuildMembers(membership.guild.id);
          } else {
            set({ currentGuild: null, guildMembers: [] });
          }
        } catch (err) {
          console.warn('[Social] Error fetching guild:', err);
          set({ currentGuild: null, guildMembers: [] });
        }
      },

      fetchGuildMembers: async (guildId) => {
        const { data } = await supabase
          .from('guild_members')
          .select(`
            id,
            role,
            xp_contributed,
            joined_at,
            user:user_profiles!guild_members_user_id_fkey(id, display_name, avatar_url, current_level, total_xp)
          `)
          .eq('guild_id', guildId)
          .order('xp_contributed', { ascending: false });

        set({ guildMembers: data || [] });
      },

      createGuild: async (name, description, privacy = 'open') => {
        const userId = await getCurrentUserId();
        if (!userId) return { error: 'Not authenticated' };

        // Create guild
        const { data: guild, error } = await supabase
          .from('guilds')
          .insert({
            name,
            description,
            privacy,
            owner_id: userId,
          })
          .select()
          .single();

        if (error) return { error };

        // Add creator as owner member
        await supabase
          .from('guild_members')
          .insert({
            guild_id: guild.id,
            user_id: userId,
            role: 'owner',
          });

        get().fetchMyGuild();
        return { data: guild };
      },

      joinGuild: async (guildId) => {
        const userId = await getCurrentUserId();
        if (!userId) return { error: 'Not authenticated' };

        const { data, error } = await supabase
          .from('guild_members')
          .insert({
            guild_id: guildId,
            user_id: userId,
            role: 'member',
          })
          .select()
          .single();

        if (!error) {
          get().fetchMyGuild();
        }
        return { data, error };
      },

      leaveGuild: async () => {
        const userId = await getCurrentUserId();
        const { currentGuild } = get();
        if (!userId || !currentGuild) return { error: 'Not in a guild' };

        const { error } = await supabase
          .from('guild_members')
          .delete()
          .eq('guild_id', currentGuild.id)
          .eq('user_id', userId);

        if (!error) {
          set({ currentGuild: null, guildMembers: [] });
        }
        return { error };
      },

      // Guild Management (Officers/Owners)
      updateGuild: async (updates) => {
        const { currentGuild } = get();
        if (!currentGuild) return { error: 'Not in a guild' };

        const { data, error } = await supabase
          .from('guilds')
          .update(updates)
          .eq('id', currentGuild.id)
          .select()
          .single();

        if (!error) {
          set({ currentGuild: { ...currentGuild, ...data } });
        }
        return { data, error };
      },

      kickMember: async (memberId) => {
        const { currentGuild } = get();
        if (!currentGuild) return { error: 'Not in a guild' };

        const { error } = await supabase
          .from('guild_members')
          .delete()
          .eq('guild_id', currentGuild.id)
          .eq('user_id', memberId);

        if (!error) {
          get().fetchGuildMembers(currentGuild.id);
        }
        return { error };
      },

      promoteToOfficer: async (memberId) => {
        const { currentGuild } = get();
        if (!currentGuild) return { error: 'Not in a guild' };

        const { data, error } = await supabase
          .from('guild_members')
          .update({ role: 'officer' })
          .eq('guild_id', currentGuild.id)
          .eq('user_id', memberId)
          .select()
          .single();

        if (!error) {
          get().fetchGuildMembers(currentGuild.id);
        }
        return { data, error };
      },

      demoteFromOfficer: async (memberId) => {
        const { currentGuild } = get();
        if (!currentGuild) return { error: 'Not in a guild' };

        const { data, error } = await supabase
          .from('guild_members')
          .update({ role: 'member' })
          .eq('guild_id', currentGuild.id)
          .eq('user_id', memberId)
          .select()
          .single();

        if (!error) {
          get().fetchGuildMembers(currentGuild.id);
        }
        return { data, error };
      },

      transferOwnership: async (newOwnerId) => {
        const userId = await getCurrentUserId();
        const { currentGuild } = get();
        if (!currentGuild || currentGuild.myRole !== 'owner') {
          return { error: 'Only the owner can transfer ownership' };
        }
        if (!userId) return { error: 'Not authenticated' };

        // Update guild owner
        await supabase
          .from('guilds')
          .update({ owner_id: newOwnerId })
          .eq('id', currentGuild.id);

        // Update member roles
        await supabase
          .from('guild_members')
          .update({ role: 'owner' })
          .eq('guild_id', currentGuild.id)
          .eq('user_id', newOwnerId);

        await supabase
          .from('guild_members')
          .update({ role: 'officer' })
          .eq('guild_id', currentGuild.id)
          .eq('user_id', userId);

        get().fetchMyGuild();
        return { success: true };
      },

      // Guild Applications
      fetchGuildApplications: async () => {
        const { currentGuild } = get();
        if (!currentGuild) return;

        const { data } = await supabase
          .from('guild_applications')
          .select(`
            *,
            user:user_profiles!guild_applications_user_id_fkey(id, display_name, avatar_url, current_level, total_xp)
          `)
          .eq('guild_id', currentGuild.id)
          .eq('status', 'pending')
          .order('created_at', { ascending: false });

        set({ guildApplications: data || [] });
      },

      applyToGuild: async (guildId, message = '') => {
        const userId = await getCurrentUserId();
        if (!userId) return { error: 'Not authenticated' };

        const { data, error } = await supabase
          .from('guild_applications')
          .insert({
            guild_id: guildId,
            user_id: userId,
            message,
          })
          .select()
          .single();

        return { data, error };
      },

      reviewApplication: async (applicationId, approved) => {
        const userId = await getCurrentUserId();
        if (!userId) return { error: 'Not authenticated' };
        const status = approved ? 'accepted' : 'declined';

        const { data: app, error } = await supabase
          .from('guild_applications')
          .update({
            status,
            reviewed_by: userId,
            reviewed_at: new Date().toISOString(),
          })
          .eq('id', applicationId)
          .select()
          .single();

        if (!error && approved) {
          // Add member to guild
          await supabase
            .from('guild_members')
            .insert({
              guild_id: app.guild_id,
              user_id: app.user_id,
              role: 'member',
            });

          get().fetchGuildMembers(app.guild_id);
        }

        get().fetchGuildApplications();
        return { data: app, error };
      },

      // Guild Invites
      sendGuildInvite: async (targetUserId) => {
        const userId = await getCurrentUserId();
        const { currentGuild } = get();
        if (!currentGuild) return { error: 'Not in a guild' };
        if (!userId) return { error: 'Not authenticated' };

        const { data, error } = await supabase
          .from('guild_invites')
          .insert({
            guild_id: currentGuild.id,
            inviter_id: userId,
            invitee_id: targetUserId,
          })
          .select()
          .single();

        return { data, error };
      },

      fetchMyGuildInvites: async () => {
        const userId = await getCurrentUserId();
        if (!userId) return;

        const { data } = await supabase
          .from('guild_invites')
          .select(`
            *,
            guild:guilds(*),
            inviter:user_profiles!guild_invites_inviter_id_fkey(display_name, avatar_url)
          `)
          .eq('invitee_id', userId)
          .eq('status', 'pending')
          .gt('expires_at', new Date().toISOString());

        set({ guildInvites: data || [] });
      },

      respondToGuildInvite: async (inviteId, accept) => {
        const userId = await getCurrentUserId();
        if (!userId) return { error: 'Not authenticated' };
        const status = accept ? 'accepted' : 'declined';

        const { data: invite, error } = await supabase
          .from('guild_invites')
          .update({ status })
          .eq('id', inviteId)
          .select()
          .single();

        if (!error && accept) {
          // Add member to guild
          await supabase
            .from('guild_members')
            .insert({
              guild_id: invite.guild_id,
              user_id: userId,
              role: 'member',
            });

          get().fetchMyGuild();
        }

        get().fetchMyGuildInvites();
        return { data: invite, error };
      },

      // ============================================
      // ACTIVITY FEED ACTIONS
      // ============================================

      fetchActivityFeed: async (page = 0, limit = 20) => {
        set({ feedLoading: true });

        const { data, error } = await supabase
          .from('activity_feed')
          .select(`
            *,
            user:user_profiles!activity_feed_user_id_fkey(id, display_name, avatar_url, current_level)
          `)
          .order('created_at', { ascending: false })
          .range(page * limit, (page + 1) * limit - 1);

        if (data) {
          if (page === 0) {
            set({ feed: data, feedHasMore: data.length === limit });
          } else {
            set(state => ({
              feed: [...state.feed, ...data],
              feedHasMore: data.length === limit,
            }));
          }
        }

        set({ feedLoading: false });
        return { data, error };
      },

      postActivity: async (eventType, eventData, visibility = 'friends') => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { error: 'Not authenticated' };

        const { data, error } = await supabase
          .from('activity_feed')
          .insert({
            user_id: user.id,
            event_type: eventType,
            event_data: eventData,
            visibility,
          })
          .select()
          .single();

        if (!error) {
          get().fetchActivityFeed(0);
        }
        return { data, error };
      },

      likeActivity: async (activityId) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { error: 'Not authenticated' };

        const { data, error } = await supabase
          .from('activity_likes')
          .insert({
            activity_id: activityId,
            user_id: user.id,
          })
          .select()
          .single();

        return { data, error };
      },

      unlikeActivity: async (activityId) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { error: 'Not authenticated' };

        const { error } = await supabase
          .from('activity_likes')
          .delete()
          .eq('activity_id', activityId)
          .eq('user_id', user.id);

        return { error };
      },

      commentOnActivity: async (activityId, content) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { error: 'Not authenticated' };

        // Moderate content before posting
        const moderation = moderateComment(content);
        if (!moderation.allowed) {
          return { error: moderation.reason };
        }

        const { data, error } = await supabase
          .from('activity_comments')
          .insert({
            activity_id: activityId,
            user_id: user.id,
            content: moderation.filtered || content,
          })
          .select()
          .single();

        return { data, error, wasFiltered: moderation.was_filtered };
      },

      // Real-time helpers
      prependToFeed: (activity) => {
        set(state => ({
          feed: [activity, ...state.feed],
        }));
      },

      addPendingRequest: (request) => {
        set(state => ({
          pendingRequests: [request, ...state.pendingRequests],
        }));
      },

      setOnlineFriends: (onlineUserIds) => {
        const { friends } = get();
        const onlineFriends = friends
          .filter(f => onlineUserIds.includes(f.user_id))
          .map(f => f.user_id);
        set({ onlineFriends });
      },

      // ============================================
      // LEADERBOARD ACTIONS
      // ============================================

      fetchLeaderboards: async () => {
        const userId = await getCurrentUserId();

        try {
          // Fetch from Redis
          const [globalTop, weeklyTop, streakTop] = await Promise.all([
            redis.getLeaderboardTop(LEADERBOARD_KEYS.GLOBAL_XP, 100),
            redis.getLeaderboardTop(LEADERBOARD_KEYS.WEEKLY_XP, 100),
            redis.getLeaderboardTop(LEADERBOARD_KEYS.STREAK, 100),
          ]);

          // Get user profiles for the leaderboard entries
          const userIds = [...new Set([
            ...globalTop.map(e => e.userId),
            ...weeklyTop.map(e => e.userId),
            ...streakTop.map(e => e.userId),
          ])];

          const profileMap = {};

          // Only query if we have user IDs to look up
          if (userIds.length > 0) {
            const { data: profiles } = await supabase
              .from('user_profiles')
              .select('id, display_name, avatar_url, current_level')
              .in('id', userIds);

            profiles?.forEach(p => { profileMap[p.id] = p; });
          }

          // Enrich leaderboard entries with profile data
          const enrichEntries = (entries) => entries.map(e => ({
            ...e,
            profile: profileMap[e.userId] || { display_name: 'Unknown', avatar_url: null },
          }));

          set({
            leaderboards: {
              global: enrichEntries(globalTop),
              weekly: enrichEntries(weeklyTop),
              streak: enrichEntries(streakTop),
              monthly: [],
              guild: [],
              friends: [],
            },
          });

          // Fetch user's ranks
          if (userId) {
            const [globalRank, weeklyRank, streakRank, totalUsers] = await Promise.all([
              redis.getLeaderboardRank(LEADERBOARD_KEYS.GLOBAL_XP, userId),
              redis.getLeaderboardRank(LEADERBOARD_KEYS.WEEKLY_XP, userId),
              redis.getLeaderboardRank(LEADERBOARD_KEYS.STREAK, userId),
              redis.getLeaderboardCount(LEADERBOARD_KEYS.GLOBAL_XP),
            ]);

            const percentile = globalRank && totalUsers
              ? Math.round((1 - (globalRank / totalUsers)) * 100)
              : null;

            set({
              myRanks: {
                global: globalRank,
                weekly: weeklyRank,
                streak: streakRank,
                percentile,
              },
            });
          }
        } catch (error) {
          console.error('Error fetching leaderboards:', error);
          // Fallback to database if Redis fails
          get().fetchLeaderboardsFromDB();
        }
      },

      fetchLeaderboardsFromDB: async () => {
        // Fallback: fetch from PostgreSQL
        const { data } = await supabase
          .from('user_profiles')
          .select('id, display_name, avatar_url, current_level, total_xp')
          .eq('show_on_leaderboards', true)
          .order('total_xp', { ascending: false })
          .limit(100);

        if (data) {
          const global = data.map((p, i) => ({
            rank: i + 1,
            userId: p.id,
            score: p.total_xp,
            profile: p,
          }));

          const streak = [...data]
            .sort((a, b) => (b.current_streak || 0) - (a.current_streak || 0))
            .map((p, i) => ({
              rank: i + 1,
              userId: p.id,
              score: p.current_streak || 0,
              profile: p,
            }));

          set({
            leaderboards: {
              ...get().leaderboards,
              global,
              streak,
            },
          });
        }
      },

      // Sync user stats to Redis leaderboards
      syncToLeaderboards: async (totalXP, xpGained = 0, currentStreak = 0) => {
        const userId = await getCurrentUserId();
        if (!userId) return;

        const { socialProfile } = get();
        if (!socialProfile?.show_on_leaderboards) return;

        try {
          await Promise.all([
            redis.updateUserXP(userId, totalXP, xpGained),
            redis.updateUserStreak(userId, currentStreak),
          ]);
        } catch (error) {
          console.error('Error syncing to leaderboards:', error);
        }
      },

      // ============================================
      // CHALLENGES ACTIONS
      // ============================================

      fetchChallenges: async () => {
        const userId = await getCurrentUserId();

        // Fetch active challenges
        const { data: active } = await supabase
          .from('challenges')
          .select('*')
          .eq('status', 'active')
          .order('ends_at', { ascending: true });

        set({ availableChallenges: active || [] });

        // Fetch user's challenge participations
        if (userId) {
          const { data: participations } = await supabase
            .from('challenge_participants')
            .select(`
              *,
              challenge:challenges(*)
            `)
            .eq('user_id', userId);

          // For H2H challenges, fetch opponent progress
          const enrichedParticipations = await Promise.all(
            (participations || []).map(async (p) => {
              if (p.challenge?.challenge_type === 'head_to_head') {
                // Fetch all participants for this challenge
                const { data: allParticipants } = await supabase
                  .from('challenge_participants')
                  .select(`
                    *,
                    user:user_profiles!challenge_participants_user_id_fkey(id, display_name, avatar_url)
                  `)
                  .eq('challenge_id', p.challenge_id)
                  .neq('user_id', userId);

                // Get opponent data
                const opponent = allParticipants?.[0];
                return {
                  ...p,
                  opponent: opponent ? {
                    user_id: opponent.user_id,
                    display_name: opponent.user?.display_name,
                    avatar_url: opponent.user?.avatar_url,
                    current_value: opponent.current_value || 0,
                    completed: opponent.completed,
                  } : null,
                };
              }
              return p;
            })
          );

          set({ myChallenges: enrichedParticipations });
        }
      },

      joinChallenge: async (challengeId) => {
        const userId = await getCurrentUserId();
        if (!userId) return { error: 'Not authenticated' };

        const { data, error } = await supabase
          .from('challenge_participants')
          .insert({
            challenge_id: challengeId,
            user_id: userId,
          })
          .select()
          .single();

        if (!error) {
          get().fetchChallenges();
        }
        return { data, error };
      },

      updateChallengeProgress: async (challengeId, newValue) => {
        const userId = await getCurrentUserId();
        if (!userId) return { error: 'Not authenticated' };

        // Get the challenge to check target
        const { data: participation } = await supabase
          .from('challenge_participants')
          .select('*, challenge:challenges(*)')
          .eq('challenge_id', challengeId)
          .eq('user_id', userId)
          .single();

        const updates = { current_value: newValue };

        // Check if challenge is completed
        if (participation?.challenge && newValue >= participation.challenge.target_value) {
          updates.completed = true;
          updates.completed_at = new Date().toISOString();
        }

        const { data, error } = await supabase
          .from('challenge_participants')
          .update(updates)
          .eq('challenge_id', challengeId)
          .eq('user_id', userId)
          .select()
          .single();

        // If completed, award rewards
        if (updates.completed && !error) {
          await get().awardChallengeReward(challengeId, userId);
        }

        return { data, error };
      },

      // Challenge Creation
      createChallenge: async (challengeData) => {
        const userId = await getCurrentUserId();
        if (!userId) return { error: 'Not authenticated' };

        const {
          title,
          description,
          challengeType = 'individual',
          metricType,
          targetValue,
          durationDays,
          xpReward = 100,
          icon = '🎯',
        } = challengeData;

        // Calculate start and end dates
        const startsAt = new Date();
        const endsAt = new Date();
        endsAt.setDate(endsAt.getDate() + durationDays);

        const { data, error } = await supabase
          .from('challenges')
          .insert({
            title,
            description,
            icon,
            challenge_type: challengeType,
            metric_type: metricType,
            target_value: targetValue,
            duration_days: durationDays,
            xp_reward: xpReward,
            creator_id: userId,
            status: 'active',
            starts_at: startsAt.toISOString(),
            ends_at: endsAt.toISOString(),
          })
          .select()
          .single();

        if (!error) {
          // Auto-join creator to individual/community challenges
          if (challengeType === 'individual' || challengeType === 'community') {
            await supabase
              .from('challenge_participants')
              .insert({
                challenge_id: data.id,
                user_id: userId,
              });
          }
          get().fetchChallenges();
          // Award XP for creating a challenge
          triggerGamification('challengeCreated', { xpOverride: 20, module: 'social' });
        }

        return { data, error };
      },

      // Head-to-Head Challenge System
      createHeadToHead: async (opponentId, challengeData) => {
        const userId = await getCurrentUserId();
        if (!userId) return { error: 'Not authenticated' };

        const {
          title,
          metricType,
          targetValue,
          durationDays,
          xpReward = 150,
        } = challengeData;

        // Calculate dates
        const startsAt = new Date();
        const endsAt = new Date();
        endsAt.setDate(endsAt.getDate() + durationDays);

        // Create the H2H challenge
        const { data: challenge, error } = await supabase
          .from('challenges')
          .insert({
            title: title || `Head-to-Head: ${metricType}`,
            description: `A head-to-head challenge between two friends`,
            icon: '⚔️',
            challenge_type: 'head_to_head',
            metric_type: metricType,
            target_value: targetValue,
            duration_days: durationDays,
            xp_reward: xpReward,
            creator_id: userId,
            status: 'pending', // Needs opponent acceptance
            starts_at: startsAt.toISOString(),
            ends_at: endsAt.toISOString(),
          })
          .select()
          .single();

        if (error) return { error };

        // Add creator as participant
        await supabase
          .from('challenge_participants')
          .insert({
            challenge_id: challenge.id,
            user_id: userId,
          });

        // Create invite for opponent (stored in challenge metadata)
        await supabase
          .from('challenges')
          .update({
            event_data: {
              opponent_id: opponentId,
              challenger_id: userId,
              status: 'pending_acceptance',
            },
          })
          .eq('id', challenge.id);

        get().fetchChallenges();
        return { data: challenge };
      },

      acceptHeadToHead: async (challengeId) => {
        const userId = await getCurrentUserId();
        if (!userId) return { error: 'Not authenticated' };

        // Join the challenge
        await supabase
          .from('challenge_participants')
          .insert({
            challenge_id: challengeId,
            user_id: userId,
          });

        // Activate the challenge
        const { data, error } = await supabase
          .from('challenges')
          .update({ status: 'active' })
          .eq('id', challengeId)
          .select()
          .single();

        get().fetchChallenges();
        return { data, error };
      },

      declineHeadToHead: async (challengeId) => {
        const { data, error } = await supabase
          .from('challenges')
          .update({ status: 'cancelled' })
          .eq('id', challengeId)
          .select()
          .single();

        get().fetchChallenges();
        return { data, error };
      },

      fetchHeadToHeadInvites: async () => {
        const userId = await getCurrentUserId();
        if (!userId) return;

        const { data } = await supabase
          .from('challenges')
          .select(`
            *,
            creator:user_profiles!challenges_creator_id_fkey(id, display_name, avatar_url, current_level)
          `)
          .eq('challenge_type', 'head_to_head')
          .eq('status', 'pending')
          .contains('event_data', { opponent_id: userId });

        set({ pendingH2HInvites: data || [] });
      },

      // Rewards Distribution
      awardChallengeReward: async (challengeId, userId) => {
        // Get challenge details
        const { data: challenge } = await supabase
          .from('challenges')
          .select('*')
          .eq('id', challengeId)
          .single();

        if (!challenge) return { error: 'Challenge not found' };

        // Award XP through gamification pipeline
        if (challenge.xp_reward > 0) {
          // Use triggerGamification for proper XP pipeline (achievements, level up, etc.)
          triggerGamification('challengeCompleted', {
            xpOverride: challenge.xp_reward,
            module: 'social'
          });

          // Also sync to Redis leaderboards for social features
          try {
            const { data: profile } = await supabase
              .from('user_profiles')
              .select('total_xp')
              .eq('id', userId)
              .single();
            const newTotalXP = (profile?.total_xp || 0) + challenge.xp_reward;
            await redis.updateUserXP(userId, newTotalXP, challenge.xp_reward);
          } catch (e) {
            console.error('Failed to sync XP to leaderboard:', e);
          }
        }

        // Award badge if applicable
        if (challenge.badge_reward) {
          await supabase
            .from('user_achievements')
            .insert({
              user_id: userId,
              achievement_id: challenge.badge_reward,
              earned_at: new Date().toISOString(),
            });
        }

        // Post achievement to activity feed
        await supabase
          .from('activity_feed')
          .insert({
            user_id: userId,
            event_type: 'challenge_complete',
            event_data: {
              challenge_id: challengeId,
              challenge_title: challenge.title,
              xp_earned: challenge.xp_reward,
            },
            visibility: 'friends',
          });

        return { success: true, xpAwarded: challenge.xp_reward };
      },

      // Complete a challenge (for manual completion or checking)
      completeChallenge: async (challengeId) => {
        const userId = await getCurrentUserId();
        if (!userId) return { error: 'Not authenticated' };

        const { data, error } = await supabase
          .from('challenge_participants')
          .update({
            completed: true,
            completed_at: new Date().toISOString(),
          })
          .eq('challenge_id', challengeId)
          .eq('user_id', userId)
          .select()
          .single();

        if (!error) {
          await get().awardChallengeReward(challengeId, userId);
          get().fetchChallenges();
        }

        return { data, error };
      },

      // Finalize H2H challenge and determine winner
      finalizeHeadToHead: async (challengeId) => {
        const { data: participants } = await supabase
          .from('challenge_participants')
          .select('*')
          .eq('challenge_id', challengeId)
          .order('current_value', { ascending: false });

        if (!participants || participants.length < 2) {
          return { error: 'Invalid H2H challenge' };
        }

        // Determine winner
        const winner = participants[0];
        const loser = participants[1];

        // Update ranks
        await supabase
          .from('challenge_participants')
          .update({ final_rank: 1, completed: true, completed_at: new Date().toISOString() })
          .eq('challenge_id', challengeId)
          .eq('user_id', winner.user_id);

        await supabase
          .from('challenge_participants')
          .update({ final_rank: 2, completed: true, completed_at: new Date().toISOString() })
          .eq('challenge_id', challengeId)
          .eq('user_id', loser.user_id);

        // Award winner extra XP
        await get().awardChallengeReward(challengeId, winner.user_id);

        // Mark challenge as completed
        await supabase
          .from('challenges')
          .update({ status: 'completed' })
          .eq('id', challengeId);

        return { winner: winner.user_id, loser: loser.user_id };
      },

      // ============================================
      // PRESENCE ACTIONS
      // ============================================

      updatePresence: async () => {
        const userId = await getCurrentUserId();
        if (!userId) return;

        try {
          await redis.setUserOnline(userId);
        } catch (error) {
          console.error('Error updating presence:', error);
        }
      },

      fetchOnlineFriends: async () => {
        const { friends } = get();
        if (friends.length === 0) return;

        try {
          const onlineUsers = await redis.getOnlineUsers();
          const onlineSet = new Set(onlineUsers);
          const onlineFriends = friends
            .filter(f => onlineSet.has(f.user_id))
            .map(f => f.user_id);

          set({ onlineFriends });
        } catch (error) {
          console.error('Error fetching online friends:', error);
        }
      },

      // ============================================
      // REPORTING ACTIONS
      // ============================================

      reportUser: async (targetUserId, reason, description = '', contentType = null, contentId = null) => {
        const userId = await getCurrentUserId();
        if (!userId) return { error: 'Not authenticated' };

        const { data, error } = await supabase
          .from('user_reports')
          .insert({
            reporter_id: userId,
            reported_user_id: targetUserId,
            reason,
            description,
            reported_content_type: contentType,
            reported_content_id: contentId,
          })
          .select()
          .single();

        return { data, error };
      },

      // ============================================
      // INITIALIZATION
      // ============================================

      initializeSocial: async () => {
        set({ loading: true });

        const userId = await getCurrentUserId();

        await Promise.all([
          get().fetchSocialProfile(),
          get().fetchFriends(),
          get().fetchPendingRequests(),
          get().fetchBlockedUsers(),
          get().fetchMyGuild(),
          get().fetchMyGuildInvites(),
          get().fetchLeaderboards(),
          get().fetchChallenges(),
          get().fetchHeadToHeadInvites(),
        ]);

        // Start presence updates
        get().updatePresence();

        // Initialize real-time subscriptions
        if (userId && !get().realtimeInitialized) {
          initializeSocialRealtime(userId, {
            onFriendRequest: (request) => {
              console.log('New friend request received:', request);
            },
            onNewActivity: (activity) => {
              console.log('New activity:', activity);
            },
            onEngagement: (engagement) => {
              console.log('New engagement:', engagement);
            },
          });
          set({ realtimeInitialized: true });
        }

        set({ loading: false });
      },

      // Cleanup function for unmounting
      cleanupSocial: () => {
        cleanupSocialRealtime();
        set({ realtimeInitialized: false });
      },

      // Reset store
      reset: () => {
        cleanupSocialRealtime();
        set(initialState);
      },
    }),
    {
      name: 'lifeos-social',
      partialize: (state) => ({
        // Only persist minimal data
        socialProfile: state.socialProfile,
      }),
    }
  )
);

// Initialize function for app startup
export const initializeSocialStore = async () => {
  const store = useSocialStore.getState();
  await store.initializeSocial();
};

export default useSocialStore;
