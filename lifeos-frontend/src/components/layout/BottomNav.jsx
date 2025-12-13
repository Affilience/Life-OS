import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useGamificationModeStore, VISIBILITY } from '../../stores/gamificationModeStore';

// Pixel art nav icons
const NAV_ICONS = {
  home: '/assets/icons/nav/nav_home.png',
  modules: '/assets/icons/nav/nav_modules.png',
  character: '/assets/icons/nav/nav_character.png',
  quests: '/assets/icons/nav/nav_quests.png',
  social: '/assets/icons/nav/nav_social.png',
};

// Mode-specific labels
const MODE_LABELS = {
  cosmic: {
    character: 'Character',
    quests: 'Quests',
  },
  professional: {
    character: 'Profile',
    quests: 'Goals',
  },
  minimal: {
    character: 'Profile',
    quests: 'Tasks',
  },
};

// Mode-specific styling - uses CSS variables for theme-aware colors
const MODE_STYLES = {
  cosmic: {
    activeText: 'text-primary-400',
    activeLabel: 'text-primary-300',
    dotColor: 'bg-primary-400',
    dotShadow: 'var(--glow-primary)',
    iconFilter: 'drop-shadow(0 0 8px var(--glow-primary))',
  },
  professional: {
    activeText: 'text-primary-400',
    activeLabel: 'text-primary-300',
    dotColor: 'bg-primary-400',
    dotShadow: 'var(--glow-primary)',
    iconFilter: 'drop-shadow(0 0 8px var(--glow-primary))',
  },
  minimal: {
    activeText: 'text-text-secondary',
    activeLabel: 'text-text-primary',
    dotColor: 'bg-text-secondary',
    dotShadow: '0 0 4px var(--text-muted)',
    iconFilter: 'drop-shadow(0 0 4px var(--text-muted))',
  },
};

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const mode = useGamificationModeStore((state) => state.mode);
  const visibility = VISIBILITY[mode] || VISIBILITY.cosmic;
  const labels = MODE_LABELS[mode] || MODE_LABELS.cosmic;
  const styles = MODE_STYLES[mode] || MODE_STYLES.cosmic;

  // Build tabs based on mode visibility
  const tabs = [
    { path: '/', iconKey: 'home', label: 'Home' },
    { path: '/modules', iconKey: 'modules', label: 'Modules' },
  ];

  // Character/Profile tab - show based on mode
  if (visibility.showCharacterPage) {
    tabs.push({ path: '/character', iconKey: 'character', label: labels.character });
  }

  // Quests tab - always visible but with different label
  tabs.push({ path: '/quests', iconKey: 'quests', label: labels.quests });

  // Social tab
  tabs.push({ path: '/social', iconKey: 'social', label: 'Social' });

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-bg-1/95 backdrop-blur-lg border-t border-border md:hidden"
      style={{ paddingBottom: 'var(--safe-area-bottom)' }}
    >
      <div className="flex justify-around items-center" style={{ minHeight: 'var(--touch-target-min, 44px)', height: '64px' }}>
        {tabs.map((tab) => {
          const active = isActive(tab.path);

          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-all duration-150 group ${
                active ? styles.activeText : 'text-white/50 hover:text-white/70'
              }`}
            >
              <div className="relative">
                <img
                  src={NAV_ICONS[tab.iconKey]}
                  alt={tab.label}
                  className={`w-7 h-7 transition-all duration-150 ${
                    active
                      ? 'scale-110'
                      : 'opacity-60 group-hover:opacity-80 group-hover:scale-105 group-active:scale-95'
                  }`}
                  style={{
                    imageRendering: 'pixelated',
                    filter: active ? styles.iconFilter : undefined,
                  }}
                />
                {active && (
                  <div
                    className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full ${styles.dotColor}`}
                    style={{ boxShadow: styles.dotShadow }}
                  />
                )}
              </div>
              <span className={`text-xs mt-1 font-medium transition-colors duration-150 ${active ? `font-semibold ${styles.activeLabel}` : 'group-hover:text-white/70'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>

      <style>{`
        .safe-area-inset-bottom {
          padding-bottom: env(safe-area-inset-bottom);
        }
      `}</style>
    </nav>
  );
}
