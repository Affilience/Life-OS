import React, { useState, useMemo } from 'react';
import { X, Clock, TrendingUp, Target, Award, Calendar, Plus, Edit3, CheckCircle2 } from 'lucide-react';
import Button from '../shared/Button';
import useSkillsStore, { getXpProgress, getProficiencyLevel } from '../../stores/skillsStore';
import './SkillDetailModal.css';

const SkillDetailModal = ({ skill, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const { addGoal, toggleGoal, addMilestone } = useSkillsStore();
  const [newGoalText, setNewGoalText] = useState('');
  const [showAddGoal, setShowAddGoal] = useState(false);

  // Calculate real progress from XP
  const xpProgress = useMemo(() => getXpProgress(skill.xp || 0), [skill.xp]);
  const proficiencyLevel = useMemo(() => getProficiencyLevel(skill.xp || 0), [skill.xp]);

  // Get real practice sessions from skill (most recent first, limited to 10)
  const practiceHistory = useMemo(() => {
    return (skill.sessions || []).slice(0, 10).map(session => ({
      date: session.date,
      duration: Math.round(session.minutes / 60 * 10) / 10, // Convert to hours
      notes: session.notes || 'Practice session',
      xpEarned: session.xpEarned || 0,
    }));
  }, [skill.sessions]);

  // Get real goals from skill
  const skillGoals = useMemo(() => skill.goals || [], [skill.goals]);

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

  // Calculate total practice time in hours
  const totalHours = Math.round((skill.totalMinutes || 0) / 60 * 10) / 10;

  // Get last practice date
  const lastPracticed = skill.sessions?.[0]?.date;

  // Handle adding a new goal
  const handleAddGoal = () => {
    if (newGoalText.trim()) {
      addGoal(skill.id, newGoalText.trim());
      setNewGoalText('');
      setShowAddGoal(false);
    }
  };

  // Handle toggling goal completion
  const handleToggleGoal = (goalId) => {
    toggleGoal(skill.id, goalId);
  };

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
            <div className="stat-value">{skill.xp || 0}</div>
            <div className="stat-label">Total XP</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{totalHours}h</div>
            <div className="stat-label">Time Invested</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{skill.milestones?.length || 0}</div>
            <div className="stat-label">Milestones</div>
          </div>
        </div>
      </div>

      <div className="progress-section">
        <h4>Progress to {proficiencyLevel.id === 'expert' ? 'Mastery' : 'Next Level'}</h4>
        <div className="progress-bar-container">
          <div className="progress-bar-bg">
            <div
              className="progress-bar-fill"
              style={{
                width: `${Math.round(xpProgress.percent)}%`,
                backgroundColor: 'var(--color-skills-500)'
              }}
            />
          </div>
          <span className="progress-percentage">{Math.round(xpProgress.percent)}%</span>
        </div>
        <div className="progress-detail" style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
          {xpProgress.current} / {xpProgress.next} XP to next level
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
        {practiceHistory.length === 0 ? (
          <div className="empty-state">
            No practice sessions yet. Start practicing to see your history!
          </div>
        ) : (
          practiceHistory.map((session, index) => (
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
                {session.xpEarned > 0 && (
                  <span style={{ marginLeft: '0.5rem', color: 'var(--color-skills-400)' }}>
                    +{session.xpEarned} XP
                  </span>
                )}
              </div>
              <div className="session-notes">{session.notes}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderGoals = () => {
    const pendingGoals = skillGoals.filter(g => !g.completed);
    const completedGoals = skillGoals.filter(g => g.completed);

    return (
      <div className="goals-section">
        <div className="goals-header">
          <h4>Goals</h4>
          <Button
            variant="primary"
            size="small"
            icon={Plus}
            onClick={() => setShowAddGoal(true)}
          >
            Add Goal
          </Button>
        </div>

        {/* Add goal input */}
        {showAddGoal && (
          <div className="add-goal-form" style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              value={newGoalText}
              onChange={(e) => setNewGoalText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddGoal()}
              placeholder="Enter a new goal..."
              style={{
                flex: 1,
                padding: '0.5rem',
                borderRadius: '0.375rem',
                border: '1px solid var(--color-border)',
                background: 'var(--color-bg-secondary)',
                color: 'var(--color-text-primary)',
              }}
              autoFocus
            />
            <Button variant="primary" size="small" onClick={handleAddGoal}>
              Add
            </Button>
            <Button variant="ghost" size="small" onClick={() => setShowAddGoal(false)}>
              Cancel
            </Button>
          </div>
        )}

        <div className="goals-list">
          {pendingGoals.length === 0 && !showAddGoal ? (
            <div className="empty-state">
              No goals set. Add a goal to track your progress!
            </div>
          ) : (
            pendingGoals.map((goalItem) => (
              <div
                key={goalItem.id}
                className="goal-item"
                onClick={() => handleToggleGoal(goalItem.id)}
                style={{ cursor: 'pointer' }}
              >
                <div className="goal-content" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      border: '2px solid var(--color-border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  />
                  <div className="goal-text">{goalItem.text}</div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Completed goals */}
        {completedGoals.length > 0 && (
          <div className="completed-goals" style={{ marginTop: '1.5rem' }}>
            <h4 style={{ marginBottom: '0.5rem', opacity: 0.7 }}>Completed</h4>
            <div className="goals-list">
              {completedGoals.map((goalItem) => (
                <div
                  key={goalItem.id}
                  className="goal-item completed"
                  onClick={() => handleToggleGoal(goalItem.id)}
                  style={{ cursor: 'pointer', opacity: 0.7 }}
                >
                  <div className="goal-content" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <CheckCircle2 size={20} style={{ color: 'var(--color-skills-500)' }} />
                    <div className="goal-text" style={{ textDecoration: 'line-through' }}>{goalItem.text}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Milestones */}
        <div className="achieved-milestones" style={{ marginTop: '1.5rem' }}>
          <h4>Milestones</h4>
          <div className="milestones-list">
            {skill.milestones?.length > 0 ? (
              skill.milestones.map((milestone, index) => (
                <div key={index} className="milestone-item achieved">
                  <Award size={14} />
                  <span>{milestone}</span>
                </div>
              ))
            ) : (
              <div className="empty-state">No milestones recorded yet</div>
            )}
          </div>
        </div>
      </div>
    );
  };

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
                  backgroundColor: getLevelColor(proficiencyLevel.id),
                  color: 'white'
                }}>
                  {proficiencyLevel.name}
                </div>
              </div>
            </div>
            <div className="skill-quick-stats">
              <div className="quick-stat">
                <TrendingUp size={16} />
                <span>{lastPracticed ? getTimeSinceLastPractice(lastPracticed) : 'No practice yet'}</span>
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