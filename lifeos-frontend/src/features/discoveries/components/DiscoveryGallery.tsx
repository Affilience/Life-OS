import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Filter, Award, TrendingUp } from 'lucide-react';
import { DiscoveryCard } from './DiscoveryCard';

// Mock discovery data from the master plan
const mockDiscoveries = [
  {
    id: '1',
    title: 'First Steps',
    scientificName: 'Initium Cosmicus',
    description: 'Complete your first mission',
    cosmicLore: 'Every cosmic journey begins with a single step into the void',
    category: 'milestone' as const,
    rarity: 'common' as const,
    creditsReward: 10,
    pointsValue: 50,
    icon: '👣',
    isUnlocked: true,
    isSecret: false,
    unlockedAt: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: '2',
    title: 'Week Warrior',
    scientificName: 'Persistentis Septimus',
    description: 'Maintain a 7-day streak',
    cosmicLore: 'The first celestial cycle conquered, many more await',
    category: 'streak' as const,
    rarity: 'rare' as const,
    creditsReward: 50,
    pointsValue: 100,
    icon: '🔥',
    isUnlocked: true,
    isSecret: false,
    unlockedAt: new Date(Date.now() - 86400000 * 5).toISOString()
  },
  {
    id: '3',
    title: 'Stellar Ascension',
    scientificName: 'Ascendere Stellaris',
    description: 'Reach Level 10 in any module',
    cosmicLore: 'Your form begins to radiate with cosmic energy',
    category: 'mastery' as const,
    rarity: 'epic' as const,
    creditsReward: 100,
    pointsValue: 200,
    icon: '⭐',
    isUnlocked: true,
    isSecret: false,
    unlockedAt: new Date().toISOString()
  },
  {
    id: '4',
    title: 'Century of Dedication',
    scientificName: 'Dedicatum Centuria',
    description: 'Maintain a 100-day streak',
    cosmicLore: 'Legends speak of those who bend time itself through sheer will',
    category: 'streak' as const,
    rarity: 'legendary' as const,
    creditsReward: 500,
    pointsValue: 1000,
    icon: '💯',
    isUnlocked: false,
    isSecret: false,
    progressPercentage: 32
  },
  {
    id: '5',
    title: 'Cosmic Perfectionist',
    scientificName: 'Perfectus Cosmicus',
    description: 'Complete all daily missions for 30 consecutive days',
    cosmicLore: 'Perfection sustained across the lunar cycle... extraordinary',
    category: 'special' as const,
    rarity: 'cosmic' as const,
    creditsReward: 1000,
    pointsValue: 5000,
    icon: '💫',
    isUnlocked: false,
    isSecret: false,
    progressPercentage: 15
  },
  {
    id: '6',
    title: 'Knowledge Seeker',
    scientificName: 'Sapiens Quaerens',
    description: 'Complete 50 learning sessions',
    cosmicLore: 'The universe reveals itself to those who seek',
    category: 'collection' as const,
    rarity: 'rare' as const,
    creditsReward: 75,
    pointsValue: 150,
    icon: '📚',
    isUnlocked: false,
    isSecret: false,
    progressPercentage: 68
  },
  {
    id: '7',
    title: '???',
    scientificName: 'Secretum Mysterium',
    description: 'A hidden achievement awaits',
    cosmicLore: 'Some discoveries reveal themselves only to the truly dedicated',
    category: 'special' as const,
    rarity: 'legendary' as const,
    creditsReward: 750,
    pointsValue: 2500,
    icon: '🌟',
    isUnlocked: false,
    isSecret: true,
    progressPercentage: 0
  },
  {
    id: '8',
    title: 'Constellation Master',
    scientificName: 'Magister Constellatus',
    description: 'Unlock all stars in one constellation',
    cosmicLore: 'You have charted an entire region of the cosmic expanse',
    category: 'mastery' as const,
    rarity: 'epic' as const,
    creditsReward: 200,
    pointsValue: 300,
    icon: '🌌',
    isUnlocked: false,
    isSecret: false,
    progressPercentage: 45
  }
];

type FilterType = 'all' | 'unlocked' | 'locked';
type RarityFilter = 'all' | 'common' | 'rare' | 'epic' | 'legendary' | 'cosmic';

export function DiscoveryGallery() {
  const [discoveries] = useState(mockDiscoveries);
  const [statusFilter, setStatusFilter] = useState<FilterType>('all');
  const [rarityFilter, setRarityFilter] = useState<RarityFilter>('all');

  // Calculate stats
  const totalDiscoveries = discoveries.length;
  const unlockedCount = discoveries.filter(d => d.isUnlocked).length;
  const totalPoints = discoveries.filter(d => d.isUnlocked).reduce((sum, d) => sum + d.pointsValue, 0);
  const completionPercentage = Math.round((unlockedCount / totalDiscoveries) * 100);

  // Filter discoveries
  const filteredDiscoveries = discoveries.filter(d => {
    const matchesStatus =
      statusFilter === 'all' ? true :
      statusFilter === 'unlocked' ? d.isUnlocked :
      !d.isUnlocked;

    const matchesRarity = rarityFilter === 'all' ? true : d.rarity === rarityFilter;

    return matchesStatus && matchesRarity;
  });

  return (
    <div className="cosmic-panel cosmic-border cosmic-lift p-6 rounded-2xl">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold cosmic-title mb-2">
          🔭 Cosmic Discoveries
        </h2>
        <p className="text-white/60">
          Unlock achievements across your cosmic journey. Each discovery grants points and rewards.
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="cosmic-card cosmic-border cosmic-glow rounded-xl p-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20">
              <Trophy className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-xs text-white/60">Unlocked</p>
              <p className="text-2xl font-bold text-white">{unlockedCount}/{totalDiscoveries}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          className="cosmic-card cosmic-border cosmic-glow rounded-xl p-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500/20 to-yellow-500/20">
              <Star className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-xs text-white/60">Total Points</p>
              <p className="text-2xl font-bold text-white">{totalPoints.toLocaleString()}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          className="cosmic-card cosmic-border cosmic-glow rounded-xl p-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20">
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-xs text-white/60">Completion</p>
              <p className="text-2xl font-bold text-white">{completionPercentage}%</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          className="cosmic-card cosmic-border cosmic-glow rounded-xl p-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20">
              <Award className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-white/60">Rarest</p>
              <p className="text-sm font-bold text-purple-400">
                {discoveries.filter(d => d.isUnlocked && d.rarity === 'cosmic').length > 0 ? 'Cosmic' :
                 discoveries.filter(d => d.isUnlocked && d.rarity === 'legendary').length > 0 ? 'Legendary' :
                 discoveries.filter(d => d.isUnlocked && d.rarity === 'epic').length > 0 ? 'Epic' :
                 discoveries.filter(d => d.isUnlocked && d.rarity === 'rare').length > 0 ? 'Rare' : 'Common'}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        {/* Status Filter */}
        <div className="flex gap-2">
          {(['all', 'unlocked', 'locked'] as FilterType[]).map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`
                px-4 py-2 rounded-xl text-sm font-semibold transition-all
                ${statusFilter === filter
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white cosmic-glow'
                  : 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/10'
                }
              `}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>

        {/* Rarity Filter */}
        <div className="flex gap-2">
          {(['all', 'common', 'rare', 'epic', 'legendary', 'cosmic'] as RarityFilter[]).map((rarity) => (
            <button
              key={rarity}
              onClick={() => setRarityFilter(rarity)}
              className={`
                px-3 py-2 rounded-xl text-xs font-semibold transition-all capitalize
                ${rarityFilter === rarity
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                  : 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/10'
                }
              `}
            >
              {rarity}
            </button>
          ))}
        </div>
      </div>

      {/* Discoveries Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredDiscoveries.map((discovery, index) => (
            <motion.div
              key={discovery.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.05 }}
            >
              <DiscoveryCard {...discovery} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredDiscoveries.length === 0 && (
        <div className="text-center py-16">
          <Filter className="w-16 h-16 text-white/40 mx-auto mb-4" />
          <p className="text-white/60">No discoveries match your filters</p>
        </div>
      )}
    </div>
  );
}
