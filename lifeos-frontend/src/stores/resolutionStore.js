/**
 * Resolution Store - State Management for New Year's Resolutions
 * Handles resolution tracking, check-ins, milestones, and progress
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase, getCurrentUserId } from '../lib/supabase';
import { triggerGamification } from '../hooks/useGamification';

// Resolution categories with colors and icons
export const RESOLUTION_CATEGORIES = {
  health: { name: 'Health & Fitness', color: '#10B981', icon: 'Heart' },
  career: { name: 'Career & Business', color: '#8B5CF6', icon: 'Briefcase' },
  learning: { name: 'Learning & Growth', color: '#3B82F6', icon: 'BookOpen' },
  financial: { name: 'Financial', color: '#F59E0B', icon: 'DollarSign' },
  relationships: { name: 'Relationships', color: '#EC4899', icon: 'Users' },
  creativity: { name: 'Creativity', color: '#06B6D4', icon: 'Palette' },
  mindfulness: { name: 'Mindfulness', color: '#6366F1', icon: 'Brain' },
  habits: { name: 'Habits & Lifestyle', color: '#14B8A6', icon: 'Repeat' },
};

// Achievement badges for milestones
export const ACHIEVEMENT_BADGES = {
  first_resolution: { name: 'First Step', description: 'Created your first resolution', icon: '🎯', xp: 50 },
  week_streak: { name: 'Week Warrior', description: '7-day check-in streak', icon: '🔥', xp: 100 },
  month_streak: { name: 'Monthly Master', description: '30-day check-in streak', icon: '⭐', xp: 250 },
  quarter_complete: { name: 'Quarter Champion', description: 'Completed Q1 milestone', icon: '🏆', xp: 500 },
  half_year: { name: 'Halfway Hero', description: '6 months of consistency', icon: '🌟', xp: 1000 },
  year_complete: { name: 'Resolution Legend', description: 'Completed full year resolution', icon: '👑', xp: 2500 },
  comeback_kid: { name: 'Comeback Kid', description: 'Recovered from a lapse', icon: '💪', xp: 150 },
  perfect_month: { name: 'Perfect Month', description: '100% check-ins for a month', icon: '💎', xp: 300 },
};

// Supabase sync helpers
const syncResolutionToSupabase = async (resolution, action = 'upsert') => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return;

    if (action === 'delete') {
      await supabase.from('resolutions').delete().eq('id', resolution.id);
      return;
    }

    const dbResolution = {
      id: resolution.id,
      user_id: userId,
      title: resolution.title,
      description: resolution.description || '',
      category: resolution.category,
      year: resolution.year || 2026,
      status: resolution.status || 'active',
      milestones: resolution.milestones || [],
      current_streak: resolution.currentStreak || 0,
      longest_streak: resolution.longestStreak || 0,
      total_check_ins: resolution.totalCheckIns || 0,
      last_check_in: resolution.lastCheckIn,
      check_in_notes: resolution.checkInNotes || [],
      completed_at: resolution.completedAt,
    };

    await supabase.from('resolutions').upsert(dbResolution, { onConflict: 'id' });
  } catch (error) {
    console.error('Error syncing resolution to Supabase:', error);
  }
};

const syncCheckInToSupabase = async (resolutionId, checkInDate, note = '') => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return;

    const dbCheckIn = {
      id: crypto.randomUUID(),
      user_id: userId,
      resolution_id: resolutionId,
      check_in_date: checkInDate,
      note: note,
    };

    await supabase.from('resolution_check_ins').upsert(dbCheckIn);
  } catch (error) {
    console.error('Error syncing check-in to Supabase:', error);
  }
};

const syncAchievementToSupabase = async (achievementKey, resolutionId = null, xpAwarded = 0) => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return;

    const dbAchievement = {
      id: crypto.randomUUID(),
      user_id: userId,
      achievement_key: achievementKey,
      resolution_id: resolutionId,
      xp_awarded: xpAwarded,
    };

    await supabase.from('resolution_achievements').upsert(dbAchievement);
  } catch (error) {
    console.error('Error syncing achievement to Supabase:', error);
  }
};

export const useResolutionStore = create(
  persist(
    (set, get) => ({
      // Current year's resolutions
      resolutions: [],

      // Check-in history (date -> resolution IDs checked in)
      checkIns: {},

      // Earned achievements
      achievements: [],

      // Total XP earned from resolutions
      resolutionXP: 0,

      // Active year (allows viewing past years) - Target 2026 for app release
      activeYear: 2026,

      // Initialize from Supabase
      initializeFromSupabase: async (passedUserId = null) => {
        // Master timeout to prevent hanging
        const INIT_TIMEOUT_MS = 15000;
        let timedOut = false;
        const timeoutId = setTimeout(() => {
          timedOut = true;
        }, INIT_TIMEOUT_MS);

        // Helper to wrap queries with timeout
        const withTimeout = (promise, timeoutMs = 10000) => {
          return Promise.race([
            promise,
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Query timeout')), timeoutMs)
            )
          ]).catch(() => ({ data: null, error: 'timeout' }));
        };

        try {
          const userId = passedUserId || await getCurrentUserId();
          if (!userId) {
            clearTimeout(timeoutId);
            return;
          }

          // Run all queries in parallel for faster initialization
          const [
            { data: resolutionsData, error: resError },
            { data: checkInsData, error: checkInError },
            { data: achievementsData, error: achError }
          ] = await Promise.all([
            // Load resolutions
            withTimeout(
              supabase
                .from('resolutions')
                .select('*')
                .eq('user_id', userId)
            ),
            // Load check-ins
            withTimeout(
              supabase
                .from('resolution_check_ins')
                .select('*')
                .eq('user_id', userId)
            ),
            // Load achievements
            withTimeout(
              supabase
                .from('resolution_achievements')
                .select('*')
                .eq('user_id', userId)
            )
          ]);

          // Continue with empty data on timeout - don't throw
          if (resError && resError !== 'timeout') throw resError;
          if (checkInError && checkInError !== 'timeout') throw checkInError;
          if (achError && achError !== 'timeout') throw achError;

          if (resolutionsData) {
            // Transform resolutions from DB format
            const resolutions = resolutionsData.map(r => ({
              id: r.id,
              title: r.title,
              description: r.description || '',
              category: r.category,
              year: r.year,
              status: r.status || 'active',
              createdAt: r.created_at,
              currentStreak: r.current_streak || 0,
              longestStreak: r.longest_streak || 0,
              totalCheckIns: r.total_check_ins || 0,
              lastCheckIn: r.last_check_in,
              milestones: r.milestones || [],
              checkInNotes: r.check_in_notes || [],
              completedAt: r.completed_at,
            }));

            // Build check-ins map from check-in data
            const checkIns = {};
            if (checkInsData) {
              checkInsData.forEach(ci => {
                const date = ci.check_in_date;
                if (!checkIns[date]) {
                  checkIns[date] = [];
                }
                checkIns[date].push(ci.resolution_id);
              });
            }

            // Get achievement keys
            const achievements = achievementsData
              ? achievementsData.map(a => a.achievement_key)
              : [];

            // Calculate total XP
            const resolutionXP = achievementsData
              ? achievementsData.reduce((sum, a) => sum + (a.xp_awarded || 0), 0)
              : 0;

            set({ resolutions, checkIns, achievements, resolutionXP });
          }
          console.log('[ResolutionStore] ✅ Initialized');
        } catch (error) {
          console.error('[ResolutionStore] ❌ Error initializing:', error);
        } finally {
          clearTimeout(timeoutId);
        }
      },

      // Add a new resolution
      addResolution: (resolution) => {
        const { resolutions, achievements, resolutionXP } = get();
        const newResolution = {
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          year: 2026, // Target year for resolutions
          status: 'active', // active, completed, abandoned
          currentStreak: 0,
          longestStreak: 0,
          totalCheckIns: 0,
          lastCheckIn: null,
          milestones: generateMilestones(resolution),
          ...resolution,
        };

        // Check for first resolution achievement
        const newAchievements = [...achievements];
        let xpGain = 8; // Base XP for creating resolution (EASY tier)

        if (resolutions.length === 0 && !achievements.includes('first_resolution')) {
          newAchievements.push('first_resolution');
          xpGain += ACHIEVEMENT_BADGES.first_resolution.xp;
          // Sync achievement
          syncAchievementToSupabase('first_resolution', newResolution.id, ACHIEVEMENT_BADGES.first_resolution.xp);
        }

        set({
          resolutions: [...resolutions, newResolution],
          achievements: newAchievements,
          resolutionXP: resolutionXP + xpGain,
        });

        // Sync to Supabase
        syncResolutionToSupabase(newResolution);

        // Trigger unified gamification system
        triggerGamification('resolutionCreated', {
          xpOverride: xpGain,
          module: 'productivity',
        });

        return newResolution;
      },

      // Update a resolution
      updateResolution: (id, updates) => {
        const { resolutions } = get();
        set({
          resolutions: resolutions.map(r =>
            r.id === id ? { ...r, ...updates } : r
          ),
        });

        // Sync to Supabase
        const updatedResolution = get().resolutions.find(r => r.id === id);
        if (updatedResolution) {
          syncResolutionToSupabase(updatedResolution);
        }
      },

      // Delete a resolution
      deleteResolution: (id) => {
        const { resolutions } = get();
        const resolutionToDelete = resolutions.find(r => r.id === id);

        set({
          resolutions: resolutions.filter(r => r.id !== id),
        });

        // Sync to Supabase
        if (resolutionToDelete) {
          syncResolutionToSupabase(resolutionToDelete, 'delete');
        }
      },

      // Check in for a resolution
      checkIn: (resolutionId, note = '') => {
        const { resolutions, checkIns, achievements, resolutionXP } = get();
        const today = new Date().toISOString().split('T')[0];
        const resolution = resolutions.find(r => r.id === resolutionId);

        if (!resolution) return;

        // Update check-ins map
        const todayCheckIns = checkIns[today] || [];
        if (todayCheckIns.includes(resolutionId)) return; // Already checked in

        const newCheckIns = {
          ...checkIns,
          [today]: [...todayCheckIns, resolutionId],
        };

        // Calculate streak
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        const hadYesterdayCheckIn = (checkIns[yesterdayStr] || []).includes(resolutionId);

        const newStreak = hadYesterdayCheckIn ? resolution.currentStreak + 1 : 1;
        const longestStreak = Math.max(resolution.longestStreak, newStreak);

        // Calculate XP (TRIVIAL/EASY tier for check-ins)
        let xpGain = 5; // Base check-in XP
        if (newStreak >= 7) xpGain += 3; // Streak bonus
        if (newStreak >= 30) xpGain += 5;

        // Check for achievements
        const newAchievements = [...achievements];

        if (newStreak === 7 && !achievements.includes('week_streak')) {
          newAchievements.push('week_streak');
          xpGain += ACHIEVEMENT_BADGES.week_streak.xp;
        }
        if (newStreak === 30 && !achievements.includes('month_streak')) {
          newAchievements.push('month_streak');
          xpGain += ACHIEVEMENT_BADGES.month_streak.xp;
        }
        if (newStreak === 180 && !achievements.includes('half_year')) {
          newAchievements.push('half_year');
          xpGain += ACHIEVEMENT_BADGES.half_year.xp;
        }

        // Check for comeback achievement
        if (resolution.currentStreak === 0 && resolution.totalCheckIns > 0 && !achievements.includes('comeback_kid')) {
          newAchievements.push('comeback_kid');
          xpGain += ACHIEVEMENT_BADGES.comeback_kid.xp;
        }

        // Update resolution
        const updatedResolutions = resolutions.map(r =>
          r.id === resolutionId
            ? {
                ...r,
                currentStreak: newStreak,
                longestStreak,
                totalCheckIns: r.totalCheckIns + 1,
                lastCheckIn: today,
                checkInNotes: [...(r.checkInNotes || []), { date: today, note }],
              }
            : r
        );

        set({
          resolutions: updatedResolutions,
          checkIns: newCheckIns,
          achievements: newAchievements,
          resolutionXP: resolutionXP + xpGain,
        });

        // Trigger unified gamification system
        triggerGamification('resolutionCheckIn', {
          xpOverride: xpGain,
          module: 'productivity',
        });

        // Sync check-in to Supabase
        syncCheckInToSupabase(resolutionId, today, note);

        // Sync updated resolution
        const updatedResolution = updatedResolutions.find(r => r.id === resolutionId);
        if (updatedResolution) {
          syncResolutionToSupabase(updatedResolution);
        }

        // Sync any new achievements
        const newlyEarned = newAchievements.filter(a => !achievements.includes(a));
        newlyEarned.forEach(achievementKey => {
          const badge = ACHIEVEMENT_BADGES[achievementKey];
          if (badge) {
            syncAchievementToSupabase(achievementKey, resolutionId, badge.xp);
          }
        });
      },

      // Complete a milestone (HARD tier - significant quarterly achievement)
      completeMilestone: (resolutionId, milestoneId) => {
        const { resolutions, achievements, resolutionXP } = get();
        let xpGain = 25;
        const newAchievements = [...achievements];

        const updatedResolutions = resolutions.map(r => {
          if (r.id !== resolutionId) return r;

          const updatedMilestones = r.milestones.map(m => {
            if (m.id !== milestoneId) return m;

            // Check for quarter achievement
            if (m.quarter === 1 && !achievements.includes('quarter_complete')) {
              newAchievements.push('quarter_complete');
              xpGain += ACHIEVEMENT_BADGES.quarter_complete.xp;
            }

            return { ...m, completed: true, completedAt: new Date().toISOString() };
          });

          return { ...r, milestones: updatedMilestones };
        });

        set({
          resolutions: updatedResolutions,
          achievements: newAchievements,
          resolutionXP: resolutionXP + xpGain,
        });

        // Trigger unified gamification system
        triggerGamification('resolutionMilestone', {
          xpOverride: xpGain,
          module: 'productivity',
        });

        // Sync updated resolution with milestones
        const updatedResolution = updatedResolutions.find(r => r.id === resolutionId);
        if (updatedResolution) {
          syncResolutionToSupabase(updatedResolution);
        }

        // Sync any new achievements
        const newlyEarned = newAchievements.filter(a => !achievements.includes(a));
        newlyEarned.forEach(achievementKey => {
          const badge = ACHIEVEMENT_BADGES[achievementKey];
          if (badge) {
            syncAchievementToSupabase(achievementKey, resolutionId, badge.xp);
          }
        });
      },

      // Mark resolution as completed (full year success! EPIC tier)
      completeResolution: (resolutionId) => {
        const { resolutions, achievements, resolutionXP } = get();
        const newAchievements = [...achievements];
        let xpGain = 75;

        if (!achievements.includes('year_complete')) {
          newAchievements.push('year_complete');
          xpGain += ACHIEVEMENT_BADGES.year_complete.xp;
        }

        const updatedResolutions = resolutions.map(r =>
          r.id === resolutionId
            ? { ...r, status: 'completed', completedAt: new Date().toISOString() }
            : r
        );

        set({
          resolutions: updatedResolutions,
          achievements: newAchievements,
          resolutionXP: resolutionXP + xpGain,
        });

        // Trigger unified gamification system for the big completion!
        triggerGamification('resolutionCompleted', {
          xpOverride: xpGain,
          module: 'productivity',
        });

        // Sync updated resolution
        const updatedResolution = updatedResolutions.find(r => r.id === resolutionId);
        if (updatedResolution) {
          syncResolutionToSupabase(updatedResolution);
        }

        // Sync year_complete achievement if earned
        if (!achievements.includes('year_complete')) {
          syncAchievementToSupabase('year_complete', resolutionId, ACHIEVEMENT_BADGES.year_complete.xp);
        }
      },

      // Get resolution progress (0-100)
      getResolutionProgress: (resolutionId) => {
        const { resolutions, checkIns } = get();
        const resolution = resolutions.find(r => r.id === resolutionId);
        if (!resolution) return 0;

        const startDate = new Date(resolution.createdAt);
        const endDate = new Date(startDate.getFullYear(), 11, 31); // Dec 31
        const today = new Date();

        const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
        const daysPassed = Math.ceil((today - startDate) / (1000 * 60 * 60 * 24));

        // Calculate based on check-in frequency
        const expectedCheckIns = Math.min(daysPassed, totalDays);
        const actualCheckIns = resolution.totalCheckIns;

        return Math.min(100, Math.round((actualCheckIns / expectedCheckIns) * 100));
      },

      // Get year progress (0-100) - for 2026
      getYearProgress: () => {
        const now = new Date();
        const targetYear = 2026;
        const start = new Date(targetYear, 0, 1);
        const end = new Date(targetYear, 11, 31);

        // If we're before 2026, show 0%
        if (now < start) return 0;
        // If we're after 2026, show 100%
        if (now > end) return 100;

        const progress = ((now - start) / (end - start)) * 100;
        return Math.min(100, Math.round(progress));
      },

      // Get days remaining in 2026
      getDaysRemaining: () => {
        const now = new Date();
        const targetYear = 2026;
        const startOfYear = new Date(targetYear, 0, 1);
        const endOfYear = new Date(targetYear, 11, 31);

        // If we're before 2026, show days until start of 2026
        if (now < startOfYear) {
          return Math.ceil((startOfYear - now) / (1000 * 60 * 60 * 24));
        }
        // If we're in 2026, show days remaining
        if (now <= endOfYear) {
          return Math.ceil((endOfYear - now) / (1000 * 60 * 60 * 24));
        }
        // If we're past 2026
        return 0;
      },

      // Get check-in data for heatmap
      getCheckInHeatmap: (resolutionId = null) => {
        const { checkIns, resolutions } = get();
        const heatmapData = {};

        Object.entries(checkIns).forEach(([date, resIds]) => {
          if (resolutionId) {
            heatmapData[date] = resIds.includes(resolutionId) ? 1 : 0;
          } else {
            // All resolutions - intensity based on percentage checked
            const activeResolutions = resolutions.filter(r => r.status === 'active');
            heatmapData[date] = activeResolutions.length > 0
              ? resIds.length / activeResolutions.length
              : 0;
          }
        });

        return heatmapData;
      },

      // Get statistics
      getStats: () => {
        const { resolutions, checkIns, achievements, resolutionXP } = get();
        const activeResolutions = resolutions.filter(r => r.status === 'active');
        const completedResolutions = resolutions.filter(r => r.status === 'completed');

        const totalCheckIns = Object.values(checkIns).flat().length;
        const longestStreak = Math.max(0, ...resolutions.map(r => r.longestStreak));
        const currentStreaks = resolutions.map(r => r.currentStreak);
        const avgStreak = currentStreaks.length > 0
          ? Math.round(currentStreaks.reduce((a, b) => a + b, 0) / currentStreaks.length)
          : 0;

        return {
          totalResolutions: resolutions.length,
          activeResolutions: activeResolutions.length,
          completedResolutions: completedResolutions.length,
          totalCheckIns,
          longestStreak,
          avgStreak,
          achievementsEarned: achievements.length,
          totalXP: resolutionXP,
        };
      },

      // Check if checked in today for a resolution
      hasCheckedInToday: (resolutionId) => {
        const { checkIns } = get();
        const today = new Date().toISOString().split('T')[0];
        return (checkIns[today] || []).includes(resolutionId);
      },

      // Reset for new year
      resetForNewYear: () => {
        set({
          resolutions: [],
          checkIns: {},
          activeYear: 2026,
        });
      },
    }),
    {
      name: 'resolution-storage',
      partialize: (state) => ({
        resolutions: state.resolutions,
        checkIns: state.checkIns,
        achievements: state.achievements,
        resolutionXP: state.resolutionXP,
        activeYear: state.activeYear,
      }),
    }
  )
);

// Initialize resolution store from Supabase
export const initializeResolutionStore = async (userId = null) => {
  const store = useResolutionStore.getState();
  await store.initializeFromSupabase(userId);
};

// Helper function to generate quarterly milestones
function generateMilestones(resolution) {
  const year = 2026; // Target year
  return [
    {
      id: `ms_q1_${Date.now()}`,
      quarter: 1,
      title: 'Q1 Checkpoint',
      description: `First quarter progress for: ${resolution.title}`,
      targetDate: `${year}-03-31`,
      completed: false,
    },
    {
      id: `ms_q2_${Date.now()}`,
      quarter: 2,
      title: 'Q2 Checkpoint',
      description: `Mid-year checkpoint for: ${resolution.title}`,
      targetDate: `${year}-06-30`,
      completed: false,
    },
    {
      id: `ms_q3_${Date.now()}`,
      quarter: 3,
      title: 'Q3 Checkpoint',
      description: `Third quarter review for: ${resolution.title}`,
      targetDate: `${year}-09-30`,
      completed: false,
    },
    {
      id: `ms_q4_${Date.now()}`,
      quarter: 4,
      title: 'Final Push',
      description: `Year-end goal for: ${resolution.title}`,
      targetDate: `${year}-12-31`,
      completed: false,
    },
  ];
}
