/**
 * Notification Store
 * Manages notifications for achievements, XP gains, level ups, and other feedback
 * Provides a centralized queue for all gamification notifications
 *
 * QUEUE SYSTEM:
 * - All notifications go into a master queue
 * - Only one notification shows at a time
 * - Priority: levelUp > achievement > streak > xp > brokenStreak
 */

import { create } from 'zustand';

// Track shown achievement IDs to prevent duplicates
const shownAchievementIds = new Set();
const recentXPGains = []; // Track recent XP gains to merge quick successive gains

// Notification priority (higher = more important, shows first)
const NOTIFICATION_PRIORITY = {
  levelUp: 100,
  achievement: 80,
  streak: 60,
  xp: 40,
  brokenStreak: 20,
};

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
  // Master queue for all notifications (sorted by priority)
  masterQueue: [],

  // Currently showing notification type (only one at a time)
  activeNotificationType: null,

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

    // Add to master queue (will show when it's this notification's turn)
    get()._addToMasterQueue('achievement', notificationData);
  },

  // Show next achievement in queue (legacy - now handled by master queue)
  showNextAchievement: () => {
    // No longer used - master queue handles this
  },

  // Dismiss current achievement notification
  dismissAchievement: () => {
    set({ currentAchievement: null });
    get()._onNotificationDismissed();
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

    // Add to master queue
    get()._addToMasterQueue('xp', notification);
  },

  // Show next XP notification in queue (legacy - now handled by master queue)
  showNextXP: () => {
    // No longer used - master queue handles this
  },

  // Dismiss current XP notification
  dismissXP: () => {
    set({ currentXP: null });
    get()._onNotificationDismissed();
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

    const notificationData = {
      ...levelData,
      timestamp,
    };

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

    // Add to master queue (high priority - shows first)
    get()._addToMasterQueue('levelUp', notificationData);
  },

  // Dismiss level up notification
  dismissLevelUp: () => {
    set({ levelUpNotification: null });
    get()._onNotificationDismissed();
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

    // Add to master queue
    get()._addToMasterQueue('streak', streakData);
  },

  // Dismiss streak celebration
  dismissStreakCelebration: () => {
    set({ streakCelebration: null });
    get()._onNotificationDismissed();
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

    // Add to master queue (lowest priority)
    get()._addToMasterQueue('brokenStreak', notification);
  },

  // Dismiss broken streak notification
  dismissBrokenStreak: () => {
    set({ brokenStreakNotification: null });
    get()._onNotificationDismissed();
  },

  // ==========================================
  // MASTER QUEUE MANAGEMENT
  // ==========================================

  // Add notification to master queue with priority
  _addToMasterQueue: (type, data) => {
    const priority = NOTIFICATION_PRIORITY[type] || 0;
    const item = { type, data, priority, timestamp: Date.now() };

    set(state => {
      const newQueue = [...state.masterQueue, item]
        .sort((a, b) => b.priority - a.priority || a.timestamp - b.timestamp);
      return { masterQueue: newQueue };
    });

    // If nothing is currently showing, process the queue
    if (!get().activeNotificationType) {
      get()._processNextInQueue();
    }
  },

  // Process the next notification in the master queue
  _processNextInQueue: () => {
    const { masterQueue, activeNotificationType } = get();

    // Don't process if something is already showing
    if (activeNotificationType) return;

    if (masterQueue.length === 0) return;

    const [next, ...rest] = masterQueue;
    set({ masterQueue: rest, activeNotificationType: next.type });

    // Show the notification based on type
    switch (next.type) {
      case 'levelUp':
        set({ levelUpNotification: next.data });
        break;
      case 'achievement':
        set({ currentAchievement: next.data });
        break;
      case 'streak':
        set({ streakCelebration: next.data });
        break;
      case 'xp':
        set({ currentXP: next.data });
        break;
      case 'brokenStreak':
        set({ brokenStreakNotification: next.data });
        break;
    }
  },

  // Called when a notification is dismissed - process next in queue
  _onNotificationDismissed: () => {
    set({ activeNotificationType: null });
    // Small delay before showing next to allow exit animation
    setTimeout(() => {
      get()._processNextInQueue();
    }, 300);
  },

  // ==========================================
  // UTILITY
  // ==========================================

  // Clear all notifications
  clearAll: () => {
    set({
      masterQueue: [],
      activeNotificationType: null,
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
