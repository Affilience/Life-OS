import React, { useState, useMemo, useEffect } from 'react';
import {
  useWorkoutStore,
  CARDIO_TYPES,
  formatPace,
  formatDuration,
} from '../../stores/workoutStore';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Plus,
  Clock,
  MapPin,
  Zap,
  TrendingUp,
  TrendingDown,
  Trophy,
  Calendar,
  ChevronDown,
  Activity,
  Flame,
  Timer,
  Route,
  Target,
  BarChart3,
  X,
} from 'lucide-react';
import './CardioTab.css';

// Hook for responsive chart dimensions
const useChartDimensions = () => {
  const [dimensions, setDimensions] = useState({ height: 300, outerRadius: 100, innerRadius: 60 });

  useEffect(() => {
    const updateDimensions = () => {
      const width = window.innerWidth;
      if (width <= 480) {
        setDimensions({ height: 220, outerRadius: 70, innerRadius: 40 });
      } else if (width <= 768) {
        setDimensions({ height: 260, outerRadius: 85, innerRadius: 50 });
      } else {
        setDimensions({ height: 300, outerRadius: 100, innerRadius: 60 });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  return dimensions;
};

// Log Cardio Modal Component
function LogCardioModal({ onClose, onSave }) {
  const [activityType, setActivityType] = useState('running');
  const [distance, setDistance] = useState('');
  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('');
  const [seconds, setSeconds] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [perceivedEffort, setPerceivedEffort] = useState(5);
  const [calories, setCalories] = useState('');
  const [heartRateAvg, setHeartRateAvg] = useState('');

  const selectedType = CARDIO_TYPES[activityType];

  const totalSeconds = (parseInt(hours) || 0) * 3600 + (parseInt(minutes) || 0) * 60 + (parseInt(seconds) || 0);
  const calculatedPace = distance && totalSeconds > 0
    ? (totalSeconds / 60) / parseFloat(distance)
    : 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!distance || totalSeconds <= 0) return;

    onSave({
      activityType,
      distance: parseFloat(distance),
      durationSeconds: totalSeconds,
      date: new Date(date).toISOString(),
      notes,
      perceivedEffort,
      calories: calories ? parseInt(calories) : undefined,
      heartRateAvg: heartRateAvg ? parseInt(heartRateAvg) : undefined,
    });
  };

  return (
    <div className="cardio-modal-overlay" onClick={onClose}>
      <div className="cardio-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Log Cardio Workout</h2>
          <button onClick={onClose} className="close-btn">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="cardio-form">
          {/* Activity Type Selector */}
          <div className="form-group">
            <label>Activity Type</label>
            <div className="activity-type-grid">
              {Object.values(CARDIO_TYPES).map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setActivityType(type.id)}
                  className={`activity-type-btn ${activityType === type.id ? 'selected' : ''}`}
                  style={activityType === type.id ? { borderColor: type.color, backgroundColor: `${type.color}20` } : {}}
                >
                  <span className="activity-icon">{type.icon}</span>
                  <span className="activity-name">{type.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Date */}
          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="form-input"
            />
          </div>

          {/* Distance */}
          <div className="form-group">
            <label>Distance ({selectedType?.unit || 'miles'})</label>
            <input
              type="number"
              step="0.01"
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
              placeholder="0.00"
              className="form-input"
              required
            />
          </div>

          {/* Duration */}
          <div className="form-group">
            <label>Duration</label>
            <div className="duration-inputs">
              <div className="duration-input-group">
                <input
                  type="number"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  placeholder="0"
                  className="form-input"
                  min="0"
                />
                <span className="duration-label">hr</span>
              </div>
              <div className="duration-input-group">
                <input
                  type="number"
                  value={minutes}
                  onChange={(e) => setMinutes(e.target.value)}
                  placeholder="0"
                  className="form-input"
                  min="0"
                  max="59"
                />
                <span className="duration-label">min</span>
              </div>
              <div className="duration-input-group">
                <input
                  type="number"
                  value={seconds}
                  onChange={(e) => setSeconds(e.target.value)}
                  placeholder="0"
                  className="form-input"
                  min="0"
                  max="59"
                />
                <span className="duration-label">sec</span>
              </div>
            </div>
          </div>

          {/* Calculated Pace Preview */}
          {calculatedPace > 0 && (
            <div className="pace-preview">
              <Timer className="w-4 h-4" />
              <span>Pace: <strong>{formatPace(calculatedPace)}</strong> per {selectedType?.unit === 'miles' ? 'mile' : selectedType?.unit}</span>
            </div>
          )}

          {/* Perceived Effort (RPE) */}
          <div className="form-group">
            <label>Perceived Effort (1-10)</label>
            <div className="rpe-slider">
              <input
                type="range"
                min="1"
                max="10"
                value={perceivedEffort}
                onChange={(e) => setPerceivedEffort(parseInt(e.target.value))}
                className="rpe-input"
              />
              <div className="rpe-labels">
                <span className={perceivedEffort <= 3 ? 'active easy' : ''}>Easy</span>
                <span className={perceivedEffort > 3 && perceivedEffort <= 6 ? 'active moderate' : ''}>Moderate</span>
                <span className={perceivedEffort > 6 && perceivedEffort <= 8 ? 'active hard' : ''}>Hard</span>
                <span className={perceivedEffort > 8 ? 'active max' : ''}>Max</span>
              </div>
              <div className="rpe-value">{perceivedEffort}</div>
            </div>
          </div>

          {/* Optional Fields */}
          <div className="form-row">
            <div className="form-group">
              <label>Calories (optional)</label>
              <input
                type="number"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                placeholder="0"
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>Avg Heart Rate (optional)</label>
              <input
                type="number"
                value={heartRateAvg}
                onChange={(e) => setHeartRateAvg(e.target.value)}
                placeholder="0"
                className="form-input"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="form-group">
            <label>Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How did it feel? Weather, terrain, etc."
              className="form-textarea"
              rows="3"
            />
          </div>

          {/* Submit */}
          <button type="submit" className="submit-btn" disabled={!distance || totalSeconds <= 0}>
            <Plus className="w-5 h-5" />
            Log Workout
          </button>
        </form>
      </div>
    </div>
  );
}

// Cardio Activity Card
function CardioActivityCard({ workout, onDelete }) {
  const type = CARDIO_TYPES[workout.activityType] || CARDIO_TYPES.running;
  const date = new Date(workout.date);

  return (
    <div className="cardio-activity-card" style={{ borderColor: `${type.color}40` }}>
      <div className="activity-header">
        <div className="activity-type-badge" style={{ backgroundColor: `${type.color}20`, color: type.color }}>
          <span>{type.icon}</span>
          <span>{type.name}</span>
        </div>
        <span className="activity-date">
          {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </span>
      </div>

      <div className="activity-stats">
        <div className="stat">
          <Route className="w-4 h-4" />
          <span className="stat-value">{(workout.distance || 0).toFixed(2)}</span>
          <span className="stat-unit">{type.unit}</span>
        </div>
        <div className="stat">
          <Clock className="w-4 h-4" />
          <span className="stat-value">{formatDuration(workout.durationSeconds)}</span>
        </div>
        <div className="stat">
          <Timer className="w-4 h-4" />
          <span className="stat-value">{formatPace(workout.pace)}</span>
          <span className="stat-unit">/{type.unit === 'miles' ? 'mi' : type.unit}</span>
        </div>
      </div>

      {workout.prs?.length > 0 && (
        <div className="activity-prs">
          <Trophy className="w-4 h-4" />
          <span>
            {workout.prs.includes('fastestPace') && 'Fastest Pace'}
            {workout.prs.includes('longestDistance') && (workout.prs.includes('fastestPace') ? ', ' : '') + 'Longest Distance'}
            {workout.prs.includes('longestDuration') && (workout.prs.length > 1 ? ', ' : '') + 'Longest Duration'}
          </span>
        </div>
      )}

      {workout.notes && (
        <p className="activity-notes">{workout.notes}</p>
      )}
    </div>
  );
}

export default function CardioTab() {
  const {
    cardioWorkouts,
    cardioRecords,
    logCardioWorkout,
    getCardioStats,
    getPaceTrend,
    getDistanceTrend,
    getCardioAggregated,
  } = useWorkoutStore();

  const [showLogModal, setShowLogModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState('all');
  const [timeRange, setTimeRange] = useState(30);
  const [chartView, setChartView] = useState('pace'); // pace, distance, duration, weekly

  // Get responsive chart dimensions
  const { height: chartHeight, outerRadius, innerRadius } = useChartDimensions();

  // Get stats
  const stats = useMemo(() =>
    getCardioStats(timeRange, selectedActivity === 'all' ? null : selectedActivity),
    [timeRange, selectedActivity, cardioWorkouts]
  );

  // Get chart data
  const paceTrendData = useMemo(() => {
    if (selectedActivity === 'all') return [];
    return getPaceTrend(selectedActivity, timeRange).map(d => ({
      ...d,
      date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      paceFormatted: formatPace(d.pace),
    }));
  }, [selectedActivity, timeRange, cardioWorkouts]);

  const distanceTrendData = useMemo(() =>
    getDistanceTrend(selectedActivity === 'all' ? null : selectedActivity, timeRange).map(d => ({
      ...d,
      date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    })),
    [selectedActivity, timeRange, cardioWorkouts]
  );

  const weeklyData = useMemo(() =>
    getCardioAggregated(selectedActivity === 'all' ? null : selectedActivity, 'week').slice(-12),
    [selectedActivity, cardioWorkouts]
  );

  // Filter workouts for display
  const filteredWorkouts = useMemo(() => {
    let workouts = cardioWorkouts;
    if (selectedActivity !== 'all') {
      workouts = workouts.filter(w => w.activityType === selectedActivity);
    }
    return workouts.slice(0, 10); // Show last 10
  }, [cardioWorkouts, selectedActivity]);

  // Activity breakdown for pie chart
  const activityBreakdown = useMemo(() => {
    return stats.workoutsByType.map(item => ({
      name: CARDIO_TYPES[item.type]?.name || item.type,
      value: item.count,
      color: CARDIO_TYPES[item.type]?.color || '#6b7280',
    }));
  }, [stats]);

  const handleLogWorkout = (data) => {
    const result = logCardioWorkout(data);
    setShowLogModal(false);
    // Could show PR celebration here
  };

  const selectedType = selectedActivity !== 'all' ? CARDIO_TYPES[selectedActivity] : null;

  return (
    <div className="cardio-tab">
      {/* Header */}
      <div className="cardio-header">
        <div className="header-left">
          <h1 className="tab-title">Cardio</h1>
          <p className="tab-subtitle">Track runs, rides, swims, and more</p>
        </div>
        <button onClick={() => setShowLogModal(true)} className="log-cardio-btn">
          <Plus className="w-5 h-5" />
          Log Cardio
        </button>
      </div>

      {/* Filters */}
      <div className="cardio-filters">
        <div className="filter-group">
          <label>Activity</label>
          <select
            value={selectedActivity}
            onChange={(e) => setSelectedActivity(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Activities</option>
            {Object.values(CARDIO_TYPES).map(type => (
              <option key={type.id} value={type.id}>{type.icon} {type.name}</option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label>Time Range</label>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(parseInt(e.target.value))}
            className="filter-select"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
            <option value={365}>Last year</option>
          </select>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="cardio-stats-grid">
        <div className="stat-card primary">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)' }}>
            <Route className="w-6 h-6 text-emerald-400" />
          </div>
          <div className="stat-content">
            <span className="stat-value">{(stats.totalDistance || 0).toFixed(1)}</span>
            <span className="stat-label">Total {selectedType?.unit || 'Distance'}</span>
          </div>
        </div>

        <div className="stat-card primary">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(59, 130, 246, 0.2)' }}>
            <Clock className="w-6 h-6 text-blue-400" />
          </div>
          <div className="stat-content">
            <span className="stat-value">{formatDuration(stats.totalDuration)}</span>
            <span className="stat-label">Total Time</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(139, 92, 246, 0.2)' }}>
            <Activity className="w-5 h-5 text-purple-400" />
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats.totalSessions}</span>
            <span className="stat-label">Sessions</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(245, 158, 11, 0.2)' }}>
            <Timer className="w-5 h-5 text-amber-400" />
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats.avgPace > 0 ? formatPace(stats.avgPace) : '--:--'}</span>
            <span className="stat-label">Avg Pace</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)' }}>
            <Flame className="w-5 h-5 text-red-400" />
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats.totalCalories > 0 ? stats.totalCalories.toLocaleString() : '—'}</span>
            <span className="stat-label">Calories</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(236, 72, 153, 0.2)' }}>
            <Trophy className="w-5 h-5 text-pink-400" />
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats.prsAchieved}</span>
            <span className="stat-label">PRs</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="cardio-charts-section">
        <div className="charts-header">
          <h2 className="section-title">
            <BarChart3 className="w-5 h-5" />
            Analytics
          </h2>
          <div className="chart-tabs">
            {selectedActivity !== 'all' && (
              <button
                onClick={() => setChartView('pace')}
                className={`chart-tab ${chartView === 'pace' ? 'active' : ''}`}
              >
                Pace Trend
              </button>
            )}
            <button
              onClick={() => setChartView('distance')}
              className={`chart-tab ${chartView === 'distance' ? 'active' : ''}`}
            >
              Distance
            </button>
            <button
              onClick={() => setChartView('weekly')}
              className={`chart-tab ${chartView === 'weekly' ? 'active' : ''}`}
            >
              Weekly
            </button>
            <button
              onClick={() => setChartView('breakdown')}
              className={`chart-tab ${chartView === 'breakdown' ? 'active' : ''}`}
            >
              Breakdown
            </button>
          </div>
        </div>

        <div className="chart-container">
          {chartView === 'pace' && selectedActivity !== 'all' && paceTrendData.length > 0 && (
            <ResponsiveContainer width="100%" height={chartHeight}>
              <LineChart data={paceTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" fontSize={12} />
                <YAxis
                  stroke="rgba(255,255,255,0.5)"
                  fontSize={12}
                  tickFormatter={(v) => formatPace(v)}
                  reversed
                  domain={['dataMin - 0.5', 'dataMax + 0.5']}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1a1724', border: '1px solid rgba(255,255,255,0.1)' }}
                  formatter={(value) => [formatPace(value), 'Pace']}
                />
                <Line
                  type="monotone"
                  dataKey="pace"
                  stroke={selectedType?.color || '#10b981'}
                  strokeWidth={2}
                  dot={{ fill: selectedType?.color || '#10b981', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}

          {chartView === 'distance' && distanceTrendData.length > 0 && (
            <ResponsiveContainer width="100%" height={chartHeight}>
              <AreaChart data={distanceTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" fontSize={12} />
                <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1a1724', border: '1px solid rgba(255,255,255,0.1)' }}
                  formatter={(value) => [(value || 0).toFixed(2), 'Distance']}
                />
                <Area
                  type="monotone"
                  dataKey="distance"
                  stroke={selectedType?.color || '#3b82f6'}
                  fill={`${selectedType?.color || '#3b82f6'}40`}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}

          {chartView === 'weekly' && weeklyData.length > 0 && (
            <ResponsiveContainer width="100%" height={chartHeight}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="period" stroke="rgba(255,255,255,0.5)" fontSize={12} />
                <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1a1724', border: '1px solid rgba(255,255,255,0.1)' }}
                  formatter={(value, name) => [
                    name === 'totalDistance' ? (value || 0).toFixed(2) : value,
                    name === 'totalDistance' ? 'Distance' : 'Sessions'
                  ]}
                />
                <Bar dataKey="totalDistance" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}

          {chartView === 'breakdown' && activityBreakdown.length > 0 && (
            <div className="breakdown-chart">
              <ResponsiveContainer width="100%" height={chartHeight}>
                <PieChart>
                  <Pie
                    data={activityBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={innerRadius}
                    outerRadius={outerRadius}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {activityBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1a1724', border: '1px solid rgba(255,255,255,0.1)' }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {((chartView === 'pace' && (selectedActivity === 'all' || paceTrendData.length === 0)) ||
            (chartView === 'distance' && distanceTrendData.length === 0) ||
            (chartView === 'weekly' && weeklyData.length === 0) ||
            (chartView === 'breakdown' && activityBreakdown.length === 0)) && (
            <div className="chart-empty">
              <Activity className="w-12 h-12 text-slate-600" />
              <p>No data available for this view</p>
              <span>Log some cardio workouts to see your progress</span>
            </div>
          )}
        </div>
      </div>

      {/* Personal Records */}
      {Object.keys(cardioRecords).length > 0 && (
        <div className="cardio-records-section">
          <h2 className="section-title">
            <Trophy className="w-5 h-5 text-amber-400" />
            Personal Records
          </h2>
          <div className="records-grid">
            {Object.entries(cardioRecords).map(([type, records]) => {
              const activityType = CARDIO_TYPES[type];
              if (!activityType) return null;
              return (
                <div key={type} className="record-card" style={{ borderColor: `${activityType.color}40` }}>
                  <div className="record-header">
                    <span className="record-icon">{activityType.icon}</span>
                    <span className="record-name">{activityType.name}</span>
                  </div>
                  <div className="record-stats">
                    <div className="record-stat">
                      <span className="record-label">Longest</span>
                      <span className="record-value">{records.longestDistance?.toFixed(2) || '—'} {activityType.unit}</span>
                    </div>
                    <div className="record-stat">
                      <span className="record-label">Fastest</span>
                      <span className="record-value">{records.fastestPace ? formatPace(records.fastestPace) : '—'}/mi</span>
                    </div>
                    <div className="record-stat">
                      <span className="record-label">Total</span>
                      <span className="record-value">{records.totalDistance?.toFixed(1) || 0} {activityType.unit}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="cardio-history-section">
        <h2 className="section-title">
          <Calendar className="w-5 h-5" />
          Recent Activity
        </h2>
        {filteredWorkouts.length > 0 ? (
          <div className="activity-list">
            {filteredWorkouts.map(workout => (
              <CardioActivityCard key={workout.id} workout={workout} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <Activity className="w-16 h-16 text-slate-600" />
            <h3>No cardio workouts yet</h3>
            <p>Log your first run, ride, or swim to get started</p>
            <button onClick={() => setShowLogModal(true)} className="empty-cta">
              <Plus className="w-5 h-5" />
              Log Your First Workout
            </button>
          </div>
        )}
      </div>

      {/* Log Modal */}
      {showLogModal && (
        <LogCardioModal
          onClose={() => setShowLogModal(false)}
          onSave={handleLogWorkout}
        />
      )}
    </div>
  );
}
