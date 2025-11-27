import React, { useState } from 'react';
import {
  Trophy,
  Zap,
  Target,
  CheckCircle2,
  Circle,
  Lock,
  ChevronRight,
  Star,
  Award,
  Sparkles,
  Play,
  Crown
} from 'lucide-react';
import useQuestsStore, { QUEST_CHAIN_TEMPLATES, LIFEOS_MODULES } from '../../stores/questsStore';

export default function QuestChains() {
  const { getAllQuestChains, startQuestChain, getQuestChainProgress } = useQuestsStore();
  const [selectedChain, setSelectedChain] = useState(null);

  const allChains = getAllQuestChains();

  // Categorize chains
  const availableChains = allChains.filter(c => !c.started);
  const activeChains = allChains.filter(c => c.started && !c.isComplete);
  const completedChains = allChains.filter(c => c.isComplete);

  const handleStartChain = (chainId) => {
    startQuestChain(chainId);
    setSelectedChain(chainId);
  };

  const renderChainCard = (chain, status) => {
    const moduleData = LIFEOS_MODULES[chain.module] || { color: 'from-gray-500 to-gray-600', label: chain.module };

    return (
      <div
        key={chain.id}
        onClick={() => setSelectedChain(selectedChain === chain.id ? null : chain.id)}
        className={`
          relative bg-[#1a1724] border rounded-xl p-5 cursor-pointer
          transition-all duration-200 hover:scale-[1.02]
          ${chain.isComplete ? 'border-green-500/50 bg-green-500/5' :
            chain.started ? 'border-purple-500/50' : 'border-white/10 hover:border-purple-500/30'}
        `}
      >
        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          <div className={`
            p-3 rounded-xl text-3xl
            bg-gradient-to-br ${chain.isComplete ? 'from-green-500 to-emerald-500' : moduleData.color}
          `}>
            {chain.icon}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className={`
                text-lg font-semibold
                ${chain.isComplete ? 'text-white/60' : 'text-white'}
              `}>
                {chain.title}
              </h3>
              {chain.isComplete && (
                <CheckCircle2 className="w-5 h-5 text-green-400" />
              )}
            </div>
            <p className="text-sm text-white/50">
              {chain.description}
            </p>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-white/60">Chapter Progress</span>
            <span className={`font-medium ${chain.isComplete ? 'text-green-400' : 'text-purple-400'}`}>
              {chain.completedSteps?.length || 0}/{chain.totalSteps}
            </span>
          </div>
          <div className="h-2 bg-[#0c0a10] rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${chain.isComplete ? 'from-green-500 to-emerald-500' : moduleData.color} transition-all duration-300`}
              style={{ width: `${chain.percentComplete}%` }}
            />
          </div>
        </div>

        {/* Step Indicators */}
        <div className="flex items-center gap-1 mb-4">
          {chain.steps.map((step, index) => {
            const isCompleted = chain.completedSteps?.includes(step.id) || false;
            const isCurrent = chain.currentStep === step.id;

            return (
              <div
                key={step.id}
                className={`
                  flex-1 h-8 rounded flex items-center justify-center text-xs font-medium
                  ${isCompleted ? `bg-gradient-to-br ${moduleData.color} text-white` :
                    isCurrent ? 'bg-purple-500/20 border border-purple-500/50 text-purple-400' :
                    'bg-[#0c0a10] text-white/40'}
                `}
              >
                {isCompleted ? <CheckCircle2 className="w-4 h-4" /> :
                 isCurrent ? index + 1 :
                 <Lock className="w-3 h-3" />}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-white/10">
          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center gap-1 text-green-400">
              <Trophy className="w-4 h-4" />
              <span>+{chain.rewards.xp}</span>
            </div>
            <div className="flex items-center gap-1 text-yellow-400">
              <Zap className="w-4 h-4" />
              <span>+{chain.rewards.credits}</span>
            </div>
          </div>

          {!chain.started && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleStartChain(chain.id);
              }}
              className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
            >
              <Play className="w-4 h-4" />
              Start Quest
            </button>
          )}

          {chain.started && !chain.isComplete && (
            <span className="text-xs text-purple-400 flex items-center gap-1">
              <Sparkles className="w-4 h-4" />
              In Progress
            </span>
          )}

          {chain.isComplete && (
            <span className="text-xs text-green-400 flex items-center gap-1">
              <Award className="w-4 h-4" />
              Completed
            </span>
          )}
        </div>

        {/* Expanded Detail View */}
        {selectedChain === chain.id && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <h4 className="text-sm font-semibold text-white mb-3">Quest Line</h4>
            <div className="space-y-3">
              {chain.steps.map((step, index) => {
                const isCompleted = chain.completedSteps?.includes(step.id) || false;
                const isCurrent = chain.currentStep === step.id;
                const isLocked = !isCompleted && !isCurrent;

                return (
                  <div
                    key={step.id}
                    className={`
                      flex items-start gap-3 p-3 rounded-lg
                      ${isCompleted ? 'bg-green-500/10 border border-green-500/20' :
                        isCurrent ? 'bg-purple-500/10 border border-purple-500/30' :
                        'bg-white/5 border border-white/5 opacity-60'}
                    `}
                  >
                    {/* Step Number */}
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                      ${isCompleted ? 'bg-green-500 text-white' :
                        isCurrent ? 'bg-purple-500 text-white' :
                        'bg-white/10 text-white/40'}
                    `}>
                      {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : index + 1}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h5 className={`font-medium ${isLocked ? 'text-white/40' : 'text-white'}`}>
                          Chapter {index + 1}: {step.title}
                        </h5>
                        {isCurrent && (
                          <span className="text-xs px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded">
                            Current
                          </span>
                        )}
                      </div>
                      <p className={`text-sm ${isLocked ? 'text-white/30' : 'text-white/60'}`}>
                        {isLocked ? '???' : step.description}
                      </p>
                    </div>

                    {/* Arrow */}
                    {index < chain.steps.length - 1 && (
                      <ChevronRight className={`w-4 h-4 ${isLocked ? 'text-white/20' : 'text-white/40'}`} />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Final Reward Preview */}
            <div className="mt-4 p-4 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="w-5 h-5 text-yellow-400" />
                <h5 className="font-semibold text-white">Final Rewards</h5>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-1 text-green-400">
                  <Trophy className="w-4 h-4" />
                  <span>+{chain.rewards.xp} XP</span>
                </div>
                <div className="flex items-center gap-1 text-yellow-400">
                  <Zap className="w-4 h-4" />
                  <span>+{chain.rewards.credits} Credits</span>
                </div>
                <div className="flex items-center gap-1 text-purple-400">
                  <Award className="w-4 h-4" />
                  <span>"{chain.rewards.title}" Title</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
              <Target className="w-6 h-6 text-indigo-400" />
              Quest Chains
            </h2>
            <p className="text-white/60">
              Embark on multi-part journeys to master each aspect of your life
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">{activeChains.length}</div>
              <p className="text-xs text-white/60">Active</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{completedChains.length}</div>
              <p className="text-xs text-white/60">Completed</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white/60">{availableChains.length}</div>
              <p className="text-xs text-white/60">Available</p>
            </div>
          </div>
        </div>
      </div>

      {/* Active Quest Chains */}
      {activeChains.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            Active Journeys ({activeChains.length})
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {activeChains.map(chain => renderChainCard(chain, 'active'))}
          </div>
        </div>
      )}

      {/* Available Quest Chains */}
      {availableChains.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-white flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-400" />
            Available Journeys ({availableChains.length})
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {availableChains.map(chain => renderChainCard(chain, 'available'))}
          </div>
        </div>
      )}

      {/* Completed Quest Chains */}
      {completedChains.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-green-400" />
            Completed Journeys ({completedChains.length})
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {completedChains.map(chain => renderChainCard(chain, 'completed'))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {allChains.length === 0 && (
        <div className="text-center py-12">
          <Target className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Quest Chains Available</h3>
          <p className="text-white/60">New quest chains will appear as you progress!</p>
        </div>
      )}
    </div>
  );
}
