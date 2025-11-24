/**
 * Observatory - Knowledge Module Container
 * Apple Notes + Obsidian hybrid for notes, books, and media
 */

import React, { useState, useMemo } from 'react';
import { useKnowledgeStore } from '../../stores/knowledgeStore';
import Sidebar from './Sidebar';
import SearchBar from './SearchBar';
import QuickCapture from './QuickCapture';
import NoteEditor from './NoteEditor';
import MediaLibrary from './MediaLibrary';
import MediaDetailView from './MediaDetailView';
import ProjectsView from './ProjectsView';
import ContentView from './ContentView';

// MainCanvas component - Main content area
function MainCanvas() {
  const { activeView, activeItemId, notes, books, media, collections, setActiveView } = useKnowledgeStore();

  return (
    <div className="flex-1 flex flex-col bg-[#0a0a0a] overflow-hidden">
      {/* Header */}
      <div className="border-b border-zinc-800/50 bg-zinc-900/20 backdrop-blur-sm overflow-visible relative z-20">
        <div className="px-8 py-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">
            {activeView === 'all-notes' && 'All Notes'}
            {activeView === 'projects' && 'Projects'}
            {activeView === 'content' && 'Content Consumption'}
            {activeView === 'books' && 'Books'}
            {activeView === 'media' && 'Media Library'}
            {activeView === 'collections' && 'Collections'}
            {activeView === 'note-detail' && 'Note'}
            {activeView === 'media-detail' && 'Media'}
          </h1>
          <div className="flex items-center gap-3">
            <SearchBar />
            <QuickCapture />
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-8">
        {/* Projects View */}
        {activeView === 'projects' && <ProjectsView />}

        {/* Content Consumption View */}
        {activeView === 'content' && <ContentView />}

        {/* All Notes View */}
        {activeView === 'all-notes' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {notes.map((note) => (
              <div
                key={note.id}
                onClick={() => setActiveView('note-detail', note.id)}
                className="bg-zinc-900/40 backdrop-blur-sm border border-zinc-800/50 rounded-lg p-4 hover:border-purple-500/30 transition-all duration-200 cursor-pointer group"
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
                <p className="text-sm text-zinc-400 line-clamp-3 mb-3">
                  {note.content.substring(0, 150)}...
                </p>
                <div className="flex flex-wrap gap-2">
                  {note.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-zinc-800/50 text-xs text-zinc-400 rounded"
                    >
                      #{tag}
                    </span>
                  ))}
                  {note.tags.length > 3 && (
                    <span className="px-2 py-1 text-xs text-zinc-600">
                      +{note.tags.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Books View */}
        {activeView === 'books' && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {books.map((book) => (
              <div
                key={book.id}
                className="group cursor-pointer"
              >
                <div className="relative aspect-[2/3] mb-3 rounded-lg overflow-hidden bg-zinc-900 border border-zinc-800/50 group-hover:border-purple-500/50 transition-all duration-200">
                  {book.coverImage ? (
                    <img
                      src={book.coverImage}
                      alt={book.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg
                        className="w-12 h-12 text-zinc-700"
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
                  )}
                  {book.status === 'reading' && (
                    <div className="absolute inset-x-0 bottom-0 h-1 bg-zinc-800">
                      <div
                        className="h-full bg-purple-500"
                        style={{
                          width: `${
                            (book.progress.current / book.progress.total) * 100
                          }%`,
                        }}
                      />
                    </div>
                  )}
                </div>
                <h3 className="text-sm font-medium text-white line-clamp-2 mb-1 group-hover:text-purple-300 transition-colors">
                  {book.title}
                </h3>
                <p className="text-xs text-zinc-500">{book.author}</p>
              </div>
            ))}
          </div>
        )}

        {/* Media View */}
        {activeView === 'media' && <MediaLibrary />}

        {/* Collections View */}
        {activeView === 'collections' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {collections.map((collection) => (
              <div
                key={collection.id}
                className="bg-zinc-900/40 backdrop-blur-sm border border-zinc-800/50 rounded-lg p-6 hover:border-purple-500/30 transition-all duration-200 cursor-pointer group"
                style={{ borderLeftColor: collection.color, borderLeftWidth: '3px' }}
              >
                <div className="flex items-start gap-4">
                  <span className="text-4xl">{collection.icon}</span>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-purple-300 transition-colors">
                      {collection.name}
                    </h3>
                    <p className="text-sm text-zinc-500 mb-3">
                      {collection.description}
                    </p>
                    <div className="text-xs text-zinc-600">
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
    <div className="flex h-screen w-full bg-[#0a0a0a]">
      <Sidebar />
      <MainCanvas />
    </div>
  );
}
