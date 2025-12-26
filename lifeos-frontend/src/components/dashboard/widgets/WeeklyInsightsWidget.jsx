import React, { memo, useMemo } from 'react';
import { Sparkles, TrendingUp, BarChart3, CheckCircle2, Calendar } from 'lucide-react';

// Import stores for real data
import { useGamificationStore } from '../../../stores/gamificationStore';
import useDailyTasksStore from '../../../stores/dailyTasksStore';
import useProductivityStore from '../../../stores/productivityStore';
import { useCalendarStore } from '../../../stores/calendarStore';

// Helper to check if date is within last N days
const isWithinDays = (dateStr, days) => {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return date >= cutoff;
};

// Helper to format numbers with commas
const formatNumber = (num) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

const WeeklyInsightsWidget = memo(function WeeklyInsightsWidget() {
  // Connect to stores
  const { totalXP, level, moduleXP, recentEvents } = useGamificationStore();
  const { tasksByDate, getTodayStats } = useDailyTasksStore();
  const { tasks, sessions } = useProductivityStore();
  const { timeBlocks } = useCalendarStore();

  // Calculate real insights
  const insights = useMemo(() => {
    // Calculate weekly XP from recent events
    const weeklyXPEvents = (recentEvents || []).filter(e =>
      e.eventType === 'xp_gained' && isWithinDays(e.timestamp, 7)
    );
    const weeklyXP = weeklyXPEvents.reduce((sum, e) => sum + (e.eventData?.amount || 0), 0);

    // Calculate previous week XP for comparison
    // Only show percentage change if we have meaningful weekly data
    let xpChange = 0;
    if (weeklyXP > 0 && weeklyXPEvents.length > 0) {
      // Calculate average based on total XP / estimated weeks of usage
      const totalModuleXP = Object.values(moduleXP || {}).reduce((sum, xp) => sum + xp, 0);
      if (totalModuleXP > 0) {
        // Estimate weeks based on total XP (rough average of 500 XP/week for active users)
        const estimatedWeeks = Math.max(4, Math.ceil(totalModuleXP / 500));
        const avgWeeklyXP = Math.floor(totalModuleXP / estimatedWeeks);
        if (avgWeeklyXP > 0) {
          xpChange = Math.round(((weeklyXP - avgWeeklyXP) / avgWeeklyXP) * 100);
          // Cap extreme values
          xpChange = Math.max(-99, Math.min(999, xpChange));
        }
      }
    }

    // Calculate completion rate from daily tasks
    const today = new Date().toISOString().split('T')[0];
    const last7Days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      last7Days.push(d.toISOString().split('T')[0]);
    }

    let totalTasks = 0;
    let completedTasks = 0;
    last7Days.forEach(date => {
      const dayTasks = tasksByDate[date] || [];
      totalTasks += dayTasks.length;
      completedTasks += dayTasks.filter(t => t.completed).length;
    });

    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Calculate active days (days with any completed tasks or activities)
    const activeDays = last7Days.filter(date => {
      const dayTasks = tasksByDate[date] || [];
      return dayTasks.some(t => t.completed);
    }).length;

    // Calculate productivity sessions this week
    const sessionsThisWeek = (sessions || []).filter(s =>
      isWithinDays(s.startTime || s.endTime, 7)
    ).length;

    // Calculate average daily score (based on completion rate and productivity)
    const avgScore = Math.round((completionRate * 0.6) + (Math.min(sessionsThisWeek * 5, 40)));

    return [
      {
        label: 'Weekly XP',
        value: formatNumber(weeklyXP || totalXP || 0),
        change: xpChange > 0 ? `+${xpChange}%` : `${xpChange}%`,
        trend: xpChange >= 0 ? 'up' : 'down',
        icon: TrendingUp,
        color: 'text-green-400',
        bgColor: 'bg-green-500/10'
      },
      {
        label: 'Avg Daily Score',
        value: avgScore.toString(),
        change: avgScore > 50 ? '+' + Math.round((avgScore - 50) / 5) + ' pts' : '-',
        trend: avgScore > 50 ? 'up' : 'stable',
        icon: BarChart3,
        color: 'text-blue-400',
        bgColor: 'bg-blue-500/10'
      },
      {
        label: 'Completion Rate',
        value: `${completionRate}%`,
        change: completionRate > 70 ? 'Great!' : completionRate > 50 ? 'Good' : 'Keep going',
        trend: completionRate > 70 ? 'up' : 'stable',
        icon: CheckCircle2,
        color: 'text-purple-400',
        bgColor: 'bg-purple-500/10'
      },
      {
        label: 'Active Days',
        value: `${activeDays}/7`,
        change: `${Math.round((activeDays / 7) * 100)}%`,
        trend: activeDays >= 5 ? 'up' : 'stable',
        icon: Calendar,
        color: 'text-orange-400',
        bgColor: 'bg-orange-500/10'
      },
    ];
  }, [totalXP, moduleXP, recentEvents, tasksByDate, sessions]);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <h3 className="text-sm font-semibold text-text-muted mb-3 flex items-center gap-2 flex-shrink-0">
        <Sparkles className="w-4 h-4" />
        Weekly Insights
      </h3>
      <div className="flex-1 grid grid-cols-2 gap-2 overflow-y-auto min-h-0">
        {insights.map((insight) => {
          const Icon = insight.icon;
          return (
            <div key={insight.label} className={`${insight.bgColor} border border-border rounded-xl p-2 sm:p-3 min-w-0`}>
              <div className="flex items-start justify-between mb-1 sm:mb-1.5">
                <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${insight.color} flex-shrink-0`} />
                <span className={`text-[9px] sm:text-[10px] font-medium truncate ml-1 ${insight.trend === 'up' ? 'text-green-400' : 'text-text-muted'}`}>
                  {insight.change}
                </span>
              </div>
              <div className="text-base sm:text-xl font-bold text-text-primary mb-0.5 truncate">{insight.value}</div>
              <div className="text-[9px] sm:text-[10px] text-text-muted truncate">{insight.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

export default WeeklyInsightsWidget;
