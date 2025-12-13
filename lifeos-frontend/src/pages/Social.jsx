import React, { useState, useEffect } from 'react';
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
  Send,
  Heart,
  Construction,
  UserMinus,
  Ban,
  Flag,
  MoreVertical,
  RefreshCw,
  Plus,
  Settings,
  Eye,
  EyeOff,
  Swords,
} from 'lucide-react';
import PageHeader from '../components/shared/PageHeader';
import Card from '../components/ui/Card';
import { useGamificationStore } from '../stores/gamificationStore';
import { useSocialStore } from '../stores/socialStore';
import GuildManagement from '../components/social/GuildManagement';
import CreateChallengeModal from '../components/social/CreateChallengeModal';
import HeadToHeadChallenges from '../components/social/HeadToHeadChallenges';
import AddFriendModal from '../components/social/AddFriendModal';
import CreateGuildModal from '../components/social/CreateGuildModal';
import ActivityFeedItem from '../components/social/ActivityFeedItem';
import JoinLeaderboardModal from '../components/social/JoinLeaderboardModal';

export default function Social() {
  const [activeTab, setActiveTab] = useState('feed');
  const [leaderboardType, setLeaderboardType] = useState('global');
  const [searchQuery, setSearchQuery] = useState('');
  const [showPrivacySettings, setShowPrivacySettings] = useState(false);
  const [showCreateChallengeModal, setShowCreateChallengeModal] = useState(false);
  const [showAddFriendModal, setShowAddFriendModal] = useState(false);
  const [showCreateGuildModal, setShowCreateGuildModal] = useState(false);
  const [showJoinLeaderboardModal, setShowJoinLeaderboardModal] = useState(false);

  // Connect to gamification store for user's own stats
  const { level, totalXP, globalStreak } = useGamificationStore();
  const currentStreak = globalStreak?.current_streak || 0;

  // Connect to social store
  const {
    socialProfile,
    friends,
    pendingRequests,
    sentRequests,
    blockedUsers,
    onlineFriends,
    currentGuild,
    guildMembers,
    availableGuilds,
    feed,
    feedLoading,
    leaderboards,
    myRanks,
    availableChallenges,
    myChallenges,
    loading,
    initializeSocial,
    fetchActivityFeed,
    fetchGuilds,
    fetchChallenges,
    acceptFriendRequest,
    declineFriendRequest,
    removeFriend,
    blockUser,
    joinGuild,
    leaveGuild,
    joinChallenge,
  } = useSocialStore();

  // Initialize social data on mount
  useEffect(() => {
    initializeSocial();
  }, []);

  // User stats from real data
  const userStats = {
    rank: myRanks.global || '-',
    xp: totalXP,
    streak: currentStreak,
    level: level,
    guildName: currentGuild?.name || null,
    percentile: myRanks.percentile || null,
  };

  const TABS = [
    { id: 'feed', label: 'Feed', icon: Users },
    { id: 'leaderboards', label: 'Leaderboards', icon: Trophy },
    { id: 'guilds', label: 'Guilds', icon: Shield },
    { id: 'friends', label: 'Friends', icon: UserPlus, badge: pendingRequests.length },
    { id: 'challenges', label: 'Challenges', icon: Target },
  ];

  const getModuleColor = (module) => {
    const colors = {
      'Health': 'text-green-400',
      'Productivity': 'text-blue-400',
      'Knowledge': 'text-purple-400',
      'Character': 'text-pink-400',
      'Social': 'text-yellow-400',
      'level_up': 'text-purple-400',
      'achievement': 'text-yellow-400',
      'streak_milestone': 'text-orange-400',
      'guild_join': 'text-green-400',
      'challenge_complete': 'text-blue-400',
    };
    return colors[module] || 'text-white/60';
  };

  const getEventTypeLabel = (eventType) => {
    const labels = {
      'level_up': 'leveled up',
      'achievement': 'earned an achievement',
      'streak_milestone': 'reached a streak milestone',
      'guild_join': 'joined a guild',
      'challenge_complete': 'completed a challenge',
      'personal_record': 'set a new personal record',
    };
    return labels[eventType] || eventType;
  };

  const formatTimeAgo = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        title="Social"
        stats={`${friends.length} friends${userStats.rank !== '-' ? ` · Rank #${userStats.rank}` : ''}`}
        icon={Heart}
        module="social"
        variant="icon"
      />

      {/* Tab Navigation */}
      <Card padding="none" data-tour="social-tabs">
        <div className="flex border-b border-border overflow-x-auto scrollbar-hide">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                data-tour={`social-tab-${tab.id}`}
                className={`
                  flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-3 sm:py-4 text-xs sm:text-sm font-medium relative
                  border-b-2 -mb-px transition-all duration-fast whitespace-nowrap flex-shrink-0
                  ${isActive
                    ? 'border-pink-500 text-text-high bg-muted'
                    : 'border-transparent text-text-med hover:text-text-high hover:bg-muted/50'
                  }
                `}
              >
                <Icon size={16} className="sm:w-[18px] sm:h-[18px] flex-shrink-0" />
                <span>{tab.label}</span>
                {tab.badge > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-4 h-4 sm:w-5 sm:h-5 bg-pink-500 text-white text-[10px] sm:text-xs rounded-full flex items-center justify-center">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-8 h-8 text-purple-400 animate-spin" />
            </div>
          )}

          {/* FEED TAB */}
          {!loading && activeTab === 'feed' && (
            <div className="space-y-6" data-tour="social-feed-section">
              {/* Your Daily Summary */}
              <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-6">
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
                    <div className="text-2xl font-bold text-green-400">
                      {userStats.rank !== '-' ? `#${userStats.rank}` : '-'}
                    </div>
                    <div className="text-xs text-white/60">Global Rank</div>
                  </div>
                </div>
                {userStats.percentile && (
                  <div className="mt-4 text-center">
                    <span className="text-sm text-white/60">
                      You're in the top <span className="text-purple-400 font-semibold">{userStats.percentile}%</span> of all users!
                    </span>
                  </div>
                )}
              </div>

              {/* Activity Feed */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-purple-400" />
                    Recent Activity
                  </h3>
                  <button
                    onClick={() => fetchActivityFeed(0)}
                    className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                  </button>
                </div>

                {feed.length === 0 ? (
                  <div className="bg-[#1a1724] border border-white/10 rounded-xl p-8 text-center">
                    <Construction className="w-12 h-12 text-purple-400 mx-auto mb-3 opacity-60" />
                    <h4 className="text-white font-medium mb-2">No Activity Yet</h4>
                    <p className="text-white/50 text-sm">
                      Activity from you and your friends will appear here. Add friends to see their achievements!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {feed.map((activity) => (
                      <ActivityFeedItem
                        key={activity.id}
                        activity={activity}
                        getEventTypeLabel={getEventTypeLabel}
                        getModuleColor={getModuleColor}
                        formatTimeAgo={formatTimeAgo}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* LEADERBOARDS TAB */}
          {!loading && activeTab === 'leaderboards' && (
            <div className="space-y-6" data-tour="social-leaderboards-section">
              {/* Leaderboard Opt-in Notice */}
              {!socialProfile?.show_on_leaderboards && (
                <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <EyeOff className="w-5 h-5 text-purple-400 flex-shrink-0" />
                      <div>
                        <p className="text-white font-medium">You're not on the leaderboards</p>
                        <p className="text-white/60 text-sm">Opt-in to compete with other users</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowJoinLeaderboardModal(true)}
                      className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 w-full sm:w-auto justify-center"
                    >
                      <Trophy className="w-4 h-4" />
                      Join Leaderboards
                    </button>
                  </div>
                </div>
              )}

              {/* Filter Options */}
              <div className="flex gap-3 overflow-x-auto pb-2" data-tour="leaderboard">
                {['global', 'weekly', 'streak'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setLeaderboardType(type)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                      leaderboardType === type
                        ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20'
                        : 'bg-[#1a1724] text-white/60 border border-white/10 hover:text-white hover:border-purple-500/30'
                    }`}
                  >
                    {type === 'global' ? 'All-Time XP' : type === 'weekly' ? 'Weekly XP' : 'Streaks'}
                  </button>
                ))}
              </div>

              {/* Leaderboard List */}
              {leaderboards[leaderboardType]?.length === 0 ? (
                <div className="bg-[#1a1724] border border-white/10 rounded-xl p-8 text-center">
                  <Trophy className="w-12 h-12 text-yellow-400 mx-auto mb-3 opacity-60" />
                  <h4 className="text-white font-medium mb-2">No Rankings Yet</h4>
                  <p className="text-white/50 text-sm">
                    Be the first to join the leaderboard! Opt-in above to start competing.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {leaderboards[leaderboardType]?.map((entry, index) => {
                    const isCurrentUser = entry.userId === socialProfile?.user_id;
                    const rank = entry.rank || index + 1;

                    return (
                      <div
                        key={entry.userId}
                        className={`
                          flex items-center gap-4 p-4 rounded-xl transition-all duration-150
                          ${isCurrentUser
                            ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-2 border-purple-500/50'
                            : 'bg-[#1a1724] border border-white/10 hover:border-purple-500/30'
                          }
                        `}
                      >
                        <div className="w-8 text-center">
                          {rank <= 3 ? (
                            <Crown className={`w-6 h-6 mx-auto ${
                              rank === 1 ? 'text-yellow-400' :
                              rank === 2 ? 'text-gray-300' :
                              'text-orange-400'
                            }`} />
                          ) : (
                            <span className="text-white/60 font-semibold">#{rank}</span>
                          )}
                        </div>
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center text-2xl flex-shrink-0 overflow-hidden">
                          {entry.profile?.avatar_url ? (
                            <img src={entry.profile.avatar_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span>{entry.profile?.display_name?.[0] || '?'}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-white flex items-center gap-2">
                            {entry.profile?.display_name || 'Anonymous'}
                            {isCurrentUser && <span className="text-xs bg-purple-500 text-white px-2 py-0.5 rounded">You</span>}
                          </div>
                          <div className="text-sm text-white/60">
                            Level {entry.profile?.current_level || 1}
                            {entry.profile?.title && ` · ${entry.profile.title}`}
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          {leaderboardType === 'streak' ? (
                            <div className="flex items-center gap-1">
                              <Flame className="w-4 h-4 text-orange-400" />
                              <span className="text-white font-medium">{Math.floor(entry.score)}</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1">
                              <Zap className="w-4 h-4 text-purple-400" />
                              <span className="text-white font-medium">{Math.floor(entry.score).toLocaleString()}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Your Position */}
              {socialProfile?.show_on_leaderboards && myRanks[leaderboardType] && (
                <div className="bg-[#1a1724] border border-purple-500/30 rounded-xl p-4 text-center">
                  <p className="text-white/60 text-sm">Your {leaderboardType} rank</p>
                  <p className="text-2xl font-bold text-purple-400">#{myRanks[leaderboardType]}</p>
                </div>
              )}
            </div>
          )}

          {/* GUILDS TAB */}
          {!loading && activeTab === 'guilds' && (
            <div className="space-y-6" data-tour="social-guilds-section">
              {/* Current Guild */}
              {currentGuild ? (
                <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-2xl p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-xl bg-green-500/20 flex items-center justify-center">
                        <Shield className="w-8 h-8 text-green-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">{currentGuild.name}</h3>
                        <p className="text-sm text-white/60">
                          {currentGuild.member_count} members · Your role: {currentGuild.myRole}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={leaveGuild}
                      className="text-red-400 hover:text-red-300 text-sm"
                    >
                      Leave Guild
                    </button>
                  </div>
                  {currentGuild.description && (
                    <p className="text-white/70 text-sm mb-4">{currentGuild.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Zap className="w-4 h-4 text-green-400" />
                      <span className="text-white">{currentGuild.total_xp?.toLocaleString() || 0} Guild XP</span>
                    </div>
                  </div>

                  {/* Guild Members */}
                  {guildMembers.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-green-500/20">
                      <h4 className="text-sm font-medium text-white mb-3">Members</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {guildMembers.slice(0, 6).map((member) => (
                          <div key={member.id} className="flex items-center gap-2 p-2 bg-green-500/10 rounded-lg">
                            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-sm overflow-hidden">
                              {member.user?.avatar_url ? (
                                <img src={member.user.avatar_url} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <span>{member.user?.display_name?.[0] || '?'}</span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-white truncate">{member.user?.display_name || 'Member'}</p>
                              <p className="text-xs text-white/50">{member.role}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Guild Management Panel (for officers and owners) */}
                  {(currentGuild.myRole === 'owner' || currentGuild.myRole === 'officer') && (
                    <div className="mt-4 pt-4 border-t border-green-500/20">
                      <GuildManagement />
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-[#1a1724] border border-white/10 rounded-xl p-6 text-center">
                  <Shield className="w-12 h-12 text-green-400 mx-auto mb-3 opacity-60" />
                  <h4 className="text-white font-medium mb-2">You're not in a guild</h4>
                  <p className="text-white/50 text-sm mb-4">
                    Join a guild to collaborate with others and earn bonus rewards together.
                  </p>
                  <button
                    onClick={() => setShowCreateGuildModal(true)}
                    className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium inline-flex items-center gap-2 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Create Guild
                  </button>
                </div>
              )}

              {/* Available Guilds */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-white">Available Guilds</h3>
                  <div className="flex items-center gap-2">
                    {!currentGuild && (
                      <button
                        onClick={() => setShowCreateGuildModal(true)}
                        className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Create
                      </button>
                    )}
                    <button
                      onClick={fetchGuilds}
                      className="text-sm text-green-400 hover:text-green-300 flex items-center gap-1"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Refresh
                    </button>
                  </div>
                </div>

                {availableGuilds.length === 0 ? (
                  <div className="bg-[#1a1724] border border-white/10 rounded-xl p-6 text-center">
                    <Shield className="w-12 h-12 text-green-400 mx-auto mb-3 opacity-60" />
                    <p className="text-white/60 mb-4">No guilds available yet</p>
                    {!currentGuild && (
                      <button
                        onClick={() => setShowCreateGuildModal(true)}
                        className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium inline-flex items-center gap-2 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Create the First Guild
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {availableGuilds.filter(g => g.id !== currentGuild?.id).map((guild) => (
                      <div key={guild.id} className="bg-[#1a1724] border border-white/10 rounded-xl p-4 hover:border-green-500/30 transition-all">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                              <Shield className="w-5 h-5 text-green-400" />
                            </div>
                            <div>
                              <h4 className="font-medium text-white">{guild.name}</h4>
                              <p className="text-sm text-white/50">
                                {guild.member_count}/{guild.max_members} members
                              </p>
                            </div>
                          </div>
                          {!currentGuild && (
                            <button
                              onClick={() => joinGuild(guild.id)}
                              disabled={guild.privacy === 'invite_only'}
                              className="px-3 py-1.5 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {guild.privacy === 'invite_only' ? 'Invite Only' : guild.privacy === 'apply' ? 'Apply' : 'Join'}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* FRIENDS TAB */}
          {!loading && activeTab === 'friends' && (
            <div className="space-y-6" data-tour="social-friends-section">
              {/* Pending Requests */}
              {pendingRequests.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-yellow-400" />
                    Pending Requests ({pendingRequests.length})
                  </h3>
                  <div className="space-y-2">
                    {pendingRequests.map((request) => (
                      <div key={request.id} className="bg-[#1a1724] border border-yellow-500/30 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center overflow-hidden">
                              {request.requester?.avatar_url ? (
                                <img src={request.requester.avatar_url} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <span>{request.requester?.display_name?.[0] || '?'}</span>
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-white">{request.requester?.display_name || 'User'}</p>
                              <p className="text-sm text-white/50">Level {request.requester?.current_level || 1}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => acceptFriendRequest(request.id)}
                              className="p-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-colors"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => declineFriendRequest(request.id)}
                              className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Friends List */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-400" />
                    Friends ({friends.length})
                  </h3>
                  <button
                    onClick={() => setShowAddFriendModal(true)}
                    data-tour="add-friend-btn"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                  >
                    <UserPlus className="w-4 h-4" />
                    Add Friend
                  </button>
                </div>

                {friends.length === 0 ? (
                  <div className="bg-[#1a1724] border border-white/10 rounded-xl p-8 text-center">
                    <UserPlus className="w-12 h-12 text-blue-400 mx-auto mb-3 opacity-60" />
                    <h4 className="text-white font-medium mb-2">No Friends Yet</h4>
                    <p className="text-white/50 text-sm mb-4">
                      Find friends through guilds, leaderboards, or send friend requests to other users.
                    </p>
                    <button
                      onClick={() => setShowAddFriendModal(true)}
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium inline-flex items-center gap-2 transition-colors"
                    >
                      <UserPlus className="w-4 h-4" />
                      Find Friends
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {friends.map((friend) => {
                      const isOnline = onlineFriends.includes(friend.user_id);

                      return (
                        <div key={friend.friendshipId} className="bg-[#1a1724] border border-white/10 rounded-xl p-4 hover:border-blue-500/30 transition-all">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center overflow-hidden">
                                  {friend.avatar_url ? (
                                    <img src={friend.avatar_url} alt="" className="w-full h-full object-cover" />
                                  ) : (
                                    <span>{friend.display_name?.[0] || '?'}</span>
                                  )}
                                </div>
                                {isOnline && (
                                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-[#1a1724]" />
                                )}
                              </div>
                              <div>
                                <p className="font-medium text-white flex items-center gap-2">
                                  {friend.display_name || 'Friend'}
                                  {isOnline && <span className="text-xs text-green-400">Online</span>}
                                </p>
                                <p className="text-sm text-white/50">
                                  Level {friend.current_level || 1} · {(friend.total_xp || 0).toLocaleString()} XP
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => removeFriend(friend.friendshipId)}
                                className="p-2 text-white/40 hover:text-red-400 transition-colors"
                                title="Remove friend"
                              >
                                <UserMinus className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => blockUser(friend.user_id)}
                                className="p-2 text-white/40 hover:text-red-400 transition-colors"
                                title="Block user"
                              >
                                <Ban className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* CHALLENGES TAB */}
          {!loading && activeTab === 'challenges' && (
            <div className="space-y-6" data-tour="social-challenges-section">
              {/* Create Challenge Button */}
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Challenges</h3>
                <button
                  onClick={() => setShowCreateChallengeModal(true)}
                  data-tour="create-challenge-btn"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Create Challenge
                </button>
              </div>

              {/* Head-to-Head Challenges Section */}
              <HeadToHeadChallenges />

              {/* Active Challenges */}
              {myChallenges.filter(c => c.challenge?.challenge_type !== 'head_to_head').length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-400" />
                    Your Active Challenges
                  </h3>
                  <div className="space-y-3">
                    {myChallenges
                      .filter(p => p.challenge?.challenge_type !== 'head_to_head')
                      .map((participation) => {
                      const challenge = participation.challenge;
                      const progress = (participation.current_value / challenge.target_value) * 100;

                      return (
                        <div key={participation.id} className="bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border border-orange-500/20 rounded-xl p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-medium text-white flex items-center gap-2">
                                <span>{challenge.icon || '🎯'}</span>
                                {challenge.title}
                              </h4>
                              <p className="text-sm text-white/60">{challenge.description}</p>
                            </div>
                            <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-1 rounded">
                              {challenge.xp_reward} XP
                            </span>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-white/60">Progress</span>
                              <span className="text-white">{participation.current_value} / {challenge.target_value}</span>
                            </div>
                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-orange-500 to-yellow-500 transition-all"
                                style={{ width: `${Math.min(progress, 100)}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Available Challenges */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Target className="w-5 h-5 text-orange-400" />
                    Available Challenges
                  </h3>
                  <button
                    onClick={fetchChallenges}
                    className="text-sm text-orange-400 hover:text-orange-300 flex items-center gap-1"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                  </button>
                </div>

                {availableChallenges.length === 0 ? (
                  <div className="bg-[#1a1724] border border-white/10 rounded-xl p-8 text-center">
                    <Target className="w-12 h-12 text-orange-400 mx-auto mb-3 opacity-60" />
                    <h4 className="text-white font-medium mb-2">No Challenges Available</h4>
                    <p className="text-white/50 text-sm">
                      Check back later for new community challenges, or create your own!
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {availableChallenges
                      .filter(c => !myChallenges.find(mc => mc.challenge_id === c.id))
                      .map((challenge) => (
                        <div key={challenge.id} className="bg-[#1a1724] border border-white/10 rounded-xl p-4 hover:border-orange-500/30 transition-all">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-2xl">{challenge.icon || '🎯'}</span>
                              <h4 className="font-medium text-white">{challenge.title}</h4>
                            </div>
                            <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-1 rounded">
                              {challenge.xp_reward} XP
                            </span>
                          </div>
                          <p className="text-sm text-white/60 mb-3">{challenge.description}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-white/40">
                              {challenge.duration_days} days · {challenge.challenge_type}
                            </span>
                            <button
                              onClick={() => joinChallenge(challenge.id)}
                              className="px-3 py-1.5 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 rounded-lg text-sm font-medium transition-colors"
                            >
                              Join
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Modals */}
      <CreateChallengeModal
        isOpen={showCreateChallengeModal}
        onClose={() => setShowCreateChallengeModal(false)}
      />
      <AddFriendModal
        isOpen={showAddFriendModal}
        onClose={() => setShowAddFriendModal(false)}
      />
      <CreateGuildModal
        isOpen={showCreateGuildModal}
        onClose={() => setShowCreateGuildModal(false)}
      />
      <JoinLeaderboardModal
        isOpen={showJoinLeaderboardModal}
        onClose={() => setShowJoinLeaderboardModal(false)}
      />
    </div>
  );
}
