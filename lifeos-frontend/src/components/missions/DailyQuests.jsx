import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  CheckCircle2,
  Circle,
  Zap,
  Trophy,
  Dumbbell,
  Book,
  Coffee,
  Brain,
  Heart,
  Target,
  Clock,
  Sparkles,
  Flame,
  Plus,
  TrendingUp,
  Award,
  CheckSquare,
  Calendar,
  Star
} from 'lucide-react';
import useDailyTasksStore, { TASK_CATEGORIES, PRIORITY_LEVELS } from '../../stores/dailyTasksStore';
import { EmptyState } from '../ui';
import { useGamificationModeStore, TERMINOLOGY, VISIBILITY } from '../../stores/gamificationModeStore';
import { feedback, celebrations } from '../../services/microInteractions';
import { useParticleBurst, useRisingParticles, PARTICLE_PALETTES } from '../../hooks/useParticleBurst';

// Map category to icon
const CATEGORY_ICONS = {
  productivity: Brain,
  health: Dumbbell,
  learning: Book,
  personal: Heart,
  admin: Coffee,
  creative: Sparkles,
};

// Map priority to difficulty label with design token colors
const PRIORITY_TO_DIFFICULTY = {
  low: { label: 'trivial', color: 'var(--quest-trivial)', className: 'text-gray-400 border-gray-500/30 bg-gray-500/10' },
  medium: { label: 'easy', color: 'var(--quest-easy)', className: 'text-[var(--quest-easy)] border-[var(--quest-easy)]/30 bg-[var(--quest-easy)]/10' },
  high: { label: 'medium', color: 'var(--quest-medium)', className: 'text-[var(--quest-medium)] border-[var(--quest-medium)]/30 bg-[var(--quest-medium)]/10' },
  critical: { label: 'hard', color: 'var(--quest-hard)', className: 'text-[var(--quest-hard)] border-[var(--quest-hard)]/30 bg-[var(--quest-hard)]/10' },
};

// Floating reward component
const FloatingReward = ({ x, y, value, type, onComplete }) => {
  const colors = type === 'xp' ? 'text-green-400' : 'text-yellow-400';
  const Icon = type === 'xp' ? Trophy : Zap;

  return (
    <motion.div
      className={`fixed pointer-events-none z-50 flex items-center gap-1 font-bold ${colors}`}
      style={{ left: x, top: y }}
      initial={{ opacity: 0, y: 0, scale: 0.5 }}
      animate={{
        opacity: [0, 1, 1, 0],
        y: [0, -40, -60, -80],
        scale: [0.5, 1.2, 1, 0.8],
      }}
      transition={{
        duration: 1.2,
        times: [0, 0.2, 0.7, 1],
        ease: 'easeOut',
      }}
      onAnimationComplete={onComplete}
    >
      <Icon className="w-5 h-5" />
      <span>+{value}</span>
    </motion.div>
  );
};

export default function DailyQuests() {
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();
  const { getTodayTasks, getTodayStats, toggleTask, getStreak } = useDailyTasksStore();

  // Get gamification mode
  const mode = useGamificationModeStore((state) => state.mode);
  const terms = TERMINOLOGY[mode] || TERMINOLOGY.cosmic;
  const visibility = VISIBILITY[mode] || VISIBILITY.cosmic;

  const todaysTasks = getTodayTasks();
  const todayStats = getTodayStats();
  const streak = getStreak();

  // Refs and state for animations
  const containerRef = useRef(null);
  const progressBarRef = useRef(null);
  const [recentlyCompleted, setRecentlyCompleted] = useState(new Set());
  const [floatingRewards, setFloatingRewards] = useState([]);
  const [progressPulse, setProgressPulse] = useState(false);
  const [showPerfectDay, setShowPerfectDay] = useState(false);
  const prevCompletedRef = useRef(todayStats.completed);

  // Particle effects
  const burst = useParticleBurst(containerRef);
  const rise = useRisingParticles(containerRef);

  // Transform daily tasks to quest format
  const quests = useMemo(() => {
    return todaysTasks.map(task => {
      const category = TASK_CATEGORIES[task.category] || TASK_CATEGORIES.productivity;
      const priority = PRIORITY_LEVELS[task.priority] || PRIORITY_LEVELS.medium;
      const Icon = CATEGORY_ICONS[task.category] || Brain;

      const difficulty = PRIORITY_TO_DIFFICULTY[task.priority] || PRIORITY_TO_DIFFICULTY.medium;
      return {
        id: task.id,
        title: task.title,
        description: task.description || `${task.estimatedMinutes} min • ${category.label}`,
        category: category.label,
        icon: Icon,
        xpReward: priority.xp,
        creditsReward: Math.floor(priority.xp / 2),
        completed: task.completed,
        difficulty: difficulty,
        color: category.color,
      };
    });
  }, [todaysTasks]);

  // Detect Perfect Day completion
  useEffect(() => {
    const currentCompleted = todayStats.completed;
    const total = todayStats.total;

    // Check if we just completed all quests
    if (
      total > 0 &&
      currentCompleted === total &&
      prevCompletedRef.current < total &&
      !prefersReducedMotion
    ) {
      // Delay to let the last quest animation play
      setTimeout(() => {
        setShowPerfectDay(true);
        // Big celebration for Perfect Day
        if (mode !== 'minimal') {
          celebrations.fireworks({ duration: 3000 });
          feedback.bigCelebration();
        }
      }, 600);
    }

    prevCompletedRef.current = currentCompleted;
  }, [todayStats.completed, todayStats.total, prefersReducedMotion, mode]);

  // Clear recently completed after animation
  useEffect(() => {
    if (recentlyCompleted.size > 0) {
      const timer = setTimeout(() => {
        setRecentlyCompleted(new Set());
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [recentlyCompleted]);

  const handleToggleQuest = useCallback((questId, event) => {
    const quest = quests.find(q => q.id === questId);
    const wasCompleted = quest?.completed;

    // Trigger micro-interactions
    if (!wasCompleted) {
      const rect = event?.currentTarget?.getBoundingClientRect();
      const containerRect = containerRef.current?.getBoundingClientRect() || { left: 0, top: 0 };

      // Sound + haptic
      feedback.questComplete({
        position: rect ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 } : null,
      });

      // Mark as recently completed for animation
      setRecentlyCompleted(prev => new Set([...prev, questId]));

      // Pulse progress bar
      setProgressPulse(true);
      setTimeout(() => setProgressPulse(false), 500);

      if (rect && !prefersReducedMotion) {
        const centerX = rect.left + rect.width / 2 - containerRect.left;
        const centerY = rect.top + rect.height / 2 - containerRect.top;

        // Particle burst from card center
        burst(centerX, centerY, {
          count: 15,
          colors: PARTICLE_PALETTES.success,
          spread: 100,
          duration: 600,
        });

        // Rising XP particles
        rise(centerX, centerY - 20, {
          count: 6,
          colors: PARTICLE_PALETTES.xp,
          riseHeight: 80,
        });

        // Add floating XP reward
        setFloatingRewards(prev => [
          ...prev,
          {
            id: `${questId}-xp-${Date.now()}`,
            x: rect.left + rect.width / 2 - 20,
            y: rect.top,
            value: quest.xpReward,
            type: 'xp',
          },
        ]);

        // Add floating credits reward (staggered)
        setTimeout(() => {
          setFloatingRewards(prev => [
            ...prev,
            {
              id: `${questId}-credits-${Date.now()}`,
              x: rect.left + rect.width / 2 + 10,
              y: rect.top + 20,
              value: quest.creditsReward,
              type: 'credits',
            },
          ]);
        }, 150);
      }
    } else {
      feedback.taskUncomplete();
    }

    toggleTask(questId);
  }, [quests, burst, rise, prefersReducedMotion]);

  // Remove floating reward after animation
  const handleRewardComplete = useCallback((id) => {
    setFloatingRewards(prev => prev.filter(r => r.id !== id));
  }, []);

  const completedCount = todayStats.completed;
  const totalQuests = todayStats.total;
  const totalXP = todayStats.totalXP;
  const totalCredits = Math.floor(totalXP / 2);

  // Dynamic bonus objectives
  const bonusObjectives = useMemo(() => [
    {
      id: 'complete_all',
      title: 'Complete all daily quests',
      description: `${completedCount}/${totalQuests} quests completed`,
      xpReward: 100,
      creditsReward: 50,
      icon: Sparkles,
      color: 'from-yellow-500 to-orange-500',
      progress: completedCount,
      total: totalQuests || 1
    },
    {
      id: 'perfect_week',
      title: 'Perfect week',
      description: 'Complete all dailies for 7 days',
      xpReward: 500,
      creditsReward: 250,
      icon: Flame,
      color: 'from-orange-500 to-red-500',
      progress: streak,
      total: 7
    }
  ], [completedCount, totalQuests, streak]);

  // Calculate time until midnight reset
  const [timeUntilReset, setTimeUntilReset] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      const diff = midnight - now;

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      setTimeUntilReset(`${hours} hours ${minutes} minutes`);
    };

    updateTime();
    const interval = setInterval(updateTime, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  // Mode-specific styling
  const getProgressCardStyle = () => {
    if (mode === 'cosmic') {
      return 'bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20';
    } else if (mode === 'professional') {
      return 'bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20';
    } else {
      return 'bg-bg-1 border-border';
    }
  };

  const getProgressBarStyle = () => {
    if (mode === 'cosmic') {
      return 'from-purple-500 to-pink-500';
    } else if (mode === 'professional') {
      return 'from-blue-500 to-cyan-500';
    } else {
      return 'from-emerald-500 to-teal-500';
    }
  };

  // Render progress overview based on mode
  const renderProgressOverview = () => {
    if (mode === 'cosmic') {
      return (
        <div className={`${getProgressCardStyle()} border rounded-2xl p-6`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-text-primary mb-1">Daily Progress</h2>
              <p className="text-text-muted">{completedCount}/{totalQuests} quests completed</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="flex items-center gap-2 text-green-400">
                  <Trophy className="w-5 h-5" />
                  <span className="text-2xl font-bold">+{totalXP}</span>
                </div>
                <p className="text-xs text-text-muted">{terms.xp} earned</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 text-yellow-400">
                  <Zap className="w-5 h-5" />
                  <span className="text-2xl font-bold">+{totalCredits}</span>
                </div>
                <p className="text-xs text-text-muted">{terms.credits} earned</p>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div ref={progressBarRef} className="relative h-3 bg-bg-0 rounded-full overflow-hidden">
            <motion.div
              className={`absolute inset-y-0 left-0 bg-gradient-to-r ${getProgressBarStyle()}`}
              initial={false}
              animate={{
                width: `${totalQuests > 0 ? (completedCount / totalQuests) * 100 : 0}%`,
                boxShadow: progressPulse ? '0 0 20px rgba(168, 85, 247, 0.6)' : 'none',
              }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            />
            {/* Pulse effect on progress */}
            <AnimatePresence>
              {progressPulse && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-white/30 to-transparent"
                  initial={{ x: '-100%' }}
                  animate={{ x: '200%' }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                />
              )}
            </AnimatePresence>
            {completedCount === totalQuests && totalQuests > 0 && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 to-orange-500/20"
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
          </div>

          {/* Time Remaining */}
          <div className="flex items-center gap-2 mt-4 text-text-muted text-sm">
            <Clock className="w-4 h-4" />
            <span>Resets in {timeUntilReset}</span>
          </div>
        </div>
      );
    } else if (mode === 'professional') {
      return (
        <div className={`${getProgressCardStyle()} border rounded-2xl p-6`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-text-primary mb-1">Daily Goals</h2>
              <p className="text-text-muted">{completedCount}/{totalQuests} goals completed</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="flex items-center gap-2 text-blue-400">
                  <TrendingUp className="w-5 h-5" />
                  <span className="text-xl font-bold">+{totalXP}</span>
                </div>
                <p className="text-xs text-text-muted">{terms.xp} earned</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 text-green-400">
                  <Award className="w-5 h-5" />
                  <span className="text-xl font-bold">+{totalCredits}</span>
                </div>
                <p className="text-xs text-text-muted">{terms.credits} earned</p>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative h-2 bg-bg-0 rounded-full overflow-hidden">
            <div
              className={`absolute inset-y-0 left-0 bg-gradient-to-r ${getProgressBarStyle()} transition-all duration-500`}
              style={{ width: `${totalQuests > 0 ? (completedCount / totalQuests) * 100 : 0}%` }}
            />
          </div>

          {/* Time Remaining */}
          <div className="flex items-center gap-2 mt-3 text-text-muted text-sm">
            <Calendar className="w-4 h-4" />
            <span>Resets in {timeUntilReset}</span>
          </div>
        </div>
      );
    } else {
      // Minimal mode
      return (
        <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-lg font-semibold text-text-primary">Daily Tasks</h2>
              <p className="text-sm text-text-muted">{completedCount}/{totalQuests} completed</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-emerald-400">
                <CheckSquare className="w-4 h-4" />
                <span className="text-lg font-bold">+{totalXP}</span>
              </div>
              <p className="text-xs text-text-muted">points</p>
            </div>
          </div>

          {/* Simple Progress Bar */}
          <div className="h-2 bg-bg-0 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${getProgressBarStyle()} transition-all duration-500`}
              style={{ width: `${totalQuests > 0 ? (completedCount / totalQuests) * 100 : 0}%` }}
            />
          </div>

          {/* Time Remaining */}
          <div className="flex items-center gap-2 mt-3 text-text-muted text-sm">
            <Clock className="w-4 h-4" />
            <span>Resets in {timeUntilReset}</span>
          </div>
        </div>
      );
    }
  };

  // Animation variants for quest cards
  const cardVariants = {
    initial: { scale: 1 },
    completed: {
      scale: [1, 1.03, 0.98, 1],
      transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
    },
    tap: { scale: 0.98 },
  };

  return (
    <div ref={containerRef} className="space-y-6 relative">
      {/* Floating Rewards Portal */}
      <AnimatePresence>
        {floatingRewards.map((reward) => (
          <FloatingReward
            key={reward.id}
            x={reward.x}
            y={reward.y}
            value={reward.value}
            type={reward.type}
            onComplete={() => handleRewardComplete(reward.id)}
          />
        ))}
      </AnimatePresence>

      {/* Perfect Day Overlay */}
      <AnimatePresence>
        {showPerfectDay && mode !== 'minimal' && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowPerfectDay(false)}
          >
            <motion.div
              className="text-center"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5, repeat: 2 }}
              >
                <Star className="w-24 h-24 text-yellow-400 mx-auto mb-4 drop-shadow-2xl" fill="currentColor" />
              </motion.div>
              <motion.h2
                className="text-5xl font-bold text-white mb-2"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                style={{ textShadow: '0 0 40px rgba(250, 204, 21, 0.5)' }}
              >
                PERFECT DAY!
              </motion.h2>
              <motion.p
                className="text-xl text-yellow-200"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                All quests completed!
              </motion.p>
              <motion.div
                className="mt-6 flex items-center justify-center gap-6"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <div className="flex items-center gap-2 text-green-400">
                  <Trophy className="w-6 h-6" />
                  <span className="text-2xl font-bold">+{totalXP}</span>
                </div>
                <div className="flex items-center gap-2 text-yellow-400">
                  <Zap className="w-6 h-6" />
                  <span className="text-2xl font-bold">+{totalCredits}</span>
                </div>
              </motion.div>
              <motion.p
                className="mt-4 text-sm text-text-muted"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                Tap anywhere to close
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress Overview - Mode-specific */}
      {renderProgressOverview()}

      {/* Daily Quests Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-text-primary flex items-center gap-2">
            <Target className="w-5 h-5 text-cyan-400" />
            {mode === 'cosmic' ? "Today's Quests" : mode === 'professional' ? "Today's Goals" : "Today's Tasks"}
          </h3>
          <button
            onClick={() => navigate('/productivity')}
            className="text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Plan Tasks
          </button>
        </div>

        {quests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quests.map((quest, index) => {
              const Icon = quest.icon;
              const isRecentlyCompleted = recentlyCompleted.has(quest.id);

              return (
                <motion.button
                  key={quest.id}
                  onClick={(e) => handleToggleQuest(quest.id, e)}
                  className={`
                    relative bg-bg-1 border rounded-xl p-5 text-left
                    transition-colors duration-200
                    ${quest.completed
                      ? 'border-green-500/50 bg-green-500/5'
                      : 'border-border hover:border-primary-500/50'
                    }
                  `}
                  variants={prefersReducedMotion ? undefined : cardVariants}
                  initial="initial"
                  animate={isRecentlyCompleted ? 'completed' : 'initial'}
                  whileHover={prefersReducedMotion ? undefined : { scale: 1.02 }}
                  whileTap={prefersReducedMotion ? undefined : 'tap'}
                  layout
                  style={{
                    boxShadow: isRecentlyCompleted
                      ? '0 0 20px rgba(34, 197, 94, 0.4), 0 0 40px rgba(34, 197, 94, 0.2)'
                      : undefined,
                  }}
                >
                  {/* Completion Indicator */}
                  <div className="absolute top-4 right-4">
                    <AnimatePresence mode="wait">
                      {quest.completed ? (
                        <motion.div
                          key="checked"
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          exit={{ scale: 0, rotate: 180 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                        >
                          <CheckCircle2 className="w-6 h-6 text-green-400" />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="unchecked"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                        >
                          <Circle className="w-6 h-6 text-text-muted" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Green flash overlay on completion */}
                  <AnimatePresence>
                    {isRecentlyCompleted && (
                      <motion.div
                        className="absolute inset-0 rounded-xl bg-green-500/20 pointer-events-none"
                        initial={{ opacity: 0.8 }}
                        animate={{ opacity: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                      />
                    )}
                  </AnimatePresence>

                  {/* Icon */}
                  <div className={`
                    inline-flex p-3 rounded-xl mb-4
                    bg-gradient-to-br ${quest.color} bg-opacity-10
                  `}>
                    <Icon className="w-6 h-6 text-text-primary" />
                  </div>

                  {/* Content */}
                  <div className="pr-8">
                    <motion.h4
                      className={`
                        text-lg font-semibold mb-1
                        ${quest.completed ? 'text-text-muted' : 'text-text-primary'}
                      `}
                      animate={{
                        textDecoration: quest.completed ? 'line-through' : 'none',
                        opacity: quest.completed ? 0.7 : 1,
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      {quest.title}
                    </motion.h4>
                    <p className="text-sm text-text-muted mb-4">
                      {quest.description}
                    </p>

                    {/* Rewards */}
                    <div className="flex items-center gap-3 text-sm">
                      <motion.div
                        className="flex items-center gap-1 text-green-400"
                        animate={isRecentlyCompleted ? { scale: [1, 1.3, 1] } : {}}
                        transition={{ duration: 0.3 }}
                      >
                        <Trophy className="w-4 h-4" />
                        <span>+{quest.xpReward}</span>
                      </motion.div>
                      <motion.div
                        className="flex items-center gap-1 text-yellow-400"
                        animate={isRecentlyCompleted ? { scale: [1, 1.3, 1] } : {}}
                        transition={{ duration: 0.3, delay: 0.1 }}
                      >
                        <Zap className="w-4 h-4" />
                        <span>+{quest.creditsReward}</span>
                      </motion.div>
                    </div>
                  </div>

                  {/* Difficulty Badge */}
                  <div className="absolute bottom-4 right-4">
                    <span className={`text-xs px-2 py-1 rounded border ${quest.difficulty.className}`}>
                      {quest.difficulty.label}
                    </span>
                  </div>
                </motion.button>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="bg-bg-1 border border-border rounded-xl">
            <EmptyState
              type="quests"
              title={mode === 'cosmic' ? "No quests planned for today" : "No tasks planned for today"}
              description={mode === 'cosmic'
                ? `Plan your daily tasks in the Productivity module to transform them into epic quests with ${terms.xp} rewards.`
                : `Plan your daily tasks in the Productivity module to earn ${terms.xp} rewards.`}
              actionLabel={mode === 'cosmic' ? "Plan Today's Quests" : "Plan Today's Tasks"}
              onAction={() => navigate('/productivity')}
              variant="violet"
              size="md"
            />
          </div>
        )}
      </div>

      {/* Bonus Objectives */}
      <div className="space-y-4" data-tour="rewards-preview">
        <h3 className="text-xl font-semibold text-text-primary flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-yellow-400" />
          Bonus Objectives
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bonusObjectives.map((bonus) => {
            const Icon = bonus.icon;
            const progress = (bonus.progress / bonus.total) * 100;
            const isComplete = bonus.progress >= bonus.total;

            return (
              <div
                key={bonus.id}
                className={`bg-bg-1 border rounded-xl p-5 ${
                  isComplete ? 'border-yellow-500/50 bg-yellow-500/5' : 'border-border'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`
                    inline-flex p-3 rounded-xl
                    bg-gradient-to-br ${bonus.color} bg-opacity-10
                  `}>
                    <Icon className="w-6 h-6 text-text-primary" />
                  </div>

                  <div className="text-right">
                    <div className="flex items-center gap-2 text-green-400 text-sm">
                      <Trophy className="w-4 h-4" />
                      <span className="font-bold">+{bonus.xpReward}</span>
                    </div>
                    <div className="flex items-center gap-2 text-yellow-400 text-sm">
                      <Zap className="w-4 h-4" />
                      <span className="font-bold">+{bonus.creditsReward}</span>
                    </div>
                  </div>
                </div>

                <h4 className="text-lg font-semibold text-text-primary mb-1">
                  {bonus.title}
                  {isComplete && <span className="ml-2 text-yellow-400">Complete!</span>}
                </h4>
                <p className="text-sm text-text-muted mb-4">
                  {bonus.description}
                </p>

                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-muted">Progress</span>
                    <span className="text-primary-400 font-medium">
                      {bonus.progress}/{bonus.total}
                    </span>
                  </div>
                  <div className="h-2 bg-bg-0 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${bonus.color} transition-all duration-300`}
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
