import React, { useState, useEffect } from 'react';
import { Quote, RefreshCw, Heart, Share2 } from 'lucide-react';

const QUOTES = [
  {
    text: "The only way to do great work is to love what you do.",
    author: "Steve Jobs",
  },
  {
    text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    author: "Winston Churchill",
  },
  {
    text: "The future belongs to those who believe in the beauty of their dreams.",
    author: "Eleanor Roosevelt",
  },
  {
    text: "It does not matter how slowly you go as long as you do not stop.",
    author: "Confucius",
  },
  {
    text: "Believe you can and you're halfway there.",
    author: "Theodore Roosevelt",
  },
  {
    text: "The only limit to our realization of tomorrow will be our doubts of today.",
    author: "Franklin D. Roosevelt",
  },
  {
    text: "Do what you can, with what you have, where you are.",
    author: "Theodore Roosevelt",
  },
  {
    text: "In the middle of every difficulty lies opportunity.",
    author: "Albert Einstein",
  },
  {
    text: "Your time is limited, don't waste it living someone else's life.",
    author: "Steve Jobs",
  },
  {
    text: "The best time to plant a tree was 20 years ago. The second best time is now.",
    author: "Chinese Proverb",
  },
  {
    text: "The only person you are destined to become is the person you decide to be.",
    author: "Ralph Waldo Emerson",
  },
  {
    text: "Don't watch the clock; do what it does. Keep going.",
    author: "Sam Levenson",
  },
  {
    text: "Everything you've ever wanted is on the other side of fear.",
    author: "George Addair",
  },
  {
    text: "The secret of getting ahead is getting started.",
    author: "Mark Twain",
  },
  {
    text: "Quality is not an act, it is a habit.",
    author: "Aristotle",
  },
];

// Get quote based on day of year for consistency
function getDailyQuote() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now - start;
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  return QUOTES[dayOfYear % QUOTES.length];
}

export default function DailyQuoteWidget() {
  const [quote, setQuote] = useState(getDailyQuote());
  const [liked, setLiked] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshQuote = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * QUOTES.length);
      setQuote(QUOTES[randomIndex]);
      setLiked(false);
      setIsRefreshing(false);
    }, 300);
  };

  const shareQuote = async () => {
    const text = `"${quote.text}" - ${quote.author}`;
    if (navigator.share) {
      try {
        await navigator.share({ text });
      } catch (err) {
        // User cancelled share
      }
    } else {
      navigator.clipboard.writeText(text);
    }
  };

  return (
    <div className="h-full bg-gradient-to-br from-purple-500/20 via-pink-500/10 to-blue-500/20 border border-white/10 rounded-xl p-4 flex flex-col">
      {/* Quote Icon */}
      <div className="flex items-center justify-between mb-2 flex-shrink-0">
        <Quote className="w-5 h-5 text-purple-400 opacity-60" />
        <div className="flex items-center gap-1">
          <button
            onClick={() => setLiked(!liked)}
            className={`p-1.5 rounded-lg transition-all ${
              liked ? 'text-pink-400 bg-pink-400/20' : 'text-white/40 hover:text-pink-400 hover:bg-white/5'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${liked ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={shareQuote}
            className="p-1.5 rounded-lg text-white/40 hover:text-blue-400 hover:bg-white/5 transition-all"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={refreshQuote}
            disabled={isRefreshing}
            className="p-1.5 rounded-lg text-white/40 hover:text-purple-400 hover:bg-white/5 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Quote Text */}
      <div className={`flex-1 flex flex-col justify-center transition-opacity duration-300 ${isRefreshing ? 'opacity-0' : 'opacity-100'}`}>
        <p className="text-sm text-white leading-relaxed mb-2 italic">
          "{quote.text}"
        </p>
        <p className="text-xs text-white/60 text-right">
          — {quote.author}
        </p>
      </div>
    </div>
  );
}
