/**
 * Renderer Types for Cosmic Evolution System
 * Supports hybrid rendering: Canvas, Particles, or Combined
 */

export type RendererType = 'canvas' | 'particles' | 'hybrid';

export interface CanvasRenderer {
  type: 'canvas';
  render: (ctx: CanvasRenderingContext2D, time: number, levelData: any) => void;
  animate?: boolean;
}

export interface ParticlesRenderer {
  type: 'particles';
  config: any; // ISourceOptions from tsParticles
}

export interface HybridRenderer {
  type: 'hybrid';
  canvasBackground?: (ctx: CanvasRenderingContext2D, time: number, levelData: any) => void;
  particlesConfig: any;
  canvasForeground?: (ctx: CanvasRenderingContext2D, time: number, levelData: any) => void;
}

export type StageRenderer = CanvasRenderer | ParticlesRenderer | HybridRenderer;
