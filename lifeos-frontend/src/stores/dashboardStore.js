import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase, getCurrentUserId } from '../lib/supabase';

// Sync dashboard settings to Supabase
const syncDashboardToSupabase = async (settings) => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return;

    // Get existing preferences first
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('preferences')
      .eq('id', userId)
      .maybeSingle();

    const { error } = await supabase
      .from('user_profiles')
      .update({
        preferences: {
          ...(existingProfile?.preferences || {}),
          dashboard: settings
        }
      })
      .eq('id', userId);

    if (error) throw error;
  } catch (error) {
    console.error('Error syncing dashboard to Supabase:', error);
  }
};

// Helper function to compact layouts (remove gaps)
function compactLayout(layout, cols) {
  // Sort items by y then x
  const sorted = [...layout].sort((a, b) => a.y - b.y || a.x - b.x);
  const compacted = [];
  const occupied = new Map(); // Map of "x,y" -> true for occupied cells

  // Helper to check if a position is valid
  const canPlace = (item, x, y) => {
    if (x + item.w > cols) return false;
    for (let dx = 0; dx < item.w; dx++) {
      for (let dy = 0; dy < item.h; dy++) {
        if (occupied.has(`${x + dx},${y + dy}`)) return false;
      }
    }
    return true;
  };

  // Helper to mark cells as occupied
  const markOccupied = (item, x, y) => {
    for (let dx = 0; dx < item.w; dx++) {
      for (let dy = 0; dy < item.h; dy++) {
        occupied.set(`${x + dx},${y + dy}`, true);
      }
    }
  };

  // Find the first valid position for each item
  const findPosition = (item) => {
    for (let y = 0; y < 100; y++) {
      for (let x = 0; x <= cols - item.w; x++) {
        if (canPlace(item, x, y)) {
          return { x, y };
        }
      }
    }
    return { x: 0, y: 0 }; // Fallback
  };

  // Place each item at the first available position
  for (const item of sorted) {
    const pos = findPosition(item);
    const compactedItem = { ...item, x: pos.x, y: pos.y };
    markOccupied(item, pos.x, pos.y);
    compacted.push(compactedItem);
  }

  return compacted;
}

// Helper to find optimal position for a new widget
function findOptimalPosition(layout, widget, cols) {
  const w = Math.min(widget.minW || 2, cols);
  const h = widget.minH || 2;
  const occupied = new Map();

  // Mark all occupied cells
  for (const item of layout) {
    for (let dx = 0; dx < item.w; dx++) {
      for (let dy = 0; dy < item.h; dy++) {
        occupied.set(`${item.x + dx},${item.y + dy}`, true);
      }
    }
  }

  // Find the first position that fits
  const canPlace = (x, y) => {
    if (x + w > cols) return false;
    for (let dx = 0; dx < w; dx++) {
      for (let dy = 0; dy < h; dy++) {
        if (occupied.has(`${x + dx},${y + dy}`)) return false;
      }
    }
    return true;
  };

  // Search for first available position (row by row)
  for (let y = 0; y < 100; y++) {
    for (let x = 0; x <= cols - w; x++) {
      if (canPlace(x, y)) {
        return { x, y, w, h };
      }
    }
  }

  // Fallback: place at bottom
  const maxY = layout.reduce((max, item) => Math.max(max, item.y + item.h), 0);
  return { x: 0, y: maxY, w, h };
}

// Define all available dashboard widgets with grid layout properties
export const DASHBOARD_WIDGETS = {
  heroSection: {
    id: 'heroSection',
    name: 'Avatar & Level',
    description: 'Your character, pet, and XP progress',
    icon: '🧙',
    defaultVisible: true,
    category: 'core',
    // Grid layout constraints
    minW: 2,
    minH: 2,
    maxH: 4,
  },
  todaysPlan: {
    id: 'todaysPlan',
    name: "Today's Plan",
    description: 'Daily tasks and progress ring',
    icon: '✅',
    defaultVisible: true,
    category: 'productivity',
    minW: 1,
    minH: 2,
    maxH: 6,
  },
  weeklyInsights: {
    id: 'weeklyInsights',
    name: 'Weekly Insights',
    description: 'XP, score, completion rate stats',
    icon: '📊',
    defaultVisible: true,
    category: 'analytics',
    minW: 2,
    minH: 2,
    maxH: 4,
  },
  moduleHealth: {
    id: 'moduleHealth',
    name: 'Module Health',
    description: 'Health scores for all 8 modules',
    icon: '⚡',
    defaultVisible: true,
    category: 'analytics',
    minW: 2,
    minH: 3,
    maxH: 6,
  },
  quickActions: {
    id: 'quickActions',
    name: 'Quick Actions',
    description: 'Fast entry buttons for each module',
    icon: '🚀',
    defaultVisible: false,
    category: 'productivity',
    minW: 1,
    minH: 2,
    maxH: 4,
  },
  streakStats: {
    id: 'streakStats',
    name: 'Streak & Credits',
    description: 'Your current streak and credit balance',
    icon: '🔥',
    defaultVisible: true,
    category: 'core',
    minW: 1,
    minH: 1,
    maxH: 2,
  },
  recentActivity: {
    id: 'recentActivity',
    name: 'Recent Activity',
    description: 'Timeline of your latest entries',
    icon: '📝',
    defaultVisible: false,
    category: 'analytics',
    minW: 2,
    minH: 2,
    maxH: 6,
  },
  financialSnapshot: {
    id: 'financialSnapshot',
    name: 'Financial Snapshot',
    description: 'Budget remaining and spending trends',
    icon: '💰',
    defaultVisible: false,
    category: 'finance',
    minW: 2,
    minH: 2,
    maxH: 4,
  },
  goalsProgress: {
    id: 'goalsProgress',
    name: 'Goals Progress',
    description: 'Active goals with progress bars',
    icon: '🎯',
    defaultVisible: false,
    category: 'productivity',
    minW: 2,
    minH: 2,
    maxH: 5,
  },
  dailyQuote: {
    id: 'dailyQuote',
    name: 'Daily Quote',
    description: 'Motivational quote of the day',
    icon: '💬',
    defaultVisible: false,
    category: 'wellness',
    minW: 2,
    minH: 1,
    maxH: 2,
  },
};

// Widget categories for organization in settings
export const WIDGET_CATEGORIES = {
  core: { name: 'Core', color: 'text-purple-400' },
  productivity: { name: 'Productivity', color: 'text-blue-400' },
  analytics: { name: 'Analytics', color: 'text-green-400' },
  finance: { name: 'Finance', color: 'text-yellow-400' },
  wellness: { name: 'Wellness', color: 'text-pink-400' },
};

// Default layouts for different breakpoints
// Grid has 4 columns on large screens, 2 on medium, 1 on small
const DEFAULT_LAYOUTS = {
  lg: [
    { i: 'streakStats', x: 0, y: 0, w: 2, h: 1 },
    { i: 'heroSection', x: 2, y: 0, w: 2, h: 2 },
    { i: 'todaysPlan', x: 0, y: 1, w: 2, h: 2 },
    { i: 'weeklyInsights', x: 2, y: 2, w: 2, h: 2 },
    { i: 'moduleHealth', x: 0, y: 3, w: 4, h: 3 },
  ],
  md: [
    { i: 'streakStats', x: 0, y: 0, w: 2, h: 1 },
    { i: 'heroSection', x: 0, y: 1, w: 2, h: 2 },
    { i: 'todaysPlan', x: 0, y: 3, w: 2, h: 2 },
    { i: 'weeklyInsights', x: 0, y: 5, w: 2, h: 2 },
    { i: 'moduleHealth', x: 0, y: 7, w: 2, h: 4 },
  ],
  sm: [
    { i: 'streakStats', x: 0, y: 0, w: 1, h: 1 },
    { i: 'heroSection', x: 0, y: 1, w: 1, h: 2 },
    { i: 'todaysPlan', x: 0, y: 3, w: 1, h: 2 },
    { i: 'weeklyInsights', x: 0, y: 5, w: 1, h: 3 },
    { i: 'moduleHealth', x: 0, y: 8, w: 1, h: 5 },
  ],
};

// Onboarding layout - optimised for the dashboard tour
// This layout ensures all tour-targeted elements are visible and well-positioned
const ONBOARDING_LAYOUTS = {
  lg: [
    { i: 'heroSection', x: 0, y: 0, w: 2, h: 2 },
    { i: 'streakStats', x: 2, y: 0, w: 2, h: 1 },
    { i: 'todaysPlan', x: 2, y: 1, w: 2, h: 2 },
    { i: 'weeklyInsights', x: 0, y: 2, w: 2, h: 2 },
    { i: 'moduleHealth', x: 0, y: 4, w: 4, h: 3 },
  ],
  md: [
    { i: 'heroSection', x: 0, y: 0, w: 2, h: 2 },
    { i: 'streakStats', x: 0, y: 2, w: 2, h: 1 },
    { i: 'todaysPlan', x: 0, y: 3, w: 2, h: 2 },
    { i: 'weeklyInsights', x: 0, y: 5, w: 2, h: 2 },
    { i: 'moduleHealth', x: 0, y: 7, w: 2, h: 4 },
  ],
  sm: [
    { i: 'heroSection', x: 0, y: 0, w: 1, h: 2 },
    { i: 'streakStats', x: 0, y: 2, w: 1, h: 1 },
    { i: 'todaysPlan', x: 0, y: 3, w: 1, h: 2 },
    { i: 'weeklyInsights', x: 0, y: 5, w: 1, h: 3 },
    { i: 'moduleHealth', x: 0, y: 8, w: 1, h: 5 },
  ],
};

// Preset layouts with grid configurations
export const DASHBOARD_PRESETS = {
  onboarding: {
    id: 'onboarding',
    name: 'New User Layout',
    description: 'Default layout for new users during onboarding tour',
    icon: '🚀',
    widgets: ['heroSection', 'streakStats', 'todaysPlan', 'weeklyInsights', 'moduleHealth'],
    layouts: ONBOARDING_LAYOUTS,
    isOnboarding: true, // Flag to identify this as the onboarding preset
  },
  full: {
    id: 'full',
    name: 'Full Overview',
    description: 'See everything at a glance',
    icon: '🌟',
    widgets: ['streakStats', 'heroSection', 'todaysPlan', 'weeklyInsights', 'moduleHealth'],
    layouts: DEFAULT_LAYOUTS,
  },
  focused: {
    id: 'focused',
    name: 'Focus Mode',
    description: 'Just tasks and progress',
    icon: '🎯',
    widgets: ['streakStats', 'heroSection', 'todaysPlan'],
    layouts: {
      lg: [
        { i: 'streakStats', x: 0, y: 0, w: 4, h: 1 },
        { i: 'heroSection', x: 0, y: 1, w: 2, h: 2 },
        { i: 'todaysPlan', x: 2, y: 1, w: 2, h: 2 },
      ],
      md: [
        { i: 'streakStats', x: 0, y: 0, w: 2, h: 1 },
        { i: 'heroSection', x: 0, y: 1, w: 2, h: 2 },
        { i: 'todaysPlan', x: 0, y: 3, w: 2, h: 2 },
      ],
      sm: [
        { i: 'streakStats', x: 0, y: 0, w: 1, h: 1 },
        { i: 'heroSection', x: 0, y: 1, w: 1, h: 2 },
        { i: 'todaysPlan', x: 0, y: 3, w: 1, h: 2 },
      ],
    },
  },
  minimal: {
    id: 'minimal',
    name: 'Minimal',
    description: 'Avatar and streak only',
    icon: '✨',
    widgets: ['streakStats', 'heroSection'],
    layouts: {
      lg: [
        { i: 'streakStats', x: 0, y: 0, w: 4, h: 1 },
        { i: 'heroSection', x: 0, y: 1, w: 4, h: 3 },
      ],
      md: [
        { i: 'streakStats', x: 0, y: 0, w: 2, h: 1 },
        { i: 'heroSection', x: 0, y: 1, w: 2, h: 3 },
      ],
      sm: [
        { i: 'streakStats', x: 0, y: 0, w: 1, h: 1 },
        { i: 'heroSection', x: 0, y: 1, w: 1, h: 3 },
      ],
    },
  },
  analytics: {
    id: 'analytics',
    name: 'Analytics',
    description: 'Stats and module health',
    icon: '📊',
    widgets: ['streakStats', 'heroSection', 'weeklyInsights', 'moduleHealth'],
    layouts: {
      lg: [
        { i: 'streakStats', x: 0, y: 0, w: 2, h: 1 },
        { i: 'heroSection', x: 2, y: 0, w: 2, h: 2 },
        { i: 'weeklyInsights', x: 0, y: 1, w: 2, h: 2 },
        { i: 'moduleHealth', x: 0, y: 3, w: 4, h: 3 },
      ],
      md: [
        { i: 'streakStats', x: 0, y: 0, w: 2, h: 1 },
        { i: 'heroSection', x: 0, y: 1, w: 2, h: 2 },
        { i: 'weeklyInsights', x: 0, y: 3, w: 2, h: 2 },
        { i: 'moduleHealth', x: 0, y: 5, w: 2, h: 4 },
      ],
      sm: [
        { i: 'streakStats', x: 0, y: 0, w: 1, h: 1 },
        { i: 'heroSection', x: 0, y: 1, w: 1, h: 2 },
        { i: 'weeklyInsights', x: 0, y: 3, w: 1, h: 3 },
        { i: 'moduleHealth', x: 0, y: 6, w: 1, h: 5 },
      ],
    },
  },
};

const useDashboardStore = create(
  persist(
    (set, get) => ({
      // Widget visibility settings
      widgetVisibility: Object.fromEntries(
        Object.entries(DASHBOARD_WIDGETS).map(([id, widget]) => [id, widget.defaultVisible])
      ),

      // Grid layouts for each breakpoint
      layouts: DEFAULT_LAYOUTS,

      // Current preset (null = custom)
      currentPreset: 'full',

      // Settings modal state
      isSettingsOpen: false,

      // Edit mode (shows resize handles and drag indicators)
      isEditMode: false,

      // Layout history for undo (max 10 states)
      layoutHistory: [],
      historyIndex: -1,

      // Supabase sync state
      isInitialized: false,

      // Track if user has completed initial dashboard setup (onboarding)
      hasCompletedOnboardingSetup: false,

      // Initialize from Supabase
      initializeFromSupabase: async (passedUserId = null) => {
        // Master timeout to prevent hanging
        const INIT_TIMEOUT_MS = 15000;
        let timedOut = false;
        const timeoutId = setTimeout(() => {
          timedOut = true;
          set({ isInitialized: true });
        }, INIT_TIMEOUT_MS);

        // Helper to wrap queries with timeout
        const withTimeout = (promise, timeoutMs = 10000) => {
          return Promise.race([
            promise,
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Query timeout')), timeoutMs)
            )
          ]).catch(() => ({ data: null, error: 'timeout' }));
        };

        try {
          const userId = passedUserId || await getCurrentUserId();
          if (!userId) {
            clearTimeout(timeoutId);
            set({ isInitialized: true });
            return;
          }

          const { data, error } = await withTimeout(
            supabase
              .from('user_profiles')
              .select('preferences')
              .eq('id', userId)
              .maybeSingle()
          );

          // Continue with cached data on timeout - don't throw
          if (error && error !== 'timeout') throw error;

          if (data?.preferences?.dashboard) {
            const dashboard = data.preferences.dashboard;
            set({
              widgetVisibility: dashboard.widgetVisibility || get().widgetVisibility,
              layouts: dashboard.layouts || get().layouts,
              currentPreset: dashboard.currentPreset || get().currentPreset,
              hasCompletedOnboardingSetup: dashboard.hasCompletedOnboardingSetup ?? false,
              isInitialized: true,
            });
          } else {
            set({ isInitialized: true });
          }
          console.log('[DashboardStore] ✅ Initialized');
        } catch (error) {
          console.error('[DashboardStore] ❌ Error initializing:', error);
          set({ isInitialized: true });
        } finally {
          clearTimeout(timeoutId);
        }
      },

      // Helper to sync current state to Supabase
      syncToSupabase: () => {
        const state = get();
        syncDashboardToSupabase({
          widgetVisibility: state.widgetVisibility,
          layouts: state.layouts,
          currentPreset: state.currentPreset,
          hasCompletedOnboardingSetup: state.hasCompletedOnboardingSetup,
        });
      },

      // Toggle edit mode
      toggleEditMode: () => {
        const state = get();
        // Save current layout to history when entering edit mode
        if (!state.isEditMode) {
          set({
            isEditMode: true,
            layoutHistory: [{ layouts: state.layouts, widgetVisibility: state.widgetVisibility }],
            historyIndex: 0,
          });
        } else {
          set({ isEditMode: false });
        }
      },
      setEditMode: (mode) => set({ isEditMode: mode }),

      // Update layouts when user drags/resizes
      updateLayouts: (newLayouts) => {
        const state = get();
        const newHistory = state.layoutHistory.slice(0, state.historyIndex + 1);

        // Add to history (limit to 10 entries)
        if (newHistory.length >= 10) {
          newHistory.shift();
        }
        newHistory.push({
          layouts: newLayouts,
          widgetVisibility: state.widgetVisibility,
        });

        set({
          layouts: newLayouts,
          currentPreset: null,
          layoutHistory: newHistory,
          historyIndex: newHistory.length - 1,
        });

        // Sync to Supabase
        get().syncToSupabase();
      },

      // Force compact all layouts (remove gaps)
      compactAllLayouts: () => {
        const state = get();
        const newLayouts = { ...state.layouts };

        Object.keys(newLayouts).forEach((breakpoint) => {
          const cols = breakpoint === 'lg' ? 4 : breakpoint === 'md' ? 2 : 1;
          newLayouts[breakpoint] = compactLayout(newLayouts[breakpoint] || [], cols);
        });

        set({
          layouts: newLayouts,
          currentPreset: null,
        });

        // Sync to Supabase
        get().syncToSupabase();
      },

      // Undo last layout change
      undoLayout: () => {
        const state = get();
        if (state.historyIndex > 0) {
          const prevState = state.layoutHistory[state.historyIndex - 1];
          set({
            layouts: prevState.layouts,
            widgetVisibility: prevState.widgetVisibility,
            historyIndex: state.historyIndex - 1,
            currentPreset: null,
          });
        }
      },

      // Redo layout change
      redoLayout: () => {
        const state = get();
        if (state.historyIndex < state.layoutHistory.length - 1) {
          const nextState = state.layoutHistory[state.historyIndex + 1];
          set({
            layouts: nextState.layouts,
            widgetVisibility: nextState.widgetVisibility,
            historyIndex: state.historyIndex + 1,
            currentPreset: null,
          });
        }
      },

      // Check if undo/redo are available
      canUndo: () => get().historyIndex > 0,
      canRedo: () => get().historyIndex < get().layoutHistory.length - 1,

      // Toggle a single widget's visibility
      toggleWidget: (widgetId) => {
        const state = get();
        const isCurrentlyVisible = state.widgetVisibility[widgetId];

        // If adding a widget, create a layout entry for it
        if (!isCurrentlyVisible) {
          const widget = DASHBOARD_WIDGETS[widgetId];
          const newLayouts = { ...state.layouts };

          // Add to each breakpoint at the optimal position
          Object.keys(newLayouts).forEach((breakpoint) => {
            const existingItems = newLayouts[breakpoint] || [];
            const cols = breakpoint === 'lg' ? 4 : breakpoint === 'md' ? 2 : 1;

            // Find optimal position to fill gaps
            const pos = findOptimalPosition(existingItems, widget, cols);

            newLayouts[breakpoint] = [
              ...existingItems,
              {
                i: widgetId,
                x: pos.x,
                y: pos.y,
                w: pos.w,
                h: pos.h,
              },
            ];

            // Re-compact the layout to eliminate gaps
            newLayouts[breakpoint] = compactLayout(newLayouts[breakpoint], cols);
          });

          set({
            widgetVisibility: { ...state.widgetVisibility, [widgetId]: true },
            layouts: newLayouts,
            currentPreset: null,
          });

          // Sync to Supabase
          get().syncToSupabase();
        } else {
          // Remove from layouts and re-compact
          const newLayouts = { ...state.layouts };
          Object.keys(newLayouts).forEach((breakpoint) => {
            const cols = breakpoint === 'lg' ? 4 : breakpoint === 'md' ? 2 : 1;

            // Filter out the removed widget
            newLayouts[breakpoint] = (newLayouts[breakpoint] || []).filter(
              (item) => item.i !== widgetId
            );

            // Re-compact to fill the gap
            newLayouts[breakpoint] = compactLayout(newLayouts[breakpoint], cols);
          });

          set({
            widgetVisibility: { ...state.widgetVisibility, [widgetId]: false },
            layouts: newLayouts,
            currentPreset: null,
          });

          // Sync to Supabase
          get().syncToSupabase();
        }
      },

      // Set widget visibility directly
      setWidgetVisibility: (widgetId, visible) => {
        set((state) => ({
          widgetVisibility: {
            ...state.widgetVisibility,
            [widgetId]: visible,
          },
          currentPreset: null,
        }));

        // Sync to Supabase
        get().syncToSupabase();
      },

      // Apply a preset layout
      applyPreset: (presetId) => {
        const preset = DASHBOARD_PRESETS[presetId];
        if (!preset) return;

        const newVisibility = Object.fromEntries(
          Object.keys(DASHBOARD_WIDGETS).map((id) => [id, preset.widgets.includes(id)])
        );

        set({
          widgetVisibility: newVisibility,
          layouts: preset.layouts,
          currentPreset: presetId,
        });

        // Sync to Supabase
        get().syncToSupabase();
      },

      // Reset to default visibility and layout
      resetToDefaults: () => {
        set({
          widgetVisibility: Object.fromEntries(
            Object.entries(DASHBOARD_WIDGETS).map(([id, widget]) => [id, widget.defaultVisible])
          ),
          layouts: DEFAULT_LAYOUTS,
          currentPreset: 'full',
        });

        // Sync to Supabase
        get().syncToSupabase();
      },

      // Set up dashboard for onboarding (new users)
      // This ensures a consistent layout for the dashboard tour
      setupOnboardingDashboard: () => {
        const preset = DASHBOARD_PRESETS.onboarding;
        if (!preset) return;

        const newVisibility = Object.fromEntries(
          Object.keys(DASHBOARD_WIDGETS).map((id) => [id, preset.widgets.includes(id)])
        );

        set({
          widgetVisibility: newVisibility,
          layouts: preset.layouts,
          currentPreset: 'onboarding',
          hasCompletedOnboardingSetup: false, // Not completed until tour is done
        });

        // Sync to Supabase
        get().syncToSupabase();
      },

      // Mark onboarding setup as complete (called after dashboard tour)
      completeOnboardingSetup: () => {
        set({ hasCompletedOnboardingSetup: true });
        // Sync to Supabase
        get().syncToSupabase();
      },

      // Check if dashboard needs onboarding setup
      needsOnboardingSetup: () => {
        return !get().hasCompletedOnboardingSetup;
      },

      // Check if a widget is visible
      isWidgetVisible: (widgetId) => {
        return get().widgetVisibility[widgetId] ?? false;
      },

      // Get visible widgets with their layout info
      getVisibleWidgets: () => {
        const state = get();
        return Object.entries(state.widgetVisibility)
          .filter(([_, visible]) => visible)
          .map(([id]) => ({
            ...DASHBOARD_WIDGETS[id],
            id,
          }));
      },

      // Open/close settings modal
      openSettings: () => set({ isSettingsOpen: true }),
      closeSettings: () => set({ isSettingsOpen: false }),
      toggleSettings: () => set((state) => ({ isSettingsOpen: !state.isSettingsOpen })),
    }),
    {
      name: 'lifeos-dashboard-settings',
      version: 3, // Increment version to handle migration
      migrate: (persistedState, version) => {
        if (version < 2) {
          // Migration from v1 to v2: add layouts
          return {
            ...persistedState,
            layouts: DEFAULT_LAYOUTS,
            isEditMode: false,
          };
        }
        if (version < 3) {
          // Migration from v2 to v3: ensure all visible widgets have layout entries
          const visibility = persistedState.widgetVisibility || {};
          const layouts = persistedState.layouts || DEFAULT_LAYOUTS;

          // For each visible widget, ensure it has a layout entry
          Object.entries(visibility).forEach(([widgetId, isVisible]) => {
            if (isVisible && DASHBOARD_WIDGETS[widgetId]) {
              const hasLayout = layouts.lg?.some(item => item.i === widgetId);
              if (!hasLayout) {
                const widget = DASHBOARD_WIDGETS[widgetId];
                // Add to each breakpoint
                ['lg', 'md', 'sm'].forEach(breakpoint => {
                  if (!layouts[breakpoint]) layouts[breakpoint] = [];
                  const maxY = layouts[breakpoint].reduce((max, item) => Math.max(max, (item.y || 0) + (item.h || 2)), 0);
                  const cols = breakpoint === 'lg' ? 4 : breakpoint === 'md' ? 2 : 1;
                  layouts[breakpoint].push({
                    i: widgetId,
                    x: 0,
                    y: maxY,
                    w: Math.min(widget.minW || 2, cols),
                    h: widget.minH || 2,
                  });
                });
              }
            }
          });

          return {
            ...persistedState,
            layouts,
            isEditMode: false,
          };
        }
        return persistedState;
      },
    }
  )
);

// Initialize dashboard store from Supabase
export const initializeDashboardStore = async (userId = null) => {
  const store = useDashboardStore.getState();
  if (!store.isInitialized) {
    await store.initializeFromSupabase(userId);
  }
};

export default useDashboardStore;
