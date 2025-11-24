import React, { useState } from 'react';
import { Plus, Book, Headphones, FileText, Video, GraduationCap, Star } from 'lucide-react';
import Card from '../shared/Card';
import Button from '../shared/Button';
import StatCard from '../shared/StatCard';
import AddLearningModal from './AddLearningModal';
import './LearningLogTab.css';

const LearningLogTab = () => {
  const [contentType, setContentType] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // Mock data
  const stats = {
    itemsThisMonth: 12,
    hoursLearning: 24,
    favoriteTopics: ['Business', 'Psychology', 'Health']
  };

  const [learningItems, setLearningItems] = useState([
    {
      id: 1,
      type: 'book',
      title: 'Atomic Habits',
      author: 'James Clear',
      dateCompleted: '2025-10-20',
      rating: 5,
      keyInsights: [
        'Focus on systems, not goals',
        'Make habits obvious, attractive, easy, satisfying',
        'Identity-based habits are most powerful'
      ],
      tags: ['Habits', 'Self-Improvement', 'Productivity'],
      status: 'completed'
    },
    {
      id: 2,
      type: 'podcast',
      title: 'Andrew Huberman: Sleep Optimization',
      show: 'Huberman Lab',
      dateListened: '2025-10-18',
      rating: 5,
      keyInsights: [
        'Morning sunlight crucial for circadian rhythm',
        'Avoid caffeine 10 hours before sleep',
        'Cool room temperature aids sleep quality'
      ],
      tags: ['Sleep', 'Health', 'Science'],
      status: 'completed'
    },
    {
      id: 3,
      type: 'book',
      title: 'The Lean Startup',
      author: 'Eric Ries',
      dateStarted: '2025-10-15',
      progress: 45,
      tags: ['Business', 'Startups', 'Innovation'],
      status: 'in-progress'
    }
  ]);

  const handleLearningSubmit = (learningData) => {
    const newLearningItem = {
      ...learningData,
      id: learningItems.length + 1
    };
    setLearningItems(prev => [newLearningItem, ...prev]);
    console.log('Learning content added:', newLearningItem);
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