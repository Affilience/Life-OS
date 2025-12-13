import React, { useEffect, useState, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// DEVELOPMENT: Auth disabled
// import { useAuth } from './hooks/useAuth';
import MainLayout from './components/layout/MainLayout';

// Capacitor native services
import { initializeNativeServices } from './services/nativeService';
import LoadingScreen from './components/shared/LoadingScreen';
import ErrorBoundary from './components/ErrorBoundary';
import { ToastProvider } from './components/ui/Toast';
import { CommandPalette } from './components/ui/CommandPalette';
import { CelebrationProvider } from './components/ui/Celebration';
import RealtimeProvider from './components/RealtimeProvider';
import { ModeAwareRoute } from './components/layout/ModeAwareRoute';

// Integrated Onboarding (Nova-guided setup within actual pages)
import useIntegratedOnboardingStore from './stores/integratedOnboardingStore';
import EnhancedOnboarding from './components/onboarding/EnhancedOnboarding';

// Full Onboarding Flow (9-step experience with Nova guide and premium animations)
import NovaGuidedOnboarding from './components/onboarding/NovaGuidedOnboarding';
import { useNewOnboardingStore } from './stores/newOnboardingStore';

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
import { initializeGamificationStore } from './stores/gamificationStore';
import { initializeContentStore } from './stores/contentStore';
import { initializePurposeStore } from './stores/purposeStore';
import { initializeQuotesStore } from './stores/quotesStore';
import { initializeDailyTasksStore } from './stores/dailyTasksStore';
import { initializeDashboardStore } from './stores/dashboardStore';
import { initializeThemeStore } from './stores/themeStore';
import { initializeBadHabitsStore } from './stores/badHabitsStore';
import { initializePerkStore } from './stores/perkStore';
import { initializeSocialStore } from './stores/socialStore';

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

// DEVELOPMENT: Auth page disabled
// const Auth = lazy(() => import('./pages/Auth'));

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

// DEVELOPMENT: Protected Route disabled - direct access to all pages
// function ProtectedRoute({ children }) {
//   const { user, loading } = useAuth();
//
//   if (loading) {
//     return <LoadingSpinner />;
//   }
//
//   if (!user) {
//     return <Navigate to="/auth" replace />;
//   }
//
//   return children;
// }

function App() {
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  // Get integrated onboarding state (legacy)
  const { hasSeenWelcome } = useIntegratedOnboardingStore();

  // Get new onboarding state
  const { isOnboardingComplete: newOnboardingComplete, isOnboardingActive } = useNewOnboardingStore();

  // Check localStorage directly for initial state to avoid hydration race condition
  const [showNewOnboarding, setShowNewOnboarding] = useState(() => {
    try {
      const stored = localStorage.getItem('lifeos-new-onboarding');
      if (stored) {
        const parsed = JSON.parse(stored);
        // Check if onboarding is complete in persisted state
        return !parsed?.state?.isOnboardingComplete;
      }
      return true; // No stored state, show onboarding
    } catch {
      return true; // Error reading, show onboarding
    }
  });

  // Sync with store state after hydration
  useEffect(() => {
    // Only update if store says complete but we're still showing
    if (newOnboardingComplete && showNewOnboarding) {
      setShowNewOnboarding(false);
    }
  }, [newOnboardingComplete, showNewOnboarding]);

  // Legacy: Show welcome modal if user hasn't seen it (fallback)
  // DISABLED: New onboarding system replaces the old EnhancedOnboarding
  // useEffect(() => {
  //   if (!hasSeenWelcome && hasSeenIntro && newOnboardingComplete) {
  //     setShowWelcomeModal(true);
  //   }
  // }, [hasSeenWelcome, hasSeenIntro, newOnboardingComplete]);

  // Enable dark mode and initialize native services on app load
  useEffect(() => {
    document.documentElement.classList.add('dark');

    // Initialize Capacitor native services (splash screen, status bar, etc.)
    initializeNativeServices();
  }, []);

  // Initialize Supabase stores on app load
  useEffect(() => {
    const initStores = async () => {
      try {
        await Promise.all([
          initializeAvatarStore(),
          initializeHealthStore(),
          initializeFinancialStore(),
          initializeCalendarStore(),
          initializeKnowledgeStore(),
          initializeSkillsStore(),
          initializeResolutionStore(),
          initializeProductivityStore(),
          initializeWorkoutStore(),
          initializeQuestsStore(),
          initializeAchievementsStore(),
          initializePetStore(),
          initializeGamificationStore(),
          initializeContentStore(),
          initializePurposeStore(),
          initializeQuotesStore(),
          initializeDailyTasksStore(),
          initializeDashboardStore(),
          initializeThemeStore(),
          initializeBadHabitsStore(),
          initializeSocialStore(),
        ]);
        // Initialize perk store after other stores (needs stats data)
        initializePerkStore();
      } catch (error) {
        console.error('Failed to initialize stores from Supabase:', error);
      }
    };
    initStores();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider position="bottom-right" maxToasts={5}>
        <CelebrationProvider>
        <RealtimeProvider>
        <Router>
          <Suspense fallback={<LoadingScreen />}>
            <Routes>
              {/* DEVELOPMENT: Auth route disabled */}
              {/* <Route path="/auth" element={<Auth />} /> */}

              {/* DEVELOPMENT: All routes unprotected - direct access */}
              <Route path="/*" element={
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
                </Routes>
              </MainLayout>
            } />
          </Routes>
          </Suspense>
          {/* Command Palette - Cmd+K (must be inside Router) */}
          <CommandPalette />

          {/* Full Onboarding Flow - shown on first visit */}
          {showNewOnboarding && (
            <NovaGuidedOnboarding onComplete={() => setShowNewOnboarding(false)} />
          )}

          {/* Enhanced Onboarding - legacy fallback if new onboarding was completed */}
          {showWelcomeModal && !showNewOnboarding && (
            <EnhancedOnboarding onComplete={() => setShowWelcomeModal(false)} />
          )}
        </Router>
        </RealtimeProvider>
        </CelebrationProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
}

export default App
