import React, { useState, useMemo } from 'react';
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
  PawPrint,
  BarChart2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStats } from '../hooks/useStats';
import { STAT_CONFIG } from '../utils/statsSystem';
import EquipmentShowcase from '../components/avatar/EquipmentShowcase';
import SkyrimPerkTree from '../components/skills/SkyrimPerkTree';
import PetsSection from '../components/character/PetsSection';
import { AvatarWithCompanions } from '../components/avatar/AvatarWithCompanions';
import { usePetStore, PET_DATABASE } from '../stores/petStore';
import { useAvatarStore } from '../stores/avatarStore';
import { useGamificationModeStore, TERMINOLOGY, AVATAR_STAGE_NAMES, VISIBILITY } from '../stores/gamificationModeStore';

// Mode-specific styling
const MODE_STYLES = {
  cosmic: {
    headerIcon: 'text-purple-400',
    levelBarBorder: 'border-purple-500/20',
    levelBarFill: 'from-purple-500 to-pink-500',
    evolutionBg: 'bg-purple-500/10',
    evolutionBorder: 'border-purple-500/20',
    evolutionText: 'text-purple-400',
    totalPowerBg: 'from-purple-500/20 to-pink-500/20',
    totalPowerBorder: 'border-purple-500/30',
    totalPowerText: 'text-purple-300',
    balanceBg: 'from-blue-500/20 to-cyan-500/20',
    balanceBorder: 'border-blue-500/30',
    balanceText: 'text-blue-300',
    synergyBg: 'from-orange-500/10 to-yellow-500/10',
    synergyBorder: 'border-orange-500/20',
    synergyText: 'text-orange-400',
    genderActiveM: 'bg-purple-500',
    genderActiveF: 'bg-pink-500',
    actionBtn: 'from-purple-500 to-pink-500',
  },
  professional: {
    headerIcon: 'text-blue-400',
    levelBarBorder: 'border-blue-500/20',
    levelBarFill: 'from-blue-500 to-cyan-500',
    evolutionBg: 'bg-blue-500/10',
    evolutionBorder: 'border-blue-500/20',
    evolutionText: 'text-blue-400',
    totalPowerBg: 'from-blue-500/20 to-cyan-500/20',
    totalPowerBorder: 'border-blue-500/30',
    totalPowerText: 'text-blue-300',
    balanceBg: 'from-teal-500/20 to-cyan-500/20',
    balanceBorder: 'border-teal-500/30',
    balanceText: 'text-teal-300',
    synergyBg: 'from-blue-500/10 to-cyan-500/10',
    synergyBorder: 'border-blue-500/20',
    synergyText: 'text-blue-400',
    genderActiveM: 'bg-blue-500',
    genderActiveF: 'bg-cyan-500',
    actionBtn: 'from-blue-500 to-cyan-500',
  },
  minimal: {
    headerIcon: 'text-gray-400',
    levelBarBorder: 'border-gray-500/20',
    levelBarFill: 'from-gray-400 to-gray-500',
    evolutionBg: 'bg-gray-500/10',
    evolutionBorder: 'border-gray-500/20',
    evolutionText: 'text-gray-400',
    totalPowerBg: 'from-gray-500/10 to-gray-600/10',
    totalPowerBorder: 'border-gray-500/20',
    totalPowerText: 'text-gray-300',
    balanceBg: 'from-gray-500/10 to-gray-600/10',
    balanceBorder: 'border-gray-500/20',
    balanceText: 'text-gray-300',
    synergyBg: 'from-gray-500/10 to-gray-600/10',
    synergyBorder: 'border-gray-500/20',
    synergyText: 'text-gray-400',
    genderActiveM: 'bg-gray-500',
    genderActiveF: 'bg-gray-400',
    actionBtn: 'from-gray-500 to-gray-600',
  },
};

// Mode-specific tab configurations
const getTabs = (mode, isVisible) => {
  const tabs = [];

  // Avatar/Profile tab - always visible but with different labels
  if (isVisible('showAvatar') || mode !== 'minimal') {
    tabs.push({
      id: 'avatar',
      label: mode === 'cosmic' ? 'Avatar' : 'Profile',
      icon: User,
      color: 'from-purple-500 to-pink-500'
    });
  }

  // Pets tab - hidden in minimal mode
  if (isVisible('showPets')) {
    tabs.push({
      id: 'pets',
      label: mode === 'cosmic' ? 'Companions' : mode === 'professional' ? 'Boosters' : 'Bonuses',
      icon: PawPrint,
      color: 'from-pink-500 to-rose-500'
    });
  }

  // Equipment tab - hidden in minimal mode
  if (isVisible('showEquipment')) {
    tabs.push({
      id: 'equipment',
      label: mode === 'cosmic' ? 'Equipment' : mode === 'professional' ? 'Boosters' : 'Bonuses',
      icon: Sword,
      color: 'from-orange-500 to-red-500'
    });
  }

  // Skills tab - always visible
  if (isVisible('showSkillTree')) {
    tabs.push({
      id: 'skills',
      label: mode === 'cosmic' ? 'Skill Tree' : mode === 'professional' ? 'Growth Map' : 'Skills',
      icon: TrendingUp,
      color: 'from-cyan-500 to-blue-500'
    });
  }

  // Bazaar/Shop tab - hidden based on visibility
  if (isVisible('showBazaar')) {
    tabs.push({
      id: 'bazaar',
      label: mode === 'cosmic' ? 'Bazaar' : 'Shop',
      icon: ShoppingBag,
      color: mode === 'cosmic' ? 'from-yellow-500 to-orange-500' : mode === 'professional' ? 'from-blue-500 to-cyan-500' : 'from-gray-500 to-gray-600'
    });
  }

  // Stats tab for minimal mode
  if (mode === 'minimal') {
    tabs.push({
      id: 'stats',
      label: 'Stats',
      icon: BarChart2,
      color: 'from-blue-500 to-cyan-500'
    });
  }

  return tabs;
};

export default function Character() {
  const navigate = useNavigate();

  // Get gamification mode settings
  const { mode, isVisible, getTerm, getAvatarStageName } = useGamificationModeStore();
  const terms = TERMINOLOGY[mode] || TERMINOLOGY.cosmic;
  const styles = MODE_STYLES[mode] || MODE_STYLES.cosmic;
  const visibility = VISIBILITY[mode] || VISIBILITY.cosmic;

  // Get tabs based on current mode and visibility settings
  const tabs = useMemo(() => getTabs(mode, isVisible), [mode, isVisible]);

  // Initialize activeTab to first available tab
  const [activeTab, setActiveTab] = useState(() => tabs[0]?.id || 'avatar');

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

  // Get character gender and sprite helper from avatar store
  const { characterGender, getHeroSpritePath, setCharacterGender } = useAvatarStore();

  // Get current avatar sprite path (Stage 10 = Swordsman)
  const currentAvatarSprite = getHeroSpritePath(10, 'Swordsman');

  // Get stage name based on mode
  const stageIndex = 9; // Stage 10 is index 9
  const currentStageName = mode === 'cosmic'
    ? (characterGender === 'female' ? 'Swordswoman' : 'Swordsman')
    : getAvatarStageName(stageIndex);

  return (
    <div className="min-h-screen bg-[#0c0a10] pb-20">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-[#0c0a10] border-b border-white/5">
        {/* Title */}
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Sparkles className={`w-6 h-6 ${styles.headerIcon}`} />
            {mode === 'cosmic' ? 'Character' : 'Profile'}
          </h1>
          <p className="text-sm text-white/60 mt-1">
            {mode === 'cosmic'
              ? 'Customize your hero and unlock new abilities'
              : mode === 'professional'
                ? 'Track your growth and unlock new capabilities'
                : 'View your progress and stats'}
          </p>
        </div>


        {/* Tab Navigation */}
        <div className="flex gap-2 px-4 pb-2 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => {
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
                {/* Hero Avatar with Companions */}
                <AvatarWithCompanions
                  avatarSrc={currentAvatarSprite}
                  avatarAlt={currentStageName}
                  activePets={activePets}
                  avatarSize={224}
                  className="mb-4"
                />

                {/* Character Info */}
                <div className="text-center mb-6">
                  <h2 className="text-3xl font-bold text-white mb-2">{currentStageName}</h2>
                  <p className="text-white/60">
                    {mode === 'cosmic' ? 'Stage 10' : mode === 'professional' ? 'Growth Stage 10' : 'Stage 10'} • {terms.level} 12
                  </p>

                  {/* Gender Toggle - Show in cosmic mode with avatar visible */}
                  {visibility.showAvatar && (
                    <div className="flex items-center justify-center gap-1 mt-4 bg-[#0c0a10] border border-white/10 rounded-lg p-1">
                      <button
                        onClick={() => setCharacterGender('male')}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                          characterGender === 'male'
                            ? `${styles.genderActiveM} text-white`
                            : 'text-white/60 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        {mode === 'cosmic' ? 'Hero' : 'Male'}
                      </button>
                      <button
                        onClick={() => setCharacterGender('female')}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                          characterGender === 'female'
                            ? `${styles.genderActiveF} text-white`
                            : 'text-white/60 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        {mode === 'cosmic' ? 'Heroine' : 'Female'}
                      </button>
                    </div>
                  )}
                </div>

                {/* Level Progress Bar */}
                <div className="w-full max-w-md mb-8">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className={`w-4 h-4 ${styles.headerIcon}`} />
                      <span className="text-sm font-semibold text-white">{terms.level} 12</span>
                    </div>
                    <span className="text-sm text-white/60">3,840 / 5,000 {terms.xp}</span>
                  </div>
                  <div className={`h-3 bg-[#0c0a10] rounded-full overflow-hidden border ${styles.levelBarBorder}`}>
                    <div
                      className={`h-full bg-gradient-to-r ${styles.levelBarFill} transition-all duration-500 relative overflow-hidden`}
                      style={{ width: '76.8%' }}
                    >
                      {mode === 'cosmic' && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-white/50 mt-1 text-center">1,160 {terms.xp} to {terms.level} 13</p>
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
                <div className={`bg-gradient-to-br ${styles.totalPowerBg} border ${styles.totalPowerBorder} rounded-xl p-4`}>
                  <div className={`text-xs ${styles.totalPowerText} mb-1`}>{mode === 'cosmic' ? 'Total Power' : 'Overall Score'}</div>
                  <div className="text-2xl font-bold text-white">{totalPower}</div>
                </div>
                <div className={`bg-gradient-to-br ${styles.balanceBg} border ${styles.balanceBorder} rounded-xl p-4`}>
                  <div className={`text-xs ${styles.balanceText} mb-1`}>Balance Score</div>
                  <div className="text-2xl font-bold text-white">{balanceScore}%</div>
                </div>
              </div>

              {/* Stat Synergies - Only show in cosmic and professional modes */}
              {synergies.length > 0 && mode !== 'minimal' && (
                <div className={`bg-gradient-to-br ${styles.synergyBg} border ${styles.synergyBorder} rounded-xl p-4 mb-4`}>
                  <div className={`text-sm font-semibold ${styles.synergyText} mb-2 flex items-center gap-2`}>
                    <Sparkles className="w-4 h-4" />
                    {mode === 'cosmic' ? 'Active Synergies' : 'Active Bonuses'}
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
              <div className={`${styles.evolutionBg} border ${styles.evolutionBorder} rounded-xl p-4 mb-4`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-white/60">
                    {mode === 'cosmic' ? 'Next Evolution' : mode === 'professional' ? 'Next Growth Stage' : 'Next Stage'}
                  </span>
                  <span className={`text-sm ${styles.evolutionText} font-medium`}>{terms.level} 15</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-semibold">
                    {mode === 'cosmic' ? 'Duelist' : mode === 'professional' ? 'Capable' : 'Stage 11'}
                  </span>
                  <span className="text-xs text-white/50">
                    {mode === 'cosmic' ? 'Stage 11' : mode === 'professional' ? 'Level 11' : 'Level 11'}
                  </span>
                </div>
                <div className="h-2 bg-[#0c0a10] rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${styles.levelBarFill} transition-all duration-500`}
                    style={{ width: '80%' }}
                  />
                </div>
              </div>

              {/* Action Button - Only show if Evolution Gallery is visible */}
              {visibility.showEvolutionGallery && (
                <button
                  onClick={() => navigate('/evolution')}
                  className={`w-full py-3 bg-gradient-to-r ${styles.actionBtn} text-white font-semibold rounded-xl hover:opacity-90 transition-opacity`}
                >
                  {mode === 'cosmic' ? 'View Full Evolution Tree →' : 'View All Progress Levels →'}
                </button>
              )}
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
          <SkyrimPerkTree />
        )}

        {activeTab === 'bazaar' && (
          <div className="p-6 text-center">
            <div className="text-6xl mb-4">🛒</div>
            <h3 className="text-xl font-bold text-white mb-2">Bazaar Coming Soon</h3>
            <p className="text-white/60">The marketplace is being stocked with new items!</p>
          </div>
        )}

        {/* Stats-only view for minimal mode */}
        {activeTab === 'stats' && (
          <div className="space-y-6">
            <div className="bg-[#1a1724] border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Progress Overview</h3>

              {/* Level and XP */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-[#0c0a10] rounded-xl p-4">
                  <div className="text-sm text-white/60 mb-1">Current Level</div>
                  <div className="text-3xl font-bold text-white">12</div>
                </div>
                <div className="bg-[#0c0a10] rounded-xl p-4">
                  <div className="text-sm text-white/60 mb-1">Total Points</div>
                  <div className="text-3xl font-bold text-white">3,840</div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="space-y-3">
                {Object.entries(stats).map(([statKey, value]) => {
                  const config = STAT_CONFIG[statKey];
                  return (
                    <div key={statKey} className="flex items-center justify-between bg-[#0c0a10] rounded-lg px-4 py-3">
                      <span className="text-white/80">{config.name}</span>
                      <span className="text-lg font-semibold" style={{ color: config.color }}>{value}</span>
                    </div>
                  );
                })}
              </div>

              {/* Summary Stats */}
              <div className="grid grid-cols-2 gap-3 mt-6">
                <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-4">
                  <div className="text-xs text-white/60 mb-1">Total Power</div>
                  <div className="text-2xl font-bold text-white">{totalPower}</div>
                </div>
                <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl p-4">
                  <div className="text-xs text-white/60 mb-1">Balance</div>
                  <div className="text-2xl font-bold text-white">{balanceScore}%</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
