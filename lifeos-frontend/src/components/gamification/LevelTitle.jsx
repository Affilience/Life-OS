/**
 * LevelTitle - Displays the user's level-based title/rank
 *
 * Features:
 * - Shows title with icon and color based on level
 * - Optional level badge
 * - Progress bar to next title
 * - Tooltip with title progression info
 */

import React from 'react';
import { motion } from 'framer-motion';
import { getLevelTitle, getTitleProgress } from '../../data/levelProgression';
import useLevelProgressionStore from '../../stores/levelProgressionStore';

// Size variants
const SIZES = {
  xs: { icon: 'text-xs', title: 'text-xs', level: 'text-[10px]', gap: 'gap-0.5', padding: 'px-1.5 py-0.5' },
  sm: { icon: 'text-sm', title: 'text-sm', level: 'text-xs', gap: 'gap-1', padding: 'px-2 py-1' },
  md: { icon: 'text-base', title: 'text-base', level: 'text-sm', gap: 'gap-1.5', padding: 'px-3 py-1.5' },
  lg: { icon: 'text-lg', title: 'text-lg', level: 'text-base', gap: 'gap-2', padding: 'px-4 py-2' },
  xl: { icon: 'text-2xl', title: 'text-xl', level: 'text-lg', gap: 'gap-2', padding: 'px-5 py-2.5' },
};

export default function LevelTitle({
  level,
  size = 'md',
  showIcon = true,
  showLevel = true,
  showProgress = false,
  showTooltip = true,
  variant = 'badge', // 'badge', 'inline', 'minimal'
  className = '',
}) {
  const { customTitle, showLevelBadge } = useLevelProgressionStore();
  const titleData = getLevelTitle(level);
  const progress = getTitleProgress(level);
  const sizeConfig = SIZES[size] || SIZES.md;

  // Use custom title if set
  const displayTitle = customTitle || titleData.title;
  const displayIcon = customTitle ? '⭐' : titleData.icon;

  if (variant === 'minimal') {
    return (
      <span
        className={`font-medium ${sizeConfig.title} ${className}`}
        style={{ color: titleData.color }}
      >
        {displayTitle}
      </span>
    );
  }

  if (variant === 'inline') {
    return (
      <span className={`inline-flex items-center ${sizeConfig.gap} ${className}`}>
        {showIcon && <span className={sizeConfig.icon}>{displayIcon}</span>}
        <span className={`font-medium ${sizeConfig.title}`} style={{ color: titleData.color }}>
          {displayTitle}
        </span>
        {showLevel && showLevelBadge && (
          <span className={`text-white/60 ${sizeConfig.level}`}>Lv.{level}</span>
        )}
      </span>
    );
  }

  // Badge variant (default)
  return (
    <div className={`relative group ${className}`}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`inline-flex items-center ${sizeConfig.gap} ${sizeConfig.padding} rounded-lg`}
        style={{
          backgroundColor: `${titleData.color}20`,
          border: `1px solid ${titleData.color}40`,
        }}
      >
        {showIcon && (
          <motion.span
            className={sizeConfig.icon}
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            {displayIcon}
          </motion.span>
        )}

        <span className={`font-semibold ${sizeConfig.title}`} style={{ color: titleData.color }}>
          {displayTitle}
        </span>

        {showLevel && showLevelBadge && (
          <span
            className={`${sizeConfig.level} font-medium px-1.5 py-0.5 rounded`}
            style={{ backgroundColor: `${titleData.color}30`, color: titleData.color }}
          >
            {level}
          </span>
        )}
      </motion.div>

      {/* Progress bar to next title */}
      {showProgress && progress.next && (
        <div className="mt-2">
          <div className="flex justify-between text-xs text-white/50 mb-1">
            <span>{titleData.title}</span>
            <span>{progress.next.title}</span>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress.progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="h-full rounded-full"
              style={{ backgroundColor: titleData.color }}
            />
          </div>
          <div className="text-xs text-white/40 mt-1 text-center">
            {progress.levelsToNext} levels to {progress.next.title}
          </div>
        </div>
      )}

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-[#1a1625] border border-white/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 min-w-[180px]">
          <div className="text-sm font-medium text-white mb-1">{titleData.title}</div>
          <div className="text-xs text-white/60 mb-2">
            Level {titleData.minLevel} - {titleData.maxLevel === Infinity ? '∞' : titleData.maxLevel}
          </div>
          {progress.next && (
            <div className="text-xs text-white/40">
              Next: {progress.next.title} ({progress.levelsToNext} levels)
            </div>
          )}
          {/* Arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#1a1625]" />
        </div>
      )}
    </div>
  );
}

/**
 * Compact level badge for tight spaces
 */
export function LevelBadge({ level, size = 'sm', className = '' }) {
  const titleData = getLevelTitle(level);
  const sizeConfig = SIZES[size] || SIZES.sm;

  return (
    <div
      className={`inline-flex items-center ${sizeConfig.gap} ${sizeConfig.padding} rounded-full ${className}`}
      style={{
        backgroundColor: `${titleData.color}25`,
        border: `1px solid ${titleData.color}50`,
      }}
    >
      <span className={sizeConfig.icon}>{titleData.icon}</span>
      <span className={`font-bold ${sizeConfig.level}`} style={{ color: titleData.color }}>
        {level}
      </span>
    </div>
  );
}

/**
 * Title progression card (for settings/character page)
 */
export function TitleProgressionCard({ level, className = '' }) {
  const titleData = getLevelTitle(level);
  const progress = getTitleProgress(level);

  return (
    <div className={`bg-[#1a1625] border border-white/10 rounded-xl p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
            style={{ backgroundColor: `${titleData.color}20` }}
          >
            {titleData.icon}
          </div>
          <div>
            <div className="text-lg font-bold" style={{ color: titleData.color }}>
              {titleData.title}
            </div>
            <div className="text-sm text-white/50">Level {level}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-white">{progress.progress}%</div>
          <div className="text-xs text-white/40">Title Progress</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-3">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress.progress}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ backgroundColor: titleData.color }}
        />
      </div>

      {/* Next title preview */}
      {progress.next && (
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-white/50">
            <span>Next:</span>
            <span style={{ color: progress.next.color }}>{progress.next.icon} {progress.next.title}</span>
          </div>
          <div className="text-white/40">{progress.levelsToNext} levels away</div>
        </div>
      )}
    </div>
  );
}
