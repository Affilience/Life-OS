/**
 * Anime.js React Hooks
 *
 * Utility hooks for integrating anime.js animations with React components.
 * Provides text reveals, SVG drawing, stagger effects, and scroll-triggered animations.
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import {
  animate,
  createTimeline,
  stagger,
  utils,
} from 'animejs';

// Note: splitText is not available in anime.js v4 base - we use manual splitting

/**
 * Manual text splitter fallback
 */
function manualSplitText(element, options = {}) {
  const text = element.textContent;
  const chars = [];
  const words = [];

  element.innerHTML = '';

  if (options.chars !== false) {
    text.split('').forEach((char, i) => {
      const span = document.createElement('span');
      span.textContent = char === ' ' ? '\u00A0' : char;
      span.style.display = 'inline-block';
      span.dataset.charIndex = i;
      element.appendChild(span);
      chars.push(span);
    });
  }

  return { chars, words, lines: [] };
}

/**
 * Hook for revealing text character by character
 */
export function useTextReveal(ref, options = {}) {
  const animationRef = useRef(null);
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
    const originalText = element.textContent;

    // Split text into characters
    const { chars } = manualSplitText(element, { chars: true });

    // Animate characters
    animationRef.current = animate(chars, {
      opacity: [0, 1],
      y: [y, 0],
      rotate: rotate ? [rotate, 0] : undefined,
      scale: scale !== 1 ? [scale, 1] : undefined,
      delay: stagger(staggerDelay, { start: delay }),
      duration,
      ease,
      onComplete: () => {
        hasAnimated.current = true;
        onComplete?.();
      },
    });
  }, [delay, staggerDelay, duration, ease, y, rotate, scale, onComplete]);

  useEffect(() => {
    if (autoPlay) {
      triggerAnimation();
    }

    return () => {
      if (animationRef.current) {
        animationRef.current.pause();
      }
    };
  }, [autoPlay, triggerAnimation]);

  return { trigger: triggerAnimation, animation: animationRef.current };
}

/**
 * Hook for SVG path drawing animation
 */
export function useSVGDraw(ref, options = {}) {
  const animationRef = useRef(null);

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

    const paths = ref.current.querySelectorAll('path, line, polyline, circle, rect');

    // Set initial state
    paths.forEach(path => {
      const length = path.getTotalLength ? path.getTotalLength() : 100;
      path.style.strokeDasharray = length;
      path.style.strokeDashoffset = length;
    });

    animationRef.current = animate(paths, {
      strokeDashoffset: [utils.get('strokeDasharray'), 0],
      delay: stagger(staggerDelay, { start: delay }),
      duration,
      ease,
      onComplete,
    });
  }, [delay, duration, ease, staggerDelay, onComplete]);

  useEffect(() => {
    if (autoPlay) {
      // Small delay to ensure SVG is rendered
      const timer = setTimeout(triggerAnimation, 50);
      return () => clearTimeout(timer);
    }
  }, [autoPlay, triggerAnimation]);

  return { trigger: triggerAnimation, animation: animationRef.current };
}

/**
 * Hook for staggered element animations
 */
export function useStaggerAnimation(ref, options = {}) {
  const animationRef = useRef(null);

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

    const elements = ref.current.querySelectorAll(selector);
    if (elements.length === 0) return;

    const animationProps = {
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

    animationRef.current = animate(elements, animationProps);
  }, [selector, delay, staggerDelay, staggerFrom, duration, ease, y, x, scale, opacity, rotate, onComplete]);

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
export function useScrollAnimation(ref, options = {}) {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const observerRef = useRef(null);

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

    // Intersection Observer for visibility
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
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

    // Scroll progress tracking
    const handleScroll = () => {
      const rect = element.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Calculate progress (0 = element just entered, 1 = element just left)
      const elementTop = rect.top;
      const elementHeight = rect.height;

      // Progress from when element enters bottom to when it leaves top
      const start = windowHeight;
      const end = -elementHeight;
      const current = elementTop;

      const newProgress = Math.max(0, Math.min(1, (start - current) / (start - end)));
      setProgress(newProgress);
      onProgress?.(newProgress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      observerRef.current?.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, [threshold, rootMargin, once, onEnter, onLeave, onProgress]);

  return { isVisible, progress };
}

/**
 * Hook for creating complex animation timelines
 */
export function useTimeline(options = {}) {
  const timelineRef = useRef(null);

  const {
    autoPlay = false,
    loop = false,
    onComplete,
  } = options;

  useEffect(() => {
    timelineRef.current = createTimeline({
      autoplay: autoPlay,
      loop,
      onComplete,
    });

    return () => {
      if (timelineRef.current) {
        timelineRef.current.pause();
      }
    };
  }, []);

  const add = useCallback((targets, props, position) => {
    if (timelineRef.current) {
      timelineRef.current.add(targets, props, position);
    }
    return timelineRef.current;
  }, []);

  const play = useCallback(() => {
    timelineRef.current?.play();
  }, []);

  const pause = useCallback(() => {
    timelineRef.current?.pause();
  }, []);

  const restart = useCallback(() => {
    timelineRef.current?.restart();
  }, []);

  const seek = useCallback((time) => {
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
export function useCountUp(options = {}) {
  const [value, setValue] = useState(options.from || 0);
  const animationRef = useRef(null);

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

    animationRef.current = animate(obj, {
      value: to,
      duration,
      ease,
      delay,
      onUpdate: () => {
        setValue(decimals > 0 ? obj.value.toFixed(decimals) : Math.round(obj.value));
      },
      onComplete,
    });
  }, [from, to, duration, ease, delay, decimals, onComplete]);

  return { value, trigger };
}

/**
 * Hook for particle/confetti animations
 */
export function useParticles(containerRef, options = {}) {
  const particlesRef = useRef([]);

  const {
    count = 50,
    colors = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'],
    spread = 360,
    velocity = 500,
    gravity = 0.5,
    decay = 0.95,
    duration = 3000,
  } = options;

  const burst = useCallback((x, y) => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const particles = [];

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

    // Animate particles
    animate(particles, {
      x: () => (Math.random() - 0.5) * velocity,
      y: () => (Math.random() - 0.5) * velocity + Math.random() * 200,
      scale: [1, 0],
      opacity: [1, 0],
      rotate: () => Math.random() * 720 - 360,
      duration: () => duration + Math.random() * 1000,
      ease: 'outExpo',
      onComplete: () => {
        particles.forEach(p => p.remove());
      },
    });
  }, [containerRef, count, colors, velocity, duration]);

  return { burst };
}

export { animate, createTimeline, stagger, utils };
