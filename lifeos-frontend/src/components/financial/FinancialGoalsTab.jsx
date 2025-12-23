import React, { useState, useMemo, useEffect } from 'react';
import {
  Target,
  Plus,
  Calendar,
  TrendingUp,
  Clock,
  DollarSign,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Edit2,
  Trash2,
  X,
  Zap,
  Trophy,
  PiggyBank,
  CalendarDays,
  Flame,
  Star,
  PartyPopper,
  History,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Award,
} from 'lucide-react';
import { useFinancialStore } from '../../stores/financialStore';
import { useGamificationStore } from '../../stores/gamificationStore';
import useAchievementsStore from '../../stores/achievementsStore';

/**
 * FinancialGoalsTab - World-class savings goals with gamification
 *
 * Features:
 * - Create goals with target amount and deadline
 * - Automatic daily/weekly/monthly payment calculation
 * - Visual progress tracking with milestone celebrations
 * - Contribution history timeline
 * - Streak tracking for consistent savings
 * - XP rewards and achievement integration
 * - Priority scoring and smart recommendations
 */

// Goal icons for selection
const GOAL_ICONS = [
  { icon: '🏠', label: 'Home' },
  { icon: '🚗', label: 'Car' },
  { icon: '✈️', label: 'Travel' },
  { icon: '💻', label: 'Tech' },
  { icon: '📚', label: 'Education' },
  { icon: '🎸', label: 'Hobby' },
  { icon: '💍', label: 'Wedding' },
  { icon: '🛡️', label: 'Emergency' },
  { icon: '💰', label: 'Savings' },
  { icon: '🎯', label: 'Goal' },
  { icon: '🏝️', label: 'Vacation' },
  { icon: '🎓', label: 'Degree' },
];

// Goal colors
const GOAL_COLORS = [
  { color: 'purple', gradient: 'from-purple-500 to-violet-500', bg: 'bg-purple-500/20', border: 'border-purple-500/30', text: 'text-purple-400' },
  { color: 'pink', gradient: 'from-pink-500 to-rose-500', bg: 'bg-pink-500/20', border: 'border-pink-500/30', text: 'text-pink-400' },
  { color: 'cyan', gradient: 'from-cyan-500 to-teal-500', bg: 'bg-cyan-500/20', border: 'border-cyan-500/30', text: 'text-cyan-400' },
  { color: 'emerald', gradient: 'from-emerald-500 to-green-500', bg: 'bg-emerald-500/20', border: 'border-emerald-500/30', text: 'text-emerald-400' },
  { color: 'amber', gradient: 'from-amber-500 to-orange-500', bg: 'bg-amber-500/20', border: 'border-amber-500/30', text: 'text-amber-400' },
  { color: 'blue', gradient: 'from-blue-500 to-indigo-500', bg: 'bg-blue-500/20', border: 'border-blue-500/30', text: 'text-blue-400' },
];

// Milestone configurations
const MILESTONES = [
  { percent: 25, icon: '🌱', label: 'Getting Started', xp: 25, message: 'Quarter of the way there!' },
  { percent: 50, icon: '🔥', label: 'Halfway Hero', xp: 50, message: 'You\'re halfway to your goal!' },
  { percent: 75, icon: '🚀', label: 'Almost There', xp: 75, message: 'The finish line is in sight!' },
  { percent: 100, icon: '🏆', label: 'Goal Achieved!', xp: 150, message: 'Congratulations! You did it!' },
];

// Milestone Celebration Modal
function MilestoneCelebration({ milestone, goalName, onClose }) {
  const config = MILESTONES.find(m => m.percent === milestone);
  if (!config) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-purple-900/90 to-pink-900/90 border border-purple-500/50 rounded-2xl max-w-md w-full shadow-2xl animate-bounce-in overflow-hidden">
        {/* Confetti effect background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-10%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            >
              {['🎉', '⭐', '✨', '🎊', '💫'][Math.floor(Math.random() * 5)]}
            </div>
          ))}
        </div>

        <div className="relative p-8 text-center">
          <div className="text-7xl mb-4 animate-pulse">{config.icon}</div>
          <h2 className="text-3xl font-bold text-white mb-2">{config.label}</h2>
          <p className="text-purple-200 mb-4">{config.message}</p>
          <p className="text-lg text-slate-300 mb-6">
            <span className="font-semibold text-white">{goalName}</span> is now at{' '}
            <span className="font-bold text-emerald-400">{milestone}%</span>
          </p>

          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="bg-purple-500/30 rounded-lg px-4 py-2">
              <div className="flex items-center gap-2 text-purple-300">
                <Sparkles className="w-4 h-4" />
                <span className="font-bold text-white">+{config.xp} XP</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl text-white font-bold text-lg transition-all transform hover:scale-105"
          >
            Continue Saving!
          </button>
        </div>
      </div>

      <style>{`
        @keyframes bounce-in {
          0% { transform: scale(0.3); opacity: 0; }
          50% { transform: scale(1.05); }
          70% { transform: scale(0.9); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes confetti {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(500px) rotate(720deg); opacity: 0; }
        }
        .animate-bounce-in { animation: bounce-in 0.5s ease-out; }
        .animate-confetti { animation: confetti 3s ease-in-out infinite; }
      `}</style>
    </div>
  );
}

// Contribution History Component
function ContributionHistory({ contributions, colorConfig }) {
  const [showAll, setShowAll] = useState(false);
  const sortedContributions = [...(contributions || [])].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );
  const displayedContributions = showAll ? sortedContributions : sortedContributions.slice(0, 5);

  if (!contributions || contributions.length === 0) {
    return (
      <div className="text-center py-4 text-slate-500 text-sm">
        No contributions yet. Start saving!
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {displayedContributions.map((contrib, idx) => (
        <div
          key={contrib.id || idx}
          className={`flex items-center justify-between p-2 rounded-lg ${
            contrib.isWithdrawal ? 'bg-red-500/10' : 'bg-slate-800/50'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              contrib.isWithdrawal ? 'bg-red-500/20' : colorConfig.bg
            }`}>
              {contrib.isWithdrawal ? (
                <TrendingUp className="w-4 h-4 text-red-400 rotate-180" />
              ) : (
                <Plus className="w-4 h-4" style={{ color: colorConfig.text.replace('text-', '') }} />
              )}
            </div>
            <div>
              <div className={`font-medium ${contrib.isWithdrawal ? 'text-red-400' : 'text-white'}`}>
                {contrib.isWithdrawal ? '-' : '+'}£{Math.abs(contrib.amount).toLocaleString()}
              </div>
              {contrib.note && (
                <div className="text-xs text-slate-500">{contrib.note}</div>
              )}
            </div>
          </div>
          <div className="text-xs text-slate-500">
            {new Date(contrib.date).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
            })}
          </div>
        </div>
      ))}

      {sortedContributions.length > 5 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="w-full py-2 text-sm text-slate-400 hover:text-white transition-colors flex items-center justify-center gap-1"
        >
          {showAll ? (
            <>Show Less <ChevronUp className="w-4 h-4" /></>
          ) : (
            <>Show All ({sortedContributions.length}) <ChevronDown className="w-4 h-4" /></>
          )}
        </button>
      )}
    </div>
  );
}

export default function FinancialGoalsTab() {
  const {
    savingsGoals,
    addSavingsGoal,
    updateSavingsGoal,
    deleteSavingsGoal,
    contributeSavingsGoal,
    celebrateMilestone,
  } = useFinancialStore();

  const { addModuleXP } = useGamificationStore();
  const { incrementStat } = useAchievementsStore();

  const [showAddGoal, setShowAddGoal] = useState(false);
  const [showContribute, setShowContribute] = useState(null);
  const [contributeAmount, setContributeAmount] = useState('');
  const [contributeNote, setContributeNote] = useState('');
  const [expandedGoal, setExpandedGoal] = useState(null);
  const [celebrationData, setCelebrationData] = useState(null);

  // New goal form state
  const [newGoal, setNewGoal] = useState({
    name: '',
    target: '',
    deadline: '',
    icon: '🎯',
    color: 'purple',
    priority: 'medium', // low, medium, high
  });

  // Calculate goal statistics
  const goalStats = useMemo(() => {
    const totalTarget = savingsGoals.reduce((sum, g) => sum + g.target, 0);
    const totalSaved = savingsGoals.reduce((sum, g) => sum + g.current, 0);
    const completedGoals = savingsGoals.filter(g => g.current >= g.target).length;
    const activeGoals = savingsGoals.length - completedGoals;
    const totalContributions = savingsGoals.reduce(
      (sum, g) => sum + (g.contributions?.filter(c => !c.isWithdrawal).length || 0),
      0
    );
    const maxStreak = Math.max(...savingsGoals.map(g => g.contributionStreak || 0), 0);

    return { totalTarget, totalSaved, completedGoals, activeGoals, totalContributions, maxStreak };
  }, [savingsGoals]);

  // Calculate payment amounts and status for each goal
  const goalsWithPayments = useMemo(() => {
    return savingsGoals.map(goal => {
      const remaining = Math.max(0, goal.target - goal.current);
      const percentComplete = Math.min(100, (goal.current / goal.target) * 100);
      const isComplete = goal.current >= goal.target;

      // Calculate days until deadline
      const deadline = new Date(goal.deadline);
      const today = new Date();
      const daysUntil = Math.max(0, Math.ceil((deadline - today) / (1000 * 60 * 60 * 24)));
      const weeksUntil = Math.max(1, Math.ceil(daysUntil / 7));
      const monthsUntil = Math.max(1, Math.ceil(daysUntil / 30));

      // Calculate required payments based on daily rate
      // This gives more meaningful breakdowns regardless of time remaining
      const dailyPayment = daysUntil > 0 ? remaining / daysUntil : remaining;
      // Weekly/monthly show how much you'd save at the daily rate over those periods
      const weeklyPayment = dailyPayment * 7;
      const monthlyPayment = dailyPayment * 30;

      // Determine if on track
      const totalDays = Math.ceil((deadline - new Date(goal.createdAt || Date.now())) / (1000 * 60 * 60 * 24));
      const daysPassed = totalDays - daysUntil;
      const expectedProgress = totalDays > 0 ? (daysPassed / totalDays) * 100 : 0;
      const onTrack = isComplete || percentComplete >= expectedProgress * 0.8;

      // Get color config
      const colorConfig = GOAL_COLORS.find(c => c.color === goal.color) || GOAL_COLORS[0];

      // Calculate next milestone
      const nextMilestone = MILESTONES.find(m => percentComplete < m.percent);
      const reachedMilestones = goal.milestonesReached || [];
      const uncelebratedMilestones = reachedMilestones.filter(m => !m.celebrated);

      // Priority score (0-100) based on urgency and progress
      const urgencyScore = daysUntil < 30 ? 100 : daysUntil < 90 ? 70 : daysUntil < 180 ? 40 : 20;
      const progressGap = Math.max(0, expectedProgress - percentComplete);
      const priorityScore = Math.min(100, urgencyScore + progressGap);

      return {
        ...goal,
        remaining,
        percentComplete,
        isComplete,
        daysUntil,
        weeksUntil,
        monthsUntil,
        dailyPayment,
        weeklyPayment,
        monthlyPayment,
        onTrack,
        colorConfig,
        nextMilestone,
        uncelebratedMilestones,
        priorityScore,
      };
    }).sort((a, b) => {
      // Sort: incomplete first (by priority score), then complete
      if (a.isComplete && !b.isComplete) return 1;
      if (!a.isComplete && b.isComplete) return -1;
      return b.priorityScore - a.priorityScore;
    });
  }, [savingsGoals]);

  // Check for uncelebrated milestones on mount
  useEffect(() => {
    const goalWithMilestone = goalsWithPayments.find(g => g.uncelebratedMilestones?.length > 0);
    if (goalWithMilestone && goalWithMilestone.uncelebratedMilestones[0]) {
      const milestone = goalWithMilestone.uncelebratedMilestones[0];
      setCelebrationData({
        goalId: goalWithMilestone.id,
        goalName: goalWithMilestone.name,
        milestone: milestone.percent,
      });
    }
  }, [goalsWithPayments]);

  // Handle add goal
  const handleAddGoal = () => {
    if (!newGoal.name || !newGoal.target || !newGoal.deadline) return;

    addSavingsGoal({
      name: newGoal.name,
      target: parseFloat(newGoal.target),
      deadline: newGoal.deadline,
      icon: newGoal.icon,
      color: newGoal.color,
      priority: newGoal.priority,
      createdAt: new Date().toISOString(),
      contributions: [],
      milestonesReached: [],
      contributionStreak: 0,
    });

    // Update achievement stats
    incrementStat('savingsGoalsCreated', 1);

    // Award XP for creating a goal
    addModuleXP?.('finance', 10);

    setNewGoal({
      name: '',
      target: '',
      deadline: '',
      icon: '🎯',
      color: 'purple',
      priority: 'medium',
    });
    setShowAddGoal(false);
  };

  // Handle contribute
  const handleContribute = (goalId) => {
    const amount = parseFloat(contributeAmount);
    if (!amount || amount <= 0) return;

    const result = contributeSavingsGoal(goalId, amount, contributeNote);

    // Update achievement stats
    incrementStat('savingsContributions', 1);
    incrementStat('totalSaved', amount);

    // Check for milestone achievements
    if (result?.crossedMilestones) {
      result.crossedMilestones.forEach(m => {
        if (m === 25) incrementStat('savingsMilestone25', 1);
        if (m === 50) incrementStat('savingsMilestone50', 1);
        if (m === 75) incrementStat('savingsMilestone75', 1);
        if (m === 100) {
          incrementStat('savingsGoalsCompleted', 1);
        }
      });

      // Show celebration for first milestone
      if (result.crossedMilestones.length > 0) {
        const milestone = result.crossedMilestones[0];
        const milestoneConfig = MILESTONES.find(m => m.percent === milestone);
        if (milestoneConfig) {
          addModuleXP?.('finance', milestoneConfig.xp);
          setCelebrationData({
            goalId,
            goalName: result.goal?.name,
            milestone,
          });
        }
      }
    }

    // Update streak stats
    const goal = savingsGoals.find(g => g.id === goalId);
    if (goal?.contributionStreak) {
      incrementStat('savingsStreakWeeks', goal.contributionStreak);
    }

    // Award base XP for contribution
    addModuleXP?.('finance', 5);

    setShowContribute(null);
    setContributeAmount('');
    setContributeNote('');
  };

  // Handle celebration close
  const handleCelebrationClose = () => {
    if (celebrationData) {
      celebrateMilestone(celebrationData.goalId, celebrationData.milestone);
    }
    setCelebrationData(null);
  };

  return (
    <div className="space-y-6">
      {/* Celebration Modal */}
      {celebrationData && (
        <MilestoneCelebration
          milestone={celebrationData.milestone}
          goalName={celebrationData.goalName}
          onClose={handleCelebrationClose}
        />
      )}

      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4" data-tour="savings-goals">
        <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-slate-400">Active Goals</span>
          </div>
          <div className="text-2xl font-bold text-purple-400">{goalStats.activeGoals}</div>
        </div>

        <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-4 h-4 text-emerald-400" />
            <span className="text-sm text-slate-400">Completed</span>
          </div>
          <div className="text-2xl font-bold text-emerald-400">{goalStats.completedGoals}</div>
        </div>

        <div className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border border-cyan-500/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <PiggyBank className="w-4 h-4 text-cyan-400" />
            <span className="text-sm text-slate-400">Total Saved</span>
          </div>
          <div className="text-2xl font-bold text-cyan-400">£{goalStats.totalSaved.toLocaleString()}</div>
        </div>

        <div className="bg-gradient-to-br from-pink-500/10 to-pink-600/5 border border-pink-500/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-pink-400" />
            <span className="text-sm text-slate-400">Total Target</span>
          </div>
          <div className="text-2xl font-bold text-pink-400">£{goalStats.totalTarget.toLocaleString()}</div>
        </div>

        <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-4 h-4 text-amber-400" />
            <span className="text-sm text-slate-400">Best Streak</span>
          </div>
          <div className="text-2xl font-bold text-amber-400">{goalStats.maxStreak}w</div>
        </div>

        <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <History className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-slate-400">Contributions</span>
          </div>
          <div className="text-2xl font-bold text-blue-400">{goalStats.totalContributions}</div>
        </div>
      </div>

      {/* Add Goal Button */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowAddGoal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-lg text-white font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Goal
        </button>
      </div>

      {/* Goals Grid */}
      {goalsWithPayments.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {goalsWithPayments.map((goal) => (
            <div
              key={goal.id}
              className={`relative bg-slate-800/30 border ${goal.colorConfig.border} rounded-xl overflow-hidden transition-all hover:shadow-lg`}
            >
              {/* Progress Bar Background */}
              <div
                className={`absolute inset-0 bg-gradient-to-r ${goal.colorConfig.gradient} opacity-10 transition-all duration-500`}
                style={{ width: `${goal.percentComplete}%` }}
              />

              <div className="relative p-5">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl ${goal.colorConfig.bg} flex items-center justify-center text-2xl`}>
                      {goal.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{goal.name}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        {goal.isComplete ? (
                          <span className="flex items-center gap-1 text-xs text-emerald-400">
                            <CheckCircle2 className="w-3 h-3" />
                            Complete!
                          </span>
                        ) : goal.onTrack ? (
                          <span className="flex items-center gap-1 text-xs text-cyan-400">
                            <Zap className="w-3 h-3" />
                            On track
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs text-amber-400">
                            <AlertCircle className="w-3 h-3" />
                            Behind schedule
                          </span>
                        )}
                        {goal.contributionStreak > 0 && (
                          <span className="flex items-center gap-1 text-xs text-amber-400 ml-2">
                            <Flame className="w-3 h-3" />
                            {goal.contributionStreak}w streak
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setExpandedGoal(expandedGoal === goal.id ? null : goal.id)}
                      className="p-1.5 text-slate-500 hover:text-white transition-colors"
                      title="View history"
                    >
                      <History className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteSavingsGoal(goal.id)}
                      className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Milestone Progress */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-400">
                      £{goal.current.toLocaleString()} of £{goal.target.toLocaleString()}
                    </span>
                    <span className="font-semibold text-white">{Math.round(goal.percentComplete)}%</span>
                  </div>

                  {/* Progress bar with milestones */}
                  <div className="relative">
                    <div className="h-3 bg-slate-700/50 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${goal.colorConfig.gradient} transition-all duration-500`}
                        style={{ width: `${goal.percentComplete}%` }}
                      />
                    </div>

                    {/* Milestone markers */}
                    <div className="absolute inset-0 flex">
                      {MILESTONES.map(m => (
                        <div
                          key={m.percent}
                          className="absolute top-1/2 -translate-y-1/2"
                          style={{ left: `${m.percent}%`, transform: 'translate(-50%, -50%)' }}
                        >
                          <div
                            className={`w-4 h-4 rounded-full border-2 flex items-center justify-center text-[10px] ${
                              goal.percentComplete >= m.percent
                                ? 'bg-white border-white'
                                : 'bg-slate-700 border-slate-600'
                            }`}
                            title={m.label}
                          >
                            {goal.percentComplete >= m.percent && '✓'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Next milestone indicator */}
                  {goal.nextMilestone && !goal.isComplete && (
                    <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                      <Star className="w-3 h-3" />
                      <span>Next: {goal.nextMilestone.label} ({goal.nextMilestone.percent}%) - +{goal.nextMilestone.xp} XP</span>
                    </div>
                  )}
                </div>

                {/* Payment Schedule */}
                {!goal.isComplete && (
                  <div className="bg-slate-900/50 rounded-lg p-3 mb-4">
                    <div className="text-xs text-slate-400 mb-2 flex items-center gap-1">
                      <CalendarDays className="w-3 h-3" />
                      Save this much to reach your goal on time
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-center">
                        <div className="text-lg font-bold text-white">£{goal.dailyPayment.toFixed(0)}</div>
                        <div className="text-xs text-slate-500">per day</div>
                      </div>
                      <div className={`text-center border-x border-slate-700/50`}>
                        <div className={`text-lg font-bold ${goal.colorConfig.text}`}>£{goal.weeklyPayment.toFixed(0)}</div>
                        <div className="text-xs text-slate-500">per week</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-white">£{goal.monthlyPayment.toFixed(0)}</div>
                        <div className="text-xs text-slate-500">per month</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Expanded History Section */}
                {expandedGoal === goal.id && (
                  <div className="mb-4 p-3 bg-slate-900/50 rounded-lg">
                    <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                      <History className="w-4 h-4" />
                      Contribution History
                    </h4>
                    <ContributionHistory
                      contributions={goal.contributions}
                      colorConfig={goal.colorConfig}
                    />
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Calendar className="w-4 h-4" />
                    {goal.isComplete ? (
                      <span className="text-emerald-400">Goal achieved!</span>
                    ) : (
                      <span>{goal.daysUntil} days left</span>
                    )}
                  </div>

                  {!goal.isComplete && (
                    <button
                      onClick={() => setShowContribute(goal.id)}
                      className={`flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r ${goal.colorConfig.gradient} rounded-lg text-white text-sm font-medium transition-all hover:opacity-90`}
                    >
                      <Plus className="w-3 h-3" />
                      Add Funds
                    </button>
                  )}
                </div>

                {/* Contribute Modal Inline */}
                {showContribute === goal.id && (
                  <div className="mt-4 p-4 bg-slate-900/80 rounded-lg border border-slate-700">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-white">Add contribution</span>
                      <button
                        onClick={() => setShowContribute(null)}
                        className="text-slate-400 hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="space-y-3">
                      <input
                        type="number"
                        value={contributeAmount}
                        onChange={(e) => setContributeAmount(e.target.value)}
                        placeholder="Amount"
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm"
                        autoFocus
                      />
                      <input
                        type="text"
                        value={contributeNote}
                        onChange={(e) => setContributeNote(e.target.value)}
                        placeholder="Note (optional)"
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm"
                      />
                      <div className="flex gap-2">
                        {[goal.weeklyPayment, goal.monthlyPayment, 50, 100].map((amt, i) => (
                          <button
                            key={i}
                            onClick={() => setContributeAmount(amt.toFixed(0))}
                            className="px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded text-xs text-slate-300"
                          >
                            £{amt.toFixed(0)}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => handleContribute(goal.id)}
                        className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-white text-sm font-medium flex items-center justify-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Add £{contributeAmount || 0}
                        <span className="text-emerald-200 text-xs">+5 XP</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-slate-800/30 border border-slate-700/50 rounded-xl">
          <Target className="w-16 h-16 mx-auto mb-4 text-slate-600" />
          <h3 className="text-lg font-semibold text-white mb-2">No goals yet</h3>
          <p className="text-slate-400 mb-6">Create your first financial goal to start tracking progress</p>
          <button
            onClick={() => setShowAddGoal(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white font-medium"
          >
            <Plus className="w-5 h-5" />
            Create Your First Goal
          </button>
        </div>
      )}

      {/* Add Goal Modal */}
      {showAddGoal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#12101a] border border-slate-700 rounded-2xl max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-700/50 sticky top-0 bg-[#12101a]">
              <div>
                <h3 className="text-xl font-bold text-white">Create Savings Goal</h3>
                <p className="text-sm text-slate-400">Set a target and deadline to stay motivated</p>
              </div>
              <button
                onClick={() => setShowAddGoal(false)}
                className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 space-y-5">
              {/* Icon Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Icon</label>
                <div className="flex flex-wrap gap-2">
                  {GOAL_ICONS.map(({ icon, label }) => (
                    <button
                      key={icon}
                      onClick={() => setNewGoal({ ...newGoal, icon })}
                      className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-all ${
                        newGoal.icon === icon
                          ? 'bg-purple-500/30 border-2 border-purple-500'
                          : 'bg-slate-800 border border-slate-700 hover:border-slate-500'
                      }`}
                      title={label}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Color</label>
                <div className="flex gap-2">
                  {GOAL_COLORS.map(({ color, gradient }) => (
                    <button
                      key={color}
                      onClick={() => setNewGoal({ ...newGoal, color })}
                      className={`w-8 h-8 rounded-full bg-gradient-to-br ${gradient} transition-all ${
                        newGoal.color === color
                          ? 'ring-2 ring-white ring-offset-2 ring-offset-[#12101a]'
                          : ''
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Goal Name */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Goal Name *</label>
                <input
                  type="text"
                  value={newGoal.name}
                  onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                  placeholder="e.g., New MacBook, Emergency Fund, Holiday"
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Target Amount */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Target Amount (£) *</label>
                <input
                  type="number"
                  value={newGoal.target}
                  onChange={(e) => setNewGoal({ ...newGoal, target: e.target.value })}
                  placeholder="1000"
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Deadline */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Target Date *</label>
                <input
                  type="date"
                  value={newGoal.deadline}
                  onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Payment Preview */}
              {newGoal.target && newGoal.deadline && (
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                  <div className="text-xs text-slate-400 mb-2 flex items-center gap-2">
                    <Sparkles className="w-3 h-3" />
                    To reach your goal, you'll need to save:
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    {(() => {
                      const target = parseFloat(newGoal.target) || 0;
                      const deadline = new Date(newGoal.deadline);
                      const days = Math.max(1, Math.ceil((deadline - new Date()) / (1000 * 60 * 60 * 24)));
                      // Calculate daily rate, then derive weekly/monthly from that
                      const dailyRate = target / days;

                      return (
                        <>
                          <div>
                            <div className="text-lg font-bold text-white">£{dailyRate.toFixed(0)}</div>
                            <div className="text-xs text-slate-500">per day</div>
                          </div>
                          <div className="border-x border-slate-700/50">
                            <div className="text-lg font-bold text-purple-400">£{(dailyRate * 7).toFixed(0)}</div>
                            <div className="text-xs text-slate-500">per week</div>
                          </div>
                          <div>
                            <div className="text-lg font-bold text-white">£{(dailyRate * 30).toFixed(0)}</div>
                            <div className="text-xs text-slate-500">per month</div>
                          </div>
                        </>
                      );
                    })()}
                  </div>

                  {/* Milestone Preview */}
                  <div className="mt-4 pt-4 border-t border-slate-700/50">
                    <div className="text-xs text-slate-400 mb-2">Milestones you'll unlock:</div>
                    <div className="flex justify-between">
                      {MILESTONES.map(m => (
                        <div key={m.percent} className="text-center">
                          <div className="text-xl">{m.icon}</div>
                          <div className="text-xs text-slate-500">{m.percent}%</div>
                          <div className="text-xs text-purple-400">+{m.xp} XP</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 p-5 border-t border-slate-700/50 sticky bottom-0 bg-[#12101a]">
              <button
                onClick={() => setShowAddGoal(false)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-white font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddGoal}
                disabled={!newGoal.name || !newGoal.target || !newGoal.deadline}
                className="flex-1 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-slate-600 disabled:to-slate-600 disabled:cursor-not-allowed rounded-lg text-white font-semibold transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create Goal
                <span className="text-purple-200 text-xs">+10 XP</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
