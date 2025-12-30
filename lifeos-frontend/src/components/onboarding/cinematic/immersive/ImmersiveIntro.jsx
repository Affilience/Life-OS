/**
 * ImmersiveIntro - Epic Opening Sequence
 *
 * MATCHES WEBSITE PATTERN EXACTLY:
 * - Content visible on load (like Hero section)
 * - Scroll-triggered exit animations with scrub
 * - pinSpacing: false for seamless flow
 */

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function ImmersiveIntro({
  sectionId,
  onSectionEnter,
}) {
  const sectionRef = useRef(null);
  const logoRef = useRef(null);
  const logoGlowRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const taglineRef = useRef(null);
  const scrollHintRef = useRef(null);

  // Store callback in ref to avoid stale closures
  const onSectionEnterRef = useRef(onSectionEnter);
  useEffect(() => {
    onSectionEnterRef.current = onSectionEnter;
  }, [onSectionEnter]);

  // Auto-play entrance animation on mount (like website's Hero.animateIn())
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Call section enter immediately
    onSectionEnterRef.current?.();

    // Entrance timeline - plays automatically
    const entranceTl = gsap.timeline({ delay: 0.2 });

    // Logo emerges
    if (logoRef.current) {
      entranceTl.fromTo(logoRef.current,
        { scale: 0.3, opacity: 0, filter: 'blur(30px)', rotateX: 45 },
        { scale: 1, opacity: 1, filter: 'blur(0px)', rotateX: 0, duration: 0.8, ease: 'power3.out' },
        0
      );
    }

    // Logo glow
    if (logoGlowRef.current) {
      entranceTl.fromTo(logoGlowRef.current,
        { scale: 0.5, opacity: 0 },
        { scale: 1, opacity: 0.7, duration: 0.6, ease: 'power2.out' },
        0.15
      );
    }

    // Title characters stagger in
    if (titleRef.current) {
      const chars = titleRef.current.querySelectorAll('.title-char');
      entranceTl.fromTo(chars,
        { opacity: 0, y: 60, rotateX: -90 },
        { opacity: 1, y: 0, rotateX: 0, duration: 0.5, stagger: 0.06, ease: 'back.out(1.7)' },
        0.3
      );
    }

    // Subtitle
    if (subtitleRef.current) {
      entranceTl.fromTo(subtitleRef.current,
        { opacity: 0, y: 40, filter: 'blur(8px)' },
        { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.6, ease: 'power3.out' },
        0.6
      );
    }

    // Tagline
    if (taglineRef.current) {
      entranceTl.fromTo(taglineRef.current,
        { opacity: 0, y: 25, letterSpacing: '0.3em' },
        { opacity: 1, y: 0, letterSpacing: '0.15em', duration: 0.5, ease: 'power3.out' },
        0.75
      );
    }

    // Scroll hint
    if (scrollHintRef.current) {
      entranceTl.fromTo(scrollHintRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' },
        0.9
      );
    }

    return () => entranceTl.kill();
  }, []);

  // Exit animation when scrolling out of view (no pinning - allows scroll back)
  useEffect(() => {
    if (!sectionRef.current || typeof window === 'undefined') return;

    const section = sectionRef.current;
    let hasExited = false;

    const exitObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // When section is leaving viewport (scrolling down past it)
          if (!entry.isIntersecting && entry.boundingClientRect.top < 0 && !hasExited) {
            hasExited = true;

            // Play exit animations
            const exitTl = gsap.timeline();

            if (scrollHintRef.current) {
              exitTl.to(scrollHintRef.current, { opacity: 0, y: -30, duration: 0.3 }, 0);
            }

            if (taglineRef.current) {
              exitTl.to(taglineRef.current, { opacity: 0, y: -50, duration: 0.3 }, 0.05);
            }

            if (subtitleRef.current) {
              exitTl.to(subtitleRef.current, { opacity: 0, y: -60, duration: 0.3 }, 0.1);
            }

            if (titleRef.current) {
              const chars = titleRef.current.querySelectorAll('.title-char');
              chars.forEach((char, i) => {
                exitTl.to(char, { opacity: 0, y: -40, scale: 0.8, duration: 0.25 }, 0.15 + (i * 0.02));
              });
            }

            if (logoRef.current) {
              exitTl.to(logoRef.current, { scale: 0.5, opacity: 0, duration: 0.35 }, 0.2);
            }

            if (logoGlowRef.current) {
              exitTl.to(logoGlowRef.current, { scale: 1.5, opacity: 0, duration: 0.3 }, 0.25);
            }
          }

          // When section comes back into view (scrolling back up)
          if (entry.isIntersecting && hasExited) {
            hasExited = false;

            // Restore elements
            const restoreTl = gsap.timeline();

            if (logoRef.current) {
              restoreTl.to(logoRef.current, { scale: 1, opacity: 1, filter: 'blur(0px)', rotateX: 0, duration: 0.4 }, 0);
            }

            if (logoGlowRef.current) {
              restoreTl.to(logoGlowRef.current, { scale: 1, opacity: 0.7, duration: 0.35 }, 0.1);
            }

            if (titleRef.current) {
              const chars = titleRef.current.querySelectorAll('.title-char');
              chars.forEach((char, i) => {
                restoreTl.to(char, { opacity: 1, y: 0, x: 0, rotation: 0, scale: 1, duration: 0.3 }, 0.15 + (i * 0.03));
              });
            }

            if (subtitleRef.current) {
              restoreTl.to(subtitleRef.current, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.35 }, 0.3);
            }

            if (taglineRef.current) {
              restoreTl.to(taglineRef.current, { opacity: 1, y: 0, letterSpacing: '0.15em', duration: 0.3 }, 0.4);
            }

            if (scrollHintRef.current) {
              restoreTl.to(scrollHintRef.current, { opacity: 1, y: 0, duration: 0.3 }, 0.5);
            }
          }
        });
      },
      { threshold: 0.1 }
    );

    exitObserver.observe(section);

    return () => exitObserver.disconnect();
  }, []);

  // Title characters
  const titleText = 'Ascynt';
  const titleChars = titleText.split('');

  return (
    <section
      ref={sectionRef}
      className="immersive-section relative min-h-screen overflow-hidden"
    >
      <div className="intro-content">
        {/* Animated Logo */}
        <div className="logo-container" style={{ perspective: '1200px' }}>
          <div ref={logoRef} className="logo-wrapper" style={{ opacity: 0, transformStyle: 'preserve-3d' }}>
            <svg viewBox="0 0 200 200" className="quanta-logo" fill="none">
              {/* Outer orbital ring */}
              <circle
                cx="100" cy="100" r="90"
                stroke="url(#introGradient1)"
                strokeWidth="1.5"
                opacity="0.6"
              />

              {/* Inner orbital ring */}
              <circle
                cx="100" cy="100" r="70"
                stroke="url(#introGradient2)"
                strokeWidth="1"
                opacity="0.4"
              />

              {/* Q letter - main body */}
              <circle
                cx="100" cy="95" r="35"
                stroke="url(#introGradient3)"
                strokeWidth="6"
                strokeLinecap="round"
              />

              {/* Q letter - tail */}
              <path
                d="M 120 115 L 145 145"
                stroke="url(#introGradient3)"
                strokeWidth="6"
                strokeLinecap="round"
              />

              {/* Orbital dots */}
              <circle cx="100" cy="10" r="4" fill="#a855f7" />
              <circle cx="190" cy="100" r="3" fill="#ec4899" />
              <circle cx="100" cy="190" r="4" fill="#3b82f6" />
              <circle cx="10" cy="100" r="3" fill="#a855f7" />

              {/* Gradients */}
              <defs>
                <linearGradient id="introGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
                <linearGradient id="introGradient2" x1="100%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
                <linearGradient id="introGradient3" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="50%" stopColor="#c4b5fd" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Logo glow effect */}
          <div ref={logoGlowRef} className="logo-glow" style={{ opacity: 0 }} />
        </div>

        {/* Title with character animation */}
        <h1 ref={titleRef} className="intro-title" style={{ perspective: '1000px' }}>
          {titleChars.map((char, i) => (
            <span
              key={i}
              className="title-char"
              style={{ opacity: 0, display: 'inline-block', transformStyle: 'preserve-3d' }}
            >
              {char}
            </span>
          ))}
        </h1>

        {/* Subtitle */}
        <p ref={subtitleRef} className="intro-subtitle" style={{ opacity: 0 }}>
          Your personal operating system for an extraordinary life
        </p>

        {/* Tagline */}
        <p ref={taglineRef} className="intro-tagline" style={{ opacity: 0 }}>
          Begin your transformation
        </p>

        {/* Scroll hint */}
        <div ref={scrollHintRef} className="intro-scroll-hint" style={{ opacity: 0 }}>
          <div className="scroll-mouse">
            <div className="scroll-wheel" />
          </div>
          <span>Scroll to begin</span>
        </div>
      </div>

      <style>{`
        .intro-content {
          position: relative;
          width: 100%;
          height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }

        /* Logo styles */
        .logo-container {
          position: relative;
          width: 200px;
          height: 200px;
          margin-bottom: 2rem;
        }

        .logo-wrapper {
          width: 100%;
          height: 100%;
        }

        .quanta-logo {
          width: 100%;
          height: 100%;
        }

        .logo-glow {
          position: absolute;
          inset: -60px;
          background: radial-gradient(
            circle,
            rgba(139, 92, 246, 0.4) 0%,
            rgba(236, 72, 153, 0.2) 40%,
            transparent 70%
          );
          border-radius: 50%;
          pointer-events: none;
          animation: logoGlowPulse 3s ease-in-out infinite;
        }

        @keyframes logoGlowPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }

        /* Title styles */
        .intro-title {
          font-size: clamp(2.5rem, 12vw, 6rem);
          font-weight: 800;
          color: #a855f7; /* Fallback color */
          background: linear-gradient(
            135deg,
            #ffffff 0%,
            #a855f7 40%,
            #ec4899 70%,
            #f59e0b 100%
          );
          background-size: 300% 300%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 1rem;
          animation: titleGradient 8s ease infinite;
          text-align: center;
        }

        .title-char {
          display: inline-block;
          will-change: transform, opacity;
        }

        @keyframes titleGradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        /* Subtitle */
        .intro-subtitle {
          font-size: clamp(1rem, 3vw, 1.35rem);
          color: rgba(255, 255, 255, 0.7);
          text-align: center;
          max-width: 550px;
          line-height: 1.7;
          margin-bottom: 1.5rem;
        }

        /* Tagline */
        .intro-tagline {
          font-size: 1rem;
          color: rgba(168, 85, 247, 0.8);
          font-weight: 500;
          text-transform: uppercase;
          margin-bottom: 3rem;
        }

        /* Scroll hint */
        .intro-scroll-hint {
          position: absolute;
          bottom: 3rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
          color: rgba(255, 255, 255, 0.5);
          font-size: 0.85rem;
          letter-spacing: 0.05em;
        }

        .scroll-mouse {
          width: 24px;
          height: 40px;
          border: 2px solid rgba(139, 92, 246, 0.5);
          border-radius: 12px;
          position: relative;
        }

        .scroll-wheel {
          position: absolute;
          left: 50%;
          top: 8px;
          transform: translateX(-50%);
          width: 4px;
          height: 8px;
          background: rgba(139, 92, 246, 0.6);
          border-radius: 2px;
          animation: scrollWheelBounce 2s ease-in-out infinite;
        }

        @keyframes scrollWheelBounce {
          0%, 100% { opacity: 1; transform: translateX(-50%) translateY(0); }
          50% { opacity: 0.3; transform: translateX(-50%) translateY(12px); }
        }

        @media (max-width: 640px) {
          .intro-content {
            padding: 1.5rem;
            padding-right: 2rem; /* Space for progress dots */
          }

          .logo-container {
            width: 120px;
            height: 120px;
            margin-bottom: 1rem;
          }

          .logo-glow {
            inset: -30px;
          }

          .intro-title {
            font-size: clamp(2rem, 14vw, 3rem);
            margin-bottom: 0.75rem;
          }

          .intro-subtitle {
            font-size: 0.9rem;
            padding: 0 0.5rem;
            margin-bottom: 1rem;
            line-height: 1.5;
          }

          .intro-tagline {
            font-size: 0.75rem;
            letter-spacing: 0.1em;
            margin-bottom: 2rem;
          }

          .intro-scroll-hint {
            bottom: 2rem;
            font-size: 0.75rem;
          }

          .scroll-mouse {
            width: 20px;
            height: 32px;
          }
        }

        @media (max-width: 380px) {
          .intro-content {
            padding: 1rem;
            padding-right: 1.5rem;
          }

          .logo-container {
            width: 100px;
            height: 100px;
            margin-bottom: 0.75rem;
          }

          .intro-title {
            font-size: 2rem;
          }

          .intro-subtitle {
            font-size: 0.85rem;
          }

          .intro-tagline {
            font-size: 0.7rem;
          }
        }
      `}</style>
    </section>
  );
}
