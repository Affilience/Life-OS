/**
 * NoteEditor Component - Rich markdown editor with auto-save
 * Obsidian-style note editing with wiki-links and tags
 */

import React, { useState, useEffect, useRef } from 'react';
import { useKnowledgeStore } from '../../stores/knowledgeStore';

export default function NoteEditor({ noteId }) {
  const { getNoteById, updateNote, setActiveView, deleteNote } = useKnowledgeStore();
  const note = getNoteById(noteId);
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(new Date(note?.updatedAt || Date.now()));

  const saveTimeoutRef = useRef(null);
  const contentRef = useRef(null);

  // Auto-save functionality with debounce
  useEffect(() => {
    if (!note) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      if (title !== note.title || content !== note.content) {
        setIsSaving(true);
        updateNote(noteId, { title, content });
        setLastSaved(new Date());
        setTimeout(() => setIsSaving(false), 500);
      }
    }, 1000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [title, content, noteId, note, updateNote]);

  // Initialize state when note changes
  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setLastSaved(new Date(note.updatedAt));
    }
  }, [noteId]);

  if (!note) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-zinc-500 mb-4">Note not found</div>
          <button
            onClick={() => setActiveView('all-notes')}
            className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
          >
            Back to Notes
          </button>
        </div>
      </div>
    );
  }

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete "${note.title}"?`)) {
      deleteNote(noteId);
      setActiveView('all-notes');
    }
  };

  const handleToggleFavorite = () => {
    updateNote(noteId, { isFavorite: !note.isFavorite });
  };

  const formatRelativeTime = (date) => {
    const now = new Date();
    const diff = now - date;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (seconds < 10) return 'just now';
    if (seconds < 60) return `${seconds}s ago`;
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Editor Header */}
      <div className="border-b border-zinc-800/50 bg-zinc-900/20 backdrop-blur-sm px-8 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setActiveView('all-notes')}
            className="flex items-center gap-2 px-3 py-2 text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-all duration-150"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm font-medium">All Notes</span>
          </button>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 text-xs text-zinc-500 mr-2">
              {isSaving ? (
                <>
                  <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span>Saved {formatRelativeTime(lastSaved)}</span>
                </>
              )}
            </div>

            <button
              onClick={handleToggleFavorite}
              className={`p-2 rounded-lg transition-all duration-150 ${
                note.isFavorite
                  ? 'text-yellow-500 bg-yellow-500/10'
                  : 'text-zinc-400 hover:text-yellow-500 hover:bg-zinc-800/50'
              }`}
            >
              <svg className="w-5 h-5" fill={note.isFavorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </button>

            <button
              onClick={handleDelete}
              className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all duration-150"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-8 py-8">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Untitled Note"
            className="w-full text-4xl font-bold text-white bg-transparent border-none outline-none placeholder-zinc-700 mb-6"
          />

          <div className="flex items-center gap-4 text-xs text-zinc-600 mb-6 pb-6 border-b border-zinc-800/50">
            <span>Created {new Date(note.createdAt).toLocaleDateString()}</span>
            <span>•</span>
            <span>Updated {new Date(note.updatedAt).toLocaleDateString()}</span>
          </div>

          <textarea
            ref={contentRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start writing... Use [[wiki links]] and #tags"
            className="w-full min-h-[500px] text-base text-zinc-200 bg-transparent border-none outline-none placeholder-zinc-700 resize-none font-mono leading-relaxed"
            style={{ fontFamily: 'ui-monospace, monospace' }}
          />

          {note.tags && note.tags.length > 0 && (
            <div className="mt-8 pt-6 border-t border-zinc-800/50">
              <div className="text-sm text-zinc-500 mb-3">Tags</div>
              <div className="flex flex-wrap gap-2">
                {note.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-purple-500/10 text-purple-400 text-sm rounded-lg border border-purple-500/20"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-zinc-800/50 bg-zinc-900/20 px-8 py-3">
        <div className="text-xs text-zinc-600 flex items-center gap-4">
          <span>Markdown supported</span>
          <span>•</span>
          <span>Use [[wiki links]] to link notes</span>
          <span>•</span>
          <span>Use #tags for organization</span>
          <span>•</span>
          <span className="text-green-500">Auto-saves every second</span>
        </div>
      </div>
    </div>
  );
}
