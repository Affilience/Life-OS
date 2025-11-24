import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Calendar, Trophy, Sparkles, RefreshCw } from 'lucide-react';
import { MissionCard } from './MissionCard';
import { useMissions } from '../hooks/useMissions';
import type { MissionFrequency, MissionStatus } from '../types';

export function MissionBoard() {
  const [activeTab, setActiveTab] = useState<MissionFrequency>('daily');
  const [statusFilter, setStatusFilter] = useState<MissionStatus | 'all'>('active');

  const { missions, loading, completeMission, assignDailyMissions, refetch } = useMissions({
    status: statusFilter === 'all' ? undefined : statusFilter
  });

  // Auto-assign daily missions on mount
  useEffect(() => {
    assignDailyMissions();
  }, [assignDailyMissions]);

  // Filter missions by frequency
  const filteredMissions = missions.filter(
    m => m.mission && m.mission.frequency === activeTab
  );

  const tabs: { key: MissionFrequency; label: string; icon: React.ReactNode; color: string }[] = [
    { key: 'daily', label: 'Daily', icon: <Target className="w-4 h-4" />, color: 'blue' },
    { key: 'weekly', label: 'Weekly', icon: <Calendar className="w-4 h-4" />, color: 'purple' },
    { key: 'monthly', label: 'Monthly', icon: <Trophy className="w-4 h-4" />, color: 'amber' },
    { key: 'challenge', label: 'Challenges', icon: <Sparkles className="w-4 h-4" />, color: 'pink' }
  ];

  const statusFilters: { key: MissionStatus | 'all'; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'active', label: 'Active' },
    { key: 'completed', label: 'Completed' },
    { key: 'expired', label: 'Expired' }
  ];

  return (
    <div className="cosmic-panel cosmic-border p-6 rounded-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold cosmic-title mb-2">
            🎯 Mission Control
          </h2>
          <p className="text-white/60">
            Complete missions to earn Stellar Energy and Cosmic Credits
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05, rotate: 180 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => refetch()}
          className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 cosmic-glow"
        >
          <RefreshCw className="w-5 h-5 text-blue-400" />
        </motion.button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <motion.button
            key={tab.key}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab(tab.key)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm whitespace-nowrap
              transition-all duration-200
              ${
                activeTab === tab.key
                  ? `bg-gradient-to-r from-${tab.color}-500 to-${tab.color}-600 text-white cosmic-glow shadow-lg`
                  : 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/10'
              }
            `}
          >
            {tab.icon}
            {tab.label}
            <span className={`
              px-2 py-0.5 rounded-full text-xs font-bold
              ${activeTab === tab.key ? 'bg-white/20' : 'bg-white/10'}
            `}>
              {missions.filter(m => m.mission?.frequency === tab.key).length}
            </span>
          </motion.button>
        ))}
      </div>

      {/* Status Filters */}
      <div className="flex gap-2 mb-6">
        {statusFilters.map((filter) => (
          <button
            key={filter.key}
            onClick={() => setStatusFilter(filter.key)}
            className={`
              px-3 py-1 rounded-lg text-xs font-semibold transition-all
              ${
                statusFilter === filter.key
                  ? 'bg-white/20 text-white border border-white/30'
                  : 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/10'
              }
            `}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Mission Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="cosmic-loading-pulse text-lg">
            Loading missions...
          </div>
        </div>
      ) : filteredMissions.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <div className="text-6xl mb-4">🚀</div>
          <h3 className="text-xl font-bold text-gray-300 mb-2">
            No {activeTab} missions available
          </h3>
          <p className="text-white/50">
            {activeTab === 'daily'
              ? 'Daily missions refresh every day at midnight'
              : 'Check back later for new missions'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredMissions.map((mission, index) => (
              <motion.div
                key={mission.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
              >
                <MissionCard
                  mission={mission}
                  onComplete={completeMission}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Stats Footer */}
      <div className="mt-6 pt-6 border-t border-white/10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">
              {missions.filter(m => m.status === 'active').length}
            </div>
            <div className="text-xs text-white/50">Active Missions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">
              {missions.filter(m => m.status === 'completed').length}
            </div>
            <div className="text-xs text-white/50">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">
              {Math.round(
                missions.reduce((sum, m) => sum + m.completionPercentage, 0) / missions.length || 0
              )}%
            </div>
            <div className="text-xs text-white/50">Avg Progress</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-400">
              {missions.filter(m => m.status === 'completed').reduce((sum, m) => {
                return sum + (m.mission?.creditsReward || 0);
              }, 0)}
            </div>
            <div className="text-xs text-white/50">Credits Earned</div>
          </div>
        </div>
      </div>
    </div>
  );
}
