// Supabase Edge Function: parse-nutrition
// Parses natural language meal descriptions using Claude Haiku
// and looks up nutrition data from USDA FoodData Central

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
  preparation?: string;
}

interface NutritionData {
  food: string;
  amount: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  fdcId?: number;
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
          content: `Parse this meal description into individual food items with estimated amounts. Be specific about portions.

Meal: "${mealDescription}"

Respond with ONLY a JSON array, no other text. Each item should have:
- name: specific food name for USDA lookup (e.g., "chicken breast, grilled" not just "chicken")
- amount: numeric amount
- unit: unit of measurement (g, oz, cup, tbsp, piece, slice, etc.)
- preparation: cooking method if mentioned (grilled, fried, raw, etc.)

Example response:
[{"name": "chicken breast, grilled", "amount": 6, "unit": "oz", "preparation": "grilled"}, {"name": "white rice, cooked", "amount": 1, "unit": "cup"}, {"name": "broccoli, steamed", "amount": 1, "unit": "cup", "preparation": "steamed"}]

If portions aren't specified, estimate reasonable serving sizes. Be precise with food names for accurate nutrition lookup.`,
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
  // 1008 = Energy (kcal)
  // 1003 = Protein
  // 1005 = Carbohydrates
  // 1004 = Total Fat
  // 1079 = Fiber
  // 2000 = Sugars
  // 1093 = Sodium

  const nutrients = foodItem.foodNutrients;
  const caloriesPer100g = getNutrient(nutrients, 1008);
  const proteinPer100g = getNutrient(nutrients, 1003);
  const carbsPer100g = getNutrient(nutrients, 1005);
  const fatPer100g = getNutrient(nutrients, 1004);
  const fiberPer100g = getNutrient(nutrients, 1079);
  const sugarPer100g = getNutrient(nutrients, 2000);
  const sodiumPer100g = getNutrient(nutrients, 1093);

  // Convert amount to grams for calculation
  const gramsMultiplier = convertToGrams(food.amount, food.unit);
  const multiplier = gramsMultiplier / 100; // USDA data is per 100g

  return {
    food: foodItem.description,
    amount: food.amount,
    unit: food.unit,
    calories: Math.round(caloriesPer100g * multiplier),
    protein: Math.round(proteinPer100g * multiplier * 10) / 10,
    carbs: Math.round(carbsPer100g * multiplier * 10) / 10,
    fat: Math.round(fatPer100g * multiplier * 10) / 10,
    fiber: Math.round(fiberPer100g * multiplier * 10) / 10,
    sugar: Math.round(sugarPer100g * multiplier * 10) / 10,
    sodium: Math.round(sodiumPer100g * multiplier),
    fdcId: foodItem.fdcId,
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

    // Step 1: Parse meal with Claude
    console.log("Parsing meal:", mealDescription);
    const parsedFoods = await parseMealWithClaude(mealDescription);
    console.log("Parsed foods:", parsedFoods);

    // Step 2: Look up nutrition for each food
    const nutritionResults: NutritionData[] = [];
    const notFound: string[] = [];

    for (const food of parsedFoods) {
      const nutrition = await lookupUSDANutrition(food);
      if (nutrition) {
        nutritionResults.push(nutrition);
      } else {
        notFound.push(`${food.amount} ${food.unit} ${food.name}`);
      }
    }

    // Step 3: Calculate totals
    const totals = {
      calories: nutritionResults.reduce((sum, n) => sum + n.calories, 0),
      protein: Math.round(nutritionResults.reduce((sum, n) => sum + n.protein, 0) * 10) / 10,
      carbs: Math.round(nutritionResults.reduce((sum, n) => sum + n.carbs, 0) * 10) / 10,
      fat: Math.round(nutritionResults.reduce((sum, n) => sum + n.fat, 0) * 10) / 10,
      fiber: Math.round(nutritionResults.reduce((sum, n) => sum + n.fiber, 0) * 10) / 10,
      sugar: Math.round(nutritionResults.reduce((sum, n) => sum + n.sugar, 0) * 10) / 10,
      sodium: nutritionResults.reduce((sum, n) => sum + n.sodium, 0),
    };

    return new Response(
      JSON.stringify({
        success: true,
        parsed: parsedFoods,
        items: nutritionResults,
        totals,
        notFound: notFound.length > 0 ? notFound : undefined,
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
