import React, { useMemo, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGamificationModeStore } from '../../../stores/gamificationModeStore';
import './CosmicFlame.css';

/**
 * CosmicFlame - Pixel art fire effect for streak visualization
 *
 * Features:
 * - PixelLab-generated flame sprites by tier
 * - Flickering animation (pixel-perfect, no blur)
 * - Floating ember particles
 * - Glowing aura effect
 * - Special effects for milestone streaks
 *
 * Tiers:
 * - building: 0-6 days (small flame - gray)
 * - strong: 7-29 days (medium flame - green)
 * - rare: 30-49 days (large flame - blue)
 * - epic: 50-99 days (epic flame - purple)
 * - legendary: 100+ days (legendary with rainbow effects)
 */

// Ember particle component
const Ember = ({ delay, duration, startX, color }) => (
  <motion.div
    className="absolute rounded-full"
    style={{
      width: '3px',
      height: '3px',
      background: color,
      left: startX,
      bottom: '40%',
      boxShadow: `0 0 4px ${color}`,
    }}
    initial={{ opacity: 0, y: 0, scale: 1 }}
    animate={{
      opacity: [0, 1, 1, 0],
      y: [-5, -20, -40, -60],
      x: [0, Math.random() * 10 - 5, Math.random() * 16 - 8],
      scale: [1, 0.8, 0.5, 0],
    }}
    transition={{
      duration,
      delay,
      repeat: Infinity,
      ease: 'easeOut',
    }}
  />
);

// Spark burst for milestones
const SparkBurst = ({ active, color }) => {
  if (!active) return null;

  return (
    <AnimatePresence>
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            width: '4px',
            height: '4px',
            background: color,
            borderRadius: '50%',
            left: '50%',
            top: '30%',
            boxShadow: `0 0 6px ${color}`,
          }}
          initial={{ opacity: 1, scale: 1, x: 0, y: 0 }}
          animate={{
            opacity: [1, 0],
            scale: [1, 0],
            x: Math.cos((i * Math.PI * 2) / 8) * 30,
            y: Math.sin((i * Math.PI * 2) / 8) * 30,
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            repeatDelay: 2,
            ease: 'easeOut',
          }}
        />
      ))}
    </AnimatePresence>
  );
};

export function CosmicFlame({
  streak = 0,
  size = 'md', // 'sm', 'md', 'lg', 'xl'
  active = true,
  showNumber = false,
  animate = true,
  milestone = false, // Special animation for reaching milestones
  className = ''
}) {
  const mode = useGamificationModeStore((state) => state.mode);
  const [showMilestoneEffect, setShowMilestoneEffect] = useState(milestone);

  // Reset milestone effect after animation
  useEffect(() => {
    if (milestone) {
      setShowMilestoneEffect(true);
      const timer = setTimeout(() => setShowMilestoneEffect(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [milestone]);

  const getTier = (days) => {
    if (days >= 100) return 'legendary';
    if (days >= 50) return 'epic';
    if (days >= 30) return 'large';
    if (days >= 7) return 'medium';
    return 'small';
  };

  const tier = getTier(streak);

  // Map tier to sprite path (PixelLab generated)
  const flameSprites = {
    small: '/assets/streaks/flame_small.png',
    medium: '/assets/streaks/flame_medium.png',
    large: '/assets/streaks/flame_large.png',
    epic: '/assets/streaks/flame_epic.png',
    legendary: '/assets/streaks/flame_epic.png', // Use epic sprite with special effects
  };

  // Tier-based colors
  const tierConfig = {
    small: { color: '#9ca3af', glow: 'rgba(156, 163, 175, 0.4)', ember: '#d1d5db' },
    medium: { color: '#22c55e', glow: 'rgba(34, 197, 94, 0.5)', ember: '#4ade80' },
    large: { color: '#3b82f6', glow: 'rgba(59, 130, 246, 0.5)', ember: '#60a5fa' },
    epic: { color: '#a855f7', glow: 'rgba(168, 85, 247, 0.5)', ember: '#c084fc' },
    legendary: { color: '#f59e0b', glow: 'rgba(245, 158, 11, 0.6)', ember: '#fbbf24' },
  };

  const config = tierConfig[tier];

  // Size mappings
  const sizeConfig = {
    sm: { container: 'w-8 h-10', flame: 'w-6 h-8', glow: 20, emberCount: 2 },
    md: { container: 'w-12 h-14', flame: 'w-9 h-12', glow: 30, emberCount: 3 },
    lg: { container: 'w-16 h-20', flame: 'w-12 h-16', glow: 40, emberCount: 4 },
    xl: { container: 'w-24 h-28', flame: 'w-18 h-24', glow: 60, emberCount: 6 },
  };

  const sizeSettings = sizeConfig[size] || sizeConfig.md;

  // Generate ember positions
  const embers = useMemo(() =>
    [...Array(sizeSettings.emberCount)].map((_, i) => ({
      id: i,
      delay: i * 0.4 + Math.random() * 0.2,
      duration: 1.5 + Math.random() * 0.5,
      startX: `${30 + Math.random() * 40}%`,
    })),
    [sizeSettings.emberCount]
  );

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

  // Cosmic mode: Pixel art flame with animations
  return (
    <div className={`relative ${sizeSettings.container} flex items-end justify-center ${className}`}>
      {/* Glow effect */}
      {active && animate && (
        <motion.div
          className="absolute bottom-0 rounded-full"
          style={{
            width: sizeSettings.glow * 1.5,
            height: sizeSettings.glow,
            background: `radial-gradient(ellipse, ${config.glow} 0%, transparent 70%)`,
            filter: 'blur(4px)',
          }}
          animate={{
            opacity: [0.5, 0.8, 0.5],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}

      {/* Floating embers */}
      {active && animate && embers.map((ember) => (
        <Ember
          key={ember.id}
          delay={ember.delay}
          duration={ember.duration}
          startX={ember.startX}
          color={config.ember}
        />
      ))}

      {/* Milestone spark burst */}
      <SparkBurst active={showMilestoneEffect} color={config.color} />

      {/* Main flame sprite */}
      <motion.div
        className="relative z-10"
        animate={active && animate ? {
          // Flickering effect - subtle scale changes
          scaleX: [1, 0.95, 1.02, 0.98, 1],
          scaleY: [1, 1.03, 0.97, 1.02, 1],
          // Slight horizontal movement like real flame
          x: [0, -1, 1, -0.5, 0],
        } : {}}
        transition={{
          duration: 0.4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        {/* Legendary rainbow filter */}
        {tier === 'legendary' && active && (
          <motion.div
            className="absolute inset-0 mix-blend-overlay pointer-events-none"
            animate={{ filter: ['hue-rotate(0deg)', 'hue-rotate(360deg)'] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          />
        )}

        <img
          src={flameSprites[tier]}
          alt={`${tier} streak flame`}
          className={`${sizeSettings.flame} pixelated ${!active ? 'grayscale opacity-40' : ''}`}
          style={{
            imageRendering: 'pixelated',
            filter: tier === 'legendary' && active
              ? 'drop-shadow(0 0 8px rgba(245, 158, 11, 0.8))'
              : active
                ? `drop-shadow(0 0 4px ${config.glow})`
                : 'none',
          }}
        />
      </motion.div>

      {/* Streak number badge */}
      {showNumber && streak > 0 && (
        <motion.div
          className="absolute -bottom-1 -right-1 z-20 bg-bg-0 rounded-full px-1.5 py-0.5 text-xs font-bold shadow-lg border border-border"
          style={{ color: config.color }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 25 }}
        >
          {streak}
        </motion.div>
      )}

      {/* Milestone glow ring */}
      {showMilestoneEffect && (
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            border: `2px solid ${config.color}`,
            boxShadow: `0 0 20px ${config.color}`,
          }}
          initial={{ scale: 0.5, opacity: 1 }}
          animate={{ scale: 2, opacity: 0 }}
          transition={{ duration: 1, repeat: 2 }}
        />
      )}
    </div>
  );
}

/**
 * StreakFlameDisplay - Complete streak display with flame and stats
 */
export function StreakFlameDisplay({
  streak = 0,
  label,
  best = 0,
  size = 'md',
  onClick,
  className = ''
}) {
  const tier = streak >= 100 ? 'legendary' : streak >= 50 ? 'epic' : streak >= 30 ? 'rare' : streak >= 7 ? 'strong' : 'building';

  return (
    <motion.div
      className={`flex flex-col items-center gap-2 cursor-pointer group ${className}`}
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <CosmicFlame streak={streak} size={size} active={streak > 0} />

      <div className="text-center">
        <div className="text-lg font-bold text-white">{streak}</div>
        {label && <div className="text-xs text-white/50">{label}</div>}
        {best > 0 && best > streak && (
          <div className="text-xs text-yellow-400/70">Best: {best}</div>
        )}
      </div>
    </motion.div>
  );
}

/**
 * MiniStreak - Compact inline streak indicator
 */
export function MiniStreak({ streak = 0, className = '' }) {
  const tier = streak >= 50 ? 'epic' : streak >= 30 ? 'large' : streak >= 7 ? 'medium' : 'small';
  const colors = {
    small: 'text-gray-400',
    medium: 'text-green-400',
    large: 'text-blue-400',
    epic: 'text-purple-400',
  };

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <CosmicFlame streak={streak} size="sm" animate={false} />
      <span className={`text-sm font-semibold ${colors[tier]}`}>{streak}</span>
    </div>
  );
}

export default CosmicFlame;
