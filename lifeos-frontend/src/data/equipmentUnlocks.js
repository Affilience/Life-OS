/**
 * Equipment Unlock Configuration
 * Defines comprehensive unlock methods for all equipment items
 * This ensures every item has a meaningful path to unlock
 */

import { UNLOCK_METHODS, MODULES, UNLOCK_METRICS, SKILL_TREES } from './unlockMethods';

/**
 * Unlock configurations for items that need updated unlock methods
 * Maps item ID to unlock configuration
 */
export const EQUIPMENT_UNLOCK_OVERRIDES = {
  // ========================================
  // LEG ARMOR - Updated unlock methods
  // ========================================
  legs_chainmail: {
    unlockMethod: UNLOCK_METHODS.LEVEL,
    unlockRequirement: { level: 8 },
    unlockDescription: 'Reach Level 8',
  },
  legs_iron_legguards: {
    unlockMethod: UNLOCK_METHODS.MODULE_PROGRESS,
    unlockRequirement: { module: MODULES.FITNESS, metric: UNLOCK_METRICS.WORKOUTS_COMPLETED, target: 30 },
    unlockDescription: 'Complete 30 workouts',
  },
  legs_steel_legplates: {
    unlockMethod: UNLOCK_METHODS.MODULE_PROGRESS,
    unlockRequirement: { module: MODULES.PRODUCTIVITY, metric: UNLOCK_METRICS.TASKS_COMPLETED, target: 150 },
    unlockDescription: 'Complete 150 tasks',
  },
  legs_mage_robes: {
    unlockMethod: UNLOCK_METHODS.MODULE_PROGRESS,
    unlockRequirement: { module: MODULES.KNOWLEDGE, metric: UNLOCK_METRICS.BOOKS_READ, target: 15 },
    unlockDescription: 'Finish 15 books',
  },
  legs_dragon: {
    unlockMethod: UNLOCK_METHODS.ACHIEVEMENT,
    unlockRequirement: { achievementId: 'dragon_legs', achievementName: 'Iron Legs' },
    unlockDescription: 'Complete "Iron Legs" achievement (100 leg day workouts)',
  },
  legs_phoenix: {
    unlockMethod: UNLOCK_METHODS.STREAK,
    unlockRequirement: { streakDays: 60, module: MODULES.FITNESS },
    unlockDescription: '60-day workout streak',
  },

  // ========================================
  // RINGS - Updated unlock methods
  // ========================================
  ring_strength: {
    unlockMethod: UNLOCK_METHODS.MODULE_PROGRESS,
    unlockRequirement: { module: MODULES.FITNESS, metric: UNLOCK_METRICS.WORKOUTS_COMPLETED, target: 20 },
    unlockDescription: 'Complete 20 workouts',
  },
  ring_intelligence: {
    unlockMethod: UNLOCK_METHODS.MODULE_PROGRESS,
    unlockRequirement: { module: MODULES.KNOWLEDGE, metric: UNLOCK_METRICS.STUDY_HOURS, target: 50 },
    unlockDescription: 'Log 50 study hours',
  },
  ring_vitality: {
    unlockMethod: UNLOCK_METHODS.STREAK,
    unlockRequirement: { streakDays: 30, module: MODULES.HEALTH },
    unlockDescription: '30-day health tracking streak',
  },
  ring_focus: {
    unlockMethod: UNLOCK_METHODS.MODULE_PROGRESS,
    unlockRequirement: { module: MODULES.PRODUCTIVITY, metric: UNLOCK_METRICS.FOCUS_SESSIONS, target: 50 },
    unlockDescription: 'Complete 50 focus sessions',
  },
  ring_warrior_signet: {
    unlockMethod: UNLOCK_METHODS.PVP,
    unlockRequirement: { wins: 25 },
    unlockDescription: 'Win 25 PvP battles',
  },
  ring_scholar: {
    unlockMethod: UNLOCK_METHODS.SKILL_TREE,
    unlockRequirement: { tree: SKILL_TREES.MIND, level: 25 },
    unlockDescription: 'Reach Mind Tree Level 25',
  },
  ring_power: {
    unlockMethod: UNLOCK_METHODS.LEVEL,
    unlockRequirement: { level: 35 },
    unlockDescription: 'Reach Level 35',
  },
  ring_immortal: {
    unlockMethod: UNLOCK_METHODS.PRESTIGE,
    unlockRequirement: { prestige: 1 },
    unlockDescription: 'Reach Prestige 1',
  },
  ring_one: {
    unlockMethod: UNLOCK_METHODS.SECRET,
    unlockRequirement: { hint: 'Complete all module masteries' },
    unlockDescription: '???',
  },

  // ========================================
  // AMULETS - Updated unlock methods
  // ========================================
  amulet_strength: {
    unlockMethod: UNLOCK_METHODS.MODULE_PROGRESS,
    unlockRequirement: { module: MODULES.FITNESS, metric: UNLOCK_METRICS.WORKOUTS_COMPLETED, target: 25 },
    unlockDescription: 'Complete 25 workouts',
  },
  amulet_mind: {
    unlockMethod: UNLOCK_METHODS.MODULE_PROGRESS,
    unlockRequirement: { module: MODULES.KNOWLEDGE, metric: UNLOCK_METRICS.BOOKS_READ, target: 8 },
    unlockDescription: 'Finish 8 books',
  },
  amulet_vitality: {
    unlockMethod: UNLOCK_METHODS.STREAK,
    unlockRequirement: { streakDays: 21, module: MODULES.HABITS },
    unlockDescription: '21-day habit streak',
  },
  amulet_guardian: {
    unlockMethod: UNLOCK_METHODS.MODULE_PROGRESS,
    unlockRequirement: { module: MODULES.PURPOSE, metric: UNLOCK_METRICS.GOALS_COMPLETED, target: 3 },
    unlockDescription: 'Complete 3 purpose goals',
  },
  amulet_dragon_tooth: {
    unlockMethod: UNLOCK_METHODS.ACHIEVEMENT,
    unlockRequirement: { achievementId: 'fitness_elite', achievementName: 'Fitness Elite' },
    unlockDescription: 'Complete "Fitness Elite" achievement',
  },
  amulet_arcane: {
    unlockMethod: UNLOCK_METHODS.SKILL_TREE,
    unlockRequirement: { tree: SKILL_TREES.MIND, level: 30 },
    unlockDescription: 'Reach Mind Tree Level 30',
  },
  amulet_phoenix_heart: {
    unlockMethod: UNLOCK_METHODS.STREAK,
    unlockRequirement: { streakDays: 100, module: null },
    unlockDescription: '100-day streak in any module',
  },
  amulet_celestial: {
    unlockMethod: UNLOCK_METHODS.LEVEL,
    unlockRequirement: { level: 40 },
    unlockDescription: 'Reach Level 40',
  },
  amulet_infinity: {
    unlockMethod: UNLOCK_METHODS.SECRET,
    unlockRequirement: { hint: 'Master all skill trees' },
    unlockDescription: '???',
  },

  // ========================================
  // ADDITIONAL WEAPONS - Updated unlock methods
  // ========================================
  weapon_sword_iron: {
    unlockMethod: UNLOCK_METHODS.LEVEL,
    unlockRequirement: { level: 5 },
    unlockDescription: 'Reach Level 5',
  },
  weapon_sword_crystal: {
    unlockMethod: UNLOCK_METHODS.BAZAAR,
    unlockRequirement: { price: 500 },
    unlockDescription: '500 Cosmic Credits',
  },
  weapon_sword_void: {
    unlockMethod: UNLOCK_METHODS.SKILL_TREE,
    unlockRequirement: { tree: SKILL_TREES.CRAFT, level: 25 },
    unlockDescription: 'Reach Craft Tree Level 25',
  },
  weapon_sword_celestial: {
    unlockMethod: UNLOCK_METHODS.ACHIEVEMENT,
    unlockRequirement: { achievementId: 'celestial_warrior', achievementName: 'Celestial Warrior' },
    unlockDescription: 'Complete "Celestial Warrior" achievement',
  },
  weapon_scholars_tome: {
    unlockMethod: UNLOCK_METHODS.MODULE_PROGRESS,
    unlockRequirement: { module: MODULES.KNOWLEDGE, metric: UNLOCK_METRICS.BOOKS_READ, target: 10 },
    unlockDescription: 'Finish 10 books',
  },
  weapon_quill_of_wisdom: {
    unlockMethod: UNLOCK_METHODS.MODULE_PROGRESS,
    unlockRequirement: { module: MODULES.JOURNAL, metric: UNLOCK_METRICS.JOURNAL_ENTRIES, target: 75 },
    unlockDescription: 'Write 75 journal entries',
  },
  weapon_crystal_wand: {
    unlockMethod: UNLOCK_METHODS.BAZAAR,
    unlockRequirement: { price: 350 },
    unlockDescription: '350 Cosmic Credits',
  },
  weapon_taskmaster_hammer: {
    unlockMethod: UNLOCK_METHODS.MODULE_PROGRESS,
    unlockRequirement: { module: MODULES.PRODUCTIVITY, metric: UNLOCK_METRICS.TASKS_COMPLETED, target: 300 },
    unlockDescription: 'Complete 300 tasks',
  },
  weapon_focus_blade: {
    unlockMethod: UNLOCK_METHODS.MODULE_PROGRESS,
    unlockRequirement: { module: MODULES.PRODUCTIVITY, metric: UNLOCK_METRICS.FOCUS_HOURS, target: 100 },
    unlockDescription: 'Log 100 focus hours',
  },

  // ========================================
  // ADDITIONAL CHESTS - Updated unlock methods
  // ========================================
  chest_armor_chainmail: {
    unlockMethod: UNLOCK_METHODS.LEVEL,
    unlockRequirement: { level: 8 },
    unlockDescription: 'Reach Level 8',
  },
  chest_armor_plate: {
    unlockMethod: UNLOCK_METHODS.MODULE_PROGRESS,
    unlockRequirement: { module: MODULES.FITNESS, metric: UNLOCK_METRICS.WORKOUTS_COMPLETED, target: 40 },
    unlockDescription: 'Complete 40 workouts',
  },
  chest_armor_cosmic: {
    unlockMethod: UNLOCK_METHODS.ACHIEVEMENT,
    unlockRequirement: { achievementId: 'cosmic_traveler', achievementName: 'Cosmic Traveler' },
    unlockDescription: 'Complete "Cosmic Traveler" achievement',
  },

  // ========================================
  // ADDITIONAL SHIELDS - Updated unlock methods
  // ========================================
  shield_aegis_of_mastery: {
    unlockMethod: UNLOCK_METHODS.PRESTIGE,
    unlockRequirement: { prestige: 2 },
    unlockDescription: 'Reach Prestige 2',
  },
  shield_phoenix_wing: {
    unlockMethod: UNLOCK_METHODS.STREAK,
    unlockRequirement: { streakDays: 75, module: null },
    unlockDescription: '75-day streak in any module',
  },

  // ========================================
  // ADDITIONAL CAPES - Updated unlock methods
  // ========================================
  cape_cloak_shadows: {
    unlockMethod: UNLOCK_METHODS.MODULE_PROGRESS,
    unlockRequirement: { module: MODULES.JOURNAL, metric: UNLOCK_METRICS.JOURNAL_ENTRIES, target: 60 },
    unlockDescription: 'Write 60 journal entries',
  },
  cape_storyteller: {
    unlockMethod: UNLOCK_METHODS.MODULE_PROGRESS,
    unlockRequirement: { module: MODULES.KNOWLEDGE, metric: UNLOCK_METRICS.BOOKS_READ, target: 12 },
    unlockDescription: 'Finish 12 books',
  },
  cape_memory_mantle: {
    unlockMethod: UNLOCK_METHODS.SKILL_TREE,
    unlockRequirement: { tree: SKILL_TREES.SPIRIT, level: 20 },
    unlockDescription: 'Reach Spirit Tree Level 20',
  },
};

/**
 * Bazaar-purchasable equipment items
 * These items can be bought with Cosmic Credits
 */
export const BAZAAR_EQUIPMENT = {
  // Common Bazaar Items (100-300 credits)
  weapon_sword_novice: { price: 100, category: 'weapons' },
  ring_copper_band: { price: 100, category: 'accessories' },
  amulet_wooden_charm: { price: 100, category: 'accessories' },
  cape_traveler: { price: 150, category: 'capes' },

  // Uncommon Bazaar Items (300-800 credits)
  weapon_crystal_wand: { price: 350, category: 'weapons' },
  weapon_sword_crystal: { price: 500, category: 'weapons' },
  cape_sage: { price: 400, category: 'capes' },

  // Rare Bazaar Items (800-2000 credits)
  weapon_enchanted_blade: { price: 1200, category: 'weapons' },
  cape_mystic_robe: { price: 1000, category: 'capes' },
  shield_steel_kite: { price: 1500, category: 'shields' },

  // Epic Bazaar Items (2000-5000 credits)
  weapon_thunder_hammer: { price: 3000, category: 'weapons' },
  chest_paladin_chestguard: { price: 3500, category: 'armor' },
  cape_shadow: { price: 2500, category: 'capes' },

  // Legendary Bazaar Items (5000+ credits)
  weapon_eternity_edge: { price: 8000, category: 'weapons' },
  cape_dragon: { price: 7500, category: 'capes' },
};

/**
 * PvP/Social unlockable equipment
 * Unlocked through competitive and social activities
 */
export const PVP_EQUIPMENT = {
  // PvP Victory Rewards
  ring_warrior_signet: { wins: 25, rank: null },
  helmet_steel_greathelm: { wins: 50, rank: null },
  weapon_battle_axe: { wins: 75, rank: null },
  shield_fortress: { wins: 100, rank: null },

  // Rank Rewards
  helmet_titanium: { wins: null, rank: 'gold' },
  weapon_executioner_axe: { wins: null, rank: 'platinum' },
  chest_titanium_platemail: { wins: null, rank: 'diamond' },
  weapon_godslayer: { wins: null, rank: 'legend' },
};

/**
 * Achievement-unlockable pets
 * Maps achievement IDs to pet rewards (uses petStore PET_DATABASE keys)
 */
export const ACHIEVEMENT_PETS = {
  // Quest Achievements - Unlock quest-themed pets
  first_quest: ['common_imp'],           // First Steps - Mischievous imp helper
  quest_novice: ['common_pixie'],        // Quest Novice - Celtic fairy guide
  quest_apprentice: ['uncommon_carbuncle'], // Quest Apprentice - Gem-seeking rabbit
  quest_master: ['rare_baku'],           // Quest Master - Dream-eating tapir
  boss_slayer: ['epic_chimera'],         // Boss Slayer - Multi-headed beast

  // Streak Achievements - Unlock dedication-themed pets
  streak_starter: ['common_will_o_wisp'], // 3-day streak - Ghost flame guide
  one_week: ['uncommon_griffin_chick'],  // 7-day streak - Loyal griffin
  two_weeks: ['uncommon_selkie'],        // 14-day streak - Shape-shifting seal
  one_month: ['rare_qilin'],             // 30-day streak - Auspicious qilin
  streak_60: ['epic_garuda'],            // 60-day streak - Divine eagle
  streak_90: ['epic_sleipnir'],          // 90-day streak - Odin's steed
  streak_legend: ['mythic_raiju'],       // 100-day streak - Lightning beast
  streak_365: ['mythic_jormungandr'],    // 365-day streak - World Serpent

  // Productivity Achievements - Unlock focus-themed pets
  deep_work_1: ['common_foo_pup'],       // First deep work - Guardian lion pup
  deep_work_10: ['uncommon_thunderbird'], // 10 hours - Lightning eagle
  deep_work_100: ['rare_anubis_jackal'], // 100 hours - Guide of souls
  task_slayer: ['rare_basilisk'],        // 100 tasks - Serpent king
  task_500: ['epic_nine_tailed_kitsune'], // 500 tasks - Ancient fox spirit

  // Health & Fitness Achievements - Unlock strength-themed pets
  first_workout: ['common_scarab'],      // First workout - Sacred beetle
  workout_50: ['uncommon_tanuki'],       // 50 workouts - Shapeshifting raccoon
  workout_100: ['rare_pegasus'],         // 100 workouts - Divine winged horse
  perfect_workout_week: ['epic_phoenix'], // 7-day workout streak - Immortal fire bird

  // Knowledge Achievements - Unlock wisdom-themed pets
  first_book: ['common_kitsune_pup'],    // First book - Young fox spirit
  bookworm: ['uncommon_domovoi'],        // 10 books - Household spirit
  books_25: ['rare_azure_dragon'],       // 25 books - Eastern dragon
  books_52: ['mythic_quetzalcoatl'],     // 52 books - Feathered serpent god

  // Financial Achievements
  first_goal_complete: ['uncommon_griffin_chick'], // Goal Achiever

  // Milestone Achievements - Unlock level-based pets
  level_10: ['common_imp'],              // Rising Star
  level_25: ['rare_azure_dragon'],       // Champion
  level_50: ['mythic_fenrir_pup'],       // Legend - Wolf of Ragnarok

  // Special Achievements
  life_optimizer: ['epic_fenghuang'],    // All modules in one day - Chinese phoenix empress
  balanced_week: ['mythic_leviathan'],   // All 8 modules in a week - Sea serpent
};

/**
 * Achievement-unlockable equipment
 * Maps achievement IDs to equipment rewards
 */
export const ACHIEVEMENT_EQUIPMENT = {
  // Fitness Achievements (matches achievementsStore IDs)
  first_workout: ['helmet_training'],
  workout_10: ['chest_padded_armor'],
  workout_50: ['helmet_steel_greathelm'],
  workout_100: ['chest_dragon', 'helmet_dragon'],

  // Knowledge Achievements (matches achievementsStore IDs)
  first_book: ['weapon_wooden_staff'],
  bookworm: ['helmet_scholar_circlet'],
  reading_10h: ['cape_sage'],

  // Productivity Achievements (matches achievementsStore IDs)
  deep_work_1: ['weapon_training_sword'],
  deep_work_10: ['weapon_iron_sword'],
  deep_work_100: ['weapon_steel_longsword'],
  task_slayer: ['weapon_dragon_blade'],

  // Streak Achievements (matches achievementsStore IDs)
  streak_starter: ['ring_copper_band'],
  one_week: ['ring_strength'],
  two_weeks: ['ring_intelligence'],
  one_month: ['ring_vitality'],
  streak_legend: ['helmet_phoenix_crown', 'ring_one'],

  // Quest Achievements (matches achievementsStore IDs)
  first_quest: ['cape_leather'],
  quest_novice: ['shield_wooden_buckler'],
  quest_apprentice: ['helmet_leather_hood'],
  quest_master: ['helmet_iron'],
  quest_legend: ['helmet_steel_greathelm'],
  boss_slayer: ['weapon_enchanted_blade'],
  dragon_hunter: ['chest_dragon', 'shield_dragon'],

  // Financial Achievements (matches achievementsStore IDs)
  budget_master: ['ring_focus'],
  expense_tracker: ['amulet_wooden_charm'],
  saver: ['ring_power'],

  // Contribution/Social Achievements
  first_contribution: ['cape_traveler'],
  contribution_10: ['cape_sage'],
  contribution_50: ['cape_enchanter'],
  contribution_100: ['cape_archmage'],

  // Goal Achievements
  first_goal_complete: ['amulet_stone_pendant'],
  goals_3_complete: ['amulet_strength'],
  goals_10_complete: ['amulet_guardian'],
};

/**
 * Quest-unlockable equipment
 * Specific quests that reward equipment
 */
export const QUEST_EQUIPMENT = {
  // Starter Quests
  welcome_quest: ['helmet_cloth_cap', 'chest_cloth_tunic', 'weapon_training_sword'],
  first_week_challenge: ['shield_wooden_buckler', 'cape_leather'],

  // Module Introduction Quests
  fitness_intro: ['legs_leather_leggings'],
  knowledge_intro: ['weapon_wizard_wand'],
  productivity_intro: ['weapon_iron_dagger'],
  journal_intro: ['ring_iron'],

  // Epic Quests
  dragon_slayer_quest: ['helmet_dragon', 'chest_dragon', 'shield_dragon'],
  phoenix_rebirth_quest: ['helmet_phoenix_crown', 'chest_phoenix', 'cape_phoenix'],
  celestial_journey: ['helmet_celestial_circlet', 'weapon_sword_celestial', 'amulet_celestial'],
};

/**
 * Daily Login Rewards
 * Equipment unlocked through consecutive daily logins
 */
export const DAILY_LOGIN_EQUIPMENT = {
  7: ['ring_copper_band'],
  14: ['amulet_stone_pendant'],
  30: ['cape_leather'],
  60: ['ring_intelligence'],
  90: ['weapon_wizard_wand'],
  180: ['cape_enchanter'],
  365: ['ring_one'],
};

/**
 * Nova AI Gift Equipment
 * Special equipment that Nova can gift based on user behavior
 */
export const NOVA_GIFT_EQUIPMENT = {
  comeback_kid: ['amulet_phoenix_heart'],  // Returning after long absence
  early_bird: ['ring_focus'],              // Consistently active in morning
  night_owl: ['cape_shadow'],              // Consistently active at night
  balanced_life: ['amulet_guardian'],      // Using all modules regularly
  productivity_star: ['weapon_taskmaster_hammer'], // High productivity week
  fitness_star: ['chest_reinforced_breastplate'], // Hitting all fitness goals
  knowledge_star: ['weapon_scholars_tome'], // Reading streak
};

/**
 * Apply unlock overrides to equipment database
 * Call this when initializing the equipment system
 */
export const applyUnlockOverrides = (equipmentDatabase) => {
  const updatedDatabase = { ...equipmentDatabase };

  Object.entries(EQUIPMENT_UNLOCK_OVERRIDES).forEach(([itemId, override]) => {
    if (updatedDatabase[itemId]) {
      updatedDatabase[itemId] = {
        ...updatedDatabase[itemId],
        ...override,
      };
    }
  });

  // Apply bazaar prices
  Object.entries(BAZAAR_EQUIPMENT).forEach(([itemId, bazaarInfo]) => {
    if (updatedDatabase[itemId]) {
      updatedDatabase[itemId].bazaarPrice = bazaarInfo.price;
      updatedDatabase[itemId].bazaarCategory = bazaarInfo.category;
      updatedDatabase[itemId].availableInBazaar = true;
    }
  });

  return updatedDatabase;
};

/**
 * Get all unlock methods available for an item
 * Some items can be unlocked multiple ways
 */
export const getItemUnlockPaths = (itemId) => {
  const paths = [];

  // Check main unlock method
  if (EQUIPMENT_UNLOCK_OVERRIDES[itemId]) {
    paths.push({
      type: 'primary',
      ...EQUIPMENT_UNLOCK_OVERRIDES[itemId],
    });
  }

  // Check if available in bazaar
  if (BAZAAR_EQUIPMENT[itemId]) {
    paths.push({
      type: 'bazaar',
      unlockMethod: UNLOCK_METHODS.BAZAAR,
      unlockRequirement: { price: BAZAAR_EQUIPMENT[itemId].price },
      unlockDescription: `${BAZAAR_EQUIPMENT[itemId].price} Cosmic Credits`,
    });
  }

  // Check if unlockable via PvP
  if (PVP_EQUIPMENT[itemId]) {
    const pvpReq = PVP_EQUIPMENT[itemId];
    paths.push({
      type: 'pvp',
      unlockMethod: UNLOCK_METHODS.PVP,
      unlockRequirement: pvpReq,
      unlockDescription: pvpReq.wins
        ? `Win ${pvpReq.wins} PvP battles`
        : `Reach ${pvpReq.rank} rank`,
    });
  }

  // Check if unlockable via achievements
  Object.entries(ACHIEVEMENT_EQUIPMENT).forEach(([achievementId, items]) => {
    if (items.includes(itemId)) {
      paths.push({
        type: 'achievement',
        unlockMethod: UNLOCK_METHODS.ACHIEVEMENT,
        unlockRequirement: { achievementId },
        unlockDescription: `Complete "${achievementId}" achievement`,
      });
    }
  });

  // Check if unlockable via quests
  Object.entries(QUEST_EQUIPMENT).forEach(([questId, items]) => {
    if (items.includes(itemId)) {
      paths.push({
        type: 'quest',
        unlockMethod: UNLOCK_METHODS.QUEST,
        unlockRequirement: { questId },
        unlockDescription: `Complete "${questId}" quest`,
      });
    }
  });

  // Check if unlockable via daily login
  Object.entries(DAILY_LOGIN_EQUIPMENT).forEach(([days, items]) => {
    if (items.includes(itemId)) {
      paths.push({
        type: 'daily_login',
        unlockMethod: UNLOCK_METHODS.DAILY_LOGIN,
        unlockRequirement: { days: parseInt(days) },
        unlockDescription: `${days}-day login streak`,
      });
    }
  });

  return paths;
};

/**
 * Get items that can be unlocked through a specific method
 */
export const getItemsByUnlockMethod = (method) => {
  const items = [];

  Object.entries(EQUIPMENT_UNLOCK_OVERRIDES).forEach(([itemId, config]) => {
    if (config.unlockMethod === method) {
      items.push(itemId);
    }
  });

  return items;
};

/**
 * Check if an item is unlockable through multiple methods
 */
export const hasMultipleUnlockPaths = (itemId) => {
  return getItemUnlockPaths(itemId).length > 1;
};
