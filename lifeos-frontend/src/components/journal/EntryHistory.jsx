import React, { useState } from 'react';
import { Search, Filter, Calendar, Tag, BookOpen, TrendingUp, Clock } from 'lucide-react';
import Card from '../shared/Card';
import Button from '../shared/Button';
import StatCard from '../shared/StatCard';
import MoodSelector from './MoodSelector';
import { EmptyState } from '../ui';
import './EntryHistory.css';

const EntryHistory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMood, setFilterMood] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');
  const [selectedTag, setSelectedTag] = useState('all');

  // Mock journal entries data
  const [entries] = useState([
    {
      id: 1,
      title: 'A Productive Day',
      content: 'Today was incredibly productive. I managed to complete three major tasks and felt really accomplished. The weather was perfect, which definitely boosted my mood. I had a great conversation with my team about the new project direction.',
      mood: 8,
      tags: ['work', 'productivity', 'team'],
      date: '2025-10-26',
      wordCount: 245,
      createdAt: '2025-10-26T08:30:00Z'
    },
    {
      id: 2,
      title: 'Challenging Morning',
      content: 'Started the day with some technical difficulties that were quite frustrating. However, I managed to work through them and learned something new in the process. Sometimes challenges lead to growth.',
      mood: 5,
      tags: ['challenges', 'learning', 'growth'],
      date: '2025-10-25',
      wordCount: 189,
      createdAt: '2025-10-25T09:15:00Z'
    },
    {
      id: 3,
      title: 'Weekend Reflections',
      content: 'Spent the weekend relaxing and reflecting on the past week. Had some great moments with family and friends. Feeling grateful for the relationships in my life and looking forward to what\'s ahead.',
      mood: 9,
      tags: ['family', 'gratitude', 'reflection'],
      date: '2025-10-24',
      wordCount: 312,
      createdAt: '2025-10-24T19:45:00Z'
    },
    {
      id: 4,
      title: 'Learning Journey',
      content: 'Dove deep into a new technology today. The learning curve is steep but I\'m excited about the possibilities. Made some progress on understanding the core concepts.',
      mood: 7,
      tags: ['learning', 'technology', 'progress'],
      date: '2025-10-23',
      wordCount: 156,
      createdAt: '2025-10-23T16:20:00Z'
    },
    {
      id: 5,
      title: 'Tough Day',
      content: 'Had one of those days where nothing seemed to go right. Feeling overwhelmed and stressed. Need to take some time to recharge and reset tomorrow.',
      mood: 3,
      tags: ['stress', 'overwhelm', 'recharge'],
      date: '2025-10-22',
      wordCount: 98,
      createdAt: '2025-10-22T20:10:00Z'
    },
    {
      id: 6,
      title: 'Creative Breakthrough',
      content: 'Had an amazing creative session today! Ideas were flowing and I made significant progress on my side project. There\'s something magical about being in the zone.',
      mood: 9,
      tags: ['creativity', 'breakthrough', 'project'],
      date: '2025-10-21',
      wordCount: 201,
      createdAt: '2025-10-21T14:30:00Z'
    }
  ]);

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
    averageMood: (entries.reduce((sum, entry) => sum + entry.mood, 0) / entries.length).toFixed(1),
    totalWords: entries.reduce((sum, entry) => sum + entry.wordCount, 0),
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
                    {entry.content.substring(0, 200)}
                    {entry.content.length > 200 && '...'}
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
                    <Button variant="ghost" size="small">
                      Edit
                    </Button>
                    <Button variant="ghost" size="small">
                      View
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