/**
 * PvP Arena - Real-time tap combat against other players
 * Similar to BossBattleArena but with multiplayer mechanics
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { animate } from 'animejs';
import {
  Swords,
  Heart,
  Zap,
  Shield,
  X,
  Trophy,
  Skull,
  Clock,
  Target,
  Loader2,
  Users,
  Crown,
  Sparkles,
} from 'lucide-react';
import usePvpArenaStore from '../../stores/pvpArenaStore';
import { useAvatarStore } from '../../stores/avatarStore';
import { usePetStore } from '../../stores/petStore';
import { EQUIPMENT_DATABASE } from '../../data/equipmentDatabase';
import { getWeaponAbility, isAbilityReady, calculateAbilityDamage } from '../../data/weaponAbilities';
import { sounds } from '../../services/microInteractions';
import AbilityAnimation from '../combat/AbilityAnimation';

// Damage number floating animation
const DamageNumber = ({ damage, x, y, isCrit, isPlayer }) => (
  <motion.div
    initial={{ opacity: 1, y: 0, scale: isCrit ? 1.5 : 1 }}
    animate={{ opacity: 0, y: -60, scale: isCrit ? 1.8 : 1.2 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.8, ease: 'easeOut' }}
    className={`absolute pointer-events-none font-black text-2xl ${
      isCrit
        ? 'text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]'
        : isPlayer
        ? 'text-green-400'
        : 'text-red-400'
    }`}
    style={{ left: x, top: y }}
  >
    {isCrit && <span className="text-sm mr-1">CRIT!</span>}
    -{damage}
  </motion.div>
);

// Health bar component
const HealthBar = ({ current, max, color, label, isPlayer }) => {
  const percent = Math.max(0, Math.min(100, (current / max) * 100));

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        <span className={`text-sm font-medium ${isPlayer ? 'text-green-400' : 'text-red-400'}`}>
          {label}
        </span>
        <span className="text-sm text-white/70">
          {current.toLocaleString()} / {max.toLocaleString()}
        </span>
      </div>
      <div className="h-6 bg-black/50 rounded-full overflow-hidden border border-white/20">
        <motion.div
          className={`h-full ${color} relative`}
          initial={{ width: '100%' }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent" />
        </motion.div>
      </div>
    </div>
  );
};

// Queue waiting screen
const QueueScreen = ({ queueTime, onCancel, playersInQueue }) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-gradient-to-br from-red-900/50 to-orange-900/50 rounded-2xl p-8 border border-red-500/30 max-w-md w-full mx-4 text-center"
      >
        <div className="relative mb-6">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-20 h-20 mx-auto border-4 border-red-500/30 border-t-red-500 rounded-full"
          />
          <Swords className="w-8 h-8 text-red-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>

        <h2 className="text-2xl font-bold text-white mb-2">Finding Opponent</h2>
        <p className="text-white/60 mb-4">Ranked Arena Match</p>

        <div className="flex items-center justify-center gap-2 text-xl font-mono text-red-400 mb-6">
          <Clock className="w-5 h-5" />
          <span>{formatTime(elapsed)}</span>
        </div>

        <p className="text-sm text-white/50 mb-6">
          Searching for players within your level range...
        </p>

        <button
          onClick={onCancel}
          className="px-6 py-3 bg-white/10 hover:bg-red-500/20 text-white rounded-xl font-medium transition-colors"
        >
          Cancel
        </button>
      </motion.div>
    </div>
  );
};

// Victory/Defeat screen
const ResultScreen = ({ isWinner, rewards, onClose, opponentName }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
  >
    <motion.div
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', damping: 15 }}
      className={`rounded-2xl p-8 border max-w-md w-full mx-4 text-center ${
        isWinner
          ? 'bg-gradient-to-br from-yellow-900/50 to-amber-900/50 border-yellow-500/30'
          : 'bg-gradient-to-br from-red-900/50 to-rose-900/50 border-red-500/30'
      }`}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring' }}
        className="mb-6"
      >
        {isWinner ? (
          <div className="relative">
            <Trophy className="w-24 h-24 mx-auto text-yellow-400" />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0 bg-gradient-to-r from-yellow-400/0 via-yellow-400/20 to-yellow-400/0 rounded-full"
            />
          </div>
        ) : (
          <Skull className="w-24 h-24 mx-auto text-red-400" />
        )}
      </motion.div>

      <h2 className={`text-3xl font-black mb-2 ${isWinner ? 'text-yellow-400' : 'text-red-400'}`}>
        {isWinner ? 'VICTORY!' : 'DEFEAT'}
      </h2>

      <p className="text-white/70 mb-6">
        {isWinner ? `You defeated ${opponentName || 'your opponent'}!` : `${opponentName || 'Your opponent'} won!`}
      </p>

      {rewards && (
        <div className="flex justify-center gap-6 mb-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-400">+{isWinner ? rewards.winnerXp : rewards.loserXp}</p>
            <p className="text-sm text-white/50">XP</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-400">+{isWinner ? rewards.winnerCredits : rewards.loserCredits}</p>
            <p className="text-sm text-white/50">Credits</p>
          </div>
        </div>
      )}

      <button
        onClick={onClose}
        className={`px-8 py-3 rounded-xl font-bold text-black transition-all ${
          isWinner
            ? 'bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400'
            : 'bg-gradient-to-r from-red-400 to-rose-500 hover:from-red-300 hover:to-rose-400'
        }`}
      >
        Continue
      </button>
    </motion.div>
  </motion.div>
);

// Main Arena Component
export default function PvPArena({ onClose }) {
  const {
    inQueue,
    queueType,
    isInMatch,
    currentMatch,
    matchResult,
    myHealth,
    myMaxHealth,
    opponentHealth,
    opponentMaxHealth,
    myTaps,
    opponentTaps,
    myProfile,
    opponentProfile,
    joinQueue,
    leaveQueue,
    attack,
    useAbility,
    exitMatch,
  } = usePvpArenaStore();

  const { level, equipped } = useAvatarStore();
  const { activePet } = usePetStore();

  const [damageNumbers, setDamageNumbers] = useState([]);
  const [weaponCooldown, setWeaponCooldown] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [abilityLastUsed, setAbilityLastUsed] = useState(0);
  const [isAbilityAnimating, setIsAbilityAnimating] = useState(false);
  const [activeAbilityAnimation, setActiveAbilityAnimation] = useState(null);
  const arenaRef = useRef(null);
  const cooldownIntervalRef = useRef(null);

  // Get weapon info
  const weaponId = equipped?.mainHand || equipped?.weapon;
  const weapon = weaponId ? EQUIPMENT_DATABASE[weaponId] : null;

  // Get the ability for the equipped weapon
  const weaponAbility = weaponId ? getWeaponAbility(weaponId) : null;
  const canUseAbility = weaponAbility && isAbilityReady(abilityLastUsed, weaponAbility.cooldown) && !isAbilityAnimating;

  // Get user ID
  const [userId, setUserId] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  useEffect(() => {
    const getUser = async () => {
      try {
        const { data, error } = await import('../../lib/supabase').then(m => m.supabase.auth.getUser());
        if (error) {
          console.error('[PvPArena] Auth error:', error);
        }
        if (data?.user) {
          setUserId(data.user.id);
        }
      } catch (err) {
        console.error('[PvPArena] Failed to get user:', err);
      } finally {
        setUserLoading(false);
      }
    };
    getUser();
  }, []);

  // Calculate damage per tap
  const baseDamage = 10 + (level * 2);
  const weaponBonus = weapon?.stats?.strength ? weapon.stats.strength * 3 : 0;
  const damagePerTap = baseDamage + weaponBonus;

  // Screen shake
  const triggerShake = useCallback((intensity = 'normal') => {
    if (!arenaRef.current) return;
    const configs = {
      light: { x: 3, duration: 150 },
      normal: { x: 8, duration: 250 },
      heavy: { x: 15, duration: 400 },
    };
    const config = configs[intensity] || configs.normal;
    animate(arenaRef.current, {
      translateX: [0, -config.x, config.x, -config.x / 2, config.x / 2, 0],
      duration: config.duration,
      easing: 'easeOutElastic(1, 0.5)',
    });
  }, []);

  // Weapon cooldown timer
  useEffect(() => {
    if (weaponCooldown > 0) {
      cooldownIntervalRef.current = setInterval(() => {
        setWeaponCooldown(prev => Math.max(0, prev - 100));
      }, 100);
    }
    return () => {
      if (cooldownIntervalRef.current) clearInterval(cooldownIntervalRef.current);
    };
  }, [weaponCooldown > 0]);

  // Handle tap attack
  const handleAttack = useCallback(async (e) => {
    if (!isInMatch || !userId || matchResult) return;

    const isCrit = Math.random() < 0.1; // 10% crit chance
    const damage = isCrit ? Math.floor(damagePerTap * 1.5) : damagePerTap;

    // Play sound
    if (isCrit) {
      sounds.criticalHit?.();
    } else {
      sounds.attackHit?.();
    }

    // Show damage number
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setDamageNumbers(prev => [
      ...prev,
      { id: Date.now(), damage, x, y, isCrit, isPlayer: true },
    ]);

    // Shake screen
    triggerShake(isCrit ? 'heavy' : 'light');

    // Send attack to opponent
    await attack(userId, damage, isCrit);

    // Clean up old damage numbers
    setTimeout(() => {
      setDamageNumbers(prev => prev.slice(1));
    }, 800);
  }, [isInMatch, userId, matchResult, damagePerTap, attack, triggerShake]);

  // Handle weapon ability
  const handleWeaponAbility = useCallback(async () => {
    if (!weaponAbility || !canUseAbility || !isInMatch || !userId || matchResult) return;

    // Set ability as used
    setAbilityLastUsed(Date.now());
    setIsAbilityAnimating(true);

    // Calculate ability damage
    const abilityDamage = calculateAbilityDamage(damagePerTap, weaponAbility);

    // Play ability sound
    if (sounds.powerAttack) {
      sounds.powerAttack();
    } else {
      sounds.attackHit?.();
    }

    // Show ability animation
    setActiveAbilityAnimation({
      ability: weaponAbility,
      position: { x: window.innerWidth / 2, y: window.innerHeight / 3 },
    });

    // Delay damage until animation completes
    setTimeout(async () => {
      // Trigger screen shake
      triggerShake(weaponAbility.screenShake || 'heavy');

      // Show damage number
      setDamageNumbers(prev => [
        ...prev,
        {
          id: Date.now(),
          damage: abilityDamage,
          x: window.innerWidth / 2 - 50,
          y: 100,
          isCrit: true,
          isPlayer: true,
        },
      ]);

      // Send ability damage to opponent
      await useAbility(userId, weaponAbility, abilityDamage);

      // Clean up
      setTimeout(() => {
        setDamageNumbers(prev => prev.slice(1));
        setActiveAbilityAnimation(null);
        setIsAbilityAnimating(false);
      }, 800);
    }, weaponAbility.duration || 600);
  }, [weaponAbility, canUseAbility, isInMatch, userId, matchResult, damagePerTap, useAbility, triggerShake]);

  // Join queue handler - always ranked
  const handleJoinQueue = async () => {
    if (!userId) return;
    await joinQueue(userId, { level, equipped, activePet });
    sounds.battleStart?.();
  };

  // Handle close
  const handleClose = () => {
    if (inQueue) {
      leaveQueue(userId);
    }
    exitMatch();
    onClose?.();
  };

  // Show queue screen
  if (inQueue && !isInMatch) {
    return <QueueScreen queueType={queueType} onCancel={() => leaveQueue(userId)} />;
  }

  // Show result screen
  if (matchResult) {
    return (
      <ResultScreen
        isWinner={matchResult.winnerId === userId}
        rewards={matchResult}
        onClose={handleClose}
        opponentName={opponentProfile?.display_name}
      />
    );
  }

  // Show arena lobby if not in match
  if (!isInMatch) {
    return (
      <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-gradient-to-br from-[#1a1724] to-[#0f0d15] rounded-2xl border border-red-500/30 max-w-lg w-full overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500/20 rounded-xl">
                  <Swords className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">PvP Arena</h2>
                  <p className="text-sm text-white/50">Real-time ranked combat</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white/60" />
              </button>
            </div>
          </div>

          {/* Your Stats */}
          <div className="p-6 border-b border-white/10">
            <h3 className="text-sm font-medium text-white/50 mb-3">Your Combat Stats</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white/5 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-purple-400">{level}</p>
                <p className="text-xs text-white/50">Level</p>
              </div>
              <div className="bg-white/5 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-green-400">{100 + level * 10}</p>
                <p className="text-xs text-white/50">Health</p>
              </div>
              <div className="bg-white/5 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-orange-400">{damagePerTap}</p>
                <p className="text-xs text-white/50">Damage</p>
              </div>
            </div>
          </div>

          {/* Find Match Button */}
          <div className="p-6">
            <button
              onClick={handleJoinQueue}
              disabled={userLoading || !userId}
              className={`w-full p-5 rounded-xl transition-all ${
                userLoading || !userId
                  ? 'bg-gray-700 cursor-not-allowed opacity-60'
                  : 'bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 shadow-lg shadow-red-500/30 hover:shadow-red-500/50 hover:scale-[1.02] active:scale-[0.98]'
              }`}
            >
              <div className="flex items-center justify-center gap-3">
                {userLoading ? (
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                ) : (
                  <Swords className="w-8 h-8 text-white" />
                )}
                <div className="text-left">
                  <h3 className="font-bold text-white text-lg">
                    {userLoading ? 'Loading...' : !userId ? 'Not Signed In' : 'Find Match'}
                  </h3>
                  <p className="text-sm text-white/80">
                    {userLoading ? 'Please wait...' : !userId ? 'Please sign in to play' : 'Ranked battle based on your level'}
                  </p>
                </div>
              </div>
            </button>

            <p className="text-center text-white/40 text-sm mt-4">
              You'll be matched with players within ±5 levels
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  // Main battle arena
  const isPlayer1 = currentMatch?.player1_id === userId;
  const opponentLevel = isPlayer1 ? currentMatch?.player2_level : currentMatch?.player1_level;
  const opponentWeapon = isPlayer1 ? currentMatch?.player2_weapon : currentMatch?.player1_weapon;

  return (
    <div className="fixed inset-0 bg-black z-50 overflow-hidden">
      <div
        ref={arenaRef}
        className="w-full h-full bg-gradient-to-b from-purple-900/30 via-black to-red-900/30 flex flex-col"
      >
        {/* Header */}
        <div className="p-4 flex items-center justify-between bg-black/50">
          <div className="flex items-center gap-2">
            <Swords className="w-5 h-5 text-red-400" />
            <span className="font-bold text-white capitalize">{currentMatch?.match_type} Battle</span>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white/60" />
          </button>
        </div>

        {/* Health Bars */}
        <div className="px-4 py-3 space-y-3 bg-black/30">
          <HealthBar
            current={myHealth}
            max={myMaxHealth}
            color="bg-gradient-to-r from-green-500 to-emerald-400"
            label={`${myProfile?.display_name || 'You'} (Lv.${level})`}
            isPlayer={true}
          />
          <HealthBar
            current={opponentHealth}
            max={opponentMaxHealth}
            color="bg-gradient-to-r from-red-500 to-orange-400"
            label={`${opponentProfile?.display_name || 'Opponent'} (Lv.${opponentLevel || '?'})`}
            isPlayer={false}
          />
        </div>

        {/* Battle Area - Tap Zone */}
        <div
          onClick={handleAttack}
          className="flex-1 relative cursor-crosshair select-none"
          style={{ touchAction: 'manipulation' }}
        >
          {/* VS Display */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-6xl font-black text-red-500/30"
              >
                VS
              </motion.div>
              <p className="text-white/30 mt-2">TAP TO ATTACK!</p>
            </div>
          </div>

          {/* Player side indicator */}
          <div className="absolute bottom-20 left-4 flex flex-col items-center gap-1 pointer-events-none">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center border-2 border-green-500/50 overflow-hidden">
              {myProfile?.avatar_url ? (
                <img
                  src={myProfile.avatar_url}
                  alt={myProfile.display_name || 'You'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xl font-bold text-green-400">
                  {myProfile?.display_name?.[0]?.toUpperCase() || 'Y'}
                </span>
              )}
            </div>
            <span className="text-xs font-semibold text-green-400 bg-black/50 px-2 py-0.5 rounded-full">
              {myProfile?.display_name || 'You'}
            </span>
          </div>

          {/* Opponent side indicator */}
          <div className="absolute top-20 right-4 flex flex-col items-center gap-1 pointer-events-none">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center border-2 border-red-500/50 overflow-hidden">
              {opponentProfile?.avatar_url ? (
                <img
                  src={opponentProfile.avatar_url}
                  alt={opponentProfile.display_name || 'Opponent'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xl font-bold text-red-400">
                  {opponentProfile?.display_name?.[0]?.toUpperCase() || 'O'}
                </span>
              )}
            </div>
            <span className="text-xs font-semibold text-red-400 bg-black/50 px-2 py-0.5 rounded-full">
              {opponentProfile?.display_name || 'Opponent'}
            </span>
          </div>

          {/* Damage Numbers */}
          <AnimatePresence>
            {damageNumbers.map(dn => (
              <DamageNumber key={dn.id} {...dn} />
            ))}
          </AnimatePresence>

          {/* Ability Animation */}
          <AnimatePresence>
            {activeAbilityAnimation && (
              <AbilityAnimation
                ability={activeAbilityAnimation.ability}
                position={activeAbilityAnimation.position}
                containerRef={arenaRef}
                onComplete={() => setActiveAbilityAnimation(null)}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Stats Bar */}
        <div className="px-4 py-2 bg-black/50 flex justify-around">
          <div className="text-center">
            <p className="text-lg font-bold text-green-400">{myTaps}</p>
            <p className="text-xs text-white/50">Your Taps</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-yellow-400">{damagePerTap}</p>
            <p className="text-xs text-white/50">Damage</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-red-400">{opponentTaps}</p>
            <p className="text-xs text-white/50">Opp Taps</p>
          </div>
        </div>

        {/* Weapon Ability */}
        {weaponAbility && (
          <div className="p-4 bg-black/70">
            <button
              onClick={handleWeaponAbility}
              disabled={!canUseAbility}
              className={`w-full p-4 rounded-xl flex items-center justify-center gap-3 transition-all ${
                !canUseAbility
                  ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                  : 'text-white hover:scale-[1.02] active:scale-95'
              }`}
              style={{
                background: canUseAbility
                  ? `linear-gradient(135deg, ${weaponAbility.color}, ${weaponAbility.trailColor || weaponAbility.color})`
                  : undefined,
                boxShadow: canUseAbility ? `0 0 30px ${weaponAbility.color}50` : 'none',
              }}
            >
              <Sparkles className="w-6 h-6" />
              <div className="flex flex-col items-start">
                <span className="font-bold">{weaponAbility.name}</span>
                {!canUseAbility && (
                  <span className="text-xs text-white/50">
                    {isAbilityAnimating
                      ? 'Casting...'
                      : `${((weaponAbility.cooldown - (Date.now() - abilityLastUsed)) / 1000).toFixed(1)}s`}
                  </span>
                )}
              </div>
              <span className="text-sm opacity-75 bg-black/30 px-2 py-1 rounded-lg">
                {weaponAbility.damage}x DMG
              </span>
            </button>

            {/* Ability Cooldown Progress */}
            {!canUseAbility && !isAbilityAnimating && (
              <div className="mt-2 h-1.5 bg-black/50 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: weaponAbility.color }}
                  initial={{ width: '0%' }}
                  animate={{
                    width: `${Math.min(100, ((Date.now() - abilityLastUsed) / weaponAbility.cooldown) * 100)}%`,
                  }}
                  transition={{ duration: 0.1 }}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
