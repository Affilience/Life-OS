import React, { useState, useEffect, useMemo } from 'react';
import { useWorkoutStore } from '../../stores/workoutStore';
import { EXERCISE_DATABASE } from '../../data/exerciseDatabase';
import ExerciseSelector from './ExerciseSelector';

// Helper to get exercise data from built-in or custom exercises
const getExerciseData = (exerciseId, customExercises) => {
  return EXERCISE_DATABASE[exerciseId] || customExercises?.[exerciseId] || null;
};
import SetLogger from './SetLogger';
import RestTimer from './RestTimer';
import PRBadge from './PRBadge';
import WorkoutSummary from './WorkoutSummary';
import {
  X,
  Check,
  Plus,
  Clock,
  ChevronLeft,
  ChevronRight,
  Trophy,
  StickyNote,
} from 'lucide-react';
import './ActiveWorkout.css';

export default function ActiveWorkout() {
  const {
    activeWorkout,
    workoutStartTime,
    currentExerciseIndex,
    setCurrentExerciseIndex,
    addExerciseToWorkout,
    addSetToExercise,
    logSet,
    finishWorkout,
    cancelWorkout,
    updateWorkoutNotes,
    personalRecords,
    customExercises,
  } = useWorkoutStore();

  const [elapsedTime, setElapsedTime] = useState(0);
  const [showExerciseSelector, setShowExerciseSelector] = useState(false);
  const [showRestTimer, setShowRestTimer] = useState(false);
  const [showPRCelebration, setShowPRCelebration] = useState(false);
  const [prDetails, setPRDetails] = useState(null);
  const [showWorkoutSummary, setShowWorkoutSummary] = useState(false);
  const [completedWorkout, setCompletedWorkout] = useState(null);

  // Update elapsed time
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - workoutStartTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [workoutStartTime]);

  // Show workout summary even after workout is finished
  if (!activeWorkout && !showWorkoutSummary) return null;

  // If showing summary, render only the summary modal
  if (!activeWorkout && showWorkoutSummary && completedWorkout) {
    return (
      <WorkoutSummary
        workout={completedWorkout}
        onClose={handleCloseSummary}
      />
    );
  }

  const currentExercise = activeWorkout.exercises[currentExerciseIndex];
  const exerciseData = currentExercise ? getExerciseData(currentExercise.exerciseId, customExercises) : null;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSetComplete = (setIndex, weight, reps, isPR, setType = 'normal') => {
    // Get previous PR before logging (for comparison in celebration)
    const exerciseId = currentExercise?.exerciseId;
    const previousPR = exerciseId ? personalRecords[exerciseId] : null;

    logSet(currentExerciseIndex, setIndex, weight, reps, setType);

    if (isPR) {
      setPRDetails({
        exercise: exerciseData.name,
        weight,
        reps,
        previousPR,
        xpEarned: 25, // PR bonus XP
      });
      setShowPRCelebration(true);
      setTimeout(() => setShowPRCelebration(false), 4000); // Show longer for enhanced modal
    }

    // Auto-start rest timer (skip for warm-up sets)
    if (setType !== 'warmup') {
      setShowRestTimer(true);
    }
  };

  const handleFinish = () => {
    const result = finishWorkout();
    if (result) {
      setCompletedWorkout(result);
      setShowWorkoutSummary(true);
    }
  };

  const handleCloseSummary = () => {
    setShowWorkoutSummary(false);
    setCompletedWorkout(null);
  };

  const handleNextExercise = () => {
    if (currentExerciseIndex < activeWorkout.exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
    }
  };

  const handlePrevExercise = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(currentExerciseIndex - 1);
    }
  };

  const totalSets = activeWorkout.exercises.reduce((sum, e) => sum + e.sets.length, 0);
  const completedSets = activeWorkout.exercises.reduce(
    (sum, e) => sum + e.sets.filter(s => s.completed).length,
    0
  );

  const progressPercentage = totalSets > 0 ? (completedSets / totalSets) * 100 : 0;

  return (
    <div className="active-workout-container">
      {/* Sticky Header */}
      <div className="active-workout-header">
        <div className="header-main">
          <div className="header-info">
            <h1 className="workout-title">{activeWorkout.name}</h1>
            <div className="workout-meta">
              <div className="meta-item">
                <Clock className="w-4 h-4" />
                <span>{formatTime(elapsedTime)}</span>
              </div>
              <span className="meta-divider">•</span>
              <div className="meta-item">
                <span>{completedSets} / {totalSets} sets</span>
              </div>
              {activeWorkout.exercises.length > 0 && (
                <>
                  <span className="meta-divider">•</span>
                  <div className="meta-item">
                    <span>Exercise {currentExerciseIndex + 1} of {activeWorkout.exercises.length}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="header-actions">
            <button
              onClick={() => {
                if (window.confirm('Cancel workout? Progress will be lost.')) {
                  cancelWorkout();
                }
              }}
              className="cancel-btn"
            >
              <X className="w-5 h-5" />
              Cancel
            </button>
            <button onClick={handleFinish} className="finish-btn">
              <Check className="w-5 h-5" />
              Finish Workout
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="workout-progress-bar">
          <div
            className="workout-progress-fill"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="active-workout-content">
        {/* Exercise Navigation */}
        {activeWorkout.exercises.length > 0 && (
          <div className="exercise-navigation">
            <button
              onClick={handlePrevExercise}
              disabled={currentExerciseIndex === 0}
              className="nav-arrow-btn"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="exercise-tabs">
              {activeWorkout.exercises.map((exercise, index) => {
                const exData = getExerciseData(exercise.exerciseId, customExercises);
                const isActive = index === currentExerciseIndex;
                const completedSetsCount = exercise.sets.filter(s => s.completed).length;
                const allCompleted = completedSetsCount === exercise.sets.length;

                return (
                  <button
                    key={index}
                    onClick={() => setCurrentExerciseIndex(index)}
                    className={`exercise-tab ${isActive ? 'active' : ''} ${allCompleted ? 'completed' : ''}`}
                  >
                    <span className="tab-icon">{exData?.icon || '💪'}</span>
                    <span className="tab-name">{exData?.name || 'Exercise'}</span>
                    <span className="tab-progress">
                      {completedSetsCount}/{exercise.sets.length}
                    </span>
                  </button>
                );
              })}

              <button
                onClick={() => setShowExerciseSelector(true)}
                className="add-exercise-tab"
              >
                <Plus className="w-5 h-5" />
                Add Exercise
              </button>
            </div>

            <button
              onClick={handleNextExercise}
              disabled={currentExerciseIndex === activeWorkout.exercises.length - 1}
              className="nav-arrow-btn"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Current Exercise */}
        {exerciseData ? (
          <div className="current-exercise-section">
            <div className="exercise-header">
              <div className="exercise-icon-large">{exerciseData.icon}</div>
              <div className="exercise-info">
                <h2 className="exercise-name">{exerciseData.name}</h2>
                <div className="exercise-muscles">
                  {exerciseData.muscleGroups.join(', ')}
                </div>
                <div className="exercise-equipment">
                  {exerciseData.equipment} • {exerciseData.type}
                </div>
              </div>
            </div>

            {/* Set Logger */}
            <div className="set-logger-container">
              <SetLogger
                exercise={currentExercise}
                exerciseData={exerciseData}
                exerciseIndex={currentExerciseIndex}
                onSetComplete={handleSetComplete}
                onAddSet={() => addSetToExercise(currentExerciseIndex)}
              />
            </div>
          </div>
        ) : (
          <div className="no-exercise-state">
            <div className="no-exercise-icon">💪</div>
            <h3 className="no-exercise-title">No exercises added yet</h3>
            <p className="no-exercise-text">Add an exercise to start your workout</p>
            <button
              onClick={() => setShowExerciseSelector(true)}
              className="add-exercise-btn-large"
            >
              <Plus className="w-5 h-5" />
              Add Exercise
            </button>
          </div>
        )}

        {/* Workout Notes */}
        <div className="workout-notes-section">
          <div className="notes-header">
            <StickyNote className="w-5 h-5" />
            <h3 className="notes-title">Workout Notes</h3>
          </div>
          <textarea
            value={activeWorkout.notes}
            onChange={(e) => updateWorkoutNotes(e.target.value)}
            placeholder="How did it feel? Any PRs or observations?"
            className="notes-textarea"
            rows="4"
          />
        </div>
      </div>

      {/* Modals */}
      {showExerciseSelector && (
        <ExerciseSelector
          onSelect={(exerciseId) => {
            addExerciseToWorkout(exerciseId);
            setShowExerciseSelector(false);
            // Auto-navigate to new exercise
            setCurrentExerciseIndex(activeWorkout.exercises.length);
          }}
          onClose={() => setShowExerciseSelector(false)}
        />
      )}

      {showRestTimer && (
        <RestTimer
          onComplete={() => setShowRestTimer(false)}
          onSkip={() => setShowRestTimer(false)}
        />
      )}

      {showPRCelebration && prDetails && (
        <PRBadge
          exercise={prDetails.exercise}
          weight={prDetails.weight}
          reps={prDetails.reps}
          previousPR={prDetails.previousPR}
          xpEarned={prDetails.xpEarned}
        />
      )}

      {showWorkoutSummary && completedWorkout && (
        <WorkoutSummary
          workout={completedWorkout}
          onClose={handleCloseSummary}
        />
      )}
    </div>
  );
}
