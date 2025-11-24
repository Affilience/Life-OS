/**
 * Consistency Heatmap Color Scale
 * Dark Aurora theme using violet accent
 */

export interface ColorScale {
  threshold: number; // score value
  color: string;     // rgba or CSS var
}

/**
 * 5-step scale + empty
 * Using violet accent with increasing opacity
 */
export const CONSISTENCY_SCALE: ColorScale[] = [
  { threshold: 0, color: 'rgba(255, 255, 255, 0.06)' },     // empty/no activity
  { threshold: 10, color: 'rgba(122, 92, 255, 0.20)' },     // faint violet
  { threshold: 30, color: 'rgba(122, 92, 255, 0.38)' },     // light
  { threshold: 55, color: 'rgba(122, 92, 255, 0.56)' },     // medium
  { threshold: 80, color: 'rgba(122, 92, 255, 0.74)' },     // strong
  { threshold: 95, color: 'rgba(122, 92, 255, 0.92)' },     // strongest
];

/**
 * Get color for a given score
 */
export function getColorForScore(score: number): string {
  // Find the highest threshold that the score meets or exceeds
  for (let i = CONSISTENCY_SCALE.length - 1; i >= 0; i--) {
    if (score >= CONSISTENCY_SCALE[i].threshold) {
      return CONSISTENCY_SCALE[i].color;
    }
  }
  return CONSISTENCY_SCALE[0].color; // fallback to empty
}

/**
 * Seasonal tint overlays (optional)
 */
export const SEASON_TINTS = {
  discipline: 'rgba(122, 92, 255, 0.1)',  // violet
  ambition: 'rgba(242, 201, 76, 0.1)',    // gold
  focus: 'rgba(59, 130, 246, 0.1)',       // blue
  evolution: 'rgba(16, 185, 129, 0.1)',   // green
  power: 'rgba(239, 68, 68, 0.1)',        // red
};
