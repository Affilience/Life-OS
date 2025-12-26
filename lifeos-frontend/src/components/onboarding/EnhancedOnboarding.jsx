/**
 * Enhanced Onboarding - Elevated onboarding experience
 *
 * Inspired by:
 * - Duolingo's gradual engagement and quick wins
 * - Gamification with XP rewards and streak commitments
 * - Progress visualisation and celebration moments
 * - Personalized Nova reactions
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Sparkles,
  Zap,
  Target,
  Trophy,
  Flame,
  Star,
  Gift,
  ChevronRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import useIntegratedOnboardingStore, { GOAL_MODULES } from '../../stores/integratedOnboardingStore';
import { useGamificationStore } from '../../stores/gamificationStore';
import { useAvatarStore } from '../../stores/avatarStore';
import useDailyTasksStore from '../../stores/dailyTasksStore';
import './EnhancedOnboarding.css';

// Goals with enhanced descriptions and benefits
const GOALS = [
  {
    id: 'productivity',
    label: 'Get More Done',
    icon: '🎯',
    description: 'Tasks, projects & deep work',
    benefit: 'Average users complete 40% more tasks',
    color: '#f59e0b'
  },
  {
    id: 'health',
    label: 'Get Healthier',
    icon: '💪',
    description: 'Nutrition, fitness & wellness',
    benefit: 'Track calories, workouts & sleep',
    color: '#10b981'
  },
  {
    id: 'learning',
    label: 'Learn & Grow',
    icon: '📚',
    description: 'Skills and knowledge',
    benefit: 'Build expertise systematically',
    color: '#8b5cf6'
  },
  {
    id: 'financial',
    label: 'Manage Money',
    icon: '💰',
    description: 'Budget and savings',
    benefit: 'Users save 23% more on average',
    color: '#22c55e'
  },
  {
    id: 'journal',
    label: 'Reflect & Journal',
    icon: '📝',
    description: 'Mood and thoughts',
    benefit: 'Increase self-awareness daily',
    color: '#06b6d4'
  },
  {
    id: 'habits',
    label: 'Build Habits',
    icon: '🔥',
    description: 'Streaks and routines',
    benefit: '21-day streaks build lasting habits',
    color: '#ef4444'
  },
  {
    id: 'balance',
    label: 'Find Balance',
    icon: '⚖️',
    description: 'Purpose and values',
    benefit: 'Align actions with what matters',
    color: '#a855f7'
  }
];

// Daily commitment options (Duolingo-style)
const COMMITMENT_OPTIONS = [
  { id: 'casual', label: 'Casual', minutes: 5, description: '5 min/day', icon: '🌱' },
  { id: 'regular', label: 'Regular', minutes: 10, description: '10 min/day', icon: '🌿', recommended: true },
  { id: 'serious', label: 'Serious', minutes: 15, description: '15 min/day', icon: '🌳' },
  { id: 'intense', label: 'Intense', minutes: 20, description: '20 min/day', icon: '🔥' }
];

// Nova's emotional states and messages
const NOVA_STATES = {
  welcome: {
    image: '/assets/nova/nova_spark.png',
    message: "Hi! I'm Nova, your personal AI companion. Together, we'll build the life you want."
  },
  excited: {
    image: '/assets/nova/nova_stellar.png',
    message: "Great choices! I can already see you're serious about growth."
  },
  proud: {
    image: '/assets/nova/nova_cosmos.png',
    message: "I love that commitment! Consistency is the key to transformation."
  },
  quickWin: {
    image: '/assets/nova/nova_stellar.png',
    message: "Let's start with a quick win! What's one thing you want to accomplish today?"
  },
  celebrate: {
    image: '/assets/nova/nova_cosmos.png',
    message: "You're all set! You just earned your first XP. Let's make every day count!"
  }
};

// Onboarding steps
const STEPS = ['welcome', 'goals', 'commitment', 'quickWin', 'complete'];

export default function EnhancedOnboarding({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedGoals, setSelectedGoals] = useState([]);
  const [commitment, setCommitment] = useState('regular');
  const [quickWinText, setQuickWinText] = useState('');
  const [xpEarned, setXpEarned] = useState(0);
  const [showXpPopup, setShowXpPopup] = useState(false);
  const [novaState, setNovaState] = useState('welcome');

  const {
    setHasSeenWelcome,
    setSelectedGoals: saveGoals,
    updateSetupData
  } = useIntegratedOnboardingStore();

  // Backend stores for actual data persistence
  const { addXP: addXPToGamification, isInitialized: gamificationInitialized } = useGamificationStore();
  const { addXP: addXPToAvatar } = useAvatarStore();
  const { addTask } = useDailyTasksStore();

  // Award XP with animation
  const awardXP = useCallback((amount, reason) => {
    setXpEarned(prev => prev + amount);
    setShowXpPopup(true);
    setTimeout(() => setShowXpPopup(false), 1500);
  }, []);

  // Trigger confetti celebration
  const triggerConfetti = useCallback(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#8b5cf6', '#a855f7', '#c084fc', '#fbbf24', '#22c55e']
    });
  }, []);

  // Toggle goal selection
  const toggleGoal = (goalId) => {
    setSelectedGoals(prev => {
      if (prev.includes(goalId)) {
        return prev.filter(g => g !== goalId);
      } else if (prev.length < 3) {
        const newGoals = [...prev, goalId];
        // Award XP for first goal selection (kept low - onboarding shouldn't level up user)
        if (prev.length === 0) {
          awardXP(2, 'First goal selected!');
        }
        return newGoals;
      }
      return prev;
    });
  };

  // Handle step navigation
  const goToStep = (step) => {
    if (step > currentStep) {
      // Moving forward (XP kept low - onboarding shouldn't level up user)
      if (step === 2 && selectedGoals.length > 0) {
        setNovaState('excited');
        awardXP(5, 'Goals selected!');
      } else if (step === 3) {
        setNovaState('proud');
        awardXP(3, 'Commitment made!');
      } else if (step === 4) {
        setNovaState('celebrate');
        triggerConfetti();
        awardXP(10, 'Onboarding complete!');
      }
    }
    setCurrentStep(step);
  };

  // Handle final completion
  const handleComplete = async () => {
    // Save to local onboarding store
    saveGoals(selectedGoals);
    updateSetupData('onboarding', {
      commitment: COMMITMENT_OPTIONS.find(c => c.id === commitment),
      quickWin: quickWinText,
      xpEarned,
      completedAt: new Date().toISOString()
    });
    setHasSeenWelcome(true);

    // === BACKEND INTEGRATION ===

    // 1. Award XP to BOTH stores for consistency
    if (gamificationInitialized && addXPToGamification) {
      try {
        // Update avatar store first (for equipment unlocks)
        if (addXPToAvatar) {
          addXPToAvatar(xpEarned);
        }
        // Update gamification store (for Character page/Dashboard)
        // Skip avatar sync since we already called addXPToAvatar above
        await addXPToGamification(xpEarned, 'onboarding_complete', { skipAvatarSync: true });
        console.log(`✅ Awarded ${xpEarned} XP for onboarding completion`);
      } catch (error) {
        console.error('Failed to award onboarding XP:', error);
      }
    }

    // 2. Create quick win task in daily tasks (syncs to Supabase)
    if (quickWinText.trim() && addTask) {
      try {
        // Map selected goals to task category
        const goalToCategoryMap = {
          productivity: 'productivity',
          health: 'health',
          learning: 'learning',
          financial: 'personal',
          journal: 'personal',
          habits: 'productivity',
          balance: 'personal'
        };
        const primaryGoal = selectedGoals[0] || 'productivity';
        const category = goalToCategoryMap[primaryGoal] || 'productivity';

        const today = new Date().toISOString().split('T')[0];
        addTask({
          title: quickWinText.trim(),
          description: '🎯 Your first quick win from onboarding!',
          category,
          priority: 'high', // Quick wins are high priority
          estimatedMinutes: 15,
        }, today);
        console.log('✅ Created quick win task:', quickWinText);
      } catch (error) {
        console.error('Failed to create quick win task:', error);
      }
    }

    // Legacy callback for old gamification system
    if (window.triggerGamification) {
      window.triggerGamification('onboardingComplete', { xpOverride: xpEarned });
    }

    onComplete?.();
  };

  // Skip onboarding
  const handleSkip = () => {
    saveGoals(['productivity', 'health', 'habits']);
    setHasSeenWelcome(true);
    onComplete?.();
  };

  // Calculate progress percentage
  const progressPercent = ((currentStep + 1) / STEPS.length) * 100;

  return (
    <motion.div
      className="enhanced-onboarding-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* XP Popup */}
      <AnimatePresence>
        {showXpPopup && (
          <motion.div
            className="xp-popup"
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Zap className="xp-icon" />
            <span>+{xpEarned} XP</span>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className="enhanced-onboarding-modal"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 25 }}
      >
        {/* Progress Bar */}
        <div className="onboarding-progress-bar">
          <motion.div
            className="progress-fill"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
          <div className="progress-steps">
            {STEPS.map((step, idx) => (
              <div
                key={step}
                className={`progress-step ${idx <= currentStep ? 'completed' : ''} ${idx === currentStep ? 'current' : ''}`}
              >
                {idx < currentStep ? (
                  <Check size={12} />
                ) : (
                  <span>{idx + 1}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* XP Counter */}
        <div className="xp-counter">
          <Zap size={16} />
          <span>{xpEarned} XP</span>
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Welcome */}
          {currentStep === 0 && (
            <WelcomeStep
              key="welcome"
              novaState={NOVA_STATES.welcome}
              onContinue={() => goToStep(1)}
              onSkip={handleSkip}
            />
          )}

          {/* Step 2: Goals Selection */}
          {currentStep === 1 && (
            <GoalsStep
              key="goals"
              goals={GOALS}
              selectedGoals={selectedGoals}
              onToggleGoal={toggleGoal}
              onContinue={() => goToStep(2)}
              onBack={() => goToStep(0)}
            />
          )}

          {/* Step 3: Daily Commitment */}
          {currentStep === 2 && (
            <CommitmentStep
              key="commitment"
              options={COMMITMENT_OPTIONS}
              selected={commitment}
              onSelect={setCommitment}
              novaState={NOVA_STATES.excited}
              onContinue={() => goToStep(3)}
              onBack={() => goToStep(1)}
            />
          )}

          {/* Step 4: Quick Win */}
          {currentStep === 3 && (
            <QuickWinStep
              key="quickWin"
              value={quickWinText}
              onChange={setQuickWinText}
              novaState={NOVA_STATES.quickWin}
              selectedGoals={selectedGoals}
              goals={GOALS}
              onContinue={() => goToStep(4)}
              onBack={() => goToStep(2)}
            />
          )}

          {/* Step 5: Completion Celebration */}
          {currentStep === 4 && (
            <CompletionStep
              key="complete"
              novaState={NOVA_STATES.celebrate}
              xpEarned={xpEarned}
              selectedGoals={selectedGoals}
              goals={GOALS}
              commitment={COMMITMENT_OPTIONS.find(c => c.id === commitment)}
              onComplete={handleComplete}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

// Welcome Step Component
function WelcomeStep({ novaState, onContinue, onSkip }) {
  return (
    <motion.div
      className="onboarding-step welcome-step"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <div className="nova-section">
        <motion.div
          className="nova-avatar-container"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="nova-glow" />
          <img src={novaState.image} alt="Nova" className="nova-avatar" />
        </motion.div>

        <motion.div
          className="nova-speech-bubble"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <p>{novaState.message}</p>
        </motion.div>
      </div>

      <div className="welcome-content">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          Welcome to LifeOS
        </motion.h1>

        <motion.div
          className="feature-pills"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="feature-pill">
            <Target size={14} />
            <span>Goal Tracking</span>
          </div>
          <div className="feature-pill">
            <Flame size={14} />
            <span>Streaks & Habits</span>
          </div>
          <div className="feature-pill">
            <Trophy size={14} />
            <span>Level Up</span>
          </div>
        </motion.div>

        <motion.div
          className="time-badge"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Sparkles size={14} />
          <span>2 minutes to set up • Earn 100 XP</span>
        </motion.div>
      </div>

      <div className="step-actions">
        <motion.button
          className="primary-btn"
          onClick={onContinue}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Let's Begin
          <ArrowRight size={18} />
        </motion.button>
        <button className="text-btn" onClick={onSkip}>
          Skip, I'll explore myself
        </button>
      </div>
    </motion.div>
  );
}

// Goals Selection Step
function GoalsStep({ goals, selectedGoals, onToggleGoal, onContinue, onBack }) {
  return (
    <motion.div
      className="onboarding-step goals-step"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <div className="step-header">
        <h2>What brings you here?</h2>
        <p>Choose up to 3 priorities • We'll customise your experience</p>
      </div>

      <div className="goals-grid">
        {goals.map((goal, idx) => {
          const isSelected = selectedGoals.includes(goal.id);
          return (
            <motion.button
              key={goal.id}
              className={`goal-card ${isSelected ? 'selected' : ''}`}
              onClick={() => onToggleGoal(goal.id)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{ '--goal-color': goal.color }}
            >
              <div className="goal-icon-wrapper">
                <span className="goal-icon">{goal.icon}</span>
                {isSelected && (
                  <motion.div
                    className="check-badge"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                  >
                    <Check size={12} />
                  </motion.div>
                )}
              </div>
              <div className="goal-info">
                <span className="goal-label">{goal.label}</span>
                <span className="goal-desc">{goal.description}</span>
              </div>
              {isSelected && (
                <motion.div
                  className="goal-benefit"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                >
                  <Star size={12} />
                  <span>{goal.benefit}</span>
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>

      <div className="selection-status">
        <div className="selection-dots">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className={`dot ${i < selectedGoals.length ? 'filled' : ''}`}
              style={{ '--dot-delay': `${i * 0.1}s` }}
            />
          ))}
        </div>
        <span className="selection-text">
          {selectedGoals.length === 0
            ? 'Select at least 1 priority'
            : `${selectedGoals.length}/3 selected`}
        </span>
      </div>

      <div className="step-actions">
        <button className="back-btn" onClick={onBack}>
          <ArrowLeft size={18} />
        </button>
        <motion.button
          className="primary-btn"
          onClick={onContinue}
          disabled={selectedGoals.length === 0}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Continue
          <ArrowRight size={18} />
        </motion.button>
      </div>
    </motion.div>
  );
}

// Commitment Step Component
function CommitmentStep({ options, selected, onSelect, novaState, onContinue, onBack }) {
  return (
    <motion.div
      className="onboarding-step commitment-step"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <div className="nova-mini">
        <img src={novaState.image} alt="Nova" />
        <div className="speech-bubble-mini">
          <p>{novaState.message}</p>
        </div>
      </div>

      <div className="step-header">
        <h2>Set your daily commitment</h2>
        <p>How much time can you dedicate each day?</p>
      </div>

      <div className="commitment-options">
        {options.map((option) => (
          <motion.button
            key={option.id}
            className={`commitment-card ${selected === option.id ? 'selected' : ''} ${option.recommended ? 'recommended' : ''}`}
            onClick={() => onSelect(option.id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {option.recommended && (
              <div className="recommended-badge">
                <Star size={10} />
                Recommended
              </div>
            )}
            <span className="commitment-icon">{option.icon}</span>
            <span className="commitment-label">{option.label}</span>
            <span className="commitment-time">{option.description}</span>
            {selected === option.id && (
              <motion.div
                className="check-indicator"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
              >
                <Check size={16} />
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>

      <div className="streak-preview">
        <Flame size={18} className="flame-icon" />
        <p>Maintain your streak by logging in daily. Users with 7-day streaks are <strong>3.6x more likely</strong> to achieve their goals!</p>
      </div>

      <div className="step-actions">
        <button className="back-btn" onClick={onBack}>
          <ArrowLeft size={18} />
        </button>
        <motion.button
          className="primary-btn"
          onClick={onContinue}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          I'm Committed
          <ArrowRight size={18} />
        </motion.button>
      </div>
    </motion.div>
  );
}

// Quick Win Step Component
function QuickWinStep({ value, onChange, novaState, selectedGoals, goals, onContinue, onBack }) {
  const suggestions = selectedGoals.slice(0, 2).map(goalId => {
    const goal = goals.find(g => g.id === goalId);
    const suggestions = {
      productivity: 'Complete my most important task',
      health: 'Log my first meal',
      learning: 'Read for 10 minutes',
      financial: 'Review my spending',
      journal: 'Write a quick reflection',
      habits: 'Do a 5-minute habit',
      balance: 'Set one intention'
    };
    return { goal, text: suggestions[goalId] || 'Take one small step' };
  });

  return (
    <motion.div
      className="onboarding-step quickwin-step"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <div className="nova-mini">
        <img src={novaState.image} alt="Nova" />
        <div className="speech-bubble-mini">
          <p>{novaState.message}</p>
        </div>
      </div>

      <div className="step-header">
        <h2>Start with a quick win</h2>
        <p>What's one thing you'll accomplish today?</p>
      </div>

      <div className="quickwin-input-wrapper">
        <input
          type="text"
          className="quickwin-input"
          placeholder="e.g., Complete my most important task..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoFocus
        />
        <Gift size={20} className="input-icon" />
      </div>

      {suggestions.length > 0 && (
        <div className="quickwin-suggestions">
          <span className="suggestions-label">Quick suggestions:</span>
          <div className="suggestion-chips">
            {suggestions.map((s, idx) => (
              <button
                key={idx}
                className="suggestion-chip"
                onClick={() => onChange(s.text)}
              >
                <span>{s.goal?.icon}</span>
                {s.text}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="quickwin-tip">
        <Zap size={14} />
        <span>Completing this earns you <strong>+25 XP</strong> today!</span>
      </div>

      <div className="step-actions">
        <button className="back-btn" onClick={onBack}>
          <ArrowLeft size={18} />
        </button>
        <motion.button
          className="primary-btn"
          onClick={onContinue}
          disabled={!value.trim()}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Set My Goal
          <ArrowRight size={18} />
        </motion.button>
      </div>
    </motion.div>
  );
}

// Completion Step Component
function CompletionStep({ novaState, xpEarned, selectedGoals, goals, commitment, onComplete }) {
  return (
    <motion.div
      className="onboarding-step completion-step"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="celebration-header"
        initial={{ y: -20 }}
        animate={{ y: 0 }}
      >
        <div className="trophy-container">
          <Trophy size={48} className="trophy-icon" />
          <motion.div
            className="sparkle-ring"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          />
        </div>
        <h1>You're All Set!</h1>
        <p>Your personal operating system is ready</p>
      </motion.div>

      <motion.div
        className="xp-reward-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="xp-icon-large">
          <Zap size={24} />
        </div>
        <div className="xp-details">
          <span className="xp-label">XP Earned</span>
          <span className="xp-value">+{xpEarned}</span>
        </div>
        <div className="xp-message">
          Welcome bonus! Keep earning XP to level up.
        </div>
      </motion.div>

      <motion.div
        className="setup-summary"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="summary-item">
          <div className="summary-label">Your Focus Areas</div>
          <div className="summary-value goals-value">
            {selectedGoals.map(goalId => {
              const goal = goals.find(g => g.id === goalId);
              return (
                <span key={goalId} className="goal-tag">
                  {goal?.icon} {goal?.label}
                </span>
              );
            })}
          </div>
        </div>
        <div className="summary-item">
          <div className="summary-label">Daily Commitment</div>
          <div className="summary-value">
            {commitment?.icon} {commitment?.description}
          </div>
        </div>
      </motion.div>

      <div className="nova-farewell">
        <img src={novaState.image} alt="Nova" />
        <div className="farewell-bubble">
          <p>{novaState.message}</p>
        </div>
      </div>

      <motion.button
        className="primary-btn complete-btn"
        onClick={onComplete}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        Enter LifeOS
        <ChevronRight size={20} />
      </motion.button>
    </motion.div>
  );
}
