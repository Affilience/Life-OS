import React, { useState, useMemo } from 'react';
import {
  Trophy,
  Star,
  Lock,
  Flame,
  Zap,
  Target,
  Award,
  Crown,
  Sparkles,
  TrendingUp,
  Dumbbell,
  Book,
  Brain,
  Heart,
  Briefcase,
  Calendar,
  PiggyBank,
  FileText,
  CheckCircle2,
  BarChart2,
  Shield
} from 'lucide-react';
import useAchievementsStore, {
  ACHIEVEMENT_CATEGORIES,
  ACHIEVEMENT_RARITY
} from '../../stores/achievementsStore';
import { useGamificationModeStore, TERMINOLOGY, VISIBILITY } from '../../stores/gamificationModeStore';
import { ACHIEVEMENT_EQUIPMENT, ACHIEVEMENT_PETS } from '../../data/equipmentUnlocks';
import { EQUIPMENT_DATABASE, EQUIPMENT_RARITY } from '../../data/equipmentDatabase';
import { PET_DATABASE, TIER_INFO as PET_TIER_INFO } from '../../stores/petStore';

// Mode-specific styling for the page
const MODE_PAGE_STYLES = {
  cosmic: {
    headerGradient: 'from-yellow-500/10 to-orange-500/10',
    headerBorder: 'border-yellow-500/20',
    progressBarGradient: 'from-yellow-500 to-orange-500',
    iconColor: 'text-yellow-400',
    statsColor: 'text-green-400',
    recentGradient: 'from-yellow-500/10 to-orange-500/10',
    recentBorder: 'border-yellow-500/30',
  },
  professional: {
    headerGradient: 'from-blue-500/10 to-cyan-500/10',
    headerBorder: 'border-blue-500/20',
    progressBarGradient: 'from-blue-500 to-cyan-500',
    iconColor: 'text-blue-400',
    statsColor: 'text-blue-400',
    recentGradient: 'from-blue-500/10 to-cyan-500/10',
    recentBorder: 'border-blue-500/30',
  },
  minimal: {
    headerGradient: 'from-emerald-500/10 to-teal-500/10',
    headerBorder: 'border-emerald-500/20',
    progressBarGradient: 'from-emerald-500 to-teal-500',
    iconColor: 'text-emerald-400',
    statsColor: 'text-emerald-400',
    recentGradient: 'from-emerald-500/10 to-teal-500/10',
    recentBorder: 'border-emerald-500/20',
  },
};

const CATEGORY_ICONS = {
  quests: Target,
  productivity: Briefcase,
  health: Dumbbell,
  knowledge: Book,
  financial: PiggyBank,
  journal: FileText,
  streaks: Flame,
  special: Sparkles,
  milestones: Trophy,
};

// Map rarity to achievement tier colors from design tokens
const RARITY_TIER_STYLES = {
  common: {
    borderColor: 'border-gray-500/30',
    glowClass: '',
    badgeBg: 'bg-gray-500/20',
    badgeText: 'text-gray-300'
  },
  uncommon: {
    borderColor: 'border-[var(--achievement-bronze)]/40',
    glowClass: 'animate-achievement-bronze',
    badgeBg: 'bg-[var(--achievement-bronze)]/20',
    badgeText: 'text-[var(--achievement-bronze)]'
  },
  rare: {
    borderColor: 'border-[var(--achievement-silver)]/40',
    glowClass: 'animate-achievement-silver',
    badgeBg: 'bg-[var(--achievement-silver)]/20',
    badgeText: 'text-[var(--achievement-silver)]'
  },
  epic: {
    borderColor: 'border-[var(--achievement-gold)]/40',
    glowClass: 'animate-achievement-gold',
    badgeBg: 'bg-[var(--achievement-gold)]/20',
    badgeText: 'text-[var(--achievement-gold)]'
  },
  legendary: {
    borderColor: 'border-[var(--achievement-diamond)]/40',
    glowClass: 'animate-achievement-diamond',
    badgeBg: 'bg-[var(--achievement-diamond)]/20',
    badgeText: 'text-[var(--achievement-diamond)]'
  }
};

// Helper to get equipment rewards for an achievement
const getEquipmentRewards = (achievementId) => {
  const equipmentIds = ACHIEVEMENT_EQUIPMENT[achievementId] || [];
  return equipmentIds
    .map(id => EQUIPMENT_DATABASE[id])
    .filter(Boolean);
};

// Helper to get pet rewards for an achievement
const getPetRewards = (achievementId) => {
  const petIds = ACHIEVEMENT_PETS[achievementId] || [];
  return petIds
    .map(id => PET_DATABASE[id])
    .filter(Boolean);
};

// Helper to get sprite path from equipment item
const getSpritePath = (item) => {
  if (!item) return null;
  if (item.sprite?.path) return item.sprite.path;
  if (typeof item.sprite === 'string') return item.sprite;
  const slotFolder = item.slot === 'chest' ? 'chests' : `${item.slot}s`;
  return `/assets/equipment/${slotFolder}/${item.id}.png`;
};

export default function Achievements() {
  const {
    getAllAchievements,
    getAchievementSummary,
    getRecentUnlocks,
    getNextAchievements
  } = useAchievementsStore();

  // Get gamification mode
  const mode = useGamificationModeStore((state) => state.mode);
  const terms = TERMINOLOGY[mode] || TERMINOLOGY.cosmic;
  const visibility = VISIBILITY[mode] || VISIBILITY.cosmic;
  const pageStyle = MODE_PAGE_STYLES[mode] || MODE_PAGE_STYLES.cosmic;

  const [selectedCategory, setSelectedCategory] = useState('all');

  // Get mode-specific icons
  const getMainIcon = () => {
    if (mode === 'cosmic') return Trophy;
    if (mode === 'professional') return Award;
    return CheckCircle2;
  };

  const getStatsIcon = () => {
    if (mode === 'cosmic') return TrendingUp;
    if (mode === 'professional') return BarChart2;
    return BarChart2;
  };

  const MainIcon = getMainIcon();
  const StatsIcon = getStatsIcon();

  const allAchievements = getAllAchievements();
  const summary = getAchievementSummary();
  const recentUnlocks = getRecentUnlocks(3);
  const nextAchievements = getNextAchievements(3);

  const filteredAchievements = useMemo(() => {
    return allAchievements.filter(achievement =>
      selectedCategory === 'all' || achievement.category.id === selectedCategory
    );
  }, [allAchievements, selectedCategory]);

  const categories = [
    { id: 'all', label: 'All', icon: Trophy },
    ...Object.values(ACHIEVEMENT_CATEGORIES).map(cat => ({
      id: cat.id,
      label: cat.name,
      icon: CATEGORY_ICONS[cat.id] || Star,
    })),
  ];

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className={`bg-gradient-to-br ${pageStyle.headerGradient} border ${pageStyle.headerBorder} rounded-2xl p-4 sm:p-6`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-xl sm:text-2xl font-bold text-text-primary mb-1">
              {terms.achievement} Collection
            </h2>
            <p className="text-sm text-text-muted">
              {summary.unlocked}/{summary.total} {terms.achievement.toLowerCase()}s unlocked
            </p>
          </div>
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="text-center sm:text-right">
              <div className={`flex items-center gap-1 sm:gap-2 ${pageStyle.iconColor}`}>
                <MainIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                <span className="text-2xl sm:text-3xl font-bold">{summary.unlocked}</span>
              </div>
              <p className="text-xs text-text-muted">Unlocked</p>
            </div>
            <div className="text-center sm:text-right">
              <div className={`flex items-center gap-1 sm:gap-2 ${pageStyle.statsColor}`}>
                <StatsIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                <span className="text-2xl sm:text-3xl font-bold">+{summary.totalXPEarned.toLocaleString()}</span>
              </div>
              <p className="text-xs text-text-muted">Total {terms.xp}</p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 h-3 bg-bg-0 rounded-full overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${pageStyle.progressBarGradient} transition-all duration-500`}
            style={{ width: `${summary.percentComplete}%` }}
          />
        </div>

        {/* Rarity Breakdown */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-4">
          {Object.entries(summary.byRarity).map(([rarity, count]) => (
            <div key={rarity} className="flex items-center gap-1 text-xs">
              <span className={`
                w-2 h-2 rounded-full bg-gradient-to-r flex-shrink-0
                ${ACHIEVEMENT_RARITY[rarity]?.color || 'from-gray-400 to-gray-500'}
              `} />
              <span className="text-text-muted capitalize">{rarity}:</span>
              <span className="text-text-primary font-medium">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Unlocks - show based on visibility settings */}
      {visibility.showAchievementPopups && recentUnlocks.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
            {mode === 'cosmic' && <Sparkles className="w-5 h-5 text-yellow-400" />}
            {mode === 'professional' && <Award className="w-5 h-5 text-blue-400" />}
            {mode === 'minimal' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
            Recently Unlocked
          </h3>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {recentUnlocks.map((achievement) => (
              <div
                key={achievement.achievementId}
                className={`flex-shrink-0 flex items-center gap-3 px-4 py-3 bg-gradient-to-r ${pageStyle.recentGradient} border ${pageStyle.recentBorder} rounded-xl`}
              >
                <span className="text-2xl">{achievement.icon}</span>
                <div>
                  <h4 className="font-semibold text-text-primary">{achievement.title}</h4>
                  <p className="text-xs text-text-muted">
                    {new Date(achievement.unlockedAt).toLocaleDateString()}
                  </p>
                </div>
                <CheckCircle2 className={`w-5 h-5 ${mode === 'cosmic' ? 'text-green-400' : mode === 'professional' ? 'text-blue-400' : 'text-emerald-400'}`} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Next Achievements */}
      {nextAchievements.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
            <Target className={`w-5 h-5 ${mode === 'cosmic' ? 'text-primary-400' : mode === 'professional' ? 'text-blue-400' : 'text-emerald-400'}`} />
            Almost There
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {nextAchievements.map((achievement) => {
              const borderColor = mode === 'cosmic' ? 'border-purple-500/20' : mode === 'professional' ? 'border-blue-500/20' : 'border-emerald-500/20';
              const iconBg = mode === 'cosmic' ? 'bg-purple-500/10' : mode === 'professional' ? 'bg-blue-500/10' : 'bg-emerald-500/10';
              const progressGradient = mode === 'cosmic' ? 'from-purple-500 to-pink-500' : mode === 'professional' ? 'from-blue-500 to-cyan-500' : 'from-emerald-500 to-teal-500';
              const percentColor = mode === 'cosmic' ? 'text-primary-400' : mode === 'professional' ? 'text-blue-400' : 'text-emerald-400';

              return (
                <div
                  key={achievement.id}
                  className={`flex items-center gap-3 p-3 bg-bg-1 border ${borderColor} rounded-xl`}
                >
                  <div className={`p-2 rounded-lg ${iconBg}`}>
                    <span className="text-xl">{achievement.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-text-primary truncate">{achievement.title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-1.5 bg-bg-0 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${progressGradient}`}
                          style={{ width: `${achievement.percentComplete}%` }}
                        />
                      </div>
                      <span className={`text-xs ${percentColor}`}>{Math.round(achievement.percentComplete)}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((category) => {
          const Icon = category.icon;
          const isActive = selectedCategory === category.id;
          const count = category.id === 'all'
            ? allAchievements.length
            : allAchievements.filter(a => a.category.id === category.id).length;

          // Mode-specific active button styles
          const activeGradient = mode === 'cosmic'
            ? 'bg-gradient-to-r from-purple-500 to-pink-500'
            : mode === 'professional'
            ? 'bg-gradient-to-r from-blue-500 to-cyan-500'
            : 'bg-gradient-to-r from-emerald-500 to-teal-500';

          return (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`
                flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm
                whitespace-nowrap transition-all duration-200 flex-shrink-0 min-h-[44px]
                ${isActive
                  ? `${activeGradient} text-text-primary shadow-lg`
                  : 'bg-bg-1 text-text-muted hover:text-text-primary hover:bg-bg-2 border border-border'
                }
              `}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{category.label}</span>
              <span className={`
                ml-1 px-2 py-0.5 rounded text-xs flex-shrink-0
                ${isActive ? 'bg-white/20' : 'bg-white/5'}
              `}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" data-tour="achievements-section">
        {filteredAchievements.map((achievement) => {
          const rarity = achievement.rarityData;
          const tierStyle = RARITY_TIER_STYLES[achievement.rarity] || RARITY_TIER_STYLES.common;

          return (
            <div
              key={achievement.id}
              className={`
                relative bg-bg-1 border rounded-xl p-5 transition-all duration-200
                ${achievement.unlocked
                  ? `${tierStyle.borderColor} hover:scale-[1.02] ${tierStyle.glowClass}`
                  : 'border-border opacity-75'
                }
              `}
            >
              {/* Rarity Badge */}
              <div className="absolute top-4 right-4">
                <span className={`
                  text-xs px-2 py-1 rounded-full font-medium
                  ${achievement.unlocked ? `${tierStyle.badgeBg} ${tierStyle.badgeText}` : 'bg-white/10 text-text-muted'}
                `}>
                  {rarity.label}
                </span>
              </div>

              {/* Icon */}
              <div className="flex items-center gap-4 mb-4">
                <div className={`
                  relative p-4 rounded-xl
                  ${achievement.unlocked
                    ? `bg-gradient-to-br ${achievement.category.color}`
                    : 'bg-bg-0'
                  }
                `}>
                  {achievement.unlocked ? (
                    <span className="text-3xl">{achievement.icon}</span>
                  ) : (
                    <Lock className="w-8 h-8 text-text-muted" />
                  )}

                  {achievement.unlocked && achievement.rarity === 'legendary' && (
                    <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl blur opacity-50 animate-pulse" />
                  )}
                </div>

                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-text-primary mb-1">
                    {achievement.title}
                  </h4>
                  <p className="text-sm text-text-muted">
                    {achievement.description}
                  </p>
                </div>
              </div>

              {/* Progress */}
              {!achievement.unlocked && (
                <div className="mb-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-muted">Progress</span>
                    <span className={`font-medium ${mode === 'cosmic' ? 'text-primary-400' : mode === 'professional' ? 'text-blue-400' : 'text-emerald-400'}`}>
                      {achievement.progress}/{achievement.target}
                    </span>
                  </div>
                  <div className="h-2 bg-bg-0 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${mode === 'cosmic' ? achievement.category.color : mode === 'professional' ? 'from-blue-500 to-cyan-500' : 'from-emerald-500 to-teal-500'} transition-all duration-300`}
                      style={{ width: `${achievement.percentComplete}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Rewards */}
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="flex items-center gap-3 text-sm flex-wrap">
                  <div className={`flex items-center gap-1 ${mode === 'minimal' ? 'text-emerald-400' : 'text-green-400'}`}>
                    <Trophy className="w-4 h-4" />
                    <span>+{achievement.xpReward} {terms.xp}</span>
                  </div>
                  <div className={`flex items-center gap-1 ${mode === 'minimal' ? 'text-teal-400' : 'text-yellow-400'}`}>
                    <Zap className="w-4 h-4" />
                    <span>+{achievement.creditsReward}</span>
                  </div>

                  {/* Equipment Rewards */}
                  {(() => {
                    const equipmentRewards = getEquipmentRewards(achievement.id);
                    if (equipmentRewards.length === 0) return null;

                    return equipmentRewards.map(equipment => {
                      const rarityData = EQUIPMENT_RARITY[equipment.rarity] || EQUIPMENT_RARITY.common;
                      const spritePath = getSpritePath(equipment);

                      return (
                        <div
                          key={equipment.id}
                          className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg border"
                          style={{
                            backgroundColor: `${rarityData.color}15`,
                            borderColor: `${rarityData.color}40`,
                          }}
                          title={`${equipment.name} (${equipment.rarity})`}
                        >
                          {spritePath ? (
                            <img
                              src={spritePath}
                              alt={equipment.name}
                              className="w-5 h-5 object-contain"
                              style={{ imageRendering: 'pixelated' }}
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling?.style?.removeProperty('display');
                              }}
                            />
                          ) : null}
                          <Shield
                            className="w-4 h-4"
                            style={{
                              color: rarityData.color,
                              display: spritePath ? 'none' : 'block',
                            }}
                          />
                          <span
                            className="text-xs font-medium truncate max-w-[80px]"
                            style={{ color: rarityData.color }}
                          >
                            {equipment.name}
                          </span>
                        </div>
                      );
                    });
                  })()}

                  {/* Pet Rewards */}
                  {(() => {
                    const petRewards = getPetRewards(achievement.id);
                    if (petRewards.length === 0) return null;

                    return petRewards.map(pet => {
                      const tierInfo = PET_TIER_INFO[pet.tier] || PET_TIER_INFO.common;

                      return (
                        <div
                          key={pet.id}
                          className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg border"
                          style={{
                            backgroundColor: `${tierInfo.color}15`,
                            borderColor: `${tierInfo.color}40`,
                          }}
                          title={`${pet.name} - ${pet.culture} (${pet.tier})`}
                        >
                          {pet.sprite ? (
                            <img
                              src={pet.sprite}
                              alt={pet.name}
                              className="w-5 h-5 object-contain"
                              style={{ imageRendering: 'pixelated' }}
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling?.style?.removeProperty('display');
                              }}
                            />
                          ) : null}
                          <Heart
                            className="w-4 h-4"
                            style={{
                              color: tierInfo.color,
                              display: pet.sprite ? 'none' : 'block',
                            }}
                          />
                          <span
                            className="text-xs font-medium truncate max-w-[80px]"
                            style={{ color: tierInfo.color }}
                          >
                            {pet.name}
                          </span>
                        </div>
                      );
                    });
                  })()}
                </div>

                {achievement.unlocked && achievement.unlockedAt && (
                  <span className="text-xs text-text-muted">
                    {new Date(achievement.unlockedAt).toLocaleDateString()}
                  </span>
                )}
              </div>

              {/* Unlocked Indicator - only show glow effects based on mode */}
              {achievement.unlocked && visibility.showRarityGlow && (
                <div className={`absolute top-0 left-0 w-full h-full bg-gradient-to-br from-transparent ${mode === 'cosmic' ? 'to-yellow-500/5' : mode === 'professional' ? 'to-blue-500/5' : 'to-emerald-500/5'} rounded-xl pointer-events-none`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredAchievements.length === 0 && (
        <div className="text-center py-12">
          <Trophy className="w-16 h-16 text-text-muted mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-text-primary mb-2">No Achievements Found</h3>
          <p className="text-text-muted">
            Try selecting a different category or keep working to unlock more achievements!
          </p>
        </div>
      )}
    </div>
  );
}
