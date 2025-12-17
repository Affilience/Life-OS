/**
 * ImmersiveIdentity - Enter Your Name
 *
 * Scroll-driven identity section with GSAP timeline pattern.
 * Requires user input before continuing.
 *
 * BUILD PHASE (0-0.35):
 * - Title and subtitle emerge
 * - Input field reveals with glow
 *
 * HOLD PHASE (0.35-0.65):
 * - Scroll is locked while user enters name
 *
 * DISMANTLE PHASE (0.65-1.0):
 * - Elements scatter and fade out
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { feedback } from '../../../../services/microInteractions';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function ImmersiveIdentity({
  sectionId,
  onComplete,
  onLockScroll,
  onSectionEnter,
  username,
  setUsername,
}) {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const inputWrapperRef = useRef(null);
  const inputRef = useRef(null);
  const greetingRef = useRef(null);
  const buttonRef = useRef(null);
  const [localName, setLocalName] = useState(username || '');
  const [isFocused, setIsFocused] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);

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
                { opacity: 0, y: 70, scale: 0.9, filter: 'blur(10px)' },
                { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: 0.6, ease: 'power3.out' },
                0
              );
            }

            if (subtitleRef.current) {
              entranceTl.fromTo(subtitleRef.current,
                { opacity: 0, y: 35 },
                { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' },
                0.2
              );
            }

            if (inputWrapperRef.current) {
              entranceTl.fromTo(inputWrapperRef.current,
                { opacity: 0, y: 50, scale: 0.95 },
                { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'back.out(1.4)' },
                0.35
              );

              // Focus input after animation
              setTimeout(() => {
                inputRef.current?.focus();
              }, 900);
            }

            if (greetingRef.current) {
              entranceTl.fromTo(greetingRef.current,
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' },
                0.55
              );
            }

            if (buttonRef.current) {
              entranceTl.fromTo(buttonRef.current,
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' },
                0.65
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
          if (!entry.isIntersecting && entry.boundingClientRect.top < 0 && !hasExited) {
            hasExited = true;

            // Play exit animations
            const exitTl = gsap.timeline();

            if (buttonRef.current) {
              exitTl.to(buttonRef.current, { opacity: 0, y: -20, duration: 0.3 }, 0);
            }

            if (greetingRef.current) {
              exitTl.to(greetingRef.current, { opacity: 0, y: -30, duration: 0.3 }, 0.05);
            }

            if (inputWrapperRef.current) {
              exitTl.to(inputWrapperRef.current, { opacity: 0, y: -40, scale: 0.95, duration: 0.35 }, 0.1);
            }

            if (subtitleRef.current) {
              exitTl.to(subtitleRef.current, { opacity: 0, y: -50, duration: 0.3 }, 0.15);
            }

            if (titleRef.current) {
              exitTl.to(titleRef.current, { opacity: 0, y: -60, scale: 0.9, duration: 0.35 }, 0.2);
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

            if (inputWrapperRef.current) {
              restoreTl.to(inputWrapperRef.current, { opacity: 1, y: 0, scale: 1, duration: 0.4 }, 0.15);
            }

            if (greetingRef.current) {
              restoreTl.to(greetingRef.current, { opacity: 1, y: 0, duration: 0.3 }, 0.25);
            }

            if (buttonRef.current) {
              restoreTl.to(buttonRef.current, { opacity: 1, y: 0, duration: 0.3 }, 0.3);
            }
          }
        });
      },
      { threshold: 0.1 }
    );

    exitObserver.observe(section);

    return () => exitObserver.disconnect();
  }, []);

  // Handle input change
  const handleInputChange = useCallback((e) => {
    const value = e.target.value;
    setLocalName(value);
    feedback.buttonPress();
  }, []);

  // Handle continue
  const handleContinue = useCallback(() => {
    if (localName.trim().length < 2) return;

    setUsername(localName.trim());
    setHasCompleted(true);
    feedback.taskComplete();

    // Animate greeting
    if (greetingRef.current) {
      gsap.fromTo(greetingRef.current,
        { scale: 1 },
        { scale: 1.1, duration: 0.2, yoyo: true, repeat: 1, ease: 'back.out(1.7)' }
      );
    }

    setTimeout(() => {
      onLockScrollRef.current?.(false);
      setTimeout(() => onCompleteRef.current?.(), 500);
    }, 600);
  }, [localName, setUsername]);

  // Handle key press
  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter') {
      handleContinue();
    }
  }, [handleContinue]);

  // Split greeting for animation
  const greeting = localName ? `Hello, ${localName}` : '';

  return (
    <section
      ref={sectionRef}
      className="immersive-section relative min-h-screen overflow-hidden"
    >
      <div className="identity-content">
        {/* Title */}
        <h2 ref={titleRef} className="identity-title" style={{ opacity: 0 }}>
          What should we <span className="gradient-text">call you?</span>
        </h2>

        {/* Subtitle */}
        <p ref={subtitleRef} className="identity-subtitle" style={{ opacity: 0 }}>
          Your name will appear throughout your journey
        </p>

        {/* Input container */}
        <div ref={inputWrapperRef} className="identity-input-wrapper" style={{ opacity: 0 }}>
          {/* Animated border */}
          <div className={`input-border ${isFocused ? 'focused' : ''}`} />

          {/* Glow effect */}
          <div
            className="input-glow"
            style={{ opacity: isFocused ? 0.6 : 0.2 }}
          />

          {/* Input field */}
          <input
            ref={inputRef}
            type="text"
            className="identity-input"
            value={localName}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Enter your name"
            maxLength={20}
          />

          {/* Character count */}
          <span className="char-count">{localName.length}/20</span>
        </div>

        {/* Greeting preview */}
        <div
          ref={greetingRef}
          className="identity-greeting"
          style={{ opacity: 0, minHeight: '2.5rem' }}
        >
          {greeting && greeting.split('').map((char, i) => (
            <span key={i} className="greeting-char">
              {char === ' ' ? '\u00A0' : char}
            </span>
          ))}
        </div>

        {/* Continue button */}
        <button
          ref={buttonRef}
          className={`identity-continue ${localName.trim().length >= 2 ? 'visible' : ''}`}
          onClick={handleContinue}
          disabled={localName.trim().length < 2}
          style={{ opacity: 0 }}
        >
          <span>Continue</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      <style>{`
        .identity-content {
          position: relative;
          width: 100%;
          height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          max-width: 600px;
          margin: 0 auto;
        }

        .identity-title {
          font-size: clamp(1.75rem, 5vw, 2.5rem);
          font-weight: 700;
          color: white;
          text-align: center;
          margin-bottom: 0.75rem;
        }

        .gradient-text {
          background: linear-gradient(135deg, #a855f7 0%, #ec4899 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .identity-subtitle {
          font-size: 1rem;
          color: rgba(255, 255, 255, 0.5);
          text-align: center;
          margin-bottom: 3rem;
        }

        .identity-input-wrapper {
          position: relative;
          width: 100%;
          max-width: 400px;
          margin-bottom: 2rem;
        }

        .input-border {
          position: absolute;
          inset: -3px;
          border-radius: 18px;
          background: linear-gradient(135deg, #8b5cf6, #ec4899, #8b5cf6);
          background-size: 200% 200%;
          opacity: 0.3;
          transition: opacity 0.3s ease;
          z-index: 0;
        }

        .input-border.focused {
          opacity: 1;
          animation: borderGlow 3s ease infinite;
        }

        @keyframes borderGlow {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        .input-glow {
          position: absolute;
          inset: -30px;
          background: radial-gradient(
            ellipse at center,
            rgba(139, 92, 246, 0.3) 0%,
            transparent 70%
          );
          pointer-events: none;
          transition: opacity 0.3s ease;
          z-index: 0;
        }

        .identity-input {
          position: relative;
          width: 100%;
          padding: 1.25rem 1.5rem;
          font-size: 1.25rem;
          font-weight: 500;
          background: rgba(15, 10, 30, 0.8);
          border: none;
          border-radius: 16px;
          color: white;
          text-align: center;
          outline: none;
          z-index: 1;
          transition: background 0.3s ease;
        }

        .identity-input:focus {
          background: rgba(139, 92, 246, 0.15);
        }

        .identity-input::placeholder {
          color: rgba(255, 255, 255, 0.3);
        }

        .char-count {
          position: absolute;
          right: 1rem;
          bottom: -1.5rem;
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.3);
          z-index: 2;
        }

        .identity-greeting {
          font-size: 1.5rem;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.8);
          margin-bottom: 2rem;
        }

        .greeting-char {
          display: inline-block;
        }

        .identity-continue {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 2.5rem;
          font-size: 1.1rem;
          font-weight: 600;
          background: linear-gradient(135deg, #8b5cf6, #a855f7);
          border: none;
          border-radius: 14px;
          color: white;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          opacity: 0.3;
          pointer-events: none;
        }

        .identity-continue.visible {
          opacity: 1;
          pointer-events: auto;
        }

        .identity-continue:hover {
          transform: translateY(-3px);
          box-shadow: 0 15px 30px rgba(139, 92, 246, 0.4);
        }

        .identity-continue:active {
          transform: translateY(0);
        }

        .identity-continue svg {
          transition: transform 0.3s ease;
        }

        .identity-continue:hover svg {
          transform: translateX(4px);
        }

        @media (max-width: 640px) {
          .identity-content {
            padding: 1.5rem;
            padding-right: 2rem;
            padding-top: 3rem;
          }

          .identity-title {
            font-size: clamp(1.5rem, 8vw, 2rem);
            margin-bottom: 0.5rem;
          }

          .identity-subtitle {
            font-size: 0.85rem;
            margin-bottom: 2rem;
          }

          .identity-input-wrapper {
            max-width: 100%;
          }

          .identity-input {
            font-size: 1rem;
            padding: 0.875rem 1rem;
            border-radius: 12px;
          }

          .identity-avatar-preview {
            width: 100px;
            height: 100px;
            margin-bottom: 1rem;
          }

          .preview-glow {
            inset: -20px;
          }

          .identity-hint {
            font-size: 0.8rem;
            margin-top: 1rem;
          }

          .identity-continue {
            padding: 0.875rem 1.5rem;
            font-size: 0.9rem;
            margin-top: 1.5rem;
          }
        }

        @media (max-width: 380px) {
          .identity-content {
            padding: 1rem;
            padding-right: 1.5rem;
            padding-top: 2.5rem;
          }

          .identity-title {
            font-size: 1.4rem;
          }

          .identity-input {
            font-size: 0.95rem;
            padding: 0.75rem 0.875rem;
          }

          .identity-avatar-preview {
            width: 80px;
            height: 80px;
          }
        }
      `}</style>
    </section>
  );
}
