import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight, ChevronLeft, Sparkles, Star, Trophy, Zap,
  ShoppingBag, User, Lock, Gift, TrendingUp
} from 'lucide-react';
import { useNewOnboardingStore, NOVA_DIALOGUES, ONBOARDING_STEPS } from '../../../stores/newOnboardingStore';

const TOUR_SECTIONS = [
  {
    id: 'xp',
    title: 'Experience Points (XP)',
    icon: Sparkles,
    color: 'from-yellow-500 to-orange-500',
    description: 'Every action earns you XP. Complete tasks, maintain streaks, and watch yourself level up!',
    visual: 'xp_demo',
  },
  {
    id: 'avatar',
    title: 'Avatar Evolution',
    icon: User,
    color: 'from-purple-500 to-pink-500',
    description: 'Your avatar evolves through 40 unique stages as you progress. From humble Dreamer to legendary Avatar of Mastery.',
    visual: 'avatar_demo',
  },
  {
    id: 'skills',
    title: 'Skill Constellation',
    icon: Star,
    color: 'from-blue-500 to-cyan-500',
    description: 'Unlock stars in your skill constellation. Each skill you develop lights up the cosmic map.',
    visual: 'skills_demo',
  },
  {
    id: 'bazaar',
    title: 'Cosmic Bazaar',
    icon: ShoppingBag,
    color: 'from-emerald-500 to-teal-500',
    description: 'Spend your earned cosmic credits on equipment, consumables, and rewards. Here\'s 100 credits to start!',
    visual: 'bazaar_demo',
  },
];

// Simple visual demos for each section
const TourVisual = ({ section, isActive }) => {
  if (!isActive) return null;

  switch (section) {
    case 'xp_demo':
      return (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative w-full max-w-xs mx-auto"
        >
          {/* XP bar demonstration */}
          <div className="bg-[#1a1724] rounded-2xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <span className="text-white/60 text-sm">Level 1</span>
              <span className="text-white/60 text-sm">Level 2</span>
            </div>
            <div className="h-4 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: '65%' }}
                transition={{ duration: 1.5, delay: 0.3 }}
              />
            </div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="text-center mt-4"
            >
              <span className="text-2xl font-bold text-yellow-400">+50 XP</span>
            </motion.div>
          </div>
        </motion.div>
      );

    case 'avatar_demo':
      return (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative flex items-center justify-center gap-4"
        >
          {/* Avatar evolution preview */}
          {[1, 10, 25, 40].map((stage, index) => (
            <motion.div
              key={stage}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 * index }}
              className={`relative ${index === 0 ? 'scale-110' : 'opacity-60'}`}
            >
              <div className="w-16 h-16 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <img
                  src={`/assets/avatar/evolution/heroine_v3_stage_${stage}_${
                    stage === 1 ? 'dreamer' : stage === 10 ? 'swordsman' : stage === 25 ? 'holy_crusader' : 'avatar_of_mastery'
                  }.png`}
                  alt={`Stage ${stage}`}
                  className="w-12 h-12 object-contain"
                  style={{ imageRendering: 'pixelated' }}
                />
              </div>
              <div className="text-center mt-1 text-xs text-white/50">
                Lv {stage}
              </div>
            </motion.div>
          ))}
        </motion.div>
      );

    case 'skills_demo':
      return (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative w-72 h-72 mx-auto"
        >
          {/* Cosmic background glow */}
          <div className="absolute inset-0 bg-gradient-radial from-blue-500/20 via-purple-500/10 to-transparent rounded-full blur-xl" />

          {/* Skill constellation */}
          <svg viewBox="0 0 100 100" className="w-full h-full relative z-10">
            {/* Background dust particles */}
            {[...Array(20)].map((_, i) => (
              <motion.circle
                key={`dust-${i}`}
                cx={10 + Math.random() * 80}
                cy={10 + Math.random() * 80}
                r={0.3 + Math.random() * 0.5}
                fill="white"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.1, 0.4, 0.1] }}
                transition={{ duration: 2 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 2 }}
              />
            ))}

            {/* Connection lines with gradient effect */}
            <defs>
              <linearGradient id="lineGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.6" />
              </linearGradient>
              <linearGradient id="lineGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.4" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="1" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            {/* Main constellation - outer ring */}
            {[
              { x1: 50, y1: 15, x2: 25, y2: 35, delay: 0 },
              { x1: 25, y1: 35, x2: 15, y2: 60, delay: 0.1 },
              { x1: 15, y1: 60, x2: 30, y2: 80, delay: 0.2 },
              { x1: 30, y1: 80, x2: 50, y2: 90, delay: 0.3 },
              { x1: 50, y1: 90, x2: 70, y2: 80, delay: 0.4 },
              { x1: 70, y1: 80, x2: 85, y2: 60, delay: 0.5 },
              { x1: 85, y1: 60, x2: 75, y2: 35, delay: 0.6 },
              { x1: 75, y1: 35, x2: 50, y2: 15, delay: 0.7 },
            ].map((line, i) => (
              <motion.line
                key={`outer-${i}`}
                x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2}
                stroke="url(#lineGradient1)"
                strokeWidth="1"
                filter="url(#glow)"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.8, delay: line.delay }}
              />
            ))}

            {/* Inner connections */}
            {[
              { x1: 50, y1: 15, x2: 50, y2: 50, delay: 0.8 },
              { x1: 25, y1: 35, x2: 50, y2: 50, delay: 0.9 },
              { x1: 75, y1: 35, x2: 50, y2: 50, delay: 1.0 },
              { x1: 15, y1: 60, x2: 50, y2: 50, delay: 1.1 },
              { x1: 85, y1: 60, x2: 50, y2: 50, delay: 1.2 },
            ].map((line, i) => (
              <motion.line
                key={`inner-${i}`}
                x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2}
                stroke="url(#lineGradient2)"
                strokeWidth="0.5"
                strokeDasharray="2,2"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.5 }}
                transition={{ duration: 0.6, delay: line.delay }}
              />
            ))}

            {/* Stars - different sizes and colors */}
            {[
              { cx: 50, cy: 15, delay: 0.3, unlocked: true, color: '#fbbf24', size: 4, name: 'Focus' },
              { cx: 25, cy: 35, delay: 0.5, unlocked: true, color: '#3b82f6', size: 3.5, name: 'Logic' },
              { cx: 75, cy: 35, delay: 0.7, unlocked: true, color: '#8b5cf6', size: 3.5, name: 'Creative' },
              { cx: 15, cy: 60, delay: 0.9, unlocked: true, color: '#06b6d4', size: 3, name: 'Learn' },
              { cx: 85, cy: 60, delay: 1.1, unlocked: false, color: '#6b7280', size: 3, name: 'Master' },
              { cx: 30, cy: 80, delay: 1.3, unlocked: false, color: '#6b7280', size: 2.5, name: '' },
              { cx: 70, cy: 80, delay: 1.5, unlocked: false, color: '#6b7280', size: 2.5, name: '' },
              { cx: 50, cy: 90, delay: 1.7, unlocked: false, color: '#6b7280', size: 2, name: '' },
              { cx: 50, cy: 50, delay: 1.4, unlocked: true, color: '#ec4899', size: 5, name: 'Core' },
            ].map((star, index) => (
              <motion.g key={index}>
                {/* Outer glow for unlocked stars */}
                {star.unlocked && (
                  <>
                    <motion.circle
                      cx={star.cx}
                      cy={star.cy}
                      r={star.size * 3}
                      fill={star.color}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0.05, 0.15, 0.05] }}
                      transition={{ duration: 2, repeat: Infinity, delay: star.delay }}
                    />
                    <motion.circle
                      cx={star.cx}
                      cy={star.cy}
                      r={star.size * 1.8}
                      fill={star.color}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.2 }}
                      transition={{ delay: star.delay }}
                    />
                  </>
                )}

                {/* Main star */}
                <motion.circle
                  cx={star.cx}
                  cy={star.cy}
                  r={star.size}
                  fill={star.unlocked ? star.color : 'rgba(255,255,255,0.15)'}
                  filter={star.unlocked ? "url(#glow)" : undefined}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: star.delay, type: 'spring', stiffness: 200 }}
                />

                {/* Pulse animation for unlocked */}
                {star.unlocked && (
                  <motion.circle
                    cx={star.cx}
                    cy={star.cy}
                    r={star.size}
                    fill="none"
                    stroke={star.color}
                    strokeWidth="0.5"
                    initial={{ scale: 1, opacity: 0.8 }}
                    animate={{ scale: 2.5, opacity: 0 }}
                    transition={{ duration: 2, repeat: Infinity, delay: star.delay + 0.5 }}
                  />
                )}

                {/* Locked icon */}
                {!star.unlocked && (
                  <motion.text
                    x={star.cx}
                    y={star.cy + 1}
                    textAnchor="middle"
                    fontSize="4"
                    fill="rgba(255,255,255,0.3)"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: star.delay + 0.2 }}
                  >
                    ?
                  </motion.text>
                )}
              </motion.g>
            ))}

            {/* Sparkle effects */}
            {[...Array(5)].map((_, i) => (
              <motion.circle
                key={`sparkle-${i}`}
                cx={20 + i * 15}
                cy={20 + (i % 3) * 25}
                r="0.8"
                fill="white"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.4 + 2 }}
              />
            ))}
          </svg>

          {/* Legend */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2 }}
            className="absolute -bottom-8 left-0 right-0 flex justify-center gap-4 text-xs"
          >
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-yellow-400" />
              <span className="text-white/50">Unlocked</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-white/20" />
              <span className="text-white/50">Locked</span>
            </div>
          </motion.div>
        </motion.div>
      );

    case 'bazaar_demo':
      return (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex items-center justify-center gap-4"
        >
          {/* Bazaar items preview */}
          {[
            { name: 'Sword', price: 50, icon: '⚔️' },
            { name: 'Potion', price: 25, icon: '🧪' },
            { name: 'Shield', price: 75, icon: '🛡️' },
          ].map((item, index) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 * index }}
              className="bg-[#1a1724] rounded-xl p-4 border border-white/10 text-center"
            >
              <div className="text-3xl mb-2">{item.icon}</div>
              <div className="text-sm text-white/70">{item.name}</div>
              <div className="text-xs text-emerald-400 mt-1">{item.price} ✧</div>
            </motion.div>
          ))}
        </motion.div>
      );

    default:
      return null;
  }
};

export default function GamificationTourStep({ onNext, onPrev, onSkip, canSkip, isTransitioning }) {
  const {
    gamificationMode,
    tourCompleted,
    completeTourSection,
    isDialogueComplete,
    setNovaState,
    addOnboardingXP,
  } = useNewOnboardingStore();

  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [sectionsViewed, setSectionsViewed] = useState(new Set());

  const dialogueComplete = isDialogueComplete();
  const currentSection = TOUR_SECTIONS[currentSectionIndex];
  const Icon = currentSection?.icon;

  // Skip this step for minimal mode
  if (gamificationMode === 'minimal' && dialogueComplete) {
    return (
      <div className="flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-3xl font-bold text-white mb-4">Ready to Go!</h1>
          <p className="text-white/60 mb-8">Your minimal setup is complete.</p>
          <motion.button
            onClick={onNext}
            className="flex items-center gap-2 px-8 py-3 rounded-xl font-semibold bg-gradient-to-r from-gray-500 to-gray-600 text-white"
          >
            <span>Continue</span>
            <ChevronRight className="w-5 h-5" />
          </motion.button>
        </motion.div>
      </div>
    );
  }

  const handleViewSection = () => {
    setSectionsViewed(prev => new Set([...prev, currentSection.id]));
    completeTourSection(currentSection.id);
    setNovaState('proud');
  };

  const handleNextSection = () => {
    handleViewSection();

    if (currentSectionIndex < TOUR_SECTIONS.length - 1) {
      setCurrentSectionIndex(prev => prev + 1);
      setNovaState('excited');
    } else {
      // Tour complete - award bonus XP
      addOnboardingXP(50);
      onNext();
    }
  };

  const handlePrevSection = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(prev => prev - 1);
    } else {
      onPrev();
    }
  };

  const dialogues = NOVA_DIALOGUES[ONBOARDING_STEPS.GAMIFICATION_TOUR];

  return (
    <div className="flex flex-col items-center">
      {/* Section indicator */}
      {dialogueComplete && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 mb-6"
        >
          {TOUR_SECTIONS.map((section, index) => (
            <div
              key={section.id}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentSectionIndex
                  ? 'w-6 bg-purple-500'
                  : sectionsViewed.has(section.id)
                  ? 'bg-green-500'
                  : 'bg-white/20'
              }`}
            />
          ))}
        </motion.div>
      )}

      {/* Title */}
      {dialogueComplete && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center bg-gradient-to-br ${currentSection.color}`}>
            <Icon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            {currentSection.title}
          </h1>
          <p className="text-white/60 max-w-md mx-auto">
            {currentSection.description}
          </p>
        </motion.div>
      )}

      {/* Visual Demo */}
      {dialogueComplete && (
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSection.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-lg py-8"
          >
            <TourVisual section={currentSection.visual} isActive={true} />
          </motion.div>
        </AnimatePresence>
      )}

      {/* Nova's explanation */}
      {dialogueComplete && dialogues && dialogues[currentSection.id] && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-purple-500/10 border border-purple-500/20 rounded-xl px-6 py-4 mb-8 max-w-md"
        >
          <p className="text-white/80 text-sm italic">
            "{dialogues[currentSection.id]}"
          </p>
        </motion.div>
      )}

      {/* Navigation */}
      {dialogueComplete && (
        <div className="flex items-center justify-between w-full max-w-md">
          <button
            onClick={handlePrevSection}
            className="flex items-center gap-2 px-4 py-2 text-white/60 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Back</span>
          </button>

          <div className="flex items-center gap-3">
            {canSkip && (
              <button
                onClick={onSkip}
                className="px-4 py-2 text-white/40 hover:text-white/60 transition-colors text-sm"
              >
                Skip Tour
              </button>
            )}

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={handleNextSection}
              disabled={isTransitioning}
              className={`
                flex items-center gap-2 px-6 py-3 rounded-xl font-semibold
                bg-gradient-to-r ${currentSection.color} text-white
                hover:shadow-lg hover:scale-[1.02] transition-all duration-200
              `}
            >
              <span>
                {currentSectionIndex < TOUR_SECTIONS.length - 1 ? 'Next' : 'Complete Tour'}
              </span>
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      )}
    </div>
  );
}
