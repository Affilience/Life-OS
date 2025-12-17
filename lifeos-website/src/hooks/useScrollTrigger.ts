'use client';

/**
 * GSAP ScrollTrigger Hooks
 *
 * Custom hooks for scroll-driven animations using GSAP ScrollTrigger.
 * Supports pinning, scrubbing, parallax, and progress tracking.
 */

import { useEffect, useRef, useCallback, useState, RefObject } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// ============================================
// TYPES
// ============================================

interface ScrollTriggerOptions {
  trigger?: string | HTMLElement | RefObject<HTMLElement>;
  start?: string;
  end?: string;
  scrub?: boolean | number;
  pin?: boolean | string | HTMLElement;
  pinSpacing?: boolean | string;
  markers?: boolean;
  toggleActions?: string;
  onEnter?: () => void;
  onLeave?: () => void;
  onEnterBack?: () => void;
  onLeaveBack?: () => void;
  onUpdate?: (self: ScrollTrigger) => void;
  onToggle?: (self: ScrollTrigger) => void;
}

interface PinScrollOptions extends ScrollTriggerOptions {
  duration?: string | number; // Virtual scroll duration (e.g., "+=2000" for 2000px)
}

interface ParallaxOptions {
  speed?: number; // Parallax speed multiplier (1 = normal, 0.5 = half, 2 = double)
  direction?: 'vertical' | 'horizontal';
  start?: string;
  end?: string;
}

interface EvolutionStageConfig {
  selector: string;
  enterAt: number; // Progress value (0-1) when this stage becomes visible
  leaveAt?: number; // Progress value when this stage should fade out
  animation?: gsap.TweenVars;
}

// ============================================
// HOOKS
// ============================================

/**
 * Basic ScrollTrigger hook for scroll-based animations
 */
export function useScrollTrigger(
  ref: RefObject<HTMLElement | null>,
  options: ScrollTriggerOptions = {}
) {
  const [progress, setProgress] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);

  const {
    start = 'top center',
    end = 'bottom center',
    scrub = false,
    pin = false,
    pinSpacing = true,
    markers = false,
    toggleActions = 'play none none reverse',
    onEnter,
    onLeave,
    onEnterBack,
    onLeaveBack,
    onUpdate,
    onToggle,
  } = options;

  useEffect(() => {
    if (!ref.current || typeof window === 'undefined') return;

    scrollTriggerRef.current = ScrollTrigger.create({
      trigger: ref.current,
      start,
      end,
      scrub,
      pin,
      pinSpacing,
      markers,
      toggleActions,
      onEnter: () => {
        setIsActive(true);
        onEnter?.();
      },
      onLeave: () => {
        setIsActive(false);
        onLeave?.();
      },
      onEnterBack: () => {
        setIsActive(true);
        onEnterBack?.();
      },
      onLeaveBack: () => {
        setIsActive(false);
        onLeaveBack?.();
      },
      onUpdate: (self) => {
        setProgress(self.progress);
        onUpdate?.(self);
      },
      onToggle: (self) => {
        setIsActive(self.isActive);
        onToggle?.(self);
      },
    });

    return () => {
      scrollTriggerRef.current?.kill();
    };
  }, [
    ref,
    start,
    end,
    scrub,
    pin,
    pinSpacing,
    markers,
    toggleActions,
    onEnter,
    onLeave,
    onEnterBack,
    onLeaveBack,
    onUpdate,
    onToggle,
  ]);

  return { progress, isActive, scrollTrigger: scrollTriggerRef.current };
}

/**
 * Hook for pinned scroll sections with scrubbing
 * Perfect for scroll-driven storytelling or evolution sequences
 */
export function usePinnedScroll(
  ref: RefObject<HTMLElement | null>,
  options: PinScrollOptions = {}
) {
  const [progress, setProgress] = useState(0);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);

  const {
    duration = '+=2000',
    start = 'top top',
    scrub = 1,
    markers = false,
    onUpdate,
    pin = true,
    pinSpacing = true,
  } = options;

  useEffect(() => {
    if (!ref.current || typeof window === 'undefined') return;

    // Create timeline
    timelineRef.current = gsap.timeline({
      scrollTrigger: {
        trigger: ref.current,
        start,
        end: duration,
        scrub,
        pin,
        pinSpacing,
        markers,
        onUpdate: (self) => {
          setProgress(self.progress);
          onUpdate?.(self);
        },
      },
    });

    scrollTriggerRef.current = timelineRef.current.scrollTrigger as ScrollTrigger;

    return () => {
      timelineRef.current?.kill();
    };
  }, [ref, duration, start, scrub, markers, onUpdate, pin, pinSpacing]);

  // Add animation to timeline
  const addToTimeline = useCallback(
    (
      targets: gsap.TweenTarget,
      vars: gsap.TweenVars,
      position?: gsap.Position
    ) => {
      if (timelineRef.current) {
        timelineRef.current.to(targets, vars, position);
      }
    },
    []
  );

  // Add from animation
  const addFromToTimeline = useCallback(
    (
      targets: gsap.TweenTarget,
      fromVars: gsap.TweenVars,
      toVars: gsap.TweenVars,
      position?: gsap.Position
    ) => {
      if (timelineRef.current) {
        timelineRef.current.fromTo(targets, fromVars, toVars, position);
      }
    },
    []
  );

  return {
    progress,
    timeline: timelineRef.current,
    scrollTrigger: scrollTriggerRef.current,
    addToTimeline,
    addFromToTimeline,
  };
}

/**
 * Hook for scroll-driven evolution/stage animations
 * Designed specifically for avatar evolution showcases
 */
export function useEvolutionScroll(
  containerRef: RefObject<HTMLElement | null>,
  stages: EvolutionStageConfig[],
  options: Omit<PinScrollOptions, 'onUpdate'> = {}
) {
  const [currentStage, setCurrentStage] = useState(0);
  const [progress, setProgress] = useState(0);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  const {
    duration = '+=2500',
    start = 'top top',
    scrub = 1,
    markers = false,
    pin = true,
    pinSpacing = true,
  } = options;

  useEffect(() => {
    if (!containerRef.current || typeof window === 'undefined') return;

    const container = containerRef.current;

    // Create the main timeline
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: container,
        start,
        end: duration,
        scrub,
        pin,
        pinSpacing,
        markers,
        onUpdate: (self) => {
          setProgress(self.progress);

          // Determine current stage based on progress
          const stageIndex = stages.findIndex((stage, i) => {
            const nextStage = stages[i + 1];
            const enterAt = stage.enterAt;
            const leaveAt = stage.leaveAt ?? nextStage?.enterAt ?? 1;
            return self.progress >= enterAt && self.progress < leaveAt;
          });

          if (stageIndex !== -1 && stageIndex !== currentStage) {
            setCurrentStage(stageIndex);
          }
        },
      },
    });

    // Add animations for each stage
    stages.forEach((stage, index) => {
      const element = container.querySelector(stage.selector);
      if (!element) return;

      const defaultAnimation: gsap.TweenVars = {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.2,
        ease: 'power2.out',
        ...stage.animation,
      };

      // Set initial state
      gsap.set(element, {
        opacity: index === 0 ? 1 : 0,
        scale: index === 0 ? 1 : 0.8,
      });

      // Add entrance animation at the right position in timeline
      tl.to(element, defaultAnimation, stage.enterAt);

      // Add exit animation if specified
      if (stage.leaveAt) {
        tl.to(
          element,
          {
            opacity: 0,
            scale: 0.8,
            duration: 0.1,
          },
          stage.leaveAt
        );
      }
    });

    timelineRef.current = tl;

    return () => {
      tl.kill();
    };
  }, [containerRef, stages, duration, start, scrub, markers, pin, pinSpacing, currentStage]);

  return {
    currentStage,
    progress,
    timeline: timelineRef.current,
  };
}

/**
 * Hook for parallax effects
 */
export function useParallax(
  ref: RefObject<HTMLElement | null>,
  options: ParallaxOptions = {}
) {
  const { speed = 0.5, direction = 'vertical', start = 'top bottom', end = 'bottom top' } =
    options;

  useEffect(() => {
    if (!ref.current || typeof window === 'undefined') return;

    const element = ref.current;
    const distance = direction === 'vertical' ? 100 * speed : 0;
    const distanceX = direction === 'horizontal' ? 100 * speed : 0;

    gsap.to(element, {
      y: direction === 'vertical' ? distance : 0,
      x: direction === 'horizontal' ? distanceX : 0,
      ease: 'none',
      scrollTrigger: {
        trigger: element,
        start,
        end,
        scrub: true,
      },
    });

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.vars.trigger === element) {
          trigger.kill();
        }
      });
    };
  }, [ref, speed, direction, start, end]);
}

/**
 * Hook for horizontal scroll sections
 */
export function useHorizontalScroll(
  containerRef: RefObject<HTMLElement | null>,
  contentRef: RefObject<HTMLElement | null>,
  options: { markers?: boolean; scrub?: boolean | number } = {}
) {
  const [progress, setProgress] = useState(0);

  const { markers = false, scrub = 1 } = options;

  useEffect(() => {
    if (!containerRef.current || !contentRef.current || typeof window === 'undefined')
      return;

    const container = containerRef.current;
    const content = contentRef.current;

    // Calculate how far to scroll
    const scrollDistance = content.scrollWidth - container.clientWidth;

    gsap.to(content, {
      x: -scrollDistance,
      ease: 'none',
      scrollTrigger: {
        trigger: container,
        start: 'top top',
        end: `+=${scrollDistance}`,
        scrub,
        pin: true,
        markers,
        onUpdate: (self) => setProgress(self.progress),
      },
    });

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.vars.trigger === container) {
          trigger.kill();
        }
      });
    };
  }, [containerRef, contentRef, markers, scrub]);

  return { progress };
}

/**
 * Utility to refresh all ScrollTriggers (call after dynamic content changes)
 */
export function refreshScrollTriggers() {
  if (typeof window !== 'undefined') {
    ScrollTrigger.refresh();
  }
}

/**
 * Utility to kill all ScrollTriggers
 */
export function killAllScrollTriggers() {
  if (typeof window !== 'undefined') {
    ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
  }
}

// Export GSAP for direct use
export { gsap, ScrollTrigger };
