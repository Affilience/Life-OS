/**
 * Pixi filter setup - bloom, noise
 * Using built-in PixiJS filters
 */

import * as PIXI from 'pixi.js';

/**
 * Create bloom filter for glows
 */
export function createBloom(strength: number = 0.8) {
  // Using PixiJS built-in BlurFilter as bloom approximation
  const blur = new (PIXI as any).BlurFilter(strength * 4, 4);
  return blur;
}

/**
 * Create noise filter for living texture
 */
export function createNoise(noise: number = 0.05) {
  const noiseFilter = new (PIXI as any).NoiseFilter(noise, Math.random());
  return noiseFilter;
}

/**
 * Create color matrix filter for season tinting
 */
export function createSeasonTint(color: number): any {
  const filter = new (PIXI as any).ColorMatrixFilter();

  // Extract RGB components
  const r = ((color >> 16) & 0xFF) / 255;
  const g = ((color >> 8) & 0xFF) / 255;
  const b = (color & 0xFF) / 255;

  // Apply tint
  filter.matrix = [
    r, 0, 0, 0, 0,
    0, g, 0, 0, 0,
    0, 0, b, 0, 0,
    0, 0, 0, 1, 0
  ];

  return filter;
}

/**
 * Create subtle glow filter
 */
export function createGlow(color: number = 0x7A5CFF, strength: number = 1.0) {
  // Approximate glow with blur
  const glow = new (PIXI as any).BlurFilter(strength * 8, 3);
  return glow;
}
