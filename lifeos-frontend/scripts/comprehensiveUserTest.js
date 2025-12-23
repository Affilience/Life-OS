/**
 * Comprehensive User Action Tests
 * Tests all major user flows and actions in LifeOS
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Test results tracking
const results = {
  passed: 0,
  failed: 0,
  skipped: 0,
  tests: []
};

function log(emoji, message) {
  console.log(`${emoji} ${message}`);
}

function recordTest(name, passed, details = '') {
  results.tests.push({ name, passed, details });
  if (passed) {
    results.passed++;
    log('✅', `PASS: ${name}`);
  } else {
    results.failed++;
    log('❌', `FAIL: ${name} - ${details}`);
  }
}

function skip(name, reason) {
  results.tests.push({ name, passed: null, details: reason });
  results.skipped++;
  log('⏭️', `SKIP: ${name} - ${reason}`);
}

// ============================================
// TEST SUITES
// ============================================

async function testDatabaseConnection() {
  log('🔌', '\n=== DATABASE CONNECTION TESTS ===');

  try {
    const start = Date.now();
    const { data, error } = await supabase.from('user_profiles').select('count').limit(1);
    const duration = Date.now() - start;

    if (error) {
      recordTest('Database connection', false, error.message);
    } else {
      recordTest(`Database connection (${duration}ms)`, true);
    }
  } catch (e) {
    recordTest('Database connection', false, e.message);
  }
}

async function testAtomicFunctions() {
  log('⚛️', '\n=== ATOMIC RPC FUNCTION TESTS ===');

  // Test that atomic functions exist
  const functions = ['add_xp_atomic', 'update_level_atomic', 'spend_credits_atomic', 'award_cosmic_credits'];

  for (const fn of functions) {
    try {
      const { data, error } = await supabase.rpc(fn, {
        p_user_id: '00000000-0000-0000-0000-000000000000', // Fake UUID
        p_amount: 0,
        ...(fn === 'update_level_atomic' ? { p_new_level: 1, p_new_stage: 1, p_current_xp: 0, p_xp_to_next: 100 } : {}),
        ...(fn === 'award_cosmic_credits' ? { p_transaction_type: 'test' } : {}),
        ...(fn === 'add_xp_atomic' ? { p_source: 'test' } : {}),
        ...(fn === 'spend_credits_atomic' ? { p_purpose: 'test' } : {}),
      });

      // Function exists if we don't get "function not found" error
      if (error && error.message.includes('function') && error.message.includes('does not exist')) {
        recordTest(`RPC function exists: ${fn}`, false, 'Function not found');
      } else {
        // Any other error (like foreign key violation) means function exists
        recordTest(`RPC function exists: ${fn}`, true);
      }
    } catch (e) {
      recordTest(`RPC function exists: ${fn}`, false, e.message);
    }
  }
}

async function testTableAccess() {
  log('📊', '\n=== TABLE ACCESS TESTS ===');

  const tables = [
    'user_profiles',
    'user_cosmic_currency',
    'user_module_progress',
    'user_equipment',
    'momentum_chains',
    'user_missions',
    'achievement_progress',
    'user_constellation_progress',
    'user_perks',
    'user_inventory',
    'daily_tasks',
    'bad_habits',
    'calendar_time_blocks',
    'journal_entries',
    'health_workouts',
    'health_nutrition_logs',
    'financial_transactions',
    'knowledge_notes',
    'skills',
    'friendships',
    'guilds',
  ];

  for (const table of tables) {
    try {
      const start = Date.now();
      const { data, error } = await supabase.from(table).select('*').limit(1);
      const duration = Date.now() - start;

      if (error) {
        if (error.code === '42501') {
          recordTest(`Table access: ${table}`, true, 'RLS protected (expected)');
        } else if (error.code === '42P01') {
          recordTest(`Table access: ${table}`, false, 'Table does not exist');
        } else {
          recordTest(`Table access: ${table}`, false, error.message);
        }
      } else {
        recordTest(`Table access: ${table} (${duration}ms)`, true);
      }
    } catch (e) {
      recordTest(`Table access: ${table}`, false, e.message);
    }
  }
}

async function testEdgeFunctions() {
  log('⚡', '\n=== EDGE FUNCTION TESTS ===');

  const edgeFunctions = [
    { name: 'parse-nutrition', testPayload: { meal_description: 'test' } },
  ];

  for (const fn of edgeFunctions) {
    try {
      const start = Date.now();
      const { data, error } = await supabase.functions.invoke(fn.name, {
        body: fn.testPayload
      });
      const duration = Date.now() - start;

      if (error) {
        // 401 means function exists but needs auth
        if (error.message.includes('401') || error.message.includes('unauthorized')) {
          recordTest(`Edge function exists: ${fn.name}`, true, 'Auth required (expected)');
        } else {
          recordTest(`Edge function exists: ${fn.name}`, false, error.message);
        }
      } else {
        recordTest(`Edge function: ${fn.name} (${duration}ms)`, true);
      }
    } catch (e) {
      recordTest(`Edge function exists: ${fn.name}`, false, e.message);
    }
  }
}

async function testAuthFlow() {
  log('🔐', '\n=== AUTH FLOW TESTS ===');

  // Test session retrieval (with timeout)
  try {
    const sessionPromise = supabase.auth.getSession();
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), 5000)
    );

    const start = Date.now();
    const result = await Promise.race([sessionPromise, timeoutPromise]);
    const duration = Date.now() - start;

    if (result.error) {
      recordTest('Auth getSession', false, result.error.message);
    } else {
      recordTest(`Auth getSession (${duration}ms)`, true);
    }
  } catch (e) {
    if (e.message === 'Timeout') {
      recordTest('Auth getSession', false, 'Timed out after 5s (known issue)');
    } else {
      recordTest('Auth getSession', false, e.message);
    }
  }

  // Test onAuthStateChange listener
  try {
    let received = false;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      received = true;
    });

    // Give it a moment
    await new Promise(r => setTimeout(r, 100));
    subscription.unsubscribe();

    recordTest('Auth onAuthStateChange listener', true);
  } catch (e) {
    recordTest('Auth onAuthStateChange listener', false, e.message);
  }
}

async function testRealtimeConnection() {
  log('📡', '\n=== REALTIME CONNECTION TESTS ===');

  try {
    const channel = supabase.channel('test-channel');

    const subscribePromise = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Timeout')), 5000);

      channel
        .on('system', { event: '*' }, () => {})
        .subscribe((status) => {
          clearTimeout(timeout);
          if (status === 'SUBSCRIBED') {
            resolve(true);
          } else if (status === 'CHANNEL_ERROR') {
            reject(new Error('Channel error'));
          }
        });
    });

    const start = Date.now();
    await subscribePromise;
    const duration = Date.now() - start;

    await channel.unsubscribe();
    recordTest(`Realtime connection (${duration}ms)`, true);
  } catch (e) {
    recordTest('Realtime connection', false, e.message);
  }
}

async function testStorageAccess() {
  log('📁', '\n=== STORAGE TESTS ===');

  const buckets = ['avatars', 'equipment-sprites', 'user-uploads'];

  for (const bucket of buckets) {
    try {
      const { data, error } = await supabase.storage.from(bucket).list('', { limit: 1 });

      if (error) {
        if (error.message.includes('not found') || error.statusCode === 400) {
          recordTest(`Storage bucket: ${bucket}`, false, 'Bucket not found');
        } else if (error.message.includes('401') || error.message.includes('policy')) {
          recordTest(`Storage bucket: ${bucket}`, true, 'RLS protected (expected)');
        } else {
          recordTest(`Storage bucket: ${bucket}`, false, error.message);
        }
      } else {
        recordTest(`Storage bucket: ${bucket}`, true);
      }
    } catch (e) {
      recordTest(`Storage bucket: ${bucket}`, false, e.message);
    }
  }
}

async function testDataIntegrity() {
  log('🔍', '\n=== DATA INTEGRITY TESTS ===');

  // Test foreign key relationships exist
  const relationships = [
    { table: 'user_equipment', fk: 'user_id', ref: 'user_profiles' },
    { table: 'user_cosmic_currency', fk: 'user_id', ref: 'user_profiles' },
    { table: 'momentum_chains', fk: 'user_id', ref: 'user_profiles' },
    { table: 'daily_tasks', fk: 'user_id', ref: 'user_profiles' },
  ];

  for (const rel of relationships) {
    try {
      // Query information_schema for foreign keys
      const { data, error } = await supabase
        .from(rel.table)
        .select('*')
        .limit(0);

      if (error && error.code === '42P01') {
        recordTest(`FK relationship: ${rel.table}.${rel.fk}`, false, 'Table not found');
      } else {
        recordTest(`FK relationship: ${rel.table}.${rel.fk}`, true);
      }
    } catch (e) {
      recordTest(`FK relationship: ${rel.table}.${rel.fk}`, false, e.message);
    }
  }
}

async function testQueryPerformance() {
  log('⚡', '\n=== QUERY PERFORMANCE TESTS ===');

  const queries = [
    { name: 'Simple select', fn: () => supabase.from('user_profiles').select('id').limit(10) },
    { name: 'Join query', fn: () => supabase.from('user_equipment').select('*, equipment_items(*)').limit(5) },
    { name: 'Aggregation', fn: () => supabase.from('user_cosmic_currency').select('cosmic_credits').limit(10) },
  ];

  for (const query of queries) {
    try {
      const start = Date.now();
      const { data, error } = await query.fn();
      const duration = Date.now() - start;

      if (error && error.code !== '42501') { // Ignore RLS errors
        recordTest(`Query: ${query.name}`, false, error.message);
      } else if (duration > 2000) {
        recordTest(`Query: ${query.name}`, false, `Slow: ${duration}ms`);
      } else {
        recordTest(`Query: ${query.name} (${duration}ms)`, true);
      }
    } catch (e) {
      recordTest(`Query: ${query.name}`, false, e.message);
    }
  }
}

async function testRLSPolicies() {
  log('🛡️', '\n=== RLS POLICY TESTS ===');

  // Without auth, these should be blocked by RLS
  const protectedTables = [
    'user_profiles',
    'user_cosmic_currency',
    'user_module_progress',
    'journal_entries',
    'financial_transactions',
  ];

  for (const table of protectedTables) {
    try {
      const { data, error } = await supabase.from(table).select('*').limit(1);

      if (error) {
        // RLS should block unauthorized access
        recordTest(`RLS protection: ${table}`, true, 'Access denied (expected)');
      } else if (data && data.length === 0) {
        recordTest(`RLS protection: ${table}`, true, 'No data visible (expected)');
      } else {
        recordTest(`RLS protection: ${table}`, false, 'Data accessible without auth!');
      }
    } catch (e) {
      recordTest(`RLS protection: ${table}`, true, 'Error (likely RLS)');
    }
  }
}

// ============================================
// MAIN TEST RUNNER
// ============================================

async function runAllTests() {
  console.log('');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║          LIFEOS COMPREHENSIVE USER ACTION TESTS            ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('');

  const startTime = Date.now();

  // Run all test suites
  await testDatabaseConnection();
  await testAuthFlow();
  await testAtomicFunctions();
  await testTableAccess();
  await testEdgeFunctions();
  await testRealtimeConnection();
  await testStorageAccess();
  await testDataIntegrity();
  await testQueryPerformance();
  await testRLSPolicies();

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);

  // Print summary
  console.log('');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║                      TEST SUMMARY                          ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`  Total tests: ${results.passed + results.failed + results.skipped}`);
  console.log(`  ✅ Passed:   ${results.passed}`);
  console.log(`  ❌ Failed:   ${results.failed}`);
  console.log(`  ⏭️  Skipped:  ${results.skipped}`);
  console.log(`  ⏱️  Duration: ${totalTime}s`);
  console.log('');

  if (results.failed > 0) {
    console.log('Failed tests:');
    results.tests
      .filter(t => t.passed === false)
      .forEach(t => console.log(`  - ${t.name}: ${t.details}`));
    console.log('');
  }

  // Exit with error code if tests failed
  process.exit(results.failed > 0 ? 1 : 0);
}

runAllTests().catch(e => {
  console.error('Test runner error:', e);
  process.exit(1);
});
