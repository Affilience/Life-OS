import React, { useState, useEffect } from 'react';
import { useWorkoutStore } from '../../stores/workoutStore';
import {
  Check,
  TrendingUp,
  Flame,
  ChevronUp,
  ChevronDown,
  Plus,
  Minus,
  Zap,
  Trophy,
  Target
} from 'lucide-react';
import './SetLogger.css';

// Calculate estimated 1RM using Brzycki formula
const calculate1RM = (weight, reps) => {
  if (reps === 1) return weight;
  if (reps > 12) return Math.round(weight * (1 + reps / 30)); // Approximation for high reps
  return Math.round(weight * (36 / (37 - reps)));
};

// Set type options
const SET_TYPES = [
  { id: 'normal', label: 'Working', color: null },
  { id: 'warmup', label: 'Warm-up', color: '#3b82f6' },
  { id: 'drop', label: 'Drop Set', color: '#f59e0b' },
  { id: 'failure', label: 'To Failure', color: '#ef4444' },
];

export default function SetLogger({ exercise, exerciseData, exerciseIndex, onSetComplete, onAddSet }) {
  const { personalRecords, workouts, getExerciseHistory } = useWorkoutStore();

  // Find the first incomplete set
  const getNextIncompleteSet = () => exercise.sets.findIndex(s => !s.completed);

  const [activeSetIndex, setActiveSetIndex] = useState(getNextIncompleteSet());
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [setType, setSetType] = useState('normal');

  const currentPR = personalRecords[exercise.exerciseId];

  // Get last workout data for this exercise
  const exerciseHistory = getExerciseHistory(exercise.exerciseId);
  const lastWorkoutSets = exerciseHistory.slice(-exercise.sets.length);

  // Auto-fill weight from previous set or last workout
  useEffect(() => {
    if (activeSetIndex >= 0) {
      // First try to get weight from previous set in current workout
      const prevSetInWorkout = activeSetIndex > 0 ? exercise.sets[activeSetIndex - 1] : null;

      if (prevSetInWorkout?.completed && prevSetInWorkout?.weight) {
        setWeight(prevSetInWorkout.weight.toString());
      } else if (lastWorkoutSets[activeSetIndex]?.weight) {
        // Otherwise get from same set in last workout
        setWeight(lastWorkoutSets[activeSetIndex].weight.toString());
      }

      // Auto-fill reps from target or last workout
      if (lastWorkoutSets[activeSetIndex]?.reps) {
        setReps(lastWorkoutSets[activeSetIndex].reps.toString());
      } else if (exercise.targetReps) {
        setReps(exercise.targetReps.toString());
      }
    }
  }, [activeSetIndex]);

  const handleLogSet = () => {
    if (!weight || !reps || activeSetIndex === -1) return;

    const weightNum = parseFloat(weight);
    const repsNum = parseInt(reps);

    // Check if it's a PR (only for working sets, not warm-ups)
    const isPR = setType !== 'warmup' && (
      !currentPR ||
      (weightNum > currentPR.weight) ||
      (weightNum === currentPR.weight && repsNum > currentPR.reps)
    );

    onSetComplete(activeSetIndex, weightNum, repsNum, isPR, setType);

    // Move to next set
    const nextSetIndex = exercise.sets.findIndex((s, i) => i > activeSetIndex && !s.completed);
    setActiveSetIndex(nextSetIndex);

    // Reset set type for next set
    setSetType('normal');

    // Keep weight, clear reps for next set
    setReps('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && weight && reps) {
      handleLogSet();
    }
  };

  const adjustWeight = (amount) => {
    const current = parseFloat(weight) || 0;
    const newWeight = Math.max(0, current + amount);
    setWeight(newWeight.toString());
  };

  const adjustReps = (amount) => {
    const current = parseInt(reps) || 0;
    const newReps = Math.max(0, current + amount);
    setReps(newReps.toString());
  };

  const allSetsComplete = activeSetIndex === -1;
  const estimated1RM = weight && reps ? calculate1RM(parseFloat(weight), parseInt(reps)) : null;

  // Check if current input would be a PR
  const wouldBePR = weight && reps && setType !== 'warmup' && (
    !currentPR ||
    (parseFloat(weight) > currentPR.weight) ||
    (parseFloat(weight) === currentPR.weight && parseInt(reps) > currentPR.reps)
  );

  // Calculate total volume for this exercise
  const completedVolume = exercise.sets.reduce((sum, set) => {
    if (set.completed) {
      return sum + (set.weight * set.reps);
    }
    return sum;
  }, 0);

  return (
    <div className="set-logger-redesign">
      {/* Exercise Stats Header */}
      <div className="exercise-stats-bar">
        <div className="stat-item">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span className="stat-label">PR:</span>
          <span className="stat-value">
            {currentPR ? `${currentPR.weight} × ${currentPR.reps}` : '—'}
          </span>
        </div>
        <div className="stat-item">
          <Target className="w-4 h-4 text-purple-400" />
          <span className="stat-label">Est. 1RM:</span>
          <span className="stat-value">
            {currentPR ? `${calculate1RM(currentPR.weight, currentPR.reps)} lbs` : '—'}
          </span>
        </div>
        <div className="stat-item">
          <Zap className="w-4 h-4 text-emerald-400" />
          <span className="stat-label">Volume:</span>
          <span className="stat-value">{completedVolume.toLocaleString()} lbs</span>
        </div>
      </div>

      {/* Sets Table */}
      <div className="sets-table">
        <div className="sets-table-header">
          <div className="col-set">SET</div>
          <div className="col-previous">PREVIOUS</div>
          <div className="col-weight">WEIGHT</div>
          <div className="col-reps">REPS</div>
          <div className="col-status"></div>
        </div>

        {exercise.sets.map((set, index) => {
          const isActive = index === activeSetIndex;
          const isCompleted = set.completed;
          const lastWorkoutSet = lastWorkoutSets[index];
          const isImprovement = isCompleted && lastWorkoutSet && (
            set.weight > lastWorkoutSet.weight ||
            (set.weight === lastWorkoutSet.weight && set.reps > lastWorkoutSet.reps)
          );

          return (
            <div
              key={index}
              onClick={() => !isCompleted && setActiveSetIndex(index)}
              className={`set-table-row ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''} ${set.setType || ''}`}
            >
              {/* Set Number */}
              <div className="col-set">
                <div className={`set-number-badge ${isCompleted ? 'done' : ''} ${isActive ? 'current' : ''}`}>
                  {isCompleted ? <Check className="w-4 h-4" /> : index + 1}
                </div>
              </div>

              {/* Previous (from last workout) */}
              <div className="col-previous">
                {lastWorkoutSet ? (
                  <span className="previous-value">
                    {lastWorkoutSet.weight} × {lastWorkoutSet.reps}
                  </span>
                ) : (
                  <span className="previous-empty">—</span>
                )}
              </div>

              {/* Weight */}
              <div className="col-weight">
                {isCompleted ? (
                  <span className={`completed-value ${isImprovement ? 'improved' : ''}`}>
                    {set.weight}
                    {isImprovement && <TrendingUp className="w-3 h-3 ml-1" />}
                  </span>
                ) : (
                  <span className="target-value">{lastWorkoutSet?.weight || '—'}</span>
                )}
              </div>

              {/* Reps */}
              <div className="col-reps">
                {isCompleted ? (
                  <span className={`completed-value ${isImprovement ? 'improved' : ''}`}>
                    {set.reps}
                  </span>
                ) : (
                  <span className="target-value">{exercise.targetReps || lastWorkoutSet?.reps || '—'}</span>
                )}
              </div>

              {/* Status */}
              <div className="col-status">
                {set.isPR && <span className="pr-star">⭐</span>}
                {set.setType === 'warmup' && <span className="set-type-badge warmup">W</span>}
                {set.setType === 'drop' && <span className="set-type-badge drop">D</span>}
                {set.setType === 'failure' && <span className="set-type-badge failure">F</span>}
              </div>
            </div>
          );
        })}

        {/* Add Set Button */}
        <button
          className="add-set-row"
          onClick={() => {
            onAddSet?.();
            // If all sets were complete, activate the new set
            if (allSetsComplete) {
              setActiveSetIndex(exercise.sets.length);
            }
          }}
        >
          <Plus className="w-4 h-4" />
          Add Set
        </button>
      </div>

      {/* Active Set Input */}
      {!allSetsComplete ? (
        <div className={`active-set-input ${wouldBePR ? 'pr-zone' : ''}`}>
          {wouldBePR && (
            <div className="pr-zone-banner">
              <Flame className="w-5 h-5" />
              <span>PR Zone! This will be a new personal record!</span>
            </div>
          )}

          <div className="input-header">
            <h4 className="input-title">Set {activeSetIndex + 1}</h4>
            {estimated1RM && (
              <div className="estimated-1rm">
                Est. 1RM: <strong>{estimated1RM} lbs</strong>
              </div>
            )}
          </div>

          {/* Beat Last Workout Prompt */}
          {lastWorkoutSets[activeSetIndex] && (
            <div className="beat-last-prompt">
              <Target className="w-4 h-4" />
              <span>
                Last time: <strong>{lastWorkoutSets[activeSetIndex].weight} lbs × {lastWorkoutSets[activeSetIndex].reps} reps</strong>
                {' '}- Can you beat it?
              </span>
            </div>
          )}

          {/* Weight Input */}
          <div className="input-row">
            <label className="input-label">Weight (lbs)</label>
            <div className="input-with-buttons">
              <button
                className="adjust-btn minus"
                onClick={() => adjustWeight(-5)}
                type="button"
              >
                <Minus className="w-4 h-4" />
                <span>5</span>
              </button>
              <button
                className="adjust-btn small minus"
                onClick={() => adjustWeight(-2.5)}
                type="button"
              >
                <Minus className="w-3 h-3" />
                <span>2.5</span>
              </button>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="0"
                className="weight-input"
                autoFocus
              />
              <button
                className="adjust-btn small plus"
                onClick={() => adjustWeight(2.5)}
                type="button"
              >
                <Plus className="w-3 h-3" />
                <span>2.5</span>
              </button>
              <button
                className="adjust-btn plus"
                onClick={() => adjustWeight(5)}
                type="button"
              >
                <Plus className="w-4 h-4" />
                <span>5</span>
              </button>
            </div>
          </div>

          {/* Reps Input */}
          <div className="input-row">
            <label className="input-label">Reps</label>
            <div className="input-with-buttons">
              <button
                className="adjust-btn minus"
                onClick={() => adjustReps(-1)}
                type="button"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
              <input
                type="number"
                value={reps}
                onChange={(e) => setReps(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="0"
                className="reps-input"
              />
              <button
                className="adjust-btn plus"
                onClick={() => adjustReps(1)}
                type="button"
              >
                <ChevronUp className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Set Type Tags */}
          <div className="set-type-selector">
            <label className="input-label">Set Type</label>
            <div className="set-type-options">
              {SET_TYPES.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSetType(type.id)}
                  className={`set-type-btn ${setType === type.id ? 'selected' : ''}`}
                  style={type.color && setType === type.id ? {
                    borderColor: type.color,
                    backgroundColor: `${type.color}20`
                  } : {}}
                  type="button"
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Complete Button */}
          <button
            onClick={handleLogSet}
            disabled={!weight || !reps}
            className={`complete-set-btn ${wouldBePR ? 'pr-mode' : ''}`}
          >
            <Check className="w-5 h-5" />
            {wouldBePR ? 'Log PR!' : 'Complete Set'}
          </button>
        </div>
      ) : (
        <div className="all-sets-complete">
          <div className="complete-icon">🎉</div>
          <h4 className="complete-title">All Sets Complete!</h4>
          <p className="complete-text">
            Total volume: <strong>{completedVolume.toLocaleString()} lbs</strong>
          </p>
          <p className="complete-hint">
            Move to the next exercise or finish your workout
          </p>
        </div>
      )}
    </div>
  );
}
