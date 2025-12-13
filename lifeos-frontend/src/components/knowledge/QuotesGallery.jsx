import React, { useState, useEffect } from 'react';
import { Heart, ChevronLeft, ChevronRight, Play, Pause, Plus, X } from 'lucide-react';
import './QuotesGallery.css';

// Large prebuilt quotes database - curated collection
import { QUOTES_DATABASE } from '../../data/quotesDatabase';

// Quote Card Component
function QuoteCard({ quote, onFavoriteToggle, isActive }) {
  return (
    <div className={`quote-card ${isActive ? 'active' : ''}`}>
      <div className="quote-content">
        <div className="quote-mark">❝</div>
        <blockquote className="quote-text">
          {quote.quote}
        </blockquote>
      </div>

      <div className="quote-attribution">
        <div className="quote-author-section">
          <div className="quote-author">{quote.author}</div>
          <div className="quote-source">{quote.source}</div>
        </div>

        <button
          className={`favorite-btn ${quote.isFavorite ? 'favorited' : ''}`}
          onClick={() => onFavoriteToggle(quote.id)}
        >
          <Heart
            size={20}
            fill={quote.isFavorite ? 'currentColor' : 'none'}
          />
        </button>
      </div>

      <div className="quote-tags">
        <span className="quote-tag category">{quote.category}</span>
        <span className="quote-tag mood">{quote.mood}</span>
      </div>
    </div>
  );
}

// Main QuotesGallery Component
const QuotesGallery = () => {
  const [quotes, setQuotes] = useState(QUOTES_DATABASE);
  const [currentQuote, setCurrentQuote] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // Form state
  const [newQuote, setNewQuote] = useState({
    quote: '',
    author: '',
    source: '',
    category: 'Life',
    mood: 'Inspirational'
  });

  // Filter quotes
  const filteredQuotes = showFavoritesOnly
    ? quotes.filter(q => q.isFavorite)
    : quotes;

  // Auto-rotation effect
  useEffect(() => {
    if (!autoRotate || filteredQuotes.length === 0) return;

    const timer = setInterval(() => {
      setCurrentQuote(prev => (prev + 1) % filteredQuotes.length);
    }, 8000);

    return () => clearInterval(timer);
  }, [autoRotate, filteredQuotes.length]);

  // Reset current quote when filters change
  useEffect(() => {
    setCurrentQuote(0);
  }, [showFavoritesOnly]);

  const handleNext = () => {
    setCurrentQuote((prev) => (prev + 1) % filteredQuotes.length);
  };

  const handlePrevious = () => {
    setCurrentQuote((prev) => (prev - 1 + filteredQuotes.length) % filteredQuotes.length);
  };

  const handleFavoriteToggle = (quoteId) => {
    setQuotes(prevQuotes =>
      prevQuotes.map(q =>
        q.id === quoteId ? { ...q, isFavorite: !q.isFavorite } : q
      )
    );
  };

  const handleAddQuote = (e) => {
    e.preventDefault();

    if (!newQuote.quote.trim() || !newQuote.author.trim()) {
      alert('Please enter both quote and author');
      return;
    }

    const quote = {
      id: Math.max(...quotes.map(q => q.id)) + 1,
      ...newQuote,
      isFavorite: false
    };

    setQuotes([...quotes, quote]);
    setNewQuote({
      quote: '',
      author: '',
      source: '',
      category: 'Life',
      mood: 'Inspirational'
    });
    setShowAddModal(false);
    alert('Quote added successfully!');
  };

  if (filteredQuotes.length === 0) {
    return (
      <div className="quotes-gallery">
        <div className="empty-state">
          <p>No quotes found. Add your first quote!</p>
          <button onClick={() => setShowAddModal(true)} className="add-quote-btn">
            <Plus size={20} />
            Add Quote
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="quotes-gallery">
      {/* Simple Header */}
      <div className="gallery-header">
        <div className="header-controls">
          <button
            className={`filter-btn ${showFavoritesOnly ? 'active' : ''}`}
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
          >
            <Heart size={16} fill={showFavoritesOnly ? 'currentColor' : 'none'} />
            Favorites
          </button>

          <button
            className={`auto-rotate-btn ${autoRotate ? 'active' : ''}`}
            onClick={() => setAutoRotate(!autoRotate)}
          >
            {autoRotate ? <Pause size={16} /> : <Play size={16} />}
          </button>
        </div>

        <button onClick={() => setShowAddModal(true)} className="add-quote-btn">
          <Plus size={20} />
          Add Quote
        </button>
      </div>

      {/* Quote Display */}
      <div className="quote-display">
        <button className="nav-btn prev" onClick={handlePrevious}>
          <ChevronLeft size={32} />
        </button>

        <div className="quote-container">
          {filteredQuotes.map((quote, index) => (
            <QuoteCard
              key={quote.id}
              quote={quote}
              onFavoriteToggle={handleFavoriteToggle}
              isActive={index === currentQuote}
            />
          ))}
        </div>

        <button className="nav-btn next" onClick={handleNext}>
          <ChevronRight size={32} />
        </button>
      </div>

      {/* Simple Indicators */}
      <div className="quote-indicators">
        {filteredQuotes.map((quote, index) => (
          <button
            key={quote.id}
            className={`indicator ${index === currentQuote ? 'active' : ''}`}
            onClick={() => setCurrentQuote(index)}
          />
        ))}
      </div>

      {/* Add Quote Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Quote</h2>
              <button onClick={() => setShowAddModal(false)} className="close-btn">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleAddQuote} className="quote-form">
              <div className="form-group">
                <label>Quote *</label>
                <textarea
                  value={newQuote.quote}
                  onChange={(e) => setNewQuote({...newQuote, quote: e.target.value})}
                  placeholder="Enter the quote..."
                  rows={4}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Author *</label>
                  <input
                    type="text"
                    value={newQuote.author}
                    onChange={(e) => setNewQuote({...newQuote, author: e.target.value})}
                    placeholder="e.g., Marcus Aurelius"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Source</label>
                  <input
                    type="text"
                    value={newQuote.source}
                    onChange={(e) => setNewQuote({...newQuote, source: e.target.value})}
                    placeholder="e.g., Meditations"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={newQuote.category}
                    onChange={(e) => setNewQuote({...newQuote, category: e.target.value})}
                  >
                    <option value="Philosophy">Philosophy</option>
                    <option value="Life">Life</option>
                    <option value="Business">Business</option>
                    <option value="Wisdom">Wisdom</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Mood</label>
                  <select
                    value={newQuote.mood}
                    onChange={(e) => setNewQuote({...newQuote, mood: e.target.value})}
                  >
                    <option value="Inspirational">Inspirational</option>
                    <option value="Motivational">Motivational</option>
                    <option value="Wisdom">Wisdom</option>
                    <option value="Reflective">Reflective</option>
                    <option value="Empowering">Empowering</option>
                  </select>
                </div>
              </div>

              <div className="form-actions">
                <button type="button" onClick={() => setShowAddModal(false)} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Add Quote
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuotesGallery;
