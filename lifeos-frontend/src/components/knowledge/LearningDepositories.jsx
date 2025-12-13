import React, { useState, useMemo, useEffect } from 'react';
import { Book, Headphones, Video, GraduationCap, ChevronRight, Star, Clock } from 'lucide-react';
import { useKnowledgeStore } from '../../stores/knowledgeStore';
import './LearningDepositories.css';

// Depository Card Component (Level 1)
function DepositoryCard({ type, data, onClick }) {
  const Icon = data.icon;

  return (
    <div className="depository-card" onClick={() => onClick(type)}>
      <div className="depot-icon-container">
        <Icon size={48} />
      </div>
      <h3 className="depot-title">{data.label}</h3>
      <div className="depot-count">{data.count} items</div>
      <div className="depot-arrow">
        <ChevronRight size={24} />
      </div>
    </div>
  );
}

// Genre Card Component (Level 2)
function GenreCard({ genre, data, onClick }) {
  return (
    <div className="genre-card" onClick={() => onClick(genre)}>
      <div className="genre-header">
        <h3 className="genre-title">{data.label}</h3>
        <div className="genre-count">{data.count}</div>
      </div>
      <div className="genre-progress-info">
        <span>Click to explore</span>
        <ChevronRight size={16} />
      </div>
    </div>
  );
}

// Item Card Component (Level 3)
function ItemCard({ item, type }) {
  return (
    <div className="item-card">
      <div className="item-header">
        <div className="item-title-section">
          <h4 className="item-title">{item.title}</h4>
          <p className="item-author">{item.author}</p>
        </div>
        {item.completed && (
          <div className="item-completed-badge">
            <Star size={16} fill="currentColor" />
          </div>
        )}
      </div>

      <div className="item-details">
        {item.rating && (
          <div className="item-rating">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={14}
                fill={i < item.rating ? '#8b5cf6' : 'none'}
                stroke={i < item.rating ? '#8b5cf6' : 'rgba(139, 92, 246, 0.3)'}
              />
            ))}
          </div>
        )}

        {item.duration && (
          <div className="item-meta">
            <Clock size={14} />
            <span>{item.duration}</span>
          </div>
        )}

        {item.date && (
          <div className="item-date">
            Completed: {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
        )}

        {item.episodesWatched && (
          <div className="item-episodes">
            {item.episodesWatched} episodes
          </div>
        )}

        {item.progress !== undefined && !item.completed && (
          <div className="item-progress">
            <div className="item-progress-bar">
              <div
                className="item-progress-fill"
                style={{ width: `${item.progress}%` }}
              ></div>
            </div>
            <span className="item-progress-text">{item.progress}%</span>
          </div>
        )}
      </div>
    </div>
  );
}

// Main LearningDepositories Component
const LearningDepositories = () => {
  const [currentLevel, setCurrentLevel] = useState('types'); // 'types', 'genres', 'items'
  const [selectedType, setSelectedType] = useState(null);
  const [selectedGenre, setSelectedGenre] = useState(null);

  // Get data from store
  const { books, media, initializeFromSupabase } = useKnowledgeStore();

  // Initialize data on mount
  useEffect(() => {
    initializeFromSupabase?.();
  }, []);

  // Build depositories data from store
  const depositoriesData = useMemo(() => {
    // Group books by genre/tags
    const booksByGenre = {};
    (books || []).forEach(book => {
      const genre = book.tags?.[0] || book.metadata?.genre || 'general';
      const genreKey = genre.toLowerCase().replace(/\s+/g, '-');
      if (!booksByGenre[genreKey]) {
        booksByGenre[genreKey] = { label: genre.charAt(0).toUpperCase() + genre.slice(1), count: 0, items: [] };
      }
      booksByGenre[genreKey].count++;
      booksByGenre[genreKey].items.push({
        id: book.id,
        title: book.title,
        author: book.author || 'Unknown',
        rating: book.rating,
        completed: book.status === 'completed',
        date: book.completedAt,
        progress: book.progress?.total > 0 ? Math.round((book.progress.current / book.progress.total) * 100) : 0
      });
    });

    // Group media by type first, then by genre
    const podcastsByGenre = {};
    const videosByGenre = {};
    const coursesByGenre = {};

    (media || []).forEach(item => {
      const genre = item.tags?.[0] || item.category || 'general';
      const genreKey = genre.toLowerCase().replace(/\s+/g, '-');
      const mediaItem = {
        id: item.id,
        title: item.title,
        author: item.creator || 'Unknown',
        duration: item.duration || '',
        completed: item.status === 'completed' || item.status === 'watched',
        progress: item.progress || 0,
        rating: item.rating,
        episodesWatched: item.episodesWatched || 0
      };

      if (item.type === 'podcast') {
        if (!podcastsByGenre[genreKey]) {
          podcastsByGenre[genreKey] = { label: genre.charAt(0).toUpperCase() + genre.slice(1), count: 0, items: [] };
        }
        podcastsByGenre[genreKey].count++;
        podcastsByGenre[genreKey].items.push(mediaItem);
      } else if (item.type === 'video' || item.type === 'youtube') {
        if (!videosByGenre[genreKey]) {
          videosByGenre[genreKey] = { label: genre.charAt(0).toUpperCase() + genre.slice(1), count: 0, items: [] };
        }
        videosByGenre[genreKey].count++;
        videosByGenre[genreKey].items.push(mediaItem);
      } else if (item.type === 'course') {
        if (!coursesByGenre[genreKey]) {
          coursesByGenre[genreKey] = { label: genre.charAt(0).toUpperCase() + genre.slice(1), count: 0, items: [] };
        }
        coursesByGenre[genreKey].count++;
        coursesByGenre[genreKey].items.push(mediaItem);
      }
    });

    // Count totals
    const totalBooks = (books || []).length;
    const totalPodcasts = Object.values(podcastsByGenre).reduce((sum, g) => sum + g.count, 0);
    const totalVideos = Object.values(videosByGenre).reduce((sum, g) => sum + g.count, 0);
    const totalCourses = Object.values(coursesByGenre).reduce((sum, g) => sum + g.count, 0);

    return {
      books: {
        label: 'Books',
        icon: Book,
        count: totalBooks,
        genres: Object.keys(booksByGenre).length > 0 ? booksByGenre : { general: { label: 'General', count: 0, items: [] } }
      },
      podcasts: {
        label: 'Podcasts',
        icon: Headphones,
        count: totalPodcasts,
        genres: Object.keys(podcastsByGenre).length > 0 ? podcastsByGenre : { general: { label: 'General', count: 0, items: [] } }
      },
      videos: {
        label: 'Videos',
        icon: Video,
        count: totalVideos,
        genres: Object.keys(videosByGenre).length > 0 ? videosByGenre : { general: { label: 'General', count: 0, items: [] } }
      },
      courses: {
        label: 'Courses',
        icon: GraduationCap,
        count: totalCourses,
        genres: Object.keys(coursesByGenre).length > 0 ? coursesByGenre : { general: { label: 'General', count: 0, items: [] } }
      }
    };
  }, [books, media]);

  const handleTypeClick = (type) => {
    setSelectedType(type);
    setCurrentLevel('genres');
  };

  const handleGenreClick = (genre) => {
    setSelectedGenre(genre);
    setCurrentLevel('items');
  };

  const handleBreadcrumbClick = (level) => {
    if (level === 'types') {
      setCurrentLevel('types');
      setSelectedType(null);
      setSelectedGenre(null);
    } else if (level === 'genres') {
      setCurrentLevel('genres');
      setSelectedGenre(null);
    }
  };

  const currentData = selectedType ? depositoriesData[selectedType] : null;
  const currentGenreData = selectedGenre && currentData ? currentData.genres[selectedGenre] : null;

  return (
    <div className="learning-depositories">
      {/* Breadcrumb Navigation */}
      {currentLevel !== 'types' && (
        <div className="breadcrumb-nav">
          <button
            className="breadcrumb-item"
            onClick={() => handleBreadcrumbClick('types')}
          >
            All Depositories
          </button>
          <ChevronRight size={16} className="breadcrumb-separator" />
          {selectedType && (
            <>
              <button
                className="breadcrumb-item"
                onClick={() => handleBreadcrumbClick('genres')}
              >
                {depositoriesData[selectedType].label}
              </button>
              {selectedGenre && (
                <>
                  <ChevronRight size={16} className="breadcrumb-separator" />
                  <span className="breadcrumb-item active">
                    {currentGenreData.label}
                  </span>
                </>
              )}
            </>
          )}
        </div>
      )}

      {/* Level 1: Content Types */}
      {currentLevel === 'types' && (
        <div className="depositories-grid level-types">
          <h2 className="level-title">Knowledge Depositories</h2>
          <p className="level-description">
            Choose a depository to explore your learning journey
          </p>
          <div className="depositories-cards">
            {Object.entries(depositoriesData).map(([key, data]) => (
              <DepositoryCard
                key={key}
                type={key}
                data={data}
                onClick={handleTypeClick}
              />
            ))}
          </div>
        </div>
      )}

      {/* Level 2: Genres */}
      {currentLevel === 'genres' && currentData && (
        <div className="genres-grid level-genres">
          <h2 className="level-title">{currentData.label}</h2>
          <p className="level-description">
            Select a genre to view your {currentData.label.toLowerCase()}
          </p>
          <div className="genres-cards">
            {Object.entries(currentData.genres).map(([key, data]) => (
              <GenreCard
                key={key}
                genre={key}
                data={data}
                onClick={handleGenreClick}
              />
            ))}
          </div>
        </div>
      )}

      {/* Level 3: Items */}
      {currentLevel === 'items' && currentGenreData && (
        <div className="items-list level-items">
          <h2 className="level-title">{currentGenreData.label}</h2>
          <p className="level-description">
            {currentGenreData.count} items in this collection
          </p>
          <div className="items-grid">
            {currentGenreData.items.map((item) => (
              <ItemCard key={item.id} item={item} type={selectedType} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LearningDepositories;
