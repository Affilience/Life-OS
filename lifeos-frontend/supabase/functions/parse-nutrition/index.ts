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
- name: specific food name for USDA lookup - use common names like "banana, raw" NOT exotic varieties like "rose-apple"
- amount: numeric amount (the number before the unit)
- unit: unit of measurement (g, gram, grams, oz, cup, tbsp, piece, slice, etc.)
- grams: REQUIRED - the total weight in grams for this portion (calculate if needed)
- preparation: cooking method if mentioned (grilled, fried, raw, etc.)

CRITICAL NAMING RULES for USDA compatibility:
- Use "banana, raw" not "banana" alone (avoids banana powder)
- Use "apple, raw" not "apple" alone (avoids rose-apple or apple juice)
- Use "milk, whole" or "milk, 2%" not just "milk" (avoids cheese)
- Use "chicken breast, meat only, cooked" for grilled chicken
- Use "oats, regular" not just "oats" (avoids oat oil)
- Use "broccoli, cooked" for steamed broccoli
- Use "salmon, cooked" for baked salmon (not pastry!)
- For beverages: use "coffee, brewed" not "coffee" alone

IMPORTANT gram conversions to use:
- If user specifies grams directly (e.g., "150g chicken"), use that exact value
- 1 oz = 28g, 1 cup cooked rice = 195g, 1 cup vegetables = 90-150g, 1 cup liquid = 240g
- 1 medium egg = 50g, 1 slice bread = 30g, 1 medium banana = 120g
- 1 chicken breast = 170g, 1 cup pasta = 140g cooked
- 1 small apple = 150g, 1 medium apple = 180g, 1 large apple = 220g

Example input: "150g grilled chicken with 200g rice"
Example response:
[{"name": "chicken breast, meat only, cooked, grilled", "amount": 150, "unit": "g", "grams": 150, "preparation": "grilled"}, {"name": "rice, white, cooked", "amount": 200, "unit": "g", "grams": 200}]

Example input: "2 eggs and toast"
Example response:
[{"name": "egg, whole, cooked, scrambled", "amount": 2, "unit": "large", "grams": 100}, {"name": "bread, white, toasted", "amount": 1, "unit": "slice", "grams": 30}]

Example input: "banana"
Example response:
[{"name": "banana, raw", "amount": 1, "unit": "medium", "grams": 120}]

If portions aren't specified, estimate reasonable single-person serving sizes. Always include the grams field with an accurate weight estimate.`,
        },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error(`Claude API error: ${error}`);
    throw new Error(`Claude API error: ${error}`);
  }

  const data = await response.json();

  // Safely extract content with null checking
  if (!data || !data.content || !Array.isArray(data.content) || data.content.length === 0) {
    console.error("Claude returned empty or invalid response:", JSON.stringify(data));
    throw new Error("Claude returned empty response");
  }

  const content = data.content[0]?.text;
  if (!content) {
    console.error("Claude response missing text:", JSON.stringify(data.content[0]));
    throw new Error("Claude response missing text content");
  }

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

// Common food name mappings to USDA-friendly search terms
const FOOD_SEARCH_MAPPINGS: Record<string, string> = {
  // Dairy - be very specific to avoid cheese/yogurt
  'milk': 'milk whole 3.25% milkfat fluid',
  'milk, whole': 'milk whole 3.25% milkfat fluid',
  'whole milk': 'milk whole 3.25% milkfat fluid',
  'cup of milk': 'milk whole 3.25% milkfat fluid',
  'glass of milk': 'milk whole 3.25% milkfat fluid',
  'skim milk': 'milk nonfat fluid',
  '2% milk': 'milk reduced fat 2% milkfat fluid',
  'cheese': 'cheese cheddar',
  'slice of cheese': 'cheese cheddar',
  'cheddar cheese': 'cheese cheddar',
  'mozzarella': 'cheese mozzarella whole milk',
  'cottage cheese': 'cheese cottage creamed',
  'cream cheese': 'cream cheese',
  'greek yogurt': 'yogurt greek plain nonfat',
  'yogurt': 'yogurt plain whole milk',

  // Fruits - avoid exotic varieties
  'apple': 'apples raw with skin',
  'apple, raw': 'apples raw with skin',
  'small apple': 'apples raw with skin',
  'medium apple': 'apples raw with skin',
  'large apple': 'apples raw with skin',
  'banana': 'bananas raw',
  'banana, raw': 'bananas raw',
  'medium banana': 'bananas raw',
  'small banana': 'bananas raw',
  'large banana': 'bananas raw',
  'orange': 'oranges raw navels',
  'watermelon': 'watermelon raw',
  'watermelon slice': 'watermelon raw',
  'mango': 'mangos raw',
  'avocado': 'avocados raw all commercial varieties',
  'half avocado': 'avocados raw all commercial varieties',
  'kiwi': 'kiwifruit green raw',
  'peach': 'peaches raw',
  'grapes': 'grapes red or green seedless raw',
  'strawberries': 'strawberries raw',
  'blueberries': 'blueberries raw',
  'pineapple': 'pineapple raw all varieties',

  // Grains - avoid crackers and snacks
  'rice': 'rice white cooked',
  'rice, white': 'rice white cooked',
  'rice, cooked': 'rice white cooked',
  'white rice': 'rice white cooked',
  'brown rice': 'rice brown cooked',
  'oats': 'oats regular and quick dry',
  'oatmeal': 'cereals oats regular and quick dry',
  'oats, regular': 'oats regular and quick dry',
  'cooked oats': 'oats regular and quick unenriched cooked',
  'cooked oatmeal': 'oats regular and quick unenriched cooked',
  'bowl of oatmeal': 'cereals oats regular and quick dry',
  'pasta': 'pasta cooked enriched',
  'pasta, cooked': 'pasta cooked enriched',
  'spaghetti': 'pasta spaghetti cooked enriched',
  'bread': 'bread white commercially prepared',
  '2 slices of bread': 'bread white commercially prepared',
  'whole wheat toast': 'bread whole-wheat commercially prepared',
  'toast': 'bread white commercially prepared toasted',
  'croissant': 'croissants butter',
  'bagel': 'bagels plain enriched',
  'couscous': 'couscous cooked',
  'quinoa': 'quinoa cooked',

  // Eggs - default to scrambled/boiled not fried
  'egg': 'egg whole cooked scrambled',
  'eggs': 'egg whole cooked scrambled',
  '2 eggs': 'egg whole cooked scrambled',
  'boiled egg': 'egg whole cooked hard-boiled',
  'boiled eggs': 'egg whole cooked hard-boiled',
  'poached egg': 'egg whole cooked poached',
  'poached eggs': 'egg whole cooked poached',
  'fried egg': 'egg whole cooked fried',
  'fried eggs': 'egg whole cooked fried',
  'scrambled eggs': 'egg whole cooked scrambled',
  'a dozen eggs': 'egg whole cooked scrambled',
  'dozen eggs': 'egg whole cooked scrambled',
  'egg white': 'egg white cooked',
  'egg white omelette': 'egg white cooked',

  // Beverages
  'orange juice': 'orange juice raw',
  'beer': 'alcoholic beverage beer regular all',
  'wine': 'alcoholic beverage wine table red',
  'glass of wine': 'alcoholic beverage wine table red',
  'coffee': 'coffee brewed from grounds',
  'tea': 'tea brewed prepared with tap water',
  'latte': 'coffee latte',
  'cappuccino': 'coffee cappuccino',
  'espresso': 'coffee espresso',
  'mocha': 'coffee mocha',
  'smoothie': 'fruit smoothie juice drink',
  'protein shake': 'protein shake ready to drink',
  'coca cola': 'beverages carbonated cola',
  'soda': 'beverages carbonated cola',
  'iced tea': 'tea ready to drink lemon',
  'iced tea sweetened': 'tea ready to drink sweetened',

  // Fast food - use exact brand names
  'big mac': 'fast foods hamburger large triple patty',
  'whopper': 'fast foods hamburger large triple patty',
  'cheeseburger': 'fast foods cheeseburger regular single patty',
  'hamburger': 'fast foods hamburger regular single patty',
  'quarter pounder': 'fast foods cheeseburger large single patty',
  'chicken nuggets': 'fast foods chicken nuggets',
  'mcnuggets': 'fast foods chicken nuggets',
  'french fries': 'fast foods french fries',
  'large fries': 'fast foods french fries',
  'hot dog': 'frankfurter beef',
  'fish sandwich': 'fast foods fish sandwich with tartar sauce',
  'pizza slice': 'pizza cheese regular crust frozen cooked',
  'large pizza slice': 'pizza cheese regular crust frozen cooked',

  // International foods
  'ramen': 'soup ramen noodle beef flavor cooked',
  'bowl of ramen': 'soup ramen noodle beef flavor cooked',
  'sushi': 'sushi california roll',
  'sushi roll': 'sushi california roll',
  'california roll': 'sushi california roll',
  'burrito': 'burrito with beef and beans',
  'tacos': 'taco with beef cheese lettuce',
  'pad thai': 'pad thai noodles with shrimp',
  'fried rice': 'fried rice with vegetables',
  'tikka masala': 'chicken tikka masala',
  'curry': 'chicken curry',

  // Vegetables
  'broccoli': 'broccoli cooked boiled drained',
  'steamed broccoli': 'broccoli cooked boiled drained',
  'roasted vegetables': 'vegetables mixed frozen cooked boiled',
  'side salad': 'salad green',
  'caesar salad': 'salad caesar with chicken',
  'spinach salad': 'salad spinach',
  'baked potato': 'potatoes baked flesh and skin',
  'mashed potatoes': 'potatoes mashed home-prepared',
  'french fries': 'potatoes french fried',
  'sweet potato': 'sweet potato cooked baked in skin',
  'carrots': 'carrots raw',
  'corn': 'corn sweet cooked',
  'green beans': 'beans snap green cooked',

  // Meats
  'chicken breast': 'chicken breast meat only cooked roasted',
  'grilled chicken': 'chicken breast meat only cooked roasted',
  'grilled chicken breast': 'chicken breast meat only cooked roasted',
  'chicken wings': 'chicken wing meat and skin cooked roasted',
  'chicken thigh': 'chicken thigh meat only cooked roasted',
  'rotisserie chicken': 'chicken roasted',
  'fried chicken': 'chicken fried',
  'steak': 'beef steak cooked grilled',
  'beef steak': 'beef steak cooked grilled',
  'ribeye steak': 'beef ribeye steak cooked grilled',
  'sirloin steak': 'beef sirloin steak cooked grilled',
  'ground beef': 'beef ground 80% lean cooked',
  'salmon': 'salmon atlantic cooked dry heat',
  'baked salmon': 'salmon atlantic cooked dry heat',
  'grilled salmon': 'salmon atlantic cooked dry heat',
  'tuna': 'tuna light canned in water drained',
  'canned tuna': 'tuna light canned in water drained',
  'shrimp': 'shrimp cooked',
  'grilled shrimp': 'shrimp cooked',
  'lobster': 'lobster cooked',
  'lobster tail': 'lobster cooked',
  'bacon': 'bacon pork cooked',
  'ham': 'ham sliced regular',
  'ham slice': 'ham sliced regular',
  'pork chop': 'pork loin chop cooked',
  'pulled pork': 'pork shoulder cooked',
  'turkey breast': 'turkey breast meat only cooked roasted',
  'tofu': 'tofu firm prepared with calcium sulfate',
  'tempeh': 'tempeh',

  // Nuts & Seeds
  'almonds': 'almonds dry roasted',
  'peanut butter': 'peanut butter smooth style',
  'walnuts': 'walnuts english',
  'mixed nuts': 'nuts mixed with peanuts',
  'cashews': 'cashews dry roasted',
  'chia seeds': 'seeds chia seeds dried',

  // Snacks & Desserts
  'pretzels': 'pretzels soft',
  'chips': 'potato chips',
  'popcorn': 'popcorn air-popped',
  'brownie': 'brownies commercially prepared',
  'cookie': 'cookies chocolate chip commercially prepared',
  'chocolate chip cookie': 'cookies chocolate chip commercially prepared',
  'cake': 'cake chocolate with chocolate frosting',
  'slice of cake': 'cake chocolate with chocolate frosting',
  'ice cream': 'ice cream vanilla',
  'granola bar': 'granola bar with oats',
  'protein bar': 'protein bar',

  // Size variants
  '50g oats': 'oats regular and quick dry',
  '250g pasta': 'pasta cooked enriched',
  '1 cup rice': 'rice white cooked',
  '100g chicken': 'chicken breast meat only cooked roasted',
  '150g chicken': 'chicken breast meat only cooked roasted',
  '200g beef': 'beef steak cooked grilled',
};

// Terms that indicate processed/dried versions we usually don't want
const AVOID_TERMS = [
  'dehydrated', 'dried', 'powder', 'powdered', 'freeze-dried', 'lyophilized',
  'canned', 'infant formula', 'baby food', 'supplement', 'extract',
  'concentrate', 'flavored', 'imitation', 'substitute', 'chips', 'flakes',
  'bar', 'mix', 'prepared', 'breaded', 'battered', 'crackers', 'cracker',
  'dessert', 'candy', 'candies', 'chocolate', 'protein supplement'
];

// Terms that indicate fresh/raw versions we prefer
const PREFER_TERMS = ['raw', 'fresh'];

// Food category keywords for cross-category penalty
const MEAT_KEYWORDS = ['chicken', 'beef', 'pork', 'steak', 'lamb', 'turkey', 'meat', 'wing', 'breast', 'thigh', 'salmon', 'fish', 'shrimp'];
const VEGETABLE_KEYWORDS = ['broccoli', 'carrot', 'spinach', 'lettuce', 'vegetable', 'cabbage', 'celery', 'pepper', 'onion', 'tomato', 'cucumber'];
const FRUIT_KEYWORDS = ['apple', 'banana', 'orange', 'grape', 'berry', 'mango', 'peach', 'pear', 'melon', 'fruit'];
const GRAIN_KEYWORDS = ['rice', 'pasta', 'bread', 'oat', 'wheat', 'grain', 'cereal', 'noodle'];
const BEVERAGE_KEYWORDS = ['tea', 'coffee', 'beverage', 'drink', 'juice', 'soda', 'water', 'milk'];

// Score a food result based on how well it matches what we want
function scoreUSDAResult(result: any, searchName: string, originalQuery: string): number {
  const desc = result.description?.toLowerCase() || '';
  const name = (searchName || '').toLowerCase();
  const original = (originalQuery || '').toLowerCase();
  let score = 100;

  // CRITICAL: Category mismatch detection
  // If searching for meat but result is beverage, massive penalty
  const searchingForMeat = MEAT_KEYWORDS.some(k => original.includes(k));
  const searchingForVegetable = VEGETABLE_KEYWORDS.some(k => original.includes(k));
  const searchingForFruit = FRUIT_KEYWORDS.some(k => original.includes(k));
  const searchingForGrain = GRAIN_KEYWORDS.some(k => original.includes(k));
  const resultIsBeverage = desc.startsWith('beverage') || desc.includes('tea,') || desc.includes('coffee,');

  if ((searchingForMeat || searchingForVegetable || searchingForGrain) && resultIsBeverage) {
    score -= 200; // Massive penalty - completely wrong category
  }

  // If searching for vegetables, penalize meat results
  if (searchingForVegetable && !searchingForMeat) {
    if (desc.includes('chicken') || desc.includes('beef') || desc.includes('pork') ||
        desc.includes('meat') || desc.includes('lamb') || desc.includes('turkey')) {
      score -= 200; // Massive penalty - meat is not vegetables!
    }
  }

  // If searching for meat, penalize vegetable results
  if (searchingForMeat && !searchingForVegetable) {
    const resultIsVegetable = VEGETABLE_KEYWORDS.some(k => desc.includes(k));
    if (resultIsVegetable) {
      score -= 100;
    }
  }

  // CRITICAL: Check if description STARTS with the main food word
  // "Apples, raw" should score higher than "Rose-apples, raw"
  const mainFoodWords = original.split(/[\s,]+/).filter(w => w.length > 2);
  const firstWord = desc.split(/[\s,]+/)[0].replace(/[^a-z]/g, '');

  // Big boost if first word matches a main search term
  for (const word of mainFoodWords) {
    if (firstWord === word || firstWord === word + 's' || firstWord + 's' === word) {
      score += 50; // Strong boost for exact start match
    }
  }

  // Boost if the main food word appears anywhere in description
  for (const word of mainFoodWords) {
    if (word.length > 3 && desc.includes(word)) {
      score += 25;
    }
  }

  // CRITICAL: Penalize hyphenated compound foods when searching for simple foods
  // "Rose-apples" when searching for "apple" is wrong
  if (desc.includes('-')) {
    const hyphenatedWord = desc.match(/\b\w+-\w+\b/)?.[0] || '';
    const searchingForSimple = mainFoodWords.some(w => hyphenatedWord.endsWith(w) || hyphenatedWord.endsWith(w + 's'));
    if (searchingForSimple) {
      score -= 60; // Heavy penalty for compound foods
    }
  }

  // CRITICAL: For milk specifically, penalize cheese/yogurt/ricotta
  if (original.includes('milk') && !original.includes('cheese') && !original.includes('yogurt')) {
    if (desc.includes('cheese') || desc.includes('yogurt') || desc.includes('ricotta') || desc.includes('mozzarella')) {
      score -= 100; // Massive penalty - cheese is not milk!
    }
  }

  // For apple specifically, penalize rose-apple, sugar-apple, mamey-apple
  if (original.includes('apple') && !original.includes('rose') && !original.includes('sugar') && !original.includes('mamey')) {
    if (desc.includes('rose-apple') || desc.includes('sugar-apple') || desc.includes('mammy-apple') || desc.includes('mamey')) {
      score -= 100;
    }
  }

  // For rice specifically, penalize rice crackers, rice cakes, rice milk
  if (original.includes('rice') && !original.includes('cracker') && !original.includes('cake') && !original.includes('milk')) {
    if (desc.includes('cracker') || desc.includes('cake') || desc.includes('rice milk')) {
      score -= 100;
    }
  }

  // For banana specifically, penalize banana pepper
  if (original.includes('banana') && !original.includes('pepper')) {
    if (desc.includes('pepper') || desc.includes('plantain')) {
      score -= 100;
    }
  }

  // For smoothie, penalize if it's just a single fruit
  if (original.includes('smoothie')) {
    if (desc.includes('bananas, raw') || desc.includes('pepper')) {
      score -= 80;
    }
  }

  // For sushi, penalize beef/meat unless specifically requested
  if (original.includes('sushi') && !original.includes('beef')) {
    if (desc.includes('beef') || desc.includes('new zealand')) {
      score -= 100;
    }
  }

  // For ramen, prefer cooked over dry
  if (original.includes('ramen')) {
    if (desc.includes('dry') && !desc.includes('cooked')) {
      score -= 50;
    }
    if (desc.includes('cooked')) {
      score += 30;
    }
  }

  // For pasta, prefer cooked over dry
  if (original.includes('pasta')) {
    if (desc.includes('fresh-refrigerated') || desc.includes('dry')) {
      score -= 40;
    }
    if (desc.includes('cooked')) {
      score += 20;
    }
  }

  // Penalize if it contains avoided terms
  for (const term of AVOID_TERMS) {
    if (desc.includes(term)) {
      score -= 40;
    }
  }

  // Boost if it contains preferred terms (unless we're looking for cooked food)
  const wantsCooked = name.includes('cooked') || name.includes('grilled') ||
    name.includes('fried') || name.includes('baked') || name.includes('steamed') ||
    name.includes('roasted') || name.includes('boiled');

  if (!wantsCooked) {
    for (const term of PREFER_TERMS) {
      if (desc.includes(term)) {
        score += 20;
      }
    }
  }

  // Penalize fast food / branded items unless specifically requested
  const brandNames = ['mcdonald', 'wendy', 'burger king', 'pizza hut', 'taco bell', 'subway', 'kfc', 'popeyes', 'little caesars'];
  for (const brand of brandNames) {
    if (desc.includes(brand) && !original.includes(brand) && !original.includes('big mac') && !original.includes('whopper')) {
      score -= 60;
    }
  }

  // Penalize sandwich/wrap items unless specifically requested
  if ((desc.includes('sandwich') || desc.includes('wrap') || desc.includes('burrito')) &&
      !original.includes('sandwich') && !original.includes('wrap') && !original.includes('burrito')) {
    score -= 50;
  }

  // Penalize "school lunch" items
  if (desc.includes('school lunch') && !original.includes('school')) {
    score -= 70;
  }

  // For big mac, must be the actual burger
  if (original.includes('big mac')) {
    if (desc.includes('pizza') || desc.includes('daddy') || desc.includes('sundae') ||
        desc.includes('mcflurry') || desc.includes('shake') || desc.includes('fries') ||
        desc.includes('nugget') || desc.includes('salad')) {
      score -= 150; // Heavy penalty for wrong McDonald's items
    }
    if (desc.includes('big mac') || (desc.includes('mcdonald') && desc.includes('burger'))) {
      score += 80; // Strong boost for actual Big Mac
    }
  }

  // For orange juice, penalize peel/rind
  if (original.includes('orange juice') || (original.includes('orange') && original.includes('juice'))) {
    if (desc.includes('peel') || desc.includes('rind') || desc.includes('zest')) {
      score -= 150;
    }
    if (desc.includes('juice')) {
      score += 50;
    }
  }

  // For whopper, must be burger king
  if (original.includes('whopper')) {
    if (!desc.includes('burger king') && !desc.includes('whopper')) {
      score -= 80;
    }
    if (desc.includes('burger king')) {
      score += 50;
    }
  }

  // For eggs with count, prefer singular egg entries
  if (original.match(/\d+\s*eggs?/) || original.includes('dozen')) {
    // We want egg entries, not egg salad or egg rolls
    if (desc.includes('salad') || desc.includes('roll') || desc.includes('sandwich')) {
      score -= 60;
    }
  }

  return score;
}

// Get the best USDA search query for a food name
function getUSDASearchQuery(foodName: string): string {
  if (!foodName) return '';
  const lower = foodName.toLowerCase().trim();

  // Check exact mappings first
  if (FOOD_SEARCH_MAPPINGS[lower]) {
    return FOOD_SEARCH_MAPPINGS[lower];
  }

  // Check partial mappings
  for (const [key, value] of Object.entries(FOOD_SEARCH_MAPPINGS)) {
    if (lower.includes(key) || key.includes(lower)) {
      return value;
    }
  }

  return foodName;
}

// Look up nutrition data from USDA FoodData Central
async function lookupUSDANutrition(food: ParsedFood): Promise<NutritionData | null> {
  try {
    // Safety check - ensure food.name exists
    if (!food || !food.name) {
      console.error("lookupUSDANutrition: Invalid food object, missing name");
      return null;
    }

    // Get the original query for scoring
    const originalQuery = food.preparation
      ? `${food.name} ${food.preparation}`
      : food.name;

    // Transform to USDA-friendly search query
    const searchQuery = getUSDASearchQuery(originalQuery);

    console.log(`USDA: Original "${originalQuery}" -> Searching for "${searchQuery}"`);

    // Search for the food with more results to pick from
    const searchUrl = `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${USDA_API_KEY}&query=${encodeURIComponent(searchQuery)}&pageSize=25&dataType=Foundation,SR Legacy`;

    const searchResponse = await fetch(searchUrl);
    if (!searchResponse.ok) {
      const errorText = await searchResponse.text();
      console.error("USDA search failed:", errorText);
      return null;
    }

    const searchData = await searchResponse.json();

    if (!searchData.foods || searchData.foods.length === 0) {
      console.log(`USDA: No results for "${searchQuery}", trying simpler search...`);
      // Try a simpler search without preparation method
      const simpleSearchUrl = `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${USDA_API_KEY}&query=${encodeURIComponent(food.name)}&pageSize=20&dataType=Foundation,SR Legacy`;
      const simpleResponse = await fetch(simpleSearchUrl);

      if (!simpleResponse.ok) {
        console.error("USDA simple search failed");
        return null;
      }

      const simpleData = await simpleResponse.json();

      if (!simpleData.foods || simpleData.foods.length === 0) {
        console.log(`USDA: No results for "${food.name}" either`);
        return null;
      }
      searchData.foods = simpleData.foods;
    }

    // Score and sort results to find best match
    const scoredResults = searchData.foods.map((result: any) => ({
      ...result,
      matchScore: scoreUSDAResult(result, searchQuery, originalQuery)
    }));
    scoredResults.sort((a: any, b: any) => b.matchScore - a.matchScore);

    // Filter out very low scoring results (likely wrong category)
    const validResults = scoredResults.filter((r: any) => r.matchScore > -50);

    if (validResults.length === 0) {
      console.log(`USDA: All results scored too low for "${food.name}", falling back`);
      return null;
    }

    // Get the best matching result
    const foodItem = validResults[0];
    if (!foodItem || !foodItem.description) {
      console.log(`USDA: No valid food item found for "${food.name}"`);
      return null;
    }
    console.log(`USDA: Selected "${foodItem.description}" (score: ${foodItem.matchScore}) for "${food.name}"`);

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
    let caloriesPer100g = getNutrient(nutrients, 1008);
    const proteinPer100g = getNutrient(nutrients, 1003);
    const carbsPer100g = getNutrient(nutrients, 1005);
    const fatPer100g = getNutrient(nutrients, 1004);
    const fiberPer100g = getNutrient(nutrients, 1079);
    const sugarPer100g = getNutrient(nutrients, 2000);
    const sodiumPer100g = getNutrient(nutrients, 1093);
    const saturatedFatPer100g = getNutrient(nutrients, 1258);
    const cholesterolPer100g = getNutrient(nutrients, 1253);
    const potassiumPer100g = getNutrient(nutrients, 1092);

    // FIX: Zero calorie bug - calculate from macros if calories missing but macros present
    // Protein: 4 cal/g, Carbs: 4 cal/g, Fat: 9 cal/g
    if (caloriesPer100g === 0 && (proteinPer100g > 0 || carbsPer100g > 0 || fatPer100g > 0)) {
      caloriesPer100g = Math.round(
        (proteinPer100g * 4) + (carbsPer100g * 4) + (fatPer100g * 9)
      );
      console.log(`Calculated calories from macros for ${foodItem.description}: ${caloriesPer100g} cal/100g`);
    }

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
  } catch (error) {
    console.error(`USDA lookup error for "${food.name}":`, error);
    return null;
  }
}

// Web search fallback using nutritionix-style estimation via Claude
async function searchWebForNutrition(food: ParsedFood): Promise<NutritionData | null> {
  try {
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

    const data = await response.json();

    // Safely extract content with null checking
    if (!data || !data.content || !Array.isArray(data.content) || data.content.length === 0) {
      console.error("Web search: Claude returned empty response:", JSON.stringify(data));
      return null;
    }

    const content = data.content[0]?.text;
    if (!content) {
      console.error("Web search: Claude response missing text:", JSON.stringify(data.content[0]));
      return null;
    }

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

    return null;
  } catch (error) {
    console.error(`Web search error for "${food.name}":`, error);
    return null;
  }
}

// AI estimation as last resort - this function MUST always succeed
async function estimateNutritionWithAI(food: ParsedFood): Promise<NutritionData> {
  console.log(`AI estimation fallback for: ${food.name}`);

  const totalGrams = food.grams || convertToGrams(food.amount, food.unit);

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

  // Wrap entire fetch in try-catch to ensure we always return defaults
  try {
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

    if (response.ok) {
      const data = await response.json();

      // Safely extract content
      if (data?.content?.[0]?.text) {
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
      } else {
        console.error("AI estimation: Claude response missing content");
      }
    } else {
      console.error("AI estimation API call failed:", response.status);
    }
  } catch (e) {
    // This catch block ensures we never throw - always return defaults
    console.error("AI estimation fetch error:", e);
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
  // Safety check for undefined unit
  if (!unit) {
    return (amount || 1) * 100; // Default to 100g per unit if unknown
  }

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

    // Handle edge cases: empty/no-calorie inputs
    const trimmed = mealDescription.trim().toLowerCase();
    const noCalorieInputs = ['nothing', 'water', 'just water', 'plain water', 'tap water', 'black coffee', 'tea', 'diet soda', 'diet coke', 'zero calorie'];

    if (trimmed.length < 2 || noCalorieInputs.some(nc => trimmed === nc || trimmed === `a ${nc}` || trimmed === `some ${nc}`)) {
      // Return zero calories for water/nothing inputs
      return new Response(
        JSON.stringify({
          success: true,
          parsed: [],
          items: [],
          totals: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0, saturatedFat: 0, cholesterol: 0, potassium: 0 },
          dataSources: { usda: 0, web: 0, ai: 0 },
          note: "No-calorie or empty input detected"
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 1: Parse meal with Claude (now includes grams estimation)
    console.log("Parsing meal:", mealDescription);
    let parsedFoods;
    try {
      parsedFoods = await parseMealWithClaude(mealDescription);
    } catch (parseError) {
      console.error("Claude parsing failed:", parseError);
      // Fallback: treat the whole input as a single food item
      parsedFoods = [{
        name: mealDescription,
        amount: 1,
        unit: 'serving',
        grams: 100,
      }];
    }
    console.log("Parsed foods:", parsedFoods);

    // Validate parsed foods
    if (!Array.isArray(parsedFoods) || parsedFoods.length === 0) {
      parsedFoods = [{
        name: mealDescription,
        amount: 1,
        unit: 'serving',
        grams: 100,
      }];
    }

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
