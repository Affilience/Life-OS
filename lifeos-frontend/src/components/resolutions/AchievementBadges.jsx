/**
 * AchievementBadges - Display earned and locked achievement badges
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Sparkles } from 'lucide-react';
import { ACHIEVEMENT_BADGES, useResolutionStore } from '../../stores/resolutionStore';

export default function AchievementBadges({ compact = false }) {
  const { achievements } = useResolutionStore();

  const allBadges = Object.entries(ACHIEVEMENT_BADGES);
  const earnedCount = achievements.length;
  const totalCount = allBadges.length;

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {allBadges.slice(0, 5).map(([key, badge]) => {
          const isEarned = achievements.includes(key);
          return (
            <div
              key={key}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-lg ${
                isEarned ? 'bg-purple-500/20' : 'bg-white/5 opacity-30'
              }`}
              title={`${badge.name}: ${badge.description}`}
            >
              {isEarned ? badge.icon : <Lock className="w-3 h-3 text-white/30" />}
            </div>
          );
        })}
        {allBadges.length > 5 && (
          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-xs text-white/50">
            +{allBadges.length - 5}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-[#1a1724] border border-white/10 rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-yellow-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Achievements</h3>
            <p className="text-sm text-white/50">
              {earnedCount} / {totalCount} Unlocked
            </p>
          </div>
        </div>

        {/* Progress */}
        <div className="text-right">
          <div className="text-2xl font-bold text-yellow-400">
            {Math.round((earnedCount / totalCount) * 100)}%
          </div>
          <div className="text-xs text-white/40">Complete</div>
        </div>
      </div>

      {/* Badge Grid */}
      <div className="grid grid-cols-4 gap-3">
        {allBadges.map(([key, badge], idx) => {
          const isEarned = achievements.includes(key);

          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              className={`relative group ${
                isEarned ? '' : 'opacity-40 grayscale'
              }`}
            >
              <div
                className={`aspect-square rounded-xl flex flex-col items-center justify-center p-2 transition-all ${
                  isEarned
                    ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30'
                    : 'bg-white/5 border border-white/10'
                }`}
              >
                <span className="text-2xl mb-1">{badge.icon}</span>
                <span className="text-xs text-center text-white/70 line-clamp-1">
                  {badge.name}
                </span>
              </div>

              {/* Tooltip on hover */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-[#0c0a10] border border-white/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 w-40">
                <div className="text-sm font-medium text-white mb-1">{badge.name}</div>
                <div className="text-xs text-white/60">{badge.description}</div>
                <div className="text-xs text-purple-400 mt-1">+{badge.xp} XP</div>
              </div>

              {/* Lock icon for unearned */}
              {!isEarned && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Lock className="w-4 h-4 text-white/30" />
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
