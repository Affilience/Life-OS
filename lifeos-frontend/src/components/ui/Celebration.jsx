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
import {
  StreakExtendedCelebration,
  QuestCompletedCelebration,
  AchievementUnlockedCelebration,
} from './DuolingoCelebration';

// Context for celebration triggers
const CelebrationContext = createContext(null);

/**
 * Confetti Particle
 */
function ConfettiParticle({ style }) {
  return (
    <div
      className="absolute w-2 h-2 rounded-sm animate-confetti"
      style={style}
    />
  );
}

/**
 * Confetti - Burst of colorful particles
 */
const DEFAULT_COLORS = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];
const DEFAULT_ORIGIN = { x: 0.5, y: 0.5 };

export function Confetti({
  active,
  particleCount = 50,
  duration = 3000,
  colors = DEFAULT_COLORS,
  spread = 180,
  origin = DEFAULT_ORIGIN,
  onComplete,
}) {
  const [particles, setParticles] = useState([]);
  const onCompleteRef = React.useRef(onComplete);

  // Memoize values to prevent infinite loops
  const originX = origin?.x ?? 0.5;
  const originY = origin?.y ?? 0.5;

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (!active) {
      setParticles([]);
      return;
    }

    const colorArray = colors || DEFAULT_COLORS;
    const newParticles = Array.from({ length: particleCount }, (_, i) => {
      const angle = (Math.random() * spread - spread / 2) * (Math.PI / 180);
      const velocity = 300 + Math.random() * 400;
      const color = colorArray[Math.floor(Math.random() * colorArray.length)];

      return {
        id: i,
        x: originX * 100,
        y: originY * 100,
        vx: Math.sin(angle) * velocity,
        vy: -Math.cos(angle) * velocity - 200,
        color,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 720,
        scale: 0.5 + Math.random() * 0.5,
        opacity: 1,
      };
    });

    setParticles(newParticles);

    const timer = setTimeout(() => {
      setParticles([]);
      onCompleteRef.current?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [active, particleCount, duration, spread, originX, originY]);

  if (particles.length === 0) return null;

  return createPortal(
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      {particles.map((p) => (
        <ConfettiParticle
          key={p.id}
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            backgroundColor: p.color,
            transform: `rotate(${p.rotation}deg) scale(${p.scale})`,
            '--vx': `${p.vx}px`,
            '--vy': `${p.vy}px`,
            '--rotation': `${p.rotationSpeed}deg`,
            animationDuration: `${duration}ms`,
          }}
        />
      ))}
    </div>,
    document.body
  );
}

/**
 * LevelUpOverlay - Full screen level up celebration
 */
export function LevelUpOverlay({
  show,
  level,
  onComplete,
  duration = 3000,
}) {
  const [isAnimating, setIsAnimating] = useState(false);
  const onCompleteRef = React.useRef(onComplete);

  // Keep ref updated
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (show) {
      setIsAnimating(true);
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
        bg-black/80 backdrop-blur-sm
        ${isAnimating ? 'animate-fade-in' : 'animate-fade-out'}
      `}
      onClick={onComplete}
    >
      {/* Radial glow */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-64 h-64 rounded-full bg-violet-500/30 blur-3xl animate-pulse" />
      </div>

      {/* Content */}
      <div className="relative text-center animate-scale-in">
        {/* Crown icon */}
        <div className="flex justify-center mb-4">
          <div className="relative">
            <Crown className="w-20 h-20 text-amber-400 animate-bounce-slow" />
            <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-amber-300 animate-ping" />
          </div>
        </div>

        {/* Level up text */}
        <p className="text-violet-300 text-lg font-medium mb-2 animate-slide-up">
          LEVEL UP!
        </p>

        {/* Level number */}
        <div className="relative">
          <span className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-amber-400 to-amber-600 animate-glow">
            {level}
          </span>
        </div>

        {/* Subtitle */}
        <p className="text-white/60 mt-4 animate-fade-in-delay">
          Keep going! You're doing great.
        </p>
      </div>

      {/* Confetti */}
      <Confetti active={isAnimating} particleCount={100} />
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
        fixed top-4 left-1/2 -translate-x-1/2 z-[9999]
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

  // Get mode visibility settings
  const mode = useGamificationModeStore((state) => state.mode);
  const visibility = VISIBILITY[mode] || VISIBILITY.cosmic;

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
    levelUp: (level) => {
      // Only show level up animation if enabled
      if (visibility.showLevelUpAnimation) {
        setLevelUp(level);
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
  }), [visibility]);

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

      {/* Level Up - only if level up animation enabled */}
      {visibility.showLevelUpAnimation && (
        <LevelUpOverlay
          show={levelUp !== null}
          level={levelUp}
          onComplete={() => setLevelUp(null)}
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
