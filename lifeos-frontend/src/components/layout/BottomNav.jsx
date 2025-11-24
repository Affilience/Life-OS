import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Grid3x3, User, Target, Settings } from 'lucide-react';

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const tabs = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/modules', icon: Grid3x3, label: 'Modules' },
    { path: '/character', icon: User, label: 'Character' },
    { path: '/quests', icon: Target, label: 'Quests' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 safe-area-inset-bottom md:hidden">
      <div className="flex justify-around items-center h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = isActive(tab.path);

          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-all ${
                active ? 'text-purple-400' : 'text-slate-400'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-6 h-6 transition-all ${
                    active ? 'scale-110' : 'scale-100'
                  }`}
                />
                {active && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-purple-400" />
                )}
              </div>
              <span className={`text-xs mt-1 font-medium ${active ? 'font-semibold' : ''}`}>
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
