/**
 * Perk Store - Manages perk tree unlocks and effects
 *
 * This store:
 * - Tracks which perks are unlocked based on stat levels
 * - Calculates active perk effects (XP bonuses, gold, gems, titles)
 * - Provides perk bonus calculations for the gamification system
 *
 * Note: Features are NOT gated behind perks. All app features are accessible.
 * Perks only provide bonuses (XP multipliers, gold, gems, titles).
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PERK_TREES } from '../data/perkTrees';
import { supabase, getCurrentUserId } from '../lib/supabase';

// Lazy import unlock service to avoid circular dependencies
let unlockServiceRef = null;
const getUnlockService = async () => {
  if (!unlockServiceRef) {
    const module = await import('../services/unlockService');
    unlockServiceRef = module.default;
  }
  return unlockServiceRef;
};

// Map stats to perk tree IDs
const STAT_TO_TREE_MAP = {
  body: 'body',
  mind: 'mind',
  spirit: 'spirit',
  wealth: 'wealth',
  social: 'social',
  craft: 'craft',
};

// Default stat levels (1-100 scale)
const DEFAULT_STATS = {
  body: 1,
  mind: 1,
  spirit: 1,
  wealth: 1,
  social: 1,
  craft: 1,
};

/**
 * Check if a perk is unlocked based on user level and prerequisites
 */
function isPerkUnlocked(perk, userLevel, unlockedPerkIds) {
  // Check level requirement
  if (userLevel < perk.level) return false;

  // Check prerequisites
  if (perk.prerequisites.length === 0) return true;

  return perk.prerequisites.every(prereqId => unlockedPerkIds.has(prereqId));
}

/**
 * Get all unlocked perks for a tree
 */
function getUnlockedPerksForTree(tree, userLevel) {
  const perks = tree.perks || [];
  const unlockedIds = new Set();

  // Multiple passes to handle prerequisite chains
  let changed = true;
  while (changed) {
    changed = false;
    for (const perk of perks) {
      if (unlockedIds.has(perk.id)) continue;
      if (isPerkUnlocked(perk, userLevel, unlockedIds)) {
        unlockedIds.add(perk.id);
        changed = true;
      }
    }
  }

  return Array.from(unlockedIds);
}

/**
 * Calculate all active effects from unlocked perks
 */
function calculateActiveEffects(unlockedPerksByTree) {
  const effects = {
    // XP Multipliers
    globalXpMultiplier: 1.0,
    bodyXpMultiplier: 1.0,
    mindXpMultiplier: 1.0,
    spiritXpMultiplier: 1.0,
    wealthXpMultiplier: 1.0,
    socialXpMultiplier: 1.0,
    craftXpMultiplier: 1.0,

    // Category-specific bonuses
    cardioXpBonus: 0,
    strengthXpBonus: 0,
    sleepXpBonus: 0,
    readingXpBonus: 0,
    deepWorkXpBonus: 0,
    meditationXpBonus: 0,
    mealLogXpBonus: 0,
    yogaXpBonus: 0,
    journalStreakBonus: 0,
    eventXpBonus: 0,
    listeningXpBonus: 0,
    incomeXpBonus: 0,
    savingsXpBonus: 0,

    // Streak bonuses
    streakBonusPerDay: 0,
    streakBonusMax: 0,

    // Cross-stat synergy bonuses
    mindXpFromBody: 0,
    spiritXpFromBody: 0,
    socialXpFromBody: 0,
    socialXpFromSpirit: 0,
    craftXpFromSocial: 0,
    mindXpFromSocial: 0,
    wealthXpFromCraft: 0,
    socialXpFromCraft: 0,
    mindXpFromCraft: 0,
    mindXpFromWealth: 0,

    // Unlocked titles
    unlockedTitles: [],

    // Gold bonuses
    cardioGoldBonus: 0,
    strengthGoldBonus: 0,
    readingGoldBonus: 0,
    flowSessionGold: 0,
    perfectMacroGold: 0,
    meditationGoldBonus: 0,
    deepMeditationGold: 0,
    incomeLogGold: 0,
    budgetAdherenceGold: 0,
    savingsMilestoneGold: 0,
    portfolioGrowthGold: 0,
    conversationGold: 0,
    newConnectionGold: 0,
    speakingGold: 0,
    relationshipMilestoneGold: 0,
    communityGold: 0,
    practiceGoldPerHour: 0,
    projectGold: 0,
    feedbackGold: 0,
    wealthMilestoneGold: 0,
    milestoneGold: 0,
    financialGoldBonus: 0,
    skillMilestoneGold: 0,

    // Gem bonuses
    passiveIncomeGems: 0,

    // Special bonuses
    intenseWorkoutMultiplier: 1,
    longSessionMultiplier: 1,
    longMeditationMultiplier: 1,
    flowMultiplier: 1,

    // Bonus XP for specific actions
    noteXp: 0,
    journalXp: 0,
    gratitudeXp: 0,
    conversationXp: 0,
    projectXp: 0,
    macroGoalBonusXp: 0,
    sleepBonusXp: 0,
    bookCompletionBonusXp: 0,
    weeklyReflectionXp: 0,
    monthlyReviewBonusXp: 0,
    zenMeditationXp: 0,
    innovationXp: 0,
    moodTrackingXp: 0,
    emotionalInsightXp: 0,
    eventXp: 0,
    listeningXp: 0,
    tripleGratitudeXp: 0,
    investmentXp: 0,
    newConnectionXp: 0,
    presentationXp: 0,
    mentoringXp: 0,
    communityXp: 0,

    // Keystones and special effects
    keystones: [],
  };

  // Process each tree's perks
  Object.entries(unlockedPerksByTree).forEach(([treeId, perkIds]) => {
    const tree = PERK_TREES[treeId];
    if (!tree) return;

    perkIds.forEach(perkId => {
      const perk = tree.perks.find(p => p.id === perkId);
      if (!perk || !perk.effect) return;

      const effect = perk.effect;

      // Global XP multiplier (applies to base multiplier)
      if (effect.xpMultiplier) {
        effects.globalXpMultiplier *= effect.xpMultiplier;
      }

      // Tree-specific multipliers
      if (effect.bodyXpMultiplier) {
        effects.bodyXpMultiplier *= effect.bodyXpMultiplier;
      }
      if (effect.mindXpMultiplier) {
        effects.mindXpMultiplier *= effect.mindXpMultiplier;
      }
      if (effect.spiritXpMultiplier) {
        effects.spiritXpMultiplier *= effect.spiritXpMultiplier;
      }
      if (effect.wealthXpMultiplier) {
        effects.wealthXpMultiplier *= effect.wealthXpMultiplier;
      }
      if (effect.socialXpMultiplier) {
        effects.socialXpMultiplier *= effect.socialXpMultiplier;
      }
      if (effect.craftXpMultiplier) {
        effects.craftXpMultiplier *= effect.craftXpMultiplier;
      }

      // Category bonuses (additive)
      if (effect.cardioXpBonus) effects.cardioXpBonus += effect.cardioXpBonus;
      if (effect.strengthXpBonus) effects.strengthXpBonus += effect.strengthXpBonus;
      if (effect.sleepXpBonus) effects.sleepXpBonus += effect.sleepXpBonus;
      if (effect.readingXpBonus) effects.readingXpBonus += effect.readingXpBonus;
      if (effect.deepWorkXpBonus) effects.deepWorkXpBonus += effect.deepWorkXpBonus;
      if (effect.meditationXpBonus) effects.meditationXpBonus += effect.meditationXpBonus;
      if (effect.mealLogXpBonus) effects.mealLogXpBonus += effect.mealLogXpBonus;
      if (effect.yogaXpBonus) effects.yogaXpBonus += effect.yogaXpBonus;
      if (effect.journalStreakBonus) effects.journalStreakBonus += effect.journalStreakBonus;
      if (effect.eventXpBonus) effects.eventXpBonus += effect.eventXpBonus;
      if (effect.listeningXpBonus) effects.listeningXpBonus += effect.listeningXpBonus;
      if (effect.incomeXpBonus) effects.incomeXpBonus += effect.incomeXpBonus;
      if (effect.savingsXpBonus) effects.savingsXpBonus += effect.savingsXpBonus;
      if (effect.allWorkoutsBonus) effects.cardioXpBonus += effect.allWorkoutsBonus;
      if (effect.allWorkoutsBonus) effects.strengthXpBonus += effect.allWorkoutsBonus;
      if (effect.globalXpBonus) effects.globalXpMultiplier += effect.globalXpBonus;
      if (effect.spiritXpBonus) effects.spiritXpMultiplier += effect.spiritXpBonus;
      if (effect.socialXpBonus) effects.socialXpFromSpirit += effect.socialXpBonus;
      if (effect.practiceXpBonus) effects.craftXpMultiplier += effect.practiceXpBonus;
      if (effect.learningMultiplier) effects.mindXpMultiplier *= effect.learningMultiplier;
      if (effect.craftXpMultiplier) effects.craftXpMultiplier *= effect.craftXpMultiplier;
      if (effect.incomeXpMultiplier) effects.wealthXpMultiplier *= effect.incomeXpMultiplier;

      // Cross-stat synergy bonuses
      if (effect.mindXpBonus && treeId === 'body') effects.mindXpFromBody += effect.mindXpBonus;
      if (effect.spiritXpBonus && treeId === 'body') effects.spiritXpFromBody += effect.spiritXpBonus;
      if (effect.socialXpBonus && treeId === 'body') effects.socialXpFromBody += effect.socialXpBonus;
      if (effect.socialXpBonus && treeId === 'spirit') effects.socialXpFromSpirit += effect.socialXpBonus;
      if (effect.craftXpBonus && treeId === 'social') effects.craftXpFromSocial += effect.craftXpBonus;
      if (effect.mindXpBonus && treeId === 'social') effects.mindXpFromSocial += effect.mindXpBonus;
      if (effect.wealthXpBonus && treeId === 'craft') effects.wealthXpFromCraft += effect.wealthXpBonus;
      if (effect.socialXpBonus && treeId === 'craft') effects.socialXpFromCraft += effect.socialXpBonus;
      if (effect.mindXpBonus && treeId === 'craft') effects.mindXpFromCraft += effect.mindXpBonus;
      if (effect.mindXpBonus && treeId === 'wealth') effects.mindXpFromWealth += effect.mindXpBonus;

      // Streak bonuses (take the highest)
      if (effect.streakBonusPerDay) {
        effects.streakBonusPerDay = Math.max(effects.streakBonusPerDay, effect.streakBonusPerDay);
      }
      if (effect.streakBonusMax) {
        effects.streakBonusMax = Math.max(effects.streakBonusMax, effect.streakBonusMax);
      }

      // Special multipliers
      if (effect.intenseWorkoutMultiplier) {
        effects.intenseWorkoutMultiplier = Math.max(effects.intenseWorkoutMultiplier, effect.intenseWorkoutMultiplier);
      }
      if (effect.longSessionMultiplier) {
        effects.longSessionMultiplier = Math.max(effects.longSessionMultiplier, effect.longSessionMultiplier);
      }
      if (effect.longMeditationMultiplier) {
        effects.longMeditationMultiplier = Math.max(effects.longMeditationMultiplier, effect.longMeditationMultiplier);
      }
      if (effect.flowMultiplier) {
        effects.flowMultiplier = Math.max(effects.flowMultiplier, effect.flowMultiplier);
      }
      if (effect.marathonMultiplier) {
        effects.longSessionMultiplier = Math.max(effects.longSessionMultiplier, effect.marathonMultiplier);
      }

      // Flat XP bonuses
      if (effect.noteXp) effects.noteXp += effect.noteXp;
      if (effect.noteLinkBonusXp) effects.noteXp += effect.noteLinkBonusXp;
      if (effect.journalXp) effects.journalXp += effect.journalXp;
      if (effect.gratitudeXp) effects.gratitudeXp += effect.gratitudeXp;
      if (effect.conversationXp) effects.conversationXp += effect.conversationXp;
      if (effect.projectXp) effects.projectXp += effect.projectXp;
      if (effect.linkNotesXp) effects.noteXp += effect.linkNotesXp;
      if (effect.newConnectionXp) effects.newConnectionXp += effect.newConnectionXp;
      if (effect.macroGoalBonusXp) effects.macroGoalBonusXp += effect.macroGoalBonusXp;
      if (effect.sleepBonusXp) effects.sleepBonusXp += effect.sleepBonusXp;
      if (effect.bookCompletionBonus) effects.bookCompletionBonusXp += effect.bookCompletionBonus;
      if (effect.weeklyReflectionXp) effects.weeklyReflectionXp += effect.weeklyReflectionXp;
      if (effect.monthlyReviewBonus) effects.monthlyReviewBonusXp += effect.monthlyReviewBonus;
      if (effect.zenMeditationXp) effects.zenMeditationXp += effect.zenMeditationXp;
      if (effect.innovationXp) effects.innovationXp += effect.innovationXp;
      if (effect.moodTrackingXp) effects.moodTrackingXp += effect.moodTrackingXp;
      if (effect.emotionalInsightXp) effects.emotionalInsightXp += effect.emotionalInsightXp;
      if (effect.eventXp) effects.eventXp += effect.eventXp;
      if (effect.listeningXp) effects.listeningXp += effect.listeningXp;
      if (effect.tripleGratitudeXp) effects.tripleGratitudeXp += effect.tripleGratitudeXp;
      if (effect.investmentXp) effects.investmentXp += effect.investmentXp;
      if (effect.presentationXp) effects.presentationXp += effect.presentationXp;
      if (effect.mentoringXp) effects.mentoringXp += effect.mentoringXp;
      if (effect.communityXp) effects.communityXp += effect.communityXp;

      // Title unlocks
      if (effect.unlockTitle) {
        effects.unlockedTitles.push(effect.unlockTitle);
      }

      // Gold bonuses
      if (effect.cardioGoldBonus) effects.cardioGoldBonus += effect.cardioGoldBonus;
      if (effect.strengthGoldBonus) effects.strengthGoldBonus += effect.strengthGoldBonus;
      if (effect.readingGoldBonus) effects.readingGoldBonus += effect.readingGoldBonus;
      if (effect.flowSessionGold) effects.flowSessionGold += effect.flowSessionGold;
      if (effect.perfectMacroGold) effects.perfectMacroGold += effect.perfectMacroGold;
      if (effect.meditationGoldBonus) effects.meditationGoldBonus += effect.meditationGoldBonus;
      if (effect.deepMeditationGold) effects.deepMeditationGold += effect.deepMeditationGold;
      if (effect.incomeLogGold) effects.incomeLogGold += effect.incomeLogGold;
      if (effect.budgetAdherenceGold) effects.budgetAdherenceGold += effect.budgetAdherenceGold;
      if (effect.savingsMilestoneGold) effects.savingsMilestoneGold += effect.savingsMilestoneGold;
      if (effect.portfolioGrowthGold) effects.portfolioGrowthGold += effect.portfolioGrowthGold;
      if (effect.conversationGold) effects.conversationGold += effect.conversationGold;
      if (effect.newConnectionGold) effects.newConnectionGold += effect.newConnectionGold;
      if (effect.speakingGold) effects.speakingGold += effect.speakingGold;
      if (effect.relationshipMilestoneGold) effects.relationshipMilestoneGold += effect.relationshipMilestoneGold;
      if (effect.communityGold) effects.communityGold += effect.communityGold;
      if (effect.practiceGoldPerHour) effects.practiceGoldPerHour += effect.practiceGoldPerHour;
      if (effect.projectGold) effects.projectGold += effect.projectGold;
      if (effect.feedbackGold) effects.feedbackGold += effect.feedbackGold;
      if (effect.wealthMilestoneGold) effects.wealthMilestoneGold += effect.wealthMilestoneGold;
      if (effect.milestoneGold) effects.milestoneGold += effect.milestoneGold;
      if (effect.financialGoldBonus) effects.financialGoldBonus += effect.financialGoldBonus;
      if (effect.skillMilestoneGold) effects.skillMilestoneGold += effect.skillMilestoneGold;

      // Gem bonuses
      if (effect.passiveIncomeGems) effects.passiveIncomeGems += effect.passiveIncomeGems;

      // Track keystones
      if (perk.type === 'keystone') {
        effects.keystones.push({
          id: perk.id,
          name: perk.name,
          tree: treeId,
          effect: perk.effect,
        });
      }
    });
  });

  return effects;
}

const usePerkStore = create(
  persist(
    (set, get) => ({
      // Loading state for Supabase sync
      isLoading: false,
      isSynced: false,

      // Initialize from Supabase
      initializeFromSupabase: async () => {
        set({ isLoading: true });
        try {
          const userId = await getCurrentUserId();
          if (!userId) {
            console.warn('No user ID found, using localStorage only');
            set({ isLoading: false });
            return;
          }

          // Load user's perks from database
          const { data: userPerks, error } = await supabase
            .from('user_perks')
            .select('*')
            .eq('user_id', userId);

          if (error) throw error;

          if (userPerks && userPerks.length > 0) {
            // Convert database records to our format
            const unlockedPerksByTree = {
              body: [],
              mind: [],
              spirit: [],
              wealth: [],
              social: [],
              craft: [],
            };

            userPerks.forEach(up => {
              // perk_id stores the full perk ID like 'body_foundation'
              const perkId = up.perk_id;
              // Extract tree from perk ID (e.g., 'body' from 'body_foundation')
              const tree = perkId.split('_')[0];
              if (unlockedPerksByTree[tree]) {
                unlockedPerksByTree[tree].push(perkId);
              }
            });

            // Load stat levels from user_stats if available
            const { data: userStats, error: statsError } = await supabase
              .from('user_stats')
              .select('*')
              .eq('user_id', userId)
              .maybeSingle();

            const newStatLevels = { ...DEFAULT_STATS };
            if (userStats && !statsError) {
              if (userStats.body) newStatLevels.body = userStats.body;
              if (userStats.mind) newStatLevels.mind = userStats.mind;
              if (userStats.spirit) newStatLevels.spirit = userStats.spirit;
              if (userStats.wealth) newStatLevels.wealth = userStats.wealth;
              if (userStats.social) newStatLevels.social = userStats.social;
              if (userStats.craft) newStatLevels.craft = userStats.craft;
            }

            const activeEffects = calculateActiveEffects(unlockedPerksByTree);

            set({
              unlockedPerksByTree,
              statLevels: newStatLevels,
              activeEffects,
              isSynced: true,
              isLoading: false,
            });
          } else {
            set({ isSynced: true, isLoading: false });
          }
        } catch (error) {
          console.error('Error initializing perks from Supabase:', error);
          set({ isLoading: false });
        }
      },

      // Save a newly unlocked perk to Supabase
      savePerkToSupabase: async (perkId, treeId) => {
        try {
          const userId = await getCurrentUserId();
          if (!userId) return;

          await supabase.from('user_perks').upsert({
            user_id: userId,
            perk_id: perkId,
            tree_name: treeId,
            current_rank: 1,
            is_active: true,
            unlocked_at: new Date().toISOString(),
          }, { onConflict: 'user_id,perk_id' });

          // Log to timeline
          const tree = PERK_TREES[treeId];
          const perk = tree?.perks?.find(p => p.id === perkId);
          if (perk) {
            await supabase.from('timeline').insert({
              user_id: userId,
              module: 'perks',
              entry_type: 'perk_unlocked',
              title: `Perk Unlocked: ${perk.name}`,
              description: perk.description || `Unlocked ${perk.name} in ${tree.name} tree`,
              metadata: {
                perk_id: perkId,
                tree_id: treeId,
                perk_name: perk.name,
                effect: perk.effect,
              },
            });
          }
        } catch (error) {
          console.error('Error saving perk to Supabase:', error);
        }
      },

      // User's stat levels (1-100)
      statLevels: { ...DEFAULT_STATS },

      // Unlocked perks by tree { body: ['body_foundation', ...], ... }
      unlockedPerksByTree: {
        body: [],
        mind: [],
        spirit: [],
        wealth: [],
        social: [],
        craft: [],
      },

      // Calculated active effects from all perks
      activeEffects: calculateActiveEffects({
        body: [],
        mind: [],
        spirit: [],
        wealth: [],
        social: [],
        craft: [],
      }),

      // Last calculation timestamp
      lastCalculated: null,

      /**
       * Update a stat level and recalculate unlocked perks
       */
      setStatLevel: async (stat, level) => {
        const newStatLevels = {
          ...get().statLevels,
          [stat]: Math.max(1, Math.min(100, level)),
        };

        set({ statLevels: newStatLevels });
        get().recalculatePerks();

        // Sync to Supabase
        get().syncStatLevelToSupabase(stat, newStatLevels[stat]);
      },

      /**
       * Sync stat level to Supabase user_stats table
       */
      syncStatLevelToSupabase: async (stat, level) => {
        try {
          const userId = await getCurrentUserId();
          if (!userId) return;

          await supabase
            .from('user_stats')
            .upsert({
              user_id: userId,
              [stat]: level,
              updated_at: new Date().toISOString(),
            }, { onConflict: 'user_id' });
        } catch (error) {
          console.error('Error syncing stat level to Supabase:', error);
        }
      },

      /**
       * Add XP to a stat (converts XP to level)
       * Uses: level = floor(sqrt(xp / 10))
       */
      addStatXP: (stat, xp) => {
        const currentLevel = get().statLevels[stat] || 1;
        // Simple XP to level: every 100 XP = 1 level
        const xpPerLevel = 100;
        const levelGain = xp / xpPerLevel;
        const newLevel = Math.min(100, currentLevel + levelGain);

        get().setStatLevel(stat, Math.floor(newLevel));
      },

      /**
       * Recalculate all unlocked perks based on current stat levels
       */
      recalculatePerks: () => {
        const { statLevels, unlockedPerksByTree: previousUnlockedPerks } = get();
        const newUnlockedPerksByTree = {};

        // Calculate unlocked perks for each tree
        Object.entries(PERK_TREES).forEach(([treeId, tree]) => {
          const stat = treeId; // Tree ID matches stat name
          const userLevel = statLevels[stat] || 1;
          newUnlockedPerksByTree[treeId] = getUnlockedPerksForTree(tree, userLevel);
        });

        // Calculate active effects
        const newActiveEffects = calculateActiveEffects(newUnlockedPerksByTree);

        // Detect newly unlocked perks
        const newlyUnlockedPerks = [];
        Object.entries(newUnlockedPerksByTree).forEach(([treeId, perkIds]) => {
          const previousPerkIds = new Set(previousUnlockedPerks[treeId] || []);
          perkIds.forEach(perkId => {
            if (!previousPerkIds.has(perkId)) {
              newlyUnlockedPerks.push({ perkId, treeId, treeLevel: statLevels[treeId] || 1 });
            }
          });
        });

        set({
          unlockedPerksByTree: newUnlockedPerksByTree,
          activeEffects: newActiveEffects,
          lastCalculated: Date.now(),
        });

        // Trigger unlock service and save to Supabase for newly unlocked perks
        if (newlyUnlockedPerks.length > 0) {
          (async () => {
            const unlockService = await getUnlockService();
            for (const { perkId, treeId, treeLevel } of newlyUnlockedPerks) {
              // Save to Supabase
              await get().savePerkToSupabase(perkId, treeId);
              // Trigger unlock notifications
              await unlockService.onPerkUnlock(perkId, treeId, treeLevel);
            }
          })();
        }

        return newActiveEffects;
      },

      /**
       * Check if a specific perk is unlocked
       */
      isPerkUnlocked: (perkId) => {
        const { unlockedPerksByTree } = get();
        return Object.values(unlockedPerksByTree).some(perks => perks.includes(perkId));
      },

      /**
       * Get XP multiplier for a specific activity type
       */
      getXPMultiplier: (activityType, options = {}) => {
        const effects = get().activeEffects;
        let multiplier = effects.globalXpMultiplier;

        // Tree-specific multipliers
        switch (activityType) {
          case 'body':
          case 'workout':
          case 'fitness':
          case 'health':
            multiplier *= effects.bodyXpMultiplier;
            break;
          case 'mind':
          case 'knowledge':
          case 'learning':
          case 'reading':
            multiplier *= effects.mindXpMultiplier;
            break;
          case 'spirit':
          case 'journal':
          case 'meditation':
          case 'mindfulness':
            multiplier *= effects.spiritXpMultiplier;
            break;
          case 'wealth':
          case 'financial':
          case 'finance':
            multiplier *= effects.wealthXpMultiplier;
            break;
          case 'social':
            multiplier *= effects.socialXpMultiplier;
            break;
          case 'craft':
          case 'skills':
          case 'practice':
            multiplier *= effects.craftXpMultiplier;
            break;
        }

        // Category-specific bonuses
        if (options.isCardio) multiplier += effects.cardioXpBonus;
        if (options.isStrength) multiplier += effects.strengthXpBonus;
        if (options.isSleep) multiplier += effects.sleepXpBonus;
        if (options.isReading) multiplier += effects.readingXpBonus;
        if (options.isDeepWork) multiplier += effects.deepWorkXpBonus;
        if (options.isMeditation) multiplier += effects.meditationXpBonus;
        if (options.isMealLog) multiplier += effects.mealLogXpBonus;
        if (options.isYoga) multiplier += effects.yogaXpBonus;
        if (options.isEvent) multiplier += effects.eventXpBonus;
        if (options.isListening) multiplier += effects.listeningXpBonus;
        if (options.isIncome) multiplier += effects.incomeXpBonus;
        if (options.isSavings) multiplier += effects.savingsXpBonus;

        // Journal streak bonus
        if (options.isJournal && options.journalStreak) {
          multiplier += effects.journalStreakBonus;
        }

        // Duration-based multipliers
        if (options.durationMinutes) {
          // Intense workout (>45 min)
          if (options.isWorkout && options.durationMinutes > 45) {
            multiplier *= effects.intenseWorkoutMultiplier;
          }
          // Long deep work session (2+ hours)
          if (options.isDeepWork && options.durationMinutes >= 120) {
            multiplier *= effects.longSessionMultiplier;
          }
          // Long meditation (20+ min)
          if (options.isMeditation && options.durationMinutes >= 20) {
            multiplier *= effects.longMeditationMultiplier;
          }
          // Creative flow (2+ hours)
          if (options.isPractice && options.durationMinutes >= 120) {
            multiplier *= effects.flowMultiplier;
          }
          // Marathon deep work (4+ hours)
          if (options.isDeepWork && options.durationMinutes >= 240) {
            multiplier *= effects.longSessionMultiplier; // Already includes marathon
          }
        }

        // Streak bonus
        if (options.currentStreak && options.currentStreak > 0) {
          const streakBonus = Math.min(
            options.currentStreak * effects.streakBonusPerDay,
            effects.streakBonusMax
          );
          multiplier += streakBonus;
        }

        return multiplier;
      },

      /**
       * Get synergy XP bonus for cross-stat activities
       */
      getSynergyBonus: (sourceTree, targetTree) => {
        const effects = get().activeEffects;

        // Body -> Mind, Spirit, Social
        if (sourceTree === 'body' && targetTree === 'mind') return effects.mindXpFromBody;
        if (sourceTree === 'body' && targetTree === 'spirit') return effects.spiritXpFromBody;
        if (sourceTree === 'body' && targetTree === 'social') return effects.socialXpFromBody;

        // Spirit -> Social
        if (sourceTree === 'spirit' && targetTree === 'social') return effects.socialXpFromSpirit;

        // Social -> Craft, Mind
        if (sourceTree === 'social' && targetTree === 'craft') return effects.craftXpFromSocial;
        if (sourceTree === 'social' && targetTree === 'mind') return effects.mindXpFromSocial;

        // Craft -> Wealth, Social, Mind
        if (sourceTree === 'craft' && targetTree === 'wealth') return effects.wealthXpFromCraft;
        if (sourceTree === 'craft' && targetTree === 'social') return effects.socialXpFromCraft;
        if (sourceTree === 'craft' && targetTree === 'mind') return effects.mindXpFromCraft;

        // Wealth -> Mind
        if (sourceTree === 'wealth' && targetTree === 'mind') return effects.mindXpFromWealth;

        return 0;
      },

      /**
       * Get flat XP bonus for specific actions
       */
      getFlatBonus: (actionType, options = {}) => {
        const effects = get().activeEffects;

        switch (actionType) {
          case 'noteCreated':
          case 'noteTaken':
            return effects.noteXp;
          case 'journalEntry':
            return effects.journalXp;
          case 'gratitudeLogged':
            // Triple gratitude bonus (3+ gratitudes per day)
            if (options.gratitudeCount >= 3) {
              return effects.gratitudeXp + effects.tripleGratitudeXp;
            }
            return effects.gratitudeXp;
          case 'conversation':
          case 'friendAdded':
            return effects.newConnectionXp || effects.conversationXp;
          case 'projectCompleted':
            return effects.projectXp;
          case 'proteinGoalHit':
          case 'macroGoalHit':
            return effects.macroGoalBonusXp;
          case 'sleepLogged':
            // Bonus for 8hr sleep
            if (options.sleepHours >= 8) {
              return effects.sleepBonusXp;
            }
            return 0;
          case 'bookCompleted':
            return effects.bookCompletionBonusXp;
          case 'weeklyReflection':
          case 'reflectionCompleted':
            return effects.weeklyReflectionXp;
          case 'monthlyReview':
            return effects.monthlyReviewBonusXp;
          case 'meditationCompleted':
            // Zen meditation bonus (60+ minutes)
            if (options.durationMinutes >= 60) {
              return effects.zenMeditationXp;
            }
            return 0;
          case 'innovationCreated':
          case 'originalWorkCreated':
            return effects.innovationXp;
          case 'moodLogged':
            return effects.moodTrackingXp + (options.hasInsight ? effects.emotionalInsightXp : 0);
          case 'eventAttended':
            return effects.eventXp;
          case 'activeListening':
            return effects.listeningXp;
          case 'investmentMade':
            return effects.investmentXp;
          case 'presentationGiven':
            return effects.presentationXp;
          case 'mentoring':
            return effects.mentoringXp;
          case 'communityBuilding':
            return effects.communityXp;
          default:
            return 0;
        }
      },

      /**
       * Get summary of all unlocked perks
       */
      getPerkSummary: () => {
        const { unlockedPerksByTree, statLevels } = get();

        return Object.entries(PERK_TREES).map(([treeId, tree]) => {
          const unlockedIds = unlockedPerksByTree[treeId] || [];
          const totalPerks = tree.perks.length;
          const unlockedPerks = tree.perks.filter(p => unlockedIds.includes(p.id));

          return {
            id: treeId,
            name: tree.name,
            color: tree.color,
            level: statLevels[treeId] || 1,
            totalPerks,
            unlockedCount: unlockedPerks.length,
            unlockedPerks,
            progress: Math.round((unlockedPerks.length / totalPerks) * 100),
          };
        });
      },

      /**
       * Initialize with stat levels from external source
       */
      initializeFromStats: (stats) => {
        const newStatLevels = { ...DEFAULT_STATS };

        // Map various stat formats to our 6 stats
        if (stats) {
          // Direct mapping if available
          if (stats.body !== undefined) newStatLevels.body = stats.body;
          if (stats.mind !== undefined) newStatLevels.mind = stats.mind;
          if (stats.spirit !== undefined) newStatLevels.spirit = stats.spirit;
          if (stats.wealth !== undefined) newStatLevels.wealth = stats.wealth;
          if (stats.social !== undefined) newStatLevels.social = stats.social;
          if (stats.craft !== undefined) newStatLevels.craft = stats.craft;

          // Derive from related stats if primary not available
          if (stats.strength !== undefined && newStatLevels.body === 1) {
            newStatLevels.body = Math.max(newStatLevels.body, stats.strength);
          }
          if (stats.vitality !== undefined && newStatLevels.body === 1) {
            newStatLevels.body = Math.max(newStatLevels.body, stats.vitality);
          }
          if (stats.intelligence !== undefined && newStatLevels.mind === 1) {
            newStatLevels.mind = Math.max(newStatLevels.mind, stats.intelligence);
          }
          if (stats.wisdom !== undefined && newStatLevels.spirit === 1) {
            newStatLevels.spirit = Math.max(newStatLevels.spirit, stats.wisdom);
          }
        }

        set({ statLevels: newStatLevels });
        get().recalculatePerks();
      },

      /**
       * Reset all perks
       */
      reset: () => {
        set({
          statLevels: { ...DEFAULT_STATS },
          unlockedPerksByTree: {
            body: [],
            mind: [],
            spirit: [],
            wealth: [],
            social: [],
            craft: [],
          },
          activeEffects: calculateActiveEffects({
            body: [],
            mind: [],
            spirit: [],
            wealth: [],
            social: [],
            craft: [],
          }),
          lastCalculated: null,
        });
      },
    }),
    {
      name: 'lifeos-perks-storage',
      partialize: (state) => ({
        statLevels: state.statLevels,
        unlockedPerksByTree: state.unlockedPerksByTree,
        lastCalculated: state.lastCalculated,
      }),
      onRehydrate: () => (state) => {
        // Recalculate effects after rehydration
        if (state) {
          setTimeout(() => {
            state.recalculatePerks();
          }, 0);
        }
      },
    }
  )
);

// Export initialization function - loads from Supabase first, then applies any provided stats
export const initializePerkStore = async (stats) => {
  const store = usePerkStore.getState();

  // First, load from Supabase
  await store.initializeFromSupabase();

  // Then apply any additional stats if provided
  if (stats) {
    store.initializeFromStats(stats);
  }
};

export default usePerkStore;
