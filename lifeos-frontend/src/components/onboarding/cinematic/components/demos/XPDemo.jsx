/**
 * XP Demo
 *
 * Interactive XP earning demonstration.
 * - Click button to earn XP
 * - Bar fills with animation
 * - Level up celebration when full
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { animate, stagger } from 'animejs';
import { feedback } from '../../../../../services/microInteractions';

export default function XPDemo({ isActive, onInteract }) {
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [totalXp, setTotalXp] = useState(0);
  const [taps, setTaps] = useState(0);
  const [floatingXp, setFloatingXp] = useState([]);
  const [isLevelingUp, setIsLevelingUp] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);

  const containerRef = useRef(null);
  const barRef = useRef(null);
  const buttonRef = useRef(null);

  const XP_PER_LEVEL = 100;
  const XP_PER_TAP = 25;

  // Initial animation
  useEffect(() => {
    if (!isActive || hasAnimated) return;

    const container = containerRef.current;
    if (!container) return;

    // Animate elements in
    animate(container.querySelectorAll('.xp-animate-in'), {
      opacity: [0, 1],
      y: [20, 0],
      duration: 600,
      delay: stagger(100),
      ease: 'outExpo',
    });

    // Initial XP bar fill
    setTimeout(() => {
      setXp(15);
      setTotalXp(15);
    }, 500);

    setHasAnimated(true);
  }, [isActive, hasAnimated]);

  // Handle XP bar animation
  useEffect(() => {
    if (!barRef.current) return;

    animate(barRef.current, {
      width: `${xp}%`,
      duration: 500,
      ease: 'outExpo',
    });
  }, [xp]);

  // Handle level up
  useEffect(() => {
    if (xp >= 100 && !isLevelingUp) {
      setIsLevelingUp(true);

      // Level up animation
      const container = containerRef.current;
      if (container) {
        animate(container.querySelector('.xp-level-badge'), {
          scale: [1, 1.3, 1],
          rotate: [0, 10, -10, 0],
          duration: 600,
          ease: 'outElastic',
        });

        // Flash effect
        animate(container.querySelector('.xp-bar-container'), {
          boxShadow: [
            '0 0 0 0 rgba(251, 191, 36, 0)',
            '0 0 30px 10px rgba(251, 191, 36, 0.5)',
            '0 0 0 0 rgba(251, 191, 36, 0)',
          ],
          duration: 600,
        });
      }

      feedback.levelUp?.() || feedback.taskComplete();

      setTimeout(() => {
        setLevel((l) => l + 1);
        setXp(0);
        setIsLevelingUp(false);
      }, 800);
    }
  }, [xp, isLevelingUp]);

  // Handle tap/click
  const handleTap = useCallback(() => {
    if (isLevelingUp) return;

    onInteract?.();
    feedback.buttonPress();

    const newXp = Math.min(xp + XP_PER_TAP, 100);
    setXp(newXp);
    setTotalXp((t) => t + XP_PER_TAP);
    setTaps((t) => t + 1);

    // Add floating XP text
    const id = Date.now();
    setFloatingXp((prev) => [...prev, { id, value: XP_PER_TAP }]);

    // Button press animation
    animate(buttonRef.current, {
      scale: [1, 0.95, 1.05, 1],
      duration: 300,
      ease: 'outBack',
    });

    // Remove floating XP after animation
    setTimeout(() => {
      setFloatingXp((prev) => prev.filter((f) => f.id !== id));
    }, 1200);
  }, [xp, isLevelingUp, onInteract]);

  return (
    <div ref={containerRef} className="xp-demo">
      {/* Level badges */}
      <div className="xp-levels xp-animate-in" style={{ opacity: 0 }}>
        <div className="xp-level-badge current">
          <span className="xp-level-label">Level</span>
          <span className="xp-level-value">{level}</span>
        </div>
        <div className="xp-level-badge next">
          <span className="xp-level-label">Next</span>
          <span className="xp-level-value">{level + 1}</span>
        </div>
      </div>

      {/* XP Bar */}
      <div className="xp-bar-container xp-animate-in" style={{ opacity: 0 }}>
        <div className="xp-bar-bg">
          <div ref={barRef} className="xp-bar-fill" style={{ width: '0%' }}>
            <div className="xp-bar-shine" />
          </div>
        </div>
        <div className="xp-bar-percent">{xp}%</div>
      </div>

      {/* Level up text */}
      {isLevelingUp && (
        <div className="xp-levelup-text">LEVEL UP!</div>
      )}

      {/* Tap button */}
      <button
        ref={buttonRef}
        className="xp-tap-button xp-animate-in"
        onClick={handleTap}
        disabled={isLevelingUp}
        style={{ opacity: 0 }}
      >
        <span className="xp-tap-icon">⚡</span>
        <span className="xp-tap-text">TAP TO EARN XP</span>
      </button>

      {/* Floating XP texts */}
      {floatingXp.map((f) => (
        <div key={f.id} className="xp-floating">
          +{f.value} XP
        </div>
      ))}

      {/* Stats */}
      <div className="xp-stats xp-animate-in" style={{ opacity: 0 }}>
        <div className="xp-stat">
          <span className="xp-stat-value">{totalXp}</span>
          <span className="xp-stat-label">Total XP</span>
        </div>
        <div className="xp-stat">
          <span className="xp-stat-value">{taps}</span>
          <span className="xp-stat-label">Tasks</span>
        </div>
      </div>

      <style>{`
        .xp-demo {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.25rem;
          padding: 1rem 0;
          position: relative;
        }

        .xp-levels {
          display: flex;
          justify-content: space-between;
          width: 100%;
          max-width: 300px;
        }

        .xp-level-badge {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 0.5rem 1rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
        }

        .xp-level-badge.current {
          background: linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(251, 191, 36, 0.05));
          border: 1px solid rgba(251, 191, 36, 0.3);
        }

        .xp-level-badge.next {
          opacity: 0.5;
        }

        .xp-level-label {
          font-size: 0.7rem;
          color: rgba(255, 255, 255, 0.5);
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .xp-level-value {
          font-size: 1.5rem;
          font-weight: 800;
          color: white;
        }

        .xp-bar-container {
          width: 100%;
          max-width: 300px;
          position: relative;
        }

        .xp-bar-bg {
          height: 20px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          overflow: hidden;
        }

        .xp-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #fbbf24, #f59e0b);
          border-radius: 10px;
          position: relative;
          transition: width 0.3s ease;
        }

        .xp-bar-shine {
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.3),
            transparent
          );
          animation: shine 2s infinite;
        }

        @keyframes shine {
          100% { left: 200%; }
        }

        .xp-bar-percent {
          position: absolute;
          right: 0;
          top: 50%;
          transform: translateY(-50%);
          font-size: 0.85rem;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.6);
          padding-right: 0.5rem;
        }

        .xp-levelup-text {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 2rem;
          font-weight: 800;
          background: linear-gradient(135deg, #fbbf24, #f59e0b);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: levelUpPop 0.6s ease-out;
          z-index: 10;
        }

        @keyframes levelUpPop {
          0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
          50% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        }

        .xp-tap-button {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 2rem;
          background: linear-gradient(135deg, #8b5cf6, #a855f7);
          border: none;
          border-radius: 16px;
          color: white;
          font-size: 1rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(139, 92, 246, 0.4); }
          50% { box-shadow: 0 0 20px 8px rgba(139, 92, 246, 0.2); }
        }

        .xp-tap-button:hover:not(:disabled) {
          transform: scale(1.05);
          box-shadow: 0 10px 30px rgba(139, 92, 246, 0.4);
        }

        .xp-tap-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .xp-tap-icon {
          font-size: 1.25rem;
        }

        .xp-floating {
          position: absolute;
          top: 40%;
          left: 50%;
          font-size: 1.5rem;
          font-weight: 800;
          color: #fbbf24;
          text-shadow: 0 2px 10px rgba(251, 191, 36, 0.5);
          animation: floatUp 1.2s ease-out forwards;
          pointer-events: none;
        }

        @keyframes floatUp {
          0% {
            opacity: 0;
            transform: translate(-50%, 0) scale(0.5);
          }
          20% {
            opacity: 1;
            transform: translate(-50%, -10px) scale(1.2);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -60px) scale(1);
          }
        }

        .xp-stats {
          display: flex;
          gap: 3rem;
          margin-top: 0.5rem;
        }

        .xp-stat {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .xp-stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: white;
        }

        .xp-stat-label {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.5);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
      `}</style>
    </div>
  );
}
