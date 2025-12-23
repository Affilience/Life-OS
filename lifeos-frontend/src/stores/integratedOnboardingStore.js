/**
 * Integrated Onboarding Store
 *
 * Manages onboarding that happens within actual app pages.
 * Tracks which modules have been set up and guides users through the system.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Module setup definitions
export const MODULE_SETUP = {
  health: {
    id: 'health',
    name: 'Health & Nutrition',
    icon: '🏥',
    route: '/health',
    description: 'Set your calorie goals, macros, and hydration targets',
    priority: 1,
    setupFields: ['calorieGoal', 'macros', 'hydrationGoal'],
    estimatedTime: '2 min'
  },
  fitness: {
    id: 'fitness',
    name: 'Fitness & Workouts',
    icon: '💪',
    route: '/health',
    tab: 'workouts',
    description: 'Configure workout preferences and goals',
    priority: 2,
    setupFields: ['workoutFrequency', 'bodyWeight', 'fitnessGoals'],
    estimatedTime: '2 min'
  },
  financial: {
    id: 'financial',
    name: 'Financial',
    icon: '💰',
    route: '/financial',
    description: 'Set your budget, income, and savings goals',
    priority: 3,
    setupFields: ['monthlyIncome', 'budgetCategories', 'savingsGoals'],
    estimatedTime: '3 min'
  },
  productivity: {
    id: 'productivity',
    name: 'Productivity',
    icon: '🎯',
    route: '/productivity',
    description: 'Define your projects and focus areas',
    priority: 4,
    setupFields: ['projects', 'focusAreas'],
    estimatedTime: '2 min'
  },
  calendar: {
    id: 'calendar',
    name: 'Calendar & Time',
    icon: '📅',
    route: '/calendar',
    description: 'Set work hours and time blocking preferences',
    priority: 5,
    setupFields: ['workHours', 'timePreferences'],
    estimatedTime: '1 min'
  },
  habits: {
    id: 'habits',
    name: 'Habits & Streaks',
    icon: '🔥',
    route: '/quests',
    description: 'Choose habits to track and build streaks',
    priority: 6,
    setupFields: ['selectedHabits', 'reminderTimes'],
    estimatedTime: '2 min'
  },
  journal: {
    id: 'journal',
    name: 'Journal',
    icon: '📝',
    route: '/journal',
    description: 'Set up journaling preferences and prompts',
    priority: 7,
    setupFields: ['journalPreferences', 'moodTracking'],
    estimatedTime: '1 min'
  },
  purpose: {
    id: 'purpose',
    name: 'Purpose & Values',
    icon: '⭐',
    route: '/purpose',
    description: 'Define your core values and life vision',
    priority: 8,
    setupFields: ['coreValues', 'missionStatement', 'visions'],
    estimatedTime: '3 min'
  },
  resolutions: {
    id: 'resolutions',
    name: 'Resolutions',
    icon: '🎆',
    route: '/resolutions',
    description: 'Set your goals for the year',
    priority: 9,
    setupFields: ['yearlyGoals', 'milestones'],
    estimatedTime: '3 min'
  }
};

// Goal to module mapping (which modules are relevant for each goal)
export const GOAL_MODULES = {
  productivity: ['productivity', 'calendar'],
  health: ['health', 'fitness'],
  learning: ['journal', 'purpose'],
  financial: ['financial'],
  journal: ['journal'],
  habits: ['habits'],
  balance: ['purpose', 'resolutions']
};

// Nova dialogue for different contexts
export const NOVA_MESSAGES = {
  welcome: {
    greeting: "Hi there! I'm Nova, your personal AI companion.",
    intro: "I'll help you set up your life operating system. It only takes a few minutes!",
    ready: "Ready to build the life you want?"
  },
  dashboard: {
    firstVisit: "Welcome to your command center! This is where you'll see everything at a glance.",
    setupPrompt: "Let's personalize your experience. I'll guide you through setting up each area.",
    progress: (completed, total) => `Great progress! You've set up ${completed} of ${total} modules.`
  },
  health: {
    intro: "Let's set up your health goals! This helps me track your nutrition and hydration.",
    calories: "What's your daily calorie target? I'll help you stay on track.",
    complete: "Perfect! Your health module is ready. You can always adjust these later."
  },
  fitness: {
    intro: "Time to configure your fitness setup!",
    workouts: "How many days per week do you want to work out?",
    complete: "Awesome! Your workout tracking is all set up."
  },
  financial: {
    intro: "Let's get your finances organized!",
    income: "What's your monthly income? This helps with budgeting.",
    complete: "Your financial dashboard is ready to help you build wealth!"
  },
  productivity: {
    intro: "Let's set up your productivity system!",
    projects: "What projects are you working on?",
    complete: "Your productivity hub is configured!"
  },
  calendar: {
    intro: "Let's configure your time management!",
    hours: "What are your typical work hours?",
    complete: "Your calendar is ready for time blocking!"
  },
  habits: {
    intro: "Building great habits is the key to success!",
    select: "Which habits do you want to track?",
    complete: "Your habit tracker is ready. Consistency is everything!"
  },
  journal: {
    intro: "Reflection is powerful for growth.",
    preferences: "How would you like to journal?",
    complete: "Your journal is set up. I'll be here to listen!"
  },
  purpose: {
    intro: "Let's define what matters most to you.",
    values: "What are your core values?",
    complete: "Your purpose compass is calibrated!"
  },
  resolutions: {
    intro: "A new year, new possibilities!",
    goals: "What do you want to achieve this year?",
    complete: "Your resolutions are set. Let's make this year amazing!"
  },
  completion: {
    celebrate: "You did it! Your LifeOS is fully configured.",
    next: "Now the real journey begins. I'll be here whenever you need me."
  }
};

const useIntegratedOnboardingStore = create(
  persist(
    (set, get) => ({
      // State
      currentUserId: null, // Track which user's data this is
      hasSeenWelcome: false,
      selectedGoals: [],
      modulesCompleted: {},
      currentGuidedModule: null,
      novaState: 'neutral', // neutral, happy, excited, thinking, proud
      novaMessage: '',
      showNovaGuide: true,
      tourStep: 0,
      isOnboardingComplete: false,
      setupData: {}, // Stores temporary setup data before saving to module stores

      // Actions
      setHasSeenWelcome: (seen) => set({ hasSeenWelcome: seen }),

      setSelectedGoals: (goals) => {
        set({ selectedGoals: goals });
        // Determine which modules to prioritize based on goals
        const relevantModules = new Set();
        goals.forEach(goal => {
          (GOAL_MODULES[goal] || []).forEach(mod => relevantModules.add(mod));
        });
        // Always include essentials
        relevantModules.add('health');
        relevantModules.add('habits');
        return Array.from(relevantModules);
      },

      getRelevantModules: () => {
        const { selectedGoals } = get();
        const relevantModules = new Set();
        selectedGoals.forEach(goal => {
          (GOAL_MODULES[goal] || []).forEach(mod => relevantModules.add(mod));
        });
        // Always include essentials
        relevantModules.add('health');
        relevantModules.add('habits');

        // Return sorted by priority
        return Object.values(MODULE_SETUP)
          .filter(m => relevantModules.has(m.id))
          .sort((a, b) => a.priority - b.priority);
      },

      getAllModules: () => {
        return Object.values(MODULE_SETUP).sort((a, b) => a.priority - b.priority);
      },

      markModuleComplete: (moduleId) => {
        set(state => ({
          modulesCompleted: {
            ...state.modulesCompleted,
            [moduleId]: {
              completedAt: new Date().toISOString(),
              setupData: state.setupData[moduleId] || {}
            }
          }
        }));

        // Check if all relevant modules are complete
        const { getRelevantModules, modulesCompleted } = get();
        const relevant = getRelevantModules();
        const allComplete = relevant.every(m => modulesCompleted[m.id]);

        if (allComplete) {
          set({ isOnboardingComplete: true });
        }
      },

      isModuleComplete: (moduleId) => {
        return !!get().modulesCompleted[moduleId];
      },

      getProgress: () => {
        const { modulesCompleted, getRelevantModules } = get();
        const relevant = getRelevantModules();
        const completed = relevant.filter(m => modulesCompleted[m.id]).length;
        return {
          completed,
          total: relevant.length,
          percentage: relevant.length > 0 ? Math.round((completed / relevant.length) * 100) : 0
        };
      },

      getNextModule: () => {
        const { modulesCompleted, getRelevantModules } = get();
        const relevant = getRelevantModules();
        return relevant.find(m => !modulesCompleted[m.id]) || null;
      },

      setCurrentGuidedModule: (moduleId) => set({ currentGuidedModule: moduleId }),

      setNovaState: (state, message = '') => set({
        novaState: state,
        novaMessage: message
      }),

      setShowNovaGuide: (show) => set({ showNovaGuide: show }),

      setTourStep: (step) => set({ tourStep: step }),

      updateSetupData: (moduleId, data) => {
        set(state => ({
          setupData: {
            ...state.setupData,
            [moduleId]: {
              ...(state.setupData[moduleId] || {}),
              ...data
            }
          }
        }));
      },

      getSetupData: (moduleId) => {
        return get().setupData[moduleId] || {};
      },

      // Skip onboarding entirely
      skipOnboarding: () => set({
        hasSeenWelcome: true,
        isOnboardingComplete: true,
        showNovaGuide: false
      }),

      // Reset onboarding (for testing)
      resetOnboarding: () => set({
        hasSeenWelcome: false,
        selectedGoals: [],
        modulesCompleted: {},
        currentGuidedModule: null,
        novaState: 'neutral',
        novaMessage: '',
        showNovaGuide: true,
        tourStep: 0,
        isOnboardingComplete: false,
        setupData: {}
      }),

      // Initialize with user ID - clears data if different user logs in
      initializeForUser: (userId) => {
        const { currentUserId, resetOnboarding } = get();
        if (currentUserId && currentUserId !== userId) {
          // Different user - reset onboarding state
          console.log('[IntegratedOnboarding] User changed, resetting state');
          resetOnboarding();
        }
        set({ currentUserId: userId });
      }
    }),
    {
      name: 'lifeos-integrated-onboarding',
      version: 2 // Bump version for new field
    }
  )
);

export default useIntegratedOnboardingStore;
