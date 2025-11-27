/**
 * LoadingScreen - Full-page loading screen with random quotes
 * Used during page transitions and initial app load
 */

import React, { useState, useEffect } from 'react';
import { useQuotesStore } from '../../stores/quotesStore';
import { Sparkles } from 'lucide-react';
import './LoadingScreen.css';

const LoadingScreen = ({
  message = 'Loading',
  showQuote = true,
  category = null, // Optional: filter quotes by category
  minDisplayTime = 800, // Minimum time to show (prevents flash)
}) => {
  const { getRandomQuote, getRandomQuoteByCategory } = useQuotesStore();
  const [quote, setQuote] = useState(null);
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    // Get a quote based on category or random
    const selectedQuote = category
      ? getRandomQuoteByCategory(category)
      : getRandomQuote();

    setQuote(selectedQuote);

    // Trigger fade-in animation
    const fadeTimer = setTimeout(() => setFadeIn(true), 50);

    return () => clearTimeout(fadeTimer);
  }, [category, getRandomQuote, getRandomQuoteByCategory]);

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
          <Sparkles className="loading-sparkle" size={24} />
        </div>

        {/* Loading message */}
        <p className="loading-message">{message}</p>

        {/* Quote display */}
        {showQuote && quote && (
          <div className="loading-quote-container">
            <blockquote className="loading-quote">
              "{quote.text}"
            </blockquote>
            <cite className="loading-author">— {quote.author}</cite>
          </div>
        )}
      </div>

      {/* Bottom branding */}
      <div className="loading-branding">
        <span className="loading-brand-text">LifeOS</span>
      </div>
    </div>
  );
};

export default LoadingScreen;
