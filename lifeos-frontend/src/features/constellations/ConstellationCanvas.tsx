/**
 * ConstellationCanvas - Ultra-Enhanced SVG renderer for spectacular constellation visualizations
 * Inspired by professional astrophotography with chromatic effects, lens flares, and atmospheric depth
 */

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { ModuleConstellation, StarNode } from './constellations.types';
import { isStarUnlocked, isLinkVisible } from './constellations.state';
import { MODULE_COLORS } from './constellations.config';

interface ConstellationCanvasProps {
  constellation: ModuleConstellation;
  unlockedStars: string[];
  width?: number;
  height?: number;
  className?: string;
}

export const ConstellationCanvas: React.FC<ConstellationCanvasProps> = ({
  constellation,
  unlockedStars,
  width = 400,
  height = 300,
  className = ''
}) => {
  const accentColor = MODULE_COLORS[constellation.module];

  // Convert normalized 0-1 coords to actual SVG coords
  const toSvgCoords = (star: StarNode) => ({
    x: star.x * width,
    y: star.y * height
  });

  // Check for reduced motion preference
  const prefersReducedMotion = useMemo(() => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  // Generate random background starfield for depth
  const backgroundStars = useMemo(() => {
    const stars = [];
    const count = Math.floor((width * height) / 2000); // Density based on canvas size
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 1.2 + 0.3,
        opacity: Math.random() * 0.4 + 0.1,
        twinkleDelay: Math.random() * 5
      });
    }
    return stars;
  }, [width, height]);

  // Color temperature variations for stars (blue, white, warm)
  const getStarColor = (star: StarNode, index: number): string => {
    const seed = (star.x + star.y + index) * 100;
    const variant = seed % 3;
    if (star.importance === 'core') return '#FFFFFF'; // Core always pure white
    if (variant === 0) return '#B8D4FF'; // Cool blue
    if (variant === 1) return '#FFFFFF'; // Pure white
    return '#FFF4E6'; // Warm white
  };

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      role="img"
      aria-label={`${constellation.displayName} constellation progress`}
      shapeRendering="geometricPrecision"
      style={{
        background: 'radial-gradient(ellipse at center, rgba(5, 0, 15, 0.95) 0%, rgba(0, 0, 0, 1) 100%)'
      }}
    >
      {/* ========== SVG DEFINITIONS - GRADIENTS AND FILTERS ========== */}
      <defs>
        {/* Gaussian-like radial gradient for star airy disk (smooth falloff) */}
        <radialGradient id={`star-glow-${constellation.module}`}>
          <stop offset="0%" stopColor="white" stopOpacity="1" />
          <stop offset="5%" stopColor="white" stopOpacity="0.95" />
          <stop offset="15%" stopColor={accentColor} stopOpacity="0.8" />
          <stop offset="35%" stopColor={accentColor} stopOpacity="0.5" />
          <stop offset="60%" stopColor={accentColor} stopOpacity="0.2" />
          <stop offset="85%" stopColor={accentColor} stopOpacity="0.05" />
          <stop offset="100%" stopColor={accentColor} stopOpacity="0" />
        </radialGradient>

        {/* Bright core gradient (intense white center) */}
        <radialGradient id={`star-core-${constellation.module}`}>
          <stop offset="0%" stopColor="white" stopOpacity="1" />
          <stop offset="20%" stopColor="white" stopOpacity="0.9" />
          <stop offset="50%" stopColor={accentColor} stopOpacity="0.6" />
          <stop offset="100%" stopColor={accentColor} stopOpacity="0" />
        </radialGradient>

        {/* Enhanced nebula gradient with color variations */}
        <radialGradient id={`nebula-gradient-${constellation.module}`}>
          <stop offset="0%" stopColor={accentColor} stopOpacity="0.6" />
          <stop offset="40%" stopColor={accentColor} stopOpacity="0.3" />
          <stop offset="70%" stopColor="#8B5CF6" stopOpacity="0.1" />
          <stop offset="100%" stopColor="transparent" stopOpacity="0" />
        </radialGradient>

        {/* Lens flare gradient for core stars */}
        <radialGradient id={`lens-flare-${constellation.module}`}>
          <stop offset="0%" stopColor="white" stopOpacity="0.95" />
          <stop offset="15%" stopColor={accentColor} stopOpacity="0.7" />
          <stop offset="40%" stopColor={accentColor} stopOpacity="0.4" />
          <stop offset="100%" stopColor={accentColor} stopOpacity="0" />
        </radialGradient>

        {/* Linear gradient for connecting lines with energy flow */}
        <linearGradient id={`line-glow-${constellation.module}`}>
          <stop offset="0%" stopColor={accentColor} stopOpacity="0.5" />
          <stop offset="50%" stopColor="white" stopOpacity="0.9" />
          <stop offset="100%" stopColor={accentColor} stopOpacity="0.5" />
        </linearGradient>

        {/* Anamorphic lens flare gradient (horizontal streak) */}
        <linearGradient id={`anamorphic-${constellation.module}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={accentColor} stopOpacity="0" />
          <stop offset="30%" stopColor={accentColor} stopOpacity="0.3" />
          <stop offset="50%" stopColor="white" stopOpacity="0.5" />
          <stop offset="70%" stopColor={accentColor} stopOpacity="0.3" />
          <stop offset="100%" stopColor={accentColor} stopOpacity="0" />
        </linearGradient>

        {/* Chromatic aberration - red channel offset */}
        <radialGradient id={`chroma-red-${constellation.module}`}>
          <stop offset="0%" stopColor="#FF0040" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#FF0040" stopOpacity="0" />
        </radialGradient>

        {/* Chromatic aberration - blue channel offset */}
        <radialGradient id={`chroma-blue-${constellation.module}`}>
          <stop offset="0%" stopColor="#00D4FF" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#00D4FF" stopOpacity="0" />
        </radialGradient>

        {/* Deep nebula blur filter */}
        <filter id={`nebula-blur-${constellation.module}`}>
          <feGaussianBlur in="SourceGraphic" stdDeviation="8" />
        </filter>

        {/* Medium nebula blur for mid-layer */}
        <filter id={`nebula-blur-medium-${constellation.module}`}>
          <feGaussianBlur in="SourceGraphic" stdDeviation="4" />
        </filter>

        {/* Enhanced star glow filter with multiple passes */}
        <filter id={`star-glow-filter-${constellation.module}`}>
          <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur1" />
          <feGaussianBlur in="SourceGraphic" stdDeviation="1" result="blur2" />
          <feMerge>
            <feMergeNode in="blur1" />
            <feMergeNode in="blur1" />
            <feMergeNode in="blur2" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Atmospheric glow filter */}
        <filter id={`atmospheric-glow-${constellation.module}`}>
          <feGaussianBlur in="SourceGraphic" stdDeviation="15" />
        </filter>

        {/* Light ray blur */}
        <filter id={`ray-blur-${constellation.module}`}>
          <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" />
        </filter>
      </defs>

      {/* ========== BACKGROUND STARFIELD FOR DEPTH ========== */}
      <g opacity={0.6}>
        {backgroundStars.map((bgStar, i) => (
          <motion.circle
            key={`bg-star-${i}`}
            cx={bgStar.x}
            cy={bgStar.y}
            r={bgStar.size}
            fill="white"
            opacity={bgStar.opacity}
            animate={prefersReducedMotion ? {} : {
              opacity: [bgStar.opacity * 0.5, bgStar.opacity * 1.5, bgStar.opacity * 0.5]
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: bgStar.twinkleDelay
            }}
          />
        ))}
      </g>

      {/* ========== ATMOSPHERIC GLOW (ENTIRE CONSTELLATION) ========== */}
      {unlockedStars.length > 0 && (
        <g opacity={0.08} filter={`url(#atmospheric-glow-${constellation.module})`}>
          <circle
            cx={width / 2}
            cy={height / 2}
            r={Math.max(width, height) * 0.4}
            fill={`url(#star-glow-${constellation.module})`}
          />
        </g>
      )}

      {/* ========== DEEP NEBULA LAYER (HIGHLY BLURRED) ========== */}
      <g opacity={0.12} filter={`url(#nebula-blur-${constellation.module})`}>
        {constellation.stars.map((star) => {
          const unlocked = isStarUnlocked(star.id, unlockedStars);
          if (!unlocked) return null;

          const { x, y } = toSvgCoords(star);
          const nebulaSize = star.importance === 'core' ? 120 : 70;

          return (
            <circle
              key={`nebula-deep-${star.id}`}
              cx={x}
              cy={y}
              r={nebulaSize}
              fill={`url(#nebula-gradient-${constellation.module})`}
              opacity={0.5}
            />
          );
        })}
      </g>

      {/* ========== MEDIUM NEBULA LAYER ========== */}
      <g opacity={0.2} filter={`url(#nebula-blur-medium-${constellation.module})`}>
        {constellation.stars.map((star) => {
          const unlocked = isStarUnlocked(star.id, unlockedStars);
          if (!unlocked) return null;

          const { x, y } = toSvgCoords(star);
          const nebulaSize = star.importance === 'core' ? 60 : 40;

          return (
            <circle
              key={`nebula-medium-${star.id}`}
              cx={x}
              cy={y}
              r={nebulaSize}
              fill={`url(#star-glow-${constellation.module})`}
              opacity={0.6}
            />
          );
        })}
      </g>

      {/* ========== CONNECTING LINES WITH TRIPLE LAYER GLOW ========== */}
      <g>
        {constellation.links.map((link, index) => {
          const fromStar = constellation.stars.find(s => s.id === link.from);
          const toStar = constellation.stars.find(s => s.id === link.to);

          if (!fromStar || !toStar) return null;

          const from = toSvgCoords(fromStar);
          const to = toSvgCoords(toStar);
          const visible = isLinkVisible(link.from, link.to, unlockedStars);

          const uniqueId = `line-${constellation.module}-${link.from}-${link.to}`;

          return (
            <g key={uniqueId}>
              {/* Widest outer glow */}
              {visible && (
                <motion.line
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke={accentColor}
                  strokeWidth={10}
                  strokeLinecap="round"
                  opacity={0.15}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{
                    duration: 0.8,
                    delay: index * 0.05,
                    ease: "easeOut"
                  }}
                />
              )}

              {/* Medium glow */}
              {visible && (
                <motion.line
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke={accentColor}
                  strokeWidth={4}
                  strokeLinecap="round"
                  opacity={0.3}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{
                    duration: 0.8,
                    delay: index * 0.05,
                    ease: "easeOut"
                  }}
                />
              )}

              {/* Main line with gradient */}
              <motion.line
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke={visible ? `url(#line-glow-${constellation.module})` : 'rgba(255, 255, 255, 0.06)'}
                strokeWidth={visible ? 2 : 0.5}
                strokeLinecap="round"
                initial={prefersReducedMotion ? { opacity: visible ? 1 : 0.1 } : {
                  pathLength: 0,
                  opacity: 0
                }}
                animate={prefersReducedMotion ? { opacity: visible ? 1 : 0.1 } : {
                  pathLength: visible ? 1 : 0,
                  opacity: visible ? 0.9 : 0.1
                }}
                transition={{
                  pathLength: {
                    duration: 0.8,
                    delay: index * 0.05,
                    ease: "easeOut"
                  },
                  opacity: { duration: 0.4, delay: index * 0.05 }
                }}
              />

              {/* Subtle energy pulse traveling along line */}
              {visible && !prefersReducedMotion && (
                <motion.circle
                  r={1.5}
                  fill={accentColor}
                  opacity={0.3}
                  animate={{
                    cx: [from.x, to.x, from.x],
                    cy: [from.y, to.y, from.y]
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "linear",
                    delay: index * 0.5
                  }}
                />
              )}
            </g>
          );
        })}
      </g>

      {/* ========== LIGHT RAY BEAMS FROM CORE STARS ========== */}
      {!prefersReducedMotion && (
        <g opacity={0.15} filter={`url(#ray-blur-${constellation.module})`}>
          {constellation.stars.map((star) => {
            const unlocked = isStarUnlocked(star.id, unlockedStars);
            if (!unlocked || star.importance !== 'core') return null;

            const { x, y } = toSvgCoords(star);
            const rayCount = 6;
            const rays = [];

            for (let i = 0; i < rayCount; i++) {
              const angle = (i / rayCount) * Math.PI * 2;
              const length = 40 + Math.random() * 20;
              rays.push({
                angle,
                length,
                x1: x,
                y1: y,
                x2: x + Math.cos(angle) * length,
                y2: y + Math.sin(angle) * length
              });
            }

            return (
              <g key={`rays-${star.id}`}>
                {rays.map((ray, i) => (
                  <motion.line
                    key={i}
                    x1={ray.x1}
                    y1={ray.y1}
                    x2={ray.x2}
                    y2={ray.y2}
                    stroke={accentColor}
                    strokeWidth={2}
                    strokeLinecap="round"
                    opacity={0.3}
                    animate={{
                      opacity: [0.1, 0.4, 0.1]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: i * 0.2
                    }}
                  />
                ))}
              </g>
            );
          })}
        </g>
      )}

      {/* ========== STAR HALOS (PULSING GLOW) ========== */}
      <g opacity={0.7}>
        {constellation.stars.map((star) => {
          const unlocked = isStarUnlocked(star.id, unlockedStars);
          if (!unlocked) return null;

          const { x, y } = toSvgCoords(star);
          const haloSize = star.importance === 'core' ? 25 : 15;

          return (
            <motion.circle
              key={`halo-${star.id}`}
              cx={x}
              cy={y}
              r={haloSize}
              fill={`url(#star-glow-${constellation.module})`}
              initial={{ scale: 0, opacity: 0 }}
              animate={prefersReducedMotion ? { opacity: 1 } : {
                scale: [1, 1.4, 1],
                opacity: [0.6, 0.9, 0.6]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: Math.random() * 2
              }}
            />
          );
        })}
      </g>

      {/* ========== ANAMORPHIC LENS FLARES (HORIZONTAL STREAKS) ========== */}
      <g opacity={0.4}>
        {constellation.stars.map((star) => {
          const unlocked = isStarUnlocked(star.id, unlockedStars);
          if (!unlocked || star.importance !== 'core') return null;

          const { x, y } = toSvgCoords(star);
          const flareLength = 60;

          return (
            <motion.rect
              key={`anamorphic-${star.id}`}
              x={x - flareLength}
              y={y - 0.75}
              width={flareLength * 2}
              height={1.5}
              fill={`url(#anamorphic-${constellation.module})`}
              opacity={0.6}
              initial={{ scaleX: 0, opacity: 0 }}
              animate={prefersReducedMotion ? { opacity: 0.6 } : {
                scaleX: [1, 1.1, 1],
                opacity: [0.5, 0.7, 0.5]
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: Math.random()
              }}
              style={{ transformOrigin: `${x}px ${y}px` }}
            />
          );
        })}
      </g>

      {/* ========== CHROMATIC ABERRATION FOR BRIGHT STARS ========== */}
      <g opacity={0.25}>
        {constellation.stars.map((star) => {
          const unlocked = isStarUnlocked(star.id, unlockedStars);
          if (!unlocked || star.importance !== 'core') return null;

          const { x, y } = toSvgCoords(star);
          const aberrationSize = 10;
          const offset = 2;

          return (
            <g key={`chroma-${star.id}`}>
              {/* Red channel offset right */}
              <circle
                cx={x + offset}
                cy={y}
                r={aberrationSize}
                fill={`url(#chroma-red-${constellation.module})`}
              />
              {/* Blue channel offset left */}
              <circle
                cx={x - offset}
                cy={y}
                r={aberrationSize}
                fill={`url(#chroma-blue-${constellation.module})`}
              />
            </g>
          );
        })}
      </g>

      {/* ========== SUBTLE DIFFRACTION SPIKES (ACCENT ONLY) ========== */}
      <g opacity={0.4}>
        {constellation.stars.map((star) => {
          const unlocked = isStarUnlocked(star.id, unlockedStars);
          if (!unlocked || star.importance !== 'core') return null; // Only core stars

          const { x, y } = toSvgCoords(star);
          const spikeLength = 40;
          const diagonalLength = 28;

          return (
            <g key={`spikes-${star.id}`}>
              {/* Vertical spike - subtle */}
              <motion.line
                x1={x}
                y1={y - spikeLength}
                x2={x}
                y2={y + spikeLength}
                stroke={`url(#line-glow-${constellation.module})`}
                strokeWidth={0.8}
                strokeLinecap="round"
                opacity={0.5}
                initial={{ scaleY: 0, opacity: 0 }}
                animate={{ scaleY: 1, opacity: 0.5 }}
                transition={{
                  duration: 0.6,
                  ease: "easeOut"
                }}
                style={{ transformOrigin: `${x}px ${y}px` }}
              />

              {/* Horizontal spike - subtle */}
              <motion.line
                x1={x - spikeLength}
                y1={y}
                x2={x + spikeLength}
                y2={y}
                stroke={`url(#line-glow-${constellation.module})`}
                strokeWidth={0.8}
                strokeLinecap="round"
                opacity={0.5}
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 0.5 }}
                transition={{
                  duration: 0.6,
                  ease: "easeOut"
                }}
                style={{ transformOrigin: `${x}px ${y}px` }}
              />

              {/* Diagonal spikes - very subtle */}
              <motion.line
                x1={x - diagonalLength * 0.707}
                y1={y - diagonalLength * 0.707}
                x2={x + diagonalLength * 0.707}
                y2={y + diagonalLength * 0.707}
                stroke={accentColor}
                strokeWidth={0.5}
                strokeLinecap="round"
                opacity={0.25}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 0.25 }}
                transition={{
                  duration: 0.6,
                  ease: "easeOut"
                }}
                style={{ transformOrigin: `${x}px ${y}px` }}
              />
              <motion.line
                x1={x + diagonalLength * 0.707}
                y1={y - diagonalLength * 0.707}
                x2={x - diagonalLength * 0.707}
                y2={y + diagonalLength * 0.707}
                stroke={accentColor}
                strokeWidth={0.5}
                strokeLinecap="round"
                opacity={0.25}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 0.25 }}
                transition={{
                  duration: 0.6,
                  ease: "easeOut"
                }}
                style={{ transformOrigin: `${x}px ${y}px` }}
              />
            </g>
          );
        })}
      </g>

      {/* ========== STAR AIRY DISKS (GAUSSIAN POINT SOURCES) ========== */}
      <g>
        {constellation.stars.map((star, index) => {
          const { x, y } = toSvgCoords(star);
          const unlocked = isStarUnlocked(star.id, unlockedStars);

          // Airy disk sizes based on star brightness/importance
          const airyRadius = star.importance === 'core' ? 20 : 12;
          const coreRadius = star.importance === 'core' ? 8 : 5;
          const starColor = getStarColor(star, index);

          return (
            <g key={`star-${star.id}`}>
              {/* Outer Airy disk with Gaussian falloff */}
              {unlocked && (
                <motion.circle
                  cx={x}
                  cy={y}
                  r={airyRadius}
                  fill={`url(#star-glow-${constellation.module})`}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={prefersReducedMotion ? { opacity: 0.9 } : {
                    scale: [1, 1.15, 1],
                    opacity: [0.85, 1, 0.85]
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: Math.random()
                  }}
                >
                  {star.label && (
                    <title>{star.label}</title>
                  )}
                </motion.circle>
              )}

              {/* Bright inner core */}
              {unlocked && (
                <circle
                  cx={x}
                  cy={y}
                  r={coreRadius}
                  fill={`url(#star-core-${constellation.module})`}
                  opacity={0.95}
                />
              )}

              {/* Unlocked star marker (minimal, for locked state) */}
              {!unlocked && (
                <circle
                  cx={x}
                  cy={y}
                  r={3}
                  fill="rgba(255, 255, 255, 0.1)"
                  opacity={0.4}
                >
                  {star.label && (
                    <title>{star.label}</title>
                  )}
                </circle>
              )}

              {/* Star label with enhanced glow */}
              {star.label && unlocked && (
                <motion.text
                  x={x}
                  y={y + airyRadius + 8}
                  textAnchor="middle"
                  fill="white"
                  fontSize="10"
                  fontWeight="600"
                  opacity={0.9}
                  style={{
                    textShadow: `0 0 12px ${accentColor}, 0 0 6px ${accentColor}, 0 0 3px rgba(0,0,0,0.9)`,
                    fontFamily: 'var(--font-primary)',
                    letterSpacing: '0.5px'
                  }}
                  initial={prefersReducedMotion ? { opacity: 0.9 } : {
                    opacity: 0,
                    y: y + airyRadius + 4
                  }}
                  animate={prefersReducedMotion ? { opacity: 0.9 } : {
                    opacity: 0.9,
                    y: y + airyRadius + 8
                  }}
                  transition={{
                    duration: 0.4,
                    delay: index * 0.03 + 0.3
                  }}
                >
                  {star.label}
                </motion.text>
              )}
            </g>
          );
        })}
      </g>

      {/* ========== ATMOSPHERIC SCINTILLATION (TWINKLING) ========== */}
      {!prefersReducedMotion && (
        <g opacity={0.6}>
          {constellation.stars.map((star, index) => {
            const unlocked = isStarUnlocked(star.id, unlockedStars);
            if (!unlocked) return null;

            const { x, y } = toSvgCoords(star);
            const twinkleDuration = 1 + Math.random() * 1.5;
            const twinkleDelay = Math.random() * 3;

            return (
              <motion.circle
                key={`twinkle-${star.id}`}
                cx={x}
                cy={y}
                r={star.importance === 'core' ? 3 : 2}
                fill="white"
                animate={{
                  opacity: [0.3, 1, 0.3],
                  r: [
                    star.importance === 'core' ? 2.5 : 1.5,
                    star.importance === 'core' ? 3.5 : 2.5,
                    star.importance === 'core' ? 2.5 : 1.5
                  ]
                }}
                transition={{
                  duration: twinkleDuration,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: twinkleDelay
                }}
              />
            );
          })}
        </g>
      )}
    </svg>
  );
};
