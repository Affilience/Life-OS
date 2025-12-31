/**
 * ImmersiveSkinToneSelect - Choose Your Avatar Style
 *
 * Simple swipeable avatar selector - no mention of ethnicity.
 * Just 3 avatar variants to swipe through and choose.
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { feedback } from '../../../../services/microInteractions';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// Avatar style variants (internal IDs only, not shown to user)
const AVATAR_VARIANTS = [
  { id: 'white', glowColor: 'rgba(139, 92, 246, 0.4)' },
  { id: 'brown', glowColor: 'rgba(236, 72, 153, 0.4)' },
  { id: 'black', glowColor: 'rgba(59, 130, 246, 0.4)' },
];

export default function ImmersiveSkinToneSelect({
  sectionId,
  onComplete,
  onLockScroll,
  onSectionEnter,
  characterGender,
  skinTone,
  setSkinTone,
}) {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const carouselRef = useRef(null);
  const promptRef = useRef(null);
  const [hasSelected, setHasSelected] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(
    skinTone ? AVATAR_VARIANTS.findIndex(v => v.id === skinTone) : 0
  );
  const [isInView, setIsInView] = useState(false);

  // Touch/swipe state
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const minSwipeDistance = 50;

  // Store callbacks in refs
  const onCompleteRef = useRef(onComplete);
  const onLockScrollRef = useRef(onLockScroll);
  const onSectionEnterRef = useRef(onSectionEnter);
  useEffect(() => {
    onCompleteRef.current = onComplete;
    onLockScrollRef.current = onLockScroll;
    onSectionEnterRef.current = onSectionEnter;
  }, [onComplete, onLockScroll, onSectionEnter]);

  // Get avatar path based on gender and variant
  const getAvatarPath = (variantId) => {
    const gender = characterGender || 'male';
    const prefix = gender === 'female' ? 'heroine' : 'hero';

    if (variantId === 'white') {
      // Use the diverse folder white variants for consistency
      return `/assets/avatar/diverse/${prefix}_stage_10_white.png`;
    }
    return `/assets/avatar/diverse/${prefix}_stage_10_${variantId}.png`;
  };

  // Current variant
  const currentVariant = AVATAR_VARIANTS[currentIndex];

  // Navigation
  const goToVariant = useCallback((index) => {
    const newIndex = Math.max(0, Math.min(AVATAR_VARIANTS.length - 1, index));
    setCurrentIndex(newIndex);
    feedback.buttonPress();
  }, []);

  const nextVariant = useCallback(() => {
    if (currentIndex < AVATAR_VARIANTS.length - 1) {
      goToVariant(currentIndex + 1);
    }
  }, [currentIndex, goToVariant]);

  const prevVariant = useCallback(() => {
    if (currentIndex > 0) {
      goToVariant(currentIndex - 1);
    }
  }, [currentIndex, goToVariant]);

  // Touch handlers for swipe
  const onTouchStart = useCallback((e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  }, []);

  const onTouchMove = useCallback((e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  }, []);

  const onTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > minSwipeDistance) {
      nextVariant();
    } else if (distance < -minSwipeDistance) {
      prevVariant();
    }
  }, [touchStart, touchEnd, nextVariant, prevVariant]);

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
                { opacity: 0, y: 80, scale: 0.9, filter: 'blur(10px)' },
                { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: 0.6, ease: 'power3.out' },
                0
              );
            }

            if (subtitleRef.current) {
              entranceTl.fromTo(subtitleRef.current,
                { opacity: 0, y: 40 },
                { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' },
                0.2
              );
            }

            if (carouselRef.current) {
              entranceTl.fromTo(carouselRef.current,
                { opacity: 0, scale: 0.8 },
                { opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.2)' },
                0.3
              );
            }

            if (promptRef.current) {
              entranceTl.fromTo(promptRef.current,
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' },
                0.5
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

  // Handle avatar selection (confirm current choice)
  const handleSelect = useCallback(() => {
    const selectedVariant = AVATAR_VARIANTS[currentIndex];
    setSkinTone(selectedVariant.id);
    setHasSelected(true);
    feedback.taskComplete();

    // Animate selection
    if (carouselRef.current) {
      gsap.to(carouselRef.current, {
        scale: 1.05,
        duration: 0.2,
        ease: 'power2.out',
        yoyo: true,
        repeat: 1,
      });
    }

    // Unlock scroll and complete after animation
    setTimeout(() => {
      onLockScrollRef.current?.(false);
      setTimeout(() => onCompleteRef.current?.(), 400);
    }, 600);
  }, [currentIndex, setSkinTone]);

  return (
    <section
      ref={sectionRef}
      className="immersive-section relative min-h-screen overflow-hidden"
    >
      <div className="avatar-select-content">
        {/* Title */}
        <h2 ref={titleRef} className="avatar-select-title" style={{ opacity: 0 }}>
          Choose Your <span className="gradient-text">Avatar</span>
        </h2>

        {/* Subtitle */}
        <p ref={subtitleRef} className="avatar-select-subtitle" style={{ opacity: 0 }}>
          Swipe to browse, tap to select
        </p>

        {/* Avatar Carousel */}
        <div
          ref={carouselRef}
          className="avatar-carousel"
          style={{ opacity: 0 }}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {/* Navigation Arrows */}
          <button
            className="carousel-arrow carousel-arrow-left"
            onClick={prevVariant}
            disabled={currentIndex === 0}
            aria-label="Previous"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          <button
            className="carousel-arrow carousel-arrow-right"
            onClick={nextVariant}
            disabled={currentIndex === AVATAR_VARIANTS.length - 1}
            aria-label="Next"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* Avatar Display */}
          <div className="avatar-display">
            <div className="avatar-glow" style={{
              background: `radial-gradient(circle, ${currentVariant.glowColor} 0%, transparent 70%)`
            }} />
            <img
              src={getAvatarPath(currentVariant.id)}
              alt="Avatar"
              className="avatar-sprite"
              style={{ imageRendering: 'pixelated' }}
            />
          </div>

          {/* Dot Indicators */}
          <div className="carousel-dots">
            {AVATAR_VARIANTS.map((_, index) => (
              <button
                key={index}
                className={`carousel-dot ${index === currentIndex ? 'active' : ''}`}
                onClick={() => goToVariant(index)}
                aria-label={`Avatar ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Select Button */}
        <button
          ref={promptRef}
          className="select-button"
          onClick={handleSelect}
          style={{ opacity: 0 }}
          disabled={hasSelected}
        >
          {hasSelected ? '✓ Selected!' : 'Choose This Avatar'}
        </button>
      </div>

      <style>{`
        .avatar-select-content {
          position: relative;
          width: 100%;
          height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          max-width: 500px;
          margin: 0 auto;
        }

        .avatar-select-title {
          font-size: clamp(1.75rem, 5vw, 2.5rem);
          font-weight: 700;
          color: white;
          text-align: center;
          margin-bottom: 0.5rem;
        }

        .gradient-text {
          background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 50%, #3b82f6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .avatar-select-subtitle {
          font-size: 1rem;
          color: rgba(255, 255, 255, 0.5);
          text-align: center;
          margin-bottom: 2rem;
        }

        .avatar-carousel {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
          width: 100%;
          touch-action: pan-y;
        }

        .carousel-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-80%);
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          z-index: 10;
        }

        .carousel-arrow:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.2);
          transform: translateY(-80%) scale(1.1);
        }

        .carousel-arrow:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .carousel-arrow-left {
          left: 0;
        }

        .carousel-arrow-right {
          right: 0;
        }

        .avatar-display {
          position: relative;
          width: 200px;
          height: 200px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .avatar-glow {
          position: absolute;
          inset: -40px;
          border-radius: 50%;
          z-index: 1;
          transition: all 0.3s ease;
          animation: glowPulse 3s ease-in-out infinite;
        }

        @keyframes glowPulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }

        .avatar-sprite {
          position: relative;
          width: 100%;
          height: 100%;
          object-fit: contain;
          z-index: 2;
          transition: transform 0.3s ease;
        }

        .carousel-dots {
          display: flex;
          gap: 12px;
          justify-content: center;
        }

        .carousel-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.3);
          border: none;
          padding: 0;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .carousel-dot:hover {
          background: rgba(255, 255, 255, 0.5);
        }

        .carousel-dot.active {
          background: linear-gradient(135deg, #8b5cf6, #ec4899);
          transform: scale(1.3);
          box-shadow: 0 0 10px rgba(139, 92, 246, 0.5);
        }

        .select-button {
          margin-top: 2rem;
          padding: 1rem 2.5rem;
          font-size: 1.1rem;
          font-weight: 600;
          background: linear-gradient(135deg, #8b5cf6, #a855f7);
          border: none;
          border-radius: 14px;
          color: white;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .select-button:hover:not(:disabled) {
          transform: translateY(-3px);
          box-shadow: 0 15px 30px rgba(139, 92, 246, 0.4);
        }

        .select-button:disabled {
          background: linear-gradient(135deg, #10b981, #059669);
          cursor: default;
        }

        @media (max-width: 640px) {
          .avatar-select-content {
            padding: 1.5rem;
          }

          .avatar-select-title {
            font-size: clamp(1.5rem, 6vw, 2rem);
          }

          .avatar-select-subtitle {
            font-size: 0.9rem;
            margin-bottom: 1.5rem;
          }

          .avatar-display {
            width: 160px;
            height: 160px;
          }

          .avatar-glow {
            inset: -30px;
          }

          .carousel-arrow {
            width: 36px;
            height: 36px;
          }

          .carousel-arrow svg {
            width: 20px;
            height: 20px;
          }

          .carousel-dots {
            gap: 8px;
          }

          .carousel-dot {
            width: 6px;
            height: 6px;
          }

          .carousel-dot.active {
            transform: scale(1.2);
            box-shadow: 0 0 6px rgba(139, 92, 246, 0.4);
          }

          .select-button {
            padding: 0.875rem 2rem;
            font-size: 1rem;
            margin-top: 1.5rem;
          }
        }

        @media (max-width: 480px) {
          .carousel-dots {
            gap: 6px;
          }

          .carousel-dot {
            width: 5px;
            height: 5px;
          }

          .carousel-dot.active {
            transform: scale(1.15);
            box-shadow: 0 0 4px rgba(139, 92, 246, 0.4);
          }
        }

        @media (max-width: 380px) {
          .avatar-display {
            width: 140px;
            height: 140px;
          }

          .carousel-arrow {
            width: 32px;
            height: 32px;
          }

          .carousel-dots {
            gap: 5px;
          }

          .carousel-dot {
            width: 4px;
            height: 4px;
          }
        }
      `}</style>
    </section>
  );
}
