import { useState, useRef, useEffect } from 'react';
import { useHealthStore } from '../../stores/healthStore';
import { parseMealInput, getMealSuggestions, detectMealType } from '../../services/mealParser';
import MealSuggestions from './MealSuggestions';

export default function MealInput({ onClose }) {
  const [input, setInput] = useState('');
  const [parsedItems, setParsedItems] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const inputRef = useRef(null);
  const addMeal = useHealthStore((state) => state.addMeal);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Parse input as user types - THIS IS THE MAGIC!
  useEffect(() => {
    if (input.length > 2) {
      const items = parseMealInput(input);
      setParsedItems(items);

      const suggestions = getMealSuggestions(input);
      setSuggestions(suggestions);
      setShowSuggestions(suggestions.length > 0);
    } else {
      setParsedItems([]);
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [input]);

  const handleSubmit = () => {
    if (parsedItems.length === 0) return;

    setIsProcessing(true);

    // Calculate totals
    const totalCalories = parsedItems.reduce((sum, item) => sum + item.calories, 0);
    const totalProtein = parsedItems.reduce((sum, item) => sum + item.protein, 0);
    const totalCarbs = parsedItems.reduce((sum, item) => sum + item.carbs, 0);
    const totalFat = parsedItems.reduce((sum, item) => sum + item.fat, 0);

    // Create meal object
    const mealData = {
      mealType: detectMealType(),
      description: input,
      items: parsedItems,
      totalCalories: Math.round(totalCalories),
      totalProtein: Math.round(totalProtein * 10) / 10,
      totalCarbs: Math.round(totalCarbs * 10) / 10,
      totalFat: Math.round(totalFat * 10) / 10,
    };

    // Save meal
    addMeal(mealData);

    // Reset and close
    setTimeout(() => {
      setIsProcessing(false);
      setInput('');
      setParsedItems([]);
      onClose();
    }, 500);
  };

  const handleSuggestionClick = (suggestion) => {
    setInput(suggestion);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const totalCalories = parsedItems.reduce((sum, item) => sum + item.calories, 0);

  return (
    <div style={{
      background: 'rgba(16, 185, 129, 0.05)',
      border: '2px solid rgba(16, 185, 129, 0.2)',
      borderRadius: '16px',
      padding: '24px',
      position: 'relative',
      animation: 'slideDown 0.3s ease',
    }}>
      {/* Close button */}
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          background: 'rgba(255, 255, 255, 0.05)',
          border: 'none',
          borderRadius: '8px',
          width: '32px',
          height: '32px',
          color: '#fff',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '18px',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
        }}
      >
        ✕
      </button>

      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '4px', color: '#fff' }}>
          What did you eat?
        </div>
        <div style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.5)' }}>
          Just type naturally - e.g., "grilled chicken with rice and broccoli"
        </div>
      </div>

      {/* Input Field */}
      <div style={{ position: 'relative' }}>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && parsedItems.length > 0) {
              handleSubmit();
            }
            if (e.key === 'Escape') {
              onClose();
            }
          }}
          placeholder="e.g., chicken salad with olive oil..."
          style={{
            width: '100%',
            padding: '16px 20px',
            background: 'rgba(0, 0, 0, 0.3)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '12px',
            color: '#fff',
            fontSize: '16px',
            outline: 'none',
            transition: 'all 0.2s ease',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = '#10b981';
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.3)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        />

        {/* AI Indicator - THE MAGIC SPARKLE ✨ */}
        {input.length > 0 && (
          <div style={{
            position: 'absolute',
            right: '16px',
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: '12px',
            color: '#10b981',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            animation: 'pulse 2s ease-in-out infinite',
          }}>
            <span style={{ animation: 'sparkle 1.5s ease-in-out infinite' }}>✨</span>
            <span>AI analyzing...</span>
          </div>
        )}

        {/* Suggestions Dropdown */}
        {showSuggestions && (
          <MealSuggestions
            suggestions={suggestions}
            onSelect={handleSuggestionClick}
          />
        )}
      </div>

      {/* Parsed Items Preview - INSTANT FEEDBACK! */}
      {parsedItems.length > 0 && (
        <div style={{
          marginTop: '20px',
          padding: '16px',
          background: 'rgba(0, 0, 0, 0.2)',
          borderRadius: '12px',
          animation: 'fadeIn 0.3s ease',
        }}>
          <div style={{
            fontSize: '13px',
            fontWeight: '600',
            color: 'rgba(255, 255, 255, 0.7)',
            marginBottom: '12px',
          }}>
            Detected Items:
          </div>

          <div style={{ display: 'grid', gap: '8px' }}>
            {parsedItems.map((item, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 12px',
                  background: 'rgba(16, 185, 129, 0.1)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  animation: `slideIn 0.3s ease ${index * 0.05}s both`,
                }}
              >
                <div>
                  <span style={{ fontWeight: '500', color: '#fff' }}>{item.displayName}</span>
                  <span style={{
                    marginLeft: '8px',
                    fontSize: '12px',
                    color: 'rgba(255, 255, 255, 0.5)',
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

          {/* Total */}
          <div style={{
            marginTop: '12px',
            paddingTop: '12px',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <div style={{ fontSize: '15px', fontWeight: '600', color: '#fff' }}>
              Total:
            </div>
            <div style={{
              fontSize: '20px',
              fontWeight: 'bold',
              color: '#10b981',
            }}>
              {Math.round(totalCalories)} calories
            </div>
          </div>
        </div>
      )}

      {/* Submit Button */}
      {parsedItems.length > 0 && (
        <button
          onClick={handleSubmit}
          disabled={isProcessing}
          style={{
            width: '100%',
            marginTop: '16px',
            padding: '14px',
            background: isProcessing
              ? 'rgba(16, 185, 129, 0.3)'
              : 'linear-gradient(135deg, #10b981, #059669)',
            border: 'none',
            borderRadius: '12px',
            color: '#fff',
            fontSize: '15px',
            fontWeight: '600',
            cursor: isProcessing ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            opacity: isProcessing ? 0.7 : 1,
          }}
          onMouseEnter={(e) => {
            if (!isProcessing) {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.4)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          {isProcessing ? 'Saving...' : '✓ Log Meal'}
        </button>
      )}

      {/* Add CSS animations */}
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.6;
          }
        }

        @keyframes sparkle {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.2);
          }
        }
      `}</style>
    </div>
  );
}
