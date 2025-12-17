/**
 * Boss Database
 * Contains all boss definitions for the PvE combat system
 * Bosses are tiered by player level with increasing difficulty
 */

export const BOSS_DIFFICULTY = {
  easy: { color: '#22c55e', label: 'Easy', multiplier: 1.0 },
  normal: { color: '#3b82f6', label: 'Normal', multiplier: 1.25 },
  hard: { color: '#a855f7', label: 'Hard', multiplier: 1.5 },
  epic: { color: '#f97316', label: 'Epic', multiplier: 2.0 },
  legendary: { color: '#ef4444', label: 'Legendary', multiplier: 2.5 },
};

// DEV MODE: Set to true to unlock all bosses regardless of level
const DEV_UNLOCK_ALL_BOSSES = true;

export const BOSS_DATABASE = {
  shadow_slime: {
    id: 'shadow_slime',
    name: 'Shadow Slime',
    levelRange: [1, 5],
    difficulty: 'easy',
    health: 500,
    damage: 8,
    attackSpeed: 800,
    xpReward: 100,
    creditsReward: 50,
    sprite: '/assets/bosses/boss_shadow_slime.png',
    description: 'A dark gelatinous creature from the shadows',
    lore: 'Born from accumulated negativity, this slime feeds on procrastination and doubt.',
    attackAnimation: 'bounce',
    attackName: 'Despair Glob',
    attackDescription: 'Launches a ball of condensed negativity that saps motivation',
    attackColor: '#6b21a8',
  },
  goblin_chief: {
    id: 'goblin_chief',
    name: 'Goblin Chief',
    levelRange: [6, 10],
    difficulty: 'easy',
    health: 800,
    damage: 12,
    attackSpeed: 750,
    xpReward: 200,
    creditsReward: 100,
    sprite: '/assets/bosses/boss_goblin_chief.png',
    description: 'The cunning leader of a goblin tribe',
    lore: 'This crafty chief has united the goblins of distraction under his crude crown.',
    attackAnimation: 'stab',
    attackName: 'Distraction Dagger',
    attackDescription: 'A sneaky strike that interrupts focus and breaks concentration',
    attackColor: '#84cc16',
  },
  skeleton_knight: {
    id: 'skeleton_knight',
    name: 'Skeleton Knight',
    levelRange: [11, 15],
    difficulty: 'normal',
    health: 1200,
    damage: 18,
    attackSpeed: 700,
    xpReward: 350,
    creditsReward: 175,
    sprite: '/assets/bosses/boss_skeleton_knight.png',
    description: 'An undead warrior bound by cursed armor',
    lore: 'Once a noble knight, now cursed to guard the realm of broken promises.',
    attackAnimation: 'slash',
    attackName: 'Oath Breaker',
    attackDescription: 'A devastating slash infused with the weight of broken commitments',
    attackColor: '#94a3b8',
  },
  forest_troll: {
    id: 'forest_troll',
    name: 'Forest Troll',
    levelRange: [16, 20],
    difficulty: 'normal',
    health: 1800,
    damage: 22,
    attackSpeed: 900,
    xpReward: 500,
    creditsReward: 250,
    sprite: '/assets/bosses/boss_forest_troll.png',
    description: 'A massive troll with bark-like skin',
    lore: 'Guardian of the Forest of Excuses, this ancient troll blocks the path to progress.',
    attackAnimation: 'smash',
    attackName: 'Excuse Avalanche',
    attackDescription: 'Slams the ground, unleashing a wave of petrified excuses',
    attackColor: '#65a30d',
  },
  stone_golem: {
    id: 'stone_golem',
    name: 'Stone Golem',
    levelRange: [21, 25],
    difficulty: 'hard',
    health: 2500,
    damage: 28,
    attackSpeed: 1000,
    xpReward: 700,
    creditsReward: 350,
    sprite: '/assets/bosses/boss_stone_golem.png',
    description: 'An ancient construct powered by runes',
    lore: 'Built by forgotten mages to test those who seek self-improvement.',
    attackAnimation: 'pound',
    attackName: 'Stagnation Slam',
    attackDescription: 'A crushing blow that embodies resistance to change',
    attackColor: '#78716c',
  },
  flame_demon: {
    id: 'flame_demon',
    name: 'Flame Demon',
    levelRange: [26, 30],
    difficulty: 'hard',
    health: 3200,
    damage: 32,
    attackSpeed: 600,
    xpReward: 900,
    creditsReward: 450,
    sprite: '/assets/bosses/boss_flame_demon.png',
    description: 'A demon wreathed in eternal flames',
    lore: 'Feeds on the burning rage of abandoned goals and failed resolutions.',
    attackAnimation: 'fireball',
    attackName: 'Burnout Blaze',
    attackDescription: 'Rapid-fire flames that represent the chaos of overcommitment',
    attackColor: '#ef4444',
  },
  ice_drake: {
    id: 'ice_drake',
    name: 'Ice Drake',
    levelRange: [31, 35],
    difficulty: 'epic',
    health: 4500,
    damage: 38,
    attackSpeed: 700,
    xpReward: 1200,
    creditsReward: 600,
    sprite: '/assets/bosses/boss_ice_drake.png',
    description: 'A dragon of crystalline ice',
    lore: 'Its frozen breath represents the cold grip of comfort zones.',
    attackAnimation: 'breath',
    attackName: 'Comfort Zone Freeze',
    attackDescription: 'Chilling breath that paralyzes progress and numbs ambition',
    attackColor: '#22d3ee',
  },
  dark_wizard: {
    id: 'dark_wizard',
    name: 'Dark Wizard',
    levelRange: [36, 40],
    difficulty: 'epic',
    health: 5500,
    damage: 45,
    attackSpeed: 650,
    xpReward: 1500,
    creditsReward: 750,
    sprite: '/assets/bosses/boss_dark_wizard.png',
    description: 'A sorcerer corrupted by forbidden knowledge',
    lore: 'Master of dark arts that cloud the mind with self-doubt.',
    attackAnimation: 'spell',
    attackName: 'Imposter Hex',
    attackDescription: 'Dark magic that amplifies self-doubt and imposter syndrome',
    attackColor: '#7c3aed',
  },
  void_watcher: {
    id: 'void_watcher',
    name: 'Void Watcher',
    levelRange: [41, 45],
    difficulty: 'legendary',
    health: 7000,
    damage: 55,
    attackSpeed: 550,
    xpReward: 2000,
    creditsReward: 1000,
    sprite: '/assets/bosses/boss_void_watcher.png',
    description: 'An eldritch horror from between dimensions',
    lore: 'Sees all timelines where you gave up. Exists to ensure you don\'t.',
    attackAnimation: 'tentacle',
    attackName: 'Timeline Terror',
    attackDescription: 'Psychic tendrils showing visions of every possible failure',
    attackColor: '#1e1b4b',
  },
  dragon_lord: {
    id: 'dragon_lord',
    name: 'Dragon Lord',
    levelRange: [46, 50],
    difficulty: 'legendary',
    health: 10000,
    damage: 65,
    attackSpeed: 500,
    xpReward: 3000,
    creditsReward: 1500,
    sprite: '/assets/bosses/boss_dragon_lord.png',
    description: 'The ultimate dragon, ruler of all challenges',
    lore: 'The final test. Defeating this ancient being proves mastery over oneself.',
    attackAnimation: 'dragonfire',
    attackName: 'Destiny\'s Wrath',
    attackDescription: 'Ancient dragonfire that tests the very essence of your resolve',
    attackColor: '#fbbf24',
  },
};

// Get boss appropriate for player level
export function getBossForLevel(level) {
  const bosses = Object.values(BOSS_DATABASE);

  // Find boss whose level range contains the player level
  const appropriateBoss = bosses.find(
    boss => level >= boss.levelRange[0] && level <= boss.levelRange[1]
  );

  // If no exact match, find the closest boss
  if (!appropriateBoss) {
    if (level < 1) return bosses[0];
    if (level > 50) return bosses[bosses.length - 1];

    // Find the boss with the closest level range
    return bosses.reduce((closest, boss) => {
      const bossMiddle = (boss.levelRange[0] + boss.levelRange[1]) / 2;
      const closestMiddle = (closest.levelRange[0] + closest.levelRange[1]) / 2;
      return Math.abs(bossMiddle - level) < Math.abs(closestMiddle - level) ? boss : closest;
    });
  }

  return appropriateBoss;
}

// Get all available bosses for a player level (can fight lower level bosses)
export function getAvailableBosses(level) {
  if (DEV_UNLOCK_ALL_BOSSES) {
    return Object.values(BOSS_DATABASE);
  }
  return Object.values(BOSS_DATABASE).filter(
    boss => level >= boss.levelRange[0]
  );
}

// Check if a boss is unlocked for testing
export function isBossUnlocked(bossId, playerLevel) {
  if (DEV_UNLOCK_ALL_BOSSES) return true;
  const boss = BOSS_DATABASE[bossId];
  if (!boss) return false;
  return playerLevel >= boss.levelRange[0];
}

// Calculate player combat stats based on level, equipment, and pets
export function calculatePlayerStats(level, equippedItems = {}, activePet = null, equipmentDatabase = {}) {
  // Base stats
  let baseHealth = 100;
  let baseDamage = 10;

  // Level scaling
  const healthFromLevel = level * 10;
  const damageFromLevel = level * 2;

  // Equipment stats
  let vitality = 0;
  let defense = 0;
  let strength = 0;

  Object.values(equippedItems).forEach(itemId => {
    if (!itemId) return;
    const item = equipmentDatabase[itemId];
    if (!item?.stats) return;

    vitality += item.stats.vitality || 0;
    defense += item.stats.defense || 0;
    strength += item.stats.strength || 0;
  });

  // Pet bonuses (flat percentage)
  let petHealthBonus = 0;
  let petDamageBonus = 0;

  if (activePet) {
    // Pets give 5-15% bonus based on tier
    const tierBonuses = { common: 5, uncommon: 8, rare: 10, epic: 12, mythic: 15 };
    const bonus = tierBonuses[activePet.tier] || 5;
    petHealthBonus = bonus / 100;
    petDamageBonus = bonus / 100;
  }

  // Calculate final stats
  const healthFromStats = (vitality * 5) + (defense * 3);
  const damageFromStats = strength * 3;

  const rawHealth = baseHealth + healthFromLevel + healthFromStats;
  const rawDamage = baseDamage + damageFromLevel + damageFromStats;

  const maxHealth = Math.floor(rawHealth * (1 + petHealthBonus));
  const damage = Math.floor(rawDamage * (1 + petDamageBonus));

  return {
    maxHealth,
    damage,
    // Breakdown for UI
    breakdown: {
      baseHealth,
      healthFromLevel,
      healthFromStats,
      petHealthBonus: Math.floor(rawHealth * petHealthBonus),
      baseDamage,
      damageFromLevel,
      damageFromStats,
      petDamageBonus: Math.floor(rawDamage * petDamageBonus),
    },
  };
}

export default BOSS_DATABASE;
