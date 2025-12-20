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
      initializeFromSupabase: async () => {
        try {
          set({ isSyncing: true });

          const userId = await getCurrentUserId();
          if (!userId) {
            set({ isSyncing: false });
            return;
          }

          const { data, error } = await supabase
            .from('user_profiles')
            .select('preferences, display_name, avatar_url')
            .eq('id', userId)
            .maybeSingle();

          if (error) throw error;

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
          } else {
            // No profile found, create one with defaults
            await supabase.from('user_profiles').upsert({
              id: userId,
              preferences: DEFAULT_SETTINGS,
            });
            set({ isInitialized: true, isSyncing: false });
          }
        } catch (error) {
          console.error('Error initializing settings:', error);
          set({ lastError: error.message, isInitialized: true, isSyncing: false });
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
export const initializeSettingsStore = async () => {
  const store = useSettingsStore.getState();
  if (!store.isInitialized) {
    await store.initializeFromSupabase();
  }
};

// Export defaults for reference
export { DEFAULT_SETTINGS };

export default useSettingsStore;
