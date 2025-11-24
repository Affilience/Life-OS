import React from 'react';
import { Calendar, Clock, Zap, TrendingUp, Sun, Moon, Brain } from 'lucide-react';
import MiniBarChart from '../shared/charts/MiniBarChart';
import MiniLineChart from '../shared/charts/MiniLineChart';
import StatCard from '../shared/charts/StatCard';

export default function CalendarDashboard() {
  // Mock data
  const timeBlockedData = [
    { label: 'Mon', value: 8 },
    { label: 'Tue', value: 9 },
    { label: 'Wed', value: 7 },
    { label: 'Thu', value: 10 },
    { label: 'Fri', value: 8 },
    { label: 'Sat', value: 4 },
    { label: 'Sun', value: 3 },
  ];

  const energyLevelsData = [
    { label: '6am', value: 3 },
    { label: '9am', value: 8 },
    { label: '12pm', value: 9 },
    { label: '3pm', value: 6 },
    { label: '6pm', value: 7 },
    { label: '9pm', value: 4 },
  ];

  const plannedVsActual = [
    { category: 'Deep Work', planned: 25, actual: 22 },
    { category: 'Meetings', planned: 10, actual: 12 },
    { category: 'Learning', planned: 8, actual: 6 },
    { category: 'Exercise', planned: 5, actual: 5 },
  ];

  const upcomingBlocks = [
    { time: '09:00 - 11:00', activity: 'Deep Work - Code Review', type: 'focus', energy: 'high' },
    { time: '11:00 - 12:00', activity: 'Team Sync Meeting', type: 'meeting', energy: 'medium' },
    { time: '14:00 - 16:00', activity: 'Learning - React Advanced Patterns', type: 'learning', energy: 'medium' },
    { time: '17:00 - 18:00', activity: 'Workout Session', type: 'health', energy: 'low' },
  ];

  const getTypeColor = (type) => {
    switch (type) {
      case 'focus': return 'from-indigo-500 to-purple-500';
      case 'meeting': return 'from-blue-500 to-cyan-500';
      case 'learning': return 'from-green-500 to-emerald-500';
      case 'health': return 'from-orange-500 to-red-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-[#0c0a10] pb-20">
      {/* Header with time-themed aesthetic */}
      <div className="sticky top-0 z-10 bg-gradient-to-r from-indigo-900/20 via-purple-900/20 to-indigo-900/20 backdrop-blur-md border-b border-indigo-500/20">
        <div className="px-6 py-6">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Calendar className="w-6 h-6 text-indigo-400" />
            Calendar Dashboard
          </h1>
          <p className="text-sm text-white/60 mt-1">
            Time blocking, energy mapping, and execution tracking
          </p>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Top Stats - 2x2 Grid */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            title="This Week"
            value="49h"
            subtitle="time blocked"
            trend="up"
            trendValue="+5h"
            icon={Clock}
            color="indigo"
          />
          <StatCard
            title="Efficiency"
            value="87%"
            subtitle="planned vs actual"
            trend="up"
            trendValue="+3%"
            icon={Zap}
            color="purple"
          />
          <StatCard
            title="Deep Work"
            value="22h"
            subtitle="this week"
            trend="up"
            trendValue="+2h"
            icon={Brain}
            color="blue"
          />
          <StatCard
            title="Peak Energy"
            value="10am"
            subtitle="optimal focus"
            icon={Sun}
            color="orange"
          />
        </div>

        {/* Time Blocked Per Day */}
        <div className="bg-[#1a1724] border border-white/10 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-white font-semibold flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-400" />
                Time Blocked Per Day
              </h3>
              <p className="text-xs text-white/60 mt-1">Hours scheduled this week</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-white">7.0h</div>
              <div className="text-xs text-white/60">avg/day</div>
            </div>
          </div>
          <div className="h-32">
            <MiniBarChart data={timeBlockedData} color="indigo" showValues maxHeight={120} />
          </div>
        </div>

        {/* Energy Levels Throughout Day */}
        <div className="bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-indigo-500/10 border border-indigo-500/20 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-white font-semibold flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-400" />
                Energy Pattern
              </h3>
              <p className="text-xs text-white/60 mt-1">Average energy throughout day</p>
            </div>
            <div className="flex items-center gap-2">
              <Sun className="w-4 h-4 text-orange-400" />
              <span className="text-xs text-white/60">Peak: 12pm</span>
            </div>
          </div>
          <div className="h-32">
            <MiniLineChart data={energyLevelsData} color="purple" filled={true} showDots={true} />
          </div>
        </div>

        {/* Planned vs Actual (This Week) */}
        <div className="bg-[#1a1724] border border-white/10 rounded-2xl p-5">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-400" />
            Planned vs Actual (This Week)
          </h3>
          <div className="space-y-4">
            {plannedVsActual.map((item, index) => {
              const plannedPercent = (item.planned / 50) * 100;
              const actualPercent = (item.actual / 50) * 100;
              const efficiency = Math.round((item.actual / item.planned) * 100);

              return (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-300">{item.category}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-white/50">Plan: {item.planned}h</span>
                      <span className="text-white font-semibold">Actual: {item.actual}h</span>
                      <span className={`text-xs ${efficiency >= 80 ? 'text-green-400' : 'text-yellow-400'}`}>
                        {efficiency}%
                      </span>
                    </div>
                  </div>
                  <div className="relative w-full h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="absolute top-0 left-0 h-full bg-indigo-500/30 rounded-full"
                      style={{ width: `${plannedPercent}%` }}
                    />
                    <div
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                      style={{ width: `${actualPercent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Today's Schedule */}
        <div className="bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border border-indigo-500/20 rounded-2xl p-5">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-400" />
            Today's Time Blocks
          </h3>
          <div className="space-y-3">
            {upcomingBlocks.map((block, index) => (
              <div
                key={index}
                className="bg-[#1a1724] border border-white/10 rounded-xl p-4 hover:border-indigo-500/30 transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className={`w-1 h-full bg-gradient-to-b ${getTypeColor(block.type)} rounded-full`} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-indigo-400 font-mono">{block.time}</span>
                      <span className="text-xs px-2 py-1 bg-white/5 text-white/60 rounded">
                        {block.energy} energy
                      </span>
                    </div>
                    <p className="text-white font-medium">{block.activity}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Insights Card */}
        <div className="bg-gradient-to-br from-purple-600/20 via-indigo-600/20 to-purple-600/20 border border-purple-400/30 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-3">
            <Brain className="w-5 h-5 text-purple-400" />
            <h3 className="text-white font-semibold">Time Insights</h3>
          </div>
          <ul className="space-y-2 text-sm text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-green-400">•</span>
              <span>Your most productive hours are 9am-12pm (87% task completion)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-400">•</span>
              <span>Meetings tend to run 20% longer than planned - add buffer time</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400">•</span>
              <span>You complete 95% of time blocks scheduled before 2pm</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
