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

    // On mobile, show content immediately
    if (isMobile) {
      if (badgeRef.current) badgeRef.current.style.opacity = '1';
      if (titleRef.current) titleRef.current.style.opacity = '1';
      if (subtitleRef.current) subtitleRef.current.style.opacity = '1';
      if (buttonContainerRef.current) buttonContainerRef.current.style.opacity = '1';
      if (trustSignalsRef.current) {
        trustSignalsRef.current.style.opacity = '1';
        const items = trustSignalsRef.current.querySelectorAll('.trust-item');
        items.forEach((item) => (item as HTMLElement).style.opacity = '1');
      }
      if (footerRef.current) footerRef.current.style.opacity = '1';
      startButtonAnimation();
      return;
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
      className="relative min-h-screen overflow-hidden flex flex-col"
    >
      {/* Main CTA Content - pushed up */}
      <div className="relative z-20 flex-1 flex flex-col items-center justify-center px-6 pt-16 pb-8">
        {/* Beta Badge */}
        <div ref={badgeRef} className="mb-6" style={{ opacity: 0 }}>
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
          className="text-3xl md:text-5xl lg:text-6xl font-bold text-center mb-4 max-w-3xl"
          style={{ opacity: 0 }}
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
          className="text-base md:text-lg text-white/50 text-center max-w-lg mb-8"
          style={{ opacity: 0 }}
        >
          Join the beta and help shape the future of personal development. Early adopters get lifetime founding member status.
        </p>

        {/* CTA Button */}
        <div ref={buttonContainerRef} className="relative mb-6" style={{ opacity: 0 }}>
          <Link
            ref={buttonRef}
            href="https://lifeos-frontend.vercel.app/auth"
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
        <div ref={trustSignalsRef} className="flex flex-wrap justify-center gap-4 md:gap-6" style={{ opacity: 0 }}>
          {[
            { icon: '✓', text: 'Free during beta' },
            { icon: '✓', text: 'No credit card' },
            { icon: '✓', text: 'Founding member perks' },
          ].map((item, i) => (
            <div key={i} className="trust-item flex items-center gap-2 text-white/50" style={{ opacity: 0 }}>
              <span className="text-emerald-400 text-xs">{item.icon}</span>
              <span className="text-xs">{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Compact Footer */}
      <div ref={footerRef} className="relative z-20 border-t border-white/5 px-6 py-6" style={{ opacity: 0 }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
              <span className="text-white font-bold text-xs">L</span>
            </div>
            <span className="text-sm font-semibold text-white">LifeOS</span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6 text-xs text-white/40">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
          </div>

          {/* Social + Copyright */}
          <div className="flex items-center gap-4">
            <div className="flex gap-3">
              <a href="https://twitter.com/lifeos" className="text-white/30 hover:text-white transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a href="https://discord.gg/lifeos" className="text-white/30 hover:text-white transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
              </a>
            </div>
            <span className="text-white/20 text-xs">© 2025 LifeOS</span>
          </div>
        </div>
      </div>
    </section>
  );
}
