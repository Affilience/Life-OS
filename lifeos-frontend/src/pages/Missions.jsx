import React, { useState, useMemo } from 'react';
import {
  Target,
  Trophy,
  Flame,
  Calendar,
  Sparkles,
  Zap,
  Clock,
  Star,
  Crown,
  Globe,
  Swords,
  Link,
  CalendarDays,
  Award
} from 'lucide-react';
import DailyQuests from '../components/missions/DailyQuests';
import WeeklyQuests from '../components/missions/WeeklyQuests';
import MonthlyEpicQuests from '../components/missions/MonthlyEpicQuests';
import QuestChains from '../components/missions/QuestChains';
import CrossModuleQuests from '../components/missions/CrossModuleQuests';
import BossBattles from '../components/missions/BossBattles';
import Achievements from '../components/missions/Achievements';
import StreaksView from '../components/missions/StreaksView';
import Challenges from '../components/missions/Challenges';
import useQuestsStore from '../stores/questsStore';
import useDailyTasksStore from '../stores/dailyTasksStore';

const TABS = [
  { id: 'daily', label: 'Daily', icon: Calendar, color: 'from-cyan-500 to-blue-500', description: 'Daily quests reset at midnight' },
  { id: 'weekly', label: 'Weekly', icon: CalendarDays, color: 'from-blue-500 to-indigo-500', description: '7-day challenges' },
  { id: 'monthly', label: 'Epic', icon: Crown, color: 'from-purple-500 to-pink-500', description: 'Monthly legendary quests' },
  { id: 'chains', label: 'Journeys', icon: Link, color: 'from-indigo-500 to-purple-500', description: 'Multi-part quest chains' },
  { id: 'crossmodule', label: 'Cross-Module', icon: Globe, color: 'from-cyan-500 to-teal-500', description: 'Span multiple life areas' },
  { id: 'boss', label: 'Boss Battles', icon: Swords, color: 'from-orange-500 to-red-500', description: 'Challenge powerful bosses' },
  { id: 'achievements', label: 'Achievements', icon: Trophy, color: 'from-yellow-500 to-orange-500', description: 'Your trophy collection' },
  { id: 'streaks', label: 'Streaks', icon: Flame, color: 'from-orange-500 to-red-500', description: 'Maintain momentum' },
];

const Missions = () => {
  const [activeTab, setActiveTab] = useState('daily');

  // Get stats from stores
  const { getQuestSummary, questStats } = useQuestsStore();
  const { getTodayStats, getStreak } = useDailyTasksStore();

  const questSummary = getQuestSummary();
  const todayStats = getTodayStats();
  const streak = getStreak();

  // Calculate quick stats
  const quickStats = useMemo(() => ({
    credits: questStats.totalCreditsEarned || 0,
    streak: streak,
    achievements: questStats.totalQuestsCompleted || 0,
    bosses: questStats.bossesDefeated || 0,
  }), [questStats, streak]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'daily':
        return <DailyQuests />;
      case 'weekly':
        return <WeeklyQuests />;
      case 'monthly':
        return <MonthlyEpicQuests />;
      case 'chains':
        return <QuestChains />;
      case 'crossmodule':
        return <CrossModuleQuests />;
      case 'boss':
        return <BossBattles />;
      case 'achievements':
        return <Achievements />;
      case 'streaks':
        return <StreaksView />;
      default:
        return <DailyQuests />;
    }
  };

  // Get notification counts for tabs
  const getTabNotification = (tabId) => {
    switch (tabId) {
      case 'daily':
        return todayStats.total - todayStats.completed;
      case 'weekly':
        return questSummary.weekly.total - questSummary.weekly.completed;
      case 'monthly':
        return questSummary.monthly.total - questSummary.monthly.completed;
      case 'chains':
        return questSummary.chains.available;
      case 'crossmodule':
        return questSummary.crossModule.active;
      case 'boss':
        return questSummary.bossBattles.active;
      default:
        return 0;
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
              <p className="text-white/60 text-sm md:text-base mt-1">
                Daily quests, epic challenges, and legendary journeys
              </p>
            </div>

            {/* Quick Stats */}
            <div className="hidden md:flex items-center gap-3">
              <div className="bg-[#1a1724] border border-yellow-500/30 rounded-xl px-4 py-2">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <span className="text-lg font-bold text-white">{quickStats.credits.toLocaleString()}</span>
                  <span className="text-xs text-white/60">Credits</span>
                </div>
              </div>
              <div className="bg-[#1a1724] border border-orange-500/30 rounded-xl px-4 py-2">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-orange-400" />
                  <span className="text-lg font-bold text-white">{quickStats.streak}</span>
                  <span className="text-xs text-white/60">Day Streak</span>
                </div>
              </div>
              <div className="bg-[#1a1724] border border-purple-500/30 rounded-xl px-4 py-2">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-purple-400" />
                  <span className="text-lg font-bold text-white">{quickStats.achievements}</span>
                  <span className="text-xs text-white/60">Completed</span>
                </div>
              </div>
              {quickStats.bosses > 0 && (
                <div className="bg-[#1a1724] border border-red-500/30 rounded-xl px-4 py-2">
                  <div className="flex items-center gap-2">
                    <Swords className="w-4 h-4 text-red-400" />
                    <span className="text-lg font-bold text-white">{quickStats.bosses}</span>
                    <span className="text-xs text-white/60">Bosses</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const notification = getTabNotification(tab.id);

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    relative flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm
                    whitespace-nowrap transition-all duration-200
                    ${isActive
                      ? `bg-gradient-to-r ${tab.color} text-white shadow-lg`
                      : 'bg-[#1a1724] text-white/60 hover:text-white hover:bg-[#221e2e] border border-white/10'
                    }
                  `}
                  title={tab.description}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {notification > 0 && !isActive && (
                    <span className={`
                      ml-1 px-1.5 py-0.5 text-xs rounded-full
                      ${tab.id === 'boss' ? 'bg-red-500' : 'bg-purple-500'}
                      text-white
                    `}>
                      {notification}
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
