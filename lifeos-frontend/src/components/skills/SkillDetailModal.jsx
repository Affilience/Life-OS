import React, { useState } from 'react';
import { X, Clock, TrendingUp, Target, Award, Calendar, Plus, Edit3 } from 'lucide-react';
import Button from '../shared/Button';
import './SkillDetailModal.css';

const SkillDetailModal = ({ skill, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');

  const getLevelColor = (level) => {
    switch (level) {
      case 'beginner':
        return 'var(--color-skills-200)';
      case 'intermediate':
        return 'var(--color-skills-400)';
      case 'advanced':
        return 'var(--color-skills-600)';
      case 'expert':
        return 'var(--color-skills-800)';
      default:
        return 'var(--color-skills-500)';
    }
  };

  const getCategoryLabel = (category) => {
    const categories = {
      practical: 'Practical Life',
      communication: 'Communication',
      physical: 'Physical',
      cognitive: 'Cognitive',
      creative: 'Creative',
      professional: 'Professional',
      digital: 'Digital'
    };
    return categories[category] || category;
  };

  const getTimeSinceLastPractice = (lastPracticed) => {
    const lastDate = new Date(lastPracticed);
    const today = new Date();
    const diffTime = Math.abs(today - lastDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  // Mock practice history data
  const practiceHistory = [
    { date: '2025-10-26', duration: 1.5, notes: 'Focused on advanced array methods' },
    { date: '2025-10-24', duration: 2, notes: 'Built a small React component' },
    { date: '2025-10-22', duration: 1, notes: 'Studied async/await patterns' },
    { date: '2025-10-20', duration: 2.5, notes: 'Worked on personal project' },
    { date: '2025-10-18', duration: 1, notes: 'Code review and cleanup' }
  ];

  // Mock upcoming goals
  const upcomingGoals = [
    { id: 1, goal: 'Learn React hooks in depth', targetDate: '2025-11-15', priority: 'high' },
    { id: 2, goal: 'Build a full-stack application', targetDate: '2025-12-01', priority: 'medium' },
    { id: 3, goal: 'Master TypeScript basics', targetDate: '2025-11-30', priority: 'medium' }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Target },
    { id: 'history', label: 'Practice History', icon: Clock },
    { id: 'goals', label: 'Goals & Milestones', icon: Award }
  ];

  const renderOverview = () => (
    <div className="skill-overview">
      <div className="overview-stats">
        <div className="stat-group">
          <div className="stat-item large">
            <div className="stat-value">{skill.progress}%</div>
            <div className="stat-label">Progress</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{skill.timeInvested}h</div>
            <div className="stat-label">Time Invested</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{skill.milestones?.length || 0}</div>
            <div className="stat-label">Milestones</div>
          </div>
        </div>
      </div>

      <div className="progress-section">
        <h4>Current Progress</h4>
        <div className="progress-bar-container">
          <div className="progress-bar-bg">
            <div 
              className="progress-bar-fill"
              style={{ 
                width: `${skill.progress}%`,
                backgroundColor: 'var(--color-skills-500)'
              }}
            />
          </div>
          <span className="progress-percentage">{skill.progress}%</span>
        </div>
      </div>

      {skill.nextGoal && (
        <div className="next-goal-section">
          <h4>Next Goal</h4>
          <div className="goal-card">
            <Target size={16} />
            <span>{skill.nextGoal}</span>
          </div>
        </div>
      )}

      <div className="milestones-section">
        <h4>Recent Milestones</h4>
        <div className="milestones-list">
          {skill.milestones?.map((milestone, index) => (
            <div key={index} className="milestone-item">
              <Award size={14} />
              <span>{milestone}</span>
            </div>
          )) || (
            <div className="empty-state">No milestones recorded yet</div>
          )}
        </div>
      </div>
    </div>
  );

  const renderHistory = () => (
    <div className="practice-history">
      <div className="history-header">
        <h4>Recent Practice Sessions</h4>
        <Button variant="primary" size="small" icon={Plus}>
          Log Practice
        </Button>
      </div>
      <div className="history-list">
        {practiceHistory.map((session, index) => (
          <div key={index} className="history-item">
            <div className="session-date">
              <Calendar size={16} />
              {new Date(session.date).toLocaleDateString('en-GB', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric' 
              })}
            </div>
            <div className="session-duration">
              <Clock size={16} />
              {session.duration}h
            </div>
            <div className="session-notes">{session.notes}</div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderGoals = () => (
    <div className="goals-section">
      <div className="goals-header">
        <h4>Upcoming Goals</h4>
        <Button variant="primary" size="small" icon={Plus}>
          Add Goal
        </Button>
      </div>
      <div className="goals-list">
        {upcomingGoals.map((goalItem) => (
          <div key={goalItem.id} className="goal-item">
            <div className="goal-content">
              <div className="goal-text">{goalItem.goal}</div>
              <div className="goal-meta">
                <span className="goal-date">
                  Target: {new Date(goalItem.targetDate).toLocaleDateString('en-GB')}
                </span>
                <span className={`goal-priority ${goalItem.priority}`}>
                  {goalItem.priority} priority
                </span>
              </div>
            </div>
            <Button variant="ghost" size="small" icon={Edit3} />
          </div>
        ))}
      </div>

      <div className="achieved-milestones">
        <h4>Achieved Milestones</h4>
        <div className="milestones-list">
          {skill.milestones?.map((milestone, index) => (
            <div key={index} className="milestone-item achieved">
              <Award size={14} />
              <span>{milestone}</span>
              <span className="achievement-date">Oct 2025</span>
            </div>
          )) || (
            <div className="empty-state">No milestones achieved yet</div>
          )}
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'history':
        return renderHistory();
      case 'goals':
        return renderGoals();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="skill-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="skill-header-info">
            <div className="skill-title-section">
              <h2 className="skill-title">{skill.name}</h2>
              <div className="skill-meta">
                <span className="skill-category">{getCategoryLabel(skill.category)}</span>
                <div className="skill-level" style={{ 
                  backgroundColor: getLevelColor(skill.level),
                  color: 'white'
                }}>
                  {skill.level}
                </div>
              </div>
            </div>
            <div className="skill-quick-stats">
              <div className="quick-stat">
                <TrendingUp size={16} />
                <span>{getTimeSinceLastPractice(skill.lastPracticed)}</span>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="small" icon={X} onClick={onClose} />
        </div>

        <div className="modal-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="modal-content">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default SkillDetailModal;