import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, ChevronRight, ChevronLeft, Check, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { useNewOnboardingStore } from '../../../stores/newOnboardingStore';
import { useAvatarStore } from '../../../stores/avatarStore';
import { useSocialStore } from '../../../stores/socialStore';

export default function ProfileSetupStep({ onNext, onPrev, isTransitioning }) {
  const {
    profile,
    updateProfile,
    gamificationMode,
    isDialogueComplete,
    setNovaState,
    addOnboardingXP,
  } = useNewOnboardingStore();

  const { setCharacterGender, getHeroSpritePath } = useAvatarStore();
  const { checkUsernameAvailable, updateUsername } = useSocialStore();

  const [username, setUsername] = useState(profile.username || '');
  const [displayName, setDisplayName] = useState(profile.displayName || '');
  const [gender, setGender] = useState(profile.gender || null);
  const [usernameError, setUsernameError] = useState('');
  const [usernameAvailable, setUsernameAvailable] = useState(null); // null = unchecked, true = available, false = taken
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [step, setStep] = useState(1); // 1: name, 2: gender

  const dialogueComplete = isDialogueComplete();

  // Validate username format
  const validateUsername = (value) => {
    if (value.length < 3) {
      return 'Username must be at least 3 characters';
    }
    if (value.length > 30) {
      return 'Username must be less than 30 characters';
    }
    if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(value)) {
      return 'Must start with a letter and contain only letters, numbers, and underscores';
    }
    return '';
  };

  // Debounced username availability check
  useEffect(() => {
    const error = validateUsername(username);
    if (error || username.length < 3) {
      setUsernameAvailable(null);
      return;
    }

    setCheckingUsername(true);
    const timeoutId = setTimeout(async () => {
      try {
        const result = await checkUsernameAvailable(username);
        setUsernameAvailable(result.available);
        if (!result.available && result.error) {
          setUsernameError(result.error);
        }
      } catch (err) {
        console.error('Error checking username:', err);
      } finally {
        setCheckingUsername(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [username, checkUsernameAvailable]);

  const handleUsernameChange = (e) => {
    const value = e.target.value;
    setUsername(value);
    const error = validateUsername(value);
    setUsernameError(error);
    if (error) {
      setUsernameAvailable(null);
    }
  };

  const handleContinueToGender = async () => {
    const error = validateUsername(username);
    if (error) {
      setUsernameError(error);
      return;
    }
    if (usernameAvailable === false) {
      setUsernameError('This username is already taken');
      return;
    }

    // Save username to database
    try {
      const result = await updateUsername(username);
      if (!result.success) {
        setUsernameError(result.error || 'Failed to save username');
        return;
      }
    } catch (err) {
      console.error('Error saving username:', err);
      // Continue anyway - the username will be saved in local state
    }

    updateProfile({ username, displayName: displayName || username });
    setStep(2);
    setNovaState('thinking');
  };

  const handleSelectGender = (selectedGender) => {
    setGender(selectedGender);
    updateProfile({ gender: selectedGender });
    setCharacterGender(selectedGender === 'male' ? 'male' : 'female');
    setNovaState('excited');
  };

  const handleComplete = () => {
    if (!gender) return;
    addOnboardingXP(25); // Award XP for completing profile
    onNext();
  };

  const canProceedStep1 = username.length >= 3 && !usernameError && usernameAvailable !== false && !checkingUsername;
  const canProceedStep2 = gender !== null;

  // Get avatar preview
  const avatarPreview = gender
    ? getHeroSpritePath(1, 'Dreamer')
    : null;

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
            {step === 1 ? 'Create Your Identity' : 'Choose Your Path'}
          </h1>
          <p className="text-white/60">
            {step === 1
              ? 'How will you be known in the cosmos?'
              : 'Select your avatar style'
            }
          </p>
        </motion.div>
      )}

      {/* Step 1: Username & Display Name */}
      <AnimatePresence mode="wait">
        {dialogueComplete && step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="w-full max-w-md space-y-6"
          >
            {/* Username Input */}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Username <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-white/40">@</span>
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={handleUsernameChange}
                  placeholder="your_username"
                  className={`
                    w-full pl-10 pr-12 py-3 bg-[#1a1724] border rounded-xl
                    text-white placeholder:text-white/30
                    focus:outline-none focus:ring-2 transition-all
                    ${usernameError || usernameAvailable === false
                      ? 'border-red-500/50 focus:ring-red-500/30'
                      : usernameAvailable === true
                        ? 'border-green-500/50 focus:ring-green-500/30'
                        : 'border-white/10 focus:border-purple-500/50 focus:ring-purple-500/30'
                    }
                  `}
                  maxLength={30}
                />
                {/* Availability status indicator */}
                {username.length >= 3 && !usernameError && (
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                    {checkingUsername ? (
                      <Loader2 className="w-5 h-5 text-white/40 animate-spin" />
                    ) : usernameAvailable === true ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : usernameAvailable === false ? (
                      <XCircle className="w-5 h-5 text-red-500" />
                    ) : null}
                  </div>
                )}
              </div>
              {usernameError ? (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-sm mt-2"
                >
                  {usernameError}
                </motion.p>
              ) : usernameAvailable === true && username.length >= 3 ? (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-green-400 text-sm mt-2"
                >
                  Username is available!
                </motion.p>
              ) : usernameAvailable === false ? (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-sm mt-2"
                >
                  This username is already taken
                </motion.p>
              ) : null}
              <p className="text-white/40 text-xs mt-1">
                Friends can find you by your username
              </p>
            </div>

            {/* Display Name Input */}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Display Name <span className="text-white/40">(optional)</span>
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder={username || 'How friends see you'}
                className="
                  w-full px-4 py-3 bg-[#1a1724] border border-white/10 rounded-xl
                  text-white placeholder:text-white/30
                  focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/30
                  transition-all
                "
                maxLength={30}
              />
            </div>

            {/* Continue Button */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              onClick={handleContinueToGender}
              disabled={!canProceedStep1 || isTransitioning}
              className={`
                w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold
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
          </motion.div>
        )}

        {/* Step 2: Gender Selection */}
        {dialogueComplete && step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="w-full max-w-2xl"
          >
            {/* Gender Cards */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              {/* Hero (Male) */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                onClick={() => handleSelectGender('male')}
                className={`
                  relative p-6 rounded-2xl text-center transition-all duration-300
                  ${gender === 'male'
                    ? 'bg-blue-500/20 border-2 border-blue-500/50 scale-[1.02]'
                    : 'bg-[#1a1724]/80 border border-white/10 hover:border-white/20'
                  }
                `}
              >
                {gender === 'male' && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
                  >
                    <Check className="w-4 h-4 text-white" />
                  </motion.div>
                )}

                {/* Avatar Preview */}
                <div className="w-32 h-32 mx-auto mb-4 relative">
                  <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl" />
                  <img
                    src="/assets/avatar/evolution/hero_v3_stage_1_dreamer.png"
                    alt="Hero"
                    className="w-full h-full object-contain relative z-10"
                    style={{ imageRendering: 'pixelated' }}
                  />
                </div>

                <h3 className="text-xl font-bold text-white mb-1">Hero</h3>
                <p className="text-white/60 text-sm">
                  Walk the path of the valiant hero
                </p>
              </motion.button>

              {/* Heroine (Female) */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                onClick={() => handleSelectGender('female')}
                className={`
                  relative p-6 rounded-2xl text-center transition-all duration-300
                  ${gender === 'female'
                    ? 'bg-pink-500/20 border-2 border-pink-500/50 scale-[1.02]'
                    : 'bg-[#1a1724]/80 border border-white/10 hover:border-white/20'
                  }
                `}
              >
                {gender === 'female' && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
                  >
                    <Check className="w-4 h-4 text-white" />
                  </motion.div>
                )}

                {/* Avatar Preview */}
                <div className="w-32 h-32 mx-auto mb-4 relative">
                  <div className="absolute inset-0 bg-pink-500/20 rounded-full blur-xl" />
                  <img
                    src="/assets/avatar/evolution/heroine_v3_stage_1_dreamer.png"
                    alt="Heroine"
                    className="w-full h-full object-contain relative z-10"
                    style={{ imageRendering: 'pixelated' }}
                  />
                </div>

                <h3 className="text-xl font-bold text-white mb-1">Heroine</h3>
                <p className="text-white/60 text-sm">
                  Walk the path of the brave heroine
                </p>
              </motion.button>
            </div>

            {/* Navigation Buttons */}
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
                animate={{ opacity: canProceedStep2 ? 1 : 0.5 }}
                onClick={handleComplete}
                disabled={!canProceedStep2 || isTransitioning}
                className={`
                  flex items-center gap-2 px-8 py-3 rounded-xl font-semibold
                  transition-all duration-200
                  ${canProceedStep2
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg hover:scale-[1.02]'
                    : 'bg-white/5 text-white/30 cursor-not-allowed'
                  }
                `}
              >
                <span>Continue</span>
                <ChevronRight className="w-5 h-5" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Back button for step 1 */}
      {dialogueComplete && step === 1 && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          onClick={onPrev}
          className="mt-6 flex items-center gap-2 text-white/40 hover:text-white/60 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back</span>
        </motion.button>
      )}
    </div>
  );
}
