import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useAvatarStore } from './avatarStore';

/**
 * Productivity Store
 * Manages work sessions, projects, tasks, and business income
 */

const useProductivityStore = create(
  persist(
    (set, get) => ({
      // ============================================================
      // WORK SESSIONS STATE
      // ============================================================
      sessions: [
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
          id: `session-${Date.now()}`,
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
        }

        // Award XP based on session duration and focus quality
        // Base XP: 1 XP per minute worked
        // Quality multiplier: focusQuality/10 (0.1 to 1.0)
        // Session type bonus: Deep Work gets 1.5x multiplier
        const minutes = Math.floor(sessionTimer / 60);
        let xpEarned = minutes;

        // Apply focus quality multiplier
        const qualityMultiplier = focusQuality / 10;
        xpEarned = Math.floor(xpEarned * qualityMultiplier);

        // Apply session type bonus
        if (activeSession.type === 'deep-work') {
          xpEarned = Math.floor(xpEarned * 1.5);
        } else if (activeSession.type === 'learning') {
          xpEarned = Math.floor(xpEarned * 1.3);
        }

        // Minimum 1 XP for completing any session
        xpEarned = Math.max(1, xpEarned);

        // Add XP to avatar
        const avatarStore = useAvatarStore.getState();
        avatarStore.addXP(xpEarned);
        avatarStore.updateModuleProgress('productivity', { sessionsCompleted: 1 });

        set({
          sessions: [completedSession, ...sessions],
          activeSession: null,
          sessionTimer: 0,
          timerInterval: null,
        });
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
        set((state) => ({
          sessions: state.sessions.filter((s) => s.id !== sessionId),
        }));
      },

      // ============================================================
      // PROJECT ACTIONS
      // ============================================================

      addProject: (project) => {
        const newProject = {
          id: `proj-${Date.now()}`,
          ...project,
          totalTimeSpent: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({
          projects: [newProject, ...state.projects],
        }));
      },

      updateProject: (projectId, updates) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId
              ? { ...p, ...updates, updatedAt: new Date().toISOString() }
              : p
          ),
        }));
      },

      deleteProject: (projectId) => {
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== projectId),
        }));
      },

      // ============================================================
      // TASK ACTIONS
      // ============================================================

      addTask: (task) => {
        const newTask = {
          id: `task-${Date.now()}`,
          ...task,
          status: task.status || 'pending',
          completedAt: null,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          tasks: [newTask, ...state.tasks],
        }));
      },

      updateTask: (taskId, updates) => {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId ? { ...t, ...updates } : t
          ),
        }));
      },

      toggleTaskComplete: (taskId) => {
        const { tasks } = get();
        const task = tasks.find((t) => t.id === taskId);

        if (task) {
          const wasCompleted = task.status === 'completed';
          const nowCompleted = !wasCompleted;

          // Award XP when completing a task (not when uncompleting)
          if (nowCompleted) {
            // Base XP by priority: High = 15, Medium = 10, Low = 5
            let xpEarned = task.priority === 'high' ? 15 : task.priority === 'medium' ? 10 : 5;

            // Add XP to avatar
            const avatarStore = useAvatarStore.getState();
            avatarStore.addXP(xpEarned);
            avatarStore.updateModuleProgress('productivity', { tasksCompleted: 1 });
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
      },

      deleteTask: (taskId) => {
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== taskId),
        }));
      },

      // ============================================================
      // INCOME ACTIONS
      // ============================================================

      addIncomeTransaction: (transaction) => {
        const newTransaction = {
          id: `income-${Date.now()}`,
          ...transaction,
          effectiveRate: transaction.hoursWorked
            ? (transaction.amount / transaction.hoursWorked).toFixed(2)
            : 0,
        };
        set((state) => ({
          incomeTransactions: [newTransaction, ...state.incomeTransactions],
        }));
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
      },

      deleteIncomeTransaction: (transactionId) => {
        set((state) => ({
          incomeTransactions: state.incomeTransactions.filter(
            (t) => t.id !== transactionId
          ),
        }));
      },

      // ============================================================
      // COMPUTED/GETTER FUNCTIONS
      // ============================================================

      getTasksByProject: (projectId) => {
        const { tasks } = get();
        return tasks.filter((t) => t.projectId === projectId);
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
    }
  )
);

export default useProductivityStore;
