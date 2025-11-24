import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Swords,
  Brain,
  Heart,
  Coins,
  Users,
  Wrench,
  Star,
  ChevronLeft,
  Lock,
  Check
} from 'lucide-react';
import { PERK_TREES } from '../data/perkTrees';

/**
 * Skyrim-Inspired Skill Tree System
 * 6 Primary Stats: Body, Mind, Spirit, Wealth, Social, Craft
 * Each stat has a constellation with perks
 */

// Stat definitions with Skyrim-style theming
const STATS = [
  {
    id: 'body',
    name: 'BODY',
    subtitle: 'The Warrior',
    icon: Swords,
    color: '#d97757',
    nebula: 'warrior',
    description: 'Physical strength, endurance, and vitality',
    skills: ['Strength', 'Endurance', 'Nutrition', 'Recovery', 'Vitality']
  },
  {
    id: 'mind',
    name: 'MIND',
    subtitle: 'The Mage',
    icon: Brain,
    color: '#7b68d9',
    nebula: 'mage',
    description: 'Intelligence, focus, and mastery',
    skills: ['Intelligence', 'Focus', 'Creativity', 'Wisdom', 'Mastery']
  },
  {
    id: 'spirit',
    name: 'SPIRIT',
    subtitle: 'The Mystic',
    icon: Heart,
    color: '#57d9d4',
    nebula: 'mystic',
    description: 'Mindfulness, gratitude, and inner peace',
    skills: ['Mindfulness', 'Gratitude', 'Self-Awareness', 'Emotional Intelligence', 'Inner Peace']
  },
  {
    id: 'wealth',
    name: 'WEALTH',
    subtitle: 'The Merchant',
    icon: Coins,
    color: '#d9c157',
    nebula: 'merchant',
    description: 'Financial mastery and abundance',
    skills: ['Income', 'Savings', 'Investing', 'Business', 'Abundance']
  },
  {
    id: 'social',
    name: 'SOCIAL',
    subtitle: 'The Diplomat',
    icon: Users,
    color: '#57d98a',
    nebula: 'diplomat',
    description: 'Charisma, networking, and influence',
    skills: ['Charisma', 'Networking', 'Communication', 'Leadership', 'Relationships']
  },
  {
    id: 'craft',
    name: 'CRAFT',
    subtitle: 'The Artisan',
    icon: Wrench,
    color: '#b8b8c8',
    nebula: 'artisan',
    description: 'Skill mastery and craftsmanship',
    skills: ['Coding', 'Design', 'Writing', 'Music', 'Art']
  }
];

// Mock data for character stats
const mockCharacterData = {
  level: 24,
  body: { level: 38, xp: 2450, xpToNext: 4200, perksUnlocked: 8, perkPoints: 5, unlockedPerks: ['body_foundation', 'body_endurance_1', 'body_strength_1', 'body_nutrition_basics', 'body_recovery_1', 'body_endurance_2', 'body_strength_2', 'body_synergy_mind'] },
  mind: { level: 52, xp: 8900, xpToNext: 11500, perksUnlocked: 15, perkPoints: 2, unlockedPerks: ['mind_foundation', 'mind_reader_1', 'mind_focus_1', 'mind_note_taker', 'mind_curiosity', 'mind_reader_2', 'mind_focus_2', 'mind_synthesizer', 'mind_polymath', 'mind_teacher', 'mind_genius', 'mind_speed_reader', 'mind_hyperfocus', 'mind_master_learner', 'mind_infinite'] },
  spirit: { level: 29, xp: 1200, xpToNext: 2800, perksUnlocked: 6, perkPoints: 8, unlockedPerks: ['spirit_foundation', 'spirit_meditation_1', 'spirit_gratitude_1', 'spirit_journal', 'spirit_awareness', 'spirit_meditation_2'] },
  wealth: { level: 18, xp: 450, xpToNext: 1500, perksUnlocked: 3, perkPoints: 12, unlockedPerks: ['wealth_foundation', 'wealth_tracking', 'wealth_budgeting'] },
  social: { level: 15, xp: 200, xpToNext: 1200, perksUnlocked: 2, perkPoints: 10, unlockedPerks: ['social_foundation', 'social_conversationalist'] },
  craft: { level: 42, xp: 5600, xpToNext: 7800, perksUnlocked: 11, perkPoints: 3, unlockedPerks: ['craft_foundation', 'craft_practice', 'craft_learning', 'craft_consistency', 'craft_portfolio', 'craft_specialist', 'craft_polymath', 'craft_10000_hours', 'craft_feedback', 'craft_creative', 'craft_expert'] }
};

export default function SkillTreeNew() {
  const [selectedStat, setSelectedStat] = useState(null);
  const canvasRef = useRef(null);

  // Draw enhanced space background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = window.innerWidth;
    const height = window.innerHeight;

    canvas.width = width;
    canvas.height = height;

    // Deep space gradient background
    const bgGradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, Math.max(width, height));
    bgGradient.addColorStop(0, '#0a0a12');
    bgGradient.addColorStop(0.5, '#05050a');
    bgGradient.addColorStop(1, '#000000');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // Enhanced nebula rendering with smoother blending
    const drawNebula = (x, y, radius, color, opacity) => {
      // Main nebula core
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, `rgba(${color}, ${opacity * 0.25})`);
      gradient.addColorStop(0.2, `rgba(${color}, ${opacity * 0.18})`);
      gradient.addColorStop(0.5, `rgba(${color}, ${opacity * 0.08})`);
      gradient.addColorStop(0.8, `rgba(${color}, ${opacity * 0.02})`);
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);

      // Nebula wisps
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2 + Math.random() * 0.5;
        const dist = radius * (0.4 + Math.random() * 0.3);
        const dx = Math.cos(angle) * dist;
        const dy = Math.sin(angle) * dist;
        const wispRadius = radius * (0.3 + Math.random() * 0.2);

        const wispGradient = ctx.createRadialGradient(x + dx, y + dy, 0, x + dx, y + dy, wispRadius);
        wispGradient.addColorStop(0, `rgba(${color}, ${opacity * 0.15})`);
        wispGradient.addColorStop(0.5, `rgba(${color}, ${opacity * 0.06})`);
        wispGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = wispGradient;
        ctx.fillRect(x + dx - wispRadius, y + dy - wispRadius, wispRadius * 2, wispRadius * 2);
      }
    };

    // Position nebulas more strategically
    drawNebula(width * 0.2, height * 0.7, 450, '217, 119, 87', 1.0); // Warrior (warm orange)
    drawNebula(width * 0.5, height * 0.3, 500, '123, 104, 217', 1.0); // Mage (deep purple)
    drawNebula(width * 0.8, height * 0.6, 420, '87, 217, 212', 1.0); // Mystic (cyan)
    drawNebula(width * 0.35, height * 0.85, 380, '217, 193, 87', 1.0); // Merchant (gold)
    drawNebula(width * 0.1, height * 0.35, 360, '87, 217, 138', 1.0); // Diplomat (green)
    drawNebula(width * 0.85, height * 0.2, 400, '184, 184, 200', 1.0); // Artisan (silver)

    // Distant galaxies/nebulas for depth
    for (let i = 0; i < 5; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = 80 + Math.random() * 120;
      const hue = Math.random() * 360;
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
      gradient.addColorStop(0, `hsla(${hue}, 60%, 50%, 0.03)`);
      gradient.addColorStop(0.5, `hsla(${hue}, 60%, 50%, 0.01)`);
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.fillRect(x - size, y - size, size * 2, size * 2);
    }

    // Enhanced star field with depth layers
    const drawStarLayer = (count, sizeRange, brightnessRange, layer) => {
      for (let i = 0; i < count; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = sizeRange[0] + Math.random() * (sizeRange[1] - sizeRange[0]);
        const brightness = brightnessRange[0] + Math.random() * (brightnessRange[1] - brightnessRange[0]);

        // Star color temperature
        const temp = Math.random();
        let r, g, b;
        if (temp < 0.1) {
          // Blue giants
          r = 180 + Math.random() * 50;
          g = 200 + Math.random() * 40;
          b = 255;
        } else if (temp < 0.7) {
          // Yellow-white (sun-like)
          r = 255;
          g = 245 + Math.random() * 10;
          b = 220 + Math.random() * 30;
        } else {
          // Pure white
          r = g = b = 240 + Math.random() * 15;
        }

        // Subtle glow
        if (size > 0.8) {
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${brightness * 0.2})`;
          ctx.beginPath();
          ctx.arc(x, y, size * 2.5, 0, Math.PI * 2);
          ctx.fill();
        }

        // Star core
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${brightness})`;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    // Multi-layer stars for depth
    drawStarLayer(800, [0.3, 0.6], [0.2, 0.4], 'far'); // Distant stars
    drawStarLayer(300, [0.6, 1.2], [0.4, 0.7], 'mid'); // Mid-distance
    drawStarLayer(80, [1.2, 2.5], [0.7, 1.0], 'near'); // Bright foreground stars

    // Subtle shooting stars
    for (let i = 0; i < 2; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height * 0.5;
      const length = 60 + Math.random() * 80;
      const angle = Math.random() * Math.PI * 0.5 + Math.PI * 0.25;

      const gradient = ctx.createLinearGradient(x, y, x + Math.cos(angle) * length, y + Math.sin(angle) * length);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
      gradient.addColorStop(0.1, 'rgba(255, 255, 255, 0.4)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.strokeStyle = gradient;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length);
      ctx.stroke();
    }

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">
      {/* Space Background Canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 -z-10"
        style={{ imageRendering: 'crisp-edges' }}
      />

      {/* Main Content */}
      <AnimatePresence mode="wait">
        {!selectedStat ? (
          <ConstellationOverview
            key="overview"
            stats={STATS}
            characterData={mockCharacterData}
            onSelectStat={setSelectedStat}
          />
        ) : (
          <SkillTreeView
            key="skilltree"
            stat={STATS.find(s => s.id === selectedStat)}
            characterData={mockCharacterData}
            onBack={() => setSelectedStat(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Constellation Overview - Main selection screen
function ConstellationOverview({ stats, characterData, onSelectStat }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative z-10 p-6 md:p-8"
    >
      {/* Header */}
      <div className="text-center mb-16">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 25 }}
          className="inline-block mb-3"
        >
          <div className="relative">
            <h1
              className="text-4xl md:text-5xl font-bold tracking-wider relative z-10"
              style={{
                background: 'linear-gradient(180deg, #ffffff 0%, #d4d4d8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 0 30px rgba(255,255,255,0.3)',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                fontWeight: 700
              }}
            >
              CONSTELLATION SKILLS
            </h1>
            {/* Subtle glow underneath */}
            <div
              className="absolute inset-0 blur-2xl opacity-40"
              style={{
                background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.4) 0%, transparent 70%)'
              }}
            />
          </div>
        </motion.div>
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="flex items-center justify-center gap-3"
        >
          <div className="h-px w-12 bg-gradient-to-r from-transparent to-gray-600" />
          <span className="text-lg text-gray-400 font-medium">Level {characterData.level}</span>
          <div className="h-px w-12 bg-gradient-to-l from-transparent to-gray-600" />
        </motion.div>
      </div>

      {/* Constellation Grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {stats.map((stat, index) => (
          <ConstellationCard
            key={stat.id}
            stat={stat}
            data={characterData[stat.id]}
            index={index}
            onClick={() => onSelectStat(stat.id)}
          />
        ))}
      </div>

      {/* Bottom instruction */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-center mt-16 text-gray-500 text-xs tracking-widest uppercase"
      >
        Select a constellation to explore perks
      </motion.div>
    </motion.div>
  );
}

// Individual constellation card
function ConstellationCard({ stat, data, index, onClick }) {
  const Icon = stat.icon;
  const progress = (data.xp / data.xpToNext) * 100;

  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: index * 0.08, type: 'spring', stiffness: 200, damping: 20 }}
      whileHover={{ scale: 1.03, y: -8 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="relative group"
    >
      {/* Glow effect behind card */}
      <div
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-60 transition-all duration-700 blur-2xl"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${stat.color}50 0%, transparent 70%)`,
        }}
      />

      {/* Card background with refined glassmorphism */}
      <div
        className="relative border rounded-xl p-6 backdrop-blur-md transition-all duration-500 overflow-hidden"
        style={{
          borderColor: `${stat.color}40`,
          background: `linear-gradient(135deg, rgba(20, 20, 30, 0.8) 0%, rgba(10, 10, 15, 0.9) 100%)`,
          boxShadow: `0 4px 20px ${stat.color}15, inset 0 1px 0 ${stat.color}20`
        }}
      >
        {/* Subtle top highlight */}
        <div
          className="absolute top-0 left-0 right-0 h-px opacity-50"
          style={{
            background: `linear-gradient(90deg, transparent 0%, ${stat.color}60 50%, transparent 100%)`
          }}
        />

        {/* Hover glow overlay */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background: `radial-gradient(circle at 50% 0%, ${stat.color}15 0%, transparent 60%)`
          }}
        />

        {/* Content */}
        <div className="relative z-10">
          {/* Icon with refined glow */}
          <div className="flex justify-center mb-5">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 group-hover:scale-110 relative"
              style={{
                background: `radial-gradient(circle, ${stat.color}25 0%, ${stat.color}08 60%, transparent 100%)`,
              }}
            >
              {/* Icon glow ring */}
              <div
                className="absolute inset-0 rounded-full opacity-50 group-hover:opacity-80 transition-opacity duration-500"
                style={{
                  boxShadow: `0 0 20px ${stat.color}40, inset 0 0 15px ${stat.color}15`
                }}
              />
              <Icon
                className="w-8 h-8 relative z-10 transition-all duration-500 group-hover:scale-110 group-hover:rotate-12"
                style={{
                  color: stat.color,
                  filter: `drop-shadow(0 2px 8px ${stat.color}80)`
                }}
              />
            </div>
          </div>

          {/* Title with cleaner glow */}
          <h2
            className="text-xl font-bold mb-0.5 tracking-wide transition-all duration-300"
            style={{
              color: stat.color,
              textShadow: `0 0 15px ${stat.color}70, 0 2px 8px ${stat.color}40`,
              fontFamily: 'system-ui, -apple-system, sans-serif',
              fontWeight: 600
            }}
          >
            {stat.name}
          </h2>
          <p className="text-xs text-gray-400 mb-4 font-medium">{stat.subtitle}</p>

          {/* Level and Progress */}
          <div className="space-y-2.5">
            <div className="flex justify-between text-sm">
              <span className="text-gray-300 font-medium">Lv. {data.level}</span>
              <span className="text-gray-500 text-xs">{data.perksUnlocked} perks</span>
            </div>

            {/* XP Bar with refined styling */}
            <div className="relative h-1.5 bg-gray-900/60 rounded-full overflow-hidden backdrop-blur-sm">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1.2, delay: index * 0.08 + 0.3, ease: 'easeOut' }}
                className="h-full rounded-full relative"
                style={{
                  background: `linear-gradient(90deg, ${stat.color}80 0%, ${stat.color} 100%)`,
                }}
              >
                {/* Glow on progress bar */}
                <div
                  className="absolute inset-0 opacity-60"
                  style={{
                    boxShadow: `0 0 8px ${stat.color}90`
                  }}
                />
              </motion.div>
            </div>

            <div className="text-xs text-gray-500 text-right font-mono">
              {data.xp.toLocaleString()} / {data.xpToNext.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Constellation pattern background - subtle enhancement */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.07] group-hover:opacity-20 transition-all duration-700 rounded-xl overflow-hidden">
        <ConstellationMiniature color={stat.color} />
      </div>
    </motion.button>
  );
}

// Mini constellation preview - Skyrim-style detailed pattern
function ConstellationMiniature({ color }) {
  return (
    <svg className="w-full h-full" viewBox="0 0 100 100">
      {/* More complex constellation pattern like Skyrim */}
      {/* Connection lines first (behind stars) */}
      <line x1="50" y1="15" x2="30" y2="35" stroke={color} strokeWidth="0.8" opacity="0.4" />
      <line x1="50" y1="15" x2="70" y2="35" stroke={color} strokeWidth="0.8" opacity="0.4" />
      <line x1="30" y1="35" x2="20" y2="55" stroke={color} strokeWidth="0.6" opacity="0.3" />
      <line x1="30" y1="35" x2="50" y2="50" stroke={color} strokeWidth="0.8" opacity="0.4" />
      <line x1="70" y1="35" x2="80" y2="55" stroke={color} strokeWidth="0.6" opacity="0.3" />
      <line x1="70" y1="35" x2="50" y2="50" stroke={color} strokeWidth="0.8" opacity="0.4" />
      <line x1="50" y1="50" x2="40" y2="70" stroke={color} strokeWidth="0.8" opacity="0.4" />
      <line x1="50" y1="50" x2="60" y2="70" stroke={color} strokeWidth="0.8" opacity="0.4" />
      <line x1="40" y1="70" x2="50" y2="85" stroke={color} strokeWidth="0.8" opacity="0.4" />
      <line x1="60" y1="70" x2="50" y2="85" stroke={color} strokeWidth="0.8" opacity="0.4" />

      {/* Stars with glows */}
      {[
        { x: 50, y: 15, r: 2.5 },
        { x: 30, y: 35, r: 2 },
        { x: 70, y: 35, r: 2 },
        { x: 20, y: 55, r: 1.2 },
        { x: 80, y: 55, r: 1.2 },
        { x: 50, y: 50, r: 2.5 },
        { x: 40, y: 70, r: 1.8 },
        { x: 60, y: 70, r: 1.8 },
        { x: 50, y: 85, r: 2 }
      ].map((star, i) => (
        <g key={i}>
          {/* Outer glow */}
          <circle cx={star.x} cy={star.y} r={star.r * 3} fill={color} opacity="0.1" />
          {/* Middle glow */}
          <circle cx={star.x} cy={star.y} r={star.r * 1.8} fill={color} opacity="0.3" />
          {/* Star core */}
          <circle cx={star.x} cy={star.y} r={star.r} fill={color} opacity="0.8" />
          <circle cx={star.x} cy={star.y} r={star.r * 0.5} fill="#ffffff" opacity="0.6" />
        </g>
      ))}
    </svg>
  );
}

// Detailed skill tree view (perk constellation)
function SkillTreeView({ stat, characterData, onBack }) {
  const Icon = stat.icon;
  const data = characterData[stat.id];

  // State for unlocked perks and perk points
  const [unlockedPerks, setUnlockedPerks] = useState(data.unlockedPerks || []);
  const [perkPoints, setPerkPoints] = useState(data.perkPoints || 0);

  // Get real perk tree data
  const perkTree = generatePerkTree(stat, data.level, unlockedPerks);

  // Handle perk unlock
  const handlePerkUnlock = (perkId) => {
    // Check if player has perk points
    if (perkPoints <= 0) {
      console.log('No perk points available');
      return;
    }

    // Check if perk is already unlocked
    if (unlockedPerks.includes(perkId)) {
      console.log('Perk already unlocked');
      return;
    }

    // Find the perk
    const perk = perkTree.perks.find(p => p.id === perkId);
    if (!perk) return;

    // Check level requirement
    if (data.level < perk.requiredLevel) {
      console.log(`Level ${perk.requiredLevel} required`);
      return;
    }

    // Check prerequisites
    const prerequisitesMet = perk.prerequisites.every(prereqId =>
      unlockedPerks.includes(prereqId)
    );

    if (!prerequisitesMet) {
      console.log('Prerequisites not met');
      return;
    }

    // Unlock the perk
    setUnlockedPerks([...unlockedPerks, perkId]);
    setPerkPoints(perkPoints - 1);
    console.log(`Unlocked perk: ${perk.name}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="relative z-10 h-screen flex flex-col"
    >
      {/* Header with stat info */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="tracking-wider">BACK</span>
          </button>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{
                  background: `radial-gradient(circle, ${stat.color}30 0%, ${stat.color}10 100%)`,
                  boxShadow: `0 0 20px ${stat.color}40`
                }}
              >
                <Icon className="w-6 h-6" style={{ color: stat.color }} />
              </div>
              <div>
                <h2
                  className="text-2xl font-bold tracking-wider"
                  style={{
                    color: stat.color,
                    textShadow: `0 0 10px ${stat.color}80`,
                    fontFamily: 'serif'
                  }}
                >
                  {stat.name}
                </h2>
                <p className="text-sm text-gray-500">{stat.subtitle}</p>
              </div>
            </div>

            <div className="text-right">
              <div className="text-3xl font-bold" style={{ color: stat.color }}>
                {data.level}
              </div>
              <div className="text-xs text-gray-500">LEVEL</div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* Perk Points */}
            <div className="text-center">
              <div
                className="text-3xl font-bold"
                style={{
                  color: stat.color,
                  textShadow: `0 0 10px ${stat.color}80`
                }}
              >
                {perkPoints}
              </div>
              <div className="text-xs text-gray-500 tracking-wide">PERK POINTS</div>
            </div>

            {/* XP Progress */}
            <div className="w-48">
              <div className="text-xs text-gray-400 mb-1">
                {data.xp.toLocaleString()} / {data.xpToNext.toLocaleString()} XP
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${(data.xp / data.xpToNext) * 100}%`,
                    background: `linear-gradient(90deg, ${stat.color}60 0%, ${stat.color} 100%)`,
                    boxShadow: `0 0 10px ${stat.color}60`
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Perk Constellation */}
      <div className="flex-1 relative overflow-hidden">
        <PerkConstellation
          perkTree={perkTree}
          color={stat.color}
          statName={stat.name}
          onPerkClick={handlePerkUnlock}
          characterLevel={data.level}
          unlockedPerks={unlockedPerks}
        />
      </div>
    </motion.div>
  );
}

// Perk constellation visualization
function PerkConstellation({ perkTree, color, onPerkClick, characterLevel, unlockedPerks }) {
  const [hoveredPerk, setHoveredPerk] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // Convert color to RGB
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 100, g: 100, b: 100 };
  };

  const rgb = hexToRgb(color);
  const rgbString = `${rgb.r}, ${rgb.g}, ${rgb.b}`;

  const handlePerkHover = (perk, event) => {
    setHoveredPerk(perk);
    if (event && event.target) {
      const rect = event.target.getBoundingClientRect();
      setTooltipPos({ x: rect.left + rect.width / 2, y: rect.top });
    }
  };

  const handlePerkLeave = () => {
    setHoveredPerk(null);
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      {/* Refined nebula background - cleaner and more subtle */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Main central glow */}
        <div
          className="absolute inset-0 opacity-80"
          style={{
            background: `radial-gradient(ellipse 900px 700px at 50% 50%, rgba(${rgbString}, 0.12) 0%, rgba(${rgbString}, 0.05) 40%, transparent 70%)`
          }}
        />

        {/* Soft ambient light layers */}
        <div
          className="absolute inset-0 opacity-60"
          style={{
            background: `radial-gradient(ellipse 600px 400px at 40% 40%, rgba(${rgbString}, 0.08) 0%, transparent 55%)`
          }}
        />
        <div
          className="absolute inset-0 opacity-60"
          style={{
            background: `radial-gradient(ellipse 600px 400px at 60% 60%, rgba(${rgbString}, 0.08) 0%, transparent 55%)`
          }}
        />
      </div>

      {/* SVG Constellation */}
      <svg className="w-full h-full" viewBox="0 0 800 600">
        {/* Connection lines with refined styling */}
        {perkTree.connections.map((conn, i) => {
          const unlocked = conn.unlocked;
          return (
            <g key={`line-${i}`}>
              {/* Outer glow for unlocked connections */}
              {unlocked && (
                <line
                  x1={perkTree.perks[conn.from].x}
                  y1={perkTree.perks[conn.from].y}
                  x2={perkTree.perks[conn.to].x}
                  y2={perkTree.perks[conn.to].y}
                  stroke={color}
                  strokeWidth="4"
                  opacity="0.15"
                  strokeLinecap="round"
                />
              )}
              {/* Main line */}
              <line
                x1={perkTree.perks[conn.from].x}
                y1={perkTree.perks[conn.from].y}
                x2={perkTree.perks[conn.to].x}
                y2={perkTree.perks[conn.to].y}
                stroke={unlocked ? color : '#333'}
                strokeWidth={unlocked ? "2" : "1"}
                opacity={unlocked ? "0.7" : "0.25"}
                strokeDasharray={unlocked ? "0" : "4,4"}
                strokeLinecap="round"
              />
            </g>
          );
        })}

        {/* Perk nodes */}
        {perkTree.perks.map((perk, i) => {
          // Determine if perk is available to unlock
          const prerequisitesMet = perk.prerequisites.every(prereqId =>
            unlockedPerks.includes(prereqId)
          );
          const levelMet = characterLevel >= perk.requiredLevel;
          const isAvailable = !perk.unlocked && prerequisitesMet && levelMet;

          return (
            <PerkNode
              key={i}
              perk={perk}
              color={color}
              onClick={() => onPerkClick(perk.id)}
              isAvailable={isAvailable}
              onHover={handlePerkHover}
              onLeave={handlePerkLeave}
            />
          );
        })}
      </svg>

      {/* HTML Tooltip - rendered outside SVG for better visibility */}
      {hoveredPerk && (
        <div
          className="fixed z-[9999] pointer-events-none"
          style={{
            left: `${tooltipPos.x}px`,
            top: `${tooltipPos.y - 140}px`,
            transform: 'translateX(-50%)'
          }}
        >
          <div
            className="rounded-lg p-4 shadow-2xl border-4"
            style={{
              backgroundColor: '#000000',
              borderColor: color,
              minWidth: '300px',
              maxWidth: '350px',
              boxShadow: `0 0 30px ${color}, 0 10px 40px rgba(0,0,0,0.8)`
            }}
          >
            {/* Perk Name */}
            <div
              className="text-xl font-bold mb-2"
              style={{
                color: color,
                fontFamily: 'serif',
                textShadow: `0 0 20px ${color}, 0 0 40px ${color}80`,
                filter: 'brightness(1.2)'
              }}
            >
              {hoveredPerk.name}
            </div>

            {/* Tier and Type */}
            <div className="text-xs text-gray-400 uppercase mb-3 tracking-wider">
              {hoveredPerk.tier} • {hoveredPerk.type}
            </div>

            {/* Description */}
            <div className="text-sm text-gray-200 mb-4 leading-relaxed">
              {hoveredPerk.description}
            </div>

            {/* Status */}
            <div
              className="text-sm font-bold px-3 py-2 rounded"
              style={{
                backgroundColor: hoveredPerk.unlocked
                  ? '#4ade8030'
                  : unlockedPerks.includes(hoveredPerk.id)
                  ? '#57d9d430'
                  : '#ef444430',
                color: hoveredPerk.unlocked
                  ? '#4ade80'
                  : unlockedPerks.includes(hoveredPerk.id)
                  ? '#57d9d4'
                  : '#ef4444'
              }}
            >
              {hoveredPerk.unlocked
                ? '✓ Unlocked'
                : unlockedPerks.includes(hoveredPerk.id)
                ? '▶ Click to Unlock'
                : `🔒 Level ${hoveredPerk.requiredLevel} Required`}
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center text-gray-500 text-sm tracking-widest">
        HOVER OVER STARS TO VIEW PERK DETAILS
      </div>
    </div>
  );
}

// Individual perk node
function PerkNode({ perk, color, onClick, isAvailable, onHover, onLeave }) {
  const [isHovered, setIsHovered] = useState(false);

  // Determine size and glow based on tier and type
  const isKeystone = perk.type === 'keystone';
  const baseSize = isKeystone ? 12 : perk.tier === 'master' ? 10 : perk.tier === 'expert' ? 8 : 7;
  const glowSize = isKeystone ? 35 : perk.tier === 'master' ? 25 : 20;
  const pulseSize = isHovered ? baseSize * 1.3 : baseSize;

  // Determine visual state
  const getNodeColor = () => {
    if (perk.unlocked) return color; // Unlocked: stat color
    if (isAvailable) return color; // Available: stat color but dimmer
    return '#4a4a4a'; // Locked: gray
  };

  const getNodeOpacity = () => {
    if (perk.unlocked) return 1;
    if (isAvailable) return 0.7;
    return 0.3;
  };

  const getCursorStyle = () => {
    if (perk.unlocked) return 'default';
    if (isAvailable) return 'pointer';
    return 'not-allowed';
  };

  const handleMouseEnter = (e) => {
    setIsHovered(true);
    onHover(perk, e);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    onLeave();
  };

  return (
    <g
      style={{ cursor: getCursorStyle() }}
    >
      {/* Large invisible hit area for reliable hover detection */}
      <circle
        cx={perk.x}
        cy={perk.y}
        r={30}
        fill="transparent"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={() => {
          if (isAvailable) onClick();
        }}
        style={{ cursor: getCursorStyle(), pointerEvents: 'all' }}
      />

      {/* Refined outer glow */}
      {perk.unlocked && (
        <circle
          cx={perk.x}
          cy={perk.y}
          r={glowSize}
          fill={getNodeColor()}
          opacity={isKeystone ? 0.18 : 0.12}
          className="transition-all duration-300"
          style={{ pointerEvents: 'none' }}
        />
      )}

      {/* Middle glow layer */}
      {perk.unlocked && (
        <circle
          cx={perk.x}
          cy={perk.y}
          r={glowSize * 0.6}
          fill={getNodeColor()}
          opacity={isKeystone ? 0.25 : 0.18}
          className="transition-all duration-300"
          style={{ pointerEvents: 'none' }}
        />
      )}

      {/* Available perk pulse effect */}
      {isAvailable && (
        <circle
          cx={perk.x}
          cy={perk.y}
          r={glowSize * 1.1}
          fill={color}
          opacity={isHovered ? 0.15 : 0.08}
          className="transition-all duration-300"
          style={{ pointerEvents: 'none' }}
        />
      )}

      {/* Main star - different shapes for different types */}
      {isKeystone ? (
        // Keystone: Diamond shape
        <polygon
          points={`${perk.x},${perk.y - pulseSize} ${perk.x + pulseSize},${perk.y} ${perk.x},${perk.y + pulseSize} ${perk.x - pulseSize},${perk.y}`}
          fill={getNodeColor()}
          stroke={perk.unlocked ? '#ffffff' : isAvailable ? color : '#666'}
          strokeWidth={perk.unlocked ? 2.5 : isAvailable ? 2 : 1.5}
          opacity={getNodeOpacity()}
          className="transition-all duration-300"
          style={{
            filter: perk.unlocked ? `drop-shadow(0 0 12px ${color}) drop-shadow(0 0 20px ${color}80)` : isAvailable ? `drop-shadow(0 0 8px ${color}60)` : 'none',
            pointerEvents: 'none'
          }}
        />
      ) : (
        // Regular perks: Circle
        <circle
          cx={perk.x}
          cy={perk.y}
          r={pulseSize}
          fill={getNodeColor()}
          stroke={perk.unlocked ? '#ffffff' : isAvailable ? color : '#666'}
          strokeWidth={perk.unlocked ? 2 : isAvailable ? 1.5 : 1}
          opacity={getNodeOpacity()}
          className="transition-all duration-300"
          style={{
            filter: perk.unlocked ? `drop-shadow(0 0 8px ${color})` : isAvailable ? `drop-shadow(0 0 6px ${color}60)` : 'none',
            pointerEvents: 'none'
          }}
        />
      )}

      {/* Inner detail - star for master, dot for others */}
      {perk.unlocked && (
        <>
          {perk.tier === 'master' || isKeystone ? (
            // 4-pointed star for master/keystone
            <polygon
              points={`${perk.x},${perk.y - 4} ${perk.x + 1.5},${perk.y - 1.5} ${perk.x + 4},${perk.y} ${perk.x + 1.5},${perk.y + 1.5} ${perk.x},${perk.y + 4} ${perk.x - 1.5},${perk.y + 1.5} ${perk.x - 4},${perk.y} ${perk.x - 1.5},${perk.y - 1.5}`}
              fill="#ffffff"
              opacity="0.9"
              style={{ pointerEvents: 'none' }}
            />
          ) : (
            // Simple dot for regular perks
            <circle cx={perk.x} cy={perk.y} r={3} fill="#ffffff" opacity="0.8" style={{ pointerEvents: 'none' }} />
          )}
        </>
      )}

      {/* Lock icon for locked perks */}
      {!perk.unlocked && (
        <circle cx={perk.x} cy={perk.y} r={2} fill="#666666" opacity="0.6" style={{ pointerEvents: 'none' }} />
      )}
    </g>
  );
}

// Generate perk tree from real data
function generatePerkTree(stat, characterLevel, unlockedPerks) {
  // Get the perk tree for this stat
  const treeData = PERK_TREES[stat.id];

  if (!treeData) {
    console.error(`No perk tree found for stat: ${stat.id}`);
    return { perks: [], connections: [] };
  }

  // Map perks to include unlocked status based on unlockedPerks array
  const perks = treeData.perks.map((perk, index) => ({
    id: perk.id,
    name: perk.name,
    description: perk.description,
    type: perk.type,
    tier: perk.tier,
    x: perk.position.x,
    y: perk.position.y,
    requiredLevel: perk.level,
    // Check if this perk is in the unlockedPerks array
    unlocked: unlockedPerks.includes(perk.id),
    prerequisites: perk.prerequisites,
    effect: perk.effect,
    index: index // Store index for connection mapping
  }));

  // Generate connections based on prerequisites
  const connections = [];
  perks.forEach((perk, toIndex) => {
    if (perk.prerequisites && perk.prerequisites.length > 0) {
      perk.prerequisites.forEach(prereqId => {
        // Find the prerequisite perk by id
        const fromIndex = perks.findIndex(p => p.id === prereqId);
        if (fromIndex !== -1) {
          connections.push({
            from: fromIndex,
            to: toIndex,
            // Connection is "unlocked" if the target perk is unlocked
            unlocked: perk.unlocked
          });
        }
      });
    }
  });

  return { perks, connections };
}
