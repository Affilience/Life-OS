/**
 * Combo System
 *
 * Tracks rapid task/quest completions within a time window
 * and escalates celebration intensity accordingly.
 *
 * Features:
 * - Tracks completions within configurable time window
 * - Increases intensity multiplier with each combo
 * - Provides combo visuals and sounds
 * - Resets after inactivity
 * - Persists combo state across component re-renders
 */

import { celebrateCombo, COMBO_TO_TIER, getTierConfig } from './celebrationTiers';
import { sounds } from './sounds';
import { haptics } from './haptics';

// Combo configuration
const COMBO_CONFIG = {
  // Time window in ms to maintain combo (3 seconds)
  timeWindow: 3000,

  // Maximum combo count before capping
  maxCombo: 20,

  // Intensity multipliers for combo levels
  multipliers: {
    1: 1.0,   // Normal
    2: 1.25,  // 2-combo
    3: 1.5,   // 3-combo
    4: 1.75,  // 4-combo
    5: 2.0,   // 5-combo (FIRE!)
    10: 2.5,  // 10-combo (ON FIRE!!)
    15: 3.0,  // 15-combo (UNSTOPPABLE!!!)
    20: 4.0,  // 20-combo (GODLIKE!!!!)
  },

  // Combo labels
  labels: {
    2: 'Double!',
    3: 'Triple!',
    4: 'Quad!',
    5: 'FIRE!',
    6: 'Super!',
    7: 'Mega!',
    8: 'Ultra!',
    9: 'Extreme!',
    10: 'ON FIRE!!',
    15: 'UNSTOPPABLE!!!',
    20: 'GODLIKE!!!!',
  },

  // Colors for combo levels
  colors: {
    1: '#4ADE80',   // Green
    2: '#22D3EE',   // Cyan
    3: '#3B82F6',   // Blue
    4: '#8B5CF6',   // Purple
    5: '#F59E0B',   // Amber (fire)
    10: '#EF4444',  // Red (on fire)
    15: '#EC4899',  // Pink (unstoppable)
    20: '#FFD700',  // Gold (godlike)
  },
};

// Singleton state for combo tracking
let comboState = {
  count: 0,
  lastCompletionTime: 0,
  resetTimer: null,
  listeners: new Set(),
};

/**
 * Get the intensity multiplier for current combo count
 */
function getMultiplier(count) {
  const multipliers = COMBO_CONFIG.multipliers;
  const keys = Object.keys(multipliers).map(Number).sort((a, b) => b - a);

  for (const key of keys) {
    if (count >= key) {
      return multipliers[key];
    }
  }

  return 1.0;
}

/**
 * Get the label for current combo count
 */
function getLabel(count) {
  const labels = COMBO_CONFIG.labels;
  const keys = Object.keys(labels).map(Number).sort((a, b) => b - a);

  for (const key of keys) {
    if (count >= key) {
      return labels[key];
    }
  }

  return null;
}

/**
 * Get the color for current combo count
 */
function getColor(count) {
  const colors = COMBO_CONFIG.colors;
  const keys = Object.keys(colors).map(Number).sort((a, b) => b - a);

  for (const key of keys) {
    if (count >= key) {
      return colors[key];
    }
  }

  return colors[1];
}

/**
 * Notify all listeners of state change
 */
function notifyListeners() {
  comboState.listeners.forEach((listener) => {
    listener({
      count: comboState.count,
      multiplier: getMultiplier(comboState.count),
      label: getLabel(comboState.count),
      color: getColor(comboState.count),
      timeRemaining: comboState.lastCompletionTime + COMBO_CONFIG.timeWindow - Date.now(),
    });
  });
}

/**
 * Reset combo to zero
 */
function resetCombo() {
  comboState.count = 0;
  comboState.lastCompletionTime = 0;
  if (comboState.resetTimer) {
    clearTimeout(comboState.resetTimer);
    comboState.resetTimer = null;
  }
  notifyListeners();
}

/**
 * Register a task completion and update combo
 * @param {Object} options - Options for the completion
 * @param {Function} options.onCombo - Callback when combo increments
 * @param {Object} options.position - {x, y} for particle effects
 * @param {Function} options.onParticleBurst - Particle burst function
 * @param {boolean} options.reducedMotion - User prefers reduced motion
 * @returns {Object} Current combo state
 */
export function registerCompletion(options = {}) {
  const now = Date.now();
  const timeSinceLastCompletion = now - comboState.lastCompletionTime;

  // Clear existing reset timer
  if (comboState.resetTimer) {
    clearTimeout(comboState.resetTimer);
  }

  // Check if within combo window
  if (timeSinceLastCompletion <= COMBO_CONFIG.timeWindow || comboState.count === 0) {
    // Increment combo
    comboState.count = Math.min(comboState.count + 1, COMBO_CONFIG.maxCombo);
  } else {
    // Reset and start new combo
    comboState.count = 1;
  }

  comboState.lastCompletionTime = now;

  // Set reset timer
  comboState.resetTimer = setTimeout(() => {
    resetCombo();
  }, COMBO_CONFIG.timeWindow);

  // Get current state
  const currentState = {
    count: comboState.count,
    multiplier: getMultiplier(comboState.count),
    label: getLabel(comboState.count),
    color: getColor(comboState.count),
    isCombo: comboState.count >= 2,
    tier: COMBO_TO_TIER(comboState.count),
  };

  // Trigger combo celebration if applicable
  if (currentState.isCombo && !options.skipCelebration) {
    // Play combo-specific sound
    if (comboState.count === 5 || comboState.count === 10 || comboState.count === 15 || comboState.count === 20) {
      sounds.streak?.();
      haptics.success?.();
    } else if (comboState.count >= 3) {
      sounds.success?.();
      haptics.medium?.();
    }

    // Callback for combo UI updates
    options.onCombo?.(currentState);

    // Celebrate based on combo tier
    if (comboState.count >= 3) {
      celebrateCombo(comboState.count, {
        position: options.position,
        onParticleBurst: options.onParticleBurst,
        reducedMotion: options.reducedMotion,
        skipSound: true, // We already played sound above
        skipHaptic: true, // We already triggered haptic above
      });
    }
  }

  notifyListeners();

  return currentState;
}

/**
 * Get current combo state
 */
export function getComboState() {
  return {
    count: comboState.count,
    multiplier: getMultiplier(comboState.count),
    label: getLabel(comboState.count),
    color: getColor(comboState.count),
    isCombo: comboState.count >= 2,
    tier: COMBO_TO_TIER(comboState.count),
    timeRemaining: Math.max(0, comboState.lastCompletionTime + COMBO_CONFIG.timeWindow - Date.now()),
  };
}

/**
 * Subscribe to combo state changes
 * @param {Function} listener - Callback function
 * @returns {Function} Unsubscribe function
 */
export function subscribeToCombo(listener) {
  comboState.listeners.add(listener);

  // Call immediately with current state
  listener(getComboState());

  return () => {
    comboState.listeners.delete(listener);
  };
}

/**
 * Force reset the combo (e.g., on page navigation)
 */
export function forceResetCombo() {
  resetCombo();
}

/**
 * Get configuration values
 */
export function getComboConfig() {
  return { ...COMBO_CONFIG };
}

/**
 * React hook for combo system
 * Usage:
 * const { count, multiplier, label, color, register } = useCombo();
 */
export function createComboHook() {
  // This returns a factory function that can be used in React components
  return {
    registerCompletion,
    getComboState,
    subscribeToCombo,
    forceResetCombo,
    getComboConfig,
    getMultiplier,
    getLabel,
    getColor,
  };
}

// Export everything
export default {
  registerCompletion,
  getComboState,
  subscribeToCombo,
  forceResetCombo,
  getComboConfig,
  getMultiplier,
  getLabel,
  getColor,
  COMBO_CONFIG,
};
