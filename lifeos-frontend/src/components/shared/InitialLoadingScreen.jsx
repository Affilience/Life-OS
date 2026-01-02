/**
 * InitialLoadingScreen - Full-page loading screen shown during app initialization
 * Uses hardcoded quotes since stores aren't loaded yet
 */

import React, { useState, useEffect, useMemo } from 'react';
import './LoadingScreen.css';

// Hardcoded quotes for initial load (before quotesStore is available)
const INITIAL_QUOTES = [
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Small daily improvements over time lead to stunning results.", author: "Robin Sharma" },
  { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Success is the sum of small efforts repeated day in and day out.", author: "Robert Collier" },
  { text: "What you do today can improve all your tomorrows.", author: "Ralph Marston" },
  { text: "The journey of a thousand miles begins with a single step.", author: "Lao Tzu" },
  { text: "Dream big, start small, act now.", author: "Robin Sharma" },
  { text: "Progress, not perfection.", author: "Unknown" },
  { text: "Every moment is a fresh beginning.", author: "T.S. Eliot" },
  { text: "Be the change you wish to see in the world.", author: "Mahatma Gandhi" },
  { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
  { text: "Your life does not get better by chance, it gets better by change.", author: "Jim Rohn" },
  { text: "Start where you are. Use what you have. Do what you can.", author: "Arthur Ashe" },
  { text: "The only limit to our realization of tomorrow is our doubts of today.", author: "Franklin D. Roosevelt" },
];

const InitialLoadingScreen = ({ message = 'Preparing your journey' }) => {
  const [fadeIn, setFadeIn] = useState(false);

  // Pick a random quote on mount
  const quote = useMemo(() => {
    const index = Math.floor(Math.random() * INITIAL_QUOTES.length);
    return INITIAL_QUOTES[index];
  }, []);

  useEffect(() => {
    // Trigger fade-in animation
    const fadeTimer = setTimeout(() => setFadeIn(true), 50);
    return () => clearTimeout(fadeTimer);
  }, []);

  return (
    <div className={`loading-screen ${fadeIn ? 'fade-in' : ''}`}>
      {/* Background effects */}
      <div className="loading-bg-gradient" />
      <div className="loading-stars" />

      {/* Main content */}
      <div className="loading-content">
        {/* Animated loader */}
        <div className="loading-icon-container">
          <div className="loading-ring">
            <div className="loading-ring-inner" />
          </div>
          <img src="/logo.png" alt="Ascnd" className="loading-logo" style={{ width: '32px', height: 'auto', filter: 'drop-shadow(0 0 10px rgba(167,139,250,0.5))' }} />
        </div>

        {/* Loading message */}
        <p className="loading-message">{message}</p>

        {/* Quote display */}
        <div className="loading-quote-container">
          <blockquote className="loading-quote">
            "{quote.text}"
          </blockquote>
          <cite className="loading-author">— {quote.author}</cite>
        </div>
      </div>

      {/* Bottom branding */}
      <div className="loading-branding">
        <span className="loading-brand-text">Ascnd</span>
      </div>
    </div>
  );
};

export default InitialLoadingScreen;
