/**
 * Haptics Service
 *
 * Provides haptic feedback across platforms:
 * - Native iOS/Android via Capacitor Haptics
 * - Web fallback via Vibration API (Android Chrome)
 *
 * Haptic Types (inspired by iOS):
 * - impact: Physical feedback (light, medium, heavy)
 * - notification: Status feedback (success, warning, error)
 * - selection: UI selection changes
 */

import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

// Check if we're on a native platform
const isNative = () => {
  return window.Capacitor?.isNativePlatform?.() || false;
};

// Check if web vibration is available
const hasWebVibration = () => {
  return 'vibrate' in navigator;
};

// User preference for haptics (respects system settings)
let hapticsEnabled = true;

/**
 * Enable or disable haptics globally
 */
export function setHapticsEnabled(enabled) {
  hapticsEnabled = enabled;
  localStorage.setItem('hapticsEnabled', JSON.stringify(enabled));
}

/**
 * Check if haptics are enabled
 */
export function getHapticsEnabled() {
  const stored = localStorage.getItem('hapticsEnabled');
  if (stored !== null) {
    hapticsEnabled = JSON.parse(stored);
  }
  return hapticsEnabled;
}

// Initialize from storage
getHapticsEnabled();

/**
 * Impact haptic - physical feedback
 * @param {'light' | 'medium' | 'heavy'} style - Impact intensity
 */
export async function impact(style = 'medium') {
  if (!hapticsEnabled) return;

  try {
    if (isNative()) {
      const impactStyle = {
        light: ImpactStyle.Light,
        medium: ImpactStyle.Medium,
        heavy: ImpactStyle.Heavy,
      }[style] || ImpactStyle.Medium;

      await Haptics.impact({ style: impactStyle });
    } else if (hasWebVibration()) {
      // Web fallback with vibration patterns
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [30],
      };
      navigator.vibrate(patterns[style] || patterns.medium);
    }
  } catch (error) {
    console.warn('Haptics not available:', error);
  }
}

/**
 * Notification haptic - status feedback
 * @param {'success' | 'warning' | 'error'} type - Notification type
 */
export async function notification(type = 'success') {
  if (!hapticsEnabled) return;

  try {
    if (isNative()) {
      const notificationType = {
        success: NotificationType.Success,
        warning: NotificationType.Warning,
        error: NotificationType.Error,
      }[type] || NotificationType.Success;

      await Haptics.notification({ type: notificationType });
    } else if (hasWebVibration()) {
      // Web fallback patterns that feel distinct
      const patterns = {
        success: [10, 50, 10],      // Quick double tap
        warning: [30, 50, 30],      // Longer double tap
        error: [50, 100, 50, 100, 50], // Triple heavy tap
      };
      navigator.vibrate(patterns[type] || patterns.success);
    }
  } catch (error) {
    console.warn('Haptics not available:', error);
  }
}

/**
 * Selection haptic - UI selection change
 * Light tap for toggles, radio buttons, etc.
 */
export async function selection() {
  if (!hapticsEnabled) return;

  try {
    if (isNative()) {
      await Haptics.selectionStart();
      await Haptics.selectionChanged();
      await Haptics.selectionEnd();
    } else if (hasWebVibration()) {
      navigator.vibrate([5]);
    }
  } catch (error) {
    console.warn('Haptics not available:', error);
  }
}

/**
 * Custom vibration pattern (web only, native uses impact)
 * @param {number[]} pattern - Vibration pattern [vibrate, pause, vibrate, ...]
 */
export async function vibrate(pattern) {
  if (!hapticsEnabled) return;

  try {
    if (isNative()) {
      // Native doesn't support custom patterns well, use medium impact
      await Haptics.impact({ style: ImpactStyle.Medium });
    } else if (hasWebVibration()) {
      navigator.vibrate(pattern);
    }
  } catch (error) {
    console.warn('Haptics not available:', error);
  }
}

/**
 * Extra satisfying task complete haptic - double tap pattern
 */
export async function taskCompleteSatisfying() {
  if (!hapticsEnabled) return;

  try {
    if (isNative()) {
      // Heavy impact followed by success notification for that "chunky" feel
      await Haptics.impact({ style: ImpactStyle.Heavy });
      setTimeout(async () => {
        await Haptics.notification({ type: NotificationType.Success });
      }, 50);
    } else if (hasWebVibration()) {
      // Satisfying double-tap pattern with punch
      navigator.vibrate([30, 40, 20, 30, 15]);
    }
  } catch (error) {
    console.warn('Haptics not available:', error);
  }
}

// Preset haptic patterns for common actions
export const hapticPresets = {
  // Task/todo interactions - EXTRA SATISFYING
  taskComplete: taskCompleteSatisfying,
  taskUncomplete: () => impact('light'),

  // Button interactions
  buttonPress: () => impact('light'),
  buttonPressHeavy: () => impact('medium'),

  // Toggle/switch
  toggleOn: () => selection(),
  toggleOff: () => selection(),

  // Navigation
  tabChange: () => selection(),
  pageTransition: () => impact('light'),

  // Achievements/celebrations
  levelUp: () => notification('success'),
  achievement: () => notification('success'),
  streakMilestone: () => notification('success'),

  // Errors/warnings
  error: () => notification('error'),
  warning: () => notification('warning'),

  // Special
  refresh: () => impact('medium'),
  delete: () => impact('heavy'),
  longPress: () => impact('heavy'),
};

// Export as service object
export const haptics = {
  impact,
  notification,
  selection,
  vibrate,
  taskCompleteSatisfying,
  setEnabled: setHapticsEnabled,
  isEnabled: getHapticsEnabled,
  presets: hapticPresets,
};

export default haptics;
