import React from 'react';
import { X, Swords, Shield, Heart, Zap, Check, Clock } from 'lucide-react';
import usePvpStore from '../../stores/pvpStore';
import { getRankInfo } from '../../utils/pvpCalculations';

export default function PvPInviteModal({ invites, onClose }) {
  const { acceptInvite, declineInvite, activeLoadout } = usePvpStore();

  const handleAccept = async (inviteId) => {
    try {
      await acceptInvite(inviteId, activeLoadout);
      if (invites.length <= 1) onClose();
    } catch (error) {
      console.error('Failed to accept invite:', error);
    }
  };

  const handleDecline = async (inviteId) => {
    try {
      await declineInvite(inviteId);
      if (invites.length <= 1) onClose();
    } catch (error) {
      console.error('Failed to decline invite:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1724] border border-white/10 rounded-2xl w-full max-w-lg max-h-[80vh] overflow-hidden">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <Swords className="w-5 h-5 text-red-400" />
            </div>
            <h2 className="text-lg font-semibold text-white">Battle Challenges</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <X className="w-5 h-5 text-white/60" />
          </button>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto max-h-[60vh]">
          {invites.map((invite) => {
            const inviterLoadout = invite.inviter_loadout || {};
            const inviterStats = inviterLoadout.stats || {};
            const expiresAt = new Date(invite.expires_at);
            const hoursLeft = Math.max(0, Math.ceil((expiresAt - new Date()) / (1000 * 60 * 60)));

            return (
              <div key={invite.id} className="bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/20 rounded-xl p-4">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="font-semibold text-white">Challenge from Player</p>
                    <p className="text-sm text-white/60">{invite.inviter_id?.slice(0, 12)}...</p>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-yellow-400">
                    <Clock className="w-4 h-4" />
                    <span>{hoursLeft}h left</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-black/20 rounded-lg p-3">
                    <p className="text-xs text-white/50 mb-1">Battle Type</p>
                    <p className="font-medium text-white capitalize">{invite.battle_type}</p>
                  </div>
                  <div className="bg-black/20 rounded-lg p-3">
                    <p className="text-xs text-white/50 mb-1">Duration</p>
                    <p className="font-medium text-white">{invite.duration_days} days</p>
                  </div>
                  <div className="bg-black/20 rounded-lg p-3">
                    <p className="text-xs text-white/50 mb-1">Their Power</p>
                    <p className="font-medium text-purple-400">{invite.inviter_power_rating || '???'}</p>
                  </div>
                  <div className="bg-black/20 rounded-lg p-3">
                    <p className="text-xs text-white/50 mb-1">Their Level</p>
                    <p className="font-medium text-white">{inviterLoadout.level || '?'}</p>
                  </div>
                </div>

                {invite.message && (
                  <p className="text-sm text-white/70 italic mb-4">"{invite.message}"</p>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => handleDecline(invite.id)}
                    className="flex-1 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors"
                  >
                    Decline
                  </button>
                  <button
                    onClick={() => handleAccept(invite.id)}
                    className="flex-1 py-2.5 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    Accept
                  </button>
                </div>
              </div>
            );
          })}

          {invites.length === 0 && (
            <div className="text-center py-8">
              <Swords className="w-12 h-12 text-white/20 mx-auto mb-3" />
              <p className="text-white/60">No pending challenges</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
