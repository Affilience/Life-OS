/**
 * SeasonOverlay Component
 * Renders seasonal particles (petals, snow, embers)
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Season } from './tree.types';
import { SeededRandom } from './tree.logic';

interface SeasonOverlayProps {
  season: Season;
  width: number;
  height: number;
}

export const SeasonOverlay: React.FC<SeasonOverlayProps> = ({
  season,
  width,
  height,
}) => {
  const particleCount = 8;
  const rng = new SeededRandom(42);

  // Generate particle configs
  const particles = Array.from({ length: particleCount }).map((_, i) => ({
    id: `particle-${i}`,
    x: rng.range(0, width),
    y: rng.range(0, height),
    size: rng.range(2, 5),
    delay: rng.range(0, 4),
  }));

  const getParticleProps = (season: Season) => {
    switch (season) {
      case 'evolution': // Blossom petals
        return {
          color: '#FFB7E1',
          opacity: 0.4,
          duration: 8,
          yOffset: 60,
        };
      case 'power': // Snow/ice crystals
        return {
          color: '#B8E0FF',
          opacity: 0.3,
          duration: 10,
          yOffset: 80,
        };
      case 'ambition': // Gold sparkles
        return {
          color: '#FFD93D',
          opacity: 0.5,
          duration: 6,
          yOffset: 40,
        };
      default:
        return null;
    }
  };

  const particleProps = getParticleProps(season);

  if (!particleProps) return null;

  return (
    <g opacity="0.6">
      {particles.map((p) => (
        <motion.circle
          key={p.id}
          cx={p.x}
          cy={p.y}
          r={p.size}
          fill={particleProps.color}
          opacity={particleProps.opacity}
          animate={{
            y: [p.y, p.y + particleProps.yOffset, p.y],
            opacity: [
              particleProps.opacity * 0.3,
              particleProps.opacity,
              particleProps.opacity * 0.3,
            ],
          }}
          transition={{
            duration: particleProps.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </g>
  );
};
