import React from 'react';
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
} from 'lucide-react';

// Mock recent activity data - in production this would come from a store
const MOCK_ACTIVITIES = [
  {
    id: 1,
    type: 'task',
    title: 'Completed morning routine',
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 min ago
    icon: CheckCircle2,
    color: 'text-green-400',
    xp: 50,
  },
  {
    id: 2,
    type: 'workout',
    title: 'Upper body workout',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    icon: Dumbbell,
    color: 'text-blue-400',
    xp: 100,
  },
  {
    id: 3,
    type: 'journal',
    title: 'Morning reflection',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
    icon: PenLine,
    color: 'text-purple-400',
    xp: 30,
  },
  {
    id: 4,
    type: 'learning',
    title: 'Read "Atomic Habits"',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    icon: BookOpen,
    color: 'text-yellow-400',
    xp: 75,
  },
  {
    id: 5,
    type: 'expense',
    title: 'Logged grocery expense',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 26), // 1 day ago
    icon: Wallet,
    color: 'text-emerald-400',
    xp: 10,
  },
];

function formatTimeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
}

export default function RecentActivityWidget() {
  const navigate = useNavigate();

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
        <div className="space-y-3">
          {MOCK_ACTIVITIES.map((activity, index) => {
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
                  {index < MOCK_ACTIVITIES.length - 1 && (
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
      </div>
    </div>
  );
}
