import React, { useState, useMemo } from 'react';
import { X, Pill, Sparkles, Clock, Check } from 'lucide-react';
import { useHealthStore, SUPPLEMENT_TIMING } from '../../../stores/healthStore';

// Common supplement keywords for auto-detection
const SUPPLEMENT_KEYWORDS = {
  'vitamin-d': ['vitamin d', 'd3', 'd2', 'cholecalciferol'],
  'vitamin-c': ['vitamin c', 'ascorbic'],
  'vitamin-b12': ['b12', 'b-12', 'cobalamin', 'methylcobalamin'],
  'iron': ['iron', 'ferrous', 'ferric'],
  'calcium': ['calcium', 'cal-mag'],
  'magnesium': ['magnesium', 'mag', 'glycinate', 'citrate', 'threonate'],
  'zinc': ['zinc', 'zn'],
  'fish-oil': ['fish oil', 'omega', 'omega-3', 'omega 3', 'dha', 'epa', 'cod liver'],
  'probiotics': ['probiotic', 'lactobacillus', 'bifidobacterium'],
  'melatonin': ['melatonin'],
  'creatine': ['creatine', 'creatine monohydrate'],
  'protein': ['protein', 'whey', 'casein', 'collagen'],
  'multivitamin': ['multivitamin', 'multi-vitamin', 'multi vitamin', 'daily vitamin'],
  'vitamin-k': ['vitamin k', 'k2', 'mk-7'],
  'folate': ['folate', 'folic acid', 'methylfolate'],
  'vitamin-e': ['vitamin e', 'tocopherol'],
  'vitamin-a': ['vitamin a', 'retinol', 'beta carotene'],
  'biotin': ['biotin', 'b7'],
  'ashwagandha': ['ashwagandha', 'ksm-66'],
  'turmeric': ['turmeric', 'curcumin'],
  'coq10': ['coq10', 'ubiquinol', 'coenzyme q10'],
};

// Detect supplement type from name
function detectSupplementType(name) {
  const lowerName = name.toLowerCase();
  for (const [type, keywords] of Object.entries(SUPPLEMENT_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerName.includes(keyword)) {
        return type;
      }
    }
  }
  return 'other';
}

// Get timing recommendation for a type
function getTimingForType(type) {
  return SUPPLEMENT_TIMING[type] || { optimal: 'morning', withFood: true, reason: 'General recommendation' };
}

// Timing display info
const TIMING_INFO = {
  morning: { emoji: '🌅', label: 'Morning' },
  afternoon: { emoji: '☀️', label: 'Afternoon' },
  evening: { emoji: '🌙', label: 'Evening' },
  any: { emoji: '⏰', label: 'Any time' },
};

export default function AddSupplementModal({ onClose, editSupplement = null }) {
  const { addSupplement, updateSupplement } = useHealthStore();
  const [name, setName] = useState(editSupplement?.name || '');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [customTiming, setCustomTiming] = useState(editSupplement?.timing || null);
  const [customWithFood, setCustomWithFood] = useState(editSupplement?.withFood ?? null);

  // Auto-detect type and timing from name
  const detected = useMemo(() => {
    if (!name.trim()) return null;
    const type = detectSupplementType(name);
    const timing = getTimingForType(type);
    return { type, ...timing };
  }, [name]);

  // Final timing values (custom override or auto-detected)
  const finalTiming = customTiming || detected?.optimal || 'morning';
  const finalWithFood = customWithFood !== null ? customWithFood : (detected?.withFood ?? true);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const supplementData = {
      name: name.trim(),
      type: detected?.type || 'other',
      timing: finalTiming,
      withFood: finalWithFood,
    };

    if (editSupplement) {
      updateSupplement(editSupplement.id, supplementData);
    } else {
      addSupplement(supplementData);
    }

    onClose();
  };

  const timingInfo = TIMING_INFO[finalTiming];

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1a1724] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
              <Pill className="w-5 h-5 text-purple-400" />
            </div>
            <h2 className="text-lg font-semibold text-white">
              {editSupplement ? 'Edit Supplement' : 'Add Supplement'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Simple Name Input */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              What supplement are you taking?
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Vitamin D3, Magnesium, Fish Oil..."
              autoFocus
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-lg placeholder-white/30 focus:outline-none focus:border-purple-500/50"
            />
          </div>

          {/* Auto-detected recommendation */}
          {detected && name.trim() && (
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-medium text-purple-400">Smart Recommendation</span>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-white/50" />
                  <span className="text-white/70">Take</span>
                  <span className="text-white font-medium">
                    {timingInfo.emoji} {timingInfo.label}
                  </span>
                </div>
                <div className="text-white/50">•</div>
                <span className="text-white/70">
                  {finalWithFood ? 'With food' : 'Empty stomach'}
                </span>
              </div>
              {detected.reason && detected.type !== 'other' && (
                <p className="text-xs text-white/50 mt-2">{detected.reason}</p>
              )}
            </div>
          )}

          {/* Advanced toggle */}
          {name.trim() && (
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-sm text-white/50 hover:text-white/70 transition-colors"
            >
              {showAdvanced ? 'Hide options' : 'Customize timing →'}
            </button>
          )}

          {/* Advanced options (collapsed by default) */}
          {showAdvanced && (
            <div className="space-y-3 pt-2 border-t border-white/10">
              <div>
                <label className="block text-xs font-medium text-white/50 mb-2">
                  When to take
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {Object.entries(TIMING_INFO).map(([id, info]) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setCustomTiming(id)}
                      className={`p-2 rounded-lg border text-center transition-all ${
                        finalTiming === id
                          ? 'bg-purple-500/20 border-purple-500/50 text-purple-400'
                          : 'bg-white/5 border-white/10 text-white/60 hover:border-white/30'
                      }`}
                    >
                      <span className="text-base">{info.emoji}</span>
                      <span className="block text-xs mt-0.5">{info.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <span className="text-sm text-white/70">Take with food</span>
                <button
                  type="button"
                  onClick={() => setCustomWithFood(customWithFood === null ? !finalWithFood : !customWithFood)}
                  className={`w-10 h-5 rounded-full transition-colors ${
                    finalWithFood ? 'bg-purple-500' : 'bg-white/20'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      finalWithFood ? 'translate-x-5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!name.trim()}
            className="w-full py-3 bg-purple-500 hover:bg-purple-600 disabled:bg-purple-500/30 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Check className="w-5 h-5" />
            {editSupplement ? 'Save Changes' : 'Add Supplement'}
          </button>
        </form>
      </div>
    </div>
  );
}
