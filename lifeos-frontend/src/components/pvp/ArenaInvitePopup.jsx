/**
 * ArenaInvitePopup - Real-time popup when receiving a PvP Arena invite from a friend
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Swords, X, Check, Clock } from 'lucide-react';
import usePvpArenaStore from '../../stores/pvpArenaStore';

export default function ArenaInvitePopup({ invite, onClose }) {
  const navigate = useNavigate();
  const { acceptArenaInvite, declineArenaInvite, isInMatch } = usePvpArenaStore();
  const [isAccepting, setIsAccepting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);

  // Auto-dismiss after 30 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onClose]);

  const handleAccept = async () => {
    if (isAccepting || isInMatch) return;

    setIsAccepting(true);
    try {
      const match = await acceptArenaInvite(invite.id);
      if (match) {
        onClose();
        navigate('/pvp-arena');
      }
    } catch (error) {
      console.error('Failed to accept invite:', error);
      setIsAccepting(false);
    }
  };

  const handleDecline = async () => {
    await declineArenaInvite(invite.id);
    onClose();
  };

  const inviterName = invite.inviter_profile?.display_name || 'Someone';
  const inviterLevel = invite.inviter_stats?.level || 1;

  return (
    <div className="fixed top-4 right-4 z-[100] animate-slide-in-right">
      <div className="bg-gradient-to-br from-orange-900/95 to-red-900/95 backdrop-blur-lg border border-orange-500/40 rounded-2xl p-4 shadow-2xl shadow-orange-500/20 w-80">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg">
              <Swords className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-white">Arena Challenge!</h3>
              <p className="text-orange-200/80 text-sm">
                {inviterName} wants to battle
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-white/40 hover:text-white/80 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Inviter Info */}
        <div className="bg-black/30 rounded-xl p-3 mb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {invite.inviter_profile?.avatar_url ? (
                <img
                  src={invite.inviter_profile.avatar_url}
                  alt=""
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-orange-500/30 flex items-center justify-center">
                  <span className="text-orange-300 font-bold">
                    {inviterName[0]?.toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <p className="text-white font-medium text-sm">{inviterName}</p>
                <p className="text-orange-300/70 text-xs">Level {inviterLevel}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-orange-300/70 text-xs">
              <Clock className="w-3 h-3" />
              <span>{timeLeft}s</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={handleDecline}
            className="flex-1 py-2.5 px-4 bg-white/10 hover:bg-white/20 text-white/80 rounded-xl font-medium text-sm transition-colors flex items-center justify-center gap-2"
          >
            <X className="w-4 h-4" />
            Decline
          </button>
          <button
            onClick={handleAccept}
            disabled={isAccepting || isInMatch}
            className="flex-1 py-2.5 px-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAccepting ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Check className="w-4 h-4" />
                Accept
              </>
            )}
          </button>
        </div>

        {/* Progress bar for timeout */}
        <div className="mt-3 h-1 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-orange-400 to-red-400 transition-all duration-1000"
            style={{ width: `${(timeLeft / 30) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
