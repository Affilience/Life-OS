import React, { useState } from 'react';
import {
  Star, Check, Clock, Book, Headphones, Video, GraduationCap,
  Search, Grid3x3, Grid2x2, LayoutGrid, TrendingUp, BookOpen,
  Play, Pause, Plus
} from 'lucide-react';
import './LibraryView.css';

// Mock data for consumed items - Enhanced with cover images
const consumedItems = [
  {
    id: 1,
    type: 'book',
    title: 'Atomic Habits',
    author: 'James Clear',
    genre: 'Self-Improvement',
    rating: 5,
    dateCompleted: '2025-10-15',
    notes: 'Excellent framework for building lasting habits through small, consistent changes.',
    coverUrl: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1655988385i/40121378.jpg',
    progress: 100,
    status: 'completed'
  },
  {
    id: 2,
    type: 'course',
    title: 'Advanced React Patterns',
    author: 'Kent C. Dodds',
    genre: 'Technology',
    rating: 5,
    dateCompleted: '2025-09-20',
    notes: 'Deep dive into advanced React patterns like render props, compound components.',
    coverUrl: 'https://kentcdodds.com/images/courses/advanced-react-patterns.png',
    progress: 100,
    status: 'completed'
  },
  {
    id: 3,
    type: 'podcast',
    title: 'The Tim Ferriss Show #542',
    author: 'Tim Ferriss',
    genre: 'Business',
    rating: 4,
    dateCompleted: '2025-10-10',
    notes: 'Great insights on productivity and life optimization.',
    progress: 100,
    status: 'completed'
  },
  {
    id: 4,
    type: 'video',
    title: 'The Future of Web Development',
    author: 'Fireship',
    genre: 'Technology',
    rating: 4,
    dateCompleted: '2025-09-28',
    notes: 'Quick overview of emerging web technologies.',
    progress: 100,
    status: 'completed'
  },
  {
    id: 5,
    type: 'book',
    title: 'Zero to One',
    author: 'Peter Thiel',
    genre: 'Business',
    rating: 5,
    dateCompleted: '2025-08-10',
    notes: 'Revolutionary thinking about building startups and creating value.',
    coverUrl: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1414347376i/18050143.jpg',
    progress: 100,
    status: 'completed'
  },
];

// Mock data for currently reading
const currentlyReading = [
  {
    id: 11,
    type: 'book',
    title: 'The Almanack of Naval Ravikant',
    author: 'Eric Jorgenson',
    genre: 'Philosophy',
    rating: null,
    dateStarted: '2025-10-22',
    coverUrl: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1598011736i/54898389.jpg',
    progress: 65,
    status: 'reading',
    priority: 'high'
  },
  {
    id: 12,
    type: 'course',
    title: 'System Design Interview',
    author: 'Alex Xu',
    genre: 'Technology',
    rating: null,
    dateStarted: '2025-10-20',
    progress: 40,
    status: 'reading',
    priority: 'high'
  },
];

// Mock data for wishlist items
const wishlistItems = [
  {
    id: 6,
    type: 'book',
    title: 'The Sovereign Individual',
    author: 'James Dale Davidson',
    genre: 'Philosophy',
    priority: 'high',
    addedDate: '2025-10-20',
    coverUrl: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1388177630i/82256.jpg',
    status: 'wishlist'
  },
  {
    id: 7,
    type: 'course',
    title: 'PostgreSQL Deep Dive',
    author: 'Hussein Nasser',
    genre: 'Technology',
    priority: 'high',
    addedDate: '2025-10-18',
    status: 'wishlist'
  },
  {
    id: 8,
    type: 'book',
    title: 'Meditations',
    author: 'Marcus Aurelius',
    genre: 'Philosophy',
    priority: 'medium',
    addedDate: '2025-10-15',
    coverUrl: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1421618636i/30659.jpg',
    status: 'wishlist'
  },
  {
    id: 9,
    type: 'video',
    title: 'How to Learn Anything Fast',
    author: 'Ali Abdaal',
    genre: 'Learning',
    priority: 'medium',
    addedDate: '2025-10-12',
    status: 'wishlist'
  },
  {
    id: 10,
    type: 'podcast',
    title: 'Lex Fridman Podcast',
    author: 'Lex Fridman',
    genre: 'Science',
    priority: 'low',
    addedDate: '2025-10-05',
    status: 'wishlist'
  },
];

// Type Icon Component
function TypeIcon({ type, size = 16 }) {
  const icons = {
    book: Book,
    podcast: Headphones,
    video: Video,
    course: GraduationCap
  };
  const Icon = icons[type] || Book;
  return <Icon size={size} />;
}

// Generate placeholder cover based on type
function generatePlaceholderCover(type, title) {
  const colors = {
    book: 'from-purple-500 to-pink-500',
    course: 'from-blue-500 to-cyan-500',
    podcast: 'from-orange-500 to-red-500',
    video: 'from-green-500 to-emerald-500'
  };

  return (
    <div className={`placeholder-cover bg-gradient-to-br ${colors[type] || 'from-gray-500 to-gray-700'}`}>
      <TypeIcon type={type} size={48} />
    </div>
  );
}

// Enhanced Library Card Component
function LibraryCard({ item, density = 'normal' }) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div className={`library-card ${density} group`}>
      {/* Cover Image Container */}
      <div className="card-cover-container">
        {item.coverUrl && !imageError ? (
          <>
            {!imageLoaded && generatePlaceholderCover(item.type, item.title)}
            <img
              src={item.coverUrl}
              alt={item.title}
              loading="lazy"
              className={`cover-image ${imageLoaded ? 'loaded' : 'loading'}`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
          </>
        ) : (
          generatePlaceholderCover(item.type, item.title)
        )}

        {/* Status Overlays */}
        <div className="card-overlays">
          {/* Top badges */}
          <div className="top-badges">
            {item.status === 'completed' && (
              <span className="status-badge completed">
                <Check size={12} />
                Read
              </span>
            )}
            {item.status === 'reading' && (
              <span className="status-badge reading">
                <BookOpen size={12} />
                Reading
              </span>
            )}
            {item.priority === 'high' && (
              <span className="priority-badge high">★</span>
            )}
          </div>

          {/* Progress bar for in-progress items */}
          {item.progress && item.progress < 100 && (
            <div className="progress-overlay">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${item.progress}%` }}
                />
              </div>
              <span className="progress-text">{item.progress}%</span>
            </div>
          )}

          {/* Rating stars */}
          {item.rating && (
            <div className="rating-overlay">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={10}
                  fill={i < item.rating ? '#fbbf24' : 'none'}
                  stroke={i < item.rating ? '#fbbf24' : 'rgba(255, 255, 255, 0.3)'}
                  strokeWidth={2}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Card Metadata - Only show in normal/spacious */}
      {density !== 'compact' && (
        <div className="card-metadata">
          <h3 className="card-title">{item.title}</h3>
          <p className="card-author">{item.author || item.source}</p>
          <div className="card-info">
            <div className="type-badge">
              <TypeIcon type={item.type} size={12} />
              <span>{item.type}</span>
            </div>
            {item.genre && <span className="genre-text">• {item.genre}</span>}
          </div>

          {/* Notes preview - Only in spacious */}
          {density === 'spacious' && item.notes && (
            <p className="card-notes">{item.notes}</p>
          )}
        </div>
      )}
    </div>
  );
}

// Reading Statistics Dashboard
function ReadingStats({ items, currentItems }) {
  const totalCompleted = items.filter(i => i.status === 'completed').length;
  const totalReading = currentItems.length;
  const avgRating = items.filter(i => i.rating).reduce((acc, i) => acc + i.rating, 0) / items.filter(i => i.rating).length || 0;

  const typeBreakdown = items.reduce((acc, item) => {
    acc[item.type] = (acc[item.type] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="reading-stats">
      <div className="stat-card">
        <div className="stat-icon completed">
          <Check size={20} />
        </div>
        <div className="stat-content">
          <div className="stat-value">{totalCompleted}</div>
          <div className="stat-label">Completed</div>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon reading">
          <BookOpen size={20} />
        </div>
        <div className="stat-content">
          <div className="stat-value">{totalReading}</div>
          <div className="stat-label">Reading</div>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon rating">
          <Star size={20} />
        </div>
        <div className="stat-content">
          <div className="stat-value">{avgRating.toFixed(1)}</div>
          <div className="stat-label">Avg Rating</div>
        </div>
      </div>

      <div className="stat-card types">
        <div className="stat-icon types">
          <TrendingUp size={20} />
        </div>
        <div className="stat-content">
          <div className="type-breakdown">
            {Object.entries(typeBreakdown).map(([type, count]) => (
              <div key={type} className="type-stat">
                <TypeIcon type={type} size={14} />
                <span>{count}</span>
              </div>
            ))}
          </div>
          <div className="stat-label">By Type</div>
        </div>
      </div>
    </div>
  );
}

// Library Shelf Component (horizontal scrolling section)
function LibraryShelf({ title, items, density, emptyMessage }) {
  if (!items || items.length === 0) {
    return (
      <div className="library-shelf empty">
        <h3 className="shelf-title">{title}</h3>
        <p className="empty-message">{emptyMessage || 'No items yet'}</p>
      </div>
    );
  }

  return (
    <div className="library-shelf">
      <div className="shelf-header">
        <h3 className="shelf-title">{title}</h3>
        <span className="shelf-count">{items.length} items</span>
      </div>
      <div className={`shelf-items density-${density}`}>
        {items.map(item => (
          <LibraryCard key={item.id} item={item} density={density} />
        ))}
      </div>
    </div>
  );
}

// Main LibraryView Component
const LibraryView = () => {
  const [viewMode, setViewMode] = useState('shelves'); // 'shelves' or 'grid'
  const [gridDensity, setGridDensity] = useState('normal'); // 'compact', 'normal', 'spacious'
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

  const allItems = [...consumedItems, ...currentlyReading, ...wishlistItems];

  const filteredItems = allItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.author?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || item.type === filterType;
    return matchesSearch && matchesType;
  });

  // Smart collections
  const collections = {
    currentlyReading: filteredItems.filter(i => i.status === 'reading'),
    recentlyCompleted: filteredItems
      .filter(i => i.status === 'completed')
      .sort((a, b) => new Date(b.dateCompleted) - new Date(a.dateCompleted))
      .slice(0, 10),
    highPriority: filteredItems.filter(i => i.priority === 'high'),
    wishlist: filteredItems.filter(i => i.status === 'wishlist'),
  };

  // Group by type
  const byType = {
    books: filteredItems.filter(i => i.type === 'book'),
    courses: filteredItems.filter(i => i.type === 'course'),
    podcasts: filteredItems.filter(i => i.type === 'podcast'),
    videos: filteredItems.filter(i => i.type === 'video'),
  };

  return (
    <div className="library-view-enhanced">
      {/* Reading Statistics Dashboard */}
      <ReadingStats items={consumedItems} currentItems={currentlyReading} />

      {/* Controls */}
      <div className="library-controls-enhanced">
        {/* Search */}
        <div className="search-wrapper">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search your library..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input-enhanced"
          />
        </div>

        {/* Filter and Density Controls */}
        <div className="control-group">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="filter-select-enhanced"
          >
            <option value="all">All Types</option>
            <option value="book">Books</option>
            <option value="course">Courses</option>
            <option value="podcast">Podcasts</option>
            <option value="video">Videos</option>
          </select>

          {/* Grid Density Switcher */}
          <div className="density-controls">
            <button
              className={`density-btn ${gridDensity === 'compact' ? 'active' : ''}`}
              onClick={() => setGridDensity('compact')}
              title="Compact view"
            >
              <Grid3x3 size={18} />
            </button>
            <button
              className={`density-btn ${gridDensity === 'normal' ? 'active' : ''}`}
              onClick={() => setGridDensity('normal')}
              title="Normal view"
            >
              <Grid2x2 size={18} />
            </button>
            <button
              className={`density-btn ${gridDensity === 'spacious' ? 'active' : ''}`}
              onClick={() => setGridDensity('spacious')}
              title="Spacious view"
            >
              <LayoutGrid size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Library Content */}
      <div className="library-content-enhanced">
        {/* Currently Reading Section - Always visible */}
        {collections.currentlyReading.length > 0 && (
          <LibraryShelf
            title="Currently Reading"
            items={collections.currentlyReading}
            density={gridDensity}
          />
        )}

        {/* High Priority Section */}
        {collections.highPriority.length > 0 && (
          <LibraryShelf
            title="High Priority"
            items={collections.highPriority}
            density={gridDensity}
          />
        )}

        {/* Recently Completed */}
        {collections.recentlyCompleted.length > 0 && (
          <LibraryShelf
            title="Recently Completed"
            items={collections.recentlyCompleted}
            density={gridDensity}
          />
        )}

        {/* Wishlist */}
        {collections.wishlist.length > 0 && (
          <LibraryShelf
            title="Want to Read"
            items={collections.wishlist}
            density={gridDensity}
            emptyMessage="Add items to your wishlist to see them here"
          />
        )}

        {/* By Type Sections */}
        {byType.books.length > 0 && (
          <LibraryShelf
            title="Books"
            items={byType.books}
            density={gridDensity}
          />
        )}

        {byType.courses.length > 0 && (
          <LibraryShelf
            title="Courses"
            items={byType.courses}
            density={gridDensity}
          />
        )}

        {byType.podcasts.length > 0 && (
          <LibraryShelf
            title="Podcasts"
            items={byType.podcasts}
            density={gridDensity}
          />
        )}

        {byType.videos.length > 0 && (
          <LibraryShelf
            title="Videos"
            items={byType.videos}
            density={gridDensity}
          />
        )}
      </div>
    </div>
  );
};

export default LibraryView;
