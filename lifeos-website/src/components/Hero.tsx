'use client';

import { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { animate } from 'animejs';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export interface HeroHandle {
  animateIn: () => void;
}

interface HeroProps {
  showInitialAnimation?: boolean;
}

export const Hero = forwardRef<HeroHandle, HeroProps>(function Hero({ showInitialAnimation = true }, ref) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  const [hasAnimatedIn, setHasAnimatedIn] = useState(false);
  const [isReady, setIsReady] = useState(false);

  // Expose animateIn method for external triggering
  useImperativeHandle(ref, () => ({
    animateIn: () => {
      setIsReady(true);
    },
  }));

  // Entry animations with anime.js - triggered when ready
  useEffect(() => {
    if (!isReady || hasAnimatedIn || !headlineRef.current) return;

    const runEntryAnimations = () => {
      // First, animate the hero logo in
      if (logoRef.current) {
        animate(logoRef.current, {
          opacity: [0, 1],
          scale: [0.6, 1],
          duration: 800,
          easing: 'easeOutExpo',
        });
      }

      const headline = headlineRef.current;
      if (!headline) return;

      const lines = headline.querySelectorAll('.headline-line');

      // Split text into letters
      lines.forEach((line) => {
        const text = line.textContent || '';
        line.innerHTML = '';
        // Make parent visible now that we're animating
        (line as HTMLElement).style.opacity = '1';

        text.split('').forEach((char) => {
          const span = document.createElement('span');
          span.textContent = char === ' ' ? '\u00A0' : char;
          span.style.display = 'inline-block';
          span.style.opacity = '0';
          span.style.transform = 'translateY(50px)';
          span.className = 'letter';
          line.appendChild(span);
        });
      });

      // All animations start together with delay for logo
      const baseDelay = 400;

      // Headline letters
      const allLetters = headline.querySelectorAll('.letter');
      const lettersArray = Array.from(allLetters);
      lettersArray.forEach((letter, i) => {
        animate(letter, {
          opacity: [0, 1],
          translateY: [50, 0],
          duration: 1000,
          delay: baseDelay + 100 + i * 20,
          easing: 'easeOutExpo',
        });
      });

      // Subtitle
      if (subtitleRef.current) {
        animate(subtitleRef.current, {
          opacity: [0, 1],
          translateY: [40, 0],
          duration: 1000,
          delay: baseDelay + 300,
          easing: 'easeOutExpo',
        });
      }

      // CTA buttons
      if (ctaRef.current) {
        const buttons = ctaRef.current.querySelectorAll('.cta-button');
        const buttonsArray = Array.from(buttons);
        buttonsArray.forEach((button, i) => {
          animate(button, {
            opacity: [0, 1],
            translateY: [30, 0],
            duration: 800,
            delay: baseDelay + 500 + i * 80,
            easing: 'easeOutExpo',
          });
        });
      }

      setTimeout(() => setHasAnimatedIn(true), 2000);
    };

    const timer = setTimeout(runEntryAnimations, 50);
    return () => clearTimeout(timer);
  }, [isReady, hasAnimatedIn]);

  // Auto-start if showInitialAnimation is true (for non-loading-screen case)
  useEffect(() => {
    if (showInitialAnimation && !isReady) {
      setIsReady(true);
    }
  }, [showInitialAnimation, isReady]);

  // GSAP scroll-driven dismantling animation with pinning
  // Using a single timeline as per GSAP best practices
  useEffect(() => {
    if (!sectionRef.current || typeof window === 'undefined' || !hasAnimatedIn) return;

    const section = sectionRef.current;
    const isMobile = window.innerWidth < 768;

    // On mobile, skip pinned scrolling - animations still work but no pinning
    if (isMobile) {
      return;
    }

    const ctx = gsap.context(() => {
      // Create a single timeline with pin - this is the correct approach
      // All child animations go into this timeline
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=100%',
          scrub: 1.5, // Smoother 1.5-second catch-up (research recommends 1-2)
          pin: true,
          pinSpacing: false, // No gap - flows directly into next section
          anticipatePin: 1,
        },
      });

      // Get all elements we'll animate
      const textLines = headlineRef.current?.querySelectorAll('.headline-line');
      const logoSvg = logoRef.current?.querySelector('svg');
      const logoL = logoSvg?.querySelector('#hero-logo-l');
      const logoOrbit = logoSvg?.querySelector('#hero-logo-orbit');
      const logoDot = logoSvg?.querySelector('#hero-logo-dot');
      const logoAccent = logoSvg?.querySelector('#hero-logo-accent');
      const buttons = ctaRef.current?.querySelectorAll('.cta-button');
      const scrollIndicator = section.querySelector('.scroll-indicator');

      // All animations happen simultaneously (position 0) but with different distances
      // This creates the parallax/dismantling effect

      // Scroll indicator fades first
      if (scrollIndicator) {
        tl.to(scrollIndicator, {
          opacity: 0,
          y: 20,
          duration: 0.3,
        }, 0);
      }

      // Text lines - staggered upward movement
      if (textLines && textLines[0]) {
        tl.to(textLines[0], {
          y: -400,
          x: -80,
          opacity: 0,
          duration: 1,
        }, 0);
      }
      if (textLines && textLines[1]) {
        tl.to(textLines[1], {
          y: -280,
          opacity: 0,
          duration: 1,
        }, 0);
      }
      if (textLines && textLines[2]) {
        tl.to(textLines[2], {
          y: -180,
          x: 40,
          opacity: 0,
          duration: 1,
        }, 0);
      }

      // Subtitle
      if (subtitleRef.current) {
        tl.to(subtitleRef.current, {
          y: -150,
          opacity: 0,
          duration: 1,
        }, 0);
      }

      // CTA buttons fly apart
      if (buttons && buttons[0]) {
        tl.to(buttons[0], {
          y: -100,
          x: -120,
          opacity: 0,
          scale: 0.8,
          duration: 1,
        }, 0);
      }
      if (buttons && buttons[1]) {
        tl.to(buttons[1], {
          y: -100,
          x: 120,
          opacity: 0,
          scale: 0.8,
          duration: 1,
        }, 0);
      }

      // Logo dismantling - each piece flies in different direction
      if (logoL) {
        tl.to(logoL, {
          y: -300,
          x: -200,
          rotation: -20,
          scale: 0.6,
          opacity: 0,
          duration: 1,
        }, 0);
      }

      if (logoOrbit) {
        tl.to(logoOrbit, {
          y: -200,
          x: 300,
          rotation: 60,
          scale: 1.1,
          opacity: 0,
          duration: 1,
        }, 0);
      }

      if (logoDot) {
        tl.to(logoDot, {
          y: -500,
          x: 150,
          scale: 2,
          opacity: 0,
          duration: 1,
        }, 0);
      }

      if (logoAccent) {
        tl.to(logoAccent, {
          y: 200,
          x: -150,
          rotation: -45,
          scale: 0.4,
          opacity: 0,
          duration: 1,
        }, 0);
      }

      // Navbar animation - creative staggered explosion
      // Each nav link flies off in a unique direction
      const navbar = document.querySelector('nav');
      if (navbar) {
        const navLinks = navbar.querySelectorAll('.nav-link');
        const navCta = navbar.querySelector('a[href="/signup"]');

        // Define unique exit directions for each nav link
        // Creates a "scatter" effect like anime.js stagger with direction
        const linkExits = [
          { y: -150, x: -200, rotation: -30 },  // Features - up-left, rotate
          { y: -200, x: -50, rotation: 15 },    // Modules - up, slight rotate
          { y: -180, x: 80, rotation: -10 },    // Screenshots - up-right
          { y: -120, x: 200, rotation: 25 },    // Pricing - right, rotate
        ];

        navLinks.forEach((link, i) => {
          const exit = linkExits[i] || { y: -150, x: 0, rotation: 0 };
          tl.to(link, {
            y: exit.y,
            x: exit.x,
            rotation: exit.rotation,
            opacity: 0,
            scale: 0.5,
            duration: 1,
          }, 0.05 * i); // Slight stagger for wave effect
        });

        // CTA button - springs off to the right with elastic feel
        if (navCta) {
          tl.to(navCta, {
            y: -100,
            x: 250,
            rotation: 20,
            scale: 0.3,
            opacity: 0,
            duration: 1,
          }, 0.1);
        }

        // Whole navbar fades and slides up slightly at the end
        tl.to(navbar, {
          y: -50,
          opacity: 0,
          duration: 0.5,
        }, 0.3);
      }
    }, section);

    return () => ctx.revert();
  }, [hasAnimatedIn]);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen overflow-hidden"
    >
      {/* Animated Background Orbs - positioned away from text */}
      <motion.div
        className="absolute top-[60%] left-[15%] w-96 h-96 bg-purple-500/10 rounded-full blur-[150px] pointer-events-none"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.15, 0.1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="absolute top-[70%] right-[10%] w-80 h-80 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none"
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.1, 0.15, 0.1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 2,
        }}
      />

      <div
        ref={contentRef}
        className="container-wide relative z-10 min-h-screen flex items-center py-20"
        style={{ willChange: 'transform, opacity' }}
      >
        {/* Split Layout - Text Left, Logo Center/Right */}
        <div className="w-full flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-8">
          {/* Left Side - Text Content */}
          <div className="flex-1 text-center lg:text-left max-w-xl">
            {/* Headline */}
            <h1
              ref={headlineRef}
              className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6"
            >
              <span className="headline-line block" style={{ opacity: 0, willChange: 'transform, opacity' }}>Your Entire Life.</span>
              <span className="headline-line block gradient-text" style={{ opacity: 0, willChange: 'transform, opacity' }}>One System.</span>
              <span className="headline-line block" style={{ opacity: 0, willChange: 'transform, opacity' }}>Fully Gamified.</span>
            </h1>

            {/* Subtitle */}
            <p
              ref={subtitleRef}
              className="text-lg md:text-xl text-white/60 mb-10"
              style={{ opacity: 0 }}
            >
              Productivity, health, finances, learning, journaling — all connected.
              Earn XP, level up your avatar, unlock gear. Become who you're meant to be.
            </p>

            {/* CTA Buttons */}
            <div
              ref={ctaRef}
              className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-4"
            >
              <motion.div
                className="cta-button"
                style={{ opacity: 0 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link href="/signup" className="btn-primary text-lg px-8 py-4 inline-block">
                  Start Your Journey
                </Link>
              </motion.div>
              <motion.div
                className="cta-button"
                style={{ opacity: 0 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link href="#screenshots" className="btn-secondary text-lg px-8 py-4 inline-block">
                  See it in Action
                </Link>
              </motion.div>
            </div>
          </div>

          {/* Right Side - Large Logo */}
          <div
            ref={logoRef}
            className="flex-1 flex items-center justify-center"
            style={{ opacity: 0 }}
          >
            <svg
              viewBox="0 0 200 200"
              className="w-64 h-64 md:w-80 md:h-80 lg:w-[420px] lg:h-[420px]"
              style={{ overflow: 'visible' }}
            >
              <defs>
                <linearGradient id="heroLogoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#a78bfa"/>
                  <stop offset="100%" stopColor="#22d3ee"/>
                </linearGradient>
                <filter id="logoGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="4" result="blur"/>
                  <feMerge>
                    <feMergeNode in="blur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>

              {/* Main L shape - will move up-left */}
              <path
                id="hero-logo-l"
                d="M60 40 L60 140 L140 140"
                fill="none"
                stroke="url(#heroLogoGradient)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#logoGlow)"
                style={{ transformOrigin: 'center', transformBox: 'fill-box' }}
              />

              {/* Orbital ring around the L - will move up-right and rotate */}
              <ellipse
                id="hero-logo-orbit"
                cx="100"
                cy="100"
                rx="70"
                ry="30"
                fill="none"
                stroke="url(#heroLogoGradient)"
                strokeWidth="3"
                transform="rotate(-30 100 100)"
                filter="url(#logoGlow)"
                style={{ transformOrigin: 'center', transformBox: 'fill-box' }}
              />

              {/* Accent dot on orbit - will shoot up fast */}
              <circle
                id="hero-logo-dot"
                cx="165"
                cy="85"
                r="6"
                fill="#22d3ee"
                filter="url(#logoGlow)"
                style={{ transformOrigin: 'center', transformBox: 'fill-box' }}
              />

              {/* Inner corner accent - will move down-left */}
              <path
                id="hero-logo-accent"
                d="M75 125 L75 115 L85 115"
                fill="none"
                stroke="#22d3ee"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#logoGlow)"
                style={{ transformOrigin: 'center', transformBox: 'fill-box' }}
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Scroll indicator - fades out as user scrolls */}
      {hasAnimatedIn && (
        <motion.div
          className="scroll-indicator absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="flex flex-col items-center gap-2 text-white/40"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <span className="text-xs tracking-wider uppercase">Scroll</span>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </motion.div>
        </motion.div>
      )}
    </section>
  );
});
