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

// XP values for different actions
const XP_VALUES = {
  // High XP actions (30-50)
  workoutCompleted: 40,
  projectCompleted: 50,
  bookCompleted: 45,
  skillMastered: 50,
  savingsGoalCompleted: 50,
  courseCompleted: 45,
  challengeCompleted: 40,
  bossDefeated: 50,
  weeklyPerfect: 40,
  monthlyPerfect: 100,
  chainCompleted: 45,
  weeklyQuestCompleted: 30,
  monthlyQuestCompleted: 50,
  crossModuleQuestCompleted: 35,
  questChainCompleted: 45,

  // Medium XP actions (15-25)
  taskCompleted: 20,
  questCompleted: 25,
  mealLogged: 15,
  journalEntry: 20,
  practiceSession: 25,
  noteCreated: 15,
  timeBlockCompleted: 15,
  pomodoroCompleted: 20,
  skillLevelUp: 30,
  prSet: 25,
  cardioSession: 20,
  savingsContribution: 15,
  friendAdded: 15,
  challengeCreated: 20,
  streakMaintained: 15,

  // Low XP actions (5-10)
  waterLogged: 5,
  expenseLogged: 5,
  incomeLogged: 10,
  sleepLogged: 10,
  moodLogged: 5,
  ideaCaptured: 10,
  articleRead: 10,
  gratitudeLogged: 10,
  loginDay: 5,
  dayActive: 5,
  activityLogged: 5,
  eventCreated: 5,
  streakDay: 10,

  // Default
  default: 10,
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
  if (xpAmount > 0) {
    // Update both stores for consistency
    avatarStore.addXP(xpAmount);

    // Also update gamificationStore (used by Character page and dashboard)
    // Skip avatar sync since we already called avatarStore.addXP above
    if (gamificationStore.addXP) {
      await gamificationStore.addXP(xpAmount, module, { skipAvatarSync: true });
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
  const newPets = await petStore.checkUnlocks() || [];

  // 7.5 Auto-check quest progress based on updated stats
  // This enables automatic quest completion when underlying actions are performed
  const questsStore = useQuestsStore.getState();
  const completedQuests = questsStore.checkAndUpdateQuestProgress();

  // 7.55 Auto-extend custom streaks based on action type
  // This enables streaks to auto-complete when relevant actions are performed
  let extendedStreaks = [];
  try {
    const customStreaksStore = useCustomStreaksStore.getState();
    extendedStreaks = await customStreaksStore.checkAndAutoExtendStreaks(action);
  } catch (e) {
    console.warn('[Gamification] Could not auto-extend streaks:', e);
  }

  // 7.6 Auto-complete daily tasks based on action type
  // This enables tasks like "Write a quick reflection" to auto-complete when journal entry is saved
  // Uses the semantic task service for comprehensive keyword matching
  let autoCompletedTasks = [];
  try {
    const [{ default: useDailyTasksStore }, { getTasksForAction }] = await Promise.all([
      import('../stores/dailyTasksStore'),
      import('../services/taskSemanticService'),
    ]);

    const dailyTasksStore = useDailyTasksStore.getState();
    const today = new Date().toISOString().split('T')[0];
    const todaysTasks = dailyTasksStore.getTasksByDate?.(today) || [];

    // Skip if this is a task completion action (avoid infinite loops)
    if (action === 'taskCompleted') {
      // Don't auto-complete other tasks when a task is completed
    } else {
      // Use semantic service to find matching tasks
      const matchingTasks = getTasksForAction(action, todaysTasks);

      if (matchingTasks.length > 0) {
        matchingTasks.forEach(task => {
          // Only auto-complete tasks that aren't already completed
          if (!task.completed) {
            console.log('[Gamification] Auto-completing task via semantic match:', task.title, '| Action:', action);
            dailyTasksStore.toggleTask(task.id, today);
            autoCompletedTasks.push(task);
          }
        });
      }
    }
  } catch (e) {
    console.warn('[Gamification] Could not auto-complete daily tasks:', e);
  }

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

  // Level up celebration
  if (levelAfter > levelBefore && globalCelebrate) {
    globalCelebrate.levelUp(levelAfter);
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

  // Streak extension celebrations
  if (extendedStreaks.length > 0 && globalCelebrate) {
    const celebrationDelay = (newAchievements.length + newPets.length) * 1500;
    extendedStreaks.forEach((extended, index) => {
      setTimeout(() => {
        globalCelebrate.streakExtended({
          streak: extended.streak,
          previousStreak: extended.previousStreak,
          newStreak: extended.newStreak,
        });
      }, celebrationDelay + index * 2000);
    });
  }

  // Quest completion celebrations (from auto-check)
  if (completedQuests && completedQuests.length > 0 && globalCelebrate) {
    const celebrationDelay = (newAchievements.length + newPets.length + extendedStreaks.length) * 1500;
    completedQuests.forEach((quest, index) => {
      setTimeout(() => {
        globalCelebrate.questCompleted({
          quest,
        });
      }, celebrationDelay + index * 2000);
    });
  }

  // Direct quest completion celebration (when triggerGamification is called from questsStore)
  // This handles the case where a quest was manually completed and we need to celebrate it
  const isQuestCompletionAction = [
    'questCompleted', 'weeklyQuestCompleted', 'monthlyQuestCompleted',
    'crossModuleQuestCompleted', 'questChainCompleted', 'bossDefeated'
  ].includes(action);

  if (isQuestCompletionAction && globalCelebrate && (!completedQuests || completedQuests.length === 0)) {
    const celebrationDelay = (newAchievements.length + newPets.length + extendedStreaks.length) * 1500;
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

  // Daily task auto-completion celebrations
  // Shows a Duolingo-style celebration when tasks are auto-completed by actions
  if (autoCompletedTasks.length > 0 && globalCelebrate) {
    const celebrationDelay = (
      newAchievements.length +
      newPets.length +
      extendedStreaks.length +
      (completedQuests?.length || 0)
    ) * 1500;

    autoCompletedTasks.forEach((task, index) => {
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
