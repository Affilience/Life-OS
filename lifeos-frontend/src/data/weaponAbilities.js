/**
 * Weapon Abilities System
 * Defines special abilities for weapons used in PvP and Boss battles
 * Each ability has unique animations, effects, and gameplay impact
 */

// Note: Callers must pass EQUIPMENT_DATABASE explicitly to avoid circular dependency
// (equipmentDatabase.js imports ABILITY_TYPES from this file, so we can't import it here)

// Ability type definitions by weapon category
export const ABILITY_TYPES = {
  // ========================================
  // PHYSICAL WEAPON ABILITIES
  // ========================================

  power_slash: {
    id: 'power_slash',
    name: 'Power Slash',
    description: 'A devastating wide slash that cleaves through defenses',
    weaponType: 'sword',
    damage: 2.5,
    cooldown: 8000,
    duration: 500,
    animation: 'slash_arc',
    color: '#ff6600',
    trailColor: '#ffaa00',
    sound: 'powerSlash',
    particleCount: 12,
    screenShake: 'heavy',
    effects: {
      arc: 180,
      width: 120,
      trailEffect: true,
    },
  },

  blade_dance: {
    id: 'blade_dance',
    name: 'Blade Dance',
    description: 'A flurry of elegant slashes striking multiple times',
    weaponType: 'sword',
    damage: 1.8,
    hits: 4,
    cooldown: 10000,
    duration: 800,
    animation: 'multi_slash',
    color: '#88ccff',
    trailColor: '#4488ff',
    sound: 'bladeDance',
    particleCount: 16,
    screenShake: 'normal',
    effects: {
      slashCount: 4,
      slashDelay: 150,
    },
  },

  shadow_strike: {
    id: 'shadow_strike',
    name: 'Shadow Strike',
    description: 'Vanish into shadows and strike with lethal precision',
    weaponType: 'dagger',
    damage: 3.0,
    guaranteedCrit: true,
    cooldown: 12000,
    duration: 600,
    animation: 'blink_strike',
    color: '#8844aa',
    trailColor: '#440066',
    sound: 'shadowStrike',
    particleCount: 8,
    screenShake: 'heavy',
    effects: {
      blinkDistance: 100,
      afterimages: 3,
    },
  },

  assassinate: {
    id: 'assassinate',
    name: 'Assassinate',
    description: 'A precise strike targeting vital points',
    weaponType: 'dagger',
    damage: 4.0,
    cooldown: 15000,
    duration: 400,
    animation: 'precision_strike',
    color: '#cc0000',
    trailColor: '#880000',
    sound: 'assassinate',
    particleCount: 6,
    screenShake: 'normal',
    effects: {
      executeThreshold: 0.25, // Extra damage when target below 25% HP
    },
  },

  cleaving_blow: {
    id: 'cleaving_blow',
    name: 'Cleaving Blow',
    description: 'A brutal overhead strike that causes bleeding',
    weaponType: 'axe',
    damage: 3.0,
    cooldown: 10000,
    duration: 600,
    animation: 'overhead_cleave',
    color: '#ff4400',
    trailColor: '#cc2200',
    sound: 'heavyCleave',
    particleCount: 14,
    screenShake: 'heavy',
    effects: {
      bleedDamage: 0.5,
      bleedDuration: 3000,
      groundCrack: true,
    },
  },

  berserker_rage: {
    id: 'berserker_rage',
    name: 'Berserker Rage',
    description: 'Enter a rage, dealing massive damage',
    weaponType: 'axe',
    damage: 3.5,
    cooldown: 14000,
    duration: 700,
    animation: 'rage_swing',
    color: '#ff0000',
    trailColor: '#ff6600',
    sound: 'berserkerRage',
    particleCount: 20,
    screenShake: 'crit',
    effects: {
      selfDamage: 0.1,
      enrage: true,
    },
  },

  earthshatter: {
    id: 'earthshatter',
    name: 'Earthshatter',
    description: 'Slam the ground with tremendous force, stunning enemies',
    weaponType: 'hammer',
    damage: 4.0,
    cooldown: 15000,
    duration: 800,
    animation: 'ground_slam',
    color: '#aa6600',
    trailColor: '#664400',
    sound: 'earthshatter',
    particleCount: 25,
    screenShake: 'crit',
    effects: {
      shockwaveRings: 3,
      stunDuration: 1000,
      groundCrack: true,
    },
  },

  thunderous_blow: {
    id: 'thunderous_blow',
    name: 'Thunderous Blow',
    description: 'Channel lightning through your hammer',
    weaponType: 'hammer',
    damage: 3.5,
    cooldown: 12000,
    duration: 600,
    animation: 'thunder_strike',
    color: '#ffff00',
    trailColor: '#88ccff',
    sound: 'thunderBlow',
    particleCount: 18,
    screenShake: 'heavy',
    effects: {
      lightning: true,
      chainCount: 2,
    },
  },

  // ========================================
  // MAGIC WEAPON ABILITIES
  // ========================================

  arcane_nova: {
    id: 'arcane_nova',
    name: 'Arcane Nova',
    description: 'Release a burst of pure arcane energy',
    weaponType: 'staff',
    damage: 2.5,
    cooldown: 10000,
    duration: 600,
    animation: 'nova_burst',
    color: '#aa44ff',
    trailColor: '#6600cc',
    sound: 'arcaneNova',
    particleCount: 24,
    screenShake: 'heavy',
    isMagic: true,
    effects: {
      radius: 150,
      expandDuration: 400,
      innerGlow: true,
    },
  },

  arcane_barrage: {
    id: 'arcane_barrage',
    name: 'Arcane Barrage',
    description: 'Launch a volley of arcane missiles',
    weaponType: 'staff',
    damage: 1.5,
    hits: 5,
    cooldown: 12000,
    duration: 1000,
    animation: 'missile_barrage',
    color: '#cc66ff',
    trailColor: '#8800ff',
    sound: 'arcaneBarrage',
    particleCount: 15,
    screenShake: 'normal',
    isMagic: true,
    effects: {
      missileCount: 5,
      missileDelay: 150,
      homing: true,
    },
  },

  chain_lightning: {
    id: 'chain_lightning',
    name: 'Chain Lightning',
    description: 'Unleash lightning that arcs between targets',
    weaponType: 'wand',
    damage: 2.0,
    cooldown: 8000,
    duration: 500,
    animation: 'lightning_chain',
    color: '#88ddff',
    trailColor: '#4488ff',
    sound: 'chainLightning',
    particleCount: 12,
    screenShake: 'normal',
    isMagic: true,
    effects: {
      bounces: 3,
      arcWidth: 4,
      electric: true,
    },
  },

  frost_bolt: {
    id: 'frost_bolt',
    name: 'Frost Bolt',
    description: 'Launch a freezing bolt of ice',
    weaponType: 'wand',
    damage: 2.2,
    cooldown: 7000,
    duration: 400,
    animation: 'ice_projectile',
    color: '#88ffff',
    trailColor: '#44aaff',
    sound: 'frostBolt',
    particleCount: 10,
    screenShake: 'light',
    isMagic: true,
    effects: {
      slowDuration: 2000,
      iceTrail: true,
    },
  },

  soul_drain: {
    id: 'soul_drain',
    name: 'Soul Drain',
    description: 'Drain the life force from your enemy',
    weaponType: 'scepter',
    damage: 1.8,
    cooldown: 10000,
    duration: 800,
    animation: 'life_drain',
    color: '#44ff44',
    trailColor: '#008800',
    sound: 'soulDrain',
    particleCount: 16,
    screenShake: 'normal',
    isMagic: true,
    effects: {
      healPercent: 0.5,
      tendrils: 5,
      drainDuration: 600,
    },
  },

  dark_pulse: {
    id: 'dark_pulse',
    name: 'Dark Pulse',
    description: 'Emit a wave of corrupting darkness',
    weaponType: 'scepter',
    damage: 2.5,
    cooldown: 9000,
    duration: 500,
    animation: 'dark_wave',
    color: '#6600aa',
    trailColor: '#330066',
    sound: 'darkPulse',
    particleCount: 18,
    screenShake: 'heavy',
    isMagic: true,
    effects: {
      waveRadius: 120,
      corruptDuration: 2000,
    },
  },

  meteor: {
    id: 'meteor',
    name: 'Meteor',
    description: 'Call down a devastating meteor from the sky',
    weaponType: 'tome',
    damage: 4.0,
    cooldown: 18000,
    duration: 1200,
    animation: 'meteor_fall',
    color: '#ff4400',
    trailColor: '#ff8800',
    sound: 'meteor',
    particleCount: 30,
    screenShake: 'crit',
    isMagic: true,
    effects: {
      startY: -200,
      impactRadius: 180,
      fireTrail: true,
      impactCrater: true,
    },
  },

  arcane_explosion: {
    id: 'arcane_explosion',
    name: 'Arcane Explosion',
    description: 'Channel power for a massive arcane detonation',
    weaponType: 'tome',
    damage: 3.0,
    cooldown: 14000,
    duration: 900,
    animation: 'charged_explosion',
    color: '#ff44ff',
    trailColor: '#aa00aa',
    sound: 'arcaneExplosion',
    particleCount: 25,
    screenShake: 'crit',
    isMagic: true,
    effects: {
      chargeTime: 500,
      explosionRadius: 160,
      spiralEffect: true,
    },
  },

  void_slash: {
    id: 'void_slash',
    name: 'Void Slash',
    description: 'A devastating slash that tears through the fabric of reality',
    weaponType: 'sword',
    damage: 4.5,
    cooldown: 14000,
    duration: 700,
    animation: 'slash_arc',
    color: '#9933ff',
    trailColor: '#6600cc',
    sound: 'voidSlash',
    particleCount: 20,
    screenShake: 'heavy',
    effects: {
      arc: 200,
      width: 140,
      trailEffect: true,
      voidRipple: true,
    },
  },

  dragon_breath: {
    id: 'dragon_breath',
    name: 'Dragon Breath',
    description: 'Unleash a torrent of draconic fire upon your enemies',
    weaponType: 'sword',
    damage: 4.0,
    cooldown: 16000,
    duration: 1000,
    animation: 'cone_blast',
    color: '#ff4400',
    trailColor: '#ff8800',
    sound: 'dragonBreath',
    particleCount: 35,
    screenShake: 'heavy',
    isMagic: true,
    effects: {
      coneAngle: 60,
      range: 200,
      fireTrail: true,
    },
  },

  // ========================================
  // LEGENDARY WEAPON SIGNATURES
  // Epic, Legendary, and Mythical weapons
  // ========================================

  dragon_soul_slash: {
    id: 'dragon_soul_slash',
    abilityId: 'dragon_soul_slash',
    name: 'Dragon Soul Slash',
    description: 'Channel the fury of ancient dragons into a devastating strike',
    weaponType: 'sword',
    damage: 4.5,
    cooldown: 14000,
    duration: 1000,
    animation: 'slash_arc',
    color: '#ff4400',
    trailColor: '#ffaa00',
    sound: 'dragonSlash',
    particleCount: 25,
    screenShake: 'crit',
  },

  crimson_rampage: {
    id: 'crimson_rampage',
    abilityId: 'crimson_rampage',
    name: 'Crimson Rampage',
    description: 'Enter a blood-fueled frenzy of devastating attacks',
    weaponType: 'sword',
    damage: 4.0,
    cooldown: 12000,
    duration: 900,
    animation: 'rage_swing',
    color: '#cc0000',
    trailColor: '#880000',
    sound: 'rampage',
    particleCount: 20,
    screenShake: 'heavy',
  },

  temporal_rift: {
    id: 'temporal_rift',
    abilityId: 'temporal_rift',
    name: 'Temporal Rift',
    description: 'Tear through the fabric of time itself',
    weaponType: 'sword',
    damage: 5.0,
    cooldown: 16000,
    duration: 1100,
    animation: 'blink_strike',
    color: '#88ddff',
    trailColor: '#4488ff',
    sound: 'temporalRift',
    particleCount: 30,
    screenShake: 'crit',
    isMagic: true,
  },

  divine_annihilation: {
    id: 'divine_annihilation',
    abilityId: 'divine_annihilation',
    name: 'Divine Annihilation',
    description: 'Call down the wrath of the gods',
    weaponType: 'sword',
    damage: 6.0,
    cooldown: 20000,
    duration: 1500,
    animation: 'meteor_fall',
    color: '#ffdd00',
    trailColor: '#ffff88',
    sound: 'divineStrike',
    particleCount: 35,
    screenShake: 'crit',
    isMagic: true,
  },

  reapers_harvest: {
    id: 'reapers_harvest',
    abilityId: 'reapers_harvest',
    name: "Reaper's Harvest",
    description: 'Reap the souls of your enemies',
    weaponType: 'scythe',
    damage: 5.5,
    cooldown: 18000,
    duration: 1200,
    animation: 'slash_arc',
    color: '#6600aa',
    trailColor: '#330066',
    sound: 'reap',
    particleCount: 28,
    screenShake: 'crit',
  },

  glacial_sunder: {
    id: 'glacial_sunder',
    abilityId: 'glacial_sunder',
    name: 'Glacial Sunder',
    description: 'Freeze and shatter your foes with arctic fury',
    weaponType: 'sword',
    damage: 5.0,
    cooldown: 16000,
    duration: 1000,
    animation: 'ice_projectile',
    color: '#88ffff',
    trailColor: '#44aaff',
    sound: 'glacial',
    particleCount: 25,
    screenShake: 'heavy',
    isMagic: true,
  },

  starfall_smash: {
    id: 'starfall_smash',
    abilityId: 'starfall_smash',
    name: 'Starfall Smash',
    description: 'Bring down the fury of the cosmos',
    weaponType: 'mace',
    damage: 5.5,
    cooldown: 18000,
    duration: 1300,
    animation: 'meteor_fall',
    color: '#ffff00',
    trailColor: '#ffcc00',
    sound: 'starfall',
    particleCount: 30,
    screenShake: 'crit',
    isMagic: true,
  },

  maelstrom: {
    id: 'maelstrom',
    abilityId: 'maelstrom',
    name: 'Maelstrom',
    description: 'Unleash a devastating whirlpool of destruction',
    weaponType: 'trident',
    damage: 5.0,
    cooldown: 16000,
    duration: 1200,
    animation: 'nova_burst',
    color: '#0088ff',
    trailColor: '#0044aa',
    sound: 'maelstrom',
    particleCount: 28,
    screenShake: 'heavy',
    isMagic: true,
  },

  storm_cleaver: {
    id: 'storm_cleaver',
    abilityId: 'storm_cleaver',
    name: 'Storm Cleaver',
    description: 'Cleave through enemies with the power of thunder',
    weaponType: 'axe',
    damage: 5.0,
    cooldown: 15000,
    duration: 1000,
    animation: 'thunder_strike',
    color: '#88ddff',
    trailColor: '#4488ff',
    sound: 'stormCleave',
    particleCount: 22,
    screenShake: 'heavy',
  },

  hellfire_execution: {
    id: 'hellfire_execution',
    abilityId: 'hellfire_execution',
    name: 'Hellfire Execution',
    description: 'Execute your foe with infernal flames',
    weaponType: 'sword',
    damage: 6.0,
    cooldown: 20000,
    duration: 1400,
    animation: 'rage_swing',
    color: '#ff2200',
    trailColor: '#ff6600',
    sound: 'hellfire',
    particleCount: 32,
    screenShake: 'crit',
    isMagic: true,
  },

  mjolnir_strike: {
    id: 'mjolnir_strike',
    abilityId: 'mjolnir_strike',
    name: 'Mjolnir Strike',
    description: 'Call down the thunder of the gods',
    weaponType: 'hammer',
    damage: 4.5,
    cooldown: 14000,
    duration: 900,
    animation: 'thunder_strike',
    color: '#ffff00',
    trailColor: '#88ddff',
    sound: 'mjolnir',
    particleCount: 25,
    screenShake: 'heavy',
  },

  final_verdict: {
    id: 'final_verdict',
    abilityId: 'final_verdict',
    name: 'Final Verdict',
    description: 'Pass final judgment on your enemies',
    weaponType: 'axe',
    damage: 5.0,
    cooldown: 16000,
    duration: 1000,
    animation: 'overhead_cleave',
    color: '#cc0000',
    trailColor: '#660000',
    sound: 'verdict',
    particleCount: 22,
    screenShake: 'crit',
  },

  arcane_singularity: {
    id: 'arcane_singularity',
    abilityId: 'arcane_singularity',
    name: 'Arcane Singularity',
    description: 'Create a devastating singularity of pure magic',
    weaponType: 'staff',
    damage: 4.5,
    cooldown: 15000,
    duration: 1100,
    animation: 'charged_explosion',
    color: '#aa44ff',
    trailColor: '#6600cc',
    sound: 'singularity',
    particleCount: 28,
    screenShake: 'crit',
    isMagic: true,
  },

  soul_harvest: {
    id: 'soul_harvest',
    abilityId: 'soul_harvest',
    name: 'Soul Harvest',
    description: 'Drain the very essence of your enemies',
    weaponType: 'scepter',
    damage: 4.0,
    cooldown: 14000,
    duration: 1000,
    animation: 'life_drain',
    color: '#44ff44',
    trailColor: '#008800',
    sound: 'soulHarvest',
    particleCount: 20,
    screenShake: 'heavy',
    isMagic: true,
  },

  forbidden_knowledge: {
    id: 'forbidden_knowledge',
    abilityId: 'forbidden_knowledge',
    name: 'Forbidden Knowledge',
    description: 'Unleash dark secrets that devastate your foes',
    weaponType: 'tome',
    damage: 4.5,
    cooldown: 15000,
    duration: 1000,
    animation: 'dark_wave',
    color: '#6600aa',
    trailColor: '#330066',
    sound: 'forbidden',
    particleCount: 24,
    screenShake: 'heavy',
    isMagic: true,
  },

  berserkers_fury: {
    id: 'berserkers_fury',
    abilityId: 'berserkers_fury',
    name: "Berserker's Fury",
    description: 'Unleash unbridled rage upon your enemies',
    weaponType: 'hammer',
    damage: 4.5,
    cooldown: 14000,
    duration: 900,
    animation: 'rage_swing',
    color: '#ff0000',
    trailColor: '#ff6600',
    sound: 'berserkerFury',
    particleCount: 22,
    screenShake: 'heavy',
  },

  knights_honor: {
    id: 'knights_honor',
    abilityId: 'knights_honor',
    name: "Knight's Honor",
    description: 'Strike with the honor and might of a true knight',
    weaponType: 'sword',
    damage: 4.0,
    cooldown: 13000,
    duration: 800,
    animation: 'slash_arc',
    color: '#ffdd00',
    trailColor: '#ccaa00',
    sound: 'knightsHonor',
    particleCount: 20,
    screenShake: 'heavy',
  },

  elemental_blade_storm: {
    id: 'elemental_blade_storm',
    abilityId: 'elemental_blade_storm',
    name: 'Elemental Blade Storm',
    description: 'Summon the elements into a devastating blade storm',
    weaponType: 'sword',
    damage: 5.0,
    cooldown: 16000,
    duration: 1200,
    animation: 'multi_slash',
    color: '#ff44ff',
    trailColor: '#aa00aa',
    sound: 'bladeStorm',
    particleCount: 28,
    screenShake: 'crit',
    isMagic: true,
  },

  prismatic_cascade: {
    id: 'prismatic_cascade',
    abilityId: 'prismatic_cascade',
    name: 'Prismatic Cascade',
    description: 'Unleash a cascade of prismatic energy',
    weaponType: 'staff',
    damage: 4.5,
    cooldown: 15000,
    duration: 1000,
    animation: 'missile_barrage',
    color: '#ff88ff',
    trailColor: '#ff44ff',
    sound: 'prismatic',
    particleCount: 25,
    screenShake: 'heavy',
    isMagic: true,
  },

  // ========================================
  // BASIC WEAPON ATTACKS
  // Common, Uncommon, and Rare weapons
  // ========================================

  slash: {
    id: 'slash',
    abilityId: 'slash',
    name: 'Slash',
    description: 'A basic slashing attack',
    weaponType: 'sword',
    damage: 1.5,
    cooldown: 5000,
    duration: 400,
    animation: 'slash_arc',
    color: '#888888',
    trailColor: '#666666',
    sound: 'slash',
    particleCount: 6,
    screenShake: 'light',
  },

  horizontal_slash: {
    id: 'horizontal_slash',
    abilityId: 'horizontal_slash',
    name: 'Horizontal Slash',
    description: 'A wide horizontal slash',
    weaponType: 'sword',
    damage: 1.6,
    cooldown: 5000,
    duration: 400,
    animation: 'slash_arc',
    color: '#999999',
    trailColor: '#777777',
    sound: 'slash',
    particleCount: 7,
    screenShake: 'light',
  },

  vertical_slash: {
    id: 'vertical_slash',
    abilityId: 'vertical_slash',
    name: 'Vertical Slash',
    description: 'A powerful downward slash',
    weaponType: 'sword',
    damage: 1.7,
    cooldown: 5500,
    duration: 450,
    animation: 'overhead_cleave',
    color: '#aaaaaa',
    trailColor: '#888888',
    sound: 'slash',
    particleCount: 8,
    screenShake: 'normal',
  },

  diagonal_slash: {
    id: 'diagonal_slash',
    abilityId: 'diagonal_slash',
    name: 'Diagonal Slash',
    description: 'A swift diagonal cut',
    weaponType: 'sword',
    damage: 1.5,
    cooldown: 4500,
    duration: 350,
    animation: 'slash_arc',
    color: '#888888',
    trailColor: '#666666',
    sound: 'slash',
    particleCount: 6,
    screenShake: 'light',
  },

  rising_slash: {
    id: 'rising_slash',
    abilityId: 'rising_slash',
    name: 'Rising Slash',
    description: 'An upward cutting slash',
    weaponType: 'sword',
    damage: 1.6,
    cooldown: 5000,
    duration: 400,
    animation: 'slash_arc',
    color: '#999999',
    trailColor: '#777777',
    sound: 'slash',
    particleCount: 7,
    screenShake: 'light',
  },

  falling_slash: {
    id: 'falling_slash',
    abilityId: 'falling_slash',
    name: 'Falling Slash',
    description: 'A heavy downward slash',
    weaponType: 'sword',
    damage: 1.8,
    cooldown: 6000,
    duration: 500,
    animation: 'overhead_cleave',
    color: '#aaaaaa',
    trailColor: '#888888',
    sound: 'heavySlash',
    particleCount: 9,
    screenShake: 'normal',
  },

  x_slash: {
    id: 'x_slash',
    abilityId: 'x_slash',
    name: 'X-Slash',
    description: 'Cross slash in an X pattern',
    weaponType: 'sword',
    damage: 2.0,
    cooldown: 7000,
    duration: 600,
    animation: 'multi_slash',
    color: '#bbbbbb',
    trailColor: '#999999',
    sound: 'multiSlash',
    particleCount: 10,
    screenShake: 'normal',
  },

  double_slash: {
    id: 'double_slash',
    abilityId: 'double_slash',
    name: 'Double Slash',
    description: 'Two quick consecutive slashes',
    weaponType: 'sword',
    damage: 1.8,
    hits: 2,
    cooldown: 6000,
    duration: 500,
    animation: 'multi_slash',
    color: '#aaaaaa',
    trailColor: '#888888',
    sound: 'multiSlash',
    particleCount: 8,
    screenShake: 'normal',
  },

  triple_slash: {
    id: 'triple_slash',
    abilityId: 'triple_slash',
    name: 'Triple Slash',
    description: 'Three swift slashes',
    weaponType: 'sword',
    damage: 2.1,
    hits: 3,
    cooldown: 7000,
    duration: 600,
    animation: 'multi_slash',
    color: '#bbbbbb',
    trailColor: '#999999',
    sound: 'multiSlash',
    particleCount: 10,
    screenShake: 'normal',
  },

  thrust: {
    id: 'thrust',
    abilityId: 'thrust',
    name: 'Thrust',
    description: 'A direct piercing attack',
    weaponType: 'spear',
    damage: 1.6,
    cooldown: 5000,
    duration: 400,
    animation: 'precision_strike',
    color: '#888888',
    trailColor: '#666666',
    sound: 'thrust',
    particleCount: 6,
    screenShake: 'light',
  },

  quick_stab: {
    id: 'quick_stab',
    abilityId: 'quick_stab',
    name: 'Quick Stab',
    description: 'A fast stabbing attack',
    weaponType: 'dagger',
    damage: 1.4,
    cooldown: 4000,
    duration: 300,
    animation: 'precision_strike',
    color: '#888888',
    trailColor: '#666666',
    sound: 'stab',
    particleCount: 5,
    screenShake: 'light',
  },

  rapid_stab: {
    id: 'rapid_stab',
    abilityId: 'rapid_stab',
    name: 'Rapid Stab',
    description: 'Multiple quick stabs',
    weaponType: 'dagger',
    damage: 1.6,
    hits: 3,
    cooldown: 5500,
    duration: 450,
    animation: 'precision_strike',
    color: '#999999',
    trailColor: '#777777',
    sound: 'multiStab',
    particleCount: 8,
    screenShake: 'normal',
  },

  lunge: {
    id: 'lunge',
    abilityId: 'lunge',
    name: 'Lunge',
    description: 'A forward thrusting lunge',
    weaponType: 'sword',
    damage: 1.8,
    cooldown: 6000,
    duration: 500,
    animation: 'blink_strike',
    color: '#aaaaaa',
    trailColor: '#888888',
    sound: 'lunge',
    particleCount: 8,
    screenShake: 'normal',
  },

  cleave: {
    id: 'cleave',
    abilityId: 'cleave',
    name: 'Cleave',
    description: 'A powerful cleaving attack',
    weaponType: 'axe',
    damage: 2.0,
    cooldown: 7000,
    duration: 600,
    animation: 'overhead_cleave',
    color: '#bbbbbb',
    trailColor: '#999999',
    sound: 'cleave',
    particleCount: 10,
    screenShake: 'normal',
  },
};

// Animation configurations for each ability type
export const ABILITY_ANIMATIONS = {
  // Slash animations
  slash_arc: {
    type: 'slash',
    keyframes: [
      { rotate: -90, scale: 0.5, opacity: 0 },
      { rotate: 0, scale: 1.2, opacity: 1 },
      { rotate: 90, scale: 1, opacity: 0 },
    ],
    duration: 500,
    trail: {
      count: 8,
      fadeDelay: 50,
      fadeTime: 200,
    },
  },

  multi_slash: {
    type: 'multi_hit',
    keyframes: [
      { rotate: -45, scale: 1, opacity: 1 },
      { rotate: 45, scale: 1.1, opacity: 1 },
      { rotate: -45, scale: 1, opacity: 1 },
      { rotate: 45, scale: 1.1, opacity: 0 },
    ],
    duration: 800,
    hitCount: 4,
    hitDelay: 150,
  },

  // Blink/teleport animations
  blink_strike: {
    type: 'blink',
    phases: [
      { type: 'fadeOut', duration: 100, particles: 'shadow' },
      { type: 'invisible', duration: 200 },
      { type: 'fadeIn', duration: 100, particles: 'shadow' },
      { type: 'strike', duration: 200, scale: 1.5 },
    ],
    afterimages: {
      count: 3,
      opacity: [0.6, 0.4, 0.2],
      offset: 20,
    },
  },

  precision_strike: {
    type: 'precision',
    keyframes: [
      { scale: 0.8, x: -50, opacity: 0 },
      { scale: 1.3, x: 0, opacity: 1 },
      { scale: 1, x: 20, opacity: 0 },
    ],
    duration: 400,
    focusRing: true,
  },

  // Heavy attack animations
  overhead_cleave: {
    type: 'overhead',
    keyframes: [
      { y: -80, rotate: -180, scale: 1.5, opacity: 0.5 },
      { y: 0, rotate: 0, scale: 1.3, opacity: 1 },
      { y: 20, rotate: 30, scale: 1, opacity: 0 },
    ],
    duration: 600,
    impactEffect: 'crack',
    dustParticles: 10,
  },

  rage_swing: {
    type: 'rage',
    keyframes: [
      { rotate: -270, scale: 1.8, opacity: 0.8 },
      { rotate: 0, scale: 2, opacity: 1 },
      { rotate: 90, scale: 1.5, opacity: 0 },
    ],
    duration: 700,
    auraEffect: 'fire',
    screenFlash: '#ff0000',
  },

  ground_slam: {
    type: 'slam',
    keyframes: [
      { y: -100, scale: 1.5, opacity: 1 },
      { y: 0, scale: 2, opacity: 1 },
      { y: 10, scale: 1.8, opacity: 0 },
    ],
    duration: 800,
    shockwaves: [
      { delay: 0, radius: 60, opacity: 1 },
      { delay: 100, radius: 100, opacity: 0.7 },
      { delay: 200, radius: 140, opacity: 0.4 },
    ],
    cracks: {
      count: 8,
      length: 80,
      spreadAngle: 360,
    },
  },

  thunder_strike: {
    type: 'thunder',
    keyframes: [
      { y: -60, scale: 1.3, opacity: 0.8 },
      { y: 0, scale: 1.5, opacity: 1 },
    ],
    duration: 600,
    lightning: {
      bolts: 3,
      branchCount: 2,
      color: '#88ddff',
    },
  },

  // Magic animations
  nova_burst: {
    type: 'nova',
    keyframes: [
      { scale: 0.1, opacity: 0 },
      { scale: 0.5, opacity: 1 },
      { scale: 2, opacity: 0 },
    ],
    duration: 600,
    rings: {
      count: 3,
      expandDelay: 100,
    },
    innerGlow: {
      size: 40,
      pulses: 2,
    },
  },

  missile_barrage: {
    type: 'barrage',
    missile: {
      size: 12,
      trailLength: 8,
      homing: true,
    },
    count: 5,
    spread: 45,
    staggerDelay: 150,
    duration: 1000,
  },

  lightning_chain: {
    type: 'chain',
    bolt: {
      width: 4,
      segments: 8,
      jitter: 15,
    },
    bounces: 3,
    bounceDelay: 100,
    duration: 500,
    sparkParticles: 6,
  },

  ice_projectile: {
    type: 'projectile',
    shape: 'shard',
    keyframes: [
      { x: 0, scale: 1, rotation: 0 },
      { x: 200, scale: 0.8, rotation: 720 },
    ],
    duration: 400,
    trail: {
      type: 'ice',
      particles: 12,
    },
    impactFreeze: true,
  },

  life_drain: {
    type: 'drain',
    tendrils: {
      count: 5,
      curveAmount: 30,
      pulseCount: 3,
    },
    particles: {
      type: 'soul',
      count: 12,
      returnToPlayer: true,
    },
    duration: 800,
  },

  dark_wave: {
    type: 'wave',
    keyframes: [
      { scale: 0.1, opacity: 0.8 },
      { scale: 1.5, opacity: 0.6 },
      { scale: 2.5, opacity: 0 },
    ],
    duration: 500,
    distortion: true,
    innerDarkness: {
      radius: 60,
      fade: true,
    },
  },

  meteor_fall: {
    type: 'summon',
    phases: [
      {
        name: 'warning',
        duration: 400,
        targetCircle: { radius: 80, pulses: 2 },
      },
      {
        name: 'fall',
        duration: 400,
        startY: -300,
        rotation: 720,
        trail: { type: 'fire', length: 120 },
      },
      {
        name: 'impact',
        duration: 400,
        explosion: { radius: 180, rings: 3 },
        crater: true,
        debris: 15,
      },
    ],
  },

  charged_explosion: {
    type: 'charged',
    phases: [
      {
        name: 'charge',
        duration: 500,
        spiral: { rotations: 3, particles: 20 },
        glow: { grow: true, maxScale: 1.5 },
      },
      {
        name: 'release',
        duration: 400,
        explosion: { radius: 160, rings: 4 },
        shockwave: true,
      },
    ],
  },
};

// Screen shake intensity configurations
export const SHAKE_INTENSITIES = {
  light: { x: 3, y: 2, duration: 150 },
  normal: { x: 8, y: 5, duration: 250 },
  heavy: { x: 15, y: 10, duration: 350 },
  crit: { x: 25, y: 15, duration: 500 },
};

// Helper function to get ability for a weapon
// IMPORTANT: Must pass equipmentDatabase explicitly to avoid circular dependency
// (equipmentDatabase.js imports ABILITY_TYPES from this file)
export function getWeaponAbility(weaponId, equipmentDatabase) {
  if (!equipmentDatabase || !weaponId) return null;

  const weapon = equipmentDatabase[weaponId];
  if (!weapon?.ability) return null;

  // If ability is a string reference, look it up
  if (typeof weapon.ability === 'string') {
    return ABILITY_TYPES[weapon.ability] || null;
  }

  // If ability is an object, return it directly
  return weapon.ability;
}

// Get animation config for an ability
export function getAbilityAnimation(abilityId) {
  const ability = ABILITY_TYPES[abilityId];
  if (!ability) return null;

  return ABILITY_ANIMATIONS[ability.animation] || null;
}

// Calculate ability damage
export function calculateAbilityDamage(ability, baseDamage, isCrit = false) {
  let damage = baseDamage * ability.damage;

  if (ability.guaranteedCrit || isCrit) {
    damage *= 1.5;
  }

  if (ability.hits) {
    // For multi-hit abilities, return damage per hit
    return Math.floor(damage / ability.hits);
  }

  return Math.floor(damage);
}

// Get ability cooldown progress (0-1)
export function getAbilityCooldownProgress(lastUsed, cooldown) {
  if (!lastUsed) return 1;

  const elapsed = Date.now() - lastUsed;
  return Math.min(1, elapsed / cooldown);
}

// Check if ability is ready
export function isAbilityReady(lastUsed, cooldown) {
  if (!lastUsed) return true;
  return Date.now() - lastUsed >= cooldown;
}

export default ABILITY_TYPES;
