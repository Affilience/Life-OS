import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { sounds } from '../../../services/microInteractions/sounds';

/**
 * AvatarBirthAnimation - Cinematic avatar creation effect
 *
 * Features:
 * - Particle burst animation
 * - Avatar crystallizes from stardust
 * - Celebration effects
 * - Sound effects
 *
 * Phases:
 * 1. idle - Waiting for selection
 * 2. gathering - Particles gathering
 * 3. forming - Avatar forming
 * 4. revealed - Avatar fully visible
 */

const PARTICLE_COUNT = 40;

function generateParticles() {
  return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
    id: i,
    angle: (i / PARTICLE_COUNT) * Math.PI * 2,
    distance: 100 + Math.random() * 80,
    size: 2 + Math.random() * 4,
    delay: Math.random() * 0.3,
    color: ['#8b5cf6', '#a855f7', '#c084fc', '#e879f9', '#f0abfc'][Math.floor(Math.random() * 5)],
  }));
}

export default function AvatarBirthAnimation({
  gender = null, // 'male' | 'female'
  onComplete,
  soundEnabled = true,
}) {
  const [phase, setPhase] = useState('idle'); // idle | gathering | forming | revealed
  const [particles] = useState(generateParticles);

  // Trigger animation when gender is selected
  useEffect(() => {
    if (gender && phase === 'idle') {
      setPhase('gathering');

      // Play sound
      if (soundEnabled && sounds.isEnabled()) {
        sounds.achievement();
      }

      // Phase transitions
      const timers = [
        setTimeout(() => setPhase('forming'), 800),
        setTimeout(() => {
          setPhase('revealed');
          // Confetti burst
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.6 },
            colors: ['#8b5cf6', '#a855f7', '#ec4899', '#f0abfc'],
          });
          if (soundEnabled && sounds.isEnabled()) {
            sounds.levelUp();
          }
        }, 1600),
        setTimeout(() => onComplete?.(), 2200),
      ];

      return () => timers.forEach(clearTimeout);
    }
  }, [gender, phase, soundEnabled, onComplete]);

  // Reset when gender is cleared
  useEffect(() => {
    if (!gender) {
      setPhase('idle');
    }
  }, [gender]);

  const avatarSrc = gender === 'male'
    ? '/assets/avatar/evolution/hero_v3_stage_1_dreamer.png'
    : '/assets/avatar/evolution/heroine_v3_stage_1_dreamer.png';

  return (
    <div className="relative w-48 h-48 mx-auto">
      {/* Background glow */}
      <motion.div
        className="absolute inset-0 rounded-full"
        animate={{
          boxShadow:
            phase === 'idle'
              ? '0 0 40px rgba(139, 92, 246, 0.2)'
              : phase === 'revealed'
                ? '0 0 60px rgba(139, 92, 246, 0.4), 0 0 100px rgba(168, 85, 247, 0.2)'
                : '0 0 80px rgba(139, 92, 246, 0.5)',
        }}
        transition={{ duration: 0.5 }}
      />

      {/* Particle ring - idle state */}
      {phase === 'idle' && (
        <div className="absolute inset-0">
          {particles.slice(0, 20).map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute w-1 h-1 rounded-full"
              style={{
                backgroundColor: particle.color,
                left: '50%',
                top: '50%',
              }}
              animate={{
                x: Math.cos(particle.angle) * 70,
                y: Math.sin(particle.angle) * 70,
                opacity: [0.3, 0.7, 0.3],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: particle.delay,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
      )}

      {/* Gathering particles */}
      <AnimatePresence>
        {phase === 'gathering' && (
          <>
            {particles.map((particle) => (
              <motion.div
                key={particle.id}
                className="absolute rounded-full"
                style={{
                  backgroundColor: particle.color,
                  width: particle.size,
                  height: particle.size,
                  left: '50%',
                  top: '50%',
                  marginLeft: -particle.size / 2,
                  marginTop: -particle.size / 2,
                }}
                initial={{
                  x: Math.cos(particle.angle) * particle.distance,
                  y: Math.sin(particle.angle) * particle.distance,
                  opacity: 0,
                  scale: 0.5,
                }}
                animate={{
                  x: 0,
                  y: 0,
                  opacity: [0, 1, 1, 0.5],
                  scale: [0.5, 1, 0.8, 0],
                }}
                transition={{
                  duration: 0.8,
                  delay: particle.delay,
                  ease: 'easeIn',
                }}
              />
            ))}
          </>
        )}
      </AnimatePresence>

      {/* Central orb - forming state */}
      <AnimatePresence>
        {(phase === 'forming' || phase === 'gathering') && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500"
              animate={{
                scale: phase === 'forming' ? [1, 1.2, 0.8, 1.5] : [0.8, 1, 0.8],
                opacity: phase === 'forming' ? [1, 1, 1, 0] : [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: phase === 'forming' ? 0.8 : 2,
                repeat: phase === 'forming' ? 0 : Infinity,
                ease: 'easeInOut',
              }}
              style={{
                filter: 'blur(8px)',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Avatar reveal */}
      <AnimatePresence>
        {(phase === 'forming' || phase === 'revealed') && gender && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{
              opacity: phase === 'revealed' ? 1 : 0.5,
              scale: phase === 'revealed' ? 1 : 0.8,
            }}
            transition={{
              duration: 0.5,
              ease: 'easeOut',
            }}
          >
            {/* Glow behind avatar */}
            <motion.div
              className="absolute w-32 h-32 rounded-full bg-gradient-to-br from-purple-500/30 to-pink-500/30"
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              style={{ filter: 'blur(20px)' }}
            />

            {/* Avatar image */}
            <motion.img
              src={avatarSrc}
              alt="Your Avatar"
              className="w-24 h-24 object-contain relative z-10"
              style={{ imageRendering: 'pixelated' }}
              initial={{ filter: 'brightness(2) blur(4px)' }}
              animate={{
                filter: phase === 'revealed'
                  ? 'brightness(1) blur(0px)'
                  : 'brightness(2) blur(4px)',
              }}
              transition={{ duration: 0.5 }}
            />

            {/* Sparkles around avatar */}
            {phase === 'revealed' && (
              <>
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2"
                    style={{
                      left: '50%',
                      top: '50%',
                    }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{
                      opacity: [0, 1, 0],
                      scale: [0, 1, 0],
                      x: Math.cos((i / 8) * Math.PI * 2) * 50,
                      y: Math.sin((i / 8) * Math.PI * 2) * 50,
                    }}
                    transition={{
                      duration: 1,
                      delay: 0.1 * i,
                      repeat: Infinity,
                      repeatDelay: 2,
                    }}
                  >
                    <svg viewBox="0 0 24 24" className="w-full h-full text-yellow-400">
                      <path
                        fill="currentColor"
                        d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z"
                      />
                    </svg>
                  </motion.div>
                ))}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selection prompt - idle state */}
      {phase === 'idle' && !gender && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{ opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-20 h-20 rounded-full border-2 border-dashed border-purple-500/40 flex items-center justify-center">
            <span className="text-3xl">?</span>
          </div>
        </motion.div>
      )}
    </div>
  );
}
