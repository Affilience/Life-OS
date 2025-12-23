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

// Helper to get current user ID - checks store first, then falls back to auth
const getCurrentUserId = async (timeoutMs = 3000) => {
  if (isDevMode()) {
    return DEV_USER_ID;
  }

  // Check if userId is already stored (set during initialization)
  const storedUserId = useSocialStore.getState().currentUserId;
  if (storedUserId) {
    return storedUserId;
  }

  try {
    // Fallback: fetch from auth with timeout
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Auth timeout')), timeoutMs)
    );

    const authPromise = supabase.auth.getUser();
    const { data: { user } } = await Promise.race([authPromise, timeoutPromise]);
    return user?.id || null;
  } catch (error) {
    console.warn('[SocialStore] getCurrentUserId error:', error.message);
    return null;
  }
};

// ============================================
// CREDIT WAGER HELPER FUNCTIONS
// ============================================

// Check if user has enough credits for a wager
const checkUserCredits = async (userId, amount) => {
  const { data, error } = await supabase
    .from('user_cosmic_currency')
    .select('cosmic_credits')
    .eq('user_id', userId)
    .single();

  if (error) return { hasEnough: false, balance: 0, error: error.message };
  return { hasEnough: data.cosmic_credits >= amount, balance: data.cosmic_credits };
};

// Deduct credits from a user (for wagers) - ATOMIC operation
const deductCredits = async (userId, amount, description, relatedChallengeId) => {
  // Use atomic RPC function with row locking to prevent race conditions
  const { data: result, error } = await supabase
    .rpc('spend_credits_atomic', {
      p_user_id: userId,
      p_amount: amount,
      p_purpose: 'wager',
      p_description: description
    });

  if (error) return { success: false, error: error.message };
  if (!result?.success) return { success: false, error: result?.error || 'Spend failed' };

  return { success: true, newBalance: result.new_balance };
};

// Award credits to a user (for winning wagers) - ATOMIC operation
const awardCredits = async (userId, amount, description, relatedChallengeId) => {
  // Use atomic RPC function to prevent race conditions
  const { data: result, error } = await supabase
    .rpc('award_cosmic_credits', {
      p_user_id: userId,
      p_amount: amount,
      p_transaction_type: 'wager_win',
      p_description: description,
      p_related_entity_id: relatedChallengeId,
      p_related_entity_type: 'challenge'
    });

  if (error) return { success: false, error: error.message };
  if (!result?.success) return { success: false, error: 'Award failed' };

  return { success: true, newBalance: result.new_balance };
};

// Refund credits (for cancelled challenges) - ATOMIC operation
const refundCredits = async (userId, amount, description, relatedChallengeId) => {
  // Use atomic RPC function - refunds use award since we're adding credits back
  const { data: result, error } = await supabase
    .rpc('award_cosmic_credits', {
      p_user_id: userId,
      p_amount: amount,
      p_transaction_type: 'wager_refund',
      p_description: description,
      p_related_entity_id: relatedChallengeId,
      p_related_entity_type: 'challenge'
    });

  if (error) return { success: false, error: error.message };
  if (!result?.success) return { success: false, error: 'Refund failed' };

  return { success: true, newBalance: result.new_balance };
};

// Initial state
const initialState = {
  // Current user ID (set during initialization to avoid repeated auth calls)
  currentUserId: null,

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

      fetchSocialProfile: async (passedUserId = null) => {
        const userId = passedUserId || await getCurrentUserId();
        console.log('[SocialStore] fetchSocialProfile - userId:', userId);
        if (!userId) return;

        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        if (error) {
          console.error('[SocialStore] Error fetching social profile:', error);
          return;
        }

        console.log('[SocialStore] Profile fetched:', data?.display_name || 'NO PROFILE');
        // Profile might not exist yet for new users - that's okay
        set({ socialProfile: data || null });
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
      // Respects privacy settings - only shows users with public/friends visibility
      searchUsers: async (query) => {
        if (!query || query.length < 2) return [];

        const userId = await getCurrentUserId();
        if (!userId) return [];

        // Escape special characters for PostgREST filter
        const escapedQuery = query.replace(/[%_\\]/g, '\\$&');

        // Search by username (exact prefix match prioritized) OR display name
        // Include preferences to check privacy settings
        const { data, error } = await supabase
          .from('user_profiles')
          .select('id, username, display_name, avatar_url, current_level, total_xp, preferences')
          .neq('id', userId) // Exclude self
          .or(`username.ilike.${escapedQuery}%,display_name.ilike.%${escapedQuery}%`)
          .limit(20); // Fetch more to account for privacy filtering

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

        // Filter results based on privacy settings and existing relationships
        const filteredResults = (data || []).filter(u => {
          if (!u.id || excludeIds.includes(u.id)) return false;

          // Check profile visibility privacy setting
          const profileVisibility = u.preferences?.privacy?.profileVisibility || 'public';

          // Private profiles are never shown in search
          if (profileVisibility === 'private') return false;

          // Friends-only profiles are only shown if they're already friends (but we exclude friends from search)
          // So friends-only profiles won't appear in search results for non-friends
          if (profileVisibility === 'friends') return false;

          // Public profiles are shown
          return true;
        });

        // Sort: exact username matches first, then prefix matches, then display name matches
        // Remove preferences from returned data (not needed by UI)
        return filteredResults
          .map(({ preferences, ...user }) => user)
          .sort((a, b) => {
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
          })
          .slice(0, 10); // Return max 10 results
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

      // Update display name
      updateDisplayName: async (displayName) => {
        const userId = await getCurrentUserId();
        if (!userId) return { error: 'Not authenticated' };

        // Validate display name
        const validation = validateDisplayName(displayName);
        if (!validation.valid) {
          return { error: validation.reason || 'Invalid display name' };
        }

        const { data, error } = await supabase
          .from('user_profiles')
          .update({ display_name: displayName })
          .eq('id', userId)
          .select()
          .single();

        if (!error && data) {
          set({ socialProfile: { ...get().socialProfile, display_name: data.display_name } });
        }

        return { success: !error, data, error: error?.message };
      },

      // ============================================
      // FRIENDS ACTIONS
      // ============================================

      fetchFriends: async (passedUserId = null) => {
        const userId = passedUserId || get().currentUserId || await getCurrentUserId();
        if (!userId) return;

        // Get accepted friendships - include preferences for privacy checks
        const { data: friendships } = await supabase
          .from('friendships')
          .select(`
            id,
            requester_id,
            addressee_id,
            accepted_at,
            requester:user_profiles!friendships_requester_id_fkey(id, display_name, avatar_url, current_level, total_xp, active_cosmetics, preferences),
            addressee:user_profiles!friendships_addressee_id_fkey(id, display_name, avatar_url, current_level, total_xp, active_cosmetics, preferences)
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

      fetchPendingRequests: async (passedUserId = null) => {
        const userId = passedUserId || get().currentUserId || await getCurrentUserId();
        if (!userId) return;

        // Requests sent TO me
        const { data: pending } = await supabase
          .from('friendships')
          .select(`
            id,
            created_at,
            requester:user_profiles!friendships_requester_id_fkey(id, display_name, avatar_url, current_level, active_cosmetics)
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

        // Check if target user allows friend requests (privacy setting)
        const { data: targetProfile } = await supabase
          .from('user_profiles')
          .select('preferences')
          .eq('id', targetUserId)
          .single();

        const allowFriendRequests = targetProfile?.preferences?.privacy?.allowFriendRequests ?? true;
        if (!allowFriendRequests) {
          return { error: 'This user is not accepting friend requests' };
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
          // Award XP for making a new friend (EASY tier: 5-10 XP)
          triggerGamification('friendAdded', { xpOverride: 5, module: 'social' });
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

      fetchBlockedUsers: async (passedUserId = null) => {
        const userId = passedUserId || get().currentUserId || await getCurrentUserId();
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

      fetchMyGuild: async (passedUserId = null) => {
        const userId = passedUserId || get().currentUserId || await getCurrentUserId();
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

      fetchMyGuildInvites: async (passedUserId = null) => {
        const userId = passedUserId || get().currentUserId || await getCurrentUserId();
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

      // Fetch activity feed with privacy filtering
      // Only shows activities from users with public profiles or friends with friends-only visibility
      fetchActivityFeed: async (page = 0, limit = 20) => {
        set({ feedLoading: true });

        const userId = await getCurrentUserId();
        const { friends } = get();
        const friendIds = (friends || []).map(f => f.id || f.user_id).filter(Boolean);

        // Fetch more to account for privacy filtering
        const { data, error } = await supabase
          .from('activity_feed')
          .select(`
            *,
            user:user_profiles!activity_feed_user_id_fkey(id, display_name, avatar_url, current_level, preferences)
          `)
          .order('created_at', { ascending: false })
          .range(page * limit, (page + 1) * limit + 10); // Fetch extra for filtering

        if (data) {
          // Filter activities based on privacy settings
          const filteredData = data.filter(activity => {
            // Always show own activities
            if (activity.user_id === userId) return true;

            // Check user's profile visibility setting
            const profileVisibility = activity.user?.preferences?.privacy?.profileVisibility || 'public';

            // Private profiles - only show to the user themselves (already handled above)
            if (profileVisibility === 'private') return false;

            // Friends-only profiles - only show to friends
            if (profileVisibility === 'friends') {
              return friendIds.includes(activity.user_id);
            }

            // Public profiles - also respect the activity's visibility field
            if (activity.visibility === 'friends') {
              return friendIds.includes(activity.user_id);
            }

            return true;
          }).slice(0, limit); // Limit after filtering

          // Remove preferences from user object (not needed in UI)
          const cleanedData = filteredData.map(activity => ({
            ...activity,
            user: activity.user ? {
              id: activity.user.id,
              display_name: activity.user.display_name,
              avatar_url: activity.user.avatar_url,
              current_level: activity.user.current_level,
            } : null,
          }));

          if (page === 0) {
            set({ feed: cleanedData, feedHasMore: cleanedData.length === limit });
          } else {
            set(state => ({
              feed: [...state.feed, ...cleanedData],
              feedHasMore: cleanedData.length === limit,
            }));
          }
        }

        set({ feedLoading: false });
        return { data, error };
      },

      postActivity: async (eventType, eventData, visibility = 'friends') => {
        const userId = await getCurrentUserId();
        if (!userId) return { error: 'Not authenticated' };

        const { data, error } = await supabase
          .from('activity_feed')
          .insert({
            user_id: userId,
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
        const userId = await getCurrentUserId();
        if (!userId) return { error: 'Not authenticated' };

        const { data, error } = await supabase
          .from('activity_likes')
          .insert({
            activity_id: activityId,
            user_id: userId,
          })
          .select()
          .single();

        return { data, error };
      },

      unlikeActivity: async (activityId) => {
        const userId = await getCurrentUserId();
        if (!userId) return { error: 'Not authenticated' };

        const { error } = await supabase
          .from('activity_likes')
          .delete()
          .eq('activity_id', activityId)
          .eq('user_id', userId);

        return { error };
      },

      commentOnActivity: async (activityId, content) => {
        const userId = await getCurrentUserId();
        if (!userId) return { error: 'Not authenticated' };

        // Moderate content before posting
        const moderation = moderateComment(content);
        if (!moderation.allowed) {
          return { error: moderation.reason };
        }

        const { data, error } = await supabase
          .from('activity_comments')
          .insert({
            activity_id: activityId,
            user_id: userId,
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

      fetchLeaderboards: async (passedUserId = null) => {
        const userId = passedUserId || get().currentUserId || await getCurrentUserId();

        try {
          // Fetch from Redis
          const [globalTop, weeklyTop, streakTop] = await Promise.all([
            redis.getLeaderboardTop(LEADERBOARD_KEYS.GLOBAL_XP, 100),
            redis.getLeaderboardTop(LEADERBOARD_KEYS.WEEKLY_XP, 100),
            redis.getLeaderboardTop(LEADERBOARD_KEYS.STREAK, 100),
          ]);

          // Check if Redis returned null (connection failed) - use fallback
          if (!globalTop || !weeklyTop || !streakTop) {
            console.log('[Social] Redis unavailable, using database fallback');
            get().fetchLeaderboardsFromDB();
            return;
          }

          // Get user profiles for the leaderboard entries
          const userIds = [...new Set([
            ...globalTop.map(e => e.userId),
            ...weeklyTop.map(e => e.userId),
            ...streakTop.map(e => e.userId),
          ])];

          const profileMap = {};
          const hiddenUserIds = new Set(); // Users who opted out of leaderboards

          // Only query if we have user IDs to look up
          if (userIds.length > 0) {
            const { data: profiles } = await supabase
              .from('user_profiles')
              .select('id, display_name, avatar_url, current_level, preferences')
              .in('id', userIds);

            profiles?.forEach(p => {
              // Check if user has opted out of leaderboards
              const showOnLeaderboards = p.preferences?.privacy?.showOnLeaderboards ?? true;
              if (!showOnLeaderboards) {
                hiddenUserIds.add(p.id);
              } else {
                profileMap[p.id] = p;
              }
            });
          }

          // Enrich leaderboard entries with profile data, filtering out hidden users
          const enrichEntries = (entries) => entries
            .filter(e => !hiddenUserIds.has(e.userId))
            .map(e => ({
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
          .select('id, display_name, avatar_url, current_level, total_xp, preferences')
          .order('total_xp', { ascending: false })
          .limit(200); // Fetch more to account for filtered users

        if (data) {
          // Filter out users who have opted out of leaderboards
          const visibleData = data.filter(p => {
            const showOnLeaderboards = p.preferences?.privacy?.showOnLeaderboards ?? true;
            return showOnLeaderboards;
          }).slice(0, 100); // Limit to top 100 after filtering

          const global = visibleData.map((p, i) => ({
            rank: i + 1,
            userId: p.id,
            score: p.total_xp,
            profile: p,
          }));

          const streak = [...visibleData]
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

      fetchChallenges: async (passedUserId = null) => {
        const userId = passedUserId || get().currentUserId || await getCurrentUserId();

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
          // Award XP for creating a challenge (MEDIUM tier: 10-20 XP)
          triggerGamification('challengeCreated', { xpOverride: 10, module: 'social' });
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
          wagerAmount = 0,
        } = challengeData;

        // If there's a wager, check and deduct challenger's credits first
        if (wagerAmount > 0) {
          const creditCheck = await checkUserCredits(userId, wagerAmount);
          if (!creditCheck.hasEnough) {
            return { error: `Insufficient credits. You have ${creditCheck.balance} credits but need ${wagerAmount}.` };
          }
        }

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
            icon: wagerAmount > 0 ? '💰' : '⚔️',
            challenge_type: 'head_to_head',
            metric_type: metricType,
            target_value: targetValue,
            duration_days: durationDays,
            xp_reward: xpReward,
            wager_amount: wagerAmount,
            wager_status: wagerAmount > 0 ? 'pending' : 'none',
            creator_id: userId,
            status: 'pending', // Needs opponent acceptance
            starts_at: startsAt.toISOString(),
            ends_at: endsAt.toISOString(),
          })
          .select()
          .single();

        if (error) return { error };

        // Deduct challenger's wager
        if (wagerAmount > 0) {
          const deductResult = await deductCredits(
            userId,
            wagerAmount,
            `Wager for challenge: ${challenge.title}`,
            challenge.id
          );
          if (!deductResult.success) {
            // Rollback challenge creation
            await supabase.from('challenges').delete().eq('id', challenge.id);
            return { error: deductResult.error };
          }
        }

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
        get().fetchHeadToHeadInvites();
        return { data: challenge };
      },

      acceptHeadToHead: async (challengeId) => {
        const userId = await getCurrentUserId();
        if (!userId) return { error: 'Not authenticated' };

        // Get challenge details to check for wager
        const { data: challenge } = await supabase
          .from('challenges')
          .select('*')
          .eq('id', challengeId)
          .single();

        if (!challenge) return { error: 'Challenge not found' };

        // If there's a wager, check and deduct opponent's credits
        if (challenge.wager_amount > 0) {
          const creditCheck = await checkUserCredits(userId, challenge.wager_amount);
          if (!creditCheck.hasEnough) {
            return { error: `Insufficient credits. You have ${creditCheck.balance} credits but need ${challenge.wager_amount} to accept this challenge.` };
          }

          const deductResult = await deductCredits(
            userId,
            challenge.wager_amount,
            `Wager for challenge: ${challenge.title}`,
            challengeId
          );
          if (!deductResult.success) {
            return { error: deductResult.error };
          }
        }

        // Join the challenge
        await supabase
          .from('challenge_participants')
          .insert({
            challenge_id: challengeId,
            user_id: userId,
          });

        // Activate the challenge and update wager status
        const { data, error } = await supabase
          .from('challenges')
          .update({
            status: 'active',
            wager_status: challenge.wager_amount > 0 ? 'held' : 'none',
            starts_at: new Date().toISOString(), // Reset start time to now
          })
          .eq('id', challengeId)
          .select()
          .single();

        // Award XP for accepting challenge
        triggerGamification('challengeAccepted', { xpOverride: 10, module: 'social' });

        get().fetchChallenges();
        get().fetchHeadToHeadInvites();
        return { data, error };
      },

      declineHeadToHead: async (challengeId) => {
        // Get challenge details to check for wager refund
        const { data: challenge } = await supabase
          .from('challenges')
          .select('*')
          .eq('id', challengeId)
          .single();

        if (!challenge) return { error: 'Challenge not found' };

        // Refund the challenger's wager if applicable
        if (challenge.wager_amount > 0 && challenge.creator_id) {
          await refundCredits(
            challenge.creator_id,
            challenge.wager_amount,
            `Wager refunded - challenge declined: ${challenge.title}`,
            challengeId
          );
        }

        const { data, error } = await supabase
          .from('challenges')
          .update({
            status: 'cancelled',
            wager_status: challenge.wager_amount > 0 ? 'refunded' : 'none',
          })
          .eq('id', challengeId)
          .select()
          .single();

        get().fetchChallenges();
        get().fetchHeadToHeadInvites();
        return { data, error };
      },

      fetchHeadToHeadInvites: async (passedUserId = null) => {
        const userId = passedUserId || get().currentUserId || await getCurrentUserId();
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
        // Get challenge details including wager
        const { data: challenge, error: challengeError } = await supabase
          .from('challenges')
          .select('*')
          .eq('id', challengeId)
          .single();

        if (challengeError || !challenge) {
          return { error: 'Challenge not found' };
        }

        // Don't finalize already completed challenges
        if (challenge.status === 'completed') {
          return { error: 'Challenge already finalized' };
        }

        const { data: participants } = await supabase
          .from('challenge_participants')
          .select('*, user:user_profiles(display_name)')
          .eq('challenge_id', challengeId)
          .order('current_value', { ascending: false });

        if (!participants || participants.length < 2) {
          return { error: 'Invalid H2H challenge' };
        }

        // Determine winner (highest current_value)
        const winner = participants[0];
        const loser = participants[1];
        const isTie = winner.current_value === loser.current_value;

        // Handle credit wagers
        let creditsAwarded = 0;
        if (challenge.wager_amount > 0 && challenge.wager_status === 'held') {
          const totalPot = challenge.wager_amount * 2; // Both players wagered

          if (isTie) {
            // Tie - refund both players
            await refundCredits(
              winner.user_id,
              challenge.wager_amount,
              `Wager refund (tie): ${challenge.title}`,
              challengeId
            );
            await refundCredits(
              loser.user_id,
              challenge.wager_amount,
              `Wager refund (tie): ${challenge.title}`,
              challengeId
            );
          } else {
            // Winner takes all
            const awardResult = await awardCredits(
              winner.user_id,
              totalPot,
              `Challenge won: ${challenge.title} (+${totalPot} credits)`,
              challengeId
            );
            if (awardResult.success) {
              creditsAwarded = totalPot;
            }
          }
        }

        // Update ranks
        await supabase
          .from('challenge_participants')
          .update({
            final_rank: isTie ? 1 : 1,
            completed: true,
            completed_at: new Date().toISOString()
          })
          .eq('challenge_id', challengeId)
          .eq('user_id', winner.user_id);

        await supabase
          .from('challenge_participants')
          .update({
            final_rank: isTie ? 1 : 2,
            completed: true,
            completed_at: new Date().toISOString()
          })
          .eq('challenge_id', challengeId)
          .eq('user_id', loser.user_id);

        // Award winner extra XP (unless tie)
        if (!isTie) {
          await get().awardChallengeReward(challengeId, winner.user_id);
        }

        // Mark challenge as completed with winner info
        await supabase
          .from('challenges')
          .update({
            status: 'completed',
            winner_id: isTie ? null : winner.user_id,
            wager_status: challenge.wager_amount > 0 ? 'paid' : 'none',
            finalized_at: new Date().toISOString(),
          })
          .eq('id', challengeId);

        // Post to activity feed
        const winnerName = winner.user?.display_name || 'Player';
        const loserName = loser.user?.display_name || 'Player';

        await supabase
          .from('activity_feed')
          .insert({
            user_id: winner.user_id,
            event_type: 'challenge_won',
            event_data: {
              challenge_id: challengeId,
              challenge_title: challenge.title,
              opponent_name: loserName,
              winner_score: winner.current_value,
              loser_score: loser.current_value,
              credits_won: creditsAwarded,
              is_tie: isTie,
            },
            visibility: 'friends',
          });

        // Refresh challenges
        get().fetchChallenges();

        return {
          winner: isTie ? null : winner.user_id,
          loser: isTie ? null : loser.user_id,
          isTie,
          creditsAwarded,
          winnerScore: winner.current_value,
          loserScore: loser.current_value,
        };
      },

      // Check and auto-finalize all ended H2H challenges
      // Call this periodically (on app load, when viewing challenges, etc.)
      checkAndFinalizeEndedChallenges: async () => {
        try {
          // Find all H2H challenges that have ended but aren't completed
          const { data: endedChallenges, error } = await supabase
            .from('challenges')
            .select('id, title, ends_at, wager_amount, wager_status')
            .eq('challenge_type', 'head_to_head')
            .eq('status', 'active')
            .lt('ends_at', new Date().toISOString());

          if (error || !endedChallenges) return { finalized: 0 };

          let finalizedCount = 0;
          const results = [];

          // Finalize each ended challenge
          for (const challenge of endedChallenges) {
            console.log(`Auto-finalizing challenge: ${challenge.title} (ID: ${challenge.id})`);
            const result = await get().finalizeHeadToHead(challenge.id);
            if (!result.error) {
              finalizedCount++;
              results.push({
                challengeId: challenge.id,
                title: challenge.title,
                ...result,
              });
            }
          }

          if (finalizedCount > 0) {
            console.log(`Auto-finalized ${finalizedCount} ended challenges`);
            get().fetchChallenges(); // Refresh challenges list
          }

          return { finalized: finalizedCount, results };
        } catch (error) {
          console.error('Error auto-finalizing challenges:', error);
          return { error: error.message, finalized: 0 };
        }
      },

      // Get all completed H2H challenges for the current user (for history view)
      fetchCompletedH2HChallenges: async () => {
        const userId = await getCurrentUserId();
        if (!userId) return { data: [], error: 'Not authenticated' };

        try {
          const { data, error } = await supabase
            .from('challenge_participants')
            .select(`
              *,
              challenge:challenges(
                id,
                title,
                icon,
                target_value,
                metric_type,
                xp_reward,
                wager_amount,
                winner_id,
                finalized_at,
                ends_at,
                creator:creator_id(display_name, avatar_url)
              )
            `)
            .eq('user_id', userId)
            .eq('challenge.challenge_type', 'head_to_head')
            .eq('challenge.status', 'completed')
            .order('completed_at', { ascending: false })
            .limit(20);

          if (error) return { data: [], error: error.message };

          // Enhance with opponent data
          const enhanced = await Promise.all(data.map(async (p) => {
            // Get opponent
            const { data: opponentData } = await supabase
              .from('challenge_participants')
              .select('*, user:user_profiles(display_name, avatar_url)')
              .eq('challenge_id', p.challenge.id)
              .neq('user_id', userId)
              .single();

            return {
              ...p,
              opponent: opponentData?.user,
              opponentScore: opponentData?.current_value || 0,
              isWinner: p.challenge.winner_id === userId,
              isTie: p.challenge.winner_id === null,
            };
          }));

          return { data: enhanced, error: null };
        } catch (error) {
          console.error('Error fetching completed H2H:', error);
          return { data: [], error: error.message };
        }
      },

      // Get wager statistics for the current user
      getWagerStats: async () => {
        const userId = await getCurrentUserId();
        if (!userId) return null;

        try {
          // Get all wager transactions
          const { data: transactions } = await supabase
            .from('currency_transactions')
            .select('*')
            .eq('user_id', userId)
            .in('transaction_type', ['wager', 'wager_win', 'wager_refund'])
            .order('created_at', { ascending: false });

          if (!transactions) return null;

          const stats = {
            totalWagered: 0,
            totalWon: 0,
            totalLost: 0,
            netProfit: 0,
            challengesWon: 0,
            challengesLost: 0,
            recentTransactions: transactions.slice(0, 10),
          };

          transactions.forEach(t => {
            if (t.transaction_type === 'wager') {
              stats.totalWagered += Math.abs(t.amount);
              stats.totalLost += Math.abs(t.amount); // Deducted on wager
            } else if (t.transaction_type === 'wager_win') {
              stats.totalWon += t.amount;
              stats.challengesWon++;
              stats.totalLost -= t.amount / 2; // Recover our original wager
            } else if (t.transaction_type === 'wager_refund') {
              stats.totalLost -= t.amount; // Refund reduces loss
            }
          });

          // Count losses (wagers without corresponding wins)
          stats.challengesLost = Math.max(0,
            transactions.filter(t => t.transaction_type === 'wager').length -
            transactions.filter(t => t.transaction_type === 'wager_win').length -
            transactions.filter(t => t.transaction_type === 'wager_refund').length
          );

          stats.netProfit = stats.totalWon - stats.totalWagered;

          return stats;
        } catch (error) {
          console.error('Error fetching wager stats:', error);
          return null;
        }
      },

      // ============================================
      // PRESENCE ACTIONS
      // ============================================

      // Update user's online presence
      // Respects showActivityStatus privacy setting
      updatePresence: async (passedUserId = null) => {
        const userId = passedUserId || get().currentUserId || await getCurrentUserId();
        if (!userId) return;

        try {
          // Check user's privacy setting - if they've disabled activity status, don't update presence
          const { socialProfile } = get();
          const showActivityStatus = socialProfile?.preferences?.privacy?.showActivityStatus ?? true;

          if (!showActivityStatus) {
            // User has disabled activity status - remove them from online users
            await redis.setUserOffline(userId);
            return;
          }

          await redis.setUserOnline(userId);
        } catch (error) {
          console.error('Error updating presence:', error);
        }
      },

      // Fetch which friends are currently online
      // Only shows friends who have showActivityStatus enabled
      fetchOnlineFriends: async () => {
        const { friends } = get();
        if (friends.length === 0) return;

        try {
          const onlineUsers = await redis.getOnlineUsers();
          // Handle null return from Redis (connection failed)
          if (!onlineUsers) {
            set({ onlineFriends: [] });
            return;
          }
          const onlineSet = new Set(onlineUsers);

          // Filter friends who are online AND have showActivityStatus enabled
          const onlineFriends = friends
            .filter(f => {
              if (!onlineSet.has(f.user_id)) return false;

              // Check friend's privacy setting - only show if they allow activity status
              const friendShowActivityStatus = f.preferences?.privacy?.showActivityStatus ?? true;
              return friendShowActivityStatus;
            })
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

      initializeSocial: async (passedUserId = null) => {
        // Prevent concurrent initializations - if already initialized with data, skip
        const state = get();
        if (state.socialProfile && state.currentUserId) {
          console.log('[SocialStore] Already initialized, skipping');
          return;
        }

        console.log('[SocialStore] Initializing...');
        set({ loading: true });

        // Use passed userId if available, otherwise check stored, then fetch
        const userId = passedUserId || state.currentUserId || await getCurrentUserId();
        console.log('[SocialStore] Got userId:', userId);
        if (!userId) {
          console.log('[SocialStore] No user ID, skipping initialization');
          set({ loading: false });
          return;
        }

        // Store userId so sub-functions can use it without calling auth
        set({ currentUserId: userId });

        // Master timeout - ensure loading is set to false even if queries hang
        const INIT_TIMEOUT_MS = 15000;
        let timedOut = false;
        const timeoutId = setTimeout(() => {
          timedOut = true;
          set({ loading: false });
        }, INIT_TIMEOUT_MS);

        try {
          // Helper to wrap each fetch with its own timeout (silently handle errors)
          const withTimeout = (promise, name, timeoutMs = 10000) => {
            return Promise.race([
              promise,
              new Promise((_, reject) =>
                setTimeout(() => reject(new Error(`${name} timeout`)), timeoutMs)
              )
            ]).catch(() => {}); // Silent - only log final success/fail
          };

          // Run fetches with individual timeouts
          await Promise.allSettled([
            withTimeout(get().fetchSocialProfile(userId), 'fetchSocialProfile'),
            withTimeout(get().fetchFriends(userId), 'fetchFriends'),
            withTimeout(get().fetchPendingRequests(userId), 'fetchPendingRequests'),
            withTimeout(get().fetchBlockedUsers(userId), 'fetchBlockedUsers'),
            withTimeout(get().fetchMyGuild(userId), 'fetchMyGuild'),
            withTimeout(get().fetchMyGuildInvites(userId), 'fetchMyGuildInvites'),
            withTimeout(get().fetchLeaderboards(userId), 'fetchLeaderboards'),
            withTimeout(get().fetchChallenges(userId), 'fetchChallenges'),
            withTimeout(get().fetchHeadToHeadInvites(userId), 'fetchHeadToHeadInvites'),
          ]);

          // Start presence updates (non-blocking)
          get().updatePresence(userId).catch(() => {});

          // Initialize real-time subscriptions
          if (userId && !get().realtimeInitialized) {
            try {
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
            } catch (e) {
              console.warn('[SocialStore] Realtime init failed:', e.message);
            }
          }

          console.log('[SocialStore] ✅ Initialized');
        } catch (error) {
          console.error('[SocialStore] Initialization error:', error);
        } finally {
          clearTimeout(timeoutId);
          // Always set loading to false (unless timeout already did it)
          if (!timedOut) {
            set({ loading: false });
          }
        }
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
      partialize: () => ({
        // Don't persist socialProfile - always fetch fresh from database
        // This prevents stale data issues between user sessions
      }),
    }
  )
);

// Initialize function for app startup - accepts userId to avoid race conditions
export const initializeSocialStore = async (userId = null) => {
  const store = useSocialStore.getState();
  await store.initializeSocial(userId);
};

export default useSocialStore;
