import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Book, Headphones, FileText, Video, GraduationCap, Star } from 'lucide-react';
import Card from '../shared/Card';
import Button from '../shared/Button';
import StatCard from '../shared/StatCard';
import AddLearningModal from './AddLearningModal';
import { useKnowledgeStore } from '../../stores/knowledgeStore';
import './LearningLogTab.css';

const LearningLogTab = () => {
  const [contentType, setContentType] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // Get data from store
  const { books, media, initializeFromSupabase, addBook, addMedia } = useKnowledgeStore();

  // Initialize data on mount
  useEffect(() => {
    initializeFromSupabase?.();
  }, []);

  // Transform store data to learning items format
  const { learningItems, stats } = useMemo(() => {
    const items = [];
    const today = new Date();
    const monthAgo = new Date(today);
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    // Transform books
    (books || []).forEach(book => {
      items.push({
        id: book.id,
        type: 'book',
        title: book.title,
        author: book.author || 'Unknown',
        dateCompleted: book.completedAt,
        dateStarted: book.startedAt,
        rating: book.rating,
        keyInsights: book.notes || [],
        tags: book.tags || [],
        status: book.status === 'completed' ? 'completed' : book.status === 'reading' ? 'in-progress' : 'wishlist',
        progress: book.progress?.total > 0 ? Math.round((book.progress.current / book.progress.total) * 100) : 0
      });
    });

    // Transform media
    (media || []).forEach(m => {
      const mediaType = m.type === 'podcast' ? 'podcast' : m.type === 'course' ? 'course' : m.type === 'youtube' ? 'video' : m.type;
      items.push({
        id: m.id,
        type: mediaType,
        title: m.title,
        author: m.creator || 'Unknown',
        show: m.show || m.creator,
        dateCompleted: m.watchedAt,
        dateStarted: m.createdAt,
        dateListened: m.watchedAt,
        rating: m.rating,
        keyInsights: m.notes || [],
        tags: m.tags || [],
        status: m.status === 'completed' || m.status === 'watched' ? 'completed' : m.status === 'watching' || m.status === 'listening' ? 'in-progress' : 'wishlist',
        progress: m.progress || 0
      });
    });

    // Calculate stats
    const itemsThisMonth = items.filter(item => {
      const completedDate = item.dateCompleted ? new Date(item.dateCompleted) : null;
      return completedDate && completedDate >= monthAgo;
    }).length;

    // Estimate learning hours (rough estimate based on content types)
    const hoursLearning = items.filter(i => i.status === 'completed').reduce((sum, item) => {
      if (item.type === 'book') return sum + 6; // avg book hours
      if (item.type === 'course') return sum + 10; // avg course hours
      if (item.type === 'podcast') return sum + 1; // avg podcast hours
      if (item.type === 'video') return sum + 0.5; // avg video hours
      return sum + 1;
    }, 0);

    // Get favorite topics from tags
    const tagCounts = {};
    items.forEach(item => {
      (item.tags || []).forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });
    const favoriteTopics = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([tag]) => tag);

    return {
      learningItems: items.sort((a, b) => {
        const dateA = new Date(a.dateCompleted || a.dateStarted || 0);
        const dateB = new Date(b.dateCompleted || b.dateStarted || 0);
        return dateB - dateA;
      }),
      stats: {
        itemsThisMonth,
        hoursLearning: Math.round(hoursLearning),
        favoriteTopics: favoriteTopics.length > 0 ? favoriteTopics : ['No topics yet']
      }
    };
  }, [books, media]);

  const handleLearningSubmit = (learningData) => {
    if (learningData.type === 'book') {
      addBook({
        title: learningData.title,
        author: learningData.author,
        status: learningData.status === 'completed' ? 'completed' : learningData.status === 'in-progress' ? 'reading' : 'want-to-read',
        tags: learningData.tags || [],
        rating: learningData.rating,
      });
    } else {
      addMedia({
        type: learningData.type,
        title: learningData.title,
        creator: learningData.author || learningData.show,
        status: learningData.status === 'completed' ? 'completed' : learningData.status === 'in-progress' ? 'watching' : 'want-to-watch',
        tags: learningData.tags || [],
      });
    }
    console.log('Learning content added:', learningData);
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'book': return <Book size={20} />;
      case 'podcast': return <Headphones size={20} />;
      case 'article': return <FileText size={20} />;
      case 'video': return <Video size={20} />;
      case 'course': return <GraduationCap size={20} />;
      default: return <Book size={20} />;
    }
  };

  const getTypeLabel = (type) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const filteredItems = contentType === 'all' 
    ? learningItems 
    : learningItems.filter(item => item.type === contentType);

  return (
    <div className="learning-log-tab">
      {/* Stats */}
      <div className="stats-grid">
        <StatCard
          icon={Book}
          label="Items This Month"
          value={stats.itemsThisMonth}
          module="knowledge"
        />
        <StatCard
          icon={GraduationCap}
          label="Learning Hours"
          value={stats.hoursLearning}
          unit="hrs"
          module="knowledge"
        />
        <StatCard
          icon={Star}
          label="Top Topics"
          value={stats.favoriteTopics.join(', ')}
          module="knowledge"
        />
      </div>

      {/* Currently Learning */}
      <Card title="Currently Learning">
        {learningItems.filter(item => item.status === 'in-progress').length === 0 ? (
          <div className="empty-state">
            <Book size={48} className="empty-icon" />
            <h3>No items in progress</h3>
            <p>Start a book, course, or podcast series</p>
          </div>
        ) : (
          <div className="in-progress-grid">
            {learningItems.filter(item => item.status === 'in-progress').map(item => (
              <div key={item.id} className="in-progress-card">
                <div className="item-type-icon knowledge">
                  {getTypeIcon(item.type)}
                </div>
                <div className="item-info">
                  <div className="item-title">{item.title}</div>
                  {item.author && (
                    <div className="item-author">{item.author}</div>
                  )}
                  <div className="item-progress">
                    <div className="progress-bar-mini">
                      <div 
                        className="progress-fill-mini"
                        style={{ width: `${item.progress}%` }}
                      ></div>
                    </div>
                    <span className="progress-text">{item.progress}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Learning History */}
      <Card 
        title="Learning History"
        action="Add Content"
        onActionClick={() => setShowAddModal(true)}
      >
        <div className="filter-buttons">
          <Button 
            variant={contentType === 'all' ? 'primary' : 'ghost'}
            size="small"
            onClick={() => setContentType('all')}
          >
            All
          </Button>
          <Button 
            variant={contentType === 'book' ? 'primary' : 'ghost'}
            size="small"
            onClick={() => setContentType('book')}
          >
            Books
          </Button>
          <Button 
            variant={contentType === 'podcast' ? 'primary' : 'ghost'}
            size="small"
            onClick={() => setContentType('podcast')}
          >
            Podcasts
          </Button>
          <Button 
            variant={contentType === 'article' ? 'primary' : 'ghost'}
            size="small"
            onClick={() => setContentType('article')}
          >
            Articles
          </Button>
        </div>

        {filteredItems.length === 0 ? (
          <div className="empty-state">
            <Book size={48} className="empty-icon" />
            <h3>No learning content logged</h3>
            <p>Start building your learning library</p>
            <Button variant="primary" onClick={() => setShowAddModal(true)}>
              Add First Item
            </Button>
          </div>
        ) : (
          <div className="learning-items-list">
            {filteredItems.map(item => (
              <div key={item.id} className="learning-item-card">
                <div className="item-header">
                  <div className="item-type-badge">
                    {getTypeIcon(item.type)}
                    <span>{getTypeLabel(item.type)}</span>
                  </div>
                  {item.rating && (
                    <div className="item-rating">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          fill={i < item.rating ? 'var(--color-knowledge-500)' : 'none'}
                          color="var(--color-knowledge-500)"
                        />
                      ))}
                    </div>
                  )}
                </div>

                <div className="item-content">
                  <h4 className="item-title">{item.title}</h4>
                  {item.author && (
                    <div className="item-meta">{item.author}</div>
                  )}
                  {item.show && (
                    <div className="item-meta">{item.show}</div>
                  )}
                  
                  {item.keyInsights && item.keyInsights.length > 0 && (
                    <div className="item-insights">
                      <div className="insights-label">Key Insights:</div>
                      <ul className="insights-list">
                        {item.keyInsights.map((insight, i) => (
                          <li key={i}>{insight}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="item-tags">
                    {item.tags.map(tag => (
                      <span key={tag} className="tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="item-footer">
                  <span className="item-date">
                    {item.dateCompleted 
                      ? `Completed ${new Date(item.dateCompleted).toLocaleDateString()}`
                      : `Started ${new Date(item.dateStarted).toLocaleDateString()}`
                    }
                  </span>
                  <Button variant="ghost" size="small">
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Add Learning Modal */}
      <AddLearningModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleLearningSubmit}
      />
    </div>
  );
};

export default LearningLogTab;