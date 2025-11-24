import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, BookOpen, Search, ArrowLeft } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import SimpleJournalBook from '../components/journal/SimpleJournalBook';
import { journalDB } from '../db/journalDB';
import './JournalBookPage.css';

export default function JournalBookPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // Use Dexie's live query hook for reactive updates
  const entries = useLiveQuery(() => journalDB.getAllEntries(), []);

  useEffect(() => {
    // Remove any sample entries if they exist
    const cleanupSampleEntries = async () => {
      try {
        const allEntries = await journalDB.getAllEntries();
        const sampleTitles = ['Welcome to Your Journal', 'Getting Started'];

        for (const entry of allEntries) {
          if (sampleTitles.includes(entry.title)) {
            await journalDB.deleteEntry(entry.id);
            console.log('Removed sample entry:', entry.title);
          }
        }
      } catch (error) {
        console.error('Failed to cleanup sample entries:', error);
      } finally {
        setLoading(false);
      }
    };

    cleanupSampleEntries();
  }, []);

  const handleNewEntry = () => {
    navigate('/journal/write');
  };

  const handleBack = () => {
    navigate('/modules');
  };

  if (loading) {
    return (
      <div className="journal-loading-screen">
        <BookOpen size={48} />
        <p>Opening your journal...</p>
      </div>
    );
  }

  return (
    <div className="journal-book-page">
      {/* Top Bar */}
      <div className="journal-top-bar">
        <button onClick={handleBack} className="back-btn">
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>

        <h1 className="journal-page-title">
          <BookOpen size={24} />
          My Journal
        </h1>

        <div className="top-actions">
          <button className="icon-btn" title="Search entries">
            <Search size={20} />
          </button>
          <button onClick={handleNewEntry} className="new-entry-btn">
            <Plus size={20} />
            <span>New Entry</span>
          </button>
        </div>
      </div>

      {/* Journal Book */}
      <SimpleJournalBook
        entries={entries || []}
        onNewEntry={handleNewEntry}
      />

      {/* Stats Footer */}
      {entries && entries.length > 0 && (
        <div className="journal-stats">
          <div className="stat">
            <span className="stat-value">{entries.length}</span>
            <span className="stat-label">Entries</span>
          </div>
          <div className="stat">
            <span className="stat-value">
              {entries.reduce((sum, e) => sum + (e.wordCount || 0), 0).toLocaleString()}
            </span>
            <span className="stat-label">Words</span>
          </div>
          <div className="stat">
            <span className="stat-value">
              {Math.ceil(entries.length / 7)}
            </span>
            <span className="stat-label">Weeks</span>
          </div>
        </div>
      )}
    </div>
  );
}
