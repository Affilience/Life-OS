import React, { useState } from 'react';
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
  Calendar,
  Globe,
  Play,
  Plus,
  Sunrise,
  Scale,
  Crown
} from 'lucide-react';
import useQuestsStore, { CROSS_MODULE_QUEST_TEMPLATES, LIFEOS_MODULES, QUEST_DIFFICULTY } from '../../stores/questsStore';

const MODULE_ICONS = {
  productivity: Brain,
  health: Dumbbell,
  knowledge: Book,
  journal: FileText,
  financial: DollarSign,
  calendar: Calendar,
  skills: Target,
};

const QUEST_TYPE_ICONS = {
  morning_routine: Sunrise,
  balanced_day: Scale,
  weekly_mastery: Crown,
};

export default function CrossModuleQuests() {
  const { getCrossModuleQuests, activateCrossModuleQuest } = useQuestsStore();
  const [showAvailable, setShowAvailable] = useState(false);

  const activeQuests = getCrossModuleQuests().filter(q => !q.completed);
  const completedQuests = getCrossModuleQuests().filter(q => q.completed);

  // Get available templates that aren't already active
  const activeTemplateIds = new Set(getCrossModuleQuests().map(q => q.templateId));
  const availableTemplates = CROSS_MODULE_QUEST_TEMPLATES.filter(t =>
    !activeTemplateIds.has(t.id) || t.repeatable
  );

  const handleActivateQuest = (questId) => {
    activateCrossModuleQuest(questId);
    setShowAvailable(false);
  };

  const renderQuestCard = (quest, isTemplate = false) => {
    const template = isTemplate ? quest : CROSS_MODULE_QUEST_TEMPLATES.find(t => t.id === quest.templateId) || quest;
    const difficulty = QUEST_DIFFICULTY[template.difficulty] || QUEST_DIFFICULTY.normal;
    const QuestIcon = QUEST_TYPE_ICONS[template.id] || Globe;

    // Calculate overall progress for active quests
    let overallProgress = 0;
    if (!isTemplate && quest.requirementsMet) {
      const completedReqs = quest.requirementsMet.filter(Boolean).length;
      overallProgress = (completedReqs / quest.requirementsMet.length) * 100;
    }

    return (
      <div
        key={isTemplate ? template.id : quest.id}
        className={`
          bg-[#1a1724] border rounded-xl p-5 transition-all duration-200
          ${!isTemplate && quest.completed ? 'border-green-500/50 bg-green-500/5' :
            !isTemplate ? 'border-cyan-500/30 hover:border-cyan-500/50' :
            'border-white/10 hover:border-cyan-500/30'}
        `}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 text-white">
              <QuestIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-semibold text-white">
                  {template.title}
                </h3>
                {template.repeatable && (
                  <span className="text-xs px-2 py-0.5 bg-cyan-500/20 text-cyan-400 rounded border border-cyan-500/30">
                    {template.repeatable}
                  </span>
                )}
              </div>
              <p className="text-sm text-white/50">
                {template.description}
              </p>
            </div>
          </div>

          {!isTemplate && (
            quest.completed ? (
              <CheckCircle2 className="w-6 h-6 text-green-400 flex-shrink-0" />
            ) : (
              <div className="text-right">
                <div className="text-lg font-bold text-cyan-400">
                  {Math.round(overallProgress)}%
                </div>
                <p className="text-xs text-white/50">Complete</p>
              </div>
            )
          )}
        </div>

        {/* Module Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {template.modules.map(moduleId => {
            const moduleData = LIFEOS_MODULES[moduleId];
            const ModuleIcon = MODULE_ICONS[moduleId] || Target;

            return (
              <span
                key={moduleId}
                className={`
                  flex items-center gap-1 px-2 py-1 rounded text-xs
                  bg-gradient-to-r ${moduleData?.color || 'from-gray-500 to-gray-600'} bg-opacity-20
                  border border-white/10
                `}
              >
                <ModuleIcon className="w-3 h-3" />
                {moduleData?.label || moduleId}
              </span>
            );
          })}
        </div>

        {/* Requirements Progress (for active quests) */}
        {!isTemplate && (
          <div className="space-y-3 mb-4">
            {template.requirements.map((req, index) => {
              const moduleData = LIFEOS_MODULES[req.module];
              const ModuleIcon = MODULE_ICONS[req.module] || Target;
              const isComplete = quest.requirementsMet[index];
              const progress = quest.progress[index];
              const target = req.count || 1;

              return (
                <div
                  key={index}
                  className={`
                    flex items-center gap-3 p-3 rounded-lg
                    ${isComplete ? 'bg-green-500/10 border border-green-500/20' : 'bg-white/5 border border-white/5'}
                  `}
                >
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center
                    ${isComplete ? 'bg-green-500' : `bg-gradient-to-br ${moduleData?.color || 'from-gray-500 to-gray-600'}`}
                  `}>
                    {isComplete ? (
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    ) : (
                      <ModuleIcon className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className={`text-sm ${isComplete ? 'text-green-400' : 'text-white'}`}>
                        {moduleData?.label}: {req.type.replace(/_/g, ' ')}
                      </span>
                      <span className={`text-xs font-medium ${isComplete ? 'text-green-400' : 'text-white/60'}`}>
                        {progress}/{target}
                      </span>
                    </div>
                    {!isComplete && (
                      <div className="mt-1 h-1 bg-[#0c0a10] rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${moduleData?.color || 'from-gray-500 to-gray-600'}`}
                          style={{ width: `${Math.min((progress / target) * 100, 100)}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Requirements Preview (for templates) */}
        {isTemplate && (
          <div className="space-y-2 mb-4">
            {template.requirements.map((req, index) => {
              const moduleData = LIFEOS_MODULES[req.module];
              const ModuleIcon = MODULE_ICONS[req.module] || Target;

              return (
                <div
                  key={index}
                  className="flex items-center gap-2 text-sm text-white/60"
                >
                  <Circle className="w-3 h-3" />
                  <span>
                    {moduleData?.label}: {req.type.replace(/_/g, ' ')}
                    {req.count > 1 && ` (${req.count})`}
                    {req.before && ` before ${req.before}`}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-white/10">
          {/* Difficulty & Rewards */}
          <div className="flex items-center gap-3 text-sm">
            <span className={`
              px-2 py-1 rounded text-xs
              bg-gradient-to-r ${difficulty.color} text-white
            `}>
              {difficulty.label}
            </span>
            <div className="flex items-center gap-1 text-green-400">
              <Trophy className="w-4 h-4" />
              <span>+{template.xpReward}</span>
            </div>
            <div className="flex items-center gap-1 text-yellow-400">
              <Zap className="w-4 h-4" />
              <span>+{template.creditsReward}</span>
            </div>
          </div>

          {/* Action Button */}
          {isTemplate && (
            <button
              onClick={() => handleActivateQuest(template.id)}
              className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-sm font-medium rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all"
            >
              <Play className="w-4 h-4" />
              Start Quest
            </button>
          )}

          {!isTemplate && quest.completed && (
            <span className="text-xs text-green-400 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              Completed
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
              <Globe className="w-6 h-6 text-cyan-400" />
              Cross-Module Quests
            </h2>
            <p className="text-white/60">
              Unite your efforts across multiple life domains for greater rewards
            </p>
          </div>
          <button
            onClick={() => setShowAvailable(!showAvailable)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
              ${showAvailable
                ? 'bg-cyan-500 text-white'
                : 'bg-[#1a1724] text-white border border-white/10 hover:border-cyan-500/50'}
            `}
          >
            <Plus className="w-4 h-4" />
            {showAvailable ? 'Hide Available' : 'Start New Quest'}
          </button>
        </div>
      </div>

      {/* Available Templates */}
      {showAvailable && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-400" />
            Available Quests
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {availableTemplates.map(template => renderQuestCard(template, true))}
          </div>
        </div>
      )}

      {/* Active Cross-Module Quests */}
      {activeQuests.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-cyan-400" />
            Active Quests ({activeQuests.length})
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {activeQuests.map(quest => renderQuestCard(quest))}
          </div>
        </div>
      )}

      {/* Completed Cross-Module Quests */}
      {completedQuests.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-white flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-400" />
            Completed ({completedQuests.length})
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {completedQuests.map(quest => renderQuestCard(quest))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {activeQuests.length === 0 && !showAvailable && (
        <div className="text-center py-12 bg-[#1a1724] border border-white/10 rounded-xl">
          <Globe className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Active Cross-Module Quests</h3>
          <p className="text-white/60 mb-6">
            Start a cross-module quest to earn bonus rewards by completing tasks across multiple life areas.
          </p>
          <button
            onClick={() => setShowAvailable(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium rounded-xl hover:from-cyan-600 hover:to-blue-600 transition-all"
          >
            <Plus className="w-5 h-5" />
            Browse Available Quests
          </button>
        </div>
      )}

      {/* Tip */}
      <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-5">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-white mb-1">Cross-Module Synergy</h4>
            <p className="text-sm text-white/60">
              Cross-module quests encourage a balanced approach to self-improvement. By working on multiple life areas simultaneously,
              you'll develop stronger habits and earn 50% more XP than single-module quests!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
