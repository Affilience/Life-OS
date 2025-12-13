import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Gift, TrendingUp, Filter, Coins, X } from 'lucide-react';
import { RewardCard } from '../../features/rewards/components/RewardCard';
import { useRewards, useCreateReward, useRedeemReward } from '../../api/rewards';
import { useCosmicCurrency } from '../../api/currency';
import { EmptyState } from '../ui';

const CATEGORY_OPTIONS = [
  { value: 'entertainment', label: 'Entertainment', icon: '🎮' },
  { value: 'food', label: 'Food & Treats', icon: '🍕' },
  { value: 'activity', label: 'Activities', icon: '🎯' },
  { value: 'rest', label: 'Rest & Relax', icon: '🛋️' },
  { value: 'custom', label: 'Custom', icon: '✨' },
];

export default function RewardMarketplace() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newReward, setNewReward] = useState({
    title: '',
    description: '',
    cost: 100,
    category: 'custom',
  });

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

  const handleCreateReward = async (e) => {
    e.preventDefault();
    if (!newReward.title.trim() || newReward.cost < 1) return;

    try {
      await createReward.mutateAsync({
        title: newReward.title.trim(),
        description: newReward.description.trim(),
        cost: newReward.cost,
        category: newReward.category,
        is_available: true,
      });
      setShowAddModal(false);
      setNewReward({ title: '', description: '', cost: 100, category: 'custom' });
    } catch (error) {
      console.error('Failed to create reward:', error);
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
        <div className="bg-[#1a1724] border border-white/10 rounded-xl">
          <EmptyState
            type="rewards"
            title="No rewards in this category yet"
            description="Create custom rewards for yourself - treats, activities, or anything that motivates you. Earn them with Cosmic Credits!"
            actionLabel="Add Your First Reward"
            onAction={() => setShowAddModal(true)}
            variant="pink"
            size="lg"
          />
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

      {/* Add Reward Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="cosmic-panel cosmic-border rounded-2xl p-6 max-w-md w-full mx-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold cosmic-title">Add Custom Reward</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5 text-white/60" />
              </button>
            </div>

            <form onSubmit={handleCreateReward} className="space-y-4">
              <div>
                <label className="block text-sm text-white/60 mb-1">Reward Name</label>
                <input
                  type="text"
                  value={newReward.title}
                  onChange={(e) => setNewReward({ ...newReward, title: e.target.value })}
                  placeholder="e.g., Watch a movie, Order takeout"
                  className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-purple-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-1">Description (optional)</label>
                <textarea
                  value={newReward.description}
                  onChange={(e) => setNewReward({ ...newReward, description: e.target.value })}
                  placeholder="What makes this reward special?"
                  rows={2}
                  className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-purple-500 focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-1">Category</label>
                <select
                  value={newReward.category}
                  onChange={(e) => setNewReward({ ...newReward, category: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:border-purple-500 focus:outline-none"
                >
                  {CATEGORY_OPTIONS.map((cat) => (
                    <option key={cat.value} value={cat.value} className="bg-[#1a1724]">
                      {cat.icon} {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-1">Cost (Cosmic Credits)</label>
                <input
                  type="number"
                  value={newReward.cost}
                  onChange={(e) => setNewReward({ ...newReward, cost: Math.max(1, parseInt(e.target.value) || 0) })}
                  min="1"
                  className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:border-purple-500 focus:outline-none"
                  required
                />
                <p className="text-xs text-white/40 mt-1">Higher cost = bigger reward. Make it worth earning!</p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createReward.isPending || !newReward.title.trim()}
                  className="flex-1 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createReward.isPending ? 'Creating...' : 'Create Reward'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
