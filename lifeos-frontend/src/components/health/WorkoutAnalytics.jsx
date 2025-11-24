import React from 'react';
import { TrendingUp, Trophy, Dumbbell, Target } from 'lucide-react';
import AnalyticsCard from '../shared/AnalyticsCard';
import TrendLineChart from '../charts/TrendLineChart';
import ComparisonBarChart from '../charts/ComparisonBarChart';
import './WorkoutAnalytics.css';

// Mock data - would come from API in production
const volumeData = [
  { date: 'Mon', volume: 12500 },
  { date: 'Tue', volume: 8000 },
  { date: 'Wed', volume: 15000 },
  { date: 'Thu', volume: 0 },
  { date: 'Fri', volume: 13500 },
  { date: 'Sat', volume: 18000 },
  { date: 'Sun', volume: 10000 }
];

const benchPressData = [
  { date: 'Week 1', weight: 185 },
  { date: 'Week 2', weight: 190 },
  { date: 'Week 3', weight: 195 },
  { date: 'Week 4', weight: 200 },
  { date: 'Week 5', weight: 205 },
  { date: 'Week 6', weight: 210 }
];

const workoutFrequencyData = [
  { date: 'Mon', workouts: 1 },
  { date: 'Tue', workouts: 0 },
  { date: 'Wed', workouts: 1 },
  { date: 'Thu', workouts: 1 },
  { date: 'Fri', workouts: 0 },
  { date: 'Sat', workouts: 1 },
  { date: 'Sun', workouts: 1 }
];

const personalRecords = [
  { exercise: 'Bench Press', weight: 225, unit: 'lbs', date: '2025-10-15', improvement: '+15' },
  { exercise: 'Squat', weight: 315, unit: 'lbs', date: '2025-10-20', improvement: '+20' },
  { exercise: 'Deadlift', weight: 405, unit: 'lbs', date: '2025-10-22', improvement: '+25' },
  { exercise: 'Overhead Press', weight: 145, unit: 'lbs', date: '2025-10-18', improvement: '+10' }
];

export default function WorkoutAnalytics() {
  return (
    <div className="workout-analytics">
      {/* Overall Volume Trend */}
      <AnalyticsCard
        title="Training Volume Progression"
        icon={Dumbbell}
        metric={{
          value: '77,000 lbs',
          change: 12.5
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
        title="Bench Press 1RM Progression"
        icon={Target}
        metric={{
          value: '210 lbs',
          change: 8.3
        }}
        defaultRange="30d"
      >
        <TrendLineChart
          data={benchPressData}
          dataKey="weight"
          name="1RM"
          color="#10b981"
          goal={225}
          showArea={true}
        />
      </AnalyticsCard>

      {/* Workout Frequency */}
      <AnalyticsCard
        title="Workout Frequency"
        icon={TrendingUp}
        metric={{
          value: '5 days',
          change: 25
        }}
        defaultRange="7d"
      >
        <ComparisonBarChart
          data={workoutFrequencyData}
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
          {personalRecords.map((pr, index) => (
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
          ))}
        </div>
      </div>
    </div>
  );
}
