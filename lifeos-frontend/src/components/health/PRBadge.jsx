import React from 'react';
import { Trophy } from 'lucide-react';
import './PRBadge.css';

export default function PRBadge({ exercise, weight, reps }) {
  return (
    <div className="pr-badge-overlay">
      <div className="pr-badge-card">
        {/* Sparkle Background */}
        <div className="pr-sparkle-bg" />

        {/* Confetti Elements */}
        {[...Array(9)].map((_, i) => (
          <div key={i} className="pr-confetti" />
        ))}

        {/* Trophy Icon */}
        <div className="pr-trophy-icon">
          <Trophy className="w-20 h-20" style={{ color: '#fff', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))' }} />
        </div>

        {/* Title */}
        <h2 className="pr-title">New Personal Record!</h2>

        {/* Exercise Name */}
        <h3 className="pr-exercise-name">{exercise}</h3>

        {/* PR Details */}
        <p className="pr-details">
          <span className="pr-details-highlight">{weight} lbs</span>
          ×
          <span className="pr-details-highlight">{reps} reps</span>
        </p>

        {/* Subtitle */}
        <p className="pr-subtitle">You're getting stronger! 💪</p>
      </div>
    </div>
  );
}
