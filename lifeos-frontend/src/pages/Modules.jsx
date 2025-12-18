import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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

const CORE_MODULES = [
  {
    id: 'productivity',
    name: 'Productivity',
    iconKey: 'productivity',
    color: 'from-indigo-500 to-violet-500',
    glowColor: 'rgba(99, 102, 241, 0.5)',
    route: '/productivity',
  },
  {
    id: 'health',
    name: 'Health',
    iconKey: 'health',
    color: 'from-emerald-500 to-teal-500',
    glowColor: 'rgba(16, 185, 129, 0.5)',
    route: '/health',
  },
  {
    id: 'calendar',
    name: 'Calendar',
    iconKey: 'calendar',
    color: 'from-rose-500 to-pink-500',
    glowColor: 'rgba(244, 63, 94, 0.5)',
    route: '/calendar',
  },
  {
    id: 'journal',
    name: 'Journal',
    iconKey: 'journal',
    color: 'from-slate-400 to-slate-500',
    glowColor: 'rgba(148, 163, 184, 0.5)',
    route: '/journal',
  },
  {
    id: 'knowledge',
    name: 'Knowledge',
    iconKey: 'knowledge',
    color: 'from-violet-500 to-purple-500',
    glowColor: 'rgba(139, 92, 246, 0.5)',
    route: '/knowledge',
  },
  {
    id: 'skills',
    name: 'Skills',
    iconKey: 'skills',
    color: 'from-cyan-500 to-sky-500',
    glowColor: 'rgba(6, 182, 212, 0.5)',
    route: '/skills',
  },
  {
    id: 'financial',
    name: 'Financial',
    iconKey: 'financial',
    color: 'from-amber-500 to-yellow-500',
    glowColor: 'rgba(245, 158, 11, 0.5)',
    route: '/financial',
  },
  {
    id: 'purpose',
    name: 'Purpose',
    iconKey: 'purpose',
    color: 'from-fuchsia-500 to-violet-500',
    glowColor: 'rgba(217, 70, 239, 0.5)',
    route: '/purpose',
  },
];

const ModuleCard = ({ module, index }) => {
  const navigate = useNavigate();

  return (
    <motion.button
      onClick={() => navigate(module.route)}
      className={`
        relative flex flex-col items-center justify-center
        aspect-square rounded-2xl overflow-hidden
        bg-gradient-to-br ${module.color}
        group transition-shadow duration-300
      `}
      style={{
        boxShadow: `0 4px 24px ${module.glowColor}`,
      }}
      whileHover={{
        scale: 1.03,
        y: -4,
      }}
      whileTap={{ scale: 0.97 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
    >
      {/* Subtle pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '20px 20px',
        }}
      />

      {/* Hover glow */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-25 transition-opacity duration-300"
        style={{
          background: 'radial-gradient(circle at center, white 0%, transparent 70%)',
        }}
      />

      {/* Icon */}
      <motion.img
        src={MODULE_ICONS[module.iconKey]}
        alt={module.name}
        className="relative z-10 w-14 h-14 sm:w-16 sm:h-16 mb-2"
        style={{
          imageRendering: 'pixelated',
          filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.25))',
        }}
        whileHover={{ rotate: [0, -5, 5, 0] }}
        transition={{ duration: 0.4 }}
      />

      {/* Name */}
      <span className="relative z-10 text-sm sm:text-base font-semibold text-white drop-shadow-md">
        {module.name}
      </span>
    </motion.button>
  );
};

export default function Modules() {
  return (
    <div className="min-h-screen bg-bg-0 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-bg-0/80 backdrop-blur-lg border-b border-border-subtle px-6 py-4">
        <PageHeader
          title="Modules"
          subtitle="Your personal operating system"
          icon={LayoutGrid}
          module="default"
          variant="elevated"
          className="mb-0"
        />
      </div>

      {/* Equal Grid - 2 cols mobile, 4 cols desktop */}
      <div className="px-4 pt-6 pb-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {CORE_MODULES.map((module, index) => (
            <ModuleCard key={module.id} module={module} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
}
