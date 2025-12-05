import React from 'react';
import { motion } from 'framer-motion';
import { Zap, TrendingUp } from 'lucide-react';

/**
 * StreakPowerMeter - Circular power meter showing streak energy
 * Energy builds up with longer streaks, showing XP multiplier bonus
 */
export function StreakPowerMeter({
  currentStreak = 0,
  maxStreak = 100, // For percentage calculation
  xpMultiplier = 1, // 1.0 = 100%, 1.5 = 150%, etc.
  size = 180,
  className = ''
}) {
  const percentage = Math.min((currentStreak / maxStreak) * 100, 100);
  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Determine tier colors based on streak
  const getTierStyle = (streak) => {
    if (streak >= 100) return {
      gradient: 'url(#gradient-legendary)',
      glow: 'drop-shadow(0 0 20px rgba(250, 204, 21, 0.6))',
      tier: 'LEGENDARY',
      tierColor: 'text-yellow-400'
    };
    if (streak >= 50) return {
      gradient: 'url(#gradient-epic)',
      glow: 'drop-shadow(0 0 15px rgba(168, 85, 247, 0.5))',
      tier: 'EPIC',
      tierColor: 'text-purple-400'
    };
    if (streak >= 30) return {
      gradient: 'url(#gradient-rare)',
      glow: 'drop-shadow(0 0 12px rgba(59, 130, 246, 0.5))',
      tier: 'RARE',
      tierColor: 'text-blue-400'
    };
    if (streak >= 7) return {
      gradient: 'url(#gradient-strong)',
      glow: 'drop-shadow(0 0 10px rgba(34, 197, 94, 0.4))',
      tier: 'STRONG',
      tierColor: 'text-green-400'
    };
    return {
      gradient: 'url(#gradient-building)',
      glow: 'none',
      tier: 'BUILDING',
      tierColor: 'text-gray-400'
    };
  };

  const tierStyle = getTierStyle(currentStreak);

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* SVG Ring */}
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
        style={{ filter: tierStyle.glow }}
      >
        {/* Gradient Definitions */}
        <defs>
          <linearGradient id="gradient-building" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6b7280" />
            <stop offset="100%" stopColor="#9ca3af" />
          </linearGradient>
          <linearGradient id="gradient-strong" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#22c55e" />
            <stop offset="100%" stopColor="#4ade80" />
          </linearGradient>
          <linearGradient id="gradient-rare" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#60a5fa" />
          </linearGradient>
          <linearGradient id="gradient-epic" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#c084fc" />
          </linearGradient>
          <linearGradient id="gradient-legendary" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="50%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#fcd34d" />
          </linearGradient>
        </defs>

        {/* Background Ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth="8"
          fill="none"
        />

        {/* Progress Ring */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={tierStyle.gradient}
          strokeWidth="10"
          strokeLinecap="round"
          fill="none"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          style={{
            strokeDasharray: circumference
          }}
        />

        {/* Milestone markers */}
        {[7, 30, 50, 100].map((milestone) => {
          const angle = (milestone / maxStreak) * 360 - 90;
          const x = size / 2 + (radius + 15) * Math.cos((angle * Math.PI) / 180);
          const y = size / 2 + (radius + 15) * Math.sin((angle * Math.PI) / 180);
          const reached = currentStreak >= milestone;

          return (
            <g key={milestone}>
              <circle
                cx={x}
                cy={y}
                r="4"
                fill={reached ? '#fbbf24' : 'rgba(255, 255, 255, 0.2)'}
                className={reached ? 'animate-pulse' : ''}
              />
            </g>
          );
        })}
      </svg>

      {/* Center Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {/* Streak Count */}
        <motion.div
          key={currentStreak}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-5xl font-bold text-white mb-1"
        >
          {currentStreak}
        </motion.div>
        <div className="text-sm text-white/60">day streak</div>

        {/* Tier Badge */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className={`mt-2 px-3 py-1 rounded-full bg-white/10 ${tierStyle.tierColor} text-xs font-bold`}
        >
          {tierStyle.tier}
        </motion.div>

        {/* XP Multiplier */}
        {xpMultiplier > 1 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: 'spring' }}
            className="mt-2 flex items-center gap-1 text-yellow-400"
          >
            <Zap className="w-4 h-4" />
            <span className="text-sm font-bold">{Math.round((xpMultiplier - 1) * 100)}% XP Boost</span>
          </motion.div>
        )}
      </div>
    </div>
  );
}

/**
 * MiniStreakMeter - Compact version for use in cards
 */
export function MiniStreakMeter({
  currentStreak = 0,
  maxStreak = 100,
  size = 60,
  className = ''
}) {
  const percentage = Math.min((currentStreak / maxStreak) * 100, 100);
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const getColor = (streak) => {
    if (streak >= 100) return '#fbbf24';
    if (streak >= 50) return '#a855f7';
    if (streak >= 30) return '#3b82f6';
    if (streak >= 7) return '#22c55e';
    return '#6b7280';
  };

  const color = getColor(currentStreak);

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth="4"
          fill="none"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: 'easeOut' }}
          style={{
            strokeDasharray: circumference,
            filter: `drop-shadow(0 0 6px ${color}80)`
          }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-bold text-white">{currentStreak}</span>
      </div>
    </div>
  );
}

export default StreakPowerMeter;
