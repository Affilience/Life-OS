/**
 * Celebration Tiers System
 *
 * Centralizes celebration intensity based on achievement significance.
 * Bigger achievements = bigger celebrations with more particles, sounds, and effects.
 *
 * Used by:
 * - Task completion
 * - Quest completion
 * - Achievement unlocks
 * - Level ups
 * - Streak milestones
 * - Equipment/Pet unlocks
 */

import { sounds } from './sounds';
import { haptics } from './haptics';
import confetti from 'canvas-confetti';

// Celebration tier definitions
export const CELEBRATION_TIERS = {
  // Tiny feedback for micro-interactions (button clicks, toggles)
  MICRO: {
    particles: 0,
    sound: 'pop',
    haptic: 'light',
    confetti: false,
    duration: 100,
    description: 'Micro feedback for small interactions',
  },

  // Small celebration for individual task completions
  SMALL: {
    particles: 8,
    sound: 'taskCompleteSatisfying',
    haptic: 'medium',
    confetti: false,
    duration: 300,
    description: 'Small celebration for task completion',
  },

  // Medium celebration for quest completions, habit streaks
  MEDIUM: {
    particles: 15,
    sound: 'success',
    haptic: 'success',
    confetti: true,
    confettiCount: 30,
    duration: 600,
    description: 'Medium celebration for quest completion',
  },

  // Large celebration for achievements, milestones
  LARGE: {
    particles: 30,
    sound: 'achievement',
    haptic: 'success',
    confetti: true,
    confettiCount: 60,
    cascade: true,
    duration: 1000,
    description: 'Large celebration for achievements',
  },

  // Epic celebration for level ups, legendary achievements
  EPIC: {
    particles: 50,
    sound: 'levelUp',
    haptic: 'success',
    confetti: true,
    confettiCount: 100,
    cascade: true,
    screenFlash: true,
    duration: 1500,
    description: 'Epic celebration for level ups',
  },

  // Legendary celebration for major milestones (100-day streak, max level)
  LEGENDARY: {
    particles: 100,
    sound: 'levelUp',
    haptic: 'success',
    confetti: true,
    confettiCount: 200,
    cascade: true,
    screenFlash: true,
    fireworks: true,
    duration: 3000,
    description: 'Legendary celebration for major milestones',
  },
};

// Achievement rarity to tier mapping
export const RARITY_TO_TIER = {
  common: 'SMALL',
  uncommon: 'MEDIUM',
  rare: 'LARGE',
  epic: 'EPIC',
  legendary: 'LEGENDARY',
};

// XP amount to tier mapping
export const XP_TO_TIER = (xp) => {
  if (xp >= 500) return 'EPIC';
  if (xp >= 200) return 'LARGE';
  if (xp >= 75) return 'MEDIUM';
  if (xp >= 25) return 'SMALL';
  return 'MICRO';
};

// Streak milestone to tier mapping
export const STREAK_TO_TIER = (days) => {
  if (days >= 365) return 'LEGENDARY';
  if (days >= 100) return 'EPIC';
  if (days >= 30) return 'LARGE';
  if (days >= 7) return 'MEDIUM';
  if (days >= 3) return 'SMALL';
  return 'MICRO';
};

// Level to tier mapping (for level up celebrations)
export const LEVEL_TO_TIER = (level) => {
  if (level >= 100) return 'LEGENDARY';
  if (level >= 50) return 'EPIC';
  if (level >= 25) return 'LARGE';
  if (level >= 10) return 'MEDIUM';
  return 'SMALL';
};

// Task completion count to tier (for combo system)
export const COMBO_TO_TIER = (count) => {
  if (count >= 10) return 'EPIC';
  if (count >= 5) return 'LARGE';
  if (count >= 3) return 'MEDIUM';
  return 'SMALL';
};

/**
 * Execute a celebration based on tier
 * @param {string} tierName - Name of the celebration tier
 * @param {Object} options - Additional options
 * @param {Object} options.position - {x, y} position for particles
 * @param {boolean} options.skipSound - Skip playing sound
 * @param {boolean} options.skipHaptic - Skip haptic feedback
 * @param {boolean} options.skipConfetti - Skip confetti
 * @param {Function} options.onParticleBurst - Custom particle burst function
 * @param {boolean} options.reducedMotion - User prefers reduced motion
 */
export function celebrate(tierName, options = {}) {
  const tier = CELEBRATION_TIERS[tierName] || CELEBRATION_TIERS.SMALL;
  const {
    position = null,
    skipSound = false,
    skipHaptic = false,
    skipConfetti = false,
    onParticleBurst = null,
    reducedMotion = false,
  } = options;

  // Play sound
  if (!skipSound && tier.sound) {
    const soundFn = sounds[tier.sound];
    if (soundFn) soundFn();
  }

  // Trigger haptic
  if (!skipHaptic && tier.haptic) {
    haptics[tier.haptic]?.();
  }

  // Skip visual effects if reduced motion
  if (reducedMotion) return;

  // Fire particles
  if (tier.particles > 0 && onParticleBurst && position) {
    onParticleBurst(position.x, position.y, {
      count: tier.particles,
      spread: tier.particles * 3,
    });
  }

  // Confetti
  if (!skipConfetti && tier.confetti) {
    if (tier.cascade) {
      // Cascading confetti effect
      const duration = tier.duration;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

      const randomInRange = (min, max) => Math.random() * (max - min) + min;

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = Math.floor(tier.confettiCount / 5) * (timeLeft / duration);

        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        });
      }, 250);
    } else if (tier.fireworks) {
      // Fireworks effect
      const duration = tier.duration;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 45, spread: 360, ticks: 100, zIndex: 9999 };

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = Math.floor(tier.confettiCount / 8);

        confetti({
          ...defaults,
          particleCount,
          origin: { x: Math.random(), y: Math.random() * 0.3 },
          colors: ['#FFD700', '#FF6B6B', '#4ECDC4', '#A855F7', '#3B82F6'],
        });
      }, 300);
    } else {
      // Simple burst
      confetti({
        particleCount: tier.confettiCount,
        spread: 70,
        origin: { y: 0.6 },
        zIndex: 9999,
      });
    }
  }
}

/**
 * Celebrate based on XP amount
 */
export function celebrateXP(xp, options = {}) {
  const tier = XP_TO_TIER(xp);
  celebrate(tier, options);
}

/**
 * Celebrate based on achievement rarity
 */
export function celebrateAchievement(rarity, options = {}) {
  const tier = RARITY_TO_TIER[rarity] || 'MEDIUM';
  celebrate(tier, options);
}

/**
 * Celebrate streak milestone
 */
export function celebrateStreak(days, options = {}) {
  const tier = STREAK_TO_TIER(days);
  celebrate(tier, options);
}

/**
 * Celebrate level up
 */
export function celebrateLevelUp(level, options = {}) {
  const tier = LEVEL_TO_TIER(level);
  celebrate(tier, options);
}

/**
 * Celebrate task combo
 */
export function celebrateCombo(count, options = {}) {
  const tier = COMBO_TO_TIER(count);
  celebrate(tier, options);
}

/**
 * Get tier config without executing celebration
 */
export function getTierConfig(tierName) {
  return CELEBRATION_TIERS[tierName] || CELEBRATION_TIERS.SMALL;
}

/**
 * Get appropriate tier for context
 */
export function getTierForContext(context) {
  const { type, value, rarity } = context;

  switch (type) {
    case 'xp':
      return XP_TO_TIER(value);
    case 'achievement':
      return RARITY_TO_TIER[rarity] || 'MEDIUM';
    case 'streak':
      return STREAK_TO_TIER(value);
    case 'level':
      return LEVEL_TO_TIER(value);
    case 'combo':
      return COMBO_TO_TIER(value);
    case 'task':
      return 'SMALL';
    case 'quest':
      return 'MEDIUM';
    default:
      return 'SMALL';
  }
}

export default {
  CELEBRATION_TIERS,
  RARITY_TO_TIER,
  XP_TO_TIER,
  STREAK_TO_TIER,
  LEVEL_TO_TIER,
  COMBO_TO_TIER,
  celebrate,
  celebrateXP,
  celebrateAchievement,
  celebrateStreak,
  celebrateLevelUp,
  celebrateCombo,
  getTierConfig,
  getTierForContext,
};
