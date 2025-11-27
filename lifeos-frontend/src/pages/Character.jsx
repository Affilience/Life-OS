import React, { useState } from 'react';
import {
  User,
  Sword,
  TrendingUp,
  ShoppingBag,
  Sparkles,
  Shield,
  Heart,
  Zap,
  Brain,
  Users as UsersIcon,
  PawPrint
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStats } from '../hooks/useStats';
import { STAT_CONFIG } from '../utils/statsSystem';
import EquipmentShowcase from '../components/avatar/EquipmentShowcase';
import SkillTreeNew from './SkillTreeNew';
import Bazaar from './Bazaar';
import PetsSection from '../components/character/PetsSection';
import { usePetStore, PET_DATABASE } from '../stores/petStore';

const TABS = [
  { id: 'avatar', label: 'Avatar', icon: User, color: 'from-purple-500 to-pink-500' },
  { id: 'pets', label: 'Pets', icon: PawPrint, color: 'from-pink-500 to-rose-500' },
  { id: 'equipment', label: 'Equipment', icon: Sword, color: 'from-orange-500 to-red-500' },
  { id: 'skills', label: 'Skill Tree', icon: TrendingUp, color: 'from-cyan-500 to-blue-500' },
  { id: 'bazaar', label: 'Bazaar', icon: ShoppingBag, color: 'from-yellow-500 to-orange-500' },
];

export default function Character() {
  const [activeTab, setActiveTab] = useState('avatar');
  const navigate = useNavigate();

  // Use unified stats system
  const {
    stats,
    totalPower,
    balanceScore,
    synergies,
    statBreakdown,
    moduleMultipliers,
  } = useStats();

  // Get active/equipped pets
  const { activePets } = usePetStore();

  return (
    <div className="min-h-screen bg-[#0c0a10] pb-20">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-[#0c0a10] border-b border-white/5">
        {/* Title */}
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-400" />
            Character
          </h1>
          <p className="text-sm text-white/60 mt-1">
            Customize your hero and unlock new abilities
          </p>
        </div>


        {/* Tab Navigation */}
        <div className="flex gap-2 px-4 pb-2 overflow-x-auto scrollbar-hide">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm
                  whitespace-nowrap transition-all duration-200
                  ${isActive
                    ? `bg-gradient-to-r ${tab.color} text-white shadow-lg`
                    : 'bg-[#1a1724] text-white/60 hover:text-white hover:bg-[#221e2e] border border-white/10'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'avatar' && (
          <div className="space-y-6">
            {/* Avatar Display Card */}
            <div className="bg-[#1a1724] border border-white/10 rounded-2xl p-8">
              {/* Avatar Section */}
              <div className="flex flex-col items-center mb-8">
                {/* Hero Avatar with Pets - No Box */}
                <div className="relative mb-6 flex items-end justify-center gap-4">
                  {/* Left Pet (if any) */}
                  {activePets[0] && PET_DATABASE[activePets[0]] && (
                    <img
                      src={PET_DATABASE[activePets[0]].sprite}
                      alt={PET_DATABASE[activePets[0]].name}
                      className="w-20 h-20 pixelated self-end mb-2"
                      style={{ imageRendering: 'pixelated' }}
                    />
                  )}

                  {/* Main Avatar - Larger, No Box */}
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl scale-150" />
                    <img
                      src="/assets/avatar/evolution/hero_v3_stage_10_swordsman.png"
                      alt="Swordsman"
                      className="w-56 h-56 pixelated relative z-10"
                      style={{ imageRendering: 'pixelated' }}
                    />
                  </div>

                  {/* Right Pet (if any) */}
                  {activePets[1] && PET_DATABASE[activePets[1]] && (
                    <img
                      src={PET_DATABASE[activePets[1]].sprite}
                      alt={PET_DATABASE[activePets[1]].name}
                      className="w-20 h-20 pixelated self-end mb-2"
                      style={{ imageRendering: 'pixelated' }}
                    />
                  )}
                </div>

                {/* Additional Pets Row (3rd onwards) */}
                {activePets.length > 2 && (
                  <div className="flex items-center justify-center gap-3 mb-4">
                    {activePets.slice(2).map((petId) => {
                      const pet = PET_DATABASE[petId];
                      if (!pet) return null;
                      return (
                        <img
                          key={petId}
                          src={pet.sprite}
                          alt={pet.name}
                          className="w-14 h-14 pixelated"
                          style={{ imageRendering: 'pixelated' }}
                        />
                      );
                    })}
                  </div>
                )}

                {/* Character Info */}
                <div className="text-center mb-6">
                  <h2 className="text-3xl font-bold text-white mb-2">Swordsman</h2>
                  <p className="text-white/60">Stage 10 • Level 12</p>
                </div>

                {/* Level Progress Bar */}
                <div className="w-full max-w-md mb-8">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-400" />
                      <span className="text-sm font-semibold text-white">Level 12</span>
                    </div>
                    <span className="text-sm text-white/60">3,840 / 5,000 XP</span>
                  </div>
                  <div className="h-3 bg-[#0c0a10] rounded-full overflow-hidden border border-purple-500/20">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500 relative overflow-hidden"
                      style={{ width: '76.8%' }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                    </div>
                  </div>
                  <p className="text-xs text-white/50 mt-1 text-center">1,160 XP to Level 13</p>
                </div>

                {/* Stats Bars - Using Unified Stats System */}
                <div className="w-full max-w-md space-y-4">
                  {Object.entries(stats).map(([statKey, value]) => {
                    const config = STAT_CONFIG[statKey];
                    const Icon = config.lucideIcon === 'Sword' ? Sword :
                                config.lucideIcon === 'Heart' ? Heart :
                                config.lucideIcon === 'Brain' ? Brain :
                                config.lucideIcon === 'Sparkles' ? Sparkles :
                                config.lucideIcon === 'Shield' ? Shield : Sparkles;

                    const percentage = Math.min(100, (value / 100) * 100);

                    return (
                      <div key={statKey}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4" style={{ color: config.color }} />
                            <span className="text-sm font-semibold text-white">{config.name}</span>
                          </div>
                          <span className="text-sm font-bold" style={{ color: config.color }}>
                            {value}
                          </span>
                        </div>
                        <div
                          className="h-2 bg-[#0c0a10] rounded-full overflow-hidden border"
                          style={{ borderColor: `${config.color}33` }}
                        >
                          <div
                            className="h-full transition-all duration-500"
                            style={{
                              width: `${percentage}%`,
                              background: `linear-gradient(to right, ${config.color}, ${config.color}99)`
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Total Power & Balance */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-4">
                  <div className="text-xs text-purple-300 mb-1">Total Power</div>
                  <div className="text-2xl font-bold text-white">{totalPower}</div>
                </div>
                <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-xl p-4">
                  <div className="text-xs text-blue-300 mb-1">Balance Score</div>
                  <div className="text-2xl font-bold text-white">{balanceScore}%</div>
                </div>
              </div>

              {/* Stat Synergies */}
              {synergies.length > 0 && (
                <div className="bg-gradient-to-br from-orange-500/10 to-yellow-500/10 border border-orange-500/20 rounded-xl p-4 mb-4">
                  <div className="text-sm font-semibold text-orange-400 mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Active Synergies
                  </div>
                  <div className="space-y-2">
                    {synergies.map((synergy, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="text-lg">{synergy.icon}</span>
                        <div>
                          <div className="text-sm font-semibold text-white">{synergy.name}</div>
                          <div className="text-xs text-white/60">{synergy.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Evolution Progress */}
              <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-white/60">Next Evolution</span>
                  <span className="text-sm text-purple-400 font-medium">Level 15</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-semibold">Duelist</span>
                  <span className="text-xs text-white/50">Stage 11</span>
                </div>
                <div className="h-2 bg-[#0c0a10] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                    style={{ width: '80%' }}
                  />
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => navigate('/evolution')}
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity"
              >
                View Full Evolution Tree →
              </button>
            </div>
          </div>
        )}

        {activeTab === 'pets' && (
          <div className="p-6">
            <PetsSection forceShow={true} />
          </div>
        )}

        {activeTab === 'equipment' && (
          <EquipmentShowcase />
        )}

        {activeTab === 'skills' && (
          <SkillTreeNew />
        )}

        {activeTab === 'bazaar' && (
          <Bazaar />
        )}
      </div>
    </div>
  );
}
