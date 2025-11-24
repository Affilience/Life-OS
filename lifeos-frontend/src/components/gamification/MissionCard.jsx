import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolidIcon } from '@heroicons/react/24/solid';

/**
 * Mission Card - Display for daily/weekly/monthly missions
 *
 * Shows mission progress, rewards, and completion status
 */
export default function MissionCard({ mission, onComplete }) {
  const frequencyColors = {
    daily: 'from-cyan-500 to-blue-600',
    weekly: 'from-purple-500 to-pink-600',
    monthly: 'from-amber-500 to-orange-600',
    seasonal: 'from-green-500 to-emerald-600',
  };

  const frequencyBorders = {
    daily: 'border-cyan-500/30',
    weekly: 'border-purple-500/30',
    monthly: 'border-amber-500/30',
    seasonal: 'border-green-500/30',
  };

  const frequencyBgs = {
    daily: 'bg-cyan-500/10',
    weekly: 'bg-purple-500/10',
    monthly: 'bg-amber-500/10',
    seasonal: 'bg-green-500/10',
  };

  const frequencyText = {
    daily: 'text-cyan-400',
    weekly: 'text-purple-400',
    monthly: 'text-amber-400',
    seasonal: 'text-green-400',
  };

  const isCompleted = mission.status === 'completed';
  const progress = mission.current_progress || 0;
  const target = mission.target_value || 1;
  const progressPercent = Math.min(100, (progress / target) * 100);

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`bg-gray-800/50 backdrop-blur-sm rounded-xl border ${frequencyBorders[mission.frequency]} p-4 relative overflow-hidden`}
    >
      {/* Background gradient */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${frequencyColors[mission.frequency]} opacity-5`}
      />

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`px-2 py-0.5 rounded text-xs font-semibold uppercase ${frequencyBgs[mission.frequency]} ${frequencyText[mission.frequency]} border ${frequencyBorders[mission.frequency]}`}
              >
                {mission.frequency}
              </span>
              {mission.expiry_date && !isCompleted && (
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <ClockIcon className="w-3.5 h-3.5" />
                  <span>{formatTimeRemaining(mission.expiry_date)}</span>
                </div>
              )}
            </div>
            <h3 className="text-white font-semibold text-lg leading-tight">
              {mission.title}
            </h3>
          </div>

          {/* Status icon */}
          <div className="ml-3 flex-shrink-0">
            {isCompleted ? (
              <CheckCircleSolidIcon className="w-8 h-8 text-green-400" />
            ) : (
              <div className="w-8 h-8 rounded-full border-2 border-gray-600 flex items-center justify-center">
                <span className="text-gray-400 text-xs font-semibold">
                  {Math.floor(progressPercent)}%
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        {mission.description && (
          <p className="text-sm text-gray-400 mb-3">
            {mission.description}
          </p>
        )}

        {/* Progress bar */}
        {!isCompleted && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-gray-400">Progress</span>
              <span className={frequencyText[mission.frequency]}>
                {progress}/{target}
              </span>
            </div>
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className={`h-full bg-gradient-to-r ${frequencyColors[mission.frequency]} relative`}
              >
                {/* Shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
              </motion.div>
            </div>
          </div>
        )}

        {/* Rewards */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-700/50">
          <div className="flex items-center gap-3">
            {mission.xp_reward > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="text-cyan-400">⚡</span>
                <span className="text-white font-semibold text-sm">
                  {mission.xp_reward} XP
                </span>
              </div>
            )}

            {mission.credit_reward > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="text-purple-400">💎</span>
                <span className="text-white font-semibold text-sm">
                  {mission.credit_reward}
                </span>
              </div>
            )}
          </div>

          {/* Complete button */}
          {!isCompleted && progressPercent >= 100 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onComplete}
              className={`px-4 py-1.5 rounded-lg font-semibold text-sm bg-gradient-to-r ${frequencyColors[mission.frequency]} text-white shadow-lg`}
            >
              Complete
            </motion.button>
          )}
        </div>

        {/* Completed timestamp */}
        {isCompleted && mission.completed_at && (
          <div className="mt-3 pt-3 border-t border-gray-700/50 text-xs text-gray-400">
            Completed {new Date(mission.completed_at).toLocaleDateString()}
          </div>
        )}
      </div>
    </motion.div>
  );
}

/**
 * Mission Grid - Display missions grouped by frequency
 */
export function MissionGrid({ missions, onComplete, columns = 1 }) {
  if (!missions || missions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <div className="text-6xl mb-3">🎯</div>
        <p className="text-lg">No active missions</p>
        <p className="text-sm mt-1">New missions will appear here</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
      {missions.map((mission) => (
        <MissionCard
          key={mission.id}
          mission={mission}
          onComplete={() => onComplete?.(mission.id)}
        />
      ))}
    </div>
  );
}

/**
 * Mission Tabs - Display missions with frequency tabs
 */
export function MissionTabs({ missions, onComplete }) {
  const [activeTab, setActiveTab] = React.useState('daily');

  const tabs = [
    { id: 'daily', label: 'Daily', icon: '☀️' },
    { id: 'weekly', label: 'Weekly', icon: '📅' },
    { id: 'monthly', label: 'Monthly', icon: '🗓️' },
    { id: 'seasonal', label: 'Seasonal', icon: '🌟' },
  ];

  const groupedMissions = {
    daily: missions?.daily || [],
    weekly: missions?.weekly || [],
    monthly: missions?.monthly || [],
    seasonal: missions?.seasonal || [],
  };

  const activeMissions = groupedMissions[activeTab];

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {tabs.map((tab) => {
          const count = groupedMissions[tab.id]?.length || 0;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg'
                  : 'bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.5 rounded text-xs ${isActive ? 'bg-white/20' : 'bg-gray-700'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Mission grid */}
      <MissionGrid missions={activeMissions} onComplete={onComplete} />
    </div>
  );
}

// Helper function
function formatTimeRemaining(expiryDate) {
  const now = new Date();
  const expiry = new Date(expiryDate);
  const diff = expiry - now;

  if (diff < 0) return 'Expired';

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours < 24) {
    return `${hours}h ${minutes}m`;
  }

  const days = Math.floor(hours / 24);
  return `${days}d ${hours % 24}h`;
}
