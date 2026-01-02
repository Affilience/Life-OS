'use client';

import { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const navLinks = [
    { href: '#character', label: 'Character' },
    { href: '#modules', label: 'Modules' },
    { href: '#ai', label: 'AI' },
    { href: '#gamification', label: 'Gamification' },
    { href: '#screenshots', label: 'Screenshots' },
    { href: '#pricing', label: 'Pricing' },
  ];

  const handleMobileNavClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <>
      <nav
        ref={navRef}
        className="navbar-container fixed top-0 left-0 right-0 z-50 px-4 md:px-6 py-3 md:py-4 navbar-hidden backdrop-blur-md bg-black/20 border-b border-white/5"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link ref={logoRef} href="/" className="navbar-element flex items-center gap-2 group">
            <img
              src="/logo.png"
              alt="Ascnd"
              className="w-7 h-auto md:w-8 drop-shadow-[0_0_8px_rgba(167,139,250,0.4)]"
            />
            <span className="text-white font-semibold text-base md:text-lg group-hover:text-purple-400 transition-colors">
              Ascnd
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div ref={linksRef} className="hidden md:flex items-center gap-5 lg:gap-7">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="nav-link navbar-element text-white/60 hover:text-white transition-colors text-sm font-medium"
              >
                {link.label}
              </a>
            ))}
            <a href="#beta" className="nav-link navbar-element px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/30 text-white hover:border-purple-400/50 transition-colors text-sm font-medium">
              Beta Testing
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 -mr-2 text-white/70 hover:text-white transition-colors"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-72 bg-[#0c0a10]/95 backdrop-blur-xl border-l border-white/10 transform transition-transform duration-300 ease-out md:hidden ${
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Close button */}
        <div className="flex justify-end p-4">
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 text-white/70 hover:text-white transition-colors"
            aria-label="Close menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Mobile Nav Links */}
        <nav className="flex flex-col px-6 py-4 space-y-1">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={handleMobileNavClick}
              className="py-3 px-4 text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors text-base font-medium"
            >
              {link.label}
            </a>
          ))}
          <div className="pt-4 mt-4 border-t border-white/10">
            <a
              href="#beta"
              onClick={handleMobileNavClick}
              className="block py-3 px-4 text-center rounded-xl bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/30 text-white hover:border-purple-400/50 transition-colors text-base font-medium"
            >
              Beta Testing
            </a>
          </div>
        </nav>
      </div>
    </>
  );
});
