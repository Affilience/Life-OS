/**
 * UnlockBadge Component
 * Shows how an item can be unlocked (level, achievement, skill tree, or bazaar)
 */

import React from 'react';
import {
  Lock, TrendingUp, Trophy, Zap, Coins, Flame, Users, Target,
  Calendar, Gift, Sparkles, Crown, BookOpen, Sword, Compass, Star
} from 'lucide-react';

// Unlock method colors and icons - comprehensive list
const UNLOCK_STYLES = {
  // Progression-based
  level: {
    icon: TrendingUp,
    color: '#60a5fa', // blue
    bgColor: 'rgba(96, 165, 250, 0.1)',
    borderColor: 'rgba(96, 165, 250, 0.3)',
    label: 'Level Up',
  },
  prestige: {
    icon: Crown,
    color: '#f59e0b', // amber
    bgColor: 'rgba(245, 158, 11, 0.1)',
    borderColor: 'rgba(245, 158, 11, 0.3)',
    label: 'Prestige',
  },

  // Achievement-based
  achievement: {
    icon: Trophy,
    color: '#fbbf24', // yellow
    bgColor: 'rgba(251, 191, 36, 0.1)',
    borderColor: 'rgba(251, 191, 36, 0.3)',
    label: 'Achievement',
  },
  milestone: {
    icon: Target,
    color: '#8b5cf6', // purple
    bgColor: 'rgba(139, 92, 246, 0.1)',
    borderColor: 'rgba(139, 92, 246, 0.3)',
    label: 'Milestone',
  },

  // Skill tree / Perk-based
  skill_tree: {
    icon: Zap,
    color: '#a78bfa', // violet
    bgColor: 'rgba(167, 139, 250, 0.1)',
    borderColor: 'rgba(167, 139, 250, 0.3)',
    label: 'Skill Tree',
  },
  perk: {
    icon: Sparkles,
    color: '#c084fc', // purple
    bgColor: 'rgba(192, 132, 252, 0.1)',
    borderColor: 'rgba(192, 132, 252, 0.3)',
    label: 'Perk',
  },

  // Economy-based
  bazaar: {
    icon: Coins,
    color: '#f97316', // orange
    bgColor: 'rgba(249, 115, 22, 0.1)',
    borderColor: 'rgba(249, 115, 22, 0.3)',
    label: 'Bazaar',
  },
  crafting: {
    icon: Zap,
    color: '#78716c', // stone
    bgColor: 'rgba(120, 113, 108, 0.1)',
    borderColor: 'rgba(120, 113, 108, 0.3)',
    label: 'Crafting',
  },

  // Module-based
  module: {
    icon: BookOpen,
    color: '#3b82f6', // blue
    bgColor: 'rgba(59, 130, 246, 0.1)',
    borderColor: 'rgba(59, 130, 246, 0.3)',
    label: 'Module Progress',
  },
  streak: {
    icon: Flame,
    color: '#ef4444', // red
    bgColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
    label: 'Streak',
  },

  // Social-based
  pvp: {
    icon: Sword,
    color: '#dc2626', // red
    bgColor: 'rgba(220, 38, 38, 0.1)',
    borderColor: 'rgba(220, 38, 38, 0.3)',
    label: 'PvP',
  },
  social: {
    icon: Users,
    color: '#06b6d4', // cyan
    bgColor: 'rgba(6, 182, 212, 0.1)',
    borderColor: 'rgba(6, 182, 212, 0.3)',
    label: 'Social',
  },
  leaderboard: {
    icon: Trophy,
    color: '#fbbf24', // yellow
    bgColor: 'rgba(251, 191, 36, 0.1)',
    borderColor: 'rgba(251, 191, 36, 0.3)',
    label: 'Leaderboard',
  },

  // Quest-based
  quest: {
    icon: Target,
    color: '#8b5cf6', // purple
    bgColor: 'rgba(139, 92, 246, 0.1)',
    borderColor: 'rgba(139, 92, 246, 0.3)',
    label: 'Quest',
  },
  daily_quest: {
    icon: Calendar,
    color: '#14b8a6', // teal
    bgColor: 'rgba(20, 184, 166, 0.1)',
    borderColor: 'rgba(20, 184, 166, 0.3)',
    label: 'Daily Quest',
  },
  weekly_quest: {
    icon: Calendar,
    color: '#0ea5e9', // sky
    bgColor: 'rgba(14, 165, 233, 0.1)',
    borderColor: 'rgba(14, 165, 233, 0.3)',
    label: 'Weekly Quest',
  },

  // Discovery-based
  discovery: {
    icon: Compass,
    color: '#6366f1', // indigo
    bgColor: 'rgba(99, 102, 241, 0.1)',
    borderColor: 'rgba(99, 102, 241, 0.3)',
    label: 'Discovery',
  },
  secret: {
    icon: Lock,
    color: '#4b5563', // gray
    bgColor: 'rgba(75, 85, 99, 0.1)',
    borderColor: 'rgba(75, 85, 99, 0.3)',
    label: 'Secret',
  },

  // Time-based
  seasonal: {
    icon: Gift,
    color: '#059669', // emerald
    bgColor: 'rgba(5, 150, 105, 0.1)',
    borderColor: 'rgba(5, 150, 105, 0.3)',
    label: 'Seasonal',
  },
  daily_login: {
    icon: Calendar,
    color: '#0891b2', // cyan
    bgColor: 'rgba(8, 145, 178, 0.1)',
    borderColor: 'rgba(8, 145, 178, 0.3)',
    label: 'Daily Login',
  },

  // Special
  nova: {
    icon: Sparkles,
    color: '#d946ef', // fuchsia
    bgColor: 'rgba(217, 70, 239, 0.1)',
    borderColor: 'rgba(217, 70, 239, 0.3)',
    label: 'Nova Gift',
  },
  founder: {
    icon: Star,
    color: '#fcd34d', // yellow
    bgColor: 'rgba(252, 211, 77, 0.1)',
    borderColor: 'rgba(252, 211, 77, 0.3)',
    label: 'Founder',
  },
  beta: {
    icon: Zap,
    color: '#c084fc', // purple
    bgColor: 'rgba(192, 132, 252, 0.1)',
    borderColor: 'rgba(192, 132, 252, 0.3)',
    label: 'Beta Tester',
  },

  // Default
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
    case 'prestige':
      return `Reach Prestige ${requirement.prestige}`;
    case 'achievement':
      return requirement.achievementName || requirement.achievementId || 'Complete achievement';
    case 'milestone':
      return `${requirement.target} ${requirement.metric?.replace(/([A-Z])/g, ' $1').toLowerCase() || 'progress'}`;
    case 'skill_tree':
      if (requirement.perkId) {
        return `Unlock "${requirement.perkName || requirement.perkId}" perk`;
      }
      if (requirement.tree && requirement.level) {
        return `${requirement.tree.charAt(0).toUpperCase() + requirement.tree.slice(1)} tree Level ${requirement.level}`;
      }
      if (requirement.anyTree && requirement.level) {
        return `Any tree Level ${requirement.level}`;
      }
      return 'Skill tree milestone';
    case 'perk':
      return `Unlock "${requirement.perkName || requirement.perkId}"`;
    case 'bazaar':
      return `${requirement.price} Credits`;
    case 'crafting':
      return 'Craft from materials';
    case 'module':
      const moduleName = requirement.module?.charAt(0).toUpperCase() + requirement.module?.slice(1) || 'Module';
      return `${moduleName}: ${requirement.target} ${requirement.metric?.replace(/([A-Z])/g, ' $1').toLowerCase() || ''}`;
    case 'streak':
      const streakModule = requirement.module ? ` ${requirement.module}` : '';
      return `${requirement.streakDays}-day${streakModule} streak`;
    case 'pvp':
      if (requirement.wins) return `Win ${requirement.wins} PvP battles`;
      if (requirement.rank) return `Reach ${requirement.rank} rank`;
      return 'PvP challenge';
    case 'social':
      if (requirement.friends) return `Add ${requirement.friends} friends`;
      if (requirement.challengesWon) return `Win ${requirement.challengesWon} challenges`;
      return 'Social activity';
    case 'leaderboard':
      return `Reach #${requirement.position || 'top'} on leaderboard`;
    case 'quest':
      return `Complete "${requirement.questName || requirement.questId}"`;
    case 'daily_quest':
      return `Complete ${requirement.count} daily quests`;
    case 'weekly_quest':
      return `Complete ${requirement.count} weekly quests`;
    case 'discovery':
      return requirement.hint || 'Discover through exploration';
    case 'secret':
      return '???';
    case 'seasonal':
      return requirement.eventName || 'Seasonal event';
    case 'daily_login':
      return `${requirement.days}-day login streak`;
    case 'nova':
      return 'Gift from Nova';
    case 'founder':
      return 'Founder exclusive';
    case 'beta':
      return 'Beta tester reward';
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
