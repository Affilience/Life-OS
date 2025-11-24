/**
 * Formatting Utilities
 * Number and currency formatting helpers
 */

/**
 * Format currency in compact form (e.g., £12.3k)
 */
export function formatCurrency(value: number, currency: string = '£'): string {
  const abs = Math.abs(value);

  if (abs >= 1000000) {
    return `${currency}${(value / 1000000).toFixed(1)}m`;
  }
  if (abs >= 1000) {
    return `${currency}${(value / 1000).toFixed(1)}k`;
  }
  return `${currency}${value.toFixed(0)}`;
}

/**
 * Format hours in "Xh Ym" format
 */
export function formatHours(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);

  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

/**
 * Format percentage with sign and color
 */
export function formatDelta(deltaPct: number): {
  text: string;
  color: string;
  muted: boolean;
} {
  const abs = Math.abs(deltaPct);
  const sign = deltaPct >= 0 ? '+' : '';
  const text = `${sign}${deltaPct.toFixed(1)}%`;

  // Mute if less than 2%
  const muted = abs < 2;

  // Color
  const color = deltaPct >= 0 ? 'text-green-400' : 'text-red-400';

  return { text, color, muted };
}

/**
 * Format number with compact notation
 */
export function formatNumber(value: number): string {
  const abs = Math.abs(value);

  if (abs >= 1000000) {
    return `${(value / 1000000).toFixed(1)}m`;
  }
  if (abs >= 1000) {
    return `${(value / 1000).toFixed(1)}k`;
  }
  return value.toFixed(0);
}

/**
 * Seeded random number generator
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

  integer(min: number, max: number): number {
    return Math.floor(this.range(min, max + 1));
  }
}
