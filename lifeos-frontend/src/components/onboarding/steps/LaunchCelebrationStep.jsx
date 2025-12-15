import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, Sparkles, Star, Zap, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../../../services/microInteractions/sounds';
import OnboardingXPCounter from '../shared/OnboardingXPCounter';

/**
 * LaunchCelebrationStep - Final celebration and launch
 *
 * Features:
 * - Confetti celebration
 * - Summary of choices
 * - Total XP earned display
 * - Launch button
 */

export default function LaunchCelebrationStep({
  onComplete,
  profile = {},
  selectedGoals = [],
  gamificationMode = 'cosmic',
  xpEarned = 0,
  soundEnabled = true,
}) {
  const [celebrationPhase, setCelebrationPhase] = useState(0);
  const [showLaunch, setShowLaunch] = useState(false);

  // Trigger celebration on mount
  useEffect(() => {
    // Phase 0: Initial confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#8b5cf6', '#a855f7', '#ec4899', '#f0abfc', '#fbbf24'],
    });

    if (soundEnabled && sounds.isEnabled()) {
      sounds.levelUp();
    }

    // Phase 1: Side confetti
    setTimeout(() => {
      setCelebrationPhase(1);
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
      });
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
      });
    }, 500);

    // Phase 2: Show launch button
    setTimeout(() => {
      setCelebrationPhase(2);
      setShowLaunch(true);
    }, 1500);
  }, [soundEnabled]);

  const handleLaunch = () => {
    // Final celebration
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.5 },
    });

    if (soundEnabled && sounds.isEnabled()) {
      sounds.achievement();
    }

    setTimeout(() => {
      onComplete?.();
    }, 500);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-full px-4 py-8">
      {/* Floating particles background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-purple-400/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center relative z-10"
      >
        {/* Celebration icon */}
        <motion.div
          className="relative w-24 h-24 mx-auto mb-6"
          animate={{
            rotate: [0, -5, 5, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl blur-xl opacity-50" />
          <div className="relative w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center">
            <Trophy className="w-12 h-12 text-white" />
          </div>

          {/* Sparkle decorations */}
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{
                top: ['-10%', '0%', '80%', '70%'][i],
                left: ['-10%', '90%', '-10%', '90%'][i],
              }}
              animate={{
                scale: [0.5, 1, 0.5],
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.3,
              }}
            >
              <Sparkles className="w-6 h-6 text-yellow-400" />
            </motion.div>
          ))}
        </motion.div>

        {/* Welcome message */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-4xl sm:text-5xl font-bold text-white mb-3"
        >
          Welcome, {profile.username || 'Traveler'}!
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-white/60 text-lg mb-8 max-w-md mx-auto"
        >
          Your journey through the cosmos begins now.
        </motion.p>

        {/* XP Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-8"
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30">
            <Zap className="w-6 h-6 text-yellow-400" />
            <div className="text-left">
              <div className="text-white/60 text-sm">Total XP Earned</div>
              <div className="text-2xl font-bold text-yellow-400">{xpEarned} XP</div>
            </div>
          </div>
        </motion.div>

        {/* Summary cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-2 gap-4 max-w-sm mx-auto mb-8"
        >
          {/* Mode */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="text-white/40 text-xs uppercase tracking-wider mb-1">Mode</div>
            <div className="text-white font-medium capitalize">
              {gamificationMode}
            </div>
          </div>

          {/* Goals count */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="text-white/40 text-xs uppercase tracking-wider mb-1">Focus Areas</div>
            <div className="text-white font-medium">
              {selectedGoals.length} Selected
            </div>
          </div>
        </motion.div>

        {/* Launch Button */}
        <AnimatePresence>
          {showLaunch && (
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              <motion.button
                onClick={handleLaunch}
                className="
                  flex items-center gap-3 px-10 py-4 rounded-2xl
                  bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500
                  bg-[length:200%_auto] text-white font-bold text-lg
                  shadow-lg shadow-purple-500/30
                  hover:shadow-xl hover:shadow-purple-500/40
                  transition-all duration-300
                "
                animate={{
                  backgroundPosition: ['0% center', '100% center', '0% center'],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'linear',
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Rocket className="w-6 h-6" />
                <span>Begin Your Journey</span>
                <Star className="w-6 h-6" />
              </motion.button>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-white/40 text-sm mt-4"
              >
                Press to enter your personal operating system
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
