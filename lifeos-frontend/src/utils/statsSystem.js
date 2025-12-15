/**
 * Unified Stats System - Central Source of Truth
 *
 * This module provides all stat-related calculations, configurations,
 * and utilities used across the entire application.
 */

// ============================================
// STAT DEFINITIONS & CONFIGURATION
// ============================================

export const STATS = {
  STRENGTH: 'strength',
  VITALITY: 'vitality',
  INTELLIGENCE: 'intelligence',
  WISDOM: 'wisdom',
  DEFENSE: 'defense',
};

export const STAT_CONFIG = {
  [STATS.STRENGTH]: {
    name: 'Strength',
    shortName: 'STR',
    description: 'Physical power, fitness, and exercise prowess',
    color: '#EF4444',
    rgb: 'rgb(239, 68, 68)',
    glow: 'rgba(239, 68, 68, 0.5)',
    icon: '⚔️',
    lucideIcon: 'Sword',
    primaryModule: 'health',
    category: 'physical',
  },
  [STATS.VITALITY]: {
    name: 'Vitality',
    shortName: 'VIT',
    description: 'Endurance, stamina, and overall health',
    color: '#10B981',
    rgb: 'rgb(16, 185, 129)',
    glow: 'rgba(16, 185, 129, 0.5)',
    icon: '❤️',
    lucideIcon: 'Heart',
    primaryModule: 'health',
    category: 'physical',
  },
  [STATS.INTELLIGENCE]: {
    name: 'Intelligence',
    shortName: 'INT',
    description: 'Mental acuity, learning, and knowledge',
    color: '#8B5CF6',
    rgb: 'rgb(139, 92, 246)',
    glow: 'rgba(139, 92, 246, 0.5)',
    icon: '🧠',
    lucideIcon: 'Brain',
    primaryModule: 'knowledge',
    category: 'mental',
  },
  [STATS.WISDOM]: {
    name: 'Wisdom',
    shortName: 'WIS',
    description: 'Focus, discipline, and time management',
    color: '#F59E0B',
    rgb: 'rgb(245, 158, 11)',
    glow: 'rgba(245, 158, 11, 0.5)',
    icon: '✨',
    lucideIcon: 'Sparkles',
    primaryModule: 'productivity',
    category: 'mental',
  },
  [STATS.DEFENSE]: {
    name: 'Defense',
    shortName: 'DEF',
    description: 'Resilience, consistency, and habit formation',
    color: '#3B82F6',
    rgb: 'rgb(59, 130, 246)',
    glow: 'rgba(59, 130, 246, 0.5)',
    icon: '🛡️',
    lucideIcon: 'Shield',
    primaryModule: 'calendar',
    category: 'core',
  },
};

// Stat scaling constants
export const STAT_SCALING = {
  MIN: 0,
  NORMAL_MAX: 100,
  SOFT_CAP: 100,
  HARD_CAP: 200,
  MILESTONE_INTERVAL: 25,
};

// ============================================
// MODULE-TO-STAT MAPPING
// ============================================

export const MODULE_STAT_MAPPING = {
  productivity: {
    primary: { stat: STATS.WISDOM, weight: 0.6 },
    secondary: [
      { stat: STATS.INTELLIGENCE, weight: 0.3 },
      { stat: STATS.DEFENSE, weight: 0.1 },
    ],
  },
  health: {
    primary: { stat: STATS.STRENGTH, weight: 0.5 },
    secondary: [
      { stat: STATS.VITALITY, weight: 0.4 },
      { stat: STATS.DEFENSE, weight: 0.1 },
    ],
  },
  knowledge: {
    primary: { stat: STATS.INTELLIGENCE, weight: 0.7 },
    secondary: [
      { stat: STATS.WISDOM, weight: 0.2 },
      { stat: STATS.DEFENSE, weight: 0.1 },
    ],
  },
  journal: {
    primary: { stat: STATS.WISDOM, weight: 0.5 },
    secondary: [
      { stat: STATS.INTELLIGENCE, weight: 0.3 },
      { stat: STATS.VITALITY, weight: 0.2 },
    ],
  },
  finance: {
    primary: { stat: STATS.DEFENSE, weight: 0.5 },
    secondary: [
      { stat: STATS.WISDOM, weight: 0.3 },
      { stat: STATS.INTELLIGENCE, weight: 0.2 },
    ],
  },
  calendar: {
    primary: { stat: STATS.WISDOM, weight: 0.6 },
    secondary: [
      { stat: STATS.DEFENSE, weight: 0.4 },
    ],
  },
  skills: {
    // Balanced across all stats
    primary: { stat: STATS.INTELLIGENCE, weight: 0.2 },
    secondary: [
      { stat: STATS.STRENGTH, weight: 0.2 },
      { stat: STATS.VITALITY, weight: 0.2 },
      { stat: STATS.WISDOM, weight: 0.2 },
      { stat: STATS.DEFENSE, weight: 0.2 },
    ],
  },
};

// ============================================
// STAT CALCULATION FUNCTIONS
// ============================================

// Base stats for all characters
export const BASE_STATS = {
  [STATS.STRENGTH]: 5,
  [STATS.VITALITY]: 5,
  [STATS.INTELLIGENCE]: 5,
  [STATS.WISDOM]: 5,
  [STATS.DEFENSE]: 5,
};

// Skill points awarded per level
export const SKILL_POINTS_PER_LEVEL = 3;

// Achievement milestone thresholds and bonuses
export const ACHIEVEMENT_MILESTONES = [
  { count: 10, bonus: 2 },
  { count: 25, bonus: 3 },
  { count: 50, bonus: 5 },
  { count: 100, bonus: 8 },
  { count: 150, bonus: 12 },
];

// Module mastery stat bonuses per level
export const MODULE_MASTERY_BONUSES = {
  health: { strength: 0.5, vitality: 0.5 },
  productivity: { wisdom: 0.8, defense: 0.2 },
  knowledge: { intelligence: 0.8, wisdom: 0.2 },
  journal: { wisdom: 0.5, vitality: 0.3, intelligence: 0.2 },
  financial: { defense: 0.6, wisdom: 0.4 },
  skills: { strength: 0.2, vitality: 0.2, intelligence: 0.2, wisdom: 0.2, defense: 0.2 },
};

// Pet bonus type to stat mapping (enhanced)
export const PET_STAT_MAPPING = {
  learning: { intelligence: 1.0 },
  productivity: { wisdom: 0.7, defense: 0.3 },
  health: { strength: 0.5, vitality: 0.5 },
  time: { wisdom: 1.0 },
  creativity: { intelligence: 0.6, wisdom: 0.4 },
  universal: { strength: 0.2, vitality: 0.2, intelligence: 0.2, wisdom: 0.2, defense: 0.2 },
  power: { strength: 1.0 },
  mastery: { intelligence: 0.5, wisdom: 0.5 },
};

/**
 * Calculate total stats from all sources
 * 7 Sources: Base, Allocated Points, Equipment, Pets, Perks, Achievements, Module Mastery
 */
export function calculateTotalStats(sources = {}) {
  const {
    equipment = [],
    pets = [],
    perkBonuses = {},
    achievementCount = 0,
    allocatedPoints = {},
    moduleMastery = {},
  } = sources;

  // 1. Start with base stats
  const stats = {
    [STATS.STRENGTH]: BASE_STATS[STATS.STRENGTH],
    [STATS.VITALITY]: BASE_STATS[STATS.VITALITY],
    [STATS.INTELLIGENCE]: BASE_STATS[STATS.INTELLIGENCE],
    [STATS.WISDOM]: BASE_STATS[STATS.WISDOM],
    [STATS.DEFENSE]: BASE_STATS[STATS.DEFENSE],
  };

  // 2. Allocated skill points
  if (allocatedPoints.strength) stats[STATS.STRENGTH] += allocatedPoints.strength;
  if (allocatedPoints.vitality) stats[STATS.VITALITY] += allocatedPoints.vitality;
  if (allocatedPoints.intelligence) stats[STATS.INTELLIGENCE] += allocatedPoints.intelligence;
  if (allocatedPoints.wisdom) stats[STATS.WISDOM] += allocatedPoints.wisdom;
  if (allocatedPoints.defense) stats[STATS.DEFENSE] += allocatedPoints.defense;

  // 3. Equipment bonuses (supports both flat stats and nested stats object)
  equipment.forEach(item => {
    // Support nested stats object from EQUIPMENT_DATABASE
    const itemStats = item.stats || item;
    if (itemStats.strength) stats[STATS.STRENGTH] += itemStats.strength;
    if (itemStats.vitality) stats[STATS.VITALITY] += itemStats.vitality;
    if (itemStats.intelligence) stats[STATS.INTELLIGENCE] += itemStats.intelligence;
    if (itemStats.wisdom) stats[STATS.WISDOM] += itemStats.wisdom;
    if (itemStats.defense) stats[STATS.DEFENSE] += itemStats.defense;
  });

  // 4. Pet bonuses (enhanced mapping)
  pets.forEach(pet => {
    const petBonus = pet.bonusAmount || 0;
    const mapping = PET_STAT_MAPPING[pet.bonusType] || PET_STAT_MAPPING.universal;

    Object.entries(mapping).forEach(([stat, multiplier]) => {
      stats[stat] += Math.floor(petBonus * multiplier);
    });
  });

  // 5. Perk bonuses
  if (perkBonuses.strength) stats[STATS.STRENGTH] += perkBonuses.strength;
  if (perkBonuses.vitality) stats[STATS.VITALITY] += perkBonuses.vitality;
  if (perkBonuses.intelligence) stats[STATS.INTELLIGENCE] += perkBonuses.intelligence;
  if (perkBonuses.wisdom) stats[STATS.WISDOM] += perkBonuses.wisdom;
  if (perkBonuses.defense) stats[STATS.DEFENSE] += perkBonuses.defense;

  // 6. Achievement milestone bonuses
  let achievementBonus = 0;
  ACHIEVEMENT_MILESTONES.forEach(milestone => {
    if (achievementCount >= milestone.count) {
      achievementBonus += milestone.bonus;
    }
  });
  Object.keys(stats).forEach(stat => {
    stats[stat] += achievementBonus;
  });

  // 7. Module mastery bonuses
  Object.entries(moduleMastery).forEach(([module, level]) => {
    const bonuses = MODULE_MASTERY_BONUSES[module];
    if (bonuses) {
      Object.entries(bonuses).forEach(([stat, perLevel]) => {
        stats[stat] += Math.floor(level * perLevel);
      });
    }
  });

  return stats;
}

/**
 * Calculate stat breakdown by source (7 sources)
 */
export function calculateStatBreakdown(sources = {}) {
  const breakdown = {};

  Object.values(STATS).forEach(stat => {
    breakdown[stat] = {
      base: BASE_STATS[stat],
      allocated: 0,
      equipment: 0,
      pets: 0,
      perks: 0,
      achievements: 0,
      mastery: 0,
      total: 0,
    };
  });

  const {
    equipment = [],
    pets = [],
    perkBonuses = {},
    achievementCount = 0,
    allocatedPoints = {},
    moduleMastery = {},
  } = sources;

  // Allocated points
  Object.values(STATS).forEach(stat => {
    breakdown[stat].allocated = allocatedPoints[stat] || 0;
  });

  // Equipment (supports both flat stats and nested stats object)
  equipment.forEach(item => {
    const itemStats = item.stats || item;
    Object.values(STATS).forEach(stat => {
      if (itemStats[stat]) {
        breakdown[stat].equipment += itemStats[stat];
      }
    });
  });

  // Pets (enhanced mapping)
  pets.forEach(pet => {
    const petBonus = pet.bonusAmount || 0;
    const mapping = PET_STAT_MAPPING[pet.bonusType] || PET_STAT_MAPPING.universal;

    Object.entries(mapping).forEach(([stat, multiplier]) => {
      breakdown[stat].pets += Math.floor(petBonus * multiplier);
    });
  });

  // Perks
  Object.values(STATS).forEach(stat => {
    breakdown[stat].perks = perkBonuses[stat] || 0;
  });

  // Achievement milestones
  let achievementBonus = 0;
  ACHIEVEMENT_MILESTONES.forEach(milestone => {
    if (achievementCount >= milestone.count) {
      achievementBonus += milestone.bonus;
    }
  });
  Object.values(STATS).forEach(stat => {
    breakdown[stat].achievements = achievementBonus;
  });

  // Module mastery
  Object.entries(moduleMastery).forEach(([module, level]) => {
    const bonuses = MODULE_MASTERY_BONUSES[module];
    if (bonuses) {
      Object.entries(bonuses).forEach(([stat, perLevel]) => {
        breakdown[stat].mastery += Math.floor(level * perLevel);
      });
    }
  });

  // Calculate totals
  Object.values(STATS).forEach(stat => {
    breakdown[stat].total =
      breakdown[stat].base +
      breakdown[stat].allocated +
      breakdown[stat].equipment +
      breakdown[stat].pets +
      breakdown[stat].perks +
      breakdown[stat].achievements +
      breakdown[stat].mastery;
  });

  return breakdown;
}

/**
 * Calculate XP multiplier based on stat value
 * +2% per 10 stat points
 */
export function calculateStatXPMultiplier(statValue) {
  return 1 + (Math.floor(statValue / 10) * 0.02);
}

/**
 * Get stat-based XP multiplier for a module
 */
export function getModuleXPMultiplier(moduleName, stats) {
  const mapping = MODULE_STAT_MAPPING[moduleName];
  if (!mapping) return 1.0;

  let totalMultiplier = 0;

  // Primary stat
  const primaryStat = stats[mapping.primary.stat] || 0;
  totalMultiplier += calculateStatXPMultiplier(primaryStat) * mapping.primary.weight;

  // Secondary stats
  mapping.secondary.forEach(({ stat, weight }) => {
    const statValue = stats[stat] || 0;
    totalMultiplier += calculateStatXPMultiplier(statValue) * weight;
  });

  return totalMultiplier;
}

/**
 * Calculate total power score (sum of all stats)
 */
export function calculateTotalPower(stats) {
  return Object.values(STATS).reduce((sum, stat) => sum + (stats[stat] || 0), 0);
}

/**
 * Calculate balance score (measures how evenly distributed stats are)
 */
export function calculateBalanceScore(stats) {
  const statValues = Object.values(STATS).map(stat => stats[stat] || 0);
  const min = Math.min(...statValues);
  const average = statValues.reduce((sum, val) => sum + val, 0) / statValues.length;

  if (average === 0) return 0;

  return Math.round((min / average) * 100);
}

/**
 * Check stat synergies
 */
export function checkStatSynergies(stats) {
  const synergies = [];

  const str = stats[STATS.STRENGTH] || 0;
  const vit = stats[STATS.VITALITY] || 0;
  const int = stats[STATS.INTELLIGENCE] || 0;
  const wis = stats[STATS.WISDOM] || 0;
  const def = stats[STATS.DEFENSE] || 0;

  // Titan's Body: Strength + Vitality >= 100
  if (str + vit >= 100) {
    synergies.push({
      name: "Titan's Body",
      description: '+10% Physical XP',
      bonus: { type: 'xp', category: 'physical', value: 0.1 },
      icon: '💪',
    });
  }

  // Scholar's Mind: Intelligence + Wisdom >= 100
  if (int + wis >= 100) {
    synergies.push({
      name: "Scholar's Mind",
      description: '+10% Mental XP',
      bonus: { type: 'xp', category: 'mental', value: 0.1 },
      icon: '🧠',
    });
  }

  // Balanced Hero: All stats >= 50
  if (str >= 50 && vit >= 50 && int >= 50 && wis >= 50 && def >= 50) {
    synergies.push({
      name: 'Balanced Hero',
      description: '+5% Global XP',
      bonus: { type: 'xp', category: 'global', value: 0.05 },
      icon: '⚖️',
    });
  }

  // Legendary Hero: All stats >= 100
  if (str >= 100 && vit >= 100 && int >= 100 && wis >= 100 && def >= 100) {
    synergies.push({
      name: 'Legendary Hero',
      description: '+15% Global XP',
      bonus: { type: 'xp', category: 'global', value: 0.15 },
      icon: '👑',
    });
  }

  return synergies;
}

/**
 * Get stat milestones
 */
export function getStatMilestones(statValue) {
  const milestones = [];

  for (let i = STAT_SCALING.MILESTONE_INTERVAL; i <= STAT_SCALING.HARD_CAP; i += STAT_SCALING.MILESTONE_INTERVAL) {
    milestones.push({
      value: i,
      reached: statValue >= i,
      title: getMilestoneTitle(i),
    });
  }

  return milestones;
}

function getMilestoneTitle(value) {
  if (value === 25) return 'Apprentice';
  if (value === 50) return 'Adept';
  if (value === 75) return 'Expert';
  if (value === 100) return 'Master';
  if (value === 125) return 'Grandmaster';
  if (value === 150) return 'Legend';
  if (value === 175) return 'Mythic';
  if (value === 200) return 'Transcendent';
  return 'Unknown';
}

/**
 * Format stat value for display
 */
export function formatStatValue(value, options = {}) {
  const { showPlus = true, decimals = 0 } = options;

  const formatted = value.toFixed(decimals);
  return showPlus && value > 0 ? `+${formatted}` : formatted;
}

/**
 * Get stat color
 */
export function getStatColor(statName) {
  return STAT_CONFIG[statName]?.color || '#FFFFFF';
}

/**
 * Get stat category (physical, mental, core)
 */
export function getStatCategory(statName) {
  return STAT_CONFIG[statName]?.category || 'unknown';
}

// ============================================
// EXPORTS
// ============================================

export default {
  STATS,
  STAT_CONFIG,
  STAT_SCALING,
  MODULE_STAT_MAPPING,
  BASE_STATS,
  SKILL_POINTS_PER_LEVEL,
  ACHIEVEMENT_MILESTONES,
  MODULE_MASTERY_BONUSES,
  PET_STAT_MAPPING,
  calculateTotalStats,
  calculateStatBreakdown,
  calculateStatXPMultiplier,
  getModuleXPMultiplier,
  calculateTotalPower,
  calculateBalanceScore,
  checkStatSynergies,
  getStatMilestones,
  formatStatValue,
  getStatColor,
  getStatCategory,
};
