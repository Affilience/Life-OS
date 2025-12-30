/**
 * ImmersiveSkinToneSelect - Choose Your Skin Tone
 *
 * Skin tone selection with animated avatar preview.
 * Options: White, Brown, Black
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { feedback } from '../../../../services/microInteractions';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// Skin tone options
const SKIN_TONES = [
  {
    id: 'white',
    name: 'Light',
    color: '#f5d0c5',
    gradient: 'from-amber-200 via-orange-100 to-rose-100',
    glowColor: 'rgba(245, 208, 197, 0.4)',
  },
  {
    id: 'brown',
    name: 'Medium',
    color: '#c68642',
    gradient: 'from-amber-400 via-orange-400 to-amber-500',
    glowColor: 'rgba(198, 134, 66, 0.4)',
  },
  {
    id: 'black',
    name: 'Dark',
    color: '#8d5524',
    gradient: 'from-amber-700 via-orange-700 to-amber-800',
    glowColor: 'rgba(141, 85, 36, 0.4)',
  },
];

export default function ImmersiveSkinToneSelect({
  sectionId,
  onComplete,
  onLockScroll,
  onSectionEnter,
  characterGender,
  skinTone,
  setSkinTone,
}) {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const cardsContainerRef = useRef(null);
  const cardRefs = useRef([]);
  const promptRef = useRef(null);
  const previewRef = useRef(null);
  const [hasSelected, setHasSelected] = useState(false);
  const [selectedTone, setSelectedTone] = useState(skinTone || 'white');
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

  // Get avatar path based on gender and skin tone
  const getAvatarPath = (tone) => {
    const gender = characterGender || 'male';
    if (tone === 'white') {
      // Original avatars
      return gender === 'female'
        ? '/assets/avatar/base-evolution/heroine_base_stage_10_swordsman.png'
        : '/assets/avatar/base-evolution/hero_base_stage_10_swordsman.png';
    }
    // Diverse avatars
    const prefix = gender === 'female' ? 'heroine' : 'hero';
    return `/assets/avatar/diverse/${prefix}_stage_10_${tone}.png`;
  };

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

            // Preview avatar
            if (previewRef.current) {
              entranceTl.fromTo(previewRef.current,
                { opacity: 0, scale: 0.8 },
                { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(1.2)' },
                0.3
              );
            }

            // Cards animate in from bottom
            cardRefs.current.forEach((card, i) => {
              if (!card) return;
              entranceTl.fromTo(card,
                { opacity: 0, y: 50, scale: 0.9 },
                { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'back.out(1.2)' },
                0.4 + (i * 0.1)
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

  // Handle skin tone selection
  const handleToneSelect = useCallback((toneId) => {
    setSelectedTone(toneId);
    setSkinTone(toneId);
    setHasSelected(true);
    feedback.taskComplete();

    // Animate selected card
    const selectedIndex = SKIN_TONES.findIndex(t => t.id === toneId);
    const selectedCard = cardRefs.current[selectedIndex];

    if (selectedCard) {
      gsap.to(selectedCard, {
        scale: 1.1,
        duration: 0.3,
        ease: 'back.out(1.7)',
        yoyo: true,
        repeat: 1,
      });
    }

    // Animate avatar preview
    if (previewRef.current) {
      gsap.to(previewRef.current, {
        scale: 1.1,
        duration: 0.2,
        ease: 'power2.out',
        yoyo: true,
        repeat: 1,
      });
    }

    // Unlock scroll and complete after animation
    setTimeout(() => {
      onLockScrollRef.current?.(false);
      setTimeout(() => onCompleteRef.current?.(), 400);
    }, 600);
  }, [setSkinTone]);

  return (
    <section
      ref={sectionRef}
      className="immersive-section relative min-h-screen overflow-hidden"
    >
      <div className="skin-tone-content">
        {/* Title */}
        <h2 ref={titleRef} className="skin-tone-title" style={{ opacity: 0 }}>
          Choose Your <span className="gradient-text">Appearance</span>
        </h2>

        {/* Subtitle */}
        <p ref={subtitleRef} className="skin-tone-subtitle" style={{ opacity: 0 }}>
          Select a skin tone for your avatar
        </p>

        {/* Avatar Preview */}
        <div ref={previewRef} className="avatar-preview" style={{ opacity: 0 }}>
          <img
            src={getAvatarPath(selectedTone)}
            alt="Avatar preview"
            className="preview-sprite"
            style={{ imageRendering: 'pixelated' }}
          />
          <div className="preview-glow" style={{
            background: `radial-gradient(circle, ${SKIN_TONES.find(t => t.id === selectedTone)?.glowColor || 'rgba(139, 92, 246, 0.3)'} 0%, transparent 70%)`
          }} />
        </div>

        {/* Skin Tone Cards */}
        <div ref={cardsContainerRef} className="tone-cards">
          {SKIN_TONES.map((tone, index) => (
            <button
              key={tone.id}
              ref={el => cardRefs.current[index] = el}
              className={`tone-card ${selectedTone === tone.id ? 'selected' : ''}`}
              onClick={() => handleToneSelect(tone.id)}
              style={{
                opacity: 0,
                '--tone-color': tone.color,
                '--tone-glow': tone.glowColor,
              }}
            >
              {/* Color swatch */}
              <div
                className="tone-swatch"
                style={{ background: tone.color }}
              />

              {/* Selection indicator */}
              {selectedTone === tone.id && (
                <div className="selected-badge">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}

              {/* Tone name */}
              <span className="tone-name">{tone.name}</span>
            </button>
          ))}
        </div>

        {/* Selection prompt */}
        <p ref={promptRef} className="selection-prompt" style={{ opacity: 0 }}>
          {hasSelected ? 'Looking great!' : 'Tap to select'}
        </p>
      </div>

      <style>{`
        .skin-tone-content {
          position: relative;
          width: 100%;
          height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          max-width: 800px;
          margin: 0 auto;
        }

        .skin-tone-title {
          font-size: clamp(1.75rem, 5vw, 2.5rem);
          font-weight: 700;
          color: white;
          text-align: center;
          margin-bottom: 0.5rem;
        }

        .gradient-text {
          background: linear-gradient(135deg, #f5d0c5 0%, #c68642 50%, #8d5524 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .skin-tone-subtitle {
          font-size: 1rem;
          color: rgba(255, 255, 255, 0.5);
          text-align: center;
          margin-bottom: 2rem;
        }

        .avatar-preview {
          position: relative;
          width: 160px;
          height: 160px;
          margin-bottom: 2rem;
        }

        .preview-sprite {
          position: relative;
          width: 100%;
          height: 100%;
          object-fit: contain;
          z-index: 2;
          transition: transform 0.3s ease;
        }

        .preview-glow {
          position: absolute;
          inset: -30px;
          border-radius: 50%;
          z-index: 1;
          transition: all 0.3s ease;
          animation: glowPulse 3s ease-in-out infinite;
        }

        @keyframes glowPulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }

        .tone-cards {
          display: flex;
          gap: 1.5rem;
          justify-content: center;
          align-items: center;
          flex-wrap: wrap;
        }

        .tone-card {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
          padding: 1.25rem;
          background: rgba(255, 255, 255, 0.03);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .tone-card:hover:not(.selected) {
          border-color: rgba(255, 255, 255, 0.25);
          transform: translateY(-4px);
        }

        .tone-card.selected {
          border-width: 3px;
          border-color: var(--tone-color);
          background: rgba(255, 255, 255, 0.05);
          box-shadow: 0 0 30px var(--tone-glow);
        }

        .tone-swatch {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          border: 3px solid rgba(255, 255, 255, 0.2);
          transition: all 0.3s ease;
        }

        .tone-card:hover .tone-swatch,
        .tone-card.selected .tone-swatch {
          border-color: rgba(255, 255, 255, 0.5);
          transform: scale(1.05);
        }

        .selected-badge {
          position: absolute;
          top: -8px;
          right: -8px;
          width: 28px;
          height: 28px;
          background: linear-gradient(135deg, #10b981, #059669);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
          animation: badgePop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          box-shadow: 0 0 15px rgba(16, 185, 129, 0.5);
        }

        @keyframes badgePop {
          from { transform: scale(0); }
          to { transform: scale(1); }
        }

        .tone-name {
          font-size: 0.9rem;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.8);
        }

        .selection-prompt {
          position: relative;
          margin-top: 2rem;
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.4);
          text-align: center;
        }

        @media (max-width: 640px) {
          .skin-tone-content {
            padding: 1.5rem;
          }

          .skin-tone-title {
            font-size: clamp(1.5rem, 6vw, 2rem);
          }

          .avatar-preview {
            width: 120px;
            height: 120px;
            margin-bottom: 1.5rem;
          }

          .tone-cards {
            gap: 1rem;
          }

          .tone-card {
            padding: 1rem;
          }

          .tone-swatch {
            width: 50px;
            height: 50px;
          }

          .tone-name {
            font-size: 0.8rem;
          }
        }
      `}</style>
    </section>
  );
}
