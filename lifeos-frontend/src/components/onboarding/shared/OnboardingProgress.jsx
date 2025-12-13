/**
 * Onboarding Progress Component
 *
 * Shows progress through the onboarding flow with animated steps.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Check, Circle } from 'lucide-react';
import useOnboardingStore, { ONBOARDING_STATES } from '../../../stores/onboardingStore';

const PROGRESS_STEPS = [
  { id: 'welcome', label: 'Welcome', state: ONBOARDING_STATES.WELCOME },
  { id: 'goals', label: 'Goals', state: ONBOARDING_STATES.GOALS },
  { id: 'quick-win', label: 'First Action', state: ONBOARDING_STATES.QUICK_WIN },
  { id: 'setup', label: 'Setup', state: ONBOARDING_STATES.MODULE_SETUP },
  { id: 'ready', label: 'Ready!', state: ONBOARDING_STATES.DASHBOARD_REVEAL }
];

export default function OnboardingProgress({ minimal = false }) {
  const { state: currentState } = useOnboardingStore();

  const getCurrentStepIndex = () => {
    const index = PROGRESS_STEPS.findIndex(step => step.state === currentState);
    return index >= 0 ? index : 0;
  };

  const currentStepIndex = getCurrentStepIndex();

  if (minimal) {
    return (
      <div className="onboarding-progress-minimal">
        <div className="progress-dots">
          {PROGRESS_STEPS.map((step, index) => (
            <motion.div
              key={step.id}
              className={`progress-dot ${
                index < currentStepIndex ? 'completed' :
                index === currentStepIndex ? 'active' : 'upcoming'
              }`}
              initial={{ scale: 0.8 }}
              animate={{
                scale: index === currentStepIndex ? 1.2 : 1,
                backgroundColor: index < currentStepIndex ? 'var(--color-primary)' :
                                 index === currentStepIndex ? 'var(--color-primary)' :
                                 'var(--color-surface-elevated)'
              }}
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>
        <span className="progress-text">
          Step {currentStepIndex + 1} of {PROGRESS_STEPS.length}
        </span>
      </div>
    );
  }

  return (
    <div className="onboarding-progress">
      <div className="progress-track">
        {PROGRESS_STEPS.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;
          const isUpcoming = index > currentStepIndex;

          return (
            <React.Fragment key={step.id}>
              {/* Step indicator */}
              <motion.div
                className={`progress-step ${
                  isCompleted ? 'completed' :
                  isCurrent ? 'active' : 'upcoming'
                }`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <motion.div
                  className="step-circle"
                  animate={{
                    scale: isCurrent ? 1.1 : 1,
                    borderColor: isCompleted || isCurrent ?
                      'var(--color-primary)' : 'var(--color-border)'
                  }}
                >
                  {isCompleted ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring' }}
                    >
                      <Check size={14} />
                    </motion.div>
                  ) : isCurrent ? (
                    <motion.div
                      className="step-pulse"
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [1, 0.5, 1]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity
                      }}
                    />
                  ) : (
                    <Circle size={8} />
                  )}
                </motion.div>
                <span className="step-label">{step.label}</span>
              </motion.div>

              {/* Connector line */}
              {index < PROGRESS_STEPS.length - 1 && (
                <div className="progress-connector">
                  <motion.div
                    className="connector-fill"
                    initial={{ scaleX: 0 }}
                    animate={{
                      scaleX: isCompleted ? 1 : 0
                    }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Module Progress - Shows progress within module setup
 */
export function ModuleProgress({ currentQuestion, totalQuestions, moduleName }) {
  const progress = (currentQuestion / totalQuestions) * 100;

  return (
    <div className="module-progress">
      <div className="module-progress-header">
        <span className="module-name">{moduleName}</span>
        <span className="module-count">
          {currentQuestion} / {totalQuestions}
        </span>
      </div>
      <div className="module-progress-bar">
        <motion.div
          className="module-progress-fill"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </div>
  );
}
