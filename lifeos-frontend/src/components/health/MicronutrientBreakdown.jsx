/**
 * MicronutrientBreakdown - Displays detailed vitamin and mineral breakdown
 * Shows daily totals vs recommended daily values with visual progress bars
 */

import { X, Droplets, Pill, Flame, Sparkles } from 'lucide-react';

// Recommended Daily Values (based on FDA guidelines for adults)
const DAILY_VALUES = {
  // Minerals
  sodium: { value: 2300, unit: 'mg', name: 'Sodium', category: 'mineral' },
  potassium: { value: 4700, unit: 'mg', name: 'Potassium', category: 'mineral' },
  calcium: { value: 1300, unit: 'mg', name: 'Calcium', category: 'mineral' },
  iron: { value: 18, unit: 'mg', name: 'Iron', category: 'mineral' },
  magnesium: { value: 420, unit: 'mg', name: 'Magnesium', category: 'mineral' },
  phosphorus: { value: 1250, unit: 'mg', name: 'Phosphorus', category: 'mineral' },
  zinc: { value: 11, unit: 'mg', name: 'Zinc', category: 'mineral' },
  // Vitamins
  vitaminA: { value: 900, unit: 'mcg', name: 'Vitamin A', category: 'vitamin' },
  vitaminC: { value: 90, unit: 'mg', name: 'Vitamin C', category: 'vitamin' },
  vitaminD: { value: 20, unit: 'mcg', name: 'Vitamin D', category: 'vitamin' },
  vitaminE: { value: 15, unit: 'mg', name: 'Vitamin E', category: 'vitamin' },
  vitaminK: { value: 120, unit: 'mcg', name: 'Vitamin K', category: 'vitamin' },
  vitaminB6: { value: 1.7, unit: 'mg', name: 'Vitamin B6', category: 'vitamin' },
  vitaminB12: { value: 2.4, unit: 'mcg', name: 'Vitamin B12', category: 'vitamin' },
  folate: { value: 400, unit: 'mcg', name: 'Folate', category: 'vitamin' },
  // Fats breakdown
  saturatedFat: { value: 20, unit: 'g', name: 'Saturated Fat', category: 'fat', warn: true },
  transFat: { value: 0, unit: 'g', name: 'Trans Fat', category: 'fat', warn: true },
  cholesterol: { value: 300, unit: 'mg', name: 'Cholesterol', category: 'fat', warn: true },
  fiber: { value: 28, unit: 'g', name: 'Fiber', category: 'other' },
  sugar: { value: 50, unit: 'g', name: 'Sugar', category: 'other', warn: true },
};

// Category styling
const CATEGORY_STYLES = {
  vitamin: {
    gradient: 'from-amber-500 to-orange-500',
    bgGradient: 'from-amber-500/10 to-orange-500/10',
    border: 'border-amber-500/20',
    text: 'text-amber-400',
    icon: Sparkles,
    title: 'Vitamins',
  },
  mineral: {
    gradient: 'from-cyan-500 to-blue-500',
    bgGradient: 'from-cyan-500/10 to-blue-500/10',
    border: 'border-cyan-500/20',
    text: 'text-cyan-400',
    icon: Droplets,
    title: 'Minerals',
  },
  fat: {
    gradient: 'from-rose-500 to-pink-500',
    bgGradient: 'from-rose-500/10 to-pink-500/10',
    border: 'border-rose-500/20',
    text: 'text-rose-400',
    icon: Flame,
    title: 'Fats Breakdown',
  },
  other: {
    gradient: 'from-violet-500 to-purple-500',
    bgGradient: 'from-violet-500/10 to-purple-500/10',
    border: 'border-violet-500/20',
    text: 'text-violet-400',
    icon: Pill,
    title: 'Other',
  },
};

function NutrientRow({ nutrientKey, currentValue, dvInfo }) {
  const percentage = dvInfo.value > 0
    ? Math.round((currentValue / dvInfo.value) * 100)
    : 0;

  const isWarning = dvInfo.warn && percentage > 100;
  const isGood = !dvInfo.warn && percentage >= 80;

  // Color based on whether it's a "limit" nutrient or "goal" nutrient
  let barColor = 'bg-violet-500';
  if (dvInfo.warn) {
    if (percentage > 100) barColor = 'bg-red-500';
    else if (percentage > 80) barColor = 'bg-amber-500';
    else barColor = 'bg-emerald-500';
  } else {
    if (percentage >= 100) barColor = 'bg-emerald-500';
    else if (percentage >= 50) barColor = 'bg-violet-500';
    else barColor = 'bg-violet-500/50';
  }

  return (
    <div className="py-2">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm text-fg-secondary">{dvInfo.name}</span>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-fg-primary">
            {currentValue}{dvInfo.unit}
          </span>
          <span className={`text-xs px-1.5 py-0.5 rounded ${
            isWarning ? 'bg-red-500/20 text-red-400' :
            isGood ? 'bg-emerald-500/20 text-emerald-400' :
            'bg-surface-alt text-fg-tertiary'
          }`}>
            {percentage}%
          </span>
        </div>
      </div>
      <div className="h-1.5 bg-surface-alt rounded-full overflow-hidden">
        <div
          className={`h-full ${barColor} transition-all duration-300`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
}

function CategorySection({ category, nutrients, totals }) {
  const style = CATEGORY_STYLES[category];
  const Icon = style.icon;

  const categoryNutrients = Object.entries(DAILY_VALUES)
    .filter(([_, info]) => info.category === category);

  if (categoryNutrients.length === 0) return null;

  return (
    <div className={`p-4 rounded-xl bg-gradient-to-br ${style.bgGradient} border ${style.border}`}>
      <div className="flex items-center gap-2 mb-3">
        <Icon size={18} className={style.text} />
        <h4 className={`font-semibold ${style.text}`}>{style.title}</h4>
      </div>
      <div className="space-y-1">
        {categoryNutrients.map(([key, info]) => (
          <NutrientRow
            key={key}
            nutrientKey={key}
            currentValue={totals[key] || 0}
            dvInfo={info}
          />
        ))}
      </div>
    </div>
  );
}

export default function MicronutrientBreakdown({ totals, onClose }) {
  if (!totals) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg max-h-[90vh] overflow-hidden bg-surface border border-border-subtle rounded-2xl shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border-subtle">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
              <Pill size={20} className="text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-fg-primary">Micronutrient Breakdown</h3>
              <p className="text-xs text-fg-tertiary">Daily values based on FDA guidelines</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-surface-alt transition-colors text-fg-tertiary hover:text-fg-secondary"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Quick Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 bg-black/20 rounded-xl">
            <div className="text-center">
              <div className="text-lg font-bold text-fg-primary">{totals.calories || 0}</div>
              <div className="text-xs text-fg-tertiary">Calories</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-blue-400">{totals.protein || 0}g</div>
              <div className="text-xs text-fg-tertiary">Protein</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-amber-400">{totals.carbs || 0}g</div>
              <div className="text-xs text-fg-tertiary">Carbs</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-rose-400">{totals.fat || 0}g</div>
              <div className="text-xs text-fg-tertiary">Fat</div>
            </div>
          </div>

          {/* Vitamins */}
          <CategorySection category="vitamin" totals={totals} />

          {/* Minerals */}
          <CategorySection category="mineral" totals={totals} />

          {/* Fat Breakdown */}
          <CategorySection category="fat" totals={totals} />

          {/* Other (Fiber, Sugar) */}
          <CategorySection category="other" totals={totals} />
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border-subtle">
          <p className="text-xs text-fg-quaternary text-center">
            % Daily Value based on a 2,000 calorie diet. Individual needs may vary.
          </p>
        </div>
      </div>
    </div>
  );
}
