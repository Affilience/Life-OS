import React, { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ChevronRight, Circle, Clock, Moon, Plus } from 'lucide-react';
import useDailyTasksStore, { TASK_CATEGORIES, PRIORITY_LEVELS } from '../../../stores/dailyTasksStore';

function TodaysPlanWidget() {
  const navigate = useNavigate();
  const { getTodayTasks, getTodayStats, toggleTask } = useDailyTasksStore();

  const todaysTasks = getTodayTasks();
  const todayStats = getTodayStats();
  const completedTasks = todayStats.completed;
  const totalTasks = todayStats.total;
  const taskCompletionPercentage = todayStats.percentage;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <h3 className="text-sm font-semibold text-white/60 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          Today's Plan
        </h3>
        <button
          onClick={() => navigate('/quests')}
          className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1"
        >
          {totalTasks > 0 ? `${completedTasks}/${totalTasks}` : 'Plan Day'}
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      {totalTasks > 0 ? (
        <div className="flex-1 flex flex-col gap-3 overflow-hidden">
          {/* Progress Ring */}
          <div className="bg-[#1a1724] border border-white/10 rounded-xl p-3 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative w-14 h-14 flex-shrink-0">
                <svg className="transform -rotate-90 w-14 h-14">
                  <circle
                    cx="28"
                    cy="28"
                    r="24"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                    className="text-gray-700"
                  />
                  <circle
                    cx="28"
                    cy="28"
                    r="24"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 24}`}
                    strokeDashoffset={`${2 * Math.PI * 24 * (1 - taskCompletionPercentage / 100)}`}
                    className="text-purple-500 transition-all duration-500"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold text-white">{taskCompletionPercentage}%</span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white font-medium">Daily Progress</p>
                <p className="text-xs text-white/60 truncate">
                  {completedTasks === totalTasks && totalTasks > 0
                    ? "All tasks completed!"
                    : `${totalTasks - completedTasks} task${totalTasks - completedTasks !== 1 ? 's' : ''} remaining`}
                </p>
                {todayStats.totalXP > 0 && (
                  <p className="text-xs text-yellow-400 mt-0.5">
                    +{todayStats.totalXP} XP earned
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Task List */}
          <div className="bg-[#1a1724] border border-white/10 rounded-xl p-3 flex-1 overflow-y-auto">
            <div className="space-y-2">
              {todaysTasks.slice(0, 5).map((task) => {
                const category = TASK_CATEGORIES[task.category] || TASK_CATEGORIES.productivity;
                const priority = PRIORITY_LEVELS[task.priority] || PRIORITY_LEVELS.medium;

                return (
                  <div key={task.id} className="flex items-center gap-2 group">
                    <button
                      onClick={() => toggleTask(task.id)}
                      className="flex-shrink-0"
                    >
                      {task.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                      ) : (
                        <Circle className="w-4 h-4 text-white/40 hover:text-purple-400 transition-colors" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs truncate ${task.completed ? 'line-through text-white/50' : 'text-white'}`}>
                        {task.title}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`text-[10px] px-1 py-0.5 rounded bg-gradient-to-r ${category.color} text-white`}>
                          {category.label}
                        </span>
                        <span className="text-[10px] text-yellow-400">+{priority.xp}</span>
                        <span className="text-[10px] text-white/40 flex items-center gap-0.5">
                          <Clock className="w-2.5 h-2.5" />
                          {task.estimatedMinutes}m
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
              {todaysTasks.length > 5 && (
                <button
                  onClick={() => navigate('/quests')}
                  className="w-full text-center text-xs text-purple-400 hover:text-purple-300 py-1"
                >
                  +{todaysTasks.length - 5} more
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 bg-[#1a1724] border border-white/10 rounded-xl p-4 flex flex-col items-center justify-center text-center">
          <Moon className="w-8 h-8 text-white/20 mb-2" />
          <p className="text-white/60 text-sm mb-1">No tasks planned</p>
          <p className="text-white/40 text-xs mb-3">Plan your day for better productivity</p>
          <button
            onClick={() => navigate('/quests')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-violet-500 hover:bg-violet-600 text-white text-xs rounded-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Plan Today
          </button>
        </div>
      )}
    </div>
  );
}

export default memo(TodaysPlanWidget);
