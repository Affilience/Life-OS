/**
 * Level System for Cosmic Evolution
 * Maps levels to stages and calculates visual improvements
 */

import type { LevelData, StageSpan } from '../types/level.types';

export class LevelSystem {
  private static readonly LEVELS_PER_STAGE: StageSpan[] = [
    { stage: 1, startLevel: 1, endLevel: 3, count: 3 },      // Subatomic: Levels 1-3
    { stage: 2, startLevel: 4, endLevel: 7, count: 4 },      // Atomic Nuclei: Levels 4-7
    { stage: 3, startLevel: 8, endLevel: 12, count: 5 },     // Atoms: Levels 8-12
    { stage: 4, startLevel: 13, endLevel: 18, count: 6 },    // Molecules: Levels 13-18
    { stage: 5, startLevel: 19, endLevel: 26, count: 8 },    // Cosmic Dust: Levels 19-26
    { stage: 6, startLevel: 27, endLevel: 35, count: 9 },    // Dust Clouds: Levels 27-35
    { stage: 7, startLevel: 36, endLevel: 45, count: 10 },   // Planetesimals: Levels 36-45
    { stage: 8, startLevel: 46, endLevel: 56, count: 11 },   // Protoplanets: Levels 46-56
    { stage: 9, startLevel: 57, endLevel: 68, count: 12 },   // Planets: Levels 57-68
    { stage: 10, startLevel: 69, endLevel: 81, count: 13 },  // Protostars: Levels 69-81
    { stage: 11, startLevel: 82, endLevel: 95, count: 14 },  // Main Sequence: Levels 82-95
    { stage: 12, startLevel: 96, endLevel: 110, count: 15 }, // Binary System: Levels 96-110
    { stage: 13, startLevel: 111, endLevel: 126, count: 16 },// Star Cluster: Levels 111-126
    { stage: 14, startLevel: 127, endLevel: 143, count: 17 },// Emission Nebula: Levels 127-143
    { stage: 15, startLevel: 144, endLevel: 160, count: 17 } // Spiral Galaxy: Levels 144-160
  ];

  /**
   * Get level from total XP
   * Formula: Each level requires exponentially more XP
   */
  static getLevelFromXP(xp: number): number {
    let totalXP = 0;
    let level = 1;

    while (totalXP < xp && level <= 160) {
      const xpForNextLevel = 100 + (10 * Math.pow(level, 1.2));
      if (totalXP + xpForNextLevel > xp) {
        break;
      }
      totalXP += xpForNextLevel;
      level++;
    }

    return Math.min(level, 160);
  }

  /**
   * Get XP required for a specific level
   */
  static getXPForLevel(level: number): number {
    let totalXP = 0;
    for (let i = 1; i < level; i++) {
      totalXP += 100 + (10 * Math.pow(i, 1.2));
    }
    return Math.floor(totalXP);
  }

  /**
   * Get stage info from level
   */
  static getStageFromLevel(level: number): StageSpan | null {
    return this.LEVELS_PER_STAGE.find(s =>
      level >= s.startLevel && level <= s.endLevel
    ) || null;
  }

  /**
   * Calculate progress within current stage (0-1)
   */
  static getStageProgress(level: number): number {
    const stageInfo = this.getStageFromLevel(level);
    if (!stageInfo) return 0;

    const levelInStage = level - stageInfo.startLevel;
    return levelInStage / Math.max(1, stageInfo.count - 1);
  }

  /**
   * Get complete level data with all variations
   */
  static getLevelData(level: number): LevelData {
    const stageInfo = this.getStageFromLevel(level);
    if (!stageInfo) {
      // Default to stage 1 if level is invalid
      return {
        stage: 1,
        level: 1,
        stageProgress: 0,
        particleCount: 12,
        particleSize: 1,
        opacity: 0.4,
        glowIntensity: 0.3,
        colorShift: 0,
        speedMultiplier: 1,
        rotationSpeed: 0.5,
        turbulence: 0.2,
        hasAura: false,
        hasPulse: false,
        hasTrails: false,
        hasSparkles: false
      };
    }

    const stageProgress = this.getStageProgress(level);
    const stage = stageInfo.stage;

    // Base values for the stage
    const baseParticles = this.getBaseParticleCount(stage);
    const baseSize = this.getBaseParticleSize(stage);
    const baseOpacity = this.getBaseOpacity(stage);

    // Progressive improvements within stage
    const levelBonus = stageProgress; // 0 to 1

    return {
      stage,
      level,
      stageProgress,

      // Increase particles by 20% across the stage
      particleCount: Math.floor(baseParticles * (1 + levelBonus * 0.2)),

      // Increase size by 15% across the stage
      particleSize: baseSize * (1 + levelBonus * 0.15),

      // Increase opacity by 10% across the stage
      opacity: Math.min(1, baseOpacity * (1 + levelBonus * 0.1)),

      // Glow intensifies through the stage
      glowIntensity: 0.3 + (levelBonus * 0.4),

      // Color gradually shifts to next stage color
      colorShift: levelBonus,

      // Speed increases by 25% through the stage
      speedMultiplier: 1 + (levelBonus * 0.25),

      // Rotation accelerates
      rotationSpeed: 0.5 + (levelBonus * 0.5),

      // Turbulence increases
      turbulence: 0.2 + (levelBonus * 0.3),

      // Special effects unlock at milestones
      hasAura: stageProgress >= 0.25,
      hasPulse: stageProgress >= 0.5,
      hasTrails: stageProgress >= 0.75,
      hasSparkles: stageProgress >= 0.95
    };
  }

  private static getBaseParticleCount(stage: number): number {
    const counts = [12, 15, 18, 23, 27, 35, 43, 52, 58, 68, 78, 92, 105, 115, 150];
    return counts[stage - 1] || 12;
  }

  private static getBaseParticleSize(stage: number): number {
    // Start at 4px for stage 1, increase by 0.6px per stage
    return 4 + (stage * 0.6);
  }

  private static getBaseOpacity(stage: number): number {
    // Start at 0.65 for good visibility, increase gradually
    return 0.65 + (stage * 0.02);
  }
}
