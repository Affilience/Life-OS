/**
 * useParticleBurst Hook
 * Anime.js powered particle burst effect for satisfying micro-interactions
 * Extracted from BossBattleArena for reuse across the app
 */

import { useCallback, useRef } from 'react';
import { animate, stagger } from 'animejs';

// Default color palettes for different contexts
export const PARTICLE_PALETTES = {
  success: ['#22c55e', '#4ade80', '#86efac', '#bbf7d0'],
  xp: ['#a855f7', '#c084fc', '#d8b4fe', '#e9d5ff'],
  gold: ['#f59e0b', '#fbbf24', '#fcd34d', '#fde68a'],
  cosmic: ['#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe'],
  combat: ['#ef4444', '#f97316', '#fbbf24', '#ffffff'],
  celebration: ['#ec4899', '#f472b6', '#f9a8d4', '#fbcfe8'],
  default: ['#ffffff', '#e2e8f0', '#cbd5e1', '#94a3b8'],
};

/**
 * Hook that creates particle burst effects at specified positions
 * @param {React.RefObject} containerRef - Reference to the container element
 * @returns {Function} burst - Function to trigger particle burst
 */
export const useParticleBurst = (containerRef) => {
  const burst = useCallback((x, y, options = {}) => {
    if (!containerRef?.current) return;

    const {
      count = 12,
      colors = PARTICLE_PALETTES.default,
      spread = 150,
      duration = 600,
      size = 6,
      gravity = 0, // Optional downward pull
      fadeOut = true,
      scale = true, // Whether particles shrink
    } = options;

    const container = containerRef.current;
    const particles = [];

    for (let i = 0; i < count; i++) {
      const particle = document.createElement('div');
      const color = colors[Math.floor(Math.random() * colors.length)];
      const particleSize = size + Math.random() * size;

      particle.style.cssText = `
        position: absolute;
        width: ${particleSize}px;
        height: ${particleSize}px;
        background: ${color};
        border-radius: 50%;
        pointer-events: none;
        left: ${x}px;
        top: ${y}px;
        z-index: 100;
        box-shadow: 0 0 ${size}px ${color};
      `;
      container.appendChild(particle);
      particles.push(particle);
    }

    const angle = (index) => (360 / count) * index * (Math.PI / 180);
    const randomSpread = () => spread * (0.5 + Math.random() * 0.5);

    animate(particles, {
      translateX: (el, i) => Math.cos(angle(i)) * randomSpread(),
      translateY: (el, i) => Math.sin(angle(i)) * randomSpread() + (gravity * duration / 1000),
      scale: scale ? [1, 0] : 1,
      opacity: fadeOut ? [1, 0] : 1,
      duration: () => duration + Math.random() * 200,
      easing: 'easeOutExpo',
      delay: stagger(20),
      complete: () => {
        particles.forEach(p => p.remove());
      },
    });
  }, [containerRef]);

  return burst;
};

/**
 * Hook that creates a sparkle effect (smaller, more subtle)
 * @param {React.RefObject} containerRef - Reference to the container element
 * @returns {Function} sparkle - Function to trigger sparkle effect
 */
export const useSparkle = (containerRef) => {
  const sparkle = useCallback((x, y, options = {}) => {
    if (!containerRef?.current) return;

    const {
      count = 6,
      colors = PARTICLE_PALETTES.gold,
      spread = 60,
      duration = 400,
    } = options;

    const container = containerRef.current;
    const particles = [];

    for (let i = 0; i < count; i++) {
      const particle = document.createElement('div');
      const color = colors[Math.floor(Math.random() * colors.length)];

      // Star-shaped sparkle using CSS
      particle.style.cssText = `
        position: absolute;
        width: 4px;
        height: 4px;
        background: ${color};
        pointer-events: none;
        left: ${x}px;
        top: ${y}px;
        z-index: 100;
        box-shadow:
          0 0 3px ${color},
          0 -8px 0 -3px ${color},
          0 8px 0 -3px ${color},
          -8px 0 0 -3px ${color},
          8px 0 0 -3px ${color};
      `;
      container.appendChild(particle);
      particles.push(particle);
    }

    const angle = (index) => (360 / count) * index * (Math.PI / 180);

    animate(particles, {
      translateX: (el, i) => Math.cos(angle(i)) * spread * (0.6 + Math.random() * 0.4),
      translateY: (el, i) => Math.sin(angle(i)) * spread * (0.6 + Math.random() * 0.4),
      scale: [1, 0],
      opacity: [1, 0],
      rotate: () => Math.random() * 360,
      duration: () => duration + Math.random() * 100,
      easing: 'easeOutQuad',
      delay: stagger(10),
      complete: () => {
        particles.forEach(p => p.remove());
      },
    });
  }, [containerRef]);

  return sparkle;
};

/**
 * Hook that creates a rising particle effect (for XP gains, etc.)
 * @param {React.RefObject} containerRef - Reference to the container element
 * @returns {Function} rise - Function to trigger rising particles
 */
export const useRisingParticles = (containerRef) => {
  const rise = useCallback((x, y, options = {}) => {
    if (!containerRef?.current) return;

    const {
      count = 8,
      colors = PARTICLE_PALETTES.xp,
      riseHeight = 100,
      spread = 40,
      duration = 800,
    } = options;

    const container = containerRef.current;
    const particles = [];

    for (let i = 0; i < count; i++) {
      const particle = document.createElement('div');
      const color = colors[Math.floor(Math.random() * colors.length)];
      const size = 4 + Math.random() * 4;

      particle.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border-radius: 50%;
        pointer-events: none;
        left: ${x + (Math.random() - 0.5) * spread}px;
        top: ${y}px;
        z-index: 100;
        box-shadow: 0 0 ${size}px ${color};
      `;
      container.appendChild(particle);
      particles.push(particle);
    }

    animate(particles, {
      translateY: () => -riseHeight - Math.random() * 50,
      translateX: () => (Math.random() - 0.5) * spread,
      scale: [1, 0.5, 0],
      opacity: [0.8, 1, 0],
      duration: () => duration + Math.random() * 200,
      easing: 'easeOutCubic',
      delay: stagger(50),
      complete: () => {
        particles.forEach(p => p.remove());
      },
    });
  }, [containerRef]);

  return rise;
};

/**
 * Combined hook that provides all particle effects
 * @param {React.RefObject} containerRef - Reference to the container element
 * @returns {Object} Object containing burst, sparkle, and rise functions
 */
export const useParticleEffects = (containerRef) => {
  const burst = useParticleBurst(containerRef);
  const sparkle = useSparkle(containerRef);
  const rise = useRisingParticles(containerRef);

  return { burst, sparkle, rise };
};

export default useParticleBurst;
