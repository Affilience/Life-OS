import React, { useState } from 'react';
import { Save, Calendar, Tag, Smile, Type, Hash } from 'lucide-react';
import Card from '../shared/Card';
import Button from '../shared/Button';
import MoodSelector from './MoodSelector';
import { feedback } from '../../services/microInteractions';
import './JournalEditor.css';

const JournalEditor = () => {
  const [entry, setEntry] = useState({
    title: '',
    content: '',
    mood: null,
    tags: '',
    date: new Date().toISOString().split('T')[0]
  });

  const [isSaving, setIsSaving] = useState(false);
  const [wordCount, setWordCount] = useState(0);

  const handleContentChange = (e) => {
    const content = e.target.value;
    setEntry(prev => ({ ...prev, content }));
    
    // Calculate word count
    const words = content.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEntry(prev => ({ ...prev, [name]: value }));
  };

  const handleMoodChange = (mood) => {
    setEntry(prev => ({ ...prev, mood }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    // Simulate save operation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const entryData = {
      ...entry,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      wordCount,
      tags: entry.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
    };
    
    console.log('Entry saved:', entryData);
    setIsSaving(false);

    // Trigger satisfying feedback on successful save
    feedback.taskComplete({ celebrate: true });

    // Reset form
    setEntry({
      title: '',
      content: '',
      mood: null,
      tags: '',
      date: new Date().toISOString().split('T')[0]
    });
    setWordCount(0);
  };

  const canSave = entry.title.trim() && entry.content.trim() && entry.mood !== null;

  const prompts = [
    "What are three things that made you smile today?",
    "Describe a challenge you faced and how you handled it.",
    "What are you grateful for in this moment?",
    "If you could relive one moment from today, what would it be?",
    "What did you learn about yourself today?"
  ];

  const [selectedPrompt, setSelectedPrompt] = useState(null);

  const usePrompt = (prompt) => {
    setEntry(prev => ({
      ...prev,
      title: prev.title || 'Daily Reflection',
      content: prev.content + (prev.content ? '\n\n' : '') + prompt + '\n\n'
    }));
    setSelectedPrompt(null);
  };

  return (
    <div className="journal-editor">
      <div className="editor-layout">
        {/* Main Editor */}
        <div className="editor-main">
          <Card>
            <div className="editor-header">
              <div className="editor-meta">
                <div className="date-selector">
                  <Calendar size={16} />
                  <input
                    type="date"
                    name="date"
                    value={entry.date}
                    onChange={handleInputChange}
                    className="date-input"
                  />
                </div>
                <div className="word-count">
                  <Type size={16} />
                  <span>{wordCount} words</span>
                </div>
              </div>
              <MoodSelector
                selectedMood={entry.mood}
                onMoodChange={handleMoodChange}
              />
            </div>

            <div className="editor-form">
              <input
                type="text"
                name="title"
                value={entry.title}
                onChange={handleInputChange}
                placeholder="What's on your mind today?"
                className="title-input"
              />

              <textarea
                name="content"
                value={entry.content}
                onChange={handleContentChange}
                placeholder="Start writing your thoughts..."
                className="content-textarea"
                rows={12}
              />

              <div className="editor-footer">
                <div className="tags-input">
                  <Tag size={16} />
                  <input
                    type="text"
                    name="tags"
                    value={entry.tags}
                    onChange={handleInputChange}
                    placeholder="Tags (comma separated)"
                    className="tags-field"
                  />
                </div>

                <Button
                  variant="primary"
                  onClick={handleSave}
                  disabled={!canSave || isSaving}
                  icon={Save}
                >
                  {isSaving ? 'Saving...' : 'Save Entry'}
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="editor-sidebar">
          {/* Quick Prompts */}
          <Card title="Writing Prompts" className="prompts-card">
            <div className="prompts-list">
              {prompts.map((prompt, index) => (
                <button
                  key={index}
                  className="prompt-item"
                  onClick={() => usePrompt(prompt)}
                >
                  <Hash size={14} />
                  <span>{prompt}</span>
                </button>
              ))}
            </div>
          </Card>

          {/* Today's Stats */}
          <Card title="Today's Progress" className="stats-card">
            <div className="stats-list">
              <div className="stat-item">
                <span className="stat-label">Words written</span>
                <span className="stat-value">{wordCount}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Mood</span>
                <span className="stat-value">
                  {entry.mood ? `${entry.mood}/10` : 'Not set'}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Tags</span>
                <span className="stat-value">
                  {entry.tags.split(',').filter(tag => tag.trim()).length || 0}
                </span>
              </div>
            </div>
          </Card>

          {/* Writing Tips */}
          <Card title="Writing Tips" className="tips-card">
            <div className="tips-list">
              <div className="tip-item">
                💡 Write without editing - let your thoughts flow freely
              </div>
              <div className="tip-item">
                🎯 Focus on how you felt during key moments
              </div>
              <div className="tip-item">
                📝 Include specific details to make memories vivid
              </div>
              <div className="tip-item">
                🔍 Reflect on lessons learned or insights gained
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default JournalEditor;