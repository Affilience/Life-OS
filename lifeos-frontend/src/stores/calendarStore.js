/**
 * Calendar & Time Blocking Store - Zustand
 * Manages time blocks, events, energy tracking, and planned vs actual time
 * Hybrid pattern: optimistic local updates + async Supabase sync
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase, getCurrentUserId } from '../lib/supabase';
import { triggerGamification } from '../hooks/useGamification';

// ============================================
// SUPABASE SYNC HELPERS
// ============================================

// Initialize store from Supabase
const initializeFromSupabase = async (set, get) => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return;

    // Load time blocks (limit to last 90 days worth, ~300 blocks)
    const { data: timeBlocks, error: blocksError } = await supabase
      .from('calendar_time_blocks')
      .select('*')
      .eq('user_id', userId)
      .order('block_date', { ascending: false })
      .limit(300);

    if (blocksError) throw blocksError;

    // Load events (limit to 500 most recent)
    const { data: events, error: eventsError } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('user_id', userId)
      .order('start_time', { ascending: false })
      .limit(500);

    if (eventsError) throw eventsError;

    // Load templates
    const { data: templates, error: templatesError } = await supabase
      .from('calendar_templates')
      .select('*')
      .eq('user_id', userId)
      .eq('active', true);

    if (templatesError) throw templatesError;

    // Load calendar settings from user_profiles
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('calendar_settings')
      .eq('id', userId)
      .maybeSingle();

    // Transform data to match store format
    const transformedBlocks = timeBlocks?.map(b => ({
      id: b.id,
      title: b.title || 'Untitled Block',
      date: b.block_date,
      startTime: b.planned_start,
      endTime: b.planned_end,
      plannedDuration: b.planned_duration || 60,
      actualDuration: b.actual_duration,
      module: b.module || 'productivity',
      type: b.block_type || 'deep_work',
      status: b.status || 'planned',
      priority: b.priority || 'medium',
      energyLevel: b.energy_level || 'medium',
      actualEnergyLevel: b.actual_energy_level,
      notes: b.notes || '',
      taskId: b.task_id,
      projectId: b.project_id,
      tags: b.tags || [],
      interruptions: b.interruptions || [],
      actualStartTime: b.actual_start_time,
      actualEndTime: b.actual_end_time,
      completedAt: b.completed_at,
      createdAt: b.created_at,
      updatedAt: b.updated_at,
    })) || [];

    const transformedEvents = events?.map(e => ({
      id: e.id,
      title: e.title,
      description: e.description,
      type: e.event_type,
      startTime: e.start_time,
      endTime: e.end_time,
      allDay: e.all_day,
      recurrenceRule: e.recurrence_rule,
      location: e.location,
      attendees: e.attendees || [],
      color: e.color,
      tags: e.tags || [],
      createdAt: e.created_at,
    })) || [];

    const transformedTemplates = templates?.map(t => ({
      id: t.id,
      name: t.name,
      blocks: t.blocks || [],
      recurrence: t.recurrence || 'none',
      active: t.active,
      createdAt: t.created_at,
    })) || [];

    const settings = profile?.calendar_settings || {};

    // Update store with data from Supabase (only if we have data)
    const updates = {};
    if (transformedBlocks.length > 0) updates.timeBlocks = transformedBlocks;
    if (transformedEvents.length > 0) updates.events = transformedEvents;
    if (transformedTemplates.length > 0) updates.templates = transformedTemplates;
    if (settings.workHoursStart) updates.workHoursStart = settings.workHoursStart;
    if (settings.workHoursEnd) updates.workHoursEnd = settings.workHoursEnd;
    if (settings.bufferPercentage) updates.bufferPercentage = settings.bufferPercentage;

    if (Object.keys(updates).length > 0) {
      set(updates);
    }

    console.log('Calendar store initialized from Supabase');
  } catch (error) {
    console.error('Error initializing calendar store from Supabase:', error);
  }
};

// Sync time block to Supabase
const syncTimeBlockToSupabase = async (block, action = 'upsert') => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return;

    if (action === 'delete') {
      await supabase
        .from('calendar_time_blocks')
        .delete()
        .eq('id', block.id)
        .eq('user_id', userId);
    } else {
      await supabase
        .from('calendar_time_blocks')
        .upsert({
          id: block.id,
          user_id: userId,
          title: block.title,
          block_date: block.date,
          planned_start: block.startTime,
          planned_end: block.endTime,
          planned_duration: block.plannedDuration,
          actual_duration: block.actualDuration,
          module: block.module,
          block_type: block.type,
          status: block.status,
          priority: block.priority,
          energy_level: block.energyLevel,
          actual_energy_level: block.actualEnergyLevel,
          notes: block.notes,
          task_id: block.taskId,
          project_id: block.projectId,
          tags: block.tags || [],
          interruptions: block.interruptions || [],
          actual_start_time: block.actualStartTime,
          actual_end_time: block.actualEndTime,
          completed_at: block.completedAt,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' });
    }
  } catch (error) {
    console.error('Error syncing time block to Supabase:', error);
  }
};

// Sync template to Supabase
const syncTemplateToSupabase = async (template, action = 'upsert') => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return;

    if (action === 'delete') {
      await supabase
        .from('calendar_templates')
        .update({ active: false, updated_at: new Date().toISOString() })
        .eq('id', template.id)
        .eq('user_id', userId);
    } else {
      await supabase
        .from('calendar_templates')
        .upsert({
          id: template.id,
          user_id: userId,
          name: template.name,
          blocks: template.blocks || [],
          recurrence: template.recurrence || 'none',
          active: template.active !== false,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' });
    }
  } catch (error) {
    console.error('Error syncing template to Supabase:', error);
  }
};

// Sync calendar settings to user_profiles
const syncSettingsToSupabase = async (settings) => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return;

    await supabase
      .from('user_profiles')
      .update({
        calendar_settings: settings,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);
  } catch (error) {
    console.error('Error syncing calendar settings to Supabase:', error);
  }
};

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

      // Initialize from Supabase
      initializeFromSupabase: () => initializeFromSupabase(set, get),

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
        // Sync to Supabase
        syncTimeBlockToSupabase(newBlock);

        // Award XP for scheduling a time block
        triggerGamification('eventCreated', { xpOverride: 5, module: 'calendar' });

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
        // Sync to Supabase
        const block = get().timeBlocks.find(b => b.id === blockId);
        if (block) syncTimeBlockToSupabase(block);
      },

      /**
       * Delete a time block
       */
      deleteTimeBlock: (blockId) => {
        const block = get().timeBlocks.find(b => b.id === blockId);
        set((state) => ({
          timeBlocks: state.timeBlocks.filter((block) => block.id !== blockId),
        }));
        // Sync to Supabase
        if (block) syncTimeBlockToSupabase(block, 'delete');
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
        // Sync to Supabase
        const block = get().timeBlocks.find(b => b.id === blockId);
        if (block) syncTimeBlockToSupabase(block);
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
        // Sync to Supabase
        const block = get().timeBlocks.find(b => b.id === blockId);
        if (block) {
          syncTimeBlockToSupabase(block);

          // Award XP for completing a time block
          // Base XP is 15, with bonus for longer sessions
          const durationBonus = Math.floor((block.actualDuration || block.plannedDuration || 30) / 30) * 5;
          const xpAmount = Math.min(15 + durationBonus, 40); // Cap at 40 XP
          triggerGamification('timeBlockCompleted', { xpOverride: xpAmount, module: 'calendar' });
        }
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
        // Sync to Supabase
        const block = get().timeBlocks.find(b => b.id === blockId);
        if (block) syncTimeBlockToSupabase(block);
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
        // Sync to Supabase
        const block = get().timeBlocks.find(b => b.id === blockId);
        if (block) syncTimeBlockToSupabase(block);
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
        // Sync to Supabase
        syncTemplateToSupabase(newTemplate);

        return newTemplate.id;
      },

      /**
       * Delete a template
       */
      deleteTemplate: (templateId) => {
        const template = get().templates.find(t => t.id === templateId);
        set((state) => ({
          templates: state.templates.filter((t) => t.id !== templateId),
        }));
        // Sync to Supabase
        if (template) syncTemplateToSupabase(template, 'delete');
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

// Initialize calendar store from Supabase
export const initializeCalendarStore = async () => {
  const store = useCalendarStore.getState();
  await store.initializeFromSupabase();
};
