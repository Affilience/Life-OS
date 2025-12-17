'use client';

/**
 * Anime.js React Hooks (TypeScript)
 *
 * Utility hooks for integrating anime.js animations with React components.
 * Provides text reveals, SVG drawing, stagger effects, and scroll-triggered animations.
 */

import { useEffect, useRef, useCallback, useState, RefObject } from 'react';
import {
  animate,
  createTimeline,
  stagger,
  utils,
  type JSAnimation,
  type Timeline,
} from 'animejs';

// Type alias for backwards compatibility
type Animation = JSAnimation;

// ============================================
// TYPES
// ============================================

interface TextSplitResult {
  chars: HTMLSpanElement[];
  words: HTMLSpanElement[];
  lines: HTMLSpanElement[];
}

interface TextRevealOptions {
  delay?: number;
  staggerDelay?: number;
  duration?: number;
  ease?: string;
  y?: number;
  rotate?: number;
  scale?: number;
  onComplete?: () => void;
  autoPlay?: boolean;
}

interface SVGDrawOptions {
  delay?: number;
  duration?: number;
  ease?: string;
  staggerDelay?: number;
  onComplete?: () => void;
  autoPlay?: boolean;
}

interface StaggerAnimationOptions {
  selector?: string;
  delay?: number;
  staggerDelay?: number;
  staggerFrom?: 'first' | 'last' | 'center' | number;
  duration?: number;
  ease?: string;
  y?: number;
  x?: number;
  scale?: number;
  opacity?: boolean;
  rotate?: number;
  onComplete?: () => void;
  autoPlay?: boolean;
}

interface ScrollAnimationOptions {
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
  onEnter?: () => void;
  onLeave?: () => void;
  onProgress?: (progress: number) => void;
}

interface TimelineOptions {
  autoPlay?: boolean;
  loop?: boolean | number;
  onComplete?: () => void;
}

interface CountUpOptions {
  from?: number;
  to?: number;
  duration?: number;
  ease?: string;
  delay?: number;
  decimals?: number;
  onComplete?: () => void;
}

interface ParticlesOptions {
  count?: number;
  colors?: string[];
  spread?: number;
  velocity?: number;
  gravity?: number;
  decay?: number;
  duration?: number;
}

// ============================================
// HELPERS
// ============================================

/**
 * Manual text splitter fallback
 */
function manualSplitText(
  element: HTMLElement,
  options: { chars?: boolean } = {}
): TextSplitResult {
  const text = element.textContent || '';
  const chars: HTMLSpanElement[] = [];
  const words: HTMLSpanElement[] = [];

  element.innerHTML = '';

  if (options.chars !== false) {
    text.split('').forEach((char, i) => {
      const span = document.createElement('span');
      span.textContent = char === ' ' ? '\u00A0' : char;
      span.style.display = 'inline-block';
      span.dataset.charIndex = String(i);
      element.appendChild(span);
      chars.push(span);
    });
  }

  return { chars, words, lines: [] };
}

// ============================================
// HOOKS
// ============================================

/**
 * Hook for revealing text character by character
 */
export function useTextReveal(
  ref: RefObject<HTMLElement | null>,
  options: TextRevealOptions = {}
) {
  const animationRef = useRef<Animation | null>(null);
  const hasAnimated = useRef(false);

  const {
    delay = 0,
    staggerDelay = 30,
    duration = 600,
    ease = 'outExpo',
    y = 20,
    rotate = 0,
    scale = 1,
    onComplete,
    autoPlay = true,
  } = options;

  const triggerAnimation = useCallback(() => {
    if (!ref.current || hasAnimated.current) return;

    const element = ref.current;
    const { chars } = manualSplitText(element, { chars: true });

    const animationConfig: Record<string, unknown> = {
      opacity: [0, 1],
      y: [y, 0],
      delay: stagger(staggerDelay, { start: delay }),
      duration,
      ease,
      onComplete: () => {
        hasAnimated.current = true;
        onComplete?.();
      },
    };

    if (rotate) {
      animationConfig.rotate = [rotate, 0];
    }
    if (scale !== 1) {
      animationConfig.scale = [scale, 1];
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    animationRef.current = animate(chars, animationConfig as any);
  }, [delay, staggerDelay, duration, ease, y, rotate, scale, onComplete, ref]);

  useEffect(() => {
    if (autoPlay) {
      triggerAnimation();
    }

    return () => {
      animationRef.current?.pause();
    };
  }, [autoPlay, triggerAnimation]);

  return { trigger: triggerAnimation, animation: animationRef.current };
}

/**
 * Hook for SVG path drawing animation
 */
export function useSVGDraw(
  ref: RefObject<SVGElement | null>,
  options: SVGDrawOptions = {}
) {
  const animationRef = useRef<Animation | null>(null);

  const {
    delay = 0,
    duration = 1500,
    ease = 'inOutQuad',
    staggerDelay = 100,
    onComplete,
    autoPlay = true,
  } = options;

  const triggerAnimation = useCallback(() => {
    if (!ref.current) return;

    const paths = ref.current.querySelectorAll(
      'path, line, polyline, circle, rect'
    ) as NodeListOf<SVGGeometryElement>;

    paths.forEach((path) => {
      const length = path.getTotalLength ? path.getTotalLength() : 100;
      path.style.strokeDasharray = String(length);
      path.style.strokeDashoffset = String(length);
    });

    // Animate each path's strokeDashoffset
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    animationRef.current = animate(paths, {
      strokeDashoffset: [
        (el: SVGGeometryElement) => el.style.strokeDasharray || '0',
        0,
      ],
      delay: stagger(staggerDelay, { start: delay }),
      duration,
      ease,
      ...(onComplete && { onComplete }),
    } as any);
  }, [delay, duration, ease, staggerDelay, onComplete, ref]);

  useEffect(() => {
    if (autoPlay) {
      const timer = setTimeout(triggerAnimation, 50);
      return () => clearTimeout(timer);
    }
  }, [autoPlay, triggerAnimation]);

  return { trigger: triggerAnimation, animation: animationRef.current };
}

/**
 * Hook for staggered element animations
 */
export function useStaggerAnimation(
  ref: RefObject<HTMLElement | null>,
  options: StaggerAnimationOptions = {}
) {
  const animationRef = useRef<Animation | null>(null);

  const {
    selector = '> *',
    delay = 0,
    staggerDelay = 100,
    staggerFrom = 'first',
    duration = 800,
    ease = 'outExpo',
    y = 30,
    x = 0,
    scale = 0.9,
    opacity = true,
    rotate = 0,
    onComplete,
    autoPlay = true,
  } = options;

  const triggerAnimation = useCallback(() => {
    if (!ref.current) return;

    // Fix: '> div' is not valid, use ':scope > div' for direct children
    const validSelector = selector.startsWith('>') ? `:scope ${selector}` : selector;
    const elements = ref.current.querySelectorAll(validSelector);
    if (elements.length === 0) return;

    const animationProps: Record<string, unknown> = {
      delay: stagger(staggerDelay, { start: delay, from: staggerFrom }),
      duration,
      ease,
      onComplete,
    };

    if (opacity) animationProps.opacity = [0, 1];
    if (y) animationProps.y = [y, 0];
    if (x) animationProps.x = [x, 0];
    if (scale !== 1) animationProps.scale = [scale, 1];
    if (rotate) animationProps.rotate = [rotate, 0];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    animationRef.current = animate(elements, animationProps as any);
  }, [
    selector,
    delay,
    staggerDelay,
    staggerFrom,
    duration,
    ease,
    y,
    x,
    scale,
    opacity,
    rotate,
    onComplete,
    ref,
  ]);

  useEffect(() => {
    if (autoPlay) {
      triggerAnimation();
    }
  }, [autoPlay, triggerAnimation]);

  return { trigger: triggerAnimation, animation: animationRef.current };
}

/**
 * Hook for scroll-triggered animations
 */
export function useScrollAnimation(
  ref: RefObject<HTMLElement | null>,
  options: ScrollAnimationOptions = {}
) {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const {
    threshold = 0.2,
    rootMargin = '0px',
    once = true,
    onEnter,
    onLeave,
    onProgress,
  } = options;

  useEffect(() => {
    if (!ref.current) return;

    const element = ref.current;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            onEnter?.();
            if (once) {
              observerRef.current?.disconnect();
            }
          } else if (!once) {
            setIsVisible(false);
            onLeave?.();
          }
        });
      },
      { threshold, rootMargin }
    );

    observerRef.current.observe(element);

    const handleScroll = () => {
      const rect = element.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const elementTop = rect.top;
      const elementHeight = rect.height;
      const start = windowHeight;
      const end = -elementHeight;
      const current = elementTop;

      const newProgress = Math.max(
        0,
        Math.min(1, (start - current) / (start - end))
      );
      setProgress(newProgress);
      onProgress?.(newProgress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      observerRef.current?.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, [threshold, rootMargin, once, onEnter, onLeave, onProgress, ref]);

  return { isVisible, progress };
}

/**
 * Hook for creating complex animation timelines
 */
export function useTimeline(options: TimelineOptions = {}) {
  const timelineRef = useRef<Timeline | null>(null);

  const { autoPlay = false, loop = false, onComplete } = options;

  useEffect(() => {
    timelineRef.current = createTimeline({
      autoplay: autoPlay,
      loop,
      onComplete,
    });

    return () => {
      timelineRef.current?.pause();
    };
  }, [autoPlay, loop, onComplete]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const add = useCallback(
    (targets: any, props: any, position?: any) => {
      if (timelineRef.current) {
        timelineRef.current.add(targets, props, position);
      }
      return timelineRef.current;
    },
    []
  );

  const play = useCallback(() => {
    timelineRef.current?.play();
  }, []);

  const pause = useCallback(() => {
    timelineRef.current?.pause();
  }, []);

  const restart = useCallback(() => {
    timelineRef.current?.restart();
  }, []);

  const seek = useCallback((time: number) => {
    timelineRef.current?.seek(time);
  }, []);

  return {
    timeline: timelineRef.current,
    add,
    play,
    pause,
    restart,
    seek,
  };
}

/**
 * Hook for number counting animation
 */
export function useCountUp(options: CountUpOptions = {}) {
  const [value, setValue] = useState<number | string>(options.from || 0);
  const animationRef = useRef<Animation | null>(null);

  const {
    from = 0,
    to = 100,
    duration = 2000,
    ease = 'outExpo',
    delay = 0,
    decimals = 0,
    onComplete,
  } = options;

  const trigger = useCallback(() => {
    const obj = { value: from };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    animationRef.current = animate(obj, {
      value: to,
      duration,
      ease,
      delay,
      onUpdate: () => {
        setValue(
          decimals > 0 ? obj.value.toFixed(decimals) : Math.round(obj.value)
        );
      },
      ...(onComplete && { onComplete }),
    } as any);
  }, [from, to, duration, ease, delay, decimals, onComplete]);

  return { value, trigger };
}

/**
 * Hook for particle/confetti animations
 */
export function useParticles(
  containerRef: RefObject<HTMLElement | null>,
  options: ParticlesOptions = {}
) {
  const {
    count = 50,
    colors = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'],
    velocity = 500,
    duration = 3000,
  } = options;

  const burst = useCallback(
    (x: number, y: number) => {
      if (!containerRef.current) return;

      const container = containerRef.current;
      const particles: HTMLDivElement[] = [];

      for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.className = 'anime-particle';
        particle.style.cssText = `
          position: absolute;
          width: ${4 + Math.random() * 4}px;
          height: ${4 + Math.random() * 4}px;
          background: ${colors[Math.floor(Math.random() * colors.length)]};
          border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
          pointer-events: none;
          left: ${x}px;
          top: ${y}px;
        `;
        container.appendChild(particle);
        particles.push(particle);
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      animate(particles, {
        x: () => (Math.random() - 0.5) * velocity,
        y: () => (Math.random() - 0.5) * velocity + Math.random() * 200,
        scale: [1, 0],
        opacity: [1, 0],
        rotate: () => Math.random() * 720 - 360,
        duration: () => duration + Math.random() * 1000,
        ease: 'outExpo',
        onComplete: () => {
          particles.forEach((p) => p.remove());
        },
      } as any);
    },
    [containerRef, count, colors, velocity, duration]
  );

  return { burst };
}

// Re-export anime.js utilities
export { animate, createTimeline, stagger, utils };
