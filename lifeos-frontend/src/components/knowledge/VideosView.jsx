/**
 * Videos View - Dedicated view for managing videos
 */

import React, { useState, useMemo } from 'react';
import { useKnowledgeStore } from '../../stores/knowledgeStore';
import {
  Video, Star, Search, Grid3x3, List, Plus, Check, Play,
  Clock, ExternalLink
} from 'lucide-react';
import AddMediaModal from './AddMediaModal';
import './MediaViews.css';

const STATUS_TABS = [
  { id: 'all', label: 'All' },
  { id: 'watching', label: 'Watching' },
  { id: 'completed', label: 'Watched' },
  { id: 'want-to-watch', label: 'Watch Later' },
];

export default function VideosView() {
  const { media } = useKnowledgeStore();
  const [activeTab, setActiveTab] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Filter only videos
  const videos = useMemo(() =>
    media.filter(m => m.type === 'youtube' || m.type === 'video'),
    [media]
  );

  const filteredVideos = useMemo(() => {
    let items = videos;

    // Filter by status
    if (activeTab !== 'all') {
      const statusMap = {
        'watching': 'in-progress',
        'completed': 'completed',
        'want-to-watch': 'want-to-watch'
      };
      items = items.filter(v => v.status === statusMap[activeTab]);
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      items = items.filter(v =>
        v.title.toLowerCase().includes(query) ||
        v.creator?.toLowerCase().includes(query)
      );
    }

    return items;
  }, [videos, activeTab, searchQuery]);

  const stats = useMemo(() => ({
    total: videos.length,
    watching: videos.filter(v => v.status === 'in-progress').length,
    completed: videos.filter(v => v.status === 'completed').length,
    watchLater: videos.filter(v => v.status === 'want-to-watch').length,
  }), [videos]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'in-progress': return { bg: 'rgba(34, 197, 94, 0.15)', text: '#4ade80' };
      case 'completed': return { bg: 'rgba(59, 130, 246, 0.15)', text: '#60a5fa' };
      case 'want-to-watch': return { bg: 'rgba(251, 191, 36, 0.15)', text: '#fbbf24' };
      default: return { bg: 'rgba(255, 255, 255, 0.1)', text: 'white' };
    }
  };

  return (
    <div className="media-view">
      {/* Stats Row */}
      <div className="media-stats-row">
        <div className="media-stat video">
          <Video size={18} />
          <span className="stat-value">{stats.total}</span>
          <span className="stat-label">Total Videos</span>
        </div>
        <div className="media-stat reading">
          <Play size={18} />
          <span className="stat-value">{stats.watching}</span>
          <span className="stat-label">Watching</span>
        </div>
        <div className="media-stat completed">
          <Check size={18} />
          <span className="stat-value">{stats.completed}</span>
          <span className="stat-label">Watched</span>
        </div>
        <div className="media-stat pending">
          <Clock size={18} />
          <span className="stat-value">{stats.watchLater}</span>
          <span className="stat-label">Watch Later</span>
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
               tab.id === 'watching' ? stats.watching :
               tab.id === 'completed' ? stats.completed : stats.watchLater}
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
            placeholder="Search videos..."
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
        {filteredVideos.length === 0 ? (
          <div className="empty-state">
            <Video size={48} />
            <h3>No videos found</h3>
            <p>Add some videos to your library</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="media-grid videos-grid">
            {filteredVideos.map(video => {
              const statusColor = getStatusColor(video.status);
              return (
                <div key={video.id} className="media-card video-card">
                  <div className="media-card-cover video">
                    {video.thumbnailUrl ? (
                      <img src={video.thumbnailUrl} alt={video.title} />
                    ) : (
                      <div className="cover-placeholder video">
                        <Video size={32} />
                      </div>
                    )}
                    <button className="play-overlay">
                      <Play size={32} fill="white" />
                    </button>
                    {video.duration && (
                      <span className="duration-badge">{video.duration}</span>
                    )}
                  </div>
                  <div className="media-card-info">
                    <h4 className="card-title">{video.title}</h4>
                    <p className="card-author">{video.creator}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="media-list">
            {filteredVideos.map(video => {
              const statusColor = getStatusColor(video.status);
              return (
                <div key={video.id} className="media-list-item">
                  <div className="list-item-cover video">
                    {video.thumbnailUrl ? (
                      <img src={video.thumbnailUrl} alt={video.title} />
                    ) : (
                      <div className="cover-placeholder video">
                        <Video size={20} />
                      </div>
                    )}
                  </div>
                  <div className="list-item-info">
                    <h4 className="list-item-title">{video.title}</h4>
                    <p className="list-item-author">{video.creator}</p>
                    <div className="list-item-meta">
                      {video.duration && (
                        <span className="duration-tag">
                          <Clock size={12} />
                          {video.duration}
                        </span>
                      )}
                      <span className="status-tag" style={{ background: statusColor.bg, color: statusColor.text }}>
                        {video.status === 'completed' ? 'Watched' :
                         video.status === 'in-progress' ? 'Watching' : 'Watch Later'}
                      </span>
                    </div>
                  </div>
                  <div className="list-item-actions">
                    <button className="action-btn play">
                      <Play size={18} />
                    </button>
                    {video.url && (
                      <a href={video.url} target="_blank" rel="noopener noreferrer" className="action-btn">
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

      {/* Add Video Button */}
      <button className="add-fab video" onClick={() => setShowAddModal(true)}>
        <Plus size={20} />
        <span>Add Video</span>
      </button>

      {/* Add Media Modal */}
      <AddMediaModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        defaultType="youtube"
      />
    </div>
  );
}
