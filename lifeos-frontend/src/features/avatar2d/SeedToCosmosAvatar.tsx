/**
 * Seed → Cosmos Avatar - Main Component
 * 2D avatar system using PixiJS for elegant procedural visuals
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as PIXI from 'pixi.js';
import {
  type SeedToCosmosProps,
  COLORS,
  getLevelStage,
  type Season,
  type TreeParams,
  type AvatarRefs
} from './types';
import { drawSeed, drawSprout, drawTreeSilhouette, drawAura } from './pixi/drawers';
import { createLeafEmitter, createXPBurstEmitter, createNebulaEmitter } from './pixi/emitters';
import { createBloom, createNoise } from './pixi/filters';
import { useAvatarTimeline } from './useAvatarTimeline';

export function SeedToCosmosAvatar({
  width = 520,
  height = 360,
  level,
  xp,
  xpToNext,
  streakDays = 0,
  season = 'discipline',
  mood = 'calm',
  onOpenCoach,
  reducedMotion = false,
  className = ''
}: SeedToCosmosProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const containersRef = useRef<{
    root?: PIXI.Container;
    nebula?: PIXI.Container;
    aura?: PIXI.Container;
    tree?: PIXI.Container;
    particles?: PIXI.Container;
  }>({});
  const graphicsRef = useRef<{
    auraGfx?: PIXI.Graphics;
    treeGfx?: PIXI.Graphics;
  }>({});
  const emittersRef = useRef<{
    leaf?: ReturnType<typeof createLeafEmitter>;
    xp?: ReturnType<typeof createXPBurstEmitter>;
    nebula?: ReturnType<typeof createNebulaEmitter>;
  }>({});

  const [isReady, setIsReady] = useState(false);

  // Calculate derived values
  const xpPercent = Math.min(1, Math.max(0, xp / xpToNext));
  const { stage, index: stageIndex } = getLevelStage(level);
  const auraIntensity = Math.min(1, streakDays / 30);
  const seasonColor = COLORS.season[season];

  // Animation timeline
  const avatarRefs: AvatarRefs = {
    aura: containersRef.current.aura,
    tree: containersRef.current.tree,
    particles: {
      leaf: emittersRef.current.leaf,
      xp: emittersRef.current.xp,
      nebula: emittersRef.current.nebula
    },
    filters: {}
  };

  const timeline = useAvatarTimeline(avatarRefs, { reducedMotion });

  // Initialize Pixi app
  useEffect(() => {
    if (!canvasRef.current || appRef.current) return;

    const app = new PIXI.Application({
      view: canvasRef.current,
      width,
      height,
      backgroundColor: 0x0a0e27,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true
    });

    appRef.current = app;

    // Create layer containers
    const root = new PIXI.Container();
    root.x = width / 2;
    root.y = height / 2;
    app.stage.addChild(root);

    const nebula = new PIXI.Container();
    const aura = new PIXI.Container();
    const tree = new PIXI.Container();
    const particles = new PIXI.Container();

    root.addChild(nebula, aura, tree, particles);

    containersRef.current = { root, nebula, aura, tree, particles };

    // Create graphics objects
    graphicsRef.current.auraGfx = new PIXI.Graphics();
    graphicsRef.current.treeGfx = new PIXI.Graphics();

    aura.addChild(graphicsRef.current.auraGfx);
    tree.addChild(graphicsRef.current.treeGfx);

    // Create emitters
    emittersRef.current.leaf = createLeafEmitter(particles, seasonColor);
    emittersRef.current.xp = createXPBurstEmitter(particles);
    emittersRef.current.nebula = createNebulaEmitter(nebula);

    // Add filters
    const bloom = createBloom(0.6);
    const noise = createNoise(0.03);
    aura.filters = [bloom];
    root.filters = [noise];

    // Animation ticker
    app.ticker.add((delta) => {
      emittersRef.current.leaf?.update(delta);
      emittersRef.current.xp?.update(delta);
      emittersRef.current.nebula?.update(delta);
    });

    setIsReady(true);

    return () => {
      if (appRef.current) {
        emittersRef.current.leaf?.stop();
        emittersRef.current.xp?.stop?.();
        emittersRef.current.nebula?.stop();
        appRef.current.destroy(true, { children: true });
        appRef.current = null;
      }
    };
  }, []);

  // Redraw avatar when stage/xp changes
  useEffect(() => {
    if (!isReady || !graphicsRef.current.treeGfx || !graphicsRef.current.auraGfx) return;

    const treeGfx = graphicsRef.current.treeGfx;
    const auraGfx = graphicsRef.current.auraGfx;

    // Draw aura
    drawAura(auraGfx, 80 + stageIndex * 10, seasonColor, auraIntensity);

    // Draw tree based on stage
    if (stage === 'seed') {
      drawSeed(treeGfx, 12 + level * 0.5);
    } else if (stage === 'sprout') {
      drawSprout(treeGfx, {
        stemH: 40 + (level - 10) * 2,
        leafSize: 8 + (level - 10) * 0.5
      });
    } else {
      // sapling, young, mythic, cosmos
      const params: TreeParams = {
        trunkH: 80 + stageIndex * 24 + 18 * xpPercent,
        trunkW: 6 + stageIndex * 2,
        branches: [0, 0, 3, 6, 10, 12][stageIndex] || 12,
        branchSpread: 25 + stageIndex * 3,
        crownRadius: 20 + stageIndex * 8,
        leafClusters: ([0, 0, 3, 6, 10, 12][stageIndex] || 12) * (0.8 + 0.6 * xpPercent),
        leafSize: 12 + stageIndex * 3
      };

      drawTreeSilhouette(treeGfx, params);
    }

    // Start/stop particle emitters based on stage
    if (stageIndex >= 4 && !reducedMotion) {
      emittersRef.current.leaf?.start();
    } else {
      emittersRef.current.leaf?.stop();
    }

    if (stageIndex >= 5 && !reducedMotion) {
      emittersRef.current.nebula?.start();
    } else {
      emittersRef.current.nebula?.stop();
    }
  }, [isReady, stage, stageIndex, level, xpPercent, seasonColor, auraIntensity, reducedMotion]);

  // Apply mood sway
  useEffect(() => {
    if (isReady && mood) {
      timeline.setMood(mood);
    }
  }, [isReady, mood, timeline]);

  // Handle click
  const handleClick = useCallback(() => {
    onOpenCoach?.();
  }, [onOpenCoach]);

  // Expose pulse functions via ref (for external XP/level updates)
  useEffect(() => {
    if (isReady) {
      (window as any).__avatarTimeline = timeline;
    }
  }, [isReady, timeline]);

  return (
    <div
      className={className}
      style={{ position: 'relative', width, height, cursor: onOpenCoach ? 'pointer' : 'default' }}
      onClick={handleClick}
      role={onOpenCoach ? 'button' : undefined}
      tabIndex={onOpenCoach ? 0 : undefined}
      aria-label={onOpenCoach ? 'Open AI Coach' : undefined}
      onKeyDown={(e) => {
        if (onOpenCoach && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      <canvas ref={canvasRef} style={{ display: 'block' }} />

      {/* Stage label */}
      <div
        style={{
          position: 'absolute',
          bottom: 8,
          left: 8,
          fontSize: 11,
          color: '#9BA2AD',
          fontWeight: 500,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          pointerEvents: 'none'
        }}
      >
        {stage} • Lv {level}
      </div>
    </div>
  );
}
