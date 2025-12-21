/**
 * useNovaInit Hook
 *
 * Initializes Nova AI service on app load:
 * - Pre-warms caches for instant responses
 * - Loads personality preferences
 * - Sets up network listeners
 * - Starts proactive checks
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from './useAuth';
import {
  initializeNova,
  prewarmCaches,
  startNudges,
  stopNudges,
  cleanup,
  checkForNudge,
  generateInsights,
} from '../services/ai/nova/novaServiceV2';
import { loadPreferencesFromDatabase } from '../services/ai/nova/personalityLearning';

/**
 * Initialize Nova AI service
 */
export function useNovaInit(options = {}) {
  const { enableProactiveNudges = true, onNudge = null } = options;

  const { user, isAuthenticated } = useAuth();
  const [initialized, setInitialized] = useState(false);
  const [isPrewarmed, setIsPrewarmed] = useState(false);
  const [currentNudge, setCurrentNudge] = useState(null);
  const [insights, setInsights] = useState(null);

  const initAttemptedRef = useRef(false);

  // Initialize Nova when user is authenticated
  useEffect(() => {
    if (!isAuthenticated || initAttemptedRef.current) return;
    initAttemptedRef.current = true;

    const init = async () => {
      try {
        console.log('useNovaInit: Starting initialization...');

        // Initialize Nova service
        await initializeNova();

        // Load preferences from database
        await loadPreferencesFromDatabase();

        // Pre-warm caches
        const prewarmed = await prewarmCaches();
        setIsPrewarmed(prewarmed);

        // Generate initial insights
        const initialInsights = generateInsights();
        setInsights(initialInsights);

        setInitialized(true);
        console.log('useNovaInit: Initialization complete');
      } catch (e) {
        console.error('useNovaInit: Initialization failed:', e);
        // Still mark as initialized to prevent blocking the app
        setInitialized(true);
      }
    };

    init();
  }, [isAuthenticated]);

  // Start proactive nudges when enabled
  useEffect(() => {
    if (!initialized || !enableProactiveNudges) return;

    const handleNudge = (nudge) => {
      setCurrentNudge(nudge);
      onNudge?.(nudge);

      // Auto-dismiss after 30 seconds
      setTimeout(() => {
        setCurrentNudge(null);
      }, 30000);
    };

    startNudges(handleNudge);

    return () => {
      stopNudges();
    };
  }, [initialized, enableProactiveNudges, onNudge]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  // Dismiss current nudge
  const dismissNudge = useCallback(() => {
    setCurrentNudge(null);
  }, []);

  // Manually trigger nudge check
  const triggerNudgeCheck = useCallback(() => {
    const nudge = checkForNudge();
    if (nudge) {
      setCurrentNudge(nudge);
      onNudge?.(nudge);
    }
    return nudge;
  }, [onNudge]);

  // Refresh insights
  const refreshInsights = useCallback(async () => {
    await prewarmCaches();
    const newInsights = generateInsights();
    setInsights(newInsights);
    return newInsights;
  }, []);

  return {
    initialized,
    isPrewarmed,
    currentNudge,
    dismissNudge,
    triggerNudgeCheck,
    insights,
    refreshInsights,
  };
}

/**
 * Lightweight hook just for pre-warming
 */
export function useNovaPrewarm() {
  const { isAuthenticated } = useAuth();
  const [isReady, setIsReady] = useState(false);
  const attemptedRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || attemptedRef.current) return;
    attemptedRef.current = true;

    prewarmCaches()
      .then(() => setIsReady(true))
      .catch(() => setIsReady(true)); // Still mark ready on error
  }, [isAuthenticated]);

  return isReady;
}

export default useNovaInit;
