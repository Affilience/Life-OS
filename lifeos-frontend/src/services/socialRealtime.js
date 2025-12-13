/**
 * Social Real-time Service
 * Handles Supabase real-time subscriptions for social features
 */

import { supabase } from '../lib/supabase';
import { useSocialStore } from '../stores/socialStore';

// Store active subscriptions
const subscriptions = {
  presence: null,
  friendRequests: null,
  activityFeed: null,
  guildActivity: null,
  challenges: null,
};

/**
 * Initialize presence channel for online status
 * @param {string} userId - Current user's ID
 * @returns {Object} Presence channel
 */
export function initializePresence(userId) {
  if (subscriptions.presence) {
    subscriptions.presence.unsubscribe();
  }

  const channel = supabase.channel('online-users', {
    config: {
      presence: {
        key: userId,
      },
    },
  });

  channel
    .on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();
      const onlineUserIds = Object.keys(state);

      // Update store with online users
      useSocialStore.getState().setOnlineFriends(onlineUserIds);
    })
    .on('presence', { event: 'join' }, ({ key, newPresences }) => {
      console.log('User joined:', key);
      // Could trigger notification if it's a friend
    })
    .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
      console.log('User left:', key);
    })
    .subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({
          user_id: userId,
          online_at: new Date().toISOString(),
          status: 'online',
        });
      }
    });

  subscriptions.presence = channel;
  return channel;
}

/**
 * Subscribe to friend requests
 * @param {string} userId - Current user's ID
 * @param {Function} onNewRequest - Callback for new requests
 * @returns {Object} Subscription channel
 */
export function subscribeToFriendRequests(userId, onNewRequest) {
  if (subscriptions.friendRequests) {
    subscriptions.friendRequests.unsubscribe();
  }

  const channel = supabase
    .channel('friend-requests')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'friendships',
        filter: `addressee_id=eq.${userId}`,
      },
      async (payload) => {
        console.log('New friend request:', payload.new);

        // Fetch the requester's profile
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('user_id, display_name, avatar_url, current_level')
          .eq('user_id', payload.new.requester_id)
          .single();

        const request = {
          ...payload.new,
          requester: profile,
        };

        if (onNewRequest) {
          onNewRequest(request);
        }

        // Update store
        useSocialStore.getState().addPendingRequest(request);
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'friendships',
        filter: `requester_id=eq.${userId}`,
      },
      (payload) => {
        // Friend request was accepted/declined
        if (payload.new.status === 'accepted') {
          useSocialStore.getState().fetchFriends();
        }
      }
    )
    .subscribe();

  subscriptions.friendRequests = channel;
  return channel;
}

/**
 * Subscribe to activity feed updates
 * @param {string} userId - Current user's ID
 * @param {string[]} friendIds - Array of friend user IDs
 * @param {Function} onNewActivity - Callback for new activities
 * @returns {Object} Subscription channel
 */
export function subscribeToActivityFeed(userId, friendIds, onNewActivity) {
  if (subscriptions.activityFeed) {
    subscriptions.activityFeed.unsubscribe();
  }

  // Include own userId and friends
  const watchIds = [userId, ...friendIds];

  const channel = supabase
    .channel('activity-feed')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'activity_feed',
      },
      async (payload) => {
        // Check if this activity is from someone we should see
        if (!watchIds.includes(payload.new.user_id)) {
          return;
        }

        // Fetch the user's profile for the activity
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('user_id, display_name, avatar_url, current_level')
          .eq('user_id', payload.new.user_id)
          .single();

        const activity = {
          ...payload.new,
          user: profile,
        };

        if (onNewActivity) {
          onNewActivity(activity);
        }

        // Prepend to feed in store
        useSocialStore.getState().prependToFeed(activity);
      }
    )
    .subscribe();

  subscriptions.activityFeed = channel;
  return channel;
}

/**
 * Subscribe to guild activity
 * @param {string} guildId - Guild ID to watch
 * @param {Function} onActivity - Callback for guild activity
 * @returns {Object} Subscription channel
 */
export function subscribeToGuildActivity(guildId, onActivity) {
  if (subscriptions.guildActivity) {
    subscriptions.guildActivity.unsubscribe();
  }

  const channel = supabase
    .channel(`guild-${guildId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'guild_members',
        filter: `guild_id=eq.${guildId}`,
      },
      async (payload) => {
        const eventType = payload.eventType;

        // Fetch member profile
        const memberId = payload.new?.user_id || payload.old?.user_id;
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('user_id, display_name, avatar_url')
          .eq('user_id', memberId)
          .single();

        const activity = {
          type: eventType,
          member: profile,
          data: payload.new || payload.old,
          timestamp: new Date().toISOString(),
        };

        if (onActivity) {
          onActivity(activity);
        }

        // Refresh guild members in store
        useSocialStore.getState().fetchGuildMembers(guildId);
      }
    )
    .subscribe();

  subscriptions.guildActivity = channel;
  return channel;
}

/**
 * Subscribe to challenge updates
 * @param {string} userId - Current user's ID
 * @param {Function} onUpdate - Callback for challenge updates
 * @returns {Object} Subscription channel
 */
export function subscribeToChallenges(userId, onUpdate) {
  if (subscriptions.challenges) {
    subscriptions.challenges.unsubscribe();
  }

  const channel = supabase
    .channel('challenges')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'challenge_participants',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        console.log('Challenge update:', payload);

        if (onUpdate) {
          onUpdate(payload);
        }

        // Refresh challenges in store
        useSocialStore.getState().fetchChallenges();
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'challenges',
      },
      (payload) => {
        // Challenge status changed (completed, etc.)
        if (onUpdate) {
          onUpdate({ type: 'challenge_update', data: payload.new });
        }
      }
    )
    .subscribe();

  subscriptions.challenges = channel;
  return channel;
}

/**
 * Subscribe to likes and comments on your activities
 * @param {string} userId - Current user's ID
 * @param {Function} onEngagement - Callback for engagement
 * @returns {Object} Subscription channel
 */
export function subscribeToEngagement(userId, onEngagement) {
  const channel = supabase
    .channel('engagement')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'activity_likes',
      },
      async (payload) => {
        // Check if the liked activity belongs to current user
        const { data: activity } = await supabase
          .from('activity_feed')
          .select('user_id')
          .eq('id', payload.new.activity_id)
          .single();

        if (activity?.user_id === userId) {
          // Fetch who liked
          const { data: liker } = await supabase
            .from('user_profiles')
            .select('display_name, avatar_url')
            .eq('user_id', payload.new.user_id)
            .single();

          if (onEngagement) {
            onEngagement({
              type: 'like',
              activity_id: payload.new.activity_id,
              user: liker,
            });
          }
        }
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'activity_comments',
      },
      async (payload) => {
        // Check if the commented activity belongs to current user
        const { data: activity } = await supabase
          .from('activity_feed')
          .select('user_id')
          .eq('id', payload.new.activity_id)
          .single();

        if (activity?.user_id === userId) {
          // Fetch who commented
          const { data: commenter } = await supabase
            .from('user_profiles')
            .select('display_name, avatar_url')
            .eq('user_id', payload.new.user_id)
            .single();

          if (onEngagement) {
            onEngagement({
              type: 'comment',
              activity_id: payload.new.activity_id,
              user: commenter,
              content: payload.new.content,
            });
          }
        }
      }
    )
    .subscribe();

  return channel;
}

/**
 * Initialize all social real-time subscriptions
 * @param {string} userId - Current user's ID
 * @param {Object} callbacks - Callback functions
 */
export function initializeSocialRealtime(userId, callbacks = {}) {
  const {
    onFriendRequest,
    onNewActivity,
    onGuildActivity,
    onChallengeUpdate,
    onEngagement,
  } = callbacks;

  // Initialize presence
  initializePresence(userId);

  // Subscribe to friend requests
  subscribeToFriendRequests(userId, onFriendRequest);

  // Get friends and subscribe to activity feed
  const store = useSocialStore.getState();
  const friendIds = store.friends.map(f => f.user_id);
  subscribeToActivityFeed(userId, friendIds, onNewActivity);

  // Subscribe to guild if member of one
  if (store.currentGuild) {
    subscribeToGuildActivity(store.currentGuild.id, onGuildActivity);
  }

  // Subscribe to challenges
  subscribeToChallenges(userId, onChallengeUpdate);

  // Subscribe to engagement
  subscribeToEngagement(userId, onEngagement);
}

/**
 * Clean up all subscriptions
 */
export function cleanupSocialRealtime() {
  Object.values(subscriptions).forEach(sub => {
    if (sub) {
      sub.unsubscribe();
    }
  });

  // Reset all to null
  Object.keys(subscriptions).forEach(key => {
    subscriptions[key] = null;
  });
}

/**
 * Update presence status
 * @param {string} status - 'online', 'away', 'busy'
 */
export async function updatePresenceStatus(status) {
  if (subscriptions.presence) {
    await subscriptions.presence.track({
      status,
      updated_at: new Date().toISOString(),
    });
  }
}

export default {
  initializePresence,
  subscribeToFriendRequests,
  subscribeToActivityFeed,
  subscribeToGuildActivity,
  subscribeToChallenges,
  subscribeToEngagement,
  initializeSocialRealtime,
  cleanupSocialRealtime,
  updatePresenceStatus,
};
