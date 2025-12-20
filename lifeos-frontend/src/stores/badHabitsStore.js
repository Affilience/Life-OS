/**
 * Bad Habits Store - Track habits you want to quit
 *
 * Features:
 * - Track time since last occurrence (days, hours, minutes)
 * - Calculate money saved based on cost per occurrence
 * - Health milestones and achievements
 * - Relapse tracking with recovery support
 * - XP rewards for milestones
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase, getCurrentUserId } from '../lib/supabase';
import { triggerGamification } from '../hooks/useGamification';

// Predefined habit categories with icons and colors
export const HABIT_CATEGORIES = {
  substance: {
    label: 'Substance',
    icon: '🚬',
    color: 'from-red-500 to-orange-500',
    examples: ['Smoking', 'Alcohol', 'Vaping', 'Caffeine'],
  },
  digital: {
    label: 'Digital',
    icon: '📱',
    color: 'from-blue-500 to-cyan-500',
    examples: ['Social Media', 'Gaming', 'Porn', 'Doomscrolling'],
  },
  food: {
    label: 'Food',
    icon: '🍔',
    color: 'from-yellow-500 to-orange-500',
    examples: ['Junk Food', 'Sugar', 'Late Night Eating', 'Soda'],
  },
  behavioral: {
    label: 'Behavioral',
    icon: '🧠',
    color: 'from-purple-500 to-pink-500',
    examples: ['Procrastination', 'Nail Biting', 'Oversleeping', 'Negative Self-Talk'],
  },
  financial: {
    label: 'Financial',
    icon: '💸',
    color: 'from-green-500 to-emerald-500',
    examples: ['Impulse Shopping', 'Gambling', 'Subscriptions'],
  },
};

// Milestone definitions with XP rewards
export const MILESTONES = [
  { days: 1, label: '24 Hours', xp: 25, icon: '🌟' },
  { days: 3, label: '3 Days', xp: 50, icon: '⭐' },
  { days: 7, label: '1 Week', xp: 100, icon: '🔥' },
  { days: 14, label: '2 Weeks', xp: 150, icon: '💪' },
  { days: 21, label: '21 Days', xp: 200, icon: '🏆' },
  { days: 30, label: '1 Month', xp: 300, icon: '🎯' },
  { days: 60, label: '2 Months', xp: 400, icon: '💎' },
  { days: 90, label: '3 Months', xp: 500, icon: '👑' },
  { days: 180, label: '6 Months', xp: 750, icon: '🌙' },
  { days: 365, label: '1 Year', xp: 1500, icon: '🎊' },
];

// Health benefits by category (approximate timelines)
export const HEALTH_BENEFITS = {
  smoking: [
    { hours: 0.33, benefit: 'Heart rate begins to drop' },
    { hours: 12, benefit: 'Carbon monoxide levels normalize' },
    { hours: 24, benefit: 'Risk of heart attack decreases' },
    { hours: 48, benefit: 'Nerve endings start to regrow' },
    { hours: 72, benefit: 'Breathing becomes easier' },
    { hours: 336, benefit: 'Circulation improves significantly' }, // 2 weeks
    { hours: 720, benefit: 'Lung function increases up to 30%' }, // 1 month
    { hours: 2160, benefit: 'Cilia regrow, reducing infection risk' }, // 3 months
    { hours: 8760, benefit: 'Risk of heart disease halved' }, // 1 year
  ],
  alcohol: [
    { hours: 6, benefit: 'Body starts detoxifying' },
    { hours: 24, benefit: 'Blood sugar normalizes' },
    { hours: 72, benefit: 'Withdrawal symptoms peak then decline' },
    { hours: 168, benefit: 'Sleep quality improves' }, // 1 week
    { hours: 336, benefit: 'Skin begins to look healthier' }, // 2 weeks
    { hours: 720, benefit: 'Liver fat reduces by 15%' }, // 1 month
    { hours: 2160, benefit: 'Blood pressure normalizes' }, // 3 months
  ],
  sugar: [
    { hours: 24, benefit: 'Cravings begin to decrease' },
    { hours: 72, benefit: 'Energy levels stabilize' },
    { hours: 168, benefit: 'Taste buds reset' }, // 1 week
    { hours: 336, benefit: 'Skin clarity improves' }, // 2 weeks
    { hours: 720, benefit: 'Weight loss becomes noticeable' }, // 1 month
  ],
  social_media: [
    { hours: 24, benefit: 'Reduced anxiety and FOMO' },
    { hours: 72, benefit: 'Better sleep quality' },
    { hours: 168, benefit: 'Improved focus and attention span' }, // 1 week
    { hours: 336, benefit: 'More meaningful in-person connections' }, // 2 weeks
    { hours: 720, benefit: 'Increased productivity' }, // 1 month
  ],
  default: [
    { hours: 24, benefit: 'You\'ve broken the daily cycle' },
    { hours: 72, benefit: 'New neural pathways forming' },
    { hours: 168, benefit: 'Habit loop weakening' }, // 1 week
    { hours: 504, benefit: 'New behaviors becoming automatic' }, // 3 weeks
    { hours: 720, benefit: 'Significant habit change achieved' }, // 1 month
  ],
};

// Helper to generate UUID
const generateId = () => crypto.randomUUID();

// Helper to calculate time difference
const getTimeSince = (startDate) => {
  const now = new Date();
  const start = new Date(startDate);
  const diffMs = now - start;

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
  const totalHours = diffMs / (1000 * 60 * 60);

  return { days, hours, minutes, seconds, totalHours, totalMs: diffMs };
};

const useBadHabitsStore = create(
  persist(
    (set, get) => ({
      // State
      habits: [],
      relapses: [],
      unlockedMilestones: {}, // { habitId: [milestoneIndex, ...] }
      isLoading: false,

      // Actions
      addHabit: (habitData) => {
        const newHabit = {
          id: generateId(),
          name: habitData.name,
          category: habitData.category || 'behavioral',
          icon: habitData.icon || HABIT_CATEGORIES[habitData.category]?.icon || '🎯',
          color: habitData.color || HABIT_CATEGORIES[habitData.category]?.color || 'from-gray-500 to-gray-600',
          costPerOccurrence: habitData.costPerOccurrence || 0,
          frequencyPerDay: habitData.frequencyPerDay || 1,
          startDate: new Date().toISOString(),
          lastRelapseDate: null,
          totalRelapses: 0,
          longestStreak: 0,
          healthBenefitType: habitData.healthBenefitType || 'default',
          motivation: habitData.motivation || '',
          triggers: habitData.triggers || [],
          copingStrategies: habitData.copingStrategies || [],
          createdAt: new Date().toISOString(),
        };

        set(state => ({
          habits: [...state.habits, newHabit],
          unlockedMilestones: { ...state.unlockedMilestones, [newHabit.id]: [] },
        }));

        // Sync to Supabase
        get().syncHabitToSupabase(newHabit);

        // Award XP for committing to quit a bad habit
        triggerGamification('badHabitStarted', {
          xpOverride: 20,
          module: 'health',
        });

        return newHabit;
      },

      updateHabit: (habitId, updates) => {
        set(state => ({
          habits: state.habits.map(h =>
            h.id === habitId ? { ...h, ...updates } : h
          ),
        }));

        const habit = get().habits.find(h => h.id === habitId);
        if (habit) {
          get().syncHabitToSupabase(habit);
        }
      },

      deleteHabit: (habitId) => {
        set(state => ({
          habits: state.habits.filter(h => h.id !== habitId),
          relapses: state.relapses.filter(r => r.habitId !== habitId),
          unlockedMilestones: Object.fromEntries(
            Object.entries(state.unlockedMilestones).filter(([id]) => id !== habitId)
          ),
        }));

        // Delete from Supabase
        get().deleteHabitFromSupabase(habitId);
      },

      // Record a relapse
      recordRelapse: (habitId, notes = '') => {
        const habit = get().habits.find(h => h.id === habitId);
        if (!habit) return null;

        const now = new Date().toISOString();
        const timeSince = getTimeSince(habit.startDate);

        // Record the relapse
        const relapse = {
          id: generateId(),
          habitId,
          date: now,
          daysSinceStart: timeSince.days,
          notes,
          emotion: null, // Can be set later
        };

        // Update longest streak if this was longer
        const longestStreak = Math.max(habit.longestStreak, timeSince.days);

        set(state => ({
          relapses: [...state.relapses, relapse],
          habits: state.habits.map(h =>
            h.id === habitId
              ? {
                  ...h,
                  lastRelapseDate: now,
                  totalRelapses: h.totalRelapses + 1,
                  longestStreak,
                  startDate: now, // Reset the timer
                }
              : h
          ),
          // Reset milestones for this habit
          unlockedMilestones: {
            ...state.unlockedMilestones,
            [habitId]: [],
          },
        }));

        // Sync to Supabase
        get().syncRelapseToSupabase(relapse);

        return relapse;
      },

      // Check and unlock milestones
      checkMilestones: (habitId) => {
        const habit = get().habits.find(h => h.id === habitId);
        if (!habit) return [];

        const timeSince = getTimeSince(habit.startDate);
        const currentMilestones = get().unlockedMilestones[habitId] || [];
        const newlyUnlocked = [];

        MILESTONES.forEach((milestone, index) => {
          if (timeSince.days >= milestone.days && !currentMilestones.includes(index)) {
            newlyUnlocked.push({ ...milestone, index });
          }
        });

        if (newlyUnlocked.length > 0) {
          set(state => ({
            unlockedMilestones: {
              ...state.unlockedMilestones,
              [habitId]: [...currentMilestones, ...newlyUnlocked.map(m => m.index)],
            },
          }));

          // Award XP for each newly unlocked milestone
          const totalXP = newlyUnlocked.reduce((sum, m) => sum + m.xp, 0);
          triggerGamification('badHabitMilestone', {
            xpOverride: totalXP,
            module: 'health', // Bad habits relate to health/wellness
          });
        }

        return newlyUnlocked;
      },

      // Get habit stats
      getHabitStats: (habitId) => {
        const habit = get().habits.find(h => h.id === habitId);
        if (!habit) return null;

        const timeSince = getTimeSince(habit.startDate);
        const moneySaved = (habit.costPerOccurrence * habit.frequencyPerDay * timeSince.days) +
          (habit.costPerOccurrence * habit.frequencyPerDay * (timeSince.hours / 24));

        // Get health benefits achieved
        const healthBenefits = HEALTH_BENEFITS[habit.healthBenefitType] || HEALTH_BENEFITS.default;
        const achievedBenefits = healthBenefits.filter(b => timeSince.totalHours >= b.hours);
        const nextBenefit = healthBenefits.find(b => timeSince.totalHours < b.hours);

        // Get milestone progress
        const unlockedMilestones = get().unlockedMilestones[habitId] || [];
        const nextMilestone = MILESTONES.find((m, i) => !unlockedMilestones.includes(i));
        const progressToNextMilestone = nextMilestone
          ? Math.min(100, (timeSince.days / nextMilestone.days) * 100)
          : 100;

        return {
          ...habit,
          timeSince,
          moneySaved: Math.round(moneySaved * 100) / 100,
          achievedBenefits,
          nextBenefit,
          unlockedMilestones: unlockedMilestones.map(i => MILESTONES[i]),
          nextMilestone,
          progressToNextMilestone,
          totalXPEarned: unlockedMilestones.reduce((sum, i) => sum + MILESTONES[i].xp, 0),
        };
      },

      // Get all habits with stats
      getAllHabitsWithStats: () => {
        return get().habits.map(h => get().getHabitStats(h.id)).filter(Boolean);
      },

      // Get recent relapses for a habit
      getRelapses: (habitId) => {
        return get().relapses
          .filter(r => r.habitId === habitId)
          .sort((a, b) => new Date(b.date) - new Date(a.date));
      },

      // Get summary stats
      getSummary: () => {
        const habits = get().habits;
        const allStats = get().getAllHabitsWithStats();

        return {
          totalHabits: habits.length,
          totalDaysClean: allStats.reduce((sum, h) => sum + h.timeSince.days, 0),
          totalMoneySaved: allStats.reduce((sum, h) => sum + h.moneySaved, 0),
          totalMilestones: Object.values(get().unlockedMilestones).flat().length,
          totalXPEarned: allStats.reduce((sum, h) => sum + h.totalXPEarned, 0),
          longestCurrentStreak: Math.max(0, ...allStats.map(h => h.timeSince.days)),
        };
      },

      // Supabase sync functions
      syncHabitToSupabase: async (habit) => {
        try {
          const userId = await getCurrentUserId();
          if (!userId) return;

          const { error } = await supabase
            .from('bad_habits')
            .upsert({
              id: habit.id,
              user_id: userId,
              name: habit.name,
              category: habit.category,
              icon: habit.icon,
              color: habit.color,
              cost_per_occurrence: habit.costPerOccurrence,
              frequency_per_day: habit.frequencyPerDay,
              start_date: habit.startDate,
              last_relapse_date: habit.lastRelapseDate,
              total_relapses: habit.totalRelapses,
              longest_streak: habit.longestStreak,
              health_benefit_type: habit.healthBenefitType,
              motivation: habit.motivation,
              triggers: habit.triggers,
              coping_strategies: habit.copingStrategies,
              created_at: habit.createdAt,
            });

          if (error) console.error('Error syncing bad habit:', error);
        } catch (error) {
          console.error('Error syncing bad habit to Supabase:', error);
        }
      },

      deleteHabitFromSupabase: async (habitId) => {
        try {
          const { error } = await supabase
            .from('bad_habits')
            .delete()
            .eq('id', habitId);

          if (error) console.error('Error deleting bad habit:', error);
        } catch (error) {
          console.error('Error deleting bad habit from Supabase:', error);
        }
      },

      syncRelapseToSupabase: async (relapse) => {
        try {
          const userId = await getCurrentUserId();
          if (!userId) return;

          const { error } = await supabase
            .from('bad_habit_relapses')
            .insert({
              id: relapse.id,
              habit_id: relapse.habitId,
              user_id: userId,
              relapse_date: relapse.date,
              days_since_start: relapse.daysSinceStart,
              notes: relapse.notes,
              emotion: relapse.emotion,
            });

          if (error) console.error('Error syncing relapse:', error);
        } catch (error) {
          console.error('Error syncing relapse to Supabase:', error);
        }
      },

      // Initialize from Supabase
      initializeFromSupabase: async () => {
        set({ isLoading: true });

        try {
          const userId = await getCurrentUserId();
          if (!userId) {
            set({ isLoading: false });
            return;
          }

          // Fetch habits
          const { data: habitsData, error: habitsError } = await supabase
            .from('bad_habits')
            .select('*')
            .eq('user_id', userId);

          if (habitsError) {
            console.error('Error fetching bad habits:', habitsError);
          }

          // Fetch relapses
          const { data: relapsesData, error: relapsesError } = await supabase
            .from('bad_habit_relapses')
            .select('*')
            .eq('user_id', userId);

          if (relapsesError) {
            console.error('Error fetching relapses:', relapsesError);
          }

          if (habitsData) {
            const habits = habitsData.map(h => ({
              id: h.id,
              name: h.name,
              category: h.category,
              icon: h.icon,
              color: h.color,
              costPerOccurrence: h.cost_per_occurrence,
              frequencyPerDay: h.frequency_per_day,
              startDate: h.start_date,
              lastRelapseDate: h.last_relapse_date,
              totalRelapses: h.total_relapses,
              longestStreak: h.longest_streak,
              healthBenefitType: h.health_benefit_type,
              motivation: h.motivation,
              triggers: h.triggers || [],
              copingStrategies: h.coping_strategies || [],
              createdAt: h.created_at,
            }));

            const relapses = (relapsesData || []).map(r => ({
              id: r.id,
              habitId: r.habit_id,
              date: r.relapse_date,
              daysSinceStart: r.days_since_start,
              notes: r.notes,
              emotion: r.emotion,
            }));

            // Recalculate unlocked milestones based on current streaks
            const unlockedMilestones = {};
            habits.forEach(habit => {
              const timeSince = getTimeSince(habit.startDate);
              unlockedMilestones[habit.id] = MILESTONES
                .map((m, i) => timeSince.days >= m.days ? i : -1)
                .filter(i => i >= 0);
            });

            set({ habits, relapses, unlockedMilestones });
          }
        } catch (error) {
          console.error('Error initializing bad habits from Supabase:', error);
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'lifeos-bad-habits',
      partialize: (state) => ({
        habits: state.habits,
        relapses: state.relapses,
        unlockedMilestones: state.unlockedMilestones,
      }),
    }
  )
);

// Initialize store
export const initializeBadHabitsStore = async () => {
  await useBadHabitsStore.getState().initializeFromSupabase();
};

export default useBadHabitsStore;
