import React, { useState, lazy, Suspense, useEffect, useRef } from 'react';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import useIntegratedOnboardingStore from '../../stores/integratedOnboardingStore';

// Lazy load NovaWidget - defer AI companion until after initial render
const NovaWidget = lazy(() => import('../nova/NovaWidget'));

// Lazy load NovaGuide for onboarding
const NovaGuide = lazy(() => import('../onboarding/NovaGuide'));

// Lazy load FeatureTour for Nova-guided tours
const FeatureTour = lazy(() => import('../tours/FeatureTour'));

/**
 * LifeOS MainLayout (AppShell)
 *
 * Mobile-first responsive layout:
 * - Desktop: Fixed sidebar (250px)
 * - Mobile: Bottom tab navigation + hamburger menu for sidebar
 * - Scrollable content area
 */

const MainLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNova, setShowNova] = useState(false);
  const [storeHydrated, setStoreHydrated] = useState(false);

  // Get onboarding state
  const { hasSeenWelcome, isOnboardingComplete, showNovaGuide } = useIntegratedOnboardingStore();

  // Wait for store hydration before deciding which Nova component to show
  // This prevents flashing between NovaGuide and NovaWidget
  const initialOnboardingState = useRef(null);

  useEffect(() => {
    // Small delay to ensure zustand persist has hydrated
    const timer = setTimeout(() => {
      setStoreHydrated(true);
      // Lock in the onboarding state at hydration time
      if (initialOnboardingState.current === null) {
        initialOnboardingState.current = {
          isOnboarding: hasSeenWelcome && !isOnboardingComplete,
          showNovaGuide
        };
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [hasSeenWelcome, isOnboardingComplete, showNovaGuide]);

  // Use locked-in state or current state after hydration
  const isOnboarding = storeHydrated
    ? (initialOnboardingState.current?.isOnboarding ?? (hasSeenWelcome && !isOnboardingComplete))
    : false;
  const shouldShowNovaGuide = storeHydrated
    ? (initialOnboardingState.current?.showNovaGuide ?? showNovaGuide)
    : false;

  // Defer Nova widget load until after initial paint (2 second delay)
  useEffect(() => {
    const timer = setTimeout(() => setShowNova(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-bg-0 text-text-primary">
      {/* Sidebar (drawer on mobile, fixed on desktop) */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <main className="md:ml-[250px] min-h-screen mb-20 md:mb-0">
        {children}
      </main>

      {/* Bottom Navigation (mobile only) */}
      <BottomNav />

      {/* Nova AI Companion Widget - lazy loaded after initial render */}
      {/* Show NovaGuide during onboarding, otherwise show regular NovaWidget */}
      {showNova && storeHydrated && (
        <Suspense fallback={null}>
          {isOnboarding && shouldShowNovaGuide ? (
            <NovaGuide position="bottom-left" />
          ) : (
            <NovaWidget userLevel={15} />
          )}
        </Suspense>
      )}

      {/* Nova-guided Feature Tours - shows after onboarding is complete */}
      {storeHydrated && !isOnboarding && (
        <Suspense fallback={null}>
          <FeatureTour />
        </Suspense>
      )}
    </div>
  );
};

export default MainLayout;
