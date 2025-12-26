/**
 * Avatar System Data
 * Defines tiers, equipment, and progression for the space explorer avatar
 */

// Character Tier Definitions
export const AVATAR_TIERS = {
  1: {
    id: 'cadet',
    name: 'Cadet',
    description: 'Basic space explorer, just starting the journey',
    levelRequired: 1,
    colors: {
      primary: '#9ca3af',    // Bright gray
      secondary: '#d1d5db',  // Very light gray
      accent: '#00d4ff',     // Bright cyan
      glow: 'subtle',
    },
    effects: ['outline'],
  },
  2: {
    id: 'explorer',
    name: 'Explorer',
    description: 'Experienced traveler with enhanced equipment',
    levelRequired: 11,
    colors: {
      primary: '#ffffff',    // White
      secondary: '#3b82f6',  // Blue
      accent: '#1e40af',     // Dark blue
      glow: 'subtle',
    },
    effects: ['single_glow'],
  },
  3: {
    id: 'veteran',
    name: 'Veteran',
    description: 'Battle-tested specialist with advanced tech',
    levelRequired: 26,
    colors: {
      primary: '#8b5cf6',    // Purple
      secondary: '#3b82f6',  // Blue
      accent: '#f59e0b',     // Orange
      glow: 'medium',
    },
    effects: ['multi_glow', 'particles'],
  },
  4: {
    id: 'elite',
    name: 'Cosmic Elite',
    description: 'Legendary explorer, master of the cosmos',
    levelRequired: 51,
    colors: {
      primary: '#f59e0b',    // Gold
      secondary: '#8b5cf6',  // Purple
      accent: '#10b981',     // Green
      glow: 'intense',
    },
    effects: ['multi_glow', 'particles', 'aura', 'animated'],
  },
};

// Equipment Rarity System
export const EQUIPMENT_RARITY = {
  common: {
    name: 'Common',
    color: '#9ca3af',
    borderColor: 'rgba(156, 163, 175, 0.3)',
    glow: false,
  },
  uncommon: {
    name: 'Uncommon',
    color: '#10b981',
    borderColor: 'rgba(16, 185, 129, 0.4)',
    glow: 'subtle',
  },
  rare: {
    name: 'Rare',
    color: '#3b82f6',
    borderColor: 'rgba(59, 130, 246, 0.4)',
    glow: 'medium',
  },
  epic: {
    name: 'Epic',
    color: '#8b5cf6',
    borderColor: 'rgba(139, 92, 246, 0.5)',
    glow: 'strong',
  },
  legendary: {
    name: 'Legendary',
    color: '#f59e0b',
    borderColor: 'rgba(245, 158, 11, 0.6)',
    glow: 'intense',
  },
};

// Unlock method types for equipment
export const EQUIPMENT_UNLOCK_METHODS = {
  DEFAULT: 'default',
  LEVEL: 'level',
  ACHIEVEMENT: 'achievement',
  SKILL_TREE: 'skill_tree',
  BAZAAR: 'bazaar',
};

// Equipment Database
export const EQUIPMENT_DATABASE = {
  // ========== HELMETS ==========
  helmet_basic: {
    id: 'helmet_basic',
    name: 'Standard Helmet',
    description: 'Basic protective helmet for space exploration',
    slot: 'helmet',
    tier: 1,
    rarity: 'common',
    // New unlock system
    unlockMethod: 'default',
    unlockRequirement: null,
    unlockDescription: 'Starting gear',
    stats: { defense: 1 },
    sprite: 'helmet_basic',
  },
  helmet_visor: {
    id: 'helmet_visor',
    name: 'Tinted Visor Helmet',
    description: 'Enhanced helmet with UV-protective visor',
    slot: 'helmet',
    tier: 2,
    rarity: 'uncommon',
    // New unlock system - Leveling
    unlockMethod: 'level',
    unlockRequirement: { level: 10 },
    unlockDescription: 'Reach Level 10',
    stats: { defense: 2, intelligence: 1 },
    sprite: 'helmet_visor',
  },
  helmet_hud: {
    id: 'helmet_hud',
    name: 'HUD Interface Helmet',
    description: 'Advanced helmet with integrated heads-up display',
    slot: 'helmet',
    tier: 2,
    rarity: 'rare',
    // New unlock system - Achievement
    unlockMethod: 'achievement',
    unlockRequirement: { achievementId: 'bookworm', fallbackStat: 'booksCompleted', fallbackTarget: 10 },
    unlockDescription: 'Complete "Bookworm" achievement',
    stats: { defense: 2, intelligence: 3 },
    sprite: 'helmet_hud',
    effects: ['glow_cyan'],
  },
  helmet_neural: {
    id: 'helmet_neural',
    name: 'Neural Interface Helmet',
    description: 'Cutting-edge neural connection technology',
    slot: 'helmet',
    tier: 3,
    rarity: 'epic',
    // New unlock system - Skill Tree (Mind tree Level 40 OR "Scholar's Insight" perk)
    unlockMethod: 'skill_tree',
    unlockRequirement: { tree: 'mind', level: 40, orPerkId: 'scholars_insight' },
    unlockDescription: 'Mind tree L40 or unlock "Scholar\'s Insight"',
    stats: { defense: 3, intelligence: 5 },
    sprite: 'helmet_neural',
    effects: ['glow_purple', 'particles'],
  },
  helmet_omniscient: {
    id: 'helmet_omniscient',
    name: 'Omniscient Crown',
    description: 'Legendary holographic interface with cosmic awareness',
    slot: 'helmet',
    tier: 4,
    rarity: 'legendary',
    // New unlock system - Bazaar purchase
    unlockMethod: 'bazaar',
    unlockRequirement: { price: 6000 },
    unlockDescription: '6,000 Cosmic Credits',
    stats: { defense: 5, intelligence: 10 },
    sprite: 'helmet_omniscient',
    effects: ['glow_gold', 'particles', 'hologram', 'animated'],
  },

  // ========== SUITS ==========
  suit_basic: {
    id: 'suit_basic',
    name: 'Standard Space Suit',
    description: 'Basic life support suit for vacuum environments',
    slot: 'suit',
    tier: 1,
    rarity: 'common',
    // New unlock system
    unlockMethod: 'default',
    unlockRequirement: null,
    unlockDescription: 'Starting gear',
    stats: { defense: 2 },
    sprite: 'suit_basic',
  },
  suit_reinforced: {
    id: 'suit_reinforced',
    name: 'Reinforced Panels Suit',
    description: 'Enhanced protection with armoured plating',
    slot: 'suit',
    tier: 2,
    rarity: 'uncommon',
    // New unlock system - Achievement
    unlockMethod: 'achievement',
    unlockRequirement: { achievementId: 'gym_rookie', fallbackStat: 'workoutsCompleted', fallbackTarget: 10 },
    unlockDescription: 'Complete "Gym Rookie" achievement',
    stats: { defense: 4, strength: 2 },
    sprite: 'suit_reinforced',
  },
  suit_biometric: {
    id: 'suit_biometric',
    name: 'Biometric Analysis Suit',
    description: 'Real-time health monitoring and optimisation',
    slot: 'suit',
    tier: 2,
    rarity: 'rare',
    // New unlock system - Bazaar purchase
    unlockMethod: 'bazaar',
    unlockRequirement: { price: 1800 },
    unlockDescription: '1,800 Cosmic Credits',
    stats: { defense: 4, vitality: 3 },
    sprite: 'suit_biometric',
    effects: ['glow_green'],
  },
  suit_adaptive: {
    id: 'suit_adaptive',
    name: 'Adaptive Exo-Suit',
    description: 'Performance-enhancing powered exoskeleton',
    slot: 'suit',
    tier: 3,
    rarity: 'epic',
    // New unlock system - Skill Tree (Body tree Level 50 OR "Peak Performance" perk)
    unlockMethod: 'skill_tree',
    unlockRequirement: { tree: 'body', level: 50, orPerkId: 'peak_performance' },
    unlockDescription: 'Body tree L50 or unlock "Peak Performance"',
    stats: { defense: 6, strength: 5, vitality: 3 },
    sprite: 'suit_adaptive',
    effects: ['glow_blue', 'particles'],
  },
  suit_cosmic: {
    id: 'suit_cosmic',
    name: 'Cosmic Harmoniser Suit',
    description: 'Reality-bending suit attuned to universal energies',
    slot: 'suit',
    tier: 4,
    rarity: 'legendary',
    // New unlock system - Achievement
    unlockMethod: 'achievement',
    unlockRequirement: { achievementId: 'life_optimizer', fallbackStat: 'allModulesActiveDays', fallbackTarget: 90 },
    unlockDescription: 'Complete "Life Optimiser" achievement',
    stats: { defense: 10, strength: 8, vitality: 8, intelligence: 5 },
    sprite: 'suit_cosmic',
    effects: ['glow_rainbow', 'particles', 'aura', 'animated'],
  },

  // ========== BACKPACKS ==========
  backpack_basic: {
    id: 'backpack_basic',
    name: 'Standard Oxygen Tank',
    description: 'Basic life support system',
    slot: 'backpack',
    tier: 1,
    rarity: 'common',
    // New unlock system
    unlockMethod: 'default',
    unlockRequirement: null,
    unlockDescription: 'Starting gear',
    stats: { vitality: 1 },
    sprite: 'backpack_basic',
  },
  backpack_endurance: {
    id: 'backpack_endurance',
    name: 'Endurance Booster',
    description: 'Extended life support with performance enhancers',
    slot: 'backpack',
    tier: 2,
    rarity: 'uncommon',
    // New unlock system - Leveling
    unlockMethod: 'level',
    unlockRequirement: { level: 15 },
    unlockDescription: 'Reach Level 15',
    stats: { vitality: 3, strength: 1 },
    sprite: 'backpack_endurance',
  },
  backpack_quantum: {
    id: 'backpack_quantum',
    name: 'Quantum Storage Module',
    description: 'Dimensional compression technology for infinite capacity',
    slot: 'backpack',
    tier: 3,
    rarity: 'epic',
    // New unlock system - Skill Tree (Any tree Level 60)
    unlockMethod: 'skill_tree',
    unlockRequirement: { anyTree: true, level: 60 },
    unlockDescription: 'Reach Level 60 in any skill tree',
    stats: { vitality: 4, intelligence: 3 },
    sprite: 'backpack_quantum',
    effects: ['glow_purple'],
  },
  backpack_cosmic: {
    id: 'backpack_cosmic',
    name: 'Universe Mapper',
    description: 'Contains a miniature universe for navigation and exploration',
    slot: 'backpack',
    tier: 4,
    rarity: 'legendary',
    // New unlock system - Leveling (Prestige once)
    unlockMethod: 'level',
    unlockRequirement: { prestige: 1 },
    unlockDescription: 'Prestige once (reach L100 and reset)',
    stats: { vitality: 6, intelligence: 6, wisdom: 10 },
    sprite: 'backpack_cosmic',
    effects: ['glow_gold', 'particles', 'animated'],
  },

  // ========== TOOLS ==========
  tool_scanner: {
    id: 'tool_scanner',
    name: 'Basic Scanner',
    description: 'Simple environmental analysis device',
    slot: 'tool',
    tier: 1,
    rarity: 'common',
    // New unlock system
    unlockMethod: 'default',
    unlockRequirement: null,
    unlockDescription: 'Starting gear',
    stats: { intelligence: 1 },
    sprite: 'tool_scanner',
  },
  tool_tablet: {
    id: 'tool_tablet',
    name: 'Data Tablet',
    description: 'Portable information terminal',
    slot: 'tool',
    tier: 1,
    rarity: 'uncommon',
    // New unlock system - Bazaar purchase
    unlockMethod: 'bazaar',
    unlockRequirement: { price: 400 },
    unlockDescription: '400 Cosmic Credits',
    stats: { intelligence: 2 },
    sprite: 'tool_tablet',
  },
  tool_quantum_planner: {
    id: 'tool_quantum_planner',
    name: 'Quantum Planner',
    description: 'Advanced AI-assisted task optimisation',
    slot: 'tool',
    tier: 2,
    rarity: 'rare',
    // New unlock system - Achievement
    unlockMethod: 'achievement',
    unlockRequirement: { achievementId: 'task_warrior', fallbackStat: 'tasksCompleted', fallbackTarget: 500 },
    unlockDescription: 'Complete "Task Warrior" achievement',
    stats: { intelligence: 4, wisdom: 2 },
    sprite: 'tool_quantum_planner',
    effects: ['glow_blue'],
  },
  tool_value_predictor: {
    id: 'tool_value_predictor',
    name: 'Value Predictor',
    description: 'Financial analysis and forecasting tool',
    slot: 'tool',
    tier: 2,
    rarity: 'rare',
    // New unlock system - Skill Tree (Wealth tree Level 30 OR "Financial Clarity" perk)
    unlockMethod: 'skill_tree',
    unlockRequirement: { tree: 'wealth', level: 30, orPerkId: 'financial_clarity' },
    unlockDescription: 'Wealth tree L30 or unlock "Financial Clarity"',
    stats: { intelligence: 3, wisdom: 3 },
    sprite: 'tool_value_predictor',
    effects: ['glow_green'],
  },
  tool_time_dilation: {
    id: 'tool_time_dilation',
    name: 'Time Dilation Device',
    description: 'Manipulate time perception for productivity',
    slot: 'tool',
    tier: 3,
    rarity: 'epic',
    // New unlock system - Bazaar purchase (added as extra epic item)
    unlockMethod: 'bazaar',
    unlockRequirement: { price: 4500 },
    unlockDescription: '4,500 Cosmic Credits',
    stats: { intelligence: 5, wisdom: 5 },
    sprite: 'tool_time_dilation',
    effects: ['glow_purple', 'particles', 'time_effect'],
  },
  tool_omniscient_analyzer: {
    id: 'tool_omniscient_analyzer',
    name: 'Omniscient Analyzer',
    description: 'Ultimate multi-dimensional analysis device',
    slot: 'tool',
    tier: 4,
    rarity: 'legendary',
    // New unlock system - Achievement
    unlockMethod: 'achievement',
    unlockRequirement: { achievementId: 'legend', fallbackStat: 'maxLevelReached', fallbackTarget: 50 },
    unlockDescription: 'Complete "Legend" achievement (Reach L50)',
    stats: { intelligence: 10, wisdom: 10 },
    sprite: 'tool_omniscient_analyzer',
    effects: ['glow_rainbow', 'particles', 'hologram', 'animated'],
  },

  // ========== BADGES/ACCESSORIES ==========
  badge_productivity: {
    id: 'badge_productivity',
    name: 'Productivity Master Badge',
    description: 'Recognition of exceptional task completion',
    slot: 'badge',
    tier: 2,
    rarity: 'rare',
    // New unlock system - Skill Tree (Mind tree Level 25)
    unlockMethod: 'skill_tree',
    unlockRequirement: { tree: 'mind', level: 25 },
    unlockDescription: 'Reach Mind tree Level 25',
    stats: { intelligence: 2 },
    sprite: 'badge_productivity',
  },
  badge_fitness: {
    id: 'badge_fitness',
    name: 'Peak Performance Badge',
    description: 'Symbol of physical excellence',
    slot: 'badge',
    tier: 2,
    rarity: 'rare',
    // New unlock system - Skill Tree (Body tree Level 25)
    unlockMethod: 'skill_tree',
    unlockRequirement: { tree: 'body', level: 25 },
    unlockDescription: 'Reach Body tree Level 25',
    stats: { strength: 2, vitality: 2 },
    sprite: 'badge_fitness',
  },
  badge_knowledge: {
    id: 'badge_knowledge',
    name: 'Scholar Emblem',
    description: 'Mark of continuous learning',
    slot: 'badge',
    tier: 2,
    rarity: 'rare',
    // New unlock system - Achievement
    unlockMethod: 'achievement',
    unlockRequirement: { achievementId: 'bibliophile', fallbackStat: 'booksCompleted', fallbackTarget: 25 },
    unlockDescription: 'Complete "Bibliophile" achievement',
    stats: { intelligence: 3, wisdom: 2 },
    sprite: 'badge_knowledge',
  },
  badge_balance: {
    id: 'badge_balance',
    name: 'Harmony Medallion',
    description: 'Symbol of balanced life mastery',
    slot: 'badge',
    tier: 3,
    rarity: 'epic',
    // New unlock system - Bazaar purchase
    unlockMethod: 'bazaar',
    unlockRequirement: { price: 3000 },
    unlockDescription: '3,000 Cosmic Credits',
    stats: { strength: 3, vitality: 3, intelligence: 3, wisdom: 3 },
    sprite: 'badge_balance',
    effects: ['glow_purple'],
  },
  badge_cosmic: {
    id: 'badge_cosmic',
    name: 'Cosmic Achievement Medal',
    description: 'Ultimate recognition across all disciplines',
    slot: 'badge',
    tier: 4,
    rarity: 'legendary',
    // New unlock system - Skill Tree (All 6 trees at Level 50+)
    unlockMethod: 'skill_tree',
    unlockRequirement: { allTrees: true, level: 50 },
    unlockDescription: 'All 6 skill trees at Level 50+',
    stats: { strength: 5, vitality: 5, intelligence: 5, wisdom: 5 },
    sprite: 'badge_cosmic',
    effects: ['glow_rainbow', 'particles'],
  },
};

// Equipment Slots Configuration
export const EQUIPMENT_SLOTS = [
  { id: 'helmet', name: 'Helmet', icon: '🪖' },
  { id: 'suit', name: 'Suit', icon: '🦺' },
  { id: 'backpack', name: 'Backpack', icon: '🎒' },
  { id: 'tool', name: 'Tool', icon: '🔧' },
  { id: 'badge', name: 'Badge', icon: '🏅' },
];

// Get equipment by slot
export function getEquipmentBySlot(slot) {
  return Object.values(EQUIPMENT_DATABASE).filter(item => item.slot === slot);
}

// Get equipment by tier
export function getEquipmentByTier(tier) {
  return Object.values(EQUIPMENT_DATABASE).filter(item => item.tier === tier);
}

// Get equipment by rarity
export function getEquipmentByRarity(rarity) {
  return Object.values(EQUIPMENT_DATABASE).filter(item => item.rarity === rarity);
}

// Calculate total stats from equipped items
export function calculateStats(equippedItems) {
  const stats = {
    defense: 0,
    strength: 0,
    vitality: 0,
    intelligence: 0,
    wisdom: 0,
  };

  equippedItems.forEach(itemId => {
    const item = EQUIPMENT_DATABASE[itemId];
    if (item && item.stats) {
      Object.entries(item.stats).forEach(([stat, value]) => {
        stats[stat] = (stats[stat] || 0) + value;
      });
    }
  });

  return stats;
}

// Check if equipment is unlocked
export function isEquipmentUnlocked(equipmentId, userProgress) {
  const item = EQUIPMENT_DATABASE[equipmentId];
  if (!item) return false;

  if (item.unlockedBy === 'default') return true;

  // Check module-specific unlocks
  if (item.unlockedBy.module && item.unlockedBy.requirement) {
    const moduleProgress = userProgress[item.unlockedBy.module];
    return checkRequirement(moduleProgress, item.unlockedBy.requirement);
  }

  return false;
}

// Helper to check unlock requirements
function checkRequirement(moduleProgress, requirement) {
  // This would contain actual logic for checking requirements
  // For now, return true for demo purposes
  return true;
}
