import React, { useState, useMemo } from 'react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Copy,
  Flame,
} from 'lucide-react';
import { useHealthStore } from '../../../stores/healthStore';
import RecipeLibrary from './RecipeLibrary';
import './WeeklyMealPlanner.css';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'];
const MEAL_EMOJIS = {
  breakfast: '🌅',
  lunch: '☀️',
  dinner: '🌙',
  snack: '🍎',
};

export default function WeeklyMealPlanner() {
  const {
    recipes,
    mealPlans,
    getWeekKey,
    getMealPlanForWeek,
    setMealInPlan,
    removeMealFromPlan,
    copyMealPlanToWeek,
    getRecipeById,
  } = useHealthStore();

  const [weekOffset, setWeekOffset] = useState(0);
  const [selectingSlot, setSelectingSlot] = useState(null); // { day, mealType }

  // Calculate current week
  const currentWeekKey = useMemo(() => {
    const now = new Date();
    now.setDate(now.getDate() + weekOffset * 7);
    return getWeekKey(now);
  }, [weekOffset, getWeekKey]);

  const weekPlan = getMealPlanForWeek(currentWeekKey);

  // Get week date range
  const weekDateRange = useMemo(() => {
    const start = new Date(currentWeekKey);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return {
      start: start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      end: end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    };
  }, [currentWeekKey]);

  // Calculate weekly nutrition totals
  const weeklyTotals = useMemo(() => {
    let calories = 0;
    let protein = 0;
    let carbs = 0;
    let fat = 0;
    let mealCount = 0;

    DAYS.forEach((day) => {
      const dayPlan = weekPlan[day] || {};
      MEAL_TYPES.forEach((mealType) => {
        const recipeId = dayPlan[mealType];
        if (recipeId) {
          const recipe = getRecipeById(recipeId);
          if (recipe) {
            calories += recipe.calories || 0;
            protein += recipe.protein || 0;
            carbs += recipe.carbs || 0;
            fat += recipe.fat || 0;
            mealCount++;
          }
        }
      });
    });

    return { calories, protein, carbs, fat, mealCount };
  }, [weekPlan, getRecipeById]);

  const handleSelectRecipe = (recipe) => {
    if (selectingSlot) {
      setMealInPlan(currentWeekKey, selectingSlot.day, selectingSlot.mealType, recipe.id);
      setSelectingSlot(null);
    }
  };

  const handleRemoveMeal = (day, mealType) => {
    removeMealFromPlan(currentWeekKey, day, mealType);
  };

  const handleCopyToNextWeek = () => {
    const nextWeek = new Date(currentWeekKey);
    nextWeek.setDate(nextWeek.getDate() + 7);
    const nextWeekKey = getWeekKey(nextWeek);
    copyMealPlanToWeek(currentWeekKey, nextWeekKey);
  };

  // Recipe selector modal
  if (selectingSlot) {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-[#1a1724] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <div>
              <h2 className="text-lg font-semibold text-white">
                Select Recipe for {selectingSlot.day.charAt(0).toUpperCase() + selectingSlot.day.slice(1)}
              </h2>
              <p className="text-sm text-white/50">
                {MEAL_EMOJIS[selectingSlot.mealType]} {selectingSlot.mealType.charAt(0).toUpperCase() + selectingSlot.mealType.slice(1)}
              </p>
            </div>
            <button
              onClick={() => setSelectingSlot(null)}
              className="p-2 rounded-lg hover:bg-white/10 text-white/50 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <RecipeLibrary selectable onSelectRecipe={handleSelectRecipe} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="weekly-meal-planner">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-emerald-400" />
          <h3 className="text-lg font-semibold text-white">Weekly Meal Plan</h3>
        </div>
        <button
          onClick={handleCopyToNextWeek}
          className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white/70 rounded-lg text-sm flex items-center gap-2 transition-colors"
          title="Copy to next week"
        >
          <Copy className="w-4 h-4" />
        </button>
      </div>

      {/* Week Navigation */}
      <div className="flex items-center justify-between bg-white/5 rounded-xl p-3 mb-4">
        <button
          onClick={() => setWeekOffset((prev) => prev - 1)}
          className="p-2 rounded-lg hover:bg-white/10 text-white/70 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <div className="text-white font-medium">
            {weekDateRange.start} - {weekDateRange.end}
          </div>
          <div className="text-xs text-white/50">
            {weekOffset === 0 ? 'This Week' : weekOffset > 0 ? `${weekOffset} week${weekOffset > 1 ? 's' : ''} ahead` : `${Math.abs(weekOffset)} week${Math.abs(weekOffset) > 1 ? 's' : ''} ago`}
          </div>
        </div>
        <button
          onClick={() => setWeekOffset((prev) => prev + 1)}
          className="p-2 rounded-lg hover:bg-white/10 text-white/70 transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Weekly Stats */}
      {weeklyTotals.mealCount > 0 && (
        <div className="weekly-stats-grid">
          <div className="bg-orange-500/10 rounded-lg p-2 text-center">
            <div className="text-orange-400 font-semibold">{weeklyTotals.calories}</div>
            <div className="text-xs text-white/50">kcal/wk</div>
          </div>
          <div className="bg-emerald-500/10 rounded-lg p-2 text-center">
            <div className="text-emerald-400 font-semibold">{weeklyTotals.protein}g</div>
            <div className="text-xs text-white/50">protein</div>
          </div>
          <div className="bg-amber-500/10 rounded-lg p-2 text-center">
            <div className="text-amber-400 font-semibold">{weeklyTotals.carbs}g</div>
            <div className="text-xs text-white/50">carbs</div>
          </div>
          <div className="bg-rose-500/10 rounded-lg p-2 text-center">
            <div className="text-rose-400 font-semibold">{weeklyTotals.fat}g</div>
            <div className="text-xs text-white/50">fat</div>
          </div>
        </div>
      )}

      {/* Meal Grid */}
      <div className="meal-grid-container">
        <div className="meal-grid-inner">
          {/* Day Headers */}
          <div className="day-headers">
            <div className="text-xs text-white/40 font-medium p-2"></div>
            {DAY_LABELS.map((day, i) => (
              <div key={day} className="text-xs text-white/60 font-medium text-center p-2">
                {day}
              </div>
            ))}
          </div>

          {/* Meal Rows */}
          {MEAL_TYPES.map((mealType) => (
            <div key={mealType} className="meal-row">
              {/* Meal Type Label */}
              <div className="meal-type-label">
                <span>{MEAL_EMOJIS[mealType]}</span>
                <span className="capitalize">{mealType}</span>
              </div>

              {/* Day Slots */}
              {DAYS.map((day) => {
                const recipeId = weekPlan[day]?.[mealType];
                const recipe = recipeId ? getRecipeById(recipeId) : null;

                return (
                  <div
                    key={`${day}-${mealType}`}
                    className={`meal-slot ${recipe ? 'filled' : 'empty'}`}
                  >
                    {recipe ? (
                      <div className="p-2 h-full">
                        <div className="text-xs text-white font-medium line-clamp-2 mb-1">
                          {recipe.name}
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-white/50">
                          <Flame className="w-3 h-3" />
                          {recipe.calories || 0}
                        </div>
                        <button
                          onClick={() => handleRemoveMeal(day, mealType)}
                          className="absolute top-1 right-1 p-0.5 rounded bg-black/50 text-white/50 hover:text-red-400 opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setSelectingSlot({ day, mealType })}
                        className="w-full h-full flex items-center justify-center text-white/30 hover:text-emerald-400 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {weeklyTotals.mealCount === 0 && (
        <div className="text-center py-6 text-white/50">
          <p className="text-sm">Click + to add meals to your weekly plan</p>
          <p className="text-xs mt-1">
            First, add recipes to your library, then plan your week
          </p>
        </div>
      )}
    </div>
  );
}
