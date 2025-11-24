import React, { useState } from 'react';
import { Plus, Moon, Clock, TrendingUp, Bed, Eye, BarChart3, Grid3x3 } from 'lucide-react';
import Button from '../shared/Button';
import Card from '../shared/Card';
import StatCard from '../shared/StatCard';
import ProgressBar from '../shared/ProgressBar';
import LogSleepModal from './LogSleepModal';
import SleepAnalytics from './SleepAnalytics';
import './SleepTab.css';

const SleepTab = () => {
  const [showLogModal, setShowLogModal] = useState(false);
  const [view, setView] = useState('overview'); // 'overview' or 'analytics'

  const todayStats = {
    sleepDuration: { current: 7.5, target: 8.0 },
    sleepQuality: { current: 85, target: 90 },
    bedtime: { current: '22:45', target: '22:30' },
    wakeTime: { current: '06:15', target: '06:30' }
  };

  const weeklyProgress = {
    avgSleepDuration: { current: 7.2, target: 8.0 },
    consistency: { current: 78, target: 85 },
    qualityScore: { current: 82, target: 90 }
  };

  const recentSleep = [
    {
      id: 1,
      date: '2025-10-26',
      bedtime: '22:45',
      wakeTime: '06:15',
      duration: 7.5,
      quality: 85,
      deepSleep: 1.8,
      remSleep: 1.2,
      lightSleep: 4.5,
      notes: 'Felt well-rested, good dream recall'
    },
    {
      id: 2,
      date: '2025-10-25',
      bedtime: '23:15',
      wakeTime: '06:30',
      duration: 7.25,
      quality: 78,
      deepSleep: 1.5,
      remSleep: 1.0,
      lightSleep: 4.75,
      notes: 'Took longer to fall asleep, stressed about work'
    },
    {
      id: 3,
      date: '2025-10-24',
      bedtime: '22:30',
      wakeTime: '06:00',
      duration: 7.5,
      quality: 92,
      deepSleep: 2.1,
      remSleep: 1.4,
      lightSleep: 4.0,
      notes: 'Excellent sleep, very refreshed'
    },
    {
      id: 4,
      date: '2025-10-23',
      bedtime: '23:00',
      wakeTime: '06:45',
      duration: 7.75,
      quality: 88,
      deepSleep: 1.9,
      remSleep: 1.3,
      lightSleep: 4.55,
      notes: 'Good sleep, woke up naturally'
    },
    {
      id: 5,
      date: '2025-10-22',
      bedtime: '22:15',
      wakeTime: '05:45',
      duration: 7.5,
      quality: 90,
      deepSleep: 2.0,
      remSleep: 1.5,
      lightSleep: 4.0,
      notes: 'Early workout planned, set alarm early'
    }
  ];

  const handleLogSleep = () => {
    setShowLogModal(true);
  };

  const handleSleepSubmit = (sleepData) => {
    console.log('Sleep logged:', sleepData);
    // Here you would typically send the data to your backend/state management
    // For now, we'll just log it to console
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getQualityColor = (quality) => {
    if (quality >= 90) return 'excellent';
    if (quality >= 80) return 'good';
    if (quality >= 70) return 'fair';
    return 'poor';
  };

  const getSleepStageData = (sleep) => {
    const total = sleep.deepSleep + sleep.remSleep + sleep.lightSleep;
    return {
      deep: (sleep.deepSleep / total) * 100,
      rem: (sleep.remSleep / total) * 100,
      light: (sleep.lightSleep / total) * 100
    };
  };

  return (
    <div className="sleep-tab">
      {/* Header Actions */}
      <div className="tab-header">
        <div className="view-toggle">
          <button
            className={`toggle-button ${view === 'overview' ? 'active' : ''}`}
            onClick={() => setView('overview')}
          >
            <Grid3x3 size={16} />
            Overview
          </button>
          <button
            className={`toggle-button ${view === 'analytics' ? 'active' : ''}`}
            onClick={() => setView('analytics')}
          >
            <BarChart3 size={16} />
            Analytics
          </button>
        </div>
        <Button
          variant="primary"
          icon={Plus}
          onClick={handleLogSleep}
        >
          Log Sleep
        </Button>
      </div>

      {/* Content Area - Conditional rendering based on view */}
      {view === 'overview' ? (
        <>
          {/* Today's Stats */}
          <div className="stats-section">
        <h3 className="section-title">Last Night's Sleep</h3>
        <div className="stats-grid">
          <StatCard
            icon={Clock}
            label="Duration"
            value={todayStats.sleepDuration.current}
            target={todayStats.sleepDuration.target}
            unit="hrs"
            module="health"
            showProgress={true}
          />
          <StatCard
            icon={TrendingUp}
            label="Quality Score"
            value={todayStats.sleepQuality.current}
            target={todayStats.sleepQuality.target}
            unit="%"
            module="health"
            showProgress={true}
          />
          <StatCard
            icon={Bed}
            label="Bedtime"
            value={todayStats.bedtime.current}
            module="health"
          />
          <StatCard
            icon={Eye}
            label="Wake Time"
            value={todayStats.wakeTime.current}
            module="health"
          />
        </div>
      </div>

      {/* Sleep Stages Breakdown */}
      <div className="stages-section">
        <Card title="Sleep Stages (Last Night)">
          <div className="sleep-stages">
            <div className="stages-chart">
              <div className="stage-bar">
                <div 
                  className="stage-segment deep"
                  style={{ width: `${getSleepStageData(recentSleep[0]).deep}%` }}
                ></div>
                <div 
                  className="stage-segment rem"
                  style={{ width: `${getSleepStageData(recentSleep[0]).rem}%` }}
                ></div>
                <div 
                  className="stage-segment light"
                  style={{ width: `${getSleepStageData(recentSleep[0]).light}%` }}
                ></div>
              </div>
            </div>
            
            <div className="stages-legend">
              <div className="legend-item">
                <div className="legend-color deep"></div>
                <div className="legend-info">
                  <span className="legend-name">Deep Sleep</span>
                  <span className="legend-duration">{recentSleep[0].deepSleep}h</span>
                </div>
              </div>
              
              <div className="legend-item">
                <div className="legend-color rem"></div>
                <div className="legend-info">
                  <span className="legend-name">REM Sleep</span>
                  <span className="legend-duration">{recentSleep[0].remSleep}h</span>
                </div>
              </div>
              
              <div className="legend-item">
                <div className="legend-color light"></div>
                <div className="legend-info">
                  <span className="legend-name">Light Sleep</span>
                  <span className="legend-duration">{recentSleep[0].lightSleep}h</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Weekly Overview */}
      <div className="weekly-section">
        <Card title="Weekly Overview">
          <div className="weekly-stats">
            <div className="weekly-stat">
              <div className="weekly-stat-header">
                <span className="weekly-stat-label">Average Sleep Duration</span>
                <span className="weekly-stat-value">
                  {weeklyProgress.avgSleepDuration.current} / {weeklyProgress.avgSleepDuration.target} hrs
                </span>
              </div>
              <ProgressBar 
                percentage={(weeklyProgress.avgSleepDuration.current / weeklyProgress.avgSleepDuration.target) * 100}
                module="health"
                showLabel={false}
              />
            </div>

            <div className="weekly-stat">
              <div className="weekly-stat-header">
                <span className="weekly-stat-label">Sleep Consistency</span>
                <span className="weekly-stat-value">
                  {weeklyProgress.consistency.current}%
                </span>
              </div>
              <ProgressBar 
                percentage={weeklyProgress.consistency.current}
                module="health"
                showLabel={false}
              />
            </div>

            <div className="weekly-stat">
              <div className="weekly-stat-header">
                <span className="weekly-stat-label">Average Quality Score</span>
                <span className="weekly-stat-value">
                  {weeklyProgress.qualityScore.current}%
                </span>
              </div>
              <ProgressBar 
                percentage={weeklyProgress.qualityScore.current}
                module="health"
                showLabel={false}
              />
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Sleep */}
      <div className="recent-section">
        <Card title="Recent Sleep">
          <div className="sleep-table">
            <div className="table-header">
              <div className="table-cell">Date</div>
              <div className="table-cell">Bedtime</div>
              <div className="table-cell">Wake Time</div>
              <div className="table-cell">Duration</div>
              <div className="table-cell">Quality</div>
              <div className="table-cell">Deep</div>
              <div className="table-cell">REM</div>
              <div className="table-cell">Notes</div>
            </div>
            {recentSleep.map((sleep) => (
              <div key={sleep.id} className="table-row">
                <div className="sleep-date">
                  <Moon size={16} />
                  {formatDate(sleep.date)}
                </div>

                <div className="sleep-header">
                  <div className="sleep-times">
                    <div className="sleep-time-item">
                      <div className="sleep-time-label">Bedtime</div>
                      <div className="sleep-time-value">{sleep.bedtime}</div>
                    </div>
                    <div className="sleep-time-item">
                      <div className="sleep-time-label">Wake</div>
                      <div className="sleep-time-value">{sleep.wakeTime}</div>
                    </div>
                    <div className="sleep-time-item">
                      <div className="sleep-time-label">Duration</div>
                      <div className="sleep-duration">{sleep.duration}h</div>
                    </div>
                  </div>
                  <div className={`quality-score ${getQualityColor(sleep.quality)}`}>
                    {sleep.quality}%
                  </div>
                </div>

                <div className="sleep-stages-mini">
                  <div className="sleep-stage-item sleep-deep">
                    <div className="sleep-stage-label">Deep</div>
                    <div className="sleep-stage-value">{sleep.deepSleep}h</div>
                  </div>
                  <div className="sleep-stage-item sleep-rem">
                    <div className="sleep-stage-label">REM</div>
                    <div className="sleep-stage-value">{sleep.remSleep}h</div>
                  </div>
                  <div className="sleep-stage-item sleep-light">
                    <div className="sleep-stage-label">Light</div>
                    <div className="sleep-stage-value">{sleep.lightSleep}h</div>
                  </div>
                </div>

                {sleep.notes && (
                  <div className="sleep-notes">
                    {sleep.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>
        </>
      ) : (
        <SleepAnalytics />
      )}

      {/* Log Sleep Modal */}
      <LogSleepModal
        isOpen={showLogModal}
        onClose={() => setShowLogModal(false)}
        onSubmit={handleSleepSubmit}
      />
    </div>
  );
};

export default SleepTab;