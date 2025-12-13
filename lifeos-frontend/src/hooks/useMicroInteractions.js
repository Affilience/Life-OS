/**
 * useMicroInteractions Hook
 *
 * Easy-to-use hook for adding micro-interactions to any component.
 * Provides access to haptics, sounds, and celebrations with proper
 * user preference handling.
 *
 * Usage:
 *   const { haptics, sounds, celebrations, feedback, settings } = useMicroInteractions();
 *
 *   // Simple usage
 *   onClick={() => feedback.buttonPress()}
 *
 *   // Or use individual services
 *   onClick={() => {
 *     haptics.impact('light');
 *     sounds.click();
 *   }}
 */

import { useCallback, useMemo } from 'react';
import { useReducedMotion } from 'framer-motion';
import {
  haptics,
  sounds,
  celebrations,
  feedback as feedbackService,
  getMicroInteractionSettings,
  setMicroInteractionSettings,
} from '../services/microInteractions';

export function useMicroInteractions() {
  const prefersReducedMotion = useReducedMotion();

  // Get current settings
  const settings = useMemo(() => getMicroInteractionSettings(), []);

  // Update settings
  const updateSettings = useCallback((newSettings) => {
    setMicroInteractionSettings(newSettings);
  }, []);

  // Wrapped haptics that respects reduced motion
  const wrappedHaptics = useMemo(() => ({
    ...haptics,
    impact: async (style) => {
      if (!prefersReducedMotion) {
        await haptics.impact(style);
      }
    },
    notification: async (type) => {
      if (!prefersReducedMotion) {
        await haptics.notification(type);
      }
    },
    selection: async () => {
      if (!prefersReducedMotion) {
        await haptics.selection();
      }
    },
  }), [prefersReducedMotion]);

  // Wrapped celebrations that respects reduced motion
  const wrappedCelebrations = useMemo(() => ({
    ...celebrations,
    burst: (options) => {
      if (!prefersReducedMotion) {
        celebrations.burst(options);
      }
    },
    stars: (options) => {
      if (!prefersReducedMotion) {
        celebrations.stars(options);
      }
    },
    fireworks: (options) => {
      if (!prefersReducedMotion) {
        celebrations.fireworks(options);
      }
    },
    explosion: (options) => {
      if (!prefersReducedMotion) {
        celebrations.explosion(options);
      }
    },
    sparkle: (x, y) => {
      if (!prefersReducedMotion) {
        celebrations.sparkle(x, y);
      }
    },
  }), [prefersReducedMotion]);

  // Wrapped feedback that respects reduced motion for visual effects
  const wrappedFeedback = useMemo(() => ({
    ...feedbackService,

    // Task interactions
    taskComplete: (options = {}) => {
      haptics.presets.taskComplete();
      sounds.pop();
      if (!prefersReducedMotion && options.celebrate) {
        if (options.position) {
          celebrations.sparkle(options.position.x, options.position.y);
        } else {
          celebrations.presets.taskComplete();
        }
      }
    },

    // Achievements (always show visual feedback for these)
    achievement: () => {
      haptics.presets.achievement();
      sounds.achievement();
      if (!prefersReducedMotion) {
        celebrations.presets.achievementUnlock();
      }
    },

    levelUp: () => {
      haptics.presets.levelUp();
      sounds.levelUp();
      if (!prefersReducedMotion) {
        celebrations.presets.levelUp();
      }
    },

    streakMilestone: (days) => {
      haptics.presets.streakMilestone();
      sounds.streak();
      if (!prefersReducedMotion) {
        if (days >= 100) {
          celebrations.presets.streakDay100();
        } else if (days >= 30) {
          celebrations.presets.streakDay30();
        } else if (days >= 7) {
          celebrations.presets.streakDay7();
        } else {
          celebrations.presets.streakDay3();
        }
      }
    },
  }), [prefersReducedMotion]);

  return {
    haptics: wrappedHaptics,
    sounds,
    celebrations: wrappedCelebrations,
    feedback: wrappedFeedback,
    settings,
    updateSettings,
    prefersReducedMotion,
  };
}

/**
 * Simple hook for just triggering feedback on events
 *
 * Usage:
 *   const triggerFeedback = useFeedback();
 *   <button onClick={() => triggerFeedback('buttonPress')}>Click me</button>
 */
export function useFeedback() {
  const { feedback } = useMicroInteractions();

  return useCallback((type, options) => {
    const handler = feedback[type];
    if (typeof handler === 'function') {
      handler(options);
    } else {
      console.warn(`Unknown feedback type: ${type}`);
    }
  }, [feedback]);
}

/**
 * Hook for celebration effects
 *
 * Usage:
 *   const celebrate = useCelebration();
 *   celebrate('burst'); // or 'stars', 'fireworks', 'explosion'
 */
export function useCelebration() {
  const { celebrations } = useMicroInteractions();

  return useCallback((type, options) => {
    const handler = celebrations[type] || celebrations.presets?.[type];
    if (typeof handler === 'function') {
      handler(options);
    } else {
      console.warn(`Unknown celebration type: ${type}`);
    }
  }, [celebrations]);
}

export default useMicroInteractions;
