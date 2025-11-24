/**
 * ONYXOS HoloHUD
 * 2D overlay showing level, XP bar, and stats
 */

import React from 'react';

interface HoloHUDProps {
  level: number;
  xp: number;
  xpToNext: number;
  xpPercent: number;
  streakDays?: number;
}

const HoloHUD: React.FC<HoloHUDProps> = ({
  level,
  xp,
  xpToNext,
  xpPercent,
  streakDays = 0,
}) => {
  return (
    <div className="absolute bottom-0 left-0 right-0 p-4 pointer-events-none">
      {/* Level Badge */}
      <div className="flex items-end justify-between mb-3">
        <div className="flex items-baseline gap-2">
          <span className="text-text-high text-3xl font-bold tracking-tighter">
            Level {level}
          </span>
          {streakDays > 0 && (
            <span className="text-text-med text-sm font-medium">
              {streakDays} day streak 🔥
            </span>
          )}
        </div>
      </div>

      {/* XP Bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs text-text-med font-mono">
          <span>{xp.toLocaleString()} XP</span>
          <span>{xpToNext.toLocaleString()} XP</span>
        </div>

        <div className="relative w-full h-2 bg-muted rounded-pill overflow-hidden">
          {/* Track */}
          <div className="absolute inset-0 bg-muted" />

          {/* Fill with gradient and glow */}
          <div
            className="absolute inset-y-0 left-0 rounded-pill transition-all duration-300 ease-out"
            style={{
              width: `${xpPercent}%`,
              background: 'linear-gradient(to right, var(--accent), var(--accent-2))',
              boxShadow: '0 0 10px var(--accent), 0 0 20px var(--accent)',
            }}
          />
        </div>

        {/* XP Percentage */}
        <div className="text-center text-xs text-text-dim font-mono">
          {Math.round(xpPercent)}% to next level
        </div>
      </div>
    </div>
  );
};

export default HoloHUD;
