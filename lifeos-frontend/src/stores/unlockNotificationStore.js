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

  // Add an unlock notification to the queue
  // item should include: { ...itemData, type: 'equipment' | 'pet' }
  addUnlock: (item, type = UNLOCK_TYPES.EQUIPMENT) => {
    // Deduplicate: Don't show the same item twice in one session
    const originalId = item.id;
    if (shownItemIds.has(originalId)) {
      console.log('[UnlockNotification] Skipping duplicate unlock:', originalId);
      return;
    }
    shownItemIds.add(originalId);

    set(state => ({
      queue: [...state.queue, {
        ...item,
        type: item.type || type, // Use item's type if provided, fallback to parameter
        id: `${item.id}-${Date.now()}`, // Unique ID for animation keys
        originalId, // Keep original for reference
        timestamp: Date.now(),
      }],
    }));

    // If nothing is currently showing, show this one
    if (!get().current) {
      get().showNext();
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
