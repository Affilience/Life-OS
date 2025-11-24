/**
 * XP Calculation System for Cosmic Evolution
 * Implements polynomial progression with exponent 1.5
 */

export interface StageProgress {
  stage: number;
  xpInStage: number;
  xpNeeded: number;
  progress: number; // 0-1
  nextStage: number;
  totalXP: number;
}

export class XPSystem {
  private static readonly BASE_XP = 100;
  private static readonly EXPONENT = 1.5;
  private static readonly MAX_STAGE = 15;

  /**
   * Calculate XP required to reach a specific stage
   * Formula: XP = 100 * (stage ^ 1.5)
   */
  static getXPForStage(stage: number): number {
    return Math.floor(this.BASE_XP * Math.pow(stage, this.EXPONENT));
  }

  /**
   * Calculate total cumulative XP to reach a stage
   */
  static getTotalXPToStage(stage: number): number {
    let total = 0;
    for (let i = 1; i < stage; i++) {
      total += this.getXPForStage(i);
    }
    return total;
  }

  /**
   * Get current stage and progress from total XP
   */
  static getStageFromXP(currentXP: number): StageProgress {
    for (let stage = 1; stage <= this.MAX_STAGE; stage++) {
      const currentStageTotal = this.getTotalXPToStage(stage);
      const nextStageTotal = this.getTotalXPToStage(stage + 1);

      if (currentXP < nextStageTotal) {
        const xpInStage = currentXP - currentStageTotal;
        const xpNeeded = nextStageTotal - currentStageTotal;
        const progress = xpInStage / xpNeeded;

        return {
          stage,
          xpInStage,
          xpNeeded,
          progress: Math.max(0, Math.min(1, progress)),
          nextStage: stage + 1,
          totalXP: currentXP
        };
      }
    }

    return {
      stage: this.MAX_STAGE,
      xpInStage: 0,
      xpNeeded: 0,
      progress: 1,
      nextStage: this.MAX_STAGE,
      totalXP: currentXP
    };
  }
}
