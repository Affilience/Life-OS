/**
 * Growth Tree Logic
 * Calculates tree growth parameters based on user stats
 */

import { Season, Mood, TreeStage, GrowthParams } from './tree.types';

/**
 * Map level to tree stage
 */
export function getStageFromLevel(level: number): TreeStage {
  if (level === 1) return 'seed';
  if (level === 2) return 'sprout';
  if (level === 3) return 'sapling';
  if (level === 4) return 'young';
  if (level === 5) return 'mature';
  return 'mythic'; // 6+
}

/**
 * Get base branch count for stage
 */
function getBranchCountForStage(stage: TreeStage): number {
  switch (stage) {
    case 'seed':
      return 0;
    case 'sprout':
      return 1;
    case 'sapling':
      return 3;
    case 'young':
      return 6;
    case 'mature':
      return 10;
    case 'mythic':
      return 14;
  }
}

/**
 * Clamp value between min and max
 */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Calculate all growth parameters from user state
 */
export function growthFromState(
  level: number,
  xp: number,
  xpToNext: number,
  streakDays: number,
  season: Season,
  mood: Mood
): GrowthParams {
  const stage = getStageFromLevel(level);
  const xpPercent = clamp(xp / xpToNext, 0, 1);

  // Trunk parameters
  const trunkThickness = 6 + level * 2 + xpPercent * 1.5;
  const trunkHeight = 140 + level * 18 + xpPercent * 12;

  // Branch parameters
  const baseBranchCount = getBranchCountForStage(stage);
  const branchCount = baseBranchCount;
  const branchSpread = 40 + level * 4;

  // Leaf parameters
  const leafClusters = Math.round(branchCount * (0.8 + xpPercent * 0.6));
  const leafDensity = clamp(0.3 + xpPercent * 0.6, 0, 1);

  // Aura parameters
  const auraIntensity = Math.min(1, streakDays / 30);

  // Seasonal tint strength
  const leafTintStrength = 0.4 + (xpPercent * 0.2);

  return {
    stage,
    trunkThickness,
    trunkHeight,
    branchCount,
    branchSpread,
    leafClusters,
    leafDensity,
    auraIntensity,
    leafTintStrength,
  };
}

/**
 * Seeded pseudo-random number generator (for stable layouts)
 */
export class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  range(min: number, max: number): number {
    return min + this.next() * (max - min);
  }
}

/**
 * Generate branch positions and paths
 */
export function generateBranches(
  params: GrowthParams,
  trunkX: number,
  trunkY: number,
  seed: number = 42
): Array<{
  id: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  controlX: number;
  controlY: number;
  thickness: number;
}> {
  const branches: Array<any> = [];
  const rng = new SeededRandom(seed);
  const { branchCount, branchSpread, trunkHeight, trunkThickness } = params;

  // Start branches from upper portion of trunk
  const startY = trunkY - trunkHeight * 0.6;

  for (let i = 0; i < branchCount; i++) {
    const angle = ((i / branchCount) * 360 - 180 + rng.range(-20, 20)) * (Math.PI / 180);
    const length = rng.range(40, 80) + trunkHeight * 0.2;
    const yOffset = rng.range(-trunkHeight * 0.3, trunkHeight * 0.1);

    const startX = trunkX + rng.range(-trunkThickness * 0.3, trunkThickness * 0.3);
    const startYPos = startY + yOffset;

    const endX = startX + Math.cos(angle) * length;
    const endY = startYPos - Math.abs(Math.sin(angle)) * length * 0.8;

    // Control point for bezier curve
    const controlX = startX + Math.cos(angle) * length * 0.6;
    const controlY = startYPos - length * 0.3;

    const thickness = trunkThickness * 0.3 * rng.range(0.6, 1.0);

    branches.push({
      id: `branch-${i}`,
      startX,
      startY: startYPos,
      endX,
      endY,
      controlX,
      controlY,
      thickness,
    });
  }

  return branches;
}

/**
 * Generate leaf cluster positions
 */
export function generateLeafClusters(
  params: GrowthParams,
  branches: Array<{ endX: number; endY: number }>,
  seed: number = 42
): Array<{
  id: string;
  x: number;
  y: number;
  count: number;
  spread: number;
}> {
  const clusters: Array<any> = [];
  const rng = new SeededRandom(seed + 1000);
  const { leafClusters, leafDensity } = params;

  for (let i = 0; i < leafClusters && i < branches.length; i++) {
    const branch = branches[i % branches.length];
    const offsetX = rng.range(-15, 15);
    const offsetY = rng.range(-15, 15);

    const count = Math.round(leafDensity * rng.range(4, 10));
    const spread = rng.range(12, 20);

    clusters.push({
      id: `cluster-${i}`,
      x: branch.endX + offsetX,
      y: branch.endY + offsetY,
      count,
      spread,
    });
  }

  return clusters;
}
