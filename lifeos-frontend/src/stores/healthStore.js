import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase, getCurrentUserId } from '../lib/supabase';
import { DEFAULT_DAILY_GOALS } from '../data/nutritionData';
import { useAvatarStore } from './avatarStore';
import { triggerGamification } from '../hooks/useGamification';

// Supplement interaction warnings
const SUPPLEMENT_INTERACTIONS = {
  'calcium': ['iron', 'zinc', 'magnesium'],
  'iron': ['calcium', 'zinc'],
  'zinc': ['copper', 'iron', 'calcium'],
  'magnesium': ['calcium'],
  'vitamin-d': [],
  'vitamin-c': [],
  'vitamin-k': ['blood-thinners'],
  'fish-oil': ['blood-thinners'],
  'vitamin-b12': [],
  'folate': [],
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

// Default state
const DEFAULT_STATE = {
  dailyGoals: DEFAULT_DAILY_GOALS,
  micronutrientGoals: null,
  meals: [],
  recipes: [],
  mealPlans: {},
  currentMealPlanWeek: null,
  supplements: [],
  supplementStacks: [],
  supplementLog: {},
  waterIntake: {},
  waterGoalMl: 2000,
  waterUnit: 'ml',
  waterContainerMl: 500,
  selectedDate: new Date().toISOString().split('T')[0],
  isAddingMeal: false,
  // Favorite meals for quick re-logging
  favoriteMeals: [],
};

export const useHealthStore = create(
  persist(
    (set, get) => ({
      ...DEFAULT_STATE,

      // Sync status
      _isSyncing: false,
      _lastSyncedAt: null,
      _syncError: null,

      // Sync meal plans to Supabase
      syncMealPlansToSupabase: async () => {
        const userId = await getCurrentUserId();
        if (!userId) return;

        try {
          const state = get();
          await supabase
            .from('user_profiles')
            .update({ meal_plans: state.mealPlans })
            .eq('id', userId);
        } catch (error) {
          console.error('Error syncing meal plans to Supabase:', error);
        }
      },

      // Sync supplement stacks to Supabase
      syncSupplementStacksToSupabase: async () => {
        const userId = await getCurrentUserId();
        if (!userId) return;

        try {
          const state = get();
          await supabase
            .from('user_profiles')
            .update({ supplement_stacks: state.supplementStacks })
            .eq('id', userId);
        } catch (error) {
          console.error('Error syncing supplement stacks to Supabase:', error);
        }
      },

      // Initialize from Supabase
      initializeFromSupabase: async (passedUserId = null) => {
        console.log('[HealthStore] Initializing...');
        const userId = passedUserId || await getCurrentUserId();
        if (!userId) {
          console.log('[HealthStore] No user ID, skipping');
          return;
        }

        set({ _isSyncing: true, _syncError: null });

        // Master timeout - ensure syncing is set to false even if queries hang
        const INIT_TIMEOUT_MS = 15000;
        let timedOut = false;
        const timeoutId = setTimeout(() => {
          timedOut = true;
          set({ _isSyncing: false });
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
          const today = new Date().toISOString().split('T')[0];

          // Run ALL queries in parallel for faster initialization
          const [
            { data: profile },
            { data: nutritionLogs },
            { data: recipes },
            { data: supplements },
            { data: waterLog }
          ] = await Promise.all([
            withTimeout(supabase
              .from('user_profiles')
              .select('health_settings, meal_plans, supplement_stacks')
              .eq('id', userId)
              .maybeSingle()),
            withTimeout(supabase
              .from('health_nutrition_logs')
              .select('*')
              .eq('user_id', userId)
              .order('meal_timestamp', { ascending: false })
              .limit(100)),
            withTimeout(supabase
              .from('health_recipes')
              .select('*')
              .eq('user_id', userId)
              .order('created_at', { ascending: false })
              .limit(100)),
            withTimeout(supabase
              .from('health_supplements')
              .select('*')
              .eq('user_id', userId)
              .eq('is_active', true)),
            withTimeout(supabase
              .from('health_water_logs')
              .select('*')
              .eq('user_id', userId)
              .eq('log_date', today)
              .maybeSingle())
          ]);

          // Process profile data
          if (profile?.health_settings) {
            const settings = profile.health_settings;
            set({
              dailyGoals: settings.dailyGoals || DEFAULT_DAILY_GOALS,
              micronutrientGoals: settings.micronutrientGoals,
              waterUnit: settings.waterUnit || 'ml',
              waterContainerMl: settings.waterContainerMl || 500,
              waterGoalMl: settings.dailyGoals?.water || 2000,
            });
          }
          if (profile?.meal_plans) {
            set({ mealPlans: profile.meal_plans });
          }
          if (profile?.supplement_stacks) {
            set({ supplementStacks: profile.supplement_stacks });
          }

          // Process nutrition logs
          if (nutritionLogs) {
            const meals = nutritionLogs.map(log => ({
              id: log.id,
              timestamp: log.meal_timestamp,
              type: log.meal_type,
              items: log.food_items || [],
              totalCalories: log.total_calories || 0,
              totalProtein: log.total_protein || 0,
              totalCarbs: log.total_carbs || 0,
              totalFat: log.total_fat || 0,
              notes: log.notes,
            }));
            set({ meals });
          }

          // Process recipes
          if (recipes) {
            const formattedRecipes = recipes.map(r => ({
              id: r.id,
              name: r.name,
              description: r.description,
              servings: r.servings,
              prepTime: r.prep_time_minutes,
              cookTime: r.cook_time_minutes,
              ingredients: r.ingredients || [],
              instructions: r.instructions || [],
              nutritionPerServing: r.nutrition_per_serving || {},
              tags: r.tags || [],
              imageUrl: r.image_url,
              isFavorite: r.is_favorite,
              timesMade: r.times_made,
              lastMadeAt: r.last_made_at,
              sourceUrl: r.source_url,
              createdAt: r.created_at,
            }));
            set({ recipes: formattedRecipes });
          }

          // Process supplements
          if (supplements) {
            const formattedSupplements = supplements.map(s => ({
              id: s.id,
              name: s.name,
              brand: s.brand,
              dosage: s.dosage,
              unit: s.unit,
              form: s.form,
              type: s.category,
              benefits: s.benefits || [],
              bestTime: s.best_time,
              interactions: s.interactions || [],
              notes: s.notes,
              imageUrl: s.image_url,
              isActive: s.is_active,
              createdAt: s.created_at,
            }));
            set({ supplements: formattedSupplements });
          }

          // Process water log
          if (waterLog) {
            set(state => ({
              waterIntake: {
                ...state.waterIntake,
                [today]: { amount: waterLog.amount_ml, goal: waterLog.goal_ml },
              },
            }));
          }

          set({ _lastSyncedAt: new Date().toISOString() });
          console.log('[HealthStore] ✅ Initialized');
        } catch (error) {
          console.error('[HealthStore] ❌ Failed to initialize:', error);
          set({ _syncError: error.message });
        } finally {
          clearTimeout(timeoutId);
          if (!timedOut) {
            set({ _isSyncing: false });
          }
        }
      },

      // Sync settings to Supabase
      syncSettingsToSupabase: async () => {
        const userId = await getCurrentUserId();
        if (!userId) return;

        const { dailyGoals, micronutrientGoals, waterUnit, waterContainerMl, waterGoalMl } = get();

        try {
          await supabase
            .from('user_profiles')
            .update({
              health_settings: {
                dailyGoals: { ...dailyGoals, water: waterGoalMl },
                micronutrientGoals,
                waterUnit,
                waterContainerMl,
              },
              updated_at: new Date().toISOString(),
            })
            .eq('id', userId);
        } catch (error) {
          console.error('Failed to sync health settings:', error);
        }
      },

      // Add a new meal
      addMeal: async (mealData) => {
        const userId = await getCurrentUserId();

        // Normalize field names (SmartMealLogger uses mealType, others use type)
        const newMeal = {
          id: `meal-${Date.now()}`,
          timestamp: new Date().toISOString(),
          type: mealData.mealType || mealData.type,
          items: mealData.items || [],
          totalCalories: mealData.totalCalories || 0,
          totalProtein: mealData.totalProtein || 0,
          totalCarbs: mealData.totalCarbs || 0,
          totalFat: mealData.totalFat || 0,
          notes: mealData.notes || mealData.description,
        };

        // Optimistic update
        set((state) => ({
          meals: [newMeal, ...state.meals],
          isAddingMeal: false,
        }));

        // Sync to Supabase
        if (userId) {
          try {
            const { data, error } = await supabase
              .from('health_nutrition_logs')
              .insert({
                user_id: userId,
                meal_type: mealData.mealType || mealData.type, // Support both field names
                food_items: mealData.items || [],
                total_calories: mealData.totalCalories || 0,
                total_protein: mealData.totalProtein || 0,
                total_carbs: mealData.totalCarbs || 0,
                total_fat: mealData.totalFat || 0,
                meal_timestamp: newMeal.timestamp,
                notes: mealData.notes || mealData.description,
              })
              .select()
              .single();

            if (data) {
              // Update with server-generated ID
              set(state => ({
                meals: state.meals.map(m =>
                  m.id === newMeal.id ? { ...m, id: data.id } : m
                ),
              }));
            }
          } catch (error) {
            console.error('Failed to sync meal to Supabase:', error);
          }
        }

        // Award XP through unified gamification (EASY tier: 5-10 XP)
        const { dailyGoals } = get();
        let xpEarned = 8;
        const proteinAmount = newMeal.totalProtein || 0;
        if (proteinAmount >= dailyGoals.protein * 0.25) {
          xpEarned += 2; // Small protein bonus
          triggerGamification('proteinGoalHit', { xpOverride: 0 }); // Just track stat
        }

        triggerGamification('mealLogged', {
          xpOverride: xpEarned,
          module: 'health'
        });

        return newMeal.id;
      },

      // Update existing meal
      updateMeal: async (id, updates) => {
        const userId = await getCurrentUserId();

        set((state) => ({
          meals: state.meals.map((meal) =>
            meal.id === id ? { ...meal, ...updates } : meal
          ),
        }));

        if (userId) {
          try {
            await supabase
              .from('health_nutrition_logs')
              .update({
                meal_type: updates.type,
                food_items: updates.items,
                total_calories: updates.totalCalories,
                total_protein: updates.totalProtein,
                total_carbs: updates.totalCarbs,
                total_fat: updates.totalFat,
                notes: updates.notes,
              })
              .eq('id', id)
              .eq('user_id', userId);
          } catch (error) {
            console.error('Failed to update meal in Supabase:', error);
          }
        }
      },

      // Delete meal
      deleteMeal: async (id) => {
        const userId = await getCurrentUserId();

        set((state) => ({
          meals: state.meals.filter((meal) => meal.id !== id),
        }));

        if (userId) {
          try {
            await supabase
              .from('health_nutrition_logs')
              .delete()
              .eq('id', id)
              .eq('user_id', userId);
          } catch (error) {
            console.error('Failed to delete meal from Supabase:', error);
          }
        }
      },

      // Add meal to favorites for quick re-logging
      addToFavorites: (meal) => {
        set((state) => {
          // Check if already in favorites (by description or items)
          const signature = meal.description ||
            (meal.items?.map(i => i.name).join(',')) ||
            meal.id;

          const exists = state.favoriteMeals.some(f => {
            const fSig = f.description ||
              (f.items?.map(i => i.name).join(',')) ||
              f.id;
            return fSig === signature;
          });

          if (exists) return state;

          // Create a clean favorite entry (without timestamp/id)
          const favorite = {
            id: `fav-${Date.now()}`,
            description: meal.description,
            items: meal.items,
            totalCalories: meal.totalCalories,
            totalProtein: meal.totalProtein,
            totalCarbs: meal.totalCarbs,
            totalFat: meal.totalFat,
            totalFiber: meal.totalFiber,
            totalSugar: meal.totalSugar,
            totalSodium: meal.totalSodium,
            totalPotassium: meal.totalPotassium,
            totalCalcium: meal.totalCalcium,
            totalIron: meal.totalIron,
            addedAt: new Date().toISOString(),
          };

          return {
            favoriteMeals: [favorite, ...state.favoriteMeals].slice(0, 50), // Keep max 50
          };
        });
      },

      // Remove meal from favorites
      removeFromFavorites: (meal) => {
        set((state) => {
          const signature = meal.description ||
            (meal.items?.map(i => i.name).join(',')) ||
            meal.id;

          return {
            favoriteMeals: state.favoriteMeals.filter(f => {
              const fSig = f.description ||
                (f.items?.map(i => i.name).join(',')) ||
                f.id;
              return fSig !== signature;
            }),
          };
        });
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

        const initialTotals = {
          calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0,
          saturatedFat: 0, transFat: 0, cholesterol: 0,
          sodium: 0, potassium: 0, calcium: 0, iron: 0, magnesium: 0, phosphorus: 0, zinc: 0,
          vitaminA: 0, vitaminC: 0, vitaminD: 0, vitaminE: 0, vitaminK: 0,
          vitaminB6: 0, vitaminB12: 0, folate: 0,
        };

        return meals.reduce((totals, meal) => {
          totals.calories += meal.totalCalories || 0;
          totals.protein += meal.totalProtein || 0;
          totals.carbs += meal.totalCarbs || 0;
          totals.fat += meal.totalFat || 0;
          totals.fiber += meal.totalFiber || 0;
          totals.sugar += meal.totalSugar || 0;
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

      // Water intake actions
      addWater: async (amount = null) => {
        const userId = await getCurrentUserId();
        const { selectedDate, waterIntake, waterGoalMl, waterContainerMl } = get();
        const current = waterIntake[selectedDate]?.amount || 0;
        const mlToAdd = amount !== null ? amount : waterContainerMl;
        const newAmount = current + mlToAdd;

        // Optimistic update
        set((state) => ({
          waterIntake: {
            ...state.waterIntake,
            [selectedDate]: { amount: newAmount, goal: waterGoalMl }
          }
        }));

        // Sync to Supabase
        if (userId) {
          try {
            await supabase
              .from('health_water_logs')
              .upsert({
                user_id: userId,
                log_date: selectedDate,
                amount_ml: newAmount,
                goal_ml: waterGoalMl,
                updated_at: new Date().toISOString(),
              }, { onConflict: 'user_id,log_date' });
          } catch (error) {
            console.error('Failed to sync water intake:', error);
          }
        }

        // Award XP for hitting water goal (TRIVIAL tier: 2-5 XP)
        if (current < waterGoalMl && newAmount >= waterGoalMl) {
          triggerGamification('waterLogged', {
            xpOverride: 3,
            module: 'health'
          });
        }
      },

      removeWater: async (amount = null) => {
        const userId = await getCurrentUserId();
        const { selectedDate, waterIntake, waterGoalMl, waterContainerMl } = get();
        const current = waterIntake[selectedDate]?.amount || 0;
        const mlToRemove = amount !== null ? amount : waterContainerMl;
        const newAmount = Math.max(0, current - mlToRemove);

        set((state) => ({
          waterIntake: {
            ...state.waterIntake,
            [selectedDate]: { amount: newAmount, goal: waterGoalMl }
          }
        }));

        if (userId) {
          try {
            await supabase
              .from('health_water_logs')
              .upsert({
                user_id: userId,
                log_date: selectedDate,
                amount_ml: newAmount,
                goal_ml: waterGoalMl,
                updated_at: new Date().toISOString(),
              }, { onConflict: 'user_id,log_date' });
          } catch (error) {
            console.error('Failed to sync water removal:', error);
          }
        }
      },

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
          displayAmount: state.convertMlToUnit(data.amount),
          displayGoal: state.convertMlToUnit(state.waterGoalMl),
          unit: state.waterUnit,
          containerMl: state.waterContainerMl,
        };
      },

      convertMlToUnit: (ml) => {
        const { waterUnit, waterContainerMl } = get();
        switch (waterUnit) {
          case 'oz': return Math.round(ml / 29.574);
          case 'glasses': return Math.round(ml / 240);
          case 'bottles': return Math.round((ml / waterContainerMl) * 10) / 10;
          default: return ml;
        }
      },

      convertUnitToMl: (value, unit = null) => {
        const { waterUnit, waterContainerMl } = get();
        const targetUnit = unit || waterUnit;
        switch (targetUnit) {
          case 'oz': return Math.round(value * 29.574);
          case 'glasses': return Math.round(value * 240);
          case 'bottles': return Math.round(value * waterContainerMl);
          default: return value;
        }
      },

      setWaterSettings: ({ goalMl, unit, containerMl }) => {
        const updates = {};
        if (goalMl !== undefined) updates.waterGoalMl = goalMl;
        if (unit !== undefined) updates.waterUnit = unit;
        if (containerMl !== undefined) updates.waterContainerMl = containerMl;
        set(updates);
        get().syncSettingsToSupabase();
      },

      setWaterGoal: (goal) => {
        set({ waterGoalMl: goal });
        get().syncSettingsToSupabase();
      },

      // UI actions
      setSelectedDate: (date) => set({ selectedDate: date }),
      setIsAddingMeal: (value) => set({ isAddingMeal: value }),

      // Update daily goals
      updateDailyGoals: (goals) => {
        set({ dailyGoals: { ...get().dailyGoals, ...goals } });
        get().syncSettingsToSupabase();
      },

      // Update micronutrient goals
      updateMicronutrientGoals: (goals) => {
        set({ micronutrientGoals: { ...get().micronutrientGoals, ...goals } });
        get().syncSettingsToSupabase();
      },

      resetMicronutrientGoals: () => {
        set({ micronutrientGoals: null });
        get().syncSettingsToSupabase();
      },

      getMicronutrientGoal: (key, fdaDefault) => {
        const { micronutrientGoals } = get();
        return micronutrientGoals?.[key] ?? fdaDefault;
      },

      // ============ RECIPE ACTIONS ============

      addRecipe: async (recipeData) => {
        const userId = await getCurrentUserId();
        const newRecipe = {
          id: `recipe-${Date.now()}`,
          createdAt: new Date().toISOString(),
          ...recipeData,
        };

        set((state) => ({
          recipes: [newRecipe, ...state.recipes],
        }));

        if (userId) {
          try {
            const { data } = await supabase
              .from('health_recipes')
              .insert({
                user_id: userId,
                name: recipeData.name,
                description: recipeData.description,
                servings: recipeData.servings,
                prep_time_minutes: recipeData.prepTime,
                cook_time_minutes: recipeData.cookTime,
                ingredients: recipeData.ingredients || [],
                instructions: recipeData.instructions || [],
                nutrition_per_serving: recipeData.nutritionPerServing || {},
                tags: recipeData.tags || [],
                image_url: recipeData.imageUrl,
                is_favorite: recipeData.isFavorite || false,
                source_url: recipeData.sourceUrl,
              })
              .select()
              .single();

            if (data) {
              set(state => ({
                recipes: state.recipes.map(r =>
                  r.id === newRecipe.id ? { ...r, id: data.id } : r
                ),
              }));
            }
          } catch (error) {
            console.error('Failed to sync recipe:', error);
          }
        }

        triggerGamification('recipeCreated', { xpOverride: 6, module: 'health' });

        return newRecipe.id;
      },

      updateRecipe: async (id, updates) => {
        const userId = await getCurrentUserId();

        set((state) => ({
          recipes: state.recipes.map((recipe) =>
            recipe.id === id ? { ...recipe, ...updates, updatedAt: new Date().toISOString() } : recipe
          ),
        }));

        if (userId) {
          try {
            await supabase
              .from('health_recipes')
              .update({
                name: updates.name,
                description: updates.description,
                servings: updates.servings,
                prep_time_minutes: updates.prepTime,
                cook_time_minutes: updates.cookTime,
                ingredients: updates.ingredients,
                instructions: updates.instructions,
                nutrition_per_serving: updates.nutritionPerServing,
                tags: updates.tags,
                image_url: updates.imageUrl,
                is_favorite: updates.isFavorite,
                source_url: updates.sourceUrl,
                updated_at: new Date().toISOString(),
              })
              .eq('id', id)
              .eq('user_id', userId);
          } catch (error) {
            console.error('Failed to update recipe:', error);
          }
        }
      },

      deleteRecipe: async (id) => {
        const userId = await getCurrentUserId();

        set((state) => ({
          recipes: state.recipes.filter((recipe) => recipe.id !== id),
        }));

        if (userId) {
          try {
            await supabase
              .from('health_recipes')
              .delete()
              .eq('id', id)
              .eq('user_id', userId);
          } catch (error) {
            console.error('Failed to delete recipe:', error);
          }
        }
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
        // Sync to Supabase
        get().syncMealPlansToSupabase();
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
        // Sync to Supabase
        get().syncMealPlansToSupabase();
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

        triggerGamification('eventCreated', { xpOverride: 3, module: 'health' }); // Meal plan copied

        // Sync to Supabase
        get().syncMealPlansToSupabase();
      },

      // ============ SUPPLEMENT ACTIONS ============

      addSupplement: async (supplementData) => {
        const userId = await getCurrentUserId();
        const newSupplement = {
          id: `supplement-${Date.now()}`,
          createdAt: new Date().toISOString(),
          ...supplementData,
        };

        set((state) => ({
          supplements: [...state.supplements, newSupplement],
        }));

        if (userId) {
          try {
            const { data } = await supabase
              .from('health_supplements')
              .insert({
                user_id: userId,
                name: supplementData.name,
                brand: supplementData.brand,
                dosage: supplementData.dosage,
                unit: supplementData.unit,
                form: supplementData.form,
                category: supplementData.type,
                benefits: supplementData.benefits || [],
                best_time: supplementData.bestTime,
                interactions: supplementData.interactions || [],
                notes: supplementData.notes,
                image_url: supplementData.imageUrl,
                is_active: true,
              })
              .select()
              .single();

            if (data) {
              set(state => ({
                supplements: state.supplements.map(s =>
                  s.id === newSupplement.id ? { ...s, id: data.id } : s
                ),
              }));
            }
          } catch (error) {
            console.error('Failed to sync supplement:', error);
          }
        }

        triggerGamification('supplementAdded', { xpOverride: 3, module: 'health' });

        return newSupplement.id;
      },

      updateSupplement: async (id, updates) => {
        const userId = await getCurrentUserId();

        set((state) => ({
          supplements: state.supplements.map((supplement) =>
            supplement.id === id ? { ...supplement, ...updates } : supplement
          ),
        }));

        if (userId) {
          try {
            await supabase
              .from('health_supplements')
              .update({
                name: updates.name,
                brand: updates.brand,
                dosage: updates.dosage,
                unit: updates.unit,
                form: updates.form,
                category: updates.type,
                benefits: updates.benefits,
                best_time: updates.bestTime,
                interactions: updates.interactions,
                notes: updates.notes,
                image_url: updates.imageUrl,
                updated_at: new Date().toISOString(),
              })
              .eq('id', id)
              .eq('user_id', userId);
          } catch (error) {
            console.error('Failed to update supplement:', error);
          }
        }
      },

      deleteSupplement: async (id) => {
        const userId = await getCurrentUserId();

        set((state) => ({
          supplements: state.supplements.filter((supplement) => supplement.id !== id),
          supplementStacks: state.supplementStacks.map((stack) => ({
            ...stack,
            supplementIds: stack.supplementIds.filter((sid) => sid !== id),
          })),
        }));

        if (userId) {
          try {
            await supabase
              .from('health_supplements')
              .update({ is_active: false, updated_at: new Date().toISOString() })
              .eq('id', id)
              .eq('user_id', userId);
          } catch (error) {
            console.error('Failed to delete supplement:', error);
          }
        }
      },

      // Supplement stacks (synced to Supabase)
      addSupplementStack: (stackData) => {
        const newStack = {
          id: `stack-${Date.now()}`,
          createdAt: new Date().toISOString(),
          ...stackData,
        };

        set((state) => ({
          supplementStacks: [...state.supplementStacks, newStack],
        }));

        // Sync to Supabase
        get().syncSupplementStacksToSupabase();

        return newStack.id;
      },

      updateSupplementStack: (id, updates) => {
        set((state) => ({
          supplementStacks: state.supplementStacks.map((stack) =>
            stack.id === id ? { ...stack, ...updates, updatedAt: new Date().toISOString() } : stack
          ),
        }));

        // Sync to Supabase
        get().syncSupplementStacksToSupabase();
      },

      deleteSupplementStack: (id) => {
        set((state) => ({
          supplementStacks: state.supplementStacks.filter((stack) => stack.id !== id),
        }));

        // Sync to Supabase
        get().syncSupplementStacksToSupabase();
      },

      addSupplementToStack: (stackId, supplementId) => {
        set((state) => ({
          supplementStacks: state.supplementStacks.map((stack) =>
            stack.id === stackId
              ? { ...stack, supplementIds: [...(stack.supplementIds || []), supplementId] }
              : stack
          ),
        }));

        // Sync to Supabase
        get().syncSupplementStacksToSupabase();
      },

      removeSupplementFromStack: (stackId, supplementId) => {
        set((state) => ({
          supplementStacks: state.supplementStacks.map((stack) =>
            stack.id === stackId
              ? { ...stack, supplementIds: (stack.supplementIds || []).filter((id) => id !== supplementId) }
              : stack
          ),
        }));

        // Sync to Supabase
        get().syncSupplementStacksToSupabase();
      },

      // Supplement logging
      logSupplementTaken: async (supplementId, date = null) => {
        const userId = await getCurrentUserId();
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

        if (userId) {
          try {
            await supabase
              .from('health_supplement_logs')
              .insert({
                user_id: userId,
                supplement_id: supplementId,
                taken_at: now.toISOString(),
              });
          } catch (error) {
            console.error('Failed to log supplement:', error);
          }
        }

        triggerGamification('supplementTaken', { xpOverride: 2, module: 'health' });
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

      getSupplementTiming: (supplementType) => {
        const type = supplementType?.toLowerCase().replace(/\s+/g, '-');
        return SUPPLEMENT_TIMING[type] || { optimal: 'any', withFood: true, reason: 'No specific timing required' };
      },
    }),
    {
      name: 'lifeos-health',
      partialize: (state) => ({
        dailyGoals: state.dailyGoals,
        micronutrientGoals: state.micronutrientGoals,
        meals: state.meals,
        recipes: state.recipes,
        mealPlans: state.mealPlans,
        supplements: state.supplements,
        supplementStacks: state.supplementStacks,
        supplementLog: state.supplementLog,
        waterIntake: state.waterIntake,
        waterGoalMl: state.waterGoalMl,
        waterUnit: state.waterUnit,
        waterContainerMl: state.waterContainerMl,
      }),
    }
  )
);

// Export constants for use in components
export { SUPPLEMENT_INTERACTIONS, SUPPLEMENT_TIMING };

// Initialize function
export const initializeHealthStore = async (userId = null) => {
  await useHealthStore.getState().initializeFromSupabase(userId);
};
