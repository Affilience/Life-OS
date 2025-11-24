/**
 * QuestAddInline Component
 * Inline quest creation form with expandable options
 */

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quest, QuestKind, QuestPriority, QUEST_KIND_LABELS } from './QuestTypes';
import { Plus } from 'lucide-react';

interface QuestAddInlineProps {
  defaultXp?: number;
  onCreate: (quest: Partial<Quest>) => void;
  prefill?: Partial<Quest>;
}

export function QuestAddInline({ defaultXp = 50, onCreate, prefill }: QuestAddInlineProps) {
  const [title, setTitle] = useState(prefill?.title || '');
  const [kind, setKind] = useState<QuestKind>(prefill?.kind || 'focus');
  const [priority, setPriority] = useState<QuestPriority>(prefill?.priority || 'medium');
  const [xp, setXp] = useState(prefill?.xp || defaultXp);
  const [dueTime, setDueTime] = useState(prefill?.due ? new Date(prefill.due).toTimeString().slice(0, 5) : '21:00');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const today = new Date().toISOString().split('T')[0];
    const dueDateTime = `${today}T${dueTime}:00`;

    onCreate({
      title: title.trim(),
      kind,
      priority,
      xp,
      due: dueDateTime,
      aiSuggested: prefill?.aiSuggested,
    });

    // Reset form
    setTitle('');
    setKind('focus');
    setPriority('medium');
    setXp(defaultXp);
    setDueTime('21:00');
    setIsFocused(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    } else if (e.key === 'Escape') {
      setIsFocused(false);
      inputRef.current?.blur();
    }
  };

  return (
    <motion.form
      layout
      onSubmit={handleSubmit}
      className="bg-zinc-900 rounded-lg border border-zinc-800 p-3 transition-all duration-200"
      style={{
        boxShadow: isFocused ? '0 0 0 2px rgba(122, 92, 255, 0.3)' : 'none',
      }}
    >
      {/* Title input */}
      <div className="flex items-center gap-2">
        <Plus size={18} className="text-zinc-500" />
        <input
          ref={inputRef}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onKeyDown={handleKeyDown}
          placeholder="Add a quest… (enter to save)"
          className="flex-1 bg-transparent text-white placeholder-zinc-500 text-base focus:outline-none"
        />
      </div>

      {/* Expanded options */}
      <AnimatePresence>
        {isFocused && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-3 flex flex-wrap items-center gap-3 pt-3 border-t border-zinc-800"
          >
            {/* Kind select */}
            <div className="flex items-center gap-2">
              <label className="text-xs text-zinc-500">Type:</label>
              <select
                value={kind}
                onChange={(e) => setKind(e.target.value as QuestKind)}
                className="bg-zinc-800 text-white text-sm rounded px-2 py-1 border border-zinc-700 focus:border-violet-500 focus:outline-none"
              >
                {Object.entries(QUEST_KIND_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority select */}
            <div className="flex items-center gap-2">
              <label className="text-xs text-zinc-500">Priority:</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as QuestPriority)}
                className="bg-zinc-800 text-white text-sm rounded px-2 py-1 border border-zinc-700 focus:border-violet-500 focus:outline-none"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            {/* XP select */}
            <div className="flex items-center gap-2">
              <label className="text-xs text-zinc-500">XP:</label>
              <select
                value={xp}
                onChange={(e) => setXp(Number(e.target.value))}
                className="bg-zinc-800 text-white text-sm rounded px-2 py-1 border border-zinc-700 focus:border-violet-500 focus:outline-none"
              >
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
                <option value="200">200</option>
              </select>
            </div>

            {/* Due time */}
            <div className="flex items-center gap-2">
              <label className="text-xs text-zinc-500">Due:</label>
              <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="bg-zinc-800 text-white text-sm rounded px-2 py-1 border border-zinc-700 focus:border-violet-500 focus:outline-none"
              />
            </div>

            {/* Submit button */}
            <button
              type="submit"
              className="ml-auto px-4 py-1.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded transition-colors"
            >
              Add Quest
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.form>
  );
}
