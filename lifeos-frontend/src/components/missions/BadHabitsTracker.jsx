/**
 * Bad Habits Tracker - Track habits you want to quit
 *
 * Features:
 * - Visual timer showing days/hours/minutes clean
 * - Money saved calculator
 * - Health benefits timeline
 * - Milestone achievements with XP
 * - Relapse tracking with recovery support
 * - Emergency "I'm struggling" button
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  Clock,
  DollarSign,
  Trophy,
  Heart,
  AlertTriangle,
  Trash2,
  ChevronRight,
  ChevronDown,
  X,
  Sparkles,
  Shield,
  Flame,
  Target,
  RefreshCw,
  Edit3,
  TrendingUp,
  Award,
  Zap,
  Wind,
  Coffee,
} from 'lucide-react';
import useBadHabitsStore, {
  HABIT_CATEGORIES,
  MILESTONES,
  HEALTH_BENEFITS,
} from '../../stores/badHabitsStore';
import { useGamificationModeStore, TERMINOLOGY } from '../../stores/gamificationModeStore';
import { feedback, celebrations } from '../../services/microInteractions';

// Mode-specific styling
const MODE_STYLES = {
  cosmic: {
    cardBg: 'bg-gradient-to-br from-purple-500/10 to-pink-500/10',
    cardBorder: 'border-purple-500/20',
    accentText: 'text-purple-400',
    progressBg: 'from-purple-500 to-pink-500',
    buttonBg: 'bg-purple-500 hover:bg-purple-600',
    emptyIcon: Shield,
  },
  professional: {
    cardBg: 'bg-gradient-to-br from-blue-500/10 to-cyan-500/10',
    cardBorder: 'border-blue-500/20',
    accentText: 'text-blue-400',
    progressBg: 'from-blue-500 to-cyan-500',
    buttonBg: 'bg-blue-500 hover:bg-blue-600',
    emptyIcon: Target,
  },
  minimal: {
    cardBg: 'bg-gradient-to-br from-emerald-500/10 to-teal-500/10',
    cardBorder: 'border-emerald-500/20',
    accentText: 'text-emerald-400',
    progressBg: 'from-emerald-500 to-teal-500',
    buttonBg: 'bg-emerald-500 hover:bg-emerald-600',
    emptyIcon: Target,
  },
};

// Live timer component
function LiveTimer({ startDate }) {
  const [timeSince, setTimeSince] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date();
      const start = new Date(startDate);
      const diffMs = now - start;

      const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

      setTimeSince({ days, hours, minutes, seconds });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [startDate]);

  return (
    <div className="flex items-center gap-2 text-2xl font-mono font-bold">
      <span className="text-white">{timeSince.days}</span>
      <span className="text-white/40 text-sm">d</span>
      <span className="text-white">{String(timeSince.hours).padStart(2, '0')}</span>
      <span className="text-white/40 text-sm">h</span>
      <span className="text-white">{String(timeSince.minutes).padStart(2, '0')}</span>
      <span className="text-white/40 text-sm">m</span>
      <span className="text-white/60 text-lg">{String(timeSince.seconds).padStart(2, '0')}</span>
      <span className="text-white/40 text-sm">s</span>
    </div>
  );
}

// Add Habit Modal
function AddHabitModal({ onClose, onSave }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('behavioral');
  const [costPerOccurrence, setCostPerOccurrence] = useState(0);
  const [frequencyPerDay, setFrequencyPerDay] = useState(1);
  const [motivation, setMotivation] = useState('');
  const [healthBenefitType, setHealthBenefitType] = useState('default');

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      category,
      costPerOccurrence: parseFloat(costPerOccurrence) || 0,
      frequencyPerDay: parseInt(frequencyPerDay) || 1,
      motivation: motivation.trim(),
      healthBenefitType,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1724] border border-white/10 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">Track a Habit to Quit</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg">
            <X className="w-5 h-5 text-white/60" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Habit Name */}
          <div>
            <label className="block text-sm text-white/60 mb-1">What habit do you want to quit?</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Smoking, Social Media, Junk Food..."
              className="w-full bg-[#0c0a10] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
              autoFocus
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm text-white/60 mb-2">Category</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(HABIT_CATEGORIES).map(([key, cat]) => (
                <button
                  key={key}
                  onClick={() => setCategory(key)}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    category === key
                      ? 'border-purple-500 bg-purple-500/20'
                      : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  <span className="text-xl mr-2">{cat.icon}</span>
                  <span className="text-white text-sm">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Cost tracking */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-white/60 mb-1">Cost per occurrence ($)</label>
              <input
                type="number"
                value={costPerOccurrence}
                onChange={(e) => setCostPerOccurrence(e.target.value)}
                min="0"
                step="0.5"
                placeholder="0"
                className="w-full bg-[#0c0a10] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-1">Times per day</label>
              <input
                type="number"
                value={frequencyPerDay}
                onChange={(e) => setFrequencyPerDay(e.target.value)}
                min="1"
                placeholder="1"
                className="w-full bg-[#0c0a10] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Health benefit type for specific habits */}
          <div>
            <label className="block text-sm text-white/60 mb-1">Health benefit timeline</label>
            <select
              value={healthBenefitType}
              onChange={(e) => setHealthBenefitType(e.target.value)}
              className="w-full bg-[#0c0a10] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
            >
              <option value="default">General habit</option>
              <option value="smoking">Smoking/Vaping</option>
              <option value="alcohol">Alcohol</option>
              <option value="sugar">Sugar/Junk Food</option>
              <option value="social_media">Social Media/Phone</option>
            </select>
          </div>

          {/* Motivation */}
          <div>
            <label className="block text-sm text-white/60 mb-1">Why do you want to quit? (optional)</label>
            <textarea
              value={motivation}
              onChange={(e) => setMotivation(e.target.value)}
              placeholder="Your reason for quitting..."
              rows={2}
              className="w-full bg-[#0c0a10] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 resize-none"
            />
          </div>
        </div>

        <div className="flex gap-3 p-4 border-t border-white/10">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 text-white/60 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="flex-1 px-4 py-3 bg-purple-500 hover:bg-purple-600 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
          >
            Start Tracking
          </button>
        </div>
      </div>
    </div>
  );
}

// Relapse Modal - for when user struggles
function RelapseModal({ habit, onClose, onConfirm }) {
  const [notes, setNotes] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  if (!showConfirm) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
        <div className="bg-[#1a1724] border border-white/10 rounded-2xl w-full max-w-md">
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-orange-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">You're Struggling</h2>
            <p className="text-white/60 mb-6">
              It's okay to struggle. What would help you right now?
            </p>

            <div className="space-y-3">
              <button
                onClick={onClose}
                className="w-full p-4 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-xl text-left transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Wind className="w-5 h-5 text-purple-400" />
                  <div>
                    <p className="text-white font-medium">Take Deep Breaths</p>
                    <p className="text-white/50 text-sm">4 seconds in, 4 hold, 4 out</p>
                  </div>
                </div>
              </button>

              <button
                onClick={onClose}
                className="w-full p-4 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-xl text-left transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Coffee className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="text-white font-medium">Do Something Else</p>
                    <p className="text-white/50 text-sm">Go for a walk, drink water, call a friend</p>
                  </div>
                </div>
              </button>

              {habit.motivation && (
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-left">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-green-400" />
                    <p className="text-green-400 font-medium text-sm">Remember Your Why</p>
                  </div>
                  <p className="text-white/80 text-sm italic">"{habit.motivation}"</p>
                </div>
              )}

              <div className="pt-2 border-t border-white/10">
                <button
                  onClick={() => setShowConfirm(true)}
                  className="w-full p-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors text-sm"
                >
                  I relapsed and want to reset my timer
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1724] border border-white/10 rounded-2xl w-full max-w-md">
        <div className="p-6">
          <div className="text-center mb-4">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <RefreshCw className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Reset Your Progress</h2>
            <p className="text-white/60">
              Relapsing doesn't erase your progress. Every attempt makes you stronger.
            </p>
          </div>

          <div className="mb-4">
            <label className="block text-sm text-white/60 mb-1">What triggered this? (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Understanding triggers helps prevent future relapses..."
              rows={3}
              className="w-full bg-[#0c0a10] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500 resize-none"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 text-white/60 hover:text-white transition-colors"
            >
              Go Back
            </button>
            <button
              onClick={() => {
                onConfirm(notes);
                onClose();
              }}
              className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
            >
              Reset Timer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Single Habit Card
function HabitCard({ habit, expanded, onToggleExpand, onDelete, onRelapse, modeStyle, terms }) {
  // Get the function reference, then call it - don't call inside selector to avoid infinite loop
  const getHabitStats = useBadHabitsStore(state => state.getHabitStats);
  const unlockedMilestones = useBadHabitsStore(state => state.unlockedMilestones);

  // Memoize stats calculation to prevent infinite re-renders
  const stats = useMemo(() => {
    return getHabitStats(habit.id);
  }, [getHabitStats, habit.id, habit.startDate, habit.costPerOccurrence, habit.frequencyPerDay, unlockedMilestones]);

  if (!stats) return null;

  const categoryData = HABIT_CATEGORIES[habit.category] || HABIT_CATEGORIES.behavioral;

  return (
    <div className={`${modeStyle.cardBg} border ${modeStyle.cardBorder} rounded-2xl overflow-hidden transition-all`}>
      {/* Header */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${categoryData.color} flex items-center justify-center text-2xl`}>
              {habit.icon}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{habit.name}</h3>
              <p className="text-white/50 text-sm">{categoryData.label}</p>
            </div>
          </div>
          <button
            onClick={() => onToggleExpand(habit.id)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            {expanded ? (
              <ChevronDown className="w-5 h-5 text-white/60" />
            ) : (
              <ChevronRight className="w-5 h-5 text-white/60" />
            )}
          </button>
        </div>

        {/* Main Timer */}
        <div className="text-center py-4">
          <p className="text-white/60 text-sm mb-2">Time Free</p>
          <LiveTimer startDate={habit.startDate} />
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          {habit.costPerOccurrence > 0 && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 text-center">
              <DollarSign className="w-5 h-5 text-green-400 mx-auto mb-1" />
              <p className="text-lg font-bold text-green-400">${stats.moneySaved.toFixed(0)}</p>
              <p className="text-xs text-white/50">Saved</p>
            </div>
          )}
          <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-3 text-center">
            <Trophy className="w-5 h-5 text-purple-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-purple-400">{stats.unlockedMilestones.length}</p>
            <p className="text-xs text-white/50">Milestones</p>
          </div>
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 text-center">
            <Zap className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-yellow-400">+{stats.totalXPEarned}</p>
            <p className="text-xs text-white/50">{terms.xp}</p>
          </div>
        </div>

        {/* Next Milestone Progress */}
        {stats.nextMilestone && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-white/60">Next: {stats.nextMilestone.icon} {stats.nextMilestone.label}</span>
              <span className={modeStyle.accentText}>{Math.round(stats.progressToNextMilestone)}%</span>
            </div>
            <div className="h-2 bg-[#0c0a10] rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${modeStyle.progressBg} transition-all duration-500`}
                style={{ width: `${stats.progressToNextMilestone}%` }}
              />
            </div>
          </div>
        )}

        {/* Struggle Button */}
        <button
          onClick={() => onRelapse(habit)}
          className="w-full mt-4 p-3 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 rounded-xl text-orange-400 text-sm font-medium transition-colors flex items-center justify-center gap-2"
        >
          <AlertTriangle className="w-4 h-4" />
          I'm Struggling
        </button>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="border-t border-white/10 p-4 space-y-4">
          {/* Motivation */}
          {habit.motivation && (
            <div className="bg-[#0c0a10] rounded-xl p-4">
              <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                <Target className="w-4 h-4 text-purple-400" />
                Your Motivation
              </h4>
              <p className="text-white/70 italic">"{habit.motivation}"</p>
            </div>
          )}

          {/* Health Benefits */}
          {stats.achievedBenefits.length > 0 && (
            <div>
              <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                <Heart className="w-4 h-4 text-red-400" />
                Health Improvements
              </h4>
              <div className="space-y-2">
                {stats.achievedBenefits.slice(-3).map((benefit, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-green-400 rounded-full" />
                    <span className="text-white/70">{benefit.benefit}</span>
                  </div>
                ))}
              </div>
              {stats.nextBenefit && (
                <div className="mt-2 text-sm text-white/50 flex items-center gap-2">
                  <Clock className="w-3 h-3" />
                  Next: {stats.nextBenefit.benefit}
                </div>
              )}
            </div>
          )}

          {/* Milestone Progress */}
          <div>
            <h4 className="text-white font-medium mb-2 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-400" />
              Milestones
            </h4>
            <div className="flex flex-wrap gap-2">
              {MILESTONES.slice(0, 6).map((milestone, i) => {
                const unlocked = stats.unlockedMilestones.some(m => m.days === milestone.days);
                return (
                  <div
                    key={i}
                    className={`px-3 py-1.5 rounded-full text-sm ${
                      unlocked
                        ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                        : 'bg-white/5 text-white/30 border border-white/10'
                    }`}
                  >
                    {milestone.icon} {milestone.label}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-[#0c0a10] rounded-lg p-3">
              <p className="text-white/50">Longest Streak</p>
              <p className="text-white font-bold">{habit.longestStreak} days</p>
            </div>
            <div className="bg-[#0c0a10] rounded-lg p-3">
              <p className="text-white/50">Total Relapses</p>
              <p className="text-white font-bold">{habit.totalRelapses}</p>
            </div>
          </div>

          {/* Delete Button */}
          <button
            onClick={() => onDelete(habit.id)}
            className="w-full p-3 text-red-400 hover:bg-red-500/10 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Stop Tracking
          </button>
        </div>
      )}
    </div>
  );
}

// Main Component
export default function BadHabitsTracker() {
  const mode = useGamificationModeStore((state) => state.mode);
  const terms = TERMINOLOGY[mode] || TERMINOLOGY.cosmic;
  const modeStyle = MODE_STYLES[mode] || MODE_STYLES.cosmic;

  const { habits, addHabit, deleteHabit, recordRelapse, getSummary, checkMilestones } = useBadHabitsStore();

  const [showAddModal, setShowAddModal] = useState(false);
  const [expandedHabit, setExpandedHabit] = useState(null);
  const [relapseHabit, setRelapseHabit] = useState(null);

  const summary = getSummary();
  const EmptyIcon = modeStyle.emptyIcon;

  // Check milestones periodically
  useEffect(() => {
    const checkAllMilestones = () => {
      habits.forEach(habit => {
        const newMilestones = checkMilestones(habit.id);
        if (newMilestones.length > 0) {
          // Trigger celebration for milestone unlock!
          newMilestones.forEach(milestone => {
            // Different celebration based on milestone significance
            if (milestone.days >= 30) {
              // Major milestone - full celebration
              feedback.streakMilestone(milestone.days);
            } else if (milestone.days >= 7) {
              // Weekly milestone - medium celebration
              celebrations.rise({ colors: celebrations.presets.PALETTES?.cosmic || ['#8B5CF6', '#A78BFA'] });
              feedback.achievement();
            } else {
              // Early milestone - subtle celebration
              feedback.achievement();
            }
          });
        }
      });
    };

    checkAllMilestones();
    const interval = setInterval(checkAllMilestones, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [habits, checkMilestones]);

  const handleToggleExpand = (habitId) => {
    setExpandedHabit(expandedHabit === habitId ? null : habitId);
  };

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      {habits.length > 0 && (
        <div className={`${modeStyle.cardBg} border ${modeStyle.cardBorder} rounded-2xl p-6`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-400" />
              Freedom Progress
            </h2>
            <div className="flex items-center gap-2 text-yellow-400">
              <Zap className="w-5 h-5" />
              <span className="font-bold">+{summary.totalXPEarned} {terms.xp}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-[#0c0a10] rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-white">{habits.length}</p>
              <p className="text-xs text-white/50">Habits Tracked</p>
            </div>
            <div className="bg-[#0c0a10] rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-green-400">${summary.totalMoneySaved.toFixed(0)}</p>
              <p className="text-xs text-white/50">Total Saved</p>
            </div>
            <div className="bg-[#0c0a10] rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-purple-400">{summary.totalMilestones}</p>
              <p className="text-xs text-white/50">Milestones</p>
            </div>
            <div className="bg-[#0c0a10] rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-orange-400">{summary.longestCurrentStreak}</p>
              <p className="text-xs text-white/50">Longest Streak</p>
            </div>
          </div>
        </div>
      )}

      {/* Habits List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Flame className={`w-5 h-5 ${modeStyle.accentText}`} />
            {mode === 'cosmic' ? 'Habits to Conquer' : 'Habits to Break'}
          </h3>
          <button
            onClick={() => setShowAddModal(true)}
            className={`flex items-center gap-2 px-4 py-2 ${modeStyle.buttonBg} text-white rounded-lg font-medium transition-colors`}
          >
            <Plus className="w-4 h-4" />
            Add Habit
          </button>
        </div>

        {habits.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {habits.map(habit => (
              <HabitCard
                key={habit.id}
                habit={habit}
                expanded={expandedHabit === habit.id}
                onToggleExpand={handleToggleExpand}
                onDelete={deleteHabit}
                onRelapse={setRelapseHabit}
                modeStyle={modeStyle}
                terms={terms}
              />
            ))}
          </div>
        ) : (
          <div className={`${modeStyle.cardBg} border ${modeStyle.cardBorder} rounded-2xl p-8 text-center`}>
            <EmptyIcon className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <h3 className="text-white font-semibold mb-2">No habits tracked yet</h3>
            <p className="text-white/50 text-sm mb-4">
              Start tracking a habit you want to quit. We'll help you stay accountable and celebrate your progress.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className={`inline-flex items-center gap-2 px-6 py-3 ${modeStyle.buttonBg} text-white rounded-lg font-medium transition-colors`}
            >
              <Plus className="w-4 h-4" />
              Track Your First Habit
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddHabitModal
          onClose={() => setShowAddModal(false)}
          onSave={addHabit}
        />
      )}

      {relapseHabit && (
        <RelapseModal
          habit={relapseHabit}
          onClose={() => setRelapseHabit(null)}
          onConfirm={(notes) => recordRelapse(relapseHabit.id, notes)}
        />
      )}
    </div>
  );
}
