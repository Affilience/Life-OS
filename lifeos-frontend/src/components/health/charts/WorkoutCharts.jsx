import React, { useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  ComposedChart,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { TrendingUp, Dumbbell, Calendar, Trophy, Target, Activity } from 'lucide-react';
import './WorkoutCharts.css';

// Generate sample workout data
const weeklyVolumeData = [
  { week: 'Week 1', chest: 12000, back: 14000, legs: 18000, shoulders: 8000, arms: 6000 },
  { week: 'Week 2', chest: 13200, back: 15000, legs: 19500, shoulders: 8800, arms: 6500 },
  { week: 'Week 3', chest: 14000, back: 15800, legs: 20000, shoulders: 9200, arms: 7000 },
  { week: 'Week 4', chest: 14500, back: 16500, legs: 21000, shoulders: 9500, arms: 7200 },
];

// Progressive overload data - bench press example
const progressionData = [
  { date: 'Jan 1', weight: 135, reps: 8, volume: 1080 },
  { date: 'Jan 8', weight: 140, reps: 8, volume: 1120 },
  { date: 'Jan 15', weight: 145, reps: 7, volume: 1015 },
  { date: 'Jan 22', weight: 145, reps: 8, volume: 1160 },
  { date: 'Jan 29', weight: 150, reps: 7, volume: 1050 },
  { date: 'Feb 5', weight: 150, reps: 8, volume: 1200 },
  { date: 'Feb 12', weight: 155, reps: 7, volume: 1085 },
  { date: 'Feb 19', weight: 155, reps: 8, volume: 1240 },
];

// Workout frequency calendar heatmap data
const workoutFrequencyData = [
  { day: 'Mon', workouts: 12 },
  { day: 'Tue', workouts: 8 },
  { day: 'Wed', workouts: 15 },
  { day: 'Thu', workouts: 6 },
  { day: 'Fri', workouts: 14 },
  { day: 'Sat', workouts: 10 },
  { day: 'Sun', workouts: 4 },
];

// Volume vs Reps scatter plot
const volumeRepsData = [
  { reps: 5, weight: 200, volume: 1000 },
  { reps: 6, weight: 185, volume: 1110 },
  { reps: 8, weight: 165, volume: 1320 },
  { reps: 10, weight: 145, volume: 1450 },
  { reps: 12, weight: 125, volume: 1500 },
  { reps: 15, weight: 105, volume: 1575 },
  { reps: 20, weight: 85, volume: 1700 },
];

// Personal records timeline
const prTimelineData = [
  { month: 'Sep', prs: 2 },
  { month: 'Oct', prs: 3 },
  { month: 'Nov', prs: 5 },
  { month: 'Dec', prs: 4 },
  { month: 'Jan', prs: 6 },
  { month: 'Feb', prs: 7 },
];

// Muscle group distribution
const muscleGroupData = [
  { muscle: 'Chest', sets: 45, volume: 14500 },
  { muscle: 'Back', sets: 52, volume: 16500 },
  { muscle: 'Legs', sets: 60, volume: 21000 },
  { muscle: 'Shoulders', sets: 35, volume: 9500 },
  { muscle: 'Arms', sets: 28, volume: 7200 },
];

// Custom tooltip
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="chart-tooltip">
        <p className="tooltip-label">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="tooltip-value" style={{ color: entry.color }}>
            {entry.name}: {entry.value}
            {entry.name === 'volume' && ' lbs'}
            {entry.name === 'weight' && ' lbs'}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function WorkoutCharts() {
  const [activeChart, setActiveChart] = useState('volume-trend');

  const charts = [
    { id: 'volume-trend', label: 'Volume Trends', icon: TrendingUp },
    { id: 'progression', label: 'Progressive Overload', icon: Dumbbell },
    { id: 'frequency', label: 'Workout Frequency', icon: Calendar },
    { id: 'pr-timeline', label: 'PR Timeline', icon: Trophy },
    { id: 'muscle-groups', label: 'Muscle Groups', icon: Target },
    { id: 'volume-reps', label: 'Volume Analysis', icon: Activity },
  ];

  // Get color based on workout frequency
  const getFrequencyColor = (workouts) => {
    if (workouts >= 12) return '#10b981';
    if (workouts >= 8) return '#3b82f6';
    if (workouts >= 4) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="workout-charts-container">
      {/* Chart Selector */}
      <div className="chart-selector">
        {charts.map(chart => {
          const Icon = chart.icon;
          return (
            <button
              key={chart.id}
              onClick={() => setActiveChart(chart.id)}
              className={`chart-selector-btn ${activeChart === chart.id ? 'active' : ''}`}
            >
              <Icon className="w-4 h-4" />
              {chart.label}
            </button>
          );
        })}
      </div>

      {/* Charts */}
      <div className="charts-display">
        {/* Weekly Volume Stacked Bar */}
        {activeChart === 'volume-trend' && (
          <div className="chart-card">
            <div className="chart-header">
              <h3 className="chart-title">Training Volume by Muscle Group</h3>
              <p className="chart-subtitle">Weekly volume in pounds lifted</p>
            </div>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={weeklyVolumeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="week" stroke="rgba(255,255,255,0.6)" />
                <YAxis stroke="rgba(255,255,255,0.6)" />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ color: 'rgba(255,255,255,0.7)' }} />
                <Bar dataKey="chest" stackId="a" fill="#8b5cf6" radius={[0, 0, 0, 0]} />
                <Bar dataKey="back" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} />
                <Bar dataKey="legs" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
                <Bar dataKey="shoulders" stackId="a" fill="#f59e0b" radius={[0, 0, 0, 0]} />
                <Bar dataKey="arms" stackId="a" fill="#ef4444" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Progressive Overload Line Chart */}
        {activeChart === 'progression' && (
          <div className="chart-card">
            <div className="chart-header">
              <h3 className="chart-title">Progressive Overload - Bench Press</h3>
              <p className="chart-subtitle">Weight and volume progression over time</p>
            </div>
            <ResponsiveContainer width="100%" height={350}>
              <ComposedChart data={progressionData}>
                <defs>
                  <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="date" stroke="rgba(255,255,255,0.6)" />
                <YAxis yAxisId="left" stroke="rgba(255,255,255,0.6)" />
                <YAxis yAxisId="right" orientation="right" stroke="rgba(255,255,255,0.6)" />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ color: 'rgba(255,255,255,0.7)' }} />
                <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey="volume"
                  fill="url(#volumeGradient)"
                  stroke="#3b82f6"
                  strokeWidth={2}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="weight"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  dot={{ r: 6, fill: '#8b5cf6' }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Workout Frequency Heatmap */}
        {activeChart === 'frequency' && (
          <div className="chart-card">
            <div className="chart-header">
              <h3 className="chart-title">Workout Frequency by Day</h3>
              <p className="chart-subtitle">Total workouts completed per weekday</p>
            </div>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={workoutFrequencyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="day" stroke="rgba(255,255,255,0.6)" />
                <YAxis stroke="rgba(255,255,255,0.6)" />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="workouts" radius={[8, 8, 0, 0]}>
                  {workoutFrequencyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getFrequencyColor(entry.workouts)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="frequency-legend">
              <div className="frequency-legend-item">
                <div className="frequency-color" style={{ background: '#10b981' }} />
                <span>High (12+)</span>
              </div>
              <div className="frequency-legend-item">
                <div className="frequency-color" style={{ background: '#3b82f6' }} />
                <span>Medium (8-11)</span>
              </div>
              <div className="frequency-legend-item">
                <div className="frequency-color" style={{ background: '#f59e0b' }} />
                <span>Low (4-7)</span>
              </div>
              <div className="frequency-legend-item">
                <div className="frequency-color" style={{ background: '#ef4444' }} />
                <span>Very Low (&lt;4)</span>
              </div>
            </div>
          </div>
        )}

        {/* PR Timeline */}
        {activeChart === 'pr-timeline' && (
          <div className="chart-card">
            <div className="chart-header">
              <h3 className="chart-title">Personal Records Timeline</h3>
              <p className="chart-subtitle">New PRs achieved per month</p>
            </div>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={prTimelineData}>
                <defs>
                  <linearGradient id="prGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="month" stroke="rgba(255,255,255,0.6)" />
                <YAxis stroke="rgba(255,255,255,0.6)" />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="prs"
                  stroke="#f59e0b"
                  strokeWidth={3}
                  fill="url(#prGradient)"
                  dot={{ r: 8, fill: '#f59e0b', strokeWidth: 2, stroke: '#fff' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Muscle Group Distribution */}
        {activeChart === 'muscle-groups' && (
          <div className="chart-card">
            <div className="chart-header">
              <h3 className="chart-title">Training Distribution</h3>
              <p className="chart-subtitle">Sets and volume per muscle group this month</p>
            </div>
            <ResponsiveContainer width="100%" height={350}>
              <ComposedChart data={muscleGroupData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis type="number" stroke="rgba(255,255,255,0.6)" />
                <YAxis dataKey="muscle" type="category" stroke="rgba(255,255,255,0.6)" />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ color: 'rgba(255,255,255,0.7)' }} />
                <Bar dataKey="sets" fill="#8b5cf6" radius={[0, 8, 8, 0]} />
                <Line dataKey="volume" stroke="#10b981" strokeWidth={3} dot={{ r: 6 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Volume vs Reps Scatter */}
        {activeChart === 'volume-reps' && (
          <div className="chart-card">
            <div className="chart-header">
              <h3 className="chart-title">Volume vs Rep Range Analysis</h3>
              <p className="chart-subtitle">Relationship between reps, weight, and total volume</p>
            </div>
            <ResponsiveContainer width="100%" height={350}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis
                  dataKey="reps"
                  type="number"
                  name="Reps"
                  stroke="rgba(255,255,255,0.6)"
                  label={{ value: 'Reps per Set', position: 'insideBottom', offset: -5 }}
                />
                <YAxis
                  dataKey="volume"
                  type="number"
                  name="Volume"
                  stroke="rgba(255,255,255,0.6)"
                  label={{ value: 'Total Volume (lbs)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
                <Scatter name="Volume Distribution" data={volumeRepsData} fill="#8b5cf6">
                  {volumeRepsData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.reps <= 6 ? '#ef4444' : entry.reps <= 12 ? '#8b5cf6' : '#3b82f6'}
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
            <div className="rep-range-legend">
              <div className="rep-range-item">
                <div className="rep-range-color" style={{ background: '#ef4444' }} />
                <span>Strength (1-6 reps)</span>
              </div>
              <div className="rep-range-item">
                <div className="rep-range-color" style={{ background: '#8b5cf6' }} />
                <span>Hypertrophy (7-12 reps)</span>
              </div>
              <div className="rep-range-item">
                <div className="rep-range-color" style={{ background: '#3b82f6' }} />
                <span>Endurance (13+ reps)</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Workout Stats Summary */}
      <div className="workout-stats-grid">
        <div className="workout-stat-card">
          <div className="stat-icon" style={{ background: 'rgba(139, 92, 246, 0.15)' }}>
            <Dumbbell className="w-5 h-5" style={{ color: '#8b5cf6' }} />
          </div>
          <div className="stat-content">
            <div className="stat-value">68.5k</div>
            <div className="stat-label">Total Volume (lbs)</div>
          </div>
        </div>

        <div className="workout-stat-card">
          <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.15)' }}>
            <Trophy className="w-5 h-5" style={{ color: '#f59e0b' }} />
          </div>
          <div className="stat-content">
            <div className="stat-value">27</div>
            <div className="stat-label">Personal Records</div>
          </div>
        </div>

        <div className="workout-stat-card">
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)' }}>
            <TrendingUp className="w-5 h-5" style={{ color: '#10b981' }} />
          </div>
          <div className="stat-content">
            <div className="stat-value">+12%</div>
            <div className="stat-label">Volume Increase</div>
          </div>
        </div>

        <div className="workout-stat-card">
          <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.15)' }}>
            <Calendar className="w-5 h-5" style={{ color: '#3b82f6' }} />
          </div>
          <div className="stat-content">
            <div className="stat-value">4.5/wk</div>
            <div className="stat-label">Avg Frequency</div>
          </div>
        </div>
      </div>
    </div>
  );
}
