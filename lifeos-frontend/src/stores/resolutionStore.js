/**
 * Resolution Store - State Management for New Year's Resolutions
 * Handles resolution tracking, check-ins, milestones, and progress
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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

      // Add a new resolution
      addResolution: (resolution) => {
        const { resolutions, achievements, resolutionXP } = get();
        const newResolution = {
          id: `res_${Date.now()}`,
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
        let xpGain = 25; // Base XP for creating resolution

        if (resolutions.length === 0 && !achievements.includes('first_resolution')) {
          newAchievements.push('first_resolution');
          xpGain += ACHIEVEMENT_BADGES.first_resolution.xp;
        }

        set({
          resolutions: [...resolutions, newResolution],
          achievements: newAchievements,
          resolutionXP: resolutionXP + xpGain,
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
      },

      // Delete a resolution
      deleteResolution: (id) => {
        const { resolutions } = get();
        set({
          resolutions: resolutions.filter(r => r.id !== id),
        });
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

        // Calculate XP
        let xpGain = 10; // Base check-in XP
        if (newStreak >= 7) xpGain += 5; // Streak bonus
        if (newStreak >= 30) xpGain += 10;

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
      },

      // Complete a milestone
      completeMilestone: (resolutionId, milestoneId) => {
        const { resolutions, achievements, resolutionXP } = get();
        let xpGain = 100;
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
      },

      // Mark resolution as completed (full year success!)
      completeResolution: (resolutionId) => {
        const { resolutions, achievements, resolutionXP } = get();
        const newAchievements = [...achievements];
        let xpGain = 500;

        if (!achievements.includes('year_complete')) {
          newAchievements.push('year_complete');
          xpGain += ACHIEVEMENT_BADGES.year_complete.xp;
        }

        set({
          resolutions: resolutions.map(r =>
            r.id === resolutionId
              ? { ...r, status: 'completed', completedAt: new Date().toISOString() }
              : r
          ),
          achievements: newAchievements,
          resolutionXP: resolutionXP + xpGain,
        });
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
    }
  )
);

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
