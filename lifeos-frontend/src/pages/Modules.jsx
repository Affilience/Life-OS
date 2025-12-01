import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, LayoutGrid, TrendingUp, TrendingDown } from 'lucide-react';
import PageHeader from '../components/shared/PageHeader';
import Sparkline from '../components/ui/Sparkline';

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
    name: 'Productivity & Business',
    description: 'Deep work tracking, projects, tasks, income',
    iconKey: 'productivity',
    color: 'from-indigo-500 to-violet-500',  // Indigo - Focus
    glowColor: 'rgba(99, 102, 241, 0.6)',
    sparklineColor: '#6366f1',
    route: '/productivity',
    stats: { tasks: 12, projects: 3, hours: 28 },
    trend: [3, 5, 4, 6, 5, 7, 6, 8, 7, 9, 8, 12], // Last 12 days activity
    trendDirection: 'up',
    trendPercent: '+15%'
  },
  {
    id: 'health',
    name: 'Health & Fitness',
    description: 'Workouts, nutrition, sleep, recovery',
    iconKey: 'health',
    color: 'from-emerald-500 to-teal-500',   // Emerald - Vitality
    glowColor: 'rgba(16, 185, 129, 0.6)',
    sparklineColor: '#10b981',
    route: '/health',
    stats: { workouts: 14, streak: 7, calories: 2200 },
    trend: [2, 3, 2, 4, 3, 4, 5, 4, 5, 6, 5, 7],
    trendDirection: 'up',
    trendPercent: '+23%'
  },
  {
    id: 'knowledge',
    name: 'Knowledge Management',
    description: 'Books, podcasts, notes, ideas, implementation',
    iconKey: 'knowledge',
    color: 'from-violet-500 to-purple-500',  // Violet - Wisdom (Primary)
    glowColor: 'rgba(139, 92, 246, 0.6)',
    sparklineColor: '#8b5cf6',
    route: '/knowledge',
    stats: { books: 3, notes: 45, hours: 12 },
    trend: [8, 10, 12, 9, 11, 13, 10, 12, 14, 11, 13, 15],
    trendDirection: 'up',
    trendPercent: '+12%'
  },
  {
    id: 'journal',
    name: 'Journal & Diary',
    description: 'Free-form entries, mood tracking, reflection',
    iconKey: 'journal',
    color: 'from-slate-400 to-slate-500',    // Slate - Reflection
    glowColor: 'rgba(148, 163, 184, 0.6)',
    sparklineColor: '#94a3b8',
    route: '/journal',
    stats: { entries: 87, streak: 12, moods: 'Positive' },
    trend: [1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1],
    trendDirection: 'up',
    trendPercent: '100%'
  },
  {
    id: 'calendar',
    name: 'Calendar & Time',
    description: 'Time blocking, planned vs actual, energy mapping',
    iconKey: 'calendar',
    color: 'from-rose-500 to-pink-500',      // Rose - Time/Urgency
    glowColor: 'rgba(244, 63, 94, 0.6)',
    sparklineColor: '#f43f5e',
    route: '/calendar',
    stats: { events: 23, blocked: '32h', efficiency: '87%' },
    trend: [75, 78, 82, 80, 85, 83, 88, 85, 90, 87, 89, 87],
    trendDirection: 'up',
    trendPercent: '+8%'
  },
  {
    id: 'skills',
    name: 'Skills Learning',
    description: 'Skill cards, practice logs, progression, real-world usage',
    iconKey: 'skills',
    color: 'from-cyan-500 to-sky-500',       // Cyan - Development
    glowColor: 'rgba(6, 182, 212, 0.6)',
    sparklineColor: '#06b6d4',
    route: '/skills',
    stats: { active: 5, mastered: 2, hours: 156 },
    trend: [10, 12, 14, 15, 13, 16, 18, 17, 19, 20, 22, 24],
    trendDirection: 'up',
    trendPercent: '+18%'
  },
  {
    id: 'financial',
    name: 'Financial Tracking',
    description: 'Income, expenses, net worth, goals, business finances',
    iconKey: 'financial',
    color: 'from-amber-500 to-yellow-500',   // Amber - Prosperity
    glowColor: 'rgba(245, 158, 11, 0.6)',
    sparklineColor: '#f59e0b',
    route: '/financial',
    stats: { income: '$4.2k', saved: '$1.8k', net: '+$2.4k' },
    trend: [3200, 3400, 3300, 3600, 3500, 3800, 3700, 4000, 3900, 4100, 4000, 4200],
    trendDirection: 'up',
    trendPercent: '+5%'
  },
  {
    id: 'purpose',
    name: 'Purpose & Values',
    description: 'Life vision, core values, long-term goals',
    iconKey: 'purpose',
    color: 'from-fuchsia-500 to-violet-500', // Fuchsia - Vision
    glowColor: 'rgba(217, 70, 239, 0.6)',
    sparklineColor: '#d946ef',
    route: '/purpose',
    stats: { goals: 8, values: 5, reviews: 12 },
    trend: [1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 7, 8],
    trendDirection: 'up',
    trendPercent: '+33%'
  },
];

export default function Modules() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0c0a10] pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-[#0c0a10] border-b border-white/5 px-6 py-4">
        <PageHeader
          title="Modules"
          subtitle="8 core systems for optimizing life"
          icon={LayoutGrid}
          module="default"
          variant="icon"
          className="mb-0"
        />
      </div>

      {/* Modules Grid - 1 column on small mobile, 2 on mobile, 4 on desktop */}
      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {CORE_MODULES.map((module) => {
          const statEntries = Object.entries(module.stats);
          const primaryStat = statEntries[0];

          // Module-specific shadow colors for hover
          const shadowColors = {
            productivity: 'rgba(99, 102, 241, 0.25)',
            health: 'rgba(16, 185, 129, 0.25)',
            knowledge: 'rgba(139, 92, 246, 0.25)',
            journal: 'rgba(148, 163, 184, 0.2)',
            calendar: 'rgba(244, 63, 94, 0.25)',
            skills: 'rgba(6, 182, 212, 0.25)',
            financial: 'rgba(245, 158, 11, 0.25)',
            purpose: 'rgba(217, 70, 239, 0.25)',
          };

          return (
            <button
              key={module.id}
              onClick={() => navigate(module.route)}
              className="relative aspect-square bg-[#1a1724] border border-white/10 rounded-2xl p-4 text-left group overflow-hidden flex flex-col transition-all duration-150 ease-out hover:-translate-y-1 hover:border-violet-500/30 hover:bg-[#221e2e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50 active:translate-y-0"
              style={{
                '--module-shadow': shadowColors[module.id],
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = `0 12px 32px ${shadowColors[module.id]}`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {/* Gradient overlay on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${module.color} opacity-0 group-hover:opacity-10 transition-opacity duration-150`} />

              {/* Pixel Art Icon */}
              <div className={`
                relative z-10 w-14 h-14 rounded-xl bg-gradient-to-br ${module.color}
                flex items-center justify-center mb-3
                group-hover:scale-110 transition-transform duration-150 ease-out
              `}
              >
                <img
                  src={MODULE_ICONS[module.iconKey]}
                  alt={module.name}
                  className="w-10 h-10 transition-all duration-150"
                  style={{
                    imageRendering: 'pixelated',
                    filter: `drop-shadow(0 0 8px ${module.glowColor})`,
                  }}
                />
              </div>

              {/* Title */}
              <h3 className="relative z-10 text-sm font-semibold text-white leading-tight mb-1">
                {module.name}
              </h3>

              {/* Description - truncated */}
              <p className="relative z-10 text-xs text-white/40 leading-snug line-clamp-2 flex-1">
                {module.description}
              </p>

              {/* Stats with Sparkline */}
              <div className="relative z-10 mt-auto pt-3 border-t border-white/5">
                <div className="flex items-center justify-between gap-2">
                  {/* Primary Stat */}
                  <div className="flex items-baseline gap-1.5 min-w-0">
                    <span className={`text-lg font-bold bg-gradient-to-r ${module.color} bg-clip-text text-transparent`}>
                      {primaryStat[1]}
                    </span>
                    <span className="text-xs text-white/40 capitalize truncate">
                      {primaryStat[0]}
                    </span>
                  </div>

                  {/* Sparkline + Trend */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <Sparkline
                      data={module.trend}
                      width={48}
                      height={18}
                      color={module.sparklineColor}
                      variant="area"
                      strokeWidth={1.5}
                      showDot={true}
                    />
                    <span className={`text-xs font-medium ${
                      module.trendDirection === 'up' ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {module.trendPercent}
                    </span>
                  </div>
                </div>
              </div>

              {/* Hover arrow */}
              <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-150 ease-out transform translate-x-2 group-hover:translate-x-0">
                <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${module.color} flex items-center justify-center shadow-lg`}>
                  <span className="text-white text-xs">→</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Info Card */}
      <div className="mx-4 mt-4 bg-gradient-to-r from-violet-500/10 to-cyan-500/5 border border-violet-500/20 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-violet-500/20">
            <Compass className="w-4 h-4 text-violet-400" />
          </div>
          <div>
            <h4 className="text-white font-medium text-sm mb-1">
              Interconnected System
            </h4>
            <p className="text-xs text-white/50 leading-relaxed">
              All modules feed into a central timeline, revealing patterns and insights across your life.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
