import React from 'react';
import { motion } from 'framer-motion';
import { Target, ChevronRight, ChevronLeft } from 'lucide-react';
import FirstQuestCard from '../features/FirstQuestCard';
import OnboardingXPCounter from '../shared/OnboardingXPCounter';
import { sounds } from '../../../services/microInteractions/sounds';

/**
 * FirstQuestStep - Quest assignment based on primary goal
 *
 * Features:
 * - Assigns first quest based on primary selected goal
 * - Shows reward preview
 * - XP reward for accepting
 */

export default function FirstQuestStep({
  onNext,
  onPrev,
  onQuestAccept,
  selectedGoals = [],
  xpEarned = 0,
  onAddXP,
  soundEnabled = true,
}) {
  // Use first selected goal as primary
  const primaryGoal = selectedGoals[0] || 'productivity';

  const handleQuestAccept = (quest) => {
    onQuestAccept?.(quest);
    onAddXP?.(10);

    // Continue after brief delay
    setTimeout(() => {
      onNext?.();
    }, 800);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-full px-4 py-8">
      {/* XP Counter */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-6 right-6"
      >
        <OnboardingXPCounter xp={xpEarned} soundEnabled={soundEnabled} />
      </motion.div>

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
          <Target className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
          Your First Quest
        </h1>
        <p className="text-white/60 max-w-md mx-auto">
          Every journey begins with a single step. Here's your first mission.
        </p>
      </motion.div>

      {/* Quest Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="w-full max-w-md mb-8"
      >
        <FirstQuestCard
          primaryGoal={primaryGoal}
          onAccept={handleQuestAccept}
          soundEnabled={soundEnabled}
        />
      </motion.div>

      {/* Nova message */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center max-w-md"
      >
        <p className="text-white/40 text-sm italic">
          "Accept this quest and take your first step toward transformation.
          I'll be here to guide you along the way."
        </p>
      </motion.div>

      {/* Navigation - Back only (quest accept triggers next) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex items-center justify-start w-full max-w-md mt-8"
      >
        <button
          onClick={onPrev}
          className="flex items-center gap-2 px-4 py-2 text-white/60 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
      </motion.div>
    </div>
  );
}
