/**
 * Notification Store
 * Manages notifications for achievements, XP gains, level ups, and other feedback
 * Provides a centralized queue for all gamification notifications
 */

import { create } from 'zustand';

// Track shown achievement IDs to prevent duplicates
const shownAchievementIds = new Set();
const recentXPGains = []; // Track recent XP gains to merge quick successive gains

export const useNotificationStore = create((set, get) => ({
  // Achievement notifications queue
  achievementQueue: [],
  currentAchievement: null,

  // XP gain notifications queue
  xpQueue: [],
  currentXP: null,

  // Level up notification
  levelUpNotification: null,

  // ==========================================
  // ACHIEVEMENT NOTIFICATIONS
  // ==========================================

  // Add an achievement notification
  addAchievementNotification: (achievement) => {
    // Deduplicate: Don't show same achievement twice in one session
    if (shownAchievementIds.has(achievement.id)) {
      console.log('[NotificationStore] Skipping duplicate achievement:', achievement.id);
      return;
    }
    shownAchievementIds.add(achievement.id);

    set(state => ({
      achievementQueue: [...state.achievementQueue, {
        ...achievement,
        timestamp: Date.now(),
        notificationId: `${achievement.id}-${Date.now()}`,
      }],
    }));

    // If nothing is currently showing, show this one
    if (!get().currentAchievement) {
      get().showNextAchievement();
    }
  },

  // Show next achievement in queue
  showNextAchievement: () => {
    const { achievementQueue } = get();
    if (achievementQueue.length > 0) {
      const [next, ...rest] = achievementQueue;
      set({ currentAchievement: next, achievementQueue: rest });
    } else {
      set({ currentAchievement: null });
    }
  },

  // Dismiss current achievement notification
  dismissAchievement: () => {
    set({ currentAchievement: null });
    // Small delay before showing next to allow animation
    setTimeout(() => {
      get().showNextAchievement();
    }, 300);
  },

  // ==========================================
  // XP GAIN NOTIFICATIONS
  // ==========================================

  // Add an XP gain notification
  addXPNotification: (amount, source = 'action', position = null) => {
    if (amount <= 0) return;

    const now = Date.now();

    // Merge XP gains that happen within 500ms of each other
    const recentIndex = recentXPGains.findIndex(g => now - g.timestamp < 500);
    if (recentIndex >= 0) {
      // Merge with recent gain
      recentXPGains[recentIndex].amount += amount;
      recentXPGains[recentIndex].sources.push(source);

      // Update the notification if it's currently showing
      const { currentXP } = get();
      if (currentXP && currentXP.id === recentXPGains[recentIndex].id) {
        set({
          currentXP: {
            ...currentXP,
            amount: recentXPGains[recentIndex].amount,
            sources: recentXPGains[recentIndex].sources,
          }
        });
      }
      return;
    }

    const notification = {
      id: `xp-${now}`,
      amount,
      sources: [source],
      position,
      timestamp: now,
    };

    recentXPGains.push(notification);
    // Clean up old entries
    if (recentXPGains.length > 10) {
      recentXPGains.shift();
    }

    set(state => ({
      xpQueue: [...state.xpQueue, notification],
    }));

    // If nothing is currently showing, show this one
    if (!get().currentXP) {
      get().showNextXP();
    }
  },

  // Show next XP notification in queue
  showNextXP: () => {
    const { xpQueue } = get();
    if (xpQueue.length > 0) {
      const [next, ...rest] = xpQueue;
      set({ currentXP: next, xpQueue: rest });
    } else {
      set({ currentXP: null });
    }
  },

  // Dismiss current XP notification
  dismissXP: () => {
    set({ currentXP: null });
    // Small delay before showing next
    setTimeout(() => {
      get().showNextXP();
    }, 100);
  },

  // ==========================================
  // LEVEL UP NOTIFICATIONS
  // ==========================================

  // Show level up notification
  showLevelUp: (newLevel, tierUp = false) => {
    set({
      levelUpNotification: {
        level: newLevel,
        tierUp,
        timestamp: Date.now(),
      }
    });
  },

  // Dismiss level up notification
  dismissLevelUp: () => {
    set({ levelUpNotification: null });
  },

  // ==========================================
  // UTILITY
  // ==========================================

  // Clear all notifications
  clearAll: () => {
    set({
      achievementQueue: [],
      currentAchievement: null,
      xpQueue: [],
      currentXP: null,
      levelUpNotification: null,
    });
  },
}));

export default useNotificationStore;
