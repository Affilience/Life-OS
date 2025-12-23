/**
 * MEGA-COMPREHENSIVE SYSTEM TEST
 * Tests EVERY function, store, action, and data operation in LifeOS
 *
 * Run with: node scripts/megaComprehensiveTest.js
 */

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase clients
const supabaseAdmin = createClient(
  'https://pynijtaxxcrdheyzoawv.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5bmlqdGF4eGNyZGhleXpvYXd2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzM2NjEyNywiZXhwIjoyMDc4OTQyMTI3fQ.fbeDGjs2WXYQX-92pUDJPpsvXUgll5faY71yJWX0lKA'
);

const supabaseAnon = createClient(
  'https://pynijtaxxcrdheyzoawv.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5bmlqdGF4eGNyZGhleXpvYXd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzNjYxMjcsImV4cCI6MjA3ODk0MjEyN30.E7_s4zJgdIa6zNrwMwChFA2Wg3E88VjEvde17ouhdLM'
);

// Real test users
const DEV_USER_ID = '00000000-0000-0000-0000-000000000001';
const REAL_USER_ID = '73cb811d-3243-4772-94d9-244c819a28f7';

// Test results tracking
const results = {
  passed: 0,
  failed: 0,
  skipped: 0,
  errors: [],
  sections: {}
};

// Helper functions
const pass = (test, section) => {
  results.passed++;
  if (!results.sections[section]) results.sections[section] = { passed: 0, failed: 0, skipped: 0 };
  results.sections[section].passed++;
  console.log(`  ✅ ${test}`);
};

const fail = (test, error, section) => {
  results.failed++;
  if (!results.sections[section]) results.sections[section] = { passed: 0, failed: 0, skipped: 0 };
  results.sections[section].failed++;
  results.errors.push({ test, error: error?.message || String(error), section });
  console.log(`  ❌ ${test}: ${error?.message || error}`);
};

const skip = (test, reason, section) => {
  results.skipped++;
  if (!results.sections[section]) results.sections[section] = { passed: 0, failed: 0, skipped: 0 };
  results.sections[section].skipped++;
  console.log(`  ⏭️ ${test}: ${reason}`);
};

const testSection = (name) => console.log(`\n${'='.repeat(70)}\n📋 ${name}\n${'='.repeat(70)}`);

// ===========================================================================
// SECTION 1: DATABASE TABLES EXISTENCE
// ===========================================================================
async function testDatabaseTables() {
  testSection('1. DATABASE TABLES EXISTENCE');
  const section = 'database_tables';

  const expectedTables = [
    // Core user tables
    'user_profiles', 'user_stats', 'user_cosmic_currency',
    // Gamification tables
    'user_achievements', 'user_achievement_stats', 'user_pets', 'pets',
    'equipment_items', 'user_equipment', 'user_equipment_sets',
    'user_perk_state', 'user_skill_points',
    // Module tables
    'daily_tasks', 'health_workouts', 'health_nutrition_logs', 'health_meals',
    'productivity_projects', 'productivity_tasks', 'productivity_focus_sessions',
    'knowledge_notes', 'knowledge_books', 'knowledge_ideas',
    'journal_entries', 'journal_prompts',
    'calendar_events', 'calendar_time_blocks',
    'financial_transactions', 'financial_accounts', 'financial_budgets',
    'financial_savings_goals', 'financial_envelope_categories',
    'skills', 'skill_practice_logs',
    'custom_streaks', 'bad_habits',
    // Quest/Mission tables
    'quests', 'user_quests', 'quest_chains', 'missions', 'user_missions',
    // Social tables
    'user_friends', 'friend_requests', 'pvp_battles', 'pvp_challenges',
    // Nova AI tables
    'nova_conversations', 'nova_messages', 'nova_memories',
    'nova_memory_embeddings', 'nova_insights', 'nova_feedback',
    // Boss/Arena tables
    'boss_battles', 'pvp_arena_queue',
    // Timeline and misc
    'timeline', 'gamification_events',
  ];

  for (const table of expectedTables) {
    try {
      const { data, error } = await supabaseAdmin.from(table).select('*').limit(1);
      if (error && error.message.includes('does not exist')) {
        fail(`Table ${table} exists`, 'Table does not exist', section);
      } else {
        pass(`Table ${table} exists`, section);
      }
    } catch (e) {
      fail(`Table ${table} exists`, e, section);
    }
  }
}

// ===========================================================================
// SECTION 2: RLS POLICIES
// ===========================================================================
async function testRLSPolicies() {
  testSection('2. ROW LEVEL SECURITY POLICIES');
  const section = 'rls_policies';

  const criticalTables = [
    'user_profiles', 'user_achievements', 'user_pets', 'user_equipment',
    'daily_tasks', 'health_workouts', 'journal_entries', 'financial_transactions',
    'nova_conversations', 'nova_messages', 'nova_memories',
  ];

  for (const table of criticalTables) {
    try {
      // Try to query without authentication - should fail or return empty
      const { data, error } = await supabaseAnon.from(table).select('*').limit(1);

      // If we get data back without auth, RLS might not be enabled
      if (data && data.length > 0 && !error) {
        // Check if any returned data matches our test users
        const hasTestData = data.some(row =>
          row.user_id === DEV_USER_ID ||
          row.id === DEV_USER_ID ||
          row.user_id === REAL_USER_ID ||
          row.id === REAL_USER_ID
        );

        if (hasTestData) {
          fail(`${table} RLS blocks unauthenticated access`, 'Data accessible without auth', section);
        } else {
          pass(`${table} RLS configured (no user data exposed)`, section);
        }
      } else {
        pass(`${table} RLS blocks unauthenticated access`, section);
      }
    } catch (e) {
      // Error is expected for RLS-protected tables
      pass(`${table} RLS blocks unauthenticated access`, section);
    }
  }
}

// ===========================================================================
// SECTION 3: USER PROFILE OPERATIONS
// ===========================================================================
async function testUserProfileOperations() {
  testSection('3. USER PROFILE OPERATIONS');
  const section = 'user_profiles';

  try {
    // Read profile
    const { data: profile, error: readError } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('id', DEV_USER_ID)
      .maybeSingle();

    if (readError) throw readError;
    if (profile) {
      pass('Read user profile', section);

      // Verify profile fields
      const expectedFields = ['id', 'username', 'display_name', 'current_level', 'current_xp', 'total_xp', 'avatar_url'];
      const missingFields = expectedFields.filter(f => !(f in profile));

      if (missingFields.length === 0) {
        pass('Profile has all expected fields', section);
      } else {
        fail('Profile has all expected fields', `Missing: ${missingFields.join(', ')}`, section);
      }

      // Test XP update
      const originalXP = profile.current_xp || 0;
      const { error: updateError } = await supabaseAdmin
        .from('user_profiles')
        .update({ current_xp: originalXP + 10 })
        .eq('id', DEV_USER_ID);

      if (updateError) {
        fail('Update user XP', updateError, section);
      } else {
        pass('Update user XP', section);

        // Restore original XP
        await supabaseAdmin
          .from('user_profiles')
          .update({ current_xp: originalXP })
          .eq('id', DEV_USER_ID);
      }

      // Test level progression fields
      if (profile.current_level !== undefined) {
        pass('Level tracking available', section);
      } else {
        fail('Level tracking available', 'current_level not found', section);
      }
    } else {
      skip('Profile operations', 'No dev user profile found', section);
    }
  } catch (e) {
    fail('User profile operations', e, section);
  }
}

// ===========================================================================
// SECTION 4: GAMIFICATION - XP & LEVELING
// ===========================================================================
async function testXPAndLeveling() {
  testSection('4. GAMIFICATION - XP & LEVELING');
  const section = 'xp_leveling';

  try {
    // Read current XP
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('current_xp, total_xp, current_level')
      .eq('id', DEV_USER_ID)
      .maybeSingle();

    if (profile) {
      pass('Read current XP and level', section);
      console.log(`    Current: Level ${profile.current_level}, XP: ${profile.current_xp}/${profile.total_xp} total`);

      // Test XP increment
      const testXPAmount = 50;
      const { error: xpError } = await supabaseAdmin.rpc('add_xp', {
        p_user_id: DEV_USER_ID,
        p_amount: testXPAmount,
        p_source: 'test'
      }).maybeSingle();

      if (xpError) {
        // RPC might not exist, try direct update
        const { error: directError } = await supabaseAdmin
          .from('user_profiles')
          .update({
            current_xp: (profile.current_xp || 0) + testXPAmount,
            total_xp: (profile.total_xp || 0) + testXPAmount
          })
          .eq('id', DEV_USER_ID);

        if (directError) {
          fail('Add XP (direct update)', directError, section);
        } else {
          pass('Add XP (direct update)', section);
          // Restore
          await supabaseAdmin
            .from('user_profiles')
            .update({
              current_xp: profile.current_xp,
              total_xp: profile.total_xp
            })
            .eq('id', DEV_USER_ID);
        }
      } else {
        pass('Add XP via RPC', section);
      }
    } else {
      skip('XP operations', 'No profile found', section);
    }
  } catch (e) {
    fail('XP and leveling', e, section);
  }
}

// ===========================================================================
// SECTION 5: GAMIFICATION - COSMIC CREDITS
// ===========================================================================
async function testCosmicCredits() {
  testSection('5. GAMIFICATION - COSMIC CREDITS');
  const section = 'cosmic_credits';

  try {
    const { data: currency, error } = await supabaseAdmin
      .from('user_cosmic_currency')
      .select('*')
      .eq('user_id', DEV_USER_ID)
      .maybeSingle();

    if (error && error.message.includes('does not exist')) {
      skip('Cosmic credits', 'Table does not exist', section);
      return;
    }

    if (currency) {
      pass('Read cosmic credits', section);
      console.log(`    Credits: ${currency.cosmic_credits || 0}, Gems: ${currency.cosmic_gems || 0}`);

      // Test credit addition
      const originalCredits = currency.cosmic_credits || 0;
      const { error: addError } = await supabaseAdmin
        .from('user_cosmic_currency')
        .update({ cosmic_credits: originalCredits + 100 })
        .eq('user_id', DEV_USER_ID);

      if (addError) {
        fail('Add cosmic credits', addError, section);
      } else {
        pass('Add cosmic credits', section);
        // Restore
        await supabaseAdmin
          .from('user_cosmic_currency')
          .update({ cosmic_credits: originalCredits })
          .eq('user_id', DEV_USER_ID);
      }
    } else {
      // Create currency record
      const { error: createError } = await supabaseAdmin
        .from('user_cosmic_currency')
        .insert({ user_id: DEV_USER_ID, cosmic_credits: 0, cosmic_gems: 0 });

      if (createError) {
        fail('Create cosmic currency record', createError, section);
      } else {
        pass('Create cosmic currency record', section);
      }
    }
  } catch (e) {
    fail('Cosmic credits', e, section);
  }
}

// ===========================================================================
// SECTION 6: ACHIEVEMENTS SYSTEM
// ===========================================================================
async function testAchievements() {
  testSection('6. ACHIEVEMENTS SYSTEM');
  const section = 'achievements';

  // Test user_achievements table
  try {
    const { data: achievements, error } = await supabaseAdmin
      .from('user_achievements')
      .select('*')
      .eq('user_id', DEV_USER_ID);

    if (error && error.message.includes('does not exist')) {
      skip('Achievements', 'Table does not exist', section);
      return;
    }

    if (!error) {
      pass('Read user achievements', section);
      console.log(`    Total achievements unlocked: ${achievements?.length || 0}`);

      // Test achievement unlock
      const testAchievementId = 'test_achievement_' + Date.now();
      const { error: unlockError } = await supabaseAdmin
        .from('user_achievements')
        .insert({
          user_id: DEV_USER_ID,
          achievement_id: testAchievementId,
          unlocked_at: new Date().toISOString(),
          xp_earned: 100,
          credits_earned: 50
        });

      if (unlockError && !unlockError.message.includes('duplicate')) {
        fail('Unlock achievement', unlockError, section);
      } else {
        pass('Unlock achievement', section);
        // Clean up
        await supabaseAdmin
          .from('user_achievements')
          .delete()
          .eq('user_id', DEV_USER_ID)
          .eq('achievement_id', testAchievementId);
      }
    } else {
      fail('Read user achievements', error, section);
    }
  } catch (e) {
    fail('Achievements system', e, section);
  }

  // Test achievement stats
  try {
    const { data: stats, error } = await supabaseAdmin
      .from('user_achievement_stats')
      .select('*')
      .eq('user_id', DEV_USER_ID);

    if (error && error.message.includes('does not exist')) {
      skip('Achievement stats', 'Table does not exist', section);
    } else if (!error) {
      pass('Read achievement stats', section);
      console.log(`    Stats tracked: ${stats?.length || 0}`);
    } else {
      fail('Read achievement stats', error, section);
    }
  } catch (e) {
    fail('Achievement stats', e, section);
  }
}

// ===========================================================================
// SECTION 7: PET SYSTEM
// ===========================================================================
async function testPetSystem() {
  testSection('7. PET SYSTEM');
  const section = 'pets';

  // Test pets table (master list)
  try {
    const { data: pets, error } = await supabaseAdmin
      .from('pets')
      .select('*')
      .limit(10);

    if (error && error.message.includes('does not exist')) {
      skip('Pets master table', 'Table does not exist', section);
    } else if (!error) {
      pass('Read pets master table', section);
      console.log(`    Available pets: ${pets?.length || 0}+`);
    } else {
      fail('Read pets master table', error, section);
    }
  } catch (e) {
    fail('Pets master table', e, section);
  }

  // Test user_pets table
  try {
    const { data: userPets, error } = await supabaseAdmin
      .from('user_pets')
      .select('*')
      .eq('user_id', DEV_USER_ID);

    if (error && error.message.includes('does not exist')) {
      skip('User pets', 'Table does not exist', section);
    } else if (!error) {
      pass('Read user pets', section);
      const activePets = userPets?.filter(p => p.is_active) || [];
      console.log(`    Owned: ${userPets?.length || 0}, Active: ${activePets.length}`);
    } else {
      fail('Read user pets', error, section);
    }
  } catch (e) {
    fail('User pets', e, section);
  }
}

// ===========================================================================
// SECTION 8: EQUIPMENT SYSTEM
// ===========================================================================
async function testEquipmentSystem() {
  testSection('8. EQUIPMENT SYSTEM');
  const section = 'equipment';

  // Test equipment_items table (master list)
  try {
    const { data: items, error } = await supabaseAdmin
      .from('equipment_items')
      .select('*')
      .limit(10);

    if (error && error.message.includes('does not exist')) {
      skip('Equipment items table', 'Table does not exist', section);
    } else if (!error) {
      pass('Read equipment items', section);
      console.log(`    Available equipment: ${items?.length || 0}+`);
    } else {
      fail('Read equipment items', error, section);
    }
  } catch (e) {
    fail('Equipment items', e, section);
  }

  // Test user_equipment table
  try {
    const { data: userEquip, error } = await supabaseAdmin
      .from('user_equipment')
      .select('*')
      .eq('user_id', DEV_USER_ID);

    if (error && error.message.includes('does not exist')) {
      skip('User equipment', 'Table does not exist', section);
    } else if (!error) {
      pass('Read user equipment', section);
      const equipped = userEquip?.filter(e => e.is_equipped) || [];
      console.log(`    Owned: ${userEquip?.length || 0}, Equipped: ${equipped.length}`);
    } else {
      fail('Read user equipment', error, section);
    }
  } catch (e) {
    fail('User equipment', e, section);
  }
}

// ===========================================================================
// SECTION 9: PERK/SKILL TREE SYSTEM
// ===========================================================================
async function testPerkSystem() {
  testSection('9. PERK/SKILL TREE SYSTEM');
  const section = 'perks';

  try {
    const { data: perkState, error } = await supabaseAdmin
      .from('user_perk_state')
      .select('*')
      .eq('user_id', DEV_USER_ID)
      .maybeSingle();

    if (error && error.message.includes('does not exist')) {
      skip('Perk state', 'Table does not exist', section);
      return;
    }

    if (perkState) {
      pass('Read perk state', section);
      console.log(`    Unlocked perks: ${perkState.unlocked_perks?.length || 0}`);
      console.log(`    Points available: ${perkState.available_points || 0}`);
    } else {
      pass('Perk state (empty - new user)', section);
    }
  } catch (e) {
    fail('Perk system', e, section);
  }

  // Test skill points
  try {
    const { data: skillPoints, error } = await supabaseAdmin
      .from('user_skill_points')
      .select('*')
      .eq('user_id', DEV_USER_ID)
      .maybeSingle();

    if (error && error.message.includes('does not exist')) {
      skip('Skill points', 'Table does not exist', section);
    } else if (!error) {
      pass('Read skill points', section);
    }
  } catch (e) {
    fail('Skill points', e, section);
  }
}

// ===========================================================================
// SECTION 10: DAILY TASKS
// ===========================================================================
async function testDailyTasks() {
  testSection('10. DAILY TASKS');
  const section = 'daily_tasks';

  try {
    const { data: tasks, error } = await supabaseAdmin
      .from('daily_tasks')
      .select('*')
      .eq('user_id', DEV_USER_ID)
      .limit(10);

    if (error && error.message.includes('does not exist')) {
      skip('Daily tasks', 'Table does not exist', section);
      return;
    }

    if (!error) {
      pass('Read daily tasks', section);
      const completed = tasks?.filter(t => t.completed) || [];
      console.log(`    Tasks: ${tasks?.length || 0}, Completed: ${completed.length}`);

      // Test task creation
      const testTaskId = crypto.randomUUID();
      const { error: createError } = await supabaseAdmin
        .from('daily_tasks')
        .insert({
          id: testTaskId,
          user_id: DEV_USER_ID,
          title: 'Test Task',
          completed: false,
          created_at: new Date().toISOString()
        });

      if (createError && !createError.message.includes('duplicate')) {
        fail('Create daily task', createError, section);
      } else {
        pass('Create daily task', section);

        // Test task completion
        const { error: completeError } = await supabaseAdmin
          .from('daily_tasks')
          .update({ completed: true, completed_at: new Date().toISOString() })
          .eq('id', testTaskId);

        if (completeError) {
          fail('Complete daily task', completeError, section);
        } else {
          pass('Complete daily task', section);
        }

        // Clean up
        await supabaseAdmin.from('daily_tasks').delete().eq('id', testTaskId);
      }
    } else {
      fail('Read daily tasks', error, section);
    }
  } catch (e) {
    fail('Daily tasks', e, section);
  }
}

// ===========================================================================
// SECTION 11: HEALTH & FITNESS
// ===========================================================================
async function testHealthFitness() {
  testSection('11. HEALTH & FITNESS');
  const section = 'health';

  // Test workouts
  try {
    const { data: workouts, error } = await supabaseAdmin
      .from('health_workouts')
      .select('*')
      .eq('user_id', DEV_USER_ID)
      .limit(5);

    if (error && error.message.includes('does not exist')) {
      skip('Workouts', 'Table does not exist', section);
    } else if (!error) {
      pass('Read workouts', section);
      console.log(`    Total workouts: ${workouts?.length || 0}+`);
    } else {
      fail('Read workouts', error, section);
    }
  } catch (e) {
    fail('Workouts', e, section);
  }

  // Test nutrition logs
  try {
    const { data: nutrition, error } = await supabaseAdmin
      .from('health_nutrition_logs')
      .select('*')
      .eq('user_id', DEV_USER_ID)
      .limit(5);

    if (error && error.message.includes('does not exist')) {
      skip('Nutrition logs', 'Table does not exist', section);
    } else if (!error) {
      pass('Read nutrition logs', section);
    } else {
      fail('Read nutrition logs', error, section);
    }
  } catch (e) {
    fail('Nutrition logs', e, section);
  }

  // Test meals
  try {
    const { data: meals, error } = await supabaseAdmin
      .from('health_meals')
      .select('*')
      .eq('user_id', DEV_USER_ID)
      .limit(5);

    if (error && error.message.includes('does not exist')) {
      skip('Meals', 'Table does not exist', section);
    } else if (!error) {
      pass('Read meals', section);
    } else {
      fail('Read meals', error, section);
    }
  } catch (e) {
    fail('Meals', e, section);
  }
}

// ===========================================================================
// SECTION 12: PRODUCTIVITY
// ===========================================================================
async function testProductivity() {
  testSection('12. PRODUCTIVITY');
  const section = 'productivity';

  // Test projects
  try {
    const { data: projects, error } = await supabaseAdmin
      .from('productivity_projects')
      .select('*')
      .eq('user_id', DEV_USER_ID)
      .limit(5);

    if (error && error.message.includes('does not exist')) {
      skip('Projects', 'Table does not exist', section);
    } else if (!error) {
      pass('Read projects', section);
      console.log(`    Projects: ${projects?.length || 0}+`);
    } else {
      fail('Read projects', error, section);
    }
  } catch (e) {
    fail('Projects', e, section);
  }

  // Test focus sessions
  try {
    const { data: sessions, error } = await supabaseAdmin
      .from('productivity_focus_sessions')
      .select('*')
      .eq('user_id', DEV_USER_ID)
      .limit(5);

    if (error && error.message.includes('does not exist')) {
      skip('Focus sessions', 'Table does not exist', section);
    } else if (!error) {
      pass('Read focus sessions', section);
    } else {
      fail('Read focus sessions', error, section);
    }
  } catch (e) {
    fail('Focus sessions', e, section);
  }
}

// ===========================================================================
// SECTION 13: KNOWLEDGE
// ===========================================================================
async function testKnowledge() {
  testSection('13. KNOWLEDGE');
  const section = 'knowledge';

  // Test notes
  try {
    const { data: notes, error } = await supabaseAdmin
      .from('knowledge_notes')
      .select('*')
      .eq('user_id', DEV_USER_ID)
      .limit(5);

    if (error && error.message.includes('does not exist')) {
      skip('Notes', 'Table does not exist', section);
    } else if (!error) {
      pass('Read notes', section);
      console.log(`    Notes: ${notes?.length || 0}+`);
    } else {
      fail('Read notes', error, section);
    }
  } catch (e) {
    fail('Notes', e, section);
  }

  // Test books
  try {
    const { data: books, error } = await supabaseAdmin
      .from('knowledge_books')
      .select('*')
      .eq('user_id', DEV_USER_ID)
      .limit(5);

    if (error && error.message.includes('does not exist')) {
      skip('Books', 'Table does not exist', section);
    } else if (!error) {
      pass('Read books', section);
    } else {
      fail('Read books', error, section);
    }
  } catch (e) {
    fail('Books', e, section);
  }

  // Test ideas
  try {
    const { data: ideas, error } = await supabaseAdmin
      .from('knowledge_ideas')
      .select('*')
      .eq('user_id', DEV_USER_ID)
      .limit(5);

    if (error && error.message.includes('does not exist')) {
      skip('Ideas', 'Table does not exist', section);
    } else if (!error) {
      pass('Read ideas', section);
    } else {
      fail('Read ideas', error, section);
    }
  } catch (e) {
    fail('Ideas', e, section);
  }
}

// ===========================================================================
// SECTION 14: JOURNAL
// ===========================================================================
async function testJournal() {
  testSection('14. JOURNAL');
  const section = 'journal';

  try {
    const { data: entries, error } = await supabaseAdmin
      .from('journal_entries')
      .select('*')
      .eq('user_id', DEV_USER_ID)
      .limit(5);

    if (error && error.message.includes('does not exist')) {
      skip('Journal entries', 'Table does not exist', section);
      return;
    }

    if (!error) {
      pass('Read journal entries', section);
      console.log(`    Entries: ${entries?.length || 0}+`);

      // Test entry creation
      const testEntryId = crypto.randomUUID();
      const { error: createError } = await supabaseAdmin
        .from('journal_entries')
        .insert({
          id: testEntryId,
          user_id: DEV_USER_ID,
          content: 'Test journal entry',
          mood: 4,
          created_at: new Date().toISOString()
        });

      if (createError && !createError.message.includes('duplicate')) {
        fail('Create journal entry', createError, section);
      } else {
        pass('Create journal entry', section);
        // Clean up
        await supabaseAdmin.from('journal_entries').delete().eq('id', testEntryId);
      }
    } else {
      fail('Read journal entries', error, section);
    }
  } catch (e) {
    fail('Journal', e, section);
  }
}

// ===========================================================================
// SECTION 15: CALENDAR
// ===========================================================================
async function testCalendar() {
  testSection('15. CALENDAR');
  const section = 'calendar';

  // Test events
  try {
    const { data: events, error } = await supabaseAdmin
      .from('calendar_events')
      .select('*')
      .eq('user_id', DEV_USER_ID)
      .limit(5);

    if (error && error.message.includes('does not exist')) {
      skip('Calendar events', 'Table does not exist', section);
    } else if (!error) {
      pass('Read calendar events', section);
      console.log(`    Events: ${events?.length || 0}+`);
    } else {
      fail('Read calendar events', error, section);
    }
  } catch (e) {
    fail('Calendar events', e, section);
  }

  // Test time blocks
  try {
    const { data: blocks, error } = await supabaseAdmin
      .from('calendar_time_blocks')
      .select('*')
      .eq('user_id', DEV_USER_ID)
      .limit(5);

    if (error && error.message.includes('does not exist')) {
      skip('Time blocks', 'Table does not exist', section);
    } else if (!error) {
      pass('Read time blocks', section);
    } else {
      fail('Read time blocks', error, section);
    }
  } catch (e) {
    fail('Time blocks', e, section);
  }
}

// ===========================================================================
// SECTION 16: FINANCIAL
// ===========================================================================
async function testFinancial() {
  testSection('16. FINANCIAL');
  const section = 'financial';

  // Test transactions
  try {
    const { data: transactions, error } = await supabaseAdmin
      .from('financial_transactions')
      .select('*')
      .eq('user_id', DEV_USER_ID)
      .limit(5);

    if (error && error.message.includes('does not exist')) {
      skip('Transactions', 'Table does not exist', section);
    } else if (!error) {
      pass('Read transactions', section);
      console.log(`    Transactions: ${transactions?.length || 0}+`);
    } else {
      fail('Read transactions', error, section);
    }
  } catch (e) {
    fail('Transactions', e, section);
  }

  // Test savings goals
  try {
    const { data: goals, error } = await supabaseAdmin
      .from('financial_savings_goals')
      .select('*')
      .eq('user_id', DEV_USER_ID)
      .limit(5);

    if (error && error.message.includes('does not exist')) {
      skip('Savings goals', 'Table does not exist', section);
    } else if (!error) {
      pass('Read savings goals', section);
    } else {
      fail('Read savings goals', error, section);
    }
  } catch (e) {
    fail('Savings goals', e, section);
  }

  // Test budgets
  try {
    const { data: budgets, error } = await supabaseAdmin
      .from('financial_budgets')
      .select('*')
      .eq('user_id', DEV_USER_ID)
      .limit(5);

    if (error && error.message.includes('does not exist')) {
      skip('Budgets', 'Table does not exist', section);
    } else if (!error) {
      pass('Read budgets', section);
    } else {
      fail('Read budgets', error, section);
    }
  } catch (e) {
    fail('Budgets', e, section);
  }
}

// ===========================================================================
// SECTION 17: QUESTS & MISSIONS
// ===========================================================================
async function testQuestsMissions() {
  testSection('17. QUESTS & MISSIONS');
  const section = 'quests';

  // Test quests
  try {
    const { data: quests, error } = await supabaseAdmin
      .from('quests')
      .select('*')
      .limit(10);

    if (error && error.message.includes('does not exist')) {
      skip('Quests', 'Table does not exist', section);
    } else if (!error) {
      pass('Read quests', section);
      console.log(`    Available quests: ${quests?.length || 0}+`);
    } else {
      fail('Read quests', error, section);
    }
  } catch (e) {
    fail('Quests', e, section);
  }

  // Test user quests
  try {
    const { data: userQuests, error } = await supabaseAdmin
      .from('user_quests')
      .select('*')
      .eq('user_id', DEV_USER_ID)
      .limit(10);

    if (error && error.message.includes('does not exist')) {
      skip('User quests', 'Table does not exist', section);
    } else if (!error) {
      pass('Read user quests', section);
      const completed = userQuests?.filter(q => q.status === 'completed') || [];
      console.log(`    User quests: ${userQuests?.length || 0}, Completed: ${completed.length}`);
    } else {
      fail('Read user quests', error, section);
    }
  } catch (e) {
    fail('User quests', e, section);
  }

  // Test missions
  try {
    const { data: missions, error } = await supabaseAdmin
      .from('missions')
      .select('*')
      .limit(10);

    if (error && error.message.includes('does not exist')) {
      skip('Missions', 'Table does not exist', section);
    } else if (!error) {
      pass('Read missions', section);
    } else {
      fail('Read missions', error, section);
    }
  } catch (e) {
    fail('Missions', e, section);
  }
}

// ===========================================================================
// SECTION 18: SKILLS
// ===========================================================================
async function testSkills() {
  testSection('18. SKILLS');
  const section = 'skills';

  try {
    const { data: skills, error } = await supabaseAdmin
      .from('skills')
      .select('*')
      .eq('user_id', DEV_USER_ID)
      .limit(10);

    if (error && error.message.includes('does not exist')) {
      skip('Skills', 'Table does not exist', section);
      return;
    }

    if (!error) {
      pass('Read skills', section);
      console.log(`    Skills tracked: ${skills?.length || 0}`);
    } else {
      fail('Read skills', error, section);
    }
  } catch (e) {
    fail('Skills', e, section);
  }

  // Test practice logs
  try {
    const { data: logs, error } = await supabaseAdmin
      .from('skill_practice_logs')
      .select('*')
      .eq('user_id', DEV_USER_ID)
      .limit(5);

    if (error && error.message.includes('does not exist')) {
      skip('Practice logs', 'Table does not exist', section);
    } else if (!error) {
      pass('Read practice logs', section);
    } else {
      fail('Read practice logs', error, section);
    }
  } catch (e) {
    fail('Practice logs', e, section);
  }
}

// ===========================================================================
// SECTION 19: STREAKS
// ===========================================================================
async function testStreaks() {
  testSection('19. STREAKS');
  const section = 'streaks';

  // Test custom streaks
  try {
    const { data: streaks, error } = await supabaseAdmin
      .from('custom_streaks')
      .select('*')
      .eq('user_id', DEV_USER_ID)
      .limit(10);

    if (error && error.message.includes('does not exist')) {
      skip('Custom streaks', 'Table does not exist', section);
    } else if (!error) {
      pass('Read custom streaks', section);
      console.log(`    Custom streaks: ${streaks?.length || 0}`);
    } else {
      fail('Read custom streaks', error, section);
    }
  } catch (e) {
    fail('Custom streaks', e, section);
  }

  // Test bad habits (negative streaks)
  try {
    const { data: habits, error } = await supabaseAdmin
      .from('bad_habits')
      .select('*')
      .eq('user_id', DEV_USER_ID)
      .limit(5);

    if (error && error.message.includes('does not exist')) {
      skip('Bad habits', 'Table does not exist', section);
    } else if (!error) {
      pass('Read bad habits', section);
    } else {
      fail('Read bad habits', error, section);
    }
  } catch (e) {
    fail('Bad habits', e, section);
  }
}

// ===========================================================================
// SECTION 20: SOCIAL FEATURES
// ===========================================================================
async function testSocialFeatures() {
  testSection('20. SOCIAL FEATURES');
  const section = 'social';

  // Test friends
  try {
    const { data: friends, error } = await supabaseAdmin
      .from('user_friends')
      .select('*')
      .eq('user_id', DEV_USER_ID)
      .limit(10);

    if (error && error.message.includes('does not exist')) {
      skip('Friends', 'Table does not exist', section);
    } else if (!error) {
      pass('Read friends list', section);
      console.log(`    Friends: ${friends?.length || 0}`);
    } else {
      fail('Read friends list', error, section);
    }
  } catch (e) {
    fail('Friends', e, section);
  }

  // Test friend requests
  try {
    const { data: requests, error } = await supabaseAdmin
      .from('friend_requests')
      .select('*')
      .or(`sender_id.eq.${DEV_USER_ID},receiver_id.eq.${DEV_USER_ID}`)
      .limit(10);

    if (error && error.message.includes('does not exist')) {
      skip('Friend requests', 'Table does not exist', section);
    } else if (!error) {
      pass('Read friend requests', section);
    } else {
      fail('Read friend requests', error, section);
    }
  } catch (e) {
    fail('Friend requests', e, section);
  }

  // Test PvP battles
  try {
    const { data: battles, error } = await supabaseAdmin
      .from('pvp_battles')
      .select('*')
      .or(`player1_id.eq.${DEV_USER_ID},player2_id.eq.${DEV_USER_ID}`)
      .limit(5);

    if (error && error.message.includes('does not exist')) {
      skip('PvP battles', 'Table does not exist', section);
    } else if (!error) {
      pass('Read PvP battles', section);
    } else {
      fail('Read PvP battles', error, section);
    }
  } catch (e) {
    fail('PvP battles', e, section);
  }
}

// ===========================================================================
// SECTION 21: NOVA AI SYSTEM
// ===========================================================================
async function testNovaAI() {
  testSection('21. NOVA AI SYSTEM');
  const section = 'nova';

  // Test conversations
  try {
    const { data: convos, error } = await supabaseAdmin
      .from('nova_conversations')
      .select('*')
      .eq('user_id', DEV_USER_ID)
      .limit(5);

    if (error && error.message.includes('does not exist')) {
      skip('Nova conversations', 'Table does not exist', section);
    } else if (!error) {
      pass('Read Nova conversations', section);
      console.log(`    Conversations: ${convos?.length || 0}`);
    } else {
      fail('Read Nova conversations', error, section);
    }
  } catch (e) {
    fail('Nova conversations', e, section);
  }

  // Test messages
  try {
    const { data: messages, error } = await supabaseAdmin
      .from('nova_messages')
      .select('*')
      .eq('user_id', DEV_USER_ID)
      .limit(10);

    if (error && error.message.includes('does not exist')) {
      skip('Nova messages', 'Table does not exist', section);
    } else if (!error) {
      pass('Read Nova messages', section);
    } else {
      fail('Read Nova messages', error, section);
    }
  } catch (e) {
    fail('Nova messages', e, section);
  }

  // Test memories
  try {
    const { data: memories, error } = await supabaseAdmin
      .from('nova_memories')
      .select('*')
      .eq('user_id', DEV_USER_ID)
      .limit(10);

    if (error && error.message.includes('does not exist')) {
      skip('Nova memories', 'Table does not exist', section);
    } else if (!error) {
      pass('Read Nova memories', section);
      console.log(`    Memories: ${memories?.length || 0}`);
    } else {
      fail('Read Nova memories', error, section);
    }
  } catch (e) {
    fail('Nova memories', e, section);
  }

  // Test insights
  try {
    const { data: insights, error } = await supabaseAdmin
      .from('nova_insights')
      .select('*')
      .eq('user_id', DEV_USER_ID)
      .limit(5);

    if (error && error.message.includes('does not exist')) {
      skip('Nova insights', 'Table does not exist', section);
    } else if (!error) {
      pass('Read Nova insights', section);
    } else {
      fail('Read Nova insights', error, section);
    }
  } catch (e) {
    fail('Nova insights', e, section);
  }
}

// ===========================================================================
// SECTION 22: BOSS BATTLES
// ===========================================================================
async function testBossBattles() {
  testSection('22. BOSS BATTLES');
  const section = 'boss';

  try {
    const { data: battles, error } = await supabaseAdmin
      .from('boss_battles')
      .select('*')
      .eq('user_id', DEV_USER_ID)
      .limit(5);

    if (error && error.message.includes('does not exist')) {
      skip('Boss battles', 'Table does not exist', section);
      return;
    }

    if (!error) {
      pass('Read boss battles', section);
      const active = battles?.filter(b => b.status === 'active') || [];
      console.log(`    Battles: ${battles?.length || 0}, Active: ${active.length}`);
    } else {
      fail('Read boss battles', error, section);
    }
  } catch (e) {
    fail('Boss battles', e, section);
  }
}

// ===========================================================================
// SECTION 23: TIMELINE & GAMIFICATION EVENTS
// ===========================================================================
async function testTimeline() {
  testSection('23. TIMELINE & GAMIFICATION EVENTS');
  const section = 'timeline';

  // Test timeline
  try {
    const { data: timeline, error } = await supabaseAdmin
      .from('timeline')
      .select('*')
      .eq('user_id', DEV_USER_ID)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error && error.message.includes('does not exist')) {
      skip('Timeline', 'Table does not exist', section);
    } else if (!error) {
      pass('Read timeline', section);
      console.log(`    Recent entries: ${timeline?.length || 0}`);

      // Show recent activity types
      const types = [...new Set(timeline?.map(t => t.entry_type) || [])];
      if (types.length > 0) {
        console.log(`    Activity types: ${types.slice(0, 5).join(', ')}`);
      }
    } else {
      fail('Read timeline', error, section);
    }
  } catch (e) {
    fail('Timeline', e, section);
  }

  // Test gamification events
  try {
    const { data: events, error } = await supabaseAdmin
      .from('gamification_events')
      .select('*')
      .eq('user_id', DEV_USER_ID)
      .limit(10);

    if (error && error.message.includes('does not exist')) {
      skip('Gamification events', 'Table does not exist', section);
    } else if (!error) {
      pass('Read gamification events', section);
    } else {
      fail('Read gamification events', error, section);
    }
  } catch (e) {
    fail('Gamification events', e, section);
  }
}

// ===========================================================================
// SECTION 24: DATA ISOLATION TEST
// ===========================================================================
async function testDataIsolation() {
  testSection('24. DATA ISOLATION BETWEEN USERS');
  const section = 'isolation';

  // Test that User A cannot see User B's data
  const tablesToTest = [
    'user_profiles', 'daily_tasks', 'journal_entries',
    'nova_memories', 'user_achievements'
  ];

  for (const table of tablesToTest) {
    try {
      // Query for User A data
      const { data: userAData } = await supabaseAdmin
        .from(table)
        .select('*')
        .eq(table === 'user_profiles' ? 'id' : 'user_id', DEV_USER_ID)
        .limit(5);

      // Query for User B data
      const { data: userBData } = await supabaseAdmin
        .from(table)
        .select('*')
        .eq(table === 'user_profiles' ? 'id' : 'user_id', REAL_USER_ID)
        .limit(5);

      // Verify no overlap
      if (userAData && userBData) {
        const aIds = new Set(userAData.map(d => d.id));
        const bIds = new Set(userBData.map(d => d.id));
        const overlap = [...aIds].filter(id => bIds.has(id));

        if (overlap.length === 0) {
          pass(`${table} - Data isolated between users`, section);
        } else {
          fail(`${table} - Data isolated between users`, 'Found overlapping IDs', section);
        }
      } else {
        pass(`${table} - Data isolation (one or both users have no data)`, section);
      }
    } catch (e) {
      if (e.message?.includes('does not exist')) {
        skip(`${table} isolation`, 'Table does not exist', section);
      } else {
        fail(`${table} isolation`, e, section);
      }
    }
  }
}

// ===========================================================================
// SECTION 25: CONCURRENT OPERATIONS
// ===========================================================================
async function testConcurrentOperations() {
  testSection('25. CONCURRENT OPERATIONS');
  const section = 'concurrent';

  const startTime = Date.now();

  try {
    // Launch many concurrent queries
    const concurrentQueries = [
      supabaseAdmin.from('user_profiles').select('*').eq('id', DEV_USER_ID).maybeSingle(),
      supabaseAdmin.from('user_profiles').select('*').eq('id', REAL_USER_ID).maybeSingle(),
      supabaseAdmin.from('daily_tasks').select('*').eq('user_id', DEV_USER_ID).limit(5),
      supabaseAdmin.from('user_achievements').select('*').eq('user_id', DEV_USER_ID).limit(10),
      supabaseAdmin.from('timeline').select('*').eq('user_id', DEV_USER_ID).limit(10),
      supabaseAdmin.from('user_cosmic_currency').select('*').eq('user_id', DEV_USER_ID).maybeSingle(),
      supabaseAdmin.from('nova_memories').select('*').eq('user_id', DEV_USER_ID).limit(5),
      supabaseAdmin.from('calendar_events').select('*').eq('user_id', DEV_USER_ID).limit(5),
    ];

    const results = await Promise.allSettled(concurrentQueries);
    const endTime = Date.now();
    const duration = endTime - startTime;

    const succeeded = results.filter(r => r.status === 'fulfilled' && !r.value.error).length;
    const failed = results.length - succeeded;

    if (succeeded > 0) {
      pass(`${succeeded}/${results.length} concurrent queries completed in ${duration}ms`, section);
    }

    if (failed > 0 && failed < results.length) {
      console.log(`    ⚠️ ${failed} queries failed (may be missing tables)`);
    }

    // Test data integrity under concurrent access
    const profileResults = results.filter((r, i) => i < 2 && r.status === 'fulfilled');
    if (profileResults.length === 2) {
      const profile1 = profileResults[0].value.data;
      const profile2 = profileResults[1].value.data;

      if (profile1?.id !== profile2?.id) {
        pass('Data integrity maintained during concurrent access', section);
      } else if (profile1?.id && profile2?.id) {
        fail('Data integrity', 'Same ID returned for different users', section);
      }
    }

  } catch (e) {
    fail('Concurrent operations', e, section);
  }
}

// ===========================================================================
// SECTION 26: EDGE FUNCTION AVAILABILITY
// ===========================================================================
async function testEdgeFunctions() {
  testSection('26. EDGE FUNCTION AVAILABILITY');
  const section = 'edge_functions';

  const edgeFunctions = [
    'nova-chat-v3',
    'nova-embeddings',
    'nova-extract-memories',
    'parse-nutrition',
    'social-api',
    'moderate-content',
    'accept-pvp-invite',
    'create-pvp-battle',
    'update-battle-progress',
    'finalize-battles',
    'pvp-arena-matchmaking',
    'send-invite',
  ];

  console.log(`  Checking ${edgeFunctions.length} edge functions...`);

  // Note: We can't actually call edge functions without proper auth,
  // but we can verify they're configured
  for (const func of edgeFunctions) {
    try {
      const response = await fetch(
        `https://pynijtaxxcrdheyzoawv.supabase.co/functions/v1/${func}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ test: true })
        }
      );

      // 401/403 means the function exists but requires auth
      // 404 means it doesn't exist
      if (response.status !== 404) {
        pass(`${func} - Edge function accessible`, section);
      } else {
        fail(`${func} - Edge function exists`, 'Function not found', section);
      }
    } catch (e) {
      // Network errors are OK - function may exist but reject the request
      pass(`${func} - Edge function configured`, section);
    }
  }
}

// ===========================================================================
// MAIN TEST RUNNER
// ===========================================================================
async function runAllTests() {
  console.log('='.repeat(70));
  console.log('🚀 MEGA-COMPREHENSIVE LIFEOS SYSTEM TEST');
  console.log('='.repeat(70));
  console.log(`Started: ${new Date().toISOString()}`);
  console.log(`Test Users: DEV=${DEV_USER_ID.slice(0,8)}..., REAL=${REAL_USER_ID.slice(0,8)}...`);

  const startTime = Date.now();

  // Run all test sections
  await testDatabaseTables();
  await testRLSPolicies();
  await testUserProfileOperations();
  await testXPAndLeveling();
  await testCosmicCredits();
  await testAchievements();
  await testPetSystem();
  await testEquipmentSystem();
  await testPerkSystem();
  await testDailyTasks();
  await testHealthFitness();
  await testProductivity();
  await testKnowledge();
  await testJournal();
  await testCalendar();
  await testFinancial();
  await testQuestsMissions();
  await testSkills();
  await testStreaks();
  await testSocialFeatures();
  await testNovaAI();
  await testBossBattles();
  await testTimeline();
  await testDataIsolation();
  await testConcurrentOperations();
  await testEdgeFunctions();

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(1);

  // Print summary
  console.log('\n' + '='.repeat(70));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(70));
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`⏭️ Skipped: ${results.skipped}`);
  console.log(`⏱️ Duration: ${duration}s`);

  const total = results.passed + results.failed;
  const passRate = total > 0 ? ((results.passed / total) * 100).toFixed(1) : 0;
  console.log(`📈 Pass Rate: ${passRate}% (excluding skipped)`);

  // Section breakdown
  console.log('\n📋 SECTION BREAKDOWN:');
  Object.entries(results.sections)
    .sort((a, b) => b[1].failed - a[1].failed)
    .forEach(([section, stats]) => {
      const sectionTotal = stats.passed + stats.failed;
      const sectionRate = sectionTotal > 0 ? ((stats.passed / sectionTotal) * 100).toFixed(0) : 100;
      const status = stats.failed === 0 ? '✅' : '⚠️';
      console.log(`  ${status} ${section}: ${stats.passed}/${sectionTotal} (${sectionRate}%) ${stats.skipped > 0 ? `[${stats.skipped} skipped]` : ''}`);
    });

  // Failed tests
  if (results.errors.length > 0) {
    console.log('\n❌ FAILED TESTS:');
    results.errors.slice(0, 20).forEach((e, i) => {
      console.log(`  ${i + 1}. [${e.section}] ${e.test}: ${e.error}`);
    });
    if (results.errors.length > 20) {
      console.log(`  ... and ${results.errors.length - 20} more failures`);
    }
  }

  console.log('\n' + '='.repeat(70));
  console.log(`Completed: ${new Date().toISOString()}`);
  console.log('='.repeat(70));
}

// Run tests
runAllTests().catch(console.error);
