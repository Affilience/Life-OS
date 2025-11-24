/**
 * Type definitions for Module Constellation Progression System
 * Each module has its own constellation that lights up as user progresses
 */

export type ModuleId = "journal" | "knowledge" | "health" | "finance" | "productivity";

export interface StarNode {
  id: string;
  x: number;   // 0..1 normalized coordinate
  y: number;   // 0..1 normalized coordinate
  label?: string;
  requirementXp: number;
  importance?: "core" | "minor";
}

export interface StarLink {
  from: string;  // Star ID
  to: string;    // Star ID
}

export interface ModuleConstellation {
  module: ModuleId;
  displayName: string;
  stars: StarNode[];
  links: StarLink[];
  maxXp: number;
  description?: string;
}

export interface ConstellationState {
  unlockedStars: string[];
  totalStars: number;
  progress: number; // 0..1
}
