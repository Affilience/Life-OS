/**
 * StrengthMetrics - Display overall strength statistics
 */

import { useWorkoutStore } from '../../stores/workoutStore';
import { EXERCISE_DATABASE } from '../../data/exerciseDatabase';
import { calculate1RM } from '../../services/workoutCalculations';

// Helper to get exercise data from built-in or custom exercises
const getExerciseData = (exerciseId, customExercises) => {
  return EXERCISE_DATABASE[exerciseId] || customExercises?.[exerciseId] || null;
};

export default function StrengthMetrics() {
  const { workouts, personalRecords, customExercises } = useWorkoutStore();

  // Get top exercises by PR
  const topExercises = Object.entries(personalRecords)
    .map(([exerciseId, pr]) => ({
      exerciseId,
      ...pr,
      estimated1RM: calculate1RM(pr.weight, pr.reps),
    }))
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 4);

  if (topExercises.length === 0) {
    return null;
  }

  return (
    <div style={{ marginBottom: '32px' }}>
      <h2 style={{
        fontSize: '20px',
        fontWeight: '600',
        marginBottom: '16px',
        color: '#fff',
      }}>
        Personal Records
      </h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '16px',
      }}>
        {topExercises.map((exercise) => {
          const exerciseData = getExerciseData(exercise.exerciseId, customExercises);

          return (
            <div
              key={exercise.exerciseId}
              style={{
                background: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: '16px',
                padding: '20px',
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '12px',
              }}>
                <div style={{ fontSize: '32px' }}>
                  {exerciseData?.icon || '💪'}
                </div>
                <div>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#fff',
                  }}>
                    {exerciseData?.name || exercise.exerciseId}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: 'rgba(255, 255, 255, 0.5)',
                  }}>
                    Personal Record
                  </div>
                </div>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <div>
                  <div style={{
                    fontSize: '24px',
                    fontWeight: 'bold',
                    color: '#f59e0b',
                    marginBottom: '2px',
                  }}>
                    {exercise.weight} lbs
                  </div>
                  <div style={{
                    fontSize: '14px',
                    color: 'rgba(255, 255, 255, 0.6)',
                  }}>
                    × {exercise.reps} reps
                  </div>
                </div>

                <div style={{
                  textAlign: 'right',
                }}>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: 'rgba(255, 255, 255, 0.7)',
                    marginBottom: '2px',
                  }}>
                    Est. 1RM
                  </div>
                  <div style={{
                    fontSize: '20px',
                    fontWeight: 'bold',
                    color: '#f59e0b',
                  }}>
                    {exercise.estimated1RM}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
