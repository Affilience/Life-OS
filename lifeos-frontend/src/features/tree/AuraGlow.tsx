/**
 * AuraGlow Component
 * Renders the radial glow behind the tree canopy
 */

import React from 'react';
import { motion } from 'framer-motion';

interface AuraGlowProps {
  intensity: number;
  streakDays: number;
  glowColor: string;
  centerX: number;
  centerY: number;
  size: number;
}

export const AuraGlow: React.FC<AuraGlowProps> = ({
  intensity,
  streakDays,
  glowColor,
  centerX,
  centerY,
  size,
}) => {
  const opacity = 0.2 + 0.6 * intensity;
  const showSpokes = streakDays >= 14;
  const spokeCount = Math.min(8, Math.floor(streakDays / 7));

  return (
    <g>
      {/* Radial glow */}
      <defs>
        <radialGradient id="aura-gradient" cx="50%" cy="50%">
          <stop offset="0%" stopColor={glowColor} stopOpacity={opacity} />
          <stop offset="50%" stopColor={glowColor} stopOpacity={opacity * 0.4} />
          <stop offset="100%" stopColor={glowColor} stopOpacity="0" />
        </radialGradient>
      </defs>

      <motion.circle
        cx={centerX}
        cy={centerY}
        r={size}
        fill="url(#aura-gradient)"
        animate={{
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Streak spokes */}
      {showSpokes &&
        Array.from({ length: spokeCount }).map((_, i) => {
          const angle = (i / spokeCount) * 360;
          const x2 = centerX + Math.cos((angle * Math.PI) / 180) * size * 0.8;
          const y2 = centerY + Math.sin((angle * Math.PI) / 180) * size * 0.8;

          return (
            <motion.line
              key={`spoke-${i}`}
              x1={centerX}
              y1={centerY}
              x2={x2}
              y2={y2}
              stroke={glowColor}
              strokeWidth="1"
              strokeOpacity={opacity * 0.3}
              animate={{
                strokeOpacity: [opacity * 0.2, opacity * 0.4, opacity * 0.2],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                delay: i * 0.2,
                ease: 'easeInOut',
              }}
            />
          );
        })}
    </g>
  );
};
