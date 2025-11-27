/**
 * Courses View - Dedicated view for managing online courses
 */

import React, { useState, useMemo } from 'react';
import { useKnowledgeStore } from '../../stores/knowledgeStore';
import {
  GraduationCap, Star, Search, Grid3x3, List, Plus, Check, Play,
  Clock, ExternalLink, BookOpen, Target
} from 'lucide-react';
import './MediaViews.css';

const STATUS_TABS = [
  { id: 'all', label: 'All' },
  { id: 'in-progress', label: 'In Progress' },
  { id: 'completed', label: 'Completed' },
  { id: 'want-to-take', label: 'Want to Take' },
];

export default function CoursesView() {
  const { media } = useKnowledgeStore();
  const [activeTab, setActiveTab] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter only courses
  const courses = useMemo(() =>
    media.filter(m => m.type === 'course'),
    [media]
  );

  const filteredCourses = useMemo(() => {
    let items = courses;

    // Filter by status
    if (activeTab !== 'all') {
      const statusMap = {
        'in-progress': 'in-progress',
        'completed': 'completed',
        'want-to-take': 'want-to-watch'
      };
      items = items.filter(c => c.status === statusMap[activeTab]);
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      items = items.filter(c =>
        c.title.toLowerCase().includes(query) ||
        c.creator?.toLowerCase().includes(query)
      );
    }

    return items;
  }, [courses, activeTab, searchQuery]);

  const stats = useMemo(() => ({
    total: courses.length,
    inProgress: courses.filter(c => c.status === 'in-progress').length,
    completed: courses.filter(c => c.status === 'completed').length,
    wantToTake: courses.filter(c => c.status === 'want-to-watch').length,
  }), [courses]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'in-progress': return { bg: 'rgba(59, 130, 246, 0.15)', text: '#60a5fa' };
      case 'completed': return { bg: 'rgba(34, 197, 94, 0.15)', text: '#4ade80' };
      case 'want-to-watch': return { bg: 'rgba(251, 191, 36, 0.15)', text: '#fbbf24' };
      default: return { bg: 'rgba(255, 255, 255, 0.1)', text: 'white' };
    }
  };

  return (
    <div className="media-view">
      {/* Stats Row */}
      <div className="media-stats-row">
        <div className="media-stat course">
          <GraduationCap size={18} />
          <span className="stat-value">{stats.total}</span>
          <span className="stat-label">Total Courses</span>
        </div>
        <div className="media-stat reading">
          <BookOpen size={18} />
          <span className="stat-value">{stats.inProgress}</span>
          <span className="stat-label">In Progress</span>
        </div>
        <div className="media-stat completed">
          <Check size={18} />
          <span className="stat-value">{stats.completed}</span>
          <span className="stat-label">Completed</span>
        </div>
        <div className="media-stat pending">
          <Target size={18} />
          <span className="stat-value">{stats.wantToTake}</span>
          <span className="stat-label">Want to Take</span>
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
               tab.id === 'in-progress' ? stats.inProgress :
               tab.id === 'completed' ? stats.completed : stats.wantToTake}
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
            placeholder="Search courses..."
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
        {filteredCourses.length === 0 ? (
          <div className="empty-state">
            <GraduationCap size={48} />
            <h3>No courses found</h3>
            <p>Add some courses to your library</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="media-grid courses-grid">
            {filteredCourses.map(course => {
              const statusColor = getStatusColor(course.status);
              return (
                <div key={course.id} className="media-card course-card">
                  <div className="media-card-cover video">
                    {course.thumbnailUrl ? (
                      <img src={course.thumbnailUrl} alt={course.title} />
                    ) : (
                      <div className="cover-placeholder course">
                        <GraduationCap size={32} />
                      </div>
                    )}
                    {course.status === 'in-progress' && course.progress && (
                      <div className="course-progress-overlay">
                        <div className="progress-bar">
                          <div
                            className="progress-fill"
                            style={{ width: `${course.progress}%` }}
                          />
                        </div>
                        <span className="progress-text">{course.progress}%</span>
                      </div>
                    )}
                  </div>
                  <div className="media-card-info">
                    <h4 className="card-title">{course.title}</h4>
                    <p className="card-author">{course.creator}</p>
                    <div className="card-status" style={{ background: statusColor.bg, color: statusColor.text }}>
                      {course.status === 'completed' ? <Check size={12} /> :
                       course.status === 'in-progress' ? <BookOpen size={12} /> : <Target size={12} />}
                      <span>
                        {course.status === 'completed' ? 'Completed' :
                         course.status === 'in-progress' ? 'In Progress' : 'Want to Take'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="media-list">
            {filteredCourses.map(course => {
              const statusColor = getStatusColor(course.status);
              return (
                <div key={course.id} className="media-list-item">
                  <div className="list-item-cover video">
                    {course.thumbnailUrl ? (
                      <img src={course.thumbnailUrl} alt={course.title} />
                    ) : (
                      <div className="cover-placeholder course">
                        <GraduationCap size={20} />
                      </div>
                    )}
                  </div>
                  <div className="list-item-info">
                    <h4 className="list-item-title">{course.title}</h4>
                    <p className="list-item-author">{course.creator}</p>
                    <div className="list-item-meta">
                      <span className="status-tag" style={{ background: statusColor.bg, color: statusColor.text }}>
                        {course.status === 'completed' ? 'Completed' :
                         course.status === 'in-progress' ? 'In Progress' : 'Want to Take'}
                      </span>
                      {course.progress && course.status === 'in-progress' && (
                        <span className="progress-tag">
                          {course.progress}% complete
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="list-item-actions">
                    <button className="action-btn play">
                      <Play size={18} />
                    </button>
                    {course.url && (
                      <a href={course.url} target="_blank" rel="noopener noreferrer" className="action-btn">
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

      {/* Add FAB */}
      <button className="add-fab course">
        <Plus size={24} />
      </button>
    </div>
  );
}
