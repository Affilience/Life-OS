'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { animate } from 'animejs';

interface LoadingScreenProps {
  onComplete: () => void;
  onLogoReady?: () => void;
}

export function LoadingScreen({ onComplete, onLogoReady }: LoadingScreenProps) {
  const [phase, setPhase] = useState<'drawing' | 'text' | 'hold' | 'transition' | 'complete'>('drawing');
  const svgRef = useRef<SVGSVGElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const logoContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = svgRef.current;
    const logoA = svg.querySelector('#logo-a') as SVGPathElement;
    const logoOrbit = svg.querySelector('#logo-orbit') as SVGEllipseElement;
    const logoDot = svg.querySelector('#logo-dot') as SVGCircleElement;
    const logoAccent = svg.querySelector('#logo-accent') as SVGPathElement;

    if (!logoA || !logoOrbit || !logoDot || !logoAccent) return;

    // Get path lengths for stroke animation
    const aLength = logoA.getTotalLength();
    const orbitLength = logoOrbit.getTotalLength();
    const accentLength = logoAccent.getTotalLength();

    // Set initial state - paths hidden
    logoA.style.strokeDasharray = `${aLength}`;
    logoA.style.strokeDashoffset = `${aLength}`;
    logoOrbit.style.strokeDasharray = `${orbitLength}`;
    logoOrbit.style.strokeDashoffset = `${orbitLength}`;
    logoAccent.style.strokeDasharray = `${accentLength}`;
    logoAccent.style.strokeDashoffset = `${accentLength}`;
    logoDot.style.opacity = '0';
    logoDot.style.transform = 'scale(0)';

    // Animation sequence
    const runAnimations = async () => {
      // Phase 1: Draw the A
      animate(logoA, {
        strokeDashoffset: [aLength, 0],
        duration: 800,
        easing: 'easeInOutQuad',
      });

      await new Promise(r => setTimeout(r, 400));

      // Phase 2: Draw the orbit
      animate(logoOrbit, {
        strokeDashoffset: [orbitLength, 0],
        duration: 1000,
        easing: 'easeInOutQuad',
      });

      await new Promise(r => setTimeout(r, 300));

      // Phase 3: Draw accent and show dot
      animate(logoAccent, {
        strokeDashoffset: [accentLength, 0],
        duration: 400,
        easing: 'easeOutQuad',
      });

      animate(logoDot, {
        opacity: [0, 1],
        scale: [0, 1],
        duration: 400,
        easing: 'easeOutBack',
      });

      await new Promise(r => setTimeout(r, 600));

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
        {/* Logo SVG */}
        <svg
          ref={svgRef}
          viewBox="0 0 200 200"
          className="w-32 h-32 md:w-40 md:h-40"
        >
          <defs>
            <linearGradient id="loadingLogoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#a78bfa"/>
              <stop offset="100%" stopColor="#22d3ee"/>
            </linearGradient>
          </defs>

          {/* Main A shape */}
          <path
            id="logo-a"
            d="M50 140 L100 40 L150 140 M70 105 L130 105"
            fill="none"
            stroke="url(#loadingLogoGradient)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Orbital ring around the A */}
          <ellipse
            id="logo-orbit"
            cx="100"
            cy="100"
            rx="70"
            ry="30"
            fill="none"
            stroke="url(#loadingLogoGradient)"
            strokeWidth="3"
            transform="rotate(-30 100 100)"
          />

          {/* Accent dot on orbit */}
          <circle
            id="logo-dot"
            cx="165"
            cy="85"
            r="6"
            fill="#22d3ee"
          />

          {/* Inner corner accent */}
          <path
            id="logo-accent"
            d="M75 125 L75 115 L85 115"
            fill="none"
            stroke="#22d3ee"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Brand text */}
      <div
        ref={textRef}
        className="mt-8 text-2xl md:text-3xl font-bold tracking-wider"
      >
        {'Ascnt'.split('').map((char, i) => (
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
