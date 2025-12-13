/**
 * SmartMealLogger - Natural language meal input with AI parsing
 * Type meals like "2 eggs with toast and coffee" and get instant nutrition breakdown
 * Uses Claude Haiku for parsing + USDA FoodData Central for nutrition data
 */

import { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Loader2, Check, AlertCircle, ChevronDown, ChevronUp, X, Zap } from 'lucide-react';
import { parseNutrition, getQuickSuggestions, detectMealType } from '../../services/nutritionAI';
import { haptics } from '../../utils/haptics';

// Meal type options
const MEAL_TYPES = [
  { value: 'breakfast', label: 'Breakfast', icon: '🌅' },
  { value: 'lunch', label: 'Lunch', icon: '☀️' },
  { value: 'dinner', label: 'Dinner', icon: '🌙' },
  { value: 'snack', label: 'Snack', icon: '🍎' },
];

// Example meals for inspiration
const EXAMPLE_MEALS = {
  breakfast: ['2 scrambled eggs with toast', 'oatmeal with banana and honey', 'greek yogurt with berries', 'protein shake with banana'],
  lunch: ['grilled chicken salad', 'turkey sandwich with chips', 'salmon with rice and broccoli', 'burrito bowl with chicken'],
  dinner: ['steak with mashed potatoes', '8oz salmon with asparagus', 'pasta with chicken and vegetables', 'beef stir fry with rice'],
  snack: ['apple with peanut butter', 'protein bar', 'handful of almonds', 'greek yogurt'],
};

export default function SmartMealLogger({ onMealLogged }) {
  const [input, setInput] = useState('');
  const [mealType, setMealType] = useState(detectMealType());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const inputRef = useRef(null);

  // Update suggestions as user types
  useEffect(() => {
    if (input.length >= 2 && !isLoading) {
      const quickSuggestions = getQuickSuggestions(input);
      setSuggestions(quickSuggestions);
    } else {
      setSuggestions([]);
    }
  }, [input, isLoading]);

  // Auto-detect meal type on mount
  useEffect(() => {
    setMealType(detectMealType());
  }, []);

  const handleSubmit = async (e) => {
    e?.preventDefault();

    if (!input.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setResult(null);
    setSuggestions([]);

    try {
      await haptics.light();

      const nutritionData = await parseNutrition(input);

      if (nutritionData.success) {
        setResult(nutritionData);
        await haptics.success();
      } else {
        throw new Error(nutritionData.error || 'Failed to parse meal');
      }
    } catch (err) {
      console.error('Parse error:', err);
      setError(err.message || 'Failed to analyze meal. Please try again.');
      await haptics.error();
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmMeal = async () => {
    if (!result) return;

    await haptics.medium();

    // Create meal object for health store (includes all micronutrients)
    const meal = {
      mealType,
      description: input,
      items: result.items.map(item => ({
        name: item.food,
        calories: item.calories,
        protein: item.protein,
        carbs: item.carbs,
        fat: item.fat,
        fiber: item.fiber,
        sugar: item.sugar,
        // Fat breakdown
        saturatedFat: item.saturatedFat,
        transFat: item.transFat,
        cholesterol: item.cholesterol,
        // Minerals
        sodium: item.sodium,
        potassium: item.potassium,
        calcium: item.calcium,
        iron: item.iron,
        magnesium: item.magnesium,
        phosphorus: item.phosphorus,
        zinc: item.zinc,
        // Vitamins
        vitaminA: item.vitaminA,
        vitaminC: item.vitaminC,
        vitaminD: item.vitaminD,
        vitaminE: item.vitaminE,
        vitaminK: item.vitaminK,
        vitaminB6: item.vitaminB6,
        vitaminB12: item.vitaminB12,
        folate: item.folate,
        amount: item.amount,
        unit: item.unit,
      })),
      // Macro totals
      totalCalories: result.totals.calories,
      totalProtein: result.totals.protein,
      totalCarbs: result.totals.carbs,
      totalFat: result.totals.fat,
      totalFiber: result.totals.fiber,
      totalSugar: result.totals.sugar,
      // Fat breakdown totals
      totalSaturatedFat: result.totals.saturatedFat,
      totalTransFat: result.totals.transFat,
      totalCholesterol: result.totals.cholesterol,
      // Mineral totals
      totalSodium: result.totals.sodium,
      totalPotassium: result.totals.potassium,
      totalCalcium: result.totals.calcium,
      totalIron: result.totals.iron,
      totalMagnesium: result.totals.magnesium,
      totalPhosphorus: result.totals.phosphorus,
      totalZinc: result.totals.zinc,
      // Vitamin totals
      totalVitaminA: result.totals.vitaminA,
      totalVitaminC: result.totals.vitaminC,
      totalVitaminD: result.totals.vitaminD,
      totalVitaminE: result.totals.vitaminE,
      totalVitaminK: result.totals.vitaminK,
      totalVitaminB6: result.totals.vitaminB6,
      totalVitaminB12: result.totals.vitaminB12,
      totalFolate: result.totals.folate,
    };

    onMealLogged?.(meal);

    // Reset form
    setInput('');
    setResult(null);
    setShowDetails(false);
    inputRef.current?.focus();

    await haptics.success();
  };

  const handleSuggestionClick = async (foodName) => {
    await haptics.light();
    setInput(foodName);
    setSuggestions([]);
    inputRef.current?.focus();
  };

  const handleExampleClick = async (example) => {
    await haptics.light();
    setInput(example);
    inputRef.current?.focus();
  };

  const handleClear = async () => {
    await haptics.light();
    setInput('');
    setResult(null);
    setError(null);
    setSuggestions([]);
    inputRef.current?.focus();
  };

  return (
    <div className="bg-surface/50 border border-border-subtle rounded-2xl p-5 mb-5" data-tour="log-meal-btn">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
          <Sparkles size={20} className="text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-fg-primary">Smart Meal Logger</h3>
          <p className="text-sm text-fg-tertiary">Describe your meal naturally - AI handles the rest</p>
        </div>
      </div>

      {/* Meal Type Selector */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
        {MEAL_TYPES.map((type) => (
          <button
            key={type.value}
            onClick={() => setMealType(type.value)}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all flex-1 min-w-[70px] sm:min-w-[80px] sm:flex-none sm:px-4 sm:gap-2 ${
              mealType === type.value
                ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                : 'bg-surface-alt/50 text-fg-secondary hover:bg-surface-alt border border-transparent'
            }`}
          >
            <span className="text-base sm:text-lg">{type.icon}</span>
            <span className="text-xs sm:text-sm">{type.label}</span>
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="relative mb-4">
        <div className="relative">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder={`What did you eat? (e.g., "${EXAMPLE_MEALS[mealType][0]}")`}
            rows={2}
            className="w-full px-4 py-3 pr-24 bg-black/30 border border-white/10 rounded-xl text-fg-primary placeholder-fg-tertiary text-base resize-none focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 transition-all"
            disabled={isLoading}
          />

          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {input && (
              <button
                type="button"
                onClick={handleClear}
                className="p-2 text-fg-tertiary hover:text-fg-secondary transition-colors"
              >
                <X size={18} />
              </button>
            )}
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className={`p-2.5 rounded-lg transition-all ${
                input.trim() && !isLoading
                  ? 'bg-violet-500 text-white hover:bg-violet-400 shadow-lg shadow-violet-500/30'
                  : 'bg-surface-alt text-fg-tertiary cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Send size={18} />
              )}
            </button>
          </div>
        </div>

        {/* Quick Suggestions */}
        {suggestions.length > 0 && (
          <div className="absolute z-10 left-0 right-0 mt-2 bg-surface border border-border-subtle rounded-xl shadow-2xl overflow-hidden">
            {suggestions.map((suggestion, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSuggestionClick(suggestion.name)}
                className="w-full px-4 py-3 text-left hover:bg-violet-500/10 transition-colors flex justify-between items-center border-b border-border-subtle last:border-0"
              >
                <span className="text-fg-primary font-medium capitalize">{suggestion.name}</span>
                <span className="text-fg-tertiary text-sm">{suggestion.calories} cal</span>
              </button>
            ))}
          </div>
        )}
      </form>

      {/* Example Meals */}
      {!result && !isLoading && (
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="text-xs text-fg-tertiary">Try:</span>
          {EXAMPLE_MEALS[mealType].slice(0, 3).map((example, idx) => (
            <button
              key={idx}
              onClick={() => handleExampleClick(example)}
              className="text-xs px-3 py-1.5 bg-surface-alt/50 text-fg-secondary rounded-full hover:bg-violet-500/20 hover:text-violet-300 transition-all"
            >
              {example}
            </button>
          ))}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl mb-4">
          <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-300 font-medium">Couldn't analyze meal</p>
            <p className="text-red-400/70 text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-4">
          {/* Totals Summary */}
          <div className="p-4 bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 border border-violet-500/20 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Zap size={18} className="text-violet-400" />
                <span className="font-semibold text-fg-primary">Nutrition Summary</span>
              </div>
              {result.source && (
                <span className="text-xs px-2 py-1 bg-violet-500/20 text-violet-300 rounded-full">
                  {result.source === 'cache' ? 'Instant' :
                   result.dataSources?.usda > 0 ? 'USDA Data' :
                   result.dataSources?.web > 0 ? 'Web Data' : 'AI Analyzed'}
                </span>
              )}
            </div>

            {/* Main Calories */}
            <div className="text-center mb-4">
              <div className="text-4xl font-bold text-fg-primary">{result.totals.calories}</div>
              <div className="text-sm text-fg-tertiary">calories</div>
            </div>

            {/* Macro Grid */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <div className="text-center p-3 bg-black/20 rounded-lg">
                <div className="text-xl font-bold text-blue-400">{result.totals.protein}g</div>
                <div className="text-xs text-fg-tertiary">Protein</div>
              </div>
              <div className="text-center p-3 bg-black/20 rounded-lg">
                <div className="text-xl font-bold text-amber-400">{result.totals.carbs}g</div>
                <div className="text-xs text-fg-tertiary">Carbs</div>
              </div>
              <div className="text-center p-3 bg-black/20 rounded-lg">
                <div className="text-xl font-bold text-rose-400">{result.totals.fat}g</div>
                <div className="text-xs text-fg-tertiary">Fat</div>
              </div>
            </div>
          </div>

          {/* Expandable Details */}
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full flex items-center justify-between px-4 py-3 bg-surface-alt/50 rounded-xl text-fg-secondary hover:bg-surface-alt transition-colors"
          >
            <span className="text-sm font-medium">
              {result.items.length} item{result.items.length !== 1 ? 's' : ''} breakdown
            </span>
            {showDetails ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>

          {showDetails && (
            <div className="space-y-2">
              {result.items.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-black/20 rounded-lg border border-white/5"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-fg-primary capitalize">
                        {item.food}
                      </span>
                      {item.source && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                          item.source === 'usda' ? 'bg-green-500/20 text-green-400' :
                          item.source === 'web' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-amber-500/20 text-amber-400'
                        }`}>
                          {item.source === 'usda' ? 'USDA' :
                           item.source === 'web' ? 'Web' : 'Est.'}
                        </span>
                      )}
                    </div>
                    <span className="text-fg-secondary font-semibold">
                      {item.calories} cal
                    </span>
                  </div>
                  <div className="flex gap-4 text-xs text-fg-tertiary">
                    <span>P: {item.protein}g</span>
                    <span>C: {item.carbs}g</span>
                    <span>F: {item.fat}g</span>
                    <span className="ml-auto text-fg-quaternary">
                      {item.grams ? `${item.grams}g` :
                       item.amount && item.unit ? `${item.amount} ${item.unit}` : ''}
                    </span>
                  </div>
                </div>
              ))}

              {/* Additional Nutrients */}
              {(result.totals.fiber > 0 || result.totals.sugar > 0 || result.totals.sodium > 0) && (
                <div className="p-3 bg-black/10 rounded-lg">
                  <div className="text-xs text-fg-tertiary mb-2">Additional nutrients</div>
                  <div className="flex gap-4 text-sm text-fg-secondary">
                    {result.totals.fiber > 0 && <span>Fiber: {result.totals.fiber}g</span>}
                    {result.totals.sugar > 0 && <span>Sugar: {result.totals.sugar}g</span>}
                    {result.totals.sodium > 0 && <span>Sodium: {result.totals.sodium}mg</span>}
                  </div>
                </div>
              )}

              {/* Not Found Warning */}
              {result.notFound && result.notFound.length > 0 && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                  <p className="text-xs text-amber-300">
                    Couldn't find: {result.notFound.join(', ')}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Confirm Button */}
          <button
            onClick={handleConfirmMeal}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-semibold rounded-xl hover:from-violet-400 hover:to-fuchsia-400 transition-all shadow-lg shadow-violet-500/30 flex items-center justify-center gap-2"
          >
            <Check size={20} />
            Log This Meal
          </button>
        </div>
      )}
    </div>
  );
}
