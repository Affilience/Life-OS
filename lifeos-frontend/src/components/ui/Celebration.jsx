/**
 * Celebration Animations
 *
 * Delightful animations for achievements and milestones:
 * - Confetti burst
 * - Level up effects
 * - Achievement unlocked
 * - Milestone celebrations
 * - Streak celebrations
 *
 * Mode-aware:
 * - Cosmic: Full celebrations with particles, confetti, dramatic effects
 * - Professional: Subtle celebrations, no confetti, clean animations
 * - Minimal: No celebrations, silent notifications only
 */

import React, { useEffect, useState, useCallback, createContext, useContext, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Star, Trophy, Zap, Flame, Target, Crown, Sparkles, TrendingUp, CheckCircle } from 'lucide-react';
import { setCelebrationTrigger } from '../../hooks/useGamification';
import { useGamificationModeStore, TERMINOLOGY, VISIBILITY } from '../../stores/gamificationModeStore';
import useSettingsStore from '../../stores/settingsStore';
import {
  StreakExtendedCelebration,
  QuestCompletedCelebration,
  AchievementUnlockedCelebration,
} from './DuolingoCelebration';
import LevelUpModal from '../gamification/LevelUpModal';
import { SKILL_POINTS_PER_LEVEL } from '../../utils/statsSystem';

// Context for celebration triggers
const CelebrationContext = createContext(null);

/**
 * Confetti Particle - Multiple shapes for variety
 */
function ConfettiParticle({ style, shape = 'square' }) {
  const shapeClass = {
    square: 'w-3 h-3 rounded-sm',
    circle: 'w-3 h-3 rounded-full',
    star: 'w-4 h-4',
    ribbon: 'w-1 h-6 rounded-full',
    diamond: 'w-3 h-3 rotate-45',
  }[shape] || 'w-3 h-3 rounded-sm';

  if (shape === 'star') {
    return (
      <div
        className="absolute animate-confetti"
        style={{
          ...style,
          fontSize: '16px',
        }}
      >
        ★
      </div>
    );
  }

  return (
    <div
      className={`absolute ${shapeClass} animate-confetti`}
      style={style}
    />
  );
}

/**
 * Firework Particle - Explodes outward in a spherical pattern
 */
function FireworkParticle({ x, y, color, delay, duration }) {
  return (
    <div
      className="absolute w-2 h-2 rounded-full animate-firework"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        backgroundColor: color,
        boxShadow: `0 0 6px ${color}, 0 0 12px ${color}`,
        animationDelay: `${delay}ms`,
        animationDuration: `${duration}ms`,
      }}
    />
  );
}

/**
 * Screen Flash - Full screen flash effect
 */
export function ScreenFlash({ active, color = '#ffffff', intensity = 0.6 }) {
  const [isFlashing, setIsFlashing] = useState(false);

  useEffect(() => {
    if (active) {
      setIsFlashing(true);
      const timer = setTimeout(() => setIsFlashing(false), 200);
      return () => clearTimeout(timer);
    }
  }, [active]);

  if (!isFlashing) return null;

  return createPortal(
    <div
      className="fixed inset-0 pointer-events-none z-[9998] animate-screen-flash"
      style={{
        backgroundColor: color,
        opacity: intensity,
      }}
    />,
    document.body
  );
}

/**
 * Starburst - Radiating star pattern effect
 */
export function Starburst({ active, x = 50, y = 50, color = '#fbbf24', rays = 12 }) {
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (active) {
      setIsActive(true);
      const timer = setTimeout(() => setIsActive(false), 800);
      return () => clearTimeout(timer);
    }
  }, [active]);

  if (!isActive) return null;

  return createPortal(
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      <div
        className="absolute"
        style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}
      >
        {/* Central glow */}
        <div
          className="absolute w-20 h-20 rounded-full animate-starburst-center"
          style={{
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
            boxShadow: `0 0 60px ${color}, 0 0 100px ${color}`,
          }}
        />
        {/* Radiating rays */}
        {Array.from({ length: rays }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-32 origin-bottom animate-starburst-ray"
            style={{
              left: '50%',
              bottom: '50%',
              transform: `translateX(-50%) rotate(${(360 / rays) * i}deg)`,
              background: `linear-gradient(to top, ${color}, transparent)`,
              animationDelay: `${i * 20}ms`,
            }}
          />
        ))}
      </div>
    </div>,
    document.body
  );
}

/**
 * Confetti - Burst of colorful particles with multiple shapes
 */
const DEFAULT_COLORS = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444'];
const DEFAULT_ORIGIN = { x: 0.5, y: 0.5 };
const SHAPES = ['square', 'circle', 'star', 'ribbon', 'diamond'];

export function Confetti({
  active,
  particleCount = 50,
  duration = 3000,
  colors = DEFAULT_COLORS,
  spread = 180,
  origin = DEFAULT_ORIGIN,
  intensity = 'normal', // 'subtle', 'normal', 'epic'
  onComplete,
}) {
  const [particles, setParticles] = useState([]);
  const onCompleteRef = React.useRef(onComplete);

  // Memoize values to prevent infinite loops
  const originX = origin?.x ?? 0.5;
  const originY = origin?.y ?? 0.5;

  // Adjust particle count based on intensity
  const adjustedCount = {
    subtle: Math.floor(particleCount * 0.5),
    normal: particleCount,
    epic: Math.floor(particleCount * 2.5),
  }[intensity] || particleCount;

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (!active) {
      setParticles([]);
      return;
    }

    const colorArray = colors || DEFAULT_COLORS;
    const newParticles = Array.from({ length: adjustedCount }, (_, i) => {
      const angle = (Math.random() * spread - spread / 2) * (Math.PI / 180);
      const velocity = 300 + Math.random() * 500;
      const color = colorArray[Math.floor(Math.random() * colorArray.length)];
      const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];

      return {
        id: i,
        x: originX * 100,
        y: originY * 100,
        vx: Math.sin(angle) * velocity,
        vy: -Math.cos(angle) * velocity - 250,
        color,
        shape,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 720,
        scale: 0.6 + Math.random() * 0.6,
        opacity: 1,
        delay: Math.random() * 150, // Staggered launch
      };
    });

    setParticles(newParticles);

    const timer = setTimeout(() => {
      setParticles([]);
      onCompleteRef.current?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [active, adjustedCount, duration, spread, originX, originY]);

  if (particles.length === 0) return null;

  return createPortal(
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      {particles.map((p) => (
        <ConfettiParticle
          key={p.id}
          shape={p.shape}
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            backgroundColor: p.shape !== 'star' ? p.color : undefined,
            color: p.shape === 'star' ? p.color : undefined,
            transform: `rotate(${p.rotation}deg) scale(${p.scale})`,
            '--vx': `${p.vx}px`,
            '--vy': `${p.vy}px`,
            '--rotation': `${p.rotationSpeed}deg`,
            animationDuration: `${duration}ms`,
            animationDelay: `${p.delay}ms`,
            textShadow: p.shape === 'star' ? `0 0 8px ${p.color}` : undefined,
          }}
        />
      ))}
    </div>,
    document.body
  );
}

/**
 * Fireworks - Multiple firework explosions
 */
export function Fireworks({ active, burstCount = 5, duration = 2000 }) {
  const [bursts, setBursts] = useState([]);

  useEffect(() => {
    if (!active) {
      setBursts([]);
      return;
    }

    const colors = ['#ff0000', '#ffd700', '#00ff00', '#00bfff', '#ff00ff', '#ff6600'];
    const newBursts = Array.from({ length: burstCount }, (_, i) => ({
      id: i,
      x: 20 + Math.random() * 60, // Keep centered-ish
      y: 20 + Math.random() * 40, // Upper portion of screen
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: i * 300 + Math.random() * 200,
      particleCount: 20 + Math.floor(Math.random() * 15),
    }));

    setBursts(newBursts);

    const timer = setTimeout(() => {
      setBursts([]);
    }, duration + burstCount * 400);

    return () => clearTimeout(timer);
  }, [active, burstCount, duration]);

  if (bursts.length === 0) return null;

  return createPortal(
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      {bursts.map((burst) => (
        <div key={burst.id}>
          {Array.from({ length: burst.particleCount }).map((_, i) => {
            const angle = (360 / burst.particleCount) * i;
            const distance = 80 + Math.random() * 40;
            const endX = burst.x + Math.cos(angle * Math.PI / 180) * distance / 4;
            const endY = burst.y + Math.sin(angle * Math.PI / 180) * distance / 4;

            return (
              <div
                key={i}
                className="absolute w-2 h-2 rounded-full animate-firework-particle"
                style={{
                  left: `${burst.x}%`,
                  top: `${burst.y}%`,
                  backgroundColor: burst.color,
                  boxShadow: `0 0 6px ${burst.color}, 0 0 12px ${burst.color}`,
                  '--end-x': `${(endX - burst.x)}vw`,
                  '--end-y': `${(endY - burst.y)}vh`,
                  animationDelay: `${burst.delay}ms`,
                  animationDuration: '800ms',
                }}
              />
            );
          })}
          {/* Central flash */}
          <div
            className="absolute w-8 h-8 rounded-full animate-firework-flash"
            style={{
              left: `${burst.x}%`,
              top: `${burst.y}%`,
              transform: 'translate(-50%, -50%)',
              backgroundColor: burst.color,
              boxShadow: `0 0 30px ${burst.color}, 0 0 60px ${burst.color}`,
              animationDelay: `${burst.delay}ms`,
            }}
          />
        </div>
      ))}
    </div>,
    document.body
  );
}

/**
 * LevelUpOverlay - Full screen level up celebration with epic effects
 */
export function LevelUpOverlay({
  show,
  level,
  onComplete,
  duration = 4000,
}) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [showFireworks, setShowFireworks] = useState(false);
  const [showStarburst, setShowStarburst] = useState(false);
  const [screenShake, setScreenShake] = useState(false);
  const onCompleteRef = React.useRef(onComplete);

  // Keep ref updated
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (show) {
      setIsAnimating(true);

      // Screen shake on entry
      setScreenShake(true);
      setTimeout(() => setScreenShake(false), 500);

      // Starburst after a short delay
      setTimeout(() => setShowStarburst(true), 200);
      setTimeout(() => setShowStarburst(false), 1000);

      // Fireworks after initial animation
      setTimeout(() => setShowFireworks(true), 600);
      setTimeout(() => setShowFireworks(false), 2500);

      const timer = setTimeout(() => {
        setIsAnimating(false);
        onCompleteRef.current?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration]);

  if (!show && !isAnimating) return null;

  return createPortal(
    <div
      className={`
        fixed inset-0 z-[9999] flex items-center justify-center
        bg-black/85 backdrop-blur-md
        ${isAnimating ? 'animate-fade-in' : 'animate-fade-out'}
        ${screenShake ? 'animate-screen-shake' : ''}
      `}
      onClick={onComplete}
    >
      {/* Multiple radial glows */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="absolute w-96 h-96 rounded-full bg-violet-500/20 blur-3xl animate-pulse" />
        <div className="absolute w-64 h-64 rounded-full bg-amber-500/30 blur-3xl animate-pulse" style={{ animationDelay: '200ms' }} />
        <div className="absolute w-48 h-48 rounded-full bg-pink-500/20 blur-3xl animate-pulse" style={{ animationDelay: '400ms' }} />
      </div>

      {/* Rotating ring effect */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-80 h-80 border-4 border-amber-400/20 rounded-full animate-spin-slow" />
        <div className="absolute w-72 h-72 border-2 border-violet-400/30 rounded-full animate-spin-reverse" />
        <div className="absolute w-64 h-64 border border-pink-400/20 rounded-full animate-spin-slow" style={{ animationDelay: '1s' }} />
      </div>

      {/* Content */}
      <div className="relative text-center animate-scale-in-bounce">
        {/* Crown icon with enhanced glow */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 w-28 h-28 bg-amber-400/40 rounded-full blur-2xl animate-pulse" />
            <Crown className="relative w-24 h-24 text-amber-400 animate-float drop-shadow-[0_0_30px_rgba(251,191,36,0.8)]" />
            <Sparkles className="absolute -top-3 -right-3 w-8 h-8 text-amber-300 animate-ping" />
            <Sparkles className="absolute -bottom-2 -left-2 w-6 h-6 text-amber-200 animate-ping" style={{ animationDelay: '300ms' }} />
            <Star className="absolute top-0 -left-4 w-5 h-5 text-yellow-300 animate-twinkle" />
            <Star className="absolute -top-2 right-4 w-4 h-4 text-yellow-200 animate-twinkle" style={{ animationDelay: '500ms' }} />
          </div>
        </div>

        {/* Level up text with glow */}
        <p className="text-violet-300 text-2xl font-black tracking-widest mb-3 animate-slide-up drop-shadow-[0_0_20px_rgba(139,92,246,0.8)]">
          ⚡ LEVEL UP! ⚡
        </p>

        {/* Level number with epic styling */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-9xl font-black text-amber-400/20 blur-xl">{level}</span>
          </div>
          <span className="relative text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-amber-400 to-amber-600 animate-glow drop-shadow-[0_0_40px_rgba(251,191,36,0.6)]">
            {level}
          </span>
        </div>

        {/* Motivational subtitle */}
        <p className="text-white/70 mt-6 text-lg animate-fade-in-delay font-medium">
          ✨ You're becoming unstoppable! ✨
        </p>

        {/* XP bar animation hint */}
        <div className="mt-4 flex justify-center gap-2 animate-fade-in-delay" style={{ animationDelay: '600ms' }}>
          <div className="px-4 py-2 bg-gradient-to-r from-violet-500/20 to-pink-500/20 rounded-full border border-violet-500/30">
            <span className="text-sm text-violet-300">New abilities unlocked!</span>
          </div>
        </div>
      </div>

      {/* Epic Confetti burst */}
      <Confetti active={isAnimating} particleCount={80} intensity="epic" duration={3500} />

      {/* Fireworks */}
      <Fireworks active={showFireworks} burstCount={6} duration={2000} />

      {/* Central starburst */}
      <Starburst active={showStarburst} x={50} y={50} color="#fbbf24" rays={16} />

      {/* Screen flash on entry */}
      <ScreenFlash active={show} color="#fbbf24" intensity={0.4} />
    </div>,
    document.body
  );
}

/**
 * AchievementToast - Toast notification for achievements
 */
export function AchievementToast({
  show,
  title,
  description,
  icon: Icon = Trophy,
  variant = 'gold',
  onComplete,
  duration = 4000,
}) {
  const [isVisible, setIsVisible] = useState(false);
  const onCompleteRef = React.useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onCompleteRef.current?.(), 300);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration]);

  if (!show && !isVisible) return null;

  const variantStyles = {
    gold: {
      bg: 'from-amber-500/20 to-amber-600/10',
      border: 'border-amber-500/30',
      icon: 'text-amber-400',
      glow: 'shadow-amber-500/20',
    },
    purple: {
      bg: 'from-violet-500/20 to-violet-600/10',
      border: 'border-violet-500/30',
      icon: 'text-violet-400',
      glow: 'shadow-violet-500/20',
    },
    blue: {
      bg: 'from-blue-500/20 to-blue-600/10',
      border: 'border-blue-500/30',
      icon: 'text-blue-400',
      glow: 'shadow-blue-500/20',
    },
    green: {
      bg: 'from-emerald-500/20 to-emerald-600/10',
      border: 'border-emerald-500/30',
      icon: 'text-emerald-400',
      glow: 'shadow-emerald-500/20',
    },
  };

  const styles = variantStyles[variant] || variantStyles.gold;

  return createPortal(
    <div
      className={`
        fixed top-4 left-4 right-4 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 z-[9999]
        ${isVisible ? 'animate-achievement-enter' : 'animate-achievement-exit'}
      `}
    >
      <div
        className={`
          flex items-center gap-4 px-6 py-4 rounded-xl
          bg-gradient-to-r ${styles.bg}
          border ${styles.border}
          backdrop-blur-md shadow-lg ${styles.glow}
        `}
      >
        {/* Icon with glow */}
        <div className="relative">
          <div className={`absolute inset-0 blur-md ${styles.icon} opacity-50`}>
            <Icon className="w-10 h-10" />
          </div>
          <Icon className={`relative w-10 h-10 ${styles.icon}`} />
        </div>

        {/* Content */}
        <div>
          <p className="text-xs text-white/50 uppercase tracking-wider mb-0.5">
            Achievement Unlocked
          </p>
          <p className="font-semibold text-white">{title}</p>
          {description && (
            <p className="text-sm text-white/60">{description}</p>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

/**
 * StreakCelebration - Celebration for maintaining streaks
 */
export function StreakCelebration({
  show,
  streak,
  onComplete,
  duration = 2500,
}) {
  const [isVisible, setIsVisible] = useState(false);
  const onCompleteRef = React.useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onCompleteRef.current?.(), 300);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration]);

  if (!show && !isVisible) return null;

  return createPortal(
    <div
      className={`
        fixed bottom-24 left-1/2 -translate-x-1/2 z-[9999]
        ${isVisible ? 'animate-streak-enter' : 'animate-streak-exit'}
      `}
    >
      <div className="flex items-center gap-3 px-5 py-3 rounded-full bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 backdrop-blur-md">
        <Flame className="w-6 h-6 text-orange-400 animate-pulse" />
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-orange-400">{streak}</span>
          <span className="text-sm text-white/70">day streak!</span>
        </div>
        <Zap className="w-5 h-5 text-amber-400" />
      </div>
    </div>,
    document.body
  );
}

/**
 * MilestoneCelebration - For reaching major milestones
 */
export function MilestoneCelebration({
  show,
  title,
  subtitle,
  icon: Icon = Target,
  onComplete,
}) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (show) {
      setIsAnimating(true);
    }
  }, [show]);

  if (!show && !isAnimating) return null;

  return (
    <>
      <LevelUpOverlay
        show={show}
        level={<Icon className="w-16 h-16" />}
        onComplete={() => {
          setIsAnimating(false);
          onComplete?.();
        }}
        duration={3500}
      />
    </>
  );
}

/**
 * CelebrationProvider - Context provider for triggering celebrations
 * Mode-aware: respects visibility settings for each celebration type
 * Includes queue system for Duolingo-style celebrations
 */
export function CelebrationProvider({ children }) {
  const [confetti, setConfetti] = useState(false);
  const [levelUp, setLevelUp] = useState(null);
  const [achievement, setAchievement] = useState(null);
  const [streak, setStreak] = useState(null);

  // Duolingo-style celebration queue
  const [celebrationQueue, setCelebrationQueue] = useState([]);
  const [currentCelebration, setCurrentCelebration] = useState(null);
  const isProcessingRef = useRef(false);

  // XP batching state
  const xpBatchRef = useRef({ totalXP: 0, actions: [], modules: new Set() });
  const xpBatchTimerRef = useRef(null);

  // Get mode visibility settings
  const mode = useGamificationModeStore((state) => state.mode);
  const visibility = VISIBILITY[mode] || VISIBILITY.cosmic;

  // Get XP toast settings
  const xpToastEnabled = useSettingsStore((state) => state.settings?.notifications?.xpToastEnabled ?? true);
  const xpToastMinThreshold = useSettingsStore((state) => state.settings?.notifications?.xpToastMinThreshold ?? 15);
  const xpToastBatchWindow = useSettingsStore((state) => state.settings?.notifications?.xpToastBatchWindow ?? 2000);

  // Process celebration queue
  const processQueue = useCallback(() => {
    if (isProcessingRef.current || celebrationQueue.length === 0) {
      return;
    }

    isProcessingRef.current = true;
    const [next, ...rest] = celebrationQueue;
    setCelebrationQueue(rest);
    setCurrentCelebration(next);
  }, [celebrationQueue]);

  // Handle celebration complete
  const handleCelebrationComplete = useCallback(() => {
    setCurrentCelebration(null);
    isProcessingRef.current = false;
    // Small delay before processing next
    setTimeout(processQueue, 300);
  }, [processQueue]);

  // Process queue when it changes
  useEffect(() => {
    if (!currentCelebration && celebrationQueue.length > 0) {
      processQueue();
    }
  }, [celebrationQueue, currentCelebration, processQueue]);

  const celebrate = useMemo(() => ({
    confetti: (options = {}) => {
      // Only show confetti if particle effects are enabled
      if (visibility.showParticleEffects) {
        setConfetti(true);
        setTimeout(() => setConfetti(false), options.duration || 3000);
      }
    },
    levelUp: (levelOrData) => {
      // Only show level up animation if enabled
      if (visibility.showLevelUpAnimation) {
        // Support both old format (just level number) and new format (full data object)
        if (typeof levelOrData === 'object') {
          setLevelUp(levelOrData);
        } else {
          // Legacy support: just level number, create minimal data
          setLevelUp({
            newLevel: levelOrData,
            oldLevel: levelOrData - 1,
            skillPointsAwarded: SKILL_POINTS_PER_LEVEL,
          });
        }
      }
    },
    achievement: (options) => {
      // Only show achievement popup if enabled
      if (visibility.showAchievementPopups) {
        setAchievement(options);
      }
    },
    streak: (days) => {
      // Only show streak celebration if streak flame is enabled
      if (visibility.showStreakFlame) {
        setStreak(days);
      }
    },
    // Skill points notification
    skillPointsAwarded: (points) => {
      if (visibility.showAchievementPopups && points > 0) {
        setAchievement({
          title: `+${points} Skill Points!`,
          description: 'Allocate them in the Character page',
          icon: Zap,
          variant: 'purple',
          duration: 3000,
        });
      }
    },
    // XP gained notification (for non-level-up XP gains)
    // Uses batching to combine multiple XP gains within a time window
    xpGained: ({ amount, action, module }) => {
      // Check if XP toasts are enabled
      if (!xpToastEnabled || !visibility.showAchievementPopups || amount <= 0) {
        return;
      }

      // Get action-friendly name
      const actionNames = {
        budgetCreated: 'Budget Created',
        incomeLogged: 'Income Logged',
        expenseLogged: 'Expense Logged',
        savingsGoalCreated: 'Savings Goal Created',
        savingsGoalCompleted: 'Savings Goal Completed',
        savingsContribution: 'Savings Contribution',
        sinkingFundCreated: 'Sinking Fund Created',
        sinkingFundContribution: 'Fund Contribution',
        taskCompleted: 'Task Complete',
        workoutCompleted: 'Workout Complete',
        mealLogged: 'Meal Logged',
        journalEntry: 'Journal Entry',
        bookCompleted: 'Book Completed',
        noteCreated: 'Note Created',
        practiceSession: 'Practice Session',
        articleRead: 'Article Read',
        ideaCaptured: 'Idea Captured',
        waterLogged: 'Water Logged',
        sleepLogged: 'Sleep Logged',
        prSet: 'PR Set',
        questCompleted: 'Quest Complete',
      };
      const actionName = actionNames[action] || action?.replace(/([A-Z])/g, ' $1').trim() || 'Action';

      // Add to batch
      xpBatchRef.current.totalXP += amount;
      xpBatchRef.current.actions.push(actionName);
      if (module) {
        xpBatchRef.current.modules.add(module);
      }

      // Clear existing timer and set new one
      if (xpBatchTimerRef.current) {
        clearTimeout(xpBatchTimerRef.current);
      }

      xpBatchTimerRef.current = setTimeout(() => {
        const batch = xpBatchRef.current;

        // Only show toast if total XP meets threshold
        if (batch.totalXP >= xpToastMinThreshold) {
          // Create description from batched actions
          const uniqueActions = [...new Set(batch.actions)];
          const description = uniqueActions.length === 1
            ? uniqueActions[0]
            : uniqueActions.length <= 3
              ? uniqueActions.join(', ')
              : `${uniqueActions.slice(0, 2).join(', ')} +${uniqueActions.length - 2} more`;

          // Determine variant based on most common module
          const modulesArray = [...batch.modules];
          const primaryModule = modulesArray[0] || 'general';

          setAchievement({
            title: `+${batch.totalXP} XP`,
            description,
            icon: Sparkles,
            variant: primaryModule === 'financial' ? 'green' :
                     primaryModule === 'health' ? 'blue' :
                     primaryModule === 'productivity' ? 'gold' :
                     primaryModule === 'knowledge' ? 'purple' : 'gold',
            duration: 2500,
          });
        }

        // Reset batch
        xpBatchRef.current = { totalXP: 0, actions: [], modules: new Set() };
        xpBatchTimerRef.current = null;
      }, xpToastBatchWindow);
    },

    // Duolingo-style celebrations (queued)
    streakExtended: (options) => {
      if (visibility.showStreakFlame) {
        setCelebrationQueue(prev => [...prev, { type: 'streakExtended', ...options }]);
      }
    },
    questCompleted: (options) => {
      if (visibility.showAchievementPopups) {
        setCelebrationQueue(prev => [...prev, { type: 'questCompleted', ...options }]);
      }
    },
    achievementUnlocked: (options) => {
      if (visibility.showAchievementPopups) {
        setCelebrationQueue(prev => [...prev, { type: 'achievementUnlocked', ...options }]);
      }
    },

    // Batch add to queue (for multiple celebrations at once)
    queueCelebrations: (celebrations) => {
      const filtered = celebrations.filter(c => {
        if (c.type === 'streakExtended') return visibility.showStreakFlame;
        if (c.type === 'questCompleted' || c.type === 'achievementUnlocked') return visibility.showAchievementPopups;
        return true;
      });
      if (filtered.length > 0) {
        setCelebrationQueue(prev => [...prev, ...filtered]);
      }
    },
  }), [visibility, xpToastEnabled, xpToastMinThreshold, xpToastBatchWindow]);

  // Cleanup batch timer on unmount
  useEffect(() => {
    return () => {
      if (xpBatchTimerRef.current) {
        clearTimeout(xpBatchTimerRef.current);
      }
    };
  }, []);

  // Register celebration trigger with gamification system
  useEffect(() => {
    setCelebrationTrigger(celebrate);
    return () => setCelebrationTrigger(null);
  }, [celebrate]);

  return (
    <CelebrationContext.Provider value={celebrate}>
      {children}
      {/* Confetti - only if particle effects enabled */}
      {visibility.showParticleEffects && <Confetti active={confetti} />}

      {/* Level Up Modal - only if level up animation enabled */}
      {visibility.showLevelUpAnimation && (
        <LevelUpModal
          isOpen={levelUp !== null}
          data={levelUp}
          onClose={() => setLevelUp(null)}
        />
      )}

      {/* Achievement Toast - only if achievement popups enabled */}
      {visibility.showAchievementPopups && (
        <AchievementToast
          show={achievement !== null}
          {...achievement}
          onComplete={() => setAchievement(null)}
        />
      )}

      {/* Streak Celebration - only if streak flame enabled */}
      {visibility.showStreakFlame && (
        <StreakCelebration
          show={streak !== null}
          streak={streak}
          onComplete={() => setStreak(null)}
        />
      )}

      {/* Duolingo-style Streak Extended */}
      {visibility.showStreakFlame && (
        <StreakExtendedCelebration
          show={currentCelebration?.type === 'streakExtended'}
          streak={currentCelebration?.streak}
          previousStreak={currentCelebration?.previousStreak || 0}
          newStreak={currentCelebration?.newStreak || 1}
          onComplete={handleCelebrationComplete}
        />
      )}

      {/* Duolingo-style Quest Completed */}
      {visibility.showAchievementPopups && (
        <QuestCompletedCelebration
          show={currentCelebration?.type === 'questCompleted'}
          quest={currentCelebration?.quest}
          onComplete={handleCelebrationComplete}
        />
      )}

      {/* Duolingo-style Achievement Unlocked */}
      {visibility.showAchievementPopups && (
        <AchievementUnlockedCelebration
          show={currentCelebration?.type === 'achievementUnlocked'}
          achievement={currentCelebration?.achievement}
          onComplete={handleCelebrationComplete}
        />
      )}
    </CelebrationContext.Provider>
  );
}

/**
 * useCelebration - Hook to trigger celebrations
 */
export function useCelebration() {
  const context = useContext(CelebrationContext);
  if (!context) {
    // Return no-op functions if no provider
    return {
      confetti: () => {},
      levelUp: () => {},
      achievement: () => {},
      streak: () => {},
      streakExtended: () => {},
      questCompleted: () => {},
      achievementUnlocked: () => {},
      queueCelebrations: () => {},
    };
  }
  return context;
}

// CSS for animations (add to design-tokens.css)
export const celebrationStyles = `
@keyframes confetti {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) translateX(var(--vx, 0)) rotate(var(--rotation, 720deg));
    opacity: 0;
  }
}

@keyframes achievement-enter {
  0% {
    opacity: 0;
    transform: translateX(-50%) translateY(-100%) scale(0.9);
  }
  100% {
    opacity: 1;
    transform: translateX(-50%) translateY(0) scale(1);
  }
}

@keyframes achievement-exit {
  0% {
    opacity: 1;
    transform: translateX(-50%) translateY(0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateX(-50%) translateY(-20px) scale(0.95);
  }
}

@keyframes streak-enter {
  0% {
    opacity: 0;
    transform: translateX(-50%) translateY(20px) scale(0.9);
  }
  100% {
    opacity: 1;
    transform: translateX(-50%) translateY(0) scale(1);
  }
}

@keyframes streak-exit {
  0% {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
  100% {
    opacity: 0;
    transform: translateX(-50%) translateY(10px);
  }
}

@keyframes glow {
  0%, 100% {
    filter: drop-shadow(0 0 20px rgba(251, 191, 36, 0.5));
  }
  50% {
    filter: drop-shadow(0 0 40px rgba(251, 191, 36, 0.8));
  }
}

@keyframes bounce-slow {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

/* New enhanced animations */
@keyframes screen-flash {
  0% { opacity: 0.8; }
  100% { opacity: 0; }
}

@keyframes screen-shake {
  0%, 100% { transform: translateX(0) translateY(0); }
  10% { transform: translateX(-8px) translateY(-4px); }
  20% { transform: translateX(8px) translateY(4px); }
  30% { transform: translateX(-6px) translateY(-3px); }
  40% { transform: translateX(6px) translateY(3px); }
  50% { transform: translateX(-4px) translateY(-2px); }
  60% { transform: translateX(4px) translateY(2px); }
  70% { transform: translateX(-2px) translateY(-1px); }
  80% { transform: translateX(2px) translateY(1px); }
  90% { transform: translateX(-1px) translateY(0); }
}

@keyframes firework-particle {
  0% {
    transform: translate(0, 0) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(var(--end-x, 50px), var(--end-y, 50px)) scale(0);
    opacity: 0;
  }
}

@keyframes firework-flash {
  0% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 1;
  }
  50% {
    transform: translate(-50%, -50%) scale(2);
    opacity: 0.8;
  }
  100% {
    transform: translate(-50%, -50%) scale(3);
    opacity: 0;
  }
}

@keyframes starburst-center {
  0% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 1;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.5);
    opacity: 0.8;
  }
  100% {
    transform: translate(-50%, -50%) scale(2);
    opacity: 0;
  }
}

@keyframes starburst-ray {
  0% {
    transform: translateX(-50%) rotate(var(--rotation, 0deg)) scaleY(0);
    opacity: 1;
  }
  50% {
    transform: translateX(-50%) rotate(var(--rotation, 0deg)) scaleY(1);
    opacity: 0.8;
  }
  100% {
    transform: translateX(-50%) rotate(var(--rotation, 0deg)) scaleY(1.5);
    opacity: 0;
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(-5deg);
  }
  50% {
    transform: translateY(-15px) rotate(5deg);
  }
}

@keyframes twinkle {
  0%, 100% {
    opacity: 0.3;
    transform: scale(0.8);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
  }
}

@keyframes spin-slow {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes spin-reverse {
  from { transform: rotate(360deg); }
  to { transform: rotate(0deg); }
}

@keyframes scale-in-bounce {
  0% {
    transform: scale(0) rotate(-10deg);
    opacity: 0;
  }
  50% {
    transform: scale(1.1) rotate(3deg);
  }
  70% {
    transform: scale(0.95) rotate(-2deg);
  }
  100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
}

.animate-confetti {
  animation: confetti var(--duration, 3s) ease-out forwards;
}

.animate-achievement-enter {
  animation: achievement-enter 0.4s cubic-bezier(0.2, 0, 0, 1) forwards;
}

.animate-achievement-exit {
  animation: achievement-exit 0.3s ease-in forwards;
}

.animate-streak-enter {
  animation: streak-enter 0.4s cubic-bezier(0.2, 0, 0, 1) forwards;
}

.animate-streak-exit {
  animation: streak-exit 0.3s ease-in forwards;
}

.animate-glow {
  animation: glow 2s ease-in-out infinite;
}

.animate-bounce-slow {
  animation: bounce-slow 2s ease-in-out infinite;
}

.animate-slide-up {
  animation: slideUp 0.5s ease-out forwards;
}

.animate-fade-in-delay {
  animation: fadeIn 0.5s ease-out 0.3s forwards;
  opacity: 0;
}

.animate-scale-in {
  animation: scaleIn 0.5s cubic-bezier(0.2, 0, 0, 1) forwards;
}

.animate-fade-out {
  animation: fadeIn 0.3s ease-in reverse forwards;
}

/* New animation classes */
.animate-screen-flash {
  animation: screen-flash 0.2s ease-out forwards;
}

.animate-screen-shake {
  animation: screen-shake 0.5s ease-out;
}

.animate-firework-particle {
  animation: firework-particle 0.8s ease-out forwards;
}

.animate-firework-flash {
  animation: firework-flash 0.4s ease-out forwards;
}

.animate-starburst-center {
  animation: starburst-center 0.8s ease-out forwards;
}

.animate-starburst-ray {
  animation: starburst-ray 0.8s ease-out forwards;
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}

.animate-twinkle {
  animation: twinkle 1.5s ease-in-out infinite;
}

.animate-spin-slow {
  animation: spin-slow 20s linear infinite;
}

.animate-spin-reverse {
  animation: spin-reverse 15s linear infinite;
}

.animate-scale-in-bounce {
  animation: scale-in-bounce 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}
`;

export default {
  Confetti,
  LevelUpOverlay,
  AchievementToast,
  StreakCelebration,
  MilestoneCelebration,
  CelebrationProvider,
  useCelebration,
};
