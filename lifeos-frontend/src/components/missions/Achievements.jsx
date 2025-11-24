import React, { useState } from 'react';
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
  Calendar
} from 'lucide-react';

const ACHIEVEMENT_CATEGORIES = [
  { id: 'all', label: 'All', icon: Trophy },
  { id: 'health', label: 'Health', icon: Dumbbell },
  { id: 'knowledge', label: 'Knowledge', icon: Book },
  { id: 'productivity', label: 'Productivity', icon: Briefcase },
  { id: 'mind', label: 'Mind', icon: Brain },
  { id: 'special', label: 'Special', icon: Sparkles },
];

const ACHIEVEMENTS = [
  {
    id: 'first_workout',
    title: 'First Steps',
    description: 'Complete your first workout',
    category: 'health',
    icon: Dumbbell,
    rarity: 'common',
    unlocked: true,
    unlockedAt: '2025-11-15',
    xpReward: 100,
    creditsReward: 50,
    color: 'from-green-500 to-emerald-500',
    progress: 1,
    total: 1
  },
  {
    id: 'workout_10',
    title: 'Fitness Enthusiast',
    description: 'Complete 10 workouts',
    category: 'health',
    icon: Dumbbell,
    rarity: 'common',
    unlocked: true,
    unlockedAt: '2025-11-18',
    xpReward: 250,
    creditsReward: 100,
    color: 'from-green-500 to-emerald-500',
    progress: 10,
    total: 10
  },
  {
    id: 'workout_50',
    title: 'Iron Will',
    description: 'Complete 50 workouts',
    category: 'health',
    icon: Trophy,
    rarity: 'rare',
    unlocked: false,
    xpReward: 1000,
    creditsReward: 500,
    color: 'from-blue-500 to-cyan-500',
    progress: 32,
    total: 50
  },
  {
    id: 'workout_100',
    title: 'Peak Performance',
    description: 'Complete 100 workouts',
    category: 'health',
    icon: Crown,
    rarity: 'epic',
    unlocked: false,
    xpReward: 2500,
    creditsReward: 1000,
    color: 'from-purple-500 to-pink-500',
    progress: 32,
    total: 100
  },
  {
    id: 'streak_7',
    title: 'Consistent',
    description: 'Maintain a 7-day streak',
    category: 'special',
    icon: Flame,
    rarity: 'common',
    unlocked: true,
    unlockedAt: '2025-11-20',
    xpReward: 200,
    creditsReward: 100,
    color: 'from-orange-500 to-red-500',
    progress: 7,
    total: 7
  },
  {
    id: 'streak_30',
    title: 'Unstoppable',
    description: 'Maintain a 30-day streak',
    category: 'special',
    icon: Flame,
    rarity: 'rare',
    unlocked: false,
    xpReward: 1500,
    creditsReward: 750,
    color: 'from-orange-500 to-red-500',
    progress: 14,
    total: 30
  },
  {
    id: 'read_10',
    title: 'Bookworm',
    description: 'Complete 10 reading sessions',
    category: 'knowledge',
    icon: Book,
    rarity: 'common',
    unlocked: true,
    unlockedAt: '2025-11-17',
    xpReward: 250,
    creditsReward: 100,
    color: 'from-cyan-500 to-blue-500',
    progress: 10,
    total: 10
  },
  {
    id: 'read_50',
    title: 'Scholar',
    description: 'Complete 50 reading sessions',
    category: 'knowledge',
    icon: Brain,
    rarity: 'rare',
    unlocked: false,
    xpReward: 1000,
    creditsReward: 500,
    color: 'from-blue-500 to-purple-500',
    progress: 23,
    total: 50
  },
  {
    id: 'deepwork_10',
    title: 'Focus Master',
    description: 'Complete 10 deep work sessions',
    category: 'productivity',
    icon: Zap,
    rarity: 'rare',
    unlocked: false,
    xpReward: 800,
    creditsReward: 400,
    color: 'from-yellow-500 to-orange-500',
    progress: 7,
    total: 10
  },
  {
    id: 'level_10',
    title: 'Rising Star',
    description: 'Reach level 10',
    category: 'special',
    icon: Star,
    rarity: 'common',
    unlocked: true,
    unlockedAt: '2025-11-19',
    xpReward: 500,
    creditsReward: 250,
    color: 'from-yellow-400 to-orange-400',
    progress: 10,
    total: 10
  },
  {
    id: 'level_25',
    title: 'Champion',
    description: 'Reach level 25',
    category: 'special',
    icon: Trophy,
    rarity: 'rare',
    unlocked: false,
    xpReward: 1500,
    creditsReward: 750,
    color: 'from-blue-500 to-cyan-500',
    progress: 12,
    total: 25
  },
  {
    id: 'level_50',
    title: 'Legend',
    description: 'Reach level 50',
    category: 'special',
    icon: Crown,
    rarity: 'legendary',
    unlocked: false,
    xpReward: 5000,
    creditsReward: 2500,
    color: 'from-orange-500 to-red-500',
    progress: 12,
    total: 50
  },
  {
    id: 'perfect_week',
    title: 'Perfect Week',
    description: 'Complete all daily quests for 7 days',
    category: 'special',
    icon: Calendar,
    rarity: 'epic',
    unlocked: false,
    xpReward: 2000,
    creditsReward: 1000,
    color: 'from-purple-500 to-pink-500',
    progress: 4,
    total: 7
  },
  {
    id: 'meditation_21',
    title: 'Inner Peace',
    description: 'Meditate for 21 consecutive days',
    category: 'mind',
    icon: Heart,
    rarity: 'rare',
    unlocked: false,
    xpReward: 1200,
    creditsReward: 600,
    color: 'from-pink-500 to-rose-500',
    progress: 8,
    total: 21
  },
];

const RARITY_CONFIG = {
  common: { color: 'from-gray-500 to-gray-400', label: 'Common', glow: 'shadow-gray-500/20' },
  rare: { color: 'from-blue-500 to-cyan-500', label: 'Rare', glow: 'shadow-blue-500/30' },
  epic: { color: 'from-purple-500 to-pink-500', label: 'Epic', glow: 'shadow-purple-500/40' },
  legendary: { color: 'from-orange-500 to-red-500', label: 'Legendary', glow: 'shadow-orange-500/50' },
};

export default function Achievements() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredAchievements = ACHIEVEMENTS.filter(achievement =>
    selectedCategory === 'all' || achievement.category === selectedCategory
  );

  const unlockedCount = ACHIEVEMENTS.filter(a => a.unlocked).length;
  const totalXP = ACHIEVEMENTS.filter(a => a.unlocked).reduce((sum, a) => sum + a.xpReward, 0);

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
              {unlockedCount}/{ACHIEVEMENTS.length} achievements unlocked
            </p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="flex items-center gap-2 text-yellow-400">
                <Trophy className="w-6 h-6" />
                <span className="text-3xl font-bold">{unlockedCount}</span>
              </div>
              <p className="text-xs text-white/60">Unlocked</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 text-green-400">
                <TrendingUp className="w-6 h-6" />
                <span className="text-3xl font-bold">+{totalXP}</span>
              </div>
              <p className="text-xs text-white/60">Total XP</p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 h-3 bg-[#0c0a10] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 transition-all duration-500"
            style={{ width: `${(unlockedCount / ACHIEVEMENTS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {ACHIEVEMENT_CATEGORIES.map((category) => {
          const Icon = category.icon;
          const isActive = selectedCategory === category.id;
          const count = category.id === 'all'
            ? ACHIEVEMENTS.length
            : ACHIEVEMENTS.filter(a => a.category === category.id).length;

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
          const Icon = achievement.icon;
          const rarity = RARITY_CONFIG[achievement.rarity];
          const progress = achievement.total > 0 ? (achievement.progress / achievement.total) * 100 : 0;

          return (
            <div
              key={achievement.id}
              className={`
                relative bg-[#1a1724] border rounded-xl p-5 transition-all duration-200
                ${achievement.unlocked
                  ? `border-${rarity.glow.split('-')[1]} ${rarity.glow} hover:scale-[1.02]`
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
                    ? `bg-gradient-to-br ${achievement.color}`
                    : 'bg-[#1a1724]'
                  }
                `}>
                  {achievement.unlocked ? (
                    <Icon className="w-8 h-8 text-white" />
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
              {!achievement.unlocked && achievement.total > 0 && (
                <div className="mb-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/60">Progress</span>
                    <span className="text-purple-400 font-medium">
                      {achievement.progress}/{achievement.total}
                    </span>
                  </div>
                  <div className="h-2 bg-[#0c0a10] rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${achievement.color} transition-all duration-300`}
                      style={{ width: `${progress}%` }}
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

                {achievement.unlocked && (
                  <span className="text-xs text-white/50">
                    {new Date(achievement.unlockedAt).toLocaleDateString()}
                  </span>
                )}
              </div>

              {/* Unlocked Indicator */}
              {achievement.unlocked && (
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-transparent to-green-500/5 rounded-xl pointer-events-none" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
