/**
 * ImmersiveAvatarCustomisation - Customize Your Character
 *
 * Skin tone selection step in onboarding.
 * Uses IntersectionObserver for entrance animations.
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { feedback } from '../../../../services/microInteractions';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// Skin tone options with colors for visual representation
const SKIN_TONES = [
  {
    id: 'light',
    name: 'Light',
    color: '#FFDFC4',
    gradient: 'from-orange-100 to-orange-200',
  },
  {
    id: 'medium',
    name: 'Medium',
    color: '#E5B887',
    gradient: 'from-orange-200 to-orange-300',
  },
  {
    id: 'tan',
    name: 'Tan',
    color: '#C68642',
    gradient: 'from-orange-300 to-amber-400',
  },
  {
    id: 'dark',
    name: 'Dark',
    color: '#8D5524',
    gradient: 'from-amber-600 to-amber-700',
  },
  {
    id: 'deep',
    name: 'Deep',
    color: '#5C3317',
    gradient: 'from-amber-800 to-amber-900',
  },
];

export default function ImmersiveAvatarCustomisation({
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
  const avatarRef = useRef(null);
  const optionsRef = useRef(null);
  const optionRefs = useRef([]);
  const promptRef = useRef(null);
  const [hasSelected, setHasSelected] = useState(false);
  const [selectedTone, setSelectedTone] = useState(skinTone || 'medium');
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

  // Get sprite path based on gender
  const getSpritePath = () => {
    const gender = characterGender === 'female' ? 'heroine' : 'hero';
    return `/assets/avatar/base-evolution/${gender}_base_stage_1_dreamer.png`;
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

            if (avatarRef.current) {
              entranceTl.fromTo(avatarRef.current,
                { opacity: 0, scale: 0.5, rotateY: -30 },
                { opacity: 1, scale: 1, rotateY: 0, duration: 0.7, ease: 'back.out(1.4)' },
                0.3
              );
            }

            // Skin tone options animate in from bottom with stagger
            optionRefs.current.forEach((option, i) => {
              if (!option) return;
              entranceTl.fromTo(option,
                { opacity: 0, y: 30, scale: 0.8 },
                { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: 'back.out(1.2)' },
                0.4 + (i * 0.08)
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

  // Exit animation when scrolling out of view
  useEffect(() => {
    if (!sectionRef.current || typeof window === 'undefined') return;

    const section = sectionRef.current;
    let hasExited = false;

    const exitObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting && entry.boundingClientRect.top < 0 && !hasExited) {
            hasExited = true;

            const exitTl = gsap.timeline();

            if (promptRef.current) {
              exitTl.to(promptRef.current, { opacity: 0, y: -20, duration: 0.3 }, 0);
            }

            optionRefs.current.forEach((option) => {
              if (!option) return;
              exitTl.to(option, { opacity: 0, y: -20, scale: 0.9, duration: 0.3 }, 0.05);
            });

            if (avatarRef.current) {
              exitTl.to(avatarRef.current, { opacity: 0, scale: 0.8, duration: 0.35 }, 0.1);
            }

            if (subtitleRef.current) {
              exitTl.to(subtitleRef.current, { opacity: 0, y: -40, duration: 0.3 }, 0.15);
            }

            if (titleRef.current) {
              exitTl.to(titleRef.current, { opacity: 0, y: -60, scale: 0.9, duration: 0.35 }, 0.2);
            }
          }

          if (entry.isIntersecting && hasExited) {
            hasExited = false;

            const restoreTl = gsap.timeline();

            if (titleRef.current) {
              restoreTl.to(titleRef.current, { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: 0.4 }, 0);
            }

            if (subtitleRef.current) {
              restoreTl.to(subtitleRef.current, { opacity: 1, y: 0, duration: 0.35 }, 0.1);
            }

            if (avatarRef.current) {
              restoreTl.to(avatarRef.current, { opacity: 1, scale: 1, rotateY: 0, duration: 0.4 }, 0.15);
            }

            optionRefs.current.forEach((option) => {
              if (!option) return;
              restoreTl.to(option, { opacity: 1, y: 0, scale: 1, duration: 0.3 }, 0.2);
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

  // Handle skin tone selection
  const handleToneSelect = useCallback((toneId) => {
    setSelectedTone(toneId);
    setSkinTone?.(toneId);
    feedback.taskComplete();

    // Animate selected option
    const selectedIndex = SKIN_TONES.findIndex(t => t.id === toneId);
    const selectedOption = optionRefs.current[selectedIndex];

    if (selectedOption) {
      gsap.to(selectedOption, {
        scale: 1.15,
        duration: 0.2,
        ease: 'back.out(2)',
        yoyo: true,
        repeat: 1,
      });
    }

    // Apply tint to avatar preview
    if (avatarRef.current) {
      const tone = SKIN_TONES.find(t => t.id === toneId);
      gsap.to(avatarRef.current, {
        filter: `drop-shadow(0 0 30px ${tone?.color}40)`,
        duration: 0.3,
      });
    }
  }, [setSkinTone]);

  // Handle continue
  const handleContinue = useCallback(() => {
    setHasSelected(true);
    feedback.taskComplete();

    setTimeout(() => {
      onLockScrollRef.current?.(false);
      setTimeout(() => onCompleteRef.current?.(), 400);
    }, 300);
  }, []);

  return (
    <section
      ref={sectionRef}
      className="immersive-section relative min-h-screen overflow-hidden"
    >
      <div className="customize-content">
        {/* Title */}
        <h2 ref={titleRef} className="customize-title" style={{ opacity: 0 }}>
          Customize Your <span className="gradient-text">Avatar</span>
        </h2>

        {/* Subtitle */}
        <p ref={subtitleRef} className="customize-subtitle" style={{ opacity: 0 }}>
          Choose a skin tone that represents you
        </p>

        {/* Avatar Preview */}
        <div ref={avatarRef} className="avatar-preview" style={{ opacity: 0 }}>
          <div className="avatar-glow" />
          <img
            src={getSpritePath()}
            alt="Your avatar"
            className="avatar-sprite"
            style={{ imageRendering: 'pixelated' }}
          />
        </div>

        {/* Skin Tone Options */}
        <div ref={optionsRef} className="tone-options">
          {SKIN_TONES.map((tone, index) => (
            <button
              key={tone.id}
              ref={el => optionRefs.current[index] = el}
              className={`tone-option ${selectedTone === tone.id ? 'selected' : ''}`}
              onClick={() => handleToneSelect(tone.id)}
              style={{ opacity: 0 }}
              aria-label={`Select ${tone.name} skin tone`}
            >
              <div
                className="tone-circle"
                style={{ backgroundColor: tone.color }}
              />
              <span className="tone-name">{tone.name}</span>
              {selectedTone === tone.id && (
                <div className="selected-ring" style={{ borderColor: tone.color }} />
              )}
            </button>
          ))}
        </div>

        {/* Continue Button */}
        <button
          className={`continue-button ${selectedTone ? 'ready' : ''}`}
          onClick={handleContinue}
          disabled={!selectedTone}
        >
          Continue
        </button>

        {/* Selection prompt */}
        <p ref={promptRef} className="selection-prompt" style={{ opacity: 0 }}>
          {hasSelected ? 'Looking great!' : 'Select a skin tone above'}
        </p>
      </div>

      <style>{`
        .customize-content {
          position: relative;
          width: 100%;
          height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          max-width: 600px;
          margin: 0 auto;
        }

        .customize-title {
          font-size: clamp(2rem, 6vw, 3rem);
          font-weight: 700;
          color: white;
          text-align: center;
          margin-bottom: 0.75rem;
        }

        .gradient-text {
          background: linear-gradient(135deg, #f59e0b 0%, #ec4899 50%, #a855f7 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .customize-subtitle {
          font-size: 1rem;
          color: rgba(255, 255, 255, 0.5);
          text-align: center;
          margin-bottom: 2rem;
        }

        .avatar-preview {
          position: relative;
          width: 160px;
          height: 160px;
          margin-bottom: 2.5rem;
        }

        .avatar-glow {
          position: absolute;
          inset: -20px;
          background: radial-gradient(circle at center, rgba(139, 92, 246, 0.3) 0%, transparent 70%);
          border-radius: 50%;
          animation: glowPulse 3s ease-in-out infinite;
        }

        @keyframes glowPulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.1); }
        }

        .avatar-sprite {
          position: relative;
          width: 100%;
          height: 100%;
          object-fit: contain;
          z-index: 2;
        }

        .tone-options {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
          justify-content: center;
          margin-bottom: 2rem;
        }

        .tone-option {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem;
          background: rgba(255, 255, 255, 0.03);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
          min-width: 80px;
        }

        .tone-option:hover:not(.selected) {
          border-color: rgba(255, 255, 255, 0.3);
          background: rgba(255, 255, 255, 0.06);
          transform: translateY(-4px);
        }

        .tone-option.selected {
          border-color: rgba(255, 255, 255, 0.5);
          background: rgba(255, 255, 255, 0.08);
        }

        .tone-circle {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .tone-option:hover .tone-circle {
          transform: scale(1.1);
        }

        .tone-option.selected .tone-circle {
          box-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
        }

        .tone-name {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.6);
          font-weight: 500;
        }

        .tone-option.selected .tone-name {
          color: white;
        }

        .selected-ring {
          position: absolute;
          inset: -4px;
          border: 3px solid;
          border-radius: 20px;
          animation: ringPulse 1.5s ease-in-out infinite;
        }

        @keyframes ringPulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }

        .continue-button {
          padding: 1rem 3rem;
          background: rgba(255, 255, 255, 0.1);
          border: 2px solid rgba(255, 255, 255, 0.2);
          border-radius: 9999px;
          color: rgba(255, 255, 255, 0.4);
          font-size: 1rem;
          font-weight: 600;
          cursor: not-allowed;
          transition: all 0.3s ease;
          margin-bottom: 1rem;
        }

        .continue-button.ready {
          background: linear-gradient(135deg, #8b5cf6, #ec4899);
          border-color: transparent;
          color: white;
          cursor: pointer;
          box-shadow: 0 8px 30px rgba(139, 92, 246, 0.4);
        }

        .continue-button.ready:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 40px rgba(139, 92, 246, 0.5);
        }

        .selection-prompt {
          position: relative;
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.4);
          text-align: center;
        }

        /* Mobile styles */
        @media (max-width: 640px) {
          .customize-content {
            padding: 1.5rem;
            padding-right: 2rem;
            padding-top: 3rem;
          }

          .customize-title {
            font-size: clamp(1.5rem, 8vw, 2rem);
            margin-bottom: 0.5rem;
          }

          .customize-subtitle {
            font-size: 0.85rem;
            margin-bottom: 1.5rem;
          }

          .avatar-preview {
            width: 120px;
            height: 120px;
            margin-bottom: 2rem;
          }

          .tone-options {
            gap: 0.75rem;
          }

          .tone-option {
            padding: 0.5rem;
            min-width: 60px;
            border-radius: 12px;
          }

          .tone-circle {
            width: 36px;
            height: 36px;
          }

          .tone-name {
            font-size: 0.65rem;
          }

          .continue-button {
            padding: 0.875rem 2.5rem;
            font-size: 0.9rem;
          }

          .selection-prompt {
            font-size: 0.8rem;
          }
        }

        @media (max-width: 380px) {
          .customize-content {
            padding: 1rem;
            padding-right: 1.5rem;
            padding-top: 2.5rem;
          }

          .customize-title {
            font-size: 1.4rem;
          }

          .avatar-preview {
            width: 100px;
            height: 100px;
          }

          .tone-option {
            padding: 0.4rem;
            min-width: 50px;
          }

          .tone-circle {
            width: 32px;
            height: 32px;
          }
        }
      `}</style>
    </section>
  );
}
