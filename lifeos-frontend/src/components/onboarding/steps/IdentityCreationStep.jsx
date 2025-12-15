import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, ChevronRight, ChevronLeft, Check, X, Loader2 } from 'lucide-react';
import { sounds } from '../../../services/microInteractions/sounds';
import AvatarBirthAnimation from '../features/AvatarBirthAnimation';
import OnboardingXPCounter from '../shared/OnboardingXPCounter';

// Simple debounce helper
function useDebounce(callback, delay) {
  const timeoutRef = useRef(null);

  return useCallback((...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay]);
}

/**
 * IdentityCreationStep - Enhanced profile creation with avatar birth
 *
 * Features:
 * - Username input with validation
 * - Gender selection with cinematic avatar birth
 * - XP rewards for each action
 */

export default function IdentityCreationStep({
  onNext,
  onPrev,
  onProfileUpdate,
  profile = {},
  xpEarned = 0,
  onAddXP,
  soundEnabled = true,
  checkUsernameAvailability, // Optional async function
}) {
  const [username, setUsername] = useState(profile.username || '');
  const [gender, setGender] = useState(profile.gender || null);
  const [usernameStatus, setUsernameStatus] = useState('idle'); // idle | checking | available | taken | invalid
  const [showAvatarSection, setShowAvatarSection] = useState(false);
  const [avatarRevealed, setAvatarRevealed] = useState(false);
  const [usernameXPAwarded, setUsernameXPAwarded] = useState(false);

  // Username validation
  const validateUsername = (value) => {
    if (value.length < 3) return 'too_short';
    if (value.length > 20) return 'too_long';
    if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(value)) return 'invalid_format';
    return 'valid';
  };

  // Username check function
  const doCheckUsername = useCallback(async (value) => {
    const validation = validateUsername(value);
    if (validation !== 'valid') {
      setUsernameStatus('invalid');
      return;
    }

    setUsernameStatus('checking');

    if (checkUsernameAvailability) {
      try {
        const isAvailable = await checkUsernameAvailability(value);
        setUsernameStatus(isAvailable ? 'available' : 'taken');
      } catch (e) {
        setUsernameStatus('available'); // Assume available on error
      }
    } else {
      // No check function provided, assume available
      setUsernameStatus('available');
    }
  }, [checkUsernameAvailability]);

  // Debounced username check
  const checkUsername = useDebounce(doCheckUsername, 500);

  // Handle username change
  const handleUsernameChange = (e) => {
    const value = e.target.value.trim();
    setUsername(value);
    onProfileUpdate?.({ username: value });

    if (value.length > 0) {
      checkUsername(value);
    } else {
      setUsernameStatus('idle');
    }
  };

  // Handle username confirmation
  const handleUsernameConfirm = () => {
    if (usernameStatus === 'available' && !showAvatarSection) {
      setShowAvatarSection(true);

      // Award XP for username
      if (!usernameXPAwarded) {
        onAddXP?.(10);
        setUsernameXPAwarded(true);
        if (soundEnabled && sounds.isEnabled()) {
          sounds.xpGain();
        }
      }
    }
  };

  // Handle gender selection
  const handleGenderSelect = (selectedGender) => {
    setGender(selectedGender);
    onProfileUpdate?.({ gender: selectedGender });

    // Award XP for avatar creation
    onAddXP?.(15);
  };

  // Handle avatar birth complete
  const handleAvatarComplete = () => {
    setAvatarRevealed(true);
  };

  // Handle continue
  const handleContinue = () => {
    if (usernameStatus === 'available' && gender && avatarRevealed) {
      onNext?.();
    }
  };

  const canContinue = usernameStatus === 'available' && gender && avatarRevealed;

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
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
          <User className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
          Create Your Identity
        </h1>
        <p className="text-white/60 max-w-md mx-auto">
          Choose a name and bring your avatar to life
        </p>
      </motion.div>

      {/* Username Input */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="w-full max-w-sm mb-8"
      >
        <label className="block text-white/70 text-sm mb-2">Username</label>
        <div className="relative">
          <input
            type="text"
            value={username}
            onChange={handleUsernameChange}
            placeholder="Enter your username"
            disabled={showAvatarSection}
            className={`
              w-full px-4 py-3 rounded-xl bg-white/10 border-2 text-white
              placeholder-white/30 focus:outline-none transition-all
              ${showAvatarSection ? 'opacity-50' : ''}
              ${usernameStatus === 'available'
                ? 'border-green-500/50 focus:border-green-500'
                : usernameStatus === 'taken' || usernameStatus === 'invalid'
                  ? 'border-red-500/50 focus:border-red-500'
                  : 'border-white/20 focus:border-purple-500'
              }
            `}
          />

          {/* Status indicator */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {usernameStatus === 'checking' && (
              <Loader2 className="w-5 h-5 text-white/50 animate-spin" />
            )}
            {usernameStatus === 'available' && (
              <Check className="w-5 h-5 text-green-500" />
            )}
            {(usernameStatus === 'taken' || usernameStatus === 'invalid') && (
              <X className="w-5 h-5 text-red-500" />
            )}
          </div>
        </div>

        {/* Status message */}
        <AnimatePresence mode="wait">
          {usernameStatus === 'taken' && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-red-400 text-sm mt-2"
            >
              This username is already taken
            </motion.p>
          )}
          {usernameStatus === 'invalid' && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-red-400 text-sm mt-2"
            >
              Username must be 3-20 characters, start with a letter
            </motion.p>
          )}
          {usernameStatus === 'available' && !showAvatarSection && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-green-400 text-sm mt-2"
            >
              Username available!
            </motion.p>
          )}
        </AnimatePresence>

        {/* Continue to avatar button */}
        {usernameStatus === 'available' && !showAvatarSection && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={handleUsernameConfirm}
            className="mt-4 w-full py-2 rounded-lg bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 transition-colors"
          >
            Continue to Avatar Creation
          </motion.button>
        )}
      </motion.div>

      {/* Avatar Section */}
      <AnimatePresence>
        {showAvatarSection && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            className="w-full max-w-md"
          >
            {/* Avatar Birth Animation */}
            <div className="mb-6">
              <AvatarBirthAnimation
                gender={gender}
                onComplete={handleAvatarComplete}
                soundEnabled={soundEnabled}
              />
            </div>

            {/* Gender Selection */}
            {!gender && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <p className="text-center text-white/60 mb-4">
                  Choose your avatar
                </p>
                <div className="flex justify-center gap-4">
                  <motion.button
                    onClick={() => handleGenderSelect('male')}
                    className="px-8 py-3 rounded-xl bg-blue-500/20 border border-blue-500/30 text-blue-300 hover:bg-blue-500/30 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Hero
                  </motion.button>
                  <motion.button
                    onClick={() => handleGenderSelect('female')}
                    className="px-8 py-3 rounded-xl bg-pink-500/20 border border-pink-500/30 text-pink-300 hover:bg-pink-500/30 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Heroine
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Avatar revealed message */}
            {avatarRevealed && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <p className="text-purple-300 mb-2">
                  Your avatar has awakened!
                </p>
                <p className="text-white/40 text-sm">
                  As {username}, your journey begins...
                </p>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex items-center justify-between w-full max-w-md mt-8"
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
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg hover:shadow-purple-500/30'
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
