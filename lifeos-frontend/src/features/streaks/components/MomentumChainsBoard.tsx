import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Shield, Zap, TrendingUp, BarChart2, Calendar, Plus, Check, Settings, Trash2, ChevronDown, ChevronUp, Grid, List, LayoutGrid } from 'lucide-react';
import { YearlyHeatmap } from './YearlyHeatmap';
import { StreakDetailModal } from './StreakDetailModal';
import { useGamificationStore } from '../../../stores/gamificationStore';
import { useGamificationModeStore, TERMINOLOGY, VISIBILITY } from '../../../stores/gamificationModeStore';
import useCustomStreaksStore from '../../../stores/customStreaksStore';
import AddCustomStreakModal from '../../../components/streaks/AddCustomStreakModal';
import { feedback } from '../../../services/microInteractions';

// Type for streak chains
interface Chain {
  id: string;
  name: string;
  icon: string;
  currentStreak: number;
  longestStreak: number;
  color: string;
  weekData: boolean[];
  description?: string;
}

// Module to icon/color mapping
const MODULE_CONFIG: Record<string, { icon: string; color: string }> = {
  // Fitness & Health
  fitness: { icon: '💪', color: 'green' },
  workouts: { icon: '🏋️', color: 'green' },
  cardio: { icon: '🏃', color: 'green' },
  health: { icon: '❤️', color: 'green' },
  sleep: { icon: '😴', color: 'blue' },
  water: { icon: '💧', color: 'blue' },
  nutrition: { icon: '🥗', color: 'green' },
  steps: { icon: '👟', color: 'green' },
  meditation: { icon: '🧘', color: 'purple' },
  stretching: { icon: '🤸', color: 'green' },

  // Mental & Personal
  journal: { icon: '📝', color: 'blue' },
  gratitude: { icon: '🙏', color: 'orange' },
  reflection: { icon: '💭', color: 'blue' },
  mood_tracking: { icon: '😊', color: 'orange' },

  // Learning & Growth
  knowledge: { icon: '📚', color: 'orange' },
  reading: { icon: '📖', color: 'orange' },
  learning: { icon: '🎓', color: 'orange' },
  skills: { icon: '⚡', color: 'purple' },
  languages: { icon: '🌍', color: 'blue' },

  // Productivity
  productivity: { icon: '🎯', color: 'purple' },
  deep_work: { icon: '🧠', color: 'purple' },
  daily_missions: { icon: '✅', color: 'purple' },
  calendar: { icon: '📅', color: 'purple' },
  inbox_zero: { icon: '📧', color: 'blue' },

  // Financial
  financial: { icon: '💰', color: 'green' },
  no_spend: { icon: '🚫', color: 'green' },
  saving: { icon: '🐷', color: 'green' },
  budget: { icon: '📊', color: 'green' },

  // Lifestyle
  creative: { icon: '🎨', color: 'orange' },
  social: { icon: '👥', color: 'blue' },
  outdoors: { icon: '🌲', color: 'green' },
  screen_free: { icon: '📵', color: 'purple' },
  early_wake: { icon: '🌅', color: 'orange' },

  default: { icon: '⭐', color: 'purple' }
};

// Default chains to show if no real data - comprehensive habit tracking
const defaultChains = [
  // Productivity & Growth
  {
    id: 'default-missions',
    name: 'Daily Missions',
    icon: '✅',
    currentStreak: 0,
    longestStreak: 0,
    color: 'purple',
    weekData: [false, false, false, false, false, false, false],
    description: 'Complete your daily missions'
  },
  {
    id: 'default-deep-work',
    name: 'Deep Work',
    icon: '🧠',
    currentStreak: 0,
    longestStreak: 0,
    color: 'purple',
    weekData: [false, false, false, false, false, false, false],
    description: '2+ hours of focused work'
  },

  // Mental & Personal
  {
    id: 'default-journal',
    name: 'Journal',
    icon: '📝',
    currentStreak: 0,
    longestStreak: 0,
    color: 'blue',
    weekData: [false, false, false, false, false, false, false],
    description: 'Write a journal entry'
  },
  {
    id: 'default-meditation',
    name: 'Meditation',
    icon: '🧘',
    currentStreak: 0,
    longestStreak: 0,
    color: 'purple',
    weekData: [false, false, false, false, false, false, false],
    description: '10+ minutes of meditation'
  },

  // Health & Fitness
  {
    id: 'default-workouts',
    name: 'Workouts',
    icon: '🏋️',
    currentStreak: 0,
    longestStreak: 0,
    color: 'green',
    weekData: [false, false, false, false, false, false, false],
    description: 'Complete a workout'
  },
  {
    id: 'default-water',
    name: 'Hydration',
    icon: '💧',
    currentStreak: 0,
    longestStreak: 0,
    color: 'blue',
    weekData: [false, false, false, false, false, false, false],
    description: 'Drink 8 glasses of water'
  },
  {
    id: 'default-nutrition',
    name: 'Nutrition',
    icon: '🥗',
    currentStreak: 0,
    longestStreak: 0,
    color: 'green',
    weekData: [false, false, false, false, false, false, false],
    description: 'Log all meals'
  },

  // Learning & Growth
  {
    id: 'default-reading',
    name: 'Reading',
    icon: '📖',
    currentStreak: 0,
    longestStreak: 0,
    color: 'orange',
    weekData: [false, false, false, false, false, false, false],
    description: 'Read for 30+ minutes'
  },
  {
    id: 'default-skills',
    name: 'Skills Practice',
    icon: '⚡',
    currentStreak: 0,
    longestStreak: 0,
    color: 'purple',
    weekData: [false, false, false, false, false, false, false],
    description: 'Practice a skill'
  },

  // Financial
  {
    id: 'default-budget',
    name: 'Budget Check',
    icon: '📊',
    currentStreak: 0,
    longestStreak: 0,
    color: 'green',
    weekData: [false, false, false, false, false, false, false],
    description: 'Stay within daily budget'
  },
];

// Generate heatmap data from recent events
const generateHeatmapData = (recentEvents: any[] = []) => {
  const data: { date: string; value: number }[] = [];
  const today = new Date();

  // Create a map of dates to event counts
  const eventsByDate: Record<string, number> = {};
  (recentEvents || []).forEach(event => {
    if (event.timestamp) {
      const date = event.timestamp.split('T')[0];
      eventsByDate[date] = (eventsByDate[date] || 0) + 1;
    }
  });

  // Generate 365 days of data
  for (let i = 0; i < 365; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    data.push({
      date: dateStr,
      value: eventsByDate[dateStr] || 0
    });
  }
  return data;
};

export function MomentumChainsBoard() {
  // Connect to gamification store
  const { streaks, globalStreak, recentEvents } = useGamificationStore();

  // Connect to custom streaks store
  const {
    streaks: customStreaks,
    completions: customCompletions,
    initialize: initCustomStreaks,
    initialized: customStreaksInitialized,
    logCompletion,
    undoCompletion,
    isCompletedForDate,
    getWeekData,
    deleteStreak: deleteCustomStreak,
  } = useCustomStreaksStore();

  // Local state
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedStreak, setSelectedStreak] = useState<(Chain & { isCustom?: boolean; goal?: number; frequency?: string }) | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'detailed'>('grid');

  // Initialize custom streaks on mount
  useEffect(() => {
    if (!customStreaksInitialized) {
      initCustomStreaks();
    }
  }, [customStreaksInitialized, initCustomStreaks]);

  // Get gamification mode
  const mode = useGamificationModeStore((state) => state.mode);
  const terms = TERMINOLOGY[mode] || TERMINOLOGY.cosmic;
  const visibility = VISIBILITY[mode] || VISIBILITY.cosmic;

  // Build chains from store streaks AND custom streaks
  const chains = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];

    // Get last 7 days
    const last7Days: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      last7Days.push(d.toISOString().split('T')[0]);
    }

    // System-tracked streaks (from gamification store)
    const storeChains = (streaks || []).map(streak => {
      const config = MODULE_CONFIG[streak.module_id] || MODULE_CONFIG.default;
      const name = streak.name || streak.module_id?.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()) || 'Streak';

      // Build week data from streak history or recent activity
      // For now, we estimate based on current streak
      const streakStart = new Date();
      streakStart.setDate(streakStart.getDate() - (streak.current_streak || 0));
      const weekData = last7Days.map(date => {
        const dateObj = new Date(date);
        return dateObj >= streakStart && streak.current_streak > 0;
      });

      return {
        id: streak.id || `streak-${streak.module_id}`,
        name,
        icon: config.icon,
        currentStreak: streak.current_streak || 0,
        longestStreak: streak.longest_streak || 0,
        color: config.color,
        weekData,
        description: streak.description || undefined,
        isCustom: false,
      } as Chain & { isCustom: boolean };
    });

    // User-created custom streaks
    const customChainsList = (customStreaks || []).map(streak => {
      // Get completions for this streak for week data
      const streakCompletions = customCompletions.filter(c => c.streak_id === streak.id);
      const completionDates = new Set(streakCompletions.map(c => c.completed_date));
      const weekData = last7Days.map(date => completionDates.has(date));

      return {
        id: streak.id,
        name: streak.name,
        icon: streak.icon || '⭐',
        currentStreak: streak.current_streak || 0,
        longestStreak: streak.longest_streak || 0,
        color: streak.color || 'purple',
        weekData,
        description: streak.description || undefined,
        isCustom: true,
        goal: streak.goal,
        frequency: streak.frequency,
      } as Chain & { isCustom: boolean; goal?: number; frequency?: string };
    });

    // Combine all chains - custom streaks first, then system tracked
    const allChains = [...customChainsList, ...storeChains];

    // If we have real data, show only that
    // If we have no data at all, show all default chains for onboarding
    // This ensures users see the full list of trackable habits
    if (allChains.length > 0) {
      return allChains;
    }

    // Show all default chains when starting fresh
    return defaultChains.map(chain => ({
      ...chain,
      isCustom: false,
    }));
  }, [streaks, customStreaks, customCompletions]);

  // Generate heatmap from recent events
  const heatmapData = useMemo(() => {
    return generateHeatmapData(recentEvents);
  }, [recentEvents]);

  // Calculate stats
  const longestActiveStreak = Math.max(...chains.map(c => c.currentStreak), 0);
  const xpMultiplier = Math.min(1 + (longestActiveStreak * 0.02), 3);

  // Get tier based on longest streak
  const getTier = (streak: number) => {
    if (streak >= 100) return { name: 'Legendary', color: 'text-yellow-400', bg: 'from-yellow-500/20 to-amber-500/20' };
    if (streak >= 50) return { name: 'Epic', color: 'text-purple-400', bg: 'from-purple-500/20 to-pink-500/20' };
    if (streak >= 30) return { name: 'Rare', color: 'text-blue-400', bg: 'from-blue-500/20 to-cyan-500/20' };
    if (streak >= 7) return { name: 'Strong', color: 'text-green-400', bg: 'from-green-500/20 to-emerald-500/20' };
    return { name: 'Building', color: 'text-gray-400', bg: 'from-gray-500/20 to-gray-600/20' };
  };

  const tier = getTier(longestActiveStreak);

  const colorMap: Record<string, string> = {
    purple: 'from-purple-500 to-pink-500',
    blue: 'from-blue-500 to-cyan-500',
    green: 'from-green-500 to-emerald-500',
    orange: 'from-orange-500 to-amber-500'
  };

  // Get the appropriate flame sprite based on streak length
  const getFlameSprite = (streak: number) => {
    if (streak >= 100) return '/assets/streaks/flame_epic.png';
    if (streak >= 30) return '/assets/streaks/flame_large.png';
    if (streak >= 7) return '/assets/streaks/flame_medium.png';
    return '/assets/streaks/flame_small.png';
  };

  // Mode-specific main stats card rendering
  const renderMainStatsCard = () => {
    if (mode === 'cosmic') {
      // Full cosmic mode with animated flame
      return (
        <div className={`cosmic-panel rounded-2xl p-4 sm:p-6 bg-gradient-to-br ${tier.bg} border border-white/10`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Left - Main Streak with Pixel Art Flame */}
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="relative flex-shrink-0">
                {visibility.showStreakFlame ? (
                  <motion.div
                    animate={{ scale: [1, 1.08, 1], y: [0, -2, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    className="w-12 h-12 sm:w-16 sm:h-16"
                  >
                    <img
                      src={getFlameSprite(longestActiveStreak)}
                      alt="Streak flame"
                      className="w-full h-full object-contain pixelated drop-shadow-[0_0_8px_rgba(255,150,0,0.6)]"
                      style={{ imageRendering: 'pixelated' }}
                    />
                  </motion.div>
                ) : (
                  <Flame className="w-10 h-10 sm:w-12 sm:h-12 text-orange-400" />
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl sm:text-5xl font-bold text-white">{longestActiveStreak}</span>
                  <span className="text-base sm:text-lg text-white/60">day {terms.streak.toLowerCase()}</span>
                </div>
                <div className={`text-sm font-semibold ${tier.color} mt-1`}>
                  {tier.name} Rank
                </div>
              </div>
            </div>

            {/* Right - Quick Stats */}
            <div className="flex gap-4 sm:gap-6">
              <div className="text-center">
                <div className="flex items-center gap-1 text-yellow-400">
                  <Zap className="w-4 h-4" />
                  <span className="text-xl sm:text-2xl font-bold">+{Math.round((xpMultiplier - 1) * 100)}%</span>
                </div>
                <div className="text-xs text-white/50">{terms.xp} Boost</div>
              </div>
            </div>
          </div>
        </div>
      );
    } else if (mode === 'professional') {
      // Clean professional mode
      return (
        <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-2xl p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Left - Main Streak */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-6 h-6 sm:w-7 sm:h-7 text-blue-400" />
              </div>
              <div className="min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-bold text-white">{longestActiveStreak}</span>
                  <span className="text-sm sm:text-base text-white/60">day {terms.streak.toLowerCase()}</span>
                </div>
                <div className="text-sm text-blue-400 font-medium mt-1">
                  {tier.name} Level
                </div>
              </div>
            </div>

            {/* Right - Quick Stats */}
            <div className="flex gap-4 sm:gap-6">
              <div className="text-center">
                <div className="flex items-center gap-1 text-green-400">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-lg sm:text-xl font-bold">+{Math.round((xpMultiplier - 1) * 100)}%</span>
                </div>
                <div className="text-xs text-white/50">{terms.xp} Boost</div>
              </div>
            </div>
          </div>
        </div>
      );
    } else {
      // Minimal mode
      return (
        <div className="bg-[#1a1724] border border-white/10 rounded-xl p-4 sm:p-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <BarChart2 className="w-6 h-6 text-white/60 flex-shrink-0" />
              <div className="min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-bold text-white">{longestActiveStreak}</span>
                  <span className="text-sm text-white/60">day streak</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
  };

  // Mode-specific panel styling
  const getPanelClass = () => {
    if (mode === 'cosmic') return 'cosmic-panel rounded-2xl p-5 border border-white/10';
    if (mode === 'professional') return 'bg-[#1a1724] rounded-xl p-5 border border-blue-500/20';
    return 'bg-[#1a1724] rounded-xl p-4 border border-white/10';
  };

  // Mode-specific active indicator
  const getActiveIndicator = () => {
    if (mode === 'cosmic') return '🔥';
    if (mode === 'professional') return '✓';
    return '•';
  };

  // Handle check-in for custom streaks
  const handleCheckIn = async (streakId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const today = new Date().toISOString().split('T')[0];
    const isCompleted = isCompletedForDate(streakId, today);

    if (isCompleted) {
      // Unchecking
      feedback.taskUncomplete();
      await undoCompletion(streakId, today);
    } else {
      // Checking in - trigger feedback based on streak length
      const chain = chains.find(c => c.id === streakId);
      const currentStreak = chain?.currentStreak || 0;

      // Different feedback for milestone streaks
      if (currentStreak + 1 === 7 || currentStreak + 1 === 30 || currentStreak + 1 === 100) {
        feedback.streakMilestone(currentStreak + 1);
      } else if (currentStreak >= 3) {
        feedback.streakContinue(currentStreak + 1);
      } else {
        feedback.taskComplete({ celebrate: true });
      }

      await logCompletion(streakId, today);
    }
  };

  // Handle delete custom streak
  const handleDeleteStreak = async (streakId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this streak? This cannot be undone.')) {
      await deleteCustomStreak(streakId);
    }
  };

  // Get completions for a specific streak (for visualization)
  const getCompletionsForStreak = (streakId: string) => {
    return customCompletions.filter(c => c.streak_id === streakId);
  };

  // Render streak card based on mode
  const renderStreakCard = (chain: Chain & { isCustom?: boolean; goal?: number; frequency?: string }) => {
    const isActive = chain.currentStreak > 0;
    const weekCompletion = chain.weekData.filter(Boolean).length;
    const today = new Date().toISOString().split('T')[0];
    const isCompletedToday = chain.isCustom ? isCompletedForDate(chain.id, today) : chain.weekData[chain.weekData.length - 1];

    // Open detail modal on click
    const handleCardClick = () => {
      setSelectedStreak(chain);
    };

    // Minimal mode - simple list item with check-in
    if (mode === 'minimal') {
      return (
        <div
          key={chain.id}
          className={`
            flex items-center justify-between p-3 rounded-lg border cursor-pointer
            ${isActive ? 'bg-white/5 border-white/20' : 'bg-white/[0.02] border-white/10'}
            hover:bg-white/10 transition-colors
          `}
          onClick={handleCardClick}
        >
          <div className="flex items-center gap-3">
            {chain.isCustom && (
              <button
                onClick={(e) => handleCheckIn(chain.id, e)}
                className={`
                  w-6 h-6 rounded-full border-2 flex items-center justify-center
                  transition-all
                  ${isCompletedToday
                    ? 'bg-emerald-500 border-emerald-500 text-white'
                    : 'border-white/30 hover:border-emerald-500'
                  }
                `}
              >
                {isCompletedToday && <Check className="w-4 h-4" />}
              </button>
            )}
            <span className="text-xl mr-1">{chain.icon}</span>
            <span className={`text-sm ${isCompletedToday ? 'text-white' : 'text-white/80'}`}>{chain.name}</span>
            {isActive && !chain.isCustom && <span className="text-green-400 text-xs">•</span>}
          </div>
          <div className="text-right">
            <span className="text-lg font-bold text-white">{chain.currentStreak}</span>
            <span className="text-xs text-white/50 ml-1">days</span>
          </div>
        </div>
      );
    }

    // Professional mode - clean cards with check-in
    if (mode === 'professional') {
      return (
        <div
          key={chain.id}
          onClick={handleCardClick}
          className={`
            rounded-xl p-3 border transition-colors cursor-pointer
            ${isActive
              ? 'bg-blue-500/10 border-blue-500/30'
              : 'bg-white/5 border-white/10 hover:bg-white/10'
            }
          `}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">{chain.icon}</span>
              <span className="text-sm font-medium text-white/90">{chain.name}</span>
            </div>
            <div className="flex items-center gap-2">
              {chain.isCustom && (
                <button
                  onClick={(e) => handleCheckIn(chain.id, e)}
                  className={`
                    w-6 h-6 rounded-full border-2 flex items-center justify-center
                    transition-all
                    ${isCompletedToday
                      ? 'bg-blue-500 border-blue-500 text-white'
                      : 'border-white/30 hover:border-blue-500'
                    }
                  `}
                >
                  {isCompletedToday && <Check className="w-4 h-4" />}
                </button>
              )}
              {isActive && !chain.isCustom && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-500/20 text-green-400 font-medium">
                  ✓
                </span>
              )}
            </div>
          </div>
          <div className="flex items-baseline gap-1 mb-2">
            <span className="text-xl font-bold text-white">{chain.currentStreak}</span>
            <span className="text-xs text-white/50">days</span>
          </div>
          <div className="flex gap-0.5">
            {chain.weekData.map((completed, i) => (
              <div
                key={i}
                className={`flex-1 h-1 rounded-full ${completed ? 'bg-blue-500' : 'bg-white/10'}`}
              />
            ))}
          </div>
        </div>
      );
    }

    // Cosmic mode - full visual experience with check-in
    return (
      <motion.div
        key={chain.id}
        whileHover={{ scale: 1.02 }}
        onClick={handleCardClick}
        className={`
          rounded-xl p-3 border cursor-pointer transition-colors
          ${isActive
            ? `bg-gradient-to-br ${colorMap[chain.color]}/10 border-white/20`
            : 'bg-white/5 border-white/10 hover:bg-white/10'
          }
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xl">{chain.icon}</span>
          <div className="flex items-center gap-2">
            {chain.isCustom && (
              <button
                onClick={(e) => handleCheckIn(chain.id, e)}
                className={`
                  w-7 h-7 rounded-full border-2 flex items-center justify-center
                  transition-all
                  ${isCompletedToday
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 border-purple-400 text-white'
                    : 'border-white/30 hover:border-purple-500'
                  }
                `}
              >
                {isCompletedToday && <Check className="w-4 h-4" />}
              </button>
            )}
            {isActive && !chain.isCustom && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-500/20 text-green-400 font-medium">
                🔥
              </span>
            )}
          </div>
        </div>

        {/* Name */}
        <div className="text-sm font-medium text-white/90 mb-0.5">{chain.name}</div>

        {/* Description */}
        {chain.description && (
          <div className="text-[10px] text-white/40 mb-2 line-clamp-1">{chain.description}</div>
        )}

        {/* Streak Count */}
        <div className="flex items-baseline gap-1 mb-2">
          <span className="text-2xl font-bold text-white">{chain.currentStreak}</span>
          <span className="text-xs text-white/50">days</span>
          {chain.goal && (
            <span className="text-xs text-white/30 ml-1">/ {chain.goal}</span>
          )}
        </div>

        {/* Week Progress */}
        <div className="flex gap-0.5">
          {chain.weekData.map((completed, i) => (
            <div
              key={i}
              className={`
                flex-1 h-1 rounded-full
                ${completed
                  ? `bg-gradient-to-r ${colorMap[chain.color]}`
                  : 'bg-white/10'
                }
              `}
            />
          ))}
        </div>
        <div className="text-[10px] text-white/40 mt-1">{weekCompletion}/7 this week</div>
      </motion.div>
    );
  };

  // Get mode-specific add button styling
  const getAddButtonClass = () => {
    if (mode === 'cosmic') return 'bg-purple-500 hover:bg-purple-600';
    if (mode === 'professional') return 'bg-blue-500 hover:bg-blue-600';
    return 'bg-emerald-500 hover:bg-emerald-600';
  };

  return (
    <div className="space-y-6">
      {/* Main Stats Card - Mode-specific */}
      {renderMainStatsCard()}

      {/* Activity Heatmap */}
      <div className={getPanelClass()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`font-semibold text-white ${mode === 'minimal' ? 'text-base' : 'text-lg'}`}>
            {mode === 'cosmic' ? 'Activity' : 'Daily Activity'}
          </h3>
          <span className="text-sm text-white/50">
            {heatmapData.filter(d => d.value > 0).length} active days
          </span>
        </div>
        <YearlyHeatmap data={heatmapData} colorScheme={mode === 'professional' ? 'blue' : 'green'} />
      </div>

      {/* Custom Streaks Section */}
      {customStreaks.length > 0 && (
        <div className={getPanelClass()}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`font-semibold text-white ${mode === 'minimal' ? 'text-base' : 'text-lg'}`}>
              {mode === 'cosmic' ? 'Your Custom Streaks' : 'Custom Habits'}
            </h3>
            <button
              onClick={() => setShowAddModal(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 ${getAddButtonClass()} text-white rounded-lg text-sm font-medium transition-colors`}
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>

          {mode === 'minimal' ? (
            <div className="space-y-2">
              {chains.filter((c: any) => c.isCustom).map(renderStreakCard)}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {chains.filter((c: any) => c.isCustom).map(renderStreakCard)}
            </div>
          )}
        </div>
      )}

      {/* Streak Cards Grid - System tracked habits */}
      <div className={getPanelClass()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`font-semibold text-white ${mode === 'minimal' ? 'text-base' : 'text-lg'}`}>
            {mode === 'cosmic' ? 'Habit Chains' : mode === 'professional' ? 'Consistency Trackers' : 'Habits'}
          </h3>
          <div className="flex items-center gap-3">
            <span className="text-sm text-white/50">
              {chains.filter(c => c.currentStreak > 0 && !(c as any).isCustom).length} active
            </span>
            {customStreaks.length === 0 && (
              <button
                onClick={() => setShowAddModal(true)}
                className={`flex items-center gap-1.5 px-3 py-1.5 ${getAddButtonClass()} text-white rounded-lg text-sm font-medium transition-colors`}
              >
                <Plus className="w-4 h-4" />
                Add Custom
              </button>
            )}
          </div>
        </div>

        {mode === 'minimal' ? (
          // Minimal mode - simple list
          <div className="space-y-2">
            {chains.filter((c: any) => !c.isCustom).map(renderStreakCard)}
          </div>
        ) : (
          // Cosmic & Professional - card grid
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {chains.filter((c: any) => !c.isCustom).map(renderStreakCard)}
          </div>
        )}
      </div>

      {/* Empty state - show when no custom streaks */}
      {customStreaks.length === 0 && (
        <div className={`${getPanelClass()} text-center py-8`}>
          <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3">
            <Plus className="w-6 h-6 text-white/30" />
          </div>
          <h4 className="text-white font-medium mb-1">Create Your First Custom Streak</h4>
          <p className="text-white/50 text-sm mb-4 max-w-sm mx-auto">
            Track any habit you want! Set goals, see progress in multiple views, and build lasting habits.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className={`inline-flex items-center gap-2 px-4 py-2 ${getAddButtonClass()} text-white rounded-lg font-medium transition-colors`}
          >
            <Plus className="w-4 h-4" />
            Create Custom Streak
          </button>
        </div>
      )}

      {/* Add Custom Streak Modal */}
      {showAddModal && (
        <AddCustomStreakModal onClose={() => setShowAddModal(false)} />
      )}

      {/* Streak Detail Modal */}
      {selectedStreak && (
        <StreakDetailModal
          streak={selectedStreak}
          completions={selectedStreak.isCustom ? getCompletionsForStreak(selectedStreak.id) : generateSystemStreakCompletions(selectedStreak)}
          isOpen={!!selectedStreak}
          onClose={() => setSelectedStreak(null)}
          onCheckIn={selectedStreak.isCustom ? (streakId) => {
            const today = new Date().toISOString().split('T')[0];
            const isCompleted = isCompletedForDate(streakId, today);
            if (isCompleted) {
              feedback.taskUncomplete();
              undoCompletion(streakId, today);
            } else {
              feedback.taskComplete({ celebrate: true });
              logCompletion(streakId, today);
            }
          } : undefined}
          onDelete={selectedStreak.isCustom ? async (streakId) => {
            await deleteCustomStreak(streakId);
            setSelectedStreak(null);
          } : undefined}
          isCompletedToday={selectedStreak.isCustom ? isCompletedForDate(selectedStreak.id, new Date().toISOString().split('T')[0]) : false}
        />
      )}
    </div>
  );
}

// Helper to generate completions for system-tracked streaks based on weekData
function generateSystemStreakCompletions(streak: Chain): { streak_id: string; completed_date: string }[] {
  const completions: { streak_id: string; completed_date: string }[] = [];
  const today = new Date();

  // Use weekData to generate recent completions
  streak.weekData.forEach((completed, i) => {
    if (completed) {
      const date = new Date(today);
      date.setDate(date.getDate() - (6 - i));
      completions.push({
        streak_id: streak.id,
        completed_date: date.toISOString().split('T')[0],
      });
    }
  });

  // Also generate completions based on current streak
  // (going back from today for currentStreak days)
  if (streak.currentStreak > 7) {
    for (let i = 7; i < streak.currentStreak; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      completions.push({
        streak_id: streak.id,
        completed_date: date.toISOString().split('T')[0],
      });
    }
  }

  return completions;
}
