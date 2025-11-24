import { FOOD_DATABASE, QUANTITY_PATTERNS, COOKING_METHODS } from '../data/nutritionData';

/**
 * Parse natural language meal input into structured data
 * Example: "grilled chicken breast with rice and broccoli"
 * Returns: Array of food items with estimated calories
 */
export function parseMealInput(input) {
  if (!input || typeof input !== 'string') return [];

  const lowerInput = input.toLowerCase().trim();
  const items = [];

  // Step 1: Split by common separators
  const segments = lowerInput.split(/\band\b|,|with|\+/).map(s => s.trim());

  // Step 2: Process each segment
  segments.forEach(segment => {
    if (!segment) return;

    // Extract quantity modifier
    let quantityMultiplier = 1.0;
    let cleanSegment = segment;

    for (const [pattern, multiplier] of Object.entries(QUANTITY_PATTERNS)) {
      const regex = new RegExp(`\\b${pattern}\\b`, 'i');
      if (regex.test(segment)) {
        quantityMultiplier = multiplier;
        cleanSegment = segment.replace(regex, '').trim();
        break;
      }
    }

    // Extract cooking method
    let cookingMultiplier = 1.0;
    for (const [method, multiplier] of Object.entries(COOKING_METHODS)) {
      const regex = new RegExp(`\\b${method}\\b`, 'i');
      if (regex.test(cleanSegment)) {
        cookingMultiplier = multiplier;
        cleanSegment = cleanSegment.replace(regex, '').trim();
        break;
      }
    }

    // Find matching food in database
    let matchedFood = null;
    let matchedName = '';

    // Try exact match first
    for (const [foodName, nutrition] of Object.entries(FOOD_DATABASE)) {
      if (cleanSegment.includes(foodName)) {
        matchedFood = nutrition;
        matchedName = foodName;
        break;
      }
    }

    // If found, calculate totals
    if (matchedFood) {
      const totalMultiplier = quantityMultiplier * cookingMultiplier;

      items.push({
        name: matchedName,
        displayName: segment, // Keep original text
        calories: Math.round(matchedFood.calories * totalMultiplier),
        protein: Math.round(matchedFood.protein * totalMultiplier * 10) / 10,
        carbs: Math.round(matchedFood.carbs * totalMultiplier * 10) / 10,
        fat: Math.round(matchedFood.fat * totalMultiplier * 10) / 10,
        quantity: matchedFood.serving,
        multiplier: totalMultiplier,
      });
    }
  });

  return items;
}

/**
 * Get suggestions based on partial input
 */
export function getMealSuggestions(input) {
  if (!input || input.length < 2) return [];

  const lowerInput = input.toLowerCase();
  const suggestions = [];

  for (const [foodName, nutrition] of Object.entries(FOOD_DATABASE)) {
    if (foodName.includes(lowerInput)) {
      suggestions.push({
        name: foodName,
        calories: nutrition.calories,
        serving: nutrition.serving,
        displayText: `${foodName} (${nutrition.calories} cal)`,
      });
    }

    if (suggestions.length >= 8) break;
  }

  return suggestions;
}

/**
 * Detect meal type based on time of day
 */
export function detectMealType() {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 11) return 'breakfast';
  if (hour >= 11 && hour < 15) return 'lunch';
  if (hour >= 15 && hour < 18) return 'snack';
  if (hour >= 18 && hour < 23) return 'dinner';
  return 'snack';
}

/**
 * Generate quick meal suggestions based on meal type
 */
export function getQuickMealSuggestions(mealType) {
  const suggestions = {
    breakfast: [
      'oatmeal with berries',
      'eggs and toast',
      'protein shake and banana',
      'greek yogurt with granola',
      'avocado toast',
      'smoothie bowl',
    ],
    lunch: [
      'chicken salad',
      'turkey sandwich',
      'salmon with rice',
      'pasta with vegetables',
      'burrito bowl',
      'wrap with chicken',
    ],
    dinner: [
      'grilled chicken with vegetables',
      'salmon with sweet potato',
      'beef stir fry with rice',
      'turkey and quinoa bowl',
      'steak with broccoli',
      'pasta with chicken',
    ],
    snack: [
      'apple with peanut butter',
      'protein bar',
      'almonds',
      'greek yogurt',
      'banana',
      'carrots',
    ],
  };

  return suggestions[mealType] || suggestions.snack;
}
