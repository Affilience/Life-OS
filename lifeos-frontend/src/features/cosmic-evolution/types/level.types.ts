/**
 * Type definitions for the level-based progression system
 */

export interface LevelData {
  stage: number;
  level: number;
  stageProgress: number; // 0-1 within stage

  // Visual properties
  particleCount: number;
  particleSize: number;
  opacity: number;
  glowIntensity: number;
  colorShift: number; // 0-1 for color interpolation

  // Movement properties
  speedMultiplier: number;
  rotationSpeed: number;
  turbulence: number;

  // Special effects
  hasAura: boolean;
  hasPulse: boolean;
  hasTrails: boolean;
  hasSparkles: boolean;
}

export interface StageSpan {
  stage: number;
  startLevel: number;
  endLevel: number;
  count: number;
}

export interface MilestoneState {
  level10: boolean;
  level25: boolean;
  level50: boolean;
  level75: boolean;
  level100: boolean;
  level150: boolean;
  maxLevel: boolean;
}
