/**
 * ConstellationModulePanel - Wrapper component for module constellation display
 * Embeds at top of each module page to show progression
 */

import React from 'react';
import { motion } from 'framer-motion';
import { ConstellationCanvas } from './ConstellationCanvas';
import type { ModuleConstellation, ConstellationState } from './constellations.types';
import { getNextStar, getXpToNextStar } from './constellations.state';
import { MODULE_COLORS } from './constellations.config';

interface ConstellationModulePanelProps {
  constellation: ModuleConstellation;
  state: ConstellationState;
  currentXp: number;
  className?: string;
}

export const ConstellationModulePanel: React.FC<ConstellationModulePanelProps> = ({
  constellation,
  state,
  currentXp,
  className = ''
}) => {
  const accentColor = MODULE_COLORS[constellation.module];
  const nextStar = getNextStar(constellation, currentXp);
  const xpToNext = getXpToNextStar(constellation, currentXp);
  const progressPercent = Math.round(state.progress * 100);

  return (
    <motion.div
      className={`cosmic-card cosmic-border cosmic-lift rounded-xl p-6 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        boxShadow: `0 0 40px ${accentColor}20, inset 0 0 60px ${accentColor}05`
      }}
    >
      <div className="flex flex-col lg:flex-row items-center gap-6">
        {/* Constellation Canvas */}
        <div className="flex-shrink-0">
          <ConstellationCanvas
            constellation={constellation}
            unlockedStars={state.unlockedStars}
            width={400}
            height={300}
            className="drop-shadow-lg"
          />
        </div>

        {/* Progress Text */}
        <div className="flex-1 space-y-4 text-center lg:text-left">
          {/* Constellation Name */}
          <div>
            <h2
              className="text-3xl font-bold mb-2"
              style={{
                color: accentColor,
                textShadow: `0 0 20px ${accentColor}80`
              }}
            >
              {constellation.displayName}
            </h2>
            {constellation.description && (
              <p className="text-fg-secondary text-sm italic">
                {constellation.description}
              </p>
            )}
          </div>

          {/* Progress Stats */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-fg-primary font-medium">Progress</span>
              <span
                className="text-2xl font-bold"
                style={{ color: accentColor }}
              >
                {progressPercent}%
              </span>
            </div>

            {/* Progress Bar */}
            <div className="relative h-3 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{
                  background: `linear-gradient(90deg, ${accentColor}40, ${accentColor})`
                }}
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  boxShadow: `inset 0 0 10px ${accentColor}40`
                }}
              />
            </div>

            {/* Stars Count */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-fg-secondary">
                Stars Unlocked
              </span>
              <span className="text-fg-primary font-mono">
                {state.unlockedStars.length} / {state.totalStars}
              </span>
            </div>
          </div>

          {/* Next Star Info */}
          {nextStar ? (
            <motion.div
              className="p-4 rounded-lg border border-white/10 bg-white/5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-fg-secondary uppercase tracking-wide mb-1">
                    Next Star
                  </div>
                  <div className="text-fg-primary font-medium">
                    {nextStar.label || 'Unlabeled Star'}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-fg-secondary uppercase tracking-wide mb-1">
                    XP Needed
                  </div>
                  <div
                    className="text-xl font-bold font-mono"
                    style={{ color: accentColor }}
                  >
                    {xpToNext.toLocaleString()}
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              className="p-4 rounded-lg border border-white/10 bg-gradient-to-r from-white/5 to-white/10 text-center"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="text-2xl mb-2">✨</div>
              <div className="text-fg-primary font-semibold">
                Constellation Complete!
              </div>
              <div className="text-sm text-fg-secondary mt-1">
                You've unlocked all {state.totalStars} stars
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
