import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Moon
} from 'lucide-react';
import useDailyTasksStore, { TASK_CATEGORIES, PRIORITY_LEVELS } from '../../stores/dailyTasksStore';

// Map category to icon
const CATEGORY_ICONS = {
  productivity: Brain,
  health: Dumbbell,
  learning: Book,
  personal: Heart,
  admin: Coffee,
  creative: Sparkles,
};

// Map priority to difficulty label
const PRIORITY_TO_DIFFICULTY = {
  low: 'routine',
  medium: 'routine',
  high: 'moderate',
  critical: 'challenging',
};

export default function DailyQuests() {
  const navigate = useNavigate();
  const { getTodayTasks, getTodayStats, toggleTask, getStreak } = useDailyTasksStore();

  const todaysTasks = getTodayTasks();
  const todayStats = getTodayStats();
  const streak = getStreak();

  // Transform daily tasks to quest format
  const quests = useMemo(() => {
    return todaysTasks.map(task => {
      const category = TASK_CATEGORIES[task.category] || TASK_CATEGORIES.productivity;
      const priority = PRIORITY_LEVELS[task.priority] || PRIORITY_LEVELS.medium;
      const Icon = CATEGORY_ICONS[task.category] || Brain;

      return {
        id: task.id,
        title: task.title,
        description: task.description || `${task.estimatedMinutes} min • ${category.label}`,
        category: category.label,
        icon: Icon,
        xpReward: priority.xp,
        creditsReward: Math.floor(priority.xp / 2),
        completed: task.completed,
        difficulty: PRIORITY_TO_DIFFICULTY[task.priority] || 'routine',
        color: category.color,
      };
    });
  }, [todaysTasks]);

  const handleToggleQuest = (questId) => {
    toggleTask(questId);
  };

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

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">
              Daily Progress
            </h2>
            <p className="text-white/60">
              {completedCount}/{totalQuests} quests completed
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="flex items-center gap-2 text-green-400">
                <Trophy className="w-5 h-5" />
                <span className="text-2xl font-bold">+{totalXP}</span>
              </div>
              <p className="text-xs text-white/60">XP earned</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 text-yellow-400">
                <Zap className="w-5 h-5" />
                <span className="text-2xl font-bold">+{totalCredits}</span>
              </div>
              <p className="text-xs text-white/60">Credits earned</p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative h-3 bg-[#0c0a10] rounded-full overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
            style={{ width: `${totalQuests > 0 ? (completedCount / totalQuests) * 100 : 0}%` }}
          />
          {completedCount === totalQuests && totalQuests > 0 && (
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 animate-pulse" />
          )}
        </div>

        {/* Time Remaining */}
        <div className="flex items-center gap-2 mt-4 text-white/60 text-sm">
          <Clock className="w-4 h-4" />
          <span>Resets in {timeUntilReset}</span>
        </div>
      </div>

      {/* Daily Quests Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-cyan-400" />
            Today's Quests
          </h3>
          <button
            onClick={() => navigate('/productivity')}
            className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Plan Tasks
          </button>
        </div>

        {quests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quests.map((quest) => {
              const Icon = quest.icon;

              return (
                <button
                  key={quest.id}
                  onClick={() => handleToggleQuest(quest.id)}
                  className={`
                    relative bg-[#1a1724] border rounded-xl p-5 text-left
                    transition-all duration-200 hover:scale-[1.02]
                    ${quest.completed
                      ? 'border-green-500/50 bg-green-500/5'
                      : 'border-white/10 hover:border-purple-500/50'
                    }
                  `}
                >
                  {/* Completion Indicator */}
                  <div className="absolute top-4 right-4">
                    {quest.completed ? (
                      <CheckCircle2 className="w-6 h-6 text-green-400" />
                    ) : (
                      <Circle className="w-6 h-6 text-white/40" />
                    )}
                  </div>

                  {/* Icon */}
                  <div className={`
                    inline-flex p-3 rounded-xl mb-4
                    bg-gradient-to-br ${quest.color} bg-opacity-10
                  `}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>

                  {/* Content */}
                  <div className="pr-8">
                    <h4 className={`
                      text-lg font-semibold mb-1
                      ${quest.completed ? 'text-white/60 line-through' : 'text-white'}
                    `}>
                      {quest.title}
                    </h4>
                    <p className="text-sm text-white/50 mb-4">
                      {quest.description}
                    </p>

                    {/* Rewards */}
                    <div className="flex items-center gap-3 text-sm">
                      <div className="flex items-center gap-1 text-green-400">
                        <Trophy className="w-4 h-4" />
                        <span>+{quest.xpReward}</span>
                      </div>
                      <div className="flex items-center gap-1 text-yellow-400">
                        <Zap className="w-4 h-4" />
                        <span>+{quest.creditsReward}</span>
                      </div>
                    </div>
                  </div>

                  {/* Difficulty Badge */}
                  <div className="absolute bottom-4 right-4">
                    <span className={`
                      text-xs px-2 py-1 rounded border
                      ${quest.difficulty === 'routine' ? 'text-green-400 border-green-500/30 bg-green-500/10' :
                        quest.difficulty === 'moderate' ? 'text-blue-400 border-blue-500/30 bg-blue-500/10' :
                        'text-purple-400 border-purple-500/30 bg-purple-500/10'}
                    `}>
                      {quest.difficulty}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="bg-[#1a1724] border border-white/10 rounded-xl p-8 text-center">
            <Moon className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-white mb-2">
              No quests planned for today
            </h4>
            <p className="text-white/50 text-sm mb-6">
              Plan your daily tasks in the Productivity module to see them here as quests.
            </p>
            <button
              onClick={() => navigate('/productivity')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-violet-500 hover:bg-violet-600 text-white font-medium rounded-xl transition-colors"
            >
              <Plus className="w-5 h-5" />
              Plan Today's Quests
            </button>
          </div>
        )}
      </div>

      {/* Bonus Objectives */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-white flex items-center gap-2">
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
                className={`bg-[#1a1724] border rounded-xl p-5 ${
                  isComplete ? 'border-yellow-500/50 bg-yellow-500/5' : 'border-white/10'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`
                    inline-flex p-3 rounded-xl
                    bg-gradient-to-br ${bonus.color} bg-opacity-10
                  `}>
                    <Icon className="w-6 h-6 text-white" />
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

                <h4 className="text-lg font-semibold text-white mb-1">
                  {bonus.title}
                  {isComplete && <span className="ml-2 text-yellow-400">Complete!</span>}
                </h4>
                <p className="text-sm text-white/60 mb-4">
                  {bonus.description}
                </p>

                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/60">Progress</span>
                    <span className="text-purple-400 font-medium">
                      {bonus.progress}/{bonus.total}
                    </span>
                  </div>
                  <div className="h-2 bg-[#0c0a10] rounded-full overflow-hidden">
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
