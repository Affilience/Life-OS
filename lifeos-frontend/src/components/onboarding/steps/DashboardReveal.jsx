/**
 * Dashboard Reveal Step
 *
 * The grand finale of onboarding - reveals the personalized dashboard
 * with celebration animations and Nova's proud moment.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Rocket,
  Star,
  Trophy,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import useOnboardingStore, { GOALS } from '../../../stores/onboardingStore';
import Confetti from 'react-confetti';

export default function DashboardReveal({ onComplete }) {
  const navigate = useNavigate();
  const { selectedGoals, completedModules, userName } = useOnboardingStore();
  const [showConfetti, setShowConfetti] = useState(true);
  const [currentPhase, setCurrentPhase] = useState('celebration'); // celebration, summary, ready

  useEffect(() => {
    // Auto-progress through phases
    const timer1 = setTimeout(() => setCurrentPhase('summary'), 2500);
    const timer2 = setTimeout(() => setShowConfetti(false), 4000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  const handleEnterDashboard = () => {
    onComplete();
    navigate('/');
  };

  const getGoalLabel = (goalId) => {
    const goal = Object.values(GOALS).find(g => g.id === goalId);
    return goal?.label || goalId;
  };

  return (
    <div className="onboarding-step dashboard-reveal">
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={200}
          colors={['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EC4899']}
        />
      )}

      <AnimatePresence mode="wait">
        {currentPhase === 'celebration' && (
          <motion.div
            key="celebration"
            className="reveal-phase celebration-phase"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="celebration-icon"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', duration: 0.8 }}
            >
              <Trophy size={80} />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              You're All Set!
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Your personal operating system is ready
            </motion.p>
          </motion.div>
        )}

        {currentPhase === 'summary' && (
          <motion.div
            key="summary"
            className="reveal-phase summary-phase"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Nova's Final Message */}
            <div className="nova-final-message">
              <div className="nova-avatar-large">
                <img src="/assets/nova/nova_stellar.png" alt="Nova" />
              </div>
              <div className="nova-speech-final">
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {userName ? `Amazing work, ${userName}!` : 'Amazing work!'} You've taken the first step on an incredible journey.
                </motion.p>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  I'll be here whenever you need guidance, insights, or just want to track your progress. Let's make this your best chapter yet!
                </motion.p>
              </div>
            </div>

            {/* Setup Summary */}
            <motion.div
              className="setup-summary"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <h3>Your Journey Begins</h3>

              <div className="summary-section">
                <h4>
                  <Star size={16} />
                  Your Goals
                </h4>
                <div className="goal-tags">
                  {selectedGoals.map(goalId => (
                    <span key={goalId} className="goal-tag">
                      {getGoalLabel(goalId)}
                    </span>
                  ))}
                </div>
              </div>

              <div className="summary-section">
                <h4>
                  <CheckCircle2 size={16} />
                  Modules Configured
                </h4>
                <div className="module-list">
                  {completedModules.map(module => (
                    <div key={module} className="module-item completed">
                      <CheckCircle2 size={14} />
                      <span>{module}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Tips for Getting Started */}
            <motion.div
              className="getting-started-tips"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
            >
              <h4>
                <Sparkles size={16} />
                Quick Tips
              </h4>
              <ul>
                <li>Start each day by checking your dashboard</li>
                <li>Log activities as you do them for best accuracy</li>
                <li>Click my icon anytime you need help or insights</li>
                <li>Consistency beats perfection - small logs add up!</li>
              </ul>
            </motion.div>

            {/* Enter Dashboard CTA */}
            <motion.div
              className="enter-dashboard-cta"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5 }}
            >
              <button
                className="onboarding-btn primary large"
                onClick={handleEnterDashboard}
              >
                <Rocket size={20} />
                <span>Enter Your Dashboard</span>
                <ArrowRight size={20} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
