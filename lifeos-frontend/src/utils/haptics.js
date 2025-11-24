/**
 * Haptics Utility
 * Provides haptic feedback for iOS/Android using Capacitor
 */

import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

// User preference (stored in localStorage)
let hapticsEnabled = localStorage.getItem('haptics-enabled') !== 'false';

/**
 * Haptic feedback utility
 */
export const haptics = {
  /**
   * Light impact - for subtle interactions
   * Use for: button taps, toggles, list selections
   */
  light: async () => {
    if (!hapticsEnabled) return;
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch (error) {
      // Gracefully fail on platforms without haptics
      console.debug('Haptics not available:', error);
    }
  },

  /**
   * Medium impact - for standard interactions
   * Use for: confirmations, selections, swipe actions
   */
  medium: async () => {
    if (!hapticsEnabled) return;
    try {
      await Haptics.impact({ style: ImpactStyle.Medium });
    } catch (error) {
      console.debug('Haptics not available:', error);
    }
  },

  /**
   * Heavy impact - for significant actions
   * Use for: major actions, achievements, destructive actions
   */
  heavy: async () => {
    if (!hapticsEnabled) return;
    try {
      await Haptics.impact({ style: ImpactStyle.Heavy });
    } catch (error) {
      console.debug('Haptics not available:', error);
    }
  },

  /**
   * Selection feedback - for continuous selection changes
   * Use for: scrolling pickers, sliders, pagination
   */
  selection: async () => {
    if (!hapticsEnabled) return;
    try {
      await Haptics.selectionStart();
    } catch (error) {
      console.debug('Haptics not available:', error);
    }
  },

  /**
   * Success notification - for successful actions
   * Use for: completed tasks, saved data, level ups
   */
  success: async () => {
    if (!hapticsEnabled) return;
    try {
      await Haptics.notification({ type: NotificationType.Success });
    } catch (error) {
      console.debug('Haptics not available:', error);
    }
  },

  /**
   * Warning notification - for warnings
   * Use for: approaching limits, unsaved changes
   */
  warning: async () => {
    if (!hapticsEnabled) return;
    try {
      await Haptics.notification({ type: NotificationType.Warning });
    } catch (error) {
      console.debug('Haptics not available:', error);
    }
  },

  /**
   * Error notification - for errors
   * Use for: failed actions, validation errors
   */
  error: async () => {
    if (!hapticsEnabled) return;
    try {
      await Haptics.notification({ type: NotificationType.Error });
    } catch (error) {
      console.debug('Haptics not available:', error);
    }
  },

  /**
   * Vibrate - custom vibration pattern
   * Use for: major achievements, dramatic moments
   */
  vibrate: async (duration = 200) => {
    if (!hapticsEnabled) return;
    try {
      await Haptics.vibrate({ duration });
    } catch (error) {
      console.debug('Haptics not available:', error);
    }
  },

  /**
   * Epic achievement - heavy + vibrate combo
   * Use for: level ups, constellation unlocks, major milestones
   */
  epic: async () => {
    if (!hapticsEnabled) return;
    try {
      await Haptics.impact({ style: ImpactStyle.Heavy });
      await Haptics.vibrate({ duration: 500 });
    } catch (error) {
      console.debug('Haptics not available:', error);
    }
  },

  /**
   * Enable/disable haptics
   */
  setEnabled: (enabled) => {
    hapticsEnabled = enabled;
    localStorage.setItem('haptics-enabled', enabled ? 'true' : 'false');
  },

  /**
   * Check if haptics is enabled
   */
  isEnabled: () => hapticsEnabled,
};

export default haptics;
