'use client';

/**
 * BetaCTA Section - Final Page with Footer
 *
 * The complete ending of the website - CTA + compact footer.
 * All content fits on one screen.
 */

import { useRef, useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { animate } from 'animejs';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export function BetaCTA() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const buttonContainerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLAnchorElement>(null);
  const trustSignalsRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);

  const [hasAnimatedButton, setHasAnimatedButton] = useState(false);

  // Anime.js button pulse animation
  const startButtonAnimation = useCallback(() => {
    if (hasAnimatedButton || !buttonRef.current) return;
    setHasAnimatedButton(true);

    const glow = buttonRef.current.querySelector('.button-glow');
    if (glow) {
      animate(glow, {
        scale: [1, 1.2, 1],
        opacity: [0.5, 0.8, 0.5],
        duration: 2000,
        loop: true,
        easing: 'easeInOutSine',
      });
    }

    const arrow = buttonRef.current.querySelector('.button-arrow');
    if (arrow) {
      animate(arrow, {
        translateX: [0, 8, 0],
        duration: 1500,
        loop: true,
        easing: 'easeInOutQuad',
      });
    }
  }, [hasAnimatedButton]);

  // GSAP Scroll-triggered animations
  useEffect(() => {
    if (!sectionRef.current || typeof window === 'undefined') return;

    const section = sectionRef.current;
    const isMobile = window.innerWidth < 768;

    // On mobile, content is visible via CSS (opacity-100 md:opacity-0) - no GSAP needed
    if (isMobile) {
      return; // Exit early - no GSAP on mobile
    }

    const ctx = gsap.context(() => {
      const BUILD_OFFSET = 0.55;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=1100%',
          scrub: 1.5,
          pin: true,
          pinSpacing: false,
          anticipatePin: 1,
          onUpdate: (self) => {
            if (self.progress > BUILD_OFFSET + 0.12) {
              startButtonAnimation();
            }
          },
        },
      });

      // Badge
      if (badgeRef.current) {
        gsap.set(badgeRef.current, { opacity: 0, y: -30, scale: 0.8 });
        tl.to(badgeRef.current, {
          opacity: 1, y: 0, scale: 1,
          duration: 0.04, ease: 'back.out(2)',
        }, BUILD_OFFSET);
      }

      // Title
      if (titleRef.current) {
        gsap.set(titleRef.current, { opacity: 0, y: 40, filter: 'blur(10px)' });
        tl.to(titleRef.current, {
          opacity: 1, y: 0, filter: 'blur(0px)',
          duration: 0.05, ease: 'power3.out',
        }, BUILD_OFFSET + 0.02);
      }

      // Subtitle
      if (subtitleRef.current) {
        gsap.set(subtitleRef.current, { opacity: 0, y: 20 });
        tl.to(subtitleRef.current, {
          opacity: 1, y: 0,
          duration: 0.04, ease: 'power3.out',
        }, BUILD_OFFSET + 0.05);
      }

      // Button
      if (buttonContainerRef.current) {
        gsap.set(buttonContainerRef.current, { opacity: 0, scale: 0.5, y: 30 });
        tl.to(buttonContainerRef.current, {
          opacity: 1, scale: 1, y: 0,
          duration: 0.06, ease: 'elastic.out(1, 0.6)',
        }, BUILD_OFFSET + 0.07);
      }

      // Trust signals
      if (trustSignalsRef.current) {
        const items = trustSignalsRef.current.querySelectorAll('.trust-item');
        gsap.set(trustSignalsRef.current, { opacity: 0 });
        gsap.set(items, { opacity: 0, y: 15 });
        tl.to(trustSignalsRef.current, { opacity: 1, duration: 0.02 }, BUILD_OFFSET + 0.10);
        items.forEach((item, i) => {
          tl.to(item, { opacity: 1, y: 0, duration: 0.03, ease: 'power3.out' }, BUILD_OFFSET + 0.11 + (i * 0.01));
        });
      }

      // Footer
      if (footerRef.current) {
        gsap.set(footerRef.current, { opacity: 0, y: 20 });
        tl.to(footerRef.current, {
          opacity: 1, y: 0,
          duration: 0.04, ease: 'power3.out',
        }, BUILD_OFFSET + 0.15);
      }

    }, section);

    return () => ctx.revert();
  }, [startButtonAnimation]);

  const handleButtonHover = (entering: boolean) => {
    if (!buttonRef.current) return;
    animate(buttonRef.current, {
      scale: entering ? 1.05 : 1,
      duration: entering ? 200 : 300,
      easing: entering ? 'easeOutExpo' : 'easeOutElastic',
    });
  };

  return (
    <section
      id="beta"
      ref={sectionRef}
      className="relative min-h-screen overflow-hidden flex flex-col mt-[850vh] md:mt-0"
    >
      {/* Main CTA Content - pushed up */}
      <div className="relative z-20 flex-1 flex flex-col items-center justify-center px-6 pt-16 pb-8">
        {/* Beta Badge */}
        <div ref={badgeRef} className="mb-6 opacity-100 md:opacity-0">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/30">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
            </span>
            <span className="text-sm font-semibold bg-gradient-to-r from-purple-300 to-cyan-300 bg-clip-text text-transparent">
              LIMITED BETA ACCESS
            </span>
          </div>
        </div>

        {/* Headline */}
        <h2
          ref={titleRef}
          className="text-3xl md:text-5xl lg:text-6xl font-bold text-center mb-4 max-w-3xl opacity-100 md:opacity-0"
        >
          <span className="text-white">Stop </span>
          <span className="bg-gradient-to-r from-purple-400 to-purple-300 bg-clip-text text-transparent">Planning</span>
          <span className="text-white">. Start </span>
          <span className="bg-gradient-to-r from-cyan-400 to-cyan-300 bg-clip-text text-transparent">Playing</span>
          <span className="text-white">.</span>
        </h2>

        {/* Subtitle */}
        <p
          ref={subtitleRef}
          className="text-base md:text-lg text-white/50 text-center max-w-lg mb-8 opacity-100 md:opacity-0"
        >
          Join the beta and help shape the future of personal development. Early adopters get lifetime founding member status.
        </p>

        {/* CTA Button */}
        <div ref={buttonContainerRef} className="relative mb-6 opacity-100 md:opacity-0">
          <Link
            ref={buttonRef}
            href="https://app.ascnd.app/auth"
            className="group relative inline-flex items-center gap-3 px-10 py-5 text-lg font-bold text-white rounded-2xl overflow-hidden transition-all duration-300"
            onMouseEnter={() => handleButtonHover(true)}
            onMouseLeave={() => handleButtonHover(false)}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-purple-500 to-cyan-500 bg-[length:200%_100%] animate-gradient-x" />
            <div className="button-glow absolute inset-0 bg-gradient-to-r from-purple-600 to-cyan-500 blur-2xl opacity-50" />
            <div className="absolute inset-0 overflow-hidden rounded-2xl">
              <div className="absolute -inset-full top-0 h-full w-1/3 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 animate-shine" />
            </div>
            <span className="relative z-10">Become a Beta Tester</span>
            <span className="button-arrow relative z-10 text-xl">→</span>
          </Link>
        </div>

        {/* Trust Signals */}
        <div ref={trustSignalsRef} className="flex flex-wrap justify-center gap-4 md:gap-6 opacity-100 md:opacity-0">
          {[
            { icon: '✓', text: 'Free during beta' },
            { icon: '✓', text: 'No credit card' },
            { icon: '✓', text: 'Founding member perks' },
          ].map((item, i) => (
            <div key={i} className="trust-item flex items-center gap-2 text-white/50">
              <span className="text-emerald-400 text-xs">{item.icon}</span>
              <span className="text-xs">{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Compact Footer */}
      <div ref={footerRef} className="relative z-20 border-t border-white/5 px-6 py-6 opacity-100 md:opacity-0">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
              <span className="text-white font-bold text-xs">A</span>
            </div>
            <span className="text-sm font-semibold text-white">Ascnd</span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6 text-xs text-white/40">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
          </div>

          {/* Copyright */}
          <span className="text-white/20 text-xs">© 2025 Ascnd</span>
        </div>
      </div>
    </section>
  );
}
