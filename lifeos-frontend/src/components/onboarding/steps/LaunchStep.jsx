import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, Sparkles, Star, Trophy, ChevronRight, Zap } from 'lucide-react';
import { useNewOnboardingStore, NOVA_STATES } from '../../../stores/newOnboardingStore';
import confetti from 'canvas-confetti';

// Confetti burst
const triggerConfetti = () => {
  const count = 200;
  const defaults = {
    origin: { y: 0.7 },
    zIndex: 9999,
  };

  function fire(particleRatio, opts) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
    });
  }

  fire(0.25, {
    spread: 26,
    startVelocity: 55,
    colors: ['#a855f7', '#ec4899', '#f59e0b'],
  });

  fire(0.2, {
    spread: 60,
    colors: ['#8b5cf6', '#d946ef'],
  });

  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8,
    colors: ['#6366f1', '#06b6d4'],
  });

  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2,
    colors: ['#fbbf24', '#f97316'],
  });

  fire(0.1, {
    spread: 120,
    startVelocity: 45,
    colors: ['#22c55e', '#10b981'],
  });
};

export default function LaunchStep({ onComplete, onPrev, isTransitioning }) {
  const {
    profile,
    gamificationMode,
    lifeGoals,
    xpEarned,
    isDialogueComplete,
  } = useNewOnboardingStore();

  const [showStats, setShowStats] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [launched, setLaunched] = useState(false);

  const dialogueComplete = isDialogueComplete();
  const displayName = profile.displayName || profile.username || 'Traveler';

  // Trigger confetti and animations on dialogue complete
  useEffect(() => {
    if (dialogueComplete && !launched) {
      // Delay to build anticipation
      const confettiTimeout = setTimeout(() => {
        try {
          triggerConfetti();
        } catch (e) {
          // Confetti library might not be available
          console.log('Confetti not available');
        }
      }, 500);

      const statsTimeout = setTimeout(() => setShowStats(true), 1000);
      const buttonTimeout = setTimeout(() => setShowButton(true), 2000);

      return () => {
        clearTimeout(confettiTimeout);
        clearTimeout(statsTimeout);
        clearTimeout(buttonTimeout);
      };
    }
  }, [dialogueComplete, launched]);

  const handleLaunch = () => {
    setLaunched(true);

    // Final confetti burst
    try {
      triggerConfetti();
    } catch (e) {}

    // Complete onboarding
    setTimeout(() => {
      onComplete();
    }, 1500);
  };

  // Get mode-specific styling
  const getModeStyle = () => {
    switch (gamificationMode) {
      case 'cosmic':
        return {
          gradient: 'from-purple-500 via-pink-500 to-orange-500',
          buttonGradient: 'from-purple-500 to-pink-500',
          title: 'Welcome to the Cosmos!',
        };
      case 'professional':
        return {
          gradient: 'from-blue-500 via-cyan-500 to-teal-500',
          buttonGradient: 'from-blue-500 to-cyan-500',
          title: 'Ready for Growth!',
        };
      case 'minimal':
        return {
          gradient: 'from-gray-400 via-gray-500 to-gray-600',
          buttonGradient: 'from-gray-500 to-gray-600',
          title: 'Let\'s Begin!',
        };
      default:
        return {
          gradient: 'from-purple-500 via-pink-500 to-orange-500',
          buttonGradient: 'from-purple-500 to-pink-500',
          title: 'Welcome!',
        };
    }
  };

  const style = getModeStyle();

  return (
    <div className="flex flex-col items-center min-h-[60vh] justify-center">
      <AnimatePresence mode="wait">
        {!launched ? (
          <motion.div
            key="pre-launch"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="text-center"
          >
            {/* Main title with gradient */}
            {dialogueComplete && (
              <motion.div
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <motion.div
                  className="relative inline-block"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Sparkles className="absolute -top-4 -left-4 w-6 h-6 text-yellow-400" />
                  <Sparkles className="absolute -top-2 -right-6 w-4 h-4 text-pink-400" />
                  <h1 className={`text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r ${style.gradient} bg-clip-text text-transparent mb-4`}>
                    {style.title}
                  </h1>
                </motion.div>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-xl text-white/80 mb-8"
                >
                  Your journey begins now, <span className="font-semibold text-white">{displayName}</span>
                </motion.p>
              </motion.div>
            )}

            {/* Stats summary */}
            {showStats && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-10"
              >
                {/* XP Earned */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: 'spring' }}
                  className="bg-[#1a1724]/80 rounded-xl p-4 border border-yellow-500/20"
                >
                  <Zap className="w-6 h-6 mx-auto mb-2 text-yellow-400" />
                  <div className="text-2xl font-bold text-white">{xpEarned}</div>
                  <div className="text-xs text-white/50">XP Earned</div>
                </motion.div>

                {/* Goals Selected */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="bg-[#1a1724]/80 rounded-xl p-4 border border-purple-500/20"
                >
                  <Star className="w-6 h-6 mx-auto mb-2 text-purple-400" />
                  <div className="text-2xl font-bold text-white">{lifeGoals.length}</div>
                  <div className="text-xs text-white/50">Focus Areas</div>
                </motion.div>

                {/* Ready to achieve */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: 'spring' }}
                  className="bg-[#1a1724]/80 rounded-xl p-4 border border-green-500/20"
                >
                  <Trophy className="w-6 h-6 mx-auto mb-2 text-green-400" />
                  <div className="text-2xl font-bold text-white">∞</div>
                  <div className="text-xs text-white/50">Possibilities</div>
                </motion.div>
              </motion.div>
            )}

            {/* Nova preview */}
            {showStats && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="mb-8"
              >
                <div className="relative w-20 h-20 mx-auto">
                  <div className="absolute inset-0 bg-purple-500/30 rounded-full blur-xl animate-pulse" />
                  <img
                    src={NOVA_STATES.celebrating}
                    alt="Nova"
                    className="w-full h-full object-contain relative z-10"
                    style={{ imageRendering: 'pixelated' }}
                  />
                </div>
                <p className="mt-4 text-white/60 text-sm max-w-xs mx-auto">
                  "I'll be here whenever you need guidance. Let's make every day count!"
                </p>
              </motion.div>
            )}

            {/* Launch button */}
            {showButton && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLaunch}
                disabled={isTransitioning}
                className={`
                  relative group px-10 py-4 rounded-2xl font-bold text-lg
                  bg-gradient-to-r ${style.buttonGradient} text-white
                  shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/40
                  transition-all duration-300
                `}
              >
                <span className="flex items-center gap-3">
                  <Rocket className="w-6 h-6 group-hover:animate-bounce" />
                  Launch My Journey
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>

                {/* Animated border */}
                <motion.div
                  className="absolute inset-0 rounded-2xl border-2 border-white/20"
                  animate={{
                    scale: [1, 1.05, 1],
                    opacity: [0.5, 0, 0.5],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.button>
            )}

            {/* Back link */}
            {showButton && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                onClick={onPrev}
                className="mt-6 text-white/40 hover:text-white/60 text-sm transition-colors"
              >
                ← Go back
              </motion.button>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="launching"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            {/* Launching animation */}
            <motion.div
              initial={{ y: 0 }}
              animate={{ y: -100, opacity: 0 }}
              transition={{ duration: 1.5, ease: 'easeIn' }}
            >
              <Rocket className="w-16 h-16 text-purple-400 mx-auto" />
            </motion.div>

            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-2xl font-bold text-white mt-8"
            >
              Launching...
            </motion.h2>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
