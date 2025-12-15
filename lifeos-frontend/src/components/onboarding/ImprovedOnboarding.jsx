import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useNewOnboardingStore, LIFE_GOALS } from '../../stores/newOnboardingStore';
import { sounds } from '../../services/microInteractions/sounds';
import useGamificationStore from '../../stores/gamificationStore';
import { useAvatarStore } from '../../stores/avatarStore';
import useSocialStore from '../../stores/socialStore';

// Shared components
import ProgressiveBackground from './shared/ProgressiveBackground';
import SkipButton from './shared/SkipButton';

// Step components
import WelcomeModeStep from './steps/WelcomeModeStep';
import IdentityCreationStep from './steps/IdentityCreationStep';
import YourPathStep from './steps/YourPathStep';
import GamificationTourStep from './steps/GamificationTourStep';
import FirstQuestStep from './steps/FirstQuestStep';
import LaunchCelebrationStep from './steps/LaunchCelebrationStep';

/**
 * ImprovedOnboarding - Main orchestrator for the 6-step onboarding flow
 *
 * Flow:
 * 1. Welcome + Mode Selection
 * 2. Identity Creation (username + avatar)
 * 3. Your Path (constellation goals)
 * 4. Gamification Tour
 * 5. First Quest
 * 6. Launch Celebration
 */

// Step definitions
const STEPS = {
  WELCOME_MODE: 'welcome_mode',
  IDENTITY: 'identity',
  YOUR_PATH: 'your_path',
  GAMIFICATION_TOUR: 'gamification_tour',
  FIRST_QUEST: 'first_quest',
  LAUNCH: 'launch',
};

const STEP_ORDER = [
  STEPS.WELCOME_MODE,
  STEPS.IDENTITY,
  STEPS.YOUR_PATH,
  STEPS.GAMIFICATION_TOUR,
  STEPS.FIRST_QUEST,
  STEPS.LAUNCH,
];

// Map steps to background phases
const STEP_BACKGROUND_PHASE = {
  [STEPS.WELCOME_MODE]: 'void',
  [STEPS.IDENTITY]: 'stars',
  [STEPS.YOUR_PATH]: 'nebula',
  [STEPS.GAMIFICATION_TOUR]: 'cosmos',
  [STEPS.FIRST_QUEST]: 'cosmos',
  [STEPS.LAUNCH]: 'cosmos',
};

export default function ImprovedOnboarding({ onComplete }) {
  // Store hooks
  const {
    gamificationMode,
    setGamificationMode,
    profile,
    updateProfile,
    lifeGoals,
    setLifeGoals,
    dailyCommitment,
    setDailyCommitment,
    xpEarned,
    addOnboardingXP,
    completeOnboarding,
    isOnboardingActive,
  } = useNewOnboardingStore();

  const { addXP } = useGamificationStore();
  const { setCharacterGender } = useAvatarStore();
  const { checkUsernameAvailability } = useSocialStore();

  // Local state
  const [currentStep, setCurrentStep] = useState(STEPS.WELCOME_MODE);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [firstQuest, setFirstQuest] = useState(null);

  // Get current step index
  const currentStepIndex = STEP_ORDER.indexOf(currentStep);

  // Navigation handlers
  const handleNext = useCallback(() => {
    if (isTransitioning) return;

    const nextIndex = currentStepIndex + 1;
    if (nextIndex < STEP_ORDER.length) {
      let nextStep = STEP_ORDER[nextIndex];

      // Skip gamification tour for minimal mode
      if (nextStep === STEPS.GAMIFICATION_TOUR && gamificationMode === 'minimal') {
        nextStep = STEP_ORDER[nextIndex + 1];
      }

      setIsTransitioning(true);
      if (sounds.isEnabled()) {
        sounds.notification();
      }

      setTimeout(() => {
        setCurrentStep(nextStep);
        setIsTransitioning(false);
      }, 300);
    }
  }, [currentStepIndex, gamificationMode, isTransitioning]);

  const handlePrev = useCallback(() => {
    if (isTransitioning) return;

    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      let prevStep = STEP_ORDER[prevIndex];

      // Skip gamification tour for minimal mode when going back
      if (prevStep === STEPS.GAMIFICATION_TOUR && gamificationMode === 'minimal') {
        prevStep = STEP_ORDER[prevIndex - 1];
      }

      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentStep(prevStep);
        setIsTransitioning(false);
      }, 300);
    }
  }, [currentStepIndex, gamificationMode, isTransitioning]);

  // Skip entire onboarding
  const handleSkipAll = useCallback(() => {
    // Set minimal defaults
    if (!gamificationMode) setGamificationMode('cosmic');
    if (!profile.username) updateProfile({ username: 'Traveler', gender: 'male' });
    if (lifeGoals.length === 0) setLifeGoals(['productivity']);

    // Complete onboarding
    handleComplete();
  }, [gamificationMode, profile, lifeGoals]);

  // Complete onboarding
  const handleComplete = useCallback(() => {
    // Apply avatar gender
    if (profile.gender) {
      setCharacterGender(profile.gender);
    }

    // Award total XP to gamification store
    addXP(xpEarned);

    // Mark as complete in store
    completeOnboarding();

    // Notify parent
    onComplete?.();
  }, [profile, xpEarned, setCharacterGender, addXP, completeOnboarding, onComplete]);

  // Handle XP addition with sound
  const handleAddXP = useCallback((amount) => {
    addOnboardingXP(amount);
    // Sound is handled by OnboardingXPCounter
  }, [addOnboardingXP]);

  // Handle quest acceptance
  const handleQuestAccept = useCallback((quest) => {
    setFirstQuest(quest);
    // Could save to a store for the dashboard to pick up
  }, []);

  // Get background phase
  const backgroundPhase = STEP_BACKGROUND_PHASE[currentStep];

  // Don't render if not active
  if (!isOnboardingActive) return null;

  return (
    <ProgressiveBackground phase={backgroundPhase}>
      <div className="min-h-screen flex flex-col">
        {/* Progress indicator - Enhanced with sparkles */}
        <div className="fixed top-0 left-0 right-0 z-50 px-4 pt-4">
          <div className="max-w-md mx-auto">
            <div className="flex items-center gap-1 relative">
              {STEP_ORDER.map((step, index) => {
                // Skip gamification tour indicator for minimal mode
                if (step === STEPS.GAMIFICATION_TOUR && gamificationMode === 'minimal') {
                  return null;
                }

                const isActive = index === currentStepIndex;
                const isComplete = index < currentStepIndex;

                return (
                  <motion.div
                    key={step}
                    className="relative flex-1 h-1.5"
                  >
                    {/* Background track */}
                    <div className="absolute inset-0 rounded-full bg-white/10" />

                    {/* Filled portion with glow */}
                    <motion.div
                      className={`
                        absolute inset-0 rounded-full
                        ${isComplete
                          ? 'bg-gradient-to-r from-purple-500 to-purple-400'
                          : isActive
                            ? 'bg-gradient-to-r from-purple-500/80 to-purple-400/60'
                            : ''
                        }
                      `}
                      initial={false}
                      animate={{
                        scaleX: isComplete ? 1 : isActive ? 0.5 : 0,
                        opacity: isComplete || isActive ? 1 : 0,
                      }}
                      style={{ originX: 0 }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                    />

                    {/* Glow effect for completed segments */}
                    {isComplete && (
                      <motion.div
                        className="absolute inset-0 rounded-full bg-purple-500/50 blur-sm"
                        animate={{ opacity: [0.3, 0.6, 0.3] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    )}

                    {/* Sparkle at the leading edge of active segment */}
                    {isActive && (
                      <>
                        <motion.div
                          className="absolute top-1/2 -translate-y-1/2 w-2 h-2"
                          style={{ left: '50%' }}
                          animate={{
                            scale: [1, 1.5, 1],
                            opacity: [0.8, 1, 0.8],
                          }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <Sparkles className="w-2 h-2 text-purple-300" />
                        </motion.div>

                        {/* Traveling spark */}
                        <motion.div
                          className="absolute top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-white"
                          animate={{
                            left: ['0%', '50%'],
                            opacity: [0, 1, 0],
                            scale: [0.5, 1, 0.5],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          }}
                          style={{ boxShadow: '0 0 6px 2px rgba(168, 85, 247, 0.8)' }}
                        />
                      </>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Step counter with subtle animation */}
            <motion.div
              className="text-center text-white/50 text-xs mt-2 font-medium"
              animate={{ opacity: [0.5, 0.7, 0.5] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              Step {currentStepIndex + 1} of {gamificationMode === 'minimal' ? STEP_ORDER.length - 1 : STEP_ORDER.length}
            </motion.div>
          </div>
        </div>

        {/* Skip button */}
        {currentStep !== STEPS.LAUNCH && (
          <SkipButton
            variant="all"
            onSkipAll={handleSkipAll}
            canSkip={true}
          />
        )}

        {/* Step content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex items-center justify-center pt-16 pb-8"
          >
            {currentStep === STEPS.WELCOME_MODE && (
              <WelcomeModeStep
                onNext={handleNext}
                onModeSelect={setGamificationMode}
                selectedMode={gamificationMode}
                xpEarned={xpEarned}
                soundEnabled={true}
              />
            )}

            {currentStep === STEPS.IDENTITY && (
              <IdentityCreationStep
                onNext={handleNext}
                onPrev={handlePrev}
                onProfileUpdate={updateProfile}
                profile={profile}
                xpEarned={xpEarned}
                onAddXP={handleAddXP}
                soundEnabled={true}
                checkUsernameAvailability={checkUsernameAvailability}
              />
            )}

            {currentStep === STEPS.YOUR_PATH && (
              <YourPathStep
                onNext={handleNext}
                onPrev={handlePrev}
                onGoalsChange={setLifeGoals}
                onCommitmentChange={setDailyCommitment}
                selectedGoals={lifeGoals}
                dailyCommitment={dailyCommitment}
                xpEarned={xpEarned}
                onAddXP={handleAddXP}
                soundEnabled={true}
              />
            )}

            {currentStep === STEPS.GAMIFICATION_TOUR && (
              <GamificationTourStep
                onNext={handleNext}
                onPrev={handlePrev}
                onSkip={handleNext}
                canSkip={true}
                isTransitioning={isTransitioning}
              />
            )}

            {currentStep === STEPS.FIRST_QUEST && (
              <FirstQuestStep
                onNext={handleNext}
                onPrev={handlePrev}
                onQuestAccept={handleQuestAccept}
                selectedGoals={lifeGoals}
                xpEarned={xpEarned}
                onAddXP={handleAddXP}
                soundEnabled={true}
              />
            )}

            {currentStep === STEPS.LAUNCH && (
              <LaunchCelebrationStep
                onComplete={handleComplete}
                profile={profile}
                selectedGoals={lifeGoals}
                gamificationMode={gamificationMode}
                xpEarned={xpEarned}
                soundEnabled={true}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </ProgressiveBackground>
  );
}
