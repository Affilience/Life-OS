/**
 * Observatory - Knowledge Module Container
 * Apple Notes + Obsidian hybrid for notes, books, and media
 */

import React from 'react';
import { useKnowledgeStore } from '../../stores/knowledgeStore';
import Sidebar from './Sidebar';
import SearchBar from './SearchBar';
import QuickCapture from './QuickCapture';
import NoteEditor from './NoteEditor';
import MediaDetailView from './MediaDetailView';
import ProjectsView from './ProjectsView';
import LibraryView from './LibraryView';
import BooksView from './BooksView';
import PodcastsView from './PodcastsView';
import VideosView from './VideosView';
import CoursesView from './CoursesView';

// MainCanvas component - Main content area
function MainCanvas() {
  const { activeView, activeItemId, notes, books, media, collections, setActiveView } = useKnowledgeStore();

  // Get view title
  const getViewTitle = () => {
    switch (activeView) {
      case 'all-notes': return 'All Notes';
      case 'projects': return 'Projects';
      case 'library': return 'Library';
      case 'books': return 'Books';
      case 'podcasts': return 'Podcasts';
      case 'videos': return 'Videos';
      case 'courses': return 'Courses';
      case 'collections': return 'Collections';
      case 'note-detail': return 'Note';
      case 'media-detail': return 'Media';
      default: return 'Knowledge';
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#0c0a10] overflow-hidden">
      {/* Header */}
      <div className="border-b border-white/5 bg-[#0c0a10] overflow-visible relative z-20">
        <div className="px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">
            {getViewTitle()}
          </h1>
          <div className="flex items-center gap-3">
            <SearchBar />
            <QuickCapture />
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Projects View */}
        {activeView === 'projects' && <ProjectsView />}

        {/* Library View - Overview of all content */}
        {activeView === 'library' && <LibraryView />}

        {/* Books View */}
        {activeView === 'books' && <BooksView />}

        {/* Podcasts View */}
        {activeView === 'podcasts' && <PodcastsView />}

        {/* Videos View */}
        {activeView === 'videos' && <VideosView />}

        {/* Courses View */}
        {activeView === 'courses' && <CoursesView />}

        {/* All Notes View */}
        {activeView === 'all-notes' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {notes.map((note) => (
              <div
                key={note.id}
                onClick={() => setActiveView('note-detail', note.id)}
                className="bg-[#12101a]/40 backdrop-blur-sm border border-white/5 rounded-lg p-4 hover:border-purple-500/30 transition-all duration-200 cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-white group-hover:text-purple-300 transition-colors">
                    {note.title}
                  </h3>
                  {note.isFavorite && (
                    <svg
                      className="w-5 h-5 text-yellow-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  )}
                </div>
                <p className="text-sm text-white/60 line-clamp-3 mb-3">
                  {note.content.substring(0, 150)}...
                </p>
                <div className="flex flex-wrap gap-2">
                  {note.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-[#1a1724]/50 text-xs text-white/60 rounded"
                    >
                      #{tag}
                    </span>
                  ))}
                  {note.tags.length > 3 && (
                    <span className="px-2 py-1 text-xs text-white/40">
                      +{note.tags.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Collections View */}
        {activeView === 'collections' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {collections.map((collection) => (
              <div
                key={collection.id}
                className="bg-[#12101a]/40 backdrop-blur-sm border border-white/5 rounded-lg p-6 hover:border-purple-500/30 transition-all duration-200 cursor-pointer group"
                style={{ borderLeftColor: collection.color, borderLeftWidth: '3px' }}
              >
                <div className="flex items-start gap-4">
                  <span className="text-4xl">{collection.icon}</span>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-purple-300 transition-colors">
                      {collection.name}
                    </h3>
                    <p className="text-sm text-white/50 mb-3">
                      {collection.description}
                    </p>
                    <div className="text-xs text-white/40">
                      {collection.items.length} items
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Note Detail/Editor View */}
        {activeView === 'note-detail' && activeItemId && (
          <NoteEditor noteId={activeItemId} />
        )}

        {/* Media Detail View */}
        {activeView === 'media-detail' && activeItemId && (
          <MediaDetailView mediaId={activeItemId} />
        )}
      </div>
    </div>
  );
}

// Main KnowledgeModule Container
export default function KnowledgeModule() {
  return (
    <div className="flex h-screen w-full bg-[#0c0a10]">
      <Sidebar />
      <MainCanvas />
    </div>
  );
}
