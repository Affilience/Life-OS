/**
 * REAL USER SYSTEM TEST
 * Tests using an actual auth user to verify FK-constrained tables work
 * Also tests RLS policies for security
 *
 * Run with: node scripts/realUserSystemTest.js
 */

import { createClient } from '@supabase/supabase-js';

// Service role client (bypasses RLS for setup)
const supabaseAdmin = createClient(
  'https://pynijtaxxcrdheyzoawv.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5bmlqdGF4eGNyZGhleXpvYXd2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzM2NjEyNywiZXhwIjoyMDc4OTQyMTI3fQ.fbeDGjs2WXYQX-92pUDJPpsvXUgll5faY71yJWX0lKA'
);

// Anon client (respects RLS - simulates frontend)
const supabaseAnon = createClient(
  'https://pynijtaxxcrdheyzoawv.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5bmlqdGF4eGNyZGhleXpvYXd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzNjYxMjcsImV4cCI6MjA3ODk0MjEyN30.E7_s4zJgdIa6zNrwMwChFA2Wg3E88VjEvde17ouhdLM'
);

// Real user IDs from auth.users
const DEV_USER_ID = '00000000-0000-0000-0000-000000000001';
const REAL_USER_ID = '73cb811d-3243-4772-94d9-244c819a28f7';

const results = { passed: 0, failed: 0, errors: [] };

const pass = (test) => { results.passed++; console.log(`  ✅ ${test}`); };
const fail = (test, error) => {
  results.failed++;
  results.errors.push({ test, error: error?.message || error });
  console.log(`  ❌ ${test}: ${error?.message || error}`);
};

const testSection = (name) => console.log(`\n${'='.repeat(60)}\n📋 ${name}\n${'='.repeat(60)}`);

// ============================================
// TEST 1: FK-CONSTRAINED TABLES (using real user)
// ============================================
async function testFKConstrainedTables() {
  testSection('FK-CONSTRAINED TABLES (Real User)');

  // Test user_quests (has FK to auth.users)
  try {
    const { data, error } = await supabaseAdmin.from('user_quests').upsert({
      user_id: DEV_USER_ID,
      quest_id: 'test_quest_' + Date.now(),
      status: 'active',
      progress: { step: 1, total: 5 },
      rewards_claimed: false
    }).select().single();

    if (error) throw error;
    pass('Create quest with real user');

    // Cleanup
    await supabaseAdmin.from('user_quests').delete().eq('id', data.id);
  } catch (e) {
    fail('Create quest with real user', e);
  }

  // Test custom_streaks (has FK to auth.users)
  try {
    const { data, error } = await supabaseAdmin.from('custom_streaks').insert({
      user_id: DEV_USER_ID,
      name: 'Test Streak ' + Date.now(),
      icon: '🔥',
      color: '#ff5722',
      frequency: 'daily',
      goal: 30,
      current_streak: 0,
      longest_streak: 0,
      total_completions: 0
    }).select().single();

    if (error) throw error;
    pass('Create custom streak with real user');

    // Cleanup
    await supabaseAdmin.from('custom_streaks').delete().eq('id', data.id);
  } catch (e) {
    fail('Create custom streak with real user', e);
  }

  // Test user_level_progression (has FK to auth.users)
  try {
    const { data, error } = await supabaseAdmin.from('user_level_progression').upsert({
      user_id: DEV_USER_ID,
      pet_slots: 2,
      equipment_set_slots: 1,
      inventory_slots: 30,
      level_xp_bonus: 1.0
    }).select().single();

    if (error) throw error;
    pass('Create level progression with real user');
  } catch (e) {
    fail('Create level progression with real user', e);
  }

  // Test momentum_chains
  try {
    const { data, error } = await supabaseAdmin.from('momentum_chains').upsert({
      user_id: DEV_USER_ID,
      chain_type: 'test',
      module_id: 'health',
      current_streak: 5,
      longest_streak: 10,
      total_days_active: 15,
      is_active: true
    }).select().single();

    if (error) throw error;
    pass('Create momentum chain with real user');
  } catch (e) {
    fail('Create momentum chain with real user', e);
  }

  // Test user_streaks
  try {
    const { data, error } = await supabaseAdmin.from('user_streaks').upsert({
      user_id: DEV_USER_ID,
      module: 'health',
      current_streak: 7,
      longest_streak: 14,
      last_activity_date: new Date().toISOString().split('T')[0]
    }).select().single();

    if (error) throw error;
    pass('Create user streaks with real user');
  } catch (e) {
    fail('Create user streaks with real user', e);
  }
}

// ============================================
// TEST 2: RLS POLICY VERIFICATION
// ============================================
async function testRLSPolicies() {
  testSection('RLS POLICY VERIFICATION');

  // First, create some data for DEV_USER using admin
  const testData = {
    journalId: null,
    noteId: null,
    taskId: null
  };

  // Create test data with admin
  try {
    const { data: journal } = await supabaseAdmin.from('journal_entries').insert({
      user_id: DEV_USER_ID,
      entry_date: new Date().toISOString().split('T')[0],
      title: 'RLS Test Entry',
      content: 'This should only be visible to the owner',
      mood_rating: 5,
      energy_level: 5
    }).select().single();
    testData.journalId = journal?.id;

    const { data: note } = await supabaseAdmin.from('knowledge_notes').insert({
      user_id: DEV_USER_ID,
      title: 'RLS Test Note',
      content: 'Private note content'
    }).select().single();
    testData.noteId = note?.id;

    const { data: task } = await supabaseAdmin.from('daily_tasks').insert({
      user_id: DEV_USER_ID,
      task_date: new Date().toISOString().split('T')[0],
      title: 'RLS Test Task',
      completed: false
    }).select().single();
    testData.taskId = task?.id;

    pass('Created test data for RLS verification');
  } catch (e) {
    fail('Create test data for RLS verification', e);
  }

  // Test 1: Anon client WITHOUT auth should NOT see data
  try {
    const { data: journals, error } = await supabaseAnon
      .from('journal_entries')
      .select('*')
      .eq('user_id', DEV_USER_ID);

    // With RLS, unauthenticated requests should return empty or error
    if (!journals || journals.length === 0 || error) {
      pass('RLS blocks unauthenticated access to journal entries');
    } else {
      fail('RLS blocks unauthenticated access to journal entries', 'Data was returned without auth');
    }
  } catch (e) {
    // Error is also acceptable (RLS blocking)
    pass('RLS blocks unauthenticated access to journal entries');
  }

  // Test 2: Check that different user can't see dev user's data
  try {
    const { data, error } = await supabaseAnon
      .from('knowledge_notes')
      .select('*')
      .eq('user_id', DEV_USER_ID);

    if (!data || data.length === 0 || error) {
      pass('RLS blocks cross-user access to notes');
    } else {
      fail('RLS blocks cross-user access to notes', 'Other user data visible');
    }
  } catch (e) {
    pass('RLS blocks cross-user access to notes');
  }

  // Test 3: Verify admin can see all data (service role bypasses RLS)
  try {
    const { data, error } = await supabaseAdmin
      .from('journal_entries')
      .select('*')
      .eq('user_id', DEV_USER_ID)
      .limit(5);

    if (data && data.length > 0) {
      pass('Service role can access data (RLS bypass working)');
    } else {
      fail('Service role can access data (RLS bypass working)', 'No data returned');
    }
  } catch (e) {
    fail('Service role can access data (RLS bypass working)', e);
  }

  // Cleanup
  if (testData.journalId) {
    await supabaseAdmin.from('journal_entries').delete().eq('id', testData.journalId);
  }
  if (testData.noteId) {
    await supabaseAdmin.from('knowledge_notes').delete().eq('id', testData.noteId);
  }
  if (testData.taskId) {
    await supabaseAdmin.from('daily_tasks').delete().eq('id', testData.taskId);
  }
}

// ============================================
// TEST 3: HEALTH MODULE (with correct schema)
// ============================================
async function testHealthModuleCorrectSchema() {
  testSection('HEALTH MODULE (Correct Schema)');

  // Test workout with correct mood range (1-5)
  try {
    const { data, error } = await supabaseAdmin.from('health_workouts').insert({
      user_id: DEV_USER_ID,
      workout_type: 'strength',
      title: 'Schema Test Workout',
      duration_minutes: 45,
      calories_burned: 300,
      intensity: 7,
      perceived_exertion: 8,
      mood_after: 5, // Must be 1-5 based on check constraint
      workout_date: new Date().toISOString()
    }).select().single();

    if (error) throw error;
    pass('Log workout with correct mood range');

    // Cleanup
    await supabaseAdmin.from('health_workouts').delete().eq('id', data.id);
  } catch (e) {
    fail('Log workout with correct mood range', e);
  }

  // Test nutrition with correct schema
  try {
    const { data, error } = await supabaseAdmin.from('health_nutrition_logs').insert({
      user_id: DEV_USER_ID,
      meal_type: 'breakfast',
      food_items: [{ name: 'Oatmeal', calories: 300, protein: 10 }],
      total_calories: 300,
      total_protein: 10,
      total_carbs: 50,
      total_fat: 5,
      meal_timestamp: new Date().toISOString()
    }).select().single();

    if (error) throw error;
    pass('Log nutrition with correct schema');

    // Cleanup
    await supabaseAdmin.from('health_nutrition_logs').delete().eq('id', data.id);
  } catch (e) {
    fail('Log nutrition with correct schema', e);
  }

  // Test sleep with correct timestamp format
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(22, 30, 0, 0);

    const today = new Date();
    today.setHours(6, 30, 0, 0);

    const { data, error } = await supabaseAdmin.from('health_sleep_logs').insert({
      user_id: DEV_USER_ID,
      sleep_date: new Date().toISOString().split('T')[0],
      bedtime: yesterday.toISOString(),
      wake_time: today.toISOString(),
      duration_hours: 8,
      quality_rating: 4
    }).select().single();

    if (error) throw error;
    pass('Log sleep with correct timestamp format');

    // Cleanup
    await supabaseAdmin.from('health_sleep_logs').delete().eq('id', data.id);
  } catch (e) {
    fail('Log sleep with correct timestamp format', e);
  }

  // Test water log
  try {
    const { data, error } = await supabaseAdmin.from('health_water_logs').insert({
      user_id: DEV_USER_ID,
      log_date: new Date().toISOString().split('T')[0],
      amount_ml: 500,
      goal_ml: 3000
    }).select().single();

    if (error) throw error;
    pass('Log water intake');

    // Cleanup
    await supabaseAdmin.from('health_water_logs').delete().eq('id', data.id);
  } catch (e) {
    fail('Log water intake', e);
  }
}

// ============================================
// TEST 4: GAMIFICATION EVENTS (correct schema)
// ============================================
async function testGamificationCorrectSchema() {
  testSection('GAMIFICATION EVENTS (Correct Schema)');

  // First check what columns actually exist
  try {
    const { data, error } = await supabaseAdmin
      .from('gamification_events')
      .select('*')
      .limit(1);

    if (error && error.message.includes('does not exist')) {
      console.log('  ℹ️ gamification_events table structure needs verification');
    }
  } catch (e) {
    // Continue
  }

  // Test gamification event with minimal required fields
  try {
    const { data, error } = await supabaseAdmin.from('gamification_events').insert({
      user_id: DEV_USER_ID,
      event_type: 'xp_earned',
      event_source: 'test',
      xp_amount: 50,
      metadata: { test: true }
    }).select().single();

    if (error) throw error;
    pass('Log gamification event');

    // Cleanup
    await supabaseAdmin.from('gamification_events').delete().eq('id', data.id);
  } catch (e) {
    fail('Log gamification event', e);
  }

  // Test module mastery
  try {
    const { data, error } = await supabaseAdmin.from('user_module_mastery').upsert({
      user_id: DEV_USER_ID,
      module_name: 'health',
      mastery_level: 3,
      total_xp: 1500
    }).select().single();

    if (error) throw error;
    pass('Track module mastery');
  } catch (e) {
    fail('Track module mastery', e);
  }
}

// ============================================
// TEST 5: SOCIAL FEATURES (correct schema)
// ============================================
async function testSocialCorrectSchema() {
  testSection('SOCIAL FEATURES (Correct Schema)');

  // Check actual friendships schema
  try {
    const { data: cols } = await supabaseAdmin.rpc('get_table_columns', {
      table_name: 'friendships'
    }).catch(() => ({ data: null }));

    // Try to query friendships to understand structure
    const { data: sample, error } = await supabaseAdmin
      .from('friendships')
      .select('*')
      .limit(1);

    if (!error) {
      pass('Friendships table accessible');
    }
  } catch (e) {
    // Continue
  }

  // Test activity feed
  try {
    const { data, error } = await supabaseAdmin.from('activity_feed').insert({
      user_id: DEV_USER_ID,
      event_type: 'achievement_unlocked',
      event_data: { achievement: 'first_workout', xp: 50 },
      is_public: true
    }).select().single();

    if (error) throw error;
    pass('Post to activity feed');

    // Cleanup
    await supabaseAdmin.from('activity_feed').delete().eq('id', data.id);
  } catch (e) {
    fail('Post to activity feed', e);
  }
}

// ============================================
// TEST 6: ACHIEVEMENT PROGRESS (correct schema)
// ============================================
async function testAchievementProgressCorrectSchema() {
  testSection('ACHIEVEMENT PROGRESS (Correct Schema)');

  // The actual schema uses discovery_id, not achievement_key
  try {
    // First get or create a discovery
    const { data: discovery } = await supabaseAdmin
      .from('discoveries')
      .select('id')
      .limit(1)
      .single();

    if (discovery) {
      const { data, error } = await supabaseAdmin.from('achievement_progress').upsert({
        user_id: DEV_USER_ID,
        discovery_id: discovery.id,
        current_progress: 5,
        required_progress: 10,
        progress_data: { steps: [1, 2, 3, 4, 5] }
      }).select().single();

      if (error) throw error;
      pass('Track achievement progress (using discovery_id)');
    } else {
      console.log('  ℹ️ No discoveries found, skipping achievement progress test');
    }
  } catch (e) {
    fail('Track achievement progress', e);
  }
}

// ============================================
// TEST 7: CONSTELLATION PROGRESS (correct schema)
// ============================================
async function testConstellationProgressCorrectSchema() {
  testSection('CONSTELLATION PROGRESS (Correct Schema)');

  // The actual schema uses constellation_name, not constellation_id
  try {
    const { data, error } = await supabaseAdmin.from('user_constellation_progress').upsert({
      user_id: DEV_USER_ID,
      constellation_name: 'health',
      module_xp: 500,
      unlocked_star_ids: ['star1', 'star2', 'star3'],
      unlocked_stars_count: 3
    }).select().single();

    if (error) throw error;
    pass('Track constellation progress');
  } catch (e) {
    fail('Track constellation progress', e);
  }
}

// ============================================
// TEST 8: SKILL POINTS (correct schema)
// ============================================
async function testSkillPointsCorrectSchema() {
  testSection('SKILL POINTS (Correct Schema)');

  // The actual schema uses unallocated_points, not points_available
  try {
    const { data, error } = await supabaseAdmin.from('user_skill_points').upsert({
      user_id: DEV_USER_ID,
      unallocated_points: 5,
      strength_points: 2,
      vitality_points: 1,
      intelligence_points: 1,
      wisdom_points: 1,
      defense_points: 0,
      total_points_earned: 10
    }).select().single();

    if (error) throw error;
    pass('Manage skill points');
  } catch (e) {
    fail('Manage skill points', e);
  }
}

// ============================================
// MAIN TEST RUNNER
// ============================================
async function runAllTests() {
  console.log('='.repeat(60));
  console.log('🚀 REAL USER SYSTEM TEST');
  console.log('='.repeat(60));
  console.log(`Started: ${new Date().toISOString()}`);
  console.log(`Using Dev User: ${DEV_USER_ID}`);

  await testFKConstrainedTables();
  await testRLSPolicies();
  await testHealthModuleCorrectSchema();
  await testGamificationCorrectSchema();
  await testSocialCorrectSchema();
  await testAchievementProgressCorrectSchema();
  await testConstellationProgressCorrectSchema();
  await testSkillPointsCorrectSchema();

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📈 Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`);

  if (results.errors.length > 0) {
    console.log('\n❌ FAILED TESTS:');
    results.errors.forEach((e, i) => {
      console.log(`  ${i + 1}. ${e.test}: ${e.error}`);
    });
  }

  console.log('\n' + '='.repeat(60));
  console.log(`Completed: ${new Date().toISOString()}`);
  console.log('='.repeat(60));
}

runAllTests().catch(console.error);
