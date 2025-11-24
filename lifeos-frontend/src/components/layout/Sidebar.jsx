import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  Grid3x3,
  User,
  Users,
  Target,
  Settings,
  Sparkles,
  X,
  Menu
} from 'lucide-react';

/**
 * ONYXOS Sidebar
 *
 * Mobile-first responsive sidebar:
 * - Desktop (md+): Fixed sidebar at 280px width
 * - Mobile: Hidden (bottom nav takes over)
 * - Can be toggled on mobile via hamburger menu
 */

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();

  const navigationItems = [
    { path: '/', label: 'Home', icon: Home, color: 'accent-2' },
    { path: '/modules', label: 'Modules', icon: Grid3x3, color: 'accent' },
    { path: '/character', label: 'Character', icon: User, color: 'accent-3' },
    { path: '/social', label: 'Social', icon: Users, color: 'primary-500' },
    { path: '/quests', label: 'Quests', icon: Target, color: 'warning' },
  ];

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed left-0 top-0 bottom-0 w-[250px]
        sidebar
        flex flex-col
        z-50
        transition-transform duration-300

        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
      `}>
        {/* Logo / Brand */}
        <div className="p-6 border-b border-border-subtle">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-accent-2 flex items-center justify-center shadow-glow">
                <Sparkles size={18} className="text-white" />
              </div>
              <h1 className="text-xl font-bold text-text-high tracking-tighter">
                ONYXOS
              </h1>
            </div>
            {/* Close button (mobile only) */}
            <button
              onClick={onClose}
              className="md:hidden p-2 hover:bg-accent-mainSoft rounded-lg transition-colors"
            >
              <X size={20} className="text-text-med" />
            </button>
          </div>
          <p className="text-xs text-text-dim ml-10">Life Operating System</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <div className="space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={`
                    group flex items-center gap-3 px-3 py-2.5 rounded-md
                    text-sm font-medium transition-all duration-fast
                    ${active
                      ? 'bg-surfaceAlt/80 text-fg-primary shadow-soft border border-border-subtle'
                      : 'text-fg-secondary hover:bg-accent-mainSoft hover:text-fg-primary'
                    }
                  `}
                >
                  <Icon
                    size={18}
                    className={`
                      flex-shrink-0 transition-all duration-fast
                      ${active ? `text-${item.color}` : 'text-text-dim group-hover:text-text-med'}
                    `}
                    style={active ? { color: `var(--${item.color})` } : {}}
                  />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border-subtle">
          <Link
            to="/settings"
            onClick={onClose}
            className="
              flex items-center gap-3 px-3 py-2.5 rounded-md
              text-sm font-medium text-fg-secondary
              hover:bg-accent-mainSoft hover:text-fg-primary
              transition-all duration-fast
            "
          >
            <Settings size={18} />
            <span>Settings</span>
          </Link>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;