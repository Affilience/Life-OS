import React, { useState } from 'react';
import { User, Target, Trophy, TrendingUp } from 'lucide-react';
import Skills from './Skills';
import SkillTreeNew from './SkillTreeNew';
import Streaks from './Streaks';
import { useAvatarStore } from '../stores/avatarStore';
import { getStageByLevel } from '../data/avatarEvolution';
import AvatarRenderer from '../components/avatar/AvatarRenderer';

export default function Progress() {
  const [activeTab, setActiveTab] = useState('avatar');
  const { level, xp, prestige, stats } = useAvatarStore();

  const evolutionStage = getStageByLevel(level, prestige || 0);

  const tabs = [
    { id: 'avatar', name: 'Avatar', icon: User },
    { id: 'skills', name: 'Skills', icon: Target },
    { id: 'tree', name: 'Skill Tree', icon: Trophy },
    { id: 'stats', name: 'Stats', icon: TrendingUp },
  ];

  return (
    <div className="progress-page min-h-screen">
      {/* Tab Navigation */}
      <div className="sticky top-0 z-40 bg-[#0c0a10] border-b border-slate-800">
        <div className="flex overflow-x-auto hide-scrollbar">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 min-w-[120px] px-4 py-4 flex flex-col items-center gap-2 transition-all ${
                  activeTab === tab.id
                    ? 'bg-purple-500/20 text-purple-400 border-b-2 border-purple-500'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#1a1724]/50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-semibold">{tab.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Tab Content */}
      <div className="tab-content p-4">
        {activeTab === 'avatar' && (
          <div className="avatar-tab space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                {evolutionStage.name}
              </h2>
              <p className="text-slate-400 mb-1">{evolutionStage.category}</p>
              <p className="text-sm text-slate-500">{evolutionStage.description}</p>
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
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(stats).map(([stat, value]) => (
                <div key={stat} className="bg-[#1a1724]/50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-purple-400">{value}</div>
                  <div className="text-xs text-slate-400 capitalize">{stat}</div>
                </div>
              ))}
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-2 gap-3">
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
        {activeTab === 'tree' && <SkillTreeNew />}
        {activeTab === 'stats' && <Streaks />}
      </div>

      <style>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .tab-content {
          animation: fadeIn 0.3s ease-in-out;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
