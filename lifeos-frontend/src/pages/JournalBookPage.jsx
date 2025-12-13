import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, BookOpen, Search, ArrowLeft, Settings } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import SimpleJournalBook from '../components/journal/SimpleJournalBook';
import JournalCoverCustomizer from '../components/journal/JournalCoverCustomizer';
import { journalDB, settingsDB } from '../db/journalDB';
import { JournalSetup } from '../components/onboarding/setup';
import useIntegratedOnboardingStore from '../stores/integratedOnboardingStore';
import './JournalBookPage.css';

export default function JournalBookPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [showCoverCustomizer, setShowCoverCustomizer] = useState(false);
  const [coverSettings, setCoverSettings] = useState(null);
  const { isModuleComplete, hasSeenWelcome, isOnboardingComplete } = useIntegratedOnboardingStore();

  // Show setup wizard if journal module not configured during onboarding
  const showSetup = hasSeenWelcome && !isOnboardingComplete && !isModuleComplete('journal');

  // Use Dexie's live query hook for reactive updates
  const entries = useLiveQuery(() => journalDB.getAllEntries(), []);

  useEffect(() => {
    // Load cover settings and cleanup sample entries
    const initialize = async () => {
      try {
        // Load cover settings
        const savedCoverSettings = await settingsDB.get('journalCover');
        if (savedCoverSettings) {
          setCoverSettings(savedCoverSettings);
        }

        // Remove any sample entries if they exist
        const allEntries = await journalDB.getAllEntries();
        const sampleTitles = ['Welcome to Your Journal', 'Getting Started'];

        for (const entry of allEntries) {
          if (sampleTitles.includes(entry.title)) {
            await journalDB.deleteEntry(entry.id);
            console.log('Removed sample entry:', entry.title);
          }
        }
      } catch (error) {
        console.error('Failed to initialize journal:', error);
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, []);

  const handleNewEntry = () => {
    navigate('/journal/write');
  };

  const handleEditEntry = (entry) => {
    navigate('/journal/write', { state: { entry } });
  };

  const handleBack = () => {
    navigate('/modules');
  };

  const handleSaveCoverSettings = async (settings) => {
    await settingsDB.set('journalCover', settings);
    setCoverSettings(settings);
    setShowCoverCustomizer(false);
  };

  if (loading) {
    return (
      <div className="journal-loading-screen">
        <BookOpen size={48} />
        <p>Opening your journal...</p>
      </div>
    );
  }

  // Show setup wizard during onboarding
  if (showSetup) {
    return (
      <div className="journal-book-page">
        <div className="p-4">
          <JournalSetup
            onComplete={() => {
              useIntegratedOnboardingStore.getState().markModuleComplete('journal');
            }}
            onSkip={() => {
              useIntegratedOnboardingStore.getState().markModuleComplete('journal');
            }}
          />
        </div>
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
          {coverSettings?.title || 'My Journal'}
        </h1>

        <div className="top-actions">
          <button
            className="icon-btn"
            title="Customize cover"
            onClick={() => setShowCoverCustomizer(true)}
            data-tour="customize-cover-btn"
          >
            <Settings size={20} />
          </button>
          <button className="icon-btn" title="Search entries">
            <Search size={20} />
          </button>
          <button onClick={handleNewEntry} className="new-entry-btn" data-tour="write-entry-btn">
            <Plus size={20} />
            <span>New Entry</span>
          </button>
        </div>
      </div>

      {/* Journal Book */}
      <div data-tour="journal-book">
        <SimpleJournalBook
          entries={entries || []}
          onNewEntry={handleNewEntry}
          onEditEntry={handleEditEntry}
          coverSettings={coverSettings}
        />
      </div>

      {/* Cover Customizer Modal */}
      {showCoverCustomizer && (
        <JournalCoverCustomizer
          currentSettings={coverSettings}
          onSave={handleSaveCoverSettings}
          onClose={() => setShowCoverCustomizer(false)}
        />
      )}

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
