import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// Pixel art nav icons
const NAV_ICONS = {
  home: '/assets/icons/nav/nav_home.png',
  modules: '/assets/icons/nav/nav_modules.png',
  character: '/assets/icons/nav/nav_character.png',
  quests: '/assets/icons/nav/nav_quests.png',
  settings: '/assets/icons/nav/nav_settings.png',
};

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const tabs = [
    { path: '/', iconKey: 'home', label: 'Home' },
    { path: '/modules', iconKey: 'modules', label: 'Modules' },
    { path: '/character', iconKey: 'character', label: 'Character' },
    { path: '/quests', iconKey: 'quests', label: 'Quests' },
    { path: '/settings', iconKey: 'settings', label: 'Settings' },
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#12101a]/95 backdrop-blur-lg border-t border-white/10 safe-area-inset-bottom md:hidden">
      <div className="flex justify-around items-center h-16">
        {tabs.map((tab) => {
          const active = isActive(tab.path);

          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-all ${
                active ? 'text-purple-400' : 'text-white/50'
              }`}
            >
              <div className="relative">
                <img
                  src={NAV_ICONS[tab.iconKey]}
                  alt={tab.label}
                  className={`w-7 h-7 transition-all ${
                    active
                      ? 'scale-110 drop-shadow-[0_0_8px_rgba(139,92,246,0.7)]'
                      : 'opacity-60'
                  }`}
                  style={{ imageRendering: 'pixelated' }}
                />
                {active && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-purple-400 shadow-[0_0_6px_rgba(139,92,246,0.8)]" />
                )}
              </div>
              <span className={`text-xs mt-1 font-medium ${active ? 'font-semibold text-purple-300' : ''}`}>
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
