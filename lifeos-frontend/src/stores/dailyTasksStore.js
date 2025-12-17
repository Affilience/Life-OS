/**
 * Daily Tasks Store
 * Manages daily planned tasks with "Plan Tomorrow" functionality
 * Tasks are organized by date and shown on Dashboard and Quests page
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import { DEV_USER_ID } from '../lib/dev-auth';
import { triggerGamification } from '../hooks/useGamification';
import useAchievementsStore from './achievementsStore';
import { feedback } from '../services/microInteractions';

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

// Supabase sync helpers
const syncTaskToSupabase = async (task, date, action = 'upsert') => {
  try {
    if (action === 'delete') {
      const { error } = await supabase.from('daily_tasks').delete().eq('id', task.id);
      if (error) console.error('Error deleting daily task:', error);
      return;
    }

    // If this task has a parent, verify parent exists in Supabase first
    let parentTaskId = null;
    if (task.parentTaskId) {
      const { data: parentExists } = await supabase
        .from('daily_tasks')
        .select('id')
        .eq('id', task.parentTaskId)
        .maybeSingle();

      // Only set parent_task_id if parent exists in database
      if (parentExists) {
        parentTaskId = task.parentTaskId;
      } else {
        console.log(`[DailyTasks] Parent task ${task.parentTaskId} not in Supabase yet, skipping parent reference`);
      }
    }

    const dbTask = {
      id: task.id,
      user_id: DEV_USER_ID,
      task_date: date,
      title: task.title,
      description: task.description || null,
      category: task.category || 'productivity',
      priority: task.priority || 'medium',
      estimated_minutes: task.estimatedMinutes || 30,
      completed: task.completed || false,
      completed_at: task.completedAt || null,
      task_order: task.order || 0,
      carried_from: task.carriedFrom || null,
      parent_task_id: parentTaskId,
      subtask_order: task.subtaskOrder || 0,
    };

    // First try to update existing record
    const { data: existing, error: selectError } = await supabase
      .from('daily_tasks')
      .select('id')
      .eq('id', task.id)
      .maybeSingle();

    if (existing) {
      // Update existing task
      const { error: updateError } = await supabase
        .from('daily_tasks')
        .update(dbTask)
        .eq('id', task.id);
      if (updateError) console.error('Error updating daily task:', updateError);
    } else {
      // Insert new task
      const { error: insertError } = await supabase
        .from('daily_tasks')
        .insert(dbTask);
      if (insertError) console.error('Error inserting daily task:', insertError);
    }
  } catch (error) {
    console.error('Error syncing daily task to Supabase:', error);
  }
};

const syncTemplateToSupabase = async (template, action = 'upsert') => {
  try {
    if (action === 'delete') {
      const { error } = await supabase.from('daily_task_templates').delete().eq('id', template.id);
      if (error) console.error('Error deleting template:', error);
      return;
    }

    const dbTemplate = {
      id: template.id,
      user_id: DEV_USER_ID,
      name: template.name,
      tasks: template.tasks,
    };

    // First try to update existing record
    const { data: existing } = await supabase
      .from('daily_task_templates')
      .select('id')
      .eq('id', template.id)
      .maybeSingle();

    if (existing) {
      const { error: updateError } = await supabase
        .from('daily_task_templates')
        .update(dbTemplate)
        .eq('id', template.id);
      if (updateError) console.error('Error updating template:', updateError);
    } else {
      const { error: insertError } = await supabase
        .from('daily_task_templates')
        .insert(dbTemplate);
      if (insertError) console.error('Error inserting template:', insertError);
    }
  } catch (error) {
    console.error('Error syncing template to Supabase:', error);
  }
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

      // Initialize from Supabase - merges with local data and syncs unsynced tasks
      initializeFromSupabase: async () => {
        try {
          const currentState = get();
          const localTasksByDate = currentState.tasksByDate || {};

          // Load tasks for recent and upcoming dates (last 7 days + next 7 days)
          const today = new Date();
          const startDate = new Date(today);
          startDate.setDate(startDate.getDate() - 7);
          const endDate = new Date(today);
          endDate.setDate(endDate.getDate() + 7);

          const { data: tasksData, error: tasksError } = await supabase
            .from('daily_tasks')
            .select('*')
            .eq('user_id', DEV_USER_ID)
            .gte('task_date', getDateString(startDate))
            .lte('task_date', getDateString(endDate))
            .order('task_order', { ascending: true });

          if (tasksError) throw tasksError;

          // Load templates
          const { data: templatesData, error: templatesError } = await supabase
            .from('daily_task_templates')
            .select('*')
            .eq('user_id', DEV_USER_ID);

          if (templatesError) throw templatesError;

          // Build map of Supabase tasks by ID for quick lookup
          const supabaseTaskIds = new Set();
          const tasksByDateFromSupabase = {};

          if (tasksData && tasksData.length > 0) {
            tasksData.forEach(task => {
              supabaseTaskIds.add(task.id);
              const date = task.task_date;
              if (!tasksByDateFromSupabase[date]) {
                tasksByDateFromSupabase[date] = [];
              }
              tasksByDateFromSupabase[date].push({
                id: task.id,
                title: task.title,
                description: task.description || '',
                category: task.category || 'productivity',
                priority: task.priority || 'medium',
                estimatedMinutes: task.estimated_minutes || 30,
                completed: task.completed || false,
                completedAt: task.completed_at,
                order: task.task_order || 0,
                carriedFrom: task.carried_from,
                createdAt: task.created_at,
                parentTaskId: task.parent_task_id || null,
                subtaskOrder: task.subtask_order || 0,
              });
            });
          }

          // Merge: keep Supabase data as source of truth, but sync any local-only tasks
          const mergedTasksByDate = { ...tasksByDateFromSupabase };

          // Find local tasks that aren't in Supabase and sync them
          for (const [date, tasks] of Object.entries(localTasksByDate)) {
            for (const task of tasks) {
              if (!supabaseTaskIds.has(task.id)) {
                // This task exists locally but not in Supabase - sync it
                console.log(`[DailyTasks] Syncing local task to Supabase: ${task.title}`);
                await syncTaskToSupabase(task, date);

                // Add to merged result
                if (!mergedTasksByDate[date]) {
                  mergedTasksByDate[date] = [];
                }
                mergedTasksByDate[date].push(task);
              }
            }
          }

          const updates = { tasksByDate: mergedTasksByDate };

          if (templatesData && templatesData.length > 0) {
            updates.templates = templatesData.map(t => ({
              id: t.id,
              name: t.name,
              tasks: t.tasks || [],
              createdAt: t.created_at,
            }));
          }

          set(updates);
          console.log('[DailyTasks] Store initialized from Supabase');
        } catch (error) {
          console.error('Error initializing daily tasks from Supabase:', error);
        }
      },

      // ============================================================
      // TASK ACTIONS
      // ============================================================

      // Add a task for a specific date
      addTask: (task, date = getTomorrowString()) => {
        const newTask = {
          id: crypto.randomUUID(),
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

        // Sync to Supabase
        syncTaskToSupabase(newTask, date);

        return newTask.id;
      },

      // Update a task
      updateTask: (taskId, updates, date) => {
        const { tasksByDate } = get();
        const targetDate = date || Object.keys(tasksByDate).find(d =>
          tasksByDate[d].some(t => t.id === taskId)
        );

        if (!targetDate) return;

        set((state) => ({
          tasksByDate: {
            ...state.tasksByDate,
            [targetDate]: state.tasksByDate[targetDate].map(t =>
              t.id === taskId ? { ...t, ...updates } : t
            ),
          },
        }));

        // Sync to Supabase
        const updatedTask = get().tasksByDate[targetDate]?.find(t => t.id === taskId);
        if (updatedTask) {
          syncTaskToSupabase(updatedTask, targetDate);
        }
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

        // Sync to Supabase
        const updatedTask = get().tasksByDate[targetDate]?.find(t => t.id === taskId);
        if (updatedTask) {
          syncTaskToSupabase(updatedTask, targetDate);
        }

        // Award XP if completed
        if (nowCompleted) {
          // Play satisfying completion feedback (sound + haptic + celebration)
          feedback.taskComplete();

          const xpAmount = PRIORITY_LEVELS[task.priority]?.xp || 10;
          // Trigger gamification system to update XP across all stores
          triggerGamification('taskCompleted', {
            xpOverride: xpAmount,
            module: 'productivity',
          });

          // Track achievement stats
          const achievementsStore = useAchievementsStore.getState();

          // Check how many tasks completed today for "Task Blitz" achievement
          const todayTasks = get().tasksByDate[targetDate] || [];
          const completedToday = todayTasks.filter(t => t.completed).length;

          // Update the tasks completed in single day stat
          // This checks the max tasks in a day and updates if higher
          const currentMax = achievementsStore.stats.tasksSingleDay || 0;
          if (completedToday > currentMax) {
            achievementsStore.updateStat('tasksSingleDay', completedToday);
          }

          // Check achievements
          achievementsStore.checkAchievements();

          return xpAmount;
        }
        return 0;
      },

      // Delete a task
      deleteTask: (taskId, date) => {
        const { tasksByDate } = get();
        const targetDate = date || Object.keys(tasksByDate).find(d =>
          tasksByDate[d].some(t => t.id === taskId)
        );

        if (!targetDate) return;

        const taskToDelete = tasksByDate[targetDate]?.find(t => t.id === taskId);

        set((state) => ({
          tasksByDate: {
            ...state.tasksByDate,
            [targetDate]: state.tasksByDate[targetDate].filter(t => t.id !== taskId),
          },
        }));

        // Sync to Supabase
        if (taskToDelete) {
          syncTaskToSupabase(taskToDelete, targetDate, 'delete');
        }
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

        // Sync all reordered tasks to Supabase
        const tasks = get().tasksByDate[date] || [];
        tasks.forEach(task => {
          syncTaskToSupabase(task, date);
        });
      },

      // ============================================================
      // SUBTASK ACTIONS
      // ============================================================

      // Add a subtask to a parent task
      addSubtask: (parentTaskId, subtask, date) => {
        const { tasksByDate } = get();
        const targetDate = date || Object.keys(tasksByDate).find(d =>
          tasksByDate[d].some(t => t.id === parentTaskId)
        );

        if (!targetDate) return null;

        const parentTask = tasksByDate[targetDate]?.find(t => t.id === parentTaskId);
        if (!parentTask) return null;

        // Count existing subtasks to set order
        const existingSubtasks = tasksByDate[targetDate].filter(t => t.parentTaskId === parentTaskId);
        const subtaskOrder = existingSubtasks.length;

        const newSubtask = {
          id: crypto.randomUUID(),
          title: subtask.title,
          description: subtask.description || '',
          category: parentTask.category, // Inherit parent's category
          priority: subtask.priority || parentTask.priority, // Default to parent's priority
          estimatedMinutes: subtask.estimatedMinutes || 15, // Shorter default for subtasks
          completed: false,
          completedAt: null,
          order: parentTask.order, // Same order group as parent
          parentTaskId: parentTaskId,
          subtaskOrder: subtaskOrder,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          tasksByDate: {
            ...state.tasksByDate,
            [targetDate]: [...state.tasksByDate[targetDate], newSubtask],
          },
        }));

        // Sync to Supabase
        syncTaskToSupabase(newSubtask, targetDate);

        return newSubtask.id;
      },

      // Get subtasks for a parent task
      getSubtasks: (parentTaskId, date) => {
        const { tasksByDate } = get();
        const targetDate = date || Object.keys(tasksByDate).find(d =>
          tasksByDate[d].some(t => t.id === parentTaskId)
        );

        if (!targetDate) return [];

        return (tasksByDate[targetDate] || [])
          .filter(t => t.parentTaskId === parentTaskId)
          .sort((a, b) => a.subtaskOrder - b.subtaskOrder);
      },

      // Get subtask completion stats for a parent task
      getSubtaskStats: (parentTaskId, date) => {
        const subtasks = get().getSubtasks(parentTaskId, date);
        const total = subtasks.length;
        const completed = subtasks.filter(s => s.completed).length;
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

        return { total, completed, percentage };
      },

      // Toggle subtask completion (and optionally auto-complete parent)
      toggleSubtask: (subtaskId, date) => {
        const { tasksByDate } = get();
        const targetDate = date || Object.keys(tasksByDate).find(d =>
          tasksByDate[d].some(t => t.id === subtaskId)
        );

        if (!targetDate) return 0;

        const subtask = tasksByDate[targetDate]?.find(t => t.id === subtaskId);
        if (!subtask || !subtask.parentTaskId) return 0;

        const nowCompleted = !subtask.completed;

        set((state) => ({
          tasksByDate: {
            ...state.tasksByDate,
            [targetDate]: state.tasksByDate[targetDate].map(t =>
              t.id === subtaskId
                ? {
                    ...t,
                    completed: nowCompleted,
                    completedAt: nowCompleted ? new Date().toISOString() : null,
                  }
                : t
            ),
          },
        }));

        // Sync to Supabase
        const updatedSubtask = get().tasksByDate[targetDate]?.find(t => t.id === subtaskId);
        if (updatedSubtask) {
          syncTaskToSupabase(updatedSubtask, targetDate);
        }

        // Award XP if completed (subtasks give half XP)
        if (nowCompleted) {
          const xpAmount = Math.floor((PRIORITY_LEVELS[subtask.priority]?.xp || 10) / 2);
          // Trigger gamification system to update XP across all stores
          triggerGamification('taskCompleted', {
            xpOverride: xpAmount,
            module: 'productivity',
          });
          return xpAmount;
        }
        return 0;
      },

      // Delete a subtask
      deleteSubtask: (subtaskId, date) => {
        const { tasksByDate } = get();
        const targetDate = date || Object.keys(tasksByDate).find(d =>
          tasksByDate[d].some(t => t.id === subtaskId)
        );

        if (!targetDate) return;

        const subtaskToDelete = tasksByDate[targetDate]?.find(t => t.id === subtaskId);
        if (!subtaskToDelete) return;

        set((state) => ({
          tasksByDate: {
            ...state.tasksByDate,
            [targetDate]: state.tasksByDate[targetDate].filter(t => t.id !== subtaskId),
          },
        }));

        // Sync to Supabase
        syncTaskToSupabase(subtaskToDelete, targetDate, 'delete');
      },

      // Reorder subtasks within a parent
      reorderSubtasks: (parentTaskId, subtaskIds, date) => {
        const { tasksByDate } = get();
        const targetDate = date || Object.keys(tasksByDate).find(d =>
          tasksByDate[d].some(t => t.id === parentTaskId)
        );

        if (!targetDate) return;

        set((state) => ({
          tasksByDate: {
            ...state.tasksByDate,
            [targetDate]: state.tasksByDate[targetDate].map(t => {
              if (t.parentTaskId === parentTaskId) {
                const newOrder = subtaskIds.indexOf(t.id);
                return newOrder >= 0 ? { ...t, subtaskOrder: newOrder } : t;
              }
              return t;
            }),
          },
        }));

        // Sync reordered subtasks to Supabase
        const subtasks = get().tasksByDate[targetDate]?.filter(t => t.parentTaskId === parentTaskId) || [];
        subtasks.forEach(subtask => {
          syncTaskToSupabase(subtask, targetDate);
        });
      },

      // Move incomplete tasks to today
      carryOverTasks: (fromDate) => {
        const { tasksByDate } = get();
        const today = getDateString();
        const tasksToCarry = (tasksByDate[fromDate] || []).filter(t => !t.completed);

        if (tasksToCarry.length === 0) return;

        const newTasks = tasksToCarry.map(t => ({
          ...t,
          id: crypto.randomUUID(),
          carriedFrom: fromDate,
        }));

        set((state) => ({
          tasksByDate: {
            ...state.tasksByDate,
            [today]: [
              ...(state.tasksByDate[today] || []),
              ...newTasks,
            ],
            [fromDate]: state.tasksByDate[fromDate].filter(t => t.completed),
          },
        }));

        // Sync new carried tasks to Supabase
        newTasks.forEach(task => {
          syncTaskToSupabase(task, today);
        });

        // Delete original tasks from old date
        tasksToCarry.forEach(task => {
          syncTaskToSupabase(task, fromDate, 'delete');
        });
      },

      // ============================================================
      // GETTER FUNCTIONS
      // ============================================================

      // Get tasks for today (top-level only, no subtasks)
      getTodayTasks: () => {
        const { tasksByDate } = get();
        const today = getDateString();
        return (tasksByDate[today] || [])
          .filter(t => !t.parentTaskId) // Exclude subtasks
          .sort((a, b) => a.order - b.order);
      },

      // Get tasks for tomorrow (top-level only, no subtasks)
      getTomorrowTasks: () => {
        const { tasksByDate } = get();
        const tomorrow = getTomorrowString();
        return (tasksByDate[tomorrow] || [])
          .filter(t => !t.parentTaskId) // Exclude subtasks
          .sort((a, b) => a.order - b.order);
      },

      // Get tasks for a specific date (top-level only, no subtasks)
      getTasksByDate: (date) => {
        const { tasksByDate } = get();
        return (tasksByDate[date] || [])
          .filter(t => !t.parentTaskId) // Exclude subtasks
          .sort((a, b) => a.order - b.order);
      },

      // Get all tasks including subtasks (for stats calculations)
      getAllTasksByDate: (date) => {
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
          id: crypto.randomUUID(),
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

        // Sync to Supabase
        syncTemplateToSupabase(template);

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
        const templateToDelete = (get().templates || []).find(t => t.id === templateId);

        set((state) => ({
          templates: (state.templates || []).filter(t => t.id !== templateId),
        }));

        // Sync to Supabase
        if (templateToDelete) {
          syncTemplateToSupabase(templateToDelete, 'delete');
        }
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

// Initialize daily tasks store from Supabase
export const initializeDailyTasksStore = async () => {
  const store = useDailyTasksStore.getState();
  await store.initializeFromSupabase();
};

export default useDailyTasksStore;
