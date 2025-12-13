/**
 * Nova Onboarding - Main Container
 *
 * Orchestrates the entire onboarding flow with Nova as the guide.
 * Handles transitions between steps and manages Nova's state.
 */

import React, { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useOnboardingStore, { ONBOARDING_STATES } from '../../stores/onboardingStore';

// Step components
import WelcomeStep from './steps/WelcomeStep';
import GoalsStep from './steps/GoalsStep';
import QuickWinStep from './steps/QuickWinStep';
import ModuleSetupStep from './steps/ModuleSetupStep';
import DashboardReveal from './steps/DashboardReveal';

// Shared components
import { OnboardingProgress, NovaGuide } from './shared';

import './NovaOnboarding.css';

export default function NovaOnboarding() {
  const navigate = useNavigate();

  const {
    state,
    novaEmotion,
    novaMessage,
    getProgress,
    startOnboarding,
    setGoals,
    completeQuickWin,
    getCurrentModule,
    completeModuleSetup,
    skipModuleSetup,
    completeOnboarding,
    selectedGoals
  } = useOnboardingStore();

  const progress = getProgress();

  // Start onboarding if not started
  useEffect(() => {
    if (state === ONBOARDING_STATES.NOT_STARTED) {
      startOnboarding();
    }
  }, [state, startOnboarding]);

  // Handle goals selection
  const handleGoalsComplete = useCallback((goals) => {
    setGoals(goals);
  }, [setGoals]);

  // Handle quick win completion
  const handleQuickWinComplete = useCallback((data) => {
    completeQuickWin(data);
  }, [completeQuickWin]);

  // Handle module setup completion
  const handleModuleComplete = useCallback((module, data) => {
    const allDone = completeModuleSetup(module, data);
    if (allDone) {
      // Small delay for celebration
      setTimeout(() => {}, 1000);
    }
  }, [completeModuleSetup]);

  // Handle module skip
  const handleModuleSkip = useCallback((module) => {
    skipModuleSetup(module);
  }, [skipModuleSetup]);

  // Handle onboarding completion
  const handleComplete = useCallback(() => {
    completeOnboarding();
    // Navigate to dashboard after brief celebration
    setTimeout(() => {
      navigate('/dashboard');
    }, 2000);
  }, [completeOnboarding, navigate]);

  // Render current step
  const renderStep = () => {
    switch (state) {
      case ONBOARDING_STATES.WELCOME:
        return (
          <WelcomeStep
            onContinue={() => useOnboardingStore.setState({
              state: ONBOARDING_STATES.GOALS,
              novaEmotion: 'curious',
              novaMessage: "What matters most to you right now? Pick your top priorities."
            })}
          />
        );

      case ONBOARDING_STATES.GOALS:
        return (
          <GoalsStep
            onComplete={handleGoalsComplete}
          />
        );

      case ONBOARDING_STATES.QUICK_WIN:
        return (
          <QuickWinStep
            primaryGoal={selectedGoals[0]}
            onComplete={handleQuickWinComplete}
          />
        );

      case ONBOARDING_STATES.MODULE_SETUP:
        const currentModule = getCurrentModule();
        if (!currentModule) {
          // All modules done, move to reveal
          useOnboardingStore.setState({ state: ONBOARDING_STATES.DASHBOARD_REVEAL });
          return null;
        }
        return (
          <ModuleSetupStep
            module={currentModule}
            onComplete={handleModuleComplete}
            onSkip={handleModuleSkip}
          />
        );

      case ONBOARDING_STATES.DASHBOARD_REVEAL:
        return (
          <DashboardReveal
            onComplete={handleComplete}
          />
        );

      default:
        return null;
    }
  };

  // Don't render if already completed
  if (state === ONBOARDING_STATES.COMPLETED) {
    return null;
  }

  return (
    <div className="nova-onboarding">
      {/* Cosmic background */}
      <div className="onboarding-background">
        <div className="stars" />
        <div className="nebula" />
      </div>

      {/* Progress bar */}
      <OnboardingProgress
        percentage={progress.percentage}
        currentStep={state}
      />

      {/* Nova Guide Character */}
      <NovaGuide
        emotion={novaEmotion}
        message={novaMessage}
        isOnboarding={true}
      />

      {/* Step Content */}
      <div className="onboarding-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={state}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="step-container"
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
