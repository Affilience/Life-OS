import React, { useState, useEffect } from 'react';
import {
  X,
  Trophy,
  User,
  Check,
  AlertCircle,
  Loader2,
  Eye,
  Shield,
  Zap,
  Flame,
} from 'lucide-react';
import { useSocialStore } from '../../stores/socialStore';
import { useGamificationStore } from '../../stores/gamificationStore';

export default function JoinLeaderboardModal({ isOpen, onClose }) {
  const [username, setUsername] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [isJoining, setIsJoining] = useState(false);
  const [step, setStep] = useState(1); // 1: username, 2: confirm

  const {
    socialProfile,
    updateSocialProfile,
    updateUsername,
    checkUsernameAvailable,
    syncToLeaderboards,
  } = useSocialStore();

  const { level, totalXP, globalStreak } = useGamificationStore();
  const currentStreak = globalStreak?.current_streak || 0;

  // Initialize username from profile if exists
  useEffect(() => {
    if (isOpen && socialProfile?.username) {
      setUsername(socialProfile.username);
      setUsernameAvailable(true);
      setStep(2); // Skip to confirm if they already have a username
    } else if (isOpen) {
      setUsername('');
      setUsernameAvailable(null);
      setStep(1);
    }
  }, [isOpen, socialProfile]);

  // Debounced username check
  useEffect(() => {
    if (!username || username.length < 3) {
      setUsernameAvailable(null);
      setUsernameError('');
      return;
    }

    // Validate format
    if (!/^[a-zA-Z][a-zA-Z0-9_]{2,29}$/.test(username)) {
      setUsernameError('Must start with a letter and contain only letters, numbers, and underscores');
      setUsernameAvailable(false);
      return;
    }

    // If it's the current username, it's available
    if (socialProfile?.username?.toLowerCase() === username.toLowerCase()) {
      setUsernameAvailable(true);
      setUsernameError('');
      return;
    }

    const timer = setTimeout(async () => {
      setIsCheckingUsername(true);
      const result = await checkUsernameAvailable(username);
      setUsernameAvailable(result.available);
      setUsernameError(result.error || '');
      setIsCheckingUsername(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [username, socialProfile, checkUsernameAvailable]);

  const handleNext = async () => {
    if (step === 1) {
      // Save username if changed
      if (username !== socialProfile?.username) {
        setIsJoining(true);
        const result = await updateUsername(username);
        setIsJoining(false);

        if (result.error) {
          setUsernameError(result.error);
          return;
        }
      }
      setStep(2);
    }
  };

  const handleJoinLeaderboards = async () => {
    setIsJoining(true);

    // Update profile to show on leaderboards
    await updateSocialProfile({ show_on_leaderboards: true });

    // Sync current stats to leaderboards
    await syncToLeaderboards(totalXP, 0, currentStreak);

    setIsJoining(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-[#1a1724] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-purple-600/20 to-pink-600/20 px-6 py-5 border-b border-white/10">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/40 hover:text-white/80 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Join Leaderboards</h2>
              <p className="text-sm text-white/60">Compete with other users</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <p className="text-white/70 text-sm mb-4">
                  Choose a unique username that will be displayed on the leaderboards. Other users can find you by this name.
                </p>

                {/* Username Input */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-white/80">
                    Username
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2">
                      <User className="w-5 h-5 text-white/40" />
                    </div>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.replace(/\s/g, ''))}
                      placeholder="your_username"
                      className={`w-full pl-10 pr-10 py-3 bg-white/5 border rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 transition-all ${
                        usernameError
                          ? 'border-red-500/50 focus:ring-red-500/30'
                          : usernameAvailable === true
                            ? 'border-green-500/50 focus:ring-green-500/30'
                            : 'border-white/10 focus:ring-purple-500/30 focus:border-purple-500/50'
                      }`}
                      maxLength={30}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {isCheckingUsername && (
                        <Loader2 className="w-5 h-5 text-white/40 animate-spin" />
                      )}
                      {!isCheckingUsername && usernameAvailable === true && (
                        <Check className="w-5 h-5 text-green-400" />
                      )}
                      {!isCheckingUsername && usernameAvailable === false && username.length >= 3 && (
                        <AlertCircle className="w-5 h-5 text-red-400" />
                      )}
                    </div>
                  </div>
                  {usernameError && (
                    <p className="text-sm text-red-400">{usernameError}</p>
                  )}
                  {usernameAvailable === true && !usernameError && username !== socialProfile?.username && (
                    <p className="text-sm text-green-400">Username is available!</p>
                  )}
                  <p className="text-xs text-white/40">
                    3-30 characters, letters, numbers, and underscores only
                  </p>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <p className="text-white/70 text-sm">
                Your stats will be visible on the global leaderboards. You can opt-out at any time from settings.
              </p>

              {/* Preview Stats */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-3 pb-3 border-b border-white/10">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center text-lg">
                    {socialProfile?.display_name?.[0] || username?.[0] || '?'}
                  </div>
                  <div>
                    <p className="font-medium text-white">{socialProfile?.display_name || 'You'}</p>
                    <p className="text-sm text-white/50">@{username || socialProfile?.username}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="flex items-center justify-center gap-1 text-purple-400 mb-1">
                      <Zap className="w-4 h-4" />
                    </div>
                    <p className="text-lg font-bold text-white">{totalXP.toLocaleString()}</p>
                    <p className="text-xs text-white/50">Total XP</p>
                  </div>
                  <div>
                    <div className="flex items-center justify-center gap-1 text-blue-400 mb-1">
                      <Shield className="w-4 h-4" />
                    </div>
                    <p className="text-lg font-bold text-white">{level}</p>
                    <p className="text-xs text-white/50">Level</p>
                  </div>
                  <div>
                    <div className="flex items-center justify-center gap-1 text-orange-400 mb-1">
                      <Flame className="w-4 h-4" />
                    </div>
                    <p className="text-lg font-bold text-white">{currentStreak}</p>
                    <p className="text-xs text-white/50">Streak</p>
                  </div>
                </div>
              </div>

              {/* What's visible */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-white/80 flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  What others will see:
                </p>
                <ul className="text-sm text-white/60 space-y-1 pl-6">
                  <li>• Your username and display name</li>
                  <li>• Your level and total XP</li>
                  <li>• Your current streak</li>
                  <li>• Your rank position</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-white/5 border-t border-white/10 flex gap-3">
          {step === 1 ? (
            <>
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white/70 rounded-xl font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleNext}
                disabled={!usernameAvailable || isJoining}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isJoining ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Continue'
                )}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white/70 rounded-xl font-medium transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleJoinLeaderboards}
                disabled={isJoining}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isJoining ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Joining...
                  </>
                ) : (
                  <>
                    <Trophy className="w-4 h-4" />
                    Join Leaderboards
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
