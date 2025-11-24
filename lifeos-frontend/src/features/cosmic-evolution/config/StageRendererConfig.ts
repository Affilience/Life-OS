/**
 * Stage Renderer Configuration
 * Maps each stage to its appropriate rendering method
 */

import { CanvasRenderers } from '../renderers/CanvasRenderers';

export interface StageRendererConfig {
  type: 'canvas' | 'particles' | 'hybrid';
  canvasRenderer?: (ctx: CanvasRenderingContext2D, time: number, levelData: any) => void;
  useParticles?: boolean; // For hybrid: whether to also show particles
  bloomIntensity?: number; // CSS filter bloom (brightness)
}

export const STAGE_RENDERER_CONFIG: Record<number, StageRendererConfig> = {
  // STAGE 1: Tiny quantum fluctuation (the beginning)
  1: {
    type: 'canvas',
    canvasRenderer: CanvasRenderers.quantumFluctuation,
    bloomIntensity: 1.15
  },

  // STAGE 2: Growing fundamental particle
  2: {
    type: 'canvas',
    canvasRenderer: CanvasRenderers.fundamentalParticle,
    bloomIntensity: 1.2
  },

  // STAGE 3: Atoms with orbital mechanics
  3: {
    type: 'canvas',
    canvasRenderer: CanvasRenderers.atoms,
    bloomIntensity: 1.25
  },

  // STAGE 4: Molecules
  4: {
    type: 'canvas',
    canvasRenderer: CanvasRenderers.molecules,
    bloomIntensity: 1.15
  },

  // STAGE 5: Cosmic dust grain
  5: {
    type: 'canvas',
    canvasRenderer: CanvasRenderers.cosmicDustGrain,
    bloomIntensity: 1.05
  },

  // STAGE 6: Dust Clouds
  6: {
    type: 'canvas',
    canvasRenderer: CanvasRenderers.dustClouds,
    bloomIntensity: 1.05
  },

  // STAGE 7: Planetesimals
  7: {
    type: 'canvas',
    canvasRenderer: CanvasRenderers.planetesimals,
    bloomIntensity: 1.0
  },

  // STAGE 8: Protoplanets
  8: {
    type: 'canvas',
    canvasRenderer: CanvasRenderers.protoplanets,
    bloomIntensity: 1.3
  },

  // STAGE 9: Planets
  9: {
    type: 'canvas',
    canvasRenderer: CanvasRenderers.planets,
    bloomIntensity: 1.2
  },

  // STAGE 10: Protostar
  10: {
    type: 'canvas',
    canvasRenderer: CanvasRenderers.protostar,
    bloomIntensity: 1.5
  },

  // STAGE 11: Main Sequence Star
  11: {
    type: 'canvas',
    canvasRenderer: CanvasRenderers.mainSequenceStar,
    bloomIntensity: 1.6
  },

  // STAGE 12: Binary Stars
  12: {
    type: 'canvas',
    canvasRenderer: CanvasRenderers.binaryStars,
    bloomIntensity: 1.5
  },

  // STAGE 13: Star Cluster
  13: {
    type: 'canvas',
    canvasRenderer: CanvasRenderers.starCluster,
    bloomIntensity: 1.35
  },

  // STAGE 14: Emission Nebula
  14: {
    type: 'canvas',
    canvasRenderer: CanvasRenderers.emissionNebula,
    bloomIntensity: 1.7
  },

  // STAGE 15: Spiral Galaxy
  15: {
    type: 'canvas',
    canvasRenderer: CanvasRenderers.spiralGalaxy,
    bloomIntensity: 1.4
  }
};
