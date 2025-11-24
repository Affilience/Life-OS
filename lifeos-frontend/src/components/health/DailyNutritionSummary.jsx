import { useHealthStore } from '../../stores/healthStore';
import CalorieProgressRing from './CalorieProgressRing';
import MacroBreakdown from './MacroBreakdown';

export default function DailyNutritionSummary({ date }) {
  const { getDailyTotals, dailyGoals } = useHealthStore();
  const totals = getDailyTotals(date);

  const calorieProgress = (totals.calories / dailyGoals.calories) * 100;
  const remaining = dailyGoals.calories - totals.calories;

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '300px 1fr',
      gap: '24px',
      marginBottom: '32px',
    }}>
      {/* Calorie Progress Ring */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '16px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <CalorieProgressRing
          current={totals.calories}
          goal={dailyGoals.calories}
          size={180}
        />

        <div style={{
          marginTop: '16px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)' }}>
            {remaining > 0 ? 'Remaining' : 'Over Goal'}
          </div>
          <div style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: remaining > 0 ? '#10b981' : '#ef4444',
          }}>
            {Math.abs(remaining)} cal
          </div>
        </div>
      </div>

      {/* Macro Breakdown */}
      <MacroBreakdown
        protein={{ current: totals.protein, goal: dailyGoals.protein }}
        carbs={{ current: totals.carbs, goal: dailyGoals.carbs }}
        fat={{ current: totals.fat, goal: dailyGoals.fat }}
      />
    </div>
  );
}
