import React, { useEffect, useState, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth, AuthProvider } from './hooks/useAuth';
import MainLayout from './components/layout/MainLayout';

// Capacitor native services
import { initializeNativeServices } from './services/nativeService';
import LoadingScreen from './components/shared/LoadingScreen';
import InitialLoadingScreen from './components/shared/InitialLoadingScreen';
import ErrorBoundary from './components/ErrorBoundary';
import { ToastProvider } from './components/ui/Toast';
import { CommandPalette } from './components/ui/CommandPalette';
import { CelebrationProvider } from './components/ui/Celebration';
import EquipmentUnlockToast from './components/gamification/EquipmentUnlockToast';
import GlobalNotifications from './components/gamification/GlobalNotifications';
import RealtimeProvider from './components/RealtimeProvider';
import { ModeAwareRoute } from './components/layout/ModeAwareRoute';

// Integrated Onboarding (Nova-guided setup within actual pages)
import useIntegratedOnboardingStore from './stores/integratedOnboardingStore';
import EnhancedOnboarding from './components/onboarding/EnhancedOnboarding';

// Full Onboarding Flow (6-step improved experience with constellation picker)
import ImprovedOnboarding from './components/onboarding/ImprovedOnboarding';
import { ImmersiveOnboarding } from './components/onboarding/cinematic';
import { useNewOnboardingStore, initializeOnboardingStore } from './stores/newOnboardingStore';

// Early auth initialization - CRITICAL for preventing hanging queries
import { initializeSupabaseAuth, getCachedUserId } from './lib/supabase';

// Onboarding Page wrapper component
const OnboardingPage = lazy(() => Promise.resolve({
  default: function OnboardingPageWrapper() {
    const navigate = useNavigate();
    const location = useLocation();
    const { isOnboardingComplete, resetOnboarding } = useNewOnboardingStore();

    // Check for force parameter to bypass redirect (for testing)
    const searchParams = new URLSearchParams(location.search);
    const forceShow = searchParams.get('force') === 'true';

    // Reset onboarding if force parameter is present
    React.useEffect(() => {
      if (forceShow) {
        resetOnboarding();
      }
    }, [forceShow, resetOnboarding]);

    // If already complete and not forcing, redirect to dashboard
    React.useEffect(() => {
      if (isOnboardingComplete && !forceShow) {
        navigate('/', { replace: true });
      }
    }, [isOnboardingComplete, forceShow, navigate]);

    const handleComplete = () => {
      navigate('/', { replace: true });
    };

    return <ImmersiveOnboarding />;
  }
}));

// Helper function to check if onboarding is needed
// IMPORTANT: This should only be called AFTER stores have initialized from Supabase
function shouldShowOnboarding(onboardingState) {
  // If we have the store state, use it (synced from Supabase)
  if (onboardingState !== undefined) {
    return onboardingState.isOnboardingActive && !onboardingState.isOnboardingComplete;
  }

  // Fallback to localStorage only if store state not available
  try {
    const stored = localStorage.getItem('lifeos-new-onboarding');
    if (stored) {
      const parsed = JSON.parse(stored);
      const isComplete = parsed?.state?.isOnboardingComplete === true;
      const isActive = parsed?.state?.isOnboardingActive === true;
      // Only show onboarding if not complete AND actively in onboarding
      return !isComplete && isActive;
    } else {
      // No stored state means first time user - but wait for Supabase to confirm
      return false; // Don't redirect yet, wait for store init
    }
  } catch {
    return false;
  }
}

// Import navigation hooks for OnboardingPage and redirect
import { useNavigate, useLocation } from 'react-router-dom';

// Supabase store initialization
import { initializeAvatarStore } from './stores/avatarStore';
import { initializeHealthStore } from './stores/healthStore';
import { initializeFinancialStore } from './stores/financialStore';
import { initializeCalendarStore } from './stores/calendarStore';
import { initializeKnowledgeStore } from './stores/knowledgeStore';
import { initializeSkillsStore } from './stores/skillsStore';
import { initializeResolutionStore } from './stores/resolutionStore';
import { initializeProductivityStore } from './stores/productivityStore';
import { initializeWorkoutStore } from './stores/workoutStore';
import { initializeQuestsStore } from './stores/questsStore';
import { initializeAchievementsStore } from './stores/achievementsStore';
import { initializePetStore } from './stores/petStore';
import { initializeGamificationStore, useGamificationStore } from './stores/gamificationStore';
import { initializeContentStore } from './stores/contentStore';
import { initializePurposeStore } from './stores/purposeStore';
import { initializeQuotesStore } from './stores/quotesStore';
import { initializeDailyTasksStore } from './stores/dailyTasksStore';
import { initializeDashboardStore } from './stores/dashboardStore';
import { initializeThemeStore } from './stores/themeStore';
import { initializeBadHabitsStore } from './stores/badHabitsStore';
import { initializePerkStore } from './stores/perkStore';
import { initializeSocialStore } from './stores/socialStore';
import { initializeModuleMasteryStore } from './stores/moduleMasteryStore';
import { initializeSkillPointsStore } from './stores/skillPointsStore';
import { initializeBossStore } from './stores/bossStore';
import { initializeCustomStreaksStore } from './stores/customStreaksStore';
import { initializeGamificationModeStore } from './stores/gamificationModeStore';
import { initializeSettingsStore } from './stores/settingsStore';
import { initializeTourStore } from './stores/tourStore';
import { initializeLevelProgressionStore } from './stores/levelProgressionStore';
// Note: PvP stores are lazy-loaded on Social page for faster initial load
import { initializeNotificationService } from './services/notificationService';

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Legacy Onboarding (kept for reference, but using integrated approach now)
// const NovaOnboarding = lazy(() => import('./components/onboarding/NovaOnboarding'));

// Auth page for login/signup
const Auth = lazy(() => import('./pages/Auth'));
const AuthCallback = lazy(() => import('./pages/AuthCallback'));

// Lazy load all page components
const Dashboard = lazy(() => import('./pages/DashboardNew'));

// New mega-module pages (mobile-first)
const Track = lazy(() => import('./pages/Track'));
const Progress = lazy(() => import('./pages/Progress'));
const More = lazy(() => import('./pages/More'));
const Modules = lazy(() => import('./pages/Modules'));
const Character = lazy(() => import('./pages/Character'));
const Settings = lazy(() => import('./pages/Settings'));

// Individual module pages (with dashboards)
const Productivity = lazy(() => import('./pages/Productivity'));
const Health = lazy(() => import('./pages/Health'));
const Knowledge = lazy(() => import('./pages/Knowledge'));
const Learn = lazy(() => import('./pages/KnowledgeNew'));
const Skills = lazy(() => import('./pages/Skills'));
const JournalBook = lazy(() => import('./pages/JournalBookPage'));
const JournalWriter = lazy(() => import('./pages/JournalWriter'));
const Calendar = lazy(() => import('./pages/CalendarNew'));
const PurposeValues = lazy(() => import('./pages/PurposeValues'));
const Financial = lazy(() => import('./pages/Financial'));
const Missions = lazy(() => import('./pages/Missions'));
const Streaks = lazy(() => import('./pages/Streaks'));
const Rewards = lazy(() => import('./pages/Rewards'));
const Discoveries = lazy(() => import('./pages/Discoveries'));
const Resolutions = lazy(() => import('./pages/Resolutions'));

// Demo pages
const ConstellationsTest = lazy(() => import('./features/constellations/demo/ConstellationsTestPage'));
const ConstellationsDemo = lazy(() => import('./pages/ConstellationsDemo'));
const EvolutionShowcase = lazy(() => import('./components/avatar/EvolutionShowcase'));
const EquipmentInventory = lazy(() => import('./components/avatar/EquipmentInventory'));
const Social = lazy(() => import('./pages/Social'));
const AICompanion = lazy(() => import('./pages/AICompanion'));
const EquipmentTest = lazy(() => import('./pages/EquipmentTest'));
const EquipmentTestHeroine = lazy(() => import('./pages/EquipmentTestHeroine'));
const CombatDemo = lazy(() => import('./pages/CombatDemo'));
const LevelUpTest = lazy(() => import('./pages/LevelUpTest'));
const AvatarEthnicities = lazy(() => import('./pages/AvatarEthnicities'));

// Protected Route - requires authentication
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return children;
}

// Inner app content that uses useAuth (must be inside AuthProvider)
function AppContent() {
  // Legacy welcome modal state (kept for potential fallback)
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  // Track authenticated user for store re-initialization
  const { user, loading: authLoading } = useAuth();
  const [hasInitialized, setHasInitialized] = useState(false);

  // Note: Onboarding now uses route-based approach (/onboarding) instead of overlay

  // Get onboarding state from store (synced from Supabase)
  const { isOnboardingActive, isOnboardingComplete } = useNewOnboardingStore();

  // Redirect to onboarding for first-time users - ONLY after stores have initialized
  useEffect(() => {
    // Wait for auth to finish loading first
    if (authLoading) return;

    // Only check onboarding if user is authenticated
    if (!user) return;

    // CRITICAL: Wait for stores to initialize from Supabase before checking onboarding
    // This prevents race condition where stale localStorage triggers incorrect redirect
    if (!hasInitialized) return;

    // Get FRESH values directly from the store (not from React render cycle)
    // This avoids race condition where React has stale values from localStorage
    const storeState = useNewOnboardingStore.getState();
    const freshIsOnboardingActive = storeState.isOnboardingActive;
    const freshIsOnboardingComplete = storeState.isOnboardingComplete;
    const hasAuthoritativeData = storeState._hasAuthoritativeData;

    console.log('[App] Checking onboarding:', {
      freshIsOnboardingActive,
      freshIsOnboardingComplete,
      hasAuthoritativeData
    });

    // CRITICAL: Only redirect if we have authoritative data from Supabase
    // If data timed out, we keep localStorage state but DON'T redirect (might be stale)
    if (!hasAuthoritativeData) {
      console.log('[App] ⚠️ No authoritative data yet, skipping onboarding redirect');
      return;
    }

    // Check if we should show onboarding using FRESH store state (synced from Supabase)
    const needsOnboarding = freshIsOnboardingActive && !freshIsOnboardingComplete;
    if (needsOnboarding) {
      // Only redirect if not already on onboarding page, auth page, or demo pages
      const excludedPaths = ['/onboarding', '/auth', '/combat-demo', '/equipment-test', '/level-up-test'];
      const shouldRedirect = !excludedPaths.some(path => window.location.pathname.includes(path));
      if (shouldRedirect) {
        console.log('🎯 First-time user detected, redirecting to onboarding...');
        window.location.href = '/onboarding';
      }
    }
  }, [user, authLoading, hasInitialized]);

  // Enable dark mode and initialize native services on app load
  useEffect(() => {
    document.documentElement.classList.add('dark');

    // Initialize Capacitor native services (splash screen, status bar, etc.)
    initializeNativeServices();
  }, []);

  // Initialize/re-initialize stores when auth state changes
  // This ensures stores load user data after sign-in (localStorage was cleared)
  useEffect(() => {
    const initStores = async () => {
      // Wait for auth to finish loading before initializing stores
      if (authLoading) {
        console.log('[App] Waiting for auth to load...');
        return;
      }

      // Only initialize if we have a user OR on first mount (for dev mode)
      if (!user && hasInitialized) return;

      // Helper to wrap store init with logging AND timeout
      // This guarantees each store completes within 20s even if something hangs
      const initWithLog = async (name, initFn) => {
        const STORE_TIMEOUT_MS = 20000;
        try {
          const startTime = Date.now();
          await Promise.race([
            initFn(),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error(`${name} timed out after ${STORE_TIMEOUT_MS}ms`)), STORE_TIMEOUT_MS)
            )
          ]);
          const elapsed = Date.now() - startTime;
          console.log(`[App] ✅ ${name} (${elapsed}ms)`);
        } catch (error) {
          console.error(`[App] ❌ ${name}:`, error.message);
          // Don't re-throw - we want to continue even if a store fails
        }
      };

      try {
        const startTime = Date.now();

        // CRITICAL: Initialize Supabase auth using onAuthStateChange (event-based, doesn't hang)
        // This caches the session so stores can use getCachedUserId() instead of calling getSession()
        console.log('[App] 🔐 Initializing Supabase auth (event-based)...');
        const authResult = await initializeSupabaseAuth();
        console.log('[App] 🔐 Auth initialized:', authResult.timedOut ? 'TIMED OUT' : 'OK');

        // Use cached user ID (instant, doesn't hang) or fall back to user.id from useAuth
        const userId = getCachedUserId() || user?.id;
        console.log('[App] 🚀 Starting store initialization for user:', userId || 'NO_USER_ID');

        if (!userId) {
          console.warn('[App] ⚠️ No userId - stores will use defaults without Supabase queries');
        }

        // Initialize OnboardingStore FIRST (alone) to check if user needs onboarding
        console.log('[App] 🎯 Step 1: Initializing OnboardingStore...');
        await initWithLog('OnboardingStore', () => initializeOnboardingStore(userId));

        // Initialize all other stores in parallel
        console.log('[App] 📦 Initializing other stores in parallel...');
        await Promise.all([
          // Critical UI stores
          initWithLog('ThemeStore', () => initializeThemeStore(userId)),
          initWithLog('DashboardStore', () => initializeDashboardStore(userId)),
          initWithLog('AvatarStore', () => initializeAvatarStore(userId)),
          initWithLog('GamificationStore', () => initializeGamificationStore(userId)),
          initWithLog('GamificationModeStore', () => initializeGamificationModeStore(userId)),
          initWithLog('SettingsStore', () => initializeSettingsStore(userId)),
          // Module stores
          initWithLog('HealthStore', () => initializeHealthStore(userId)),
          initWithLog('FinancialStore', () => initializeFinancialStore(userId)),
          initWithLog('CalendarStore', () => initializeCalendarStore(userId)),
          initWithLog('ProductivityStore', () => initializeProductivityStore(userId)),
          initWithLog('KnowledgeStore', () => initializeKnowledgeStore(userId)),
          initWithLog('DailyTasksStore', () => initializeDailyTasksStore(userId)),
          // Feature stores
          initWithLog('SkillsStore', () => initializeSkillsStore(userId)),
          initWithLog('ResolutionStore', () => initializeResolutionStore(userId)),
          initWithLog('WorkoutStore', () => initializeWorkoutStore(userId)),
          initWithLog('QuestsStore', () => initializeQuestsStore(userId)),
          initWithLog('AchievementsStore', () => initializeAchievementsStore(userId)),
          initWithLog('PetStore', () => initializePetStore(userId)),
          // Secondary stores
          initWithLog('ContentStore', () => initializeContentStore(userId)),
          initWithLog('PurposeStore', () => initializePurposeStore(userId)),
          initWithLog('QuotesStore', () => initializeQuotesStore(userId)),
          initWithLog('BadHabitsStore', () => initializeBadHabitsStore(userId)),
          initWithLog('SocialStore', () => initializeSocialStore(userId)),
          initWithLog('ModuleMasteryStore', () => initializeModuleMasteryStore(userId)),
          initWithLog('SkillPointsStore', () => initializeSkillPointsStore(userId)),
          initWithLog('BossStore', () => initializeBossStore(userId)),
          initWithLog('CustomStreaksStore', () => initializeCustomStreaksStore(userId)),
          initWithLog('TourStore', () => initializeTourStore(userId)),
        ]);

        // Stores that depend on others being initialized first
        await initWithLog('PerkStore', () => initializePerkStore(userId));
        const gamificationState = useGamificationStore?.getState?.();
        await initWithLog('LevelProgressionStore', () => initializeLevelProgressionStore(gamificationState?.level || 1, userId));

        // Initialize notification service after settings are loaded
        initializeNotificationService();

        // DEBUG: Check onboarding state right after init
        const onboardingState = useNewOnboardingStore.getState();
        console.log('[App] 🔍 Onboarding state after init:', {
          isOnboardingActive: onboardingState.isOnboardingActive,
          isOnboardingComplete: onboardingState.isOnboardingComplete,
          currentStep: onboardingState.currentStep,
        });

        const elapsed = Date.now() - startTime;
        console.log(`[App] 🚀 All stores initialized in ${elapsed}ms`);
        setHasInitialized(true);
      } catch (error) {
        console.error('[App] Failed to initialize stores:', error);
        setHasInitialized(true);
      }
    };
    initStores();
  }, [user, authLoading]);

  // Show loading screen while stores are initializing for authenticated users
  // CRITICAL: This must show BEFORE any routes render to prevent flash of empty dashboard
  // The check is simple: if user exists and stores aren't ready, show loading
  // Auth page handles its own state, but once user is authenticated we need stores
  if (user && !hasInitialized && !authLoading) {
    return <InitialLoadingScreen message="Preparing your journey" />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider position="bottom-right" maxToasts={5}>
        <CelebrationProvider>
        <RealtimeProvider>
        <Router>
          <Suspense fallback={<LoadingScreen />}>
            <Routes>
              {/* Auth route - login/signup */}
              <Route path="/auth" element={<Auth />} />
              <Route path="/auth/callback" element={<AuthCallback />} />

              {/* Onboarding route - outside MainLayout for full-screen experience */}
              <Route path="/onboarding" element={
                <ProtectedRoute>
                  <OnboardingPage />
                </ProtectedRoute>
              } />

              {/* Combat Demo - standalone page for testing effects */}
              <Route path="/combat-demo" element={<CombatDemo />} />

              {/* Main app routes - protected */}
              <Route path="/*" element={
                <ProtectedRoute>
                <MainLayout>
                <Routes>
                  {/* Main mobile navigation - 5 tabs: Home, Modules, Character, Social, Quests, Settings */}
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/modules" element={<Modules />} />
                  {/* Character page - hidden in minimal mode */}
                  <Route path="/character" element={
                    <ModeAwareRoute requiredVisibility="showCharacterPage" redirectTo="/modules">
                      <Character />
                    </ModeAwareRoute>
                  } />
                  <Route path="/social" element={<Social />} />
                  <Route path="/quests" element={<Missions />} />
                  <Route path="/settings" element={<Settings />} />

                  {/* Legacy routes for compatibility */}
                  <Route path="/track" element={<Track />} />
                  <Route path="/progress" element={<Progress />} />
                  <Route path="/more" element={<More />} />

                  {/* Module routes (with dashboards) */}
                  <Route path="/productivity" element={<Productivity />} />
                  <Route path="/health" element={<Health />} />
                  <Route path="/knowledge" element={<Knowledge />} />

                  {/* Journal sub-routes */}
                  <Route path="/journal" element={<JournalBook />} />
                  <Route path="/journal/write" element={<JournalWriter />} />

                  {/* Additional feature pages (accessed from More tab or deep links) */}
                  <Route path="/calendar" element={<Calendar />} />
                  <Route path="/purpose" element={<PurposeValues />} />
                  <Route path="/financial" element={<Financial />} />
                  {/* Rewards - hidden in minimal mode */}
                  <Route path="/rewards" element={
                    <ModeAwareRoute requiredVisibility="showBazaar" redirectTo="/quests">
                      <Rewards />
                    </ModeAwareRoute>
                  } />
                  <Route path="/streaks" element={<Streaks />} />
                  <Route path="/discoveries" element={<Discoveries />} />
                  <Route path="/resolutions" element={<Resolutions />} />
                  <Route path="/learn" element={<Learn />} />
                  <Route path="/skills" element={<Skills />} />

                  {/* Equipment/Avatar - requires showEquipment */}
                  <Route path="/avatar" element={
                    <ModeAwareRoute requiredVisibility="showEquipment" redirectTo="/character">
                      <ErrorBoundary>
                        <EquipmentInventory />
                      </ErrorBoundary>
                    </ModeAwareRoute>
                  } />

                  {/* AI Companion */}
                  <Route path="/ai" element={<AICompanion />} />

                  {/* Demo pages - cosmic mode only */}
                  <Route path="/constellations-test" element={
                    <ModeAwareRoute requiredVisibility="showConstellationEffects" redirectTo="/skills">
                      <ConstellationsTest />
                    </ModeAwareRoute>
                  } />
                  <Route path="/constellations-demo" element={
                    <ModeAwareRoute requiredVisibility="showConstellationEffects" redirectTo="/skills">
                      <ConstellationsDemo />
                    </ModeAwareRoute>
                  } />
                  <Route path="/evolution" element={
                    <ModeAwareRoute requiredVisibility="showEvolutionGallery" redirectTo="/character">
                      <EvolutionShowcase />
                    </ModeAwareRoute>
                  } />
                  <Route path="/equipment-test" element={
                    <EquipmentTest />
                  } />
                  <Route path="/equipment-test-heroine" element={
                    <EquipmentTestHeroine />
                  } />
                  <Route path="/level-up-test" element={
                    <LevelUpTest />
                  } />
                  <Route path="/avatar-ethnicities" element={
                    <AvatarEthnicities />
                  } />
                </Routes>
                </MainLayout>
                </ProtectedRoute>
              } />
          </Routes>
          </Suspense>
          {/* Command Palette - Cmd+K (must be inside Router) */}
          <CommandPalette />

          {/* Equipment Unlock Notifications - shows pixel art when gear unlocks */}
          <EquipmentUnlockToast />

          {/* Global Notifications - achievements, XP gains, level ups */}
          <GlobalNotifications />


          {/* Enhanced Onboarding - legacy fallback */}
          {showWelcomeModal && (
            <EnhancedOnboarding onComplete={() => setShowWelcomeModal(false)} />
          )}
        </Router>
        </RealtimeProvider>
        </CelebrationProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
}

// Main App component - wraps everything in AuthProvider
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App
