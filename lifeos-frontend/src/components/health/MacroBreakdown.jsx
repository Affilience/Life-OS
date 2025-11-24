export default function MacroBreakdown({ protein, carbs, fat }) {
  const macros = [
    {
      name: 'Protein',
      current: protein.current,
      goal: protein.goal,
      color: '#3b82f6',
      unit: 'g',
    },
    {
      name: 'Carbs',
      current: carbs.current,
      goal: carbs.goal,
      color: '#f59e0b',
      unit: 'g',
    },
    {
      name: 'Fat',
      current: fat.current,
      goal: fat.goal,
      color: '#ef4444',
      unit: 'g',
    },
  ];

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.02)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '16px',
      padding: '24px',
    }}>
      <div style={{
        fontSize: '16px',
        fontWeight: '600',
        marginBottom: '20px',
        color: '#fff',
      }}>
        Macronutrients
      </div>

      <div style={{ display: 'grid', gap: '20px' }}>
        {macros.map((macro) => {
          const progress = Math.min((macro.current / macro.goal) * 100, 100);

          return (
            <div key={macro.name}>
              {/* Header */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '10px',
              }}>
                <div style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: 'rgba(255, 255, 255, 0.9)',
                }}>
                  {macro.name}
                </div>
                <div style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: macro.color,
                }}>
                  {Math.round(macro.current)}{macro.unit} / {macro.goal}{macro.unit}
                </div>
              </div>

              {/* Progress bar */}
              <div style={{
                position: 'relative',
                height: '8px',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '999px',
                overflow: 'hidden',
              }}>
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  height: '100%',
                  width: `${progress}%`,
                  background: macro.color,
                  borderRadius: '999px',
                  transition: 'width 0.5s ease',
                  boxShadow: `0 0 12px ${macro.color}60`,
                }} />
              </div>

              {/* Percentage */}
              <div style={{
                marginTop: '6px',
                fontSize: '12px',
                color: 'rgba(255, 255, 255, 0.5)',
              }}>
                {Math.round(progress)}% of daily goal
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
