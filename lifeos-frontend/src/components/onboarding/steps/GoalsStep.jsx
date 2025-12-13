/**
 * Goals Step - Select Priorities
 *
 * Users select their top goals which determines which modules to set up.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ArrowRight } from 'lucide-react';
import { GOALS } from '../../../stores/onboardingStore';
import useOnboardingStore from '../../../stores/onboardingStore';

const MAX_GOALS = 3;

export default function GoalsStep({ onComplete }) {
  const [selectedGoals, setSelectedGoals] = useState([]);
  const setNovaState = useOnboardingStore(state => state.setNovaState);

  const goalsList = Object.values(GOALS);

  const toggleGoal = (goalId) => {
    setSelectedGoals(prev => {
      let newSelection;

      if (prev.includes(goalId)) {
        newSelection = prev.filter(g => g !== goalId);
      } else if (prev.length < MAX_GOALS) {
        newSelection = [...prev, goalId];
      } else {
        // Replace last selected if at max
        newSelection = [...prev.slice(0, -1), goalId];
      }

      // Update Nova's reaction
      if (newSelection.length > 0) {
        const lastGoal = GOALS[newSelection[newSelection.length - 1]];
        const reactions = {
          productivity: "Getting things done is so satisfying!",
          health: "Your health is your greatest asset!",
          learning: "A curious mind is powerful!",
          financial: "Smart thinking! Financial peace is life-changing.",
          journal: "Reflection is powerful. I'll be here to listen.",
          habits: "Consistency is the secret sauce!",
          balance: "Finding balance is an art. Let's master it."
        };
        setNovaState('excited', reactions[newSelection[newSelection.length - 1]] || "Great choice!");
      }

      return newSelection;
    });
  };

  const handleContinue = () => {
    if (selectedGoals.length > 0) {
      onComplete(selectedGoals);
    }
  };

  return (
    <div className="goals-step">
      <motion.div
        className="step-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="step-title">What matters most to you?</h2>
        <p className="step-subtitle">
          Pick up to {MAX_GOALS} priorities • We'll set these up together
        </p>
      </motion.div>

      <div className="goals-grid">
        {goalsList.map((goal, index) => {
          const isSelected = selectedGoals.includes(goal.id);
          const selectionOrder = selectedGoals.indexOf(goal.id) + 1;

          return (
            <motion.button
              key={goal.id}
              className={`goal-card ${isSelected ? 'selected' : ''} color-${goal.color}`}
              onClick={() => toggleGoal(goal.id)}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.08 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="goal-icon">{goal.icon}</div>
              <div className="goal-content">
                <h3 className="goal-label">{goal.label}</h3>
                <p className="goal-description">{goal.description}</p>
              </div>

              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    className="goal-selected-badge"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                  >
                    <Check size={14} />
                    <span>{selectionOrder}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Selection glow effect */}
              {isSelected && (
                <motion.div
                  className="selection-glow"
                  layoutId="selection-glow"
                />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Selection indicator */}
      <motion.div
        className="selection-status"
        animate={{
          opacity: selectedGoals.length > 0 ? 1 : 0.5
        }}
      >
        <div className="selection-dots">
          {[...Array(MAX_GOALS)].map((_, i) => (
            <div
              key={i}
              className={`selection-dot ${i < selectedGoals.length ? 'filled' : ''}`}
            />
          ))}
        </div>
        <span className="selection-text">
          {selectedGoals.length === 0
            ? 'Select at least one priority'
            : `${selectedGoals.length} of ${MAX_GOALS} selected`}
        </span>
      </motion.div>

      {/* Continue button */}
      <motion.div
        className="step-action"
        initial={{ opacity: 0.5, y: 20 }}
        animate={{
          opacity: selectedGoals.length > 0 ? 1 : 0.5,
          y: 0
        }}
        transition={{ delay: 0.5 }}
      >
        <button
          className="onboarding-btn primary"
          onClick={handleContinue}
          disabled={selectedGoals.length === 0}
        >
          <span>Continue</span>
          <ArrowRight size={18} />
        </button>
      </motion.div>
    </div>
  );
}
