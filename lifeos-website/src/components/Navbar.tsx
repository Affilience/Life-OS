'use client';

import { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import Link from 'next/link';
import { animate } from 'animejs';

export interface NavbarHandle {
  animateIn: () => void;
}

interface NavbarProps {
  visible?: boolean;
  skipAnimation?: boolean; // Skip entrance animation (e.g., on page refresh)
}

/**
 * Navbar Component
 *
 * Uses CSS-first approach to avoid flash on page refresh:
 * - An inline script in layout.tsx sets 'returning-visitor' class on <html> before React hydrates
 * - CSS in globals.css shows navbar immediately when that class is present
 * - For first-time visitors, navbar starts hidden and animates in via animateIn()
 */
export const Navbar = forwardRef<NavbarHandle, NavbarProps>(function Navbar({ visible = false, skipAnimation = false }, ref) {
  const navRef = useRef<HTMLElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLAnchorElement>(null);
  const hasAnimated = useRef(false);

  // Check if returning visitor on mount to prevent animation
  useEffect(() => {
    const isReturning = document.documentElement.classList.contains('returning-visitor');
    if (isReturning) {
      hasAnimated.current = true;
    }
  }, []);

  useImperativeHandle(ref, () => ({
    animateIn: () => {
      if (!navRef.current || hasAnimated.current) return;
      hasAnimated.current = true;

      // Remove the hidden class and animate
      navRef.current.classList.remove('navbar-hidden');
      navRef.current.classList.add('navbar-visible');

      // Animate navbar container - slide down with subtle blur clear
      animate(navRef.current, {
        translateY: [-60, 0],
        opacity: [0, 1],
        duration: 900,
        easing: 'easeOutExpo',
      });

      // Animate logo - pop in with scale and rotation
      if (logoRef.current) {
        animate(logoRef.current, {
          opacity: [0, 1],
          scale: [0.5, 1],
          rotate: [-10, 0],
          duration: 700,
          delay: 300,
          easing: 'easeOutBack',
        });
      }

      // Animate links with cascade effect from center outward
      if (linksRef.current) {
        const links = linksRef.current.querySelectorAll('.nav-link');
        const linksArray = Array.from(links);
        const centerIndex = Math.floor(linksArray.length / 2);

        linksArray.forEach((link, i) => {
          // Calculate delay based on distance from center
          const distanceFromCenter = Math.abs(i - centerIndex);
          const delay = 400 + distanceFromCenter * 80;

          animate(link, {
            opacity: [0, 1],
            translateY: [-15, 0],
            scale: [0.9, 1],
            duration: 500,
            delay,
            easing: 'easeOutExpo',
          });
        });
      }
    },
  }));

  return (
    <nav
      ref={navRef}
      className="navbar-container fixed top-0 left-0 right-0 z-50 px-6 py-4 navbar-hidden backdrop-blur-md bg-black/20 border-b border-white/5"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link ref={logoRef} href="/" className="navbar-element flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
            <span className="text-white font-bold text-sm">L</span>
          </div>
          <span className="text-white font-semibold text-lg group-hover:text-purple-400 transition-colors">
            LifeOS
          </span>
        </Link>

        {/* Navigation Links */}
        <div ref={linksRef} className="hidden md:flex items-center gap-5 lg:gap-7">
          <a href="#character" className="nav-link navbar-element text-white/60 hover:text-white transition-colors text-sm font-medium">
            Character
          </a>
          <a href="#modules" className="nav-link navbar-element text-white/60 hover:text-white transition-colors text-sm font-medium">
            Modules
          </a>
          <a href="#ai" className="nav-link navbar-element text-white/60 hover:text-white transition-colors text-sm font-medium">
            AI
          </a>
          <a href="#gamification" className="nav-link navbar-element text-white/60 hover:text-white transition-colors text-sm font-medium">
            Gamification
          </a>
          <a href="#screenshots" className="nav-link navbar-element text-white/60 hover:text-white transition-colors text-sm font-medium">
            Screenshots
          </a>
          <a href="#pricing" className="nav-link navbar-element text-white/60 hover:text-white transition-colors text-sm font-medium">
            Pricing
          </a>
          <a href="#beta" className="nav-link navbar-element px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/30 text-white hover:border-purple-400/50 transition-colors text-sm font-medium">
            Beta Testing
          </a>
        </div>

        {/* Empty div for layout balance (removed CTA) */}
        <div className="w-8 h-8 md:hidden" />
      </div>
    </nav>
  );
});
