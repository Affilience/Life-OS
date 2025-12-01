import React, { useState } from 'react';
import {
  Zap,
  Clock,
  Target,
  TrendingUp,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Brain,
  Plus,
  Play,
  Square
} from 'lucide-react';
import StatCard from '../shared/charts/StatCard';
import MiniBarChart from '../shared/charts/MiniBarChart';
import MiniLineChart from '../shared/charts/MiniLineChart';

/**
 * Productivity & Business Module Dashboard
 *
 * Key KPIs based on research:
 * - Deep Work Hours (Focus Time Ratio)
 * - Context Switches (Distractions)
 * - Tasks Completed
 * - Work In Progress (WIP)
 * - Project Progress
 * - Income/Revenue
 * - Efficiency Rating
 */
export default function ProductivityDashboard() {
  const [isDeepWorkActive, setIsDeepWorkActive] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [deepWorkDuration, setDeepWorkDuration] = useState(0);

  // Mock data - will be replaced with real data from backend
  const focusTimeData = [
    { label: 'Mon', value: 4.5 },
    { label: 'Tue', value: 6.2 },
    { label: 'Wed', value: 5.8 },
    { label: 'Thu', value: 7.1 },
    { label: 'Fri', value: 5.3 },
    { label: 'Sat', value: 3.2 },
    { label: 'Sun', value: 2.1 }
  ];

  const tasksCompletedData = [
    { label: 'Mon', value: 8 },
    { label: 'Tue', value: 12 },
    { label: 'Wed', value: 10 },
    { label: 'Thu', value: 15 },
    { label: 'Fri', value: 9 },
    { label: 'Sat', value: 4 },
    { label: 'Sun', value: 2 }
  ];

  const weeklyTrend = [
    { label: 'W1', value: 28 },
    { label: 'W2', value: 32 },
    { label: 'W3', value: 35 },
    { label: 'W4', value: 40 }
  ];

  const handleStartDeepWork = () => {
    setIsDeepWorkActive(true);
    // TODO: Start actual timer and logging
    console.log('Deep work session started');
  };

  const handleStopDeepWork = () => {
    setIsDeepWorkActive(false);
    // TODO: Stop timer and save session
    console.log('Deep work session stopped');
  };

  const handleLogTask = () => {
    setShowTaskModal(true);
    // TODO: Open task logging modal
    console.log('Opening task log modal');
  };

  return (
    <div className="min-h-screen bg-[#0c0a10] pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0c0a10]/95 backdrop-blur-md border-b border-white/5 px-6 py-4">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Zap className="w-6 h-6 text-yellow-400" />
          Productivity Dashboard
        </h1>
        <p className="text-sm text-white/60 mt-1">
          Deep work, tasks, projects & business metrics
        </p>
      </div>

      <div className="p-4 space-y-6">
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <StatCard
            title="Deep Work Today"
            value="5.2h"
            subtitle="vs 4.5h yesterday"
            trend="up"
            trendValue="+15%"
            icon={Brain}
            color="purple"
          />
          <StatCard
            title="Tasks Done"
            value="12"
            subtitle="3 in progress"
            trend="up"
            trendValue="+3"
            icon={CheckCircle2}
            color="green"
          />
          <StatCard
            title="Focus Ratio"
            value="87%"
            subtitle="distraction-free"
            trend="up"
            trendValue="+5%"
            icon={Target}
            color="cyan"
          />
          <StatCard
            title="Revenue"
            value="$4.2k"
            subtitle="this month"
            trend="up"
            trendValue="+12%"
            icon={DollarSign}
            color="emerald"
          />
        </div>

        {/* Deep Work Trend - Enhanced Visual */}
        <div className="bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-purple-500/10 border border-purple-500/20 rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-purple-400" />
                  Deep Work Hours
                </h3>
                <p className="text-sm text-white/60 mt-1">
                  Uninterrupted focus time this week
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-purple-300">34.2h</p>
                <p className="text-sm text-green-400 flex items-center gap-1 justify-end">
                  <TrendingUp className="w-3 h-3" />
                  +8% from last week
                </p>
              </div>
            </div>
            <div className="h-40">
              <MiniBarChart data={focusTimeData} color="purple" showValues maxHeight={100} />
            </div>
          </div>
        </div>

        {/* Tasks Completed - Enhanced Visual */}
        <div className="bg-gradient-to-br from-green-500/10 via-emerald-500/5 to-green-500/10 border border-green-500/20 rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                  Tasks Completed
                </h3>
                <p className="text-sm text-white/60 mt-1">
                  Daily completion rate
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-300">60</p>
                <p className="text-sm text-white/60">tasks this week</p>
              </div>
            </div>
            <div className="h-40">
              <MiniBarChart data={tasksCompletedData} color="green" showValues maxHeight={100} />
            </div>
          </div>
        </div>

        {/* Weekly Productivity Trend - Enhanced Visual */}
        <div className="bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-cyan-500/10 border border-cyan-500/20 rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-cyan-400" />
                  Weekly Trend
                </h3>
                <p className="text-sm text-white/60 mt-1">
                  Productivity score over time
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-cyan-300">40</p>
                <p className="text-sm text-cyan-400 flex items-center gap-1 justify-end">
                  <Target className="w-3 h-3" />
                  All-time high!
                </p>
              </div>
            </div>
            <div className="h-32">
              <MiniLineChart data={weeklyTrend} color="cyan" filled showDots height={120} />
            </div>
          </div>
        </div>

        {/* Context Switches & Distractions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-[#1a1724] border border-yellow-500/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-yellow-400" />
              <h4 className="text-sm font-semibold text-white">Context Switches</h4>
            </div>
            <p className="text-2xl font-bold text-white">18</p>
            <p className="text-xs text-white/60 mt-1">avg/day (↓ 22% from last week)</p>
          </div>

          <div className="bg-[#1a1724] border border-orange-500/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-orange-400" />
              <h4 className="text-sm font-semibold text-white">Work In Progress</h4>
            </div>
            <p className="text-2xl font-bold text-white">3</p>
            <p className="text-xs text-white/60 mt-1">active projects</p>
          </div>
        </div>

        {/* Active Projects */}
        <div className="bg-[#1a1724] border border-white/10 rounded-2xl p-5">
          <h3 className="text-lg font-semibold text-white mb-4">Active Projects</h3>
          <div className="space-y-3">
            {[
              { name: 'Quanta Development', progress: 68, color: 'purple', deadline: '2 weeks' },
              { name: 'Client Project A', progress: 42, color: 'cyan', deadline: '5 days' },
              { name: 'Business Strategy', progress: 85, color: 'green', deadline: '1 week' }
            ].map((project, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-white">{project.name}</span>
                  <span className="text-xs text-white/60">{project.deadline}</span>
                </div>
                <div className="h-2 bg-[#0c0a10] rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r from-${project.color}-500 to-${project.color}-600 transition-all duration-500`}
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/50">{project.progress}% complete</span>
                  <span className={`text-${project.color}-400 font-medium`}>On track</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions - Enhanced with Functionality */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {!isDeepWorkActive ? (
            <button
              onClick={handleStartDeepWork}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-xl font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-500/30 active:scale-95"
            >
              <Play className="w-5 h-5" />
              Start Deep Work
            </button>
          ) : (
            <button
              onClick={handleStopDeepWork}
              className="bg-gradient-to-r from-red-500 to-orange-500 text-white p-4 rounded-xl font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-500/30 active:scale-95 animate-pulse"
            >
              <Square className="w-5 h-5" />
              Stop Session
            </button>
          )}
          <button
            onClick={handleLogTask}
            className="bg-[#1a1724] border border-white/20 text-white p-4 rounded-xl font-semibold hover:bg-white/5 transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <Plus className="w-5 h-5" />
            Log Task
          </button>
        </div>

        {/* Deep Work Active Indicator */}
        {isDeepWorkActive && (
          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-2xl p-5 flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-purple-500/30 flex items-center justify-center">
                  <Brain className="w-6 h-6 text-purple-300" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-ping" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Deep Work In Progress</h3>
                <p className="text-sm text-white/60">Stay focused and avoid distractions</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-purple-300">
                {Math.floor(deepWorkDuration / 60)}:{String(deepWorkDuration % 60).padStart(2, '0')}
              </p>
              <p className="text-xs text-white/60">minutes elapsed</p>
            </div>
          </div>
        )}

        {/* Task Modal Placeholder */}
        {showTaskModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#1a1724] border border-white/20 rounded-2xl p-6 max-w-md w-full">
              <h3 className="text-xl font-bold text-white mb-4">Log Task</h3>
              <p className="text-white/60 mb-4">Task logging interface coming soon...</p>
              <button
                onClick={() => setShowTaskModal(false)}
                className="w-full bg-purple-500 text-white py-3 rounded-xl font-semibold hover:bg-purple-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
