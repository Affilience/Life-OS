/**
 * Equipment Database
 * Comprehensive equipment system with rarities, stats, and visual properties
 * All equipment tied to module unlocks for meaningful progression
 */

import { ABILITY_TYPES } from './weaponAbilities';

// Equipment Rarity Tiers
export const EQUIPMENT_RARITY = {
  common: {
    name: 'Common',
    color: '#9ca3af',
    glow: false,
    statMultiplier: 1.0,
  },
  uncommon: {
    name: 'Uncommon',
    color: '#22c55e',
    glow: false,
    statMultiplier: 1.25,
  },
  rare: {
    name: 'Rare',
    color: '#3b82f6',
    glow: 'rgba(59, 130, 246, 0.4)',
    statMultiplier: 1.5,
  },
  epic: {
    name: 'Epic',
    color: '#a855f7',
    glow: 'rgba(168, 85, 247, 0.5)',
    statMultiplier: 2.0,
  },
  legendary: {
    name: 'Legendary',
    color: '#f97316',
    glow: 'rgba(249, 115, 22, 0.6)',
    statMultiplier: 3.0,
    hasParticles: true,
  },
  mythical: {
    name: 'Mythical',
    color: '#ffd700',
    glow: 'rgba(255, 215, 0, 0.7)',
    statMultiplier: 4.0,
    hasParticles: true,
  },
};

// Equipment Categories
export const EQUIPMENT_SLOTS = {
  helmet: 'Helmet',
  chest: 'Chest Armor',
  legs: 'Leg Armor',
  mainHand: 'Main Hand',
  offHand: 'Off Hand',
  cape: 'Cape',
  ring1: 'Ring 1',
  ring2: 'Ring 2',
  amulet: 'Amulet',
};

// Equipment Database - All Items
export const EQUIPMENT_DATABASE = {
  // ========================================
  // HELMETS - 18 items
  // ========================================

  // Common Helmets (Starting/Early Game)
  helmet_cloth_cap: {
    id: 'helmet_cloth_cap',
    name: 'Cloth Cap',
    slot: 'helmet',
    rarity: 'common',
    description: 'A simple cloth cap for protection from the elements',
    stats: { defense: 1, wisdom: 1 },
    levelRequired: 2,
    sprite: { path: '/assets/equipment/helmets/cloth_cap.png' },
    overlay: { path: '/assets/equipment/overlays/helmets/helmet_cloth_cap.png' },
    unlockMethod: 'level',
    unlockRequirement: { level: 2 },
    unlockDescription: 'Reach level 2',
  },

  helmet_training: {
    id: 'helmet_training',
    name: 'Training Helmet',
    slot: 'helmet',
    rarity: 'common',
    description: 'Basic protective headgear for beginners',
    stats: { defense: 2, vitality: 1 },
    levelRequired: 3,
    sprite: { path: '/assets/equipment/helmets/training_helmet.png' },
    overlay: { path: '/assets/equipment/overlays/helmets/helmet_cloth_cap.png' },
    unlockMethod: 'milestone',
    unlockRequirement: { metric: 'workoutsCompleted', target: 3 },
    unlockDescription: 'Complete 3 workouts',
  },

  // Uncommon Helmets (Early-Mid Game)
  helmet_leather_hood: {
    id: 'helmet_leather_hood',
    name: 'Leather Hood',
    slot: 'helmet',
    rarity: 'uncommon',
    description: 'A sturdy leather hood favoured by scouts',
    stats: { defense: 3, wisdom: 2 },
    levelRequired: 5,
    sprite: { path: '/assets/equipment/helmets/leather_hood.png' },
    overlay: { path: '/assets/equipment/overlays/helmets/helmet_leather_hood.png' },
    unlockMethod: 'default',
    unlockRequirement: { module: 'journal', metric: 'entries', value: 7 },
    unlockDescription: 'Write 7 journal entries',
  },

  helmet_iron: {
    id: 'helmet_iron',
    name: 'Iron Helmet',
    slot: 'helmet',
    rarity: 'uncommon',
    description: 'Sturdy iron helmet forged from quality ore',
    stats: { defense: 5, vitality: 2 },
    levelRequired: 5,
    sprite: { path: '/assets/equipment/helmets/iron_helmet.png' },
    overlay: { path: '/assets/equipment/overlays/helmets/helmet_iron.png' },
    unlockMethod: 'default',
    unlockRequirement: { module: 'fitness', metric: 'workouts', value: 10 },
    unlockDescription: 'Complete 10 workouts',
  },

  helmet_reinforced_coif: {
    id: 'helmet_reinforced_coif',
    name: 'Reinforced Coif',
    slot: 'helmet',
    rarity: 'uncommon',
    description: 'Chainmail coif with extra padding',
    stats: { defense: 4, vitality: 3 },
    levelRequired: 8,
    sprite: { path: '/assets/equipment/helmets/reinforced_coif.png' },
    overlay: { path: '/assets/equipment/overlays/helmets/helmet_iron.png' },
    unlockMethod: 'default',
    unlockRequirement: { module: 'productivity', metric: 'tasks', value: 50 },
    unlockDescription: 'Complete 50 tasks',
  },

  // Rare Helmets (Mid Game)
  helmet_steel_greathelm: {
    id: 'helmet_steel_greathelm',
    name: 'Steel Greathelm',
    slot: 'helmet',
    rarity: 'rare',
    description: 'A mighty helm of tempered steel',
    stats: { defense: 8, vitality: 4, strength: 2 },
    levelRequired: 12,
    sprite: { path: '/assets/equipment/helmets/steel_greathelm.png' },
    overlay: { path: '/assets/equipment/overlays/helmets/helmet_steel_greathelm.png' },
    unlockMethod: 'default',
    unlockRequirement: { module: 'fitness', metric: 'workouts', value: 50 },
    unlockDescription: 'Complete 50 workouts',
  },

  helmet_scholar_circlet: {
    id: 'helmet_scholar_circlet',
    name: "Scholar's Circlet",
    slot: 'helmet',
    rarity: 'rare',
    description: 'A circlet worn by learned scholars',
    stats: { intelligence: 6, wisdom: 4 },
    levelRequired: 10,
    sprite: { path: '/assets/equipment/helmets/scholar_circlet.png' },
    overlay: { path: '/assets/equipment/overlays/helmets/helmet_cloth_cap.png' },
    unlockMethod: 'default',
    unlockRequirement: { module: 'knowledge', metric: 'books', value: 5 },
    unlockDescription: 'Finish 5 books',
  },

  helmet_mindguard: {
    id: 'helmet_mindguard',
    name: 'Mindguard Helmet',
    slot: 'helmet',
    rarity: 'rare',
    description: 'Protects both body and mind',
    stats: { defense: 5, intelligence: 4, wisdom: 3 },
    levelRequired: 15,
    sprite: { path: '/assets/equipment/helmets/mindguard_helmet.png' },
    overlay: { path: '/assets/equipment/overlays/helmets/helmet_iron.png' },
    unlockMethod: 'default',
    unlockRequirement: { module: 'journal', metric: 'streak', value: 30 },
    unlockDescription: '30-day journal streak',
  },

  // Epic Helmets (Late Game)
  helmet_sage_crown: {
    id: 'helmet_sage_crown',
    name: 'Sage Crown',
    slot: 'helmet',
    rarity: 'epic',
    description: 'Crown of ancient wisdom',
    stats: { intelligence: 10, wisdom: 8, vitality: 3 },
    levelRequired: 20,
    sprite: { path: '/assets/equipment/helmets/sage_crown.png' },
    overlay: { path: '/assets/equipment/overlays/helmets/helmet_cloth_cap.png' },
    unlockMethod: 'default',
    unlockRequirement: { module: 'knowledge', metric: 'books', value: 25 },
    unlockDescription: 'Finish 25 books',
  },

  helmet_titanium: {
    id: 'helmet_titanium',
    name: 'Titanium Helm',
    slot: 'helmet',
    rarity: 'epic',
    description: 'Forged from rare titanium ore',
    stats: { defense: 12, vitality: 6, strength: 4 },
    levelRequired: 22,
    sprite: { path: '/assets/equipment/helmets/titanium_helm.png' },
    overlay: { path: '/assets/equipment/overlays/helmets/helmet_steel_greathelm.png' },
    unlockMethod: 'default',
    unlockRequirement: { module: 'fitness', metric: 'workouts', value: 100 },
    unlockDescription: 'Complete 100 workouts',
  },

  helmet_archmage_diadem: {
    id: 'helmet_archmage_diadem',
    name: 'Archmage Diadem',
    slot: 'helmet',
    rarity: 'epic',
    description: 'Worn by the most powerful mages',
    stats: { intelligence: 12, wisdom: 10 },
    levelRequired: 25,
    sprite: { path: '/assets/equipment/helmets/archmage_diadem.png' },
    overlay: { path: '/assets/equipment/overlays/helmets/helmet_cloth_cap.png' },
    unlockMethod: 'default',
    unlockRequirement: { achievementId: 'knowledge_master' },
    unlockDescription: 'Complete "Knowledge Master" achievement',
  },

  // Legendary Helmets (End Game)
  helmet_dragon: {
    id: 'helmet_dragon',
    name: 'Dragon Helm',
    slot: 'helmet',
    rarity: 'legendary',
    description: 'Forged from the scales of an ancient dragon',
    stats: { defense: 15, vitality: 8, strength: 5 },
    levelRequired: 30,
    sprite: { path: '/assets/equipment/helmets/dragon_helm.png' },
    overlay: { path: '/assets/equipment/overlays/helmets/helmet_dragon.png' },
    effects: [{ type: 'particle', name: 'flame_aura', color: '#ff4400' }],
    unlockMethod: 'default',
    unlockRequirement: { achievementId: 'dragon_slayer' },
    unlockDescription: 'Complete all fitness milestones',
    setBonus: { setName: 'dragon_knight', pieces: ['helmet_dragon', 'chest_dragon', 'weapon_dragon_blade'] },
  },

  helmet_phoenix_crown: {
    id: 'helmet_phoenix_crown',
    name: 'Phoenix Crown',
    slot: 'helmet',
    rarity: 'legendary',
    description: 'A crown of eternal flame',
    stats: { vitality: 12, wisdom: 10, intelligence: 8 },
    levelRequired: 32,
    sprite: { path: '/assets/equipment/helmets/phoenix_crown.png' },
    overlay: { path: '/assets/equipment/overlays/helmets/helmet_phoenix_crown.png' },
    effects: [{ type: 'particle', name: 'flame_aura', color: '#ffaa00' }],
    unlockMethod: 'default',
    unlockRequirement: { module: 'fitness', metric: 'streak', value: 100 },
    unlockDescription: '100-day workout streak',
    setBonus: { setName: 'phoenix_warrior', pieces: ['helmet_phoenix_crown', 'chest_phoenix', 'weapon_phoenix_blade'] },
  },

  helmet_celestial_circlet: {
    id: 'helmet_celestial_circlet',
    name: 'Celestial Circlet',
    slot: 'helmet',
    rarity: 'legendary',
    description: 'Blessed by the stars themselves',
    stats: { intelligence: 15, wisdom: 12, vitality: 5 },
    levelRequired: 35,
    sprite: { path: '/assets/equipment/helmets/celestial_circlet.png' },
    overlay: { path: '/assets/equipment/overlays/helmets/helmet_cloth_cap.png' },
    effects: [{ type: 'particle', name: 'star_aura', color: '#88ccff' }],
    unlockMethod: 'default',
    unlockRequirement: { module: 'knowledge', metric: 'books', value: 50 },
    unlockDescription: 'Finish 50 books',
  },

  helmet_eternal_crown: {
    id: 'helmet_eternal_crown',
    name: 'Eternal Crown',
    slot: 'helmet',
    rarity: 'legendary',
    description: 'The crown of immortal kings',
    stats: { defense: 10, vitality: 15, strength: 8, intelligence: 8 },
    levelRequired: 40,
    sprite: { path: '/assets/equipment/helmets/eternal_crown.png' },
    overlay: { path: '/assets/equipment/overlays/helmets/helmet_dragon.png' },
    effects: [{ type: 'particle', name: 'divine_aura', color: '#ffd700' }],
    unlockMethod: 'default',
    unlockRequirement: { level: 40 },
    unlockDescription: 'Reach Level 40',
  },

  // Mythical Helmets (Generated)
  helmet_void_crown: {
    id: 'helmet_void_crown',
    name: 'Void Crown',
    slot: 'helmet',
    rarity: 'mythical',
    description: 'A dark crown emanating shadow tendrils from the void',
    stats: { defense: 10, intelligence: 8, wisdom: 6 },
    levelRequired: 25,
    sprite: { path: '/assets/equipment/helmets/void_crown.png' },
    overlay: { path: '/assets/equipment/overlays/helmets/helmet_dragon.png' },
    effects: [{ type: 'particle', name: 'shadow_aura', color: '#8b00ff' }],
    unlockMethod: 'secret',
    unlockDescription: '???',
  },

  helmet_crystal_diadem: {
    id: 'helmet_crystal_diadem',
    name: 'Crystal Diadem',
    slot: 'helmet',
    rarity: 'mythical',
    description: 'An elegant crown of frozen crystals and frost gems',
    stats: { defense: 8, intelligence: 10, wisdom: 6 },
    levelRequired: 25,
    sprite: { path: '/assets/equipment/helmets/crystal_diadem.png' },
    overlay: { path: '/assets/equipment/overlays/helmets/helmet_cloth_cap.png' },
    effects: [{ type: 'particle', name: 'frost', color: '#00ffff' }],
    unlockMethod: 'module',
    unlockDescription: 'Read 52 books (one year of weekly reading)',
  },

  helmet_celestial_halo_crown: {
    id: 'helmet_celestial_halo_crown',
    name: 'Celestial Halo Crown',
    slot: 'helmet',
    rarity: 'mythical',
    description: 'A divine crown with a floating halo of pure light',
    stats: { defense: 12, wisdom: 15, intelligence: 10 },
    levelRequired: 35,
    sprite: { path: '/assets/equipment/helmets/celestial_halo_crown.png' },
    overlay: { path: '/assets/equipment/overlays/helmets/helmet_phoenix_crown.png' },
    effects: [{ type: 'particle', name: 'divine_aura', color: '#ffd700' }],
    unlockMethod: 'streak',
    unlockDescription: '180-day streak in any module',
  },

  helmet_abyssal_visage: {
    id: 'helmet_abyssal_visage',
    name: 'Abyssal Visage',
    slot: 'helmet',
    rarity: 'mythical',
    description: 'An eldritch helm from the depths of the abyss',
    stats: { defense: 14, intelligence: 12, vitality: 8 },
    levelRequired: 35,
    sprite: { path: '/assets/equipment/helmets/abyssal_visage.png' },
    overlay: { path: '/assets/equipment/overlays/helmets/helmet_iron.png' },
    effects: [{ type: 'particle', name: 'shadow_aura', color: '#00cccc' }],
    unlockMethod: 'pvp',
    unlockDescription: 'Win 200 PvP battles and reach Diamond rank',
  },

  helmet_stormforged_helm: {
    id: 'helmet_stormforged_helm',
    name: 'Stormforged Helm',
    slot: 'helmet',
    rarity: 'mythical',
    description: 'A helm crackling with the power of the storm',
    stats: { defense: 11, strength: 8, vitality: 5 },
    levelRequired: 28,
    sprite: { path: '/assets/equipment/helmets/stormforged_helm.png' },
    overlay: { path: '/assets/equipment/overlays/helmets/helmet_steel_greathelm.png' },
    effects: [{ type: 'particle', name: 'lightning', color: '#4488ff' }],
    unlockMethod: 'module',
    unlockDescription: 'Complete 200 workouts',
  },

  helmet_infernal_visage: {
    id: 'helmet_infernal_visage',
    name: 'Infernal Visage',
    slot: 'helmet',
    rarity: 'mythical',
    description: 'A demonic helm forged in hellfire',
    stats: { defense: 13, strength: 12, vitality: 6 },
    levelRequired: 38,
    sprite: { path: '/assets/equipment/helmets/infernal_visage.png' },
    overlay: { path: '/assets/equipment/overlays/helmets/helmet_dragon.png' },
    effects: [{ type: 'particle', name: 'flame_aura', color: '#ff4400' }],
    unlockMethod: 'achievement',
    unlockDescription: 'Complete "Infernal Dedication" achievement',
  },

  // ========================================
  // CHEST ARMOR - 14 items
  // ========================================

  // Common Chest
  chest_cloth_tunic: {
    id: 'chest_cloth_tunic',
    name: 'Cloth Tunic',
    slot: 'chest',
    rarity: 'common',
    description: 'A simple cloth tunic',
    stats: { defense: 2, vitality: 1 },
    levelRequired: 2,
    sprite: { path: '/assets/equipment/chests/cloth_tunic.png' },
    overlay: { path: '/assets/equipment/overlays/chest/chest_cloth_tunic.png' },
    unlockMethod: 'milestone',
    unlockRequirement: { metric: 'tasksCompleted', target: 10 },
    unlockDescription: 'Complete 10 tasks',
  },

  chest_leather_vest: {
    id: 'chest_leather_vest',
    name: 'Leather Vest',
    slot: 'chest',
    rarity: 'common',
    description: 'Light leather protection',
    stats: { defense: 3, vitality: 2 },
    levelRequired: 3,
    sprite: { path: '/assets/equipment/chests/leather_vest.png' },
    overlay: { path: '/assets/equipment/overlays/chest/chest_leather_vest.png' },
    unlockMethod: 'level',
    unlockRequirement: { level: 3 },
    unlockDescription: 'Reach Level 3',
  },

  // Uncommon Chest
  chest_padded_armor: {
    id: 'chest_padded_armor',
    name: 'Padded Armour',
    slot: 'chest',
    rarity: 'uncommon',
    description: 'Quilted armour for comfort and protection',
    stats: { defense: 5, vitality: 3 },
    levelRequired: 5,
    sprite: { path: '/assets/equipment/chests/padded_armor.png' },
    overlay: { path: '/assets/equipment/overlays/chest/chest_leather_vest.png' },
    unlockMethod: 'default',
    unlockRequirement: { module: 'productivity', metric: 'tasks', value: 25 },
    unlockDescription: 'Complete 25 tasks',
  },

  chest_chainmail: {
    id: 'chest_chainmail',
    name: 'Chainmail Shirt',
    slot: 'chest',
    rarity: 'uncommon',
    description: 'Interlocking metal rings',
    stats: { defense: 7, vitality: 3, strength: 1 },
    levelRequired: 8,
    sprite: { path: '/assets/equipment/chests/chainmail_shirt.png' },
    overlay: { path: '/assets/equipment/overlays/chest/chest_chainmail.png' },
    unlockMethod: 'default',
    unlockRequirement: { module: 'fitness', metric: 'workouts', value: 25 },
    unlockDescription: 'Complete 25 workouts',
  },

  // Rare Chest
  chest_reinforced_breastplate: {
    id: 'chest_reinforced_breastplate',
    name: 'Reinforced Breastplate',
    slot: 'chest',
    rarity: 'rare',
    description: 'Steel-reinforced protection',
    stats: { defense: 10, vitality: 5, strength: 2 },
    levelRequired: 12,
    sprite: { path: '/assets/equipment/chests/reinforced_breastplate.png' },
    overlay: { path: '/assets/equipment/overlays/chest/chest_iron_plate.png' },
    unlockMethod: 'default',
    unlockRequirement: { module: 'fitness', metric: 'workouts', value: 50 },
    unlockDescription: 'Complete 50 workouts',
  },

  chest_steel_plate: {
    id: 'chest_steel_plate',
    name: 'Steel Plate',
    slot: 'chest',
    rarity: 'rare',
    description: 'Heavy steel plate armour',
    stats: { defense: 12, vitality: 6, strength: 3 },
    levelRequired: 15,
    sprite: { path: '/assets/equipment/chests/steel_plate.png' },
    overlay: { path: '/assets/equipment/overlays/chest/chest_steel_plate.png' },
    unlockMethod: 'default',
    unlockRequirement: { module: 'productivity', metric: 'tasks', value: 200 },
    unlockDescription: 'Complete 200 tasks',
  },

  // Epic Chest
  chest_paladin_chestguard: {
    id: 'chest_paladin_chestguard',
    name: 'Paladin Chestguard',
    slot: 'chest',
    rarity: 'epic',
    description: 'Blessed armour of holy warriors',
    stats: { defense: 15, vitality: 8, wisdom: 5 },
    levelRequired: 20,
    sprite: { path: '/assets/equipment/chests/paladin_chestguard.png' },
    overlay: { path: '/assets/equipment/overlays/chest/chest_steel_plate.png' },
    unlockMethod: 'default',
    unlockRequirement: { module: 'purpose', metric: 'goals_completed', value: 10 },
    unlockDescription: 'Complete 10 purpose goals',
  },

  chest_titanium_platemail: {
    id: 'chest_titanium_platemail',
    name: 'Titanium Platemail',
    slot: 'chest',
    rarity: 'epic',
    description: 'Near-impenetrable titanium armour',
    stats: { defense: 18, vitality: 10, strength: 5 },
    levelRequired: 25,
    sprite: { path: '/assets/equipment/chests/titanium_platemail.png' },
    overlay: { path: '/assets/equipment/overlays/chest/chest_steel_plate.png' },
    unlockMethod: 'default',
    unlockRequirement: { module: 'fitness', metric: 'workouts', value: 150 },
    unlockDescription: 'Complete 150 workouts',
  },

  // Legendary Chest
  chest_dragon: {
    id: 'chest_dragon',
    name: 'Dragon Scale Armour',
    slot: 'chest',
    rarity: 'legendary',
    description: 'Impenetrable armour crafted from dragon scales',
    stats: { defense: 22, vitality: 12, strength: 8 },
    levelRequired: 30,
    sprite: { path: '/assets/equipment/chests/dragon_scale_chestplate.png' },
    overlay: { path: '/assets/equipment/overlays/chest/chest_dragon.png' },
    effects: [{ type: 'particle', name: 'flame_aura', color: '#ff4400' }],
    unlockMethod: 'default',
    unlockRequirement: { achievementId: 'fitness_legend' },
    unlockDescription: 'Complete "Fitness Legend" achievement',
    setBonus: { setName: 'dragon_knight', pieces: ['helmet_dragon', 'chest_dragon', 'weapon_dragon_blade'] },
  },

  chest_dragon_cuirass: {
    id: 'chest_dragon_cuirass',
    name: 'Dragon Bone Cuirass',
    slot: 'chest',
    rarity: 'legendary',
    description: 'Armour fused with dragon bones and dark magic',
    stats: { defense: 20, vitality: 10, intelligence: 8, strength: 6 },
    levelRequired: 32,
    sprite: { path: '/assets/equipment/chests/dragon_bone_cuirass.png' },
    overlay: { path: '/assets/equipment/overlays/chest/chest_dragon.png' },
    effects: [{ type: 'particle', name: 'shadow_aura', color: '#8800ff' }],
    unlockMethod: 'default',
    unlockRequirement: { module: 'knowledge', metric: 'books', value: 30 },
    unlockDescription: 'Finish 30 books',
  },

  chest_phoenix: {
    id: 'chest_phoenix',
    name: 'Phoenix Battleplate',
    slot: 'chest',
    rarity: 'legendary',
    description: 'Armour blessed with phoenix fire',
    stats: { defense: 18, vitality: 15, wisdom: 8 },
    levelRequired: 35,
    sprite: { path: '/assets/equipment/chests/phoenix_battleplate.png' },
    overlay: { path: '/assets/equipment/overlays/chest/chest_phoenix_plate.png' },
    effects: [{ type: 'particle', name: 'flame_aura', color: '#ffaa00' }],
    unlockMethod: 'default',
    unlockRequirement: { module: 'fitness', metric: 'streak', value: 90 },
    unlockDescription: '90-day workout streak',
    setBonus: { setName: 'phoenix_warrior', pieces: ['helmet_phoenix_crown', 'chest_phoenix', 'weapon_phoenix_blade'] },
  },

  chest_aegis_titan: {
    id: 'chest_aegis_titan',
    name: 'Aegis of the Titan',
    slot: 'chest',
    rarity: 'legendary',
    description: 'Armour of the ancient titans',
    stats: { defense: 25, vitality: 15, strength: 10 },
    levelRequired: 40,
    sprite: { path: '/assets/equipment/chests/aegis_titan.png' },
    overlay: { path: '/assets/equipment/overlays/chest/chest_steel_plate.png' },
    effects: [{ type: 'particle', name: 'divine_aura', color: '#ffd700' }],
    unlockMethod: 'default',
    unlockRequirement: { level: 40 },
    unlockDescription: 'Reach Level 40',
  },

  // Mythical Chest Armor (Generated)
  chest_void_platemail: {
    id: 'chest_void_platemail',
    name: 'Void Platemail',
    slot: 'chest',
    rarity: 'mythical',
    description: 'Armour forged from the essence of the void',
    stats: { defense: 17, vitality: 8, intelligence: 5 },
    levelRequired: 25,
    sprite: { path: '/assets/equipment/chests/void_platemail.png' },
    overlay: { path: '/assets/equipment/overlays/chest/chest_steel_plate.png' },
    effects: [{ type: 'particle', name: 'shadow_aura', color: '#8b00ff' }],
    unlockMethod: 'prestige',
    unlockDescription: 'Reach Prestige 3',
  },

  chest_crystal_aegis: {
    id: 'chest_crystal_aegis',
    name: 'Crystal Aegis Armour',
    slot: 'chest',
    rarity: 'mythical',
    description: 'Crystalline armour embedded with frost crystals',
    stats: { defense: 16, vitality: 6, intelligence: 8 },
    levelRequired: 25,
    sprite: { path: '/assets/equipment/chests/crystal_aegis.png' },
    overlay: { path: '/assets/equipment/overlays/chest/chest_steel_plate.png' },
    effects: [{ type: 'particle', name: 'frost', color: '#00ffff' }],
    unlockMethod: 'skill_tree',
    unlockDescription: 'Reach Mind Tree Level 50',
  },

  chest_celestial_raiment: {
    id: 'chest_celestial_raiment',
    name: 'Celestial Raiment',
    slot: 'chest',
    rarity: 'mythical',
    description: 'Divine armour blessed by the celestial beings',
    stats: { defense: 20, vitality: 10, wisdom: 12 },
    levelRequired: 35,
    sprite: { path: '/assets/equipment/chests/celestial_raiment.png' },
    overlay: { path: '/assets/equipment/overlays/chest/chest_phoenix_plate.png' },
    effects: [{ type: 'particle', name: 'divine_aura', color: '#ffd700' }],
    unlockMethod: 'streak',
    unlockRequirement: { streakDays: 200, module: null },
    unlockDescription: '200-day streak in any module',
  },

  chest_abyssal_cuirass: {
    id: 'chest_abyssal_cuirass',
    name: 'Abyssal Cuirass',
    slot: 'chest',
    rarity: 'mythical',
    description: 'Armour from the depths of the abyss',
    stats: { defense: 22, vitality: 12, intelligence: 8 },
    levelRequired: 35,
    sprite: { path: '/assets/equipment/chests/abyssal_cuirass.png' },
    overlay: { path: '/assets/equipment/overlays/chest/chest_dragon.png' },
    effects: [{ type: 'particle', name: 'shadow_aura', color: '#00cccc' }],
    unlockMethod: 'pvp',
    unlockDescription: 'Reach Legend rank in PvP',
  },

  chest_stormforged_breastplate: {
    id: 'chest_stormforged_breastplate',
    name: 'Stormforged Breastplate',
    slot: 'chest',
    rarity: 'mythical',
    description: 'Steel armour crackling with lightning',
    stats: { defense: 18, strength: 8, vitality: 6 },
    levelRequired: 28,
    sprite: { path: '/assets/equipment/chests/stormforged_breastplate.png' },
    overlay: { path: '/assets/equipment/overlays/chest/chest_steel_plate.png' },
    effects: [{ type: 'particle', name: 'lightning', color: '#4488ff' }],
    unlockMethod: 'module',
    unlockDescription: 'Complete 300 workouts',
  },

  chest_infernal_harness: {
    id: 'chest_infernal_harness',
    name: 'Infernal Harness',
    slot: 'chest',
    rarity: 'mythical',
    description: 'Demonic armour with molten lava veins',
    stats: { defense: 21, strength: 12, vitality: 8 },
    levelRequired: 38,
    sprite: { path: '/assets/equipment/chests/infernal_harness.png' },
    overlay: { path: '/assets/equipment/overlays/chest/chest_dragon.png' },
    effects: [{ type: 'particle', name: 'flame_aura', color: '#ff4400' }],
    unlockMethod: 'module',
    unlockDescription: 'Complete 1000 tasks',
  },

  // ========================================
  // WEAPONS - 17 items
  // ========================================

  // Common Weapons
  weapon_training_sword: {
    id: 'weapon_training_sword',
    name: 'Training Sword',
    slot: 'mainHand',
    rarity: 'common',
    description: 'A simple blade for learning the basics',
    stats: { strength: 2 },
    levelRequired: 2,
    sprite: { path: '/assets/equipment/weapons/training_sword.png' },
    overlay: { path: '/assets/equipment/overlays/weapons/weapon_wooden_sword.png' },
    weaponType: 'sword',
    unlockMethod: 'milestone',
    unlockRequirement: { metric: 'workoutsCompleted', target: 5 },
    unlockDescription: 'Complete 5 workouts',
  },

  weapon_wooden_staff: {
    id: 'weapon_wooden_staff',
    name: 'Wooden Staff',
    slot: 'mainHand',
    rarity: 'common',
    description: 'A simple wooden staff',
    stats: { intelligence: 2, wisdom: 1 },
    levelRequired: 2,
    sprite: { path: '/assets/equipment/weapons/wooden_staff.png' },
    overlay: { path: '/assets/equipment/overlays/weapons/weapon_wooden_sword.png' },
    weaponType: 'staff',
    unlockMethod: 'milestone',
    unlockRequirement: { metric: 'booksCompleted', target: 3 },
    unlockDescription: 'Finish 3 books',
  },

  // Uncommon Weapons
  weapon_iron_sword: {
    id: 'weapon_iron_sword',
    name: 'Iron Sword',
    slot: 'mainHand',
    rarity: 'uncommon',
    description: 'Well-balanced iron blade',
    stats: { strength: 5 },
    levelRequired: 5,
    sprite: { path: '/assets/equipment/weapons/iron_sword.png' },
    overlay: { path: '/assets/equipment/overlays/weapons/weapon_iron_sword.png' },
    weaponType: 'sword',
    unlockMethod: 'default',
    unlockRequirement: { module: 'productivity', metric: 'tasks', value: 25 },
    unlockDescription: 'Complete 25 tasks',
  },

  weapon_iron_dagger: {
    id: 'weapon_iron_dagger',
    name: 'Iron Dagger',
    slot: 'mainHand',
    rarity: 'uncommon',
    description: 'Quick and deadly',
    stats: { strength: 3, wisdom: 2 },
    levelRequired: 5,
    sprite: { path: '/assets/equipment/weapons/iron_dagger.png' },
    overlay: { path: '/assets/equipment/overlays/weapons/weapon_iron_sword.png' },
    weaponType: 'dagger',
    unlockMethod: 'default',
    unlockRequirement: { module: 'calendar', metric: 'events_completed', value: 20 },
    unlockDescription: 'Complete 20 calendar events',
  },

  weapon_wizard_wand: {
    id: 'weapon_wizard_wand',
    name: 'Wizard Wand',
    slot: 'mainHand',
    rarity: 'uncommon',
    description: 'A wand for aspiring wizards',
    stats: { intelligence: 5, wisdom: 2 },
    levelRequired: 5,
    sprite: { path: '/assets/equipment/weapons/wizard_wand.png' },
    overlay: { path: '/assets/equipment/overlays/weapons/weapon_wooden_sword.png' },
    weaponType: 'wand',
    unlockMethod: 'default',
    unlockRequirement: { module: 'knowledge', metric: 'books', value: 3 },
    unlockDescription: 'Finish 3 books',
  },

  // Rare Weapons
  weapon_steel_longsword: {
    id: 'weapon_steel_longsword',
    name: 'Steel Longsword',
    slot: 'mainHand',
    rarity: 'rare',
    description: 'A masterfully forged longsword',
    stats: { strength: 8, vitality: 2 },
    levelRequired: 12,
    sprite: { path: '/assets/equipment/weapons/steel_longsword.png' },
    overlay: { path: '/assets/equipment/overlays/weapons/weapon_steel_blade.png' },
    weaponType: 'sword',
    ability: 'power_slash',
    unlockMethod: 'default',
    unlockRequirement: { module: 'productivity', metric: 'tasks', value: 100 },
    unlockDescription: 'Complete 100 tasks',
  },

  weapon_battle_axe: {
    id: 'weapon_battle_axe',
    name: 'Battle Axe',
    slot: 'mainHand',
    rarity: 'rare',
    description: 'A heavy weapon for crushing blows',
    stats: { strength: 10, defense: 2 },
    levelRequired: 15,
    sprite: { path: '/assets/equipment/weapons/battle_axe.png' },
    overlay: { path: '/assets/equipment/overlays/weapons/weapon_steel_blade.png' },
    weaponType: 'axe',
    ability: 'cleaving_blow',
    unlockMethod: 'default',
    unlockRequirement: { module: 'fitness', metric: 'workouts', value: 75 },
    unlockDescription: 'Complete 75 workouts',
  },

  weapon_enchanted_blade: {
    id: 'weapon_enchanted_blade',
    name: 'Enchanted Blade',
    slot: 'mainHand',
    rarity: 'rare',
    description: 'A blade infused with magic',
    stats: { strength: 6, intelligence: 4 },
    levelRequired: 15,
    sprite: { path: '/assets/equipment/weapons/enchanted_blade.png' },
    overlay: { path: '/assets/equipment/overlays/weapons/weapon_steel_blade.png' },
    weaponType: 'sword',
    ability: 'blade_dance',
    unlockMethod: 'default',
    unlockRequirement: { module: 'knowledge', metric: 'books', value: 10 },
    unlockDescription: 'Finish 10 books',
  },

  // Epic Weapons
  weapon_thunder_hammer: {
    id: 'weapon_thunder_hammer',
    name: 'Thunder Hammer',
    slot: 'mainHand',
    rarity: 'epic',
    description: 'Crackling with lightning',
    stats: { strength: 12, vitality: 4 },
    levelRequired: 20,
    sprite: { path: '/assets/equipment/weapons/thunder_hammer.png' },
    overlay: { path: '/assets/equipment/overlays/weapons/weapon_steel_blade.png' },
    weaponType: 'hammer',
    ability: 'thunderous_blow',
    effects: [{ type: 'particle', name: 'lightning', color: '#88ccff' }],
    unlockMethod: 'default',
    unlockRequirement: { module: 'fitness', metric: 'workouts', value: 100 },
    unlockDescription: 'Complete 100 workouts',
  },

  weapon_executioner_axe: {
    id: 'weapon_executioner_axe',
    name: "Executioner's Axe",
    slot: 'mainHand',
    rarity: 'epic',
    description: 'The final judgment',
    stats: { strength: 15, defense: 3 },
    levelRequired: 22,
    sprite: { path: '/assets/equipment/weapons/executioner_axe.png' },
    overlay: { path: '/assets/equipment/overlays/weapons/weapon_steel_blade.png' },
    weaponType: 'axe',
    ability: 'berserker_rage',
    unlockMethod: 'default',
    unlockRequirement: { module: 'productivity', metric: 'tasks', value: 500 },
    unlockDescription: 'Complete 500 tasks',
  },

  weapon_archmage_staff: {
    id: 'weapon_archmage_staff',
    name: 'Archmage Staff',
    slot: 'mainHand',
    rarity: 'epic',
    description: 'Staff of supreme magical power',
    stats: { intelligence: 14, wisdom: 10 },
    levelRequired: 25,
    sprite: { path: '/assets/equipment/weapons/archmage_staff.png' },
    overlay: { path: '/assets/equipment/overlays/weapons/weapon_wooden_sword.png' },
    weaponType: 'staff',
    ability: 'arcane_nova',
    effects: [{ type: 'particle', name: 'arcane', color: '#aa44ff' }],
    unlockMethod: 'default',
    unlockRequirement: { module: 'knowledge', metric: 'books', value: 20 },
    unlockDescription: 'Finish 20 books',
  },

  weapon_warlock_scepter: {
    id: 'weapon_warlock_scepter',
    name: 'Warlock Scepter',
    slot: 'mainHand',
    rarity: 'epic',
    description: 'Channel dark energies',
    stats: { intelligence: 12, wisdom: 6, strength: 4 },
    levelRequired: 25,
    sprite: { path: '/assets/equipment/weapons/warlock_scepter.png' },
    overlay: { path: '/assets/equipment/overlays/weapons/weapon_wooden_sword.png' },
    weaponType: 'scepter',
    ability: 'soul_drain',
    effects: [{ type: 'particle', name: 'shadow', color: '#6600aa' }],
    unlockMethod: 'default',
    unlockRequirement: { module: 'journal', metric: 'entries', value: 100 },
    unlockDescription: 'Write 100 journal entries',
  },

  // Legendary Weapons
  weapon_dragon_blade: {
    id: 'weapon_dragon_blade',
    name: 'Dragon Blade',
    slot: 'mainHand',
    rarity: 'legendary',
    description: 'A blade infused with the essence of dragons',
    stats: { strength: 18, vitality: 5, intelligence: 5 },
    levelRequired: 30,
    sprite: { path: '/assets/equipment/weapons/dragon_blade.png' },
    overlay: { path: '/assets/equipment/overlays/weapons/weapon_dragon_blade.png' },
    weaponType: 'sword',
    ability: 'dragon_breath',
    effects: [{ type: 'particle', name: 'flame_trail', color: '#ff4400' }],
    unlockMethod: 'default',
    unlockRequirement: { achievementId: 'productivity_master' },
    unlockDescription: 'Complete "Productivity Master" achievement',
    setBonus: { setName: 'dragon_knight', pieces: ['helmet_dragon', 'chest_dragon', 'weapon_dragon_blade'] },
  },

  weapon_bloodfang: {
    id: 'weapon_bloodfang',
    name: 'Bloodfang',
    slot: 'mainHand',
    rarity: 'legendary',
    description: 'A cursed blade that thirsts for battle',
    stats: { strength: 20, vitality: -3 },
    levelRequired: 32,
    sprite: { path: '/assets/equipment/weapons/bloodfang.png' },
    overlay: { path: '/assets/equipment/overlays/weapons/weapon_dragon_blade.png' },
    weaponType: 'sword',
    ability: 'shadow_strike',
    effects: [{ type: 'particle', name: 'blood', color: '#cc0000' }],
    unlockMethod: 'default',
    unlockRequirement: { module: 'fitness', metric: 'workouts', value: 200 },
    unlockDescription: 'Complete 200 workouts',
  },

  weapon_eternity_edge: {
    id: 'weapon_eternity_edge',
    name: 'Eternity Edge',
    slot: 'mainHand',
    rarity: 'legendary',
    description: 'A blade that transcends time',
    stats: { strength: 15, intelligence: 10, wisdom: 8 },
    levelRequired: 35,
    sprite: { path: '/assets/equipment/weapons/eternity_edge.png' },
    overlay: { path: '/assets/equipment/overlays/weapons/weapon_phoenix_sword.png' },
    weaponType: 'sword',
    ability: 'void_slash',
    effects: [{ type: 'particle', name: 'time', color: '#00ffaa' }],
    unlockMethod: 'default',
    unlockRequirement: { module: 'calendar', metric: 'streak', value: 365 },
    unlockDescription: '365-day planning streak',
  },

  weapon_godslayer: {
    id: 'weapon_godslayer',
    name: 'Godslayer',
    slot: 'mainHand',
    rarity: 'legendary',
    description: 'The ultimate weapon of destruction',
    stats: { strength: 25, vitality: 8, intelligence: 8 },
    levelRequired: 40,
    sprite: { path: '/assets/equipment/weapons/godslayer.png' },
    overlay: { path: '/assets/equipment/overlays/weapons/weapon_dragon_blade.png' },
    weaponType: 'sword',
    ability: 'meteor',
    effects: [{ type: 'particle', name: 'divine', color: '#ffd700' }],
    unlockMethod: 'default',
    unlockRequirement: { level: 40 },
    unlockDescription: 'Reach Level 40',
  },

  // Mythical Weapons (Generated)
  weapon_void_scythe: {
    id: 'weapon_void_scythe',
    name: 'Void Scythe',
    slot: 'mainHand',
    rarity: 'mythical',
    description: 'A dark scythe emanating shadow energy from the void',
    stats: { strength: 14, intelligence: 8 },
    levelRequired: 25,
    sprite: { path: '/assets/equipment/weapons/void_scythe.png' },
    overlay: { path: '/assets/equipment/overlays/weapons/weapon_dragon_blade.png' },
    weaponType: 'axe',
    ability: 'void_slash',
    effects: [{ type: 'particle', name: 'shadow', color: '#8b00ff' }],
    unlockMethod: 'secret',
    unlockDescription: '???',
  },

  weapon_frostbite_blade: {
    id: 'weapon_frostbite_blade',
    name: 'Frostbite Blade',
    slot: 'mainHand',
    rarity: 'mythical',
    description: 'An ice crystal sword that freezes all it touches',
    stats: { strength: 12, intelligence: 6 },
    levelRequired: 25,
    sprite: { path: '/assets/equipment/weapons/frostbite_blade.png' },
    overlay: { path: '/assets/equipment/overlays/weapons/weapon_steel_blade.png' },
    weaponType: 'sword',
    ability: 'power_slash',
    effects: [{ type: 'particle', name: 'frost', color: '#00ffff' }],
    unlockMethod: 'module',
    unlockDescription: 'Maintain 90% planning accuracy for 30 days',
  },

  weapon_celestial_mace: {
    id: 'weapon_celestial_mace',
    name: 'Celestial Mace',
    slot: 'mainHand',
    rarity: 'mythical',
    description: 'A divine mace radiating holy light',
    stats: { strength: 16, wisdom: 10, vitality: 5 },
    levelRequired: 35,
    sprite: { path: '/assets/equipment/weapons/celestial_mace.png' },
    overlay: { path: '/assets/equipment/overlays/weapons/weapon_steel_blade.png' },
    weaponType: 'hammer',
    ability: 'earthshatter',
    effects: [{ type: 'particle', name: 'divine', color: '#ffd700' }],
    unlockMethod: 'achievement',
    unlockDescription: 'Complete "Celestial Guardian" achievement',
  },

  weapon_abyssal_trident: {
    id: 'weapon_abyssal_trident',
    name: 'Abyssal Trident',
    slot: 'mainHand',
    rarity: 'mythical',
    description: 'A trident from the oceanic depths',
    stats: { strength: 15, intelligence: 10, vitality: 6 },
    levelRequired: 35,
    sprite: { path: '/assets/equipment/weapons/abyssal_trident.png' },
    overlay: { path: '/assets/equipment/overlays/weapons/weapon_dragon_blade.png' },
    weaponType: 'sword',
    ability: 'cleaving_blow',
    effects: [{ type: 'particle', name: 'water', color: '#00cccc' }],
    unlockMethod: 'pvp',
    unlockDescription: 'Win 150 PvP battles and reach Platinum rank',
  },

  weapon_thunderstrike_axe: {
    id: 'weapon_thunderstrike_axe',
    name: 'Thunderstrike Axe',
    slot: 'mainHand',
    rarity: 'mythical',
    description: 'A battle axe crackling with lightning',
    stats: { strength: 16, vitality: 5 },
    levelRequired: 28,
    sprite: { path: '/assets/equipment/weapons/thunderstrike_axe.png' },
    overlay: { path: '/assets/equipment/overlays/weapons/weapon_steel_blade.png' },
    weaponType: 'axe',
    ability: 'thunderous_blow',
    effects: [{ type: 'particle', name: 'lightning', color: '#4488ff' }],
    unlockMethod: 'module',
    unlockDescription: 'Complete 500 habit check-ins',
  },

  weapon_infernal_greatsword: {
    id: 'weapon_infernal_greatsword',
    name: 'Infernal Greatsword',
    slot: 'mainHand',
    rarity: 'mythical',
    description: 'A demonic greatsword with a molten lava blade',
    stats: { strength: 20, vitality: 6 },
    levelRequired: 38,
    sprite: { path: '/assets/equipment/weapons/infernal_greatsword.png' },
    overlay: { path: '/assets/equipment/overlays/weapons/weapon_dragon_blade.png' },
    weaponType: 'sword',
    ability: 'dragon_breath',
    effects: [{ type: 'particle', name: 'flame_trail', color: '#ff4400' }],
    unlockMethod: 'skill_tree',
    unlockDescription: 'Reach Body Tree Level 50',
  },

  // ========================================
  // SHIELDS - 10 items
  // ========================================

  shield_wooden_buckler: {
    id: 'shield_wooden_buckler',
    name: 'Wooden Buckler',
    slot: 'offHand',
    rarity: 'common',
    description: 'Simple wooden shield',
    stats: { defense: 2 },
    levelRequired: 2,
    sprite: { path: '/assets/equipment/shields/wooden_buckler.png' },
    overlay: { path: '/assets/equipment/overlays/shields/shield_wooden.png' },
    unlockMethod: 'milestone',
    unlockRequirement: { metric: 'journalEntriesWritten', target: 5 },
    unlockDescription: 'Write 5 journal entries',
  },

  shield_iron: {
    id: 'shield_iron',
    name: 'Iron Shield',
    slot: 'offHand',
    rarity: 'uncommon',
    description: 'Reinforced iron shield',
    stats: { defense: 5, vitality: 2 },
    levelRequired: 5,
    sprite: { path: '/assets/equipment/shields/iron_shield.png' },
    overlay: { path: '/assets/equipment/overlays/shields/shield_iron.png' },
    unlockMethod: 'default',
    unlockRequirement: { module: 'fitness', metric: 'workouts', value: 15 },
    unlockDescription: 'Complete 15 workouts',
  },

  shield_steel_kite: {
    id: 'shield_steel_kite',
    name: 'Steel Kite Shield',
    slot: 'offHand',
    rarity: 'rare',
    description: 'A large steel kite shield',
    stats: { defense: 8, vitality: 4 },
    levelRequired: 12,
    sprite: { path: '/assets/equipment/shields/steel_kite.png' },
    overlay: { path: '/assets/equipment/overlays/shields/shield_steel.png' },
    unlockMethod: 'default',
    unlockRequirement: { module: 'productivity', metric: 'tasks', value: 100 },
    unlockDescription: 'Complete 100 tasks',
  },

  shield_tower: {
    id: 'shield_tower',
    name: 'Tower Shield',
    slot: 'offHand',
    rarity: 'rare',
    description: 'Massive protective barrier',
    stats: { defense: 12, vitality: 3 },
    levelRequired: 15,
    sprite: { path: '/assets/equipment/shields/tower_shield.png' },
    overlay: { path: '/assets/equipment/overlays/shields/shield_steel.png' },
    unlockMethod: 'default',
    unlockRequirement: { module: 'fitness', metric: 'workouts', value: 60 },
    unlockDescription: 'Complete 60 workouts',
  },

  shield_fortress: {
    id: 'shield_fortress',
    name: 'Fortress Shield',
    slot: 'offHand',
    rarity: 'epic',
    description: 'An impenetrable wall',
    stats: { defense: 15, vitality: 6 },
    levelRequired: 20,
    sprite: { path: '/assets/equipment/shields/fortress_shield.png' },
    overlay: { path: '/assets/equipment/overlays/shields/shield_steel.png' },
    unlockMethod: 'default',
    unlockRequirement: { module: 'purpose', metric: 'goals_completed', value: 5 },
    unlockDescription: 'Complete 5 purpose goals',
  },

  shield_guardian_bulwark: {
    id: 'shield_guardian_bulwark',
    name: 'Guardian Bulwark',
    slot: 'offHand',
    rarity: 'epic',
    description: 'Protects all who stand behind it',
    stats: { defense: 14, vitality: 8, wisdom: 3 },
    levelRequired: 25,
    sprite: { path: '/assets/equipment/shields/guardian_bulwark.png' },
    overlay: { path: '/assets/equipment/overlays/shields/shield_steel.png' },
    unlockMethod: 'default',
    unlockRequirement: { module: 'journal', metric: 'streak', value: 60 },
    unlockDescription: '60-day journal streak',
  },

  shield_dragon: {
    id: 'shield_dragon',
    name: 'Dragon Shield',
    slot: 'offHand',
    rarity: 'legendary',
    description: 'Forged from a dragon scale',
    stats: { defense: 18, vitality: 8, strength: 3 },
    levelRequired: 30,
    sprite: { path: '/assets/equipment/shields/dragon_shield.png' },
    overlay: { path: '/assets/equipment/overlays/shields/shield_dragon.png' },
    effects: [{ type: 'particle', name: 'flame', color: '#ff4400' }],
    unlockMethod: 'default',
    unlockRequirement: { achievementId: 'dragon_defender' },
    unlockDescription: 'Defeat the Dragon challenge',
  },

  shield_immortal: {
    id: 'shield_immortal',
    name: 'Immortal Shield',
    slot: 'offHand',
    rarity: 'legendary',
    description: 'Cannot be broken',
    stats: { defense: 20, vitality: 12 },
    levelRequired: 35,
    sprite: { path: '/assets/equipment/shields/immortal_shield.png' },
    overlay: { path: '/assets/equipment/overlays/shields/shield_dragon.png' },
    effects: [{ type: 'particle', name: 'divine', color: '#ffd700' }],
    unlockMethod: 'default',
    unlockRequirement: { module: 'fitness', metric: 'streak', value: 180 },
    unlockDescription: '180-day workout streak',
  },

  // Mythical Shields (Generated)
  shield_void_bulwark: {
    id: 'shield_void_bulwark',
    name: 'Void Bulwark',
    slot: 'offHand',
    rarity: 'mythical',
    description: 'A tower shield with a glowing void eye at its center',
    stats: { defense: 14, vitality: 6, intelligence: 4 },
    levelRequired: 25,
    sprite: { path: '/assets/equipment/shields/void_bulwark.png' },
    overlay: { path: '/assets/equipment/overlays/shields/shield_steel.png' },
    effects: [{ type: 'particle', name: 'shadow', color: '#8b00ff' }],
    unlockMethod: 'prestige',
    unlockDescription: 'Reach Prestige 4',
  },

  shield_glacial_aegis: {
    id: 'shield_glacial_aegis',
    name: 'Glacial Aegis',
    slot: 'offHand',
    rarity: 'mythical',
    description: 'An ice crystal shield with frost spikes',
    stats: { defense: 13, vitality: 5, intelligence: 5 },
    levelRequired: 25,
    sprite: { path: '/assets/equipment/shields/glacial_aegis.png' },
    overlay: { path: '/assets/equipment/overlays/shields/shield_steel.png' },
    effects: [{ type: 'particle', name: 'frost', color: '#00ffff' }],
    unlockMethod: 'module',
    unlockDescription: 'Maintain 95% health score for 60 days',
  },

  shield_divine_barrier: {
    id: 'shield_divine_barrier',
    name: 'Divine Barrier',
    slot: 'offHand',
    rarity: 'mythical',
    description: 'A golden shield radiating holy light',
    stats: { defense: 18, vitality: 10, wisdom: 8 },
    levelRequired: 35,
    sprite: { path: '/assets/equipment/shields/divine_barrier.png' },
    overlay: { path: '/assets/equipment/overlays/shields/shield_dragon.png' },
    effects: [{ type: 'particle', name: 'divine', color: '#ffd700' }],
    unlockMethod: 'level',
    unlockDescription: 'Reach Level 75',
  },

  // ========================================
  // CAPES - 10 items
  // ========================================

  cape_traveler: {
    id: 'cape_traveler',
    name: "Traveler's Cloak",
    slot: 'cape',
    rarity: 'common',
    description: 'A simple cloak for your journey',
    stats: { wisdom: 1 },
    levelRequired: 2,
    sprite: { path: '/assets/equipment/capes/traveler_cloak.png' },
    overlay: { path: '/assets/equipment/overlays/capes/cape_cloth.png' },
    unlockMethod: 'level',
    unlockRequirement: { level: 2 },
    unlockDescription: 'Reach level 2',
  },

  cape_leather: {
    id: 'cape_leather',
    name: 'Leather Cape',
    slot: 'cape',
    rarity: 'common',
    description: 'Durable leather cape',
    stats: { defense: 1, wisdom: 1 },
    levelRequired: 3,
    sprite: { path: '/assets/equipment/capes/leather_cape.png' },
    overlay: { path: '/assets/equipment/overlays/capes/cape_cloth.png' },
    unlockMethod: 'default',
    unlockRequirement: { level: 3 },
    unlockDescription: 'Reach Level 3',
  },

  cape_sage: {
    id: 'cape_sage',
    name: "Sage's Cloak",
    slot: 'cape',
    rarity: 'uncommon',
    description: 'Worn by wise scholars',
    stats: { intelligence: 3, wisdom: 2 },
    levelRequired: 8,
    sprite: { path: '/assets/equipment/capes/sage_cloak.png' },
    overlay: { path: '/assets/equipment/overlays/capes/cape_cloth.png' },
    unlockMethod: 'default',
    unlockRequirement: { module: 'knowledge', metric: 'books', value: 5 },
    unlockDescription: 'Finish 5 books',
  },

  cape_mystic_robe: {
    id: 'cape_mystic_robe',
    name: 'Mystic Robe',
    slot: 'cape',
    rarity: 'rare',
    description: 'Channels mystical energies',
    stats: { intelligence: 5, wisdom: 4 },
    levelRequired: 12,
    sprite: { path: '/assets/equipment/capes/mystic_robe.png' },
    overlay: { path: '/assets/equipment/overlays/capes/cape_cloth.png' },
    unlockMethod: 'default',
    unlockRequirement: { module: 'journal', metric: 'entries', value: 50 },
    unlockDescription: 'Write 50 journal entries',
  },

  cape_shadow: {
    id: 'cape_shadow',
    name: 'Shadow Cloak',
    slot: 'cape',
    rarity: 'epic',
    description: 'A mysterious cloak that bends light',
    stats: { wisdom: 8, intelligence: 5 },
    levelRequired: 15,
    sprite: { path: '/assets/equipment/capes/shadow_cloak.png' },
    overlay: { path: '/assets/equipment/overlays/capes/cape_shadow.png' },
    effects: [{ type: 'visual', name: 'shadow_trail', color: '#4a0080' }],
    unlockMethod: 'default',
    unlockRequirement: { module: 'knowledge', metric: 'books', value: 15 },
    unlockDescription: 'Finish 15 books',
  },

  cape_enchanter: {
    id: 'cape_enchanter',
    name: "Enchanter's Mantle",
    slot: 'cape',
    rarity: 'epic',
    description: 'Radiates magical power',
    stats: { intelligence: 8, wisdom: 6, vitality: 2 },
    levelRequired: 20,
    sprite: { path: '/assets/equipment/capes/enchanter_mantle.png' },
    overlay: { path: '/assets/equipment/overlays/capes/cape_cloth.png' },
    effects: [{ type: 'visual', name: 'arcane_glow', color: '#aa44ff' }],
    unlockMethod: 'default',
    unlockRequirement: { module: 'journal', metric: 'streak', value: 90 },
    unlockDescription: '90-day journal streak',
  },

  cape_ancient: {
    id: 'cape_ancient',
    name: 'Ancient Cloak',
    slot: 'cape',
    rarity: 'epic',
    description: 'From a forgotten age',
    stats: { wisdom: 10, intelligence: 6, defense: 3 },
    levelRequired: 25,
    sprite: { path: '/assets/equipment/capes/ancient_cloak.png' },
    overlay: { path: '/assets/equipment/overlays/capes/cape_cloth.png' },
    unlockMethod: 'default',
    unlockRequirement: { module: 'knowledge', metric: 'books', value: 25 },
    unlockDescription: 'Finish 25 books',
  },

  cape_dragon: {
    id: 'cape_dragon',
    name: 'Dragon Wing Cape',
    slot: 'cape',
    rarity: 'legendary',
    description: 'Made from dragon wing membrane',
    stats: { vitality: 8, strength: 5, defense: 5 },
    levelRequired: 30,
    sprite: { path: '/assets/equipment/capes/shadow.png' },
    overlay: { path: '/assets/equipment/overlays/capes/cape_dragon.png' },
    effects: [{ type: 'particle', name: 'flame', color: '#ff4400' }],
    unlockMethod: 'default',
    unlockRequirement: { achievementId: 'dragon_master' },
    unlockDescription: 'Master all dragon challenges',
  },

  cape_phoenix: {
    id: 'cape_phoenix',
    name: 'Phoenix Feather Cloak',
    slot: 'cape',
    rarity: 'legendary',
    description: 'Woven from phoenix feathers',
    stats: { vitality: 10, wisdom: 8, intelligence: 5 },
    levelRequired: 35,
    sprite: { path: '/assets/equipment/capes/shadow.png' },
    overlay: { path: '/assets/equipment/overlays/capes/cape_phoenix.png' },
    effects: [{ type: 'particle', name: 'flame', color: '#ffaa00' }],
    unlockMethod: 'default',
    unlockRequirement: { module: 'purpose', metric: 'goals_completed', value: 20 },
    unlockDescription: 'Complete 20 purpose goals',
    setBonus: { setName: 'phoenix_warrior', pieces: ['helmet_phoenix_crown', 'chest_phoenix', 'cape_phoenix'] },
  },

  cape_oracle: {
    id: 'cape_oracle',
    name: "Oracle's Shroud",
    slot: 'cape',
    rarity: 'legendary',
    description: 'See beyond the veil',
    stats: { wisdom: 15, intelligence: 10 },
    levelRequired: 40,
    sprite: { path: '/assets/equipment/capes/oracle_shroud.png' },
    overlay: { path: '/assets/equipment/overlays/capes/cape_noble.png' },
    effects: [{ type: 'particle', name: 'divine', color: '#88ccff' }],
    unlockMethod: 'default',
    unlockRequirement: { level: 40 },
    unlockDescription: 'Reach Level 40',
  },

  // Mythical Capes (Generated)
  cape_void_shroud: {
    id: 'cape_void_shroud',
    name: 'Void Shroud',
    slot: 'cape',
    rarity: 'mythical',
    description: 'A dark cloak with shadow wisps flowing from its edges',
    stats: { wisdom: 8, intelligence: 6 },
    levelRequired: 25,
    sprite: { path: '/assets/equipment/capes/void_shroud.png' },
    overlay: { path: '/assets/equipment/overlays/capes/cape_shadow.png' },
    effects: [{ type: 'visual', name: 'shadow_trail', color: '#8b00ff' }],
    unlockMethod: 'secret',
    unlockDescription: '???',
  },

  cape_frostweave_mantle: {
    id: 'cape_frostweave_mantle',
    name: 'Frostweave Mantle',
    slot: 'cape',
    rarity: 'mythical',
    description: 'An ice blue cape with frost crystals on its edges',
    stats: { wisdom: 7, intelligence: 5, defense: 2 },
    levelRequired: 25,
    sprite: { path: '/assets/equipment/capes/frostweave_mantle.png' },
    overlay: { path: '/assets/equipment/overlays/capes/cape_cloth.png' },
    effects: [{ type: 'visual', name: 'frost_trail', color: '#00ffff' }],
    unlockMethod: 'module',
    unlockDescription: 'Write 365 journal entries (one year of daily journaling)',
  },

  cape_celestial_wings: {
    id: 'cape_celestial_wings',
    name: 'Celestial Wings',
    slot: 'cape',
    rarity: 'mythical',
    description: 'A golden wing-shaped cape radiating divine light',
    stats: { wisdom: 12, vitality: 8, intelligence: 6 },
    levelRequired: 35,
    sprite: { path: '/assets/equipment/capes/celestial_wings_cape.png' },
    overlay: { path: '/assets/equipment/overlays/capes/cape_phoenix.png' },
    effects: [{ type: 'particle', name: 'divine_aura', color: '#ffd700' }],
    unlockMethod: 'streak',
    unlockDescription: '365-day streak (one full year)',
  },

  cape_abyssal_cloak: {
    id: 'cape_abyssal_cloak',
    name: 'Abyssal Cloak',
    slot: 'cape',
    rarity: 'mythical',
    description: 'A deep sea cloak with bioluminescent tentacle edges',
    stats: { wisdom: 10, intelligence: 10, vitality: 5 },
    levelRequired: 35,
    sprite: { path: '/assets/equipment/capes/abyssal_tentacle_cloak.png' },
    overlay: { path: '/assets/equipment/overlays/capes/cape_shadow.png' },
    effects: [{ type: 'visual', name: 'shadow_trail', color: '#00cccc' }],
    unlockMethod: 'pvp',
    unlockDescription: 'Win 300 PvP battles and reach Diamond rank',
  },

  // ========================================
  // LEG ARMOR - 8 items
  // ========================================

  legs_cloth_pants: {
    id: 'legs_cloth_pants',
    name: 'Cloth Pants',
    slot: 'legs',
    rarity: 'common',
    description: 'Simple cloth trousers',
    stats: { vitality: 1 },
    levelRequired: 3,
    sprite: { path: '/assets/equipment/legs/cloth_pants.png' },
    overlay: { path: '/assets/equipment/overlays/legs/legs_cloth_pants.png' },
    unlockMethod: 'level',
    unlockRequirement: { level: 3 },
    unlockDescription: 'Reach level 3',
  },

  legs_leather_leggings: {
    id: 'legs_leather_leggings',
    name: 'Leather Leggings',
    slot: 'legs',
    rarity: 'common',
    description: 'Reinforced leather leg armour',
    stats: { defense: 2, vitality: 1 },
    levelRequired: 3,
    sprite: { path: '/assets/equipment/legs/leather_leggings.png' },
    overlay: { path: '/assets/equipment/overlays/legs/legs_leather_leggings.png' },
    unlockMethod: 'default',
    unlockDescription: 'Starting equipment',
  },

  legs_chainmail: {
    id: 'legs_chainmail',
    name: 'Chainmail Leggings',
    slot: 'legs',
    rarity: 'uncommon',
    description: 'Interlocking metal ring leg armour',
    stats: { defense: 4, vitality: 2 },
    levelRequired: 8,
    sprite: { path: '/assets/equipment/legs/chainmail_leggings.png' },
    overlay: { path: '/assets/equipment/overlays/legs/legs_chainmail.png' },
    unlockMethod: 'level',
    unlockRequirement: { level: 8 },
    unlockDescription: 'Reach Level 8',
  },

  legs_iron_legguards: {
    id: 'legs_iron_legguards',
    name: 'Iron Legguards',
    slot: 'legs',
    rarity: 'rare',
    description: 'Heavy iron plate leg armour',
    stats: { defense: 6, vitality: 3, strength: 1 },
    levelRequired: 12,
    sprite: { path: '/assets/equipment/legs/iron_legguards.png' },
    overlay: { path: '/assets/equipment/overlays/legs/legs_iron_legguards.png' },
    unlockMethod: 'default',
    unlockDescription: 'Available at level 12',
  },

  legs_steel_legplates: {
    id: 'legs_steel_legplates',
    name: 'Steel Legplates',
    slot: 'legs',
    rarity: 'rare',
    description: 'Polished steel plate leg armour',
    stats: { defense: 8, vitality: 4, strength: 2 },
    levelRequired: 18,
    sprite: { path: '/assets/equipment/legs/steel_legplates.png' },
    overlay: { path: '/assets/equipment/overlays/legs/legs_steel_legplates.png' },
    unlockMethod: 'default',
    unlockDescription: 'Available at level 18',
  },

  legs_mage_robes: {
    id: 'legs_mage_robes',
    name: 'Arcane Legwraps',
    slot: 'legs',
    rarity: 'epic',
    description: 'Enchanted wizard leg wraps',
    stats: { intelligence: 6, wisdom: 4 },
    levelRequired: 20,
    sprite: { path: '/assets/equipment/legs/mage_robes_legs.png' },
    overlay: { path: '/assets/equipment/overlays/legs/legs_mage_robes.png' },
    unlockMethod: 'default',
    unlockDescription: 'Available at level 20',
  },

  legs_dragon: {
    id: 'legs_dragon',
    name: 'Dragon Scale Legguards',
    slot: 'legs',
    rarity: 'legendary',
    description: 'Legguards forged from dragon scales',
    stats: { defense: 10, vitality: 6, strength: 4 },
    levelRequired: 30,
    sprite: { path: '/assets/equipment/legs/dragon_legguards.png' },
    overlay: { path: '/assets/equipment/overlays/legs/legs_dragon.png' },
    effects: [{ type: 'particle', name: 'flame', color: '#ff4400' }],
    unlockMethod: 'default',
    unlockDescription: 'Available at level 30',
  },

  legs_phoenix: {
    id: 'legs_phoenix',
    name: 'Phoenix Flame Legguards',
    slot: 'legs',
    rarity: 'legendary',
    description: 'Legguards blessed by phoenix fire',
    stats: { vitality: 10, wisdom: 6, defense: 4 },
    levelRequired: 35,
    sprite: { path: '/assets/equipment/legs/phoenix_legguards.png' },
    overlay: { path: '/assets/equipment/overlays/legs/legs_phoenix.png' },
    effects: [{ type: 'particle', name: 'flame', color: '#ffaa00' }],
    unlockMethod: 'default',
    unlockDescription: 'Available at level 35',
  },

  // Mythical Leg Armor (Generated)
  legs_void_greaves: {
    id: 'legs_void_greaves',
    name: 'Void Greaves',
    slot: 'legs',
    rarity: 'mythical',
    description: 'Dark leg armour with shadow tendrils and glowing runes',
    stats: { defense: 8, vitality: 5, intelligence: 4 },
    levelRequired: 25,
    sprite: { path: '/assets/equipment/legs/void_greaves.png' },
    overlay: { path: '/assets/equipment/overlays/legs/legs_iron_legguards.png' },
    effects: [{ type: 'particle', name: 'shadow', color: '#8b00ff' }],
    unlockMethod: 'prestige',
    unlockDescription: 'Reach Prestige 2',
  },

  legs_crystal_legguards: {
    id: 'legs_crystal_legguards',
    name: 'Crystal Legguards',
    slot: 'legs',
    rarity: 'mythical',
    description: 'Crystalline leg armour embedded with frost crystals',
    stats: { defense: 7, vitality: 4, intelligence: 5 },
    levelRequired: 25,
    sprite: { path: '/assets/equipment/legs/crystal_legguards.png' },
    overlay: { path: '/assets/equipment/overlays/legs/legs_steel_legplates.png' },
    effects: [{ type: 'particle', name: 'frost', color: '#00ffff' }],
    unlockMethod: 'skill_tree',
    unlockDescription: 'Reach Craft Tree Level 40',
  },

  legs_celestial_tassets: {
    id: 'legs_celestial_tassets',
    name: 'Celestial Tassets',
    slot: 'legs',
    rarity: 'mythical',
    description: 'Divine golden leg armour with angelic feather motifs',
    stats: { defense: 10, vitality: 8, wisdom: 6 },
    levelRequired: 35,
    sprite: { path: '/assets/equipment/legs/celestial_tassets.png' },
    overlay: { path: '/assets/equipment/overlays/legs/legs_phoenix.png' },
    effects: [{ type: 'particle', name: 'divine', color: '#ffd700' }],
    unlockMethod: 'streak',
    unlockDescription: '150-day fitness streak',
  },

  legs_abyssal_cuisses: {
    id: 'legs_abyssal_cuisses',
    name: 'Abyssal Cuisses',
    slot: 'legs',
    rarity: 'mythical',
    description: 'Deep sea leg armour with bioluminescent patterns',
    stats: { defense: 11, vitality: 7, intelligence: 5 },
    levelRequired: 35,
    sprite: { path: '/assets/equipment/legs/abyssal_cuisses.png' },
    overlay: { path: '/assets/equipment/overlays/legs/legs_dragon.png' },
    effects: [{ type: 'particle', name: 'shadow', color: '#00cccc' }],
    unlockMethod: 'pvp',
    unlockDescription: 'Win 100 PvP battles and reach Gold rank',
  },

  legs_stormforged_greaves: {
    id: 'legs_stormforged_greaves',
    name: 'Stormforged Greaves',
    slot: 'legs',
    rarity: 'mythical',
    description: 'Electrified steel leg armour with lightning patterns',
    stats: { defense: 9, strength: 5, vitality: 4 },
    levelRequired: 28,
    sprite: { path: '/assets/equipment/legs/stormforged_greaves.png' },
    overlay: { path: '/assets/equipment/overlays/legs/legs_steel_legplates.png' },
    effects: [{ type: 'particle', name: 'lightning', color: '#4488ff' }],
    unlockMethod: 'module',
    unlockDescription: 'Complete 150 workouts',
  },

  legs_infernal_legguards: {
    id: 'legs_infernal_legguards',
    name: 'Infernal Legguards',
    slot: 'legs',
    rarity: 'mythical',
    description: 'Demonic leg armour with molten lava cracks',
    stats: { defense: 12, strength: 8, vitality: 5 },
    levelRequired: 38,
    sprite: { path: '/assets/equipment/legs/infernal_legguards.png' },
    overlay: { path: '/assets/equipment/overlays/legs/legs_dragon.png' },
    effects: [{ type: 'particle', name: 'flame', color: '#ff4400' }],
    unlockMethod: 'module',
    unlockDescription: 'Log 500 focus hours',
  },

  // ========================================
  // RINGS - 10 items (do not render on avatar)
  // ========================================

  ring_copper_band: {
    id: 'ring_copper_band',
    name: 'Copper Band',
    slot: 'ring',
    rarity: 'common',
    description: 'A simple copper ring',
    stats: { vitality: 1 },
    levelRequired: 2,
    sprite: { path: '/assets/equipment/rings/copper_band.png' },
    unlockMethod: 'level',
    unlockRequirement: { level: 2 },
    unlockDescription: 'Reach level 2',
  },

  ring_iron: {
    id: 'ring_iron',
    name: 'Iron Ring',
    slot: 'ring',
    rarity: 'common',
    description: 'A sturdy iron ring',
    stats: { defense: 1, strength: 1 },
    levelRequired: 3,
    sprite: { path: '/assets/equipment/rings/iron_ring.png' },
    unlockMethod: 'default',
    unlockDescription: 'Starting equipment',
  },

  ring_strength: {
    id: 'ring_strength',
    name: 'Ring of Strength',
    slot: 'ring',
    rarity: 'uncommon',
    description: 'Enhances physical power',
    stats: { strength: 4, vitality: 2 },
    levelRequired: 8,
    sprite: { path: '/assets/equipment/rings/strength_ring.png' },
    unlockMethod: 'default',
    unlockDescription: 'Available at level 8',
  },

  ring_intelligence: {
    id: 'ring_intelligence',
    name: 'Ring of Intelligence',
    slot: 'ring',
    rarity: 'uncommon',
    description: 'Sharpens the mind',
    stats: { intelligence: 4, wisdom: 2 },
    levelRequired: 8,
    sprite: { path: '/assets/equipment/rings/intelligence_ring.png' },
    unlockMethod: 'default',
    unlockDescription: 'Available at level 8',
  },

  ring_vitality: {
    id: 'ring_vitality',
    name: 'Ring of Vitality',
    slot: 'ring',
    rarity: 'rare',
    description: 'Pulses with life energy',
    stats: { vitality: 6, defense: 3 },
    levelRequired: 15,
    sprite: { path: '/assets/equipment/rings/vitality_ring.png' },
    unlockMethod: 'default',
    unlockDescription: 'Available at level 15',
  },

  ring_focus: {
    id: 'ring_focus',
    name: 'Focus Ring',
    slot: 'ring',
    rarity: 'rare',
    description: 'Enhances concentration',
    stats: { intelligence: 5, wisdom: 4 },
    levelRequired: 15,
    sprite: { path: '/assets/equipment/rings/ring_focus.png' },
    unlockMethod: 'default',
    unlockDescription: 'Available at level 15',
  },

  ring_warrior_signet: {
    id: 'ring_warrior_signet',
    name: 'Warrior Signet',
    slot: 'ring',
    rarity: 'epic',
    description: 'Signet of a legendary warrior',
    stats: { strength: 8, vitality: 5, defense: 3 },
    levelRequired: 25,
    sprite: { path: '/assets/equipment/rings/warrior_signet.png' },
    unlockMethod: 'default',
    unlockDescription: 'Available at level 25',
  },

  ring_scholar: {
    id: 'ring_scholar',
    name: 'Scholar Ring',
    slot: 'ring',
    rarity: 'epic',
    description: 'Worn by great scholars',
    stats: { intelligence: 8, wisdom: 6 },
    levelRequired: 25,
    sprite: { path: '/assets/equipment/rings/scholar_ring.png' },
    unlockMethod: 'default',
    unlockDescription: 'Available at level 25',
  },

  ring_power: {
    id: 'ring_power',
    name: 'Ring of Power',
    slot: 'ring',
    rarity: 'legendary',
    description: 'Radiates immense power',
    stats: { strength: 10, vitality: 8, defense: 5 },
    levelRequired: 35,
    sprite: { path: '/assets/equipment/rings/power_ring.png' },
    effects: [{ type: 'glow', color: '#ff6600' }],
    unlockMethod: 'default',
    unlockDescription: 'Available at level 35',
  },

  ring_immortal: {
    id: 'ring_immortal',
    name: 'Immortal Ring',
    slot: 'ring',
    rarity: 'legendary',
    description: 'Grants near immortality',
    stats: { vitality: 15, defense: 8, wisdom: 5 },
    levelRequired: 40,
    sprite: { path: '/assets/equipment/rings/immortal_ring.png' },
    effects: [{ type: 'glow', color: '#88ffff' }],
    unlockMethod: 'default',
    unlockDescription: 'Available at level 40',
  },

  ring_one: {
    id: 'ring_one',
    name: 'The One Ring',
    slot: 'ring',
    rarity: 'legendary',
    description: 'One ring to rule them all',
    stats: { strength: 12, intelligence: 12, wisdom: 10 },
    levelRequired: 50,
    sprite: { path: '/assets/equipment/rings/one_ring.png' },
    effects: [{ type: 'glow', color: '#ffcc00' }],
    unlockMethod: 'default',
    unlockDescription: 'Available at level 50',
  },

  // ========================================
  // AMULETS - 10 items (do not render on avatar)
  // ========================================

  amulet_wooden_charm: {
    id: 'amulet_wooden_charm',
    name: 'Wooden Charm',
    slot: 'amulet',
    rarity: 'common',
    description: 'A simple protective charm',
    stats: { vitality: 2 },
    levelRequired: 2,
    sprite: { path: '/assets/equipment/amulets/wooden_charm.png' },
    unlockMethod: 'level',
    unlockRequirement: { level: 2 },
    unlockDescription: 'Reach level 2',
  },

  amulet_stone_pendant: {
    id: 'amulet_stone_pendant',
    name: 'Stone Pendant',
    slot: 'amulet',
    rarity: 'common',
    description: 'A sturdy stone pendant',
    stats: { defense: 2, vitality: 1 },
    levelRequired: 3,
    sprite: { path: '/assets/equipment/amulets/stone_pendant.png' },
    unlockMethod: 'default',
    unlockDescription: 'Starting equipment',
  },

  amulet_strength: {
    id: 'amulet_strength',
    name: 'Amulet of Strength',
    slot: 'amulet',
    rarity: 'uncommon',
    description: 'Empowers the wearer',
    stats: { strength: 5, vitality: 3 },
    levelRequired: 8,
    sprite: { path: '/assets/equipment/amulets/strength_amulet.png' },
    unlockMethod: 'default',
    unlockDescription: 'Available at level 8',
  },

  amulet_mind: {
    id: 'amulet_mind',
    name: 'Amulet of the Mind',
    slot: 'amulet',
    rarity: 'uncommon',
    description: 'Expands mental capacity',
    stats: { intelligence: 5, wisdom: 3 },
    levelRequired: 8,
    sprite: { path: '/assets/equipment/amulets/mind_amulet.png' },
    unlockMethod: 'default',
    unlockDescription: 'Available at level 8',
  },

  amulet_vitality: {
    id: 'amulet_vitality',
    name: 'Amulet of Vitality',
    slot: 'amulet',
    rarity: 'rare',
    description: 'Overflows with life force',
    stats: { vitality: 8, defense: 4 },
    levelRequired: 15,
    sprite: { path: '/assets/equipment/amulets/amulet_vitality.png' },
    unlockMethod: 'default',
    unlockDescription: 'Available at level 15',
  },

  amulet_guardian: {
    id: 'amulet_guardian',
    name: 'Guardian Pendant',
    slot: 'amulet',
    rarity: 'rare',
    description: 'Protection of the guardians',
    stats: { defense: 6, vitality: 5 },
    levelRequired: 15,
    sprite: { path: '/assets/equipment/amulets/guardian_pendant.png' },
    unlockMethod: 'default',
    unlockDescription: 'Available at level 15',
  },

  amulet_dragon_tooth: {
    id: 'amulet_dragon_tooth',
    name: 'Dragon Tooth Amulet',
    slot: 'amulet',
    rarity: 'epic',
    description: 'Carved from a dragon fang',
    stats: { strength: 10, vitality: 6, defense: 4 },
    levelRequired: 25,
    sprite: { path: '/assets/equipment/amulets/dragon_tooth.png' },
    unlockMethod: 'default',
    unlockDescription: 'Available at level 25',
  },

  amulet_arcane: {
    id: 'amulet_arcane',
    name: 'Arcane Medallion',
    slot: 'amulet',
    rarity: 'epic',
    description: 'Channels arcane energies',
    stats: { intelligence: 10, wisdom: 8 },
    levelRequired: 25,
    sprite: { path: '/assets/equipment/amulets/arcane_medallion.png' },
    unlockMethod: 'default',
    unlockDescription: 'Available at level 25',
  },

  amulet_phoenix_heart: {
    id: 'amulet_phoenix_heart',
    name: 'Phoenix Heart',
    slot: 'amulet',
    rarity: 'legendary',
    description: 'Contains phoenix essence',
    stats: { vitality: 12, wisdom: 8, strength: 5 },
    levelRequired: 35,
    sprite: { path: '/assets/equipment/amulets/phoenix_heart.png' },
    effects: [{ type: 'glow', color: '#ff6600' }],
    unlockMethod: 'default',
    unlockDescription: 'Available at level 35',
  },

  amulet_celestial: {
    id: 'amulet_celestial',
    name: 'Celestial Medallion',
    slot: 'amulet',
    rarity: 'legendary',
    description: 'Blessed by celestial beings',
    stats: { wisdom: 12, intelligence: 10, vitality: 5 },
    levelRequired: 40,
    sprite: { path: '/assets/equipment/amulets/celestial_medallion.png' },
    effects: [{ type: 'glow', color: '#aaccff' }],
    unlockMethod: 'default',
    unlockDescription: 'Available at level 40',
  },

  amulet_infinity: {
    id: 'amulet_infinity',
    name: 'Infinity Amulet',
    slot: 'amulet',
    rarity: 'legendary',
    description: 'Power beyond measure',
    stats: { strength: 10, intelligence: 10, vitality: 10, wisdom: 10 },
    levelRequired: 50,
    sprite: { path: '/assets/equipment/amulets/infinity_amulet.png' },
    effects: [{ type: 'glow', color: '#ff00ff' }],
    unlockMethod: 'default',
    unlockDescription: 'Available at level 50',
  },

  // ========================================
  // ADDITIONAL WEAPONS (from bazaar)
  // ========================================

  weapon_sword_novice: {
    id: 'weapon_sword_novice',
    name: 'Novice Sword',
    slot: 'mainHand',
    rarity: 'common',
    description: 'A basic sword for beginners',
    stats: { strength: 2 },
    levelRequired: 2,
    sprite: { path: '/assets/equipment/weapons/sword_novice.png' },
    weaponType: 'sword',
    unlockMethod: 'level',
    unlockRequirement: { level: 2 },
    unlockDescription: 'Reach level 2',
  },

  weapon_sword_iron: {
    id: 'weapon_sword_iron',
    name: 'Iron Blade',
    slot: 'mainHand',
    rarity: 'uncommon',
    description: 'A reliable iron sword',
    stats: { strength: 4, defense: 1 },
    levelRequired: 5,
    sprite: { path: '/assets/equipment/weapons/sword_iron.png' },
    weaponType: 'sword',
    unlockMethod: 'default',
    unlockDescription: 'Available at level 5',
  },

  weapon_sword_crystal: {
    id: 'weapon_sword_crystal',
    name: 'Crystal Sword',
    slot: 'mainHand',
    rarity: 'rare',
    description: 'A blade of pure crystal',
    stats: { strength: 5, intelligence: 3 },
    levelRequired: 15,
    sprite: { path: '/assets/equipment/weapons/sword_crystal.png' },
    weaponType: 'sword',
    unlockMethod: 'default',
    unlockDescription: 'Available at level 15',
  },

  weapon_sword_void: {
    id: 'weapon_sword_void',
    name: 'Void Blade',
    slot: 'mainHand',
    rarity: 'epic',
    description: 'A sword touched by the void',
    stats: { strength: 8, intelligence: 5 },
    levelRequired: 25,
    sprite: { path: '/assets/equipment/weapons/sword_void.png' },
    weaponType: 'sword',
    effects: [{ type: 'particle', name: 'shadow', color: '#8800ff' }],
    unlockMethod: 'default',
    unlockDescription: 'Available at level 25',
  },

  weapon_sword_celestial: {
    id: 'weapon_sword_celestial',
    name: 'Celestial Blade',
    slot: 'mainHand',
    rarity: 'legendary',
    description: 'A blade blessed by the stars',
    stats: { strength: 12, wisdom: 8, vitality: 4 },
    levelRequired: 35,
    sprite: { path: '/assets/equipment/weapons/sword_celestial.png' },
    weaponType: 'sword',
    effects: [{ type: 'particle', name: 'star', color: '#88ccff' }],
    unlockMethod: 'default',
    unlockDescription: 'Available at level 35',
  },

  weapon_scholars_tome: {
    id: 'weapon_scholars_tome',
    name: "Scholar's Tome",
    slot: 'mainHand',
    rarity: 'rare',
    description: 'A magical floating spell book',
    stats: { intelligence: 6, wisdom: 4 },
    levelRequired: 12,
    sprite: { path: '/assets/equipment/weapons/scholars_tome.png' },
    weaponType: 'tome',
    ability: 'meteor',
    unlockMethod: 'default',
    unlockDescription: 'Available at level 12',
  },

  weapon_quill_of_wisdom: {
    id: 'weapon_quill_of_wisdom',
    name: 'Quill of Wisdom',
    slot: 'mainHand',
    rarity: 'rare',
    description: 'An enchanted writing quill',
    stats: { wisdom: 6, intelligence: 3 },
    levelRequired: 12,
    sprite: { path: '/assets/equipment/weapons/quill_of_wisdom.png' },
    weaponType: 'dagger',
    ability: 'shadow_strike',
    unlockMethod: 'default',
    unlockDescription: 'Available at level 12',
  },

  weapon_crystal_wand: {
    id: 'weapon_crystal_wand',
    name: 'Crystal Wand',
    slot: 'mainHand',
    rarity: 'rare',
    description: 'A wand with a crystal tip',
    stats: { intelligence: 5, wisdom: 4 },
    levelRequired: 10,
    sprite: { path: '/assets/equipment/weapons/crystal_wand.png' },
    weaponType: 'wand',
    ability: 'chain_lightning',
    unlockMethod: 'default',
    unlockDescription: 'Available at level 10',
  },

  weapon_taskmaster_hammer: {
    id: 'weapon_taskmaster_hammer',
    name: "Taskmaster's Hammer",
    slot: 'mainHand',
    rarity: 'epic',
    description: 'A hammer for getting things done',
    stats: { strength: 7, vitality: 4 },
    levelRequired: 20,
    sprite: { path: '/assets/equipment/weapons/taskmaster_hammer.png' },
    weaponType: 'hammer',
    ability: 'earthshatter',
    unlockMethod: 'default',
    unlockDescription: 'Available at level 20',
  },

  weapon_focus_blade: {
    id: 'weapon_focus_blade',
    name: 'Focus Blade',
    slot: 'mainHand',
    rarity: 'epic',
    description: 'A blade of precision and focus',
    stats: { strength: 6, intelligence: 4, wisdom: 2 },
    levelRequired: 18,
    sprite: { path: '/assets/equipment/weapons/focus_blade.png' },
    weaponType: 'dagger',
    ability: 'blade_dance',
    unlockMethod: 'default',
    unlockDescription: 'Available at level 18',
  },

  // ========================================
  // ADDITIONAL CHESTS (from bazaar)
  // ========================================

  chest_armor_leather: {
    id: 'chest_armor_leather',
    name: 'Leather Armour',
    slot: 'chest',
    rarity: 'common',
    description: 'Basic leather protection',
    stats: { defense: 2, vitality: 1 },
    levelRequired: 3,
    sprite: { path: '/assets/equipment/chests/armor_leather.png' },
    unlockMethod: 'level',
    unlockRequirement: { level: 3 },
    unlockDescription: 'Reach level 3',
  },

  chest_armor_chainmail: {
    id: 'chest_armor_chainmail',
    name: 'Chainmail Armour',
    slot: 'chest',
    rarity: 'uncommon',
    description: 'Interlocking metal rings',
    stats: { defense: 5, vitality: 2 },
    levelRequired: 8,
    sprite: { path: '/assets/equipment/chests/armor_chainmail.png' },
    unlockMethod: 'default',
    unlockDescription: 'Available at level 8',
  },

  chest_armor_plate: {
    id: 'chest_armor_plate',
    name: 'Plate Armour',
    slot: 'chest',
    rarity: 'rare',
    description: 'Heavy plate protection',
    stats: { defense: 10, vitality: 4, strength: 2 },
    levelRequired: 15,
    sprite: { path: '/assets/equipment/chests/armor_plate.png' },
    unlockMethod: 'default',
    unlockDescription: 'Available at level 15',
  },

  chest_armor_cosmic: {
    id: 'chest_armor_cosmic',
    name: 'Cosmic Armour',
    slot: 'chest',
    rarity: 'legendary',
    description: 'Armour infused with cosmic energy',
    stats: { defense: 15, vitality: 8, intelligence: 5, wisdom: 5 },
    levelRequired: 35,
    sprite: { path: '/assets/equipment/chests/armor_cosmic.png' },
    effects: [{ type: 'particle', name: 'cosmic', color: '#aa00ff' }],
    unlockMethod: 'default',
    unlockDescription: 'Available at level 35',
  },

  // ========================================
  // ADDITIONAL SHIELDS
  // ========================================

  shield_aegis_of_mastery: {
    id: 'shield_aegis_of_mastery',
    name: 'Aegis of Mastery',
    slot: 'offHand',
    rarity: 'legendary',
    description: 'The ultimate shield of mastery',
    stats: { defense: 15, vitality: 8, wisdom: 5 },
    levelRequired: 40,
    sprite: { path: '/assets/equipment/shields/aegis_of_mastery.png' },
    effects: [{ type: 'particle', name: 'divine', color: '#ffd700' }],
    unlockMethod: 'default',
    unlockDescription: 'Available at level 40',
  },

  shield_phoenix_wing: {
    id: 'shield_phoenix_wing',
    name: 'Phoenix Wing Shield',
    slot: 'offHand',
    rarity: 'legendary',
    description: 'A shield shaped like a phoenix wing',
    stats: { defense: 12, vitality: 10, wisdom: 5 },
    levelRequired: 35,
    sprite: { path: '/assets/equipment/shields/phoenix_wing_shield.png' },
    effects: [{ type: 'particle', name: 'flame', color: '#ffaa00' }],
    unlockMethod: 'default',
    unlockDescription: 'Available at level 35',
  },

  // ========================================
  // ADDITIONAL CAPES
  // ========================================

  cape_cloak_shadows: {
    id: 'cape_cloak_shadows',
    name: 'Cloak of Shadows',
    slot: 'cape',
    rarity: 'epic',
    description: 'A cloak woven from shadows',
    stats: { wisdom: 6, intelligence: 4 },
    levelRequired: 20,
    sprite: { path: '/assets/equipment/capes/cloak_shadows.png' },
    unlockMethod: 'default',
    unlockDescription: 'Available at level 20',
  },

  cape_storyteller: {
    id: 'cape_storyteller',
    name: "Storyteller's Cloak",
    slot: 'cape',
    rarity: 'rare',
    description: 'A cloak worn by master storytellers',
    stats: { wisdom: 5, intelligence: 3 },
    levelRequired: 12,
    sprite: { path: '/assets/equipment/capes/storyteller_cloak.png' },
    unlockMethod: 'default',
    unlockDescription: 'Available at level 12',
  },

  cape_memory_mantle: {
    id: 'cape_memory_mantle',
    name: 'Memory Mantle',
    slot: 'cape',
    rarity: 'epic',
    description: 'A mantle that preserves memories',
    stats: { wisdom: 7, intelligence: 5 },
    levelRequired: 22,
    sprite: { path: '/assets/equipment/capes/memory_mantle.png' },
    unlockMethod: 'default',
    unlockDescription: 'Available at level 22',
  },
};

// Equipment Sets Configuration
export const EQUIPMENT_SETS = {
  dragon_knight: {
    name: 'Dragon Knight',
    description: 'Armor forged from dragon scales and enchanted with ancient fire magic',
    pieces: ['helmet_dragon', 'chest_dragon', 'weapon_dragon_blade'],
    bonuses: {
      2: {
        name: '2-Piece: Dragonfire',
        effects: [
          { type: 'stat', stat: 'strength', value: 5 },
          { type: 'stat', stat: 'vitality', value: 5 },
        ],
      },
      3: {
        name: '3-Piece: Dragon Soul',
        effects: [
          { type: 'stat', stat: 'strength', value: 10 },
          { type: 'stat', stat: 'vitality', value: 10 },
          { type: 'stat', stat: 'defense', value: 8 },
          { type: 'ability', name: 'dragon_aura', description: 'Fire aura that intimidates enemies' },
        ],
      },
    },
    theme: 'fire',
    color: '#ff4400',
  },

  phoenix_warrior: {
    name: 'Phoenix Warrior',
    description: 'Equipment blessed by the eternal phoenix, granting rebirth and power',
    pieces: ['helmet_phoenix_crown', 'chest_phoenix', 'cape_phoenix'],
    bonuses: {
      2: {
        name: '2-Piece: Phoenix Flame',
        effects: [
          { type: 'stat', stat: 'vitality', value: 8 },
          { type: 'stat', stat: 'wisdom', value: 5 },
        ],
      },
      3: {
        name: '3-Piece: Rebirth',
        effects: [
          { type: 'stat', stat: 'vitality', value: 15 },
          { type: 'stat', stat: 'wisdom', value: 10 },
          { type: 'ability', name: 'rebirth', description: 'Recover faster from setbacks' },
        ],
      },
    },
    theme: 'fire',
    color: '#ffaa00',
  },

  scholar: {
    name: 'Scholar',
    description: 'Equipment of the learned, enhancing wisdom and knowledge',
    pieces: ['helmet_scholar_circlet', 'cape_sage'],
    bonuses: {
      2: {
        name: '2-Piece: Wisdom',
        effects: [
          { type: 'stat', stat: 'intelligence', value: 5 },
          { type: 'stat', stat: 'wisdom', value: 5 },
        ],
      },
      3: {
        name: '3-Piece: Enlightenment',
        effects: [
          { type: 'stat', stat: 'intelligence', value: 10 },
          { type: 'stat', stat: 'wisdom', value: 10 },
          { type: 'ability', name: 'quick_learner', description: 'Learn skills faster' },
        ],
      },
    },
    theme: 'arcane',
    color: '#3b82f6',
  },
};

// Helper Functions
export function calculateEquipmentStats(equippedItems) {
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
        if (stats[stat] !== undefined) {
          stats[stat] += value;
        }
      });
    }
  });

  return stats;
}

export function calculateSetBonuses(equippedItems) {
  const setBonuses = [];

  Object.entries(EQUIPMENT_SETS).forEach(([setId, setData]) => {
    const equippedPieces = setData.pieces.filter(piece => equippedItems.includes(piece));
    const pieceCount = equippedPieces.length;

    if (pieceCount >= 2) {
      const activeBonus = setData.bonuses[pieceCount];
      if (activeBonus) {
        setBonuses.push({
          setName: setData.name,
          pieceCount,
          bonus: activeBonus,
          theme: setData.theme,
          color: setData.color,
        });
      }
    }
  });

  return setBonuses;
}

export function getEquipmentBySlot(slot) {
  return Object.values(EQUIPMENT_DATABASE).filter(item => item.slot === slot);
}

export function getEquipmentByRarity(rarity) {
  return Object.values(EQUIPMENT_DATABASE).filter(item => item.rarity === rarity);
}

export function getEquipmentByModule(module) {
  return Object.values(EQUIPMENT_DATABASE).filter(
    item => item.unlockRequirement?.module === module
  );
}

export function getUnlockedEquipment(userProgress) {
  return Object.values(EQUIPMENT_DATABASE).filter(item => {
    if (item.unlockMethod === 'default') return true;
    if (item.unlockMethod === 'level') {
      return userProgress.level >= item.unlockRequirement.level;
    }
    if (item.unlockMethod === 'module') {
      const { module, metric, value } = item.unlockRequirement;
      return (userProgress.modules?.[module]?.[metric] || 0) >= value;
    }
    if (item.unlockMethod === 'achievement') {
      return userProgress.achievements?.includes(item.unlockRequirement.achievementId);
    }
    return false;
  });
}

/**
 * Get weapon with enriched ability display information
 * @param {string} weaponId - The weapon ID to look up
 * @returns {Object|null} - Weapon with abilityName and abilityDescription added
 */
export function getWeaponWithAbility(weaponId) {
  const weapon = EQUIPMENT_DATABASE[weaponId];
  if (!weapon) return null;

  // Only weapons have abilities
  if (!weapon.ability) return weapon;

  const ability = ABILITY_TYPES[weapon.ability];
  if (!ability) return weapon;

  return {
    ...weapon,
    abilityName: ability.name,
    abilityDescription: ability.description,
    abilityDamage: ability.damage,
    abilityCooldown: ability.cooldown,
    abilityColor: ability.color,
    isMagicAbility: ability.isMagic || false,
  };
}

/**
 * Get all weapons with their ability information
 * @returns {Object[]} - Array of weapons with ability display info
 */
export function getAllWeaponsWithAbilities() {
  return Object.values(EQUIPMENT_DATABASE)
    .filter(item => item.slot === 'mainHand' && item.ability)
    .map(weapon => getWeaponWithAbility(weapon.id));
}

/**
 * Check if a weapon ability is unlocked based on skill tree perks
 * @param {string} abilityId - The ability ID to check
 * @param {string[]} unlockedPerks - Array of unlocked perk IDs
 * @returns {boolean} - Whether the ability is unlocked
 */
export function isAbilityUnlocked(abilityId, unlockedPerks = []) {
  // Ability unlock perk IDs follow pattern: unlock_ability_{abilityId}
  const unlockPerkId = `unlock_ability_${abilityId}`;
  return unlockedPerks.includes(unlockPerkId);
}

/**
 * Get the perk required to unlock a specific ability
 * @param {string} abilityId - The ability ID
 * @returns {string} - The perk ID that unlocks this ability
 */
export function getAbilityUnlockPerk(abilityId) {
  return `unlock_ability_${abilityId}`;
}
