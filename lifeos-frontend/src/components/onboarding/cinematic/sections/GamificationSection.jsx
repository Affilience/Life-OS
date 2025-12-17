/**
 * Gamification Section - Enhanced with anime.js effects
 *
 * Interactive showcase of gamification features through a carousel.
 * Features:
 * - Staggered letter reveal with cosmic shimmer
 * - Particle curtain that parts to reveal content
 * - Ambient floating sparkles
 * - Dramatic entrance sequence
 */

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { animate, stagger } from 'animejs';
import GamificationCarousel from '../components/GamificationCarousel';
import { feedback } from '../../../../services/microInteractions';

// Floating sparkle component
const FloatingSparkle = ({ delay, duration, x, y, size }) => {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;

    // Random floating animation
    const anim = animate(ref.current, {
      translateY: [-20, 20, -20],
      translateX: [-10, 10, -10],
      opacity: [0.3, 0.8, 0.3],
      scale: [0.8, 1.2, 0.8],
      duration: duration,
      delay: delay,
      loop: true,
      ease: 'inOutSine',
    });

    return () => anim.pause();
  }, [delay, duration]);

  return (
    <div
      ref={ref}
      className="floating-sparkle"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: size,
        height: size,
      }}
    />
  );
};

// Particle curtain component
const ParticleCurtain = ({ isParting, onPartComplete }) => {
  const curtainRef = useRef(null);
  const particlesRef = useRef([]);
  const particleCount = 40;

  // Generate particle positions
  const particles = useMemo(() => {
    return Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 3 + Math.random() * 4,
      delay: Math.random() * 500,
    }));
  }, []);

  useEffect(() => {
    if (!isParting || !curtainRef.current) return;

    // Animate particles outward (parting effect)
    particlesRef.current.forEach((particle, i) => {
      if (!particle) return;

      const centerX = 50;
      const particleX = particles[i].x;
      const direction = particleX < centerX ? -1 : 1;

      animate(particle, {
        translateX: [0, direction * (100 + Math.random() * 50)],
        translateY: [0, (Math.random() - 0.5) * 100],
        opacity: [1, 0],
        scale: [1, 0.5],
        duration: 800 + Math.random() * 400,
        delay: particles[i].delay,
        ease: 'outExpo',
      });
    });

    // Fade out curtain backdrop
    animate(curtainRef.current, {
      opacity: [1, 0],
      duration: 1200,
      ease: 'outExpo',
      onComplete: onPartComplete,
    });
  }, [isParting, particles, onPartComplete]);

  return (
    <div ref={curtainRef} className="particle-curtain">
      {particles.map((p, i) => (
        <div
          key={p.id}
          ref={(el) => (particlesRef.current[i] = el)}
          className="curtain-particle"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
          }}
        />
      ))}
    </div>
  );
};

export default function GamificationSection({
  isActive,
  progress,
  onComplete,
}) {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [showCurtain, setShowCurtain] = useState(true);
  const [curtainParting, setCurtainParting] = useState(false);
  const [contentRevealed, setContentRevealed] = useState(false);

  // Generate sparkles
  const sparkles = useMemo(() => {
    return Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: 5 + Math.random() * 90,
      y: 5 + Math.random() * 90,
      size: `${4 + Math.random() * 6}px`,
      delay: Math.random() * 2000,
      duration: 3000 + Math.random() * 2000,
    }));
  }, []);

  // Entrance animation
  useEffect(() => {
    if (!isActive || hasAnimated) return;

    const section = sectionRef.current;
    if (!section) return;

    setHasAnimated(true);

    // Start the reveal sequence

    // 1. Part the particle curtain
    setTimeout(() => {
      setCurtainParting(true);
    }, 300);

    // 2. After curtain parts, animate title letter by letter
    setTimeout(() => {
      const titleEl = titleRef.current;
      if (titleEl) {
        const letters = titleEl.querySelectorAll('.title-letter');

        // Animate each letter
        animate(letters, {
          opacity: [0, 1],
          translateY: [30, 0],
          scale: [0.5, 1],
          duration: 600,
          delay: stagger(50),
          ease: 'outBack',
        });

        // Add shimmer effect after letters appear
        setTimeout(() => {
          animate(letters, {
            color: ['#ffffff', '#c084fc', '#ec4899', '#ffffff'],
            duration: 1500,
            delay: stagger(30),
            ease: 'inOutQuad',
          });
        }, 800);
      }
    }, 1000);

    // 3. Animate subtitle
    setTimeout(() => {
      animate(section.querySelector('.gamification-subtitle'), {
        opacity: [0, 1],
        y: [20, 0],
        duration: 600,
        ease: 'outExpo',
      });
    }, 1500);

    // 4. Animate carousel with dramatic entrance
    setTimeout(() => {
      const wrapper = section.querySelector('.gamification-carousel-wrapper');
      if (wrapper) {
        animate(wrapper, {
          opacity: [0, 1],
          scale: [0.9, 1],
          translateY: [30, 0],
          duration: 800,
          ease: 'outExpo',
        });
      }
      setContentRevealed(true);
    }, 1800);

    feedback.taskComplete();
  }, [isActive, hasAnimated]);

  // Handle curtain part complete
  const handleCurtainPartComplete = () => {
    setShowCurtain(false);
  };

  // Split title into letters
  const titleText = "Level up your life";
  const titleLetters = titleText.split('').map((letter, i) => (
    <span
      key={i}
      className={`title-letter ${letter === ' ' ? 'space' : ''}`}
      style={{ opacity: 0 }}
    >
      {letter === ' ' ? '\u00A0' : letter}
    </span>
  ));

  return (
    <div ref={sectionRef} className="gamification-section">
      {/* Particle curtain */}
      {showCurtain && (
        <ParticleCurtain
          isParting={curtainParting}
          onPartComplete={handleCurtainPartComplete}
        />
      )}

      {/* Ambient sparkles */}
      <div className="sparkles-container">
        {sparkles.map((sparkle) => (
          <FloatingSparkle
            key={sparkle.id}
            x={sparkle.x}
            y={sparkle.y}
            size={sparkle.size}
            delay={sparkle.delay}
            duration={sparkle.duration}
          />
        ))}
      </div>

      {/* Ambient glow */}
      <div className="gamification-glow" />
      <div className="gamification-glow secondary" />

      {/* Title with letter animation */}
      <h2 ref={titleRef} className="gamification-title">
        {titleLetters}
      </h2>

      {/* Subtitle */}
      <p className="gamification-subtitle" style={{ opacity: 0 }}>
        Play with these features - they're waiting for you
      </p>

      {/* Carousel */}
      <div className="gamification-carousel-wrapper" style={{ opacity: 0 }}>
        <GamificationCarousel
          isActive={isActive && contentRevealed}
          onComplete={onComplete}
          scrollProgress={progress}
        />
      </div>

      <style>{`
        .gamification-section {
          position: relative;
          max-width: 600px;
          margin: 0 auto;
          text-align: center;
          padding: 1rem;
          overflow: visible;
        }

        /* Particle curtain */
        .particle-curtain {
          position: absolute;
          inset: 0;
          z-index: 10;
          pointer-events: none;
          background: radial-gradient(
            ellipse at center,
            rgba(139, 92, 246, 0.1) 0%,
            transparent 70%
          );
        }

        .curtain-particle {
          position: absolute;
          background: radial-gradient(circle, #c084fc 0%, #8b5cf6 100%);
          border-radius: 50%;
          box-shadow: 0 0 8px rgba(192, 132, 252, 0.6);
        }

        /* Floating sparkles */
        .sparkles-container {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          overflow: hidden;
        }

        .floating-sparkle {
          position: absolute;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.8) 0%, transparent 70%);
          border-radius: 50%;
          filter: blur(1px);
        }

        /* Ambient glows */
        .gamification-glow {
          position: absolute;
          left: 50%;
          top: 20%;
          transform: translate(-50%, -50%);
          width: 500px;
          height: 500px;
          background: radial-gradient(
            circle,
            rgba(139, 92, 246, 0.15) 0%,
            rgba(236, 72, 153, 0.05) 40%,
            transparent 70%
          );
          pointer-events: none;
          z-index: -1;
          animation: glowPulse 4s ease-in-out infinite;
        }

        .gamification-glow.secondary {
          top: 60%;
          width: 400px;
          height: 400px;
          background: radial-gradient(
            circle,
            rgba(236, 72, 153, 0.1) 0%,
            rgba(139, 92, 246, 0.05) 40%,
            transparent 70%
          );
          animation-delay: 2s;
        }

        @keyframes glowPulse {
          0%, 100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.8;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.1);
            opacity: 1;
          }
        }

        /* Title with letter animation */
        .gamification-title {
          font-size: clamp(1.75rem, 5vw, 2.5rem);
          font-weight: 700;
          margin-bottom: 0.5rem;
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 0;
          position: relative;
          z-index: 1;
        }

        .title-letter {
          display: inline-block;
          background: linear-gradient(135deg, #ffffff 0%, #c4b5fd 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          will-change: transform, opacity;
        }

        .title-letter.space {
          width: 0.3em;
        }

        .gamification-subtitle {
          font-size: 1rem;
          color: rgba(255, 255, 255, 0.5);
          margin-bottom: 2rem;
          position: relative;
          z-index: 1;
        }

        .gamification-carousel-wrapper {
          width: 100%;
          position: relative;
          z-index: 1;
        }

        /* Decorative lines */
        .gamification-section::before,
        .gamification-section::after {
          content: '';
          position: absolute;
          width: 100px;
          height: 2px;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(139, 92, 246, 0.3),
            transparent
          );
          top: 0;
          animation: linePulse 3s ease-in-out infinite;
        }

        .gamification-section::before {
          left: 10%;
          animation-delay: 0s;
        }

        .gamification-section::after {
          right: 10%;
          animation-delay: 1.5s;
        }

        @keyframes linePulse {
          0%, 100% {
            opacity: 0.3;
            width: 80px;
          }
          50% {
            opacity: 0.7;
            width: 120px;
          }
        }

        @media (max-width: 640px) {
          .gamification-section {
            padding: 0.5rem;
          }

          .gamification-subtitle {
            font-size: 0.9rem;
            margin-bottom: 1.5rem;
          }

          .gamification-glow {
            width: 300px;
            height: 300px;
          }

          .gamification-glow.secondary {
            width: 250px;
            height: 250px;
          }
        }
      `}</style>
    </div>
  );
}
