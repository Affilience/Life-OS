/**
 * useGamification - Unified Gamification Hook
 *
 * This hook coordinates all gamification systems in the app:
 * - XP and leveling (avatarStore)
 * - Module XP and constellations (gamificationStore)
 * - Achievement stat tracking (achievementsStore)
 * - Pet unlocks (petStore)
 * - Perk effects and bonuses (perkStore)
 * - Celebration animations
 *
 * All modules should use this hook instead of calling individual stores directly.
 */

import { useCallback, useEffect, useRef } from 'react';
import { useAvatarStore } from '../stores/avatarStore';
import useAchievementsStore from '../stores/achievementsStore';
import { usePetStore } from '../stores/petStore';
import { useGamificationStore } from '../stores/gamificationStore';
import usePerkStore from '../stores/perkStore';
import useQuestsStore from '../stores/questsStore';
import useCustomStreaksStore from '../stores/customStreaksStore';
import { calculatePerkBonusXP, addStatXP } from '../utils/perkEffects';

// Global celebration trigger (set by CelebrationProvider)
let globalCelebrate = null;
export const setCelebrationTrigger = (trigger) => {
  globalCelebrate = trigger;
};

// Module-to-constellation mapping
const MODULE_CONSTELLATION_MAP = {
  productivity: 'productivity',
  health: 'health',
  fitness: 'health',
  knowledge: 'knowledge',
  financial: 'financial',
  journal: 'mindfulness',
  calendar: 'productivity',
  skills: 'knowledge',
  social: 'social',
};

// Action-to-stat mapping for achievements
// These stat names MUST match the stats object in achievementsStore.js
// and the switch statement in checkAchievements()
const ACTION_STAT_MAP = {
  // Productivity
  taskCompleted: 'tasksCompleted',
  projectCreated: 'projectsCreated',
  projectCompleted: 'projectsCompleted',
  deepWorkMinutes: 'deepWorkHours', // Note: converts to hours in the store
  deepWorkHour: 'deepWorkHours',
  pomodoroCompleted: 'pomodorosCompleted',
  longestWorkSession: 'longestWorkSession',

  // Health & Fitness
  workoutCompleted: 'workouts', // Maps to stats.workouts
  mealLogged: 'mealsLogged',
  waterLogged: 'waterIntakeDays',
  sleepLogged: 'sleepLogged',
  weightLogged: 'weightLogged',
  caloriesTracked: 'caloriesTracked',
  proteinGoalHit: 'proteinGoalsHit',
  prSet: 'prsAchieved',
  caloriesBurned: 'caloriesBurned',
  volumeLifted: 'totalVolume',
  cardioMiles: 'cardioMiles',
  cardioSession: 'cardioSessions',
  workoutStreakDay: 'workoutStreakDays',
  mealLogStreak: 'mealLogStreak',
  proteinGoalStreak: 'proteinGoalStreak',
  calorieGoalStreak: 'calorieGoalStreak',

  // Knowledge
  bookCompleted: 'booksCompleted',
  noteCreated: 'notesCreated',
  ideaCaptured: 'ideasCaptured',
  articleRead: 'articlesRead',
  podcastCompleted: 'podcastsCompleted',
  courseCompleted: 'coursesCompleted',
  readingMinutes: 'readingHours', // Note: converts to hours

  // Skills
  practiceSession: 'practiceSessionsCompleted',
  skillLevelUp: 'skillsLeveledUp',
  skillMastered: 'skillsMastered',

  // Financial
  expenseLogged: 'expensesLogged',
  incomeLogged: 'incomeLogged',
  budgetCreated: 'budgetsCreated',
  savingsGoalCreated: 'savingsGoalsCreated',
  savingsGoalCompleted: 'savingsGoalsCompleted',
  savingsContribution: 'savingsContributions',
  savingsMilestone25: 'savingsMilestone25',
  savingsMilestone50: 'savingsMilestone50',
  savingsMilestone75: 'savingsMilestone75',
  totalSaved: 'totalSaved',
  savingsStreakWeek: 'savingsStreakWeeks',
  underBudgetMonth: 'underBudgetMonths',

  // Journal
  journalEntry: 'journalEntries', // Maps to stats.journalEntries
  gratitudeLogged: 'gratitudeEntriesCreated',
  reflectionCompleted: 'reflectionsCompleted',
  moodLogged: 'moodEntriesLogged',
  journalStreakDay: 'journalStreak',

  // Calendar
  timeBlockCompleted: 'timeBlocksCompleted',
  eventCreated: 'eventsCreated',
  scheduleFollowed: 'schedulesFollowed',

  // Streaks
  streakMaintained: 'streaksMaintained',
  longestStreak: 'longestStreak',
  streakDay: 'streakDays',
  taskStreakDay: 'taskStreakDays',

  // Quests
  questCompleted: 'questsCompleted',
  weeklyQuestCompleted: 'questsCompleted', // Also counts as quest completed
  monthlyQuestCompleted: 'questsCompleted', // Also counts as quest completed
  crossModuleQuestCompleted: 'questsCompleted', // Also counts as quest completed
  weeklyPerfect: 'weeklyPerfect',
  monthlyPerfect: 'monthlyPerfect',
  chainCompleted: 'chainsCompleted',
  questChainCompleted: 'chainsCompleted', // Alias
  bossDefeated: 'bossesDefeated',

  // Social
  friendAdded: 'friendsAdded',
  challengeCompleted: 'challengesCompleted',
  challengeCreated: 'challengesCreated',

  // Calendar
  timeBlockCompleted: 'timeBlocksCompleted',
  eventCreated: 'eventsCreated',

  // Streaks / Habits
  streakDay: 'streakDays',
  streakMaintained: 'streaksMaintained',

  // General / Milestones
  loginDay: 'loginDays',
  consecutiveDay: 'consecutiveDays',
  moduleVisited: 'modulesVisited',
  dayActive: 'daysActive',
  activityLogged: 'totalActivities',

  // Special / Time-based
  nightOwl: 'specialNightOwl',
  earlyBird: 'specialEarlyBird',
  perfectDay: 'perfectDays',
  allModulesDay: 'allModulesDay',
  weekendComplete: 'weekendComplete',
  mondayEarly: 'mondayEarly',
  earlyStreakDay: 'earlyStreak',
  nightStreakDay: 'nightStreak',
  newYearQuest: 'newYearQuest',
  prsSingleWorkout: 'prsSingleWorkout',
  comeback: 'comeback',
  allModulesWeek: 'allModulesWeek',
  tasksSingleDay: 'tasksSingleDay',
};

// XP values for different actions - Balanced tier system
// Harder/longer tasks = more XP, easy tasks = 5-10 XP
const XP_VALUES = {
  // ===========================================
  // EPIC TIER (50-75 XP) - Major achievements requiring weeks/months of effort
  // ===========================================
  monthlyPerfect: 75,           // Perfect month - extremely rare
  skillMastered: 60,            // Mastering a skill takes months
  bossDefeated: 50,             // Boss battles are challenging
  projectCompleted: 50,         // Completing a full project
  savingsGoalCompleted: 50,     // Major financial milestone
  resolutionCompleted: 50,      // Year-long commitment achieved
  monthlyQuestCompleted: 40,    // Month-long quest

  // ===========================================
  // HARD TIER (25-40 XP) - Significant effort, 30+ minutes
  // ===========================================
  bookCompleted: 35,            // Finishing an entire book
  courseCompleted: 35,          // Completing a full course
  workoutCompleted: 25,         // Full workout session
  challengeCompleted: 25,       // Social challenge completed
  weeklyPerfect: 25,            // Perfect week
  weeklyQuestCompleted: 20,     // Week-long quest
  questChainCompleted: 30,      // Multi-step quest chain
  chainCompleted: 25,           // Streak chain maintained
  crossModuleQuestCompleted: 20,
  skillLevelUp: 20,             // Leveling up a skill

  // ===========================================
  // MEDIUM TIER (10-20 XP) - Moderate effort, 10-30 minutes
  // ===========================================
  journalEntry: 12,             // Writing a journal entry
  practiceSession: 12,          // Skill practice session
  pomodoroCompleted: 8,         // 25-min focused work
  deepWorkMinutes: 10,          // Deep work session
  timeBlockCompleted: 8,        // Completing a time block
  prSet: 15,                    // Personal record in workout
  cardioSession: 10,            // Cardio workout
  questCompleted: 12,           // Single quest
  milestoneAchieved: 15,        // Skill milestone
  challengeCreated: 10,         // Creating a challenge
  mediaCompleted: 12,           // Video/podcast completed
  identityCheckIn: 15,          // Deep self-reflection
  decisionReviewed: 10,         // Reviewing a decision
  resolutionMilestone: 15,      // Resolution milestone
  badHabitMilestone: 15,        // Bad habit milestone

  // ===========================================
  // EASY TIER (5-10 XP) - Quick actions, 1-10 minutes
  // ===========================================
  taskCompleted: 8,             // Completing a task
  mealLogged: 8,                // Logging a meal
  noteCreated: 5,               // Creating a note
  projectCreated: 8,            // Starting a project
  ideaCaptured: 5,              // Quick idea capture
  articleRead: 6,               // Reading an article
  friendAdded: 8,               // Adding a friend
  streakMaintained: 8,          // Maintaining a streak
  savingsContribution: 8,       // Contributing to savings
  incomeLogged: 6,              // Logging income
  recipeCreated: 6,             // Creating a recipe
  workoutTemplateCreated: 8,    // Creating workout template
  budgetCreated: 8,             // Creating a budget
  savingsGoalCreated: 8,        // Setting a savings goal
  valueCreated: 8,              // Defining a core value
  resolutionCheckIn: 8,         // Resolution check-in
  skillAdded: 8,                // Adding a skill to track
  decisionLogged: 6,            // Logging a decision
  badHabitStarted: 8,           // Committing to quit a habit
  sleepLogged: 5,               // Logging sleep
  gratitudeLogged: 5,           // Quick gratitude entry

  // ===========================================
  // TRIVIAL TIER (2-5 XP) - Simple tracking, seconds
  // ===========================================
  waterLogged: 3,               // Logging water intake
  expenseLogged: 3,             // Logging an expense
  moodLogged: 3,                // Logging mood
  loginDay: 3,                  // Daily login
  dayActive: 3,                 // Being active for the day
  activityLogged: 3,            // Generic activity
  eventCreated: 3,              // Creating a calendar event
  streakDay: 5,                 // One day of streak
  supplementTaken: 2,           // Taking a supplement
  supplementAdded: 3,           // Adding a supplement to track

  // Default for unlisted actions
  default: 5,
};

/**
 * Main gamification hook
 */
export function useGamification() {
  const addXPToAvatar = useAvatarStore(state => state.addXP);
  const checkUnlocks = useAvatarStore(state => state.checkUnlocks);
  const incrementStat = useAchievementsStore(state => state.incrementStat);
  const updateStat = useAchievementsStore(state => state.updateStat);
  const checkAchievements = useAchievementsStore(state => state.checkAchievements);
  const checkPetUnlocks = usePetStore(state => state.checkUnlocks);
  const stats = useAchievementsStore(state => state.stats);
  const addXPToGamification = useGamificationStore(state => state.addXP);

  // Combined addXP that updates both stores
  const addXP = useCallback(async (amount, module = 'general') => {
    addXPToAvatar(amount);
    if (addXPToGamification) {
      // Skip avatar sync since we already called addXPToAvatar above
      await addXPToGamification(amount, module, { skipAvatarSync: true });
    }
  }, [addXPToAvatar, addXPToGamification]);

  /**
   * Record a gamification action
   * This is the main function modules should call
   *
   * @param {string} action - The action type (e.g., 'taskCompleted', 'workoutCompleted')
   * @param {object} options - Optional configuration
   * @param {string} options.module - Module name for constellation XP
   * @param {number} options.xpOverride - Custom XP value (uses default if not provided)
   * @param {number} options.count - Number of times to increment stat (default: 1)
   * @param {object} options.metadata - Additional metadata for the action
   * @param {number} options.durationMinutes - Duration of activity (for perk bonuses)
   * @param {string} options.workoutType - Type of workout ('cardio', 'strength', etc.)
   * @param {number} options.currentStreak - Current streak count (for streak bonuses)
   */
  const recordAction = useCallback((action, options = {}) => {
    const { module = 'general', xpOverride, count = 1, metadata = {}, durationMinutes, workoutType, currentStreak } = options;

    // 1. Calculate base XP
    const baseXP = xpOverride ?? (XP_VALUES[action] || XP_VALUES.default) * count;

    // 2. Apply perk bonuses to XP
    const perkResult = calculatePerkBonusXP(baseXP, action, {
      durationMinutes,
      workoutType,
      currentStreak,
      ...metadata,
    });

    const xpAmount = perkResult.finalXP;

    // 3. Add XP to stores (updates both avatarStore and gamificationStore)
    if (xpAmount > 0) {
      addXP(xpAmount, module);
    }

    // 4. Add synergy XP to other stats
    if (perkResult.synergyBonuses.length > 0) {
      perkResult.synergyBonuses.forEach(synergy => {
        addStatXP(synergy.tree, synergy.amount);
      });
    }

    // 5. Add XP to the action's associated stat (for perk progression)
    if (perkResult.tree) {
      addStatXP(perkResult.tree, Math.floor(xpAmount / 10)); // 10% of XP goes to stat level
    }

    // 6. Increment achievement stat
    const statName = ACTION_STAT_MAP[action];
    if (statName) {
      incrementStat(statName, count);
    }

    // 7. Check for new achievements
    checkAchievements();

    // 8. Check for equipment unlocks
    checkUnlocks();

    // 9. Check for pet unlocks
    checkPetUnlocks();

    // Log for debugging
    console.log('[Gamification] Action recorded:', {
      action,
      baseXP,
      finalXP: xpAmount,
      multiplier: perkResult.multiplier,
      perkBonuses: perkResult.breakdown,
      synergyBonuses: perkResult.synergyBonuses,
      stat: statName,
      module,
      count,
    });

    return {
      xpEarned: xpAmount,
      baseXP,
      multiplier: perkResult.multiplier,
      perkBonuses: perkResult.breakdown,
      synergyBonuses: perkResult.synergyBonuses,
      stat: statName,
    };
  }, [addXP, incrementStat, checkAchievements, checkUnlocks, checkPetUnlocks]);

  /**
   * Record a streak update
   *
   * @param {number} currentStreak - Current streak count
   */
  const recordStreak = useCallback((currentStreak) => {
    // Update longest streak if this is higher
    if (currentStreak > (stats.longestStreak || 0)) {
      updateStat('longestStreak', currentStreak);
    }

    // Record streak maintained
    if (currentStreak > 0) {
      incrementStat('streaksMaintained', 1);
    }

    checkAchievements();
    checkPetUnlocks();
  }, [stats, updateStat, incrementStat, checkAchievements, checkPetUnlocks]);

  /**
   * Record consecutive login days
   *
   * @param {number} consecutiveDays - Current consecutive day count
   */
  const recordLoginStreak = useCallback((consecutiveDays) => {
    updateStat('consecutiveDays', consecutiveDays);
    incrementStat('loginDays', 1);

    // Bonus XP for login streaks
    const streakBonus = Math.min(consecutiveDays * 5, 50);
    addXP(streakBonus);

    checkAchievements();
    checkPetUnlocks();
  }, [updateStat, incrementStat, addXP, checkAchievements, checkPetUnlocks]);

  /**
   * Batch record multiple actions at once
   * Useful for syncing or importing data
   *
   * @param {Array<{action: string, options?: object}>} actions
   */
  const recordBatchActions = useCallback((actions) => {
    let totalXP = 0;

    actions.forEach(({ action, options = {} }) => {
      const { xpEarned } = recordAction(action, { ...options, skipChecks: true });
      totalXP += xpEarned;
    });

    // Run checks once at the end
    checkAchievements();
    checkUnlocks();
    checkPetUnlocks();

    return { totalXP };
  }, [recordAction, checkAchievements, checkUnlocks, checkPetUnlocks]);

  /**
   * Get current gamification status
   */
  const getStatus = useCallback(() => {
    const avatarState = useAvatarStore.getState();
    const achievementsState = useAchievementsStore.getState();
    const petState = usePetStore.getState();
    const gamificationState = useGamificationStore.getState();

    return {
      level: gamificationState.level || avatarState.level,
      xp: gamificationState.currentXP || avatarState.xp,
      xpToNextLevel: gamificationState.xpToNextLevel || 500,
      tier: avatarState.tier,
      equipmentUnlocked: avatarState.unlockedEquipment?.length || 0,
      achievementsUnlocked: achievementsState.achievements?.length || 0,
      petsUnlocked: petState.ownedPets?.length || 0,
      stats: achievementsState.stats,
    };
  }, []);

  return {
    recordAction,
    recordStreak,
    recordLoginStreak,
    recordBatchActions,
    getStatus,
    // Expose raw functions for advanced use cases
    addXP,
    incrementStat,
    updateStat,
    checkAchievements,
    checkUnlocks,
    checkPetUnlocks,
  };
}

// Actions that should trigger streak updates
const STREAK_ACTIONS = {
  // Productivity
  taskCompleted: 'productivity',
  projectCompleted: 'productivity',
  pomodoroCompleted: 'productivity',
  deepWorkHour: 'productivity',

  // Health & Fitness
  workoutCompleted: 'health',
  mealLogged: 'health',
  cardioSession: 'health',
  prSet: 'health',

  // Journal
  journalEntry: 'journal',
  gratitudeLogged: 'journal',
  moodLogged: 'journal',

  // Knowledge
  noteCreated: 'knowledge',
  bookCompleted: 'knowledge',
  articleRead: 'knowledge',
  courseCompleted: 'knowledge',
  ideaCaptured: 'knowledge',

  // Finance
  expenseLogged: 'finance',
  incomeLogged: 'finance',
  savingsContribution: 'finance',

  // Skills
  practiceSession: 'skills',
  skillLevelUp: 'skills',

  // Quests
  questCompleted: 'quests',
};

/**
 * Non-hook version for use in stores
 * Use this when you need to trigger gamification from Zustand stores
 */
export async function triggerGamification(action, options = {}) {
  const { xpOverride, count = 1, module = 'general', durationMinutes, workoutType, currentStreak, ...metadata } = options;

  // Get store instances
  const avatarStore = useAvatarStore.getState();
  const achievementsStore = useAchievementsStore.getState();
  const petStore = usePetStore.getState();
  const gamificationStore = useGamificationStore.getState();
  const perkStore = usePerkStore.getState();

  // Track state before changes for celebration detection
  const levelBefore = avatarStore.level;
  const tierBefore = avatarStore.currentTier || 1;
  const achievementCountBefore = achievementsStore.achievements?.length || 0;
  const petsCountBefore = petStore.ownedPets?.length || 0;

  // 1. Calculate base XP
  const baseXP = xpOverride ?? (XP_VALUES[action] || XP_VALUES.default) * count;

  // 2. Apply perk bonuses to XP
  const perkResult = calculatePerkBonusXP(baseXP, action, {
    durationMinutes,
    workoutType,
    currentStreak,
    ...metadata,
  });

  const xpAmount = perkResult.finalXP;

  // 3. Add XP to stores
  let xpWasAdded = false;
  if (xpAmount > 0) {
    xpWasAdded = true;
    // Update both stores for consistency
    avatarStore.addXP(xpAmount);

    // Also update gamificationStore (used by Character page and dashboard)
    // Skip avatar sync since we already called avatarStore.addXP above
    if (gamificationStore.addXP) {
      try {
        await gamificationStore.addXP(xpAmount, module, { skipAvatarSync: true });
      } catch (e) {
        console.warn('[Gamification] XP sync error:', e.message);
      }
    }
  }

  // 4. Add synergy XP to other stats
  if (perkResult.synergyBonuses.length > 0) {
    perkResult.synergyBonuses.forEach(synergy => {
      perkStore.addStatXP(synergy.tree, synergy.amount);
    });
  }

  // 5. Add XP to the action's associated stat (for perk progression)
  if (perkResult.tree) {
    perkStore.addStatXP(perkResult.tree, Math.floor(xpAmount / 10)); // 10% of XP goes to stat level
  }

  // 6. Increment achievement stat
  const statName = ACTION_STAT_MAP[action];
  if (statName) {
    achievementsStore.incrementStat(statName, count);
  }

  // 7. Check for unlocks
  const newAchievements = achievementsStore.checkAchievements() || [];
  avatarStore.checkUnlocks();
  let newPets = [];
  try {
    newPets = await petStore.checkUnlocks() || [];
  } catch (e) {
    console.warn('[Gamification] Pet unlock check error:', e.message);
  }

  // 7.5 Auto-check quest progress based on updated stats
  // This enables automatic quest completion when underlying actions are performed
  // All actions defer heavy checks to prevent UI freezes

  let completedQuests = [];
  let extendedStreaks = [];
  let autoCompletedTasks = [];

  // Helper function to run heavy checks (deferred to prevent UI freezes)
  // Includes celebration triggers for results since they need the populated arrays
  const runHeavyChecks = async () => {
    const localCompletedQuests = [];
    const localExtendedStreaks = [];
    const localAutoCompletedTasks = [];

    // Quest progress check
    try {
      const questsStore = useQuestsStore.getState();
      const quests = questsStore.checkAndUpdateQuestProgress();
      if (quests?.length > 0) localCompletedQuests.push(...quests);
    } catch (e) {
      console.warn('[Gamification] Could not check quest progress:', e);
    }

    // 7.55 Auto-extend custom streaks based on action type
    try {
      const customStreaksStore = useCustomStreaksStore.getState();
      const streaks = await customStreaksStore.checkAndAutoExtendStreaks(action);
      if (streaks?.length > 0) localExtendedStreaks.push(...streaks);
    } catch (e) {
      console.warn('[Gamification] Could not auto-extend streaks:', e);
    }

    // 7.6 Auto-complete daily tasks based on action type
    // Skip if this is a task completion action (avoid infinite loops)
    if (action !== 'taskCompleted') {
      try {
        const [{ default: useDailyTasksStore }, { getTasksForAction }] = await Promise.all([
          import('../stores/dailyTasksStore'),
          import('../services/taskSemanticService'),
        ]);

        const dailyTasksStore = useDailyTasksStore.getState();
        const today = new Date().toISOString().split('T')[0];
        const todaysTasks = dailyTasksStore.getTasksByDate?.(today) || [];

        // Use semantic service to find matching tasks
        const matchingTasks = getTasksForAction(action, todaysTasks);

        if (matchingTasks.length > 0) {
          matchingTasks.forEach(task => {
            if (!task.completed) {
              console.log('[Gamification] Auto-completing task via semantic match:', task.title, '| Action:', action);
              dailyTasksStore.toggleTask(task.id, today);
              localAutoCompletedTasks.push(task);
            }
          });
        }
      } catch (e) {
        console.warn('[Gamification] Could not auto-complete daily tasks:', e);
      }
    }

    // Trigger celebrations for deferred results (inside the deferred function so arrays are populated)
    // Streak extension celebrations
    if (localExtendedStreaks.length > 0 && globalCelebrate) {
      localExtendedStreaks.forEach((extended, index) => {
        setTimeout(() => {
          globalCelebrate.streakExtended({
            streak: extended.streak,
            previousStreak: extended.previousStreak,
            newStreak: extended.newStreak,
          });
        }, index * 2000);
      });
    }

    // Quest completion celebrations (from auto-check)
    if (localCompletedQuests.length > 0 && globalCelebrate) {
      const celebrationDelay = localExtendedStreaks.length * 1500;
      localCompletedQuests.forEach((quest, index) => {
        setTimeout(() => {
          globalCelebrate.questCompleted({ quest });
        }, celebrationDelay + index * 2000);
      });
    }

    // Daily task auto-completion celebrations
    if (localAutoCompletedTasks.length > 0 && globalCelebrate) {
      const celebrationDelay = (localExtendedStreaks.length + localCompletedQuests.length) * 1500;
      localAutoCompletedTasks.forEach((task, index) => {
        setTimeout(() => {
          globalCelebrate.questCompleted({
            quest: {
              name: task.title,
              title: task.title,
              type: 'daily',
              description: 'Daily task completed!',
              xpReward: XP_VALUES.taskCompleted || 20,
            },
          });
        }, celebrationDelay + index * 2000);
      });
    }

    // Update the outer arrays for return value (though callers shouldn't rely on these for deferred results)
    completedQuests.push(...localCompletedQuests);
    extendedStreaks.push(...localExtendedStreaks);
    autoCompletedTasks.push(...localAutoCompletedTasks);
  };

  // Defer heavy checks for ALL actions to prevent UI freezes
  // The checks still run, just in the next event loop tick
  // This ensures the UI remains responsive while background processing happens
  setTimeout(runHeavyChecks, 0);

  // 8. Update streaks for relevant actions
  const streakModule = STREAK_ACTIONS[action];
  if (streakModule && gamificationStore.updateStreak) {
    try {
      await gamificationStore.updateStreak(streakModule, true);
    } catch (e) {
      console.warn('[Gamification] Streak update failed:', e);
    }
  }

  // 9. Trigger celebrations for new unlocks
  const levelAfter = avatarStore.level;

  // Level up celebration with full data
  if (levelAfter > levelBefore && globalCelebrate) {
    // Award skill points on level up
    let skillPointsAwarded = 0;
    try {
      const { useSkillPointsStore } = await import('../stores/skillPointsStore');
      const result = await useSkillPointsStore.getState().awardLevelUpPoints();
      skillPointsAwarded = result?.pointsAwarded || 0;
    } catch (e) {
      console.warn('[Gamification] Skill points award failed:', e);
    }

    // Trigger level up modal with full data
    globalCelebrate.levelUp({
      newLevel: levelAfter,
      oldLevel: levelBefore,
      skillPointsAwarded,
      stageTransition: avatarStore.currentTier !== tierBefore,
      newStage: avatarStore.currentTier,
      oldStage: tierBefore,
    });
  } else if (xpWasAdded && globalCelebrate?.xpGained) {
    // Show XP gained notification if no level up occurred
    globalCelebrate.xpGained({
      amount: xpAmount,
      action,
      module,
    });
  }

  // Achievement celebrations - use full-screen Duolingo-style celebration
  if (newAchievements.length > 0 && globalCelebrate) {
    newAchievements.forEach((achievement, index) => {
      setTimeout(() => {
        globalCelebrate.achievementUnlocked({
          achievement: {
            id: achievement.id,
            name: achievement.name || 'Achievement Unlocked',
            description: achievement.description,
            tier: achievement.tier || 'common',
            rarity: achievement.tier || 'common',
            xpReward: achievement.xpReward || 0,
            icon: achievement.icon,
          },
        });
      }, index * 2000); // Stagger multiple achievements
    });
  }

  // Pet unlock celebrations
  if (newPets.length > 0 && globalCelebrate) {
    newPets.forEach((pet, index) => {
      setTimeout(() => {
        globalCelebrate.achievement({
          title: `${pet.name} Unlocked!`,
          description: pet.description,
          variant: pet.tier === 'mythic' ? 'gold' :
                   pet.tier === 'epic' ? 'purple' :
                   pet.tier === 'rare' ? 'blue' : 'green',
        });
      }, (newAchievements.length + index) * 1500);
    });
  }

  // Direct quest completion celebration (when triggerGamification is called from questsStore)
  // This handles the case where a quest was manually completed and we need to celebrate it
  // Note: Auto-detected quest completions are celebrated inside runHeavyChecks()
  const isQuestCompletionAction = [
    'questCompleted', 'weeklyQuestCompleted', 'monthlyQuestCompleted',
    'crossModuleQuestCompleted', 'questChainCompleted', 'bossDefeated'
  ].includes(action);

  if (isQuestCompletionAction && globalCelebrate) {
    const celebrationDelay = (newAchievements.length + newPets.length) * 1500;
    setTimeout(() => {
      // Determine quest type from action name
      const questType = action === 'bossDefeated' ? 'boss' :
                       action === 'questChainCompleted' ? 'chain' :
                       action === 'crossModuleQuestCompleted' ? 'cross-module' :
                       action === 'monthlyQuestCompleted' ? 'monthly' : 'weekly';

      globalCelebrate.questCompleted({
        quest: {
          name: metadata.questName || metadata.name || 'Quest Complete',
          title: metadata.questTitle || metadata.title || 'Quest Complete',
          type: questType,
          description: metadata.questDescription || metadata.description || '',
          xpReward: xpOverride || XP_VALUES[action] || 25,
          creditReward: metadata.creditReward || metadata.creditsReward || 0,
        },
      });
    }, celebrationDelay);
  }

  // Note: Streak extension, auto-quest completion, and auto-task completion celebrations
  // are now triggered inside runHeavyChecks() after the deferred processing completes

  console.log('[Gamification] Store action:', {
    action,
    baseXP,
    finalXP: xpAmount,
    multiplier: perkResult.multiplier,
    perkBonuses: perkResult.breakdown,
    stat: statName,
  });

  return {
    xpEarned: xpAmount,
    baseXP,
    multiplier: perkResult.multiplier,
    perkBonuses: perkResult.breakdown,
    synergyBonuses: perkResult.synergyBonuses,
    stat: statName,
    newAchievements,
    newPets,
    extendedStreaks,
    completedQuests: completedQuests || [],
    autoCompletedTasks,
  };
}

export default useGamification;
