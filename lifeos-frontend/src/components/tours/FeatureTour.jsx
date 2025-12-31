/**
 * Feature Tour Component
 *
 * Main orchestrator for Nova-guided feature tours.
 * Renders spotlight overlay, positioned tooltip with Nova, and navigation controls.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, SkipForward, Play, RotateCcw, Sparkles } from 'lucide-react';
import { useTourStore, ROUTE_TO_TOUR, TOUR_IDS } from '../../stores/tourStore';
import { getTour, getTourStep, getTourStepCount, NOVA_STATES, POSITIONS } from './tourDefinitions';
import useGamificationStore from '../../stores/gamificationStore';
import useDashboardStore from '../../stores/dashboardStore';
import { feedback } from '../../services/microInteractions';
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
 * On mobile, ensures tooltip doesn't overlap the spotlight by positioning at screen edges
 */
function calculateTooltipPosition(targetRect, position, tooltipSize = { width: 320, height: 200 }) {
  const padding = 16;
  const arrowSize = 12;
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const isMobile = viewportWidth <= 640;

  // Mobile bottom navigation is ~60px, plus some extra padding
  const mobileNavHeight = 100;

  // On mobile, use smaller tooltip dimensions but ensure enough height for content
  // Centered/welcome tooltips need MORE height as they contain full messages with Nova
  // Regular tooltips also need more height (240px) to avoid content cutoff
  const actualTooltipSize = isMobile
    ? { width: viewportWidth - 32, height: position === 'center' ? 320 : 240 }
    : tooltipSize;

  let top, left;
  let actualPosition = position;

  // Center position (no target element)
  if (position === 'center' || !targetRect) {
    // On mobile, position toward top third of screen to ensure full visibility
    // Leave room for bottom navigation bar
    const safeBottomPadding = isMobile ? mobileNavHeight : padding;

    // Calculate top position - on mobile, favor upper positioning
    let centeredTop;
    if (isMobile) {
      // Position in upper third of available space
      const availableHeight = viewportHeight - safeBottomPadding - padding;
      centeredTop = padding + (availableHeight - actualTooltipSize.height) / 3;
      centeredTop = Math.max(padding, centeredTop);
      // Ensure it doesn't go too low
      const maxTop = viewportHeight - actualTooltipSize.height - safeBottomPadding;
      centeredTop = Math.min(centeredTop, maxTop);
    } else {
      centeredTop = Math.max(padding, (viewportHeight - actualTooltipSize.height) / 2);
    }

    return {
      top: centeredTop,
      left: Math.max(padding, (viewportWidth - actualTooltipSize.width) / 2),
      position: 'center',
    };
  }

  // On mobile, use smart positioning to avoid blocking the spotlight
  if (isMobile) {
    const spotlightPadding = 12; // Padding around spotlight

    // Calculate the target center and available spaces
    const targetCenterY = targetRect.top + targetRect.height / 2;
    const screenCenterY = viewportHeight / 2;

    // Calculate available space above and below the target
    const spaceAbove = targetRect.top - spotlightPadding - arrowSize - padding;
    const spaceBelow = viewportHeight - targetRect.bottom - spotlightPadding - arrowSize - mobileNavHeight;

    // Decide placement based on which area has more space
    const tooltipHeight = actualTooltipSize.height;

    // Preference: if target is in upper half, put tooltip below. Otherwise above.
    // But override if there's not enough space
    if (targetCenterY < screenCenterY) {
      // Target is in upper half - try to place tooltip below
      if (spaceBelow >= tooltipHeight) {
        // Fits below - place right after target
        top = targetRect.bottom + spotlightPadding + arrowSize;
        actualPosition = POSITIONS.BOTTOM;
      } else if (spaceAbove >= tooltipHeight) {
        // Doesn't fit below but fits above
        top = targetRect.top - spotlightPadding - arrowSize - tooltipHeight;
        actualPosition = POSITIONS.TOP;
      } else {
        // Neither fits - place at bottom of screen, above nav
        top = viewportHeight - tooltipHeight - mobileNavHeight;
        actualPosition = POSITIONS.BOTTOM;
      }
    } else {
      // Target is in lower half - try to place tooltip above
      if (spaceAbove >= tooltipHeight) {
        // Fits above
        top = targetRect.top - spotlightPadding - arrowSize - tooltipHeight;
        actualPosition = POSITIONS.TOP;
      } else if (spaceBelow >= tooltipHeight) {
        // Doesn't fit above but fits below
        top = targetRect.bottom + spotlightPadding + arrowSize;
        actualPosition = POSITIONS.BOTTOM;
      } else {
        // Neither fits - place at top of screen
        top = padding;
        actualPosition = POSITIONS.TOP;
      }
    }

    // Final bounds check - ensure tooltip stays within viewport
    top = Math.max(padding, top);
    top = Math.min(top, viewportHeight - tooltipHeight - mobileNavHeight);

    // Final overlap check with the target spotlight
    const tooltipBottom = top + tooltipHeight;
    const targetTopWithPadding = targetRect.top - spotlightPadding;
    const targetBottomWithPadding = targetRect.bottom + spotlightPadding;

    // If there's still overlap, adjust position
    if (tooltipBottom > targetTopWithPadding && top < targetBottomWithPadding) {
      // Overlap detected - determine which direction to push
      const pushUp = targetTopWithPadding - tooltipHeight - arrowSize;
      const pushDown = targetBottomWithPadding + arrowSize;

      if (pushUp >= padding) {
        top = pushUp;
        actualPosition = POSITIONS.TOP;
      } else if (pushDown + tooltipHeight <= viewportHeight - mobileNavHeight) {
        top = pushDown;
        actualPosition = POSITIONS.BOTTOM;
      }
      // If neither works, the current position is the best we can do
    }

    // Mobile left position handled by CSS
    return { top, left: padding, position: actualPosition, isMobile: true };
  }

  // Desktop positioning (unchanged)
  switch (position) {
    case POSITIONS.TOP:
      top = targetRect.top - actualTooltipSize.height - arrowSize - padding;
      left = targetRect.left + (targetRect.width - actualTooltipSize.width) / 2;
      break;
    case POSITIONS.BOTTOM:
      top = targetRect.bottom + arrowSize + padding;
      left = targetRect.left + (targetRect.width - actualTooltipSize.width) / 2;
      break;
    case POSITIONS.LEFT:
      top = targetRect.top + (targetRect.height - actualTooltipSize.height) / 2;
      left = targetRect.left - actualTooltipSize.width - arrowSize - padding;
      break;
    case POSITIONS.RIGHT:
      top = targetRect.top + (targetRect.height - actualTooltipSize.height) / 2;
      left = targetRect.right + arrowSize + padding;
      break;
    case POSITIONS.TOP_LEFT:
      top = targetRect.top - actualTooltipSize.height - arrowSize - padding;
      left = targetRect.left;
      break;
    case POSITIONS.TOP_RIGHT:
      top = targetRect.top - actualTooltipSize.height - arrowSize - padding;
      left = targetRect.right - actualTooltipSize.width;
      break;
    case POSITIONS.BOTTOM_LEFT:
      top = targetRect.bottom + arrowSize + padding;
      left = targetRect.left;
      break;
    case POSITIONS.BOTTOM_RIGHT:
      top = targetRect.bottom + arrowSize + padding;
      left = targetRect.right - actualTooltipSize.width;
      break;
    default:
      top = targetRect.bottom + arrowSize + padding;
      left = targetRect.left + (targetRect.width - actualTooltipSize.width) / 2;
      actualPosition = POSITIONS.BOTTOM;
  }

  // Constrain to viewport
  if (left < padding) left = padding;
  if (left + actualTooltipSize.width > viewportWidth - padding) {
    left = viewportWidth - actualTooltipSize.width - padding;
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
  if (top + actualTooltipSize.height > viewportHeight - padding) {
    // Flip to top if no room on bottom
    if (position === POSITIONS.BOTTOM || position === POSITIONS.BOTTOM_LEFT || position === POSITIONS.BOTTOM_RIGHT) {
      top = targetRect.top - actualTooltipSize.height - arrowSize - padding;
      actualPosition = POSITIONS.TOP;
    } else {
      top = viewportHeight - actualTooltipSize.height - padding;
    }
  }

  return { top, left, position: actualPosition };
}

/**
 * Floating particle for ambient effect
 */
function FloatingParticle({ delay, duration, x, size = 4 }) {
  return (
    <motion.div
      className="absolute rounded-full bg-purple-400/30"
      style={{ width: size, height: size, left: x }}
      initial={{ opacity: 0, y: 100, scale: 0 }}
      animate={{
        opacity: [0, 0.8, 0.8, 0],
        y: [100, -50],
        scale: [0, 1, 1, 0],
        x: [0, Math.random() * 20 - 10],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: 'easeOut',
      }}
    />
  );
}

/**
 * Tour Prompt Modal - Asks user if they want to take the tour
 */
function TourPrompt({ tourId, onStart, onSkip, onDismiss }) {
  const tour = getTour(tourId);
  const { level } = useGamificationStore();
  const novaSprite = getNovaSprite(level || 1);

  if (!tour) return null;

  // Generate floating particles
  const particles = [...Array(8)].map((_, i) => ({
    id: i,
    delay: i * 0.3,
    duration: 3 + Math.random() * 2,
    x: `${10 + Math.random() * 80}%`,
    size: 3 + Math.random() * 4,
  }));

  return (
    <motion.div
      className="tour-prompt-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((p) => (
          <FloatingParticle key={p.id} {...p} />
        ))}
      </div>

      <motion.div
        className="tour-prompt"
        initial={{ scale: 0.8, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      >
        {/* Glow effect behind Nova */}
        <motion.div
          className="absolute top-8 left-1/2 -translate-x-1/2 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />

        <div className="tour-prompt-nova relative">
          <motion.img
            src={novaSprite}
            alt="Nova"
            className="pixelated relative z-10"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* Sparkle effect */}
          <motion.div
            className="absolute -top-2 -right-2 text-yellow-400"
            animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sparkles size={20} />
          </motion.div>
        </div>

        <div className="tour-prompt-content">
          <motion.h3
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Want a Quick Tour?
          </motion.h3>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Hi! I'm Nova, your guide. Want me to show you around the{' '}
            <strong>{tour.name}</strong>? It'll only take about{' '}
            <strong>{tour.estimatedTime}</strong>.
          </motion.p>
          <motion.div
            className="tour-prompt-actions"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <motion.button
              className="tour-btn tour-btn-primary"
              onClick={onStart}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Play size={16} />
              Start Tour
            </motion.button>
            <motion.button
              className="tour-btn tour-btn-secondary"
              onClick={onSkip}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <SkipForward size={16} />
              Skip This One
            </motion.button>
            <button className="tour-btn tour-btn-ghost" onClick={onDismiss}>
              Don't Show Again
            </button>
          </motion.div>
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

  // Detect mobile for simpler animations
  const isMobile = window.innerWidth <= 640;

  return (
    <motion.div
      className={`tour-tooltip tour-tooltip-${position.position || 'bottom'}`}
      style={{ top: position.top, left: position.left }}
      initial={{ opacity: 0, y: 15, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      // Use simpler easing on mobile for smoother performance
      transition={isMobile
        ? { duration: 0.2, ease: 'easeOut' }
        : { type: 'spring', stiffness: 400, damping: 30 }
      }
      // Use layout for smooth position transitions instead of full remount
      layout={isMobile ? false : true}
      layoutId="tour-tooltip"
    >
      {/* Nova Avatar */}
      <div className="tour-tooltip-nova">
        <div className={`nova-container nova-${expression.animation}`}>
          <img
            src={novaSprite}
            alt="Nova"
            className="pixelated"
          />
          <span className="nova-expression">
            {expression.emoji}
          </span>
        </div>
      </div>

      {/* Content - use CSS transitions for smoother mobile performance */}
      <div className="tour-tooltip-content">
        <div className="tour-tooltip-header">
          <h4>{step.title}</h4>
          <button
            className="tour-close-btn"
            onClick={onSkip}
            title="Close tour"
          >
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

      {/* Navigation - simplified for mobile performance */}
      <div className="tour-tooltip-footer">
        <div className="tour-progress">
          <span>{stepIndex + 1} / {totalSteps}</span>
          {/* Step dots - use CSS transitions */}
          <div className="tour-progress-dots">
            {[...Array(totalSteps)].map((_, i) => (
              <div
                key={i}
                className={`tour-progress-dot ${i <= stepIndex ? 'active' : ''} ${i === stepIndex ? 'current' : ''}`}
              />
            ))}
          </div>
        </div>
        <div className="tour-nav-buttons">
          {!isFirstStep && (
            <button className="tour-nav-btn" onClick={onPrev}>
              <ChevronLeft size={18} />
            </button>
          )}
          {isLastStep ? (
            <button className="tour-btn tour-btn-primary tour-btn-complete" onClick={onComplete}>
              <Sparkles size={16} />
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

      {/* Static border around target - no animation for stability */}
      <div
        className="tour-spotlight-border"
        style={{
          left: spotlightLeft,
          top: spotlightTop,
          width: spotlightWidth,
          height: spotlightHeight,
          borderRadius,
          pointerEvents: 'none',
        }}
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

  // Check for force-start tour from settings (bypasses toursEnabled)
  useEffect(() => {
    const forceStartTourId = sessionStorage.getItem('lifeos-force-start-tour');
    if (forceStartTourId && !isActive) {
      // Clear the flag immediately to prevent re-triggering
      sessionStorage.removeItem('lifeos-force-start-tour');
      // Start the tour directly (skip prompt since user explicitly requested it)
      const timeout = setTimeout(() => {
        startTour(forceStartTourId);
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [location.pathname, isActive, startTour]);

  // Check for auto-start tour when route changes
  useEffect(() => {
    const tourId = ROUTE_TO_TOUR[location.pathname];

    // Don't auto-start if force-start is pending (handled above)
    if (sessionStorage.getItem('lifeos-force-start-tour')) {
      return;
    }

    if (!toursEnabled || !tourId || isActive) {
      return;
    }

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

    // Track elements we've modified for cleanup
    let modifiedElements = [];

    // Find the target element
    const findTarget = () => {
      const element = document.querySelector(target);
      if (element) {
        // Raise the target element above the overlay so it can be clicked
        element.style.position = element.style.position || 'relative';
        element.style.zIndex = '10000';
        element.style.pointerEvents = 'auto';
        modifiedElements.push({ el: element, originalZIndex: element.style.zIndex, originalPointerEvents: element.style.pointerEvents });

        // Also raise any ancestors that might have z-index creating a stacking context
        let parent = element.parentElement;
        while (parent && parent !== document.body) {
          const computedStyle = window.getComputedStyle(parent);
          const zIndex = computedStyle.zIndex;
          const position = computedStyle.position;
          // If parent has a z-index and positioned, it creates a stacking context
          if (zIndex !== 'auto' && position !== 'static') {
            const originalZ = parent.style.zIndex;
            parent.style.zIndex = '9999';
            modifiedElements.push({ el: parent, originalZIndex: originalZ });
          }
          parent = parent.parentElement;
        }

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
          // First, check if element is inside a horizontally scrollable container
          let scrollableParent = element.parentElement;
          while (scrollableParent) {
            const style = window.getComputedStyle(scrollableParent);
            if (style.overflowX === 'auto' || style.overflowX === 'scroll') {
              // Scroll the element into view within its scrollable parent
              const parentRect = scrollableParent.getBoundingClientRect();
              const elementRect = element.getBoundingClientRect();

              if (elementRect.left < parentRect.left || elementRect.right > parentRect.right) {
                // Element is horizontally off-screen in its container
                element.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
              }
              break;
            }
            scrollableParent = scrollableParent.parentElement;
          }

          // Also scroll main page if needed
          element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });

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
      // Reset all modified elements when step changes
      modifiedElements.forEach(({ el, originalZIndex, originalPointerEvents }) => {
        el.style.zIndex = originalZIndex || '';
        if (originalPointerEvents !== undefined) {
          el.style.pointerEvents = originalPointerEvents || '';
        }
      });
      modifiedElements = [];
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
    console.log('[FeatureTour] Start Tour clicked, promptTourId:', promptTourId);
    setShowPrompt(false);
    // Play start sound
    try {
      feedback.buttonPress();
    } catch (e) {
      console.error('[FeatureTour] Error playing feedback:', e);
    }
    if (promptTourId) {
      console.log('[FeatureTour] Starting tour:', promptTourId);
      startTour(promptTourId);
    } else {
      console.error('[FeatureTour] No promptTourId to start!');
    }
  };

  const handleSkipTour = () => {
    setShowPrompt(false);
    feedback.click();
    skipTour();
  };

  const handleDismissPrompt = () => {
    setShowPrompt(false);
    feedback.click();
    setToursEnabled(false);
    markTourPromptSeen();
  };

  // Handle step navigation
  const handleNext = () => {
    if (currentStepIndex < totalSteps - 1) {
      // Play step transition sound
      feedback.click();
      nextStep();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      feedback.click();
      prevStep();
    }
  };

  const handleComplete = () => {
    // Play completion celebration
    feedback.achievement();

    // If completing the dashboard tour, mark onboarding setup as complete
    if (activeTour === TOUR_IDS.DASHBOARD) {
      try {
        const dashboardStore = useDashboardStore.getState();
        dashboardStore.completeOnboardingSetup();
      } catch (e) {
        console.warn('[Tour] Could not mark onboarding setup complete:', e);
      }
    }
    completeTour();
  };

  const handleSkip = () => {
    feedback.click();
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
