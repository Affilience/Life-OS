/**
 * RealtimeProvider - Global real-time sync manager
 *
 * Wrap your app with this to enable automatic syncing:
 * - When you make changes on one device, other devices update instantly
 * - When someone else modifies your data, you see it immediately
 * - No need to refresh the page to see updates
 */

import { useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { DEV_USER_ID } from '../lib/dev-auth';
import { useToast } from '../components/ui/Toast';
import { initSyncNotifications } from '../utils/syncNotifications';

// Debug logging - only in development
const debug = import.meta.env.DEV ? console.log.bind(console) : () => {};

// Import stores for updating (mixed export styles)
import useSkillsStore from '../stores/skillsStore';  // default export
import useProductivityStore from '../stores/productivityStore';  // default export
import { useWorkoutStore } from '../stores/workoutStore';  // named export
import { useFinancialStore } from '../stores/financialStore';  // named export
import { useCalendarStore } from '../stores/calendarStore';  // named export
import { useKnowledgeStore } from '../stores/knowledgeStore';  // named export
import { useHealthStore } from '../stores/healthStore';  // named export
import { useAvatarStore } from '../stores/avatarStore';  // named export
import useAchievementsStore from '../stores/achievementsStore';  // default export
import { useGamificationStore } from '../stores/gamificationStore';  // named export
import { useResolutionStore } from '../stores/resolutionStore';  // named export
import { useContentStore } from '../stores/contentStore';  // named export
import { usePurposeStore } from '../stores/purposeStore';  // named export
import { useQuotesStore } from '../stores/quotesStore';  // named export
import useDailyTasksStore from '../stores/dailyTasksStore';  // default export

export function RealtimeProvider({ children, showNotifications = false }) {
  const channelsRef = useRef([]);
  const isSetupRef = useRef(false);
  const { toast } = useToast();

  // Initialize sync notifications with toast
  useEffect(() => {
    initSyncNotifications(toast);
  }, [toast]);

  // Get store refresh functions
  const refreshSkills = useSkillsStore(state => state.initializeFromSupabase);
  const refreshTasks = useProductivityStore(state => state.initializeFromSupabase);
  const refreshWorkouts = useWorkoutStore(state => state.initializeFromSupabase);
  const refreshFinancial = useFinancialStore(state => state.initializeFromSupabase);
  const refreshCalendar = useCalendarStore(state => state.initializeFromSupabase);
  const refreshKnowledge = useKnowledgeStore(state => state.initializeFromSupabase);
  const refreshHealth = useHealthStore(state => state.initializeFromSupabase);
  const refreshAvatar = useAvatarStore(state => state.initializeFromSupabase);
  const refreshAchievements = useAchievementsStore(state => state.initializeFromSupabase);
  const refreshGamification = useGamificationStore(state => state.initializeFromSupabase);
  const refreshResolutions = useResolutionStore(state => state.initializeFromSupabase);
  const refreshContent = useContentStore(state => state.initializeFromSupabase);
  const refreshPurpose = usePurposeStore(state => state.initializeFromSupabase);
  const refreshQuotes = useQuotesStore(state => state.initializeFromSupabase);
  const refreshDailyTasks = useDailyTasksStore(state => state.initializeFromSupabase);

  // Helper to show realtime notification (only if enabled)
  const notifyRealtime = (module, eventType) => {
    if (!showNotifications) return;

    const actions = {
      INSERT: 'added',
      UPDATE: 'updated',
      DELETE: 'removed',
    };
    const action = actions[eventType] || 'synced';

    toast.info(`${module} ${action}`, { duration: 2000 });
  };

  useEffect(() => {
    // Prevent double setup in React StrictMode
    if (isSetupRef.current) return;
    isSetupRef.current = true;

    debug('[Realtime] Setting up global subscriptions...');

    const channels = [];

    // ============================================
    // SKILLS - Practice logs and skill updates
    // ============================================
    const skillsChannel = supabase
      .channel('global_skills')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'skills',
        filter: `user_id=eq.${DEV_USER_ID}`,
      }, (payload) => {
        debug('[Realtime] Skills changed:', payload.eventType);
        refreshSkills?.();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'skill_practice_logs',
        filter: `user_id=eq.${DEV_USER_ID}`,
      }, (payload) => {
        debug('[Realtime] Practice logged:', payload.eventType);
        refreshSkills?.();
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') debug('[Realtime] Skills channel active');
      });
    channels.push(skillsChannel);

    // ============================================
    // PRODUCTIVITY - Tasks and projects
    // ============================================
    const productivityChannel = supabase
      .channel('global_productivity')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'productivity_tasks',
        filter: `user_id=eq.${DEV_USER_ID}`,
      }, (payload) => {
        debug('[Realtime] Task changed:', payload.eventType);
        refreshTasks?.();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'productivity_projects',
        filter: `user_id=eq.${DEV_USER_ID}`,
      }, (payload) => {
        debug('[Realtime] Project changed:', payload.eventType);
        refreshTasks?.();
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') debug('[Realtime] Productivity channel active');
      });
    channels.push(productivityChannel);

    // ============================================
    // WORKOUTS - Strength and cardio
    // ============================================
    const workoutsChannel = supabase
      .channel('global_workouts')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'health_workouts',
        filter: `user_id=eq.${DEV_USER_ID}`,
      }, (payload) => {
        debug('[Realtime] Workout changed:', payload.eventType);
        refreshWorkouts?.();
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') debug('[Realtime] Workouts channel active');
      });
    channels.push(workoutsChannel);

    // ============================================
    // FINANCIAL - Transactions and goals
    // ============================================
    const financialChannel = supabase
      .channel('global_financial')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'financial_transactions',
        filter: `user_id=eq.${DEV_USER_ID}`,
      }, (payload) => {
        debug('[Realtime] Transaction changed:', payload.eventType);
        refreshFinancial?.();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'financial_goals',
        filter: `user_id=eq.${DEV_USER_ID}`,
      }, (payload) => {
        debug('[Realtime] Goal changed:', payload.eventType);
        refreshFinancial?.();
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') debug('[Realtime] Financial channel active');
      });
    channels.push(financialChannel);

    // ============================================
    // CALENDAR - Time blocks and events
    // ============================================
    const calendarChannel = supabase
      .channel('global_calendar')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'calendar_time_blocks',
        filter: `user_id=eq.${DEV_USER_ID}`,
      }, (payload) => {
        debug('[Realtime] Time block changed:', payload.eventType);
        refreshCalendar?.();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'calendar_events',
        filter: `user_id=eq.${DEV_USER_ID}`,
      }, (payload) => {
        debug('[Realtime] Event changed:', payload.eventType);
        refreshCalendar?.();
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') debug('[Realtime] Calendar channel active');
      });
    channels.push(calendarChannel);

    // ============================================
    // KNOWLEDGE - Notes and media
    // ============================================
    const knowledgeChannel = supabase
      .channel('global_knowledge')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'knowledge_notes',
        filter: `user_id=eq.${DEV_USER_ID}`,
      }, (payload) => {
        debug('[Realtime] Note changed:', payload.eventType);
        refreshKnowledge?.();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'knowledge_media',
        filter: `user_id=eq.${DEV_USER_ID}`,
      }, (payload) => {
        debug('[Realtime] Media changed:', payload.eventType);
        refreshKnowledge?.();
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') debug('[Realtime] Knowledge channel active');
      });
    channels.push(knowledgeChannel);

    // ============================================
    // HEALTH - Nutrition, water, recipes, and supplements
    // ============================================
    const healthChannel = supabase
      .channel('global_health')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'health_nutrition_logs',
        filter: `user_id=eq.${DEV_USER_ID}`,
      }, (payload) => {
        debug('[Realtime] Nutrition changed:', payload.eventType);
        refreshHealth?.();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'health_water_logs',
        filter: `user_id=eq.${DEV_USER_ID}`,
      }, (payload) => {
        debug('[Realtime] Water changed:', payload.eventType);
        refreshHealth?.();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'health_recipes',
        filter: `user_id=eq.${DEV_USER_ID}`,
      }, (payload) => {
        debug('[Realtime] Recipe changed:', payload.eventType);
        refreshHealth?.();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'health_supplements',
        filter: `user_id=eq.${DEV_USER_ID}`,
      }, (payload) => {
        debug('[Realtime] Supplement changed:', payload.eventType);
        refreshHealth?.();
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') debug('[Realtime] Health channel active');
      });
    channels.push(healthChannel);

    // ============================================
    // GAMIFICATION - Level ups, achievements, and credits
    // ============================================
    const gamificationChannel = supabase
      .channel('global_gamification')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'user_profiles',
        filter: `id=eq.${DEV_USER_ID}`,
      }, (payload) => {
        debug('[Realtime] Profile updated (possible level up):', payload.new);
        refreshAvatar?.();

        // Check for level up
        if (payload.old && payload.new && payload.new.level > payload.old.level) {
          toast.success(`Level Up! You're now level ${payload.new.level}`, {
            title: '🎉 Level Up!',
            duration: 5000,
          });
        }
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'user_discoveries',
        filter: `user_id=eq.${DEV_USER_ID}`,
      }, (payload) => {
        debug('[Realtime] Achievement unlocked!', payload.new);
        refreshAchievements?.();

        // Show achievement notification
        const achievement = payload.new;
        toast.success(achievement.description || 'New achievement unlocked!', {
          title: `🏆 ${achievement.name || 'Achievement Unlocked'}`,
          duration: 5000,
        });
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'user_cosmic_currency',
        filter: `user_id=eq.${DEV_USER_ID}`,
      }, (payload) => {
        debug('[Realtime] Cosmic credits changed:', payload.eventType);
        refreshGamification?.();
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') debug('[Realtime] Gamification channel active');
      });
    channels.push(gamificationChannel);

    // ============================================
    // RESOLUTIONS - New Year's resolutions and check-ins
    // ============================================
    const resolutionsChannel = supabase
      .channel('global_resolutions')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'user_resolutions',
        filter: `user_id=eq.${DEV_USER_ID}`,
      }, (payload) => {
        debug('[Realtime] Resolution changed:', payload.eventType);
        refreshResolutions?.();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'user_resolution_check_ins',
        filter: `user_id=eq.${DEV_USER_ID}`,
      }, (payload) => {
        debug('[Realtime] Resolution check-in:', payload.eventType);
        refreshResolutions?.();
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') debug('[Realtime] Resolutions channel active');
      });
    channels.push(resolutionsChannel);

    // ============================================
    // CONTENT - Books, podcasts, videos, articles, courses
    // ============================================
    const contentChannel = supabase
      .channel('global_content')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'content_items',
        filter: `user_id=eq.${DEV_USER_ID}`,
      }, (payload) => {
        debug('[Realtime] Content changed:', payload.eventType);
        refreshContent?.();
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') debug('[Realtime] Content channel active');
      });
    channels.push(contentChannel);

    // ============================================
    // PURPOSE - Values, decisions, identity check-ins
    // ============================================
    const purposeChannel = supabase
      .channel('global_purpose')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'user_purpose',
        filter: `user_id=eq.${DEV_USER_ID}`,
      }, (payload) => {
        debug('[Realtime] Purpose changed:', payload.eventType);
        refreshPurpose?.();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'user_values',
        filter: `user_id=eq.${DEV_USER_ID}`,
      }, (payload) => {
        debug('[Realtime] Values changed:', payload.eventType);
        refreshPurpose?.();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'user_decisions',
        filter: `user_id=eq.${DEV_USER_ID}`,
      }, (payload) => {
        debug('[Realtime] Decisions changed:', payload.eventType);
        refreshPurpose?.();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'user_identity_checkins',
        filter: `user_id=eq.${DEV_USER_ID}`,
      }, (payload) => {
        debug('[Realtime] Identity check-in changed:', payload.eventType);
        refreshPurpose?.();
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') debug('[Realtime] Purpose channel active');
      });
    channels.push(purposeChannel);

    // ============================================
    // QUOTES - Custom quotes
    // ============================================
    const quotesChannel = supabase
      .channel('global_quotes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'user_quotes',
        filter: `user_id=eq.${DEV_USER_ID}`,
      }, (payload) => {
        debug('[Realtime] Quote changed:', payload.eventType);
        refreshQuotes?.();
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') debug('[Realtime] Quotes channel active');
      });
    channels.push(quotesChannel);

    // ============================================
    // DAILY TASKS - Daily planning tasks and templates
    // ============================================
    const dailyTasksChannel = supabase
      .channel('global_daily_tasks')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'daily_tasks',
        filter: `user_id=eq.${DEV_USER_ID}`,
      }, (payload) => {
        debug('[Realtime] Daily task changed:', payload.eventType);
        refreshDailyTasks?.();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'daily_task_templates',
        filter: `user_id=eq.${DEV_USER_ID}`,
      }, (payload) => {
        debug('[Realtime] Task template changed:', payload.eventType);
        refreshDailyTasks?.();
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') debug('[Realtime] Daily tasks channel active');
      });
    channels.push(dailyTasksChannel);

    channelsRef.current = channels;

    console.log(`[Realtime] ${channels.length} channels subscribed`);

    // Cleanup on unmount
    return () => {
      debug('[Realtime] Cleaning up subscriptions...');
      channelsRef.current.forEach(channel => {
        supabase.removeChannel(channel);
      });
      channelsRef.current = [];
      isSetupRef.current = false;
    };
  }, [
    refreshSkills,
    refreshTasks,
    refreshWorkouts,
    refreshFinancial,
    refreshCalendar,
    refreshKnowledge,
    refreshHealth,
    refreshAvatar,
    refreshAchievements,
    refreshGamification,
    refreshResolutions,
    refreshContent,
    refreshPurpose,
    refreshQuotes,
    refreshDailyTasks,
    toast,
    showNotifications,
  ]);

  return children;
}

export default RealtimeProvider;
