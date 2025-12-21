import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useAvatarStore } from './avatarStore';
import { supabase, getCurrentUserId } from '../lib/supabase';
import { triggerGamification } from '../hooks/useGamification';

/**
 * Productivity Store
 * Manages work sessions, projects, tasks, and business income
 */

// Supabase sync helpers - use select+insert/update pattern to avoid 409 conflicts
const syncSessionToSupabase = async (session, action = 'upsert') => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return;

    if (action === 'delete') {
      const { error } = await supabase.from('productivity_sessions').delete().eq('id', session.id);
      if (error) console.error('Error deleting session:', error);
      return;
    }

    const dbSession = {
      id: session.id,
      user_id: userId,
      project_id: session.projectId || null,
      title: session.type || 'Work Session',
      description: session.notes || '',
      session_type: session.type === 'deep-work' ? 'deep_work' : session.type || 'deep_work',
      planned_duration_minutes: null,
      actual_duration_minutes: Math.round(session.duration / 60),
      focus_quality: session.focusQuality,
      tags: session.tags || [],
      started_at: session.startTime,
      ended_at: session.endTime,
    };

    const { data: existing } = await supabase
      .from('productivity_sessions')
      .select('id')
      .eq('id', session.id)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase.from('productivity_sessions').update(dbSession).eq('id', session.id);
      if (error) console.error('Error updating session:', error);
    } else {
      const { error } = await supabase.from('productivity_sessions').insert(dbSession);
      if (error) console.error('Error inserting session:', error);
    }
  } catch (error) {
    console.error('Error syncing session to Supabase:', error);
  }
};

const syncProjectToSupabase = async (project, action = 'upsert') => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return;

    if (action === 'delete') {
      const { error } = await supabase.from('productivity_projects').delete().eq('id', project.id);
      if (error) console.error('Error deleting project:', error);
      return;
    }

    const dbProject = {
      id: project.id,
      user_id: userId,
      name: project.name,
      description: project.description || '',
      status: project.status || 'active',
      priority: project.priority === 'high' ? 1 : project.priority === 'medium' ? 2 : 3,
      color: project.color,
      deadline: project.dueDate || null,
      estimated_hours: project.estimatedTime ? Math.round(project.estimatedTime / 3600) : null,
      actual_hours: project.totalTimeSpent ? Math.round(project.totalTimeSpent / 3600) : 0,
      completed_at: project.status === 'completed' ? (project.completedAt || new Date().toISOString()) : null,
    };

    const { data: existing } = await supabase
      .from('productivity_projects')
      .select('id')
      .eq('id', project.id)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase.from('productivity_projects').update(dbProject).eq('id', project.id);
      if (error) console.error('Error updating project:', error);
    } else {
      const { error } = await supabase.from('productivity_projects').insert(dbProject);
      if (error) console.error('Error inserting project:', error);
    }
  } catch (error) {
    console.error('Error syncing project to Supabase:', error);
  }
};

const syncTaskToSupabase = async (task, action = 'upsert') => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return;

    if (action === 'delete') {
      const { error } = await supabase.from('productivity_tasks').delete().eq('id', task.id);
      if (error) console.error('Error deleting task:', error);
      return;
    }

    const dbTask = {
      id: task.id,
      user_id: userId,
      project_id: task.projectId || null,
      title: task.title,
      description: task.description || '',
      status: task.status === 'pending' ? 'todo' : task.status === 'active' ? 'in_progress' : task.status,
      priority: task.priority === 'high' ? 1 : task.priority === 'medium' ? 2 : 3,
      estimated_minutes: task.estimatedTime ? Math.round(task.estimatedTime / 60) : null,
      due_date: task.dueDate,
      completed_at: task.completedAt,
      tags: task.tags || [],
      parent_task_id: task.parentTaskId || null,
      subtask_order: task.subtaskOrder || 0,
    };

    const { data: existing } = await supabase
      .from('productivity_tasks')
      .select('id')
      .eq('id', task.id)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase.from('productivity_tasks').update(dbTask).eq('id', task.id);
      if (error) console.error('Error updating task:', error);
    } else {
      const { error } = await supabase.from('productivity_tasks').insert(dbTask);
      if (error) console.error('Error inserting task:', error);
    }
  } catch (error) {
    console.error('Error syncing task to Supabase:', error);
  }
};

const syncIncomeToSupabase = async (income, action = 'upsert') => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return;

    if (action === 'delete') {
      await supabase.from('productivity_income').delete().eq('id', income.id);
      return;
    }

    const dbIncome = {
      id: income.id,
      user_id: userId,
      project_id: income.projectId || null,
      amount: income.amount,
      currency: income.currency || 'USD',
      source: income.source,
      income_date: income.date,
      hours_worked: income.hoursWorked,
      notes: income.notes || '',
      tags: income.tags || [],
    };

    await supabase.from('productivity_income').upsert(dbIncome, { onConflict: 'id' });
  } catch (error) {
    console.error('Error syncing income to Supabase:', error);
  }
};

const useProductivityStore = create(
  persist(
    (set, get) => ({
      // ============================================================
      // WORK SESSIONS STATE
      // ============================================================
      sessions: [],

      // ============================================================
      // INITIALIZE FROM SUPABASE
      // ============================================================
      initializeFromSupabase: async () => {
        try {
          const userId = await getCurrentUserId();
          if (!userId) return;

          // Load sessions (limit to 200 most recent)
          const { data: sessionsData, error: sessionsError } = await supabase
            .from('productivity_sessions')
            .select('*')
            .eq('user_id', userId)
            .order('started_at', { ascending: false })
            .limit(200);

          if (sessionsError) throw sessionsError;

          // Load projects (limit to 100)
          const { data: projectsData, error: projectsError } = await supabase
            .from('productivity_projects')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(100);

          if (projectsError) throw projectsError;

          // Load tasks (limit to 500, includes incomplete and recent completed)
          const { data: tasksData, error: tasksError } = await supabase
            .from('productivity_tasks')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(500);

          if (tasksError) throw tasksError;

          // Load income (limit to 200 most recent)
          const { data: incomeData, error: incomeError } = await supabase
            .from('productivity_income')
            .select('*')
            .eq('user_id', userId)
            .order('income_date', { ascending: false })
            .limit(200);

          if (incomeError) throw incomeError;

          // Transform data from DB format to store format
          const sessions = (sessionsData || []).map(s => ({
            id: s.id,
            projectId: s.project_id,
            type: s.session_type === 'deep_work' ? 'deep-work' : s.session_type,
            startTime: s.started_at,
            endTime: s.ended_at,
            duration: (s.actual_duration_minutes || 0) * 60,
            focusQuality: s.focus_quality,
            notes: s.description || '',
            tags: s.tags || [],
          }));

          const projects = (projectsData || []).map(p => ({
            id: p.id,
            name: p.name,
            description: p.description || '',
            status: p.status || 'active',
            priority: p.priority === 1 ? 'high' : p.priority === 2 ? 'medium' : 'low',
            progress: 0, // Progress calculated from tasks, not stored
            color: p.color || '#8b5cf6',
            startDate: p.created_at, // Use created_at as start date
            dueDate: p.deadline,
            totalTimeSpent: (p.actual_hours || 0) * 3600,
            estimatedTime: (p.estimated_hours || 0) * 3600,
            createdAt: p.created_at,
            updatedAt: p.updated_at,
            completedAt: p.completed_at,
          }));

          const tasks = (tasksData || []).map(t => ({
            id: t.id,
            projectId: t.project_id,
            title: t.title,
            description: t.description || '',
            status: t.status === 'todo' ? 'pending' : t.status === 'in_progress' ? 'active' : t.status,
            priority: t.priority === 1 ? 'high' : t.priority === 2 ? 'medium' : 'low',
            dueDate: t.due_date,
            completedAt: t.completed_at,
            tags: t.tags || [],
            estimatedTime: (t.estimated_minutes || 0) * 60,
            createdAt: t.created_at,
            parentTaskId: t.parent_task_id || null,
            subtaskOrder: t.subtask_order || 0,
          }));

          const incomeTransactions = (incomeData || []).map(i => ({
            id: i.id,
            projectId: i.project_id,
            amount: parseFloat(i.amount) || 0,
            currency: i.currency || 'USD',
            source: i.source,
            date: i.income_date,
            hoursWorked: i.hours_worked,
            effectiveRate: i.hours_worked ? (i.amount / i.hours_worked).toFixed(2) : 0,
            notes: i.notes || '',
            tags: i.tags || [],
          }));

          set({ sessions, projects, tasks, incomeTransactions });
        } catch (error) {
          console.error('Error initializing productivity from Supabase:', error);
        }
      },

      // Keep sample sessions for initial state if DB is empty
      _sampleSessions: [
        {
          id: '1',
          projectId: 'proj-1',
          type: 'deep-work',
          startTime: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
          endTime: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
          duration: 3600, // seconds
          focusQuality: 8,
          notes: 'Finished client dashboard feature',
          tags: ['frontend', 'react'],
        },
        {
          id: '2',
          projectId: 'proj-2',
          type: 'learning',
          startTime: new Date(Date.now() - 86400000).toISOString(), // yesterday
          endTime: new Date(Date.now() - 82800000).toISOString(),
          duration: 3600,
          focusQuality: 7,
          notes: 'Studied Advanced React patterns',
          tags: ['learning', 'react'],
        },
      ],
      activeSession: null,
      sessionTimer: 0, // seconds elapsed in current session
      timerInterval: null,

      // ============================================================
      // PROJECTS STATE
      // ============================================================
      projects: [
        {
          id: 'proj-1',
          name: 'Client Dashboard App',
          description: 'Build dashboard for client management',
          status: 'active', // active, completed, paused, archived
          priority: 'high',
          progress: 65,
          color: '#8b5cf6',
          startDate: '2025-01-01',
          dueDate: '2025-02-15',
          totalTimeSpent: 28800, // seconds
          estimatedTime: 72000,
          createdAt: '2025-01-01T10:00:00Z',
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'proj-2',
          name: 'Personal Website Redesign',
          description: 'Update portfolio with new projects',
          status: 'active',
          priority: 'medium',
          progress: 30,
          color: '#3b82f6',
          startDate: '2025-01-10',
          dueDate: null,
          totalTimeSpent: 14400,
          estimatedTime: 36000,
          createdAt: '2025-01-10T10:00:00Z',
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'proj-3',
          name: 'Learn Next.js 14',
          description: 'Master Next.js App Router',
          status: 'paused',
          priority: 'low',
          progress: 15,
          color: '#10b981',
          startDate: '2025-01-05',
          dueDate: null,
          totalTimeSpent: 7200,
          estimatedTime: 54000,
          createdAt: '2025-01-05T10:00:00Z',
          updatedAt: new Date().toISOString(),
        },
      ],

      // ============================================================
      // TASKS STATE
      // ============================================================
      tasks: [
        {
          id: 'task-1',
          projectId: 'proj-1',
          title: 'Design user authentication flow',
          description: 'Create wireframes and user flow',
          status: 'completed',
          priority: 'high',
          dueDate: '2025-01-15',
          completedAt: '2025-01-14T15:30:00Z',
          tags: ['design', 'auth'],
          estimatedTime: 7200,
          createdAt: '2025-01-12T10:00:00Z',
        },
        {
          id: 'task-2',
          projectId: 'proj-1',
          title: 'Implement dashboard API endpoints',
          description: 'Build REST API for dashboard data',
          status: 'active',
          priority: 'high',
          dueDate: '2025-01-20',
          completedAt: null,
          tags: ['backend', 'api'],
          estimatedTime: 14400,
          createdAt: '2025-01-15T10:00:00Z',
        },
        {
          id: 'task-3',
          projectId: 'proj-1',
          title: 'Set up database schema',
          description: 'Design and implement PostgreSQL schema',
          status: 'active',
          priority: 'high',
          dueDate: '2025-01-18',
          completedAt: null,
          tags: ['database', 'backend'],
          estimatedTime: 10800,
          createdAt: '2025-01-14T10:00:00Z',
        },
        {
          id: 'task-4',
          projectId: 'proj-2',
          title: 'Design new homepage layout',
          description: 'Create modern, minimal design',
          status: 'active',
          priority: 'medium',
          dueDate: null,
          completedAt: null,
          tags: ['design', 'frontend'],
          estimatedTime: 7200,
          createdAt: '2025-01-10T10:00:00Z',
        },
        {
          id: 'task-5',
          projectId: null,
          title: 'Update resume with recent projects',
          description: 'Add latest work to resume',
          status: 'pending',
          priority: 'low',
          dueDate: '2025-02-01',
          completedAt: null,
          tags: ['admin'],
          estimatedTime: 3600,
          createdAt: '2025-01-16T10:00:00Z',
        },
      ],

      // ============================================================
      // INCOME STATE
      // ============================================================
      incomeTransactions: [
        {
          id: 'income-1',
          projectId: 'proj-1',
          amount: 1200,
          currency: 'GBP',
          source: 'Client Payment - Milestone 1',
          date: '2025-01-10',
          hoursWorked: 20,
          effectiveRate: 60,
          notes: 'First milestone completed',
          tags: ['client-work', 'freelance'],
        },
        {
          id: 'income-2',
          projectId: 'proj-1',
          amount: 800,
          currency: 'GBP',
          source: 'Client Payment - Milestone 2',
          date: '2025-01-15',
          hoursWorked: 16,
          effectiveRate: 50,
          notes: 'Second milestone delivered',
          tags: ['client-work', 'freelance'],
        },
      ],

      // ============================================================
      // WORK SESSION ACTIONS
      // ============================================================

      startSession: (projectId, type) => {
        const newSession = {
          id: crypto.randomUUID(),
          projectId,
          type,
          startTime: new Date().toISOString(),
          endTime: null,
          duration: 0,
          focusQuality: null,
          notes: '',
          tags: [],
        };

        set({
          activeSession: newSession,
          sessionTimer: 0,
        });

        // Start timer
        const interval = setInterval(() => {
          set((state) => ({
            sessionTimer: state.sessionTimer + 1,
          }));
        }, 1000);

        set({ timerInterval: interval });
      },

      pauseSession: () => {
        const { timerInterval } = get();
        if (timerInterval) {
          clearInterval(timerInterval);
          set({ timerInterval: null });
        }
      },

      resumeSession: () => {
        const { timerInterval } = get();
        if (!timerInterval) {
          const interval = setInterval(() => {
            set((state) => ({
              sessionTimer: state.sessionTimer + 1,
            }));
          }, 1000);
          set({ timerInterval: interval });
        }
      },

      endSession: (focusQuality, notes, tags) => {
        const { activeSession, sessionTimer, timerInterval, sessions, projects } = get();

        if (!activeSession) return;

        // Stop timer
        if (timerInterval) {
          clearInterval(timerInterval);
        }

        // Complete session
        const completedSession = {
          ...activeSession,
          endTime: new Date().toISOString(),
          duration: sessionTimer,
          focusQuality,
          notes,
          tags,
        };

        // Update project time
        if (activeSession.projectId) {
          const updatedProjects = projects.map((p) =>
            p.id === activeSession.projectId
              ? { ...p, totalTimeSpent: p.totalTimeSpent + sessionTimer, updatedAt: new Date().toISOString() }
              : p
          );
          set({ projects: updatedProjects });

          // Sync updated project
          const updatedProject = updatedProjects.find(p => p.id === activeSession.projectId);
          if (updatedProject) {
            syncProjectToSupabase(updatedProject);
          }
        }

        // Award XP based on session duration and focus quality
        const minutes = Math.floor(sessionTimer / 60);
        let xpEarned = minutes * 2; // 2 XP per minute base
        const qualityMultiplier = focusQuality / 10;
        xpEarned = Math.floor(xpEarned * qualityMultiplier);

        if (activeSession.type === 'deep-work') {
          xpEarned = Math.floor(xpEarned * 1.5);
        } else if (activeSession.type === 'learning') {
          xpEarned = Math.floor(xpEarned * 1.3);
        }

        xpEarned = Math.max(5, xpEarned);

        // Track deep work minutes for achievements
        if (activeSession.type === 'deep-work') {
          triggerGamification('deepWorkMinutes', {
            count: minutes,
            xpOverride: xpEarned,
            module: 'productivity'
          });
        } else {
          // Regular session - still give XP
          triggerGamification('pomodoroCompleted', {
            xpOverride: xpEarned,
            module: 'productivity'
          });
        }

        set({
          sessions: [completedSession, ...sessions],
          activeSession: null,
          sessionTimer: 0,
          timerInterval: null,
        });

        // Sync session to Supabase
        syncSessionToSupabase(completedSession);
      },

      cancelSession: () => {
        const { timerInterval } = get();
        if (timerInterval) {
          clearInterval(timerInterval);
        }
        set({
          activeSession: null,
          sessionTimer: 0,
          timerInterval: null,
        });
      },

      deleteSession: (sessionId) => {
        const sessionToDelete = get().sessions.find(s => s.id === sessionId);
        set((state) => ({
          sessions: state.sessions.filter((s) => s.id !== sessionId),
        }));
        if (sessionToDelete) {
          syncSessionToSupabase(sessionToDelete, 'delete');
        }
      },

      // ============================================================
      // PROJECT ACTIONS
      // ============================================================

      addProject: (project) => {
        const newProject = {
          id: crypto.randomUUID(),
          ...project,
          totalTimeSpent: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({
          projects: [newProject, ...state.projects],
        }));
        syncProjectToSupabase(newProject);
        // Award XP for creating a new project
        triggerGamification('projectCreated', { xpOverride: 15, module: 'productivity' });
        // Return the new project ID so callers can use it for initial tasks
        return newProject.id;
      },

      updateProject: (projectId, updates) => {
        // Check if project is being marked as completed
        const previousProject = get().projects.find(p => p.id === projectId);
        const isBeingCompleted = updates.status === 'completed' && previousProject?.status !== 'completed';

        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId
              ? { ...p, ...updates, updatedAt: new Date().toISOString() }
              : p
          ),
        }));
        const updatedProject = get().projects.find(p => p.id === projectId);
        if (updatedProject) {
          syncProjectToSupabase(updatedProject);
        }

        // Award XP when project is marked as completed
        if (isBeingCompleted) {
          triggerGamification('projectCompleted', { xpOverride: 50, module: 'productivity' });
        }
      },

      deleteProject: (projectId) => {
        const projectToDelete = get().projects.find(p => p.id === projectId);
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== projectId),
        }));
        if (projectToDelete) {
          syncProjectToSupabase(projectToDelete, 'delete');
        }
      },

      // ============================================================
      // TASK ACTIONS
      // ============================================================

      addTask: (task) => {
        const newTask = {
          id: crypto.randomUUID(),
          ...task,
          status: task.status || 'pending',
          completedAt: null,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          tasks: [newTask, ...state.tasks],
        }));
        syncTaskToSupabase(newTask);
      },

      updateTask: (taskId, updates) => {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId ? { ...t, ...updates } : t
          ),
        }));
        const updatedTask = get().tasks.find(t => t.id === taskId);
        if (updatedTask) {
          syncTaskToSupabase(updatedTask);
        }
      },

      toggleTaskComplete: (taskId) => {
        const { tasks } = get();
        const task = tasks.find((t) => t.id === taskId);

        if (task) {
          const wasCompleted = task.status === 'completed';
          const nowCompleted = !wasCompleted;

          // Award XP when completing a task (not when uncompleting)
          if (nowCompleted) {
            // Base XP by priority: High = 30, Medium = 20, Low = 15
            const xpByPriority = { high: 30, medium: 20, low: 15 };
            const xpEarned = xpByPriority[task.priority] || 20;

            // Trigger unified gamification (XP + achievement stats + pet/equipment unlocks)
            triggerGamification('taskCompleted', {
              xpOverride: xpEarned,
              module: 'productivity'
            });
          }
        }

        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  status: t.status === 'completed' ? 'active' : 'completed',
                  completedAt:
                    t.status === 'completed' ? null : new Date().toISOString(),
                }
              : t
          ),
        }));
        const updatedTask = get().tasks.find(t => t.id === taskId);
        if (updatedTask) {
          syncTaskToSupabase(updatedTask);
        }
      },

      deleteTask: (taskId) => {
        const taskToDelete = get().tasks.find(t => t.id === taskId);
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== taskId),
        }));
        if (taskToDelete) {
          syncTaskToSupabase(taskToDelete, 'delete');
        }
      },

      // ============================================================
      // SUBTASK ACTIONS
      // ============================================================

      // Add a subtask to a parent task
      addSubtask: (parentTaskId, subtask) => {
        const { tasks } = get();
        const parentTask = tasks.find(t => t.id === parentTaskId);
        if (!parentTask) return null;

        // Count existing subtasks to set order
        const existingSubtasks = tasks.filter(t => t.parentTaskId === parentTaskId);
        const subtaskOrder = existingSubtasks.length;

        const newSubtask = {
          id: crypto.randomUUID(),
          title: subtask.title,
          description: subtask.description || '',
          projectId: parentTask.projectId, // Inherit parent's project
          status: 'pending',
          priority: subtask.priority || parentTask.priority, // Default to parent's priority
          dueDate: subtask.dueDate || null,
          completedAt: null,
          tags: subtask.tags || [],
          estimatedTime: subtask.estimatedTime || 1800, // 30 min default
          parentTaskId: parentTaskId,
          subtaskOrder: subtaskOrder,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          tasks: [newSubtask, ...state.tasks],
        }));

        syncTaskToSupabase(newSubtask);
        return newSubtask.id;
      },

      // Get subtasks for a parent task
      getSubtasks: (parentTaskId) => {
        const { tasks } = get();
        return tasks
          .filter(t => t.parentTaskId === parentTaskId)
          .sort((a, b) => a.subtaskOrder - b.subtaskOrder);
      },

      // Get subtask completion stats for a parent task
      getSubtaskStats: (parentTaskId) => {
        const subtasks = get().getSubtasks(parentTaskId);
        const total = subtasks.length;
        const completed = subtasks.filter(s => s.status === 'completed').length;
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

        return { total, completed, percentage };
      },

      // Toggle subtask completion
      toggleSubtaskComplete: (subtaskId) => {
        const { tasks } = get();
        const subtask = tasks.find(t => t.id === subtaskId);

        if (subtask && subtask.parentTaskId) {
          const wasCompleted = subtask.status === 'completed';
          const nowCompleted = !wasCompleted;

          // Award XP when completing a subtask (half of regular task XP)
          if (nowCompleted) {
            const xpByPriority = { high: 15, medium: 10, low: 8 };
            const xpEarned = xpByPriority[subtask.priority] || 10;

            triggerGamification('taskCompleted', {
              xpOverride: xpEarned,
              module: 'productivity'
            });
          }
        }

        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === subtaskId
              ? {
                  ...t,
                  status: t.status === 'completed' ? 'pending' : 'completed',
                  completedAt:
                    t.status === 'completed' ? null : new Date().toISOString(),
                }
              : t
          ),
        }));

        const updatedSubtask = get().tasks.find(t => t.id === subtaskId);
        if (updatedSubtask) {
          syncTaskToSupabase(updatedSubtask);
        }
      },

      // Delete a subtask
      deleteSubtask: (subtaskId) => {
        const subtaskToDelete = get().tasks.find(t => t.id === subtaskId);
        if (!subtaskToDelete) return;

        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== subtaskId),
        }));

        syncTaskToSupabase(subtaskToDelete, 'delete');
      },

      // Get top-level tasks only (excluding subtasks)
      getTopLevelTasks: () => {
        const { tasks } = get();
        return tasks.filter(t => !t.parentTaskId);
      },

      // ============================================================
      // INCOME ACTIONS
      // ============================================================

      addIncomeTransaction: (transaction) => {
        const newTransaction = {
          id: crypto.randomUUID(),
          ...transaction,
          effectiveRate: transaction.hoursWorked
            ? (transaction.amount / transaction.hoursWorked).toFixed(2)
            : 0,
        };
        set((state) => ({
          incomeTransactions: [newTransaction, ...state.incomeTransactions],
        }));
        syncIncomeToSupabase(newTransaction);

        // Award XP for logging income
        triggerGamification('incomeLogged', { xpOverride: 10, module: 'productivity' });
      },

      updateIncomeTransaction: (transactionId, updates) => {
        set((state) => ({
          incomeTransactions: state.incomeTransactions.map((t) =>
            t.id === transactionId
              ? {
                  ...t,
                  ...updates,
                  effectiveRate:
                    updates.hoursWorked && updates.amount
                      ? (updates.amount / updates.hoursWorked).toFixed(2)
                      : t.effectiveRate,
                }
              : t
          ),
        }));
        const updatedIncome = get().incomeTransactions.find(t => t.id === transactionId);
        if (updatedIncome) {
          syncIncomeToSupabase(updatedIncome);
        }
      },

      deleteIncomeTransaction: (transactionId) => {
        const incomeToDelete = get().incomeTransactions.find(t => t.id === transactionId);
        set((state) => ({
          incomeTransactions: state.incomeTransactions.filter(
            (t) => t.id !== transactionId
          ),
        }));
        if (incomeToDelete) {
          syncIncomeToSupabase(incomeToDelete, 'delete');
        }
      },

      // ============================================================
      // COMPUTED/GETTER FUNCTIONS
      // ============================================================

      getTasksByProject: (projectId) => {
        const { tasks } = get();
        // Return only top-level tasks for the project (subtasks shown under their parent)
        return tasks.filter((t) => t.projectId === projectId && !t.parentTaskId);
      },

      getSessionsByProject: (projectId) => {
        const { sessions } = get();
        return sessions.filter((s) => s.projectId === projectId);
      },

      getIncomeByProject: (projectId) => {
        const { incomeTransactions } = get();
        return incomeTransactions
          .filter((t) => t.projectId === projectId)
          .reduce((sum, t) => sum + t.amount, 0);
      },

      getProjectStats: (projectId) => {
        const { getTasksByProject, getSessionsByProject, getIncomeByProject, projects } = get();
        const project = projects.find((p) => p.id === projectId);
        const tasks = getTasksByProject(projectId);
        const sessions = getSessionsByProject(projectId);
        const income = getIncomeByProject(projectId);

        return {
          project,
          totalTasks: tasks.length,
          completedTasks: tasks.filter((t) => t.status === 'completed').length,
          activeTasks: tasks.filter((t) => t.status === 'active').length,
          totalSessions: sessions.length,
          totalTime: project?.totalTimeSpent || 0,
          totalIncome: income,
          avgFocusQuality:
            sessions.length > 0
              ? (
                  sessions.reduce((sum, s) => sum + (s.focusQuality || 0), 0) /
                  sessions.length
                ).toFixed(1)
              : 0,
        };
      },

      getTodayStats: () => {
        const { sessions, tasks } = get();
        const today = new Date().toISOString().split('T')[0];

        const todaySessions = sessions.filter(
          (s) => s.startTime && s.startTime.startsWith(today)
        );

        const todayTasks = tasks.filter(
          (t) =>
            t.completedAt && t.completedAt.startsWith(today)
        );

        const totalTime = todaySessions.reduce((sum, s) => sum + s.duration, 0);
        const avgFocus =
          todaySessions.length > 0
            ? (
                todaySessions.reduce((sum, s) => sum + (s.focusQuality || 0), 0) /
                todaySessions.length
              ).toFixed(1)
            : 0;

        return {
          sessionsCount: todaySessions.length,
          totalTime,
          totalTimeFormatted: `${(totalTime / 3600).toFixed(1)}h`,
          tasksCompleted: todayTasks.length,
          avgFocusQuality: avgFocus,
        };
      },

      getWeeklyStats: () => {
        const { sessions, incomeTransactions } = get();
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

        const weeklySessions = sessions.filter((s) => s.startTime >= weekAgo);
        const weeklyIncome = incomeTransactions.filter((t) => {
          const transactionDate = new Date(t.date).toISOString();
          return transactionDate >= weekAgo;
        });

        const totalTime = weeklySessions.reduce((sum, s) => sum + s.duration, 0);
        const totalIncome = weeklyIncome.reduce((sum, t) => sum + t.amount, 0);

        return {
          sessionsCount: weeklySessions.length,
          totalTime,
          totalTimeFormatted: `${(totalTime / 3600).toFixed(1)}h`,
          totalIncome,
          avgFocusQuality:
            weeklySessions.length > 0
              ? (
                  weeklySessions.reduce((sum, s) => sum + (s.focusQuality || 0), 0) /
                  weeklySessions.length
                ).toFixed(1)
              : 0,
        };
      },
    }),
    {
      name: 'productivity-storage',
      partialize: (state) => ({
        // Exclude timerInterval from persistence (can't serialize interval IDs)
        ...state,
        timerInterval: null,
      }),
      onRehydrateStorage: () => (state) => {
        // Restart timer if there's an active session after rehydration
        if (state?.activeSession && !state.timerInterval) {
          // Calculate elapsed time since session started
          const startTime = new Date(state.activeSession.startTime).getTime();
          const now = Date.now();
          const elapsedSeconds = Math.floor((now - startTime) / 1000);

          // Update sessionTimer with correct elapsed time
          state.sessionTimer = elapsedSeconds;

          // Restart the interval
          const interval = setInterval(() => {
            useProductivityStore.setState((s) => ({
              sessionTimer: s.sessionTimer + 1,
            }));
          }, 1000);

          state.timerInterval = interval;
          console.log('[ProductivityStore] Restarted timer for active session, elapsed:', elapsedSeconds);
        }
      },
    }
  )
);

// Initialize function for App.jsx
export const initializeProductivityStore = async () => {
  return useProductivityStore.getState().initializeFromSupabase();
};

export default useProductivityStore;
