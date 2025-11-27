import React, { useEffect, useState, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// DevTools only in development - lazy load to reduce bundle
const ReactQueryDevtools = import.meta.env.DEV
  ? React.lazy(() => import('@tanstack/react-query-devtools').then(mod => ({ default: mod.ReactQueryDevtools })))
  : () => null;
// DEVELOPMENT: Auth disabled
// import { useAuth } from './hooks/useAuth';
import MainLayout from './components/layout/MainLayout';
import LoadingScreen from './components/shared/LoadingScreen';
import ErrorBoundary from './components/ErrorBoundary';

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

// Lazy load IntroScreen (heavy Three.js dependency, only shown on first visit)
const IntroScreen = lazy(() => import('./components/intro/IntroScreen'));

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
const Rewards = lazy(() => import('./pages/Rewards'));
const Discoveries = lazy(() => import('./pages/Discoveries'));

// Gamification and demo pages
const Gamification = lazy(() => import('./pages/AtomCosmosDemo'));
const CosmicEvolution = lazy(() => import('./pages/CosmicEvolutionDemo'));
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
  const [showIntro, setShowIntro] = useState(true);
  const [hasSeenIntro, setHasSeenIntro] = useState(false);

  // Check if user has seen intro before
  useEffect(() => {
    // TEMPORARILY SKIP INTRO - for faster testing
    setShowIntro(false);
    setHasSeenIntro(true);

    // Uncomment below to enable intro on first visit:
    // const introSeen = localStorage.getItem('xcalibur-intro-seen');
    // if (introSeen === 'true') {
    //   setShowIntro(false);
    //   setHasSeenIntro(true);
    // }
  }, []);

  // Enable dark mode on app load
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  const handleIntroComplete = () => {
    setShowIntro(false);
    setHasSeenIntro(true);
    localStorage.setItem('quanta-intro-seen', 'true');
  };

  // Show intro on first visit (wrapped in Suspense for lazy loading)
  if (showIntro && !hasSeenIntro) {
    return (
      <Suspense fallback={<LoadingScreen message="Preparing your journey" />}>
        <IntroScreen onComplete={handleIntroComplete} />
      </Suspense>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
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
                  <Route path="/character" element={<Character />} />
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
                  <Route path="/rewards" element={<Rewards />} />
                  <Route path="/discoveries" element={<Discoveries />} />
                  <Route path="/learn" element={<Learn />} />
                  <Route path="/skills" element={<Skills />} />
                  <Route path="/avatar" element={
                    <ErrorBoundary>
                      <EquipmentInventory />
                    </ErrorBoundary>
                  } />

                  {/* AI Companion */}
                  <Route path="/ai" element={<AICompanion />} />

                  {/* Gamification & Evolution (demo/test pages) */}
                  <Route path="/gamification" element={<Gamification />} />
                  <Route path="/cosmic-evolution" element={<CosmicEvolution />} />
                  <Route path="/constellations-test" element={<ConstellationsTest />} />
                  <Route path="/constellations-demo" element={<ConstellationsDemo />} />
                  <Route path="/evolution" element={<EvolutionShowcase />} />
                </Routes>
              </MainLayout>
            } />
          </Routes>
        </Suspense>
      </Router>
      {/* React Query DevTools - only in development */}
      {import.meta.env.DEV && (
        <Suspense fallback={null}>
          <ReactQueryDevtools initialIsOpen={false} />
        </Suspense>
      )}
    </QueryClientProvider>
  );
}

export default App
