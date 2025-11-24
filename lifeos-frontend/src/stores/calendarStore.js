/**
 * Calendar & Time Blocking Store - Zustand
 * Manages time blocks, events, energy tracking, and planned vs actual time
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCalendarStore = create(
  persist(
    (set, get) => ({
      // ============================================
      // DATA STATE
      // ============================================
      timeBlocks: [],
      events: [],
      templates: [],
      weeklyPlan: null,

      // Settings
      workHoursStart: 6,   // 6am
      workHoursEnd: 23,    // 11pm
      bufferPercentage: 20, // 20% buffer time recommended

      // ============================================
      // TIME BLOCK ACTIONS
      // ============================================

      /**
       * Create a new time block
       */
      createTimeBlock: (blockData) => {
        const newBlock = {
          id: `block-${Date.now()}`,
          title: blockData.title || 'Untitled Block',
          date: blockData.date || new Date().toISOString().split('T')[0],
          startTime: blockData.startTime, // '09:00'
          endTime: blockData.endTime,     // '11:00'
          plannedDuration: blockData.plannedDuration || 60, // minutes
          actualDuration: null,
          module: blockData.module || 'productivity', // links to Quanta modules
          type: blockData.type || 'deep_work', // deep_work, shallow, meeting, break, etc.
          status: blockData.status || 'planned', // planned, in_progress, completed, cancelled
          priority: blockData.priority || 'medium', // critical, high, medium, low
          energyLevel: blockData.energyLevel || 'medium', // high, medium, low
          actualEnergyLevel: null,
          notes: blockData.notes || '',
          taskId: blockData.taskId || null, // Link to task from productivity module
          projectId: blockData.projectId || null, // Link to project
          tags: blockData.tags || [],
          interruptions: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          timeBlocks: [...state.timeBlocks, newBlock],
        }));

        return newBlock.id;
      },

      /**
       * Update a time block
       */
      updateTimeBlock: (blockId, updates) => {
        set((state) => ({
          timeBlocks: state.timeBlocks.map((block) =>
            block.id === blockId
              ? {
                  ...block,
                  ...updates,
                  updatedAt: new Date().toISOString(),
                }
              : block
          ),
        }));
      },

      /**
       * Delete a time block
       */
      deleteTimeBlock: (blockId) => {
        set((state) => ({
          timeBlocks: state.timeBlocks.filter((block) => block.id !== blockId),
        }));
      },

      /**
       * Start a time block (actual execution)
       */
      startTimeBlock: (blockId) => {
        set((state) => ({
          timeBlocks: state.timeBlocks.map((block) =>
            block.id === blockId
              ? {
                  ...block,
                  status: 'in_progress',
                  actualStartTime: new Date().toISOString(),
                }
              : block
          ),
        }));
      },

      /**
       * Complete a time block and record actual time
       */
      completeTimeBlock: (blockId, actualData = {}) => {
        const now = new Date().toISOString();

        set((state) => ({
          timeBlocks: state.timeBlocks.map((block) => {
            if (block.id === blockId) {
              const actualStart = block.actualStartTime ? new Date(block.actualStartTime) : new Date(now);
              const actualEnd = new Date(now);
              const actualDuration = Math.round((actualEnd - actualStart) / 60000); // minutes

              return {
                ...block,
                status: 'completed',
                actualEndTime: now,
                actualDuration,
                actualEnergyLevel: actualData.energyLevel || null,
                notes: actualData.notes ? `${block.notes}\n\n${actualData.notes}` : block.notes,
                completedAt: now,
              };
            }
            return block;
          }),
        }));
      },

      /**
       * Log an interruption
       */
      logInterruption: (blockId, interruption) => {
        set((state) => ({
          timeBlocks: state.timeBlocks.map((block) => {
            if (block.id === blockId) {
              const newInterruption = {
                id: `int-${Date.now()}`,
                source: interruption.source, // 'person', 'notification', 'email', etc.
                duration: interruption.duration, // minutes
                urgent: interruption.urgent || false,
                timestamp: new Date().toISOString(),
              };

              return {
                ...block,
                interruptions: [...block.interruptions, newInterruption],
              };
            }
            return block;
          }),
        }));
      },

      /**
       * Move a time block to a new time
       */
      moveTimeBlock: (blockId, newDate, newStartTime, newEndTime) => {
        set((state) => ({
          timeBlocks: state.timeBlocks.map((block) =>
            block.id === blockId
              ? {
                  ...block,
                  date: newDate,
                  startTime: newStartTime,
                  endTime: newEndTime,
                  updatedAt: new Date().toISOString(),
                }
              : block
          ),
        }));
      },

      // ============================================
      // TEMPLATE ACTIONS
      // ============================================

      /**
       * Create a reusable template
       */
      createTemplate: (templateData) => {
        const newTemplate = {
          id: `template-${Date.now()}`,
          name: templateData.name,
          blocks: templateData.blocks, // Array of block configs
          recurrence: templateData.recurrence || 'none', // daily, weekly, none
          active: true,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          templates: [...state.templates, newTemplate],
        }));

        return newTemplate.id;
      },

      /**
       * Apply a template to create blocks
       */
      applyTemplate: (templateId, targetDate) => {
        const template = get().templates.find((t) => t.id === templateId);
        if (!template) return;

        template.blocks.forEach((blockConfig) => {
          get().createTimeBlock({
            ...blockConfig,
            date: targetDate,
          });
        });
      },

      // ============================================
      // ANALYTICS & INSIGHTS
      // ============================================

      /**
       * Get time blocks for a specific date
       */
      getBlocksForDate: (date) => {
        return get().timeBlocks.filter((block) => block.date === date);
      },

      /**
       * Get time blocks for a date range
       */
      getBlocksForDateRange: (startDate, endDate) => {
        const start = new Date(startDate);
        const end = new Date(endDate);

        return get().timeBlocks.filter((block) => {
          const blockDate = new Date(block.date);
          return blockDate >= start && blockDate <= end;
        });
      },

      /**
       * Calculate planned time for a date
       */
      getPlannedTimeForDate: (date) => {
        const blocks = get().getBlocksForDate(date);
        return blocks.reduce((total, block) => total + block.plannedDuration, 0);
      },

      /**
       * Calculate actual time for a date
       */
      getActualTimeForDate: (date) => {
        const blocks = get().getBlocksForDate(date);
        return blocks
          .filter((block) => block.actualDuration)
          .reduce((total, block) => total + block.actualDuration, 0);
      },

      /**
       * Get buffer percentage for a date
       */
      getBufferPercentage: (date) => {
        const blocks = get().getBlocksForDate(date);
        const plannedMinutes = blocks.reduce((total, block) => total + block.plannedDuration, 0);
        const workMinutes = (get().workHoursEnd - get().workHoursStart) * 60;
        const bufferMinutes = workMinutes - plannedMinutes;
        return (bufferMinutes / workMinutes) * 100;
      },

      /**
       * Calculate planning accuracy (planned vs actual)
       */
      getPlanningAccuracy: () => {
        const completedBlocks = get().timeBlocks.filter(
          (block) => block.status === 'completed' && block.actualDuration
        );

        if (completedBlocks.length === 0) return { ratio: 1, count: 0 };

        const totalPlanned = completedBlocks.reduce((sum, block) => sum + block.plannedDuration, 0);
        const totalActual = completedBlocks.reduce((sum, block) => sum + block.actualDuration, 0);

        return {
          ratio: totalActual / totalPlanned,
          count: completedBlocks.length,
          avgDifference: (totalActual - totalPlanned) / completedBlocks.length,
        };
      },

      /**
       * Get energy patterns
       */
      getEnergyPatterns: () => {
        const completedBlocks = get().timeBlocks.filter(
          (block) => block.status === 'completed' && block.actualEnergyLevel
        );

        // Group by hour of day
        const hourlyEnergy = {};

        completedBlocks.forEach((block) => {
          const hour = parseInt(block.startTime.split(':')[0]);
          if (!hourlyEnergy[hour]) {
            hourlyEnergy[hour] = { high: 0, medium: 0, low: 0, total: 0 };
          }
          hourlyEnergy[hour][block.actualEnergyLevel]++;
          hourlyEnergy[hour].total++;
        });

        return hourlyEnergy;
      },

      // ============================================
      // UTILITY GETTERS
      // ============================================

      /**
       * Get time block by ID
       */
      getBlockById: (blockId) => {
        return get().timeBlocks.find((block) => block.id === blockId);
      },

      /**
       * Get today's blocks
       */
      getTodaysBlocks: () => {
        const today = new Date().toISOString().split('T')[0];
        return get().getBlocksForDate(today);
      },

      /**
       * Get this week's blocks
       */
      getThisWeeksBlocks: () => {
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay() + 1); // Monday
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);

        return get().getBlocksForDateRange(
          startOfWeek.toISOString().split('T')[0],
          endOfWeek.toISOString().split('T')[0]
        );
      },
    }),
    {
      name: 'lifeos-calendar', // localStorage key
      partialize: (state) => ({
        // Persist everything except derived state
        timeBlocks: state.timeBlocks,
        events: state.events,
        templates: state.templates,
        weeklyPlan: state.weeklyPlan,
        workHoursStart: state.workHoursStart,
        workHoursEnd: state.workHoursEnd,
        bufferPercentage: state.bufferPercentage,
      }),
    }
  )
);
