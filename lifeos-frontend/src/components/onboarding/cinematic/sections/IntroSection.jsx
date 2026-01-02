/**
 * Intro Section - Enhanced with SVG Path Drawing
 *
 * The opening of the cinematic onboarding experience.
 * Features:
 * - SVG logo drawn with anime.js strokeDashoffset
 * - Character-by-character text reveal
 * - Staggered tagline animation
 * - Minimal particles (cosmos builds through scroll)
 */

import React, { useEffect, useRef, useState } from 'react';
import { animate, stagger, createTimeline } from 'animejs';
import { feedback } from '../../../../services/microInteractions';

// Logo component with fade-in animation
const AscndLogo = ({ onDrawComplete }) => {
  const logoRef = useRef(null);
  const glowRef = useRef(null);
  const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    if (hasDrawn || !logoRef.current) return;

    const logo = logoRef.current;
    const glow = glowRef.current;

    // Initial state
    logo.style.opacity = '0';
    logo.style.transform = 'scale(0.5)';
    if (glow) {
      glow.style.opacity = '0';
      glow.style.transform = 'scale(0.3)';
    }

    // Animate glow first
    setTimeout(() => {
      if (glow) {
        animate(glow, {
          opacity: [0, 0.6],
          scale: [0.3, 1.2],
          duration: 800,
          ease: 'outQuad',
        });
      }
    }, 200);

    // Animate logo
    setTimeout(() => {
      animate(logo, {
        opacity: [0, 1],
        scale: [0.5, 1],
        duration: 1000,
        ease: 'outBack',
      });
    }, 400);

    // Glow pulse and completion
    setTimeout(() => {
      if (glow) {
        animate(glow, {
          opacity: [0.6, 0.3, 0.5],
          scale: [1.2, 1.0, 1.1],
          duration: 800,
          ease: 'inOutQuad',
        });
      }
      setHasDrawn(true);
      onDrawComplete?.();
    }, 1400);

  }, [hasDrawn, onDrawComplete]);

  return (
    <div className="ascnd-logo-wrapper">
      <div ref={glowRef} className="ascnd-logo-glow" />
      <img
        ref={logoRef}
        src="/logo.png"
        alt="Ascnd"
        className="ascnd-logo-img"
      />
    </div>
  );
};

export default function IntroSection({ isActive, progress, onComplete }) {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const taglineRef = useRef(null);
  const [logoDrawn, setLogoDrawn] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);

  // Run text animations after logo draws
  useEffect(() => {
    if (!isActive || !logoDrawn || hasAnimated) return;

    const section = sectionRef.current;
    if (!section) return;

    const timeline = createTimeline({
      autoplay: true,
      onComplete: () => {
        setHasAnimated(true);
        feedback.taskComplete();
      },
    });

    // Title text reveal (character by character)
    const titleEl = titleRef.current;
    if (titleEl) {
      const text = titleEl.textContent;
      titleEl.innerHTML = '';

      const chars = text.split('').map((char) => {
        const span = document.createElement('span');
        span.textContent = char === ' ' ? '\u00A0' : char;
        span.className = 'char';
        span.style.display = 'inline-block';
        span.style.opacity = '0';
        titleEl.appendChild(span);
        return span;
      });

      timeline.add(chars, {
        opacity: [0, 1],
        y: [50, 0],
        rotateX: [-90, 0],
        scale: [0.5, 1],
        duration: 600,
        delay: stagger(50, { from: 'center' }),
        ease: 'outExpo',
      }, 0);
    }

    // Subtitle fades in
    timeline.add(subtitleRef.current, {
      opacity: [0, 1],
      y: [30, 0],
      duration: 800,
      ease: 'outExpo',
    }, 600);

    // Tagline types in
    const taglineEl = taglineRef.current;
    if (taglineEl) {
      const text = taglineEl.textContent;
      taglineEl.innerHTML = '';

      const chars = text.split('').map((char) => {
        const span = document.createElement('span');
        span.textContent = char === ' ' ? '\u00A0' : char;
        span.style.opacity = '0';
        taglineEl.appendChild(span);
        return span;
      });

      timeline.add(chars, {
        opacity: [0, 1],
        duration: 50,
        delay: stagger(25),
        ease: 'linear',
      }, 1000);
    }

    // Scroll indicator
    timeline.add(section.querySelector('.intro-scroll-indicator'), {
      opacity: [0, 1],
      y: [20, 0],
      duration: 600,
      ease: 'outExpo',
    }, 1600);

    return () => timeline.pause();
  }, [isActive, logoDrawn, hasAnimated]);

  return (
    <div ref={sectionRef} className="intro-section">
      {/* Logo with animation */}
      <div className="intro-logo-container">
        {isActive && (
          <AscndLogo onDrawComplete={() => setLogoDrawn(true)} />
        )}
      </div>

      {/* Title */}
      <h1 ref={titleRef} className="intro-title">
        Ascnd
      </h1>

      {/* Subtitle */}
      <p ref={subtitleRef} className="intro-subtitle" style={{ opacity: 0 }}>
        Your personal operating system for an extraordinary life
      </p>

      {/* Tagline */}
      <p ref={taglineRef} className="intro-tagline">
        Begin your transformation
      </p>

      {/* Scroll indicator */}
      <div className="intro-scroll-indicator" style={{ opacity: 0 }}>
        <div className="scroll-arrow" />
        <span>Scroll to begin</span>
      </div>

      <style>{`
        .intro-section {
          position: relative;
          min-height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }

        .intro-logo-container {
          width: 220px;
          height: 220px;
          margin-bottom: 2rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .ascnd-logo-wrapper {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .ascnd-logo-glow {
          position: absolute;
          inset: -40px;
          background: radial-gradient(
            circle,
            rgba(167, 139, 250, 0.4) 0%,
            rgba(139, 92, 246, 0.2) 40%,
            transparent 70%
          );
          border-radius: 50%;
          pointer-events: none;
        }

        .ascnd-logo-img {
          width: 100%;
          height: auto;
          filter: drop-shadow(0 0 20px rgba(167, 139, 250, 0.5));
        }

        .intro-title {
          font-size: clamp(3rem, 10vw, 5rem);
          font-weight: 800;
          background: linear-gradient(135deg, #ffffff 0%, #a855f7 50%, #ec4899 100%);
          background-size: 200% 200%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 1rem;
          perspective: 1000px;
          animation: titleGlow 5s ease infinite;
        }

        @keyframes titleGlow {
          0%, 100% { background-position: 0% 50%; filter: drop-shadow(0 0 20px rgba(168, 85, 247, 0.3)); }
          50% { background-position: 100% 50%; filter: drop-shadow(0 0 40px rgba(168, 85, 247, 0.5)); }
        }

        .intro-title .char {
          display: inline-block;
          transform-style: preserve-3d;
        }

        .intro-subtitle {
          font-size: clamp(1rem, 3vw, 1.25rem);
          color: rgba(255, 255, 255, 0.7);
          text-align: center;
          max-width: 500px;
          line-height: 1.6;
          margin-bottom: 1.5rem;
        }

        .intro-tagline {
          font-size: 1rem;
          color: rgba(168, 85, 247, 0.8);
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin-bottom: 3rem;
        }

        .intro-scroll-indicator {
          position: absolute;
          bottom: 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
          color: rgba(255, 255, 255, 0.5);
          font-size: 0.85rem;
          letter-spacing: 0.05em;
        }

        .scroll-arrow {
          width: 24px;
          height: 24px;
          border-right: 2px solid rgba(168, 85, 247, 0.6);
          border-bottom: 2px solid rgba(168, 85, 247, 0.6);
          transform: rotate(45deg);
          animation: scrollBounce 2s ease-in-out infinite;
        }

        @keyframes scrollBounce {
          0%, 100% { transform: rotate(45deg) translateY(0); opacity: 0.6; }
          50% { transform: rotate(45deg) translateY(8px); opacity: 1; }
        }

        @media (max-width: 640px) {
          .intro-logo-container {
            width: 180px;
            height: 180px;
            margin-bottom: 1.5rem;
          }

          .intro-subtitle {
            font-size: 0.95rem;
            padding: 0 1rem;
          }

          .intro-tagline {
            font-size: 0.85rem;
          }
        }
      `}</style>
    </div>
  );
}
