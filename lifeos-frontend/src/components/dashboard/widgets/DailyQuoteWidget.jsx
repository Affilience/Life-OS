import React, { useState, useEffect } from 'react';
import { Quote, RefreshCw, Heart, Share2 } from 'lucide-react';
import { useQuotesStore } from '../../../stores/quotesStore';

export default function DailyQuoteWidget() {
  const { quotes, customQuotes, favoriteIds, getRandomQuote, toggleFavorite } = useQuotesStore();

  // Get daily quote based on day of year for consistency
  const getDailyQuote = () => {
    const allQuotes = [...quotes, ...customQuotes];
    if (allQuotes.length === 0) return { text: 'Loading...', author: '' };

    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now - start;
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    return allQuotes[dayOfYear % allQuotes.length];
  };

  const [quote, setQuote] = useState(getDailyQuote());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Update quote when store loads
  useEffect(() => {
    if (quotes.length > 0 || customQuotes.length > 0) {
      setQuote(getDailyQuote());
    }
  }, [quotes, customQuotes]);

  const liked = quote?.id ? favoriteIds.includes(quote.id) : false;

  const refreshQuote = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      const newQuote = getRandomQuote();
      if (newQuote) {
        setQuote(newQuote);
      }
      setIsRefreshing(false);
    }, 300);
  };

  const handleLike = () => {
    if (quote?.id) {
      toggleFavorite(quote.id);
    }
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
            onClick={handleLike}
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
