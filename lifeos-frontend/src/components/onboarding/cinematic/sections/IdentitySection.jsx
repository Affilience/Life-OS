/**
 * Identity Section - Enhanced with anime.js effects
 *
 * Where users create their identity/username.
 * Features:
 * - Flowing energy border animation
 * - Keystroke particle sparks
 * - Ripple effects on type
 * - Valid name celebration animation
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { animate, stagger } from 'animejs';
import { feedback } from '../../../../services/microInteractions';

// Particle component for keystroke effects
const KeystrokeParticle = ({ x, y, color, onComplete }) => {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;

    const angle = Math.random() * Math.PI * 2;
    const distance = 30 + Math.random() * 50;
    const duration = 400 + Math.random() * 300;

    animate(ref.current, {
      translateX: [0, Math.cos(angle) * distance],
      translateY: [0, Math.sin(angle) * distance - 20],
      scale: [1, 0],
      opacity: [1, 0],
      duration,
      ease: 'outExpo',
      onComplete,
    });
  }, [onComplete]);

  return (
    <div
      ref={ref}
      className="keystroke-particle"
      style={{
        left: x,
        top: y,
        background: color,
      }}
    />
  );
};

// Ripple effect component
const TypeRipple = ({ x, y, onComplete }) => {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;

    animate(ref.current, {
      scale: [0.5, 2.5],
      opacity: [0.6, 0],
      duration: 600,
      ease: 'outExpo',
      onComplete,
    });
  }, [onComplete]);

  return (
    <div
      ref={ref}
      className="type-ripple"
      style={{ left: x, top: y }}
    />
  );
};

export default function IdentitySection({
  isActive,
  progress,
  onComplete,
  onLockScroll,
  username,
  setUsername,
}) {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const inputRef = useRef(null);
  const inputContainerRef = useRef(null);
  const borderRef = useRef(null);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [showContinue, setShowContinue] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [particles, setParticles] = useState([]);
  const [ripples, setRipples] = useState([]);
  const [hasShownCelebration, setHasShownCelebration] = useState(false);
  const particleIdRef = useRef(0);
  const rippleIdRef = useRef(0);

  // Border animation is handled via CSS keyframes for better performance

  // Validate username
  useEffect(() => {
    const valid = username && username.length >= 2 && username.length <= 20;
    setIsValid(valid);
    setShowContinue(valid);

    // Trigger celebration on first valid
    if (valid && !hasShownCelebration && inputContainerRef.current) {
      setHasShownCelebration(true);
      triggerValidCelebration();
    }
  }, [username, hasShownCelebration]);

  // Celebration when name becomes valid
  const triggerValidCelebration = useCallback(() => {
    if (!inputContainerRef.current) return;

    feedback.taskComplete();

    const container = inputContainerRef.current;
    const rect = container.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Burst particles around the input
    const newParticles = [];
    for (let i = 0; i < 20; i++) {
      newParticles.push({
        id: particleIdRef.current++,
        x: centerX,
        y: centerY,
        color: i % 2 === 0 ? '#10b981' : '#fbbf24',
      });
    }
    setParticles(prev => [...prev, ...newParticles]);

    // Scale pulse on container
    animate(container, {
      scale: [1, 1.02, 1],
      duration: 400,
      ease: 'outElastic(1, .5)',
    });

    // Glow intensify
    const glow = container.querySelector('.identity-input-glow');
    if (glow) {
      animate(glow, {
        opacity: [0.3, 0.8, 0.3],
        duration: 800,
        ease: 'outQuad',
      });
    }
  }, []);

  // Lock scroll when input is focused
  useEffect(() => {
    if (isActive && isFocused) {
      onLockScroll?.(true);
    } else {
      onLockScroll?.(false);
    }
  }, [isActive, isFocused, onLockScroll]);

  // Entrance animation
  useEffect(() => {
    if (!isActive || hasAnimated) return;

    const section = sectionRef.current;
    if (!section) return;

    // Animate title with letter stagger
    const titleEl = titleRef.current;
    if (titleEl) {
      animate(titleEl, {
        opacity: [0, 1],
        y: [40, 0],
        duration: 800,
        ease: 'outExpo',
      });
    }

    // Animate subtitle
    const subtitle = section.querySelector('.identity-subtitle');
    if (subtitle) {
      animate(subtitle, {
        opacity: [0, 1],
        y: [30, 0],
        duration: 800,
        delay: 200,
        ease: 'outExpo',
      });
    }

    // Animate input wrapper with special entrance
    const inputWrapper = section.querySelector('.identity-input-wrapper');
    if (inputWrapper) {
      animate(inputWrapper, {
        opacity: [0, 1],
        y: [30, 0],
        scale: [0.95, 1],
        duration: 800,
        delay: 400,
        ease: 'outExpo',
      });

      // Flash the border on entrance
      if (borderRef.current) {
        animate(borderRef.current, {
          opacity: [0, 1, 0.6],
          duration: 600,
          delay: 600,
          ease: 'outQuad',
        });
      }

      // Focus input after animations
      setTimeout(() => {
        inputRef.current?.focus();
      }, 1200);
    }

    setHasAnimated(true);
    feedback.buttonPress();
  }, [isActive, hasAnimated]);

  // Handle input change with particle effects
  const handleInputChange = useCallback((e) => {
    const newValue = e.target.value;
    const wasEmpty = !username || username.length === 0;
    const isAdding = newValue.length > (username?.length || 0);

    setUsername(newValue);

    // Only spawn particles when adding characters
    if (isAdding && inputContainerRef.current) {
      const rect = inputContainerRef.current.getBoundingClientRect();
      const inputEl = inputRef.current;

      // Estimate cursor position (at the end of text)
      const charWidth = 14; // Approximate character width
      const textWidth = Math.min(newValue.length * charWidth, rect.width - 40);
      const cursorX = 20 + textWidth;
      const cursorY = rect.height / 2;

      // Spawn keystroke particles
      const newParticles = [];
      const particleCount = 3 + Math.floor(Math.random() * 3);
      for (let i = 0; i < particleCount; i++) {
        newParticles.push({
          id: particleIdRef.current++,
          x: cursorX,
          y: cursorY,
          color: isFocused ? '#a855f7' : '#8b5cf6',
        });
      }
      setParticles(prev => [...prev, ...newParticles]);

      // Spawn ripple
      setRipples(prev => [...prev, {
        id: rippleIdRef.current++,
        x: cursorX,
        y: cursorY,
      }]);

      // Subtle pulse on the border
      if (borderRef.current) {
        animate(borderRef.current, {
          opacity: [0.6, 1, 0.6],
          duration: 300,
          ease: 'outQuad',
        });
      }
    }
  }, [username, setUsername, isFocused]);

  // Remove particle when animation completes
  const removeParticle = useCallback((id) => {
    setParticles(prev => prev.filter(p => p.id !== id));
  }, []);

  // Remove ripple when animation completes
  const removeRipple = useCallback((id) => {
    setRipples(prev => prev.filter(r => r.id !== id));
  }, []);

  // Handle continue
  const handleContinue = useCallback(() => {
    if (!isValid) return;

    feedback.taskComplete();

    // Celebration exit animation
    if (inputContainerRef.current) {
      animate(inputContainerRef.current, {
        scale: [1, 1.05, 1],
        duration: 400,
        ease: 'outElastic(1, .5)',
      });
    }

    setTimeout(() => {
      onLockScroll?.(false);
      onComplete?.();
    }, 300);
  }, [isValid, onComplete, onLockScroll]);

  // Handle Enter key
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && isValid) {
      handleContinue();
    }
  }, [isValid, handleContinue]);

  // Focus animation
  const handleFocus = useCallback(() => {
    setIsFocused(true);

    if (inputContainerRef.current) {
      animate(inputContainerRef.current, {
        scale: [1, 1.02],
        duration: 300,
        ease: 'outQuad',
      });
    }
  }, []);

  // Blur animation
  const handleBlur = useCallback(() => {
    setIsFocused(false);

    if (inputContainerRef.current) {
      animate(inputContainerRef.current, {
        scale: [1.02, 1],
        duration: 300,
        ease: 'outQuad',
      });
    }
  }, []);

  return (
    <div ref={sectionRef} className="identity-section">
      {/* Animated background rings */}
      <div className="identity-rings">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="identity-ring"
            style={{
              width: `${200 + i * 100}px`,
              height: `${200 + i * 100}px`,
              animationDelay: `${i * 0.5}s`,
              opacity: 0.1 - i * 0.02,
            }}
          />
        ))}
      </div>

      <h2 ref={titleRef} className="identity-title" style={{ opacity: 0 }}>
        Who are you?
      </h2>

      <p className="identity-subtitle" style={{ opacity: 0 }}>
        Choose a name for your journey. This is how we'll greet you.
      </p>

      <div className="identity-input-wrapper" style={{ opacity: 0 }}>
        <div
          ref={inputContainerRef}
          className={`identity-input-container ${isFocused ? 'focused' : ''} ${isValid ? 'valid' : ''}`}
        >
          <input
            ref={inputRef}
            type="text"
            className="identity-input"
            value={username || ''}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            placeholder="Enter your name..."
            maxLength={20}
            autoComplete="off"
            spellCheck={false}
          />

          {/* Flowing energy border */}
          <div ref={borderRef} className="identity-input-border" />

          {/* Glow effect */}
          <div className="identity-input-glow" />

          {/* Corner accents */}
          <div className="corner-accent top-left" />
          <div className="corner-accent top-right" />
          <div className="corner-accent bottom-left" />
          <div className="corner-accent bottom-right" />

          {/* Keystroke particles */}
          {particles.map(p => (
            <KeystrokeParticle
              key={p.id}
              x={p.x}
              y={p.y}
              color={p.color}
              onComplete={() => removeParticle(p.id)}
            />
          ))}

          {/* Type ripples */}
          {ripples.map(r => (
            <TypeRipple
              key={r.id}
              x={r.x}
              y={r.y}
              onComplete={() => removeRipple(r.id)}
            />
          ))}
        </div>

        {/* Character count */}
        <div className="identity-char-count">
          <span className={username?.length >= 2 ? 'valid' : ''}>
            {username?.length || 0}
          </span>
          <span className="separator">/</span>
          <span>20</span>
        </div>
      </div>

      {/* Continue button */}
      <button
        className={`identity-continue ${showContinue ? 'visible' : ''}`}
        onClick={handleContinue}
        disabled={!isValid}
      >
        Continue
        <span className="identity-continue-arrow">→</span>
      </button>

      {/* Greeting preview */}
      {username && username.length >= 2 && (
        <div className="identity-preview">
          <span className="identity-preview-text">
            Welcome, <span className="identity-preview-name">{username}</span>
          </span>
        </div>
      )}

      <style>{`
        .identity-section {
          position: relative;
          max-width: 600px;
          margin: 0 auto;
          text-align: center;
        }

        .identity-rings {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          pointer-events: none;
        }

        .identity-ring {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          border: 1px solid rgba(139, 92, 246, 0.3);
          border-radius: 50%;
          animation: pulseRing 4s ease-in-out infinite;
        }

        @keyframes pulseRing {
          0%, 100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.1;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.1);
            opacity: 0.2;
          }
        }

        .identity-title {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 1rem;
          background: linear-gradient(135deg, #fff 0%, #c4b5fd 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .identity-subtitle {
          font-size: 1.1rem;
          color: rgba(255, 255, 255, 0.6);
          margin-bottom: 2rem;
        }

        .identity-input-wrapper {
          position: relative;
          display: inline-block;
          width: 100%;
          max-width: 400px;
        }

        .identity-input-container {
          position: relative;
          border-radius: 16px;
          overflow: visible;
          transition: transform 0.3s ease;
        }

        .identity-input {
          width: 100%;
          padding: 1.25rem 1.5rem;
          font-size: 1.25rem;
          font-weight: 500;
          background: rgba(15, 10, 30, 0.8);
          border: none;
          border-radius: 16px;
          color: white;
          outline: none;
          text-align: center;
        }

        .identity-input::placeholder {
          color: rgba(255, 255, 255, 0.3);
        }

        /* Flowing energy border with animated gradient */
        .identity-input-border {
          position: absolute;
          inset: -2px;
          border-radius: 18px;
          background: linear-gradient(90deg,
            rgba(139, 92, 246, 0.3),
            rgba(168, 85, 247, 0.8),
            rgba(139, 92, 246, 0.3)
          );
          background-size: 200% 100%;
          animation: borderFlow 2s linear infinite;
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask-composite: exclude;
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          padding: 2px;
          pointer-events: none;
          opacity: 0.6;
          z-index: 1;
        }

        @keyframes borderFlow {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }

        .identity-input-container.focused .identity-input-border {
          opacity: 1;
          background: linear-gradient(90deg,
            rgba(139, 92, 246, 0.4),
            rgba(168, 85, 247, 1),
            rgba(192, 132, 252, 1),
            rgba(168, 85, 247, 1),
            rgba(139, 92, 246, 0.4)
          );
          background-size: 200% 100%;
        }

        .identity-input-container.valid .identity-input-border {
          background: linear-gradient(90deg,
            rgba(16, 185, 129, 0.4),
            rgba(16, 185, 129, 1),
            rgba(52, 211, 153, 1),
            rgba(16, 185, 129, 1),
            rgba(16, 185, 129, 0.4)
          );
          background-size: 200% 100%;
        }

        .identity-input-glow {
          position: absolute;
          inset: -20px;
          background: radial-gradient(ellipse at center, rgba(139, 92, 246, 0.25) 0%, transparent 70%);
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
          z-index: 0;
        }

        .identity-input-container.focused .identity-input-glow {
          opacity: 1;
        }

        .identity-input-container.valid .identity-input-glow {
          background: radial-gradient(ellipse at center, rgba(16, 185, 129, 0.25) 0%, transparent 70%);
        }

        /* Corner accents */
        .corner-accent {
          position: absolute;
          width: 12px;
          height: 12px;
          border: 2px solid rgba(139, 92, 246, 0.5);
          pointer-events: none;
          z-index: 2;
          transition: all 0.3s ease;
        }

        .corner-accent.top-left {
          top: -4px;
          left: -4px;
          border-right: none;
          border-bottom: none;
          border-radius: 4px 0 0 0;
        }

        .corner-accent.top-right {
          top: -4px;
          right: -4px;
          border-left: none;
          border-bottom: none;
          border-radius: 0 4px 0 0;
        }

        .corner-accent.bottom-left {
          bottom: -4px;
          left: -4px;
          border-right: none;
          border-top: none;
          border-radius: 0 0 0 4px;
        }

        .corner-accent.bottom-right {
          bottom: -4px;
          right: -4px;
          border-left: none;
          border-top: none;
          border-radius: 0 0 4px 0;
        }

        .identity-input-container.focused .corner-accent {
          border-color: rgba(168, 85, 247, 0.8);
          transform: scale(1.2);
        }

        .identity-input-container.valid .corner-accent {
          border-color: rgba(16, 185, 129, 0.8);
        }

        /* Keystroke particles */
        .keystroke-particle {
          position: absolute;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          pointer-events: none;
          z-index: 10;
          box-shadow: 0 0 6px currentColor;
        }

        /* Type ripple */
        .type-ripple {
          position: absolute;
          width: 20px;
          height: 20px;
          border: 2px solid rgba(168, 85, 247, 0.5);
          border-radius: 50%;
          pointer-events: none;
          z-index: 5;
          transform: translate(-50%, -50%);
        }

        .identity-char-count {
          display: flex;
          justify-content: center;
          gap: 4px;
          margin-top: 0.75rem;
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.4);
        }

        .identity-char-count .valid {
          color: #10b981;
        }

        .identity-char-count .separator {
          opacity: 0.5;
        }

        .identity-continue {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          margin-top: 2rem;
          padding: 1rem 2.5rem;
          font-size: 1.125rem;
          font-weight: 600;
          background: linear-gradient(135deg, #8b5cf6, #a855f7);
          border: none;
          border-radius: 12px;
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
          opacity: 0;
          transform: translateY(20px);
          position: relative;
          overflow: hidden;
        }

        .identity-continue::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.2),
            transparent
          );
          transform: translateX(-100%);
          transition: transform 0.5s ease;
        }

        .identity-continue:hover::before {
          transform: translateX(100%);
        }

        .identity-continue.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .identity-continue:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(139, 92, 246, 0.4);
        }

        .identity-continue:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .identity-continue-arrow {
          transition: transform 0.3s ease;
        }

        .identity-continue:hover:not(:disabled) .identity-continue-arrow {
          transform: translateX(4px);
        }

        .identity-preview {
          margin-top: 2rem;
          animation: fadeIn 0.5s ease;
        }

        .identity-preview-text {
          font-size: 1rem;
          color: rgba(255, 255, 255, 0.5);
        }

        .identity-preview-name {
          color: #a855f7;
          font-weight: 600;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 640px) {
          .identity-title {
            font-size: 2rem;
          }

          .identity-input {
            font-size: 1.1rem;
            padding: 1rem 1.25rem;
          }

          .identity-input-wrapper {
            max-width: 320px;
          }
        }
      `}</style>
    </div>
  );
}
