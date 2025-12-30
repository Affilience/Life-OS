/**
 * Onboarding Store
 *
 * Manages the Nova-guided onboarding flow state machine.
 * Tracks progress, selected goals, completed modules, and setup data.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Onboarding states
export const ONBOARDING_STATES = {
  NOT_STARTED: 'not_started',
  WELCOME: 'welcome',
  GOALS: 'goals',
  QUICK_WIN: 'quick_win',
  MODULE_SETUP: 'module_setup',
  DASHBOARD_REVEAL: 'dashboard_reveal',
  COMPLETED: 'completed'
};

// Goal definitions with associated modules
export const GOALS = {
  productivity: {
    id: 'productivity',
    label: 'Get More Done',
    icon: '🎯',
    description: 'Tasks, projects, and focus time',
    modules: ['productivity', 'calendar'],
    color: 'blue'
  },
  health: {
    id: 'health',
    label: 'Get Healthier',
    icon: '💪',
    description: 'Nutrition, workouts, and wellness',
    modules: ['health'],
    color: 'green'
  },
  learning: {
    id: 'learning',
    label: 'Learn New Things',
    icon: '📚',
    description: 'Skills, knowledge, and growth',
    modules: ['skills', 'knowledge'],
    color: 'purple'
  },
  financial: {
    id: 'financial',
    label: 'Manage Money',
    icon: '💰',
    description: 'Budget, savings, and goals',
    modules: ['financial'],
    color: 'yellow'
  },
  journal: {
    id: 'journal',
    label: 'Reflect & Journal',
    icon: '📝',
    description: 'Mood, gratitude, and thoughts',
    modules: ['journal'],
    color: 'pink'
  },
  habits: {
    id: 'habits',
    label: 'Build Better Habits',
    icon: '🔥',
    description: 'Streaks, routines, and consistency',
    modules: ['missions'],
    color: 'orange'
  },
  balance: {
    id: 'balance',
    label: 'Find Balance',
    icon: '⚖️',
    description: 'Purpose, values, and life design',
    modules: ['purpose'],
    color: 'cyan'
  }
};

// Module setup order priority
const MODULE_PRIORITY = [
  'health',
  'productivity',
  'financial',
  'journal',
  'skills',
  'knowledge',
  'calendar',
  'missions',
  'purpose'
];

// Get modules for selected goals, in priority order
function getModulesForGoals(goalIds) {
  const moduleSet = new Set();

  goalIds.forEach(goalId => {
    const goal = GOALS[goalId];
    if (goal?.modules) {
      goal.modules.forEach(m => moduleSet.add(m));
    }
  });

  // Return in priority order
  return MODULE_PRIORITY.filter(m => moduleSet.has(m));
}

const useOnboardingStore = create(
  persist(
    (set, get) => ({
      // State
      state: ONBOARDING_STATES.NOT_STARTED,
      selectedGoals: [],
      completedModules: [],
      setupData: {},
      currentModuleIndex: 0,
      modulesToSetup: [],

      // Timestamps
      startedAt: null,
      completedAt: null,

      // Nova state during onboarding
      novaEmotion: 'excited',
      novaMessage: '',

      // Progress computed
      getProgress: () => {
        const { state, completedModules, modulesToSetup } = get();

        const stateProgress = {
          [ONBOARDING_STATES.NOT_STARTED]: 0,
          [ONBOARDING_STATES.WELCOME]: 10,
          [ONBOARDING_STATES.GOALS]: 20,
          [ONBOARDING_STATES.QUICK_WIN]: 35,
          [ONBOARDING_STATES.MODULE_SETUP]: 40,
          [ONBOARDING_STATES.DASHBOARD_REVEAL]: 90,
          [ONBOARDING_STATES.COMPLETED]: 100
        };

        let progress = stateProgress[state] || 0;

        // Add progress for completed modules during MODULE_SETUP
        if (state === ONBOARDING_STATES.MODULE_SETUP && modulesToSetup.length > 0) {
          const moduleProgress = (completedModules.length / modulesToSetup.length) * 50;
          progress = 40 + moduleProgress;
        }

        return {
          percentage: Math.round(progress),
          current: completedModules.length,
          total: modulesToSetup.length
        };
      },

      // Actions
      startOnboarding: () => {
        set({
          state: ONBOARDING_STATES.WELCOME,
          startedAt: new Date().toISOString(),
          novaEmotion: 'excited',
          novaMessage: "Hi there! I'm Nova, your personal AI companion. Ready to build the life you want?"
        });
      },

      setGoals: (goals) => {
        const modulesToSetup = getModulesForGoals(goals);

        set({
          selectedGoals: goals,
          modulesToSetup,
          state: ONBOARDING_STATES.QUICK_WIN,
          novaEmotion: 'excited',
          novaMessage: goals.length > 1
            ? "Great choices! I love your ambition!"
            : "Perfect! Let's focus on making that happen."
        });
      },

      completeQuickWin: (data) => {
        set((state) => ({
          setupData: { ...state.setupData, quickWin: data },
          state: ONBOARDING_STATES.MODULE_SETUP,
          currentModuleIndex: 0,
          novaEmotion: 'proud',
          novaMessage: "You did it! Your first step is logged. This is just the beginning! ✨"
        }));
      },

      getCurrentModule: () => {
        const { modulesToSetup, currentModuleIndex } = get();
        return modulesToSetup[currentModuleIndex] || null;
      },

      completeModuleSetup: (module, data) => {
        const { modulesToSetup, currentModuleIndex, completedModules } = get();
        const newCompletedModules = [...completedModules, module];
        const nextIndex = currentModuleIndex + 1;

        // Check if we've completed all modules
        const allDone = nextIndex >= modulesToSetup.length;

        set((state) => ({
          completedModules: newCompletedModules,
          setupData: { ...state.setupData, [module]: data },
          currentModuleIndex: nextIndex,
          state: allDone ? ONBOARDING_STATES.DASHBOARD_REVEAL : state.state,
          novaEmotion: allDone ? 'celebratory' : 'proud',
          novaMessage: allDone
            ? "Amazing! You're all set up!"
            : `${module.charAt(0).toUpperCase() + module.slice(1)} is ready! Let's keep going!`
        }));

        return allDone;
      },

      skipModuleSetup: (module) => {
        const { modulesToSetup, currentModuleIndex } = get();
        const nextIndex = currentModuleIndex + 1;
        const allDone = nextIndex >= modulesToSetup.length;

        set({
          currentModuleIndex: nextIndex,
          state: allDone ? ONBOARDING_STATES.DASHBOARD_REVEAL : ONBOARDING_STATES.MODULE_SETUP,
          novaEmotion: 'encouraging',
          novaMessage: "No worries! We can set this up later anytime."
        });

        return allDone;
      },

      completeOnboarding: () => {
        set({
          state: ONBOARDING_STATES.COMPLETED,
          completedAt: new Date().toISOString(),
          novaEmotion: 'celebratory',
          novaMessage: "Welcome to YOUR Ascynt! I'll be here whenever you need me. 🎉"
        });
      },

      setNovaState: (emotion, message) => {
        set({ novaEmotion: emotion, novaMessage: message });
      },

      // Reset for testing
      resetOnboarding: () => {
        set({
          state: ONBOARDING_STATES.NOT_STARTED,
          selectedGoals: [],
          completedModules: [],
          setupData: {},
          currentModuleIndex: 0,
          modulesToSetup: [],
          startedAt: null,
          completedAt: null,
          novaEmotion: 'excited',
          novaMessage: ''
        });
      },

      // Check if onboarding is needed
      needsOnboarding: () => {
        const { state } = get();
        return state !== ONBOARDING_STATES.COMPLETED;
      },

      // Check if currently in onboarding
      isOnboarding: () => {
        const { state } = get();
        return state !== ONBOARDING_STATES.NOT_STARTED &&
               state !== ONBOARDING_STATES.COMPLETED;
      }
    }),
    {
      name: 'lifeos-onboarding',
      version: 1
    }
  )
);

export default useOnboardingStore;
