/**
 * RealtimeProvider - Global real-time sync manager
 *
 * Wrap your app with this to enable automatic syncing:
 * - When you make changes on one device, other devices update instantly
 * - When someone else modifies your data, you see it immediately
 * - No need to refresh the page to see updates
 */

import { useEffect, useRef, useState } from 'react';
import { supabase, getCachedUserId } from '../lib/supabase';
import { useToast } from '../components/ui/Toast';
import { initSyncNotifications } from '../utils/syncNotifications';

// Debug logging - only in development
const debug = import.meta.env.DEV ? console.log.bind(console) : () => {};

// Track WebSocket errors to avoid console spam
let wsErrorCount = 0;
let lastWsErrorLog = 0;

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
import { useSocialStore } from '../stores/socialStore';  // named export
import useBadHabitsStore from '../stores/badHabitsStore';  // default export
import useBossStore from '../stores/bossStore';  // default export
import useCustomStreaksStore from '../stores/customStreaksStore';  // default export
import { usePetStore } from '../stores/petStore';  // named export
import usePvpArenaStore from '../stores/pvpArenaStore';  // default export
import usePvpStore from '../stores/pvpStore';  // default export
import useQuestsStore from '../stores/questsStore';  // default export
import useSettingsStore from '../stores/settingsStore';  // default export
import useModuleMasteryStore from '../stores/moduleMasteryStore';  // default export
import usePerkStore from '../stores/perkStore';  // default export
import useNotificationStore from '../stores/notificationStore';  // default export
import useDashboardStore from '../stores/dashboardStore';  // default export

export function RealtimeProvider({ children, showNotifications = false }) {
  const channelsRef = useRef([]);
  const isSetupRef = useRef(false);
  const hasLoggedWaiting = useRef(false);
  const [userId, setUserId] = useState(null);
  const { toast } = useToast();

  // Initialize sync notifications with toast
  useEffect(() => {
    initSyncNotifications(toast);
  }, [toast]);

  // Get current user ID on mount - use cached value (instant, doesn't hang)
  useEffect(() => {
    // Try cached value first (instant)
    const cachedId = getCachedUserId();
    if (cachedId) {
      setUserId(cachedId);
    }

    // Also listen for auth changes to update user ID
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const id = session?.user?.id || null;
      setUserId(id);
    });

    return () => subscription.unsubscribe();
  }, []);

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

  // Social store refresh functions
  const refreshFriends = useSocialStore(state => state.fetchFriends);
  const refreshPendingRequests = useSocialStore(state => state.fetchPendingRequests);
  const refreshChallenges = useSocialStore(state => state.fetchChallenges);
  const refreshH2HInvites = useSocialStore(state => state.fetchHeadToHeadInvites);
  const refreshActivityFeed = useSocialStore(state => state.fetchActivityFeed);

  // Additional store refresh functions for full system real-time
  const refreshBadHabits = useBadHabitsStore(state => state.initializeFromSupabase);
  const refreshBoss = useBossStore(state => state.initializeFromSupabase);
  const refreshCustomStreaks = useCustomStreaksStore(state => state.initializeFromSupabase);
  const refreshPets = usePetStore(state => state.initializeFromSupabase);
  const refreshPvpArena = usePvpArenaStore(state => state.fetchMatchHistory);
  const refreshPvpArenaStats = usePvpArenaStore(state => state.fetchStats);
  const refreshPvp = usePvpStore(state => state.fetchActiveBattles);
  const refreshQuests = useQuestsStore(state => state.initializeFromSupabase);
  const refreshSettings = useSettingsStore(state => state.initializeFromSupabase);
  const refreshModuleMastery = useModuleMasteryStore(state => state.initializeFromSupabase);
  const refreshPerks = usePerkStore(state => state.initializeFromSupabase);
  const refreshNotifications = useNotificationStore(state => state.fetchNotifications);
  const refreshDashboard = useDashboardStore(state => state.initializeFromSupabase);

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
    // Don't set up subscriptions until we have a user ID
    if (!userId) {
      // Only log once to avoid console spam
      if (!hasLoggedWaiting.current) {
        debug('[Realtime] Waiting for user authentication...');
        hasLoggedWaiting.current = true;
      }
      return;
    }
    hasLoggedWaiting.current = false; // Reset for next auth cycle

    // Prevent double setup in React StrictMode
    if (isSetupRef.current) return;
    isSetupRef.current = true;

    debug('[Realtime] Setting up global subscriptions for user:', userId);

    const channels = [];

    // Helper to handle subscription status with error suppression
    const handleSubscriptionStatus = (channelName) => (status, err) => {
      if (status === 'SUBSCRIBED') {
        debug(`[Realtime] ${channelName} channel active`);
        wsErrorCount = 0; // Reset on success
      } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        wsErrorCount++;
        const now = Date.now();
        // Only log errors once per minute to avoid console spam
        if (now - lastWsErrorLog > 60000) {
          console.warn(`[Realtime] WebSocket connection issue (${wsErrorCount} errors). Real-time sync may be unavailable.`);
          lastWsErrorLog = now;
        }
      }
    };

    // ============================================
    // SKILLS - Practice logs and skill updates
    // ============================================
    const skillsChannel = supabase
      .channel('global_skills')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'skills',
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        debug('[Realtime] Skills changed:', payload.eventType);
        refreshSkills?.();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'skill_practice_logs',
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        debug('[Realtime] Practice logged:', payload.eventType);
        refreshSkills?.();
      })
      .subscribe(handleSubscriptionStatus('Skills'));
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
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        debug('[Realtime] Task changed:', payload.eventType);
        refreshTasks?.();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'productivity_projects',
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        debug('[Realtime] Project changed:', payload.eventType);
        refreshTasks?.();
      })
      .subscribe(handleSubscriptionStatus('Productivity'));
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
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        debug('[Realtime] Workout changed:', payload.eventType);
        refreshWorkouts?.();
      })
      .subscribe(handleSubscriptionStatus('Workouts'));
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
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        debug('[Realtime] Transaction changed:', payload.eventType);
        refreshFinancial?.();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'financial_goals',
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        debug('[Realtime] Goal changed:', payload.eventType);
        refreshFinancial?.();
      })
      .subscribe(handleSubscriptionStatus('Financial'));
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
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        debug('[Realtime] Time block changed:', payload.eventType);
        refreshCalendar?.();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'calendar_events',
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        debug('[Realtime] Event changed:', payload.eventType);
        refreshCalendar?.();
      })
      .subscribe(handleSubscriptionStatus('Calendar'));
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
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        debug('[Realtime] Note changed:', payload.eventType);
        refreshKnowledge?.();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'knowledge_media',
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        debug('[Realtime] Media changed:', payload.eventType);
        refreshKnowledge?.();
      })
      .subscribe(handleSubscriptionStatus('Knowledge'));
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
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        debug('[Realtime] Nutrition changed:', payload.eventType);
        refreshHealth?.();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'health_water_logs',
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        debug('[Realtime] Water changed:', payload.eventType);
        refreshHealth?.();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'health_recipes',
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        debug('[Realtime] Recipe changed:', payload.eventType);
        refreshHealth?.();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'health_supplements',
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        debug('[Realtime] Supplement changed:', payload.eventType);
        refreshHealth?.();
      })
      .subscribe(handleSubscriptionStatus('Health'));
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
        filter: `id=eq.${userId}`,
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
        filter: `user_id=eq.${userId}`,
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
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        debug('[Realtime] Cosmic credits changed:', payload.eventType);
        refreshGamification?.();
      })
      .subscribe(handleSubscriptionStatus('Gamification'));
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
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        debug('[Realtime] Resolution changed:', payload.eventType);
        refreshResolutions?.();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'user_resolution_check_ins',
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        debug('[Realtime] Resolution check-in:', payload.eventType);
        refreshResolutions?.();
      })
      .subscribe(handleSubscriptionStatus('Resolutions'));
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
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        debug('[Realtime] Content changed:', payload.eventType);
        refreshContent?.();
      })
      .subscribe(handleSubscriptionStatus('Content'));
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
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        debug('[Realtime] Purpose changed:', payload.eventType);
        refreshPurpose?.();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'user_values',
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        debug('[Realtime] Values changed:', payload.eventType);
        refreshPurpose?.();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'user_decisions',
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        debug('[Realtime] Decisions changed:', payload.eventType);
        refreshPurpose?.();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'user_identity_checkins',
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        debug('[Realtime] Identity check-in changed:', payload.eventType);
        refreshPurpose?.();
      })
      .subscribe(handleSubscriptionStatus('Purpose'));
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
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        debug('[Realtime] Quote changed:', payload.eventType);
        refreshQuotes?.();
      })
      .subscribe(handleSubscriptionStatus('Quotes'));
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
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        debug('[Realtime] Daily task changed:', payload.eventType);
        refreshDailyTasks?.();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'daily_task_templates',
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        debug('[Realtime] Task template changed:', payload.eventType);
        refreshDailyTasks?.();
      })
      .subscribe(handleSubscriptionStatus('Daily Tasks'));
    channels.push(dailyTasksChannel);

    // ============================================
    // SOCIAL - Friend requests, challenges, activity feed
    // ============================================
    const socialChannel = supabase
      .channel('global_social')
      // Friend requests - both as requester and addressee
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'friendships',
        filter: `requester_id=eq.${userId}`,
      }, (payload) => {
        debug('[Realtime] Friendship changed (requester):', payload.eventType);
        refreshFriends?.();
        refreshPendingRequests?.();
        if (payload.eventType === 'UPDATE' && payload.new?.status === 'accepted') {
          toast.success('Friend request accepted!', { duration: 3000 });
        }
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'friendships',
        filter: `addressee_id=eq.${userId}`,
      }, (payload) => {
        debug('[Realtime] Friendship changed (addressee):', payload.eventType);
        refreshFriends?.();
        refreshPendingRequests?.();
        if (payload.eventType === 'INSERT' && payload.new?.status === 'pending') {
          toast.info('New friend request!', {
            title: '👋 Friend Request',
            duration: 5000
          });
        }
      })
      // Challenges - both created by user and targeting user
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'challenges',
        filter: `creator_id=eq.${userId}`,
      }, (payload) => {
        debug('[Realtime] Challenge changed (creator):', payload.eventType);
        refreshChallenges?.();
        refreshH2HInvites?.();
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'challenges',
      }, (payload) => {
        // Check if this challenge is for us (H2H opponent)
        if (payload.new?.event_data?.opponent_id === userId) {
          debug('[Realtime] New H2H challenge received!');
          refreshH2HInvites?.();
          toast.info('New head-to-head challenge!', {
            title: '⚔️ Challenge Received',
            duration: 5000,
          });
        }
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'challenges',
      }, (payload) => {
        // Check if challenge status changed (accepted/completed)
        if (payload.new?.creator_id === userId || payload.new?.event_data?.opponent_id === userId) {
          debug('[Realtime] Challenge updated:', payload.eventType);
          refreshChallenges?.();
          refreshH2HInvites?.();
          if (payload.new?.status === 'active' && payload.old?.status === 'pending') {
            toast.success('Challenge accepted!', { duration: 3000 });
          }
        }
      })
      // Activity feed
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'user_activity_feed',
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        debug('[Realtime] New activity:', payload.eventType);
        refreshActivityFeed?.();
      })
      .subscribe(handleSubscriptionStatus('Social'));
    channels.push(socialChannel);

    // ============================================
    // BAD HABITS - Tracking and relapses
    // ============================================
    const badHabitsChannel = supabase
      .channel('global_bad_habits')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'bad_habits',
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        debug('[Realtime] Bad habit changed:', payload.eventType);
        refreshBadHabits?.();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'bad_habit_relapses',
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        debug('[Realtime] Bad habit relapse:', payload.eventType);
        refreshBadHabits?.();
      })
      .subscribe(handleSubscriptionStatus('Bad Habits'));
    channels.push(badHabitsChannel);

    // ============================================
    // BOSS BATTLES - Active battles and damage
    // ============================================
    const bossChannel = supabase
      .channel('global_boss')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'boss_battles',
      }, (payload) => {
        // Check if user is a participant
        debug('[Realtime] Boss battle changed:', payload.eventType);
        refreshBoss?.();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'boss_battle_participants',
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        debug('[Realtime] Boss participation changed:', payload.eventType);
        refreshBoss?.();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'boss_battle_damage_logs',
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        debug('[Realtime] Boss damage logged:', payload.eventType);
        refreshBoss?.();
      })
      .subscribe(handleSubscriptionStatus('Boss Battles'));
    channels.push(bossChannel);

    // ============================================
    // CUSTOM STREAKS - User-defined streaks
    // ============================================
    const streaksChannel = supabase
      .channel('global_streaks')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'custom_streaks',
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        debug('[Realtime] Custom streak changed:', payload.eventType);
        refreshCustomStreaks?.();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'streak_check_ins',
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        debug('[Realtime] Streak check-in:', payload.eventType);
        refreshCustomStreaks?.();
      })
      .subscribe(handleSubscriptionStatus('Custom Streaks'));
    channels.push(streaksChannel);

    // ============================================
    // PETS - Companions and interactions
    // ============================================
    const petsChannel = supabase
      .channel('global_pets')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'user_pets',
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        debug('[Realtime] Pet changed:', payload.eventType);
        refreshPets?.();
      })
      .subscribe(handleSubscriptionStatus('Pets'));
    channels.push(petsChannel);

    // ============================================
    // PVP ARENA - Real-time combat matches
    // ============================================
    const pvpArenaChannel = supabase
      .channel('global_pvp_arena')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'pvp_arena_matches',
        filter: `player1_id=eq.${userId}`,
      }, (payload) => {
        debug('[Realtime] PvP arena match (p1):', payload.eventType);
        refreshPvpArena?.(userId);
        refreshPvpArenaStats?.(userId);
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'pvp_arena_matches',
        filter: `player2_id=eq.${userId}`,
      }, (payload) => {
        debug('[Realtime] PvP arena match (p2):', payload.eventType);
        refreshPvpArena?.(userId);
        refreshPvpArenaStats?.(userId);
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'pvp_arena_stats',
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        debug('[Realtime] PvP arena stats:', payload.eventType);
        refreshPvpArenaStats?.(userId);
      })
      .subscribe(handleSubscriptionStatus('PvP Arena'));
    channels.push(pvpArenaChannel);

    // ============================================
    // PVP DAILY BATTLES - Task-based PvP
    // ============================================
    const pvpChannel = supabase
      .channel('global_pvp')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'pvp_battles',
        filter: `player1_id=eq.${userId}`,
      }, (payload) => {
        debug('[Realtime] PvP battle (p1):', payload.eventType);
        refreshPvp?.(userId);
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'pvp_battles',
        filter: `player2_id=eq.${userId}`,
      }, (payload) => {
        debug('[Realtime] PvP battle (p2):', payload.eventType);
        refreshPvp?.(userId);
      })
      .subscribe(handleSubscriptionStatus('PvP Battles'));
    channels.push(pvpChannel);

    // ============================================
    // QUESTS - Main quests, side quests, dailies
    // ============================================
    const questsChannel = supabase
      .channel('global_quests')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'quests',
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        debug('[Realtime] Quest changed:', payload.eventType);
        refreshQuests?.();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'user_quests',
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        debug('[Realtime] User quest progress:', payload.eventType);
        refreshQuests?.();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'quest_objectives',
      }, (payload) => {
        debug('[Realtime] Quest objective:', payload.eventType);
        refreshQuests?.();
      })
      .subscribe(handleSubscriptionStatus('Quests'));
    channels.push(questsChannel);

    // ============================================
    // SETTINGS - User preferences
    // ============================================
    const settingsChannel = supabase
      .channel('global_settings')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'user_settings',
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        debug('[Realtime] Settings changed:', payload.eventType);
        refreshSettings?.();
      })
      .subscribe(handleSubscriptionStatus('Settings'));
    channels.push(settingsChannel);

    // ============================================
    // MODULE MASTERY - Skill trees per module
    // ============================================
    const masteryChannel = supabase
      .channel('global_mastery')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'user_module_mastery',
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        debug('[Realtime] Module mastery changed:', payload.eventType);
        refreshModuleMastery?.();
      })
      .subscribe(handleSubscriptionStatus('Module Mastery'));
    channels.push(masteryChannel);

    // ============================================
    // PERKS - Unlocked abilities
    // ============================================
    const perksChannel = supabase
      .channel('global_perks')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'user_perks',
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        debug('[Realtime] Perk changed:', payload.eventType);
        refreshPerks?.();
        if (payload.eventType === 'INSERT') {
          toast.success('New perk unlocked!', {
            title: '✨ Perk Unlocked',
            duration: 4000,
          });
        }
      })
      .subscribe(handleSubscriptionStatus('Perks'));
    channels.push(perksChannel);

    // ============================================
    // NOTIFICATIONS - System notifications
    // ============================================
    const notificationsChannel = supabase
      .channel('global_notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        debug('[Realtime] New notification:', payload.new);
        refreshNotifications?.();
        // Show toast for new notifications
        const notif = payload.new;
        if (notif?.title) {
          toast.info(notif.message || 'New notification', {
            title: notif.title,
            duration: 4000,
          });
        }
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        debug('[Realtime] Notification updated:', payload.eventType);
        refreshNotifications?.();
      })
      .subscribe(handleSubscriptionStatus('Notifications'));
    channels.push(notificationsChannel);

    // ============================================
    // DASHBOARD - Widget configurations
    // ============================================
    const dashboardChannel = supabase
      .channel('global_dashboard')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'dashboard_widgets',
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        debug('[Realtime] Dashboard widget changed:', payload.eventType);
        refreshDashboard?.();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'dashboard_layouts',
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        debug('[Realtime] Dashboard layout changed:', payload.eventType);
        refreshDashboard?.();
      })
      .subscribe(handleSubscriptionStatus('Dashboard'));
    channels.push(dashboardChannel);

    // ============================================
    // AVATAR & EQUIPMENT - Character customisation
    // ============================================
    const avatarChannel = supabase
      .channel('global_avatar')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'user_avatars',
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        debug('[Realtime] Avatar changed:', payload.eventType);
        refreshAvatar?.();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'user_equipment',
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        debug('[Realtime] Equipment changed:', payload.eventType);
        refreshAvatar?.();
      })
      .subscribe(handleSubscriptionStatus('Avatar'));
    channels.push(avatarChannel);

    // ============================================
    // JOURNAL - Entries and reflections
    // ============================================
    const journalChannel = supabase
      .channel('global_journal')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'journal_entries',
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        debug('[Realtime] Journal entry changed:', payload.eventType);
        // Journal might use knowledge store or its own
        refreshKnowledge?.();
      })
      .subscribe(handleSubscriptionStatus('Journal'));
    channels.push(journalChannel);

    // ============================================
    // HABITS - Daily habits tracking
    // ============================================
    const habitsChannel = supabase
      .channel('global_habits')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'habits',
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        debug('[Realtime] Habit changed:', payload.eventType);
        refreshDailyTasks?.();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'habit_completions',
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        debug('[Realtime] Habit completion:', payload.eventType);
        refreshDailyTasks?.();
      })
      .subscribe(handleSubscriptionStatus('Habits'));
    channels.push(habitsChannel);

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
    userId,
    // Core modules
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
    // Social
    refreshFriends,
    refreshPendingRequests,
    refreshChallenges,
    refreshH2HInvites,
    refreshActivityFeed,
    // Additional modules
    refreshBadHabits,
    refreshBoss,
    refreshCustomStreaks,
    refreshPets,
    refreshPvpArena,
    refreshPvpArenaStats,
    refreshPvp,
    refreshQuests,
    refreshSettings,
    refreshModuleMastery,
    refreshPerks,
    refreshNotifications,
    refreshDashboard,
    // Utilities
    toast,
    showNotifications,
  ]);

  return children;
}

export default RealtimeProvider;
