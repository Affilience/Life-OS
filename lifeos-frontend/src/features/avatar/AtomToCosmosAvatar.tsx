/**
 * Atom → Cosmos Avatar Component
 * Evolves from single atom to full galaxy based on user level
 * Uses CSS/SVG fallback until Rive file is available
 */

import React, { useEffect, useRef, useCallback } from 'react';
import type { AtomToCosmosAvatarProps } from './types';
import {
  getLevelStage,
  getStageIndex,
  computeXpPercent,
  computeStreakIntensity,
  mapSeasonToVariant,
  mapMoodToVariant
} from './avatar.state';
import { useAvatarEvents } from './avatar.events';
import { emitCelebration } from '../effects/useCelebrationBus';

export function AtomToCosmosAvatar({
  level,
  xp,
  xpToNext,
  streakDays = 0,
  season = 'discipline',
  mood = 'calm',
  width = 520,
  height = 320,
  onOpenCoach,
  reducedMotion = false
}: AtomToCosmosAvatarProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stage = getLevelStage(level);
  const stageIndex = getStageIndex(stage);
  const xpPercent = computeXpPercent(xp, xpToNext);
  const streakIntensity = computeStreakIntensity(streakDays);

  // Season colors
  const seasonColors = {
    discipline: '#7A5CFF',
    ambition: '#F2C94C',
    focus: '#5CE1E6',
    evolution: '#D064FF',
    power: '#4F9DFF'
  };

  const primaryColor = seasonColors[season];

  // Listen to avatar events and forward to celebrations
  useAvatarEvents({
    onXpClaimed: (amount) => {
      emitCelebration({ type: 'xpBurst', amount });
      // Trigger visual pulse on avatar
      if (!reducedMotion && containerRef.current) {
        containerRef.current.classList.add('avatar-pulse');
        setTimeout(() => {
          containerRef.current?.classList.remove('avatar-pulse');
        }, 600);
      }
    },
    onLevelUp: (newLevel) => {
      emitCelebration({ type: 'levelUp', level: newLevel });
      // Trigger level up animation
      if (!reducedMotion && containerRef.current) {
        containerRef.current.classList.add('avatar-levelup');
        setTimeout(() => {
          containerRef.current?.classList.remove('avatar-levelup');
        }, 1600);
      }
    },
    onStreakMilestone: (days) => {
      emitCelebration({ type: 'streakMilestone', days });
    }
  });

  // Keyboard handler
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (onOpenCoach && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onOpenCoach();
    }
  }, [onOpenCoach]);

  return (
    <div
      ref={containerRef}
      className={`atom-cosmos-avatar ${reducedMotion ? 'reduced-motion' : ''}`}
      style={{
        width,
        height,
        position: 'relative',
        cursor: onOpenCoach ? 'pointer' : 'default',
        background: 'radial-gradient(circle at center, #0f1729 0%, #0a0e1a 100%)',
        borderRadius: '16px',
        overflow: 'hidden',
        border: `1px solid ${primaryColor}20`
      }}
      onClick={onOpenCoach}
      onKeyDown={handleKeyDown}
      role={onOpenCoach ? 'button' : undefined}
      tabIndex={onOpenCoach ? 0 : undefined}
      aria-label={onOpenCoach ? `Open AI Coach - ${stage} stage, Level ${level}` : undefined}
    >
      {/* Streak aura glow */}
      <div
        className="aura-glow"
        style={{
          position: 'absolute',
          inset: 0,
          opacity: streakIntensity * 0.6,
          background: `radial-gradient(circle at center, ${primaryColor}40 0%, transparent 70%)`,
          pointerEvents: 'none',
          transition: 'opacity 0.8s ease'
        }}
      />

      {/* SVG Avatar */}
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 520 320"
        style={{
          position: 'absolute',
          inset: 0
        }}
      >
        {/* Stage 1: Singular Atom */}
        {stageIndex >= 0 && (
          <g opacity={stageIndex === 0 ? 1 : 0.3}>
            <circle
              cx="260"
              cy="160"
              r={8 + xpPercent * 4}
              fill={primaryColor}
              opacity="0.9"
            >
              {!reducedMotion && (
                <animate
                  attributeName="r"
                  values="8;12;8"
                  dur="3s"
                  repeatCount="indefinite"
                />
              )}
            </circle>
            <circle
              cx="260"
              cy="160"
              r={16 + xpPercent * 8}
              fill="none"
              stroke={primaryColor}
              strokeWidth="1"
              opacity="0.4"
            />
          </g>
        )}

        {/* Stage 2: Atom with Orbiting Electrons */}
        {stageIndex >= 1 && (
          <g opacity={stageIndex === 1 ? 1 : 0.3}>
            <circle
              cx="260"
              cy="160"
              r="12"
              fill={primaryColor}
              opacity="0.9"
            />
            <ellipse
              cx="260"
              cy="160"
              rx="40"
              ry="25"
              fill="none"
              stroke={primaryColor}
              strokeWidth="0.5"
              opacity="0.3"
            />
            <circle
              r="4"
              fill={primaryColor}
              opacity="0.8"
            >
              {!reducedMotion && (
                <animateMotion
                  dur="4s"
                  repeatCount="indefinite"
                  path="M260,135 a40,25 0 1,0 0,50 a40,25 0 1,0 0,-50"
                />
              )}
            </circle>
          </g>
        )}

        {/* Stage 3: Molecular Cluster */}
        {stageIndex >= 2 && (
          <g opacity={stageIndex === 2 ? 1 : 0.3}>
            {[...Array(5)].map((_, i) => {
              const angle = (i / 5) * Math.PI * 2;
              const x = 260 + Math.cos(angle) * 30;
              const y = 160 + Math.sin(angle) * 30;
              return (
                <g key={i}>
                  <line
                    x1="260"
                    y1="160"
                    x2={x}
                    y2={y}
                    stroke={primaryColor}
                    strokeWidth="0.5"
                    opacity="0.3"
                  />
                  <circle
                    cx={x}
                    cy={y}
                    r="6"
                    fill={primaryColor}
                    opacity="0.7"
                  />
                </g>
              );
            })}
            <circle
              cx="260"
              cy="160"
              r="10"
              fill={primaryColor}
              opacity="0.9"
            />
          </g>
        )}

        {/* Stage 4: Proto-Star */}
        {stageIndex >= 3 && (
          <g opacity={stageIndex === 3 ? 1 : 0.3}>
            <circle
              cx="260"
              cy="160"
              r="20"
              fill={primaryColor}
              opacity="0.9"
            >
              {!reducedMotion && (
                <animate
                  attributeName="opacity"
                  values="0.7;1;0.7"
                  dur="2s"
                  repeatCount="indefinite"
                />
              )}
            </circle>
            <ellipse
              cx="260"
              cy="160"
              rx="60"
              ry="8"
              fill={primaryColor}
              opacity="0.2"
            />
            {/* Rays */}
            {[...Array(8)].map((_, i) => {
              const angle = (i / 8) * Math.PI * 2;
              return (
                <line
                  key={i}
                  x1="260"
                  y1="160"
                  x2={260 + Math.cos(angle) * 40}
                  y2={160 + Math.sin(angle) * 40}
                  stroke={primaryColor}
                  strokeWidth="1"
                  opacity="0.3"
                />
              );
            })}
          </g>
        )}

        {/* Stage 5: Solar System */}
        {stageIndex >= 4 && (
          <g opacity={stageIndex === 4 ? 1 : 0.3}>
            <circle
              cx="260"
              cy="160"
              r="16"
              fill={primaryColor}
              opacity="1"
            />
            {/* Planets */}
            {[
              { orbit: 50, size: 5, color: '#5CE1E6', dur: '8s' },
              { orbit: 70, size: 7, color: '#D064FF', dur: '12s' },
              { orbit: 95, size: 4, color: '#F2C94C', dur: '16s' }
            ].map((planet, i) => (
              <g key={i}>
                <circle
                  cx="260"
                  cy="160"
                  r={planet.orbit}
                  fill="none"
                  stroke={primaryColor}
                  strokeWidth="0.3"
                  opacity="0.2"
                />
                <circle
                  r={planet.size}
                  fill={planet.color}
                  opacity="0.8"
                >
                  {!reducedMotion && (
                    <animateMotion
                      dur={planet.dur}
                      repeatCount="indefinite"
                      path={`M${260},${160 - planet.orbit} a${planet.orbit},${planet.orbit} 0 1,1 0,${planet.orbit * 2} a${planet.orbit},${planet.orbit} 0 1,1 0,-${planet.orbit * 2}`}
                    />
                  )}
                </circle>
              </g>
            ))}
          </g>
        )}

        {/* Stage 6: Galaxy */}
        {stageIndex >= 5 && (
          <g opacity={stageIndex === 5 ? 1 : 0.5}>
            <circle
              cx="260"
              cy="160"
              r="24"
              fill={primaryColor}
              opacity="1"
            />
            {/* Spiral arms */}
            {[0, 120, 240].map((offset, i) => {
              const points = [...Array(20)].map((_, j) => {
                const angle = offset + j * 15;
                const radius = 30 + j * 4;
                const x = 260 + Math.cos((angle * Math.PI) / 180) * radius;
                const y = 160 + Math.sin((angle * Math.PI) / 180) * radius;
                return `${x},${y}`;
              }).join(' ');

              return (
                <polyline
                  key={i}
                  points={points}
                  fill="none"
                  stroke={primaryColor}
                  strokeWidth="2"
                  opacity="0.4"
                  strokeLinecap="round"
                />
              );
            })}
            {/* Stars in galaxy */}
            {[...Array(30)].map((_, i) => {
              const angle = Math.random() * Math.PI * 2;
              const radius = 40 + Math.random() * 80;
              const x = 260 + Math.cos(angle) * radius;
              const y = 160 + Math.sin(angle) * radius;
              return (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r={Math.random() * 1.5 + 0.5}
                  fill="#ffffff"
                  opacity={Math.random() * 0.6 + 0.2}
                />
              );
            })}
          </g>
        )}
      </svg>

      {/* Stage label */}
      <div
        style={{
          position: 'absolute',
          bottom: 12,
          left: 12,
          fontSize: 11,
          fontWeight: 500,
          color: '#9BA2AD',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          pointerEvents: 'none'
        }}
      >
        {stage} • Lv {level}
      </div>

      <style jsx>{`
        .atom-cosmos-avatar {
          transition: all 0.3s ease;
        }

        .atom-cosmos-avatar:hover {
          transform: scale(1.02);
          box-shadow: 0 8px 32px ${primaryColor}30;
        }

        .atom-cosmos-avatar:focus {
          outline: 2px solid ${primaryColor};
          outline-offset: 2px;
        }

        .avatar-pulse {
          animation: pulse 0.6s ease-out;
        }

        .avatar-levelup {
          animation: levelup 1.6s ease-out;
        }

        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }

        @keyframes levelup {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }

        .reduced-motion * {
          animation: none !important;
        }
      `}</style>
    </div>
  );
}
