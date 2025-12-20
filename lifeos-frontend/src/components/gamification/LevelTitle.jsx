/**
 * LevelTitle - Displays the user's evolution stage title
 *
 * Features:
 * - Shows stage name with icon and color based on level
 * - Uses avatar evolution system (Dreamer, Seeker, Adventurer, etc.)
 * - Optional level badge
 * - Progress bar to next stage
 * - Tooltip with stage progression info
 */

import React from 'react';
import { motion } from 'framer-motion';
import { getStageByLevel, getNextStageMilestone, EVOLUTION_STAGES } from '../../data/avatarEvolution';
import useLevelProgressionStore from '../../stores/levelProgressionStore';

// Stage icons based on act/progression
const STAGE_ICONS = {
  // Act I: The Awakening (Levels 1-10)
  dreamer: '🌱',
  seeker: '🔍',
  recruit: '⚔️',
  trainee: '🏋️',
  squire: '🛡️',
  initiate: '⭐',
  fighter: '💪',
  warrior: '🗡️',
  guardian: '🛡️',
  swordsman: '⚔️',
  // Act II: The Trials (Levels 11-20)
  sentinel: '👁️',
  templar: '✨',
  crusader: '🔥',
  paladin: '💫',
  champion: '🏆',
  vindicator: '⚡',
  vanquisher: '💥',
  conqueror: '👑',
  overlord: '🌟',
  warlord: '🎖️',
  // Act III: Mastery (Levels 21-30)
  master: '🎯',
  grandmaster: '🏅',
  elder: '📜',
  sage: '🧙',
  archon: '🔮',
  paragon: '💎',
  titan: '🗿',
  demigod: '🌙',
  avatar: '☀️',
  ascendant: '🌈',
  // Act IV: Legend (Levels 31-40)
  mythic: '⭐',
  legendary: '🌟',
  eternal: '♾️',
  transcendent: '✨',
  divine: '👼',
  celestial: '🌌',
  cosmic: '🌠',
  primordial: '🔥',
  infinite: '∞',
  omega: '🏛️',
};

// Get icon for stage
function getStageIcon(stageId) {
  return STAGE_ICONS[stageId?.toLowerCase()] || '⚔️';
}

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
  const stage = getStageByLevel(level);
  const nextStage = getNextStageMilestone(level);
  const sizeConfig = SIZES[size] || SIZES.md;

  // Stage data
  const stageColor = stage?.colors?.primary || '#8B5CF6';
  const stageIcon = getStageIcon(stage?.id);

  // Calculate progress to next stage
  const levelsToNext = nextStage ? nextStage.levelRequired - level : 0;
  const currentStageStart = stage?.levelRequired || 1;
  const nextStageStart = nextStage?.levelRequired || level + 1;
  const stageRange = nextStageStart - currentStageStart;
  const progressInStage = level - currentStageStart;
  const progressPercent = stageRange > 0 ? Math.round((progressInStage / stageRange) * 100) : 100;

  // Use custom title if set, otherwise use stage name
  const displayTitle = customTitle || stage?.name || 'Adventurer';
  const displayIcon = customTitle ? '⭐' : stageIcon;

  if (variant === 'minimal') {
    return (
      <span
        className={`font-medium ${sizeConfig.title} ${className}`}
        style={{ color: stageColor }}
      >
        {displayTitle}
      </span>
    );
  }

  if (variant === 'inline') {
    return (
      <span className={`inline-flex items-center ${sizeConfig.gap} ${className}`}>
        {showIcon && <span className={sizeConfig.icon}>{displayIcon}</span>}
        <span className={`font-medium ${sizeConfig.title}`} style={{ color: stageColor }}>
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
          backgroundColor: `${stageColor}20`,
          border: `1px solid ${stageColor}40`,
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

        <span className={`font-semibold ${sizeConfig.title}`} style={{ color: stageColor }}>
          {displayTitle}
        </span>

        {showLevel && showLevelBadge && (
          <span
            className={`${sizeConfig.level} font-medium px-1.5 py-0.5 rounded`}
            style={{ backgroundColor: `${stageColor}30`, color: stageColor }}
          >
            {level}
          </span>
        )}
      </motion.div>

      {/* Progress bar to next stage */}
      {showProgress && nextStage && (
        <div className="mt-2">
          <div className="flex justify-between text-xs text-white/50 mb-1">
            <span>{stage?.name}</span>
            <span>{nextStage.name}</span>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="h-full rounded-full"
              style={{ backgroundColor: stageColor }}
            />
          </div>
          <div className="text-xs text-white/40 mt-1 text-center">
            {levelsToNext} level{levelsToNext !== 1 ? 's' : ''} to {nextStage.name}
          </div>
        </div>
      )}

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-[#1a1625] border border-white/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 min-w-[180px]">
          <div className="text-sm font-medium text-white mb-1">{stage?.name}</div>
          <div className="text-xs text-white/60 mb-2">
            {stage?.actName} • Level {level}
          </div>
          {nextStage && (
            <div className="text-xs text-white/40">
              Next: {nextStage.name} ({levelsToNext} level{levelsToNext !== 1 ? 's' : ''})
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
  const stage = getStageByLevel(level);
  const stageColor = stage?.colors?.primary || '#8B5CF6';
  const stageIcon = getStageIcon(stage?.id);
  const sizeConfig = SIZES[size] || SIZES.sm;

  return (
    <div
      className={`inline-flex items-center ${sizeConfig.gap} ${sizeConfig.padding} rounded-full ${className}`}
      style={{
        backgroundColor: `${stageColor}25`,
        border: `1px solid ${stageColor}50`,
      }}
    >
      <span className={sizeConfig.icon}>{stageIcon}</span>
      <span className={`font-bold ${sizeConfig.level}`} style={{ color: stageColor }}>
        {level}
      </span>
    </div>
  );
}

/**
 * Title progression card (for settings/character page)
 */
export function TitleProgressionCard({ level, className = '' }) {
  const stage = getStageByLevel(level);
  const nextStage = getNextStageMilestone(level);
  const stageColor = stage?.colors?.primary || '#8B5CF6';
  const stageIcon = getStageIcon(stage?.id);

  // Calculate progress to next stage
  const levelsToNext = nextStage ? nextStage.levelRequired - level : 0;
  const currentStageStart = stage?.levelRequired || 1;
  const nextStageStart = nextStage?.levelRequired || level + 1;
  const stageRange = nextStageStart - currentStageStart;
  const progressInStage = level - currentStageStart;
  const progressPercent = stageRange > 0 ? Math.round((progressInStage / stageRange) * 100) : 100;

  return (
    <div className={`bg-[#1a1625] border border-white/10 rounded-xl p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
            style={{ backgroundColor: `${stageColor}20` }}
          >
            {stageIcon}
          </div>
          <div>
            <div className="text-lg font-bold" style={{ color: stageColor }}>
              {stage?.name || 'Adventurer'}
            </div>
            <div className="text-sm text-white/50">{stage?.actName} • Level {level}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-white">{progressPercent}%</div>
          <div className="text-xs text-white/40">Stage Progress</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-3">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ backgroundColor: stageColor }}
        />
      </div>

      {/* Next stage preview */}
      {nextStage && (
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-white/50">
            <span>Next:</span>
            <span style={{ color: nextStage.colors?.primary || '#8B5CF6' }}>
              {getStageIcon(nextStage.id)} {nextStage.name}
            </span>
          </div>
          <div className="text-white/40">{levelsToNext} level{levelsToNext !== 1 ? 's' : ''} away</div>
        </div>
      )}
    </div>
  );
}
