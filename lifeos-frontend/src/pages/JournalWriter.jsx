import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Save, X, Calendar, Tag, Smile, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { journalDB, settingsDB } from '../db/journalDB';
import { triggerGamification } from '../hooks/useGamification';
import './JournalWriter.css';

// Font family mappings
const FONT_FAMILIES = {
  caveat: "'Caveat', cursive",
  merriweather: "'Merriweather', serif",
  lora: "'Lora', serif",
  opensans: "'Open Sans', sans-serif",
  playfair: "'Playfair Display', serif",
};

export default function JournalWriter() {
  const navigate = useNavigate();
  const location = useLocation();
  const contentRef = useRef(null);

  // Check if we're editing an existing entry
  const editingEntry = location.state?.entry || null;
  const isEditing = !!editingEntry;

  const [entry, setEntry] = useState({
    id: editingEntry?.id || null,
    date: editingEntry?.date || format(new Date(), 'yyyy-MM-dd'),
    title: editingEntry?.title || '',
    content: editingEntry?.content || '',
    mood: editingEntry?.mood || null,
    tags: editingEntry?.tags || []
  });

  const [wordCount, setWordCount] = useState(0);
  const [saving, setSaving] = useState(false);
  const [font, setFont] = useState('caveat');

  useEffect(() => {
    // Focus on content area
    if (contentRef.current) {
      contentRef.current.focus();
    }
  }, []);

  // Load font setting
  useEffect(() => {
    const loadFontSetting = async () => {
      try {
        const coverSettings = await settingsDB.get('journalCover');
        if (coverSettings?.font) {
          setFont(coverSettings.font);
        }
      } catch (error) {
        console.error('Failed to load font setting:', error);
      }
    };
    loadFontSetting();
  }, []);

  useEffect(() => {
    // Update word count
    const words = entry.content.trim().split(/\s+/).filter(Boolean).length;
    setWordCount(words);
  }, [entry.content]);

  const handleSave = async () => {
    if (!entry.content.trim()) {
      alert('Please write something before saving');
      return;
    }

    setSaving(true);

    try {
      if (isEditing && entry.id) {
        // Update existing entry
        await journalDB.updateEntry(entry.id, {
          date: entry.date,
          title: entry.title,
          content: entry.content,
          mood: entry.mood,
          tags: entry.tags,
          wordCount
        });
      } else {
        // Create new entry
        await journalDB.addEntry({
          ...entry,
          wordCount
        });

        // Award XP based on word count - only for new entries
        const baseXP = 20;
        const bonusXP = Math.min(Math.floor(wordCount / 50) * 5, 30);
        triggerGamification('journalEntry', { xpOverride: baseXP + bonusXP, module: 'journal' });
      }

      navigate('/journal');
    } catch (error) {
      console.error('Failed to save entry:', error);
      alert('Failed to save entry. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!isEditing || !entry.id) return;

    if (window.confirm('Are you sure you want to delete this entry? This cannot be undone.')) {
      try {
        await journalDB.deleteEntry(entry.id);
        navigate('/journal');
      } catch (error) {
        console.error('Failed to delete entry:', error);
        alert('Failed to delete entry. Please try again.');
      }
    }
  };

  const handleCancel = () => {
    if (entry.content.trim() && !window.confirm('Discard this entry?')) {
      return;
    }
    navigate('/journal');
  };

  return (
    <div className="journal-writer">
      {/* Writer Paper */}
      <div className="writer-paper">
        {/* Header */}
        <div className="writer-header">
          <div className="writer-date" data-tour="writer-date">
            <Calendar size={16} />
            <input
              type="date"
              value={entry.date}
              onChange={(e) => setEntry({ ...entry, date: e.target.value })}
              className="date-input"
            />
          </div>

          <div className="writer-actions">
            {isEditing && (
              <button onClick={handleDelete} className="delete-btn">
                <Trash2 size={20} />
                Delete
              </button>
            )}
            <button onClick={handleCancel} className="cancel-btn">
              <X size={20} />
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !entry.content.trim()}
              className="save-btn"
              data-tour="save-entry-btn"
            >
              <Save size={20} />
              {saving ? 'Saving...' : isEditing ? 'Update Entry' : 'Save Entry'}
            </button>
          </div>
        </div>

        {/* Title */}
        <input
          type="text"
          placeholder="Entry title (optional)"
          value={entry.title}
          onChange={(e) => setEntry({ ...entry, title: e.target.value })}
          className="title-input"
          style={{ fontFamily: FONT_FAMILIES[font] }}
        />

        {/* Content */}
        <textarea
          ref={contentRef}
          placeholder="Start writing..."
          value={entry.content}
          onChange={(e) => setEntry({ ...entry, content: e.target.value })}
          className="content-textarea"
          data-tour="writer-content"
          style={{ fontFamily: FONT_FAMILIES[font] }}
        />

        {/* Footer */}
        <div className="writer-footer">
          <div className="word-count">
            {wordCount} {wordCount === 1 ? 'word' : 'words'}
          </div>

          <div className="mood-selector" data-tour="mood-tracker">
            <Smile size={16} />
            <span>Mood:</span>
            <div className="mood-options">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                <button
                  key={value}
                  onClick={() => setEntry({ ...entry, mood: value })}
                  className={`mood-btn ${entry.mood === value ? 'active' : ''}`}
                  title={`Mood: ${value}/10`}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Side Panel */}
      <div className="writer-side-panel">
        <div className="panel-section">
          <h3>
            <Tag size={16} />
            Tags
          </h3>
          <p className="panel-hint">Add tags to organise your entries</p>
          <input
            type="text"
            placeholder="Add tags (coming soon)"
            disabled
            className="tags-input"
          />
        </div>

        <div className="panel-section">
          <h3>Writing Tips</h3>
          <ul className="tips-list">
            <li>Write without editing - let thoughts flow</li>
            <li>Be honest with yourself</li>
            <li>Focus on feelings, not just events</li>
            <li>Review past entries to see growth</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
