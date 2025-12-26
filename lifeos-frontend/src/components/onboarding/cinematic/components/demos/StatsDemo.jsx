/**
 * Stats & Skill Points Demo
 *
 * Interactive demo showcasing the stats system and skill point allocation.
 * Features:
 * - Core stats display with animated bars
 * - Skill point allocation preview
 * - Stat boost visualisation
 */

import React, { useState, useCallback, useEffect } from 'react';
import { animate } from 'animejs';

const CORE_STATS = [
  { id: 'vitality', name: 'Vitality', icon: '❤️', value: 45, max: 100, color: '#ef4444' },
  { id: 'focus', name: 'Focus', icon: '🎯', value: 62, max: 100, color: '#3b82f6' },
  { id: 'wisdom', name: 'Wisdom', icon: '📚', value: 38, max: 100, color: '#8b5cf6' },
  { id: 'strength', name: 'Strength', icon: '💪', value: 55, max: 100, color: '#f59e0b' },
];

export default function StatsDemo({ isActive, onInteract }) {
  const [stats, setStats] = useState(CORE_STATS);
  const [skillPoints, setSkillPoints] = useState(5);
  const [hasAnimated, setHasAnimated] = useState(false);

  // Animate bars on mount
  useEffect(() => {
    if (!isActive || hasAnimated) return;

    const bars = document.querySelectorAll('.stat-bar-fill');
    bars.forEach((bar, i) => {
      const targetWidth = stats[i].value;
      animate(bar, {
        width: ['0%', `${targetWidth}%`],
        duration: 800,
        delay: i * 100,
        ease: 'outExpo',
      });
    });

    setHasAnimated(true);
  }, [isActive, hasAnimated, stats]);

  // Handle skill point allocation
  const handleAllocate = useCallback((statId, el) => {
    if (skillPoints <= 0) return;

    onInteract?.();

    setStats(prev => prev.map(stat => {
      if (stat.id === statId && stat.value < stat.max) {
        return { ...stat, value: Math.min(stat.value + 5, stat.max) };
      }
      return stat;
    }));

    setSkillPoints(prev => prev - 1);

    // Animate the button
    if (el) {
      animate(el, {
        scale: [1, 1.3, 1],
        duration: 300,
        ease: 'outBack',
      });
    }

    // Animate the bar
    const bar = document.querySelector(`[data-stat="${statId}"] .stat-bar-fill`);
    if (bar) {
      animate(bar, {
        scale: [1, 1.02, 1],
        duration: 200,
      });
    }
  }, [skillPoints, onInteract]);

  return (
    <div className="stats-demo">
      {/* Skill Points Available */}
      <div className="skill-points-display">
        <span className="sp-label">Skill Points</span>
        <span className="sp-value">{skillPoints}</span>
        <span className="sp-hint">{skillPoints > 0 ? 'Tap + to allocate' : 'All spent!'}</span>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {stats.map((stat) => (
          <div key={stat.id} className="stat-row" data-stat={stat.id}>
            <div className="stat-info">
              <span className="stat-icon">{stat.icon}</span>
              <span className="stat-name">{stat.name}</span>
            </div>
            <div className="stat-bar-container">
              <div
                className="stat-bar-fill"
                style={{
                  background: `linear-gradient(90deg, ${stat.color}, ${stat.color}aa)`,
                  width: hasAnimated ? `${stat.value}%` : '0%',
                }}
              />
              <span className="stat-value">{stat.value}</span>
            </div>
            <button
              className={`stat-allocate ${skillPoints > 0 ? 'active' : 'disabled'}`}
              onClick={(e) => handleAllocate(stat.id, e.currentTarget)}
              disabled={skillPoints <= 0}
            >
              +
            </button>
          </div>
        ))}
      </div>

      {/* Total Power */}
      <div className="total-power">
        <span className="power-label">Total Power</span>
        <span className="power-value">
          {stats.reduce((sum, s) => sum + s.value, 0)}
        </span>
      </div>

      <style>{`
        .stats-demo {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          height: 100%;
        }

        .skill-points-display {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(139, 92, 246, 0.05));
          border: 1px solid rgba(139, 92, 246, 0.3);
          border-radius: 12px;
        }

        .sp-label {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.6);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .sp-value {
          font-size: 1.5rem;
          font-weight: 800;
          color: #a855f7;
          min-width: 30px;
          text-align: center;
        }

        .sp-hint {
          font-size: 0.65rem;
          color: rgba(255, 255, 255, 0.4);
          font-style: italic;
        }

        .stats-grid {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          flex: 1;
        }

        .stat-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.4rem 0.5rem;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 10px;
          transition: background 0.2s ease;
        }

        .stat-row:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        .stat-info {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          min-width: 85px;
        }

        .stat-icon {
          font-size: 1rem;
        }

        .stat-name {
          font-size: 0.7rem;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.8);
        }

        .stat-bar-container {
          flex: 1;
          height: 16px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          position: relative;
          overflow: hidden;
        }

        .stat-bar-fill {
          height: 100%;
          border-radius: 8px;
          transition: width 0.3s ease;
        }

        .stat-value {
          position: absolute;
          right: 6px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 0.65rem;
          font-weight: 700;
          color: white;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
        }

        .stat-allocate {
          width: 24px;
          height: 24px;
          border-radius: 6px;
          border: none;
          font-size: 1rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stat-allocate.active {
          background: linear-gradient(135deg, #a855f7, #7c3aed);
          color: white;
          box-shadow: 0 2px 8px rgba(139, 92, 246, 0.4);
        }

        .stat-allocate.active:hover {
          transform: scale(1.1);
        }

        .stat-allocate.disabled {
          background: rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.3);
          cursor: not-allowed;
        }

        .total-power {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.5rem;
          background: rgba(251, 191, 36, 0.1);
          border: 1px solid rgba(251, 191, 36, 0.2);
          border-radius: 10px;
        }

        .power-label {
          font-size: 0.7rem;
          color: rgba(255, 255, 255, 0.5);
          text-transform: uppercase;
        }

        .power-value {
          font-size: 1.25rem;
          font-weight: 800;
          background: linear-gradient(135deg, #fbbf24, #f59e0b);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>
    </div>
  );
}
