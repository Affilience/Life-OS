/**
 * Entry Full View Component
 * Full-screen overlay for viewing/editing journal entries
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { X, Save, Trash2, Sparkles, Edit3 } from 'lucide-react';
import { DayISO, JournalEntry } from './journal.types';
import { getEntryByDate, upsertEntry, deleteEntry } from './journal.adapter.mock';

interface EntryFullViewProps {
  dateISO: DayISO;
  open: boolean;
  onClose: () => void;
}

export function EntryFullView({ dateISO, open, onClose }: EntryFullViewProps) {
  const navigate = useNavigate();
  const [entry, setEntry] = useState<JournalEntry | null>(null);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load entry when opened
  useEffect(() => {
    if (open && dateISO) {
      loadEntry();
    }
  }, [open, dateISO]);

  const loadEntry = async () => {
    setLoading(true);
    try {
      const data = await getEntryByDate(dateISO);
      setEntry(data);
      setTitle(data?.title || '');
      setBody(data?.body || '');
    } catch (error) {
      console.error('Failed to load entry:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updatedEntry: JournalEntry = {
        id: entry?.id || `entry-${dateISO}`,
        date: dateISO,
        hasText: true,
        tags: entry?.tags || [],
        mood: entry?.mood,
        wordCount: body.split(/\s+/).length,
        xpAwarded: entry?.xpAwarded || (entry ? 0 : 25),
        title,
        body,
      };

      await upsertEntry(updatedEntry);
      setEntry(updatedEntry);
    } catch (error) {
      console.error('Failed to save entry:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!entry || !confirm('Delete this journal entry?')) return;

    try {
      await deleteEntry(entry.id);
      onClose();
    } catch (error) {
      console.error('Failed to delete entry:', error);
    }
  };

  const handleClose = () => {
    // TODO: Check for unsaved changes
    onClose();
  };

  const handleEdit = () => {
    if (!dateISO) return;
    const dateParts = dateISO.split('-');
    navigate(`/journal/${dateParts[0]}/${dateParts[1]}/${dateParts[2]}/write`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClose();
    }
  };

  const dateLabel = dateISO ? format(new Date(dateISO), 'EEEE, MMMM d, yyyy') : '';

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          onKeyDown={handleKeyDown}
        >
          <motion.div
            className="relative w-full max-w-5xl h-[90vh] bg-[#12101a] rounded-2xl border border-white/10 shadow-2xl flex flex-col"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div>
                <h2 className="text-2xl font-bold text-white">{dateLabel}</h2>
                {entry?.wordCount && (
                  <p className="text-sm text-white/60 mt-1">{entry.wordCount} words</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleEdit}
                  className="px-4 py-2 bg-[#1a1724] text-zinc-300 rounded-lg hover:bg-[#221e2e] hover:text-white transition-colors flex items-center gap-2"
                >
                  <Edit3 size={16} />
                  <span>Edit</span>
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  <Save size={16} />
                  {saving ? 'Saving...' : 'Save'}
                </button>
                {entry && (
                  <button
                    onClick={handleDelete}
                    className="px-4 py-2 bg-[#1a1724] text-zinc-300 rounded-lg hover:bg-red-900 hover:text-white transition-colors flex items-center gap-2"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
                <button
                  onClick={handleClose}
                  className="p-2 text-white/60 hover:text-white hover:bg-[#1a1724] rounded-lg transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex overflow-hidden">
              {/* Editor */}
              <div className="flex-1 p-6 overflow-y-auto">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Entry title..."
                      className="w-full bg-transparent border-none outline-none text-3xl font-bold text-white placeholder-zinc-600"
                    />
                    <textarea
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      placeholder="Write your thoughts..."
                      className="w-full h-96 bg-transparent border-none outline-none text-lg text-zinc-300 placeholder-zinc-600 resize-none"
                    />
                  </div>
                )}
              </div>

              {/* AI Insights Panel */}
              <div className="w-80 border-l border-white/10 p-6 overflow-y-auto bg-[#0c0a10]">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles size={18} className="text-violet-400" />
                  <h3 className="text-lg font-semibold text-white">AI Insights</h3>
                </div>

                {entry ? (
                  <div className="space-y-4 text-sm text-white/60">
                    <div>
                      <div className="font-medium text-zinc-300 mb-1">Summary</div>
                      <p>This entry captures your thoughts and progress for the day.</p>
                    </div>

                    {entry.tags.length > 0 && (
                      <div>
                        <div className="font-medium text-zinc-300 mb-2">Tags</div>
                        <div className="flex flex-wrap gap-2">
                          {entry.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-1 bg-violet-500/20 text-violet-300 rounded text-xs"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {entry.mood && (
                      <div>
                        <div className="font-medium text-zinc-300 mb-1">Mood</div>
                        <p className="capitalize">{entry.mood}</p>
                      </div>
                    )}

                    <div>
                      <div className="font-medium text-zinc-300 mb-1">Reflection Prompts</div>
                      <ul className="space-y-2">
                        <li>• What went well today?</li>
                        <li>• What could be improved?</li>
                        <li>• What did you learn?</li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-white/50 italic">Start writing to see AI insights...</p>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
