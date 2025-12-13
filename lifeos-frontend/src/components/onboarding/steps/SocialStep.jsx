import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ChevronRight, ChevronLeft, Users, Mail, Copy, Check,
  Share2, UserPlus, MessageCircle
} from 'lucide-react';
import { useNewOnboardingStore } from '../../../stores/newOnboardingStore';

export default function SocialStep({ onNext, onPrev, onSkip, canSkip, isTransitioning }) {
  const {
    profile,
    addInvitedFriend,
    skipSocial,
    isDialogueComplete,
    setNovaState,
    addOnboardingXP,
  } = useNewOnboardingStore();

  const [email, setEmail] = useState('');
  const [invitedEmails, setInvitedEmails] = useState([]);
  const [emailError, setEmailError] = useState('');
  const [copied, setCopied] = useState(false);

  const dialogueComplete = isDialogueComplete();

  // Generate a shareable invite link (mock for now)
  const inviteLink = `https://lifeos.app/invite/${profile.username || 'user'}`;

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleInvite = () => {
    if (!email) {
      setEmailError('Please enter an email');
      return;
    }
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email');
      return;
    }
    if (invitedEmails.includes(email)) {
      setEmailError('Already invited');
      return;
    }

    setInvitedEmails(prev => [...prev, email]);
    addInvitedFriend({ email, invitedAt: new Date().toISOString() });
    setEmail('');
    setEmailError('');
    setNovaState('celebrating');
    addOnboardingXP(10); // XP for each invite
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setNovaState('excited');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSkip = () => {
    skipSocial();
    onSkip();
  };

  const handleContinue = () => {
    if (invitedEmails.length > 0) {
      addOnboardingXP(15); // Bonus XP for inviting friends
    }
    onNext();
  };

  return (
    <div className="flex flex-col items-center">
      {/* Title */}
      {dialogueComplete && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-500">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            Invite Friends
          </h1>
          <p className="text-white/60 max-w-md mx-auto">
            The journey is more fun with companions. Invite friends to join your adventure!
          </p>
        </motion.div>
      )}

      {dialogueComplete && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md space-y-6"
        >
          {/* Email invite */}
          <div className="bg-[#1a1724]/80 rounded-2xl p-6 border border-white/10">
            <div className="flex items-center gap-3 mb-4">
              <Mail className="w-5 h-5 text-purple-400" />
              <h3 className="font-semibold text-white">Invite by Email</h3>
            </div>

            <div className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailError('');
                }}
                placeholder="friend@email.com"
                className={`
                  flex-1 px-4 py-3 bg-white/5 border rounded-xl
                  text-white placeholder:text-white/30
                  focus:outline-none focus:ring-2 transition-all
                  ${emailError
                    ? 'border-red-500/50 focus:ring-red-500/30'
                    : 'border-white/10 focus:border-purple-500/50 focus:ring-purple-500/30'
                  }
                `}
                onKeyPress={(e) => e.key === 'Enter' && handleInvite()}
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleInvite}
                className="px-4 py-3 bg-purple-500 hover:bg-purple-600 rounded-xl transition-colors"
              >
                <UserPlus className="w-5 h-5 text-white" />
              </motion.button>
            </div>

            {emailError && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-400 text-sm mt-2"
              >
                {emailError}
              </motion.p>
            )}

            {/* Invited list */}
            {invitedEmails.length > 0 && (
              <div className="mt-4 space-y-2">
                {invitedEmails.map((invEmail, index) => (
                  <motion.div
                    key={invEmail}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-2 text-sm text-white/70"
                  >
                    <Check className="w-4 h-4 text-green-400" />
                    <span>{invEmail}</span>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Share link */}
          <div className="bg-[#1a1724]/80 rounded-2xl p-6 border border-white/10">
            <div className="flex items-center gap-3 mb-4">
              <Share2 className="w-5 h-5 text-blue-400" />
              <h3 className="font-semibold text-white">Share Your Link</h3>
            </div>

            <div className="flex gap-2">
              <div className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white/50 text-sm truncate">
                {inviteLink}
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCopyLink}
                className={`
                  px-4 py-3 rounded-xl transition-all
                  ${copied
                    ? 'bg-green-500'
                    : 'bg-blue-500 hover:bg-blue-600'
                  }
                `}
              >
                {copied ? (
                  <Check className="w-5 h-5 text-white" />
                ) : (
                  <Copy className="w-5 h-5 text-white" />
                )}
              </motion.button>
            </div>
          </div>

          {/* Motivation message */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center text-white/50 text-sm"
          >
            <MessageCircle className="w-5 h-5 inline-block mr-2 opacity-50" />
            Friends who use LifeOS together are 3x more likely to achieve their goals!
          </motion.div>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-4">
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
                  onClick={handleSkip}
                  className="px-4 py-2 text-white/40 hover:text-white/60 transition-colors text-sm"
                >
                  Skip for now
                </button>
              )}

              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={handleContinue}
                disabled={isTransitioning}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
              >
                <span>Continue</span>
                <ChevronRight className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
