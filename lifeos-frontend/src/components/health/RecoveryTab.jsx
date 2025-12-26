import React, { useState } from 'react';
import { Plus, Heart, TrendingUp, Activity, Battery, Thermometer } from 'lucide-react';
import Button from '../shared/Button';
import Card from '../shared/Card';
import StatCard from '../shared/StatCard';
import ProgressBar from '../shared/ProgressBar';
import LogRecoveryModal from './LogRecoveryModal';
import './RecoveryTab.css';

const RecoveryTab = () => {
  const [showLogModal, setShowLogModal] = useState(false);

  const todayStats = {
    recoveryScore: { current: 78, target: 85 },
    heartRateVariability: { current: 42, target: 50 },
    restingHeartRate: { current: 58, target: 55 },
    stressLevel: { current: 35, target: 30 }
  };

  const weeklyProgress = {
    avgRecoveryScore: { current: 75, target: 80 },
    consistentSleep: { current: 6, target: 7 },
    activeRecovery: { current: 3, target: 4 }
  };

  const recoveryTrends = [
    {
      date: '2025-10-26',
      recoveryScore: 78,
      hrv: 42,
      rhr: 58,
      stress: 35,
      sleep: 7.5,
      workoutLoad: 'moderate'
    },
    {
      date: '2025-10-25',
      recoveryScore: 72,
      hrv: 38,
      rhr: 62,
      stress: 45,
      sleep: 7.25,
      workoutLoad: 'high'
    },
    {
      date: '2025-10-24',
      recoveryScore: 85,
      hrv: 48,
      rhr: 56,
      stress: 25,
      sleep: 7.5,
      workoutLoad: 'low'
    },
    {
      date: '2025-10-23',
      recoveryScore: 82,
      hrv: 45,
      rhr: 57,
      stress: 28,
      sleep: 7.75,
      workoutLoad: 'moderate'
    },
    {
      date: '2025-10-22',
      recoveryScore: 79,
      hrv: 43,
      rhr: 59,
      stress: 32,
      sleep: 7.5,
      workoutLoad: 'moderate'
    }
  ];

  const recoveryRecommendations = [
    {
      id: 1,
      type: 'sleep',
      priority: 'high',
      title: 'Prioritise Sleep Quality',
      description: 'Your HRV is below optimal. Focus on getting 8+ hours of quality sleep tonight.',
      icon: '😴',
      action: 'Set bedtime reminder for 10:30 PM'
    },
    {
      id: 2,
      type: 'stress',
      priority: 'medium',
      title: 'Stress Management',
      description: 'Stress levels are elevated. Consider meditation or breathing exercises.',
      icon: '🧘‍♂️',
      action: 'Try 10-minute guided meditation'
    },
    {
      id: 3,
      type: 'activity',
      priority: 'low',
      title: 'Active Recovery',
      description: 'Light movement can boost recovery. Consider gentle yoga or walking.',
      icon: '🚶‍♂️',
      action: 'Schedule 20-minute walk'
    },
    {
      id: 4,
      type: 'nutrition',
      priority: 'medium',
      title: 'Recovery Nutrition',
      description: 'Ensure adequate protein and hydration for muscle recovery.',
      icon: '🥗',
      action: 'Track protein intake today'
    }
  ];

  const handleLogRecovery = () => {
    setShowLogModal(true);
  };

  const handleRecoverySubmit = (recoveryData) => {
    console.log('Recovery logged:', recoveryData);
    // Here you would typically send the data to your backend/state management
    // For now, we'll just log it to console
  };

  const getRecoveryColor = (score) => {
    if (score >= 85) return 'excellent';
    if (score >= 75) return 'good';
    if (score >= 65) return 'fair';
    return 'poor';
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'priority-high';
      case 'medium': return 'priority-medium';
      case 'low': return 'priority-low';
      default: return 'priority-medium';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="recovery-tab">
      {/* Header Actions */}
      <div className="tab-header">
        <Button 
          variant="primary" 
          icon={Plus} 
          onClick={handleLogRecovery}
        >
          Log Recovery
        </Button>
      </div>

      {/* Today's Recovery Stats */}
      <div className="stats-section">
        <h3 className="section-title">Today's Recovery</h3>
        <div className="stats-grid">
          <StatCard
            icon={Battery}
            label="Recovery Score"
            value={todayStats.recoveryScore.current}
            target={todayStats.recoveryScore.target}
            unit="%"
            module="health"
            showProgress={true}
          />
          <StatCard
            icon={Activity}
            label="HRV"
            value={todayStats.heartRateVariability.current}
            target={todayStats.heartRateVariability.target}
            unit="ms"
            module="health"
            showProgress={true}
          />
          <StatCard
            icon={Heart}
            label="Resting HR"
            value={todayStats.restingHeartRate.current}
            target={todayStats.restingHeartRate.target}
            unit="bpm"
            module="health"
            showProgress={true}
          />
          <StatCard
            icon={Thermometer}
            label="Stress Level"
            value={todayStats.stressLevel.current}
            target={todayStats.stressLevel.target}
            unit="%"
            module="health"
            showProgress={true}
            inverse={true}
          />
        </div>
      </div>

      {/* Recovery Score Gauge */}
      <div className="gauge-section">
        <Card title="Recovery Score">
          <div className="recovery-gauge">
            <div className="gauge-container">
              <svg width="200" height="120" viewBox="0 0 200 120">
                <path
                  d="M 20 100 A 80 80 0 0 1 180 100"
                  fill="none"
                  stroke="var(--color-border-muted)"
                  strokeWidth="20"
                  strokeLinecap="round"
                />
                <path
                  d={`M 20 100 A 80 80 0 0 1 ${20 + (160 * todayStats.recoveryScore.current / 100)} ${100 - (80 * Math.sin(Math.PI * todayStats.recoveryScore.current / 100))}`}
                  fill="none"
                  stroke="var(--color-health-500)"
                  strokeWidth="20"
                  strokeLinecap="round"
                />
              </svg>
              <div className="gauge-center">
                <div className="gauge-value">{todayStats.recoveryScore.current}</div>
                <div className="gauge-label">Recovery Score</div>
              </div>
            </div>
            <div className={`recovery-status ${getRecoveryColor(todayStats.recoveryScore.current)}`}>
              {todayStats.recoveryScore.current >= 85 ? 'Excellent' :
               todayStats.recoveryScore.current >= 75 ? 'Good' :
               todayStats.recoveryScore.current >= 65 ? 'Fair' : 'Poor'}
            </div>
          </div>
        </Card>
      </div>

      {/* Weekly Overview */}
      <div className="weekly-section">
        <Card title="Weekly Recovery Trends">
          <div className="weekly-stats">
            <div className="weekly-stat">
              <div className="weekly-stat-header">
                <span className="weekly-stat-label">Average Recovery Score</span>
                <span className="weekly-stat-value">
                  {weeklyProgress.avgRecoveryScore.current}%
                </span>
              </div>
              <ProgressBar 
                percentage={weeklyProgress.avgRecoveryScore.current}
                module="health"
                showLabel={false}
              />
            </div>

            <div className="weekly-stat">
              <div className="weekly-stat-header">
                <span className="weekly-stat-label">Consistent Sleep Days</span>
                <span className="weekly-stat-value">
                  {weeklyProgress.consistentSleep.current}/{weeklyProgress.consistentSleep.target} days
                </span>
              </div>
              <ProgressBar 
                percentage={(weeklyProgress.consistentSleep.current / weeklyProgress.consistentSleep.target) * 100}
                module="health"
                showLabel={false}
              />
            </div>

            <div className="weekly-stat">
              <div className="weekly-stat-header">
                <span className="weekly-stat-label">Active Recovery Sessions</span>
                <span className="weekly-stat-value">
                  {weeklyProgress.activeRecovery.current}/{weeklyProgress.activeRecovery.target}
                </span>
              </div>
              <ProgressBar 
                percentage={(weeklyProgress.activeRecovery.current / weeklyProgress.activeRecovery.target) * 100}
                module="health"
                showLabel={false}
              />
            </div>
          </div>
        </Card>
      </div>

      {/* Recovery Recommendations */}
      <div className="recommendations-section">
        <Card title="Recovery Recommendations">
          <div className="recommendations-list">
            {recoveryRecommendations.map((rec) => (
              <div key={rec.id} className={`recommendation-item ${getPriorityColor(rec.priority)}`}>
                <div className="recommendation-header">
                  <div className="recommendation-icon">
                    {rec.icon}
                  </div>
                  <div className="recommendation-info">
                    <h4 className="recommendation-title">{rec.title}</h4>
                    <p className="recommendation-description">{rec.description}</p>
                  </div>
                  <div className={`priority-badge ${getPriorityColor(rec.priority)}`}>
                    {rec.priority}
                  </div>
                </div>
                <div className="recommendation-action">
                  <Button variant="ghost" size="small">
                    {rec.action}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent Trends */}
      <div className="trends-section">
        <Card title="Recent Recovery Trends">
          <div className="trends-table">
            <div className="table-header">
              <div className="table-cell">Date</div>
              <div className="table-cell">Score</div>
              <div className="table-cell">HRV</div>
              <div className="table-cell">RHR</div>
              <div className="table-cell">Stress</div>
              <div className="table-cell">Sleep</div>
              <div className="table-cell">Load</div>
            </div>
            {recoveryTrends.map((trend, index) => (
              <div key={index} className="table-row">
                <div className="trend-date">
                  {formatDate(trend.date)}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                  <div className={`score-badge ${getRecoveryColor(trend.recoveryScore)}`}>
                    {trend.recoveryScore}%
                  </div>
                  <span className={`load-badge ${trend.workoutLoad}`}>
                    {trend.workoutLoad}
                  </span>
                </div>

                <div className="recovery-metrics">
                  <div className="recovery-metric-item">
                    <div className="recovery-metric-label">HRV</div>
                    <div className="recovery-metric-value">{trend.hrv}ms</div>
                  </div>
                  <div className="recovery-metric-item">
                    <div className="recovery-metric-label">RHR</div>
                    <div className="recovery-metric-value">{trend.rhr}bpm</div>
                  </div>
                  <div className="recovery-metric-item">
                    <div className="recovery-metric-label">Stress</div>
                    <div className="recovery-metric-value">{trend.stress}%</div>
                  </div>
                  <div className="recovery-metric-item">
                    <div className="recovery-metric-label">Sleep</div>
                    <div className="recovery-metric-value">{trend.sleep}h</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Log Recovery Modal */}
      <LogRecoveryModal
        isOpen={showLogModal}
        onClose={() => setShowLogModal(false)}
        onSubmit={handleRecoverySubmit}
      />
    </div>
  );
};

export default RecoveryTab;