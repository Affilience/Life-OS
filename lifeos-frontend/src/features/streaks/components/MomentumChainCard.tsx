import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Shield, Calendar, TrendingUp, Zap } from 'lucide-react';

interface MomentumChainCardProps {
  chainType: string;
  moduleName: string;
  currentStreak: number;
  longestStreak: number;
  totalDaysActive: number;
  shieldsAvailable: number;
  icon?: string;
  color?: string;
  lastActivityDate?: string;
}

export function MomentumChainCard({
  chainType,
  moduleName,
  currentStreak,
  longestStreak,
  totalDaysActive,
  shieldsAvailable,
  icon = '🎯',
  color = 'purple',
  lastActivityDate
}: MomentumChainCardProps) {

  // Calculate streak level and visual effects
  const getStreakLevel = () => {
    if (currentStreak >= 100) return { tier: 'Legendary', color: 'from-yellow-500 to-orange-500', glow: 'shadow-yellow-500/50' };
    if (currentStreak >= 50) return { tier: 'Epic', color: 'from-purple-500 to-pink-500', glow: 'shadow-purple-500/50' };
    if (currentStreak >= 30) return { tier: 'Rare', color: 'from-blue-500 to-cyan-500', glow: 'shadow-blue-500/50' };
    if (currentStreak >= 7) return { tier: 'Strong', color: 'from-green-500 to-emerald-500', glow: 'shadow-green-500/50' };
    return { tier: 'Building', color: 'from-gray-500 to-gray-600', glow: '' };
  };

  const streakLevel = getStreakLevel();
  const nextMilestone = [7, 30, 50, 100].find(m => m > currentStreak) || 365;
  const progressToNext = ((currentStreak % nextMilestone) / nextMilestone) * 100;

  const isActive = lastActivityDate === new Date().toISOString().split('T')[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className={`
        relative cosmic-card cosmic-border cosmic-lift rounded-2xl p-6
        bg-gradient-to-br from-${color}-500/10 to-${color}-600/10
        ${streakLevel.glow ? `shadow-lg ${streakLevel.glow}` : ''}
      `}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="text-4xl">{icon}</div>
          <div>
            <h3 className="text-xl font-bold text-white">{moduleName}</h3>
            <p className="text-sm text-white/60 capitalize">{chainType.replace('_', ' ')}</p>
          </div>
        </div>

        {/* Active Indicator */}
        {isActive && (
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/20 border border-green-500/50"
          >
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs font-semibold text-green-400">Active Today</span>
          </motion.div>
        )}
      </div>

      {/* Current Streak - Big Display */}
      <div className="mb-6 text-center py-6 cosmic-card rounded-xl">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Flame className={`w-8 h-8 ${currentStreak > 0 ? 'text-orange-400 animate-pulse' : 'text-white/40'}`} />
          <span className="text-5xl font-bold cosmic-title">{currentStreak}</span>
        </div>
        <p className="text-white/60">Day Streak</p>
        <div className={`mt-2 inline-block px-3 py-1 rounded-full bg-gradient-to-r ${streakLevel.color} text-white text-xs font-bold`}>
          {streakLevel.tier}
        </div>
      </div>

      {/* Progress to Next Milestone */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-white/60">Next Milestone</span>
          <span className="text-white font-semibold">{nextMilestone} days</span>
        </div>
        <div className="h-2 bg-[#1a1724]/50 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressToNext}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
          />
        </div>
      </div>

      {/* Shields */}
      <div className="mb-4 cosmic-card rounded-xl p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-400" />
            <span className="text-sm text-gray-300">Streak Shields</span>
          </div>
          <div className="flex items-center gap-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <Shield
                key={i}
                className={`w-5 h-5 ${
                  i < shieldsAvailable
                    ? 'text-blue-400 fill-blue-400/20'
                    : 'text-gray-700'
                }`}
              />
            ))}
            <span className="ml-2 text-white font-semibold">{shieldsAvailable}/3</span>
          </div>
        </div>
        <p className="text-xs text-white/50 mt-1">
          Shields protect your streak if you miss a day (earn every 7 days)
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="cosmic-card rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-white/60">Longest</span>
          </div>
          <div className="text-xl font-bold text-white">{longestStreak}</div>
          <div className="text-xs text-white/50">days</div>
        </div>
        <div className="cosmic-card rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="w-4 h-4 text-cyan-400" />
            <span className="text-xs text-white/60">Total Active</span>
          </div>
          <div className="text-xl font-bold text-white">{totalDaysActive}</div>
          <div className="text-xs text-white/50">days</div>
        </div>
      </div>

      {/* Streak Tier Badge - Overlay */}
      {currentStreak >= 30 && (
        <div className="absolute -top-2 -right-2">
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className={`
              p-2 rounded-full bg-gradient-to-r ${streakLevel.color}
              shadow-lg ${streakLevel.glow}
            `}
          >
            <Zap className="w-5 h-5 text-white" />
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
