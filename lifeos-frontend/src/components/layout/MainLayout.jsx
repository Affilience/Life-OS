import React, { useState, lazy, Suspense, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import useIntegratedOnboardingStore from '../../stores/integratedOnboardingStore';
import { useNewOnboardingStore } from '../../stores/newOnboardingStore';
import FloatingSprites from '../ui/FloatingSprites';

// Lazy load NovaWidget - defer AI companion until after initial render
const NovaWidget = lazy(() => import('../nova/NovaWidget'));

// Lazy load NovaGuide for onboarding
const NovaGuide = lazy(() => import('../onboarding/NovaGuide'));

// Lazy load FeatureTour for Nova-guided tours
const FeatureTour = lazy(() => import('../tours/FeatureTour').catch(err => {
  console.error('[MainLayout] Failed to load FeatureTour:', err);
  return { default: () => null };
}));

/**
 * Ascynt MainLayout (AppShell)
 *
 * Mobile-first responsive layout:
 * - Desktop: Fixed sidebar (250px)
 * - Mobile: Bottom tab navigation + hamburger menu for sidebar
 * - Scrollable content area
 */

const MainLayout = ({ children }) => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNova, setShowNova] = useState(false);
  const [storeHydrated, setStoreHydrated] = useState(false);

  // Get onboarding state from both stores
  // integratedOnboardingStore: legacy in-app onboarding
  // newOnboardingStore: ImmersiveOnboarding cinematic flow
  const { hasSeenWelcome, isOnboardingComplete: integratedComplete, showNovaGuide } = useIntegratedOnboardingStore();
  const { isOnboardingComplete: newOnboardingComplete, isOnboardingActive } = useNewOnboardingStore();

  // User has completed onboarding if EITHER store says complete
  const isFullyOnboarded = integratedComplete || newOnboardingComplete;

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
          isOnboarding: hasSeenWelcome && !isFullyOnboarded,
          showNovaGuide
        };
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [hasSeenWelcome, isFullyOnboarded, showNovaGuide]);

  // Use locked-in state or current state after hydration
  const isOnboarding = storeHydrated
    ? (initialOnboardingState.current?.isOnboarding ?? (hasSeenWelcome && !isFullyOnboarded))
    : false;
  const shouldShowNovaGuide = storeHydrated
    ? (initialOnboardingState.current?.showNovaGuide ?? showNovaGuide)
    : false;

  // Defer Nova widget load until after initial paint (2 second delay)
  useEffect(() => {
    const timer = setTimeout(() => setShowNova(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  // Debug: Log FeatureTour condition
  useEffect(() => {
    if (storeHydrated) {
      console.log('[MainLayout] FeatureTour conditions:', {
        storeHydrated,
        isFullyOnboarded,
        integratedComplete,
        newOnboardingComplete,
        isOnboardingActive,
        willShowTour: storeHydrated && isFullyOnboarded,
      });
    }
  }, [storeHydrated, isFullyOnboarded, integratedComplete, newOnboardingComplete, isOnboardingActive]);

  return (
    <div className="min-h-screen bg-bg-0 text-text-primary">
      {/* Floating pixel art sprites - subtle background decoration */}
      <FloatingSprites count={5} opacity={0.06} />

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
      {/* Debug: Log when condition should allow FeatureTour */}
      {storeHydrated && isFullyOnboarded && (
        <Suspense fallback={null}>
          <FeatureTour />
        </Suspense>
      )}
    </div>
  );
};

export default MainLayout;
