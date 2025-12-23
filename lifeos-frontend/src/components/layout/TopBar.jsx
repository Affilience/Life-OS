import React, { useState, useEffect } from 'react';
import { Plus, Search, Menu } from 'lucide-react';
import SeasonPill from '../app/SeasonPill';
import Button from '../ui/Button';
import NotificationCenter from '../notifications/NotificationCenter';

/**
 * ONYXOS TopBar
 *
 * Premium top navigation bar with date, quick-add, search, and season indicator.
 * Mobile-responsive: shows hamburger menu on mobile to open sidebar drawer
 */

const TopBar = ({ onMenuClick }) => {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      console.log('Searching for:', searchQuery);
    }
  };

  const handleQuickAdd = () => {
    console.log('Opening quick add menu');
  };

  const formatDate = (date) => {
    const options = {
      weekday: 'long',
      month: 'short',
      day: 'numeric'
    };
    return date.toLocaleDateString('en-US', options);
  };

  return (
    <header className="
      fixed top-0 left-0 md:left-[280px] right-0 h-16
      bg-bg-surface/95 backdrop-blur-lg border-b border-border-subtle
      flex items-center justify-between px-4 md:px-6
      z-30
    ">
      {/* Hamburger Menu (mobile only) */}
      <button
        onClick={onMenuClick}
        className="md:hidden p-2 -ml-2 hover:bg-accent-mainSoft rounded-lg transition-colors"
      >
        <Menu size={24} className="text-fg-secondary" />
      </button>

      {/* Left: Date & Season */}
      <div className="flex items-center gap-2 md:gap-4">
        <span className="text-xs md:text-sm text-fg-secondary font-medium hidden sm:block">
          {formatDate(currentDateTime)}
        </span>
        <SeasonPill seasonNumber={1} seasonName="Discipline" variant="compact" />
      </div>

      {/* Center: Search (hidden on small mobile) */}
      <div className="hidden sm:flex flex-1 max-w-md mx-4 md:mx-8">
        <div className="
          relative flex items-center gap-2
          cosmic-input rounded-md
          px-3 py-2
          w-full
          transition-all duration-fast
        ">
          <Search size={16} className="text-fg-muted flex-shrink-0" />
          <input
            type="text"
            placeholder="Search everything..."
            className="
              flex-1 bg-transparent text-sm text-fg-primary
              placeholder:text-fg-muted
              outline-none
            "
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearch}
          />
          <kbd className="
            hidden lg:inline-flex items-center gap-1
            px-1.5 py-0.5 rounded
            bg-surfaceAlt/40 border border-border-subtle
            text-xs text-fg-muted font-mono
          ">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          leftIcon={<Plus size={16} />}
          onClick={handleQuickAdd}
          className="hidden md:flex"
        >
          Quick Add
        </Button>

        {/* Mobile: Quick Add Icon Only */}
        <button
          onClick={handleQuickAdd}
          className="md:hidden p-2 rounded-md cosmic-glow text-fg-secondary hover:text-fg-primary hover:bg-accent-mainSoft transition-all duration-fast"
        >
          <Plus size={20} />
        </button>

        <NotificationCenter />
      </div>
    </header>
  );
};

export default TopBar;