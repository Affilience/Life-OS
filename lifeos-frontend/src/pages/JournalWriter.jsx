import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, X, Calendar, Tag, Smile } from 'lucide-react';
import { format } from 'date-fns';
import { journalDB } from '../db/journalDB';
import './JournalWriter.css';

export default function JournalWriter() {
  const navigate = useNavigate();
  const contentRef = useRef(null);

  const [entry, setEntry] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    title: '',
    content: '',
    mood: null,
    tags: []
  });

  const [wordCount, setWordCount] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Focus on content area
    if (contentRef.current) {
      contentRef.current.focus();
    }
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
      await journalDB.addEntry({
        ...entry,
        wordCount
      });

      navigate('/journal');
    } catch (error) {
      console.error('Failed to save entry:', error);
      alert('Failed to save entry. Please try again.');
    } finally {
      setSaving(false);
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
          <div className="writer-date">
            <Calendar size={16} />
            <input
              type="date"
              value={entry.date}
              onChange={(e) => setEntry({ ...entry, date: e.target.value })}
              className="date-input"
            />
          </div>

          <div className="writer-actions">
            <button onClick={handleCancel} className="cancel-btn">
              <X size={20} />
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !entry.content.trim()}
              className="save-btn"
            >
              <Save size={20} />
              {saving ? 'Saving...' : 'Save Entry'}
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
        />

        {/* Content */}
        <textarea
          ref={contentRef}
          placeholder="Start writing..."
          value={entry.content}
          onChange={(e) => setEntry({ ...entry, content: e.target.value })}
          className="content-textarea"
        />

        {/* Footer */}
        <div className="writer-footer">
          <div className="word-count">
            {wordCount} {wordCount === 1 ? 'word' : 'words'}
          </div>

          <div className="mood-selector">
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
          <p className="panel-hint">Add tags to organize your entries</p>
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
