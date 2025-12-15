import React, { useEffect, useState } from 'react';
import { ArrowLeft, Swords, Heart, Shield, Zap, Flame, Clock, Trophy, Flag } from 'lucide-react';
import usePvpStore from '../../stores/pvpStore';
import { formatHPPercent, calculateDailyDamage } from '../../utils/pvpCalculations';

export default function BattleView({ battleId, onBack }) {
  const { fetchBattleById, fetchBattleDays, currentBattle, forfeitBattle } = usePvpStore();
  const [battleDays, setBattleDays] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBattle = async () => {
      setLoading(true);
      await fetchBattleById(battleId);
      const days = await fetchBattleDays(battleId);
      setBattleDays(days);
      setLoading(false);
    };
    loadBattle();
  }, [battleId]);

  if (loading || !currentBattle) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const battle = currentBattle;
  const p1HPPercent = formatHPPercent(battle.player1_current_hp, battle.player1_max_hp);
  const p2HPPercent = formatHPPercent(battle.player2_current_hp, battle.player2_max_hp);

  const startDate = battle.starts_at ? new Date(battle.starts_at) : null;
  const endDate = battle.ends_at ? new Date(battle.ends_at) : null;
  const now = new Date();
  const currentDay = startDate ? Math.ceil((now - startDate) / (1000 * 60 * 60 * 24)) : 1;
  const daysRemaining = endDate ? Math.max(0, Math.ceil((endDate - now) / (1000 * 60 * 60 * 24))) : battle.duration_days;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Arena</span>
        </button>
        <div className="flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4 text-white/60" />
          <span className="text-white">Day {currentDay} of {battle.duration_days}</span>
          <span className="text-white/40">({daysRemaining} days left)</span>
        </div>
      </div>

      {/* Battle Arena */}
      <div className="bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/20 rounded-2xl p-6">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-black/20 rounded-full">
            <Swords className="w-5 h-5 text-red-400" />
            <span className="font-semibold text-white capitalize">{battle.battle_type} Duel</span>
          </div>
        </div>

        {/* VS Display */}
        <div className="grid grid-cols-3 gap-4 items-center mb-8">
          {/* Player 1 */}
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
              <span className="text-3xl">P1</span>
            </div>
            <p className="font-semibold text-white mb-1">Player 1</p>
            <p className="text-sm text-white/60">Level {battle.player1_loadout?.level || '?'}</p>
          </div>

          {/* VS */}
          <div className="text-center">
            <div className="text-4xl font-bold text-red-400">VS</div>
          </div>

          {/* Player 2 */}
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-3 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center">
              <span className="text-3xl">P2</span>
            </div>
            <p className="font-semibold text-white mb-1">Player 2</p>
            <p className="text-sm text-white/60">Level {battle.player2_loadout?.level || '?'}</p>
          </div>
        </div>

        {/* HP Bars */}
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-blue-400 font-medium">Player 1 HP</span>
              <span className="text-white">{battle.player1_current_hp?.toLocaleString()} / {battle.player1_max_hp?.toLocaleString()}</span>
            </div>
            <div className="h-6 bg-black/30 rounded-full overflow-hidden relative">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-500"
                style={{ width: `${p1HPPercent}%` }}
              />
              <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white drop-shadow">
                {p1HPPercent}%
              </span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-orange-400 font-medium">Player 2 HP</span>
              <span className="text-white">{battle.player2_current_hp?.toLocaleString()} / {battle.player2_max_hp?.toLocaleString()}</span>
            </div>
            <div className="h-6 bg-black/30 rounded-full overflow-hidden relative">
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-red-400 transition-all duration-500"
                style={{ width: `${p2HPPercent}%` }}
              />
              <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white drop-shadow">
                {p2HPPercent}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Battle Log */}
      <div className="bg-[#1a1724] border border-white/10 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-white/10">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            Battle Log
          </h3>
        </div>
        <div className="p-4 max-h-64 overflow-y-auto space-y-2">
          {battleDays.length === 0 ? (
            <p className="text-white/50 text-center py-4">No combat recorded yet</p>
          ) : (
            battleDays.slice().reverse().map((day) => (
              <div
                key={day.id}
                className={`p-3 rounded-lg ${day.critical_hit ? 'bg-yellow-500/10 border border-yellow-500/30' : 'bg-white/5'}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-white/60">Day {day.day_number}</span>
                    {day.critical_hit && <span className="text-xs bg-yellow-500 text-black px-1.5 py-0.5 rounded font-bold">CRIT!</span>}
                  </div>
                  <span className="text-sm text-white/40">{new Date(day.date).toLocaleDateString()}</span>
                </div>
                <div className="mt-2 text-sm">
                  <span className="text-white">{day.tasks_completed} tasks</span>
                  <span className="text-white/40 mx-2">=</span>
                  <span className="text-red-400 font-semibold">{day.damage_after_defense} damage</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Actions */}
      {battle.status === 'active' && (
        <div className="flex justify-center">
          <button
            onClick={() => {
              if (confirm('Are you sure you want to forfeit? This counts as a loss.')) {
                forfeitBattle(battleId);
                onBack();
              }
            }}
            className="px-6 py-2.5 bg-white/10 hover:bg-red-500/20 text-white/60 hover:text-red-400 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
          >
            <Flag className="w-4 h-4" />
            Forfeit Battle
          </button>
        </div>
      )}
    </div>
  );
}
