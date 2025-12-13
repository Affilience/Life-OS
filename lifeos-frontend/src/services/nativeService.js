/**
 * Native Service - Wrapper for Capacitor native features
 *
 * This service provides a unified API for accessing iOS native features
 * when running in Capacitor, with graceful fallbacks for web.
 */

import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Keyboard } from '@capacitor/keyboard';
import { LocalNotifications } from '@capacitor/local-notifications';
import { PushNotifications } from '@capacitor/push-notifications';
import { Preferences } from '@capacitor/preferences';
import { Browser } from '@capacitor/browser';
import { Share } from '@capacitor/share';

// Check if running as native app
export const isNative = Capacitor.isNativePlatform();
export const platform = Capacitor.getPlatform(); // 'ios', 'android', or 'web'
export const isIOS = platform === 'ios';
export const isAndroid = platform === 'android';
export const isWeb = platform === 'web';

/**
 * Haptic Feedback
 */
export const haptics = {
  // Light tap - for selections, toggles
  light: async () => {
    if (!isNative) return;
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch (e) {
      console.warn('Haptics not available:', e);
    }
  },

  // Medium tap - for button presses
  medium: async () => {
    if (!isNative) return;
    try {
      await Haptics.impact({ style: ImpactStyle.Medium });
    } catch (e) {
      console.warn('Haptics not available:', e);
    }
  },

  // Heavy tap - for important actions
  heavy: async () => {
    if (!isNative) return;
    try {
      await Haptics.impact({ style: ImpactStyle.Heavy });
    } catch (e) {
      console.warn('Haptics not available:', e);
    }
  },

  // Success notification
  success: async () => {
    if (!isNative) return;
    try {
      await Haptics.notification({ type: NotificationType.Success });
    } catch (e) {
      console.warn('Haptics not available:', e);
    }
  },

  // Warning notification
  warning: async () => {
    if (!isNative) return;
    try {
      await Haptics.notification({ type: NotificationType.Warning });
    } catch (e) {
      console.warn('Haptics not available:', e);
    }
  },

  // Error notification
  error: async () => {
    if (!isNative) return;
    try {
      await Haptics.notification({ type: NotificationType.Error });
    } catch (e) {
      console.warn('Haptics not available:', e);
    }
  },

  // Selection changed
  selection: async () => {
    if (!isNative) return;
    try {
      await Haptics.selectionChanged();
    } catch (e) {
      console.warn('Haptics not available:', e);
    }
  },
};

/**
 * Status Bar Management
 */
export const statusBar = {
  setDark: async () => {
    if (!isNative) return;
    try {
      await StatusBar.setStyle({ style: Style.Dark });
    } catch (e) {
      console.warn('StatusBar not available:', e);
    }
  },

  setLight: async () => {
    if (!isNative) return;
    try {
      await StatusBar.setStyle({ style: Style.Light });
    } catch (e) {
      console.warn('StatusBar not available:', e);
    }
  },

  hide: async () => {
    if (!isNative) return;
    try {
      await StatusBar.hide();
    } catch (e) {
      console.warn('StatusBar not available:', e);
    }
  },

  show: async () => {
    if (!isNative) return;
    try {
      await StatusBar.show();
    } catch (e) {
      console.warn('StatusBar not available:', e);
    }
  },

  setBackgroundColor: async (color) => {
    if (!isNative) return;
    try {
      await StatusBar.setBackgroundColor({ color });
    } catch (e) {
      console.warn('StatusBar not available:', e);
    }
  },
};

/**
 * Splash Screen
 */
export const splashScreen = {
  hide: async () => {
    if (!isNative) return;
    try {
      await SplashScreen.hide();
    } catch (e) {
      console.warn('SplashScreen not available:', e);
    }
  },

  show: async () => {
    if (!isNative) return;
    try {
      await SplashScreen.show({
        autoHide: false,
      });
    } catch (e) {
      console.warn('SplashScreen not available:', e);
    }
  },
};

/**
 * Keyboard Management
 */
export const keyboard = {
  hide: async () => {
    if (!isNative) return;
    try {
      await Keyboard.hide();
    } catch (e) {
      console.warn('Keyboard not available:', e);
    }
  },

  show: async () => {
    if (!isNative) return;
    try {
      await Keyboard.show();
    } catch (e) {
      console.warn('Keyboard not available:', e);
    }
  },

  // Listen for keyboard events
  onShow: (callback) => {
    if (!isNative) return () => {};
    const listener = Keyboard.addListener('keyboardWillShow', callback);
    return () => listener.remove();
  },

  onHide: (callback) => {
    if (!isNative) return () => {};
    const listener = Keyboard.addListener('keyboardWillHide', callback);
    return () => listener.remove();
  },
};

/**
 * Local Notifications
 */
export const localNotifications = {
  // Request permission
  requestPermission: async () => {
    if (!isNative) return { granted: false };
    try {
      const result = await LocalNotifications.requestPermissions();
      return { granted: result.display === 'granted' };
    } catch (e) {
      console.warn('LocalNotifications not available:', e);
      return { granted: false };
    }
  },

  // Schedule a notification
  schedule: async ({ id, title, body, scheduleAt, extra }) => {
    if (!isNative) return;
    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            id: id || Date.now(),
            title,
            body,
            schedule: scheduleAt ? { at: new Date(scheduleAt) } : undefined,
            extra,
          },
        ],
      });
    } catch (e) {
      console.warn('LocalNotifications not available:', e);
    }
  },

  // Cancel a notification
  cancel: async (ids) => {
    if (!isNative) return;
    try {
      await LocalNotifications.cancel({
        notifications: ids.map((id) => ({ id })),
      });
    } catch (e) {
      console.warn('LocalNotifications not available:', e);
    }
  },

  // Cancel all notifications
  cancelAll: async () => {
    if (!isNative) return;
    try {
      const pending = await LocalNotifications.getPending();
      if (pending.notifications.length > 0) {
        await LocalNotifications.cancel({ notifications: pending.notifications });
      }
    } catch (e) {
      console.warn('LocalNotifications not available:', e);
    }
  },

  // Listen for notification taps
  onTap: (callback) => {
    if (!isNative) return () => {};
    const listener = LocalNotifications.addListener(
      'localNotificationActionPerformed',
      callback
    );
    return () => listener.remove();
  },
};

/**
 * Push Notifications
 */
export const pushNotifications = {
  // Request permission and register
  register: async () => {
    if (!isNative) return { token: null };
    try {
      const permission = await PushNotifications.requestPermissions();
      if (permission.receive === 'granted') {
        await PushNotifications.register();
        return new Promise((resolve) => {
          PushNotifications.addListener('registration', (token) => {
            resolve({ token: token.value });
          });
        });
      }
      return { token: null };
    } catch (e) {
      console.warn('PushNotifications not available:', e);
      return { token: null };
    }
  },

  // Listen for push notifications
  onReceived: (callback) => {
    if (!isNative) return () => {};
    const listener = PushNotifications.addListener(
      'pushNotificationReceived',
      callback
    );
    return () => listener.remove();
  },

  onTap: (callback) => {
    if (!isNative) return () => {};
    const listener = PushNotifications.addListener(
      'pushNotificationActionPerformed',
      callback
    );
    return () => listener.remove();
  },
};

/**
 * Secure Storage (Preferences)
 */
export const storage = {
  set: async (key, value) => {
    if (!isNative) {
      localStorage.setItem(key, JSON.stringify(value));
      return;
    }
    try {
      await Preferences.set({ key, value: JSON.stringify(value) });
    } catch (e) {
      console.warn('Preferences not available:', e);
      localStorage.setItem(key, JSON.stringify(value));
    }
  },

  get: async (key) => {
    if (!isNative) {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    }
    try {
      const { value } = await Preferences.get({ key });
      return value ? JSON.parse(value) : null;
    } catch (e) {
      console.warn('Preferences not available:', e);
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    }
  },

  remove: async (key) => {
    if (!isNative) {
      localStorage.removeItem(key);
      return;
    }
    try {
      await Preferences.remove({ key });
    } catch (e) {
      console.warn('Preferences not available:', e);
      localStorage.removeItem(key);
    }
  },

  clear: async () => {
    if (!isNative) {
      localStorage.clear();
      return;
    }
    try {
      await Preferences.clear();
    } catch (e) {
      console.warn('Preferences not available:', e);
      localStorage.clear();
    }
  },
};

/**
 * Browser / External Links
 */
export const browser = {
  open: async (url) => {
    if (!isNative) {
      window.open(url, '_blank');
      return;
    }
    try {
      await Browser.open({ url });
    } catch (e) {
      console.warn('Browser not available:', e);
      window.open(url, '_blank');
    }
  },

  close: async () => {
    if (!isNative) return;
    try {
      await Browser.close();
    } catch (e) {
      console.warn('Browser not available:', e);
    }
  },
};

/**
 * Share
 */
export const share = {
  share: async ({ title, text, url }) => {
    if (!isNative) {
      if (navigator.share) {
        await navigator.share({ title, text, url });
      }
      return;
    }
    try {
      await Share.share({ title, text, url });
    } catch (e) {
      console.warn('Share not available:', e);
    }
  },

  canShare: async () => {
    if (!isNative) {
      return !!navigator.share;
    }
    return true;
  },
};

/**
 * App Lifecycle
 */
export const appLifecycle = {
  // Listen for app state changes
  onStateChange: (callback) => {
    if (!isNative) return () => {};
    const listener = App.addListener('appStateChange', callback);
    return () => listener.remove();
  },

  // Listen for back button (Android)
  onBackButton: (callback) => {
    if (!isNative) return () => {};
    const listener = App.addListener('backButton', callback);
    return () => listener.remove();
  },

  // Get app info
  getInfo: async () => {
    if (!isNative) return null;
    try {
      return await App.getInfo();
    } catch (e) {
      console.warn('App info not available:', e);
      return null;
    }
  },

  // Exit app (Android only)
  exitApp: () => {
    if (!isNative) return;
    App.exitApp();
  },
};

/**
 * Initialize native services
 * Call this in your app's entry point
 */
export const initializeNativeServices = async () => {
  if (!isNative) {
    console.log('Running in web mode');
    return;
  }

  console.log(`Running as native app on ${platform}`);

  // Hide splash screen after a short delay
  setTimeout(() => {
    splashScreen.hide();
  }, 500);

  // Set status bar style
  await statusBar.setDark();
  await statusBar.setBackgroundColor('#0c0a10');

  // Request notification permissions
  await localNotifications.requestPermission();
};

// Default export with all services
export default {
  isNative,
  platform,
  isIOS,
  isAndroid,
  isWeb,
  haptics,
  statusBar,
  splashScreen,
  keyboard,
  localNotifications,
  pushNotifications,
  storage,
  browser,
  share,
  appLifecycle,
  initializeNativeServices,
};
