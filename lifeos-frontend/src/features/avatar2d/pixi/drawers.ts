/**
 * Procedural drawing functions for avatar stages
 * Uses PIXI.Graphics - no external assets needed
 */

import * as PIXI from 'pixi.js';
import { COLORS, type TreeParams, type SproutParams } from '../types';

/**
 * Draw seed stage - small seed with faint root line
 */
export function drawSeed(g: PIXI.Graphics, size: number): void {
  g.clear();

  // Seed body (ellipse)
  g.beginFill(COLORS.trunk, 1.0);
  g.drawEllipse(0, 0, size * 0.8, size);
  g.endFill();

  // Faint root line
  g.lineStyle(1, COLORS.trunk, 0.4);
  g.moveTo(0, size);
  g.bezierCurveTo(
    2, size + 8,
    -2, size + 16,
    0, size + 20
  );

  // Small highlight
  g.beginFill(0xFFFFFF, 0.2);
  g.drawEllipse(-size * 0.2, -size * 0.3, size * 0.3, size * 0.4);
  g.endFill();
}

/**
 * Draw sprout stage - curved stem with two tiny leaves
 */
export function drawSprout(g: PIXI.Graphics, params: SproutParams): void {
  g.clear();

  const { stemH, leafSize } = params;

  // Stem (curved)
  g.lineStyle(2, COLORS.trunk, 1.0);
  g.moveTo(0, stemH);
  g.bezierCurveTo(
    3, stemH * 0.6,
    -2, stemH * 0.3,
    0, 0
  );

  // Left leaf
  g.beginFill(COLORS.leafBase, 1.0);
  g.drawEllipse(-leafSize * 0.7, stemH * 0.4, leafSize, leafSize * 0.6);
  g.endFill();

  // Right leaf
  g.beginFill(COLORS.leafBase, 1.0);
  g.drawEllipse(leafSize * 0.7, stemH * 0.5, leafSize, leafSize * 0.6);
  g.endFill();

  // Leaf veins
  g.lineStyle(0.5, 0x4D7C5C, 0.6);
  g.moveTo(-leafSize * 0.7, stemH * 0.4);
  g.lineTo(-leafSize * 0.3, stemH * 0.4);
  g.moveTo(leafSize * 0.7, stemH * 0.5);
  g.lineTo(leafSize * 0.3, stemH * 0.5);
}

/**
 * Draw tree silhouette - trunk, branches, leaf clusters
 */
export function drawTreeSilhouette(g: PIXI.Graphics, params: TreeParams): void {
  g.clear();

  const {
    trunkH,
    trunkW,
    branches,
    branchSpread,
    crownRadius,
    leafClusters,
    leafSize
  } = params;

  // Trunk (tapered)
  g.beginFill(COLORS.trunk, 1.0);
  g.moveTo(-trunkW / 2, trunkH);
  g.bezierCurveTo(
    -trunkW / 2, trunkH * 0.6,
    -trunkW * 0.3, trunkH * 0.3,
    -trunkW * 0.2, 0
  );
  g.lineTo(trunkW * 0.2, 0);
  g.bezierCurveTo(
    trunkW * 0.3, trunkH * 0.3,
    trunkW / 2, trunkH * 0.6,
    trunkW / 2, trunkH
  );
  g.closePath();
  g.endFill();

  // Branches
  if (branches > 0) {
    g.lineStyle(trunkW * 0.4, COLORS.trunk, 0.9);

    for (let i = 0; i < branches; i++) {
      const angle = ((i / branches) * Math.PI) - Math.PI / 2;
      const startY = trunkH * (0.3 + (i / branches) * 0.5);
      const branchLen = branchSpread + (Math.random() * branchSpread * 0.4);
      const endX = Math.cos(angle) * branchLen;
      const endY = startY - Math.abs(Math.sin(angle)) * branchLen * 0.5;

      // Branch curve
      g.moveTo(0, startY);
      g.bezierCurveTo(
        endX * 0.3, startY - branchLen * 0.1,
        endX * 0.7, endY + branchLen * 0.1,
        endX, endY
      );
    }
  }

  // Leaf clusters (circles)
  if (leafClusters > 0) {
    g.beginFill(COLORS.leafBase, 0.85);

    const clustersToRender = Math.ceil(leafClusters);
    for (let i = 0; i < clustersToRender; i++) {
      const angle = (i / clustersToRender) * Math.PI * 2;
      const dist = crownRadius * (0.5 + Math.random() * 0.5);
      const x = Math.cos(angle) * dist;
      const y = trunkH * 0.2 - Math.abs(Math.sin(angle)) * dist * 0.6;
      const size = leafSize * (0.8 + Math.random() * 0.4);

      g.drawCircle(x, y, size);
    }

    g.endFill();
  }

  // Center crown (largest cluster)
  if (crownRadius > 0) {
    g.beginFill(COLORS.leafBase, 0.9);
    g.drawCircle(0, trunkH * 0.15, crownRadius);
    g.endFill();
  }
}

/**
 * Draw aura ring around avatar
 */
export function drawAura(g: PIXI.Graphics, radius: number, color: number, intensity: number): void {
  g.clear();

  const alpha = Math.min(0.8, intensity);
  const rings = 3;

  for (let i = 0; i < rings; i++) {
    const r = radius + i * 8;
    const a = alpha * (1 - i / rings);

    g.lineStyle(2 - i * 0.5, color, a);
    g.drawCircle(0, 0, r);
  }
}
