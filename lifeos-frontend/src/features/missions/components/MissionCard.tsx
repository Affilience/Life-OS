import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Coins, Target, Clock, CheckCircle2, XCircle, Sparkles } from 'lucide-react';
import type { UserMission, MissionObjective } from '../types';

interface MissionCardProps {
  mission: UserMission;
  onComplete?: (missionId: string) => void;
  onUpdateProgress?: (missionId: string, objectiveId: string, value: number) => void;
}

export function MissionCard({ mission, onComplete, onUpdateProgress }: MissionCardProps) {
  const missionData = mission.mission;
  if (!missionData) return null;

  const isCompleted = mission.status === 'completed';
  const isExpired = mission.status === 'expired';
  const isActive = mission.status === 'active';

  // Difficulty colors
  const difficultyColors = {
    routine: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30',
    moderate: 'from-purple-500/20 to-pink-500/20 border-purple-500/30',
    challenging: 'from-orange-500/20 to-red-500/20 border-orange-500/30',
    cosmic: 'from-indigo-500/20 via-purple-500/20 to-pink-500/20 border-purple-500/50'
  };

  const difficultyGradient = difficultyColors[missionData.difficulty];

  // Calculate time remaining
  const getTimeRemaining = () => {
    if (!mission.expiresAt) return null;
    const now = new Date();
    const expires = new Date(mission.expiresAt);
    const diff = expires.getTime() - now.getTime();

    if (diff < 0) return 'Expired';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d remaining`;
    }
    return `${hours}h ${minutes}m`;
  };

  const handleComplete = () => {
    if (mission.completionPercentage === 100 && !isCompleted && onComplete) {
      onComplete(mission.id);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        relative cosmic-card cosmic-border cosmic-lift p-6 rounded-2xl
        bg-gradient-to-br ${difficultyGradient}
        ${isCompleted ? 'opacity-75' : ''}
        ${isExpired ? 'opacity-50 grayscale' : ''}
      `}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {missionData.icon && <span className="text-2xl">{missionData.icon}</span>}
            <h3 className="text-xl font-bold text-white cosmic-title">{missionData.title}</h3>
          </div>
          {missionData.cosmicNarrative && (
            <p className="text-sm text-purple-300 italic mb-2">{missionData.cosmicNarrative}</p>
          )}
          <p className="text-sm text-gray-300">{missionData.description}</p>
        </div>

        {/* Status Badge */}
        <div className="flex-shrink-0">
          {isCompleted && (
            <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/20 border border-green-500/50">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              <span className="text-xs font-semibold text-green-400">Complete</span>
            </div>
          )}
          {isExpired && (
            <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/50">
              <XCircle className="w-4 h-4 text-red-400" />
              <span className="text-xs font-semibold text-red-400">Expired</span>
            </div>
          )}
          {isActive && (
            <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/50">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-semibold text-blue-400">Active</span>
            </div>
          )}
        </div>
      </div>

      {/* Objectives */}
      <div className="space-y-3 mb-4">
        {missionData.objectives.map((objective: MissionObjective) => {
          const progress = mission.progress[objective.id] || 0;
          const percentage = Math.min((progress / objective.target) * 100, 100);
          const completed = progress >= objective.target;

          return (
            <div key={objective.id} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Target className={`w-4 h-4 ${completed ? 'text-green-400' : 'text-gray-400'}`} />
                  <span className={completed ? 'text-green-300' : 'text-gray-300'}>
                    {objective.description}
                  </span>
                </div>
                <span className={`font-semibold ${completed ? 'text-green-400' : 'text-gray-400'}`}>
                  {progress}/{objective.target}
                </span>
              </div>
              <div className="h-2 bg-gray-800/50 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className={`h-full ${
                    completed
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                      : 'bg-gradient-to-r from-blue-500 to-purple-500'
                  }`}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-white/10">
        {/* Rewards */}
        <div className="flex gap-4">
          <div className="flex items-center gap-1">
            <Zap className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-semibold text-purple-300">+{missionData.xpReward} XP</span>
          </div>
          <div className="flex items-center gap-1">
            <Coins className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-semibold text-amber-300">+{missionData.creditsReward}</span>
          </div>
        </div>

        {/* Time / Complete Button */}
        <div className="flex items-center gap-3">
          {mission.expiresAt && !isCompleted && (
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Clock className="w-3 h-3" />
              {getTimeRemaining()}
            </div>
          )}

          {mission.completionPercentage === 100 && !isCompleted && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleComplete}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold text-sm cosmic-glow"
            >
              Claim Rewards
            </motion.button>
          )}

          {isCompleted && (
            <div className="text-xs text-green-400 font-semibold">
              ✓ Rewards Claimed
            </div>
          )}
        </div>
      </div>

      {/* Cosmic difficulty indicator */}
      {missionData.difficulty === 'cosmic' && (
        <div className="absolute top-0 right-0 px-3 py-1 rounded-bl-xl rounded-tr-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-bold">
          🌟 COSMIC
        </div>
      )}

      {/* Completion percentage indicator */}
      <div className="absolute top-2 left-2 text-xs font-bold text-white/50">
        {mission.completionPercentage}%
      </div>
    </motion.div>
  );
}
