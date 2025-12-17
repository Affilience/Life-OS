/**
 * ImmersiveModeSelect - Choose Your Experience
 *
 * Scroll-driven mode selection with GSAP timeline pattern.
 * Requires user interaction before continuing.
 *
 * BUILD PHASE (0-0.4):
 * - Title and subtitle emerge
 * - Mode cards fly in from sides
 *
 * HOLD PHASE (0.4-0.6):
 * - Scroll is locked while user selects mode
 *
 * DISMANTLE PHASE (0.6-1.0):
 * - Cards and content scatter out
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { feedback } from '../../../../services/microInteractions';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// Mode configurations
const MODES = [
  {
    id: 'cosmic',
    name: 'Cosmic Mode',
    tagline: 'The Full Adventure',
    description: 'Experience the complete journey with XP, avatar evolution, equipment, quests, and cosmic rewards.',
    features: ['40 Evolution Stages', 'Equipment & Stats', 'Quests & Achievements', 'Cosmic Bazaar'],
    gradient: 'from-purple-500 via-violet-500 to-pink-500',
    glowColor: 'rgba(139, 92, 246, 0.4)',
    color: '#8b5cf6',
    icon: (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
        <path d="M12 2L15 8L22 9L17 14L18 21L12 18L6 21L7 14L2 9L9 8L12 2Z" fill="white"/>
      </svg>
    ),
  },
  {
    id: 'minimal',
    name: 'Minimal Mode',
    tagline: 'Pure Productivity',
    description: 'Clean, distraction-free tracking. All gamification bonuses apply silently in the background.',
    features: ['Clean Interface', 'Essential Stats', 'Silent Bonuses', 'No Distractions'],
    gradient: 'from-slate-400 via-slate-500 to-slate-600',
    glowColor: 'rgba(148, 163, 184, 0.3)',
    color: '#64748b',
    icon: (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="2" stroke="white" strokeWidth="2"/>
        <path d="M12 2v4M12 18v4M2 12h4M18 12h4" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
];

export default function ImmersiveModeSelect({
  sectionId,
  onComplete,
  onLockScroll,
  onSectionEnter,
  gamificationMode,
  setGamificationMode,
}) {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const cardRefs = useRef([]);
  const promptRef = useRef(null);
  const [hasSelected, setHasSelected] = useState(false);
  const [selectedMode, setSelectedMode] = useState(gamificationMode || null);

  // Store callbacks in refs
  const onCompleteRef = useRef(onComplete);
  const onLockScrollRef = useRef(onLockScroll);
  const onSectionEnterRef = useRef(onSectionEnter);
  useEffect(() => {
    onCompleteRef.current = onComplete;
    onLockScrollRef.current = onLockScroll;
    onSectionEnterRef.current = onSectionEnter;
  }, [onComplete, onLockScroll, onSectionEnter]);

  // Track if section is in view
  const [isInView, setIsInView] = useState(false);

  // Auto-play entrance animation when section comes into view
  useEffect(() => {
    if (!sectionRef.current || typeof window === 'undefined') return;

    const section = sectionRef.current;

    // Use IntersectionObserver to detect when section is visible
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

            cardRefs.current.forEach((card, i) => {
              if (!card) return;
              const startX = i === 0 ? -300 : 300;
              entranceTl.fromTo(card,
                { opacity: 0, x: startX, rotateY: i === 0 ? -15 : 15, scale: 0.8 },
                { opacity: 1, x: 0, rotateY: 0, scale: 1, duration: 0.6, ease: 'back.out(1.4)' },
                0.3 + (i * 0.15)
              );
            });

            if (promptRef.current) {
              entranceTl.fromTo(promptRef.current,
                { opacity: 0, y: 20 },
                { opacity: 0.6, y: 0, duration: 0.4, ease: 'power2.out' },
                0.6
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
              const endX = i === 0 ? 200 : -200;
              exitTl.to(card, { opacity: 0, x: endX, scale: 0.8, duration: 0.4 }, 0.1);
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

  // Handle mode selection
  const handleModeSelect = useCallback((modeId) => {
    setSelectedMode(modeId);
    setGamificationMode(modeId);
    setHasSelected(true);
    feedback.taskComplete();

    // Animate selected card
    const selectedIndex = MODES.findIndex(m => m.id === modeId);
    const selectedCard = cardRefs.current[selectedIndex];

    if (selectedCard) {
      gsap.to(selectedCard, {
        scale: 1.05,
        boxShadow: `0 0 60px ${MODES[selectedIndex].glowColor}`,
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
  }, [setGamificationMode]);

  return (
    <section
      ref={sectionRef}
      className="immersive-section relative min-h-screen overflow-hidden"
    >
      <div className="mode-content">
        {/* Title */}
        <h2 ref={titleRef} className="mode-title" style={{ opacity: 0 }}>
          Choose Your <span className="gradient-text">Experience</span>
        </h2>

        {/* Subtitle */}
        <p ref={subtitleRef} className="mode-subtitle" style={{ opacity: 0 }}>
          This shapes your entire journey. You can change it later.
        </p>

        {/* Mode Cards */}
        <div className="mode-cards" style={{ perspective: '1200px' }}>
          {MODES.map((mode, index) => (
            <button
              key={mode.id}
              ref={el => cardRefs.current[index] = el}
              className={`mode-card ${mode.id} ${selectedMode === mode.id ? 'selected' : ''}`}
              onClick={() => handleModeSelect(mode.id)}
              style={{
                opacity: 0,
                transformStyle: 'preserve-3d',
                '--mode-color': mode.color,
                '--mode-glow': mode.glowColor,
              }}
            >
              {/* Card glow */}
              <div className="card-glow" style={{ background: `radial-gradient(circle at center, ${mode.glowColor} 0%, transparent 70%)` }} />

              {/* Selection indicator */}
              {selectedMode === mode.id && (
                <div className="selected-badge">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}

              {/* Icon */}
              <div className={`card-icon bg-gradient-to-br ${mode.gradient}`}>
                {mode.icon}
              </div>

              {/* Content */}
              <h3 className="card-name">{mode.name}</h3>
              <p className={`card-tagline bg-gradient-to-r ${mode.gradient} bg-clip-text`}>
                {mode.tagline}
              </p>
              <p className="card-description">{mode.description}</p>

              {/* Features */}
              <div className="card-features">
                {mode.features.map((feature, i) => (
                  <div key={i} className="card-feature">
                    <div className={`feature-dot bg-gradient-to-r ${mode.gradient}`} />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              {/* Floating particles for cosmic mode */}
              {mode.id === 'cosmic' && (
                <div className="card-particles">
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className="card-particle"
                      style={{
                        left: `${15 + Math.random() * 70}%`,
                        top: `${10 + Math.random() * 40}%`,
                        animationDelay: `${i * 0.2}s`,
                      }}
                    />
                  ))}
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Selection prompt */}
        <p ref={promptRef} className="selection-prompt" style={{ opacity: 0 }}>
          {hasSelected ? 'Great choice!' : 'Tap a card to select your experience'}
        </p>
      </div>

      <style>{`
        .mode-content {
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

        .mode-title {
          font-size: clamp(2rem, 6vw, 3rem);
          font-weight: 700;
          color: white;
          text-align: center;
          margin-bottom: 0.75rem;
        }

        .gradient-text {
          background: linear-gradient(135deg, #a855f7 0%, #ec4899 50%, #f59e0b 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .mode-subtitle {
          font-size: 1rem;
          color: rgba(255, 255, 255, 0.5);
          text-align: center;
          margin-bottom: 3rem;
        }

        .mode-cards {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 2rem;
          width: 100%;
          max-width: 800px;
        }

        @media (max-width: 700px) {
          .mode-cards {
            grid-template-columns: 1fr;
            max-width: 400px;
            gap: 1.5rem;
          }
        }

        .mode-card {
          position: relative;
          padding: 2rem;
          background: rgba(255, 255, 255, 0.03);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          cursor: pointer;
          transition: border-color 0.3s ease, background 0.3s ease;
          text-align: left;
          overflow: hidden;
        }

        .mode-card:hover:not(.selected) {
          border-color: rgba(255, 255, 255, 0.25);
        }

        .mode-card.cosmic:hover:not(.selected) {
          border-color: rgba(139, 92, 246, 0.4);
        }

        .mode-card.minimal:hover:not(.selected) {
          border-color: rgba(148, 163, 184, 0.4);
        }

        .mode-card.selected {
          border-width: 3px;
        }

        .mode-card.cosmic.selected {
          border-color: #8b5cf6;
          background: rgba(139, 92, 246, 0.15);
        }

        .mode-card.minimal.selected {
          border-color: #94a3b8;
          background: rgba(148, 163, 184, 0.1);
        }

        .card-glow {
          position: absolute;
          inset: -60px;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.4s ease;
          z-index: 0;
        }

        .mode-card:hover .card-glow,
        .mode-card.selected .card-glow {
          opacity: 0.6;
        }

        .mode-card.selected .card-glow {
          opacity: 1;
        }

        .selected-badge {
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
          z-index: 10;
          animation: badgePop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          box-shadow: 0 0 20px rgba(16, 185, 129, 0.5);
        }

        @keyframes badgePop {
          from { transform: scale(0); }
          to { transform: scale(1); }
        }

        .card-icon {
          width: 72px;
          height: 72px;
          margin-bottom: 1.5rem;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.4);
          position: relative;
          z-index: 2;
        }

        .card-name {
          font-size: 1.5rem;
          font-weight: 700;
          color: white;
          margin-bottom: 0.25rem;
          position: relative;
          z-index: 2;
        }

        .card-tagline {
          font-size: 1rem;
          font-weight: 600;
          -webkit-text-fill-color: transparent;
          margin-bottom: 1rem;
          position: relative;
          z-index: 2;
        }

        .card-description {
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.5);
          line-height: 1.5;
          margin-bottom: 1.5rem;
          position: relative;
          z-index: 2;
        }

        .card-features {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
          position: relative;
          z-index: 2;
        }

        .card-feature {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.6);
        }

        .feature-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .card-particles {
          position: absolute;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
          z-index: 1;
        }

        .card-particle {
          position: absolute;
          width: 4px;
          height: 4px;
          background: #a855f7;
          border-radius: 50%;
          animation: twinkle 2.5s ease-in-out infinite;
        }

        @keyframes twinkle {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.5); }
        }

        .selection-prompt {
          position: relative;
          margin-top: 2rem;
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.4);
          text-align: center;
        }

        /* Mobile styles */
        @media (max-width: 640px) {
          .mode-content {
            padding: 1.5rem;
            padding-right: 2rem; /* Space for progress dots */
            justify-content: flex-start;
            padding-top: 3rem;
          }

          .mode-title {
            font-size: clamp(1.5rem, 8vw, 2rem);
            margin-bottom: 0.5rem;
          }

          .mode-subtitle {
            font-size: 0.85rem;
            margin-bottom: 1.5rem;
          }

          .mode-cards {
            gap: 1rem;
          }

          .mode-card {
            padding: 1.25rem;
            border-radius: 16px;
          }

          .card-icon {
            width: 56px;
            height: 56px;
            margin-bottom: 1rem;
            border-radius: 14px;
          }

          .card-icon svg {
            width: 28px;
            height: 28px;
          }

          .card-name {
            font-size: 1.25rem;
          }

          .card-tagline {
            font-size: 0.85rem;
            margin-bottom: 0.75rem;
          }

          .card-description {
            font-size: 0.8rem;
            margin-bottom: 1rem;
            line-height: 1.4;
          }

          .card-features {
            gap: 0.4rem;
          }

          .card-feature {
            font-size: 0.75rem;
          }

          .selection-prompt {
            margin-top: 1.5rem;
            font-size: 0.8rem;
          }

          .selected-badge {
            width: 26px;
            height: 26px;
            top: 12px;
            right: 12px;
          }

          .selected-badge svg {
            width: 14px;
            height: 14px;
          }
        }

        @media (max-width: 380px) {
          .mode-content {
            padding: 1rem;
            padding-right: 1.5rem;
            padding-top: 2.5rem;
          }

          .mode-title {
            font-size: 1.4rem;
          }

          .mode-card {
            padding: 1rem;
          }

          .card-icon {
            width: 48px;
            height: 48px;
          }

          .card-name {
            font-size: 1.1rem;
          }

          .card-description {
            font-size: 0.75rem;
          }
        }
      `}</style>
    </section>
  );
}
