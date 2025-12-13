/**
 * usePerkFeatures - Hook for accessing perk bonuses and multipliers
 *
 * This hook provides easy access to perk effects throughout the app.
 * Note: Features are NOT gated behind perks - all features are accessible.
 * Perks only provide bonuses (XP, gold, gems, titles).
 */

import { useMemo } from 'react';
import usePerkStore from '../stores/perkStore';

/**
 * Main hook for accessing perk bonuses
 */
export function usePerkFeatures() {
  const { activeEffects, statLevels, unlockedPerksByTree } = usePerkStore();

  // Get all active multipliers for display
  const multipliers = useMemo(() => ({
    global: activeEffects.globalXpMultiplier,
    body: activeEffects.bodyXpMultiplier,
    mind: activeEffects.mindXpMultiplier,
    spirit: activeEffects.spiritXpMultiplier,
    wealth: activeEffects.wealthXpMultiplier,
    social: activeEffects.socialXpMultiplier,
    craft: activeEffects.craftXpMultiplier,
  }), [activeEffects]);

  // Get active keystones for display
  const keystones = activeEffects.keystones || [];

  // Get unlocked titles
  const unlockedTitles = useMemo(() => {
    return activeEffects.unlockedTitles || [];
  }, [activeEffects.unlockedTitles]);

  // Count unlocked perks by tree
  const perkCounts = useMemo(() => {
    const counts = {};
    Object.entries(unlockedPerksByTree).forEach(([tree, perks]) => {
      counts[tree] = perks.length;
    });
    return counts;
  }, [unlockedPerksByTree]);

  // Total unlocked perks
  const totalUnlockedPerks = useMemo(() => {
    return Object.values(perkCounts).reduce((sum, count) => sum + count, 0);
  }, [perkCounts]);

  // Get gold bonuses
  const goldBonuses = useMemo(() => ({
    workout: activeEffects.workoutGoldBonus || 0,
    cardio: activeEffects.cardioGoldBonus || 0,
    strength: activeEffects.strengthGoldBonus || 0,
    reading: activeEffects.readingGoldBonus || 0,
    flowSession: activeEffects.flowSessionGold || 0,
    perfectMacro: activeEffects.perfectMacroGold || 0,
    meditation: activeEffects.meditationGoldBonus || 0,
    deepMeditation: activeEffects.deepMeditationGold || 0,
    income: activeEffects.incomeLogGold || 0,
    budget: activeEffects.budgetAdherenceGold || 0,
    savings: activeEffects.savingsMilestoneGold || 0,
    portfolio: activeEffects.portfolioGrowthGold || 0,
    conversation: activeEffects.conversationGold || 0,
    newConnection: activeEffects.newConnectionGold || 0,
    speaking: activeEffects.speakingGold || 0,
    relationship: activeEffects.relationshipMilestoneGold || 0,
    community: activeEffects.communityGold || 0,
    practice: activeEffects.practiceGoldPerHour || 0,
    project: activeEffects.projectGold || 0,
    feedback: activeEffects.feedbackGold || 0,
  }), [activeEffects]);

  // Get gem bonuses
  const gemBonuses = useMemo(() => ({
    passiveIncome: activeEffects.passiveIncomeGems || 0,
  }), [activeEffects]);

  return {
    // Multipliers for display
    multipliers,

    // Active keystones
    keystones,

    // Unlocked titles
    unlockedTitles,

    // Stat levels
    statLevels,

    // Perk counts
    perkCounts,
    totalUnlockedPerks,

    // Currency bonuses
    goldBonuses,
    gemBonuses,

    // Raw effects data
    activeEffects,
  };
}

export default usePerkFeatures;
