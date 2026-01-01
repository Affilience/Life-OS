/**
 * Boss Selection Screen
 * Allows players to choose which boss to battle
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Swords, Shield, Heart, Star, Lock, Trophy, ChevronRight, Zap } from 'lucide-react';
import { useBossStore } from '../../stores/bossStore';
import { useAvatarStore } from '../../stores/avatarStore';
import { usePetStore } from '../../stores/petStore';
import { BOSS_DATABASE, BOSS_DIFFICULTY, calculatePlayerStats, getAvailableBosses } from '../../data/bossDatabase';
import { EQUIPMENT_DATABASE } from '../../data/equipmentDatabase';
import BossBattleArena from './BossBattleArena';

// Boss card component
const BossCard = ({ boss, isLocked, isDefeated, playerLevel, onSelect }) => {
  const difficulty = BOSS_DIFFICULTY[boss.difficulty];
  const isRecommended = playerLevel >= boss.levelRange[0] && playerLevel <= boss.levelRange[1];
  // Calculate actual battle health with difficulty multiplier
  const actualHealth = Math.floor(boss.health * (difficulty?.multiplier || 1.0));
  const actualDamage = Math.floor(boss.damage * (difficulty?.multiplier || 1.0));

  return (
    <motion.button
      onClick={() => !isLocked && onSelect(boss)}
      disabled={isLocked}
      whileHover={!isLocked ? { scale: 1.02 } : {}}
      whileTap={!isLocked ? { scale: 0.98 } : {}}
      className={`relative w-full p-4 rounded-2xl border transition-all text-left ${
        isLocked
          ? 'bg-white/5 border-white/10 opacity-50 cursor-not-allowed'
          : isRecommended
          ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/50 hover:border-purple-400'
          : 'bg-white/5 border-white/10 hover:border-white/30 hover:bg-white/10'
      }`}
    >
      {/* Recommended badge */}
      {isRecommended && !isLocked && (
        <div className="absolute -top-2 -right-2 px-2 py-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-xs font-bold text-white">
          RECOMMENDED
        </div>
      )}

      {/* Defeated badge */}
      {isDefeated && (
        <div className="absolute -top-2 -left-2 p-1 bg-yellow-500 rounded-full">
          <Trophy className="w-3 h-3 text-black" />
        </div>
      )}

      <div className="flex items-center gap-4">
        {/* Boss sprite */}
        <div className="relative w-20 h-20 flex-shrink-0">
          {isLocked ? (
            <div className="w-full h-full bg-white/10 rounded-xl flex items-center justify-center">
              <Lock className="w-8 h-8 text-white/30" />
            </div>
          ) : (
            <img
              src={boss.sprite}
              alt={boss.name}
              className="w-full h-full object-contain pixelated"
              style={{ imageRendering: 'pixelated' }}
              onError={(e) => {
                e.target.src = '/assets/icons/placeholder.png';
              }}
            />
          )}
        </div>

        {/* Boss info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-white truncate">{boss.name}</h3>
            <span
              className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: `${difficulty.color}30`, color: difficulty.color }}
            >
              {difficulty.label}
            </span>
          </div>

          <p className="text-sm text-white/50 mb-2">
            Level {boss.levelRange[0]} - {boss.levelRange[1]}
          </p>

          {/* Stats - shows actual battle values with difficulty multiplier */}
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1 text-red-400">
              <Heart className="w-3 h-3" />
              <span>{actualHealth.toLocaleString()} HP</span>
            </div>
            <div className="flex items-center gap-1 text-orange-400">
              <Swords className="w-3 h-3" />
              <span>{actualDamage}/s</span>
            </div>
          </div>
        </div>

        {/* Rewards */}
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <div className="flex items-center gap-1 text-purple-400">
            <Star className="w-4 h-4" />
            <span className="text-sm font-semibold">{boss.xpReward}</span>
          </div>
          <div className="flex items-center gap-1 text-yellow-400">
            <Zap className="w-4 h-4" />
            <span className="text-sm font-semibold">{boss.creditsReward}</span>
          </div>
          {!isLocked && (
            <ChevronRight className="w-5 h-5 text-white/30 mt-1" />
          )}
        </div>
      </div>
    </motion.button>
  );
};

// Player stats preview
const PlayerStatsPreview = ({ stats, level }) => (
  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
    <h3 className="text-sm font-semibold text-white/70 mb-3">Your Combat Stats</h3>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <div className="flex items-center gap-2 text-green-400 mb-1">
          <Heart className="w-4 h-4" />
          <span className="font-bold">{stats.maxHealth}</span>
        </div>
        <p className="text-xs text-white/50">Max Health</p>
      </div>
      <div>
        <div className="flex items-center gap-2 text-yellow-400 mb-1">
          <Swords className="w-4 h-4" />
          <span className="font-bold">{stats.damage}</span>
        </div>
        <p className="text-xs text-white/50">Damage/Tap</p>
      </div>
    </div>

    {/* Stat breakdown */}
    <div className="mt-3 pt-3 border-t border-white/10">
      <p className="text-xs text-white/40 mb-2">Breakdown:</p>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-white/50">
        <span>Base HP: {stats.breakdown.baseHealth}</span>
        <span>Base DMG: {stats.breakdown.baseDamage}</span>
        <span>Level ({level}): +{stats.breakdown.healthFromLevel}</span>
        <span>Level ({level}): +{stats.breakdown.damageFromLevel}</span>
        <span>Equipment: +{stats.breakdown.healthFromStats}</span>
        <span>Equipment: +{stats.breakdown.damageFromStats}</span>
        {stats.breakdown.petHealthBonus > 0 && (
          <>
            <span className="text-purple-400">Pet: +{stats.breakdown.petHealthBonus}</span>
            <span className="text-purple-400">Pet: +{stats.breakdown.petDamageBonus}</span>
          </>
        )}
      </div>
    </div>
  </div>
);

export default function BossSelection({ isOpen, onClose }) {
  const { battleStats, getDefeatedBosses } = useBossStore();
  const { level, equipped } = useAvatarStore();
  const { activePet } = usePetStore();

  const [selectedBoss, setSelectedBoss] = useState(null);
  const [showBattle, setShowBattle] = useState(false);

  // Calculate player stats
  const playerStats = calculatePlayerStats(level, equipped, activePet, EQUIPMENT_DATABASE);

  // Get all bosses and mark availability
  const allBosses = Object.values(BOSS_DATABASE);
  const defeatedBossIds = getDefeatedBosses();

  const handleSelectBoss = (boss) => {
    setSelectedBoss(boss);
  };

  const handleStartBattle = () => {
    if (selectedBoss) {
      setShowBattle(true);
    }
  };

  const handleBattleClose = () => {
    setShowBattle(false);
    setSelectedBoss(null);
  };

  if (!isOpen) return null;

  // Show battle arena if battle is started
  if (showBattle && selectedBoss) {
    return <BossBattleArena bossId={selectedBoss.id} onClose={handleBattleClose} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/90 z-50 overflow-hidden"
    >
      <div className="h-full flex flex-col max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Swords className="w-6 h-6 text-red-400" />
              Boss Battles
            </h1>
            <p className="text-sm text-white/50">
              Defeats: {battleStats.victories} | Best Time: {battleStats.fastestVictory ? `${battleStats.fastestVictory}s` : '-'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Player stats */}
          <PlayerStatsPreview stats={playerStats} level={level} />

          {/* Boss list */}
          <div>
            <h2 className="text-lg font-semibold text-white mb-3">Select a Boss</h2>
            <div className="space-y-3">
              {allBosses.map(boss => {
                const isLocked = level < boss.levelRange[0];
                const isDefeated = defeatedBossIds.includes(boss.id);

                return (
                  <BossCard
                    key={boss.id}
                    boss={boss}
                    isLocked={isLocked}
                    isDefeated={isDefeated}
                    playerLevel={level}
                    onSelect={handleSelectBoss}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Selected boss confirmation */}
        <AnimatePresence>
          {selectedBoss && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="p-4 bg-gradient-to-t from-purple-900/50 to-transparent border-t border-white/10"
            >
              <div className="flex items-center gap-4">
                <img
                  src={selectedBoss.sprite}
                  alt={selectedBoss.name}
                  className="w-16 h-16 object-contain pixelated"
                  style={{ imageRendering: 'pixelated' }}
                />
                <div className="flex-1">
                  <h3 className="font-bold text-white">{selectedBoss.name}</h3>
                  <p className="text-sm text-white/50">{selectedBoss.description}</p>
                </div>
                <button
                  onClick={handleStartBattle}
                  className="px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl font-bold text-white hover:scale-105 transition-transform flex items-center gap-2"
                >
                  <Swords className="w-5 h-5" />
                  FIGHT!
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
