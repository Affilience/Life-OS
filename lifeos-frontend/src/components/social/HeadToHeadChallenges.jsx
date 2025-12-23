/**
 * Head-to-Head Challenges Component
 * Shows pending H2H invites and active H2H challenges
 */

import React, { useState, useEffect } from 'react';
import {
  Swords,
  Clock,
  Check,
  X,
  Trophy,
  Zap,
  User,
  ChevronRight,
  Crown,
  Target,
  Coins,
  AlertCircle,
  History,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { useGamificationStore } from '../../stores/gamificationStore';
import { useSocialStore } from '../../stores/socialStore';
import CreateChallengeModal from './CreateChallengeModal';

export default function HeadToHeadChallenges() {
  const {
    pendingH2HInvites,
    myChallenges,
    friends,
    acceptHeadToHead,
    declineHeadToHead,
    checkAndFinalizeEndedChallenges,
    fetchCompletedH2HChallenges,
    getWagerStats,
  } = useSocialStore();
  const { cosmicCredits } = useGamificationStore();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [acceptingId, setAcceptingId] = useState(null);
  const [acceptError, setAcceptError] = useState(null);
  const [completedChallenges, setCompletedChallenges] = useState([]);
  const [wagerStats, setWagerStats] = useState(null);
  const [showHistory, setShowHistory] = useState(false);

  // Auto-finalize ended challenges and load history on mount
  useEffect(() => {
    const init = async () => {
      // Check for ended challenges that need finalization
      await checkAndFinalizeEndedChallenges();

      // Load completed challenges
      const { data } = await fetchCompletedH2HChallenges();
      setCompletedChallenges(data || []);

      // Load wager stats
      const stats = await getWagerStats();
      setWagerStats(stats);
    };

    init();
  }, []);

  // Filter H2H challenges from myChallenges
  const activeH2H = myChallenges.filter(
    c => c.challenge?.challenge_type === 'head_to_head' && c.challenge?.status === 'active'
  );

  const handleAccept = async (challengeId, wagerAmount) => {
    setAcceptError(null);

    // Check if user has enough credits for the wager
    if (wagerAmount > 0 && cosmicCredits < wagerAmount) {
      setAcceptError({ id: challengeId, message: `Insufficient credits. You need ${wagerAmount} but have ${cosmicCredits}` });
      return;
    }

    setAcceptingId(challengeId);
    const result = await acceptHeadToHead(challengeId);
    setAcceptingId(null);

    if (result?.error) {
      setAcceptError({ id: challengeId, message: result.error });
    }
  };

  const handleDecline = async (challengeId) => {
    await declineHeadToHead(challengeId);
  };

  // Check if user can afford a wager
  const canAffordWager = (amount) => !amount || cosmicCredits >= amount;

  const formatTimeRemaining = (endsAt) => {
    if (!endsAt) return 'No deadline';
    const end = new Date(endsAt);
    const now = new Date();
    const diff = end - now;

    if (diff <= 0) return 'Ended';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days}d ${hours}h left`;
    return `${hours}h left`;
  };

  return (
    <div className="space-y-6">
      {/* Pending Invites */}
      {pendingH2HInvites.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-white/70 mb-3 flex items-center gap-2">
            <Swords className="w-4 h-4 text-orange-400" />
            Challenge Invites
          </h3>
          <div className="space-y-3">
            {pendingH2HInvites.map(invite => {
              const hasWager = invite.wager_amount > 0;
              const canAfford = canAffordWager(invite.wager_amount);

              return (
                <div
                  key={invite.id}
                  className="p-4 bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-xl"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                        {invite.creator?.avatar_url ? (
                          <img
                            src={invite.creator.avatar_url}
                            alt=""
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <User className="w-5 h-5 text-white" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-white">
                          {invite.creator?.display_name || 'Unknown'} challenged you!
                        </p>
                        <p className="text-sm text-white/60">{invite.title}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-yellow-400 font-medium">
                        +{invite.xp_reward} XP
                      </div>
                      <div className="text-xs text-white/50">
                        {invite.duration_days} days
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg mb-3">
                    <div className="flex items-center gap-2 text-white/80">
                      <Target className="w-4 h-4" />
                      <span className="text-sm">
                        Reach {invite.target_value?.toLocaleString()} {invite.metric_type?.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  {/* Wager display */}
                  {hasWager && (
                    <div className={`flex items-center justify-between p-3 rounded-lg mb-3 ${
                      canAfford
                        ? 'bg-amber-500/10 border border-amber-500/30'
                        : 'bg-red-500/10 border border-red-500/30'
                    }`}>
                      <div className="flex items-center gap-2">
                        <Coins className={`w-4 h-4 ${canAfford ? 'text-amber-400' : 'text-red-400'}`} />
                        <span className={`text-sm font-medium ${canAfford ? 'text-amber-400' : 'text-red-400'}`}>
                          Wager: {invite.wager_amount} credits
                        </span>
                      </div>
                      <div className="text-xs text-white/50">
                        {canAfford ? (
                          <span className="text-green-400">Winner takes {invite.wager_amount * 2}</span>
                        ) : (
                          <span className="text-red-400">You need {invite.wager_amount - cosmicCredits} more</span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Error display */}
                  {acceptError?.id === invite.id && (
                    <div className="p-2 bg-red-500/20 border border-red-500/30 rounded-lg mb-3 flex items-center gap-2 text-xs text-red-400">
                      <AlertCircle className="w-4 h-4" />
                      {acceptError.message}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAccept(invite.id, invite.wager_amount)}
                      disabled={!canAfford || acceptingId === invite.id}
                      className={`flex-1 py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-colors ${
                        canAfford
                          ? 'bg-green-500/20 hover:bg-green-500/30 text-green-400'
                          : 'bg-white/5 text-white/30 cursor-not-allowed'
                      }`}
                    >
                      {acceptingId === invite.id ? (
                        'Accepting...'
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          {hasWager ? `Accept (${invite.wager_amount} credits)` : 'Accept Challenge'}
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleDecline(invite.id)}
                      className="py-2.5 px-4 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg flex items-center justify-center gap-2 text-sm font-medium"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Active H2H Challenges */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-white/70 flex items-center gap-2">
            <Swords className="w-4 h-4 text-purple-400" />
            Active Battles
          </h3>
          <button
            onClick={() => setShowCreateModal(true)}
            className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1"
          >
            Challenge a Friend
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {activeH2H.length === 0 ? (
          <div className="text-center py-8 bg-white/5 rounded-xl border border-white/10">
            <Swords className="w-12 h-12 mx-auto mb-3 text-white/30" />
            <p className="text-white/60 mb-4">No active head-to-head battles</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 rounded-lg text-sm font-medium"
            >
              Challenge a Friend
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {activeH2H.map(participation => {
              const challenge = participation.challenge;
              const progress = (participation.current_value / challenge.target_value) * 100;

              return (
                <div
                  key={participation.id}
                  className="p-4 bg-white/5 border border-white/10 rounded-xl"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{challenge.icon || '⚔️'}</span>
                      <div>
                        <p className="font-medium text-white">{challenge.title}</p>
                        <p className="text-xs text-white/50">
                          vs {challenge.event_data?.opponent_name || 'Opponent'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-white/60">
                      <Clock className="w-4 h-4" />
                      {formatTimeRemaining(challenge.ends_at)}
                    </div>
                  </div>

                  {/* Progress comparison */}
                  <div className="space-y-3">
                    {/* Your progress */}
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-white/70">You</span>
                        <span className="text-purple-400 font-medium">
                          {participation.current_value?.toLocaleString() || 0} / {challenge.target_value?.toLocaleString()}
                        </span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all"
                          style={{ width: `${Math.min(100, progress)}%` }}
                        />
                      </div>
                    </div>

                    {/* Opponent progress */}
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <div className="flex items-center gap-2 text-white/70">
                          {participation.opponent?.avatar_url ? (
                            <img
                              src={participation.opponent.avatar_url}
                              alt=""
                              className="w-4 h-4 rounded-full object-cover"
                            />
                          ) : null}
                          <span>{participation.opponent?.display_name || 'Opponent'}</span>
                        </div>
                        <span className="text-orange-400 font-medium">
                          {participation.opponent?.current_value?.toLocaleString() || 0} / {challenge.target_value?.toLocaleString()}
                        </span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all"
                          style={{ width: `${Math.min(100, ((participation.opponent?.current_value || 0) / challenge.target_value) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Reward */}
                  <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-white/60">
                      <Trophy className="w-4 h-4 text-yellow-400" />
                      <span>Winner gets</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-yellow-400 font-medium">
                        <Zap className="w-4 h-4" />
                        {challenge.xp_reward} XP
                      </div>
                      {challenge.wager_amount > 0 && (
                        <div className="flex items-center gap-1 text-amber-400 font-medium">
                          <Coins className="w-4 h-4" />
                          {challenge.wager_amount * 2}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Wager indicator */}
                  {challenge.wager_amount > 0 && (
                    <div className="mt-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-center justify-center gap-2 text-xs text-amber-400">
                      <Coins className="w-3 h-3" />
                      <span>{challenge.wager_amount} credits at stake per player</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Wager Stats */}
      {wagerStats && (wagerStats.totalWagered > 0 || wagerStats.totalWon > 0) && (
        <div className="p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-amber-400 flex items-center gap-2">
              <Coins className="w-4 h-4" />
              Wager Stats
            </h3>
            <div className={`text-sm font-medium ${wagerStats.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {wagerStats.netProfit >= 0 ? '+' : ''}{wagerStats.netProfit} net
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <div className="text-lg font-bold text-white">{wagerStats.totalWagered}</div>
              <div className="text-xs text-white/50">Total Wagered</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-400">{wagerStats.challengesWon}</div>
              <div className="text-xs text-white/50">Wins</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-red-400">{wagerStats.challengesLost}</div>
              <div className="text-xs text-white/50">Losses</div>
            </div>
          </div>
        </div>
      )}

      {/* Challenge History */}
      {completedChallenges.length > 0 && (
        <div>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center justify-between w-full text-sm font-medium text-white/70 mb-3 hover:text-white transition-colors"
          >
            <span className="flex items-center gap-2">
              <History className="w-4 h-4" />
              Challenge History ({completedChallenges.length})
            </span>
            <ChevronRight className={`w-4 h-4 transition-transform ${showHistory ? 'rotate-90' : ''}`} />
          </button>

          {showHistory && (
            <div className="space-y-2">
              {completedChallenges.slice(0, 5).map(p => {
                const challenge = p.challenge;
                if (!challenge) return null;

                return (
                  <div
                    key={p.id}
                    className={`p-3 rounded-lg border ${
                      p.isWinner
                        ? 'bg-green-500/10 border-green-500/30'
                        : p.isTie
                        ? 'bg-white/5 border-white/10'
                        : 'bg-red-500/10 border-red-500/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{challenge.icon || '⚔️'}</span>
                        <div>
                          <p className="text-sm font-medium text-white">{challenge.title}</p>
                          <p className="text-xs text-white/50">vs {p.opponent?.display_name || 'Unknown'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        {p.isTie ? (
                          <div className="text-sm text-white/60 font-medium">TIE</div>
                        ) : p.isWinner ? (
                          <div className="flex items-center gap-1 text-green-400 text-sm font-medium">
                            <Crown className="w-4 h-4" />
                            WON
                          </div>
                        ) : (
                          <div className="text-sm text-red-400 font-medium">LOST</div>
                        )}
                        <div className="text-xs text-white/50">
                          {p.current_value} - {p.opponentScore}
                        </div>
                      </div>
                    </div>

                    {/* Wager result */}
                    {challenge.wager_amount > 0 && (
                      <div className={`mt-2 pt-2 border-t ${
                        p.isWinner ? 'border-green-500/20' : p.isTie ? 'border-white/10' : 'border-red-500/20'
                      } flex items-center justify-between text-xs`}>
                        <span className="text-white/50 flex items-center gap-1">
                          <Coins className="w-3 h-3" />
                          Wager: {challenge.wager_amount}
                        </span>
                        {p.isTie ? (
                          <span className="text-white/60">Refunded</span>
                        ) : p.isWinner ? (
                          <span className="text-green-400 font-medium flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            +{challenge.wager_amount * 2}
                          </span>
                        ) : (
                          <span className="text-red-400 font-medium flex items-center gap-1">
                            <TrendingDown className="w-3 h-3" />
                            -{challenge.wager_amount}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Quick Challenge Friends */}
      {friends.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-white/70 mb-3">
            Quick Challenge
          </h3>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {friends.slice(0, 6).map(friend => (
              <button
                key={friend.id}
                onClick={() => {
                  setSelectedFriend(friend);
                  setShowCreateModal(true);
                }}
                className="flex-shrink-0 flex flex-col items-center gap-2 p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  {friend.avatar_url ? (
                    <img
                      src={friend.avatar_url}
                      alt=""
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-white font-medium">
                      {friend.display_name?.[0] || '?'}
                    </span>
                  )}
                </div>
                <span className="text-xs text-white/70 truncate max-w-[60px]">
                  {friend.display_name}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Create Challenge Modal */}
      <CreateChallengeModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setSelectedFriend(null);
        }}
        initialType="head_to_head"
        opponent={selectedFriend}
      />
    </div>
  );
}
