/**
 * Growth Tree Types
 * Type definitions for the 2D tree visualization system
 */

export type Season = 'discipline' | 'ambition' | 'focus' | 'evolution' | 'power';
export type Mood = 'calm' | 'focused' | 'stressed';
export type TreeStage = 'seed' | 'sprout' | 'sapling' | 'young' | 'mature' | 'mythic';

export interface TreeProps {
  level: number;
  xp: number;
  xpToNext: number;
  streakDays?: number;
  season?: Season;
  mood?: Mood;
  width?: number;
  height?: number;
  onOpenCoach?: () => void;
}

export interface GrowthParams {
  stage: TreeStage;
  trunkThickness: number;
  trunkHeight: number;
  branchCount: number;
  branchSpread: number;
  leafClusters: number;
  leafDensity: number;
  auraIntensity: number;
  leafTintStrength: number;
}

export interface TreeState {
  level: number;
  xp: number;
  xpToNext: number;
  streakDays: number;
  season: Season;
  mood: Mood;
  set(partial: Partial<TreeState>): void;
}

export interface BranchData {
  id: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  controlX: number;
  controlY: number;
  thickness: number;
}

export interface LeafClusterData {
  id: string;
  x: number;
  y: number;
  count: number;
  spread: number;
}

export interface SeasonPalette {
  leafTint: string;
  glow: string;
}
