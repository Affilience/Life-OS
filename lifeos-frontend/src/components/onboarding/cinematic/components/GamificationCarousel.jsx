/**
 * Gamification Carousel
 *
 * 3D scroll-driven carousel showcasing gamification features.
 * Cards rotate in 3D space as you scroll through the section.
 */

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import XPDemo from './demos/XPDemo';
import EquipmentPetsDemo from './demos/EquipmentPetsDemo';
import SkillsDemo from './demos/SkillsDemo';
import BazaarDemo from './demos/BazaarDemo';
import StatsDemo from './demos/StatsDemo';
import AbilitiesDemo from './demos/AbilitiesDemo';

const DEMOS = [
  {
    id: 'xp',
    component: XPDemo,
    title: 'Experience Points',
    description: 'Every action earns XP. Level up and unlock new abilities.',
    color: '#fbbf24',
    icon: '⚡',
  },
  {
    id: 'equipment',
    component: EquipmentPetsDemo,
    title: 'Equipment & Pets',
    description: 'Equip gear and adopt companions that boost your stats.',
    color: '#a855f7',
    icon: '⚔️',
  },
  {
    id: 'stats',
    component: StatsDemo,
    title: 'Stats & Skills',
    description: 'Allocate skill points to boost your core attributes.',
    color: '#ef4444',
    icon: '📊',
  },
  {
    id: 'skills',
    component: SkillsDemo,
    title: 'Skill Constellation',
    description: 'Unlock stars in your cosmic skill map.',
    color: '#3b82f6',
    icon: '⭐',
  },
  {
    id: 'abilities',
    component: AbilitiesDemo,
    title: 'Combat Abilities',
    description: 'Elemental powers for boss battles and PvP arena.',
    color: '#ff6600',
    icon: '🔥',
  },
  {
    id: 'bazaar',
    component: BazaarDemo,
    title: 'Cosmic Bazaar',
    description: 'Spend credits on equipment and rewards.',
    color: '#10b981',
    icon: '🛒',
  },
];

const ANGLE_PER_CARD = 360 / DEMOS.length;

export default function GamificationCarousel({ isActive, onComplete, scrollProgress = 0 }) {
  const containerRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [hasCompleted, setHasCompleted] = useState(false);
  const lastWheelTime = useRef(0);
  const reachedEndTime = useRef(null);

  // Calculate rotation for 3D effect
  const rotation = activeIndex * ANGLE_PER_CARD;

  // Handle wheel events for smooth carousel navigation
  useEffect(() => {
    if (!isActive) return;

    const handleWheel = (e) => {
      const direction = e.deltaY > 0 ? 1 : -1;

      // At the end of carousel - add delay before allowing scroll-past
      if (direction > 0 && activeIndex >= DEMOS.length - 1) {
        // Start tracking time when first reaching end
        if (!reachedEndTime.current) {
          reachedEndTime.current = Date.now();
        }

        const elapsed = Date.now() - reachedEndTime.current;
        const SCROLL_PAST_DELAY = 1500; // 1.5 second delay at last card

        if (elapsed < SCROLL_PAST_DELAY) {
          e.preventDefault(); // Block scroll until delay passes
          return;
        }
        // After delay, let page scroll naturally
        return;
      }

      // At the beginning - allow scroll up naturally
      if (direction < 0 && activeIndex <= 0) {
        return; // Let page scroll naturally
      }

      // Reset end timer if moving away from last card
      if (activeIndex < DEMOS.length - 1) {
        reachedEndTime.current = null;
      }

      e.preventDefault();

      const now = Date.now();
      // Throttle wheel events - 350ms for smooth controlled navigation
      if (now - lastWheelTime.current < 350) return;
      lastWheelTime.current = now;

      setActiveIndex(prev => {
        const next = prev + direction;
        if (next < 0) return 0;
        if (next >= DEMOS.length) return DEMOS.length - 1;
        return next;
      });
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
    }

    window.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      if (container) {
        container.removeEventListener('wheel', handleWheel);
      }
      window.removeEventListener('wheel', handleWheel);
    };
  }, [isActive, activeIndex]);

  // Complete when reaching the last card
  useEffect(() => {
    if (activeIndex === DEMOS.length - 1 && !hasCompleted && onComplete) {
      setHasCompleted(true);
      setTimeout(() => onComplete(), 1500);
    }
  }, [activeIndex, hasCompleted, onComplete]);

  // Handle indicator click
  const handleIndicatorClick = useCallback((index) => {
    setActiveIndex(index);
  }, []);

  return (
    <div ref={containerRef} className="carousel-3d">
      {/* 3D Carousel Container */}
      <div className="carousel-scene">
        <div
          className="carousel-rotator"
          style={{
            transform: `translateZ(-320px) rotateY(${-rotation}deg)`,
          }}
        >
          {DEMOS.map((demo, index) => {
            const DemoComponent = demo.component;
            const angle = index * ANGLE_PER_CARD;
            const isActiveCard = index === activeIndex;
            const distance = Math.abs(index - activeIndex);
            // Show active card fully, adjacent cards partially, others hidden
            const cardOpacity = distance === 0 ? 1 : distance === 1 ? 0.4 : 0;
            const cardScale = distance === 0 ? 1 : 0.85;

            return (
              <div
                key={demo.id}
                className={`carousel-card ${isActiveCard ? 'active' : ''}`}
                style={{
                  transform: `rotateY(${angle}deg) translateZ(320px) scale(${cardScale})`,
                  '--card-color': demo.color,
                  opacity: cardOpacity,
                  pointerEvents: isActiveCard ? 'auto' : 'none',
                }}
              >
                <div className="card-content">
                  <div className="card-header">
                    <span className="card-icon">{demo.icon}</span>
                    <h3 className="card-title">{demo.title}</h3>
                  </div>
                  <div className="card-demo">
                    <DemoComponent isActive={isActiveCard} onInteract={() => {}} />
                  </div>
                  <p className="card-description">{demo.description}</p>
                </div>
                <div className="card-glow" />
              </div>
            );
          })}
        </div>
      </div>

      {/* Progress indicators */}
      <div className="carousel-indicators">
        {DEMOS.map((demo, index) => (
          <button
            key={demo.id}
            className={`indicator ${index === activeIndex ? 'active' : ''} ${index < activeIndex ? 'past' : ''}`}
            style={{ '--indicator-color': demo.color }}
            onClick={() => handleIndicatorClick(index)}
          >
            <span className="indicator-icon">{demo.icon}</span>
            {index === activeIndex && (
              <span className="indicator-label">{demo.title}</span>
            )}
          </button>
        ))}
      </div>

      {/* Progress bar */}
      <div className="carousel-progress-track">
        <div
          className="carousel-progress-fill"
          style={{
            width: `${((activeIndex + 1) / DEMOS.length) * 100}%`,
            background: DEMOS[activeIndex].color,
          }}
        />
      </div>

      <style>{`
        .carousel-3d {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
          padding: 0.5rem 0;
        }

        .carousel-scene {
          width: 100%;
          height: 480px;
          perspective: 1000px;
          perspective-origin: 50% 50%;
          overflow: visible;
        }

        .carousel-rotator {
          width: 100%;
          height: 100%;
          position: relative;
          transform-style: preserve-3d;
          transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
          will-change: transform;
        }

        .carousel-card {
          position: absolute;
          width: 100%;
          max-width: 540px;
          height: 440px;
          left: 50%;
          top: 50%;
          margin-left: -270px;
          margin-top: -220px;
          backface-visibility: hidden;
          transform-style: preserve-3d;
          will-change: transform, opacity;
          transition: opacity 0.5s ease, transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .carousel-card .card-content {
          width: 100%;
          height: 100%;
          background: rgba(15, 10, 30, 0.95);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          position: relative;
          z-index: 1;
        }

        .carousel-card.active .card-content {
          border-color: var(--card-color, rgba(139, 92, 246, 0.5));
          box-shadow:
            0 0 30px rgba(139, 92, 246, 0.15),
            inset 0 0 40px rgba(139, 92, 246, 0.03);
        }

        .carousel-card .card-glow {
          position: absolute;
          inset: -15px;
          background: radial-gradient(
            ellipse at center,
            var(--card-color, rgba(139, 92, 246, 0.3)) 0%,
            transparent 70%
          );
          opacity: 0;
          filter: blur(30px);
          transition: opacity 0.3s ease;
          z-index: 0;
          pointer-events: none;
        }

        .carousel-card.active .card-glow {
          opacity: 0.3;
        }

        .card-header {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          margin-bottom: 0.75rem;
          flex-shrink: 0;
        }

        .card-icon {
          font-size: 1.5rem;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, var(--card-color, #8b5cf6)30, var(--card-color, #8b5cf6)10);
          border-radius: 12px;
        }

        .card-title {
          font-size: 1.1rem;
          font-weight: 700;
          color: white;
          margin: 0;
        }

        .card-demo {
          flex: 1;
          min-height: 0;
          overflow: hidden;
          border-radius: 12px;
          background: rgba(0, 0, 0, 0.15);
          padding: 1rem;
        }

        .card-description {
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.5);
          text-align: center;
          margin: 0.75rem 0 0;
          line-height: 1.3;
          flex-shrink: 0;
        }

        .carousel-indicators {
          display: flex;
          gap: 0.5rem;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
        }

        .indicator {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.4rem 0.6rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .indicator:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .indicator.past {
          background: var(--indicator-color, #8b5cf6);
          opacity: 0.4;
        }

        .indicator.active {
          background: linear-gradient(135deg, var(--indicator-color, #8b5cf6)40, var(--indicator-color, #8b5cf6)20);
          border-color: var(--indicator-color, #8b5cf6);
          box-shadow: 0 0 15px var(--indicator-color, rgba(139, 92, 246, 0.3));
        }

        .indicator-icon {
          font-size: 0.9rem;
        }

        .indicator-label {
          font-size: 0.7rem;
          font-weight: 600;
          color: white;
          white-space: nowrap;
        }

        .carousel-progress-track {
          width: 180px;
          height: 3px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 2px;
          overflow: hidden;
        }

        .carousel-progress-fill {
          height: 100%;
          border-radius: 2px;
          transition: width 0.3s ease, background 0.3s ease;
        }

        @media (max-width: 640px) {
          .carousel-scene {
            height: 420px;
          }

          .carousel-card {
            max-width: 340px;
            height: 380px;
            margin-left: -170px;
            margin-top: -190px;
          }

          .card-demo {
            padding: 0.5rem;
          }

          .carousel-indicators {
            gap: 0.25rem;
          }

          .indicator {
            padding: 0.2rem 0.4rem;
            border-radius: 12px;
          }

          .indicator-icon {
            font-size: 0.7rem;
          }

          .indicator-label {
            display: none;
          }
        }

        @media (max-width: 480px) {
          .carousel-indicators {
            gap: 0.2rem;
          }

          .indicator {
            padding: 0.15rem 0.3rem;
            border-radius: 10px;
          }

          .indicator-icon {
            font-size: 0.6rem;
          }
        }
      `}</style>
    </div>
  );
}
