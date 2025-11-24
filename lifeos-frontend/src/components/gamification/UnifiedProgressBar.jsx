import React from 'react';
import { useGamificationStore } from '../../stores/gamificationStore';
import { formatXP } from '../../stores/gamificationStore';

/**
 * Unified Progress Bar - Shows Level, Stage, and XP Progress
 *
 * This is the main progress indicator shown throughout the app
 */
export default function UnifiedProgressBar({ compact = false, showDetails = true }) {
  const {
    level,
    currentStage,
    currentXP,
    xpToNextLevel,
    xpMultiplier,
    totalDefense,
    totalStrength,
  } = useGamificationStore();

  const progressPercent = (currentXP / xpToNextLevel) * 100;

  if (compact) {
    return (
      <div className="flex items-center gap-3 bg-gray-800/50 rounded-lg px-3 py-2">
        {/* Level Badge */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
            {level}
          </div>
          <span className="text-sm text-gray-300">Lvl {level}</span>
        </div>

        {/* XP Bar */}
        <div className="flex-1 min-w-[100px]">
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* XP Text */}
        <span className="text-xs text-gray-400">
          {formatXP(currentXP)}/{formatXP(xpToNextLevel)}
        </span>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          {/* Level Badge */}
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">{level}</span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-purple-600 border-2 border-gray-800 flex items-center justify-center">
              <span className="text-white font-bold text-xs">{currentStage}</span>
            </div>
          </div>

          {/* Level Info */}
          <div>
            <h3 className="text-white font-semibold">Level {level}</h3>
            <p className="text-sm text-gray-400">Stage {currentStage} Evolution</p>
          </div>
        </div>

        {/* Multiplier Badge */}
        {xpMultiplier > 1.0 && (
          <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-lg px-3 py-1">
            <span className="text-amber-400 font-semibold text-sm">
              {xpMultiplier.toFixed(2)}x XP
            </span>
          </div>
        )}
      </div>

      {/* XP Progress Bar */}
      <div className="relative mb-2">
        <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 transition-all duration-500 relative"
            style={{ width: `${progressPercent}%` }}
          >
            {/* Animated shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
          </div>
        </div>

        {/* Progress text */}
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-gray-400">
            {formatXP(currentXP)} / {formatXP(xpToNextLevel)} XP
          </span>
          <span className="text-xs text-cyan-400 font-semibold">
            {progressPercent.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Stats Row */}
      {showDetails && (totalDefense > 0 || totalStrength > 0) && (
        <div className="flex items-center gap-4 pt-3 border-t border-gray-700/50">
          {totalDefense > 0 && (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-blue-500/20 flex items-center justify-center">
                <span className="text-blue-400 text-xs">🛡</span>
              </div>
              <div>
                <p className="text-xs text-gray-400">Defense</p>
                <p className="text-sm text-white font-semibold">{totalDefense}</p>
              </div>
            </div>
          )}

          {totalStrength > 0 && (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-red-500/20 flex items-center justify-center">
                <span className="text-red-400 text-xs">⚔️</span>
              </div>
              <div>
                <p className="text-xs text-gray-400">Strength</p>
                <p className="text-sm text-white font-semibold">{totalStrength}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
