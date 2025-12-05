import React from 'react';
import { Clock, Users, Flame, Plus, Edit2, Trash2 } from 'lucide-react';

const CATEGORY_COLORS = {
  breakfast: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30' },
  lunch: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  dinner: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30' },
  snack: { bg: 'bg-pink-500/20', text: 'text-pink-400', border: 'border-pink-500/30' },
  other: { bg: 'bg-slate-500/20', text: 'text-slate-400', border: 'border-slate-500/30' },
};

export default function RecipeCard({ recipe, onSelect, onEdit, onDelete, selectable = false }) {
  const categoryStyle = CATEGORY_COLORS[recipe.category] || CATEGORY_COLORS.other;

  return (
    <div
      className={`bg-[#1a1724] border border-white/10 rounded-xl p-4 transition-all ${
        selectable ? 'cursor-pointer hover:border-emerald-500/50 hover:bg-[#1a1724]/80' : ''
      }`}
      onClick={() => selectable && onSelect?.(recipe)}
    >
      {/* Header with category badge */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1">
          <h4 className="font-semibold text-white text-base mb-1">{recipe.name}</h4>
          <span
            className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${categoryStyle.bg} ${categoryStyle.text}`}
          >
            {recipe.category?.charAt(0).toUpperCase() + recipe.category?.slice(1) || 'Other'}
          </span>
        </div>

        {/* Action buttons */}
        {!selectable && (
          <div className="flex items-center gap-1">
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(recipe);
                }}
                className="p-1.5 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(recipe.id);
                }}
                className="p-1.5 rounded-lg hover:bg-red-500/20 text-white/50 hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Quick stats */}
      <div className="flex items-center gap-4 text-sm text-white/60 mb-3">
        {recipe.prepTime && (
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>{recipe.prepTime + (recipe.cookTime || 0)} min</span>
          </div>
        )}
        {recipe.servings && (
          <div className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            <span>{recipe.servings}</span>
          </div>
        )}
        {recipe.calories && (
          <div className="flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-orange-400" />
            <span>{recipe.calories} kcal</span>
          </div>
        )}
      </div>

      {/* Macros bar */}
      {(recipe.protein || recipe.carbs || recipe.fat) && (
        <div className="flex items-center gap-2 text-xs">
          {recipe.protein > 0 && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-white/50">P: {recipe.protein}g</span>
            </div>
          )}
          {recipe.carbs > 0 && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="text-white/50">C: {recipe.carbs}g</span>
            </div>
          )}
          {recipe.fat > 0 && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-rose-400" />
              <span className="text-white/50">F: {recipe.fat}g</span>
            </div>
          )}
        </div>
      )}

      {/* Select button when selectable */}
      {selectable && (
        <button
          className="mt-3 w-full py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onSelect?.(recipe);
          }}
        >
          <Plus className="w-4 h-4" />
          Add to Plan
        </button>
      )}
    </div>
  );
}
