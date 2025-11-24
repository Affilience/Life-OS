/**
 * QuestBoard Component
 * Main quest board with drag-to-reorder and animations
 */

import React, { useState, useEffect, useRef } from 'react';
import { Reorder } from 'framer-motion';
import { useQuestStore } from './useQuestStore';
import { QuestCard } from './QuestCard';
import { QuestAddInline } from './QuestAddInline';
import { QuestClaimModal } from './QuestClaimModal';
import { QuestKbdShortcuts } from './QuestKbdShortcuts';
import { Quest } from './QuestTypes';
import { getAISuggestions } from './QuestService.mock';
import { Sparkles, Target } from 'lucide-react';

interface QuestBoardProps {
  onClaimXp?: (xp: number) => void;
  onAskCoach?: () => void;
  compact?: boolean;
}

export function QuestBoard({ onClaimXp, onAskCoach, compact = false }: QuestBoardProps) {
  const { quests, add, toggleComplete, claim, remove, reorder, hydrate } = useQuestStore();
  const [claimModalQuest, setClaimModalQuest] = useState<Quest | null>(null);
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<Partial<Quest>[]>([]);
  const addInputRef = useRef<HTMLDivElement>(null);

  // Hydrate on mount
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // Load AI suggestions
  const handleLoadAISuggestions = () => {
    setAiSuggestions(getAISuggestions());
    setShowAISuggestions(!showAISuggestions);
  };

  // Handle quest claim
  const handleClaim = (quest: Quest) => {
    setClaimModalQuest(quest);
  };

  const handleConfirmClaim = (xp: number) => {
    if (claimModalQuest) {
      claim(claimModalQuest.id);
      onClaimXp?.(xp);
    }
  };

  // Calculate stats
  const activeQuests = quests.filter((q) => q.status === 'active');
  const totalActiveXp = activeQuests.reduce((sum, q) => sum + q.xp, 0);

  // Sort quests by order and status
  const sortedQuests = [...quests].sort((a, b) => {
    // Claimed quests go to bottom
    if (a.status === 'claimed' && b.status !== 'claimed') return 1;
    if (b.status === 'claimed' && a.status !== 'claimed') return -1;
    return a.order - b.order;
  });

  // Handle reorder
  const handleReorder = (newOrder: Quest[]) => {
    reorder(newOrder);
  };

  // Keyboard shortcuts
  const focusAddInput = () => {
    const input = addInputRef.current?.querySelector('input');
    input?.focus();
  };

  return (
    <div className={`bg-[#12101a] rounded-xl border border-white/10 overflow-hidden ${compact ? 'p-4' : 'p-6'}`}>
      {/* Keyboard shortcuts */}
      <QuestKbdShortcuts onAddQuest={focusAddInput} />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Today's Quests</h2>
          <div className="flex items-center gap-3 mt-1 text-sm">
            <span className="text-white/60">
              {activeQuests.length} active
            </span>
            <span className="text-zinc-600">•</span>
            <span className="text-violet-400 font-semibold">
              {totalActiveXp} XP available
            </span>
          </div>
        </div>

        {/* AI Avatar chip */}
        <div className="relative">
          <button
            onClick={handleLoadAISuggestions}
            className="flex items-center gap-2 px-4 py-2 bg-[#1a1724] hover:bg-[#221e2e] border border-white/15 hover:border-violet-500 rounded-lg transition-all duration-200"
          >
            <Sparkles size={16} className="text-violet-400" />
            <span className="text-sm text-white">AI Suggestions</span>
          </button>

          {showAISuggestions && aiSuggestions.length > 0 && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowAISuggestions(false)}
              />
              <div className="absolute right-0 top-12 z-20 w-80 bg-[#1a1724] border border-white/15 rounded-lg shadow-xl overflow-hidden">
                <div className="p-3 border-b border-white/15">
                  <h3 className="text-sm font-semibold text-white">Suggested Quests</h3>
                </div>
                <div className="p-2 space-y-2 max-h-96 overflow-y-auto">
                  {aiSuggestions.map((suggestion, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        add(suggestion);
                        setShowAISuggestions(false);
                      }}
                      className="w-full text-left px-3 py-2 bg-[#12101a] hover:bg-[#221e2e] rounded transition-colors"
                    >
                      <div className="text-sm text-white font-medium">{suggestion.title}</div>
                      <div className="text-xs text-white/60 mt-0.5">
                        +{suggestion.xp} XP • {suggestion.kind}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Add quest inline */}
      <div ref={addInputRef} className="mb-4">
        <QuestAddInline onCreate={add} />
      </div>

      {/* Quest list */}
      {sortedQuests.length > 0 ? (
        <Reorder.Group
          axis="y"
          values={sortedQuests}
          onReorder={handleReorder}
          className="space-y-3"
        >
          {sortedQuests.map((quest) => (
            <Reorder.Item
              key={quest.id}
              value={quest}
              dragListener={quest.status !== 'claimed'}
              dragControls={undefined}
            >
              <QuestCard
                quest={quest}
                onToggle={() => toggleComplete(quest.id)}
                onClaim={() => handleClaim(quest)}
                onEdit={() => {
                  // TODO: Implement edit modal
                  console.log('Edit quest:', quest.id);
                }}
                onDelete={() => remove(quest.id)}
              />
            </Reorder.Item>
          ))}
        </Reorder.Group>
      ) : (
        // Empty state
        <div className="py-16 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-[#1a1724] rounded-full flex items-center justify-center">
            <Target size={28} className="text-zinc-600" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Nothing yet</h3>
          <p className="text-sm text-white/60 mb-6 max-w-xs mx-auto">
            Add your first quest or ask your coach for suggestions.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={focusAddInput}
              className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Add Quest
            </button>
            {onAskCoach && (
              <button
                onClick={onAskCoach}
                className="px-4 py-2 bg-[#1a1724] hover:bg-[#221e2e] text-white text-sm font-medium rounded-lg transition-colors"
              >
                Ask Coach
              </button>
            )}
          </div>
        </div>
      )}

      {/* Claim modal */}
      <QuestClaimModal
        quest={claimModalQuest}
        open={!!claimModalQuest}
        onClose={() => setClaimModalQuest(null)}
        onConfirm={handleConfirmClaim}
      />
    </div>
  );
}
