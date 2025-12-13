/**
 * ModeAwareRoute - Route guard that enforces gamification mode visibility
 *
 * Redirects users to appropriate pages when they try to access
 * features that are hidden in their current mode.
 */

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useGamificationModeStore, VISIBILITY } from '../../stores/gamificationModeStore';

/**
 * Route guard for mode-specific features
 *
 * @param {string} requiredVisibility - The visibility flag to check (e.g., 'showEvolutionGallery')
 * @param {string} redirectTo - Where to redirect if feature is hidden (default: '/')
 * @param {React.ReactNode} children - The component to render if visible
 */
export function ModeAwareRoute({
  requiredVisibility,
  redirectTo = '/',
  children
}) {
  const mode = useGamificationModeStore((state) => state.mode);
  const visibility = VISIBILITY[mode] || VISIBILITY.cosmic;

  // Check if the required visibility flag is true
  if (requiredVisibility && !visibility[requiredVisibility]) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
}

/**
 * Hook to check if a feature should be visible in current mode
 */
export function useFeatureVisibility(featureKey) {
  const mode = useGamificationModeStore((state) => state.mode);
  const visibility = VISIBILITY[mode] || VISIBILITY.cosmic;
  return visibility[featureKey] ?? true;
}

/**
 * Component that conditionally renders children based on mode visibility
 */
export function ModeAwareFeature({
  visibilityKey,
  fallback = null,
  children
}) {
  const isVisible = useFeatureVisibility(visibilityKey);
  return isVisible ? children : fallback;
}

export default ModeAwareRoute;
