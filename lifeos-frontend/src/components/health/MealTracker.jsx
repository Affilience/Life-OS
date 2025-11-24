import { useHealthStore } from '../../stores/healthStore';
import MealInput from './MealInput';
import MealCard from './MealCard';
import DailyNutritionSummary from './DailyNutritionSummary';
import QuickAddButtons from './QuickAddButtons';

export default function MealTracker() {
  const { selectedDate, getMealsForDate, isAddingMeal, setIsAddingMeal } = useHealthStore();

  const todaysMeals = getMealsForDate(selectedDate);

  return (
    <div style={{
      padding: '40px',
      maxWidth: '1200px',
      margin: '0 auto',
      background: '#0a0a0a',
      minHeight: '100vh',
    }}>
      {/* Header */}
      <div style={{
        marginBottom: '32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div>
          <h1 style={{
            fontSize: '32px',
            fontWeight: 'bold',
            marginBottom: '8px',
            background: 'linear-gradient(135deg, #10b981, #34d399)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Meal Tracker
          </h1>
          <p style={{
            fontSize: '14px',
            color: 'rgba(255, 255, 255, 0.6)',
          }}>
            Simply type what you ate - we'll handle the rest ✨
          </p>
        </div>

        <button
          onClick={() => setIsAddingMeal(true)}
          style={{
            padding: '12px 24px',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            border: 'none',
            borderRadius: '12px',
            color: '#fff',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
          }}
        >
          + Log Meal
        </button>
      </div>

      {/* Daily Summary */}
      <DailyNutritionSummary date={selectedDate} />

      {/* Meal Input (Expandable) */}
      {isAddingMeal && (
        <div style={{
          marginBottom: '32px',
        }}>
          <MealInput onClose={() => setIsAddingMeal(false)} />
        </div>
      )}

      {/* Quick Add Buttons */}
      {!isAddingMeal && <QuickAddButtons />}

      {/* Today's Meals */}
      <div style={{ marginTop: '32px' }}>
        <h2 style={{
          fontSize: '20px',
          fontWeight: '600',
          marginBottom: '16px',
          color: '#fff',
        }}>
          Today's Meals
        </h2>

        {todaysMeals.length === 0 ? (
          <div style={{
            padding: '60px',
            textAlign: 'center',
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px dashed rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🍽️</div>
            <div style={{ fontSize: '16px', color: 'rgba(255, 255, 255, 0.6)' }}>
              No meals logged yet today
            </div>
            <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.4)', marginTop: '8px' }}>
              Click "Log Meal" to get started
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '16px' }}>
            {todaysMeals.map((meal) => (
              <MealCard key={meal.id} meal={meal} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
