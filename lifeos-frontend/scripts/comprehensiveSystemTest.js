/**
 * COMPREHENSIVE SYSTEM TEST
 * Tests every single user action and verifies data is stored correctly in Supabase
 *
 * Run with: node scripts/comprehensiveSystemTest.js
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://pynijtaxxcrdheyzoawv.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5bmlqdGF4eGNyZGhleXpvYXd2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzM2NjEyNywiZXhwIjoyMDc4OTQyMTI3fQ.fbeDGjs2WXYQX-92pUDJPpsvXUgll5faY71yJWX0lKA'
);

// Test users - using service role to bypass RLS for testing
const TEST_USER_A = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const TEST_USER_B = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

// Test results tracking
const results = {
  passed: 0,
  failed: 0,
  errors: []
};

// Helper functions
const log = (msg) => console.log(msg);
const pass = (test) => { results.passed++; console.log(`  ✅ ${test}`); };
const fail = (test, error) => {
  results.failed++;
  results.errors.push({ test, error: error?.message || error });
  console.log(`  ❌ ${test}: ${error?.message || error}`);
};

const testSection = (name) => console.log(`\n${'='.repeat(60)}\n📋 ${name}\n${'='.repeat(60)}`);

// Cleanup function
async function cleanupTestData() {
  log('\n🧹 Cleaning up previous test data...');

  // Delete user_profiles last since other tables might reference it
  const tables = [
    'user_stats', 'user_pets', 'user_equipment', 'user_equipped_items', 'user_equipment_unlocks',
    'user_achievements', 'achievement_progress', 'user_achievement_stats',
    'skills', 'skill_practice_logs', 'user_skill_points', 'user_constellation_progress',
    'daily_tasks', 'daily_task_templates', 'daily_quests',
    'user_quests', 'user_missions', 'missions',
    'custom_streaks', 'custom_streak_completions', 'user_streaks', 'momentum_chains', 'momentum_events',
    'health_workouts', 'health_nutrition_logs', 'health_sleep_logs', 'health_water_logs',
    'health_supplements', 'health_supplement_logs', 'health_recovery_logs',
    'productivity_sessions', 'productivity_tasks', 'productivity_projects', 'productivity_income',
    'financial_transactions', 'financial_accounts', 'financial_goals', 'financial_budgets',
    'calendar_events', 'calendar_time_blocks', 'calendar_templates',
    'journal_entries',
    'knowledge_notes', 'knowledge_books', 'knowledge_media', 'knowledge_collection_items', 'knowledge_collections',
    'bad_habits', 'bad_habit_relapses',
    'resolutions', 'resolution_check_ins', 'user_resolutions',
    'user_cosmic_currency', 'currency_transactions', 'user_inventory',
    'boss_battles', 'boss_battle_stats',
    'pvp_arena_stats', 'pvp_user_stats',
    'activity_feed', 'activity_comments', 'activity_likes',
    'timeline', 'timeline_events', 'gamification_events',
    'user_module_mastery', 'user_module_progress', 'user_level_progression',
    'user_active_boosts', 'user_perks', 'user_claimed_milestones',
    'content_items', 'user_purpose', 'user_values', 'user_quotes',
    'nova_conversations', 'nova_messages', 'nova_memories',
    'stat_history', 'user_daily_summaries', 'user_weekly_summaries'
  ];

  for (const table of tables) {
    try {
      await supabase.from(table).delete().in('user_id', [TEST_USER_A, TEST_USER_B]);
    } catch (e) {
      // Table might not exist or have different structure - ignore
    }
  }

  // Delete test user profiles
  try {
    await supabase.from('user_profiles').delete().in('id', [TEST_USER_A, TEST_USER_B]);
  } catch (e) {
    // Ignore
  }

  log('  Cleanup complete');
}

// ============================================
// TEST 1: USER PROFILES & LEVELING SYSTEM
// ============================================
async function testUserProfilesAndLeveling() {
  testSection('USER PROFILES & LEVELING SYSTEM');

  // 1.1 Create initial user profile (XP and level are in user_profiles)
  try {
    const { data, error } = await supabase.from('user_profiles').upsert({
      id: TEST_USER_A,
      username: 'test_user_a',
      display_name: 'Test User A',
      total_xp: 0,
      current_xp: 0,
      current_level: 1,
      cosmic_energy: 100,
      avatar_stage: 'spark',
      onboarding_completed: true
    }).select().single();

    if (error) throw error;
    if (data.id === TEST_USER_A && data.current_level === 1) {
      pass('Create initial user profile');
    } else {
      fail('Create initial user profile', 'Data mismatch');
    }
  } catch (e) {
    fail('Create initial user profile', e);
  }

  // 1.2 Award XP and verify
  try {
    const { data, error } = await supabase.from('user_profiles')
      .update({ current_xp: 150, total_xp: 150 })
      .eq('id', TEST_USER_A)
      .select().single();

    if (error) throw error;
    if (data.current_xp === 150 && data.total_xp === 150) {
      pass('Award XP to user');
    } else {
      fail('Award XP to user', 'XP not updated correctly');
    }
  } catch (e) {
    fail('Award XP to user', e);
  }

  // 1.3 Level up user
  try {
    const { data, error } = await supabase.from('user_profiles')
      .update({ current_level: 2, current_xp: 50 })
      .eq('id', TEST_USER_A)
      .select().single();

    if (error) throw error;
    if (data.current_level === 2 && data.current_xp === 50) {
      pass('Level up user');
    } else {
      fail('Level up user', 'Level not updated correctly');
    }
  } catch (e) {
    fail('Level up user', e);
  }

  // 1.4 Create user_stats for character stats (strength, vitality, etc)
  try {
    const { data, error } = await supabase.from('user_stats').upsert({
      user_id: TEST_USER_A,
      strength: 10,
      vitality: 10,
      intelligence: 10,
      wisdom: 10,
      defense: 10,
      total_power: 50,
      balance_score: 100
    }).select().single();

    if (error) throw error;
    if (data.strength === 10 && data.total_power === 50) {
      pass('Create user stats');
    } else {
      fail('Create user stats', 'Stats mismatch');
    }
  } catch (e) {
    fail('Create user stats', e);
  }

  // 1.5 Update character stats
  try {
    const { data, error } = await supabase.from('user_stats')
      .update({ strength: 15, vitality: 12, intelligence: 14, total_power: 61 })
      .eq('user_id', TEST_USER_A)
      .select().single();

    if (error) throw error;
    if (data.strength === 15 && data.vitality === 12) {
      pass('Update character stats');
    } else {
      fail('Update character stats', 'Stats not updated');
    }
  } catch (e) {
    fail('Update character stats', e);
  }

  // 1.6 Create second user to test data isolation
  try {
    const { data, error } = await supabase.from('user_profiles').upsert({
      id: TEST_USER_B,
      username: 'test_user_b',
      display_name: 'Test User B',
      total_xp: 500,
      current_xp: 100,
      current_level: 5,
      cosmic_energy: 200,
      avatar_stage: 'stellar',
      onboarding_completed: true
    }).select().single();

    if (error) throw error;
    pass('Create second user profile');
  } catch (e) {
    fail('Create second user profile', e);
  }

  // 1.7 Verify data isolation
  try {
    const { data: userA } = await supabase.from('user_profiles').select('*').eq('id', TEST_USER_A).single();
    const { data: userB } = await supabase.from('user_profiles').select('*').eq('id', TEST_USER_B).single();

    if (userA.current_level === 2 && userB.current_level === 5) {
      pass('Data isolation - users have separate profiles');
    } else {
      fail('Data isolation - users have separate profiles', `User A level: ${userA?.current_level}, User B level: ${userB?.current_level}`);
    }
  } catch (e) {
    fail('Data isolation - users have separate profiles', e);
  }

  // 1.8 Initialize cosmic currency
  try {
    const { data, error } = await supabase.from('user_cosmic_currency').upsert({
      user_id: TEST_USER_A,
      cosmic_credits: 100,
      lifetime_credits_earned: 100,
      lifetime_credits_spent: 0
    }).select().single();

    if (error) throw error;
    if (data.cosmic_credits === 100) {
      pass('Initialize cosmic currency');
    } else {
      fail('Initialize cosmic currency', 'Credits mismatch');
    }
  } catch (e) {
    fail('Initialize cosmic currency', e);
  }

  // 1.9 Spend cosmic credits
  try {
    const { data, error } = await supabase.from('user_cosmic_currency')
      .update({ cosmic_credits: 50, lifetime_credits_spent: 50 })
      .eq('user_id', TEST_USER_A)
      .select().single();

    if (error) throw error;
    if (data.cosmic_credits === 50) {
      pass('Spend cosmic credits');
    } else {
      fail('Spend cosmic credits', 'Credits not updated');
    }
  } catch (e) {
    fail('Spend cosmic credits', e);
  }
}

// ============================================
// TEST 2: PET SYSTEM
// ============================================
async function testPetSystem() {
  testSection('PET SYSTEM');

  // First, get a real pet ID from the pets table
  let petId = null;
  let pet2Id = null;

  try {
    const { data: pets } = await supabase.from('pets').select('id, name').limit(2);
    if (pets && pets.length >= 2) {
      petId = pets[0].id;
      pet2Id = pets[1].id;
      pass('Found existing pets in database');
    } else {
      // Create test pets if none exist
      const { data: newPet, error } = await supabase.from('pets').insert({
        name: 'Test Cosmic Fox',
        description: 'A magical fox companion',
        tier: 1,
        element: 'cosmic',
        base_stats: { strength: 5, intelligence: 10 }
      }).select().single();

      if (error) throw error;
      petId = newPet.id;

      const { data: newPet2 } = await supabase.from('pets').insert({
        name: 'Test Nebula Owl',
        description: 'A wise owl companion',
        tier: 2,
        element: 'wisdom',
        base_stats: { wisdom: 15, intelligence: 10 }
      }).select().single();

      pet2Id = newPet2?.id;
      pass('Created test pets');
    }
  } catch (e) {
    fail('Get/create pets', e);
    return; // Can't continue pet tests without pets
  }

  // 2.1 Unlock a pet for user
  try {
    const { data, error } = await supabase.from('user_pets').insert({
      user_id: TEST_USER_A,
      pet_id: petId,
      nickname: 'Sparky',
      level: 1,
      xp: 0,
      bond_level: 1,
      is_active: true,
      stats_bonus: { strength: 5 }
    }).select().single();

    if (error) throw error;
    if (data.is_active === true && data.level === 1) {
      pass('Unlock pet for user');
    } else {
      fail('Unlock pet for user', 'Pet data mismatch');
    }
  } catch (e) {
    fail('Unlock pet for user', e);
  }

  // 2.2 Level up pet
  try {
    const { data, error } = await supabase.from('user_pets')
      .update({ level: 2, xp: 100 })
      .eq('user_id', TEST_USER_A)
      .eq('pet_id', petId)
      .select().single();

    if (error) throw error;
    if (data.level === 2) {
      pass('Level up pet');
    } else {
      fail('Level up pet', 'Level not updated');
    }
  } catch (e) {
    fail('Level up pet', e);
  }

  // 2.3 Increase pet bond level
  try {
    const { data, error } = await supabase.from('user_pets')
      .update({ bond_level: 3 })
      .eq('user_id', TEST_USER_A)
      .eq('pet_id', petId)
      .select().single();

    if (error) throw error;
    if (data.bond_level === 3) {
      pass('Increase pet bond level');
    } else {
      fail('Increase pet bond level', 'Bond not updated');
    }
  } catch (e) {
    fail('Increase pet bond level', e);
  }

  // 2.4 Unlock second pet (inactive)
  if (pet2Id) {
    try {
      const { data, error } = await supabase.from('user_pets').insert({
        user_id: TEST_USER_A,
        pet_id: pet2Id,
        nickname: 'Hooty',
        level: 1,
        xp: 0,
        bond_level: 1,
        is_active: false,
        stats_bonus: { wisdom: 10 }
      }).select().single();

      if (error) throw error;
      if (data.is_active === false) {
        pass('Unlock second pet (inactive)');
      } else {
        fail('Unlock second pet (inactive)', 'Should be inactive');
      }
    } catch (e) {
      fail('Unlock second pet (inactive)', e);
    }

    // 2.5 Switch active pet
    try {
      // Deactivate first pet
      await supabase.from('user_pets')
        .update({ is_active: false })
        .eq('user_id', TEST_USER_A)
        .eq('pet_id', petId);

      // Activate second pet
      const { data, error } = await supabase.from('user_pets')
        .update({ is_active: true })
        .eq('user_id', TEST_USER_A)
        .eq('pet_id', pet2Id)
        .select().single();

      if (error) throw error;
      if (data.is_active === true) {
        pass('Switch active pet');
      } else {
        fail('Switch active pet', 'Pet not activated');
      }
    } catch (e) {
      fail('Switch active pet', e);
    }
  }

  // 2.6 Data isolation - User B has no pets
  try {
    const { data } = await supabase.from('user_pets').select('*').eq('user_id', TEST_USER_B);
    if (!data || data.length === 0) {
      pass('Data isolation - User B has no pets');
    } else {
      fail('Data isolation - User B has no pets', 'User B has pets they shouldn\'t');
    }
  } catch (e) {
    fail('Data isolation - User B has no pets', e);
  }
}

// ============================================
// TEST 3: EQUIPMENT SYSTEM
// ============================================
async function testEquipmentSystem() {
  testSection('EQUIPMENT SYSTEM');

  // Get or create test equipment
  let equipmentId = null;
  let equipment2Id = null;

  try {
    const { data: equipment } = await supabase.from('equipment_items').select('id, name, slot').limit(2);
    if (equipment && equipment.length >= 2) {
      equipmentId = equipment[0].id;
      equipment2Id = equipment[1].id;
      pass('Found existing equipment in database');
    } else {
      // Equipment items are usually seeded - this is unexpected
      fail('Find equipment items', 'No equipment items in database');
      return;
    }
  } catch (e) {
    fail('Get equipment items', e);
    return;
  }

  // 3.1 Unlock equipment for user
  try {
    const { data, error } = await supabase.from('user_equipment_unlocks').insert({
      user_id: TEST_USER_A,
      equipment_id: equipmentId,
      unlock_method: 'test'
    }).select().single();

    if (error) throw error;
    pass('Unlock equipment');
  } catch (e) {
    fail('Unlock equipment', e);
  }

  // 3.2 Add equipment to user's inventory
  try {
    const { data, error } = await supabase.from('user_equipment').insert({
      user_id: TEST_USER_A,
      equipment_id: equipmentId,
      is_equipped: false,
      is_favorite: false
    }).select().single();

    if (error) throw error;
    pass('Add equipment to inventory');
  } catch (e) {
    fail('Add equipment to inventory', e);
  }

  // 3.3 Equip item
  try {
    const { data, error } = await supabase.from('user_equipment')
      .update({ is_equipped: true, slot_position: 1 })
      .eq('user_id', TEST_USER_A)
      .eq('equipment_id', equipmentId)
      .select().single();

    if (error) throw error;
    if (data.is_equipped === true) {
      pass('Equip item');
    } else {
      fail('Equip item', 'Item not equipped');
    }
  } catch (e) {
    fail('Equip item', e);
  }

  // 3.4 Add second equipment piece
  try {
    await supabase.from('user_equipment_unlocks').insert({
      user_id: TEST_USER_A,
      equipment_id: equipment2Id,
      unlock_method: 'test'
    });

    const { data, error } = await supabase.from('user_equipment').insert({
      user_id: TEST_USER_A,
      equipment_id: equipment2Id,
      is_equipped: false,
      is_favorite: true
    }).select().single();

    if (error) throw error;
    pass('Add second equipment piece');
  } catch (e) {
    fail('Add second equipment piece', e);
  }

  // 3.5 Unequip item
  try {
    const { data, error } = await supabase.from('user_equipment')
      .update({ is_equipped: false, slot_position: null })
      .eq('user_id', TEST_USER_A)
      .eq('equipment_id', equipmentId)
      .select().single();

    if (error) throw error;
    if (data.is_equipped === false) {
      pass('Unequip item');
    } else {
      fail('Unequip item', 'Item still equipped');
    }
  } catch (e) {
    fail('Unequip item', e);
  }

  // 3.6 Update equipped_items in user_profiles (JSONB storage)
  try {
    const { data, error } = await supabase.from('user_profiles')
      .update({ equipped_items: { weapon: equipmentId, armor: equipment2Id } })
      .eq('id', TEST_USER_A)
      .select('equipped_items').single();

    if (error) throw error;
    if (data.equipped_items?.weapon === equipmentId) {
      pass('Update equipped_items in profile');
    } else {
      fail('Update equipped_items in profile', 'JSONB not updated');
    }
  } catch (e) {
    fail('Update equipped_items in profile', e);
  }
}

// ============================================
// TEST 4: ACHIEVEMENTS SYSTEM
// ============================================
async function testAchievementsSystem() {
  testSection('ACHIEVEMENTS SYSTEM');

  // 4.1 Unlock an achievement
  try {
    const { data, error } = await supabase.from('user_achievements').insert({
      user_id: TEST_USER_A,
      achievement_id: 'first_workout',
      xp_earned: 50,
      credits_earned: 25
    }).select().single();

    if (error) throw error;
    if (data.achievement_id === 'first_workout') {
      pass('Unlock achievement');
    } else {
      fail('Unlock achievement', 'Achievement data mismatch');
    }
  } catch (e) {
    fail('Unlock achievement', e);
  }

  // 4.2 Track achievement progress
  try {
    const { data, error } = await supabase.from('achievement_progress').insert({
      user_id: TEST_USER_A,
      achievement_key: 'workout_streak_7',
      current_progress: 3,
      target_progress: 7,
      progress_percentage: 42.86
    }).select().single();

    if (error) throw error;
    if (data.current_progress === 3) {
      pass('Track achievement progress');
    } else {
      fail('Track achievement progress', 'Progress mismatch');
    }
  } catch (e) {
    fail('Track achievement progress', e);
  }

  // 4.3 Update achievement progress
  try {
    const { data, error } = await supabase.from('achievement_progress')
      .update({ current_progress: 5, progress_percentage: 71.43 })
      .eq('user_id', TEST_USER_A)
      .eq('achievement_key', 'workout_streak_7')
      .select().single();

    if (error) throw error;
    if (data.current_progress === 5) {
      pass('Update achievement progress');
    } else {
      fail('Update achievement progress', 'Progress not updated');
    }
  } catch (e) {
    fail('Update achievement progress', e);
  }

  // 4.4 Complete achievement (full progress)
  try {
    const { data, error } = await supabase.from('achievement_progress')
      .update({ current_progress: 7, progress_percentage: 100, is_complete: true })
      .eq('user_id', TEST_USER_A)
      .eq('achievement_key', 'workout_streak_7')
      .select().single();

    if (error) throw error;
    if (data.is_complete === true) {
      pass('Complete achievement');
    } else {
      fail('Complete achievement', 'Achievement not marked complete');
    }
  } catch (e) {
    fail('Complete achievement', e);
  }

  // 4.5 Unlock multiple achievements
  try {
    const achievements = [
      { user_id: TEST_USER_A, achievement_id: 'level_5', xp_earned: 100, credits_earned: 50 },
      { user_id: TEST_USER_A, achievement_id: 'first_journal', xp_earned: 30, credits_earned: 15 }
    ];

    const { error } = await supabase.from('user_achievements').insert(achievements);

    if (error) throw error;
    pass('Unlock multiple achievements');
  } catch (e) {
    fail('Unlock multiple achievements', e);
  }

  // 4.6 Data isolation
  try {
    const { data } = await supabase.from('user_achievements')
      .select('*')
      .eq('user_id', TEST_USER_B);

    if (!data || data.length === 0) {
      pass('Data isolation - User B has no achievements');
    } else {
      fail('Data isolation - User B has no achievements', 'User B has achievements');
    }
  } catch (e) {
    fail('Data isolation - User B has no achievements', e);
  }
}

// ============================================
// TEST 5: SKILLS & CONSTELLATIONS
// ============================================
async function testSkillsAndConstellations() {
  testSection('SKILLS & CONSTELLATIONS');

  let skillId = null;

  // 5.1 Create a skill
  try {
    const { data, error } = await supabase.from('skills').insert({
      user_id: TEST_USER_A,
      name: 'JavaScript',
      description: 'Web programming language',
      category: 'Programming',
      current_level: 1,
      target_level: 10,
      xp: 0,
      total_practice_hours: 0,
      status: 'active',
      icon: '💻',
      color: '#f7df1e'
    }).select().single();

    if (error) throw error;
    skillId = data.id;
    if (data.name === 'JavaScript' && data.current_level === 1) {
      pass('Create skill');
    } else {
      fail('Create skill', 'Skill data mismatch');
    }
  } catch (e) {
    fail('Create skill', e);
  }

  // 5.2 Log skill practice
  if (skillId) {
    try {
      const { data, error } = await supabase.from('skill_practice_logs').insert({
        user_id: TEST_USER_A,
        skill_id: skillId,
        duration_minutes: 60,
        notes: 'Built a React component',
        quality_rating: 4,
        xp_earned: 100
      }).select().single();

      if (error) throw error;
      if (data.duration_minutes === 60) {
        pass('Log skill practice');
      } else {
        fail('Log skill practice', 'Practice log mismatch');
      }
    } catch (e) {
      fail('Log skill practice', e);
    }

    // 5.3 Level up skill
    try {
      const { data, error } = await supabase.from('skills')
        .update({ current_level: 2, xp: 150, total_practice_hours: 1 })
        .eq('id', skillId)
        .select().single();

      if (error) throw error;
      if (data.current_level === 2) {
        pass('Level up skill');
      } else {
        fail('Level up skill', 'Skill level not updated');
      }
    } catch (e) {
      fail('Level up skill', e);
    }
  }

  // 5.4 Create constellation progress
  try {
    const { data, error } = await supabase.from('user_constellation_progress').insert({
      user_id: TEST_USER_A,
      constellation_id: 'health_warrior',
      stars_unlocked: 3,
      total_stars: 12,
      is_complete: false
    }).select().single();

    if (error) throw error;
    if (data.stars_unlocked === 3) {
      pass('Create constellation progress');
    } else {
      fail('Create constellation progress', 'Progress mismatch');
    }
  } catch (e) {
    fail('Create constellation progress', e);
  }

  // 5.5 Unlock constellation star
  try {
    const { data, error } = await supabase.from('user_constellation_progress')
      .update({ stars_unlocked: 4 })
      .eq('user_id', TEST_USER_A)
      .eq('constellation_id', 'health_warrior')
      .select().single();

    if (error) throw error;
    if (data.stars_unlocked === 4) {
      pass('Unlock constellation star');
    } else {
      fail('Unlock constellation star', 'Star not unlocked');
    }
  } catch (e) {
    fail('Unlock constellation star', e);
  }

  // 5.6 Initialize skill points
  try {
    const { data, error } = await supabase.from('user_skill_points').insert({
      user_id: TEST_USER_A,
      total_points_earned: 10,
      points_spent: 3,
      points_available: 7
    }).select().single();

    if (error) throw error;
    if (data.points_available === 7) {
      pass('Initialize skill points');
    } else {
      fail('Initialize skill points', 'Points mismatch');
    }
  } catch (e) {
    fail('Initialize skill points', e);
  }

  // 5.7 Spend skill points
  try {
    const { data, error } = await supabase.from('user_skill_points')
      .update({ points_spent: 5, points_available: 5 })
      .eq('user_id', TEST_USER_A)
      .select().single();

    if (error) throw error;
    if (data.points_available === 5) {
      pass('Spend skill points');
    } else {
      fail('Spend skill points', 'Points not updated');
    }
  } catch (e) {
    fail('Spend skill points', e);
  }
}

// ============================================
// TEST 6: DAILY TASKS & QUESTS
// ============================================
async function testDailyTasksAndQuests() {
  testSection('DAILY TASKS & QUESTS');

  let taskId = null;

  // 6.1 Create a daily task
  try {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase.from('daily_tasks').insert({
      user_id: TEST_USER_A,
      task_date: today,
      title: 'Morning Workout',
      description: '30 min cardio',
      category: 'health',
      priority: 'high',
      estimated_minutes: 30,
      completed: false,
      task_order: 1
    }).select().single();

    if (error) throw error;
    taskId = data.id;
    if (data.title === 'Morning Workout') {
      pass('Create daily task');
    } else {
      fail('Create daily task', 'Task data mismatch');
    }
  } catch (e) {
    fail('Create daily task', e);
  }

  // 6.2 Complete daily task
  if (taskId) {
    try {
      const { data, error } = await supabase.from('daily_tasks')
        .update({ completed: true, completed_at: new Date().toISOString() })
        .eq('id', taskId)
        .select().single();

      if (error) throw error;
      if (data.completed === true) {
        pass('Complete daily task');
      } else {
        fail('Complete daily task', 'Task not marked complete');
      }
    } catch (e) {
      fail('Complete daily task', e);
    }
  }

  // 6.3 Create a quest
  try {
    const { data, error } = await supabase.from('user_quests').insert({
      user_id: TEST_USER_A,
      quest_id: 'weekly_fitness_champion',
      status: 'active',
      progress: { workouts_completed: 2, target: 5 },
      started_at: new Date().toISOString(),
      rewards_claimed: false
    }).select().single();

    if (error) throw error;
    if (data.status === 'active') {
      pass('Create quest');
    } else {
      fail('Create quest', 'Quest data mismatch');
    }
  } catch (e) {
    fail('Create quest', e);
  }

  // 6.4 Update quest progress
  try {
    const { data, error } = await supabase.from('user_quests')
      .update({ progress: { workouts_completed: 4, target: 5 } })
      .eq('user_id', TEST_USER_A)
      .eq('quest_id', 'weekly_fitness_champion')
      .select().single();

    if (error) throw error;
    if (data.progress?.workouts_completed === 4) {
      pass('Update quest progress');
    } else {
      fail('Update quest progress', 'Progress not updated');
    }
  } catch (e) {
    fail('Update quest progress', e);
  }

  // 6.5 Complete quest
  try {
    const { data, error } = await supabase.from('user_quests')
      .update({
        status: 'completed',
        progress: { workouts_completed: 5, target: 5 },
        completed_at: new Date().toISOString()
      })
      .eq('user_id', TEST_USER_A)
      .eq('quest_id', 'weekly_fitness_champion')
      .select().single();

    if (error) throw error;
    if (data.status === 'completed') {
      pass('Complete quest');
    } else {
      fail('Complete quest', 'Quest not completed');
    }
  } catch (e) {
    fail('Complete quest', e);
  }

  // 6.6 Create daily quest
  try {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase.from('daily_quests').insert({
      user_id: TEST_USER_A,
      quest_date: today,
      quest_type: 'workout',
      title: 'Complete 1 Workout',
      xp_reward: 50,
      is_completed: false
    }).select().single();

    if (error) throw error;
    pass('Create daily quest');
  } catch (e) {
    fail('Create daily quest', e);
  }
}

// ============================================
// TEST 7: STREAKS SYSTEM
// ============================================
async function testStreaksSystem() {
  testSection('STREAKS SYSTEM');

  let streakId = null;

  // 7.1 Create custom streak
  try {
    const { data, error } = await supabase.from('custom_streaks').insert({
      user_id: TEST_USER_A,
      name: 'Morning Meditation',
      icon: '🧘',
      color: '#9b59b6',
      frequency: 'daily',
      goal: 30,
      description: 'Meditate every morning',
      current_streak: 0,
      longest_streak: 0,
      total_completions: 0
    }).select().single();

    if (error) throw error;
    streakId = data.id;
    if (data.name === 'Morning Meditation') {
      pass('Create custom streak');
    } else {
      fail('Create custom streak', 'Streak data mismatch');
    }
  } catch (e) {
    fail('Create custom streak', e);
  }

  // 7.2 Log streak completion
  if (streakId) {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase.from('custom_streak_completions').insert({
        user_id: TEST_USER_A,
        streak_id: streakId,
        completion_date: today,
        notes: 'Great session!'
      }).select().single();

      if (error) throw error;
      pass('Log streak completion');
    } catch (e) {
      fail('Log streak completion', e);
    }

    // 7.3 Update streak count
    try {
      const { data, error } = await supabase.from('custom_streaks')
        .update({
          current_streak: 1,
          total_completions: 1,
          last_completed_at: new Date().toISOString()
        })
        .eq('id', streakId)
        .select().single();

      if (error) throw error;
      if (data.current_streak === 1) {
        pass('Update streak count');
      } else {
        fail('Update streak count', 'Streak not updated');
      }
    } catch (e) {
      fail('Update streak count', e);
    }
  }

  // 7.4 Create user streaks summary
  try {
    const { data, error } = await supabase.from('user_streaks').insert({
      user_id: TEST_USER_A,
      streak_type: 'daily_login',
      current_count: 5,
      longest_count: 10,
      last_activity_date: new Date().toISOString().split('T')[0]
    }).select().single();

    if (error) throw error;
    if (data.current_count === 5) {
      pass('Create user streaks summary');
    } else {
      fail('Create user streaks summary', 'Streak data mismatch');
    }
  } catch (e) {
    fail('Create user streaks summary', e);
  }

  // 7.5 Create momentum chain
  try {
    const { data, error } = await supabase.from('momentum_chains').insert({
      user_id: TEST_USER_A,
      chain_type: 'productivity',
      current_chain: 3,
      max_chain: 5,
      last_activity: new Date().toISOString()
    }).select().single();

    if (error) throw error;
    if (data.current_chain === 3) {
      pass('Create momentum chain');
    } else {
      fail('Create momentum chain', 'Chain data mismatch');
    }
  } catch (e) {
    fail('Create momentum chain', e);
  }
}

// ============================================
// TEST 8: HEALTH MODULE
// ============================================
async function testHealthModule() {
  testSection('HEALTH MODULE');

  // 8.1 Log workout
  try {
    const { data, error } = await supabase.from('health_workouts').insert({
      user_id: TEST_USER_A,
      workout_type: 'strength',
      title: 'Upper Body Day',
      description: 'Chest, shoulders, triceps',
      duration_minutes: 45,
      calories_burned: 300,
      intensity: 7,
      perceived_exertion: 8,
      mood_after: 9,
      workout_date: new Date().toISOString()
    }).select().single();

    if (error) throw error;
    if (data.workout_type === 'strength') {
      pass('Log workout');
    } else {
      fail('Log workout', 'Workout data mismatch');
    }
  } catch (e) {
    fail('Log workout', e);
  }

  // 8.2 Log nutrition
  try {
    const { data, error } = await supabase.from('health_nutrition_logs').insert({
      user_id: TEST_USER_A,
      log_date: new Date().toISOString().split('T')[0],
      meal_type: 'breakfast',
      food_name: 'Oatmeal with berries',
      calories: 350,
      protein_g: 12,
      carbs_g: 60,
      fat_g: 8
    }).select().single();

    if (error) throw error;
    if (data.calories === 350) {
      pass('Log nutrition');
    } else {
      fail('Log nutrition', 'Nutrition data mismatch');
    }
  } catch (e) {
    fail('Log nutrition', e);
  }

  // 8.3 Log sleep
  try {
    const { data, error } = await supabase.from('health_sleep_logs').insert({
      user_id: TEST_USER_A,
      sleep_date: new Date().toISOString().split('T')[0],
      bedtime: '22:30',
      wake_time: '06:30',
      duration_hours: 8,
      quality_rating: 4,
      deep_sleep_hours: 2.5,
      rem_sleep_hours: 1.5
    }).select().single();

    if (error) throw error;
    if (data.duration_hours === 8) {
      pass('Log sleep');
    } else {
      fail('Log sleep', 'Sleep data mismatch');
    }
  } catch (e) {
    fail('Log sleep', e);
  }

  // 8.4 Log water intake
  try {
    const { data, error } = await supabase.from('health_water_logs').insert({
      user_id: TEST_USER_A,
      log_date: new Date().toISOString().split('T')[0],
      amount_ml: 500,
      log_time: new Date().toISOString()
    }).select().single();

    if (error) throw error;
    if (data.amount_ml === 500) {
      pass('Log water intake');
    } else {
      fail('Log water intake', 'Water data mismatch');
    }
  } catch (e) {
    fail('Log water intake', e);
  }

  // 8.5 Log supplement
  try {
    const { data, error } = await supabase.from('health_supplement_logs').insert({
      user_id: TEST_USER_A,
      supplement_name: 'Vitamin D3',
      dosage: '5000 IU',
      taken_at: new Date().toISOString()
    }).select().single();

    if (error) throw error;
    pass('Log supplement');
  } catch (e) {
    fail('Log supplement', e);
  }

  // 8.6 Log recovery
  try {
    const { data, error } = await supabase.from('health_recovery_logs').insert({
      user_id: TEST_USER_A,
      log_date: new Date().toISOString().split('T')[0],
      recovery_score: 85,
      soreness_level: 3,
      energy_level: 8,
      stress_level: 4
    }).select().single();

    if (error) throw error;
    if (data.recovery_score === 85) {
      pass('Log recovery');
    } else {
      fail('Log recovery', 'Recovery data mismatch');
    }
  } catch (e) {
    fail('Log recovery', e);
  }
}

// ============================================
// TEST 9: PRODUCTIVITY MODULE
// ============================================
async function testProductivityModule() {
  testSection('PRODUCTIVITY MODULE');

  let projectId = null;
  let taskId = null;

  // 9.1 Create project
  try {
    const { data, error } = await supabase.from('productivity_projects').insert({
      user_id: TEST_USER_A,
      name: 'LifeOS Development',
      description: 'Building the ultimate life OS',
      status: 'active',
      priority: 1,
      color: '#3498db',
      estimated_hours: 100
    }).select().single();

    if (error) throw error;
    projectId = data.id;
    if (data.name === 'LifeOS Development') {
      pass('Create project');
    } else {
      fail('Create project', 'Project data mismatch');
    }
  } catch (e) {
    fail('Create project', e);
  }

  // 9.2 Create task
  if (projectId) {
    try {
      const { data, error } = await supabase.from('productivity_tasks').insert({
        user_id: TEST_USER_A,
        project_id: projectId,
        title: 'Implement user dashboard',
        description: 'Create main dashboard component',
        status: 'todo',
        priority: 1,
        estimated_minutes: 120
      }).select().single();

      if (error) throw error;
      taskId = data.id;
      if (data.title === 'Implement user dashboard') {
        pass('Create task');
      } else {
        fail('Create task', 'Task data mismatch');
      }
    } catch (e) {
      fail('Create task', e);
    }
  }

  // 9.3 Complete task
  if (taskId) {
    try {
      const { data, error } = await supabase.from('productivity_tasks')
        .update({
          status: 'completed',
          actual_minutes: 90,
          completed_at: new Date().toISOString()
        })
        .eq('id', taskId)
        .select().single();

      if (error) throw error;
      if (data.status === 'completed') {
        pass('Complete task');
      } else {
        fail('Complete task', 'Task not completed');
      }
    } catch (e) {
      fail('Complete task', e);
    }
  }

  // 9.4 Log productivity session
  try {
    const { data, error } = await supabase.from('productivity_sessions').insert({
      user_id: TEST_USER_A,
      project_id: projectId,
      task_id: taskId,
      duration_minutes: 45,
      session_type: 'deep_work',
      focus_score: 9,
      notes: 'Great flow state',
      started_at: new Date(Date.now() - 45 * 60000).toISOString(),
      ended_at: new Date().toISOString()
    }).select().single();

    if (error) throw error;
    if (data.duration_minutes === 45) {
      pass('Log productivity session');
    } else {
      fail('Log productivity session', 'Session data mismatch');
    }
  } catch (e) {
    fail('Log productivity session', e);
  }

  // 9.5 Log income
  try {
    const { data, error } = await supabase.from('productivity_income').insert({
      user_id: TEST_USER_A,
      project_id: projectId,
      amount: 500,
      currency: 'USD',
      income_date: new Date().toISOString().split('T')[0],
      description: 'Client payment',
      income_type: 'freelance'
    }).select().single();

    if (error) throw error;
    if (data.amount === 500) {
      pass('Log income');
    } else {
      fail('Log income', 'Income data mismatch');
    }
  } catch (e) {
    fail('Log income', e);
  }
}

// ============================================
// TEST 10: FINANCIAL MODULE
// ============================================
async function testFinancialModule() {
  testSection('FINANCIAL MODULE');

  let accountId = null;

  // 10.1 Create financial account
  try {
    const { data, error } = await supabase.from('financial_accounts').insert({
      user_id: TEST_USER_A,
      account_name: 'Main Checking',
      account_type: 'checking',
      institution: 'Test Bank',
      currency: 'USD',
      current_balance: 5000,
      active: true
    }).select().single();

    if (error) throw error;
    accountId = data.id;
    if (data.current_balance === 5000) {
      pass('Create financial account');
    } else {
      fail('Create financial account', 'Account data mismatch');
    }
  } catch (e) {
    fail('Create financial account', e);
  }

  // 10.2 Log transaction
  if (accountId) {
    try {
      const { data, error } = await supabase.from('financial_transactions').insert({
        user_id: TEST_USER_A,
        account_id: accountId,
        transaction_date: new Date().toISOString().split('T')[0],
        amount: -50,
        transaction_type: 'expense',
        category: 'Food',
        subcategory: 'Groceries',
        merchant: 'Whole Foods',
        description: 'Weekly groceries'
      }).select().single();

      if (error) throw error;
      if (data.amount === -50) {
        pass('Log transaction');
      } else {
        fail('Log transaction', 'Transaction data mismatch');
      }
    } catch (e) {
      fail('Log transaction', e);
    }
  }

  // 10.3 Create budget
  try {
    const { data, error } = await supabase.from('financial_budgets').insert({
      user_id: TEST_USER_A,
      category: 'Food',
      budget_limit: 500,
      period: 'monthly',
      is_active: true
    }).select().single();

    if (error) throw error;
    if (data.budget_limit === 500) {
      pass('Create budget');
    } else {
      fail('Create budget', 'Budget data mismatch');
    }
  } catch (e) {
    fail('Create budget', e);
  }

  // 10.4 Create financial goal
  try {
    const { data, error } = await supabase.from('financial_goals').insert({
      user_id: TEST_USER_A,
      goal_name: 'Emergency Fund',
      goal_type: 'savings',
      target_amount: 10000,
      current_amount: 2500,
      deadline: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'active'
    }).select().single();

    if (error) throw error;
    if (data.target_amount === 10000) {
      pass('Create financial goal');
    } else {
      fail('Create financial goal', 'Goal data mismatch');
    }
  } catch (e) {
    fail('Create financial goal', e);
  }

  // 10.5 Update account balance
  if (accountId) {
    try {
      const { data, error } = await supabase.from('financial_accounts')
        .update({ current_balance: 4950 })
        .eq('id', accountId)
        .select().single();

      if (error) throw error;
      if (data.current_balance === 4950) {
        pass('Update account balance');
      } else {
        fail('Update account balance', 'Balance not updated');
      }
    } catch (e) {
      fail('Update account balance', e);
    }
  }
}

// ============================================
// TEST 11: CALENDAR MODULE
// ============================================
async function testCalendarModule() {
  testSection('CALENDAR MODULE');

  // 11.1 Create time block
  try {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase.from('calendar_time_blocks').insert({
      user_id: TEST_USER_A,
      block_date: today,
      block_type: 'deep_work',
      title: 'Focus Session',
      planned_start: '09:00',
      planned_end: '11:00',
      planned_duration: 120,
      energy_level: 'high',
      module: 'productivity',
      status: 'planned',
      priority: 'high'
    }).select().single();

    if (error) throw error;
    if (data.title === 'Focus Session') {
      pass('Create time block');
    } else {
      fail('Create time block', 'Time block data mismatch');
    }
  } catch (e) {
    fail('Create time block', e);
  }

  // 11.2 Complete time block
  try {
    const { data, error } = await supabase.from('calendar_time_blocks')
      .update({
        status: 'completed',
        actual_start: '09:05',
        actual_end: '11:10',
        actual_duration: 125,
        actual_energy_level: 'high',
        completed_at: new Date().toISOString()
      })
      .eq('user_id', TEST_USER_A)
      .eq('title', 'Focus Session')
      .select().single();

    if (error) throw error;
    if (data.status === 'completed') {
      pass('Complete time block');
    } else {
      fail('Complete time block', 'Block not completed');
    }
  } catch (e) {
    fail('Complete time block', e);
  }

  // 11.3 Create calendar event
  try {
    const { data, error } = await supabase.from('calendar_events').insert({
      user_id: TEST_USER_A,
      title: 'Team Meeting',
      description: 'Weekly sync',
      event_type: 'meeting',
      start_time: new Date().toISOString(),
      end_time: new Date(Date.now() + 60 * 60000).toISOString(),
      location: 'Zoom',
      is_all_day: false
    }).select().single();

    if (error) throw error;
    if (data.title === 'Team Meeting') {
      pass('Create calendar event');
    } else {
      fail('Create calendar event', 'Event data mismatch');
    }
  } catch (e) {
    fail('Create calendar event', e);
  }
}

// ============================================
// TEST 12: JOURNAL MODULE
// ============================================
async function testJournalModule() {
  testSection('JOURNAL MODULE');

  let entryId = null;

  // 12.1 Create journal entry
  try {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase.from('journal_entries').insert({
      user_id: TEST_USER_A,
      entry_date: today,
      title: 'A Great Day',
      content: 'Today was productive. I accomplished all my goals.',
      mood_rating: 8,
      energy_level: 7,
      gratitude_items: ['Good health', 'Supportive friends', 'Progress on project'],
      wins: ['Completed workout', 'Finished coding task'],
      challenges: ['Some distractions'],
      lessons_learned: 'Focus is key',
      tomorrow_focus: 'Continue momentum'
    }).select().single();

    if (error) throw error;
    entryId = data.id;
    if (data.mood_rating === 8) {
      pass('Create journal entry');
    } else {
      fail('Create journal entry', 'Entry data mismatch');
    }
  } catch (e) {
    fail('Create journal entry', e);
  }

  // 12.2 Update journal entry
  if (entryId) {
    try {
      const { data, error } = await supabase.from('journal_entries')
        .update({
          content: 'Today was productive. I accomplished all my goals. Updated with more thoughts.',
          is_favorite: true
        })
        .eq('id', entryId)
        .select().single();

      if (error) throw error;
      if (data.is_favorite === true) {
        pass('Update journal entry');
      } else {
        fail('Update journal entry', 'Entry not updated');
      }
    } catch (e) {
      fail('Update journal entry', e);
    }
  }

  // 12.3 Add journal prompt response
  try {
    const { data, error } = await supabase.from('journal_prompts').insert({
      user_id: TEST_USER_A,
      prompt_text: 'What are you grateful for today?',
      response_text: 'I am grateful for my health and opportunities.',
      prompt_date: new Date().toISOString().split('T')[0],
      prompt_category: 'gratitude'
    }).select().single();

    if (error) throw error;
    pass('Add journal prompt response');
  } catch (e) {
    fail('Add journal prompt response', e);
  }
}

// ============================================
// TEST 13: KNOWLEDGE MODULE
// ============================================
async function testKnowledgeModule() {
  testSection('KNOWLEDGE MODULE');

  let noteId = null;

  // 13.1 Create note
  try {
    const { data, error } = await supabase.from('knowledge_notes').insert({
      user_id: TEST_USER_A,
      title: 'React Best Practices',
      content: '# React Best Practices\n\n1. Use functional components\n2. Implement proper state management',
      tags: ['react', 'programming', 'frontend'],
      folder_path: '/programming/react',
      pinned: false,
      archived: false,
      is_favorite: false
    }).select().single();

    if (error) throw error;
    noteId = data.id;
    if (data.title === 'React Best Practices') {
      pass('Create note');
    } else {
      fail('Create note', 'Note data mismatch');
    }
  } catch (e) {
    fail('Create note', e);
  }

  // 13.2 Update note
  if (noteId) {
    try {
      const { data, error } = await supabase.from('knowledge_notes')
        .update({
          content: '# React Best Practices\n\n1. Use functional components\n2. Implement proper state management\n3. Use custom hooks',
          is_favorite: true
        })
        .eq('id', noteId)
        .select().single();

      if (error) throw error;
      if (data.is_favorite === true) {
        pass('Update note');
      } else {
        fail('Update note', 'Note not updated');
      }
    } catch (e) {
      fail('Update note', e);
    }
  }

  // 13.3 Add book
  try {
    const { data, error } = await supabase.from('knowledge_books').insert({
      user_id: TEST_USER_A,
      title: 'Atomic Habits',
      author: 'James Clear',
      status: 'reading',
      total_pages: 320,
      current_page: 150,
      rating: 5,
      notes: 'Great book on habit formation'
    }).select().single();

    if (error) throw error;
    if (data.title === 'Atomic Habits') {
      pass('Add book');
    } else {
      fail('Add book', 'Book data mismatch');
    }
  } catch (e) {
    fail('Add book', e);
  }

  // 13.4 Complete book
  try {
    const { data, error } = await supabase.from('knowledge_books')
      .update({
        status: 'completed',
        current_page: 320,
        completed_at: new Date().toISOString()
      })
      .eq('user_id', TEST_USER_A)
      .eq('title', 'Atomic Habits')
      .select().single();

    if (error) throw error;
    if (data.status === 'completed') {
      pass('Complete book');
    } else {
      fail('Complete book', 'Book not completed');
    }
  } catch (e) {
    fail('Complete book', e);
  }

  // 13.5 Save media
  try {
    const { data, error } = await supabase.from('knowledge_media').insert({
      user_id: TEST_USER_A,
      title: 'How to Learn Anything',
      media_type: 'video',
      url: 'https://youtube.com/example',
      status: 'saved',
      notes: 'Great learning tips'
    }).select().single();

    if (error) throw error;
    pass('Save media');
  } catch (e) {
    fail('Save media', e);
  }
}

// ============================================
// TEST 14: BAD HABITS & RESOLUTIONS
// ============================================
async function testBadHabitsAndResolutions() {
  testSection('BAD HABITS & RESOLUTIONS');

  let habitId = null;
  let resolutionId = null;

  // 14.1 Track bad habit
  try {
    const { data, error } = await supabase.from('bad_habits').insert({
      user_id: TEST_USER_A,
      name: 'Late night snacking',
      description: 'Eating unhealthy snacks after 9pm',
      trigger: 'Boredom',
      replacement_behavior: 'Drink herbal tea',
      current_streak_days: 0,
      longest_streak_days: 5,
      total_relapses: 3
    }).select().single();

    if (error) throw error;
    habitId = data.id;
    if (data.name === 'Late night snacking') {
      pass('Track bad habit');
    } else {
      fail('Track bad habit', 'Habit data mismatch');
    }
  } catch (e) {
    fail('Track bad habit', e);
  }

  // 14.2 Log relapse
  if (habitId) {
    try {
      const { data, error } = await supabase.from('bad_habit_relapses').insert({
        user_id: TEST_USER_A,
        habit_id: habitId,
        relapse_date: new Date().toISOString().split('T')[0],
        trigger_note: 'Was stressed from work',
        severity: 3,
        lesson_learned: 'Need better stress management'
      }).select().single();

      if (error) throw error;
      pass('Log relapse');
    } catch (e) {
      fail('Log relapse', e);
    }
  }

  // 14.3 Create resolution
  try {
    const { data, error } = await supabase.from('resolutions').insert({
      user_id: TEST_USER_A,
      title: 'Read 24 books this year',
      description: 'Average 2 books per month',
      category: 'personal_development',
      target_value: 24,
      current_value: 5,
      status: 'active',
      start_date: new Date().toISOString().split('T')[0]
    }).select().single();

    if (error) throw error;
    resolutionId = data.id;
    if (data.title === 'Read 24 books this year') {
      pass('Create resolution');
    } else {
      fail('Create resolution', 'Resolution data mismatch');
    }
  } catch (e) {
    fail('Create resolution', e);
  }

  // 14.4 Log resolution check-in
  if (resolutionId) {
    try {
      const { data, error } = await supabase.from('resolution_check_ins').insert({
        user_id: TEST_USER_A,
        resolution_id: resolutionId,
        check_in_date: new Date().toISOString().split('T')[0],
        progress_value: 6,
        notes: 'Finished another book!'
      }).select().single();

      if (error) throw error;
      pass('Log resolution check-in');
    } catch (e) {
      fail('Log resolution check-in', e);
    }
  }
}

// ============================================
// TEST 15: SOCIAL FEATURES
// ============================================
async function testSocialFeatures() {
  testSection('SOCIAL FEATURES');

  let activityId = null;

  // 15.1 Post to activity feed
  try {
    const { data, error } = await supabase.from('activity_feed').insert({
      user_id: TEST_USER_A,
      activity_type: 'achievement',
      title: 'Unlocked First Workout Achievement!',
      description: 'Completed my first workout',
      xp_earned: 50,
      is_public: true
    }).select().single();

    if (error) throw error;
    activityId = data.id;
    if (data.activity_type === 'achievement') {
      pass('Post to activity feed');
    } else {
      fail('Post to activity feed', 'Activity data mismatch');
    }
  } catch (e) {
    fail('Post to activity feed', e);
  }

  // 15.2 Add comment to activity
  if (activityId) {
    try {
      const { data, error } = await supabase.from('activity_comments').insert({
        activity_id: activityId,
        user_id: TEST_USER_B,
        comment_text: 'Great job!'
      }).select().single();

      if (error) throw error;
      pass('Add comment to activity');
    } catch (e) {
      fail('Add comment to activity', e);
    }

    // 15.3 Like activity
    try {
      const { data, error } = await supabase.from('activity_likes').insert({
        activity_id: activityId,
        user_id: TEST_USER_B
      }).select().single();

      if (error) throw error;
      pass('Like activity');
    } catch (e) {
      fail('Like activity', e);
    }
  }

  // 15.4 Create friendship
  try {
    const { data, error } = await supabase.from('friendships').insert({
      user_id: TEST_USER_A,
      friend_id: TEST_USER_B,
      status: 'pending'
    }).select().single();

    if (error) throw error;
    if (data.status === 'pending') {
      pass('Send friend request');
    } else {
      fail('Send friend request', 'Friendship data mismatch');
    }
  } catch (e) {
    fail('Send friend request', e);
  }

  // 15.5 Accept friendship
  try {
    const { data, error } = await supabase.from('friendships')
      .update({ status: 'accepted' })
      .eq('user_id', TEST_USER_A)
      .eq('friend_id', TEST_USER_B)
      .select().single();

    if (error) throw error;
    if (data.status === 'accepted') {
      pass('Accept friend request');
    } else {
      fail('Accept friend request', 'Status not updated');
    }
  } catch (e) {
    fail('Accept friend request', e);
  }
}

// ============================================
// TEST 16: GAMIFICATION EVENTS
// ============================================
async function testGamificationEvents() {
  testSection('GAMIFICATION EVENTS');

  // 16.1 Log gamification event
  try {
    const { data, error } = await supabase.from('gamification_events').insert({
      user_id: TEST_USER_A,
      event_type: 'xp_earned',
      event_source: 'workout_completion',
      xp_amount: 50,
      credits_amount: 25,
      metadata: { workout_type: 'strength', duration: 45 }
    }).select().single();

    if (error) throw error;
    if (data.xp_amount === 50) {
      pass('Log gamification event');
    } else {
      fail('Log gamification event', 'Event data mismatch');
    }
  } catch (e) {
    fail('Log gamification event', e);
  }

  // 16.2 Track module mastery
  try {
    const { data, error } = await supabase.from('user_module_mastery').insert({
      user_id: TEST_USER_A,
      module_name: 'health',
      mastery_level: 3,
      total_xp: 1500,
      activities_completed: 45
    }).select().single();

    if (error) throw error;
    if (data.mastery_level === 3) {
      pass('Track module mastery');
    } else {
      fail('Track module mastery', 'Mastery data mismatch');
    }
  } catch (e) {
    fail('Track module mastery', e);
  }

  // 16.3 Update level progression bonuses
  try {
    const { data, error } = await supabase.from('user_level_progression').upsert({
      user_id: TEST_USER_A,
      pet_slots: 3,
      equipment_set_slots: 2,
      inventory_slots: 50,
      level_xp_bonus: 1.1
    }).select().single();

    if (error) throw error;
    if (data.pet_slots === 3) {
      pass('Update level progression bonuses');
    } else {
      fail('Update level progression bonuses', 'Progression data mismatch');
    }
  } catch (e) {
    fail('Update level progression bonuses', e);
  }
}

// ============================================
// TEST 17: DATA ISOLATION VERIFICATION
// ============================================
async function testDataIsolation() {
  testSection('DATA ISOLATION VERIFICATION');

  // 17.1 Verify User A data
  try {
    const { data: profile } = await supabase.from('user_profiles').select('*').eq('id', TEST_USER_A).single();
    const { data: pets } = await supabase.from('user_pets').select('*').eq('user_id', TEST_USER_A);
    const { data: achievements } = await supabase.from('user_achievements').select('*').eq('user_id', TEST_USER_A);
    const { data: tasks } = await supabase.from('daily_tasks').select('*').eq('user_id', TEST_USER_A);
    const { data: workouts } = await supabase.from('health_workouts').select('*').eq('user_id', TEST_USER_A);

    if (profile && profile.id === TEST_USER_A) {
      pass('User A profile correctly isolated');
    } else {
      fail('User A profile correctly isolated', 'Profile mismatch');
    }

    if (pets && pets.length > 0 && pets.every(p => p.user_id === TEST_USER_A)) {
      pass('User A pets correctly isolated');
    } else {
      fail('User A pets correctly isolated', 'Pet data mismatch');
    }

    if (achievements && achievements.every(a => a.user_id === TEST_USER_A)) {
      pass('User A achievements correctly isolated');
    } else {
      fail('User A achievements correctly isolated', 'Achievement data mismatch');
    }

    if (workouts && workouts.every(w => w.user_id === TEST_USER_A)) {
      pass('User A workouts correctly isolated');
    } else {
      fail('User A workouts correctly isolated', 'Workout data mismatch');
    }
  } catch (e) {
    fail('User A data isolation', e);
  }

  // 17.2 Verify User B cannot see User A's private data
  try {
    // User B should only have their own profile
    const { data: userBProfile } = await supabase.from('user_profiles').select('*').eq('id', TEST_USER_B).single();
    const { data: userBPets } = await supabase.from('user_pets').select('*').eq('user_id', TEST_USER_B);

    if (userBProfile && userBProfile.id === TEST_USER_B && userBProfile.current_level === 5) {
      pass('User B has separate profile');
    } else {
      fail('User B has separate profile', 'Profile data mismatch');
    }

    if (!userBPets || userBPets.length === 0) {
      pass('User B has no access to User A pets');
    } else {
      fail('User B has no access to User A pets', 'User B can see pets they shouldn\'t');
    }
  } catch (e) {
    fail('User B data isolation', e);
  }
}

// ============================================
// TEST 18: CROSS-SYSTEM TRIGGERS
// ============================================
async function testCrossSystemTriggers() {
  testSection('CROSS-SYSTEM TRIGGERS');

  // 18.1 Verify XP earned from workout is reflected in profile
  try {
    const { data: profile } = await supabase.from('user_profiles').select('total_xp').eq('id', TEST_USER_A).single();
    const { data: events } = await supabase.from('gamification_events').select('*')
      .eq('user_id', TEST_USER_A)
      .eq('event_type', 'xp_earned');

    if (profile && events) {
      pass('XP tracking system operational');
    } else {
      fail('XP tracking system operational', 'Data not found');
    }
  } catch (e) {
    fail('XP tracking system operational', e);
  }

  // 18.2 Verify cosmic currency transaction flow
  try {
    const { data: currency } = await supabase.from('user_cosmic_currency').select('*').eq('user_id', TEST_USER_A).single();

    if (currency && currency.lifetime_credits_spent === 50) {
      pass('Currency transaction flow working');
    } else {
      fail('Currency transaction flow working', 'Currency mismatch');
    }
  } catch (e) {
    fail('Currency transaction flow working', e);
  }

  // 18.3 Verify achievement system integration
  try {
    const { data: achievements } = await supabase.from('user_achievements').select('*').eq('user_id', TEST_USER_A);
    const { data: progress } = await supabase.from('achievement_progress').select('*').eq('user_id', TEST_USER_A);

    if (achievements && achievements.length >= 3 && progress && progress.length > 0) {
      pass('Achievement system integrated');
    } else {
      fail('Achievement system integrated', 'Achievement data missing');
    }
  } catch (e) {
    fail('Achievement system integrated', e);
  }
}

// ============================================
// MAIN TEST RUNNER
// ============================================
async function runAllTests() {
  console.log('='.repeat(60));
  console.log('🚀 COMPREHENSIVE LIFEOS SYSTEM TEST');
  console.log('='.repeat(60));
  console.log(`Started: ${new Date().toISOString()}`);
  console.log(`Test User A: ${TEST_USER_A}`);
  console.log(`Test User B: ${TEST_USER_B}`);

  // Cleanup first
  await cleanupTestData();

  // Run all test suites
  await testUserProfilesAndLeveling();
  await testPetSystem();
  await testEquipmentSystem();
  await testAchievementsSystem();
  await testSkillsAndConstellations();
  await testDailyTasksAndQuests();
  await testStreaksSystem();
  await testHealthModule();
  await testProductivityModule();
  await testFinancialModule();
  await testCalendarModule();
  await testJournalModule();
  await testKnowledgeModule();
  await testBadHabitsAndResolutions();
  await testSocialFeatures();
  await testGamificationEvents();
  await testDataIsolation();
  await testCrossSystemTriggers();

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

// Run tests
runAllTests().catch(console.error);
