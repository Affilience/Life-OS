/**
 * Journal Write Page
 * Ultra-minimal blank canvas for writing journal entries
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { X, Check, Tag as TagIcon } from 'lucide-react';
import { haptics } from '../utils/haptics';
import { getEntryByDate, upsertEntry } from '../features/journal/journal.adapter.mock';

export default function JournalWrite() {
  const { year, month, day } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Generate date from params
  const dateISO = `${year}-${month}-${day}`;
  const dateLabel = format(new Date(dateISO), 'EEEE, MMMM d, yyyy');

  // Load existing entry if it exists
  useEffect(() => {
    const loadEntry = async () => {
      try {
        const entry = await getEntryByDate(dateISO);
        if (entry) {
          setTitle(entry.title || '');
          setBody(entry.body || '');
          setTags(entry.tags || []);
        }
      } catch (error) {
        console.error('Failed to load entry:', error);
      } finally {
        setLoaded(true);
      }
    };

    loadEntry();
  }, [dateISO]);

  // Handle tag addition
  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setTagInput('');
    }
  };

  // Handle tag removal
  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  // Handle tag input key press
  const handleTagInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  // Handle save
  const handleSave = async () => {
    setSaving(true);
    try {
      const entry = {
        id: `entry-${dateISO}`,
        date: dateISO,
        hasText: true,
        tags,
        wordCount: body.split(/\s+/).filter(word => word.length > 0).length,
        xpAwarded: 25,
        title,
        body,
      };

      await upsertEntry(entry);

      // Success haptic feedback for saving journal entry
      await haptics.success();
      await haptics.medium();

      // Navigate back to month view
      navigate(`/journal/${year}/${month}`);
    } catch (error) {
      console.error('Failed to save entry:', error);
      await haptics.error();
    } finally {
      setSaving(false);
    }
  };

  // Handle close without saving
  const handleClose = () => {
    const hasChanges = title.trim() !== '' || body.trim() !== '';
    if (hasChanges && !confirm('You have unsaved changes. Are you sure you want to leave?')) {
      return;
    }
    navigate(`/journal/${year}/${month}`);
  };

  // Keyboard shortcuts
  const handleKeyDown = (e) => {
    // Save with Ctrl/Cmd + S
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      handleSave();
    }
    // Close with Escape
    if (e.key === 'Escape') {
      handleClose();
    }
  };

  if (!loaded) {
    return (
      <div className="min-h-screen bg-[#0c0a10] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500" />
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen bg-[#0c0a10] text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      onKeyDown={handleKeyDown}
    >
      {/* Minimal Header - accounts for sidebar */}
      <div className="fixed top-16 left-[280px] right-0 z-50 bg-[#0c0a10]/95 backdrop-blur-sm border-b border-white/10/30">
        <div className="max-w-5xl mx-auto px-8 py-5 flex items-center justify-between">
          <div className="text-sm text-white/50">{dateLabel}</div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2.5 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-all flex items-center gap-2 disabled:opacity-50 font-medium shadow-lg shadow-violet-500/20"
            >
              <Check size={18} />
              {saving ? 'Saving...' : 'Save'}
            </button>

            <button
              onClick={handleClose}
              className="p-2.5 text-white/50 hover:text-white hover:bg-[#1a1724]/50 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Writing Canvas */}
      <div className="max-w-5xl mx-auto px-12 pt-28 pb-16">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="space-y-8"
        >
          {/* Title Input */}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Untitled"
            className="w-full bg-transparent border-none outline-none text-5xl font-bold text-white placeholder-zinc-800 focus:placeholder-zinc-700 transition-colors"
            autoFocus
          />

          {/* Body Textarea */}
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full min-h-[55vh] bg-transparent border-none outline-none text-xl text-zinc-300 placeholder-zinc-800 focus:placeholder-zinc-700 resize-none leading-relaxed transition-colors"
            style={{ fontFamily: 'inherit' }}
          />

          {/* Tags Section */}
          <div className="pt-8 border-t border-white/10/30">
            <div className="flex items-center gap-2 mb-3">
              <TagIcon size={16} className="text-zinc-600" />
              <span className="text-sm text-zinc-600">Tags</span>
            </div>

            {/* Tag Display */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-violet-500/10 border border-violet-500/20 rounded-full text-sm text-violet-400 flex items-center gap-2 hover:bg-violet-500/20 transition-colors group"
                  >
                    #{tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="opacity-50 group-hover:opacity-100 hover:text-violet-300 transition-opacity"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Tag Input */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagInputKeyDown}
                placeholder="Add a tag..."
                className="flex-1 px-4 py-2 bg-[#12101a]/50 border border-white/10/50 rounded-lg text-zinc-300 placeholder-zinc-700 focus:outline-none focus:border-violet-500/30 transition-colors text-sm"
              />
              <button
                onClick={handleAddTag}
                disabled={!tagInput.trim()}
                className="px-4 py-2 bg-[#1a1724] hover:bg-[#221e2e] text-white/60 hover:text-white rounded-lg transition-colors text-sm disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Add
              </button>
            </div>
            <div className="text-xs text-zinc-700 mt-2">
              Press Enter to add a tag
            </div>
          </div>
        </motion.div>
      </div>

      {/* Subtle word count */}
      {body.trim() && (
        <div className="fixed bottom-6 left-6 text-sm text-zinc-600">
          {body.split(/\s+/).filter(word => word.length > 0).length} words
        </div>
      )}
    </motion.div>
  );
}
