import { useHealthStore } from '../../stores/healthStore';

export default function MealCard({ meal }) {
  const deleteMeal = useHealthStore((state) => state.deleteMeal);

  const getMealTypeColor = (type) => {
    switch (type) {
      case 'breakfast':
        return '#f59e0b';
      case 'lunch':
        return '#10b981';
      case 'dinner':
        return '#3b82f6';
      case 'snack':
        return '#8b5cf6';
      default:
        return '#6b7280';
    }
  };

  const getMealTypeIcon = (type) => {
    switch (type) {
      case 'breakfast':
        return '🌅';
      case 'lunch':
        return '☀️';
      case 'dinner':
        return '🌙';
      case 'snack':
        return '🍎';
      default:
        return '🍽️';
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const color = getMealTypeColor(meal.mealType);

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.02)',
      border: `1px solid ${color}30`,
      borderRadius: '12px',
      padding: '20px',
      position: 'relative',
      transition: 'all 0.2s ease',
    }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
        e.currentTarget.style.borderColor = `${color}50`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
        e.currentTarget.style.borderColor = `${color}30`;
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'start',
        marginBottom: '12px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '24px' }}>{getMealTypeIcon(meal.mealType)}</span>
          <div>
            <div style={{
              fontSize: '14px',
              fontWeight: '600',
              color,
              textTransform: 'capitalize',
            }}>
              {meal.mealType}
            </div>
            <div style={{
              fontSize: '12px',
              color: 'rgba(255, 255, 255, 0.5)',
              marginTop: '2px',
            }}>
              {formatTime(meal.timestamp)}
            </div>
          </div>
        </div>

        {/* Delete button */}
        <button
          onClick={() => deleteMeal(meal.id)}
          style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '6px',
            width: '28px',
            height: '28px',
            color: '#ef4444',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          ✕
        </button>
      </div>

      {/* Description */}
      <div style={{
        fontSize: '15px',
        color: 'rgba(255, 255, 255, 0.8)',
        marginBottom: '16px',
        fontStyle: 'italic',
      }}>
        "{meal.description}"
      </div>

      {/* Items */}
      <div style={{
        display: 'grid',
        gap: '8px',
        marginBottom: '16px',
      }}>
        {meal.items.map((item, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '8px 12px',
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '8px',
              fontSize: '13px',
            }}
          >
            <div>
              <span style={{ color: '#fff', fontWeight: '500' }}>{item.name}</span>
              <span style={{
                marginLeft: '8px',
                fontSize: '11px',
                color: 'rgba(255, 255, 255, 0.4)',
              }}>
                P: {item.protein}g • C: {item.carbs}g • F: {item.fat}g
              </span>
            </div>
            <div style={{
              fontWeight: '600',
              color: '#10b981',
            }}>
              {item.calories} cal
            </div>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div style={{
        paddingTop: '12px',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '12px',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color }}>
            {meal.totalCalories}
          </div>
          <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)', marginTop: '2px' }}>
            Calories
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '16px', fontWeight: '600', color: '#3b82f6' }}>
            {Math.round(meal.totalProtein)}g
          </div>
          <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)', marginTop: '2px' }}>
            Protein
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '16px', fontWeight: '600', color: '#f59e0b' }}>
            {Math.round(meal.totalCarbs)}g
          </div>
          <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)', marginTop: '2px' }}>
            Carbs
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '16px', fontWeight: '600', color: '#ef4444' }}>
            {Math.round(meal.totalFat)}g
          </div>
          <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)', marginTop: '2px' }}>
            Fat
          </div>
        </div>
      </div>
    </div>
  );
}
