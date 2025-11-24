import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Plus,
  FolderTree,
  Network,
  Star,
  Settings,
  FileText,
  Trash2,
  Copy,
  Download
} from 'lucide-react';
import './CommandPalette.css';

export default function CommandPalette({ onExecute, onClose, recentCommands = [] }) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  // Define all available commands
  const allCommands = [
    {
      id: 'new-note',
      label: 'Create new note',
      icon: Plus,
      action: 'createNote',
      keywords: ['new', 'create', 'note', 'file']
    },
    {
      id: 'quick-switcher',
      label: 'Open quick switcher',
      icon: Search,
      action: 'openQuickSwitcher',
      keywords: ['search', 'find', 'quick', 'switcher', 'open']
    },
    {
      id: 'toggle-sidebar',
      label: 'Toggle sidebar',
      icon: FolderTree,
      action: 'toggleSidebar',
      keywords: ['toggle', 'sidebar', 'hide', 'show']
    },
    {
      id: 'toggle-graph',
      label: 'Open graph view',
      icon: Network,
      action: 'toggleGraph',
      keywords: ['graph', 'view', 'network', 'connections']
    },
    {
      id: 'toggle-right-panel',
      label: 'Toggle right panel',
      icon: FileText,
      action: 'toggleRightPanel',
      keywords: ['toggle', 'right', 'panel', 'backlinks', 'outline']
    },
    {
      id: 'delete-note',
      label: 'Delete current note',
      icon: Trash2,
      action: 'deleteNote',
      keywords: ['delete', 'remove', 'note']
    },
    {
      id: 'duplicate-note',
      label: 'Duplicate current note',
      icon: Copy,
      action: 'duplicateNote',
      keywords: ['duplicate', 'copy', 'clone']
    },
    {
      id: 'export-note',
      label: 'Export current note',
      icon: Download,
      action: 'exportNote',
      keywords: ['export', 'download', 'save']
    }
  ];

  // Fuzzy filter commands by query
  const filteredCommands = query === ''
    ? [...recentCommands.slice(0, 3), ...allCommands.slice(0, 7)] // Show recent + top commands
    : allCommands.filter(cmd =>
        cmd.label.toLowerCase().includes(query.toLowerCase()) ||
        cmd.keywords.some(kw => kw.toLowerCase().includes(query.toLowerCase()))
      ).slice(0, 10);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(i => Math.min(i + 1, filteredCommands.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(i => Math.max(i - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          handleExecute(filteredCommands[selectedIndex]);
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filteredCommands, selectedIndex, onClose]);

  const handleExecute = (command) => {
    onExecute(command.action);
    onClose();
  };

  return (
    <div className="command-palette-overlay" onClick={onClose}>
      <div className="command-palette" onClick={(e) => e.stopPropagation()}>
        <div className="palette-search">
          <Search size={18} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
          />
        </div>

        <div className="palette-results">
          {filteredCommands.length === 0 ? (
            <div className="no-results">
              <p>No commands found</p>
            </div>
          ) : (
            <>
              {query === '' && recentCommands.length > 0 && (
                <div className="results-section">
                  <div className="section-label">Recent</div>
                  {filteredCommands.slice(0, recentCommands.length).map((cmd, index) => (
                    <CommandItem
                      key={cmd.id}
                      command={cmd}
                      selected={index === selectedIndex}
                      onClick={() => handleExecute(cmd)}
                    />
                  ))}
                </div>
              )}
              <div className="results-section">
                {query === '' && recentCommands.length > 0 && (
                  <div className="section-label">All Commands</div>
                )}
                {filteredCommands.slice(query === '' ? recentCommands.length : 0).map((cmd, index) => (
                  <CommandItem
                    key={cmd.id}
                    command={cmd}
                    selected={(query === '' ? recentCommands.length : 0) + index === selectedIndex}
                    onClick={() => handleExecute(cmd)}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        <div className="palette-footer">
          <kbd>↑↓</kbd> Navigate • <kbd>Enter</kbd> Execute • <kbd>Esc</kbd> Close
        </div>
      </div>
    </div>
  );
}

function CommandItem({ command, selected, onClick }) {
  const Icon = command.icon;

  return (
    <div
      className={`command-item ${selected ? 'selected' : ''}`}
      onClick={onClick}
    >
      <Icon size={16} />
      <div className="command-label">{command.label}</div>
    </div>
  );
}
