/**
 * Skills Demo
 *
 * Interactive skill constellation preview.
 * - SVG constellation with animated drawing
 * - Tap stars to see skill info
 * - Locked vs unlocked states
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { animate } from 'animejs';
import { feedback } from '../../../../../services/microInteractions';

const SKILL_STARS = [
  { id: 'focus', x: 50, y: 12, color: '#fbbf24', unlocked: true, name: 'Focus', description: 'Productivity mastery', progress: 45 },
  { id: 'logic', x: 22, y: 32, color: '#3b82f6', unlocked: true, name: 'Logic', description: 'Analytical thinking', progress: 30 },
  { id: 'creative', x: 78, y: 32, color: '#8b5cf6', unlocked: true, name: 'Creative', description: 'Innovation & ideas', progress: 60 },
  { id: 'core', x: 50, y: 50, color: '#ec4899', unlocked: true, name: 'Core', description: 'Life foundation', progress: 100 },
  { id: 'learn', x: 15, y: 58, color: '#06b6d4', unlocked: true, name: 'Learning', description: 'Knowledge growth', progress: 20 },
  { id: 'master', x: 85, y: 58, color: '#6b7280', unlocked: false, name: 'Mastery', description: 'Ultimate skill', progress: 0 },
  { id: 'hidden1', x: 28, y: 78, color: '#6b7280', unlocked: false, name: '???', description: 'Complete Learn to unlock', progress: 0 },
  { id: 'hidden2', x: 72, y: 78, color: '#6b7280', unlocked: false, name: '???', description: 'Complete Master to unlock', progress: 0 },
  { id: 'final', x: 50, y: 90, color: '#6b7280', unlocked: false, name: '???', description: 'The final skill', progress: 0 },
];

const CONNECTIONS = [
  // Outer ring
  { from: 'focus', to: 'logic' },
  { from: 'focus', to: 'creative' },
  { from: 'logic', to: 'learn' },
  { from: 'creative', to: 'master' },
  { from: 'learn', to: 'hidden1' },
  { from: 'master', to: 'hidden2' },
  { from: 'hidden1', to: 'final' },
  { from: 'hidden2', to: 'final' },
  // Inner connections to core
  { from: 'focus', to: 'core', dashed: true },
  { from: 'logic', to: 'core', dashed: true },
  { from: 'creative', to: 'core', dashed: true },
  { from: 'learn', to: 'core', dashed: true },
  { from: 'master', to: 'core', dashed: true },
];

export default function SkillsDemo({ isActive, onInteract }) {
  const [selectedStar, setSelectedStar] = useState(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  const svgRef = useRef(null);
  const linesRef = useRef([]);
  const starsRef = useRef({});

  // Get star position by ID
  const getStarById = (id) => SKILL_STARS.find((s) => s.id === id);

  // Initial animation
  useEffect(() => {
    if (!isActive || hasAnimated) return;

    const svg = svgRef.current;
    if (!svg) return;

    // Animate lines drawing in
    linesRef.current.forEach((line, index) => {
      if (!line) return;

      const length = line.getTotalLength();
      line.style.strokeDasharray = length;
      line.style.strokeDashoffset = length;

      animate(line, {
        strokeDashoffset: [length, 0],
        opacity: [0, 0.6],
        duration: 600,
        delay: index * 50,
        ease: 'outQuad',
      });
    });

    // Animate stars appearing
    Object.values(starsRef.current).forEach((star, index) => {
      if (!star) return;

      animate(star, {
        scale: [0, 1],
        opacity: [0, 1],
        duration: 400,
        delay: 600 + index * 80,
        ease: 'outBack',
      });
    });

    setHasAnimated(true);
  }, [isActive, hasAnimated]);

  // Handle star click
  const handleStarClick = useCallback((star) => {
    onInteract?.();
    feedback.buttonPress();
    setSelectedStar(selectedStar?.id === star.id ? null : star);

    // Pulse animation on clicked star
    const starEl = starsRef.current[star.id];
    if (starEl) {
      animate(starEl, {
        scale: [1, 1.3, 1],
        duration: 400,
        ease: 'outBack',
      });
    }
  }, [selectedStar, onInteract]);

  const unlockedCount = SKILL_STARS.filter((s) => s.unlocked).length;

  return (
    <div className="skills-demo">
      {/* SVG Constellation */}
      <svg
        ref={svgRef}
        viewBox="0 0 100 100"
        className="skills-svg"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Gradient definitions */}
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.6" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="1" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background dust */}
        {[...Array(15)].map((_, i) => (
          <circle
            key={`dust-${i}`}
            cx={10 + Math.random() * 80}
            cy={10 + Math.random() * 80}
            r={0.3 + Math.random() * 0.4}
            fill="white"
            opacity={0.1 + Math.random() * 0.2}
          />
        ))}

        {/* Connection lines */}
        {CONNECTIONS.map((conn, index) => {
          const from = getStarById(conn.from);
          const to = getStarById(conn.to);
          if (!from || !to) return null;

          return (
            <line
              key={`${conn.from}-${conn.to}`}
              ref={(el) => (linesRef.current[index] = el)}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke="url(#lineGradient)"
              strokeWidth={conn.dashed ? 0.5 : 0.8}
              strokeDasharray={conn.dashed ? '2,2' : undefined}
              opacity={0}
            />
          );
        })}

        {/* Stars */}
        {SKILL_STARS.map((star) => (
          <g
            key={star.id}
            ref={(el) => (starsRef.current[star.id] = el)}
            style={{ cursor: 'pointer', opacity: 0, transformOrigin: `${star.x}px ${star.y}px` }}
            onClick={() => handleStarClick(star)}
          >
            {/* Glow for unlocked stars */}
            {star.unlocked && (
              <>
                <circle
                  cx={star.x}
                  cy={star.y}
                  r={8}
                  fill={star.color}
                  opacity={0.15}
                >
                  <animate
                    attributeName="opacity"
                    values="0.1;0.25;0.1"
                    dur="2s"
                    repeatCount="indefinite"
                  />
                </circle>
                <circle
                  cx={star.x}
                  cy={star.y}
                  r={4.5}
                  fill={star.color}
                  opacity={0.3}
                />
              </>
            )}

            {/* Main star */}
            <circle
              cx={star.x}
              cy={star.y}
              r={star.unlocked ? 3 : 2.5}
              fill={star.unlocked ? star.color : 'rgba(255,255,255,0.2)'}
              filter={star.unlocked ? 'url(#glow)' : undefined}
            />

            {/* Locked indicator */}
            {!star.unlocked && (
              <text
                x={star.x}
                y={star.y + 1}
                textAnchor="middle"
                fontSize="3"
                fill="rgba(255,255,255,0.4)"
              >
                ?
              </text>
            )}

            {/* Selection ring */}
            {selectedStar?.id === star.id && (
              <circle
                cx={star.x}
                cy={star.y}
                r={6}
                fill="none"
                stroke={star.color}
                strokeWidth="0.5"
                opacity={0.8}
              >
                <animate
                  attributeName="r"
                  values="6;8;6"
                  dur="1s"
                  repeatCount="indefinite"
                />
              </circle>
            )}
          </g>
        ))}
      </svg>

      {/* Info panel */}
      {selectedStar ? (
        <div className="skills-info">
          <div className="skills-info-header">
            <div
              className="skills-info-dot"
              style={{ background: selectedStar.color }}
            />
            <span className="skills-info-name">{selectedStar.name}</span>
          </div>
          <p className="skills-info-desc">{selectedStar.description}</p>
          {selectedStar.unlocked && (
            <div className="skills-info-progress">
              <div className="skills-info-progress-bar">
                <div
                  className="skills-info-progress-fill"
                  style={{
                    width: `${selectedStar.progress}%`,
                    background: selectedStar.color,
                  }}
                />
              </div>
              <span>{selectedStar.progress}%</span>
            </div>
          )}
        </div>
      ) : (
        <div className="skills-info placeholder">
          <p>Tap a star to see skill info</p>
        </div>
      )}

      {/* Stats */}
      <div className="skills-stats">
        Unlocked: {unlockedCount}/{SKILL_STARS.length} skills
      </div>

      <style>{`
        .skills-demo {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
          height: 100%;
        }

        .skills-svg {
          width: 100%;
          max-width: 260px;
          height: auto;
          aspect-ratio: 1;
        }

        .skills-info {
          width: 100%;
          max-width: 280px;
          padding: 0.75rem 1rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          min-height: 60px;
        }

        .skills-info.placeholder {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .skills-info.placeholder p {
          color: rgba(255, 255, 255, 0.4);
          font-size: 0.85rem;
          font-style: italic;
        }

        .skills-info-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.25rem;
        }

        .skills-info-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }

        .skills-info-name {
          font-weight: 700;
          color: white;
          font-size: 1rem;
        }

        .skills-info-desc {
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.8rem;
          margin-bottom: 0.5rem;
        }

        .skills-info-progress {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .skills-info-progress-bar {
          flex: 1;
          height: 4px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 2px;
          overflow: hidden;
        }

        .skills-info-progress-fill {
          height: 100%;
          border-radius: 2px;
          transition: width 0.3s ease;
        }

        .skills-info-progress span {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.6);
          min-width: 30px;
        }

        .skills-stats {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.5);
        }
      `}</style>
    </div>
  );
}
