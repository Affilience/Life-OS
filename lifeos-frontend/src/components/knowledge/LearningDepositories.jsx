import React, { useState } from 'react';
import { Book, Headphones, Video, GraduationCap, ChevronRight, Star, Clock } from 'lucide-react';
import './LearningDepositories.css';

// Mock data structure
const depositoriesData = {
  books: {
    label: 'Books',
    icon: Book,
    count: 127,
    genres: {
      tech: { label: 'Technology', count: 45, items: [
        { id: 1, title: 'Clean Code', author: 'Robert C. Martin', rating: 5, completed: true, date: '2025-10-15' },
        { id: 2, title: 'Design Patterns', author: 'Gang of Four', rating: 4, completed: true, date: '2025-09-20' },
        { id: 3, title: 'Refactoring', author: 'Martin Fowler', rating: 5, completed: false, progress: 60 },
      ]},
      business: { label: 'Business', count: 32, items: [
        { id: 4, title: 'Zero to One', author: 'Peter Thiel', rating: 5, completed: true, date: '2025-08-10' },
        { id: 5, title: 'The Lean Startup', author: 'Eric Ries', rating: 4, completed: true, date: '2025-07-22' },
      ]},
      philosophy: { label: 'Philosophy', count: 28, items: [
        { id: 6, title: 'Meditations', author: 'Marcus Aurelius', rating: 5, completed: true, date: '2025-09-05' },
        { id: 7, title: 'The Daily Stoic', author: 'Ryan Holiday', rating: 4, completed: false, progress: 40 },
      ]},
      fiction: { label: 'Fiction', count: 22, items: [
        { id: 8, title: 'Dune', author: 'Frank Herbert', rating: 5, completed: true, date: '2025-06-15' },
      ]}
    }
  },
  podcasts: {
    label: 'Podcasts',
    icon: Headphones,
    count: 84,
    genres: {
      tech: { label: 'Technology', count: 35, items: [
        { id: 9, title: 'Syntax.fm', author: 'Wes Bos & Scott Tolinski', episodesWatched: 24, completed: false },
        { id: 10, title: 'The Changelog', author: 'Changelog Media', episodesWatched: 12, completed: false },
      ]},
      business: { label: 'Business', count: 28, items: [
        { id: 11, title: 'How I Built This', author: 'Guy Raz', episodesWatched: 42, completed: false },
        { id: 12, title: 'Masters of Scale', author: 'Reid Hoffman', episodesWatched: 18, completed: false },
      ]},
      science: { label: 'Science', count: 21, items: [
        { id: 13, title: 'Lex Fridman Podcast', author: 'Lex Fridman', episodesWatched: 56, completed: false },
      ]}
    }
  },
  videos: {
    label: 'Videos',
    icon: Video,
    count: 156,
    genres: {
      tutorials: { label: 'Tutorials', count: 89, items: [
        { id: 14, title: 'React Advanced Patterns', author: 'Kent C. Dodds', duration: '4h 30m', completed: true },
        { id: 15, title: 'PostgreSQL Performance', author: 'Hussein Nasser', duration: '2h 15m', completed: false, progress: 70 },
      ]},
      talks: { label: 'Conference Talks', count: 45, items: [
        { id: 16, title: 'The Future of Web', author: 'Various', duration: '45m', completed: true },
      ]},
      documentaries: { label: 'Documentaries', count: 22, items: [
        { id: 17, title: 'The Social Dilemma', author: 'Netflix', duration: '1h 34m', completed: true },
      ]}
    }
  },
  courses: {
    label: 'Courses',
    icon: GraduationCap,
    count: 28,
    genres: {
      programming: { label: 'Programming', count: 18, items: [
        { id: 18, title: 'Advanced React & GraphQL', author: 'Wes Bos', progress: 85, completed: false },
        { id: 19, title: 'Node.js Mastery', author: 'Andrew Mead', progress: 100, completed: true, rating: 5 },
      ]},
      design: { label: 'Design', count: 6, items: [
        { id: 20, title: 'Figma Masterclass', author: 'Design Course', progress: 45, completed: false },
      ]},
      business: { label: 'Business', count: 4, items: [
        { id: 21, title: 'Marketing Fundamentals', author: 'Seth Godin', progress: 30, completed: false },
      ]}
    }
  }
};

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
