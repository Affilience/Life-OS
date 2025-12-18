import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { triggerGamification } from '../hooks/useGamification';
import { supabase, getCurrentUserId } from '../lib/supabase';

/**
 * Feature Tour Store
 *
 * Manages Nova-guided feature tours throughout the application.
 * Tours help users discover functionality on each page through
 * contextual spotlights and explanations from Nova.
 */

// XP rewards for completing tours
const TOUR_XP_REWARDS = {
  dashboard: 25,
  productivity: 20,
  health: 20,
  character: 15,
  quests: 15,
  financial: 20,
  knowledge: 15,
  calendar: 15,
  journal: 15,
  skills: 15,
  purpose: 15,
  social: 15,
  settings: 10,
};

// Tour IDs - each page/feature can have its own tour
export const TOUR_IDS = {
  DASHBOARD: 'dashboard',
  PRODUCTIVITY: 'productivity',
  HEALTH: 'health',
  CHARACTER: 'character',
  QUESTS: 'quests',
  FINANCIAL: 'financial',
  KNOWLEDGE: 'knowledge',
  CALENDAR: 'calendar',
  JOURNAL: 'journal',
  SKILLS: 'skills',
  PURPOSE: 'purpose',
  SOCIAL: 'social',
  SETTINGS: 'settings',
};

// Map routes to tour IDs
export const ROUTE_TO_TOUR = {
  '/': TOUR_IDS.DASHBOARD,
  '/productivity': TOUR_IDS.PRODUCTIVITY,
  '/health': TOUR_IDS.HEALTH,
  '/character': TOUR_IDS.CHARACTER,
  '/quests': TOUR_IDS.QUESTS,
  '/financial': TOUR_IDS.FINANCIAL,
  '/knowledge': TOUR_IDS.KNOWLEDGE,
  '/calendar': TOUR_IDS.CALENDAR,
  '/journal': TOUR_IDS.JOURNAL,
  '/skills': TOUR_IDS.SKILLS,
  '/purpose': TOUR_IDS.PURPOSE,
  '/social': TOUR_IDS.SOCIAL,
  '/settings': TOUR_IDS.SETTINGS,
};

export const useTourStore = create(
  persist(
    (set, get) => ({
      // ============================================
      // STATE
      // ============================================

      // Active tour state
      activeTour: null,           // Current tour ID (e.g., 'dashboard')
      currentStepIndex: 0,        // Current step within the tour
      isActive: false,            // Is a tour currently running?
      isPaused: false,            // Tour paused (e.g., user opened a modal)

      // Completion tracking
      completedTours: [],         // Tour IDs that have been fully completed
      skippedTours: [],           // Tour IDs that were skipped/dismissed

      // Per-tour progress (for partially completed tours)
      tourProgress: {},           // { [tourId]: { lastStepIndex: number, viewedSteps: [] } }

      // User preferences
      toursEnabled: true,         // Global toggle for auto-starting tours
      hasSeenTourPrompt: false,   // Has user been asked about tours?

      // Nova state during tour
      novaState: 'happy',         // Nova's emotional state during tour
      novaMessage: '',            // Current message Nova is showing

      // UI state
      highlightedElement: null,   // DOM element currently highlighted
      tooltipPosition: null,      // { top, left, placement } for tooltip

      // ============================================
      // SUPABASE SYNC
      // ============================================

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

          if (data?.preferences?.tours) {
            const tourPrefs = data.preferences.tours;
            set({
              completedTours: tourPrefs.completedTours || [],
              skippedTours: tourPrefs.skippedTours || [],
              tourProgress: tourPrefs.tourProgress || {},
              toursEnabled: tourPrefs.toursEnabled ?? true,
              hasSeenTourPrompt: tourPrefs.hasSeenTourPrompt ?? false,
            });
          }
        } catch (error) {
          console.error('Error loading tours from Supabase:', error);
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
                tours: {
                  completedTours: state.completedTours,
                  skippedTours: state.skippedTours,
                  tourProgress: state.tourProgress,
                  toursEnabled: state.toursEnabled,
                  hasSeenTourPrompt: state.hasSeenTourPrompt,
                },
              },
              updated_at: new Date().toISOString(),
            })
            .eq('id', userId);
        } catch (error) {
          console.error('Error syncing tours to Supabase:', error);
        } finally {
          set({ _isSyncing: false });
        }
      },

      // ============================================
      // ACTIONS
      // ============================================

      /**
       * Start a specific tour
       */
      startTour: (tourId, startFromStep = 0) => {
        set({
          activeTour: tourId,
          currentStepIndex: startFromStep,
          isActive: true,
          isPaused: false,
          novaState: 'excited',
        });
      },

      /**
       * Move to the next step in the current tour
       */
      nextStep: () => {
        const { currentStepIndex, activeTour, tourProgress } = get();
        const newIndex = currentStepIndex + 1;

        // Track progress
        const progress = tourProgress[activeTour] || { lastStepIndex: 0, viewedSteps: [] };
        const viewedSteps = [...new Set([...progress.viewedSteps, currentStepIndex])];

        set({
          currentStepIndex: newIndex,
          tourProgress: {
            ...tourProgress,
            [activeTour]: {
              lastStepIndex: newIndex,
              viewedSteps,
            },
          },
        });
      },

      /**
       * Move to the previous step
       */
      prevStep: () => {
        const { currentStepIndex } = get();
        if (currentStepIndex > 0) {
          set({ currentStepIndex: currentStepIndex - 1 });
        }
      },

      /**
       * Jump to a specific step
       */
      goToStep: (stepIndex) => {
        set({ currentStepIndex: stepIndex });
      },

      /**
       * Skip/dismiss the current tour
       */
      skipTour: () => {
        const { activeTour, skippedTours } = get();

        if (activeTour && !skippedTours.includes(activeTour)) {
          set({
            skippedTours: [...skippedTours, activeTour],
          });
        }

        set({
          activeTour: null,
          currentStepIndex: 0,
          isActive: false,
          isPaused: false,
          highlightedElement: null,
          tooltipPosition: null,
        });

        // Sync to Supabase
        get().syncToSupabase();
      },

      /**
       * Complete the current tour
       */
      completeTour: () => {
        const { activeTour, completedTours, tourProgress } = get();

        if (activeTour && !completedTours.includes(activeTour)) {
          set({
            completedTours: [...completedTours, activeTour],
          });

          // Award XP for completing the tour
          const xpReward = TOUR_XP_REWARDS[activeTour] || 15;
          triggerGamification('tourCompleted', {
            xpOverride: xpReward,
            module: 'productivity',
            tourName: activeTour,
          });
        }

        // Clear progress for completed tour
        const newProgress = { ...tourProgress };
        delete newProgress[activeTour];

        set({
          activeTour: null,
          currentStepIndex: 0,
          isActive: false,
          isPaused: false,
          highlightedElement: null,
          tooltipPosition: null,
          tourProgress: newProgress,
          novaState: 'proud',
        });

        // Sync to Supabase
        get().syncToSupabase();
      },

      /**
       * Pause the tour (e.g., when user opens a modal)
       */
      pauseTour: () => {
        set({ isPaused: true });
      },

      /**
       * Resume a paused tour
       */
      resumeTour: () => {
        set({ isPaused: false });
      },

      /**
       * End tour without completing (user navigates away)
       */
      endTour: () => {
        set({
          activeTour: null,
          currentStepIndex: 0,
          isActive: false,
          isPaused: false,
          highlightedElement: null,
          tooltipPosition: null,
        });
      },

      /**
       * Reset a specific tour (allow replaying)
       */
      resetTour: (tourId) => {
        const { completedTours, skippedTours, tourProgress } = get();

        set({
          completedTours: completedTours.filter(id => id !== tourId),
          skippedTours: skippedTours.filter(id => id !== tourId),
          tourProgress: {
            ...tourProgress,
            [tourId]: undefined,
          },
        });

        // Sync to Supabase
        get().syncToSupabase();
      },

      /**
       * Reset all tours
       */
      resetAllTours: () => {
        set({
          completedTours: [],
          skippedTours: [],
          tourProgress: {},
          hasSeenTourPrompt: false,
        });

        // Sync to Supabase
        get().syncToSupabase();
      },

      /**
       * Update Nova's state during tour
       */
      setNovaState: (state, message = '') => {
        set({
          novaState: state,
          novaMessage: message,
        });
      },

      /**
       * Update highlighted element reference
       */
      setHighlightedElement: (element, position) => {
        set({
          highlightedElement: element,
          tooltipPosition: position,
        });
      },

      /**
       * Toggle tours enabled/disabled
       */
      setToursEnabled: (enabled) => {
        set({ toursEnabled: enabled });

        // Sync to Supabase
        get().syncToSupabase();
      },

      /**
       * Mark that user has seen the tour prompt
       */
      markTourPromptSeen: () => {
        set({ hasSeenTourPrompt: true });

        // Sync to Supabase
        get().syncToSupabase();
      },

      // ============================================
      // COMPUTED / HELPERS
      // ============================================

      /**
       * Check if a tour has been completed
       */
      isTourCompleted: (tourId) => {
        return get().completedTours.includes(tourId);
      },

      /**
       * Check if a tour was skipped
       */
      isTourSkipped: (tourId) => {
        return get().skippedTours.includes(tourId);
      },

      /**
       * Check if a tour should auto-start for a route
       */
      shouldAutoStartTour: (route) => {
        const { toursEnabled, completedTours, skippedTours } = get();
        const tourId = ROUTE_TO_TOUR[route];

        if (!toursEnabled || !tourId) return false;
        if (completedTours.includes(tourId)) return false;
        if (skippedTours.includes(tourId)) return false;

        return true;
      },

      /**
       * Get tour ID for current route
       */
      getTourForRoute: (route) => {
        return ROUTE_TO_TOUR[route] || null;
      },

      /**
       * Get completion stats
       */
      getCompletionStats: () => {
        const { completedTours, skippedTours } = get();
        const totalTours = Object.keys(TOUR_IDS).length;

        return {
          completed: completedTours.length,
          skipped: skippedTours.length,
          remaining: totalTours - completedTours.length - skippedTours.length,
          total: totalTours,
          percentage: Math.round((completedTours.length / totalTours) * 100),
        };
      },

      /**
       * Get list of available (not completed/skipped) tours
       */
      getAvailableTours: () => {
        const { completedTours, skippedTours } = get();
        return Object.values(TOUR_IDS).filter(
          id => !completedTours.includes(id) && !skippedTours.includes(id)
        );
      },
    }),
    {
      name: 'lifeos-tours',
      version: 1,
      partialize: (state) => ({
        // Only persist completion data, not active tour state
        completedTours: state.completedTours,
        skippedTours: state.skippedTours,
        tourProgress: state.tourProgress,
        toursEnabled: state.toursEnabled,
        hasSeenTourPrompt: state.hasSeenTourPrompt,
      }),
    }
  )
);

// Initialize tour store from Supabase
export const initializeTourStore = async () => {
  const store = useTourStore.getState();
  await store.initializeFromSupabase();
};

export default useTourStore;
