/**
 * TreeHUD Component
 * Displays level, XP, and progress bar below the tree
 */

import React from 'react';
import { motion } from 'framer-motion';

interface TreeHUDProps {
  level: number;
  xp: number;
  xpToNext: number;
  streakDays: number;
}

export const TreeHUD: React.FC<TreeHUDProps> = ({
  level,
  xp,
  xpToNext,
  streakDays,
}) => {
  const xpPercent = Math.min(100, (xp / xpToNext) * 100);

  return (
    <div className="flex flex-col gap-2 text-sm">
      {/* Level and XP text */}
      <div className="flex items-center justify-between text-zinc-400">
        <span>
          Level {level} • {xp.toLocaleString()} / {xpToNext.toLocaleString()} XP
        </span>
        {streakDays > 0 && (
          <span className="text-amber-400 font-semibold">
            🔥 {streakDays}
          </span>
        )}
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500"
          initial={{ width: '0%' }}
          animate={{ width: `${xpPercent}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
};
