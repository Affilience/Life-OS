// Supabase Edge Function: parse-nutrition
// Parses natural language meal descriptions using Claude Haiku
// and looks up nutrition data from USDA FoodData Central
// Falls back to web search and AI estimation when data not found

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
const USDA_API_KEY = Deno.env.get("USDA_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ParsedFood {
  name: string;
  amount: number;
  unit: string;
  grams?: number; // Total grams for the serving
  preparation?: string;
}

interface NutritionData {
  food: string;
  amount: number;
  unit: string;
  grams?: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  saturatedFat?: number;
  cholesterol?: number;
  potassium?: number;
  fdcId?: number;
  source: 'usda' | 'web' | 'ai_estimate';
}

// Parse meal description with Claude Haiku
async function parseMealWithClaude(mealDescription: string): Promise<ParsedFood[]> {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_API_KEY!,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-3-haiku-20240307",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `Parse this meal description into individual food items with precise amounts. Pay special attention to gram measurements.

Meal: "${mealDescription}"

Respond with ONLY a JSON array, no other text. Each item should have:
- name: specific food name for USDA lookup (e.g., "chicken breast, grilled" not just "chicken")
- amount: numeric amount (the number before the unit)
- unit: unit of measurement (g, gram, grams, oz, cup, tbsp, piece, slice, etc.)
- grams: REQUIRED - the total weight in grams for this portion (calculate if needed)
- preparation: cooking method if mentioned (grilled, fried, raw, etc.)

IMPORTANT gram conversions to use:
- If user specifies grams directly (e.g., "150g chicken"), use that exact value
- 1 oz = 28g, 1 cup cooked rice = 195g, 1 cup vegetables = 90-150g, 1 cup liquid = 240g
- 1 medium egg = 50g, 1 slice bread = 30g, 1 medium banana = 120g
- 1 chicken breast = 170g, 1 cup pasta = 140g cooked

Example input: "150g grilled chicken with 200g rice"
Example response:
[{"name": "chicken breast, grilled", "amount": 150, "unit": "g", "grams": 150, "preparation": "grilled"}, {"name": "white rice, cooked", "amount": 200, "unit": "g", "grams": 200}]

Example input: "2 eggs and toast"
Example response:
[{"name": "egg, whole, cooked", "amount": 2, "unit": "large", "grams": 100}, {"name": "bread, white, toasted", "amount": 1, "unit": "slice", "grams": 30}]

If portions aren't specified, estimate reasonable serving sizes. Always include the grams field with an accurate weight estimate.`,
        },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Claude API error: ${error}`);
  }

  const data = await response.json();
  const content = data.content[0].text;

  // Parse the JSON response
  try {
    // Extract JSON from the response (in case there's any extra text)
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return JSON.parse(content);
  } catch (e) {
    console.error("Failed to parse Claude response:", content);
    throw new Error("Failed to parse meal description");
  }
}

// Look up nutrition data from USDA FoodData Central
async function lookupUSDANutrition(food: ParsedFood): Promise<NutritionData | null> {
  const searchQuery = food.preparation
    ? `${food.name} ${food.preparation}`
    : food.name;

  // Search for the food
  const searchUrl = `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${USDA_API_KEY}&query=${encodeURIComponent(searchQuery)}&pageSize=5&dataType=Foundation,SR Legacy`;

  const searchResponse = await fetch(searchUrl);
  if (!searchResponse.ok) {
    console.error("USDA search failed:", await searchResponse.text());
    return null;
  }

  const searchData = await searchResponse.json();

  if (!searchData.foods || searchData.foods.length === 0) {
    // Try a simpler search without preparation method
    const simpleSearchUrl = `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${USDA_API_KEY}&query=${encodeURIComponent(food.name)}&pageSize=5&dataType=Foundation,SR Legacy`;
    const simpleResponse = await fetch(simpleSearchUrl);
    const simpleData = await simpleResponse.json();

    if (!simpleData.foods || simpleData.foods.length === 0) {
      return null;
    }
    searchData.foods = simpleData.foods;
  }

  // Get the first (most relevant) result
  const foodItem = searchData.foods[0];

  // Extract nutrients (per 100g)
  const getNutrient = (nutrients: any[], nutrientId: number): number => {
    const nutrient = nutrients?.find((n: any) => n.nutrientId === nutrientId);
    return nutrient?.value || 0;
  };

  // Nutrient IDs in USDA:
  // 1008 = Energy (kcal), 1003 = Protein, 1005 = Carbohydrates, 1004 = Total Fat
  // 1079 = Fiber, 2000 = Sugars, 1093 = Sodium, 1258 = Saturated Fat
  // 1253 = Cholesterol, 1092 = Potassium

  const nutrients = foodItem.foodNutrients;
  const caloriesPer100g = getNutrient(nutrients, 1008);
  const proteinPer100g = getNutrient(nutrients, 1003);
  const carbsPer100g = getNutrient(nutrients, 1005);
  const fatPer100g = getNutrient(nutrients, 1004);
  const fiberPer100g = getNutrient(nutrients, 1079);
  const sugarPer100g = getNutrient(nutrients, 2000);
  const sodiumPer100g = getNutrient(nutrients, 1093);
  const saturatedFatPer100g = getNutrient(nutrients, 1258);
  const cholesterolPer100g = getNutrient(nutrients, 1253);
  const potassiumPer100g = getNutrient(nutrients, 1092);

  // Use grams from Claude if available (more accurate), otherwise calculate
  const totalGrams = food.grams || convertToGrams(food.amount, food.unit);
  const multiplier = totalGrams / 100; // USDA data is per 100g

  return {
    food: foodItem.description,
    amount: food.amount,
    unit: food.unit,
    grams: totalGrams,
    calories: Math.round(caloriesPer100g * multiplier),
    protein: Math.round(proteinPer100g * multiplier * 10) / 10,
    carbs: Math.round(carbsPer100g * multiplier * 10) / 10,
    fat: Math.round(fatPer100g * multiplier * 10) / 10,
    fiber: Math.round(fiberPer100g * multiplier * 10) / 10,
    sugar: Math.round(sugarPer100g * multiplier * 10) / 10,
    sodium: Math.round(sodiumPer100g * multiplier),
    saturatedFat: Math.round(saturatedFatPer100g * multiplier * 10) / 10,
    cholesterol: Math.round(cholesterolPer100g * multiplier),
    potassium: Math.round(potassiumPer100g * multiplier),
    fdcId: foodItem.fdcId,
    source: 'usda',
  };
}

// Web search fallback using nutritionix-style estimation via Claude
async function searchWebForNutrition(food: ParsedFood): Promise<NutritionData | null> {
  console.log(`Web search fallback for: ${food.name}`);

  // Use Claude to search its knowledge base for nutrition info
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_API_KEY!,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-3-haiku-20240307",
      max_tokens: 512,
      messages: [
        {
          role: "user",
          content: `I need accurate nutrition data for: "${food.amount} ${food.unit} ${food.name}"${food.preparation ? ` (${food.preparation})` : ''}

The total weight is approximately ${food.grams || convertToGrams(food.amount, food.unit)} grams.

Search your knowledge for this specific food item. Provide nutrition data based on:
1. USDA database values you know
2. Nutrition labels from common brands
3. Scientific nutrition studies

Respond with ONLY a JSON object (no markdown, no explanation):
{
  "calories": number,
  "protein": number (grams),
  "carbs": number (grams),
  "fat": number (grams),
  "fiber": number (grams),
  "sugar": number (grams),
  "sodium": number (mg),
  "saturatedFat": number (grams),
  "confidence": "high" | "medium" | "low"
}

Be precise. Use real nutrition data, not rough estimates.`,
        },
      ],
    }),
  });

  if (!response.ok) {
    console.error("Web search fallback failed:", await response.text());
    return null;
  }

  try {
    const data = await response.json();
    const content = data.content[0].text;
    const jsonMatch = content.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      const nutrition = JSON.parse(jsonMatch[0]);

      // Only use if confidence is not low
      if (nutrition.confidence === 'low') {
        console.log(`Low confidence result for ${food.name}, skipping web fallback`);
        return null;
      }

      return {
        food: food.name,
        amount: food.amount,
        unit: food.unit,
        grams: food.grams || convertToGrams(food.amount, food.unit),
        calories: Math.round(nutrition.calories || 0),
        protein: Math.round((nutrition.protein || 0) * 10) / 10,
        carbs: Math.round((nutrition.carbs || 0) * 10) / 10,
        fat: Math.round((nutrition.fat || 0) * 10) / 10,
        fiber: Math.round((nutrition.fiber || 0) * 10) / 10,
        sugar: Math.round((nutrition.sugar || 0) * 10) / 10,
        sodium: Math.round(nutrition.sodium || 0),
        saturatedFat: Math.round((nutrition.saturatedFat || 0) * 10) / 10,
        source: 'web',
      };
    }
  } catch (e) {
    console.error("Failed to parse web search response:", e);
  }

  return null;
}

// AI estimation as last resort
async function estimateNutritionWithAI(food: ParsedFood): Promise<NutritionData> {
  console.log(`AI estimation fallback for: ${food.name}`);

  const totalGrams = food.grams || convertToGrams(food.amount, food.unit);

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_API_KEY!,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-3-haiku-20240307",
      max_tokens: 512,
      messages: [
        {
          role: "user",
          content: `Estimate nutrition for: "${food.amount} ${food.unit} ${food.name}"${food.preparation ? ` (${food.preparation})` : ''}

Weight: ${totalGrams} grams

Based on similar foods and general nutrition knowledge, estimate the macros.
Consider: cooking method affects calories (fried > grilled > steamed), protein content varies by food type.

Respond with ONLY a JSON object:
{
  "calories": number,
  "protein": number,
  "carbs": number,
  "fat": number,
  "fiber": number,
  "sugar": number,
  "sodium": number
}

Use reasonable estimates based on the food category. Round to sensible values.`,
        },
      ],
    }),
  });

  // Default values in case of complete failure
  let nutrition = {
    calories: Math.round(totalGrams * 1.5), // ~150 cal per 100g average
    protein: Math.round(totalGrams * 0.1),
    carbs: Math.round(totalGrams * 0.2),
    fat: Math.round(totalGrams * 0.05),
    fiber: Math.round(totalGrams * 0.02),
    sugar: Math.round(totalGrams * 0.05),
    sodium: Math.round(totalGrams * 2),
  };

  if (response.ok) {
    try {
      const data = await response.json();
      const content = data.content[0].text;
      const jsonMatch = content.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        nutrition = {
          calories: Math.round(parsed.calories || nutrition.calories),
          protein: Math.round((parsed.protein || nutrition.protein) * 10) / 10,
          carbs: Math.round((parsed.carbs || nutrition.carbs) * 10) / 10,
          fat: Math.round((parsed.fat || nutrition.fat) * 10) / 10,
          fiber: Math.round((parsed.fiber || nutrition.fiber) * 10) / 10,
          sugar: Math.round((parsed.sugar || nutrition.sugar) * 10) / 10,
          sodium: Math.round(parsed.sodium || nutrition.sodium),
        };
      }
    } catch (e) {
      console.error("Failed to parse AI estimation:", e);
    }
  }

  return {
    food: food.name,
    amount: food.amount,
    unit: food.unit,
    grams: totalGrams,
    ...nutrition,
    source: 'ai_estimate',
  };
}

// Convert various units to grams (approximate)
function convertToGrams(amount: number, unit: string): number {
  const conversions: Record<string, number> = {
    // Weight
    g: 1,
    gram: 1,
    grams: 1,
    oz: 28.35,
    ounce: 28.35,
    ounces: 28.35,
    lb: 453.6,
    pound: 453.6,
    pounds: 453.6,
    kg: 1000,

    // Volume (approximate for most foods)
    cup: 240,
    cups: 240,
    tbsp: 15,
    tablespoon: 15,
    tablespoons: 15,
    tsp: 5,
    teaspoon: 5,
    teaspoons: 5,
    ml: 1,
    liter: 1000,

    // Count-based (rough estimates)
    piece: 100,
    pieces: 100,
    slice: 30,
    slices: 30,
    serving: 100,
    servings: 100,
    medium: 150,
    large: 200,
    small: 80,
    whole: 150,
    half: 75,

    // Specific items (rough estimates)
    egg: 50,
    eggs: 50,
    banana: 120,
    apple: 180,
    orange: 130,
  };

  const normalizedUnit = unit.toLowerCase().trim();
  const multiplier = conversions[normalizedUnit] || 100; // Default to 100g if unknown

  return amount * multiplier;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { mealDescription } = await req.json();

    if (!mealDescription || typeof mealDescription !== "string") {
      return new Response(
        JSON.stringify({ error: "mealDescription is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 1: Parse meal with Claude (now includes grams estimation)
    console.log("Parsing meal:", mealDescription);
    const parsedFoods = await parseMealWithClaude(mealDescription);
    console.log("Parsed foods:", parsedFoods);

    // Step 2: Look up nutrition for each food with fallback chain
    const nutritionResults: NutritionData[] = [];
    const dataSources: { usda: number; web: number; ai: number } = { usda: 0, web: 0, ai: 0 };

    for (const food of parsedFoods) {
      // Try USDA first
      let nutrition = await lookupUSDANutrition(food);

      // Fallback to web search if USDA fails
      if (!nutrition) {
        console.log(`USDA lookup failed for "${food.name}", trying web search...`);
        nutrition = await searchWebForNutrition(food);
      }

      // Last resort: AI estimation (always succeeds)
      if (!nutrition) {
        console.log(`Web search failed for "${food.name}", using AI estimation...`);
        nutrition = await estimateNutritionWithAI(food);
      }

      nutritionResults.push(nutrition);

      // Track data sources
      if (nutrition.source === 'usda') dataSources.usda++;
      else if (nutrition.source === 'web') dataSources.web++;
      else dataSources.ai++;
    }

    // Step 3: Calculate totals (including new fields)
    const totals = {
      calories: nutritionResults.reduce((sum, n) => sum + n.calories, 0),
      protein: Math.round(nutritionResults.reduce((sum, n) => sum + n.protein, 0) * 10) / 10,
      carbs: Math.round(nutritionResults.reduce((sum, n) => sum + n.carbs, 0) * 10) / 10,
      fat: Math.round(nutritionResults.reduce((sum, n) => sum + n.fat, 0) * 10) / 10,
      fiber: Math.round(nutritionResults.reduce((sum, n) => sum + n.fiber, 0) * 10) / 10,
      sugar: Math.round(nutritionResults.reduce((sum, n) => sum + n.sugar, 0) * 10) / 10,
      sodium: nutritionResults.reduce((sum, n) => sum + n.sodium, 0),
      saturatedFat: Math.round(nutritionResults.reduce((sum, n) => sum + (n.saturatedFat || 0), 0) * 10) / 10,
      cholesterol: nutritionResults.reduce((sum, n) => sum + (n.cholesterol || 0), 0),
      potassium: nutritionResults.reduce((sum, n) => sum + (n.potassium || 0), 0),
    };

    return new Response(
      JSON.stringify({
        success: true,
        parsed: parsedFoods,
        items: nutritionResults,
        totals,
        dataSources, // Shows which data sources were used
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
