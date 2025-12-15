import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Zap, MinusCircle, ChevronRight } from 'lucide-react';
import { sounds } from '../../../services/microInteractions/sounds';
import OnboardingXPCounter from '../shared/OnboardingXPCounter';

/**
 * WelcomeModeStep - Combined welcome + gamification mode selection
 *
 * Features:
 * - Brief intro animation with Nova
 * - Mode selection (cosmic vs minimal)
 * - XP reward for completing step
 */

const MODES = [
  {
    id: 'cosmic',
    title: 'Cosmic Mode',
    subtitle: 'Full Experience',
    description: 'XP, levels, avatar evolution, quests, achievements, and rewards. The complete gamified journey.',
    icon: Sparkles,
    color: 'from-purple-500 to-pink-500',
    features: ['XP & Leveling', 'Avatar Evolution', 'Equipment & Rewards', 'Quests & Achievements'],
  },
  {
    id: 'minimal',
    title: 'Minimal Mode',
    subtitle: 'Clean & Simple',
    description: 'Focus on tracking and insights without the gamification elements. Pure productivity.',
    icon: MinusCircle,
    color: 'from-gray-500 to-gray-600',
    features: ['Clean Interface', 'Core Tracking', 'Analytics Focus', 'No Distractions'],
  },
];

export default function WelcomeModeStep({
  onNext,
  onModeSelect,
  selectedMode,
  xpEarned = 0,
  soundEnabled = true,
}) {
  const [showContent, setShowContent] = useState(false);
  const [localSelectedMode, setLocalSelectedMode] = useState(selectedMode);

  // Show content after brief delay for intro
  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleModeSelect = (modeId) => {
    setLocalSelectedMode(modeId);
    onModeSelect?.(modeId);

    if (soundEnabled && sounds.isEnabled()) {
      sounds.toggleOn();
    }
  };

  const handleContinue = () => {
    if (localSelectedMode) {
      if (soundEnabled && sounds.isEnabled()) {
        sounds.success();
      }
      onNext?.();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-full px-4 py-8">
      {/* XP Counter */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="absolute top-6 right-6"
      >
        <OnboardingXPCounter xp={xpEarned} soundEnabled={soundEnabled} />
      </motion.div>

      {/* Welcome Title */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8"
      >
        <motion.div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/20 border border-purple-500/30 mb-4"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Zap className="w-4 h-4 text-purple-400" />
          <span className="text-purple-300 text-sm">Welcome to LifeOS</span>
        </motion.div>

        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3">
          Choose Your Path
        </h1>

        <p className="text-white/60 text-lg max-w-md mx-auto">
          How would you like to experience your journey?
        </p>
      </motion.div>

      {/* Mode Selection Cards */}
      <AnimatePresence>
        {showContent && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl mb-8"
          >
            {MODES.map((mode, index) => {
              const isSelected = localSelectedMode === mode.id;
              const Icon = mode.icon;

              return (
                <motion.button
                  key={mode.id}
                  initial={{ opacity: 0, x: index === 0 ? -20 : 20, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  transition={{
                    delay: 0.3 + index * 0.1,
                    type: 'spring',
                    stiffness: 300,
                    damping: 20,
                  }}
                  whileHover={{
                    scale: 1.02,
                    y: -4,
                    transition: { type: 'spring', stiffness: 400, damping: 15 }
                  }}
                  whileTap={{
                    scale: 0.98,
                    transition: { type: 'spring', stiffness: 500, damping: 20 }
                  }}
                  onClick={() => handleModeSelect(mode.id)}
                  className={`
                    relative p-6 rounded-2xl text-left transition-colors duration-300
                    ${isSelected
                      ? 'bg-white/10 border-2 border-purple-500/50 shadow-lg shadow-purple-500/20'
                      : 'bg-white/5 border-2 border-transparent hover:bg-white/10 hover:border-white/20'
                    }
                  `}
                >
                  {/* Selection indicator */}
                  {isSelected && (
                    <motion.div
                      layoutId="mode-selected"
                      className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    />
                  )}

                  <div className="relative z-10">
                    {/* Icon and title */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${mode.color} flex items-center justify-center`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-white font-bold text-lg">{mode.title}</h3>
                        <p className="text-white/50 text-sm">{mode.subtitle}</p>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-white/60 text-sm mb-4">
                      {mode.description}
                    </p>

                    {/* Features */}
                    <div className="flex flex-wrap gap-2">
                      {mode.features.map((feature) => (
                        <span
                          key={feature}
                          className={`
                            px-2 py-1 rounded-md text-xs
                            ${isSelected
                              ? 'bg-purple-500/20 text-purple-300'
                              : 'bg-white/5 text-white/50'
                            }
                          `}
                        >
                          {feature}
                        </span>
                      ))}
                    </div>

                    {/* Selected checkmark */}
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-4 right-4 w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center"
                      >
                        <svg className="w-4 h-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </motion.div>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Continue Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: localSelectedMode ? 1 : 0.5, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <motion.button
          onClick={handleContinue}
          disabled={!localSelectedMode}
          className={`
            flex items-center gap-2 px-8 py-3 rounded-xl font-semibold
            transition-colors duration-300
            ${localSelectedMode
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30'
              : 'bg-white/10 text-white/50 cursor-not-allowed'
            }
          `}
          whileHover={localSelectedMode ? {
            scale: 1.05,
            boxShadow: '0 20px 40px -10px rgba(168, 85, 247, 0.5)',
            transition: { type: 'spring', stiffness: 400, damping: 15 }
          } : {}}
          whileTap={localSelectedMode ? {
            scale: 0.95,
            transition: { type: 'spring', stiffness: 500, damping: 20 }
          } : {}}
        >
          <span>Continue</span>
          <ChevronRight className="w-5 h-5" />
        </motion.button>
      </motion.div>

      {/* Nova's reaction */}
      {localSelectedMode && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-white/50 text-sm mt-4 text-center max-w-md"
        >
          {localSelectedMode === 'cosmic'
            ? "Excellent choice! The cosmos awaits your journey."
            : "A focused path. Clarity leads to mastery."
          }
        </motion.p>
      )}
    </div>
  );
}
