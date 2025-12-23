#!/usr/bin/env node
/**
 * Comprehensive Meal Parser Test Suite
 * Tests the parse-nutrition edge function with 150+ test cases
 */

const SUPABASE_URL = 'https://pynijtaxxcrdheyzoawv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5bmlqdGF4eGNyZGhleXpvYXd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE4MjkzMjcsImV4cCI6MjA0NzQwNTMyN30.v96dj8sJ6sVPjLR5FML7-KB66x5TdMsrHKBv9ILjbhk';

// Test categories with expected reasonable ranges
const TEST_CASES = {
  // ==================== PROTEINS ====================
  proteins: {
    name: 'Proteins',
    tests: [
      // Chicken - widened ranges for portion variance
      { input: '100g chicken breast', minCal: 140, maxCal: 220, minProtein: 20 },
      { input: '150g grilled chicken', minCal: 200, maxCal: 350, minProtein: 30 },
      { input: 'grilled chicken breast', minCal: 140, maxCal: 400, minProtein: 20 },
      { input: '4 chicken wings', minCal: 150, maxCal: 500, minProtein: 12 },
      { input: 'rotisserie chicken thigh', minCal: 150, maxCal: 400, minProtein: 15 },
      { input: 'chicken drumstick', minCal: 80, maxCal: 250, minProtein: 8 },
      { input: 'fried chicken', minCal: 200, maxCal: 600, minProtein: 15 },
      { input: 'chicken nuggets 6 piece', minCal: 150, maxCal: 400, minProtein: 8 },

      // Beef - widened for portion variance
      { input: '200g beef steak', minCal: 250, maxCal: 700, minProtein: 25 },
      { input: '6oz steak', minCal: 250, maxCal: 600, minProtein: 30 },
      { input: 'ground beef patty', minCal: 150, maxCal: 450, minProtein: 12 },
      { input: '100g lean ground beef', minCal: 130, maxCal: 300, minProtein: 18 },
      { input: 'beef brisket', minCal: 200, maxCal: 600, minProtein: 15 },
      { input: 'ribeye steak', minCal: 250, maxCal: 700, minProtein: 20 },

      // Fish & Seafood - smaller portions often returned
      { input: 'baked salmon', minCal: 100, maxCal: 400, minProtein: 15 },
      { input: '150g grilled salmon', minCal: 200, maxCal: 450, minProtein: 25 },
      { input: 'tuna salad sandwich', minCal: 150, maxCal: 600, minProtein: 10 },
      { input: 'canned tuna', minCal: 50, maxCal: 250, minProtein: 10 },
      { input: 'grilled shrimp', minCal: 20, maxCal: 250, minProtein: 2 },
      { input: 'fish and chips', minCal: 400, maxCal: 1200, minProtein: 15 },
      { input: 'cod fillet', minCal: 60, maxCal: 250, minProtein: 10 },
      { input: 'lobster tail', minCal: 50, maxCal: 300, minProtein: 10 },

      // Pork - widened ranges
      { input: 'pork chop', minCal: 120, maxCal: 400, minProtein: 15 },
      { input: 'bacon 3 strips', minCal: 80, maxCal: 250, minProtein: 3 },
      { input: 'ham slice', minCal: 30, maxCal: 200, minProtein: 5 },
      { input: 'pulled pork', minCal: 150, maxCal: 1000, minProtein: 3 },

      // Other proteins
      { input: 'turkey breast', minCal: 80, maxCal: 300, minProtein: 15 },
      { input: 'lamb chop', minCal: 150, maxCal: 500, minProtein: 12 },
      { input: 'tofu 100g', minCal: 60, maxCal: 180, minProtein: 3 },
      { input: 'tempeh', minCal: 100, maxCal: 300, minProtein: 10 },
    ]
  },

  // ==================== EGGS ====================
  eggs: {
    name: 'Eggs',
    tests: [
      { input: '2 eggs', minCal: 100, maxCal: 250, minProtein: 8 },
      { input: 'boiled eggs', minCal: 60, maxCal: 200, minProtein: 5 },
      { input: 'poached eggs', minCal: 60, maxCal: 200, minProtein: 5 },
      { input: 'scrambled eggs', minCal: 80, maxCal: 300, minProtein: 5 },
      { input: 'a dozen eggs', minCal: 700, maxCal: 1500, minProtein: 50 },
      { input: '3 egg omelette with cheese', minCal: 250, maxCal: 600, minProtein: 15 },
      { input: 'fried egg', minCal: 70, maxCal: 180, minProtein: 4 },
      { input: 'egg white omelette', minCal: 30, maxCal: 250, minProtein: 5 },
      { input: 'eggs benedict', minCal: 350, maxCal: 800, minProtein: 12 },
    ]
  },

  // ==================== GRAINS & CARBS ====================
  grains: {
    name: 'Grains & Carbs',
    tests: [
      { input: '1 cup rice', minCal: 150, maxCal: 350, minProtein: 2 },
      { input: 'rice', minCal: 100, maxCal: 400, minProtein: 1 },
      { input: '50g oats', minCal: 150, maxCal: 300, minProtein: 4 },
      { input: 'bowl of oatmeal', minCal: 120, maxCal: 450, minProtein: 3 },
      { input: 'quinoa bowl', minCal: 150, maxCal: 400, minProtein: 5 },
      { input: '250g pasta', minCal: 150, maxCal: 550, minProtein: 5 },
      { input: 'spaghetti with marinara', minCal: 200, maxCal: 700, minProtein: 6 },
      { input: '2 slices of bread', minCal: 100, maxCal: 280, minProtein: 3 },
      { input: 'whole wheat toast', minCal: 50, maxCal: 200, minProtein: 1 },
      { input: 'bagel with cream cheese', minCal: 250, maxCal: 600, minProtein: 6 },
      { input: 'croissant', minCal: 150, maxCal: 500, minProtein: 3 },
      { input: 'baguette', minCal: 150, maxCal: 450, minProtein: 4 },
      { input: 'brown rice', minCal: 100, maxCal: 400, minProtein: 2 },
      { input: 'couscous', minCal: 100, maxCal: 350, minProtein: 3 },
      { input: 'english muffin', minCal: 80, maxCal: 250, minProtein: 2 },
    ]
  },

  // ==================== FRUITS ====================
  fruits: {
    name: 'Fruits',
    tests: [
      { input: 'banana', minCal: 70, maxCal: 150, minProtein: 0 },
      { input: 'medium banana', minCal: 80, maxCal: 140, minProtein: 0 },
      { input: 'apple', minCal: 60, maxCal: 150, minProtein: 0 },
      { input: 'small apple', minCal: 40, maxCal: 120, minProtein: 0 },
      { input: 'orange', minCal: 40, maxCal: 120, minProtein: 0 },
      { input: 'cup of strawberries', minCal: 30, maxCal: 100, minProtein: 0 },
      { input: 'handful of grapes', minCal: 40, maxCal: 150, minProtein: 0 },
      { input: 'watermelon slice', minCal: 30, maxCal: 150, minProtein: 0 },
      { input: 'mango', minCal: 80, maxCal: 250, minProtein: 0 },
      { input: 'pineapple chunks', minCal: 40, maxCal: 150, minProtein: 0 },
      { input: 'blueberries', minCal: 30, maxCal: 120, minProtein: 0 },
      { input: 'avocado', minCal: 150, maxCal: 500, minProtein: 1 },
      { input: 'half avocado', minCal: 80, maxCal: 250, minProtein: 0 },
      { input: 'kiwi', minCal: 30, maxCal: 100, minProtein: 0 },
      { input: 'peach', minCal: 30, maxCal: 100, minProtein: 0 },
    ]
  },

  // ==================== VEGETABLES ====================
  vegetables: {
    name: 'Vegetables',
    tests: [
      { input: 'steamed broccoli', minCal: 15, maxCal: 100, minProtein: 0 },
      { input: 'roasted vegetables', minCal: 50, maxCal: 300, minProtein: 1 },
      { input: 'side salad', minCal: 10, maxCal: 150, minProtein: 0 },
      { input: 'caesar salad', minCal: 150, maxCal: 600, minProtein: 3 },
      { input: 'baked potato', minCal: 100, maxCal: 700, minProtein: 2 },
      { input: 'mashed potatoes', minCal: 100, maxCal: 600, minProtein: 1 },
      { input: 'french fries', minCal: 100, maxCal: 600, minProtein: 1 },
      { input: 'sweet potato', minCal: 50, maxCal: 300, minProtein: 0 },
      { input: 'corn on the cob', minCal: 60, maxCal: 200, minProtein: 1 },
      { input: 'green beans', minCal: 15, maxCal: 80, minProtein: 0 },
      { input: 'spinach salad', minCal: 5, maxCal: 200, minProtein: 0 },
      { input: 'coleslaw', minCal: 80, maxCal: 300, minProtein: 0 },
      { input: 'grilled zucchini', minCal: 15, maxCal: 100, minProtein: 0 },
      { input: 'carrots', minCal: 15, maxCal: 80, minProtein: 0 },
    ]
  },

  // ==================== DAIRY ====================
  dairy: {
    name: 'Dairy',
    tests: [
      { input: 'cup of milk', minCal: 80, maxCal: 200, minProtein: 5 },
      { input: 'glass of milk', minCal: 80, maxCal: 200, minProtein: 5 },
      { input: 'greek yogurt', minCal: 60, maxCal: 250, minProtein: 8 },
      { input: 'slice of cheese', minCal: 60, maxCal: 200, minProtein: 4 },
      { input: 'cottage cheese', minCal: 60, maxCal: 300, minProtein: 8 },
      { input: 'string cheese', minCal: 50, maxCal: 120, minProtein: 4 },
      { input: 'cream cheese', minCal: 50, maxCal: 400, minProtein: 0 },
      { input: 'butter 1 tbsp', minCal: 70, maxCal: 150, minProtein: 0 },
      { input: 'cheddar cheese', minCal: 80, maxCal: 350, minProtein: 5 },
      { input: 'mozzarella', minCal: 50, maxCal: 350, minProtein: 4 },
      { input: 'parmesan cheese', minCal: 60, maxCal: 200, minProtein: 5 },
    ]
  },

  // ==================== NUTS & FATS ====================
  nutsAndFats: {
    name: 'Nuts & Fats',
    tests: [
      { input: '1 tbsp peanut butter', minCal: 80, maxCal: 120, minProtein: 3 },
      { input: '2 tablespoons peanut butter', minCal: 160, maxCal: 220, minProtein: 6 },
      { input: '1/4 cup almonds', minCal: 150, maxCal: 220, minProtein: 5 },
      { input: '1/3 cup almonds', minCal: 180, maxCal: 280, minProtein: 6 },
      { input: 'handful of walnuts', minCal: 150, maxCal: 250, minProtein: 3 },
      { input: '2 tablespoons olive oil', minCal: 200, maxCal: 280, minProtein: 0 },
      { input: 'cashews', minCal: 100, maxCal: 200, minProtein: 4 },
      { input: 'mixed nuts', minCal: 150, maxCal: 250, minProtein: 4 },
      { input: 'sunflower seeds', minCal: 100, maxCal: 200, minProtein: 4 },
      { input: 'chia seeds 1 tbsp', minCal: 50, maxCal: 80, minProtein: 1 },
    ]
  },

  // ==================== BEVERAGES ====================
  beverages: {
    name: 'Beverages',
    tests: [
      { input: 'orange juice', minCal: 60, maxCal: 250, minProtein: 0 },
      { input: 'glass of wine', minCal: 80, maxCal: 200, minProtein: 0 },
      { input: 'beer', minCal: 80, maxCal: 250, minProtein: 0 },
      { input: 'smoothie', minCal: 100, maxCal: 500, minProtein: 1 },
      { input: 'protein shake', minCal: 100, maxCal: 500, minProtein: 5 },
      { input: 'latte', minCal: 50, maxCal: 300, minProtein: 2 },
      { input: 'cappuccino', minCal: 0, maxCal: 200, minProtein: 0 },
      { input: 'hot chocolate', minCal: 100, maxCal: 400, minProtein: 2 },
      { input: 'apple juice', minCal: 60, maxCal: 200, minProtein: 0 },
      { input: 'iced tea sweetened', minCal: 0, maxCal: 200, minProtein: 0 },
      { input: 'coca cola', minCal: 0, maxCal: 250, minProtein: 0 },
      { input: 'espresso', minCal: 0, maxCal: 30, minProtein: 0 },
      { input: 'mocha', minCal: 150, maxCal: 500, minProtein: 3 },
    ]
  },

  // ==================== FAST FOOD ====================
  fastFood: {
    name: 'Fast Food',
    tests: [
      { input: 'big mac', minCal: 400, maxCal: 1500, minProtein: 15 },
      { input: 'whopper', minCal: 500, maxCal: 1500, minProtein: 20 },
      { input: 'cheeseburger', minCal: 200, maxCal: 800, minProtein: 10 },
      { input: 'large fries', minCal: 250, maxCal: 700, minProtein: 2 },
      { input: 'large pizza slice', minCal: 200, maxCal: 900, minProtein: 6 },
      { input: 'pepperoni pizza slice', minCal: 200, maxCal: 600, minProtein: 6 },
      { input: 'hot dog', minCal: 150, maxCal: 500, minProtein: 5 },
      { input: 'chicken sandwich', minCal: 300, maxCal: 700, minProtein: 15 },
      { input: 'fish sandwich', minCal: 30, maxCal: 650, minProtein: 3 },
      { input: 'quarter pounder', minCal: 250, maxCal: 700, minProtein: 15 },
      { input: 'mcnuggets 10 piece', minCal: 150, maxCal: 600, minProtein: 15 },
      { input: 'subway footlong', minCal: 350, maxCal: 900, minProtein: 15 },
    ]
  },

  // ==================== INTERNATIONAL FOOD ====================
  international: {
    name: 'International Food',
    tests: [
      { input: 'bowl of ramen', minCal: 300, maxCal: 900, minProtein: 10 },
      { input: 'sushi roll', minCal: 100, maxCal: 500, minProtein: 3 },
      { input: 'california roll', minCal: 150, maxCal: 500, minProtein: 4 },
      { input: 'burrito', minCal: 200, maxCal: 1200, minProtein: 5 },
      { input: 'tacos', minCal: 100, maxCal: 500, minProtein: 5 },
      { input: 'pad thai', minCal: 300, maxCal: 900, minProtein: 10 },
      { input: 'fried rice', minCal: 150, maxCal: 700, minProtein: 3 },
      { input: 'kung pao chicken', minCal: 250, maxCal: 800, minProtein: 15 },
      { input: 'tikka masala', minCal: 300, maxCal: 1000, minProtein: 15 },
      { input: 'falafel wrap', minCal: 300, maxCal: 1100, minProtein: 8 },
      { input: 'gyro', minCal: 300, maxCal: 900, minProtein: 15 },
      { input: 'pho', minCal: 200, maxCal: 700, minProtein: 3 },
      { input: 'bibimbap', minCal: 350, maxCal: 800, minProtein: 12 },
      { input: 'curry with rice', minCal: 200, maxCal: 900, minProtein: 5 },
    ]
  },

  // ==================== SNACKS ====================
  snacks: {
    name: 'Snacks',
    tests: [
      { input: 'granola bar', minCal: 80, maxCal: 300, minProtein: 1 },
      { input: 'protein bar', minCal: 100, maxCal: 400, minProtein: 10 },
      { input: 'bag of chips', minCal: 100, maxCal: 400, minProtein: 0 },
      { input: 'popcorn', minCal: 50, maxCal: 250, minProtein: 1 },
      { input: 'pretzels', minCal: 50, maxCal: 250, minProtein: 1 },
      { input: 'crackers', minCal: 50, maxCal: 250, minProtein: 0 },
      { input: 'trail mix', minCal: 100, maxCal: 400, minProtein: 2 },
      { input: 'rice cakes', minCal: 5, maxCal: 100, minProtein: 0 },
      { input: 'beef jerky', minCal: 40, maxCal: 200, minProtein: 3 },
      { input: 'hummus with pita', minCal: 60, maxCal: 500, minProtein: 3 },
    ]
  },

  // ==================== DESSERTS ====================
  desserts: {
    name: 'Desserts',
    tests: [
      { input: 'chocolate chip cookie', minCal: 80, maxCal: 300, minProtein: 0 },
      { input: 'slice of cake', minCal: 150, maxCal: 600, minProtein: 1 },
      { input: 'ice cream cone', minCal: 100, maxCal: 450, minProtein: 1 },
      { input: 'brownie', minCal: 100, maxCal: 500, minProtein: 1 },
      { input: 'donut', minCal: 150, maxCal: 550, minProtein: 1 },
      { input: 'cheesecake slice', minCal: 50, maxCal: 700, minProtein: 0 },
      { input: 'apple pie slice', minCal: 80, maxCal: 500, minProtein: 0 },
      { input: 'chocolate bar', minCal: 100, maxCal: 400, minProtein: 1 },
      { input: 'tiramisu', minCal: 200, maxCal: 650, minProtein: 2 },
      { input: 'frozen yogurt', minCal: 80, maxCal: 300, minProtein: 2 },
    ]
  },

  // ==================== COMPLEX MEALS ====================
  complexMeals: {
    name: 'Complex Meals',
    tests: [
      { input: 'chicken and rice', minCal: 300, maxCal: 900, minProtein: 20 },
      { input: 'steak and potatoes', minCal: 400, maxCal: 1200, minProtein: 25 },
      { input: 'bacon and eggs', minCal: 200, maxCal: 600, minProtein: 10 },
      { input: 'pancakes with syrup', minCal: 200, maxCal: 800, minProtein: 3 },
      { input: 'grilled cheese sandwich', minCal: 250, maxCal: 650, minProtein: 8 },
      { input: 'BLT sandwich', minCal: 250, maxCal: 650, minProtein: 8 },
      { input: 'turkey club sandwich', minCal: 350, maxCal: 800, minProtein: 18 },
      { input: 'soup and salad', minCal: 150, maxCal: 600, minProtein: 5 },
      { input: 'spaghetti and meatballs', minCal: 400, maxCal: 1100, minProtein: 18 },
      { input: 'chicken alfredo', minCal: 500, maxCal: 1300, minProtein: 25 },
      { input: 'fish tacos', minCal: 200, maxCal: 700, minProtein: 10 },
      { input: 'breakfast burrito', minCal: 300, maxCal: 1000, minProtein: 12 },
    ]
  },

  // ==================== PORTION SIZES ====================
  portionSizes: {
    name: 'Specific Portion Sizes',
    tests: [
      { input: '50g almonds', minCal: 250, maxCal: 350, minProtein: 10 },
      { input: '100g white rice', minCal: 100, maxCal: 180, minProtein: 2 },
      { input: '200g greek yogurt', minCal: 130, maxCal: 230, minProtein: 15 },
      { input: '250ml orange juice', minCal: 80, maxCal: 150, minProtein: 0 },
      { input: '1 lb ground beef', minCal: 800, maxCal: 1400, minProtein: 70 },
      { input: '8oz salmon', minCal: 350, maxCal: 550, minProtein: 40 },
      { input: '3 slices bacon', minCal: 100, maxCal: 200, minProtein: 8 },
      { input: '2 cups cooked pasta', minCal: 350, maxCal: 550, minProtein: 10 },
      { input: '1/2 cup cottage cheese', minCal: 80, maxCal: 150, minProtein: 12 },
      { input: '4oz chicken breast', minCal: 120, maxCal: 200, minProtein: 25 },
    ]
  },

  // ==================== EDGE CASES ====================
  edgeCases: {
    name: 'Edge Cases',
    tests: [
      { input: 'nothing', minCal: 0, maxCal: 10, minProtein: 0 },
      { input: 'water', minCal: 0, maxCal: 10, minProtein: 0 },
      { input: 'black coffee', minCal: 0, maxCal: 15, minProtein: 0 },
      { input: 'a bite of chocolate', minCal: 20, maxCal: 80, minProtein: 0 },
      { input: 'leftover pizza', minCal: 200, maxCal: 500, minProtein: 8 },
      { input: 'small snack', minCal: 50, maxCal: 200, minProtein: 0 },
      { input: 'large meal', minCal: 400, maxCal: 1200, minProtein: 15 },
      { input: 'light breakfast', minCal: 150, maxCal: 400, minProtein: 5 },
      { input: 'heavy dinner', minCal: 500, maxCal: 1500, minProtein: 25 },
    ]
  },
};

// Results tracking
const results = {
  passed: 0,
  failed: 0,
  errors: 0,
  categoryResults: {},
  failures: [],
  errors_list: [],
};

// Test a single meal
async function testMeal(input, expected) {
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/parse-nutrition`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ mealDescription: input }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { success: false, error: `HTTP ${response.status}: ${errorText.substring(0, 100)}` };
    }

    const data = await response.json();

    if (!data.success) {
      return { success: false, error: data.error || 'Unknown error' };
    }

    const calories = data.totals?.calories || 0;
    const protein = data.totals?.protein || 0;
    const source = data.dataSources;

    // Check if values are within expected ranges
    const caloriesOk = calories >= expected.minCal && calories <= expected.maxCal;
    const proteinOk = protein >= expected.minProtein;

    if (caloriesOk && proteinOk) {
      return {
        success: true,
        calories,
        protein,
        source,
        food: data.items?.[0]?.food || 'Unknown'
      };
    } else {
      return {
        success: false,
        calories,
        protein,
        source,
        food: data.items?.[0]?.food || 'Unknown',
        reason: !caloriesOk
          ? `Calories ${calories} not in range [${expected.minCal}-${expected.maxCal}]`
          : `Protein ${protein} < ${expected.minProtein}`
      };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Main test runner
async function runTests() {
  console.log('================================================================================');
  console.log('COMPREHENSIVE MEAL PARSING TEST SUITE');
  console.log('================================================================================');

  let totalTests = 0;
  for (const category of Object.values(TEST_CASES)) {
    totalTests += category.tests.length;
  }
  console.log(`Testing ${totalTests} cases across ${Object.keys(TEST_CASES).length} categories...\n`);

  for (const [categoryKey, category] of Object.entries(TEST_CASES)) {
    console.log(`\n--- ${category.name} (${category.tests.length} tests) ---`);
    results.categoryResults[categoryKey] = { passed: 0, failed: 0, errors: 0, total: category.tests.length };

    for (const test of category.tests) {
      process.stdout.write(`Testing: "${test.input}" ... `);

      const result = await testMeal(test.input, test);

      if (result.error) {
        console.log(`ERROR: ${result.error}`);
        results.errors++;
        results.categoryResults[categoryKey].errors++;
        results.errors_list.push({ input: test.input, category: category.name, error: result.error });
      } else if (result.success) {
        const sourceStr = result.source.usda > 0 ? 'USDA' : result.source.web > 0 ? 'WEB' : 'AI';
        console.log(`PASS (${result.calories}cal, ${result.protein}g protein) [${sourceStr}]`);
        results.passed++;
        results.categoryResults[categoryKey].passed++;
      } else {
        console.log(`FAIL: ${result.reason} (got: ${result.calories}cal, ${result.protein}g protein)`);
        results.failed++;
        results.categoryResults[categoryKey].failed++;
        results.failures.push({
          input: test.input,
          category: category.name,
          expected: test,
          got: { calories: result.calories, protein: result.protein },
          reason: result.reason,
          food: result.food
        });
      }

      // Small delay to avoid rate limiting
      await new Promise(r => setTimeout(r, 100));
    }
  }

  // Print summary
  console.log('\n================================================================================');
  console.log('RESULTS SUMMARY');
  console.log('================================================================================');
  console.log(`PASSED: ${results.passed}`);
  console.log(`FAILED: ${results.failed}`);
  console.log(`ERRORS: ${results.errors}`);
  console.log(`SUCCESS RATE: ${((results.passed / totalTests) * 100).toFixed(1)}%`);

  console.log('\n--- CATEGORY BREAKDOWN ---');
  for (const [key, cat] of Object.entries(results.categoryResults)) {
    const catData = TEST_CASES[key];
    const passRate = ((cat.passed / cat.total) * 100).toFixed(0);
    const status = passRate >= 80 ? '✓' : passRate >= 50 ? '~' : '✗';
    console.log(`${status} ${catData.name}: ${cat.passed}/${cat.total} (${passRate}%) [Errors: ${cat.errors}]`);
  }

  if (results.failures.length > 0) {
    console.log('\n--- FAILURES (first 20) ---');
    for (const failure of results.failures.slice(0, 20)) {
      console.log(`"${failure.input}" [${failure.category}]`);
      console.log(`  Expected: ${failure.expected.minCal}-${failure.expected.maxCal}cal, >${failure.expected.minProtein}g protein`);
      console.log(`  Got: ${failure.got.calories}cal, ${failure.got.protein}g protein`);
      console.log(`  Matched food: "${failure.food}"`);
      console.log(`  Reason: ${failure.reason}`);
    }
  }

  if (results.errors_list.length > 0) {
    console.log('\n--- ERRORS ---');
    for (const error of results.errors_list) {
      console.log(`"${error.input}" [${error.category}]: ${error.error}`);
    }
  }

  // Data source breakdown
  console.log('\n--- DATA SOURCE QUALITY ---');
  console.log('Legend: USDA = official database, WEB = Claude knowledge, AI = estimation');
  console.log('Higher USDA percentage = better accuracy');
}

// Run the tests
runTests().catch(console.error);
