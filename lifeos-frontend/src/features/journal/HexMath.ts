/**
 * Hexagon Grid Mathematics
 * Pointy-top hexagons in odd-q staggered layout
 */

import {
  startOfDay,
  subDays,
  addDays,
  startOfWeek,
  format,
} from 'date-fns';
import { DayISO, RangeWeeks } from './journal.types';

/**
 * Generate SVG polygon points for a pointy-top hexagon
 * @param w Width of the hex
 * @param h Height of the hex
 * @returns SVG points string
 */
export function hexPoints(w: number, h: number): string {
  const halfW = w / 2;
  const quarterH = h / 4;
  const halfH = h / 2;

  // Pointy-top hex: 6 points starting from top
  return `
    ${halfW},0
    ${w},${quarterH}
    ${w},${h - quarterH}
    ${halfW},${h}
    0,${h - quarterH}
    0,${quarterH}
  `.trim().replace(/\s+/g, ' ');
}

/**
 * Calculate grid positions for honeycomb layout with month-specific organic variation
 * @param cols Number of columns
 * @param rows Number of rows
 * @param w Hex width
 * @param h Hex height
 * @param gap Gap between hexes
 * @param monthSeed Optional month seed for unique patterns (e.g., "2025-01")
 * @returns Array of {x, y} positions
 */
export function gridPositions(
  cols: number,
  rows: number,
  w: number,
  h: number,
  gap: number,
  monthSeed?: string
): { x: number; y: number; col: number; row: number }[] {
  const positions: { x: number; y: number; col: number; row: number }[] = [];

  // For pointy-top hexagons in odd-q layout:
  // - Horizontal: hexagons overlap by 25% of width, so spacing is 75% + gap
  // - Vertical: full height between hexagons in same column
  const xStep = (w * 0.75) + gap;
  const yStep = h + gap;

  // Generate month-specific seed if provided
  const monthOffset = monthSeed ? hashString(monthSeed) : 0;

  // Add subtle organic variation for less uniform appearance
  const addVariation = (value: number, seed: number, strength: number = 0.3) => {
    // Deterministic pseudo-random variation based on position seed + month seed
    const combinedSeed = seed + monthOffset;
    const variation = Math.sin(combinedSeed * 12.9898 + combinedSeed * 78.233) * 43758.5453;
    const normalized = (variation - Math.floor(variation)) * 2 - 1; // -1 to 1
    return value + (normalized * gap * strength); // Random offset
  };

  // Month-specific pattern variations
  const getMonthPattern = () => {
    if (!monthSeed) return 'organic';

    const hash = hashString(monthSeed);
    const patterns = ['organic', 'spiral', 'wave', 'scattered', 'clustered'];
    return patterns[Math.abs(hash) % patterns.length];
  };

  const pattern = getMonthPattern();

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      // Odd columns are offset down by half height
      const offsetY = col % 2 === 1 ? (h / 2) + (gap / 2) : 0;

      // Base position
      const baseX = col * xStep;
      const baseY = row * yStep + offsetY;

      // Add pattern-specific variations
      let finalX = baseX;
      let finalY = baseY;
      const seed = col * 100 + row;

      switch (pattern) {
        case 'spiral':
          // Subtle spiral effect from center
          const centerX = (cols * xStep) / 2;
          const centerY = (rows * yStep) / 2;
          const angle = Math.atan2(baseY - centerY, baseX - centerX);
          const dist = Math.sqrt(Math.pow(baseX - centerX, 2) + Math.pow(baseY - centerY, 2));
          const spiralOffset = Math.sin(dist * 0.02 + angle) * gap * 0.4;
          finalX = addVariation(baseX + spiralOffset * Math.cos(angle), seed, 0.2);
          finalY = addVariation(baseY + spiralOffset * Math.sin(angle), seed + 0.5, 0.2);
          break;

        case 'wave':
          // Wave pattern across columns
          const waveOffset = Math.sin(col * 0.5 + monthOffset) * gap * 0.5;
          finalX = addVariation(baseX, seed, 0.2);
          finalY = addVariation(baseY + waveOffset, seed + 0.5, 0.2);
          break;

        case 'scattered':
          // More scattered, random positioning
          finalX = addVariation(baseX, seed, 0.5);
          finalY = addVariation(baseY, seed + 0.5, 0.5);
          break;

        case 'clustered':
          // Cluster cells toward center with variation
          const clusterCenterX = (cols * xStep) / 2;
          const clusterCenterY = (rows * yStep) / 2;
          const pullStrength = 0.1;
          finalX = addVariation(baseX + (clusterCenterX - baseX) * pullStrength, seed, 0.2);
          finalY = addVariation(baseY + (clusterCenterY - baseY) * pullStrength, seed + 0.5, 0.2);
          break;

        case 'organic':
        default:
          // Original organic variation
          finalX = addVariation(baseX, seed, 0.3);
          finalY = addVariation(baseY, seed + 0.5, 0.3);
          break;
      }

      positions.push({
        x: finalX,
        y: finalY,
        col,
        row,
      });
    }
  }

  return positions;
}

/**
 * Simple string hash function for consistent month-based variation
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
}

/**
 * Convert weeks range to grid dimensions and dates
 * @param rangeWeeks Number of weeks to show
 * @param startISO Optional start date (defaults to today - range)
 * @returns Grid configuration with dates array
 */
export function weeksToGrid(
  rangeWeeks: RangeWeeks,
  startISO?: DayISO
): { dates: DayISO[]; cols: number; rows: number } {
  const today = startOfDay(new Date());
  const totalDays = rangeWeeks * 7;

  // Start from the beginning of the range (go back totalDays - 1)
  const start = startISO
    ? new Date(startISO)
    : subDays(today, totalDays - 1);

  // Generate all dates in range
  const dates: DayISO[] = [];
  for (let i = 0; i < totalDays; i++) {
    const date = addDays(start, i);
    // Don't include future dates
    if (date <= today) {
      dates.push(format(date, 'yyyy-MM-dd'));
    }
  }

  // Calculate grid dimensions
  // For honeycomb, we want roughly square aspect ratio
  // cols = sqrt(totalDays * aspect)  where aspect ~= 1.15 (hex width/height ratio)
  const cols = Math.ceil(Math.sqrt(totalDays * 1.15));
  const rows = Math.ceil(totalDays / cols);

  return { dates, cols, rows };
}

/**
 * Get mood color for hex tinting
 */
export function getMoodColor(mood?: string): string {
  switch (mood) {
    case 'calm':
      return 'rgba(59, 130, 246, 0.3)'; // cyan/blue
    case 'focused':
      return 'rgba(122, 92, 255, 0.3)'; // violet
    case 'stressed':
      return 'rgba(251, 191, 36, 0.3)'; // amber/gold
    case 'neutral':
    default:
      return 'transparent';
  }
}
