'use client';

import { useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface SmoothScrollProviderProps {
  children: React.ReactNode;
}

export function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  const lenisRef = useRef<Lenis | null>(null);
  const rafRef = useRef<((time: number) => void) | null>(null);

  useEffect(() => {
    // Skip Lenis on mobile - native scroll performs better on touch devices
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      // On mobile, kill ALL ScrollTriggers to ensure native scrolling works
      // This prevents any pinned sections from blocking scroll
      const killPinnedTriggers = () => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            // Only kill pinned ScrollTriggers - allow simple scroll animations
            ScrollTrigger.getAll().forEach(trigger => {
              if (trigger.vars?.pin) {
                trigger.kill();
              }
            });
            ScrollTrigger.refresh(true);
          });
        });
      };

      // Kill triggers after a short delay to ensure hydration is complete
      const timer = setTimeout(killPinnedTriggers, 100);

      // Also kill on load event for cached pages
      window.addEventListener('load', killPinnedTriggers);

      return () => {
        clearTimeout(timer);
        window.removeEventListener('load', killPinnedTriggers);
      };
    }

    // Initialize Lenis with optimized settings for buttery smooth scroll
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
      infinite: false,
    });

    lenisRef.current = lenis;

    // Sync Lenis with GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    // Create RAF callback and store reference for cleanup
    const rafCallback = (time: number) => {
      lenis.raf(time * 1000);
    };
    rafRef.current = rafCallback;

    // Add Lenis to GSAP ticker for smooth animation frame sync
    gsap.ticker.add(rafCallback);

    // Disable GSAP lag smoothing for precise scroll sync
    gsap.ticker.lagSmoothing(0);

    // Cleanup
    return () => {
      if (lenisRef.current) {
        lenisRef.current.destroy();
      }
      if (rafRef.current) {
        gsap.ticker.remove(rafRef.current);
      }
    };
  }, []);

  return <>{children}</>;
}
