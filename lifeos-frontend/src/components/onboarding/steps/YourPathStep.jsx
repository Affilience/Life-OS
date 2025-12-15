import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Compass, ChevronRight, ChevronLeft, Clock } from 'lucide-react';
import { sounds } from '../../../services/microInteractions/sounds';
import ConstellationPicker from '../features/ConstellationPicker';
import OnboardingXPCounter from '../shared/OnboardingXPCounter';

/**
 * YourPathStep - Constellation goal picker + time commitment
 *
 * Features:
 * - Interactive constellation for goal selection
 * - Time commitment slider
 * - XP rewards for selections
 */

const TIME_OPTIONS = [
  { value: 10, label: '10 min', description: 'Quick daily check-in' },
  { value: 15, label: '15 min', description: 'Light engagement' },
  { value: 30, label: '30 min', description: 'Moderate focus' },
  { value: 45, label: '45 min', description: 'Deep engagement' },
  { value: 60, label: '1 hour+', description: 'Serious commitment' },
];

export default function YourPathStep({
  onNext,
  onPrev,
  onGoalsChange,
  onCommitmentChange,
  selectedGoals = [],
  dailyCommitment = 15,
  xpEarned = 0,
  onAddXP,
  soundEnabled = true,
}) {
  const [localGoals, setLocalGoals] = useState(selectedGoals);
  const [localCommitment, setLocalCommitment] = useState(dailyCommitment);
  const [goalsXPAwarded, setGoalsXPAwarded] = useState(new Set());

  const handleGoalsChange = (goals) => {
    // Check for new goals to award XP
    const newGoals = goals.filter(g => !goalsXPAwarded.has(g));
    if (newGoals.length > 0) {
      newGoals.forEach(g => {
        onAddXP?.(10);
        if (soundEnabled && sounds.isEnabled()) {
          sounds.xpGain();
        }
      });
      setGoalsXPAwarded(prev => new Set([...prev, ...newGoals]));
    }

    setLocalGoals(goals);
    onGoalsChange?.(goals);
  };

  const handleCommitmentChange = (value) => {
    setLocalCommitment(value);
    onCommitmentChange?.(value);

    if (soundEnabled && sounds.isEnabled()) {
      sounds.click();
    }
  };

  const handleContinue = () => {
    if (localGoals.length > 0) {
      if (soundEnabled && sounds.isEnabled()) {
        sounds.success();
      }
      onNext?.();
    }
  };

  const canContinue = localGoals.length > 0;

  return (
    <div className="flex flex-col items-center justify-start min-h-full px-4 py-8 overflow-y-auto">
      {/* XP Counter */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-6 right-6 z-20"
      >
        <OnboardingXPCounter xp={xpEarned} soundEnabled={soundEnabled} />
      </motion.div>

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6"
      >
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
          <Compass className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
          Chart Your Path
        </h1>
        <p className="text-white/60 max-w-md mx-auto">
          Select up to 3 areas to focus on. Your constellation will guide your journey.
        </p>
      </motion.div>

      {/* Constellation Picker */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="w-full max-w-lg mb-8"
      >
        <ConstellationPicker
          selectedGoals={localGoals}
          onSelectionChange={handleGoalsChange}
          maxSelections={3}
          soundEnabled={soundEnabled}
        />
      </motion.div>

      {/* Time Commitment Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="w-full max-w-md mb-8"
      >
        <div className="flex items-center gap-2 mb-4 justify-center">
          <Clock className="w-5 h-5 text-white/60" />
          <span className="text-white/80">Daily time commitment</span>
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {TIME_OPTIONS.map((option) => (
            <motion.button
              key={option.value}
              onClick={() => handleCommitmentChange(option.value)}
              className={`
                px-4 py-2 rounded-xl transition-all duration-200
                ${localCommitment === option.value
                  ? 'bg-purple-500/30 border-2 border-purple-500/50 text-purple-300'
                  : 'bg-white/5 border-2 border-transparent text-white/60 hover:bg-white/10'
                }
              `}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="font-medium">{option.label}</div>
              <div className="text-xs opacity-60">{option.description}</div>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Selected Goals Summary */}
      {localGoals.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <p className="text-white/40 text-sm">
            Your constellation: {localGoals.map(g => g.charAt(0).toUpperCase() + g.slice(1)).join(' • ')}
          </p>
        </motion.div>
      )}

      {/* Navigation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex items-center justify-between w-full max-w-md"
      >
        <button
          onClick={onPrev}
          className="flex items-center gap-2 px-4 py-2 text-white/60 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Back</span>
        </button>

        <motion.button
          onClick={handleContinue}
          disabled={!canContinue}
          className={`
            flex items-center gap-2 px-6 py-3 rounded-xl font-semibold
            transition-all duration-300
            ${canContinue
              ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-lg hover:shadow-purple-500/30'
              : 'bg-white/10 text-white/30 cursor-not-allowed'
            }
          `}
          whileHover={canContinue ? { scale: 1.05 } : {}}
          whileTap={canContinue ? { scale: 0.95 } : {}}
        >
          <span>Continue</span>
          <ChevronRight className="w-5 h-5" />
        </motion.button>
      </motion.div>
    </div>
  );
}
