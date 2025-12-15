import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Filter, Award, TrendingUp, Telescope } from 'lucide-react';
import { DiscoveryCard } from '../../features/discoveries/components/DiscoveryCard';
import { useDiscoveries, useUserDiscoveries } from '../../api/discoveries';
import PageHeader from '../shared/PageHeader';

export default function DiscoveryGallery() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [rarityFilter, setRarityFilter] = useState('all');

  const { data: allDiscoveries, isLoading: discoveriesLoading } = useDiscoveries();
  const { data: userDiscoveries, isLoading: userDiscoveriesLoading } = useUserDiscoveries();

  // Create a map of unlocked discovery IDs
  const unlockedIds = new Set(userDiscoveries?.map(ud => ud.discovery_id) || []);

  // Merge discoveries with unlock status and progress
  const discoveries = allDiscoveries?.map(discovery => {
    const userDiscovery = userDiscoveries?.find(ud => ud.discovery_id === discovery.id);
    return {
      ...discovery,
      isUnlocked: unlockedIds.has(discovery.id),
      unlockedAt: userDiscovery?.unlocked_at,
      progressPercentage: userDiscovery?.progress_percentage || 0,
    };
  }) || [];

  // Calculate stats
  const totalDiscoveries = discoveries.length;
  const unlockedCount = discoveries.filter(d => d.isUnlocked).length;
  const totalPoints = discoveries.filter(d => d.isUnlocked).reduce((sum, d) => sum + d.points_value, 0);
  const completionPercentage = totalDiscoveries > 0 ? Math.round((unlockedCount / totalDiscoveries) * 100) : 0;

  // Filter discoveries
  const filteredDiscoveries = discoveries.filter(d => {
    const matchesStatus =
      statusFilter === 'all' ? true :
      statusFilter === 'unlocked' ? d.isUnlocked :
      !d.isUnlocked;

    const matchesRarity = rarityFilter === 'all' ? true : d.rarity === rarityFilter;

    return matchesStatus && matchesRarity;
  });

  if (discoveriesLoading || userDiscoveriesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="cosmic-panel cosmic-border cosmic-lift p-6 rounded-2xl">
      {/* Header */}
      <PageHeader
        title="Discoveries"
        subtitle="Unlock achievements across your cosmic journey"
        stats={`${unlockedCount}/${totalDiscoveries} unlocked · ${totalPoints.toLocaleString()} points`}
        icon={Telescope}
        module="progress"
        variant="elevated"
        className="mb-6"
      />

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
          {['all', 'unlocked', 'locked'].map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`
                px-4 py-2 rounded-xl text-sm font-semibold transition-all capitalize
                ${statusFilter === filter
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white cosmic-glow'
                  : 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/10'
                }
              `}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Rarity Filter */}
        <div className="flex gap-2">
          {['all', 'common', 'rare', 'epic', 'legendary', 'cosmic'].map((rarity) => (
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
