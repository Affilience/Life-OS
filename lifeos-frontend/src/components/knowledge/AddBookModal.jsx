/**
 * AddBookModal Component - Add Book to Reading List
 * Modal form for tracking books with reading progress
 * Auto-fetches book covers from Open Library API
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useKnowledgeStore } from '../../stores/knowledgeStore';

// Debounce helper
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

// Fetch book cover from Open Library API
async function fetchBookCover(title, author) {
  if (!title || title.length < 3) return null;

  try {
    // Build search query
    let query = `title=${encodeURIComponent(title)}`;
    if (author && author.length > 2) {
      query += `&author=${encodeURIComponent(author)}`;
    }

    const response = await fetch(
      `https://openlibrary.org/search.json?${query}&limit=1&fields=cover_i,title,author_name`
    );

    if (!response.ok) return null;

    const data = await response.json();

    if (data.docs && data.docs.length > 0) {
      const book = data.docs[0];
      if (book.cover_i) {
        return {
          coverUrl: `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg`,
          foundTitle: book.title,
          foundAuthor: book.author_name?.[0] || null,
        };
      }
    }

    return null;
  } catch (error) {
    console.error('Error fetching book cover:', error);
    return null;
  }
}

export default function AddBookModal({ isOpen, onClose }) {
  const { addBook, setActiveView } = useKnowledgeStore();
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    status: 'want-to-read',
    progressUnit: 'pages',
    currentProgress: '',
    totalProgress: '',
    coverImage: '',
  });
  const [errors, setErrors] = useState({});
  const [isFetchingCover, setIsFetchingCover] = useState(false);
  const [coverPreview, setCoverPreview] = useState(null);
  const [autoFetchEnabled, setAutoFetchEnabled] = useState(true);
  const lastFetchedQuery = useRef('');

  // Debounce title and author for API calls
  const debouncedTitle = useDebounce(formData.title, 600);
  const debouncedAuthor = useDebounce(formData.author, 600);

  // Auto-fetch cover when title/author changes
  useEffect(() => {
    if (!autoFetchEnabled || !isOpen) return;
    if (formData.coverImage) return; // Don't override manual URL

    const query = `${debouncedTitle}|${debouncedAuthor}`;
    if (query === lastFetchedQuery.current) return;
    if (debouncedTitle.length < 3) {
      setCoverPreview(null);
      return;
    }

    lastFetchedQuery.current = query;
    setIsFetchingCover(true);

    fetchBookCover(debouncedTitle, debouncedAuthor)
      .then((result) => {
        if (result) {
          setCoverPreview(result.coverUrl);
          // Auto-fill the cover URL
          setFormData((prev) => ({
            ...prev,
            coverImage: result.coverUrl,
          }));
        } else {
          setCoverPreview(null);
        }
      })
      .finally(() => {
        setIsFetchingCover(false);
      });
  }, [debouncedTitle, debouncedAuthor, autoFetchEnabled, isOpen, formData.coverImage]);

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.author.trim()) {
      newErrors.author = 'Author is required';
    }

    // If status is reading, validate progress fields
    if (formData.status === 'reading') {
      if (!formData.totalProgress.trim()) {
        newErrors.totalProgress = 'Total is required for reading status';
      } else if (isNaN(formData.totalProgress) || parseInt(formData.totalProgress) <= 0) {
        newErrors.totalProgress = 'Must be a positive number';
      }

      if (formData.currentProgress.trim()) {
        if (isNaN(formData.currentProgress) || parseInt(formData.currentProgress) < 0) {
          newErrors.currentProgress = 'Must be a non-negative number';
        } else if (parseInt(formData.currentProgress) > parseInt(formData.totalProgress)) {
          newErrors.currentProgress = 'Cannot exceed total';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    const bookData = {
      title: formData.title.trim(),
      author: formData.author.trim(),
      status: formData.status,
      coverImage: formData.coverImage.trim() || null,
      notes: '',
    };

    // Add progress if reading
    if (formData.status === 'reading') {
      bookData.progress = {
        current: parseInt(formData.currentProgress) || 0,
        total: parseInt(formData.totalProgress),
        unit: formData.progressUnit,
      };
    } else if (formData.status === 'completed') {
      // For completed books, set progress to 100%
      bookData.progress = {
        current: parseInt(formData.totalProgress) || 100,
        total: parseInt(formData.totalProgress) || 100,
        unit: formData.progressUnit,
      };
    } else {
      // Want to read - no progress
      bookData.progress = {
        current: 0,
        total: 0,
        unit: formData.progressUnit,
      };
    }

    const bookId = addBook(bookData);

    // Navigate to books view to see the new book
    setActiveView('books', bookId);

    // Reset form and close modal
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      author: '',
      status: 'want-to-read',
      progressUnit: 'pages',
      currentProgress: '',
      totalProgress: '',
      coverImage: '',
    });
    setErrors({});
    setCoverPreview(null);
    lastFetchedQuery.current = '';
  };

  const handleCancel = () => {
    resetForm();
    onClose();
  };

  const statusOptions = [
    { id: 'want-to-read', label: 'Want to Read', icon: '📚' },
    { id: 'reading', label: 'Currently Reading', icon: '📖' },
    { id: 'completed', label: 'Completed', icon: '✅' },
  ];

  const progressUnits = [
    { id: 'pages', label: 'Pages' },
    { id: 'chapters', label: 'Chapters' },
    { id: 'percent', label: 'Percent' },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-[#12101a]/95 backdrop-blur-md border border-white/10/50 rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10/50 bg-[#12101a]/50">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Add Book</h2>
            <button
              onClick={handleCancel}
              className="p-2 text-white/60 hover:text-white hover:bg-[#1a1724] rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Enter book title"
              className={`
                w-full px-4 py-3 bg-[#1a1724]/30 border rounded-lg text-white placeholder-zinc-600
                focus:outline-none focus:border-blue-500/50 transition-colors
                ${errors.title ? 'border-red-500/50' : 'border-white/15/50'}
              `}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-500">{errors.title}</p>
            )}
          </div>

          {/* Author */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Author <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.author}
              onChange={(e) => handleChange('author', e.target.value)}
              placeholder="Enter author name"
              className={`
                w-full px-4 py-3 bg-[#1a1724]/30 border rounded-lg text-white placeholder-zinc-600
                focus:outline-none focus:border-blue-500/50 transition-colors
                ${errors.author ? 'border-red-500/50' : 'border-white/15/50'}
              `}
            />
            {errors.author && (
              <p className="mt-1 text-sm text-red-500">{errors.author}</p>
            )}
          </div>

          {/* Status Selection */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-3">Reading Status</label>
            <div className="grid grid-cols-3 gap-2">
              {statusOptions.map((status) => (
                <button
                  key={status.id}
                  type="button"
                  onClick={() => handleChange('status', status.id)}
                  className={`
                    p-3 rounded-lg border-2 transition-all duration-150
                    ${
                      formData.status === status.id
                        ? 'bg-blue-500/20 border-blue-500/50 text-blue-300'
                        : 'bg-[#1a1724]/30 border-white/15/50 text-white/60 hover:border-zinc-600 hover:text-zinc-200'
                    }
                  `}
                >
                  <div className="text-2xl mb-1">{status.icon}</div>
                  <div className="text-xs font-medium">{status.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Progress (only shown if reading) */}
          {formData.status === 'reading' && (
            <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-4 space-y-4">
              <div className="flex items-center gap-2 text-blue-400 mb-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                <span className="text-sm font-medium">Reading Progress</span>
              </div>

              {/* Progress Unit */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Track by</label>
                <div className="grid grid-cols-3 gap-2">
                  {progressUnits.map((unit) => (
                    <button
                      key={unit.id}
                      type="button"
                      onClick={() => handleChange('progressUnit', unit.id)}
                      className={`
                        px-3 py-2 rounded-lg text-sm transition-all duration-150
                        ${
                          formData.progressUnit === unit.id
                            ? 'bg-blue-500/30 text-blue-300 border border-blue-500/50'
                            : 'bg-[#1a1724]/30 text-white/60 border border-white/15/50 hover:text-zinc-200'
                        }
                      `}
                    >
                      {unit.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Progress Numbers */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Current {formData.progressUnit}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.currentProgress}
                    onChange={(e) => handleChange('currentProgress', e.target.value)}
                    placeholder="0"
                    className={`
                      w-full px-4 py-3 bg-[#1a1724]/30 border rounded-lg text-white placeholder-zinc-600
                      focus:outline-none focus:border-blue-500/50 transition-colors
                      ${errors.currentProgress ? 'border-red-500/50' : 'border-white/15/50'}
                    `}
                  />
                  {errors.currentProgress && (
                    <p className="mt-1 text-sm text-red-500">{errors.currentProgress}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Total {formData.progressUnit} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.totalProgress}
                    onChange={(e) => handleChange('totalProgress', e.target.value)}
                    placeholder="e.g., 350"
                    className={`
                      w-full px-4 py-3 bg-[#1a1724]/30 border rounded-lg text-white placeholder-zinc-600
                      focus:outline-none focus:border-blue-500/50 transition-colors
                      ${errors.totalProgress ? 'border-red-500/50' : 'border-white/15/50'}
                    `}
                  />
                  {errors.totalProgress && (
                    <p className="mt-1 text-sm text-red-500">{errors.totalProgress}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Cover Image Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-zinc-300">
                Cover Image
              </label>
              {isFetchingCover && (
                <span className="flex items-center gap-2 text-xs text-blue-400">
                  <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Searching...
                </span>
              )}
            </div>

            <div className="flex gap-4">
              {/* Cover Preview */}
              <div className="flex-shrink-0">
                <div className="w-24 h-36 bg-[#1a1724]/50 border border-white/15/50 rounded-lg overflow-hidden flex items-center justify-center">
                  {formData.coverImage || coverPreview ? (
                    <img
                      src={formData.coverImage || coverPreview}
                      alt="Book cover"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : (
                    <div className="text-center text-zinc-600">
                      <svg className="w-8 h-8 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      <span className="text-xs">No cover</span>
                    </div>
                  )}
                  <div className="hidden w-full h-full items-center justify-center text-zinc-600">
                    <span className="text-xs">Failed</span>
                  </div>
                </div>
              </div>

              {/* URL Input and Info */}
              <div className="flex-1 space-y-2">
                <input
                  type="url"
                  value={formData.coverImage}
                  onChange={(e) => {
                    handleChange('coverImage', e.target.value);
                    if (e.target.value) {
                      setCoverPreview(null); // Clear auto-fetched preview when manually entering
                    }
                  }}
                  placeholder="https://... (auto-fetched from title)"
                  className="w-full px-4 py-3 bg-[#1a1724]/30 border border-white/15/50 rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500/50 transition-colors"
                />
                <p className="text-xs text-white/50">
                  {formData.coverImage && coverPreview ? (
                    <span className="text-green-400">✓ Cover auto-detected from Open Library</span>
                  ) : formData.coverImage ? (
                    <span>Using custom cover URL</span>
                  ) : (
                    <span>Enter a book title above to auto-fetch the cover</span>
                  )}
                </p>
                {formData.coverImage && (
                  <button
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, coverImage: '' }));
                      setCoverPreview(null);
                      lastFetchedQuery.current = ''; // Allow re-fetch
                    }}
                    className="text-xs text-white/50 hover:text-zinc-300 underline"
                  >
                    Clear cover
                  </button>
                )}
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10/50 bg-[#12101a]/50 flex items-center justify-between">
          <p className="text-xs text-zinc-600">
            <span className="text-red-500">*</span> Required fields
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 text-white/60 hover:text-white hover:bg-[#1a1724] rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-6 py-2 bg-purple-500 hover:bg-purple-600 hover:shadow-[0_8px_32px_rgba(139,92,246,0.3)] hover:-translate-y-[1px] active:translate-y-0 text-white font-medium rounded-lg transition-all duration-150"
            >
              Add Book
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
