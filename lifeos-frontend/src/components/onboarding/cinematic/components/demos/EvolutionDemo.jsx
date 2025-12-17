/**
 * Evolution Demo
 *
 * Interactive avatar evolution preview.
 * - 5 evolution stages displayed
 * - Hover/tap to preview future stages
 * - Particle trail animation
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { animate, stagger } from 'animejs';
import { feedback } from '../../../../../services/microInteractions';

const EVOLUTION_STAGES = [
  { level: 1, name: 'Dreamer', sprite: 'stage_01_dreamer', color: '#8b5cf6' },
  { level: 10, name: 'Apprentice', sprite: 'stage_10_apprentice', color: '#3b82f6' },
  { level: 20, name: 'Guardian', sprite: 'stage_20_guardian', color: '#10b981' },
  { level: 30, name: 'Champion', sprite: 'stage_30_champion', color: '#f59e0b' },
  { level: 40, name: 'Master', sprite: 'stage_40_avatar_of_mastery', color: '#ec4899' },
];

export default function EvolutionDemo({ isActive, onInteract }) {
  const [activeStage, setActiveStage] = useState(0);
  const [previewStage, setPreviewStage] = useState(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  const containerRef = useRef(null);
  const stagesRef = useRef([]);

  // Initial animation
  useEffect(() => {
    if (!isActive || hasAnimated) return;

    const container = containerRef.current;
    if (!container) return;

    // Animate title
    animate(container.querySelector('.evolution-title'), {
      opacity: [0, 1],
      y: [20, 0],
      duration: 600,
      ease: 'outExpo',
    });

    // Animate stages with stagger
    animate(stagesRef.current, {
      opacity: [0, 1],
      y: [30, 0],
      scale: [0.8, 1],
      duration: 600,
      delay: stagger(100, { start: 200 }),
      ease: 'outBack',
    });

    // Animate progress bar
    setTimeout(() => {
      animate(container.querySelector('.evolution-progress-fill'), {
        width: '2.5%',
        duration: 1000,
        ease: 'outExpo',
      });
    }, 800);

    // Animate connecting line
    animate(container.querySelectorAll('.evolution-connector'), {
      scaleX: [0, 1],
      opacity: [0, 1],
      duration: 400,
      delay: stagger(80, { start: 400 }),
      ease: 'outExpo',
    });

    setHasAnimated(true);
  }, [isActive, hasAnimated]);

  // Handle stage preview
  const handleStageHover = useCallback((index) => {
    if (index === activeStage) return;

    onInteract?.();
    setPreviewStage(index);
    feedback.buttonPress();

    // Animate the previewed stage
    const stage = stagesRef.current[index];
    if (stage) {
      animate(stage, {
        scale: [1, 1.15],
        duration: 300,
        ease: 'outBack',
      });
    }

    // Create particle trail effect (CSS handles this)
  }, [activeStage, onInteract]);

  const handleStageLeave = useCallback((index) => {
    if (index === activeStage) return;

    setPreviewStage(null);

    const stage = stagesRef.current[index];
    if (stage) {
      animate(stage, {
        scale: 1,
        duration: 200,
        ease: 'outQuad',
      });
    }
  }, [activeStage]);

  const displayStage = previewStage !== null ? previewStage : activeStage;
  const currentInfo = EVOLUTION_STAGES[displayStage];

  return (
    <div ref={containerRef} className="evolution-demo">
      {/* Title */}
      <h4 className="evolution-title" style={{ opacity: 0 }}>
        Your journey from Dreamer to Master
      </h4>

      {/* Evolution stages */}
      <div className="evolution-stages">
        {EVOLUTION_STAGES.map((stage, index) => {
          const isActive = index === activeStage;
          const isPreviewing = index === previewStage;
          const isFuture = index > activeStage;

          return (
            <React.Fragment key={stage.level}>
              <div
                ref={(el) => (stagesRef.current[index] = el)}
                className={`evolution-stage ${isActive ? 'active' : ''} ${isPreviewing ? 'preview' : ''} ${isFuture ? 'future' : ''}`}
                style={{ opacity: 0 }}
                onMouseEnter={() => handleStageHover(index)}
                onMouseLeave={() => handleStageLeave(index)}
                onClick={() => handleStageHover(index)}
              >
                {/* Glow effect */}
                <div
                  className="evolution-glow"
                  style={{ background: `radial-gradient(circle, ${stage.color}40 0%, transparent 70%)` }}
                />

                {/* Avatar sprite */}
                <div className="evolution-sprite">
                  <img
                    src={`/assets/avatar/base-evolution/hero_${stage.sprite}.png`}
                    alt={stage.name}
                    style={{ imageRendering: 'pixelated' }}
                    onError={(e) => {
                      e.target.src = '/assets/avatar/evolution/hero_v3_stage_1_dreamer.png';
                    }}
                  />
                </div>

                {/* Level badge */}
                <div className="evolution-level" style={{ borderColor: stage.color }}>
                  Lv {stage.level}
                </div>

                {/* Active indicator */}
                {isActive && <div className="evolution-active-dot" />}
              </div>

              {/* Connector line */}
              {index < EVOLUTION_STAGES.length - 1 && (
                <div
                  className="evolution-connector"
                  style={{
                    background: `linear-gradient(90deg, ${stage.color}, ${EVOLUTION_STAGES[index + 1].color})`,
                    opacity: 0,
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Stage info */}
      <div className="evolution-info">
        <div className="evolution-name" style={{ color: currentInfo.color }}>
          {currentInfo.name}
        </div>
        <div className="evolution-level-text">
          {previewStage !== null ? 'Preview' : 'Current'} Stage
        </div>
      </div>

      {/* Progress bar */}
      <div className="evolution-progress">
        <div className="evolution-progress-bar">
          <div className="evolution-progress-fill" style={{ width: '0%' }} />
        </div>
        <div className="evolution-progress-text">
          Level 1 of 40 (2.5%)
        </div>
      </div>

      {/* Hint */}
      <p className="evolution-hint">Tap future stages to preview</p>

      <style>{`
        .evolution-demo {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          padding: 0.5rem 0;
        }

        .evolution-title {
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.6);
          margin-bottom: 0.5rem;
          text-align: center;
        }

        .evolution-stages {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0;
          width: 100%;
          max-width: 400px;
        }

        .evolution-stage {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 0.5rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .evolution-stage.future {
          opacity: 0.4;
          filter: grayscale(0.5);
        }

        .evolution-stage.future:hover,
        .evolution-stage.preview {
          opacity: 1;
          filter: grayscale(0);
        }

        .evolution-stage.active {
          opacity: 1;
          filter: none;
        }

        .evolution-glow {
          position: absolute;
          inset: -10px;
          border-radius: 50%;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .evolution-stage.active .evolution-glow,
        .evolution-stage.preview .evolution-glow {
          opacity: 1;
        }

        .evolution-sprite {
          width: 52px;
          height: 52px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          overflow: hidden;
          position: relative;
          z-index: 1;
        }

        .evolution-sprite img {
          width: 44px;
          height: 44px;
          object-fit: contain;
        }

        .evolution-level {
          margin-top: 0.5rem;
          font-size: 0.65rem;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.7);
          padding: 0.2rem 0.5rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid;
          border-radius: 8px;
          position: relative;
          z-index: 1;
        }

        .evolution-active-dot {
          position: absolute;
          bottom: -8px;
          left: 50%;
          transform: translateX(-50%);
          width: 8px;
          height: 8px;
          background: #8b5cf6;
          border-radius: 50%;
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(139, 92, 246, 0.4); }
          50% { box-shadow: 0 0 10px 4px rgba(139, 92, 246, 0.2); }
        }

        .evolution-connector {
          width: 24px;
          height: 2px;
          border-radius: 1px;
          transform-origin: left center;
        }

        .evolution-info {
          text-align: center;
          margin-top: 0.5rem;
        }

        .evolution-name {
          font-size: 1.1rem;
          font-weight: 700;
        }

        .evolution-level-text {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.5);
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .evolution-progress {
          width: 100%;
          max-width: 280px;
        }

        .evolution-progress-bar {
          height: 6px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
          overflow: hidden;
        }

        .evolution-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #8b5cf6, #ec4899);
          border-radius: 3px;
          transition: width 0.5s ease;
        }

        .evolution-progress-text {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.5);
          text-align: center;
          margin-top: 0.5rem;
        }

        .evolution-hint {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.4);
          font-style: italic;
        }

        @media (max-width: 480px) {
          .evolution-sprite {
            width: 44px;
            height: 44px;
          }

          .evolution-sprite img {
            width: 36px;
            height: 36px;
          }

          .evolution-connector {
            width: 12px;
          }
        }
      `}</style>
    </div>
  );
}
