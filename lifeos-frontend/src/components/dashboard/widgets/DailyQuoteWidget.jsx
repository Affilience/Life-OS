import React, { useState, useEffect } from 'react';
import { useQuotesStore } from '../../../stores/quotesStore';

export default function DailyQuoteWidget() {
  const { quotes, customQuotes } = useQuotesStore();

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

  // Update quote when store loads
  useEffect(() => {
    if (quotes.length > 0 || customQuotes.length > 0) {
      setQuote(getDailyQuote());
    }
  }, [quotes, customQuotes]);

  return (
    <div className="h-full bg-gradient-to-br from-purple-500/20 via-pink-500/10 to-blue-500/20 border border-white/10 rounded-xl p-4 flex flex-col justify-center">
      {/* Quote Text */}
      <p className="text-sm text-white leading-relaxed mb-2 italic">
        "{quote.text}"
      </p>
      <p className="text-xs text-white/60 text-right">
        — {quote.author}
      </p>
    </div>
  );
}
