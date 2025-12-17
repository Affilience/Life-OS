/**
 * Launch Section
 *
 * The grand finale with confetti celebration.
 * Features:
 * - Dramatic title reveal
 * - Confetti burst animation
 * - Stats summary
 * - Epic launch button
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { animate, stagger } from 'animejs';
import { feedback } from '../../../../services/microInteractions';

// Confetti particle component
function Confetti({ count = 100 }) {
  const colors = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ffffff'];

  return (
    <div className="confetti-container">
      {[...Array(count)].map((_, i) => {
        const color = colors[Math.floor(Math.random() * colors.length)];
        const left = Math.random() * 100;
        const delay = Math.random() * 3;
        const duration = 3 + Math.random() * 2;
        const size = 4 + Math.random() * 8;
        const rotation = Math.random() * 360;

        return (
          <div
            key={i}
            className="confetti-piece"
            style={{
              '--color': color,
              '--left': `${left}%`,
              '--delay': `${delay}s`,
              '--duration': `${duration}s`,
              '--size': `${size}px`,
              '--rotation': `${rotation}deg`,
            }}
          />
        );
      })}
    </div>
  );
}

export default function LaunchSection({
  isActive,
  progress,
  onLaunch,
  username,
  selectedGoals = [],
}) {
  const sectionRef = useRef(null);
  const buttonRef = useRef(null);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);

  // Entrance animation
  useEffect(() => {
    if (!isActive || hasAnimated) return;

    const section = sectionRef.current;
    if (!section) return;

    const runAnimations = async () => {
      // Title reveal with character animation
      const title = section.querySelector('.launch-title');
      if (title) {
        const text = title.textContent;
        title.innerHTML = '';

        const words = text.split(' ').map(word => {
          const span = document.createElement('span');
          span.className = 'word';
          span.style.display = 'inline-block';
          span.style.marginRight = '0.3em';

          word.split('').forEach(char => {
            const charSpan = document.createElement('span');
            charSpan.textContent = char;
            charSpan.className = 'char';
            charSpan.style.display = 'inline-block';
            span.appendChild(charSpan);
          });

          title.appendChild(span);
          return span;
        });

        const chars = title.querySelectorAll('.char');
        await animate(chars, {
          opacity: [0, 1],
          y: [80, 0],
          rotateX: [-90, 0],
          duration: 800,
          delay: stagger(30),
          ease: 'outExpo',
        }).finished;
      }

      // Message fade in
      await animate(section.querySelector('.launch-message'), {
        opacity: [0, 1],
        y: [30, 0],
        duration: 700,
        ease: 'outExpo',
      }).finished;

      // Button appears
      animate(buttonRef.current, {
        opacity: [0, 1],
        scale: [0.8, 1],
        duration: 600,
        ease: 'outBack',
      });

      // Stats appear
      const stats = section.querySelectorAll('.launch-stat');
      animate(stats, {
        opacity: [0, 1],
        y: [20, 0],
        duration: 500,
        delay: stagger(100, { start: 300 }),
        ease: 'outExpo',
      });

      feedback.taskComplete();
      setHasAnimated(true);
    };

    runAnimations();
  }, [isActive, hasAnimated]);

  // Handle launch
  const handleLaunch = useCallback(() => {
    if (isLaunching) return;

    setIsLaunching(true);
    setShowConfetti(true);
    feedback.levelUp();

    // Animate button
    animate(buttonRef.current, {
      scale: [1, 1.1, 1],
      duration: 300,
      ease: 'outBack',
    });

    // Delay actual launch for celebration
    setTimeout(() => {
      onLaunch?.();
    }, 2000);
  }, [isLaunching, onLaunch]);

  return (
    <div ref={sectionRef} className="launch-section">
      {/* Confetti */}
      {showConfetti && <Confetti count={150} />}

      {/* Ambient glow */}
      <div className="launch-glow" />

      {/* Title */}
      <h1 className="launch-title" style={{ perspective: '1000px' }}>
        Ready to begin?
      </h1>

      {/* Message */}
      <p className="launch-message" style={{ opacity: 0 }}>
        {username ? (
          <>
            {username}, your transformation starts now.
            <br />
            Every small step leads to extraordinary results.
          </>
        ) : (
          <>
            Your transformation starts now.
            <br />
            Every small step leads to extraordinary results.
          </>
        )}
      </p>

      {/* Launch button */}
      <button
        ref={buttonRef}
        className={`launch-button ${isLaunching ? 'launching' : ''}`}
        onClick={handleLaunch}
        disabled={isLaunching}
        style={{ opacity: 0 }}
      >
        {isLaunching ? (
          <>
            <span className="launch-button-text">Launching...</span>
            <span className="launch-button-loader" />
          </>
        ) : (
          <>
            <span className="launch-button-text">Launch My Journey</span>
            <span className="launch-button-icon">🚀</span>
          </>
        )}
      </button>

      {/* Stats summary */}
      <div className="launch-stats">
        <div className="launch-stat" style={{ opacity: 0 }}>
          <div className="launch-stat-value">Level 1</div>
          <div className="launch-stat-label">Starting Point</div>
        </div>
        <div className="launch-stat" style={{ opacity: 0 }}>
          <div className="launch-stat-value">{selectedGoals.length || 3}</div>
          <div className="launch-stat-label">Focus Areas</div>
        </div>
        <div className="launch-stat" style={{ opacity: 0 }}>
          <div className="launch-stat-value">∞</div>
          <div className="launch-stat-label">Potential</div>
        </div>
      </div>

      <style>{`
        .launch-section {
          position: relative;
          text-align: center;
          padding: 2rem;
        }

        .launch-glow {
          position: absolute;
          left: 50%;
          top: 40%;
          transform: translate(-50%, -50%);
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 60%);
          pointer-events: none;
        }

        .launch-title {
          font-size: clamp(2.5rem, 8vw, 4rem);
          font-weight: 800;
          background: linear-gradient(135deg, #ffffff 0%, #a855f7 40%, #ec4899 80%, #f59e0b 100%);
          background-size: 200% 200%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 1.5rem;
          animation: gradientFlow 5s ease infinite;
        }

        .launch-title .char {
          transform-style: preserve-3d;
        }

        @keyframes gradientFlow {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        .launch-message {
          font-size: 1.25rem;
          color: rgba(255, 255, 255, 0.7);
          max-width: 500px;
          margin: 0 auto 3rem;
          line-height: 1.7;
        }

        .launch-button {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1.5rem 3.5rem;
          font-size: 1.35rem;
          font-weight: 700;
          background: linear-gradient(135deg, #8b5cf6, #a855f7, #ec4899);
          background-size: 200% 200%;
          border: none;
          border-radius: 20px;
          color: white;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          animation: gradientFlow 3s ease infinite;
          overflow: hidden;
        }

        .launch-button::before {
          content: '';
          position: absolute;
          inset: -3px;
          background: linear-gradient(135deg, #8b5cf6, #ec4899, #f59e0b, #8b5cf6);
          background-size: 300% 300%;
          border-radius: 22px;
          z-index: -1;
          animation: gradientFlow 3s ease infinite;
          filter: blur(15px);
          opacity: 0.6;
        }

        .launch-button:hover:not(:disabled) {
          transform: scale(1.05) translateY(-4px);
          box-shadow: 0 25px 50px rgba(139, 92, 246, 0.4);
        }

        .launch-button:active:not(:disabled) {
          transform: scale(0.98);
        }

        .launch-button:disabled {
          cursor: default;
        }

        .launch-button.launching {
          background: linear-gradient(135deg, #10b981, #059669);
        }

        .launch-button-icon {
          font-size: 1.5rem;
          transition: transform 0.3s ease;
        }

        .launch-button:hover .launch-button-icon {
          transform: translateX(4px) rotate(15deg);
        }

        .launch-button-loader {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .launch-stats {
          display: flex;
          justify-content: center;
          gap: 4rem;
          margin-top: 4rem;
          padding-top: 2rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        @media (max-width: 640px) {
          .launch-stats {
            gap: 2rem;
            flex-wrap: wrap;
          }
        }

        .launch-stat {
          text-align: center;
        }

        .launch-stat-value {
          font-size: 2.5rem;
          font-weight: 800;
          background: linear-gradient(135deg, #a855f7, #ec4899);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .launch-stat-label {
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.5);
          margin-top: 0.25rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        /* Confetti styles */
        .confetti-container {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 1000;
          overflow: hidden;
        }

        .confetti-piece {
          position: absolute;
          top: -20px;
          left: var(--left);
          width: var(--size);
          height: var(--size);
          background: var(--color);
          border-radius: 2px;
          animation: confettiFall var(--duration) ease-out var(--delay) forwards;
          transform: rotate(var(--rotation));
        }

        @keyframes confettiFall {
          0% {
            top: -20px;
            opacity: 1;
            transform: rotate(var(--rotation)) translateX(0);
          }
          100% {
            top: 100vh;
            opacity: 0;
            transform: rotate(calc(var(--rotation) + 720deg)) translateX(calc(var(--rotation) * 2));
          }
        }
      `}</style>
    </div>
  );
}
