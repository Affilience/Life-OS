/**
 * Real-time Subscription Hook
 *
 * Enables live syncing between Supabase and the frontend.
 * When data changes in the database (from another device/tab),
 * the frontend automatically updates without refreshing.
 */

import { useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { DEV_USER_ID } from '../lib/dev-auth';

/**
 * Subscribe to real-time changes on a Supabase table
 *
 * @param {string} table - The table name to subscribe to
 * @param {Object} options - Configuration options
 * @param {Function} options.onInsert - Callback when a row is inserted
 * @param {Function} options.onUpdate - Callback when a row is updated
 * @param {Function} options.onDelete - Callback when a row is deleted
 * @param {string} options.filter - Optional filter column (defaults to 'user_id')
 * @param {string} options.filterValue - Optional filter value (defaults to DEV_USER_ID)
 * @param {boolean} options.enabled - Whether subscription is active (default: true)
 */
export function useRealtimeSubscription(table, options = {}) {
  const {
    onInsert,
    onUpdate,
    onDelete,
    filter = 'user_id',
    filterValue = DEV_USER_ID,
    enabled = true,
  } = options;

  const channelRef = useRef(null);

  useEffect(() => {
    if (!enabled || !filterValue) return;

    // Create unique channel name
    const channelName = `${table}_${filterValue}_${Date.now()}`;

    // Build the channel with postgres_changes
    const channel = supabase.channel(channelName);

    // Subscribe to INSERT events
    if (onInsert) {
      channel.on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table,
          filter: `${filter}=eq.${filterValue}`,
        },
        (payload) => {
          console.log(`[Realtime] INSERT on ${table}:`, payload.new);
          onInsert(payload.new);
        }
      );
    }

    // Subscribe to UPDATE events
    if (onUpdate) {
      channel.on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table,
          filter: `${filter}=eq.${filterValue}`,
        },
        (payload) => {
          console.log(`[Realtime] UPDATE on ${table}:`, payload.new);
          onUpdate(payload.new, payload.old);
        }
      );
    }

    // Subscribe to DELETE events
    if (onDelete) {
      channel.on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table,
          filter: `${filter}=eq.${filterValue}`,
        },
        (payload) => {
          console.log(`[Realtime] DELETE on ${table}:`, payload.old);
          onDelete(payload.old);
        }
      );
    }

    // Subscribe to the channel
    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log(`[Realtime] Subscribed to ${table}`);
      } else if (status === 'CHANNEL_ERROR') {
        console.error(`[Realtime] Error subscribing to ${table}`);
      }
    });

    channelRef.current = channel;

    // Cleanup on unmount
    return () => {
      if (channelRef.current) {
        console.log(`[Realtime] Unsubscribing from ${table}`);
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [table, filter, filterValue, enabled, onInsert, onUpdate, onDelete]);

  return channelRef.current;
}

/**
 * Subscribe to multiple tables at once
 *
 * @param {Array} subscriptions - Array of { table, onInsert, onUpdate, onDelete }
 */
export function useMultipleRealtimeSubscriptions(subscriptions, enabled = true) {
  const channelsRef = useRef([]);

  useEffect(() => {
    if (!enabled) return;

    const channels = subscriptions.map(({ table, onInsert, onUpdate, onDelete, filter = 'user_id' }) => {
      const channelName = `${table}_${DEV_USER_ID}_${Date.now()}`;
      const channel = supabase.channel(channelName);

      if (onInsert) {
        channel.on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table,
          filter: `${filter}=eq.${DEV_USER_ID}`,
        }, (payload) => onInsert(payload.new));
      }

      if (onUpdate) {
        channel.on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table,
          filter: `${filter}=eq.${DEV_USER_ID}`,
        }, (payload) => onUpdate(payload.new, payload.old));
      }

      if (onDelete) {
        channel.on('postgres_changes', {
          event: 'DELETE',
          schema: 'public',
          table,
          filter: `${filter}=eq.${DEV_USER_ID}`,
        }, (payload) => onDelete(payload.old));
      }

      channel.subscribe();
      return channel;
    });

    channelsRef.current = channels;

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
      channelsRef.current = [];
    };
  }, [subscriptions, enabled]);

  return channelsRef.current;
}

/**
 * Global realtime manager - subscribes to all important tables
 * Call this once at app level for automatic syncing
 */
export function setupGlobalRealtimeSubscriptions(storeCallbacks) {
  const {
    onSkillChange,
    onTaskChange,
    onWorkoutChange,
    onTransactionChange,
    onTimeBlockChange,
    onNoteChange,
    onJournalChange,
    onAchievementUnlock,
    onLevelUp,
  } = storeCallbacks;

  const channels = [];

  // Skills realtime
  if (onSkillChange) {
    const skillChannel = supabase
      .channel('skills_realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'skills',
        filter: `user_id=eq.${DEV_USER_ID}`,
      }, onSkillChange)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'skill_practice_logs',
        filter: `user_id=eq.${DEV_USER_ID}`,
      }, onSkillChange)
      .subscribe();
    channels.push(skillChannel);
  }

  // Tasks realtime
  if (onTaskChange) {
    const taskChannel = supabase
      .channel('tasks_realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'productivity_tasks',
        filter: `user_id=eq.${DEV_USER_ID}`,
      }, onTaskChange)
      .subscribe();
    channels.push(taskChannel);
  }

  // Workouts realtime
  if (onWorkoutChange) {
    const workoutChannel = supabase
      .channel('workouts_realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'health_workouts',
        filter: `user_id=eq.${DEV_USER_ID}`,
      }, onWorkoutChange)
      .subscribe();
    channels.push(workoutChannel);
  }

  // Financial realtime
  if (onTransactionChange) {
    const financeChannel = supabase
      .channel('finance_realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'financial_transactions',
        filter: `user_id=eq.${DEV_USER_ID}`,
      }, onTransactionChange)
      .subscribe();
    channels.push(financeChannel);
  }

  // Calendar realtime
  if (onTimeBlockChange) {
    const calendarChannel = supabase
      .channel('calendar_realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'calendar_time_blocks',
        filter: `user_id=eq.${DEV_USER_ID}`,
      }, onTimeBlockChange)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'calendar_events',
        filter: `user_id=eq.${DEV_USER_ID}`,
      }, onTimeBlockChange)
      .subscribe();
    channels.push(calendarChannel);
  }

  // Knowledge realtime
  if (onNoteChange) {
    const knowledgeChannel = supabase
      .channel('knowledge_realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'knowledge_notes',
        filter: `user_id=eq.${DEV_USER_ID}`,
      }, onNoteChange)
      .subscribe();
    channels.push(knowledgeChannel);
  }

  // Journal realtime
  if (onJournalChange) {
    const journalChannel = supabase
      .channel('journal_realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'journal_entries',
        filter: `user_id=eq.${DEV_USER_ID}`,
      }, onJournalChange)
      .subscribe();
    channels.push(journalChannel);
  }

  // Gamification realtime (achievements, level ups)
  if (onAchievementUnlock || onLevelUp) {
    const gamificationChannel = supabase
      .channel('gamification_realtime')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'user_discoveries',
        filter: `user_id=eq.${DEV_USER_ID}`,
      }, onAchievementUnlock)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'user_profiles',
        filter: `id=eq.${DEV_USER_ID}`,
      }, onLevelUp)
      .subscribe();
    channels.push(gamificationChannel);
  }

  // Return cleanup function
  return () => {
    channels.forEach(channel => supabase.removeChannel(channel));
  };
}

export default useRealtimeSubscription;
