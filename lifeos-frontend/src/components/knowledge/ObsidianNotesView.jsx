import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  FolderTree,
  Network,
  Tag,
  Settings,
  Star,
  ChevronRight
} from 'lucide-react';
import NoteEditor from './NoteEditor';
import GraphView from './GraphView';
import BacklinksPanel from './BacklinksPanel';
import QuickSwitcher from './QuickSwitcher';
import CommandPalette from './CommandPalette';
import './ObsidianNotesView.css';

export default function ObsidianNotesView() {
  const [notes, setNotes] = useState([]);
  const [openTabs, setOpenTabs] = useState([]); // Array of note IDs
  const [activeTabId, setActiveTabId] = useState(null); // Currently active tab
  const [viewMode, setViewMode] = useState('editor'); // 'editor' or 'graph'
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [quickSwitcherOpen, setQuickSwitcherOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Get current note from active tab
  const currentNote = notes.find(note => note.id === activeTabId) || null;

  // Load notes from localStorage or API
  useEffect(() => {
    const savedNotes = localStorage.getItem('obsidian-notes');
    if (savedNotes) {
      const loadedNotes = JSON.parse(savedNotes);
      setNotes(loadedNotes);
      if (loadedNotes.length > 0) {
        setOpenTabs([loadedNotes[0].id]);
        setActiveTabId(loadedNotes[0].id);
      }
    } else {
      // Initialize with sample notes
      const sampleNotes = [
        {
          id: '1',
          title: 'Welcome to Your Knowledge Base',
          content: `# Welcome to Your Knowledge Base

This is your personal Obsidian-style note system.

## Features
- **Bidirectional linking**: Use [[double brackets]] to link notes
- **Tags**: Use #tags to categorise
- **Graph view**: Visualize connections
- **Markdown**: Full markdown support

## Quick Start
Try creating a new note with Cmd+N or click the + button.

Link to another note: [[My Second Note]]

#getting-started #tutorial`,
          tags: ['getting-started', 'tutorial'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          folder: null
        },
        {
          id: '2',
          title: 'My Second Note',
          content: `# My Second Note

This note is linked from the [[Welcome to Your Knowledge Base]] note.

Try adding more connections!

#example`,
          tags: ['example'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          folder: null
        }
      ];
      setNotes(sampleNotes);
      setOpenTabs([sampleNotes[0].id]);
      setActiveTabId(sampleNotes[0].id);
      localStorage.setItem('obsidian-notes', JSON.stringify(sampleNotes));
    }
  }, []);

  // Save notes to localStorage whenever they change
  useEffect(() => {
    if (notes.length > 0) {
      localStorage.setItem('obsidian-notes', JSON.stringify(notes));
    }
  }, [notes]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Cmd/Ctrl + P = Command Palette
      if ((e.metaKey || e.ctrlKey) && e.key === 'p') {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }

      // Cmd/Ctrl + O = Quick Switcher
      if ((e.metaKey || e.ctrlKey) && e.key === 'o') {
        e.preventDefault();
        setQuickSwitcherOpen(true);
      }

      // Cmd/Ctrl + N = New Note
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault();
        createNewNote();
      }

      // Cmd/Ctrl + \ = Toggle Sidebar
      if ((e.metaKey || e.ctrlKey) && e.key === '\\') {
        e.preventDefault();
        setSidebarOpen(!sidebarOpen);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [sidebarOpen, notes]);

  // Tab management functions
  const openNoteInTab = (note) => {
    if (!openTabs.includes(note.id)) {
      setOpenTabs([...openTabs, note.id]);
    }
    setActiveTabId(note.id);
    setViewMode('editor');
  };

  const closeTab = (noteId) => {
    const newTabs = openTabs.filter(id => id !== noteId);
    setOpenTabs(newTabs);

    // If closing active tab, switch to another tab
    if (activeTabId === noteId) {
      if (newTabs.length > 0) {
        const currentIndex = openTabs.indexOf(noteId);
        const newActiveIndex = currentIndex > 0 ? currentIndex - 1 : 0;
        setActiveTabId(newTabs[newActiveIndex]);
      } else {
        setActiveTabId(null);
      }
    }
  };

  const createNewNote = () => {
    const newNote = {
      id: Date.now().toString(),
      title: 'Untitled',
      content: '# Untitled\n\n',
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      folder: null
    };
    setNotes([...notes, newNote]);
    openNoteInTab(newNote);
  };

  const updateNote = (noteId, updates) => {
    setNotes(notes.map(note =>
      note.id === noteId
        ? { ...note, ...updates, updatedAt: new Date().toISOString() }
        : note
    ));
    if (currentNote?.id === noteId) {
      setCurrentNote({ ...currentNote, ...updates });
    }
  };

  const deleteNote = (noteId) => {
    setNotes(notes.filter(note => note.id !== noteId));
    if (currentNote?.id === noteId) {
      setCurrentNote(notes.length > 1 ? notes[0] : null);
    }
  };

  // Handle command palette actions
  const handleCommandExecute = (action) => {
    switch (action) {
      case 'createNote':
        createNewNote();
        break;
      case 'openQuickSwitcher':
        setQuickSwitcherOpen(true);
        break;
      case 'toggleSidebar':
        setSidebarOpen(!sidebarOpen);
        break;
      case 'toggleGraph':
        setViewMode('graph');
        break;
      case 'toggleRightPanel':
        setRightPanelOpen(!rightPanelOpen);
        break;
      case 'deleteNote':
        if (currentNote) {
          deleteNote(currentNote.id);
        }
        break;
      case 'duplicateNote':
        if (currentNote) {
          const duplicatedNote = {
            ...currentNote,
            id: Date.now().toString(),
            title: currentNote.title + ' (Copy)',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          setNotes([...notes, duplicatedNote]);
          setCurrentNote(duplicatedNote);
        }
        break;
      case 'exportNote':
        if (currentNote) {
          const blob = new Blob([currentNote.content], { type: 'text/markdown' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${currentNote.title}.md`;
          a.click();
          URL.revokeObjectURL(url);
        }
        break;
      default:
        break;
    }
  };

  // Extract all links from note content
  const extractLinks = (content) => {
    const linkRegex = /\[\[(.*?)\]\]/g;
    const matches = content.matchAll(linkRegex);
    return Array.from(matches, m => m[1]);
  };

  // Extract all tags from note content
  const extractTags = (content) => {
    const tagRegex = /#(\w+)/g;
    const matches = content.matchAll(tagRegex);
    return Array.from(matches, m => m[1]);
  };

  // Get backlinks (notes that link to current note)
  const getBacklinks = (noteTitle) => {
    return notes.filter(note =>
      extractLinks(note.content).includes(noteTitle)
    );
  };

  // Filter notes by search query
  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate stats for current note
  const getNotesStats = () => {
    if (!currentNote) return { words: 0, chars: 0, lines: 0, readingTime: 0 };

    const content = currentNote.content;
    const words = content.trim().split(/\s+/).filter(w => w.length > 0).length;
    const chars = content.length;
    const lines = content.split('\n').length;
    const readingTime = Math.ceil(words / 200); // Average reading speed: 200 words/min

    return { words, chars, lines, readingTime };
  };

  return (
    <div className="obsidian-notes-view">
      {/* Ribbon - Left Icon Bar */}
      <div className="obsidian-ribbon">
        <div className="ribbon-actions">
          <button
            className={`ribbon-btn ${sidebarOpen ? 'active' : ''}`}
            onClick={() => setSidebarOpen(!sidebarOpen)}
            title="Toggle file explorer"
          >
            <FolderTree size={20} />
          </button>
          <button
            className="ribbon-btn"
            onClick={() => setQuickSwitcherOpen(true)}
            title="Quick switcher (Cmd+O)"
          >
            <Search size={20} />
          </button>
          <button
            className={`ribbon-btn ${viewMode === 'graph' ? 'active' : ''}`}
            onClick={() => setViewMode('graph')}
            title="Graph view"
          >
            <Network size={20} />
          </button>
          <button
            className="ribbon-btn"
            onClick={createNewNote}
            title="New note (Cmd+N)"
          >
            <Plus size={20} />
          </button>
        </div>
        <div className="ribbon-bottom">
          <button
            className="ribbon-btn"
            title="Settings"
          >
            <Settings size={20} />
          </button>
        </div>
      </div>

      {/* Left Sidebar - File Explorer & Tags */}
      <div className={`obsidian-sidebar left ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h3>Notes</h3>
          <div className="sidebar-actions">
            <button
              className="icon-btn"
              onClick={createNewNote}
              title="New note (Cmd+N)"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="sidebar-search">
          <Search size={14} />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* View Toggle */}
        <div className="view-toggle">
          <button
            className={`toggle-btn ${viewMode === 'editor' ? 'active' : ''}`}
            onClick={() => setViewMode('editor')}
          >
            <FolderTree size={14} />
            Notes
          </button>
          <button
            className={`toggle-btn ${viewMode === 'graph' ? 'active' : ''}`}
            onClick={() => setViewMode('graph')}
          >
            <Network size={14} />
            Graph
          </button>
        </div>

        {/* Notes List */}
        <div className="notes-list">
          {filteredNotes.map(note => (
            <div
              key={note.id}
              className={`note-item ${currentNote?.id === note.id ? 'active' : ''}`}
              onClick={() => setCurrentNote(note)}
            >
              <div className="note-item-title">{note.title}</div>
              <div className="note-item-preview">
                {note.content.substring(0, 60)}...
              </div>
              {extractTags(note.content).length > 0 && (
                <div className="note-item-tags">
                  {extractTags(note.content).slice(0, 2).map((tag, idx) => (
                    <span key={idx} className="mini-tag">#{tag}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Tag Explorer */}
        <div className="tag-explorer">
          <div className="tag-explorer-header">
            <Tag size={14} />
            <span>Tags</span>
          </div>
          <div className="tag-list">
            {Array.from(new Set(notes.flatMap(note => extractTags(note.content))))
              .map(tag => (
                <div key={tag} className="tag-list-item">
                  #{tag}
                  <span className="tag-count">
                    {notes.filter(n => extractTags(n.content).includes(tag)).length}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="obsidian-main">
        {/* Top Bar */}
        <div className="obsidian-topbar">
          <button
            className="icon-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <FolderTree size={18} />
          </button>

          {currentNote && (
            <div className="breadcrumb">
              <span className="breadcrumb-item">{currentNote.title}</span>
            </div>
          )}

          <div className="topbar-actions">
            <button
              className="icon-btn"
              onClick={() => setQuickSwitcherOpen(true)}
              title="Quick switcher (Cmd+O)"
            >
              <Search size={18} />
            </button>
            <button className="icon-btn">
              <Star size={18} />
            </button>
            <button className="icon-btn">
              <Settings size={18} />
            </button>
          </div>
        </div>

        {/* Editor or Graph View */}
        {viewMode === 'editor' ? (
          currentNote ? (
            <NoteEditor
              note={currentNote}
              notes={notes}
              onUpdate={updateNote}
              onDelete={deleteNote}
              onNoteClick={setCurrentNote}
            />
          ) : (
            <div className="no-note-selected">
              <FolderTree size={64} />
              <h3>No note selected</h3>
              <p>Select a note from the sidebar or create a new one</p>
              <button className="primary-btn" onClick={createNewNote}>
                <Plus size={16} />
                Create New Note
              </button>
            </div>
          )
        ) : (
          <GraphView notes={notes} onNodeClick={setCurrentNote} />
        )}

        {/* Status Bar */}
        {currentNote && viewMode === 'editor' && (
          <div className="obsidian-statusbar">
            <div className="status-left">
              <span className="status-item">
                {getNotesStats().words} words
              </span>
              <span className="status-item">
                {getNotesStats().chars} characters
              </span>
              <span className="status-item">
                {getNotesStats().lines} lines
              </span>
            </div>
            <div className="status-right">
              <span className="status-item">
                {getNotesStats().readingTime} min read
              </span>
              <span className="status-item">
                {notes.length} notes
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Right Sidebar - Backlinks & Outline */}
      {currentNote && viewMode === 'editor' && (
        <div className={`obsidian-sidebar right ${rightPanelOpen ? 'open' : 'closed'}`}>
          <button
            className="sidebar-toggle"
            onClick={() => setRightPanelOpen(!rightPanelOpen)}
          >
            <ChevronRight size={16} />
          </button>

          {rightPanelOpen && (
            <>
              <BacklinksPanel
                currentNote={currentNote}
                backlinks={getBacklinks(currentNote.title)}
                notes={notes}
                onNoteClick={setCurrentNote}
              />

              <div className="outline-panel">
                <h4>Outline</h4>
                <div className="outline-content">
                  {/* Parse markdown headers and create outline */}
                  {currentNote.content
                    .split('\n')
                    .filter(line => line.startsWith('#'))
                    .map((header, i) => {
                      const level = header.match(/^#+/)[0].length;
                      const text = header.replace(/^#+\s/, '');
                      return (
                        <div
                          key={i}
                          className="outline-item"
                          style={{ paddingLeft: `${(level - 1) * 12}px` }}
                        >
                          {text}
                        </div>
                      );
                    })}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Quick Switcher Modal */}
      {quickSwitcherOpen && (
        <QuickSwitcher
          notes={notes}
          onSelect={(note) => {
            setCurrentNote(note);
            setQuickSwitcherOpen(false);
            setViewMode('editor');
          }}
          onClose={() => setQuickSwitcherOpen(false)}
        />
      )}

      {/* Command Palette Modal */}
      {commandPaletteOpen && (
        <CommandPalette
          onExecute={handleCommandExecute}
          onClose={() => setCommandPaletteOpen(false)}
        />
      )}
    </div>
  );
}
