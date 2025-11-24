import { detectMealType, getQuickMealSuggestions } from '../../services/mealParser';
import { useHealthStore } from '../../stores/healthStore';

export default function QuickAddButtons() {
  const setIsAddingMeal = useHealthStore((state) => state.setIsAddingMeal);
  const currentMealType = detectMealType();
  const suggestions = getQuickMealSuggestions(currentMealType);

  return (
    <div style={{ marginBottom: '24px' }}>
      <div style={{
        fontSize: '14px',
        fontWeight: '600',
        color: 'rgba(255, 255, 255, 0.7)',
        marginBottom: '12px',
      }}>
        Quick Add ({currentMealType})
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '8px',
      }}>
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => setIsAddingMeal(true)}
            style={{
              padding: '12px 16px',
              background: 'rgba(16, 185, 129, 0.05)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '13px',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(16, 185, 129, 0.1)';
              e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.4)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(16, 185, 129, 0.05)';
              e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.2)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}
