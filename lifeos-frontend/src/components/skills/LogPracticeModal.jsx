import React, { useState, useMemo } from 'react';
import { X, Clock, Flame, TrendingUp, Zap, Check } from 'lucide-react';
import useSkillsStore, {
  getProficiencyLevel,
  getXpProgress,
  calculateXpFromMinutes,
  getPracticeHeatmap,
  SKILL_CATEGORIES,
} from '../../stores/skillsStore';

/**
 * Enhanced Log Practice Modal
 *
 * Features:
 * - Live XP preview as you enter duration
 * - Progress ring showing current level progress
 * - 7-day streak calendar
 * - Visual feedback for leveling up
 */
export default function LogPracticeModal({ skill, onClose, onSuccess }) {
  const { logPractice, getSkillStats } = useSkillsStore();
  const [minutes, setMinutes] = useState('');
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [earnedXp, setEarnedXp] = useState(0);

  // Get current skill stats
  const stats = useMemo(() => getSkillStats(skill.id), [skill.id, getSkillStats]);

  // Calculate preview values based on entered minutes
  const preview = useMemo(() => {
    const mins = parseInt(minutes) || 0;
    const xpToEarn = calculateXpFromMinutes(mins);
    const newTotalXp = skill.xp + xpToEarn;
    const currentLevel = getProficiencyLevel(skill.xp);
    const newLevel = getProficiencyLevel(newTotalXp);
    const currentProgress = getXpProgress(skill.xp);
    const newProgress = getXpProgress(newTotalXp);
    const willLevelUp = newLevel.id !== currentLevel.id;

    return {
      xpToEarn,
      newTotalXp,
      currentLevel,
      newLevel,
      currentProgress,
      newProgress,
      willLevelUp,
    };
  }, [minutes, skill.xp]);

  // Get last 7 days heatmap
  const weekHeatmap = useMemo(() => {
    return getPracticeHeatmap(skill.sessions || [], 7);
  }, [skill.sessions]);

  const handleSave = async () => {
    if (!minutes || parseInt(minutes) <= 0) return;

    setIsSaving(true);

    try {
      const result = logPractice(skill.id, parseInt(minutes), notes);
      setEarnedXp(result.xpEarned);
      setShowSuccess(true);

      // Auto close after showing success
      setTimeout(() => {
        onSuccess?.(result);
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Failed to log practice:', error);
      setIsSaving(false);
    }
  };

  const category = SKILL_CATEGORIES.find(c => c.id === skill.category);

  // Success animation overlay
  if (showSuccess) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-[#12101a] border border-green-500/30 rounded-2xl max-w-md w-full p-8 shadow-2xl text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center animate-bounce">
            <Check className="w-10 h-10 text-green-400" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Practice Logged!</h3>
          <div className="flex items-center justify-center gap-2 text-xl text-yellow-400 font-bold">
            <Zap className="w-6 h-6" />
            <span>+{earnedXp} XP</span>
          </div>
          {preview.willLevelUp && (
            <div className="mt-4 px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-lg inline-block">
              <span className="text-purple-400 font-semibold">
                Level Up! → {preview.newLevel.name}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#12101a] border border-slate-700 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-b border-slate-700/50 p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center text-3xl">
                {skill.icon}
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">{skill.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded bg-${category?.color || 'slate'}-500/20 text-${category?.color || 'slate'}-400`}>
                    {category?.name || skill.category}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded bg-${preview.currentLevel.color}-500/20 text-${preview.currentLevel.color}-400`}>
                    {preview.currentLevel.name}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5">
          {/* Progress Ring & XP Preview */}
          <div className="flex items-center gap-6">
            {/* Progress Ring */}
            <div className="relative w-28 h-28 flex-shrink-0">
              <svg className="w-28 h-28 transform -rotate-90">
                {/* Background ring */}
                <circle
                  cx="56"
                  cy="56"
                  r="48"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-slate-700"
                />
                {/* Current progress */}
                <circle
                  cx="56"
                  cy="56"
                  r="48"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 48}`}
                  strokeDashoffset={`${2 * Math.PI * 48 * (1 - preview.currentProgress.percent / 100)}`}
                  className="text-purple-500 transition-all duration-300"
                  strokeLinecap="round"
                />
                {/* Preview progress (if entered minutes) */}
                {preview.xpToEarn > 0 && (
                  <circle
                    cx="56"
                    cy="56"
                    r="48"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 48}`}
                    strokeDashoffset={`${2 * Math.PI * 48 * (1 - preview.newProgress.percent / 100)}`}
                    className="text-green-400 transition-all duration-300"
                    strokeLinecap="round"
                    opacity="0.5"
                  />
                )}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-white">{skill.xp}</span>
                <span className="text-xs text-slate-400">XP</span>
              </div>
            </div>

            {/* XP Preview Stats */}
            <div className="flex-1 space-y-3">
              <div className="bg-[#1a1724] rounded-xl p-4 border border-slate-700/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-400">XP to earn</span>
                  <div className="flex items-center gap-1 text-yellow-400 font-bold">
                    <Zap className="w-4 h-4" />
                    <span>+{preview.xpToEarn}</span>
                  </div>
                </div>
                <div className="text-xs text-slate-500">
                  {preview.willLevelUp ? (
                    <span className="text-green-400 font-semibold">
                      🎉 Will level up to {preview.newLevel.name}!
                    </span>
                  ) : (
                    <span>
                      {preview.newProgress.toNextLevel} XP to {preview.newLevel?.name || 'next level'}
                    </span>
                  )}
                </div>
              </div>

              {/* Quick stats */}
              <div className="flex gap-3">
                <div className="flex-1 bg-[#1a1724] rounded-lg p-3 border border-slate-700/50 text-center">
                  <div className="flex items-center justify-center gap-1 text-orange-400 mb-1">
                    <Flame className="w-4 h-4" />
                    <span className="font-bold">{stats?.streak || 0}</span>
                  </div>
                  <div className="text-xs text-slate-500">Streak</div>
                </div>
                <div className="flex-1 bg-[#1a1724] rounded-lg p-3 border border-slate-700/50 text-center">
                  <div className="flex items-center justify-center gap-1 text-cyan-400 mb-1">
                    <Clock className="w-4 h-4" />
                    <span className="font-bold">{stats?.totalHours || 0}h</span>
                  </div>
                  <div className="text-xs text-slate-500">Total</div>
                </div>
              </div>
            </div>
          </div>

          {/* 7-Day Streak Calendar */}
          <div className="bg-[#1a1724] rounded-xl p-4 border border-slate-700/50">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-slate-300">Last 7 Days</span>
              <span className="text-xs text-slate-500">{stats?.streak || 0} day streak</span>
            </div>
            <div className="flex justify-between gap-1">
              {weekHeatmap.map((day, i) => {
                const dayName = new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' });
                const isToday = day.date === new Date().toISOString().split('T')[0];
                return (
                  <div key={i} className="flex-1 text-center">
                    <div className="text-[10px] text-slate-500 mb-1">{dayName}</div>
                    <div
                      className={`
                        w-full aspect-square rounded-lg flex items-center justify-center text-xs font-medium
                        ${day.practiced
                          ? 'bg-green-500/20 border border-green-500/30 text-green-400'
                          : isToday
                            ? 'bg-purple-500/10 border border-purple-500/30 border-dashed text-purple-400'
                            : 'bg-slate-700/30 border border-slate-700/50 text-slate-500'
                        }
                      `}
                      title={`${day.minutes} minutes`}
                    >
                      {day.practiced ? (
                        <Check className="w-4 h-4" />
                      ) : isToday ? (
                        '?'
                      ) : (
                        ''
                      )}
                    </div>
                    {day.minutes > 0 && (
                      <div className="text-[10px] text-slate-500 mt-1">{day.minutes}m</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Duration Input */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Duration (minutes) *
            </label>
            <div className="flex gap-2">
              {[15, 30, 45, 60].map((mins) => (
                <button
                  key={mins}
                  onClick={() => setMinutes(mins.toString())}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                    minutes === mins.toString()
                      ? 'bg-purple-500 text-white'
                      : 'bg-[#1a1724] text-slate-400 hover:text-white border border-slate-700'
                  }`}
                >
                  {mins}m
                </button>
              ))}
            </div>
            <input
              type="number"
              min="1"
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
              placeholder="Or enter custom minutes..."
              className="w-full mt-2 px-4 py-2.5 bg-[#1a1724] border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
              autoFocus
            />
          </div>

          {/* Notes Input */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              What did you work on? (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Practiced chord progressions, learned new song..."
              rows={3}
              className="w-full px-4 py-2.5 bg-[#1a1724] border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 resize-none transition-colors"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-[#1a1724] hover:bg-slate-700 border border-slate-700 rounded-xl text-white font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!minutes || parseInt(minutes) <= 0 || isSaving}
              className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-slate-600 disabled:to-slate-600 disabled:cursor-not-allowed rounded-xl text-white font-semibold transition-all flex items-center justify-center gap-2"
            >
              {isSaving ? (
                'Saving...'
              ) : (
                <>
                  <TrendingUp className="w-5 h-5" />
                  Log Practice
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
