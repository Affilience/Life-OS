'use client';

import { useEffect, useState, useRef } from 'react';
import { animate } from 'animejs';

interface LoadingScreenProps {
  onComplete: () => void;
  onLogoReady?: () => void;
}

export function LoadingScreen({ onComplete, onLogoReady }: LoadingScreenProps) {
  const [phase, setPhase] = useState<'drawing' | 'text' | 'hold' | 'transition' | 'complete'>('drawing');
  const logoRef = useRef<HTMLImageElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const logoContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!logoRef.current || !glowRef.current) return;

    const logo = logoRef.current;
    const glow = glowRef.current;

    // Set initial state
    logo.style.opacity = '0';
    logo.style.transform = 'scale(0.8)';
    glow.style.opacity = '0';
    glow.style.transform = 'scale(0.5)';

    // Animation sequence
    const runAnimations = async () => {
      // Phase 1: Glow appears and expands
      animate(glow, {
        opacity: [0, 0.6],
        scale: [0.5, 1.2],
        duration: 600,
        easing: 'easeOutQuad',
      });

      await new Promise(r => setTimeout(r, 200));

      // Phase 2: Logo fades in and scales up
      animate(logo, {
        opacity: [0, 1],
        scale: [0.8, 1],
        duration: 800,
        easing: 'easeOutBack',
      });

      await new Promise(r => setTimeout(r, 400));

      // Phase 3: Glow pulses
      animate(glow, {
        opacity: [0.6, 0.3, 0.5],
        scale: [1.2, 1.0, 1.1],
        duration: 1000,
        easing: 'easeInOutQuad',
      });

      await new Promise(r => setTimeout(r, 400));

      // Phase 4: Show text
      setPhase('text');
    };

    runAnimations();
  }, []);

  // Text animation
  useEffect(() => {
    if (phase !== 'text' || !textRef.current) return;

    const letters = textRef.current.querySelectorAll('.letter');
    const lettersArray = Array.from(letters);

    lettersArray.forEach((letter, i) => {
      animate(letter, {
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 500,
        delay: i * 60,
        easing: 'easeOutExpo',
      });
    });

    // After text animates, hold briefly then transition
    setTimeout(() => {
      setPhase('hold');
      onLogoReady?.();
    }, 700);
  }, [phase, onLogoReady]);

  // Hold phase - wait a moment then start transition
  useEffect(() => {
    if (phase !== 'hold') return;

    const timer = setTimeout(() => {
      setPhase('transition');
    }, 400);

    return () => clearTimeout(timer);
  }, [phase]);

  // Transition animation - background fades, logo stays
  useEffect(() => {
    if (phase !== 'transition' || !containerRef.current) return;

    // Fade out background and text, keep logo visible
    const background = containerRef.current;
    const text = textRef.current;
    const tagline = containerRef.current.querySelector('.tagline');

    // Fade out text and tagline
    if (text) {
      animate(text, {
        opacity: [1, 0],
        translateY: [0, -20],
        duration: 400,
        easing: 'easeInQuad',
      });
    }

    if (tagline) {
      animate(tagline, {
        opacity: [1, 0],
        duration: 300,
        easing: 'easeInQuad',
      });
    }

    // Fade out background
    animate(background, {
      backgroundColor: ['#0c0a10', 'rgba(12, 10, 16, 0)'],
      duration: 600,
      delay: 200,
      easing: 'easeInOutQuad',
    });

    // Scale and move logo up slightly, then signal completion
    if (logoContainerRef.current) {
      animate(logoContainerRef.current, {
        scale: [1, 0.6],
        translateY: [0, -80],
        duration: 800,
        delay: 200,
        easing: 'easeInOutQuad',
        complete: () => {
          setPhase('complete');
          onComplete();
        },
      });
    }
  }, [phase, onComplete]);

  if (phase === 'complete') return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100] bg-[#0c0a10] flex flex-col items-center justify-center pointer-events-none"
    >
      {/* Logo Container - animates separately */}
      <div ref={logoContainerRef} className="flex flex-col items-center">
        {/* Glow effect behind logo */}
        <div className="relative">
          <div
            ref={glowRef}
            className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-500/40 via-purple-500/30 to-cyan-500/40 blur-3xl"
            style={{ width: '160px', height: '160px', left: '-20px', top: '0' }}
          />
          {/* Logo Image */}
          <img
            ref={logoRef}
            src="/logo.png"
            alt="Ascnd Logo"
            className="relative w-32 h-auto md:w-36 drop-shadow-[0_0_25px_rgba(167,139,250,0.5)]"
          />
        </div>
      </div>

      {/* Brand text */}
      <div
        ref={textRef}
        className="mt-8 text-2xl md:text-3xl font-bold tracking-wider"
      >
        {'Ascnd'.split('').map((char, i) => (
          <span
            key={i}
            className="letter inline-block opacity-0"
            style={{ color: '#fff' }}
          >
            {char}
          </span>
        ))}
      </div>

      {/* Subtle tagline */}
      <p className="tagline mt-3 text-white/40 text-sm tracking-wide opacity-0 animate-fade-in-delayed">
        Level up your life
      </p>

      <style jsx>{`
        @keyframes fade-in-delayed {
          0%, 70% { opacity: 0; }
          100% { opacity: 1; }
        }
        .animate-fade-in-delayed {
          animation: fade-in-delayed 1.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
