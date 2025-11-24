import React, { useState } from 'react';
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
  Flame
} from 'lucide-react';

// Mock daily quests data
const DAILY_QUESTS = [
  {
    id: 'workout',
    title: 'Complete a workout',
    description: 'Any physical activity for 30+ minutes',
    category: 'Health',
    icon: Dumbbell,
    xpReward: 50,
    creditsReward: 25,
    completed: false,
    difficulty: 'moderate',
    color: 'from-green-500 to-emerald-500'
  },
  {
    id: 'journal',
    title: 'Write journal entry',
    description: 'Reflect on your day',
    category: 'Mind',
    icon: Book,
    xpReward: 30,
    creditsReward: 15,
    completed: true,
    difficulty: 'routine',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'deepwork',
    title: 'Deep work session',
    description: '2 hours of focused work',
    category: 'Productivity',
    icon: Brain,
    xpReward: 80,
    creditsReward: 40,
    completed: false,
    difficulty: 'challenging',
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: 'meditation',
    title: 'Morning meditation',
    description: '10 minutes of mindfulness',
    category: 'Mind',
    icon: Heart,
    xpReward: 25,
    creditsReward: 10,
    completed: true,
    difficulty: 'routine',
    color: 'from-pink-500 to-rose-500'
  },
  {
    id: 'reading',
    title: 'Read for 30 minutes',
    description: 'Books, articles, or learning content',
    category: 'Knowledge',
    icon: Book,
    xpReward: 40,
    creditsReward: 20,
    completed: false,
    difficulty: 'routine',
    color: 'from-cyan-500 to-blue-500'
  },
  {
    id: 'breakfast',
    title: 'Healthy breakfast',
    description: 'Start your day with nutrition',
    category: 'Health',
    icon: Coffee,
    xpReward: 20,
    creditsReward: 10,
    completed: true,
    difficulty: 'routine',
    color: 'from-amber-500 to-orange-500'
  }
];

const BONUS_OBJECTIVES = [
  {
    id: 'complete_all',
    title: 'Complete all daily quests',
    description: '6/6 quests completed',
    xpReward: 100,
    creditsReward: 50,
    icon: Sparkles,
    color: 'from-yellow-500 to-orange-500',
    progress: 3,
    total: 6
  },
  {
    id: 'perfect_week',
    title: 'Perfect week',
    description: 'Complete all dailies for 7 days',
    xpReward: 500,
    creditsReward: 250,
    icon: Flame,
    color: 'from-orange-500 to-red-500',
    progress: 4,
    total: 7
  }
];

export default function DailyQuests() {
  const [quests, setQuests] = useState(DAILY_QUESTS);

  const handleToggleQuest = (questId) => {
    setQuests(quests.map(q =>
      q.id === questId ? { ...q, completed: !q.completed } : q
    ));
  };

  const completedCount = quests.filter(q => q.completed).length;
  const totalXP = quests.filter(q => q.completed).reduce((sum, q) => sum + q.xpReward, 0);
  const totalCredits = quests.filter(q => q.completed).reduce((sum, q) => sum + q.creditsReward, 0);

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
              {completedCount}/{quests.length} quests completed
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
            style={{ width: `${(completedCount / quests.length) * 100}%` }}
          />
          {completedCount === quests.length && (
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 animate-pulse" />
          )}
        </div>

        {/* Time Remaining */}
        <div className="flex items-center gap-2 mt-4 text-white/60 text-sm">
          <Clock className="w-4 h-4" />
          <span>Resets in 8 hours 23 minutes</span>
        </div>
      </div>

      {/* Daily Quests Grid */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-white flex items-center gap-2">
          <Target className="w-5 h-5 text-cyan-400" />
          Today's Quests
        </h3>

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
      </div>

      {/* Bonus Objectives */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-yellow-400" />
          Bonus Objectives
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {BONUS_OBJECTIVES.map((bonus) => {
            const Icon = bonus.icon;
            const progress = (bonus.progress / bonus.total) * 100;

            return (
              <div
                key={bonus.id}
                className="bg-[#1a1724] border border-white/10 rounded-xl p-5"
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
                      style={{ width: `${progress}%` }}
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
