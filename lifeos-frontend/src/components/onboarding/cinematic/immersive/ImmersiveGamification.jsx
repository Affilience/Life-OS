/**
 * ImmersiveGamification - 3D Carousel Showcase
 *
 * Interactive 3D carousel showcasing gamification features:
 * - XP & Leveling system
 * - Equipment & Pets
 * - Stats & Skills allocation
 * - Skill Constellation
 * - Cosmic Bazaar
 *
 * Adapted from website's Gamification.tsx for onboarding flow.
 */

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { feedback } from '../../../../services/microInteractions';
import { getAbilityById, ELEMENT_COLORS } from '../../../../data/elementalAbilities';
import AbilityIcon from '../../../ui/AbilityIcon';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// Demo configurations with pixel art icons
const DEMOS = [
  { id: 'xp', title: 'Experience Points', color: '#fbbf24', icon: '/assets/bazaar/consumables/boost_xp_2x.png', description: 'Earn XP for every action' },
  { id: 'equipment', title: 'Equipment & Pets', color: '#a855f7', icon: '/assets/equipment/weapons/dragon_blade.png', description: 'Collect gear & companions' },
  { id: 'stats', title: 'Stats & Skills', color: '#ef4444', icon: '/assets/icons/modules/module_skills.png', description: 'Allocate skill points' },
  { id: 'skills', title: 'Skill Constellation', color: '#3b82f6', icon: '/assets/icons/modules/module_skills.png', description: 'Unlock abilities' },
  { id: 'abilities', title: 'Combat Abilities', color: '#ff6600', icon: '/assets/icons/modules/module_skills.png', description: 'Elemental battle powers' },
  { id: 'bazaar', title: 'Cosmic Bazaar', color: '#10b981', icon: '/assets/bazaar/weapons/sword_novice.png', description: 'Spend your rewards' },
];

const ANGLE_PER_CARD = 360 / DEMOS.length;

// ============================================
// XP Demo Component
// ============================================
function XPDemo({ isActive }) {
  const [xp, setXp] = useState(25);
  const [level, setLevel] = useState(1);
  const [floatingXP, setFloatingXP] = useState([]);
  const barRef = useRef(null);

  const handleEarnXP = () => {
    const earned = 25;
    const newXP = xp + earned;

    const id = Date.now();
    setFloatingXP(prev => [...prev, { id, value: earned }]);
    setTimeout(() => setFloatingXP(prev => prev.filter(f => f.id !== id)), 1000);

    if (newXP >= 100) {
      setXp(newXP - 100);
      setLevel(prev => prev + 1);
      feedback.achievement();
    } else {
      setXp(newXP);
      feedback.buttonPress();
    }
  };

  useEffect(() => {
    if (isActive && barRef.current) {
      gsap.to(barRef.current, {
        width: `${xp}%`,
        duration: 0.8,
        delay: 0.3,
        ease: 'power2.out',
      });
    }
  }, [isActive, xp]);

  return (
    <div className="flex flex-col items-center gap-4 h-full">
      {/* Level Badges */}
      <div className="flex items-center gap-4">
        <div className="text-center">
          <div className="level-badge w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-purple-500/30">
            {level}
          </div>
          <p className="text-xs text-white/50 mt-1">Current</p>
        </div>
        <div className="text-white/30">→</div>
        <div className="text-center opacity-50">
          <div className="w-14 h-14 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white font-bold text-xl">
            {level + 1}
          </div>
          <p className="text-xs text-white/50 mt-1">Next</p>
        </div>
      </div>

      {/* XP Progress Bar */}
      <div className="w-full max-w-[240px]">
        <div className="flex justify-between text-xs text-white/60 mb-1">
          <span>XP Progress</span>
          <span>{xp}/100</span>
        </div>
        <div className="h-3 bg-white/10 rounded-full overflow-hidden">
          <div
            ref={barRef}
            className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full"
            style={{ width: '0%' }}
          />
        </div>
      </div>

      {/* Tap Button */}
      <motion.button
        onClick={handleEarnXP}
        className="relative px-8 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold shadow-lg shadow-amber-500/30"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <span className="text-lg">⚡ TAP FOR XP</span>
        <AnimatePresence>
          {floatingXP.map(f => (
            <motion.span
              key={f.id}
              className="absolute -top-4 left-1/2 -translate-x-1/2 text-amber-300 font-bold"
              initial={{ opacity: 1, y: 0 }}
              animate={{ opacity: 0, y: -30 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
            >
              +{f.value}
            </motion.span>
          ))}
        </AnimatePresence>
      </motion.button>

      {/* Stats */}
      <div className="flex gap-6 text-center">
        <div>
          <p className="text-lg font-bold text-purple-400">{level * 100 + xp}</p>
          <p className="text-xs text-white/40">Total XP</p>
        </div>
        <div>
          <p className="text-lg font-bold text-cyan-400">{Math.floor((level * 100 + xp) / 25)}</p>
          <p className="text-xs text-white/40">Tasks</p>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Equipment & Pets Demo
// ============================================
function EquipmentPetsDemo({ isActive }) {
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedPet, setSelectedPet] = useState('phoenix');

  const EQUIPMENT = [
    { id: 'weapon', name: 'Weapon', icon: '/assets/equipment/weapons/basic_sword.png', stat: '+15 Focus' },
    { id: 'armor', name: 'Shield', icon: '/assets/equipment/shields/wooden_buckler.png', stat: '+20 Vitality' },
    { id: 'accessory', name: 'Amulet', icon: '/assets/equipment/amulets/dragon_tooth.png', stat: '+10 Wisdom' },
  ];

  const PETS = [
    { id: 'phoenix', name: 'Phoenix', icon: '/assets/pets/pet_phoenix.png', bonus: '+5% XP' },
    { id: 'kitsune', name: 'Kitsune', icon: '/assets/pets/pet_kitsune_pup.png', bonus: '+5% Wisdom' },
    { id: 'dragon', name: 'Azure Dragon', icon: '/assets/pets/pet_azure_dragon.png', bonus: '+5% Power' },
  ];

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Equipment Slots */}
      <div>
        <p className="text-xs text-white/50 mb-2 text-center">Equipment Slots</p>
        <div className="flex justify-center gap-3">
          {EQUIPMENT.map(slot => (
            <motion.button
              key={slot.id}
              onClick={() => setSelectedSlot(selectedSlot === slot.id ? null : slot.id)}
              className={`w-16 h-16 rounded-xl flex flex-col items-center justify-center transition-all p-2 ${
                selectedSlot === slot.id
                  ? 'bg-gradient-to-br from-purple-500/30 to-purple-600/30 border-2 border-purple-400'
                  : 'bg-white/5 border border-white/10 hover:border-white/30'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <img
                src={slot.icon}
                alt={slot.name}
                className="w-8 h-8 object-contain"
                style={{ imageRendering: 'pixelated' }}
              />
              <span className="text-[10px] text-white/60 mt-1">{slot.name}</span>
            </motion.button>
          ))}
        </div>
        {selectedSlot && (
          <motion.p
            className="text-xs text-center text-emerald-400 mt-2"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {EQUIPMENT.find(e => e.id === selectedSlot)?.stat}
          </motion.p>
        )}
      </div>

      {/* Pets */}
      <div>
        <p className="text-xs text-white/50 mb-2 text-center">Pet Companions</p>
        <div className="flex justify-center gap-3">
          {PETS.map(pet => (
            <motion.button
              key={pet.id}
              onClick={() => setSelectedPet(pet.id)}
              className={`w-16 h-16 rounded-xl flex flex-col items-center justify-center transition-all p-2 ${
                selectedPet === pet.id
                  ? 'bg-gradient-to-br from-cyan-500/30 to-cyan-600/30 border-2 border-cyan-400'
                  : 'bg-white/5 border border-white/10 hover:border-white/30'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.img
                src={pet.icon}
                alt={pet.name}
                className="w-8 h-8 object-contain"
                style={{ imageRendering: 'pixelated' }}
                animate={selectedPet === pet.id ? { y: [0, -3, 0] } : {}}
                transition={{ duration: 1, repeat: Infinity }}
              />
              <span className="text-[10px] text-white/60 mt-1">{pet.name}</span>
            </motion.button>
          ))}
        </div>
        <motion.p
          key={selectedPet}
          className="text-xs text-center text-cyan-400 mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {PETS.find(p => p.id === selectedPet)?.bonus}
        </motion.p>
      </div>

      {/* Active Bonuses */}
      <div className="text-center mt-auto">
        <p className="text-xs text-white/40">Active Bonuses</p>
        <p className="text-sm text-emerald-400 font-medium">
          {selectedSlot ? EQUIPMENT.find(e => e.id === selectedSlot)?.stat : 'Select equipment'} • {PETS.find(p => p.id === selectedPet)?.bonus}
        </p>
      </div>
    </div>
  );
}

// ============================================
// Stats Demo
// ============================================
function StatsDemo({ isActive }) {
  const [stats, setStats] = useState({
    vitality: 45,
    focus: 62,
    wisdom: 38,
    strength: 55,
  });
  const [skillPoints, setSkillPoints] = useState(5);

  const STAT_CONFIG = [
    { id: 'vitality', name: 'Vitality', icon: '❤️', color: '#ef4444' },
    { id: 'focus', name: 'Focus', icon: '🎯', color: '#3b82f6' },
    { id: 'wisdom', name: 'Wisdom', icon: '📚', color: '#8b5cf6' },
    { id: 'strength', name: 'Strength', icon: '💪', color: '#f59e0b' },
  ];

  const addStat = (statId) => {
    if (skillPoints <= 0) return;
    setStats(prev => ({ ...prev, [statId]: Math.min(100, prev[statId] + 5) }));
    setSkillPoints(prev => prev - 1);
    feedback.buttonPress();
  };

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Skill Points */}
      <div className="text-center">
        <span className="text-xs text-white/50">Available Points: </span>
        <span className="text-amber-400 font-bold">{skillPoints}</span>
      </div>

      {/* Stats */}
      <div className="space-y-3">
        {STAT_CONFIG.map(stat => (
          <div key={stat.id} className="flex items-center gap-2">
            <span className="text-lg w-6">{stat.icon}</span>
            <div className="flex-1">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-white/70">{stat.name}</span>
                <span className="text-white/50">{stats[stat.id]}</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: stat.color, width: `${stats[stat.id]}%` }}
                  initial={false}
                  animate={{ width: `${stats[stat.id]}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
            <motion.button
              onClick={() => addStat(stat.id)}
              disabled={skillPoints <= 0}
              className={`w-6 h-6 rounded-full text-xs font-bold transition-all ${
                skillPoints > 0
                  ? 'bg-white/20 hover:bg-white/30 text-white'
                  : 'bg-white/5 text-white/30 cursor-not-allowed'
              }`}
              whileHover={skillPoints > 0 ? { scale: 1.1 } : {}}
              whileTap={skillPoints > 0 ? { scale: 0.9 } : {}}
            >
              +
            </motion.button>
          </div>
        ))}
      </div>

      {/* Total Power */}
      <div className="text-center mt-auto">
        <p className="text-xs text-white/40">Total Power</p>
        <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
          {Object.values(stats).reduce((a, b) => a + b, 0)}
        </p>
      </div>
    </div>
  );
}

// ============================================
// Skills Constellation Demo
// ============================================
function SkillsDemo({ isActive }) {
  const [selectedSkill, setSelectedSkill] = useState(null);
  const svgRef = useRef(null);

  const SKILLS = [
    { id: 'focus', x: 50, y: 15, color: '#fbbf24', unlocked: true, name: 'Focus', progress: 45 },
    { id: 'logic', x: 20, y: 35, color: '#3b82f6', unlocked: true, name: 'Logic', progress: 30 },
    { id: 'creative', x: 80, y: 35, color: '#8b5cf6', unlocked: true, name: 'Creative', progress: 60 },
    { id: 'core', x: 50, y: 55, color: '#ec4899', unlocked: true, name: 'Core', progress: 100 },
    { id: 'learn', x: 15, y: 70, color: '#06b6d4', unlocked: true, name: 'Learning', progress: 20 },
    { id: 'master', x: 85, y: 70, color: '#6b7280', unlocked: false, name: 'Mastery', progress: 0 },
  ];

  const CONNECTIONS = [
    { from: 'focus', to: 'logic' },
    { from: 'focus', to: 'creative' },
    { from: 'focus', to: 'core', dashed: true },
    { from: 'logic', to: 'core', dashed: true },
    { from: 'creative', to: 'core', dashed: true },
    { from: 'logic', to: 'learn' },
    { from: 'creative', to: 'master' },
  ];

  const getSkill = (id) => SKILLS.find(s => s.id === id);

  useEffect(() => {
    if (isActive && svgRef.current) {
      const lines = svgRef.current.querySelectorAll('line');
      lines.forEach((line, i) => {
        const length = Math.sqrt(
          Math.pow(parseFloat(line.getAttribute('x2') || '0') - parseFloat(line.getAttribute('x1') || '0'), 2) +
          Math.pow(parseFloat(line.getAttribute('y2') || '0') - parseFloat(line.getAttribute('y1') || '0'), 2)
        );
        line.style.strokeDasharray = String(length);
        line.style.strokeDashoffset = String(length);

        gsap.to(line, {
          strokeDashoffset: 0,
          opacity: 0.6,
          duration: 0.6,
          delay: i * 0.05,
          ease: 'power2.out',
        });
      });
    }
  }, [isActive]);

  return (
    <div className="flex flex-col items-center gap-2 h-full">
      {/* SVG Constellation */}
      <svg ref={svgRef} viewBox="0 0 100 85" className="w-full max-w-[260px] h-auto">
        <defs>
          <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.6" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="1" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Connections */}
        {CONNECTIONS.map((conn, i) => {
          const from = getSkill(conn.from);
          const to = getSkill(conn.to);
          if (!from || !to) return null;
          return (
            <line
              key={i}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke="url(#lineGrad)"
              strokeWidth={conn.dashed ? 0.5 : 0.8}
              strokeDasharray={conn.dashed ? '2,2' : undefined}
              opacity={0}
            />
          );
        })}

        {/* Stars */}
        {SKILLS.map(skill => (
          <g
            key={skill.id}
            onClick={() => setSelectedSkill(selectedSkill === skill.id ? null : skill.id)}
            style={{ cursor: 'pointer' }}
          >
            {skill.unlocked && (
              <circle cx={skill.x} cy={skill.y} r={6} fill={skill.color} opacity={0.15}>
                <animate attributeName="opacity" values="0.1;0.25;0.1" dur="2s" repeatCount="indefinite" />
              </circle>
            )}
            <circle
              cx={skill.x}
              cy={skill.y}
              r={skill.unlocked ? 3 : 2.5}
              fill={skill.unlocked ? skill.color : 'rgba(255,255,255,0.2)'}
              filter={skill.unlocked ? 'url(#glow)' : undefined}
            />
            {selectedSkill === skill.id && (
              <circle cx={skill.x} cy={skill.y} r={5} fill="none" stroke={skill.color} strokeWidth="0.5" opacity={0.8}>
                <animate attributeName="r" values="5;7;5" dur="1s" repeatCount="indefinite" />
              </circle>
            )}
          </g>
        ))}
      </svg>

      {/* Info Panel */}
      {selectedSkill ? (
        <motion.div
          className="w-full max-w-[240px] p-3 bg-white/5 border border-white/10 rounded-xl"
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 rounded-full" style={{ background: getSkill(selectedSkill)?.color }} />
            <span className="font-bold text-white">{getSkill(selectedSkill)?.name}</span>
          </div>
          {getSkill(selectedSkill)?.unlocked && (
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${getSkill(selectedSkill)?.progress}%`, background: getSkill(selectedSkill)?.color }}
                />
              </div>
              <span className="text-xs text-white/50">{getSkill(selectedSkill)?.progress}%</span>
            </div>
          )}
        </motion.div>
      ) : (
        <p className="text-xs text-white/40 italic">Tap a star to see skill info</p>
      )}

      <p className="text-xs text-white/40 mt-auto">
        Unlocked: {SKILLS.filter(s => s.unlocked).length}/{SKILLS.length} skills
      </p>
    </div>
  );
}

// ============================================
// Bazaar Demo
// ============================================
function BazaarDemo({ isActive }) {
  const [credits, setCredits] = useState(100);
  const [purchased, setPurchased] = useState(new Set());
  const [showBonus, setShowBonus] = useState(false);

  const ITEMS = [
    { id: 'sword', name: 'Novice Blade', price: 50, icon: '/assets/bazaar/weapons/sword_novice.png', color: '#9ca3af' },
    { id: 'armor', name: 'Leather Armor', price: 75, icon: '/assets/bazaar/armor/armor_leather.png', color: '#22c55e' },
    { id: 'potion', name: 'XP Potion', price: 25, icon: '/assets/bazaar/consumables/potion_xp_small.png', color: '#ef4444' },
  ];

  useEffect(() => {
    if (isActive) {
      setTimeout(() => setShowBonus(true), 300);
    }
  }, [isActive]);

  const handlePurchase = (item) => {
    if (purchased.has(item.id) || credits < item.price) return;
    setCredits(prev => prev - item.price);
    setPurchased(prev => new Set([...prev, item.id]));
    feedback.buttonPress();
  };

  return (
    <div className="flex flex-col items-center gap-3 h-full">
      {/* Welcome Bonus */}
      <AnimatePresence>
        {showBonus && (
          <motion.div
            className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/30 rounded-lg"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span>✨</span>
            <span className="text-xs font-bold text-emerald-400">+100 WELCOME BONUS!</span>
            <span>✨</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Credits Display */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-white/50">Your Credits</span>
        <span className="text-xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
          ✧ {credits}
        </span>
      </div>

      {/* Items */}
      <div className="flex gap-3 justify-center">
        {ITEMS.map(item => {
          const isPurchased = purchased.has(item.id);
          const canAfford = credits >= item.price && !isPurchased;

          return (
            <motion.button
              key={item.id}
              onClick={() => handlePurchase(item)}
              disabled={!canAfford}
              className={`relative w-24 p-3 rounded-xl border-2 transition-all ${
                canAfford
                  ? 'bg-emerald-500/10 border-emerald-500/40'
                  : isPurchased
                    ? 'bg-white/5 border-white/10 opacity-60'
                    : 'bg-white/5 border-white/10'
              }`}
              whileHover={canAfford ? { scale: 1.05, y: -4 } : {}}
              whileTap={canAfford ? { scale: 0.95 } : {}}
            >
              {/* Rarity indicator */}
              <div className="absolute top-0 left-0 right-0 h-1 rounded-t-xl" style={{ background: item.color }} />

              <div className="w-12 h-12 mx-auto mb-2 rounded-lg bg-white/5 flex items-center justify-center p-1">
                <img
                  src={item.icon}
                  alt={item.name}
                  className="w-full h-full object-contain"
                  style={{ imageRendering: 'pixelated' }}
                />
              </div>
              <p className="text-[10px] font-semibold text-white truncate">{item.name}</p>
              <p className={`text-xs font-bold ${canAfford ? 'text-emerald-400' : isPurchased ? 'text-white/40' : 'text-red-400'}`}>
                {isPurchased ? '✓ Owned' : `${item.price} ✧`}
              </p>

              {!isPurchased && (
                <div className={`mt-2 py-1 rounded-md text-[10px] font-bold ${
                  canAfford ? 'bg-emerald-500 text-white' : 'bg-white/10 text-white/40'
                }`}>
                  {canAfford ? 'BUY' : 'LOCKED'}
                </div>
              )}

              {isPurchased && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-[10px] text-white">
                  ✓
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      <p className="text-xs text-white/40 mt-auto">
        {purchased.size > 0 ? `${purchased.size}/${ITEMS.length} items purchased!` : 'Tap an item to purchase'}
      </p>
    </div>
  );
}

// ============================================
// Combat Abilities Demo
// ============================================
function AbilitiesDemo({ isActive }) {
  const [selectedAbility, setSelectedAbility] = useState(null);
  const [cooldowns, setCooldowns] = useState({});
  const [damageNumber, setDamageNumber] = useState(null);

  // Use actual abilities from the database with useMemo to avoid recreating on each render
  const ABILITIES = useMemo(() => {
    const abilityIds = ['fireball', 'ice_spike', 'lightning_strike', 'shadow_burst'];
    return abilityIds.map(id => {
      const ability = getAbilityById(id);
      if (!ability) return null;
      return {
        ...ability,
        color: ELEMENT_COLORS[ability.element] || '#8888ff',
        damage: Math.round(ability.damage * 30), // Display damage as visible number
        cooldown: ability.cooldown / 1000, // Convert to seconds
      };
    }).filter(Boolean);
  }, []);

  // Cooldown timer effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCooldowns(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(key => {
          if (updated[key] > 0) {
            updated[key] = Math.max(0, updated[key] - 0.1);
          }
        });
        return updated;
      });
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const handleUseAbility = (ability) => {
    if (cooldowns[ability.id] > 0) return;

    // Set cooldown
    setCooldowns(prev => ({ ...prev, [ability.id]: ability.cooldown }));
    setSelectedAbility(ability);
    feedback.buttonPress();

    // Show damage number
    const damage = Math.floor(ability.damage * (0.9 + Math.random() * 0.3));
    setDamageNumber({ value: damage, color: ability.color, id: Date.now() });
    setTimeout(() => setDamageNumber(null), 800);
  };

  return (
    <div className="flex flex-col items-center gap-3 h-full">
      {/* Battle preview */}
      <div className="relative w-full h-24 bg-gradient-to-b from-purple-900/30 to-transparent rounded-xl flex items-center justify-center overflow-hidden">
        {/* Enemy target */}
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500/20 to-red-700/20 border-2 border-red-500/50 flex items-center justify-center">
          <span className="text-2xl">👹</span>
        </div>

        {/* Damage number */}
        <AnimatePresence>
          {damageNumber && (
            <motion.div
              key={damageNumber.id}
              className="absolute top-2 font-black text-xl"
              style={{ color: damageNumber.color, textShadow: `0 0 10px ${damageNumber.color}` }}
              initial={{ opacity: 1, y: 20, scale: 0.5 }}
              animate={{ opacity: 0, y: -20, scale: 1.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
            >
              -{damageNumber.value}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Ability effect */}
        <AnimatePresence>
          {selectedAbility && (
            <motion.div
              key={selectedAbility.id + Date.now()}
              className="absolute inset-0 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div
                className="absolute inset-0"
                style={{
                  background: `radial-gradient(circle at center, ${selectedAbility.color}40 0%, transparent 70%)`,
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Ability slots label */}
      <p className="text-xs text-white/50">Equip 2 abilities for battle</p>

      {/* Ability buttons */}
      <div className="grid grid-cols-2 gap-2 w-full">
        {ABILITIES.map(ability => {
          const onCooldown = cooldowns[ability.id] > 0;
          const cooldownPercent = onCooldown ? (cooldowns[ability.id] / ability.cooldown) * 100 : 0;

          return (
            <motion.button
              key={ability.id}
              onClick={() => handleUseAbility(ability)}
              disabled={onCooldown}
              className={`relative p-2 rounded-xl border-2 transition-all overflow-hidden ${
                onCooldown
                  ? 'bg-white/5 border-white/10 cursor-not-allowed'
                  : 'border-white/20 hover:border-white/40'
              }`}
              style={{
                background: onCooldown ? undefined : `linear-gradient(135deg, ${ability.color}20, ${ability.color}10)`,
                boxShadow: onCooldown ? undefined : `0 0 20px ${ability.color}20`,
              }}
              whileHover={!onCooldown ? { scale: 1.03 } : {}}
              whileTap={!onCooldown ? { scale: 0.97 } : {}}
            >
              {/* Cooldown overlay */}
              {onCooldown && (
                <div
                  className="absolute inset-0 bg-black/60"
                  style={{
                    clipPath: `inset(${100 - cooldownPercent}% 0 0 0)`,
                  }}
                />
              )}

              <div className="flex items-center gap-2 relative z-10">
                <AbilityIcon ability={ability} size="md" />
                <div className="flex-1 text-left">
                  <p className={`text-xs font-bold ${onCooldown ? 'text-white/40' : 'text-white'}`}>
                    {ability.name}
                  </p>
                  <p className="text-[10px] text-white/50">
                    {onCooldown ? `${cooldowns[ability.id].toFixed(1)}s` : `${ability.damage} DMG`}
                  </p>
                </div>
              </div>

              {/* Element indicator */}
              <div
                className="absolute top-1 right-1 w-2 h-2 rounded-full"
                style={{ backgroundColor: ability.color }}
              />
            </motion.button>
          );
        })}
      </div>

      {/* Battle info */}
      <div className="flex justify-center gap-4 text-center mt-auto">
        <div>
          <p className="text-xs text-white/40">Use in</p>
          <p className="text-sm font-bold text-orange-400">Boss Battles</p>
        </div>
        <div className="w-px bg-white/10" />
        <div>
          <p className="text-xs text-white/40">And in</p>
          <p className="text-sm font-bold text-cyan-400">PvP Arena</p>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Demo Components Map
// ============================================
const DemoComponents = {
  xp: XPDemo,
  equipment: EquipmentPetsDemo,
  stats: StatsDemo,
  skills: SkillsDemo,
  abilities: AbilitiesDemo,
  bazaar: BazaarDemo,
};

// ============================================
// Main Component
// ============================================
export default function ImmersiveGamification({
  sectionId,
  onComplete,
  onLockScroll,
  onSectionEnter,
}) {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const carouselRef = useRef(null);
  const dotsRef = useRef(null);
  const hintRef = useRef(null);
  const continueRef = useRef(null);

  const [isInView, setIsInView] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);
  const [visitedCards, setVisitedCards] = useState(new Set([0]));

  // Touch swipe state
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const minSwipeDistance = 50;

  // Store callbacks in refs
  const onCompleteRef = useRef(onComplete);
  const onLockScrollRef = useRef(onLockScroll);
  const onSectionEnterRef = useRef(onSectionEnter);
  useEffect(() => {
    onCompleteRef.current = onComplete;
    onLockScrollRef.current = onLockScroll;
    onSectionEnterRef.current = onSectionEnter;
  }, [onComplete, onLockScroll, onSectionEnter]);

  // Track visited cards
  useEffect(() => {
    setVisitedCards(prev => new Set([...prev, currentIndex]));
    if (!hasInteracted && currentIndex > 0) {
      setHasInteracted(true);
    }
  }, [currentIndex, hasInteracted]);

  // Show continue button after viewing enough cards
  const canContinue = visitedCards.size >= 3 || hasInteracted;

  // Navigation
  const goToCard = useCallback((index) => {
    const newIndex = Math.max(0, Math.min(DEMOS.length - 1, index));
    setCurrentIndex(newIndex);
    feedback.buttonPress();
  }, []);

  const nextCard = useCallback(() => {
    goToCard(currentIndex + 1);
  }, [currentIndex, goToCard]);

  const prevCard = useCallback(() => {
    goToCard(currentIndex - 1);
  }, [currentIndex, goToCard]);

  // Touch handlers for swipe
  const onTouchStart = useCallback((e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  }, []);

  const onTouchMove = useCallback((e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  }, []);

  const onTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe) {
      nextCard();
    } else if (isRightSwipe) {
      prevCard();
    }
  }, [touchStart, touchEnd, nextCard, prevCard]);

  // Auto-play entrance animation when section comes into view
  useEffect(() => {
    if (!sectionRef.current || typeof window === 'undefined') return;

    const section = sectionRef.current;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isInView) {
            setIsInView(true);
            onSectionEnterRef.current?.();

            // Play entrance animations
            const entranceTl = gsap.timeline();

            if (titleRef.current) {
              entranceTl.fromTo(titleRef.current,
                { opacity: 0, y: 80, scale: 0.9, filter: 'blur(10px)' },
                { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: 0.6, ease: 'power3.out' },
                0
              );
            }

            if (subtitleRef.current) {
              entranceTl.fromTo(subtitleRef.current,
                { opacity: 0, y: 40 },
                { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' },
                0.2
              );
            }

            if (carouselRef.current) {
              entranceTl.fromTo(carouselRef.current,
                { opacity: 0, scale: 0.85, y: 60 },
                { opacity: 1, scale: 1, y: 0, duration: 0.6, ease: 'back.out(1.2)' },
                0.35
              );
            }

            if (dotsRef.current) {
              entranceTl.fromTo(dotsRef.current,
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out' },
                0.5
              );
            }

            if (hintRef.current) {
              entranceTl.fromTo(hintRef.current,
                { opacity: 0 },
                { opacity: 0.6, duration: 0.3, ease: 'power3.out' },
                0.6
              );
            }
          }
        });
      },
      { threshold: 0.3 }
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, [isInView]);

  // Show continue button animation
  useEffect(() => {
    if (canContinue && continueRef.current) {
      gsap.fromTo(continueRef.current,
        { opacity: 0, y: 20, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'back.out(1.5)' }
      );
    }
  }, [canContinue]);

  // Exit animation when scrolling out of view (no pinning - allows scroll back)
  useEffect(() => {
    if (!sectionRef.current || typeof window === 'undefined') return;

    const section = sectionRef.current;
    let hasExited = false;

    const exitObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // When section is leaving viewport (scrolling down past it)
          if (!entry.isIntersecting && entry.boundingClientRect.top < 0 && !hasExited) {
            hasExited = true;

            // Play exit animations
            const exitTl = gsap.timeline();

            if (continueRef.current) {
              exitTl.to(continueRef.current, { opacity: 0, y: -20, duration: 0.3 }, 0);
            }

            if (hintRef.current) {
              exitTl.to(hintRef.current, { opacity: 0, y: -20, duration: 0.3 }, 0.05);
            }

            if (dotsRef.current) {
              exitTl.to(dotsRef.current, { opacity: 0, scale: 0.8, duration: 0.3 }, 0.1);
            }

            if (carouselRef.current) {
              exitTl.to(carouselRef.current, { opacity: 0, scale: 0.85, y: -40, duration: 0.4 }, 0.15);
            }

            if (subtitleRef.current) {
              exitTl.to(subtitleRef.current, { opacity: 0, y: -30, duration: 0.3 }, 0.2);
            }

            if (titleRef.current) {
              exitTl.to(titleRef.current, { opacity: 0, y: -50, scale: 0.9, duration: 0.35 }, 0.25);
            }
          }

          // When section comes back into view (scrolling back up)
          if (entry.isIntersecting && hasExited) {
            hasExited = false;

            // Restore elements
            const restoreTl = gsap.timeline();

            if (titleRef.current) {
              restoreTl.to(titleRef.current, { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: 0.4 }, 0);
            }

            if (subtitleRef.current) {
              restoreTl.to(subtitleRef.current, { opacity: 1, y: 0, duration: 0.35 }, 0.1);
            }

            if (carouselRef.current) {
              restoreTl.to(carouselRef.current, { opacity: 1, scale: 1, y: 0, duration: 0.4 }, 0.15);
            }

            if (dotsRef.current) {
              restoreTl.to(dotsRef.current, { opacity: 1, scale: 1, duration: 0.35 }, 0.2);
            }

            if (hintRef.current) {
              restoreTl.to(hintRef.current, { opacity: 0.6, y: 0, duration: 0.3 }, 0.25);
            }

            if (continueRef.current && canContinue) {
              restoreTl.to(continueRef.current, { opacity: 1, y: 0, duration: 0.3 }, 0.3);
            }
          }
        });
      },
      { threshold: 0.1 }
    );

    exitObserver.observe(section);

    return () => exitObserver.disconnect();
  }, [canContinue]);

  // Handle continue
  const handleContinue = useCallback(() => {
    setHasCompleted(true);
    feedback.taskComplete();

    setTimeout(() => {
      onLockScrollRef.current?.(false);
      setTimeout(() => onCompleteRef.current?.(), 400);
    }, 300);
  }, []);

  return (
    <section
      ref={sectionRef}
      className="immersive-section relative min-h-screen overflow-hidden"
    >
      <div className="gamification-content">
        {/* Title */}
        <h2 ref={titleRef} className="gamification-title" style={{ opacity: 0 }}>
          Level Up Your Life
        </h2>

        {/* Subtitle */}
        <p ref={subtitleRef} className="gamification-subtitle" style={{ opacity: 0 }}>
          Play with these features — they're waiting for you
        </p>

        {/* 3D Carousel */}
        <div
          ref={carouselRef}
          className="carousel-container"
          style={{ opacity: 0, perspective: '1200px' }}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {/* Navigation Arrows */}
          <button
            className="carousel-nav carousel-nav-prev"
            onClick={prevCard}
            disabled={currentIndex === 0}
            aria-label="Previous"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          <button
            className="carousel-nav carousel-nav-next"
            onClick={nextCard}
            disabled={currentIndex === DEMOS.length - 1}
            aria-label="Next"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* Cards */}
          <div className="carousel-track">
            {DEMOS.map((demo, i) => {
              const offset = i - currentIndex;
              const angle = offset * ANGLE_PER_CARD;
              const isActive = i === currentIndex;
              const isVisible = Math.abs(offset) <= 2;

              if (!isVisible) return null;

              const DemoComponent = DemoComponents[demo.id];

              return (
                <motion.div
                  key={demo.id}
                  className="carousel-card"
                  initial={false}
                  animate={{
                    rotateY: angle,
                    z: isActive ? 0 : -200,
                    opacity: isActive ? 1 : Math.abs(offset) === 1 ? 0.5 : 0.2,
                    scale: isActive ? 1 : 0.85,
                  }}
                  transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                  onClick={() => !isActive && goToCard(i)}
                  style={{
                    transformStyle: 'preserve-3d',
                    transformOrigin: 'center center -320px',
                    cursor: isActive ? 'default' : 'pointer',
                  }}
                >
                  <div
                    className={`card-inner ${isActive ? 'card-active' : ''}`}
                    style={{
                      boxShadow: isActive ? `0 0 60px ${demo.color}30` : 'none',
                    }}
                  >
                    {/* Card Header */}
                    <div className="card-header">
                      <div
                        className="card-icon"
                        style={{ background: `${demo.color}30` }}
                      >
                        <img
                          src={demo.icon}
                          alt={demo.title}
                          style={{ imageRendering: 'pixelated' }}
                        />
                      </div>
                      <div>
                        <h3 className="card-title">{demo.title}</h3>
                        <p className="card-description">{demo.description}</p>
                      </div>
                    </div>

                    {/* Demo Content */}
                    <div className="card-content">
                      <DemoComponent isActive={isActive} />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Progress Indicators */}
        <div ref={dotsRef} className="carousel-dots" style={{ opacity: 0 }}>
          {DEMOS.map((demo, i) => (
            <button
              key={demo.id}
              className={`carousel-dot ${
                i === currentIndex
                  ? 'carousel-dot-active'
                  : i < currentIndex
                    ? 'carousel-dot-visited'
                    : ''
              }`}
              onClick={() => goToCard(i)}
              aria-label={`Go to ${demo.title}`}
            />
          ))}
        </div>

        {/* Navigation hint */}
        <p ref={hintRef} className="carousel-hint" style={{ opacity: 0 }}>
          <span className="hint-desktop">Tap arrows or cards to explore</span>
          <span className="hint-mobile">Swipe to explore</span>
          {' '}• {currentIndex + 1} of {DEMOS.length}
        </p>

        {/* Continue Button */}
        {canContinue && (
          <button
            ref={continueRef}
            className="continue-btn"
            onClick={handleContinue}
            style={{ opacity: 0 }}
          >
            <span>Continue</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
      </div>

      <style>{`
        .gamification-content {
          position: relative;
          width: 100%;
          height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }

        .gamification-title {
          font-size: clamp(2rem, 6vw, 3.5rem);
          font-weight: 700;
          color: white;
          text-align: center;
          margin-bottom: 0.5rem;
        }

        .gamification-subtitle {
          font-size: 1rem;
          color: rgba(255, 255, 255, 0.6);
          text-align: center;
          margin-bottom: 2rem;
          max-width: 500px;
        }

        /* 3D Carousel */
        .carousel-container {
          position: relative;
          width: 100%;
          height: 420px;
          max-width: 800px;
        }

        .carousel-track {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .carousel-card {
          position: absolute;
          width: 320px;
        }

        .card-inner {
          padding: 1.5rem;
          border-radius: 20px;
          border: 2px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
        }

        .card-active {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
          border-color: rgba(255, 255, 255, 0.2);
        }

        .card-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .card-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 8px;
          flex-shrink: 0;
        }

        .card-icon img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .card-title {
          font-size: 1rem;
          font-weight: 700;
          color: white;
          margin: 0;
        }

        .card-description {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.5);
          margin: 0;
        }

        .card-content {
          height: 300px;
          overflow: visible;
        }

        /* Navigation Arrows */
        .carousel-nav {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          z-index: 10;
        }

        .carousel-nav:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.2);
          transform: translateY(-50%) scale(1.1);
        }

        .carousel-nav:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .carousel-nav-prev {
          left: 0;
        }

        .carousel-nav-next {
          right: 0;
        }

        /* Progress Dots */
        .carousel-dots {
          display: flex;
          justify-content: center;
          gap: 12px;
          margin-top: 1.5rem;
        }

        .carousel-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          border: none;
          padding: 0;
          cursor: pointer;
          transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .carousel-dot:hover {
          background: rgba(255, 255, 255, 0.4);
        }

        .carousel-dot-active {
          background: linear-gradient(135deg, #8b5cf6, #06b6d4);
          transform: scale(1.5);
        }

        .carousel-dot-visited {
          background: rgba(139, 92, 246, 0.5);
        }

        .carousel-hint {
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.4);
          text-align: center;
          margin-top: 1rem;
        }

        .hint-mobile {
          display: none;
        }

        .hint-desktop {
          display: inline;
        }

        .continue-btn {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 2.5rem;
          font-size: 1.1rem;
          font-weight: 600;
          background: linear-gradient(135deg, #8b5cf6, #a855f7);
          border: none;
          border-radius: 14px;
          color: white;
          cursor: pointer;
          margin-top: 1.5rem;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .continue-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 15px 30px rgba(139, 92, 246, 0.4);
        }

        .continue-btn svg {
          transition: transform 0.3s ease;
        }

        .continue-btn:hover svg {
          transform: translateX(4px);
        }

        @media (max-width: 768px) {
          .gamification-content {
            padding: 1rem;
            padding-right: 1.5rem;
            padding-top: 3rem;
            padding-bottom: 1rem;
          }

          .gamification-title {
            font-size: clamp(1.5rem, 7vw, 2rem);
            margin-bottom: 0.25rem;
          }

          .gamification-subtitle {
            font-size: 0.85rem;
            margin-bottom: 1rem;
          }

          .carousel-container {
            height: 400px;
            touch-action: pan-y;
          }

          .carousel-card {
            width: 300px;
          }

          .card-inner {
            padding: 1.25rem;
          }

          .card-content {
            height: 280px;
            overflow: visible;
          }

          .carousel-nav {
            width: 36px;
            height: 36px;
          }

          .carousel-nav-prev {
            left: -4px;
          }

          .carousel-nav-next {
            right: -4px;
          }

          .carousel-dots {
            margin-top: 0.75rem;
            gap: 6px;
          }

          .carousel-dot {
            width: 6px;
            height: 6px;
          }

          .carousel-dot-active {
            transform: scale(1.2);
          }

          .carousel-hint {
            font-size: 0.75rem;
            margin-top: 0.75rem;
          }

          .hint-mobile {
            display: inline;
          }

          .hint-desktop {
            display: none;
          }

          .continue-btn {
            margin-top: 0.75rem;
          }
        }

        @media (max-width: 480px) {
          .gamification-content {
            padding: 0.75rem;
            padding-right: 1.25rem;
            padding-top: 2.5rem;
            padding-bottom: 0.5rem;
          }

          .gamification-title {
            font-size: 1.3rem;
          }

          .gamification-subtitle {
            font-size: 0.75rem;
            margin-bottom: 0.75rem;
          }

          .carousel-container {
            height: 380px;
          }

          .carousel-card {
            width: 280px;
          }

          .card-inner {
            padding: 1rem;
            border-radius: 14px;
          }

          .card-header {
            margin-bottom: 0.5rem;
            padding-bottom: 0.5rem;
            gap: 0.5rem;
          }

          .card-icon {
            width: 36px;
            height: 36px;
            padding: 6px;
          }

          .card-title {
            font-size: 0.875rem;
          }

          .card-description {
            font-size: 0.65rem;
          }

          .card-content {
            height: 260px;
            overflow: visible;
          }

          .carousel-nav {
            width: 28px;
            height: 28px;
          }

          .carousel-nav svg {
            width: 16px;
            height: 16px;
          }

          .carousel-nav-prev {
            left: 0;
          }

          .carousel-nav-next {
            right: 0;
          }

          .carousel-dots {
            margin-top: 0.5rem;
            gap: 5px;
          }

          .carousel-dot {
            width: 5px;
            height: 5px;
          }

          .carousel-dot-active {
            transform: scale(1.15);
          }

          .carousel-hint {
            font-size: 0.65rem;
            margin-top: 0.5rem;
          }

          .continue-btn {
            padding: 0.6rem 1.25rem;
            font-size: 0.85rem;
            margin-top: 0.5rem;
          }
        }

        @media (max-width: 360px) {
          .gamification-content {
            padding-top: 2rem;
          }

          .carousel-container {
            height: 360px;
          }

          .carousel-card {
            width: 260px;
          }

          .card-content {
            height: 240px;
          }

          .carousel-dots {
            gap: 4px;
          }

          .carousel-dot {
            width: 4px;
            height: 4px;
          }

          .carousel-dot-active {
            transform: scale(1.1);
          }
        }
      `}</style>
    </section>
  );
}
