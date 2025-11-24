/**
 * Easing functions for smooth animations
 * All functions take t (0-1) and return eased value (0-1)
 */
export const Easing = {
  /**
   * Smooth start and end - RECOMMENDED for evolution transitions
   * Use for 0.6-1.5 second stage transitions
   */
  easeInOutCubic(t: number): number {
    return t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
  },

  /**
   * Fast start, slow end - RECOMMENDED for level-up celebrations
   * Use for excitement → calm transitions
   */
  easeOutQuad(t: number): number {
    return 1 - (1 - t) * (1 - t);
  },

  /**
   * Smooth acceleration/deceleration
   */
  easeInOutQuad(t: number): number {
    return t < 0.5
      ? 2 * t * t
      : 1 - Math.pow(-2 * t + 2, 2) / 2;
  },

  /**
   * Dramatic effect with sharp deceleration
   */
  easeOutExpo(t: number): number {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  },

  /**
   * Natural, circular motion feel
   */
  easeInOutCirc(t: number): number {
    return t < 0.5
      ? (1 - Math.sqrt(1 - Math.pow(2 * t, 2))) / 2
      : (Math.sqrt(1 - Math.pow(-2 * t + 2, 2)) + 1) / 2;
  },

  /**
   * Linear interpolation (no easing)
   */
  linear(t: number): number {
    return t;
  }
};

/**
 * Interpolate between two values with easing
 */
export function lerp(start: number, end: number, t: number, easingFn = Easing.linear): number {
  const eased = easingFn(t);
  return start + (end - start) * eased;
}

/**
 * Interpolate between two colors (hex format)
 */
export function lerpColor(startColor: string, endColor: string, t: number, easingFn = Easing.linear): string {
  const eased = easingFn(t);

  const start = hexToRgb(startColor);
  const end = hexToRgb(endColor);

  const r = Math.round(start.r + (end.r - start.r) * eased);
  const g = Math.round(start.g + (end.g - start.g) * eased);
  const b = Math.round(start.b + (end.b - start.b) * eased);

  return rgbToHex(r, g, b);
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
}

function rgbToHex(r: number, g: number, b: number): string {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}
