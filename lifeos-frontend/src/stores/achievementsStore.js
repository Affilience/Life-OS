/**
 * Achievements Store
 * Manages badges, achievements, and unlockable rewards
 * Integrates with questsStore, dailyTasksStore, and other LifeOS modules
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Achievement Categories
export const ACHIEVEMENT_CATEGORIES = {
  quests: { id: 'quests', name: 'Quests', icon: '🎯', color: 'from-purple-500 to-pink-500' },
  productivity: { id: 'productivity', name: 'Productivity', icon: '⚡', color: 'from-yellow-500 to-orange-500' },
  health: { id: 'health', name: 'Health & Fitness', icon: '💪', color: 'from-green-500 to-emerald-500' },
  knowledge: { id: 'knowledge', name: 'Knowledge', icon: '📚', color: 'from-blue-500 to-cyan-500' },
  financial: { id: 'financial', name: 'Financial', icon: '💰', color: 'from-emerald-500 to-teal-500' },
  journal: { id: 'journal', name: 'Journal', icon: '✍️', color: 'from-amber-500 to-orange-500' },
  streaks: { id: 'streaks', name: 'Streaks', icon: '🔥', color: 'from-orange-500 to-red-500' },
  special: { id: 'special', name: 'Special', icon: '✨', color: 'from-violet-500 to-purple-500' },
  milestones: { id: 'milestones', name: 'Milestones', icon: '🏆', color: 'from-yellow-400 to-amber-500' },
};

// Achievement Rarity Levels
export const ACHIEVEMENT_RARITY = {
  common: { label: 'Common', color: 'from-gray-400 to-gray-500', xpMultiplier: 1 },
  uncommon: { label: 'Uncommon', color: 'from-green-400 to-emerald-500', xpMultiplier: 1.5 },
  rare: { label: 'Rare', color: 'from-blue-400 to-cyan-500', xpMultiplier: 2 },
  epic: { label: 'Epic', color: 'from-purple-400 to-pink-500', xpMultiplier: 3 },
  legendary: { label: 'Legendary', color: 'from-yellow-400 to-orange-500', xpMultiplier: 5 },
};

// Pre-defined Achievement Templates
export const ACHIEVEMENT_TEMPLATES = [
  // Quest Achievements
  {
    id: 'first_quest',
    title: 'First Steps',
    description: 'Complete your first quest',
    category: 'quests',
    rarity: 'common',
    icon: '🎯',
    requirement: { type: 'quests_completed', count: 1 },
    xpReward: 50,
    creditsReward: 25,
  },
  {
    id: 'quest_novice',
    title: 'Quest Novice',
    description: 'Complete 10 quests',
    category: 'quests',
    rarity: 'common',
    icon: '🎯',
    requirement: { type: 'quests_completed', count: 10 },
    xpReward: 150,
    creditsReward: 75,
  },
  {
    id: 'quest_apprentice',
    title: 'Quest Apprentice',
    description: 'Complete 50 quests',
    category: 'quests',
    rarity: 'uncommon',
    icon: '🎯',
    requirement: { type: 'quests_completed', count: 50 },
    xpReward: 500,
    creditsReward: 250,
  },
  {
    id: 'quest_master',
    title: 'Quest Master',
    description: 'Complete 200 quests',
    category: 'quests',
    rarity: 'rare',
    icon: '🎯',
    requirement: { type: 'quests_completed', count: 200 },
    xpReward: 1500,
    creditsReward: 750,
  },
  {
    id: 'quest_legend',
    title: 'Quest Legend',
    description: 'Complete 500 quests',
    category: 'quests',
    rarity: 'epic',
    icon: '👑',
    requirement: { type: 'quests_completed', count: 500 },
    xpReward: 3000,
    creditsReward: 1500,
  },
  {
    id: 'weekly_warrior',
    title: 'Weekly Warrior',
    description: 'Complete all weekly quests in a single week',
    category: 'quests',
    rarity: 'rare',
    icon: '📅',
    requirement: { type: 'weekly_perfect', count: 1 },
    xpReward: 1000,
    creditsReward: 500,
  },
  {
    id: 'monthly_champion',
    title: 'Monthly Champion',
    description: 'Complete all monthly epic quests',
    category: 'quests',
    rarity: 'epic',
    icon: '🏆',
    requirement: { type: 'monthly_perfect', count: 1 },
    xpReward: 3000,
    creditsReward: 1500,
  },
  {
    id: 'chain_breaker',
    title: 'Chain Breaker',
    description: 'Complete your first quest chain',
    category: 'quests',
    rarity: 'rare',
    icon: '⛓️',
    requirement: { type: 'chains_completed', count: 1 },
    xpReward: 1000,
    creditsReward: 500,
  },
  {
    id: 'boss_slayer',
    title: 'Boss Slayer',
    description: 'Defeat your first boss',
    category: 'quests',
    rarity: 'rare',
    icon: '🐉',
    requirement: { type: 'bosses_defeated', count: 1 },
    xpReward: 1000,
    creditsReward: 500,
  },
  {
    id: 'dragon_hunter',
    title: 'Dragon Hunter',
    description: 'Defeat 5 bosses',
    category: 'quests',
    rarity: 'epic',
    icon: '🗡️',
    requirement: { type: 'bosses_defeated', count: 5 },
    xpReward: 3000,
    creditsReward: 1500,
  },

  // Streak Achievements
  {
    id: 'streak_starter',
    title: 'Streak Starter',
    description: 'Reach a 3-day streak',
    category: 'streaks',
    rarity: 'common',
    icon: '🔥',
    requirement: { type: 'streak_days', count: 3 },
    xpReward: 50,
    creditsReward: 25,
  },
  {
    id: 'one_week',
    title: 'One Week Wonder',
    description: 'Reach a 7-day streak',
    category: 'streaks',
    rarity: 'common',
    icon: '🔥',
    requirement: { type: 'streak_days', count: 7 },
    xpReward: 150,
    creditsReward: 75,
  },
  {
    id: 'two_weeks',
    title: 'Fortnight Force',
    description: 'Reach a 14-day streak',
    category: 'streaks',
    rarity: 'uncommon',
    icon: '🔥',
    requirement: { type: 'streak_days', count: 14 },
    xpReward: 350,
    creditsReward: 175,
  },
  {
    id: 'one_month',
    title: 'Monthly Master',
    description: 'Reach a 30-day streak',
    category: 'streaks',
    rarity: 'rare',
    icon: '🔥',
    requirement: { type: 'streak_days', count: 30 },
    xpReward: 1000,
    creditsReward: 500,
  },
  {
    id: 'streak_legend',
    title: 'Unstoppable',
    description: 'Reach a 100-day streak',
    category: 'streaks',
    rarity: 'legendary',
    icon: '💎',
    requirement: { type: 'streak_days', count: 100 },
    xpReward: 5000,
    creditsReward: 2500,
  },

  // Productivity Achievements
  {
    id: 'deep_work_1',
    title: 'Deep Focus',
    description: 'Log your first hour of deep work',
    category: 'productivity',
    rarity: 'common',
    icon: '🎯',
    requirement: { type: 'deep_work_hours', count: 1 },
    xpReward: 50,
    creditsReward: 25,
  },
  {
    id: 'deep_work_10',
    title: 'Focus Champion',
    description: 'Log 10 hours of deep work',
    category: 'productivity',
    rarity: 'uncommon',
    icon: '⚡',
    requirement: { type: 'deep_work_hours', count: 10 },
    xpReward: 300,
    creditsReward: 150,
  },
  {
    id: 'deep_work_100',
    title: 'Deep Work Master',
    description: 'Log 100 hours of deep work',
    category: 'productivity',
    rarity: 'rare',
    icon: '🧠',
    requirement: { type: 'deep_work_hours', count: 100 },
    xpReward: 1500,
    creditsReward: 750,
  },
  {
    id: 'task_slayer',
    title: 'Task Slayer',
    description: 'Complete 100 tasks',
    category: 'productivity',
    rarity: 'uncommon',
    icon: '✅',
    requirement: { type: 'tasks_completed', count: 100 },
    xpReward: 500,
    creditsReward: 250,
  },

  // Health Achievements
  {
    id: 'first_workout',
    title: 'First Sweat',
    description: 'Complete your first workout',
    category: 'health',
    rarity: 'common',
    icon: '💪',
    requirement: { type: 'workouts', count: 1 },
    xpReward: 50,
    creditsReward: 25,
  },
  {
    id: 'workout_10',
    title: 'Gym Rookie',
    description: 'Complete 10 workouts',
    category: 'health',
    rarity: 'common',
    icon: '💪',
    requirement: { type: 'workouts', count: 10 },
    xpReward: 200,
    creditsReward: 100,
  },
  {
    id: 'workout_50',
    title: 'Fitness Enthusiast',
    description: 'Complete 50 workouts',
    category: 'health',
    rarity: 'uncommon',
    icon: '🏋️',
    requirement: { type: 'workouts', count: 50 },
    xpReward: 750,
    creditsReward: 375,
  },
  {
    id: 'workout_100',
    title: 'Iron Will',
    description: 'Complete 100 workouts',
    category: 'health',
    rarity: 'rare',
    icon: '🥇',
    requirement: { type: 'workouts', count: 100 },
    xpReward: 2000,
    creditsReward: 1000,
  },

  // Knowledge Achievements
  {
    id: 'first_book',
    title: 'Page Turner',
    description: 'Finish your first book',
    category: 'knowledge',
    rarity: 'common',
    icon: '📖',
    requirement: { type: 'books_completed', count: 1 },
    xpReward: 100,
    creditsReward: 50,
  },
  {
    id: 'bookworm',
    title: 'Bookworm',
    description: 'Finish 10 books',
    category: 'knowledge',
    rarity: 'uncommon',
    icon: '📚',
    requirement: { type: 'books_completed', count: 10 },
    xpReward: 750,
    creditsReward: 375,
  },
  {
    id: 'reading_10h',
    title: 'Avid Reader',
    description: 'Read for 10 hours total',
    category: 'knowledge',
    rarity: 'common',
    icon: '📕',
    requirement: { type: 'reading_hours', count: 10 },
    xpReward: 200,
    creditsReward: 100,
  },

  // Financial Achievements
  {
    id: 'budget_master',
    title: 'Budget Master',
    description: 'Stay under budget for a full month',
    category: 'financial',
    rarity: 'rare',
    icon: '💰',
    requirement: { type: 'under_budget_months', count: 1 },
    xpReward: 1000,
    creditsReward: 500,
  },
  {
    id: 'expense_tracker',
    title: 'Expense Tracker',
    description: 'Log 100 expenses',
    category: 'financial',
    rarity: 'uncommon',
    icon: '💳',
    requirement: { type: 'expenses_logged', count: 100 },
    xpReward: 500,
    creditsReward: 250,
  },
  {
    id: 'saver',
    title: 'Smart Saver',
    description: 'Create your first sinking fund',
    category: 'financial',
    rarity: 'common',
    icon: '🐷',
    requirement: { type: 'sinking_funds_created', count: 1 },
    xpReward: 100,
    creditsReward: 50,
  },

  // Journal Achievements
  {
    id: 'first_entry',
    title: 'Dear Diary',
    description: 'Write your first journal entry',
    category: 'journal',
    rarity: 'common',
    icon: '✍️',
    requirement: { type: 'journal_entries', count: 1 },
    xpReward: 50,
    creditsReward: 25,
  },
  {
    id: 'journal_10',
    title: 'Reflector',
    description: 'Write 10 journal entries',
    category: 'journal',
    rarity: 'common',
    icon: '📝',
    requirement: { type: 'journal_entries', count: 10 },
    xpReward: 200,
    creditsReward: 100,
  },
  {
    id: 'journal_50',
    title: 'Chronicler',
    description: 'Write 50 journal entries',
    category: 'journal',
    rarity: 'uncommon',
    icon: '📔',
    requirement: { type: 'journal_entries', count: 50 },
    xpReward: 750,
    creditsReward: 375,
  },

  // Milestone Achievements
  {
    id: 'level_10',
    title: 'Rising Star',
    description: 'Reach level 10',
    category: 'milestones',
    rarity: 'common',
    icon: '⭐',
    requirement: { type: 'level', count: 10 },
    xpReward: 500,
    creditsReward: 250,
  },
  {
    id: 'level_25',
    title: 'Champion',
    description: 'Reach level 25',
    category: 'milestones',
    rarity: 'rare',
    icon: '🏅',
    requirement: { type: 'level', count: 25 },
    xpReward: 1500,
    creditsReward: 750,
  },
  {
    id: 'level_50',
    title: 'Legend',
    description: 'Reach level 50',
    category: 'milestones',
    rarity: 'epic',
    icon: '👑',
    requirement: { type: 'level', count: 50 },
    xpReward: 5000,
    creditsReward: 2500,
  },
  {
    id: 'xp_1000',
    title: 'XP Hunter',
    description: 'Earn 1,000 total XP',
    category: 'milestones',
    rarity: 'common',
    icon: '✨',
    requirement: { type: 'total_xp', count: 1000 },
    xpReward: 200,
    creditsReward: 100,
  },
  {
    id: 'xp_10000',
    title: 'XP Collector',
    description: 'Earn 10,000 total XP',
    category: 'milestones',
    rarity: 'uncommon',
    icon: '💫',
    requirement: { type: 'total_xp', count: 10000 },
    xpReward: 1000,
    creditsReward: 500,
  },

  // Special Achievements
  {
    id: 'night_owl',
    title: 'Night Owl',
    description: 'Complete a quest after midnight',
    category: 'special',
    rarity: 'uncommon',
    icon: '🦉',
    requirement: { type: 'special_night_owl', count: 1 },
    xpReward: 300,
    creditsReward: 150,
  },
  {
    id: 'early_bird',
    title: 'Early Bird',
    description: 'Complete a quest before 6am',
    category: 'special',
    rarity: 'uncommon',
    icon: '🌅',
    requirement: { type: 'special_early_bird', count: 1 },
    xpReward: 300,
    creditsReward: 150,
  },
  {
    id: 'perfectionist',
    title: 'Perfectionist',
    description: 'Complete all daily quests 7 days in a row',
    category: 'special',
    rarity: 'epic',
    icon: '💎',
    requirement: { type: 'perfect_days', count: 7 },
    xpReward: 2000,
    creditsReward: 1000,
  },
  {
    id: 'life_optimizer',
    title: 'Life Optimizer',
    description: 'Use all 5 core modules in a single day',
    category: 'special',
    rarity: 'rare',
    icon: '🌟',
    requirement: { type: 'all_modules_day', count: 1 },
    xpReward: 1000,
    creditsReward: 500,
  },
];

const useAchievementsStore = create(
  persist(
    (set, get) => ({
      // State
      unlockedAchievements: [], // Array of { achievementId, unlockedAt, xpEarned, creditsEarned }
      achievementProgress: {}, // { achievementId: currentProgress }
      totalXPFromAchievements: 0,
      totalCreditsFromAchievements: 0,

      // Stats tracking (updated by other modules)
      stats: {
        questsCompleted: 0,
        weeklyPerfect: 0,
        monthlyPerfect: 0,
        chainsCompleted: 0,
        bossesDefeated: 0,
        streakDays: 0,
        deepWorkHours: 0,
        tasksCompleted: 0,
        workouts: 0,
        booksCompleted: 0,
        readingHours: 0,
        underBudgetMonths: 0,
        expensesLogged: 0,
        sinkingFundsCreated: 0,
        journalEntries: 0,
        level: 1,
        totalXP: 0,
        perfectDays: 0,
        allModulesDay: 0,
        specialNightOwl: 0,
        specialEarlyBird: 0,
      },

      // ============================================================
      // ACHIEVEMENT METHODS
      // ============================================================

      // Check and unlock achievements based on current stats
      checkAchievements: () => {
        const { stats, unlockedAchievements } = get();
        const unlockedIds = new Set(unlockedAchievements.map(a => a.achievementId));
        const newUnlocks = [];

        ACHIEVEMENT_TEMPLATES.forEach(achievement => {
          if (unlockedIds.has(achievement.id)) return; // Already unlocked

          const { type, count } = achievement.requirement;
          let currentProgress = 0;

          // Map requirement type to stat
          switch (type) {
            case 'quests_completed': currentProgress = stats.questsCompleted; break;
            case 'weekly_perfect': currentProgress = stats.weeklyPerfect; break;
            case 'monthly_perfect': currentProgress = stats.monthlyPerfect; break;
            case 'chains_completed': currentProgress = stats.chainsCompleted; break;
            case 'bosses_defeated': currentProgress = stats.bossesDefeated; break;
            case 'streak_days': currentProgress = stats.streakDays; break;
            case 'deep_work_hours': currentProgress = stats.deepWorkHours; break;
            case 'tasks_completed': currentProgress = stats.tasksCompleted; break;
            case 'workouts': currentProgress = stats.workouts; break;
            case 'books_completed': currentProgress = stats.booksCompleted; break;
            case 'reading_hours': currentProgress = stats.readingHours; break;
            case 'under_budget_months': currentProgress = stats.underBudgetMonths; break;
            case 'expenses_logged': currentProgress = stats.expensesLogged; break;
            case 'sinking_funds_created': currentProgress = stats.sinkingFundsCreated; break;
            case 'journal_entries': currentProgress = stats.journalEntries; break;
            case 'level': currentProgress = stats.level; break;
            case 'total_xp': currentProgress = stats.totalXP; break;
            case 'perfect_days': currentProgress = stats.perfectDays; break;
            case 'all_modules_day': currentProgress = stats.allModulesDay; break;
            case 'special_night_owl': currentProgress = stats.specialNightOwl; break;
            case 'special_early_bird': currentProgress = stats.specialEarlyBird; break;
            default: currentProgress = 0;
          }

          // Update progress tracking
          set(state => ({
            achievementProgress: {
              ...state.achievementProgress,
              [achievement.id]: currentProgress,
            }
          }));

          // Check if unlocked
          if (currentProgress >= count) {
            newUnlocks.push(achievement);
          }
        });

        // Process new unlocks
        if (newUnlocks.length > 0) {
          set(state => ({
            unlockedAchievements: [
              ...state.unlockedAchievements,
              ...newUnlocks.map(a => ({
                achievementId: a.id,
                unlockedAt: new Date().toISOString(),
                xpEarned: a.xpReward,
                creditsEarned: a.creditsReward,
              })),
            ],
            totalXPFromAchievements: state.totalXPFromAchievements +
              newUnlocks.reduce((sum, a) => sum + a.xpReward, 0),
            totalCreditsFromAchievements: state.totalCreditsFromAchievements +
              newUnlocks.reduce((sum, a) => sum + a.creditsReward, 0),
          }));
        }

        return newUnlocks;
      },

      // Update a specific stat and check achievements
      updateStat: (statName, value) => {
        set(state => ({
          stats: {
            ...state.stats,
            [statName]: value,
          }
        }));

        // Check for new achievement unlocks
        return get().checkAchievements();
      },

      // Increment a stat by a value
      incrementStat: (statName, amount = 1) => {
        const { stats } = get();
        const newValue = (stats[statName] || 0) + amount;
        return get().updateStat(statName, newValue);
      },

      // Get all achievements with their status
      getAllAchievements: () => {
        const { unlockedAchievements, achievementProgress } = get();
        const unlockedMap = new Map(
          unlockedAchievements.map(a => [a.achievementId, a])
        );

        return ACHIEVEMENT_TEMPLATES.map(template => {
          const unlocked = unlockedMap.get(template.id);
          const progress = achievementProgress[template.id] || 0;
          const target = template.requirement.count;

          return {
            ...template,
            unlocked: !!unlocked,
            unlockedAt: unlocked?.unlockedAt || null,
            progress,
            target,
            percentComplete: Math.min((progress / target) * 100, 100),
            category: ACHIEVEMENT_CATEGORIES[template.category],
            rarityData: ACHIEVEMENT_RARITY[template.rarity],
          };
        });
      },

      // Get achievements by category
      getAchievementsByCategory: (categoryId) => {
        return get().getAllAchievements().filter(a =>
          categoryId === 'all' || a.category.id === categoryId
        );
      },

      // Get unlocked achievements
      getUnlockedAchievements: () => {
        return get().getAllAchievements().filter(a => a.unlocked);
      },

      // Get locked achievements
      getLockedAchievements: () => {
        return get().getAllAchievements().filter(a => !a.unlocked);
      },

      // Get achievement stats summary
      getAchievementSummary: () => {
        const all = get().getAllAchievements();
        const unlocked = all.filter(a => a.unlocked);

        return {
          total: all.length,
          unlocked: unlocked.length,
          locked: all.length - unlocked.length,
          percentComplete: Math.round((unlocked.length / all.length) * 100),
          totalXPEarned: get().totalXPFromAchievements,
          totalCreditsEarned: get().totalCreditsFromAchievements,
          byRarity: {
            common: unlocked.filter(a => a.rarity === 'common').length,
            uncommon: unlocked.filter(a => a.rarity === 'uncommon').length,
            rare: unlocked.filter(a => a.rarity === 'rare').length,
            epic: unlocked.filter(a => a.rarity === 'epic').length,
            legendary: unlocked.filter(a => a.rarity === 'legendary').length,
          },
        };
      },

      // Get recently unlocked achievements
      getRecentUnlocks: (limit = 5) => {
        const { unlockedAchievements } = get();
        const sorted = [...unlockedAchievements].sort(
          (a, b) => new Date(b.unlockedAt) - new Date(a.unlockedAt)
        );

        return sorted.slice(0, limit).map(unlock => {
          const template = ACHIEVEMENT_TEMPLATES.find(t => t.id === unlock.achievementId);
          return {
            ...template,
            ...unlock,
            category: ACHIEVEMENT_CATEGORIES[template.category],
            rarityData: ACHIEVEMENT_RARITY[template.rarity],
          };
        });
      },

      // Get next achievements close to unlocking
      getNextAchievements: (limit = 5) => {
        const locked = get().getLockedAchievements();
        const sorted = locked.sort((a, b) => b.percentComplete - a.percentComplete);
        return sorted.slice(0, limit);
      },
    }),
    {
      name: 'achievements-storage',
      partialize: (state) => ({
        unlockedAchievements: state.unlockedAchievements,
        achievementProgress: state.achievementProgress,
        stats: state.stats,
        totalXPFromAchievements: state.totalXPFromAchievements,
        totalCreditsFromAchievements: state.totalCreditsFromAchievements,
      }),
    }
  )
);

export default useAchievementsStore;
