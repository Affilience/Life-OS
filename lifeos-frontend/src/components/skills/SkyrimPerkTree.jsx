/**
 * SkyrimPerkTree - Skyrim-inspired constellation perk trees
 *
 * Displays 6 stat-based perk trees (BODY, MIND, SPIRIT, WEALTH, SOCIAL, CRAFT)
 * with constellation-style visuals and progressive unlocking.
 *
 * Now integrated with perkStore for REAL perk effects!
 */

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Lock, Unlock, Info, Zap, Star } from 'lucide-react';
import { PERK_TREES } from '../../data/perkTrees';
import { useStats } from '../../hooks/useStats';
import { useGamificationModeStore } from '../../stores/gamificationModeStore';
import usePerkStore from '../../stores/perkStore';

// Tier colors for visual hierarchy
const TIER_COLORS = {
  novice: { bg: 'from-slate-600 to-slate-500', text: 'text-slate-300', glow: 'rgba(148, 163, 184, 0.5)' },
  adept: { bg: 'from-blue-600 to-blue-500', text: 'text-blue-300', glow: 'rgba(59, 130, 246, 0.5)' },
  expert: { bg: 'from-purple-600 to-purple-500', text: 'text-purple-300', glow: 'rgba(147, 51, 234, 0.5)' },
  master: { bg: 'from-amber-500 to-yellow-400', text: 'text-amber-300', glow: 'rgba(245, 158, 11, 0.7)' },
};

// Map stat keys to tree keys
const STAT_TO_TREE = {
  STR: 'body',
  VIT: 'body',
  INT: 'mind',
  WIS: 'spirit',
  DEF: 'wealth',
};

export default function SkyrimPerkTree() {
  const [currentTreeIndex, setCurrentTreeIndex] = useState(0);
  const [selectedPerk, setSelectedPerk] = useState(null);
  const [hoveredPerk, setHoveredPerk] = useState(null);

  const { stats, totalPower } = useStats();
  const { mode } = useGamificationModeStore();

  // Get perk store state and actions
  const {
    statLevels,
    unlockedPerksByTree,
    activeEffects,
    setStatLevel,
    recalculatePerks,
  } = usePerkStore();

  const treeKeys = Object.keys(PERK_TREES);
  const currentTreeKey = treeKeys[currentTreeIndex];
  const currentTree = PERK_TREES[currentTreeKey];

  // Sync equipment stats to perk store on mount
  useEffect(() => {
    // Map equipment stats to perk tree stats
    // Convert equipment stats (0-100+) to perk stat levels (1-100)
    const mappedStats = {
      body: Math.max(1, Math.min(100, Math.floor((stats.STR || 0) + (stats.VIT || 0)) / 2)),
      mind: Math.max(1, Math.min(100, stats.INT || 1)),
      spirit: Math.max(1, Math.min(100, stats.WIS || 1)),
      wealth: Math.max(1, Math.min(100, stats.DEF || 1)),
      social: Math.max(1, Math.min(100, Math.floor((stats.WIS || 0) + (stats.INT || 0)) / 3)),
      craft: Math.max(1, Math.min(100, Math.floor((stats.INT || 0) + (stats.STR || 0)) / 3)),
    };

    // Only update if stats have meaningful values
    if (totalPower > 0) {
      Object.entries(mappedStats).forEach(([stat, level]) => {
        if (statLevels[stat] !== level && level > 1) {
          setStatLevel(stat, level);
        }
      });
    }
  }, [stats, totalPower]);

  // Get user level from perk store
  const userLevel = statLevels[currentTreeKey] || 1;

  // Get unlocked perks from perk store (these are the REAL unlocked perks)
  const unlockedPerks = useMemo(() => {
    return new Set(unlockedPerksByTree[currentTreeKey] || []);
  }, [unlockedPerksByTree, currentTreeKey]);

  // Navigation
  const nextTree = () => {
    setCurrentTreeIndex((prev) => (prev + 1) % treeKeys.length);
    setSelectedPerk(null);
  };

  const prevTree = () => {
    setCurrentTreeIndex((prev) => (prev - 1 + treeKeys.length) % treeKeys.length);
    setSelectedPerk(null);
  };

  // Calculate progress
  const totalPerks = currentTree.perks.length;
  const unlockedCount = unlockedPerks.size;
  const progressPercent = Math.round((unlockedCount / totalPerks) * 100);

  return (
    <div className="relative w-full min-h-[500px] sm:min-h-[550px] md:min-h-[600px] bg-[#0a0812] rounded-2xl overflow-hidden">
      {/* Cosmic Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0812] via-[#12101a] to-[#0a0812]" />
        {/* Stars background */}
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(1px 1px at 20px 30px, white, transparent),
                           radial-gradient(1px 1px at 40px 70px, white, transparent),
                           radial-gradient(1px 1px at 50px 160px, white, transparent),
                           radial-gradient(1px 1px at 90px 40px, white, transparent),
                           radial-gradient(1px 1px at 130px 80px, white, transparent),
                           radial-gradient(1px 1px at 160px 120px, white, transparent)`,
          backgroundSize: '200px 200px',
          opacity: 0.3,
        }} />
        {/* Nebula glow */}
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full blur-3xl opacity-20"
          style={{ background: currentTree.color }}
        />
      </div>

      {/* Header */}
      <div className="relative z-10 p-4 text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTreeKey}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            <h2
              className="text-2xl sm:text-3xl font-bold tracking-wider"
              style={{
                color: currentTree.color,
                textShadow: `0 0 30px ${currentTree.color}`
              }}
            >
              {currentTree.name}
            </h2>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Constellation Canvas */}
      <div className="relative z-10 flex items-center justify-center h-[420px] sm:h-[470px] md:h-[520px]">
        <AnimatePresence mode="wait">
          <motion.svg
            key={currentTreeKey}
            viewBox="0 0 500 450"
            className="w-full h-full"
            style={{ maxWidth: '900px' }}
            preserveAspectRatio="xMidYMid meet"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.4 }}
          >
            {/* Defs for gradients and filters */}
            <defs>
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              <filter id="strongGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              <radialGradient id={`perkGlow-${currentTreeKey}`}>
                <stop offset="0%" stopColor={currentTree.color} stopOpacity="0.8" />
                <stop offset="50%" stopColor={currentTree.color} stopOpacity="0.3" />
                <stop offset="100%" stopColor={currentTree.color} stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Draw connections (prerequisite lines) */}
            {currentTree.perks.map(perk =>
              perk.prerequisites.map(prereqId => {
                const prereqPerk = currentTree.perks.find(p => p.id === prereqId);
                if (!prereqPerk) return null;

                const isActive = unlockedPerks.has(perk.id) && unlockedPerks.has(prereqId);
                const isPartial = unlockedPerks.has(prereqId) && !unlockedPerks.has(perk.id);

                // Transform to fit 500x450 viewBox with proper spacing
                // Original data: x ~160-620 (center 400), y ~-25-530
                // Target: x 50-450 (center 250), y 20-420
                const transformX = (ox) => ((ox - 400) * 0.45) + 250;
                const transformY = (oy) => ((oy + 30) * 0.72) + 20;

                const x1 = transformX(prereqPerk.position.x);
                const y1 = transformY(prereqPerk.position.y);
                const x2 = transformX(perk.position.x);
                const y2 = transformY(perk.position.y);

                return (
                  <motion.line
                    key={`${prereqId}-${perk.id}`}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={isActive ? currentTree.color : isPartial ? currentTree.color : '#334155'}
                    strokeWidth={isActive ? 3 : 2}
                    strokeOpacity={isActive ? 0.9 : isPartial ? 0.4 : 0.2}
                    strokeDasharray={isActive ? 'none' : '5,5'}
                    filter={isActive ? 'url(#glow)' : 'none'}
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.8, delay: 0.1 }}
                  />
                );
              })
            )}

            {/* Draw perk nodes */}
            {currentTree.perks.map((perk, index) => {
              const isUnlocked = unlockedPerks.has(perk.id);
              const isSelected = selectedPerk?.id === perk.id;
              const isHovered = hoveredPerk?.id === perk.id;
              const tierColor = TIER_COLORS[perk.tier];

              // Check if next perk is available (prerequisites met but level not reached)
              const canUnlockSoon = !isUnlocked &&
                perk.prerequisites.every(prereqId => unlockedPerks.has(prereqId));

              const nodeSize = perk.type === 'keystone' ? 16 : perk.tier === 'master' ? 14 : perk.tier === 'expert' ? 12 : 10;

              // Transform to fit 500x450 viewBox with proper spacing
              const transformX = (ox) => ((ox - 400) * 0.45) + 250;
              const transformY = (oy) => ((oy + 30) * 0.72) + 20;
              const x = transformX(perk.position.x);
              const y = transformY(perk.position.y);

              return (
                <g
                  key={perk.id}
                  style={{ cursor: 'pointer' }}
                  onClick={() => setSelectedPerk(isSelected ? null : perk)}
                  onMouseEnter={() => setHoveredPerk(perk)}
                  onMouseLeave={() => setHoveredPerk(null)}
                >
                  {/* Glow effect for unlocked perks */}
                  {isUnlocked && (
                    <motion.circle
                      cx={x}
                      cy={y}
                      r={nodeSize * 3}
                      fill={`url(#perkGlow-${currentTreeKey})`}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 0.6 }}
                      transition={{ delay: index * 0.05, duration: 0.5 }}
                    />
                  )}

                  {/* Main node */}
                  <motion.circle
                    cx={x}
                    cy={y}
                    r={nodeSize}
                    fill={isUnlocked ? currentTree.color : canUnlockSoon ? '#475569' : '#1e293b'}
                    stroke={isUnlocked ? 'white' : canUnlockSoon ? currentTree.color : '#334155'}
                    strokeWidth={isSelected || isHovered ? 3 : 2}
                    filter={isUnlocked ? 'url(#strongGlow)' : 'none'}
                    initial={{ scale: 0 }}
                    animate={{
                      scale: isSelected ? 1.3 : isHovered ? 1.15 : 1,
                    }}
                    transition={{ delay: index * 0.03, type: 'spring', stiffness: 200 }}
                    style={{
                      filter: isUnlocked
                        ? `drop-shadow(0 0 10px ${currentTree.color}) drop-shadow(0 0 20px ${currentTree.color})`
                        : 'none'
                    }}
                  />

                  {/* Inner detail for keystones */}
                  {perk.type === 'keystone' && (
                    <motion.circle
                      cx={x}
                      cy={y}
                      r={nodeSize * 0.5}
                      fill={isUnlocked ? 'white' : '#475569'}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.03 + 0.1 }}
                    />
                  )}

                  {/* Lock icon for locked perks */}
                  {!isUnlocked && (
                    <motion.g
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.6 }}
                      transition={{ delay: index * 0.03 + 0.2 }}
                    >
                      <text
                        x={x}
                        y={y + 4}
                        textAnchor="middle"
                        fill={canUnlockSoon ? currentTree.color : '#64748b'}
                        fontSize="12"
                        fontWeight="bold"
                      >
                        {perk.level}
                      </text>
                    </motion.g>
                  )}

                  {/* Perk name label (show on hover or when selected) */}
                  {(isHovered || isSelected) && (
                    <motion.g
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <rect
                        x={x - 60}
                        y={y - nodeSize - 30}
                        width="120"
                        height="22"
                        rx="4"
                        fill="rgba(0,0,0,0.8)"
                        stroke={currentTree.color}
                        strokeWidth="1"
                      />
                      <text
                        x={x}
                        y={y - nodeSize - 14}
                        textAnchor="middle"
                        fill="white"
                        fontSize="11"
                        fontWeight="500"
                      >
                        {perk.name.length > 16 ? perk.name.substring(0, 16) + '...' : perk.name}
                      </text>
                    </motion.g>
                  )}
                </g>
              );
            })}
          </motion.svg>
        </AnimatePresence>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevTree}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-sm transition-all hover:scale-110"
      >
        <ChevronLeft className="w-6 h-6 text-white" />
      </button>
      <button
        onClick={nextTree}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-sm transition-all hover:scale-110"
      >
        <ChevronRight className="w-6 h-6 text-white" />
      </button>


      {/* Selected Perk Detail Panel */}
      <AnimatePresence>
        {selectedPerk && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute top-20 right-4 z-30 w-72 bg-[#12101a]/95 backdrop-blur-md border border-white/10 rounded-xl p-4 shadow-2xl"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-lg font-bold text-white">{selectedPerk.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`text-xs px-2 py-0.5 rounded ${TIER_COLORS[selectedPerk.tier].text}`}
                    style={{ backgroundColor: `${currentTree.color}20` }}
                  >
                    {selectedPerk.tier.toUpperCase()}
                  </span>
                  <span className="text-xs text-white/50">Level {selectedPerk.level}</span>
                </div>
              </div>
              {unlockedPerks.has(selectedPerk.id) ? (
                <Unlock className="w-5 h-5 text-green-400" />
              ) : (
                <Lock className="w-5 h-5 text-white/30" />
              )}
            </div>

            <p className="text-sm text-white/70 mb-3">{selectedPerk.description}</p>

            {selectedPerk.type !== 'passive' && (
              <div className="flex items-center gap-1 text-xs text-white/50 mb-2">
                <Info className="w-3 h-3" />
                <span className="capitalize">{selectedPerk.type}</span>
              </div>
            )}

            {selectedPerk.prerequisites.length > 0 && (
              <div className="text-xs text-white/40 mt-2 pt-2 border-t border-white/10">
                <span className="text-white/60">Requires: </span>
                {selectedPerk.prerequisites.map((prereqId, i) => {
                  const prereq = currentTree.perks.find(p => p.id === prereqId);
                  const isUnlocked = unlockedPerks.has(prereqId);
                  return (
                    <span key={prereqId}>
                      <span className={isUnlocked ? 'text-green-400' : 'text-red-400'}>
                        {prereq?.name || prereqId}
                      </span>
                      {i < selectedPerk.prerequisites.length - 1 && ', '}
                    </span>
                  );
                })}
              </div>
            )}

            <button
              onClick={() => setSelectedPerk(null)}
              className="absolute top-2 right-2 text-white/40 hover:text-white/80"
            >
              ×
            </button>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
