/**
 * PVP Battle Calculations
 *
 * Core formulas for damage, defense, HP, and power rating
 */

// === DAMAGE CALCULATION ===

/**
 * Calculate daily damage output
 * Daily Damage = (Base Damage + Stat Bonus + Equipment Bonus) × Pet Multiplier × Streak Bonus
 */
export function calculateDailyDamage({
  tasksCompleted,
  stats = {},
  equipmentBonus = 0,
  petMultiplier = 1.0,
  streakDays = 0,
  criticalHit = false,
}) {
  // Base damage from tasks
  const baseDamage = tasksCompleted * 10;

  // Stat bonus: STR × 2 + INT × 1.5
  const strength = stats.strength || 0;
  const intelligence = stats.intelligence || 0;
  const statBonus = Math.floor((strength * 2) + (intelligence * 1.5));

  // Streak bonus: 1.0 + (days × 0.05), max 1.5
  const streakMultiplier = Math.min(1.5, 1.0 + (streakDays * 0.05));

  // Calculate total
  let totalDamage = (baseDamage + statBonus + equipmentBonus) * petMultiplier * streakMultiplier;

  // Critical hit: 1.5× damage
  if (criticalHit) {
    totalDamage *= 1.5;
  }

  return {
    baseDamage,
    statBonus,
    equipmentBonus,
    petMultiplier,
    streakMultiplier,
    criticalHit,
    totalDamage: Math.floor(totalDamage),
  };
}

// === DEFENSE CALCULATION ===

/**
 * Calculate damage reduction from defense
 * Defense Reduction = 1 - (Defense / (Defense + 100))
 */
export function calculateDefenseReduction(defense = 0) {
  const reduction = defense / (defense + 100);
  return {
    defense,
    reductionPercent: Math.floor(reduction * 100),
    multiplier: 1 - reduction,
  };
}

/**
 * Apply defense to incoming damage
 */
export function applyDefense(incomingDamage, defense = 0) {
  const { multiplier } = calculateDefenseReduction(defense);
  return Math.floor(incomingDamage * multiplier);
}

// === HP CALCULATION ===

/**
 * Calculate max HP
 * Max HP = 1000 + (Vitality × 50) + (Level × 10)
 */
export function calculateMaxHP(vitality = 0, level = 1) {
  return 1000 + (vitality * 50) + (level * 10);
}

// === POWER RATING ===

/**
 * Calculate overall power rating for matchmaking/display
 */
export function calculatePowerRating({
  stats = {},
  equipment = {},
  pet = null,
  level = 1,
}) {
  // Base stats contribution
  const baseStats = (
    (stats.strength || 0) * 2 +
    (stats.intelligence || 0) * 1.5 +
    (stats.defense || 0) * 1.5 +
    (stats.vitality || 0) * 2
  );

  // Equipment contribution
  const equipBonus = calculateEquipmentTotals(equipment);
  const equipScore = (
    equipBonus.attack * 2 +
    equipBonus.defense * 1.5 +
    equipBonus.vitality * 2
  );

  // Pet contribution
  const petBonus = pet?.bonusAmount || 0;

  // Level contribution
  const levelBonus = level * 10;

  // Total power
  const totalPower = Math.floor((baseStats + equipScore + levelBonus) * (1 + petBonus / 100));

  return totalPower;
}

// === EQUIPMENT STATS ===

/**
 * Sum up stats from all equipped items
 */
export function calculateEquipmentTotals(equipment = {}) {
  const totals = {
    attack: 0,
    defense: 0,
    strength: 0,
    intelligence: 0,
    vitality: 0,
    wisdom: 0,
    critChance: 0,
  };

  const slots = ['helmet', 'chest', 'legs', 'mainHand', 'offHand', 'cape', 'ring1', 'ring2', 'amulet'];

  for (const slot of slots) {
    const item = equipment[slot];
    if (item?.stats) {
      totals.attack += item.stats.attack || 0;
      totals.defense += item.stats.defense || 0;
      totals.strength += item.stats.strength || 0;
      totals.intelligence += item.stats.intelligence || 0;
      totals.vitality += item.stats.vitality || 0;
      totals.wisdom += item.stats.wisdom || 0;
      totals.critChance += item.stats.critChance || 0;
    }
  }

  // Apply rarity bonuses
  for (const slot of slots) {
    const item = equipment[slot];
    if (item?.rarity) {
      const rarityMultiplier = getRarityMultiplier(item.rarity);
      // Rarity affects stat effectiveness
      totals.attack = Math.floor(totals.attack * rarityMultiplier);
      totals.defense = Math.floor(totals.defense * rarityMultiplier);
    }
  }

  return totals;
}

/**
 * Get stat effectiveness multiplier based on rarity
 */
export function getRarityMultiplier(rarity) {
  const multipliers = {
    common: 1.0,
    uncommon: 1.05,
    rare: 1.10,
    epic: 1.15,
    legendary: 1.25,
  };
  return multipliers[rarity] || 1.0;
}

/**
 * Get critical hit chance based on equipment rarity
 */
export function getCritChance(equipment = {}) {
  let critChance = 0;

  const slots = ['helmet', 'chest', 'legs', 'mainHand', 'offHand', 'cape', 'ring1', 'ring2', 'amulet'];

  for (const slot of slots) {
    const item = equipment[slot];
    if (item?.rarity === 'epic') critChance += 1; // 1% per epic
    if (item?.rarity === 'legendary') critChance += 2; // 2% per legendary
    if (item?.stats?.critChance) critChance += item.stats.critChance;
  }

  return Math.min(50, critChance); // Cap at 50%
}

/**
 * Roll for critical hit
 */
export function rollCritical(critChance = 0) {
  return Math.random() * 100 < critChance;
}

// === PET ABILITIES ===

export const PET_ABILITIES = {
  phoenix: {
    id: 'phoenix',
    name: 'Rebirth',
    description: 'If you would lose, restore to 50% HP instead (once per battle)',
    type: 'defensive',
    execute: (battle, user) => ({
      preventDeath: true,
      restoreHpPercent: 50,
    }),
  },
  fenrir: {
    id: 'fenrir',
    name: 'Howl',
    description: 'Reduce opponent damage by 10% for 2 days',
    type: 'debuff',
    execute: (battle, opponent) => ({
      debuff: 'intimidate',
      duration: 2,
      damageReduction: 0.1,
    }),
  },
  bahamut: {
    id: 'bahamut',
    name: 'Megaflare',
    description: 'Deal 500 true damage (ignores defense)',
    type: 'offensive',
    execute: (battle, opponent) => ({
      trueDamage: 500,
    }),
  },
  kitsune: {
    id: 'kitsune',
    name: 'Fox Fire',
    description: 'Deal 100 bonus damage that ignores defense',
    type: 'offensive',
    execute: (battle, opponent) => ({
      trueDamage: 100,
    }),
  },
  dragon_whelp: {
    id: 'dragon_whelp',
    name: 'Flame Breath',
    description: '+50% damage for 1 day',
    type: 'buff',
    execute: (battle, user) => ({
      buff: 'flame_breath',
      duration: 1,
      damageBonus: 0.5,
    }),
  },
};

/**
 * Get pet passive bonus multiplier
 */
export function getPetMultiplier(pet) {
  if (!pet) return 1.0;

  const bonusPercent = pet.bonusAmount || 0;
  return 1.0 + (bonusPercent / 100);
}

// === ELO CALCULATION ===

/**
 * Calculate ELO change after a match
 * K-factor: 32 for most players, 16 for high ELO
 */
export function calculateEloChange(winnerElo, loserElo, isDraw = false) {
  const K = winnerElo > 2000 ? 16 : 32;

  // Expected scores
  const expectedWinner = 1 / (1 + Math.pow(10, (loserElo - winnerElo) / 400));
  const expectedLoser = 1 - expectedWinner;

  if (isDraw) {
    return {
      winnerChange: Math.round(K * (0.5 - expectedWinner)),
      loserChange: Math.round(K * (0.5 - expectedLoser)),
    };
  }

  return {
    winnerChange: Math.round(K * (1 - expectedWinner)),
    loserChange: Math.round(K * (0 - expectedLoser)),
  };
}

/**
 * Get rank tier from ELO
 */
export function getRankTier(elo) {
  if (elo >= 2200) return 'champion';
  if (elo >= 1800) return 'diamond';
  if (elo >= 1500) return 'platinum';
  if (elo >= 1200) return 'gold';
  if (elo >= 900) return 'silver';
  return 'bronze';
}

/**
 * Get rank tier display info
 */
export function getRankInfo(tier) {
  const ranks = {
    bronze: { name: 'Bronze', color: '#CD7F32', icon: '🥉' },
    silver: { name: 'Silver', color: '#C0C0C0', icon: '🥈' },
    gold: { name: 'Gold', color: '#FFD700', icon: '🥇' },
    platinum: { name: 'Platinum', color: '#E5E4E2', icon: '💎' },
    diamond: { name: 'Diamond', color: '#B9F2FF', icon: '💠' },
    champion: { name: 'Champion', color: '#FF4500', icon: '👑' },
  };
  return ranks[tier] || ranks.bronze;
}

// === BATTLE REWARDS ===

/**
 * Calculate battle rewards based on type and outcome
 */
export function calculateBattleRewards(battleType, isWinner, isDraw = false, bonuses = {}) {
  const baseRewards = {
    quick: { xp: 100, credits: 25 },
    standard: { xp: 250, credits: 75 },
    ranked: { xp: 500, credits: 150 },
  };

  const base = baseRewards[battleType] || baseRewards.standard;
  let xp = base.xp;
  let credits = base.credits;

  // Outcome modifier
  if (isDraw) {
    xp = Math.floor(xp * 0.7);
    credits = Math.floor(credits * 0.65);
  } else if (!isWinner) {
    xp = Math.floor(xp * 0.5);
    credits = Math.floor(credits * 0.33);
  }

  // Apply bonuses
  if (bonuses.perfectStreak) {
    xp = Math.floor(xp * 1.5);
  }
  if (bonuses.underdog) {
    credits = Math.floor(credits * 1.25);
  }
  if (bonuses.flawlessVictory) {
    xp = Math.floor(xp * 1.25);
  }
  if (bonuses.clutchWin) {
    credits = Math.floor(credits * 1.5);
  }

  return { xp, credits };
}

// === BATTLE STATUS ===

/**
 * Determine battle winner
 */
export function determineBattleWinner(player1HP, player2HP, player1MaxHP, player2MaxHP) {
  // If either player is at 0 HP, they lose
  if (player1HP <= 0 && player2HP <= 0) {
    return { winner: null, isDraw: true };
  }
  if (player1HP <= 0) {
    return { winner: 'player2', isDraw: false };
  }
  if (player2HP <= 0) {
    return { winner: 'player1', isDraw: false };
  }

  // Compare HP percentages
  const p1Percent = player1HP / player1MaxHP;
  const p2Percent = player2HP / player2MaxHP;

  // Within 5% is a draw
  if (Math.abs(p1Percent - p2Percent) < 0.05) {
    return { winner: null, isDraw: true };
  }

  return {
    winner: p1Percent > p2Percent ? 'player1' : 'player2',
    isDraw: false,
  };
}

/**
 * Format HP bar percentage
 */
export function formatHPPercent(currentHP, maxHP) {
  return Math.max(0, Math.min(100, Math.round((currentHP / maxHP) * 100)));
}

// === EXPORTS ===

export default {
  calculateDailyDamage,
  calculateDefenseReduction,
  applyDefense,
  calculateMaxHP,
  calculatePowerRating,
  calculateEquipmentTotals,
  getRarityMultiplier,
  getCritChance,
  rollCritical,
  getPetMultiplier,
  calculateEloChange,
  getRankTier,
  getRankInfo,
  calculateBattleRewards,
  determineBattleWinner,
  formatHPPercent,
  PET_ABILITIES,
};
