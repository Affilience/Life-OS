import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Trash2, Trophy, Flame, TrendingUp, Target } from 'lucide-react';
import {
  CalendarGridView,
  ChainLinksView,
  CircleProgressView,
  MiniHeatmapView,
  StatsOverviewView,
} from '../../../components/streaks/StreakVisualizations';
import { CosmicFlame } from './CosmicFlame';

interface Streak {
  id: string;
  name: string;
  icon: string;
  currentStreak: number;
  longestStreak: number;
  color: string;
  weekData: boolean[];
  description?: string;
  isCustom?: boolean;
  goal?: number;
  frequency?: string;
}

interface Completion {
  id?: string;
  streak_id: string;
  completed_date: string;
}

interface StreakDetailModalProps {
  streak: Streak;
  completions: Completion[];
  isOpen: boolean;
  onClose: () => void;
  onCheckIn?: (streakId: string) => void;
  onDelete?: (streakId: string) => void;
  isCompletedToday?: boolean;
}

const VIEWS = [
  { id: 'calendar', label: 'Calendar' },
  { id: 'chain', label: 'Chain' },
  { id: 'heatmap', label: 'Heatmap' },
  { id: 'stats', label: 'Stats' },
] as const;

type ViewType = typeof VIEWS[number]['id'];

const colorMap: Record<string, { gradient: string; bg: string; text: string }> = {
  purple: { gradient: 'from-purple-500 to-pink-500', bg: 'bg-purple-500/20', text: 'text-purple-400' },
  blue: { gradient: 'from-blue-500 to-cyan-500', bg: 'bg-blue-500/20', text: 'text-blue-400' },
  green: { gradient: 'from-green-500 to-emerald-500', bg: 'bg-green-500/20', text: 'text-green-400' },
  orange: { gradient: 'from-orange-500 to-amber-500', bg: 'bg-orange-500/20', text: 'text-orange-400' },
};

export function StreakDetailModal({
  streak,
  completions,
  isOpen,
  onClose,
  onCheckIn,
  onDelete,
  isCompletedToday = false,
}: StreakDetailModalProps) {
  const [currentView, setCurrentView] = useState<ViewType>('calendar');
  const colors = colorMap[streak.color] || colorMap.purple;

  // Calculate stats
  const stats = useMemo(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

    const last30 = completions.filter(c => c.completed_date >= thirtyDaysAgoStr).length;
    const rate = Math.round((last30 / 30) * 100);

    return {
      total: completions.length,
      last30,
      rate,
    };
  }, [completions]);

  const handleCheckIn = () => {
    if (onCheckIn && streak.isCustom) {
      onCheckIn(streak.id);
    }
  };

  const handleDelete = () => {
    if (onDelete && streak.isCustom) {
      if (window.confirm('Delete this streak? This cannot be undone.')) {
        onDelete(streak.id);
        onClose();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
        onClick={onClose}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

        {/* Modal */}
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full sm:max-w-lg max-h-[90vh] overflow-hidden bg-[#0c0a10] sm:rounded-2xl rounded-t-2xl border border-white/10 shadow-2xl"
        >
          {/* Header */}
          <div className={`relative p-6 bg-gradient-to-br ${colors.bg} border-b border-white/10`}>
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-white/60" />
            </button>

            {/* Streak info */}
            <div className="flex items-start gap-4">
              <div className="text-4xl">{streak.icon}</div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold text-white truncate">{streak.name}</h2>
                {streak.description && (
                  <p className="text-sm text-white/50 mt-1 line-clamp-2">{streak.description}</p>
                )}
              </div>
            </div>

            {/* Stats row */}
            <div className="flex items-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <CosmicFlame streak={streak.currentStreak} size="sm" />
                <div>
                  <div className="text-2xl font-bold text-white">{streak.currentStreak}</div>
                  <div className="text-xs text-white/50">Current</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                <div>
                  <div className="text-2xl font-bold text-white">{streak.longestStreak}</div>
                  <div className="text-xs text-white/50">Best</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-green-400" />
                <div>
                  <div className="text-2xl font-bold text-white">{stats.rate}%</div>
                  <div className="text-xs text-white/50">30 days</div>
                </div>
              </div>
            </div>

            {/* Check-in button for custom streaks */}
            {streak.isCustom && onCheckIn && (
              <button
                onClick={handleCheckIn}
                className={`
                  mt-4 w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all
                  ${isCompletedToday
                    ? 'bg-green-500 text-white'
                    : `bg-gradient-to-r ${colors.gradient} text-white hover:opacity-90`
                  }
                `}
              >
                {isCompletedToday ? (
                  <>
                    <Check className="w-5 h-5" />
                    Completed Today
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    Check In
                  </>
                )}
              </button>
            )}
          </div>

          {/* View tabs */}
          <div className="flex border-b border-white/10">
            {VIEWS.map((view) => (
              <button
                key={view.id}
                onClick={() => setCurrentView(view.id)}
                className={`
                  flex-1 py-3 text-sm font-medium transition-colors relative
                  ${currentView === view.id ? 'text-white' : 'text-white/50 hover:text-white/70'}
                `}
              >
                {view.label}
                {currentView === view.id && (
                  <motion.div
                    layoutId="activeTab"
                    className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${colors.gradient}`}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="p-4 overflow-y-auto max-h-[40vh]">
            {currentView === 'calendar' && (
              <CalendarGridView completions={completions} streak={streak} />
            )}
            {currentView === 'chain' && (
              <ChainLinksView completions={completions} streak={streak} daysToShow={21} />
            )}
            {currentView === 'heatmap' && (
              <MiniHeatmapView completions={completions} weeks={16} />
            )}
            {currentView === 'stats' && (
              <StatsOverviewView streak={streak} completions={completions} />
            )}
          </div>

          {/* Delete button for custom streaks */}
          {streak.isCustom && onDelete && (
            <div className="p-4 border-t border-white/10">
              <button
                onClick={handleDelete}
                className="w-full py-2.5 text-red-400 hover:bg-red-500/10 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete Streak
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default StreakDetailModal;
