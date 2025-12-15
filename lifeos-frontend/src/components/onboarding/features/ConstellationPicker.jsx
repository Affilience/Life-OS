import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Heart, BookOpen, Wallet, Sparkles, Target } from 'lucide-react';
import { sounds } from '../../../services/microInteractions/sounds';

/**
 * ConstellationPicker - Interactive star map for goal selection
 *
 * Features:
 * - SVG-based interactive constellation
 * - Glowing star nodes for each goal
 * - Animated path connections between selected goals
 * - Max 3 selections
 * - Visual "destiny path" forms as you select
 */

const GOALS = [
  {
    id: 'productivity',
    label: 'Productivity',
    description: 'Master your time',
    icon: Zap,
    position: { x: 50, y: 12 },
    color: '#f97316', // orange
    glowColor: 'rgba(249, 115, 22, 0.4)',
  },
  {
    id: 'health',
    label: 'Health',
    description: 'Build strength',
    icon: Heart,
    position: { x: 85, y: 35 },
    color: '#ef4444', // red
    glowColor: 'rgba(239, 68, 68, 0.4)',
  },
  {
    id: 'learning',
    label: 'Learning',
    description: 'Expand knowledge',
    icon: BookOpen,
    position: { x: 75, y: 70 },
    color: '#3b82f6', // blue
    glowColor: 'rgba(59, 130, 246, 0.4)',
  },
  {
    id: 'financial',
    label: 'Financial',
    description: 'Build wealth',
    icon: Wallet,
    position: { x: 25, y: 70 },
    color: '#22c55e', // green
    glowColor: 'rgba(34, 197, 94, 0.4)',
  },
  {
    id: 'mindfulness',
    label: 'Mindfulness',
    description: 'Find balance',
    icon: Sparkles,
    position: { x: 15, y: 35 },
    color: '#a855f7', // purple
    glowColor: 'rgba(168, 85, 247, 0.4)',
  },
  {
    id: 'habits',
    label: 'Habits',
    description: 'Build routines',
    icon: Target,
    position: { x: 50, y: 50 },
    color: '#6366f1', // indigo
    glowColor: 'rgba(99, 102, 241, 0.4)',
  },
];

// Generate connection lines between selected goals
function getConnections(selectedIds) {
  const selected = GOALS.filter((g) => selectedIds.includes(g.id));
  const connections = [];

  for (let i = 0; i < selected.length; i++) {
    for (let j = i + 1; j < selected.length; j++) {
      connections.push({
        from: selected[i],
        to: selected[j],
        id: `${selected[i].id}-${selected[j].id}`,
      });
    }
  }

  return connections;
}

export default function ConstellationPicker({
  selectedGoals = [],
  onSelectionChange,
  maxSelections = 3,
  soundEnabled = true,
}) {
  const [hoveredGoal, setHoveredGoal] = useState(null);
  const connections = getConnections(selectedGoals);

  const handleGoalClick = (goalId) => {
    const isSelected = selectedGoals.includes(goalId);

    if (isSelected) {
      // Deselect
      onSelectionChange(selectedGoals.filter((id) => id !== goalId));
      if (soundEnabled && sounds.isEnabled()) {
        sounds.toggleOff();
      }
    } else if (selectedGoals.length < maxSelections) {
      // Select
      onSelectionChange([...selectedGoals, goalId]);
      if (soundEnabled && sounds.isEnabled()) {
        sounds.toggleOn();
      }
    }
  };

  return (
    <div className="relative w-full max-w-md mx-auto aspect-square">
      {/* Cosmic background glow */}
      <div className="absolute inset-0 bg-gradient-radial from-purple-500/10 via-transparent to-transparent rounded-full" />

      {/* SVG Constellation */}
      <svg viewBox="0 0 100 100" className="w-full h-full relative z-10">
        <defs>
          {/* Glow filter */}
          <filter id="starGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Connection line gradient */}
          <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.8" />
          </linearGradient>
        </defs>

        {/* Background dust particles */}
        {[...Array(30)].map((_, i) => (
          <motion.circle
            key={`dust-${i}`}
            cx={5 + Math.random() * 90}
            cy={5 + Math.random() * 90}
            r={0.2 + Math.random() * 0.4}
            fill="white"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.1, 0.3, 0.1] }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}

        {/* Connection lines between selected goals */}
        <AnimatePresence>
          {connections.map((conn) => (
            <motion.g key={conn.id}>
              {/* Glowing background line */}
              <motion.line
                x1={conn.from.position.x}
                y1={conn.from.position.y}
                x2={conn.to.position.x}
                y2={conn.to.position.y}
                stroke="url(#connectionGradient)"
                strokeWidth="1.5"
                strokeLinecap="round"
                filter="url(#starGlow)"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                exit={{ pathLength: 0, opacity: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
              {/* Thin bright center line */}
              <motion.line
                x1={conn.from.position.x}
                y1={conn.from.position.y}
                x2={conn.to.position.x}
                y2={conn.to.position.y}
                stroke="white"
                strokeWidth="0.3"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.6 }}
                exit={{ pathLength: 0, opacity: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
              />
            </motion.g>
          ))}
        </AnimatePresence>

        {/* Goal Stars */}
        {GOALS.map((goal) => {
          const isSelected = selectedGoals.includes(goal.id);
          const isHovered = hoveredGoal === goal.id;
          const canSelect = selectedGoals.length < maxSelections || isSelected;

          return (
            <motion.g
              key={goal.id}
              style={{ cursor: canSelect ? 'pointer' : 'not-allowed' }}
              onClick={() => canSelect && handleGoalClick(goal.id)}
              onMouseEnter={() => setHoveredGoal(goal.id)}
              onMouseLeave={() => setHoveredGoal(null)}
            >
              {/* Outer glow ring - only for selected */}
              {isSelected && (
                <>
                  <motion.circle
                    cx={goal.position.x}
                    cy={goal.position.y}
                    r={8}
                    fill={goal.color}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 0.15, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                  <motion.circle
                    cx={goal.position.x}
                    cy={goal.position.y}
                    r={6}
                    fill="none"
                    stroke={goal.color}
                    strokeWidth="0.5"
                    initial={{ scale: 1, opacity: 0.8 }}
                    animate={{ scale: 1.8, opacity: 0 }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                </>
              )}

              {/* Hover glow */}
              {isHovered && !isSelected && canSelect && (
                <motion.circle
                  cx={goal.position.x}
                  cy={goal.position.y}
                  r={6}
                  fill={goal.color}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.1 }}
                />
              )}

              {/* Main star */}
              <motion.circle
                cx={goal.position.x}
                cy={goal.position.y}
                r={isSelected ? 5 : isHovered ? 4.5 : 4}
                fill={isSelected ? goal.color : canSelect ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)'}
                filter={isSelected ? 'url(#starGlow)' : undefined}
                animate={{
                  scale: isSelected ? [1, 1.1, 1] : 1,
                }}
                transition={{
                  duration: 2,
                  repeat: isSelected ? Infinity : 0,
                  ease: 'easeInOut',
                }}
              />

              {/* Inner bright core */}
              {isSelected && (
                <motion.circle
                  cx={goal.position.x}
                  cy={goal.position.y}
                  r={2}
                  fill="white"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              )}
            </motion.g>
          );
        })}
      </svg>

      {/* Goal labels - positioned around the constellation */}
      {GOALS.map((goal) => {
        const isSelected = selectedGoals.includes(goal.id);
        const isHovered = hoveredGoal === goal.id;
        const canSelect = selectedGoals.length < maxSelections || isSelected;
        const Icon = goal.icon;

        // Calculate label position based on goal position
        const labelX = goal.position.x < 50 ? 'left-0' : goal.position.x > 50 ? 'right-0' : 'left-1/2 -translate-x-1/2';
        const labelY = goal.position.y < 40 ? 'top-0' : goal.position.y > 60 ? 'bottom-0' : 'top-1/2 -translate-y-1/2';

        return (
          <motion.div
            key={`label-${goal.id}`}
            className={`
              absolute flex items-center gap-2 px-3 py-1.5 rounded-full
              transition-all duration-300 cursor-pointer select-none
              ${isSelected
                ? 'bg-white/10 border border-white/20'
                : canSelect
                  ? 'bg-white/5 border border-white/10 hover:bg-white/10'
                  : 'bg-white/5 border border-white/5 opacity-50'
              }
            `}
            style={{
              left: `${goal.position.x}%`,
              top: `${goal.position.y}%`,
              transform: `translate(-50%, ${goal.position.y < 30 ? '-150%' : goal.position.y > 60 ? '80%' : '-50%'})`,
            }}
            onClick={() => canSelect && handleGoalClick(goal.id)}
            onMouseEnter={() => setHoveredGoal(goal.id)}
            onMouseLeave={() => setHoveredGoal(null)}
            whileHover={{ scale: canSelect ? 1.05 : 1 }}
            whileTap={{ scale: canSelect ? 0.95 : 1 }}
          >
            <Icon
              className="w-4 h-4"
              style={{ color: isSelected ? goal.color : 'rgba(255,255,255,0.6)' }}
            />
            <span
              className="text-sm font-medium"
              style={{ color: isSelected ? goal.color : 'rgba(255,255,255,0.8)' }}
            >
              {goal.label}
            </span>
          </motion.div>
        );
      })}

      {/* Selection counter */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full pt-4">
        <div className="flex items-center gap-2">
          {[...Array(maxSelections)].map((_, i) => (
            <motion.div
              key={i}
              className={`w-2 h-2 rounded-full ${
                i < selectedGoals.length
                  ? 'bg-purple-500'
                  : 'bg-white/20'
              }`}
              animate={{
                scale: i < selectedGoals.length ? [1, 1.2, 1] : 1,
              }}
              transition={{ duration: 0.3 }}
            />
          ))}
          <span className="text-white/40 text-sm ml-2">
            {selectedGoals.length}/{maxSelections} selected
          </span>
        </div>
      </div>
    </div>
  );
}
