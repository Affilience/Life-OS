import React, { useState, useMemo, useEffect } from 'react';
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
import { useWorkoutStore } from '../../../stores/workoutStore';
import './WorkoutCharts.css';

// Hook to get responsive chart height
const useChartHeight = () => {
  const [height, setHeight] = useState(350);

  useEffect(() => {
    const updateHeight = () => {
      const width = window.innerWidth;
      if (width <= 480) setHeight(220);
      else if (width <= 768) setHeight(280);
      else setHeight(350);
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  return height;
};

// Custom tooltip
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="chart-tooltip">
        <p className="tooltip-label">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="tooltip-value" style={{ color: entry.color }}>
            {entry.name}: {entry.value}
            {entry.name === 'volume' && ' kg'}
            {entry.name === 'weight' && ' kg'}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function WorkoutCharts() {
  const [activeChart, setActiveChart] = useState('volume-trend');
  const chartHeight = useChartHeight();

  // Connect to store
  const { workouts } = useWorkoutStore();

  // Calculate chart data from real workouts
  const chartData = useMemo(() => {
    const today = new Date();

    // Get last 4 weeks
    const weeks = [];
    for (let w = 3; w >= 0; w--) {
      const weekStart = new Date(today);
      weekStart.setDate(weekStart.getDate() - (w * 7 + 7));
      const weekEnd = new Date(today);
      weekEnd.setDate(weekEnd.getDate() - (w * 7));
      weeks.push({ start: weekStart, end: weekEnd, label: `Week ${4 - w}` });
    }

    // Weekly volume by muscle group
    const weeklyVolumeData = weeks.map(({ start, end, label }) => {
      const weekWorkouts = (workouts || []).filter(w => {
        const wDate = new Date(w.date);
        return wDate >= start && wDate < end;
      });

      const muscleVolume = { week: label, chest: 0, back: 0, legs: 0, shoulders: 0, arms: 0 };

      weekWorkouts.forEach(workout => {
        (workout.exercises || []).forEach(ex => {
          // Handle both set arrays (new format) and flat numbers (old format)
          let volume = 0;
          if (Array.isArray(ex.sets)) {
            // New format: sets is an array of {weight, reps, completed}
            ex.sets.forEach(set => {
              if (set.completed) {
                volume += (set.weight || 0) * (set.reps || 0);
              }
            });
          } else {
            // Old format: flat numbers
            volume = (ex.sets || 0) * (ex.reps || 0) * (ex.weight || 0);
          }
          const muscle = (ex.muscleGroup || workout.type || 'other').toLowerCase();
          if (muscleVolume.hasOwnProperty(muscle)) {
            muscleVolume[muscle] += volume;
          } else if (muscle.includes('chest') || muscle.includes('push')) {
            muscleVolume.chest += volume;
          } else if (muscle.includes('back') || muscle.includes('pull')) {
            muscleVolume.back += volume;
          } else if (muscle.includes('leg') || muscle.includes('lower')) {
            muscleVolume.legs += volume;
          } else if (muscle.includes('shoulder')) {
            muscleVolume.shoulders += volume;
          } else if (muscle.includes('arm') || muscle.includes('bicep') || muscle.includes('tricep')) {
            muscleVolume.arms += volume;
          }
        });
      });

      return muscleVolume;
    });

    // Workout frequency by day of week
    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayCounts = [0, 0, 0, 0, 0, 0, 0];

    (workouts || []).forEach(w => {
      const dayOfWeek = new Date(w.date).getDay();
      dayCounts[dayOfWeek]++;
    });

    const workoutFrequencyData = dayLabels.map((day, i) => ({
      day,
      workouts: dayCounts[i]
    }));

    // Muscle group distribution (total)
    const muscleGroups = { Chest: { sets: 0, volume: 0 }, Back: { sets: 0, volume: 0 },
                          Legs: { sets: 0, volume: 0 }, Shoulders: { sets: 0, volume: 0 }, Arms: { sets: 0, volume: 0 } };

    (workouts || []).forEach(workout => {
      (workout.exercises || []).forEach(ex => {
        // Handle both set arrays (new format) and flat numbers (old format)
        let volume = 0;
        let setsCount = 0;
        if (Array.isArray(ex.sets)) {
          // New format: sets is an array of {weight, reps, completed}
          ex.sets.forEach(set => {
            if (set.completed) {
              volume += (set.weight || 0) * (set.reps || 0);
              setsCount++;
            }
          });
        } else {
          // Old format: flat numbers
          volume = (ex.sets || 0) * (ex.reps || 0) * (ex.weight || 0);
          setsCount = ex.sets || 0;
        }
        const muscle = (ex.muscleGroup || workout.type || 'other').toLowerCase();
        let targetGroup = 'Arms';
        if (muscle.includes('chest') || muscle.includes('push')) targetGroup = 'Chest';
        else if (muscle.includes('back') || muscle.includes('pull')) targetGroup = 'Back';
        else if (muscle.includes('leg') || muscle.includes('lower')) targetGroup = 'Legs';
        else if (muscle.includes('shoulder')) targetGroup = 'Shoulders';

        muscleGroups[targetGroup].sets += setsCount;
        muscleGroups[targetGroup].volume += volume;
      });
    });

    const muscleGroupData = Object.entries(muscleGroups).map(([muscle, data]) => ({
      muscle,
      sets: data.sets,
      volume: data.volume
    }));

    // PR timeline (PRs per month from workout data)
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const prByMonth = {};
    (workouts || []).forEach(w => {
      // Handle both old format (personalRecords array) and new format (prsAchieved number)
      let prCount = 0;
      if (w.personalRecords && w.personalRecords.length > 0) {
        prCount = w.personalRecords.length;
      } else if (w.prsAchieved && w.prsAchieved > 0) {
        prCount = w.prsAchieved;
      }
      if (prCount > 0) {
        const month = new Date(w.date).getMonth();
        prByMonth[month] = (prByMonth[month] || 0) + prCount;
      }
    });

    // Get last 6 months
    const prTimelineData = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today);
      d.setMonth(d.getMonth() - i);
      const monthIndex = d.getMonth();
      prTimelineData.push({
        month: monthNames[monthIndex],
        prs: prByMonth[monthIndex] || 0
      });
    }

    // Progressive Overload Data - track main lifts over time
    // Group workouts by date and find key exercises (bench, squat, deadlift)
    const progressionByExercise = {};
    const sortedWorkouts = [...(workouts || [])].sort((a, b) => new Date(a.date) - new Date(b.date));

    sortedWorkouts.forEach(workout => {
      const dateStr = new Date(workout.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      (workout.exercises || []).forEach(ex => {
        const exerciseName = (ex.name || ex.exerciseId || ex.exercise || '').toLowerCase();
        // Track main compound lifts
        if (exerciseName.includes('bench') || exerciseName.includes('squat') ||
            exerciseName.includes('deadlift') || exerciseName.includes('press')) {
          // Handle both set arrays (new format) and flat numbers (old format)
          let volume = 0;
          let maxWeight = 0;
          if (Array.isArray(ex.sets)) {
            ex.sets.forEach(set => {
              if (set.completed) {
                volume += (set.weight || 0) * (set.reps || 0);
                maxWeight = Math.max(maxWeight, set.weight || 0);
              }
            });
          } else {
            volume = (ex.sets || 0) * (ex.reps || 0) * (ex.weight || 0);
            maxWeight = ex.weight || 0;
          }

          if (!progressionByExercise[exerciseName]) {
            progressionByExercise[exerciseName] = [];
          }
          if (volume > 0 || maxWeight > 0) {
            progressionByExercise[exerciseName].push({
              date: dateStr,
              weight: maxWeight,
              volume: volume
            });
          }
        }
      });
    });

    // Use the most common exercise for progression chart (usually bench press)
    let progressionData = [];
    const exerciseNames = Object.keys(progressionByExercise);
    if (exerciseNames.length > 0) {
      // Find exercise with most data points
      const mainExercise = exerciseNames.reduce((a, b) =>
        progressionByExercise[a].length >= progressionByExercise[b].length ? a : b
      );
      progressionData = progressionByExercise[mainExercise].slice(-10); // Last 10 sessions
    }

    // Volume vs Reps scatter data - extract set-level data
    const volumeRepsData = [];
    (workouts || []).forEach(workout => {
      (workout.exercises || []).forEach(ex => {
        const exerciseName = ex.name || ex.exerciseId || ex.exercise || 'Unknown';

        if (Array.isArray(ex.sets)) {
          // New format: iterate through each set
          ex.sets.forEach(set => {
            if (set.completed && set.reps > 0 && set.weight > 0) {
              const volume = set.weight * set.reps;
              volumeRepsData.push({
                reps: set.reps,
                weight: set.weight,
                volume,
                exercise: exerciseName
              });
            }
          });
        } else {
          // Old format: flat numbers
          const reps = ex.reps || 0;
          const weight = ex.weight || 0;
          const sets = ex.sets || 1;
          const volume = sets * reps * weight;

          if (reps > 0 && volume > 0) {
            volumeRepsData.push({
              reps,
              weight,
              volume,
              exercise: exerciseName
            });
          }
        }
      });
    });

    // Stats
    const totalVolume = weeklyVolumeData.reduce((sum, week) =>
      sum + week.chest + week.back + week.legs + week.shoulders + week.arms, 0
    );
    const totalPRs = Object.values(prByMonth).reduce((sum, count) => sum + count, 0);
    const avgFrequency = (workouts || []).length > 0
      ? Math.round(((workouts || []).length / 4) * 10) / 10 // Approx workouts per week
      : 0;

    // Calculate volume increase (last week vs previous week)
    const lastWeekVolume = weeklyVolumeData[3]
      ? weeklyVolumeData[3].chest + weeklyVolumeData[3].back + weeklyVolumeData[3].legs + weeklyVolumeData[3].shoulders + weeklyVolumeData[3].arms
      : 0;
    const prevWeekVolume = weeklyVolumeData[2]
      ? weeklyVolumeData[2].chest + weeklyVolumeData[2].back + weeklyVolumeData[2].legs + weeklyVolumeData[2].shoulders + weeklyVolumeData[2].arms
      : 0;
    const volumeChange = prevWeekVolume > 0 ? Math.round(((lastWeekVolume - prevWeekVolume) / prevWeekVolume) * 100) : 0;

    return {
      weeklyVolumeData,
      workoutFrequencyData,
      muscleGroupData,
      prTimelineData,
      progressionData,
      volumeRepsData,
      stats: {
        totalVolume: Math.round(totalVolume / 1000),
        totalPRs,
        volumeChange,
        avgFrequency
      }
    };
  }, [workouts]);

  const { weeklyVolumeData, workoutFrequencyData, muscleGroupData, prTimelineData, progressionData, volumeRepsData, stats } = chartData;

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
              <p className="chart-subtitle">Weekly volume in kilograms lifted</p>
            </div>
            <div className="chart-wrapper chart-wrapper-single-axis">
              <ResponsiveContainer width="100%" height={chartHeight}>
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
          </div>
        )}

        {/* Progressive Overload Line Chart */}
        {activeChart === 'progression' && (
          <div className="chart-card">
            <div className="chart-header">
              <h3 className="chart-title">Progressive Overload - Bench Press</h3>
              <p className="chart-subtitle">Weight and volume progression over time</p>
            </div>
            <div className="chart-wrapper chart-wrapper-dual-axis">
              <ResponsiveContainer width="100%" height={chartHeight}>
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
          </div>
        )}

        {/* Workout Frequency Heatmap */}
        {activeChart === 'frequency' && (
          <div className="chart-card">
            <div className="chart-header">
              <h3 className="chart-title">Workout Frequency by Day</h3>
              <p className="chart-subtitle">Total workouts completed per weekday</p>
            </div>
            <div className="chart-wrapper chart-wrapper-single-axis">
              <ResponsiveContainer width="100%" height={chartHeight}>
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
            </div>
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
            <div className="chart-wrapper chart-wrapper-single-axis">
              <ResponsiveContainer width="100%" height={chartHeight}>
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
          </div>
        )}

        {/* Muscle Group Distribution */}
        {activeChart === 'muscle-groups' && (
          <div className="chart-card">
            <div className="chart-header">
              <h3 className="chart-title">Training Distribution</h3>
              <p className="chart-subtitle">Sets and volume per muscle group this month</p>
            </div>
            <div className="chart-wrapper chart-wrapper-single-axis">
              <ResponsiveContainer width="100%" height={chartHeight}>
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
          </div>
        )}

        {/* Volume vs Reps Scatter */}
        {activeChart === 'volume-reps' && (
          <div className="chart-card">
            <div className="chart-header">
              <h3 className="chart-title">Volume vs Rep Range Analysis</h3>
              <p className="chart-subtitle">Relationship between reps, weight, and total volume</p>
            </div>
            <div className="chart-wrapper chart-wrapper-single-axis">
              <ResponsiveContainer width="100%" height={chartHeight}>
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
                    label={{ value: 'Total Volume (kg)', angle: -90, position: 'insideLeft' }}
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
            </div>
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
            <div className="stat-value">{stats.totalVolume > 0 ? `${stats.totalVolume}k` : '-'}</div>
            <div className="stat-label">Total Volume (kg)</div>
          </div>
        </div>

        <div className="workout-stat-card">
          <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.15)' }}>
            <Trophy className="w-5 h-5" style={{ color: '#f59e0b' }} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalPRs || '-'}</div>
            <div className="stat-label">Personal Records</div>
          </div>
        </div>

        <div className="workout-stat-card">
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)' }}>
            <TrendingUp className="w-5 h-5" style={{ color: '#10b981' }} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.volumeChange !== 0 ? `${stats.volumeChange > 0 ? '+' : ''}${stats.volumeChange}%` : '-'}</div>
            <div className="stat-label">Volume Increase</div>
          </div>
        </div>

        <div className="workout-stat-card">
          <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.15)' }}>
            <Calendar className="w-5 h-5" style={{ color: '#3b82f6' }} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.avgFrequency > 0 ? `${stats.avgFrequency}/wk` : '-'}</div>
            <div className="stat-label">Avg Frequency</div>
          </div>
        </div>
      </div>
    </div>
  );
}
