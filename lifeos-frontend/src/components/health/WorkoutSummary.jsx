import React from 'react';
import {
  Trophy,
  Clock,
  Dumbbell,
  Flame,
  TrendingUp,
  Zap,
  Star,
  ChevronRight,
  Share2
} from 'lucide-react';
import './WorkoutSummary.css';

// Calculate estimated 1RM using Brzycki formula
const calculate1RM = (weight, reps) => {
  if (reps === 1) return weight;
  if (reps > 12) return Math.round(weight * (1 + reps / 30));
  return Math.round(weight * (36 / (37 - reps)));
};

export default function WorkoutSummary({ workout, onClose, onShare }) {
  if (!workout) return null;

  const {
    name,
    duration,
    totalVolume,
    prsAchieved,
    exercises,
  } = workout;

  // Calculate stats
  const totalSets = exercises.reduce((sum, ex) => sum + ex.sets.filter(s => s.completed).length, 0);
  const totalReps = exercises.reduce((sum, ex) =>
    sum + ex.sets.reduce((setSum, s) => setSum + (s.completed ? s.reps : 0), 0), 0
  );

  // Find best set (highest estimated 1RM)
  let bestSet = null;
  let bestExercise = null;
  let best1RM = 0;

  exercises.forEach(ex => {
    ex.sets.forEach(set => {
      if (set.completed && set.weight > 0) {
        const est1RM = calculate1RM(set.weight, set.reps);
        if (est1RM > best1RM) {
          best1RM = est1RM;
          bestSet = set;
          bestExercise = ex;
        }
      }
    });
  });

  // Get PR sets
  const prSets = exercises.flatMap(ex =>
    ex.sets.filter(s => s.isPR).map(s => ({ ...s, exerciseId: ex.exerciseId }))
  );

  // Calculate XP earned (same logic as store)
  const xpBase = 20;
  const xpSets = totalSets * 2;
  const xpPRs = prsAchieved * 10;
  const xpDuration = Math.floor(duration / 5);
  const totalXP = xpBase + xpSets + xpPRs + xpDuration;

  // Format duration
  const formatDuration = (mins) => {
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return `${hours}h ${remainingMins}m`;
  };

  return (
    <div className="workout-summary-overlay" onClick={onClose}>
      <div className="workout-summary-modal" onClick={e => e.stopPropagation()}>
        {/* Confetti/Celebration background */}
        <div className="summary-celebration-bg">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="celebration-particle" />
          ))}
        </div>

        {/* Header */}
        <div className="summary-header">
          <div className="summary-trophy">
            <Trophy className="w-12 h-12" />
          </div>
          <h2 className="summary-title">Workout Complete!</h2>
          <p className="summary-workout-name">{name}</p>
        </div>

        {/* Main Stats Grid */}
        <div className="summary-stats-grid">
          <div className="summary-stat-card primary">
            <Clock className="w-6 h-6" />
            <div className="stat-content">
              <span className="stat-value">{formatDuration(duration)}</span>
              <span className="stat-label">Duration</span>
            </div>
          </div>

          <div className="summary-stat-card primary">
            <Dumbbell className="w-6 h-6" />
            <div className="stat-content">
              <span className="stat-value">{totalVolume.toLocaleString()}</span>
              <span className="stat-label">Total Volume (lbs)</span>
            </div>
          </div>

          <div className="summary-stat-card">
            <Flame className="w-5 h-5" />
            <div className="stat-content">
              <span className="stat-value">{totalSets}</span>
              <span className="stat-label">Sets</span>
            </div>
          </div>

          <div className="summary-stat-card">
            <TrendingUp className="w-5 h-5" />
            <div className="stat-content">
              <span className="stat-value">{totalReps}</span>
              <span className="stat-label">Reps</span>
            </div>
          </div>

          <div className="summary-stat-card">
            <Zap className="w-5 h-5" />
            <div className="stat-content">
              <span className="stat-value">{exercises.length}</span>
              <span className="stat-label">Exercises</span>
            </div>
          </div>

          {prsAchieved > 0 && (
            <div className="summary-stat-card pr-card">
              <Star className="w-5 h-5" />
              <div className="stat-content">
                <span className="stat-value">{prsAchieved}</span>
                <span className="stat-label">New PRs!</span>
              </div>
            </div>
          )}
        </div>

        {/* XP Earned Section */}
        <div className="summary-xp-section">
          <div className="xp-header">
            <Zap className="w-5 h-5" />
            <span>XP Earned</span>
          </div>
          <div className="xp-breakdown">
            <div className="xp-item">
              <span>Workout completed</span>
              <span>+{xpBase} XP</span>
            </div>
            <div className="xp-item">
              <span>{totalSets} sets × 2 XP</span>
              <span>+{xpSets} XP</span>
            </div>
            {prsAchieved > 0 && (
              <div className="xp-item highlight">
                <span>{prsAchieved} PRs × 10 XP</span>
                <span>+{xpPRs} XP</span>
              </div>
            )}
            <div className="xp-item">
              <span>Duration bonus</span>
              <span>+{xpDuration} XP</span>
            </div>
            <div className="xp-total">
              <span>Total</span>
              <span>+{totalXP} XP</span>
            </div>
          </div>
        </div>

        {/* PRs Achieved */}
        {prSets.length > 0 && (
          <div className="summary-prs-section">
            <h3 className="prs-title">
              <Trophy className="w-5 h-5" />
              Personal Records
            </h3>
            <div className="prs-list">
              {exercises.map(ex => {
                const prSet = ex.sets.find(s => s.isPR);
                if (!prSet) return null;
                return (
                  <div key={ex.exerciseId} className="pr-item">
                    <span className="pr-exercise">{ex.exerciseId}</span>
                    <span className="pr-weight">{prSet.weight} lbs × {prSet.reps}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="summary-actions">
          {onShare && (
            <button onClick={onShare} className="summary-btn secondary">
              <Share2 className="w-4 h-4" />
              Share
            </button>
          )}
          <button onClick={onClose} className="summary-btn primary">
            Done
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
