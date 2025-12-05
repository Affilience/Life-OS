import React from 'react';
import { useWorkoutStore } from '../../stores/workoutStore';
import { calculateWorkoutStreak, getWeeklyFrequency } from '../../services/workoutCalculations';
import {
  Dumbbell,
  Flame,
  Calendar,
  Trophy,
  Play,
  Clock,
  TrendingUp,
  Target,
  ChevronRight,
  BarChart3,
} from 'lucide-react';
import WorkoutCharts from './charts/WorkoutCharts';
import WorkoutTemplates from './WorkoutTemplates';
import { EmptyState } from '../ui';
import './WorkoutDashboard.css';

export default function WorkoutDashboard() {
  const { workouts, startWorkout } = useWorkoutStore();

  const recentWorkouts = workouts.slice(0, 5);
  const streak = calculateWorkoutStreak(workouts);
  const weeklyFrequency = getWeeklyFrequency(workouts);
  const totalPRs = workouts.reduce((sum, w) => sum + (w.prsAchieved || 0), 0);

  // Calculate total volume this month
  const thisMonth = new Date().getMonth();
  const thisYear = new Date().getFullYear();
  const monthlyWorkouts = workouts.filter(w => {
    const date = new Date(w.date);
    return date.getMonth() === thisMonth && date.getFullYear() === thisYear;
  });
  const monthlyVolume = monthlyWorkouts.reduce((sum, w) => sum + (w.totalVolume || 0), 0);

  return (
    <div className="workout-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-left">
          <div className="header-icon">
            <Dumbbell className="w-8 h-8" />
          </div>
          <div className="header-text">
            <h1 className="dashboard-title">Workout Tracker</h1>
            <p className="dashboard-subtitle">Track your strength journey and smash PRs</p>
          </div>
        </div>

        <button onClick={() => startWorkout()} className="start-workout-btn">
          <Play className="w-5 h-5" fill="currentColor" />
          Start Workout
        </button>
      </div>

      {/* Stats Overview */}
      <div className="stats-grid">
        {/* Streak Card */}
        <div className="stat-card streak">
          <div className="stat-icon">
            <Flame className="w-6 h-6" />
          </div>
          <div className="stat-content">
            <div className="stat-value">{streak}</div>
            <div className="stat-label">Day Streak</div>
            <div className="stat-progress-bar">
              <div
                className="stat-progress-fill"
                style={{ width: `${Math.min((streak / 30) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Weekly Workouts Card */}
        <div className="stat-card weekly">
          <div className="stat-icon">
            <Calendar className="w-6 h-6" />
          </div>
          <div className="stat-content">
            <div className="stat-value">{weeklyFrequency}/5</div>
            <div className="stat-label">This Week</div>
            <div className="stat-progress-bar">
              <div
                className="stat-progress-fill"
                style={{ width: `${(weeklyFrequency / 5) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Total Workouts Card */}
        <div className="stat-card total">
          <div className="stat-icon">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div className="stat-content">
            <div className="stat-value">{workouts.length}</div>
            <div className="stat-label">Total Workouts</div>
            <div className="stat-metric">
              <Target className="w-4 h-4" />
              {monthlyVolume > 0 ? `${Math.round(monthlyVolume / 1000)}k lbs` : '0 lbs'} this month
            </div>
          </div>
        </div>

        {/* PRs Card */}
        <div className="stat-card prs">
          <div className="stat-icon">
            <Trophy className="w-6 h-6" />
          </div>
          <div className="stat-content">
            <div className="stat-value">{totalPRs}</div>
            <div className="stat-label">Personal Records</div>
            <div className="stat-metric">
              <TrendingUp className="w-4 h-4" />
              {monthlyWorkouts.length} workouts this month
            </div>
          </div>
        </div>
      </div>

      {/* Workout Analytics & Charts */}
      <div className="workout-analytics-section">
        <div className="section-header">
          <div className="header-icon">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div className="header-text">
            <h2 className="section-title">Workout Analytics</h2>
            <p className="section-description">
              Track progress, volume trends, and performance metrics
            </p>
          </div>
        </div>
        <WorkoutCharts />
      </div>

      {/* Workout Templates - Create, Manage & Quick Start */}
      <WorkoutTemplates />

      {/* Recent Workouts */}
      <div className="recent-workouts-section">
        <div className="section-header">
          <h2 className="section-title">Recent Workouts</h2>
          {recentWorkouts.length > 0 && (
            <button className="view-all-btn">
              View All
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {recentWorkouts.length === 0 ? (
          <EmptyState
            type="workouts"
            title="No workouts logged yet"
            description="Start your fitness journey! Track workouts, build streaks, and watch your strength grow over time."
            actionLabel="Start Your First Workout"
            onAction={() => startWorkout()}
            variant="emerald"
            size="md"
          />
        ) : (
          <div className="workouts-list">
            {recentWorkouts.map((workout) => {
              const date = new Date(workout.date);
              const today = new Date();
              const isToday = date.toDateString() === today.toDateString();
              const yesterday = new Date(today);
              yesterday.setDate(yesterday.getDate() - 1);
              const isYesterday = date.toDateString() === yesterday.toDateString();

              let dateLabel = date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              });
              if (isToday) dateLabel = 'Today';
              else if (isYesterday) dateLabel = 'Yesterday';

              const totalSets = workout.exercises?.reduce(
                (sum, e) => sum + (e.sets?.length || 0),
                0
              ) || 0;

              return (
                <div key={workout.id} className="workout-card">
                  <div className="workout-header">
                    <div className="workout-date-badge">{dateLabel}</div>
                    {workout.prsAchieved > 0 && (
                      <div className="pr-badge">
                        <Trophy className="w-3 h-3" />
                        {workout.prsAchieved} PR{workout.prsAchieved > 1 ? 's' : ''}
                      </div>
                    )}
                  </div>

                  <h3 className="workout-name">{workout.name}</h3>

                  <div className="workout-stats">
                    <div className="workout-stat">
                      <Clock className="w-4 h-4" />
                      <span>{workout.duration} min</span>
                    </div>
                    <div className="workout-stat">
                      <Dumbbell className="w-4 h-4" />
                      <span>{workout.exercises?.length || 0} exercises</span>
                    </div>
                    <div className="workout-stat">
                      <Target className="w-4 h-4" />
                      <span>{totalSets} sets</span>
                    </div>
                    {workout.totalVolume > 0 && (
                      <div className="workout-stat">
                        <TrendingUp className="w-4 h-4" />
                        <span>{Math.round(workout.totalVolume / 1000)}k lbs</span>
                      </div>
                    )}
                  </div>

                  {workout.notes && (
                    <div className="workout-notes">
                      <p>{workout.notes}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
