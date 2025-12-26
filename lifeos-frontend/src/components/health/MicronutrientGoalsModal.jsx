/**
 * MicronutrientGoalsModal - Allows users to customise their micronutrient daily goals
 */

import { useState } from 'react';
import { X, RotateCcw, Sparkles, Droplets, Flame, Pill, Info } from 'lucide-react';
import { useHealthStore } from '../../stores/healthStore';

// FDA Default Daily Values
export const FDA_DAILY_VALUES = {
  // Minerals
  sodium: { value: 2300, unit: 'mg', name: 'Sodium', category: 'mineral', warn: true },
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

const CATEGORY_CONFIG = {
  vitamin: {
    icon: Sparkles,
    title: 'Vitamins',
    gradient: 'from-amber-500 to-orange-500',
    bgGradient: 'from-amber-500/10 to-orange-500/10',
    border: 'border-amber-500/20',
    text: 'text-amber-400',
  },
  mineral: {
    icon: Droplets,
    title: 'Minerals',
    gradient: 'from-cyan-500 to-blue-500',
    bgGradient: 'from-cyan-500/10 to-blue-500/10',
    border: 'border-cyan-500/20',
    text: 'text-cyan-400',
  },
  fat: {
    icon: Flame,
    title: 'Fats',
    gradient: 'from-rose-500 to-pink-500',
    bgGradient: 'from-rose-500/10 to-pink-500/10',
    border: 'border-rose-500/20',
    text: 'text-rose-400',
  },
  other: {
    icon: Pill,
    title: 'Other',
    gradient: 'from-violet-500 to-purple-500',
    bgGradient: 'from-violet-500/10 to-purple-500/10',
    border: 'border-violet-500/20',
    text: 'text-violet-400',
  },
};

function NutrientInput({ nutrientKey, info, value, onChange, isCustom }) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-2">
        <span className="text-sm text-fg-secondary">{info.name}</span>
        {info.warn && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400">
            Limit
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(nutrientKey, parseFloat(e.target.value) || 0)}
          className={`w-20 px-2 py-1 text-sm text-right rounded-lg bg-surface-alt border transition-colors
            ${isCustom ? 'border-violet-500/50 text-violet-400' : 'border-border-subtle text-fg-primary'}
            focus:outline-none focus:border-violet-500`}
          min="0"
          step={info.unit === 'mcg' ? '0.1' : '1'}
        />
        <span className="text-xs text-fg-tertiary w-8">{info.unit}</span>
      </div>
    </div>
  );
}

function CategorySection({ category, goals, customGoals, onGoalChange }) {
  const config = CATEGORY_CONFIG[category];
  const Icon = config.icon;

  const nutrients = Object.entries(FDA_DAILY_VALUES)
    .filter(([_, info]) => info.category === category);

  if (nutrients.length === 0) return null;

  return (
    <div className={`p-4 rounded-xl bg-gradient-to-br ${config.bgGradient} border ${config.border}`}>
      <div className="flex items-center gap-2 mb-3">
        <Icon size={18} className={config.text} />
        <h4 className={`font-semibold ${config.text}`}>{config.title}</h4>
      </div>
      <div className="space-y-1">
        {nutrients.map(([key, info]) => (
          <NutrientInput
            key={key}
            nutrientKey={key}
            info={info}
            value={goals[key] ?? info.value}
            onChange={onGoalChange}
            isCustom={customGoals?.[key] !== undefined}
          />
        ))}
      </div>
    </div>
  );
}

export default function MicronutrientGoalsModal({ onClose }) {
  const { micronutrientGoals, updateMicronutrientGoals, resetMicronutrientGoals } = useHealthStore();

  // Initialize local state with current goals (custom or FDA defaults)
  const [localGoals, setLocalGoals] = useState(() => {
    const initial = {};
    Object.entries(FDA_DAILY_VALUES).forEach(([key, info]) => {
      initial[key] = micronutrientGoals?.[key] ?? info.value;
    });
    return initial;
  });

  const handleGoalChange = (key, value) => {
    setLocalGoals((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    // Only save values that differ from FDA defaults
    const customValues = {};
    Object.entries(localGoals).forEach(([key, value]) => {
      if (value !== FDA_DAILY_VALUES[key].value) {
        customValues[key] = value;
      }
    });

    if (Object.keys(customValues).length > 0) {
      updateMicronutrientGoals(customValues);
    } else {
      resetMicronutrientGoals();
    }
    onClose();
  };

  const handleReset = () => {
    const defaults = {};
    Object.entries(FDA_DAILY_VALUES).forEach(([key, info]) => {
      defaults[key] = info.value;
    });
    setLocalGoals(defaults);
  };

  const hasCustomValues = Object.entries(localGoals).some(
    ([key, value]) => value !== FDA_DAILY_VALUES[key].value
  );

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
              <h3 className="font-semibold text-fg-primary">Micronutrient Goals</h3>
              <p className="text-xs text-fg-tertiary">Customise your daily targets</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-surface-alt transition-colors text-fg-tertiary hover:text-fg-secondary"
          >
            <X size={20} />
          </button>
        </div>

        {/* Info Banner */}
        <div className="mx-4 mt-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-start gap-2">
          <Info size={16} className="text-blue-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-blue-300">
            Default values are based on FDA guidelines. Adjust based on your age, sex, activity level,
            or specific health goals. Consult a healthcare provider for personalized recommendations.
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <CategorySection
            category="vitamin"
            goals={localGoals}
            customGoals={micronutrientGoals}
            onGoalChange={handleGoalChange}
          />
          <CategorySection
            category="mineral"
            goals={localGoals}
            customGoals={micronutrientGoals}
            onGoalChange={handleGoalChange}
          />
          <CategorySection
            category="fat"
            goals={localGoals}
            customGoals={micronutrientGoals}
            onGoalChange={handleGoalChange}
          />
          <CategorySection
            category="other"
            goals={localGoals}
            customGoals={micronutrientGoals}
            onGoalChange={handleGoalChange}
          />
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border-subtle flex items-center justify-between">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-3 py-2 text-sm text-fg-secondary hover:text-fg-primary
              rounded-lg hover:bg-surface-alt transition-colors"
          >
            <RotateCcw size={16} />
            Reset to FDA Defaults
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-fg-secondary hover:text-fg-primary
                rounded-lg hover:bg-surface-alt transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm font-medium text-white rounded-lg
                bg-gradient-to-r from-violet-500 to-fuchsia-500
                hover:from-violet-600 hover:to-fuchsia-600 transition-colors"
            >
              Save Goals
            </button>
          </div>
        </div>

        {/* Custom indicator */}
        {hasCustomValues && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 px-2 py-1 rounded-full
            bg-violet-500/20 text-violet-400 text-xs">
            Custom values set
          </div>
        )}
      </div>
    </div>
  );
}
