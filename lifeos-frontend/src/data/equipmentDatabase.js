/**
 * Equipment Database
 * Comprehensive equipment system with rarities, stats, and visual properties
 */

// Equipment Rarity Tiers
export const EQUIPMENT_RARITY = {
  common: {
    name: 'Common',
    color: '#ffffff',
    glow: false,
    statMultiplier: 1.0,
  },
  uncommon: {
    name: 'Uncommon',
    color: '#1eff00',
    glow: false,
    statMultiplier: 1.25,
  },
  rare: {
    name: 'Rare',
    color: '#0070dd',
    glow: 'subtle',
    statMultiplier: 1.5,
  },
  epic: {
    name: 'Epic',
    color: '#a335ee',
    glow: 'medium',
    statMultiplier: 2.0,
  },
  legendary: {
    name: 'Legendary',
    color: '#ff8000',
    glow: 'strong',
    statMultiplier: 3.0,
    hasParticles: true,
  },
};

// Equipment Categories
export const EQUIPMENT_SLOTS = {
  helmet: 'Helmet',
  chest: 'Chest Armor',
  legs: 'Leg Armor',
  boots: 'Boots',
  mainHand: 'Main Hand',
  offHand: 'Off Hand',
  cape: 'Cape',
  ring1: 'Ring 1',
  ring2: 'Ring 2',
  amulet: 'Amulet',
};

// Equipment Database
export const EQUIPMENT_DATABASE = {
  // ========================================
  // HELMETS
  // ========================================

  helmet_basic: {
    id: 'helmet_basic',
    name: 'Training Helmet',
    slot: 'helmet',
    rarity: 'common',
    description: 'Basic protective headgear for beginners',
    stats: {
      defense: 2,
      vitality: 1,
    },
    levelRequired: 1,
    sprite: {
      path: '/assets/equipment/helmets/basic.png',
      frameWidth: 128,
      frameHeight: 128,
    },
    unlockedBy: 'default',
  },

  helmet_iron: {
    id: 'helmet_iron',
    name: 'Iron Helmet',
    slot: 'helmet',
    rarity: 'uncommon',
    description: 'Sturdy iron helmet forged from quality ore',
    stats: {
      defense: 5,
      vitality: 2,
    },
    levelRequired: 5,
    sprite: {
      path: '/assets/equipment/helmets/iron.png',
      frameWidth: 128,
      frameHeight: 128,
    },
    unlockedBy: {
      module: 'productivity',
      requirement: 'complete_10_tasks',
    },
  },

  helmet_dragon: {
    id: 'helmet_dragon',
    name: 'Dragon Helm',
    slot: 'helmet',
    rarity: 'legendary',
    description: 'Forged from the scales of an ancient dragon',
    stats: {
      defense: 15,
      vitality: 5,
      strength: 3,
    },
    levelRequired: 25,
    sprite: {
      path: '/assets/equipment/helmets/dragon.png',
      frameWidth: 128,
      frameHeight: 128,
    },
    effects: [
      {
        type: 'particle',
        name: 'flame_aura',
        color: '#ff4400',
      },
      {
        type: 'stat_boost',
        stat: 'fire_resistance',
        value: 50,
      },
    ],
    unlockedBy: {
      module: 'productivity',
      requirement: 'complete_500_tasks',
    },
    setBonus: {
      setName: 'dragon_knight',
      pieces: ['helmet_dragon', 'chest_dragon', 'weapon_dragon_blade'],
    },
  },

  // ========================================
  // CHEST ARMOR
  // ========================================

  chest_basic: {
    id: 'chest_basic',
    name: 'Training Vest',
    slot: 'chest',
    rarity: 'common',
    description: 'Light protective vest for daily training',
    stats: {
      defense: 3,
      vitality: 2,
    },
    levelRequired: 1,
    sprite: {
      path: '/assets/equipment/chest/basic.png',
      frameWidth: 128,
      frameHeight: 128,
    },
    unlockedBy: 'default',
  },

  chest_iron: {
    id: 'chest_iron',
    name: 'Iron Chestplate',
    slot: 'chest',
    rarity: 'uncommon',
    description: 'Heavy iron armor providing solid protection',
    stats: {
      defense: 8,
      vitality: 4,
    },
    levelRequired: 5,
    sprite: {
      path: '/assets/equipment/chest/iron.png',
      frameWidth: 128,
      frameHeight: 128,
    },
    unlockedBy: {
      module: 'fitness',
      requirement: '10_workouts_completed',
    },
  },

  chest_dragon: {
    id: 'chest_dragon',
    name: 'Dragon Scale Armor',
    slot: 'chest',
    rarity: 'legendary',
    description: 'Impenetrable armor crafted from dragon scales',
    stats: {
      defense: 20,
      vitality: 10,
      strength: 5,
    },
    levelRequired: 25,
    sprite: {
      path: '/assets/equipment/chest/dragon.png',
      frameWidth: 128,
      frameHeight: 128,
    },
    effects: [
      {
        type: 'particle',
        name: 'flame_aura',
        color: '#ff4400',
      },
    ],
    unlockedBy: {
      module: 'fitness',
      requirement: '100_workouts_completed',
    },
    setBonus: {
      setName: 'dragon_knight',
      pieces: ['helmet_dragon', 'chest_dragon', 'weapon_dragon_blade'],
    },
  },

  // ========================================
  // WEAPONS
  // ========================================

  weapon_basic_sword: {
    id: 'weapon_basic_sword',
    name: 'Training Sword',
    slot: 'mainHand',
    rarity: 'common',
    description: 'A simple blade for learning the basics',
    stats: {
      strength: 3,
      attack: 5,
    },
    levelRequired: 1,
    sprite: {
      path: '/assets/equipment/weapons/basic_sword.png',
      frameWidth: 128,
      frameHeight: 128,
    },
    weaponType: 'sword',
    unlockedBy: 'default',
  },

  weapon_iron_sword: {
    id: 'weapon_iron_sword',
    name: 'Iron Sword',
    slot: 'mainHand',
    rarity: 'uncommon',
    description: 'Well-balanced iron blade',
    stats: {
      strength: 6,
      attack: 12,
    },
    levelRequired: 5,
    sprite: {
      path: '/assets/equipment/weapons/iron_sword.png',
      frameWidth: 128,
      frameHeight: 128,
    },
    weaponType: 'sword',
    unlockedBy: {
      module: 'productivity',
      requirement: 'complete_25_tasks',
    },
  },

  weapon_dragon_blade: {
    id: 'weapon_dragon_blade',
    name: 'Dragon Blade',
    slot: 'mainHand',
    rarity: 'legendary',
    description: 'A blade infused with the essence of dragons',
    stats: {
      strength: 15,
      attack: 30,
      intelligence: 5,
    },
    levelRequired: 25,
    sprite: {
      path: '/assets/equipment/weapons/dragon_blade.png',
      frameWidth: 128,
      frameHeight: 128,
    },
    weaponType: 'sword',
    effects: [
      {
        type: 'particle',
        name: 'flame_trail',
        color: '#ff4400',
      },
      {
        type: 'damage_bonus',
        damageType: 'fire',
        value: 20,
      },
    ],
    unlockedBy: {
      module: 'productivity',
      requirement: 'complete_1000_tasks',
    },
    setBonus: {
      setName: 'dragon_knight',
      pieces: ['helmet_dragon', 'chest_dragon', 'weapon_dragon_blade'],
    },
  },

  // ========================================
  // SHIELDS
  // ========================================

  shield_basic: {
    id: 'shield_basic',
    name: 'Wooden Shield',
    slot: 'offHand',
    rarity: 'common',
    description: 'Simple wooden shield for blocking attacks',
    stats: {
      defense: 3,
      vitality: 1,
    },
    levelRequired: 1,
    sprite: {
      path: '/assets/equipment/shields/basic.png',
      frameWidth: 128,
      frameHeight: 128,
    },
    unlockedBy: 'default',
  },

  shield_iron: {
    id: 'shield_iron',
    name: 'Iron Shield',
    slot: 'offHand',
    rarity: 'uncommon',
    description: 'Reinforced iron shield',
    stats: {
      defense: 7,
      vitality: 3,
    },
    levelRequired: 5,
    sprite: {
      path: '/assets/equipment/shields/iron.png',
      frameWidth: 128,
      frameHeight: 128,
    },
    unlockedBy: {
      module: 'fitness',
      requirement: '5_workouts_completed',
    },
  },

  // ========================================
  // CAPES
  // ========================================

  cape_basic: {
    id: 'cape_basic',
    name: 'Traveler\'s Cloak',
    slot: 'cape',
    rarity: 'common',
    description: 'A simple cloak for your journey',
    stats: {
      speed: 2,
    },
    levelRequired: 1,
    sprite: {
      path: '/assets/equipment/capes/basic.png',
      frameWidth: 128,
      frameHeight: 128,
    },
    unlockedBy: 'default',
  },

  cape_shadow: {
    id: 'cape_shadow',
    name: 'Shadow Cloak',
    slot: 'cape',
    rarity: 'epic',
    description: 'A mysterious cloak that bends light',
    stats: {
      speed: 8,
      intelligence: 5,
    },
    levelRequired: 15,
    sprite: {
      path: '/assets/equipment/capes/shadow.png',
      frameWidth: 128,
      frameHeight: 128,
    },
    effects: [
      {
        type: 'visual',
        name: 'shadow_trail',
        color: '#4a0080',
      },
    ],
    unlockedBy: {
      module: 'knowledge',
      requirement: 'finish_5_books',
    },
  },

  // ========================================
  // RINGS
  // ========================================

  ring_strength: {
    id: 'ring_strength',
    name: 'Ring of Strength',
    slot: 'ring1',
    rarity: 'rare',
    description: 'Increases physical power',
    stats: {
      strength: 5,
      attack: 3,
    },
    levelRequired: 10,
    sprite: {
      path: '/assets/equipment/rings/strength.png',
      frameWidth: 32,
      frameHeight: 32,
    },
    unlockedBy: {
      module: 'fitness',
      requirement: '30_workouts_completed',
    },
  },

  ring_intelligence: {
    id: 'ring_intelligence',
    name: 'Ring of Intellect',
    slot: 'ring1',
    rarity: 'rare',
    description: 'Enhances mental acuity',
    stats: {
      intelligence: 5,
      wisdom: 3,
    },
    levelRequired: 10,
    sprite: {
      path: '/assets/equipment/rings/intelligence.png',
      frameWidth: 32,
      frameHeight: 32,
    },
    unlockedBy: {
      module: 'knowledge',
      requirement: 'finish_3_books',
    },
  },

  // ========================================
  // AMULETS
  // ========================================

  amulet_vitality: {
    id: 'amulet_vitality',
    name: 'Amulet of Life',
    slot: 'amulet',
    rarity: 'epic',
    description: 'Radiates healing energy',
    stats: {
      vitality: 10,
      defense: 5,
    },
    levelRequired: 15,
    sprite: {
      path: '/assets/equipment/amulets/vitality.png',
      frameWidth: 32,
      frameHeight: 32,
    },
    effects: [
      {
        type: 'passive',
        name: 'health_regen',
        value: 2,
      },
    ],
    unlockedBy: {
      module: 'fitness',
      requirement: '50_workouts_completed',
    },
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
        name: '2-Piece Bonus',
        effects: [
          { type: 'stat', stat: 'fire_resistance', value: 25 },
          { type: 'stat', stat: 'defense', value: 5 },
        ],
      },
      3: {
        name: '3-Piece Bonus',
        effects: [
          { type: 'stat', stat: 'fire_resistance', value: 50 },
          { type: 'stat', stat: 'defense', value: 15 },
          { type: 'stat', stat: 'attack', value: 10 },
          { type: 'ability', name: 'dragon_aura', description: 'Passive fire aura damages nearby enemies' },
        ],
      },
    },
    theme: 'fire',
    color: '#ff4400',
  },
};

// Helper function to calculate equipment stats
export function calculateEquipmentStats(equippedItems) {
  const stats = {
    defense: 0,
    strength: 0,
    vitality: 0,
    intelligence: 0,
    wisdom: 0,
    attack: 0,
    speed: 0,
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

// Helper function to check set bonuses
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
        });
      }
    }
  });

  return setBonuses;
}

// Helper function to get equipment by slot
export function getEquipmentBySlot(slot) {
  return Object.values(EQUIPMENT_DATABASE).filter(item => item.slot === slot);
}

// Helper function to get equipment by rarity
export function getEquipmentByRarity(rarity) {
  return Object.values(EQUIPMENT_DATABASE).filter(item => item.rarity === rarity);
}
