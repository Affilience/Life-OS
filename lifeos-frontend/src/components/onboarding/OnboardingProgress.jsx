/**
 * Onboarding Progress Widget
 *
 * Shows setup progress in the sidebar or dashboard.
 * Helps users track which modules still need configuration.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Check, ChevronRight, Sparkles } from 'lucide-react';
import useIntegratedOnboardingStore, { MODULE_SETUP } from '../../stores/integratedOnboardingStore';
import './OnboardingProgress.css';

export default function OnboardingProgress({ variant = 'sidebar' }) {
  const navigate = useNavigate();

  const {
    getProgress,
    getRelevantModules,
    isModuleComplete,
    hasSeenWelcome,
    isOnboardingComplete,
    getNextModule
  } = useIntegratedOnboardingStore();

  // Don't show if not started or complete
  if (!hasSeenWelcome || isOnboardingComplete) {
    return null;
  }

  const progress = getProgress();
  const modules = getRelevantModules();
  const nextModule = getNextModule();

  if (variant === 'compact') {
    return (
      <motion.div
        className="onboarding-progress-compact"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="progress-compact-header">
          <Sparkles size={16} />
          <span>Setup Progress</span>
          <span className="progress-fraction">{progress.completed}/{progress.total}</span>
        </div>
        <div className="progress-compact-bar">
          <div
            className="progress-compact-fill"
            style={{ width: `${progress.percentage}%` }}
          />
        </div>
        {nextModule && (
          <button
            className="progress-compact-next"
            onClick={() => navigate(nextModule.route)}
          >
            Next: {nextModule.name}
            <ChevronRight size={14} />
          </button>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      className="onboarding-progress"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="progress-header">
        <div className="progress-icon">
          <Sparkles size={18} />
        </div>
        <div className="progress-title">
          <h4>Getting Started</h4>
          <p>{progress.completed} of {progress.total} areas set up</p>
        </div>
      </div>

      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${progress.percentage}%` }}
        />
      </div>

      <div className="progress-modules">
        {modules.map((module) => {
          const isComplete = isModuleComplete(module.id);
          const isNext = nextModule?.id === module.id;

          return (
            <button
              key={module.id}
              className={`progress-module ${isComplete ? 'complete' : ''} ${isNext ? 'next' : ''}`}
              onClick={() => navigate(module.route)}
            >
              <div className="module-status">
                {isComplete ? (
                  <Check size={14} />
                ) : (
                  <span className="module-icon">{module.icon}</span>
                )}
              </div>
              <span className="module-name">{module.name}</span>
              {isNext && (
                <span className="module-badge">Next</span>
              )}
              <ChevronRight size={14} className="module-arrow" />
            </button>
          );
        })}
      </div>

      {progress.completed === progress.total - 1 && (
        <p className="progress-hint">
          Almost there! One more to go.
        </p>
      )}
    </motion.div>
  );
}

/**
 * Dashboard version - More prominent card
 */
export function OnboardingProgressCard() {
  const navigate = useNavigate();

  const {
    getProgress,
    getNextModule,
    hasSeenWelcome,
    isOnboardingComplete
  } = useIntegratedOnboardingStore();

  if (!hasSeenWelcome || isOnboardingComplete) {
    return null;
  }

  const progress = getProgress();
  const nextModule = getNextModule();

  return (
    <motion.div
      className="onboarding-progress-card"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <div className="card-content">
        <div className="card-header">
          <div className="card-icon">
            <img src="/assets/nova/nova_spark.png" alt="Nova" />
          </div>
          <div className="card-title">
            <h3>Let's finish setting up!</h3>
            <p>{progress.completed} of {progress.total} areas configured</p>
          </div>
        </div>

        <div className="card-progress">
          <div
            className="card-progress-fill"
            style={{ width: `${progress.percentage}%` }}
          />
        </div>

        {nextModule && (
          <button
            className="card-action"
            onClick={() => navigate(nextModule.route)}
          >
            <span>Set up {nextModule.name}</span>
            <span className="action-time">{nextModule.estimatedTime}</span>
          </button>
        )}
      </div>
    </motion.div>
  );
}
