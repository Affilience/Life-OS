import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, BookOpen, Search, ArrowLeft, Settings, X } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import SimpleJournalBook from '../components/journal/SimpleJournalBook';
import JournalCoverCustomizer from '../components/journal/JournalCoverCustomizer';
import { journalDB, settingsDB, journalSync } from '../db/journalDB';
import { JournalSetup } from '../components/onboarding/setup';
import useIntegratedOnboardingStore from '../stores/integratedOnboardingStore';
import './JournalBookPage.css';

export default function JournalBookPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [showCoverCustomizer, setShowCoverCustomizer] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
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
        // Try to load cover settings from Supabase first
        const supabaseCoverSettings = await journalSync.fetchCoverSettings();
        if (supabaseCoverSettings && Object.keys(supabaseCoverSettings).length > 0) {
          setCoverSettings(supabaseCoverSettings);
          // Also save to local for offline access
          await settingsDB.set('journalCover', supabaseCoverSettings);
        } else {
          // Fall back to local settings
          const savedCoverSettings = await settingsDB.get('journalCover');
          if (savedCoverSettings) {
            setCoverSettings(savedCoverSettings);
            // Sync to Supabase if local settings exist but Supabase doesn't have them
            await journalSync.syncCoverSettings(savedCoverSettings);
          }
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
    // Save locally
    await settingsDB.set('journalCover', settings);
    setCoverSettings(settings);
    setShowCoverCustomizer(false);
    // Sync to Supabase in background
    await journalSync.syncCoverSettings(settings);
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.trim()) {
      const results = await journalDB.searchEntries(query);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const handleSearchResultClick = (entry) => {
    setShowSearch(false);
    setSearchQuery('');
    setSearchResults([]);
    navigate('/journal/write', { state: { entry } });
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
            title="Customise cover"
            onClick={() => setShowCoverCustomizer(true)}
            data-tour="customize-cover-btn"
          >
            <Settings size={20} />
          </button>
          <button
            className="icon-btn"
            title="Search entries"
            onClick={() => setShowSearch(true)}
          >
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

      {/* Search Modal */}
      {showSearch && (
        <div className="journal-search-overlay" onClick={() => setShowSearch(false)}>
          <div className="journal-search-modal" onClick={(e) => e.stopPropagation()}>
            <div className="search-modal-header">
              <div className="search-input-wrapper">
                <Search size={20} />
                <input
                  type="text"
                  placeholder="Search entries..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  autoFocus
                />
              </div>
              <button className="close-search-btn" onClick={() => setShowSearch(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="search-results">
              {searchQuery && searchResults.length === 0 && (
                <div className="no-results">No entries found matching "{searchQuery}"</div>
              )}
              {searchResults.map((entry) => (
                <div
                  key={entry.id}
                  className="search-result-item"
                  onClick={() => handleSearchResultClick(entry)}
                >
                  <div className="result-title">{entry.title || 'Untitled Entry'}</div>
                  <div className="result-meta">
                    <span className="result-date">{entry.date}</span>
                    {entry.wordCount > 0 && (
                      <span className="result-words">{entry.wordCount} words</span>
                    )}
                  </div>
                  <div className="result-preview">
                    {entry.content?.substring(0, 100)}
                    {entry.content?.length > 100 && '...'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
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
