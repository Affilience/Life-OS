/**
 * Celebrations Service
 *
 * Provides elegant, minimal celebration effects for achievements and completions.
 * Designed to feel premium and satisfying, not childish.
 *
 * All effects are performance-optimized and respect reduced motion preferences.
 */

import confetti from 'canvas-confetti';

// Check if user prefers reduced motion
const prefersReducedMotion = () => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// User preference for celebrations
let celebrationsEnabled = true;

export function setCelebrationsEnabled(enabled) {
  celebrationsEnabled = enabled;
  localStorage.setItem('celebrationsEnabled', JSON.stringify(enabled));
}

export function getCelebrationsEnabled() {
  const stored = localStorage.getItem('celebrationsEnabled');
  if (stored !== null) {
    celebrationsEnabled = JSON.parse(stored);
  }
  return celebrationsEnabled;
}

// Initialize from storage
getCelebrationsEnabled();

// Elegant color palettes
const PALETTES = {
  gold: ['#D4AF37', '#C5A028', '#B8960F', '#E8C547'],
  silver: ['#C0C0C0', '#A8A8A8', '#D8D8D8', '#E8E8E8'],
  cosmic: ['#8B5CF6', '#A78BFA', '#7C3AED', '#C4B5FD'],
  warm: ['#F59E0B', '#D97706', '#FBBF24', '#FCD34D'],
  cool: ['#06B6D4', '#0891B2', '#22D3EE', '#67E8F9'],
  minimal: ['#6B7280', '#9CA3AF', '#D1D5DB', '#E5E7EB'],
};

/**
 * Subtle burst - elegant micro-celebration
 * @param {Object} options - Customisation options
 */
export function burst(options = {}) {
  if (!celebrationsEnabled || prefersReducedMotion()) return;

  const {
    particleCount = 20,
    spread = 40,
    origin = { x: 0.5, y: 0.6 },
    colors = PALETTES.gold,
    startVelocity = 20,
    ticks = 50,
  } = options;

  confetti({
    particleCount,
    spread,
    origin,
    colors,
    startVelocity,
    ticks,
    gravity: 1.5,
    scalar: 0.7,
    drift: 0,
    shapes: ['circle'],
    disableForReducedMotion: true,
  });
}

/**
 * Elegant shimmer - subtle radial effect
 */
export function shimmer(options = {}) {
  if (!celebrationsEnabled || prefersReducedMotion()) return;

  const {
    particleCount = 15,
    origin = { x: 0.5, y: 0.5 },
    colors = PALETTES.silver,
  } = options;

  confetti({
    particleCount,
    spread: 360,
    origin,
    startVelocity: 15,
    ticks: 60,
    gravity: 0.3,
    shapes: ['circle'],
    colors,
    scalar: 0.5,
    disableForReducedMotion: true,
  });
}

/**
 * Rising particles - for achievements
 */
export function rise(options = {}) {
  if (!celebrationsEnabled || prefersReducedMotion()) return;

  const {
    particleCount = 12,
    origin = { x: 0.5, y: 0.7 },
    colors = PALETTES.cosmic,
  } = options;

  confetti({
    particleCount,
    spread: 30,
    origin,
    startVelocity: 35,
    ticks: 80,
    gravity: 0.6,
    shapes: ['circle'],
    colors,
    scalar: 0.6,
    angle: 90,
    disableForReducedMotion: true,
  });
}

/**
 * Elegant cascade - for major achievements
 */
export function cascade(options = {}) {
  if (!celebrationsEnabled || prefersReducedMotion()) return;

  const { duration = 1500, colors = PALETTES.gold } = options;
  const animationEnd = Date.now() + duration;

  const frame = () => {
    confetti({
      particleCount: 2,
      angle: 60,
      spread: 35,
      origin: { x: 0, y: 0.5 },
      colors,
      shapes: ['circle'],
      scalar: 0.6,
      gravity: 1.2,
      ticks: 60,
    });
    confetti({
      particleCount: 2,
      angle: 120,
      spread: 35,
      origin: { x: 1, y: 0.5 },
      colors,
      shapes: ['circle'],
      scalar: 0.6,
      gravity: 1.2,
      ticks: 60,
    });

    if (Date.now() < animationEnd) {
      setTimeout(frame, 100);
    }
  };

  frame();
}

/**
 * Gentle rain - for level ups (subtle, not overwhelming)
 */
export function rain(options = {}) {
  if (!celebrationsEnabled || prefersReducedMotion()) return;

  const { duration = 1500, colors = PALETTES.cosmic } = options;
  const animationEnd = Date.now() + duration;

  const frame = () => {
    confetti({
      particleCount: 1,
      angle: 270,
      spread: 120,
      origin: { x: Math.random(), y: -0.1 },
      colors,
      ticks: 150,
      gravity: 0.8,
      scalar: 0.5,
      startVelocity: 5,
      shapes: ['circle'],
    });

    if (Date.now() < animationEnd) {
      requestAnimationFrame(frame);
    }
  };

  frame();
}

/**
 * Subtle sparkle at a specific point - for micro-celebrations
 */
export function sparkle(x, y) {
  if (!celebrationsEnabled || prefersReducedMotion()) return;

  const origin = {
    x: x / window.innerWidth,
    y: y / window.innerHeight,
  };

  confetti({
    particleCount: 8,
    spread: 40,
    origin,
    colors: PALETTES.gold,
    startVelocity: 12,
    ticks: 35,
    scalar: 0.4,
    gravity: 1,
    shapes: ['circle'],
    disableForReducedMotion: true,
  });
}

/**
 * Pulse effect - subtle radial pulse
 */
export function pulse(options = {}) {
  if (!celebrationsEnabled || prefersReducedMotion()) return;

  const { origin = { x: 0.5, y: 0.5 }, colors = PALETTES.warm } = options;

  // Quick burst that fades fast
  confetti({
    particleCount: 25,
    spread: 360,
    origin,
    colors,
    startVelocity: 25,
    ticks: 40,
    gravity: 0.5,
    scalar: 0.5,
    shapes: ['circle'],
    disableForReducedMotion: true,
  });
}

/**
 * Streak flame effect - warm colors rising
 */
export function flame(options = {}) {
  if (!celebrationsEnabled || prefersReducedMotion()) return;

  const { origin = { x: 0.5, y: 0.7 } } = options;

  confetti({
    particleCount: 15,
    spread: 25,
    origin,
    colors: PALETTES.warm,
    startVelocity: 30,
    ticks: 60,
    gravity: 0.8,
    scalar: 0.5,
    angle: 90,
    shapes: ['circle'],
    disableForReducedMotion: true,
  });
}

// Legacy function names for compatibility
export const stars = shimmer;
export const fireworks = cascade;
export const cannons = () => {
  burst({ origin: { x: 0.2, y: 0.7 }, spread: 50 });
  burst({ origin: { x: 0.8, y: 0.7 }, spread: 50 });
};
export const explosion = pulse;

// Removed emojis function - too childish

// Preset celebration patterns for common events (refined)
export const celebrationPresets = {
  // Task completions - subtle
  taskComplete: () => sparkle(window.innerWidth / 2, window.innerHeight * 0.5),
  multipleTasksComplete: () => burst({ particleCount: 25, colors: PALETTES.warm }),

  // Streaks - warm, fiery feeling
  streakDay3: () => sparkle(window.innerWidth / 2, window.innerHeight / 2),
  streakDay7: () => flame(),
  streakDay30: () => { flame(); setTimeout(() => rise({ colors: PALETTES.warm }), 150); },
  streakDay100: () => cascade({ duration: 2000, colors: PALETTES.gold }),

  // Achievements - elegant
  achievementUnlock: () => rise({ colors: PALETTES.cosmic }),
  levelUp: () => { rain({ duration: 1200 }); setTimeout(pulse, 400); },
  questComplete: () => { burst({ colors: PALETTES.cosmic }); setTimeout(shimmer, 100); },

  // Fitness - energetic but refined
  personalBest: () => { rise({ colors: PALETTES.gold }); setTimeout(() => pulse({ colors: PALETTES.gold }), 200); },
  workoutComplete: () => burst({ colors: PALETTES.cool, particleCount: 18 }),
  goalReached: () => cascade({ duration: 1500, colors: PALETTES.gold }),

  // XP/Points - scaled to amount
  xpGain: (amount) => {
    if (amount >= 100) pulse({ colors: PALETTES.cosmic });
    else if (amount >= 50) burst({ particleCount: 15, colors: PALETTES.warm });
    else sparkle(window.innerWidth / 2, window.innerHeight * 0.4);
  },

  // Milestones
  milestone: () => cascade({ colors: PALETTES.gold }),
  bigWin: () => { cascade({ duration: 1800 }); setTimeout(() => rain({ duration: 1000 }), 500); },
};

// Export as service object
export const celebrations = {
  // Core effects
  burst,
  shimmer,
  rise,
  cascade,
  rain,
  sparkle,
  pulse,
  flame,
  // Legacy aliases
  stars,
  fireworks,
  cannons,
  explosion,
  // Settings
  setEnabled: setCelebrationsEnabled,
  isEnabled: getCelebrationsEnabled,
  presets: celebrationPresets,
};

export default celebrations;
