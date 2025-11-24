/**
 * QuestCard Component
 * Individual quest card with animations and interactions
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Quest, QUEST_KIND_LABELS, QUEST_KIND_COLORS, PRIORITY_COLORS } from './QuestTypes';
import { Check, ChevronDown, ChevronUp, MoreVertical, Trash2, Edit2, GripVertical } from 'lucide-react';

interface QuestCardProps {
  quest: Quest;
  onToggle: () => void;
  onClaim: () => void;
  onEdit: () => void;
  onDelete: () => void;
  dragHandleProps?: any;
}

export function QuestCard({
  quest,
  onToggle,
  onClaim,
  onEdit,
  onDelete,
  dragHandleProps,
}: QuestCardProps) {
  const [showNotes, setShowNotes] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const isActive = quest.status === 'active';
  const isCompleted = quest.status === 'completed';
  const isClaimed = quest.status === 'claimed';

  const dueTime = quest.due ? new Date(quest.due).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: false,
  }) : null;

  const priorityColor = PRIORITY_COLORS[quest.priority];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: isClaimed ? 0.35 : 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`
        relative bg-[#12101a] rounded-lg border border-white/10
        ${isActive ? 'hover:border-white/15 hover:shadow-lg' : ''}
        transition-all duration-200
      `}
      style={{
        opacity: isCompleted ? 0.7 : isClaimed ? 0.35 : 1,
      }}
    >
      {/* Priority stripe */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg"
        style={{ backgroundColor: priorityColor }}
      />

      <div className="flex items-start gap-3 p-4 pl-5">
        {/* Drag handle */}
        {!isClaimed && (
          <div
            {...dragHandleProps}
            className="cursor-grab active:cursor-grabbing text-zinc-600 hover:text-white/60 transition-colors pt-1"
          >
            <GripVertical size={16} />
          </div>
        )}

        {/* Checkbox */}
        <button
          onClick={onToggle}
          disabled={isClaimed}
          className={`
            flex-shrink-0 w-5 h-5 rounded border-2 mt-0.5
            flex items-center justify-center
            transition-all duration-160
            ${isActive ? 'border-zinc-600 hover:border-violet-500' : ''}
            ${isCompleted || isClaimed ? 'border-violet-500 bg-violet-500/20' : ''}
            ${isClaimed ? 'cursor-not-allowed' : 'cursor-pointer'}
          `}
          aria-pressed={isCompleted || isClaimed}
        >
          {(isCompleted || isClaimed) && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <Check size={14} className="text-violet-400" />
            </motion.div>
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <h3
            className={`
              font-semibold text-base leading-tight
              ${isCompleted || isClaimed ? 'line-through text-white/50' : 'text-white'}
            `}
          >
            {quest.title}
            {quest.aiSuggested && (
              <span className="ml-2 text-xs text-violet-400">✨ AI</span>
            )}
          </h3>

          {/* Metadata */}
          <div className="flex items-center gap-3 mt-1.5 text-xs text-white/60">
            <span className={QUEST_KIND_COLORS[quest.kind]}>
              {QUEST_KIND_LABELS[quest.kind]}
            </span>
            {dueTime && (
              <span>
                {dueTime}
              </span>
            )}
            <span className="px-2 py-0.5 bg-violet-500/10 text-violet-400 rounded-full">
              +{quest.xp} XP
            </span>
          </div>

          {/* Notes */}
          {quest.notes && (
            <div className="mt-2">
              <button
                onClick={() => setShowNotes(!showNotes)}
                className="flex items-center gap-1 text-xs text-white/50 hover:text-white/60 transition-colors"
              >
                {showNotes ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                Notes
              </button>
              {showNotes && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-1 text-sm text-white/60"
                >
                  {quest.notes}
                </motion.p>
              )}
            </div>
          )}

          {/* Claim button */}
          {isCompleted && !isClaimed && (
            <motion.button
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={onClaim}
              className="mt-3 px-4 py-1.5 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white text-sm font-medium rounded-lg transition-all duration-200 shadow-lg shadow-violet-500/20"
            >
              Claim +{quest.xp} XP
            </motion.button>
          )}

          {/* Claimed badge */}
          {isClaimed && (
            <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 bg-[#1a1724] text-white/50 text-xs rounded-full">
              <Check size={12} />
              Claimed
            </div>
          )}
        </div>

        {/* Actions */}
        {!isClaimed && (
          <div className="relative flex-shrink-0">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 text-zinc-600 hover:text-white/60 rounded transition-colors"
            >
              <MoreVertical size={16} />
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMenu(false)}
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute right-0 top-8 z-20 w-32 bg-[#1a1724] border border-white/15 rounded-lg shadow-xl overflow-hidden"
                >
                  <button
                    onClick={() => {
                      onEdit();
                      setShowMenu(false);
                    }}
                    className="w-full px-3 py-2 text-left text-sm text-zinc-300 hover:bg-[#221e2e] flex items-center gap-2 transition-colors"
                  >
                    <Edit2 size={14} />
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      onDelete();
                      setShowMenu(false);
                    }}
                    className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-[#221e2e] flex items-center gap-2 transition-colors"
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </motion.div>
              </>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
