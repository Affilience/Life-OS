/**
 * Combat Sounds System
 * Uses ZZFX for procedural sound generation
 * Each ability has a unique sound profile
 *
 * ZZFX Parameters (20 total):
 * [volume, randomness, frequency, attack, sustain, release, shape, shapeCurve,
 *  slide, deltaSlide, pitchJump, pitchJumpTime, repeatTime, noise, modulation,
 *  bitCrush, delay, sustainVolume, decay, tremolo]
 */

import { zzfx } from 'zzfx';

// Master volume control
let masterVolume = 0.5;
let soundsEnabled = true;

export function setMasterVolume(vol) {
  masterVolume = Math.max(0, Math.min(1, vol));
}

export function setSoundsEnabled(enabled) {
  soundsEnabled = enabled;
}

// Helper to play sound with volume scaling
function play(params) {
  if (!soundsEnabled) return;
  const scaled = [...params];
  scaled[0] = (scaled[0] || 1) * masterVolume;
  zzfx(...scaled);
}

// ============================================================================
// WEAPON ABILITIES (23 unique sounds)
// ============================================================================

export const weaponAbilitySounds = {
  // === SWORD ABILITIES ===

  /** Power Slash - Heavy devastating swing */
  power_slash: () => play([.8,,150,.02,.15,.4,2,1.8,-8,,,,,1.2,,.1,,.6,.08]),

  /** Blade Dance - Quick multi-hit flurry */
  blade_dance: () => {
    play([.3,,400,.01,.05,.1,1,.5,10,,,,.05,,,.2,,.3,.02]);
    setTimeout(() => play([.3,,450,.01,.05,.1,1,.5,15,,,,.05,,,.2,,.3,.02]), 120);
    setTimeout(() => play([.3,,500,.01,.05,.1,1,.5,20,,,,.05,,,.2,,.3,.02]), 240);
    setTimeout(() => play([.4,,550,.01,.08,.15,1,.8,25,,,,.05,,,.2,,.4,.03]), 360);
  },

  // === DAGGER ABILITIES ===

  /** Shadow Strike - Vanish and precise hit */
  shadow_strike: () => {
    // Whoosh vanish
    play([.2,,800,.01,.05,.2,3,2,50,,,,,,,.5,,.2,.01]);
    // Sharp strike
    setTimeout(() => play([.7,,300,.01,.02,.1,1,2,-20,,,,,2,,,.1,.5,.02]), 180);
  },

  /** Assassinate - Lethal precision strike */
  assassinate: () => play([.9,,200,.01,.02,.15,1,2.5,-30,,50,.02,,,,,,.7,.01]),

  // === AXE ABILITIES ===

  /** Cleaving Blow - Brutal overhead strike with bleed */
  cleaving_blow: () => play([1,,80,.03,.2,.5,4,1.5,-3,,,,,1.8,.1,.2,,.8,.1]),

  /** Berserker Rage - Enraged massive swing */
  berserker_rage: () => {
    // Rage buildup
    play([.4,,60,.1,.1,.3,0,1,5,2,,,,,,,,.4,.05]);
    // Devastating hit
    setTimeout(() => play([1.2,,50,.02,.25,.6,4,2,-5,,,,,2.5,.2,.1,,.9,.15]), 200);
  },

  // === HAMMER ABILITIES ===

  /** Earthshatter - Ground slam with stun */
  earthshatter: () => {
    // Impact
    play([1.2,,40,.02,.3,.7,4,1,-2,,,,,3,.3,.05,,.95,.2]);
    // Shockwave rumble
    setTimeout(() => play([.5,,25,.05,.4,.5,0,0,2,1,,,,,,.1,,.6,.15]), 100);
    setTimeout(() => play([.3,,20,.05,.3,.4,0,0,1,.5,,,,,,.1,,.4,.1]), 250);
  },

  /** Thunderous Blow - Lightning-charged hammer */
  thunderous_blow: () => {
    // Thunder crack
    play([.8,,600,.01,.02,.2,3,3,30,-20,,,,,,1,,.4,.02]);
    // Deep boom
    setTimeout(() => play([.9,,60,.02,.15,.4,4,1,-5,,,,,2,,.1,,.7,.1]), 50);
  },

  // === STAFF ABILITIES ===

  /** Arcane Nova - Burst of arcane energy */
  arcane_nova: () => {
    // Charge up
    play([.3,,300,.1,.05,.1,2,0,20,5,100,.1,,,,,,.3,.05]);
    // Release burst
    setTimeout(() => play([.8,,150,.01,.2,.4,2,2,-10,-2,50,.1,,,,.2,,.6,.1]), 180);
  },

  /** Arcane Barrage - Multiple missiles */
  arcane_barrage: () => {
    const delays = [0, 120, 240, 360, 480];
    delays.forEach((delay, i) => {
      setTimeout(() => play([.35,,500 + i*50,.01,.05,.12,2,1,30 + i*5,,,,.02,,,.3,,.35,.02]), delay);
    });
  },

  // === WAND ABILITIES ===

  /** Chain Lightning - Arcing electricity */
  chain_lightning: () => {
    play([.5,,700,.01,.03,.15,3,3,40,-30,,,,,,1,,.5,.02]);
    setTimeout(() => play([.4,,800,.01,.02,.12,3,3,50,-35,,,,,,1,,.4,.02]), 80);
    setTimeout(() => play([.3,,900,.01,.02,.1,3,3,60,-40,,,,,,1,,.3,.02]), 160);
  },

  /** Frost Bolt - Freezing projectile */
  frost_bolt: () => {
    // Icy launch
    play([.4,,1200,.01,.08,.2,2,1,20,-10,100,.05,,,,,,.4,.03]);
    // Freeze impact
    setTimeout(() => play([.5,,2000,.01,.05,.15,1,0,-30,,200,.08,,,,.5,,.5,.02]), 250);
  },

  // === SCEPTER ABILITIES ===

  /** Soul Drain - Life force extraction */
  soul_drain: () => {
    // Ethereal draw
    play([.3,,200,.05,.3,.5,2,0,10,5,50,.1,.15,,,,.1,.4,.1]);
    // Life absorbed
    setTimeout(() => play([.4,,400,.02,.1,.2,1,0,20,10,100,.05,,,,,,.35,.05]), 400);
  },

  /** Dark Pulse - Corrupting wave */
  dark_pulse: () => {
    // Dark charge
    play([.4,,80,.05,.1,.2,0,0,-5,2,,,,,,,,.3,.05]);
    // Pulse release
    setTimeout(() => play([.7,,100,.01,.15,.35,4,2,-8,-3,,,,,,.3,,.6,.1]), 150);
  },

  // === TOME ABILITIES ===

  /** Meteor - Devastating sky strike */
  meteor: () => {
    // Whistling descent
    play([.3,,1500,.2,.3,.1,3,0,-80,-20,,,,,,,,.3,.1]);
    // Massive explosion
    setTimeout(() => play([1.5,,30,.02,.4,.8,4,1,-2,,,,,4,.5,.05,,.95,.25]), 500);
    // Debris
    setTimeout(() => play([.4,,200,.02,.2,.3,3,1,10,5,,,,,,.2,,.4,.1]), 600);
  },

  /** Arcane Explosion - Charged detonation */
  arcane_explosion: () => {
    // Spiral charge
    play([.3,,400,.15,.2,.1,2,0,30,15,200,.05,,,,,,.3,.08]);
    // Explosion
    setTimeout(() => play([1,,100,.01,.25,.5,4,2,-10,-5,50,.1,,,,.3,,.8,.15]), 400);
  },
};

// ============================================================================
// ELEMENTAL SKILL ABILITIES (50+ sounds organized by element)
// ============================================================================

export const elementalSounds = {
  // === FIRE ELEMENT ===

  fire_burst: () => play([.6,,120,.02,.12,.3,4,1.5,-8,,,,,1.5,,.15,,.55,.08]),

  dragon_roar: () => {
    play([.5,,50,.1,.3,.5,0,1,3,1,,,,,,,,.45,.15]);
    setTimeout(() => play([.7,,80,.05,.25,.4,4,1.2,5,2,,,,,,.1,,.6,.12]), 150);
  },

  inferno_blast: () => {
    play([.4,,100,.03,.1,.2,4,1,-5,,,,,1,,.1,,.4,.05]);
    setTimeout(() => play([.8,,60,.02,.2,.45,4,1.5,-8,,,,,2,.2,.1,,.7,.12]), 100);
  },

  flame_wave: () => play([.5,,90,.05,.2,.4,4,1,-6,1,,,,,,.15,,.5,.1]),

  blazing_fury: () => {
    play([.3,,70,.02,.08,.15,4,1,-3,,,,,1,,.1,,.3,.04]);
    setTimeout(() => play([.5,,80,.02,.1,.2,4,1,-5,,,,,1.5,,.1,,.45,.06]), 80);
    setTimeout(() => play([.8,,60,.02,.2,.4,4,1.5,-8,,,,,2,.15,.1,,.7,.1]), 180);
  },

  phoenix_flame: () => {
    play([.4,,200,.05,.15,.3,2,1,15,5,100,.05,,,,,,.4,.08]);
    setTimeout(() => play([.7,,150,.02,.2,.4,4,1.2,-10,,,,,1.8,.1,.1,,.65,.1]), 200);
  },

  // === ICE ELEMENT ===

  ice_shatter: () => {
    play([.5,,2200,.01,.05,.15,1,0,-30,,300,.05,,,,.4,,.45,.03]);
    setTimeout(() => play([.4,,100,.01,.08,.2,4,1,-5,,,,,1,,.1,,.4,.05]), 80);
  },

  frost_crack: () => play([.5,,1500,.01,.08,.2,1,0,-25,,200,.04,,,,,,.45,.04]),

  blizzard: () => {
    const sounds = [0, 100, 200, 300, 400];
    sounds.forEach(delay => {
      setTimeout(() => play([.25,,1800 + Math.random()*400,.01,.04,.1,3,1,20 + Math.random()*20,-10,,,,,,.3,,.25,.02]), delay);
    });
  },

  glacial_spike: () => {
    play([.4,,1000,.02,.1,.2,1,0,30,-15,150,.05,,,,,,.4,.05]);
    setTimeout(() => play([.6,,80,.01,.08,.15,4,1,-8,,,,,1.2,,.1,,.5,.04]), 150);
  },

  frozen_tomb: () => {
    play([.3,,800,.1,.2,.3,1,0,15,-10,100,.1,,,,,,.35,.08]);
    setTimeout(() => play([.6,,1500,.01,.05,.15,1,0,-40,,250,.05,,,,.5,,.5,.03]), 350);
  },

  absolute_zero: () => {
    play([.4,,2500,.05,.15,.25,1,0,-50,,500,.1,,,,.6,,.4,.08]);
    setTimeout(() => play([.8,,50,.02,.2,.5,4,0,-3,,,,,2,,.05,,.75,.15]), 300);
  },

  // === LIGHTNING ELEMENT ===

  thunder_crash: () => {
    play([.9,,800,.01,.02,.25,3,3,60,-40,,,,,,1.5,,.6,.03]);
    setTimeout(() => play([.6,,50,.02,.15,.4,4,1,-5,,,,,1.5,,.1,,.55,.1]), 60);
  },

  electric_zap: () => play([.5,,900,.01,.02,.12,3,3,50,-35,,,,,,1.2,,.45,.02]),

  lightning_strike: () => {
    play([1,,1000,.01,.01,.2,3,3,80,-50,,,,,,2,,.7,.02]);
    setTimeout(() => play([.7,,40,.02,.2,.5,4,1,-3,,,,,2,.2,.1,,.65,.12]), 40);
  },

  storm_surge: () => {
    play([.4,,700,.01,.03,.15,3,2,40,-25,,,,,,1,,.4,.02]);
    setTimeout(() => play([.5,,750,.01,.03,.15,3,2,45,-28,,,,,,1,,.45,.02]), 100);
    setTimeout(() => play([.6,,800,.01,.03,.15,3,2,50,-30,,,,,,1,,.5,.02]), 200);
  },

  static_discharge: () => {
    const zaps = [0, 50, 100, 150];
    zaps.forEach(delay => {
      setTimeout(() => play([.3,,600 + Math.random()*300,.01,.02,.08,3,2,30 + Math.random()*20,-20,,,,,,1,,.3,.01]), delay);
    });
  },

  thundergod_wrath: () => {
    play([.5,,1200,.01,.01,.15,3,3,100,-60,,,,,,2,,.5,.02]);
    setTimeout(() => play([1.2,,30,.02,.3,.7,4,1.5,-3,,,,,3,.4,.1,,.9,.2]), 50);
  },

  // === WATER ELEMENT ===

  water_splash: () => play([.4,,300,.02,.1,.25,3,0,20,-10,,,,.5,,,,.4,.06]),

  wave_crash: () => {
    play([.3,,150,.05,.15,.3,3,0,10,-5,,,,.3,,,,.35,.08]);
    setTimeout(() => play([.6,,80,.02,.2,.4,3,0,-8,-3,,,,.5,,,,.55,.1]), 180);
  },

  tidal_surge: () => {
    play([.4,,100,.08,.2,.4,3,0,5,-3,,,,.4,,,,.4,.1]);
    setTimeout(() => play([.5,,120,.05,.15,.3,3,0,8,-4,,,,.3,,,,.45,.08]), 200);
    setTimeout(() => play([.6,,80,.02,.15,.35,3,0,-6,-2,,,,.5,,,,.55,.1]), 400);
  },

  whirlpool: () => {
    play([.3,,200,.1,.3,.5,2,0,15,8,50,.1,,,,,,.35,.12]);
  },

  tsunami: () => {
    play([.4,,60,.15,.3,.5,3,0,5,2,,,,.4,,,,.4,.15]);
    setTimeout(() => play([.8,,40,.05,.35,.6,4,0,-5,-2,,,,.6,,,,.75,.2]), 400);
  },

  // === VOID/DARK ELEMENT ===

  void_portal: () => {
    play([.4,,150,.1,.2,.4,2,0,-10,5,80,.1,,,,,,.4,.1]);
    setTimeout(() => play([.3,,200,.05,.15,.3,0,0,15,8,,,,,,,,.3,.08]), 250);
  },

  dark_pulse: () => {
    play([.5,,80,.03,.12,.3,4,2,-6,-2,,,,,,.2,,.5,.08]);
  },

  shadow_bolt: () => play([.5,,200,.02,.1,.2,2,1,-15,5,50,.05,,,,,,.45,.05]),

  oblivion: () => {
    play([.4,,50,.1,.25,.5,0,0,-3,1,,,,,,,,.4,.15]);
    setTimeout(() => play([.7,,30,.05,.3,.6,4,1,-2,,,,,2,.2,.05,,.65,.18]), 350);
  },

  nightmare_grasp: () => {
    play([.3,,120,.08,.2,.4,2,0,10,5,40,.1,,,,,,.35,.1]);
    setTimeout(() => play([.5,,80,.02,.1,.25,4,1,-8,-3,,,,,,.15,,.45,.06]), 300);
  },

  void_rupture: () => {
    play([.5,,60,.05,.15,.35,4,2,-5,-2,,,,,,.2,,.5,.1]);
    setTimeout(() => play([.3,,200,.02,.08,.2,2,0,20,10,100,.05,,,,,,.3,.05]), 200);
  },

  /** Black Hole - Deep gravitational sucking sound */
  black_hole: () => {
    // Initial sucking whoosh (reverse pitch = gravitational pull)
    play([.6,,200,.15,.4,.8,0,0,15,8,,,,,,,,.5,.2]);
    // Deep rumbling undertone
    setTimeout(() => play([.5,,30,.1,.5,1,0,0,-2,1,,,,,,.05,,.45,.25]), 100);
    // Intensifying pull
    setTimeout(() => play([.4,,50,.08,.3,.6,0,0,10,5,,,,,,,,.4,.18]), 400);
  },

  /** Black Hole Collapse - Massive implosion then explosion */
  black_hole_collapse: () => {
    // Implosion (everything sucked in)
    play([.7,,100,.02,.1,.2,4,2,20,15,,,,,,.3,,.6,.06]);
    // Massive detonation
    setTimeout(() => play([1.2,,25,.02,.35,.8,4,1,-3,,,,,3.5,.4,.05,,.95,.25]), 80);
    // Shockwave ripple
    setTimeout(() => play([.5,,40,.03,.25,.5,0,0,-2,.5,,,,,,.08,,.5,.15]), 200);
  },

  // === HOLY/LIGHT ELEMENT ===

  holy_light: () => play([.5,,600,.03,.15,.3,1,0,15,5,200,.1,,,,,,.5,.08]),

  divine_smite: () => {
    play([.4,,800,.02,.1,.2,1,0,20,10,300,.05,,,,,,.4,.05]);
    setTimeout(() => play([.8,,100,.01,.2,.4,4,1,-10,,,,,1.5,.1,.1,,.7,.1]), 180);
  },

  radiant_burst: () => {
    play([.5,,700,.03,.12,.25,1,0,25,12,250,.08,,,,,,.5,.07]);
    setTimeout(() => play([.3,,900,.02,.08,.15,1,0,30,15,350,.05,,,,,,.35,.04]), 150);
  },

  celestial_beam: () => {
    play([.4,,1000,.05,.2,.35,1,0,20,8,400,.1,,,,,,.45,.1]);
  },

  angelic_chorus: () => {
    play([.3,,500,.1,.25,.4,1,0,10,5,150,.15,,,,,,.35,.12]);
    setTimeout(() => play([.35,,600,.08,.2,.35,1,0,12,6,180,.12,,,,,,.38,.1]), 200);
    setTimeout(() => play([.4,,700,.06,.15,.3,1,0,15,7,200,.1,,,,,,.42,.08]), 400);
  },

  judgment: () => {
    play([.5,,1200,.03,.1,.2,1,0,30,15,500,.08,,,,,,.5,.06]);
    setTimeout(() => play([1,,60,.02,.25,.5,4,1,-8,,,,,2.5,.2,.1,,.85,.15]), 250);
  },

  // === EARTH ELEMENT ===

  earth_rumble: () => play([.7,,40,.03,.2,.5,4,0,-2,1,,,,,,.1,,.65,.12]),

  rock_throw: () => {
    play([.4,,200,.02,.08,.15,4,1,15,-8,,,,,,,,.4,.04]);
    setTimeout(() => play([.6,,60,.01,.1,.25,4,1,-5,,,,,1.2,,.1,,.55,.06]), 200);
  },

  earthquake: () => {
    play([.5,,30,.05,.3,.6,4,0,-1,.5,,,,,,.05,,.5,.18]);
    setTimeout(() => play([.6,,25,.04,.25,.5,4,0,-1,.5,,,,,,.05,,.55,.15]), 200);
    setTimeout(() => play([.4,,35,.03,.2,.4,4,0,-1,.5,,,,,,.05,,.45,.12]), 400);
  },

  stone_wall: () => {
    play([.5,,80,.03,.15,.3,4,1,8,-5,,,,,,.1,,.5,.08]);
    setTimeout(() => play([.4,,100,.02,.1,.2,4,1,5,-3,,,,,,,,.4,.05]), 150);
  },

  meteor_shower: () => {
    const impacts = [0, 200, 400, 600, 800];
    impacts.forEach((delay, i) => {
      setTimeout(() => {
        play([.4 + i*.1,,1000 - i*150,.08,.1,.05,3,0,-40 - i*5,-15,,,,,,,,.35 + i*.05,.03]);
        setTimeout(() => play([.5 + i*.1,,50 - i*5,.02,.15,.3,4,1,-4,,,,,1.5,,.1,,.5 + i*.05,.08]), 150);
      }, delay);
    });
  },

  tectonic_slam: () => {
    play([1,,35,.02,.25,.6,4,1,-3,,,,,2.5,.3,.05,,.9,.18]);
    setTimeout(() => play([.5,,50,.03,.2,.4,4,0,-2,.5,,,,,,.08,,.5,.12]), 150);
  },

  // === NATURE ELEMENT ===

  nature_burst: () => play([.4,,400,.03,.12,.25,2,0,20,8,150,.08,,,,,,.4,.07]),

  vine_whip: () => play([.5,,300,.01,.06,.15,3,1,25,-15,,,,,,,,.45,.04]),

  thorn_spray: () => {
    const thorns = [0, 60, 120, 180, 240];
    thorns.forEach(delay => {
      setTimeout(() => play([.25,,500 + Math.random()*200,.01,.03,.08,3,1,20,-12,,,,,,,,.25,.02]), delay);
    });
  },

  healing_bloom: () => {
    play([.3,,500,.05,.15,.3,1,0,15,5,200,.1,,,,,,.35,.08]);
    setTimeout(() => play([.4,,600,.03,.1,.2,1,0,20,8,250,.08,,,,,,.4,.06]), 200);
  },

  forest_rage: () => {
    play([.4,,150,.05,.15,.3,2,1,10,-5,80,.08,,,,,,.4,.08]);
    setTimeout(() => play([.6,,100,.02,.2,.4,4,1,-8,-3,,,,,1.5,.1,.1,,.55,.1]), 250);
  },

  // === ARCANE ELEMENT ===

  arcane_pulse: () => play([.5,,350,.02,.1,.2,2,1,15,8,120,.06,,,,,,.5,.05]),

  mana_burst: () => {
    play([.4,,400,.03,.08,.15,2,0,20,10,150,.05,,,,,,.4,.04]);
    setTimeout(() => play([.6,,250,.01,.12,.25,2,1,-10,-5,80,.08,,,,,,.55,.06]), 120);
  },

  mystic_orb: () => play([.4,,300,.05,.15,.3,2,0,18,8,100,.1,,,,,,.4,.08]),

  reality_warp: () => {
    play([.3,,500,.1,.2,.35,2,0,30,15,200,.15,,,,,,.35,.1]);
    setTimeout(() => play([.5,,200,.02,.1,.2,2,1,-15,-8,50,.05,,,,,,.45,.05]), 350);
  },

  arcane_torrent: () => {
    const blasts = [0, 80, 160, 240, 320, 400];
    blasts.forEach((delay, i) => {
      setTimeout(() => play([.3 + i*.05,,300 + i*30,.01,.05,.1,2,1,20 + i*3,10,100,.04,,,,,,.3 + i*.03,.02]), delay);
    });
  },

  // === TIME ELEMENT ===

  time_warp: () => {
    play([.4,,600,.08,.2,.4,2,0,25,12,200,.15,,,,,,.4,.1]);
  },

  temporal_shift: () => {
    play([.3,,800,.05,.1,.2,2,0,35,18,300,.1,,,,,,.35,.06]);
    setTimeout(() => play([.4,,400,.03,.08,.15,2,0,-20,-10,150,.05,,,,,,.4,.04]), 200);
  },

  chrono_freeze: () => {
    play([.5,,1000,.03,.15,.3,1,0,40,20,400,.12,,,,.3,,.5,.08]);
  },

  rewind: () => {
    play([.4,,500,.1,.15,.25,2,0,-30,-15,200,.12,,,,,,.4,.08]);
  },

  time_stop: () => {
    play([.6,,1200,.05,.2,.4,1,0,50,25,500,.18,,,,.4,,.55,.12]);
    setTimeout(() => play([.3,,100,.02,.1,.2,0,0,5,2,,,,,,,,.3,.05]), 400);
  },
};

// ============================================================================
// WEAPON ATTACK SOUNDS (Basic attacks)
// ============================================================================

export const weaponAttackSounds = {
  // === SLASH ATTACKS ===
  slash: () => play([.4,,300,.01,.05,.12,1,1.5,-15,,,,,,,,.1,.4,.03]),
  horizontal_slash: () => play([.45,,280,.01,.06,.14,1,1.6,-18,,,,,,,,.1,.42,.03]),
  vertical_slash: () => play([.5,,260,.01,.07,.15,1,1.7,-20,,,,,,,,.12,.45,.04]),
  diagonal_slash: () => play([.42,,290,.01,.055,.13,1,1.55,-16,,,,,,,,.1,.41,.03]),
  rising_slash: () => play([.48,,320,.01,.06,.14,1,1.8,15,,,,,,,,.11,.44,.03]),
  falling_slash: () => play([.52,,240,.01,.08,.16,1,1.6,-25,,,,,,,,.12,.48,.04]),
  x_slash: () => {
    play([.4,,300,.01,.05,.12,1,1.5,-15,,,,,,,,.1,.4,.03]);
    setTimeout(() => play([.45,,280,.01,.06,.14,1,1.6,18,,,,,,,,.1,.42,.03]), 100);
  },
  double_slash: () => {
    play([.4,,300,.01,.05,.1,1,1.5,-15,,,,,,,,.1,.38,.03]);
    setTimeout(() => play([.45,,320,.01,.06,.12,1,1.6,-18,,,,,,,,.1,.42,.03]), 120);
  },
  triple_slash: () => {
    play([.35,,300,.01,.04,.08,1,1.5,-15,,,,,,,,.08,.35,.02]);
    setTimeout(() => play([.4,,320,.01,.05,.1,1,1.6,-18,,,,,,,,.09,.38,.03]), 100);
    setTimeout(() => play([.5,,280,.01,.07,.14,1,1.7,-22,,,,,1,,.1,,.45,.04]), 200);
  },

  // === SWORD ATTACKS ===
  sword_slash: () => play([.4,,300,.01,.05,.12,1,1.5,-15,,,,,,,,.1,.4,.03]),
  sword_thrust: () => play([.5,,350,.01,.03,.1,1,2,-20,,,,,1,,,,.45,.02]),
  sword_heavy: () => play([.6,,200,.02,.1,.2,2,1.5,-10,,,,,1.2,,.1,,.55,.05]),

  // === THRUST/PIERCE ATTACKS ===
  thrust: () => play([.5,,350,.01,.03,.1,1,2,-20,,,,,1,,,,.45,.02]),
  quick_stab: () => play([.35,,400,.01,.02,.06,1,2.2,-28,,,,,,,,.08,.32,.02]),
  rapid_stab: () => {
    const delays = [0, 60, 120, 180];
    delays.forEach((d, i) => setTimeout(() => play([.3,,420 + i*20,.01,.02,.05,1,2,-25,,,,,,,,.07,.28,.01]), d));
  },
  lunge: () => {
    play([.3,,500,.01,.02,.08,3,1,30,-20,,,,,,,,.3,.02]);
    setTimeout(() => play([.55,,350,.01,.04,.1,1,2.2,-22,,,,,1.2,,,,.5,.03]), 120);
  },

  // === DAGGER ATTACKS ===
  dagger_stab: () => play([.35,,450,.01,.02,.08,1,2,-25,,,,,,,,.1,.35,.02]),
  dagger_slice: () => play([.3,,400,.01,.03,.1,1,1.8,-18,,,,,,,,.08,.32,.02]),

  // === HEAVY ATTACKS ===
  smash: () => play([.9,,50,.02,.18,.4,4,1,-3,,,,,2,,.1,,.85,.1]),
  heavy_strike: () => play([.75,,80,.02,.15,.35,4,1.3,-5,,,,,1.8,,.12,,.72,.08]),
  overhead_slam: () => {
    play([.4,,150,.05,.1,.15,3,0,-20,-10,,,,,,,,.4,.05]);
    setTimeout(() => play([.95,,40,.02,.2,.45,4,1,-3,,,,,2.2,.15,.1,,.9,.12]), 180);
  },
  ground_pound: () => {
    play([1,,35,.02,.25,.5,4,1,-2,,,,,2.5,.2,.08,,.95,.15]);
    setTimeout(() => play([.5,,50,.03,.2,.4,0,0,2,.5,,,,,,.08,,.5,.1]), 120);
  },

  // === AXE ATTACKS ===
  axe_chop: () => play([.7,,100,.02,.12,.25,4,1.5,-6,,,,,1.5,,.12,,.65,.06]),
  axe_cleave: () => play([.8,,80,.02,.15,.3,4,1.8,-5,,,,,1.8,,.15,,.72,.08]),
  cleave: () => play([.8,,80,.02,.15,.3,4,1.8,-5,,,,,1.8,,.15,,.72,.08]),

  // === HAMMER ATTACKS ===
  hammer_smash: () => play([.9,,50,.02,.18,.4,4,1,-3,,,,,2,,.1,,.85,.1]),
  hammer_pound: () => play([.75,,60,.02,.15,.35,4,1.2,-4,,,,,1.6,,.1,,.7,.08]),

  // === STAFF ATTACKS ===
  staff_strike: () => play([.4,,250,.02,.08,.15,2,0,12,5,80,.05,,,,,,.4,.04]),
  staff_cast: () => play([.35,,400,.03,.1,.2,2,0,20,10,150,.08,,,,,,.38,.06]),

  // === WAND ATTACKS ===
  wand_flick: () => play([.3,,600,.01,.05,.1,2,0,25,12,200,.04,,,,,,.32,.03]),
  wand_blast: () => play([.4,,500,.02,.08,.15,2,1,22,10,180,.06,,,,,,.42,.04]),

  // === SPECIAL ATTACKS ===
  spin_attack: () => {
    play([.4,,280,.02,.08,.15,1,1.5,-12,,,,,,,,.1,.4,.04]);
    setTimeout(() => play([.45,,300,.01,.06,.12,1,1.6,-15,,,,,,,,.1,.42,.03]), 80);
    setTimeout(() => play([.5,,320,.01,.07,.14,1,1.7,-18,,,,,,,,.1,.45,.04]), 160);
  },
  uppercut: () => play([.6,,180,.01,.08,.18,4,1.5,20,,,,,1.3,,.1,,.55,.05]),
  backstab: () => {
    play([.2,,600,.01,.03,.1,3,2,40,-30,,,,,,,,.2,.02]);
    setTimeout(() => play([.7,,250,.01,.04,.12,1,2.5,-30,,,,,1.5,,,,.6,.03]), 150);
  },
  critical_hit: () => {
    play([.8,,200,.01,.08,.2,2,2,-15,,,,,1.5,,,,.7,.04]);
    setTimeout(() => play([.4,,800,.01,.02,.1,1,0,30,15,300,.03,,,,,,.4,.02]), 50);
  },
  parry: () => play([.6,,250,.01,.03,.1,4,1.5,15,-10,,,,,1.2,,,,.55,.03]),
  counter: () => {
    play([.5,,200,.01,.03,.08,4,1,10,-5,,,,,1,,,,.45,.02]);
    setTimeout(() => play([.65,,280,.01,.06,.15,1,1.8,-20,,,,,1.3,,.1,,.58,.04]), 100);
  },
  execute: () => {
    play([.5,,100,.05,.1,.2,4,1,-5,,,,,1.5,,.1,,.5,.06]);
    setTimeout(() => play([1,,60,.02,.2,.4,4,2,-8,,,,,2.5,.2,.1,,.95,.1]), 200);
  },
  combo: () => {
    const delays = [0, 80, 160, 260];
    delays.forEach((d, i) => {
      setTimeout(() => play([.35 + i*.08,,280 + i*20,.01,.05,.1 + i*.02,1,1.5 + i*.1,-15 - i*2,,,,,,,,.1,.35 + i*.05,.03]), d);
    });
  },
  flurry: () => {
    const delays = [0, 50, 100, 150, 200, 250];
    delays.forEach((d, i) => {
      setTimeout(() => play([.28 + i*.03,,350 + i*15,.01,.03,.06,1,2,-20 - i,,,,,,,,.08,.28 + i*.02,.02]), d);
    });
  },

  // === UNARMED ===
  punch: () => play([.5,,150,.01,.05,.12,4,1,-8,,,,,1,,,,.45,.03]),
  kick: () => play([.55,,120,.01,.06,.15,4,1,-6,,,,,1.2,,,,.5,.04]),
  headbutt: () => play([.65,,80,.01,.08,.18,4,1,-5,,,,,1.5,,.1,,.6,.05]),
  body_slam: () => play([.8,,50,.02,.15,.35,4,1,-3,,,,,2,,.1,,.75,.08]),
  dash_strike: () => {
    play([.3,,400,.01,.03,.08,3,1,30,-20,,,,,,,,.3,.02]);
    setTimeout(() => play([.6,,150,.01,.06,.15,4,1,-10,,,,,1.3,,.1,,.55,.04]), 100);
  },
};

// ============================================================================
// COMBAT STATE SOUNDS
// ============================================================================

export const combatStateSounds = {
  // Critical hit
  critical_hit: () => {
    play([.8,,200,.01,.08,.2,2,2,-15,,,,,1.5,,,,.7,.04]);
    setTimeout(() => play([.4,,800,.01,.02,.1,1,0,30,15,300,.03,,,,,,.4,.02]), 50);
  },

  // Miss/dodge
  miss: () => play([.2,,400,.01,.03,.1,3,0,40,-30,,,,,,,,.2,.02]),
  dodge: () => play([.3,,500,.01,.04,.12,3,0,50,-35,,,,,,,,.3,.02]),

  // Block/parry
  block: () => play([.5,,180,.01,.05,.15,4,1,8,-5,,,,,1,,,,.5,.04]),
  parry: () => play([.6,,250,.01,.03,.12,4,1.5,12,-8,,,,,1.2,,,,.55,.03]),

  // Status effects
  poison_tick: () => play([.2,,200,.02,.08,.15,2,0,10,5,60,.05,,,,,,.22,.04]),
  bleed_tick: () => play([.25,,120,.01,.05,.1,4,0,-3,,,,,,,,.1,.25,.03]),
  burn_tick: () => play([.25,,150,.01,.06,.12,4,1,-5,,,,,1,,.1,,.27,.03]),
  freeze_effect: () => play([.3,,1200,.02,.08,.15,1,0,-25,,180,.05,,,,.3,,.32,.04]),
  stun_effect: () => play([.35,,600,.01,.03,.1,3,2,35,-20,,,,,,1,,.35,.02]),

  // Healing
  heal: () => play([.4,,500,.03,.12,.25,1,0,15,8,200,.1,,,,,,.42,.07]),
  revive: () => {
    play([.3,,400,.05,.15,.3,1,0,20,10,250,.12,,,,,,.35,.08]);
    setTimeout(() => play([.5,,600,.03,.1,.2,1,0,25,12,300,.08,,,,,,.5,.06]), 250);
  },

  // Buff/debuff
  buff_apply: () => play([.4,,500,.02,.1,.2,1,0,18,8,180,.08,,,,,,.42,.05]),
  debuff_apply: () => play([.35,,150,.02,.08,.18,2,0,-10,-5,40,.06,,,,,,.38,.05]),

  // Victory/defeat
  victory: () => {
    play([.4,,400,.02,.1,.2,1,0,20,10,200,.08,,,,,,.42,.06]);
    setTimeout(() => play([.45,,500,.02,.1,.2,1,0,22,11,220,.08,,,,,,.47,.06]), 150);
    setTimeout(() => play([.5,,600,.02,.12,.25,1,0,25,12,250,.1,,,,,,.52,.07]), 300);
  },

  defeat: () => play([.5,,100,.05,.2,.5,4,0,-5,-2,,,,,,.1,,.5,.15]),
};

// ============================================================================
// BOSS ATTACK SOUNDS (10 unique boss attacks)
// ============================================================================

export const bossAttackSounds = {
  // Shadow Slime - Despair Glob (bounce attack)
  bounce: () => {
    // Squishy launch
    play([.5,,150,.03,.1,.2,2,0,20,10,80,.08,,,,,,.5,.06]);
    // Glob impact
    setTimeout(() => play([.6,,80,.02,.15,.3,4,0,-8,-3,,,,,1.5,.1,.1,,.55,.08]), 200);
  },

  // Goblin Chief - Distraction Dagger (stab attack)
  stab: () => {
    // Quick stab
    play([.6,,400,.01,.03,.1,1,2,-25,,,,,1.2,,,,.55,.02]);
    // Sneaky impact
    setTimeout(() => play([.4,,200,.01,.05,.12,4,1,-10,,,,,,,,.1,.4,.03]), 80);
  },

  // Skeleton Knight - Oath Breaker (slash attack)
  slash: () => {
    // Heavy sword swing
    play([.7,,200,.02,.1,.25,2,1.5,-12,,,,,1.5,,.12,,.65,.06]);
    // Cursed energy release
    setTimeout(() => play([.4,,100,.03,.08,.2,4,1,-5,,,,,1,.08,.1,,.4,.05]), 120);
  },

  // Forest Troll - Excuse Avalanche (smash attack)
  smash: () => {
    // Massive overhead swing
    play([.5,,60,.05,.1,.2,4,1,-3,,,,,1.5,,.08,,.5,.06]);
    // Ground-shaking impact
    setTimeout(() => play([1,,35,.02,.3,.6,4,1,-2,,,,,3,.35,.05,,.95,.2]), 150);
    // Debris scatter
    setTimeout(() => play([.4,,100,.02,.15,.3,4,0,8,3,,,,,,.1,,.4,.08]), 250);
  },

  // Stone Golem - Stagnation Slam (pound attack)
  pound: () => {
    // Slow windup rumble
    play([.4,,40,.08,.15,.3,0,0,3,1,,,,,,.05,,.4,.1]);
    // Devastating slam
    setTimeout(() => play([1.2,,30,.02,.35,.7,4,1,-2,,,,,3.5,.4,.05,,.98,.25]), 200);
    // Shockwave
    setTimeout(() => play([.5,,50,.03,.2,.4,0,0,2,.5,,,,,,.08,,.5,.12]), 350);
  },

  // Flame Demon - Burnout Blaze (fireball attack)
  fireball: () => {
    // Demonic fire charge
    play([.5,,100,.04,.1,.2,4,1,-6,,,,,1.5,.1,.12,,.5,.06]);
    // Explosive fireball
    setTimeout(() => play([.9,,70,.02,.2,.45,4,1.5,-8,,,,,2.5,.25,.1,,.85,.12]), 150);
    // Burning aftermath
    setTimeout(() => play([.3,,120,.02,.15,.3,4,1,5,2,,,,,,.15,,.32,.08]), 300);
  },

  // Ice Drake - Comfort Zone Freeze (breath attack)
  breath: () => {
    // Inhale (building cold)
    play([.3,,1500,.1,.15,.25,1,0,30,-15,200,.12,,,,.3,,.35,.08]);
    // Freezing breath blast
    setTimeout(() => play([.8,,2000,.02,.25,.5,1,0,-40,,350,.15,,,,.5,,.75,.15]), 200);
    // Crystallization crackle
    setTimeout(() => play([.4,,2500,.01,.08,.15,1,0,-50,,400,.08,,,,.4,,.4,.04]), 450);
  },

  // Dark Wizard - Imposter Hex (spell attack)
  spell: () => {
    // Dark incantation
    play([.4,,200,.08,.15,.3,2,0,15,8,80,.12,,,,,,.4,.1]);
    // Hex discharge
    setTimeout(() => play([.7,,120,.02,.12,.28,4,2,-8,-3,,,,,1.8,.15,.12,,.65,.08]), 250);
    // Psychic resonance
    setTimeout(() => play([.3,,300,.03,.1,.2,2,0,20,10,120,.08,,,,,,.32,.06]), 400);
  },

  // Void Watcher - Timeline Terror (tentacle attack)
  tentacle: () => {
    // Eldritch emergence
    play([.5,,80,.1,.2,.4,0,0,10,5,30,.15,,,,,,.5,.12]);
    // Tentacle lash
    setTimeout(() => play([.6,,150,.02,.1,.25,2,1,-15,8,50,.06,,,,,,.55,.07]), 300);
    // Psychic scream
    setTimeout(() => play([.7,,400,.03,.15,.35,2,0,25,15,150,.1,,,,,,.65,.1]), 500);
    // Reality tear
    setTimeout(() => play([.4,,60,.05,.12,.3,4,2,-5,-2,,,,,1.5,.1,.1,,.42,.08]), 700);
  },

  // Dragon Lord - Destiny's Wrath (dragonfire attack) - THE MOST IMPRESSIVE!
  dragonfire: () => {
    // Ancient dragon roar
    play([.7,,40,.12,.25,.5,0,1,5,2,,,,,,,,.65,.18]);
    // Massive inhale
    setTimeout(() => play([.4,,100,.08,.2,.35,0,0,8,4,,,,,,,,.42,.12]), 300);
    // Cataclysmic breath
    setTimeout(() => {
      play([1.3,,50,.03,.35,.7,4,1.5,-5,,,,,3.5,.4,.08,,.98,.22]);
      // Layered fire cascade
      setTimeout(() => play([.6,,80,.02,.2,.4,4,1,-6,,,,,2,.2,.1,,.6,.1]), 50);
      setTimeout(() => play([.5,,100,.02,.15,.3,4,1,-4,,,,,1.5,.15,.1,,.5,.08]), 100);
    }, 550);
    // Scorching aftermath
    setTimeout(() => play([.4,,150,.02,.2,.4,4,1,6,3,,,,,,.15,,.42,.1]), 900);
  },

  // Generic fallback
  default: () => {
    play([.6,,100,.02,.1,.25,4,1,-8,,,,,1.5,.1,.1,,.55,.07]);
  },
};

// Get boss attack sound by animation type
export function playBossAttack(attackAnimation) {
  const sound = bossAttackSounds[attackAnimation] || bossAttackSounds.default;
  sound();
}

// ============================================================================
// LEGENDARY WEAPON SIGNATURE SOUNDS (18 weapons)
// ============================================================================

export const legendaryWeaponSounds = {
  // Dragon Soul Sword
  dragon_soul_slash: () => {
    play([.5,,60,.08,.15,.3,0,1,4,1.5,,,,,,,,.5,.1]);
    setTimeout(() => play([.8,,120,.02,.15,.35,4,1.5,-8,,,,,1.8,.1,.15,,.75,.1]), 180);
  },

  // Frostbane Blade
  frostbane_cleave: () => {
    play([.6,,250,.02,.1,.2,1,1,-12,,,,,1,,,,.55,.05]);
    setTimeout(() => play([.5,,1800,.01,.06,.15,1,0,-35,,250,.05,,,,.4,,.5,.04]), 120);
  },

  // Thunderlord's Edge
  thunderlord_strike: () => {
    play([1.1,,900,.01,.02,.2,3,3,70,-45,,,,,,1.8,,.75,.03]);
    setTimeout(() => play([.7,,45,.02,.18,.4,4,1,-4,,,,,2,.15,.1,,.68,.1]), 50);
  },

  // Soulreaper
  soulreaper_harvest: () => {
    play([.4,,100,.05,.15,.35,2,0,8,4,40,.1,,,,,,.42,.1]);
    setTimeout(() => play([.6,,80,.02,.12,.28,4,2,-6,-2,,,,,1.5,.1,.15,,.58,.08]), 220);
  },

  // Void Scythe
  void_scythe_rend: () => {
    play([.5,,150,.03,.1,.25,2,1,-12,5,60,.06,,,,,,.5,.07]);
    setTimeout(() => play([.4,,200,.05,.12,.3,2,0,15,8,80,.1,,,,,,.42,.08]), 180);
  },

  // Celestial Mace
  celestial_judgment: () => {
    play([.5,,900,.02,.12,.25,1,0,28,14,380,.1,,,,,,.52,.07]);
    setTimeout(() => play([.9,,55,.02,.22,.5,4,1,-6,,,,,2.2,.2,.1,,.88,.14]), 200);
  },

  // Infernal Greatsword
  infernal_eruption: () => {
    play([.5,,80,.04,.1,.2,4,1,-5,,,,,1.2,,.12,,.5,.06]);
    setTimeout(() => play([1,,45,.02,.25,.55,4,1.5,-6,,,,,2.5,.25,.1,,.95,.16]), 150);
    setTimeout(() => play([.4,,180,.02,.15,.3,4,1,10,5,,,,.8,,.1,,.42,.08]), 250);
  },

  // Moonlight Katana
  moonlight_slash: () => {
    play([.4,,350,.01,.08,.18,1,1,-18,,120,.05,,,,,,.42,.04]);
    setTimeout(() => play([.5,,500,.02,.1,.2,1,0,22,10,180,.08,,,,,,.5,.05]), 100);
  },

  // Storm Caller Staff
  storm_caller_tempest: () => {
    play([.4,,650,.01,.02,.12,3,2,38,-25,,,,,,1,,.42,.02]);
    setTimeout(() => play([.5,,700,.01,.02,.12,3,2,42,-28,,,,,,1,,.48,.02]), 80);
    setTimeout(() => play([.6,,750,.01,.03,.15,3,2,48,-32,,,,,,1.2,,.55,.02]), 160);
    setTimeout(() => play([.7,,35,.02,.2,.45,4,1,-4,,,,,2,.15,.1,,.68,.12]), 200);
  },

  // Abyssal Trident
  abyssal_maelstrom: () => {
    play([.4,,180,.06,.18,.4,3,0,12,-6,,,,.4,,,,.42,.1]);
    setTimeout(() => play([.5,,140,.04,.15,.35,3,0,8,-4,,,,.5,,,,.5,.08]), 180);
    setTimeout(() => play([.6,,100,.02,.12,.3,4,0,-6,-2,,,,.6,,,,.58,.08]), 360);
  },

  // Phoenix Blade
  phoenix_rebirth: () => {
    play([.4,,250,.05,.12,.25,2,1,18,8,120,.08,,,,,,.42,.07]);
    setTimeout(() => play([.7,,100,.02,.18,.4,4,1.2,-8,,,,,1.8,.12,.12,,.68,.1]), 200);
    setTimeout(() => play([.4,,450,.03,.1,.2,1,0,22,10,180,.06,,,,,,.42,.05]), 350);
  },

  // Chaos Blade
  chaos_rift: () => {
    play([.5,,300,.02,.1,.2,2,2,20,-12,80,.05,,,,,,.5,.05]);
    setTimeout(() => play([.3,,400,.05,.15,.3,2,0,25,15,120,.12,,,,,,.35,.08]), 150);
    setTimeout(() => play([.6,,150,.02,.12,.28,4,1,-10,-5,,,,,1.5,.1,.12,,.58,.07]), 300);
  },

  // Elemental Blade
  elemental_blade_storm: () => {
    // Fire
    play([.35,,100,.02,.08,.15,4,1,-5,,,,,1,,.08,,.38,.04]);
    // Ice
    setTimeout(() => play([.35,,1500,.01,.06,.12,1,0,-28,,180,.04,,,,.3,,.38,.03]), 150);
    // Lightning
    setTimeout(() => play([.4,,750,.01,.02,.1,3,2,45,-30,,,,,,1,,.42,.02]), 300);
    // Earth
    setTimeout(() => play([.5,,45,.02,.15,.3,4,0,-3,,,,,1.5,.1,.08,,.52,.08]), 450);
  },

  // Rainbow Prism Wand
  prismatic_cascade: () => {
    const colors = [0, 80, 160, 240, 320, 400, 480];
    colors.forEach((delay, i) => {
      setTimeout(() => play([.3 + i*.03,,400 + i*80,.02,.06,.12,1,0,20 + i*3,10,150 + i*30,.05,,,,,,.32 + i*.02,.03]), delay);
    });
  },

  // Bloodfang Dagger
  bloodfang_frenzy: () => {
    const strikes = [0, 100, 200, 300, 400];
    strikes.forEach((delay, i) => {
      setTimeout(() => play([.35 + i*.05,,350 - i*20,.01,.03,.08,1,2,-20 - i*2,,,,,1 + i*.1,,,,.38 + i*.03,.02]), delay);
    });
    // Final drain
    setTimeout(() => play([.4,,120,.05,.12,.25,2,0,8,4,50,.08,,,,,,.42,.07]), 550);
  },

  // Cosmic Scepter
  cosmic_singularity: () => {
    // Charge
    play([.3,,200,.1,.2,.3,2,0,15,10,100,.15,,,,,,.35,.1]);
    // Implode
    setTimeout(() => play([.7,,50,.05,.25,.5,4,2,-4,-2,,,,,2,.15,.08,,.7,.15]), 400);
    // Release
    setTimeout(() => play([.5,,300,.02,.15,.3,2,1,20,10,150,.1,,,,,,.52,.08]), 550);
  },

  // Time Weaver Staff
  temporal_cascade: () => {
    play([.4,,700,.05,.15,.3,2,0,30,15,280,.12,,,,,,.42,.08]);
    setTimeout(() => play([.3,,900,.03,.1,.2,2,0,-35,-18,350,.08,,,,,,.35,.05]), 250);
    setTimeout(() => play([.5,,600,.02,.12,.25,2,0,25,12,250,.1,,,,,,.52,.07]), 450);
  },

  // Nature's Wrath Bow
  natures_wrath_volley: () => {
    const arrows = [0, 80, 160, 240, 320];
    arrows.forEach((delay, i) => {
      // Launch
      setTimeout(() => play([.25,,400,.01,.04,.1,3,1,30,-20,,,,,,,,.28,.02]), delay);
      // Impact
      setTimeout(() => play([.3 + i*.02,,300 + i*30,.02,.06,.12,2,0,18 + i*2,8,100 + i*15,.05,,,,,,.32 + i*.02,.03]), delay + 150);
    });
  },
};

// ============================================================================
// EXPORT ALL SOUND CATEGORIES
// ============================================================================

export const combatSounds = {
  ...weaponAbilitySounds,
  ...elementalSounds,
  ...weaponAttackSounds,
  ...combatStateSounds,
  ...legendaryWeaponSounds,
};

// Play sound by ID
export function playCombatSound(soundId) {
  const sound = combatSounds[soundId];
  if (sound && typeof sound === 'function') {
    sound();
  } else {
    console.warn(`Combat sound not found: ${soundId}`);
  }
}

export default combatSounds;
