/**
 * AddCustomStreakModal - Create custom habit streaks to track
 *
 * Features:
 * - Choose from predefined icons
 * - Select color scheme
 * - Set frequency (daily, weekdays, weekends, custom days)
 * - Optional goal target
 */

import React, { useState } from 'react';
import { X, Check, Calendar } from 'lucide-react';
import useCustomStreaksStore, {
  STREAK_ICONS,
  STREAK_COLORS,
  STREAK_FREQUENCIES,
} from '../../stores/customStreaksStore';
import { useGamificationModeStore } from '../../stores/gamificationModeStore';

// Mode-specific styling
const MODE_STYLES = {
  cosmic: {
    buttonBg: 'bg-purple-500 hover:bg-purple-600',
    selectedBorder: 'border-purple-500',
    selectedBg: 'bg-purple-500/20',
  },
  professional: {
    buttonBg: 'bg-blue-500 hover:bg-blue-600',
    selectedBorder: 'border-blue-500',
    selectedBg: 'bg-blue-500/20',
  },
  minimal: {
    buttonBg: 'bg-emerald-500 hover:bg-emerald-600',
    selectedBorder: 'border-emerald-500',
    selectedBg: 'bg-emerald-500/20',
  },
};

const DAYS_OF_WEEK = [
  { id: 0, label: 'Sun', short: 'S' },
  { id: 1, label: 'Mon', short: 'M' },
  { id: 2, label: 'Tue', short: 'T' },
  { id: 3, label: 'Wed', short: 'W' },
  { id: 4, label: 'Thu', short: 'T' },
  { id: 5, label: 'Fri', short: 'F' },
  { id: 6, label: 'Sat', short: 'S' },
];

export default function AddCustomStreakModal({ onClose }) {
  const mode = useGamificationModeStore((state) => state.mode);
  const modeStyle = MODE_STYLES[mode] || MODE_STYLES.cosmic;

  const { createStreak, isLoading } = useCustomStreaksStore();

  // Form state
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(STREAK_ICONS[0]);
  const [selectedColor, setSelectedColor] = useState(STREAK_COLORS[0]);
  const [frequency, setFrequency] = useState('daily');
  const [customDays, setCustomDays] = useState([1, 2, 3, 4, 5]); // Mon-Fri default
  const [goal, setGoal] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState(null);

  // Step state for wizard-like UX
  const [step, setStep] = useState(1);

  const handleSave = async () => {
    if (!name.trim()) return;
    setError(null);

    console.log('[AddStreakModal] Saving streak:', { name, icon: selectedIcon.emoji, color: selectedColor.id });

    const result = await createStreak({
      name: name.trim(),
      icon: selectedIcon.emoji,
      color: selectedColor.id,
      frequency,
      customDays: frequency === 'custom' ? customDays : null,
      goal: goal ? parseInt(goal) : null,
      description: description.trim() || null,
    });

    console.log('[AddStreakModal] Create result:', result);

    if (result?.success) {
      onClose();
    } else {
      setError(result?.error || 'Failed to create streak. Please try again.');
    }
  };

  const toggleDay = (dayId) => {
    setCustomDays((prev) =>
      prev.includes(dayId)
        ? prev.filter((d) => d !== dayId)
        : [...prev, dayId].sort()
    );
  };

  const isValid = name.trim().length > 0;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1724] border border-white/10 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">Create Custom Streak</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white/60" />
          </button>
        </div>

        <div className="p-4 space-y-5">
          {/* Streak Name */}
          <div>
            <label className="block text-sm text-white/60 mb-2">
              What habit do you want to track?
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Morning Run, Read 30 mins, Practice Piano..."
              className="w-full bg-[#0c0a10] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
              autoFocus
            />
          </div>

          {/* Icon Selection */}
          <div>
            <label className="block text-sm text-white/60 mb-2">
              Choose an icon
            </label>
            <div className="grid grid-cols-8 gap-2">
              {STREAK_ICONS.map((icon) => (
                <button
                  key={icon.id}
                  onClick={() => setSelectedIcon(icon)}
                  className={`
                    w-10 h-10 rounded-lg border text-xl flex items-center justify-center
                    transition-all hover:scale-110
                    ${selectedIcon.id === icon.id
                      ? `${modeStyle.selectedBorder} ${modeStyle.selectedBg}`
                      : 'border-white/10 hover:border-white/20'
                    }
                  `}
                  title={icon.label}
                >
                  {icon.emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Color Selection */}
          <div>
            <label className="block text-sm text-white/60 mb-2">
              Choose a color
            </label>
            <div className="flex gap-2 flex-wrap">
              {STREAK_COLORS.map((color) => (
                <button
                  key={color.id}
                  onClick={() => setSelectedColor(color)}
                  className={`
                    w-8 h-8 rounded-full border-2 transition-all hover:scale-110
                    ${selectedColor.id === color.id
                      ? 'border-white scale-110'
                      : 'border-transparent'
                    }
                  `}
                  style={{ backgroundColor: color.value }}
                  title={color.id}
                />
              ))}
            </div>
          </div>

          {/* Frequency Selection */}
          <div>
            <label className="block text-sm text-white/60 mb-2">
              How often?
            </label>
            <div className="grid grid-cols-2 gap-2">
              {STREAK_FREQUENCIES.map((freq) => (
                <button
                  key={freq.id}
                  onClick={() => setFrequency(freq.id)}
                  className={`
                    p-3 rounded-lg border text-left transition-all
                    ${frequency === freq.id
                      ? `${modeStyle.selectedBorder} ${modeStyle.selectedBg}`
                      : 'border-white/10 hover:border-white/20'
                    }
                  `}
                >
                  <div className="text-sm font-medium text-white">{freq.label}</div>
                  <div className="text-xs text-white/50">{freq.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Days Selection */}
          {frequency === 'custom' && (
            <div>
              <label className="block text-sm text-white/60 mb-2">
                Select days
              </label>
              <div className="flex gap-2">
                {DAYS_OF_WEEK.map((day) => (
                  <button
                    key={day.id}
                    onClick={() => toggleDay(day.id)}
                    className={`
                      flex-1 py-2 rounded-lg border text-sm font-medium transition-all
                      ${customDays.includes(day.id)
                        ? `${modeStyle.selectedBorder} ${modeStyle.selectedBg} text-white`
                        : 'border-white/10 text-white/50 hover:border-white/20'
                      }
                    `}
                  >
                    {day.short}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Optional Goal */}
          <div>
            <label className="block text-sm text-white/60 mb-2">
              Goal (optional)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="e.g., 30"
                min="1"
                className="w-24 bg-[#0c0a10] border border-white/10 rounded-lg px-3 py-2 text-white text-center focus:outline-none focus:border-purple-500"
              />
              <span className="text-white/60 text-sm">days in a row</span>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm text-white/60 mb-2">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Why is this habit important to you?"
              rows={2}
              className="w-full bg-[#0c0a10] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 resize-none"
            />
          </div>

          {/* Preview */}
          <div className="bg-[#0c0a10] rounded-xl p-4">
            <div className="text-xs text-white/50 mb-2">Preview</div>
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                style={{ backgroundColor: selectedColor.value + '30' }}
              >
                {selectedIcon.emoji}
              </div>
              <div>
                <div className="text-white font-medium">{name || 'Your Habit'}</div>
                <div className="text-xs text-white/50">
                  {frequency === 'daily' && 'Every day'}
                  {frequency === 'weekdays' && 'Mon - Fri'}
                  {frequency === 'weekends' && 'Sat - Sun'}
                  {frequency === 'custom' && customDays.length > 0 &&
                    customDays.map(d => DAYS_OF_WEEK.find(day => day.id === d)?.short).join(', ')
                  }
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-4 mb-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Footer */}
        <div className="flex gap-3 p-4 border-t border-white/10">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 text-white/60 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!isValid || isLoading}
            className={`
              flex-1 px-4 py-3 ${modeStyle.buttonBg} disabled:opacity-50
              text-white rounded-lg font-medium transition-colors
              flex items-center justify-center gap-2
            `}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Create Streak
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
