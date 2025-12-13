/**
 * Micro-Interactions Service
 *
 * Unified interface for all feedback systems:
 * - Haptics (touch feedback)
 * - Celebrations (confetti, particles)
 * - Sounds (audio feedback)
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

import { haptics, hapticPresets } from './haptics';
import { celebrations, celebrationPresets } from './celebrations';
import { sounds, soundPresets } from './sounds';

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
   * Achievement unlocked (full celebration)
   */
  achievement: () => {
    hapticPresets.achievement();
    sounds.achievement();
    celebrationPresets.achievementUnlock();
  },

  /**
   * Achievement unlocked (simpler feedback for common achievements)
   */
  achievementUnlock: () => {
    haptics.notification('success');
    sounds.success();
  },

  /**
   * Level up
   */
  levelUp: () => {
    hapticPresets.levelUp();
    sounds.levelUp();
    celebrationPresets.levelUp();
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
   * Streak milestone reached
   */
  streakMilestone: (days) => {
    hapticPresets.streakMilestone();
    sounds.streak();

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
   * Daily streak continued (subtle)
   */
  streakContinued: () => {
    haptics.impact('light');
    sounds.xpGain();
  },

  /**
   * Streak continue with day count (alias for components using streakContinue)
   */
  streakContinue: (days) => {
    haptics.impact('medium');
    sounds.pop();
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
   * XP gained
   */
  xpGain: (amount = 10) => {
    haptics.impact('light');
    sounds.xpGain();
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
