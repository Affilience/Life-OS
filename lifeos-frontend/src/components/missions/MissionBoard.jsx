import React, { useState } from 'react';
import { useMissions, useUserMissions, useStartMission, useCompleteMission, useUpdateMissionProgress } from '../../api/missions';
import { useCosmicCurrency } from '../../api/currency';
import { Zap, Trophy, Star, CheckCircle, Clock, Target } from 'lucide-react';

export default function MissionBoard() {
  const { data: allMissions, isLoading: missionsLoading } = useMissions();
  const { data: userMissions, isLoading: userMissionsLoading } = useUserMissions();
  const { data: currency } = useCosmicCurrency();
  const startMission = useStartMission();
  const completeMission = useCompleteMission();
  const updateProgress = useUpdateMissionProgress();

  const [selectedMission, setSelectedMission] = useState(null);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'routine':
        return 'text-green-400 border-green-500/30 bg-green-500/10';
      case 'moderate':
        return 'text-blue-400 border-blue-500/30 bg-blue-500/10';
      case 'challenging':
        return 'text-purple-400 border-purple-500/30 bg-purple-500/10';
      case 'cosmic':
        return 'text-orange-400 border-orange-500/30 bg-orange-500/10';
      default:
        return 'text-gray-400 border-gray-500/30 bg-gray-500/10';
    }
  };

  const getDifficultyIcon = (difficulty) => {
    switch (difficulty) {
      case 'routine':
        return <Star className="w-4 h-4" />;
      case 'moderate':
        return <Target className="w-4 h-4" />;
      case 'challenging':
        return <Zap className="w-4 h-4" />;
      case 'cosmic':
        return <Trophy className="w-4 h-4" />;
      default:
        return <Star className="w-4 h-4" />;
    }
  };

  const handleStartMission = async (missionId) => {
    try {
      await startMission.mutateAsync(missionId);
    } catch (error) {
      console.error('Failed to start mission:', error);
    }
  };

  const handleCompleteMission = async (userMissionId) => {
    try {
      await completeMission.mutateAsync(userMissionId);
    } catch (error) {
      console.error('Failed to complete mission:', error);
    }
  };

  if (missionsLoading || userMissionsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  // Filter out missions user already has active
  const activeMissionIds = new Set(userMissions?.map(um => um.mission_id) || []);
  const availableMissions = allMissions?.filter(m => !activeMissionIds.has(m.id)) || [];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Mission Control
          </h1>
          <p className="text-gray-400 mt-2">Complete missions to earn XP and Cosmic Credits</p>
        </div>
        <div className="bg-[#1a1a1a] border border-purple-500/30 rounded-xl px-6 py-3">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            <span className="text-xl font-bold text-white">{currency?.cosmic_credits || 0}</span>
            <span className="text-gray-400 text-sm">Credits</span>
          </div>
        </div>
      </div>

      {/* Active Missions */}
      {userMissions && userMissions.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-400" />
            Active Missions ({userMissions.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userMissions.map((userMission) => {
              const mission = userMission.mission;
              if (!mission) return null;

              return (
                <div
                  key={userMission.id}
                  className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6 hover:border-purple-500/50 transition-all cursor-pointer"
                >
                  {/* Mission Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-1">{mission.title}</h3>
                      <p className="text-sm text-gray-400 line-clamp-2">{mission.description}</p>
                    </div>
                    <div className={`p-2 rounded-lg border ${getDifficultyColor(mission.difficulty)}`}>
                      {getDifficultyIcon(mission.difficulty)}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-400">Progress</span>
                      <span className="text-purple-400 font-medium">{userMission.completion_percentage}%</span>
                    </div>
                    <div className="h-2 bg-[#0a0a0a] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-300"
                        style={{ width: `${userMission.completion_percentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Rewards */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1 text-green-400">
                        <Trophy className="w-4 h-4" />
                        <span>+{mission.xp_reward} XP</span>
                      </div>
                      <div className="flex items-center gap-1 text-yellow-400">
                        <Zap className="w-4 h-4" />
                        <span>+{mission.credits_reward}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => handleCompleteMission(userMission.id)}
                    disabled={userMission.completion_percentage < 100 || completeMission.isPending}
                    className={`w-full py-2 px-4 rounded-lg font-medium transition-all ${
                      userMission.completion_percentage >= 100
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white'
                        : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {completeMission.isPending ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Completing...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        {userMission.completion_percentage >= 100 ? 'Claim Reward' : 'In Progress'}
                      </span>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Available Missions */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <Target className="w-5 h-5 text-purple-400" />
          Available Missions ({availableMissions.length})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {availableMissions.map((mission) => (
            <div
              key={mission.id}
              className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6 hover:border-purple-500/50 transition-all"
            >
              {/* Mission Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-1">{mission.title}</h3>
                  <p className="text-sm text-gray-400 line-clamp-3">{mission.description}</p>
                </div>
                <div className={`p-2 rounded-lg border ${getDifficultyColor(mission.difficulty)}`}>
                  {getDifficultyIcon(mission.difficulty)}
                </div>
              </div>

              {/* Cosmic Narrative */}
              {mission.cosmic_narrative && (
                <div className="mb-4 p-3 bg-purple-500/5 border border-purple-500/20 rounded-lg">
                  <p className="text-xs text-purple-300 italic">"{mission.cosmic_narrative}"</p>
                </div>
              )}

              {/* Rewards */}
              <div className="flex items-center gap-4 mb-4 text-sm">
                <div className="flex items-center gap-1 text-green-400">
                  <Trophy className="w-4 h-4" />
                  <span>+{mission.xp_reward} XP</span>
                </div>
                <div className="flex items-center gap-1 text-yellow-400">
                  <Zap className="w-4 h-4" />
                  <span>+{mission.credits_reward}</span>
                </div>
              </div>

              {/* Tags */}
              {mission.tags && mission.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {mission.tags.slice(0, 3).map((tag, i) => (
                    <span key={i} className="text-xs px-2 py-1 bg-blue-500/10 text-blue-400 rounded border border-blue-500/30">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Start Button */}
              <button
                onClick={() => handleStartMission(mission.id)}
                disabled={startMission.isPending}
                className="w-full py-2 px-4 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-medium rounded-lg transition-all disabled:opacity-50"
              >
                {startMission.isPending ? 'Starting...' : 'Accept Mission'}
              </button>
            </div>
          ))}
        </div>

        {availableMissions.length === 0 && (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No new missions available. Complete active missions to unlock more!</p>
          </div>
        )}
      </div>
    </div>
  );
}
