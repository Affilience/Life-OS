import React, { useState } from 'react';
import { Save, FileText, Check } from 'lucide-react';
import { useKnowledgeStore } from '../../stores/knowledgeStore';
import './NotesTab.css';

const NotesTab = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('personal');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const { createNote } = useKnowledgeStore();

  const handleSave = () => {
    if (!title.trim() && !content.trim()) {
      alert('Please write something before saving');
      return;
    }

    setIsSaving(true);

    // Map category to tag
    const categoryTags = {
      personal: 'personal',
      work: 'work',
      ideas: 'idea',
      research: 'research',
      meetings: 'meetings'
    };

    // Create note in knowledge store (syncs to Supabase automatically)
    createNote({
      title: title || 'Untitled Note',
      content,
      tags: [categoryTags[category] || category]
    });

    // Clear the form
    setTitle('');
    setContent('');
    setIsSaving(false);

    // Show success message
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  return (
    <div className="notes-writer" data-tour="notes-writer">
      <div className="notes-writer-header">
        <div className="header-left">
          <FileText className="header-icon" size={24} />
          <h2 className="notes-title">Quick Notes</h2>
        </div>
        <button onClick={handleSave} className="save-button">
          <Save size={18} />
          Save Note
        </button>
      </div>

      <div className="notes-form">
        <input
          type="text"
          className="note-title-input"
          placeholder="Note title (optional)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <select
          className="category-select"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="personal">📝 Personal</option>
          <option value="work">💼 Work</option>
          <option value="ideas">💡 Ideas</option>
          <option value="research">🔬 Research</option>
          <option value="meetings">👥 Meetings</option>
        </select>

        <textarea
          className="note-content-input"
          placeholder="Start writing your note..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={20}
        />
      </div>
    </div>
  );
};

export default NotesTab;
