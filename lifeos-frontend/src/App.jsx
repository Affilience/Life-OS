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
import EquipmentUnlockToast from './components/gamification/EquipmentUnlockToast';
import RealtimeProvider from './components/RealtimeProvider';
import { ModeAwareRoute } from './components/layout/ModeAwareRoute';

// Integrated Onboarding (Nova-guided setup within actual pages)
import useIntegratedOnboardingStore from './stores/integratedOnboardingStore';
import EnhancedOnboarding from './components/onboarding/EnhancedOnboarding';

// Full Onboarding Flow (6-step improved experience with constellation picker)
import ImprovedOnboarding from './components/onboarding/ImprovedOnboarding';
import { ImmersiveOnboarding } from './components/onboarding/cinematic';
import { useNewOnboardingStore, initializeOnboardingStore } from './stores/newOnboardingStore';

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

// Helper function to check if onboarding is needed (called once at app init)
function shouldShowOnboarding() {
  try {
    const stored = localStorage.getItem('lifeos-new-onboarding');
    if (stored) {
      const parsed = JSON.parse(stored);
      const isComplete = parsed?.state?.isOnboardingComplete === true;
      const isActive = parsed?.state?.isOnboardingActive === true;
      // Only show onboarding if not complete AND actively in onboarding
      return !isComplete && isActive;
    } else {
      // No stored state means first time user
      return true;
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
import { initializeModuleMasteryStore } from './stores/moduleMasteryStore';
import { initializeSkillPointsStore } from './stores/skillPointsStore';
import { initializeBossStore } from './stores/bossStore';
import { initializeCustomStreaksStore } from './stores/customStreaksStore';

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
const EquipmentTest = lazy(() => import('./pages/EquipmentTest'));

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
  // Legacy welcome modal state (kept for potential fallback)
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  // Note: Onboarding now uses route-based approach (/onboarding) instead of overlay

  // Redirect to onboarding for first-time users
  useEffect(() => {
    // Check if we should show onboarding (first-time user or incomplete onboarding)
    if (shouldShowOnboarding()) {
      // Only redirect if not already on onboarding page
      if (!window.location.pathname.includes('/onboarding')) {
        console.log('🎯 First-time user detected, redirecting to onboarding...');
        window.location.href = '/onboarding';
      }
    }
  }, []);

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
          initializeModuleMasteryStore(),
          initializeSkillPointsStore(),
          initializeOnboardingStore(),
          initializeBossStore(),
          initializeCustomStreaksStore(),
        ]);
        // Initialize perk store after other stores (needs stats data)
        await initializePerkStore();
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

              {/* Onboarding route - outside MainLayout for full-screen experience */}
              <Route path="/onboarding" element={<OnboardingPage />} />

              {/* Main app routes */}
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
                  <Route path="/equipment-test" element={
                    <EquipmentTest />
                  } />
                </Routes>
                </MainLayout>
              } />
          </Routes>
          </Suspense>
          {/* Command Palette - Cmd+K (must be inside Router) */}
          <CommandPalette />

          {/* Equipment Unlock Notifications - shows pixel art when gear unlocks */}
          <EquipmentUnlockToast />


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

export default App
