import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import { DEV_USER_ID } from '../lib/dev-auth';

/**
 * Custom Streaks Store
 *
 * Allows users to create their own habit streaks to track,
 * separate from the automatic system-tracked momentum chains.
 */

// Predefined icons for custom streaks
export const STREAK_ICONS = [
  { id: 'workout', emoji: '💪', label: 'Workout' },
  { id: 'meditation', emoji: '🧘', label: 'Meditation' },
  { id: 'reading', emoji: '📚', label: 'Reading' },
  { id: 'water', emoji: '💧', label: 'Water' },
  { id: 'sleep', emoji: '😴', label: 'Sleep' },
  { id: 'journal', emoji: '📝', label: 'Journal' },
  { id: 'walk', emoji: '🚶', label: 'Walking' },
  { id: 'coding', emoji: '💻', label: 'Coding' },
  { id: 'music', emoji: '🎵', label: 'Music' },
  { id: 'art', emoji: '🎨', label: 'Art' },
  { id: 'language', emoji: '🌍', label: 'Language' },
  { id: 'cooking', emoji: '🍳', label: 'Cooking' },
  { id: 'cleaning', emoji: '🧹', label: 'Cleaning' },
  { id: 'gratitude', emoji: '🙏', label: 'Gratitude' },
  { id: 'stretch', emoji: '🤸', label: 'Stretching' },
  { id: 'vitamins', emoji: '💊', label: 'Vitamins' },
  { id: 'skincare', emoji: '✨', label: 'Skincare' },
  { id: 'budget', emoji: '💰', label: 'Budget' },
  { id: 'social', emoji: '👥', label: 'Social' },
  { id: 'nature', emoji: '🌲', label: 'Nature' },
  { id: 'phone', emoji: '📵', label: 'Screen Free' },
  { id: 'early', emoji: '🌅', label: 'Early Rise' },
  { id: 'learn', emoji: '🎓', label: 'Learning' },
  { id: 'star', emoji: '⭐', label: 'Custom' },
];

// Color options for streaks
export const STREAK_COLORS = [
  { id: 'purple', value: '#8b5cf6', gradient: 'from-purple-500 to-pink-500' },
  { id: 'blue', value: '#3b82f6', gradient: 'from-blue-500 to-cyan-500' },
  { id: 'green', value: '#22c55e', gradient: 'from-green-500 to-emerald-500' },
  { id: 'orange', value: '#f59e0b', gradient: 'from-orange-500 to-amber-500' },
  { id: 'red', value: '#ef4444', gradient: 'from-red-500 to-rose-500' },
  { id: 'teal', value: '#14b8a6', gradient: 'from-teal-500 to-cyan-500' },
  { id: 'pink', value: '#ec4899', gradient: 'from-pink-500 to-rose-500' },
  { id: 'indigo', value: '#6366f1', gradient: 'from-indigo-500 to-purple-500' },
];

// Frequency options
export const STREAK_FREQUENCIES = [
  { id: 'daily', label: 'Daily', description: 'Track every day' },
  { id: 'weekdays', label: 'Weekdays', description: 'Monday to Friday' },
  { id: 'weekends', label: 'Weekends', description: 'Saturday and Sunday' },
  { id: 'custom', label: 'Custom Days', description: 'Choose specific days' },
];

const useCustomStreaksStore = create(
  persist(
    (set, get) => ({
      // State
      streaks: [],
      completions: [], // { streakId, date, completedAt }
      isLoading: false,
      initialized: false,

      // Initialize from Supabase
      initialize: async () => {
        const userId = DEV_USER_ID;
        set({ isLoading: true });

        try {
          // Fetch custom streaks
          const { data: streaks, error } = await supabase
            .from('custom_streaks')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

          if (error && error.code !== 'PGRST116') {
            console.error('Error fetching custom streaks:', error);
          }

          // Fetch recent completions (last 365 days)
          const startDate = new Date();
          startDate.setDate(startDate.getDate() - 365);

          const { data: completions, error: compError } = await supabase
            .from('custom_streak_completions')
            .select('*')
            .eq('user_id', userId)
            .gte('completed_date', startDate.toISOString().split('T')[0]);

          if (compError && compError.code !== 'PGRST116') {
            console.error('Error fetching completions:', compError);
          }

          set({
            streaks: streaks || [],
            completions: completions || [],
            isLoading: false,
            initialized: true,
          });
        } catch (err) {
          console.error('Error initializing custom streaks:', err);
          set({ isLoading: false, initialized: true });
        }
      },

      // Create a new custom streak
      createStreak: async ({ name, icon, color, frequency, customDays, goal, description }) => {
        const userId = DEV_USER_ID;
        set({ isLoading: true });

        try {
          const newStreak = {
            user_id: userId,
            name,
            icon: icon || '⭐',
            color: color || 'purple',
            frequency: frequency || 'daily',
            custom_days: customDays || null,
            goal: goal || null,
            description: description || null,
            current_streak: 0,
            longest_streak: 0,
            total_completions: 0,
            created_at: new Date().toISOString(),
          };

          const { data, error } = await supabase
            .from('custom_streaks')
            .insert(newStreak)
            .select()
            .single();

          if (error) {
            // If table doesn't exist, store locally
            if (error.code === '42P01') {
              const localStreak = {
                ...newStreak,
                id: `local-${Date.now()}`,
              };
              set(state => ({
                streaks: [localStreak, ...state.streaks],
                isLoading: false,
              }));
              return { success: true, streak: localStreak };
            }
            throw error;
          }

          set(state => ({
            streaks: [data, ...state.streaks],
            isLoading: false,
          }));

          return { success: true, streak: data };
        } catch (err) {
          console.error('Error creating streak:', err);
          set({ isLoading: false });
          return { success: false, error: err.message };
        }
      },

      // Log completion for a streak
      logCompletion: async (streakId, date = null) => {
        const userId = DEV_USER_ID;
        const { streaks, completions } = get();
        const completionDate = date || new Date().toISOString().split('T')[0];

        // Check if already completed today
        const existingCompletion = completions.find(
          c => c.streak_id === streakId && c.completed_date === completionDate
        );

        if (existingCompletion) {
          return { success: false, error: 'Already completed today' };
        }

        try {
          const completion = {
            user_id: userId,
            streak_id: streakId,
            completed_date: completionDate,
            completed_at: new Date().toISOString(),
          };

          const { data, error } = await supabase
            .from('custom_streak_completions')
            .insert(completion)
            .select()
            .single();

          if (error && error.code !== '42P01') {
            throw error;
          }

          // Calculate new streak
          const streak = streaks.find(s => s.id === streakId);
          if (streak) {
            const newCurrentStreak = get().calculateCurrentStreak(streakId);
            const newLongestStreak = Math.max(streak.longest_streak || 0, newCurrentStreak + 1);

            // Update streak stats
            await supabase
              .from('custom_streaks')
              .update({
                current_streak: newCurrentStreak + 1,
                longest_streak: newLongestStreak,
                total_completions: (streak.total_completions || 0) + 1,
                last_completed_at: new Date().toISOString(),
              })
              .eq('id', streakId);

            set(state => ({
              streaks: state.streaks.map(s =>
                s.id === streakId
                  ? {
                      ...s,
                      current_streak: newCurrentStreak + 1,
                      longest_streak: newLongestStreak,
                      total_completions: (s.total_completions || 0) + 1,
                    }
                  : s
              ),
              completions: [...state.completions, data || completion],
            }));
          }

          return { success: true };
        } catch (err) {
          console.error('Error logging completion:', err);
          return { success: false, error: err.message };
        }
      },

      // Undo completion for today
      undoCompletion: async (streakId, date = null) => {
        const userId = DEV_USER_ID;
        const completionDate = date || new Date().toISOString().split('T')[0];

        try {
          await supabase
            .from('custom_streak_completions')
            .delete()
            .eq('user_id', userId)
            .eq('streak_id', streakId)
            .eq('completed_date', completionDate);

          set(state => ({
            completions: state.completions.filter(
              c => !(c.streak_id === streakId && c.completed_date === completionDate)
            ),
          }));

          // Recalculate streak
          const newStreak = get().calculateCurrentStreak(streakId);
          set(state => ({
            streaks: state.streaks.map(s =>
              s.id === streakId ? { ...s, current_streak: newStreak } : s
            ),
          }));

          return { success: true };
        } catch (err) {
          console.error('Error undoing completion:', err);
          return { success: false, error: err.message };
        }
      },

      // Calculate current streak for a habit
      calculateCurrentStreak: (streakId) => {
        const { completions, streaks } = get();
        const streak = streaks.find(s => s.id === streakId);
        if (!streak) return 0;

        const streakCompletions = completions
          .filter(c => c.streak_id === streakId)
          .map(c => c.completed_date)
          .sort((a, b) => new Date(b) - new Date(a));

        if (streakCompletions.length === 0) return 0;

        let currentStreak = 0;
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        // Start from today or yesterday
        let checkDate = streakCompletions[0] === today ? today :
                        streakCompletions[0] === yesterdayStr ? yesterdayStr : null;

        if (!checkDate) return 0;

        // Count consecutive days
        const checkDateObj = new Date(checkDate);
        for (let i = 0; i < streakCompletions.length; i++) {
          const expectedDate = new Date(checkDateObj);
          expectedDate.setDate(expectedDate.getDate() - i);
          const expectedDateStr = expectedDate.toISOString().split('T')[0];

          if (streakCompletions.includes(expectedDateStr)) {
            currentStreak++;
          } else {
            break;
          }
        }

        return currentStreak;
      },

      // Check if a streak is completed for a specific date
      isCompletedForDate: (streakId, date) => {
        const { completions } = get();
        return completions.some(
          c => c.streak_id === streakId && c.completed_date === date
        );
      },

      // Get completions for a streak (for heatmap/calendar)
      getCompletionsForStreak: (streakId) => {
        const { completions } = get();
        return completions.filter(c => c.streak_id === streakId);
      },

      // Get week data for a streak (last 7 days)
      getWeekData: (streakId) => {
        const { completions } = get();
        const weekData = [];

        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];
          weekData.push(completions.some(
            c => c.streak_id === streakId && c.completed_date === dateStr
          ));
        }

        return weekData;
      },

      // Delete a streak
      deleteStreak: async (streakId) => {
        try {
          await supabase
            .from('custom_streaks')
            .delete()
            .eq('id', streakId);

          await supabase
            .from('custom_streak_completions')
            .delete()
            .eq('streak_id', streakId);

          set(state => ({
            streaks: state.streaks.filter(s => s.id !== streakId),
            completions: state.completions.filter(c => c.streak_id !== streakId),
          }));

          return { success: true };
        } catch (err) {
          console.error('Error deleting streak:', err);
          return { success: false, error: err.message };
        }
      },

      // Update streak settings
      updateStreak: async (streakId, updates) => {
        try {
          const { error } = await supabase
            .from('custom_streaks')
            .update(updates)
            .eq('id', streakId);

          if (error && error.code !== '42P01') {
            throw error;
          }

          set(state => ({
            streaks: state.streaks.map(s =>
              s.id === streakId ? { ...s, ...updates } : s
            ),
          }));

          return { success: true };
        } catch (err) {
          console.error('Error updating streak:', err);
          return { success: false, error: err.message };
        }
      },

      // Get all data for heatmap (365 days)
      getHeatmapData: (streakId = null) => {
        const { completions } = get();
        const data = [];
        const today = new Date();

        // Build map of completions by date
        const completionMap = {};
        const filteredCompletions = streakId
          ? completions.filter(c => c.streak_id === streakId)
          : completions;

        filteredCompletions.forEach(c => {
          completionMap[c.completed_date] = (completionMap[c.completed_date] || 0) + 1;
        });

        // Generate 365 days
        for (let i = 0; i < 365; i++) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];
          data.push({
            date: dateStr,
            value: completionMap[dateStr] || 0,
          });
        }

        return data;
      },
    }),
    {
      name: 'custom-streaks-storage',
      partialize: (state) => ({
        streaks: state.streaks,
        completions: state.completions,
      }),
    }
  )
);

export default useCustomStreaksStore;
