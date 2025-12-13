/**
 * Feature Tour Component
 *
 * Main orchestrator for Nova-guided feature tours.
 * Renders spotlight overlay, positioned tooltip with Nova, and navigation controls.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, SkipForward, Play, RotateCcw } from 'lucide-react';
import { useTourStore, ROUTE_TO_TOUR } from '../../stores/tourStore';
import { getTour, getTourStep, getTourStepCount, NOVA_STATES, POSITIONS } from './tourDefinitions';
import useGamificationStore from '../../stores/gamificationStore';
import './FeatureTour.css';

/**
 * Nova sprite paths based on user evolution
 */
const EVOLUTION_STAGES = {
  spark: { minLevel: 0, maxLevel: 9, name: 'Spark' },
  teen: { minLevel: 10, maxLevel: 24, name: 'Nova' },
  stellar: { minLevel: 25, maxLevel: 49, name: 'Stellar' },
  cosmos: { minLevel: 50, maxLevel: 999, name: 'Cosmos' }
};

/**
 * Get Nova sprite path based on level
 */
function getNovaSprite(level) {
  for (const [stage, data] of Object.entries(EVOLUTION_STAGES)) {
    if (level >= data.minLevel && level <= data.maxLevel) {
      return `/assets/nova/nova_${stage}.png`;
    }
  }
  return '/assets/nova/nova_spark.png';
}

/**
 * Nova emotional expression mapping
 */
const NOVA_EXPRESSIONS = {
  [NOVA_STATES.EXCITED]: { animation: 'bounce', emoji: '✨' },
  [NOVA_STATES.HAPPY]: { animation: 'gentle', emoji: '😊' },
  [NOVA_STATES.PROUD]: { animation: 'glow', emoji: '🌟' },
  [NOVA_STATES.ENCOURAGING]: { animation: 'nod', emoji: '💪' },
  [NOVA_STATES.THOUGHTFUL]: { animation: 'think', emoji: '🤔' },
};

/**
 * Calculate tooltip position based on target element and preferred position
 */
function calculateTooltipPosition(targetRect, position, tooltipSize = { width: 320, height: 200 }) {
  const padding = 16;
  const arrowSize = 12;
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  let top, left;
  let actualPosition = position;

  // Center position (no target element)
  if (position === 'center' || !targetRect) {
    // Ensure centered tooltip doesn't get cut off at top
    const centeredTop = Math.max(padding, (viewportHeight - tooltipSize.height) / 2);
    return {
      top: centeredTop,
      left: Math.max(padding, (viewportWidth - tooltipSize.width) / 2),
      position: 'center',
    };
  }

  // Calculate based on preferred position
  switch (position) {
    case POSITIONS.TOP:
      top = targetRect.top - tooltipSize.height - arrowSize - padding;
      left = targetRect.left + (targetRect.width - tooltipSize.width) / 2;
      break;
    case POSITIONS.BOTTOM:
      top = targetRect.bottom + arrowSize + padding;
      left = targetRect.left + (targetRect.width - tooltipSize.width) / 2;
      break;
    case POSITIONS.LEFT:
      top = targetRect.top + (targetRect.height - tooltipSize.height) / 2;
      left = targetRect.left - tooltipSize.width - arrowSize - padding;
      break;
    case POSITIONS.RIGHT:
      top = targetRect.top + (targetRect.height - tooltipSize.height) / 2;
      left = targetRect.right + arrowSize + padding;
      break;
    case POSITIONS.TOP_LEFT:
      top = targetRect.top - tooltipSize.height - arrowSize - padding;
      left = targetRect.left;
      break;
    case POSITIONS.TOP_RIGHT:
      top = targetRect.top - tooltipSize.height - arrowSize - padding;
      left = targetRect.right - tooltipSize.width;
      break;
    case POSITIONS.BOTTOM_LEFT:
      top = targetRect.bottom + arrowSize + padding;
      left = targetRect.left;
      break;
    case POSITIONS.BOTTOM_RIGHT:
      top = targetRect.bottom + arrowSize + padding;
      left = targetRect.right - tooltipSize.width;
      break;
    default:
      top = targetRect.bottom + arrowSize + padding;
      left = targetRect.left + (targetRect.width - tooltipSize.width) / 2;
      actualPosition = POSITIONS.BOTTOM;
  }

  // Constrain to viewport
  if (left < padding) left = padding;
  if (left + tooltipSize.width > viewportWidth - padding) {
    left = viewportWidth - tooltipSize.width - padding;
  }
  if (top < padding) {
    // Flip to bottom if no room on top
    if (position === POSITIONS.TOP || position === POSITIONS.TOP_LEFT || position === POSITIONS.TOP_RIGHT) {
      top = targetRect.bottom + arrowSize + padding;
      actualPosition = POSITIONS.BOTTOM;
    } else {
      top = padding;
    }
  }
  if (top + tooltipSize.height > viewportHeight - padding) {
    // Flip to top if no room on bottom
    if (position === POSITIONS.BOTTOM || position === POSITIONS.BOTTOM_LEFT || position === POSITIONS.BOTTOM_RIGHT) {
      top = targetRect.top - tooltipSize.height - arrowSize - padding;
      actualPosition = POSITIONS.TOP;
    } else {
      top = viewportHeight - tooltipSize.height - padding;
    }
  }

  return { top, left, position: actualPosition };
}

/**
 * Tour Prompt Modal - Asks user if they want to take the tour
 */
function TourPrompt({ tourId, onStart, onSkip, onDismiss }) {
  const tour = getTour(tourId);
  const { level } = useGamificationStore();
  const novaSprite = getNovaSprite(level || 1);

  if (!tour) return null;

  return (
    <motion.div
      className="tour-prompt-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="tour-prompt"
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
      >
        <div className="tour-prompt-nova">
          <motion.img
            src={novaSprite}
            alt="Nova"
            className="pixelated"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
        <div className="tour-prompt-content">
          <h3>Want a Quick Tour?</h3>
          <p>
            Hi! I'm Nova, your guide. Want me to show you around the{' '}
            <strong>{tour.name}</strong>? It'll only take about{' '}
            <strong>{tour.estimatedTime}</strong>.
          </p>
          <div className="tour-prompt-actions">
            <button className="tour-btn tour-btn-primary" onClick={onStart}>
              <Play size={16} />
              Start Tour
            </button>
            <button className="tour-btn tour-btn-secondary" onClick={onSkip}>
              <SkipForward size={16} />
              Skip This One
            </button>
            <button className="tour-btn tour-btn-ghost" onClick={onDismiss}>
              Don't Show Again
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/**
 * Tour Tooltip - The main tooltip that appears next to highlighted elements
 */
function TourTooltip({ step, stepIndex, totalSteps, position, onNext, onPrev, onSkip, onComplete }) {
  const { level } = useGamificationStore();
  const novaSprite = getNovaSprite(level || 1);
  const expression = NOVA_EXPRESSIONS[step.novaState] || NOVA_EXPRESSIONS[NOVA_STATES.HAPPY];
  const isLastStep = stepIndex === totalSteps - 1;
  const isFirstStep = stepIndex === 0;

  return (
    <motion.div
      className={`tour-tooltip tour-tooltip-${position.position || 'bottom'}`}
      style={{ top: position.top, left: position.left }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
    >
      {/* Nova Avatar */}
      <div className="tour-tooltip-nova">
        <motion.div
          className={`nova-container nova-${expression.animation}`}
          animate={expression.animation === 'bounce' ? { y: [0, -6, 0] } : {}}
          transition={{ duration: 0.6, repeat: expression.animation === 'bounce' ? Infinity : 0 }}
        >
          <img src={novaSprite} alt="Nova" className="pixelated" />
          <span className="nova-expression">{expression.emoji}</span>
        </motion.div>
      </div>

      {/* Content */}
      <div className="tour-tooltip-content">
        <div className="tour-tooltip-header">
          <h4>{step.title}</h4>
          <button className="tour-close-btn" onClick={onSkip} title="Close tour">
            <X size={16} />
          </button>
        </div>
        <p>{step.content}</p>

        {/* Action hint */}
        {step.action && (
          <div className="tour-action-hint">
            <span className="hint-icon">👆</span>
            Try clicking on the highlighted area!
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="tour-tooltip-footer">
        <div className="tour-progress">
          <span>{stepIndex + 1} / {totalSteps}</span>
          <div className="tour-progress-bar">
            <div
              className="tour-progress-fill"
              style={{ width: `${((stepIndex + 1) / totalSteps) * 100}%` }}
            />
          </div>
        </div>
        <div className="tour-nav-buttons">
          {!isFirstStep && (
            <button className="tour-nav-btn" onClick={onPrev}>
              <ChevronLeft size={18} />
            </button>
          )}
          {isLastStep ? (
            <button className="tour-btn tour-btn-primary" onClick={onComplete}>
              Complete
            </button>
          ) : (
            <button className="tour-nav-btn tour-nav-next" onClick={onNext}>
              <ChevronRight size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Arrow pointer */}
      {position.position !== 'center' && (
        <div className={`tour-tooltip-arrow tour-arrow-${position.position}`} />
      )}
    </motion.div>
  );
}

/**
 * Spotlight Overlay - Highlights the target element
 * Uses four overlay divs around the spotlight instead of SVG mask
 * This allows the spotlight area to be truly clickable
 */
function SpotlightOverlay({ targetRect, onClick, allowClickThrough }) {
  if (!targetRect) {
    return (
      <motion.div
        className="tour-overlay tour-overlay-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClick}
      />
    );
  }

  const padding = 8;
  const borderRadius = 12;

  // Calculate spotlight bounds
  const spotlightLeft = targetRect.left - padding;
  const spotlightTop = targetRect.top - padding;
  const spotlightWidth = targetRect.width + padding * 2;
  const spotlightHeight = targetRect.height + padding * 2;
  const spotlightRight = spotlightLeft + spotlightWidth;
  const spotlightBottom = spotlightTop + spotlightHeight;

  // Create four overlay regions around the spotlight
  return (
    <motion.div
      className="tour-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Top overlay */}
      <div
        className="tour-overlay-region"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: spotlightTop,
          background: 'rgba(0, 0, 0, 0.75)',
          pointerEvents: 'auto',
        }}
        onClick={onClick}
      />

      {/* Bottom overlay */}
      <div
        className="tour-overlay-region"
        style={{
          position: 'fixed',
          top: spotlightBottom,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          pointerEvents: 'auto',
        }}
        onClick={onClick}
      />

      {/* Left overlay */}
      <div
        className="tour-overlay-region"
        style={{
          position: 'fixed',
          top: spotlightTop,
          left: 0,
          width: spotlightLeft,
          height: spotlightHeight,
          background: 'rgba(0, 0, 0, 0.75)',
          pointerEvents: 'auto',
        }}
        onClick={onClick}
      />

      {/* Right overlay */}
      <div
        className="tour-overlay-region"
        style={{
          position: 'fixed',
          top: spotlightTop,
          left: spotlightRight,
          right: 0,
          height: spotlightHeight,
          background: 'rgba(0, 0, 0, 0.75)',
          pointerEvents: 'auto',
        }}
        onClick={onClick}
      />

      {/* Animated border around target */}
      <motion.div
        className="tour-spotlight-border"
        style={{
          left: spotlightLeft,
          top: spotlightTop,
          width: spotlightWidth,
          height: spotlightHeight,
          borderRadius,
          pointerEvents: 'none',
        }}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
}

/**
 * Main Feature Tour Component
 */
export default function FeatureTour() {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    activeTour,
    currentStepIndex,
    isActive,
    isPaused,
    toursEnabled,
    hasSeenTourPrompt,
    startTour,
    nextStep,
    prevStep,
    skipTour,
    completeTour,
    endTour,
    shouldAutoStartTour,
    markTourPromptSeen,
    setToursEnabled,
  } = useTourStore();

  const [showPrompt, setShowPrompt] = useState(false);
  const [promptTourId, setPromptTourId] = useState(null);
  const [targetRect, setTargetRect] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState(null);

  const observerRef = useRef(null);
  const resizeTimeoutRef = useRef(null);

  // Get current tour and step
  const currentTour = activeTour ? getTour(activeTour) : null;
  const currentStep = currentTour ? getTourStep(activeTour, currentStepIndex) : null;
  const totalSteps = currentTour ? getTourStepCount(activeTour) : 0;

  // Check for auto-start tour when route changes
  useEffect(() => {
    if (!toursEnabled) return;

    const tourId = ROUTE_TO_TOUR[location.pathname];
    if (!tourId) return;

    // Don't prompt if there's an active tour
    if (isActive) return;

    // Check if should auto-start
    if (shouldAutoStartTour(location.pathname)) {
      // Small delay to let the page render
      const timeout = setTimeout(() => {
        setPromptTourId(tourId);
        setShowPrompt(true);
      }, 1000);

      return () => clearTimeout(timeout);
    }
  }, [location.pathname, toursEnabled, isActive, shouldAutoStartTour]);

  // Find and track the target element
  useEffect(() => {
    if (!isActive || isPaused || !currentStep) {
      setTargetRect(null);
      setTooltipPosition(null);
      return;
    }

    const { target, position } = currentStep;

    // Center position (no target)
    if (!target || position === 'center') {
      setTargetRect(null);
      setTooltipPosition(calculateTooltipPosition(null, 'center'));
      return;
    }

    // Find the target element
    const findTarget = () => {
      const element = document.querySelector(target);
      if (element) {
        const rect = element.getBoundingClientRect();
        setTargetRect(rect);
        setTooltipPosition(calculateTooltipPosition(rect, position));

        // Scroll element into view if needed
        const isInViewport =
          rect.top >= 0 &&
          rect.left >= 0 &&
          rect.bottom <= window.innerHeight &&
          rect.right <= window.innerWidth;

        if (!isInViewport) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Recalculate after scroll
          setTimeout(() => {
            const newRect = element.getBoundingClientRect();
            setTargetRect(newRect);
            setTooltipPosition(calculateTooltipPosition(newRect, position));
          }, 500);
        }
      } else {
        // Element not found - try again after a short delay
        // (element might be lazy loaded)
        setTimeout(findTarget, 200);
      }
    };

    findTarget();

    // Update position on resize
    const handleResize = () => {
      if (resizeTimeoutRef.current) clearTimeout(resizeTimeoutRef.current);
      resizeTimeoutRef.current = setTimeout(findTarget, 100);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleResize, true);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleResize, true);
      if (resizeTimeoutRef.current) clearTimeout(resizeTimeoutRef.current);
    };
  }, [isActive, isPaused, currentStep, currentStepIndex]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'ArrowRight':
        case 'Enter':
          if (currentStepIndex < totalSteps - 1) {
            nextStep();
          } else {
            completeTour();
          }
          break;
        case 'ArrowLeft':
          if (currentStepIndex > 0) {
            prevStep();
          }
          break;
        case 'Escape':
          skipTour();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, currentStepIndex, totalSteps, nextStep, prevStep, skipTour, completeTour]);

  // Handle prompt actions
  const handleStartTour = () => {
    setShowPrompt(false);
    if (promptTourId) {
      startTour(promptTourId);
    }
  };

  const handleSkipTour = () => {
    setShowPrompt(false);
    skipTour();
  };

  const handleDismissPrompt = () => {
    setShowPrompt(false);
    setToursEnabled(false);
    markTourPromptSeen();
  };

  // Handle step navigation
  const handleNext = () => {
    if (currentStepIndex < totalSteps - 1) {
      nextStep();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      prevStep();
    }
  };

  const handleComplete = () => {
    completeTour();
  };

  const handleSkip = () => {
    skipTour();
  };

  // Handle clicking on the overlay (outside the spotlight)
  const handleOverlayClick = (e) => {
    // Don't advance if clicking on the tooltip
    if (e.target.closest('.tour-tooltip')) return;
    // Overlay clicks outside spotlight do nothing - user must click the target
  };

  // Listen for clicks on target element when action: 'click' is set
  useEffect(() => {
    if (!isActive || !currentStep?.action || currentStep.action !== 'click' || !currentStep.target) {
      return;
    }

    const targetElement = document.querySelector(currentStep.target);
    if (!targetElement) return;

    const handleTargetClick = () => {
      // Small delay to let the click action complete before advancing
      setTimeout(() => {
        nextStep();
      }, 100);
    };

    targetElement.addEventListener('click', handleTargetClick);
    return () => {
      targetElement.removeEventListener('click', handleTargetClick);
    };
  }, [isActive, currentStep, nextStep]);

  return (
    <>
      {/* Tour Prompt */}
      <AnimatePresence>
        {showPrompt && promptTourId && (
          <TourPrompt
            tourId={promptTourId}
            onStart={handleStartTour}
            onSkip={handleSkipTour}
            onDismiss={handleDismissPrompt}
          />
        )}
      </AnimatePresence>

      {/* Active Tour */}
      <AnimatePresence>
        {isActive && !isPaused && currentStep && tooltipPosition && (
          <>
            {/* Spotlight Overlay */}
            <SpotlightOverlay
              targetRect={targetRect}
              onClick={handleOverlayClick}
            />

            {/* Tooltip */}
            <TourTooltip
              step={currentStep}
              stepIndex={currentStepIndex}
              totalSteps={totalSteps}
              position={tooltipPosition}
              onNext={handleNext}
              onPrev={handlePrev}
              onSkip={handleSkip}
              onComplete={handleComplete}
            />
          </>
        )}
      </AnimatePresence>
    </>
  );
}

/**
 * Hook to manually trigger a tour from anywhere
 */
export function useTour() {
  const { startTour, resetTour, isActive, activeTour } = useTourStore();

  const trigger = useCallback((tourId) => {
    if (isActive) return; // Don't start if already in a tour
    startTour(tourId);
  }, [isActive, startTour]);

  const replay = useCallback((tourId) => {
    resetTour(tourId);
    startTour(tourId);
  }, [resetTour, startTour]);

  return {
    startTour: trigger,
    replayTour: replay,
    isActive,
    currentTour: activeTour,
  };
}
