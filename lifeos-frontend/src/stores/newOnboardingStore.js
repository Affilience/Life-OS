import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import useDashboardStore from './dashboardStore';
import { supabase, getCurrentUserId } from '../lib/supabase';

// Lazy import gamification store to avoid circular dependency
let gamificationStoreRef = null;
const getGamificationStore = async () => {
  if (!gamificationStoreRef) {
    const module = await import('./gamificationStore');
    gamificationStoreRef = module.default;
  }
  return gamificationStoreRef;
};

/**
 * New Onboarding Store
 * Manages the complete onboarding flow with progress saving
 */

// Onboarding steps
export const ONBOARDING_STEPS = {
  GAMIFICATION_MODE: 'gamification_mode',
  PROFILE_SETUP: 'profile_setup',
  LIFE_FOCUS: 'life_focus',
  MODULE_SETUP: 'module_setup',
  GAMIFICATION_TOUR: 'gamification_tour',
  SOCIAL: 'social',
  LAUNCH: 'launch',
  COMPLETED: 'completed',
};

// Step order for navigation
export const STEP_ORDER = [
  ONBOARDING_STEPS.GAMIFICATION_MODE,
  ONBOARDING_STEPS.PROFILE_SETUP,
  ONBOARDING_STEPS.LIFE_FOCUS,
  ONBOARDING_STEPS.MODULE_SETUP,
  ONBOARDING_STEPS.GAMIFICATION_TOUR,
  ONBOARDING_STEPS.SOCIAL,
  ONBOARDING_STEPS.LAUNCH,
  ONBOARDING_STEPS.COMPLETED,
];

// Goal definitions
export const LIFE_GOALS = [
  {
    id: 'productivity',
    label: 'Productivity',
    description: 'Master your time and get more done',
    icon: 'Zap',
    color: 'from-orange-500 to-amber-500',
    modules: ['productivity', 'calendar'],
  },
  {
    id: 'health',
    label: 'Health & Fitness',
    description: 'Build a stronger, healthier you',
    icon: 'Heart',
    color: 'from-red-500 to-pink-500',
    modules: ['health'],
  },
  {
    id: 'learning',
    label: 'Learning & Growth',
    description: 'Expand your knowledge and skills',
    icon: 'BookOpen',
    color: 'from-blue-500 to-cyan-500',
    modules: ['knowledge', 'skills'],
  },
  {
    id: 'financial',
    label: 'Financial Freedom',
    description: 'Take control of your finances',
    icon: 'Wallet',
    color: 'from-green-500 to-emerald-500',
    modules: ['financial'],
  },
  {
    id: 'mindfulness',
    label: 'Mindfulness',
    description: 'Find balance and inner peace',
    icon: 'Sparkles',
    color: 'from-purple-500 to-violet-500',
    modules: ['journal', 'purpose'],
  },
  {
    id: 'habits',
    label: 'Habit Building',
    description: 'Build lasting positive habits',
    icon: 'Target',
    color: 'from-indigo-500 to-blue-500',
    modules: ['habits', 'streaks'],
  },
];

// Nova dialogue for each step
export const NOVA_DIALOGUES = {
  [ONBOARDING_STEPS.GAMIFICATION_MODE]: {
    intro: [
      "Welcome, traveler. I am Nova, your guide through the cosmos of self-improvement.",
      "Before we begin your journey, I must ask you something important...",
      "How would you like to experience LifeOS?",
    ],
    cosmic: "Excellent choice! Embrace the full cosmic experience - XP, evolution, quests, and glory await!",
    minimal: "Pure and simple. Let's cut through the noise and focus on what matters most.",
  },
  [ONBOARDING_STEPS.PROFILE_SETUP]: {
    intro: [
      "Now, let's create your identity in this realm...",
      "Who will you become on this journey?",
    ],
    genderSelect: "Choose your path - will you walk as Hero or Heroine?",
    complete: "A powerful identity. The cosmos recognizes you now.",
  },
  [ONBOARDING_STEPS.LIFE_FOCUS]: {
    intro: [
      "Every great journey begins with intention...",
      "What calls to your heart? What do you wish to transform?",
    ],
    selected: "These are noble pursuits. I sense great potential in you.",
    commitment: "How much time can you dedicate each day to your growth?",
  },
  [ONBOARDING_STEPS.MODULE_SETUP]: {
    intro: [
      "Let me prepare the tools you'll need...",
      "A few quick questions to personalize your experience.",
    ],
    health: "Your body is your vessel. Let's set your health foundations.",
    financial: "Wealth flows to those who track it. Let's set your financial compass.",
    productivity: "Time is your most precious resource. Let's optimize it.",
    knowledge: "Knowledge is power. What realms of learning call to you?",
    complete: "Your sanctuaries are prepared. The stage is set.",
  },
  [ONBOARDING_STEPS.GAMIFICATION_TOUR]: {
    intro: [
      "Now, let me show you the magic that powers your journey...",
      "Every action you take earns you cosmic energy.",
    ],
    xp: "This is XP - the lifeblood of your evolution. Complete tasks, build habits, and watch yourself grow.",
    avatar: "Your avatar evolves through 40 stages. From Dreamer to Avatar of Mastery.",
    skills: "The skill constellation awaits. Unlock your first star...",
    bazaar: "The Cosmic Bazaar offers rewards for your dedication. Here's 100 credits to start.",
    purchase: "Choose your first item wisely. It marks the beginning of your collection.",
  },
  [ONBOARDING_STEPS.SOCIAL]: {
    intro: [
      "The cosmos is vast, but you need not walk alone...",
      "Would you like to invite a companion to join your journey?",
    ],
    skip: "Very well. Your friends await when you're ready.",
    invited: "An invitation sent across the stars. May they join you soon.",
  },
  [ONBOARDING_STEPS.LAUNCH]: {
    intro: [
      "The preparations are complete...",
      "You stand at the threshold of transformation.",
    ],
    celebration: [
      "Welcome to LifeOS, {name}!",
      "Your first quest awaits. Go forth and conquer!",
      "I'll be here whenever you need guidance. Just look for me.",
    ],
  },
};

// Nova expressions/states
export const NOVA_STATES = {
  neutral: '/assets/nova/nova_spark.png',
  thinking: '/assets/nova/nova_spark.png',
  excited: '/assets/nova/nova_stellar.png',
  proud: '/assets/nova/nova_cosmos.png',
  welcoming: '/assets/nova/nova_teen.png',
  celebrating: '/assets/nova/nova_cosmos.png',
};

export const useNewOnboardingStore = create(
  // NO persist middleware - onboarding state is ONLY from Supabase
  (set, get) => ({
    // Current state - defaults assume onboarding is complete until Supabase says otherwise
    // This prevents flash of onboarding for returning users
    currentStep: ONBOARDING_STEPS.COMPLETED,
    isOnboardingActive: false,
    isOnboardingComplete: true, // Default to complete - Supabase will correct if needed
    _hasAuthoritativeData: false, // True only after successful Supabase fetch
    _isLoading: true, // Loading state while fetching from Supabase
    startedAt: null,
    completedAt: null,

      // User selections
      gamificationMode: null, // 'cosmic' | 'minimal'

      profile: {
        username: '',
        displayName: '',
        gender: null, // 'male' | 'female'
      },

      lifeGoals: [], // Array of goal IDs
      dailyCommitment: 15, // Minutes per day

      moduleSetup: {
        health: null,
        financial: null,
        productivity: null,
        knowledge: null,
      },

      // Tour progress
      tourCompleted: {
        xp: false,
        avatar: false,
        skills: false,
        bazaar: false,
        purchase: false,
      },

      // Social
      invitedFriends: [],
      skippedSocial: false,

      // Nova state
      novaState: 'welcoming',
      novaDialogueIndex: 0,

      // Skipped steps
      skippedSteps: [],

      // XP earned during onboarding
      xpEarned: 0,

      // Sync status
      _isSyncing: false,
      _lastSyncedAt: null,
      _syncError: null,
      _lastUserId: null, // Track which user this onboarding state belongs to

      // ============================================
      // SUPABASE SYNC (Supabase is the ONLY source of truth)
      // ============================================

      // Initialize from Supabase - Supabase is the ONLY source of truth
      initializeFromSupabase: async (passedUserId = null) => {
        // FIRST: Check localStorage - if user already completed onboarding, skip everything
        try {
          const stored = localStorage.getItem('lifeos-new-onboarding');
          if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed?.state?.isOnboardingComplete === true) {
              console.log('[OnboardingStore] ✅ localStorage says complete - skipping init');
              set({
                _isLoading: false,
                _isSyncing: false,
                _hasAuthoritativeData: true,
                isOnboardingComplete: true,
                isOnboardingActive: false,
              });
              return;
            }
          }
        } catch (e) {
          console.warn('[OnboardingStore] Could not read localStorage:', e);
        }

        set({ _isLoading: true, _isSyncing: true, _syncError: null });

        // Master timeout - guarantee function returns even if queries hang
        const INIT_TIMEOUT_MS = 15000;
        let timedOut = false;
        const timeoutId = setTimeout(() => {
          timedOut = true;
          console.warn('[OnboardingStore] ⏱️ Master timeout reached - defaulting to complete');
          set({
            _isLoading: false,
            _isSyncing: false,
            _hasAuthoritativeData: true,
            isOnboardingComplete: true,
            isOnboardingActive: false,
          });
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
            // No user - show onboarding (they'll need to sign up)
            clearTimeout(timeoutId);
            set({
              _isLoading: false,
              _isSyncing: false,
              _hasAuthoritativeData: true,
              isOnboardingComplete: false,
              isOnboardingActive: true,
              currentStep: ONBOARDING_STEPS.GAMIFICATION_MODE,
            });
            console.log('[OnboardingStore] ✅ Initialized (no user)');
            return;
          }

          set({ _lastUserId: userId });

          const { data, error } = await withTimeout(
            supabase
              .from('user_profiles')
              .select('onboarding_completed, display_name, character_gender, preferences')
              .eq('id', userId)
              .maybeSingle()
          );

          // If query timed out, default to complete (don't show onboarding)
          if (error === 'timeout') {
            console.warn('[OnboardingStore] ⏱️ Query timed out - defaulting to complete');
            clearTimeout(timeoutId);
            if (!timedOut) {
              set({
                _isLoading: false,
                _isSyncing: false,
                _hasAuthoritativeData: false, // Not authoritative - query failed
                isOnboardingComplete: true,
                isOnboardingActive: false,
              });
            }
            console.log('[OnboardingStore] ✅ Initialized (timeout, skipping onboarding)');
            return;
          }

          if (error) {
            console.error('[OnboardingStore] ❌ Supabase error:', error);
            // On error, default to complete to avoid blocking users
            clearTimeout(timeoutId);
            if (!timedOut) {
              set({
                _isLoading: false,
                _isSyncing: false,
                _syncError: typeof error === 'string' ? error : error.message,
                _hasAuthoritativeData: false,
                isOnboardingComplete: true,
                isOnboardingActive: false,
              });
            }
            console.log('[OnboardingStore] ✅ Initialized (with error, skipping onboarding)');
            return;
          }

          if (!data) {
            // New user - no profile exists yet, show onboarding
            clearTimeout(timeoutId);
            if (!timedOut) {
              set({
                _isLoading: false,
                _isSyncing: false,
                _hasAuthoritativeData: true,
                isOnboardingComplete: false,
                isOnboardingActive: true,
                currentStep: ONBOARDING_STEPS.GAMIFICATION_MODE,
              });
            }
            console.log('[OnboardingStore] ✅ Initialized (new user)');
            return;
          }

          // User exists - check onboarding status from Supabase
          const isComplete = data.onboarding_completed === true;
          const preferences = data.preferences || {};

          console.log('[OnboardingStore] DB data:', {
            onboarding_completed: data.onboarding_completed,
            isComplete,
            display_name: data.display_name
          });

          clearTimeout(timeoutId);
          if (!timedOut) {
            set({
              profile: {
                username: data.display_name || '',
                displayName: data.display_name || '',
                gender: data.character_gender || null,
              },
              lifeGoals: preferences.life_goals || [],
              dailyCommitment: preferences.daily_commitment || 15,
              gamificationMode: preferences.gamification_mode || null,
              isOnboardingComplete: isComplete,
              isOnboardingActive: !isComplete,
              currentStep: isComplete ? ONBOARDING_STEPS.COMPLETED : ONBOARDING_STEPS.GAMIFICATION_MODE,
              _hasAuthoritativeData: true,
              _lastSyncedAt: new Date().toISOString(),
              _isLoading: false,
              _isSyncing: false,
            });
          }
          console.log('[OnboardingStore] ✅ Initialized');
        } catch (error) {
          console.error('[OnboardingStore] ❌ Exception:', error);
          clearTimeout(timeoutId);
          // On exception, default to complete to avoid blocking users
          if (!timedOut) {
            set({
              _syncError: error.message,
              _isLoading: false,
              _isSyncing: false,
              _hasAuthoritativeData: true,
              isOnboardingComplete: true,
              isOnboardingActive: false,
            });
          }
          console.log('[OnboardingStore] ✅ Initialized (with exception, using defaults)');
        }
      },

      // Sync current state to Supabase - returns true on success, false on failure
      syncToSupabase: async () => {
        const userId = await getCurrentUserId();
        if (!userId) return false;

        const state = get();
        const nameToSave = state.profile.displayName || state.profile.username || '';

        try {
          // Note: character_gender is synced by avatarStore, not here
          const profileData = {
            id: userId,
            username: nameToSave,
            display_name: nameToSave,
            onboarding_completed: state.isOnboardingComplete,
            preferences: {
              life_goals: state.lifeGoals,
              daily_commitment: state.dailyCommitment,
              gamification_mode: state.gamificationMode,
              module_setup: state.moduleSetup,
            },
            updated_at: new Date().toISOString(),
          };

          // Use upsert to handle race conditions with other stores
          const { error } = await supabase
            .from('user_profiles')
            .upsert(profileData, {
              onConflict: 'id',
              ignoreDuplicates: false,
            });

          if (error) throw error;

          set({ _lastSyncedAt: new Date().toISOString(), _syncError: null });
          console.log('[Onboarding] Synced to Supabase');
          return true;
        } catch (error) {
          // Ignore 409 conflicts - another store may have synced first
          if (error?.code === '23505' || error?.message?.includes('conflict')) {
            console.log('[Onboarding] Sync conflict (another store synced first), ignoring');
            return true; // Treat conflict as success
          }
          console.error('[Onboarding] Failed to sync to Supabase:', error);
          set({ _syncError: error.message });
          return false;
        }
      },

      // ============================================
      // ACTIONS
      // ============================================

      // Start onboarding
      startOnboarding: () => {
        set({
          isOnboardingActive: true,
          isOnboardingComplete: false,
          currentStep: ONBOARDING_STEPS.GAMIFICATION_MODE,
          startedAt: new Date().toISOString(),
          novaState: 'welcoming',
          novaDialogueIndex: 0,
        });
      },

      // Set gamification mode
      setGamificationMode: (mode) => {
        set({
          gamificationMode: mode,
          novaState: 'excited',
        });
      },

      // Update profile
      updateProfile: (profileData) => {
        set((state) => ({
          profile: { ...state.profile, ...profileData },
        }));

        // Sync displayName/username to Supabase immediately so it persists
        // even if onboarding isn't completed yet
        if (profileData.displayName || profileData.username) {
          get().syncProfileToSupabase();
        }
      },

      // Sync just the profile data to Supabase (for real-time persistence)
      syncProfileToSupabase: async () => {
        const userId = await getCurrentUserId();
        if (!userId) return;

        const state = get();
        const nameToSave = state.profile.displayName || state.profile.username || '';

        if (!nameToSave) return; // Don't sync empty names

        try {
          await supabase
            .from('user_profiles')
            .upsert({
              id: userId,
              username: nameToSave,
              display_name: nameToSave,
              updated_at: new Date().toISOString(),
            }, {
              onConflict: 'id',
              ignoreDuplicates: false,
            });
        } catch (error) {
          // Silently fail - will sync on completion anyway
          console.warn('[Onboarding] Profile sync failed:', error.message);
        }
      },

      // Set life goals
      setLifeGoals: (goals) => {
        set({ lifeGoals: goals });
      },

      // Set daily commitment
      setDailyCommitment: (minutes) => {
        set({ dailyCommitment: minutes });
      },

      // Update module setup data
      updateModuleSetup: (moduleId, data) => {
        set((state) => ({
          moduleSetup: {
            ...state.moduleSetup,
            [moduleId]: data,
          },
        }));
      },

      // Mark tour section complete
      completeTourSection: (section) => {
        set((state) => ({
          tourCompleted: {
            ...state.tourCompleted,
            [section]: true,
          },
        }));
      },

      // Add invited friend
      addInvitedFriend: (friendData) => {
        set((state) => ({
          invitedFriends: [...state.invitedFriends, friendData],
        }));
      },

      // Skip social
      skipSocial: () => {
        set({ skippedSocial: true });
      },

      // Update Nova state
      setNovaState: (state) => {
        set({ novaState: state });
      },

      // Advance Nova dialogue
      advanceDialogue: () => {
        set((state) => ({
          novaDialogueIndex: state.novaDialogueIndex + 1,
        }));
      },

      // Reset dialogue index (for new step)
      resetDialogue: () => {
        set({ novaDialogueIndex: 0 });
      },

      // Add XP earned during onboarding
      addOnboardingXP: (amount) => {
        set((state) => ({
          xpEarned: state.xpEarned + amount,
        }));
      },

      // Navigate to next step
      nextStep: () => {
        const { currentStep, gamificationMode, skippedSteps } = get();
        const currentIndex = STEP_ORDER.indexOf(currentStep);

        if (currentIndex < STEP_ORDER.length - 1) {
          let nextIndex = currentIndex + 1;
          let nextStep = STEP_ORDER[nextIndex];

          // Skip gamification tour for minimal mode
          if (nextStep === ONBOARDING_STEPS.GAMIFICATION_TOUR && gamificationMode === 'minimal') {
            nextIndex++;
            nextStep = STEP_ORDER[nextIndex];
          }

          set({
            currentStep: nextStep,
            novaDialogueIndex: 0,
            novaState: nextStep === ONBOARDING_STEPS.LAUNCH ? 'celebrating' : 'neutral',
          });
        }
      },

      // Navigate to previous step
      prevStep: () => {
        const { currentStep, gamificationMode } = get();
        const currentIndex = STEP_ORDER.indexOf(currentStep);

        if (currentIndex > 0) {
          let prevIndex = currentIndex - 1;
          let prevStep = STEP_ORDER[prevIndex];

          // Skip gamification tour for minimal mode when going back
          if (prevStep === ONBOARDING_STEPS.GAMIFICATION_TOUR && gamificationMode === 'minimal') {
            prevIndex--;
            prevStep = STEP_ORDER[prevIndex];
          }

          set({
            currentStep: prevStep,
            novaDialogueIndex: 0,
          });
        }
      },

      // Skip current step
      skipStep: () => {
        const { currentStep } = get();
        set((state) => ({
          skippedSteps: [...state.skippedSteps, currentStep],
        }));
        get().nextStep();
      },

      // Go to specific step
      goToStep: (step) => {
        if (STEP_ORDER.includes(step)) {
          set({
            currentStep: step,
            novaDialogueIndex: 0,
          });
        }
      },

      // Complete onboarding - returns true on success, false on failure
      completeOnboarding: async () => {
        // Set up the default dashboard layout for new users
        // This ensures the dashboard tour has all the expected elements visible
        try {
          const dashboardStore = useDashboardStore.getState();
          dashboardStore.setupOnboardingDashboard();
        } catch (e) {
          console.warn('[Onboarding] Could not set up onboarding dashboard:', e);
        }

        set({
          isOnboardingActive: false,
          isOnboardingComplete: true,
          currentStep: ONBOARDING_STEPS.COMPLETED,
          completedAt: new Date().toISOString(),
          novaState: 'celebrating',
        });

        // CRITICAL: Persist to localStorage as backup
        // This ensures onboarding won't show again even if Supabase sync fails
        try {
          localStorage.setItem('lifeos-new-onboarding', JSON.stringify({
            state: {
              isOnboardingComplete: true,
              isOnboardingActive: false,
            }
          }));
          console.log('[Onboarding] ✅ Saved completion to localStorage');
        } catch (e) {
          console.warn('[Onboarding] Could not save to localStorage:', e);
        }

        // Award 100 starter credits
        try {
          const gamificationStore = await getGamificationStore();
          await gamificationStore.getState().addCredits(100, 'onboarding_bonus');
          console.log('[Onboarding] Awarded 100 starter credits');
        } catch (e) {
          console.warn('[Onboarding] Could not award starter credits:', e);
        }

        // Sync all onboarding data to Supabase
        // This is CRITICAL - if sync fails, on refresh user will be sent back to onboarding
        const syncSuccess = await get().syncToSupabase();

        if (!syncSuccess) {
          console.error('[Onboarding] ❌ Failed to sync completion to Supabase!');
          // Still return true - local state is set, will retry on next action
        }

        console.log('[Onboarding] ✅ Onboarding completed and synced');
        return true;
      },

      // Reset onboarding (for re-onboard feature)
      resetOnboarding: async () => {
        set({
          currentStep: ONBOARDING_STEPS.GAMIFICATION_MODE,
          isOnboardingActive: true,
          isOnboardingComplete: false,
          startedAt: new Date().toISOString(),
          completedAt: null,
          gamificationMode: null,
          profile: {
            username: '',
            displayName: '',
            gender: null,
          },
          lifeGoals: [],
          dailyCommitment: 15,
          moduleSetup: {
            health: null,
            financial: null,
            productivity: null,
            knowledge: null,
          },
          tourCompleted: {
            xp: false,
            avatar: false,
            skills: false,
            bazaar: false,
            purchase: false,
          },
          invitedFriends: [],
          skippedSocial: false,
          novaState: 'welcoming',
          novaDialogueIndex: 0,
          skippedSteps: [],
          xpEarned: 0,
        });

        // Clear localStorage when resetting
        try {
          localStorage.removeItem('lifeos-new-onboarding');
          console.log('[Onboarding] Cleared localStorage');
        } catch (e) {
          console.warn('[Onboarding] Could not clear localStorage:', e);
        }

        // Reset onboarding status in Supabase
        const userId = await getCurrentUserId();
        if (userId) {
          try {
            await supabase
              .from('user_profiles')
              .update({
                onboarding_completed: false,
                updated_at: new Date().toISOString(),
              })
              .eq('id', userId);
          } catch (e) {
            console.warn('[Onboarding] Could not reset onboarding in Supabase:', e);
          }
        }
      },

      // ============================================
      // COMPUTED / HELPERS
      // ============================================

      // Get current step index
      getCurrentStepIndex: () => {
        const { currentStep } = get();
        return STEP_ORDER.indexOf(currentStep);
      },

      // Get progress percentage
      getProgress: () => {
        const { currentStep } = get();
        const currentIndex = STEP_ORDER.indexOf(currentStep);
        const totalSteps = STEP_ORDER.length - 1; // Exclude COMPLETED
        return Math.round((currentIndex / totalSteps) * 100);
      },

      // Get modules to setup based on selected goals
      getModulesToSetup: () => {
        const { lifeGoals } = get();
        const modules = new Set();

        lifeGoals.forEach(goalId => {
          const goal = LIFE_GOALS.find(g => g.id === goalId);
          if (goal) {
            goal.modules.forEach(m => modules.add(m));
          }
        });

        return Array.from(modules);
      },

      // Check if step is required
      isStepRequired: (step) => {
        return [
          ONBOARDING_STEPS.GAMIFICATION_MODE,
          ONBOARDING_STEPS.PROFILE_SETUP,
        ].includes(step);
      },

      // Check if step can be skipped
      canSkipStep: (step) => {
        const { gamificationMode } = get();

        // Can't skip required steps
        if (get().isStepRequired(step)) return false;

        // Launch step can't be skipped
        if (step === ONBOARDING_STEPS.LAUNCH) return false;

        return true;
      },

      // Get Nova dialogue for current step
      getCurrentDialogue: () => {
        const { currentStep, novaDialogueIndex, profile } = get();
        const dialogues = NOVA_DIALOGUES[currentStep];

        if (!dialogues) return null;

        if (dialogues.intro && Array.isArray(dialogues.intro)) {
          if (novaDialogueIndex < dialogues.intro.length) {
            let text = dialogues.intro[novaDialogueIndex];
            // Replace placeholders
            text = text.replace('{name}', profile.displayName || profile.username || 'traveler');
            return text;
          }
        }

        return null;
      },

      // Check if dialogue is complete for current step
      isDialogueComplete: () => {
        const { currentStep, novaDialogueIndex } = get();
        const dialogues = NOVA_DIALOGUES[currentStep];

        if (!dialogues || !dialogues.intro) return true;

        return novaDialogueIndex >= dialogues.intro.length;
      },
    })
  // NO persist middleware - onboarding completion is ONLY stored in Supabase
);

export default useNewOnboardingStore;

// Hook to initialize store from Supabase on app load
export const initializeOnboardingStore = async (userId = null) => {
  await useNewOnboardingStore.getState().initializeFromSupabase(userId);
};
