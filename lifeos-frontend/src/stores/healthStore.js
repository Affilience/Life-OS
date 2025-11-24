import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SAMPLE_MEALS, DEFAULT_DAILY_GOALS } from '../data/nutritionData';
import { useAvatarStore } from './avatarStore';

export const useHealthStore = create(
  persist(
    (set, get) => ({
      // User settings
      dailyGoals: DEFAULT_DAILY_GOALS,

      // Meals data
      meals: SAMPLE_MEALS,

      // UI state
      selectedDate: new Date().toISOString().split('T')[0], // YYYY-MM-DD
      isAddingMeal: false,

      // Actions

      // Add a new meal
      addMeal: (mealData) => {
        const newMeal = {
          id: `meal-${Date.now()}`,
          timestamp: new Date().toISOString(),
          ...mealData,
        };

        set((state) => ({
          meals: [newMeal, ...state.meals],
          isAddingMeal: false,
        }));

        // Award XP for logging a meal
        // Base XP: 5 for tracking nutrition
        // Bonus: 5 XP if protein goal is met
        // Bonus: 5 XP if within calorie goals (±10%)
        const { dailyGoals } = get();
        let xpEarned = 5; // Base tracking XP

        if (mealData.protein && mealData.protein >= dailyGoals.protein * 0.25) {
          xpEarned += 3; // Good protein per meal
        }

        // Add XP to avatar
        const avatarStore = useAvatarStore.getState();
        avatarStore.addXP(xpEarned);
        avatarStore.updateModuleProgress('nutrition', { mealsLogged: 1 });

        return newMeal.id;
      },

      // Update existing meal
      updateMeal: (id, updates) => {
        set((state) => ({
          meals: state.meals.map((meal) =>
            meal.id === id ? { ...meal, ...updates } : meal
          ),
        }));
      },

      // Delete meal
      deleteMeal: (id) => {
        set((state) => ({
          meals: state.meals.filter((meal) => meal.id !== id),
        }));
      },

      // Get meals for specific date
      getMealsForDate: (date) => {
        const state = get();
        return state.meals.filter((meal) =>
          meal.timestamp.startsWith(date)
        );
      },

      // Calculate daily totals
      getDailyTotals: (date) => {
        const meals = get().getMealsForDate(date);

        return meals.reduce(
          (totals, meal) => ({
            calories: totals.calories + meal.totalCalories,
            protein: totals.protein + meal.totalProtein,
            carbs: totals.carbs + meal.totalCarbs,
            fat: totals.fat + meal.totalFat,
          }),
          { calories: 0, protein: 0, carbs: 0, fat: 0 }
        );
      },

      // UI actions
      setSelectedDate: (date) => set({ selectedDate: date }),
      setIsAddingMeal: (value) => set({ isAddingMeal: value }),

      // Update daily goals
      updateDailyGoals: (goals) => {
        set({ dailyGoals: { ...get().dailyGoals, ...goals } });
      },
    }),
    {
      name: 'lifeos-health',
    }
  )
);
