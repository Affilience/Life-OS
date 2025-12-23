/**
 * Comprehensive Meal Parsing Test Script
 *
 * Tests the parse-nutrition edge function with many different:
 * - Food descriptions
 * - Quantity formats (grams, cups, pieces, informal)
 * - Semantic variations
 * - Edge cases
 *
 * Run with: node scripts/testMealParsing.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.local
dotenv.config({ path: join(__dirname, '../.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ============================================================================
// TEST CASES
// ============================================================================

const testCases = [
  // === BASIC SINGLE FOODS ===
  { category: 'Basic Single Foods', tests: [
    { input: 'apple', expected: { minCal: 50, maxCal: 150, mustHaveCarbs: true } },
    { input: 'banana', expected: { minCal: 80, maxCal: 150, mustHaveCarbs: true } },
    { input: 'chicken breast', expected: { minCal: 150, maxCal: 350, mustHaveProtein: true } },
    { input: 'eggs', expected: { minCal: 60, maxCal: 200, mustHaveProtein: true } },
    { input: 'rice', expected: { minCal: 100, maxCal: 300, mustHaveCarbs: true } },
  ]},

  // === EXPLICIT GRAM QUANTITIES ===
  { category: 'Explicit Gram Quantities', tests: [
    { input: '100g chicken breast', expected: { minCal: 120, maxCal: 200, gramsCheck: 100 } },
    { input: '150g grilled chicken', expected: { minCal: 180, maxCal: 280, gramsCheck: 150 } },
    { input: '200g rice', expected: { minCal: 200, maxCal: 320, gramsCheck: 200 } },
    { input: '50g oats', expected: { minCal: 150, maxCal: 220, gramsCheck: 50 } },
    { input: '250g pasta', expected: { minCal: 300, maxCal: 450, gramsCheck: 250 } },
    { input: '300g salmon', expected: { minCal: 400, maxCal: 700, gramsCheck: 300 } },
    { input: '500g beef steak', expected: { minCal: 600, maxCal: 1200, gramsCheck: 500 } },
  ]},

  // === OUNCE QUANTITIES ===
  { category: 'Ounce Quantities', tests: [
    { input: '4oz chicken', expected: { minCal: 100, maxCal: 220, gramsCheck: 113 } },
    { input: '6oz steak', expected: { minCal: 200, maxCal: 500, gramsCheck: 170 } },
    { input: '8oz salmon', expected: { minCal: 300, maxCal: 500, gramsCheck: 227 } },
    { input: '3 oz ground beef', expected: { minCal: 150, maxCal: 350, gramsCheck: 85 } },
  ]},

  // === CUP MEASUREMENTS ===
  { category: 'Cup Measurements', tests: [
    { input: '1 cup rice', expected: { minCal: 180, maxCal: 280 } },
    { input: '2 cups pasta', expected: { minCal: 350, maxCal: 550 } },
    { input: 'half cup oatmeal', expected: { minCal: 100, maxCal: 200 } },
    { input: '1/2 cup cottage cheese', expected: { minCal: 80, maxCal: 150 } },
    { input: '1/4 cup almonds', expected: { minCal: 150, maxCal: 250 } },
    { input: 'a cup of milk', expected: { minCal: 100, maxCal: 180 } },
  ]},

  // === TABLESPOON/TEASPOON ===
  { category: 'Tablespoon/Teaspoon', tests: [
    { input: '1 tbsp peanut butter', expected: { minCal: 80, maxCal: 120 } },
    { input: '2 tablespoons olive oil', expected: { minCal: 200, maxCal: 280 } },
    { input: '1 tsp honey', expected: { minCal: 15, maxCal: 30 } },
    { input: '3 tbsp hummus', expected: { minCal: 60, maxCal: 120 } },
  ]},

  // === COUNT-BASED QUANTITIES ===
  { category: 'Count-Based Quantities', tests: [
    { input: '2 eggs', expected: { minCal: 120, maxCal: 200, mustHaveProtein: true } },
    { input: '3 slices of bread', expected: { minCal: 180, maxCal: 300, mustHaveCarbs: true } },
    { input: '1 banana', expected: { minCal: 80, maxCal: 130 } },
    { input: '4 chicken wings', expected: { minCal: 200, maxCal: 500 } },
    { input: '6 strawberries', expected: { minCal: 15, maxCal: 50 } },
    { input: 'a dozen eggs', expected: { minCal: 700, maxCal: 1000 } },
  ]},

  // === INFORMAL QUANTITIES ===
  { category: 'Informal Quantities', tests: [
    { input: 'some chicken', expected: { minCal: 100, maxCal: 400 } },
    { input: 'a little bit of rice', expected: { minCal: 50, maxCal: 200 } },
    { input: 'a handful of almonds', expected: { minCal: 100, maxCal: 250 } },
    { input: 'a big bowl of oatmeal', expected: { minCal: 200, maxCal: 400 } },
    { input: 'small salad', expected: { minCal: 30, maxCal: 150 } },
    { input: 'large pizza slice', expected: { minCal: 250, maxCal: 450 } },
    { input: 'a few crackers', expected: { minCal: 50, maxCal: 150 } },
    { input: 'lots of vegetables', expected: { minCal: 50, maxCal: 200 } },
  ]},

  // === SIZE MODIFIERS ===
  { category: 'Size Modifiers', tests: [
    { input: 'small apple', expected: { minCal: 40, maxCal: 80 } },
    { input: 'medium banana', expected: { minCal: 80, maxCal: 120 } },
    { input: 'large orange', expected: { minCal: 80, maxCal: 120 } },
    { input: 'extra large egg', expected: { minCal: 70, maxCal: 100 } },
    { input: 'jumbo shrimp', expected: { minCal: 10, maxCal: 50 } },
  ]},

  // === COOKING METHODS ===
  { category: 'Cooking Methods', tests: [
    { input: 'grilled chicken breast', expected: { minCal: 150, maxCal: 280, mustHaveProtein: true } },
    { input: 'fried chicken', expected: { minCal: 200, maxCal: 400 } },
    { input: 'steamed broccoli', expected: { minCal: 30, maxCal: 80 } },
    { input: 'baked salmon', expected: { minCal: 200, maxCal: 400 } },
    { input: 'boiled eggs', expected: { minCal: 70, maxCal: 100 } },
    { input: 'scrambled eggs', expected: { minCal: 90, maxCal: 180 } },
    { input: 'poached eggs', expected: { minCal: 60, maxCal: 100 } },
    { input: 'pan-fried tofu', expected: { minCal: 100, maxCal: 250 } },
    { input: 'roasted vegetables', expected: { minCal: 80, maxCal: 200 } },
    { input: 'sauteed mushrooms', expected: { minCal: 40, maxCal: 120 } },
  ]},

  // === COMBINED MEALS ===
  { category: 'Combined Meals', tests: [
    { input: 'chicken and rice', expected: { minCal: 300, maxCal: 600 } },
    { input: '150g chicken with 200g rice', expected: { minCal: 400, maxCal: 600, gramsCheck: 350 } },
    { input: 'eggs and toast', expected: { minCal: 180, maxCal: 350 } },
    { input: '2 eggs, 2 slices toast, and orange juice', expected: { minCal: 300, maxCal: 500 } },
    { input: 'steak with mashed potatoes and green beans', expected: { minCal: 500, maxCal: 900 } },
    { input: 'pasta with tomato sauce and parmesan', expected: { minCal: 400, maxCal: 700 } },
    { input: 'burger and fries', expected: { minCal: 600, maxCal: 1200 } },
    { input: 'grilled salmon, asparagus, and quinoa', expected: { minCal: 400, maxCal: 700 } },
  ]},

  // === MEAL DESCRIPTIONS ===
  { category: 'Meal Descriptions', tests: [
    { input: 'breakfast of 2 eggs, bacon, and toast', expected: { minCal: 350, maxCal: 650 } },
    { input: 'lunch salad with grilled chicken', expected: { minCal: 200, maxCal: 500 } },
    { input: 'protein shake with banana and peanut butter', expected: { minCal: 300, maxCal: 550 } },
    { input: 'oatmeal with berries and honey', expected: { minCal: 250, maxCal: 450 } },
    { input: 'greek yogurt with granola', expected: { minCal: 200, maxCal: 400 } },
    { input: 'avocado toast with poached egg', expected: { minCal: 250, maxCal: 450 } },
  ]},

  // === BRAND NAMES & SPECIFIC PRODUCTS ===
  { category: 'Brand Names & Products', tests: [
    { input: 'big mac', expected: { minCal: 450, maxCal: 650 } },
    { input: 'whopper', expected: { minCal: 550, maxCal: 750 } },
    { input: 'subway footlong', expected: { minCal: 400, maxCal: 900 } },
    { input: 'starbucks latte', expected: { minCal: 150, maxCal: 300 } },
    { input: 'quest protein bar', expected: { minCal: 180, maxCal: 250 } },
    { input: 'chobani greek yogurt', expected: { minCal: 100, maxCal: 200 } },
  ]},

  // === DRINKS & BEVERAGES ===
  { category: 'Drinks & Beverages', tests: [
    { input: 'glass of milk', expected: { minCal: 100, maxCal: 180 } },
    { input: 'cup of coffee with cream', expected: { minCal: 20, maxCal: 100 } },
    { input: 'orange juice', expected: { minCal: 80, maxCal: 150 } },
    { input: 'protein shake', expected: { minCal: 100, maxCal: 300 } },
    { input: 'smoothie', expected: { minCal: 150, maxCal: 400 } },
    { input: 'beer', expected: { minCal: 100, maxCal: 200 } },
    { input: 'glass of wine', expected: { minCal: 100, maxCal: 180 } },
  ]},

  // === SNACKS ===
  { category: 'Snacks', tests: [
    { input: 'bag of chips', expected: { minCal: 200, maxCal: 400 } },
    { input: 'handful of nuts', expected: { minCal: 100, maxCal: 250 } },
    { input: 'piece of chocolate', expected: { minCal: 40, maxCal: 100 } },
    { input: 'protein bar', expected: { minCal: 150, maxCal: 300 } },
    { input: 'cheese and crackers', expected: { minCal: 150, maxCal: 350 } },
    { input: 'apple with peanut butter', expected: { minCal: 200, maxCal: 350 } },
  ]},

  // === INTERNATIONAL FOODS ===
  { category: 'International Foods', tests: [
    { input: 'sushi roll', expected: { minCal: 200, maxCal: 400 } },
    { input: 'bowl of ramen', expected: { minCal: 400, maxCal: 800 } },
    { input: 'tacos', expected: { minCal: 200, maxCal: 500 } },
    { input: 'pad thai', expected: { minCal: 400, maxCal: 800 } },
    { input: 'burrito', expected: { minCal: 500, maxCal: 1000 } },
    { input: 'chicken tikka masala with rice', expected: { minCal: 500, maxCal: 900 } },
    { input: 'pho', expected: { minCal: 350, maxCal: 650 } },
    { input: 'pizza margherita slice', expected: { minCal: 200, maxCal: 350 } },
  ]},

  // === COMPLEX DESCRIPTIONS ===
  { category: 'Complex Descriptions', tests: [
    { input: 'I had 150 grams of grilled chicken breast with half a cup of brown rice and some steamed broccoli',
      expected: { minCal: 350, maxCal: 550, gramsCheck: 150 } },
    { input: 'for breakfast I ate 2 scrambled eggs with 2 slices of whole wheat toast and a glass of orange juice',
      expected: { minCal: 350, maxCal: 550 } },
    { input: 'made a smoothie with 1 banana, 1 scoop protein powder, 1 cup milk, and 1 tbsp peanut butter',
      expected: { minCal: 400, maxCal: 600 } },
    { input: 'lunch was a grilled chicken salad with mixed greens, cherry tomatoes, cucumber, and balsamic dressing',
      expected: { minCal: 250, maxCal: 500 } },
  ]},

  // === FRACTIONS & DECIMALS ===
  { category: 'Fractions & Decimals', tests: [
    { input: '1.5 cups rice', expected: { minCal: 270, maxCal: 420 } },
    { input: '0.5 cup oatmeal', expected: { minCal: 100, maxCal: 200 } },
    { input: '1/3 cup almonds', expected: { minCal: 180, maxCal: 300 } },
    { input: '2 1/2 eggs', expected: { minCal: 150, maxCal: 250 } },
    { input: '1 and a half bananas', expected: { minCal: 130, maxCal: 200 } },
  ]},

  // === EDGE CASES ===
  { category: 'Edge Cases', tests: [
    { input: 'CHICKEN BREAST 200G', expected: { minCal: 200, maxCal: 400 } }, // All caps
    { input: '  rice with chicken  ', expected: { minCal: 300, maxCal: 600 } }, // Extra spaces
    { input: 'chicken, rice, broccoli, and a glass of water', expected: { minCal: 300, maxCal: 600 } }, // Water should add 0
    { input: 'nothing', expected: { shouldFail: true } }, // Edge case
    { input: 'just water', expected: { minCal: 0, maxCal: 10 } },
    { input: 'black coffee', expected: { minCal: 0, maxCal: 15 } },
    { input: 'diet coke', expected: { minCal: 0, maxCal: 10 } },
  ]},

  // === COLLOQUIAL/SLANG ===
  { category: 'Colloquial & Slang', tests: [
    { input: 'nuggies', expected: { minCal: 200, maxCal: 500 } },
    { input: 'chicky nugs', expected: { minCal: 200, maxCal: 500 } },
    { input: 'za', expected: { minCal: 200, maxCal: 400 } }, // Pizza slang
    { input: 'sammie', expected: { minCal: 200, maxCal: 500 } }, // Sandwich
    { input: 'avo toast', expected: { minCal: 200, maxCal: 400 } },
    { input: 'brekkie', expected: { minCal: 200, maxCal: 500 } }, // Breakfast
  ]},

  // === MISSPELLINGS ===
  { category: 'Common Misspellings', tests: [
    { input: 'chiken breast', expected: { minCal: 150, maxCal: 350 } },
    { input: 'brocoli', expected: { minCal: 20, maxCal: 80 } },
    { input: 'spagetti', expected: { minCal: 200, maxCal: 400 } },
    { input: 'bannana', expected: { minCal: 80, maxCal: 130 } },
    { input: 'avacado', expected: { minCal: 150, maxCal: 300 } },
    { input: 'qinoa', expected: { minCal: 100, maxCal: 250 } },
  ]},

  // === ABBREVIATED INPUTS ===
  { category: 'Abbreviated Inputs', tests: [
    { input: 'chx breast', expected: { minCal: 150, maxCal: 350 } },
    { input: 'pb&j', expected: { minCal: 300, maxCal: 500 } },
    { input: 'oj', expected: { minCal: 80, maxCal: 150 } },
    { input: 'pb', expected: { minCal: 80, maxCal: 200 } },
    { input: 'mac n cheese', expected: { minCal: 300, maxCal: 600 } },
  ]},

  // === VERY SPECIFIC QUANTITIES ===
  { category: 'Very Specific Quantities', tests: [
    { input: 'exactly 127g of chicken', expected: { gramsCheck: 127 } },
    { input: '73 grams of rice', expected: { gramsCheck: 73 } },
    { input: '2.5 oz salmon', expected: { gramsCheck: 71 } },
    { input: '185ml milk', expected: { } },
  ]},

  // === MEAL PREP / BATCH ===
  { category: 'Meal Prep & Batch', tests: [
    { input: '500g chicken breast for the week', expected: { minCal: 550, maxCal: 900, gramsCheck: 500 } },
    { input: 'meal prep: 1kg rice', expected: { minCal: 1000, maxCal: 1500, gramsCheck: 1000 } },
  ]},

  // === DIETARY SPECIFIC ===
  { category: 'Dietary Specific', tests: [
    { input: 'vegan burger', expected: { minCal: 200, maxCal: 450 } },
    { input: 'gluten free bread', expected: { minCal: 70, maxCal: 150 } },
    { input: 'sugar free jello', expected: { minCal: 0, maxCal: 20 } },
    { input: 'low fat yogurt', expected: { minCal: 80, maxCal: 150 } },
    { input: 'keto friendly snack', expected: { minCal: 100, maxCal: 300 } },
  ]},
];

// ============================================================================
// TEST RUNNER
// ============================================================================

const results = {
  passed: 0,
  failed: 0,
  errors: [],
  warnings: [],
  details: [],
};

async function runTest(input, expected, category) {
  const startTime = Date.now();

  try {
    const { data, error } = await supabase.functions.invoke('parse-nutrition', {
      body: { mealDescription: input },
    });

    const duration = Date.now() - startTime;

    if (error) {
      if (expected.shouldFail) {
        results.passed++;
        results.details.push({
          category,
          input,
          status: 'PASS',
          note: 'Expected failure occurred',
          duration,
        });
        return;
      }

      results.failed++;
      results.errors.push({
        category,
        input,
        error: error.message,
        duration,
      });
      return;
    }

    if (!data.success) {
      if (expected.shouldFail) {
        results.passed++;
        return;
      }

      results.failed++;
      results.errors.push({
        category,
        input,
        error: 'API returned success: false',
        data,
        duration,
      });
      return;
    }

    // Validate the response
    const issues = [];
    const warnings = [];
    const totals = data.totals;

    // Check calorie range
    if (expected.minCal !== undefined && totals.calories < expected.minCal) {
      issues.push(`Calories ${totals.calories} below minimum ${expected.minCal}`);
    }
    if (expected.maxCal !== undefined && totals.calories > expected.maxCal) {
      issues.push(`Calories ${totals.calories} above maximum ${expected.maxCal}`);
    }

    // Check protein requirement
    if (expected.mustHaveProtein && totals.protein < 5) {
      issues.push(`Expected protein but got only ${totals.protein}g`);
    }

    // Check carbs requirement
    if (expected.mustHaveCarbs && totals.carbs < 5) {
      issues.push(`Expected carbs but got only ${totals.carbs}g`);
    }

    // Check grams accuracy
    if (expected.gramsCheck) {
      const totalGrams = data.items.reduce((sum, item) => sum + (item.grams || 0), 0);
      const gramsDiff = Math.abs(totalGrams - expected.gramsCheck);
      const gramsPercent = (gramsDiff / expected.gramsCheck) * 100;

      if (gramsPercent > 20) {
        issues.push(`Grams ${totalGrams} differs from expected ${expected.gramsCheck} by ${gramsPercent.toFixed(1)}%`);
      } else if (gramsPercent > 10) {
        warnings.push(`Grams ${totalGrams} slightly differs from expected ${expected.gramsCheck}`);
      }
    }

    // Check data sources
    if (data.dataSources.ai > 0 && data.dataSources.usda === 0) {
      warnings.push(`All items used AI estimation (no USDA data)`);
    }

    // Check for zero/unrealistic values
    if (totals.calories === 0 && !expected.shouldBeZero) {
      issues.push('Zero calories returned');
    }
    if (totals.protein < 0 || totals.carbs < 0 || totals.fat < 0) {
      issues.push('Negative macro values');
    }

    // Check items were parsed
    if (!data.items || data.items.length === 0) {
      issues.push('No food items parsed');
    }

    if (issues.length > 0) {
      results.failed++;
      results.errors.push({
        category,
        input,
        issues,
        warnings,
        totals,
        items: data.items,
        dataSources: data.dataSources,
        duration,
      });
    } else {
      results.passed++;
      if (warnings.length > 0) {
        results.warnings.push({
          category,
          input,
          warnings,
          totals,
          duration,
        });
      }
      results.details.push({
        category,
        input,
        status: 'PASS',
        totals,
        items: data.items?.length,
        dataSources: data.dataSources,
        duration,
      });
    }

  } catch (err) {
    results.failed++;
    results.errors.push({
      category,
      input,
      error: err.message,
      stack: err.stack,
    });
  }
}

async function runAllTests() {
  console.log('='.repeat(80));
  console.log('SMART MEAL LOGGING SYSTEM - COMPREHENSIVE TEST');
  console.log('='.repeat(80));
  console.log(`\nStarting ${testCases.reduce((sum, cat) => sum + cat.tests.length, 0)} tests across ${testCases.length} categories...\n`);

  for (const category of testCases) {
    console.log(`\n--- ${category.category} (${category.tests.length} tests) ---`);

    for (const test of category.tests) {
      process.stdout.write(`  Testing: "${test.input.slice(0, 50)}${test.input.length > 50 ? '...' : ''}" ... `);

      await runTest(test.input, test.expected, category.category);

      // Rate limiting - wait 500ms between requests
      await new Promise(resolve => setTimeout(resolve, 500));

      const lastResult = results.errors[results.errors.length - 1];
      const lastPass = results.details[results.details.length - 1];

      if (lastResult && lastResult.input === test.input) {
        console.log('FAIL');
      } else if (lastPass && lastPass.input === test.input) {
        console.log(`PASS (${lastPass.duration}ms)`);
      }
    }
  }

  // Print summary
  console.log('\n' + '='.repeat(80));
  console.log('TEST RESULTS SUMMARY');
  console.log('='.repeat(80));

  console.log(`\n  PASSED: ${results.passed}`);
  console.log(`  FAILED: ${results.failed}`);
  console.log(`  WARNINGS: ${results.warnings.length}`);
  console.log(`  SUCCESS RATE: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`);

  if (results.errors.length > 0) {
    console.log('\n' + '-'.repeat(80));
    console.log('FAILURES:');
    console.log('-'.repeat(80));

    for (const error of results.errors) {
      console.log(`\n[${error.category}] "${error.input}"`);
      if (error.issues) {
        error.issues.forEach(issue => console.log(`  - ${issue}`));
      }
      if (error.error) {
        console.log(`  ERROR: ${error.error}`);
      }
      if (error.totals) {
        console.log(`  Totals: ${JSON.stringify(error.totals)}`);
      }
      if (error.items) {
        console.log(`  Items: ${JSON.stringify(error.items.map(i => ({ food: i.food, grams: i.grams, cal: i.calories })))}`);
      }
    }
  }

  if (results.warnings.length > 0) {
    console.log('\n' + '-'.repeat(80));
    console.log('WARNINGS:');
    console.log('-'.repeat(80));

    for (const warning of results.warnings) {
      console.log(`\n[${warning.category}] "${warning.input}"`);
      warning.warnings.forEach(w => console.log(`  - ${w}`));
    }
  }

  // Group errors by category
  console.log('\n' + '-'.repeat(80));
  console.log('ERRORS BY CATEGORY:');
  console.log('-'.repeat(80));

  const errorsByCategory = {};
  for (const error of results.errors) {
    if (!errorsByCategory[error.category]) {
      errorsByCategory[error.category] = [];
    }
    errorsByCategory[error.category].push(error.input);
  }

  for (const [category, inputs] of Object.entries(errorsByCategory)) {
    console.log(`\n${category}: ${inputs.length} failures`);
    inputs.forEach(input => console.log(`  - "${input}"`));
  }

  // Performance stats
  const durations = results.details.filter(d => d.duration).map(d => d.duration);
  if (durations.length > 0) {
    console.log('\n' + '-'.repeat(80));
    console.log('PERFORMANCE:');
    console.log('-'.repeat(80));
    console.log(`  Average response time: ${Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)}ms`);
    console.log(`  Fastest: ${Math.min(...durations)}ms`);
    console.log(`  Slowest: ${Math.max(...durations)}ms`);
  }

  console.log('\n' + '='.repeat(80));
  console.log('TEST COMPLETE');
  console.log('='.repeat(80) + '\n');

  // Return exit code based on results
  process.exit(results.failed > 0 ? 1 : 0);
}

// Run the tests
runAllTests().catch(err => {
  console.error('Test runner failed:', err);
  process.exit(1);
});
