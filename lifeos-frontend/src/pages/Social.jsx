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
import usePvpStore from '../stores/pvpStore';
import usePvpArenaStore from '../stores/pvpArenaStore';
import ActiveBattleCard from '../components/pvp/ActiveBattleCard';
import PvPInviteModal from '../components/pvp/PvPInviteModal';
import BattleView from '../components/pvp/BattleView';
import LoadoutManager from '../components/pvp/LoadoutManager';
import PvPArena from '../components/pvp/PvPArena';
import { getRankInfo } from '../utils/pvpCalculations';

export default function Social() {
  const [activeTab, setActiveTab] = useState('feed');
  const [leaderboardType, setLeaderboardType] = useState('global');
  const [searchQuery, setSearchQuery] = useState('');
  const [showPrivacySettings, setShowPrivacySettings] = useState(false);
  const [showCreateChallengeModal, setShowCreateChallengeModal] = useState(false);
  const [showAddFriendModal, setShowAddFriendModal] = useState(false);
  const [showCreateGuildModal, setShowCreateGuildModal] = useState(false);
  const [showJoinLeaderboardModal, setShowJoinLeaderboardModal] = useState(false);
  const [showPvPInviteModal, setShowPvPInviteModal] = useState(false);
  const [selectedBattle, setSelectedBattle] = useState(null);
  const [pvpSubTab, setPvpSubTab] = useState('arena'); // arena, battles, loadout, history
  const [showArena, setShowArena] = useState(false);

  // Connect to gamification store for user's own stats
  const { level, totalXP, globalStreak, odoo } = useGamificationStore();
  const currentStreak = globalStreak?.current_streak || 0;
  const userId = odoo;

  // Connect to PvP store (daily task-based)
  const {
    activeBattles,
    pendingInvites: pvpPendingInvites,
    userStats: pvpUserStats,
    isLoading: pvpLoading,
    initialize: initializePvp,
    fetchBattleHistory,
  } = usePvpStore();

  // Connect to PvP Arena store (real-time combat)
  const {
    arenaStats,
    inQueue,
    isInMatch,
    matchHistory: arenaMatchHistory,
    initialize: initializeArena,
    fetchMatchHistory: fetchArenaMatchHistory,
  } = usePvpArenaStore();

  const [pvpBattleHistory, setPvpBattleHistory] = useState([]);

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

  // Initialize PvP data
  useEffect(() => {
    if (userId) {
      initializePvp(userId);
      initializeArena(userId);
    }
  }, [userId, initializePvp, initializeArena]);

  // Fetch PvP battle history when switching to history tab
  useEffect(() => {
    if (activeTab === 'pvp' && pvpSubTab === 'history' && userId) {
      // Fetch both daily battles and arena matches
      fetchBattleHistory(userId).then(setPvpBattleHistory);
      fetchArenaMatchHistory(userId);
    }
  }, [activeTab, pvpSubTab, userId, fetchArenaMatchHistory]);

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
    { id: 'pvp', label: 'PvP Arena', icon: Swords, badge: pvpPendingInvites.length },
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
        subtitle="Connect with friends, join guilds, and climb the leaderboards"
        stats={`${friends.length} friends${userStats.rank !== '-' ? ` · Rank #${userStats.rank}` : ''}`}
        icon={Heart}
        module="social"
        variant="elevated"
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

          {/* PVP ARENA TAB */}
          {!loading && activeTab === 'pvp' && (
            <div className="space-y-6" data-tour="social-pvp-section">
              {/* If viewing a specific battle */}
              {selectedBattle ? (
                <BattleView
                  battleId={selectedBattle}
                  onBack={() => setSelectedBattle(null)}
                />
              ) : (
                <>
                  {/* Real-Time Arena Quick Match Banner */}
                  <button
                    onClick={() => setShowArena(true)}
                    className="w-full p-6 bg-gradient-to-r from-red-500/20 via-orange-500/20 to-yellow-500/20 border border-red-500/30 rounded-2xl hover:from-red-500/30 hover:via-orange-500/30 hover:to-yellow-500/30 transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl shadow-lg shadow-red-500/30 group-hover:scale-110 transition-transform">
                          <Swords className="w-8 h-8 text-white" />
                        </div>
                        <div className="text-left">
                          <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            Quick Match Arena
                            <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full animate-pulse">LIVE</span>
                          </h3>
                          <p className="text-white/60">Real-time tap combat against other players. Use your gear and abilities!</p>
                        </div>
                      </div>
                      <ChevronRight className="w-6 h-6 text-white/40 group-hover:text-white group-hover:translate-x-1 transition-all" />
                    </div>
                  </button>

                  {/* Arena Stats Overview */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {/* Arena Rank */}
                    <div className="bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/20 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl">{getRankInfo(arenaStats?.rank_tier || 'bronze').icon}</span>
                        <span className="text-xs text-white/50">Arena Rank</span>
                      </div>
                      <p className="text-lg font-bold" style={{ color: getRankInfo(arenaStats?.rank_tier || 'bronze').color }}>
                        {getRankInfo(arenaStats?.rank_tier || 'bronze').name}
                      </p>
                      <p className="text-xs text-white/40">ELO: {arenaStats?.arena_elo || 1000}</p>
                    </div>

                    {/* Arena Record */}
                    <div className="bg-[#1a1724] border border-white/10 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Trophy className="w-4 h-4 text-yellow-400" />
                        <span className="text-xs text-white/50">Arena Record</span>
                      </div>
                      <p className="text-lg font-bold text-white">
                        {arenaStats?.wins || 0}W - {arenaStats?.losses || 0}L
                      </p>
                      <p className="text-xs text-white/40">{arenaStats?.total_matches || 0} total matches</p>
                    </div>

                    {/* Arena Win Streak */}
                    <div className="bg-[#1a1724] border border-white/10 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Flame className="w-4 h-4 text-orange-400" />
                        <span className="text-xs text-white/50">Win Streak</span>
                      </div>
                      <p className="text-lg font-bold text-white">{arenaStats?.current_win_streak || 0}</p>
                      <p className="text-xs text-white/40">Best: {arenaStats?.longest_win_streak || 0}</p>
                    </div>

                    {/* Arena Combat Stats */}
                    <div className="bg-[#1a1724] border border-white/10 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Target className="w-4 h-4 text-purple-400" />
                        <span className="text-xs text-white/50">Total Taps</span>
                      </div>
                      <p className="text-lg font-bold text-white">{(arenaStats?.total_taps || 0).toLocaleString()}</p>
                      <p className="text-xs text-white/40">{(arenaStats?.total_damage_dealt || 0).toLocaleString()} damage</p>
                    </div>
                  </div>

                  {/* Pending PvP Invites Banner */}
                  {pvpPendingInvites.length > 0 && (
                    <button
                      onClick={() => setShowPvPInviteModal(true)}
                      className="w-full p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl flex items-center justify-between hover:from-purple-500/30 hover:to-pink-500/30 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-500/30 rounded-lg">
                          <Users className="w-5 h-5 text-purple-400" />
                        </div>
                        <div className="text-left">
                          <p className="font-semibold text-white">
                            {pvpPendingInvites.length} Daily Battle Challenge{pvpPendingInvites.length > 1 ? 's' : ''}
                          </p>
                          <p className="text-sm text-white/60">Task-based challenges from friends</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-white/40" />
                    </button>
                  )}

                  {/* PvP Sub-tabs */}
                  <div className="flex gap-2 bg-[#1a1724] p-1 rounded-xl w-fit overflow-x-auto">
                    {[
                      { id: 'arena', label: 'Arena Stats' },
                      { id: 'battles', label: 'Daily Battles' },
                      { id: 'loadout', label: 'Loadout' },
                      { id: 'history', label: 'History' },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setPvpSubTab(tab.id)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                          pvpSubTab === tab.id
                            ? 'bg-red-500/20 text-red-400'
                            : 'text-white/60 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Arena Stats Tab */}
                  {pvpSubTab === 'arena' && (
                    <div className="space-y-4">
                      {/* Enter Arena Button */}
                      <button
                        onClick={() => setShowArena(true)}
                        className="w-full p-4 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all shadow-lg shadow-red-500/30 hover:shadow-red-500/50"
                      >
                        <Swords className="w-6 h-6" />
                        Enter Arena
                      </button>

                      {/* Arena Info */}
                      <div className="bg-[#1a1724] border border-white/10 rounded-xl p-6">
                        <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
                          <Zap className="w-5 h-5 text-yellow-400" />
                          How Arena Works
                        </h4>
                        <ul className="space-y-3 text-sm text-white/70">
                          <li className="flex items-start gap-2">
                            <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-xs text-red-400">1</span>
                            </div>
                            <span><strong className="text-white">Queue up</strong> for Casual or Ranked matches based on your level</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <div className="w-5 h-5 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-xs text-orange-400">2</span>
                            </div>
                            <span><strong className="text-white">Tap to attack!</strong> Your damage is based on your level and equipped gear</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <div className="w-5 h-5 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-xs text-yellow-400">3</span>
                            </div>
                            <span><strong className="text-white">Use weapon abilities</strong> for massive damage with cooldowns</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-xs text-green-400">4</span>
                            </div>
                            <span><strong className="text-white">Win to earn</strong> XP, Credits, and climb the ranked ladder!</span>
                          </li>
                        </ul>
                      </div>

                      {/* Season Stats */}
                      {arenaStats && arenaStats.total_matches > 0 && (
                        <div className="bg-[#1a1724] border border-white/10 rounded-xl p-4">
                          <h4 className="font-semibold text-white mb-3">Season Stats</h4>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-white/50">Win Rate</p>
                              <p className="text-xl font-bold text-green-400">
                                {arenaStats.total_matches > 0
                                  ? Math.round((arenaStats.wins / arenaStats.total_matches) * 100)
                                  : 0}%
                              </p>
                            </div>
                            <div>
                              <p className="text-white/50">Season High ELO</p>
                              <p className="text-xl font-bold text-purple-400">{arenaStats.season_high_elo}</p>
                            </div>
                            <div>
                              <p className="text-white/50">XP Earned</p>
                              <p className="text-xl font-bold text-yellow-400">{arenaStats.total_xp_earned?.toLocaleString() || 0}</p>
                            </div>
                            <div>
                              <p className="text-white/50">Credits Earned</p>
                              <p className="text-xl font-bold text-amber-400">{arenaStats.total_credits_earned?.toLocaleString() || 0}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Active Daily Battles */}
                  {pvpSubTab === 'battles' && (
                    <div>
                      <p className="text-sm text-white/50 mb-4">Multi-day task-based battles where completing tasks deals damage</p>
                      {activeBattles.length === 0 ? (
                        <div className="bg-[#1a1724] border border-white/10 rounded-xl p-8 text-center">
                          <Users className="w-12 h-12 text-purple-400 mx-auto mb-3 opacity-60" />
                          <h4 className="text-white font-medium mb-2">No Active Daily Battles</h4>
                          <p className="text-white/50 text-sm mb-4">
                            Challenge a friend to a multi-day battle! Complete tasks to deal damage.
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {activeBattles.map((battle) => (
                            <ActiveBattleCard
                              key={battle.id}
                              battle={battle}
                              userId={userId}
                              onClick={() => setSelectedBattle(battle.id)}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Loadout Manager */}
                  {pvpSubTab === 'loadout' && (
                    <LoadoutManager userId={userId} />
                  )}

                  {/* Battle History */}
                  {pvpSubTab === 'history' && (
                    <div className="space-y-4">
                      {/* Arena Match History */}
                      {arenaMatchHistory.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-white/50 mb-2 flex items-center gap-2">
                            <Swords className="w-4 h-4" />
                            Arena Matches
                          </h4>
                          <div className="space-y-2">
                            {arenaMatchHistory.map((match) => {
                              const isPlayer1 = match.player1_id === userId;
                              const won = match.winner_id === userId;
                              const opponentName = match.opponentProfile?.display_name || 'Unknown';

                              return (
                                <div
                                  key={match.id}
                                  className={`p-4 rounded-xl border ${
                                    won
                                      ? 'bg-green-500/10 border-green-500/30'
                                      : 'bg-red-500/10 border-red-500/30'
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <div className={`p-2 rounded-lg ${won ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                                        {won ? (
                                          <Trophy className="w-5 h-5 text-green-400" />
                                        ) : (
                                          <Shield className="w-5 h-5 text-red-400" />
                                        )}
                                      </div>
                                      <div className="flex items-center gap-2">
                                        {match.opponentProfile?.avatar_url ? (
                                          <img
                                            src={match.opponentProfile.avatar_url}
                                            alt={opponentName}
                                            className="w-8 h-8 rounded-full object-cover"
                                          />
                                        ) : (
                                          <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
                                            <span className="text-sm font-bold text-red-400">
                                              {opponentName[0]?.toUpperCase() || '?'}
                                            </span>
                                          </div>
                                        )}
                                        <div>
                                          <p className={`font-semibold ${won ? 'text-green-400' : 'text-red-400'}`}>
                                            {won ? 'Victory' : 'Defeat'}
                                          </p>
                                          <p className="text-sm text-white/50">
                                            vs {opponentName}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-sm text-white/60 capitalize">{match.match_type} Arena</p>
                                      <p className="text-xs text-white/40">
                                        {match.ended_at ? new Date(match.ended_at).toLocaleDateString() : '-'}
                                      </p>
                                      {match.winner_xp && (
                                        <p className="text-xs text-purple-400 mt-1">
                                          +{won ? match.winner_xp : match.loser_xp} XP
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Daily Battle History */}
                      {pvpBattleHistory.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-white/50 mb-2 flex items-center gap-2">
                            <Target className="w-4 h-4" />
                            Daily Battles
                          </h4>
                          <div className="space-y-2">
                            {pvpBattleHistory.map((battle) => {
                              const isPlayer1 = battle.player1_id === userId;
                              const won = battle.winner_id === userId;
                              const isDraw = !battle.winner_id;

                              return (
                                <div
                                  key={battle.id}
                                  className={`p-4 rounded-xl border ${
                                    isDraw
                                      ? 'bg-[#1a1724] border-white/10'
                                      : won
                                      ? 'bg-green-500/10 border-green-500/30'
                                      : 'bg-red-500/10 border-red-500/30'
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <div className={`p-2 rounded-lg ${
                                        isDraw ? 'bg-white/10' : won ? 'bg-green-500/20' : 'bg-red-500/20'
                                      }`}>
                                        {isDraw ? (
                                          <Users className="w-5 h-5 text-white/60" />
                                        ) : won ? (
                                          <Trophy className="w-5 h-5 text-green-400" />
                                        ) : (
                                          <Shield className="w-5 h-5 text-red-400" />
                                        )}
                                      </div>
                                      <div>
                                        <p className={`font-semibold ${
                                          isDraw ? 'text-white/70' : won ? 'text-green-400' : 'text-red-400'
                                        }`}>
                                          {isDraw ? 'Draw' : won ? 'Victory' : 'Defeat'}
                                        </p>
                                        <p className="text-sm text-white/50">
                                          vs Player {(isPlayer1 ? battle.player2_id : battle.player1_id)?.slice(0, 8)}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-sm text-white/60 capitalize">{battle.battle_type}</p>
                                      <p className="text-xs text-white/40">
                                        {new Date(battle.updated_at).toLocaleDateString()}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Empty State */}
                      {arenaMatchHistory.length === 0 && pvpBattleHistory.length === 0 && (
                        <div className="bg-[#1a1724] border border-white/10 rounded-xl p-8 text-center">
                          <Clock className="w-12 h-12 text-white/40 mx-auto mb-3" />
                          <h4 className="text-white font-medium mb-2">No Battle History</h4>
                          <p className="text-white/50 text-sm">Complete battles to see them here</p>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
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
      {showPvPInviteModal && (
        <PvPInviteModal
          invites={pvpPendingInvites}
          onClose={() => setShowPvPInviteModal(false)}
        />
      )}
      {showArena && (
        <PvPArena onClose={() => setShowArena(false)} />
      )}
    </div>
  );
}
