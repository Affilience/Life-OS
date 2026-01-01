/**
 * Unlock Notification Store
 * Manages queue of equipment/pet/item unlock notifications
 * Supports multiple unlock types: 'equipment', 'pet'
 */

import { create } from 'zustand';

export const UNLOCK_TYPES = {
  EQUIPMENT: 'equipment',
  PET: 'pet',
};

// Track shown item IDs in this session to prevent duplicates
const shownItemIds = new Set();

export const useUnlockNotificationStore = create((set, get) => ({
  // Queue of pending unlock notifications
  queue: [],

  // Currently displayed notification
  current: null,

  // Add an unlock notification - routes to main notification store for proper queueing
  // item should include: { ...itemData, type: 'equipment' | 'pet' }
  addUnlock: async (item, type = UNLOCK_TYPES.EQUIPMENT) => {
    // Deduplicate: Don't show the same item twice in one session
    const originalId = item.id;
    if (shownItemIds.has(originalId)) {
      console.log('[UnlockNotification] Skipping duplicate unlock:', originalId);
      return;
    }
    shownItemIds.add(originalId);

    const notificationItem = {
      ...item,
      type: item.type || type,
      id: `${item.id}-${Date.now()}`,
      originalId,
      timestamp: Date.now(),
    };

    // Route to main notification store for proper queueing with achievements
    try {
      const { useNotificationStore } = await import('./notificationStore');
      useNotificationStore.getState().addEquipmentUnlockNotification(notificationItem);
    } catch (err) {
      console.error('[UnlockNotification] Failed to route to main notification store:', err);
      // Fallback to own queue if main store fails
      set(state => ({
        queue: [...state.queue, notificationItem],
      }));
      if (!get().current) {
        get().showNext();
      }
    }
  },

  // Add an equipment unlock
  addEquipmentUnlock: (item) => {
    get().addUnlock(item, UNLOCK_TYPES.EQUIPMENT);
  },

  // Add a pet unlock
  addPetUnlock: (pet) => {
    get().addUnlock(pet, UNLOCK_TYPES.PET);
  },

  // Add multiple unlock notifications
  addUnlocks: (items) => {
    if (!items || items.length === 0) return;

    items.forEach(item => {
      get().addUnlock(item);
    });
  },

  // Show next notification in queue
  showNext: () => {
    const { queue } = get();
    if (queue.length > 0) {
      const [next, ...rest] = queue;
      set({ current: next, queue: rest });
    } else {
      set({ current: null });
    }
  },

  // Dismiss current notification
  dismiss: () => {
    set({ current: null });
    // Small delay before showing next to allow animation
    setTimeout(() => {
      get().showNext();
    }, 300);
  },

  // Clear all notifications
  clearAll: () => {
    set({ queue: [], current: null });
  },
}));

export default useUnlockNotificationStore;
