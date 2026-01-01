/**
 * ResolutionCard - Individual resolution display with animated progress ring
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Heart,
  Briefcase,
  BookOpen,
  DollarSign,
  Users,
  Palette,
  Brain,
  Repeat,
  Flame,
  CheckCircle2,
  Calendar,
  Target,
  TrendingUp,
} from 'lucide-react';
import { RESOLUTION_CATEGORIES, useResolutionStore } from '../../stores/resolutionStore';
import ResolutionProgressModal from './ResolutionProgressModal';

const CATEGORY_ICONS = {
  Heart,
  Briefcase,
  BookOpen,
  DollarSign,
  Users,
  Palette,
  Brain,
  Repeat,
};

export default function ResolutionCard({ resolution, onCheckIn, onEdit, compact = false }) {
  const [showProgressModal, setShowProgressModal] = useState(false);
  const { getResolutionProgress, hasCheckedInToday } = useResolutionStore();
  const category = RESOLUTION_CATEGORIES[resolution.category] || RESOLUTION_CATEGORIES.habits;
  const CategoryIcon = CATEGORY_ICONS[category.icon] || Target;
  const progress = getResolutionProgress(resolution.id);
  const checkedInToday = hasCheckedInToday(resolution.id);

  // Calculate ring properties
  const ringSize = compact ? 60 : 80;
  const strokeWidth = compact ? 6 : 8;
  const radius = (ringSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  // Calculate next milestone
  const nextMilestone = resolution.milestones?.find(m => !m.completed);
  const daysUntilMilestone = nextMilestone
    ? Math.ceil((new Date(nextMilestone.targetDate) - new Date()) / (1000 * 60 * 60 * 24))
    : null;

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#1a1724] border border-white/10 rounded-xl p-4 hover:border-white/20 transition-all"
      >
        <div className="flex items-center gap-4">
          {/* Progress Ring */}
          <div className="relative flex-shrink-0">
            <svg width={ringSize} height={ringSize} className="-rotate-90">
              {/* Background ring */}
              <circle
                cx={ringSize / 2}
                cy={ringSize / 2}
                r={radius}
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth={strokeWidth}
              />
              {/* Progress ring */}
              <motion.circle
                cx={ringSize / 2}
                cy={ringSize / 2}
                r={radius}
                fill="none"
                stroke={category.color}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </svg>
            {/* Center icon */}
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ color: category.color }}
            >
              <CategoryIcon className="w-5 h-5" />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-white truncate">{resolution.title}</h3>
            <div className="flex items-center gap-3 mt-1 text-sm text-white/50">
              <span className="flex items-center gap-1">
                <Flame className="w-3 h-3 text-orange-400" />
                {resolution.currentStreak}
              </span>
              <span>{progress}%</span>
            </div>
          </div>

          {/* Check-in button */}
          <button
            onClick={() => onCheckIn(resolution.id)}
            disabled={checkedInToday}
            className={`p-2 rounded-lg transition-all ${
              checkedInToday
                ? 'bg-green-500/20 text-green-400'
                : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
            }`}
          >
            <CheckCircle2 className="w-5 h-5" />
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      className="bg-[#1a1724] border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all relative overflow-hidden group"
    >
      {/* Background gradient */}
      <div
        className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity"
        style={{
          background: `radial-gradient(circle at top right, ${category.color}, transparent 70%)`,
        }}
      />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${category.color}20` }}
            >
              <CategoryIcon className="w-5 h-5" style={{ color: category.color }} />
            </div>
            <div>
              <span
                className="text-xs font-medium px-2 py-0.5 rounded-full"
                style={{ backgroundColor: `${category.color}20`, color: category.color }}
              >
                {category.name}
              </span>
            </div>
          </div>

          {/* Streak badge */}
          {resolution.currentStreak > 0 && (
            <div className="flex items-center gap-1 px-2 py-1 bg-orange-500/20 rounded-full">
              <Flame className="w-4 h-4 text-orange-400" />
              <span className="text-sm font-bold text-orange-400">{resolution.currentStreak}</span>
            </div>
          )}
        </div>

        {/* Title & Why */}
        <h3 className="text-xl font-bold text-white mb-2">{resolution.title}</h3>
        {resolution.why && (
          <p className="text-sm text-white/50 mb-4 line-clamp-2">{resolution.why}</p>
        )}

        {/* Progress Section */}
        <div className="flex items-center gap-6 mb-4">
          {/* Progress Ring */}
          <div className="relative flex-shrink-0">
            <svg width={ringSize} height={ringSize} className="-rotate-90">
              <circle
                cx={ringSize / 2}
                cy={ringSize / 2}
                r={radius}
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth={strokeWidth}
              />
              <motion.circle
                cx={ringSize / 2}
                cy={ringSize / 2}
                r={radius}
                fill="none"
                stroke={category.color}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1, ease: 'easeOut' }}
                style={{
                  filter: `drop-shadow(0 0 6px ${category.color}50)`,
                }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-bold text-white">{progress}%</span>
            </div>
          </div>

          {/* Stats */}
          <div className="flex-1 grid grid-cols-2 gap-3">
            <div className="bg-white/5 rounded-lg p-3">
              <div className="text-xs text-white/50 mb-1">Total Check-ins</div>
              <div className="text-lg font-bold text-white">{resolution.totalCheckIns}</div>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <div className="text-xs text-white/50 mb-1">Best Streak</div>
              <div className="text-lg font-bold text-white">{resolution.longestStreak}</div>
            </div>
          </div>
        </div>

        {/* Next Milestone */}
        {nextMilestone && (
          <div className="bg-white/5 rounded-xl p-3 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-white/40" />
                <span className="text-sm text-white/70">{nextMilestone.title}</span>
              </div>
              {daysUntilMilestone > 0 && (
                <span className="text-xs text-white/50">{daysUntilMilestone} days</span>
              )}
            </div>
          </div>
        )}

        {/* Milestones Progress */}
        <div className="flex gap-1 mb-4">
          {resolution.milestones?.map((milestone, idx) => (
            <div
              key={milestone.id}
              className={`flex-1 h-2 rounded-full ${
                milestone.completed ? 'bg-green-500' : 'bg-white/10'
              }`}
              title={`Q${idx + 1}: ${milestone.completed ? 'Completed' : 'Pending'}`}
            />
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => onCheckIn(resolution.id)}
            disabled={checkedInToday}
            className={`flex-1 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
              checkedInToday
                ? 'bg-green-500/20 text-green-400 cursor-default'
                : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90'
            }`}
          >
            <CheckCircle2 className="w-5 h-5" />
            {checkedInToday ? 'Checked In Today' : 'Check In'}
          </button>
          <button
            onClick={() => setShowProgressModal(true)}
            className="px-4 py-3 bg-white/5 hover:bg-white/10 text-white/70 rounded-xl transition-all"
            title="View Progress"
          >
            <TrendingUp className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Progress Modal */}
      <ResolutionProgressModal
        resolution={resolution}
        isOpen={showProgressModal}
        onClose={() => setShowProgressModal(false)}
      />
    </motion.div>
  );
}
