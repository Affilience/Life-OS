/**
 * FatSecret API Integration
 * OAuth 2.0 Client Credentials Flow + Natural Language Food Search
 *
 * Docs: https://platform.fatsecret.com/api/Default.aspx?screen=rapiauth2
 */

const CLIENT_ID = import.meta.env.VITE_FATSECRET_CLIENT_ID;
const CLIENT_SECRET = import.meta.env.VITE_FATSECRET_CLIENT_SECRET;
const TOKEN_URL = 'https://oauth.fatsecret.com/connect/token';

// Validate credentials are configured
if (!CLIENT_ID || !CLIENT_SECRET) {
  console.warn('FatSecret API credentials not configured. Set VITE_FATSECRET_CLIENT_ID and VITE_FATSECRET_CLIENT_SECRET in .env');
}
const API_BASE = 'https://platform.fatsecret.com/rest/server.api';

let accessToken = null;
let tokenExpiry = null;

/**
 * Get OAuth 2.0 access token using Client Credentials flow
 */
async function getAccessToken() {
  // Return cached token if still valid
  if (accessToken && tokenExpiry && Date.now() < tokenExpiry) {
    return accessToken;
  }

  try {
    const auth = btoa(`${CLIENT_ID}:${CLIENT_SECRET}`);

    const response = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials&scope=basic',
    });

    if (!response.ok) {
      throw new Error(`Token request failed: ${response.status}`);
    }

    const data = await response.json();
    accessToken = data.access_token;
    // Set expiry 5 minutes before actual expiry for safety
    tokenExpiry = Date.now() + (data.expires_in - 300) * 1000;

    return accessToken;
  } catch (error) {
    console.error('Failed to get access token:', error);
    throw error;
  }
}

/**
 * Make authenticated API request to FatSecret
 */
async function apiRequest(method, params = {}) {
  const token = await getAccessToken();

  const url = new URL(API_BASE);
  url.searchParams.append('method', method);
  url.searchParams.append('format', 'json');

  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });

  const response = await fetch(url.toString(), {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json();
}

/**
 * Search for foods using natural language
 *
 * @param {string} query - Natural language search (e.g., "2 scrambled eggs")
 * @param {number} maxResults - Maximum number of results to return
 * @returns {Promise<Array>} Array of food search results
 *
 * Example response:
 * [
 *   {
 *     food_id: "123",
 *     food_name: "Scrambled Eggs",
 *     food_type: "Generic",
 *     food_description: "Per 2 large - Calories: 180kcal | Fat: 12.2g | Carbs: 1.8g | Protein: 14.2g"
 *   }
 * ]
 */
export async function searchFood(query, maxResults = 20) {
  try {
    const data = await apiRequest('foods.search', {
      search_expression: query,
      max_results: maxResults,
    });

    if (!data.foods || !data.foods.food) {
      return [];
    }

    // Ensure food is always an array
    const foods = Array.isArray(data.foods.food)
      ? data.foods.food
      : [data.foods.food];

    return foods.map(food => ({
      id: food.food_id,
      name: food.food_name,
      type: food.food_type,
      brand: food.brand_name || null,
      description: food.food_description,
    }));
  } catch (error) {
    console.error('Food search failed:', error);
    throw error;
  }
}

/**
 * Get detailed nutrition information for a specific food
 *
 * @param {string} foodId - Food ID from search results
 * @returns {Promise<Object>} Detailed nutrition information
 *
 * Example response:
 * {
 *   food_id: "123",
 *   food_name: "Scrambled Eggs",
 *   servings: {
 *     serving: [
 *       {
 *         serving_id: "456",
 *         serving_description: "2 large",
 *         metric_serving_amount: "122.0",
 *         metric_serving_unit: "g",
 *         calories: "180",
 *         carbohydrate: "1.8",
 *         protein: "14.2",
 *         fat: "12.2",
 *         saturated_fat: "3.8",
 *         cholesterol: "425",
 *         sodium: "350",
 *         fiber: "0",
 *         sugar: "1.4"
 *       }
 *     ]
 *   }
 * }
 */
export async function getFoodDetails(foodId) {
  try {
    const data = await apiRequest('food.get.v2', {
      food_id: foodId,
    });

    return data.food;
  } catch (error) {
    console.error('Failed to get food details:', error);
    throw error;
  }
}

/**
 * Parse food description into structured nutrients
 *
 * @param {string} description - Food description from search results
 * @returns {Object} Parsed nutrition values
 *
 * Example:
 * parseNutrients("Per 2 large - Calories: 180kcal | Fat: 12.2g | Carbs: 1.8g | Protein: 14.2g")
 * // Returns: { calories: 180, fat: 12.2, carbs: 1.8, protein: 14.2, serving: "2 large" }
 */
export function parseNutrients(description) {
  const result = {
    calories: 0,
    fat: 0,
    carbs: 0,
    protein: 0,
    serving: '',
  };

  if (!description) return result;

  // Extract serving size
  const servingMatch = description.match(/Per (.+?) -/);
  if (servingMatch) {
    result.serving = servingMatch[1];
  }

  // Extract nutrients
  const caloriesMatch = description.match(/Calories: ([\d.]+)kcal/);
  const fatMatch = description.match(/Fat: ([\d.]+)g/);
  const carbsMatch = description.match(/Carbs: ([\d.]+)g/);
  const proteinMatch = description.match(/Protein: ([\d.]+)g/);

  if (caloriesMatch) result.calories = parseFloat(caloriesMatch[1]);
  if (fatMatch) result.fat = parseFloat(fatMatch[1]);
  if (carbsMatch) result.carbs = parseFloat(carbsMatch[1]);
  if (proteinMatch) result.protein = parseFloat(proteinMatch[1]);

  return result;
}

/**
 * Quick search with parsed nutrients
 *
 * @param {string} query - Natural language search
 * @param {number} maxResults - Maximum results to return
 * @returns {Promise<Array>} Foods with parsed nutrition data
 *
 * Example:
 * const foods = await searchFoodWithNutrients("2 scrambled eggs");
 * // Returns array of foods with .nutrients property
 */
export async function searchFoodWithNutrients(query, maxResults = 20) {
  const foods = await searchFood(query, maxResults);

  return foods.map(food => ({
    ...food,
    nutrients: parseNutrients(food.description),
  }));
}

/**
 * Test the FatSecret API connection
 */
export async function testConnection() {
  try {
    const token = await getAccessToken();
    console.log('✅ FatSecret API connected successfully');
    console.log('Access token:', token.substring(0, 20) + '...');
    return true;
  } catch (error) {
    console.error('❌ FatSecret API connection failed:', error);
    return false;
  }
}
