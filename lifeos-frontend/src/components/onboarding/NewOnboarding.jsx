import React, { useEffect, useState, useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNewOnboardingStore, ONBOARDING_STEPS, STEP_ORDER } from '../../stores/newOnboardingStore';
import { useGamificationModeStore } from '../../stores/gamificationModeStore';
import { useGamificationStore } from '../../stores/gamificationStore';
import { useAvatarStore } from '../../stores/avatarStore';

// Step Components
import GamificationModeStep from './steps/GamificationModeStep';
import ProfileSetupStep from './steps/ProfileSetupStep';
import LifeFocusStep from './steps/LifeFocusStep';
import ModuleSetupStep from './steps/ModuleSetupStep';
import GamificationTourStep from './steps/GamificationTourStep';
import SocialStep from './steps/SocialStep';
import LaunchStep from './steps/LaunchStep';

// Nova Guide Component
import NovaOnboardingGuide from './NovaOnboardingGuide';

/**
 * Optimized static starfield background using CSS animations
 * Pre-generated positions for performance - no re-renders
 */
const StarfieldBackground = memo(function StarfieldBackground() {
  // Pre-generate star positions once
  const stars = useMemo(() =>
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: Math.random() * 2 + 1,
      delay: Math.random() * 3,
      duration: Math.random() * 2 + 2,
    })), []
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Static stars with CSS animations */}
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full bg-white animate-twinkle"
          style={{
            width: star.size,
            height: star.size,
            left: star.left,
            top: star.top,
            animationDelay: `${star.delay}s`,
            animationDuration: `${star.duration}s`,
          }}
        />
      ))}

      {/* Static nebula glow effects - no animation needed */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-pink-500/10 rounded-full blur-[80px]" />
      <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-blue-500/5 rounded-full blur-[60px]" />
    </div>
  );
});

/**
 * Step transition variants for smooth animations
 */
const stepVariants = {
  initial: {
    opacity: 0,
    scale: 0.95,
    filter: 'blur(8px)'
  },
  animate: {
    opacity: 1,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1], // Custom ease for smooth feel
    }
  },
  exit: {
    opacity: 0,
    scale: 1.02,
    filter: 'blur(4px)',
    transition: {
      duration: 0.25,
      ease: 'easeIn'
    }
  }
};

/**
 * NewOnboarding - Main orchestrator for the new onboarding flow
 * Full-screen experience with Nova as persistent guide
 */
export default function NewOnboarding({ onComplete }) {
  const {
    currentStep,
    isOnboardingComplete,
    gamificationMode,
    getProgress,
    nextStep,
    prevStep,
    skipStep,
    canSkipStep,
    completeOnboarding,
    xpEarned,
  } = useNewOnboardingStore();

  const { setMode } = useGamificationModeStore();
  const { addXP } = useGamificationStore();
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Handle completion
  useEffect(() => {
    if (currentStep === ONBOARDING_STEPS.COMPLETED) {
      // Apply gamification mode to the app
      if (gamificationMode) {
        setMode(gamificationMode);
      }

      // Award XP
      if (xpEarned > 0) {
        addXP(xpEarned, 'onboarding_complete');
      }

      // Notify parent
      if (onComplete) {
        setTimeout(() => onComplete(), 500);
      }
    }
  }, [currentStep, gamificationMode, xpEarned, setMode, addXP, onComplete]);

  // Handle step transitions
  const handleNextStep = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      nextStep();
      setIsTransitioning(false);
    }, 300);
  };

  const handlePrevStep = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      prevStep();
      setIsTransitioning(false);
    }, 300);
  };

  const handleSkip = () => {
    if (canSkipStep(currentStep)) {
      setIsTransitioning(true);
      setTimeout(() => {
        skipStep();
        setIsTransitioning(false);
      }, 300);
    }
  };

  const handleComplete = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      completeOnboarding();
    }, 300);
  };

  // Get current step index for progress
  const currentIndex = STEP_ORDER.indexOf(currentStep);
  const totalSteps = STEP_ORDER.length - 1; // Exclude COMPLETED
  const progress = getProgress();

  // Render current step
  const renderStep = () => {
    const stepProps = {
      onNext: handleNextStep,
      onPrev: handlePrevStep,
      onSkip: handleSkip,
      onComplete: handleComplete,
      canSkip: canSkipStep(currentStep),
      isTransitioning,
    };

    switch (currentStep) {
      case ONBOARDING_STEPS.GAMIFICATION_MODE:
        return <GamificationModeStep {...stepProps} />;
      case ONBOARDING_STEPS.PROFILE_SETUP:
        return <ProfileSetupStep {...stepProps} />;
      case ONBOARDING_STEPS.LIFE_FOCUS:
        return <LifeFocusStep {...stepProps} />;
      case ONBOARDING_STEPS.MODULE_SETUP:
        return <ModuleSetupStep {...stepProps} />;
      case ONBOARDING_STEPS.GAMIFICATION_TOUR:
        return <GamificationTourStep {...stepProps} />;
      case ONBOARDING_STEPS.SOCIAL:
        return <SocialStep {...stepProps} />;
      case ONBOARDING_STEPS.LAUNCH:
        return <LaunchStep {...stepProps} />;
      default:
        return null;
    }
  };

  // Background style based on gamification mode
  const getBackgroundStyle = () => {
    switch (gamificationMode) {
      case 'cosmic':
        return 'bg-gradient-to-br from-[#0c0a10] via-[#1a1033] to-[#0c0a10]';
      case 'professional':
        return 'bg-gradient-to-br from-[#0a1628] via-[#0f1f3d] to-[#0a1628]';
      case 'minimal':
        return 'bg-gradient-to-br from-[#111111] via-[#1a1a1a] to-[#111111]';
      default:
        return 'bg-gradient-to-br from-[#0c0a10] via-[#1a1033] to-[#0c0a10]';
    }
  };

  if (currentStep === ONBOARDING_STEPS.COMPLETED) {
    return null;
  }

  // Handle click anywhere to advance dialogue
  const handleGlobalClick = (e) => {
    // Don't intercept clicks on interactive elements
    if (e.target.closest('button, input, select, textarea, a, [role="button"]')) {
      return;
    }

    const { advanceDialogue, isDialogueComplete: checkComplete } = useNewOnboardingStore.getState();
    if (!checkComplete()) {
      advanceDialogue();
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 ${getBackgroundStyle()} overflow-hidden`}
      onClick={handleGlobalClick}
    >
      {/* Optimized starfield background - memoized and uses CSS animations */}
      <StarfieldBackground />

      {/* Progress bar with smooth animation */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-white/5">
        <motion.div
          className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>

      {/* Step indicator with fade animation */}
      <motion.div
        className="absolute top-4 right-4 text-white/40 text-sm backdrop-blur-sm px-3 py-1 rounded-full bg-white/5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        Step {currentIndex + 1} of {totalSteps}
      </motion.div>

      {/* Main content area with improved layout */}
      <div className="relative h-full flex flex-col items-center justify-center p-4 sm:p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            variants={stepVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full max-w-4xl"
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Nova Guide - persistent across steps */}
      <NovaOnboardingGuide />
    </div>
  );
}
