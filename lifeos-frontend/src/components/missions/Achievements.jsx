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
  CheckCircle2
} from 'lucide-react';
import useAchievementsStore, {
  ACHIEVEMENT_CATEGORIES,
  ACHIEVEMENT_RARITY
} from '../../stores/achievementsStore';

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

export default function Achievements() {
  const {
    getAllAchievements,
    getAchievementSummary,
    getRecentUnlocks,
    getNextAchievements
  } = useAchievementsStore();

  const [selectedCategory, setSelectedCategory] = useState('all');

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
      <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">
              Achievement Collection
            </h2>
            <p className="text-white/60">
              {summary.unlocked}/{summary.total} achievements unlocked
            </p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="flex items-center gap-2 text-yellow-400">
                <Trophy className="w-6 h-6" />
                <span className="text-3xl font-bold">{summary.unlocked}</span>
              </div>
              <p className="text-xs text-white/60">Unlocked</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 text-green-400">
                <TrendingUp className="w-6 h-6" />
                <span className="text-3xl font-bold">+{summary.totalXPEarned.toLocaleString()}</span>
              </div>
              <p className="text-xs text-white/60">Total XP</p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 h-3 bg-[#0c0a10] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 transition-all duration-500"
            style={{ width: `${summary.percentComplete}%` }}
          />
        </div>

        {/* Rarity Breakdown */}
        <div className="flex items-center gap-4 mt-4">
          {Object.entries(summary.byRarity).map(([rarity, count]) => (
            <div key={rarity} className="flex items-center gap-1 text-xs">
              <span className={`
                w-2 h-2 rounded-full bg-gradient-to-r
                ${ACHIEVEMENT_RARITY[rarity]?.color || 'from-gray-400 to-gray-500'}
              `} />
              <span className="text-white/60 capitalize">{rarity}:</span>
              <span className="text-white font-medium">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Unlocks */}
      {recentUnlocks.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-400" />
            Recently Unlocked
          </h3>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {recentUnlocks.map((achievement) => (
              <div
                key={achievement.achievementId}
                className="flex-shrink-0 flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-xl"
              >
                <span className="text-2xl">{achievement.icon}</span>
                <div>
                  <h4 className="font-semibold text-white">{achievement.title}</h4>
                  <p className="text-xs text-white/60">
                    {new Date(achievement.unlockedAt).toLocaleDateString()}
                  </p>
                </div>
                <CheckCircle2 className="w-5 h-5 text-green-400" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Next Achievements */}
      {nextAchievements.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-400" />
            Almost There
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {nextAchievements.map((achievement) => (
              <div
                key={achievement.id}
                className="flex items-center gap-3 p-3 bg-[#1a1724] border border-purple-500/20 rounded-xl"
              >
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <span className="text-xl">{achievement.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-white truncate">{achievement.title}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-1.5 bg-[#0c0a10] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                        style={{ width: `${achievement.percentComplete}%` }}
                      />
                    </div>
                    <span className="text-xs text-purple-400">{Math.round(achievement.percentComplete)}%</span>
                  </div>
                </div>
              </div>
            ))}
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

          return (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm
                whitespace-nowrap transition-all duration-200
                ${isActive
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'bg-[#1a1724] text-white/60 hover:text-white hover:bg-[#221e2e] border border-white/10'
                }
              `}
            >
              <Icon className="w-4 h-4" />
              <span>{category.label}</span>
              <span className={`
                ml-1 px-2 py-0.5 rounded text-xs
                ${isActive ? 'bg-white/20' : 'bg-white/5'}
              `}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAchievements.map((achievement) => {
          const rarity = achievement.rarityData;

          return (
            <div
              key={achievement.id}
              className={`
                relative bg-[#1a1724] border rounded-xl p-5 transition-all duration-200
                ${achievement.unlocked
                  ? 'border-yellow-500/30 hover:scale-[1.02]'
                  : 'border-white/10 opacity-75'
                }
              `}
            >
              {/* Rarity Badge */}
              <div className="absolute top-4 right-4">
                <span className={`
                  text-xs px-2 py-1 rounded-full font-medium
                  bg-gradient-to-r ${rarity.color} text-white
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
                    : 'bg-[#0c0a10]'
                  }
                `}>
                  {achievement.unlocked ? (
                    <span className="text-3xl">{achievement.icon}</span>
                  ) : (
                    <Lock className="w-8 h-8 text-white/40" />
                  )}

                  {achievement.unlocked && achievement.rarity === 'legendary' && (
                    <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl blur opacity-50 animate-pulse" />
                  )}
                </div>

                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-white mb-1">
                    {achievement.title}
                  </h4>
                  <p className="text-sm text-white/60">
                    {achievement.description}
                  </p>
                </div>
              </div>

              {/* Progress */}
              {!achievement.unlocked && (
                <div className="mb-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/60">Progress</span>
                    <span className="text-purple-400 font-medium">
                      {achievement.progress}/{achievement.target}
                    </span>
                  </div>
                  <div className="h-2 bg-[#0c0a10] rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${achievement.category.color} transition-all duration-300`}
                      style={{ width: `${achievement.percentComplete}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Rewards */}
              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex items-center gap-1 text-green-400">
                    <Trophy className="w-4 h-4" />
                    <span>+{achievement.xpReward}</span>
                  </div>
                  <div className="flex items-center gap-1 text-yellow-400">
                    <Zap className="w-4 h-4" />
                    <span>+{achievement.creditsReward}</span>
                  </div>
                </div>

                {achievement.unlocked && achievement.unlockedAt && (
                  <span className="text-xs text-white/50">
                    {new Date(achievement.unlockedAt).toLocaleDateString()}
                  </span>
                )}
              </div>

              {/* Unlocked Indicator */}
              {achievement.unlocked && (
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-transparent to-yellow-500/5 rounded-xl pointer-events-none" />
              )}
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredAchievements.length === 0 && (
        <div className="text-center py-12">
          <Trophy className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Achievements Found</h3>
          <p className="text-white/60">
            Try selecting a different category or keep working to unlock more achievements!
          </p>
        </div>
      )}
    </div>
  );
}
