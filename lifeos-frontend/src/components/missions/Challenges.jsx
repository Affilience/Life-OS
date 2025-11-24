import React from 'react';
import {
  Sparkles,
  Clock,
  Trophy,
  Zap,
  Target,
  TrendingUp,
  Flame,
  Users,
  Crown,
  Award
} from 'lucide-react';

const ACTIVE_CHALLENGES = [
  {
    id: 'november_fitness',
    title: 'November Fitness Blast',
    description: 'Complete 20 workouts this month',
    type: 'monthly',
    icon: '💪',
    color: 'from-green-500 to-emerald-500',
    startDate: '2025-11-01',
    endDate: '2025-11-30',
    progress: 14,
    target: 20,
    participants: 1247,
    xpReward: 2000,
    creditsReward: 1000,
    badge: 'Fitness Champion',
    timeRemaining: '9 days',
    difficulty: 'moderate'
  },
  {
    id: 'reading_sprint',
    title: 'Reading Sprint',
    description: 'Read for 10 hours this week',
    type: 'weekly',
    icon: '📚',
    color: 'from-blue-500 to-cyan-500',
    startDate: '2025-11-18',
    endDate: '2025-11-24',
    progress: 6.5,
    target: 10,
    participants: 892,
    xpReward: 800,
    creditsReward: 400,
    badge: 'Bookworm',
    timeRemaining: '2 days',
    difficulty: 'moderate'
  },
  {
    id: 'productivity_master',
    title: 'Productivity Master',
    description: 'Log 40 hours of deep work this month',
    type: 'monthly',
    icon: '⚡',
    color: 'from-yellow-500 to-orange-500',
    startDate: '2025-11-01',
    endDate: '2025-11-30',
    progress: 28,
    target: 40,
    participants: 2134,
    xpReward: 3000,
    creditsReward: 1500,
    badge: 'Deep Work Elite',
    timeRemaining: '9 days',
    difficulty: 'challenging'
  },
];

const UPCOMING_CHALLENGES = [
  {
    id: 'december_mindfulness',
    title: 'December Mindfulness',
    description: 'Meditate for 31 consecutive days',
    type: 'monthly',
    icon: '🧘',
    color: 'from-purple-500 to-pink-500',
    startDate: '2025-12-01',
    endDate: '2025-12-31',
    target: 31,
    xpReward: 4000,
    creditsReward: 2000,
    badge: 'Zen Master',
    startsIn: '10 days'
  },
  {
    id: 'winter_warrior',
    title: 'Winter Warrior',
    description: 'Complete 50 workouts in December',
    type: 'monthly',
    icon: '❄️',
    color: 'from-cyan-500 to-blue-500',
    startDate: '2025-12-01',
    endDate: '2025-12-31',
    target: 50,
    xpReward: 5000,
    creditsReward: 2500,
    badge: 'Winter Champion',
    startsIn: '10 days'
  },
];

const LEADERBOARD = [
  { rank: 1, name: 'You', score: 14250, avatar: '👤', change: '+2' },
  { rank: 2, name: 'Alex M.', score: 14890, avatar: '🦸', change: '-1' },
  { rank: 3, name: 'Sam K.', score: 13720, avatar: '🧙', change: '+1' },
  { rank: 4, name: 'Jordan P.', score: 12450, avatar: '⚔️', change: '0' },
  { rank: 5, name: 'Taylor R.', score: 11380, avatar: '🛡️', change: '+3' },
];

export default function Challenges() {
  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-pink-500/10 to-purple-500/10 border border-pink-500/20 rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-pink-400" />
              Active Challenges
            </h2>
            <p className="text-gray-400">
              Compete with others and earn exclusive rewards
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="flex items-center gap-2 text-pink-400">
                <Trophy className="w-6 h-6" />
                <span className="text-3xl font-bold">{ACTIVE_CHALLENGES.length}</span>
              </div>
              <p className="text-xs text-gray-400">Active</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 text-purple-400">
                <Users className="w-6 h-6" />
                <span className="text-3xl font-bold">4.2K</span>
              </div>
              <p className="text-xs text-gray-400">Players</p>
            </div>
          </div>
        </div>
      </div>

      {/* Active Challenges */}
      <div className="space-y-4">
        {ACTIVE_CHALLENGES.map((challenge) => {
          const progress = (challenge.progress / challenge.target) * 100;
          const isNearComplete = progress >= 70;

          return (
            <div
              key={challenge.id}
              className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6 hover:border-purple-500/50 transition-all"
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={`
                  p-4 rounded-xl text-4xl
                  bg-gradient-to-br ${challenge.color} bg-opacity-10
                `}>
                  {challenge.icon}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">
                        {challenge.title}
                      </h3>
                      <p className="text-gray-400 text-sm mb-2">
                        {challenge.description}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {challenge.timeRemaining} left
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {challenge.participants.toLocaleString()} participants
                        </span>
                        <span className={`
                          px-2 py-0.5 rounded border
                          ${challenge.difficulty === 'moderate' ? 'text-blue-400 border-blue-500/30 bg-blue-500/10' :
                            'text-purple-400 border-purple-500/30 bg-purple-500/10'}
                        `}>
                          {challenge.difficulty}
                        </span>
                      </div>
                    </div>

                    {/* Rewards */}
                    <div className="text-right">
                      <div className="flex items-center gap-2 text-green-400 text-sm mb-1">
                        <Trophy className="w-4 h-4" />
                        <span className="font-bold">+{challenge.xpReward} XP</span>
                      </div>
                      <div className="flex items-center gap-2 text-yellow-400 text-sm">
                        <Zap className="w-4 h-4" />
                        <span className="font-bold">+{challenge.creditsReward}</span>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-400">Progress</span>
                      <span className={`font-medium ${isNearComplete ? 'text-green-400' : 'text-purple-400'}`}>
                        {challenge.progress}/{challenge.target}
                      </span>
                    </div>
                    <div className="relative h-3 bg-[#0a0a0a] rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${challenge.color} transition-all duration-500`}
                        style={{ width: `${progress}%` }}
                      />
                      {isNearComplete && (
                        <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 animate-pulse" />
                      )}
                    </div>
                  </div>

                  {/* Badge Preview */}
                  <div className="flex items-center gap-2 px-3 py-2 bg-purple-500/5 border border-purple-500/20 rounded-lg">
                    <Award className="w-4 h-4 text-purple-400" />
                    <span className="text-sm text-gray-300">
                      Complete to earn: <span className="text-purple-400 font-semibold">{challenge.badge}</span> badge
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Leaderboard */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-orange-400" />
          Global Leaderboard
        </h3>

        <div className="bg-[#1a1a1a] border border-white/10 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-white/10 bg-gradient-to-r from-yellow-500/5 to-orange-500/5">
            <p className="text-sm text-gray-400">
              Top performers across all challenges this month
            </p>
          </div>

          <div className="divide-y divide-white/5">
            {LEADERBOARD.map((player) => (
              <div
                key={player.rank}
                className={`
                  flex items-center justify-between p-4
                  ${player.name === 'You' ? 'bg-purple-500/5' : 'hover:bg-white/5'}
                  transition-colors
                `}
              >
                <div className="flex items-center gap-4">
                  {/* Rank */}
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center font-bold
                    ${player.rank === 1 ? 'bg-gradient-to-br from-yellow-500 to-orange-500 text-white' :
                      player.rank === 2 ? 'bg-gradient-to-br from-gray-400 to-gray-500 text-white' :
                      player.rank === 3 ? 'bg-gradient-to-br from-amber-700 to-amber-600 text-white' :
                      'bg-[#0a0a0a] text-gray-400'}
                  `}>
                    {player.rank === 1 && <Crown className="w-4 h-4" />}
                    {player.rank !== 1 && player.rank}
                  </div>

                  {/* Avatar & Name */}
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{player.avatar}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`
                          font-semibold
                          ${player.name === 'You' ? 'text-purple-400' : 'text-white'}
                        `}>
                          {player.name}
                        </span>
                        {player.name === 'You' && (
                          <span className="text-xs px-2 py-0.5 bg-purple-500/20 border border-purple-500/30 rounded text-purple-400">
                            You
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-400">
                        {player.score.toLocaleString()} points
                      </div>
                    </div>
                  </div>
                </div>

                {/* Change Indicator */}
                <div className={`
                  flex items-center gap-1 text-sm font-medium
                  ${player.change.startsWith('+') ? 'text-green-400' :
                    player.change.startsWith('-') ? 'text-red-400' :
                    'text-gray-400'}
                `}>
                  {player.change !== '0' && (
                    <TrendingUp className="w-4 h-4" />
                  )}
                  <span>{player.change}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Upcoming Challenges */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-white flex items-center gap-2">
          <Clock className="w-5 h-5 text-cyan-400" />
          Coming Soon
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {UPCOMING_CHALLENGES.map((challenge) => (
            <div
              key={challenge.id}
              className="bg-[#1a1a1a] border border-white/10 rounded-xl p-5 opacity-75 hover:opacity-100 transition-opacity"
            >
              <div className="flex items-start gap-3 mb-4">
                <div className={`
                  p-3 rounded-xl text-3xl
                  bg-gradient-to-br ${challenge.color} bg-opacity-10
                `}>
                  {challenge.icon}
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-white mb-1">
                    {challenge.title}
                  </h4>
                  <p className="text-sm text-gray-400">
                    {challenge.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-white/10">
                <span className="text-xs text-gray-500">
                  Starts in {challenge.startsIn}
                </span>
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex items-center gap-1 text-green-400">
                    <Trophy className="w-4 h-4" />
                    <span>+{challenge.xpReward}</span>
                  </div>
                  <div className="flex items-center gap-1 text-yellow-400">
                    <Zap className="w-4 h-4" />
                    <span>+{challenge.creditsReward}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
