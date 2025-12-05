/**
 * Command Palette (Cmd+K)
 *
 * A powerful command palette for quick actions:
 * - Fuzzy search for commands
 * - Keyboard navigation
 * - Command groups/categories
 * - Recent commands
 * - Shortcuts display
 */

import React, { useState, useEffect, useCallback, useRef, useMemo, createContext, useContext } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Home,
  Calendar,
  Heart,
  Brain,
  Target,
  BookOpen,
  DollarSign,
  Dumbbell,
  Settings,
  Plus,
  Command,
  ArrowRight,
  Clock,
  Sparkles,
  Zap,
  User,
  Trophy,
} from 'lucide-react';

// Command Palette Context
const CommandPaletteContext = createContext(null);

/**
 * Default commands for navigation and actions
 */
const DEFAULT_COMMANDS = [
  // Navigation
  { id: 'nav-home', label: 'Go to Dashboard', icon: Home, category: 'Navigation', action: 'navigate', path: '/' },
  { id: 'nav-modules', label: 'Go to Modules', icon: Target, category: 'Navigation', action: 'navigate', path: '/modules' },
  { id: 'nav-character', label: 'Go to Character', icon: User, category: 'Navigation', action: 'navigate', path: '/character' },
  { id: 'nav-quests', label: 'Go to Quests', icon: Trophy, category: 'Navigation', action: 'navigate', path: '/quests' },
  { id: 'nav-calendar', label: 'Go to Calendar', icon: Calendar, category: 'Navigation', action: 'navigate', path: '/calendar' },
  { id: 'nav-health', label: 'Go to Health', icon: Heart, category: 'Navigation', action: 'navigate', path: '/health' },
  { id: 'nav-productivity', label: 'Go to Productivity', icon: Zap, category: 'Navigation', action: 'navigate', path: '/productivity' },
  { id: 'nav-knowledge', label: 'Go to Knowledge', icon: Brain, category: 'Navigation', action: 'navigate', path: '/knowledge' },
  { id: 'nav-journal', label: 'Go to Journal', icon: BookOpen, category: 'Navigation', action: 'navigate', path: '/journal' },
  { id: 'nav-skills', label: 'Go to Skills', icon: Sparkles, category: 'Navigation', action: 'navigate', path: '/skills' },
  { id: 'nav-financial', label: 'Go to Financial', icon: DollarSign, category: 'Navigation', action: 'navigate', path: '/financial' },
  { id: 'nav-settings', label: 'Go to Settings', icon: Settings, category: 'Navigation', action: 'navigate', path: '/settings' },

  // Quick Actions
  { id: 'action-workout', label: 'Log Workout', icon: Dumbbell, category: 'Quick Actions', action: 'custom', shortcut: 'W' },
  { id: 'action-journal', label: 'Write Journal Entry', icon: BookOpen, category: 'Quick Actions', action: 'navigate', path: '/journal/write', shortcut: 'J' },
  { id: 'action-task', label: 'Add Task', icon: Plus, category: 'Quick Actions', action: 'custom', shortcut: 'T' },
  { id: 'action-timeblock', label: 'Create Time Block', icon: Clock, category: 'Quick Actions', action: 'custom', shortcut: 'B' },
];

/**
 * Fuzzy search function
 */
function fuzzySearch(query, items, keys = ['label']) {
  if (!query.trim()) return items;

  const lowerQuery = query.toLowerCase();

  return items
    .map((item) => {
      let score = 0;
      let matched = false;

      for (const key of keys) {
        const value = item[key];
        if (typeof value !== 'string') continue;

        const lowerValue = value.toLowerCase();

        // Exact match
        if (lowerValue === lowerQuery) {
          score += 100;
          matched = true;
        }
        // Starts with
        else if (lowerValue.startsWith(lowerQuery)) {
          score += 75;
          matched = true;
        }
        // Contains
        else if (lowerValue.includes(lowerQuery)) {
          score += 50;
          matched = true;
        }
        // Fuzzy match (all characters in order)
        else {
          let queryIndex = 0;
          for (let i = 0; i < lowerValue.length && queryIndex < lowerQuery.length; i++) {
            if (lowerValue[i] === lowerQuery[queryIndex]) {
              queryIndex++;
            }
          }
          if (queryIndex === lowerQuery.length) {
            score += 25;
            matched = true;
          }
        }
      }

      return { item, score, matched };
    })
    .filter((r) => r.matched)
    .sort((a, b) => b.score - a.score)
    .map((r) => r.item);
}

/**
 * CommandPalette Component
 */
export function CommandPalette({
  commands = DEFAULT_COMMANDS,
  placeholder = 'Search commands...',
  recentLimit = 5,
}) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentCommands, setRecentCommands] = useState([]);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Load recent commands from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('command-palette-recent');
    if (stored) {
      try {
        setRecentCommands(JSON.parse(stored));
      } catch {
        // Ignore parse errors
      }
    }
  }, []);

  // Filter commands based on query
  const filteredCommands = useMemo(() => {
    const allCommands = [...commands];

    if (!query.trim()) {
      // Show recent commands first, then all commands
      const recentItems = recentCommands
        .map((id) => allCommands.find((c) => c.id === id))
        .filter(Boolean)
        .slice(0, recentLimit);

      const otherCommands = allCommands.filter(
        (c) => !recentItems.some((r) => r.id === c.id)
      );

      return [
        ...(recentItems.length > 0 ? [{ isGroup: true, label: 'Recent' }] : []),
        ...recentItems,
        { isGroup: true, label: 'All Commands' },
        ...otherCommands,
      ];
    }

    return fuzzySearch(query, allCommands, ['label', 'category']);
  }, [commands, query, recentCommands, recentLimit]);

  // Get selectable items (exclude group headers)
  const selectableItems = filteredCommands.filter((c) => !c.isGroup);

  // Handle keyboard shortcut to open
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Cmd/Ctrl + K to open
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }

      // Escape to close
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current && selectedIndex >= 0) {
      const items = listRef.current.querySelectorAll('[data-command-item]');
      items[selectedIndex]?.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  // Execute command
  const executeCommand = useCallback((command) => {
    // Add to recent commands
    setRecentCommands((prev) => {
      const updated = [command.id, ...prev.filter((id) => id !== command.id)].slice(0, 10);
      localStorage.setItem('command-palette-recent', JSON.stringify(updated));
      return updated;
    });

    // Close palette
    setIsOpen(false);

    // Execute action
    if (command.action === 'navigate' && command.path) {
      navigate(command.path);
    } else if (command.action === 'custom' && command.onExecute) {
      command.onExecute();
    }
  }, [navigate]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, selectableItems.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectableItems[selectedIndex]) {
          executeCommand(selectableItems[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  }, [selectableItems, selectedIndex, executeCommand]);

  // Context value
  const contextValue = useMemo(() => ({
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen((o) => !o),
    isOpen,
  }), [isOpen]);

  if (!isOpen) {
    return (
      <CommandPaletteContext.Provider value={contextValue}>
        {/* Hidden trigger for context */}
      </CommandPaletteContext.Provider>
    );
  }

  return (
    <CommandPaletteContext.Provider value={contextValue}>
      {createPortal(
        <div className="fixed inset-0 z-[9999]">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
            onClick={() => setIsOpen(false)}
          />

          {/* Palette */}
          <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-full max-w-xl animate-scale-in">
            <div className="bg-[var(--bg-elevated,#221e2e)] border border-white/10 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden">
              {/* Search input */}
              <div className="flex items-center gap-3 px-4 py-4 border-b border-white/10">
                <Search className="w-5 h-5 text-white/40" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setSelectedIndex(0);
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder={placeholder}
                  className="flex-1 bg-transparent text-white placeholder-white/40 focus:outline-none"
                />
                <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 text-xs text-white/40 bg-white/5 rounded">
                  <Command className="w-3 h-3" />K
                </kbd>
              </div>

              {/* Results */}
              <div
                ref={listRef}
                className="max-h-80 overflow-y-auto py-2"
              >
                {filteredCommands.length === 0 ? (
                  <div className="px-4 py-8 text-center text-white/40">
                    No commands found
                  </div>
                ) : (
                  filteredCommands.map((command, index) => {
                    if (command.isGroup) {
                      return (
                        <div
                          key={`group-${command.label}`}
                          className="px-4 py-2 text-xs font-medium text-white/40 uppercase tracking-wider"
                        >
                          {command.label}
                        </div>
                      );
                    }

                    const selectableIndex = selectableItems.indexOf(command);
                    const isSelected = selectableIndex === selectedIndex;
                    const Icon = command.icon || ArrowRight;

                    return (
                      <button
                        key={command.id}
                        data-command-item
                        onClick={() => executeCommand(command)}
                        onMouseEnter={() => setSelectedIndex(selectableIndex)}
                        className={`
                          w-full flex items-center gap-3 px-4 py-2.5 text-left
                          transition-colors
                          ${isSelected ? 'bg-violet-500/20 text-white' : 'text-white/80 hover:bg-white/5'}
                        `}
                      >
                        <Icon className={`w-4 h-4 ${isSelected ? 'text-violet-400' : 'text-white/40'}`} />
                        <span className="flex-1">{command.label}</span>
                        {command.shortcut && (
                          <kbd className="px-2 py-0.5 text-xs text-white/40 bg-white/5 rounded">
                            {command.shortcut}
                          </kbd>
                        )}
                        {command.category && !query && (
                          <span className="text-xs text-white/30">{command.category}</span>
                        )}
                      </button>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-4 py-2 border-t border-white/10 text-xs text-white/40">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-white/5 rounded">↑</kbd>
                    <kbd className="px-1.5 py-0.5 bg-white/5 rounded">↓</kbd>
                    navigate
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-white/5 rounded">↵</kbd>
                    select
                  </span>
                </div>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-white/5 rounded">esc</kbd>
                  close
                </span>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </CommandPaletteContext.Provider>
  );
}

/**
 * useCommandPalette - Hook to control the command palette
 */
export function useCommandPalette() {
  const context = useContext(CommandPaletteContext);
  if (!context) {
    return {
      open: () => console.warn('CommandPalette not mounted'),
      close: () => {},
      toggle: () => {},
      isOpen: false,
    };
  }
  return context;
}

/**
 * CommandPaletteProvider - Wrapper to enable command palette globally
 */
export function CommandPaletteProvider({ children, commands }) {
  return (
    <>
      {children}
      <CommandPalette commands={commands} />
    </>
  );
}

export default CommandPalette;
