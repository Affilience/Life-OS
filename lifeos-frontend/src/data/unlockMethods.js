/**
 * Comprehensive Unlock Methods System
 * Defines all possible ways items (equipment, pets, etc.) can be unlocked
 */

// All available unlock method types
export const UNLOCK_METHODS = {
  // Progression-based
  DEFAULT: 'default',           // Always available (starter items)
  LEVEL: 'level',               // Reach a specific player level
  PRESTIGE: 'prestige',         // Reach a prestige level

  // Achievement-based
  ACHIEVEMENT: 'achievement',   // Complete a specific achievement
  MILESTONE: 'milestone',       // Reach a milestone (100 tasks, 50 workouts, etc.)

  // Skill Tree / Perk-based
  SKILL_TREE: 'skill_tree',     // Reach level in a skill tree
  PERK: 'perk',                 // Unlock a specific perk

  // Economy-based
  BAZAAR: 'bazaar',             // Purchase with cosmic credits
  CRAFTING: 'crafting',         // Craft from materials (future)

  // Module-based (tied to specific app modules)
  MODULE_PROGRESS: 'module',    // Progress in a specific module
  STREAK: 'streak',             // Maintain a streak in any module

  // Social-based
  PVP: 'pvp',                   // PvP victories or rank
  SOCIAL: 'social',             // Friend activities, guilds
  LEADERBOARD: 'leaderboard',   // Reach leaderboard position

  // Quest/Mission-based
  QUEST: 'quest',               // Complete specific quests
  DAILY_QUEST: 'daily_quest',   // Complete X daily quests
  WEEKLY_QUEST: 'weekly_quest', // Complete X weekly quests

  // Discovery-based
  DISCOVERY: 'discovery',       // Find through exploration
  SECRET: 'secret',             // Hidden unlock conditions

  // Time-based
  SEASONAL: 'seasonal',         // Limited time events
  DAILY_LOGIN: 'daily_login',   // Login streak rewards

  // Special
  NOVA: 'nova',                 // Gift from Nova AI companion
  FOUNDER: 'founder',           // Early adopter rewards
  BETA: 'beta',                 // Beta tester rewards
};

// Module types for module-based unlocks
export const MODULES = {
  PRODUCTIVITY: 'productivity',
  FITNESS: 'fitness',
  HEALTH: 'health',
  KNOWLEDGE: 'knowledge',
  JOURNAL: 'journal',
  CALENDAR: 'calendar',
  FINANCIAL: 'financial',
  PURPOSE: 'purpose',
  SKILLS: 'skills',
  HABITS: 'habits',
};

// Metrics that can be tracked for unlocks
export const UNLOCK_METRICS = {
  // Productivity
  TASKS_COMPLETED: 'tasksCompleted',
  PROJECTS_COMPLETED: 'projectsCompleted',
  FOCUS_SESSIONS: 'focusSessions',
  FOCUS_HOURS: 'focusHours',

  // Fitness
  WORKOUTS_COMPLETED: 'workoutsCompleted',
  WORKOUT_STREAK: 'workoutStreak',
  CALORIES_BURNED: 'caloriesBurned',
  STEPS_WALKED: 'stepsWalked',

  // Health
  MEALS_LOGGED: 'mealsLogged',
  WATER_GLASSES: 'waterGlasses',
  SLEEP_HOURS: 'sleepHours',
  HEALTH_SCORE: 'healthScore',

  // Knowledge
  BOOKS_READ: 'booksRead',
  ARTICLES_READ: 'articlesRead',
  COURSES_COMPLETED: 'coursesCompleted',
  STUDY_HOURS: 'studyHours',

  // Journal
  JOURNAL_ENTRIES: 'journalEntries',
  JOURNAL_STREAK: 'journalStreak',
  REFLECTIONS: 'reflections',
  GRATITUDE_ENTRIES: 'gratitudeEntries',

  // Calendar
  EVENTS_COMPLETED: 'eventsCompleted',
  PLANNING_STREAK: 'planningStreak',
  TIME_BLOCKS_HONORED: 'timeBlocksHonored',
  PLANNING_ACCURACY: 'planningAccuracy',

  // Financial
  BUDGETS_MET: 'budgetsMet',
  SAVINGS_GOALS: 'savingsGoals',
  EXPENSES_TRACKED: 'expensesTracked',

  // Purpose
  GOALS_SET: 'goalsSet',
  GOALS_COMPLETED: 'goalsCompleted',
  VALUES_PRACTICED: 'valuesPracticed',

  // Skills
  SKILLS_PRACTICED: 'skillsPracticed',
  SKILL_MILESTONES: 'skillMilestones',
  PRACTICE_HOURS: 'practiceHours',

  // Habits
  HABITS_COMPLETED: 'habitsCompleted',
  HABIT_STREAKS: 'habitStreaks',
  HABITS_MASTERED: 'habitsMastered',

  // General
  TOTAL_XP: 'totalXP',
  LEVEL: 'level',
  PRESTIGE: 'prestige',
  DAYS_ACTIVE: 'daysActive',
  LONGEST_STREAK: 'longestStreak',

  // Social/PvP
  PVP_WINS: 'pvpWins',
  PVP_RANK: 'pvpRank',
  FRIENDS_ADDED: 'friendsAdded',
  CHALLENGES_WON: 'challengesWon',

  // Quests
  QUESTS_COMPLETED: 'questsCompleted',
  DAILY_QUESTS: 'dailyQuestsCompleted',
  WEEKLY_QUESTS: 'weeklyQuestsCompleted',
};

// Skill trees for skill tree-based unlocks
export const SKILL_TREES = {
  BODY: 'body',           // Physical fitness, health
  MIND: 'mind',           // Knowledge, learning
  CRAFT: 'craft',         // Skills, productivity
  SPIRIT: 'spirit',       // Purpose, journal, mindfulness
  SOCIAL: 'social',       // Social, PvP
};

// Helper to create unlock requirement objects
export const createUnlockRequirement = (method, requirement) => ({
  method,
  requirement,
  isUnlocked: false,
});

// Validation helper
export const isValidUnlockMethod = (method) => {
  return Object.values(UNLOCK_METHODS).includes(method);
};

// Get display info for unlock methods
export const getUnlockMethodDisplay = (method) => {
  const displays = {
    [UNLOCK_METHODS.DEFAULT]: { icon: '🎁', label: 'Starting Item', color: '#9CA3AF' },
    [UNLOCK_METHODS.LEVEL]: { icon: '⬆️', label: 'Level Up', color: '#10B981' },
    [UNLOCK_METHODS.PRESTIGE]: { icon: '👑', label: 'Prestige', color: '#F59E0B' },
    [UNLOCK_METHODS.ACHIEVEMENT]: { icon: '🏆', label: 'Achievement', color: '#EAB308' },
    [UNLOCK_METHODS.MILESTONE]: { icon: '🎯', label: 'Milestone', color: '#8B5CF6' },
    [UNLOCK_METHODS.SKILL_TREE]: { icon: '🌳', label: 'Skill Tree', color: '#22C55E' },
    [UNLOCK_METHODS.PERK]: { icon: '✨', label: 'Perk Unlock', color: '#A855F7' },
    [UNLOCK_METHODS.BAZAAR]: { icon: '🛒', label: 'Bazaar', color: '#F97316' },
    [UNLOCK_METHODS.CRAFTING]: { icon: '🔨', label: 'Crafting', color: '#78716C' },
    [UNLOCK_METHODS.MODULE_PROGRESS]: { icon: '📊', label: 'Module Progress', color: '#3B82F6' },
    [UNLOCK_METHODS.STREAK]: { icon: '🔥', label: 'Streak', color: '#EF4444' },
    [UNLOCK_METHODS.PVP]: { icon: '⚔️', label: 'PvP', color: '#DC2626' },
    [UNLOCK_METHODS.SOCIAL]: { icon: '👥', label: 'Social', color: '#06B6D4' },
    [UNLOCK_METHODS.LEADERBOARD]: { icon: '📈', label: 'Leaderboard', color: '#FBBF24' },
    [UNLOCK_METHODS.QUEST]: { icon: '📜', label: 'Quest', color: '#8B5CF6' },
    [UNLOCK_METHODS.DAILY_QUEST]: { icon: '📅', label: 'Daily Quest', color: '#14B8A6' },
    [UNLOCK_METHODS.WEEKLY_QUEST]: { icon: '📆', label: 'Weekly Quest', color: '#0EA5E9' },
    [UNLOCK_METHODS.DISCOVERY]: { icon: '🔍', label: 'Discovery', color: '#6366F1' },
    [UNLOCK_METHODS.SECRET]: { icon: '🔒', label: 'Secret', color: '#4B5563' },
    [UNLOCK_METHODS.SEASONAL]: { icon: '🎄', label: 'Seasonal', color: '#059669' },
    [UNLOCK_METHODS.DAILY_LOGIN]: { icon: '📆', label: 'Daily Login', color: '#0891B2' },
    [UNLOCK_METHODS.NOVA]: { icon: '🤖', label: 'Nova Gift', color: '#D946EF' },
    [UNLOCK_METHODS.FOUNDER]: { icon: '⭐', label: 'Founder', color: '#FCD34D' },
    [UNLOCK_METHODS.BETA]: { icon: '🧪', label: 'Beta Tester', color: '#C084FC' },
  };

  return displays[method] || { icon: '❓', label: 'Unknown', color: '#6B7280' };
};

// Generate progress description for UI
export const getProgressDescription = (unlockRequirement) => {
  const { method, requirement } = unlockRequirement;

  switch (method) {
    case UNLOCK_METHODS.LEVEL:
      return `Reach Level ${requirement.level}`;
    case UNLOCK_METHODS.PRESTIGE:
      return `Reach Prestige ${requirement.prestige}`;
    case UNLOCK_METHODS.ACHIEVEMENT:
      return `Complete "${requirement.achievementName || requirement.achievementId}"`;
    case UNLOCK_METHODS.MILESTONE:
      return `${requirement.metric}: ${requirement.target}`;
    case UNLOCK_METHODS.SKILL_TREE:
      return `${requirement.tree} Tree Level ${requirement.level}`;
    case UNLOCK_METHODS.PERK:
      return `Unlock "${requirement.perkName || requirement.perkId}" perk`;
    case UNLOCK_METHODS.BAZAAR:
      return `${requirement.price} Cosmic Credits`;
    case UNLOCK_METHODS.MODULE_PROGRESS:
      return `${requirement.module}: ${requirement.metric} (${requirement.target})`;
    case UNLOCK_METHODS.STREAK:
      return `${requirement.streakDays}-day ${requirement.module || 'any'} streak`;
    case UNLOCK_METHODS.PVP:
      if (requirement.wins) return `Win ${requirement.wins} PvP battles`;
      if (requirement.rank) return `Reach ${requirement.rank} rank`;
      return 'PvP challenge';
    case UNLOCK_METHODS.SOCIAL:
      if (requirement.friends) return `Add ${requirement.friends} friends`;
      if (requirement.guildLevel) return `Guild Level ${requirement.guildLevel}`;
      return 'Social activity';
    case UNLOCK_METHODS.QUEST:
      return `Complete "${requirement.questName || requirement.questId}"`;
    case UNLOCK_METHODS.DAILY_QUEST:
      return `Complete ${requirement.count} daily quests`;
    case UNLOCK_METHODS.WEEKLY_QUEST:
      return `Complete ${requirement.count} weekly quests`;
    case UNLOCK_METHODS.DISCOVERY:
      return requirement.hint || 'Discover through exploration';
    case UNLOCK_METHODS.SECRET:
      return '???';
    case UNLOCK_METHODS.SEASONAL:
      return requirement.eventName || 'Seasonal event';
    case UNLOCK_METHODS.DAILY_LOGIN:
      return `${requirement.days}-day login streak`;
    case UNLOCK_METHODS.NOVA:
      return 'Gift from Nova';
    default:
      return 'Starting equipment';
  }
};
