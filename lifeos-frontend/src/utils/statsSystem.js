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

/**
 * Calculate total stats from all sources
 */
export function calculateTotalStats(sources = {}) {
  const {
    equipment = [],
    pets = [],
    perks = [],
    achievements = 0,
    levelBonus = 0,
  } = sources;

  const stats = {
    [STATS.STRENGTH]: 0,
    [STATS.VITALITY]: 0,
    [STATS.INTELLIGENCE]: 0,
    [STATS.WISDOM]: 0,
    [STATS.DEFENSE]: 0,
  };

  // Equipment bonuses
  equipment.forEach(item => {
    if (item.strength) stats[STATS.STRENGTH] += item.strength;
    if (item.vitality) stats[STATS.VITALITY] += item.vitality;
    if (item.intelligence) stats[STATS.INTELLIGENCE] += item.intelligence;
    if (item.wisdom) stats[STATS.WISDOM] += item.wisdom;
    if (item.defense) stats[STATS.DEFENSE] += item.defense;
  });

  // Pet bonuses (stored as percentages, convert to flat bonuses)
  pets.forEach(pet => {
    const petBonus = pet.bonusAmount || 0;
    // Distribute pet bonus across relevant stats based on bonus type
    const statBonus = Math.floor(petBonus / 2); // Convert % to flat bonus

    switch (pet.bonusType) {
      case 'learning':
        stats[STATS.INTELLIGENCE] += statBonus;
        break;
      case 'productivity':
        stats[STATS.WISDOM] += statBonus;
        break;
      case 'health':
        stats[STATS.STRENGTH] += statBonus;
        stats[STATS.VITALITY] += statBonus;
        break;
      case 'universal':
        Object.keys(stats).forEach(stat => stats[stat] += Math.floor(statBonus / 5));
        break;
    }
  });

  // Perk bonuses (future implementation)
  // perks.forEach(perk => { ... });

  // Achievement bonuses
  Object.keys(stats).forEach(stat => {
    stats[stat] += achievements;
  });

  // Level milestone bonuses
  Object.keys(stats).forEach(stat => {
    stats[stat] += levelBonus;
  });

  return stats;
}

/**
 * Calculate stat breakdown by source
 */
export function calculateStatBreakdown(sources = {}) {
  const breakdown = {};

  Object.values(STATS).forEach(stat => {
    breakdown[stat] = {
      equipment: 0,
      pets: 0,
      perks: 0,
      achievements: 0,
      levels: 0,
      total: 0,
    };
  });

  // Calculate each source
  const { equipment = [], pets = [], achievements = 0, levelBonus = 0 } = sources;

  // Equipment
  equipment.forEach(item => {
    Object.values(STATS).forEach(stat => {
      if (item[stat]) {
        breakdown[stat].equipment += item[stat];
      }
    });
  });

  // Pets
  pets.forEach(pet => {
    const petBonus = Math.floor((pet.bonusAmount || 0) / 2);

    switch (pet.bonusType) {
      case 'learning':
        breakdown[STATS.INTELLIGENCE].pets += petBonus;
        break;
      case 'productivity':
        breakdown[STATS.WISDOM].pets += petBonus;
        break;
      case 'health':
        breakdown[STATS.STRENGTH].pets += petBonus;
        breakdown[STATS.VITALITY].pets += petBonus;
        break;
      case 'universal':
        Object.values(STATS).forEach(stat => {
          breakdown[stat].pets += Math.floor(petBonus / 5);
        });
        break;
    }
  });

  // Achievements & Levels
  Object.values(STATS).forEach(stat => {
    breakdown[stat].achievements = achievements;
    breakdown[stat].levels = levelBonus;
    breakdown[stat].total =
      breakdown[stat].equipment +
      breakdown[stat].pets +
      breakdown[stat].perks +
      breakdown[stat].achievements +
      breakdown[stat].levels;
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
