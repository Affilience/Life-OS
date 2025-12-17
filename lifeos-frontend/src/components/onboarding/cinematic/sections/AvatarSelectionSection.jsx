/**
 * Avatar Selection Section
 *
 * Choose between Hero (male) and Heroine (female) avatar.
 * Features:
 * - Floating animation with subtle rotation
 * - Orbiting particle aura
 * - Power pulse breathing effect
 * - Dramatic selection transformation with energy burst
 * - Light beam effect on selection
 * - Non-selected avatar fades gracefully
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { animate, stagger, createTimeline } from 'animejs';
import { feedback } from '../../../../services/microInteractions';
import { useAvatarStore } from '../../../../stores/avatarStore';
import { useNewOnboardingStore } from '../../../../stores/newOnboardingStore';

const AVATARS = [
  {
    id: 'male',
    name: 'Hero',
    tagline: 'The Valiant Warrior',
    description: 'Walk the path of the brave hero, wielding strength and courage to overcome any challenge.',
    spritePath: '/assets/avatar/evolution/hero_v3_stage_10_swordsman.png',
    glowColor: '#3b82f6',
    particleColor: '#60a5fa',
    borderColor: 'rgba(59, 130, 246, 0.6)',
  },
  {
    id: 'female',
    name: 'Heroine',
    tagline: 'The Fearless Champion',
    description: 'Walk the path of the brave heroine, combining grace and power to forge your destiny.',
    spritePath: '/assets/avatar/evolution/heroine_v3_stage_10_swordsman.png',
    glowColor: '#ec4899',
    particleColor: '#f472b6',
    borderColor: 'rgba(236, 72, 153, 0.6)',
  },
];

// Particle component for orbiting effect
function ParticleOrbit({ color, count = 8, radius = 90, speed = 20 }) {
  return (
    <div className="particle-orbit-container">
      {[...Array(count)].map((_, i) => {
        const angle = (i / count) * 360;
        const delay = (i / count) * speed;
        const size = 3 + Math.random() * 3;

        return (
          <div
            key={i}
            className="orbit-particle"
            style={{
              '--angle': `${angle}deg`,
              '--radius': `${radius}px`,
              '--delay': `-${delay}s`,
              '--duration': `${speed}s`,
              '--size': `${size}px`,
              '--color': color,
            }}
          />
        );
      })}
    </div>
  );
}

export default function AvatarSelectionSection({
  isActive,
  progress,
  onComplete,
}) {
  const sectionRef = useRef(null);
  const cardsRef = useRef([]);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [isSelecting, setIsSelecting] = useState(false);

  // Store connections
  const { setCharacterGender } = useAvatarStore();
  const { updateProfile, profile } = useNewOnboardingStore();

  // Initialize with existing selection
  useEffect(() => {
    if (profile?.gender) {
      setSelectedAvatar(profile.gender);
    }
  }, [profile]);

  // Entrance animation with dramatic reveal
  useEffect(() => {
    if (!isActive || hasAnimated) return;

    const section = sectionRef.current;
    if (!section) return;

    const timeline = createTimeline({
      defaults: { ease: 'outExpo' }
    });

    // Title reveal with slight bounce
    timeline.add(section.querySelector('.avatar-title'), {
      opacity: [0, 1],
      y: [60, 0],
      duration: 1000,
    }, 0);

    // Subtitle fade in
    timeline.add(section.querySelector('.avatar-subtitle'), {
      opacity: [0, 1],
      y: [40, 0],
      duration: 800,
    }, 200);

    // Cards emerge from below with stagger and scale
    const cards = section.querySelectorAll('.avatar-card');
    timeline.add(cards, {
      opacity: [0, 1],
      y: [100, 0],
      scale: [0.8, 1],
      rotateY: [15, 0],
      duration: 1000,
      delay: stagger(150),
      ease: 'outBack',
    }, 400);

    // Start floating animation after entrance
    setTimeout(() => {
      cards.forEach((card, i) => {
        animate(card, {
          y: [0, -8, 0],
          rotate: [-0.5, 0.5, -0.5],
          duration: 4000 + i * 500,
          loop: true,
          ease: 'inOutSine',
        });
      });
    }, 1500);

    setHasAnimated(true);
  }, [isActive, hasAnimated]);

  // Handle avatar selection with dramatic effects
  const handleSelectAvatar = useCallback((avatarId) => {
    if (isSelecting) return;
    setIsSelecting(true);
    setSelectedAvatar(avatarId);

    // Update stores
    setCharacterGender(avatarId);
    updateProfile({ gender: avatarId });
    feedback.buttonPress();

    const selectedIndex = AVATARS.findIndex(a => a.id === avatarId);
    const selectedCard = cardsRef.current[selectedIndex];
    const otherCard = cardsRef.current[1 - selectedIndex];
    const avatar = AVATARS[selectedIndex];

    // Create dramatic selection timeline
    const timeline = createTimeline();

    // Selected card - power up sequence
    if (selectedCard) {
      // Initial pulse
      timeline.add(selectedCard, {
        scale: [1, 1.15],
        duration: 300,
        ease: 'outQuad',
      }, 0);

      // Energy burst - animate the ring
      const ring = selectedCard.querySelector('.selection-ring');
      if (ring) {
        ring.style.borderColor = avatar.glowColor;
        timeline.add(ring, {
          scale: [0.5, 3],
          opacity: [1, 0],
          duration: 800,
          ease: 'outQuad',
        }, 100);
      }

      // Light beam shoot up
      const beam = selectedCard.querySelector('.light-beam');
      if (beam) {
        beam.style.background = `linear-gradient(to top, ${avatar.glowColor}, transparent)`;
        timeline.add(beam, {
          scaleY: [0, 1],
          opacity: [0, 0.8, 0],
          duration: 1000,
          ease: 'outExpo',
        }, 200);
      }

      // Particle burst
      const particles = selectedCard.querySelectorAll('.burst-particle');
      particles.forEach((particle, i) => {
        const angle = (i / particles.length) * Math.PI * 2;
        const distance = 80 + Math.random() * 60;

        animate(particle, {
          translateX: [0, Math.cos(angle) * distance],
          translateY: [0, Math.sin(angle) * distance],
          scale: [1, 0],
          opacity: [1, 0],
          duration: 600 + Math.random() * 300,
          delay: 150,
          ease: 'outQuad',
        });
      });

      // Settle to selected state
      timeline.add(selectedCard, {
        scale: [1.15, 1.05],
        duration: 400,
        ease: 'outBack',
      }, 500);
    }

    // Other card - graceful fade away
    if (otherCard) {
      timeline.add(otherCard, {
        scale: [1, 0.9],
        opacity: [1, 0.3],
        filter: ['blur(0px)', 'blur(4px)'],
        duration: 600,
        ease: 'outQuad',
      }, 200);
    }

    // Complete after animation
    setTimeout(() => {
      feedback.taskComplete();
      onComplete?.();
    }, 1200);
  }, [setCharacterGender, updateProfile, onComplete, isSelecting]);

  return (
    <div ref={sectionRef} className="avatar-section">
      <h2 className="avatar-title" style={{ opacity: 0 }}>
        Choose Your Avatar
      </h2>

      <p className="avatar-subtitle" style={{ opacity: 0 }}>
        Your companion will evolve alongside you on your journey
      </p>

      <div className="avatar-cards">
        {AVATARS.map((avatar, index) => {
          const isSelected = selectedAvatar === avatar.id;
          const isOther = selectedAvatar && !isSelected;

          return (
            <div
              key={avatar.id}
              ref={el => cardsRef.current[index] = el}
              className={`avatar-card ${isSelected ? 'selected' : ''} ${isOther ? 'not-selected' : ''} ${avatar.id}`}
              onClick={() => !isSelecting && handleSelectAvatar(avatar.id)}
              style={{
                opacity: 0,
                '--glow-color': avatar.glowColor,
                '--particle-color': avatar.particleColor,
              }}
            >
              {/* Selection effects container */}
              <div className="selection-effects">
                <div className="selection-ring" />
                <div className="light-beam" />
                {/* Burst particles */}
                <div className="burst-particles">
                  {[...Array(16)].map((_, i) => (
                    <div
                      key={i}
                      className="burst-particle"
                      style={{ background: avatar.particleColor }}
                    />
                  ))}
                </div>
              </div>

              {/* Selection badge */}
              {isSelected && (
                <div className="avatar-selected-badge">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}

              {/* Background glow */}
              <div className="avatar-glow" />

              {/* Avatar sprite container */}
              <div className="avatar-sprite-container">
                {/* Particle orbit - inside container for perfect centering */}
                <div className="particle-orbit-wrapper">
                  <ParticleOrbit color={avatar.particleColor} count={10} radius={85} speed={15} />
                </div>

                {/* Inner glow */}
                <div className="avatar-inner-glow" />

                {/* Power pulse rings */}
                <div className="power-pulse-ring ring-1" />
                <div className="power-pulse-ring ring-2" />
                <div className="power-pulse-ring ring-3" />

                {/* Avatar sprite */}
                <img
                  src={avatar.spritePath}
                  alt={avatar.name}
                  className="avatar-sprite"
                />
              </div>

              {/* Content */}
              <h3 className="avatar-name">{avatar.name}</h3>
              <p className="avatar-tagline">{avatar.tagline}</p>
              <p className="avatar-description">{avatar.description}</p>
            </div>
          );
        })}
      </div>

      <style>{`
        .avatar-section {
          position: relative;
          max-width: 950px;
          margin: 0 auto;
          text-align: center;
          padding: 0 1rem;
        }

        .avatar-title {
          font-size: clamp(1.75rem, 5vw, 2.75rem);
          font-weight: 800;
          color: white;
          margin-bottom: 0.75rem;
          text-shadow: 0 0 40px rgba(139, 92, 246, 0.3);
        }

        .avatar-subtitle {
          font-size: 1.1rem;
          color: rgba(255, 255, 255, 0.6);
          margin-bottom: 3rem;
          max-width: 500px;
          margin-left: auto;
          margin-right: auto;
        }

        .avatar-cards {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 2.5rem;
          max-width: 800px;
          margin: 0 auto;
        }

        @media (max-width: 700px) {
          .avatar-cards {
            grid-template-columns: 1fr;
            max-width: 380px;
          }
        }

        .avatar-card {
          position: relative;
          padding: 2.5rem 2rem 2rem;
          background: rgba(15, 10, 30, 0.8);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 28px;
          cursor: pointer;
          transition: border-color 0.3s ease, background 0.3s ease;
          overflow: visible;
          text-align: center;
        }

        .avatar-card:hover:not(.selected):not(.not-selected) {
          border-color: rgba(255, 255, 255, 0.25);
          background: rgba(20, 15, 40, 0.9);
        }

        .avatar-card:hover:not(.selected):not(.not-selected) .particle-orbit-wrapper {
          opacity: 1;
        }

        .avatar-card:hover:not(.selected):not(.not-selected) .avatar-sprite {
          animation-duration: 1.5s;
        }

        .avatar-card.selected {
          border-color: var(--glow-color);
          background: rgba(var(--glow-color), 0.1);
        }

        .avatar-card.not-selected {
          pointer-events: none;
        }

        /* Selection effects */
        .selection-effects {
          position: absolute;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
          border-radius: 28px;
        }

        .selection-ring {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 100px;
          height: 100px;
          margin: -50px 0 0 -50px;
          border: 3px solid var(--glow-color);
          border-radius: 50%;
          opacity: 0;
        }

        .light-beam {
          position: absolute;
          top: -200px;
          left: 50%;
          width: 80px;
          margin-left: -40px;
          height: 400px;
          opacity: 0;
          transform-origin: bottom center;
          pointer-events: none;
        }

        .burst-particles {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
        }

        .burst-particle {
          position: absolute;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          opacity: 0;
          box-shadow: 0 0 10px currentColor;
        }

        /* Selection badge */
        .avatar-selected-badge {
          position: absolute;
          top: 16px;
          right: 16px;
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, #10b981, #059669);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: badgePop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          z-index: 10;
          box-shadow: 0 0 20px rgba(16, 185, 129, 0.5);
        }

        @keyframes badgePop {
          from { transform: scale(0) rotate(-180deg); }
          to { transform: scale(1) rotate(0deg); }
        }

        /* Background glow */
        .avatar-glow {
          position: absolute;
          inset: -60px;
          background: radial-gradient(circle at center, var(--glow-color) 0%, transparent 70%);
          opacity: 0.15;
          transition: opacity 0.4s ease;
          pointer-events: none;
        }

        .avatar-card:hover .avatar-glow,
        .avatar-card.selected .avatar-glow {
          opacity: 0.3;
        }

        /* Particle orbit */
        .particle-orbit-wrapper {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 180px;
          height: 180px;
          opacity: 0.6;
          transition: opacity 0.3s ease;
          pointer-events: none;
        }

        .avatar-card.selected .particle-orbit-wrapper {
          opacity: 1;
        }

        .particle-orbit-container {
          position: relative;
          width: 100%;
          height: 100%;
        }

        .orbit-particle {
          position: absolute;
          left: 50%;
          top: 50%;
          width: var(--size);
          height: var(--size);
          /* Offset by half size to center the particle on its position */
          margin-left: calc(var(--size) / -2);
          margin-top: calc(var(--size) / -2);
          background: var(--color);
          border-radius: 50%;
          box-shadow: 0 0 8px var(--color);
          animation: orbit var(--duration) linear infinite;
          animation-delay: var(--delay);
        }

        @keyframes orbit {
          from {
            transform: rotate(0deg) translateX(var(--radius)) rotate(0deg);
          }
          to {
            transform: rotate(360deg) translateX(var(--radius)) rotate(-360deg);
          }
        }

        /* Avatar sprite container */
        .avatar-sprite-container {
          position: relative;
          width: 180px;
          height: 180px;
          margin: 0 auto 1.5rem;
          /* No flexbox - use absolute positioning for all children */
        }

        .avatar-inner-glow {
          position: absolute;
          inset: 20px;
          background: radial-gradient(circle at center, var(--glow-color) 0%, transparent 70%);
          opacity: 0.2;
          border-radius: 50%;
          filter: blur(20px);
        }

        /* Power pulse rings */
        .power-pulse-ring {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 160px;
          height: 160px;
          transform: translate(-50%, -50%);
          border: 1px solid var(--glow-color);
          border-radius: 50%;
          opacity: 0;
        }

        .avatar-card:hover .power-pulse-ring,
        .avatar-card.selected .power-pulse-ring {
          animation: powerPulse 2s ease-out infinite;
        }

        .power-pulse-ring.ring-1 { animation-delay: 0s; }
        .power-pulse-ring.ring-2 { animation-delay: 0.6s; }
        .power-pulse-ring.ring-3 { animation-delay: 1.2s; }

        @keyframes powerPulse {
          0% {
            transform: translate(-50%, -50%) scale(0.8);
            opacity: 0.6;
          }
          100% {
            transform: translate(-50%, -50%) scale(1.5);
            opacity: 0;
          }
        }

        /* Avatar sprite */
        .avatar-sprite {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 2;
          width: 120px;
          height: 120px;
          object-fit: contain;
          image-rendering: pixelated;
          filter: drop-shadow(0 0 20px var(--glow-color));
        }

        /* Float animation removed - avatar now uses absolute centering */

        /* Content */
        .avatar-name {
          font-size: 1.6rem;
          font-weight: 800;
          color: white;
          margin-bottom: 0.35rem;
          position: relative;
          z-index: 1;
        }

        .avatar-tagline {
          font-size: 1rem;
          font-weight: 600;
          color: var(--glow-color);
          margin-bottom: 0.75rem;
          position: relative;
          z-index: 1;
        }

        .avatar-description {
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.5);
          line-height: 1.6;
          position: relative;
          z-index: 1;
        }

        /* Male specific */
        .avatar-card.male {
          --glow-color: #3b82f6;
          --particle-color: #60a5fa;
        }

        /* Female specific */
        .avatar-card.female {
          --glow-color: #ec4899;
          --particle-color: #f472b6;
        }
      `}</style>
    </div>
  );
}
