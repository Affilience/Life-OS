/**
 * MediaDetailView Component - View/Edit Media Item
 * Display full details, edit notes, add tags, link to content
 */

import React, { useState, useEffect, useRef } from 'react';
import { useKnowledgeStore } from '../../stores/knowledgeStore';

export default function MediaDetailView({ mediaId }) {
  const { getMediaById, updateMedia, deleteMedia, setActiveView } = useKnowledgeStore();
  const media = getMediaById(mediaId);
  const [notes, setNotes] = useState(media?.notes || '');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(new Date(media?.updatedAt || Date.now()));

  const saveTimeoutRef = useRef(null);

  // Auto-save notes
  useEffect(() => {
    if (!media) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      if (notes !== media.notes) {
        setIsSaving(true);
        updateMedia(mediaId, { notes });
        setLastSaved(new Date());
        setTimeout(() => setIsSaving(false), 500);
      }
    }, 1000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [notes, mediaId, media, updateMedia]);

  // Initialize state when media changes
  useEffect(() => {
    if (media) {
      setNotes(media.notes || '');
      setLastSaved(new Date(media.updatedAt));
    }
  }, [mediaId]);

  if (!media) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-white/50 mb-4">Media not found</div>
          <button
            onClick={() => setActiveView('media')}
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors"
          >
            Back to Media Library
          </button>
        </div>
      </div>
    );
  }

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete "${media.title}"?`)) {
      deleteMedia(mediaId);
      setActiveView('media');
    }
  };

  const handleOpenLink = () => {
    if (media.url) {
      window.open(media.url, '_blank');
    }
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

  const getTypeIcon = () => {
    switch (media.type) {
      case 'video':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        );
      case 'podcast':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
            />
          </svg>
        );
      case 'article':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        );
      case 'course':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-white/10/50 bg-[#12101a]/20 backdrop-blur-sm px-8 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setActiveView('media')}
            className="flex items-center gap-2 px-3 py-2 text-white/60 hover:text-white hover:bg-[#1a1724]/50 rounded-lg transition-all duration-150"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm font-medium">Media Library</span>
          </button>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 text-xs text-white/50 mr-2">
              {isSaving ? (
                <>
                  <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                  <span>Saving notes...</span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span>Saved {formatRelativeTime(lastSaved)}</span>
                </>
              )}
            </div>

            <button
              onClick={handleDelete}
              className="p-2 text-white/60 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all duration-150"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-8 py-8">
          {/* Media Card */}
          <div className="bg-[#12101a]/40 backdrop-blur-sm border border-white/10/50 rounded-xl overflow-hidden mb-8">
            <div className="grid md:grid-cols-[300px_1fr] gap-6 p-6">
              {/* Thumbnail */}
              <div className="relative aspect-video md:aspect-[3/4] rounded-lg overflow-hidden bg-[#12101a]">
                {media.thumbnailUrl ? (
                  <img
                    src={media.thumbnailUrl}
                    alt={media.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900">
                    <div className="text-cyan-500">{getTypeIcon()}</div>
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="inline-block px-3 py-1 bg-cyan-500/20 text-cyan-400 text-xs font-medium rounded-lg border border-cyan-500/30 mb-3 capitalize">
                      {media.type}
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">{media.title}</h1>
                    <p className="text-lg text-white/60 mb-4">{media.creator}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-[#1a1724]/30 rounded-lg p-4">
                    <div className="text-xs text-zinc-600 mb-1">Duration</div>
                    <div className="text-sm font-medium text-white">{media.duration}</div>
                  </div>
                  <div className="bg-[#1a1724]/30 rounded-lg p-4">
                    <div className="text-xs text-zinc-600 mb-1">Added</div>
                    <div className="text-sm font-medium text-white">
                      {new Date(media.addedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {media.url && (
                  <button
                    onClick={handleOpenLink}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                    <span>Open {media.type === 'article' ? 'Article' : 'Content'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Notes Section */}
          <div className="bg-[#12101a]/40 backdrop-blur-sm border border-white/10/50 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                />
              </svg>
              <h2 className="text-lg font-semibold text-white">Notes & Takeaways</h2>
            </div>

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add your notes, key takeaways, or reflections here..."
              className="w-full min-h-[300px] text-base text-zinc-200 bg-[#1a1724]/20 border border-white/15/50 rounded-lg p-4 outline-none placeholder-zinc-700 resize-none font-mono leading-relaxed focus:border-cyan-500/50 transition-colors"
              style={{ fontFamily: 'ui-monospace, monospace' }}
            />

            <div className="mt-4 text-xs text-zinc-600">
              Notes are auto-saved as you type. Use markdown formatting for better organization.
            </div>
          </div>

          {/* Metadata */}
          <div className="mt-6 pt-6 border-t border-white/10/50">
            <div className="flex items-center gap-4 text-xs text-zinc-600">
              <span>Created {new Date(media.addedAt).toLocaleString()}</span>
              <span>•</span>
              <span>Last updated {new Date(media.updatedAt).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
