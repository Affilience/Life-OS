import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Briefcase, MinusCircle, ChevronRight, Star, Trophy, Target } from 'lucide-react';
import { useNewOnboardingStore, NOVA_DIALOGUES, ONBOARDING_STEPS } from '../../../stores/newOnboardingStore';

const MODES = [
  {
    id: 'cosmic',
    name: 'Full Experience',
    tagline: 'Complete Adventure',
    description: 'Embrace the complete journey with XP, avatar evolution, equipment, quests, achievements, and cosmic rewards.',
    icon: Sparkles,
    color: 'from-purple-500 to-pink-500',
    borderColor: 'border-purple-500/50',
    bgColor: 'bg-purple-500/10',
    features: ['40 Evolution Stages', 'Equipment & Stats', 'Quests & Achievements', 'Cosmic Rewards'],
  },
  {
    id: 'minimal',
    name: 'Minimal',
    tagline: 'Pure Productivity',
    description: 'Clean, distraction-free tracking. Gamification bonuses still apply silently in the background.',
    icon: MinusCircle,
    color: 'from-gray-400 to-gray-500',
    borderColor: 'border-gray-500/50',
    bgColor: 'bg-gray-500/10',
    features: ['Clean Interface', 'Essential Stats', 'Silent Bonuses', 'No Distractions'],
  },
];

export default function GamificationModeStep({ onNext, isTransitioning }) {
  const { gamificationMode, setGamificationMode, setNovaState, isDialogueComplete } = useNewOnboardingStore();
  const [hoveredMode, setHoveredMode] = useState(null);

  const dialogueComplete = isDialogueComplete();

  const handleSelectMode = (modeId) => {
    setGamificationMode(modeId);
    setNovaState('excited');
  };

  const handleContinue = () => {
    if (gamificationMode) {
      onNext();
    }
  };

  return (
    <div className="flex flex-col items-center">
      {/* Title - only show after dialogue complete */}
      {dialogueComplete && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            Choose Your Experience
          </h1>
          <p className="text-white/60">
            This shapes your entire LifeOS journey
          </p>
        </motion.div>
      )}

      {/* Mode Cards */}
      {dialogueComplete && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 w-full max-w-3xl mb-8"
        >
          {MODES.map((mode, index) => {
            const Icon = mode.icon;
            const isSelected = gamificationMode === mode.id;
            const isHovered = hoveredMode === mode.id;

            return (
              <motion.button
                key={mode.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                onClick={() => handleSelectMode(mode.id)}
                onMouseEnter={() => setHoveredMode(mode.id)}
                onMouseLeave={() => setHoveredMode(null)}
                className={`
                  relative p-6 rounded-2xl text-left transition-all duration-300
                  ${isSelected
                    ? `${mode.bgColor} ${mode.borderColor} border-2 scale-[1.02]`
                    : 'bg-[#1a1724]/80 border border-white/10 hover:border-white/20'
                  }
                `}
              >
                {/* Selected indicator */}
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
                  >
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </motion.div>
                )}

                {/* Icon */}
                <div className={`
                  w-12 h-12 rounded-xl flex items-center justify-center mb-4
                  bg-gradient-to-br ${mode.color}
                `}>
                  <Icon className="w-6 h-6 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-lg font-bold text-white mb-1">{mode.name}</h3>
                <p className={`text-sm font-medium mb-2 bg-gradient-to-r ${mode.color} bg-clip-text text-transparent`}>
                  {mode.tagline}
                </p>
                <p className="text-sm text-white/60 mb-4 leading-relaxed">
                  {mode.description}
                </p>

                {/* Features */}
                <div className="space-y-1.5">
                  {mode.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-white/50">
                      <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${mode.color}`} />
                      {feature}
                    </div>
                  ))}
                </div>

                {/* Hover glow effect - subtle border glow only */}
                {isHovered && !isSelected && (
                  <motion.div
                    layoutId="mode-highlight"
                    className="absolute inset-0 rounded-2xl pointer-events-none"
                    style={{
                      boxShadow: `0 0 30px ${mode.id === 'cosmic' ? 'rgba(168, 85, 247, 0.3)' : 'rgba(156, 163, 175, 0.2)'}`,
                    }}
                    initial={false}
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </motion.button>
            );
          })}
        </motion.div>
      )}

      {/* Continue Button */}
      {dialogueComplete && gamificationMode && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          onClick={handleContinue}
          disabled={isTransitioning}
          className={`
            flex items-center gap-2 px-8 py-3 rounded-xl font-semibold
            bg-gradient-to-r ${MODES.find(m => m.id === gamificationMode)?.color || 'from-purple-500 to-pink-500'}
            text-white shadow-lg hover:shadow-xl hover:scale-105
            transition-all duration-200 disabled:opacity-50
          `}
        >
          <span>Continue</span>
          <ChevronRight className="w-5 h-5" />
        </motion.button>
      )}

      {/* Nova's reaction message */}
      {gamificationMode && dialogueComplete && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 text-center text-white/60 text-sm max-w-md"
        >
          {NOVA_DIALOGUES[ONBOARDING_STEPS.GAMIFICATION_MODE][gamificationMode]}
        </motion.p>
      )}
    </div>
  );
}
