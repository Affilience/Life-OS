/**
 * Growth Tree Color Palettes
 * Seasonal color themes and design tokens
 */

import { Season, SeasonPalette } from './tree.types';

export const TREE_COLORS = {
  trunk: '#9BA2AD',
  leafBase: '#6EE7B7',
  glow: 'var(--accent)',

  season: {
    discipline: {
      leafTint: '#7A5CFF',
      glow: '#7A5CFF',
    },
    ambition: {
      leafTint: '#F2C94C',
      glow: '#F2C94C',
    },
    focus: {
      leafTint: '#5CE1E6',
      glow: '#5CE1E6',
    },
    evolution: {
      leafTint: '#D064FF',
      glow: '#D064FF',
    },
    power: {
      leafTint: '#4F9DFF',
      glow: '#4F9DFF',
    },
  } as Record<Season, SeasonPalette>,
} as const;

/**
 * Get season palette for given season
 */
export function getSeasonPalette(season: Season): SeasonPalette {
  return TREE_COLORS.season[season];
}

/**
 * Blend two colors (hex format) by given ratio
 */
export function blendColors(color1: string, color2: string, ratio: number): string {
  const hex = (color: string) => parseInt(color.replace('#', ''), 16);
  const r1 = (hex(color1) >> 16) & 0xff;
  const g1 = (hex(color1) >> 8) & 0xff;
  const b1 = hex(color1) & 0xff;

  const r2 = (hex(color2) >> 16) & 0xff;
  const g2 = (hex(color2) >> 8) & 0xff;
  const b2 = hex(color2) & 0xff;

  const r = Math.round(r1 + (r2 - r1) * ratio);
  const g = Math.round(g1 + (g2 - g1) * ratio);
  const b = Math.round(b1 + (b2 - b1) * ratio);

  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

/**
 * Get final leaf color by blending base with seasonal tint
 */
export function getLeafColor(season: Season, tintStrength: number): string {
  const palette = getSeasonPalette(season);
  return blendColors(TREE_COLORS.leafBase, palette.leafTint, tintStrength);
}
