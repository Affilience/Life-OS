import React, { useMemo } from 'react';
import { Calendar, Clock, Zap, TrendingUp, Sun, Moon, Brain } from 'lucide-react';
import MiniBarChart from '../shared/charts/MiniBarChart';
import MiniLineChart from '../shared/charts/MiniLineChart';
import StatCard from '../shared/charts/StatCard';
import { useCalendarStore } from '../../stores/calendarStore';

export default function CalendarDashboard() {
  // Connect to store
  const { timeBlocks } = useCalendarStore();

  // Calculate real stats from store data
  const stats = useMemo(() => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Get last 7 days
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      last7Days.push(d.toISOString().split('T')[0]);
    }

    // Calculate time blocked per day
    const timeBlockedData = last7Days.map(date => {
      const dayBlocks = (timeBlocks || []).filter(b => b.date === date);
      const totalHours = dayBlocks.reduce((sum, b) => {
        const duration = b.duration || 60;
        return sum + (duration / 60);
      }, 0);
      const dayOfWeek = new Date(date).getDay();
      return { label: dayLabels[dayOfWeek], value: Math.round(totalHours * 10) / 10 };
    });

    // Calculate total weekly hours
    const totalWeeklyHours = timeBlockedData.reduce((sum, d) => sum + d.value, 0);
    const avgHoursPerDay = totalWeeklyHours / 7;

    // Calculate efficiency (completed vs total blocks)
    const weekBlocks = (timeBlocks || []).filter(b => last7Days.includes(b.date));
    const completedBlocks = weekBlocks.filter(b => b.status === 'completed');
    const efficiency = weekBlocks.length > 0
      ? Math.round((completedBlocks.length / weekBlocks.length) * 100)
      : 0;

    // Calculate deep work hours
    const deepWorkBlocks = weekBlocks.filter(b =>
      b.type === 'focus' || b.category === 'deep_work' || b.title?.toLowerCase().includes('deep work')
    );
    const deepWorkHours = deepWorkBlocks.reduce((sum, b) => sum + ((b.duration || 60) / 60), 0);

    // Build planned vs actual
    const categories = ['focus', 'meeting', 'learning', 'health'];
    const categoryLabels = { focus: 'Deep Work', meeting: 'Meetings', learning: 'Learning', health: 'Exercise' };
    const plannedVsActual = categories.map(cat => {
      const catBlocks = weekBlocks.filter(b => b.type === cat || b.category === cat);
      const plannedHours = catBlocks.reduce((sum, b) => sum + ((b.duration || 60) / 60), 0);
      const actualHours = catBlocks.filter(b => b.status === 'completed')
        .reduce((sum, b) => sum + ((b.duration || 60) / 60), 0);
      return {
        category: categoryLabels[cat] || cat,
        planned: Math.round(plannedHours),
        actual: Math.round(actualHours)
      };
    }).filter(item => item.planned > 0 || item.actual > 0);

    // Today's blocks
    const todayBlocks = (timeBlocks || []).filter(b => b.date === todayStr)
      .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''))
      .map(b => ({
        time: `${b.startTime || '00:00'} - ${b.endTime || '01:00'}`,
        activity: b.title || 'Time Block',
        type: b.type || b.category || 'focus',
        energy: b.energy || 'medium'
      }));

    // Energy levels (calculated from time block completion rates by time slot)
    const energyLevels = [
      { hour: 6, label: '6am' },
      { hour: 9, label: '9am' },
      { hour: 12, label: '12pm' },
      { hour: 15, label: '3pm' },
      { hour: 18, label: '6pm' },
      { hour: 21, label: '9pm' },
    ];

    const energyLevelsData = energyLevels.map(({ hour, label }) => {
      // Find blocks that start around this hour
      const hourBlocks = weekBlocks.filter(b => {
        const startHour = parseInt((b.startTime || '00:00').split(':')[0]);
        return startHour >= hour && startHour < hour + 3;
      });

      // Calculate completion rate as energy proxy
      if (hourBlocks.length === 0) {
        return { label, value: hour >= 9 && hour <= 15 ? 5 : 3 }; // Default curve
      }

      const completed = hourBlocks.filter(b => b.status === 'completed').length;
      const completionRate = completed / hourBlocks.length;
      // Scale to 1-10, with higher completion = higher energy
      const energyValue = Math.round(completionRate * 7 + 3);

      return { label, value: Math.min(10, Math.max(1, energyValue)) };
    });

    // Find peak energy time
    const peakEnergy = energyLevelsData.reduce((peak, current) =>
      current.value > peak.value ? current : peak
    , energyLevelsData[0]);
    const peakTime = peakEnergy.label;

    // Calculate morning vs afternoon completion rate for insights
    const morningBlocks = weekBlocks.filter(b => {
      const hour = parseInt((b.startTime || '00:00').split(':')[0]);
      return hour >= 6 && hour < 14;
    });
    const afternoonBlocks = weekBlocks.filter(b => {
      const hour = parseInt((b.startTime || '00:00').split(':')[0]);
      return hour >= 14;
    });
    const morningCompletionRate = morningBlocks.length > 0
      ? Math.round((morningBlocks.filter(b => b.status === 'completed').length / morningBlocks.length) * 100)
      : 0;
    const afternoonCompletionRate = afternoonBlocks.length > 0
      ? Math.round((afternoonBlocks.filter(b => b.status === 'completed').length / afternoonBlocks.length) * 100)
      : 0;

    return {
      timeBlockedData,
      totalWeeklyHours: Math.round(totalWeeklyHours),
      avgHoursPerDay: Math.round(avgHoursPerDay * 10) / 10,
      efficiency,
      deepWorkHours: Math.round(deepWorkHours),
      plannedVsActual: plannedVsActual.length > 0 ? plannedVsActual : [
        { category: 'Deep Work', planned: 0, actual: 0 },
        { category: 'Meetings', planned: 0, actual: 0 },
        { category: 'Learning', planned: 0, actual: 0 },
        { category: 'Exercise', planned: 0, actual: 0 },
      ],
      upcomingBlocks: todayBlocks.length > 0 ? todayBlocks : [
        { time: '09:00 - 11:00', activity: 'No blocks scheduled', type: 'focus', energy: 'medium' }
      ],
      energyLevelsData,
      peakTime,
      morningCompletionRate,
      afternoonCompletionRate
    };
  }, [timeBlocks]);

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

      <div className="px-4 pt-6 pb-4 space-y-6">
        {/* Top Stats - 2x2 Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <StatCard
            title="This Week"
            value={`${stats.totalWeeklyHours}h`}
            subtitle="time blocked"
            trend={stats.totalWeeklyHours > 30 ? "up" : "neutral"}
            trendValue={stats.avgHoursPerDay > 0 ? `${stats.avgHoursPerDay}h/day` : ""}
            icon={Clock}
            color="indigo"
          />
          <StatCard
            title="Efficiency"
            value={`${stats.efficiency}%`}
            subtitle="planned vs actual"
            trend={stats.efficiency > 70 ? "up" : "neutral"}
            trendValue={stats.efficiency > 0 ? "completion" : ""}
            icon={Zap}
            color="purple"
          />
          <StatCard
            title="Deep Work"
            value={`${stats.deepWorkHours}h`}
            subtitle="this week"
            trend={stats.deepWorkHours > 15 ? "up" : "neutral"}
            trendValue=""
            icon={Brain}
            color="blue"
          />
          <StatCard
            title="Peak Energy"
            value={stats.peakTime || '12pm'}
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
              <div className="text-2xl font-bold text-white">{stats.avgHoursPerDay}h</div>
              <div className="text-xs text-white/60">avg/day</div>
            </div>
          </div>
          <div className="h-32">
            <MiniBarChart data={stats.timeBlockedData} color="indigo" showValues maxHeight={120} />
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
              <span className="text-xs text-white/60">Peak: {stats.peakTime || '12pm'}</span>
            </div>
          </div>
          <div className="h-32">
            <MiniLineChart data={stats.energyLevelsData} color="purple" filled={true} showDots={true} />
          </div>
        </div>

        {/* Planned vs Actual (This Week) */}
        <div className="bg-[#1a1724] border border-white/10 rounded-2xl p-5">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-400" />
            Planned vs Actual (This Week)
          </h3>
          <div className="space-y-4">
            {stats.plannedVsActual.map((item, index) => {
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
        <div className="bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border border-indigo-500/20 rounded-2xl p-5" data-tour="time-blocks">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-400" />
            Today's Time Blocks
          </h3>
          <div className="space-y-3">
            {stats.upcomingBlocks.map((block, index) => (
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
              <span className={stats.morningCompletionRate >= 70 ? "text-green-400" : "text-yellow-400"}>•</span>
              <span>
                Morning blocks (before 2pm): {stats.morningCompletionRate}% completion rate
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className={stats.afternoonCompletionRate >= 70 ? "text-green-400" : "text-yellow-400"}>•</span>
              <span>
                Afternoon blocks: {stats.afternoonCompletionRate}% completion rate
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400">•</span>
              <span>
                Peak focus time is around {stats.peakTime || '12pm'} based on your completion patterns
              </span>
            </li>
            {stats.efficiency > 0 && (
              <li className="flex items-start gap-2">
                <span className={stats.efficiency >= 70 ? "text-green-400" : "text-orange-400"}>•</span>
                <span>
                  Overall week efficiency: {stats.efficiency}% of planned blocks completed
                </span>
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
