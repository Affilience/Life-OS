import React, { useState } from 'react';
import {
  Trophy,
  Zap,
  Skull,
  Heart,
  Swords,
  Shield,
  Flame,
  Clock,
  Award,
  Play,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import useQuestsStore, { BOSS_BATTLE_TEMPLATES, QUEST_DIFFICULTY } from '../../stores/questsStore';

export default function BossBattles() {
  const {
    getActiveBossBattles,
    startBossBattle,
    completedBossBattles
  } = useQuestsStore();

  const [showAvailable, setShowAvailable] = useState(false);

  const activeBattles = getActiveBossBattles();

  // Get available bosses that aren't currently being fought
  const activeBossIds = new Set(activeBattles.map(b => b.templateId));
  const availableBosses = BOSS_BATTLE_TEMPLATES.filter(b => !activeBossIds.has(b.id));

  const handleStartBattle = (bossId) => {
    startBossBattle(bossId);
    setShowAvailable(false);
  };

  const renderBossCard = (boss, isTemplate = false) => {
    const template = isTemplate ? boss : BOSS_BATTLE_TEMPLATES.find(t => t.id === boss.templateId) || boss;
    const difficulty = QUEST_DIFFICULTY[template.difficulty] || QUEST_DIFFICULTY.hard;

    // Calculate health percentages for active battles
    const bossHealthPercent = !isTemplate ? (boss.currentHealth / template.health) * 100 : 100;
    const playerHealthPercent = !isTemplate ? boss.playerHealth : 100;

    // Time remaining
    let timeRemaining = '';
    if (!isTemplate && boss.endsAt) {
      const now = new Date();
      const end = new Date(boss.endsAt);
      const diff = end - now;
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      timeRemaining = `${days}d ${hours}h`;
    }

    return (
      <div
        key={isTemplate ? template.id : boss.id}
        className={`
          relative bg-[#1a1724] border rounded-2xl overflow-hidden
          ${!isTemplate && boss.defeated ? 'border-green-500/50' :
            !isTemplate && boss.playerDefeated ? 'border-red-500/50' :
            !isTemplate ? 'border-orange-500/30' : 'border-white/10 hover:border-orange-500/30'}
        `}
      >
        {/* Boss Battle Banner */}
        <div className={`
          relative p-6 bg-gradient-to-br
          ${!isTemplate && boss.defeated ? 'from-green-500/20 to-emerald-500/20' :
            !isTemplate && boss.playerDefeated ? 'from-red-500/20 to-rose-500/20' :
            'from-orange-500/20 to-red-500/20'}
        `}>
          {/* Boss Icon */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="text-6xl animate-pulse">
                {template.icon}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`
                    text-xs px-2 py-1 rounded-full font-medium
                    bg-gradient-to-r ${difficulty.color} text-white
                  `}>
                    {difficulty.label}
                  </span>
                  {template.attacksBack && (
                    <span className="text-xs px-2 py-1 bg-red-500/20 text-red-400 rounded-full border border-red-500/30">
                      Attacks Back!
                    </span>
                  )}
                </div>
                <h3 className="text-2xl font-bold text-white">
                  {template.title}
                </h3>
                <p className="text-white/60 text-sm">
                  {template.description}
                </p>
              </div>
            </div>

            {/* Status Badge */}
            {!isTemplate && (
              <div className="text-right">
                {boss.defeated ? (
                  <div className="flex items-center gap-2 text-green-400">
                    <CheckCircle2 className="w-6 h-6" />
                    <span className="font-bold">DEFEATED!</span>
                  </div>
                ) : boss.playerDefeated ? (
                  <div className="flex items-center gap-2 text-red-400">
                    <XCircle className="w-6 h-6" />
                    <span className="font-bold">FAILED</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-white/60">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">{timeRemaining} left</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Health Bars (for active battles) */}
          {!isTemplate && !boss.defeated && !boss.playerDefeated && (
            <div className="space-y-3">
              {/* Boss Health */}
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="flex items-center gap-1 text-orange-400">
                    <Skull className="w-4 h-4" />
                    Boss HP
                  </span>
                  <span className="text-white font-medium">
                    {boss.currentHealth}/{template.health}
                  </span>
                </div>
                <div className="h-4 bg-[#0c0a10] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-500"
                    style={{ width: `${bossHealthPercent}%` }}
                  />
                </div>
              </div>

              {/* Player Health (if boss attacks back) */}
              {template.attacksBack && (
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="flex items-center gap-1 text-green-400">
                      <Heart className="w-4 h-4" />
                      Your HP
                    </span>
                    <span className="text-white font-medium">
                      {boss.playerHealth}/100
                    </span>
                  </div>
                  <div className="h-4 bg-[#0c0a10] rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        playerHealthPercent > 50 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                        playerHealthPercent > 25 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                        'bg-gradient-to-r from-red-500 to-rose-500'
                      }`}
                      style={{ width: `${playerHealthPercent}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Template Stats */}
          {isTemplate && (
            <div className="flex items-center gap-6 mt-4 text-sm">
              <div className="flex items-center gap-2">
                <Skull className="w-4 h-4 text-orange-400" />
                <span className="text-white">HP: {template.health}</span>
              </div>
              <div className="flex items-center gap-2">
                <Swords className="w-4 h-4 text-cyan-400" />
                <span className="text-white">Damage/task: {template.damagePerTask}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-400" />
                <span className="text-white">{template.duration}</span>
              </div>
            </div>
          )}
        </div>

        {/* Battle Stats & Rewards */}
        <div className="p-6">
          {/* Battle Progress (for active battles) */}
          {!isTemplate && !boss.defeated && !boss.playerDefeated && (
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-3 bg-white/5 rounded-lg">
                <div className="text-2xl font-bold text-cyan-400">{boss.tasksCompleted}</div>
                <p className="text-xs text-white/60">Tasks Done</p>
              </div>
              <div className="text-center p-3 bg-white/5 rounded-lg">
                <div className="text-2xl font-bold text-orange-400">{boss.damageDealt}</div>
                <p className="text-xs text-white/60">Damage Dealt</p>
              </div>
              {template.attacksBack && (
                <div className="text-center p-3 bg-white/5 rounded-lg">
                  <div className="text-2xl font-bold text-red-400">{boss.tasksFailed}</div>
                  <p className="text-xs text-white/60">Hits Taken</p>
                </div>
              )}
            </div>
          )}

          {/* Rewards */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 text-green-400">
                <Trophy className="w-5 h-5" />
                <span className="font-bold">+{template.xpReward} XP</span>
              </div>
              <div className="flex items-center gap-1 text-yellow-400">
                <Zap className="w-5 h-5" />
                <span className="font-bold">+{template.creditsReward}</span>
              </div>
              {template.badge && (
                <div className="flex items-center gap-1 text-purple-400">
                  <Award className="w-5 h-5" />
                  <span className="font-bold">{template.badge.replace(/_/g, ' ')}</span>
                </div>
              )}
            </div>

            {/* Action Button */}
            {isTemplate && (
              <button
                onClick={() => handleStartBattle(template.id)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium rounded-lg hover:from-orange-600 hover:to-red-600 transition-all"
              >
                <Swords className="w-5 h-5" />
                Start Battle
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
              <Flame className="w-6 h-6 text-orange-400 animate-pulse" />
              Boss Battles
            </h2>
            <p className="text-white/60">
              Challenge powerful bosses by completing tasks. Deal damage with every completion!
            </p>
          </div>
          <button
            onClick={() => setShowAvailable(!showAvailable)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
              ${showAvailable
                ? 'bg-orange-500 text-white'
                : 'bg-[#1a1724] text-white border border-white/10 hover:border-orange-500/50'}
            `}
          >
            <Swords className="w-4 h-4" />
            {showAvailable ? 'Hide Bosses' : 'Find Boss'}
          </button>
        </div>
      </div>

      {/* Available Bosses */}
      {showAvailable && availableBosses.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-white flex items-center gap-2">
            <Skull className="w-5 h-5 text-orange-400" />
            Available Bosses
          </h3>
          <div className="grid grid-cols-1 gap-6">
            {availableBosses.map(boss => renderBossCard(boss, true))}
          </div>
        </div>
      )}

      {/* Active Boss Battles */}
      {activeBattles.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-white flex items-center gap-2">
            <Swords className="w-5 h-5 text-red-400 animate-pulse" />
            Active Battles ({activeBattles.length})
          </h3>
          <div className="grid grid-cols-1 gap-6">
            {activeBattles.map(battle => renderBossCard(battle))}
          </div>
        </div>
      )}

      {/* Completed Boss Battles */}
      {completedBossBattles.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            Battle History ({completedBossBattles.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {completedBossBattles.slice(0, 4).map(battle => {
              const template = BOSS_BATTLE_TEMPLATES.find(t => t.id === battle.templateId) || battle;
              return (
                <div
                  key={battle.id}
                  className={`
                    p-4 rounded-xl border
                    ${battle.defeated ? 'bg-green-500/5 border-green-500/30' : 'bg-red-500/5 border-red-500/30'}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{template.icon}</span>
                    <div className="flex-1">
                      <h4 className="font-semibold text-white">{template.title}</h4>
                      <p className="text-xs text-white/60">
                        {battle.defeated ? 'Defeated' : 'Failed'} •
                        {new Date(battle.completedAt).toLocaleDateString()}
                      </p>
                    </div>
                    {battle.defeated ? (
                      <CheckCircle2 className="w-6 h-6 text-green-400" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-400" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {activeBattles.length === 0 && !showAvailable && (
        <div className="text-center py-12 bg-[#1a1724] border border-white/10 rounded-xl">
          <Skull className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Active Boss Battles</h3>
          <p className="text-white/60 mb-6">
            Challenge a boss to earn massive rewards! Complete tasks to deal damage.
          </p>
          <button
            onClick={() => setShowAvailable(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium rounded-xl hover:from-orange-600 hover:to-red-600 transition-all"
          >
            <Swords className="w-5 h-5" />
            Find a Boss to Fight
          </button>
        </div>
      )}

      {/* How It Works */}
      <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-5">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-white mb-1">How Boss Battles Work</h4>
            <ul className="text-sm text-white/60 space-y-1">
              <li>• Complete tasks to deal damage to the boss</li>
              <li>• Some bosses attack back when you miss tasks - watch your HP!</li>
              <li>• Defeat the boss before time runs out to claim rewards</li>
              <li>• Bigger bosses = bigger rewards</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
