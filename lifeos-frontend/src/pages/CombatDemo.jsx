import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CombatCanvas from '../components/combat/CombatCanvas';
import AvatarRenderer from '../components/avatar/AvatarRenderer';
import AbilityIcon, { AbilityIconInline } from '../components/ui/AbilityIcon';
import { useAvatarStore } from '../stores/avatarStore';
import { playBossAttack, bossAttackSounds, weaponAttackSounds } from '../services/combatSounds';
import { BOSS_DATABASE as REAL_BOSS_DATABASE } from '../data/bossDatabase';
import { ELEMENTAL_ABILITIES } from '../data/elementalAbilities';

// Boss database for demo - includes sprites from real database
const BOSS_DATABASE = {
  shadow_slime: {
    id: 'shadow_slime',
    name: 'Shadow Slime',
    attackAnimation: 'bounce',
    attackName: 'Despair Glob',
    attackColor: '#6b21a8',
    icon: '🟣',
    difficulty: 'Easy',
    sprite: '/assets/bosses/boss_shadow_slime.png',
  },
  goblin_chief: {
    id: 'goblin_chief',
    name: 'Goblin Chief',
    attackAnimation: 'stab',
    attackName: 'Distraction Dagger',
    attackColor: '#84cc16',
    icon: '👺',
    difficulty: 'Easy',
    sprite: '/assets/bosses/boss_goblin_chief.png',
  },
  skeleton_knight: {
    id: 'skeleton_knight',
    name: 'Skeleton Knight',
    attackAnimation: 'slash',
    attackName: 'Oath Breaker',
    attackColor: '#94a3b8',
    icon: '💀',
    difficulty: 'Normal',
    sprite: '/assets/bosses/boss_skeleton_knight.png',
  },
  forest_troll: {
    id: 'forest_troll',
    name: 'Forest Troll',
    attackAnimation: 'smash',
    attackName: 'Excuse Avalanche',
    attackColor: '#65a30d',
    icon: '🧌',
    difficulty: 'Normal',
    sprite: '/assets/bosses/boss_forest_troll.png',
  },
  stone_golem: {
    id: 'stone_golem',
    name: 'Stone Golem',
    attackAnimation: 'pound',
    attackName: 'Stagnation Slam',
    attackColor: '#78716c',
    icon: '🗿',
    difficulty: 'Hard',
    sprite: '/assets/bosses/boss_stone_golem.png',
  },
  flame_demon: {
    id: 'flame_demon',
    name: 'Flame Demon',
    attackAnimation: 'fireball',
    attackName: 'Burnout Blaze',
    attackColor: '#ef4444',
    icon: '😈',
    difficulty: 'Hard',
    sprite: '/assets/bosses/boss_flame_demon.png',
  },
  ice_drake: {
    id: 'ice_drake',
    name: 'Ice Drake',
    attackAnimation: 'breath',
    attackName: 'Comfort Zone Freeze',
    attackColor: '#22d3ee',
    icon: '🐉',
    difficulty: 'Epic',
    sprite: '/assets/bosses/boss_ice_drake.png',
  },
  dark_wizard: {
    id: 'dark_wizard',
    name: 'Dark Wizard',
    attackAnimation: 'spell',
    attackName: 'Imposter Hex',
    attackColor: '#7c3aed',
    icon: '🧙',
    difficulty: 'Epic',
    sprite: '/assets/bosses/boss_dark_wizard.png',
  },
  void_watcher: {
    id: 'void_watcher',
    name: 'Void Watcher',
    attackAnimation: 'tentacle',
    attackName: 'Timeline Terror',
    attackColor: '#1e1b4b',
    icon: '👁️',
    difficulty: 'Legendary',
    sprite: '/assets/bosses/boss_void_watcher.png',
  },
  dragon_lord: {
    id: 'dragon_lord',
    name: 'Dragon Lord',
    attackAnimation: 'dragonfire',
    attackName: "Destiny's Wrath",
    attackColor: '#fbbf24',
    icon: '🐲',
    difficulty: 'Legendary',
    sprite: '/assets/bosses/boss_dragon_lord.png',
  },
};

// Player attack projectile for demo arena - element-specific visuals
const PlayerProjectile = ({ onComplete, color = '#22c55e', element = 'physical', abilityId = null }) => {
  // Render different projectile based on element
  const renderProjectileContent = () => {
    switch (element) {
      case 'fire':
        return (
          <div className="relative">
            {/* Fire core */}
            <motion.div
              className="w-12 h-12 rounded-full"
              style={{
                background: 'radial-gradient(circle, #fff 0%, #fbbf24 20%, #ef4444 50%, #991b1b 80%, transparent 100%)',
                boxShadow: '0 0 30px #ef4444, 0 0 60px #f97316',
              }}
              animate={{ scale: [1, 1.4, 1], rotate: [0, 180, 360] }}
              transition={{ duration: 0.3, repeat: 1 }}
            />
            {/* Flame particles */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-3 h-3 rounded-full"
                style={{
                  background: i % 2 === 0 ? '#fbbf24' : '#ef4444',
                  top: '50%',
                  left: '50%',
                }}
                initial={{ x: 0, y: 0, opacity: 1 }}
                animate={{
                  x: Math.cos(i * 60 * Math.PI / 180) * 20,
                  y: Math.sin(i * 60 * Math.PI / 180) * 20 - 10,
                  opacity: 0,
                  scale: 0,
                }}
                transition={{ duration: 0.3, delay: i * 0.03 }}
              />
            ))}
          </div>
        );

      case 'ice':
        return (
          <div className="relative">
            {/* Ice crystal core */}
            <motion.div
              className="w-10 h-10"
              style={{
                background: 'linear-gradient(135deg, #fff 0%, #67e8f9 30%, #22d3ee 60%, #0891b2 100%)',
                clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
                boxShadow: '0 0 20px #22d3ee, 0 0 40px #67e8f9',
              }}
              animate={{ rotate: [0, 90, 180, 270, 360], scale: [1, 1.2, 1] }}
              transition={{ duration: 0.4 }}
            />
            {/* Ice shards */}
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-6"
                style={{
                  background: 'linear-gradient(to bottom, #fff, #22d3ee)',
                  top: '50%',
                  left: '50%',
                  transformOrigin: 'center',
                }}
                initial={{ rotate: i * 90, x: -4, y: -12, opacity: 1 }}
                animate={{ scale: [1, 1.5, 0], opacity: [1, 1, 0] }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              />
            ))}
          </div>
        );

      case 'lightning':
        return (
          <div className="relative">
            {/* Lightning bolt core */}
            <motion.div
              className="w-14 h-14 flex items-center justify-center text-3xl"
              style={{
                filter: 'drop-shadow(0 0 10px #fbbf24) drop-shadow(0 0 20px #f59e0b)',
              }}
              animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
              transition={{ duration: 0.15, repeat: 2 }}
            >
              ⚡
            </motion.div>
            {/* Electric sparks */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-4"
                style={{
                  background: '#fbbf24',
                  boxShadow: '0 0 5px #fbbf24',
                  top: '50%',
                  left: '50%',
                }}
                initial={{ rotate: i * 45, x: -2, y: -8, opacity: 1 }}
                animate={{
                  scaleY: [1, 2, 0],
                  opacity: [1, 1, 0],
                }}
                transition={{ duration: 0.2, delay: i * 0.02 }}
              />
            ))}
          </div>
        );

      case 'dark':
        return (
          <div className="relative">
            {/* Dark void core */}
            <motion.div
              className="w-12 h-12 rounded-full"
              style={{
                background: 'radial-gradient(circle, #1e1b4b 0%, #4c1d95 40%, #7c3aed 70%, transparent 100%)',
                boxShadow: '0 0 30px #7c3aed, 0 0 60px #4c1d95, inset 0 0 20px #000',
              }}
              animate={{ scale: [1, 1.3, 1], rotate: [0, -180, -360] }}
              transition={{ duration: 0.4 }}
            />
            {/* Shadow tendrils */}
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-8 rounded-full"
                style={{
                  background: 'linear-gradient(to bottom, #7c3aed, transparent)',
                  top: '50%',
                  left: '50%',
                  transformOrigin: 'top center',
                }}
                initial={{ rotate: i * 72 - 90, x: -4, y: 0, opacity: 0.8 }}
                animate={{ scaleY: [1, 1.5, 0], opacity: [0.8, 0.5, 0] }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
              />
            ))}
          </div>
        );

      case 'holy':
        return (
          <div className="relative">
            {/* Holy light core */}
            <motion.div
              className="w-12 h-12 rounded-full"
              style={{
                background: 'radial-gradient(circle, #fff 0%, #fef3c7 30%, #fcd34d 60%, #f59e0b 100%)',
                boxShadow: '0 0 40px #fef3c7, 0 0 80px #fcd34d',
              }}
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ duration: 0.3 }}
            />
            {/* Light rays */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-10"
                style={{
                  background: 'linear-gradient(to bottom, #fff, #fcd34d, transparent)',
                  top: '50%',
                  left: '50%',
                  transformOrigin: 'top center',
                }}
                initial={{ rotate: i * 45, x: -2, y: 0, opacity: 1 }}
                animate={{ scaleY: [1, 1.8, 0], opacity: [1, 0.8, 0] }}
                transition={{ duration: 0.35, delay: i * 0.03 }}
              />
            ))}
            {/* Cross shape */}
            <motion.div
              className="absolute top-1/2 left-1/2 text-2xl"
              style={{ transform: 'translate(-50%, -50%)', filter: 'drop-shadow(0 0 5px #fff)' }}
              animate={{ scale: [0, 1.5, 0], opacity: [0, 1, 0] }}
              transition={{ duration: 0.4 }}
            >
              ✨
            </motion.div>
          </div>
        );

      case 'earth':
        return (
          <div className="relative">
            {/* Rock core */}
            <motion.div
              className="w-10 h-10"
              style={{
                background: 'linear-gradient(135deg, #78716c 0%, #57534e 50%, #44403c 100%)',
                clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)',
                boxShadow: '0 0 15px #78716c',
              }}
              animate={{ rotate: [0, 45, 90], scale: [1, 1.2, 1] }}
              transition={{ duration: 0.35 }}
            />
            {/* Rock debris */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-3 h-3"
                style={{
                  background: i % 2 === 0 ? '#78716c' : '#a8a29e',
                  clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
                  top: '50%',
                  left: '50%',
                }}
                initial={{ x: 0, y: 0, opacity: 1 }}
                animate={{
                  x: Math.cos(i * 60 * Math.PI / 180) * 25,
                  y: Math.sin(i * 60 * Math.PI / 180) * 25,
                  opacity: 0,
                  rotate: 180,
                }}
                transition={{ duration: 0.3, delay: i * 0.03 }}
              />
            ))}
          </div>
        );

      case 'wind':
        return (
          <div className="relative">
            {/* Wind spiral */}
            <motion.div
              className="w-14 h-14 flex items-center justify-center text-3xl"
              style={{ filter: 'drop-shadow(0 0 10px #2dd4bf)' }}
              animate={{ rotate: [0, 360, 720], scale: [1, 1.3, 1] }}
              transition={{ duration: 0.4 }}
            >
              🌀
            </motion.div>
            {/* Wind streaks */}
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute h-1 rounded-full"
                style={{
                  background: 'linear-gradient(to right, transparent, #2dd4bf, transparent)',
                  width: '30px',
                  top: `${30 + i * 15}%`,
                  left: '50%',
                }}
                initial={{ x: -30, opacity: 0 }}
                animate={{ x: 30, opacity: [0, 1, 0] }}
                transition={{ duration: 0.25, delay: i * 0.05 }}
              />
            ))}
          </div>
        );

      case 'water':
        return (
          <div className="relative">
            {/* Water orb */}
            <motion.div
              className="w-12 h-12 rounded-full"
              style={{
                background: 'radial-gradient(circle at 30% 30%, #fff 0%, #60a5fa 20%, #3b82f6 50%, #1d4ed8 100%)',
                boxShadow: '0 0 20px #3b82f6, 0 0 40px #60a5fa',
              }}
              animate={{ scale: [1, 1.3, 1], y: [0, -5, 0] }}
              transition={{ duration: 0.35 }}
            />
            {/* Water droplets */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-3 rounded-full"
                style={{
                  background: '#60a5fa',
                  top: '50%',
                  left: '50%',
                }}
                initial={{ x: 0, y: 0, opacity: 1 }}
                animate={{
                  x: Math.cos(i * 60 * Math.PI / 180) * 20,
                  y: Math.sin(i * 60 * Math.PI / 180) * 20 + 10,
                  opacity: 0,
                }}
                transition={{ duration: 0.3, delay: i * 0.03 }}
              />
            ))}
          </div>
        );

      case 'poison':
        return (
          <div className="relative">
            {/* Poison blob */}
            <motion.div
              className="w-12 h-12 rounded-full"
              style={{
                background: 'radial-gradient(circle, #86efac 0%, #22c55e 40%, #15803d 70%, #14532d 100%)',
                boxShadow: '0 0 20px #22c55e, 0 0 40px #86efac',
              }}
              animate={{ scale: [1, 1.2, 0.9, 1.1, 1], borderRadius: ['50%', '45%', '55%', '48%', '50%'] }}
              transition={{ duration: 0.4 }}
            />
            {/* Toxic bubbles */}
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-3 h-3 rounded-full border-2"
                style={{
                  borderColor: '#22c55e',
                  background: 'transparent',
                  top: '50%',
                  left: '50%',
                }}
                initial={{ x: 0, y: 0, opacity: 1, scale: 0.5 }}
                animate={{
                  x: (Math.random() - 0.5) * 40,
                  y: -20 - Math.random() * 20,
                  opacity: 0,
                  scale: 1.5,
                }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              />
            ))}
          </div>
        );

      case 'arcane':
        return (
          <div className="relative">
            {/* Arcane orb */}
            <motion.div
              className="w-12 h-12 rounded-full"
              style={{
                background: 'radial-gradient(circle, #fff 0%, #f0abfc 20%, #d946ef 50%, #a21caf 80%, #701a75 100%)',
                boxShadow: '0 0 30px #d946ef, 0 0 60px #f0abfc',
              }}
              animate={{ scale: [1, 1.4, 1], rotate: [0, 180, 360] }}
              transition={{ duration: 0.4 }}
            />
            {/* Magic runes */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-sm"
                style={{
                  color: '#f0abfc',
                  textShadow: '0 0 5px #d946ef',
                  top: '50%',
                  left: '50%',
                }}
                initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
                animate={{
                  x: Math.cos(i * 60 * Math.PI / 180) * 25,
                  y: Math.sin(i * 60 * Math.PI / 180) * 25,
                  opacity: 0,
                  rotate: 180,
                }}
                transition={{ duration: 0.35, delay: i * 0.04 }}
              >
                ✴
              </motion.div>
            ))}
          </div>
        );

      case 'support':
        return (
          <div className="relative">
            {/* Healing/buff aura */}
            <motion.div
              className="w-12 h-12 rounded-full"
              style={{
                background: 'radial-gradient(circle, #fff 0%, #6ee7b7 30%, #10b981 60%, #047857 100%)',
                boxShadow: '0 0 30px #10b981, 0 0 60px #6ee7b7',
              }}
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ duration: 0.4 }}
            />
            {/* Plus signs */}
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-lg font-bold"
                style={{
                  color: '#6ee7b7',
                  textShadow: '0 0 5px #10b981',
                  top: '50%',
                  left: '50%',
                }}
                initial={{ x: 0, y: 0, opacity: 1 }}
                animate={{
                  x: Math.cos(i * 90 * Math.PI / 180) * 20,
                  y: Math.sin(i * 90 * Math.PI / 180) * 20 - 10,
                  opacity: 0,
                  scale: 1.5,
                }}
                transition={{ duration: 0.35, delay: i * 0.05 }}
              >
                +
              </motion.div>
            ))}
          </div>
        );

      case 'ultimate':
        return (
          <div className="relative">
            {/* Ultimate rainbow explosion */}
            <motion.div
              className="w-14 h-14 rounded-full"
              style={{
                background: 'conic-gradient(#ef4444, #f97316, #fbbf24, #22c55e, #3b82f6, #8b5cf6, #ec4899, #ef4444)',
                boxShadow: '0 0 40px #ec4899, 0 0 80px #8b5cf6',
              }}
              animate={{ scale: [1, 1.8, 1], rotate: [0, 360] }}
              transition={{ duration: 0.5 }}
            />
            {/* Multi-color particles */}
            {['#ef4444', '#fbbf24', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'].map((c, i) => (
              <motion.div
                key={i}
                className="absolute w-3 h-3 rounded-full"
                style={{
                  background: c,
                  boxShadow: `0 0 10px ${c}`,
                  top: '50%',
                  left: '50%',
                }}
                initial={{ x: 0, y: 0, opacity: 1 }}
                animate={{
                  x: Math.cos(i * 60 * Math.PI / 180) * 35,
                  y: Math.sin(i * 60 * Math.PI / 180) * 35,
                  opacity: 0,
                  scale: 2,
                }}
                transition={{ duration: 0.4, delay: i * 0.03 }}
              />
            ))}
          </div>
        );

      default: // physical
        return (
          <div className="relative">
            {/* Sword slash */}
            <motion.div
              className="w-16 h-4"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, #e2e8f0 20%, #fff 50%, #e2e8f0 80%, transparent 100%)',
                boxShadow: '0 0 15px #94a3b8',
                borderRadius: '2px',
              }}
              initial={{ rotate: -45, scale: 0.5 }}
              animate={{ rotate: 45, scale: [0.5, 1.5, 1] }}
              transition={{ duration: 0.25 }}
            />
            {/* Slash trail */}
            <motion.div
              className="absolute w-20 h-1 top-1/2 left-1/2"
              style={{
                background: 'linear-gradient(90deg, transparent, #94a3b8, transparent)',
                transform: 'translate(-50%, -50%) rotate(-45deg)',
              }}
              initial={{ scaleX: 0, opacity: 1 }}
              animate={{ scaleX: 1.5, opacity: 0 }}
              transition={{ duration: 0.3 }}
            />
          </div>
        );
    }
  };

  return (
    <motion.div
      className="absolute pointer-events-none z-30"
      initial={{ left: '15%', bottom: '35%', scale: 0.5, opacity: 1 }}
      animate={{ left: '72%', bottom: '52%', scale: 1, opacity: [1, 1, 0.8] }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      onAnimationComplete={onComplete}
    >
      {renderProjectileContent()}
    </motion.div>
  );
};

// Boss attack projectile for demo arena - travels from boss (top-right) to player (bottom-left)
const BossProjectile = ({ boss, onComplete }) => {
  const color = boss?.attackColor || '#ff0000';

  return (
    <motion.div
      className="absolute pointer-events-none z-30"
      initial={{ left: '85%', top: '15%', scale: 0.8, opacity: 1 }}
      animate={{ left: '12%', top: '75%', scale: 1.2, opacity: [1, 1, 1, 0.8] }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      onAnimationComplete={onComplete}
    >
      <motion.div
        className="w-14 h-14 rounded-full"
        style={{
          background: `radial-gradient(circle, #fff 0%, ${color} 30%, ${color}90 60%, transparent 100%)`,
          boxShadow: `0 0 30px ${color}, 0 0 60px ${color}80`,
        }}
        animate={{ scale: [1, 1.3, 1], rotate: [0, 180, 360] }}
        transition={{ duration: 0.5, repeat: 0 }}
      />
      {/* Trail effect */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle, transparent 0%, ${color}40 50%, transparent 100%)`,
        }}
        initial={{ scale: 1 }}
        animate={{ scale: [1, 2, 3], opacity: [0.5, 0.3, 0] }}
        transition={{ duration: 0.4 }}
      />
    </motion.div>
  );
};

// Impact effect
const ImpactEffect = ({ color, position }) => (
  <motion.div
    className="absolute w-20 h-20 pointer-events-none z-40"
    style={{ left: position.x, top: position.y, transform: 'translate(-50%, -50%)' }}
    initial={{ scale: 0, opacity: 1 }}
    animate={{ scale: [0, 2, 2.5], opacity: [1, 0.8, 0] }}
    transition={{ duration: 0.4 }}
  >
    <div className="absolute inset-0 rounded-full border-4" style={{ borderColor: color }} />
    <motion.div
      className="absolute inset-4 rounded-full"
      style={{ background: `radial-gradient(circle, ${color} 0%, transparent 70%)` }}
    />
  </motion.div>
);

// Damage number
const DamageNumber = ({ damage, x, y, isCrit, color }) => (
  <motion.div
    initial={{ opacity: 1, y: 0, scale: isCrit ? 1.5 : 1 }}
    animate={{ opacity: 0, y: -50, scale: isCrit ? 2 : 1.3 }}
    transition={{ duration: 0.8 }}
    className="absolute pointer-events-none font-black text-2xl"
    style={{ left: x, top: y, color, textShadow: `0 0 10px ${color}` }}
  >
    {isCrit && <span className="text-xs mr-1">CRIT!</span>}
    -{damage}
  </motion.div>
);

// Transform ELEMENTAL_ABILITIES to demo format
const ABILITY_DATABASE = Object.fromEntries(
  Object.entries(ELEMENTAL_ABILITIES).map(([key, elem]) => [
    key,
    {
      name: elem.name,
      color: elem.gradientClass,
      hoverColor: elem.gradientClass.replace('from-', 'hover:from-').replace('to-', 'hover:to-'),
      textColor: elem.textColor,
      abilities: Object.values(elem.abilities).map(a => ({
        id: a.id,
        name: a.name,
        icon: a.icon,
      })),
    },
  ])
);


export default function CombatDemo() {
  const canvasRef = useRef(null);
  const [activeCategory, setActiveCategory] = useState('fire');

  // Boss Battle Arena State
  const [selectedBossId, setSelectedBossId] = useState('shadow_slime');
  const [playerProjectiles, setPlayerProjectiles] = useState([]);
  const [bossProjectiles, setBossProjectiles] = useState([]);
  const [impacts, setImpacts] = useState([]);
  const [damageNumbers, setDamageNumbers] = useState([]);
  const [bossShaking, setBossShaking] = useState(false);
  const [playerShaking, setPlayerShaking] = useState(false);
  const avatar = useAvatarStore((state) => state.avatar);

  const selectedBoss = BOSS_DATABASE[selectedBossId];

  // Player attacks boss in arena - triggers PixiJS effects at boss position
  const playerAttackBoss = (abilityId = null, color = '#22c55e', element = 'physical') => {
    // Boss position in canvas coordinates (right side, upper area)
    // Canvas is 1000x600, boss sprite is at right-8 top-8, w-40 h-40
    const bossX = 870;  // Slightly in front of boss sprite for visual impact
    const bossY = 140;  // Upper area where boss sprite is centered

    // Trigger WebGL effect at boss position
    if (canvasRef.current) {
      if (abilityId) {
        canvasRef.current.playAbility(abilityId, bossX, bossY);
      } else {
        // Basic attack - use weapon slash
        canvasRef.current.playWeaponAttack({ element, attackType: 'slash', targetX: bossX, targetY: bossY });
      }
    }

    // Boss reaction after effect
    setTimeout(() => {
      setBossShaking(true);
      const damage = Math.floor(Math.random() * 500) + 100;
      const isCrit = Math.random() > 0.8;

      setDamageNumbers(prev => [...prev, {
        id: Date.now(),
        damage: isCrit ? damage * 2 : damage,
        x: `${85 + Math.random() * 8}%`,
        y: `${12 + Math.random() * 8}%`,
        isCrit,
        color: isCrit ? '#fbbf24' : color
      }]);

      setTimeout(() => setBossShaking(false), 200);
    }, 200);
  };

  // Boss attacks player in arena - spectacular PixiJS projectile
  const bossAttackPlayer = () => {
    // Boss origin position (top-right) - matching boss sprite location
    const bossX = 920;
    const bossY = 130;
    // Player target position (bottom-left)
    const playerX = 120;
    const playerY = 480;

    // Play sound
    playBossAttack(selectedBoss.attackAnimation);

    // Get boss color as hex number
    const colorHex = parseInt(selectedBoss.attackColor.replace('#', ''), 16);

    // Create spectacular boss projectile
    if (canvasRef.current) {
      canvasRef.current.createBossProjectile(bossX, bossY, playerX, playerY, {
        color: colorHex,
        size: 35,
        speed: 12,
        attackType: selectedBoss.attackAnimation,
        onImpact: () => {
          setPlayerShaking(true);
          const damage = Math.floor(Math.random() * 300) + 50;
          const isCrit = Math.random() > 0.9;

          setDamageNumbers(prev => [...prev, {
            id: Date.now(),
            damage: isCrit ? damage * 2 : damage,
            x: `${12 + Math.random() * 10}%`,
            y: `${65 + Math.random() * 10}%`,
            isCrit,
            color: selectedBoss.attackColor
          }]);

          setTimeout(() => setPlayerShaking(false), 300);
        }
      });
    }
  };

  // Remove completed effects
  const removeProjectile = (id, type) => {
    if (type === 'player') {
      setPlayerProjectiles(prev => prev.filter(p => p.id !== id));
    } else {
      setBossProjectiles(prev => prev.filter(p => p.id !== id));
    }
  };

  // Auto-cleanup effects
  React.useEffect(() => {
    if (impacts.length > 0) {
      const timer = setTimeout(() => setImpacts([]), 500);
      return () => clearTimeout(timer);
    }
  }, [impacts]);

  React.useEffect(() => {
    if (damageNumbers.length > 0) {
      const timer = setTimeout(() => setDamageNumbers([]), 1000);
      return () => clearTimeout(timer);
    }
  }, [damageNumbers]);

  // Get element and color for ability
  const getAbilityInfo = (abilityId) => {
    const colorMap = {
      fire: '#ef4444',
      ice: '#22d3ee',
      lightning: '#fbbf24',
      dark: '#7c3aed',
      holy: '#fef3c7',
      earth: '#b45309',
      wind: '#2dd4bf',
      water: '#3b82f6',
      poison: '#22c55e',
      arcane: '#d946ef',
      support: '#10b981',
      ultimate: '#ec4899',
    };

    for (const [, category] of Object.entries(ABILITY_DATABASE)) {
      const ability = category.abilities.find(a => a.id === abilityId);
      if (ability) {
        const element = category.name.toLowerCase();
        return { element, color: colorMap[element] || '#22c55e' };
      }
    }
    return { element: 'physical', color: '#94a3b8' };
  };

  // Get color for weapon element
  const getElementColor = (element) => {
    const colorMap = {
      physical: '#94a3b8',
      fire: '#ef4444',
      ice: '#22d3ee',
      lightning: '#fbbf24',
      dark: '#7c3aed',
      holy: '#fef3c7',
      earth: '#b45309',
      wind: '#2dd4bf',
      water: '#3b82f6',
      poison: '#22c55e',
      arcane: '#d946ef',
    };
    return colorMap[element] || '#94a3b8';
  };

  const playAbility = (abilityId) => {
    // Attack boss in arena - this handles the PixiJS effect
    const { element, color } = getAbilityInfo(abilityId);
    playerAttackBoss(abilityId, color, element);
  };

  const playWeaponAttack = (element, attackType) => {
    // Boss position - canvas is 1000x600, boss sprite is at right-8 top-8
    // Boss visual center is approximately at 87% from left, 23% from top
    const bossX = 870;  // Slightly in front of boss for visual impact
    const bossY = 140;  // Upper area where boss is

    if (canvasRef.current) {
      canvasRef.current.playWeaponAttack({ element, attackType, targetX: bossX, targetY: bossY });
    }

    // Boss reaction
    setTimeout(() => {
      setBossShaking(true);
      const damage = Math.floor(Math.random() * 400) + 80;
      const isCrit = Math.random() > 0.85;
      const color = getElementColor(element);

      setDamageNumbers(prev => [...prev, {
        id: Date.now(),
        damage: isCrit ? damage * 2 : damage,
        x: `${85 + Math.random() * 8}%`,
        y: `${12 + Math.random() * 8}%`,
        isCrit,
        color: isCrit ? '#fbbf24' : color
      }]);

      setTimeout(() => setBossShaking(false), 200);
    }, 150);
  };

  const triggerRawEffect = (effect) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const centerX = 300;
    const centerY = 200;

    switch (effect) {
      case 'shake':
        canvas.screenShake(15, 300);
        break;
      case 'flash':
        canvas.screenFlash(0xffffff, 200, 0.8);
        break;
      case 'shockwave':
        canvas.createShockwave(centerX, centerY, { radius: 150 });
        break;
      case 'particles':
        canvas.createParticleBurst(centerX, centerY, { count: 30 });
        break;
    }
  };

  const triggerBossAttack = (attackAnimation) => {
    // Boss origin position (top-right) - matching boss sprite location
    const bossX = 920;
    const bossY = 130;
    // Player target position (bottom-left)
    const playerX = 120;
    const playerY = 480;

    // Play sound
    playBossAttack(attackAnimation);

    // Find the boss for this attack
    const boss = Object.values(BOSS_DATABASE).find(b => b.attackAnimation === attackAnimation) || selectedBoss;
    const colorHex = parseInt((boss.attackColor || '#ef4444').replace('#', ''), 16);

    // Create spectacular boss projectile
    if (canvasRef.current) {
      canvasRef.current.createBossProjectile(bossX, bossY, playerX, playerY, {
        color: colorHex,
        size: 35,
        speed: 12,
        attackType: attackAnimation,
        onImpact: () => {
          setPlayerShaking(true);
          const damage = Math.floor(Math.random() * 300) + 50;
          const isCrit = Math.random() > 0.9;

          setDamageNumbers(prev => [...prev, {
            id: Date.now(),
            damage: isCrit ? damage * 2 : damage,
            x: `${12 + Math.random() * 10}%`,
            y: `${65 + Math.random() * 10}%`,
            isCrit,
            color: boss.attackColor || '#ef4444'
          }]);

          setTimeout(() => setPlayerShaking(false), 300);
        }
      });
    }
  };

  const currentCategory = ABILITY_DATABASE[activeCategory];

  return (
    <div className="min-h-screen bg-gray-900 p-4 md:p-8">
      <h1 className="text-3xl font-bold text-white mb-2">Combat Effects Demo</h1>
      <p className="text-gray-400 mb-6">GPU-accelerated WebGL effects with PixiJS • 50+ abilities across 12 elements</p>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Controls Panel */}
        <div className="flex-1 space-y-4">
          {/* Boss Attacks - At the top! */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 border border-red-600/30">
            <h2 className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-500 mb-3">
              Boss Attacks
            </h2>
            <p className="text-gray-400 text-xs mb-3">10 unique boss attacks with sounds + visuals</p>
            <div className="grid grid-cols-2 gap-2">
              {Object.values(BOSS_DATABASE).map((boss) => (
                <button
                  key={boss.id}
                  onClick={() => triggerBossAttack(boss.attackAnimation)}
                  className="px-3 py-2 rounded-lg text-left transition-all hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    background: `linear-gradient(135deg, ${boss.attackColor}40, ${boss.attackColor}20)`,
                    border: `1px solid ${boss.attackColor}60`,
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{boss.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-white text-sm font-medium truncate">{boss.name}</div>
                      <div className="text-gray-400 text-xs truncate">{boss.attackName}</div>
                    </div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                      boss.difficulty === 'Easy' ? 'bg-green-600/30 text-green-400' :
                      boss.difficulty === 'Normal' ? 'bg-blue-600/30 text-blue-400' :
                      boss.difficulty === 'Hard' ? 'bg-orange-600/30 text-orange-400' :
                      boss.difficulty === 'Epic' ? 'bg-purple-600/30 text-purple-400' :
                      'bg-yellow-600/30 text-yellow-400'
                    }`}>
                      {boss.difficulty}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Element Tabs */}
          <div className="flex flex-wrap gap-1">
            {Object.entries(ABILITY_DATABASE).map(([key, cat]) => (
              <button
                key={key}
                onClick={() => setActiveCategory(key)}
                className={`px-3 py-1.5 text-sm rounded-lg transition font-medium ${
                  activeCategory === key
                    ? `bg-gradient-to-r ${cat.color} ${cat.textColor}`
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Active Category Abilities */}
          <div className="bg-gray-800 rounded-xl p-4">
            <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <span className={`bg-gradient-to-r ${currentCategory.color} bg-clip-text text-transparent`}>
                {currentCategory.name}
              </span>
              <span className="text-gray-500 text-sm font-normal">
                ({currentCategory.abilities.length} abilities)
              </span>
            </h2>
            <div className="flex flex-wrap gap-2">
              {currentCategory.abilities.map((ability) => (
                <button
                  key={ability.id}
                  onClick={() => playAbility(ability.id)}
                  className={`px-3 py-2 bg-gradient-to-r ${currentCategory.color} ${currentCategory.hoverColor} ${currentCategory.textColor} rounded-lg transition text-sm font-medium flex items-center gap-1.5`}
                >
                  <AbilityIconInline ability={ability} />
                  <span>{ability.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Weapon Attacks */}
          <div className="bg-gray-800 rounded-xl p-4">
            <h2 className="text-lg font-semibold text-white mb-3">Weapon Attacks</h2>
            <div className="space-y-3">
              {/* Element Selection */}
              <div className="flex flex-wrap gap-1">
                <span className="text-gray-400 text-xs py-1 mr-1">Element:</span>
                {['physical', 'fire', 'ice', 'lightning', 'dark', 'holy'].map(el => (
                  <button key={el} onClick={() => playWeaponAttack(el, 'slash')}
                    className={`px-2 py-0.5 rounded text-xs ${
                      el === 'physical' ? 'bg-gray-600 text-white' :
                      el === 'fire' ? 'bg-orange-600 text-white' :
                      el === 'ice' ? 'bg-cyan-600 text-white' :
                      el === 'lightning' ? 'bg-yellow-500 text-black' :
                      el === 'dark' ? 'bg-purple-700 text-white' :
                      'bg-yellow-200 text-black'
                    }`}>{el}</button>
                ))}
              </div>
              {/* Basic Slashes */}
              <div className="flex flex-wrap gap-1">
                <span className="text-gray-500 text-xs py-1 w-16">Slashes:</span>
                <button onClick={() => playWeaponAttack('physical', 'slash')} className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-xs">Basic</button>
                <button onClick={() => playWeaponAttack('physical', 'horizontal_slash')} className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-xs">Horizontal</button>
                <button onClick={() => playWeaponAttack('physical', 'vertical_slash')} className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-xs">Vertical</button>
                <button onClick={() => playWeaponAttack('physical', 'diagonal_slash')} className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-xs">Diagonal</button>
                <button onClick={() => playWeaponAttack('physical', 'rising_slash')} className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-xs">Rising</button>
                <button onClick={() => playWeaponAttack('physical', 'falling_slash')} className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-xs">Falling</button>
              </div>
              {/* Multi-Hit */}
              <div className="flex flex-wrap gap-1">
                <span className="text-gray-500 text-xs py-1 w-16">Multi-Hit:</span>
                <button onClick={() => playWeaponAttack('physical', 'x_slash')} className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-xs">X-Slash</button>
                <button onClick={() => playWeaponAttack('physical', 'double_slash')} className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-xs">Double</button>
                <button onClick={() => playWeaponAttack('physical', 'triple_slash')} className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-xs">Triple</button>
                <button onClick={() => playWeaponAttack('fire', 'combo')} className="px-2 py-1 bg-orange-700 hover:bg-orange-600 text-white rounded text-xs">🔥 Combo</button>
                <button onClick={() => playWeaponAttack('lightning', 'flurry')} className="px-2 py-1 bg-yellow-600 hover:bg-yellow-500 text-black rounded text-xs">⚡ Flurry</button>
              </div>
              {/* Thrust/Pierce */}
              <div className="flex flex-wrap gap-1">
                <span className="text-gray-500 text-xs py-1 w-16">Pierce:</span>
                <button onClick={() => playWeaponAttack('physical', 'thrust')} className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-xs">Thrust</button>
                <button onClick={() => playWeaponAttack('physical', 'quick_stab')} className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-xs">Quick Stab</button>
                <button onClick={() => playWeaponAttack('physical', 'rapid_stab')} className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-xs">Rapid Stab</button>
                <button onClick={() => playWeaponAttack('physical', 'lunge')} className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-xs">Lunge</button>
              </div>
              {/* Heavy */}
              <div className="flex flex-wrap gap-1">
                <span className="text-gray-500 text-xs py-1 w-16">Heavy:</span>
                <button onClick={() => playWeaponAttack('physical', 'smash')} className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-xs">Smash</button>
                <button onClick={() => playWeaponAttack('physical', 'heavy_strike')} className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-xs">Heavy Strike</button>
                <button onClick={() => playWeaponAttack('physical', 'overhead_slam')} className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-xs">Overhead</button>
                <button onClick={() => playWeaponAttack('earth', 'ground_pound')} className="px-2 py-1 bg-amber-700 hover:bg-amber-600 text-white rounded text-xs">🌍 Ground Pound</button>
                <button onClick={() => playWeaponAttack('physical', 'cleave')} className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-xs">Cleave</button>
              </div>
              {/* Special */}
              <div className="flex flex-wrap gap-1">
                <span className="text-gray-500 text-xs py-1 w-16">Special:</span>
                <button onClick={() => playWeaponAttack('physical', 'spin_attack')} className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-xs">Spin</button>
                <button onClick={() => playWeaponAttack('physical', 'uppercut')} className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-xs">Uppercut</button>
                <button onClick={() => playWeaponAttack('dark', 'backstab')} className="px-2 py-1 bg-purple-700 hover:bg-purple-600 text-white rounded text-xs">🗡️ Backstab</button>
                <button onClick={() => playWeaponAttack('physical', 'critical_hit')} className="px-2 py-1 bg-yellow-600 hover:bg-yellow-500 text-black rounded text-xs">⭐ Critical</button>
                <button onClick={() => playWeaponAttack('physical', 'parry')} className="px-2 py-1 bg-blue-700 hover:bg-blue-600 text-white rounded text-xs">🛡️ Parry</button>
                <button onClick={() => playWeaponAttack('physical', 'counter')} className="px-2 py-1 bg-blue-700 hover:bg-blue-600 text-white rounded text-xs">↩️ Counter</button>
                <button onClick={() => playWeaponAttack('physical', 'execute')} className="px-2 py-1 bg-red-700 hover:bg-red-600 text-white rounded text-xs">💀 Execute</button>
              </div>
              {/* Unarmed */}
              <div className="flex flex-wrap gap-1">
                <span className="text-gray-500 text-xs py-1 w-16">Unarmed:</span>
                <button onClick={() => playWeaponAttack('physical', 'punch')} className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-xs">👊 Punch</button>
                <button onClick={() => playWeaponAttack('physical', 'kick')} className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-xs">🦵 Kick</button>
                <button onClick={() => playWeaponAttack('physical', 'headbutt')} className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-xs">💫 Headbutt</button>
                <button onClick={() => playWeaponAttack('physical', 'body_slam')} className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-xs">💥 Body Slam</button>
                <button onClick={() => playWeaponAttack('physical', 'dash_strike')} className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-xs">⚡ Dash Strike</button>
              </div>
            </div>
          </div>

          {/* Legendary Weapon Signatures */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 border border-yellow-600/30">
            <h2 className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 mb-3">
              Legendary Weapon Signatures
            </h2>
            <div className="space-y-3">
              {/* Sword Weapons */}
              <div className="flex flex-wrap gap-1">
                <span className="text-yellow-500 text-xs py-1 w-20">Swords:</span>
                <button onClick={() => playWeaponAttack('fire', 'dragon_soul_slash')} className="px-2 py-1 bg-gradient-to-r from-orange-700 to-red-700 hover:from-orange-600 hover:to-red-600 text-white rounded text-xs">🐉 Dragon Soul</button>
                <button onClick={() => playWeaponAttack('dark', 'crimson_rampage')} className="px-2 py-1 bg-gradient-to-r from-red-800 to-red-900 hover:from-red-700 hover:to-red-800 text-white rounded text-xs">🩸 Crimson Rampage</button>
                <button onClick={() => playWeaponAttack('ice', 'temporal_rift')} className="px-2 py-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded text-xs">⏰ Temporal Rift</button>
                <button onClick={() => playWeaponAttack('holy', 'divine_annihilation')} className="px-2 py-1 bg-gradient-to-r from-yellow-500 to-white hover:from-yellow-400 hover:to-gray-100 text-black rounded text-xs">💫 Divine Annihilation</button>
                <button onClick={() => playWeaponAttack('ice', 'glacial_sunder')} className="px-2 py-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white rounded text-xs">❄️ Glacial Sunder</button>
                <button onClick={() => playWeaponAttack('physical', 'knights_honor')} className="px-2 py-1 bg-gradient-to-r from-blue-400 to-indigo-500 hover:from-blue-300 hover:to-indigo-400 text-white rounded text-xs">⚔️ Knight's Honour</button>
                <button onClick={() => playWeaponAttack('fire', 'elemental_blade_storm')} className="px-2 py-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded text-xs">🌈 Elemental Storm</button>
              </div>
              {/* Axe Weapons */}
              <div className="flex flex-wrap gap-1">
                <span className="text-yellow-500 text-xs py-1 w-20">Axes:</span>
                <button onClick={() => playWeaponAttack('dark', 'reapers_harvest')} className="px-2 py-1 bg-gradient-to-r from-purple-800 to-indigo-900 hover:from-purple-700 hover:to-indigo-800 text-white rounded text-xs">💀 Reaper's Harvest</button>
                <button onClick={() => playWeaponAttack('lightning', 'storm_cleaver')} className="px-2 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black rounded text-xs">⛈️ Storm Cleaver</button>
                <button onClick={() => playWeaponAttack('fire', 'berserkers_fury')} className="px-2 py-1 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white rounded text-xs">😤 Berserker's Fury</button>
                <button onClick={() => playWeaponAttack('dark', 'final_verdict')} className="px-2 py-1 bg-gradient-to-r from-red-900 to-gray-900 hover:from-red-800 hover:to-gray-800 text-white rounded text-xs">⚖️ Final Verdict</button>
              </div>
              {/* Hammer Weapons */}
              <div className="flex flex-wrap gap-1">
                <span className="text-yellow-500 text-xs py-1 w-20">Hammers:</span>
                <button onClick={() => playWeaponAttack('holy', 'starfall_smash')} className="px-2 py-1 bg-gradient-to-r from-yellow-400 to-amber-400 hover:from-yellow-300 hover:to-amber-300 text-black rounded text-xs">⭐ Starfall Smash</button>
                <button onClick={() => playWeaponAttack('lightning', 'mjolnir_strike')} className="px-2 py-1 bg-gradient-to-r from-blue-400 to-yellow-400 hover:from-blue-300 hover:to-yellow-300 text-black rounded text-xs">⚡ Mjolnir Strike</button>
              </div>
              {/* Trident/Polearm */}
              <div className="flex flex-wrap gap-1">
                <span className="text-yellow-500 text-xs py-1 w-20">Polearms:</span>
                <button onClick={() => playWeaponAttack('water', 'maelstrom')} className="px-2 py-1 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-500 hover:to-teal-500 text-white rounded text-xs">🌊 Maelstrom</button>
              </div>
              {/* Magic Weapons */}
              <div className="flex flex-wrap gap-1">
                <span className="text-yellow-500 text-xs py-1 w-20">Magic:</span>
                <button onClick={() => playWeaponAttack('fire', 'hellfire_execution')} className="px-2 py-1 bg-gradient-to-r from-red-700 to-orange-700 hover:from-red-600 hover:to-orange-600 text-white rounded text-xs">🔥 Hellfire Execution</button>
                <button onClick={() => playWeaponAttack('arcane', 'prismatic_cascade')} className="px-2 py-1 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 hover:from-pink-400 hover:to-blue-400 text-white rounded text-xs">🌈 Prismatic Cascade</button>
                <button onClick={() => playWeaponAttack('arcane', 'forbidden_knowledge')} className="px-2 py-1 bg-gradient-to-r from-purple-700 to-pink-700 hover:from-purple-600 hover:to-pink-600 text-white rounded text-xs">📖 Forbidden Knowledge</button>
                <button onClick={() => playWeaponAttack('arcane', 'arcane_singularity')} className="px-2 py-1 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white rounded text-xs">🌀 Arcane Singularity</button>
                <button onClick={() => playWeaponAttack('poison', 'soul_harvest')} className="px-2 py-1 bg-gradient-to-r from-green-700 to-emerald-700 hover:from-green-600 hover:to-emerald-600 text-white rounded text-xs">👻 Soul Harvest</button>
              </div>
            </div>
          </div>

          {/* Raw Effects */}
          <div className="bg-gray-800 rounded-xl p-4">
            <h2 className="text-lg font-semibold text-white mb-3">Raw Effects</h2>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => triggerRawEffect('shake')} className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm">Screen Shake</button>
              <button onClick={() => triggerRawEffect('flash')} className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm">Screen Flash</button>
              <button onClick={() => triggerRawEffect('shockwave')} className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm">Shockwave</button>
              <button onClick={() => triggerRawEffect('particles')} className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm">Particles</button>
            </div>
          </div>

        </div>
      </div>

      {/* Boss Battle Arena */}
      <div className="mt-8 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-purple-600/30">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
            🎮 Boss Battle Arena (Infinite Health Mode)
          </h2>
          <select
            value={selectedBossId}
            onChange={(e) => setSelectedBossId(e.target.value)}
            className="bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600"
          >
            {Object.values(BOSS_DATABASE).map((boss) => (
              <option key={boss.id} value={boss.id}>
                {boss.icon} {boss.name} ({boss.difficulty})
              </option>
            ))}
          </select>
        </div>

        {/* Battle Arena with integrated PixiJS Canvas */}
        <div className="relative w-full max-w-[1000px] mx-auto h-[600px] bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 rounded-xl overflow-hidden border border-gray-700">
          {/* PixiJS Canvas - Full arena coverage for effects */}
          <div className="absolute inset-0 z-10 pointer-events-none">
            <CombatCanvas
              ref={canvasRef}
              width={1000}
              height={600}
              className="w-full h-full"
            />
          </div>

          {/* Player Side (Left) - Behind canvas */}
          <div className="absolute left-8 bottom-8 z-0">
            <motion.div
              animate={playerShaking ? { x: [0, -8, 8, -8, 8, 0] } : {}}
              transition={{ duration: 0.2 }}
            >
              {/* Stage 10 base male avatar for demo */}
              <img
                src="/assets/avatar/base/male/stage10.png"
                alt="Hero"
                className="w-40 h-40 object-contain"
                style={{ imageRendering: 'pixelated' }}
              />
            </motion.div>
            <div className="mt-2 text-center">
              <div className="text-white font-bold text-lg">You</div>
              <div className="text-green-400 text-sm">∞ HP (Infinite)</div>
            </div>
          </div>

          {/* Boss Side (Right) - Behind canvas */}
          <div className="absolute right-8 top-8 z-0">
            <motion.div
              animate={bossShaking ? { x: [0, 10, -10, 10, -10, 0], scale: [1, 1.08, 1] } : {}}
              transition={{ duration: 0.25 }}
              className="relative"
            >
              {selectedBoss.sprite ? (
                <img
                  src={selectedBoss.sprite}
                  alt={selectedBoss.name}
                  className="w-40 h-40 object-contain pixelated"
                  style={{ imageRendering: 'pixelated' }}
                />
              ) : (
                <div
                  className="w-40 h-40 rounded-xl flex items-center justify-center text-7xl"
                  style={{ background: `linear-gradient(135deg, ${selectedBoss.attackColor}80, ${selectedBoss.attackColor}40)` }}
                >
                  {selectedBoss.icon}
                </div>
              )}
              {/* Boss glow effect */}
              <div
                className="absolute inset-0 rounded-xl opacity-40 blur-2xl -z-10"
                style={{ background: selectedBoss.attackColor }}
              />
            </motion.div>
            <div className="mt-2 text-center">
              <div className="text-white font-bold text-lg">{selectedBoss.name}</div>
              <div className="text-sm font-medium" style={{ color: selectedBoss.attackColor }}>∞ HP (Infinite)</div>
              <div className="text-gray-500 text-xs">{selectedBoss.difficulty}</div>
            </div>
          </div>

          {/* VS Text */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-0">
            <motion.div
              animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-5xl font-black text-white/20"
            >
              VS
            </motion.div>
          </div>

          {/* Boss Projectiles - For boss attacks only */}
          <AnimatePresence>
            {bossProjectiles.map((proj) => (
              <BossProjectile
                key={proj.id}
                boss={proj.boss}
                onComplete={() => removeProjectile(proj.id, 'boss')}
              />
            ))}
          </AnimatePresence>

          {/* Damage Numbers - Above everything */}
          <div className="absolute inset-0 z-20 pointer-events-none">
            <AnimatePresence>
              {damageNumbers.map((dmg) => (
                <DamageNumber
                  key={dmg.id}
                  damage={dmg.damage}
                  x={dmg.x}
                  y={dmg.y}
                  isCrit={dmg.isCrit}
                  color={dmg.color}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Arena Controls */}
        <div className="mt-4 flex flex-wrap gap-3 justify-center">
          <button
            onClick={() => playerAttackBoss(null, '#94a3b8', 'physical')}
            className="px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white rounded-lg font-medium transition"
          >
            ⚔️ Basic Attack
          </button>

          <button
            onClick={bossAttackPlayer}
            className="px-4 py-2 rounded-lg font-medium transition"
            style={{
              background: `linear-gradient(135deg, ${selectedBoss.attackColor}, ${selectedBoss.attackColor}cc)`,
              color: '#fff'
            }}
          >
            {selectedBoss.icon} Boss Attack: {selectedBoss.attackName}
          </button>

          {/* Quick Ability Attacks */}
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => playAbility('fireball')}
              className="px-3 py-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white rounded-lg text-sm"
            >
              🔥 Fireball
            </button>
            <button
              onClick={() => playAbility('ice_spike')}
              className="px-3 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-lg text-sm"
            >
              🧊 Ice Spike
            </button>
            <button
              onClick={() => playAbility('lightning_strike')}
              className="px-3 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-300 hover:to-orange-400 text-black rounded-lg text-sm"
            >
              ⚡ Lightning
            </button>
            <button
              onClick={() => playAbility('holy_light')}
              className="px-3 py-2 bg-gradient-to-r from-yellow-200 to-amber-300 hover:from-yellow-100 hover:to-amber-200 text-black rounded-lg text-sm"
            >
              ✨ Holy
            </button>
            <button
              onClick={() => playAbility('shadow_burst')}
              className="px-3 py-2 bg-gradient-to-r from-purple-700 to-indigo-900 hover:from-purple-600 hover:to-indigo-800 text-white rounded-lg text-sm"
            >
              🌑 Dark
            </button>
            <button
              onClick={() => playAbility('earthquake')}
              className="px-3 py-2 bg-gradient-to-r from-amber-700 to-stone-600 hover:from-amber-600 hover:to-stone-500 text-white rounded-lg text-sm"
            >
              🌍 Earth
            </button>
            <button
              onClick={() => playAbility('tornado')}
              className="px-3 py-2 bg-gradient-to-r from-teal-400 to-cyan-300 hover:from-teal-300 hover:to-cyan-200 text-black rounded-lg text-sm"
            >
              🌪️ Wind
            </button>
            <button
              onClick={() => playAbility('tidal_wave')}
              className="px-3 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white rounded-lg text-sm"
            >
              🌊 Water
            </button>
            <button
              onClick={() => playAbility('poison_cloud')}
              className="px-3 py-2 bg-gradient-to-r from-green-600 to-lime-500 hover:from-green-500 hover:to-lime-400 text-white rounded-lg text-sm"
            >
              ☠️ Poison
            </button>
            <button
              onClick={() => playAbility('arcane_blast')}
              className="px-3 py-2 bg-gradient-to-r from-fuchsia-600 to-pink-500 hover:from-fuchsia-500 hover:to-pink-400 text-white rounded-lg text-sm"
            >
              🔮 Arcane
            </button>
            <button
              onClick={() => playAbility('heal')}
              className="px-3 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white rounded-lg text-sm"
            >
              💚 Support
            </button>
            <button
              onClick={() => playAbility('supernova')}
              className="px-3 py-2 bg-gradient-to-r from-rose-600 via-purple-600 to-indigo-600 hover:from-rose-500 hover:via-purple-500 hover:to-indigo-500 text-white rounded-lg text-sm"
            >
              🌟 Ultimate
            </button>
          </div>
        </div>

        {/* Info Text */}
        <p className="text-center text-gray-500 text-xs mt-3">
          Test all abilities in the arena! Both you and the boss have infinite health for testing purposes.
        </p>
      </div>

      {/* All Abilities Grid (collapsed by default) */}
      <details className="mt-8 bg-gray-800 rounded-xl">
        <summary className="p-4 cursor-pointer text-white font-semibold hover:bg-gray-700 rounded-xl">
          View All 50+ Abilities
        </summary>
        <div className="p-4 pt-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Object.entries(ABILITY_DATABASE).map(([key, cat]) => (
            <div key={key} className="bg-gray-900 rounded-lg p-3">
              <h3 className={`text-sm font-semibold mb-2 bg-gradient-to-r ${cat.color} bg-clip-text text-transparent`}>
                {cat.name}
              </h3>
              <div className="flex flex-wrap gap-1">
                {cat.abilities.map((ability) => (
                  <button
                    key={ability.id}
                    onClick={() => playAbility(ability.id)}
                    className={`px-2 py-1 bg-gradient-to-r ${cat.color} ${cat.hoverColor} ${cat.textColor} rounded text-xs transition flex items-center justify-center`}
                    title={ability.name}
                  >
                    <AbilityIconInline ability={ability} />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}
