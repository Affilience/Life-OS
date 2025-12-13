/**
 * MacroGoalsModal - Allows users to customize their daily macronutrient goals
 */

import { useState } from 'react';
import { X, Target, TrendingUp, Info, RotateCcw } from 'lucide-react';
import { useHealthStore } from '../../stores/healthStore';

const DEFAULT_GOALS = {
  calories: 2000,
  protein: 150,
  carbs: 200,
  fat: 65,
};

const MACRO_CONFIG = {
  calories: {
    label: 'Calories',
    unit: 'kcal',
    color: 'violet',
    min: 1000,
    max: 5000,
    step: 50,
    hint: 'Total daily energy intake',
  },
  protein: {
    label: 'Protein',
    unit: 'g',
    color: 'blue',
    min: 30,
    max: 400,
    step: 5,
    hint: '0.8-1g per lb of body weight for muscle building',
  },
  carbs: {
    label: 'Carbohydrates',
    unit: 'g',
    color: 'amber',
    min: 20,
    max: 500,
    step: 5,
    hint: 'Primary energy source, adjust based on activity',
  },
  fat: {
    label: 'Fat',
    unit: 'g',
    color: 'rose',
    min: 20,
    max: 200,
    step: 5,
    hint: 'Essential for hormones, aim for ~25-35% of calories',
  },
};

function MacroInput({ macroKey, value, onChange, config }) {
  const colorClasses = {
    violet: 'border-violet-500/50 focus:border-violet-500 text-violet-400',
    blue: 'border-blue-500/50 focus:border-blue-500 text-blue-400',
    amber: 'border-amber-500/50 focus:border-amber-500 text-amber-400',
    rose: 'border-rose-500/50 focus:border-rose-500 text-rose-400',
  };

  const bgClasses = {
    violet: 'from-violet-500/10 to-fuchsia-500/10 border-violet-500/20',
    blue: 'from-blue-500/10 to-cyan-500/10 border-blue-500/20',
    amber: 'from-amber-500/10 to-orange-500/10 border-amber-500/20',
    rose: 'from-rose-500/10 to-pink-500/10 border-rose-500/20',
  };

  const textClasses = {
    violet: 'text-violet-400',
    blue: 'text-blue-400',
    amber: 'text-amber-400',
    rose: 'text-rose-400',
  };

  return (
    <div className={`p-4 rounded-xl bg-gradient-to-br ${bgClasses[config.color]} border`}>
      <div className="flex items-center justify-between mb-2">
        <label className={`font-medium ${textClasses[config.color]}`}>
          {config.label}
        </label>
        <span className="text-xs text-white/50">{config.unit}</span>
      </div>

      <div className="flex items-center gap-3">
        <input
          type="range"
          min={config.min}
          max={config.max}
          step={config.step}
          value={value}
          onChange={(e) => onChange(macroKey, parseInt(e.target.value))}
          className="flex-1 h-2 bg-[#0c0a10] rounded-lg appearance-none cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4
            [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-lg
            [&::-webkit-slider-thumb]:cursor-pointer"
        />
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(macroKey, parseInt(e.target.value) || config.min)}
          min={config.min}
          max={config.max}
          className={`w-20 px-2 py-1.5 text-sm text-center rounded-lg bg-[#0c0a10] border
            transition-colors focus:outline-none ${colorClasses[config.color]}`}
        />
      </div>

      <p className="mt-2 text-xs text-white/40">{config.hint}</p>
    </div>
  );
}

export default function MacroGoalsModal({ onClose }) {
  const { dailyGoals, updateDailyGoals } = useHealthStore();

  const [localGoals, setLocalGoals] = useState({
    calories: dailyGoals.calories || DEFAULT_GOALS.calories,
    protein: dailyGoals.protein || DEFAULT_GOALS.protein,
    carbs: dailyGoals.carbs || DEFAULT_GOALS.carbs,
    fat: dailyGoals.fat || DEFAULT_GOALS.fat,
  });

  const handleChange = (key, value) => {
    setLocalGoals((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    updateDailyGoals(localGoals);
    onClose();
  };

  const handleReset = () => {
    setLocalGoals(DEFAULT_GOALS);
  };

  // Calculate macro calories for summary
  const proteinCals = localGoals.protein * 4;
  const carbsCals = localGoals.carbs * 4;
  const fatCals = localGoals.fat * 9;
  const totalMacroCals = proteinCals + carbsCals + fatCals;
  const calorieDiff = localGoals.calories - totalMacroCals;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md max-h-[90vh] overflow-hidden bg-[#1a1724] border border-white/10 rounded-2xl shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
              <Target size={20} className="text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Nutrition Goals</h3>
              <p className="text-xs text-white/60">Set your daily macro targets</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/60 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {Object.entries(MACRO_CONFIG).map(([key, config]) => (
            <MacroInput
              key={key}
              macroKey={key}
              value={localGoals[key]}
              onChange={handleChange}
              config={config}
            />
          ))}

          {/* Calorie Balance Info */}
          <div className="p-3 rounded-lg bg-[#0c0a10] border border-white/10">
            <div className="flex items-start gap-2">
              <Info size={16} className="text-white/50 mt-0.5 flex-shrink-0" />
              <div className="text-xs">
                <p className="text-white/80 mb-1">
                  <strong>Macro breakdown:</strong> {proteinCals} (protein) + {carbsCals} (carbs) + {fatCals} (fat) = {totalMacroCals} kcal
                </p>
                {Math.abs(calorieDiff) > 50 && (
                  <p className={calorieDiff > 0 ? 'text-amber-400' : 'text-blue-400'}>
                    {calorieDiff > 0
                      ? `Your calorie goal is ${calorieDiff} kcal higher than your macro totals`
                      : `Your macros add up to ${Math.abs(calorieDiff)} kcal more than your calorie goal`
                    }
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 flex items-center justify-between">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-3 py-2 text-sm text-white/70 hover:text-white
              rounded-lg hover:bg-white/10 transition-colors"
          >
            <RotateCcw size={16} />
            Reset to Defaults
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-white/70 hover:text-white
                rounded-lg hover:bg-white/10 transition-colors"
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
      </div>
    </div>
  );
}
