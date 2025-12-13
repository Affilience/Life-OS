import React, { memo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Plus, Target } from 'lucide-react';
import useDailyTasksStore from '../../../stores/dailyTasksStore';
import SmartTaskItem from '../../tasks/SmartTaskItem';
import { suggestTaskCategory } from '../../../services/taskSemanticService';

function TodaysPlanWidget() {
  const navigate = useNavigate();
  const { getTodayTasks, getTodayStats, toggleTask, addTask } = useDailyTasksStore();
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const todaysTasks = getTodayTasks();
  const todayStats = getTodayStats();
  const completedTasks = todayStats.completed;
  const totalTasks = todayStats.total;

  // Get today's date string
  const today = new Date().toISOString().split('T')[0];

  // Quick add task handler
  const handleQuickAdd = (e) => {
    e.preventDefault();
    if (newTaskTitle.trim()) {
      // Use semantic service to suggest category
      const suggestedCategory = suggestTaskCategory(newTaskTitle.trim());
      addTask({
        title: newTaskTitle.trim(),
        category: suggestedCategory,
        priority: 'medium',
        estimatedMinutes: 30,
      }, today); // Add to today instead of tomorrow
      setNewTaskTitle('');
      setIsAddingTask(false);
    }
  };

  // Handle task toggle
  const handleToggle = (taskId) => {
    toggleTask(taskId, today);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-2 flex-shrink-0">
        <h3 className="text-sm font-semibold text-text-secondary flex items-center gap-2">
          <Target className="w-4 h-4 text-primary-400" />
          Today's Plan
        </h3>
        <button
          onClick={() => navigate('/quests')}
          className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1 transition-colors"
        >
          {totalTasks > 0 ? `${completedTasks}/${totalTasks}` : 'View All'}
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto min-h-0 space-y-1">
        {todaysTasks.slice(0, 5).map((task) => (
          <SmartTaskItem
            key={task.id}
            task={task}
            onToggle={handleToggle}
            compact={true}
            showCategory={false}
            showActionButton={true}
          />
        ))}

        {/* Show more link if there are additional tasks */}
        {todaysTasks.length > 5 && (
          <button
            onClick={() => navigate('/quests')}
            className="text-xs text-primary-400 hover:text-primary-300 py-1 transition-colors"
          >
            +{todaysTasks.length - 5} more
          </button>
        )}

        {/* Empty state */}
        {totalTasks === 0 && !isAddingTask && (
          <div className="text-center py-4">
            <p className="text-text-muted text-sm mb-2">No tasks yet</p>
          </div>
        )}
      </div>

      {/* Quick Add Task */}
      <div className="flex-shrink-0 pt-2 border-t border-border/50 mt-auto">
        {isAddingTask ? (
          <form onSubmit={handleQuickAdd} className="flex gap-2">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Task name..."
              autoFocus
              className="flex-1 px-2 py-1.5 bg-bg-1 border border-primary-500/30 rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary-500 transition-colors"
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setIsAddingTask(false);
                  setNewTaskTitle('');
                }
              }}
            />
            <button
              type="submit"
              disabled={!newTaskTitle.trim()}
              className="px-2 py-1.5 bg-primary-500 text-text-primary text-sm rounded-lg hover:bg-primary-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add
            </button>
          </form>
        ) : (
          <button
            onClick={() => setIsAddingTask(true)}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 text-sm text-primary-400 hover:text-primary-300 hover:bg-primary-500/10 rounded-lg transition-all group"
          >
            <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
            Add Task
          </button>
        )}
      </div>
    </div>
  );
}

export default memo(TodaysPlanWidget);
