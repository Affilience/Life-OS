/**
 * Nova-Guided Onboarding - Premium onboarding experience
 *
 * Features:
 * - Conversational AI-powered setup with Nova
 * - Impressive cosmic animations between stages
 * - Nova "flying" between sections
 * - Particle effects and celebrations
 * - Progressive disclosure with real-time personalization
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Sparkles,
  Zap,
  Target,
  Trophy,
  Flame,
  Star,
  Gift,
  ChevronRight,
  MessageCircle,
  Send,
  Rocket,
  Heart,
  Brain,
  Wallet,
  Calendar,
  BookOpen,
  Compass,
  User,
  Users,
  Mail,
  Copy,
  ShoppingBag,
  Lock
} from 'lucide-react';
import confetti from 'canvas-confetti';
import useIntegratedOnboardingStore, { GOAL_MODULES } from '../../stores/integratedOnboardingStore';
import { useGamificationStore } from '../../stores/gamificationStore';
import { useGamificationModeStore } from '../../stores/gamificationModeStore';
import { useAvatarStore } from '../../stores/avatarStore';
import useDailyTasksStore from '../../stores/dailyTasksStore';
import StarfieldBackground from './StarfieldBackground';
import './NovaGuidedOnboarding.css';

// Goal configurations with icons
const GOALS = [
  {
    id: 'productivity',
    label: 'Get More Done',
    icon: Target,
    emoji: '🎯',
    description: 'Tasks, projects & deep work',
    benefit: 'Average users complete 40% more tasks',
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, #f59e0b, #d97706)'
  },
  {
    id: 'health',
    label: 'Get Healthier',
    icon: Heart,
    emoji: '💪',
    description: 'Nutrition, fitness & wellness',
    benefit: 'Track calories, workouts & sleep',
    color: '#10b981',
    gradient: 'linear-gradient(135deg, #10b981, #059669)'
  },
  {
    id: 'learning',
    label: 'Learn & Grow',
    icon: Brain,
    emoji: '📚',
    description: 'Skills and knowledge',
    benefit: 'Build expertise systematically',
    color: '#8b5cf6',
    gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)'
  },
  {
    id: 'financial',
    label: 'Manage Money',
    icon: Wallet,
    emoji: '💰',
    description: 'Budget and savings',
    benefit: 'Users save 23% more on average',
    color: '#22c55e',
    gradient: 'linear-gradient(135deg, #22c55e, #16a34a)'
  },
  {
    id: 'journal',
    label: 'Reflect & Journal',
    icon: BookOpen,
    emoji: '📝',
    description: 'Mood and thoughts',
    benefit: 'Increase self-awareness daily',
    color: '#06b6d4',
    gradient: 'linear-gradient(135deg, #06b6d4, #0891b2)'
  },
  {
    id: 'habits',
    label: 'Build Habits',
    icon: Flame,
    emoji: '🔥',
    description: 'Streaks and routines',
    benefit: '21-day streaks build lasting habits',
    color: '#ef4444',
    gradient: 'linear-gradient(135deg, #ef4444, #dc2626)'
  },
  {
    id: 'balance',
    label: 'Find Balance',
    icon: Compass,
    emoji: '⚖️',
    description: 'Purpose and values',
    benefit: 'Align actions with what matters',
    color: '#a855f7',
    gradient: 'linear-gradient(135deg, #a855f7, #9333ea)'
  }
];

// Nova's dialogue variations
const NOVA_DIALOGUES = {
  welcome: [
    "Hi there! I'm Nova, your AI companion. ✨",
    "Together, we'll build the life you've always wanted.",
    "This will only take a couple minutes. Ready?"
  ],
  modeIntro: "First, how would you like to experience Ascynt?",
  modeReactions: {
    cosmic: "Excellent choice! Embrace the full cosmic experience - XP, evolution, and glory await!",
    minimal: "Pure and simple. Let's focus on what matters most without distractions.",
  },
  profileIntro: "Now let's create your identity. What should I call you?",
  profileComplete: "A powerful identity! The cosmos recognizes you now.",
  goalsIntro: "What matters most to you right now? Pick up to 3 priorities.",
  goalReactions: {
    productivity: "Great choice! I'll help you stay focused and get things done.",
    health: "Love it! Your health is your greatest asset.",
    learning: "Knowledge is power! Let's grow together.",
    financial: "Smart thinking! Financial freedom awaits.",
    journal: "Reflection is the key to growth.",
    habits: "Consistency is everything. Let's build those streaks!",
    balance: "Finding harmony in life is beautiful."
  },
  commitmentIntro: "How much time can you commit each day? Be realistic – consistency beats intensity.",
  tourIntro: "Let me show you the magic that powers your journey...",
  tourSections: {
    xp: "This is XP - the lifeblood of your evolution. Complete tasks, build habits, and watch yourself grow.",
    avatar: "Your avatar evolves through 40 stages. From humble Dreamer to legendary Avatar of Mastery!",
    skills: "The skill constellation awaits. Each skill you develop lights up your cosmic map.",
    bazaar: "The Cosmic Bazaar offers rewards for your dedication. Here's 100 credits to start!"
  },
  quickWinIntro: "Let's start with a quick win! What's ONE thing you want to accomplish today?",
  socialIntro: "The cosmos is vast, but you need not walk alone...",
  socialSkip: "No worries! Your friends await when you're ready.",
  complete: [
    "You're all set! 🎉",
    "I'll be here whenever you need me.",
    "Let's make every day count!"
  ]
};

// Gamification tour sections
const TOUR_SECTIONS = [
  {
    id: 'xp',
    title: 'Experience Points (XP)',
    icon: Sparkles,
    color: '#fbbf24',
    gradient: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
    description: 'Every action earns you XP. Complete tasks, maintain streaks, and watch yourself level up!',
  },
  {
    id: 'avatar',
    title: 'Avatar Evolution',
    icon: User,
    color: '#a855f7',
    gradient: 'linear-gradient(135deg, #a855f7, #ec4899)',
    description: 'Your avatar evolves through 40 unique stages as you progress.',
  },
  {
    id: 'skills',
    title: 'Skill Constellation',
    icon: Star,
    color: '#3b82f6',
    gradient: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
    description: 'Unlock stars in your skill constellation. Each skill you develop lights up the cosmic map.',
  },
  {
    id: 'bazaar',
    title: 'Cosmic Bazaar',
    icon: ShoppingBag,
    color: '#10b981',
    gradient: 'linear-gradient(135deg, #10b981, #14b8a6)',
    description: 'Spend your earned cosmic credits on equipment, consumables, and rewards.',
  },
];

// Commitment options (XP kept low - onboarding shouldn't level up the user)
const COMMITMENT_OPTIONS = [
  { id: 'casual', label: 'Casual', minutes: 5, description: '5 min/day', icon: '🌱', xp: 5 },
  { id: 'regular', label: 'Regular', minutes: 10, description: '10 min/day', icon: '🌿', recommended: true, xp: 10 },
  { id: 'serious', label: 'Serious', minutes: 15, description: '15 min/day', icon: '🌳', xp: 15 },
  { id: 'intense', label: 'Intense', minutes: 20, description: '20 min/day', icon: '🔥', xp: 20 }
];

// Onboarding steps - full flow with profile, gamification tour, and social
const STEPS = [
  'intro',        // 0 - Cosmic logo animation
  'welcome',      // 1 - Nova introduces herself
  'mode',         // 2 - Cosmic vs Minimal
  'profile',      // 3 - Username + Display Name
  'goals',        // 4 - Select priorities
  'commitment',   // 5 - Daily time commitment
  'tour',         // 6 - Gamification tour (XP, Avatar, Skills, Bazaar)
  'quickWin',     // 7 - First task
  'social',       // 8 - Invite friends
  'launch'        // 9 - Celebration
];

// Gamification mode options (simplified: full experience or minimal)
const MODE_OPTIONS = [
  {
    id: 'cosmic',
    name: 'Full Experience',
    tagline: 'Complete Adventure',
    description: 'XP, avatar evolution, equipment, quests, achievements, and cosmic celebrations.',
    icon: Sparkles,
    emoji: '✨',
    color: '#a855f7',
    gradient: 'linear-gradient(135deg, #a855f7, #ec4899)',
    features: ['40 Evolution Stages', 'Equipment & Stats', 'Quests & Achievements', 'Cosmic Rewards'],
  },
  {
    id: 'minimal',
    name: 'Minimal',
    tagline: 'Pure Productivity',
    description: 'Clean, distraction-free tracking. Gamification bonuses still apply silently.',
    icon: Target,
    emoji: '🎯',
    color: '#6b7280',
    gradient: 'linear-gradient(135deg, #6b7280, #4b5563)',
    features: ['Clean Interface', 'Essential Stats', 'Silent Bonuses', 'No Distractions'],
  },
];

// ============ ANIMATION VARIANTS ============
// Optimized: Removed blur filter (GPU-intensive), using simpler transforms

const cosmicTransition = {
  initial: {
    opacity: 0,
    scale: 0.95,
    y: 10
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.35,
      ease: [0.22, 1, 0.36, 1]
    }
  },
  exit: {
    opacity: 0,
    scale: 1.02,
    y: -10,
    transition: {
      duration: 0.25,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

// Simplified variants for better performance
const novaFlyVariants = {
  idle: {},
  flying: { opacity: 0, transition: { duration: 0.3 } },
  arriving: { opacity: 1, transition: { duration: 0.3 } },
  celebrating: {}
};

// Simplified stagger animations - reduced delay and simpler transforms
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  }
};

const staggerItem = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: 'easeOut' }
  }
};

// ============ PARTICLE SYSTEM ============
// Optimized: Uses CSS animations instead of framer-motion for better performance

const CosmicParticles = React.memo(function CosmicParticles({ active, count = 12 }) {
  // Memoize particles to prevent recreation on each render
  const particles = React.useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      size: Math.random() * 3 + 1.5,
      delay: Math.random() * 3,
      duration: Math.random() * 2 + 3,
      x: Math.random() * 100,
      y: Math.random() * 100
    })), [count]
  );

  if (!active) return null;

  return (
    <div className="cosmic-particles">
      {particles.map((p) => (
        <div
          key={p.id}
          className="cosmic-particle cosmic-particle-animated"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
            '--particle-delay': `${p.delay}s`,
            '--particle-duration': `${p.duration}s`
          }}
        />
      ))}
    </div>
  );
});

// ============ FLOATING PARTICLES ============
// Premium floating particles that rise from bottom - adds depth to backgrounds

const FloatingParticles = React.memo(function FloatingParticles({ count = 20, active = true }) {
  const particles = React.useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      size: Math.random() * 4 + 2,
      x: Math.random() * 100,
      delay: Math.random() * 8,
      duration: Math.random() * 6 + 8,
      color: Math.random() > 0.7 ? 'purple' : 'white'
    })), [count]
  );

  if (!active) return null;

  return (
    <div className="floating-particles-container">
      {particles.map((p) => (
        <div
          key={p.id}
          className={`floating-particle floating-particle-${p.color}`}
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`
          }}
        />
      ))}
    </div>
  );
});

// ============ NOVA AVATAR COMPONENT ============
// Optimized: Uses CSS animations instead of framer-motion for idle state

const NovaAvatar = React.memo(function NovaAvatar({ state = 'idle', size = 'large', showGlow = true, className = '' }) {
  const imageSrc = '/assets/nova/nova_stellar.png';

  const sizeClasses = {
    small: 'nova-avatar-small',
    medium: 'nova-avatar-medium',
    large: 'nova-avatar-large'
  };

  return (
    <div className={`nova-avatar-wrapper ${sizeClasses[size]} ${className} nova-avatar-${state}`}>
      {showGlow && (
        <div className="nova-glow-effect nova-glow-animated" />
      )}
      <img
        src={imageSrc}
        alt="Nova"
        className="nova-avatar-img nova-float-animated"
      />
      {state === 'celebrating' && (
        <div className="nova-celebration-ring nova-celebration-animated" />
      )}
    </div>
  );
});

// ============ SPEECH BUBBLE COMPONENT ============

function NovaSpeechBubble({ messages, isTyping = false, onComplete }) {
  const [displayedText, setDisplayedText] = useState('');
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const message = Array.isArray(messages) ? messages[currentMessageIndex] : messages;
    if (!message) return;

    let index = 0;
    setDisplayedText('');
    setIsComplete(false);

    const interval = setInterval(() => {
      if (index <= message.length) {
        setDisplayedText(message.slice(0, index));
        index++;
      } else {
        clearInterval(interval);
        setIsComplete(true);

        // Move to next message if array
        if (Array.isArray(messages) && currentMessageIndex < messages.length - 1) {
          setTimeout(() => {
            setCurrentMessageIndex(prev => prev + 1);
          }, 1500);
        } else if (onComplete) {
          setTimeout(onComplete, 500);
        }
      }
    }, 30);

    return () => clearInterval(interval);
  }, [messages, currentMessageIndex]);

  return (
    <motion.div
      className="nova-speech-bubble-enhanced"
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <p>
        {displayedText}
        {!isComplete && <span className="typing-cursor">|</span>}
      </p>
      <motion.div
        className="speech-bubble-tail"
        animate={{ rotate: [0, 2, -2, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </motion.div>
  );
}

// ============ INTRO ANIMATION ============
// Premium cinematic intro with multiple orbital rings, particle bursts, and letter-by-letter reveal

function IntroAnimation({ onComplete }) {
  const [phase, setPhase] = useState(0);
  const letters = "Ascynt".split('');

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 300),   // Start particles
      setTimeout(() => setPhase(2), 800),   // Show logo
      setTimeout(() => setPhase(3), 1600),  // Show title
      setTimeout(() => setPhase(4), 2800),  // Show tagline
      setTimeout(onComplete, 4000)          // Complete
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <motion.div
      className="intro-animation premium-intro"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1 }}
      transition={{ exit: { duration: 0.5 } }}
    >
      {/* Multiple expanding rings */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={`ring-${i}`}
          className="cosmic-ring-premium"
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: phase >= 1 ? [0, 1.5 + i * 0.5, 3 + i] : 0,
            opacity: phase >= 1 ? [0, 0.6 - i * 0.15, 0] : 0
          }}
          transition={{
            duration: 2.5 + i * 0.3,
            delay: i * 0.2,
            ease: [0.22, 1, 0.36, 1]
          }}
        />
      ))}

      {/* Central glow pulse */}
      <motion.div
        className="intro-central-glow"
        initial={{ scale: 0, opacity: 0 }}
        animate={{
          scale: phase >= 2 ? [0.5, 1.2, 1] : 0,
          opacity: phase >= 2 ? [0, 1, 0.8] : 0
        }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
      />

      <motion.div className="intro-content">
        {/* Logo Icon with orbiting elements */}
        <AnimatePresence mode="wait">
          {phase >= 2 && (
            <motion.div
              key="logo"
              className="intro-logo-premium"
              initial={{ opacity: 0, scale: 0, rotate: -180 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{
                duration: 1,
                ease: [0.22, 1, 0.36, 1],
                scale: { type: 'spring', damping: 15, stiffness: 100 }
              }}
            >
              {/* Orbiting particles around logo */}
              <div className="logo-orbit-container">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <motion.div
                    key={`orbit-${i}`}
                    className="orbiting-particle"
                    style={{ '--orbit-index': i }}
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 3 + i * 0.5,
                      repeat: Infinity,
                      ease: 'linear',
                      delay: i * 0.1
                    }}
                  />
                ))}
              </div>
              <motion.div
                className="logo-icon-premium"
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.1, 1]
                }}
                transition={{
                  rotate: { duration: 20, repeat: Infinity, ease: 'linear' },
                  scale: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
                }}
              >
                <Sparkles size={56} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Title with letter-by-letter reveal */}
        <AnimatePresence mode="wait">
          {phase >= 3 && (
            <motion.h1
              key="title"
              className="intro-title-premium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {letters.map((letter, idx) => (
                <motion.span
                  key={idx}
                  className="title-letter"
                  initial={{ opacity: 0, y: 50, rotateX: -90 }}
                  animate={{ opacity: 1, y: 0, rotateX: 0 }}
                  transition={{
                    duration: 0.5,
                    delay: idx * 0.08,
                    ease: [0.22, 1, 0.36, 1]
                  }}
                >
                  {letter}
                </motion.span>
              ))}
            </motion.h1>
          )}
        </AnimatePresence>

        {/* Tagline with fade up */}
        <AnimatePresence mode="wait">
          {phase >= 4 && (
            <motion.p
              key="tagline"
              className="intro-tagline-premium"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            >
              <motion.span
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Your Personal Operating System
              </motion.span>
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Bottom light sweep */}
      <motion.div
        className="intro-light-sweep"
        initial={{ x: '-100%', opacity: 0 }}
        animate={{
          x: phase >= 3 ? ['100%'] : '-100%',
          opacity: phase >= 3 ? [0, 0.6, 0] : 0
        }}
        transition={{ duration: 1.5, ease: 'easeInOut' }}
      />
    </motion.div>
  );
}

// ============ WELCOME STEP ============

function WelcomeStep({ onContinue, onSkip }) {
  const [dialogueComplete, setDialogueComplete] = useState(false);

  return (
    <motion.div
      className="onboarding-step welcome-step"
      variants={cosmicTransition}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="welcome-nova-section">
        <NovaAvatar state="idle" size="large" />
        <NovaSpeechBubble
          messages={NOVA_DIALOGUES.welcome}
          onComplete={() => setDialogueComplete(true)}
        />
      </div>

      <motion.div
        className="welcome-features"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: dialogueComplete ? 1 : 0.3, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="feature-showcase">
          {[
            { icon: Target, label: 'Goal Tracking', color: '#f59e0b' },
            { icon: Flame, label: 'Build Streaks', color: '#ef4444' },
            { icon: Trophy, label: 'Level Up', color: '#8b5cf6' }
          ].map((feature, idx) => (
            <motion.div
              key={feature.label}
              className="feature-item"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2 + idx * 0.15 }}
              style={{ '--feature-color': feature.color }}
            >
              <feature.icon size={20} />
              <span>{feature.label}</span>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="time-estimate"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5 }}
        >
          <Sparkles size={14} />
          <span>2 minutes to set up • Earn 100+ XP</span>
        </motion.div>
      </motion.div>

      <motion.div
        className="welcome-actions"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: dialogueComplete ? 1 : 0.5, y: 0 }}
        transition={{ delay: 3 }}
      >
        <motion.button
          className="primary-action-btn"
          onClick={onContinue}
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          disabled={!dialogueComplete}
        >
          <span>Let's Begin</span>
          <Rocket size={18} />
        </motion.button>
        <button className="skip-btn" onClick={onSkip}>
          Skip, I'll explore myself
        </button>
      </motion.div>
    </motion.div>
  );
}

// ============ MODE SELECTION STEP ============

function ModeStep({ selectedMode, onSelectMode, onContinue, onBack }) {
  const [novaReaction, setNovaReaction] = useState(null);

  const handleSelectMode = (modeId) => {
    onSelectMode(modeId);
    setNovaReaction(NOVA_DIALOGUES.modeReactions[modeId]);
  };

  return (
    <motion.div
      className="onboarding-step mode-step"
      variants={cosmicTransition}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="step-nova-header">
        <NovaAvatar state={selectedMode ? 'excited' : 'idle'} size="small" />
        <div className="nova-message-inline">
          <p>{novaReaction || NOVA_DIALOGUES.modeIntro}</p>
        </div>
      </div>

      <motion.div
        className="mode-options-container"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {MODE_OPTIONS.map((mode) => {
          const isSelected = selectedMode === mode.id;
          const ModeIcon = mode.icon;
          return (
            <motion.button
              key={mode.id}
              className={`mode-card-enhanced ${isSelected ? 'selected' : ''}`}
              onClick={() => handleSelectMode(mode.id)}
              variants={staggerItem}
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
              style={{ '--mode-color': mode.color, '--mode-gradient': mode.gradient }}
            >
              <div className="mode-card-glow" />
              <div className="mode-card-content">
                <div className="mode-icon-container">
                  <ModeIcon size={32} />
                  {isSelected && (
                    <motion.div
                      className="check-badge"
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', damping: 15 }}
                    >
                      <Check size={14} />
                    </motion.div>
                  )}
                </div>
                <div className="mode-info">
                  <span className="mode-name">{mode.name}</span>
                  <span className="mode-tagline">{mode.tagline}</span>
                  <span className="mode-desc">{mode.description}</span>
                </div>
                <div className="mode-features">
                  {mode.features.map((feature, idx) => (
                    <div key={idx} className="mode-feature">
                      <Check size={12} />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.button>
          );
        })}
      </motion.div>

      <div className="step-actions">
        <button className="back-action-btn" onClick={onBack}>
          <ArrowLeft size={18} />
        </button>
        <motion.button
          className="primary-action-btn"
          onClick={onContinue}
          disabled={!selectedMode}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <span>Continue</span>
          <ArrowRight size={18} />
        </motion.button>
      </div>
    </motion.div>
  );
}

// ============ GOALS STEP ============

function GoalsStep({ selectedGoals, onToggleGoal, onContinue, onBack }) {
  const [novaReaction, setNovaReaction] = useState(null);

  const handleGoalToggle = (goalId) => {
    onToggleGoal(goalId);
    const goal = GOALS.find(g => g.id === goalId);
    if (goal && !selectedGoals.includes(goalId)) {
      setNovaReaction(NOVA_DIALOGUES.goalReactions[goalId]);
      setTimeout(() => setNovaReaction(null), 2000);
    }
  };

  return (
    <motion.div
      className="onboarding-step goals-step"
      variants={cosmicTransition}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="step-nova-header">
        <NovaAvatar
          state={selectedGoals.length > 0 ? 'excited' : 'idle'}
          size="small"
        />
        <div className="nova-message-inline">
          <p>{novaReaction || NOVA_DIALOGUES.goalsIntro}</p>
        </div>
      </div>

      <motion.div
        className="goals-container"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {GOALS.map((goal) => {
          const isSelected = selectedGoals.includes(goal.id);
          const GoalIcon = goal.icon;
          return (
            <motion.button
              key={goal.id}
              className={`goal-card-enhanced ${isSelected ? 'selected' : ''}`}
              onClick={() => handleGoalToggle(goal.id)}
              variants={staggerItem}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              style={{ '--goal-color': goal.color, '--goal-gradient': goal.gradient }}
              disabled={selectedGoals.length >= 3 && !isSelected}
            >
              <div className="goal-card-glow" />
              <div className="goal-card-content">
                <div className="goal-icon-container">
                  <GoalIcon size={24} />
                  {isSelected && (
                    <motion.div
                      className="check-badge"
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', damping: 15 }}
                    >
                      <Check size={12} />
                    </motion.div>
                  )}
                </div>
                <div className="goal-info">
                  <span className="goal-label">{goal.label}</span>
                  <span className="goal-desc">{goal.description}</span>
                </div>
              </div>
            </motion.button>
          );
        })}
      </motion.div>

      <div className="selection-indicator">
        <div className="selection-dots">
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              className={`selection-dot ${i < selectedGoals.length ? 'filled' : ''}`}
              animate={i < selectedGoals.length ? { scale: [1, 1.3, 1] } : {}}
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>
        <span>{selectedGoals.length === 0 ? 'Select at least 1' : `${selectedGoals.length}/3 selected`}</span>
      </div>

      <div className="step-actions">
        <button className="back-action-btn" onClick={onBack}>
          <ArrowLeft size={18} />
        </button>
        <motion.button
          className="primary-action-btn"
          onClick={onContinue}
          disabled={selectedGoals.length === 0}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <span>Continue</span>
          <ArrowRight size={18} />
        </motion.button>
      </div>
    </motion.div>
  );
}

// ============ COMMITMENT STEP ============

function CommitmentStep({ selected, onSelect, onContinue, onBack, awardXP }) {
  return (
    <motion.div
      className="onboarding-step commitment-step"
      variants={cosmicTransition}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="step-nova-header">
        <NovaAvatar state="excited" size="small" />
        <div className="nova-message-inline">
          <p>{NOVA_DIALOGUES.commitmentIntro}</p>
        </div>
      </div>

      <motion.div
        className="commitment-grid"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {COMMITMENT_OPTIONS.map((option) => (
          <motion.button
            key={option.id}
            className={`commitment-card-enhanced ${selected === option.id ? 'selected' : ''} ${option.recommended ? 'recommended' : ''}`}
            onClick={() => {
              onSelect(option.id);
              if (selected !== option.id) {
                awardXP(option.xp, `${option.label} commitment!`);
              }
            }}
            variants={staggerItem}
            whileHover={{ scale: 1.03, y: -4 }}
            whileTap={{ scale: 0.98 }}
          >
            {option.recommended && (
              <motion.div
                className="recommended-label"
                animate={{ y: [0, -2, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Star size={10} />
                Recommended
              </motion.div>
            )}
            <motion.span
              className="commitment-emoji"
              animate={selected === option.id ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              {option.icon}
            </motion.span>
            <span className="commitment-name">{option.label}</span>
            <span className="commitment-time">{option.description}</span>
            {selected === option.id && (
              <motion.div
                className="selected-indicator"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 15 }}
              >
                <Check size={16} />
              </motion.div>
            )}
          </motion.button>
        ))}
      </motion.div>


      <div className="step-actions">
        <button className="back-action-btn" onClick={onBack}>
          <ArrowLeft size={18} />
        </button>
        <motion.button
          className="primary-action-btn"
          onClick={onContinue}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <span>I'm Committed</span>
          <ArrowRight size={18} />
        </motion.button>
      </div>
    </motion.div>
  );
}

// ============ QUICK WIN STEP ============

function QuickWinStep({ value, onChange, selectedGoals, onContinue, onBack }) {
  const suggestions = selectedGoals.slice(0, 3).map(goalId => {
    const suggestions = {
      productivity: 'Complete my most important task',
      health: 'Log my first meal',
      learning: 'Read for 10 minutes',
      financial: 'Review my spending',
      journal: 'Write a quick reflection',
      habits: 'Do a 5-minute habit',
      balance: 'Set one intention'
    };
    const goal = GOALS.find(g => g.id === goalId);
    return { goalId, text: suggestions[goalId], emoji: goal?.emoji };
  });

  return (
    <motion.div
      className="onboarding-step quickwin-step"
      variants={cosmicTransition}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="step-nova-header">
        <NovaAvatar state="excited" size="small" />
        <div className="nova-message-inline">
          <p>{NOVA_DIALOGUES.quickWinIntro}</p>
        </div>
      </div>

      <motion.div
        className="quickwin-input-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="input-wrapper">
          <Gift size={20} className="input-icon" />
          <input
            type="text"
            placeholder="e.g., Complete my most important task..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
            autoFocus
          />
        </div>
      </motion.div>

      <motion.div
        className="suggestion-section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <span className="suggestions-label">Quick suggestions:</span>
        <div className="suggestion-chips">
          {suggestions.map((s, idx) => (
            <motion.button
              key={s.goalId}
              className="suggestion-chip"
              onClick={() => onChange(s.text)}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 + idx * 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>{s.emoji}</span>
              {s.text}
            </motion.button>
          ))}
        </div>
      </motion.div>

      <motion.div
        className="xp-teaser"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <Zap size={14} />
        <span>Complete this today for <strong>+25 XP</strong>!</span>
      </motion.div>

      <div className="step-actions">
        <button className="back-action-btn" onClick={onBack}>
          <ArrowLeft size={18} />
        </button>
        <motion.button
          className="primary-action-btn"
          onClick={onContinue}
          disabled={!value.trim()}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <span>Set My Goal</span>
          <ArrowRight size={18} />
        </motion.button>
      </div>
    </motion.div>
  );
}

// ============ PROFILE STEP ============

function ProfileStep({ username, displayName, onUsernameChange, onDisplayNameChange, onGenderSelect, onContinue, onBack }) {
  const [usernameError, setUsernameError] = useState('');
  const { setCharacterGender } = useAvatarStore();

  const validateUsername = (value) => {
    if (value.length < 3) return 'At least 3 characters needed';
    if (value.length > 20) return 'Max 20 characters';
    if (!/^[a-zA-Z0-9_]+$/.test(value)) return 'Letters, numbers, underscores only';
    return '';
  };

  const handleUsernameInput = (e) => {
    const value = e.target.value;
    onUsernameChange(value);
    setUsernameError(validateUsername(value));
  };

  const handleContinue = () => {
    const error = validateUsername(username);
    if (error) {
      setUsernameError(error);
      return;
    }
    // Default to hero avatar (can be changed in Settings)
    onGenderSelect('male');
    setCharacterGender('male');
    onContinue();
  };

  const canProceed = username.length >= 3 && !usernameError;

  return (
    <motion.div
      className="onboarding-step profile-step"
      variants={cosmicTransition}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="step-nova-header">
        <NovaAvatar state="idle" size="small" />
        <div className="nova-message-inline">
          <p>{NOVA_DIALOGUES.profileIntro}</p>
        </div>
      </div>

      <motion.div
        className="profile-name-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="profile-inputs">
          <div className="input-group">
            <label>Username <span className="required">*</span></label>
            <div className="input-wrapper username-input">
              <span className="input-prefix">@</span>
              <input
                type="text"
                value={username}
                onChange={handleUsernameInput}
                placeholder="your_username"
                maxLength={20}
                autoFocus
              />
            </div>
            {usernameError && (
              <motion.span
                className="input-error"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {usernameError}
              </motion.span>
            )}
          </div>

          <div className="input-group">
            <label>Display Name <span className="optional">(optional)</span></label>
            <div className="input-wrapper">
              <User size={18} className="input-icon" />
              <input
                type="text"
                value={displayName}
                onChange={(e) => onDisplayNameChange(e.target.value)}
                placeholder={username || 'How friends see you'}
                maxLength={30}
              />
            </div>
          </div>
        </div>

        <div className="step-actions">
          <button className="back-action-btn" onClick={onBack}>
            <ArrowLeft size={18} />
          </button>
          <motion.button
            className="primary-action-btn"
            onClick={handleContinue}
            disabled={!canProceed}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span>Continue</span>
            <ArrowRight size={18} />
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ============ GAMIFICATION TOUR STEP ============

function GamificationTourStep({ selectedMode, onContinue, onBack, onSkip, awardXP }) {
  const [currentSection, setCurrentSection] = useState(0);
  const [sectionsViewed, setSectionsViewed] = useState(new Set());

  // Skip tour for minimal mode
  if (selectedMode === 'minimal') {
    return (
      <motion.div
        className="onboarding-step tour-step tour-skip"
        variants={cosmicTransition}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <div className="step-nova-header">
          <NovaAvatar state="idle" size="small" />
          <div className="nova-message-inline">
            <p>Since you chose minimal mode, we'll skip the gamification tour. You can always explore these features later!</p>
          </div>
        </div>
        <div className="step-actions">
          <button className="back-action-btn" onClick={onBack}>
            <ArrowLeft size={18} />
          </button>
          <motion.button
            className="primary-action-btn"
            onClick={onContinue}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span>Continue</span>
            <ArrowRight size={18} />
          </motion.button>
        </div>
      </motion.div>
    );
  }

  const section = TOUR_SECTIONS[currentSection];
  const SectionIcon = section.icon;

  const handleNextSection = () => {
    setSectionsViewed(prev => new Set([...prev, section.id]));

    if (currentSection < TOUR_SECTIONS.length - 1) {
      setCurrentSection(prev => prev + 1);
    } else {
      // Tour complete
      awardXP(10, 'Gamification tour complete!');
      onContinue();
    }
  };

  const handlePrevSection = () => {
    if (currentSection > 0) {
      setCurrentSection(prev => prev - 1);
    } else {
      onBack();
    }
  };

  return (
    <motion.div
      className="onboarding-step tour-step"
      variants={cosmicTransition}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* Section Progress */}
      <div className="tour-progress">
        {TOUR_SECTIONS.map((s, idx) => (
          <motion.div
            key={s.id}
            className={`tour-dot ${idx === currentSection ? 'current' : ''} ${sectionsViewed.has(s.id) ? 'viewed' : ''}`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: idx * 0.1 }}
          />
        ))}
      </div>

      <div className="step-nova-header">
        <NovaAvatar state="excited" size="small" />
        <div className="nova-message-inline">
          <p>{NOVA_DIALOGUES.tourSections[section.id]}</p>
        </div>
      </div>

      {/* Section Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={section.id}
          className="tour-section-content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <div className="tour-icon-container" style={{ '--section-gradient': section.gradient }}>
            <SectionIcon size={40} />
          </div>
          <h2>{section.title}</h2>
          <p className="tour-description">{section.description}</p>

          {/* Visual Demos */}
          <div className="tour-visual">
            {section.id === 'xp' && (
              <div className="xp-demo">
                <div className="xp-bar-container">
                  <div className="xp-bar-labels">
                    <span>Level 1</span>
                    <span>Level 2</span>
                  </div>
                  <div className="xp-bar-track">
                    <motion.div
                      className="xp-bar-fill"
                      initial={{ width: '0%' }}
                      animate={{ width: '65%' }}
                      transition={{ duration: 1.5, delay: 0.3 }}
                    />
                  </div>
                </div>
                <motion.div
                  className="xp-gain-demo"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                >
                  <Zap size={20} />
                  <span>+50 XP</span>
                </motion.div>
              </div>
            )}

            {section.id === 'avatar' && (
              <div className="avatar-evolution-demo">
                {[1, 10, 25, 40].map((stage, idx) => (
                  <motion.div
                    key={stage}
                    className={`evolution-stage ${idx === 0 ? 'current' : 'future'}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 * idx }}
                  >
                    <img
                      src={`/assets/avatar/evolution/heroine_v3_stage_${stage}_${
                        stage === 1 ? 'dreamer' : stage === 10 ? 'swordsman' : stage === 25 ? 'holy_crusader' : 'avatar_of_mastery'
                      }.png`}
                      alt={`Stage ${stage}`}
                      style={{ imageRendering: 'pixelated' }}
                    />
                    <span>Lv {stage}</span>
                  </motion.div>
                ))}
              </div>
            )}

            {section.id === 'skills' && (
              <div className="skills-demo">
                <svg viewBox="0 0 300 320" className="constellation-preview">
                  <defs>
                    <filter id="glow-tour" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                      <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                    <filter id="strong-glow" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
                      <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                    <radialGradient id="perk-glow-body">
                      <stop offset="0%" stopColor="#d97757" stopOpacity="0.9" />
                      <stop offset="40%" stopColor="#d97757" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#d97757" stopOpacity="0" />
                    </radialGradient>
                    <radialGradient id="nebula-glow" cx="50%" cy="40%" r="60%">
                      <stop offset="0%" stopColor="#d97757" stopOpacity="0.15" />
                      <stop offset="60%" stopColor="#8b5cf6" stopOpacity="0.05" />
                      <stop offset="100%" stopColor="transparent" stopOpacity="0" />
                    </radialGradient>
                  </defs>

                  {/* Deep space background with scattered stars */}
                  {[
                    { x: 20, y: 30, r: 1 }, { x: 55, y: 18, r: 0.8 }, { x: 95, y: 12, r: 1.2 }, { x: 145, y: 22, r: 0.7 },
                    { x: 195, y: 35, r: 1.1 }, { x: 245, y: 28, r: 0.9 }, { x: 278, y: 55, r: 1 }, { x: 25, y: 85, r: 0.6 },
                    { x: 275, y: 95, r: 0.8 }, { x: 15, y: 150, r: 1 }, { x: 285, y: 160, r: 0.7 }, { x: 30, y: 220, r: 0.9 },
                    { x: 270, y: 230, r: 1.1 }, { x: 45, y: 280, r: 0.8 }, { x: 255, y: 285, r: 1 }, { x: 80, y: 45, r: 0.5 },
                    { x: 220, y: 50, r: 0.6 }, { x: 35, y: 180, r: 0.7 }, { x: 265, y: 175, r: 0.8 }, { x: 150, y: 8, r: 1.3 },
                    { x: 60, y: 295, r: 0.6 }, { x: 240, y: 300, r: 0.7 }, { x: 12, y: 260, r: 0.5 }, { x: 288, y: 250, r: 0.6 },
                  ].map((star, i) => (
                    <motion.circle
                      key={`bg-star-${i}`}
                      cx={star.x}
                      cy={star.y}
                      r={star.r}
                      fill="white"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.2 + (i % 5) * 0.1 }}
                      transition={{ duration: 1, delay: i * 0.02 }}
                    />
                  ))}

                  {/* Nebula glow behind constellation */}
                  <ellipse cx="150" cy="160" rx="120" ry="140" fill="url(#nebula-glow)" />

                  {/* BODY/Warrior Constellation - Larger, more spaced out */}
                  {/* Lines first (behind nodes) */}
                  {[
                    // Foundation to legs (wide stance)
                    { x1: 150, y1: 255, x2: 95, y2: 295, active: true },
                    { x1: 150, y1: 255, x2: 205, y2: 295, active: true },
                    // Torso spine
                    { x1: 150, y1: 255, x2: 150, y2: 205, active: true },
                    { x1: 150, y1: 205, x2: 150, y2: 160, active: true },
                    // Arms spread wide
                    { x1: 150, y1: 160, x2: 45, y2: 125, active: false },
                    { x1: 150, y1: 160, x2: 255, y2: 125, active: false },
                    // Heart center
                    { x1: 150, y1: 160, x2: 150, y2: 115, active: true },
                    // Neck to head
                    { x1: 150, y1: 115, x2: 150, y2: 75, active: false },
                    { x1: 150, y1: 75, x2: 150, y2: 45, active: false },
                    // Arms connect to head (diagonal lines)
                    { x1: 45, y1: 125, x2: 150, y2: 45, active: false },
                    { x1: 255, y1: 125, x2: 150, y2: 45, active: false },
                    // Crown
                    { x1: 150, y1: 45, x2: 150, y2: 18, active: false },
                  ].map((line, i) => (
                    <motion.line
                      key={`line-${i}`}
                      x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2}
                      stroke={line.active ? '#d97757' : '#475569'}
                      strokeWidth={line.active ? 3 : 2}
                      strokeOpacity={line.active ? 1 : 0.3}
                      strokeDasharray={line.active ? 'none' : '6,6'}
                      filter={line.active ? 'url(#glow-tour)' : 'none'}
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{ duration: 0.6, delay: 0.3 + i * 0.05 }}
                    />
                  ))}

                  {/* Perk Nodes - Warrior constellation with proper spacing */}
                  {[
                    // Base (Foundation) - Center stance
                    { cx: 150, cy: 255, r: 12, unlocked: true, tier: 'keystone' },
                    // Legs
                    { cx: 95, cy: 295, r: 8, unlocked: true, tier: 'novice' },
                    { cx: 205, cy: 295, r: 8, unlocked: true, tier: 'novice' },
                    // Torso
                    { cx: 150, cy: 205, r: 9, unlocked: true, tier: 'novice' },
                    { cx: 150, cy: 160, r: 9, unlocked: true, tier: 'novice' },
                    // Arms (spread wide)
                    { cx: 45, cy: 125, r: 8, unlocked: false, tier: 'adept' },
                    { cx: 255, cy: 125, r: 8, unlocked: false, tier: 'adept' },
                    // Heart
                    { cx: 150, cy: 115, r: 10, unlocked: true, tier: 'adept' },
                    // Neck/Head
                    { cx: 150, cy: 75, r: 8, unlocked: false, tier: 'adept' },
                    { cx: 150, cy: 45, r: 10, unlocked: false, tier: 'expert' },
                    // Crown (Peak Performance)
                    { cx: 150, cy: 18, r: 11, unlocked: false, tier: 'master' },
                  ].map((node, i) => (
                    <g key={`node-${i}`}>
                      {/* Outer glow for unlocked */}
                      {node.unlocked && (
                        <motion.circle
                          cx={node.cx}
                          cy={node.cy}
                          r={node.r * 3.5}
                          fill="url(#perk-glow-body)"
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 0.7 }}
                          transition={{ delay: 0.8 + i * 0.04, duration: 0.6 }}
                        />
                      )}
                      {/* Main node */}
                      <motion.circle
                        cx={node.cx}
                        cy={node.cy}
                        r={node.r}
                        fill={node.unlocked ? '#d97757' : '#1e293b'}
                        stroke={node.unlocked ? '#fff' : '#334155'}
                        strokeWidth={node.tier === 'keystone' || node.tier === 'master' ? 3 : 2}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.6 + i * 0.05, type: 'spring', stiffness: 150 }}
                        style={{
                          filter: node.unlocked
                            ? 'drop-shadow(0 0 10px #d97757) drop-shadow(0 0 20px #d97757)'
                            : 'none'
                        }}
                      />
                      {/* Inner bright core for keystone/master */}
                      {(node.tier === 'keystone' || node.tier === 'master') && (
                        <motion.circle
                          cx={node.cx}
                          cy={node.cy}
                          r={node.r * 0.4}
                          fill={node.unlocked ? '#fff' : '#475569'}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.8 + i * 0.05 }}
                        />
                      )}
                    </g>
                  ))}

                  {/* Animated pulse rings on key unlocked nodes */}
                  {[
                    { cx: 150, cy: 255, color: '#d97757' },
                    { cx: 150, cy: 115, color: '#d97757' },
                    { cx: 150, cy: 160, color: '#d97757' },
                  ].map((node, i) => (
                    <motion.circle
                      key={`pulse-${i}`}
                      cx={node.cx}
                      cy={node.cy}
                      r={16}
                      fill="none"
                      stroke={node.color}
                      strokeWidth="2"
                      initial={{ scale: 0.5, opacity: 0.9 }}
                      animate={{ scale: 2.5, opacity: 0 }}
                      transition={{ duration: 3, repeat: Infinity, delay: i * 0.6, ease: 'easeOut' }}
                    />
                  ))}

                  {/* Title with glow */}
                  <motion.text
                    x="150"
                    y="315"
                    textAnchor="middle"
                    fill="#d97757"
                    fontSize="14"
                    fontWeight="bold"
                    letterSpacing="3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5 }}
                    style={{ filter: 'drop-shadow(0 0 8px #d97757)' }}
                  >
                    BODY
                  </motion.text>
                </svg>
              </div>
            )}

            {section.id === 'bazaar' && (
              <div className="bazaar-demo bazaar-demo-row">
                {[
                  { name: 'Iron Sword', price: 50, image: '/assets/bazaar/weapons/sword_iron.png' },
                  { name: 'XP Potion', price: 25, image: '/assets/bazaar/consumables/potion_xp_small.png' },
                  { name: 'Leather Armor', price: 75, image: '/assets/bazaar/armor/armor_leather.png' },
                ].map((item, idx) => (
                  <motion.div
                    key={item.name}
                    className="bazaar-item-preview"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 * idx }}
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="bazaar-item-icon"
                    />
                    <span className="item-name">{item.name}</span>
                    <span className="item-price">{item.price} ✧</span>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="step-actions">
        <button className="back-action-btn" onClick={handlePrevSection}>
          <ArrowLeft size={18} />
        </button>
        <div className="action-group">
          <button className="skip-btn" onClick={onSkip}>
            Skip Tour
          </button>
          <motion.button
            className="primary-action-btn"
            onClick={handleNextSection}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{ '--btn-gradient': section.gradient }}
          >
            <span>{currentSection < TOUR_SECTIONS.length - 1 ? 'Next' : 'Complete Tour'}</span>
            <ArrowRight size={18} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

// ============ SOCIAL STEP ============

function SocialStep({ onContinue, onBack, onSkip, username, displayName }) {
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitedEmails, setInvitedEmails] = useState([]);
  const [pendingEmails, setPendingEmails] = useState([]);
  const [failedEmails, setFailedEmails] = useState([]);
  const [copied, setCopied] = useState(false);
  const [sending, setSending] = useState(false);

  const inviteLink = import.meta.env.VITE_APP_URL || 'https://app.ascnd.app';

  // Send invite via edge function
  const handleInvite = async () => {
    if (!inviteEmail || !inviteEmail.includes('@') || sending) return;

    const emailToSend = inviteEmail.trim();
    setInviteEmail('');
    setPendingEmails(prev => [...prev, emailToSend]);
    setSending(true);

    try {
      const { supabase } = await import('../../lib/supabase');
      const { data: { session } } = await supabase.auth.getSession();

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-invite`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token || ''}`,
          },
          body: JSON.stringify({
            emails: [emailToSend],
            inviterName: displayName || username || 'A friend',
            inviterUsername: username,
          }),
        }
      );

      const result = await response.json();

      if (response.ok && result.sent > 0) {
        setInvitedEmails(prev => [...prev, emailToSend]);
        setPendingEmails(prev => prev.filter(e => e !== emailToSend));
      } else {
        setFailedEmails(prev => [...prev, emailToSend]);
        setPendingEmails(prev => prev.filter(e => e !== emailToSend));
        console.error('Invite failed:', result.error);
      }
    } catch (error) {
      console.error('Failed to send invite:', error);
      setFailedEmails(prev => [...prev, emailToSend]);
      setPendingEmails(prev => prev.filter(e => e !== emailToSend));
    } finally {
      setSending(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Retry failed email
  const handleRetry = (email) => {
    setFailedEmails(prev => prev.filter(e => e !== email));
    setInviteEmail(email);
  };

  return (
    <motion.div
      className="onboarding-step social-step"
      variants={cosmicTransition}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="step-nova-header">
        <NovaAvatar state="idle" size="small" />
        <div className="nova-message-inline">
          <p>{NOVA_DIALOGUES.socialIntro}</p>
        </div>
      </div>

      <motion.div
        className="social-content"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="social-icon-container">
          <Users size={48} />
        </div>
        <h2>Invite Friends</h2>
        <p className="social-subtitle">Journey together and keep each other accountable</p>

        {/* Email Invite */}
        <div className="invite-section">
          <div className="invite-input-wrapper">
            <Mail size={18} className="input-icon" />
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="friend@email.com"
              onKeyPress={(e) => e.key === 'Enter' && handleInvite()}
              disabled={sending}
            />
            <button
              className="invite-btn"
              onClick={handleInvite}
              disabled={!inviteEmail.includes('@') || sending}
            >
              {sending ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <Sparkles size={16} />
                </motion.div>
              ) : (
                <Send size={16} />
              )}
            </button>
          </div>

          {/* Pending emails */}
          {pendingEmails.length > 0 && (
            <div className="invited-list pending">
              {pendingEmails.map((email) => (
                <motion.div
                  key={email}
                  className="invited-chip pending"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <Sparkles size={12} />
                  </motion.div>
                  <span>{email}</span>
                </motion.div>
              ))}
            </div>
          )}

          {/* Successfully sent emails */}
          {invitedEmails.length > 0 && (
            <div className="invited-list">
              {invitedEmails.map((email) => (
                <motion.div
                  key={email}
                  className="invited-chip success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <Check size={12} />
                  <span>{email}</span>
                </motion.div>
              ))}
            </div>
          )}

          {/* Failed emails */}
          {failedEmails.length > 0 && (
            <div className="invited-list failed">
              {failedEmails.map((email) => (
                <motion.div
                  key={email}
                  className="invited-chip failed"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <span>{email} - Failed</span>
                  <button
                    className="retry-btn"
                    onClick={() => handleRetry(email)}
                  >
                    Retry
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Copy Link */}
        <div className="or-divider">
          <span>or share your link</span>
        </div>

        <button className="copy-link-btn" onClick={handleCopyLink}>
          <Copy size={16} />
          <span>{copied ? 'Copied!' : 'Copy Invite Link'}</span>
        </button>
      </motion.div>

      <div className="step-actions">
        <button className="back-action-btn" onClick={onBack}>
          <ArrowLeft size={18} />
        </button>
        <div className="action-group">
          <button className="skip-btn" onClick={onSkip}>
            Skip for now
          </button>
          <motion.button
            className="primary-action-btn"
            onClick={onContinue}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span>{invitedEmails.length > 0 ? 'Continue' : 'Continue Solo'}</span>
            <ArrowRight size={18} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

// ============ LAUNCH CELEBRATION ============
// Premium celebration with multi-burst confetti, animated rings, and staggered reveals

function LaunchCelebration({ xpEarned, selectedGoals, commitment, username, onComplete }) {
  const [celebrationPhase, setCelebrationPhase] = useState(0);

  useEffect(() => {
    // Premium multi-burst confetti sequence
    const fireConfetti = () => {
      // Initial burst
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6, x: 0.5 },
        colors: ['#8b5cf6', '#a855f7', '#c084fc', '#fbbf24', '#22c55e']
      });
    };

    // Staggered confetti bursts for premium feel
    fireConfetti();
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#8b5cf6', '#a855f7', '#ec4899']
      });
    }, 250);
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#fbbf24', '#22c55e', '#06b6d4']
      });
    }, 400);
    setTimeout(() => {
      confetti({
        particleCount: 80,
        spread: 100,
        origin: { y: 0.7 },
        colors: ['#8b5cf6', '#c084fc', '#e879f9']
      });
    }, 800);

    const timers = [
      setTimeout(() => setCelebrationPhase(1), 600),
      setTimeout(() => setCelebrationPhase(2), 1600),
      setTimeout(() => setCelebrationPhase(3), 2600)
    ];

    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <motion.div
      className="onboarding-step launch-step launch-celebration-premium"
      variants={cosmicTransition}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* Animated celebration burst background */}
      <div className="celebration-burst" />

      {/* Multiple expanding celebration rings */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={`celebration-ring-${i}`}
          className="cosmic-ring-premium"
          style={{ position: 'absolute', top: '35%', left: '50%' }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: [0, 2 + i * 0.8, 4 + i],
            opacity: [0, 0.4 - i * 0.1, 0]
          }}
          transition={{
            duration: 3,
            delay: i * 0.3,
            repeat: Infinity,
            repeatDelay: 1
          }}
        />
      ))}

      <motion.div
        className="celebration-hero"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 15, delay: 0.2 }}
      >
        <div className="trophy-display">
          <motion.div
            className="trophy-glow"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <Trophy size={64} className="trophy-icon" />
          <motion.div
            className="sparkle-orbit"
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          >
            {[0, 1, 2, 3].map(i => (
              <Sparkles
                key={i}
                size={16}
                className="orbit-sparkle"
                style={{ '--orbit-delay': `${i * 0.25}` }}
              />
            ))}
          </motion.div>
        </div>

        <motion.h1
          className="celebration-title"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          You're All Set!
        </motion.h1>

        <motion.p
          className="celebration-subtitle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          Your personal operating system is ready
        </motion.p>
      </motion.div>

      {celebrationPhase >= 1 && (
        <motion.div
          className="xp-reward-display"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
        >
          <div className="xp-icon-display">
            <Zap size={28} />
          </div>
          <div className="xp-info">
            <span className="xp-label">XP Earned</span>
            <motion.span
              className="xp-amount"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              +{xpEarned}
            </motion.span>
          </div>
          <span className="xp-message">Welcome bonus!</span>
        </motion.div>
      )}

      {celebrationPhase >= 2 && (
        <motion.div
          className="setup-recap"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="recap-row">
            <span className="recap-label">Focus Areas</span>
            <div className="recap-goals">
              {selectedGoals.map(goalId => {
                const goal = GOALS.find(g => g.id === goalId);
                return (
                  <span key={goalId} className="recap-goal-tag">
                    {goal?.emoji} {goal?.label}
                  </span>
                );
              })}
            </div>
          </div>
          <div className="recap-row">
            <span className="recap-label">Daily Commitment</span>
            <span className="recap-value">
              {COMMITMENT_OPTIONS.find(c => c.id === commitment)?.icon} {COMMITMENT_OPTIONS.find(c => c.id === commitment)?.description}
            </span>
          </div>
        </motion.div>
      )}

      {celebrationPhase >= 3 && (
        <motion.div
          className="nova-farewell"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <NovaAvatar state="celebrating" size="small" />
          <NovaSpeechBubble messages={NOVA_DIALOGUES.complete} />
        </motion.div>
      )}

      <motion.button
        className="launch-btn"
        onClick={onComplete}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: celebrationPhase >= 3 ? 1 : 0.5, y: 0 }}
        transition={{ delay: 0.5 }}
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        disabled={celebrationPhase < 3}
      >
        <span>Enter Ascynt</span>
        <Rocket size={20} />
      </motion.button>
    </motion.div>
  );
}

// ============ MAIN COMPONENT ============

/**
 * Full onboarding flow - 10 steps:
 * 0: intro      - Cosmic logo animation
 * 1: welcome    - Nova introduces herself
 * 2: mode       - Cosmic vs Minimal mode selection
 * 3: profile    - Username + Hero/Heroine avatar selection
 * 4: goals      - Select up to 3 life priorities
 * 5: commitment - Daily time commitment selection
 * 6: tour       - Gamification tour (XP, Avatar, Skills, Bazaar) - skipped for minimal
 * 7: quickWin   - Set first task
 * 8: social     - Invite friends
 * 9: launch     - Celebration and completion
 */

export default function NovaGuidedOnboarding({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedMode, setSelectedMode] = useState('cosmic'); // Default to full experience
  const [selectedGoals, setSelectedGoals] = useState([]);
  const [commitment, setCommitment] = useState('regular');
  const [quickWinText, setQuickWinText] = useState('');
  const [xpEarned, setXpEarned] = useState(0);
  const [showXpPopup, setShowXpPopup] = useState(false);
  const [xpPopupAmount, setXpPopupAmount] = useState(0);

  // Profile state
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [gender, setGender] = useState(null);

  const {
    setHasSeenWelcome,
    setSelectedGoals: saveGoals,
    updateSetupData
  } = useIntegratedOnboardingStore();

  const { addXP: addXPToGamification, isInitialized: gamificationInitialized } = useGamificationStore();
  const { setMode: setGamificationMode } = useGamificationModeStore();
  const { addXP: addXPToAvatar, setCharacterGender } = useAvatarStore();
  const { addTask } = useDailyTasksStore();

  // Award XP with animation
  const awardXP = useCallback((amount, reason) => {
    setXpEarned(prev => prev + amount);
    setXpPopupAmount(amount);
    setShowXpPopup(true);
    setTimeout(() => setShowXpPopup(false), 1500);
  }, []);

  // Toggle goal selection
  const toggleGoal = (goalId) => {
    setSelectedGoals(prev => {
      if (prev.includes(goalId)) {
        return prev.filter(g => g !== goalId);
      } else if (prev.length < 3) {
        const newGoals = [...prev, goalId];
        if (prev.length === 0) {
          awardXP(2, 'First goal selected!');
        }
        return newGoals;
      }
      return prev;
    });
  };

  /**
   * Navigate to step with XP awards
   * Steps: 0=intro, 1=welcome, 2=mode, 3=profile, 4=goals, 5=commitment, 6=tour, 7=quickWin, 8=social, 9=launch
   */
  const goToStep = (step) => {
    if (step > currentStep) {
      // Award XP for completing steps (kept low - onboarding shouldn't level up user)
      if (step === 3) {
        // Mode selected
        awardXP(2, 'Experience selected!');
      } else if (step === 4 && username) {
        // Profile completed
        awardXP(5, 'Profile created!');
      } else if (step === 5 && selectedGoals.length > 0) {
        // Goals selected
        awardXP(5, 'Goals selected!');
      } else if (step === 7) {
        // Quick win set
        awardXP(3, 'First goal set!');
      }
    }
    setCurrentStep(step);
  };

  // Handle completion
  const handleComplete = async () => {
    // Save gamification mode selection
    setGamificationMode(selectedMode);

    // Save avatar gender
    if (gender) {
      setCharacterGender(gender);
    }

    saveGoals(selectedGoals);
    updateSetupData('onboarding', {
      gamificationMode: selectedMode,
      profile: { username, displayName: displayName || username, gender },
      commitment: COMMITMENT_OPTIONS.find(c => c.id === commitment),
      quickWin: quickWinText,
      xpEarned,
      completedAt: new Date().toISOString()
    });
    setHasSeenWelcome(true);

    // Award final XP (kept low - onboarding shouldn't level up user)
    const finalXP = xpEarned + 10; // Small bonus for completion
    if (gamificationInitialized && addXPToGamification) {
      try {
        if (addXPToAvatar) addXPToAvatar(finalXP);
        await addXPToGamification(finalXP, 'onboarding_complete', { skipAvatarSync: true });
      } catch (error) {
        console.error('Failed to award XP:', error);
      }
    }

    // Create quick win task
    if (quickWinText.trim() && addTask) {
      try {
        const goalToCategoryMap = {
          productivity: 'productivity',
          health: 'health',
          learning: 'learning',
          financial: 'personal',
          journal: 'personal',
          habits: 'productivity',
          balance: 'personal'
        };
        const primaryGoal = selectedGoals[0] || 'productivity';
        const category = goalToCategoryMap[primaryGoal] || 'productivity';
        const today = new Date().toISOString().split('T')[0];
        addTask({
          title: quickWinText.trim(),
          description: '🎯 Your first quick win from onboarding!',
          category,
          priority: 'high',
          estimatedMinutes: 15,
        }, today);
      } catch (error) {
        console.error('Failed to create task:', error);
      }
    }

    onComplete?.();
  };

  // Skip onboarding
  const handleSkip = () => {
    saveGoals(['productivity', 'health', 'habits']);
    setHasSeenWelcome(true);
    onComplete?.();
  };

  // Calculate progress - adjust for skipped tour in minimal mode
  const effectiveSteps = selectedMode === 'minimal' ? STEPS.length - 1 : STEPS.length;
  const progressPercent = ((currentStep) / (effectiveSteps - 1)) * 100;

  return (
    <motion.div
      className="nova-guided-onboarding"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Background Effects - Premium Starfield with Floating Particles */}
      <div className="onboarding-bg-effects">
        <StarfieldBackground
          speed={0.3}
          density={150}
          interactive={true}
        />
        <div className="cosmic-gradient-overlay" />
        <FloatingParticles count={25} active={currentStep > 0} />
      </div>

      {/* XP Popup - Premium with burst effect */}
      <AnimatePresence>
        {showXpPopup && (
          <motion.div
            className="xp-popup-enhanced xp-popup-premium"
            initial={{ opacity: 0, y: 50, scale: 0.5 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.8 }}
            transition={{ type: 'spring', damping: 12, stiffness: 200 }}
          >
            <motion.div
              className="xp-popup-burst"
              initial={{ scale: 0, opacity: 0.8 }}
              animate={{ scale: 2.5, opacity: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
            <motion.div
              animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <Zap className="xp-icon" />
            </motion.div>
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
            >
              +{xpPopupAmount} XP
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Container */}
      <motion.div
        className="onboarding-container"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {/* Progress Bar - Premium with shimmer (hidden on intro) */}
        {currentStep > 0 && currentStep < STEPS.length - 1 && (
          <div className="progress-container">
            <motion.div
              className="progress-bar progress-bar-premium"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            />
            <div className="progress-dots">
              {STEPS.slice(1, -1).map((step, idx) => (
                <motion.div
                  key={step}
                  className={`progress-dot ${idx + 1 <= currentStep ? 'completed' : ''} ${idx + 1 === currentStep ? 'current' : ''}`}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: idx * 0.05, type: 'spring', damping: 15 }}
                >
                  {idx + 1 < currentStep ? (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', damping: 12 }}
                    >
                      <Check size={10} />
                    </motion.div>
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* XP Counter */}
        {currentStep > 0 && (
          <motion.div
            className="xp-counter"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Zap size={14} />
            <span>{xpEarned} XP</span>
          </motion.div>
        )}

        {/* Step Content */}
        {/* Steps: 0=intro, 1=welcome, 2=mode, 3=profile, 4=goals, 5=commitment, 6=tour, 7=quickWin, 8=social, 9=launch */}
        <AnimatePresence mode="wait">
          {currentStep === 0 && (
            <IntroAnimation key="intro" onComplete={() => setCurrentStep(1)} />
          )}

          {currentStep === 1 && (
            <WelcomeStep
              key="welcome"
              onContinue={() => goToStep(2)}
              onSkip={handleSkip}
            />
          )}

          {currentStep === 2 && (
            <ModeStep
              key="mode"
              selectedMode={selectedMode}
              onSelectMode={setSelectedMode}
              onContinue={() => goToStep(3)}
              onBack={() => goToStep(1)}
            />
          )}

          {currentStep === 3 && (
            <ProfileStep
              key="profile"
              username={username}
              displayName={displayName}
              gender={gender}
              onUsernameChange={setUsername}
              onDisplayNameChange={setDisplayName}
              onGenderSelect={setGender}
              onContinue={() => goToStep(4)}
              onBack={() => goToStep(2)}
            />
          )}

          {currentStep === 4 && (
            <GoalsStep
              key="goals"
              selectedGoals={selectedGoals}
              onToggleGoal={toggleGoal}
              onContinue={() => goToStep(5)}
              onBack={() => goToStep(3)}
            />
          )}

          {currentStep === 5 && (
            <CommitmentStep
              key="commitment"
              selected={commitment}
              onSelect={setCommitment}
              onContinue={() => goToStep(6)}
              onBack={() => goToStep(4)}
              awardXP={awardXP}
            />
          )}

          {currentStep === 6 && (
            <GamificationTourStep
              key="tour"
              selectedMode={selectedMode}
              onContinue={() => goToStep(7)}
              onBack={() => goToStep(5)}
              onSkip={() => goToStep(7)}
              awardXP={awardXP}
            />
          )}

          {currentStep === 7 && (
            <QuickWinStep
              key="quickwin"
              value={quickWinText}
              onChange={setQuickWinText}
              selectedGoals={selectedGoals}
              onContinue={() => goToStep(8)}
              onBack={() => selectedMode === 'minimal' ? goToStep(5) : goToStep(6)}
            />
          )}

          {currentStep === 8 && (
            <SocialStep
              key="social"
              username={username}
              displayName={displayName}
              onContinue={() => goToStep(9)}
              onBack={() => goToStep(7)}
              onSkip={() => goToStep(9)}
            />
          )}

          {currentStep === 9 && (
            <LaunchCelebration
              key="launch"
              xpEarned={xpEarned}
              selectedGoals={selectedGoals}
              commitment={commitment}
              username={username || displayName}
              onComplete={handleComplete}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
