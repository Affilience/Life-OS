import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  CheckCircle2,
  Dumbbell,
  BookOpen,
  PenLine,
  Wallet,
  Target,
  ChevronRight,
  Clock,
  Calendar,
  Brain,
} from 'lucide-react';

// Import stores for real data
import useDailyTasksStore from '../../../stores/dailyTasksStore';
import { useWorkoutStore } from '../../../stores/workoutStore';
import { useKnowledgeStore } from '../../../stores/knowledgeStore';
import { useFinancialStore } from '../../../stores/financialStore';
import useProductivityStore from '../../../stores/productivityStore';

// Activity type configuration
const ACTIVITY_CONFIG = {
  task: { icon: CheckCircle2, color: 'text-green-400', xp: 20 },
  workout: { icon: Dumbbell, color: 'text-blue-400', xp: 50 },
  journal: { icon: PenLine, color: 'text-purple-400', xp: 30 },
  note: { icon: BookOpen, color: 'text-yellow-400', xp: 15 },
  expense: { icon: Wallet, color: 'text-emerald-400', xp: 10 },
  session: { icon: Brain, color: 'text-cyan-400', xp: 25 },
  timeblock: { icon: Calendar, color: 'text-indigo-400', xp: 15 },
};

function formatTimeAgo(date) {
  if (!date) return 'Recently';
  const d = typeof date === 'string' ? new Date(date) : date;
  const seconds = Math.floor((new Date() - d) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return d.toLocaleDateString();
}

export default function RecentActivityWidget() {
  const navigate = useNavigate();

  // Connect to stores
  const { tasksByDate } = useDailyTasksStore();
  const { workouts } = useWorkoutStore();
  const { notes, ideas } = useKnowledgeStore();
  const { transactions } = useFinancialStore();
  const { sessions: productivitySessions } = useProductivityStore();

  // Build real activities from store data
  const activities = useMemo(() => {
    const allActivities = [];

    // Get completed tasks from today and yesterday
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    [today, yesterday].forEach(date => {
      (tasksByDate[date] || []).filter(t => t.completed).forEach(task => {
        allActivities.push({
          id: `task-${task.id}`,
          type: 'task',
          title: task.title || 'Completed task',
          timestamp: task.completedAt || task.createdAt,
        });
      });
    });

    // Recent workouts (last 7 days)
    (workouts || []).slice(0, 5).forEach(workout => {
      allActivities.push({
        id: `workout-${workout.id}`,
        type: 'workout',
        title: workout.name || workout.title || 'Workout session',
        timestamp: workout.date || workout.completedAt,
      });
    });

    // Recent notes
    (notes || []).slice(0, 5).forEach(note => {
      allActivities.push({
        id: `note-${note.id}`,
        type: 'note',
        title: note.title || 'New note',
        timestamp: note.createdAt || note.dateCreated,
      });
    });

    // Recent transactions
    (transactions || []).slice(0, 5).forEach(txn => {
      allActivities.push({
        id: `expense-${txn.id}`,
        type: 'expense',
        title: `${txn.type === 'income' ? 'Income' : 'Expense'}: ${txn.category || txn.description || 'Transaction'}`,
        timestamp: txn.date,
      });
    });

    // Recent productivity sessions
    (productivitySessions || []).slice(0, 3).forEach(session => {
      allActivities.push({
        id: `session-${session.id}`,
        type: 'session',
        title: session.type || 'Work session',
        timestamp: session.endTime || session.startTime,
      });
    });

    // Sort by timestamp (most recent first) and take top 5
    return allActivities
      .filter(a => a.timestamp) // Only activities with timestamps
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 5)
      .map(activity => ({
        ...activity,
        ...ACTIVITY_CONFIG[activity.type],
      }));
  }, [tasksByDate, workouts, notes, transactions, productivitySessions]);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <h3 className="text-sm font-semibold text-white/60 flex items-center gap-2">
          <Activity className="w-4 h-4" />
          Recent Activity
        </h3>
        <button
          onClick={() => navigate('/progress')}
          className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1"
        >
          View All
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      {/* Activity List */}
      <div className="flex-1 bg-[#1a1724] border border-white/10 rounded-xl p-3 overflow-y-auto">
        {activities.length > 0 ? (
          <div className="space-y-3">
            {activities.map((activity, index) => {
              const Icon = activity.icon;
              return (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 group"
                >
                  {/* Timeline */}
                  <div className="flex flex-col items-center">
                    <div className={`p-1.5 rounded-lg bg-white/5 ${activity.color}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    {index < activities.length - 1 && (
                      <div className="w-px h-full min-h-[20px] bg-white/10 mt-1" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pb-2">
                    <p className="text-xs text-white truncate">{activity.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-white/40 flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        {formatTimeAgo(activity.timestamp)}
                      </span>
                      {activity.xp > 0 && (
                        <span className="text-[10px] text-yellow-400">+{activity.xp} XP</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center py-4">
            <Activity className="w-8 h-8 text-white/20 mb-2" />
            <p className="text-xs text-white/40">No recent activity</p>
            <p className="text-[10px] text-white/30 mt-1">Complete tasks to see your progress</p>
          </div>
        )}
      </div>
    </div>
  );
}
