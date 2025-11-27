/**
 * Library View - Clean, Minimal Book Tracking Interface
 * Inspired by modern book tracking apps and Notion templates
 */

import React, { useState, useMemo } from 'react';
import {
  Star, Check, Clock, Book, Headphones, Video, GraduationCap,
  Search, Grid3x3, List, TrendingUp, BookOpen, Plus, Filter,
  ChevronRight, BarChart3, Target, Calendar
} from 'lucide-react';
import './LibraryView.css';

// Mock data - Currently Reading (featured)
const currentlyReading = [
  {
    id: 11,
    type: 'book',
    title: 'The Almanack of Naval Ravikant',
    author: 'Eric Jorgenson',
    genre: 'Philosophy',
    coverUrl: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1598011736i/54898389.jpg',
    progress: 65,
    currentPage: 156,
    totalPages: 240,
    status: 'reading',
    dateStarted: '2025-10-22',
  },
  {
    id: 12,
    type: 'course',
    title: 'System Design Interview',
    author: 'Alex Xu',
    genre: 'Technology',
    progress: 40,
    status: 'reading',
    dateStarted: '2025-10-20',
  },
];

// Mock data - Completed
const completedItems = [
  {
    id: 1,
    type: 'book',
    title: 'Atomic Habits',
    author: 'James Clear',
    genre: 'Self-Improvement',
    rating: 5,
    dateCompleted: '2025-10-15',
    coverUrl: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1655988385i/40121378.jpg',
    status: 'completed'
  },
  {
    id: 2,
    type: 'book',
    title: 'Zero to One',
    author: 'Peter Thiel',
    genre: 'Business',
    rating: 5,
    dateCompleted: '2025-08-10',
    coverUrl: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1414347376i/18050143.jpg',
    status: 'completed'
  },
  {
    id: 3,
    type: 'course',
    title: 'Advanced React Patterns',
    author: 'Kent C. Dodds',
    genre: 'Technology',
    rating: 5,
    dateCompleted: '2025-09-20',
    status: 'completed'
  },
  {
    id: 4,
    type: 'podcast',
    title: 'The Tim Ferriss Show #542',
    author: 'Tim Ferriss',
    genre: 'Business',
    rating: 4,
    dateCompleted: '2025-10-10',
    status: 'completed'
  },
  {
    id: 5,
    type: 'video',
    title: 'The Future of Web Development',
    author: 'Fireship',
    genre: 'Technology',
    rating: 4,
    dateCompleted: '2025-09-28',
    status: 'completed'
  },
];

// Mock data - Want to Read
const wantToRead = [
  {
    id: 6,
    type: 'book',
    title: 'The Sovereign Individual',
    author: 'James Dale Davidson',
    genre: 'Philosophy',
    coverUrl: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1388177630i/82256.jpg',
    status: 'wishlist',
    addedDate: '2025-10-20',
  },
  {
    id: 7,
    type: 'book',
    title: 'Meditations',
    author: 'Marcus Aurelius',
    genre: 'Philosophy',
    coverUrl: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1421618636i/30659.jpg',
    status: 'wishlist',
    addedDate: '2025-10-15',
  },
  {
    id: 8,
    type: 'course',
    title: 'PostgreSQL Deep Dive',
    author: 'Hussein Nasser',
    genre: 'Technology',
    status: 'wishlist',
    addedDate: '2025-10-18',
  },
  {
    id: 9,
    type: 'video',
    title: 'How to Learn Anything Fast',
    author: 'Ali Abdaal',
    genre: 'Learning',
    status: 'wishlist',
    addedDate: '2025-10-12',
  },
];

// Type icons mapping
const TYPE_ICONS = {
  book: Book,
  podcast: Headphones,
  video: Video,
  course: GraduationCap
};

const TYPE_COLORS = {
  book: { bg: 'rgba(139, 92, 246, 0.15)', text: '#a78bfa', border: 'rgba(139, 92, 246, 0.3)' },
  course: { bg: 'rgba(59, 130, 246, 0.15)', text: '#60a5fa', border: 'rgba(59, 130, 246, 0.3)' },
  podcast: { bg: 'rgba(249, 115, 22, 0.15)', text: '#fb923c', border: 'rgba(249, 115, 22, 0.3)' },
  video: { bg: 'rgba(34, 197, 94, 0.15)', text: '#4ade80', border: 'rgba(34, 197, 94, 0.3)' },
};

// Stats Card Component
function StatsCard({ icon: Icon, label, value, color }) {
  return (
    <div className="library-stat-card">
      <div className="stat-icon-wrapper" style={{ background: color }}>
        <Icon size={18} />
      </div>
      <div className="stat-info">
        <span className="stat-value">{value}</span>
        <span className="stat-label">{label}</span>
      </div>
    </div>
  );
}

// Currently Reading Hero Card
function CurrentlyReadingCard({ item }) {
  const [imageError, setImageError] = useState(false);
  const Icon = TYPE_ICONS[item.type] || Book;
  const colors = TYPE_COLORS[item.type] || TYPE_COLORS.book;

  return (
    <div className="currently-reading-card">
      <div className="cr-cover">
        {item.coverUrl && !imageError ? (
          <img
            src={item.coverUrl}
            alt={item.title}
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="cr-cover-placeholder" style={{ background: colors.bg }}>
            <Icon size={32} style={{ color: colors.text }} />
          </div>
        )}
        <div className="cr-progress-ring">
          <svg viewBox="0 0 36 36">
            <path
              className="ring-bg"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className="ring-fill"
              strokeDasharray={`${item.progress}, 100`}
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <span className="ring-text">{item.progress}%</span>
        </div>
      </div>
      <div className="cr-info">
        <div className="cr-type-badge" style={{ background: colors.bg, color: colors.text, borderColor: colors.border }}>
          <Icon size={12} />
          <span>{item.type}</span>
        </div>
        <h3 className="cr-title">{item.title}</h3>
        <p className="cr-author">{item.author}</p>
        {item.currentPage && (
          <p className="cr-pages">Page {item.currentPage} of {item.totalPages}</p>
        )}
        <button className="cr-continue-btn">
          <BookOpen size={16} />
          Continue Reading
        </button>
      </div>
    </div>
  );
}

// Library Item Card (for grid/list views)
function LibraryCard({ item, viewMode }) {
  const [imageError, setImageError] = useState(false);
  const Icon = TYPE_ICONS[item.type] || Book;
  const colors = TYPE_COLORS[item.type] || TYPE_COLORS.book;

  if (viewMode === 'list') {
    return (
      <div className="library-list-item">
        <div className="list-item-cover">
          {item.coverUrl && !imageError ? (
            <img src={item.coverUrl} alt={item.title} onError={() => setImageError(true)} />
          ) : (
            <div className="cover-placeholder" style={{ background: colors.bg }}>
              <Icon size={20} style={{ color: colors.text }} />
            </div>
          )}
        </div>
        <div className="list-item-info">
          <h4 className="list-item-title">{item.title}</h4>
          <p className="list-item-author">{item.author}</p>
          <div className="list-item-meta">
            <span className="type-tag" style={{ background: colors.bg, color: colors.text }}>
              <Icon size={12} />
              {item.type}
            </span>
            <span className="genre-tag">{item.genre}</span>
          </div>
        </div>
        <div className="list-item-actions">
          {item.rating && (
            <div className="rating-display">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  fill={i < item.rating ? '#fbbf24' : 'none'}
                  stroke={i < item.rating ? '#fbbf24' : 'rgba(255,255,255,0.2)'}
                />
              ))}
            </div>
          )}
          {item.status === 'completed' && (
            <span className="status-badge completed">
              <Check size={12} /> Completed
            </span>
          )}
        </div>
      </div>
    );
  }

  // Grid view (default)
  return (
    <div className="library-grid-card">
      <div className="grid-card-cover">
        {item.coverUrl && !imageError ? (
          <img src={item.coverUrl} alt={item.title} onError={() => setImageError(true)} />
        ) : (
          <div className="cover-placeholder" style={{ background: colors.bg }}>
            <Icon size={28} style={{ color: colors.text }} />
          </div>
        )}
        {item.rating && (
          <div className="card-rating">
            <Star size={12} fill="#fbbf24" stroke="#fbbf24" />
            <span>{item.rating}</span>
          </div>
        )}
        {item.progress !== undefined && item.progress < 100 && (
          <div className="card-progress-bar">
            <div className="progress-fill" style={{ width: `${item.progress}%` }} />
          </div>
        )}
      </div>
      <div className="grid-card-info">
        <h4 className="card-title">{item.title}</h4>
        <p className="card-author">{item.author}</p>
        <div className="card-type" style={{ background: colors.bg, color: colors.text }}>
          <Icon size={12} />
          <span>{item.type}</span>
        </div>
      </div>
    </div>
  );
}

// Main Library View
export default function LibraryView() {
  const [activeTab, setActiveTab] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Combine all items
  const allItems = useMemo(() => [
    ...currentlyReading,
    ...completedItems,
    ...wantToRead
  ], []);

  // Filter items based on tab, search, and type filter
  const filteredItems = useMemo(() => {
    let items = allItems;

    // Filter by tab
    if (activeTab === 'reading') {
      items = currentlyReading;
    } else if (activeTab === 'completed') {
      items = completedItems;
    } else if (activeTab === 'wishlist') {
      items = wantToRead;
    }

    // Filter by type
    if (filterType !== 'all') {
      items = items.filter(item => item.type === filterType);
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      items = items.filter(item =>
        item.title.toLowerCase().includes(query) ||
        item.author?.toLowerCase().includes(query) ||
        item.genre?.toLowerCase().includes(query)
      );
    }

    return items;
  }, [allItems, activeTab, filterType, searchQuery]);

  // Calculate stats
  const stats = useMemo(() => ({
    totalBooks: allItems.filter(i => i.type === 'book').length,
    completed: completedItems.length,
    reading: currentlyReading.length,
    avgRating: completedItems.filter(i => i.rating).reduce((acc, i) => acc + i.rating, 0) /
               completedItems.filter(i => i.rating).length || 0,
  }), [allItems]);

  const tabs = [
    { id: 'all', label: 'All', count: allItems.length },
    { id: 'reading', label: 'Reading', count: currentlyReading.length },
    { id: 'completed', label: 'Completed', count: completedItems.length },
    { id: 'wishlist', label: 'Want to Read', count: wantToRead.length },
  ];

  return (
    <div className="library-view">
      {/* Stats Overview */}
      <div className="library-stats-row">
        <StatsCard icon={Book} label="Total Books" value={stats.totalBooks} color="linear-gradient(135deg, #8b5cf6, #7c3aed)" />
        <StatsCard icon={BookOpen} label="Currently Reading" value={stats.reading} color="linear-gradient(135deg, #3b82f6, #2563eb)" />
        <StatsCard icon={Check} label="Completed" value={stats.completed} color="linear-gradient(135deg, #10b981, #059669)" />
        <StatsCard icon={Star} label="Avg Rating" value={stats.avgRating.toFixed(1)} color="linear-gradient(135deg, #f59e0b, #d97706)" />
      </div>

      {/* Currently Reading Section */}
      {currentlyReading.length > 0 && (
        <section className="currently-reading-section">
          <div className="section-header">
            <h2>
              <BookOpen size={20} />
              Currently Reading
            </h2>
            <span className="item-count">{currentlyReading.length} items</span>
          </div>
          <div className="currently-reading-grid">
            {currentlyReading.map(item => (
              <CurrentlyReadingCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}

      {/* Main Library Section */}
      <section className="library-main-section">
        {/* Tab Navigation */}
        <div className="library-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
              <span className="tab-count">{tab.count}</span>
            </button>
          ))}
        </div>

        {/* Controls Bar */}
        <div className="library-controls">
          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search books, authors, genres..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="controls-right">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="type-filter"
            >
              <option value="all">All Types</option>
              <option value="book">Books</option>
              <option value="course">Courses</option>
              <option value="podcast">Podcasts</option>
              <option value="video">Videos</option>
            </select>

            <div className="view-toggle">
              <button
                className={viewMode === 'grid' ? 'active' : ''}
                onClick={() => setViewMode('grid')}
                title="Grid view"
              >
                <Grid3x3 size={18} />
              </button>
              <button
                className={viewMode === 'list' ? 'active' : ''}
                onClick={() => setViewMode('list')}
                title="List view"
              >
                <List size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Library Content */}
        <div className={`library-content ${viewMode}`}>
          {filteredItems.length === 0 ? (
            <div className="empty-state">
              <Book size={48} />
              <h3>No items found</h3>
              <p>Try adjusting your search or filters</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="library-grid">
              {filteredItems.map(item => (
                <LibraryCard key={item.id} item={item} viewMode={viewMode} />
              ))}
            </div>
          ) : (
            <div className="library-list">
              {filteredItems.map(item => (
                <LibraryCard key={item.id} item={item} viewMode={viewMode} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Add Book FAB */}
      <button className="add-book-fab">
        <Plus size={24} />
      </button>
    </div>
  );
}
