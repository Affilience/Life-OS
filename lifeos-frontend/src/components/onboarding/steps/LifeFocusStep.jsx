import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Zap, Heart, BookOpen, Wallet, Sparkles, Target,
  ChevronRight, ChevronLeft, Clock
} from 'lucide-react';
import { useNewOnboardingStore, LIFE_GOALS } from '../../../stores/newOnboardingStore';

const ICON_MAP = {
  Zap,
  Heart,
  BookOpen,
  Wallet,
  Sparkles,
  Target,
};

const TIME_COMMITMENTS = [
  { value: 5, label: '5 min', description: 'Quick check-ins' },
  { value: 15, label: '15 min', description: 'Daily review' },
  { value: 30, label: '30 min', description: 'Focused tracking' },
  { value: 60, label: '1 hour', description: 'Deep engagement' },
];

export default function LifeFocusStep({ onNext, onPrev, onSkip, canSkip, isTransitioning }) {
  const {
    lifeGoals,
    setLifeGoals,
    dailyCommitment,
    setDailyCommitment,
    isDialogueComplete,
    setNovaState,
    addOnboardingXP,
  } = useNewOnboardingStore();

  const [selectedGoals, setSelectedGoals] = useState(lifeGoals || []);
  const [commitment, setCommitment] = useState(dailyCommitment || 15);
  const [step, setStep] = useState(1); // 1: goals, 2: time commitment

  const dialogueComplete = isDialogueComplete();

  const handleToggleGoal = (goalId) => {
    setSelectedGoals(prev => {
      const newGoals = prev.includes(goalId)
        ? prev.filter(id => id !== goalId)
        : [...prev, goalId];

      if (newGoals.length > 0) {
        setNovaState('excited');
      }
      return newGoals;
    });
  };

  const handleContinueToCommitment = () => {
    setLifeGoals(selectedGoals);
    setStep(2);
    setNovaState('thinking');
  };

  const handleComplete = () => {
    setDailyCommitment(commitment);
    if (selectedGoals.length > 0) {
      addOnboardingXP(15); // Award XP for setting goals
    }
    onNext();
  };

  const canProceedStep1 = selectedGoals.length > 0;

  return (
    <div className="flex flex-col items-center">
      {/* Title */}
      {dialogueComplete && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            {step === 1 ? 'What Drives You?' : 'Your Daily Commitment'}
          </h1>
          <p className="text-white/60">
            {step === 1
              ? 'Select the areas you want to focus on'
              : 'How much time can you dedicate each day?'
            }
          </p>
        </motion.div>
      )}

      {/* Step 1: Goal Selection */}
      {dialogueComplete && step === 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="w-full max-w-3xl"
        >
          {/* Goals Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
            {LIFE_GOALS.map((goal, index) => {
              const Icon = ICON_MAP[goal.icon] || Sparkles;
              const isSelected = selectedGoals.includes(goal.id);

              return (
                <motion.button
                  key={goal.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleToggleGoal(goal.id)}
                  className={`
                    relative p-4 rounded-xl text-left transition-all duration-300
                    ${isSelected
                      ? `bg-gradient-to-br ${goal.color} bg-opacity-20 border-2 border-white/30 scale-[1.02]`
                      : 'bg-[#1a1724]/80 border border-white/10 hover:border-white/20'
                    }
                  `}
                >
                  {/* Selected checkmark */}
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-2 -right-2 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center"
                    >
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </motion.div>
                  )}

                  {/* Icon */}
                  <div className={`
                    w-10 h-10 rounded-lg flex items-center justify-center mb-3
                    ${isSelected ? 'bg-white/20' : `bg-gradient-to-br ${goal.color}`}
                  `}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="font-semibold text-white text-sm mb-1">{goal.label}</h3>
                  <p className="text-white/50 text-xs leading-relaxed">{goal.description}</p>
                </motion.button>
              );
            })}
          </div>

          {/* Selection summary */}
          {selectedGoals.length > 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-white/60 text-sm mb-6"
            >
              {selectedGoals.length} focus area{selectedGoals.length > 1 ? 's' : ''} selected
            </motion.p>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={onPrev}
              className="flex items-center gap-2 px-4 py-2 text-white/60 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Back</span>
            </button>

            <div className="flex items-center gap-3">
              {canSkip && (
                <button
                  onClick={onSkip}
                  className="px-4 py-2 text-white/40 hover:text-white/60 transition-colors text-sm"
                >
                  Skip
                </button>
              )}

              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: canProceedStep1 ? 1 : 0.5 }}
                onClick={handleContinueToCommitment}
                disabled={!canProceedStep1 || isTransitioning}
                className={`
                  flex items-center gap-2 px-6 py-3 rounded-xl font-semibold
                  transition-all duration-200
                  ${canProceedStep1
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg hover:scale-[1.02]'
                    : 'bg-white/5 text-white/30 cursor-not-allowed'
                  }
                `}
              >
                <span>Continue</span>
                <ChevronRight className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Step 2: Time Commitment */}
      {dialogueComplete && step === 2 && (
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          className="w-full max-w-xl"
        >
          {/* Time icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center"
          >
            <Clock className="w-8 h-8 text-purple-400" />
          </motion.div>

          {/* Time options */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            {TIME_COMMITMENTS.map((option, index) => (
              <motion.button
                key={option.value}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setCommitment(option.value)}
                className={`
                  p-4 rounded-xl text-center transition-all duration-300
                  ${commitment === option.value
                    ? 'bg-purple-500/20 border-2 border-purple-500/50 scale-[1.02]'
                    : 'bg-[#1a1724]/80 border border-white/10 hover:border-white/20'
                  }
                `}
              >
                <div className="text-2xl font-bold text-white mb-1">{option.label}</div>
                <div className="text-xs text-white/50">{option.description}</div>
              </motion.button>
            ))}
          </div>

          {/* Encouragement text */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center text-white/50 text-sm mb-8"
          >
            Start small - you can always increase later. Consistency beats intensity.
          </motion.p>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setStep(1)}
              className="flex items-center gap-2 px-4 py-2 text-white/60 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Back</span>
            </button>

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={handleComplete}
              disabled={isTransitioning}
              className="flex items-center gap-2 px-8 py-3 rounded-xl font-semibold bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
            >
              <span>Continue</span>
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
