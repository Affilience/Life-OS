import React, { useState, useMemo, useEffect } from 'react';
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
import useProductivityStore from '../../stores/productivityStore';
import { useFinancialStore } from '../../stores/financialStore';

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
export default function ProductivityDashboard({ onSwitchToProjects }) {
  const [showTaskModal, setShowTaskModal] = useState(false);

  // Get real data from productivity store
  const {
    sessions,
    tasks,
    projects,
    incomeTransactions,
    activeSession,
    sessionTimer,
    startSession,
    endSession,
    cancelSession,
    getTodayStats,
    getWeeklyStats,
  } = useProductivityStore();

  // Get monthly income from financial store for more complete picture
  const { transactions: financialTransactions } = useFinancialStore();

  // Calculate today's stats
  const todayStats = useMemo(() => getTodayStats(), [sessions, tasks]);
  const weeklyStats = useMemo(() => getWeeklyStats(), [sessions, incomeTransactions]);

  // Calculate weekly deep work data for chart
  const focusTimeData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const result = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const daySessions = sessions.filter(
        (s) => s.startTime && s.startTime.startsWith(dateStr) && s.type === 'deep-work'
      );
      const totalHours = daySessions.reduce((sum, s) => sum + (s.duration || 0), 0) / 3600;

      result.push({
        label: days[date.getDay()],
        value: parseFloat(totalHours.toFixed(1)),
      });
    }
    return result;
  }, [sessions]);

  // Calculate weekly tasks completed data for chart
  const tasksCompletedData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const result = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const dayTasks = tasks.filter(
        (t) => t.completedAt && t.completedAt.startsWith(dateStr)
      );

      result.push({
        label: days[date.getDay()],
        value: dayTasks.length,
      });
    }
    return result;
  }, [tasks]);

  // Calculate weekly trend (last 4 weeks productivity score)
  const weeklyTrend = useMemo(() => {
    const result = [];
    const today = new Date();

    for (let week = 3; week >= 0; week--) {
      const weekStart = new Date(today);
      weekStart.setDate(weekStart.getDate() - (week * 7 + 7));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);

      const weekSessions = sessions.filter((s) => {
        const sessionDate = new Date(s.startTime);
        return sessionDate >= weekStart && sessionDate < weekEnd;
      });

      const totalHours = weekSessions.reduce((sum, s) => sum + (s.duration || 0), 0) / 3600;
      result.push({
        label: `W${4 - week}`,
        value: Math.round(totalHours),
      });
    }
    return result;
  }, [sessions]);

  // Calculate total weekly deep work hours
  const weeklyDeepWorkHours = useMemo(() => {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return sessions
      .filter((s) => new Date(s.startTime) >= weekAgo && s.type === 'deep-work')
      .reduce((sum, s) => sum + (s.duration || 0), 0) / 3600;
  }, [sessions]);

  // Calculate monthly revenue
  const monthlyRevenue = useMemo(() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // From productivity income
    const prodIncome = incomeTransactions
      .filter((t) => new Date(t.date) >= monthStart)
      .reduce((sum, t) => sum + t.amount, 0);

    // From financial transactions (income type)
    const finIncome = financialTransactions
      .filter((t) => t.type === 'income' && new Date(t.date) >= monthStart)
      .reduce((sum, t) => sum + t.amount, 0);

    return prodIncome + finIncome;
  }, [incomeTransactions, financialTransactions]);

  // Active projects count
  const activeProjects = useMemo(() =>
    projects.filter((p) => p.status === 'active'),
    [projects]
  );

  // Tasks in progress
  const tasksInProgress = useMemo(() =>
    tasks.filter((t) => t.status === 'active').length,
    [tasks]
  );

  const handleStartDeepWork = () => {
    startSession(null, 'deep-work');
  };

  const handleStopDeepWork = () => {
    // End with default values - in a real app you'd show a modal to rate focus quality
    endSession(7, 'Deep work session', ['deep-work']);
  };

  const handleLogTask = () => {
    // Navigate to Projects tab for task logging
    if (onSwitchToProjects) {
      onSwitchToProjects();
    } else {
      setShowTaskModal(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#0c0a10] pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0c0a10]/95 backdrop-blur-md border-b border-white/5 px-6 py-4">
        <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
          <Zap className="w-6 h-6 text-yellow-400" />
          Productivity Dashboard
        </h1>
        <p className="text-sm text-text-muted mt-1">
          Deep work, tasks, projects & business metrics
        </p>
      </div>

      <div className="px-4 pt-6 pb-4 space-y-6">
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" data-tour="productivity-stats">
          <StatCard
            title="Deep Work Today"
            value={todayStats.totalTimeFormatted}
            subtitle={`${todayStats.sessionsCount} session${todayStats.sessionsCount !== 1 ? 's' : ''}`}
            trend={todayStats.totalTime > 0 ? "up" : "neutral"}
            trendValue={todayStats.avgFocusQuality > 0 ? `${todayStats.avgFocusQuality}/10 focus` : ''}
            icon={Brain}
            color="purple"
          />
          <StatCard
            title="Tasks Done"
            value={todayStats.tasksCompleted.toString()}
            subtitle={`${tasksInProgress} in progress`}
            trend={todayStats.tasksCompleted > 0 ? "up" : "neutral"}
            trendValue={todayStats.tasksCompleted > 0 ? `+${todayStats.tasksCompleted} today` : ''}
            icon={CheckCircle2}
            color="green"
          />
          <StatCard
            title="Focus Quality"
            value={weeklyStats.avgFocusQuality > 0 ? `${weeklyStats.avgFocusQuality}/10` : 'N/A'}
            subtitle="weekly average"
            trend={parseFloat(weeklyStats.avgFocusQuality) >= 7 ? "up" : parseFloat(weeklyStats.avgFocusQuality) >= 5 ? "neutral" : "down"}
            trendValue={weeklyStats.sessionsCount > 0 ? `${weeklyStats.sessionsCount} sessions` : ''}
            icon={Target}
            color="cyan"
          />
          <StatCard
            title="Revenue"
            value={`$${(monthlyRevenue / 1000).toFixed(1)}k`}
            subtitle="this month"
            trend={monthlyRevenue > 0 ? "up" : "neutral"}
            trendValue={monthlyRevenue > 0 ? 'on track' : 'no income yet'}
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
                <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                  <Clock className="w-5 h-5 text-purple-400" />
                  Deep Work Hours
                </h3>
                <p className="text-sm text-text-muted mt-1">
                  Uninterrupted focus time this week
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-purple-300">{weeklyDeepWorkHours.toFixed(1)}h</p>
                <p className="text-sm text-text-muted flex items-center gap-1 justify-end">
                  {weeklyStats.sessionsCount} sessions this week
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
                <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                  Tasks Completed
                </h3>
                <p className="text-sm text-text-muted mt-1">
                  Daily completion rate
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-300">{tasksCompletedData.reduce((sum, d) => sum + d.value, 0)}</p>
                <p className="text-sm text-text-muted">tasks this week</p>
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
                <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-cyan-400" />
                  Weekly Trend
                </h3>
                <p className="text-sm text-text-muted mt-1">
                  Productivity score over time
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-cyan-300">{weeklyTrend[weeklyTrend.length - 1]?.value || 0}h</p>
                <p className="text-sm text-text-muted flex items-center gap-1 justify-end">
                  this week
                </p>
              </div>
            </div>
            <div className="h-32">
              <MiniLineChart data={weeklyTrend} color="cyan" filled showDots height={120} />
            </div>
          </div>
        </div>

        {/* Work In Progress & Tasks */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-bg-1 border border-orange-500/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-orange-400" />
              <h4 className="text-sm font-semibold text-text-primary">Work In Progress</h4>
            </div>
            <p className="text-2xl font-bold text-text-primary">{activeProjects.length}</p>
            <p className="text-xs text-text-muted mt-1">active projects</p>
          </div>

          <div className="bg-bg-1 border border-yellow-500/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-yellow-400" />
              <h4 className="text-sm font-semibold text-text-primary">Tasks In Progress</h4>
            </div>
            <p className="text-2xl font-bold text-text-primary">{tasksInProgress}</p>
            <p className="text-xs text-text-muted mt-1">active tasks</p>
          </div>
        </div>

        {/* Active Projects */}
        <div className="bg-bg-1 border border-border rounded-2xl p-5">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Active Projects ({activeProjects.length})</h3>
          {activeProjects.length > 0 ? (
            <div className="space-y-3">
              {activeProjects.slice(0, 5).map((project) => {
                const dueDate = project.dueDate ? new Date(project.dueDate) : null;
                const daysUntilDue = dueDate ? Math.ceil((dueDate - new Date()) / (1000 * 60 * 60 * 24)) : null;
                const deadlineText = daysUntilDue !== null
                  ? daysUntilDue < 0 ? 'Overdue'
                  : daysUntilDue === 0 ? 'Due today'
                  : daysUntilDue === 1 ? '1 day left'
                  : `${daysUntilDue} days left`
                  : 'No deadline';

                return (
                  <div key={project.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-text-primary">{project.name}</span>
                      <span className={`text-xs ${daysUntilDue !== null && daysUntilDue < 3 ? 'text-red-400' : 'text-text-muted'}`}>
                        {deadlineText}
                      </span>
                    </div>
                    <div className="h-2 bg-[#0c0a10] rounded-full overflow-hidden">
                      <div
                        className="h-full transition-all duration-500"
                        style={{
                          width: `${project.progress || 0}%`,
                          backgroundColor: project.color || '#8b5cf6'
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-text-primary/50">{project.progress || 0}% complete</span>
                      <span className="text-text-muted">
                        {((project.totalTimeSpent || 0) / 3600).toFixed(1)}h logged
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-text-primary/50 text-sm text-center py-4">No active projects yet</p>
          )}
        </div>

        {/* Quick Actions - Enhanced with Functionality */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {!activeSession ? (
            <button
              onClick={handleStartDeepWork}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-text-primary p-4 rounded-xl font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-500/30 active:scale-95"
            >
              <Play className="w-5 h-5" />
              Start Deep Work
            </button>
          ) : (
            <button
              onClick={handleStopDeepWork}
              className="bg-gradient-to-r from-red-500 to-orange-500 text-text-primary p-4 rounded-xl font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-500/30 active:scale-95 animate-pulse"
            >
              <Square className="w-5 h-5" />
              Stop Session
            </button>
          )}
          <button
            onClick={handleLogTask}
            className="bg-bg-1 border border-border text-text-primary p-4 rounded-xl font-semibold hover:bg-bg-hover transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <Plus className="w-5 h-5" />
            Log Task
          </button>
        </div>

        {/* Deep Work Active Indicator */}
        {activeSession && (
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
                <h3 className="text-text-primary font-semibold">Deep Work In Progress</h3>
                <p className="text-sm text-text-muted">Stay focused and avoid distractions</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-purple-300">
                {Math.floor(sessionTimer / 60)}:{String(sessionTimer % 60).padStart(2, '0')}
              </p>
              <p className="text-xs text-text-muted">minutes elapsed</p>
            </div>
          </div>
        )}

        {/* Task Modal Placeholder */}
        {showTaskModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-bg-1 border border-border rounded-2xl p-6 max-w-md w-full">
              <h3 className="text-xl font-bold text-text-primary mb-4">Log Task</h3>
              <p className="text-text-muted mb-4">Task logging interface coming soon...</p>
              <button
                onClick={() => setShowTaskModal(false)}
                className="w-full bg-purple-500 text-text-primary py-3 rounded-xl font-semibold hover:bg-purple-600 transition-colors"
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
