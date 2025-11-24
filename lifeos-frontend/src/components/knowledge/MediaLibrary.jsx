/**
 * MediaLibrary Component - Video, Podcast, and Article Management
 * Displays media items with filtering, sorting, and click-to-view
 */

import React, { useState } from 'react';
import { useKnowledgeStore } from '../../stores/knowledgeStore';

export default function MediaLibrary() {
  const { media, setActiveView } = useKnowledgeStore();
  const [filterType, setFilterType] = useState('all'); // all, video, podcast, article, course
  const [sortBy, setSortBy] = useState('recent'); // recent, title, creator, duration

  // Filter media by type
  const filteredMedia = media.filter((item) => {
    if (filterType === 'all') return true;
    return item.type === filterType;
  });

  // Sort media
  const sortedMedia = [...filteredMedia].sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return new Date(b.addedAt) - new Date(a.addedAt);
      case 'title':
        return a.title.localeCompare(b.title);
      case 'creator':
        return a.creator.localeCompare(b.creator);
      case 'duration':
        // Parse duration strings like "45:30" or "2:15:30"
        const getDurationMinutes = (duration) => {
          const parts = duration.split(':').map(Number);
          if (parts.length === 2) return parts[0] * 60 + parts[1];
          if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
          return 0;
        };
        return getDurationMinutes(a.duration) - getDurationMinutes(b.duration);
      default:
        return 0;
    }
  });

  const handleMediaClick = (mediaId) => {
    setActiveView('media-detail', mediaId);
  };

  // Count items by type
  const counts = {
    all: media.length,
    video: media.filter((m) => m.type === 'video').length,
    podcast: media.filter((m) => m.type === 'podcast').length,
    article: media.filter((m) => m.type === 'article').length,
    course: media.filter((m) => m.type === 'course').length,
  };

  const filterOptions = [
    { id: 'all', label: 'All Media', count: counts.all },
    { id: 'video', label: 'Videos', count: counts.video },
    { id: 'podcast', label: 'Podcasts', count: counts.podcast },
    { id: 'article', label: 'Articles', count: counts.article },
    { id: 'course', label: 'Courses', count: counts.course },
  ];

  const sortOptions = [
    { id: 'recent', label: 'Recently Added' },
    { id: 'title', label: 'Title (A-Z)' },
    { id: 'creator', label: 'Creator' },
    { id: 'duration', label: 'Duration' },
  ];

  return (
    <div className="space-y-6">
      {/* Filters and Sorting Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Type Filters */}
        <div className="flex flex-wrap gap-2">
          {filterOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => setFilterType(option.id)}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150
                ${
                  filterType === option.id
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'bg-zinc-800/30 text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200 border border-transparent'
                }
              `}
            >
              {option.label}
              <span className="ml-2 text-xs opacity-70">{option.count}</span>
            </button>
          ))}
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-zinc-500">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 bg-zinc-800/30 border border-zinc-700/50 rounded-lg text-sm text-zinc-300 focus:outline-none focus:border-cyan-500/50 transition-colors"
          >
            {sortOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Media Grid */}
      {sortedMedia.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-16 h-16 mb-4 rounded-full bg-cyan-500/10 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-cyan-500"
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
          <h3 className="text-lg font-medium text-zinc-400 mb-2">
            No {filterType !== 'all' ? filterType + 's' : 'media'} yet
          </h3>
          <p className="text-sm text-zinc-600">
            Click the "New" button to add videos, podcasts, or articles
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedMedia.map((item) => (
            <div
              key={item.id}
              onClick={() => handleMediaClick(item.id)}
              className="bg-zinc-900/40 backdrop-blur-sm border border-zinc-800/50 rounded-lg overflow-hidden hover:border-cyan-500/30 transition-all duration-200 cursor-pointer group"
            >
              {/* Thumbnail */}
              <div className="relative aspect-video bg-zinc-900">
                {item.thumbnailUrl ? (
                  <img
                    src={item.thumbnailUrl}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900">
                    <svg
                      className="w-12 h-12 text-zinc-700"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      {item.type === 'video' && (
                        <>
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
                        </>
                      )}
                      {item.type === 'podcast' && (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                        />
                      )}
                      {item.type === 'article' && (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      )}
                      {item.type === 'course' && (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                        />
                      )}
                    </svg>
                  </div>
                )}

                {/* Play Overlay */}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg
                    className="w-16 h-16 text-white drop-shadow-lg"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                  </svg>
                </div>

                {/* Duration Badge */}
                <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/80 backdrop-blur-sm rounded text-xs font-medium text-white">
                  {item.duration}
                </div>

                {/* Type Badge */}
                <div className="absolute top-2 left-2 px-2 py-1 bg-cyan-500/80 backdrop-blur-sm rounded text-xs font-medium text-white capitalize">
                  {item.type}
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="text-sm font-semibold text-white mb-1 line-clamp-2 group-hover:text-cyan-300 transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-zinc-500 mb-3">{item.creator}</p>

                <div className="flex items-center justify-between text-xs text-zinc-600">
                  <span>{new Date(item.addedAt).toLocaleDateString()}</span>
                  {item.notes && (
                    <div className="flex items-center gap-1">
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                        />
                      </svg>
                      <span>Notes</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats Summary */}
      {sortedMedia.length > 0 && (
        <div className="pt-4 border-t border-zinc-800/50">
          <div className="text-sm text-zinc-600">
            Showing {sortedMedia.length} of {media.length} items
          </div>
        </div>
      )}
    </div>
  );
}
