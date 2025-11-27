import React, { useMemo } from 'react';
import {
  Calendar,
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
  Sparkles
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

export default function WeeklyQuests() {
  const { getWeeklyQuests, updateWeeklyQuestProgress } = useQuestsStore();
  const weeklyQuests = getWeeklyQuests();

  // Calculate week progress
  const weekStats = useMemo(() => {
    const completed = weeklyQuests.filter(q => q.completed).length;
    const totalXP = weeklyQuests
      .filter(q => q.completed)
      .reduce((sum, q) => sum + q.xpReward, 0);
    const totalCredits = weeklyQuests
      .filter(q => q.completed)
      .reduce((sum, q) => sum + q.creditsReward, 0);

    return { completed, total: weeklyQuests.length, totalXP, totalCredits };
  }, [weeklyQuests]);

  // Calculate time remaining in week
  const timeRemaining = useMemo(() => {
    const now = new Date();
    const endOfWeek = new Date(now);
    endOfWeek.setDate(now.getDate() + (7 - now.getDay()));
    endOfWeek.setHours(23, 59, 59, 999);

    const diff = endOfWeek - now;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    return `${days}d ${hours}h`;
  }, []);

  return (
    <div className="space-y-6">
      {/* Week Progress Overview */}
      <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-blue-400" />
              Weekly Quests
            </h2>
            <p className="text-white/60">
              {weekStats.completed}/{weekStats.total} quests completed
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="flex items-center gap-2 text-green-400">
                <Trophy className="w-5 h-5" />
                <span className="text-2xl font-bold">+{weekStats.totalXP}</span>
              </div>
              <p className="text-xs text-white/60">XP earned</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 text-yellow-400">
                <Zap className="w-5 h-5" />
                <span className="text-2xl font-bold">+{weekStats.totalCredits}</span>
              </div>
              <p className="text-xs text-white/60">Credits earned</p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative h-3 bg-[#0c0a10] rounded-full overflow-hidden mb-4">
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-500"
            style={{ width: `${weekStats.total > 0 ? (weekStats.completed / weekStats.total) * 100 : 0}%` }}
          />
          {weekStats.completed === weekStats.total && weekStats.total > 0 && (
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 animate-pulse" />
          )}
        </div>

        {/* Time Remaining */}
        <div className="flex items-center gap-2 text-white/60 text-sm">
          <Clock className="w-4 h-4" />
          <span>Week ends in {timeRemaining}</span>
        </div>
      </div>

      {/* Weekly Quests Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {weeklyQuests.map((quest) => {
          const ModuleIcon = MODULE_ICONS[quest.module] || Target;
          const moduleData = LIFEOS_MODULES[quest.module] || { color: 'from-gray-500 to-gray-600' };
          const difficulty = QUEST_DIFFICULTY[quest.difficulty] || QUEST_DIFFICULTY.normal;
          const progress = (quest.progress / quest.requirement.count) * 100;

          return (
            <div
              key={quest.id}
              className={`
                bg-[#1a1724] border rounded-xl p-5 transition-all duration-200
                ${quest.completed
                  ? 'border-green-500/50 bg-green-500/5'
                  : 'border-white/10 hover:border-blue-500/50'
                }
              `}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`
                    p-3 rounded-xl text-2xl
                    bg-gradient-to-br ${moduleData.color} bg-opacity-20
                  `}>
                    {quest.icon}
                  </div>
                  <div>
                    <h3 className={`
                      text-lg font-semibold
                      ${quest.completed ? 'text-white/60 line-through' : 'text-white'}
                    `}>
                      {quest.title}
                    </h3>
                    <p className="text-sm text-white/50">
                      {quest.description}
                    </p>
                  </div>
                </div>

                {/* Completion Indicator */}
                {quest.completed ? (
                  <CheckCircle2 className="w-6 h-6 text-green-400 flex-shrink-0" />
                ) : (
                  <Circle className="w-6 h-6 text-white/40 flex-shrink-0" />
                )}
              </div>

              {/* Progress */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-white/60">Progress</span>
                  <span className={`font-medium ${quest.completed ? 'text-green-400' : 'text-blue-400'}`}>
                    {quest.progress}/{quest.requirement.count}
                  </span>
                </div>
                <div className="h-2 bg-[#0c0a10] rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${quest.completed ? 'from-green-500 to-emerald-500' : moduleData.color} transition-all duration-300`}
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-white/10">
                {/* Module & Difficulty */}
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 text-xs px-2 py-1 bg-white/5 rounded border border-white/10">
                    <ModuleIcon className="w-3 h-3" />
                    {LIFEOS_MODULES[quest.module]?.label || quest.module}
                  </span>
                  <span className={`
                    text-xs px-2 py-1 rounded border
                    ${difficulty.color.replace('from-', 'text-').split(' ')[0]}
                    bg-white/5 border-white/10
                  `}>
                    {difficulty.label}
                  </span>
                </div>

                {/* Rewards */}
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex items-center gap-1 text-green-400">
                    <Trophy className="w-4 h-4" />
                    <span>+{quest.xpReward}</span>
                  </div>
                  <div className="flex items-center gap-1 text-yellow-400">
                    <Zap className="w-4 h-4" />
                    <span>+{quest.creditsReward}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bonus: Complete All Weekly */}
      {weekStats.completed === weekStats.total && weekStats.total > 0 && (
        <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-xl p-6 text-center">
          <div className="inline-flex p-4 rounded-full bg-gradient-to-br from-yellow-500/20 to-orange-500/20 mb-4">
            <Sparkles className="w-8 h-8 text-yellow-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">
            Weekly Champion!
          </h3>
          <p className="text-white/60 mb-4">
            You've completed all weekly quests. Bonus rewards unlocked!
          </p>
          <div className="flex items-center justify-center gap-6">
            <div className="flex items-center gap-2 text-green-400">
              <Trophy className="w-5 h-5" />
              <span className="font-bold">+500 Bonus XP</span>
            </div>
            <div className="flex items-center gap-2 text-yellow-400">
              <Zap className="w-5 h-5" />
              <span className="font-bold">+250 Bonus Credits</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
