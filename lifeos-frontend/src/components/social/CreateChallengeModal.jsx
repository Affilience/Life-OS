/**
 * Create Challenge Modal
 * UI for creating new challenges (individual, community, head-to-head)
 */

import React, { useState } from 'react';
import {
  X,
  Target,
  Users,
  Swords,
  Trophy,
  Calendar,
  Zap,
  Dumbbell,
  BookOpen,
  TrendingUp,
  Heart,
  Flame,
  Star,
  Coins,
  AlertCircle,
} from 'lucide-react';
import { useSocialStore } from '../../stores/socialStore';
import { useGamificationStore } from '../../stores/gamificationStore';

const METRIC_TYPES = [
  { id: 'total_xp', label: 'Total XP', icon: Zap, description: 'Earn XP from any activity' },
  { id: 'workout_count', label: 'Workouts', icon: Dumbbell, description: 'Complete workouts' },
  { id: 'streak_days', label: 'Streak Days', icon: Flame, description: 'Maintain daily streak' },
  { id: 'tasks_completed', label: 'Tasks', icon: Target, description: 'Complete tasks' },
  { id: 'journal_entries', label: 'Journal Entries', icon: BookOpen, description: 'Write journal entries' },
  { id: 'health_score', label: 'Health Score', icon: Heart, description: 'Improve health score' },
];

const CHALLENGE_ICONS = ['🎯', '🏆', '⚔️', '🔥', '💪', '🚀', '⭐', '🎮', '📈', '🏅'];

const DURATION_OPTIONS = [
  { days: 1, label: '1 Day' },
  { days: 3, label: '3 Days' },
  { days: 7, label: '1 Week' },
  { days: 14, label: '2 Weeks' },
  { days: 30, label: '1 Month' },
];

// Common wager amounts for quick selection
const WAGER_PRESETS = [0, 50, 100, 250, 500];

export default function CreateChallengeModal({ isOpen, onClose, initialType = 'individual', opponent = null }) {
  const { createChallenge, createHeadToHead, friends } = useSocialStore();
  const { cosmicCredits } = useGamificationStore();

  const [challengeType, setChallengeType] = useState(initialType);
  const [selectedOpponent, setSelectedOpponent] = useState(opponent);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    metricType: 'total_xp',
    targetValue: 100,
    durationDays: 7,
    xpReward: 100,
    icon: '🎯',
    wagerAmount: 0, // Credit wager for H2H
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check if user has enough credits for the wager
  const hasEnoughCredits = cosmicCredits >= formData.wagerAmount;

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let result;

      if (challengeType === 'head_to_head') {
        if (!selectedOpponent) {
          setError('Please select an opponent');
          setLoading(false);
          return;
        }
        if (formData.wagerAmount > 0 && !hasEnoughCredits) {
          setError(`Insufficient credits. You have ${cosmicCredits} but need ${formData.wagerAmount}`);
          setLoading(false);
          return;
        }
        // Use user_id for consistency - some friend objects may have id, others user_id
        const opponentId = selectedOpponent.user_id || selectedOpponent.id;
        result = await createHeadToHead(opponentId, {
          title: formData.title,
          metricType: formData.metricType,
          targetValue: formData.targetValue,
          durationDays: formData.durationDays,
          xpReward: formData.xpReward,
          wagerAmount: formData.wagerAmount,
        });
      } else {
        result = await createChallenge({
          ...formData,
          challengeType,
        });
      }

      if (result.error) {
        setError(result.error);
      } else {
        onClose();
      }
    } catch (err) {
      setError('Failed to create challenge');
    } finally {
      setLoading(false);
    }
  };

  const selectedMetric = METRIC_TYPES.find(m => m.id === formData.metricType);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-gray-900 border border-white/10 rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">Create Challenge</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Challenge Type Selection */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              Challenge Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setChallengeType('individual')}
                className={`p-3 rounded-lg border flex flex-col items-center gap-2 transition-colors ${
                  challengeType === 'individual'
                    ? 'bg-purple-500/20 border-purple-500 text-purple-400'
                    : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                }`}
              >
                <Target className="w-5 h-5" />
                <span className="text-xs font-medium">Individual</span>
              </button>
              <button
                type="button"
                onClick={() => setChallengeType('community')}
                className={`p-3 rounded-lg border flex flex-col items-center gap-2 transition-colors ${
                  challengeType === 'community'
                    ? 'bg-green-500/20 border-green-500 text-green-400'
                    : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                }`}
              >
                <Users className="w-5 h-5" />
                <span className="text-xs font-medium">Community</span>
              </button>
              <button
                type="button"
                onClick={() => setChallengeType('head_to_head')}
                className={`p-3 rounded-lg border flex flex-col items-center gap-2 transition-colors ${
                  challengeType === 'head_to_head'
                    ? 'bg-orange-500/20 border-orange-500 text-orange-400'
                    : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                }`}
              >
                <Swords className="w-5 h-5" />
                <span className="text-xs font-medium">Head-to-Head</span>
              </button>
            </div>
          </div>

          {/* Opponent Selection (H2H only) */}
          {challengeType === 'head_to_head' && (
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Choose Opponent
              </label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {friends.length === 0 ? (
                  <p className="text-sm text-white/40 text-center py-4">
                    Add friends to challenge them!
                  </p>
                ) : (
                  friends.map(friend => (
                    <button
                      key={friend.user_id}
                      type="button"
                      onClick={() => setSelectedOpponent(friend)}
                      className={`w-full p-3 rounded-lg border flex items-center gap-3 transition-colors ${
                        selectedOpponent?.user_id === friend.user_id
                          ? 'bg-orange-500/20 border-orange-500'
                          : 'bg-white/5 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        {friend.avatar_url ? (
                          <img
                            src={friend.avatar_url}
                            alt=""
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-white text-sm font-medium">
                            {friend.display_name?.[0] || '?'}
                          </span>
                        )}
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-medium text-white">{friend.display_name}</p>
                        <p className="text-xs text-white/50">Level {friend.current_level || 1}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">
              Challenge Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Weekly XP Sprint"
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              required
            />
          </div>

          {/* Description (optional for individual) */}
          {challengeType !== 'head_to_head' && (
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">
                Description <span className="text-white/40">(optional)</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your challenge..."
                rows={2}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none"
              />
            </div>
          )}

          {/* Icon Selection */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              Icon
            </label>
            <div className="flex flex-wrap gap-2">
              {CHALLENGE_ICONS.map(icon => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setFormData({ ...formData, icon })}
                  className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-colors ${
                    formData.icon === icon
                      ? 'bg-purple-500/30 ring-2 ring-purple-500'
                      : 'bg-white/5 hover:bg-white/10'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Metric Type */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              Metric
            </label>
            <div className="grid grid-cols-2 gap-2">
              {METRIC_TYPES.map(metric => (
                <button
                  key={metric.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, metricType: metric.id })}
                  className={`p-3 rounded-lg border flex items-center gap-3 transition-colors text-left ${
                    formData.metricType === metric.id
                      ? 'bg-purple-500/20 border-purple-500'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <metric.icon className={`w-5 h-5 ${
                    formData.metricType === metric.id ? 'text-purple-400' : 'text-white/60'
                  }`} />
                  <div>
                    <p className={`text-sm font-medium ${
                      formData.metricType === metric.id ? 'text-white' : 'text-white/80'
                    }`}>
                      {metric.label}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Target Value */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">
              Target ({selectedMetric?.label})
            </label>
            <input
              type="number"
              value={formData.targetValue}
              onChange={(e) => setFormData({ ...formData, targetValue: parseInt(e.target.value) || 0 })}
              min={1}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              required
            />
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              Duration
            </label>
            <div className="flex flex-wrap gap-2">
              {DURATION_OPTIONS.map(option => (
                <button
                  key={option.days}
                  type="button"
                  onClick={() => setFormData({ ...formData, durationDays: option.days })}
                  className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                    formData.durationDays === option.days
                      ? 'bg-purple-500/20 border-purple-500 text-purple-400'
                      : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* XP Reward */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">
              XP Reward
            </label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                value={formData.xpReward}
                onChange={(e) => setFormData({ ...formData, xpReward: parseInt(e.target.value) })}
                min={50}
                max={500}
                step={25}
                className="flex-1"
              />
              <div className="w-20 px-3 py-2 bg-yellow-500/20 text-yellow-400 rounded-lg text-center font-medium">
                {formData.xpReward} XP
              </div>
            </div>
          </div>

          {/* Credit Wager (H2H only) */}
          {challengeType === 'head_to_head' && (
            <div className="p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-amber-400 flex items-center gap-2">
                  <Coins className="w-4 h-4" />
                  Credit Wager (Optional)
                </label>
                <div className="text-xs text-white/50">
                  Your Balance: <span className="text-amber-400 font-medium">{cosmicCredits?.toLocaleString() || 0}</span>
                </div>
              </div>

              {/* Preset amounts */}
              <div className="flex flex-wrap gap-2 mb-3">
                {WAGER_PRESETS.map(amount => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => setFormData({ ...formData, wagerAmount: amount })}
                    disabled={amount > cosmicCredits}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      formData.wagerAmount === amount
                        ? 'bg-amber-500/30 border-amber-500 text-amber-400 border'
                        : amount > cosmicCredits
                        ? 'bg-white/5 border-white/5 text-white/30 border cursor-not-allowed'
                        : 'bg-white/5 border-white/10 text-white/60 border hover:bg-white/10'
                    }`}
                  >
                    {amount === 0 ? 'No Wager' : `${amount}`}
                  </button>
                ))}
              </div>

              {/* Custom amount input */}
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={formData.wagerAmount}
                  onChange={(e) => setFormData({ ...formData, wagerAmount: Math.max(0, parseInt(e.target.value) || 0) })}
                  min={0}
                  max={cosmicCredits}
                  placeholder="Custom amount"
                  className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
                <span className="text-amber-400 text-sm">credits</span>
              </div>

              {/* Wager info */}
              {formData.wagerAmount > 0 && (
                <div className="mt-3 p-2 bg-white/5 rounded-lg">
                  <div className="flex items-start gap-2 text-xs">
                    <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div className="text-white/60">
                      <p>Both players wager <span className="text-amber-400 font-medium">{formData.wagerAmount}</span> credits.</p>
                      <p className="mt-1">Winner takes all: <span className="text-green-400 font-medium">+{formData.wagerAmount * 2}</span> credits!</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Insufficient credits warning */}
              {formData.wagerAmount > cosmicCredits && (
                <div className="mt-2 p-2 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center gap-2 text-xs text-red-400">
                  <AlertCircle className="w-4 h-4" />
                  Insufficient credits
                </div>
              )}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              'Creating...'
            ) : (
              <>
                <Trophy className="w-4 h-4" />
                Create Challenge
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
