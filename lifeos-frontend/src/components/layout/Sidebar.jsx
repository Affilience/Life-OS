import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Sparkles,
  X,
  Menu
} from 'lucide-react';
import { useGamificationModeStore, VISIBILITY } from '../../stores/gamificationModeStore';

// Pixel art nav icons
const NAV_ICONS = {
  home: '/assets/icons/nav/nav_home.png',
  modules: '/assets/icons/nav/nav_modules.png',
  character: '/assets/icons/nav/nav_character.png',
  social: '/assets/icons/nav/nav_social.png',
  quests: '/assets/icons/nav/nav_quests.png',
  settings: '/assets/icons/nav/nav_settings.png',
};

// Mode-specific labels
const MODE_LABELS = {
  cosmic: {
    character: 'Character',
    quests: 'Quests',
    social: 'Social',
  },
  professional: {
    character: 'Profile',
    quests: 'Goals',
    social: 'Network',
  },
  minimal: {
    character: 'Profile',
    quests: 'Tasks',
    social: 'Network',
  },
};

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
  const mode = useGamificationModeStore((state) => state.mode);
  const visibility = VISIBILITY[mode] || VISIBILITY.cosmic;
  const labels = MODE_LABELS[mode] || MODE_LABELS.cosmic;

  // Build navigation items based on mode visibility
  const navigationItems = [
    { path: '/', label: 'Home', iconKey: 'home', color: 'accent-2' },
    { path: '/modules', label: 'Modules', iconKey: 'modules', color: 'accent' },
  ];

  // Character/Profile - hide in minimal mode
  if (visibility.showCharacterPage) {
    navigationItems.push({ path: '/character', label: labels.character, iconKey: 'character', color: 'accent-3' });
  }

  // Social - always visible
  navigationItems.push({ path: '/social', label: labels.social, iconKey: 'social', color: 'primary-500' });

  // Quests - always visible with mode-appropriate label
  navigationItems.push({ path: '/quests', label: labels.quests, iconKey: 'quests', color: 'warning' });

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
                Ascnt
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
          <p className="text-xs text-text-dim ml-10">Level up your life</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <div className="space-y-1">
            {navigationItems.map((item) => {
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
                  <img
                    src={NAV_ICONS[item.iconKey]}
                    alt={item.label}
                    className={`
                      w-6 h-6 flex-shrink-0 transition-all duration-fast
                      ${active ? 'scale-110 drop-shadow-[0_0_6px_rgba(139,92,246,0.6)]' : 'opacity-70 group-hover:opacity-100 group-hover:scale-105'}
                    `}
                    style={{ imageRendering: 'pixelated' }}
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
              group flex items-center gap-3 px-3 py-2.5 rounded-md
              text-sm font-medium text-fg-secondary
              hover:bg-accent-mainSoft hover:text-fg-primary
              transition-all duration-fast
            "
          >
            <img
              src={NAV_ICONS.settings}
              alt="Settings"
              className="w-6 h-6 opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all duration-fast"
              style={{ imageRendering: 'pixelated' }}
            />
            <span>Settings</span>
          </Link>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;