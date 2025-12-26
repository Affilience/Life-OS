/**
 * Elemental Abilities Database
 * All combat abilities organized by element with damage, cooldown, and tier stats
 *
 * Damage: Multiplier applied to base player damage (1.0 = 100% of base damage)
 * Cooldown: Milliseconds before ability can be used again
 * Tier: 1 (basic), 2 (intermediate), 3 (advanced), 4 (ultimate)
 */

export const ELEMENTAL_ABILITIES = {
  fire: {
    name: 'Fire',
    color: '#ff6600',
    gradientClass: 'from-orange-600 to-red-600',
    textColor: 'text-white',
    abilities: {
      fireball: {
        id: 'fireball',
        name: 'Fireball',
        icon: '🔥',
        element: 'fire',
        damage: 2.0,
        cooldown: 6000,
        tier: 1,
        description: 'Launch a blazing fireball at your enemy',
      },
      meteor: {
        id: 'meteor',
        name: 'Meteor',
        icon: '☄️',
        element: 'fire',
        damage: 4.0,
        cooldown: 18000,
        tier: 3,
        description: 'Call down a devastating meteor from the sky',
      },
      inferno: {
        id: 'inferno',
        name: 'Inferno',
        icon: '🌋',
        element: 'fire',
        damage: 3.0,
        cooldown: 12000,
        tier: 2,
        description: 'Unleash a raging inferno that engulfs your foe',
      },
      flame_burst: {
        id: 'flame_burst',
        name: 'Flame Burst',
        icon: '💥',
        element: 'fire',
        damage: 2.5,
        cooldown: 8000,
        tier: 2,
        description: 'Release an explosive burst of flames',
      },
      blazing_combo: {
        id: 'blazing_combo',
        name: 'Blazing Combo',
        icon: '🔥',
        element: 'fire',
        damage: 3.5,
        cooldown: 14000,
        tier: 3,
        description: 'A rapid series of fiery strikes',
      },
    },
  },

  ice: {
    name: 'Ice',
    color: '#00d4ff',
    gradientClass: 'from-cyan-500 to-blue-600',
    textColor: 'text-white',
    abilities: {
      ice_spike: {
        id: 'ice_spike',
        name: 'Ice Spike',
        icon: '🧊',
        element: 'ice',
        damage: 2.0,
        cooldown: 6000,
        tier: 1,
        description: 'Impale your enemy with a sharp ice spike',
      },
      blizzard: {
        id: 'blizzard',
        name: 'Blizzard',
        icon: '❄️',
        element: 'ice',
        damage: 3.5,
        cooldown: 15000,
        tier: 3,
        description: 'Summon a freezing blizzard',
      },
      frost_nova: {
        id: 'frost_nova',
        name: 'Frost Nova',
        icon: '💠',
        element: 'ice',
        damage: 2.5,
        cooldown: 10000,
        tier: 2,
        description: 'Release an expanding wave of frost',
      },
      ice_beam: {
        id: 'ice_beam',
        name: 'Ice Beam',
        icon: '🌊',
        element: 'ice',
        damage: 3.0,
        cooldown: 12000,
        tier: 2,
        description: 'Fire a concentrated beam of freezing energy',
      },
    },
  },

  lightning: {
    name: 'Lightning',
    color: '#ffee00',
    gradientClass: 'from-yellow-400 to-orange-500',
    textColor: 'text-black',
    abilities: {
      lightning_strike: {
        id: 'lightning_strike',
        name: 'Lightning Strike',
        icon: '⚡',
        element: 'lightning',
        damage: 2.2,
        cooldown: 5000,
        tier: 1,
        description: 'Call down a bolt of lightning',
      },
      chain_lightning: {
        id: 'chain_lightning',
        name: 'Chain Lightning',
        icon: '⛓️',
        element: 'lightning',
        damage: 2.5,
        cooldown: 8000,
        tier: 2,
        description: 'Lightning that arcs between enemies',
      },
      thunder_storm: {
        id: 'thunder_storm',
        name: 'Thunder Storm',
        icon: '🌩️',
        element: 'lightning',
        damage: 4.0,
        cooldown: 16000,
        tier: 3,
        description: 'Summon a devastating electrical storm',
      },
      static_shock: {
        id: 'static_shock',
        name: 'Static Shock',
        icon: '💫',
        element: 'lightning',
        damage: 1.8,
        cooldown: 4000,
        tier: 1,
        description: 'A quick jolt of static electricity',
      },
    },
  },

  dark: {
    name: 'Dark',
    color: '#6600cc',
    gradientClass: 'from-purple-700 to-indigo-900',
    textColor: 'text-white',
    abilities: {
      shadow_burst: {
        id: 'shadow_burst',
        name: 'Shadow Burst',
        icon: '🌑',
        element: 'dark',
        damage: 2.3,
        cooldown: 7000,
        tier: 1,
        description: 'Explode with dark energy',
      },
      black_hole: {
        id: 'black_hole',
        name: 'Black Hole',
        icon: '🕳️',
        element: 'dark',
        damage: 4.5,
        cooldown: 20000,
        tier: 3,
        description: 'Create a miniature black hole that devours all',
      },
      soul_drain: {
        id: 'soul_drain',
        name: 'Soul Drain',
        icon: '👻',
        element: 'dark',
        damage: 2.0,
        cooldown: 10000,
        tier: 2,
        description: 'Drain the life force from your enemy',
        healPercent: 0.3,
      },
      void_rift: {
        id: 'void_rift',
        name: 'Void Rift',
        icon: '🌀',
        element: 'dark',
        damage: 3.0,
        cooldown: 12000,
        tier: 2,
        description: 'Tear open a rift to the void',
      },
      dark_tendrils: {
        id: 'dark_tendrils',
        name: 'Dark Tendrils',
        icon: '🦑',
        element: 'dark',
        damage: 2.8,
        cooldown: 9000,
        tier: 2,
        description: 'Summon tendrils of darkness to ensnare your foe',
      },
    },
  },

  holy: {
    name: 'Holy',
    color: '#ffdd44',
    gradientClass: 'from-yellow-200 to-amber-300',
    textColor: 'text-black',
    abilities: {
      holy_light: {
        id: 'holy_light',
        name: 'Holy Light',
        icon: '✨',
        element: 'holy',
        damage: 2.0,
        cooldown: 6000,
        tier: 1,
        description: 'Blast your enemy with purifying light',
      },
      divine_judgment: {
        id: 'divine_judgment',
        name: 'Divine Judgment',
        icon: '👼',
        element: 'holy',
        damage: 4.0,
        cooldown: 18000,
        tier: 3,
        description: 'Pass divine judgment upon your foe',
      },
      smite: {
        id: 'smite',
        name: 'Smite',
        icon: '✝️',
        element: 'holy',
        damage: 2.5,
        cooldown: 8000,
        tier: 2,
        description: 'Strike down your enemy with holy power',
      },
      radiant_burst: {
        id: 'radiant_burst',
        name: 'Radiant Burst',
        icon: '☀️',
        element: 'holy',
        damage: 3.0,
        cooldown: 12000,
        tier: 2,
        description: 'Explode with radiant energy',
      },
      sanctuary: {
        id: 'sanctuary',
        name: 'Sanctuary',
        icon: '🛡️',
        element: 'holy',
        damage: 1.5,
        cooldown: 15000,
        tier: 2,
        description: 'Create a protective sanctuary',
        shieldPercent: 0.2,
      },
      consecrate: {
        id: 'consecrate',
        name: 'Consecrate',
        icon: '⭕',
        element: 'holy',
        damage: 2.8,
        cooldown: 10000,
        tier: 2,
        description: 'Consecrate the ground beneath your enemy',
      },
      angels_wrath: {
        id: 'angels_wrath',
        name: "Angel's Wrath",
        icon: '🪽',
        element: 'holy',
        damage: 5.0,
        cooldown: 22000,
        tier: 4,
        description: 'Invoke the wrath of the heavens',
      },
    },
  },

  earth: {
    name: 'Earth',
    color: '#aa6600',
    gradientClass: 'from-amber-700 to-stone-600',
    textColor: 'text-white',
    abilities: {
      earthquake: {
        id: 'earthquake',
        name: 'Earthquake',
        icon: '🌍',
        element: 'earth',
        damage: 3.5,
        cooldown: 14000,
        tier: 3,
        description: 'Shake the earth with tremendous force',
      },
      rock_throw: {
        id: 'rock_throw',
        name: 'Rock Throw',
        icon: '🪨',
        element: 'earth',
        damage: 2.0,
        cooldown: 5000,
        tier: 1,
        description: 'Hurl a boulder at your enemy',
      },
      stone_spike: {
        id: 'stone_spike',
        name: 'Stone Spike',
        icon: '⛰️',
        element: 'earth',
        damage: 2.5,
        cooldown: 8000,
        tier: 2,
        description: 'Impale your foe with a stone spike',
      },
      landslide: {
        id: 'landslide',
        name: 'Landslide',
        icon: '🏔️',
        element: 'earth',
        damage: 4.0,
        cooldown: 16000,
        tier: 3,
        description: 'Trigger a devastating landslide',
      },
    },
  },

  wind: {
    name: 'Wind',
    color: '#00ddaa',
    gradientClass: 'from-teal-400 to-cyan-300',
    textColor: 'text-black',
    abilities: {
      wind_slash: {
        id: 'wind_slash',
        name: 'Wind Slash',
        icon: '💨',
        element: 'wind',
        damage: 2.0,
        cooldown: 5000,
        tier: 1,
        description: 'Slash your enemy with concentrated wind',
      },
      tornado: {
        id: 'tornado',
        name: 'Tornado',
        icon: '🌪️',
        element: 'wind',
        damage: 3.5,
        cooldown: 14000,
        tier: 3,
        description: 'Summon a devastating tornado',
      },
      gale_force: {
        id: 'gale_force',
        name: 'Gale Force',
        icon: '🌬️',
        element: 'wind',
        damage: 2.5,
        cooldown: 8000,
        tier: 2,
        description: 'Unleash gale-force winds',
      },
      air_cutter: {
        id: 'air_cutter',
        name: 'Air Cutter',
        icon: '✂️',
        element: 'wind',
        damage: 2.2,
        cooldown: 6000,
        tier: 1,
        description: 'Cut through the air with razor-sharp blades',
      },
    },
  },

  water: {
    name: 'Water',
    color: '#0088ff',
    gradientClass: 'from-blue-500 to-indigo-600',
    textColor: 'text-white',
    abilities: {
      water_blast: {
        id: 'water_blast',
        name: 'Water Blast',
        icon: '💧',
        element: 'water',
        damage: 2.0,
        cooldown: 6000,
        tier: 1,
        description: 'Blast your enemy with pressurized water',
      },
      tidal_wave: {
        id: 'tidal_wave',
        name: 'Tidal Wave',
        icon: '🌊',
        element: 'water',
        damage: 4.0,
        cooldown: 16000,
        tier: 3,
        description: 'Summon a massive tidal wave',
      },
      hydro_pump: {
        id: 'hydro_pump',
        name: 'Hydro Pump',
        icon: '🚿',
        element: 'water',
        damage: 3.0,
        cooldown: 10000,
        tier: 2,
        description: 'Fire a high-pressure water jet',
      },
      bubble_storm: {
        id: 'bubble_storm',
        name: 'Bubble Storm',
        icon: '🫧',
        element: 'water',
        damage: 2.5,
        cooldown: 8000,
        tier: 2,
        description: 'Surround your enemy with explosive bubbles',
      },
    },
  },

  poison: {
    name: 'Poison',
    color: '#88ff00',
    gradientClass: 'from-green-600 to-lime-500',
    textColor: 'text-white',
    abilities: {
      poison_cloud: {
        id: 'poison_cloud',
        name: 'Poison Cloud',
        icon: '☠️',
        element: 'poison',
        damage: 2.5,
        cooldown: 10000,
        tier: 2,
        description: 'Create a cloud of toxic gas',
      },
      toxic_spit: {
        id: 'toxic_spit',
        name: 'Toxic Spit',
        icon: '🤮',
        element: 'poison',
        damage: 2.0,
        cooldown: 6000,
        tier: 1,
        description: 'Spit corrosive acid at your enemy',
      },
      venom_spray: {
        id: 'venom_spray',
        name: 'Venom Spray',
        icon: '🐍',
        element: 'poison',
        damage: 2.8,
        cooldown: 9000,
        tier: 2,
        description: 'Spray deadly venom',
      },
      plague: {
        id: 'plague',
        name: 'Plague',
        icon: '🦠',
        element: 'poison',
        damage: 3.5,
        cooldown: 14000,
        tier: 3,
        description: 'Inflict a devastating plague',
      },
    },
  },

  arcane: {
    name: 'Arcane',
    color: '#ff44ff',
    gradientClass: 'from-fuchsia-600 to-pink-500',
    textColor: 'text-white',
    abilities: {
      arcane_blast: {
        id: 'arcane_blast',
        name: 'Arcane Blast',
        icon: '🔮',
        element: 'arcane',
        damage: 2.2,
        cooldown: 6000,
        tier: 1,
        description: 'Fire a blast of pure arcane energy',
      },
      magic_missile: {
        id: 'magic_missile',
        name: 'Magic Missile',
        icon: '✴️',
        element: 'arcane',
        damage: 1.8,
        cooldown: 4000,
        tier: 1,
        description: 'Launch homing magic missiles',
      },
      arcane_beam: {
        id: 'arcane_beam',
        name: 'Arcane Beam',
        icon: '📡',
        element: 'arcane',
        damage: 3.0,
        cooldown: 12000,
        tier: 2,
        description: 'Fire a concentrated beam of arcane power',
      },
      mystic_explosion: {
        id: 'mystic_explosion',
        name: 'Mystic Explosion',
        icon: '💜',
        element: 'arcane',
        damage: 4.0,
        cooldown: 16000,
        tier: 3,
        description: 'Detonate a massive arcane explosion',
      },
    },
  },

  support: {
    name: 'Support',
    color: '#00ff88',
    gradientClass: 'from-emerald-500 to-teal-500',
    textColor: 'text-white',
    abilities: {
      heal: {
        id: 'heal',
        name: 'Heal',
        icon: '💚',
        element: 'support',
        damage: 0,
        cooldown: 12000,
        tier: 1,
        description: 'Restore health to yourself',
        healPercent: 0.2,
      },
      greater_heal: {
        id: 'greater_heal',
        name: 'Greater Heal',
        icon: '💖',
        element: 'support',
        damage: 0,
        cooldown: 20000,
        tier: 2,
        description: 'Restore a large amount of health',
        healPercent: 0.4,
      },
      shield: {
        id: 'shield',
        name: 'Shield',
        icon: '🛡️',
        element: 'support',
        damage: 0,
        cooldown: 15000,
        tier: 2,
        description: 'Create a protective shield',
        shieldPercent: 0.25,
      },
      power_buff: {
        id: 'power_buff',
        name: 'Power Buff',
        icon: '💪',
        element: 'support',
        damage: 0,
        cooldown: 18000,
        tier: 2,
        description: 'Increase your damage output',
        damageBoost: 0.3,
        duration: 10000,
      },
      speed_buff: {
        id: 'speed_buff',
        name: 'Speed Buff',
        icon: '⚡',
        element: 'support',
        damage: 0,
        cooldown: 16000,
        tier: 2,
        description: 'Increase your attack speed',
        speedBoost: 0.3,
        duration: 8000,
      },
      magic_buff: {
        id: 'magic_buff',
        name: 'Magic Buff',
        icon: '🎭',
        element: 'support',
        damage: 0,
        cooldown: 18000,
        tier: 2,
        description: 'Enhance your magical abilities',
        magicBoost: 0.3,
        duration: 10000,
      },
      curse: {
        id: 'curse',
        name: 'Curse',
        icon: '🔮',
        element: 'support',
        damage: 1.5,
        cooldown: 14000,
        tier: 2,
        description: 'Curse your enemy to weaken them',
        debuffPercent: 0.2,
        duration: 8000,
      },
    },
  },

  ultimate: {
    name: 'Ultimate',
    color: '#ff00ff',
    gradientClass: 'from-rose-600 via-purple-600 to-indigo-600',
    textColor: 'text-white',
    abilities: {
      supernova: {
        id: 'supernova',
        name: 'Supernova',
        icon: '🌟',
        element: 'ultimate',
        damage: 6.0,
        cooldown: 30000,
        tier: 4,
        description: 'Unleash the power of an exploding star',
      },
      absolute_zero: {
        id: 'absolute_zero',
        name: 'Absolute Zero',
        icon: '🥶',
        element: 'ultimate',
        damage: 5.5,
        cooldown: 28000,
        tier: 4,
        description: 'Freeze everything to absolute zero',
      },
      divine_storm: {
        id: 'divine_storm',
        name: 'Divine Storm',
        icon: '⚡',
        element: 'ultimate',
        damage: 6.0,
        cooldown: 30000,
        tier: 4,
        description: 'Summon a storm of divine lightning',
      },
      void_collapse: {
        id: 'void_collapse',
        name: 'Void Collapse',
        icon: '🕳️',
        element: 'ultimate',
        damage: 6.5,
        cooldown: 35000,
        tier: 4,
        description: 'Collapse reality into the void',
      },
      elemental_fury: {
        id: 'elemental_fury',
        name: 'Elemental Fury',
        icon: '🌈',
        element: 'ultimate',
        damage: 7.0,
        cooldown: 40000,
        tier: 4,
        description: 'Channel all elements in a devastating attack',
      },
    },
  },
};

/**
 * Get an ability by its ID
 */
export function getAbilityById(id) {
  for (const element of Object.values(ELEMENTAL_ABILITIES)) {
    if (element.abilities[id]) {
      return element.abilities[id];
    }
  }
  return null;
}

/**
 * Get all abilities as a flat array
 */
export function getAllAbilities() {
  const abilities = [];
  for (const [elementKey, element] of Object.entries(ELEMENTAL_ABILITIES)) {
    for (const ability of Object.values(element.abilities)) {
      abilities.push({
        ...ability,
        elementName: element.name,
        elementColor: element.color,
        gradientClass: element.gradientClass,
        textColor: element.textColor,
      });
    }
  }
  return abilities;
}

/**
 * Get abilities by element
 */
export function getAbilitiesByElement(elementKey) {
  const element = ELEMENTAL_ABILITIES[elementKey];
  if (!element) return [];
  return Object.values(element.abilities).map(ability => ({
    ...ability,
    elementName: element.name,
    elementColor: element.color,
    gradientClass: element.gradientClass,
    textColor: element.textColor,
  }));
}

/**
 * Get abilities by tier
 */
export function getAbilitiesByTier(tier) {
  return getAllAbilities().filter(ability => ability.tier === tier);
}

/**
 * Calculate ability damage based on base player damage
 */
export function calculateAbilityDamage(ability, baseDamage, isCrit = false) {
  let damage = baseDamage * ability.damage;
  if (isCrit) {
    damage *= 1.5;
  }
  return Math.floor(damage);
}

/**
 * Get cooldown progress (0-1, 1 = ready)
 */
export function getCooldownProgress(lastUsed, cooldown) {
  if (!lastUsed) return 1;
  const elapsed = Date.now() - lastUsed;
  return Math.min(1, elapsed / cooldown);
}

/**
 * Check if ability is ready
 */
export function isAbilityReady(lastUsed, cooldown) {
  if (!lastUsed) return true;
  return Date.now() - lastUsed >= cooldown;
}

export default ELEMENTAL_ABILITIES;
