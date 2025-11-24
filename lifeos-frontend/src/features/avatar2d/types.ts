/**
 * Types for Seed → Cosmos Avatar System
 */

export type Season = "discipline" | "ambition" | "focus" | "evolution" | "power";
export type Mood = "calm" | "focused" | "stressed";
export type Stage = "seed" | "sprout" | "sapling" | "young" | "mythic" | "cosmos";

export interface SeedToCosmosProps {
  width?: number;            // default 520
  height?: number;           // default 360
  level: number;             // maps stage (1..N)
  xp: number;
  xpToNext: number;
  streakDays?: number;       // affects aura intensity
  season?: Season;
  mood?: Mood;
  onOpenCoach?: () => void;  // click handler on avatar
  reducedMotion?: boolean;   // respect prefers-reduced-motion
  className?: string;
}

export interface TreeParams {
  trunkH: number;
  trunkW: number;
  branches: number;
  branchSpread: number;
  crownRadius: number;
  leafClusters: number;
  leafSize: number;
}

export interface SproutParams {
  stemH: number;
  leafSize: number;
}

export interface AvatarRefs {
  aura?: any;
  tree?: any;
  particles?: {
    leaf?: any;
    xp?: any;
    nebula?: any;
  };
  filters?: {
    bloom?: any;
    godray?: any;
  };
}

// Color tokens
export const COLORS = {
  bg: "var(--bg-2)",
  accent: "var(--accent)",      // #7A5CFF
  accent2: "var(--accent-2)",   // #5CE1E6
  accent3: "var(--accent-3)",   // #D064FF
  trunk: 0x9BA2AD,
  leafBase: 0x6EE7B7,
  season: {
    discipline: 0x7A5CFF,
    ambition: 0xF2C94C,
    focus: 0x5CE1E6,
    evolution: 0xD064FF,
    power: 0x4F9DFF,
  },
} as const;

// Stage thresholds
export function getLevelStage(level: number): { stage: Stage; index: number } {
  if (level <= 10) return { stage: "seed", index: 0 };
  if (level <= 25) return { stage: "sprout", index: 1 };
  if (level <= 45) return { stage: "sapling", index: 2 };
  if (level <= 70) return { stage: "young", index: 3 };
  if (level <= 100) return { stage: "mythic", index: 4 };
  return { stage: "cosmos", index: 5 };
}
