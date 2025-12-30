/**
 * Edamam Food Database API Service
 *
 * Provides nutrition data lookup using Edamam's comprehensive food database.
 * Supports natural language food parsing, barcode lookup, and detailed nutrition info.
 *
 * API Documentation: https://developer.edamam.com/food-database-api-docs
 */

// Edamam API credentials
const EDAMAM_APP_ID = '7dd08cc6';
const EDAMAM_APP_KEY = 'f8016819bc9abee5d45899412e96ba25';
const BASE_URL = 'https://api.edamam.com/api/food-database/v2';

// Nutrient code mappings (Edamam uses specific codes)
const NUTRIENT_CODES = {
  ENERC_KCAL: 'calories',
  PROCNT: 'protein',
  FAT: 'fat',
  CHOCDF: 'carbs',
  FIBTG: 'fiber',
  SUGAR: 'sugar',
  FASAT: 'saturatedFat',
  FATRN: 'transFat',
  CHOLE: 'cholesterol',
  NA: 'sodium',
  K: 'potassium',
  CA: 'calcium',
  FE: 'iron',
  MG: 'magnesium',
  P: 'phosphorus',
  ZN: 'zinc',
  VITA_RAE: 'vitaminA',
  VITC: 'vitaminC',
  VITD: 'vitaminD',
  TOCPHA: 'vitaminE',
  VITK1: 'vitaminK',
  VITB6A: 'vitaminB6',
  VITB12: 'vitaminB12',
  FOLDFE: 'folate',
};

// Simple quantity parsing patterns
const QUANTITY_PATTERNS = [
  // "2 eggs", "3 slices"
  { regex: /^(\d+(?:\.\d+)?)\s+(.+)$/i, extract: (m) => ({ amount: parseFloat(m[1]), food: m[2] }) },
  // "half an apple", "a chicken breast"
  { regex: /^(half|a|an|one|two|three|four|five|six)\s+(.+)$/i, extract: (m) => ({ amount: wordToNumber(m[1]), food: m[2] }) },
  // "100g chicken", "200ml milk"
  { regex: /^(\d+(?:\.\d+)?)\s*(g|grams?|oz|ounces?|ml|cups?|tbsp|tsp|lb|pound)\s+(?:of\s+)?(.+)$/i, extract: (m) => ({ amount: parseFloat(m[1]), unit: m[2], food: m[3] }) },
  // Just food name
  { regex: /^(.+)$/, extract: (m) => ({ amount: 1, food: m[1] }) },
];

function wordToNumber(word) {
  const map = { half: 0.5, a: 1, an: 1, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6 };
  return map[word.toLowerCase()] || 1;
}

/**
 * Parse a simple food input string to extract quantity and food name
 */
function parseQuantityAndFood(input) {
  const trimmed = input.trim().toLowerCase();

  for (const pattern of QUANTITY_PATTERNS) {
    const match = trimmed.match(pattern.regex);
    if (match) {
      return pattern.extract(match);
    }
  }

  return { amount: 1, food: trimmed };
}

/**
 * Convert Edamam nutrients object to our standard format
 */
function convertNutrients(nutrients, multiplier = 1) {
  const result = {};

  for (const [edamamCode, ourKey] of Object.entries(NUTRIENT_CODES)) {
    if (nutrients[edamamCode] !== undefined) {
      const value = nutrients[edamamCode] * multiplier;
      // Round appropriately based on nutrient type
      if (ourKey === 'calories' || ourKey === 'sodium' || ourKey === 'potassium' ||
          ourKey === 'calcium' || ourKey === 'cholesterol' || ourKey === 'magnesium' ||
          ourKey === 'phosphorus' || ourKey === 'vitaminA' || ourKey === 'folate') {
        result[ourKey] = Math.round(value);
      } else {
        result[ourKey] = Math.round(value * 10) / 10;
      }
    } else {
      result[ourKey] = 0;
    }
  }

  return result;
}

/**
 * Find the best measure for a given unit or default to serving
 */
function findBestMeasure(measures, requestedUnit) {
  if (!measures || measures.length === 0) return null;

  const unitMap = {
    'g': 'Gram',
    'gram': 'Gram',
    'grams': 'Gram',
    'oz': 'Ounce',
    'ounce': 'Ounce',
    'ounces': 'Ounce',
    'cup': 'Cup',
    'cups': 'Cup',
    'tbsp': 'Tablespoon',
    'tsp': 'Teaspoon',
    'lb': 'Pound',
    'pound': 'Pound',
    'slice': 'Slice',
    'slices': 'Slice',
    'piece': 'Piece',
    'pieces': 'Piece',
    'serving': 'Serving',
    'ml': 'Gram', // Approximate ml as grams for liquids
  };

  const targetLabel = unitMap[requestedUnit?.toLowerCase()];

  if (targetLabel) {
    const match = measures.find(m => m.label === targetLabel);
    if (match) return match;
  }

  // Default priority: Serving > Whole > Piece > first available
  const priorities = ['Serving', 'Whole', 'Piece', 'Unit'];
  for (const priority of priorities) {
    const match = measures.find(m => m.label === priority);
    if (match) return match;
  }

  return measures[0];
}

/**
 * Search for a food item using Edamam's parser endpoint
 * @param {string} query - Food search query (natural language)
 * @returns {Promise<object>} - Search results with parsed foods and hints
 */
export async function searchFood(query) {
  const url = new URL(`${BASE_URL}/parser`);
  url.searchParams.set('app_id', EDAMAM_APP_ID);
  url.searchParams.set('app_key', EDAMAM_APP_KEY);
  url.searchParams.set('ingr', query);
  url.searchParams.set('nutrition-type', 'logging');

  const response = await fetch(url.toString());

  if (!response.ok) {
    const error = await response.text();
    console.error('[Edamam] Search error:', error);
    throw new Error(`Edamam API error: ${response.status}`);
  }

  return response.json();
}

/**
 * Get detailed nutrition for a specific food with quantity
 * @param {string} foodId - Edamam food ID
 * @param {string} measureUri - Measure URI (e.g., gram, cup, serving)
 * @param {number} quantity - Amount of the measure
 * @returns {Promise<object>} - Detailed nutrition data
 */
export async function getNutrients(foodId, measureUri, quantity = 1) {
  const url = new URL(`${BASE_URL}/nutrients`);
  url.searchParams.set('app_id', EDAMAM_APP_ID);
  url.searchParams.set('app_key', EDAMAM_APP_KEY);

  const response = await fetch(url.toString(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ingredients: [{
        quantity,
        measureURI: measureUri,
        foodId,
      }],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('[Edamam] Nutrients error:', error);
    throw new Error(`Edamam API error: ${response.status}`);
  }

  return response.json();
}

/**
 * Parse a single food item and get its nutrition
 * @param {string} foodInput - Food description (e.g., "2 eggs", "100g chicken breast")
 * @returns {Promise<object>} - Nutrition data for the food item
 */
export async function parseFoodItem(foodInput) {
  const { amount, unit, food } = parseQuantityAndFood(foodInput);

  // Search for the food
  const searchResult = await searchFood(food);

  // Get the best match (parsed has exact matches, hints has similar)
  let bestMatch = null;
  let measures = [];

  if (searchResult.parsed && searchResult.parsed.length > 0) {
    bestMatch = searchResult.parsed[0].food;
    // Get measures from hints for the same food
    const matchingHint = searchResult.hints?.find(h => h.food.foodId === bestMatch.foodId);
    measures = matchingHint?.measures || [];
  } else if (searchResult.hints && searchResult.hints.length > 0) {
    bestMatch = searchResult.hints[0].food;
    measures = searchResult.hints[0].measures || [];
  }

  if (!bestMatch) {
    return {
      success: false,
      food: foodInput,
      error: 'Food not found',
    };
  }

  // Find the best measure for the requested unit
  const measure = findBestMeasure(measures, unit);

  // Calculate nutrition based on amount and measure
  let nutrients;
  let grams;

  if (unit === 'g' || unit === 'gram' || unit === 'grams') {
    // Direct gram calculation from per-100g data
    const multiplier = amount / 100;
    nutrients = convertNutrients(bestMatch.nutrients, multiplier);
    grams = amount;
  } else if (measure) {
    // Use measure weight to calculate
    grams = measure.weight * amount;
    const multiplier = grams / 100;
    nutrients = convertNutrients(bestMatch.nutrients, multiplier);
  } else {
    // Fallback to per-100g
    nutrients = convertNutrients(bestMatch.nutrients, 1);
    grams = 100;
  }

  return {
    success: true,
    food: bestMatch.label,
    foodId: bestMatch.foodId,
    category: bestMatch.category,
    image: bestMatch.image,
    amount,
    unit: unit || measure?.label || 'serving',
    grams: Math.round(grams),
    ...nutrients,
    source: 'edamam',
  };
}

/**
 * Parse a full meal description with multiple foods
 * @param {string} mealDescription - Full meal description (e.g., "2 eggs with toast and coffee")
 * @returns {Promise<object>} - Complete nutrition breakdown
 */
export async function parseMeal(mealDescription) {
  if (!mealDescription || typeof mealDescription !== 'string') {
    throw new Error('Meal description is required');
  }

  const trimmed = mealDescription.trim();
  if (trimmed.length < 2) {
    throw new Error('Meal description is too short');
  }

  // Split meal into individual items
  // Handle: "2 eggs, toast, and coffee" or "2 eggs with toast and coffee"
  const items = trimmed
    .split(/\s*,\s*|\s+and\s+|\s+with\s+|\s+\+\s+/i)
    .map(s => s.trim())
    .filter(s => s.length > 0);

  const results = [];
  const notFound = [];

  // Process each item in parallel for speed
  const promises = items.map(async (item) => {
    try {
      const result = await parseFoodItem(item);
      if (result.success) {
        return { type: 'success', data: result };
      } else {
        return { type: 'notFound', item };
      }
    } catch (err) {
      console.warn(`[Edamam] Failed to parse "${item}":`, err.message);
      return { type: 'error', item, error: err.message };
    }
  });

  const resolved = await Promise.all(promises);

  for (const res of resolved) {
    if (res.type === 'success') {
      results.push(res.data);
    } else {
      notFound.push(res.item);
    }
  }

  if (results.length === 0) {
    return {
      success: false,
      error: 'Could not find any foods in the description',
      notFound,
    };
  }

  // Calculate totals
  const totals = calculateTotals(results);

  return {
    success: true,
    items: results,
    totals,
    notFound: notFound.length > 0 ? notFound : undefined,
    source: 'edamam',
    dataSources: { edamam: results.length },
  };
}

/**
 * Calculate totals from nutrition items
 */
function calculateTotals(items) {
  const sumInt = (key) => items.reduce((sum, n) => sum + (n[key] || 0), 0);
  const sumRound = (key, decimals = 1) => {
    const total = items.reduce((sum, n) => sum + (n[key] || 0), 0);
    return Math.round(total * Math.pow(10, decimals)) / Math.pow(10, decimals);
  };

  return {
    calories: sumInt('calories'),
    protein: sumRound('protein'),
    carbs: sumRound('carbs'),
    fat: sumRound('fat'),
    fiber: sumRound('fiber'),
    sugar: sumRound('sugar'),
    saturatedFat: sumRound('saturatedFat'),
    transFat: sumRound('transFat'),
    cholesterol: sumInt('cholesterol'),
    sodium: sumInt('sodium'),
    potassium: sumInt('potassium'),
    calcium: sumInt('calcium'),
    iron: sumRound('iron'),
    magnesium: sumInt('magnesium'),
    phosphorus: sumInt('phosphorus'),
    zinc: sumRound('zinc'),
    vitaminA: sumInt('vitaminA'),
    vitaminC: sumRound('vitaminC'),
    vitaminD: sumRound('vitaminD', 2),
    vitaminE: sumRound('vitaminE'),
    vitaminK: sumRound('vitaminK'),
    vitaminB6: sumRound('vitaminB6', 2),
    vitaminB12: sumRound('vitaminB12', 2),
    folate: sumInt('folate'),
  };
}

/**
 * Search for food suggestions (autocomplete)
 * @param {string} query - Partial search query
 * @param {number} limit - Max results to return
 * @returns {Promise<Array>} - Array of food suggestions
 */
export async function getAutocompleteSuggestions(query, limit = 5) {
  if (!query || query.length < 2) return [];

  try {
    const searchResult = await searchFood(query);

    const suggestions = [];
    const seen = new Set();

    // Add parsed results first (exact matches)
    if (searchResult.parsed) {
      for (const item of searchResult.parsed) {
        if (!seen.has(item.food.foodId)) {
          seen.add(item.food.foodId);
          suggestions.push({
            name: item.food.label,
            foodId: item.food.foodId,
            calories: Math.round(item.food.nutrients.ENERC_KCAL || 0),
            category: item.food.category,
            image: item.food.image,
          });
        }
      }
    }

    // Add hints (similar matches)
    if (searchResult.hints) {
      for (const hint of searchResult.hints) {
        if (suggestions.length >= limit) break;
        if (!seen.has(hint.food.foodId)) {
          seen.add(hint.food.foodId);
          suggestions.push({
            name: hint.food.label,
            foodId: hint.food.foodId,
            calories: Math.round(hint.food.nutrients.ENERC_KCAL || 0),
            category: hint.food.category,
            image: hint.food.image,
          });
        }
      }
    }

    return suggestions.slice(0, limit);
  } catch (err) {
    console.warn('[Edamam] Autocomplete error:', err);
    return [];
  }
}

/**
 * Lookup food by barcode (UPC/EAN)
 * @param {string} barcode - Product barcode
 * @returns {Promise<object>} - Product nutrition data
 */
export async function lookupBarcode(barcode) {
  const url = new URL(`${BASE_URL}/parser`);
  url.searchParams.set('app_id', EDAMAM_APP_ID);
  url.searchParams.set('app_key', EDAMAM_APP_KEY);
  url.searchParams.set('upc', barcode);
  url.searchParams.set('nutrition-type', 'logging');

  const response = await fetch(url.toString());

  if (!response.ok) {
    console.error('[Edamam] Barcode lookup error:', response.status);
    return null;
  }

  const data = await response.json();

  if (data.hints && data.hints.length > 0) {
    const food = data.hints[0].food;
    const nutrients = convertNutrients(food.nutrients, 1);

    return {
      success: true,
      food: food.label,
      brand: food.brand,
      foodId: food.foodId,
      category: food.category,
      image: food.image,
      servingSize: food.servingSizes?.[0]?.label,
      barcode,
      ...nutrients,
      source: 'edamam',
    };
  }

  return null;
}

// Export a test function to verify API connectivity
export async function testConnection() {
  try {
    const result = await searchFood('apple');
    return {
      success: true,
      message: 'Edamam API connected',
      sampleResult: result.parsed?.[0]?.food?.label,
    };
  } catch (err) {
    return {
      success: false,
      error: err.message,
    };
  }
}
