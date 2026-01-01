/**
 * Ascnd useAvatarSignals Hook
 * Manages avatar animation state and computed values
 */

import { useState, useEffect, useRef } from 'react';
import { AvatarState, AvatarMood } from '../types/avatar';

interface UseAvatarSignalsProps {
  level: number;
  xp: number;
  xpToNext: number;
  streakDays?: number;
  seasonColor?: string;
  mood?: AvatarMood;
}

interface UseAvatarSignalsReturn extends AvatarState {
  pulseXp: () => void;
  pulseLevel: () => void;
}

export const useAvatarSignals = ({
  level,
  xp,
  xpToNext,
  streakDays = 0,
  seasonColor = '#7A5CFF',
  mood = 'calm',
}: UseAvatarSignalsProps): UseAvatarSignalsReturn => {
  const [xpPercent, setXpPercent] = useState(0);
  const [hasLeveledUp, setHasLeveledUp] = useState(false);
  const [auraIntensity, setAuraIntensity] = useState(0.8);

  const prevLevelRef = useRef(level);
  const prevXpRef = useRef(xp);

  // Calculate XP percentage
  useEffect(() => {
    const percent = (xp / xpToNext) * 100;
    setXpPercent(Math.min(percent, 100));
  }, [xp, xpToNext]);

  // Detect level up
  useEffect(() => {
    if (level > prevLevelRef.current) {
      setHasLeveledUp(true);
      setTimeout(() => setHasLeveledUp(false), 1600);
    }
    prevLevelRef.current = level;
  }, [level]);

  // Detect XP change
  useEffect(() => {
    if (xp > prevXpRef.current && level === prevLevelRef.current) {
      // Pulse aura briefly
      setAuraIntensity(1.2);
      setTimeout(() => setAuraIntensity(0.8), 1200);
    }
    prevXpRef.current = xp;
  }, [xp, level]);

  // Aura size based on streaks
  const auraSize = 1.0 + Math.min(streakDays * 0.02, 0.3);

  // Mood tint (numeric value for shader)
  const moodTint = mood === 'calm' ? 0 : mood === 'focused' ? 1 : 2;

  // Season color computed
  const seasonColorComputed = seasonColor;

  const pulseXp = () => {
    setAuraIntensity(1.2);
    setTimeout(() => setAuraIntensity(0.8), 1200);
  };

  const pulseLevel = () => {
    setHasLeveledUp(true);
    setAuraIntensity(1.5);
    setTimeout(() => {
      setHasLeveledUp(false);
      setAuraIntensity(0.8);
    }, 1600);
  };

  return {
    xpPercent,
    hasLeveledUp,
    auraSize,
    auraIntensity,
    moodTint,
    seasonColorComputed,
    pulseXp,
    pulseLevel,
  };
};
