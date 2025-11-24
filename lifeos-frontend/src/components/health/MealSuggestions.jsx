export default function MealSuggestions({ suggestions, onSelect }) {
  if (suggestions.length === 0) return null;

  return (
    <div style={{
      position: 'absolute',
      top: 'calc(100% + 8px)',
      left: 0,
      right: 0,
      background: 'rgba(20, 20, 20, 0.98)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(16, 185, 129, 0.2)',
      borderRadius: '12px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
      zIndex: 1000,
      maxHeight: '300px',
      overflowY: 'auto',
    }}>
      {suggestions.map((suggestion, index) => (
        <div
          key={index}
          onClick={() => onSelect(suggestion.name)}
          style={{
            padding: '12px 16px',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            transition: 'background 0.15s ease',
            borderBottom: index < suggestions.length - 1 ? '1px solid rgba(255, 255, 255, 0.05)' : 'none',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(16, 185, 129, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
          }}
        >
          <div>
            <div style={{ fontSize: '14px', fontWeight: '500', color: '#fff' }}>
              {suggestion.name}
            </div>
            <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)', marginTop: '2px' }}>
              {suggestion.serving}
            </div>
          </div>
          <div style={{
            fontSize: '13px',
            fontWeight: '600',
            color: '#10b981',
          }}>
            {suggestion.calories} cal
          </div>
        </div>
      ))}
    </div>
  );
}
