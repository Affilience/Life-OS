/**
 * SearchBar Component - Universal Search with CMD+K
 * Searches across notes, books, and media
 */

import React, { useState, useEffect, useRef } from 'react';
import { useKnowledgeStore } from '../../stores/knowledgeStore';

export default function SearchBar() {
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef(null);
  const modalRef = useRef(null);

  const {
    searchQuery,
    searchResults,
    isSearching,
    search,
    clearSearch,
    setActiveView,
  } = useKnowledgeStore();

  // CMD+K / CTRL+K shortcut to open search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      // Escape to close
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        clearSearch();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, clearSearch]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        setIsOpen(false);
        clearSearch();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, clearSearch]);

  const handleSearch = (e) => {
    const query = e.target.value;
    search(query);
  };

  const handleResultClick = (result) => {
    if (result.type === 'note') {
      setActiveView('note-detail', result.id);
    } else if (result.type === 'book') {
      setActiveView('books', result.id);
    } else if (result.type === 'media') {
      setActiveView('media', result.id);
    }
    setIsOpen(false);
    clearSearch();
  };

  // Group results by type
  const groupedResults = {
    notes: searchResults.filter((r) => r.type === 'note'),
    books: searchResults.filter((r) => r.type === 'book'),
    media: searchResults.filter((r) => r.type === 'media'),
  };

  return (
    <>
      {/* Search Button - Opens modal */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-[#12101a]/40 backdrop-blur-sm border border-white/10/50 rounded-lg hover:border-purple-500/30 transition-all duration-200 group"
      >
        <svg
          className="w-5 h-5 text-white/60 group-hover:text-purple-400 transition-colors"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <span className="text-sm text-white/60 group-hover:text-zinc-300 transition-colors">
          Search
        </span>
        <div className="flex items-center gap-1 ml-auto">
          <kbd className="px-2 py-1 text-xs bg-[#1a1724] text-white/60 rounded border border-white/15">
            ⌘K
          </kbd>
        </div>
      </button>

      {/* Search Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center pt-32 px-4">
          <div
            ref={modalRef}
            className="w-full max-w-2xl bg-[#12101a]/95 backdrop-blur-md border border-white/10/50 rounded-xl shadow-2xl overflow-hidden animate-scale-in"
          >
            {/* Search Input */}
            <div className="p-4 border-b border-white/10/50">
              <div className="flex items-center gap-3">
                <svg
                  className="w-5 h-5 text-white/50"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search notes, books, and media..."
                  value={searchQuery}
                  onChange={handleSearch}
                  className="flex-1 bg-transparent border-none outline-none text-white placeholder-zinc-500 text-lg"
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      clearSearch();
                      inputRef.current?.focus();
                    }}
                    className="p-1 hover:bg-[#1a1724] rounded transition-colors"
                  >
                    <svg
                      className="w-5 h-5 text-white/50"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Search Results */}
            <div className="max-h-96 overflow-y-auto">
              {!searchQuery && (
                <div className="p-8 text-center">
                  <div className="text-zinc-600 text-sm">
                    Start typing to search across all your knowledge
                  </div>
                </div>
              )}

              {searchQuery && isSearching && (
                <div className="p-8 text-center">
                  <div className="text-white/50 text-sm">Searching...</div>
                </div>
              )}

              {searchQuery && !isSearching && searchResults.length === 0 && (
                <div className="p-8 text-center">
                  <div className="text-white/50 text-sm">
                    No results found for "{searchQuery}"
                  </div>
                </div>
              )}

              {searchQuery && !isSearching && searchResults.length > 0 && (
                <div className="py-2">
                  {/* Notes Results */}
                  {groupedResults.notes.length > 0 && (
                    <div className="mb-4">
                      <div className="px-4 py-2 text-xs font-semibold text-zinc-600 uppercase tracking-wider">
                        Notes ({groupedResults.notes.length})
                      </div>
                      <div className="space-y-1">
                        {groupedResults.notes.map((note) => (
                          <button
                            key={note.id}
                            onClick={() => handleResultClick(note)}
                            className="w-full px-4 py-3 text-left hover:bg-[#1a1724]/50 transition-colors group"
                          >
                            <div className="flex items-start gap-3">
                              <div className="p-2 bg-purple-500/10 rounded-lg">
                                <svg
                                  className="w-4 h-4 text-purple-400"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                  />
                                </svg>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-white group-hover:text-purple-300 transition-colors">
                                  {note.title}
                                </div>
                                <div className="text-xs text-white/50 line-clamp-1 mt-1">
                                  {note.content.substring(0, 100)}...
                                </div>
                                {note.tags.length > 0 && (
                                  <div className="flex gap-2 mt-2">
                                    {note.tags.slice(0, 3).map((tag) => (
                                      <span
                                        key={tag}
                                        className="text-xs text-zinc-600"
                                      >
                                        #{tag}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Books Results */}
                  {groupedResults.books.length > 0 && (
                    <div className="mb-4">
                      <div className="px-4 py-2 text-xs font-semibold text-zinc-600 uppercase tracking-wider">
                        Books ({groupedResults.books.length})
                      </div>
                      <div className="space-y-1">
                        {groupedResults.books.map((book) => (
                          <button
                            key={book.id}
                            onClick={() => handleResultClick(book)}
                            className="w-full px-4 py-3 text-left hover:bg-[#1a1724]/50 transition-colors group"
                          >
                            <div className="flex items-start gap-3">
                              <div className="p-2 bg-blue-500/10 rounded-lg">
                                <svg
                                  className="w-4 h-4 text-blue-400"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                                  />
                                </svg>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-white group-hover:text-blue-300 transition-colors">
                                  {book.title}
                                </div>
                                <div className="text-xs text-white/50 mt-1">
                                  {book.author}
                                </div>
                                <div className="text-xs text-zinc-600 mt-1">
                                  {book.status === 'reading'
                                    ? `Reading - ${book.progress.current}/${book.progress.total} ${book.progress.unit}s`
                                    : book.status === 'completed'
                                    ? 'Completed'
                                    : 'Want to Read'}
                                </div>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Media Results */}
                  {groupedResults.media.length > 0 && (
                    <div className="mb-4">
                      <div className="px-4 py-2 text-xs font-semibold text-zinc-600 uppercase tracking-wider">
                        Media ({groupedResults.media.length})
                      </div>
                      <div className="space-y-1">
                        {groupedResults.media.map((item) => (
                          <button
                            key={item.id}
                            onClick={() => handleResultClick(item)}
                            className="w-full px-4 py-3 text-left hover:bg-[#1a1724]/50 transition-colors group"
                          >
                            <div className="flex items-start gap-3">
                              <div className="p-2 bg-cyan-500/10 rounded-lg">
                                <svg
                                  className="w-4 h-4 text-cyan-400"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-white group-hover:text-cyan-300 transition-colors">
                                  {item.title}
                                </div>
                                <div className="text-xs text-white/50 mt-1">
                                  {item.creator}
                                </div>
                                <div className="flex items-center gap-3 text-xs text-zinc-600 mt-1">
                                  <span className="capitalize">{item.type}</span>
                                  <span>•</span>
                                  <span>{item.duration}</span>
                                </div>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer Hints */}
            <div className="px-4 py-3 border-t border-white/10/50 bg-[#12101a]/50">
              <div className="flex items-center justify-between text-xs text-zinc-600">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <kbd className="px-2 py-1 bg-[#1a1724] rounded border border-white/15">
                      ↑↓
                    </kbd>
                    <span>Navigate</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <kbd className="px-2 py-1 bg-[#1a1724] rounded border border-white/15">
                      ↵
                    </kbd>
                    <span>Open</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-1 bg-[#1a1724] rounded border border-white/15">
                    esc
                  </kbd>
                  <span>Close</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
