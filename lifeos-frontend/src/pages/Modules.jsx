import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutGrid, ChevronRight } from 'lucide-react';
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

const CORE_MODULES = [
  {
    id: 'productivity',
    name: 'Productivity',
    description: 'Track tasks, projects & deep work sessions',
    iconKey: 'productivity',
    accentColor: '#6366f1',
    bgColor: 'rgba(99, 102, 241, 0.1)',
    borderColor: 'rgba(99, 102, 241, 0.2)',
    route: '/productivity',
  },
  {
    id: 'health',
    name: 'Health',
    description: 'Workouts, nutrition, sleep & wellness',
    iconKey: 'health',
    accentColor: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.2)',
    route: '/health',
  },
  {
    id: 'calendar',
    name: 'Calendar',
    description: 'Time blocking & schedule management',
    iconKey: 'calendar',
    accentColor: '#f43f5e',
    bgColor: 'rgba(244, 63, 94, 0.1)',
    borderColor: 'rgba(244, 63, 94, 0.2)',
    route: '/calendar',
  },
  {
    id: 'journal',
    name: 'Journal',
    description: 'Daily entries, mood & reflections',
    iconKey: 'journal',
    accentColor: '#94a3b8',
    bgColor: 'rgba(148, 163, 184, 0.1)',
    borderColor: 'rgba(148, 163, 184, 0.2)',
    route: '/journal',
  },
  {
    id: 'knowledge',
    name: 'Knowledge',
    description: 'Books, notes, ideas & learning',
    iconKey: 'knowledge',
    accentColor: '#8b5cf6',
    bgColor: 'rgba(139, 92, 246, 0.1)',
    borderColor: 'rgba(139, 92, 246, 0.2)',
    route: '/knowledge',
  },
  {
    id: 'skills',
    name: 'Skills',
    description: 'Track skill progression & practice',
    iconKey: 'skills',
    accentColor: '#06b6d4',
    bgColor: 'rgba(6, 182, 212, 0.1)',
    borderColor: 'rgba(6, 182, 212, 0.2)',
    route: '/skills',
  },
  {
    id: 'financial',
    name: 'Financial',
    description: 'Income, expenses & net worth',
    iconKey: 'financial',
    accentColor: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.1)',
    borderColor: 'rgba(245, 158, 11, 0.2)',
    route: '/financial',
  },
  {
    id: 'purpose',
    name: 'Purpose',
    description: 'Values, goals & life vision',
    iconKey: 'purpose',
    accentColor: '#d946ef',
    bgColor: 'rgba(217, 70, 239, 0.1)',
    borderColor: 'rgba(217, 70, 239, 0.2)',
    route: '/purpose',
  },
];

const ModuleCard = ({ module, index }) => {
  const navigate = useNavigate();

  return (
    <motion.button
      onClick={() => navigate(module.route)}
      className="relative flex items-center gap-4 p-4 rounded-xl border bg-[#1a1724]/60 backdrop-blur-sm text-left w-full group transition-all duration-200 hover:border-opacity-60"
      style={{
        borderColor: module.borderColor,
        background: `linear-gradient(135deg, ${module.bgColor} 0%, transparent 100%)`,
      }}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      {/* Icon Container */}
      <div
        className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center"
        style={{ backgroundColor: module.bgColor }}
      >
        <img
          src={MODULE_ICONS[module.iconKey]}
          alt={module.name}
          className="w-8 h-8"
          style={{
            imageRendering: 'pixelated',
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
          }}
        />
      </div>

      {/* Text Content */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-white text-sm sm:text-base truncate">
          {module.name}
        </h3>
        <p className="text-xs text-white/50 truncate mt-0.5">
          {module.description}
        </p>
      </div>

      {/* Arrow */}
      <ChevronRight
        className="w-5 h-5 text-white/30 group-hover:text-white/60 group-hover:translate-x-1 transition-all flex-shrink-0"
        style={{ color: module.accentColor }}
      />

      {/* Hover glow effect */}
      <div
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          boxShadow: `inset 0 0 30px ${module.bgColor}, 0 0 20px ${module.bgColor}`,
        }}
      />
    </motion.button>
  );
};

export default function Modules() {
  return (
    <div className="min-h-screen bg-bg-0 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-bg-0/80 backdrop-blur-lg border-b border-border-subtle px-4 sm:px-6 py-4">
        <PageHeader
          title="Modules"
          subtitle="Your personal operating system"
          icon={LayoutGrid}
          module="default"
          variant="elevated"
          className="mb-0"
        />
      </div>

      {/* Module Grid */}
      <div className="px-4 pt-6 pb-4 max-w-4xl mx-auto">
        {/* Grid - 1 col mobile, 2 cols desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {CORE_MODULES.map((module, index) => (
            <ModuleCard key={module.id} module={module} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
}
