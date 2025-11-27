import React from 'react';
import { Trophy, TrendingUp, Target, Zap } from 'lucide-react';
import './PRBadge.css';

// Calculate estimated 1RM using Brzycki formula
const calculate1RM = (weight, reps) => {
  if (reps === 1) return weight;
  if (reps > 12) return Math.round(weight * (1 + reps / 30));
  return Math.round(weight * (36 / (37 - reps)));
};

export default function PRBadge({ exercise, weight, reps, previousPR, xpEarned = 25 }) {
  const estimated1RM = calculate1RM(weight, reps);
  const improvement = previousPR ? {
    weight: weight - previousPR.weight,
    reps: reps - previousPR.reps,
  } : null;

  return (
    <div className="pr-badge-overlay">
      <div className="pr-badge-card">
        {/* Sparkle Background */}
        <div className="pr-sparkle-bg" />

        {/* Confetti Elements */}
        {[...Array(12)].map((_, i) => (
          <div key={i} className="pr-confetti" />
        ))}

        {/* Trophy Icon */}
        <div className="pr-trophy-icon">
          <Trophy className="w-20 h-20" style={{ color: '#fff', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))' }} />
        </div>

        {/* Title */}
        <h2 className="pr-title">🏆 New PR! 🏆</h2>

        {/* Exercise Name */}
        <h3 className="pr-exercise-name">{exercise}</h3>

        {/* PR Details */}
        <p className="pr-details">
          <span className="pr-details-highlight">{weight} lbs</span>
          ×
          <span className="pr-details-highlight">{reps} reps</span>
        </p>

        {/* Improvement from previous PR */}
        {improvement && (improvement.weight > 0 || improvement.reps > 0) && (
          <div className="pr-improvement">
            <TrendingUp className="w-4 h-4" />
            <span>
              {improvement.weight > 0 && `+${improvement.weight} lbs`}
              {improvement.weight > 0 && improvement.reps > 0 && ', '}
              {improvement.reps > 0 && `+${improvement.reps} reps`}
              {' '}from previous
            </span>
          </div>
        )}

        {/* Stats row */}
        <div className="pr-stats-row">
          <div className="pr-stat">
            <Target className="w-4 h-4" />
            <span className="pr-stat-label">Est. 1RM</span>
            <span className="pr-stat-value">{estimated1RM} lbs</span>
          </div>
          <div className="pr-stat">
            <Zap className="w-4 h-4" />
            <span className="pr-stat-label">XP Earned</span>
            <span className="pr-stat-value">+{xpEarned} XP</span>
          </div>
        </div>

        {/* Subtitle */}
        <p className="pr-subtitle">You're getting stronger! 💪</p>
      </div>
    </div>
  );
}
