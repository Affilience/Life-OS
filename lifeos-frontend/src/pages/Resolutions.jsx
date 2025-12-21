/**
 * Resolutions - New Year's Resolution Tracking Page
 * Track goals throughout the year with progress visualization and gamification
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ResolutionsSetup } from '../components/onboarding/setup';
import useIntegratedOnboardingStore from '../stores/integratedOnboardingStore';
import PageHeader from '../components/shared/PageHeader';
import {
  Target,
  Plus,
  Calendar,
  Flame,
  Trophy,
  CheckCircle2,
  TrendingUp,
  Clock,
  Compass,
  Heart,
  Brain,
  Flag,
} from 'lucide-react';
import { useResolutionStore, RESOLUTION_CATEGORIES } from '../stores/resolutionStore';
import ResolutionCard from '../components/resolutions/ResolutionCard';
import AddResolutionModal from '../components/resolutions/AddResolutionModal';
import YearProgressRing from '../components/resolutions/YearProgressRing';
import AchievementBadges from '../components/resolutions/AchievementBadges';
import { triggerGamification } from '../hooks/useGamification';

// Navigation tabs matching PurposeValues
const navTabs = [
  { id: 'overview', name: 'Overview', icon: Compass, href: '/purpose' },
  { id: 'resolutions', name: 'Resolutions', icon: Target, href: '/resolutions' },
  { id: 'mission', name: 'Mission', icon: Target, href: '/purpose' },
  { id: 'values', name: 'Values', icon: Heart, href: '/purpose' },
  { id: 'vision', name: 'Vision', icon: TrendingUp, href: '/purpose' },
  { id: 'decisions', name: 'Decisions', icon: Brain, href: '/purpose' },
];

export default function Resolutions() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedResolution, setSelectedResolution] = useState(null);
  const navigate = useNavigate();
  const { isModuleComplete, hasSeenWelcome, isOnboardingComplete } = useIntegratedOnboardingStore();

  // Show setup wizard if resolutions module not configured during onboarding
  const showSetup = hasSeenWelcome && !isOnboardingComplete && !isModuleComplete('resolutions');

  const {
    resolutions,
    checkIn,
    getStats,
    getYearProgress,
    getDaysRemaining,
    initializeFromSupabase,
  } = useResolutionStore();

  // Initialize from Supabase on mount
  useEffect(() => {
    initializeFromSupabase?.();
  }, []);

  const stats = getStats();
  const yearProgress = getYearProgress();
  const daysRemaining = getDaysRemaining();
  const targetYear = 2026;
  const now = new Date();
  const isBeforeTargetYear = now < new Date(targetYear, 0, 1);

  // Filter resolutions by category
  const filteredResolutions = categoryFilter === 'all'
    ? resolutions
    : resolutions.filter(r => r.category === categoryFilter);

  const handleCheckIn = (resolutionId) => {
    checkIn(resolutionId);
    // Award XP for resolution check-in
    triggerGamification('resolutionCheckIn', { xpOverride: 20, module: 'purpose' });
  };

  const handleEdit = (resolution) => {
    setSelectedResolution(resolution);
  };

  return (
    <div className="min-h-screen bg-[#0c0a10] pb-24">
      {/* Tab Navigation - matching PurposeValues */}
      <div className="sticky top-0 z-40 bg-[#0c0a10] border-b border-slate-800">
        <div className="flex overflow-x-auto hide-scrollbar">
          {navTabs.map(tab => {
            const Icon = tab.icon;
            const isActive = tab.id === 'resolutions';
            return (
              <button
                key={tab.id}
                onClick={() => navigate(tab.href)}
                className={`flex-1 min-w-[120px] px-4 py-4 flex flex-col items-center gap-2 transition-all ${
                  isActive
                    ? 'bg-indigo-500/20 text-indigo-400 border-b-2 border-indigo-500'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#1a1724]/50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-semibold">{tab.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Setup Wizard (if needed) */}
      {showSetup && (
        <div className="p-4">
          <ResolutionsSetup
            onComplete={() => {
              useIntegratedOnboardingStore.getState().markModuleComplete('resolutions');
            }}
            onSkip={() => {
              useIntegratedOnboardingStore.getState().markModuleComplete('resolutions');
            }}
          />
        </div>
      )}

      {/* Page Content */}
      {!showSetup && (
      <div className="px-4 pt-6">
        {/* Header */}
        <PageHeader
          title={`${targetYear} Resolutions`}
          subtitle={isBeforeTargetYear
            ? `${daysRemaining} days until ${targetYear} begins`
            : `${daysRemaining} days left to achieve your goals`}
          icon={Flag}
          module="missions"
          variant="elevated"
          actions={
            <button
              onClick={() => setShowAddModal(true)}
              className="px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          }
        />

        {/* Year Progress Ring - Centered */}
        <div className="flex justify-center mb-8">
          <YearProgressRing size={260} />
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          <div className="bg-[#1a1724] border border-white/10 rounded-xl p-4 text-center">
            <div className="flex items-center justify-center gap-2 text-indigo-400 mb-1">
              <Target className="w-4 h-4" />
              <span className="text-2xl font-bold">{stats.activeResolutions}</span>
            </div>
            <div className="text-xs text-white/50">Active</div>
          </div>

          <div className="bg-[#1a1724] border border-white/10 rounded-xl p-4 text-center">
            <div className="flex items-center justify-center gap-2 text-orange-400 mb-1">
              <Flame className="w-4 h-4" />
              <span className="text-2xl font-bold">{stats.longestStreak}</span>
            </div>
            <div className="text-xs text-white/50">Best Streak</div>
          </div>

          <div className="bg-[#1a1724] border border-white/10 rounded-xl p-4 text-center">
            <div className="flex items-center justify-center gap-2 text-green-400 mb-1">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-2xl font-bold">{stats.totalCheckIns}</span>
            </div>
            <div className="text-xs text-white/50">Check-ins</div>
          </div>

          <div className="bg-[#1a1724] border border-white/10 rounded-xl p-4 text-center">
            <div className="flex items-center justify-center gap-2 text-yellow-400 mb-1">
              <Trophy className="w-4 h-4" />
              <span className="text-2xl font-bold">{stats.achievementsEarned}</span>
            </div>
            <div className="text-xs text-white/50">Achievements</div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
              categoryFilter === 'all'
                ? 'bg-indigo-500 text-white'
                : 'bg-white/5 text-white/60 hover:bg-white/10'
            }`}
          >
            All ({resolutions.length})
          </button>
          {Object.entries(RESOLUTION_CATEGORIES).map(([key, category]) => {
            const count = resolutions.filter(r => r.category === key).length;
            if (count === 0) return null;
            return (
              <button
                key={key}
                onClick={() => setCategoryFilter(key)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all flex items-center gap-2 ${
                  categoryFilter === key
                    ? 'text-white'
                    : 'bg-white/5 text-white/60 hover:bg-white/10'
                }`}
                style={categoryFilter === key ? { backgroundColor: `${category.color}40` } : {}}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                {category.name} ({count})
              </button>
            );
          })}
        </div>

        {/* Resolutions Grid */}
        {filteredResolutions.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
            <AnimatePresence>
              {filteredResolutions.map((resolution, idx) => (
                <motion.div
                  key={resolution.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <ResolutionCard
                    resolution={resolution}
                    onCheckIn={handleCheckIn}
                    onEdit={handleEdit}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <EmptyState onAddNew={() => setShowAddModal(true)} />
        )}

        {/* Achievements Section */}
        {resolutions.length > 0 && (
          <div className="mb-8">
            <AchievementBadges />
          </div>
        )}

        {/* Motivation Section */}
        {resolutions.length > 0 && (
          <div className="bg-[#1a1724] border border-white/10 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Keep Going!</h3>
                <p className="text-white/60 text-sm">
                  {isBeforeTargetYear
                    ? `${targetYear} hasn't started yet! Use this time to plan your resolutions carefully.`
                    : yearProgress < 25
                    ? "The year is just getting started! Build momentum with consistent daily check-ins."
                    : yearProgress < 50
                    ? "You're making progress! Keep up the consistency - you're nearly halfway there."
                    : yearProgress < 75
                    ? "Over halfway through the year! Your dedication is paying off. Stay focused."
                    : "The finish line is in sight! Give it everything you've got for the final push."}
                </p>
                <div className="mt-3 flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2 text-indigo-400">
                    <Clock className="w-4 h-4" />
                    <span>{isBeforeTargetYear ? `${daysRemaining} days until ${targetYear}` : `${daysRemaining} days remaining`}</span>
                  </div>
                  {!isBeforeTargetYear && (
                    <div className="flex items-center gap-2 text-green-400">
                      <TrendingUp className="w-4 h-4" />
                      <span>{yearProgress}% of year complete</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      )}

      {/* Add Resolution Modal */}
      <AnimatePresence>
        {showAddModal && (
          <AddResolutionModal onClose={() => setShowAddModal(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

// Empty State Component
function EmptyState({ onAddNew }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-16"
    >
      <div className="w-24 h-24 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
        <Target className="w-12 h-12 text-indigo-400" />
      </div>
      <h3 className="text-xl font-bold text-white mb-2">
        No Resolutions Yet
      </h3>
      <p className="text-white/50 mb-6 max-w-md mx-auto">
        Start 2026 strong by setting meaningful goals. We'll help you track progress
        and stay motivated throughout the year.
      </p>
      <button
        onClick={onAddNew}
        className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-xl inline-flex items-center gap-2 transition-colors"
      >
        <Plus className="w-5 h-5" />
        Create Your First Resolution
      </button>

      {/* Tips */}
      <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
        <div className="bg-white/5 rounded-xl p-4 text-left">
          <div className="text-2xl mb-2">1</div>
          <h4 className="font-semibold text-white mb-1">Be Specific</h4>
          <p className="text-sm text-white/50">
            "Run 3 times per week" is better than "exercise more"
          </p>
        </div>
        <div className="bg-white/5 rounded-xl p-4 text-left">
          <div className="text-2xl mb-2">2</div>
          <h4 className="font-semibold text-white mb-1">Know Your Why</h4>
          <p className="text-sm text-white/50">
            Connect goals to deeper values for lasting motivation
          </p>
        </div>
        <div className="bg-white/5 rounded-xl p-4 text-left">
          <div className="text-2xl mb-2">3</div>
          <h4 className="font-semibold text-white mb-1">Start Small</h4>
          <p className="text-sm text-white/50">
            Begin with achievable steps and build momentum
          </p>
        </div>
      </div>
    </motion.div>
  );
}
