import React from 'react';
import { Calendar, DollarSign, Compass, Target, Gift, Shield, Settings, Sparkles, Book, MoreHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/shared/PageHeader';

export default function More() {
  const navigate = useNavigate();

  const sections = [
    {
      title: 'Planning & Organization',
      items: [
        { icon: Calendar, label: 'Astral Map', path: '/calendar', color: 'from-blue-500 to-cyan-500' },
        { icon: Compass, label: 'North Star', path: '/purpose', color: 'from-purple-500 to-pink-500' },
      ],
    },
    {
      title: 'Finances',
      items: [
        { icon: DollarSign, label: 'Nebula', path: '/financial', color: 'from-green-500 to-emerald-500' },
      ],
    },
    {
      title: 'Knowledge & Learning',
      items: [
        { icon: Book, label: 'Observatory', path: '/learn', color: 'from-cyan-500 to-blue-500' },
      ],
    },
    {
      title: 'Gamification',
      items: [
        { icon: Gift, label: 'Reward Marketplace', path: '/rewards', color: 'from-yellow-500 to-orange-500' },
        { icon: Sparkles, label: 'Discoveries', path: '/discoveries', color: 'from-pink-500 to-purple-500' },
        { icon: Shield, label: 'Equipment', path: '/avatar', color: 'from-indigo-500 to-purple-500' },
      ],
    },
    {
      title: 'Settings',
      items: [
        { icon: Settings, label: 'Settings', path: '/settings', color: 'from-slate-500 to-slate-600' },
      ],
    },
  ];

  return (
    <div className="more-page min-h-screen p-4 pb-24">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <PageHeader
          title="Galaxy"
          subtitle="Access additional features and settings"
          icon={MoreHorizontal}
          module="default"
          variant="elevated"
        />

        {/* Sections */}
        {sections.map((section, idx) => (
          <div key={idx} className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider px-2">
              {section.title}
            </h3>
            <div className="space-y-2">
              {section.items.map((item, itemIdx) => {
                const Icon = item.icon;
                return (
                  <button
                    key={itemIdx}
                    onClick={() => navigate(item.path)}
                    className="w-full bg-[#1a1724]/50 hover:bg-[#1a1724] rounded-xl p-4 flex items-center gap-4 transition-all group border border-slate-700/50 hover:border-slate-600"
                  >
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-semibold text-white">{item.label}</div>
                    </div>
                    <svg
                      className="w-5 h-5 text-slate-500 group-hover:text-slate-300 transition-colors"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* App Info */}
        <div className="text-center text-sm text-slate-500 pt-8">
          <p>LifeOS v1.0.0</p>
          <p className="mt-1">Personal Operating System</p>
        </div>
      </div>
    </div>
  );
}
