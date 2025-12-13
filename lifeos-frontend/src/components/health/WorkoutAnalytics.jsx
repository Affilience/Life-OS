import React, { useMemo } from 'react';
import { TrendingUp, Trophy, Dumbbell, Target } from 'lucide-react';
import AnalyticsCard from '../shared/AnalyticsCard';
import TrendLineChart from '../charts/TrendLineChart';
import ComparisonBarChart from '../charts/ComparisonBarChart';
import { useWorkoutStore } from '../../stores/workoutStore';
import './WorkoutAnalytics.css';

export default function WorkoutAnalytics() {
  const { workouts, personalRecords: storePRs } = useWorkoutStore();

  // Calculate all workout analytics from store data
  const { volumeData, exerciseProgressData, frequencyData, personalRecords, stats } = useMemo(() => {
    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();

    // Build last 7 days for volume and frequency
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      last7Days.push({
        dateStr: d.toISOString().split('T')[0],
        dayOfWeek: d.getDay()
      });
    }

    // Calculate daily volume and frequency
    const dailyData = last7Days.map(({ dateStr, dayOfWeek }) => {
      const dayWorkouts = (workouts || []).filter(w => w.date === dateStr || w.timestamp?.startsWith(dateStr));
      let volume = 0;
      dayWorkouts.forEach(w => {
        (w.exercises || []).forEach(ex => {
          (ex.sets || []).forEach(set => {
            volume += (set.weight || 0) * (set.reps || 0);
          });
        });
      });

      return {
        date: dayLabels[dayOfWeek],
        volume: Math.round(volume),
        workouts: dayWorkouts.length
      };
    });

    // Build volume data array
    const volumeArr = dailyData.map(d => ({ date: d.date, volume: d.volume }));
    const frequencyArr = dailyData.map(d => ({ date: d.date, workouts: d.workouts }));

    // Get exercise progress (find an exercise with multiple data points over weeks)
    const exerciseHistory = {};
    (workouts || []).forEach(w => {
      (w.exercises || []).forEach(ex => {
        const name = ex.name || 'Unknown';
        if (!exerciseHistory[name]) exerciseHistory[name] = [];
        (ex.sets || []).forEach(set => {
          if (set.weight) {
            exerciseHistory[name].push({
              date: w.date || w.timestamp?.split('T')[0],
              weight: set.weight
            });
          }
        });
      });
    });

    // Pick exercise with most history for progression chart
    let bestExercise = 'Bench Press';
    let maxPoints = 0;
    Object.entries(exerciseHistory).forEach(([name, data]) => {
      if (data.length > maxPoints) {
        maxPoints = data.length;
        bestExercise = name;
      }
    });

    // Build progression data (last 6 entries)
    const progressArr = (exerciseHistory[bestExercise] || [])
      .slice(-6)
      .map((entry, idx) => ({
        date: `Entry ${idx + 1}`,
        weight: entry.weight
      }));

    // Get personal records from store or compute from history
    const prs = (storePRs || []).slice(0, 4).map(pr => ({
      exercise: pr.exercise || pr.name || 'Unknown',
      weight: pr.weight || 0,
      unit: pr.unit || 'lbs',
      date: pr.date || 'N/A',
      improvement: pr.improvement || '+0'
    }));

    // Calculate stats
    const totalVolume = dailyData.reduce((sum, d) => sum + d.volume, 0);
    const workoutDays = dailyData.filter(d => d.workouts > 0).length;

    return {
      volumeData: volumeArr,
      exerciseProgressData: progressArr.length > 0 ? progressArr : [{ date: 'No data', weight: 0 }],
      frequencyData: frequencyArr,
      personalRecords: prs.length > 0 ? prs : [],
      stats: {
        totalVolume,
        workoutDays,
        bestExercise,
        maxWeight: progressArr.length > 0 ? Math.max(...progressArr.map(p => p.weight)) : 0
      }
    };
  }, [workouts, storePRs]);
  return (
    <div className="workout-analytics">
      {/* Overall Volume Trend */}
      <AnalyticsCard
        title="Training Volume Progression"
        icon={Dumbbell}
        metric={{
          value: `${stats.totalVolume.toLocaleString()} lbs`,
          change: 0
        }}
        defaultRange="7d"
      >
        <TrendLineChart
          data={volumeData}
          dataKey="volume"
          name="Volume"
          color="#10b981"
          showArea={true}
        />
      </AnalyticsCard>

      {/* Exercise-Specific Progress */}
      <AnalyticsCard
        title={`${stats.bestExercise} Progression`}
        icon={Target}
        metric={{
          value: `${stats.maxWeight} lbs`,
          change: 0
        }}
        defaultRange="30d"
      >
        <TrendLineChart
          data={exerciseProgressData}
          dataKey="weight"
          name="Weight"
          color="#10b981"
          showArea={true}
        />
      </AnalyticsCard>

      {/* Workout Frequency */}
      <AnalyticsCard
        title="Workout Frequency"
        icon={TrendingUp}
        metric={{
          value: `${stats.workoutDays} days`,
          change: 0
        }}
        defaultRange="7d"
      >
        <ComparisonBarChart
          data={frequencyData}
          dataKey="workouts"
          name="Workouts"
          color="#10b981"
        />
      </AnalyticsCard>

      {/* Personal Records Section */}
      <div className="pr-section">
        <div className="pr-header">
          <Trophy size={24} className="pr-icon" />
          <h3 className="pr-title">Personal Records</h3>
        </div>
        <div className="pr-grid">
          {personalRecords.length > 0 ? (
            personalRecords.map((pr, index) => (
              <div key={index} className="pr-card">
                <div className="pr-card-header">
                  <h4 className="pr-exercise">{pr.exercise}</h4>
                  <span className="pr-improvement">{pr.improvement}</span>
                </div>
                <div className="pr-weight">
                  {pr.weight}
                  <span className="pr-unit">{pr.unit}</span>
                </div>
                <div className="pr-date">{pr.date}</div>
              </div>
            ))
          ) : (
            <div className="text-white/50 text-sm py-4 col-span-full text-center">
              No personal records yet. Complete workouts to set PRs!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
