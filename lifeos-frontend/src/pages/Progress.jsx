import React, { useState } from 'react';
import { User, Target, TrendingUp, Sparkles } from 'lucide-react';
import PageHeader from '../components/shared/PageHeader';
import Card from '../components/ui/Card';
import Skills from './Skills';
import Streaks from './Streaks';
import { useAvatarStore } from '../stores/avatarStore';
import { getStageByLevel } from '../data/avatarEvolution';
import AvatarRenderer from '../components/avatar/AvatarRenderer';

export default function Progress() {
  const [activeTab, setActiveTab] = useState('avatar');
  const { level, xp, prestige, stats } = useAvatarStore();

  const evolutionStage = getStageByLevel(level, prestige || 0);

  const tabs = [
    { id: 'avatar', label: 'Avatar', icon: User },
    { id: 'skills', label: 'Skills', icon: Target },
    { id: 'stats', label: 'Stats', icon: TrendingUp },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        title="Progress"
        stats={`Level ${level} · ${xp} XP`}
        icon={Sparkles}
        module="progress"
        variant="icon"
      />

      {/* Tab Navigation */}
      <Card padding="none">
        <div className="flex border-b border-border overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-6 py-4 text-sm font-medium
                  border-b-2 -mb-px transition-all duration-fast whitespace-nowrap
                  ${isActive
                    ? 'border-purple-500 text-text-high bg-muted'
                    : 'border-transparent text-text-med hover:text-text-high hover:bg-muted/50'
                  }
                `}
              >
                <Icon size={18} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="p-6">
        {activeTab === 'avatar' && (
          <div className="avatar-tab space-y-6">
            {/* Evolution Stage Title */}
            <div className="text-center">
              <h2 className="text-xl font-bold text-purple-400">{evolutionStage.name}</h2>
            </div>

            {/* Avatar Display */}
            <div className="flex justify-center">
              <div className="relative">
                <AvatarRenderer size={256} animate={true} showStats={false} />
                {prestige > 0 && (
                  <div className="absolute -top-2 -right-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full px-3 py-1 text-xs font-bold shadow-lg">
                    ✨ Prestige {prestige}
                  </div>
                )}
              </div>
            </div>

            {/* Level & XP */}
            <div className="bg-[#1a1724]/50 rounded-xl p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Level</span>
                <span className="text-2xl font-bold text-purple-400">{level}</span>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-400">Experience</span>
                  <span className="text-slate-400">{xp} XP</span>
                </div>
                <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                    style={{ width: `${(xp % 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.entries(stats).map(([stat, value]) => (
                <div key={stat} className="bg-[#1a1724]/50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-purple-400">{value}</div>
                  <div className="text-xs text-slate-400 capitalize">{stat}</div>
                </div>
              ))}
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <a
                href="/evolution"
                className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-lg p-4 text-center hover:border-purple-500/50 transition-all"
              >
                <div className="text-lg font-semibold">🌌 Evolution</div>
                <div className="text-xs text-slate-400 mt-1">View all stages</div>
              </a>
              <a
                href="/avatar"
                className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-lg p-4 text-center hover:border-purple-500/50 transition-all"
              >
                <div className="text-lg font-semibold">⚔️ Equipment</div>
                <div className="text-xs text-slate-400 mt-1">Manage gear</div>
              </a>
            </div>
          </div>
        )}

        {activeTab === 'skills' && <Skills />}
        {activeTab === 'stats' && <Streaks />}
        </div>
      </Card>
    </div>
  );
}
