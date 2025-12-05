import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Flame, Shield, Zap, TrendingUp } from 'lucide-react';
import { YearlyHeatmap } from './YearlyHeatmap';

// Mock data - will be replaced with real data later
const mockChains = [
  {
    id: '1',
    name: 'Daily Missions',
    icon: '🎯',
    currentStreak: 32,
    longestStreak: 45,
    color: 'purple',
    weekData: [true, true, true, true, true, true, true]
  },
  {
    id: '2',
    name: 'Journal',
    icon: '📝',
    currentStreak: 14,
    longestStreak: 21,
    color: 'blue',
    weekData: [true, true, true, false, true, true, true]
  },
  {
    id: '3',
    name: 'Workouts',
    icon: '💪',
    currentStreak: 56,
    longestStreak: 56,
    color: 'green',
    weekData: [true, true, true, true, true, true, true]
  },
  {
    id: '4',
    name: 'Reading',
    icon: '📚',
    currentStreak: 7,
    longestStreak: 15,
    color: 'orange',
    weekData: [true, true, true, true, true, true, true]
  }
];

// Generate mock heatmap data
const generateMockHeatmapData = () => {
  const data = [];
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const baseValue = isWeekend ? 1 : 3;
    const randomFactor = Math.random();
    const value = randomFactor > 0.3 ? Math.floor(Math.random() * 5 * baseValue) : 0;
    data.push({
      date: date.toISOString().split('T')[0],
      value
    });
  }
  return data;
};

export function MomentumChainsBoard() {
  const [chains] = useState(mockChains);
  const [heatmapData] = useState(generateMockHeatmapData);

  // Calculate stats
  const longestActiveStreak = Math.max(...chains.map(c => c.currentStreak));
  const totalStreakDays = chains.reduce((sum, chain) => sum + chain.currentStreak, 0);
  const xpMultiplier = Math.min(1 + (longestActiveStreak * 0.02), 3);

  // Get tier based on longest streak
  const getTier = (streak: number) => {
    if (streak >= 100) return { name: 'Legendary', color: 'text-yellow-400', bg: 'from-yellow-500/20 to-amber-500/20' };
    if (streak >= 50) return { name: 'Epic', color: 'text-purple-400', bg: 'from-purple-500/20 to-pink-500/20' };
    if (streak >= 30) return { name: 'Rare', color: 'text-blue-400', bg: 'from-blue-500/20 to-cyan-500/20' };
    if (streak >= 7) return { name: 'Strong', color: 'text-green-400', bg: 'from-green-500/20 to-emerald-500/20' };
    return { name: 'Building', color: 'text-gray-400', bg: 'from-gray-500/20 to-gray-600/20' };
  };

  const tier = getTier(longestActiveStreak);

  const colorMap: Record<string, string> = {
    purple: 'from-purple-500 to-pink-500',
    blue: 'from-blue-500 to-cyan-500',
    green: 'from-green-500 to-emerald-500',
    orange: 'from-orange-500 to-amber-500'
  };

  return (
    <div className="space-y-6">
      {/* Main Stats Card */}
      <div className={`cosmic-panel rounded-2xl p-6 bg-gradient-to-br ${tier.bg} border border-white/10`}>
        <div className="flex items-center justify-between">
          {/* Left - Main Streak */}
          <div className="flex items-center gap-6">
            <div className="relative">
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-6xl"
              >
                🔥
              </motion.div>
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold text-white">{longestActiveStreak}</span>
                <span className="text-lg text-white/60">day streak</span>
              </div>
              <div className={`text-sm font-semibold ${tier.color} mt-1`}>
                {tier.name} Rank
              </div>
            </div>
          </div>

          {/* Right - Quick Stats */}
          <div className="flex gap-6">
            <div className="text-center">
              <div className="flex items-center gap-1 text-orange-400">
                <Flame className="w-4 h-4" />
                <span className="text-2xl font-bold">{totalStreakDays}</span>
              </div>
              <div className="text-xs text-white/50">Total Days</div>
            </div>
            <div className="text-center">
              <div className="flex items-center gap-1 text-yellow-400">
                <Zap className="w-4 h-4" />
                <span className="text-2xl font-bold">+{Math.round((xpMultiplier - 1) * 100)}%</span>
              </div>
              <div className="text-xs text-white/50">XP Boost</div>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Heatmap */}
      <div className="cosmic-panel rounded-2xl p-5 border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Activity</h3>
          <span className="text-sm text-white/50">
            {heatmapData.filter(d => d.value > 0).length} active days
          </span>
        </div>
        <YearlyHeatmap data={heatmapData} colorScheme="green" />
      </div>

      {/* Streak Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {chains.map((chain) => {
          const isActive = chain.currentStreak > 0;
          const weekCompletion = chain.weekData.filter(Boolean).length;

          return (
            <motion.div
              key={chain.id}
              whileHover={{ scale: 1.02 }}
              className={`
                cosmic-panel rounded-xl p-4 border border-white/10
                ${isActive ? 'bg-gradient-to-br ' + colorMap[chain.color].replace('from-', 'from-').replace('to-', 'to-') + '/10' : ''}
              `}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl">{chain.icon}</span>
                {isActive && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">
                    Active
                  </span>
                )}
              </div>

              {/* Name */}
              <div className="text-sm font-medium text-white/80 mb-2">{chain.name}</div>

              {/* Streak Count */}
              <div className="flex items-baseline gap-1 mb-3">
                <span className="text-3xl font-bold text-white">{chain.currentStreak}</span>
                <span className="text-sm text-white/50">days</span>
              </div>

              {/* Week Progress */}
              <div className="flex gap-1">
                {chain.weekData.map((completed, i) => (
                  <div
                    key={i}
                    className={`
                      flex-1 h-1.5 rounded-full
                      ${completed
                        ? `bg-gradient-to-r ${colorMap[chain.color]}`
                        : 'bg-white/10'
                      }
                    `}
                  />
                ))}
              </div>
              <div className="text-xs text-white/40 mt-1">{weekCompletion}/7 this week</div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
