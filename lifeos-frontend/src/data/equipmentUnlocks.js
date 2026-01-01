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

  // ========================================
  // MYTHICAL HELMETS - Ultimate unlock methods
  // ========================================
  helmet_void_crown: {
    unlockMethod: UNLOCK_METHODS.SECRET,
    unlockRequirement: { hint: 'Master all modules and reach Prestige 3' },
    unlockDescription: '???',
  },
  helmet_crystal_diadem: {
    unlockMethod: UNLOCK_METHODS.MODULE_PROGRESS,
    unlockRequirement: { module: MODULES.KNOWLEDGE, metric: UNLOCK_METRICS.BOOKS_READ, target: 52 },
    unlockDescription: 'Read 52 books (one year of weekly reading)',
  },
  helmet_celestial_halo_crown: {
    unlockMethod: UNLOCK_METHODS.STREAK,
    unlockRequirement: { streakDays: 180, module: null },
    unlockDescription: '180-day streak in any module',
  },
  helmet_abyssal_visage: {
    unlockMethod: UNLOCK_METHODS.PVP,
    unlockRequirement: { wins: 200, rank: 'diamond' },
    unlockDescription: 'Win 200 PvP battles and reach Diamond rank',
  },
  helmet_stormforged_helm: {
    unlockMethod: UNLOCK_METHODS.MODULE_PROGRESS,
    unlockRequirement: { module: MODULES.FITNESS, metric: UNLOCK_METRICS.WORKOUTS_COMPLETED, target: 200 },
    unlockDescription: 'Complete 200 workouts',
  },
  helmet_infernal_visage: {
    unlockMethod: UNLOCK_METHODS.ACHIEVEMENT,
    unlockRequirement: { achievementId: 'infernal_dedication', achievementName: 'Infernal Dedication' },
    unlockDescription: 'Complete "Infernal Dedication" achievement (complete all daily tasks for 90 days)',
  },

  // ========================================
  // MYTHICAL CHESTS - Ultimate unlock methods
  // ========================================
  chest_void_platemail: {
    unlockMethod: UNLOCK_METHODS.PRESTIGE,
    unlockRequirement: { prestige: 3 },
    unlockDescription: 'Reach Prestige 3',
  },
  chest_crystal_aegis: {
    unlockMethod: UNLOCK_METHODS.SKILL_TREE,
    unlockRequirement: { tree: SKILL_TREES.MIND, level: 50 },
    unlockDescription: 'Reach Mind Tree Level 50',
  },
  chest_celestial_raiment: {
    unlockMethod: UNLOCK_METHODS.STREAK,
    unlockRequirement: { streakDays: 200, module: null },
    unlockDescription: '200-day streak in any module',
  },
  chest_abyssal_cuirass: {
    unlockMethod: UNLOCK_METHODS.PVP,
    unlockRequirement: { wins: null, rank: 'legend' },
    unlockDescription: 'Reach Legend rank in PvP',
  },
  chest_stormforged_breastplate: {
    unlockMethod: UNLOCK_METHODS.MODULE_PROGRESS,
    unlockRequirement: { module: MODULES.FITNESS, metric: UNLOCK_METRICS.WORKOUTS_COMPLETED, target: 300 },
    unlockDescription: 'Complete 300 workouts',
  },
  chest_infernal_harness: {
    unlockMethod: UNLOCK_METHODS.MODULE_PROGRESS,
    unlockRequirement: { module: MODULES.PRODUCTIVITY, metric: UNLOCK_METRICS.TASKS_COMPLETED, target: 1000 },
    unlockDescription: 'Complete 1000 tasks',
  },

  // ========================================
  // MYTHICAL WEAPONS - Ultimate unlock methods
  // ========================================
  weapon_void_scythe: {
    unlockMethod: UNLOCK_METHODS.SECRET,
    unlockRequirement: { hint: 'Defeat the Void King boss 10 times' },
    unlockDescription: '???',
  },
  weapon_frostbite_blade: {
    unlockMethod: UNLOCK_METHODS.MODULE_PROGRESS,
    unlockRequirement: { module: MODULES.CALENDAR, metric: UNLOCK_METRICS.PLANNING_ACCURACY, target: 90 },
    unlockDescription: 'Maintain 90% planning accuracy for 30 days',
  },
  weapon_celestial_mace: {
    unlockMethod: UNLOCK_METHODS.ACHIEVEMENT,
    unlockRequirement: { achievementId: 'celestial_guardian', achievementName: 'Celestial Guardian' },
    unlockDescription: 'Complete "Celestial Guardian" achievement (help 50 community members)',
  },
  weapon_abyssal_trident: {
    unlockMethod: UNLOCK_METHODS.PVP,
    unlockRequirement: { wins: 150, rank: 'platinum' },
    unlockDescription: 'Win 150 PvP battles and reach Platinum rank',
  },
  weapon_thunderstrike_axe: {
    unlockMethod: UNLOCK_METHODS.MODULE_PROGRESS,
    unlockRequirement: { module: MODULES.HABITS, metric: UNLOCK_METRICS.HABITS_COMPLETED, target: 500 },
    unlockDescription: 'Complete 500 habit check-ins',
  },
  weapon_infernal_greatsword: {
    unlockMethod: UNLOCK_METHODS.SKILL_TREE,
    unlockRequirement: { tree: SKILL_TREES.BODY, level: 50 },
    unlockDescription: 'Reach Body Tree Level 50',
  },

  // ========================================
  // MYTHICAL SHIELDS - Ultimate unlock methods
  // ========================================
  shield_void_bulwark: {
    unlockMethod: UNLOCK_METHODS.PRESTIGE,
    unlockRequirement: { prestige: 4 },
    unlockDescription: 'Reach Prestige 4',
  },
  shield_glacial_aegis: {
    unlockMethod: UNLOCK_METHODS.MODULE_PROGRESS,
    unlockRequirement: { module: MODULES.HEALTH, metric: UNLOCK_METRICS.HEALTH_SCORE, target: 95 },
    unlockDescription: 'Maintain 95% health score for 60 days',
  },
  shield_divine_barrier: {
    unlockMethod: UNLOCK_METHODS.LEVEL,
    unlockRequirement: { level: 75 },
    unlockDescription: 'Reach Level 75',
  },

  // ========================================
  // MYTHICAL CAPES - Ultimate unlock methods
  // ========================================
  cape_void_shroud: {
    unlockMethod: UNLOCK_METHODS.SECRET,
    unlockRequirement: { hint: 'Collect all void equipment pieces' },
    unlockDescription: '???',
  },
  cape_frostweave_mantle: {
    unlockMethod: UNLOCK_METHODS.MODULE_PROGRESS,
    unlockRequirement: { module: MODULES.JOURNAL, metric: UNLOCK_METRICS.JOURNAL_ENTRIES, target: 365 },
    unlockDescription: 'Write 365 journal entries (one year of daily journaling)',
  },
  cape_celestial_wings: {
    unlockMethod: UNLOCK_METHODS.STREAK,
    unlockRequirement: { streakDays: 365, module: null },
    unlockDescription: '365-day streak (one full year)',
  },
  cape_abyssal_cloak: {
    unlockMethod: UNLOCK_METHODS.PVP,
    unlockRequirement: { wins: 300, rank: 'diamond' },
    unlockDescription: 'Win 300 PvP battles and reach Diamond rank',
  },

  // ========================================
  // MYTHICAL LEGS - Ultimate unlock methods
  // ========================================
  legs_void_greaves: {
    unlockMethod: UNLOCK_METHODS.PRESTIGE,
    unlockRequirement: { prestige: 2 },
    unlockDescription: 'Reach Prestige 2',
  },
  legs_crystal_legguards: {
    unlockMethod: UNLOCK_METHODS.SKILL_TREE,
    unlockRequirement: { tree: SKILL_TREES.CRAFT, level: 40 },
    unlockDescription: 'Reach Craft Tree Level 40',
  },
  legs_celestial_tassets: {
    unlockMethod: UNLOCK_METHODS.STREAK,
    unlockRequirement: { streakDays: 150, module: MODULES.FITNESS },
    unlockDescription: '150-day fitness streak',
  },
  legs_abyssal_cuisses: {
    unlockMethod: UNLOCK_METHODS.PVP,
    unlockRequirement: { wins: 100, rank: 'gold' },
    unlockDescription: 'Win 100 PvP battles and reach Gold rank',
  },
  legs_stormforged_greaves: {
    unlockMethod: UNLOCK_METHODS.MODULE_PROGRESS,
    unlockRequirement: { module: MODULES.FITNESS, metric: UNLOCK_METRICS.WORKOUTS_COMPLETED, target: 150 },
    unlockDescription: 'Complete 150 workouts',
  },
  legs_infernal_legguards: {
    unlockMethod: UNLOCK_METHODS.MODULE_PROGRESS,
    unlockRequirement: { module: MODULES.PRODUCTIVITY, metric: UNLOCK_METRICS.FOCUS_HOURS, target: 500 },
    unlockDescription: 'Log 500 focus hours',
  },
};

/**
 * Bazaar-purchasable equipment items
 * These items can ONLY be bought with Cosmic Credits (bazaar-exclusive)
 * Combined with 8 abilities in elementalAbilities.js = ~20 total bazaar items
 */
export const BAZAAR_EQUIPMENT = {
  // ========================================
  // WEAPONS (4 items) - 350-2000 credits
  // ========================================
  weapon_crystal_wand: { price: 350, category: 'weapons' },      // Uncommon mage weapon
  weapon_sword_crystal: { price: 500, category: 'weapons' },     // Uncommon crystal sword
  weapon_battle_axe: { price: 800, category: 'weapons' },        // Rare warrior weapon
  weapon_archmage_staff: { price: 1500, category: 'weapons' },   // Rare mage staff

  // ========================================
  // ARMOR (4 items) - 400-1800 credits
  // ========================================
  helmet_reinforced_coif: { price: 400, category: 'helmets' },   // Uncommon helmet
  helmet_mindguard: { price: 1200, category: 'helmets' },        // Rare mage helmet
  chest_padded_armor: { price: 500, category: 'armor' },         // Uncommon chest
  chest_reinforced_breastplate: { price: 1800, category: 'armor' }, // Rare chest

  // ========================================
  // ACCESSORIES & OTHER (4 items) - 600-1500 credits
  // ========================================
  cape_mystic_robe: { price: 800, category: 'capes' },           // Rare mage cape
  cape_ancient: { price: 600, category: 'capes' },               // Uncommon ancient cape
  legs_steel_legplates: { price: 1000, category: 'legs' },       // Rare leg armor
  shield_steel_kite: { price: 1500, category: 'shields' },       // Rare shield
};

/**
 * PvP/Social unlockable equipment
 * Unlocked through competitive and social activities
 */
export const PVP_EQUIPMENT = {
  // PvP Victory Rewards
  ring_warrior_signet: { wins: 25, rank: null },
  helmet_steel_greathelm: { wins: 50, rank: null },
  weapon_thunder_hammer: { wins: 75, rank: null },
  shield_fortress: { wins: 100, rank: null },

  // Rank Rewards
  helmet_titanium: { wins: null, rank: 'gold' },
  weapon_executioner_axe: { wins: null, rank: 'platinum' },
  chest_titanium_platemail: { wins: null, rank: 'diamond' },
  weapon_godslayer: { wins: null, rank: 'legend' },

  // Mythical PvP Rewards (high tier - endgame)
  legs_abyssal_cuisses: { wins: 100, rank: 'gold' },
  weapon_abyssal_trident: { wins: 150, rank: 'platinum' },
  helmet_abyssal_visage: { wins: 200, rank: 'diamond' },
  cape_abyssal_cloak: { wins: 300, rank: 'diamond' },
  chest_abyssal_cuirass: { wins: null, rank: 'legend' },
};

/**
 * Achievement-unlockable pets
 * Maps achievement IDs to pet rewards (uses petStore PET_DATABASE keys)
 * IMPORTANT: Each achievement should only unlock ONE type of reward (ability, pet, OR equipment)
 */
export const ACHIEVEMENT_PETS = {
  // Quest Achievements - Keep pets (no ability conflicts)
  quest_novice: ['common_pixie'],        // Quest Novice - Celtic fairy guide
  quest_apprentice: ['uncommon_carbuncle'], // Quest Apprentice - Gem-seeking rabbit
  quest_master: ['rare_baku'],           // Quest Master - Dream-eating tapir
  boss_slayer: ['epic_chimera'],         // Boss Slayer - Multi-headed beast

  // Streak Achievements - redistributed (removed those with ability conflicts)
  one_month: ['rare_qilin'],             // 30-day streak - Auspicious qilin (no ability conflict)
  streak_60: ['epic_garuda'],            // 60-day streak - Divine eagle
  streak_90: ['epic_sleipnir'],          // 90-day streak - Odin's steed
  streak_legend: ['mythic_raiju'],       // 100-day streak - Lightning beast
  streak_365: ['mythic_jormungandr'],    // 365-day streak - World Serpent

  // Productivity Achievements - redistributed (removed those with ability conflicts)
  deep_work_1: ['common_foo_pup'],       // First deep work - Guardian lion pup (no ability conflict)
  task_slayer: ['rare_basilisk'],        // 100 tasks - Serpent king (no ability conflict)
  total_activities_1000: ['epic_nine_tailed_kitsune'], // Moved from task_500 (has thunder_storm ability)

  // Health & Fitness Achievements - redistributed (removed those with ability conflicts)
  workout_100: ['rare_pegasus'],         // 100 workouts - Divine winged horse (no ability conflict)
  early_riser_streak: ['epic_phoenix'],  // Moved from perfect_workout_week (has stone_spike ability)

  // Knowledge Achievements - redistributed (removed those with ability conflicts)
  books_25: ['rare_azure_dragon'],       // 25 books - Eastern dragon (no ability conflict)
  books_52: ['mythic_quetzalcoatl'],     // 52 books - Feathered serpent god

  // Pets moved from conflicting achievements to new homes:
  first_project: ['common_imp'],         // Moved from first_quest (has lightning_strike ability)
  journal_10: ['common_will_o_wisp'],    // Moved from streak_starter (has toxic_spit ability)
  cardio_sessions_25: ['uncommon_griffin_chick'], // Moved from one_week (has inferno ability)
  cardio_sessions_100: ['uncommon_selkie'], // Moved from two_weeks (has blizzard ability)
  marathon_session: ['uncommon_thunderbird'], // Moved from deep_work_10 (has ice_beam ability)
  deep_work_1000: ['rare_anubis_jackal'], // Moved from deep_work_100 (has dark_tendrils ability)
  volume_10k: ['common_scarab'],         // Moved from first_workout (has rock_throw ability)
  volume_100k: ['uncommon_tanuki'],      // Moved from workout_50 (has power_buff ability)
  notes_50: ['common_kitsune_pup'],      // Moved from first_book (has wind_slash ability)
  notes_200: ['uncommon_domovoi'],       // Moved from bookworm (has tornado ability)
  goal_50_percent: ['uncommon_griffin_chick'], // Moved from first_goal_complete (has holy_light ability)

  // Milestone Achievements - redistributed (removed those with ability conflicts)
  level_10: ['common_imp'],              // Rising Star - no ability conflict
  journal_50: ['rare_azure_dragon'],     // Moved from level_25 (has earthquake ability)
  six_months: ['mythic_fenrir_pup'],     // Moved from level_50 (has landslide ability)

  // Special Achievements - redistributed
  life_optimizer: ['epic_fenghuang'],    // All modules in one day - Chinese phoenix empress (no conflict)
  total_activities_5000: ['mythic_leviathan'], // Moved from balanced_week (has greater_heal ability)
};

/**
 * Achievement-unlockable equipment
 * Maps achievement IDs to equipment rewards
 * IMPORTANT: Each achievement should only unlock ONE type of reward (ability, pet, OR equipment)
 */
export const ACHIEVEMENT_EQUIPMENT = {
  // Fitness Achievements - redistributed from conflicting achievements
  workout_10: ['legs_leather_leggings'],           // Basic leg armor for early fitness
  burn_1000_cal: ['helmet_training'],              // Moved from first_workout (has ability)
  burn_10000_cal: ['helmet_steel_greathelm'],      // Moved from workout_50 (has ability)
  burn_50000_cal: ['chest_dragon'],                // Moved from workout_100 (has pet)
  burn_100000_cal: ['helmet_dragon'],              // Moved from workout_100 (has pet)

  // Knowledge Achievements - redistributed
  reading_10h: ['ring_intelligence'],              // Moved from two_weeks (has ability)
  ideas_25: ['weapon_wooden_staff'],               // Moved from first_book (has ability)
  ideas_100: ['helmet_scholar_circlet'],           // Moved from bookworm (has ability)
  reading_200h: ['cape_sage'],                     // Moved from reading_10h (keeping ring there)

  // Productivity Achievements - redistributed
  task_streak_7: ['weapon_training_sword'],        // Moved from deep_work_1 (has pet)
  deep_work_500: ['weapon_iron_sword'],            // Moved from deep_work_10 (has ability)
  task_1000: ['weapon_steel_longsword'],           // Moved from deep_work_100 (has ability)
  projects_25: ['weapon_dragon_blade'],            // Moved from task_slayer (has pet)

  // Streak Achievements - redistributed
  total_activities_100: ['ring_copper_band'],      // Moved from streak_starter (has ability)
  first_pr: ['ring_strength'],                     // Moved from one_week (has ability)
  three_months: ['ring_vitality'],                 // Moved from one_month (has pet)
  streak_180: ['helmet_phoenix_crown'],            // Moved from streak_legend (has pet)
  first_year: ['ring_one'],                        // Moved from streak_legend (streak_365 has pet)

  // Quest Achievements - redistributed
  first_month: ['cape_leather'],                   // Moved from first_quest (has ability)
  goals_3_complete: ['shield_wooden_buckler'],     // Moved from quest_novice (has pet)
  contribution_10: ['helmet_leather_hood'],        // Moved from quest_apprentice (has pet)
  projects_5: ['helmet_iron'],                     // Moved from quest_master (has pet)
  quest_legend: ['weapon_enchanted_blade'],        // Moved from boss_slayer (has pet)
  weekend_warrior: ['chest_dragon'],               // Moved from dragon_hunter (has ability)
  monday_motivator: ['shield_dragon'],             // Moved from dragon_hunter (has ability)

  // Financial Achievements - redistributed
  savings_streak_12: ['ring_focus'],               // Moved from budget_master (has ability)
  expense_tracker: ['amulet_wooden_charm'],        // No conflict - only unlocks this
  saver: ['ring_power'],                           // No conflict - only unlocks this

  // Contribution/Social Achievements
  first_contribution: ['cape_traveler'],           // No conflict - ability water_blast is separate
  contribution_50: ['cape_enchanter'],             // No conflict - only unlocks this
  contribution_100: ['cape_archmage'],             // No conflict - only unlocks this (helmet_leather_hood moved here from contribution_10)

  // Goal Achievements - redistributed
  goal_25_percent: ['amulet_stone_pendant'],       // Moved from first_goal_complete (has ability)
  goals_10_complete: ['amulet_guardian'],          // No conflict - only unlocks this
  goal_75_percent: ['amulet_strength'],            // Moved from goals_3_complete (now has equipment)

  // Mythical Achievement Rewards
  infernal_dedication: ['helmet_infernal_visage'], // No conflict - 90-day daily task completion
  celestial_guardian: ['weapon_celestial_mace'],   // No conflict - Help 50 community members
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
  fitness_star: ['chest_paladin_chestguard'], // Hitting all fitness goals
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
