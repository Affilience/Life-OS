/**
 * ImmersiveHeroSelect - Choose Your Character
 *
 * Hero/Heroine character selection with animated sprites.
 * Uses IntersectionObserver for entrance animations.
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { feedback } from '../../../../services/microInteractions';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// Character options - using stage 10 (swordsman) as base for mature look
const CHARACTERS = [
  {
    id: 'male',
    name: 'Hero',
    tagline: 'Champion of Light',
    description: 'A brave warrior destined for greatness.',
    sprite: '/assets/avatar/base-evolution/hero_base_stage_10_swordsman.png',
    previewSprite: '/assets/avatar/base-evolution/hero_base_stage_20_veteran.png',
    gradient: 'from-blue-500 via-cyan-500 to-teal-500',
    glowColor: 'rgba(59, 130, 246, 0.4)',
    color: '#3b82f6',
  },
  {
    id: 'female',
    name: 'Heroine',
    tagline: 'Guardian of Dawn',
    description: 'A fierce protector of the realm.',
    sprite: '/assets/avatar/base-evolution/heroine_base_stage_10_swordsman.png',
    previewSprite: '/assets/avatar/base-evolution/heroine_base_stage_20_veteran.png',
    gradient: 'from-pink-500 via-purple-500 to-violet-500',
    glowColor: 'rgba(236, 72, 153, 0.4)',
    color: '#ec4899',
  },
];

export default function ImmersiveHeroSelect({
  sectionId,
  onComplete,
  onLockScroll,
  onSectionEnter,
  characterGender,
  setCharacterGender,
}) {
  // Detect touch device for appropriate text
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const cardsContainerRef = useRef(null);
  const cardRefs = useRef([]);
  const promptRef = useRef(null);
  const [hasSelected, setHasSelected] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState(characterGender || null);
  const [hoveredCharacter, setHoveredCharacter] = useState(null);
  const [isInView, setIsInView] = useState(false);

  // Store callbacks in refs
  const onCompleteRef = useRef(onComplete);
  const onLockScrollRef = useRef(onLockScroll);
  const onSectionEnterRef = useRef(onSectionEnter);
  useEffect(() => {
    onCompleteRef.current = onComplete;
    onLockScrollRef.current = onLockScroll;
    onSectionEnterRef.current = onSectionEnter;
  }, [onComplete, onLockScroll, onSectionEnter]);

  // Auto-play entrance animation when section comes into view
  useEffect(() => {
    if (!sectionRef.current || typeof window === 'undefined') return;

    const section = sectionRef.current;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isInView) {
            setIsInView(true);
            onSectionEnterRef.current?.();

            // Play entrance animations
            const entranceTl = gsap.timeline();

            if (titleRef.current) {
              entranceTl.fromTo(titleRef.current,
                { opacity: 0, y: 80, scale: 0.9, filter: 'blur(10px)' },
                { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: 0.6, ease: 'power3.out' },
                0
              );
            }

            if (subtitleRef.current) {
              entranceTl.fromTo(subtitleRef.current,
                { opacity: 0, y: 40 },
                { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' },
                0.2
              );
            }

            // Cards animate in from sides
            cardRefs.current.forEach((card, i) => {
              if (!card) return;
              const startX = i === 0 ? -200 : 200;
              entranceTl.fromTo(card,
                { opacity: 0, x: startX, rotateY: i === 0 ? -20 : 20, scale: 0.8 },
                { opacity: 1, x: 0, rotateY: 0, scale: 1, duration: 0.7, ease: 'back.out(1.2)' },
                0.3 + (i * 0.15)
              );
            });

            if (promptRef.current) {
              entranceTl.fromTo(promptRef.current,
                { opacity: 0, y: 20 },
                { opacity: 0.6, y: 0, duration: 0.4, ease: 'power2.out' },
                0.7
              );
            }
          }
        });
      },
      { threshold: 0.3 }
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, [isInView]);

  // Exit animation when scrolling out of view (no pinning - allows scroll back)
  useEffect(() => {
    if (!sectionRef.current || typeof window === 'undefined') return;

    const section = sectionRef.current;
    let hasExited = false;

    const exitObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // When section is leaving viewport (scrolling down past it)
          if (!entry.isIntersecting && entry.boundingClientRect.top < 0 && !hasExited) {
            hasExited = true;

            // Play exit animations
            const exitTl = gsap.timeline();

            if (promptRef.current) {
              exitTl.to(promptRef.current, { opacity: 0, y: -20, duration: 0.3 }, 0);
            }

            cardRefs.current.forEach((card, i) => {
              if (!card) return;
              const endX = i === 0 ? -150 : 150;
              exitTl.to(card, { opacity: 0, x: endX, scale: 0.85, duration: 0.4 }, 0.1);
            });

            if (subtitleRef.current) {
              exitTl.to(subtitleRef.current, { opacity: 0, y: -40, duration: 0.3 }, 0.15);
            }

            if (titleRef.current) {
              exitTl.to(titleRef.current, { opacity: 0, y: -60, scale: 0.9, duration: 0.35 }, 0.2);
            }
          }

          // When section comes back into view (scrolling back up)
          if (entry.isIntersecting && hasExited) {
            hasExited = false;

            // Restore elements
            const restoreTl = gsap.timeline();

            if (titleRef.current) {
              restoreTl.to(titleRef.current, { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: 0.4 }, 0);
            }

            if (subtitleRef.current) {
              restoreTl.to(subtitleRef.current, { opacity: 1, y: 0, duration: 0.35 }, 0.1);
            }

            cardRefs.current.forEach((card, i) => {
              if (!card) return;
              restoreTl.to(card, { opacity: 1, x: 0, scale: 1, rotateY: 0, duration: 0.4 }, 0.15);
            });

            if (promptRef.current) {
              restoreTl.to(promptRef.current, { opacity: 0.6, y: 0, duration: 0.3 }, 0.25);
            }
          }
        });
      },
      { threshold: 0.1 }
    );

    exitObserver.observe(section);

    return () => exitObserver.disconnect();
  }, []);

  // Handle character selection
  const handleCharacterSelect = useCallback((characterId) => {
    setSelectedCharacter(characterId);
    setCharacterGender(characterId);
    setHasSelected(true);
    feedback.taskComplete();

    // Animate selected card
    const selectedIndex = CHARACTERS.findIndex(c => c.id === characterId);
    const selectedCard = cardRefs.current[selectedIndex];

    if (selectedCard) {
      gsap.to(selectedCard, {
        scale: 1.08,
        boxShadow: `0 0 80px ${CHARACTERS[selectedIndex].glowColor}`,
        duration: 0.3,
        ease: 'back.out(1.7)',
        yoyo: true,
        repeat: 1,
      });
    }

    // Unlock scroll and complete after animation
    setTimeout(() => {
      onLockScrollRef.current?.(false);
      setTimeout(() => onCompleteRef.current?.(), 400);
    }, 600);
  }, [setCharacterGender]);

  return (
    <section
      ref={sectionRef}
      className="immersive-section relative min-h-screen overflow-hidden"
    >
      <div className="hero-select-content">
        {/* Title */}
        <h2 ref={titleRef} className="hero-select-title" style={{ opacity: 0 }}>
          Choose Your <span className="gradient-text">Character</span>
        </h2>

        {/* Subtitle */}
        <p ref={subtitleRef} className="hero-select-subtitle" style={{ opacity: 0 }}>
          Your avatar will evolve as you level up
        </p>

        {/* Character Cards */}
        <div ref={cardsContainerRef} className="hero-cards" style={{ perspective: '1200px' }}>
          {CHARACTERS.map((character, index) => (
            <button
              key={character.id}
              ref={el => cardRefs.current[index] = el}
              className={`hero-card ${selectedCharacter === character.id ? 'selected' : ''}`}
              onClick={() => handleCharacterSelect(character.id)}
              onMouseEnter={() => setHoveredCharacter(character.id)}
              onMouseLeave={() => setHoveredCharacter(null)}
              style={{
                opacity: 0,
                transformStyle: 'preserve-3d',
                '--character-color': character.color,
                '--character-glow': character.glowColor,
              }}
            >
              {/* Card glow */}
              <div
                className="card-glow"
                style={{ background: `radial-gradient(circle at center, ${character.glowColor} 0%, transparent 70%)` }}
              />

              {/* Selection indicator */}
              {selectedCharacter === character.id && (
                <div className="selected-badge">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}

              {/* Character sprite container */}
              <div className="sprite-container">
                {/* Base sprite */}
                <img
                  src={character.sprite}
                  alt={character.name}
                  className={`character-sprite ${hoveredCharacter === character.id ? 'dimmed' : ''}`}
                  style={{ imageRendering: 'pixelated' }}
                />
                {/* Preview sprite (shown on hover) */}
                <img
                  src={character.previewSprite}
                  alt={`${character.name} evolved`}
                  className={`character-sprite preview ${hoveredCharacter === character.id ? 'visible' : ''}`}
                  style={{ imageRendering: 'pixelated' }}
                />
                {/* Glow ring */}
                <div className={`sprite-glow bg-gradient-to-r ${character.gradient}`} />
              </div>

              {/* Character info */}
              <h3 className="character-name">{character.name}</h3>
              <p className={`character-tagline bg-gradient-to-r ${character.gradient} bg-clip-text`}>
                {character.tagline}
              </p>
              <p className="character-description">{character.description}</p>

              {/* Evolution preview hint */}
              <div className="evolution-hint">
                <span className="hint-text">
                  {hoveredCharacter === character.id ? '40 evolution stages' : (isTouchDevice ? 'Tap to preview evolution' : 'Hover to preview evolution')}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Selection prompt */}
        <p ref={promptRef} className="selection-prompt" style={{ opacity: 0 }}>
          {hasSelected ? 'Great choice!' : 'Tap to select your character'}
        </p>
      </div>

      <style>{`
        .hero-select-content {
          position: relative;
          width: 100%;
          height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          max-width: 1000px;
          margin: 0 auto;
        }

        .hero-select-title {
          font-size: clamp(2rem, 6vw, 3rem);
          font-weight: 700;
          color: white;
          text-align: center;
          margin-bottom: 0.75rem;
        }

        .gradient-text {
          background: linear-gradient(135deg, #3b82f6 0%, #ec4899 50%, #a855f7 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-select-subtitle {
          font-size: 1rem;
          color: rgba(255, 255, 255, 0.5);
          text-align: center;
          margin-bottom: 3rem;
        }

        .hero-cards {
          display: flex;
          gap: 2rem;
          justify-content: center;
          align-items: stretch;
        }

        @media (max-width: 700px) {
          .hero-cards {
            flex-direction: column;
            gap: 1.5rem;
            align-items: center;
          }
        }

        .hero-card {
          position: relative;
          width: 280px;
          padding: 2rem;
          background: rgba(255, 255, 255, 0.03);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: center;
          overflow: hidden;
        }

        .hero-card:hover:not(.selected) {
          border-color: rgba(255, 255, 255, 0.25);
          transform: translateY(-8px);
        }

        .hero-card.selected {
          border-width: 3px;
          border-color: var(--character-color);
          background: rgba(255, 255, 255, 0.05);
        }

        .card-glow {
          position: absolute;
          inset: -80px;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.4s ease;
          z-index: 0;
        }

        .hero-card:hover .card-glow,
        .hero-card.selected .card-glow {
          opacity: 0.6;
        }

        .hero-card.selected .card-glow {
          opacity: 1;
        }

        .selected-badge {
          position: absolute;
          top: 16px;
          right: 16px;
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, #10b981, #059669);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
          animation: badgePop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          box-shadow: 0 0 25px rgba(16, 185, 129, 0.5);
        }

        @keyframes badgePop {
          from { transform: scale(0); }
          to { transform: scale(1); }
        }

        .sprite-container {
          position: relative;
          width: 140px;
          height: 140px;
          margin: 0 auto 1.5rem;
        }

        .character-sprite {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: contain;
          transition: opacity 0.4s ease, transform 0.4s ease;
          z-index: 2;
        }

        .character-sprite.dimmed {
          opacity: 0;
          transform: scale(0.8);
        }

        .character-sprite.preview {
          opacity: 0;
          z-index: 3;
        }

        .character-sprite.preview.visible {
          opacity: 1;
          transform: scale(1.1);
        }

        .sprite-glow {
          position: absolute;
          inset: -10px;
          border-radius: 50%;
          opacity: 0.2;
          filter: blur(20px);
          z-index: 1;
          transition: opacity 0.3s ease;
        }

        .hero-card:hover .sprite-glow,
        .hero-card.selected .sprite-glow {
          opacity: 0.4;
          animation: glowPulse 2s ease-in-out infinite;
        }

        @keyframes glowPulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.1); }
        }

        .character-name {
          font-size: 1.5rem;
          font-weight: 700;
          color: white;
          margin-bottom: 0.25rem;
          position: relative;
          z-index: 2;
        }

        .character-tagline {
          font-size: 1rem;
          font-weight: 600;
          -webkit-text-fill-color: transparent;
          margin-bottom: 0.75rem;
          position: relative;
          z-index: 2;
        }

        .character-description {
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.5);
          line-height: 1.5;
          margin-bottom: 1rem;
          position: relative;
          z-index: 2;
        }

        .evolution-hint {
          padding: 0.5rem 1rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 20px;
          position: relative;
          z-index: 2;
        }

        .hint-text {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.4);
          transition: color 0.3s ease;
        }

        .hero-card:hover .hint-text {
          color: rgba(255, 255, 255, 0.7);
        }

        .selection-prompt {
          position: relative;
          margin-top: 2rem;
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.4);
          text-align: center;
        }

        @media (max-width: 640px) {
          .hero-content {
            padding: 1.5rem;
            padding-right: 2rem;
            padding-top: 2.5rem;
          }

          .hero-title {
            font-size: clamp(1.5rem, 8vw, 2rem);
            margin-bottom: 0.5rem;
          }

          .hero-subtitle {
            font-size: 0.85rem;
            margin-bottom: 1.5rem;
          }

          .hero-cards {
            gap: 1rem;
          }

          .hero-card {
            width: 100%;
            max-width: 280px;
            padding: 1.25rem;
            border-radius: 16px;
          }

          .sprite-container {
            width: 100px;
            height: 100px;
            margin-bottom: 0.75rem;
          }

          .character-name {
            font-size: 1.25rem;
          }

          .character-tagline {
            font-size: 0.85rem;
          }

          .character-description {
            font-size: 0.8rem;
            margin-bottom: 0.75rem;
          }

          .evolution-hint {
            padding: 0.5rem 0.75rem;
          }

          .hint-text {
            font-size: 0.7rem;
          }

          .selection-prompt {
            margin-top: 1.5rem;
            font-size: 0.8rem;
          }

          .selected-badge {
            width: 28px;
            height: 28px;
            top: 12px;
            right: 12px;
          }
        }

        @media (max-width: 380px) {
          .hero-content {
            padding: 1rem;
            padding-right: 1.5rem;
            padding-top: 2rem;
          }

          .hero-title {
            font-size: 1.4rem;
          }

          .hero-card {
            padding: 1rem;
          }

          .sprite-container {
            width: 80px;
            height: 80px;
          }

          .character-name {
            font-size: 1.1rem;
          }

          .character-description {
            font-size: 0.75rem;
          }
        }
      `}</style>
    </section>
  );
}
