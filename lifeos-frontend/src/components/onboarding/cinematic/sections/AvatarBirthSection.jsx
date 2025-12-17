/**
 * Avatar Birth Section
 *
 * Dramatic reveal of the user's avatar with particle effects.
 * Features:
 * - Swirling particle vortex
 * - Avatar materializes from particles
 * - Energy burst on reveal
 * - Floating cosmic elements
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { animate, stagger, createTimeline } from 'animejs';
import { feedback } from '../../../../services/microInteractions';

// Particle component
const Particle = ({ index, total }) => {
  const angle = (index / total) * Math.PI * 2;
  const radius = 100 + Math.random() * 50;
  const size = 2 + Math.random() * 4;
  const delay = Math.random() * 2;
  const duration = 2 + Math.random() * 2;

  return (
    <div
      className="birth-particle"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        left: '50%',
        top: '50%',
        '--start-x': `${Math.cos(angle) * radius}px`,
        '--start-y': `${Math.sin(angle) * radius}px`,
        '--delay': `${delay}s`,
        '--duration': `${duration}s`,
      }}
    />
  );
};

// Energy ring component
const EnergyRing = ({ delay, scale }) => (
  <div
    className="energy-ring"
    style={{
      animationDelay: `${delay}s`,
      transform: `scale(${scale})`,
    }}
  />
);

export default function AvatarBirthSection({
  isActive,
  progress,
  onComplete,
  username,
}) {
  const sectionRef = useRef(null);
  const avatarRef = useRef(null);
  const containerRef = useRef(null);
  const [phase, setPhase] = useState(0); // 0: waiting, 1: gathering, 2: forming, 3: revealed
  const [hasAnimated, setHasAnimated] = useState(false);

  // Avatar sprite path (using first stage)
  const avatarSprite = '/assets/avatar/base/hero_base.png';

  // Run birth animation when section becomes active
  useEffect(() => {
    if (!isActive || hasAnimated) return;

    const section = sectionRef.current;
    if (!section) return;

    // Start the sequence
    const runSequence = async () => {
      // Phase 1: Title fades in
      await animate(section.querySelector('.avatar-title'), {
        opacity: [0, 1],
        y: [40, 0],
        duration: 800,
        ease: 'outExpo',
      }).finished;

      // Phase 2: Particles start gathering
      setPhase(1);
      feedback.buttonPress();

      await new Promise(resolve => setTimeout(resolve, 2000));

      // Phase 3: Avatar forms
      setPhase(2);
      feedback.taskComplete();

      // Animate avatar appearing
      const avatar = avatarRef.current;
      if (avatar) {
        await animate(avatar, {
          scale: [0, 1.2, 1],
          opacity: [0, 1],
          rotate: [180, 0],
          duration: 1200,
          ease: 'outElastic(1, 0.5)',
        }).finished;
      }

      // Phase 4: Reveal complete
      setPhase(3);
      feedback.achievement();

      // Animate message
      await animate(section.querySelector('.avatar-message'), {
        opacity: [0, 1],
        y: [20, 0],
        duration: 600,
        ease: 'outExpo',
      }).finished;

      setHasAnimated(true);

      // Auto-continue after delay
      setTimeout(() => {
        onComplete?.();
      }, 1500);
    };

    runSequence();
  }, [isActive, hasAnimated, onComplete]);

  return (
    <div ref={sectionRef} className="avatar-section">
      <h2 className="avatar-title" style={{ opacity: 0 }}>
        Your avatar awakens
      </h2>

      <div ref={containerRef} className="avatar-container">
        {/* Background glow */}
        <div className={`avatar-glow ${phase >= 1 ? 'active' : ''}`} />

        {/* Particle vortex */}
        <div className={`avatar-particles ${phase >= 1 ? 'gathering' : ''} ${phase >= 2 ? 'converged' : ''}`}>
          {[...Array(60)].map((_, i) => (
            <Particle key={i} index={i} total={60} />
          ))}
        </div>

        {/* Energy rings */}
        {phase >= 2 && (
          <div className="energy-rings">
            <EnergyRing delay={0} scale={1} />
            <EnergyRing delay={0.2} scale={0.7} />
            <EnergyRing delay={0.4} scale={0.4} />
          </div>
        )}

        {/* Avatar sprite */}
        <img
          ref={avatarRef}
          src={avatarSprite}
          alt="Your Avatar"
          className={`avatar-sprite ${phase >= 2 ? 'visible' : ''}`}
          style={{ opacity: 0 }}
        />

        {/* Sparkle effects */}
        {phase >= 3 && (
          <div className="avatar-sparkles">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="sparkle"
                style={{
                  left: `${20 + Math.random() * 60}%`,
                  top: `${20 + Math.random() * 60}%`,
                  animationDelay: `${i * 0.15}s`,
                }}
              />
            ))}
          </div>
        )}
      </div>

      <p className="avatar-message" style={{ opacity: 0 }}>
        {username ? (
          <>
            <span className="avatar-name">{username}</span>, your journey begins now.
            <br />
            <span className="avatar-subtext">Every action you take will shape who you become.</span>
          </>
        ) : (
          <>
            Your avatar is ready to grow with you.
            <br />
            <span className="avatar-subtext">Every action you take will shape who you become.</span>
          </>
        )}
      </p>

      <style>{`
        .avatar-section {
          position: relative;
          text-align: center;
        }

        .avatar-title {
          font-size: clamp(1.75rem, 5vw, 2.5rem);
          font-weight: 700;
          color: white;
          margin-bottom: 2rem;
        }

        .avatar-container {
          position: relative;
          width: 320px;
          height: 320px;
          margin: 0 auto 2rem;
        }

        .avatar-glow {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          width: 200px;
          height: 200px;
          background: radial-gradient(circle, rgba(139, 92, 246, 0.6) 0%, transparent 70%);
          border-radius: 50%;
          opacity: 0;
          transition: opacity 0.5s ease;
          filter: blur(20px);
        }

        .avatar-glow.active {
          opacity: 1;
          animation: pulseGlow 2s ease-in-out infinite;
        }

        @keyframes pulseGlow {
          0%, 100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.6;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.3);
            opacity: 1;
          }
        }

        .avatar-particles {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .birth-particle {
          position: absolute;
          background: linear-gradient(135deg, #8b5cf6, #ec4899);
          border-radius: 50%;
          opacity: 0;
          transform: translate(-50%, -50%) translate(var(--start-x), var(--start-y));
        }

        .avatar-particles.gathering .birth-particle {
          opacity: 1;
          animation: gatherParticle var(--duration) ease-in-out infinite;
          animation-delay: var(--delay);
        }

        .avatar-particles.converged .birth-particle {
          animation: convergeParticle 0.8s ease-in forwards;
          animation-delay: calc(var(--delay) * 0.2);
        }

        @keyframes gatherParticle {
          0%, 100% {
            transform: translate(-50%, -50%) translate(var(--start-x), var(--start-y)) scale(1);
            opacity: 0.8;
          }
          50% {
            transform: translate(-50%, -50%) translate(calc(var(--start-x) * 0.5), calc(var(--start-y) * 0.5)) scale(1.5);
            opacity: 1;
          }
        }

        @keyframes convergeParticle {
          0% {
            transform: translate(-50%, -50%) translate(var(--start-x), var(--start-y));
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) translate(0, 0);
            opacity: 0;
          }
        }

        .energy-rings {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          width: 100%;
          height: 100%;
          pointer-events: none;
        }

        .energy-ring {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 200px;
          height: 200px;
          border: 2px solid rgba(168, 85, 247, 0.6);
          border-radius: 50%;
          transform: translate(-50%, -50%);
          animation: expandRing 1s ease-out forwards;
        }

        @keyframes expandRing {
          0% {
            transform: translate(-50%, -50%) scale(0);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) scale(2);
            opacity: 0;
          }
        }

        .avatar-sprite {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 180px;
          height: 180px;
          image-rendering: pixelated;
          image-rendering: crisp-edges;
          transform-origin: center;
          filter: drop-shadow(0 0 20px rgba(139, 92, 246, 0.5));
        }

        .avatar-sparkles {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .sparkle {
          position: absolute;
          width: 8px;
          height: 8px;
          animation: sparkle 1s ease-in-out infinite;
        }

        .sparkle::before,
        .sparkle::after {
          content: '';
          position: absolute;
          background: white;
        }

        .sparkle::before {
          width: 100%;
          height: 2px;
          top: 50%;
          left: 0;
          transform: translateY(-50%);
        }

        .sparkle::after {
          width: 2px;
          height: 100%;
          left: 50%;
          top: 0;
          transform: translateX(-50%);
        }

        @keyframes sparkle {
          0%, 100% {
            transform: scale(0) rotate(0deg);
            opacity: 0;
          }
          50% {
            transform: scale(1) rotate(90deg);
            opacity: 1;
          }
        }

        .avatar-message {
          font-size: 1.25rem;
          color: rgba(255, 255, 255, 0.8);
          line-height: 1.8;
        }

        .avatar-name {
          color: #a855f7;
          font-weight: 700;
        }

        .avatar-subtext {
          font-size: 1rem;
          color: rgba(255, 255, 255, 0.5);
        }
      `}</style>
    </div>
  );
}
