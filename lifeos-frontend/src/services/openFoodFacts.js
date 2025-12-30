/**
 * Open Food Facts API Service
 * Free, open-source food database with 3M+ products
 * No API key required - unlimited requests
 *
 * Great for packaged foods with barcodes
 * https://world.openfoodfacts.org/
 */

const BASE_URL = 'https://world.openfoodfacts.org';

/**
 * Normalize Open Food Facts nutriment data to our standard format
 * OFF stores values per 100g by default
 */
function normalizeNutrition(product, servingGrams = 100) {
  const nutriments = product.nutriments || {};
  const multiplier = servingGrams / 100;

  // Helper to get value with fallback
  const get = (key, fallback = 0) => {
    const value = nutriments[key] || nutriments[`${key}_100g`] || fallback;
    return Math.round(value * multiplier * 10) / 10;
  };

  return {
    food: product.product_name || product.generic_name || 'Unknown Product',
    brand: product.brands || null,
    barcode: product.code || null,
    imageUrl: product.image_front_small_url || product.image_url || null,

    // Serving info
    servingSize: product.serving_size || `${servingGrams}g`,
    grams: servingGrams,

    // Macros
    calories: Math.round(get('energy-kcal') || get('energy') / 4.184), // Convert kJ to kcal if needed
    protein: get('proteins'),
    carbs: get('carbohydrates'),
    fat: get('fat'),
    fiber: get('fiber'),
    sugar: get('sugars'),

    // Fat breakdown
    saturatedFat: get('saturated-fat'),
    transFat: get('trans-fat'),
    cholesterol: get('cholesterol') * 1000, // Convert g to mg

    // Minerals (convert g to mg where needed)
    sodium: get('sodium') * 1000, // g to mg
    potassium: get('potassium') * 1000,
    calcium: get('calcium') * 1000,
    iron: get('iron') * 1000,
    magnesium: get('magnesium') * 1000,
    phosphorus: get('phosphorus') * 1000,
    zinc: get('zinc') * 1000,

    // Vitamins
    vitaminA: get('vitamin-a') * 1000000, // g to mcg
    vitaminC: get('vitamin-c') * 1000, // g to mg
    vitaminD: get('vitamin-d') * 1000000, // g to mcg
    vitaminE: get('vitamin-e') * 1000, // g to mg
    vitaminK: get('vitamin-k') * 1000000, // g to mcg
    vitaminB6: get('vitamin-b6') * 1000, // g to mg
    vitaminB12: get('vitamin-b12') * 1000000, // g to mcg
    folate: get('folates') * 1000000, // g to mcg

    // Metadata
    source: 'openfoodfacts',
    nutriScore: product.nutriscore_grade || null,
    novaGroup: product.nova_group || null,
    categories: product.categories_tags || [],
    ingredients: product.ingredients_text || null,
  };
}

/**
 * Look up a product by barcode
 * @param {string} barcode - UPC, EAN, or other barcode
 * @returns {Promise<object|null>} - Normalized nutrition data or null
 */
export async function lookupByBarcode(barcode) {
  try {
    const cleanBarcode = barcode.replace(/\D/g, '');

    const response = await fetch(
      `${BASE_URL}/api/v2/product/${cleanBarcode}?fields=product_name,generic_name,brands,code,nutriments,serving_size,serving_quantity,image_front_small_url,image_url,nutriscore_grade,nova_group,categories_tags,ingredients_text`,
      {
        headers: {
          'User-Agent': 'Ascynt-NutritionTracker/1.0',
        },
      }
    );

    if (!response.ok) {
      console.warn(`Open Food Facts API error: ${response.status}`);
      return null;
    }

    const data = await response.json();

    if (data.status !== 1 || !data.product) {
      return null;
    }

    // Use serving size if available, otherwise default to 100g
    const servingGrams = data.product.serving_quantity || 100;

    return normalizeNutrition(data.product, servingGrams);
  } catch (error) {
    console.error('Open Food Facts barcode lookup error:', error);
    return null;
  }
}

/**
 * Search for products by name
 * @param {string} query - Search term
 * @param {number} limit - Max results (default 10)
 * @returns {Promise<array>} - Array of normalized products
 */
export async function searchProducts(query, limit = 10) {
  try {
    const response = await fetch(
      `${BASE_URL}/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=${limit}&fields=product_name,generic_name,brands,code,nutriments,serving_size,serving_quantity,image_front_small_url,nutriscore_grade`,
      {
        headers: {
          'User-Agent': 'Ascynt-NutritionTracker/1.0',
        },
      }
    );

    if (!response.ok) {
      console.warn(`Open Food Facts search error: ${response.status}`);
      return [];
    }

    const data = await response.json();

    if (!data.products || data.products.length === 0) {
      return [];
    }

    return data.products
      .filter(p => p.product_name && p.nutriments)
      .map(product => {
        const servingGrams = product.serving_quantity || 100;
        return normalizeNutrition(product, servingGrams);
      });
  } catch (error) {
    console.error('Open Food Facts search error:', error);
    return [];
  }
}

/**
 * Get product suggestions for autocomplete
 * @param {string} query - Partial search term
 * @returns {Promise<array>} - Quick suggestions with name and calories
 */
export async function getProductSuggestions(query) {
  if (!query || query.length < 2) return [];

  const products = await searchProducts(query, 5);

  return products.map(p => ({
    name: p.brand ? `${p.food} (${p.brand})` : p.food,
    calories: p.calories,
    barcode: p.barcode,
    source: 'openfoodfacts',
  }));
}

/**
 * Check if a barcode is valid format
 * @param {string} barcode - Barcode string
 * @returns {boolean} - Whether it's a valid barcode format
 */
export function isValidBarcode(barcode) {
  if (!barcode) return false;
  const clean = barcode.replace(/\D/g, '');
  // UPC-A (12), EAN-13 (13), EAN-8 (8)
  return [8, 12, 13].includes(clean.length);
}

export default {
  lookupByBarcode,
  searchProducts,
  getProductSuggestions,
  isValidBarcode,
};
