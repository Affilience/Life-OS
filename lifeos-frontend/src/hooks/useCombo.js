/**
 * useCombo Hook
 *
 * React hook for tracking and displaying task completion combos.
 * Wraps the combo system service for easy component integration.
 *
 * Usage:
 * const { count, multiplier, label, color, isCombo, register } = useCombo();
 *
 * // When task completes:
 * register({ position: { x, y } });
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';
import {
  registerCompletion,
  getComboState,
  subscribeToCombo,
  forceResetCombo,
} from '../services/microInteractions/comboSystem';
import { useParticleBurst, PARTICLE_PALETTES } from './useParticleBurst';

/**
 * Hook for combo tracking with optional particle effects
 * @param {React.RefObject} containerRef - Optional ref for particle container
 */
export function useCombo(containerRef = null) {
  const [state, setState] = useState(getComboState());
  const prefersReducedMotion = useReducedMotion();
  const burst = useParticleBurst(containerRef);

  // Subscribe to combo state changes
  useEffect(() => {
    const unsubscribe = subscribeToCombo((newState) => {
      setState(newState);
    });

    return unsubscribe;
  }, []);

  // Register completion with automatic particle effects
  const register = useCallback(
    (options = {}) => {
      return registerCompletion({
        ...options,
        onParticleBurst: containerRef ? burst : options.onParticleBurst,
        reducedMotion: prefersReducedMotion,
      });
    },
    [burst, containerRef, prefersReducedMotion]
  );

  // Force reset
  const reset = useCallback(() => {
    forceResetCombo();
  }, []);

  return {
    ...state,
    register,
    reset,
  };
}

/**
 * Hook that provides combo display UI state
 * Includes animation timing for combo meter
 */
export function useComboDisplay(containerRef = null) {
  const combo = useCombo(containerRef);
  const [showCombo, setShowCombo] = useState(false);
  const [comboProgress, setComboProgress] = useState(0);
  const progressRef = useRef(null);

  // Show/hide combo display
  useEffect(() => {
    if (combo.isCombo) {
      setShowCombo(true);
    } else {
      // Delay hiding to show animation
      const timer = setTimeout(() => setShowCombo(false), 300);
      return () => clearTimeout(timer);
    }
  }, [combo.isCombo]);

  // Update progress bar animation
  useEffect(() => {
    if (!combo.isCombo) {
      setComboProgress(0);
      if (progressRef.current) {
        cancelAnimationFrame(progressRef.current);
      }
      return;
    }

    const updateProgress = () => {
      const remaining = combo.timeRemaining;
      const total = 3000; // COMBO_CONFIG.timeWindow
      const progress = Math.max(0, remaining / total);
      setComboProgress(progress);

      if (progress > 0) {
        progressRef.current = requestAnimationFrame(updateProgress);
      }
    };

    progressRef.current = requestAnimationFrame(updateProgress);

    return () => {
      if (progressRef.current) {
        cancelAnimationFrame(progressRef.current);
      }
    };
  }, [combo.isCombo, combo.timeRemaining, combo.count]);

  return {
    ...combo,
    showCombo,
    comboProgress,
  };
}

/**
 * Simple hook for just registering completions
 * without subscribing to state updates
 */
export function useComboRegister() {
  const prefersReducedMotion = useReducedMotion();

  const register = useCallback(
    (options = {}) => {
      return registerCompletion({
        ...options,
        reducedMotion: prefersReducedMotion,
      });
    },
    [prefersReducedMotion]
  );

  return register;
}

export default useCombo;
