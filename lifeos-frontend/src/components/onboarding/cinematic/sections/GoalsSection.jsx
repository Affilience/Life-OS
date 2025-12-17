/**
 * Goals Section - Constellation Builder
 *
 * An immersive goal selection experience where users build their personal
 * constellation by selecting life focus areas. Features:
 *
 * - Floating goal orbs in circular layout
 * - Energy lines connecting selected goals
 * - Star ignition effect on selection
 * - Integrated with main cosmic background
 */

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { animate, stagger, createTimeline } from 'animejs';
import { feedback } from '../../../../services/microInteractions';

const GOALS = [
  { id: 'productivity', icon: '⚡', label: 'Productivity', description: 'Master your time', color: '#fbbf24' },
  { id: 'health', icon: '💪', label: 'Health', description: 'Peak performance', color: '#22c55e' },
  { id: 'learning', icon: '📚', label: 'Learning', description: 'Grow your mind', color: '#3b82f6' },
  { id: 'financial', icon: '💰', label: 'Finances', description: 'Build wealth', color: '#f59e0b' },
  { id: 'habits', icon: '🎯', label: 'Habits', description: 'Shape your days', color: '#ec4899' },
  { id: 'mindfulness', icon: '🧘', label: 'Mindfulness', description: 'Inner peace', color: '#8b5cf6' },
];

// Circular layout - 6 positions evenly spaced around a circle
const GOAL_POSITIONS = (() => {
  const positions = [];
  for (let i = 0; i < 6; i++) {
    const angle = (i * 60 - 90) * (Math.PI / 180); // Start from top, go clockwise
    positions.push({
      x: Math.cos(angle),
      y: Math.sin(angle),
    });
  }
  return positions;
})();

export default function GoalsSection({
  isActive,
  progress,
  onComplete,
  onLockScroll,
  selectedGoals = [],
  setSelectedGoals,
}) {
  const sectionRef = useRef(null);
  const orbsContainerRef = useRef(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  const maxGoals = 3;
  const canSelectMore = selectedGoals.length < maxGoals;

  // Internal rotation state driven by wheel events
  const [rotation, setRotation] = useState(0);
  const lastWheelTime = useRef(0);

  // Capture wheel events to rotate instead of scroll
  useEffect(() => {
    if (!isActive || selectedGoals.length >= maxGoals) return;

    const handleWheel = (e) => {
      e.preventDefault();
      e.stopPropagation();

      const now = Date.now();
      if (now - lastWheelTime.current < 16) return; // ~60fps
      lastWheelTime.current = now;

      // Rotate based on scroll direction
      const delta = e.deltaY > 0 ? 2 : -2;
      setRotation(prev => prev + delta);
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [isActive, selectedGoals.length, maxGoals]);

  // Entrance animation - staggered orb reveal
  useEffect(() => {
    if (!isActive || hasAnimated) return;

    const section = sectionRef.current;
    if (!section) return;

    const timeline = createTimeline({
      defaults: { ease: 'outExpo' }
    });

    // Title reveal
    timeline.add(section.querySelector('.goals-title'), {
      opacity: [0, 1],
      y: [60, 0],
      duration: 1000,
    }, 0);

    // Subtitle reveal
    timeline.add(section.querySelector('.goals-subtitle'), {
      opacity: [0, 1],
      y: [40, 0],
      duration: 800,
    }, 200);

    // Orbs bloom in from center with stagger
    const orbs = section.querySelectorAll('.goal-orb');
    timeline.add(orbs, {
      opacity: [0, 1],
      scale: [0, 1],
      duration: 800,
      delay: stagger(120, { from: 'center' }),
      ease: 'outBack',
    }, 500);

    // Instruction text
    timeline.add(section.querySelector('.goals-instruction'), {
      opacity: [0, 1],
      y: [20, 0],
      duration: 600,
    }, 1200);

    setHasAnimated(true);
  }, [isActive, hasAnimated]);

  // Handle goal selection with star ignition effect
  const handleGoalSelect = useCallback((goalId, element) => {
    const isSelected = selectedGoals.includes(goalId);

    if (isSelected) {
      // Deselect with shrink animation
      setSelectedGoals(selectedGoals.filter(id => id !== goalId));

      animate(element, {
        scale: [1.15, 1],
        duration: 300,
        ease: 'outQuad',
      });

      feedback.buttonPress();
    } else if (canSelectMore) {
      // Select with ignition effect
      setSelectedGoals([...selectedGoals, goalId]);

      // Star ignition animation
      const timeline = createTimeline();

      // Scale pulse
      timeline.add(element, {
        scale: [1, 1.3, 1.15],
        duration: 400,
        ease: 'outBack',
      }, 0);

      // Ring expansion
      const ring = element.querySelector('.orb-ring');
      if (ring) {
        timeline.add(ring, {
          scale: [1, 2.5],
          opacity: [0.8, 0],
          duration: 600,
          ease: 'outQuad',
        }, 0);
      }

      // Particle burst
      const particles = element.querySelectorAll('.ignition-particle');
      particles.forEach((particle, i) => {
        const angle = (i / particles.length) * Math.PI * 2;
        const distance = 60 + Math.random() * 40;

        animate(particle, {
          translateX: [0, Math.cos(angle) * distance],
          translateY: [0, Math.sin(angle) * distance],
          scale: [1, 0],
          opacity: [1, 0],
          duration: 600 + Math.random() * 200,
          ease: 'outQuad',
        });
      });

      feedback.taskComplete();

      // Check if max goals reached
      if (selectedGoals.length + 1 >= maxGoals) {
        setTimeout(() => {
          onComplete?.();
        }, 1000);
      }
    }
  }, [selectedGoals, setSelectedGoals, canSelectMore, maxGoals, onComplete]);

  // Generate constellation lines data (normalized coordinates)
  const constellationLines = useMemo(() => {
    if (selectedGoals.length < 2) return [];

    const lines = [];
    const selectedPositions = selectedGoals.map(id => {
      const index = GOALS.findIndex(g => g.id === id);
      return GOAL_POSITIONS[index];
    });

    for (let i = 0; i < selectedPositions.length - 1; i++) {
      lines.push({
        start: selectedPositions[i],
        end: selectedPositions[i + 1],
        key: `${selectedGoals[i]}-${selectedGoals[i + 1]}`,
      });
    }

    // Close the triangle for 3 goals
    if (selectedGoals.length === 3) {
      lines.push({
        start: selectedPositions[2],
        end: selectedPositions[0],
        key: `${selectedGoals[2]}-${selectedGoals[0]}`,
      });
    }

    return lines;
  }, [selectedGoals]);

  // SVG constellation lines (in pixel coordinates)
  // Container is 500x500, orbs are positioned at radius 180 from center
  const CONTAINER_SIZE = 500;
  const ORB_RADIUS = 180;
  const CENTER = CONTAINER_SIZE / 2; // 250

  const svgLines = useMemo(() => {
    if (selectedGoals.length < 2) return [];

    // Calculate line endpoints to match orb centers
    // Orbs use: transform: translate(pos.x * ORB_RADIUS, -pos.y * ORB_RADIUS)
    // From center point at (275, 275)
    return constellationLines.map(line => ({
      ...line,
      x1: CENTER + line.start.x * ORB_RADIUS,
      y1: CENTER - line.start.y * ORB_RADIUS,
      x2: CENTER + line.end.x * ORB_RADIUS,
      y2: CENTER - line.end.y * ORB_RADIUS,
    }));
  }, [constellationLines, selectedGoals]);

  return (
    <div ref={sectionRef} className="goals-section">
      {/* Content - no separate background, uses main cosmic background */}
      <div className="goals-content">
        <h2 className="goals-title" style={{ opacity: 0 }}>
          Build Your Constellation
        </h2>

        <p className="goals-subtitle" style={{ opacity: 0 }}>
          Choose {maxGoals} stars to guide your journey
        </p>

        {/* Orbs Container - rotates with scroll */}
        <div
          ref={orbsContainerRef}
          className="goals-orbs-container"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          {/* SVG Constellation Lines */}
          <svg
            className="constellation-svg"
            viewBox={`0 0 ${CONTAINER_SIZE} ${CONTAINER_SIZE}`}
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <linearGradient id="energyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="50%" stopColor="#ec4899" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
              <filter id="lineGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {svgLines.map(({ key, x1, y1, x2, y2 }) => (
              <g key={key}>
                {/* Glow layer */}
                <line
                  x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke="url(#energyGradient)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  opacity="0.4"
                  filter="url(#lineGlow)"
                  className="constellation-line-glow"
                />
                {/* Main line */}
                <line
                  x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke="url(#energyGradient)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  opacity="1"
                  className="constellation-line"
                />
              </g>
            ))}
          </svg>

          {/* Goal Orbs */}
          {GOALS.map((goal, index) => {
            const pos = GOAL_POSITIONS[index];
            const isSelected = selectedGoals.includes(goal.id);
            const isDisabled = !canSelectMore && !isSelected;
            const selectionNumber = selectedGoals.indexOf(goal.id) + 1;

            // Position orbs in a circle - use same radius as SVG lines
            const offsetX = pos.x * ORB_RADIUS;
            const offsetY = -pos.y * ORB_RADIUS;

            return (
              <div
                key={goal.id}
                className={`goal-orb ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
                style={{
                  '--orb-color': goal.color,
                  '--orb-delay': `${index * 0.1}s`,
                  transform: `translate(${offsetX}px, ${offsetY}px)`,
                  opacity: 0,
                }}
                onClick={(e) => !isDisabled && handleGoalSelect(goal.id, e.currentTarget)}
              >
                {/* Orbital ring animation */}
                <div className="orb-orbit" />

                {/* Selection ring burst */}
                <div className="orb-ring" />

                {/* Ignition particles */}
                <div className="ignition-particles">
                  {[...Array(12)].map((_, i) => (
                    <div key={i} className="ignition-particle" />
                  ))}
                </div>

                {/* Main orb */}
                <div className="orb-core">
                  <div className="orb-glow" />
                  <div className="orb-icon">{goal.icon}</div>
                </div>

                {/* Label - counter-rotate to stay readable */}
                <div
                  className="orb-label"
                  style={{ transform: `translateX(-50%) rotate(${-rotation}deg)` }}
                >
                  <span className="orb-name">{goal.label}</span>
                  <span className="orb-desc">{goal.description}</span>
                </div>

                {/* Selection badge */}
                {isSelected && (
                  <div className="orb-badge">{selectionNumber}</div>
                )}
              </div>
            );
          })}
        </div>

        {/* Progress indicator */}
        <div className="goals-instruction" style={{ opacity: 0 }}>
          <div className="goals-progress">
            {[...Array(maxGoals)].map((_, i) => (
              <div
                key={i}
                className={`progress-star ${i < selectedGoals.length ? 'filled' : ''}`}
              >
                ★
              </div>
            ))}
          </div>
          <span className="goals-hint">
            {selectedGoals.length === 0 && 'Tap the stars that call to you'}
            {selectedGoals.length > 0 && selectedGoals.length < maxGoals &&
              `${maxGoals - selectedGoals.length} more to complete your constellation`}
            {selectedGoals.length >= maxGoals && '✨ Your constellation is complete!'}
          </span>
        </div>
      </div>

      <style>{`
        .goals-section {
          position: relative;
          max-width: 550px;
          margin: 0 auto;
          text-align: center;
          padding: 0.5rem;
          overflow: visible;
        }

        .goals-content {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .goals-title {
          font-size: clamp(1.75rem, 5vw, 2.5rem);
          font-weight: 800;
          background: linear-gradient(135deg, #ffffff 0%, #a855f7 50%, #ec4899 100%);
          background-size: 200% 200%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 0.5rem;
          animation: gradientShift 8s ease infinite;
        }

        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        .goals-subtitle {
          font-size: 1rem;
          color: rgba(255, 255, 255, 0.6);
          margin-bottom: 1rem;
        }

        .goals-orbs-container {
          position: relative;
          width: 500px;
          height: 500px;
          transition: transform 0.15s ease-out;
          flex-shrink: 0;
          margin: 1rem 0;
        }

        .constellation-svg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 1;
        }

        .constellation-line {
          animation: linePulse 2s ease-in-out infinite;
        }

        .constellation-line-glow {
          animation: glowPulse 2s ease-in-out infinite;
        }

        @keyframes linePulse {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 1; }
        }

        @keyframes glowPulse {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.4; }
        }

        .goal-orb {
          position: absolute;
          left: 50%;
          top: 50%;
          margin-left: -55px;
          margin-top: -55px;
          cursor: pointer;
          z-index: 2;
          transition: opacity 0.3s ease;
        }

        .goal-orb:hover:not(.disabled) .orb-core {
          transform: scale(1.1);
        }

        .goal-orb.disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .orb-orbit {
          position: absolute;
          width: 130px;
          height: 130px;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          animation: orbitRotate 20s linear infinite;
          animation-delay: var(--orb-delay);
        }

        .goal-orb.selected .orb-orbit {
          border-color: var(--orb-color);
          opacity: 0.5;
        }

        @keyframes orbitRotate {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }

        .orb-ring {
          position: absolute;
          width: 110px;
          height: 110px;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          border: 2px solid var(--orb-color);
          border-radius: 50%;
          opacity: 0;
          pointer-events: none;
        }

        .orb-core {
          position: relative;
          width: 110px;
          height: 110px;
          background: linear-gradient(135deg, rgba(30, 20, 50, 0.9), rgba(15, 10, 30, 0.95));
          border: 2px solid rgba(255, 255, 255, 0.15);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          overflow: hidden;
        }

        .goal-orb:hover:not(.disabled) .orb-core {
          border-color: var(--orb-color);
          box-shadow: 0 0 30px color-mix(in srgb, var(--orb-color) 40%, transparent);
        }

        .goal-orb.selected .orb-core {
          border-color: var(--orb-color);
          background: linear-gradient(135deg,
            color-mix(in srgb, var(--orb-color) 20%, rgba(30, 20, 50, 0.9)),
            rgba(15, 10, 30, 0.95)
          );
          box-shadow:
            0 0 40px color-mix(in srgb, var(--orb-color) 50%, transparent),
            inset 0 0 30px color-mix(in srgb, var(--orb-color) 20%, transparent);
        }

        .orb-glow {
          position: absolute;
          inset: -20px;
          background: radial-gradient(circle, var(--orb-color) 0%, transparent 70%);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .goal-orb.selected .orb-glow {
          opacity: 0.3;
          animation: orbGlowPulse 2s ease-in-out infinite;
        }

        @keyframes orbGlowPulse {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.1); }
        }

        .orb-icon {
          font-size: 2.25rem;
          position: relative;
          z-index: 1;
          filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.4));
        }

        .orb-label {
          position: absolute;
          top: calc(100% + 12px);
          left: 50%;
          text-align: center;
          white-space: nowrap;
          pointer-events: none;
        }

        .orb-name {
          display: block;
          font-size: 1rem;
          font-weight: 700;
          color: white;
          margin-bottom: 3px;
          text-shadow: 0 2px 8px rgba(0, 0, 0, 0.8);
        }

        .orb-desc {
          display: block;
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.6);
          text-shadow: 0 2px 8px rgba(0, 0, 0, 0.8);
        }

        .orb-badge {
          position: absolute;
          top: -8px;
          right: -8px;
          width: 24px;
          height: 24px;
          background: linear-gradient(135deg, #8b5cf6, #ec4899);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: 800;
          color: white;
          animation: badgePop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          box-shadow: 0 0 15px rgba(139, 92, 246, 0.5);
        }

        @keyframes badgePop {
          from { transform: scale(0); }
          to { transform: scale(1); }
        }

        .ignition-particles {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .ignition-particle {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 6px;
          height: 6px;
          background: var(--orb-color);
          border-radius: 50%;
          opacity: 0;
          box-shadow: 0 0 10px var(--orb-color);
        }

        .goal-orb.selected .ignition-particle {
          opacity: 0;
        }

        .goals-instruction {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
        }

        .goals-progress {
          display: flex;
          gap: 0.5rem;
        }

        .progress-star {
          font-size: 1.5rem;
          color: rgba(255, 255, 255, 0.2);
          transition: all 0.4s ease;
        }

        .progress-star.filled {
          color: #fbbf24;
          text-shadow: 0 0 20px rgba(251, 191, 36, 0.6);
          animation: starFill 0.5s ease;
        }

        @keyframes starFill {
          0% { transform: scale(1); }
          50% { transform: scale(1.4); }
          100% { transform: scale(1); }
        }

        .goals-hint {
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.5);
        }

        @media (max-width: 640px) {
          .goals-orbs-container {
            max-width: 380px;
          }

          .orb-core {
            width: 65px;
            height: 65px;
          }

          .orb-ring {
            width: 65px;
            height: 65px;
          }

          .orb-orbit {
            width: 80px;
            height: 80px;
          }

          .orb-icon {
            font-size: 1.6rem;
          }

          .orb-name {
            font-size: 0.85rem;
          }

          .orb-desc {
            font-size: 0.7rem;
          }

          .orb-label {
            top: calc(100% + 8px);
          }
        }
      `}</style>
    </div>
  );
}
