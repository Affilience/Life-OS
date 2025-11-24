import React, { useState } from 'react';
import { Save, FileText } from 'lucide-react';
import './NotesTab.css';

const NotesTab = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('personal');

  const handleSave = () => {
    if (!title.trim() && !content.trim()) {
      alert('Please write something before saving');
      return;
    }

    const note = {
      title: title || 'Untitled Note',
      content,
      category,
      dateCreated: new Date().toISOString(),
    };

    console.log('Note saved:', note);

    // Clear the form
    setTitle('');
    setContent('');

    // Show success message
    alert('Note saved successfully!');
  };

  return (
    <div className="notes-writer">
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
