/**
 * Bosses Tab - Boss battle selection and stats within Missions page
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Swords,
  Heart,
  Star,
  Zap,
  Lock,
  Trophy,
  ChevronRight,
  Skull,
  Target,
  Clock,
  TrendingUp,
  Flame,
  Loader2,
} from 'lucide-react';
import { useBossStore } from '../../stores/bossStore';
import { useAvatarStore } from '../../stores/avatarStore';
import { usePetStore } from '../../stores/petStore';
import { BOSS_DATABASE, BOSS_DIFFICULTY, calculatePlayerStats, getAvailableBosses, isBossUnlocked } from '../../data/bossDatabase';
import { EQUIPMENT_DATABASE } from '../../data/equipmentDatabase';
import { BossBattleArena } from '../bossBattle';

// Stat card for overall boss battle stats
const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white/5 rounded-xl p-3 border border-white/10">
    <div className="flex items-center gap-2 mb-1">
      <Icon className={`w-4 h-4 ${color}`} />
      <span className="text-xs text-white/50">{label}</span>
    </div>
    <p className={`text-xl font-bold ${color}`}>{value}</p>
  </div>
);

// Boss card component
const BossCard = ({ boss, isLocked, isDefeated, defeatCount, playerLevel, onSelect }) => {
  const difficulty = BOSS_DIFFICULTY[boss.difficulty];
  const isRecommended = playerLevel >= boss.levelRange[0] && playerLevel <= boss.levelRange[1];

  return (
    <motion.button
      onClick={() => !isLocked && onSelect(boss)}
      disabled={isLocked}
      whileHover={!isLocked ? { scale: 1.01 } : {}}
      whileTap={!isLocked ? { scale: 0.99 } : {}}
      className={`relative w-full p-3 rounded-xl border transition-all text-left ${
        isLocked
          ? 'bg-white/5 border-white/10 opacity-50 cursor-not-allowed'
          : isRecommended
          ? 'bg-gradient-to-br from-red-500/10 to-orange-500/10 border-red-500/30 hover:border-red-400'
          : 'bg-white/5 border-white/10 hover:border-white/30 hover:bg-white/10'
      }`}
    >
      {/* Recommended badge */}
      {isRecommended && !isLocked && (
        <div className="absolute -top-2 right-2 px-2 py-0.5 bg-gradient-to-r from-red-500 to-orange-500 rounded-full text-[10px] font-bold text-white">
          YOUR LEVEL
        </div>
      )}

      {/* Defeated count badge */}
      {defeatCount > 0 && (
        <div className="absolute -top-2 -left-2 flex items-center gap-1 px-1.5 py-0.5 bg-yellow-500 rounded-full">
          <Trophy className="w-3 h-3 text-black" />
          <span className="text-[10px] font-bold text-black">{defeatCount}x</span>
        </div>
      )}

      <div className="flex items-center gap-3">
        {/* Boss sprite */}
        <div className="relative w-14 h-14 flex-shrink-0">
          {isLocked ? (
            <div className="w-full h-full bg-white/10 rounded-lg flex items-center justify-center">
              <Lock className="w-6 h-6 text-white/30" />
            </div>
          ) : (
            <img
              src={boss.sprite}
              alt={boss.name}
              className="w-full h-full object-contain"
              style={{ imageRendering: 'pixelated' }}
              onError={(e) => {
                e.target.src = '/assets/icons/placeholder.png';
              }}
            />
          )}
        </div>

        {/* Boss info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="font-bold text-white text-sm truncate">{boss.name}</h3>
            <span
              className="text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: `${difficulty.color}30`, color: difficulty.color }}
            >
              {difficulty.label}
            </span>
          </div>

          <p className="text-xs text-white/50 mb-1">
            Lv {boss.levelRange[0]}-{boss.levelRange[1]}
          </p>

          {/* Boss Attack */}
          {!isLocked && boss.attackName && (
            <div
              className="flex items-center gap-1 text-[10px] mb-1.5 px-1.5 py-0.5 rounded w-fit"
              style={{
                backgroundColor: `${boss.attackColor || '#ff6600'}20`,
                color: boss.attackColor || '#ff6600',
              }}
            >
              <Flame className="w-2.5 h-2.5" />
              <span className="font-medium">{boss.attackName}</span>
            </div>
          )}

          {/* Stats row */}
          <div className="flex items-center gap-3 text-[10px]">
            <div className="flex items-center gap-1 text-red-400">
              <Heart className="w-3 h-3" />
              <span>{boss.health}</span>
            </div>
            <div className="flex items-center gap-1 text-orange-400">
              <Swords className="w-3 h-3" />
              <span>{boss.damage}/s</span>
            </div>
            <div className="flex items-center gap-1 text-purple-400">
              <Star className="w-3 h-3" />
              <span>{boss.xpReward}</span>
            </div>
          </div>
        </div>

        {/* Fight indicator */}
        {!isLocked && (
          <ChevronRight className="w-5 h-5 text-white/30 flex-shrink-0" />
        )}
      </div>
    </motion.button>
  );
};

export default function BossesTab() {
  const { battleStats, getDefeatedBosses, initializeFromSupabase, isLoading } = useBossStore();
  const { level, equipped } = useAvatarStore();
  const { activePet } = usePetStore();

  const [selectedBoss, setSelectedBoss] = useState(null);
  const [showBattle, setShowBattle] = useState(false);

  // Ensure fresh data is loaded from Supabase when tab is viewed
  useEffect(() => {
    initializeFromSupabase();
  }, [initializeFromSupabase]);

  // Calculate player stats
  const playerStats = calculatePlayerStats(level, equipped, activePet, EQUIPMENT_DATABASE);

  // Get all bosses
  const allBosses = Object.values(BOSS_DATABASE);
  const defeatedBossIds = battleStats.bossVictories || {};

  const handleSelectBoss = (boss) => {
    setSelectedBoss(boss);
    setShowBattle(true);
  };

  const handleBattleClose = () => {
    setShowBattle(false);
    setSelectedBoss(null);
  };

  // Show battle arena if battle is started
  if (showBattle && selectedBoss) {
    return <BossBattleArena bossId={selectedBoss.id} onClose={handleBattleClose} />;
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          icon={Trophy}
          label="Victories"
          value={isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (battleStats.victories || 0)}
          color="text-yellow-400"
        />
        <StatCard
          icon={Skull}
          label="Defeats"
          value={isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (battleStats.defeats || 0)}
          color="text-red-400"
        />
        <StatCard
          icon={Clock}
          label="Best Time"
          value={isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (battleStats.fastestVictory ? `${battleStats.fastestVictory}s` : '-')}
          color="text-blue-400"
        />
        <StatCard
          icon={Target}
          label="Total Taps"
          value={isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (battleStats.totalTaps?.toLocaleString() || 0)}
          color="text-purple-400"
        />
      </div>

      {/* Player Combat Stats */}
      <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl p-4 border border-purple-500/20">
        <h3 className="text-sm font-semibold text-white/70 mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          Your Combat Power (Level {level})
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-2 text-green-400">
              <Heart className="w-4 h-4" />
              <span className="font-bold text-lg">{playerStats.maxHealth}</span>
            </div>
            <p className="text-xs text-white/50">Max Health</p>
          </div>
          <div>
            <div className="flex items-center gap-2 text-yellow-400">
              <Swords className="w-4 h-4" />
              <span className="font-bold text-lg">{playerStats.damage}</span>
            </div>
            <p className="text-xs text-white/50">Damage per Tap</p>
          </div>
        </div>
        <p className="text-xs text-white/40 mt-3">
          Equip better gear and level up to increase your combat stats!
        </p>
      </div>

      {/* Boss List */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <Skull className="w-5 h-5 text-red-400" />
          Challenge a Boss
        </h3>
        <div className="space-y-2">
          {allBosses.map(boss => {
            const isLocked = !isBossUnlocked(boss.id, level);
            const defeatCount = defeatedBossIds[boss.id] || 0;

            return (
              <BossCard
                key={boss.id}
                boss={boss}
                isLocked={isLocked}
                isDefeated={defeatCount > 0}
                defeatCount={defeatCount}
                playerLevel={level}
                onSelect={handleSelectBoss}
              />
            );
          })}
        </div>
      </div>

      {/* Tips */}
      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
        <h4 className="text-sm font-semibold text-white/70 mb-2">Battle Tips</h4>
        <ul className="text-xs text-white/50 space-y-1">
          <li>• Tap as fast as you can to deal damage!</li>
          <li>• Bosses attack you every second - defeat them quickly!</li>
          <li>• Level up and equip gear to increase your stats</li>
          <li>• Pets provide bonus health and damage</li>
          <li>• Defeat bosses to earn XP and credits</li>
        </ul>
      </div>
    </div>
  );
}
