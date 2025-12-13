"use client";

import Link from "next/link";
import { useState } from "react";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0c0a10]/80 backdrop-blur-xl border-b border-white/5">
      <div className="container-wide">
        <nav className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">L</span>
            </div>
            <span className="text-xl font-bold text-white">LifeOS</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-white/70 hover:text-white transition-colors">
              Features
            </Link>
            <Link href="#modules" className="text-white/70 hover:text-white transition-colors">
              Modules
            </Link>
            <Link href="#gamification" className="text-white/70 hover:text-white transition-colors">
              Gamification
            </Link>
            <Link href="#screenshots" className="text-white/70 hover:text-white transition-colors">
              Screenshots
            </Link>
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <Link href="/login" className="text-white/70 hover:text-white transition-colors">
              Log in
            </Link>
            <Link href="/signup" className="btn-primary text-sm">
              Get Started Free
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-white"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </nav>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/10">
            <div className="flex flex-col gap-4">
              <Link
                href="#features"
                className="text-white/70 hover:text-white transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Features
              </Link>
              <Link
                href="#modules"
                className="text-white/70 hover:text-white transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Modules
              </Link>
              <Link
                href="#gamification"
                className="text-white/70 hover:text-white transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Gamification
              </Link>
              <Link
                href="#screenshots"
                className="text-white/70 hover:text-white transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Screenshots
              </Link>
              <div className="flex gap-4 pt-4 border-t border-white/10">
                <Link href="/login" className="btn-secondary flex-1 text-center">
                  Log in
                </Link>
                <Link href="/signup" className="btn-primary flex-1 text-center">
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
