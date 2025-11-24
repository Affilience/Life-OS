/**
 * NutritionLogger - Natural language food input with FatSecret API
 * Type naturally like "2 scrambled eggs" and get instant calorie/nutrient breakdown
 */

import { useState, useEffect } from 'react';
import { Search, Plus, X, Loader2, AlertCircle } from 'lucide-react';
import { searchMockFoods, parseNutrients } from '../../services/nutritionMockData';
import { haptics } from '../../utils/haptics';

export default function NutritionLogger({ onAddFood }) {
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);
  const [selectedFood, setSelectedFood] = useState(null);

  // Debounced search - DISABLED due to CORS (needs backend proxy)
  // TODO: Implement backend proxy for FatSecret API
  // useEffect(() => {
  //   if (query.trim().length < 2) {
  //     setResults([]);
  //     return;
  //   }

  //   const timeoutId = setTimeout(() => {
  //     handleSearch();
  //   }, 500);

  //   return () => clearTimeout(timeoutId);
  // }, [query]);

  const handleSearch = async () => {
    setSearching(true);
    setError(null);

    try {
      // Simulate API delay for realistic UX
      await new Promise(resolve => setTimeout(resolve, 300));

      const foods = searchMockFoods(query, 10);

      // Parse nutrients for each food
      const foodsWithNutrients = foods.map(food => ({
        ...food,
        nutrients: parseNutrients(food.description),
      }));

      setResults(foodsWithNutrients);

      if (foodsWithNutrients.length === 0) {
        setError('No foods found. Try: eggs, chicken, banana, rice, etc.');
      }
    } catch (err) {
      console.error('Search failed:', err);
      setError('Search failed. Please try again.');
      await haptics.error();
    } finally {
      setSearching(false);
    }
  };

  const handleSelectFood = async (food) => {
    await haptics.light();
    setSelectedFood(food);
  };

  const handleAddFood = async () => {
    if (!selectedFood) return;

    await haptics.success();
    await haptics.medium();

    onAddFood?.({
      id: `food-${Date.now()}`,
      name: selectedFood.name,
      brand: selectedFood.brand,
      ...selectedFood.nutrients,
      timestamp: new Date().toISOString(),
    });

    // Reset form
    setQuery('');
    setResults([]);
    setSelectedFood(null);
  };

  const handleClear = async () => {
    await haptics.light();
    setQuery('');
    setResults([]);
    setSelectedFood(null);
    setError(null);
  };

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.02)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '16px',
      padding: '24px',
      marginBottom: '24px',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '20px',
      }}>
        <div style={{ fontSize: '24px' }}>🍎</div>
        <div>
          <div style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#fff',
          }}>
            Log Food
          </div>
          <div style={{
            fontSize: '13px',
            color: 'rgba(255, 255, 255, 0.5)',
          }}>
            Try: eggs, chicken, banana, rice, protein shake, etc.
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div style={{
        position: 'relative',
        marginBottom: '16px',
      }}>
        <div style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
        }}>
          <Search
            size={20}
            style={{
              position: 'absolute',
              left: '16px',
              color: 'rgba(255, 255, 255, 0.4)',
            }}
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && query.trim()) {
                handleSearch();
              }
            }}
            placeholder="Search for food... (e.g., 'eggs', 'chicken')"
            style={{
              width: '100%',
              padding: '14px 48px 14px 48px',
              background: 'rgba(0, 0, 0, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              color: '#fff',
              fontSize: '15px',
              outline: 'none',
            }}
            autoFocus
          />
          {query && (
            <button
              onClick={handleClear}
              style={{
                position: 'absolute',
                right: '12px',
                padding: '4px',
                background: 'transparent',
                border: 'none',
                color: 'rgba(255, 255, 255, 0.4)',
                cursor: 'pointer',
              }}
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Loading Indicator */}
        {searching && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginTop: '12px',
            color: 'rgba(255, 255, 255, 0.5)',
            fontSize: '14px',
          }}>
            <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
            Searching...
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginTop: '12px',
            padding: '12px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: '8px',
            color: '#ef4444',
            fontSize: '14px',
          }}>
            <AlertCircle size={16} />
            {error}
          </div>
        )}
      </div>

      {/* Search Results */}
      {results.length > 0 && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          maxHeight: '400px',
          overflowY: 'auto',
          marginBottom: '16px',
        }}>
          {results.map((food) => (
            <button
              key={food.id}
              onClick={() => handleSelectFood(food)}
              style={{
                padding: '16px',
                background: selectedFood?.id === food.id
                  ? 'rgba(16, 185, 129, 0.15)'
                  : 'rgba(0, 0, 0, 0.3)',
                border: selectedFood?.id === food.id
                  ? '2px solid rgba(16, 185, 129, 0.4)'
                  : '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                if (selectedFood?.id !== food.id) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedFood?.id !== food.id) {
                  e.currentTarget.style.background = 'rgba(0, 0, 0, 0.3)';
                }
              }}
            >
              {/* Food Name */}
              <div style={{
                fontSize: '15px',
                fontWeight: '600',
                color: '#fff',
                marginBottom: '4px',
              }}>
                {food.name}
                {food.brand && (
                  <span style={{
                    marginLeft: '8px',
                    fontSize: '13px',
                    fontWeight: '400',
                    color: 'rgba(255, 255, 255, 0.5)',
                  }}>
                    • {food.brand}
                  </span>
                )}
              </div>

              {/* Serving Size */}
              {food.nutrients.serving && (
                <div style={{
                  fontSize: '13px',
                  color: 'rgba(255, 255, 255, 0.5)',
                  marginBottom: '8px',
                }}>
                  {food.nutrients.serving}
                </div>
              )}

              {/* Macros */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '12px',
              }}>
                <div>
                  <div style={{
                    fontSize: '11px',
                    color: 'rgba(255, 255, 255, 0.4)',
                    marginBottom: '2px',
                  }}>
                    Calories
                  </div>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: '#10b981',
                  }}>
                    {Math.round(food.nutrients.calories)}
                  </div>
                </div>

                <div>
                  <div style={{
                    fontSize: '11px',
                    color: 'rgba(255, 255, 255, 0.4)',
                    marginBottom: '2px',
                  }}>
                    Protein
                  </div>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: '#3b82f6',
                  }}>
                    {food.nutrients.protein}g
                  </div>
                </div>

                <div>
                  <div style={{
                    fontSize: '11px',
                    color: 'rgba(255, 255, 255, 0.4)',
                    marginBottom: '2px',
                  }}>
                    Carbs
                  </div>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: '#f59e0b',
                  }}>
                    {food.nutrients.carbs}g
                  </div>
                </div>

                <div>
                  <div style={{
                    fontSize: '11px',
                    color: 'rgba(255, 255, 255, 0.4)',
                    marginBottom: '2px',
                  }}>
                    Fat
                  </div>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: '#ef4444',
                  }}>
                    {food.nutrients.fat}g
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Add Button */}
      {selectedFood && (
        <button
          onClick={handleAddFood}
          style={{
            width: '100%',
            padding: '14px',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            border: 'none',
            borderRadius: '12px',
            color: '#fff',
            fontSize: '15px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <Plus size={18} />
          Add Food
        </button>
      )}

      {/* Animation keyframes */}
      <style>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
