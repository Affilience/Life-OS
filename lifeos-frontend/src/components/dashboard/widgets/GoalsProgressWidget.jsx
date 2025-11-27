import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Target,
  ChevronRight,
  Trophy,
  Flame,
  Star,
} from 'lucide-react';

// Mock goals data - in production this would come from a missions store
const MOCK_GOALS = [
  {
    id: 1,
    title: 'Read 24 Books',
    category: 'Learning',
    current: 18,
    target: 24,
    color: 'from-yellow-500 to-orange-500',
    icon: '📚',
  },
  {
    id: 2,
    title: 'Run 500km',
    category: 'Fitness',
    current: 342,
    target: 500,
    color: 'from-green-500 to-emerald-500',
    icon: '🏃',
  },
  {
    id: 3,
    title: 'Save $10,000',
    category: 'Finance',
    current: 7500,
    target: 10000,
    color: 'from-blue-500 to-cyan-500',
    icon: '💰',
  },
  {
    id: 4,
    title: '30 Day Streak',
    category: 'Habits',
    current: 12,
    target: 30,
    color: 'from-purple-500 to-pink-500',
    icon: '🔥',
  },
];

export default function GoalsProgressWidget() {
  const navigate = useNavigate();

  const completedGoals = MOCK_GOALS.filter(g => g.current >= g.target).length;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <h3 className="text-sm font-semibold text-white/60 flex items-center gap-2">
          <Target className="w-4 h-4" />
          Goals Progress
        </h3>
        <button
          onClick={() => navigate('/missions')}
          className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1"
        >
          {completedGoals}/{MOCK_GOALS.length}
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      {/* Goals List */}
      <div className="flex-1 bg-[#1a1724] border border-white/10 rounded-xl p-3 overflow-y-auto">
        <div className="space-y-3">
          {MOCK_GOALS.map((goal) => {
            const progress = Math.min((goal.current / goal.target) * 100, 100);
            const isCompleted = goal.current >= goal.target;

            return (
              <div key={goal.id} className="group">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{goal.icon}</span>
                    <div>
                      <p className="text-xs text-white font-medium truncate max-w-[140px]">
                        {goal.title}
                      </p>
                      <p className="text-[10px] text-white/40">{goal.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {isCompleted ? (
                      <Trophy className="w-4 h-4 text-yellow-400" />
                    ) : (
                      <span className="text-xs text-white/60">
                        {goal.current}/{goal.target}
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${goal.color} transition-all duration-500`}
                    style={{ width: `${progress}%` }}
                  />
                </div>

                {/* Progress Percentage */}
                <div className="flex justify-between mt-1">
                  <span className="text-[10px] text-white/40">
                    {Math.round(progress)}% complete
                  </span>
                  {!isCompleted && goal.target - goal.current > 0 && (
                    <span className="text-[10px] text-white/40">
                      {goal.target - goal.current} to go
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Motivation */}
        {completedGoals > 0 && (
          <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-center gap-2">
            <Star className="w-3.5 h-3.5 text-yellow-400" />
            <span className="text-[10px] text-white/60">
              {completedGoals} goal{completedGoals !== 1 ? 's' : ''} achieved!
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
