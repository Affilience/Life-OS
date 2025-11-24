/**
 * Tree Component
 * Main public component for the Growth Tree visualization
 */

import React, { useState, useEffect, useMemo } from 'react';
import { TreeProps } from './tree.types';
import { growthFromState, getStageFromLevel } from './tree.logic';
import { TreeSVG } from './TreeSVG';
import { TreeHUD } from './TreeHUD';

export const Tree: React.FC<TreeProps> = ({
  level,
  xp,
  xpToNext,
  streakDays = 0,
  season = 'discipline',
  mood = 'calm',
  width = 420,
  height = 320,
  onOpenCoach,
}) => {
  const [xpPulse, setXpPulse] = useState(0);
  const [levelPulse, setLevelPulse] = useState(0);
  const [prevXp, setPrevXp] = useState(xp);
  const [prevLevel, setPrevLevel] = useState(level);

  // Calculate growth parameters
  const params = useMemo(
    () => growthFromState(level, xp, xpToNext, streakDays, season, mood),
    [level, xp, xpToNext, streakDays, season, mood]
  );

  // XP pulse effect
  useEffect(() => {
    if (xp > prevXp) {
      setXpPulse(1);
      setTimeout(() => setXpPulse(0), 1200);
    }
    setPrevXp(xp);
  }, [xp, prevXp]);

  // Level pulse effect
  useEffect(() => {
    if (level > prevLevel) {
      setLevelPulse(1);
      setTimeout(() => setLevelPulse(0), 1600);
    }
    setPrevLevel(level);
  }, [level, prevLevel]);

  // Keyboard accessibility
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && onOpenCoach) {
      e.preventDefault();
      onOpenCoach();
    }
  };

  const stage = getStageFromLevel(level);
  const xpPercent = Math.min(100, (xp / xpToNext) * 100).toFixed(1);

  return (
    <div className="flex flex-col gap-4">
      {/* Tree visualization */}
      <div
        className="relative bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800"
        style={{ width, height }}
        role={onOpenCoach ? 'button' : undefined}
        tabIndex={onOpenCoach ? 0 : undefined}
        onClick={onOpenCoach}
        onKeyPress={handleKeyPress}
        aria-label={
          onOpenCoach
            ? `Growth tree, Level ${level}, ${xpPercent}% progress, click to open coach`
            : undefined
        }
      >
        <TreeSVG
          params={params}
          season={season}
          mood={mood}
          width={width}
          height={height}
          xpPulse={xpPulse}
          levelPulse={levelPulse}
          streakDays={streakDays}
        />

        {/* Stage badge */}
        <div className="absolute top-4 right-4 px-3 py-1 bg-zinc-800/80 backdrop-blur-sm rounded-full text-xs text-zinc-300 capitalize">
          {stage}
        </div>
      </div>

      {/* Stats HUD */}
      <TreeHUD
        level={level}
        xp={xp}
        xpToNext={xpToNext}
        streakDays={streakDays}
      />
    </div>
  );
};

export default Tree;
