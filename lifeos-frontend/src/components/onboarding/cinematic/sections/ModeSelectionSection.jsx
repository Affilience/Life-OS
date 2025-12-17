/**
 * Mode Selection Section
 *
 * Choose between Cosmic (full gamification) and Minimal (clean) experience.
 * Auto-scrolls to next section after selection.
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { animate, stagger } from 'animejs';
import { feedback } from '../../../../services/microInteractions';
import { useGamificationModeStore } from '../../../../stores/gamificationModeStore';

// 3D Tilt effect hook for cards
function use3DTilt(cardRef, enabled = true) {
  const handleMouseMove = useCallback((e) => {
    if (!cardRef.current || !enabled) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = (y - centerY) / 15;
    const rotateY = (centerX - x) / 15;

    cardRef.current.style.transform = `
      perspective(1000px)
      rotateX(${rotateX}deg)
      rotateY(${rotateY}deg)
      scale3d(1.02, 1.02, 1.02)
    `;

    // Update shine position
    const shine = cardRef.current.querySelector('.mode-card-shine');
    if (shine) {
      const xPercent = (x / rect.width) * 100;
      const yPercent = (y / rect.height) * 100;
      shine.style.background = `radial-gradient(circle at ${xPercent}% ${yPercent}%, rgba(255,255,255,0.15) 0%, transparent 50%)`;
    }
  }, [cardRef, enabled]);

  const handleMouseLeave = useCallback(() => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    const shine = cardRef.current.querySelector('.mode-card-shine');
    if (shine) {
      shine.style.background = 'transparent';
    }
  }, [cardRef]);

  return { handleMouseMove, handleMouseLeave };
}

// Individual 3D Card component
function Mode3DCard({ mode, isSelected, onSelect, style }) {
  const cardRef = useRef(null);
  const { handleMouseMove, handleMouseLeave } = use3DTilt(cardRef, !isSelected);

  return (
    <div
      ref={cardRef}
      className={`mode-card ${isSelected ? 'selected' : ''} ${mode.id === 'cosmic' ? 'cosmic' : 'minimal'}`}
      onClick={() => onSelect(mode.id)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={style}
    >
      {/* 3D shine effect */}
      <div className="mode-card-shine" />

      {/* Selection indicator */}
      {isSelected && (
        <div className="mode-selected-badge">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      )}

      {/* Glow effect */}
      <div
        className="mode-glow"
        style={{
          background: `radial-gradient(circle at center, ${mode.glowColor} 0%, transparent 70%)`,
          opacity: isSelected ? 1 : 0,
        }}
      />

      {/* Icon area with 3D float effect */}
      <div className={`mode-icon bg-gradient-to-br ${mode.gradient}`}>
        {mode.id === 'cosmic' ? (
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L15 8L22 9L17 14L18 21L12 18L6 21L7 14L2 9L9 8L12 2Z" fill="white"/>
          </svg>
        ) : (
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="2" stroke="white" strokeWidth="2"/>
            <path d="M12 2v4M12 18v4M2 12h4M18 12h4" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        )}
      </div>

      {/* Content */}
      <h3 className="mode-name">{mode.name}</h3>
      <p className={`mode-tagline bg-gradient-to-r ${mode.gradient} bg-clip-text`}>
        {mode.tagline}
      </p>
      <p className="mode-description">{mode.description}</p>

      {/* Features */}
      <div className="mode-features">
        {mode.features.map((feature, i) => (
          <div key={i} className="mode-feature">
            <div className={`mode-feature-dot bg-gradient-to-r ${mode.gradient}`} />
            <span>{feature}</span>
          </div>
        ))}
      </div>

      {/* Cosmic mode particles */}
      {mode.id === 'cosmic' && (
        <div className="mode-particles">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="mode-particle"
              style={{
                left: `${15 + Math.random() * 70}%`,
                top: `${10 + Math.random() * 30}%`,
                animationDelay: `${i * 0.3}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* 3D depth layer */}
      <div className="mode-card-depth" />
    </div>
  );
}

const MODES = [
  {
    id: 'cosmic',
    name: 'Cosmic Mode',
    tagline: 'The Full Adventure',
    description: 'Experience the complete journey with XP, avatar evolution, equipment, quests, and cosmic rewards.',
    features: ['40 Evolution Stages', 'Equipment & Stats', 'Quests & Achievements', 'Cosmic Bazaar'],
    gradient: 'from-purple-500 via-violet-500 to-pink-500',
    borderColor: 'rgba(139, 92, 246, 0.5)',
    glowColor: 'rgba(139, 92, 246, 0.3)',
  },
  {
    id: 'minimal',
    name: 'Minimal Mode',
    tagline: 'Pure Productivity',
    description: 'Clean, distraction-free tracking. All gamification bonuses apply silently in the background.',
    features: ['Clean Interface', 'Essential Stats', 'Silent Bonuses', 'No Distractions'],
    gradient: 'from-gray-400 via-gray-500 to-gray-600',
    borderColor: 'rgba(156, 163, 175, 0.4)',
    glowColor: 'rgba(156, 163, 175, 0.2)',
  },
];

export default function ModeSelectionSection({
  isActive,
  progress,
  onComplete,
  setGamificationMode: setOnboardingMode,
  gamificationMode,
}) {
  const sectionRef = useRef(null);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [selectedMode, setSelectedMode] = useState(gamificationMode || null);

  // Global gamification mode store
  const { setMode: setGlobalMode } = useGamificationModeStore();

  // Entrance animation
  useEffect(() => {
    if (!isActive || hasAnimated) return;

    const section = sectionRef.current;
    if (!section) return;

    // Animate title
    animate(section.querySelector('.mode-title'), {
      opacity: [0, 1],
      y: [40, 0],
      duration: 800,
      ease: 'outExpo',
    });

    // Animate subtitle
    animate(section.querySelector('.mode-subtitle'), {
      opacity: [0, 1],
      y: [30, 0],
      duration: 800,
      delay: 150,
      ease: 'outExpo',
    });

    // Animate cards with stagger
    const cards = section.querySelectorAll('.mode-card');
    animate(cards, {
      opacity: [0, 1],
      y: [60, 0],
      scale: [0.9, 1],
      duration: 700,
      delay: stagger(150, { start: 300 }),
      ease: 'outBack',
    });

    setHasAnimated(true);
  }, [isActive, hasAnimated]);

  // Handle mode selection
  const handleSelectMode = useCallback((modeId) => {
    setSelectedMode(modeId);
    setOnboardingMode?.(modeId);
    setGlobalMode(modeId);

    feedback.buttonPress();

    // Animate selection - find card in DOM
    const section = sectionRef.current;
    if (section) {
      const card = section.querySelector(`.mode-card.${modeId}`);
      if (card) {
        animate(card, {
          scale: [1, 1.08, 1.02],
          duration: 500,
          ease: 'outElastic(1, 0.5)',
        });
      }
    }

    // Auto-scroll to next section after brief delay
    setTimeout(() => {
      feedback.taskComplete();
      onComplete?.();
    }, 600);
  }, [setOnboardingMode, setGlobalMode, onComplete]);

  return (
    <div ref={sectionRef} className="mode-section">
      <h2 className="mode-title" style={{ opacity: 0 }}>
        Choose Your Experience
      </h2>

      <p className="mode-subtitle" style={{ opacity: 0 }}>
        This shapes your entire journey. You can change this later in settings.
      </p>

      <div className="mode-cards">
        {MODES.map((mode) => (
          <Mode3DCard
            key={mode.id}
            mode={mode}
            isSelected={selectedMode === mode.id}
            onSelect={handleSelectMode}
            style={{ opacity: 0 }}
          />
        ))}
      </div>

      <style>{`
        .mode-section {
          position: relative;
          max-width: 900px;
          margin: 0 auto;
          text-align: center;
        }

        .mode-title {
          font-size: clamp(1.75rem, 5vw, 2.5rem);
          font-weight: 700;
          color: white;
          margin-bottom: 0.75rem;
        }

        .mode-subtitle {
          font-size: 1rem;
          color: rgba(255, 255, 255, 0.5);
          margin-bottom: 2.5rem;
        }

        .mode-cards {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem;
        }

        @media (max-width: 640px) {
          .mode-cards {
            grid-template-columns: 1fr;
            max-width: 400px;
            margin: 0 auto;
          }
        }

        .mode-card {
          position: relative;
          padding: 2rem 1.5rem;
          background: rgba(255, 255, 255, 0.03);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          cursor: pointer;
          transition: transform 0.15s ease-out, border-color 0.3s ease, background 0.3s ease, box-shadow 0.3s ease;
          overflow: hidden;
          text-align: center;
          transform-style: preserve-3d;
          transform: perspective(1000px) rotateX(0deg) rotateY(0deg);
          will-change: transform;
        }

        .mode-card:hover:not(.selected) {
          border-color: rgba(255, 255, 255, 0.25);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5),
                      0 0 30px rgba(139, 92, 246, 0.15);
        }

        .mode-card.cosmic:hover:not(.selected) {
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5),
                      0 0 40px rgba(139, 92, 246, 0.25);
        }

        .mode-card.minimal:hover:not(.selected) {
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5),
                      0 0 30px rgba(156, 163, 175, 0.15);
        }

        .mode-card.selected {
          transform: perspective(1000px) scale(1.02);
        }

        /* 3D Shine effect layer */
        .mode-card-shine {
          position: absolute;
          inset: 0;
          border-radius: 22px;
          pointer-events: none;
          transition: background 0.15s ease;
          z-index: 10;
        }

        /* 3D Depth layer for raised elements */
        .mode-card-depth {
          position: absolute;
          inset: 0;
          border-radius: 22px;
          background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.05) 0%,
            transparent 50%,
            rgba(0, 0, 0, 0.1) 100%
          );
          pointer-events: none;
          z-index: 1;
        }

        .mode-card.cosmic.selected {
          border-color: rgba(139, 92, 246, 0.6);
          background: rgba(139, 92, 246, 0.1);
        }

        .mode-card.minimal.selected {
          border-color: rgba(156, 163, 175, 0.5);
          background: rgba(156, 163, 175, 0.08);
        }

        .mode-selected-badge {
          position: absolute;
          top: 12px;
          right: 12px;
          width: 28px;
          height: 28px;
          background: linear-gradient(135deg, #10b981, #059669);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: popIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          z-index: 10;
        }

        @keyframes popIn {
          from { transform: scale(0); }
          to { transform: scale(1); }
        }

        .mode-glow {
          position: absolute;
          inset: -50px;
          transition: opacity 0.4s ease;
          pointer-events: none;
        }

        .mode-icon {
          width: 64px;
          height: 64px;
          margin: 0 auto 1.25rem;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          z-index: 2;
          transform: translateZ(30px);
          box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.4);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .mode-card:hover .mode-icon {
          transform: translateZ(40px);
          box-shadow: 0 15px 40px -15px rgba(0, 0, 0, 0.5);
        }

        .mode-name {
          font-size: 1.25rem;
          font-weight: 700;
          color: white;
          margin-bottom: 0.25rem;
          position: relative;
          z-index: 1;
        }

        .mode-tagline {
          font-size: 0.9rem;
          font-weight: 600;
          -webkit-text-fill-color: transparent;
          margin-bottom: 0.75rem;
          position: relative;
          z-index: 1;
        }

        .mode-description {
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.5);
          line-height: 1.5;
          margin-bottom: 1.25rem;
          position: relative;
          z-index: 1;
        }

        .mode-features {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          position: relative;
          z-index: 1;
        }

        .mode-feature {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.6);
        }

        .mode-feature-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .mode-particles {
          position: absolute;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
        }

        .mode-particle {
          position: absolute;
          width: 4px;
          height: 4px;
          background: #a855f7;
          border-radius: 50%;
          animation: twinkle 2s ease-in-out infinite;
        }

        @keyframes twinkle {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.5); }
        }
      `}</style>
    </div>
  );
}
