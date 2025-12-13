/**
 * Sync Notifications Utility
 *
 * Provides toast notifications for Supabase sync operations.
 * Can be used by stores to show feedback when data syncs.
 */

// Store reference to toast function (set by App.jsx or RealtimeProvider)
let toastFn = null;

/**
 * Initialize the sync notifications with a toast function
 * Call this once from a component that has access to useToast()
 */
export function initSyncNotifications(toast) {
  toastFn = toast;
}

/**
 * Show a sync success notification
 */
export function notifySyncSuccess(module, action = 'synced') {
  if (!toastFn) return;

  toastFn.success(`${module} ${action} successfully`, {
    duration: 2000,
  });
}

/**
 * Show a sync error notification
 */
export function notifySyncError(module, error) {
  if (!toastFn) return;

  const message = error?.message || 'Unknown error';
  toastFn.error(`Failed to sync ${module}: ${message}`, {
    duration: 5000,
    action: {
      label: 'Retry',
      onClick: () => {
        // Could trigger a retry here if we had a callback
        console.log('Retry requested for', module);
      },
    },
  });
}

/**
 * Show a real-time update notification
 */
export function notifyRealtimeUpdate(module, eventType) {
  if (!toastFn) return;

  const actions = {
    INSERT: 'added',
    UPDATE: 'updated',
    DELETE: 'removed',
  };

  const action = actions[eventType] || 'changed';

  toastFn.info(`${module} ${action} from another device`, {
    duration: 3000,
  });
}

/**
 * Show a conflict notification when same data edited on multiple devices
 */
export function notifyConflict(module, resolution) {
  if (!toastFn) return;

  toastFn.warning(`Conflict detected in ${module}. ${resolution}`, {
    duration: 5000,
  });
}

/**
 * Show a loading notification that can be updated
 */
export function notifyLoading(message) {
  if (!toastFn) return null;

  return toastFn.loading(message);
}

/**
 * Promise-based notification for async operations
 */
export async function notifyAsync(promise, options) {
  if (!toastFn) return promise;

  const { loading, success, error } = options;

  return toastFn.promise(promise, {
    loading,
    success,
    error,
  });
}

/**
 * Create a sync wrapper that shows notifications
 * Use this to wrap Supabase operations
 */
export function createSyncOperation(module) {
  return {
    async save(operation, itemName = 'item') {
      if (!toastFn) return operation();

      try {
        const result = await operation();
        // Only show success for explicit saves, not background syncs
        // toastFn.success(`${itemName} saved`, { duration: 2000 });
        return result;
      } catch (error) {
        toastFn.error(`Failed to save ${itemName}: ${error.message}`, {
          duration: 5000,
        });
        throw error;
      }
    },

    async delete(operation, itemName = 'item') {
      if (!toastFn) return operation();

      try {
        const result = await operation();
        toastFn.success(`${itemName} deleted`, { duration: 2000 });
        return result;
      } catch (error) {
        toastFn.error(`Failed to delete ${itemName}: ${error.message}`, {
          duration: 5000,
        });
        throw error;
      }
    },

    async load(operation) {
      if (!toastFn) return operation();

      try {
        return await operation();
      } catch (error) {
        toastFn.error(`Failed to load ${module}: ${error.message}`, {
          duration: 5000,
        });
        throw error;
      }
    },
  };
}

export default {
  init: initSyncNotifications,
  success: notifySyncSuccess,
  error: notifySyncError,
  realtime: notifyRealtimeUpdate,
  conflict: notifyConflict,
  loading: notifyLoading,
  async: notifyAsync,
  createOperation: createSyncOperation,
};
