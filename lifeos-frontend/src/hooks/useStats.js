/**
 * useStats Hook - Unified Stats System Integration
 *
 * Provides easy access to character stats, calculations, and utilities
 */

import { useMemo } from 'react';
import { useGamificationStore } from '../stores/gamificationStore';
import { usePetStore, PET_DATABASE } from '../stores/petStore';
import {
  calculateTotalStats,
  calculateStatBreakdown,
  calculateTotalPower,
  calculateBalanceScore,
  checkStatSynergies,
  getModuleXPMultiplier,
  STAT_CONFIG,
  STATS,
} from '../utils/statsSystem';

export function useStats() {
  const { equippedItems, level, unlockedAchievements } = useGamificationStore();
  const { activePets, ownedPets } = usePetStore();

  // Calculate level-based stat bonuses
  const levelBonus = useMemo(() => {
    // +2 to all stats every 5 levels
    const fiveLevelBonus = Math.floor(level / 5) * 2;
    return fiveLevelBonus;
  }, [level]);

  // Calculate achievement-based stat bonuses
  const achievementBonus = useMemo(() => {
    // Each achievement gives +1 to all stats
    return unlockedAchievements?.length || 0;
  }, [unlockedAchievements]);

  // Get equipped items (handle both dev and production formats)
  const equipment = useMemo(() => {
    if (!equippedItems) return [];

    return equippedItems.map(item => {
      // If item has equipment_items nested (production format)
      if (item.equipment_items) {
        return item.equipment_items;
      }
      // Otherwise it's already the equipment object (dev format)
      return item;
    });
  }, [equippedItems]);

  // Get active pet data
  const pets = useMemo(() => {
    return activePets
      .map(petId => PET_DATABASE[petId])
      .filter(Boolean);
  }, [activePets]);

  // Calculate total stats from all sources
  const stats = useMemo(() => {
    return calculateTotalStats({
      equipment,
      pets,
      achievements: achievementBonus,
      levelBonus,
    });
  }, [equipment, pets, achievementBonus, levelBonus]);

  // Calculate stat breakdown by source
  const statBreakdown = useMemo(() => {
    return calculateStatBreakdown({
      equipment,
      pets,
      achievements: achievementBonus,
      levelBonus,
    });
  }, [equipment, pets, achievementBonus, levelBonus]);

  // Calculate derived stats
  const totalPower = useMemo(() => calculateTotalPower(stats), [stats]);
  const balanceScore = useMemo(() => calculateBalanceScore(stats), [stats]);
  const synergies = useMemo(() => checkStatSynergies(stats), [stats]);

  // Get XP multipliers for each module
  const moduleMultipliers = useMemo(() => {
    return {
      productivity: getModuleXPMultiplier('productivity', stats),
      health: getModuleXPMultiplier('health', stats),
      knowledge: getModuleXPMultiplier('knowledge', stats),
      journal: getModuleXPMultiplier('journal', stats),
      finance: getModuleXPMultiplier('finance', stats),
      calendar: getModuleXPMultiplier('calendar', stats),
      skills: getModuleXPMultiplier('skills', stats),
    };
  }, [stats]);

  // Categorized stats
  const physicalStats = useMemo(() => ({
    strength: stats.strength,
    vitality: stats.vitality,
  }), [stats]);

  const mentalStats = useMemo(() => ({
    intelligence: stats.intelligence,
    wisdom: stats.wisdom,
  }), [stats]);

  return {
    // Raw stats
    stats,
    strength: stats.strength,
    vitality: stats.vitality,
    intelligence: stats.intelligence,
    wisdom: stats.wisdom,
    defense: stats.defense,

    // Categorized
    physicalStats,
    mentalStats,

    // Derived metrics
    totalPower,
    balanceScore,
    synergies,

    // Breakdowns
    statBreakdown,
    moduleMultipliers,

    // Utilities
    STAT_CONFIG,
    STATS,
  };
}

export default useStats;
