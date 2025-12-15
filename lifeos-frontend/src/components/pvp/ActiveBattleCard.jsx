import React from 'react';
import { Swords, Clock, ChevronRight } from 'lucide-react';
import { formatHPPercent } from '../../utils/pvpCalculations';

export default function ActiveBattleCard({ battle, userId, onClick }) {
  const isPlayer1 = battle.player1_id === userId;
  const myHP = isPlayer1 ? battle.player1_current_hp : battle.player2_current_hp;
  const myMaxHP = isPlayer1 ? battle.player1_max_hp : battle.player2_max_hp;
  const oppHP = isPlayer1 ? battle.player2_current_hp : battle.player1_current_hp;
  const oppMaxHP = isPlayer1 ? battle.player2_max_hp : battle.player1_max_hp;

  const myHPPercent = formatHPPercent(myHP, myMaxHP);
  const oppHPPercent = formatHPPercent(oppHP, oppMaxHP);

  const endDate = battle.ends_at ? new Date(battle.ends_at) : null;
  const now = new Date();
  const daysRemaining = endDate ? Math.max(0, Math.ceil((endDate - now) / (1000 * 60 * 60 * 24))) : battle.duration_days;

  const getStatusColor = () => {
    if (battle.status === 'pending') return 'from-yellow-500/20 to-amber-500/20 border-yellow-500/30';
    if (myHPPercent > oppHPPercent) return 'from-green-500/20 to-emerald-500/20 border-green-500/30';
    if (myHPPercent < oppHPPercent) return 'from-red-500/20 to-orange-500/20 border-red-500/30';
    return 'from-gray-500/20 to-slate-500/20 border-gray-500/30';
  };

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-xl bg-gradient-to-br ${getStatusColor()} border hover:scale-[1.02] transition-all duration-200`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Swords className="w-5 h-5 text-red-400" />
          <span className="font-semibold text-white capitalize">{battle.battle_type} Duel</span>
        </div>
        <div className="flex items-center gap-1 text-sm text-white/60">
          <Clock className="w-4 h-4" />
          <span>{daysRemaining}d left</span>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-white/80">You</span>
            <span className="text-white">{myHP?.toLocaleString()} / {myMaxHP?.toLocaleString()}</span>
          </div>
          <div className="h-3 bg-black/30 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all" style={{ width: `${myHPPercent}%` }} />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-white/60">Opponent</span>
            <span className="text-white/80">{oppHP?.toLocaleString()} / {oppMaxHP?.toLocaleString()}</span>
          </div>
          <div className="h-3 bg-black/30 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-red-500 to-orange-400 transition-all" style={{ width: `${oppHPPercent}%` }} />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
        <span className={`text-sm font-medium ${
          battle.status === 'pending' ? 'text-yellow-400' :
          myHPPercent > oppHPPercent ? 'text-green-400' :
          myHPPercent < oppHPPercent ? 'text-red-400' : 'text-white/60'
        }`}>
          {battle.status === 'pending' ? 'Waiting for opponent' :
           myHPPercent > oppHPPercent ? 'Winning' :
           myHPPercent < oppHPPercent ? 'Losing' : 'Tied'}
        </span>
        <ChevronRight className="w-5 h-5 text-white/40" />
      </div>
    </button>
  );
}
