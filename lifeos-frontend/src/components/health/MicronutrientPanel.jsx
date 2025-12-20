/**
 * MicronutrientPanel - Detailed vitamin & mineral tracking display
 * Shows daily % goals for each nutrient with visual indicators
 */

import { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, AlertTriangle, Check, TrendingUp, Info } from 'lucide-react';
import { useHealthStore } from '../../stores/healthStore';

// Daily Value (DV) recommendations based on FDA guidelines
const MICRONUTRIENT_GROUPS = {
  vitamins: [
    { key: 'vitaminA', name: 'Vitamin A', unit: 'mcg', dv: 900, icon: '🥕' },
    { key: 'vitaminC', name: 'Vitamin C', unit: 'mg', dv: 90, icon: '🍊' },
    { key: 'vitaminD', name: 'Vitamin D', unit: 'mcg', dv: 20, icon: '☀️' },
    { key: 'vitaminE', name: 'Vitamin E', unit: 'mg', dv: 15, icon: '🥜' },
    { key: 'vitaminK', name: 'Vitamin K', unit: 'mcg', dv: 120, icon: '🥬' },
    { key: 'vitaminB6', name: 'Vitamin B6', unit: 'mg', dv: 1.7, icon: '🍌' },
    { key: 'vitaminB12', name: 'Vitamin B12', unit: 'mcg', dv: 2.4, icon: '🥩' },
    { key: 'folate', name: 'Folate', unit: 'mcg', dv: 400, icon: '🥦' },
  ],
  minerals: [
    { key: 'calcium', name: 'Calcium', unit: 'mg', dv: 1300, icon: '🥛' },
    { key: 'iron', name: 'Iron', unit: 'mg', dv: 18, icon: '🫘' },
    { key: 'magnesium', name: 'Magnesium', unit: 'mg', dv: 420, icon: '🥑' },
    { key: 'phosphorus', name: 'Phosphorus', unit: 'mg', dv: 1250, icon: '🐟' },
    { key: 'potassium', name: 'Potassium', unit: 'mg', dv: 4700, icon: '🍌' },
    { key: 'sodium', name: 'Sodium', unit: 'mg', dv: 2300, isLimit: true, icon: '🧂' },
    { key: 'zinc', name: 'Zinc', unit: 'mg', dv: 11, icon: '🦪' },
  ],
  other: [
    { key: 'fiber', name: 'Fiber', unit: 'g', dv: 28, icon: '🌾' },
    { key: 'sugar', name: 'Sugar', unit: 'g', dv: 50, isLimit: true, icon: '🍬' },
    { key: 'cholesterol', name: 'Cholesterol', unit: 'mg', dv: 300, isLimit: true, icon: '🥚' },
    { key: 'saturatedFat', name: 'Saturated Fat', unit: 'g', dv: 20, isLimit: true, icon: '🧈' },
  ],
};

// Get status color based on percentage of daily value
function getStatusColor(percent, isLimit = false) {
  if (isLimit) {
    // For limits (sodium, sugar, etc.), lower is better
    if (percent >= 100) return { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' }; // Red - over limit
    if (percent >= 75) return { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' }; // Amber - warning
    return { color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' }; // Green - good
  } else {
    // For goals (vitamins, minerals), higher is better
    if (percent >= 100) return { color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' }; // Green - met
    if (percent >= 75) return { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' }; // Amber - close
    if (percent >= 50) return { color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' }; // Blue - moderate
    return { color: '#6b7280', bg: 'rgba(107, 114, 128, 0.1)' }; // Gray - low
  }
}

// Single nutrient row
function NutrientRow({ nutrient, value, compact = false }) {
  const percent = Math.round((value / nutrient.dv) * 100);
  const status = getStatusColor(percent, nutrient.isLimit);
  const displayValue = value.toFixed(nutrient.unit === 'mcg' ? 1 : 0);

  return (
    <div className={`flex items-center gap-3 ${compact ? 'py-1.5' : 'py-2'}`}>
      {/* Icon & Name */}
      <div className="flex items-center gap-2 min-w-[120px]">
        {!compact && <span className="text-base">{nutrient.icon}</span>}
        <span className={`${compact ? 'text-xs' : 'text-sm'} text-fg-secondary`}>
          {nutrient.name}
        </span>
      </div>

      {/* Progress bar */}
      <div className="flex-1 h-1.5 bg-surface-alt/50 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${Math.min(percent, 100)}%`,
            backgroundColor: status.color,
          }}
        />
      </div>

      {/* Value & Percent */}
      <div className={`flex items-center gap-2 min-w-[80px] justify-end ${compact ? 'text-xs' : 'text-sm'}`}>
        <span className="text-fg-tertiary">
          {displayValue}{nutrient.unit}
        </span>
        <span
          className="font-medium px-1.5 py-0.5 rounded text-xs"
          style={{ color: status.color, backgroundColor: status.bg }}
        >
          {percent}%
        </span>
      </div>
    </div>
  );
}

// Deficiency warning component
function DeficiencyWarnings({ totals }) {
  const warnings = useMemo(() => {
    const issues = [];

    // Check vitamins
    MICRONUTRIENT_GROUPS.vitamins.forEach(v => {
      const value = totals[v.key] || 0;
      const percent = (value / v.dv) * 100;
      if (percent < 25) {
        issues.push({ nutrient: v.name, percent, severity: 'low' });
      }
    });

    // Check minerals
    MICRONUTRIENT_GROUPS.minerals.forEach(m => {
      if (m.isLimit) return;
      const value = totals[m.key] || 0;
      const percent = (value / m.dv) * 100;
      if (percent < 25) {
        issues.push({ nutrient: m.name, percent, severity: 'low' });
      }
    });

    // Check limits (over)
    [...MICRONUTRIENT_GROUPS.minerals, ...MICRONUTRIENT_GROUPS.other]
      .filter(n => n.isLimit)
      .forEach(n => {
        const value = totals[n.key] || 0;
        const percent = (value / n.dv) * 100;
        if (percent > 100) {
          issues.push({ nutrient: n.name, percent, severity: 'over' });
        }
      });

    return issues;
  }, [totals]);

  if (warnings.length === 0) return null;

  return (
    <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
      <div className="flex items-center gap-2 mb-2">
        <AlertTriangle size={16} className="text-amber-400" />
        <span className="text-sm font-medium text-amber-300">Nutrition Alerts</span>
      </div>
      <div className="space-y-1">
        {warnings.slice(0, 3).map((w, idx) => (
          <div key={idx} className="text-xs text-amber-400/80">
            {w.severity === 'low'
              ? `${w.nutrient}: Only ${Math.round(w.percent)}% of daily goal`
              : `${w.nutrient}: ${Math.round(w.percent)}% exceeds limit`}
          </div>
        ))}
        {warnings.length > 3 && (
          <div className="text-xs text-amber-400/60">
            +{warnings.length - 3} more alerts
          </div>
        )}
      </div>
    </div>
  );
}

export default function MicronutrientPanel({ date, compact = false }) {
  const { getDailyTotals, micronutrientGoals } = useHealthStore();
  const totals = getDailyTotals(date);
  const [expandedGroup, setExpandedGroup] = useState('vitamins');
  const [showAll, setShowAll] = useState(false);

  // Calculate overall micronutrient score
  const score = useMemo(() => {
    let total = 0;
    let count = 0;

    [...MICRONUTRIENT_GROUPS.vitamins, ...MICRONUTRIENT_GROUPS.minerals].forEach(n => {
      if (n.isLimit) return;
      const value = totals[n.key] || 0;
      const percent = Math.min((value / n.dv) * 100, 100);
      total += percent;
      count++;
    });

    return Math.round(total / count);
  }, [totals]);

  const toggleGroup = (group) => {
    setExpandedGroup(expandedGroup === group ? null : group);
  };

  if (compact) {
    // Compact view - just show score and key nutrients
    return (
      <div className="bg-surface/30 border border-border-subtle rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-fg-primary">Micronutrients</span>
            <div className={`px-2 py-0.5 rounded text-xs font-medium ${
              score >= 75 ? 'bg-green-500/20 text-green-400' :
              score >= 50 ? 'bg-amber-500/20 text-amber-400' :
              'bg-red-500/20 text-red-400'
            }`}>
              {score}% Daily Goals
            </div>
          </div>
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-xs text-fg-tertiary hover:text-fg-secondary flex items-center gap-1"
          >
            {showAll ? 'Less' : 'More'}
            {showAll ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>

        {/* Key nutrients quick view */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          {[
            { ...MICRONUTRIENT_GROUPS.vitamins[1], value: totals.vitaminC || 0 }, // Vitamin C
            { ...MICRONUTRIENT_GROUPS.vitamins[2], value: totals.vitaminD || 0 }, // Vitamin D
            { ...MICRONUTRIENT_GROUPS.minerals[1], value: totals.iron || 0 }, // Iron
            { ...MICRONUTRIENT_GROUPS.minerals[0], value: totals.calcium || 0 }, // Calcium
          ].map((n, idx) => {
            const percent = Math.round((n.value / n.dv) * 100);
            const status = getStatusColor(percent);
            return (
              <div key={idx} className="flex items-center justify-between p-2 bg-black/20 rounded-lg">
                <span className="text-fg-tertiary">{n.name}</span>
                <span style={{ color: status.color }}>{percent}%</span>
              </div>
            );
          })}
        </div>

        {/* Expanded view */}
        {showAll && (
          <div className="mt-4 pt-4 border-t border-border-subtle">
            {Object.entries(MICRONUTRIENT_GROUPS).map(([group, nutrients]) => (
              <div key={group} className="mb-3">
                <div className="text-xs font-medium text-fg-tertiary uppercase tracking-wide mb-2">
                  {group}
                </div>
                {nutrients.map(n => (
                  <NutrientRow
                    key={n.key}
                    nutrient={n}
                    value={totals[n.key] || 0}
                    compact
                  />
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Full view
  return (
    <div className="bg-surface/50 border border-border-subtle rounded-2xl p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
            <TrendingUp size={20} className="text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-fg-primary">Micronutrients</h3>
            <p className="text-sm text-fg-tertiary">Vitamins & minerals intake</p>
          </div>
        </div>

        {/* Score badge */}
        <div className={`text-center px-4 py-2 rounded-xl ${
          score >= 75 ? 'bg-green-500/20' :
          score >= 50 ? 'bg-amber-500/20' :
          'bg-red-500/20'
        }`}>
          <div className={`text-2xl font-bold ${
            score >= 75 ? 'text-green-400' :
            score >= 50 ? 'text-amber-400' :
            'text-red-400'
          }`}>
            {score}%
          </div>
          <div className="text-xs text-fg-tertiary">Daily Score</div>
        </div>
      </div>

      {/* Deficiency warnings */}
      <DeficiencyWarnings totals={totals} />

      {/* Accordion groups */}
      <div className="space-y-2">
        {Object.entries(MICRONUTRIENT_GROUPS).map(([group, nutrients]) => {
          const isExpanded = expandedGroup === group;
          const groupPercent = Math.round(
            nutrients.reduce((sum, n) => {
              if (n.isLimit) return sum;
              return sum + Math.min((totals[n.key] || 0) / n.dv * 100, 100);
            }, 0) / nutrients.filter(n => !n.isLimit).length
          );

          return (
            <div key={group} className="border border-border-subtle rounded-xl overflow-hidden">
              <button
                onClick={() => toggleGroup(group)}
                className="w-full flex items-center justify-between p-4 bg-surface-alt/30 hover:bg-surface-alt/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium text-fg-primary capitalize">{group}</span>
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    groupPercent >= 75 ? 'bg-green-500/20 text-green-400' :
                    groupPercent >= 50 ? 'bg-amber-500/20 text-amber-400' :
                    'bg-surface-alt text-fg-tertiary'
                  }`}>
                    {groupPercent}% avg
                  </span>
                </div>
                {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>

              {isExpanded && (
                <div className="p-4 bg-black/10">
                  {nutrients.map(nutrient => (
                    <NutrientRow
                      key={nutrient.key}
                      nutrient={nutrient}
                      value={totals[nutrient.key] || 0}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Info footer */}
      <div className="mt-4 flex items-start gap-2 text-xs text-fg-tertiary">
        <Info size={14} className="flex-shrink-0 mt-0.5" />
        <span>
          Based on FDA Daily Values (DV). Individual needs may vary based on age, sex, and activity level.
        </span>
      </div>
    </div>
  );
}

// Export compact version for sidebars
export { NutrientRow, DeficiencyWarnings, MICRONUTRIENT_GROUPS };
