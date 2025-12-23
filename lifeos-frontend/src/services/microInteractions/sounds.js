/**
 * Sounds Service
 *
 * Provides audio feedback for interactions:
 * - Completion sounds
 * - Achievement fanfares
 * - UI feedback tones
 *
 * Uses Web Audio API for programmatic sounds (no external files needed).
 * Sounds are subtle, minimal, and satisfying.
 */

// Audio context (lazy initialized)
let audioContext = null;

// User preference for sounds
let soundsEnabled = true;
let masterVolume = 0.3; // Keep sounds subtle

// Audio file cache
const audioCache = new Map();

/**
 * Play an audio file from the assets folder
 * @param {string} filename - Filename in /assets/sounds/
 * @param {number} volume - Volume multiplier (0-1)
 */
function playAudioFile(filename, volume = 1) {
  if (!soundsEnabled) return;

  try {
    const path = `/assets/sounds/${filename}`;

    // Get or create cached audio element
    let audio = audioCache.get(filename);
    if (!audio) {
      audio = new Audio(path);
      audioCache.set(filename, audio);
    }

    // Clone for overlapping plays
    const clone = audio.cloneNode();
    clone.volume = masterVolume * volume;
    clone.play().catch(err => console.warn('Audio playback failed:', err));
  } catch (error) {
    console.warn('Audio file playback failed:', error);
  }
}

export function setSoundsEnabled(enabled) {
  soundsEnabled = enabled;
  localStorage.setItem('soundsEnabled', JSON.stringify(enabled));
}

export function getSoundsEnabled() {
  const stored = localStorage.getItem('soundsEnabled');
  if (stored !== null) {
    soundsEnabled = JSON.parse(stored);
  }
  return soundsEnabled;
}

export function setVolume(volume) {
  masterVolume = Math.max(0, Math.min(1, volume));
  localStorage.setItem('soundVolume', JSON.stringify(masterVolume));
}

export function getVolume() {
  const stored = localStorage.getItem('soundVolume');
  if (stored !== null) {
    masterVolume = JSON.parse(stored);
  }
  return masterVolume;
}

// Initialize from storage
getSoundsEnabled();
getVolume();

/**
 * Initialize audio context (must be called after user interaction)
 */
function getAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  // Resume if suspended (browser autoplay policy)
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
  return audioContext;
}

/**
 * Play a simple tone
 */
function playTone(frequency, duration, type = 'sine', volume = masterVolume) {
  if (!soundsEnabled) return;

  try {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

    // Fade in and out for smoother sound
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.01);
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  } catch (error) {
    console.warn('Sound playback failed:', error);
  }
}

/**
 * Play a chord (multiple tones)
 */
function playChord(frequencies, duration, type = 'sine') {
  if (!soundsEnabled) return;

  frequencies.forEach((freq, i) => {
    // Stagger slightly for richer sound
    setTimeout(() => {
      playTone(freq, duration, type, masterVolume / frequencies.length);
    }, i * 10);
  });
}

/**
 * Play an arpeggio (notes in sequence)
 */
function playArpeggio(frequencies, noteDuration, gap = 50) {
  if (!soundsEnabled) return;

  frequencies.forEach((freq, i) => {
    setTimeout(() => {
      playTone(freq, noteDuration, 'sine', masterVolume * 0.7);
    }, i * (noteDuration * 1000 + gap));
  });
}

// ============================================================================
// PRESET SOUNDS
// ============================================================================

/**
 * Soft click - for buttons, toggles
 */
export function click() {
  playTone(800, 0.05, 'sine', masterVolume * 0.5);
}

/**
 * Pop sound - for task completion
 */
export function pop() {
  if (!soundsEnabled) return;

  try {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = 'sine';
    // Quick pitch slide up for "pop" effect
    oscillator.frequency.setValueAtTime(300, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.05);

    gainNode.gain.setValueAtTime(masterVolume * 0.6, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.1);
  } catch (error) {
    console.warn('Sound playback failed:', error);
  }
}

/**
 * EXTREMELY satisfying task complete sound
 * Rich, punchy, with harmonic overtones
 */
export function taskCompleteSatisfying() {
  if (!soundsEnabled) return;

  try {
    const ctx = getAudioContext();

    // Layer 1: Primary satisfying "pop" with punch
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(400, ctx.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.04);
    osc1.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.08);
    gain1.gain.setValueAtTime(0, ctx.currentTime);
    gain1.gain.linearRampToValueAtTime(masterVolume * 0.7, ctx.currentTime + 0.01);
    gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.15);

    // Layer 2: Higher harmonic "sparkle"
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1200, ctx.currentTime + 0.02);
    osc2.frequency.exponentialRampToValueAtTime(1800, ctx.currentTime + 0.06);
    gain2.gain.setValueAtTime(0, ctx.currentTime);
    gain2.gain.linearRampToValueAtTime(masterVolume * 0.25, ctx.currentTime + 0.03);
    gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime + 0.02);
    osc2.stop(ctx.currentTime + 0.12);

    // Layer 3: Sub bass "thump" for weight
    const osc3 = ctx.createOscillator();
    const gain3 = ctx.createGain();
    osc3.type = 'sine';
    osc3.frequency.setValueAtTime(80, ctx.currentTime);
    osc3.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.08);
    gain3.gain.setValueAtTime(masterVolume * 0.5, ctx.currentTime);
    gain3.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    osc3.connect(gain3);
    gain3.connect(ctx.destination);
    osc3.start(ctx.currentTime);
    osc3.stop(ctx.currentTime + 0.1);

    // Layer 4: Quick "ding" confirmation
    setTimeout(() => {
      if (!soundsEnabled) return;
      const osc4 = ctx.createOscillator();
      const gain4 = ctx.createGain();
      osc4.type = 'sine';
      osc4.frequency.setValueAtTime(1047, ctx.currentTime); // C6
      gain4.gain.setValueAtTime(masterVolume * 0.2, ctx.currentTime);
      gain4.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc4.connect(gain4);
      gain4.connect(ctx.destination);
      osc4.start(ctx.currentTime);
      osc4.stop(ctx.currentTime + 0.2);
    }, 60);

  } catch (error) {
    console.warn('Sound playback failed:', error);
  }
}

/**
 * Success chime - for achievements, level ups
 */
export function success() {
  // Happy major chord arpeggio (C-E-G-C)
  playArpeggio([523.25, 659.25, 783.99, 1046.50], 0.15, 80);
}

/**
 * Achievement fanfare - bigger success
 */
export function achievement() {
  // Triumphant ascending notes
  playArpeggio([392, 523.25, 659.25, 783.99, 1046.50], 0.12, 60);
}

/**
 * Level up sound
 */
export function levelUp() {
  if (!soundsEnabled) return;

  // Quick ascending sweep + chord
  try {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(200, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.2);

    gainNode.gain.setValueAtTime(masterVolume * 0.5, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.3);
  } catch (error) {
    console.warn('Sound playback failed:', error);
  }

  // Follow with chord
  setTimeout(() => playChord([523.25, 659.25, 783.99], 0.3), 200);
}

/**
 * Error/warning beep
 */
export function error() {
  playTone(200, 0.15, 'square', masterVolume * 0.3);
}

/**
 * Subtle notification
 */
export function notification() {
  playChord([659.25, 783.99], 0.2);
}

/**
 * XP gain sound - quick satisfying "ding"
 */
export function xpGain() {
  if (!soundsEnabled) return;

  try {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.08);

    gainNode.gain.setValueAtTime(masterVolume * 0.4, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.15);
  } catch (error) {
    console.warn('Sound playback failed:', error);
  }
}

/**
 * Streak milestone - celebratory arpeggio
 */
export function streak() {
  playArpeggio([523.25, 659.25, 783.99, 1046.50, 1318.51], 0.1, 50);
}

// ============================================================================
// COMBAT SOUNDS
// ============================================================================

/**
 * Attack hit sound - punchy impact
 */
export function attackHit() {
  if (!soundsEnabled) return;

  try {
    const ctx = getAudioContext();

    // Impact thump
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(150, ctx.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.08);
    gain1.gain.setValueAtTime(masterVolume * 0.6, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.1);

    // High "slash" swoosh
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(800, ctx.currentTime);
    osc2.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.06);
    gain2.gain.setValueAtTime(masterVolume * 0.15, ctx.currentTime);
    gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime);
    osc2.stop(ctx.currentTime + 0.08);
  } catch (error) {
    console.warn('Sound playback failed:', error);
  }
}

/**
 * Critical hit sound - dramatic impact with sparkle
 */
export function criticalHit() {
  if (!soundsEnabled) return;

  try {
    const ctx = getAudioContext();

    // Big impact thump
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(200, ctx.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.12);
    gain1.gain.setValueAtTime(masterVolume * 0.8, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.15);

    // High "crit" sparkle
    setTimeout(() => {
      if (!soundsEnabled) return;
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1200, ctx.currentTime);
      osc2.frequency.exponentialRampToValueAtTime(2400, ctx.currentTime + 0.1);
      gain2.gain.setValueAtTime(masterVolume * 0.3, ctx.currentTime);
      gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(ctx.currentTime);
      osc2.stop(ctx.currentTime + 0.15);
    }, 30);

    // Mid punch
    const osc3 = ctx.createOscillator();
    const gain3 = ctx.createGain();
    osc3.type = 'triangle';
    osc3.frequency.setValueAtTime(400, ctx.currentTime);
    osc3.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.08);
    gain3.gain.setValueAtTime(masterVolume * 0.4, ctx.currentTime);
    gain3.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    osc3.connect(gain3);
    gain3.connect(ctx.destination);
    osc3.start(ctx.currentTime);
    osc3.stop(ctx.currentTime + 0.1);
  } catch (error) {
    console.warn('Sound playback failed:', error);
  }
}

/**
 * Boss attack sound - menacing incoming damage
 */
export function bossAttack() {
  if (!soundsEnabled) return;

  try {
    const ctx = getAudioContext();

    // Low menacing rumble
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(80, ctx.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.15);
    gain1.gain.setValueAtTime(masterVolume * 0.5, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.2);

    // Impact crunch
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'square';
    osc2.frequency.setValueAtTime(120, ctx.currentTime + 0.05);
    osc2.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.12);
    gain2.gain.setValueAtTime(0, ctx.currentTime);
    gain2.gain.linearRampToValueAtTime(masterVolume * 0.25, ctx.currentTime + 0.06);
    gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime + 0.05);
    osc2.stop(ctx.currentTime + 0.15);
  } catch (error) {
    console.warn('Sound playback failed:', error);
  }
}

/**
 * Battle start sound - epic entry
 */
export function battleStart() {
  if (!soundsEnabled) return;

  try {
    const ctx = getAudioContext();

    // Rising sweep
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(100, ctx.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.3);
    gain1.gain.setValueAtTime(masterVolume * 0.4, ctx.currentTime);
    gain1.gain.linearRampToValueAtTime(masterVolume * 0.6, ctx.currentTime + 0.15);
    gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.35);

    // Power chord hit
    setTimeout(() => {
      if (!soundsEnabled) return;
      playChord([196, 246.94, 293.66], 0.25, 'triangle'); // G power chord
    }, 250);
  } catch (error) {
    console.warn('Sound playback failed:', error);
  }
}

// ============================================================================
// ABILITY SOUNDS
// ============================================================================

/**
 * Power attack sound - Heavy physical ability (swords, axes, hammers)
 */
export function powerAttack() {
  if (!soundsEnabled) return;

  try {
    const ctx = getAudioContext();

    // Heavy whoosh buildup
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(100, ctx.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.15);
    osc1.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.25);
    gain1.gain.setValueAtTime(0, ctx.currentTime);
    gain1.gain.linearRampToValueAtTime(masterVolume * 0.3, ctx.currentTime + 0.05);
    gain1.gain.linearRampToValueAtTime(masterVolume * 0.5, ctx.currentTime + 0.15);
    gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.3);

    // Big impact
    setTimeout(() => {
      if (!soundsEnabled) return;
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(180, ctx.currentTime);
      osc2.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.15);
      gain2.gain.setValueAtTime(masterVolume * 0.8, ctx.currentTime);
      gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(ctx.currentTime);
      osc2.stop(ctx.currentTime + 0.2);
    }, 150);

    // Metal ring
    setTimeout(() => {
      if (!soundsEnabled) return;
      const osc3 = ctx.createOscillator();
      const gain3 = ctx.createGain();
      osc3.type = 'triangle';
      osc3.frequency.setValueAtTime(2000, ctx.currentTime);
      osc3.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.1);
      gain3.gain.setValueAtTime(masterVolume * 0.2, ctx.currentTime);
      gain3.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc3.connect(gain3);
      gain3.connect(ctx.destination);
      osc3.start(ctx.currentTime);
      osc3.stop(ctx.currentTime + 0.15);
    }, 180);
  } catch (error) {
    console.warn('Sound playback failed:', error);
  }
}

/**
 * Magic burst sound - For magical abilities (staff, wand, scepter, tome)
 */
export function magicBurst() {
  if (!soundsEnabled) return;

  try {
    const ctx = getAudioContext();

    // Magical shimmer buildup
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(400, ctx.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.2);
    gain1.gain.setValueAtTime(0, ctx.currentTime);
    gain1.gain.linearRampToValueAtTime(masterVolume * 0.4, ctx.currentTime + 0.1);
    gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.3);

    // High frequency sparkle
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(2000, ctx.currentTime + 0.05);
    osc2.frequency.exponentialRampToValueAtTime(3000, ctx.currentTime + 0.15);
    gain2.gain.setValueAtTime(0, ctx.currentTime);
    gain2.gain.linearRampToValueAtTime(masterVolume * 0.15, ctx.currentTime + 0.1);
    gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime + 0.05);
    osc2.stop(ctx.currentTime + 0.25);

    // Bass burst for impact
    setTimeout(() => {
      if (!soundsEnabled) return;
      const osc3 = ctx.createOscillator();
      const gain3 = ctx.createGain();
      osc3.type = 'sine';
      osc3.frequency.setValueAtTime(120, ctx.currentTime);
      osc3.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.1);
      gain3.gain.setValueAtTime(masterVolume * 0.5, ctx.currentTime);
      gain3.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc3.connect(gain3);
      gain3.connect(ctx.destination);
      osc3.start(ctx.currentTime);
      osc3.stop(ctx.currentTime + 0.15);
    }, 150);
  } catch (error) {
    console.warn('Sound playback failed:', error);
  }
}

/**
 * Chain lightning sound - Electric crackling
 */
export function chainLightning() {
  if (!soundsEnabled) return;

  try {
    const ctx = getAudioContext();

    // Create multiple "zap" sounds in quick succession
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        if (!soundsEnabled) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(800 + (i * 200), ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(masterVolume * 0.35, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.1);
      }, i * 80);
    }

    // Base crackle
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'square';
    osc1.frequency.setValueAtTime(100, ctx.currentTime);
    osc1.frequency.setValueAtTime(150, ctx.currentTime + 0.05);
    osc1.frequency.setValueAtTime(80, ctx.currentTime + 0.1);
    gain1.gain.setValueAtTime(masterVolume * 0.15, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.25);
  } catch (error) {
    console.warn('Sound playback failed:', error);
  }
}

/**
 * Meteor/summon sound - Deep rumble with impact
 */
export function meteorImpact() {
  if (!soundsEnabled) return;

  try {
    const ctx = getAudioContext();

    // Descending whistle (meteor falling)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(1500, ctx.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.4);
    gain1.gain.setValueAtTime(0, ctx.currentTime);
    gain1.gain.linearRampToValueAtTime(masterVolume * 0.4, ctx.currentTime + 0.1);
    gain1.gain.linearRampToValueAtTime(masterVolume * 0.5, ctx.currentTime + 0.35);
    gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.45);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.45);

    // Big impact explosion
    setTimeout(() => {
      if (!soundsEnabled) return;
      // Low boom
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(80, ctx.currentTime);
      osc2.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.2);
      gain2.gain.setValueAtTime(masterVolume * 0.9, ctx.currentTime);
      gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(ctx.currentTime);
      osc2.stop(ctx.currentTime + 0.3);

      // Mid crunch
      const osc3 = ctx.createOscillator();
      const gain3 = ctx.createGain();
      osc3.type = 'triangle';
      osc3.frequency.setValueAtTime(300, ctx.currentTime);
      osc3.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1);
      gain3.gain.setValueAtTime(masterVolume * 0.4, ctx.currentTime);
      gain3.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc3.connect(gain3);
      gain3.connect(ctx.destination);
      osc3.start(ctx.currentTime);
      osc3.stop(ctx.currentTime + 0.15);
    }, 350);
  } catch (error) {
    console.warn('Sound playback failed:', error);
  }
}

/**
 * Soul drain sound - Eerie draining effect
 */
export function soulDrain() {
  if (!soundsEnabled) return;

  try {
    const ctx = getAudioContext();

    // Eerie descending tone
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(600, ctx.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.5);
    gain1.gain.setValueAtTime(0, ctx.currentTime);
    gain1.gain.linearRampToValueAtTime(masterVolume * 0.35, ctx.currentTime + 0.1);
    gain1.gain.linearRampToValueAtTime(masterVolume * 0.2, ctx.currentTime + 0.4);
    gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.6);

    // Dark undertone
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(100, ctx.currentTime);
    osc2.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.4);
    gain2.gain.setValueAtTime(masterVolume * 0.3, ctx.currentTime);
    gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime);
    osc2.stop(ctx.currentTime + 0.5);

    // Heal confirmation (after drain)
    setTimeout(() => {
      if (!soundsEnabled) return;
      const osc3 = ctx.createOscillator();
      const gain3 = ctx.createGain();
      osc3.type = 'sine';
      osc3.frequency.setValueAtTime(400, ctx.currentTime);
      osc3.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.1);
      gain3.gain.setValueAtTime(masterVolume * 0.25, ctx.currentTime);
      gain3.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc3.connect(gain3);
      gain3.connect(ctx.destination);
      osc3.start(ctx.currentTime);
      osc3.stop(ctx.currentTime + 0.2);
    }, 400);
  } catch (error) {
    console.warn('Sound playback failed:', error);
  }
}

/**
 * Ability ready notification - Subtle chime
 */
export function abilityReady() {
  if (!soundsEnabled) return;

  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.setValueAtTime(1100, ctx.currentTime + 0.05);
    gain.gain.setValueAtTime(masterVolume * 0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);
  } catch (error) {
    console.warn('Sound playback failed:', error);
  }
}

// ============================================================================
// CELEBRATION & RARITY SOUNDS
// ============================================================================

/**
 * Anticipation sound - Building tension before reveals
 * Rising tone that creates suspense
 */
export function anticipation() {
  if (!soundsEnabled) return;

  try {
    const ctx = getAudioContext();

    // Rising sweep
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(200, ctx.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.4);
    gain1.gain.setValueAtTime(0, ctx.currentTime);
    gain1.gain.linearRampToValueAtTime(masterVolume * 0.3, ctx.currentTime + 0.1);
    gain1.gain.linearRampToValueAtTime(masterVolume * 0.4, ctx.currentTime + 0.35);
    gain1.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.5);

    // Subtle shimmer
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(800, ctx.currentTime + 0.1);
    osc2.frequency.exponentialRampToValueAtTime(1600, ctx.currentTime + 0.4);
    gain2.gain.setValueAtTime(0, ctx.currentTime);
    gain2.gain.linearRampToValueAtTime(masterVolume * 0.1, ctx.currentTime + 0.2);
    gain2.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.45);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime + 0.1);
    osc2.stop(ctx.currentTime + 0.45);
  } catch (error) {
    console.warn('Sound playback failed:', error);
  }
}

/**
 * Task completion combo sound - Intensifies with combo count
 * @param {number} count - Current combo count (1-20)
 */
export function taskCompleteCombo(count = 1) {
  if (!soundsEnabled) return;

  try {
    const ctx = getAudioContext();

    // Base frequency increases with combo
    const baseFreq = 400 + (count * 30);
    const intensity = Math.min(count / 10, 1);

    // Primary pop with pitch based on combo
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(baseFreq, ctx.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, ctx.currentTime + 0.05);
    gain1.gain.setValueAtTime(masterVolume * (0.5 + intensity * 0.3), ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.12);

    // Add sparkle for combos 3+
    if (count >= 3) {
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(baseFreq * 2, ctx.currentTime + 0.02);
      osc2.frequency.exponentialRampToValueAtTime(baseFreq * 3, ctx.currentTime + 0.08);
      gain2.gain.setValueAtTime(masterVolume * 0.2 * intensity, ctx.currentTime + 0.02);
      gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(ctx.currentTime + 0.02);
      osc2.stop(ctx.currentTime + 0.1);
    }

    // Add chord for combos 5+
    if (count >= 5) {
      setTimeout(() => {
        if (!soundsEnabled) return;
        playChord([baseFreq * 1.25, baseFreq * 1.5, baseFreq * 2], 0.15);
      }, 50);
    }
  } catch (error) {
    console.warn('Sound playback failed:', error);
  }
}

/**
 * Achievement Common - Simple soft chime
 */
export function achievementCommon() {
  if (!soundsEnabled) return;

  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
    gain.gain.setValueAtTime(masterVolume * 0.4, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
  } catch (error) {
    console.warn('Sound playback failed:', error);
  }
}

/**
 * Achievement Rare - Rising arpeggio with sparkle
 */
export function achievementRare() {
  if (!soundsEnabled) return;

  // Rising arpeggio: C-E-G-B
  playArpeggio([523.25, 659.25, 783.99, 987.77], 0.12, 60);

  // Add sparkle after
  setTimeout(() => {
    if (!soundsEnabled) return;
    try {
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1567.98, ctx.currentTime); // G6
      gain.gain.setValueAtTime(masterVolume * 0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.2);
    } catch (error) {
      console.warn('Sound playback failed:', error);
    }
  }, 350);
}

/**
 * Achievement Epic - Dramatic fanfare with impact
 */
export function achievementEpic() {
  if (!soundsEnabled) return;

  try {
    const ctx = getAudioContext();

    // Impact hit
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(150, ctx.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.1);
    gain1.gain.setValueAtTime(masterVolume * 0.6, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.15);

    // Rising sweep
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(200, ctx.currentTime);
    osc2.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.25);
    gain2.gain.setValueAtTime(masterVolume * 0.4, ctx.currentTime);
    gain2.gain.linearRampToValueAtTime(masterVolume * 0.5, ctx.currentTime + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime);
    osc2.stop(ctx.currentTime + 0.3);
  } catch (error) {
    console.warn('Sound playback failed:', error);
  }

  // Triumphant chord
  setTimeout(() => {
    if (!soundsEnabled) return;
    playChord([392, 493.88, 587.33, 783.99], 0.4); // G4-B4-D5-G5
  }, 200);

  // Final sparkle
  setTimeout(() => {
    if (!soundsEnabled) return;
    playArpeggio([1046.50, 1318.51, 1567.98], 0.1, 40);
  }, 450);
}

/**
 * Achievement Legendary - Full orchestral hit with reverb-like tail
 */
export function achievementLegendary() {
  if (!soundsEnabled) return;

  try {
    const ctx = getAudioContext();

    // Massive impact
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(100, ctx.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.15);
    gain1.gain.setValueAtTime(masterVolume * 0.8, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.2);

    // Mid impact
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(200, ctx.currentTime);
    osc2.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.12);
    gain2.gain.setValueAtTime(masterVolume * 0.5, ctx.currentTime);
    gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime);
    osc2.stop(ctx.currentTime + 0.15);

    // High shimmer
    const osc3 = ctx.createOscillator();
    const gain3 = ctx.createGain();
    osc3.type = 'sine';
    osc3.frequency.setValueAtTime(1200, ctx.currentTime);
    osc3.frequency.exponentialRampToValueAtTime(2400, ctx.currentTime + 0.1);
    gain3.gain.setValueAtTime(masterVolume * 0.25, ctx.currentTime);
    gain3.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    osc3.connect(gain3);
    gain3.connect(ctx.destination);
    osc3.start(ctx.currentTime);
    osc3.stop(ctx.currentTime + 0.15);
  } catch (error) {
    console.warn('Sound playback failed:', error);
  }

  // Epic rising sweep
  setTimeout(() => {
    if (!soundsEnabled) return;
    try {
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.35);
      gain.gain.setValueAtTime(masterVolume * 0.5, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(masterVolume * 0.6, ctx.currentTime + 0.2);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.4);
    } catch (error) {
      console.warn('Sound playback failed:', error);
    }
  }, 100);

  // Grand chord
  setTimeout(() => {
    if (!soundsEnabled) return;
    playChord([261.63, 329.63, 392, 523.25, 659.25, 783.99], 0.6);
  }, 300);

  // Cascade of sparkles (reverb-like tail)
  [500, 600, 700, 800].forEach((delay, i) => {
    setTimeout(() => {
      if (!soundsEnabled) return;
      playTone(1046.50 + (i * 200), 0.15, 'sine', masterVolume * (0.15 - i * 0.03));
    }, delay);
  });
}

/**
 * Perfect Day celebration fanfare
 */
export function perfectDay() {
  if (!soundsEnabled) return;

  // Initial fanfare burst
  try {
    const ctx = getAudioContext();

    // Big opening impact
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(120, ctx.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.12);
    gain1.gain.setValueAtTime(masterVolume * 0.7, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.15);
  } catch (error) {
    console.warn('Sound playback failed:', error);
  }

  // Rising sweep
  setTimeout(() => {
    if (!soundsEnabled) return;
    try {
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1000, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(masterVolume * 0.4, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(masterVolume * 0.5, ctx.currentTime + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.35);
    } catch (error) {
      console.warn('Sound playback failed:', error);
    }
  }, 50);

  // Triumphant chord progression
  setTimeout(() => playChord([392, 493.88, 587.33], 0.3), 250); // G major
  setTimeout(() => playChord([440, 554.37, 659.25], 0.3), 450); // A major
  setTimeout(() => playChord([523.25, 659.25, 783.99, 1046.50], 0.5), 650); // C major

  // Final sparkle cascade
  setTimeout(() => {
    playArpeggio([1046.50, 1318.51, 1567.98, 2093], 0.08, 30);
  }, 900);
}

/**
 * ULTRA SATISFYING test sound
 * Designed for maximum dopamine hit - use for sound testing
 * Combines: deep bass punch, mid pop, harmonic shimmer, and sparkle cascade
 */
export function ultraSatisfying() {
  if (!soundsEnabled) return;

  try {
    const ctx = getAudioContext();

    // Layer 1: Deep bass PUNCH - physical impact you can feel
    const bass = ctx.createOscillator();
    const bassGain = ctx.createGain();
    bass.type = 'sine';
    bass.frequency.setValueAtTime(80, ctx.currentTime);
    bass.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.12);
    bassGain.gain.setValueAtTime(masterVolume * 0.9, ctx.currentTime);
    bassGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    bass.connect(bassGain);
    bassGain.connect(ctx.destination);
    bass.start(ctx.currentTime);
    bass.stop(ctx.currentTime + 0.15);

    // Layer 2: Mid-range "POP" with upward sweep - the satisfying click
    const pop = ctx.createOscillator();
    const popGain = ctx.createGain();
    pop.type = 'sine';
    pop.frequency.setValueAtTime(300, ctx.currentTime);
    pop.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.06);
    pop.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.1);
    popGain.gain.setValueAtTime(0, ctx.currentTime);
    popGain.gain.linearRampToValueAtTime(masterVolume * 0.7, ctx.currentTime + 0.015);
    popGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.18);
    pop.connect(popGain);
    popGain.connect(ctx.destination);
    pop.start(ctx.currentTime);
    pop.stop(ctx.currentTime + 0.18);

    // Layer 3: Bright harmonic shimmer - the "ding" of success
    const shimmer = ctx.createOscillator();
    const shimmerGain = ctx.createGain();
    shimmer.type = 'sine';
    shimmer.frequency.setValueAtTime(1047, ctx.currentTime + 0.03); // C6
    shimmerGain.gain.setValueAtTime(0, ctx.currentTime);
    shimmerGain.gain.linearRampToValueAtTime(masterVolume * 0.35, ctx.currentTime + 0.05);
    shimmerGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
    shimmer.connect(shimmerGain);
    shimmerGain.connect(ctx.destination);
    shimmer.start(ctx.currentTime + 0.03);
    shimmer.stop(ctx.currentTime + 0.35);

    // Layer 4: High sparkle overtone - the magic dust
    const sparkle = ctx.createOscillator();
    const sparkleGain = ctx.createGain();
    sparkle.type = 'sine';
    sparkle.frequency.setValueAtTime(2093, ctx.currentTime + 0.05); // C7
    sparkle.frequency.exponentialRampToValueAtTime(2637, ctx.currentTime + 0.12); // E7
    sparkleGain.gain.setValueAtTime(0, ctx.currentTime);
    sparkleGain.gain.linearRampToValueAtTime(masterVolume * 0.2, ctx.currentTime + 0.07);
    sparkleGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
    sparkle.connect(sparkleGain);
    sparkleGain.connect(ctx.destination);
    sparkle.start(ctx.currentTime + 0.05);
    sparkle.stop(ctx.currentTime + 0.25);

    // Layer 5: Sub-bass thump reinforcement
    const subBass = ctx.createOscillator();
    const subGain = ctx.createGain();
    subBass.type = 'sine';
    subBass.frequency.setValueAtTime(50, ctx.currentTime);
    subBass.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.1);
    subGain.gain.setValueAtTime(masterVolume * 0.5, ctx.currentTime);
    subGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
    subBass.connect(subGain);
    subGain.connect(ctx.destination);
    subBass.start(ctx.currentTime);
    subBass.stop(ctx.currentTime + 0.12);

  } catch (error) {
    console.warn('Sound playback failed:', error);
  }

  // Delayed sparkle cascade - the cherry on top
  setTimeout(() => {
    if (!soundsEnabled) return;
    try {
      const ctx = getAudioContext();

      // Triple ascending sparkle
      [0, 40, 80].forEach((delay, i) => {
        setTimeout(() => {
          if (!soundsEnabled) return;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(1318 + (i * 250), ctx.currentTime); // E6, G6, B6
          gain.gain.setValueAtTime(masterVolume * (0.15 - i * 0.03), ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + 0.15);
        }, delay);
      });
    } catch (error) {
      console.warn('Sound playback failed:', error);
    }
  }, 120);
}

/**
 * Delete/undo sound
 */
export function remove() {
  if (!soundsEnabled) return;

  try {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = 'sine';
    // Descending pitch for "remove" effect
    oscillator.frequency.setValueAtTime(600, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.1);

    gainNode.gain.setValueAtTime(masterVolume * 0.4, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.12);
  } catch (error) {
    console.warn('Sound playback failed:', error);
  }
}

/**
 * Toggle on
 */
export function toggleOn() {
  playTone(700, 0.06, 'sine', masterVolume * 0.4);
}

/**
 * Toggle off
 */
export function toggleOff() {
  playTone(500, 0.06, 'sine', masterVolume * 0.4);
}

// ============================================================================
// AUDIO FILE-BASED SOUNDS
// ============================================================================

// Sound file mapping - centralized for easy swapping
const SOUND_FILES = {
  // Quick, subtle - for frequent actions
  pop: 'pop-alert.mp3',
  click: 'test-sound.wav',

  // Rewarding - for achievements/unlocks
  unlock: 'gaming-lock.wav',

  // Big moment - for level ups/milestones
  fanfare: 'confirmation.wav',
};

/**
 * Task complete - subtle pop (used frequently)
 */
export function taskCompleteSound() {
  playAudioFile(SOUND_FILES.pop, 1);
}

/**
 * XP gain - quick sci-fi click
 */
export function xpGainSound() {
  playAudioFile(SOUND_FILES.click, 0.8);
}

/**
 * Achievement unlocked - rewarding lock sound
 */
export function achievementSound() {
  playAudioFile(SOUND_FILES.unlock, 1);
}

/**
 * Level up - big satisfying confirmation
 */
export function levelUpSound() {
  playAudioFile(SOUND_FILES.fanfare, 1);
}

/**
 * Streak milestone - same as achievement
 */
export function streakSound() {
  playAudioFile(SOUND_FILES.unlock, 0.9);
}

/**
 * UI click - quick feedback
 */
export function uiClickSound() {
  playAudioFile(SOUND_FILES.click, 0.6);
}

/**
 * Test sound - plays the fanfare for settings preview
 */
export function testSound() {
  playAudioFile(SOUND_FILES.fanfare, 1);
}

// Legacy exports for compatibility
export const sciFiClick = () => playAudioFile(SOUND_FILES.click, 1);
export const sciFiConfirmation = () => playAudioFile(SOUND_FILES.fanfare, 1);

// Presets mapping for common actions
export const soundPresets = {
  // UI interactions
  click,
  toggleOn,
  toggleOff,

  // Completions
  taskComplete: pop,
  taskCompleteSatisfying,
  taskCompleteCombo,
  multipleComplete: success,

  // Achievements by rarity
  achievementCommon,
  achievementRare,
  achievementEpic,
  achievementLegendary,
  achievement,
  levelUp,
  streak,
  xpGain,
  perfectDay,

  // Building tension
  anticipation,

  // Feedback
  notification,
  error,
  remove,

  // Test sounds
  ultraSatisfying,

  // Audio file sounds (mapped by action)
  taskCompleteSound,
  xpGainSound,
  achievementSound,
  levelUpSound,
  streakSound,
  uiClickSound,
  testSound,
  sciFiClick,
  sciFiConfirmation,
};

// Export as service object
export const sounds = {
  click,
  pop,
  taskCompleteSatisfying,
  taskCompleteCombo,
  success,
  achievement,
  levelUp,
  error,
  notification,
  xpGain,
  streak,
  remove,
  toggleOn,
  toggleOff,
  // Celebration & rarity sounds
  anticipation,
  achievementCommon,
  achievementRare,
  achievementEpic,
  achievementLegendary,
  perfectDay,
  // Combat sounds
  attackHit,
  criticalHit,
  bossAttack,
  battleStart,
  // Ability sounds
  powerAttack,
  magicBurst,
  chainLightning,
  meteorImpact,
  soulDrain,
  abilityReady,
  // Test sounds
  ultraSatisfying,
  // Audio file sounds (mapped by action)
  taskCompleteSound,
  xpGainSound,
  achievementSound,
  levelUpSound,
  streakSound,
  uiClickSound,
  testSound,
  sciFiClick,
  sciFiConfirmation,
  setEnabled: setSoundsEnabled,
  isEnabled: getSoundsEnabled,
  setVolume,
  getVolume,
  presets: soundPresets,
};

export default sounds;
