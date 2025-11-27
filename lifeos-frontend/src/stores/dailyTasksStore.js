/**
 * Daily Tasks Store
 * Manages daily planned tasks with "Plan Tomorrow" functionality
 * Tasks are organized by date and shown on Dashboard and Quests page
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Helper to get date string in YYYY-MM-DD format
const getDateString = (date = new Date()) => {
  return date.toISOString().split('T')[0];
};

// Helper to get tomorrow's date string
const getTomorrowString = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return getDateString(tomorrow);
};

// Task categories with icons and colors
export const TASK_CATEGORIES = {
  productivity: {
    label: 'Productivity',
    color: 'from-indigo-500 to-violet-500',
    glowColor: 'rgba(99, 102, 241, 0.6)',
  },
  health: {
    label: 'Health',
    color: 'from-emerald-500 to-teal-500',
    glowColor: 'rgba(16, 185, 129, 0.6)',
  },
  learning: {
    label: 'Learning',
    color: 'from-violet-500 to-purple-500',
    glowColor: 'rgba(139, 92, 246, 0.6)',
  },
  personal: {
    label: 'Personal',
    color: 'from-rose-500 to-pink-500',
    glowColor: 'rgba(244, 63, 94, 0.6)',
  },
  admin: {
    label: 'Admin',
    color: 'from-slate-400 to-slate-500',
    glowColor: 'rgba(148, 163, 184, 0.6)',
  },
  creative: {
    label: 'Creative',
    color: 'from-amber-500 to-orange-500',
    glowColor: 'rgba(245, 158, 11, 0.6)',
  },
};

// Priority levels with XP rewards
export const PRIORITY_LEVELS = {
  low: { label: 'Low', xp: 10, color: 'text-slate-400' },
  medium: { label: 'Medium', xp: 20, color: 'text-blue-400' },
  high: { label: 'High', xp: 35, color: 'text-orange-400' },
  critical: { label: 'Critical', xp: 50, color: 'text-red-400' },
};

const useDailyTasksStore = create(
  persist(
    (set, get) => ({
      // Tasks organized by date: { 'YYYY-MM-DD': [tasks] }
      tasksByDate: {},

      // ============================================================
      // TASK ACTIONS
      // ============================================================

      // Add a task for a specific date
      addTask: (task, date = getTomorrowString()) => {
        const newTask = {
          id: `daily-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          title: task.title,
          description: task.description || '',
          category: task.category || 'productivity',
          priority: task.priority || 'medium',
          estimatedMinutes: task.estimatedMinutes || 30,
          completed: false,
          completedAt: null,
          order: task.order || 0,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          tasksByDate: {
            ...state.tasksByDate,
            [date]: [...(state.tasksByDate[date] || []), newTask],
          },
        }));

        return newTask.id;
      },

      // Update a task
      updateTask: (taskId, updates, date) => {
        set((state) => {
          const targetDate = date || Object.keys(state.tasksByDate).find(d =>
            state.tasksByDate[d].some(t => t.id === taskId)
          );

          if (!targetDate) return state;

          return {
            tasksByDate: {
              ...state.tasksByDate,
              [targetDate]: state.tasksByDate[targetDate].map(t =>
                t.id === taskId ? { ...t, ...updates } : t
              ),
            },
          };
        });
      },

      // Toggle task completion
      toggleTask: (taskId, date) => {
        const { tasksByDate } = get();
        const targetDate = date || Object.keys(tasksByDate).find(d =>
          tasksByDate[d].some(t => t.id === taskId)
        );

        if (!targetDate) return;

        const task = tasksByDate[targetDate]?.find(t => t.id === taskId);
        if (!task) return;

        const nowCompleted = !task.completed;

        set((state) => ({
          tasksByDate: {
            ...state.tasksByDate,
            [targetDate]: state.tasksByDate[targetDate].map(t =>
              t.id === taskId
                ? {
                    ...t,
                    completed: nowCompleted,
                    completedAt: nowCompleted ? new Date().toISOString() : null,
                  }
                : t
            ),
          },
        }));

        // Return XP earned if completed
        if (nowCompleted) {
          return PRIORITY_LEVELS[task.priority]?.xp || 10;
        }
        return 0;
      },

      // Delete a task
      deleteTask: (taskId, date) => {
        set((state) => {
          const targetDate = date || Object.keys(state.tasksByDate).find(d =>
            state.tasksByDate[d].some(t => t.id === taskId)
          );

          if (!targetDate) return state;

          return {
            tasksByDate: {
              ...state.tasksByDate,
              [targetDate]: state.tasksByDate[targetDate].filter(t => t.id !== taskId),
            },
          };
        });
      },

      // Reorder tasks for a date
      reorderTasks: (date, taskIds) => {
        set((state) => {
          const tasks = state.tasksByDate[date] || [];
          const reorderedTasks = taskIds
            .map((id, index) => {
              const task = tasks.find(t => t.id === id);
              return task ? { ...task, order: index } : null;
            })
            .filter(Boolean);

          return {
            tasksByDate: {
              ...state.tasksByDate,
              [date]: reorderedTasks,
            },
          };
        });
      },

      // Move incomplete tasks to today
      carryOverTasks: (fromDate) => {
        const { tasksByDate } = get();
        const today = getDateString();
        const tasksToCarry = (tasksByDate[fromDate] || []).filter(t => !t.completed);

        if (tasksToCarry.length === 0) return;

        set((state) => ({
          tasksByDate: {
            ...state.tasksByDate,
            [today]: [
              ...(state.tasksByDate[today] || []),
              ...tasksToCarry.map(t => ({
                ...t,
                id: `daily-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                carriedFrom: fromDate,
              })),
            ],
            [fromDate]: state.tasksByDate[fromDate].filter(t => t.completed),
          },
        }));
      },

      // ============================================================
      // GETTER FUNCTIONS
      // ============================================================

      // Get tasks for today
      getTodayTasks: () => {
        const { tasksByDate } = get();
        const today = getDateString();
        return (tasksByDate[today] || []).sort((a, b) => a.order - b.order);
      },

      // Get tasks for tomorrow
      getTomorrowTasks: () => {
        const { tasksByDate } = get();
        const tomorrow = getTomorrowString();
        return (tasksByDate[tomorrow] || []).sort((a, b) => a.order - b.order);
      },

      // Get tasks for a specific date
      getTasksByDate: (date) => {
        const { tasksByDate } = get();
        return (tasksByDate[date] || []).sort((a, b) => a.order - b.order);
      },

      // Get today's completion stats
      getTodayStats: () => {
        const { tasksByDate } = get();
        const today = getDateString();
        const tasks = tasksByDate[today] || [];

        const completed = tasks.filter(t => t.completed).length;
        const total = tasks.length;
        const totalXP = tasks
          .filter(t => t.completed)
          .reduce((sum, t) => sum + (PRIORITY_LEVELS[t.priority]?.xp || 10), 0);

        const totalMinutes = tasks.reduce((sum, t) => sum + (t.estimatedMinutes || 30), 0);
        const completedMinutes = tasks
          .filter(t => t.completed)
          .reduce((sum, t) => sum + (t.estimatedMinutes || 30), 0);

        return {
          completed,
          total,
          percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
          totalXP,
          totalMinutes,
          completedMinutes,
          remainingMinutes: totalMinutes - completedMinutes,
        };
      },

      // Get completion streak
      getStreak: () => {
        const { tasksByDate } = get();
        let streak = 0;
        let currentDate = new Date();
        currentDate.setDate(currentDate.getDate() - 1); // Start from yesterday

        while (true) {
          const dateStr = getDateString(currentDate);
          const tasks = tasksByDate[dateStr] || [];

          // If no tasks planned, don't break streak but don't count
          if (tasks.length === 0) {
            currentDate.setDate(currentDate.getDate() - 1);
            // Only check up to 30 days back
            if (streak === 0 && currentDate < new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) {
              break;
            }
            continue;
          }

          // Check if all tasks were completed
          const allCompleted = tasks.every(t => t.completed);
          if (allCompleted) {
            streak++;
            currentDate.setDate(currentDate.getDate() - 1);
          } else {
            break;
          }
        }

        return streak;
      },

      // ============================================================
      // TEMPLATE ACTIONS
      // ============================================================

      // Save current tomorrow's plan as a template
      saveAsTemplate: (name) => {
        const { tasksByDate } = get();
        const tomorrow = getTomorrowString();
        const tasks = tasksByDate[tomorrow] || [];

        const template = {
          id: `template-${Date.now()}`,
          name,
          tasks: tasks.map(t => ({
            title: t.title,
            description: t.description,
            category: t.category,
            priority: t.priority,
            estimatedMinutes: t.estimatedMinutes,
          })),
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          templates: [...(state.templates || []), template],
        }));

        return template.id;
      },

      // Apply a template to a date
      applyTemplate: (templateId, date = getTomorrowString()) => {
        const { templates, addTask } = get();
        const template = (templates || []).find(t => t.id === templateId);

        if (!template) return;

        template.tasks.forEach((task, index) => {
          addTask({ ...task, order: index }, date);
        });
      },

      // Stored templates
      templates: [],

      // Delete template
      deleteTemplate: (templateId) => {
        set((state) => ({
          templates: (state.templates || []).filter(t => t.id !== templateId),
        }));
      },
    }),
    {
      name: 'daily-tasks-storage',
      partialize: (state) => ({
        tasksByDate: state.tasksByDate,
        templates: state.templates,
      }),
    }
  )
);

export default useDailyTasksStore;
