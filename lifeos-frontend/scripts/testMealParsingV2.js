#!/usr/bin/env node
/**
 * Meal Parsing Test Suite v2 - Focused on identified issues
 * Tests: zero calorie bug, food matching, edge cases
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env.local') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing env vars');
  process.exit(1);
}

const EDGE_FUNCTION_URL = `${SUPABASE_URL}/functions/v1/parse-nutrition`;

async function testMeal(description, expectations = {}) {
  const start = Date.now();
  try {
    const response = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ mealDescription: description }),
    });

    if (!response.ok) {
      return {
        description,
        status: 'ERROR',
        error: `HTTP ${response.status}`,
        time: Date.now() - start
      };
    }

    const data = await response.json();
    const issues = [];

    // Check for zero calories bug
    if (data.totals?.calories === 0 && data.totals?.protein > 0) {
      issues.push('ZERO_CALORIE_BUG: Has protein but 0 calories');
    }

    // Check calorie range if expected
    if (expectations.minCal && data.totals?.calories < expectations.minCal) {
      issues.push(`LOW_CALORIES: ${data.totals.calories} < ${expectations.minCal}`);
    }
    if (expectations.maxCal && data.totals?.calories > expectations.maxCal) {
      issues.push(`HIGH_CALORIES: ${data.totals.calories} > ${expectations.maxCal}`);
    }

    // Check if correct food was matched
    if (expectations.shouldContain && data.items) {
      const allFoods = data.items.map(i => i.food?.toLowerCase() || '').join(' ');
      for (const term of expectations.shouldContain) {
        if (!allFoods.includes(term.toLowerCase())) {
          issues.push(`WRONG_MATCH: Should contain "${term}", got: ${data.items.map(i => i.food).join(', ')}`);
        }
      }
    }

    // Check if wrong food was matched
    if (expectations.shouldNotContain && data.items) {
      const allFoods = data.items.map(i => i.food?.toLowerCase() || '').join(' ');
      for (const term of expectations.shouldNotContain) {
        if (allFoods.includes(term.toLowerCase())) {
          issues.push(`INCORRECT_MATCH: Should NOT contain "${term}"`);
        }
      }
    }

    return {
      description,
      status: issues.length === 0 ? 'PASS' : 'FAIL',
      issues,
      calories: data.totals?.calories,
      protein: data.totals?.protein,
      items: data.items?.map(i => ({ food: i.food, cal: i.calories, grams: i.grams })),
      sources: data.dataSources,
      time: Date.now() - start
    };
  } catch (error) {
    return {
      description,
      status: 'ERROR',
      error: error.message,
      time: Date.now() - start
    };
  }
}

async function runTests() {
  console.log('='.repeat(80));
  console.log('MEAL PARSING TEST SUITE v2 - FOCUSED ON IDENTIFIED ISSUES');
  console.log('='.repeat(80));
  console.log();

  const tests = [
    // Zero calorie bug tests
    { desc: '100g chicken breast', expect: { minCal: 100, maxCal: 200, shouldContain: ['chicken'] } },
    { desc: '150g grilled chicken', expect: { minCal: 150, maxCal: 300, shouldContain: ['chicken'] } },
    { desc: '200g beef steak', expect: { minCal: 200, maxCal: 500, shouldContain: ['beef', 'steak'] } },
    { desc: '1 tbsp peanut butter', expect: { minCal: 80, maxCal: 120, shouldContain: ['peanut'] } },
    { desc: '1/4 cup almonds', expect: { minCal: 150, maxCal: 250, shouldContain: ['almond'] } },
    { desc: '4 chicken wings', expect: { minCal: 200, maxCal: 400 } },
    { desc: '6oz steak', expect: { minCal: 200, maxCal: 500 } },

    // Wrong food matching tests
    { desc: 'banana', expect: { minCal: 80, maxCal: 150, shouldContain: ['banana'], shouldNotContain: ['powder', 'dehydrated', 'dried'] } },
    { desc: 'medium banana', expect: { minCal: 90, maxCal: 130, shouldContain: ['banana'], shouldNotContain: ['powder', 'dehydrated'] } },
    { desc: 'apple', expect: { minCal: 50, maxCal: 120, shouldContain: ['apple'], shouldNotContain: ['rose'] } },
    { desc: 'small apple', expect: { minCal: 40, maxCal: 80, shouldNotContain: ['rose'] } },
    { desc: 'baked salmon', expect: { minCal: 200, maxCal: 400, shouldContain: ['salmon'], shouldNotContain: ['pastry', 'puff'] } },
    { desc: 'steamed broccoli', expect: { minCal: 30, maxCal: 80, shouldContain: ['broccoli'], shouldNotContain: ['corn'] } },
    { desc: 'grilled chicken breast', expect: { minCal: 150, maxCal: 300, shouldContain: ['chicken'], shouldNotContain: ['sandwich', 'wendy'] } },
    { desc: 'cup of milk', expect: { minCal: 100, maxCal: 180, shouldContain: ['milk'], shouldNotContain: ['cheese', 'mozzarella'] } },
    { desc: '50g oats', expect: { minCal: 150, maxCal: 220, shouldContain: ['oat'], shouldNotContain: ['oil'] } },
    { desc: 'roasted vegetables', expect: { minCal: 50, maxCal: 200, shouldNotContain: ['chicken'] } },
    { desc: 'boiled eggs', expect: { minCal: 70, maxCal: 100 } },
    { desc: 'poached eggs', expect: { minCal: 70, maxCal: 100 } },

    // Edge function error tests (previously failed)
    { desc: 'rice', expect: { minCal: 100, maxCal: 300 } },
    { desc: '250g pasta', expect: { minCal: 300, maxCal: 500 } },
    { desc: 'smoothie', expect: { minCal: 150, maxCal: 400 } },
    { desc: 'beer', expect: { minCal: 100, maxCal: 200 } },
    { desc: 'glass of wine', expect: { minCal: 100, maxCal: 180 } },
    { desc: '1/3 cup almonds', expect: { minCal: 180, maxCal: 300 } },
    { desc: 'whopper', expect: { minCal: 500, maxCal: 800 } },

    // Portion size issues
    { desc: 'big mac', expect: { minCal: 500, maxCal: 700 } }, // Was returning 1170 (double)
    { desc: 'a dozen eggs', expect: { minCal: 800, maxCal: 1000 } },
    { desc: 'large pizza slice', expect: { minCal: 250, maxCal: 450 } },
    { desc: 'bowl of ramen', expect: { minCal: 400, maxCal: 800 } },

    // Working tests (should still pass)
    { desc: '2 eggs', expect: { minCal: 120, maxCal: 180 } },
    { desc: 'chicken and rice', expect: { minCal: 300, maxCal: 600 } },
    { desc: '1 cup rice', expect: { minCal: 180, maxCal: 280 } },
    { desc: '2 tablespoons olive oil', expect: { minCal: 200, maxCal: 280 } },
    { desc: 'orange juice', expect: { minCal: 80, maxCal: 150 } },
    { desc: 'sushi roll', expect: { minCal: 200, maxCal: 400 } },
  ];

  const results = { pass: 0, fail: 0, error: 0 };
  const failures = [];
  const errors = [];

  for (const test of tests) {
    process.stdout.write(`Testing: "${test.desc}" ... `);
    const result = await testMeal(test.desc, test.expect);

    if (result.status === 'PASS') {
      console.log(`PASS (${result.calories} cal, ${result.time}ms)`);
      results.pass++;
    } else if (result.status === 'FAIL') {
      console.log(`FAIL`);
      result.issues.forEach(i => console.log(`  - ${i}`));
      results.fail++;
      failures.push(result);
    } else {
      console.log(`ERROR: ${result.error}`);
      results.error++;
      errors.push(result);
    }

    // Small delay to avoid rate limiting
    await new Promise(r => setTimeout(r, 500));
  }

  console.log();
  console.log('='.repeat(80));
  console.log('RESULTS SUMMARY');
  console.log('='.repeat(80));
  console.log(`PASSED: ${results.pass}`);
  console.log(`FAILED: ${results.fail}`);
  console.log(`ERRORS: ${results.error}`);
  console.log(`SUCCESS RATE: ${((results.pass / tests.length) * 100).toFixed(1)}%`);

  if (failures.length > 0) {
    console.log();
    console.log('--- FAILURES ---');
    failures.forEach(f => {
      console.log(`\n"${f.description}": ${f.calories} cal`);
      f.issues.forEach(i => console.log(`  - ${i}`));
      if (f.items) {
        console.log(`  Items: ${f.items.map(i => `${i.food} (${i.cal}cal/${i.grams}g)`).join(', ')}`);
      }
    });
  }

  if (errors.length > 0) {
    console.log();
    console.log('--- ERRORS ---');
    errors.forEach(e => {
      console.log(`"${e.description}": ${e.error}`);
    });
  }
}

runTests().catch(console.error);
