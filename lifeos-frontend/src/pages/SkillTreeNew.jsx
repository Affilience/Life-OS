import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  Check,
  TrendingUp
} from 'lucide-react';
import { PERK_TREES } from '../data/perkTrees';
import { useGamificationModeStore } from '../stores/gamificationModeStore';

/**
 * Skyrim-Inspired Skill Tree System
 * 6 Primary Stats: Body, Mind, Spirit, Wealth, Social, Craft
 * Each stat has a constellation with perks
 *
 * Supports gamification modes:
 * - Cosmic: Full constellation view with effects
 * - Professional: "Growth Map" with simplified layout
 * - Minimal: Simple list view of skills
 */

// Stat definitions with Skyrim-style theming
const STATS = [
  {
    id: 'body',
    name: 'BODY',
    professionalName: 'PHYSICAL',
    subtitle: 'The Warrior',
    professionalSubtitle: 'Health & Fitness',
    icon: Swords,
    color: '#d97757',
    nebula: 'warrior',
    description: 'Physical strength, endurance, and vitality',
    skills: ['Strength', 'Endurance', 'Nutrition', 'Recovery', 'Vitality']
  },
  {
    id: 'mind',
    name: 'MIND',
    professionalName: 'LEARNING',
    subtitle: 'The Mage',
    professionalSubtitle: 'Knowledge & Focus',
    icon: Brain,
    color: '#7b68d9',
    nebula: 'mage',
    description: 'Intelligence, focus, and mastery',
    skills: ['Intelligence', 'Focus', 'Creativity', 'Wisdom', 'Mastery']
  },
  {
    id: 'spirit',
    name: 'SPIRIT',
    professionalName: 'WELLBEING',
    subtitle: 'The Mystic',
    professionalSubtitle: 'Mental Health',
    icon: Heart,
    color: '#57d9d4',
    nebula: 'mystic',
    description: 'Mindfulness, gratitude, and inner peace',
    skills: ['Mindfulness', 'Gratitude', 'Self-Awareness', 'Emotional Intelligence', 'Inner Peace']
  },
  {
    id: 'wealth',
    name: 'WEALTH',
    professionalName: 'FINANCE',
    subtitle: 'The Merchant',
    professionalSubtitle: 'Financial Growth',
    icon: Coins,
    color: '#d9c157',
    nebula: 'merchant',
    description: 'Financial mastery and abundance',
    skills: ['Income', 'Savings', 'Investing', 'Business', 'Abundance']
  },
  {
    id: 'social',
    name: 'SOCIAL',
    professionalName: 'NETWORK',
    subtitle: 'The Diplomat',
    professionalSubtitle: 'Relationships',
    icon: Users,
    color: '#57d98a',
    nebula: 'diplomat',
    description: 'Charisma, networking, and influence',
    skills: ['Charisma', 'Networking', 'Communication', 'Leadership', 'Relationships']
  },
  {
    id: 'craft',
    name: 'CRAFT',
    professionalName: 'SKILLS',
    subtitle: 'The Artisan',
    professionalSubtitle: 'Professional Skills',
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
  const containerRef = useRef(null);
  const mousePosRef = useRef({ x: 0.5, y: 0.5 });

  // Get gamification mode settings
  const { mode, getTerm, isVisible } = useGamificationModeStore();
  const showSkillTree = isVisible('showSkillTree');
  const showConstellationEffects = isVisible('showConstellationEffects');

  // Track mouse position for parallax effects (using ref to avoid re-renders)
  const handleMouseMove = useCallback((e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    mousePosRef.current = {
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height
    };
  }, []);

  // Get mode-appropriate labels
  const skillTreeLabel = getTerm('skillTree');
  const perkLabel = getTerm('perk');
  const levelLabel = getTerm('level');

  // Draw enhanced space background with animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationId;
    let stars = [];
    let twinkleStars = [];

    const initCanvas = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;

      // Initialize static star field
      stars = [];
      for (let i = 0; i < 1000; i++) {
        const temp = Math.random();
        let r, g, b;
        if (temp < 0.1) {
          r = 180 + Math.random() * 50; g = 200 + Math.random() * 40; b = 255;
        } else if (temp < 0.7) {
          r = 255; g = 245 + Math.random() * 10; b = 220 + Math.random() * 30;
        } else {
          r = g = b = 240 + Math.random() * 15;
        }
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: 0.3 + Math.random() * 2,
          brightness: 0.2 + Math.random() * 0.8,
          r, g, b,
          layer: Math.random() // 0 = far, 1 = near (for parallax)
        });
      }

      // Initialize twinkling stars (brighter ones that animate)
      twinkleStars = stars.filter(s => s.size > 1.2).map(s => ({
        ...s,
        twinkleSpeed: 0.5 + Math.random() * 2,
        twinklePhase: Math.random() * Math.PI * 2
      }));
    };

    const drawFrame = (time) => {
      const width = canvas.width;
      const height = canvas.height;
      const mousePos = mousePosRef.current;

      // Deep space gradient background
      const bgGradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, Math.max(width, height));
      bgGradient.addColorStop(0, '#0a0a14');
      bgGradient.addColorStop(0.4, '#050508');
      bgGradient.addColorStop(1, '#000002');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, width, height);

      // Enhanced nebula rendering with Skyrim-style depth
      const drawNebula = (baseX, baseY, radius, color, opacity, parallaxFactor = 0) => {
        // Apply parallax offset based on mouse position
        const offsetX = (mousePos.x - 0.5) * parallaxFactor * 100;
        const offsetY = (mousePos.y - 0.5) * parallaxFactor * 60;
        const x = baseX + offsetX;
        const y = baseY + offsetY;

        // Main nebula core with multiple layers for depth
        for (let layer = 0; layer < 3; layer++) {
          const layerRadius = radius * (1 - layer * 0.2);
          const layerOpacity = opacity * (1 - layer * 0.25);

          const gradient = ctx.createRadialGradient(x, y, 0, x, y, layerRadius);
          gradient.addColorStop(0, `rgba(${color}, ${layerOpacity * 0.3})`);
          gradient.addColorStop(0.15, `rgba(${color}, ${layerOpacity * 0.2})`);
          gradient.addColorStop(0.4, `rgba(${color}, ${layerOpacity * 0.1})`);
          gradient.addColorStop(0.7, `rgba(${color}, ${layerOpacity * 0.03})`);
          gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = gradient;
          ctx.fillRect(x - layerRadius, y - layerRadius, layerRadius * 2, layerRadius * 2);
        }

        // Nebula wisps - flowing tendrils
        for (let i = 0; i < 12; i++) {
          const baseAngle = (i / 12) * Math.PI * 2;
          const waveOffset = Math.sin(time * 0.0003 + i) * 0.2;
          const angle = baseAngle + waveOffset;
          const dist = radius * (0.3 + Math.random() * 0.4);
          const dx = Math.cos(angle) * dist;
          const dy = Math.sin(angle) * dist;
          const wispRadius = radius * (0.15 + Math.random() * 0.15);

          const wispGradient = ctx.createRadialGradient(x + dx, y + dy, 0, x + dx, y + dy, wispRadius);
          wispGradient.addColorStop(0, `rgba(${color}, ${opacity * 0.12})`);
          wispGradient.addColorStop(0.5, `rgba(${color}, ${opacity * 0.05})`);
          wispGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = wispGradient;
          ctx.fillRect(x + dx - wispRadius, y + dy - wispRadius, wispRadius * 2, wispRadius * 2);
        }
      };

      // Parallax nebula layers - deep background (moves least)
      drawNebula(width * 0.15, height * 0.2, 600, '40, 30, 60', 0.6, 0.1);
      drawNebula(width * 0.85, height * 0.75, 550, '30, 40, 50', 0.5, 0.1);

      // Mid-ground nebulae - stat colors (moves medium)
      drawNebula(width * 0.2, height * 0.7, 450, '217, 119, 87', 0.9, 0.3); // Body (warm orange)
      drawNebula(width * 0.5, height * 0.3, 500, '123, 104, 217', 0.9, 0.3); // Mind (deep purple)
      drawNebula(width * 0.8, height * 0.6, 420, '87, 217, 212', 0.9, 0.3); // Spirit (cyan)
      drawNebula(width * 0.35, height * 0.85, 380, '217, 193, 87', 0.9, 0.3); // Wealth (gold)
      drawNebula(width * 0.1, height * 0.35, 360, '87, 217, 138', 0.9, 0.3); // Social (green)
      drawNebula(width * 0.85, height * 0.2, 400, '184, 184, 200', 0.9, 0.3); // Craft (silver)

      // Draw star field with parallax
      stars.forEach(star => {
        const parallaxFactor = star.layer * 0.15;
        const px = star.x + (mousePos.x - 0.5) * parallaxFactor * 50;
        const py = star.y + (mousePos.y - 0.5) * parallaxFactor * 30;

        // Subtle glow for larger stars
        if (star.size > 0.8) {
          ctx.fillStyle = `rgba(${star.r}, ${star.g}, ${star.b}, ${star.brightness * 0.15})`;
          ctx.beginPath();
          ctx.arc(px, py, star.size * 2.5, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.fillStyle = `rgba(${star.r}, ${star.g}, ${star.b}, ${star.brightness})`;
        ctx.beginPath();
        ctx.arc(px, py, star.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Animated twinkling for bright stars
      twinkleStars.forEach(star => {
        const twinkle = 0.5 + 0.5 * Math.sin(time * 0.002 * star.twinkleSpeed + star.twinklePhase);
        const parallaxFactor = star.layer * 0.15;
        const px = star.x + (mousePos.x - 0.5) * parallaxFactor * 50;
        const py = star.y + (mousePos.y - 0.5) * parallaxFactor * 30;

        // Glowing halo for twinkling effect
        ctx.fillStyle = `rgba(255, 255, 255, ${twinkle * 0.3})`;
        ctx.beginPath();
        ctx.arc(px, py, star.size * 3 * twinkle, 0, Math.PI * 2);
        ctx.fill();

        // Cross-ray effect for brightest stars
        if (star.size > 1.8 && twinkle > 0.7) {
          ctx.strokeStyle = `rgba(255, 255, 255, ${twinkle * 0.4})`;
          ctx.lineWidth = 0.5;
          const rayLength = star.size * 4 * twinkle;
          ctx.beginPath();
          ctx.moveTo(px - rayLength, py);
          ctx.lineTo(px + rayLength, py);
          ctx.moveTo(px, py - rayLength);
          ctx.lineTo(px, py + rayLength);
          ctx.stroke();
        }
      });

      animationId = requestAnimationFrame(drawFrame);
    };

    initCanvas();
    animationId = requestAnimationFrame(drawFrame);

    const handleResize = () => {
      initCanvas();
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
    };
  }, []); // Empty deps - animation runs continuously, reads mousePosRef each frame

  // Simple list view for minimal mode
  if (!showSkillTree || mode === 'minimal') {
    return (
      <div className="text-white space-y-4">
        <div className="space-y-4">
          {STATS.map(stat => {
            const data = mockCharacterData[stat.id];
            const Icon = stat.icon;
            return (
              <div
                key={stat.id}
                className="bg-[#1a1724] border border-white/10 rounded-xl p-4"
              >
                <div className="flex items-center gap-3 mb-2">
                  <Icon className="w-5 h-5" style={{ color: stat.color }} />
                  <span className="font-semibold">{stat.professionalName || stat.name}</span>
                  <span className="text-white/60 text-sm">Level {data.level}</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${(data.xp / data.xpToNext) * 100}%`,
                      backgroundColor: stat.color,
                    }}
                  />
                </div>
                <div className="text-xs text-white/50 mt-1">
                  {data.perksUnlocked} skills unlocked
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative min-h-[600px] bg-black text-white overflow-hidden rounded-xl"
    >
      {/* Space Background Canvas - only in cosmic mode with effects */}
      {showConstellationEffects && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 -z-10"
          style={{ imageRendering: 'crisp-edges' }}
        />
      )}

      {/* Simple gradient background for non-cosmic modes */}
      {!showConstellationEffects && (
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#0c0a10] via-[#1a1428] to-[#0c0a10]" />
      )}

      {/* Main Content */}
      <AnimatePresence mode="wait">
        {!selectedStat ? (
          <ConstellationOverview
            key="overview"
            stats={STATS}
            characterData={mockCharacterData}
            onSelectStat={setSelectedStat}
            mode={mode}
            showEffects={showConstellationEffects}
            levelLabel={levelLabel}
            skillTreeLabel={skillTreeLabel}
          />
        ) : (
          <SkillTreeView
            key="skilltree"
            stat={STATS.find(s => s.id === selectedStat)}
            characterData={mockCharacterData}
            onBack={() => setSelectedStat(null)}
            mode={mode}
            showEffects={showConstellationEffects}
            perkLabel={perkLabel}
            levelLabel={levelLabel}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Constellation Overview - Main selection screen
function ConstellationOverview({ stats, characterData, onSelectStat, mode = 'cosmic', showEffects = true, levelLabel = 'Level', skillTreeLabel = 'Constellation Skills' }) {
  const isCosmic = mode === 'cosmic';

  // Professional mode title
  const title = isCosmic ? 'CONSTELLATION SKILLS' : 'GROWTH MAP';

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
                background: isCosmic
                  ? 'linear-gradient(180deg, #ffffff 0%, #d4d4d8 100%)'
                  : 'linear-gradient(180deg, #60a5fa 0%, #3b82f6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: showEffects ? '0 0 30px rgba(255,255,255,0.3)' : 'none',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                fontWeight: 700
              }}
            >
              {title}
            </h1>
            {/* Subtle glow underneath - only in cosmic mode */}
            {showEffects && (
              <div
                className="absolute inset-0 blur-2xl opacity-40"
                style={{
                  background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.4) 0%, transparent 70%)'
                }}
              />
            )}
          </div>
        </motion.div>
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="flex items-center justify-center gap-3"
        >
          <div className="h-px w-12 bg-gradient-to-r from-transparent to-gray-600" />
          <span className="text-lg text-white/60 font-medium">{levelLabel} {characterData.level}</span>
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
            mode={mode}
            showEffects={showEffects}
            levelLabel={levelLabel}
          />
        ))}
      </div>

      {/* Bottom instruction */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-center mt-16 text-white/50 text-xs tracking-widest uppercase"
      >
        Select a constellation to explore perks
      </motion.div>
    </motion.div>
  );
}

// Individual constellation card
function ConstellationCard({ stat, data, index, onClick, mode = 'cosmic', showEffects = true, levelLabel = 'Level' }) {
  const Icon = stat.icon;
  const progress = (data.xp / data.xpToNext) * 100;
  const isCosmic = mode === 'cosmic';

  // Use mode-appropriate names
  const displayName = isCosmic ? stat.name : (stat.professionalName || stat.name);
  const displaySubtitle = isCosmic ? stat.subtitle : (stat.professionalSubtitle || stat.subtitle);
  const perksLabel = isCosmic ? 'perks' : 'skills';

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
      {/* Glow effect behind card - only in cosmic mode with effects */}
      {showEffects && (
        <div
          className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-60 transition-all duration-700 blur-2xl"
          style={{
            background: `radial-gradient(circle at 50% 50%, ${stat.color}50 0%, transparent 70%)`,
          }}
        />
      )}

      {/* Card background with refined glassmorphism */}
      <div
        className="relative border rounded-xl p-6 backdrop-blur-md transition-all duration-500 overflow-hidden"
        style={{
          borderColor: `${stat.color}40`,
          background: `linear-gradient(135deg, rgba(20, 20, 30, 0.8) 0%, rgba(10, 10, 15, 0.9) 100%)`,
          boxShadow: `0 4px 20px ${stat.color}15, inset 0 1px 0 ${stat.color}20`
        }}
      >
        {/* Subtle top highlight - only with effects */}
        {showEffects && (
          <div
            className="absolute top-0 left-0 right-0 h-px opacity-50"
            style={{
              background: `linear-gradient(90deg, transparent 0%, ${stat.color}60 50%, transparent 100%)`
            }}
          />
        )}

        {/* Hover glow overlay - only with effects */}
        {showEffects && (
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{
              background: `radial-gradient(circle at 50% 0%, ${stat.color}15 0%, transparent 60%)`
            }}
          />
        )}

        {/* Content */}
        <div className="relative z-10">
          {/* Icon with refined glow */}
          <div className="flex justify-center mb-5">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 group-hover:scale-110 relative"
              style={{
                background: showEffects
                  ? `radial-gradient(circle, ${stat.color}25 0%, ${stat.color}08 60%, transparent 100%)`
                  : `${stat.color}15`,
              }}
            >
              {/* Icon glow ring - only with effects */}
              {showEffects && (
                <div
                  className="absolute inset-0 rounded-full opacity-50 group-hover:opacity-80 transition-opacity duration-500"
                  style={{
                    boxShadow: `0 0 20px ${stat.color}40, inset 0 0 15px ${stat.color}15`
                  }}
                />
              )}
              <Icon
                className={`w-8 h-8 relative z-10 transition-all duration-500 ${showEffects ? 'group-hover:scale-110 group-hover:rotate-12' : ''}`}
                style={{
                  color: stat.color,
                  filter: showEffects ? `drop-shadow(0 2px 8px ${stat.color}80)` : 'none'
                }}
              />
            </div>
          </div>

          {/* Title with cleaner glow */}
          <h2
            className="text-xl font-bold mb-0.5 tracking-wide transition-all duration-300"
            style={{
              color: stat.color,
              textShadow: showEffects ? `0 0 15px ${stat.color}70, 0 2px 8px ${stat.color}40` : 'none',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              fontWeight: 600
            }}
          >
            {displayName}
          </h2>
          <p className="text-xs text-white/60 mb-4 font-medium">{displaySubtitle}</p>

          {/* Level and Progress */}
          <div className="space-y-2.5">
            <div className="flex justify-between text-sm">
              <span className="text-gray-300 font-medium">{isCosmic ? 'Lv.' : levelLabel} {data.level}</span>
              <span className="text-white/50 text-xs">{data.perksUnlocked} {perksLabel}</span>
            </div>

            {/* XP Bar with refined styling */}
            <div className="relative h-1.5 bg-[#12101a]/60 rounded-full overflow-hidden backdrop-blur-sm">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1.2, delay: index * 0.08 + 0.3, ease: 'easeOut' }}
                className="h-full rounded-full relative"
                style={{
                  background: `linear-gradient(90deg, ${stat.color}80 0%, ${stat.color} 100%)`,
                }}
              >
                {/* Glow on progress bar - only with effects */}
                {showEffects && (
                  <div
                    className="absolute inset-0 opacity-60"
                    style={{
                      boxShadow: `0 0 8px ${stat.color}90`
                    }}
                  />
                )}
              </motion.div>
            </div>

            <div className="text-xs text-white/50 text-right font-mono">
              {data.xp.toLocaleString()} / {data.xpToNext.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Constellation pattern background - only in cosmic mode */}
      {isCosmic && (
        <div className="absolute inset-0 pointer-events-none opacity-[0.07] group-hover:opacity-20 transition-all duration-700 rounded-xl overflow-hidden">
          <ConstellationMiniature color={stat.color} />
        </div>
      )}
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
function SkillTreeView({ stat, characterData, onBack, mode = 'cosmic', showEffects = true, perkLabel = 'Perk', levelLabel = 'Level' }) {
  const Icon = stat.icon;
  const data = characterData[stat.id];
  const isCosmic = mode === 'cosmic';

  // Mode-appropriate labels
  const displayName = isCosmic ? stat.name : (stat.professionalName || stat.name);
  const displaySubtitle = isCosmic ? stat.subtitle : (stat.professionalSubtitle || stat.subtitle);
  const pointsLabel = isCosmic ? 'PERK POINTS' : 'SKILL POINTS';
  const xpLabel = isCosmic ? 'XP' : 'Progress';

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
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="tracking-wider">BACK</span>
          </button>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{
                  background: showEffects
                    ? `radial-gradient(circle, ${stat.color}30 0%, ${stat.color}10 100%)`
                    : `${stat.color}20`,
                  boxShadow: showEffects ? `0 0 20px ${stat.color}40` : 'none'
                }}
              >
                <Icon className="w-6 h-6" style={{ color: stat.color }} />
              </div>
              <div>
                <h2
                  className="text-2xl font-bold tracking-wider"
                  style={{
                    color: stat.color,
                    textShadow: showEffects ? `0 0 10px ${stat.color}80` : 'none',
                    fontFamily: isCosmic ? 'serif' : 'system-ui, -apple-system, sans-serif'
                  }}
                >
                  {displayName}
                </h2>
                <p className="text-sm text-white/50">{displaySubtitle}</p>
              </div>
            </div>

            <div className="text-right">
              <div className="text-3xl font-bold" style={{ color: stat.color }}>
                {data.level}
              </div>
              <div className="text-xs text-white/50">{levelLabel.toUpperCase()}</div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* Perk/Skill Points */}
            <div className="text-center">
              <div
                className="text-3xl font-bold"
                style={{
                  color: stat.color,
                  textShadow: showEffects ? `0 0 10px ${stat.color}80` : 'none'
                }}
              >
                {perkPoints}
              </div>
              <div className="text-xs text-white/50 tracking-wide">{pointsLabel}</div>
            </div>

            {/* XP Progress */}
            <div className="w-48">
              <div className="text-xs text-white/60 mb-1">
                {data.xp.toLocaleString()} / {data.xpToNext.toLocaleString()} {xpLabel}
              </div>
              <div className="h-2 bg-[#1a1724] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${(data.xp / data.xpToNext) * 100}%`,
                    background: `linear-gradient(90deg, ${stat.color}60 0%, ${stat.color} 100%)`,
                    boxShadow: showEffects ? `0 0 10px ${stat.color}60` : 'none'
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
          statName={displayName}
          onPerkClick={handlePerkUnlock}
          characterLevel={data.level}
          unlockedPerks={unlockedPerks}
          mode={mode}
          showEffects={showEffects}
          perkLabel={perkLabel}
          levelLabel={levelLabel}
        />
      </div>
    </motion.div>
  );
}

// Perk constellation visualization
function PerkConstellation({ perkTree, color, onPerkClick, characterLevel, unlockedPerks, mode = 'cosmic', showEffects = true, perkLabel = 'Perk', levelLabel = 'Level' }) {
  const [hoveredPerk, setHoveredPerk] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const isCosmic = mode === 'cosmic';

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

  // Calculate line length for animated dash effect
  const getLineLength = (x1, y1, x2, y2) => {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      {/* Refined nebula background - only in cosmic mode with effects */}
      {showEffects && (
        <div className="absolute inset-0 pointer-events-none">
          {/* Main central glow - Skyrim-style pulsating */}
          <motion.div
            animate={{
              opacity: [0.6, 0.8, 0.6],
              scale: [1, 1.02, 1],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute inset-0"
            style={{
              background: `radial-gradient(ellipse 900px 700px at 50% 50%, rgba(${rgbString}, 0.15) 0%, rgba(${rgbString}, 0.06) 40%, transparent 70%)`
            }}
          />

          {/* Soft ambient light layers */}
          <motion.div
            animate={{ opacity: [0.4, 0.6, 0.4] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="absolute inset-0"
            style={{
              background: `radial-gradient(ellipse 600px 400px at 40% 40%, rgba(${rgbString}, 0.1) 0%, transparent 55%)`
            }}
          />
          <motion.div
            animate={{ opacity: [0.4, 0.6, 0.4] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
            className="absolute inset-0"
            style={{
              background: `radial-gradient(ellipse 600px 400px at 60% 60%, rgba(${rgbString}, 0.1) 0%, transparent 55%)`
            }}
          />

          {/* Additional wispy nebula effect */}
          <motion.div
            animate={{ opacity: [0.3, 0.5, 0.3], x: [-10, 10, -10] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0"
            style={{
              background: `radial-gradient(ellipse 500px 300px at 50% 30%, rgba(${rgbString}, 0.08) 0%, transparent 60%)`
            }}
          />
        </div>
      )}

      {/* SVG Constellation */}
      <svg className="w-full h-full" viewBox="0 0 800 600">
        {/* Define gradients and filters for enhanced effects */}
        <defs>
          {/* Glow filter for unlocked nodes */}
          <filter id={`glow-${color.replace('#', '')}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>

          {/* Animated gradient for flowing energy lines */}
          <linearGradient id={`flow-gradient-${color.replace('#', '')}`} gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={color} stopOpacity="0.2">
              <animate attributeName="offset" values="-1;0" dur="2s" repeatCount="indefinite" />
            </stop>
            <stop offset="50%" stopColor={color} stopOpacity="0.8">
              <animate attributeName="offset" values="-0.5;0.5" dur="2s" repeatCount="indefinite" />
            </stop>
            <stop offset="100%" stopColor={color} stopOpacity="0.2">
              <animate attributeName="offset" values="0;1" dur="2s" repeatCount="indefinite" />
            </stop>
          </linearGradient>
        </defs>

        {/* Connection lines with enhanced styling */}
        {perkTree.connections.map((conn, i) => {
          const unlocked = conn.unlocked;
          const fromPerk = perkTree.perks[conn.from];
          const toPerk = perkTree.perks[conn.to];
          const lineLength = getLineLength(fromPerk.x, fromPerk.y, toPerk.x, toPerk.y);

          return (
            <g key={`line-${i}`}>
              {/* Multiple glow layers for unlocked connections - Skyrim style */}
              {unlocked && showEffects && (
                <>
                  {/* Outer diffuse glow */}
                  <line
                    x1={fromPerk.x}
                    y1={fromPerk.y}
                    x2={toPerk.x}
                    y2={toPerk.y}
                    stroke={color}
                    strokeWidth="8"
                    opacity="0.08"
                    strokeLinecap="round"
                  />
                  {/* Middle glow */}
                  <line
                    x1={fromPerk.x}
                    y1={fromPerk.y}
                    x2={toPerk.x}
                    y2={toPerk.y}
                    stroke={color}
                    strokeWidth="5"
                    opacity="0.15"
                    strokeLinecap="round"
                  />
                  {/* Inner bright core */}
                  <line
                    x1={fromPerk.x}
                    y1={fromPerk.y}
                    x2={toPerk.x}
                    y2={toPerk.y}
                    stroke={color}
                    strokeWidth="2.5"
                    opacity="0.6"
                    strokeLinecap="round"
                  />
                  {/* Animated energy flow pulse */}
                  <line
                    x1={fromPerk.x}
                    y1={fromPerk.y}
                    x2={toPerk.x}
                    y2={toPerk.y}
                    stroke="#ffffff"
                    strokeWidth="1"
                    opacity="0.4"
                    strokeLinecap="round"
                    strokeDasharray={`${lineLength * 0.1}, ${lineLength * 0.9}`}
                  >
                    <animate
                      attributeName="stroke-dashoffset"
                      values={`0;${-lineLength}`}
                      dur="3s"
                      repeatCount="indefinite"
                    />
                  </line>
                </>
              )}
              {/* Locked line - dotted style */}
              {!unlocked && (
                <line
                  x1={fromPerk.x}
                  y1={fromPerk.y}
                  x2={toPerk.x}
                  y2={toPerk.y}
                  stroke="#444"
                  strokeWidth="1"
                  opacity="0.3"
                  strokeDasharray="4,6"
                  strokeLinecap="round"
                />
              )}
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
              showEffects={showEffects}
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
            className={`rounded-lg p-4 shadow-2xl ${showEffects ? 'border-4' : 'border-2'}`}
            style={{
              backgroundColor: '#000000',
              borderColor: color,
              minWidth: '300px',
              maxWidth: '350px',
              boxShadow: showEffects ? `0 0 30px ${color}, 0 10px 40px rgba(0,0,0,0.8)` : '0 10px 40px rgba(0,0,0,0.8)'
            }}
          >
            {/* Perk/Skill Name */}
            <div
              className="text-xl font-bold mb-2"
              style={{
                color: color,
                fontFamily: isCosmic ? 'serif' : 'system-ui, -apple-system, sans-serif',
                textShadow: showEffects ? `0 0 20px ${color}, 0 0 40px ${color}80` : 'none',
                filter: showEffects ? 'brightness(1.2)' : 'none'
              }}
            >
              {hoveredPerk.name}
            </div>

            {/* Tier and Type */}
            <div className="text-xs text-white/60 uppercase mb-3 tracking-wider">
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
                : `🔒 ${levelLabel} ${hoveredPerk.requiredLevel} Required`}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// Individual perk node with Skyrim-style effects
function PerkNode({ perk, color, onClick, isAvailable, onHover, onLeave, showEffects = true }) {
  const [isHovered, setIsHovered] = useState(false);

  // Determine size and glow based on tier and type
  const isKeystone = perk.type === 'keystone';
  const isMaster = perk.tier === 'master';
  const isExpert = perk.tier === 'expert';
  const baseSize = isKeystone ? 14 : isMaster ? 11 : isExpert ? 9 : 7;
  const glowSize = isKeystone ? 45 : isMaster ? 35 : isExpert ? 28 : 22;
  const pulseSize = isHovered ? baseSize * 1.4 : baseSize;

  // Determine visual state
  const getNodeColor = () => {
    if (perk.unlocked) return color;
    if (isAvailable) return color;
    return '#4a4a4a';
  };

  const getNodeOpacity = () => {
    if (perk.unlocked) return 1;
    if (isAvailable) return 0.75;
    return 0.35;
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

  // Generate unique animation delays based on perk position
  const animDelay = ((perk.x + perk.y) % 1000) / 500;

  return (
    <g style={{ cursor: getCursorStyle() }}>
      {/* Large invisible hit area for reliable hover detection */}
      <circle
        cx={perk.x}
        cy={perk.y}
        r={30}
        fill="transparent"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={() => { if (isAvailable) onClick(); }}
        style={{ cursor: getCursorStyle(), pointerEvents: 'all' }}
      />

      {/* UNLOCKED: Multi-layer Skyrim-style glow effects */}
      {perk.unlocked && showEffects && (
        <>
          {/* Outermost diffuse glow - pulsing */}
          <circle cx={perk.x} cy={perk.y} r={glowSize * 1.2} fill={color} style={{ pointerEvents: 'none' }}>
            <animate attributeName="opacity" values="0.06;0.12;0.06" dur="3s" repeatCount="indefinite" begin={`${animDelay}s`} />
            <animate attributeName="r" values={`${glowSize * 1.1};${glowSize * 1.3};${glowSize * 1.1}`} dur="3s" repeatCount="indefinite" begin={`${animDelay}s`} />
          </circle>
          {/* Middle glow layer */}
          <circle cx={perk.x} cy={perk.y} r={glowSize * 0.8} fill={color} style={{ pointerEvents: 'none' }}>
            <animate attributeName="opacity" values={`${isKeystone ? 0.15 : 0.1};${isKeystone ? 0.25 : 0.18};${isKeystone ? 0.15 : 0.1}`} dur="2.5s" repeatCount="indefinite" begin={`${animDelay + 0.2}s`} />
          </circle>
          {/* Inner bright glow */}
          <circle cx={perk.x} cy={perk.y} r={glowSize * 0.5} fill={color} opacity={isKeystone ? 0.3 : 0.22} style={{ pointerEvents: 'none' }} />
          {/* Core bright center */}
          <circle cx={perk.x} cy={perk.y} r={glowSize * 0.25} fill="#ffffff" opacity="0.15" style={{ pointerEvents: 'none' }} />
        </>
      )}

      {/* AVAILABLE: Beckoning pulse effect */}
      {isAvailable && showEffects && (
        <>
          {/* Outer beckoning ring */}
          <circle cx={perk.x} cy={perk.y} r={glowSize} fill="transparent" stroke={color} strokeWidth="1" style={{ pointerEvents: 'none' }}>
            <animate attributeName="opacity" values="0;0.4;0" dur="2s" repeatCount="indefinite" />
            <animate attributeName="r" values={`${glowSize * 0.6};${glowSize * 1.2};${glowSize * 0.6}`} dur="2s" repeatCount="indefinite" />
          </circle>
          {/* Inner soft glow */}
          <circle cx={perk.x} cy={perk.y} r={glowSize * 0.6} fill={color} style={{ pointerEvents: 'none' }}>
            <animate attributeName="opacity" values="0.05;0.12;0.05" dur="2s" repeatCount="indefinite" />
          </circle>
        </>
      )}

      {/* Hover enhancement */}
      {isHovered && showEffects && (
        <circle cx={perk.x} cy={perk.y} r={glowSize * 1.5} fill={color} opacity="0.1" style={{ pointerEvents: 'none' }} />
      )}

      {/* Main star node - different shapes for different types */}
      {isKeystone ? (
        // Keystone: Diamond/Crystal shape
        <polygon
          points={`${perk.x},${perk.y - pulseSize * 1.2} ${perk.x + pulseSize},${perk.y} ${perk.x},${perk.y + pulseSize * 1.2} ${perk.x - pulseSize},${perk.y}`}
          fill={getNodeColor()}
          stroke={perk.unlocked ? '#ffffff' : isAvailable ? color : '#555'}
          strokeWidth={perk.unlocked ? 3 : isAvailable ? 2 : 1.5}
          opacity={getNodeOpacity()}
          className="transition-all duration-200"
          style={{
            filter: showEffects
              ? (perk.unlocked ? `drop-shadow(0 0 15px ${color}) drop-shadow(0 0 30px ${color}80)` : isAvailable ? `drop-shadow(0 0 10px ${color}60)` : 'none')
              : 'none',
            pointerEvents: 'none'
          }}
        />
      ) : (
        // Regular perks: Circle with better glow
        <circle
          cx={perk.x}
          cy={perk.y}
          r={pulseSize}
          fill={getNodeColor()}
          stroke={perk.unlocked ? '#ffffff' : isAvailable ? color : '#555'}
          strokeWidth={perk.unlocked ? 2.5 : isAvailable ? 2 : 1}
          opacity={getNodeOpacity()}
          className="transition-all duration-200"
          style={{
            filter: showEffects
              ? (perk.unlocked ? `drop-shadow(0 0 10px ${color}) drop-shadow(0 0 20px ${color}60)` : isAvailable ? `drop-shadow(0 0 8px ${color}50)` : 'none')
              : 'none',
            pointerEvents: 'none'
          }}
        />
      )}

      {/* Inner detail - enhanced star for master/keystone, bright dot for others */}
      {perk.unlocked && (
        <>
          {isMaster || isKeystone ? (
            // 4-pointed star for master/keystone - more dramatic
            <polygon
              points={`${perk.x},${perk.y - 5} ${perk.x + 2},${perk.y - 2} ${perk.x + 5},${perk.y} ${perk.x + 2},${perk.y + 2} ${perk.x},${perk.y + 5} ${perk.x - 2},${perk.y + 2} ${perk.x - 5},${perk.y} ${perk.x - 2},${perk.y - 2}`}
              fill="#ffffff"
              opacity="0.95"
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
