import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutGrid } from 'lucide-react';
import PageHeader from '../components/shared/PageHeader';

// Pixel art module icons
const MODULE_ICONS = {
  productivity: '/assets/icons/modules/module_productivity.png',
  health: '/assets/icons/modules/module_health.png',
  knowledge: '/assets/icons/modules/module_knowledge.png',
  journal: '/assets/icons/modules/module_journal.png',
  calendar: '/assets/icons/modules/module_calendar.png',
  skills: '/assets/icons/modules/module_skills.png',
  financial: '/assets/icons/modules/module_financial.png',
  purpose: '/assets/icons/modules/module_purpose.png',
};

// Module colors harmonized with Cosmic Violet theme
const CORE_MODULES = [
  {
    id: 'productivity',
    name: 'Productivity',
    iconKey: 'productivity',
    color: 'from-indigo-500 to-violet-500',
    glowColor: 'rgba(99, 102, 241, 0.6)',
    route: '/productivity',
  },
  {
    id: 'health',
    name: 'Health',
    iconKey: 'health',
    color: 'from-emerald-500 to-teal-500',
    glowColor: 'rgba(16, 185, 129, 0.6)',
    route: '/health',
  },
  {
    id: 'calendar',
    name: 'Calendar',
    iconKey: 'calendar',
    color: 'from-rose-500 to-pink-500',
    glowColor: 'rgba(244, 63, 94, 0.6)',
    route: '/calendar',
  },
  {
    id: 'journal',
    name: 'Journal',
    iconKey: 'journal',
    color: 'from-slate-400 to-slate-500',
    glowColor: 'rgba(148, 163, 184, 0.6)',
    route: '/journal',
  },
  {
    id: 'knowledge',
    name: 'Knowledge',
    iconKey: 'knowledge',
    color: 'from-violet-500 to-purple-500',
    glowColor: 'rgba(139, 92, 246, 0.6)',
    route: '/knowledge',
  },
  {
    id: 'skills',
    name: 'Skills',
    iconKey: 'skills',
    color: 'from-cyan-500 to-sky-500',
    glowColor: 'rgba(6, 182, 212, 0.6)',
    route: '/skills',
  },
  {
    id: 'financial',
    name: 'Financial',
    iconKey: 'financial',
    color: 'from-amber-500 to-yellow-500',
    glowColor: 'rgba(245, 158, 11, 0.6)',
    route: '/financial',
  },
  {
    id: 'purpose',
    name: 'Purpose',
    iconKey: 'purpose',
    color: 'from-fuchsia-500 to-violet-500',
    glowColor: 'rgba(217, 70, 239, 0.6)',
    route: '/purpose',
  },
];

export default function Modules() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-bg-0 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-bg-0 border-b border-border-subtle px-6 py-4">
        <PageHeader
          title="Modules"
          icon={LayoutGrid}
          module="default"
          variant="icon"
          className="mb-0"
        />
      </div>

      {/* Simple Grid - 2 cols on mobile, 4 cols on tablet+ */}
      <div className="px-4 pt-6 pb-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {CORE_MODULES.map((module) => (
          <button
            key={module.id}
            onClick={() => navigate(module.route)}
            className="flex flex-col items-center py-5 sm:py-4 rounded-xl bg-bg-1 border border-border group transition-all duration-150 hover:bg-bg-2 hover:border-primary-500/30 active:scale-95"
          >
            {/* Icon */}
            <div className={`w-14 h-14 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${module.color} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
              <img
                src={MODULE_ICONS[module.iconKey]}
                alt={module.name}
                className="w-9 h-9 sm:w-8 sm:h-8"
                style={{
                  imageRendering: 'pixelated',
                  filter: `drop-shadow(0 0 6px ${module.glowColor})`,
                }}
              />
            </div>
            {/* Name */}
            <span className="text-sm sm:text-xs font-medium text-text-secondary">{module.name}</span>
          </button>
        ))}
      </div>

    </div>
  );
}
