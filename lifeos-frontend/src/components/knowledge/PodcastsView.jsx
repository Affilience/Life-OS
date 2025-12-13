/**
 * Podcasts View - Dedicated view for managing podcasts
 */

import React, { useState, useMemo } from 'react';
import { useKnowledgeStore } from '../../stores/knowledgeStore';
import {
  Headphones, Star, Search, Grid3x3, List, Plus, Check, Play,
  Clock, ExternalLink
} from 'lucide-react';
import AddMediaModal from './AddMediaModal';
import './MediaViews.css';

const STATUS_TABS = [
  { id: 'all', label: 'All' },
  { id: 'listening', label: 'Listening' },
  { id: 'completed', label: 'Listened' },
  { id: 'want-to-listen', label: 'Queue' },
];

export default function PodcastsView() {
  const { media } = useKnowledgeStore();
  const [activeTab, setActiveTab] = useState('all');
  const [viewMode, setViewMode] = useState('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Filter only podcasts
  const podcasts = useMemo(() =>
    media.filter(m => m.type === 'podcast'),
    [media]
  );

  const filteredPodcasts = useMemo(() => {
    let items = podcasts;

    // Filter by status
    if (activeTab !== 'all') {
      const statusMap = {
        'listening': 'in-progress',
        'completed': 'completed',
        'want-to-listen': 'want-to-watch'
      };
      items = items.filter(p => p.status === statusMap[activeTab]);
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      items = items.filter(p =>
        p.title.toLowerCase().includes(query) ||
        p.creator?.toLowerCase().includes(query)
      );
    }

    return items;
  }, [podcasts, activeTab, searchQuery]);

  const stats = useMemo(() => ({
    total: podcasts.length,
    listening: podcasts.filter(p => p.status === 'in-progress').length,
    completed: podcasts.filter(p => p.status === 'completed').length,
    queue: podcasts.filter(p => p.status === 'want-to-watch').length,
  }), [podcasts]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'in-progress': return { bg: 'rgba(249, 115, 22, 0.15)', text: '#fb923c' };
      case 'completed': return { bg: 'rgba(34, 197, 94, 0.15)', text: '#4ade80' };
      case 'want-to-watch': return { bg: 'rgba(251, 191, 36, 0.15)', text: '#fbbf24' };
      default: return { bg: 'rgba(255, 255, 255, 0.1)', text: 'white' };
    }
  };

  return (
    <div className="media-view">
      {/* Stats Row */}
      <div className="media-stats-row">
        <div className="media-stat podcast">
          <Headphones size={18} />
          <span className="stat-value">{stats.total}</span>
          <span className="stat-label">Total Episodes</span>
        </div>
        <div className="media-stat reading">
          <Play size={18} />
          <span className="stat-value">{stats.listening}</span>
          <span className="stat-label">Listening</span>
        </div>
        <div className="media-stat completed">
          <Check size={18} />
          <span className="stat-value">{stats.completed}</span>
          <span className="stat-label">Listened</span>
        </div>
        <div className="media-stat pending">
          <Clock size={18} />
          <span className="stat-value">{stats.queue}</span>
          <span className="stat-label">In Queue</span>
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
               tab.id === 'listening' ? stats.listening :
               tab.id === 'completed' ? stats.completed : stats.queue}
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
            placeholder="Search podcasts..."
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
        {filteredPodcasts.length === 0 ? (
          <div className="empty-state">
            <Headphones size={48} />
            <h3>No podcasts found</h3>
            <p>Add some podcasts to your library</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="media-grid podcasts-grid">
            {filteredPodcasts.map(podcast => {
              const statusColor = getStatusColor(podcast.status);
              return (
                <div key={podcast.id} className="media-card">
                  <div className="media-card-cover square">
                    {podcast.thumbnailUrl ? (
                      <img src={podcast.thumbnailUrl} alt={podcast.title} />
                    ) : (
                      <div className="cover-placeholder podcast">
                        <Headphones size={28} />
                      </div>
                    )}
                    <button className="play-overlay">
                      <Play size={24} fill="white" />
                    </button>
                  </div>
                  <div className="media-card-info">
                    <h4 className="card-title">{podcast.title}</h4>
                    <p className="card-author">{podcast.creator}</p>
                    {podcast.duration && (
                      <p className="card-duration">{podcast.duration}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="media-list">
            {filteredPodcasts.map(podcast => {
              const statusColor = getStatusColor(podcast.status);
              return (
                <div key={podcast.id} className="media-list-item">
                  <div className="list-item-cover square">
                    {podcast.thumbnailUrl ? (
                      <img src={podcast.thumbnailUrl} alt={podcast.title} />
                    ) : (
                      <div className="cover-placeholder podcast">
                        <Headphones size={20} />
                      </div>
                    )}
                  </div>
                  <div className="list-item-info">
                    <h4 className="list-item-title">{podcast.title}</h4>
                    <p className="list-item-author">{podcast.creator}</p>
                    <div className="list-item-meta">
                      {podcast.duration && (
                        <span className="duration-tag">
                          <Clock size={12} />
                          {podcast.duration}
                        </span>
                      )}
                      <span className="status-tag" style={{ background: statusColor.bg, color: statusColor.text }}>
                        {podcast.status === 'completed' ? 'Listened' :
                         podcast.status === 'in-progress' ? 'Listening' : 'Queue'}
                      </span>
                    </div>
                  </div>
                  <div className="list-item-actions">
                    <button className="action-btn play">
                      <Play size={18} />
                    </button>
                    {podcast.url && (
                      <a href={podcast.url} target="_blank" rel="noopener noreferrer" className="action-btn">
                        <ExternalLink size={18} />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Podcast Button */}
      <button className="add-fab podcast" onClick={() => setShowAddModal(true)}>
        <Plus size={20} />
        <span>Add Podcast</span>
      </button>

      {/* Add Media Modal */}
      <AddMediaModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        defaultType="podcast"
      />
    </div>
  );
}
