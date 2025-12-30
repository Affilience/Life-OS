/**
 * Immersive Onboarding - Cinematic Scroll Experience
 *
 * EXACT COPY of lifeos-website scroll architecture:
 * - Lenis for buttery smooth scrolling
 * - GSAP ScrollTrigger with pinSpacing: false
 * - Large spacer at end for scroll height
 * - Scrubbed animations tied to scroll position
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { useNewOnboardingStore } from '../../../stores/newOnboardingStore';
import { useGamificationModeStore } from '../../../stores/gamificationModeStore';
import { feedback } from '../../../services/microInteractions';

// Section Components
import ImmersiveIntro from './immersive/ImmersiveIntro';
import ImmersiveHeroSelect from './immersive/ImmersiveHeroSelect';
import ImmersiveSkinToneSelect from './immersive/ImmersiveSkinToneSelect';
import ImmersiveAvatarCustomisation from './immersive/ImmersiveAvatarCustomisation';
import ImmersiveGamification from './immersive/ImmersiveGamification';
import ImmersiveIdentity from './immersive/ImmersiveIdentity';
import ImmersiveGoals from './immersive/ImmersiveGoals';
import ImmersiveLaunch from './immersive/ImmersiveLaunch';

// Avatar store for character gender
import { useAvatarStore } from '../../../stores/avatarStore';

// Social store for saving to database
import { useSocialStore } from '../../../stores/socialStore';

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// Section configuration - full cosmic experience (no mode selection needed)
const SECTIONS = [
  { id: 'intro', component: ImmersiveIntro },
  { id: 'hero', component: ImmersiveHeroSelect, requiresInteraction: true },
  { id: 'skinTone', component: ImmersiveSkinToneSelect, requiresInteraction: true },
  { id: 'identity', component: ImmersiveIdentity, requiresInteraction: true },
  { id: 'gamification', component: ImmersiveGamification, requiresInteraction: true },
  { id: 'goals', component: ImmersiveGoals, requiresInteraction: true },
  { id: 'launch', component: ImmersiveLaunch },
];

export default function ImmersiveOnboarding() {
  const containerRef = useRef(null);
  const lenisRef = useRef(null);
  const [currentSection, setCurrentSection] = useState(0);
  const [isScrollLocked, setIsScrollLocked] = useState(false);

  // Navigation
  const navigate = useNavigate();

  // Store connections
  const {
    completeOnboarding,
    profile,
    lifeGoals,
    setLifeGoals,
    updateProfile,
  } = useNewOnboardingStore();

  const { setMode } = useGamificationModeStore();

  // Avatar store for character gender and skin tone
  const { characterGender, setCharacterGender, skinTone, setSkinTone } = useAvatarStore();

  // Social store for saving username/display_name to database
  const { updateSocialProfile, updateUsername } = useSocialStore();

  // Static sections - always use cosmic mode
  const sections = SECTIONS;

  // Derived values
  const username = profile?.username || profile?.displayName || '';

  // Handler to save username/display_name to both local store AND database
  const setUsername = useCallback(async (name) => {
    console.log('[Onboarding] Saving username to database:', name);

    // Update local onboarding store
    updateProfile({ username: name, displayName: name });

    // Save to database - both username and display_name
    try {
      await updateSocialProfile({ display_name: name, username: name });
      console.log('[Onboarding] ✅ Username saved to database');
    } catch (error) {
      console.error('[Onboarding] Failed to save username to database:', error);
    }
  }, [updateProfile, updateSocialProfile]);
  const selectedGoals = lifeGoals || [];
  const setSelectedGoals = setLifeGoals;

  // CRITICAL: Override global height: 100% that blocks scrolling
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Save original styles
    const originalHtmlStyle = document.documentElement.style.cssText;
    const originalBodyStyle = document.body.style.cssText;
    const root = document.getElementById('root');
    const originalRootStyle = root?.style.cssText || '';

    // Override height restrictions for scroll to work
    document.documentElement.style.height = 'auto';
    document.documentElement.style.overflow = 'auto';
    document.body.style.height = 'auto';
    document.body.style.overflow = 'auto';
    if (root) {
      root.style.height = 'auto';
      root.style.overflow = 'visible';
    }

    return () => {
      // Restore original styles on unmount
      document.documentElement.style.cssText = originalHtmlStyle;
      document.body.style.cssText = originalBodyStyle;
      if (root) root.style.cssText = originalRootStyle;
    };
  }, []);

  // Initialize Lenis smooth scrolling (EXACTLY like website's SmoothScrollProvider)
  useEffect(() => {
    if (typeof window === 'undefined') return;

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

    // Add Lenis to GSAP ticker for smooth animation frame sync
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    // Disable GSAP lag smoothing for precise scroll sync
    gsap.ticker.lagSmoothing(0);

    // Refresh ScrollTrigger after setup
    setTimeout(() => {
      ScrollTrigger.refresh();
    }, 100);

    // Cleanup
    return () => {
      lenis.destroy();
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  // Lock/unlock scroll via Lenis
  useEffect(() => {
    if (!lenisRef.current) return;

    if (isScrollLocked) {
      lenisRef.current.stop();
    } else {
      lenisRef.current.start();
    }
  }, [isScrollLocked]);

  // Handle scroll lock from sections
  const handleScrollLock = useCallback((locked) => {
    setIsScrollLocked(locked);
  }, []);

  // Scroll to specific section
  const scrollToSection = useCallback((index) => {
    if (!containerRef.current || !lenisRef.current) return;

    const sections = containerRef.current.querySelectorAll('.immersive-section');
    const targetSection = sections[index];

    if (targetSection) {
      lenisRef.current.scrollTo(targetSection, {
        offset: 0,
        duration: 1.5,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      });
    }
  }, []);

  // Handle section completion
  const handleSectionComplete = useCallback((sectionId) => {
    const sectionIndex = sections.findIndex(s => s.id === sectionId);
    if (sectionIndex < sections.length - 1) {
      // Unlock scroll and auto-advance
      setIsScrollLocked(false);
      setTimeout(() => {
        scrollToSection(sectionIndex + 1);
      }, 300);
    }
  }, [scrollToSection, sections]);

  // Handle final launch - async to ensure Supabase sync completes before navigating
  const handleLaunch = useCallback(async () => {
    feedback.achievement();
    // Always set cosmic mode
    setMode('cosmic');

    // CRITICAL: Await completion to ensure Supabase sync finishes
    // This prevents the race condition where localStorage is set but DB isn't synced
    await completeOnboarding();

    // Navigate to dashboard after successful completion
    console.log('[Onboarding] ✨ Launch complete! Navigating to dashboard...');
    navigate('/', { replace: true });
  }, [completeOnboarding, setMode, navigate]);

  // Track current section for progress indicator
  const handleSectionEnter = useCallback((sectionId) => {
    const index = sections.findIndex(s => s.id === sectionId);
    if (index !== -1) {
      setCurrentSection(index);
    }
  }, [sections]);

  return (
    <div className="immersive-onboarding" ref={containerRef}>
      {/* Cosmic Background - Fixed parallax layers */}
      <div className="immersive-background">
        <div className="bg-layer bg-stars" />
        <div className="bg-layer bg-nebula" />
        <div className="bg-layer bg-glow" />
      </div>

      {/* Progress indicator */}
      <div className="immersive-progress">
        {sections.map((section, index) => (
          <button
            key={section.id}
            className={`progress-dot ${index === currentSection ? 'active' : ''} ${index < currentSection ? 'completed' : ''}`}
            onClick={() => scrollToSection(index)}
            aria-label={`Go to ${section.id}`}
          >
            <span className="dot-inner" />
            <span className="dot-pulse" />
          </button>
        ))}
      </div>

      {/* Skip button */}
      <button
        className="immersive-skip"
        onClick={async () => {
          if (window.confirm('Skip the onboarding experience?')) {
            await completeOnboarding();
            navigate('/', { replace: true });
          }
        }}
      >
        Skip
      </button>

      {/* Sections - each is min-h-screen, handles its own pinning */}
      <main className="immersive-sections">
        {sections.map((section, index) => {
          const Section = section.component;

          return (
            <Section
              key={section.id}
              sectionId={section.id}
              onComplete={() => handleSectionComplete(section.id)}
              onLockScroll={handleScrollLock}
              onLaunch={handleLaunch}
              onSectionEnter={() => handleSectionEnter(section.id)}
              // Data props
              username={username}
              setUsername={setUsername}
              selectedGoals={selectedGoals}
              setSelectedGoals={setSelectedGoals}
              characterGender={characterGender}
              setCharacterGender={setCharacterGender}
              skinTone={skinTone}
              setSkinTone={setSkinTone}
            />
          );
        })}

        {/* CRITICAL: Large spacer to provide scroll height for all pinned animations */}
        {/* This is exactly how the website works - pinSpacing: false needs this */}
        <div className="spacer" />
      </main>

      <style>{`
        .immersive-onboarding {
          position: relative;
          width: 100%;
          min-height: 100vh;
          background: #030014;
          overflow-x: hidden;
          touch-action: pan-y;
        }

        /* Background layers */
        .immersive-background {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 0;
        }

        .bg-layer {
          position: absolute;
          inset: 0;
        }

        .bg-stars {
          background:
            radial-gradient(2px 2px at 20px 30px, white, transparent),
            radial-gradient(2px 2px at 40px 70px, rgba(255,255,255,0.8), transparent),
            radial-gradient(1px 1px at 90px 40px, white, transparent),
            radial-gradient(2px 2px at 160px 120px, rgba(255,255,255,0.9), transparent),
            radial-gradient(1px 1px at 230px 80px, white, transparent),
            radial-gradient(2px 2px at 300px 160px, rgba(255,255,255,0.7), transparent),
            radial-gradient(1px 1px at 370px 200px, white, transparent),
            radial-gradient(2px 2px at 440px 100px, rgba(255,255,255,0.8), transparent);
          background-size: 500px 300px;
          animation: starsDrift 120s linear infinite;
          opacity: 0.6;
        }

        @keyframes starsDrift {
          from { background-position: 0 0; }
          to { background-position: 500px 300px; }
        }

        .bg-nebula {
          background:
            radial-gradient(ellipse at 20% 30%, rgba(139, 92, 246, 0.15) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 70%, rgba(236, 72, 153, 0.1) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 50%, rgba(59, 130, 246, 0.08) 0%, transparent 60%);
          animation: nebulaShift 30s ease-in-out infinite;
        }

        @keyframes nebulaShift {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.1); }
        }

        .bg-glow {
          background: radial-gradient(
            ellipse at 50% 50%,
            rgba(139, 92, 246, 0.05) 0%,
            transparent 70%
          );
        }

        /* Sections container */
        .immersive-sections {
          position: relative;
          z-index: 10;
        }

        /* Spacer for scroll height - provides space for 7 sections with exit animations */
        .spacer {
          height: 600vh;
        }

        /* Progress indicator */
        .immersive-progress {
          position: fixed;
          right: 1rem;
          top: 50%;
          transform: translateY(-50%);
          display: flex;
          flex-direction: column;
          gap: 8px;
          z-index: 100;
        }

        .progress-dot {
          position: relative;
          width: 6px;
          height: 6px;
          padding: 0;
          background: transparent;
          border: none;
          cursor: pointer;
        }

        .dot-inner {
          position: absolute;
          inset: 0;
          background: rgba(255, 255, 255, 0.3);
          border: none;
          border-radius: 50%;
          transition: all 0.3s ease;
        }

        .dot-pulse {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: rgba(139, 92, 246, 0.4);
          opacity: 0;
          transform: scale(0);
        }

        .progress-dot:hover .dot-inner {
          background: rgba(139, 92, 246, 0.6);
        }

        .progress-dot.active .dot-inner {
          background: #8b5cf6;
          box-shadow: 0 0 6px rgba(139, 92, 246, 0.5);
        }

        .progress-dot.active .dot-pulse {
          animation: dotPulse 2s ease-in-out infinite;
        }

        @keyframes dotPulse {
          0% { opacity: 0.6; transform: scale(1); }
          100% { opacity: 0; transform: scale(2.5); }
        }

        .progress-dot.completed .dot-inner {
          background: rgba(139, 92, 246, 0.6);
          border-color: #8b5cf6;
        }

        /* Skip button */
        .immersive-skip {
          position: fixed;
          top: 2rem;
          right: 2rem;
          padding: 0.75rem 1.5rem;
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 9999px;
          color: rgba(255, 255, 255, 0.5);
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.3s ease;
          z-index: 100;
        }

        .immersive-skip:hover {
          background: rgba(255, 255, 255, 0.1);
          color: white;
          border-color: rgba(255, 255, 255, 0.2);
        }

        @media (max-width: 768px) {
          .immersive-progress {
            right: 0.15rem;
            gap: 3px;
          }

          .progress-dot {
            width: 2px;
            height: 2px;
          }

          .dot-pulse {
            display: none;
          }

          .immersive-skip {
            top: 1rem;
            right: 1rem;
            padding: 0.5rem 1rem;
            font-size: 0.75rem;
          }
        }

        @media (max-width: 480px) {
          .immersive-progress {
            right: 0.1rem;
            gap: 2px;
          }

          .progress-dot {
            width: 1.5px;
            height: 1.5px;
          }

          .progress-dot.active .dot-inner {
            box-shadow: 0 0 1px rgba(139, 92, 246, 0.4);
          }

          .immersive-skip {
            top: 0.75rem;
            right: 0.75rem;
            padding: 0.4rem 0.8rem;
            font-size: 0.7rem;
          }
        }
      `}</style>
    </div>
  );
}
