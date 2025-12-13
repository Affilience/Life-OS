import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Calendar, Tag, BookOpen, TrendingUp, Clock } from 'lucide-react';
import Card from '../shared/Card';
import Button from '../shared/Button';
import StatCard from '../shared/StatCard';
import MoodSelector from './MoodSelector';
import { EmptyState } from '../ui';
import { useJournalStore } from '../../features/journal/journal.store';
import './EntryHistory.css';

const EntryHistory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMood, setFilterMood] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');
  const [selectedTag, setSelectedTag] = useState('all');
  const [expandedEntryId, setExpandedEntryId] = useState(null);

  // Use journal store for entries
  const { entries: storeEntries, hydrate, loading } = useJournalStore();

  // Load entries on mount
  useEffect(() => {
    hydrate();
  }, []);

  // Transform store entries to match expected format
  const entries = useMemo(() => {
    return (storeEntries || []).map(e => ({
      id: e.id || e.date,
      title: e.title || 'Untitled Entry',
      content: e.content || e.preview || '',
      mood: e.mood || 5,
      tags: e.tags || [],
      date: e.date,
      wordCount: e.wordCount || 0,
      createdAt: e.createdAt || e.date
    }));
  }, [storeEntries]);

  // Get all unique tags
  const allTags = [...new Set(entries.flatMap(entry => entry.tags))];

  // Filter and sort entries
  const filteredEntries = entries
    .filter(entry => {
      const matchesSearch = searchTerm === '' || 
        entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesMood = filterMood === 'all' || entry.mood.toString() === filterMood;
      const matchesTag = selectedTag === 'all' || entry.tags.includes(selectedTag);
      
      return matchesSearch && matchesMood && matchesTag;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return new Date(b.date) - new Date(a.date);
        case 'date-asc':
          return new Date(a.date) - new Date(b.date);
        case 'mood-desc':
          return b.mood - a.mood;
        case 'mood-asc':
          return a.mood - b.mood;
        case 'words-desc':
          return b.wordCount - a.wordCount;
        case 'words-asc':
          return a.wordCount - b.wordCount;
        default:
          return 0;
      }
    });

  // Calculate stats
  const stats = {
    totalEntries: entries.length,
    averageMood: entries.length > 0
      ? (entries.reduce((sum, entry) => sum + (entry.mood || 0), 0) / entries.length).toFixed(1)
      : '0.0',
    totalWords: entries.reduce((sum, entry) => sum + (entry.wordCount || 0), 0),
    entriesThisWeek: entries.filter(entry => {
      const entryDate = new Date(entry.date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return entryDate >= weekAgo;
    }).length
  };

  const getMoodEmoji = (mood) => {
    const moods = ['😫', '😞', '😕', '😐', '🙂', '😊', '😄', '😁', '🤩', '🥳'];
    return moods[mood - 1] || '😐';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  return (
    <div className="entry-history">
      {/* Stats Grid */}
      <div className="stats-grid">
        <StatCard
          icon={BookOpen}
          label="Total Entries"
          value={stats.totalEntries}
          module="journal"
        />
        <StatCard
          icon={TrendingUp}
          label="Average Mood"
          value={stats.averageMood}
          unit="/10"
          module="journal"
        />
        <StatCard
          icon={Tag}
          label="Total Words"
          value={stats.totalWords.toLocaleString()}
          module="journal"
        />
        <StatCard
          icon={Calendar}
          label="This Week"
          value={stats.entriesThisWeek}
          module="journal"
        />
      </div>

      {/* Search and Filters */}
      <Card title="Journal Entries" className="entries-card">
        <div className="history-controls">
          <div className="search-bar">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search entries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filters">
            <select
              value={filterMood}
              onChange={(e) => setFilterMood(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Moods</option>
              {[...Array(10)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {getMoodEmoji(i + 1)} {i + 1}/10
                </option>
              ))}
            </select>

            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Tags</option>
              {allTags.map(tag => (
                <option key={tag} value={tag}>
                  #{tag}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="filter-select"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="mood-desc">Highest Mood</option>
              <option value="mood-asc">Lowest Mood</option>
              <option value="words-desc">Most Words</option>
              <option value="words-asc">Fewest Words</option>
            </select>
          </div>
        </div>

        {/* Entries List */}
        {filteredEntries.length === 0 ? (
          <EmptyState
            type="journal"
            title="No entries found"
            description={searchTerm || filterMood !== 'all' || selectedTag !== 'all'
              ? "Try adjusting your search or filters to find more entries"
              : "Start writing your first journal entry to capture your thoughts and reflections"}
            actionLabel="Write First Entry"
            variant="rose"
            size="md"
          />
        ) : (
          <div className="entries-list">
            {filteredEntries.map(entry => (
              <div key={entry.id} className="entry-card">
                <div className="entry-header">
                  <div className="entry-meta">
                    <h3 className="entry-title">{entry.title}</h3>
                    <div className="entry-details">
                      <span className="entry-date">
                        <Calendar size={12} />
                        {formatDate(entry.date)}
                      </span>
                      <span className="entry-words">
                        <Clock size={12} />
                        {entry.wordCount} words
                      </span>
                    </div>
                  </div>
                  <div className="entry-mood">
                    <span className="mood-emoji">{getMoodEmoji(entry.mood)}</span>
                    <span className="mood-score">{entry.mood}/10</span>
                  </div>
                </div>

                <div className="entry-content">
                  <p className="entry-preview">
                    {expandedEntryId === entry.id
                      ? entry.content
                      : entry.content.substring(0, 200) + (entry.content.length > 200 ? '...' : '')}
                  </p>
                </div>

                <div className="entry-footer">
                  <div className="entry-tags">
                    {entry.tags.map(tag => (
                      <span key={tag} className="tag">
                        <Tag size={10} />
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="entry-actions">
                    <Button
                      variant="ghost"
                      size="small"
                      onClick={() => alert(`Edit entry: "${entry.title}"\n\nEntry editing will be available in a future update.`)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="small"
                      onClick={() => setExpandedEntryId(expandedEntryId === entry.id ? null : entry.id)}
                    >
                      {expandedEntryId === entry.id ? 'Collapse' : 'View'}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default EntryHistory;