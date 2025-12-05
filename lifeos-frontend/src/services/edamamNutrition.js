/**
 * Edamam Nutrition Analysis API via RapidAPI
 * Good for parsing natural language food descriptions
 * Free tier: 100 calls/month - use sparingly as fallback
 *
 * Store your API key in .env as VITE_RAPIDAPI_KEY
 */

const RAPIDAPI_HOST = 'edamam-edamam-nutrition-analysis.p.rapidapi.com';

/**
 * Get API key from environment
 */
function getApiKey() {
  // Try environment variable first, fall back to hardcoded (not recommended for production)
  return import.meta.env.VITE_RAPIDAPI_KEY || null;
}

/**
 * Analyze nutrition for a natural language food description
 * @param {string} ingredient - e.g., "1 cup of cooked rice" or "100g chicken breast"
 * @returns {Promise<object|null>} - Normalized nutrition data
 */
export async function analyzeIngredient(ingredient) {
  const apiKey = getApiKey();

  if (!apiKey) {
    console.warn('Edamam API key not configured. Set VITE_RAPIDAPI_KEY in .env');
    return null;
  }

  try {
    const url = `https://${RAPIDAPI_HOST}/api/nutrition-data?ingr=${encodeURIComponent(ingredient)}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': RAPIDAPI_HOST,
      },
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.warn('Edamam API rate limit reached');
      }
      return null;
    }

    const data = await response.json();

    // Check if we got valid nutrition data
    if (!data || data.calories === 0 && data.totalWeight === 0) {
      return null;
    }

    return normalizeEdamamData(data, ingredient);
  } catch (error) {
    console.error('Edamam API error:', error);
    return null;
  }
}

/**
 * Analyze a full recipe with multiple ingredients
 * @param {string[]} ingredients - Array of ingredient strings
 * @returns {Promise<object|null>} - Combined nutrition data
 */
export async function analyzeRecipe(ingredients) {
  const apiKey = getApiKey();

  if (!apiKey) {
    console.warn('Edamam API key not configured');
    return null;
  }

  try {
    const url = `https://${RAPIDAPI_HOST}/api/nutrition-details`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': RAPIDAPI_HOST,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ingr: ingredients,
      }),
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return normalizeEdamamData(data, ingredients.join(', '));
  } catch (error) {
    console.error('Edamam recipe analysis error:', error);
    return null;
  }
}

/**
 * Normalize Edamam API response to our standard format
 */
function normalizeEdamamData(data, originalInput) {
  const nutrients = data.totalNutrients || {};
  const daily = data.totalDaily || {};

  // Helper to safely get nutrient value
  const get = (key, fallback = 0) => {
    return nutrients[key]?.quantity || fallback;
  };

  return {
    food: originalInput,
    grams: Math.round(data.totalWeight || 100),
    servingSize: `${Math.round(data.totalWeight || 100)}g`,

    // Macros
    calories: Math.round(data.calories || 0),
    protein: Math.round(get('PROCNT') * 10) / 10,
    carbs: Math.round(get('CHOCDF') * 10) / 10,
    fat: Math.round(get('FAT') * 10) / 10,
    fiber: Math.round(get('FIBTG') * 10) / 10,
    sugar: Math.round(get('SUGAR') * 10) / 10,

    // Fat breakdown
    saturatedFat: Math.round(get('FASAT') * 10) / 10,
    transFat: Math.round(get('FATRN') * 10) / 10,
    cholesterol: Math.round(get('CHOLE')),

    // Minerals
    sodium: Math.round(get('NA')),
    potassium: Math.round(get('K')),
    calcium: Math.round(get('CA')),
    iron: Math.round(get('FE') * 10) / 10,
    magnesium: Math.round(get('MG')),
    phosphorus: Math.round(get('P')),
    zinc: Math.round(get('ZN') * 10) / 10,

    // Vitamins
    vitaminA: Math.round(get('VITA_RAE')),
    vitaminC: Math.round(get('VITC') * 10) / 10,
    vitaminD: Math.round(get('VITD') * 10) / 10,
    vitaminE: Math.round(get('TOCPHA') * 10) / 10,
    vitaminK: Math.round(get('VITK1') * 10) / 10,
    vitaminB6: Math.round(get('VITB6A') * 100) / 100,
    vitaminB12: Math.round(get('VITB12') * 100) / 100,
    folate: Math.round(get('FOLDFE')),

    // Metadata
    source: 'edamam',
    dietLabels: data.dietLabels || [],
    healthLabels: data.healthLabels || [],
    cautions: data.cautions || [],

    // Daily value percentages (useful for UI)
    dailyValues: {
      protein: Math.round(daily.PROCNT?.quantity || 0),
      carbs: Math.round(daily.CHOCDF?.quantity || 0),
      fat: Math.round(daily.FAT?.quantity || 0),
      fiber: Math.round(daily.FIBTG?.quantity || 0),
      sodium: Math.round(daily.NA?.quantity || 0),
      calcium: Math.round(daily.CA?.quantity || 0),
      iron: Math.round(daily.FE?.quantity || 0),
      vitaminA: Math.round(daily.VITA_RAE?.quantity || 0),
      vitaminC: Math.round(daily.VITC?.quantity || 0),
    },
  };
}

/**
 * Check if Edamam API is configured and available
 */
export function isEdamamConfigured() {
  return !!getApiKey();
}

export default {
  analyzeIngredient,
  analyzeRecipe,
  isEdamamConfigured,
};
