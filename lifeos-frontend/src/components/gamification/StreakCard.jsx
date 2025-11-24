import React from 'react';
import { motion } from 'framer-motion';
import { FireIcon, ShieldCheckIcon } from '@heroicons/react/24/solid';
import { useStreakManager } from '../../hooks/useGamificationEvents';

/**
 * Streak Card - Display for individual module streaks
 *
 * Shows current streak, shields, and danger status
 */
export default function StreakCard({ streak, compact = false }) {
  const { isStreakInDanger, getStreakTier, getNextMilestone } = useStreakManager();

  const inDanger = isStreakInDanger(streak);
  const tier = getStreakTier(streak.current_streak);
  const nextMilestone = getNextMilestone(streak.current_streak);

  const tierColors = {
    common: 'text-white/60',
    uncommon: 'text-green-400',
    rare: 'text-blue-400',
    epic: 'text-purple-400',
    legendary: 'text-amber-400',
  };

  const tierBorderColors = {
    common: 'border-gray-600',
    uncommon: 'border-green-500/30',
    rare: 'border-blue-500/30',
    epic: 'border-purple-500/30',
    legendary: 'border-amber-500/30',
  };

  const tierBgColors = {
    common: 'bg-[#1a1724]/50',
    uncommon: 'bg-green-500/10',
    rare: 'bg-blue-500/10',
    epic: 'bg-purple-500/10',
    legendary: 'bg-amber-500/10',
  };

  if (compact) {
    return (
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${tierBorderColors[tier]} ${tierBgColors[tier]}`}>
        <FireIcon className={`w-5 h-5 ${tierColors[tier]}`} />
        <span className="text-white font-semibold">{streak.current_streak}</span>
        {streak.shield_count > 0 && (
          <div className="flex items-center gap-1">
            <ShieldCheckIcon className="w-4 h-4 text-cyan-400" />
            <span className="text-cyan-400 text-sm">{streak.shield_count}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`bg-[#1a1724]/50 backdrop-blur-sm rounded-xl border ${tierBorderColors[tier]} p-4 relative overflow-hidden`}
    >
      {/* Danger indicator */}
      {inDanger && (
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute top-2 right-2"
        >
          <div className="w-2 h-2 rounded-full bg-red-500" />
        </motion.div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-white font-semibold capitalize">
            {streak.module_id?.replace('_', ' ')}
          </h3>
          <p className="text-xs text-white/60 mt-0.5">
            {streak.is_global ? 'Global Streak' : 'Module Streak'}
          </p>
        </div>

        <div className={`px-2 py-0.5 rounded text-xs font-semibold ${tierBgColors[tier]} ${tierColors[tier]} border ${tierBorderColors[tier]}`}>
          {tier}
        </div>
      </div>

      {/* Streak count */}
      <div className="flex items-center gap-3 mb-3">
        <FireIcon className={`w-8 h-8 ${tierColors[tier]}`} />
        <div>
          <p className="text-3xl font-bold text-white">
            {streak.current_streak}
          </p>
          <p className="text-sm text-white/60">day streak</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="flex items-center justify-between pt-3 border-t border-white/15/50">
        {/* Best streak */}
        <div>
          <p className="text-xs text-white/60">Best</p>
          <p className="text-sm text-white font-semibold">
            {streak.longest_streak} days
          </p>
        </div>

        {/* Shields */}
        {streak.shield_count > 0 && (
          <div className="flex items-center gap-2">
            <ShieldCheckIcon className="w-5 h-5 text-cyan-400" />
            <div>
              <p className="text-xs text-white/60">Shields</p>
              <p className="text-sm text-cyan-400 font-semibold">
                {streak.shield_count}
              </p>
            </div>
          </div>
        )}

        {/* Next milestone */}
        {nextMilestone && (
          <div>
            <p className="text-xs text-white/60">Next</p>
            <p className="text-sm text-purple-400 font-semibold">
              {nextMilestone} days
            </p>
          </div>
        )}
      </div>

      {/* Danger warning */}
      {inDanger && (
        <div className="mt-3 bg-red-500/20 border border-red-500/30 rounded-lg px-3 py-2">
          <p className="text-red-400 text-xs font-semibold">
            ⚠️ Streak expires in less than 4 hours!
          </p>
        </div>
      )}

      {/* XP Multiplier bonus */}
      {streak.is_global && streak.current_streak >= 7 && (
        <div className="mt-3 bg-amber-500/20 border border-amber-500/30 rounded-lg px-3 py-2">
          <p className="text-amber-400 text-xs font-semibold">
            ⚡ +{(getStreakTier === 'legendary' ? 25 : getStreakTier === 'epic' ? 15 : getStreakTier === 'rare' ? 10 : 5)}% XP Bonus
          </p>
        </div>
      )}
    </motion.div>
  );
}

/**
 * Streak Grid - Display multiple streaks in a grid
 */
export function StreakGrid({ streaks, columns = 2 }) {
  if (!streaks || streaks.length === 0) {
    return (
      <div className="text-center py-8 text-white/60">
        <FireIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>No active streaks yet</p>
        <p className="text-sm mt-1">Complete daily activities to build streaks!</p>
      </div>
    );
  }

  return (
    <div className={`grid gap-4`} style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
      {streaks.map((streak) => (
        <StreakCard key={streak.id} streak={streak} />
      ))}
    </div>
  );
}
