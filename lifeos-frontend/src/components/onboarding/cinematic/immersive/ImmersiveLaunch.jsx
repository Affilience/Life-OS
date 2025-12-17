/**
 * ImmersiveLaunch - Epic Finale
 *
 * The grand culmination of the onboarding journey.
 * Uses GSAP timeline pattern with scroll-driven animations.
 *
 * BUILD PHASE (0-0.5):
 * - Title materializes character by character
 * - Personalized message appears
 * - Stats reveal with count-up effect
 * - Launch button emerges
 *
 * HOLD PHASE (0.5-1.0):
 * - Ready for launch button click
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { feedback } from '../../../../services/microInteractions';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// Confetti explosion
function Confetti({ active }) {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (!active) return;

    const colors = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ffffff'];
    const newParticles = [];

    for (let i = 0; i < 150; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 0.5,
        duration: 2.5 + Math.random() * 2,
        size: 4 + Math.random() * 8,
        rotation: Math.random() * 360,
        drift: (Math.random() - 0.5) * 100,
      });
    }

    setParticles(newParticles);
  }, [active]);

  if (!active) return null;

  return (
    <div className="confetti-container">
      {particles.map(p => (
        <div
          key={p.id}
          className="confetti-piece"
          style={{
            '--x': `${p.x}%`,
            '--color': p.color,
            '--delay': `${p.delay}s`,
            '--duration': `${p.duration}s`,
            '--size': `${p.size}px`,
            '--rotation': `${p.rotation}deg`,
            '--drift': `${p.drift}px`,
          }}
        />
      ))}
    </div>
  );
}

export default function ImmersiveLaunch({
  sectionId,
  onLaunch,
  onSectionEnter,
  username,
  selectedGoals = [],
}) {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const messageRef = useRef(null);
  const statsRef = useRef(null);
  const statCardRefs = useRef([]);
  const buttonRef = useRef(null);
  const ambientRef = useRef(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);

  // Store callback in ref
  const onSectionEnterRef = useRef(onSectionEnter);
  useEffect(() => {
    onSectionEnterRef.current = onSectionEnter;
  }, [onSectionEnter]);

  // Track if section is in view
  const [isInView, setIsInView] = useState(false);

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

            // Ambient glow
            if (ambientRef.current) {
              entranceTl.fromTo(ambientRef.current,
                { scale: 0.5, opacity: 0 },
                { scale: 1, opacity: 0.6, duration: 0.6, ease: 'power2.out' },
                0
              );
            }

            // Title characters
            if (titleRef.current) {
              const chars = titleRef.current.querySelectorAll('.title-char');
              chars.forEach((char, i) => {
                entranceTl.fromTo(char,
                  { opacity: 0, y: 60, rotateX: -90, scale: 0.5 },
                  { opacity: 1, y: 0, rotateX: 0, scale: 1, duration: 0.4, ease: 'back.out(1.7)' },
                  0.1 + (i * 0.04)
                );
              });
            }

            // Message
            if (messageRef.current) {
              entranceTl.fromTo(messageRef.current,
                { opacity: 0, y: 40 },
                { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' },
                0.5
              );
            }

            // Stats container
            if (statsRef.current) {
              entranceTl.fromTo(statsRef.current,
                { opacity: 0, y: 50 },
                { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' },
                0.65
              );
            }

            // Individual stat cards
            statCardRefs.current.forEach((card, i) => {
              if (!card) return;
              entranceTl.fromTo(card,
                { opacity: 0, y: 30 },
                { opacity: 1, y: 0, duration: 0.4, ease: 'back.out(1.4)' },
                0.7 + (i * 0.1)
              );
            });

            // Button
            if (buttonRef.current) {
              entranceTl.fromTo(buttonRef.current,
                { opacity: 0, y: 50, scale: 0.9, filter: 'blur(5px)' },
                { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: 0.5, ease: 'back.out(1.4)' },
                1.0
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

  // Handle launch
  const handleLaunch = useCallback(() => {
    if (isLaunching) return;

    setIsLaunching(true);
    setShowConfetti(true);
    feedback.achievement();

    // Button pulse animation
    if (buttonRef.current) {
      gsap.to(buttonRef.current, {
        scale: 1.15,
        duration: 0.2,
        yoyo: true,
        repeat: 1,
        ease: 'back.out(1.7)',
      });
    }

    // Delayed actual launch
    setTimeout(() => {
      onLaunch?.();
    }, 2500);
  }, [isLaunching, onLaunch]);

  // Title characters
  const title = 'Ready to begin?';
  const titleChars = title.split('');

  return (
    <section
      ref={sectionRef}
      className="immersive-section relative min-h-screen overflow-hidden"
    >
      <div className="launch-content">
        {/* Confetti */}
        <Confetti active={showConfetti} />

        {/* Ambient glow */}
        <div ref={ambientRef} className="launch-ambient" style={{ opacity: 0 }} />

        {/* Title with character animation */}
        <h1 ref={titleRef} className="launch-title" style={{ perspective: '1200px' }}>
          {titleChars.map((char, i) => (
            <span
              key={i}
              className="title-char"
              style={{ opacity: 0, display: 'inline-block', transformStyle: 'preserve-3d' }}
            >
              {char === ' ' ? '\u00A0' : char}
            </span>
          ))}
        </h1>

        {/* Personalized message */}
        <div ref={messageRef} className="launch-message" style={{ opacity: 0 }}>
          {username ? (
            <p>
              <span className="name-highlight">{username}</span>, your transformation starts now.
            </p>
          ) : (
            <p>Your transformation starts now.</p>
          )}
          <p className="message-sub">Every small step leads to extraordinary results.</p>
        </div>

        {/* Stats summary */}
        <div ref={statsRef} className="launch-stats" style={{ opacity: 0 }}>
          <div
            ref={el => statCardRefs.current[0] = el}
            className="stat-card"
            style={{ opacity: 0 }}
          >
            <div className="stat-value">
              <span className="stat-number">1</span>
            </div>
            <div className="stat-label">Starting Level</div>
          </div>

          <div
            ref={el => statCardRefs.current[1] = el}
            className="stat-card"
            style={{ opacity: 0 }}
          >
            <div className="stat-value">
              <span className="stat-number">{selectedGoals.length || 3}</span>
            </div>
            <div className="stat-label">Focus Areas</div>
          </div>

          <div
            ref={el => statCardRefs.current[2] = el}
            className="stat-card"
            style={{ opacity: 0 }}
          >
            <div className="stat-value">
              <span className="stat-infinity">∞</span>
            </div>
            <div className="stat-label">Potential</div>
          </div>
        </div>

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
              <span className="button-text">Launching...</span>
              <div className="button-loader" />
            </>
          ) : (
            <>
              <span className="button-text">Launch My Journey</span>
              <span className="button-icon">🚀</span>
            </>
          )}

          {/* Button glow */}
          <div className="button-glow" />
        </button>
      </div>

      <style>{`
        .launch-content {
          position: relative;
          width: 100%;
          height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }

        /* Ambient glow */
        .launch-ambient {
          position: absolute;
          left: 50%;
          top: 45%;
          transform: translate(-50%, -50%);
          width: 700px;
          height: 700px;
          background: radial-gradient(
            circle,
            rgba(139, 92, 246, 0.2) 0%,
            rgba(236, 72, 153, 0.1) 40%,
            transparent 70%
          );
          pointer-events: none;
        }

        /* Title */
        .launch-title {
          font-size: clamp(2.5rem, 8vw, 4.5rem);
          font-weight: 800;
          background: linear-gradient(
            135deg,
            #ffffff 0%,
            #a855f7 35%,
            #ec4899 65%,
            #f59e0b 100%
          );
          background-size: 300% 300%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 2rem;
          text-align: center;
          animation: titleGradientFlow 6s ease infinite;
        }

        @keyframes titleGradientFlow {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        .title-char {
          transform-style: preserve-3d;
        }

        /* Message */
        .launch-message {
          text-align: center;
          margin-bottom: 3rem;
        }

        .launch-message p {
          font-size: 1.35rem;
          color: rgba(255, 255, 255, 0.8);
          line-height: 1.7;
          margin: 0;
        }

        .name-highlight {
          background: linear-gradient(135deg, #a855f7, #ec4899);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-weight: 600;
        }

        .message-sub {
          color: rgba(255, 255, 255, 0.5) !important;
          font-size: 1.1rem !important;
          margin-top: 0.5rem !important;
        }

        /* Stats */
        .launch-stats {
          display: flex;
          gap: 3rem;
          margin-bottom: 3.5rem;
          padding: 1.5rem 2rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          backdrop-filter: blur(10px);
        }

        .stat-card {
          text-align: center;
        }

        .stat-value {
          margin-bottom: 0.5rem;
        }

        .stat-number {
          font-size: 3rem;
          font-weight: 800;
          background: linear-gradient(135deg, #a855f7, #ec4899);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .stat-infinity {
          font-size: 3.5rem;
          font-weight: 300;
          background: linear-gradient(135deg, #8b5cf6, #06b6d4);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .stat-label {
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.5);
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        /* Launch button */
        .launch-button {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          padding: 1.5rem 4rem;
          font-size: 1.4rem;
          font-weight: 700;
          background: linear-gradient(135deg, #8b5cf6, #a855f7, #ec4899);
          background-size: 200% 200%;
          border: none;
          border-radius: 20px;
          color: white;
          cursor: pointer;
          overflow: hidden;
          transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease;
          animation: buttonGradient 4s ease infinite;
        }

        @keyframes buttonGradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        .launch-button:hover:not(:disabled) {
          transform: translateY(-4px) scale(1.02);
          box-shadow:
            0 20px 50px rgba(139, 92, 246, 0.4),
            0 0 60px rgba(139, 92, 246, 0.2);
        }

        .launch-button:active:not(:disabled) {
          transform: translateY(0) scale(0.98);
        }

        .launch-button:disabled {
          cursor: default;
        }

        .launch-button.launching {
          background: linear-gradient(135deg, #10b981, #059669);
          animation: none;
        }

        .button-glow {
          position: absolute;
          inset: -4px;
          background: linear-gradient(135deg, #8b5cf6, #ec4899, #f59e0b, #8b5cf6);
          background-size: 300% 300%;
          border-radius: 24px;
          z-index: -1;
          filter: blur(20px);
          opacity: 0.6;
          animation: buttonGradient 4s ease infinite;
        }

        .button-text {
          position: relative;
          z-index: 1;
        }

        .button-icon {
          font-size: 1.6rem;
          transition: transform 0.3s ease;
        }

        .launch-button:hover .button-icon {
          transform: translateX(4px) rotate(15deg);
        }

        .button-loader {
          width: 24px;
          height: 24px;
          border: 3px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Confetti */
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
          left: var(--x);
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
            transform: rotate(calc(var(--rotation) + 720deg)) translateX(var(--drift));
          }
        }

        @media (max-width: 640px) {
          .launch-stats {
            flex-direction: row;
            gap: 1.5rem;
            padding: 1rem 1.5rem;
          }

          .stat-number {
            font-size: 2rem;
          }

          .stat-infinity {
            font-size: 2.5rem;
          }

          .stat-label {
            font-size: 0.7rem;
          }

          .launch-button {
            padding: 1.25rem 2.5rem;
            font-size: 1.15rem;
          }
        }
      `}</style>
    </section>
  );
}
