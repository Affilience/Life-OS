/**
 * QuickCapture Component - Fast content creation
 * Quick actions for creating notes, books, and media
 */

import React, { useState } from 'react';
import { useKnowledgeStore } from '../../stores/knowledgeStore';
import AddMediaModal from './AddMediaModal';
import AddBookModal from './AddBookModal';

export default function QuickCapture() {
  const [isOpen, setIsOpen] = useState(false);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [showBookModal, setShowBookModal] = useState(false);
  const { createNote, setActiveView } = useKnowledgeStore();

  const handleNewNote = () => {
    const noteId = createNote({
      title: 'Untitled Note',
      content: '',
    });
    setActiveView('note-detail', noteId);
    setIsOpen(false);
  };

  const handleNewBook = () => {
    setIsOpen(false);
    setShowBookModal(true);
  };

  const handleNewMedia = () => {
    setIsOpen(false);
    setShowMediaModal(true);
  };

  const actions = [
    {
      id: 'note',
      label: 'New Note',
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
          />
        </svg>
      ),
      color: 'purple',
      handler: handleNewNote,
    },
    {
      id: 'book',
      label: 'Add Book',
      icon: (
        <svg
          className="w-5 h-5"
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
      ),
      color: 'blue',
      handler: handleNewBook,
    },
    {
      id: 'media',
      label: 'Add Media',
      icon: (
        <svg
          className="w-5 h-5"
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
      ),
      color: 'cyan',
      handler: handleNewMedia,
    },
  ];

  return (
    <div className="relative">
      {/* Main Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        data-tour="quick-capture-btn"
        className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-all duration-200 shadow-lg shadow-purple-500/20"
      >
        <svg
          className={`w-5 h-5 transition-transform duration-200 ${
            isOpen ? 'rotate-45' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
        <span className="font-medium">New</span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[9998]"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu - using portal-like fixed positioning to escape overflow clipping */}
          <div className="absolute top-full right-0 mt-2 w-64 bg-[#12101a] border border-white/10/50 rounded-lg shadow-2xl z-[9999] animate-scale-in">
            <div className="p-2">
              {actions.map((action) => (
                <button
                  key={action.id}
                  onClick={action.handler}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg
                    text-left transition-all duration-150
                    hover:bg-${action.color}-500/10
                    group
                  `}
                >
                  <div
                    className={`
                      p-2 rounded-lg
                      bg-${action.color}-500/10
                      text-${action.color}-400
                      group-hover:bg-${action.color}-500/20
                      transition-colors
                    `}
                  >
                    {action.icon}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-white group-hover:text-white">
                      {action.label}
                    </div>
                    <div className="text-xs text-white/50 mt-0.5">
                      {action.id === 'note' && 'Create a new note'}
                      {action.id === 'book' && 'Track a book you\'re reading'}
                      {action.id === 'media' && 'Save video, podcast, or article'}
                    </div>
                  </div>
                  <svg
                    className="w-4 h-4 text-zinc-600 group-hover:text-white/60 transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              ))}
            </div>

            {/* Keyboard Hints */}
            <div className="px-4 py-3 bg-[#12101a]/50 border-t border-white/10/50">
              <div className="flex items-center justify-between text-xs text-zinc-600">
                <span>Quick Actions</span>
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-1 bg-[#1a1724] rounded border border-white/15">
                    N
                  </kbd>
                  <span>Note</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Add Media Modal */}
      <AddMediaModal isOpen={showMediaModal} onClose={() => setShowMediaModal(false)} />

      {/* Add Book Modal */}
      <AddBookModal isOpen={showBookModal} onClose={() => setShowBookModal(false)} />
    </div>
  );
}
