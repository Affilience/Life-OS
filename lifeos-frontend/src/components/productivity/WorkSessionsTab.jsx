import React, { useState, useEffect } from 'react';
import { Play, Pause, Square, Clock, Zap, Calendar, Tag, TrendingUp } from 'lucide-react';
import useProductivityStore from '../../stores/productivityStore';
import './WorkSessionsTab.css';

const sessionTypes = [
  { id: 'deep-work', label: 'Deep Work', color: '#8b5cf6', icon: '🎯' },
  { id: 'learning', label: 'Learning', color: '#3b82f6', icon: '📚' },
  { id: 'admin', label: 'Admin', color: '#f59e0b', icon: '📋' },
  { id: 'communication', label: 'Communication', color: '#ec4899', icon: '💬' },
  { id: 'planning', label: 'Planning', color: '#10b981', icon: '🗺️' },
  { id: 'meeting', label: 'Meeting', color: '#06b6d4', icon: '🤝' },
];

export default function WorkSessionsTab() {
  const {
    activeSession,
    sessionTimer,
    projects,
    sessions,
    startSession,
    pauseSession,
    resumeSession,
    endSession,
    cancelSession,
    getTodayStats,
    getWeeklyStats,
  } = useProductivityStore();

  const [selectedProject, setSelectedProject] = useState('');
  const [selectedType, setSelectedType] = useState('deep-work');
  const [focusQuality, setFocusQuality] = useState(7);
  const [sessionNotes, setSessionNotes] = useState('');
  const [sessionTags, setSessionTags] = useState('');
  const [isPaused, setIsPaused] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);

  const todayStats = getTodayStats();
  const weeklyStats = getWeeklyStats();

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return `Today at ${date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday at ${date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      })}`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  };

  const handleStartSession = () => {
    if (!selectedProject) {
      alert('Please select a project');
      return;
    }
    startSession(selectedProject, selectedType);
    setSessionNotes('');
    setSessionTags('');
  };

  const handlePauseResume = () => {
    if (isPaused) {
      resumeSession();
      setIsPaused(false);
    } else {
      pauseSession();
      setIsPaused(true);
    }
  };

  const handleEndClick = () => {
    setShowEndModal(true);
  };

  const handleEndSession = () => {
    const tags = sessionTags
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t);
    endSession(focusQuality, sessionNotes, tags);
    setShowEndModal(false);
    setSessionNotes('');
    setSessionTags('');
    setFocusQuality(7);
    setIsPaused(false);
  };

  const handleCancelSession = () => {
    if (confirm('Are you sure you want to cancel this session? Time will not be saved.')) {
      cancelSession();
      setIsPaused(false);
    }
  };

  const getSessionTypeInfo = (type) => {
    return sessionTypes.find((t) => t.id === type) || sessionTypes[0];
  };

  const getFocusQualityColor = (quality) => {
    if (quality >= 8) return '#10b981';
    if (quality >= 6) return '#f59e0b';
    return '#ef4444';
  };

  const getFocusQualityLabel = (quality) => {
    if (quality >= 9) return 'Excellent';
    if (quality >= 8) return 'Great';
    if (quality >= 7) return 'Good';
    if (quality >= 6) return 'Decent';
    if (quality >= 5) return 'Fair';
    return 'Poor';
  };

  return (
    <div className="work-sessions-tab">
      {/* Stats Overview */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <Clock className="w-5 h-5" />
          </div>
          <div className="stat-content">
            <div className="stat-value">{todayStats.totalTimeFormatted}</div>
            <div className="stat-label">Today's Focus Time</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Zap className="w-5 h-5" />
          </div>
          <div className="stat-content">
            <div className="stat-value">{todayStats.avgFocusQuality || '—'}</div>
            <div className="stat-label">Avg Focus Quality</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="stat-content">
            <div className="stat-value">{todayStats.sessionsCount}</div>
            <div className="stat-label">Sessions Today</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Calendar className="w-5 h-5" />
          </div>
          <div className="stat-content">
            <div className="stat-value">{weeklyStats.totalTimeFormatted}</div>
            <div className="stat-label">This Week</div>
          </div>
        </div>
      </div>

      {/* Timer Section */}
      <div className="timer-section">
        {!activeSession ? (
          /* Start Session Form */
          <div className="start-session-form">
            <h3 className="section-title">Start a Work Session</h3>

            <div className="form-group">
              <label>Project</label>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="project-select"
              >
                <option value="">Select a project...</option>
                {projects
                  .filter((p) => p.status === 'active')
                  .map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
              </select>
            </div>

            <div className="form-group">
              <label>Session Type</label>
              <div className="session-types-grid">
                {sessionTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={`session-type-btn ${
                      selectedType === type.id ? 'active' : ''
                    }`}
                    style={{
                      borderColor:
                        selectedType === type.id ? type.color : 'rgba(255, 255, 255, 0.08)',
                    }}
                  >
                    <span className="type-emoji">{type.icon}</span>
                    <span className="type-label">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <button onClick={handleStartSession} className="start-btn">
              <Play className="w-5 h-5" />
              Start Session
            </button>
          </div>
        ) : (
          /* Active Session Timer */
          <div className="active-session">
            <div className="session-header">
              <div className="session-info">
                <span className="session-type-badge">
                  {getSessionTypeInfo(activeSession.type).icon}{' '}
                  {getSessionTypeInfo(activeSession.type).label}
                </span>
                <span className="session-project">
                  {projects.find((p) => p.id === activeSession.projectId)?.name}
                </span>
              </div>
            </div>

            <div className={`timer-display ${isPaused ? 'paused' : 'running'}`}>
              <div className="timer-value">{formatTime(sessionTimer)}</div>
              {isPaused && <div className="paused-label">Paused</div>}
            </div>

            <div className="timer-controls">
              <button
                onClick={handlePauseResume}
                className="control-btn pause-resume"
              >
                {isPaused ? (
                  <>
                    <Play className="w-5 h-5" />
                    Resume
                  </>
                ) : (
                  <>
                    <Pause className="w-5 h-5" />
                    Pause
                  </>
                )}
              </button>

              <button onClick={handleEndClick} className="control-btn end">
                <Square className="w-5 h-5" />
                End Session
              </button>

              <button onClick={handleCancelSession} className="control-btn cancel">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Recent Sessions */}
      <div className="recent-sessions">
        <h3 className="section-title">Recent Sessions</h3>

        {sessions.length === 0 ? (
          <div className="empty-state">
            <Clock className="w-12 h-12 opacity-20" />
            <p>No work sessions yet</p>
            <p className="empty-hint">Start your first session to track your work!</p>
          </div>
        ) : (
          <div className="sessions-list">
            {sessions.slice(0, 10).map((session) => {
              const project = projects.find((p) => p.id === session.projectId);
              const typeInfo = getSessionTypeInfo(session.type);

              return (
                <div key={session.id} className="session-item">
                  <div className="session-item-header">
                    <div className="session-item-type">
                      <span className="type-emoji">{typeInfo.icon}</span>
                      <span className="type-name">{typeInfo.label}</span>
                    </div>
                    <div className="session-item-time">{formatDate(session.startTime)}</div>
                  </div>

                  <div className="session-item-project">{project?.name || 'No Project'}</div>

                  <div className="session-item-footer">
                    <div className="session-duration">
                      <Clock className="w-4 h-4" />
                      {(session.duration / 3600).toFixed(1)}h
                    </div>

                    {session.focusQuality && (
                      <div
                        className="session-focus"
                        style={{
                          color: getFocusQualityColor(session.focusQuality),
                        }}
                      >
                        <Zap className="w-4 h-4" />
                        {session.focusQuality}/10 - {getFocusQualityLabel(session.focusQuality)}
                      </div>
                    )}

                    {session.tags && session.tags.length > 0 && (
                      <div className="session-tags">
                        <Tag className="w-4 h-4" />
                        {session.tags.slice(0, 2).join(', ')}
                        {session.tags.length > 2 && ` +${session.tags.length - 2}`}
                      </div>
                    )}
                  </div>

                  {session.notes && (
                    <div className="session-notes">{session.notes}</div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* End Session Modal */}
      {showEndModal && (
        <div className="modal-overlay" onClick={() => setShowEndModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">End Session</h3>

            <div className="modal-body">
              <div className="modal-session-summary">
                <div className="summary-time">{formatTime(sessionTimer)}</div>
                <div className="summary-label">Session Duration</div>
              </div>

              <div className="form-group">
                <label>Focus Quality (1-10)</label>
                <div className="focus-quality-selector">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={focusQuality}
                    onChange={(e) => setFocusQuality(parseInt(e.target.value))}
                    className="focus-slider"
                    style={{
                      background: `linear-gradient(to right, ${getFocusQualityColor(
                        focusQuality
                      )} ${focusQuality * 10}%, rgba(255, 255, 255, 0.1) ${
                        focusQuality * 10
                      }%)`,
                    }}
                  />
                  <div className="focus-value">
                    <span
                      className="focus-number"
                      style={{ color: getFocusQualityColor(focusQuality) }}
                    >
                      {focusQuality}
                    </span>
                    <span className="focus-label">
                      {getFocusQualityLabel(focusQuality)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>Session Notes (optional)</label>
                <textarea
                  value={sessionNotes}
                  onChange={(e) => setSessionNotes(e.target.value)}
                  placeholder="What did you accomplish?"
                  className="session-notes-input"
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>Tags (optional)</label>
                <input
                  type="text"
                  value={sessionTags}
                  onChange={(e) => setSessionTags(e.target.value)}
                  placeholder="frontend, react, debugging (comma-separated)"
                  className="session-tags-input"
                />
              </div>
            </div>

            <div className="modal-actions">
              <button onClick={() => setShowEndModal(false)} className="btn-secondary">
                Cancel
              </button>
              <button onClick={handleEndSession} className="btn-primary">
                Save Session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
