import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Flame, Award, TrendingUp, Calendar as CalendarIcon } from 'lucide-react';
import { MomentumChainCard } from './MomentumChainCard';

// Mock data - will be replaced with Supabase later
const mockChains = [
  {
    id: '1',
    chainType: 'daily_mission',
    moduleName: 'Daily Missions',
    currentStreak: 14,
    longestStreak: 21,
    totalDaysActive: 45,
    shieldsAvailable: 2,
    icon: '🎯',
    color: 'purple',
    lastActivityDate: new Date().toISOString().split('T')[0]
  },
  {
    id: '2',
    chainType: 'journal_entry',
    moduleName: 'Journal Entries',
    currentStreak: 7,
    longestStreak: 15,
    totalDaysActive: 38,
    shieldsAvailable: 1,
    icon: '📝',
    color: 'blue',
    lastActivityDate: new Date().toISOString().split('T')[0]
  },
  {
    id: '3',
    chainType: 'workout',
    moduleName: 'Workouts',
    currentStreak: 32,
    longestStreak: 32,
    totalDaysActive: 52,
    shieldsAvailable: 3,
    icon: '💪',
    color: 'orange',
    lastActivityDate: new Date().toISOString().split('T')[0]
  },
  {
    id: '4',
    chainType: 'reading',
    moduleName: 'Reading',
    currentStreak: 5,
    longestStreak: 12,
    totalDaysActive: 28,
    shieldsAvailable: 0,
    icon: '📚',
    color: 'green',
    lastActivityDate: new Date(Date.now() - 86400000).toISOString().split('T')[0] // Yesterday
  }
];

export function MomentumChainsBoard() {
  const [chains] = useState(mockChains);

  // Calculate stats
  const totalStreakDays = chains.reduce((sum, chain) => sum + chain.currentStreak, 0);
  const longestActiveStreak = Math.max(...chains.map(c => c.currentStreak));
  const activeChains = chains.filter(c => c.currentStreak > 0).length;
  const totalShields = chains.reduce((sum, chain) => sum + chain.shieldsAvailable, 0);

  return (
    <div className="cosmic-panel cosmic-border cosmic-lift p-6 rounded-2xl">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold cosmic-title mb-2">
          🔥 Momentum Chains
        </h2>
        <p className="text-gray-400">
          Build consistency across all life areas. Shields protect your streaks from breaks.
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="cosmic-card cosmic-border cosmic-glow rounded-xl p-4"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500/20 to-red-500/20">
              <Flame className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Total Streak Days</p>
              <p className="text-2xl font-bold text-white">{totalStreakDays}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          className="cosmic-card cosmic-border cosmic-glow rounded-xl p-4"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20">
              <TrendingUp className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Longest Active</p>
              <p className="text-2xl font-bold text-white">{longestActiveStreak}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          className="cosmic-card cosmic-border cosmic-glow rounded-xl p-4"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20">
              <CalendarIcon className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Active Chains</p>
              <p className="text-2xl font-bold text-white">{activeChains}/{chains.length}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          className="cosmic-card cosmic-border cosmic-glow rounded-xl p-4"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20">
              <Award className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Total Shields</p>
              <p className="text-2xl font-bold text-white">{totalShields}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Info Box */}
      <div className="mb-6 cosmic-card rounded-xl p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-blue-500/20">
            <Award className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white mb-1">How Shields Work</h3>
            <p className="text-sm text-gray-300">
              Earn a shield every 7-day milestone. If you miss a day, a shield automatically protects your streak.
              Build up to 3 shields per chain for maximum protection. Shields make consistency <em>forgiving</em>, not <em>punishment</em>.
            </p>
          </div>
        </div>
      </div>

      {/* Chains Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {chains.map((chain, index) => (
          <motion.div
            key={chain.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <MomentumChainCard {...chain} />
          </motion.div>
        ))}
      </div>

      {/* Milestones Section */}
      <div className="mt-8 pt-6 border-t border-white/10">
        <h3 className="text-xl font-bold cosmic-title mb-4">🏆 Streak Milestones</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { days: 7, tier: 'Strong', color: 'green', reward: '+1 Shield' },
            { days: 30, tier: 'Rare', color: 'blue', reward: '+100 Credits' },
            { days: 50, tier: 'Epic', color: 'purple', reward: '+250 Credits' },
            { days: 100, tier: 'Legendary', color: 'yellow', reward: '+500 Credits' },
            { days: 365, tier: 'Cosmic', color: 'rainbow', reward: 'Legendary Badge' }
          ].map((milestone) => (
            <div
              key={milestone.days}
              className={`
                cosmic-card rounded-xl p-3 text-center
                ${chains.some(c => c.currentStreak >= milestone.days)
                  ? `bg-gradient-to-br from-${milestone.color}-500/20 to-${milestone.color}-600/20 border-${milestone.color}-500/50`
                  : 'opacity-50'
                }
              `}
            >
              <div className="text-2xl font-bold text-white mb-1">{milestone.days}</div>
              <div className="text-xs text-gray-400 mb-1">{milestone.tier}</div>
              <div className="text-xs font-semibold text-green-400">{milestone.reward}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
