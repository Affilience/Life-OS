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

      // Calculate daily totals (includes all micronutrients)
      getDailyTotals: (date) => {
        const meals = get().getMealsForDate(date);

        const initialTotals = {
          // Macros
          calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0,
          // Fat breakdown
          saturatedFat: 0, transFat: 0, cholesterol: 0,
          // Minerals
          sodium: 0, potassium: 0, calcium: 0, iron: 0, magnesium: 0, phosphorus: 0, zinc: 0,
          // Vitamins
          vitaminA: 0, vitaminC: 0, vitaminD: 0, vitaminE: 0, vitaminK: 0,
          vitaminB6: 0, vitaminB12: 0, folate: 0,
        };

        return meals.reduce((totals, meal) => {
          // Sum macros (always present)
          totals.calories += meal.totalCalories || 0;
          totals.protein += meal.totalProtein || 0;
          totals.carbs += meal.totalCarbs || 0;
          totals.fat += meal.totalFat || 0;
          totals.fiber += meal.totalFiber || 0;
          totals.sugar += meal.totalSugar || 0;

          // Sum micronutrients if available
          totals.saturatedFat += meal.totalSaturatedFat || 0;
          totals.transFat += meal.totalTransFat || 0;
          totals.cholesterol += meal.totalCholesterol || 0;
          totals.sodium += meal.totalSodium || 0;
          totals.potassium += meal.totalPotassium || 0;
          totals.calcium += meal.totalCalcium || 0;
          totals.iron += meal.totalIron || 0;
          totals.magnesium += meal.totalMagnesium || 0;
          totals.phosphorus += meal.totalPhosphorus || 0;
          totals.zinc += meal.totalZinc || 0;
          totals.vitaminA += meal.totalVitaminA || 0;
          totals.vitaminC += meal.totalVitaminC || 0;
          totals.vitaminD += meal.totalVitaminD || 0;
          totals.vitaminE += meal.totalVitaminE || 0;
          totals.vitaminK += meal.totalVitaminK || 0;
          totals.vitaminB6 += meal.totalVitaminB6 || 0;
          totals.vitaminB12 += meal.totalVitaminB12 || 0;
          totals.folate += meal.totalFolate || 0;

          return totals;
        }, initialTotals);
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
