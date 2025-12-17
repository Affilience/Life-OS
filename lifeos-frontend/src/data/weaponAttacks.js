/**
 * Weapon Attack System
 * Defines attack characteristics for each weapon type
 *
 * Each weapon type has:
 * - cooldown: Time between attacks (ms)
 * - damageMultiplier: Multiplies base damage
 * - attackName: Name displayed during attack
 * - animation: Visual effect type
 * - color: Effect color
 * - sound: Sound effect type
 * - critChance: Chance for critical hit (0-1)
 * - critMultiplier: Damage multiplier on crit
 */

export const WEAPON_ATTACKS = {
  // Swords - Balanced, reliable
  sword: {
    id: 'sword',
    name: 'Sword',
    cooldown: 600, // 0.6 seconds
    damageMultiplier: 1.0,
    attackName: 'Slash',
    animation: 'slash',
    color: '#ffffff',
    trailColor: '#88aaff',
    sound: 'slash',
    critChance: 0.1,
    critMultiplier: 1.5,
    description: 'A balanced strike with your blade',
    icon: 'Sword',
    particleCount: 3,
  },

  // Daggers - Quick, low damage, high crit
  dagger: {
    id: 'dagger',
    name: 'Dagger',
    cooldown: 350, // 0.35 seconds - very fast
    damageMultiplier: 0.6,
    attackName: 'Stab',
    animation: 'stab',
    color: '#aaffaa',
    trailColor: '#44ff44',
    sound: 'stab',
    critChance: 0.25, // High crit chance
    critMultiplier: 2.0, // Big crits
    description: 'A lightning-fast stab',
    icon: 'Scissors',
    particleCount: 2,
  },

  // Axes - Slow, heavy damage
  axe: {
    id: 'axe',
    name: 'Axe',
    cooldown: 1200, // 1.2 seconds - slow
    damageMultiplier: 1.8,
    attackName: 'Cleave',
    animation: 'cleave',
    color: '#ff6644',
    trailColor: '#ff4400',
    sound: 'heavy_hit',
    critChance: 0.15,
    critMultiplier: 1.75,
    description: 'A devastating cleaving blow',
    icon: 'Axe',
    particleCount: 5,
  },

  // Hammers - Very slow, massive damage
  hammer: {
    id: 'hammer',
    name: 'Hammer',
    cooldown: 1500, // 1.5 seconds - very slow
    damageMultiplier: 2.2,
    attackName: 'Smash',
    animation: 'smash',
    color: '#ffaa00',
    trailColor: '#ff8800',
    sound: 'smash',
    critChance: 0.2,
    critMultiplier: 1.5,
    description: 'A crushing hammer blow',
    icon: 'Hammer',
    particleCount: 8,
    screenShake: true,
  },

  // Staffs - Medium speed, magic damage
  staff: {
    id: 'staff',
    name: 'Staff',
    cooldown: 800, // 0.8 seconds
    damageMultiplier: 1.1,
    attackName: 'Arcane Blast',
    animation: 'magic_burst',
    color: '#aa44ff',
    trailColor: '#8800ff',
    sound: 'magic',
    critChance: 0.12,
    critMultiplier: 1.6,
    description: 'A burst of arcane energy',
    icon: 'Wand2',
    particleCount: 6,
    isMagic: true,
  },

  // Wands - Fast magic attacks
  wand: {
    id: 'wand',
    name: 'Wand',
    cooldown: 450, // 0.45 seconds - fast magic
    damageMultiplier: 0.7,
    attackName: 'Magic Bolt',
    animation: 'magic_bolt',
    color: '#44aaff',
    trailColor: '#0088ff',
    sound: 'zap',
    critChance: 0.15,
    critMultiplier: 1.8,
    description: 'A quick magical bolt',
    icon: 'Sparkles',
    particleCount: 4,
    isMagic: true,
  },

  // Scepters - Medium magic with dark energy
  scepter: {
    id: 'scepter',
    name: 'Scepter',
    cooldown: 700, // 0.7 seconds
    damageMultiplier: 0.95,
    attackName: 'Dark Pulse',
    animation: 'dark_pulse',
    color: '#8844ff',
    trailColor: '#6600aa',
    sound: 'dark_magic',
    critChance: 0.18,
    critMultiplier: 1.7,
    description: 'A pulse of dark energy',
    icon: 'Sparkle',
    particleCount: 5,
    isMagic: true,
  },

  // Tome - Spell casting
  tome: {
    id: 'tome',
    name: 'Tome',
    cooldown: 1000, // 1 second - channeled spell
    damageMultiplier: 1.4,
    attackName: 'Spell Cast',
    animation: 'spell_cast',
    color: '#ffcc00',
    trailColor: '#ffaa00',
    sound: 'spell',
    critChance: 0.1,
    critMultiplier: 2.0, // Big spell crits
    description: 'Cast a powerful spell',
    icon: 'BookOpen',
    particleCount: 7,
    isMagic: true,
  },

  // Default/Unarmed - Basic punch
  unarmed: {
    id: 'unarmed',
    name: 'Fists',
    cooldown: 500, // 0.5 seconds
    damageMultiplier: 0.5,
    attackName: 'Punch',
    animation: 'punch',
    color: '#ffddaa',
    trailColor: '#ffcc88',
    sound: 'punch',
    critChance: 0.08,
    critMultiplier: 1.5,
    description: 'A basic punch',
    icon: 'Hand',
    particleCount: 2,
  },
};

// Get weapon attack data based on equipped weapon
export function getWeaponAttack(equippedWeapon, equipmentDatabase) {
  if (!equippedWeapon) {
    return WEAPON_ATTACKS.unarmed;
  }

  const weapon = equipmentDatabase[equippedWeapon];
  if (!weapon) {
    return WEAPON_ATTACKS.unarmed;
  }

  const weaponType = weapon.weaponType || 'sword';
  return WEAPON_ATTACKS[weaponType] || WEAPON_ATTACKS.sword;
}

// Calculate actual damage for an attack
export function calculateAttackDamage(baseDamage, weaponAttack, isCrit = false) {
  let damage = baseDamage * weaponAttack.damageMultiplier;

  if (isCrit) {
    damage *= weaponAttack.critMultiplier;
  }

  return Math.floor(damage);
}

// Check if attack is a critical hit
export function rollCritical(weaponAttack) {
  return Math.random() < weaponAttack.critChance;
}

// Animation configurations for each attack type
export const ATTACK_ANIMATIONS = {
  slash: {
    duration: 300,
    keyframes: [
      { rotate: -45, scale: 1.2, opacity: 1 },
      { rotate: 45, scale: 1, opacity: 0 },
    ],
    trail: true,
  },
  stab: {
    duration: 200,
    keyframes: [
      { translateX: 0, scale: 1, opacity: 1 },
      { translateX: 30, scale: 0.8, opacity: 0 },
    ],
    trail: false,
  },
  cleave: {
    duration: 400,
    keyframes: [
      { rotate: -90, scale: 1.5, opacity: 1 },
      { rotate: 90, scale: 1.2, opacity: 0 },
    ],
    trail: true,
    screenShake: true,
  },
  smash: {
    duration: 500,
    keyframes: [
      { translateY: -50, scale: 1.8, opacity: 1 },
      { translateY: 20, scale: 1, opacity: 0 },
    ],
    trail: true,
    screenShake: true,
    impact: true,
  },
  magic_burst: {
    duration: 350,
    keyframes: [
      { scale: 0.5, opacity: 0 },
      { scale: 2, opacity: 1 },
      { scale: 2.5, opacity: 0 },
    ],
    radial: true,
  },
  magic_bolt: {
    duration: 250,
    keyframes: [
      { translateX: 0, scale: 1, opacity: 1 },
      { translateX: 100, scale: 0.5, opacity: 0 },
    ],
    projectile: true,
  },
  dark_pulse: {
    duration: 400,
    keyframes: [
      { scale: 0.3, opacity: 0 },
      { scale: 1.5, opacity: 1 },
      { scale: 2, opacity: 0 },
    ],
    radial: true,
    dark: true,
  },
  spell_cast: {
    duration: 450,
    keyframes: [
      { rotate: 0, scale: 1, opacity: 0.5 },
      { rotate: 360, scale: 1.5, opacity: 1 },
      { rotate: 720, scale: 0.5, opacity: 0 },
    ],
    spiral: true,
  },
  punch: {
    duration: 200,
    keyframes: [
      { translateX: 0, scale: 1, opacity: 1 },
      { translateX: 20, scale: 1.2, opacity: 0 },
    ],
    trail: false,
  },
};

export default WEAPON_ATTACKS;
