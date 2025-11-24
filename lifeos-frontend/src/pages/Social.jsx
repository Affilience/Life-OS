import React, { useState } from 'react';
import {
  Users,
  Trophy,
  Target,
  MessageCircle,
  UserPlus,
  Crown,
  Flame,
  TrendingUp,
  Award,
  Shield,
  Search,
  Filter,
  ChevronRight,
  Check,
  X,
  Lock,
  Globe,
  Clock,
  Zap,
  Star,
  Send
} from 'lucide-react';

export default function Social() {
  const [activeTab, setActiveTab] = useState('feed');
  const [selectedGuild, setSelectedGuild] = useState(null);

  // Mock data
  const userStats = {
    rank: 127,
    xp: 12480,
    streak: 14,
    level: 12,
    guildName: 'Morning Warriors'
  };

  const activityFeed = [
    { id: 1, user: 'Alex M.', action: 'reached Level 15', module: 'Health', time: '2m ago', avatar: '🦸' },
    { id: 2, user: 'Sarah K.', action: 'completed "30-Day Streak"', module: 'Productivity', time: '15m ago', avatar: '⚡' },
    { id: 3, user: 'Mike R.', action: 'unlocked "Dragon Knight" evolution', module: 'Character', time: '1h ago', avatar: '🐉' },
    { id: 4, user: 'Emma L.', action: 'earned 500 XP from Deep Work Quest', module: 'Productivity', time: '2h ago', avatar: '💼' },
    { id: 5, user: 'John D.', action: 'joined guild "Code Warriors"', module: 'Social', time: '3h ago', avatar: '🛡️' },
  ];

  const leaderboards = {
    global: [
      { rank: 1, name: 'DragonMaster99', xp: 48920, streak: 87, level: 35, avatar: '🐉' },
      { rank: 2, name: 'ProductivityKing', xp: 45230, streak: 64, level: 33, avatar: '👑' },
      { rank: 3, name: 'HealthWarrior', xp: 42100, streak: 71, level: 32, avatar: '💪' },
      { rank: 4, name: 'CodeNinja', xp: 38540, streak: 52, level: 29, avatar: '🥷' },
      { rank: 5, name: 'StudyMachine', xp: 35890, streak: 48, level: 27, avatar: '📚' },
      { rank: 127, name: 'You', xp: 12480, streak: 14, level: 12, avatar: '⚔️', isYou: true }
    ],
    friends: [
      { rank: 1, name: 'Sarah K.', xp: 15200, streak: 22, level: 14, avatar: '⚡', isFriend: true },
      { rank: 2, name: 'You', xp: 12480, streak: 14, level: 12, avatar: '⚔️', isYou: true },
      { rank: 3, name: 'Mike R.', xp: 11890, streak: 18, level: 11, avatar: '🐉', isFriend: true },
      { rank: 4, name: 'Alex M.', xp: 10340, streak: 15, level: 10, avatar: '🦸', isFriend: true },
    ]
  };

  const guilds = [
    {
      id: 1,
      name: 'Morning Warriors',
      members: 8,
      maxMembers: 10,
      streak: 21,
      totalXP: 89450,
      description: 'Early risers crushing goals before breakfast',
      isMember: true,
      icon: '☀️'
    },
    {
      id: 2,
      name: 'Code & Conquer',
      members: 12,
      maxMembers: 15,
      streak: 45,
      totalXP: 124890,
      description: 'Developers leveling up through daily coding',
      isMember: false,
      icon: '💻'
    },
    {
      id: 3,
      name: 'Fitness Legends',
      members: 10,
      maxMembers: 12,
      streak: 33,
      totalXP: 98320,
      description: 'Health enthusiasts supporting each other',
      isMember: false,
      icon: '🏋️'
    },
  ];

  const friends = [
    { id: 1, name: 'Sarah K.', level: 14, streak: 22, online: true, avatar: '⚡', relationship: 'Accountability Partner' },
    { id: 2, name: 'Mike R.', level: 11, streak: 18, online: true, avatar: '🐉', relationship: 'Friend' },
    { id: 3, name: 'Alex M.', level: 10, streak: 15, online: false, avatar: '🦸', relationship: 'Friend' },
    { id: 4, name: 'Emma L.', level: 13, streak: 20, online: true, avatar: '💼', relationship: 'Guild Member' },
  ];

  const activeChallenges = [
    {
      id: 1,
      title: '7-Day Workout Streak',
      description: 'Complete a workout 7 days in a row',
      progress: 4,
      total: 7,
      participants: 234,
      endsIn: '3 days',
      reward: '+500 XP',
      type: 'individual'
    },
    {
      id: 2,
      title: 'Guild XP Race',
      description: 'First guild to reach 50,000 XP this week',
      progress: 32450,
      total: 50000,
      participants: 12,
      endsIn: '4 days',
      reward: 'Legendary Badge',
      type: 'guild'
    },
    {
      id: 3,
      title: 'Knowledge Seeker',
      description: 'Read for 30 minutes daily for a week',
      progress: 5,
      total: 7,
      participants: 156,
      endsIn: '2 days',
      reward: '+300 XP',
      type: 'individual'
    },
  ];

  const pendingRequests = [
    { id: 1, name: 'John D.', level: 9, avatar: '🛡️', mutualFriends: 2 },
    { id: 2, name: 'Lisa P.', level: 15, avatar: '🌟', mutualFriends: 1 },
  ];

  const TABS = [
    { id: 'feed', label: 'Feed', icon: Users },
    { id: 'leaderboards', label: 'Leaderboards', icon: Trophy },
    { id: 'guilds', label: 'Guilds', icon: Shield },
    { id: 'friends', label: 'Friends', icon: UserPlus },
    { id: 'challenges', label: 'Challenges', icon: Target },
  ];

  const getModuleColor = (module) => {
    const colors = {
      'Health': 'text-green-400',
      'Productivity': 'text-blue-400',
      'Knowledge': 'text-purple-400',
      'Character': 'text-pink-400',
      'Social': 'text-yellow-400'
    };
    return colors[module] || 'text-white/60';
  };

  return (
    <div className="min-h-screen bg-[#0c0a10] pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0c0a10]/95 backdrop-blur-md border-b border-white/5">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-400" />
            Social
          </h1>
          <p className="text-sm text-white/60 mt-1">
            Connect, compete, and conquer together
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 px-4 pb-2 overflow-x-auto scrollbar-hide">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm
                  whitespace-nowrap transition-all duration-200
                  ${isActive
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-[#1a1724] text-white/60 hover:text-white hover:bg-[#221e2e] border border-white/10'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-6">
        {/* FEED TAB */}
        {activeTab === 'feed' && (
          <div className="space-y-6">
            {/* Your Daily Summary */}
            <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400" />
                Your Today
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{userStats.level}</div>
                  <div className="text-xs text-white/60">Level</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-400">{userStats.streak}</div>
                  <div className="text-xs text-white/60">Day Streak</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">{userStats.xp.toLocaleString()}</div>
                  <div className="text-xs text-white/60">Total XP</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">#{userStats.rank}</div>
                  <div className="text-xs text-white/60">Global Rank</div>
                </div>
              </div>
            </div>

            {/* Activity Feed */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-400" />
                Recent Activity
              </h3>
              <div className="space-y-3">
                {activityFeed.map((activity) => (
                  <div key={activity.id} className="bg-[#1a1724] border border-white/10 rounded-xl p-4 hover:border-blue-500/30 transition-all">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center text-xl flex-shrink-0">
                        {activity.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white">
                          <span className="font-semibold">{activity.user}</span>
                          {' '}
                          <span className="text-white/60">{activity.action}</span>
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs ${getModuleColor(activity.module)}`}>
                            {activity.module}
                          </span>
                          <span className="text-xs text-white/50">•</span>
                          <span className="text-xs text-white/50">{activity.time}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* LEADERBOARDS TAB */}
        {activeTab === 'leaderboards' && (
          <div className="space-y-6">
            {/* Filter Options */}
            <div className="flex gap-3 overflow-x-auto pb-2">
              <button className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium whitespace-nowrap">
                Global
              </button>
              <button className="px-4 py-2 bg-[#1a1724] text-white/60 border border-white/10 rounded-lg text-sm font-medium whitespace-nowrap hover:text-white hover:border-blue-500/30">
                Friends
              </button>
              <button className="px-4 py-2 bg-[#1a1724] text-white/60 border border-white/10 rounded-lg text-sm font-medium whitespace-nowrap hover:text-white hover:border-blue-500/30">
                Guild
              </button>
              <button className="px-4 py-2 bg-[#1a1724] text-white/60 border border-white/10 rounded-lg text-sm font-medium whitespace-nowrap hover:text-white hover:border-blue-500/30">
                This Week
              </button>
            </div>

            {/* Leaderboard List */}
            <div className="space-y-2">
              {leaderboards.global.map((user) => (
                <div
                  key={user.rank}
                  className={`
                    flex items-center gap-4 p-4 rounded-xl transition-all
                    ${user.isYou
                      ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-2 border-blue-500/50'
                      : 'bg-[#1a1724] border border-white/10 hover:border-blue-500/30'
                    }
                  `}
                >
                  {/* Rank */}
                  <div className="w-8 text-center">
                    {user.rank <= 3 ? (
                      <Crown className={`w-6 h-6 mx-auto ${
                        user.rank === 1 ? 'text-yellow-400' :
                        user.rank === 2 ? 'text-gray-300' :
                        'text-orange-400'
                      }`} />
                    ) : (
                      <span className="text-white/60 font-semibold">#{user.rank}</span>
                    )}
                  </div>

                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center text-2xl flex-shrink-0">
                    {user.avatar}
                  </div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-white flex items-center gap-2">
                      {user.name}
                      {user.isYou && <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded">You</span>}
                    </div>
                    <div className="text-sm text-white/60">Level {user.level}</div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Flame className="w-4 h-4 text-orange-400" />
                      <span className="text-white font-medium">{user.streak}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Zap className="w-4 h-4 text-purple-400" />
                      <span className="text-white font-medium">{user.xp.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* GUILDS TAB */}
        {activeTab === 'guilds' && (
          <div className="space-y-6">
            {/* My Guild */}
            {guilds.find(g => g.isMember) && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-400" />
                  My Guild
                </h3>
                <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-2xl p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-green-500/30 to-emerald-500/30 flex items-center justify-center text-3xl flex-shrink-0">
                      {guilds[0].icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xl font-bold text-white mb-1">{guilds[0].name}</h4>
                      <p className="text-sm text-white/60 mb-3">{guilds[0].description}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4 text-green-400" />
                          <span className="text-white">{guilds[0].members}/{guilds[0].maxMembers}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Flame className="w-4 h-4 text-orange-400" />
                          <span className="text-white">{guilds[0].streak} day streak</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Zap className="w-4 h-4 text-purple-400" />
                          <span className="text-white">{guilds[0].totalXP.toLocaleString()} XP</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors flex items-center justify-center gap-2">
                      <MessageCircle className="w-4 h-4" />
                      Guild Chat
                    </button>
                    <button className="px-4 py-2 bg-white/5 text-white rounded-lg font-medium hover:bg-white/10 transition-colors">
                      View Members
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Browse Guilds */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Globe className="w-5 h-5 text-blue-400" />
                  Browse Guilds
                </h3>
                <button className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors">
                  Create Guild
                </button>
              </div>

              <div className="space-y-3">
                {guilds.filter(g => !g.isMember).map((guild) => (
                  <div key={guild.id} className="bg-[#1a1724] border border-white/10 rounded-xl p-4 hover:border-blue-500/30 transition-all">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center text-2xl flex-shrink-0">
                        {guild.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-lg font-semibold text-white mb-1">{guild.name}</h4>
                        <p className="text-sm text-white/60 mb-3">{guild.description}</p>
                        <div className="flex items-center gap-4 text-sm mb-3">
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4 text-white/60" />
                            <span className="text-gray-300">{guild.members}/{guild.maxMembers}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Flame className="w-4 h-4 text-orange-400" />
                            <span className="text-gray-300">{guild.streak} days</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Zap className="w-4 h-4 text-purple-400" />
                            <span className="text-gray-300">{guild.totalXP.toLocaleString()}</span>
                          </div>
                        </div>
                        <button className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors">
                          Join Guild
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* FRIENDS TAB */}
        {activeTab === 'friends' && (
          <div className="space-y-6">
            {/* Friend Requests */}
            {pendingRequests.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-blue-400" />
                  Pending Requests ({pendingRequests.length})
                </h3>
                <div className="space-y-3">
                  {pendingRequests.map((request) => (
                    <div key={request.id} className="bg-[#1a1724] border border-white/10 rounded-xl p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center text-2xl flex-shrink-0">
                          {request.avatar}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-white">{request.name}</div>
                          <div className="text-sm text-white/60">Level {request.level} • {request.mutualFriends} mutual friends</div>
                        </div>
                        <div className="flex gap-2">
                          <button className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                            <Check className="w-4 h-4" />
                          </button>
                          <button className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Search Friends */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60" />
              <input
                type="text"
                placeholder="Search for friends..."
                className="w-full pl-10 pr-4 py-3 bg-[#1a1724] border border-white/10 rounded-xl text-white placeholder-gray-400 focus:border-blue-500/50 focus:outline-none"
              />
            </div>

            {/* Friends List */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Users className="w-5 h-5 text-green-400" />
                Your Friends ({friends.length})
              </h3>
              <div className="space-y-3">
                {friends.map((friend) => (
                  <div key={friend.id} className="bg-[#1a1724] border border-white/10 rounded-xl p-4 hover:border-blue-500/30 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center text-2xl flex-shrink-0">
                          {friend.avatar}
                        </div>
                        {friend.online && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#1a1a1a] rounded-full"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-white">{friend.name}</div>
                        <div className="text-sm text-white/60">{friend.relationship}</div>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="text-center">
                          <div className="text-white font-medium">Lv.{friend.level}</div>
                          <div className="text-xs text-white/50">Level</div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Flame className="w-4 h-4 text-orange-400" />
                          <span className="text-white font-medium">{friend.streak}</span>
                        </div>
                      </div>
                      <button className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors">
                        View Profile
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* CHALLENGES TAB */}
        {activeTab === 'challenges' && (
          <div className="space-y-6">
            {/* Active Challenges */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Target className="w-5 h-5 text-orange-400" />
                Active Challenges
              </h3>
              <div className="space-y-4">
                {activeChallenges.map((challenge) => (
                  <div key={challenge.id} className="bg-[#1a1724] border border-white/10 rounded-xl p-5 hover:border-orange-500/30 transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-lg font-semibold text-white">{challenge.title}</h4>
                          <span className={`text-xs px-2 py-0.5 rounded ${
                            challenge.type === 'guild'
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-blue-500/20 text-blue-400'
                          }`}>
                            {challenge.type === 'guild' ? 'Guild' : 'Individual'}
                          </span>
                        </div>
                        <p className="text-sm text-white/60 mb-3">{challenge.description}</p>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1 text-gray-300">
                            <Users className="w-4 h-4" />
                            <span>{challenge.participants} participants</span>
                          </div>
                          <div className="flex items-center gap-1 text-orange-400">
                            <Clock className="w-4 h-4" />
                            <span>{challenge.endsIn}</span>
                          </div>
                          <div className="flex items-center gap-1 text-purple-400">
                            <Award className="w-4 h-4" />
                            <span>{challenge.reward}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-white/60">Progress</span>
                        <span className="text-white font-medium">
                          {challenge.type === 'guild'
                            ? `${challenge.progress.toLocaleString()} / ${challenge.total.toLocaleString()} XP`
                            : `${challenge.progress} / ${challenge.total} days`
                          }
                        </span>
                      </div>
                      <div className="h-2 bg-[#0c0a10] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-500"
                          style={{ width: `${(challenge.progress / challenge.total) * 100}%` }}
                        />
                      </div>
                    </div>

                    <button className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors">
                      View Details
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Browse More Challenges */}
            <button className="w-full px-6 py-3 bg-[#1a1724] border border-white/10 text-white rounded-xl font-medium hover:border-orange-500/30 hover:bg-[#221e2e] transition-all flex items-center justify-center gap-2">
              Browse More Challenges
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
