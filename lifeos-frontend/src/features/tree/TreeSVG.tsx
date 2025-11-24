/**
 * TreeSVG Component
 * Renders trunk, branches, and leaves
 */

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { GrowthParams, Season, Mood } from './tree.types';
import { generateBranches, generateLeafClusters, SeededRandom } from './tree.logic';
import { TREE_COLORS, getLeafColor } from './tree.palette';
import { AuraGlow } from './AuraGlow';
import { SeasonOverlay } from './SeasonOverlay';

interface TreeSVGProps {
  params: GrowthParams;
  season: Season;
  mood: Mood;
  width: number;
  height: number;
  xpPulse: number;
  levelPulse: number;
  streakDays: number;
}

export const TreeSVG: React.FC<TreeSVGProps> = ({
  params,
  season,
  mood,
  width,
  height,
  xpPulse,
  levelPulse,
  streakDays,
}) => {
  const centerX = width / 2;
  const groundY = height - 40;

  // Generate branches and leaves (memoized)
  const branches = useMemo(() => {
    if (params.branchCount === 0) return [];
    return generateBranches(params, centerX, groundY, 42);
  }, [params.branchCount, params.trunkHeight, centerX, groundY]);

  const leafClusters = useMemo(() => {
    if (params.leafClusters === 0) return [];
    return generateLeafClusters(params, branches, 42);
  }, [params.leafClusters, branches.length]);

  // Colors
  const leafColor = getLeafColor(season, params.leafTintStrength);
  const glowColor = TREE_COLORS.season[season].glow;

  // Mood-based animation config
  const getMoodAnimation = () => {
    switch (mood) {
      case 'calm':
        return {
          duration: 8,
          amplitude: 1.2,
        };
      case 'focused':
        return {
          duration: 10,
          amplitude: 0.5,
        };
      case 'stressed':
        return {
          duration: 2.5,
          amplitude: 0.8,
        };
    }
  };

  const moodAnim = getMoodAnimation();

  // Render seed stage
  if (params.stage === 'seed') {
    return (
      <svg width={width} height={height} className="overflow-visible">
        <g>
          {/* Aura */}
          <AuraGlow
            intensity={params.auraIntensity}
            streakDays={streakDays}
            glowColor={glowColor}
            centerX={centerX}
            centerY={groundY - 20}
            size={40}
          />

          {/* Seed */}
          <motion.ellipse
            cx={centerX}
            cy={groundY - 8}
            rx={8}
            ry={10}
            fill={TREE_COLORS.trunk}
            animate={{
              scale: [1, 1 + levelPulse * 0.15, 1],
              opacity: [0.8, 0.8 + xpPulse * 0.2, 0.8],
            }}
            transition={{ duration: 0.6 }}
          />

          {/* Root line */}
          <line
            x1={centerX}
            y1={groundY - 8}
            x2={centerX}
            y2={groundY + 10}
            stroke={TREE_COLORS.trunk}
            strokeWidth="2"
            opacity="0.4"
          />
        </g>
      </svg>
    );
  }

  // Render sprout stage
  if (params.stage === 'sprout') {
    return (
      <svg width={width} height={height} className="overflow-visible">
        <g>
          {/* Aura */}
          <AuraGlow
            intensity={params.auraIntensity}
            streakDays={streakDays}
            glowColor={glowColor}
            centerX={centerX}
            centerY={groundY - 50}
            size={60}
          />

          {/* Stem */}
          <motion.line
            x1={centerX}
            y1={groundY}
            x2={centerX}
            y2={groundY - 60}
            stroke={TREE_COLORS.trunk}
            strokeWidth="3"
            strokeLinecap="round"
            animate={{
              y2: [groundY - 60, groundY - 62, groundY - 60],
            }}
            transition={{
              duration: moodAnim.duration,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          {/* Tiny leaves */}
          <motion.ellipse
            cx={centerX - 8}
            cy={groundY - 55}
            rx={6}
            ry={8}
            fill={leafColor}
            opacity="0.8"
            animate={{
              rotate: [-2, 2, -2],
            }}
            transition={{
              duration: moodAnim.duration,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <motion.ellipse
            cx={centerX + 8}
            cy={groundY - 55}
            rx={6}
            ry={8}
            fill={leafColor}
            opacity="0.8"
            animate={{
              rotate: [2, -2, 2],
            }}
            transition={{
              duration: moodAnim.duration,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </g>
      </svg>
    );
  }

  // Full tree (sapling, young, mature, mythic)
  const canopyY = groundY - params.trunkHeight * 0.5;

  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        {/* Glow filter */}
        <filter id="tree-glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feFlood floodColor={glowColor} floodOpacity={xpPulse * 0.3} />
          <feComposite in2="blur" operator="in" />
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g>
        {/* Aura behind tree */}
        <AuraGlow
          intensity={params.auraIntensity}
          streakDays={streakDays}
          glowColor={glowColor}
          centerX={centerX}
          centerY={canopyY}
          size={params.trunkHeight * 0.8}
        />

        {/* Trunk */}
        <motion.path
          d={`
            M ${centerX - params.trunkThickness / 2} ${groundY}
            Q ${centerX - params.trunkThickness / 3} ${groundY - params.trunkHeight / 2}
              ${centerX} ${groundY - params.trunkHeight}
            Q ${centerX + params.trunkThickness / 3} ${groundY - params.trunkHeight / 2}
              ${centerX + params.trunkThickness / 2} ${groundY}
            Z
          `}
          fill={TREE_COLORS.trunk}
          opacity="0.9"
          animate={{
            x: [0, moodAnim.amplitude * 0.5, 0, -moodAnim.amplitude * 0.5, 0],
          }}
          transition={{
            duration: moodAnim.duration,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Branches */}
        <motion.g
          animate={{
            rotate: [
              -moodAnim.amplitude,
              moodAnim.amplitude,
              -moodAnim.amplitude,
            ],
          }}
          transition={{
            duration: moodAnim.duration,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{ originX: `${centerX}px`, originY: `${canopyY}px` }}
        >
          {branches.map((branch) => (
            <path
              key={branch.id}
              d={`M ${branch.startX} ${branch.startY} Q ${branch.controlX} ${branch.controlY} ${branch.endX} ${branch.endY}`}
              stroke={TREE_COLORS.trunk}
              strokeWidth={branch.thickness}
              strokeLinecap="round"
              fill="none"
              opacity="0.8"
            />
          ))}
        </motion.g>

        {/* Leaves */}
        <motion.g
          filter="url(#tree-glow)"
          animate={{
            scale: [1, 1 + levelPulse * 0.08, 1],
            opacity: [1, 1 + xpPulse * 0.15, 1],
          }}
          transition={{ duration: 1.2 }}
        >
          {leafClusters.map((cluster) => {
            const rng = new SeededRandom(parseInt(cluster.id.split('-')[1]) + 5000);
            return (
              <g key={cluster.id}>
                {Array.from({ length: cluster.count }).map((_, i) => {
                  const offsetX = rng.range(-cluster.spread, cluster.spread);
                  const offsetY = rng.range(-cluster.spread, cluster.spread);
                  const size = rng.range(4, 8);

                  return (
                    <motion.ellipse
                      key={`${cluster.id}-leaf-${i}`}
                      cx={cluster.x + offsetX}
                      cy={cluster.y + offsetY}
                      rx={size}
                      ry={size * 1.2}
                      fill={leafColor}
                      opacity="0.85"
                      animate={{
                        rotate: [
                          rng.range(-5, 5),
                          rng.range(-5, 5),
                          rng.range(-5, 5),
                        ],
                      }}
                      transition={{
                        duration: moodAnim.duration + rng.range(-1, 1),
                        repeat: Infinity,
                        ease: 'easeInOut',
                        delay: rng.range(0, 2),
                      }}
                    />
                  );
                })}
              </g>
            );
          })}
        </motion.g>

        {/* Season overlay */}
        <SeasonOverlay season={season} width={width} height={height} />
      </g>
    </svg>
  );
};
