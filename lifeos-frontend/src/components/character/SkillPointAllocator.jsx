import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Minus,
  RotateCcw,
  Check,
  Sparkles,
  Sword,
  Heart,
  Brain,
  Shield,
  Zap,
} from 'lucide-react';
import { useSkillPointsStore } from '../../stores/skillPointsStore';
import { STAT_CONFIG, STATS } from '../../utils/statsSystem';

const STAT_ICONS = {
  strength: Sword,
  vitality: Heart,
  intelligence: Brain,
  wisdom: Sparkles,
  defense: Shield,
};

const STAT_COLORS = {
  strength: '#EF4444',
  vitality: '#10B981',
  intelligence: '#8B5CF6',
  wisdom: '#F59E0B',
  defense: '#3B82F6',
};

export default function SkillPointAllocator({ onClose, compact = false }) {
  const {
    unallocatedPoints,
    allocatedPoints,
    allocatePoint,
    allocatePoints,
    resetPoints,
  } = useSkillPointsStore();

  const [pendingAllocations, setPendingAllocations] = useState({
    strength: 0,
    vitality: 0,
    intelligence: 0,
    wisdom: 0,
    defense: 0,
  });
  const [isApplying, setIsApplying] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const totalPending = Object.values(pendingAllocations).reduce((sum, val) => sum + val, 0);
  const availablePoints = unallocatedPoints - totalPending;

  const handleIncrement = (stat) => {
    if (availablePoints > 0) {
      setPendingAllocations(prev => ({
        ...prev,
        [stat]: prev[stat] + 1,
      }));
    }
  };

  const handleDecrement = (stat) => {
    if (pendingAllocations[stat] > 0) {
      setPendingAllocations(prev => ({
        ...prev,
        [stat]: prev[stat] - 1,
      }));
    }
  };

  const handleApply = async () => {
    if (totalPending === 0) return;

    setIsApplying(true);
    const result = await allocatePoints(pendingAllocations);

    if (result.success) {
      setPendingAllocations({
        strength: 0,
        vitality: 0,
        intelligence: 0,
        wisdom: 0,
        defense: 0,
      });
    }
    setIsApplying(false);
  };

  const handleReset = async () => {
    setIsResetting(true);
    const result = await resetPoints(500);

    if (result.success) {
      setShowResetConfirm(false);
    } else if (result.error) {
      alert(result.error);
    }
    setIsResetting(false);
  };

  const handleClearPending = () => {
    setPendingAllocations({
      strength: 0,
      vitality: 0,
      intelligence: 0,
      wisdom: 0,
      defense: 0,
    });
  };

  const totalAllocated = Object.values(allocatedPoints).reduce((sum, val) => sum + val, 0);

  if (compact) {
    const hasPoints = availablePoints > 0;

    return (
      <div className={`rounded-lg p-3 border ${hasPoints ? 'bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/30' : 'bg-slate-800/50 border-slate-700'}`}>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-white flex items-center gap-2">
            <Zap className={`w-4 h-4 ${hasPoints ? 'text-yellow-400' : 'text-slate-400'}`} />
            Skill Points
          </h3>
          {hasPoints ? (
            <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs font-bold rounded-full animate-pulse">
              {availablePoints} to spend
            </span>
          ) : (
            <span className="px-2 py-0.5 bg-slate-700 text-slate-400 text-xs rounded-full">
              {totalAllocated} allocated
            </span>
          )}
        </div>

        <div className="space-y-1.5">
          {Object.entries(allocatedPoints).map(([stat, points]) => {
            const Icon = STAT_ICONS[stat];
            const color = STAT_COLORS[stat];
            const pending = pendingAllocations[stat];

            return (
              <div
                key={stat}
                className="flex items-center gap-2 p-1.5 bg-slate-900/50 rounded-lg"
              >
                <Icon className="w-3.5 h-3.5" style={{ color }} />
                <span className="text-xs text-slate-300 capitalize flex-1">{stat}</span>
                <span className="text-xs font-medium text-white w-6 text-center">{points}</span>
                {pending > 0 && (
                  <span className="text-xs font-bold text-green-400">+{pending}</span>
                )}
                <div className="flex items-center gap-0.5">
                  <button
                    onClick={() => handleDecrement(stat)}
                    disabled={pending === 0}
                    className="w-5 h-5 rounded bg-slate-700 hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                  >
                    <Minus className="w-3 h-3 text-white" />
                  </button>
                  <button
                    onClick={() => handleIncrement(stat)}
                    disabled={availablePoints === 0}
                    className="w-5 h-5 rounded bg-slate-700 hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                  >
                    <Plus className="w-3 h-3 text-white" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Apply Button */}
        {totalPending > 0 && (
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleClearPending}
              className="px-2 py-1 text-xs bg-slate-700 hover:bg-slate-600 text-white rounded transition-colors"
            >
              Clear
            </button>
            <button
              onClick={handleApply}
              disabled={isApplying}
              className="flex-1 px-2 py-1 text-xs bg-green-600 hover:bg-green-500 disabled:bg-green-800 text-white font-medium rounded transition-colors flex items-center justify-center gap-1"
            >
              {isApplying ? (
                'Applying...'
              ) : (
                <>
                  <Check className="w-3 h-3" />
                  Apply {totalPending}
                </>
              )}
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-slate-900/95 rounded-xl border border-slate-700 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            Allocate Skill Points
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Earn 3 points per level. Total allocated: {totalAllocated}
          </p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-yellow-400">{availablePoints}</div>
          <div className="text-xs text-slate-400">Available</div>
        </div>
      </div>

      {/* Stat Allocation */}
      <div className="space-y-3 mb-6">
        {Object.entries(allocatedPoints).map(([stat, points]) => {
          const Icon = STAT_ICONS[stat];
          const color = STAT_COLORS[stat];
          const pending = pendingAllocations[stat];
          const config = STAT_CONFIG[stat];

          return (
            <div
              key={stat}
              className="flex items-center gap-4 p-3 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors"
            >
              {/* Stat Icon & Name */}
              <div className="flex items-center gap-3 w-40">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${color}20` }}
                >
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
                <div>
                  <div className="font-medium text-white capitalize">{stat}</div>
                  <div className="text-xs text-slate-400">{config?.shortName}</div>
                </div>
              </div>

              {/* Current + Pending Display */}
              <div className="flex-1 flex items-center gap-2">
                <div className="text-lg font-bold text-white">{points}</div>
                {pending > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-lg font-bold text-green-400"
                  >
                    +{pending}
                  </motion.div>
                )}
              </div>

              {/* Progress Bar */}
              <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(100, ((points + pending) / 100) * 100)}%`,
                    backgroundColor: color,
                  }}
                />
              </div>

              {/* Controls */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleDecrement(stat)}
                  disabled={pending === 0}
                  className="w-8 h-8 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                >
                  <Minus className="w-4 h-4 text-white" />
                </button>
                <button
                  onClick={() => handleIncrement(stat)}
                  disabled={availablePoints === 0}
                  className="w-8 h-8 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                >
                  <Plus className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        {totalPending > 0 && (
          <>
            <button
              onClick={handleClearPending}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
            >
              Clear
            </button>
            <button
              onClick={handleApply}
              disabled={isApplying}
              className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-500 disabled:bg-green-800 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isApplying ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <Sparkles className="w-4 h-4" />
                  </motion.div>
                  Applying...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Apply {totalPending} Points
                </>
              )}
            </button>
          </>
        )}

        {totalAllocated > 0 && (
          <button
            onClick={() => setShowResetConfirm(true)}
            className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset (500 Credits)
          </button>
        )}

        {onClose && (
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
          >
            Close
          </button>
        )}
      </div>

      {/* Reset Confirmation Modal */}
      <AnimatePresence>
        {showResetConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            onClick={() => setShowResetConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-800 rounded-xl p-6 max-w-md w-full border border-slate-700"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-white mb-2">Reset Skill Points?</h3>
              <p className="text-slate-400 mb-4">
                This will refund all {totalAllocated} allocated points and cost 500 Cosmic Credits.
                You can then reallocate them however you want.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReset}
                  disabled={isResetting}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-500 disabled:bg-red-800 text-white font-medium rounded-lg transition-colors"
                >
                  {isResetting ? 'Resetting...' : 'Reset Points'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
