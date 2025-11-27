/**
 * Books View - Dedicated view for managing books
 */

import React, { useState, useMemo } from 'react';
import { useKnowledgeStore } from '../../stores/knowledgeStore';
import {
  Book, Star, Search, Grid3x3, List, Plus, Check, BookOpen,
  Clock, Filter
} from 'lucide-react';
import './MediaViews.css';

const STATUS_TABS = [
  { id: 'all', label: 'All' },
  { id: 'reading', label: 'Reading' },
  { id: 'completed', label: 'Completed' },
  { id: 'want-to-read', label: 'Want to Read' },
];

export default function BooksView() {
  const { books, setActiveView } = useKnowledgeStore();
  const [activeTab, setActiveTab] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredBooks = useMemo(() => {
    let items = books;

    // Filter by status
    if (activeTab !== 'all') {
      items = items.filter(book => book.status === activeTab);
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      items = items.filter(book =>
        book.title.toLowerCase().includes(query) ||
        book.author?.toLowerCase().includes(query)
      );
    }

    return items;
  }, [books, activeTab, searchQuery]);

  const stats = useMemo(() => ({
    total: books.length,
    reading: books.filter(b => b.status === 'reading').length,
    completed: books.filter(b => b.status === 'completed').length,
    wantToRead: books.filter(b => b.status === 'want-to-read').length,
  }), [books]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'reading': return <BookOpen size={12} />;
      case 'completed': return <Check size={12} />;
      case 'want-to-read': return <Clock size={12} />;
      default: return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'reading': return { bg: 'rgba(59, 130, 246, 0.15)', text: '#60a5fa' };
      case 'completed': return { bg: 'rgba(34, 197, 94, 0.15)', text: '#4ade80' };
      case 'want-to-read': return { bg: 'rgba(251, 191, 36, 0.15)', text: '#fbbf24' };
      default: return { bg: 'rgba(255, 255, 255, 0.1)', text: 'white' };
    }
  };

  return (
    <div className="media-view">
      {/* Stats Row */}
      <div className="media-stats-row">
        <div className="media-stat">
          <Book size={18} />
          <span className="stat-value">{stats.total}</span>
          <span className="stat-label">Total Books</span>
        </div>
        <div className="media-stat reading">
          <BookOpen size={18} />
          <span className="stat-value">{stats.reading}</span>
          <span className="stat-label">Reading</span>
        </div>
        <div className="media-stat completed">
          <Check size={18} />
          <span className="stat-value">{stats.completed}</span>
          <span className="stat-label">Completed</span>
        </div>
        <div className="media-stat pending">
          <Clock size={18} />
          <span className="stat-value">{stats.wantToRead}</span>
          <span className="stat-label">Want to Read</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="media-tabs">
        {STATUS_TABS.map(tab => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
            <span className="tab-count">
              {tab.id === 'all' ? stats.total :
               tab.id === 'reading' ? stats.reading :
               tab.id === 'completed' ? stats.completed : stats.wantToRead}
            </span>
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="media-controls">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search books..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="controls-right">
          <div className="view-toggle">
            <button
              className={viewMode === 'grid' ? 'active' : ''}
              onClick={() => setViewMode('grid')}
            >
              <Grid3x3 size={18} />
            </button>
            <button
              className={viewMode === 'list' ? 'active' : ''}
              onClick={() => setViewMode('list')}
            >
              <List size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className={`media-content ${viewMode}`}>
        {filteredBooks.length === 0 ? (
          <div className="empty-state">
            <Book size={48} />
            <h3>No books found</h3>
            <p>Add some books to your library</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="media-grid books-grid">
            {filteredBooks.map(book => {
              const statusColor = getStatusColor(book.status);
              return (
                <div key={book.id} className="media-card">
                  <div className="media-card-cover">
                    {book.coverImage ? (
                      <img src={book.coverImage} alt={book.title} />
                    ) : (
                      <div className="cover-placeholder book">
                        <Book size={28} />
                      </div>
                    )}
                    {book.rating && (
                      <div className="card-rating">
                        <Star size={12} fill="#fbbf24" stroke="#fbbf24" />
                        <span>{book.rating}</span>
                      </div>
                    )}
                    {book.status === 'reading' && book.progress && (
                      <div className="card-progress-bar">
                        <div
                          className="progress-fill"
                          style={{ width: `${(book.progress.current / book.progress.total) * 100}%` }}
                        />
                      </div>
                    )}
                  </div>
                  <div className="media-card-info">
                    <h4 className="card-title">{book.title}</h4>
                    <p className="card-author">{book.author}</p>
                    <div className="card-status" style={{ background: statusColor.bg, color: statusColor.text }}>
                      {getStatusIcon(book.status)}
                      <span>{book.status?.replace(/-/g, ' ')}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="media-list">
            {filteredBooks.map(book => {
              const statusColor = getStatusColor(book.status);
              return (
                <div key={book.id} className="media-list-item">
                  <div className="list-item-cover">
                    {book.coverImage ? (
                      <img src={book.coverImage} alt={book.title} />
                    ) : (
                      <div className="cover-placeholder book">
                        <Book size={20} />
                      </div>
                    )}
                  </div>
                  <div className="list-item-info">
                    <h4 className="list-item-title">{book.title}</h4>
                    <p className="list-item-author">{book.author}</p>
                    <div className="list-item-meta">
                      <span className="status-tag" style={{ background: statusColor.bg, color: statusColor.text }}>
                        {getStatusIcon(book.status)}
                        {book.status?.replace(/-/g, ' ')}
                      </span>
                    </div>
                  </div>
                  <div className="list-item-actions">
                    {book.rating && (
                      <div className="rating-display">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            fill={i < book.rating ? '#fbbf24' : 'none'}
                            stroke={i < book.rating ? '#fbbf24' : 'rgba(255,255,255,0.2)'}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add FAB */}
      <button className="add-fab">
        <Plus size={24} />
      </button>
    </div>
  );
}
