/**
 * Hero Evolution System - 40 Stages of Personal Mastery
 * "The Hero's Ascension" - A journey from dreamer to master
 *
 * Four Acts of Transformation:
 * ACT I: THE AWAKENING (1-10) - Civilian to Warrior
 * ACT II: THE TRIALS (11-20) - Specialist Evolution
 * ACT III: MASTERY (21-30) - Master Class
 * ACT IV: LEGEND (31-40) - Mythic Transformation
 */

// Evolution Stage Definitions (40 total)
export const EVOLUTION_STAGES = {
  // ========== ACT I: THE AWAKENING (Levels 1-10) ==========
  1: {
    id: 'dreamer',
    name: 'Dreamer',
    description: 'A hopeful soul with untapped potential, standing at the beginning of an extraordinary journey',
    levelRequired: 1,
    prestige: 0,
    act: 1,
    actName: 'The Awakening',
    category: 'The Awakening',
    sprite: 'evolution/hero_v2_stage_1_dreamer.png',
    colors: { primary: '#8B7355', secondary: '#A0826D', accent: '#D4C5B9' },
  },
  2: {
    id: 'seeker',
    name: 'Seeker',
    description: 'One who has chosen to pursue growth, standing tall with determination',
    levelRequired: 2,
    prestige: 0,
    act: 1,
    actName: 'The Awakening',
    category: 'The Awakening',
    sprite: 'evolution/hero_v2_stage_2_seeker.png',
    colors: { primary: '#8B7355', secondary: '#6B5D4F', accent: '#A0826D' },
  },
  3: {
    id: 'recruit',
    name: 'Recruit',
    description: 'First steps into training, wielding basic weapons and building foundation',
    levelRequired: 3,
    prestige: 0,
    act: 1,
    actName: 'The Awakening',
    category: 'The Awakening',
    sprite: 'evolution/hero_v2_stage_3_recruit.png',
    colors: { primary: '#A0826D', secondary: '#8B7355', accent: '#D4C5B9' },
  },
  4: {
    id: 'trainee',
    name: 'Trainee',
    description: 'Developing skills and discipline through dedicated practice',
    levelRequired: 4,
    prestige: 0,
    act: 1,
    actName: 'The Awakening',
    category: 'The Awakening',
    sprite: 'evolution/hero_v2_stage_4_trainee.png',
    colors: { primary: '#D4C5B9', secondary: '#A0826D', accent: '#8B7355' },
  },
  5: {
    id: 'squire',
    name: 'Squire',
    description: 'Learning the ways of combat, equipped with real steel for the first time',
    levelRequired: 5,
    prestige: 0,
    act: 1,
    actName: 'The Awakening',
    category: 'The Awakening',
    sprite: 'evolution/hero_v2_stage_5_squire.png',
    colors: { primary: '#8B7355', secondary: '#6B5D4F', accent: '#C0C0C0' },
  },
  6: {
    id: 'initiate',
    name: 'Initiate',
    description: 'Proven worthy of chainmail and steel, ready for real battle',
    levelRequired: 6,
    prestige: 0,
    act: 1,
    actName: 'The Awakening',
    category: 'The Awakening',
    sprite: 'evolution/hero_v2_stage_6_initiate.png',
    colors: { primary: '#C0C0C0', secondary: '#8B7355', accent: '#A8A8A8' },
  },
  7: {
    id: 'footman',
    name: 'Footman',
    description: 'A reliable soldier, standing in formation with spear and shield',
    levelRequired: 7,
    prestige: 0,
    act: 1,
    actName: 'The Awakening',
    category: 'The Awakening',
    sprite: 'evolution/hero_v2_stage_7_footman.png',
    colors: { primary: '#6B5D4F', secondary: '#C0C0C0', accent: '#8B7355' },
  },
  8: {
    id: 'scout',
    name: 'Scout',
    description: 'Swift and agile, mastering the bow and forest paths',
    levelRequired: 8,
    prestige: 0,
    act: 1,
    actName: 'The Awakening',
    category: 'The Awakening',
    sprite: 'evolution/hero_v2_stage_8_scout.png',
    colors: { primary: '#4A7C59', secondary: '#8B7355', accent: '#6B5D4F' },
  },
  9: {
    id: 'warrior',
    name: 'Warrior',
    description: 'Battle-tested and fierce, wielding blade with deadly intent',
    levelRequired: 9,
    prestige: 0,
    act: 1,
    actName: 'The Awakening',
    category: 'The Awakening',
    sprite: 'evolution/hero_v2_stage_9_warrior.png',
    colors: { primary: '#6B6B6B', secondary: '#8B7355', accent: '#4A4A4A' },
  },
  10: {
    id: 'swordsman',
    name: 'Swordsman',
    description: 'Master of dual blades, a skilled fighter ready for greater challenges',
    levelRequired: 10,
    prestige: 0,
    act: 1,
    actName: 'The Awakening',
    category: 'The Awakening',
    sprite: 'evolution/hero_v2_stage_10_swordsman.png',
    colors: { primary: '#C0C0C0', secondary: '#8B7355', accent: '#E8E8E8' },
  },

  // ========== ACT II: THE TRIALS (Levels 11-20) ==========
  11: {
    id: 'duelist',
    name: 'Duelist',
    description: 'Elegant and deadly, fighting with grace and precision',
    levelRequired: 11,
    prestige: 0,
    act: 2,
    actName: 'The Trials',
    category: 'The Trials',
    sprite: 'evolution/hero_v2_stage_11_duelist.png',
    colors: { primary: '#1E3A8A', secondary: '#C0C0C0', accent: '#3B82F6' },
  },
  12: {
    id: 'berserker',
    name: 'Berserker',
    description: 'Fury incarnate, wielding massive weapons with primal rage',
    levelRequired: 12,
    prestige: 0,
    act: 2,
    actName: 'The Trials',
    category: 'The Trials',
    sprite: 'evolution/hero_v2_stage_12_berserker.png',
    colors: { primary: '#8B4513', secondary: '#6B5D4F', accent: '#4A4A4A' },
  },
  13: {
    id: 'knight',
    name: 'Knight',
    description: 'Noble and honorable, clad in shining plate with heraldic pride',
    levelRequired: 13,
    prestige: 0,
    act: 2,
    actName: 'The Trials',
    category: 'The Trials',
    sprite: 'evolution/hero_v2_stage_13_knight.png',
    colors: { primary: '#E8E8E8', secondary: '#DC2626', accent: '#C0C0C0' },
  },
  14: {
    id: 'ranger',
    name: 'Ranger',
    description: 'One with the forest, striking from shadows with perfect aim',
    levelRequired: 14,
    prestige: 0,
    act: 2,
    actName: 'The Trials',
    category: 'The Trials',
    sprite: 'evolution/hero_v2_stage_14_ranger.png',
    colors: { primary: '#166534', secondary: '#8B7355', accent: '#4A7C59' },
  },
  15: {
    id: 'paladin',
    name: 'Paladin',
    description: 'Holy warrior blessed with divine light and righteous purpose',
    levelRequired: 15,
    prestige: 0,
    act: 2,
    actName: 'The Trials',
    category: 'The Trials',
    sprite: 'evolution/hero_v2_stage_15_paladin.png',
    colors: { primary: '#F3F4F6', secondary: '#FCD34D', accent: '#E8E8E8' },
  },
  16: {
    id: 'monk',
    name: 'Monk',
    description: 'Disciplined martial artist, channeling inner peace into deadly strikes',
    levelRequired: 16,
    prestige: 0,
    act: 2,
    actName: 'The Trials',
    category: 'The Trials',
    sprite: 'evolution/hero_v2_stage_16_monk.png',
    colors: { primary: '#EA580C', secondary: '#F3F4F6', accent: '#DC2626' },
  },
  17: {
    id: 'assassin',
    name: 'Assassin',
    description: 'Shadow incarnate, striking unseen from the darkness',
    levelRequired: 17,
    prestige: 0,
    act: 2,
    actName: 'The Trials',
    category: 'The Trials',
    sprite: 'evolution/hero_v2_stage_17_assassin.png',
    colors: { primary: '#1F1F1F', secondary: '#6B21A8', accent: '#4A4A4A' },
  },
  18: {
    id: 'battlemage',
    name: 'Battlemage',
    description: 'Fusion of steel and sorcery, wielding arcane might in combat',
    levelRequired: 18,
    prestige: 0,
    act: 2,
    actName: 'The Trials',
    category: 'The Trials',
    sprite: 'evolution/hero_v2_stage_18_battlemage.png',
    colors: { primary: '#7C3AED', secondary: '#C0C0C0', accent: '#A855F7' },
  },
  19: {
    id: 'champion',
    name: 'Champion',
    description: 'Victorious in tournament, bearing the banner of glory',
    levelRequired: 19,
    prestige: 0,
    act: 2,
    actName: 'The Trials',
    category: 'The Trials',
    sprite: 'evolution/hero_v2_stage_19_champion.png',
    colors: { primary: '#FCD34D', secondary: '#1E3A8A', accent: '#F59E0B' },
  },
  20: {
    id: 'veteran',
    name: 'Veteran',
    description: 'Scarred by countless battles, a survivor who knows war\'s true face',
    levelRequired: 20,
    prestige: 0,
    act: 2,
    actName: 'The Trials',
    category: 'The Trials',
    sprite: 'evolution/hero_v2_stage_20_veteran.png',
    colors: { primary: '#4A4A4A', secondary: '#6B6B6B', accent: '#8B7355' },
  },

  // ========== ACT III: MASTERY (Levels 21-30) ==========
  21: {
    id: 'blade_master',
    name: 'Blade Master',
    description: 'Perfection in swordsmanship, blade glowing with mastered energy',
    levelRequired: 21,
    prestige: 0,
    act: 3,
    actName: 'Mastery',
    category: 'Mastery',
    sprite: 'evolution/hero_v2_stage_21_blade_master.png',
    colors: { primary: '#C0C0C0', secondary: '#3B82F6', accent: '#60A5FA' },
  },
  22: {
    id: 'war_chief',
    name: 'War Chief',
    description: 'Tribal commander leading warriors with strength and wisdom',
    levelRequired: 22,
    prestige: 0,
    act: 3,
    actName: 'Mastery',
    category: 'Mastery',
    sprite: 'evolution/hero_v2_stage_22_war_chief.png',
    colors: { primary: '#8B4513', secondary: '#DC2626', accent: '#F3F4F6' },
  },
  23: {
    id: 'dragon_knight',
    name: 'Dragon Knight',
    description: 'Clad in dragon scales, a slayer of beasts and legends',
    levelRequired: 23,
    prestige: 0,
    act: 3,
    actName: 'Mastery',
    category: 'Mastery',
    sprite: 'evolution/hero_v2_stage_23_dragon_knight.png',
    colors: { primary: '#DC2626', secondary: '#FCD34D', accent: '#991B1B' },
  },
  24: {
    id: 'shadow_master',
    name: 'Shadow Master',
    description: 'Ethereal and elusive, moving between reality and shadow',
    levelRequired: 24,
    prestige: 0,
    act: 3,
    actName: 'Mastery',
    category: 'Mastery',
    sprite: 'evolution/hero_v2_stage_24_shadow_master.png',
    colors: { primary: '#1F1F1F', secondary: '#7C3AED', accent: '#4A4A4A' },
  },
  25: {
    id: 'holy_crusader',
    name: 'Holy Crusader',
    description: 'Divine champion radiating golden light and heavenly might',
    levelRequired: 25,
    prestige: 0,
    act: 3,
    actName: 'Mastery',
    category: 'Mastery',
    sprite: 'evolution/hero_v2_stage_25_holy_crusader.png',
    colors: { primary: '#FCD34D', secondary: '#F3F4F6', accent: '#F59E0B' },
  },
  26: {
    id: 'arcane_warrior',
    name: 'Arcane Warrior',
    description: 'Armor inscribed with glowing runes, master of spellblade arts',
    levelRequired: 26,
    prestige: 0,
    act: 3,
    actName: 'Mastery',
    category: 'Mastery',
    sprite: 'evolution/hero_v2_stage_26_arcane_warrior.png',
    colors: { primary: '#C0C0C0', secondary: '#7C3AED', accent: '#A855F7' },
  },
  27: {
    id: 'beast_master',
    name: 'Beast Master',
    description: 'Accompanied by loyal animal spirits, one with nature\'s fury',
    levelRequired: 27,
    prestige: 0,
    act: 3,
    actName: 'Mastery',
    category: 'Mastery',
    sprite: 'evolution/hero_v2_stage_27_beast_master.png',
    colors: { primary: '#8B7355', secondary: '#10B981', accent: '#4A7C59' },
  },
  28: {
    id: 'demon_hunter',
    name: 'Demon Hunter',
    description: 'Marked with runic power, dedicated to slaying infernal beings',
    levelRequired: 28,
    prestige: 0,
    act: 3,
    actName: 'Mastery',
    category: 'Mastery',
    sprite: 'evolution/hero_v2_stage_28_demon_hunter.png',
    colors: { primary: '#1F1F1F', secondary: '#DC2626', accent: '#991B1B' },
  },
  29: {
    id: 'storm_lord',
    name: 'Storm Lord',
    description: 'Lightning courses through veins, commanding the fury of tempests',
    levelRequired: 29,
    prestige: 0,
    act: 3,
    actName: 'Mastery',
    category: 'Mastery',
    sprite: 'evolution/hero_v2_stage_29_storm_lord.png',
    colors: { primary: '#3B82F6', secondary: '#F3F4F6', accent: '#1E3A8A' },
  },
  30: {
    id: 'warlord',
    name: 'Warlord',
    description: 'Supreme commander of armies, bearing banner of conquest',
    levelRequired: 30,
    prestige: 0,
    act: 3,
    actName: 'Mastery',
    category: 'Mastery',
    sprite: 'evolution/hero_v2_stage_30_warlord.png',
    colors: { primary: '#DC2626', secondary: '#FCD34D', accent: '#991B1B' },
  },

  // ========== ACT IV: LEGEND (Levels 31-40) ==========
  31: {
    id: 'sword_saint',
    name: 'Sword Saint',
    description: 'Transcendent warrior of light, blade technique beyond mortal ken',
    levelRequired: 31,
    prestige: 0,
    act: 4,
    actName: 'Legend',
    category: 'Legend',
    sprite: 'evolution/hero_v2_stage_31_sword_saint.png',
    colors: { primary: '#F3F4F6', secondary: '#E8E8E8', accent: '#60A5FA' },
  },
  32: {
    id: 'phoenix_knight',
    name: 'Phoenix Knight',
    description: 'Wreathed in eternal flames, rising from ashes immortal',
    levelRequired: 32,
    prestige: 0,
    act: 4,
    actName: 'Legend',
    category: 'Legend',
    sprite: 'evolution/hero_v2_stage_32_phoenix_knight.png',
    colors: { primary: '#EA580C', secondary: '#FCD34D', accent: '#F59E0B' },
  },
  33: {
    id: 'void_stalker',
    name: 'Void Stalker',
    description: 'Walker between realities, bending space and darkness to will',
    levelRequired: 33,
    prestige: 0,
    act: 4,
    actName: 'Legend',
    category: 'Legend',
    sprite: 'evolution/hero_v2_stage_33_void_stalker.png',
    colors: { primary: '#4C1D95', secondary: '#7C3AED', accent: '#1F1F1F' },
  },
  34: {
    id: 'celestial_guardian',
    name: 'Celestial Guardian',
    description: 'Angelic protector with divine wings, shield against all evil',
    levelRequired: 34,
    prestige: 0,
    act: 4,
    actName: 'Legend',
    category: 'Legend',
    sprite: 'evolution/hero_v2_stage_34_celestial_guardian.png',
    colors: { primary: '#FCD34D', secondary: '#F3F4F6', accent: '#F59E0B' },
  },
  35: {
    id: 'titan_slayer',
    name: 'Titan Slayer',
    description: 'Bearer of colossal blade, vanquisher of giants and gods',
    levelRequired: 35,
    prestige: 0,
    act: 4,
    actName: 'Legend',
    category: 'Legend',
    sprite: 'evolution/hero_v2_stage_35_titan_slayer.png',
    colors: { primary: '#4A4A4A', secondary: '#DC2626', accent: '#6B6B6B' },
  },
  36: {
    id: 'elemental_lord',
    name: 'Elemental Lord',
    description: 'Master of all elements, fire water earth and air in perfect harmony',
    levelRequired: 36,
    prestige: 0,
    act: 4,
    actName: 'Legend',
    category: 'Legend',
    sprite: 'evolution/hero_v2_stage_36_elemental_lord.png',
    colors: { primary: '#DC2626', secondary: '#3B82F6', accent: '#10B981', tertiary: '#F59E0B' },
  },
  37: {
    id: 'immortal_champion',
    name: 'Immortal Champion',
    description: 'Timeless warrior bearing eternal runes, ageless and unstoppable',
    levelRequired: 37,
    prestige: 0,
    act: 4,
    actName: 'Legend',
    category: 'Legend',
    sprite: 'evolution/hero_v2_stage_37_immortal_champion.png',
    colors: { primary: '#E8E8E8', secondary: '#3B82F6', accent: '#C0C0C0' },
  },
  38: {
    id: 'godslayer',
    name: 'Godslayer',
    description: 'Wielder of cosmic power, destroyer of divine beings',
    levelRequired: 38,
    prestige: 0,
    act: 4,
    actName: 'Legend',
    category: 'Legend',
    sprite: 'evolution/hero_v2_stage_38_godslayer.png',
    colors: { primary: '#7C3AED', secondary: '#FCD34D', accent: '#4C1D95' },
  },
  39: {
    id: 'ascendant',
    name: 'Ascendant',
    description: 'Semi-divine being of pure energy, transcending mortal form',
    levelRequired: 39,
    prestige: 0,
    act: 4,
    actName: 'Legend',
    category: 'Legend',
    sprite: 'evolution/hero_v2_stage_39_ascendant.png',
    colors: { primary: '#F3F4F6', secondary: '#A855F7', accent: '#60A5FA', tertiary: '#10B981' },
  },
  40: {
    id: 'avatar_of_mastery',
    name: 'Avatar of Mastery',
    description: 'Perfect peak of human potential, harmonious balance of all paths, ultimate achievement incarnate',
    levelRequired: 40,
    prestige: 0,
    act: 4,
    actName: 'Legend',
    category: 'Legend',
    sprite: 'evolution/hero_v2_stage_40_avatar_of_mastery.png',
    colors: { primary: '#F3F4F6', secondary: '#FCD34D', accent: '#7C3AED', tertiary: '#DC2626', quaternary: '#10B981' },
  },
};

// Helper function to get stage by level
export function getStageByLevel(level, prestige = 0) {
  // Find the highest stage the player qualifies for
  const stages = Object.values(EVOLUTION_STAGES).filter(
    stage => stage.prestige === prestige && stage.levelRequired <= level
  );

  if (stages.length === 0) return EVOLUTION_STAGES[1]; // Default to first stage

  // Return the highest qualified stage
  return stages.reduce((highest, current) =>
    current.levelRequired > highest.levelRequired ? current : highest
  );
}

// Helper function to get next stage milestone
export function getNextStageMilestone(level, prestige = 0) {
  const nextStages = Object.values(EVOLUTION_STAGES).filter(
    stage => stage.prestige === prestige && stage.levelRequired > level
  );

  if (nextStages.length === 0) return null;

  // Return the closest next stage
  return nextStages.reduce((closest, current) =>
    current.levelRequired < closest.levelRequired ? current : closest
  );
}

// Helper function to get current stage based on level (ALIAS for compatibility)
export const getCurrentHeroStage = getStageByLevel;

// Helper function to get next stage (ALIAS for compatibility)
export const getNextHeroStage = (currentLevel, prestige = 0) => {
  return getNextStageMilestone(currentLevel, prestige);
};

// Helper function to get progress to next stage
export const getHeroStageProgress = (currentLevel, currentXP, xpToNextLevel) => {
  const currentStage = getCurrentHeroStage(currentLevel);
  const nextStage = getNextHeroStage(currentLevel);

  if (!nextStage) {
    return { progress: 100, levelsRemaining: 0, isMaxStage: true };
  }

  const levelsRemaining = nextStage.levelRequired - currentLevel;
  const totalLevelsNeeded = nextStage.levelRequired - currentStage.levelRequired;
  const levelsCompleted = totalLevelsNeeded - levelsRemaining;
  const progress = (levelsCompleted / totalLevelsNeeded) * 100;

  return {
    progress,
    levelsRemaining,
    isMaxStage: false,
    nextStage,
    currentStage,
  };
};

// Get all stages by act
export const getStagesByAct = (actNumber) => {
  return Object.values(EVOLUTION_STAGES).filter(stage => stage.act === actNumber);
};

// Act metadata
export const ACTS = {
  1: {
    name: 'The Awakening',
    description: 'From civilian dreamer to skilled warrior',
    color: '#8B7355',
    icon: '🌅',
  },
  2: {
    name: 'The Trials',
    description: 'Specialization and forging your unique path',
    color: '#3B82F6',
    icon: '⚔️',
  },
  3: {
    name: 'Mastery',
    description: 'Achieving mastery of your chosen path',
    color: '#7C3AED',
    icon: '👑',
  },
  4: {
    name: 'Legend',
    description: 'Transcending mortal limits to become legendary',
    color: '#FCD34D',
    icon: '✨',
  },
};

// Prestige system configuration
export const PRESTIGE_CONFIG = {
  0: {
    name: 'Mortal Realm',
    description: 'The beginning of your journey',
    maxLevel: 100,
    requiredForNext: { level: 100 },
  },
  1: {
    name: 'Cosmic Ascension',
    description: 'Become one with the universe',
    maxLevel: 100,
    requiredForNext: { level: 100, previousPrestige: 0 },
    bonuses: {
      xpMultiplier: 1.5,
      statsMultiplier: 1.2,
    },
  },
  2: {
    name: 'Transcendent',
    description: 'Beyond comprehension',
    maxLevel: Infinity,
    requiredForNext: null,
    bonuses: {
      xpMultiplier: 2.0,
      statsMultiplier: 1.5,
    },
  },
};

/**
 * Calculate XP required for a specific level (exponential scaling)
 *
 * Progression Philosophy:
 * - Early levels (1-10): Accessible, learn the system (500-2,000 XP)
 * - Mid levels (11-20): Challenging, requires dedication (2,500-8,000 XP)
 * - Late levels (21-30): Very hard, months of effort (10,000-40,000 XP)
 * - End game (31-40): Legendary, years of dedication (50,000-200,000+ XP)
 *
 * Formula: baseXP * (1.15 ^ level) with tier multipliers
 */
export function calculateXPForLevel(level, prestige = 0) {
  // Base XP with exponential scaling
  const baseXP = 500; // Starting XP for level 1
  const growthRate = 1.15; // 15% increase per level

  // Tier multipliers for major milestones
  let tierMultiplier = 1;
  if (level > 30) tierMultiplier = 2.5;      // Legendary tier
  else if (level > 20) tierMultiplier = 1.8; // Master tier
  else if (level > 10) tierMultiplier = 1.3; // Trials tier

  const xpRequired = Math.floor(baseXP * Math.pow(growthRate, level - 1) * tierMultiplier);

  // Apply prestige bonus (makes it slightly easier after prestige)
  const prestigeMultiplier = PRESTIGE_CONFIG[prestige]?.bonuses?.xpMultiplier || 1;

  return Math.floor(xpRequired / prestigeMultiplier);
}

/**
 * Calculate total XP needed to reach a level from level 1
 */
export function calculateTotalXPForLevel(targetLevel, prestige = 0) {
  let total = 0;
  for (let lvl = 1; lvl < targetLevel; lvl++) {
    total += calculateXPForLevel(lvl, prestige);
  }
  return total;
}

/**
 * Calculate level from total XP
 */
export function calculateLevelFromTotalXP(totalXP, prestige = 0) {
  let level = 1;
  let xpRemaining = totalXP;

  while (xpRemaining >= calculateXPForLevel(level, prestige) && level < 100) {
    xpRemaining -= calculateXPForLevel(level, prestige);
    level++;
  }

  return {
    level,
    currentXP: xpRemaining,
    xpToNextLevel: calculateXPForLevel(level, prestige),
  };
}
