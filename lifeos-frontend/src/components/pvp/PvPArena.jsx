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
import useElementalAbilityStore from '../../stores/elementalAbilityStore';
import { EQUIPMENT_DATABASE } from '../../data/equipmentDatabase';
import { getWeaponAbility, isAbilityReady, calculateAbilityDamage } from '../../data/weaponAbilities';
import { getAbilityById, calculateAbilityDamage as calcElementalDamage } from '../../data/elementalAbilities';
import { sounds } from '../../services/microInteractions';
import AbilityAnimation from '../combat/AbilityAnimation';
import CombatCanvas from '../combat/CombatCanvas';
import AvatarRenderer from '../avatar/AvatarRenderer';

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

// Attack projectile from player to opponent (bottom-left to top-right)
const PlayerAttackProjectile = ({ weapon, isCrit, onComplete }) => {
  const color = weapon?.color || '#22c55e';
  const trailColor = weapon?.trailColor || '#86efac';
  const isMagic = weapon?.isMagic;

  return (
    <motion.div
      className="absolute pointer-events-none z-30"
      initial={{ bottom: '30%', left: '15%', scale: 0.5, opacity: 1 }}
      animate={{
        bottom: '65%',
        left: '75%',
        scale: isCrit ? 1.5 : 1,
        opacity: [1, 1, 0.8]
      }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      onAnimationComplete={onComplete}
    >
      {isMagic ? (
        <div className="relative">
          <motion.div
            className="w-8 h-8 rounded-full"
            style={{
              background: `radial-gradient(circle, ${color} 0%, ${trailColor} 60%, transparent 100%)`,
              boxShadow: `0 0 20px ${color}, 0 0 40px ${trailColor}`,
            }}
            animate={{ scale: [1, 1.3, 1], rotate: 360 }}
            transition={{ duration: 0.3 }}
          />
          {/* Magic trail */}
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full"
              style={{ backgroundColor: trailColor, left: '50%', top: '50%' }}
              initial={{ x: 0, y: 0, opacity: 0.8 }}
              animate={{ x: -15 - i * 8, y: 10 + i * 5, opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.2, delay: i * 0.03 }}
            />
          ))}
        </div>
      ) : (
        <motion.div
          className="w-10 h-3 rounded-full"
          style={{
            background: `linear-gradient(90deg, transparent 10%, ${color}, ${trailColor}, transparent 90%)`,
            boxShadow: `0 0 15px ${color}`,
            transform: 'rotate(-30deg)',
          }}
          animate={{ scaleX: [1, 1.5, 1] }}
          transition={{ duration: 0.15, repeat: 1 }}
        />
      )}
    </motion.div>
  );
};

// Attack projectile from opponent to player (top-right to bottom-left)
const OpponentAttackProjectile = ({ isCrit, onComplete }) => {
  const color = '#ef4444';
  const trailColor = '#fca5a5';

  return (
    <motion.div
      className="absolute pointer-events-none z-30"
      initial={{ top: '25%', right: '15%', scale: 0.5, opacity: 1 }}
      animate={{
        top: '60%',
        right: '75%',
        scale: isCrit ? 1.5 : 1,
        opacity: [1, 1, 0.8]
      }}
      transition={{ duration: 0.35, ease: 'easeIn' }}
      onAnimationComplete={onComplete}
    >
      <div className="relative">
        <motion.div
          className="w-8 h-8 rounded-full"
          style={{
            background: `radial-gradient(circle, #fff 0%, ${color} 40%, ${trailColor} 70%, transparent 100%)`,
            boxShadow: `0 0 ${isCrit ? 30 : 20}px ${color}`,
          }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 0.2 }}
        />
        {/* Impact particles */}
        {isCrit && [...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full"
            style={{
              backgroundColor: color,
              left: '50%',
              top: '50%',
            }}
            initial={{ x: 0, y: 0, opacity: 1 }}
            animate={{
              x: Math.cos(i * 60 * Math.PI / 180) * 30,
              y: Math.sin(i * 60 * Math.PI / 180) * 30,
              opacity: 0,
              scale: 0
            }}
            transition={{ duration: 0.3 }}
          />
        ))}
      </div>
    </motion.div>
  );
};

// Impact effect at hit location
const ImpactEffect = ({ color, position, isPlayer }) => (
  <motion.div
    className="absolute w-16 h-16 pointer-events-none z-40"
    style={{
      left: position?.x || (isPlayer ? '15%' : '75%'),
      top: position?.y || (isPlayer ? '55%' : '30%'),
      transform: 'translate(-50%, -50%)',
    }}
    initial={{ scale: 0, opacity: 1 }}
    animate={{ scale: [0, 1.5, 2], opacity: [1, 0.8, 0] }}
    transition={{ duration: 0.3 }}
  >
    <div
      className="absolute inset-0 rounded-full border-4"
      style={{ borderColor: color }}
    />
    <motion.div
      className="absolute inset-2 rounded-full"
      style={{ background: `radial-gradient(circle, ${color} 0%, transparent 70%)` }}
      animate={{ scale: [1, 0.5], opacity: [1, 0] }}
      transition={{ duration: 0.2 }}
    />
  </motion.div>
);

// Health bar component - compact version for inline display
const HealthBar = ({ current, max, label, isPlayer }) => {
  const percent = Math.max(0, Math.min(100, (current / max) * 100));

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        <span className={`text-xs font-medium ${isPlayer ? 'text-green-400' : 'text-red-400'}`}>
          {label}
        </span>
        <span className="text-xs text-white/70">
          {current.toLocaleString()} / {max.toLocaleString()}
        </span>
      </div>
      <div className="h-4 bg-black/50 rounded-full overflow-hidden border border-white/20">
        <motion.div
          className={`h-full relative ${isPlayer ? 'bg-gradient-to-r from-green-500 to-emerald-400' : 'bg-gradient-to-r from-red-500 to-orange-400'}`}
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

// Weapon cooldown indicator component
const CooldownIndicator = ({ progress, weaponName, cooldownMs, canAttack }) => {
  const percentage = Math.min(100, progress * 100);

  return (
    <div className="w-full max-w-xs mx-auto mt-3">
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-white/60 font-medium flex items-center gap-1">
          <Swords className="w-3 h-3" />
          {weaponName || 'Attack'}
        </span>
        {canAttack ? (
          <span className="text-green-400 font-bold animate-pulse">READY!</span>
        ) : (
          <span className="text-white/40">{Math.ceil((1 - progress) * cooldownMs)}ms</span>
        )}
      </div>
      <div className="h-2.5 bg-black/60 rounded-full overflow-hidden border border-white/20">
        <motion.div
          className={`h-full rounded-full ${
            canAttack
              ? 'bg-gradient-to-r from-green-500 to-emerald-400'
              : 'bg-gradient-to-r from-blue-500 to-purple-500'
          }`}
          style={{ width: `${percentage}%` }}
          animate={canAttack ? { opacity: [1, 0.7, 1] } : {}}
          transition={canAttack ? { duration: 0.5, repeat: Infinity } : {}}
        />
      </div>
    </div>
  );
};

// Ability cooldown indicator component
const AbilityCooldownIndicator = ({ ability, lastUsedTime, canUse }) => {
  const [progress, setProgress] = useState(canUse ? 1 : 0);

  useEffect(() => {
    if (!ability || canUse) {
      setProgress(1);
      return;
    }

    const interval = setInterval(() => {
      const elapsed = Date.now() - lastUsedTime;
      const prog = Math.min(1, elapsed / ability.cooldown);
      setProgress(prog);
    }, 50);

    return () => clearInterval(interval);
  }, [ability, lastUsedTime, canUse]);

  if (!ability) return null;

  const percentage = Math.min(100, progress * 100);
  const remainingMs = Math.max(0, ability.cooldown - (Date.now() - lastUsedTime));

  return (
    <div className="w-full max-w-xs mx-auto mt-2">
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-white/60 font-medium flex items-center gap-1">
          <Sparkles className="w-3 h-3" style={{ color: ability.color }} />
          {ability.name}
        </span>
        {canUse ? (
          <span className="font-bold animate-pulse" style={{ color: ability.color }}>READY!</span>
        ) : (
          <span className="text-white/40">{(remainingMs / 1000).toFixed(1)}s</span>
        )}
      </div>
      <div className="h-2 bg-black/60 rounded-full overflow-hidden border border-white/20">
        <motion.div
          className="h-full rounded-full"
          style={{
            width: `${percentage}%`,
            background: canUse
              ? `linear-gradient(90deg, ${ability.color}, ${ability.trailColor || ability.color})`
              : 'linear-gradient(90deg, #4b5563, #6b7280)',
          }}
          animate={canUse ? { opacity: [1, 0.6, 1] } : {}}
          transition={canUse ? { duration: 0.5, repeat: Infinity } : {}}
        />
      </div>
    </div>
  );
};

// Queue waiting screen
const QueueScreen = ({ onCancel }) => {
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
    setOnIncomingAttack,
  } = usePvpArenaStore();

  const { level, equipped, characterGender, dyeColors, skinTone, prestige, currentTier } = useAvatarStore();
  const { activePet } = usePetStore();

  // Elemental abilities
  const {
    equippedAbilities,
    getEquippedAbility,
    useAbility: useElementalAbility,
    isAbilityReady: isElementalAbilityReady,
    getCooldownProgress: getElementalCooldownProgress,
  } = useElementalAbilityStore();

  const [damageNumbers, setDamageNumbers] = useState([]);
  const combatCanvasRef = useRef(null);
  const [weaponCooldown, setWeaponCooldown] = useState(0);
  const [cooldownProgress, setCooldownProgress] = useState(1);
  const [isAttackReady, setIsAttackReady] = useState(true);
  const [abilityLastUsed, setAbilityLastUsed] = useState(0);
  const [isAbilityAnimating, setIsAbilityAnimating] = useState(false);
  const [activeAbilityAnimation, setActiveAbilityAnimation] = useState(null);
  const [hitCount, setHitCount] = useState(0);
  const [critCount, setCritCount] = useState(0);
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

  // Weapon cooldown (from weapon or default 500ms)
  const weaponCooldownMs = weapon?.stats?.attackSpeed || 500;

  // Weapon cooldown timer - track progress for UI
  useEffect(() => {
    if (weaponCooldown > 0) {
      setIsAttackReady(false);
      cooldownIntervalRef.current = setInterval(() => {
        setWeaponCooldown(prev => {
          const next = Math.max(0, prev - 50);
          setCooldownProgress(1 - (next / weaponCooldownMs));
          if (next === 0) {
            setIsAttackReady(true);
          }
          return next;
        });
      }, 50);
    }
    return () => {
      if (cooldownIntervalRef.current) clearInterval(cooldownIntervalRef.current);
    };
  }, [weaponCooldown > 0, weaponCooldownMs]);

  // Register incoming attack handler for CombatCanvas effects
  const damageIdRef = useRef(0);
  useEffect(() => {
    if (!isInMatch) return;

    const handleIncomingAttack = (attackData) => {
      const { type, damage, isCrit, element, attackType, abilityId } = attackData;

      // Calculate positions - opponent attacks come FROM top area TO bottom (player)
      const width = window.innerWidth;
      const height = window.innerHeight;
      const opponentX = width * 0.5;  // Opponent is centered at top
      const opponentY = height * 0.25;
      const playerX = width * 0.5;    // Player is centered at bottom
      const playerY = height * 0.7;

      // Show damage number when attack impacts
      const showIncomingDamage = () => {
        const id = damageIdRef.current++;
        const randomX = 40 + Math.random() * 20; // Centered around player
        const randomY = 55 + Math.random() * 10;
        setDamageNumbers(prev => [...prev, {
          id,
          damage,
          x: `${randomX}%`,
          y: `${randomY}%`,
          isCrit,
          isPlayer: false, // Red color for damage TO player
        }]);
        // Shake screen
        triggerShake(isCrit ? 'heavy' : 'normal');
        // Play hit sound
        if (isCrit) {
          sounds.criticalHit?.();
        } else {
          sounds.attackHit?.();
        }
        // Clean up damage number
        setTimeout(() => {
          setDamageNumbers(prev => prev.filter(d => d.id !== id));
        }, isCrit ? 1000 : 600);
      };

      if (type === 'ability' && abilityId && combatCanvasRef.current) {
        // Play ability effect at player's position (incoming from opponent)
        // Pass isIncoming=true so projectiles come FROM opponent TO player
        combatCanvasRef.current.playAbility(abilityId, playerX, playerY, showIncomingDamage, true);
      } else if (combatCanvasRef.current) {
        // Comprehensive attack direction mapping for incoming attacks
        //
        // Attack types fall into these categories:
        // 1. Direction-agnostic (centered on target) - work fine in any direction
        //    Examples: cleave, spin_attack, punch, fireball, arcane_blast, etc.
        // 2. Upward attacks - need to be mapped to downward equivalents
        // 3. Uses actual coordinates - work correctly with swapped start/target
        //    Examples: slash, thrust (these use startX/Y → targetX/Y)
        //
        // Directional attacks that need mapping for incoming (from opponent above):
        const incomingAttackMap = {
          // Upward attacks → downward equivalents
          'rising_slash': 'falling_slash',
          'uppercut': 'overhead_slam',
          // Horizontal thrusts - keep as-is (centered on target)
          'lunge': 'thrust',
          'quick_stab': 'quick_stab',
          'rapid_stab': 'rapid_stab',
          // These are fine as-is since they're centered on target:
          // cleave, spin_attack, smash, punch, kick, arcane_blast, magic_missile,
          // fireball, x_slash, combo, flurry, backstab, critical_hit, etc.
        };

        let incomingAttackType = attackType || 'slash';
        if (incomingAttackMap[incomingAttackType]) {
          incomingAttackType = incomingAttackMap[incomingAttackType];
        }

        // Play weapon attack effect from opponent to player
        combatCanvasRef.current.playWeaponAttack({
          element: element || 'physical',
          attackType: incomingAttackType,
          startX: opponentX,
          startY: opponentY,
          targetX: playerX,
          targetY: playerY,
          onImpact: showIncomingDamage,
        });
      } else {
        // Fallback if CombatCanvas not ready
        showIncomingDamage();
      }
    };

    setOnIncomingAttack(handleIncomingAttack);

    return () => {
      setOnIncomingAttack(null);
    };
  }, [isInMatch, setOnIncomingAttack, triggerShake]);

  // Handle tap attack
  const handleAttack = useCallback(async () => {
    if (!isInMatch || !userId || matchResult || !isAttackReady) return;

    // Start cooldown
    setWeaponCooldown(weaponCooldownMs);
    setCooldownProgress(0);

    const isCrit = Math.random() < 0.1; // 10% crit chance
    const damage = isCrit ? Math.floor(damagePerTap * 1.5) : damagePerTap;

    // Track stats
    setHitCount(prev => prev + 1);
    if (isCrit) setCritCount(prev => prev + 1);

    // Play sound
    if (isCrit) {
      sounds.criticalHit?.();
    } else {
      sounds.attackHit?.();
    }

    // Get weapon element and attack type for visual effects
    const weaponElement = weapon?.element || 'physical';

    // Map weapon types to appropriate attack visuals
    // This ensures the right animation plays for each weapon category
    const getAttackTypeFromWeapon = (wpn) => {
      if (wpn?.attackType) return wpn.attackType;
      const wType = wpn?.weaponType;
      switch (wType) {
        case 'sword': return 'slash';
        case 'axe': return 'cleave';
        case 'hammer': case 'mace': return 'smash';
        case 'dagger': return 'quick_stab';
        case 'spear': case 'polearm': return 'thrust';
        case 'staff': return 'arcane_blast';
        case 'wand': return 'magic_missile';
        case 'bow': case 'crossbow': return 'fireball'; // projectile
        case 'fist': case 'glove': return 'punch';
        default: return 'slash';
      }
    };
    const attackType = getAttackTypeFromWeapon(weapon);

    // Calculate positions - player attacks go FROM bottom TO top (opponent)
    const width = window.innerWidth;
    const height = window.innerHeight;
    const playerX = width * 0.5;      // Player is centered at bottom
    const playerY = height * 0.7;
    const opponentX = width * 0.5;    // Opponent is centered at top
    const opponentY = height * 0.25;

    // Show damage number when attack impacts
    const showDamageOnImpact = () => {
      const id = damageIdRef.current++;
      const randomX = 40 + Math.random() * 20; // Centered around opponent
      const randomY = 20 + Math.random() * 10;
      setDamageNumbers(prev => [...prev, {
        id,
        damage,
        x: `${randomX}%`,
        y: `${randomY}%`,
        isCrit,
        isPlayer: true, // Green color for damage TO opponent
      }]);
      // Shake screen on hit
      triggerShake(isCrit ? 'heavy' : 'light');
      // Clean up damage number
      setTimeout(() => {
        setDamageNumbers(prev => prev.filter(d => d.id !== id));
      }, isCrit ? 1000 : 600);
    };

    // Use CombatCanvas for weapon attack visual
    if (combatCanvasRef.current) {
      combatCanvasRef.current.playWeaponAttack({
        element: weaponElement,
        attackType,
        startX: playerX,
        startY: playerY,
        targetX: opponentX,
        targetY: opponentY,
        onImpact: showDamageOnImpact,
      });
    } else {
      // Fallback if CombatCanvas not ready
      setTimeout(showDamageOnImpact, 350);
    }

    // Send attack to opponent with visual data
    await attack(userId, damage, isCrit, {
      element: weaponElement,
      attackType,
      weaponColor: weapon?.color || '#22c55e',
    });
  }, [isInMatch, userId, matchResult, damagePerTap, attack, triggerShake, weapon, isAttackReady, weaponCooldownMs]);

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

  // Handle elemental ability use
  const handleElementalAbility = useCallback(async (slot) => {
    if (!isInMatch || !userId || matchResult) return;
    if (!isElementalAbilityReady(slot)) return;

    const ability = useElementalAbility(slot);
    if (!ability) return;

    // Play PixiJS effect via CombatCanvas
    if (combatCanvasRef.current) {
      combatCanvasRef.current.playAbility(ability.id, window.innerWidth / 2, 150);
    }

    // Play sound
    if (sounds.powerAttack) {
      sounds.powerAttack();
    }

    // Calculate damage
    const abilityDamage = calcElementalDamage(ability, damagePerTap);

    // Trigger screen shake
    triggerShake('heavy');

    // Show damage number
    const id = Date.now();
    setDamageNumbers(prev => [
      ...prev,
      {
        id,
        damage: abilityDamage,
        x: '50%',
        y: '25%',
        isCrit: true,
        isPlayer: true,
      },
    ]);

    // Send ability damage to opponent
    await useAbility(userId, ability, abilityDamage);

    // Clean up damage number
    setTimeout(() => {
      setDamageNumbers(prev => prev.filter(d => d.id !== id));
    }, 1000);
  }, [isInMatch, userId, matchResult, isElementalAbilityReady, useElementalAbility, damagePerTap, triggerShake, useAbility]);

  // NOTE: Incoming attacks are now handled via CombatCanvas in the onIncomingAttack callback
  // registered above. The store broadcasts attack data which triggers playWeaponAttack()
  // with reversed coordinates (opponent → player direction).

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

        {/* PixiJS Combat Canvas for effects - must be above all battle content */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 200 }}>
          <CombatCanvas
            ref={combatCanvasRef}
            width={window.innerWidth}
            height={window.innerHeight}
            className="w-full h-full"
          />
        </div>

        {/* Battle Area */}
        <div
          onClick={handleAttack}
          className="flex-1 relative cursor-crosshair select-none flex flex-col"
          style={{ touchAction: 'manipulation' }}
        >
          {/* Opponent Section - Top */}
          <div className="flex-1 flex flex-col items-center justify-center relative pt-4">
            {/* Opponent name and difficulty */}
            <div className="text-center mb-2">
              <h2 className="text-2xl font-black text-white drop-shadow-lg">
                {opponentProfile?.display_name || 'Opponent'}
              </h2>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-red-500/30 text-red-400">
                Level {opponentProfile?.current_level || opponentLevel || '?'}
              </span>
            </div>

            {/* Opponent health bar - inline */}
            <div className="w-full max-w-sm mb-4 px-4">
              <HealthBar
                current={opponentHealth}
                max={opponentMaxHealth}
                label="OPPONENT HP"
                isPlayer={false}
              />
            </div>

            {/* Opponent Avatar */}
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="relative"
            >
              {/* Glow effect behind opponent */}
              <div className="absolute inset-0 bg-red-500/30 rounded-full blur-xl scale-150" />
              {/* Animated bounce */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="relative"
              >
                {/* Render opponent's full avatar if they have equipment data */}
                {opponentProfile?.equipped_items ? (
                  <div className="w-32 h-32 sm:w-40 sm:h-40">
                    <AvatarRenderer
                      size={160}
                      animate={true}
                      externalEquipped={opponentProfile.equipped_items}
                      externalCharacterGender={opponentProfile.character_gender}
                      externalLevel={opponentProfile.current_level}
                      externalPrestige={opponentProfile.prestige}
                      externalTier={opponentProfile.current_tier}
                      externalDyeColors={opponentProfile.dye_colors}
                      externalSkinTone={opponentProfile.skin_tone}
                    />
                  </div>
                ) : (
                  /* Fallback if no equipment data */
                  <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gradient-to-br from-red-900/50 to-orange-900/50 border-4 border-red-500/50 flex items-center justify-center">
                    <div className="text-center">
                      <Swords className="w-12 h-12 text-red-400 mx-auto mb-1" />
                      <span className="text-2xl font-black text-red-400">
                        {opponentProfile?.display_name?.[0]?.toUpperCase() || '?'}
                      </span>
                    </div>
                  </div>
                )}
                {/* Enemy indicator ring */}
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-red-400/50 pointer-events-none"
                  animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              </motion.div>
            </motion.div>
          </div>

          {/* VS Divider */}
          <div className="flex items-center gap-3 px-8 py-2">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-3xl font-black text-red-500/50"
            >
              VS
            </motion.div>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
          </div>

          {/* Player Section - Bottom */}
          <div className="flex-1 flex flex-col items-center justify-center relative">
            {/* Player health bar - inline */}
            <div className="w-full max-w-sm mb-4 px-4">
              <HealthBar
                current={myHealth}
                max={myMaxHealth}
                label="YOUR HP"
                isPlayer={true}
              />
            </div>

            {/* Player Avatar - Full size like opponent */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="relative"
            >
              {/* Glow effect behind player */}
              <div className="absolute inset-0 bg-green-500/30 rounded-full blur-xl scale-150" />
              {/* Animated bounce */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="relative"
              >
                <div className="w-32 h-32 sm:w-40 sm:h-40">
                  <AvatarRenderer
                    size={160}
                    animate={true}
                  />
                </div>
                {/* Player indicator ring */}
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-green-400/50 pointer-events-none"
                  animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              </motion.div>
              {/* Player label */}
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-green-600 to-emerald-500 rounded-full text-sm font-bold text-white shadow-lg whitespace-nowrap"
              >
                {myProfile?.display_name || 'YOU'}
              </motion.div>
            </motion.div>

            {/* Player name and level */}
            <div className="text-center mt-4">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-green-500/30 text-green-400">
                Level {level}
              </span>
            </div>

            {/* Combat stats row */}
            <div className="flex items-center gap-4 mt-2 text-sm">
              <div className="flex items-center gap-1.5 text-yellow-400">
                <Swords className="w-4 h-4" />
                <span className="font-bold">{damagePerTap}</span>
                <span className="text-white/40 text-xs">DMG</span>
              </div>
              <div className="flex items-center gap-1.5 text-white/50">
                <span className="font-medium">{hitCount} hits</span>
              </div>
              {critCount > 0 && (
                <div className="flex items-center gap-1.5 text-orange-400">
                  <Sparkles className="w-4 h-4" />
                  <span className="font-bold">{critCount}</span>
                  <span className="text-white/40 text-xs">CRITS</span>
                </div>
              )}
            </div>

            {/* Weapon info badge */}
            <div className="mt-1 text-xs text-white/40 flex items-center gap-2">
              <span
                className="px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: `${weapon?.color || '#ffffff'}20`,
                  color: weapon?.color || '#ffffff',
                }}
              >
                {weapon?.name || 'Fists'}
              </span>
              <span>×{weapon?.stats?.damageMultiplier?.toFixed(1) || '1.0'}</span>
              <span>{weaponCooldownMs}ms</span>
            </div>
          </div>

          {/* Attack and Ability Buttons */}
          <div className="px-4 pb-2 flex flex-col items-center gap-3">
            <div className="flex gap-3">
              {/* Attack Button */}
              <motion.button
                onClick={(e) => { e.stopPropagation(); handleAttack(); }}
                disabled={!isAttackReady}
                whileHover={isAttackReady ? { scale: 1.05 } : {}}
                whileTap={isAttackReady ? { scale: 0.95 } : {}}
                className={`px-6 py-3 rounded-2xl font-bold text-base transition-all ${
                  isAttackReady
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/30 cursor-pointer'
                    : 'bg-gray-700/50 text-gray-400 cursor-not-allowed'
                }`}
                style={{ touchAction: 'manipulation' }}
              >
                <div className="flex items-center gap-2">
                  <Swords className="w-5 h-5" />
                  <span>{weapon?.attackName || 'Attack'}</span>
                </div>
              </motion.button>

              {/* Weapon Ability Button */}
              {weaponAbility && (
                <motion.button
                  onClick={(e) => { e.stopPropagation(); handleWeaponAbility(); }}
                  disabled={!canUseAbility}
                  whileHover={canUseAbility ? { scale: 1.05 } : {}}
                  whileTap={canUseAbility ? { scale: 0.95 } : {}}
                  className={`px-6 py-3 rounded-2xl font-bold text-base transition-all ${
                    canUseAbility
                      ? 'text-white shadow-lg cursor-pointer'
                      : 'bg-gray-700/50 text-gray-400 cursor-not-allowed'
                  }`}
                  style={{
                    touchAction: 'manipulation',
                    background: canUseAbility
                      ? `linear-gradient(135deg, ${weaponAbility.color}, ${weaponAbility.trailColor || weaponAbility.color})`
                      : undefined,
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    <span>{weaponAbility.name}</span>
                  </div>
                </motion.button>
              )}
            </div>

            {/* Elemental Ability Slots */}
            {equippedAbilities.some(a => a !== null) && (
              <div className="flex gap-2 justify-center">
                {equippedAbilities.map((abilityId, slot) => {
                  if (!abilityId) return null;
                  const ability = getEquippedAbility(slot);
                  if (!ability) return null;

                  const isReady = isElementalAbilityReady(slot);
                  const progress = getElementalCooldownProgress(slot);

                  return (
                    <motion.button
                      key={slot}
                      onClick={(e) => { e.stopPropagation(); handleElementalAbility(slot); }}
                      disabled={!isReady}
                      whileHover={isReady ? { scale: 1.05 } : {}}
                      whileTap={isReady ? { scale: 0.95 } : {}}
                      className="relative p-2 rounded-xl transition-all"
                      style={{
                        touchAction: 'manipulation',
                        background: isReady
                          ? `linear-gradient(135deg, ${ability.elementColor}cc, ${ability.elementColor}66)`
                          : 'rgba(55, 65, 81, 0.5)',
                        borderColor: isReady ? ability.elementColor : 'transparent',
                        borderWidth: '2px',
                        boxShadow: isReady ? `0 0 15px ${ability.elementColor}60` : 'none',
                        minWidth: '60px',
                      }}
                    >
                      {/* Cooldown overlay */}
                      {!isReady && (
                        <div
                          className="absolute inset-0 rounded-xl overflow-hidden"
                          style={{
                            background: `linear-gradient(to top, transparent ${progress * 100}%, rgba(0,0,0,0.6) ${progress * 100}%)`,
                          }}
                        />
                      )}
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-xl">{ability.icon}</span>
                        <span className={`text-xs font-bold ${isReady ? 'text-white' : 'text-gray-400'}`}>
                          {ability.name.split(' ')[0]}
                        </span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            )}

            {/* Cooldown indicators */}
            <div className="w-full max-w-xs">
              <CooldownIndicator
                progress={cooldownProgress}
                weaponName={weapon?.attackName || 'Attack'}
                cooldownMs={weaponCooldownMs}
                canAttack={isAttackReady}
              />
              {weaponAbility && (
                <AbilityCooldownIndicator
                  ability={weaponAbility}
                  lastUsedTime={abilityLastUsed}
                  canUse={canUseAbility}
                />
              )}
            </div>
          </div>

          {/* NOTE: Attack projectiles and impact effects are now rendered via CombatCanvas
              using playWeaponAttack() with proper start/target coordinates for both
              outgoing (player→opponent) and incoming (opponent→player) attacks */}

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

      </div>
    </div>
  );
}
