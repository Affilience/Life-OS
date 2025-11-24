import React from 'react';
import { motion } from 'framer-motion';
import { Coins, Gift, Lock, ShoppingCart, Check } from 'lucide-react';

interface RewardCardProps {
  id: string;
  title: string;
  description?: string;
  cost: number;
  icon?: string;
  category?: string;
  isAvailable: boolean;
  cooldownDays?: number;
  lastPurchased?: string;
  onPurchase?: (id: string) => void;
  userCredits: number;
}

export function RewardCard({
  id,
  title,
  description,
  cost,
  icon,
  category = 'custom',
  isAvailable,
  cooldownDays = 0,
  lastPurchased,
  onPurchase,
  userCredits
}: RewardCardProps) {
  const canAfford = userCredits >= cost;
  const isOnCooldown = lastPurchased && cooldownDays > 0 &&
    (new Date().getTime() - new Date(lastPurchased).getTime()) / (1000 * 60 * 60 * 24) < cooldownDays;

  const canPurchase = isAvailable && canAfford && !isOnCooldown;

  // Category colors
  const categoryColors: Record<string, string> = {
    entertainment: 'from-purple-500/20 to-pink-500/20 border-purple-500/30',
    food: 'from-orange-500/20 to-red-500/20 border-orange-500/30',
    activity: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30',
    rest: 'from-indigo-500/20 to-purple-500/20 border-indigo-500/30',
    custom: 'from-amber-500/20 to-yellow-500/20 border-amber-500/30'
  };

  const categoryIcons: Record<string, string> = {
    entertainment: '🎮',
    food: '🍕',
    activity: '🎯',
    rest: '🛋️',
    custom: '✨'
  };

  const gradient = categoryColors[category] || categoryColors.custom;
  const categoryIcon = categoryIcons[category] || icon || '🎁';

  const handlePurchase = () => {
    if (canPurchase && onPurchase) {
      onPurchase(id);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: canPurchase ? 1.02 : 1 }}
      className={`
        relative cosmic-card cosmic-border rounded-2xl p-6
        bg-gradient-to-br ${gradient}
        ${!canPurchase ? 'opacity-60' : ''}
        transition-all duration-200
      `}
    >
      {/* Icon */}
      <div className="flex items-start justify-between mb-4">
        <div className="text-4xl">{categoryIcon}</div>

        {/* Status Badge */}
        {isOnCooldown && (
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-orange-500/20 border border-orange-500/50">
            <Lock className="w-3 h-3 text-orange-400" />
            <span className="text-xs font-semibold text-orange-400">Cooldown</span>
          </div>
        )}
        {!canAfford && !isOnCooldown && (
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-red-500/20 border border-red-500/50">
            <Lock className="w-3 h-3 text-red-400" />
            <span className="text-xs font-semibold text-red-400">Locked</span>
          </div>
        )}
        {canPurchase && (
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/20 border border-green-500/50">
            <Check className="w-3 h-3 text-green-400" />
            <span className="text-xs font-semibold text-green-400">Available</span>
          </div>
        )}
      </div>

      {/* Title & Description */}
      <div className="mb-4">
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        {description && (
          <p className="text-sm text-gray-300">{description}</p>
        )}
      </div>

      {/* Cost & Purchase Button */}
      <div className="flex items-center justify-between pt-4 border-t border-white/10">
        <div className="flex items-center gap-2">
          <Coins className="w-5 h-5 text-amber-400" />
          <span className="text-lg font-bold text-amber-300">{cost}</span>
          <span className="text-sm text-white/60">Credits</span>
        </div>

        <motion.button
          whileHover={canPurchase ? { scale: 1.05 } : {}}
          whileTap={canPurchase ? { scale: 0.95 } : {}}
          onClick={handlePurchase}
          disabled={!canPurchase}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm
            transition-all duration-200
            ${canPurchase
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white cosmic-glow cursor-pointer'
              : 'bg-[#221e2e]/50 text-white/50 cursor-not-allowed'
            }
          `}
        >
          <ShoppingCart className="w-4 h-4" />
          {isOnCooldown ? 'On Cooldown' : !canAfford ? 'Locked' : 'Redeem'}
        </motion.button>
      </div>

      {/* Category Badge */}
      <div className="absolute top-2 left-2 px-2 py-1 rounded-lg bg-black/30 backdrop-blur-sm">
        <span className="text-xs font-semibold text-white capitalize">{category}</span>
      </div>
    </motion.div>
  );
}
