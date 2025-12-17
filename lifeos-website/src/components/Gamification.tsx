'use client';

/**
 * Gamification Showcase Section
 *
 * Interactive 3D carousel showcasing gamification features:
 * - XP & Leveling system
 * - Equipment & Pets
 * - Stats & Skills
 * - Skill Constellation
 * - Cosmic Bazaar
 */

import { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { animate, stagger } from 'animejs';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// Demo configurations with pixel art icons
const DEMOS = [
  { id: 'xp', title: 'Experience Points', color: '#fbbf24', icon: '/assets/icons/xp_boost.png', description: 'Earn XP for every action' },
  { id: 'equipment', title: 'Equipment & Pets', color: '#a855f7', icon: '/assets/equipment/weapons/dragon_blade.png', description: 'Collect gear & companions' },
  { id: 'stats', title: 'Stats & Skills', color: '#ef4444', icon: '/assets/icons/module_skills.png', description: 'Allocate skill points' },
  { id: 'skills', title: 'Skill Constellation', color: '#3b82f6', icon: '/assets/icons/module_skills.png', description: 'Unlock abilities' },
  { id: 'bazaar', title: 'Cosmic Bazaar', color: '#10b981', icon: '/assets/bazaar/sword_novice.png', description: 'Spend your rewards' },
];

const ANGLE_PER_CARD = 360 / DEMOS.length;

// ============================================
// XP Demo Component
// ============================================
function XPDemo({ isActive }: { isActive: boolean }) {
  const [xp, setXp] = useState(25);
  const [level, setLevel] = useState(1);
  const [floatingXP, setFloatingXP] = useState<{ id: number; value: number }[]>([]);
  const barRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleEarnXP = () => {
    const earned = 25;
    const newXP = xp + earned;

    // Add floating XP indicator
    const id = Date.now();
    setFloatingXP(prev => [...prev, { id, value: earned }]);
    setTimeout(() => setFloatingXP(prev => prev.filter(f => f.id !== id)), 1000);

    if (newXP >= 100) {
      // Level up!
      setXp(newXP - 100);
      setLevel(prev => prev + 1);

      // Level up animation
      if (containerRef.current) {
        const badge = containerRef.current.querySelector('.level-badge');
        if (badge) {
          animate(badge, {
            scale: [1, 1.3, 1],
            rotate: [0, 10, -10, 0],
            duration: 600,
            ease: 'outElastic',
          });
        }
      }
    } else {
      setXp(newXP);
    }

    // Animate XP bar
    if (barRef.current) {
      animate(barRef.current, {
        width: `${(newXP >= 100 ? newXP - 100 : newXP)}%`,
        duration: 500,
        ease: 'outExpo',
      });
    }
  };

  useEffect(() => {
    if (isActive && barRef.current) {
      animate(barRef.current, {
        width: `${xp}%`,
        duration: 800,
        delay: 300,
        ease: 'outExpo',
      });
    }
  }, [isActive, xp]);

  return (
    <div ref={containerRef} className="flex flex-col items-center gap-4 h-full">
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

        {/* Floating XP indicators */}
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
function EquipmentPetsDemo({ isActive }: { isActive: boolean }) {
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
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
function StatsDemo({ isActive }: { isActive: boolean }) {
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

  const addStat = (statId: string) => {
    if (skillPoints <= 0) return;
    setStats(prev => ({ ...prev, [statId]: Math.min(100, prev[statId as keyof typeof prev] + 5) }));
    setSkillPoints(prev => prev - 1);
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
                <span className="text-white/50">{stats[stat.id as keyof typeof stats]}</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: stat.color, width: `${stats[stat.id as keyof typeof stats]}%` }}
                  initial={false}
                  animate={{ width: `${stats[stat.id as keyof typeof stats]}%` }}
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
function SkillsDemo({ isActive }: { isActive: boolean }) {
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

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

  const getSkill = (id: string) => SKILLS.find(s => s.id === id);

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

        animate(line, {
          strokeDashoffset: [length, 0],
          opacity: [0, 0.6],
          duration: 600,
          delay: i * 50,
          ease: 'outQuad',
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
function BazaarDemo({ isActive }: { isActive: boolean }) {
  const [credits, setCredits] = useState(100);
  const [purchased, setPurchased] = useState<Set<string>>(new Set());
  const [showBonus, setShowBonus] = useState(false);

  const ITEMS = [
    { id: 'sword', name: 'Novice Blade', price: 50, icon: '/assets/bazaar/sword_novice.png', color: '#9ca3af' },
    { id: 'armor', name: 'Leather Armor', price: 75, icon: '/assets/bazaar/armor_leather.png', color: '#22c55e' },
    { id: 'potion', name: 'XP Potion', price: 25, icon: '/assets/bazaar/potion_xp_small.png', color: '#ef4444' },
  ];

  useEffect(() => {
    if (isActive) {
      setTimeout(() => setShowBonus(true), 300);
    }
  }, [isActive]);

  const handlePurchase = (item: typeof ITEMS[0]) => {
    if (purchased.has(item.id) || credits < item.price) return;
    setCredits(prev => prev - item.price);
    setPurchased(prev => new Set([...prev, item.id]));
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
// Demo Components Map
// ============================================
const DemoComponents: Record<string, React.ComponentType<{ isActive: boolean }>> = {
  xp: XPDemo,
  equipment: EquipmentPetsDemo,
  stats: StatsDemo,
  skills: SkillsDemo,
  bazaar: BazaarDemo,
};

// ============================================
// Main Gamification Component
// ============================================
export function Gamification() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const dotsRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLParagraphElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // GSAP ScrollTrigger - scroll controls carousel progression
  useEffect(() => {
    if (!sectionRef.current || typeof window === 'undefined') return;

    const section = sectionRef.current;
    const numCards = DEMOS.length;
    const isMobile = window.innerWidth < 768;

    // On mobile, show content immediately without pinned scrolling
    if (isMobile) {
      if (titleRef.current) titleRef.current.style.opacity = '1';
      if (subtitleRef.current) subtitleRef.current.style.opacity = '1';
      if (carouselRef.current) {
        carouselRef.current.style.opacity = '1';
        carouselRef.current.style.transform = 'none';
      }
      if (dotsRef.current) dotsRef.current.style.opacity = '1';
      if (hintRef.current) hintRef.current.style.opacity = '1';
      if (progressRef.current) progressRef.current.style.opacity = '1';
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=500%', // Original scroll distance
          scrub: 1,
          pin: true,
          pinSpacing: false,
          anticipatePin: 1,
          onUpdate: (self) => {
            const progress = self.progress;

            // Phase breakdown:
            // 0.00 - 0.28: Wait for AIShowcase to dismantle
            // 0.28 - 0.40: Build animations
            // 0.40 - 0.68: Carousel progression
            // 0.68 - 0.80: Dismantle animations (faster!)
            // 0.80 - 1.00: Buffer

            if (progress >= 0.40 && progress <= 0.68) {
              // Map progress 0.40-0.68 to card index 0 to (numCards-1)
              const carouselProgress = (progress - 0.40) / 0.28;
              const cardIndex = Math.min(
                Math.floor(carouselProgress * numCards),
                numCards - 1
              );
              setCurrentIndex(cardIndex);
            } else if (progress < 0.40) {
              setCurrentIndex(0);
            }
          },
        },
      });

      // ===== PHASE 1: Build (0.28 - 0.40) =====
      // Wait for AIShowcase to dismantle
      const BUILD_OFFSET = 0.28;

      // Title appears
      if (titleRef.current) {
        gsap.set(titleRef.current, { opacity: 0, y: 60, scale: 0.95 });
        tl.to(titleRef.current,
          { opacity: 1, y: 0, scale: 1, duration: 0.05, ease: 'power3.out' },
          BUILD_OFFSET
        );
      }

      // Subtitle appears
      if (subtitleRef.current) {
        gsap.set(subtitleRef.current, { opacity: 0, y: 40 });
        tl.to(subtitleRef.current,
          { opacity: 1, y: 0, duration: 0.04, ease: 'power3.out' },
          BUILD_OFFSET + 0.03
        );
      }

      // Carousel appears
      if (carouselRef.current) {
        gsap.set(carouselRef.current, { opacity: 0, scale: 0.85, y: 60 });
        tl.to(carouselRef.current,
          { opacity: 1, scale: 1, y: 0, duration: 0.06, ease: 'back.out(1.2)' },
          BUILD_OFFSET + 0.05
        );
      }

      // Dots appear
      if (dotsRef.current) {
        gsap.set(dotsRef.current, { opacity: 0, y: 20 });
        tl.to(dotsRef.current,
          { opacity: 1, y: 0, duration: 0.03, ease: 'power3.out' },
          BUILD_OFFSET + 0.08
        );
      }

      // Hint appears
      if (hintRef.current) {
        gsap.set(hintRef.current, { opacity: 0 });
        tl.to(hintRef.current,
          { opacity: 1, duration: 0.02, ease: 'power3.out' },
          BUILD_OFFSET + 0.09
        );
      }

      // Progress bar appears
      if (progressRef.current) {
        gsap.set(progressRef.current, { opacity: 0 });
        tl.to(progressRef.current,
          { opacity: 1, duration: 0.02, ease: 'power3.out' },
          BUILD_OFFSET + 0.10
        );
      }

      // ===== PHASE 2: Carousel Hold (0.40 - 0.68) =====
      // Scroll progress controls card index via onUpdate

      // ===== PHASE 3: Dismantle (0.68 - 0.80) - faster dismantle =====

      // Hint fades
      if (hintRef.current) {
        tl.to(hintRef.current,
          { opacity: 0, duration: 0.02, ease: 'power2.in' },
          0.68
        );
      }

      // Progress bar fades
      if (progressRef.current) {
        tl.to(progressRef.current,
          { opacity: 0, y: 20, duration: 0.02, ease: 'power2.in' },
          0.69
        );
      }

      // Dots fade
      if (dotsRef.current) {
        tl.to(dotsRef.current,
          { opacity: 0, scale: 0.8, duration: 0.02, ease: 'power2.in' },
          0.70
        );
      }

      // Carousel exits dramatically
      if (carouselRef.current) {
        tl.to(carouselRef.current,
          {
            opacity: 0,
            scale: 0.7,
            y: -80,
            rotateX: 15,
            filter: 'blur(10px)',
            duration: 0.04,
            ease: 'power3.in'
          },
          0.71
        );
      }

      // Subtitle fades
      if (subtitleRef.current) {
        tl.to(subtitleRef.current,
          { opacity: 0, y: -50, duration: 0.02, ease: 'power3.in' },
          0.75
        );
      }

      // Title exits with scale
      if (titleRef.current) {
        tl.to(titleRef.current,
          {
            opacity: 0,
            scale: 1.1,
            y: -60,
            filter: 'blur(8px)',
            duration: 0.03,
            ease: 'power3.in'
          },
          0.77
        );
      }

    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="gamification"
      ref={sectionRef}
      className="relative min-h-screen overflow-hidden"
    >

      {/* Ambient Background */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/15 rounded-full blur-[128px] pointer-events-none"
        animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-500/15 rounded-full blur-[100px] pointer-events-none"
        animate={{ scale: [1, 1.15, 1], opacity: [0.1, 0.15, 0.1] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />

      <div className="container-wide relative z-10 min-h-screen flex flex-col items-center justify-center py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h2
            ref={titleRef}
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4"
            style={{ opacity: 0 }}
          >
            Level Up Your Life
          </h2>
          <p
            ref={subtitleRef}
            className="text-white/60 text-lg max-w-xl mx-auto"
            style={{ opacity: 0 }}
          >
            Play with these features — they're waiting for you
          </p>
        </div>

        {/* 3D Carousel - scroll controlled, stacked on mobile */}
        <div
          ref={carouselRef}
          className="relative w-full h-auto md:h-[480px] flex flex-col md:block"
          style={{ opacity: 0, perspective: '1200px' }}
        >
          <div className="relative md:absolute md:inset-0 flex flex-col md:flex-row items-center justify-center gap-4 md:gap-0 px-4 md:px-0">
            {DEMOS.map((demo, i) => {
              const offset = i - currentIndex;
              const angle = offset * ANGLE_PER_CARD;
              const isActive = i === currentIndex;
              const isVisible = Math.abs(offset) <= 2;

              // On mobile, show all cards stacked
              const isMobileView = typeof window !== 'undefined' && window.innerWidth < 768;

              if (!isVisible && !isMobileView) return null;

              const DemoComponent = DemoComponents[demo.id];

              return (
                <motion.div
                  key={demo.id}
                  className="relative md:absolute w-full max-w-[320px]"
                  initial={false}
                  animate={isMobileView ? {} : {
                    rotateY: angle,
                    z: isActive ? 0 : -200,
                    opacity: isActive ? 1 : Math.abs(offset) === 1 ? 0.5 : 0.2,
                    scale: isActive ? 1 : 0.85,
                  }}
                  transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                  style={{
                    transformStyle: 'preserve-3d',
                    transformOrigin: 'center center -320px',
                  }}
                >
                  <div
                    className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                      isActive
                        ? 'bg-gradient-to-br from-white/10 to-white/5 border-white/20 shadow-2xl'
                        : 'bg-white/5 border-white/10'
                    }`}
                    style={{
                      boxShadow: isActive ? `0 0 60px ${demo.color}30` : 'none',
                    }}
                  >
                    {/* Card Header */}
                    <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/10">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center p-2"
                        style={{ background: `${demo.color}30` }}
                      >
                        <img
                          src={demo.icon}
                          alt={demo.title}
                          className="w-full h-full object-contain pixelated"
                          style={{ imageRendering: 'pixelated' }}
                        />
                      </div>
                      <div>
                        <h3 className="font-bold text-white">{demo.title}</h3>
                        <p className="text-xs text-white/50">{demo.description}</p>
                      </div>
                    </div>

                    {/* Demo Content */}
                    <div className="h-[300px]">
                      <DemoComponent isActive={isActive} />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Progress Indicators - hidden on mobile */}
        <div
          ref={dotsRef}
          className="hidden md:flex justify-center gap-3 mt-8"
          style={{ opacity: 0 }}
        >
          {DEMOS.map((demo, i) => (
            <div
              key={demo.id}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${
                i === currentIndex
                  ? 'bg-gradient-to-r from-purple-500 to-cyan-500 scale-150'
                  : i < currentIndex
                    ? 'bg-purple-500/50'
                    : 'bg-white/20'
              }`}
            />
          ))}
        </div>

        {/* Navigation hint - hidden on mobile */}
        <p
          ref={hintRef}
          className="hidden md:block text-center text-white/40 text-sm mt-4"
          style={{ opacity: 0 }}
        >
          Scroll to explore features • {currentIndex + 1} of {DEMOS.length}
        </p>

        {/* Progress bar - hidden on mobile */}
        <div
          ref={progressRef}
          className="hidden md:block max-w-md mx-auto mt-4"
          style={{ opacity: 0 }}
        >
          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full"
              initial={false}
              animate={{ width: `${((currentIndex + 1) / DEMOS.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
