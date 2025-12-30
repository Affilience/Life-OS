/**
 * ImmersiveGoals - Constellation Builder
 *
 * Build your personal constellation by selecting life focus areas.
 * Uses GSAP timeline pattern with scroll-driven animations.
 *
 * BUILD PHASE (0-0.35):
 * - Title and subtitle emerge
 * - Goal orbs bloom from center
 *
 * HOLD PHASE (0.35-0.65):
 * - Scroll locked while user selects goals
 *
 * DISMANTLE PHASE (0.65-1.0):
 * - Constellation solidifies and exits
 */

import React, { useEffect, useRef, useState, useCallback, useMemo, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { feedback } from '../../../../services/microInteractions';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// Base container size (matches CSS default)
const BASE_CONTAINER_SIZE = 450;

const GOALS = [
  { id: 'productivity', icon: '⚡', label: 'Productivity', description: 'Master your time', color: '#fbbf24' },
  { id: 'health', icon: '💪', label: 'Health', description: 'Peak performance', color: '#22c55e' },
  { id: 'learning', icon: '📚', label: 'Learning', description: 'Grow your mind', color: '#3b82f6' },
  { id: 'financial', icon: '💰', label: 'Finances', description: 'Build wealth', color: '#f59e0b' },
  { id: 'habits', icon: '🎯', label: 'Habits', description: 'Shape your days', color: '#ec4899' },
  { id: 'mindfulness', icon: '🧘', label: 'Mindfulness', description: 'Inner peace', color: '#8b5cf6' },
];

// Calculate positions in a circle
const GOAL_POSITIONS = GOALS.map((_, i) => {
  const angle = (i * 60 - 90) * (Math.PI / 180);
  return {
    x: Math.cos(angle),
    y: Math.sin(angle),
  };
});

const CONTAINER_SIZE = 450;
const ORB_RADIUS = 160;
const CENTER = CONTAINER_SIZE / 2;

export default function ImmersiveGoals({
  sectionId,
  onComplete,
  onLockScroll,
  onSectionEnter,
  selectedGoals = [],
  setSelectedGoals,
}) {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const orbsContainerRef = useRef(null);
  const orbRefs = useRef([]);
  const instructionRef = useRef(null);
  const [hasCompleted, setHasCompleted] = useState(false);
  const [rotation, setRotation] = useState(0);
  const lastWheelTime = useRef(0);
  const [containerSize, setContainerSize] = useState(BASE_CONTAINER_SIZE);

  const maxGoals = 3;
  const canSelectMore = selectedGoals.length < maxGoals;

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

  // Track container size for responsive SVG line positioning
  useLayoutEffect(() => {
    if (!orbsContainerRef.current) return;

    const updateSize = () => {
      const rect = orbsContainerRef.current?.getBoundingClientRect();
      if (rect) {
        setContainerSize(rect.width);
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

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
                { opacity: 0, y: 60, scale: 0.9, filter: 'blur(8px)' },
                { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: 0.6, ease: 'power3.out' },
                0
              );
            }

            if (subtitleRef.current) {
              entranceTl.fromTo(subtitleRef.current,
                { opacity: 0, y: 30 },
                { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' },
                0.2
              );
            }

            if (orbsContainerRef.current) {
              entranceTl.fromTo(orbsContainerRef.current,
                { opacity: 0, scale: 0.8 },
                { opacity: 1, scale: 1, duration: 0.5, ease: 'power2.out' },
                0.3
              );
            }

            // Individual orbs bloom from center
            orbRefs.current.forEach((orb, i) => {
              if (!orb) return;
              const pos = GOAL_POSITIONS[i];
              const offsetX = pos.x * ORB_RADIUS;
              const offsetY = -pos.y * ORB_RADIUS;

              entranceTl.fromTo(orb,
                { opacity: 0, x: 0, y: 0, scale: 0.3 },
                { opacity: 1, x: offsetX, y: offsetY, scale: 1, duration: 0.5, ease: 'back.out(1.4)' },
                0.4 + (i * 0.08)
              );
            });

            if (instructionRef.current) {
              entranceTl.fromTo(instructionRef.current,
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' },
                0.8
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
          if (!entry.isIntersecting && entry.boundingClientRect.top < 0 && !hasExited && hasCompleted) {
            hasExited = true;

            // Play exit animations
            const exitTl = gsap.timeline();

            if (instructionRef.current) {
              exitTl.to(instructionRef.current, { opacity: 0, y: -30, duration: 0.3 }, 0);
            }

            orbRefs.current.forEach((orb, i) => {
              if (!orb) return;
              const pos = GOAL_POSITIONS[i];
              const exitX = pos.x * ORB_RADIUS * 2.5;
              const exitY = -pos.y * ORB_RADIUS * 2.5;
              exitTl.to(orb, { opacity: 0, x: exitX, y: exitY, scale: 0.4, duration: 0.3 }, 0.05 + (i * 0.03));
            });

            if (orbsContainerRef.current) {
              exitTl.to(orbsContainerRef.current, { opacity: 0, scale: 0.6, duration: 0.3 }, 0.15);
            }

            if (subtitleRef.current) {
              exitTl.to(subtitleRef.current, { opacity: 0, y: -60, duration: 0.3 }, 0.2);
            }

            if (titleRef.current) {
              exitTl.to(titleRef.current, { opacity: 0, y: -100, scale: 0.8, filter: 'blur(8px)', duration: 0.35 }, 0.25);
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

            if (orbsContainerRef.current) {
              restoreTl.to(orbsContainerRef.current, { opacity: 1, scale: 1, duration: 0.35 }, 0.15);
            }

            orbRefs.current.forEach((orb, i) => {
              if (!orb) return;
              const pos = GOAL_POSITIONS[i];
              const offsetX = pos.x * ORB_RADIUS;
              const offsetY = -pos.y * ORB_RADIUS;
              restoreTl.to(orb, { opacity: 1, x: offsetX, y: offsetY, scale: selectedGoals.includes(GOALS[i].id) ? 1.15 : 1, duration: 0.35 }, 0.2 + (i * 0.03));
            });

            if (instructionRef.current) {
              restoreTl.to(instructionRef.current, { opacity: 1, y: 0, duration: 0.3 }, 0.4);
            }
          }
        });
      },
      { threshold: 0.1 }
    );

    exitObserver.observe(section);

    return () => exitObserver.disconnect();
  }, [hasCompleted, selectedGoals]);

  // Handle wheel for rotation when locked
  useEffect(() => {
    const handleWheel = (e) => {
      if (hasCompleted) return;

      e.preventDefault();
      const now = Date.now();
      if (now - lastWheelTime.current < 16) return;
      lastWheelTime.current = now;

      const delta = e.deltaY > 0 ? 2 : -2;
      setRotation(prev => prev + delta);
    };

    // Only add listener when we might need rotation
    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [hasCompleted]);

  // Handle goal selection
  const handleGoalSelect = useCallback((goalId, element) => {
    const isSelected = selectedGoals.includes(goalId);

    if (isSelected) {
      setSelectedGoals(selectedGoals.filter(id => id !== goalId));
      feedback.buttonPress();

      gsap.to(element, {
        scale: 1,
        duration: 0.3,
        ease: 'back.out(1.7)',
      });
    } else if (canSelectMore) {
      setSelectedGoals([...selectedGoals, goalId]);
      feedback.taskComplete();

      gsap.to(element, {
        scale: 1.15,
        duration: 0.4,
        ease: 'back.out(1.7)',
      });

      // Check completion
      if (selectedGoals.length + 1 >= maxGoals) {
        setHasCompleted(true);
        setTimeout(() => {
          onLockScrollRef.current?.(false);
          setTimeout(() => onCompleteRef.current?.(), 500);
        }, 800);
      }
    }
  }, [selectedGoals, setSelectedGoals, canSelectMore, maxGoals]);

  // Calculate scaled ORB_RADIUS for SVG lines to match GSAP orb positions
  // The SVG scales with container, but GSAP positions are absolute pixels
  // So we need to compensate by scaling up the SVG coordinates
  const svgOrbRadius = useMemo(() => {
    const scaleFactor = BASE_CONTAINER_SIZE / containerSize;
    return ORB_RADIUS * scaleFactor;
  }, [containerSize]);

  // Generate constellation lines
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

    if (selectedGoals.length === 3) {
      lines.push({
        start: selectedPositions[2],
        end: selectedPositions[0],
        key: `${selectedGoals[2]}-${selectedGoals[0]}`,
      });
    }

    return lines;
  }, [selectedGoals]);

  return (
    <section
      ref={sectionRef}
      className="immersive-section relative min-h-screen overflow-hidden"
    >
      <div className="goals-content">
        {/* Title */}
        <h2 ref={titleRef} className="goals-title" style={{ opacity: 0 }}>
          Build Your <span className="gradient-text">Constellation</span>
        </h2>

        {/* Subtitle */}
        <p ref={subtitleRef} className="goals-subtitle" style={{ opacity: 0 }}>
          Choose {maxGoals} stars to guide your journey
        </p>

        {/* Orbs container */}
        <div
          ref={orbsContainerRef}
          className="goals-orbs-container"
          style={{
            opacity: 0,
            transform: `rotate(${rotation}deg)`,
          }}
        >
          {/* SVG Constellation Lines */}
          <svg className="constellation-svg" viewBox={`0 0 ${CONTAINER_SIZE} ${CONTAINER_SIZE}`}>
            <defs>
              <linearGradient id="goalEnergyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="50%" stopColor="#ec4899" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
              <filter id="goalGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {constellationLines.map(({ key, start, end }) => (
              <g key={key}>
                <line
                  x1={CENTER + start.x * svgOrbRadius}
                  y1={CENTER - start.y * svgOrbRadius}
                  x2={CENTER + end.x * svgOrbRadius}
                  y2={CENTER - end.y * svgOrbRadius}
                  stroke="url(#goalEnergyGradient)"
                  strokeWidth="6"
                  strokeLinecap="round"
                  opacity="0.3"
                  filter="url(#goalGlow)"
                />
                <line
                  x1={CENTER + start.x * svgOrbRadius}
                  y1={CENTER - start.y * svgOrbRadius}
                  x2={CENTER + end.x * svgOrbRadius}
                  y2={CENTER - end.y * svgOrbRadius}
                  stroke="url(#goalEnergyGradient)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  className="energy-line"
                />
              </g>
            ))}
          </svg>

          {/* Goal Orbs */}
          {GOALS.map((goal, index) => {
            const isSelected = selectedGoals.includes(goal.id);
            const isDisabled = !canSelectMore && !isSelected;
            const selectionNumber = selectedGoals.indexOf(goal.id) + 1;

            return (
              <div
                key={goal.id}
                ref={el => orbRefs.current[index] = el}
                className={`goal-orb ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
                style={{
                  '--orb-color': goal.color,
                  opacity: 0,
                }}
                onClick={(e) => !isDisabled && handleGoalSelect(goal.id, e.currentTarget)}
              >
                {/* Orbital ring */}
                <div className="orb-orbit" />

                {/* Main orb */}
                <div className="orb-core">
                  <div className="orb-glow" />
                  <div className="orb-icon">{goal.icon}</div>
                </div>

                {/* Label */}
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
        <div ref={instructionRef} className="goals-instruction" style={{ opacity: 0 }}>
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
              `${maxGoals - selectedGoals.length} more to complete`}
            {selectedGoals.length >= maxGoals && '✨ Your constellation is complete!'}
          </span>
        </div>
      </div>

      <style>{`
        .goals-content {
          position: relative;
          width: 100%;
          height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
        }

        .goals-title {
          font-size: clamp(1.75rem, 5vw, 2.5rem);
          font-weight: 700;
          color: white;
          text-align: center;
          margin-bottom: 0.5rem;
        }

        .gradient-text {
          background: linear-gradient(135deg, #a855f7 0%, #ec4899 50%, #f59e0b 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .goals-subtitle {
          font-size: 1rem;
          color: rgba(255, 255, 255, 0.5);
          text-align: center;
          margin-bottom: 1.5rem;
        }

        .goals-orbs-container {
          position: relative;
          width: ${CONTAINER_SIZE}px;
          height: ${CONTAINER_SIZE}px;
          transition: transform 0.15s ease-out;
        }

        .constellation-svg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }

        .energy-line {
          animation: lineGlow 2s ease-in-out infinite;
        }

        @keyframes lineGlow {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 1; }
        }

        .goal-orb {
          position: absolute;
          left: 50%;
          top: 50%;
          margin-left: -50px;
          margin-top: -50px;
          cursor: pointer;
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
          width: 120px;
          height: 120px;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          animation: orbitSpin 20s linear infinite;
        }

        .goal-orb.selected .orb-orbit {
          border-color: var(--orb-color);
          opacity: 0.5;
        }

        @keyframes orbitSpin {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }

        .orb-core {
          position: relative;
          width: 100px;
          height: 100px;
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
          inset: -15px;
          background: radial-gradient(circle, var(--orb-color) 0%, transparent 70%);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .goal-orb.selected .orb-glow {
          opacity: 0.3;
          animation: glowPulse 2s ease-in-out infinite;
        }

        @keyframes glowPulse {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.1); }
        }

        .orb-icon {
          font-size: 2rem;
          position: relative;
          z-index: 1;
          filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.3));
        }

        .orb-label {
          position: absolute;
          top: calc(100% + 10px);
          left: 50%;
          text-align: center;
          white-space: nowrap;
        }

        .orb-name {
          display: block;
          font-size: 0.9rem;
          font-weight: 700;
          color: white;
          margin-bottom: 2px;
          text-shadow: 0 2px 8px rgba(0, 0, 0, 0.8);
        }

        .orb-desc {
          display: block;
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.5);
          text-shadow: 0 2px 8px rgba(0, 0, 0, 0.8);
        }

        .orb-badge {
          position: absolute;
          top: -5px;
          right: -5px;
          width: 22px;
          height: 22px;
          background: linear-gradient(135deg, #8b5cf6, #ec4899);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.7rem;
          font-weight: 800;
          color: white;
          animation: badgePop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          box-shadow: 0 0 12px rgba(139, 92, 246, 0.5);
        }

        @keyframes badgePop {
          from { transform: scale(0); }
          to { transform: scale(1); }
        }

        .goals-instruction {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
          margin-top: 1.5rem;
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
          text-shadow: 0 0 15px rgba(251, 191, 36, 0.6);
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
          .goals-content {
            padding: 1rem;
            padding-top: 4rem;
            justify-content: center;
            padding-bottom: 6rem;
          }

          .goals-title {
            font-size: clamp(1.5rem, 7vw, 2rem);
            margin-bottom: 0.5rem;
          }

          .goals-subtitle {
            font-size: 0.85rem;
            margin-bottom: 1.5rem;
          }

          .goals-orbs-container {
            width: min(280px, 75vw);
            height: min(280px, 75vw);
            margin: 0 auto;
          }

          .orb-core {
            width: 55px;
            height: 55px;
          }

          .orb-orbit {
            width: 70px;
            height: 70px;
          }

          .orb-icon {
            font-size: 1.2rem;
          }

          .orb-name {
            font-size: 0.7rem;
          }

          .orb-desc {
            font-size: 0.55rem;
          }

          .goal-orb {
            margin-left: -27.5px;
            margin-top: -27.5px;
          }

          .goals-instruction {
            margin-top: 2rem;
          }

          .progress-star {
            font-size: 1.25rem;
          }

          .goals-hint {
            font-size: 0.75rem;
          }
        }

        @media (max-width: 380px) {
          .goals-content {
            padding: 0.75rem;
            padding-top: 3.5rem;
            padding-bottom: 5rem;
          }

          .goals-title {
            font-size: 1.25rem;
          }

          .goals-subtitle {
            font-size: 0.8rem;
            margin-bottom: 1rem;
          }

          .goals-orbs-container {
            width: min(240px, 70vw);
            height: min(240px, 70vw);
          }

          .orb-core {
            width: 45px;
            height: 45px;
          }

          .orb-orbit {
            width: 58px;
            height: 58px;
          }

          .orb-icon {
            font-size: 1rem;
          }

          .orb-name {
            font-size: 0.65rem;
          }

          .orb-desc {
            display: none;
          }

          .goal-orb {
            margin-left: -22.5px;
            margin-top: -22.5px;
          }

          .goals-instruction {
            margin-top: 1.5rem;
          }

          .progress-star {
            font-size: 1rem;
          }

          .goals-hint {
            font-size: 0.7rem;
          }
        }
      `}</style>
    </section>
  );
}
