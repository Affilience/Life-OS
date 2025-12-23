/**
 * Micro-Interactions Service
 *
 * Unified interface for all feedback systems:
 * - Haptics (touch feedback)
 * - Celebrations (confetti, particles)
 * - Sounds (audio feedback)
 * - Celebration Tiers (intensity levels)
 * - Combo System (rapid completion tracking)
 *
 * Usage:
 *   import { feedback } from '@/services/microInteractions';
 *
 *   // Complete a task with full feedback
 *   feedback.taskComplete();
 *
 *   // Or use individual services
 *   import { haptics, celebrations, sounds } from '@/services/microInteractions';
 */

export { haptics, hapticPresets } from './haptics';
export { celebrations, celebrationPresets } from './celebrations';
export { sounds, soundPresets } from './sounds';
export {
  CELEBRATION_TIERS,
  celebrate,
  celebrateXP,
  celebrateAchievement,
  celebrateStreak,
  celebrateLevelUp,
  celebrateCombo,
  getTierConfig,
  getTierForContext,
} from './celebrationTiers';
export {
  registerCompletion,
  getComboState,
  subscribeToCombo,
  forceResetCombo,
  getComboConfig,
} from './comboSystem';

import { haptics, hapticPresets } from './haptics';
import { celebrations, celebrationPresets } from './celebrations';
import { sounds, soundPresets } from './sounds';
import { celebrate, getTierForContext, CELEBRATION_TIERS } from './celebrationTiers';
import { registerCompletion, getComboState } from './comboSystem';

// ============================================================================
// UNIFIED FEEDBACK PRESETS
// Combines haptics, sounds, and visuals for common actions
// ============================================================================

/**
 * Unified feedback for common interactions
 * Each preset triggers appropriate haptics, sounds, and celebrations together
 */
export const feedback = {
  // -------------------------------------------------------------------------
  // TASK INTERACTIONS
  // -------------------------------------------------------------------------

  /**
   * Task marked as complete - EXTREMELY SATISFYING
   * Rich layered sound + chunky haptic + sparkle celebration
   */
  taskComplete: (options = {}) => {
    const { celebrate = true, position = null, subtle = false } = options;

    // Always use the satisfying haptic
    hapticPresets.taskComplete();

    // Use the rich, layered sound (unless subtle mode)
    if (subtle) {
      sounds.pop();
    } else {
      sounds.taskCompleteSatisfying();
    }

    // Always show at least a small celebration (unless explicitly disabled)
    if (celebrate !== false) {
      if (position) {
        // Position-aware sparkle burst
        celebrations.sparkle(position.x, position.y);
        // Add extra burst for more satisfaction
        setTimeout(() => {
          celebrations.burst({
            particleCount: 12,
            spread: 50,
            origin: {
              x: position.x / window.innerWidth,
              y: position.y / window.innerHeight
            },
            colors: ['#8B5CF6', '#A78BFA', '#C4B5FD', '#06B6D4'],
            startVelocity: 18,
            ticks: 40,
          });
        }, 50);
      } else {
        celebrationPresets.taskComplete();
      }
    }
  },

  /**
   * Task unchecked/uncompleted
   */
  taskUncomplete: () => {
    hapticPresets.taskUncomplete();
    sounds.remove();
  },

  /**
   * Multiple tasks completed at once
   */
  multipleTasksComplete: (count) => {
    haptics.notification('success');
    sounds.success();
    if (count >= 3) {
      celebrationPresets.multipleTasksComplete();
    }
  },

  // -------------------------------------------------------------------------
  // BUTTON/UI INTERACTIONS
  // -------------------------------------------------------------------------

  /**
   * Standard button press
   */
  buttonPress: () => {
    hapticPresets.buttonPress();
    sounds.click();
  },

  /**
   * Important/heavy button press (delete, submit, etc.)
   */
  buttonPressHeavy: () => {
    hapticPresets.buttonPressHeavy();
    sounds.click();
  },

  /**
   * Toggle/switch on
   */
  toggleOn: () => {
    hapticPresets.toggleOn();
    sounds.toggleOn();
  },

  /**
   * Toggle/switch off
   */
  toggleOff: () => {
    hapticPresets.toggleOff();
    sounds.toggleOff();
  },

  /**
   * Tab/segment change
   */
  tabChange: () => {
    hapticPresets.tabChange();
  },

  // -------------------------------------------------------------------------
  // ACHIEVEMENTS & MILESTONES
  // -------------------------------------------------------------------------

  /**
   * Achievement unlocked with rarity-based celebration
   * @param {string} rarity - 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
   */
  achievement: (rarity = 'rare') => {
    hapticPresets.achievement();

    // Play rarity-appropriate sound (using audio files)
    switch (rarity) {
      case 'legendary':
      case 'epic':
        // Big achievements get the fanfare (confirmation.wav)
        sounds.levelUpSound();
        break;
      case 'rare':
        // Rare gets the unlock sound (gaming-lock.wav)
        sounds.achievementSound();
        break;
      case 'uncommon':
      default:
        // Common/uncommon get the subtle pop (pop-alert.mp3)
        sounds.taskCompleteSound();
    }

    // Tier-based celebration
    const tier = getTierForContext({ type: 'achievement', rarity });
    celebrate(tier, { skipSound: true, skipHaptic: true });
  },

  /**
   * Achievement unlocked (simpler feedback for common achievements)
   */
  achievementUnlock: () => {
    haptics.notification('success');
    sounds.achievementSound(); // Audio file: gaming-lock.wav
  },

  /**
   * Achievement unlocked by rarity (alias for components using achievementByRarity)
   */
  achievementByRarity: (rarity) => {
    feedback.achievement(rarity);
  },

  /**
   * Level up with level-based celebration intensity
   * @param {number} level - The new level reached
   */
  levelUp: (level = 1) => {
    hapticPresets.levelUp();
    sounds.levelUpSound(); // Audio file: confirmation.wav (big fanfare)

    // Use level-appropriate celebration tier
    const tier = getTierForContext({ type: 'level', value: level });
    celebrate(tier, { skipSound: true, skipHaptic: true });
  },

  /**
   * Quest/challenge completed
   */
  questComplete: () => {
    haptics.notification('success');
    sounds.success();
    celebrationPresets.questComplete();
  },

  // -------------------------------------------------------------------------
  // STREAKS
  // -------------------------------------------------------------------------

  /**
   * Streak milestone reached - uses gaming lock sound
   */
  streakMilestone: (days) => {
    hapticPresets.streakMilestone();
    sounds.streakSound(); // Audio file: gaming-lock.wav

    if (days >= 100) {
      celebrationPresets.streakDay100();
    } else if (days >= 30) {
      celebrationPresets.streakDay30();
    } else if (days >= 7) {
      celebrationPresets.streakDay7();
    } else {
      celebrationPresets.streakDay3();
    }
  },

  /**
   * Daily streak continued (subtle) - uses quick click
   */
  streakContinued: () => {
    haptics.impact('light');
    sounds.xpGainSound(); // Audio file: test-sound.wav
  },

  /**
   * Streak continue with day count (alias for components using streakContinue)
   */
  streakContinue: (days) => {
    haptics.impact('medium');
    sounds.taskCompleteSound(); // Audio file: pop-alert.mp3
    if (days >= 7) {
      celebrations.burst({ particleCount: 15, colors: celebrations.PALETTES?.warm || ['#F59E0B', '#D97706'] });
    }
  },

  // -------------------------------------------------------------------------
  // FITNESS/HEALTH
  // -------------------------------------------------------------------------

  /**
   * Personal best achieved
   */
  personalBest: () => {
    haptics.notification('success');
    sounds.levelUp();
    celebrationPresets.personalBest();
  },

  /**
   * Workout completed
   */
  workoutComplete: () => {
    haptics.notification('success');
    sounds.success();
    celebrationPresets.workoutComplete();
  },

  /**
   * Single workout set completed
   */
  workoutSet: () => {
    haptics.impact('medium');
    sounds.pop();
  },

  /**
   * Goal reached (steps, calories, etc.)
   */
  goalReached: () => {
    haptics.notification('success');
    sounds.achievement();
    celebrationPresets.goalReached();
  },

  // -------------------------------------------------------------------------
  // XP/POINTS
  // -------------------------------------------------------------------------

  /**
   * XP gained - uses quick sci-fi click sound
   */
  xpGain: (amount = 10) => {
    haptics.impact('light');
    sounds.xpGainSound(); // Audio file: test-sound.wav (sci-fi click)
    celebrationPresets.xpGain(amount);
  },

  // -------------------------------------------------------------------------
  // ERRORS/FEEDBACK
  // -------------------------------------------------------------------------

  /**
   * Error occurred
   */
  error: () => {
    hapticPresets.error();
    sounds.error();
  },

  /**
   * Warning
   */
  warning: () => {
    hapticPresets.warning();
    sounds.notification();
  },

  /**
   * Delete action
   */
  delete: () => {
    hapticPresets.delete();
    sounds.remove();
  },

  // -------------------------------------------------------------------------
  // SPECIAL
  // -------------------------------------------------------------------------

  /**
   * Refresh/pull-to-refresh
   */
  refresh: () => {
    hapticPresets.refresh();
  },

  /**
   * Long press activated
   */
  longPress: () => {
    hapticPresets.longPress();
  },

  /**
   * Big celebration (birthday, year anniversary, etc.)
   */
  bigCelebration: () => {
    haptics.notification('success');
    sounds.levelUp();
    celebrations.fireworks({ duration: 4000 });
  },

  // -------------------------------------------------------------------------
  // COMBO SYSTEM
  // -------------------------------------------------------------------------

  /**
   * Task complete with combo tracking
   * Tracks rapid completions and escalates celebrations
   * @param {Object} options - Options for task completion
   * @param {Object} options.position - {x, y} click position
   * @param {Function} options.onCombo - Callback when combo increments
   */
  taskCompleteWithCombo: (options = {}) => {
    const { position = null, onCombo } = options;

    // Register with combo system
    const comboState = registerCompletion({
      position,
      onCombo,
      skipCelebration: false,
    });

    // Play sound based on combo count
    if (comboState.count >= 5) {
      sounds.taskCompleteCombo?.(comboState.count);
    } else if (comboState.count >= 2) {
      sounds.taskCompleteCombo?.(comboState.count);
    } else {
      sounds.taskCompleteSatisfying();
    }

    // Haptic based on combo
    if (comboState.count >= 5) {
      haptics.notification('success');
    } else if (comboState.count >= 2) {
      haptics.impact('medium');
    } else {
      hapticPresets.taskComplete();
    }

    return comboState;
  },

  /**
   * Get current combo state
   */
  getCombo: () => {
    return getComboState();
  },

  // -------------------------------------------------------------------------
  // PERFECT DAY
  // -------------------------------------------------------------------------

  /**
   * Perfect Day celebration (all daily tasks completed)
   * @param {Object} stats - Stats to display
   */
  perfectDay: (stats = {}) => {
    haptics.notification('success');
    sounds.perfectDay?.();
    celebrations.fireworks({ duration: 4000 });
  },

  // -------------------------------------------------------------------------
  // ANTICIPATION
  // -------------------------------------------------------------------------

  /**
   * Play anticipation sound (before reveals)
   */
  anticipation: () => {
    sounds.anticipation?.();
  },

  // -------------------------------------------------------------------------
  // UI CLICK (simple, no celebration)
  // -------------------------------------------------------------------------

  /**
   * Simple click feedback for UI elements
   */
  click: () => {
    haptics.impact('light');
    sounds.click();
  },
};

// ============================================================================
// SETTINGS MANAGEMENT
// ============================================================================

/**
 * Get all micro-interaction settings
 */
export function getMicroInteractionSettings() {
  return {
    haptics: haptics.isEnabled(),
    sounds: sounds.isEnabled(),
    soundVolume: sounds.getVolume(),
    celebrations: celebrations.isEnabled(),
  };
}

/**
 * Update micro-interaction settings
 */
export function setMicroInteractionSettings(settings) {
  if (settings.haptics !== undefined) {
    haptics.setEnabled(settings.haptics);
  }
  if (settings.sounds !== undefined) {
    sounds.setEnabled(settings.sounds);
  }
  if (settings.soundVolume !== undefined) {
    sounds.setVolume(settings.soundVolume);
  }
  if (settings.celebrations !== undefined) {
    celebrations.setEnabled(settings.celebrations);
  }
}

/**
 * Disable all feedback (for reduced motion or quiet mode)
 */
export function disableAllFeedback() {
  haptics.setEnabled(false);
  sounds.setEnabled(false);
  celebrations.setEnabled(false);
}

/**
 * Enable all feedback
 */
export function enableAllFeedback() {
  haptics.setEnabled(true);
  sounds.setEnabled(true);
  celebrations.setEnabled(true);
}

export default feedback;
