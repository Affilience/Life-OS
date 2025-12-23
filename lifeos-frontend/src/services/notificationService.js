/**
 * Notification Service
 *
 * Centralizes notification preferences and connects settingsStore to actual
 * notification systems (sounds, haptics, celebrations, toasts, push notifications).
 *
 * This service:
 * - Reads preferences from settingsStore
 * - Controls microInteractions (sounds, haptics, celebrations)
 * - Determines whether to show in-app notifications
 * - Will handle push notifications when implemented
 */

import useSettingsStore from '../stores/settingsStore';
import {
  sounds,
  haptics,
  celebrations,
  setMicroInteractionSettings,
  getMicroInteractionSettings
} from './microInteractions';

// Track initialization state
let isInitialized = false;

/**
 * Initialize notification service
 * Syncs settings from settingsStore to actual notification systems
 */
export function initializeNotificationService() {
  if (isInitialized) return;

  const settings = useSettingsStore.getState().settings;
  syncAllPreferences(settings);

  // Subscribe to settings changes
  // Zustand subscribe takes a listener that receives (state, prevState)
  useSettingsStore.subscribe((state, prevState) => {
    // Check if notifications or feedback settings changed
    const currentNotifications = state.settings?.notifications;
    const prevNotifications = prevState?.settings?.notifications;
    const currentFeedback = state.settings?.feedback;
    const prevFeedback = prevState?.settings?.feedback;

    if (currentNotifications !== prevNotifications || currentFeedback !== prevFeedback) {
      syncAllPreferences(state.settings);
    }
  });

  isInitialized = true;
  console.log('[NotificationService] Initialized');
}

/**
 * Sync all preferences from settings to actual systems
 */
function syncAllPreferences(settings) {
  const notifications = settings?.notifications || {};
  const feedback = settings?.feedback || {};

  // Feedback panel settings take priority if set, otherwise use notifications.soundEnabled
  const soundsEnabled = feedback.soundsEnabled ?? notifications.soundEnabled ?? true;
  const hapticsEnabled = feedback.hapticsEnabled ?? true;
  const celebrationsEnabled = feedback.celebrationsEnabled ?? true;
  const soundVolume = feedback.soundVolume ?? 0.3;

  // Sync to actual systems
  sounds.setEnabled(soundsEnabled);
  sounds.setVolume(soundVolume);
  haptics.setEnabled(hapticsEnabled);
  celebrations.setEnabled(celebrationsEnabled);
}

/**
 * Check if a specific notification type is enabled
 */
export function isNotificationEnabled(type) {
  const settings = useSettingsStore.getState().settings;
  const notifications = settings?.notifications || {};

  // Check quiet hours first
  if (isQuietHours(notifications)) {
    return false;
  }

  switch (type) {
    case 'push':
      return notifications.pushEnabled ?? true;
    case 'sound':
      return notifications.soundEnabled ?? true;
    case 'taskReminder':
      return notifications.taskReminders ?? true;
    case 'habitReminder':
      return notifications.habitReminders ?? true;
    case 'streakAlert':
      return notifications.streakAlerts ?? true;
    case 'achievement':
      return notifications.achievementAlerts ?? true;
    case 'xpToast':
      return notifications.xpToastEnabled ?? true;
    default:
      return true;
  }
}

/**
 * Check if currently in quiet hours
 */
export function isQuietHours(notifications = null) {
  if (!notifications) {
    notifications = useSettingsStore.getState().settings?.notifications || {};
  }

  if (!notifications.quietHoursEnabled) {
    return false;
  }

  const start = notifications.quietHoursStart || '22:00';
  const end = notifications.quietHoursEnd || '08:00';

  const now = new Date();
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  // Handle overnight quiet hours (e.g., 22:00 - 08:00)
  if (start > end) {
    return currentTime >= start || currentTime < end;
  }

  return currentTime >= start && currentTime < end;
}

/**
 * Get XP toast settings
 */
export function getXPToastSettings() {
  const settings = useSettingsStore.getState().settings;
  const notifications = settings?.notifications || {};

  return {
    enabled: notifications.xpToastEnabled ?? true,
    minThreshold: notifications.xpToastMinThreshold ?? 15,
    batchWindow: notifications.xpToastBatchWindow ?? 2000,
  };
}

/**
 * Should show XP toast for a given amount
 */
export function shouldShowXPToast(amount) {
  const { enabled, minThreshold } = getXPToastSettings();
  return enabled && amount >= minThreshold;
}

/**
 * Should show achievement notification
 */
export function shouldShowAchievementNotification() {
  return isNotificationEnabled('achievement');
}

/**
 * Should show streak alert
 */
export function shouldShowStreakAlert() {
  return isNotificationEnabled('streakAlert');
}

/**
 * Play sound if enabled
 */
export function playSound(soundName, ...args) {
  if (!isNotificationEnabled('sound')) return;

  const soundFn = sounds[soundName];
  if (typeof soundFn === 'function') {
    soundFn(...args);
  }
}

/**
 * Trigger haptic if enabled
 */
export function triggerHaptic(type, ...args) {
  // Haptics always enabled for now (no toggle in settings yet)
  const hapticFn = haptics[type];
  if (typeof hapticFn === 'function') {
    hapticFn(...args);
  }
}

/**
 * Show celebration if enabled
 */
export function showCelebration(type, ...args) {
  // Celebrations always enabled for now (no toggle in settings yet)
  const celebrationFn = celebrations[type];
  if (typeof celebrationFn === 'function') {
    celebrationFn(...args);
  }
}

/**
 * Update a specific notification setting
 * This updates settingsStore which will trigger sync
 */
export function updateNotificationSetting(key, value) {
  const store = useSettingsStore.getState();
  store.updateSettings('notifications', { [key]: value });
}

/**
 * Toggle a notification setting
 */
export function toggleNotificationSetting(key) {
  const settings = useSettingsStore.getState().settings;
  const currentValue = settings?.notifications?.[key] ?? true;
  updateNotificationSetting(key, !currentValue);
}

/**
 * Get all notification settings
 */
export function getNotificationSettings() {
  const settings = useSettingsStore.getState().settings;
  return settings?.notifications || {};
}

/**
 * Check if push notifications are supported and get permission status
 */
export function getPushNotificationStatus() {
  if (!('Notification' in window)) {
    return { supported: false, permission: 'unsupported' };
  }

  return {
    supported: true,
    permission: Notification.permission,
  };
}

/**
 * Request push notification permission
 */
export async function requestPushPermission() {
  if (!('Notification' in window)) {
    return { granted: false, reason: 'unsupported' };
  }

  if (Notification.permission === 'granted') {
    return { granted: true };
  }

  if (Notification.permission === 'denied') {
    return { granted: false, reason: 'denied' };
  }

  const permission = await Notification.requestPermission();
  return { granted: permission === 'granted', reason: permission };
}

// Export as default object for convenience
const notificationService = {
  initialize: initializeNotificationService,
  isEnabled: isNotificationEnabled,
  isQuietHours,
  getXPToastSettings,
  shouldShowXPToast,
  shouldShowAchievementNotification,
  shouldShowStreakAlert,
  playSound,
  triggerHaptic,
  showCelebration,
  updateSetting: updateNotificationSetting,
  toggleSetting: toggleNotificationSetting,
  getSettings: getNotificationSettings,
  getPushStatus: getPushNotificationStatus,
  requestPushPermission,
};

export default notificationService;
