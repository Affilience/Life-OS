#!/usr/bin/env node
/**
 * Comprehensive Meal Parsing Test Suite
 * Tests a wide variety of food inputs to measure accuracy
 */

const TEST_CASES = [
  // === PROTEINS ===
  // Chicken
  { input: '100g chicken breast', minCal: 140, maxCal: 180, shouldContain: ['chicken'] },
  { input: '150g grilled chicken', minCal: 200, maxCal: 280, shouldContain: ['chicken'] },
  { input: 'grilled chicken breast', minCal: 200, maxCal: 350, shouldContain: ['chicken'] },
  { input: '4 chicken wings', minCal: 200, maxCal: 400, shouldContain: ['chicken', 'wing'] },
  { input: 'rotisserie chicken thigh', minCal: 150, maxCal: 300, shouldContain: ['chicken'] },

  // Beef
  { input: '200g beef steak', minCal: 300, maxCal: 500, shouldContain: ['beef', 'steak'] },
  { input: '6oz steak', minCal: 250, maxCal: 400, shouldContain: ['steak', 'beef'] },
  { input: 'ground beef patty', minCal: 200, maxCal: 350, shouldContain: ['beef'] },

  // Fish
  { input: 'baked salmon', minCal: 250, maxCal: 400, shouldContain: ['salmon'] },
  { input: '150g grilled salmon', minCal: 250, maxCal: 350, shouldContain: ['salmon'] },
  { input: 'tuna salad sandwich', minCal: 300, maxCal: 500, shouldContain: ['tuna'] },

  // Eggs
  { input: '2 eggs', minCal: 130, maxCal: 180, shouldContain: ['egg'] },
  { input: 'boiled eggs', minCal: 70, maxCal: 160, shouldContain: ['egg'] },
  { input: 'poached eggs', minCal: 70, maxCal: 160, shouldContain: ['egg'] },
  { input: 'scrambled eggs', minCal: 150, maxCal: 250, shouldContain: ['egg'] },
  { input: 'a dozen eggs', minCal: 800, maxCal: 1000, shouldContain: ['egg'] },
  { input: '3 egg omelette with cheese', minCal: 300, maxCal: 500, shouldContain: ['egg'] },

  // === CARBOHYDRATES ===
  // Rice & Grains
  { input: '1 cup rice', minCal: 180, maxCal: 250, shouldContain: ['rice'] },
  { input: 'rice', minCal: 150, maxCal: 250, shouldContain: ['rice'] },
  { input: '50g oats', minCal: 150, maxCal: 220, shouldContain: ['oat'] },
  { input: 'bowl of oatmeal', minCal: 150, maxCal: 300, shouldContain: ['oat'] },
  { input: 'quinoa bowl', minCal: 200, maxCal: 350, shouldContain: ['quinoa'] },

  // Pasta & Bread
  { input: '250g pasta', minCal: 300, maxCal: 450, shouldContain: ['pasta'] },
  { input: 'spaghetti with marinara', minCal: 350, maxCal: 550, shouldContain: ['spaghetti', 'pasta'] },
  { input: '2 slices of bread', minCal: 120, maxCal: 200, shouldContain: ['bread'] },
  { input: 'whole wheat toast', minCal: 60, maxCal: 120, shouldContain: ['bread', 'toast', 'wheat'] },

  // === FRUITS ===
  { input: 'banana', minCal: 90, maxCal: 130, shouldContain: ['banana'] },
  { input: 'medium banana', minCal: 90, maxCal: 130, shouldContain: ['banana'] },
  { input: 'apple', minCal: 80, maxCal: 130, shouldContain: ['apple'] },
  { input: 'small apple', minCal: 60, maxCal: 100, shouldContain: ['apple'] },
  { input: 'orange', minCal: 50, maxCal: 90, shouldContain: ['orange'] },
  { input: 'cup of strawberries', minCal: 40, maxCal: 70, shouldContain: ['strawberr'] },
  { input: 'handful of grapes', minCal: 50, maxCal: 100, shouldContain: ['grape'] },

  // === VEGETABLES ===
  { input: 'steamed broccoli', minCal: 30, maxCal: 80, shouldContain: ['broccoli'], shouldNotContain: ['chicken', 'beef', 'meat'] },
  { input: 'roasted vegetables', minCal: 80, maxCal: 200, shouldContain: ['vegetable'], shouldNotContain: ['chicken', 'beef', 'meat'] },
  { input: 'side salad', minCal: 30, maxCal: 100, shouldContain: ['salad'] },
  { input: 'caesar salad', minCal: 200, maxCal: 400, shouldContain: ['salad', 'caesar'] },
  { input: 'baked potato', minCal: 150, maxCal: 250, shouldContain: ['potato'] },
  { input: 'mashed potatoes', minCal: 150, maxCal: 300, shouldContain: ['potato'] },

  // === DAIRY ===
  { input: 'cup of milk', minCal: 100, maxCal: 180, shouldContain: ['milk'] },
  { input: 'glass of milk', minCal: 100, maxCal: 180, shouldContain: ['milk'] },
  { input: 'greek yogurt', minCal: 100, maxCal: 180, shouldContain: ['yogurt'] },
  { input: 'slice of cheese', minCal: 80, maxCal: 130, shouldContain: ['cheese'] },
  { input: 'cottage cheese', minCal: 100, maxCal: 200, shouldContain: ['cheese', 'cottage'] },

  // === FATS & NUTS ===
  { input: '1 tbsp peanut butter', minCal: 80, maxCal: 110, shouldContain: ['peanut'] },
  { input: '2 tablespoons peanut butter', minCal: 160, maxCal: 220, shouldContain: ['peanut'] },
  { input: '1/4 cup almonds', minCal: 150, maxCal: 220, shouldContain: ['almond'] },
  { input: '1/3 cup almonds', minCal: 200, maxCal: 320, shouldContain: ['almond'] },
  { input: 'handful of walnuts', minCal: 150, maxCal: 250, shouldContain: ['walnut'] },
  { input: '2 tablespoons olive oil', minCal: 220, maxCal: 280, shouldContain: ['olive', 'oil'] },
  { input: 'avocado', minCal: 200, maxCal: 350, shouldContain: ['avocado'] },

  // === BEVERAGES ===
  { input: 'orange juice', minCal: 80, maxCal: 160, shouldContain: ['orange', 'juice'] },
  { input: 'glass of wine', minCal: 100, maxCal: 150, shouldContain: ['wine'] },
  { input: 'beer', minCal: 100, maxCal: 200, shouldContain: ['beer'] },
  { input: 'smoothie', minCal: 150, maxCal: 350, shouldNotContain: ['chicken', 'beef'] },
  { input: 'protein shake', minCal: 100, maxCal: 300, shouldContain: ['protein'] },
  { input: 'latte', minCal: 100, maxCal: 250, shouldContain: ['latte', 'coffee'] },
  { input: 'cappuccino', minCal: 80, maxCal: 180, shouldContain: ['cappuccino', 'coffee'] },

  // === FAST FOOD ===
  { input: 'big mac', minCal: 500, maxCal: 600, shouldContain: ['big mac', 'mcdonald'] },
  { input: 'whopper', minCal: 600, maxCal: 750, shouldContain: ['whopper', 'burger king'] },
  { input: 'cheeseburger', minCal: 250, maxCal: 400, shouldContain: ['burger', 'cheese'] },
  { input: 'large fries', minCal: 400, maxCal: 550, shouldContain: ['fries', 'potato'] },
  { input: 'chicken nuggets 6 piece', minCal: 250, maxCal: 350, shouldContain: ['chicken', 'nugget'] },

  // === RESTAURANT/PREPARED FOODS ===
  { input: 'large pizza slice', minCal: 250, maxCal: 450, shouldContain: ['pizza'] },
  { input: 'pepperoni pizza slice', minCal: 250, maxCal: 400, shouldContain: ['pizza', 'pepperoni'] },
  { input: 'bowl of ramen', minCal: 350, maxCal: 600, shouldContain: ['ramen'] },
  { input: 'sushi roll', minCal: 200, maxCal: 400, shouldContain: ['sushi', 'roll'] },
  { input: 'california roll', minCal: 200, maxCal: 350, shouldContain: ['california', 'roll'] },
  { input: 'burrito', minCal: 500, maxCal: 900, shouldContain: ['burrito'] },
  { input: 'tacos', minCal: 150, maxCal: 300, shouldContain: ['taco'] },

  // === COMBINATION MEALS ===
  { input: 'chicken and rice', minCal: 350, maxCal: 550, shouldContain: ['chicken', 'rice'] },
  { input: 'steak and potatoes', minCal: 400, maxCal: 700, shouldContain: ['steak', 'potato'] },
  { input: 'fish and chips', minCal: 600, maxCal: 1000, shouldContain: ['fish'] },
  { input: 'bacon and eggs', minCal: 250, maxCal: 450, shouldContain: ['bacon', 'egg'] },

  // === SNACKS ===
  { input: 'granola bar', minCal: 100, maxCal: 200, shouldContain: ['granola'] },
  { input: 'protein bar', minCal: 150, maxCal: 280, shouldContain: ['protein'] },
  { input: 'bag of chips', minCal: 150, maxCal: 300, shouldContain: ['chip'] },
  { input: 'popcorn', minCal: 80, maxCal: 200, shouldContain: ['popcorn'] },

  // === DESSERTS ===
  { input: 'chocolate chip cookie', minCal: 100, maxCal: 200, shouldContain: ['cookie'] },
  { input: 'slice of cake', minCal: 200, maxCal: 400, shouldContain: ['cake'] },
  { input: 'ice cream cone', minCal: 150, maxCal: 350, shouldContain: ['ice cream'] },
  { input: 'brownie', minCal: 200, maxCal: 400, shouldContain: ['brownie'] },
];

const EDGE_URL = process.env.SUPABASE_EDGE_URL || 'https://pynijtaxxcrdheyzoawv.supabase.co/functions/v1/parse-nutrition';
const ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5bmlqdGF4eGNyZGhleXpvYXd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzNjYxMjcsImV4cCI6MjA3ODk0MjEyN30.E7_s4zJgdIa6zNrwMwChFA2Wg3E88VjEvde17ouhdLM';

async function testMealParsing(input) {
  const startTime = Date.now();
  try {
    const response = await fetch(EDGE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ANON_KEY}`,
      },
      body: JSON.stringify({ mealDescription: input }),
    });

    const elapsed = Date.now() - startTime;

    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}`, elapsed };
    }

    const data = await response.json();
    return { success: true, data, elapsed };
  } catch (error) {
    return { success: false, error: error.message, elapsed: Date.now() - startTime };
  }
}

function checkTestCase(testCase, result) {
  const issues = [];

  if (!result.success) {
    return { passed: false, issues: [`ERROR: ${result.error}`] };
  }

  const data = result.data;
  const totalCalories = data.totals?.calories || data.totalCalories || 0;
  const items = data.items || [];
  const itemDescriptions = items.map(i => (i.name || '').toLowerCase()).join(' ');

  // Check calorie range
  if (totalCalories < testCase.minCal) {
    issues.push(`LOW_CALORIES: ${totalCalories} < ${testCase.minCal}`);
  }
  if (totalCalories > testCase.maxCal) {
    issues.push(`HIGH_CALORIES: ${totalCalories} > ${testCase.maxCal}`);
  }

  // Check shouldContain
  if (testCase.shouldContain) {
    for (const keyword of testCase.shouldContain) {
      if (!itemDescriptions.includes(keyword.toLowerCase())) {
        // Check if any item contains the keyword
        const found = items.some(item =>
          (item.name || '').toLowerCase().includes(keyword.toLowerCase())
        );
        if (!found) {
          issues.push(`MISSING: Should contain "${keyword}"`);
        }
      }
    }
  }

  // Check shouldNotContain
  if (testCase.shouldNotContain) {
    for (const keyword of testCase.shouldNotContain) {
      const found = items.some(item =>
        (item.name || '').toLowerCase().includes(keyword.toLowerCase())
      );
      if (found) {
        issues.push(`INCORRECT_MATCH: Should NOT contain "${keyword}"`);
      }
    }
  }

  return { passed: issues.length === 0, issues };
}

async function runTests() {
  console.log('='.repeat(80));
  console.log('COMPREHENSIVE MEAL PARSING TEST SUITE');
  console.log('='.repeat(80));
  console.log(`Testing ${TEST_CASES.length} cases...\n`);

  const results = {
    passed: [],
    failed: [],
    errors: [],
  };

  for (const testCase of TEST_CASES) {
    process.stdout.write(`Testing: "${testCase.input}" ... `);

    const result = await testMealParsing(testCase.input);
    const check = checkTestCase(testCase, result);

    if (!result.success) {
      console.log(`ERROR: ${result.error}`);
      results.errors.push({ testCase, result, check });
    } else if (check.passed) {
      const cals = result.data.totals?.calories || result.data.totalCalories || 0;
      console.log(`PASS (${cals} cal, ${result.elapsed}ms)`);
      results.passed.push({ testCase, result, check });
    } else {
      console.log('FAIL');
      check.issues.forEach(issue => console.log(`  - ${issue}`));
      results.failed.push({ testCase, result, check });
    }
  }

  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('RESULTS SUMMARY');
  console.log('='.repeat(80));
  console.log(`PASSED: ${results.passed.length}`);
  console.log(`FAILED: ${results.failed.length}`);
  console.log(`ERRORS: ${results.errors.length}`);
  console.log(`SUCCESS RATE: ${((results.passed.length / TEST_CASES.length) * 100).toFixed(1)}%`);

  // Detailed failures
  if (results.failed.length > 0) {
    console.log('\n--- FAILURES ---\n');
    results.failed.forEach(({ testCase, result, check }) => {
      console.log(`"${testCase.input}": ${result.data.totalCalories} cal`);
      check.issues.forEach(issue => console.log(`  - ${issue}`));
      const items = result.data.items || [];
      if (items.length > 0) {
        console.log(`  Items: ${items.map(i => `${i.name} (${i.calories}cal/${i.quantity}${i.unit})`).join(', ')}`);
      }
      console.log();
    });
  }

  // Detailed errors
  if (results.errors.length > 0) {
    console.log('\n--- ERRORS ---');
    results.errors.forEach(({ testCase, result }) => {
      console.log(`"${testCase.input}": ${result.error}`);
    });
  }

  // Category breakdown
  console.log('\n--- CATEGORY BREAKDOWN ---');
  const categories = {
    'Proteins': TEST_CASES.filter(t => t.input.match(/chicken|beef|steak|salmon|egg|fish|tuna/i)),
    'Carbs': TEST_CASES.filter(t => t.input.match(/rice|oat|pasta|bread|quinoa/i)),
    'Fruits': TEST_CASES.filter(t => t.input.match(/banana|apple|orange|strawberr|grape/i)),
    'Vegetables': TEST_CASES.filter(t => t.input.match(/broccoli|vegetable|salad|potato/i)),
    'Dairy': TEST_CASES.filter(t => t.input.match(/milk|yogurt|cheese/i)),
    'Fast Food': TEST_CASES.filter(t => t.input.match(/big mac|whopper|burger|fries|nugget|pizza/i)),
    'Beverages': TEST_CASES.filter(t => t.input.match(/juice|wine|beer|smoothie|shake|latte|cappuccino/i)),
  };

  for (const [category, tests] of Object.entries(categories)) {
    const passedInCat = tests.filter(t =>
      results.passed.some(p => p.testCase.input === t.input)
    ).length;
    console.log(`${category}: ${passedInCat}/${tests.length} (${((passedInCat/tests.length)*100).toFixed(0)}%)`);
  }
}

runTests().catch(console.error);
