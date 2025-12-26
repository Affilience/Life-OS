/**
 * Level Progression System
 * Non-visual progression rewards tied to player level
 *
 * Features:
 * - Level Titles/Ranks (display next to username)
 * - Level Milestone Rewards (credits, equipment, achievements)
 * - Passive XP Bonuses (permanent % increase per level)
 * - Profile Frames/Badges (cosmetic borders)
 * - Unlock Slots/Capacity (pets, equipment sets, inventory)
 */

// ============================================
// LEVEL TITLES / RANKS
// ============================================

export const LEVEL_TITLES = [
  { minLevel: 1, maxLevel: 9, title: 'Novice', color: '#9CA3AF', icon: '🌱' },
  { minLevel: 10, maxLevel: 24, title: 'Apprentice', color: '#10B981', icon: '📚' },
  { minLevel: 25, maxLevel: 49, title: 'Journeyman', color: '#3B82F6', icon: '⚔️' },
  { minLevel: 50, maxLevel: 74, title: 'Expert', color: '#8B5CF6', icon: '🎯' },
  { minLevel: 75, maxLevel: 99, title: 'Master', color: '#F59E0B', icon: '👑' },
  { minLevel: 100, maxLevel: 149, title: 'Grand Master', color: '#EF4444', icon: '🔥' },
  { minLevel: 150, maxLevel: 199, title: 'Legendary', color: '#EC4899', icon: '⭐' },
  { minLevel: 200, maxLevel: 299, title: 'Mythic', color: '#D946EF', icon: '💎' },
  { minLevel: 300, maxLevel: 499, title: 'Transcendent', color: '#06B6D4', icon: '🌟' },
  { minLevel: 500, maxLevel: Infinity, title: 'Eternal', color: '#FBBF24', icon: '✨' },
];

/**
 * Get the title data for a given level
 */
export function getLevelTitle(level) {
  return LEVEL_TITLES.find(t => level >= t.minLevel && level <= t.maxLevel) || LEVEL_TITLES[0];
}

/**
 * Get progress to next title
 */
export function getTitleProgress(level) {
  const current = getLevelTitle(level);
  const currentIndex = LEVEL_TITLES.indexOf(current);
  const next = LEVEL_TITLES[currentIndex + 1];

  if (!next) {
    return { current, next: null, progress: 100, levelsToNext: 0 };
  }

  const levelsInCurrentTier = current.maxLevel - current.minLevel + 1;
  const levelsCompleted = level - current.minLevel;
  const progress = Math.round((levelsCompleted / levelsInCurrentTier) * 100);
  const levelsToNext = next.minLevel - level;

  return { current, next, progress, levelsToNext };
}

// ============================================
// LEVEL MILESTONE REWARDS
// ============================================

export const MILESTONE_TYPES = {
  MINOR: 'minor',       // Every 5 levels
  REGULAR: 'regular',   // Every 10 levels
  MAJOR: 'major',       // Every 25 levels
  LEGENDARY: 'legendary', // 50, 100, 150, 200
};

export const LEVEL_MILESTONES = [
  // Minor milestones (every 5 levels)
  { level: 5, type: MILESTONE_TYPES.MINOR, credits: 50, xpBonus: 0, title: null, equipment: null, achievement: 'milestone_level_5' },
  { level: 15, type: MILESTONE_TYPES.MINOR, credits: 75, xpBonus: 0, title: null, equipment: null, achievement: null },
  { level: 20, type: MILESTONE_TYPES.MINOR, credits: 100, xpBonus: 0, title: null, equipment: null, achievement: null },
  { level: 30, type: MILESTONE_TYPES.MINOR, credits: 125, xpBonus: 0, title: null, equipment: null, achievement: null },
  { level: 35, type: MILESTONE_TYPES.MINOR, credits: 150, xpBonus: 0, title: null, equipment: null, achievement: null },
  { level: 40, type: MILESTONE_TYPES.MINOR, credits: 175, xpBonus: 0, title: null, equipment: null, achievement: null },
  { level: 45, type: MILESTONE_TYPES.MINOR, credits: 200, xpBonus: 0, title: null, equipment: null, achievement: null },
  { level: 55, type: MILESTONE_TYPES.MINOR, credits: 250, xpBonus: 0, title: null, equipment: null, achievement: null },
  { level: 60, type: MILESTONE_TYPES.MINOR, credits: 275, xpBonus: 0, title: null, equipment: null, achievement: null },
  { level: 65, type: MILESTONE_TYPES.MINOR, credits: 300, xpBonus: 0, title: null, equipment: null, achievement: null },
  { level: 70, type: MILESTONE_TYPES.MINOR, credits: 325, xpBonus: 0, title: null, equipment: null, achievement: null },
  { level: 80, type: MILESTONE_TYPES.MINOR, credits: 375, xpBonus: 0, title: null, equipment: null, achievement: null },
  { level: 85, type: MILESTONE_TYPES.MINOR, credits: 400, xpBonus: 0, title: null, equipment: null, achievement: null },
  { level: 90, type: MILESTONE_TYPES.MINOR, credits: 425, xpBonus: 0, title: null, equipment: null, achievement: null },
  { level: 95, type: MILESTONE_TYPES.MINOR, credits: 450, xpBonus: 0, title: null, equipment: null, achievement: null },

  // Regular milestones (every 10 levels)
  { level: 10, type: MILESTONE_TYPES.REGULAR, credits: 100, xpBonus: 0, title: 'Apprentice', equipment: null, achievement: 'milestone_level_10' },

  // Major milestones (every 25 levels)
  { level: 25, type: MILESTONE_TYPES.MAJOR, credits: 500, xpBonus: 0, title: 'Journeyman', equipment: 'journeyman_ring', achievement: 'milestone_level_25', frame: 'bronze' },
  { level: 75, type: MILESTONE_TYPES.MAJOR, credits: 1000, xpBonus: 0, title: 'Master', equipment: 'master_amulet', achievement: 'milestone_level_75', frame: 'gold' },

  // Legendary milestones
  { level: 50, type: MILESTONE_TYPES.LEGENDARY, credits: 1500, xpBonus: 250, title: 'Expert', equipment: 'expert_blade', achievement: 'milestone_level_50', frame: 'silver', petSlot: true },
  { level: 100, type: MILESTONE_TYPES.LEGENDARY, credits: 3000, xpBonus: 500, title: 'Grand Master', equipment: 'grandmaster_crown', achievement: 'milestone_level_100', frame: 'diamond', petSlot: true },
  { level: 150, type: MILESTONE_TYPES.LEGENDARY, credits: 5000, xpBonus: 1000, title: 'Legendary', equipment: 'legendary_wings', achievement: 'milestone_level_150', frame: 'legendary', petSlot: true },
  { level: 200, type: MILESTONE_TYPES.LEGENDARY, credits: 10000, xpBonus: 2000, title: 'Mythic', equipment: 'mythic_armor', achievement: 'milestone_level_200', frame: 'mythic', petSlot: true },
  { level: 300, type: MILESTONE_TYPES.LEGENDARY, credits: 20000, xpBonus: 5000, title: 'Transcendent', equipment: 'transcendent_aura', achievement: 'milestone_level_300', frame: 'transcendent', petSlot: true },
  { level: 500, type: MILESTONE_TYPES.LEGENDARY, credits: 50000, xpBonus: 10000, title: 'Eternal', equipment: 'eternal_essence', achievement: 'milestone_level_500', frame: 'eternal', petSlot: true },
];

/**
 * Get milestone for a specific level (if any)
 */
export function getMilestoneForLevel(level) {
  return LEVEL_MILESTONES.find(m => m.level === level) || null;
}

/**
 * Get all milestones up to and including a level
 */
export function getMilestonesUpToLevel(level) {
  return LEVEL_MILESTONES.filter(m => m.level <= level);
}

/**
 * Get next milestone after current level
 */
export function getNextMilestone(level) {
  return LEVEL_MILESTONES.find(m => m.level > level) || null;
}

/**
 * Get unclaimed milestones between old and new level
 */
export function getUnclaimedMilestones(oldLevel, newLevel) {
  return LEVEL_MILESTONES.filter(m => m.level > oldLevel && m.level <= newLevel);
}

// ============================================
// PASSIVE XP BONUSES
// ============================================

// XP bonus per level (0.25% per level)
export const XP_BONUS_PER_LEVEL = 0.0025; // 0.25%

// Maximum XP bonus cap (at level 400 = 100%)
export const MAX_XP_BONUS = 1.0; // 100%

/**
 * Calculate passive XP bonus multiplier from level
 * Level 1 = 0%, Level 50 = 12.5%, Level 100 = 25%, Level 200 = 50%, Level 400 = 100%
 */
export function getLevelXPBonus(level) {
  const bonus = (level - 1) * XP_BONUS_PER_LEVEL;
  return Math.min(bonus, MAX_XP_BONUS);
}

/**
 * Get formatted XP bonus percentage
 */
export function getLevelXPBonusFormatted(level) {
  const bonus = getLevelXPBonus(level);
  return `+${(bonus * 100).toFixed(1)}%`;
}

// ============================================
// PROFILE FRAMES / BADGES
// ============================================

export const PROFILE_FRAMES = {
  none: {
    id: 'none',
    name: 'No Frame',
    minLevel: 1,
    color: 'transparent',
    borderWidth: 0,
    animated: false,
    glow: false,
  },
  bronze: {
    id: 'bronze',
    name: 'Bronze Frame',
    minLevel: 25,
    color: '#CD7F32',
    borderWidth: 3,
    animated: false,
    glow: false,
    gradient: 'linear-gradient(135deg, #CD7F32, #8B4513)',
  },
  silver: {
    id: 'silver',
    name: 'Silver Frame',
    minLevel: 50,
    color: '#C0C0C0',
    borderWidth: 3,
    animated: false,
    glow: true,
    glowColor: 'rgba(192, 192, 192, 0.5)',
    gradient: 'linear-gradient(135deg, #C0C0C0, #808080)',
  },
  gold: {
    id: 'gold',
    name: 'Gold Frame',
    minLevel: 75,
    color: '#FFD700',
    borderWidth: 4,
    animated: false,
    glow: true,
    glowColor: 'rgba(255, 215, 0, 0.5)',
    gradient: 'linear-gradient(135deg, #FFD700, #B8860B)',
  },
  diamond: {
    id: 'diamond',
    name: 'Diamond Frame',
    minLevel: 100,
    color: '#B9F2FF',
    borderWidth: 4,
    animated: true,
    animationType: 'shimmer',
    glow: true,
    glowColor: 'rgba(185, 242, 255, 0.6)',
    gradient: 'linear-gradient(135deg, #B9F2FF, #00CED1, #B9F2FF)',
  },
  legendary: {
    id: 'legendary',
    name: 'Legendary Frame',
    minLevel: 150,
    color: '#FF6B9D',
    borderWidth: 4,
    animated: true,
    animationType: 'pulse',
    glow: true,
    glowColor: 'rgba(255, 107, 157, 0.6)',
    gradient: 'linear-gradient(135deg, #FF6B9D, #C850C0, #FF6B9D)',
  },
  mythic: {
    id: 'mythic',
    name: 'Mythic Frame',
    minLevel: 200,
    color: '#DA70D6',
    borderWidth: 5,
    animated: true,
    animationType: 'rainbow',
    glow: true,
    glowColor: 'rgba(218, 112, 214, 0.7)',
    gradient: 'linear-gradient(135deg, #DA70D6, #9932CC, #8A2BE2)',
  },
  transcendent: {
    id: 'transcendent',
    name: 'Transcendent Frame',
    minLevel: 300,
    color: '#00FFFF',
    borderWidth: 5,
    animated: true,
    animationType: 'cosmic',
    glow: true,
    glowColor: 'rgba(0, 255, 255, 0.7)',
    gradient: 'linear-gradient(135deg, #00FFFF, #0080FF, #8000FF, #FF00FF)',
  },
  eternal: {
    id: 'eternal',
    name: 'Eternal Frame',
    minLevel: 500,
    color: '#FFD700',
    borderWidth: 6,
    animated: true,
    animationType: 'divine',
    glow: true,
    glowColor: 'rgba(255, 215, 0, 0.8)',
    gradient: 'linear-gradient(135deg, #FFD700, #FFFFFF, #FFD700)',
    particles: true,
  },
};

/**
 * Get all frames unlocked at a given level
 */
export function getUnlockedFrames(level) {
  return Object.values(PROFILE_FRAMES).filter(frame => level >= frame.minLevel);
}

/**
 * Get the highest tier frame for a level
 */
export function getHighestFrame(level) {
  const unlocked = getUnlockedFrames(level);
  return unlocked.reduce((highest, frame) =>
    frame.minLevel > highest.minLevel ? frame : highest
  , PROFILE_FRAMES.none);
}

/**
 * Get next frame to unlock
 */
export function getNextFrame(level) {
  const frames = Object.values(PROFILE_FRAMES);
  return frames.find(frame => frame.minLevel > level) || null;
}

// ============================================
// UNLOCK SLOTS / CAPACITY
// ============================================

// Base values
export const BASE_PET_SLOTS = 1;
export const BASE_EQUIPMENT_SET_SLOTS = 1;
export const BASE_INVENTORY_SLOTS = 10;

// Slot increases
export const PET_SLOT_LEVELS = [50, 100, 150, 200, 300, 500]; // +1 at each
export const EQUIPMENT_SET_LEVELS = [50, 100, 200, 500]; // +1 at each
export const INVENTORY_SLOT_INTERVAL = 10; // +1 every 10 levels

/**
 * Calculate total pet slots for a level
 */
export function getPetSlots(level) {
  const bonusSlots = PET_SLOT_LEVELS.filter(l => level >= l).length;
  return BASE_PET_SLOTS + bonusSlots;
}

/**
 * Calculate total equipment set slots for a level
 */
export function getEquipmentSetSlots(level) {
  const bonusSlots = EQUIPMENT_SET_LEVELS.filter(l => level >= l).length;
  return BASE_EQUIPMENT_SET_SLOTS + bonusSlots;
}

/**
 * Calculate total inventory slots for a level
 */
export function getInventorySlots(level) {
  const bonusSlots = Math.floor(level / INVENTORY_SLOT_INTERVAL);
  return BASE_INVENTORY_SLOTS + bonusSlots;
}

/**
 * Get next slot unlock info
 */
export function getNextSlotUnlock(level) {
  const nextPetLevel = PET_SLOT_LEVELS.find(l => l > level);
  const nextSetLevel = EQUIPMENT_SET_LEVELS.find(l => l > level);
  const nextInventoryLevel = Math.ceil((level + 1) / INVENTORY_SLOT_INTERVAL) * INVENTORY_SLOT_INTERVAL;

  const unlocks = [];
  if (nextPetLevel) unlocks.push({ type: 'pet', level: nextPetLevel });
  if (nextSetLevel) unlocks.push({ type: 'equipment_set', level: nextSetLevel });
  if (nextInventoryLevel) unlocks.push({ type: 'inventory', level: nextInventoryLevel });

  return unlocks.sort((a, b) => a.level - b.level)[0] || null;
}

// ============================================
// COMBINED LEVEL STATS
// ============================================

/**
 * Get all progression stats for a level
 */
export function getLevelProgressionStats(level) {
  const title = getLevelTitle(level);
  const titleProgress = getTitleProgress(level);
  const xpBonus = getLevelXPBonus(level);
  const frame = getHighestFrame(level);
  const petSlots = getPetSlots(level);
  const equipmentSetSlots = getEquipmentSetSlots(level);
  const inventorySlots = getInventorySlots(level);
  const nextMilestone = getNextMilestone(level);
  const nextFrame = getNextFrame(level);
  const nextSlot = getNextSlotUnlock(level);

  return {
    level,
    title: title.title,
    titleColor: title.color,
    titleIcon: title.icon,
    titleProgress: titleProgress.progress,
    nextTitle: titleProgress.next?.title || null,
    levelsToNextTitle: titleProgress.levelsToNext,
    xpBonus,
    xpBonusFormatted: getLevelXPBonusFormatted(level),
    frame,
    petSlots,
    equipmentSetSlots,
    inventorySlots,
    nextMilestone,
    nextFrame,
    nextSlot,
  };
}

// ============================================
// MILESTONE EQUIPMENT DATA
// ============================================

export const MILESTONE_EQUIPMENT = {
  journeyman_ring: {
    id: 'journeyman_ring',
    name: "Journeyman's Ring",
    description: 'A ring awarded to those who have proven their dedication.',
    slot: 'ring1',
    rarity: 'rare',
    stats: { wisdom: 5, intelligence: 3 },
    sprite: { path: '/assets/equipment/rings/journeyman_ring.png' },
    unlockMethod: 'level',
    unlockRequirement: { level: 25 },
  },
  expert_blade: {
    id: 'expert_blade',
    name: 'Blade of Expertise',
    description: 'A weapon that grows sharper with every challenge overcome.',
    slot: 'mainHand',
    rarity: 'epic',
    stats: { strength: 10, vitality: 5 },
    sprite: { path: '/assets/equipment/weapons/expert_blade.png' },
    unlockMethod: 'level',
    unlockRequirement: { level: 50 },
  },
  master_amulet: {
    id: 'master_amulet',
    name: "Master's Amulet",
    description: 'An amulet pulsing with the power of mastery.',
    slot: 'amulet',
    rarity: 'epic',
    stats: { wisdom: 12, intelligence: 8, vitality: 5 },
    sprite: { path: '/assets/equipment/amulets/master_amulet.png' },
    unlockMethod: 'level',
    unlockRequirement: { level: 75 },
  },
  grandmaster_crown: {
    id: 'grandmaster_crown',
    name: "Grand Master's Crown",
    description: 'A crown befitting one who has achieved greatness.',
    slot: 'helmet',
    rarity: 'legendary',
    stats: { wisdom: 20, intelligence: 15, defense: 10 },
    sprite: { path: '/assets/equipment/helmets/grandmaster_crown.png' },
    unlockMethod: 'level',
    unlockRequirement: { level: 100 },
  },
  legendary_wings: {
    id: 'legendary_wings',
    name: 'Wings of Legend',
    description: 'Ethereal wings that mark a legendary hero.',
    slot: 'cape',
    rarity: 'legendary',
    stats: { vitality: 25, wisdom: 15, strength: 10 },
    sprite: { path: '/assets/equipment/capes/legendary_wings.png' },
    unlockMethod: 'level',
    unlockRequirement: { level: 150 },
  },
  mythic_armor: {
    id: 'mythic_armor',
    name: 'Mythic Armour',
    description: 'Armour woven from the fabric of myths.',
    slot: 'chest',
    rarity: 'legendary',
    stats: { defense: 30, vitality: 25, strength: 15 },
    sprite: { path: '/assets/equipment/chests/mythic_armor.png' },
    unlockMethod: 'level',
    unlockRequirement: { level: 200 },
  },
  transcendent_aura: {
    id: 'transcendent_aura',
    name: 'Transcendent Aura',
    description: 'An aura that transcends mortal understanding.',
    slot: 'cape',
    rarity: 'legendary',
    stats: { wisdom: 35, intelligence: 30, vitality: 20 },
    sprite: { path: '/assets/equipment/capes/transcendent_aura.png' },
    unlockMethod: 'level',
    unlockRequirement: { level: 300 },
  },
  eternal_essence: {
    id: 'eternal_essence',
    name: 'Eternal Essence',
    description: 'The crystallised essence of eternity itself.',
    slot: 'amulet',
    rarity: 'legendary',
    stats: { wisdom: 50, intelligence: 40, vitality: 30, strength: 20, defense: 20 },
    sprite: { path: '/assets/equipment/amulets/eternal_essence.png' },
    unlockMethod: 'level',
    unlockRequirement: { level: 500 },
  },
};

/**
 * Get milestone equipment by ID
 */
export function getMilestoneEquipment(equipmentId) {
  return MILESTONE_EQUIPMENT[equipmentId] || null;
}
