/**
 * Theme Store
 *
 * Manages the app's color theme state with persistence.
 * Applies comprehensive CSS variables for full visual transformation.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { THEMES, getTheme, generateThemeCSSVariables } from '../lib/themes';
import { supabase, getCurrentUserId } from '../lib/supabase';

// Apply theme CSS variables to the document root
function applyThemeToDocument(themeId) {
  const cssVars = generateThemeCSSVariables(themeId);
  const root = document.documentElement;

  // Set data attribute for CSS selectors
  root.setAttribute('data-theme', themeId);

  // Apply each CSS variable
  Object.entries(cssVars).forEach(([property, value]) => {
    root.style.setProperty(property, value);
  });

  // Update meta theme-color for mobile browsers
  const theme = getTheme(themeId);
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.setAttribute('content', theme.colors.bg0);
  }

  // Store in localStorage for initial load (before React hydrates)
  localStorage.setItem('lifeos-theme-id', themeId);

  console.log(`[Theme] Applied theme: ${themeId}`);
}

// Initialize theme on page load (called before React)
export function initializeThemeOnLoad() {
  const savedTheme = localStorage.getItem('lifeos-theme-id');
  if (savedTheme && THEMES[savedTheme]) {
    applyThemeToDocument(savedTheme);
  } else {
    applyThemeToDocument('cosmic-violet');
  }
}

// Theme store
const useThemeStore = create(
  persist(
    (set, get) => ({
      // Current theme ID
      currentTheme: 'cosmic-violet',

      // Theme preferences
      preferences: {
        // Auto-switch themes based on time of day
        autoSwitch: false,
        dayTheme: 'slate-minimal',
        nightTheme: 'cosmic-violet',
        // Schedule (24h format)
        dayStartHour: 7,
        nightStartHour: 19,
      },

      // Sync status
      _isSyncing: false,

      // Initialize from Supabase
      initializeFromSupabase: async () => {
        const userId = await getCurrentUserId();
        if (!userId) return;

        try {
          const { data } = await supabase
            .from('user_profiles')
            .select('preferences')
            .eq('id', userId)
            .maybeSingle();

          if (data?.preferences?.theme) {
            const themePrefs = data.preferences.theme;
            set({
              currentTheme: themePrefs.currentTheme || 'cosmic-violet',
              preferences: {
                autoSwitch: themePrefs.autoSwitch ?? false,
                dayTheme: themePrefs.dayTheme || 'slate-minimal',
                nightTheme: themePrefs.nightTheme || 'cosmic-violet',
                dayStartHour: themePrefs.dayStartHour ?? 7,
                nightStartHour: themePrefs.nightStartHour ?? 19,
              },
            });

            // Apply the loaded theme
            if (themePrefs.currentTheme) {
              applyThemeToDocument(themePrefs.currentTheme);
            }
          }
        } catch (error) {
          console.error('Error loading theme from Supabase:', error);
        }
      },

      // Sync to Supabase
      syncToSupabase: async () => {
        const userId = await getCurrentUserId();
        if (!userId) return;

        const state = get();
        if (state._isSyncing) return;

        set({ _isSyncing: true });

        try {
          // Get existing preferences to merge
          const { data: existing } = await supabase
            .from('user_profiles')
            .select('preferences')
            .eq('id', userId)
            .maybeSingle();

          const existingPrefs = existing?.preferences || {};

          await supabase
            .from('user_profiles')
            .update({
              preferences: {
                ...existingPrefs,
                theme: {
                  currentTheme: state.currentTheme,
                  autoSwitch: state.preferences.autoSwitch,
                  dayTheme: state.preferences.dayTheme,
                  nightTheme: state.preferences.nightTheme,
                  dayStartHour: state.preferences.dayStartHour,
                  nightStartHour: state.preferences.nightStartHour,
                },
              },
              updated_at: new Date().toISOString(),
            })
            .eq('id', userId);
        } catch (error) {
          console.error('Error syncing theme to Supabase:', error);
        } finally {
          set({ _isSyncing: false });
        }
      },

      // Set theme
      setTheme: (themeId) => {
        if (!THEMES[themeId]) {
          console.warn(`Theme "${themeId}" not found, using cosmic-violet`);
          themeId = 'cosmic-violet';
        }

        applyThemeToDocument(themeId);
        set({ currentTheme: themeId });

        // Sync to Supabase
        get().syncToSupabase();
      },

      // Get current theme object
      getTheme: () => {
        const { currentTheme } = get();
        return getTheme(currentTheme);
      },

      // Get theme preview colors
      getPreviewColors: (themeId) => {
        const theme = getTheme(themeId);
        return theme.preview;
      },

      // Update preferences
      updatePreferences: (updates) => {
        set((state) => ({
          preferences: { ...state.preferences, ...updates },
        }));
        // Sync to Supabase
        get().syncToSupabase();
      },

      // Toggle auto-switch
      toggleAutoSwitch: () => {
        set((state) => ({
          preferences: {
            ...state.preferences,
            autoSwitch: !state.preferences.autoSwitch,
          },
        }));
        // Sync to Supabase
        get().syncToSupabase();
      },

      // Check and apply time-based theme
      checkTimeBasedTheme: () => {
        const { preferences, setTheme, currentTheme } = get();
        if (!preferences.autoSwitch) return;

        const hour = new Date().getHours();
        const isDay =
          hour >= preferences.dayStartHour && hour < preferences.nightStartHour;
        const targetTheme = isDay ? preferences.dayTheme : preferences.nightTheme;

        if (currentTheme !== targetTheme) {
          setTheme(targetTheme);
        }
      },

      // Get all available themes
      getAllThemes: () => Object.values(THEMES),

      // Get theme by category
      getThemesByCategory: (category) => {
        const categories = {
          vibrant: ['cosmic-violet', 'neon-synthwave', 'solar-orange'],
          calm: ['emerald-zen', 'ocean-depths', 'forest-night'],
          professional: ['royal-indigo', 'slate-minimal'],
          warm: ['rose-gold', 'solar-orange'],
        };
        return (categories[category] || []).map((id) => THEMES[id]).filter(Boolean);
      },
    }),
    {
      name: 'lifeos-theme-store',
      partialize: (state) => ({
        currentTheme: state.currentTheme,
        preferences: state.preferences,
      }),
      onRehydrateStorage: () => (state) => {
        // Apply theme after store rehydration
        if (state?.currentTheme) {
          applyThemeToDocument(state.currentTheme);
        }
      },
    }
  )
);

// Initialize function for App.jsx
export async function initializeThemeStore() {
  const store = useThemeStore.getState();

  // Load theme from Supabase first
  await store.initializeFromSupabase();

  // Apply current theme
  const { currentTheme, checkTimeBasedTheme } = useThemeStore.getState();
  applyThemeToDocument(currentTheme);

  // Set up time-based checking (every minute)
  checkTimeBasedTheme();
  setInterval(checkTimeBasedTheme, 60000);

  return Promise.resolve();
}

export default useThemeStore;
