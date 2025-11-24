import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Gift, TrendingUp, Filter, Coins } from 'lucide-react';
import { RewardCard } from '../../features/rewards/components/RewardCard';
import { useRewards, useCreateReward, useRedeemReward } from '../../api/rewards';
import { useCosmicCurrency } from '../../api/currency';

export default function RewardMarketplace() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);

  const { data: rewards, isLoading: rewardsLoading } = useRewards();
  const { data: currency } = useCosmicCurrency();
  const createReward = useCreateReward();
  const redeemReward = useRedeemReward();

  const userCredits = currency?.cosmic_credits || 0;

  const categories = [
    { key: 'all', label: 'All Rewards', icon: <Gift className="w-4 h-4" /> },
    { key: 'entertainment', label: 'Entertainment', icon: '🎮' },
    { key: 'food', label: 'Food & Treats', icon: '🍕' },
    { key: 'activity', label: 'Activities', icon: '🎯' },
    { key: 'rest', label: 'Rest & Relax', icon: '🛋️' },
    { key: 'custom', label: 'Custom', icon: '✨' }
  ];

  const filteredRewards = activeCategory === 'all'
    ? rewards
    : rewards?.filter(r => r.category === activeCategory);

  const handlePurchase = async (rewardId) => {
    try {
      await redeemReward.mutateAsync(rewardId);
    } catch (error) {
      console.error('Failed to redeem reward:', error);
    }
  };

  if (rewardsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="cosmic-panel cosmic-border cosmic-lift p-6 rounded-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold cosmic-title mb-2">
            🛒 Reward Marketplace
          </h2>
          <p className="text-white/60">
            Spend your hard-earned Cosmic Credits on rewards you define
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold cosmic-glow"
        >
          <Plus className="w-5 h-5" />
          Add Reward
        </motion.button>
      </div>

      {/* User Credits Display */}
      <div className="mb-6 cosmic-card cosmic-border cosmic-glow rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500/20 to-yellow-500/20">
              <Coins className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-white/60">Your Cosmic Credits</p>
              <p className="text-2xl font-bold text-amber-300">{userCredits.toLocaleString()}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-white/50">Lifetime earned</p>
            <div className="flex items-center gap-1 text-green-400 text-sm">
              <TrendingUp className="w-4 h-4" />
              <span>{currency?.lifetime_credits_earned?.toLocaleString() || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <motion.button
            key={cat.key}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveCategory(cat.key)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm whitespace-nowrap
              transition-all duration-200
              ${activeCategory === cat.key
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white cosmic-glow'
                : 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/10'
              }
            `}
          >
            {typeof cat.icon === 'string' ? (
              <span>{cat.icon}</span>
            ) : (
              cat.icon
            )}
            {cat.label}
          </motion.button>
        ))}
      </div>

      {/* Rewards Grid */}
      {!filteredRewards || filteredRewards.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="text-6xl mb-4">🎁</div>
          <h3 className="text-xl font-bold text-gray-300 mb-2">
            No rewards in this category yet
          </h3>
          <p className="text-white/50 mb-4">
            Create your first reward to get started!
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold"
          >
            Add Your First Reward
          </motion.button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredRewards.map((reward, index) => (
              <motion.div
                key={reward.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
              >
                <RewardCard
                  {...reward}
                  onPurchase={handlePurchase}
                  userCredits={userCredits}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Stats Footer */}
      <div className="mt-8 pt-6 border-t border-white/10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">{rewards?.length || 0}</div>
            <div className="text-xs text-white/50">Total Rewards</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">
              {rewards?.filter(r => userCredits >= r.cost).length || 0}
            </div>
            <div className="text-xs text-white/50">Available Now</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-400">
              {currency?.total_credits_spent || 0}
            </div>
            <div className="text-xs text-white/50">Total Spent</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">
              {rewards && rewards.length > 0 ? Math.min(...rewards.map(r => r.cost)) : 0}
            </div>
            <div className="text-xs text-white/50">Cheapest Reward</div>
          </div>
        </div>
      </div>

      {/* Add Reward Modal - Placeholder */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="cosmic-panel cosmic-border rounded-2xl p-6 max-w-md w-full mx-4"
          >
            <h3 className="text-2xl font-bold cosmic-title mb-4">Add Custom Reward</h3>
            <p className="text-white/60 mb-4">
              Custom reward creation coming soon! Define your own rewards and set their credit cost.
            </p>
            <button
              onClick={() => setShowAddModal(false)}
              className="w-full px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold"
            >
              Close
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
