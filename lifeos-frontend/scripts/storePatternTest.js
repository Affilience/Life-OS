/**
 * STORE PATTERN VALIDATION TEST
 * Verifies all Zustand stores follow correct patterns for user isolation
 *
 * Run with: node scripts/storePatternTest.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storesDir = path.join(__dirname, '../src/stores');

const results = { passed: 0, failed: 0, warnings: 0, errors: [] };

const pass = (test) => { results.passed++; console.log(`  ✅ ${test}`); };
const fail = (test, reason) => {
  results.failed++;
  results.errors.push({ test, reason });
  console.log(`  ❌ ${test}: ${reason}`);
};
const warn = (test, reason) => {
  results.warnings++;
  console.log(`  ⚠️ ${test}: ${reason}`);
};

const testSection = (name) => console.log(`\n${'='.repeat(60)}\n📋 ${name}\n${'='.repeat(60)}`);

// Get all store files
const storeFiles = fs.readdirSync(storesDir)
  .filter(f => f.endsWith('.js') || f.endsWith('.ts'))
  .filter(f => f.includes('Store'));

console.log('='.repeat(60));
console.log('🔍 STORE PATTERN VALIDATION TEST');
console.log('='.repeat(60));
console.log(`Found ${storeFiles.length} store files to analyze`);

// ============================================
// TEST 1: Initialize Function Pattern
// ============================================
testSection('INITIALIZE FUNCTION PATTERN');

for (const file of storeFiles) {
  const content = fs.readFileSync(path.join(storesDir, file), 'utf-8');
  const storeName = file.replace(/\.(js|ts)$/, '');

  // Check for initialize function that accepts userId
  const hasInitialize = /initialize\w*\s*[:=]\s*async\s*\(.*userId/i.test(content) ||
                        /initialize\w*\s*=\s*async\s*\(.*userId/i.test(content) ||
                        /async\s+initialize\w*\s*\(.*userId/i.test(content);

  if (hasInitialize) {
    pass(`${storeName} has initialize function with userId`);
  } else if (content.includes('initialize')) {
    warn(`${storeName} has initialize but may not use userId`);
  } else {
    fail(`${storeName} missing initialize function`, 'No initialize pattern found');
  }
}

// ============================================
// TEST 2: User ID Filtering in Queries
// ============================================
testSection('USER ID FILTERING IN QUERIES');

for (const file of storeFiles) {
  const content = fs.readFileSync(path.join(storesDir, file), 'utf-8');
  const storeName = file.replace(/\.(js|ts)$/, '');

  // Check for .eq('user_id', ...) pattern in supabase queries
  const hasUserIdFilter = content.includes(".eq('user_id'") ||
                          content.includes('.eq("user_id"') ||
                          content.includes('.eq(`user_id`');

  // Check for supabase usage
  const usesSupabase = content.includes('supabase.from') ||
                       content.includes('supabase.rpc');

  if (!usesSupabase) {
    pass(`${storeName} (no Supabase queries - local only)`);
  } else if (hasUserIdFilter) {
    pass(`${storeName} filters by user_id`);
  } else {
    fail(`${storeName} uses Supabase but may not filter by user_id`, 'Check query patterns');
  }
}

// ============================================
// TEST 3: State Reset on User Change
// ============================================
testSection('STATE RESET CAPABILITY');

for (const file of storeFiles) {
  const content = fs.readFileSync(path.join(storesDir, file), 'utf-8');
  const storeName = file.replace(/\.(js|ts)$/, '');

  // Check for reset/clear function
  const hasReset = /reset\w*\s*[:=]\s*\(\)/i.test(content) ||
                   /clear\w*\s*[:=]\s*\(\)/i.test(content) ||
                   /resetState/i.test(content) ||
                   content.includes('set(initialState') ||
                   content.includes('set({ ...');

  if (hasReset) {
    pass(`${storeName} can reset state`);
  } else {
    warn(`${storeName} may not have state reset capability`);
  }
}

// ============================================
// TEST 4: Error Handling
// ============================================
testSection('ERROR HANDLING');

for (const file of storeFiles) {
  const content = fs.readFileSync(path.join(storesDir, file), 'utf-8');
  const storeName = file.replace(/\.(js|ts)$/, '');

  // Check for try/catch patterns
  const hasTryCatch = content.includes('try {') && content.includes('catch');
  const hasErrorState = content.includes('error:') || content.includes('setError');

  if (hasTryCatch && hasErrorState) {
    pass(`${storeName} has error handling`);
  } else if (hasTryCatch) {
    pass(`${storeName} has try/catch (basic error handling)`);
  } else {
    warn(`${storeName} may lack error handling`);
  }
}

// ============================================
// TEST 5: Loading States
// ============================================
testSection('LOADING STATE MANAGEMENT');

for (const file of storeFiles) {
  const content = fs.readFileSync(path.join(storesDir, file), 'utf-8');
  const storeName = file.replace(/\.(js|ts)$/, '');

  // Check for loading state
  const hasLoadingState = content.includes('loading:') ||
                          content.includes('isLoading:') ||
                          content.includes('setLoading');

  if (hasLoadingState) {
    pass(`${storeName} has loading state`);
  } else {
    // Not all stores need loading state
    console.log(`  ℹ️ ${storeName} (no loading state - may be intentional)`);
  }
}

// ============================================
// TEST 6: Persist Middleware
// ============================================
testSection('PERSIST MIDDLEWARE USAGE');

let persistCount = 0;
let noPersistCount = 0;

for (const file of storeFiles) {
  const content = fs.readFileSync(path.join(storesDir, file), 'utf-8');
  const storeName = file.replace(/\.(js|ts)$/, '');

  const usesPersist = content.includes('persist(') ||
                      content.includes('persist,') ||
                      content.includes("from 'zustand/middleware'");

  if (usesPersist) {
    persistCount++;
    pass(`${storeName} uses persist middleware`);
  } else {
    noPersistCount++;
    console.log(`  ℹ️ ${storeName} (no persist - data fetched fresh)`);
  }
}

console.log(`\n  Summary: ${persistCount} stores use persist, ${noPersistCount} fetch fresh`);

// ============================================
// TEST 7: Supabase Import Check
// ============================================
testSection('SUPABASE CLIENT IMPORT');

for (const file of storeFiles) {
  const content = fs.readFileSync(path.join(storesDir, file), 'utf-8');
  const storeName = file.replace(/\.(js|ts)$/, '');

  const importsSupabase = content.includes("from '../lib/supabase'") ||
                          content.includes('from "../lib/supabase"') ||
                          content.includes("from '@/lib/supabase'");

  const usesSupabase = content.includes('supabase.');

  if (importsSupabase || !usesSupabase) {
    pass(`${storeName} correct Supabase import`);
  } else {
    fail(`${storeName} uses Supabase but import not found`, 'Check import path');
  }
}

// ============================================
// SUMMARY
// ============================================
console.log('\n' + '='.repeat(60));
console.log('📊 VALIDATION SUMMARY');
console.log('='.repeat(60));
console.log(`✅ Passed: ${results.passed}`);
console.log(`❌ Failed: ${results.failed}`);
console.log(`⚠️ Warnings: ${results.warnings}`);
console.log(`📈 Pass Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`);

if (results.errors.length > 0) {
  console.log('\n❌ ISSUES TO REVIEW:');
  results.errors.forEach((e, i) => {
    console.log(`  ${i + 1}. ${e.test}: ${e.reason}`);
  });
}

console.log('\n' + '='.repeat(60));
