import React, { useMemo } from 'react';
import {
  Trophy,
  Zap,
  Target,
  CheckCircle2,
  Circle,
  Clock,
  Dumbbell,
  Book,
  Brain,
  DollarSign,
  FileText,
  Sparkles,
  Crown,
  Star,
  Award,
  Calendar
} from 'lucide-react';
import useQuestsStore, { QUEST_DIFFICULTY, LIFEOS_MODULES } from '../../stores/questsStore';

const MODULE_ICONS = {
  productivity: Brain,
  health: Dumbbell,
  knowledge: Book,
  journal: FileText,
  financial: DollarSign,
  calendar: Calendar,
  skills: Target,
  all: Sparkles,
};

const RARITY_CONFIG = {
  hard: { color: 'from-orange-500 to-red-500', label: 'Hard', glow: 'shadow-orange-500/30', border: 'border-orange-500/30' },
  epic: { color: 'from-purple-500 to-pink-500', label: 'Epic', glow: 'shadow-purple-500/40', border: 'border-purple-500/30' },
  legendary: { color: 'from-yellow-500 to-orange-500', label: 'Legendary', glow: 'shadow-yellow-500/50', border: 'border-yellow-500/30' },
};

export default function MonthlyEpicQuests() {
  const { getMonthlyQuests } = useQuestsStore();
  const monthlyQuests = getMonthlyQuests();

  // Calculate month progress
  const monthStats = useMemo(() => {
    const completed = monthlyQuests.filter(q => q.completed).length;
    const totalXP = monthlyQuests
      .filter(q => q.completed)
      .reduce((sum, q) => sum + q.xpReward, 0);
    const totalCredits = monthlyQuests
      .filter(q => q.completed)
      .reduce((sum, q) => sum + q.creditsReward, 0);

    return { completed, total: monthlyQuests.length, totalXP, totalCredits };
  }, [monthlyQuests]);

  // Calculate days remaining in month
  const timeRemaining = useMemo(() => {
    const now = new Date();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    const diff = endOfMonth - now;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    return `${days} days`;
  }, []);

  // Get current month name
  const monthName = new Date().toLocaleDateString('en-US', { month: 'long' });

  return (
    <div className="space-y-6">
      {/* Month Progress Overview */}
      <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
              <Crown className="w-6 h-6 text-yellow-400" />
              {monthName} Epic Quests
            </h2>
            <p className="text-white/60">
              Complete legendary challenges for massive rewards
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="flex items-center gap-2 text-green-400">
                <Trophy className="w-5 h-5" />
                <span className="text-2xl font-bold">+{monthStats.totalXP}</span>
              </div>
              <p className="text-xs text-white/60">XP earned</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 text-yellow-400">
                <Zap className="w-5 h-5" />
                <span className="text-2xl font-bold">+{monthStats.totalCredits}</span>
              </div>
              <p className="text-xs text-white/60">Credits earned</p>
            </div>
          </div>
        </div>

        {/* Time Remaining */}
        <div className="flex items-center gap-2 text-white/60 text-sm">
          <Clock className="w-4 h-4" />
          <span>{timeRemaining} remaining</span>
          <span className="mx-2">•</span>
          <span>{monthStats.completed}/{monthStats.total} completed</span>
        </div>
      </div>

      {/* Epic Quest Cards */}
      <div className="grid grid-cols-1 gap-6">
        {monthlyQuests.map((quest) => {
          const ModuleIcon = MODULE_ICONS[quest.module] || Target;
          const moduleData = LIFEOS_MODULES[quest.module] || { color: 'from-gray-500 to-gray-600', label: quest.module };
          const rarity = RARITY_CONFIG[quest.difficulty] || RARITY_CONFIG.hard;

          // Calculate progress
          const target = typeof quest.requirement.count === 'number'
            ? quest.requirement.count
            : Object.values(quest.requirement).find(v => typeof v === 'number') || 1;
          const progress = (quest.progress / target) * 100;

          return (
            <div
              key={quest.id}
              className={`
                relative bg-[#1a1724] border rounded-2xl overflow-hidden
                transition-all duration-300 hover:scale-[1.01]
                ${quest.completed ? 'border-green-500/50' : rarity.border}
                ${quest.completed ? '' : rarity.glow}
              `}
            >
              {/* Glow Effect for Legendary */}
              {quest.difficulty === 'legendary' && !quest.completed && (
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 to-orange-500/5 animate-pulse" />
              )}

              <div className="relative p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`
                      relative p-4 rounded-2xl text-4xl
                      bg-gradient-to-br ${rarity.color} bg-opacity-20
                    `}>
                      {quest.icon}
                      {quest.completed && (
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`
                          text-xs px-2 py-1 rounded-full font-medium
                          bg-gradient-to-r ${rarity.color} text-white
                        `}>
                          {rarity.label}
                        </span>
                        <span className="flex items-center gap-1 text-xs px-2 py-1 bg-white/5 rounded-full border border-white/10">
                          <ModuleIcon className="w-3 h-3" />
                          {moduleData.label}
                        </span>
                      </div>
                      <h3 className={`
                        text-xl font-bold mb-1
                        ${quest.completed ? 'text-white/60 line-through' : 'text-white'}
                      `}>
                        {quest.title}
                      </h3>
                      <p className="text-white/50">
                        {quest.description}
                      </p>
                    </div>
                  </div>

                  {/* Rewards */}
                  <div className="text-right flex-shrink-0">
                    <div className="flex items-center gap-2 text-green-400 mb-1">
                      <Trophy className="w-5 h-5" />
                      <span className="text-xl font-bold">+{quest.xpReward}</span>
                    </div>
                    <div className="flex items-center gap-2 text-yellow-400">
                      <Zap className="w-5 h-5" />
                      <span className="text-xl font-bold">+{quest.creditsReward}</span>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-white/60">Progress</span>
                    <span className={`font-medium ${quest.completed ? 'text-green-400' : 'text-purple-400'}`}>
                      {quest.progress}/{target}
                    </span>
                  </div>
                  <div className="h-3 bg-[#0c0a10] rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${quest.completed ? 'from-green-500 to-emerald-500' : rarity.color} transition-all duration-500`}
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Badge Preview */}
                {quest.badge && (
                  <div className="flex items-center gap-3 p-3 bg-purple-500/5 border border-purple-500/20 rounded-xl">
                    <Award className="w-5 h-5 text-purple-400" />
                    <div>
                      <p className="text-sm text-white/80">
                        Complete to unlock: <span className="text-purple-400 font-semibold">{quest.badge.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* All Complete Bonus */}
      {monthStats.completed === monthStats.total && monthStats.total > 0 && (
        <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-2xl p-8 text-center">
          <div className="inline-flex p-5 rounded-full bg-gradient-to-br from-yellow-500/20 to-orange-500/20 mb-4">
            <Crown className="w-12 h-12 text-yellow-400" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">
            {monthName} Champion!
          </h3>
          <p className="text-white/60 mb-6 max-w-md mx-auto">
            You've conquered all epic quests this month. You are truly legendary!
          </p>
          <div className="flex items-center justify-center gap-8">
            <div className="text-center">
              <div className="flex items-center gap-2 text-green-400 justify-center">
                <Trophy className="w-6 h-6" />
                <span className="text-2xl font-bold">+2000</span>
              </div>
              <p className="text-xs text-white/60 mt-1">Bonus XP</p>
            </div>
            <div className="text-center">
              <div className="flex items-center gap-2 text-yellow-400 justify-center">
                <Zap className="w-6 h-6" />
                <span className="text-2xl font-bold">+1000</span>
              </div>
              <p className="text-xs text-white/60 mt-1">Bonus Credits</p>
            </div>
            <div className="text-center">
              <div className="flex items-center gap-2 text-purple-400 justify-center">
                <Star className="w-6 h-6" />
                <span className="text-2xl font-bold">Epic</span>
              </div>
              <p className="text-xs text-white/60 mt-1">Badge Unlocked</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
