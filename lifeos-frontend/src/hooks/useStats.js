/**
 * useStats Hook - Unified Stats System Integration
 *
 * Provides easy access to character stats, calculations, and utilities
 * 7 Stat Sources: Base, Allocated Points, Equipment, Pets, Perks, Achievements, Module Mastery
 */

import { useMemo } from 'react';
import { useGamificationStore } from '../stores/gamificationStore';
import { useAvatarStore } from '../stores/avatarStore';
import { usePetStore, PET_DATABASE } from '../stores/petStore';
import { useSkillPointsStore } from '../stores/skillPointsStore';
import usePerkStore from '../stores/perkStore';
import { useModuleMasteryStore } from '../stores/moduleMasteryStore';
import { EQUIPMENT_DATABASE } from '../data/equipmentDatabase';
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

// Perk stat bonuses mapping (synced with database perk_stat_bonuses table)
const PERK_STAT_BONUSES = {
  body_foundation: { strength: 2, vitality: 2 },
  body_endurance_1: { vitality: 5 },
  body_strength_1: { strength: 5 },
  body_peak_performance: { strength: 10, vitality: 10 },
  body_superhuman: { strength: 20, vitality: 15, defense: 5 },
  mind_foundation: { intelligence: 2, wisdom: 2 },
  mind_focus_1: { wisdom: 5 },
  mind_intellect_1: { intelligence: 5 },
  mind_genius: { intelligence: 15, wisdom: 5 },
  mind_infinite: { intelligence: 25, wisdom: 10 },
  spirit_foundation: { vitality: 2, wisdom: 2 },
  spirit_harmony: { vitality: 5, intelligence: 2, wisdom: 5, defense: 2 },
  spirit_transcendence: { vitality: 15, intelligence: 5, wisdom: 20 },
  wealth_foundation: { wisdom: 2, defense: 2 },
  wealth_prosperity: { intelligence: 5, wisdom: 5, defense: 10 },
  wealth_abundance: { intelligence: 5, wisdom: 10, defense: 20 },
  social_foundation: { intelligence: 2, wisdom: 2 },
  social_leadership: { intelligence: 8, wisdom: 8, defense: 4 },
  social_influence: { intelligence: 15, wisdom: 15, defense: 5 },
  craft_foundation: { strength: 2, intelligence: 2 },
  craft_mastery: { strength: 5, intelligence: 10, wisdom: 5 },
  craft_artisan: { strength: 15, intelligence: 20, defense: 5 },
};

export function useStats() {
  const { unlockedAchievements } = useGamificationStore();
  const { equipped } = useAvatarStore();
  const { activePets } = usePetStore();
  const { allocatedPoints } = useSkillPointsStore();
  const { unlockedPerks } = usePerkStore();
  const { getMasteryLevels } = useModuleMasteryStore();

  // Get achievement count
  const achievementCount = useMemo(() => {
    return unlockedAchievements?.length || 0;
  }, [unlockedAchievements]);

  // Get equipped items from avatarStore - convert slot:itemId to item objects
  const equipment = useMemo(() => {
    if (!equipped) return [];

    return Object.values(equipped)
      .filter(itemId => itemId != null)
      .map(itemId => EQUIPMENT_DATABASE[itemId])
      .filter(item => item != null);
  }, [equipped]);

  // Get active pet data
  const pets = useMemo(() => {
    return activePets
      .map(petId => PET_DATABASE[petId])
      .filter(Boolean);
  }, [activePets]);

  // Calculate perk stat bonuses from unlocked perks
  const perkBonuses = useMemo(() => {
    const bonuses = { strength: 0, vitality: 0, intelligence: 0, wisdom: 0, defense: 0 };

    if (!unlockedPerks) return bonuses;

    unlockedPerks.forEach(perkId => {
      const perkBonus = PERK_STAT_BONUSES[perkId];
      if (perkBonus) {
        Object.entries(perkBonus).forEach(([stat, value]) => {
          bonuses[stat] += value;
        });
      }
    });

    return bonuses;
  }, [unlockedPerks]);

  // Get module mastery levels
  const moduleMastery = useMemo(() => getMasteryLevels(), [getMasteryLevels]);

  // Calculate total stats from all sources (7 sources)
  const stats = useMemo(() => {
    return calculateTotalStats({
      equipment,
      pets,
      perkBonuses,
      achievementCount,
      allocatedPoints,
      moduleMastery,
    });
  }, [equipment, pets, perkBonuses, achievementCount, allocatedPoints, moduleMastery]);

  // Calculate stat breakdown by source
  const statBreakdown = useMemo(() => {
    return calculateStatBreakdown({
      equipment,
      pets,
      perkBonuses,
      achievementCount,
      allocatedPoints,
      moduleMastery,
    });
  }, [equipment, pets, perkBonuses, achievementCount, allocatedPoints, moduleMastery]);

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
