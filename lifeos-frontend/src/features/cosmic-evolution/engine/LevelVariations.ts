/**
 * Level Variations Engine
 * Applies progressive visual improvements based on level within stage
 */

import type { ISourceOptions } from "@tsparticles/engine";
import { LevelSystem } from './LevelSystem';

export class LevelVariations {
  /**
   * Apply level-specific variations to base stage config
   */
  static applyLevelVariations(
    baseConfig: ISourceOptions,
    level: number
  ): ISourceOptions {
    const levelData = LevelSystem.getLevelData(level);

    const config: ISourceOptions = {
      ...baseConfig,
      particles: {
        ...baseConfig.particles,
        number: {
          value: levelData.particleCount
        },
        size: {
          ...baseConfig.particles?.size,
          value: {
            min: levelData.particleSize * 0.7,
            max: levelData.particleSize * 1.3
          }
        },
        opacity: {
          ...baseConfig.particles?.opacity,
          value: {
            min: levelData.opacity * 0.7,
            max: levelData.opacity
          },
          animation: {
            enable: levelData.hasPulse,
            speed: levelData.hasPulse ? 2 : 1,
            sync: false
          }
        },
        move: {
          ...baseConfig.particles?.move,
          speed: typeof baseConfig.particles?.move?.speed === 'object'
            ? {
                min: ((baseConfig.particles.move.speed as any).min || 1) * levelData.speedMultiplier,
                max: ((baseConfig.particles.move.speed as any).max || 2) * levelData.speedMultiplier
              }
            : (baseConfig.particles?.move?.speed || 1) * levelData.speedMultiplier
        },
        rotate: {
          ...baseConfig.particles?.rotate,
          animation: {
            enable: true,
            speed: levelData.rotationSpeed * 10,
            sync: false
          }
        }
      }
    };

    // Add color interpolation
    const interpolatedColors = this.getInterpolatedColor(
      levelData.stage,
      levelData.stageProgress
    );

    if (config.particles) {
      config.particles.color = {
        value: interpolatedColors
      };
    }

    return config;
  }

  /**
   * Get interpolated color based on level progression
   */
  static getInterpolatedColor(stage: number, progress: number): string[] {
    const stageColors: Record<number, [string[], string[]]> = {
      1: [["#9BB0FF"], ["#CAD7FF", "#9BB0FF"]],
      2: [["#FFF4EA"], ["#FFE4D1", "#FFD2A1"]],
      3: [["#FFD2A1", "#9BB0FF"], ["#FFCC99", "#AABfFF"]],
      4: [["#FFFFFF", "#FF6B6B", "#808080"], ["#F0F0F0", "#FF5555", "#696969"]],
      5: [["#8B4513"], ["#A0522D", "#D2691E"]],
      6: [["#1A1A1A", "#FF6B35"], ["#2A2A2A", "#FF8C00"]],
      7: [["#696969"], ["#808080", "#A9A9A9"]],
      8: [["#808080", "#FF6347"], ["#909090", "#FF7F50"]],
      9: [["#4682B4", "#8B7355"], ["#5F9FD8", "#A0826D"]],
      10: [["#CD5C5C", "#FF8C00"], ["#DC143C", "#FFA500"]],
      11: [["#FFD700"], ["#FFDF00", "#FFC700"]],
      12: [["#FFD2A1", "#FFCC6F"], ["#FFE4B5", "#FFD700"]],
      13: [["#AABfFF", "#FFD2A1"], ["#B8C7FF", "#FFE4B5"]],
      14: [["#FF0040", "#00FFB2"], ["#FF1A5C", "#00FFC8"]],
      15: [["#AABfFF", "#FFD2A1", "#FF0040"], ["#C8D4FF", "#FFE4B5", "#FF3366"]]
    };

    const colors = stageColors[stage] || stageColors[1];
    const startColors = colors[0];
    const endColors = colors[1];

    // Interpolate between start and end colors
    return startColors.map((startColor, index) => {
      const endColor = endColors[index] || endColors[0];
      return this.lerpHexColor(startColor, endColor, progress);
    });
  }

  private static lerpHexColor(start: string, end: string, progress: number): string {
    const startRgb = this.hexToRgb(start);
    const endRgb = this.hexToRgb(end);

    const r = Math.round(startRgb.r + (endRgb.r - startRgb.r) * progress);
    const g = Math.round(startRgb.g + (endRgb.g - startRgb.g) * progress);
    const b = Math.round(startRgb.b + (endRgb.b - startRgb.b) * progress);

    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  }

  private static hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  }

  static getAuraColor(stage: number): string {
    const auraColors = [
      "#9BB0FF", "#FFF4EA", "#FFD2A1", "#FFFFFF", "#8B4513",
      "#FF6B35", "#696969", "#FF6347", "#4682B4", "#CD5C5C",
      "#FFD700", "#FFCC6F", "#AABfFF", "#FF0040", "#C8D4FF"
    ];
    return auraColors[stage - 1] || "#FFFFFF";
  }
}
