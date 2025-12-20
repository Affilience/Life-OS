/**
 * RecentMealsQuickAdd - Quick re-log recent and favorite meals
 * One-tap to re-log previous meals - saves significant time
 */

import { useState, useMemo } from 'react';
import { Clock, Star, ChevronRight, Plus, Copy, StarOff, Utensils } from 'lucide-react';
import { useHealthStore } from '../../stores/healthStore';
import { haptics } from '../../utils/haptics';

// Get unique meals from recent history (by description)
function getUniqueMeals(meals, limit = 10) {
  const seen = new Map();

  for (const meal of meals) {
    // Create a signature based on items or description
    const signature = meal.description ||
      (meal.items?.map(i => i.name?.toLowerCase()).sort().join(',')) ||
      meal.id;

    if (!seen.has(signature)) {
      seen.set(signature, meal);
    }

    if (seen.size >= limit) break;
  }

  return Array.from(seen.values());
}

// Format meal for display
function formatMealSummary(meal) {
  if (meal.description) return meal.description;
  if (meal.items?.length) {
    const names = meal.items.map(i => i.name).filter(Boolean);
    if (names.length <= 2) return names.join(' and ');
    return `${names.slice(0, 2).join(', ')} +${names.length - 2} more`;
  }
  return 'Unnamed meal';
}

// Get time-relative label
function getTimeLabel(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function RecentMealsQuickAdd({ onMealSelected, mealType = 'snack' }) {
  const { meals, favoriteMeals = [], addToFavorites, removeFromFavorites } = useHealthStore();
  const [activeTab, setActiveTab] = useState('recent');
  const [showAll, setShowAll] = useState(false);

  // Get recent unique meals
  const recentMeals = useMemo(() => {
    const sorted = [...meals].sort((a, b) =>
      new Date(b.timestamp) - new Date(a.timestamp)
    );
    return getUniqueMeals(sorted, showAll ? 20 : 5);
  }, [meals, showAll]);

  // Filter favorites
  const favorites = useMemo(() => {
    return favoriteMeals.slice(0, showAll ? 20 : 5);
  }, [favoriteMeals, showAll]);

  const displayMeals = activeTab === 'recent' ? recentMeals : favorites;

  const handleSelectMeal = async (meal) => {
    await haptics.light();

    // Create new meal data based on selected meal
    const mealData = {
      mealType: mealType,
      description: formatMealSummary(meal),
      items: meal.items?.map(item => ({
        ...item,
        // Preserve all nutrition data
      })) || [],
      totalCalories: meal.totalCalories,
      totalProtein: meal.totalProtein,
      totalCarbs: meal.totalCarbs,
      totalFat: meal.totalFat,
      totalFiber: meal.totalFiber,
      totalSugar: meal.totalSugar,
      // Copy all micro nutrients if available
      totalSodium: meal.totalSodium,
      totalPotassium: meal.totalPotassium,
      totalCalcium: meal.totalCalcium,
      totalIron: meal.totalIron,
    };

    onMealSelected?.(mealData);
  };

  const handleToggleFavorite = async (meal, e) => {
    e.stopPropagation();
    await haptics.medium();

    const isFav = favoriteMeals.some(f =>
      f.description === meal.description ||
      (f.items?.map(i => i.name).join(',') === meal.items?.map(i => i.name).join(','))
    );

    if (isFav) {
      removeFromFavorites?.(meal);
    } else {
      addToFavorites?.(meal);
    }
  };

  const isFavorite = (meal) => {
    return favoriteMeals.some(f =>
      f.description === meal.description ||
      (f.items?.map(i => i.name).join(',') === meal.items?.map(i => i.name).join(','))
    );
  };

  if (meals.length === 0 && favoriteMeals.length === 0) {
    return null;
  }

  return (
    <div className="bg-surface/30 border border-border-subtle rounded-xl p-4 mb-4">
      {/* Header with tabs */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('recent')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'recent'
                ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                : 'text-fg-tertiary hover:text-fg-secondary'
            }`}
          >
            <Clock size={14} />
            Recent
          </button>
          <button
            onClick={() => setActiveTab('favorites')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'favorites'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-fg-tertiary hover:text-fg-secondary'
            }`}
          >
            <Star size={14} />
            Favorites
            {favoriteMeals.length > 0 && (
              <span className="ml-1 text-xs opacity-70">({favoriteMeals.length})</span>
            )}
          </button>
        </div>
      </div>

      {/* Meal list */}
      <div className="space-y-2">
        {displayMeals.length === 0 ? (
          <div className="text-center py-6 text-fg-tertiary">
            <Utensils size={24} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">
              {activeTab === 'recent'
                ? 'No recent meals yet'
                : 'No favorite meals saved'}
            </p>
            {activeTab === 'favorites' && (
              <p className="text-xs mt-1 opacity-70">
                Tap the star on recent meals to save them
              </p>
            )}
          </div>
        ) : (
          displayMeals.map((meal, idx) => (
            <button
              key={meal.id || idx}
              onClick={() => handleSelectMeal(meal)}
              className="w-full flex items-center gap-3 p-3 bg-black/20 hover:bg-violet-500/10 rounded-lg transition-all group border border-transparent hover:border-violet-500/20"
            >
              {/* Favorite toggle */}
              <button
                onClick={(e) => handleToggleFavorite(meal, e)}
                className={`p-1.5 rounded-full transition-all ${
                  isFavorite(meal)
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'bg-surface-alt/50 text-fg-tertiary hover:text-amber-400 hover:bg-amber-500/10'
                }`}
              >
                <Star size={14} className={isFavorite(meal) ? 'fill-current' : ''} />
              </button>

              {/* Meal info */}
              <div className="flex-1 text-left min-w-0">
                <div className="font-medium text-fg-primary truncate">
                  {formatMealSummary(meal)}
                </div>
                <div className="flex items-center gap-2 text-xs text-fg-tertiary mt-0.5">
                  <span className="font-semibold text-fg-secondary">
                    {meal.totalCalories} cal
                  </span>
                  <span>·</span>
                  <span>P: {meal.totalProtein || 0}g</span>
                  <span>·</span>
                  <span>C: {meal.totalCarbs || 0}g</span>
                  <span>·</span>
                  <span>F: {meal.totalFat || 0}g</span>
                  {activeTab === 'recent' && (
                    <>
                      <span className="ml-auto opacity-70">
                        {getTimeLabel(meal.timestamp)}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Quick add indicator */}
              <div className="flex items-center gap-1 text-violet-400 opacity-0 group-hover:opacity-100 transition-opacity">
                <Plus size={16} />
              </div>
            </button>
          ))
        )}
      </div>

      {/* Show more/less */}
      {(activeTab === 'recent' ? meals.length > 5 : favoriteMeals.length > 5) && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="w-full mt-3 py-2 text-sm text-fg-tertiary hover:text-fg-secondary flex items-center justify-center gap-1 transition-colors"
        >
          {showAll ? 'Show less' : 'Show more'}
          <ChevronRight size={14} className={`transition-transform ${showAll ? 'rotate-90' : ''}`} />
        </button>
      )}
    </div>
  );
}

// Compact version for sidebar or smaller spaces
export function RecentMealsCompact({ onMealSelected, limit = 3 }) {
  const { meals } = useHealthStore();

  const recentMeals = useMemo(() => {
    const sorted = [...meals].sort((a, b) =>
      new Date(b.timestamp) - new Date(a.timestamp)
    );
    return getUniqueMeals(sorted, limit);
  }, [meals, limit]);

  if (recentMeals.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {recentMeals.map((meal, idx) => (
        <button
          key={meal.id || idx}
          onClick={() => onMealSelected?.(meal)}
          className="px-3 py-1.5 bg-surface-alt/50 hover:bg-violet-500/20 text-fg-secondary hover:text-violet-300 text-xs rounded-full flex items-center gap-1.5 transition-all"
        >
          <Copy size={12} />
          <span className="truncate max-w-[120px]">{formatMealSummary(meal)}</span>
          <span className="text-fg-tertiary">({meal.totalCalories})</span>
        </button>
      ))}
    </div>
  );
}
