/**
 * Sidebar Component - Navigation for Knowledge Module
 * Collapsible sidebar with navigation to notes, books, media, and collections
 */

import React from 'react';
import { useKnowledgeStore } from '../../stores/knowledgeStore';
import { useContentStore } from '../../stores/contentStore';
import { Rocket, Sparkles } from 'lucide-react';

export default function Sidebar() {
  const {
    notes,
    books,
    media,
    collections,
    projects,
    activeView,
    setActiveView,
    sidebarCollapsed,
    toggleSidebar,
  } = useKnowledgeStore();

  const { contentItems } = useContentStore();

  return (
    <div
      className={`
        ${sidebarCollapsed ? 'w-16' : 'w-72'}
        bg-[#12101a]/40 backdrop-blur-md
        border-r border-white/10/50
        flex flex-col
        transition-all duration-300 ease-in-out
      `}
    >
      {/* Collapse Toggle */}
      <div className="p-4 border-b border-white/10/50 flex items-center justify-between">
        {!sidebarCollapsed && (
          <h2 className="text-lg font-semibold text-white">Knowledge</h2>
        )}
        <button
          onClick={toggleSidebar}
          className="p-2 hover:bg-[#1a1724]/50 rounded-lg transition-all duration-150"
        >
          {sidebarCollapsed ? (
            <svg
              className="w-5 h-5 text-white/60"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 5l7 7-7 7M5 5l7 7-7 7"
              />
            </svg>
          ) : (
            <svg
              className="w-5 h-5 text-white/60"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
              />
            </svg>
          )}
        </button>
      </div>

      {!sidebarCollapsed && (
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Quick Navigation */}
          <nav className="space-y-1">
            <button
              onClick={() => setActiveView('all-notes')}
              className={`
                w-full px-3 py-2 rounded-lg text-sm text-left
                flex items-center gap-3
                transition-all duration-150
                ${
                  activeView === 'all-notes'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    : 'text-white/60 hover:bg-[#1a1724]/50 hover:text-zinc-200'
                }
              `}
            >
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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span>All Notes</span>
              <span className="ml-auto text-xs text-zinc-600">{notes.length}</span>
            </button>

            <button
              onClick={() => setActiveView('projects')}
              className={`
                w-full px-3 py-2 rounded-lg text-sm text-left
                flex items-center gap-3
                transition-all duration-150
                ${
                  activeView === 'projects'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    : 'text-white/60 hover:bg-[#1a1724]/50 hover:text-zinc-200'
                }
              `}
            >
              <Rocket className="w-5 h-5" />
              <span>Projects</span>
              <span className="ml-auto text-xs text-zinc-600">{projects.length}</span>
            </button>

            <button
              onClick={() => setActiveView('content')}
              className={`
                w-full px-3 py-2 rounded-lg text-sm text-left
                flex items-center gap-3
                transition-all duration-150
                ${
                  activeView === 'content'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    : 'text-white/60 hover:bg-[#1a1724]/50 hover:text-zinc-200'
                }
              `}
            >
              <Sparkles className="w-5 h-5" />
              <span>Content</span>
              <span className="ml-auto text-xs text-zinc-600">{contentItems.length}</span>
            </button>

            <button
              onClick={() => setActiveView('books')}
              className={`
                w-full px-3 py-2 rounded-lg text-sm text-left
                flex items-center gap-3
                transition-all duration-150
                ${
                  activeView === 'books'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    : 'text-white/60 hover:bg-[#1a1724]/50 hover:text-zinc-200'
                }
              `}
            >
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
              <span>Books</span>
              <span className="ml-auto text-xs text-zinc-600">{books.length}</span>
            </button>

            <button
              onClick={() => setActiveView('media')}
              className={`
                w-full px-3 py-2 rounded-lg text-sm text-left
                flex items-center gap-3
                transition-all duration-150
                ${
                  activeView === 'media'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    : 'text-white/60 hover:bg-[#1a1724]/50 hover:text-zinc-200'
                }
              `}
            >
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
              <span>Media</span>
              <span className="ml-auto text-xs text-zinc-600">{media.length}</span>
            </button>

            <button
              onClick={() => setActiveView('collections')}
              className={`
                w-full px-3 py-2 rounded-lg text-sm text-left
                flex items-center gap-3
                transition-all duration-150
                ${
                  activeView === 'collections'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    : 'text-white/60 hover:bg-[#1a1724]/50 hover:text-zinc-200'
                }
              `}
            >
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
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
              <span>Collections</span>
              <span className="ml-auto text-xs text-zinc-600">
                {collections.length}
              </span>
            </button>
          </nav>

          {/* Collections List */}
          {collections.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-zinc-600 uppercase tracking-wider mb-2 px-3">
                Collections
              </h3>
              <div className="space-y-1">
                {collections.slice(0, 5).map((collection) => (
                  <button
                    key={collection.id}
                    onClick={() => setActiveView('collections', collection.id)}
                    className="w-full px-3 py-2 rounded-lg text-sm text-left flex items-center gap-3 text-white/60 hover:bg-[#1a1724]/50 hover:text-zinc-200 transition-all duration-150"
                  >
                    <span className="text-lg">{collection.icon}</span>
                    <span className="flex-1 truncate">{collection.name}</span>
                    <span className="text-xs text-zinc-600">
                      {collection.items.length}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
