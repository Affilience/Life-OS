import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase, getCurrentUserId } from '../lib/supabase';

// Default settings values
const DEFAULT_SETTINGS = {
  // Account & Profile
  account: {
    displayName: '',
    email: '',
    avatarUrl: '',
    bio: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    weekStartsOn: 'sunday',
  },

  // Appearance
  appearance: {
    theme: 'cosmic', // 'cosmic' | 'dark' | 'light' | 'system'
    accentColor: 'purple', // 'purple' | 'blue' | 'green' | 'pink' | 'orange'
    fontSize: 'medium', // 'small' | 'medium' | 'large'
    uiDensity: 'comfortable', // 'compact' | 'comfortable' | 'spacious'
    reduceMotion: false,
    highContrast: false,
    sidebarCollapsed: false,
  },

  // Notifications
  notifications: {
    pushEnabled: true,
    emailEnabled: false,
    emailDigest: 'weekly', // 'daily' | 'weekly' | 'never'
    taskReminders: true,
    habitReminders: true,
    streakAlerts: true,
    achievementAlerts: true,
    quietHoursEnabled: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00',
    soundEnabled: true,
    // XP Toast Settings
    xpToastEnabled: true, // Show XP gained toasts
    xpToastMinThreshold: 15, // Minimum XP to show toast (0 = show all)
    xpToastBatchWindow: 2000, // ms to batch XP gains before showing toast
  },

  // Feedback & Sounds (micro-interactions)
  feedback: {
    hapticsEnabled: true,
    soundsEnabled: true,
    soundVolume: 0.3, // 0.0 - 1.0
    celebrationsEnabled: true,
  },

  // Privacy
  privacy: {
    profileVisibility: 'private', // 'public' | 'friends' | 'private'
    showActivityStatus: false,
    allowFriendRequests: true,
    usageAnalytics: true,
    errorReporting: true,
    locationServices: false,
    dataRetentionMonths: 24, // 6 | 12 | 24 | 36 | 0 (forever)
  },

  // Sync & Backup
  sync: {
    cloudSyncEnabled: true,
    syncFrequency: 'realtime', // 'realtime' | 'hourly' | 'daily' | 'manual'
    lastSyncedAt: null,
    autoBackup: true,
    backupFrequency: 'weekly', // 'daily' | 'weekly' | 'monthly'
    lastBackupAt: null,
  },

  // Module Preferences
  modules: {
    enabledModules: [
      'dashboard',
      'productivity',
      'health',
      'knowledge',
      'journal',
      'calendar',
      'skills',
      'financial',
      'social',
      'quests',
    ],
    defaultModule: 'dashboard',
    productivity: {
      defaultView: 'kanban', // 'kanban' | 'list' | 'calendar'
      pomodoroLength: 25,
      shortBreakLength: 5,
      longBreakLength: 15,
      autoStartBreaks: false,
    },
    health: {
      weightUnit: 'kg', // 'kg' | 'lbs'
      heightUnit: 'cm', // 'cm' | 'ft'
      calorieGoal: 2000,
      waterGoal: 8, // glasses
      sleepGoal: 8, // hours
      showMacros: true,
    },
    knowledge: {
      defaultNoteFormat: 'markdown', // 'markdown' | 'rich-text'
      autoSave: true,
      autoSaveInterval: 30, // seconds
      showWordCount: true,
    },
    journal: {
      defaultMood: null,
      showPrompts: true,
      promptFrequency: 'daily', // 'always' | 'daily' | 'never'
      reflectionReminder: true,
      reflectionTime: '21:00',
    },
    calendar: {
      defaultView: 'week', // 'day' | 'week' | 'month'
      showWeekNumbers: false,
      workingHoursStart: '09:00',
      workingHoursEnd: '17:00',
      showWorkingHours: true,
    },
    financial: {
      currency: 'GBP', // ISO currency code
      currencySymbol: '£',
      showCents: true,
      fiscalYearStart: 'january', // month name
      budgetPeriod: 'monthly', // 'weekly' | 'monthly' | 'yearly'
    },
  },

  // Advanced
  advanced: {
    developerMode: false,
    debugLogging: false,
    experimentalFeatures: false,
    keyboardShortcuts: true,
    vimMode: false,
    autoUpdateCheck: true,
    telemetry: true,
    cacheEnabled: true,
    offlineMode: false,
  },

  // Accessibility
  accessibility: {
    screenReaderOptimized: false,
    keyboardNavigation: true,
    focusHighlight: true,
    textToSpeech: false,
    dyslexiaFont: false,
    colorBlindMode: 'none', // 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia'
  },
};

// Helper to deep merge objects
const deepMerge = (target, source) => {
  const result = { ...target };
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(target[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
};

// Sync settings to Supabase
const syncSettingsToSupabase = async (settings) => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return;

    const { error } = await supabase
      .from('user_profiles')
      .update({ preferences: settings })
      .eq('id', userId);

    if (error) throw error;
  } catch (error) {
    console.error('Error syncing settings to Supabase:', error);
  }
};

const useSettingsStore = create(
  persist(
    (set, get) => ({
      settings: DEFAULT_SETTINGS,
      isInitialized: false,
      isSyncing: false,
      lastError: null,

      // Initialize from Supabase
      initializeFromSupabase: async (passedUserId = null) => {
        set({ isSyncing: true });

        // Master timeout - guarantee function returns even if queries hang
        const INIT_TIMEOUT_MS = 15000;
        let timedOut = false;
        const timeoutId = setTimeout(() => {
          timedOut = true;
          console.warn('[SettingsStore] ⏱️ Master timeout reached - using defaults');
          set({ isSyncing: false, isInitialized: true });
        }, INIT_TIMEOUT_MS);

        // Helper to wrap queries with timeout (matches working stores)
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
            set({ isSyncing: false, isInitialized: true });
            console.log('[SettingsStore] ✅ Initialized (no user)');
            return;
          }

          const { data, error } = await withTimeout(
            supabase
              .from('user_profiles')
              .select('preferences, display_name, avatar_url')
              .eq('id', userId)
              .maybeSingle()
          );

          if (error && error !== 'timeout') {
            throw error;
          }

          clearTimeout(timeoutId);
          if (timedOut) return;

          if (data) {
            // Merge fetched preferences with defaults (to handle new settings)
            const mergedSettings = deepMerge(DEFAULT_SETTINGS, data.preferences || {});

            // Update account info from profile
            if (data.display_name) {
              mergedSettings.account.displayName = data.display_name;
            }
            if (data.avatar_url) {
              mergedSettings.account.avatarUrl = data.avatar_url;
            }

            set({ settings: mergedSettings, isInitialized: true, isSyncing: false });
            console.log('[SettingsStore] ✅ Initialized');
          } else {
            // No profile found - just use defaults
            set({ isInitialized: true, isSyncing: false });
            console.log('[SettingsStore] ✅ Initialized (using defaults)');
          }
        } catch (error) {
          console.error('[SettingsStore] Error initializing:', error);
          clearTimeout(timeoutId);
          if (!timedOut) {
            set({ lastError: error.message, isInitialized: true, isSyncing: false });
          }
          console.log('[SettingsStore] ✅ Initialized (with error, using defaults)');
        }
      },

      // Get a specific setting by path (e.g., 'appearance.theme')
      getSetting: (path) => {
        const settings = get().settings;
        return path.split('.').reduce((obj, key) => obj?.[key], settings);
      },

      // Update a specific setting section
      updateSettings: (section, updates) => {
        set((state) => {
          const newSettings = {
            ...state.settings,
            [section]: {
              ...state.settings[section],
              ...updates,
            },
          };

          // Sync to Supabase (debounced in real usage)
          syncSettingsToSupabase(newSettings);

          return { settings: newSettings };
        });
      },

      // Update a single setting by path
      setSetting: (path, value) => {
        set((state) => {
          const keys = path.split('.');
          const newSettings = { ...state.settings };
          let current = newSettings;

          for (let i = 0; i < keys.length - 1; i++) {
            current[keys[i]] = { ...current[keys[i]] };
            current = current[keys[i]];
          }

          current[keys[keys.length - 1]] = value;

          // Sync to Supabase
          syncSettingsToSupabase(newSettings);

          return { settings: newSettings };
        });
      },

      // Reset a section to defaults
      resetSection: (section) => {
        set((state) => {
          const newSettings = {
            ...state.settings,
            [section]: DEFAULT_SETTINGS[section],
          };

          syncSettingsToSupabase(newSettings);

          return { settings: newSettings };
        });
      },

      // Reset all settings to defaults
      resetAllSettings: () => {
        set({ settings: DEFAULT_SETTINGS });
        syncSettingsToSupabase(DEFAULT_SETTINGS);
      },

      // Export settings as JSON
      exportSettings: () => {
        return JSON.stringify(get().settings, null, 2);
      },

      // Import settings from JSON
      importSettings: (jsonString) => {
        try {
          const imported = JSON.parse(jsonString);
          const mergedSettings = deepMerge(DEFAULT_SETTINGS, imported);
          set({ settings: mergedSettings });
          syncSettingsToSupabase(mergedSettings);
          return { success: true };
        } catch (error) {
          return { success: false, error: error.message };
        }
      },

      // Toggle a boolean setting
      toggleSetting: (path) => {
        const current = get().getSetting(path);
        if (typeof current === 'boolean') {
          get().setSetting(path, !current);
        }
      },

      // Check if a module is enabled
      isModuleEnabled: (moduleId) => {
        return get().settings.modules.enabledModules.includes(moduleId);
      },

      // Toggle module enabled state
      toggleModule: (moduleId) => {
        set((state) => {
          const enabledModules = state.settings.modules.enabledModules;
          const newEnabledModules = enabledModules.includes(moduleId)
            ? enabledModules.filter((m) => m !== moduleId)
            : [...enabledModules, moduleId];

          const newSettings = {
            ...state.settings,
            modules: {
              ...state.settings.modules,
              enabledModules: newEnabledModules,
            },
          };

          syncSettingsToSupabase(newSettings);

          return { settings: newSettings };
        });
      },
    }),
    {
      name: 'lifeos-settings-storage',
      partialize: (state) => ({
        settings: state.settings,
      }),
    }
  )
);

// Initialize settings store
export const initializeSettingsStore = async (userId = null) => {
  const store = useSettingsStore.getState();
  if (!store.isInitialized) {
    await store.initializeFromSupabase(userId);
  }
};

// Export defaults for reference
export { DEFAULT_SETTINGS };

export default useSettingsStore;
