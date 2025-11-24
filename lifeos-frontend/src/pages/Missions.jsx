import React, { useState } from 'react';
import {
  Target,
  Trophy,
  Flame,
  Calendar,
  Sparkles,
  Zap,
  Clock,
  Star
} from 'lucide-react';
import MissionBoard from '../components/missions/MissionBoard';
import DailyQuests from '../components/missions/DailyQuests';
import Achievements from '../components/missions/Achievements';
import StreaksView from '../components/missions/StreaksView';
import Challenges from '../components/missions/Challenges';

const TABS = [
  { id: 'daily', label: 'Daily Quests', icon: Calendar, color: 'from-cyan-500 to-blue-500' },
  { id: 'missions', label: 'Weekly Missions', icon: Target, color: 'from-purple-500 to-pink-500' },
  { id: 'achievements', label: 'Achievements', icon: Trophy, color: 'from-yellow-500 to-orange-500' },
  { id: 'streaks', label: 'Streaks', icon: Flame, color: 'from-orange-500 to-red-500' },
  { id: 'challenges', label: 'Challenges', icon: Sparkles, color: 'from-pink-500 to-purple-500' },
];

const Missions = () => {
  const [activeTab, setActiveTab] = useState('daily');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'daily':
        return <DailyQuests />;
      case 'missions':
        return <MissionBoard />;
      case 'achievements':
        return <Achievements />;
      case 'streaks':
        return <StreaksView />;
      case 'challenges':
        return <Challenges />;
      default:
        return <DailyQuests />;
    }
  };

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0c0a10]/95 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                Quest Hub
              </h1>
              <p className="text-white/60 text-sm md:text-base mt-1">Your daily missions, achievements, and challenges</p>
            </div>

            {/* Quick Stats */}
            <div className="hidden md:flex items-center gap-4">
              <div className="bg-[#1a1724] border border-yellow-500/30 rounded-xl px-4 py-2">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <span className="text-lg font-bold text-white">1,240</span>
                  <span className="text-xs text-white/60">Credits</span>
                </div>
              </div>
              <div className="bg-[#1a1724] border border-orange-500/30 rounded-xl px-4 py-2">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-orange-400" />
                  <span className="text-lg font-bold text-white">14</span>
                  <span className="text-xs text-white/60">Day Streak</span>
                </div>
              </div>
              <div className="bg-[#1a1724] border border-purple-500/30 rounded-xl px-4 py-2">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-purple-400" />
                  <span className="text-lg font-bold text-white">37</span>
                  <span className="text-xs text-white/60">Achievements</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm
                    whitespace-nowrap transition-all duration-200
                    ${isActive
                      ? `bg-gradient-to-r ${tab.color} text-white shadow-lg`
                      : 'bg-[#1a1724] text-white/60 hover:text-white hover:bg-[#221e2e] border border-white/10'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.id === 'daily' && !isActive && (
                    <span className="ml-1 px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full">
                      3
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default Missions;
