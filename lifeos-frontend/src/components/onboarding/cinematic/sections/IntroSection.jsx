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

// SVG Logo component with path drawing animation
const AscyntLogo = ({ onDrawComplete }) => {
  const svgRef = useRef(null);
  const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    if (hasDrawn || !svgRef.current) return;

    const svg = svgRef.current;

    // Get elements
    const outerRing = svg.querySelector('.logo-ring-outer');
    const innerRing = svg.querySelector('.logo-ring-inner');
    const qBody = svg.querySelector('.logo-q-body');
    const qTail = svg.querySelector('.logo-q-tail');
    const dots = svg.querySelectorAll('.logo-dot');

    // Safety check - ensure all elements exist
    if (!outerRing || !innerRing || !qBody || !qTail) {
      console.warn('Logo elements not found, skipping animation');
      onDrawComplete?.();
      return;
    }

    // Get lengths and set up stroke dash
    const outerLength = outerRing.getTotalLength();
    const innerLength = innerRing.getTotalLength();
    const qBodyLength = qBody.getTotalLength();
    const qTailLength = qTail.getTotalLength();

    // Set initial state - fully hidden
    outerRing.style.strokeDasharray = outerLength;
    outerRing.style.strokeDashoffset = outerLength;

    innerRing.style.strokeDasharray = innerLength;
    innerRing.style.strokeDashoffset = innerLength;

    qBody.style.strokeDasharray = qBodyLength;
    qBody.style.strokeDashoffset = qBodyLength;

    qTail.style.strokeDasharray = qTailLength;
    qTail.style.strokeDashoffset = qTailLength;

    // Hide dots initially
    dots.forEach(dot => {
      dot.style.transform = 'scale(0)';
      dot.style.opacity = '0';
    });

    // Animate with separate calls and delays (more reliable than timeline in anime.js v4)

    // Draw outer ring first
    animate(outerRing, {
      strokeDashoffset: [outerLength, 0],
      duration: 1200,
      ease: 'inOutQuad',
    });

    // Draw inner ring after delay
    setTimeout(() => {
      animate(innerRing, {
        strokeDashoffset: [innerLength, 0],
        duration: 1000,
        ease: 'inOutQuad',
      });
    }, 400);

    // Draw Q body
    setTimeout(() => {
      animate(qBody, {
        strokeDashoffset: [qBodyLength, 0],
        duration: 1400,
        ease: 'inOutQuad',
      });
    }, 800);

    // Draw Q tail
    setTimeout(() => {
      animate(qTail, {
        strokeDashoffset: [qTailLength, 0],
        duration: 600,
        ease: 'outQuad',
      });
    }, 1800);

    // Draw orbital dots
    setTimeout(() => {
      animate(dots, {
        scale: [0, 1],
        opacity: [0, 1],
        duration: 400,
        delay: stagger(100),
        ease: 'outBack',
      });
    }, 2000);

    // Final glow pulse and completion
    setTimeout(() => {
      animate(svg, {
        filter: [
          'drop-shadow(0 0 0px rgba(168, 85, 247, 0))',
          'drop-shadow(0 0 30px rgba(168, 85, 247, 0.8))',
          'drop-shadow(0 0 15px rgba(168, 85, 247, 0.4))'
        ],
        duration: 800,
        ease: 'outQuad',
        onComplete: () => {
          setHasDrawn(true);
          onDrawComplete?.();
        },
      });
    }, 2200);

  }, [hasDrawn, onDrawComplete]);

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 200 200"
      className="quanta-logo-svg"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer orbital ring */}
      <circle
        className="logo-ring-outer"
        cx="100"
        cy="100"
        r="90"
        stroke="url(#logoGradient1)"
        strokeWidth="1.5"
        opacity="0.6"
      />

      {/* Inner orbital ring */}
      <circle
        className="logo-ring-inner"
        cx="100"
        cy="100"
        r="70"
        stroke="url(#logoGradient2)"
        strokeWidth="1"
        opacity="0.4"
      />

      {/* Q letter - main body (circle) */}
      <circle
        className="logo-q-body"
        cx="100"
        cy="95"
        r="35"
        stroke="url(#logoGradient3)"
        strokeWidth="6"
        strokeLinecap="round"
      />

      {/* Q letter - tail */}
      <path
        className="logo-q-tail"
        d="M 120 115 L 145 145"
        stroke="url(#logoGradient3)"
        strokeWidth="6"
        strokeLinecap="round"
      />

      {/* Orbital dots */}
      <circle className="logo-dot" cx="100" cy="10" r="4" fill="#a855f7" />
      <circle className="logo-dot" cx="190" cy="100" r="3" fill="#ec4899" />
      <circle className="logo-dot" cx="100" cy="190" r="4" fill="#3b82f6" />
      <circle className="logo-dot" cx="10" cy="100" r="3" fill="#a855f7" />

      {/* Gradients */}
      <defs>
        <linearGradient id="logoGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
        <linearGradient id="logoGradient2" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
        <linearGradient id="logoGradient3" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="50%" stopColor="#c4b5fd" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
      </defs>
    </svg>
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
      {/* SVG Logo with path drawing */}
      <div className="intro-logo-container">
        {isActive && (
          <AscyntLogo onDrawComplete={() => setLogoDrawn(true)} />
        )}
      </div>

      {/* Title */}
      <h1 ref={titleRef} className="intro-title">
        Ascynt
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

        .quanta-logo-svg {
          width: 100%;
          height: 100%;
          filter: drop-shadow(0 0 15px rgba(168, 85, 247, 0.4));
        }

        .logo-dot {
          transform-origin: center;
          transform: scale(0);
          opacity: 0;
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
