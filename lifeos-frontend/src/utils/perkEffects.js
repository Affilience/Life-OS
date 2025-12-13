/**
 * Perk Effects Utility
 *
 * This utility provides functions to apply perk effects to various game actions.
 * It integrates with the perkStore to calculate bonuses and applies them
 * throughout the application.
 *
 * Note: Features are NOT gated behind perks. All app features are accessible.
 * Perks only provide bonuses (XP multipliers, gold, gems, titles).
 */

import usePerkStore from '../stores/perkStore';

// Action to tree mapping
const ACTION_TO_TREE = {
  // Body tree actions
  workoutCompleted: 'body',
  mealLogged: 'body',
  waterLogged: 'body',
  sleepLogged: 'body',
  weightLogged: 'body',
  caloriesTracked: 'body',
  proteinGoalHit: 'body',
  cardioCompleted: 'body',
  strengthTraining: 'body',

  // Mind tree actions
  bookCompleted: 'mind',
  noteCreated: 'mind',
  ideaCaptured: 'mind',
  articleRead: 'mind',
  podcastCompleted: 'mind',
  courseCompleted: 'mind',
  deepWorkMinutes: 'mind',
  pomodoroCompleted: 'mind',

  // Spirit tree actions
  journalEntry: 'mind', // Journal gives MIND and SPIRIT
  gratitudeLogged: 'spirit',
  reflectionCompleted: 'spirit',
  moodLogged: 'spirit',
  meditationCompleted: 'spirit',

  // Wealth tree actions
  expenseLogged: 'wealth',
  incomeLogged: 'wealth',
  budgetCreated: 'wealth',
  savingsGoalCreated: 'wealth',
  savingsGoalCompleted: 'wealth',
  investmentMade: 'wealth',

  // Social tree actions
  friendAdded: 'social',
  challengeCompleted: 'social',
  challengeCreated: 'social',
  conversationLogged: 'social',
  eventAttended: 'social',
  presentationGiven: 'social',

  // Craft tree actions
  practiceSession: 'craft',
  skillLevelUp: 'craft',
  skillMastered: 'craft',
  projectCompleted: 'craft',

  // General
  taskCompleted: 'mind',
  timeBlockCompleted: 'mind',
  eventCreated: 'mind',
  scheduleFollowed: 'spirit',
  loginDay: null, // No tree
  consecutiveDay: null, // No tree
};

/**
 * Calculate the final XP amount with all perk bonuses applied
 *
 * @param {number} baseXP - The base XP before any bonuses
 * @param {string} action - The action type (e.g., 'workoutCompleted')
 * @param {object} options - Additional options for bonus calculation
 * @returns {object} { finalXP, breakdown }
 */
export function calculatePerkBonusXP(baseXP, action, options = {}) {
  const perkStore = usePerkStore.getState();
  const tree = ACTION_TO_TREE[action];

  let multiplier = 1;
  let flatBonus = 0;
  const breakdown = [];

  // Get tree-specific multiplier
  if (tree) {
    multiplier = perkStore.getXPMultiplier(tree, {
      ...options,
      isCardio: action === 'cardioCompleted' || options.workoutType === 'cardio',
      isStrength: action === 'strengthTraining' || options.workoutType === 'strength',
      isSleep: action === 'sleepLogged',
      isReading: action === 'bookCompleted' || action === 'articleRead',
      isDeepWork: action === 'deepWorkMinutes' || action === 'pomodoroCompleted',
      isMeditation: action === 'meditationCompleted',
      isWorkout: action === 'workoutCompleted',
      isPractice: action === 'practiceSession',
    });

    if (multiplier !== 1) {
      breakdown.push({
        source: `${tree} perk bonus`,
        value: `x${multiplier.toFixed(2)}`,
      });
    }
  }

  // Get flat bonuses for specific actions
  flatBonus = perkStore.getFlatBonus(action);
  if (flatBonus > 0) {
    breakdown.push({
      source: 'Perk flat bonus',
      value: `+${flatBonus}`,
    });
  }

  // Calculate synergy bonuses (XP to other trees)
  const synergyBonuses = [];
  if (tree) {
    const synergyTargets = getSynergyTargets(tree);
    synergyTargets.forEach(targetTree => {
      const synergyAmount = perkStore.getSynergyBonus(tree, targetTree);
      if (synergyAmount > 0) {
        const synergyXP = Math.floor(baseXP * synergyAmount);
        if (synergyXP > 0) {
          synergyBonuses.push({
            tree: targetTree,
            amount: synergyXP,
            percentage: synergyAmount,
          });
        }
      }
    });
  }

  const finalXP = Math.floor(baseXP * multiplier) + flatBonus;

  return {
    baseXP,
    finalXP,
    multiplier,
    flatBonus,
    breakdown,
    synergyBonuses,
    tree,
  };
}

/**
 * Get the synergy targets for a tree
 */
function getSynergyTargets(sourceTree) {
  const synergyMap = {
    body: ['mind', 'spirit', 'social'],
    mind: [],
    spirit: ['social'],
    wealth: ['mind'],
    social: ['craft', 'mind'],
    craft: ['wealth', 'social', 'mind'],
  };
  return synergyMap[sourceTree] || [];
}

/**
 * Get active keystones
 *
 * @returns {Array}
 */
export function getActiveKeystones() {
  const perkStore = usePerkStore.getState();
  return perkStore.activeEffects.keystones;
}

/**
 * Get unlocked titles
 *
 * @returns {Array}
 */
export function getUnlockedTitles() {
  const perkStore = usePerkStore.getState();
  return perkStore.activeEffects.unlockedTitles || [];
}

/**
 * Apply stat XP gain and update perks
 *
 * @param {string} stat - The stat to increase (body, mind, spirit, wealth, social, craft)
 * @param {number} xp - The XP amount to add
 */
export function addStatXP(stat, xp) {
  const perkStore = usePerkStore.getState();
  perkStore.addStatXP(stat, xp);
}

/**
 * Get the current XP multiplier for display purposes
 *
 * @param {string} activityType - The activity type
 * @returns {number}
 */
export function getDisplayMultiplier(activityType) {
  const perkStore = usePerkStore.getState();
  return perkStore.getXPMultiplier(activityType);
}

/**
 * Get perk summary for UI display
 *
 * @returns {Array}
 */
export function getPerkSummary() {
  const perkStore = usePerkStore.getState();
  return perkStore.getPerkSummary();
}

/**
 * Check if a specific perk is unlocked
 *
 * @param {string} perkId - The perk ID to check
 * @returns {boolean}
 */
export function isPerkUnlocked(perkId) {
  const perkStore = usePerkStore.getState();
  return perkStore.isPerkUnlocked(perkId);
}

/**
 * Get all perk effects summary for debugging/display
 *
 * @returns {object}
 */
export function getActiveEffects() {
  const perkStore = usePerkStore.getState();
  return perkStore.activeEffects;
}

/**
 * Calculate gold bonus for an action
 *
 * @param {string} action - The action type
 * @param {object} options - Additional options (e.g., duration for hourly bonuses)
 * @returns {number} Gold bonus amount
 */
export function calculateGoldBonus(action, options = {}) {
  const perkStore = usePerkStore.getState();
  const effects = perkStore.activeEffects;

  let gold = 0;

  switch (action) {
    case 'cardioCompleted':
      gold += effects.cardioGoldBonus || 0;
      break;
    case 'strengthTraining':
      gold += effects.strengthGoldBonus || 0;
      break;
    case 'workoutCompleted':
      gold += effects.workoutGoldBonus || 0;
      break;
    case 'bookCompleted':
    case 'articleRead':
      gold += effects.readingGoldBonus || 0;
      break;
    case 'deepWorkMinutes':
      if (options.duration >= 120) {
        gold += effects.flowSessionGold || 0;
      }
      break;
    case 'proteinGoalHit':
      gold += effects.perfectMacroGold || 0;
      break;
    case 'meditationCompleted':
      gold += effects.meditationGoldBonus || 0;
      if (options.duration >= 20) {
        gold += effects.deepMeditationGold || 0;
      }
      break;
    case 'incomeLogged':
      gold += effects.incomeLogGold || 0;
      break;
    case 'budgetFollowed':
      gold += effects.budgetAdherenceGold || 0;
      break;
    case 'savingsGoalCompleted':
      gold += effects.savingsMilestoneGold || 0;
      break;
    case 'portfolioGrowth':
      gold += effects.portfolioGrowthGold || 0;
      break;
    case 'conversationLogged':
      gold += effects.conversationGold || 0;
      break;
    case 'friendAdded':
      gold += effects.newConnectionGold || 0;
      break;
    case 'presentationGiven':
      gold += effects.speakingGold || 0;
      break;
    case 'relationshipMilestone':
      gold += effects.relationshipMilestoneGold || 0;
      break;
    case 'communityBuilding':
      gold += effects.communityGold || 0;
      break;
    case 'practiceSession':
      if (options.hours) {
        gold += (effects.practiceGoldPerHour || 0) * options.hours;
      }
      break;
    case 'projectCompleted':
      gold += effects.projectGold || 0;
      break;
    case 'feedbackReceived':
      gold += effects.feedbackGold || 0;
      break;
    default:
      break;
  }

  return Math.floor(gold);
}

/**
 * Calculate gem bonus for an action
 *
 * @param {string} action - The action type
 * @param {object} options - Additional options
 * @returns {number} Gem bonus amount
 */
export function calculateGemBonus(action, options = {}) {
  const perkStore = usePerkStore.getState();
  const effects = perkStore.activeEffects;

  let gems = 0;

  switch (action) {
    case 'passiveIncomeReceived':
      gems += effects.passiveIncomeGems || 0;
      break;
    default:
      break;
  }

  return Math.floor(gems);
}

export default {
  calculatePerkBonusXP,
  getActiveKeystones,
  getUnlockedTitles,
  addStatXP,
  getDisplayMultiplier,
  getPerkSummary,
  isPerkUnlocked,
  getActiveEffects,
  calculateGoldBonus,
  calculateGemBonus,
};
