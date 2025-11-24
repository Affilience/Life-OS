import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  Dumbbell,
  Book,
  Calendar,
  TrendingUp,
  Zap,
  DollarSign,
  Compass
} from 'lucide-react';

// Module colors harmonized with Cosmic Violet theme
const CORE_MODULES = [
  {
    id: 'productivity',
    name: 'Productivity & Business',
    description: 'Deep work tracking, projects, tasks, income',
    icon: Zap,
    color: 'from-indigo-500 to-violet-500',  // Indigo - Focus
    route: '/productivity',
    stats: { tasks: 12, projects: 3, hours: 28 }
  },
  {
    id: 'health',
    name: 'Health & Fitness',
    description: 'Workouts, nutrition, sleep, recovery',
    icon: Dumbbell,
    color: 'from-emerald-500 to-teal-500',   // Emerald - Vitality
    route: '/health',
    stats: { workouts: 14, streak: 7, calories: 2200 }
  },
  {
    id: 'knowledge',
    name: 'Knowledge Management',
    description: 'Books, podcasts, notes, ideas, implementation',
    icon: Book,
    color: 'from-violet-500 to-purple-500',  // Violet - Wisdom (Primary)
    route: '/knowledge',
    stats: { books: 3, notes: 45, hours: 12 }
  },
  {
    id: 'journal',
    name: 'Journal & Diary',
    description: 'Free-form entries, mood tracking, reflection',
    icon: Activity,
    color: 'from-slate-400 to-slate-500',    // Slate - Reflection
    route: '/journal',
    stats: { entries: 87, streak: 12, moods: 'Positive' }
  },
  {
    id: 'calendar',
    name: 'Calendar & Time',
    description: 'Time blocking, planned vs actual, energy mapping',
    icon: Calendar,
    color: 'from-rose-500 to-pink-500',      // Rose - Time/Urgency
    route: '/calendar',
    stats: { events: 23, blocked: '32h', efficiency: '87%' }
  },
  {
    id: 'skills',
    name: 'Skills Learning',
    description: 'Skill cards, practice logs, progression, real-world usage',
    icon: TrendingUp,
    color: 'from-cyan-500 to-sky-500',       // Cyan - Development
    route: '/skills',
    stats: { active: 5, mastered: 2, hours: 156 }
  },
  {
    id: 'financial',
    name: 'Financial Tracking',
    description: 'Income, expenses, net worth, goals, business finances',
    icon: DollarSign,
    color: 'from-amber-500 to-yellow-500',   // Amber - Prosperity
    route: '/financial',
    stats: { income: '$4.2k', saved: '$1.8k', net: '+$2.4k' }
  },
  {
    id: 'purpose',
    name: 'Purpose & Values',
    description: 'Life vision, core values, long-term goals',
    icon: Compass,
    color: 'from-fuchsia-500 to-violet-500', // Fuchsia - Vision
    route: '/purpose',
    stats: { goals: 8, values: 5, reviews: 12 }
  },
];

export default function Modules() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0c0a10] pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0c0a10]/95 backdrop-blur-md border-b border-white/5 px-6 py-4">
        <h1 className="text-2xl font-bold text-white">Modules</h1>
        <p className="text-sm text-white/60 mt-1">
          8 core systems for optimizing life
        </p>
      </div>

      {/* Modules Grid - 2 columns on mobile, 4 on desktop */}
      <div className="p-4 grid grid-cols-2 lg:grid-cols-4 gap-3">
        {CORE_MODULES.map((module) => {
          const Icon = module.icon;
          const statEntries = Object.entries(module.stats);
          const primaryStat = statEntries[0];

          return (
            <button
              key={module.id}
              onClick={() => navigate(module.route)}
              className="relative aspect-square bg-[#1a1724] border border-white/10 rounded-2xl p-4 hover:border-violet-500/30 hover:bg-[#221e2e] transition-all duration-300 text-left group overflow-hidden flex flex-col"
            >
              {/* Gradient overlay on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${module.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

              {/* Icon */}
              <div className={`
                relative z-10 w-12 h-12 rounded-xl bg-gradient-to-br ${module.color}
                flex items-center justify-center mb-3
                group-hover:scale-110 group-hover:shadow-lg transition-all duration-300
              `}>
                <Icon className="w-6 h-6 text-white" />
              </div>

              {/* Title */}
              <h3 className="relative z-10 text-sm font-semibold text-white leading-tight mb-1">
                {module.name}
              </h3>

              {/* Description - truncated */}
              <p className="relative z-10 text-xs text-white/40 leading-snug line-clamp-2 flex-1">
                {module.description}
              </p>

              {/* Primary Stat */}
              <div className="relative z-10 mt-auto pt-3 border-t border-white/5">
                <div className="flex items-baseline gap-1.5">
                  <span className={`text-lg font-bold bg-gradient-to-r ${module.color} bg-clip-text text-transparent`}>
                    {primaryStat[1]}
                  </span>
                  <span className="text-xs text-white/40 capitalize">
                    {primaryStat[0]}
                  </span>
                </div>
              </div>

              {/* Hover arrow */}
              <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${module.color} flex items-center justify-center`}>
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
