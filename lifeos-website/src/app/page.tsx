'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { Hero, HeroHandle } from '@/components/Hero';
import { CharacterReveal } from '@/components/CharacterReveal';
import { Features } from '@/components/Features';
import { Modules } from '@/components/Modules';
import { Gamification } from '@/components/Gamification';
import { Screenshots } from '@/components/Screenshots';
import { CTA } from '@/components/CTA';
import { Pricing } from '@/components/Pricing';
import { BetaCTA } from '@/components/BetaCTA';
import { LoadingScreen } from '@/components/LoadingScreen';
import { Navbar, NavbarHandle } from '@/components/Navbar';
import { SmoothScrollProvider } from '@/components/SmoothScrollProvider';
import { AIShowcase } from '@/components/AIShowcase';

// Import GSAP for smooth scroll
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const LOADING_SHOWN_KEY = 'lifeos-loading-shown';

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [showLoadingScreen, setShowLoadingScreen] = useState(false);
  const heroRef = useRef<HeroHandle>(null);
  const navbarRef = useRef<NavbarHandle>(null);

  // Check sessionStorage on mount and set up initial state
  useEffect(() => {
    const hasSeenLoading = sessionStorage.getItem(LOADING_SHOWN_KEY) === 'true';

    if (hasSeenLoading) {
      // Returning visitor - content shows immediately (navbar handled by CSS)
      setIsLoading(false);
      setShowLoadingScreen(false);

      // Animate hero for visual interest
      requestAnimationFrame(() => {
        heroRef.current?.animateIn();
      });
    } else {
      // First visit - show loading screen
      setShowLoadingScreen(true);
    }
  }, []);

  // Called when loading screen animation completes
  const handleLoadingComplete = useCallback(() => {
    // Mark loading as shown for this session
    sessionStorage.setItem(LOADING_SHOWN_KEY, 'true');

    setIsLoading(false);
    setShowLoadingScreen(false);

    // Trigger hero animations
    setTimeout(() => {
      heroRef.current?.animateIn();
    }, 100);

    // Animate navbar after a delay (first visit only)
    setTimeout(() => {
      navbarRef.current?.animateIn();
    }, 600);
  }, []);

  useEffect(() => {
    // Refresh ScrollTrigger after all components mount and loading completes
    if (!isLoading) {
      const timer = setTimeout(() => {
        ScrollTrigger.refresh();
      }, 1000);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [isLoading]);

  useEffect(() => {
    // Cleanup ScrollTriggers on unmount
    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  return (
    <SmoothScrollProvider>
      {/* Loading Screen - only shown on first visit per session */}
      {showLoadingScreen && (
        <LoadingScreen onComplete={handleLoadingComplete} />
      )}

      {/* Navbar - visibility controlled by CSS based on returning-visitor class */}
      <Navbar ref={navbarRef} />

      {/* Main Content */}
      <main className="snap-container">
        <Hero ref={heroRef} showInitialAnimation={false} />
        <CharacterReveal />
        <Modules />
        <AIShowcase />
        <Gamification />
        <Screenshots />
        <Pricing />
        <BetaCTA />
        {/* Spacer to provide scroll height for pinned animations to complete */}
        <div className="h-[1100vh]" />
      </main>
    </SmoothScrollProvider>
  );
}
