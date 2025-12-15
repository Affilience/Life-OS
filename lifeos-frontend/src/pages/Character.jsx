import React, { useState, useMemo, useEffect, useCallback } from 'react';
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
  BarChart2,
  Package,
  AtSign,
  Check,
  X,
  Loader2,
  Edit3,
  UserCircle,
  ArrowUpCircle
} from 'lucide-react';
import PageHeader from '../components/shared/PageHeader';
import { useNavigate } from 'react-router-dom';
import { useStats } from '../hooks/useStats';
import { STAT_CONFIG } from '../utils/statsSystem';
import EquipmentShowcase from '../components/avatar/EquipmentShowcase';
import SkyrimPerkTree from '../components/skills/SkyrimPerkTree';
import ActivePerkBonuses from '../components/character/ActivePerkBonuses';
import PetsSection from '../components/character/PetsSection';
import BazaarMarketplace from '../components/bazaar/BazaarMarketplace';
import InventorySection from '../components/character/InventorySection';
import { MediumAvatarWithPets } from '../components/avatar/AvatarWithCompanions';
import { usePetStore, PET_DATABASE } from '../stores/petStore';
import { useAvatarStore } from '../stores/avatarStore';
import { useGamificationModeStore, TERMINOLOGY, AVATAR_STAGE_NAMES, VISIBILITY } from '../stores/gamificationModeStore';
import { useGamificationStore } from '../stores/gamificationStore';
import { useNewOnboardingStore } from '../stores/newOnboardingStore';
import { useSocialStore } from '../stores/socialStore';
import { useSkillPointsStore } from '../stores/skillPointsStore';
import { getStageByLevel, getNextStageMilestone } from '../data/avatarEvolution';
import SkillPointAllocator from '../components/character/SkillPointAllocator';
import StatBreakdown from '../components/character/StatBreakdown';
import { Info } from 'lucide-react';

// Mode-specific styling
const MODE_STYLES = {
  cosmic: {
    headerIcon: 'text-primary-400',
    levelBarBorder: 'border-purple-500/20',
    levelBarFill: 'from-purple-500 to-pink-500',
    evolutionBg: 'bg-purple-500/10',
    evolutionBorder: 'border-purple-500/20',
    evolutionText: 'text-primary-400',
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

  // Inventory tab - for consumables and cosmetics (shown in cosmic and professional modes)
  if (mode !== 'minimal') {
    tabs.push({
      id: 'inventory',
      label: 'Inventory',
      icon: Package,
      color: 'from-emerald-500 to-teal-500'
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
  const { characterGender, getHeroSpritePath, setCharacterGender, prestige, getActiveTitle } = useAvatarStore();

  // Get active cosmetics
  const activeTitle = getActiveTitle();

  // Get level/XP from gamificationStore (same source as dashboard)
  const { level, currentXP, xpToNextLevel } = useGamificationStore();

  // Get username from onboarding store (fallback)
  const { profile } = useNewOnboardingStore();

  // Get username from social store (primary source - from database)
  const { socialProfile, updateUsername, checkUsernameAvailable, fetchSocialProfile } = useSocialStore();

  // Get skill points
  const { unallocatedPoints, initializeForLevel } = useSkillPointsStore();

  // Initialize skill points based on level
  useEffect(() => {
    if (level > 0) {
      initializeForLevel(level);
    }
  }, [level, initializeForLevel]);

  // Prefer socialProfile (database) over onboarding store (local)
  const displayName = socialProfile?.display_name || socialProfile?.username || profile.displayName || profile.username || 'Traveler';
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [usernameInput, setUsernameInput] = useState('');
  const [usernameStatus, setUsernameStatus] = useState({ checking: false, available: null, error: null });
  const [savingUsername, setSavingUsername] = useState(false);
  const [showStatBreakdown, setShowStatBreakdown] = useState(false);

  // Fetch social profile on mount
  useEffect(() => {
    fetchSocialProfile();
  }, []);

  // Initialize username input when editing starts
  const startEditingUsername = useCallback(() => {
    setUsernameInput(socialProfile?.username || '');
    setUsernameStatus({ checking: false, available: null, error: null });
    setIsEditingUsername(true);
  }, [socialProfile?.username]);

  // Check username availability with debounce
  useEffect(() => {
    if (!isEditingUsername || !usernameInput || usernameInput.length < 3) {
      setUsernameStatus({ checking: false, available: null, error: usernameInput && usernameInput.length < 3 ? 'Min 3 characters' : null });
      return;
    }

    // If same as current username, it's available
    if (usernameInput.toLowerCase() === socialProfile?.username?.toLowerCase()) {
      setUsernameStatus({ checking: false, available: true, error: null });
      return;
    }

    setUsernameStatus({ checking: true, available: null, error: null });

    const timeoutId = setTimeout(async () => {
      const result = await checkUsernameAvailable(usernameInput);
      setUsernameStatus({ checking: false, available: result.available, error: result.error });
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [usernameInput, isEditingUsername, socialProfile?.username, checkUsernameAvailable]);

  // Save username
  const handleSaveUsername = async () => {
    if (!usernameStatus.available || savingUsername) return;

    setSavingUsername(true);
    const result = await updateUsername(usernameInput);
    setSavingUsername(false);

    if (!result.error) {
      setIsEditingUsername(false);
    } else {
      setUsernameStatus({ checking: false, available: false, error: result.error });
    }
  };

  // Cancel editing
  const cancelEditingUsername = () => {
    setIsEditingUsername(false);
    setUsernameInput('');
    setUsernameStatus({ checking: false, available: null, error: null });
  };

  // Calculate current stage based on actual level
  const currentLevel = level || 1;
  const currentPrestige = prestige || 0;

  // Get evolution stage based on level
  const currentStage = getStageByLevel(currentLevel, currentPrestige);
  const nextStage = getNextStageMilestone(currentLevel, currentPrestige);

  // Calculate XP progress (using xpToNextLevel from gamificationStore)
  const xpForNextLevel = xpToNextLevel || 100;
  const xpProgress = xpForNextLevel > 0 ? Math.min(100, (currentXP / xpForNextLevel) * 100) : 0;

  // Get current avatar sprite path based on actual stage
  const currentAvatarSprite = getHeroSpritePath(currentStage.levelRequired, currentStage.name);

  // Get stage name based on mode and gender
  const currentStageName = mode === 'cosmic'
    ? (characterGender === 'female' && currentStage.name === 'Swordsman' ? 'Swordswoman' : currentStage.name)
    : getAvatarStageName(currentStage.levelRequired - 1);

  return (
    <div className="min-h-screen bg-bg-0 pb-20 overflow-x-hidden w-full">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-bg-0 border-b border-border-subtle w-full">
        {/* Title */}
        <div className="px-4 sm:px-6 pt-4">
          <PageHeader
            title={mode === 'cosmic' ? 'Character' : 'Profile'}
            subtitle={mode === 'cosmic'
              ? 'Customize your hero and unlock new abilities'
              : mode === 'professional'
                ? 'Track your growth and unlock new capabilities'
                : 'View your progress and stats'}
            icon={UserCircle}
            module="character"
            variant="elevated"
          />
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1.5 sm:gap-2 px-2 sm:px-4 pb-2 overflow-x-auto scrollbar-hide w-full">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                data-tour={`character-tab-${tab.id}`}
                className={`
                  flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 rounded-lg font-medium text-xs sm:text-sm
                  whitespace-nowrap transition-all duration-200 flex-shrink-0
                  ${isActive
                    ? `bg-gradient-to-r ${tab.color} text-text-primary shadow-lg`
                    : 'bg-bg-1 text-text-muted hover:text-text-primary hover:bg-bg-2 border border-border'
                  }
                `}
              >
                <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-4 sm:p-6">
        {activeTab === 'avatar' && (
          <div className="space-y-4">
            {/* Avatar Display Card - Responsive Layout */}
            <div className="bg-bg-1 border border-border rounded-2xl p-4 sm:p-5 overflow-hidden">
              {/* Main Row: Stack on mobile, horizontal on larger screens */}
              <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
                {/* Left: Avatar & Character Info */}
                <div className="flex flex-col items-center w-full lg:w-auto" data-tour="character-avatar">
                  {/* Hero Avatar with Companions - Responsive size */}
                  <div className="w-full flex justify-center overflow-visible relative py-4" style={{ minHeight: '340px' }}>
                    <MediumAvatarWithPets
                      avatarSrc={currentAvatarSprite}
                      avatarAlt={currentStageName}
                      activePets={activePets}
                      size={240}
                      className="mb-2 relative z-10"
                    />
                  </div>

                  {/* Character Name & Stage */}
                  {activeTitle && (
                    <p className="text-xs font-semibold text-yellow-400 mb-0.5 tracking-wide">
                      ✦ {activeTitle} ✦
                    </p>
                  )}
                  <h2 className="text-xl font-bold text-text-primary mb-0.5">{displayName}</h2>

                  {/* Username Display/Edit */}
                  <div className="mb-1">
                    {isEditingUsername ? (
                      <div className="flex flex-col items-center gap-2">
                        <div className="relative">
                          <AtSign className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                          <input
                            type="text"
                            value={usernameInput}
                            onChange={(e) => setUsernameInput(e.target.value.replace(/[^a-zA-Z0-9_]/g, '').slice(0, 30))}
                            placeholder="username"
                            className={`pl-7 pr-8 py-1.5 text-sm bg-bg-0 border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 w-44 ${
                              usernameStatus.error
                                ? 'border-red-500/50 focus:ring-red-500/30'
                                : usernameStatus.available
                                  ? 'border-green-500/50 focus:ring-green-500/30'
                                  : 'border-border focus:ring-primary-500/30'
                            }`}
                            autoFocus
                          />
                          <div className="absolute right-2 top-1/2 -translate-y-1/2">
                            {usernameStatus.checking ? (
                              <Loader2 className="w-4 h-4 text-text-muted animate-spin" />
                            ) : usernameStatus.available ? (
                              <Check className="w-4 h-4 text-green-500" />
                            ) : usernameStatus.error ? (
                              <X className="w-4 h-4 text-red-500" />
                            ) : null}
                          </div>
                        </div>
                        {usernameStatus.error && (
                          <p className="text-xs text-red-400">{usernameStatus.error}</p>
                        )}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={handleSaveUsername}
                            disabled={!usernameStatus.available || savingUsername}
                            className={`px-3 py-1 text-xs font-medium rounded-lg flex items-center gap-1 transition-all ${
                              usernameStatus.available && !savingUsername
                                ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                                : 'bg-bg-2 text-text-muted cursor-not-allowed'
                            }`}
                          >
                            {savingUsername ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Check className="w-3 h-3" />
                            )}
                            Save
                          </button>
                          <button
                            onClick={cancelEditingUsername}
                            className="px-3 py-1 text-xs font-medium rounded-lg bg-bg-2 text-text-muted hover:bg-bg-hover hover:text-text-primary transition-all flex items-center gap-1"
                          >
                            <X className="w-3 h-3" />
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={startEditingUsername}
                        className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 transition-colors group"
                      >
                        <AtSign className="w-3.5 h-3.5" />
                        <span>{socialProfile?.username || 'Set username'}</span>
                        <Edit3 className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    )}
                  </div>

                  <p className="text-sm text-primary-400 mb-1">{currentStageName}</p>
                  <p className="text-xs text-text-muted mb-3">
                    {mode === 'cosmic' ? `Stage ${currentStage.levelRequired}` : `Stage ${currentStage.levelRequired}`} • {terms.level} {currentLevel}
                  </p>

                  {/* Gender Toggle */}
                  {visibility.showAvatar && (
                    <div className="flex items-center gap-1 bg-bg-0 border border-border rounded-lg p-1">
                      <button
                        onClick={() => setCharacterGender('male')}
                        className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                          characterGender === 'male'
                            ? `${styles.genderActiveM} text-text-primary`
                            : 'text-text-muted hover:text-text-primary hover:bg-white/5'
                        }`}
                      >
                        {mode === 'cosmic' ? 'Hero' : 'Male'}
                      </button>
                      <button
                        onClick={() => setCharacterGender('female')}
                        className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                          characterGender === 'female'
                            ? `${styles.genderActiveF} text-text-primary`
                            : 'text-text-muted hover:text-text-primary hover:bg-white/5'
                        }`}
                      >
                        {mode === 'cosmic' ? 'Heroine' : 'Female'}
                      </button>
                    </div>
                  )}

                  {/* Evolution Showcase Button */}
                  {visibility.showAvatar && (
                    <button
                      onClick={() => navigate('/evolution')}
                      className={`mt-3 flex items-center gap-2 px-4 py-2 bg-gradient-to-r ${styles.actionBtn} rounded-lg text-sm font-medium text-text-primary hover:opacity-90 transition-all shadow-lg`}
                    >
                      <ArrowUpCircle className="w-4 h-4" />
                      <span>View Evolution Stages</span>
                    </button>
                  )}
                </div>

                {/* Right: Stats */}
                <div className="flex-1 min-w-0" data-tour="character-stats">
                  {/* Stats Grid */}
                  <div className="space-y-2.5">
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
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-1.5">
                              <Icon className="w-3.5 h-3.5" style={{ color: config.color }} />
                              <span className="text-xs font-medium text-text-primary">{config.name}</span>
                            </div>
                            <span className="text-xs font-bold" style={{ color: config.color }}>{value}</span>
                          </div>
                          <div
                            className="h-1.5 bg-bg-0 rounded-full overflow-hidden"
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

                  {/* Power & Balance Row */}
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    <div className={`bg-gradient-to-br ${styles.totalPowerBg} border ${styles.totalPowerBorder} rounded-lg p-2.5`}>
                      <div className={`text-[10px] ${styles.totalPowerText} mb-0.5`}>{mode === 'cosmic' ? 'Total Power' : 'Overall Score'}</div>
                      <div className="text-lg font-bold text-text-primary">{totalPower}</div>
                    </div>
                    <div className={`bg-gradient-to-br ${styles.balanceBg} border ${styles.balanceBorder} rounded-lg p-2.5`}>
                      <div className={`text-[10px] ${styles.balanceText} mb-0.5`}>Balance Score</div>
                      <div className="text-lg font-bold text-text-primary">{balanceScore}%</div>
                    </div>
                  </div>

                  {/* Stat Breakdown Button */}
                  <button
                    onClick={() => setShowStatBreakdown(true)}
                    className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 rounded-lg text-sm text-text-muted hover:text-text-primary transition-all"
                  >
                    <Info className="w-4 h-4" />
                    <span>View Stat Sources</span>
                  </button>

                  {/* Skill Point Allocator - Compact inline version */}
                  {mode !== 'minimal' && (
                    <div className="mt-3">
                      <SkillPointAllocator compact />
                    </div>
                  )}
                </div>
              </div>

              {/* XP Progress Bar - Full Width Below */}
              <div className="mt-4 pt-4 border-t border-border-subtle">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <Sparkles className={`w-4 h-4 ${styles.headerIcon}`} />
                    <span className="text-sm font-semibold text-text-primary">{terms.level} {currentLevel}</span>
                  </div>
                  <span className="text-xs text-text-muted">{currentXP.toLocaleString()} / {xpForNextLevel.toLocaleString()} {terms.xp}</span>
                </div>
                <div className={`h-2.5 bg-bg-0 rounded-full overflow-hidden border ${styles.levelBarBorder}`}>
                  <div
                    className={`h-full bg-gradient-to-r ${styles.levelBarFill} transition-all duration-500 relative overflow-hidden`}
                    style={{ width: `${xpProgress}%` }}
                  >
                    {mode === 'cosmic' && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                    )}
                  </div>
                </div>
                <p className="text-[10px] text-text-muted mt-1">{(xpForNextLevel - currentXP).toLocaleString()} {terms.xp} to {terms.level} {currentLevel + 1}</p>
              </div>
            </div>

            {/* Stat Synergies */}
            {synergies.length > 0 && mode !== 'minimal' && (
              <div className={`bg-gradient-to-br ${styles.synergyBg} border ${styles.synergyBorder} rounded-xl p-4`}>
                <div className={`text-sm font-semibold ${styles.synergyText} mb-2 flex items-center gap-2`}>
                  <Sparkles className="w-4 h-4" />
                  {mode === 'cosmic' ? 'Active Synergies' : 'Active Bonuses'}
                </div>
                <div className="space-y-2">
                  {synergies.slice(0, 2).map((synergy, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-lg">{synergy.icon}</span>
                      <div>
                        <div className="text-sm font-semibold text-text-primary">{synergy.name}</div>
                        <div className="text-xs text-text-muted">{synergy.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'pets' && (
          <div data-tour="pets-section">
            <PetsSection forceShow={true} />
          </div>
        )}

        {activeTab === 'equipment' && (
          <div data-tour="equipment-section">
            <EquipmentShowcase />
          </div>
        )}

        {activeTab === 'skills' && (
          <div className="space-y-6" data-tour="perks-section">
            <ActivePerkBonuses />
            <SkyrimPerkTree />
          </div>
        )}

        {activeTab === 'inventory' && (
          <InventorySection />
        )}

        {activeTab === 'bazaar' && (
          <div data-tour="bazaar-section">
            <BazaarMarketplace />
          </div>
        )}

        {/* Stats-only view for minimal mode */}
        {activeTab === 'stats' && (
          <div className="space-y-6">
            <div className="bg-bg-1 border border-border rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-4">Progress Overview</h3>

              {/* Level and XP */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-bg-0 rounded-xl p-4">
                  <div className="text-sm text-text-muted mb-1">Current Level</div>
                  <div className="text-3xl font-bold text-text-primary">{currentLevel}</div>
                </div>
                <div className="bg-bg-0 rounded-xl p-4">
                  <div className="text-sm text-text-muted mb-1">Total XP</div>
                  <div className="text-3xl font-bold text-text-primary">{currentXP.toLocaleString()}</div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="space-y-3">
                {Object.entries(stats).map(([statKey, value]) => {
                  const config = STAT_CONFIG[statKey];
                  return (
                    <div key={statKey} className="flex items-center justify-between bg-bg-0 rounded-lg px-4 py-3">
                      <span className="text-text-primary/80">{config.name}</span>
                      <span className="text-lg font-semibold" style={{ color: config.color }}>{value}</span>
                    </div>
                  );
                })}
              </div>

              {/* Summary Stats */}
              <div className="grid grid-cols-2 gap-3 mt-6">
                <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-4">
                  <div className="text-xs text-text-muted mb-1">Total Power</div>
                  <div className="text-2xl font-bold text-text-primary">{totalPower}</div>
                </div>
                <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl p-4">
                  <div className="text-xs text-text-muted mb-1">Balance</div>
                  <div className="text-2xl font-bold text-text-primary">{balanceScore}%</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stat Breakdown Modal */}
      {showStatBreakdown && (
        <StatBreakdown onClose={() => setShowStatBreakdown(false)} />
      )}
    </div>
  );
}
