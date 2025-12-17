/**
 * Cinematic Onboarding
 *
 * A scroll-based, cinematic onboarding experience that combines:
 * - Anime.js for 2D animations (text reveals, SVG drawing, staggers)
 * - Three.js for 3D backgrounds (starfields, particles, nebulae)
 * - Smooth scroll-triggered animations
 * - Data entry sections integrated seamlessly
 *
 * Users scroll through sections instead of clicking "Next"
 */

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { animate, stagger, createTimeline } from 'animejs';
import { useNewOnboardingStore } from '../../../stores/newOnboardingStore';
import { useGamificationModeStore } from '../../../stores/gamificationModeStore';
import { feedback } from '../../../services/microInteractions';
import MinimalBackground from './MinimalBackground';

// Section Components
import IntroSection from './sections/IntroSection';
import ModeSelectionSection from './sections/ModeSelectionSection';
import IdentitySection from './sections/IdentitySection';
import AvatarSelectionSection from './sections/AvatarSelectionSection';
import GoalsSection from './sections/GoalsSection';
import GamificationSection from './sections/GamificationSection';
import LaunchSection from './sections/LaunchSection';

// Styles
import './CinematicOnboarding.css';

// Section configuration
// Note: Some sections are conditionally shown based on gamification mode
const ALL_SECTIONS = [
  { id: 'intro', component: IntroSection, phase: 0, showInMinimal: true },
  { id: 'mode', component: ModeSelectionSection, phase: 0, showInMinimal: true },
  { id: 'identity', component: IdentitySection, phase: 1, showInMinimal: true },
  { id: 'avatar', component: AvatarSelectionSection, phase: 1, showInMinimal: false }, // Skip in minimal
  { id: 'goals', component: GoalsSection, phase: 1, showInMinimal: true },
  { id: 'gamification', component: GamificationSection, phase: 2, showInMinimal: false }, // Skip in minimal
  { id: 'launch', component: LaunchSection, phase: 3, showInMinimal: true },
];

export default function CinematicOnboarding() {
  const containerRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [currentSection, setCurrentSection] = useState(0);
  const [sectionProgress, setSectionProgress] = useState({});
  const [canContinue, setCanContinue] = useState(true);
  const [isScrollLocked, setIsScrollLocked] = useState(false);

  // Store connections
  const {
    completeOnboarding,
    profile,
    updateProfile,
    lifeGoals,
    setLifeGoals,
    gamificationMode,
    setGamificationMode,
  } = useNewOnboardingStore();

  const { setMode } = useGamificationModeStore();

  // Filter sections based on gamification mode
  const SECTIONS = useMemo(() => {
    if (!gamificationMode) {
      // Show all sections until mode is selected
      return ALL_SECTIONS;
    }
    if (gamificationMode === 'minimal') {
      // Filter out cosmic-only sections
      return ALL_SECTIONS.filter(section => section.showInMinimal !== false);
    }
    // Cosmic mode shows all sections
    return ALL_SECTIONS;
  }, [gamificationMode]);

  // Derived values for components
  const username = profile?.username || profile?.displayName || '';
  const setUsername = useCallback((name) => {
    updateProfile({ username: name, displayName: name });
  }, [updateProfile]);
  const selectedGoals = lifeGoals || [];
  const setSelectedGoals = setLifeGoals;

  // Calculate scroll progress and current section
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      const scrollHeight = container.scrollHeight - container.clientHeight;
      const progress = scrollTop / scrollHeight;

      setScrollProgress(progress);

      // Determine current section
      const sectionHeight = container.clientHeight;
      const newSection = Math.min(
        Math.floor(scrollTop / sectionHeight),
        SECTIONS.length - 1
      );

      if (newSection !== currentSection) {
        setCurrentSection(newSection);
        feedback.buttonPress();
      }

      // Calculate progress for each section
      const newSectionProgress = {};
      SECTIONS.forEach((section, index) => {
        const sectionStart = index * sectionHeight;
        const sectionEnd = (index + 1) * sectionHeight;
        const sectionScrollProgress = Math.max(
          0,
          Math.min(1, (scrollTop - sectionStart) / sectionHeight)
        );
        newSectionProgress[section.id] = sectionScrollProgress;
      });
      setSectionProgress(newSectionProgress);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => container.removeEventListener('scroll', handleScroll);
  }, [currentSection, SECTIONS]);

  // Lock scroll when section requires input
  const handleScrollLock = useCallback((locked) => {
    setIsScrollLocked(locked);
    if (containerRef.current) {
      containerRef.current.style.overflowY = locked ? 'hidden' : 'auto';
    }
  }, []);

  // Smooth scroll to section
  const scrollToSection = useCallback((index) => {
    if (!containerRef.current) return;
    const sectionHeight = containerRef.current.clientHeight;
    containerRef.current.scrollTo({
      top: index * sectionHeight,
      behavior: 'smooth',
    });
  }, []);

  // Handle section completion
  const handleSectionComplete = useCallback((sectionId) => {
    const sectionIndex = SECTIONS.findIndex(s => s.id === sectionId);
    if (sectionIndex < SECTIONS.length - 1) {
      setCanContinue(true);
      // Auto-scroll to next section after a brief delay
      setTimeout(() => {
        scrollToSection(sectionIndex + 1);
      }, 500);
    }
  }, [scrollToSection]);

  // Handle final launch
  const handleLaunch = useCallback(() => {
    feedback.achievement();
    // Use the selected gamification mode (defaults to cosmic if not set)
    const finalMode = gamificationMode || 'cosmic';
    setGamificationMode(finalMode);
    setMode(finalMode);
    completeOnboarding();
  }, [completeOnboarding, setGamificationMode, setMode, gamificationMode]);

  // Current phase for background
  const currentPhase = useMemo(() => {
    return SECTIONS[currentSection]?.phase || 0;
  }, [currentSection, SECTIONS]);

  return (
    <div className="cinematic-onboarding">
      {/* Minimal 2D Background */}
      <MinimalBackground
        scrollProgress={scrollProgress}
        phase={currentPhase}
        particleCount={80}
        showGlow={true}
      />

      {/* Progress Indicator */}
      <div className="cinematic-progress">
        {SECTIONS.map((section, index) => (
          <button
            key={section.id}
            className={`cinematic-progress-dot ${
              index === currentSection ? 'active' : ''
            } ${index < currentSection ? 'completed' : ''}`}
            onClick={() => scrollToSection(index)}
            aria-label={`Go to ${section.id}`}
          />
        ))}
      </div>

      {/* Main scrollable container */}
      <div
        ref={containerRef}
        className="cinematic-scroll-container"
        style={{ scrollSnapType: isScrollLocked ? 'none' : 'y mandatory' }}
      >
        {SECTIONS.map((section, index) => {
          const Section = section.component;
          const isActive = index === currentSection;
          const progress = sectionProgress[section.id] || 0;

          return (
            <div
              key={section.id}
              className={`cinematic-section ${isActive ? 'active' : ''}`}
              data-section={section.id}
            >
              <Section
                isActive={isActive}
                progress={progress}
                scrollProgress={scrollProgress}
                onComplete={() => handleSectionComplete(section.id)}
                onLockScroll={handleScrollLock}
                onLaunch={handleLaunch}
                username={username}
                setUsername={setUsername}
                selectedGoals={selectedGoals}
                setSelectedGoals={setSelectedGoals}
                gamificationMode={gamificationMode}
                setGamificationMode={setGamificationMode}
              />
            </div>
          );
        })}
      </div>

      {/* Skip button */}
      <button
        className="cinematic-skip"
        onClick={() => {
          if (window.confirm('Skip the onboarding experience?')) {
            completeOnboarding();
          }
        }}
      >
        Skip
      </button>
    </div>
  );
}
