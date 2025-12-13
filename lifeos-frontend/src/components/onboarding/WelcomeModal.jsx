/**
 * Welcome Modal - Brief intro before guided onboarding
 *
 * A quick 2-step modal:
 * 1. Nova intro
 * 2. Goal selection
 *
 * Then redirects to dashboard where the real onboarding happens.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Check, Sparkles } from 'lucide-react';
import useIntegratedOnboardingStore, { GOAL_MODULES } from '../../stores/integratedOnboardingStore';
import './WelcomeModal.css';

const GOALS = [
  { id: 'productivity', label: 'Get More Done', icon: '🎯', description: 'Tasks, projects, and focus' },
  { id: 'health', label: 'Get Healthier', icon: '💪', description: 'Nutrition, fitness, wellness' },
  { id: 'learning', label: 'Learn & Grow', icon: '📚', description: 'Skills and knowledge' },
  { id: 'financial', label: 'Manage Money', icon: '💰', description: 'Budget and savings' },
  { id: 'journal', label: 'Reflect & Journal', icon: '📝', description: 'Mood and thoughts' },
  { id: 'habits', label: 'Build Habits', icon: '🔥', description: 'Streaks and routines' },
  { id: 'balance', label: 'Find Balance', icon: '⚖️', description: 'Purpose and values' }
];

export default function WelcomeModal({ onComplete }) {
  const [step, setStep] = useState(0);
  const [selectedGoals, setSelectedGoals] = useState([]);
  const { setHasSeenWelcome, setSelectedGoals: saveGoals } = useIntegratedOnboardingStore();

  const toggleGoal = (goalId) => {
    setSelectedGoals(prev => {
      if (prev.includes(goalId)) {
        return prev.filter(g => g !== goalId);
      } else if (prev.length < 3) {
        return [...prev, goalId];
      }
      return prev;
    });
  };

  const handleContinue = () => {
    if (step === 0) {
      setStep(1);
    } else {
      // Save goals and complete welcome
      saveGoals(selectedGoals);
      setHasSeenWelcome(true);
      onComplete?.();
    }
  };

  const handleSkip = () => {
    saveGoals(['productivity', 'health', 'habits']); // Default goals
    setHasSeenWelcome(true);
    onComplete?.();
  };

  return (
    <motion.div
      className="welcome-modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="welcome-modal"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 25 }}
      >
        <AnimatePresence mode="wait">
          {step === 0 ? (
            <motion.div
              key="intro"
              className="welcome-step intro-step"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              {/* Nova Avatar */}
              <div className="nova-intro">
                <div className="nova-avatar-glow">
                  <img
                    src="/assets/nova/nova_spark.png"
                    alt="Nova"
                    className="nova-avatar-large"
                  />
                </div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <h1>Hi, I'm Nova!</h1>
                  <p className="nova-tagline">Your personal AI companion</p>
                </motion.div>
              </div>

              <motion.div
                className="intro-content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <p>
                  I'll help you set up your personal operating system.
                  We'll walk through the actual app together so you know
                  where everything is.
                </p>
                <div className="time-estimate">
                  <Sparkles size={16} />
                  <span>Takes about 5 minutes</span>
                </div>
              </motion.div>

              <div className="welcome-actions">
                <button className="welcome-btn primary" onClick={handleContinue}>
                  Let's Go
                  <ArrowRight size={18} />
                </button>
                <button className="welcome-btn text" onClick={handleSkip}>
                  Skip setup, I'll explore myself
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="goals"
              className="welcome-step goals-step"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="goals-header">
                <h2>What brings you here?</h2>
                <p>Pick up to 3 priorities • We'll focus on these first</p>
              </div>

              <div className="goals-grid">
                {GOALS.map((goal) => {
                  const isSelected = selectedGoals.includes(goal.id);
                  return (
                    <motion.button
                      key={goal.id}
                      className={`goal-option ${isSelected ? 'selected' : ''}`}
                      onClick={() => toggleGoal(goal.id)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="goal-icon">{goal.icon}</span>
                      <div className="goal-text">
                        <span className="goal-label">{goal.label}</span>
                        <span className="goal-desc">{goal.description}</span>
                      </div>
                      {isSelected && (
                        <motion.div
                          className="goal-check"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                        >
                          <Check size={16} />
                        </motion.div>
                      )}
                    </motion.button>
                  );
                })}
              </div>

              <div className="selection-indicator">
                <div className="selection-dots">
                  {[0, 1, 2].map(i => (
                    <div
                      key={i}
                      className={`dot ${i < selectedGoals.length ? 'filled' : ''}`}
                    />
                  ))}
                </div>
                <span>{selectedGoals.length}/3 selected</span>
              </div>

              <div className="welcome-actions">
                <button
                  className="welcome-btn primary"
                  onClick={handleContinue}
                  disabled={selectedGoals.length === 0}
                >
                  Start Setup
                  <ArrowRight size={18} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
