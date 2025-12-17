/**
 * UnlockProgress Component
 * Shows unlock requirements and progress for equipment/pets
 */

import React from 'react';
import {
  Lock, Star, Trophy, Sword, ShoppingBag, Flame,
  Users, Target, Calendar, Gift, Sparkles, Crown,
  BookOpen, Dumbbell, Brain, Heart, Wallet, Compass
} from 'lucide-react';
import { getUnlockMethodDisplay } from '../../data/unlockMethods';

// Icon mapping for unlock methods
const METHOD_ICONS = {
  default: Gift,
  level: Star,
  prestige: Crown,
  achievement: Trophy,
  milestone: Target,
  skill_tree: Compass,
  perk: Sparkles,
  bazaar: ShoppingBag,
  crafting: Dumbbell,
  module: BookOpen,
  streak: Flame,
  pvp: Sword,
  social: Users,
  leaderboard: Trophy,
  quest: Target,
  daily_quest: Calendar,
  weekly_quest: Calendar,
  discovery: Compass,
  secret: Lock,
  seasonal: Gift,
  daily_login: Calendar,
  nova: Sparkles,
  founder: Star,
  beta: Star,
};

// Module icons
const MODULE_ICONS = {
  productivity: Target,
  fitness: Dumbbell,
  health: Heart,
  knowledge: BookOpen,
  journal: BookOpen,
  calendar: Calendar,
  financial: Wallet,
  purpose: Compass,
  skills: Brain,
  habits: Flame,
};

export function UnlockProgress({
  item,
  currentProgress = 0,
  showProgress = true,
  size = 'md',
  variant = 'default'
}) {
  if (!item || !item.unlockMethod || item.unlockMethod === 'default') {
    return null;
  }

  const method = item.unlockMethod;
  const requirement = item.unlockRequirement || {};
  const displayInfo = getUnlockMethodDisplay(method);
  const Icon = METHOD_ICONS[method] || Lock;

  // Calculate progress percentage
  let progress = 0;
  let target = 1;
  let progressLabel = '';

  switch (method) {
    case 'level':
      target = requirement.level || 1;
      progress = currentProgress;
      progressLabel = `Level ${progress}/${target}`;
      break;
    case 'prestige':
      target = requirement.prestige || 1;
      progress = currentProgress;
      progressLabel = `Prestige ${progress}/${target}`;
      break;
    case 'achievement':
      progressLabel = item.unlockDescription || `Complete achievement`;
      break;
    case 'milestone':
    case 'module':
      target = requirement.target || 1;
      progress = currentProgress;
      progressLabel = `${progress}/${target}`;
      break;
    case 'streak':
      target = requirement.streakDays || 1;
      progress = currentProgress;
      progressLabel = `${progress}/${target} days`;
      break;
    case 'pvp':
      if (requirement.wins) {
        target = requirement.wins;
        progress = currentProgress;
        progressLabel = `${progress}/${target} wins`;
      } else if (requirement.rank) {
        progressLabel = `Reach ${requirement.rank} rank`;
      }
      break;
    case 'social':
      if (requirement.friends) {
        target = requirement.friends;
        progress = currentProgress;
        progressLabel = `${progress}/${target} friends`;
      }
      break;
    case 'bazaar':
      progressLabel = `${requirement.price || 0} Credits`;
      break;
    case 'skill_tree':
      if (requirement.tree && requirement.level) {
        progressLabel = `${requirement.tree} L${requirement.level}`;
      } else if (requirement.perkId) {
        progressLabel = item.unlockDescription || 'Unlock perk';
      }
      break;
    case 'daily_login':
      target = requirement.days || 1;
      progress = currentProgress;
      progressLabel = `${progress}/${target} days`;
      break;
    case 'quest':
      progressLabel = item.unlockDescription || 'Complete quest';
      break;
    case 'secret':
      progressLabel = '???';
      break;
    default:
      progressLabel = item.unlockDescription || displayInfo.label;
  }

  const progressPercent = target > 0 ? Math.min(100, Math.round((progress / target) * 100)) : 0;

  // Size classes
  const sizeClasses = {
    sm: 'text-xs gap-1',
    md: 'text-sm gap-1.5',
    lg: 'text-base gap-2',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  // Variant styles
  const variantStyles = {
    default: 'bg-white/5 border border-white/10',
    minimal: '',
    card: 'bg-gradient-to-r from-white/5 to-white/10 border border-white/20 p-2 rounded-lg',
  };

  if (variant === 'minimal') {
    return (
      <div className={`flex items-center ${sizeClasses[size]} text-white/60`}>
        <Icon className={iconSizes[size]} style={{ color: displayInfo.color }} />
        <span>{progressLabel}</span>
      </div>
    );
  }

  return (
    <div className={`${variantStyles[variant]} rounded-lg overflow-hidden`}>
      <div className={`flex items-center ${sizeClasses[size]} p-2`}>
        <div
          className="p-1.5 rounded-md"
          style={{ backgroundColor: `${displayInfo.color}20` }}
        >
          <Icon
            className={iconSizes[size]}
            style={{ color: displayInfo.color }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-white/80 font-medium truncate">
              {displayInfo.label}
            </span>
            {method !== 'secret' && method !== 'bazaar' && (
              <span className="text-white/50 text-xs">
                {progressPercent}%
              </span>
            )}
          </div>
          <span className="text-white/50 text-xs truncate block">
            {progressLabel}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      {showProgress && target > 0 && method !== 'bazaar' && method !== 'secret' && (
        <div className="h-1 bg-white/10">
          <div
            className="h-full transition-all duration-500"
            style={{
              width: `${progressPercent}%`,
              backgroundColor: displayInfo.color,
            }}
          />
        </div>
      )}
    </div>
  );
}

/**
 * UnlockRequirementsList - Shows all ways to unlock an item
 */
export function UnlockRequirementsList({
  item,
  progress = {},
  showAllPaths = false
}) {
  if (!item) return null;

  // Primary unlock method
  const primaryMethod = {
    unlockMethod: item.unlockMethod,
    unlockRequirement: item.unlockRequirement,
    unlockDescription: item.unlockDescription,
  };

  // Additional unlock paths (if item has alternativeUnlocks)
  const alternativePaths = item.alternativeUnlocks || [];

  const allPaths = [primaryMethod, ...alternativePaths].filter(
    p => p.unlockMethod && p.unlockMethod !== 'default'
  );

  if (allPaths.length === 0) {
    return (
      <div className="text-white/40 text-sm flex items-center gap-2">
        <Gift className="w-4 h-4" />
        <span>Starting equipment</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="text-white/60 text-xs uppercase tracking-wide mb-1">
        {allPaths.length > 1 ? 'Ways to Unlock' : 'Unlock Requirement'}
      </div>
      {allPaths.map((path, index) => (
        <UnlockProgress
          key={`${path.unlockMethod}-${index}`}
          item={path}
          currentProgress={progress[path.unlockMethod] || 0}
          size="sm"
          variant="card"
        />
      ))}
    </div>
  );
}

/**
 * LockedItemOverlay - Overlay shown on locked items
 */
export function LockedItemOverlay({ item, onClick }) {
  const displayInfo = getUnlockMethodDisplay(item?.unlockMethod || 'default');
  const Icon = METHOD_ICONS[item?.unlockMethod] || Lock;

  return (
    <div
      className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center cursor-pointer hover:bg-black/50 transition-colors"
      onClick={onClick}
    >
      <div
        className="p-3 rounded-full mb-2"
        style={{ backgroundColor: `${displayInfo.color}30` }}
      >
        <Lock className="w-6 h-6" style={{ color: displayInfo.color }} />
      </div>
      <span className="text-white/80 text-sm font-medium">
        {displayInfo.label}
      </span>
      <span className="text-white/50 text-xs mt-1 px-4 text-center">
        {item?.unlockDescription || 'Locked'}
      </span>
    </div>
  );
}

export default UnlockProgress;
