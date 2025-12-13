/**
 * ActivePerkBonuses - Display active perk effects and bonuses
 *
 * Shows the user what bonuses they have from unlocked perks
 * Note: Features are NOT gated - perks only provide bonuses
 */

import React from 'react';
import { Sparkles, Star, TrendingUp, Lock, Coins, Award } from 'lucide-react';
import usePerkStore from '../../stores/perkStore';
import { PERK_TREES } from '../../data/perkTrees';

// Format multiplier for display
const formatMultiplier = (value) => {
  if (value === 1) return null;
  return value > 1 ? `+${Math.round((value - 1) * 100)}%` : `-${Math.round((1 - value) * 100)}%`;
};

// Format bonus for display
const formatBonus = (value) => {
  if (value === 0) return null;
  return value > 0 ? `+${Math.round(value * 100)}%` : `-${Math.round(Math.abs(value) * 100)}%`;
};

export default function ActivePerkBonuses() {
  const { activeEffects, statLevels, unlockedPerksByTree } = usePerkStore();

  // Count total unlocked perks
  const totalUnlockedPerks = Object.values(unlockedPerksByTree).reduce(
    (sum, perks) => sum + perks.length,
    0
  );

  // Count total perks
  const totalPerks = Object.values(PERK_TREES).reduce(
    (sum, tree) => sum + tree.perks.length,
    0
  );

  // Get notable bonuses
  const bonuses = [];

  // Global XP multiplier
  const globalBonus = formatMultiplier(activeEffects.globalXpMultiplier);
  if (globalBonus) {
    bonuses.push({ label: 'Global XP', value: globalBonus, color: 'text-yellow-400' });
  }

  // Tree-specific multipliers
  const treeMultipliers = [
    { key: 'bodyXpMultiplier', label: 'Body XP', color: 'text-orange-400' },
    { key: 'mindXpMultiplier', label: 'Mind XP', color: 'text-purple-400' },
    { key: 'spiritXpMultiplier', label: 'Spirit XP', color: 'text-cyan-400' },
    { key: 'wealthXpMultiplier', label: 'Wealth XP', color: 'text-amber-400' },
    { key: 'socialXpMultiplier', label: 'Social XP', color: 'text-green-400' },
    { key: 'craftXpMultiplier', label: 'Craft XP', color: 'text-slate-400' },
  ];

  treeMultipliers.forEach(({ key, label, color }) => {
    const bonus = formatMultiplier(activeEffects[key]);
    if (bonus) {
      bonuses.push({ label, value: bonus, color });
    }
  });

  // Category bonuses
  const categoryBonuses = [
    { key: 'cardioXpBonus', label: 'Cardio', color: 'text-red-400' },
    { key: 'strengthXpBonus', label: 'Strength', color: 'text-orange-400' },
    { key: 'sleepXpBonus', label: 'Sleep', color: 'text-indigo-400' },
    { key: 'readingXpBonus', label: 'Reading', color: 'text-blue-400' },
    { key: 'deepWorkXpBonus', label: 'Deep Work', color: 'text-purple-400' },
    { key: 'meditationXpBonus', label: 'Meditation', color: 'text-cyan-400' },
  ];

  categoryBonuses.forEach(({ key, label, color }) => {
    const bonus = formatBonus(activeEffects[key]);
    if (bonus) {
      bonuses.push({ label, value: bonus, color });
    }
  });

  // Streak bonus
  if (activeEffects.streakBonusPerDay > 0) {
    bonuses.push({
      label: 'Streak Bonus',
      value: `+${Math.round(activeEffects.streakBonusPerDay * 100)}%/day (max ${Math.round(activeEffects.streakBonusMax * 100)}%)`,
      color: 'text-emerald-400',
    });
  }

  // Special multipliers
  if (activeEffects.intenseWorkoutMultiplier > 1) {
    bonuses.push({
      label: 'Intense Workout (45+ min)',
      value: `x${activeEffects.intenseWorkoutMultiplier}`,
      color: 'text-red-400',
    });
  }

  if (activeEffects.longSessionMultiplier > 1) {
    bonuses.push({
      label: 'Long Deep Work (2+ hr)',
      value: `x${activeEffects.longSessionMultiplier}`,
      color: 'text-purple-400',
    });
  }

  if (activeEffects.flowMultiplier > 1) {
    bonuses.push({
      label: 'Creative Flow (2+ hr)',
      value: `x${activeEffects.flowMultiplier}`,
      color: 'text-pink-400',
    });
  }

  // Gold bonuses
  const goldBonuses = [];
  const goldKeys = [
    { key: 'cardioGoldBonus', label: 'Cardio' },
    { key: 'strengthGoldBonus', label: 'Strength' },
    { key: 'readingGoldBonus', label: 'Reading' },
    { key: 'flowSessionGold', label: 'Flow Session' },
    { key: 'perfectMacroGold', label: 'Perfect Macros' },
    { key: 'meditationGoldBonus', label: 'Meditation' },
    { key: 'deepMeditationGold', label: 'Deep Meditation' },
    { key: 'incomeLogGold', label: 'Income Log' },
    { key: 'budgetAdherenceGold', label: 'Budget Adherence' },
    { key: 'savingsMilestoneGold', label: 'Savings Milestone' },
    { key: 'portfolioGrowthGold', label: 'Portfolio Growth' },
    { key: 'conversationGold', label: 'Conversation' },
    { key: 'newConnectionGold', label: 'New Connection' },
    { key: 'speakingGold', label: 'Public Speaking' },
    { key: 'communityGold', label: 'Community Building' },
    { key: 'practiceGoldPerHour', label: 'Practice/hour' },
    { key: 'projectGold', label: 'Project Completed' },
    { key: 'feedbackGold', label: 'Feedback Received' },
  ];

  goldKeys.forEach(({ key, label }) => {
    const value = activeEffects[key] || 0;
    if (value > 0) {
      goldBonuses.push({ label, value: `+${value}` });
    }
  });

  // Unlocked titles
  const titles = activeEffects.unlockedTitles || [];

  // Keystones
  const keystones = activeEffects.keystones || [];

  return (
    <div className="space-y-4">
      {/* Summary Header */}
      <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <span className="font-semibold text-text-primary">Active Perk Bonuses</span>
          </div>
          <span className="text-sm text-text-muted">
            {totalUnlockedPerks} / {totalPerks} perks
          </span>
        </div>

        {/* Stat Levels */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-3">
          {Object.entries(PERK_TREES).map(([treeId, tree]) => (
            <div
              key={treeId}
              className="bg-bg-0/50 rounded-lg p-2 text-center"
            >
              <div className="text-xs text-text-muted uppercase">{tree.name}</div>
              <div
                className="text-lg font-bold"
                style={{ color: tree.color }}
              >
                {statLevels[treeId] || 1}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Bonuses */}
      {bonuses.length > 0 && (
        <div className="bg-bg-1 border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span className="font-medium text-text-primary">XP Bonuses</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {bonuses.map((bonus, index) => (
              <div
                key={index}
                className="bg-bg-0 rounded-lg px-3 py-2 flex items-center justify-between"
              >
                <span className="text-sm text-text-muted">{bonus.label}</span>
                <span className={`text-sm font-semibold ${bonus.color}`}>
                  {bonus.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Gold Bonuses */}
      {goldBonuses.length > 0 && (
        <div className="bg-bg-1 border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Coins className="w-4 h-4 text-amber-400" />
            <span className="font-medium text-text-primary">Gold Bonuses</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {goldBonuses.map((bonus, index) => (
              <div
                key={index}
                className="bg-bg-0 rounded-lg px-3 py-2 flex items-center justify-between"
              >
                <span className="text-sm text-text-muted">{bonus.label}</span>
                <span className="text-sm font-semibold text-amber-400">
                  {bonus.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Keystones */}
      {keystones.length > 0 && (
        <div className="bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Star className="w-4 h-4 text-amber-400" />
            <span className="font-medium text-text-primary">Active Keystones</span>
          </div>

          <div className="space-y-2">
            {keystones.map((keystone) => (
              <div
                key={keystone.id}
                className="bg-bg-0/50 rounded-lg px-3 py-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-amber-300">{keystone.name}</span>
                  <span className="text-xs px-2 py-0.5 bg-amber-500/20 rounded-full text-amber-400 uppercase">
                    {keystone.tree}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Unlocked Titles */}
      {titles.length > 0 && (
        <div className="bg-bg-1 border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Award className="w-4 h-4 text-purple-400" />
            <span className="font-medium text-text-primary">Unlocked Titles</span>
            <span className="text-xs text-text-muted">({titles.length})</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {titles.map((title) => (
              <span
                key={title}
                className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-lg text-sm text-purple-300 font-medium"
              >
                {title}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* No Bonuses State */}
      {bonuses.length === 0 && keystones.length === 0 && titles.length === 0 && goldBonuses.length === 0 && (
        <div className="bg-bg-1 border border-border rounded-xl p-6 text-center">
          <Lock className="w-10 h-10 mx-auto mb-3 text-text-muted opacity-40" />
          <p className="text-text-muted text-sm">
            Complete activities to level up your stats and unlock perks!
          </p>
          <p className="text-text-muted/70 text-xs mt-1">
            Each perk provides XP bonuses, gold, and titles.
          </p>
        </div>
      )}
    </div>
  );
}
