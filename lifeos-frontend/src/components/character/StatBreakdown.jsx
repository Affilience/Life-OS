import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Sword,
  Heart,
  Brain,
  Shield,
  Sparkles,
  ChevronRight,
  Info,
  Star,
  Zap,
  Crown,
  Trophy,
  Target,
} from 'lucide-react';
import { useStats } from '../../hooks/useStats';
import { STAT_CONFIG, BASE_STATS, ACHIEVEMENT_MILESTONES } from '../../utils/statsSystem';
import { useSkillPointsStore } from '../../stores/skillPointsStore';
import { useModuleMasteryStore } from '../../stores/moduleMasteryStore';

const STAT_ICONS = {
  strength: Sword,
  vitality: Heart,
  intelligence: Brain,
  wisdom: Sparkles,
  defense: Shield,
};

const SOURCE_INFO = {
  base: { label: 'Base Stats', icon: Star, color: '#9CA3AF', description: 'Starting stats for all characters' },
  allocated: { label: 'Skill Points', icon: Zap, color: '#FBBF24', description: 'Points allocated on level up (3 per level)' },
  equipment: { label: 'Equipment', icon: Shield, color: '#3B82F6', description: 'Bonuses from equipped gear' },
  pets: { label: 'Companions', icon: Heart, color: '#EC4899', description: 'Bonuses from active pets' },
  perks: { label: 'Perk Tree', icon: Target, color: '#8B5CF6', description: 'Bonuses from unlocked perks' },
  achievements: { label: 'Achievements', icon: Trophy, color: '#F59E0B', description: 'Milestone bonuses (10/25/50/100/150 achievements)' },
  mastery: { label: 'Module Mastery', icon: Crown, color: '#10B981', description: 'Lifetime XP bonuses per module' },
};

export default function StatBreakdown({ onClose }) {
  const { stats, statBreakdown, totalPower, balanceScore, synergies } = useStats();
  const { unallocatedPoints, allocatedPoints, getTotalAllocated } = useSkillPointsStore();
  const { mastery, getTotalMasteryLevel } = useModuleMasteryStore();

  const [expandedStat, setExpandedStat] = useState(null);

  const totalAllocated = getTotalAllocated();
  const totalMastery = getTotalMasteryLevel();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden border border-slate-700"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-400" />
              Stat Breakdown
            </h2>
            <p className="text-sm text-slate-400 mt-1">See where your stats come from</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-3">
              <div className="text-xs text-purple-300 mb-1">Total Power</div>
              <div className="text-2xl font-bold text-white">{totalPower}</div>
            </div>
            <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-xl p-3">
              <div className="text-xs text-blue-300 mb-1">Balance</div>
              <div className="text-2xl font-bold text-white">{balanceScore}%</div>
            </div>
            <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-xl p-3">
              <div className="text-xs text-yellow-300 mb-1">Skill Points</div>
              <div className="text-2xl font-bold text-white">
                {totalAllocated}
                {unallocatedPoints > 0 && (
                  <span className="text-sm text-yellow-400 ml-1">+{unallocatedPoints}</span>
                )}
              </div>
            </div>
          </div>

          {/* Stat Breakdown List */}
          <div className="space-y-3">
            {Object.entries(stats).map(([statKey, totalValue]) => {
              const config = STAT_CONFIG[statKey];
              const Icon = STAT_ICONS[statKey];
              const breakdown = statBreakdown[statKey];
              const isExpanded = expandedStat === statKey;

              return (
                <div key={statKey} className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
                  {/* Stat Header */}
                  <button
                    onClick={() => setExpandedStat(isExpanded ? null : statKey)}
                    className="w-full flex items-center gap-3 p-4 hover:bg-slate-800/80 transition-colors"
                  >
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${config.color}20` }}
                    >
                      <Icon className="w-5 h-5" style={{ color: config.color }} />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-medium text-white">{config.name}</div>
                      <div className="text-xs text-slate-400">{config.description}</div>
                    </div>
                    <div className="text-2xl font-bold" style={{ color: config.color }}>
                      {totalValue}
                    </div>
                    <ChevronRight
                      className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                    />
                  </button>

                  {/* Expanded Breakdown */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 space-y-2">
                          {Object.entries(SOURCE_INFO).map(([sourceKey, sourceInfo]) => {
                            const value = breakdown[sourceKey] || 0;
                            if (value === 0 && sourceKey !== 'base') return null;

                            const SourceIcon = sourceInfo.icon;
                            const percentage = totalValue > 0 ? Math.round((value / totalValue) * 100) : 0;

                            return (
                              <div
                                key={sourceKey}
                                className="flex items-center gap-3 p-2 bg-slate-900/50 rounded-lg"
                              >
                                <SourceIcon className="w-4 h-4" style={{ color: sourceInfo.color }} />
                                <div className="flex-1">
                                  <div className="text-sm text-white">{sourceInfo.label}</div>
                                  <div className="text-xs text-slate-500">{sourceInfo.description}</div>
                                </div>
                                <div className="text-right">
                                  <div className="text-sm font-medium" style={{ color: sourceInfo.color }}>
                                    +{value}
                                  </div>
                                  <div className="text-xs text-slate-500">{percentage}%</div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          {/* Module Mastery Section */}
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
              <Crown className="w-4 h-4 text-green-400" />
              Module Mastery Levels
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(mastery).map(([module, data]) => (
                <div
                  key={module}
                  className="bg-slate-800/50 rounded-lg p-3 border border-slate-700"
                >
                  <div className="text-xs text-slate-400 capitalize mb-1">{module}</div>
                  <div className="text-lg font-bold text-green-400">Lv {data.level}</div>
                  <div className="text-xs text-slate-500">
                    {data.lifetimeXP.toLocaleString()} XP
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-2 text-center">
              Total Mastery: {totalMastery} levels across all modules
            </p>
          </div>

          {/* Active Synergies */}
          {synergies.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-orange-400" />
                Active Synergies
              </h3>
              <div className="space-y-2">
                {synergies.map((synergy, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-3 bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border border-orange-500/20 rounded-lg"
                  >
                    <span className="text-2xl">{synergy.icon}</span>
                    <div className="flex-1">
                      <div className="font-medium text-white">{synergy.name}</div>
                      <div className="text-xs text-slate-400">{synergy.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
