import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Lock, Star, Sparkles, Zap } from 'lucide-react';

type Rarity = 'common' | 'rare' | 'epic' | 'legendary' | 'cosmic';
type Category = 'milestone' | 'streak' | 'mastery' | 'exploration' | 'collection' | 'special';

interface DiscoveryCardProps {
  id: string;
  title: string;
  scientificName?: string;
  description: string;
  cosmicLore?: string;
  category: Category;
  rarity: Rarity;
  creditsReward?: number;
  pointsValue: number;
  icon?: string;
  isUnlocked: boolean;
  isSecret: boolean;
  unlockedAt?: string;
  progressPercentage?: number;
}

export function DiscoveryCard({
  title,
  scientificName,
  description,
  cosmicLore,
  category,
  rarity,
  creditsReward = 0,
  pointsValue,
  icon,
  isUnlocked,
  isSecret,
  unlockedAt,
  progressPercentage = 0
}: DiscoveryCardProps) {

  // Rarity configurations
  const rarityConfig = {
    common: {
      gradient: 'from-gray-500/20 to-gray-600/20',
      border: 'border-gray-500/30',
      glow: '',
      textColor: 'text-gray-400',
      bgColor: 'bg-gray-500/20',
      label: 'Common',
      icon: <Star className="w-4 h-4" />
    },
    rare: {
      gradient: 'from-blue-500/20 to-cyan-500/20',
      border: 'border-blue-500/40',
      glow: 'shadow-lg shadow-blue-500/20',
      textColor: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
      label: 'Rare',
      icon: <Star className="w-4 h-4" />
    },
    epic: {
      gradient: 'from-purple-500/20 to-pink-500/20',
      border: 'border-purple-500/50',
      glow: 'shadow-lg shadow-purple-500/30',
      textColor: 'text-purple-400',
      bgColor: 'bg-purple-500/20',
      label: 'Epic',
      icon: <Sparkles className="w-4 h-4" />
    },
    legendary: {
      gradient: 'from-orange-500/20 to-yellow-500/20',
      border: 'border-yellow-500/60',
      glow: 'shadow-xl shadow-yellow-500/40',
      textColor: 'text-yellow-400',
      bgColor: 'bg-yellow-500/20',
      label: 'Legendary',
      icon: <Trophy className="w-4 h-4" />
    },
    cosmic: {
      gradient: 'from-indigo-500/20 via-purple-500/20 to-pink-500/20',
      border: 'border-purple-500/70',
      glow: 'shadow-2xl shadow-purple-500/50 animate-pulse',
      textColor: 'text-purple-300',
      bgColor: 'bg-gradient-to-r from-indigo-500/20 to-pink-500/20',
      label: 'Cosmic',
      icon: <Zap className="w-4 h-4" />
    }
  };

  const config = rarityConfig[rarity];

  // Category emojis
  const categoryIcons: Record<Category, string> = {
    milestone: '🎯',
    streak: '🔥',
    mastery: '🎓',
    exploration: '🔭',
    collection: '📚',
    special: '✨'
  };

  const categoryIcon = icon || categoryIcons[category];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: isUnlocked ? 1.03 : 1 }}
      className={`
        relative cosmic-card cosmic-border rounded-2xl p-6
        bg-gradient-to-br ${config.gradient}
        ${config.glow}
        ${!isUnlocked ? 'opacity-60' : ''}
        transition-all duration-300
      `}
    >
      {/* Locked Overlay */}
      {!isUnlocked && (
        <div className="absolute inset-0 backdrop-blur-sm rounded-2xl flex items-center justify-center bg-black/40">
          {isSecret ? (
            <div className="text-center">
              <Lock className="w-12 h-12 text-gray-500 mx-auto mb-2" />
              <p className="text-gray-400 font-semibold">Secret Discovery</p>
              <p className="text-xs text-gray-500 mt-1">???</p>
            </div>
          ) : (
            <div className="text-center px-4">
              <Lock className="w-12 h-12 text-gray-500 mx-auto mb-2" />
              <p className="text-sm text-gray-400 max-w-xs">{description}</p>
              {progressPercentage > 0 && (
                <div className="mt-4">
                  <div className="text-xs text-gray-400 mb-1">{progressPercentage}% Complete</div>
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Rarity Badge */}
      <div className={`absolute -top-3 -right-3 px-3 py-1 rounded-full ${config.bgColor} border ${config.border} backdrop-blur-sm`}>
        <div className="flex items-center gap-1">
          {config.icon}
          <span className={`text-xs font-bold ${config.textColor}`}>{config.label}</span>
        </div>
      </div>

      {/* Icon */}
      <div className="text-5xl mb-4 text-center">
        {isUnlocked ? categoryIcon : '🔒'}
      </div>

      {/* Title & Scientific Name */}
      <div className="text-center mb-3">
        <h3 className="text-xl font-bold text-white mb-1">
          {isUnlocked || !isSecret ? title : '???'}
        </h3>
        {scientificName && isUnlocked && (
          <p className="text-sm italic text-purple-300">"{scientificName}"</p>
        )}
      </div>

      {/* Description */}
      {isUnlocked && (
        <div className="mb-4">
          <p className="text-sm text-gray-300 text-center mb-2">{description}</p>
          {cosmicLore && (
            <p className="text-xs text-purple-300/70 italic text-center">
              {cosmicLore}
            </p>
          )}
        </div>
      )}

      {/* Rewards & Info */}
      {isUnlocked && (
        <div className="pt-4 border-t border-white/10">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span className="text-gray-400">Points:</span>
              <span className="font-bold text-white">{pointsValue}</span>
            </div>
            {creditsReward > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-amber-400 font-bold">+{creditsReward}</span>
                <span className="text-xs text-gray-400">credits</span>
              </div>
            )}
          </div>

          {unlockedAt && (
            <div className="mt-2 text-xs text-gray-500 text-center">
              Discovered on {new Date(unlockedAt).toLocaleDateString()}
            </div>
          )}
        </div>
      )}

      {/* Category Badge */}
      <div className="absolute top-2 left-2 px-2 py-1 rounded-lg bg-black/40 backdrop-blur-sm">
        <span className="text-xs font-semibold text-white capitalize">{category}</span>
      </div>

      {/* New Badge */}
      {isUnlocked && unlockedAt && (
        new Date().getTime() - new Date(unlockedAt).getTime() < 86400000 * 7 && (
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute top-2 right-16 px-2 py-1 rounded-lg bg-green-500/80 backdrop-blur-sm"
          >
            <span className="text-xs font-bold text-white">NEW!</span>
          </motion.div>
        )
      )}
    </motion.div>
  );
}
