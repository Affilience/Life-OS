/**
 * useNative - React hook for accessing native features
 *
 * Provides easy access to Capacitor native features with
 * automatic platform detection and graceful fallbacks.
 */

import { useEffect, useCallback, useRef } from 'react';
import {
  isNative,
  platform,
  isIOS,
  haptics,
  keyboard,
  appLifecycle,
  localNotifications,
  browser,
  share,
  storage,
} from '../services/nativeService';

/**
 * Main hook for native features
 */
export function useNative() {
  return {
    isNative,
    platform,
    isIOS,
    isAndroid: platform === 'android',
    isWeb: platform === 'web',
  };
}

/**
 * Hook for haptic feedback
 */
export function useHaptics() {
  const light = useCallback(() => haptics.light(), []);
  const medium = useCallback(() => haptics.medium(), []);
  const heavy = useCallback(() => haptics.heavy(), []);
  const success = useCallback(() => haptics.success(), []);
  const warning = useCallback(() => haptics.warning(), []);
  const error = useCallback(() => haptics.error(), []);
  const selection = useCallback(() => haptics.selection(), []);

  return {
    light,
    medium,
    heavy,
    success,
    warning,
    error,
    selection,
    // Convenience aliases
    tap: light,
    click: medium,
    impact: heavy,
  };
}

/**
 * Hook for keyboard events
 */
export function useKeyboard() {
  const isVisibleRef = useRef(false);

  useEffect(() => {
    if (!isNative) return;

    const unsubscribeShow = keyboard.onShow(() => {
      isVisibleRef.current = true;
    });

    const unsubscribeHide = keyboard.onHide(() => {
      isVisibleRef.current = false;
    });

    return () => {
      unsubscribeShow();
      unsubscribeHide();
    };
  }, []);

  const hide = useCallback(() => keyboard.hide(), []);
  const show = useCallback(() => keyboard.show(), []);

  return {
    hide,
    show,
    isVisible: isVisibleRef.current,
  };
}

/**
 * Hook for app lifecycle events
 */
export function useAppLifecycle({ onForeground, onBackground } = {}) {
  useEffect(() => {
    if (!isNative) return;

    const unsubscribe = appLifecycle.onStateChange(({ isActive }) => {
      if (isActive && onForeground) {
        onForeground();
      } else if (!isActive && onBackground) {
        onBackground();
      }
    });

    return () => unsubscribe();
  }, [onForeground, onBackground]);
}

/**
 * Hook for scheduling notifications
 */
export function useNotifications() {
  const schedule = useCallback(
    async ({ id, title, body, scheduleAt, extra }) => {
      await localNotifications.schedule({ id, title, body, scheduleAt, extra });
    },
    []
  );

  const cancel = useCallback(async (ids) => {
    await localNotifications.cancel(Array.isArray(ids) ? ids : [ids]);
  }, []);

  const cancelAll = useCallback(async () => {
    await localNotifications.cancelAll();
  }, []);

  // Schedule a reminder for a specific time
  const scheduleReminder = useCallback(
    async ({ title, body, at, id }) => {
      await schedule({
        id: id || Date.now(),
        title,
        body,
        scheduleAt: at,
      });
    },
    [schedule]
  );

  // Schedule a daily reminder
  const scheduleDailyReminder = useCallback(
    async ({ title, body, hour, minute, id }) => {
      const now = new Date();
      const scheduleTime = new Date();
      scheduleTime.setHours(hour, minute, 0, 0);

      // If the time has passed today, schedule for tomorrow
      if (scheduleTime <= now) {
        scheduleTime.setDate(scheduleTime.getDate() + 1);
      }

      await schedule({
        id: id || Date.now(),
        title,
        body,
        scheduleAt: scheduleTime.toISOString(),
      });
    },
    [schedule]
  );

  return {
    schedule,
    cancel,
    cancelAll,
    scheduleReminder,
    scheduleDailyReminder,
  };
}

/**
 * Hook for external browser
 */
export function useBrowser() {
  const open = useCallback((url) => browser.open(url), []);
  const close = useCallback(() => browser.close(), []);

  return { open, close };
}

/**
 * Hook for sharing
 */
export function useShare() {
  const shareContent = useCallback(
    async ({ title, text, url }) => {
      await share.share({ title, text, url });
    },
    []
  );

  const canShare = useCallback(async () => {
    return await share.canShare();
  }, []);

  return { share: shareContent, canShare };
}

/**
 * Hook for native storage
 */
export function useNativeStorage(key, defaultValue = null) {
  const get = useCallback(async () => {
    const value = await storage.get(key);
    return value ?? defaultValue;
  }, [key, defaultValue]);

  const set = useCallback(
    async (value) => {
      await storage.set(key, value);
    },
    [key]
  );

  const remove = useCallback(async () => {
    await storage.remove(key);
  }, [key]);

  return { get, set, remove };
}

/**
 * Hook that triggers haptic feedback on button clicks
 */
export function useHapticButton(style = 'medium') {
  const { light, medium, heavy } = useHaptics();

  const onClick = useCallback(
    (handler) => async (e) => {
      // Trigger haptic
      switch (style) {
        case 'light':
          await light();
          break;
        case 'heavy':
          await heavy();
          break;
        default:
          await medium();
      }

      // Call original handler
      if (handler) {
        handler(e);
      }
    },
    [style, light, medium, heavy]
  );

  return onClick;
}

export default useNative;
