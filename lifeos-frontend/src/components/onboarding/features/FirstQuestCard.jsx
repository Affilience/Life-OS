import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Target, Gift, ChevronRight, Sparkles, Zap, Heart, BookOpen, Wallet, Star } from 'lucide-react';
import { sounds } from '../../../services/microInteractions/sounds';

/**
 * FirstQuestCard - Quest assignment UI for onboarding
 *
 * Features:
 * - Displays first quest based on primary goal
 * - Shows reward preview (equipment + XP)
 * - Accept quest animation
 */

const QUEST_CONFIG = {
  productivity: {
    title: 'The First Focus',
    description: 'Complete your first deep work session',
    icon: Zap,
    color: 'from-orange-500 to-amber-500',
    reward: {
      xp: 50,
      equipment: 'Focus Blade',
      equipmentIcon: '/assets/equipment/weapons/focus_blade.png',
    },
  },
  health: {
    title: 'Fuel for the Journey',
    description: 'Log your first meal in the nutrition tracker',
    icon: Heart,
    color: 'from-red-500 to-pink-500',
    reward: {
      xp: 50,
      equipment: 'Vitality Amulet',
      equipmentIcon: '/assets/equipment/amulets/amulet_vitality.png',
    },
  },
  learning: {
    title: 'The First Scroll',
    description: 'Add a book to your reading list',
    icon: BookOpen,
    color: 'from-blue-500 to-cyan-500',
    reward: {
      xp: 50,
      equipment: "Scholar's Tome",
      equipmentIcon: '/assets/equipment/weapons/scholars_tome.png',
    },
  },
  financial: {
    title: 'Counting Coins',
    description: 'Set your first budget category',
    icon: Wallet,
    color: 'from-green-500 to-emerald-500',
    reward: {
      xp: 50,
      equipment: 'Wealth Ring',
      equipmentIcon: '/assets/equipment/rings/ring_focus.png',
    },
  },
  habits: {
    title: 'The First Link',
    description: 'Create your first habit to track',
    icon: Target,
    color: 'from-indigo-500 to-purple-500',
    reward: {
      xp: 50,
      equipment: 'Discipline Cape',
      equipmentIcon: '/assets/equipment/capes/basic.png',
    },
  },
  mindfulness: {
    title: 'Inner Voice',
    description: 'Write your first journal entry',
    icon: Sparkles,
    color: 'from-purple-500 to-violet-500',
    reward: {
      xp: 50,
      equipment: 'Serenity Hood',
      equipmentIcon: '/assets/equipment/helmets/mindguard_helmet.png',
    },
  },
};

export default function FirstQuestCard({
  primaryGoal = 'productivity',
  onAccept,
  soundEnabled = true,
}) {
  const [isAccepted, setIsAccepted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const quest = QUEST_CONFIG[primaryGoal] || QUEST_CONFIG.productivity;
  const Icon = quest.icon;

  const handleAccept = () => {
    setIsAccepted(true);

    if (soundEnabled && sounds.isEnabled()) {
      sounds.success();
    }

    setTimeout(() => {
      onAccept?.({
        questId: `first_${primaryGoal}`,
        title: quest.title,
        description: quest.description,
        reward: quest.reward,
      });
    }, 800);
  };

  return (
    <motion.div
      className="relative w-full max-w-md mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Card glow */}
      <motion.div
        className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${quest.color} blur-xl`}
        animate={{
          opacity: isHovered ? 0.3 : 0.15,
          scale: isHovered ? 1.02 : 1,
        }}
        transition={{ duration: 0.3 }}
      />

      {/* Main card */}
      <motion.div
        className="relative bg-[#1a1724]/90 rounded-2xl border border-white/10 overflow-hidden backdrop-blur-sm"
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        animate={{
          borderColor: isHovered ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)',
        }}
      >
        {/* Header */}
        <div className={`px-6 py-4 bg-gradient-to-r ${quest.color} bg-opacity-20`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-white/60 text-xs uppercase tracking-wider">
                Starter Quest
              </div>
              <div className="text-white font-bold text-lg">
                {quest.title}
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          {/* Quest description */}
          <div className="flex items-start gap-3 mb-6">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${quest.color} flex items-center justify-center flex-shrink-0`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-white/80 text-sm leading-relaxed">
                {quest.description}
              </p>
              <p className="text-white/40 text-xs mt-1">
                Complete this quest to claim your reward
              </p>
            </div>
          </div>

          {/* Rewards section */}
          <div className="bg-white/5 rounded-xl p-4 mb-6">
            <div className="text-white/60 text-xs uppercase tracking-wider mb-3 flex items-center gap-2">
              <Gift className="w-4 h-4" />
              Rewards
            </div>

            <div className="flex items-center gap-4">
              {/* XP reward */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                  <Star className="w-4 h-4 text-yellow-400" />
                </div>
                <div>
                  <div className="text-yellow-400 font-bold">+{quest.reward.xp} XP</div>
                </div>
              </div>

              {/* Divider */}
              <div className="w-px h-8 bg-white/10" />

              {/* Equipment reward */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center overflow-hidden">
                  <img
                    src={quest.reward.equipmentIcon}
                    alt={quest.reward.equipment}
                    className="w-6 h-6 object-contain"
                    style={{ imageRendering: 'pixelated' }}
                  />
                </div>
                <div>
                  <div className="text-purple-400 font-medium text-sm">
                    {quest.reward.equipment}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Accept button */}
          <motion.button
            onClick={handleAccept}
            disabled={isAccepted}
            className={`
              w-full py-3 px-6 rounded-xl font-semibold
              flex items-center justify-center gap-2
              transition-all duration-300
              ${isAccepted
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : `bg-gradient-to-r ${quest.color} text-white hover:shadow-lg hover:shadow-purple-500/20`
              }
            `}
            whileHover={!isAccepted ? { scale: 1.02 } : {}}
            whileTap={!isAccepted ? { scale: 0.98 } : {}}
          >
            {isAccepted ? (
              <>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center"
                >
                  <svg className="w-3 h-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </motion.div>
                <span>Quest Accepted!</span>
              </>
            ) : (
              <>
                <span>Accept Quest</span>
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </motion.button>
        </div>
      </motion.div>

      {/* Decorative sparkles */}
      {isAccepted && (
        <>
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2"
              style={{
                left: `${20 + (i * 12)}%`,
                top: `${30 + (i % 3) * 20}%`,
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
                y: [0, -20, -40],
              }}
              transition={{
                duration: 0.8,
                delay: i * 0.1,
              }}
            >
              <Sparkles className="w-full h-full text-yellow-400" />
            </motion.div>
          ))}
        </>
      )}
    </motion.div>
  );
}
