/**
 * Page Transition System
 *
 * Provides smooth transitions between pages/views:
 * - Fade transitions
 * - Slide transitions
 * - Scale transitions
 * - Custom animation support
 */

import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * PageTransition - Wrap page content for transition effects
 */
export function PageTransition({
  children,
  type = 'fade',
  duration = 200,
  className = '',
}) {
  const [isVisible, setIsVisible] = useState(false);
  const location = useLocation();
  const prevLocationRef = useRef(location.pathname);

  useEffect(() => {
    // Trigger enter animation
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (prevLocationRef.current !== location.pathname) {
      setIsVisible(false);
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, duration);
      prevLocationRef.current = location.pathname;
      return () => clearTimeout(timer);
    }
  }, [location.pathname, duration]);

  const transitionStyles = {
    fade: {
      initial: 'opacity-0',
      enter: 'opacity-100',
    },
    'fade-up': {
      initial: 'opacity-0 translate-y-4',
      enter: 'opacity-100 translate-y-0',
    },
    'fade-down': {
      initial: 'opacity-0 -translate-y-4',
      enter: 'opacity-100 translate-y-0',
    },
    'slide-left': {
      initial: 'opacity-0 translate-x-4',
      enter: 'opacity-100 translate-x-0',
    },
    'slide-right': {
      initial: 'opacity-0 -translate-x-4',
      enter: 'opacity-100 translate-x-0',
    },
    scale: {
      initial: 'opacity-0 scale-95',
      enter: 'opacity-100 scale-100',
    },
    'scale-up': {
      initial: 'opacity-0 scale-90',
      enter: 'opacity-100 scale-100',
    },
  };

  const styles = transitionStyles[type] || transitionStyles.fade;

  return (
    <div
      className={`
        transition-all
        ${isVisible ? styles.enter : styles.initial}
        ${className}
      `}
      style={{ transitionDuration: `${duration}ms` }}
    >
      {children}
    </div>
  );
}

/**
 * AnimatePresence - Simple presence animation wrapper
 * Animates items in/out when they mount/unmount
 */
export function AnimatePresence({
  children,
  show,
  type = 'fade',
  duration = 200,
  unmountOnExit = true,
  className = '',
  onExitComplete,
}) {
  const [shouldRender, setShouldRender] = useState(show);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (show) {
      setShouldRender(true);
      requestAnimationFrame(() => setIsAnimating(true));
    } else {
      setIsAnimating(false);
      if (unmountOnExit) {
        const timer = setTimeout(() => {
          setShouldRender(false);
          onExitComplete?.();
        }, duration);
        return () => clearTimeout(timer);
      }
    }
  }, [show, duration, unmountOnExit, onExitComplete]);

  if (!shouldRender && unmountOnExit) return null;

  const transitionStyles = {
    fade: {
      initial: 'opacity-0',
      enter: 'opacity-100',
    },
    'fade-up': {
      initial: 'opacity-0 translate-y-2',
      enter: 'opacity-100 translate-y-0',
    },
    'fade-down': {
      initial: 'opacity-0 -translate-y-2',
      enter: 'opacity-100 translate-y-0',
    },
    scale: {
      initial: 'opacity-0 scale-95',
      enter: 'opacity-100 scale-100',
    },
    'slide-up': {
      initial: 'opacity-0 translate-y-full',
      enter: 'opacity-100 translate-y-0',
    },
    'slide-down': {
      initial: 'opacity-0 -translate-y-full',
      enter: 'opacity-100 translate-y-0',
    },
  };

  const styles = transitionStyles[type] || transitionStyles.fade;

  return (
    <div
      className={`
        transition-all
        ${isAnimating ? styles.enter : styles.initial}
        ${className}
      `}
      style={{ transitionDuration: `${duration}ms` }}
    >
      {children}
    </div>
  );
}

/**
 * Stagger - Stagger animation for list items
 */
export function Stagger({
  children,
  staggerDelay = 50,
  initialDelay = 0,
  type = 'fade-up',
  duration = 300,
  className = '',
}) {
  const [visibleItems, setVisibleItems] = useState(new Set());

  useEffect(() => {
    const childCount = React.Children.count(children);
    const timers = [];

    React.Children.forEach(children, (_, index) => {
      const timer = setTimeout(() => {
        setVisibleItems((prev) => new Set([...prev, index]));
      }, initialDelay + index * staggerDelay);
      timers.push(timer);
    });

    return () => timers.forEach(clearTimeout);
  }, [children, staggerDelay, initialDelay]);

  const transitionStyles = {
    fade: { initial: 'opacity-0', enter: 'opacity-100' },
    'fade-up': { initial: 'opacity-0 translate-y-4', enter: 'opacity-100 translate-y-0' },
    'fade-down': { initial: 'opacity-0 -translate-y-4', enter: 'opacity-100 translate-y-0' },
    scale: { initial: 'opacity-0 scale-90', enter: 'opacity-100 scale-100' },
  };

  const styles = transitionStyles[type] || transitionStyles.fade;

  return (
    <div className={className}>
      {React.Children.map(children, (child, index) => (
        <div
          key={index}
          className={`
            transition-all
            ${visibleItems.has(index) ? styles.enter : styles.initial}
          `}
          style={{
            transitionDuration: `${duration}ms`,
            transitionDelay: visibleItems.has(index) ? '0ms' : `${index * staggerDelay}ms`,
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}

/**
 * Hook: usePageTransition
 * Returns transition state and handlers
 */
export function usePageTransition(duration = 200) {
  const [state, setState] = useState('entered');
  const location = useLocation();
  const prevPathRef = useRef(location.pathname);

  useEffect(() => {
    if (prevPathRef.current !== location.pathname) {
      setState('exiting');
      const exitTimer = setTimeout(() => {
        setState('entering');
        prevPathRef.current = location.pathname;

        const enterTimer = setTimeout(() => {
          setState('entered');
        }, duration);

        return () => clearTimeout(enterTimer);
      }, duration);

      return () => clearTimeout(exitTimer);
    }
  }, [location.pathname, duration]);

  return {
    state,
    isEntering: state === 'entering',
    isExiting: state === 'exiting',
    isEntered: state === 'entered',
  };
}

/**
 * Hook: useIntersectionAnimation
 * Triggers animation when element enters viewport
 */
export function useIntersectionAnimation(options = {}) {
  const { threshold = 0.1, triggerOnce = true, rootMargin = '0px' } = options;
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (triggerOnce) {
            observer.unobserve(element);
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold, triggerOnce, rootMargin]);

  return { ref, isVisible };
}

/**
 * FadeInOnScroll - Wrapper for scroll-triggered animations
 */
export function FadeInOnScroll({
  children,
  type = 'fade-up',
  duration = 500,
  threshold = 0.1,
  delay = 0,
  className = '',
}) {
  const { ref, isVisible } = useIntersectionAnimation({ threshold });

  const transitionStyles = {
    fade: { initial: 'opacity-0', enter: 'opacity-100' },
    'fade-up': { initial: 'opacity-0 translate-y-8', enter: 'opacity-100 translate-y-0' },
    'fade-down': { initial: 'opacity-0 -translate-y-8', enter: 'opacity-100 translate-y-0' },
    'fade-left': { initial: 'opacity-0 translate-x-8', enter: 'opacity-100 translate-x-0' },
    'fade-right': { initial: 'opacity-0 -translate-x-8', enter: 'opacity-100 translate-x-0' },
    scale: { initial: 'opacity-0 scale-90', enter: 'opacity-100 scale-100' },
  };

  const styles = transitionStyles[type] || transitionStyles.fade;

  return (
    <div
      ref={ref}
      className={`
        transition-all
        ${isVisible ? styles.enter : styles.initial}
        ${className}
      `}
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

export default PageTransition;
