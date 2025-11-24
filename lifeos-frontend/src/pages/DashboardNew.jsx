import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Flame,
  Coins,
  ChevronRight,
  Brain,
  Heart,
  BookOpen,
  DollarSign,
  CheckCircle2,
  Calendar as CalendarIcon,
  Sparkles,
  Dumbbell,
  Pen,
  TrendingUp,
  Target,
  BarChart3,
  Zap
} from 'lucide-react';
import { useGamificationStore } from '../stores/gamificationStore';
import { useAvatarStore } from '../stores/avatarStore';
import { usePetStore, PET_DATABASE } from '../stores/petStore';
import { getStageByLevel } from '../data/avatarEvolution';

export default function DashboardNew() {
  const navigate = useNavigate();
  const { level, xp, currentXP, xpToNextLevel, streak = 0, credits = 0 } = useGamificationStore();
  const { prestige = 0 } = useAvatarStore();
  const { activePets } = usePetStore();

  // Calculate XP percentage for progress bar
  const xpPercentage = xpToNextLevel > 0 ? (currentXP / xpToNextLevel) * 100 : 0;

  // Get current evolution stage
  const evolutionStage = getStageByLevel(level, prestige);

  // Get active pet data
  const activePet = activePets.length > 0 ? PET_DATABASE[activePets[0]] : null;

  // Today's Tasks (mock data - replace with real todo system)
  const [todaysTasks, setTodaysTasks] = useState([
    { id: 1, title: 'Morning workout - 30 min cardio', done: false, module: 'Health', xp: 25 },
    { id: 2, title: 'Complete client proposal draft', done: false, module: 'Productivity', xp: 40 },
    { id: 3, title: 'Read "Atomic Habits" - Chapter 3', done: false, module: 'Knowledge', xp: 20 },
    { id: 4, title: 'Journal entry - daily reflection', done: false, module: 'Journal', xp: 15 },
    { id: 5, title: 'Update budget spreadsheet', done: false, module: 'Finance', xp: 30 },
  ]);

  const toggleTask = (taskId) => {
    setTodaysTasks(tasks =>
      tasks.map(task =>
        task.id === taskId ? { ...task, done: !task.done } : task
      )
    );
  };

  const completedTasks = todaysTasks.filter(t => t.done).length;
  const totalTasks = todaysTasks.length;
  const taskCompletionPercentage = (completedTasks / totalTasks) * 100;

  // All Modules Health
  const allModules = [
    { name: 'Health', score: 92, icon: Heart, color: 'from-green-500 to-emerald-500', route: '/health' },
    { name: 'Productivity', score: 78, icon: Brain, color: 'from-blue-500 to-cyan-500', route: '/productivity' },
    { name: 'Knowledge', score: 85, icon: BookOpen, color: 'from-purple-500 to-pink-500', route: '/knowledge' },
    { name: 'Journal', score: 67, icon: Pen, color: 'from-orange-500 to-red-500', route: '/journal' },
    { name: 'Finance', score: 45, icon: DollarSign, color: 'from-yellow-500 to-orange-500', route: '/financial' },
    { name: 'Calendar', score: 88, icon: CalendarIcon, color: 'from-indigo-500 to-purple-500', route: '/calendar' },
    { name: 'Skills', score: 73, icon: Target, color: 'from-pink-500 to-rose-500', route: '/skills' },
    { name: 'Fitness', score: 90, icon: Dumbbell, color: 'from-cyan-500 to-blue-500', route: '/health' },
  ];

  // Quick insights - valuable metrics
  const insights = [
    {
      label: 'Weekly XP',
      value: '2,450',
      change: '+18%',
      trend: 'up',
      icon: TrendingUp,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10'
    },
    {
      label: 'Avg Daily Score',
      value: '87',
      change: '+5 pts',
      trend: 'up',
      icon: BarChart3,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10'
    },
    {
      label: 'Completion Rate',
      value: '76%',
      change: '+12%',
      trend: 'up',
      icon: CheckCircle2,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10'
    },
    {
      label: 'Active Days',
      value: '24/30',
      change: '80%',
      trend: 'stable',
      icon: CalendarIcon,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10'
    },
  ];

  return (
    <div className="min-h-screen bg-[#0c0a10] pb-20">
      {/* Top Status Bar - Streak & Credits */}
      <div className="sticky top-0 z-20 bg-[#0c0a10]/95 backdrop-blur-md border-b border-white/5">
        <div className="px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-400" />
              <span className="text-sm font-bold text-white">{streak}</span>
              <span className="text-xs text-white/60">day streak</span>
            </div>
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-yellow-400" />
              <span className="text-sm font-bold text-white">{credits}</span>
              <span className="text-xs text-white/60">credits</span>
            </div>
          </div>
          <button
            onClick={() => navigate('/character')}
            className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1"
          >
            View Character
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Hero Section - Avatar, Pet & Level */}
        <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-6">
          <div className="flex items-center gap-6">
            {/* Avatar with Pet - Combined Box */}
            <div
              className="flex-shrink-0 cursor-pointer hover:scale-105 transition-transform relative"
              onClick={() => navigate('/character')}
            >
              <div className="relative w-44 h-44 bg-[#0c0a10] rounded-xl flex items-center justify-center p-4">
                {/* Avatar */}
                <img
                  src="/assets/avatar/evolution/hero_v3_stage_10_swordsman.png"
                  alt="Avatar"
                  className="w-36 h-36 pixelated"
                  style={{ imageRendering: 'pixelated' }}
                />

                {/* Pet - positioned in bottom right corner inside same box */}
                {activePet && (
                  <div className="absolute bottom-2 right-2">
                    <img
                      src={activePet.sprite}
                      alt={activePet.name}
                      className="w-14 h-14 pixelated"
                      style={{ imageRendering: 'pixelated' }}
                    />
                  </div>
                )}

                {/* Prestige Badge */}
                {prestige > 0 && (
                  <div className="absolute -top-2 -right-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full px-2 py-0.5 text-xs font-bold shadow-lg">
                    ✨ {prestige}
                  </div>
                )}
              </div>
            </div>

            {/* Level & XP */}
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2 mb-2">
                <h2 className="text-2xl font-bold text-white">Swordsman</h2>
                <span className="text-lg text-purple-400 font-semibold">Lv.{level}</span>
              </div>

              <p className="text-sm text-white/60 mb-3">
                Stage {evolutionStage?.stage || 10} • Warrior Path
                {activePet && <span className="ml-2 text-purple-400">• with {activePet.name}</span>}
              </p>

              {/* XP Bar */}
              <div>
                <div className="flex justify-between text-xs text-white/60 mb-1">
                  <span>{currentXP} XP</span>
                  <span>{xpToNextLevel} XP to Level {level + 1}</span>
                </div>
                <div className="h-2.5 bg-[#0c0a10] rounded-full overflow-hidden border border-purple-500/20">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500 relative overflow-hidden"
                    style={{ width: `${xpPercentage}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Today's Tasks */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-white/60 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Today's Tasks
            </h3>
            <span className="text-xs text-purple-400">
              {completedTasks}/{totalTasks} completed
            </span>
          </div>

          {/* Progress Ring */}
          <div className="bg-[#1a1724] border border-white/10 rounded-xl p-4 mb-3">
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16">
                <svg className="transform -rotate-90 w-16 h-16">
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                    className="text-gray-700"
                  />
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 28}`}
                    strokeDashoffset={`${2 * Math.PI * 28 * (1 - taskCompletionPercentage / 100)}`}
                    className="text-purple-500 transition-all duration-500"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold text-white">{Math.round(taskCompletionPercentage)}%</span>
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm text-white font-medium mb-1">Daily Progress</p>
                <p className="text-xs text-white/60">
                  {completedTasks === totalTasks
                    ? "Perfect! All tasks completed 🎉"
                    : `${totalTasks - completedTasks} task${totalTasks - completedTasks !== 1 ? 's' : ''} remaining`}
                </p>
              </div>
            </div>
          </div>

          {/* Task List */}
          <div className="bg-[#1a1724] border border-white/10 rounded-xl p-4 space-y-3">
            {todaysTasks.map((task) => (
              <div key={task.id} className="flex items-center gap-3 group">
                <button
                  onClick={() => toggleTask(task.id)}
                  className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    task.done
                      ? 'bg-green-500 border-green-500'
                      : 'border-gray-600 hover:border-purple-500 group-hover:scale-110'
                  }`}
                >
                  {task.done && <CheckCircle2 className="w-3 h-3 text-white" />}
                </button>
                <div className="flex-1">
                  <p className={`text-sm ${task.done ? 'line-through text-white/50' : 'text-white'}`}>
                    {task.title}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-white/60">{task.module}</span>
                    <span className="text-xs text-purple-400">+{task.xp} XP</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Insights */}
        <div>
          <h3 className="text-sm font-semibold text-white/60 mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Weekly Insights
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {insights.map((insight) => {
              const Icon = insight.icon;
              return (
                <div key={insight.label} className={`${insight.bgColor} border border-white/10 rounded-xl p-4`}>
                  <div className="flex items-start justify-between mb-2">
                    <Icon className={`w-5 h-5 ${insight.color}`} />
                    <span className={`text-xs font-medium ${insight.trend === 'up' ? 'text-green-400' : 'text-white/60'}`}>
                      {insight.change}
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">{insight.value}</div>
                  <div className="text-xs text-white/60">{insight.label}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Module Health - All Modules */}
        <div>
          <h3 className="text-sm font-semibold text-white/60 mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Module Health
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {allModules.map((module) => {
              const Icon = module.icon;
              return (
                <div
                  key={module.name}
                  className="bg-[#1a1724] border border-white/10 rounded-xl p-4 hover:border-purple-500/30 cursor-pointer transition-all"
                  onClick={() => navigate(module.route)}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${module.color} flex items-center justify-center flex-shrink-0`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-white/60 mb-0.5">{module.name}</div>
                      <div className="text-xl font-bold text-white">{module.score}</div>
                    </div>
                  </div>
                  <div className="h-1.5 bg-[#0c0a10] rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${module.color} transition-all duration-500`}
                      style={{ width: `${module.score}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
