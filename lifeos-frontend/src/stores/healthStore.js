import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SAMPLE_MEALS, DEFAULT_DAILY_GOALS } from '../data/nutritionData';
import { useAvatarStore } from './avatarStore';

// Supplement interaction warnings
const SUPPLEMENT_INTERACTIONS = {
  'calcium': ['iron', 'zinc', 'magnesium'], // Calcium blocks absorption of these
  'iron': ['calcium', 'zinc'], // Iron competes with these
  'zinc': ['copper', 'iron', 'calcium'], // Zinc blocks copper absorption
  'magnesium': ['calcium'], // Best taken separately from calcium
  'vitamin-d': [], // Generally safe, enhances calcium absorption
  'vitamin-c': [], // Generally safe, enhances iron absorption
  'vitamin-k': ['blood-thinners'], // Interacts with blood thinners
  'fish-oil': ['blood-thinners'], // May increase bleeding risk
  'vitamin-b12': [], // Generally safe
  'folate': [], // Generally safe
};

// Optimal timing recommendations
const SUPPLEMENT_TIMING = {
  'vitamin-d': { optimal: 'morning', withFood: true, reason: 'Fat-soluble, best absorbed with breakfast fats' },
  'iron': { optimal: 'morning', withFood: false, reason: 'Best absorbed on empty stomach, avoid with calcium' },
  'calcium': { optimal: 'evening', withFood: true, reason: 'Supports bone health overnight' },
  'magnesium': { optimal: 'evening', withFood: false, reason: 'Promotes relaxation and sleep' },
  'zinc': { optimal: 'evening', withFood: true, reason: 'Can cause nausea on empty stomach' },
  'fish-oil': { optimal: 'morning', withFood: true, reason: 'Fat-soluble, reduces fishy aftertaste with food' },
  'vitamin-c': { optimal: 'morning', withFood: false, reason: 'Water-soluble, enhances iron absorption' },
  'vitamin-b12': { optimal: 'morning', withFood: false, reason: 'May provide energy, water-soluble' },
  'probiotics': { optimal: 'morning', withFood: false, reason: 'Best on empty stomach for gut colonization' },
  'melatonin': { optimal: 'evening', withFood: false, reason: 'Take 30 mins before bed' },
  'creatine': { optimal: 'any', withFood: true, reason: 'Timing less important, consistency matters' },
  'protein': { optimal: 'any', withFood: false, reason: 'Post-workout or as needed' },
};

export const useHealthStore = create(
  persist(
    (set, get) => ({
      // User settings
      dailyGoals: DEFAULT_DAILY_GOALS,

      // Custom micronutrient goals (null means use FDA defaults)
      micronutrientGoals: null, // { sodium: 2300, potassium: 4700, ... }

      // Meals data
      meals: SAMPLE_MEALS,

      // ============ RECIPE LIBRARY ============
      recipes: [],

      // ============ MEAL PLANNING ============
      mealPlans: {}, // { [weekKey]: { monday: { breakfast: recipeId, ... }, ... } }
      currentMealPlanWeek: null,

      // ============ GROCERY LIST ============
      groceryItems: [], // { id, name, quantity, unit, category, checked, fromRecipeId? }

      // ============ SUPPLEMENTS ============
      supplements: [], // User's supplement library
      supplementStacks: [], // Predefined stacks (morning, evening, workout, etc.)
      supplementLog: {}, // { [date]: { [supplementId]: { taken: boolean, time: string } } }

      // Water intake - stored in ml for flexibility
      // User can track in any unit (ml, oz, glasses, bottles) - all converted to ml
      waterIntake: {}, // { [date]: { amount: number (ml), goal: number (ml) } }
      waterGoalMl: 2000, // Default: 2000ml (~8 glasses / ~68oz)
      waterUnit: 'ml', // 'ml', 'oz', 'glasses', 'bottles'
      waterContainerMl: 500, // Size of user's container in ml (for bottle tracking)

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

      // Water intake actions - all stored in ml internally
      // Adds water in ml (or converts from user's preferred unit)
      addWater: (amount = null) => {
        const { selectedDate, waterIntake, waterGoalMl, waterContainerMl } = get();
        const current = waterIntake[selectedDate]?.amount || 0;
        // Default to adding one container's worth
        const mlToAdd = amount !== null ? amount : waterContainerMl;

        set((state) => ({
          waterIntake: {
            ...state.waterIntake,
            [selectedDate]: { amount: current + mlToAdd, goal: waterGoalMl }
          }
        }));

        // Award XP for hitting water goal
        if (current < waterGoalMl && current + mlToAdd >= waterGoalMl) {
          const avatarStore = useAvatarStore.getState();
          avatarStore.addXP(5);
        }
      },

      removeWater: (amount = null) => {
        const { selectedDate, waterIntake, waterGoalMl, waterContainerMl } = get();
        const current = waterIntake[selectedDate]?.amount || 0;
        const mlToRemove = amount !== null ? amount : waterContainerMl;

        set((state) => ({
          waterIntake: {
            ...state.waterIntake,
            [selectedDate]: { amount: Math.max(0, current - mlToRemove), goal: waterGoalMl }
          }
        }));
      },

      // Add a specific amount with quick presets
      addWaterAmount: (ml) => {
        get().addWater(ml);
      },

      getWaterForDate: (date) => {
        const state = get();
        const data = state.waterIntake[date] || { amount: 0, goal: state.waterGoalMl };
        return {
          amount: data.amount,
          goal: state.waterGoalMl,
          percentage: Math.round((data.amount / state.waterGoalMl) * 100),
          // Convert to display units
          displayAmount: state.convertMlToUnit(data.amount),
          displayGoal: state.convertMlToUnit(state.waterGoalMl),
          unit: state.waterUnit,
          containerMl: state.waterContainerMl,
        };
      },

      // Convert ml to user's preferred unit
      convertMlToUnit: (ml) => {
        const { waterUnit, waterContainerMl } = get();
        switch (waterUnit) {
          case 'oz': return Math.round(ml / 29.574); // 1 oz = 29.574 ml
          case 'glasses': return Math.round(ml / 240); // 1 glass = 240ml (8oz)
          case 'bottles': return Math.round((ml / waterContainerMl) * 10) / 10; // Based on container size
          default: return ml; // ml
        }
      },

      // Convert user's unit to ml
      convertUnitToMl: (value, unit = null) => {
        const { waterUnit, waterContainerMl } = get();
        const targetUnit = unit || waterUnit;
        switch (targetUnit) {
          case 'oz': return Math.round(value * 29.574);
          case 'glasses': return Math.round(value * 240);
          case 'bottles': return Math.round(value * waterContainerMl);
          default: return value; // ml
        }
      },

      setWaterSettings: ({ goalMl, unit, containerMl }) => {
        const updates = {};
        if (goalMl !== undefined) updates.waterGoalMl = goalMl;
        if (unit !== undefined) updates.waterUnit = unit;
        if (containerMl !== undefined) updates.waterContainerMl = containerMl;
        set(updates);
      },

      // Legacy compatibility
      setWaterGoal: (goal) => set({ waterGoalMl: goal }),

      // UI actions
      setSelectedDate: (date) => set({ selectedDate: date }),
      setIsAddingMeal: (value) => set({ isAddingMeal: value }),

      // Update daily goals
      updateDailyGoals: (goals) => {
        set({ dailyGoals: { ...get().dailyGoals, ...goals } });
      },

      // Update micronutrient goals
      updateMicronutrientGoals: (goals) => {
        set({ micronutrientGoals: { ...get().micronutrientGoals, ...goals } });
      },

      // Reset micronutrient goals to FDA defaults
      resetMicronutrientGoals: () => {
        set({ micronutrientGoals: null });
      },

      // Get effective micronutrient goal (custom or FDA default)
      getMicronutrientGoal: (key, fdaDefault) => {
        const { micronutrientGoals } = get();
        return micronutrientGoals?.[key] ?? fdaDefault;
      },

      // ============ RECIPE ACTIONS ============

      addRecipe: (recipeData) => {
        const newRecipe = {
          id: `recipe-${Date.now()}`,
          createdAt: new Date().toISOString(),
          ...recipeData,
        };

        set((state) => ({
          recipes: [newRecipe, ...state.recipes],
        }));

        // Award XP for creating a recipe
        const avatarStore = useAvatarStore.getState();
        avatarStore.addXP(10);

        return newRecipe.id;
      },

      updateRecipe: (id, updates) => {
        set((state) => ({
          recipes: state.recipes.map((recipe) =>
            recipe.id === id ? { ...recipe, ...updates, updatedAt: new Date().toISOString() } : recipe
          ),
        }));
      },

      deleteRecipe: (id) => {
        set((state) => ({
          recipes: state.recipes.filter((recipe) => recipe.id !== id),
        }));
      },

      getRecipeById: (id) => {
        return get().recipes.find((recipe) => recipe.id === id);
      },

      getRecipesByCategory: (category) => {
        if (!category || category === 'all') return get().recipes;
        return get().recipes.filter((recipe) => recipe.category === category);
      },

      // ============ MEAL PLANNING ACTIONS ============

      getWeekKey: (date) => {
        const d = new Date(date);
        const dayOfWeek = d.getDay();
        const monday = new Date(d);
        monday.setDate(d.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
        return monday.toISOString().split('T')[0];
      },

      getMealPlanForWeek: (weekKey) => {
        return get().mealPlans[weekKey] || {};
      },

      setMealInPlan: (weekKey, day, mealType, recipeId) => {
        set((state) => {
          const weekPlan = state.mealPlans[weekKey] || {};
          const dayPlan = weekPlan[day] || {};

          return {
            mealPlans: {
              ...state.mealPlans,
              [weekKey]: {
                ...weekPlan,
                [day]: {
                  ...dayPlan,
                  [mealType]: recipeId,
                },
              },
            },
          };
        });
      },

      removeMealFromPlan: (weekKey, day, mealType) => {
        set((state) => {
          const weekPlan = { ...state.mealPlans[weekKey] };
          if (weekPlan[day]) {
            const dayPlan = { ...weekPlan[day] };
            delete dayPlan[mealType];
            weekPlan[day] = dayPlan;
          }

          return {
            mealPlans: {
              ...state.mealPlans,
              [weekKey]: weekPlan,
            },
          };
        });
      },

      copyMealPlanToWeek: (fromWeekKey, toWeekKey) => {
        const fromPlan = get().mealPlans[fromWeekKey];
        if (!fromPlan) return;

        set((state) => ({
          mealPlans: {
            ...state.mealPlans,
            [toWeekKey]: { ...fromPlan },
          },
        }));

        // Award XP for planning ahead
        const avatarStore = useAvatarStore.getState();
        avatarStore.addXP(5);
      },

      // ============ GROCERY LIST ACTIONS ============

      generateGroceryList: (weekKey) => {
        const mealPlan = get().mealPlans[weekKey];
        if (!mealPlan) return;

        const ingredientMap = new Map();

        // Iterate through all days and meals
        Object.values(mealPlan).forEach((dayPlan) => {
          Object.values(dayPlan).forEach((recipeId) => {
            const recipe = get().getRecipeById(recipeId);
            if (recipe && recipe.ingredients) {
              recipe.ingredients.forEach((ingredient) => {
                const key = `${ingredient.name.toLowerCase()}-${ingredient.unit || 'unit'}`;
                const existing = ingredientMap.get(key);
                if (existing) {
                  existing.quantity += ingredient.quantity || 1;
                } else {
                  ingredientMap.set(key, {
                    id: `grocery-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    name: ingredient.name,
                    quantity: ingredient.quantity || 1,
                    unit: ingredient.unit || 'unit',
                    category: ingredient.category || 'other',
                    checked: false,
                    fromRecipeIds: [recipeId],
                  });
                }
              });
            }
          });
        });

        const groceryItems = Array.from(ingredientMap.values());
        set({ groceryItems });

        return groceryItems;
      },

      addGroceryItem: (item) => {
        const newItem = {
          id: `grocery-${Date.now()}`,
          checked: false,
          ...item,
        };

        set((state) => ({
          groceryItems: [...state.groceryItems, newItem],
        }));

        return newItem.id;
      },

      updateGroceryItem: (id, updates) => {
        set((state) => ({
          groceryItems: state.groceryItems.map((item) =>
            item.id === id ? { ...item, ...updates } : item
          ),
        }));
      },

      toggleGroceryItem: (id) => {
        set((state) => ({
          groceryItems: state.groceryItems.map((item) =>
            item.id === id ? { ...item, checked: !item.checked } : item
          ),
        }));
      },

      deleteGroceryItem: (id) => {
        set((state) => ({
          groceryItems: state.groceryItems.filter((item) => item.id !== id),
        }));
      },

      clearCheckedGroceryItems: () => {
        set((state) => ({
          groceryItems: state.groceryItems.filter((item) => !item.checked),
        }));
      },

      clearAllGroceryItems: () => {
        set({ groceryItems: [] });
      },

      // ============ SUPPLEMENT ACTIONS ============

      addSupplement: (supplementData) => {
        const newSupplement = {
          id: `supplement-${Date.now()}`,
          createdAt: new Date().toISOString(),
          ...supplementData,
        };

        set((state) => ({
          supplements: [...state.supplements, newSupplement],
        }));

        // Award XP for tracking supplements
        const avatarStore = useAvatarStore.getState();
        avatarStore.addXP(5);

        return newSupplement.id;
      },

      updateSupplement: (id, updates) => {
        set((state) => ({
          supplements: state.supplements.map((supplement) =>
            supplement.id === id ? { ...supplement, ...updates } : supplement
          ),
        }));
      },

      deleteSupplement: (id) => {
        set((state) => ({
          supplements: state.supplements.filter((supplement) => supplement.id !== id),
          // Also remove from all stacks
          supplementStacks: state.supplementStacks.map((stack) => ({
            ...stack,
            supplementIds: stack.supplementIds.filter((sid) => sid !== id),
          })),
        }));
      },

      // Supplement stacks
      addSupplementStack: (stackData) => {
        const newStack = {
          id: `stack-${Date.now()}`,
          ...stackData,
        };

        set((state) => ({
          supplementStacks: [...state.supplementStacks, newStack],
        }));

        return newStack.id;
      },

      updateSupplementStack: (id, updates) => {
        set((state) => ({
          supplementStacks: state.supplementStacks.map((stack) =>
            stack.id === id ? { ...stack, ...updates } : stack
          ),
        }));
      },

      deleteSupplementStack: (id) => {
        set((state) => ({
          supplementStacks: state.supplementStacks.filter((stack) => stack.id !== id),
        }));
      },

      addSupplementToStack: (stackId, supplementId) => {
        set((state) => ({
          supplementStacks: state.supplementStacks.map((stack) =>
            stack.id === stackId
              ? { ...stack, supplementIds: [...(stack.supplementIds || []), supplementId] }
              : stack
          ),
        }));
      },

      removeSupplementFromStack: (stackId, supplementId) => {
        set((state) => ({
          supplementStacks: state.supplementStacks.map((stack) =>
            stack.id === stackId
              ? { ...stack, supplementIds: (stack.supplementIds || []).filter((id) => id !== supplementId) }
              : stack
          ),
        }));
      },

      // Supplement logging
      logSupplementTaken: (supplementId, date = null) => {
        const logDate = date || get().selectedDate;
        const now = new Date();

        set((state) => ({
          supplementLog: {
            ...state.supplementLog,
            [logDate]: {
              ...state.supplementLog[logDate],
              [supplementId]: {
                taken: true,
                time: now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
              },
            },
          },
        }));

        // Award XP for consistency
        const avatarStore = useAvatarStore.getState();
        avatarStore.addXP(2);
      },

      unlogSupplementTaken: (supplementId, date = null) => {
        const logDate = date || get().selectedDate;

        set((state) => ({
          supplementLog: {
            ...state.supplementLog,
            [logDate]: {
              ...state.supplementLog[logDate],
              [supplementId]: {
                taken: false,
                time: null,
              },
            },
          },
        }));
      },

      isSupplementTaken: (supplementId, date = null) => {
        const logDate = date || get().selectedDate;
        return get().supplementLog[logDate]?.[supplementId]?.taken || false;
      },

      getSupplementsForDate: (date) => {
        return get().supplementLog[date] || {};
      },

      getSupplementStats: () => {
        const { supplements, supplementLog } = get();
        const today = new Date().toISOString().split('T')[0];
        const todayLog = supplementLog[today] || {};

        const totalSupplements = supplements.length;
        const takenToday = Object.values(todayLog).filter((log) => log.taken).length;

        // Calculate streak
        let streak = 0;
        const checkDate = new Date();
        while (true) {
          const dateKey = checkDate.toISOString().split('T')[0];
          const dayLog = supplementLog[dateKey] || {};
          const allTaken = supplements.length > 0 && supplements.every(
            (s) => dayLog[s.id]?.taken
          );
          if (allTaken) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
          } else {
            break;
          }
        }

        return {
          totalSupplements,
          takenToday,
          completionRate: totalSupplements > 0 ? Math.round((takenToday / totalSupplements) * 100) : 0,
          streak,
        };
      },

      // Get interaction warnings for supplements taken together
      getSupplementInteractions: (supplementIds) => {
        const supplements = get().supplements.filter((s) => supplementIds.includes(s.id));
        const warnings = [];

        supplements.forEach((supp1) => {
          const type1 = supp1.type?.toLowerCase().replace(/\s+/g, '-');
          const interactions = SUPPLEMENT_INTERACTIONS[type1] || [];

          supplements.forEach((supp2) => {
            if (supp1.id === supp2.id) return;
            const type2 = supp2.type?.toLowerCase().replace(/\s+/g, '-');

            if (interactions.includes(type2)) {
              warnings.push({
                supplement1: supp1.name,
                supplement2: supp2.name,
                warning: `${supp1.name} may reduce absorption of ${supp2.name}. Consider taking at different times.`,
              });
            }
          });
        });

        // Remove duplicates
        const uniqueWarnings = warnings.filter(
          (w, i, arr) =>
            arr.findIndex(
              (w2) =>
                (w2.supplement1 === w.supplement1 && w2.supplement2 === w.supplement2) ||
                (w2.supplement1 === w.supplement2 && w2.supplement2 === w.supplement1)
            ) === i
        );

        return uniqueWarnings;
      },

      // Get timing recommendation for a supplement
      getSupplementTiming: (supplementType) => {
        const type = supplementType?.toLowerCase().replace(/\s+/g, '-');
        return SUPPLEMENT_TIMING[type] || { optimal: 'any', withFood: true, reason: 'No specific timing required' };
      },
    }),
    {
      name: 'lifeos-health',
    }
  )
);

// Export constants for use in components
export { SUPPLEMENT_INTERACTIONS, SUPPLEMENT_TIMING };
