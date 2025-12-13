import React from 'react';
import { TrendingUp } from 'lucide-react';
import { useGamificationModeStore, VISIBILITY } from '../../../stores/gamificationModeStore';
import './CosmicFlame.css';

/**
 * CosmicFlame - Pixel art fire effect for streak visualization
 *
 * Mode-aware:
 * - Cosmic: Pixel art flame sprites based on streak tier
 * - Professional: Simple icon with tier-based color
 * - Minimal: Just the streak number
 *
 * Tiers (determines which flame sprite to show):
 * - building: 0-6 days (small flame)
 * - strong: 7-29 days (medium flame)
 * - rare: 30-49 days (large flame)
 * - epic: 50+ days (epic flame)
 */
export function CosmicFlame({
  streak = 0,
  size = 'md', // 'sm', 'md', 'lg'
  active = true,
  className = ''
}) {
  // Get mode settings
  const mode = useGamificationModeStore((state) => state.mode);

  const getTier = (days) => {
    if (days >= 50) return 'epic';
    if (days >= 30) return 'large';
    if (days >= 7) return 'medium';
    return 'small';
  };

  const tier = getTier(streak);

  // Map tier to sprite path
  const flameSprites = {
    small: '/assets/streaks/flame_small.png',
    medium: '/assets/streaks/flame_medium.png',
    large: '/assets/streaks/flame_large.png',
    epic: '/assets/streaks/flame_epic.png',
  };

  // Tier colors for professional/minimal modes
  const tierColors = {
    small: 'text-gray-400',
    medium: 'text-green-400',
    large: 'text-blue-400',
    epic: 'text-purple-400',
  };

  // Size mappings for pixel art
  const pixelSizes = {
    sm: 'w-5 h-5',
    md: 'w-7 h-7',
    lg: 'w-10 h-10',
  };

  // Size mappings for icons
  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  // Professional mode: Simple icon with color
  if (mode === 'professional') {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        <TrendingUp className={`${iconSizes[size]} ${tierColors[tier]}`} />
        {active && streak > 0 && (
          <span className={`font-semibold ${tierColors[tier]} text-sm`}>
            {streak}
          </span>
        )}
      </div>
    );
  }

  // Minimal mode: Just text
  if (mode === 'minimal') {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        <span className="text-white/60 text-sm font-medium">
          {streak} {streak === 1 ? 'day' : 'days'}
        </span>
      </div>
    );
  }

  // Cosmic mode: Pixel art flame sprite
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <img
        src={flameSprites[tier]}
        alt={`${tier} streak flame`}
        className={`${pixelSizes[size]} pixelated ${active ? 'animate-pulse-slow' : 'opacity-50 grayscale'}`}
        style={{ imageRendering: 'pixelated' }}
      />
    </div>
  );
}

export default CosmicFlame;
