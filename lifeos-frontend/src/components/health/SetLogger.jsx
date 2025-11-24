import React, { useState } from 'react';
import { useWorkoutStore } from '../../stores/workoutStore';
import { Check, TrendingUp, Info } from 'lucide-react';
import './SetLogger.css';

export default function SetLogger({ exercise, exerciseData, exerciseIndex, onSetComplete }) {
  const [activeSetIndex, setActiveSetIndex] = useState(
    exercise.sets.findIndex(s => !s.completed)
  );

  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');

  const { personalRecords } = useWorkoutStore();
  const currentPR = personalRecords[exercise.exerciseId];

  const handleLogSet = () => {
    if (!weight || !reps || activeSetIndex === -1) return;

    const weightNum = parseFloat(weight);
    const repsNum = parseInt(reps);

    // Check if it's a PR
    const isPR = !currentPR ||
                 (weightNum > currentPR.weight) ||
                 (weightNum === currentPR.weight && repsNum > currentPR.reps);

    onSetComplete(activeSetIndex, weightNum, repsNum, isPR);

    // Move to next set
    const nextSetIndex = exercise.sets.findIndex((s, i) => i > activeSetIndex && !s.completed);
    setActiveSetIndex(nextSetIndex);

    // Clear inputs for next set (keep weight for progressive sets)
    setReps('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && weight && reps) {
      handleLogSet();
    }
  };

  const previousSet = activeSetIndex > 0 ? exercise.sets[activeSetIndex - 1] : null;
  const allSetsComplete = activeSetIndex === -1;

  return (
    <div className="set-logger">
      {/* Sets List */}
      <div className="sets-list">
        {exercise.sets.map((set, index) => {
          const isActive = index === activeSetIndex;
          const isCompleted = set.completed;

          return (
            <div
              key={index}
              onClick={() => !isCompleted && setActiveSetIndex(index)}
              className={`set-row ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
            >
              {/* Set Number */}
              <div className="set-number">
                {isCompleted ? '✓' : index + 1}
              </div>

              {/* Weight */}
              <div className="set-data">
                <div className="set-data-label">Weight (lbs)</div>
                <div className="set-data-value">
                  {isCompleted ? set.weight : previousSet?.weight || '—'}
                </div>
              </div>

              {/* Reps */}
              <div className="set-data">
                <div className="set-data-label">Reps</div>
                <div className="set-data-value">
                  {isCompleted ? set.reps : exercise.targetReps || '—'}
                </div>
              </div>

              {/* PR Indicator */}
              <div className="set-pr-indicator">
                {set.isPR && <span>⭐</span>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Input Section for Active Set */}
      {!allSetsComplete ? (
        <div className="set-input-section">
          <div className="input-section-header">
            <h4 className="input-section-title">Log Set {activeSetIndex + 1}</h4>
          </div>

          {previousSet && (
            <div className="previous-set-hint">
              <Info className="previous-set-hint-icon w-4 h-4" />
              <span>
                <span className="previous-set-hint-label">Previous:</span>{' '}
                {previousSet.weight} lbs × {previousSet.reps} reps
              </span>
            </div>
          )}

          <p className="input-section-hint">
            Enter your performance and press{' '}
            <span className="input-section-hint-highlight">Enter</span> or click Complete
          </p>

          <div className="input-grid">
            <div className="input-field-group">
              <label className="input-label">Weight (lbs)</label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={previousSet?.weight.toString() || '0'}
                className="input-field"
                autoFocus
              />
            </div>

            <div className="input-field-group">
              <label className="input-label">Reps</label>
              <input
                type="number"
                value={reps}
                onChange={(e) => setReps(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={exercise.targetReps?.toString() || '0'}
                className="input-field"
              />
            </div>
          </div>

          <button
            onClick={handleLogSet}
            disabled={!weight || !reps}
            className="complete-set-btn"
          >
            <Check className="w-5 h-5" />
            Complete Set
          </button>
        </div>
      ) : (
        <div className="all-sets-complete">
          <div className="all-sets-complete-icon">🎉</div>
          <h4 className="all-sets-complete-title">All Sets Complete!</h4>
          <p className="all-sets-complete-text">
            Great work! Move to the next exercise or finish your workout.
          </p>
        </div>
      )}

      {/* Current PR Display */}
      {currentPR && !allSetsComplete && (
        <div className="current-pr-display">
          <TrendingUp className="pr-icon w-5 h-5" style={{ color: '#f59e0b' }} />
          <div className="pr-text">
            <span className="pr-text-label">Current PR:</span>
            <span className="pr-text-value">
              {currentPR.weight} lbs × {currentPR.reps} reps
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
