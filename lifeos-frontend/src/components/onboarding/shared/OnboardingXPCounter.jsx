import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Sparkles, Zap, Star } from 'lucide-react';
import { sounds } from '../../../services/microInteractions/sounds';

/**
 * OnboardingXPCounter - Premium XP display with flagship animations
 *
 * Features:
 * - Smooth eased count-up animation
 * - Multi-type particle burst (stars, sparkles, orbs)
 * - Golden shimmer effect on number
 * - Multi-layer glow effects
 * - Sound effects (optional)
 * - Reduced motion support
 */

// Easing function for smooth count-up
function easeOutExpo(x) {
  return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
}

// Particle types for variety
const PARTICLE_TYPES = ['star', 'sparkle', 'orb'];
const PARTICLE_COLORS = ['#fbbf24', '#f59e0b', '#fcd34d', '#fef3c7', '#ffffff'];

export default function OnboardingXPCounter({
  xp = 0,
  showLabel = true,
  size = 'normal', // 'small' | 'normal' | 'large'
  soundEnabled = true,
  className = ''
}) {
  const [displayXP, setDisplayXP] = useState(xp);
  const [xpGain, setXpGain] = useState(null);
  const [particles, setParticles] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [shimmerActive, setShimmerActive] = useState(false);
  const prevXP = useRef(xp);
  const animationRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();

  // Smooth count-up animation using requestAnimationFrame
  const animateCountUp = useCallback((startValue, endValue, duration = 800) => {
    if (prefersReducedMotion) {
      setDisplayXP(endValue);
      return;
    }

    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutExpo(progress);
      const currentValue = Math.floor(startValue + (endValue - startValue) * easedProgress);

      setDisplayXP(currentValue);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayXP(endValue);
        setIsAnimating(false);
      }
    };

    setIsAnimating(true);
    animationRef.current = requestAnimationFrame(animate);
  }, [prefersReducedMotion]);

  // Create diverse particles
  const createParticles = useCallback((count = 12) => {
    if (prefersReducedMotion) return [];

    return Array.from({ length: count }, (_, i) => ({
      id: Date.now() + i + Math.random(),
      angle: (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.5,
      distance: 30 + Math.random() * 30,
      type: PARTICLE_TYPES[Math.floor(Math.random() * PARTICLE_TYPES.length)],
      color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
      size: 4 + Math.random() * 6,
      duration: 0.5 + Math.random() * 0.3,
      delay: Math.random() * 0.1,
    }));
  }, [prefersReducedMotion]);

  // Animate XP changes
  useEffect(() => {
    if (xp !== prevXP.current) {
      const diff = xp - prevXP.current;

      if (diff > 0) {
        // Show XP gain popup
        setXpGain(diff);
        setTimeout(() => setXpGain(null), 2000);

        // Activate shimmer effect
        setShimmerActive(true);
        setTimeout(() => setShimmerActive(false), 1500);

        // Play sound
        if (soundEnabled && sounds.isEnabled()) {
          sounds.xpGain();
        }

        // Create diverse particles
        const newParticles = createParticles(16);
        setParticles(newParticles);
        setTimeout(() => setParticles([]), 1000);

        // Smooth count-up animation
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
        animateCountUp(prevXP.current, xp, 600 + diff * 10);
      } else {
        setDisplayXP(xp);
      }

      prevXP.current = xp;
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [xp, soundEnabled, createParticles, animateCountUp]);

  const sizeClasses = {
    small: 'text-sm px-2 py-1',
    normal: 'text-base px-3 py-1.5',
    large: 'text-xl px-4 py-2',
  };

  const iconSizes = {
    small: 'w-3 h-3',
    normal: 'w-4 h-4',
    large: 'w-5 h-5',
  };

  // Render particle based on type
  const renderParticle = (particle) => {
    const baseStyle = {
      left: '50%',
      top: '50%',
      marginLeft: -particle.size / 2,
      marginTop: -particle.size / 2,
      color: particle.color,
    };

    if (particle.type === 'star') {
      return <Star style={baseStyle} className="fill-current" size={particle.size} />;
    } else if (particle.type === 'sparkle') {
      return <Sparkles style={baseStyle} size={particle.size} />;
    } else {
      return (
        <div
          style={{
            ...baseStyle,
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            borderRadius: '50%',
            boxShadow: `0 0 ${particle.size}px ${particle.color}`,
          }}
        />
      );
    }
  };

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      {/* Outer glow layer */}
      <motion.div
        className="absolute inset-0 rounded-full blur-md"
        animate={{
          opacity: shimmerActive ? [0.3, 0.6, 0.3] : 0,
          scale: shimmerActive ? [1, 1.2, 1] : 1,
        }}
        transition={{ duration: 0.8, ease: 'easeInOut' }}
        style={{ background: 'radial-gradient(circle, rgba(251, 191, 36, 0.6) 0%, transparent 70%)' }}
      />

      {/* Main XP display */}
      <motion.div
        className={`
          relative flex items-center gap-1.5 rounded-full overflow-hidden
          bg-gradient-to-r from-yellow-500/20 via-amber-500/25 to-orange-500/20
          border border-yellow-500/40
          ${sizeClasses[size]}
        `}
        animate={{
          boxShadow: xpGain
            ? [
                '0 0 20px rgba(251, 191, 36, 0.4), 0 0 40px rgba(251, 191, 36, 0.2)',
                '0 0 30px rgba(251, 191, 36, 0.6), 0 0 60px rgba(251, 191, 36, 0.3)',
                '0 0 20px rgba(251, 191, 36, 0.4), 0 0 40px rgba(251, 191, 36, 0.2)',
              ]
            : '0 0 10px rgba(251, 191, 36, 0.2)',
        }}
        transition={{ duration: 0.6 }}
      >
        {/* Shimmer sweep effect */}
        {shimmerActive && !prefersReducedMotion && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ x: '-100%' }}
            animate={{ x: '200%' }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
              width: '50%',
            }}
          />
        )}

        <motion.div
          animate={isAnimating && !prefersReducedMotion ? { rotate: [0, 15, -15, 0] } : {}}
          transition={{ duration: 0.3 }}
        >
          <Zap className={`${iconSizes[size]} text-yellow-400 drop-shadow-[0_0_3px_rgba(251,191,36,0.8)]`} />
        </motion.div>

        <motion.span
          className="font-bold text-yellow-400 tabular-nums drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]"
          animate={{
            scale: xpGain && !prefersReducedMotion ? [1, 1.3, 1] : 1,
            textShadow: shimmerActive
              ? '0 0 20px rgba(251, 191, 36, 1)'
              : '0 0 8px rgba(251, 191, 36, 0.6)',
          }}
          transition={{ duration: 0.4, type: 'spring', stiffness: 300 }}
        >
          {displayXP}
        </motion.span>

        {showLabel && (
          <span className="text-yellow-400/70 text-sm font-medium">XP</span>
        )}
      </motion.div>

      {/* XP Gain Popup - Enhanced */}
      <AnimatePresence>
        {xpGain && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.5 }}
            animate={{ opacity: 1, y: -35, scale: 1 }}
            exit={{ opacity: 0, y: -60, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            className="absolute left-1/2 -translate-x-1/2 pointer-events-none z-10"
          >
            <motion.div
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-yellow-500/30 to-orange-500/30 border border-yellow-400/50"
              animate={!prefersReducedMotion ? {
                boxShadow: [
                  '0 0 10px rgba(251, 191, 36, 0.5)',
                  '0 0 20px rgba(251, 191, 36, 0.8)',
                  '0 0 10px rgba(251, 191, 36, 0.5)',
                ],
              } : {}}
              transition={{ duration: 0.5, repeat: 2 }}
            >
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span className="text-yellow-200 font-bold whitespace-nowrap drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]">
                +{xpGain} XP
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Particle Burst */}
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute pointer-events-none"
            initial={{
              x: 0,
              y: 0,
              scale: 1,
              opacity: 1,
              rotate: 0,
            }}
            animate={{
              x: Math.cos(particle.angle) * particle.distance,
              y: Math.sin(particle.angle) * particle.distance,
              scale: 0,
              opacity: 0,
              rotate: particle.type === 'star' ? 180 : 0,
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: particle.duration,
              ease: 'easeOut',
              delay: particle.delay,
            }}
            style={{
              left: '50%',
              top: '50%',
            }}
          >
            {renderParticle(particle)}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Ring burst effect */}
      <AnimatePresence>
        {xpGain && !prefersReducedMotion && (
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-yellow-400/60 pointer-events-none"
            initial={{ scale: 1, opacity: 0.8 }}
            animate={{ scale: 2.5, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
