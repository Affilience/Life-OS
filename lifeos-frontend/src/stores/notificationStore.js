/**
 * Notification Store
 * Manages notifications for achievements, XP gains, level ups, and other feedback
 * Provides a centralized queue for all gamification notifications
 */

import { create } from 'zustand';

// Track shown achievement IDs to prevent duplicates
const shownAchievementIds = new Set();
const recentXPGains = []; // Track recent XP gains to merge quick successive gains

// Helper to add to notification history (imported dynamically to avoid circular deps)
let addToHistory = null;
const getHistoryStore = async () => {
  if (!addToHistory) {
    const { useNotificationHistoryStore } = await import('../components/notifications/NotificationCenter');
    addToHistory = useNotificationHistoryStore.getState().addNotification;
  }
  return addToHistory;
};

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
  addAchievementNotification: async (achievement) => {
    // Deduplicate: Don't show same achievement twice in one session
    if (shownAchievementIds.has(achievement.id)) {
      console.log('[NotificationStore] Skipping duplicate achievement:', achievement.id);
      return;
    }
    shownAchievementIds.add(achievement.id);

    const notificationData = {
      ...achievement,
      timestamp: Date.now(),
      notificationId: `${achievement.id}-${Date.now()}`,
    };

    set(state => ({
      achievementQueue: [...state.achievementQueue, notificationData],
    }));

    // Add to persistent history
    try {
      const addFn = await getHistoryStore();
      if (addFn) {
        addFn({
          id: notificationData.notificationId,
          type: 'achievement',
          title: achievement.title || achievement.name,
          message: achievement.description,
          data: {
            xp: achievement.xp_reward,
            credits: achievement.credit_reward,
            rarity: achievement.rarity,
          },
        });
      }
    } catch (err) {
      console.warn('[NotificationStore] Could not add to history:', err);
    }

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

  // Show level up notification with full data
  showLevelUp: async (data) => {
    const timestamp = Date.now();

    // Handle both old format (newLevel, tierUp) and new format (object)
    const levelData = typeof data === 'object' ? data : {
      newLevel: data,
      oldLevel: data - 1,
      tierUp: false,
    };

    set({
      levelUpNotification: {
        ...levelData,
        timestamp,
      }
    });

    // Add to persistent history
    try {
      const addFn = await getHistoryStore();
      if (addFn) {
        addFn({
          id: `level-${levelData.newLevel}-${timestamp}`,
          type: 'levelUp',
          title: levelData.tierUp ? 'New Tier Unlocked!' : 'Level Up!',
          message: `You reached Level ${levelData.newLevel}${levelData.tierUp ? ' - New abilities unlocked!' : ''}`,
          data: levelData,
        });
      }
    } catch (err) {
      console.warn('[NotificationStore] Could not add level up to history:', err);
    }
  },

  // Dismiss level up notification
  dismissLevelUp: () => {
    set({ levelUpNotification: null });
  },

  // ==========================================
  // STREAK CELEBRATION NOTIFICATIONS
  // ==========================================

  // Streak celebration data
  streakCelebration: null,

  // Show streak extended celebration (Duolingo-style)
  showStreakCelebration: async (data) => {
    const timestamp = Date.now();

    const streakData = {
      previousStreak: data.previousStreak || 0,
      newStreak: data.newStreak || 1,
      streak: data.streak || null, // The streak object with name, module, etc.
      timestamp,
    };

    set({ streakCelebration: streakData });

    // Add to persistent history
    try {
      const addFn = await getHistoryStore();
      if (addFn) {
        const isMilestone = [7, 14, 30, 60, 100, 365].includes(streakData.newStreak);
        addFn({
          id: `streak-${streakData.newStreak}-${timestamp}`,
          type: 'streak',
          title: isMilestone ? `${streakData.newStreak} Day Milestone!` : 'Streak Extended!',
          message: `${streakData.newStreak} day streak${streakData.streak?.name ? ` on ${streakData.streak.name}` : ''}!`,
          data: streakData,
        });
      }
    } catch (err) {
      console.warn('[NotificationStore] Could not add streak to history:', err);
    }
  },

  // Dismiss streak celebration
  dismissStreakCelebration: () => {
    set({ streakCelebration: null });
  },

  // ==========================================
  // STREAK BROKEN NOTIFICATIONS
  // ==========================================

  // Broken streak data
  brokenStreakNotification: null,

  // Show broken streak notification
  showBrokenStreak: (brokenStreaks) => {
    if (!brokenStreaks || brokenStreaks.length === 0) return;

    const timestamp = Date.now();

    // Show the first broken streak (or combine if multiple)
    const notification = brokenStreaks.length === 1
      ? {
          streak: brokenStreaks[0],
          message: `Your ${brokenStreaks[0].name} streak was reset`,
          previousStreak: brokenStreaks[0].previousStreak,
          timestamp,
        }
      : {
          streak: null,
          message: `${brokenStreaks.length} streaks were reset`,
          streaks: brokenStreaks,
          timestamp,
        };

    set({ brokenStreakNotification: notification });
  },

  // Dismiss broken streak notification
  dismissBrokenStreak: () => {
    set({ brokenStreakNotification: null });
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
      streakCelebration: null,
      brokenStreakNotification: null,
    });
  },
}));

export default useNotificationStore;
