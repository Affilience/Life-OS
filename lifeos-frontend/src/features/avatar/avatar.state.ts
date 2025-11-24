/**
 * Avatar State Mapping
 * Maps app state (level, XP, season, mood, streak) to Rive inputs
 */

import type { Season, Mood, AvatarStage } from './types';

/**
 * Map season to Rive variant number
 * discipline=0, ambition=1, focus=2, evolution=3, power=4
 */
export function mapSeasonToVariant(season?: Season): number {
  switch (season) {
    case "discipline": return 0;
    case "ambition":   return 1;
    case "focus":      return 2;
    case "evolution":  return 3;
    case "power":      return 4;
    default:           return 0;
  }
}

/**
 * Map mood to Rive variant number
 * calm=0, focused=1, stressed=2
 */
export function mapMoodToVariant(mood?: Mood): number {
  switch (mood) {
    case "calm":     return 0;
    case "focused":  return 1;
    case "stressed": return 2;
    default:         return 0;
  }
}

/**
 * Compute XP percentage (0..1) for current level
 */
export function computeXpPercent(xp: number, xpToNext: number): number {
  if (!xpToNext || xpToNext <= 0) return 0;
  return Math.max(0, Math.min(1, xp / xpToNext));
}

/**
 * Compute streak intensity (0..1) normalized to 30 days
 * 30+ days = max intensity
 */
export function computeStreakIntensity(streakDays?: number): number {
  if (!streakDays) return 0;
  return Math.max(0, Math.min(1, streakDays / 30));
}

/**
 * Map level to avatar stage
 * 1-10: Atom
 * 11-25: Orbit
 * 26-45: Molecule
 * 46-70: Proto-star
 * 71-100: Solar System
 * 101+: Galaxy
 */
export function getLevelStage(level: number): AvatarStage {
  if (level <= 10) return "atom";
  if (level <= 25) return "orbit";
  if (level <= 45) return "molecule";
  if (level <= 70) return "protostar";
  if (level <= 100) return "solar";
  return "galaxy";
}

/**
 * Get stage index (0-5) for animations
 */
export function getStageIndex(stage: AvatarStage): number {
  const stages: AvatarStage[] = ["atom", "orbit", "molecule", "protostar", "solar", "galaxy"];
  return stages.indexOf(stage);
}
