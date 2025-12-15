/**
 * UnlockBadge Component
 * Shows how an item can be unlocked (level, achievement, skill tree, or bazaar)
 */

import React from 'react';
import { Lock, TrendingUp, Trophy, Zap, Coins } from 'lucide-react';

// Unlock method colors and icons
const UNLOCK_STYLES = {
  level: {
    icon: TrendingUp,
    color: '#60a5fa', // blue
    bgColor: 'rgba(96, 165, 250, 0.1)',
    borderColor: 'rgba(96, 165, 250, 0.3)',
    label: 'Level Up',
  },
  achievement: {
    icon: Trophy,
    color: '#fbbf24', // yellow
    bgColor: 'rgba(251, 191, 36, 0.1)',
    borderColor: 'rgba(251, 191, 36, 0.3)',
    label: 'Achievement',
  },
  skill_tree: {
    icon: Zap,
    color: '#a78bfa', // purple
    bgColor: 'rgba(167, 139, 250, 0.1)',
    borderColor: 'rgba(167, 139, 250, 0.3)',
    label: 'Skill Tree',
  },
  bazaar: {
    icon: Coins,
    color: '#f97316', // orange
    bgColor: 'rgba(249, 115, 22, 0.1)',
    borderColor: 'rgba(249, 115, 22, 0.3)',
    label: 'Shop',
  },
  default: {
    icon: Lock,
    color: 'rgba(255, 255, 255, 0.5)',
    bgColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    label: 'Locked',
  },
};

/**
 * UnlockBadge - Shows unlock method with icon and description
 *
 * @param {string} method - The unlock method: 'level', 'achievement', 'skill_tree', 'bazaar', 'default'
 * @param {string} description - The unlock description text
 * @param {object} requirement - The requirement object (optional, for showing progress)
 * @param {object} progress - Current progress towards requirement (optional)
 * @param {string} size - Badge size: 'sm', 'md', 'lg'
 * @param {boolean} showLabel - Whether to show the method label
 * @param {boolean} compact - Use compact display (icon only)
 */
export default function UnlockBadge({
  method = 'default',
  description = '',
  requirement = null,
  progress = null,
  size = 'sm',
  showLabel = false,
  compact = false,
}) {
  const style = UNLOCK_STYLES[method] || UNLOCK_STYLES.default;
  const Icon = style.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  // Compact mode: just the icon
  if (compact) {
    return (
      <div
        className={`inline-flex items-center justify-center rounded-full ${sizeClasses[size]}`}
        style={{
          background: style.bgColor,
          border: `1px solid ${style.borderColor}`,
        }}
        title={description || style.label}
      >
        <Icon className={iconSizes[size]} style={{ color: style.color }} />
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-lg ${sizeClasses[size]}`}
      style={{
        background: style.bgColor,
        border: `1px solid ${style.borderColor}`,
      }}
    >
      <Icon className={iconSizes[size]} style={{ color: style.color }} />

      {showLabel && (
        <span className="font-medium" style={{ color: style.color }}>
          {style.label}:
        </span>
      )}

      <span style={{ color: style.color }}>
        {description || formatDefaultDescription(method, requirement)}
      </span>

      {/* Progress indicator (if available) */}
      {progress !== null && requirement && (
        <span className="text-white/40 ml-1">
          ({formatProgress(method, requirement, progress)})
        </span>
      )}
    </div>
  );
}

/**
 * UnlockIndicator - Small inline indicator for compact displays
 */
export function UnlockIndicator({ method, size = 'sm' }) {
  const style = UNLOCK_STYLES[method] || UNLOCK_STYLES.default;
  const Icon = style.icon;

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <Icon
      className={iconSizes[size]}
      style={{ color: style.color }}
      title={style.label}
    />
  );
}

/**
 * UnlockProgress - Shows progress bar towards unlocking
 */
export function UnlockProgress({
  method,
  requirement,
  current,
  target,
  description,
}) {
  const style = UNLOCK_STYLES[method] || UNLOCK_STYLES.default;
  const Icon = style.icon;
  const progress = Math.min((current / target) * 100, 100);

  return (
    <div
      className="rounded-lg p-3"
      style={{
        background: style.bgColor,
        border: `1px solid ${style.borderColor}`,
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4" style={{ color: style.color }} />
        <span className="text-sm font-medium" style={{ color: style.color }}>
          {style.label}
        </span>
      </div>

      <p className="text-sm text-white/70 mb-2">{description}</p>

      <div className="relative h-2 bg-black/30 rounded-full overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all duration-300"
          style={{
            width: `${progress}%`,
            background: style.color,
          }}
        />
      </div>

      <div className="flex justify-between items-center mt-1">
        <span className="text-xs text-white/50">{current}/{target}</span>
        <span className="text-xs" style={{ color: style.color }}>
          {Math.round(progress)}%
        </span>
      </div>
    </div>
  );
}

// Helper functions
function formatDefaultDescription(method, requirement) {
  if (!requirement) return '';

  switch (method) {
    case 'level':
      return `Reach Level ${requirement.level}`;
    case 'achievement':
      return requirement.achievementId || 'Complete achievement';
    case 'skill_tree':
      if (requirement.perkId) {
        return `Unlock "${requirement.perkId}" perk`;
      }
      if (requirement.tree && requirement.level) {
        return `${requirement.tree} tree Level ${requirement.level}`;
      }
      return 'Skill tree milestone';
    case 'bazaar':
      return `${requirement.price} Credits`;
    default:
      return 'Locked';
  }
}

function formatProgress(method, requirement, progress) {
  switch (method) {
    case 'level':
      return `${progress.level || 0}/${requirement.level}`;
    case 'skill_tree':
      if (requirement.level && progress.treeLevel !== undefined) {
        return `${progress.treeLevel}/${requirement.level}`;
      }
      return progress.hasPerk ? '✓' : '✗';
    default:
      return '';
  }
}

// Export styles for external use
export { UNLOCK_STYLES };
