import React from 'react';
import './CosmicFlame.css';

/**
 * CosmicFlame - Animated fire effect for streak visualization
 *
 * Tiers:
 * - building: 0-6 days (gray)
 * - strong: 7-29 days (green)
 * - rare: 30-49 days (blue)
 * - epic: 50-99 days (purple)
 * - legendary: 100-364 days (gold)
 * - cosmic: 365+ days (rainbow)
 */
export function CosmicFlame({
  streak = 0,
  size = 'md', // 'sm', 'md', 'lg'
  active = true,
  showSparks = true,
  className = ''
}) {
  const getTier = (days) => {
    if (days >= 365) return 'cosmic';
    if (days >= 100) return 'legendary';
    if (days >= 50) return 'epic';
    if (days >= 30) return 'rare';
    if (days >= 7) return 'strong';
    return 'building';
  };

  const tier = getTier(streak);
  const sizeClass = size === 'sm' ? 'size-sm' : size === 'lg' ? 'size-lg' : '';

  return (
    <div
      className={`
        cosmic-flame-container
        ${sizeClass}
        tier-${tier}
        ${!active ? 'inactive' : ''}
        ${className}
      `}
    >
      <div className="flame-glow" />
      <div className="cosmic-flame">
        <div className="flame-layer flame-outer" />
        <div className="flame-layer flame-middle" />
        <div className="flame-layer flame-inner" />
        <div className="flame-layer flame-core" />
        {showSparks && active && (
          <>
            <div className="spark" />
            <div className="spark" />
            <div className="spark" />
            <div className="spark" />
            <div className="spark" />
          </>
        )}
      </div>
    </div>
  );
}

export default CosmicFlame;
