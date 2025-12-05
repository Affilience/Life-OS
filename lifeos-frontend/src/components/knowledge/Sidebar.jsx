/**
 * Sidebar Component - Navigation for Knowledge Module
 * Organized by media types: Books, Podcasts, Videos, Courses
 */

import React from 'react';
import { useKnowledgeStore } from '../../stores/knowledgeStore';
import {
  FileText, Book, Headphones, Video, GraduationCap,
  FolderOpen, ChevronLeft, ChevronRight, Library
} from 'lucide-react';

export default function Sidebar() {
  const {
    notes,
    books,
    media,
    collections,
    activeView,
    setActiveView,
    sidebarCollapsed,
    toggleSidebar,
  } = useKnowledgeStore();

  // Count media items by type
  const podcasts = media.filter(m => m.type === 'podcast');
  const videos = media.filter(m => m.type === 'youtube' || m.type === 'video');
  const courses = media.filter(m => m.type === 'course');

  // Navigation sections
  const mainNav = [
    { id: 'all-notes', label: 'All Notes', icon: FileText, count: notes.length },
  ];

  const libraryNav = [
    { id: 'library', label: 'Library', icon: Library, count: books.length + media.length, isHeader: true },
    { id: 'books', label: 'Books', icon: Book, count: books.length },
    { id: 'podcasts', label: 'Podcasts', icon: Headphones, count: podcasts.length },
    { id: 'videos', label: 'Videos', icon: Video, count: videos.length },
    { id: 'courses', label: 'Courses', icon: GraduationCap, count: courses.length },
  ];

  const organizationNav = [
    { id: 'collections', label: 'Collections', icon: FolderOpen, count: collections.length },
  ];

  const NavButton = ({ item }) => {
    const Icon = item.icon;
    const isActive = activeView === item.id;

    if (item.isHeader) {
      return (
        <button
          onClick={() => setActiveView(item.id)}
          className={`
            w-full px-3 py-2.5 rounded-lg text-sm text-left
            flex items-center gap-3
            transition-all duration-150
            ${isActive
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
              : 'text-white/80 hover:bg-[#1a1724]/50 hover:text-white font-medium'
            }
          `}
        >
          <Icon className="w-5 h-5" />
          <span>{item.label}</span>
          <span className="ml-auto text-xs text-white/40">{item.count}</span>
        </button>
      );
    }

    return (
      <button
        onClick={() => setActiveView(item.id)}
        className={`
          w-full px-3 py-2 rounded-lg text-sm text-left
          flex items-center gap-3
          transition-all duration-150
          ${isActive
            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
            : 'text-white/60 hover:bg-[#1a1724]/50 hover:text-white'
          }
        `}
      >
        <Icon className="w-5 h-5" />
        <span>{item.label}</span>
        <span className="ml-auto text-xs text-white/40">{item.count}</span>
      </button>
    );
  };

  const CollapsedNavButton = ({ item }) => {
    const Icon = item.icon;
    const isActive = activeView === item.id;

    return (
      <button
        onClick={() => setActiveView(item.id)}
        title={item.label}
        className={`
          w-10 h-10 rounded-lg
          flex items-center justify-center
          transition-all duration-150
          ${isActive
            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
            : 'text-white/60 hover:bg-[#1a1724]/50 hover:text-white'
          }
        `}
      >
        <Icon className="w-5 h-5" />
      </button>
    );
  };

  return (
    <div
      className={`
        ${sidebarCollapsed ? 'w-16' : 'w-64'}
        bg-[#12101a]/40 backdrop-blur-md
        border-r border-white/5
        flex flex-col
        transition-all duration-300 ease-in-out
      `}
    >
      {/* Header */}
      <div className="p-3 border-b border-white/5 flex items-center justify-between">
        {!sidebarCollapsed && (
          <h2 className="text-base font-semibold text-white pl-1">Knowledge</h2>
        )}
        <button
          onClick={toggleSidebar}
          className="p-2 hover:bg-[#1a1724]/50 rounded-lg transition-all duration-150 text-white/60 hover:text-white"
        >
          {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation */}
      {sidebarCollapsed ? (
        // Collapsed view - icons only
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {mainNav.map(item => (
            <CollapsedNavButton key={item.id} item={item} />
          ))}

          <div className="h-px bg-white/5 my-2" />

          {libraryNav.map(item => (
            <CollapsedNavButton key={item.id} item={item} />
          ))}

          <div className="h-px bg-white/5 my-2" />

          {organizationNav.map(item => (
            <CollapsedNavButton key={item.id} item={item} />
          ))}
        </div>
      ) : (
        // Expanded view
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {/* Main Navigation */}
          <nav className="space-y-1">
            {mainNav.map(item => (
              <NavButton key={item.id} item={item} />
            ))}
          </nav>

          {/* Library Section */}
          <div>
            <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2 px-3">
              Library
            </h3>
            <nav className="space-y-1">
              {libraryNav.map(item => (
                <NavButton key={item.id} item={item} />
              ))}
            </nav>
          </div>

          {/* Organization Section */}
          <div>
            <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2 px-3">
              Organization
            </h3>
            <nav className="space-y-1">
              {organizationNav.map(item => (
                <NavButton key={item.id} item={item} />
              ))}
            </nav>
          </div>

          {/* Collections List */}
          {collections.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2 px-3">
                Your Collections
              </h3>
              <div className="space-y-1">
                {collections.slice(0, 5).map((collection) => (
                  <button
                    key={collection.id}
                    onClick={() => setActiveView('collection-detail', collection.id)}
                    className="w-full px-3 py-2 rounded-lg text-sm text-left flex items-center gap-3 text-white/60 hover:bg-[#1a1724]/50 hover:text-white transition-all duration-150"
                  >
                    <span className="text-base">{collection.icon}</span>
                    <span className="flex-1 truncate">{collection.name}</span>
                    <span className="text-xs text-white/40">
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
