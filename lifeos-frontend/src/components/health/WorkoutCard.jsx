/**
 * WorkoutCard - Display a completed workout
 */

import { EXERCISE_DATABASE } from '../../data/exerciseDatabase';
import { formatDuration, formatRelativeDate } from '../../services/workoutCalculations';
import { useWorkoutStore } from '../../stores/workoutStore';

// Helper to get exercise data from built-in or custom exercises
const getExerciseData = (exerciseId, customExercises) => {
  return EXERCISE_DATABASE[exerciseId] || customExercises?.[exerciseId] || null;
};

export default function WorkoutCard({ workout }) {
  const { deleteWorkout, customExercises } = useWorkoutStore();

  const handleDelete = () => {
    if (window.confirm('Delete this workout? This action cannot be undone.')) {
      deleteWorkout(workout.id);
    }
  };

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.02)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '16px',
      padding: '24px',
      transition: 'all 0.2s ease',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
    }}
    >
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '16px',
      }}>
        <div>
          <div style={{
            fontSize: '20px',
            fontWeight: '600',
            marginBottom: '4px',
            color: '#fff',
          }}>
            {workout.name}
          </div>
          <div style={{
            fontSize: '13px',
            color: 'rgba(255, 255, 255, 0.5)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}>
            <span>{formatRelativeDate(workout.date)}</span>
            <span>•</span>
            <span>⏱️ {formatDuration(workout.duration)}</span>
            {workout.prsAchieved > 0 && (
              <>
                <span>•</span>
                <span style={{ color: '#f59e0b' }}>⭐ {workout.prsAchieved} PR{workout.prsAchieved > 1 ? 's' : ''}</span>
              </>
            )}
          </div>
        </div>

        <button
          onClick={handleDelete}
          style={{
            padding: '8px 12px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: '8px',
            color: '#ef4444',
            fontSize: '12px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
          }}
        >
          🗑️ Delete
        </button>
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '12px',
        marginBottom: '16px',
      }}>
        <div style={{
          padding: '12px',
          background: 'rgba(16, 185, 129, 0.1)',
          borderRadius: '8px',
        }}>
          <div style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#10b981',
            marginBottom: '2px',
          }}>
            {workout.totalVolume.toLocaleString()}
          </div>
          <div style={{
            fontSize: '12px',
            color: 'rgba(255, 255, 255, 0.6)',
          }}>
            Total Volume (lbs)
          </div>
        </div>

        <div style={{
          padding: '12px',
          background: 'rgba(59, 130, 246, 0.1)',
          borderRadius: '8px',
        }}>
          <div style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#3b82f6',
            marginBottom: '2px',
          }}>
            {workout.exercises.length}
          </div>
          <div style={{
            fontSize: '12px',
            color: 'rgba(255, 255, 255, 0.6)',
          }}>
            Exercises
          </div>
        </div>

        <div style={{
          padding: '12px',
          background: 'rgba(139, 92, 246, 0.1)',
          borderRadius: '8px',
        }}>
          <div style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#8b5cf6',
            marginBottom: '2px',
          }}>
            {workout.exercises.reduce((sum, e) => sum + e.sets.filter(s => s.completed).length, 0)}
          </div>
          <div style={{
            fontSize: '12px',
            color: 'rgba(255, 255, 255, 0.6)',
          }}>
            Total Sets
          </div>
        </div>
      </div>

      {/* Exercises */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}>
        {workout.exercises.map((exercise, index) => {
          const exerciseData = getExerciseData(exercise.exerciseId, customExercises);
          const completedSets = exercise.sets.filter(s => s.completed);

          return (
            <div
              key={index}
              style={{
                padding: '12px',
                background: 'rgba(0, 0, 0, 0.2)',
                borderRadius: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}>
                <div style={{ fontSize: '24px' }}>
                  {exerciseData?.icon || '💪'}
                </div>
                <div>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#fff',
                  }}>
                    {exerciseData?.name || exercise.exerciseId}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: 'rgba(255, 255, 255, 0.5)',
                  }}>
                    {completedSets.length} sets
                  </div>
                </div>
              </div>

              <div style={{
                fontSize: '12px',
                color: 'rgba(255, 255, 255, 0.6)',
                textAlign: 'right',
              }}>
                {completedSets.map((set, i) => (
                  <div key={i}>
                    {set.weight} lbs × {set.reps} {set.isPR && '⭐'}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Notes */}
      {workout.notes && (
        <div style={{
          marginTop: '16px',
          padding: '12px',
          background: 'rgba(0, 0, 0, 0.2)',
          borderRadius: '8px',
          fontSize: '13px',
          color: 'rgba(255, 255, 255, 0.7)',
          fontStyle: 'italic',
        }}>
          "{workout.notes}"
        </div>
      )}
    </div>
  );
}
