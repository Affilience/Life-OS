/**
 * Elemental Abilities Database
 * All combat abilities organised by element with damage, cooldown, and tier stats
 *
 * Damage: Multiplier applied to base player damage (1.0 = 100% of base damage)
 * Cooldown: Milliseconds before ability can be used again
 * Tier: 1 (basic), 2 (intermediate), 3 (advanced), 4 (ultimate)
 */

// Element color mapping for UI
export const ELEMENT_COLORS = {
  fire: '#ff6600',
  ice: '#00bfff',
  lightning: '#ffcc00',
  dark: '#9933ff',
  holy: '#ffd700',
  earth: '#8b4513',
  wind: '#87ceeb',
  water: '#1e90ff',
  poison: '#32cd32',
  arcane: '#a855f7',
  support: '#10b981',
  ultimate: '#f59e0b',
  physical: '#ef4444',
  spirit: '#57d9d4',
  fortune: '#d9c157',
  charm: '#57d98a',
  tech: '#b8b8c8',
};

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
      // sanctuary removed - protective ability
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
        description: 'Blast your enemy with pressurised water',
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
      // Only offensive support abilities remain - healing/shields/buffs removed
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

  // === SKILL TREE THEMED ABILITIES ===

  // Physical abilities (BODY tree)
  physical: {
    name: 'Physical',
    color: '#d97757',
    gradientClass: 'from-orange-600 to-red-700',
    textColor: 'text-white',
    abilities: {
      power_slash: {
        id: 'power_slash',
        name: 'Power Slash',
        icon: '⚔️',
        element: 'physical',
        damage: 1.8,
        cooldown: 5000,
        tier: 1,
        description: 'A powerful slashing attack',
      },
      cleaving_blow: {
        id: 'cleaving_blow',
        name: 'Cleaving Blow',
        icon: '🪓',
        element: 'physical',
        damage: 2.2,
        cooldown: 7000,
        tier: 1,
        description: 'A wide sweeping attack',
      },
      blade_dance: {
        id: 'blade_dance',
        name: 'Blade Dance',
        icon: '💃',
        element: 'physical',
        damage: 2.8,
        cooldown: 10000,
        tier: 2,
        description: 'A flurry of rapid blade strikes',
      },
      earthshatter: {
        id: 'earthshatter',
        name: 'Earthshatter',
        icon: '💥',
        element: 'physical',
        damage: 3.5,
        cooldown: 14000,
        tier: 2,
        description: 'Slam the ground with tremendous force',
      },
      thunderous_blow: {
        id: 'thunderous_blow',
        name: 'Thunderous Blow',
        icon: '🔨',
        element: 'physical',
        damage: 4.0,
        cooldown: 16000,
        tier: 3,
        description: 'A devastating strike that echoes like thunder',
      },
      berserker_rage: {
        id: 'berserker_rage',
        name: 'Berserker Rage',
        icon: '😤',
        element: 'physical',
        damage: 5.0,
        cooldown: 20000,
        tier: 3,
        description: 'Enter a berserker state for massive damage',
      },
      shadow_strike: {
        id: 'shadow_strike',
        name: 'Shadow Strike',
        icon: '🗡️',
        element: 'physical',
        damage: 4.5,
        cooldown: 18000,
        tier: 3,
        description: 'Strike from the shadows with lethal precision',
      },
      assassinate: {
        id: 'assassinate',
        name: 'Assassinate',
        icon: '☠️',
        element: 'physical',
        damage: 6.0,
        cooldown: 25000,
        tier: 4,
        description: 'A lethal assassination technique',
      },
    },
  },

  // Spirit/Holy abilities (SPIRIT tree)
  spirit: {
    name: 'Spirit',
    color: '#57d9d4',
    gradientClass: 'from-teal-400 to-cyan-500',
    textColor: 'text-white',
    abilities: {
      inner_light: {
        id: 'inner_light',
        name: 'Inner Light',
        icon: '💫',
        element: 'spirit',
        damage: 1.5,
        cooldown: 5000,
        tier: 1,
        description: 'Channel your inner light as an attack',
        healPercent: 0.1,
      },
      serenity_wave: {
        id: 'serenity_wave',
        name: 'Serenity Wave',
        icon: '🌊',
        element: 'spirit',
        damage: 2.0,
        cooldown: 8000,
        tier: 1,
        description: 'Release a calming wave that damages enemies',
      },
      meditation_burst: {
        id: 'meditation_burst',
        name: 'Meditation Burst',
        icon: '🧘',
        element: 'spirit',
        damage: 2.5,
        cooldown: 10000,
        tier: 2,
        description: 'Release stored meditative energy',
      },
      zen_strike: {
        id: 'zen_strike',
        name: 'Zen Strike',
        icon: '☯️',
        element: 'spirit',
        damage: 3.0,
        cooldown: 12000,
        tier: 2,
        description: 'A perfectly balanced attack',
      },
      enlightened_blast: {
        id: 'enlightened_blast',
        name: 'Enlightened Blast',
        icon: '🌟',
        element: 'spirit',
        damage: 4.0,
        cooldown: 16000,
        tier: 3,
        description: 'Channel enlightenment into a powerful blast',
      },
      transcendence: {
        id: 'transcendence',
        name: 'Transcendence',
        icon: '👼',
        element: 'spirit',
        damage: 5.5,
        cooldown: 24000,
        tier: 4,
        description: 'Transcend mortal limits for ultimate power',
        healPercent: 0.2,
      },
    },
  },

  // Fortune abilities (WEALTH tree)
  fortune: {
    name: 'Fortune',
    color: '#d9c157',
    gradientClass: 'from-yellow-500 to-amber-600',
    textColor: 'text-black',
    abilities: {
      golden_strike: {
        id: 'golden_strike',
        name: 'Golden Strike',
        icon: '💰',
        element: 'fortune',
        damage: 1.8,
        cooldown: 5000,
        tier: 1,
        description: 'Strike with the power of gold',
        bonusGold: 5,
      },
      coin_barrage: {
        id: 'coin_barrage',
        name: 'Coin Barrage',
        icon: '🪙',
        element: 'fortune',
        damage: 2.2,
        cooldown: 8000,
        tier: 1,
        description: 'Hurl a barrage of golden coins',
        bonusGold: 10,
      },
      wealth_explosion: {
        id: 'wealth_explosion',
        name: 'Wealth Explosion',
        icon: '💎',
        element: 'fortune',
        damage: 3.0,
        cooldown: 12000,
        tier: 2,
        description: 'Explode with the power of accumulated wealth',
        bonusGold: 25,
      },
      lucky_strike: {
        id: 'lucky_strike',
        name: 'Lucky Strike',
        icon: '🍀',
        element: 'fortune',
        damage: 2.5,
        cooldown: 10000,
        tier: 2,
        description: 'A strike blessed by fortune',
        critBonus: 0.25,
      },
      treasure_blast: {
        id: 'treasure_blast',
        name: 'Treasure Blast',
        icon: '👑',
        element: 'fortune',
        damage: 4.0,
        cooldown: 16000,
        tier: 3,
        description: 'Unleash the power of a treasure hoard',
        bonusGold: 50,
      },
      midas_touch: {
        id: 'midas_touch',
        name: 'Midas Touch',
        icon: '✨',
        element: 'fortune',
        damage: 5.0,
        cooldown: 22000,
        tier: 4,
        description: 'Turn your enemies to gold',
        bonusGold: 100,
      },
    },
  },

  // Social/Charm abilities (SOCIAL tree)
  charm: {
    name: 'Charm',
    color: '#e85da1',
    gradientClass: 'from-pink-500 to-rose-600',
    textColor: 'text-white',
    abilities: {
      charm_strike: {
        id: 'charm_strike',
        name: 'Charm Strike',
        icon: '💕',
        element: 'charm',
        damage: 1.6,
        cooldown: 5000,
        tier: 1,
        description: 'A charming attack that confuses enemies',
      },
      inspiring_words: {
        id: 'inspiring_words',
        name: 'Inspiring Words',
        icon: '📢',
        element: 'charm',
        damage: 2.0,
        cooldown: 8000,
        tier: 1,
        description: 'Words so inspiring they deal damage',
      },
      rally_cry: {
        id: 'rally_cry',
        name: 'Rally Cry',
        icon: '📣',
        element: 'charm',
        damage: 2.5,
        cooldown: 10000,
        tier: 2,
        description: 'A rallying cry that empowers and damages',
        damageBoost: 0.15,
        duration: 8000,
      },
      social_butterfly: {
        id: 'social_butterfly',
        name: 'Social Butterfly',
        icon: '🦋',
        element: 'charm',
        damage: 3.0,
        cooldown: 12000,
        tier: 2,
        description: 'Flutter around dealing multiple hits',
      },
      influence_blast: {
        id: 'influence_blast',
        name: 'Influence Blast',
        icon: '🌐',
        element: 'charm',
        damage: 4.0,
        cooldown: 16000,
        tier: 3,
        description: 'Blast enemies with your social influence',
      },
      viral_strike: {
        id: 'viral_strike',
        name: 'Viral Strike',
        icon: '📱',
        element: 'charm',
        damage: 5.0,
        cooldown: 20000,
        tier: 4,
        description: 'An attack that goes viral, hitting everything',
      },
    },
  },

  // Tech/Craft abilities (CRAFT tree)
  tech: {
    name: 'Tech',
    color: '#7088e8',
    gradientClass: 'from-indigo-500 to-blue-600',
    textColor: 'text-white',
    abilities: {
      gadget_throw: {
        id: 'gadget_throw',
        name: 'Gadget Throw',
        icon: '🔧',
        element: 'tech',
        damage: 1.8,
        cooldown: 5000,
        tier: 1,
        description: 'Throw a crafted gadget at your enemy',
      },
      gear_grind: {
        id: 'gear_grind',
        name: 'Gear Grind',
        icon: '⚙️',
        element: 'tech',
        damage: 2.2,
        cooldown: 7000,
        tier: 1,
        description: 'Grind enemies with mechanical gears',
      },
      bomb_toss: {
        id: 'bomb_toss',
        name: 'Bomb Toss',
        icon: '💣',
        element: 'tech',
        damage: 3.0,
        cooldown: 10000,
        tier: 2,
        description: 'Toss a crafted explosive',
      },
      turret_blast: {
        id: 'turret_blast',
        name: 'Turret Blast',
        icon: '🔫',
        element: 'tech',
        damage: 2.8,
        cooldown: 12000,
        tier: 2,
        description: 'Deploy a temporary turret that fires',
      },
      mech_strike: {
        id: 'mech_strike',
        name: 'Mech Strike',
        icon: '🤖',
        element: 'tech',
        damage: 4.0,
        cooldown: 16000,
        tier: 3,
        description: 'Summon a mechanical arm to strike',
      },
      invention_overload: {
        id: 'invention_overload',
        name: 'Invention Overload',
        icon: '⚡',
        element: 'tech',
        damage: 5.5,
        cooldown: 22000,
        tier: 4,
        description: 'Overload all your inventions for massive damage',
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
 * Calculate ability damage based on base player damage and stats
 * Wisdom increases magical ability damage
 * Intelligence increases ability effectiveness and crit damage
 *
 * Formula:
 * - Base: baseDamage * ability.damage
 * - Wisdom bonus: +2% per wisdom point for magical abilities
 * - Intelligence bonus: +1% per intelligence point for all abilities
 * - Crit: 1.5x (+ 0.5% per intelligence for crit damage bonus)
 */
export function calculateAbilityDamage(ability, baseDamage, stats = {}, isCrit = false) {
  const wisdom = stats.wisdom || 0;
  const intelligence = stats.intelligence || 0;

  // Base damage from ability multiplier
  let damage = baseDamage * ability.damage;

  // Wisdom bonus (2% per point) - affects magical abilities more
  const isMagical = ['fire', 'ice', 'lightning', 'arcane', 'dark', 'holy', 'water', 'wind', 'poison'].includes(ability.element);
  if (isMagical) {
    const wisdomBonus = 1 + (wisdom * 0.02); // 2% per wisdom
    damage *= wisdomBonus;
  }

  // Intelligence bonus (1% per point) - affects all abilities
  const intelligenceBonus = 1 + (intelligence * 0.01); // 1% per intelligence
  damage *= intelligenceBonus;

  // Critical hit with intelligence scaling
  if (isCrit) {
    const critMultiplier = 1.5 + (intelligence * 0.005); // Base 1.5x + 0.5% per INT
    damage *= critMultiplier;
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

/**
 * Ability Unlock Sources
 * Defines how each ability can be unlocked
 * Types: 'perk' (skill tree), 'achievement', 'boss', 'default' (starts unlocked)
 */
export const ABILITY_UNLOCKS = {
  // === UNLOCKED BY DEFAULT (starter abilities - only 2) ===
  fireball: { type: 'default', description: 'Available from the start' },
  magic_missile: { type: 'default', description: 'Available from the start' },

  // === EARLY ACHIEVEMENTS (former defaults) ===
  ice_spike: { type: 'achievement', achievementId: 'first_entry', name: 'First Entry', description: 'Write your first journal entry' },
  lightning_strike: { type: 'achievement', achievementId: 'first_quest', name: 'First Quest', description: 'Complete your first quest' },
  rock_throw: { type: 'achievement', achievementId: 'first_workout', name: 'First Workout', description: 'Complete your first workout' },
  wind_slash: { type: 'achievement', achievementId: 'first_book', name: 'First Book', description: 'Log your first book' },
  water_blast: { type: 'achievement', achievementId: 'first_contribution', name: 'First Contribution', description: 'Make your first financial contribution' },
  toxic_spit: { type: 'achievement', achievementId: 'streak_starter', name: 'Streak Starter', description: 'Start a streak' },
  shadow_burst: { type: 'achievement', achievementId: 'night_owl', name: 'Night Owl', description: 'Complete activities at night' },
  holy_light: { type: 'achievement', achievementId: 'first_goal_complete', name: 'First Goal', description: 'Complete your first goal' },

  // === UNLOCKED VIA SKILL TREES (perk unlocks) ===
  // BODY Tree - Physical
  power_slash: { type: 'perk', perkId: 'unlock_ability_power_slash', tree: 'body' },
  cleaving_blow: { type: 'perk', perkId: 'unlock_ability_cleaving_blow', tree: 'body' },
  blade_dance: { type: 'perk', perkId: 'unlock_ability_blade_dance', tree: 'body' },
  earthshatter: { type: 'perk', perkId: 'unlock_ability_earthshatter', tree: 'body' },
  thunderous_blow: { type: 'perk', perkId: 'unlock_ability_thunderous_blow', tree: 'body' },
  berserker_rage: { type: 'perk', perkId: 'unlock_ability_berserker_rage', tree: 'body' },
  shadow_strike: { type: 'perk', perkId: 'unlock_ability_shadow_strike', tree: 'body' },
  assassinate: { type: 'perk', perkId: 'unlock_ability_assassinate', tree: 'body' },

  // MIND Tree - Magic
  chain_lightning: { type: 'perk', perkId: 'unlock_ability_chain_lightning', tree: 'mind' },
  arcane_blast: { type: 'perk', perkId: 'unlock_ability_arcane_blast', tree: 'mind' },
  frost_nova: { type: 'perk', perkId: 'unlock_ability_frost_nova', tree: 'mind' },
  arcane_beam: { type: 'perk', perkId: 'unlock_ability_arcane_beam', tree: 'mind' },
  soul_drain: { type: 'perk', perkId: 'unlock_ability_soul_drain', tree: 'mind' },
  dark_pulse: { type: 'perk', perkId: 'unlock_ability_dark_pulse', tree: 'mind' },
  meteor: { type: 'perk', perkId: 'unlock_ability_meteor', tree: 'mind' },
  mystic_explosion: { type: 'perk', perkId: 'unlock_ability_mystic_explosion', tree: 'mind' },

  // SPIRIT Tree
  inner_light: { type: 'perk', perkId: 'unlock_ability_inner_light', tree: 'spirit' },
  serenity_wave: { type: 'perk', perkId: 'unlock_ability_serenity_wave', tree: 'spirit' },
  meditation_burst: { type: 'perk', perkId: 'unlock_ability_meditation_burst', tree: 'spirit' },
  zen_strike: { type: 'perk', perkId: 'unlock_ability_zen_strike', tree: 'spirit' },
  enlightened_blast: { type: 'perk', perkId: 'unlock_ability_enlightened_blast', tree: 'spirit' },
  transcendence: { type: 'perk', perkId: 'unlock_ability_transcendence_strike', tree: 'spirit' },

  // WEALTH Tree - Fortune
  golden_strike: { type: 'perk', perkId: 'unlock_ability_golden_strike', tree: 'wealth' },
  coin_barrage: { type: 'perk', perkId: 'unlock_ability_coin_barrage', tree: 'wealth' },
  lucky_strike: { type: 'perk', perkId: 'unlock_ability_lucky_strike', tree: 'wealth' },
  wealth_explosion: { type: 'perk', perkId: 'unlock_ability_wealth_explosion', tree: 'wealth' },
  treasure_blast: { type: 'perk', perkId: 'unlock_ability_treasure_blast', tree: 'wealth' },
  midas_touch: { type: 'perk', perkId: 'unlock_ability_midas_touch', tree: 'wealth' },

  // SOCIAL Tree - Charm
  charm_strike: { type: 'perk', perkId: 'unlock_ability_charm_strike', tree: 'social' },
  inspiring_words: { type: 'perk', perkId: 'unlock_ability_inspiring_words', tree: 'social' },
  rally_cry: { type: 'perk', perkId: 'unlock_ability_rally_cry', tree: 'social' },
  social_butterfly: { type: 'perk', perkId: 'unlock_ability_social_butterfly', tree: 'social' },
  influence_blast: { type: 'perk', perkId: 'unlock_ability_influence_blast', tree: 'social' },
  viral_strike: { type: 'perk', perkId: 'unlock_ability_viral_strike', tree: 'social' },

  // CRAFT Tree - Tech
  gadget_throw: { type: 'perk', perkId: 'unlock_ability_gadget_throw', tree: 'craft' },
  gear_grind: { type: 'perk', perkId: 'unlock_ability_gear_grind', tree: 'craft' },
  bomb_toss: { type: 'perk', perkId: 'unlock_ability_bomb_toss', tree: 'craft' },
  turret_blast: { type: 'perk', perkId: 'unlock_ability_turret_blast', tree: 'craft' },
  mech_strike: { type: 'perk', perkId: 'unlock_ability_mech_strike', tree: 'craft' },
  invention_overload: { type: 'perk', perkId: 'unlock_ability_invention_overload', tree: 'craft' },

  // === UNLOCKED VIA ACHIEVEMENTS ===
  // Fire achievements
  inferno: { type: 'achievement', achievementId: 'one_week', name: 'One Week Streak', description: 'Maintain a 7-day streak' },
  flame_burst: { type: 'achievement', achievementId: 'workout_10', name: '10 Workouts', description: 'Complete 10 workouts' },
  blazing_combo: { type: 'achievement', achievementId: 'workout_streak_30', name: '30-Day Workout Streak', description: 'Complete 30 days of workouts in a row' },

  // Ice achievements
  blizzard: { type: 'achievement', achievementId: 'two_weeks', name: 'Two Week Streak', description: 'Maintain a 14-day streak' },
  ice_beam: { type: 'achievement', achievementId: 'deep_work_10', name: 'Deep Focus', description: 'Log 10 deep work sessions' },

  // Lightning achievements
  thunder_storm: { type: 'achievement', achievementId: 'task_500', name: 'Task Master', description: 'Complete 500 tasks' },
  static_shock: { type: 'achievement', achievementId: 'task_blitz', name: 'Task Blitz', description: 'Complete many tasks quickly' },

  // Earth achievements
  earthquake: { type: 'achievement', achievementId: 'level_25', name: 'Level 25', description: 'Reach level 25' },
  stone_spike: { type: 'achievement', achievementId: 'perfect_workout_week', name: 'Perfect Week', description: 'Complete a perfect workout week' },
  landslide: { type: 'achievement', achievementId: 'level_50', name: 'Level 50', description: 'Reach level 50' },

  // Wind achievements
  tornado: { type: 'achievement', achievementId: 'bookworm', name: 'Bookworm', description: 'Finish multiple books' },
  gale_force: { type: 'achievement', achievementId: 'early_bird', name: 'Early Bird', description: 'Complete tasks early in the morning' },
  air_cutter: { type: 'achievement', achievementId: 'journal_streak_7', name: '7-Day Journal Streak', description: 'Write journal entries for 7 days in a row' },

  // Water achievements
  tidal_wave: { type: 'achievement', achievementId: 'meal_log_30', name: 'Meal Logger', description: 'Log meals for 30 days' },
  hydro_pump: { type: 'achievement', achievementId: 'calorie_goal_30', name: 'Calorie Champion', description: 'Hit calorie goals for 30 days' },
  bubble_storm: { type: 'achievement', achievementId: 'protein_goal_14', name: 'Protein Pro', description: 'Hit protein goals for 14 days' },

  // Poison achievements
  poison_cloud: { type: 'achievement', achievementId: 'chain_breaker', name: 'Chain Breaker', description: 'Break a negative chain' },
  venom_spray: { type: 'achievement', achievementId: 'comeback_kid', name: 'Comeback Kid', description: 'Make a comeback' },
  plague: { type: 'achievement', achievementId: 'triple_threat', name: 'Triple Threat', description: 'Excel in multiple areas' },

  // Dark achievements
  void_rift: { type: 'achievement', achievementId: 'night_owl_streak', name: 'Night Owl Streak', description: 'Complete activities at night consistently' },
  dark_tendrils: { type: 'achievement', achievementId: 'deep_work_100', name: 'Deep Worker', description: 'Log 100 deep work sessions' },

  // Holy achievements
  smite: { type: 'achievement', achievementId: 'journal_streak_30', name: 'Journal Master', description: 'Write journal entries for 30 days in a row' },
  radiant_burst: { type: 'achievement', achievementId: 'xp_1000', name: 'XP Collector', description: 'Earn 1000 XP' },
  consecrate: { type: 'achievement', achievementId: 'xp_10000', name: 'XP Master', description: 'Earn 10000 XP' },

  // Support achievements (non-offensive abilities removed: heal, greater_heal, shield, power_buff, speed_buff, magic_buff, sanctuary)
  curse: { type: 'achievement', achievementId: 'dragon_hunter', name: 'Dragon Hunter', description: 'Defeat a dragon boss' },

  // === UNLOCKED VIA BOSS DROPS ===
  // Tier 3 boss drops
  black_hole: { type: 'boss', bossId: 'void_titan', bossName: 'Void Titan', dropRate: 0.15, description: 'Rare drop from Void Titan' },
  divine_judgment: { type: 'boss', bossId: 'celestial_guardian', bossName: 'Celestial Guardian', dropRate: 0.15, description: 'Rare drop from Celestial Guardian' },
  angels_wrath: { type: 'boss', bossId: 'archangel', bossName: 'Archangel', dropRate: 0.10, description: 'Rare drop from Archangel' },

  // Ultimate abilities - rare boss drops
  supernova: { type: 'boss', bossId: 'solar_emperor', bossName: 'Solar Emperor', dropRate: 0.05, description: 'Ultra rare drop from Solar Emperor' },
  absolute_zero: { type: 'boss', bossId: 'frost_monarch', bossName: 'Frost Monarch', dropRate: 0.05, description: 'Ultra rare drop from Frost Monarch' },
  divine_storm: { type: 'boss', bossId: 'storm_lord', bossName: 'Storm Lord', dropRate: 0.05, description: 'Ultra rare drop from Storm Lord' },
  void_collapse: { type: 'boss', bossId: 'void_titan', bossName: 'Void Titan', dropRate: 0.03, description: 'Legendary drop from Void Titan' },
  elemental_fury: { type: 'boss', bossId: 'elemental_king', bossName: 'Elemental King', dropRate: 0.02, description: 'Legendary drop from Elemental King' },
};

/**
 * Check if an ability is unlocked for a user
 * @param {string} abilityId - The ability ID to check
 * @param {Object} userData - User data containing perks, achievements, bossDrops
 * @returns {boolean} Whether the ability is unlocked
 */
export function isAbilityUnlocked(abilityId, userData = {}) {
  const unlock = ABILITY_UNLOCKS[abilityId];

  // If no unlock data, assume it's locked
  if (!unlock) return false;

  switch (unlock.type) {
    case 'default':
      return true;
    case 'perk':
      return userData.unlockedPerks?.includes(unlock.perkId) || false;
    case 'achievement':
      return userData.achievements?.includes(unlock.achievementId) || false;
    case 'boss':
      return userData.bossDrops?.includes(abilityId) || false;
    default:
      return false;
  }
}

/**
 * Get unlock info for an ability
 * @param {string} abilityId - The ability ID
 * @returns {Object} Unlock information
 */
export function getAbilityUnlockInfo(abilityId) {
  return ABILITY_UNLOCKS[abilityId] || { type: 'unknown', description: 'Unknown unlock method' };
}

/**
 * Get all abilities that can be unlocked by a specific method
 * @param {string} type - 'default', 'perk', 'achievement', or 'boss'
 * @returns {Array} Array of ability IDs
 */
export function getAbilitiesByUnlockType(type) {
  return Object.entries(ABILITY_UNLOCKS)
    .filter(([_, unlock]) => unlock.type === type)
    .map(([abilityId, _]) => abilityId);
}

/**
 * Get all unlocked abilities for a user
 * @param {Object} userData - User data
 * @returns {Array} Array of unlocked ability IDs
 */
export function getUnlockedAbilities(userData = {}) {
  return Object.keys(ABILITY_UNLOCKS).filter(abilityId =>
    isAbilityUnlocked(abilityId, userData)
  );
}

/**
 * Get abilities unlocked by a specific achievement
 * @param {string} achievementId - The achievement ID
 * @returns {Array} Array of ability objects with unlock info
 */
export function getAbilitiesUnlockedByAchievement(achievementId) {
  const abilities = [];

  for (const [abilityId, unlock] of Object.entries(ABILITY_UNLOCKS)) {
    if (unlock.type === 'achievement' && unlock.achievementId === achievementId) {
      const ability = getAbilityById(abilityId);
      if (ability) {
        abilities.push({
          ...ability,
          unlockInfo: unlock,
        });
      }
    }
  }

  return abilities;
}

/**
 * Get all achievement-ability mappings
 * Returns an object where keys are achievement IDs and values are arrays of ability IDs
 */
export function getAchievementAbilityMap() {
  const map = {};

  for (const [abilityId, unlock] of Object.entries(ABILITY_UNLOCKS)) {
    if (unlock.type === 'achievement') {
      if (!map[unlock.achievementId]) {
        map[unlock.achievementId] = [];
      }
      map[unlock.achievementId].push(abilityId);
    }
  }

  return map;
}

export default ELEMENTAL_ABILITIES;
