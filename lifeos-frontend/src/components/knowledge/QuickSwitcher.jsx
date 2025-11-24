import React, { useState, useEffect, useRef } from 'react';
import { Search, FileText, Clock } from 'lucide-react';
import './QuickSwitcher.css';

export default function QuickSwitcher({ notes, onSelect, onClose }) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  // Filter notes by fuzzy search
  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(query.toLowerCase()) ||
    note.content.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 10); // Show max 10 results

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(i => Math.min(i + 1, filteredNotes.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(i => Math.max(i - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredNotes[selectedIndex]) {
          onSelect(filteredNotes[selectedIndex]);
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filteredNotes, selectedIndex, onSelect, onClose]);

  return (
    <div className="quick-switcher-overlay" onClick={onClose}>
      <div className="quick-switcher" onClick={(e) => e.stopPropagation()}>
        <div className="switcher-search">
          <Search size={18} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search notes..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
          />
        </div>

        <div className="switcher-results">
          {filteredNotes.length === 0 ? (
            <div className="no-results">
              <p>No notes found</p>
            </div>
          ) : (
            filteredNotes.map((note, index) => (
              <div
                key={note.id}
                className={`result-item ${index === selectedIndex ? 'selected' : ''}`}
                onClick={() => onSelect(note)}
              >
                <FileText size={16} />
                <div className="result-info">
                  <div className="result-title">{note.title}</div>
                  <div className="result-preview">
                    {note.content.substring(0, 80)}...
                  </div>
                </div>
                <Clock size={14} className="result-time" />
              </div>
            ))
          )}
        </div>

        <div className="switcher-footer">
          <kbd>↑↓</kbd> Navigate • <kbd>Enter</kbd> Open • <kbd>Esc</kbd> Close
        </div>
      </div>
    </div>
  );
}
