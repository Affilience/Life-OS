/**
 * useSounds Hook
 *
 * Provides easy access to sound effects throughout the app.
 * Sounds are subtle, satisfying, and can be toggled on/off.
 */

import { useCallback, useEffect, useState } from 'react';
import sounds from '../services/microInteractions/sounds';

/**
 * Hook for playing sounds in components
 */
export function useSounds() {
  const [enabled, setEnabled] = useState(() => sounds.isEnabled());
  const [volume, setVolumeState] = useState(() => sounds.getVolume());

  // Sync with localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      setEnabled(sounds.isEnabled());
      setVolumeState(sounds.getVolume());
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Toggle sounds on/off
  const toggleSounds = useCallback(() => {
    const newValue = !sounds.isEnabled();
    sounds.setEnabled(newValue);
    setEnabled(newValue);
    // Play a sound to confirm
    if (newValue) {
      sounds.toggleOn();
    }
  }, []);

  // Set volume
  const setVolume = useCallback((vol) => {
    sounds.setVolume(vol);
    setVolumeState(vol);
    sounds.click(); // Feedback
  }, []);

  // Wrapped sound functions that check enabled state
  const play = useCallback({
    // UI Interactions
    click: () => sounds.click(),
    toggleOn: () => sounds.toggleOn(),
    toggleOff: () => sounds.toggleOff(),

    // Task/Habit completion
    complete: () => sounds.taskCompleteSatisfying(),
    pop: () => sounds.pop(),

    // Progress & Achievements
    xp: () => sounds.xpGain(),
    levelUp: () => sounds.levelUp(),
    achievement: () => sounds.achievement(),
    streak: () => sounds.streak(),
    success: () => sounds.success(),

    // Feedback
    notification: () => sounds.notification(),
    error: () => sounds.error(),
    remove: () => sounds.remove(),
  }, []);

  return {
    enabled,
    volume,
    toggleSounds,
    setVolume,
    play,
    // Direct access to sounds service
    sounds,
  };
}

/**
 * Simple hook for just playing sounds (no state management)
 */
export function usePlaySound() {
  return {
    click: sounds.click,
    toggleOn: sounds.toggleOn,
    toggleOff: sounds.toggleOff,
    complete: sounds.taskCompleteSatisfying,
    pop: sounds.pop,
    xp: sounds.xpGain,
    levelUp: sounds.levelUp,
    achievement: sounds.achievement,
    streak: sounds.streak,
    success: sounds.success,
    notification: sounds.notification,
    error: sounds.error,
    remove: sounds.remove,
  };
}

export default useSounds;
