/**
 * StreakVisualisations - Multiple ways to visualize streak data
 *
 * Views:
 * 1. Calendar Grid - Monthly calendar with completion dots
 * 2. Chain Links - Visual chain that breaks on missed days
 * 3. Circle Progress - Radial progress rings
 * 4. Heatmap - GitHub-style year heatmap
 * 5. Stats Overview - Numbers and milestones
 */

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  Link2,
  Circle,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Trophy,
  Target,
  TrendingUp,
  Check,
  X,
} from 'lucide-react';
import { useGamificationModeStore } from '../../stores/gamificationModeStore';
import { CosmicFlame } from '../../features/streaks/components/CosmicFlame';

// Mode-specific styling
const MODE_STYLES = {
  cosmic: {
    accentColor: 'purple',
    activeGradient: 'from-purple-500 to-pink-500',
    activeBg: 'bg-purple-500/20',
    borderColor: 'border-purple-500/30',
  },
  minimal: {
    accentColor: 'emerald',
    activeGradient: 'from-emerald-500 to-teal-500',
    activeBg: 'bg-emerald-500/20',
    borderColor: 'border-emerald-500/30',
  },
};

// Utility to get color classes based on streak color
const getColorClasses = (colorId) => {
  const colorMap = {
    purple: { bg: 'bg-purple-500', bgLight: 'bg-purple-500/20', text: 'text-purple-400', gradient: 'from-purple-500 to-pink-500' },
    blue: { bg: 'bg-blue-500', bgLight: 'bg-blue-500/20', text: 'text-blue-400', gradient: 'from-blue-500 to-cyan-500' },
    green: { bg: 'bg-green-500', bgLight: 'bg-green-500/20', text: 'text-green-400', gradient: 'from-green-500 to-emerald-500' },
    orange: { bg: 'bg-orange-500', bgLight: 'bg-orange-500/20', text: 'text-orange-400', gradient: 'from-orange-500 to-amber-500' },
    red: { bg: 'bg-red-500', bgLight: 'bg-red-500/20', text: 'text-red-400', gradient: 'from-red-500 to-rose-500' },
    teal: { bg: 'bg-teal-500', bgLight: 'bg-teal-500/20', text: 'text-teal-400', gradient: 'from-teal-500 to-cyan-500' },
    pink: { bg: 'bg-pink-500', bgLight: 'bg-pink-500/20', text: 'text-pink-400', gradient: 'from-pink-500 to-rose-500' },
    indigo: { bg: 'bg-indigo-500', bgLight: 'bg-indigo-500/20', text: 'text-indigo-400', gradient: 'from-indigo-500 to-purple-500' },
  };
  return colorMap[colorId] || colorMap.purple;
};

/**
 * CalendarGridView - Monthly calendar showing completion status
 */
export function CalendarGridView({ completions, streak, month = new Date() }) {
  const mode = useGamificationModeStore((state) => state.mode);
  const colorClasses = getColorClasses(streak?.color || 'purple');

  const [currentMonth, setCurrentMonth] = React.useState(month);

  // Generate calendar data
  const calendarData = useMemo(() => {
    const year = currentMonth.getFullYear();
    const monthNum = currentMonth.getMonth();
    const firstDay = new Date(year, monthNum, 1);
    const lastDay = new Date(year, monthNum + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();

    // Create completion set for quick lookup
    const completionSet = new Set(
      completions?.map(c => c.completed_date || c.date) || []
    );

    const days = [];

    // Add empty cells for days before the first
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push({ day: null, completed: false });
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(monthNum + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      days.push({
        day,
        date: dateStr,
        completed: completionSet.has(dateStr),
        isToday: new Date().toISOString().split('T')[0] === dateStr,
        isFuture: new Date(dateStr) > new Date(),
      });
    }

    return days;
  }, [currentMonth, completions]);

  const monthName = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const completedCount = calendarData.filter(d => d.completed).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={prevMonth}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-white/60" />
        </button>
        <div className="text-center">
          <div className="text-white font-semibold">{monthName}</div>
          <div className="text-xs text-white/50">{completedCount} days completed</div>
        </div>
        <button
          onClick={nextMonth}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-white/60" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
          <div key={i} className="text-xs text-white/40 py-1">{day}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarData.map((day, i) => (
          <div
            key={i}
            className={`
              aspect-square flex items-center justify-center rounded-lg text-sm
              transition-all
              ${!day.day ? 'opacity-0' : ''}
              ${day.completed
                ? `${colorClasses.bgLight} ${colorClasses.text} font-medium`
                : day.isFuture
                  ? 'text-white/20'
                  : 'text-white/50 hover:bg-white/5'
              }
              ${day.isToday ? 'ring-2 ring-white/30' : ''}
            `}
          >
            {day.day && (
              <span>{day.day}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * ChainLinksView - Visual chain that shows streak continuity
 */
export function ChainLinksView({ completions, streak, daysToShow = 30 }) {
  const colorClasses = getColorClasses(streak?.color || 'purple');

  // Generate chain data for last N days
  const chainData = useMemo(() => {
    const completionSet = new Set(
      completions?.map(c => c.completed_date || c.date) || []
    );

    const days = [];
    const today = new Date();

    for (let i = daysToShow - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      days.push({
        date: dateStr,
        completed: completionSet.has(dateStr),
        isToday: i === 0,
        dayLabel: date.toLocaleDateString('en', { weekday: 'short' }).charAt(0),
        dayNum: date.getDate(),
      });
    }

    return days;
  }, [completions, daysToShow]);

  // Find longest current chain
  let currentChain = 0;
  for (let i = chainData.length - 1; i >= 0; i--) {
    if (chainData[i].completed) {
      currentChain++;
    } else {
      break;
    }
  }

  return (
    <div className="space-y-4">
      {/* Chain visualisation */}
      <div className="flex flex-wrap items-center gap-1">
        {chainData.map((day, i) => {
          const prevCompleted = i > 0 && chainData[i - 1].completed;
          const nextCompleted = i < chainData.length - 1 && chainData[i + 1].completed;

          return (
            <div key={i} className="flex items-center">
              {/* Link connector */}
              {i > 0 && day.completed && prevCompleted && (
                <div className={`w-2 h-1 ${colorClasses.bg} -mr-0.5`} />
              )}

              {/* Chain link */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.02 }}
                className={`
                  relative w-8 h-8 rounded-full flex items-center justify-center
                  transition-all group cursor-default
                  ${day.completed
                    ? `${colorClasses.bg} text-white shadow-lg`
                    : 'bg-white/10 text-white/30'
                  }
                  ${day.isToday ? 'ring-2 ring-white/50' : ''}
                `}
                title={`${day.date} - ${day.completed ? 'Completed' : 'Missed'}`}
              >
                {day.completed ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <X className="w-3 h-3" />
                )}

                {/* Tooltip */}
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <div className="bg-black/90 rounded px-2 py-1 text-xs whitespace-nowrap">
                    {day.dayLabel} {day.dayNum}
                  </div>
                </div>
              </motion.div>

              {/* Link connector */}
              {i < chainData.length - 1 && day.completed && nextCompleted && (
                <div className={`w-2 h-1 ${colorClasses.bg} -ml-0.5`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Chain stats */}
      <div className="flex items-center justify-between text-sm">
        <div className="text-white/60">
          {currentChain > 0 ? (
            <>
              <span className={colorClasses.text}>{currentChain}</span> day chain
            </>
          ) : (
            'Start your chain!'
          )}
        </div>
        <div className="text-white/40">
          {chainData.filter(d => d.completed).length}/{daysToShow} days
        </div>
      </div>
    </div>
  );
}

/**
 * CircleProgressView - Radial progress indicators
 */
export function CircleProgressView({ streak, completions, goal = 30 }) {
  const colorClasses = getColorClasses(streak?.color || 'purple');

  const currentStreak = streak?.current_streak || 0;
  const longestStreak = streak?.longest_streak || 0;
  const totalCompletions = completions?.length || 0;

  // Calculate this week's progress
  const thisWeekCompletions = useMemo(() => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    return completions?.filter(c => {
      const date = new Date(c.completed_date || c.date);
      return date >= startOfWeek;
    }).length || 0;
  }, [completions]);

  // Calculate this month's progress
  const thisMonthCompletions = useMemo(() => {
    const today = new Date();
    const monthStart = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`;

    return completions?.filter(c => {
      const date = c.completed_date || c.date;
      return date >= monthStart;
    }).length || 0;
  }, [completions]);

  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();

  const circles = [
    { label: 'Current', value: currentStreak, max: goal, icon: 'flame', isFlame: true },
    { label: 'This Week', value: thisWeekCompletions, max: 7, icon: Calendar },
    { label: 'This Month', value: thisMonthCompletions, max: daysInMonth, icon: TrendingUp },
  ];

  return (
    <div className="flex justify-around items-center py-4">
      {circles.map((circle, i) => {
        const percentage = Math.min((circle.value / circle.max) * 100, 100);
        const circumference = 2 * Math.PI * 40;
        const strokeDashoffset = circumference - (percentage / 100) * circumference;
        const Icon = circle.icon;

        return (
          <div key={i} className="flex flex-col items-center gap-2">
            <div className="relative w-24 h-24">
              {/* Background circle */}
              <svg className="w-full h-full -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  fill="none"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="6"
                />
                {/* Progress circle */}
                <motion.circle
                  cx="48"
                  cy="48"
                  r="40"
                  fill="none"
                  className={colorClasses.text}
                  stroke="currentColor"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
              </svg>

              {/* Center content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-bold text-white">{circle.value}</span>
                <span className="text-xs text-white/40">/{circle.max}</span>
              </div>
            </div>

            <div className="flex items-center gap-1 text-xs text-white/60">
              {circle.isFlame ? (
                <CosmicFlame streak={circle.value} size="sm" animate={false} />
              ) : (
                <Icon className="w-3 h-3" />
              )}
              {circle.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * MiniHeatmapView - Compact heatmap for single streak
 */
export function MiniHeatmapView({ completions, weeks = 12 }) {
  const mode = useGamificationModeStore((state) => state.mode);

  // Generate heatmap data
  const heatmapData = useMemo(() => {
    const completionSet = new Set(
      completions?.map(c => c.completed_date || c.date) || []
    );

    const days = [];
    const today = new Date();
    const totalDays = weeks * 7;

    for (let i = totalDays - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      days.push({
        date: dateStr,
        completed: completionSet.has(dateStr),
        dayOfWeek: date.getDay(),
      });
    }

    // Organize into weeks
    const weekData = [];
    for (let i = 0; i < days.length; i += 7) {
      weekData.push(days.slice(i, i + 7));
    }

    return weekData;
  }, [completions, weeks]);

  const getIntensityClass = (completed) => {
    if (!completed) return 'bg-white/5';
    if (mode === 'cosmic') return 'bg-purple-500';
    return 'bg-emerald-500';
  };

  return (
    <div className="space-y-2">
      {/* Heatmap grid */}
      <div className="flex gap-0.5">
        {heatmapData.map((week, weekIdx) => (
          <div key={weekIdx} className="flex flex-col gap-0.5">
            {week.map((day, dayIdx) => (
              <div
                key={dayIdx}
                className={`w-2.5 h-2.5 rounded-sm ${getIntensityClass(day.completed)}`}
                title={`${day.date} - ${day.completed ? 'Completed' : 'Missed'}`}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between text-xs text-white/40">
        <span>{weeks * 7 - heatmapData.flat().filter(d => d.completed).length} missed</span>
        <span>{heatmapData.flat().filter(d => d.completed).length} completed</span>
      </div>
    </div>
  );
}

/**
 * StatsOverviewView - Key metrics and milestones
 */
export function StatsOverviewView({ streak, completions }) {
  const colorClasses = getColorClasses(streak?.color || 'purple');

  const milestones = [
    { days: 7, label: '1 Week', icon: '7' },
    { days: 14, label: '2 Weeks', icon: '14' },
    { days: 30, label: '1 Month', icon: '30' },
    { days: 60, label: '2 Months', icon: '60' },
    { days: 100, label: '100 Days', icon: '100' },
    { days: 365, label: '1 Year', icon: '365' },
  ];

  const currentStreak = streak?.current_streak || 0;
  const longestStreak = streak?.longest_streak || 0;
  const totalCompletions = streak?.total_completions || completions?.length || 0;

  // Calculate completion rate (last 30 days)
  const last30Days = useMemo(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

    return completions?.filter(c => {
      const date = c.completed_date || c.date;
      return date >= thirtyDaysAgoStr;
    }).length || 0;
  }, [completions]);

  const completionRate = Math.round((last30Days / 30) * 100);

  return (
    <div className="space-y-4">
      {/* Key stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className={`${colorClasses.bgLight} rounded-xl p-4 text-center`}>
          <div className="flex justify-center mb-1">
            <CosmicFlame streak={currentStreak} size="sm" />
          </div>
          <div className="text-2xl font-bold text-white">{currentStreak}</div>
          <div className="text-xs text-white/50">Current Streak</div>
        </div>
        <div className="bg-yellow-500/10 rounded-xl p-4 text-center">
          <Trophy className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
          <div className="text-2xl font-bold text-white">{longestStreak}</div>
          <div className="text-xs text-white/50">Best Streak</div>
        </div>
        <div className="bg-green-500/10 rounded-xl p-4 text-center">
          <Target className="w-5 h-5 text-green-400 mx-auto mb-1" />
          <div className="text-2xl font-bold text-white">{completionRate}%</div>
          <div className="text-xs text-white/50">Last 30 Days</div>
        </div>
        <div className="bg-blue-500/10 rounded-xl p-4 text-center">
          <BarChart3 className="w-5 h-5 text-blue-400 mx-auto mb-1" />
          <div className="text-2xl font-bold text-white">{totalCompletions}</div>
          <div className="text-xs text-white/50">Total Days</div>
        </div>
      </div>

      {/* Milestones */}
      <div>
        <div className="text-sm font-medium text-white/70 mb-2">Milestones</div>
        <div className="flex flex-wrap gap-2">
          {milestones.map((milestone, i) => {
            const achieved = longestStreak >= milestone.days;
            return (
              <div
                key={i}
                className={`
                  px-3 py-1.5 rounded-full text-xs font-medium
                  ${achieved
                    ? `${colorClasses.bgLight} ${colorClasses.text}`
                    : 'bg-white/5 text-white/30'
                  }
                `}
              >
                {milestone.label}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/**
 * StreakViewSelector - Toggle between different visualisation views
 */
export function StreakViewSelector({ currentView, onViewChange }) {
  const views = [
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'chain', label: 'Chain', icon: Link2 },
    { id: 'circles', label: 'Progress', icon: Circle },
    { id: 'heatmap', label: 'Heatmap', icon: BarChart3 },
    { id: 'stats', label: 'Stats', icon: TrendingUp },
  ];

  return (
    <div className="flex gap-1 p-1 bg-white/5 rounded-lg">
      {views.map((view) => {
        const Icon = view.icon;
        const isActive = currentView === view.id;

        return (
          <button
            key={view.id}
            onClick={() => onViewChange(view.id)}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm
              transition-all
              ${isActive
                ? 'bg-white/10 text-white'
                : 'text-white/50 hover:text-white/70'
              }
            `}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{view.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export default {
  CalendarGridView,
  ChainLinksView,
  CircleProgressView,
  MiniHeatmapView,
  StatsOverviewView,
  StreakViewSelector,
};
