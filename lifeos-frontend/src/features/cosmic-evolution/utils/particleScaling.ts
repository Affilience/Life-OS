/**
 * Particle scaling system for cosmic evolution stages
 */

import { Easing } from './easingFunctions';

export class ParticleScaling {
  private static readonly BASE_PARTICLES = 10;
  private static readonly MAX_PARTICLES = 200;

  /**
   * Calculate particle count for stage using logarithmic + exponential growth
   * Formula: baseCount + log(stage + 1) * 20 + 1.15^stage
   */
  static getParticleCount(stage: number): number {
    const logComponent = Math.log(stage + 1) * 20;
    const expComponent = Math.pow(1.15, stage);
    const count = Math.floor(this.BASE_PARTICLES + logComponent + expComponent);

    return Math.min(count, this.MAX_PARTICLES);
  }

  /**
   * Get particle size for stage
   */
  static getParticleSize(stage: number): number {
    return 0.5 + (stage * 0.15);
  }

  /**
   * Get emission rate for stage
   */
  static getEmissionRate(stage: number): number {
    return 5 + (stage * 2.5);
  }

  /**
   * Get particle lifespan for stage
   */
  static getLifespan(stage: number): number {
    return 0.8 + (stage * 0.05);
  }

  /**
   * Get particle velocity for stage
   */
  static getVelocity(stage: number): number {
    return 1.0 + (stage * 0.2);
  }

  /**
   * Get glow intensity for stage
   */
  static getGlowIntensity(stage: number): number {
    return 0.6 + (stage * 0.027);
  }

  /**
   * Progressive blend during XP gain
   * Returns values for current/next stage interpolation
   */
  static getEvolutionBlend(progress: number): {
    currentStageAlpha: number;
    nextStagePreviewAlpha: number;
    glowIntensity: number;
  } {
    const eased = Easing.easeInOutCubic(progress);

    return {
      currentStageAlpha: 1 - eased * 0.3,
      nextStagePreviewAlpha: eased * 0.2,
      glowIntensity: eased * 1.5
    };
  }
}
