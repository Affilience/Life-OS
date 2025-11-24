/**
 * Atom → Cosmos Avatar Types
 * Type definitions for the evolution avatar system
 */

export type Season = "discipline" | "ambition" | "focus" | "evolution" | "power";
export type Mood = "calm" | "focused" | "stressed";

export type AvatarStage =
  | "atom"           // Stage 1: Singular atom
  | "orbit"          // Stage 2: Atom with orbiting electrons
  | "molecule"       // Stage 3: Molecular cluster
  | "protostar"      // Stage 4: Proto-star (star birth)
  | "solar"          // Stage 5: Solar system
  | "galaxy";        // Stage 6: Galaxy / Full cosmos

export interface AtomToCosmosAvatarProps {
  level: number;
  xp: number;
  xpToNext: number;
  streakDays?: number;
  season?: Season;
  mood?: Mood;
  width?: number;
  height?: number;
  onOpenCoach?: () => void;
  reducedMotion?: boolean;
}

export interface CosmicBackgroundProps {
  id?: string;
  preset?: "dashboard" | "journal" | "knowledge";
  className?: string;
  reducedMotion?: boolean;
}

export interface UserStats {
  level: number;
  xp: number;
  xpToNext: number;
  streakDays: number;
  season: Season;
  mood: Mood;
}

// Rive State Machine Inputs
export interface RiveInputs {
  level: number;           // 1-100+, maps to stage
  xpPercent: number;       // 0..1, progress within current level
  streakIntensity: number; // 0..1, normalized from streak days
  seasonVariant: number;   // 0..4 (discipline, ambition, focus, evolution, power)
  moodVariant: number;     // 0..2 (calm, focused, stressed)
  lowMotion?: number;      // 0/1 for reduced motion
}

// Rive State Machine Triggers
export type RiveTrigger = "xpPulse" | "levelUp" | "streakMilestone";
