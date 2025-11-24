import React from 'react';
import {
  Flame,
  TrendingUp,
  Calendar,
  Zap,
  Target,
  CheckCircle2,
  Circle,
  Award
} from 'lucide-react';

const HABIT_STREAKS = [
  {
    id: 'workout',
    name: 'Daily Workout',
    icon: '💪',
    currentStreak: 14,
    longestStreak: 25,
    color: 'from-green-500 to-emerald-500',
    lastCompleted: '2025-11-21',
    totalCompletions: 87,
    weekData: [true, true, true, true, true, true, true], // Last 7 days
    active: true
  },
  {
    id: 'reading',
    name: 'Reading 30min',
    icon: '📚',
    currentStreak: 12,
    longestStreak: 18,
    color: 'from-blue-500 to-cyan-500',
    lastCompleted: '2025-11-21',
    totalCompletions: 56,
    weekData: [true, true, true, true, false, true, true],
    active: true
  },
  {
    id: 'meditation',
    name: 'Morning Meditation',
    icon: '🧘',
    currentStreak: 8,
    longestStreak: 20,
    color: 'from-purple-500 to-pink-500',
    lastCompleted: '2025-11-21',
    totalCompletions: 45,
    weekData: [true, true, true, true, true, true, true],
    active: true
  },
  {
    id: 'journal',
    name: 'Journal Entry',
    icon: '✍️',
    currentStreak: 0,
    longestStreak: 15,
    color: 'from-amber-500 to-orange-500',
    lastCompleted: '2025-11-18',
    totalCompletions: 34,
    weekData: [true, true, false, false, false, false, false],
    active: false
  },
  {
    id: 'coding',
    name: 'Code Practice',
    icon: '💻',
    currentStreak: 7,
    longestStreak: 12,
    color: 'from-indigo-500 to-purple-500',
    lastCompleted: '2025-11-21',
    totalCompletions: 29,
    weekData: [false, true, true, true, true, true, true],
    active: true
  },
];

const MILESTONES = [
  { streak: 7, label: '1 Week', reached: true, reward: '100 XP' },
  { streak: 14, label: '2 Weeks', reached: true, reward: '250 XP' },
  { streak: 30, label: '1 Month', reached: false, reward: '500 XP' },
  { streak: 100, label: '100 Days', reached: false, reward: '2000 XP' },
  { streak: 365, label: '1 Year', reached: false, reward: '10000 XP' },
];

export default function StreaksView() {
  const totalActiveStreaks = HABIT_STREAKS.filter(h => h.active).length;
  const longestCurrentStreak = Math.max(...HABIT_STREAKS.map(h => h.currentStreak));

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">
              Momentum Chains
            </h2>
            <p className="text-white/60">
              {totalActiveStreaks} active streaks
            </p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="flex items-center gap-2 text-orange-400">
                <Flame className="w-6 h-6" />
                <span className="text-3xl font-bold">{longestCurrentStreak}</span>
              </div>
              <p className="text-xs text-white/60">Longest Streak</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 text-green-400">
                <TrendingUp className="w-6 h-6" />
                <span className="text-3xl font-bold">{totalActiveStreaks}</span>
              </div>
              <p className="text-xs text-white/60">Active</p>
            </div>
          </div>
        </div>
      </div>

      {/* Streaks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {HABIT_STREAKS.map((habit) => {
          const completionRate = (habit.weekData.filter(Boolean).length / 7) * 100;

          return (
            <div
              key={habit.id}
              className={`
                bg-[#1a1724] border rounded-xl p-5 transition-all duration-200
                ${habit.active
                  ? 'border-orange-500/30 hover:border-orange-500/50'
                  : 'border-white/10 opacity-75'
                }
              `}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{habit.icon}</span>
                  <div>
                    <h4 className="text-lg font-semibold text-white">
                      {habit.name}
                    </h4>
                    <p className="text-sm text-white/60">
                      {habit.totalCompletions} total completions
                    </p>
                  </div>
                </div>

                {habit.active ? (
                  <div className="flex items-center gap-1 text-orange-400">
                    <Flame className="w-5 h-5" />
                    <span className="text-2xl font-bold">{habit.currentStreak}</span>
                  </div>
                ) : (
                  <div className="px-3 py-1 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                    Broken
                  </div>
                )}
              </div>

              {/* Week View */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-xs text-white/60 mb-2">
                  <span>Last 7 days</span>
                  <span>{habit.weekData.filter(Boolean).length}/7 days</span>
                </div>
                <div className="flex gap-1">
                  {habit.weekData.map((completed, i) => (
                    <div
                      key={i}
                      className={`
                        flex-1 h-10 rounded flex items-center justify-center
                        ${completed
                          ? `bg-gradient-to-br ${habit.color}`
                          : 'bg-[#0c0a10] border border-white/10'
                        }
                      `}
                    >
                      {completed ? (
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      ) : (
                        <Circle className="w-4 h-4 text-white/40" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/10">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">
                    {habit.currentStreak}
                  </div>
                  <div className="text-xs text-white/60">Current</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">
                    {habit.longestStreak}
                  </div>
                  <div className="text-xs text-white/60">Best</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">
                    {completionRate}%
                  </div>
                  <div className="text-xs text-white/60">7-day</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Milestones */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-white flex items-center gap-2">
          <Award className="w-5 h-5 text-yellow-400" />
          Streak Milestones
        </h3>

        <div className="bg-[#1a1724] border border-white/10 rounded-xl p-6">
          <div className="space-y-4">
            {MILESTONES.map((milestone, index) => (
              <div key={index} className="flex items-center gap-4">
                {/* Checkpoint */}
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center
                  ${milestone.reached
                    ? 'bg-gradient-to-br from-orange-500 to-red-500'
                    : 'bg-[#0c0a10] border border-white/10'
                  }
                `}>
                  {milestone.reached ? (
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  ) : (
                    <Circle className="w-5 h-5 text-white/40" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className={`
                        text-lg font-semibold
                        ${milestone.reached ? 'text-white' : 'text-white/50'}
                      `}>
                        {milestone.streak} Days - {milestone.label}
                      </div>
                      <div className="text-sm text-white/60">
                        Reward: {milestone.reward}
                      </div>
                    </div>
                    {milestone.reached && (
                      <span className="text-xs px-3 py-1 bg-green-500/10 border border-green-500/30 rounded-full text-green-400">
                        Unlocked
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress Line */}
                {index < MILESTONES.length - 1 && (
                  <div className={`
                    absolute left-[1.25rem] w-0.5 h-12 translate-y-10
                    ${milestone.reached ? 'bg-orange-500/30' : 'bg-white/5'}
                  `} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-5">
        <div className="flex items-start gap-3">
          <Zap className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-white mb-1">Streak Tips</h4>
            <p className="text-sm text-white/60">
              Maintain your streaks to earn bonus XP multipliers! Each consecutive day completed increases your XP by 2%.
              A 30-day streak gives you a massive 60% XP boost!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
