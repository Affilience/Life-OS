import React, { useMemo, useEffect, useState } from 'react';
import { motion, useReducedMotion, useSpring, useTransform } from 'framer-motion';

/**
 * ProgressiveBackground - Premium evolving cosmic background
 *
 * Phases:
 * 1. void - Dark empty space
 * 2. stars - Stars begin appearing with parallax
 * 3. nebula - Nebula clouds form with color shifts
 * 4. cosmos - Full cosmic vista with multiple shooting stars
 *
 * Premium features:
 * - Parallax depth effect on star layers
 * - Color-shifting ambient glows
 * - Multiple shooting stars with varied timing
 * - Breathing nebula effects
 * - Reduced motion support
 */

const PHASE_CONFIG = {
  void: { stars: 0, nebula: 0, cosmos: 0, ambient: 0, parallax: 0 },
  stars: { stars: 1, nebula: 0, cosmos: 0, ambient: 0.3, parallax: 0.3 },
  nebula: { stars: 1, nebula: 0.6, cosmos: 0, ambient: 0.5, parallax: 0.6 },
  cosmos: { stars: 1, nebula: 1, cosmos: 1, ambient: 0.7, parallax: 1 },
};

// Generate random star positions with more variation
function generateStars(count, seed = 42) {
  const stars = [];
  let rng = seed;
  const random = () => {
    rng = (rng * 1103515245 + 12345) & 0x7fffffff;
    return rng / 0x7fffffff;
  };

  const colors = [
    'rgba(255, 255, 255, 1)',
    'rgba(200, 220, 255, 1)',
    'rgba(255, 240, 220, 1)',
    'rgba(220, 200, 255, 1)',
  ];

  for (let i = 0; i < count; i++) {
    stars.push({
      id: i,
      x: random() * 100,
      y: random() * 100,
      size: 0.5 + random() * 2.5,
      opacity: 0.3 + random() * 0.7,
      twinkleDelay: random() * 5,
      twinkleDuration: 1.5 + random() * 4,
      color: colors[Math.floor(random() * colors.length)],
      parallaxFactor: 0.5 + random() * 0.5,
    });
  }
  return stars;
}

// Generate shooting star configs
function generateShootingStars(count) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    top: 10 + Math.random() * 30,
    delay: i * 3 + Math.random() * 5,
    duration: 1.5 + Math.random() * 1,
    length: 80 + Math.random() * 60,
  }));
}

export default function ProgressiveBackground({
  phase = 'void',
  children,
  className = ''
}) {
  const config = PHASE_CONFIG[phase] || PHASE_CONFIG.void;
  const prefersReducedMotion = useReducedMotion();
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 });

  // Track mouse for subtle parallax
  useEffect(() => {
    if (prefersReducedMotion) return;

    const handleMouseMove = (e) => {
      setMousePosition({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [prefersReducedMotion]);

  // Generate stars and shooting stars once
  const stars = useMemo(() => generateStars(180), []);
  const shootingStars = useMemo(() => generateShootingStars(3), []);

  // Separate stars into layers for depth effect
  const starLayers = useMemo(() => ({
    back: stars.slice(0, 60),
    middle: stars.slice(60, 120),
    front: stars.slice(120, 180),
  }), [stars]);

  // Calculate parallax offsets based on mouse
  const parallaxX = (mousePosition.x - 0.5) * 20 * config.parallax;
  const parallaxY = (mousePosition.y - 0.5) * 20 * config.parallax;

  // Color shift animation for ambient glows
  const colorShiftKeyframes = {
    purple: ['rgba(139, 92, 246, 0.12)', 'rgba(168, 85, 247, 0.15)', 'rgba(139, 92, 246, 0.12)'],
    blue: ['rgba(59, 130, 246, 0.10)', 'rgba(99, 102, 241, 0.12)', 'rgba(59, 130, 246, 0.10)'],
    pink: ['rgba(236, 72, 153, 0.08)', 'rgba(244, 114, 182, 0.10)', 'rgba(236, 72, 153, 0.08)'],
  };

  return (
    <div className={`fixed inset-0 overflow-hidden ${className}`}>
      {/* Base gradient - always visible */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: phase === 'cosmos'
            ? 'linear-gradient(to bottom, #0a0a12, #0d0d18, #0a0a12)'
            : 'linear-gradient(to bottom, #0a0a0f, #0d0d15, #0a0a0f)',
        }}
        transition={{ duration: 3 }}
      />

      {/* Animated ambient glow layer with color shifts */}
      <motion.div
        className="absolute inset-0"
        animate={{ opacity: config.ambient }}
        transition={{ duration: 2, ease: 'easeInOut' }}
      >
        {/* Purple glow - breathing and color shifting */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-[100px]"
          animate={{
            backgroundColor: prefersReducedMotion ? colorShiftKeyframes.purple[0] : colorShiftKeyframes.purple,
            scale: prefersReducedMotion ? 1 : [1, 1.1, 1],
            x: parallaxX * -0.5,
            y: parallaxY * -0.5,
          }}
          transition={{
            backgroundColor: { duration: 8, repeat: Infinity, ease: 'easeInOut' },
            scale: { duration: 6, repeat: Infinity, ease: 'easeInOut' },
            x: { duration: 0.3 },
            y: { duration: 0.3 },
          }}
        />

        {/* Blue glow */}
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-[80px]"
          animate={{
            backgroundColor: prefersReducedMotion ? colorShiftKeyframes.blue[0] : colorShiftKeyframes.blue,
            scale: prefersReducedMotion ? 1 : [1, 1.15, 1],
            x: parallaxX * 0.3,
            y: parallaxY * 0.3,
          }}
          transition={{
            backgroundColor: { duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 },
            scale: { duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 },
            x: { duration: 0.3 },
            y: { duration: 0.3 },
          }}
        />

        {/* Pink accent glow */}
        <motion.div
          className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full blur-[60px]"
          style={{ marginLeft: -128, marginTop: -128 }}
          animate={{
            backgroundColor: prefersReducedMotion ? colorShiftKeyframes.pink[0] : colorShiftKeyframes.pink,
            scale: prefersReducedMotion ? 1 : [1, 1.2, 1],
          }}
          transition={{
            backgroundColor: { duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 4 },
            scale: { duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 3 },
          }}
        />
      </motion.div>

      {/* Stars layer - back (slowest parallax) */}
      <motion.div
        className="absolute inset-0"
        animate={{
          opacity: config.stars,
          x: parallaxX * -0.2,
          y: parallaxY * -0.2,
        }}
        transition={{
          opacity: { duration: 2, ease: 'easeInOut' },
          x: { duration: 0.5, ease: 'easeOut' },
          y: { duration: 0.5, ease: 'easeOut' },
        }}
        style={{ willChange: 'opacity, transform' }}
      >
        {starLayers.back.map((star) => (
          <motion.div
            key={star.id}
            className="absolute rounded-full"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: star.size * 0.5,
              height: star.size * 0.5,
              backgroundColor: star.color,
              opacity: star.opacity * 0.4,
            }}
            animate={prefersReducedMotion ? {} : {
              opacity: [star.opacity * 0.2, star.opacity * 0.5, star.opacity * 0.2],
            }}
            transition={{
              duration: star.twinkleDuration,
              repeat: Infinity,
              delay: star.twinkleDelay,
              ease: 'easeInOut',
            }}
          />
        ))}
      </motion.div>

      {/* Stars layer - middle (medium parallax) */}
      <motion.div
        className="absolute inset-0"
        animate={{
          opacity: config.stars,
          x: parallaxX * -0.4,
          y: parallaxY * -0.4,
        }}
        transition={{
          opacity: { duration: 2, delay: 0.3, ease: 'easeInOut' },
          x: { duration: 0.4, ease: 'easeOut' },
          y: { duration: 0.4, ease: 'easeOut' },
        }}
        style={{ willChange: 'opacity, transform' }}
      >
        {starLayers.middle.map((star) => (
          <motion.div
            key={star.id}
            className="absolute rounded-full"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: star.size * 0.7,
              height: star.size * 0.7,
              backgroundColor: star.color,
              opacity: star.opacity * 0.6,
            }}
            animate={prefersReducedMotion ? {} : {
              opacity: [star.opacity * 0.3, star.opacity * 0.7, star.opacity * 0.3],
            }}
            transition={{
              duration: star.twinkleDuration,
              repeat: Infinity,
              delay: star.twinkleDelay,
              ease: 'easeInOut',
            }}
          />
        ))}
      </motion.div>

      {/* Stars layer - front (fastest parallax, brightest) */}
      <motion.div
        className="absolute inset-0"
        animate={{
          opacity: config.stars,
          x: parallaxX * -0.6,
          y: parallaxY * -0.6,
        }}
        transition={{
          opacity: { duration: 2, delay: 0.6, ease: 'easeInOut' },
          x: { duration: 0.3, ease: 'easeOut' },
          y: { duration: 0.3, ease: 'easeOut' },
        }}
        style={{ willChange: 'opacity, transform' }}
      >
        {starLayers.front.map((star) => (
          <motion.div
            key={star.id}
            className="absolute rounded-full"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: star.size,
              height: star.size,
              background: `radial-gradient(circle, ${star.color} 0%, ${star.color} 30%, transparent 70%)`,
              boxShadow: star.size > 1.5 ? `0 0 ${star.size * 2}px ${star.color.replace('1)', '0.5)')}` : 'none',
            }}
            animate={prefersReducedMotion ? {} : {
              opacity: [star.opacity * 0.5, star.opacity, star.opacity * 0.5],
              scale: [1, 1.15, 1],
            }}
            transition={{
              duration: star.twinkleDuration,
              repeat: Infinity,
              delay: star.twinkleDelay,
              ease: 'easeInOut',
            }}
          />
        ))}
      </motion.div>

      {/* Nebula layer with breathing effect */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{
          opacity: config.nebula,
          x: parallaxX * 0.1,
          y: parallaxY * 0.1,
        }}
        transition={{
          opacity: { duration: 3, ease: 'easeInOut' },
          x: { duration: 0.6 },
          y: { duration: 0.6 },
        }}
        style={{ willChange: 'opacity, transform' }}
      >
        {/* Purple nebula - breathing */}
        <motion.div
          className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(139, 92, 246, 0.18) 0%, rgba(139, 92, 246, 0.06) 40%, transparent 70%)',
            filter: 'blur(40px)',
          }}
          animate={prefersReducedMotion ? {} : {
            scale: [1, 1.08, 1],
            rotate: [-15, -12, -15],
            x: ['-50%', '-48%', '-50%'],
            y: ['-30%', '-32%', '-30%'],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Blue nebula - breathing */}
        <motion.div
          className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(59, 130, 246, 0.15) 0%, rgba(59, 130, 246, 0.05) 40%, transparent 70%)',
            filter: 'blur(50px)',
          }}
          animate={prefersReducedMotion ? {} : {
            scale: [1, 1.1, 1],
            rotate: [20, 25, 20],
            x: ['30%', '32%', '30%'],
            y: ['20%', '18%', '20%'],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 3,
          }}
        />

        {/* Pink accent nebula */}
        <motion.div
          className="absolute top-1/2 left-1/2 w-[400px] h-[400px] rounded-full"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(236, 72, 153, 0.10) 0%, transparent 60%)',
            filter: 'blur(60px)',
            transform: 'translate(-50%, -50%)',
          }}
          animate={prefersReducedMotion ? {} : {
            scale: [1, 1.15, 1],
            opacity: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 5,
          }}
        />
      </motion.div>

      {/* Cosmos layer - full vista */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{ opacity: config.cosmos }}
        transition={{ duration: 3, ease: 'easeInOut' }}
        style={{ willChange: 'opacity' }}
      >
        {/* Central galaxy glow */}
        <motion.div
          className="absolute top-1/2 left-1/2 w-[800px] h-[400px]"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(168, 85, 247, 0.12) 0%, rgba(59, 130, 246, 0.06) 30%, transparent 60%)',
            filter: 'blur(30px)',
            transform: 'translate(-50%, -50%) rotate(-30deg)',
          }}
          animate={prefersReducedMotion ? {} : {
            rotate: [-30, -28, -30],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Multiple shooting stars */}
        {!prefersReducedMotion && shootingStars.map((star) => (
          <motion.div
            key={star.id}
            className="absolute h-0.5 bg-gradient-to-r from-transparent via-white to-transparent"
            style={{
              top: `${star.top}%`,
              left: '-10%',
              width: star.length,
            }}
            animate={{
              x: ['0vw', '130vw'],
              opacity: [0, 1, 1, 0],
            }}
            transition={{
              duration: star.duration,
              repeat: Infinity,
              repeatDelay: star.delay + 5,
              ease: 'easeIn',
              delay: star.delay,
            }}
          />
        ))}

        {/* Cosmic dust particles with varied colors */}
        {[...Array(30)].map((_, i) => {
          const colors = ['rgba(255,255,255,0.4)', 'rgba(200,220,255,0.3)', 'rgba(255,200,255,0.3)'];
          return (
            <motion.div
              key={`dust-${i}`}
              className="absolute rounded-full"
              style={{
                left: `${8 + (i * 3) % 84}%`,
                top: `${12 + (i * 5) % 76}%`,
                width: 1 + (i % 3),
                height: 1 + (i % 3),
                backgroundColor: colors[i % colors.length],
              }}
              animate={prefersReducedMotion ? {} : {
                opacity: [0.1, 0.5, 0.1],
                y: [0, -15 - (i % 10), 0],
                x: [0, (i % 2 === 0 ? 5 : -5), 0],
              }}
              transition={{
                duration: 3 + (i % 4),
                repeat: Infinity,
                delay: i * 0.2,
                ease: 'easeInOut',
              }}
            />
          );
        })}
      </motion.div>

      {/* Animated vignette */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{
          opacity: phase === 'cosmos' ? 0.6 : 0.4,
        }}
        transition={{ duration: 2 }}
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, transparent 40%, rgba(0,0,0,0.5) 100%)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 h-full">
        {children}
      </div>
    </div>
  );
}
