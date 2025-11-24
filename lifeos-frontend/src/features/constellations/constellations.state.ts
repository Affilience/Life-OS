/**
 * State management for constellation progression
 * Maps XP to unlocked stars without modifying existing module state
 */

import type { ModuleConstellation, ConstellationState } from './constellations.types';

/**
 * Calculate which stars are unlocked based on current XP
 * @param constellation - The constellation configuration
 * @param currentXp - User's current XP in this module
 * @returns State object with unlocked stars and progress
 */
export function getUnlockedStars(
  constellation: ModuleConstellation,
  currentXp: number
): ConstellationState {
  const unlockedStars = constellation.stars
    .filter(star => star.requirementXp <= currentXp)
    .map(star => star.id);

  const totalStars = constellation.stars.length;
  const progress = unlockedStars.length / totalStars;

  return {
    unlockedStars,
    totalStars,
    progress
  };
}

/**
 * Get the next star to unlock
 * @param constellation - The constellation configuration
 * @param currentXp - User's current XP in this module
 * @returns Next star data or null if all unlocked
 */
export function getNextStar(
  constellation: ModuleConstellation,
  currentXp: number
) {
  const lockedStars = constellation.stars
    .filter(star => star.requirementXp > currentXp)
    .sort((a, b) => a.requirementXp - b.requirementXp);

  return lockedStars[0] || null;
}

/**
 * Calculate XP needed for next star
 * @param constellation - The constellation configuration
 * @param currentXp - User's current XP in this module
 * @returns XP needed or 0 if all stars unlocked
 */
export function getXpToNextStar(
  constellation: ModuleConstellation,
  currentXp: number
): number {
  const nextStar = getNextStar(constellation, currentXp);
  return nextStar ? nextStar.requirementXp - currentXp : 0;
}

/**
 * Check if a specific star is unlocked
 * @param starId - Star ID to check
 * @param unlockedStars - Array of unlocked star IDs
 * @returns Whether the star is unlocked
 */
export function isStarUnlocked(starId: string, unlockedStars: string[]): boolean {
  return unlockedStars.includes(starId);
}

/**
 * Check if a link should be visible (both stars unlocked)
 * @param fromStarId - Source star ID
 * @param toStarId - Destination star ID
 * @param unlockedStars - Array of unlocked star IDs
 * @returns Whether the link should be visible
 */
export function isLinkVisible(
  fromStarId: string,
  toStarId: string,
  unlockedStars: string[]
): boolean {
  return isStarUnlocked(fromStarId, unlockedStars) && isStarUnlocked(toStarId, unlockedStars);
}
