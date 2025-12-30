/**
 * Celebrations Service
 *
 * Provides satisfying celebration effects for achievements and completions.
 * Designed to feel rewarding and visually impressive.
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

// Vibrant color palettes
const PALETTES = {
  gold: ['#FFD700', '#FFC125', '#FFAA00', '#FFE55C', '#FFF8DC'],
  silver: ['#E8E8E8', '#C0C0C0', '#F5F5F5', '#DCDCDC', '#FFFFFF'],
  cosmic: ['#8B5CF6', '#A78BFA', '#7C3AED', '#C4B5FD', '#DDD6FE', '#E879F9'],
  warm: ['#FF6B35', '#F7C59F', '#FF8C42', '#FFBE5C', '#FFD93D'],
  cool: ['#06B6D4', '#0891B2', '#22D3EE', '#67E8F9', '#A5F3FC'],
  minimal: ['#6B7280', '#9CA3AF', '#D1D5DB', '#E5E7EB'],
  rainbow: ['#FF6B6B', '#FFE66D', '#4ECDC4', '#45B7D1', '#96E6A1', '#DDA0DD'],
  fire: ['#FF4500', '#FF6347', '#FF8C00', '#FFD700', '#FFFF00'],
  achievement: ['#8B5CF6', '#F59E0B', '#EC4899', '#06B6D4', '#10B981'],
};

/**
 * Burst - satisfying explosion of particles
 * @param {Object} options - Customisation options
 */
export function burst(options = {}) {
  if (!celebrationsEnabled || prefersReducedMotion()) return;

  const {
    particleCount = 45,
    spread = 70,
    origin = { x: 0.5, y: 0.6 },
    colors = PALETTES.gold,
    startVelocity = 35,
    ticks = 80,
  } = options;

  confetti({
    particleCount,
    spread,
    origin,
    colors,
    startVelocity,
    ticks,
    gravity: 1.2,
    scalar: 1,
    drift: 0,
    shapes: ['circle', 'square'],
    disableForReducedMotion: true,
  });
}

/**
 * Shimmer - radial sparkle effect
 */
export function shimmer(options = {}) {
  if (!celebrationsEnabled || prefersReducedMotion()) return;

  const {
    particleCount = 35,
    origin = { x: 0.5, y: 0.5 },
    colors = PALETTES.silver,
  } = options;

  confetti({
    particleCount,
    spread: 360,
    origin,
    startVelocity: 25,
    ticks: 100,
    gravity: 0.4,
    shapes: ['circle', 'star'],
    colors,
    scalar: 0.9,
    disableForReducedMotion: true,
  });
}

/**
 * Rising particles - for achievements
 */
export function rise(options = {}) {
  if (!celebrationsEnabled || prefersReducedMotion()) return;

  const {
    particleCount = 30,
    origin = { x: 0.5, y: 0.8 },
    colors = PALETTES.cosmic,
  } = options;

  // Fire multiple bursts for a fuller effect
  confetti({
    particleCount,
    spread: 50,
    origin,
    startVelocity: 50,
    ticks: 120,
    gravity: 0.7,
    shapes: ['circle', 'star'],
    colors,
    scalar: 1,
    angle: 90,
    disableForReducedMotion: true,
  });

  // Delayed second wave
  setTimeout(() => {
    confetti({
      particleCount: Math.floor(particleCount * 0.6),
      spread: 40,
      origin: { x: origin.x, y: origin.y + 0.05 },
      startVelocity: 40,
      ticks: 100,
      gravity: 0.7,
      shapes: ['circle'],
      colors,
      scalar: 0.8,
      angle: 90,
      disableForReducedMotion: true,
    });
  }, 100);
}

/**
 * Cascade - continuous stream from both sides (major achievements)
 */
export function cascade(options = {}) {
  if (!celebrationsEnabled || prefersReducedMotion()) return;

  const { duration = 2500, colors = PALETTES.gold } = options;
  const animationEnd = Date.now() + duration;

  const frame = () => {
    confetti({
      particleCount: 4,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.6 },
      colors,
      shapes: ['circle', 'square'],
      scalar: 1,
      gravity: 1,
      ticks: 100,
      startVelocity: 45,
    });
    confetti({
      particleCount: 4,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.6 },
      colors,
      shapes: ['circle', 'square'],
      scalar: 1,
      gravity: 1,
      ticks: 100,
      startVelocity: 45,
    });

    if (Date.now() < animationEnd) {
      setTimeout(frame, 50);
    }
  };

  frame();
}

/**
 * Rain - particles falling from above (level ups)
 */
export function rain(options = {}) {
  if (!celebrationsEnabled || prefersReducedMotion()) return;

  const { duration = 2500, colors = PALETTES.cosmic } = options;
  const animationEnd = Date.now() + duration;
  let frameCount = 0;

  const frame = () => {
    frameCount++;
    // Spawn particles at random intervals for natural effect
    if (frameCount % 2 === 0) {
      confetti({
        particleCount: 3,
        angle: 270,
        spread: 180,
        origin: { x: Math.random(), y: -0.1 },
        colors,
        ticks: 200,
        gravity: 0.6,
        scalar: 0.9,
        startVelocity: 10,
        shapes: ['circle', 'star'],
      });
    }

    if (Date.now() < animationEnd) {
      requestAnimationFrame(frame);
    }
  };

  frame();
}

/**
 * Sparkle at a specific point - for task completions
 */
export function sparkle(x, y) {
  if (!celebrationsEnabled || prefersReducedMotion()) return;

  const origin = {
    x: x / window.innerWidth,
    y: y / window.innerHeight,
  };

  confetti({
    particleCount: 25,
    spread: 60,
    origin,
    colors: PALETTES.gold,
    startVelocity: 25,
    ticks: 70,
    scalar: 0.8,
    gravity: 1,
    shapes: ['circle', 'star'],
    disableForReducedMotion: true,
  });
}

/**
 * Pulse effect - radial explosion
 */
export function pulse(options = {}) {
  if (!celebrationsEnabled || prefersReducedMotion()) return;

  const { origin = { x: 0.5, y: 0.5 }, colors = PALETTES.warm } = options;

  // Main burst
  confetti({
    particleCount: 50,
    spread: 360,
    origin,
    colors,
    startVelocity: 35,
    ticks: 80,
    gravity: 0.6,
    scalar: 1,
    shapes: ['circle', 'square'],
    disableForReducedMotion: true,
  });

  // Secondary inner burst for depth
  setTimeout(() => {
    confetti({
      particleCount: 25,
      spread: 360,
      origin,
      colors,
      startVelocity: 20,
      ticks: 60,
      gravity: 0.5,
      scalar: 0.7,
      shapes: ['star'],
      disableForReducedMotion: true,
    });
  }, 50);
}

/**
 * Streak flame effect - fiery celebration
 */
export function flame(options = {}) {
  if (!celebrationsEnabled || prefersReducedMotion()) return;

  const { origin = { x: 0.5, y: 0.8 } } = options;

  // Main flame burst
  confetti({
    particleCount: 35,
    spread: 40,
    origin,
    colors: PALETTES.fire,
    startVelocity: 50,
    ticks: 100,
    gravity: 0.8,
    scalar: 1,
    angle: 90,
    shapes: ['circle', 'square'],
    disableForReducedMotion: true,
  });

  // Side flames
  setTimeout(() => {
    confetti({
      particleCount: 20,
      spread: 35,
      origin: { x: origin.x - 0.1, y: origin.y },
      colors: PALETTES.fire,
      startVelocity: 40,
      ticks: 80,
      gravity: 0.9,
      scalar: 0.8,
      angle: 80,
      shapes: ['circle'],
      disableForReducedMotion: true,
    });
    confetti({
      particleCount: 20,
      spread: 35,
      origin: { x: origin.x + 0.1, y: origin.y },
      colors: PALETTES.fire,
      startVelocity: 40,
      ticks: 80,
      gravity: 0.9,
      scalar: 0.8,
      angle: 100,
      shapes: ['circle'],
      disableForReducedMotion: true,
    });
  }, 80);
}

// Legacy function names for compatibility
export const stars = shimmer;
export const fireworks = cascade;
export const cannons = () => {
  burst({ origin: { x: 0.15, y: 0.7 }, spread: 70 });
  setTimeout(() => burst({ origin: { x: 0.85, y: 0.7 }, spread: 70 }), 100);
};
export const explosion = pulse;

/**
 * Epic celebration - for major achievements
 */
export function epic(options = {}) {
  if (!celebrationsEnabled || prefersReducedMotion()) return;

  const { colors = PALETTES.rainbow } = options;

  // Multi-stage celebration
  // Stage 1: Center burst
  pulse({ colors });

  // Stage 2: Side cannons
  setTimeout(() => {
    cannons();
  }, 200);

  // Stage 3: Rain effect
  setTimeout(() => {
    rain({ duration: 2000, colors });
  }, 500);
}

// Preset celebration patterns for common events
export const celebrationPresets = {
  // Task completions
  taskComplete: () => sparkle(window.innerWidth / 2, window.innerHeight * 0.5),
  multipleTasksComplete: () => burst({ particleCount: 60, colors: PALETTES.warm }),

  // Streaks - fiery, escalating
  streakDay3: () => burst({ particleCount: 30, colors: PALETTES.warm }),
  streakDay7: () => flame(),
  streakDay14: () => { flame(); setTimeout(() => rise({ colors: PALETTES.fire }), 150); },
  streakDay30: () => { flame(); setTimeout(() => cascade({ duration: 2000, colors: PALETTES.fire }), 200); },
  streakDay100: () => epic({ colors: PALETTES.fire }),

  // Achievements
  achievementUnlock: () => rise({ colors: PALETTES.achievement }),
  achievementRare: () => { rise({ colors: PALETTES.cosmic }); setTimeout(() => shimmer({ colors: PALETTES.cosmic }), 200); },
  achievementEpic: () => { cascade({ duration: 2000, colors: PALETTES.cosmic }); setTimeout(pulse, 300); },
  achievementLegendary: () => epic({ colors: PALETTES.gold }),

  // Level ups - big celebration
  levelUp: () => {
    rain({ duration: 2000, colors: PALETTES.cosmic });
    setTimeout(() => pulse({ colors: PALETTES.cosmic }), 300);
    setTimeout(() => cannons(), 600);
  },
  tierUp: () => epic({ colors: PALETTES.gold }),
  questComplete: () => { burst({ colors: PALETTES.cosmic, particleCount: 60 }); setTimeout(() => shimmer({ colors: PALETTES.cosmic }), 150); },

  // Fitness
  personalBest: () => { rise({ colors: PALETTES.gold }); setTimeout(() => pulse({ colors: PALETTES.gold }), 200); },
  workoutComplete: () => burst({ colors: PALETTES.cool, particleCount: 45 }),
  goalReached: () => cascade({ duration: 2000, colors: PALETTES.gold }),

  // XP/Points - scaled to amount
  xpGain: (amount) => {
    if (amount >= 100) { pulse({ colors: PALETTES.cosmic }); setTimeout(() => shimmer({ colors: PALETTES.cosmic }), 100); }
    else if (amount >= 50) burst({ particleCount: 40, colors: PALETTES.warm });
    else sparkle(window.innerWidth / 2, window.innerHeight * 0.4);
  },

  // Milestones
  milestone: () => cascade({ duration: 2500, colors: PALETTES.gold }),
  bigWin: () => epic({ colors: PALETTES.rainbow }),
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
  epic,
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
