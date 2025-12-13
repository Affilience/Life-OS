/**
 * Data Migration Utility
 *
 * Migrates data from localStorage to Supabase.
 * Use this when:
 * - Moving from local-only to cloud-synced
 * - Recovering data after clearing Supabase
 * - Merging data from multiple devices
 */

import { supabase } from '../lib/supabase';
import { DEV_USER_ID } from '../lib/dev-auth';

// localStorage keys used by the app
const STORE_KEYS = {
  avatar: 'avatar-storage',
  health: 'lifeos-health',
  financial: 'financial-storage',
  calendar: 'calendar-storage',
  knowledge: 'knowledge-storage',
  skills: 'lifeos-skills',
  productivity: 'productivity-storage',
  workout: 'workout-storage',
  achievements: 'achievements-storage',
  quests: 'quests-storage',
  pets: 'pet-storage',
  gamification: 'gamification-storage',
  resolutions: 'resolution-storage',
};

/**
 * Export all localStorage data to a JSON object
 */
export function exportLocalStorageData() {
  const data = {};

  Object.entries(STORE_KEYS).forEach(([name, key]) => {
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        const parsed = JSON.parse(stored);
        data[name] = parsed.state || parsed;
      }
    } catch (error) {
      console.error(`Error reading ${name} from localStorage:`, error);
    }
  });

  return data;
}

/**
 * Download localStorage data as JSON file
 */
export function downloadLocalStorageBackup() {
  const data = exportLocalStorageData();
  const timestamp = new Date().toISOString().split('T')[0];
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `lifeos-backup-${timestamp}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  return data;
}

/**
 * Migrate Skills data to Supabase
 */
async function migrateSkills(skillsData) {
  if (!skillsData?.skills?.length) return { migrated: 0, errors: [] };

  const errors = [];
  let migrated = 0;

  for (const skill of skillsData.skills) {
    try {
      // Insert skill
      const { data: insertedSkill, error: skillError } = await supabase
        .from('skills')
        .upsert({
          id: skill.id,
          user_id: DEV_USER_ID,
          name: skill.name,
          description: skill.description,
          category: skill.category,
          xp: skill.xp || 0,
          total_practice_hours: skill.totalMinutes ? skill.totalMinutes / 60 : 0,
          icon: skill.icon,
          status: 'active',
        }, { onConflict: 'id' })
        .select()
        .single();

      if (skillError) throw skillError;

      // Insert practice sessions
      if (skill.sessions?.length) {
        for (const session of skill.sessions) {
          await supabase.from('skill_practice_logs').upsert({
            id: session.id,
            skill_id: insertedSkill.id,
            user_id: DEV_USER_ID,
            practice_date: session.date,
            duration_minutes: session.minutes,
            notes: session.notes,
          }, { onConflict: 'id' });
        }
      }

      migrated++;
    } catch (error) {
      errors.push({ type: 'skill', name: skill.name, error: error.message });
    }
  }

  return { migrated, errors };
}

/**
 * Migrate Productivity data (tasks, projects) to Supabase
 */
async function migrateProductivity(productivityData) {
  if (!productivityData) return { migrated: 0, errors: [] };

  const errors = [];
  let migrated = 0;

  // Migrate projects
  if (productivityData.projects?.length) {
    for (const project of productivityData.projects) {
      try {
        await supabase.from('productivity_projects').upsert({
          id: project.id,
          user_id: DEV_USER_ID,
          name: project.name,
          description: project.description,
          status: project.status || 'active',
          color: project.color,
        }, { onConflict: 'id' });
        migrated++;
      } catch (error) {
        errors.push({ type: 'project', name: project.name, error: error.message });
      }
    }
  }

  // Migrate tasks
  if (productivityData.tasks?.length) {
    for (const task of productivityData.tasks) {
      try {
        await supabase.from('productivity_tasks').upsert({
          id: task.id,
          user_id: DEV_USER_ID,
          project_id: task.projectId,
          title: task.title || task.name,
          description: task.description,
          status: task.completed ? 'completed' : (task.status || 'todo'),
          priority: task.priority || 3,
          due_date: task.dueDate,
          completed_at: task.completedAt,
        }, { onConflict: 'id' });
        migrated++;
      } catch (error) {
        errors.push({ type: 'task', name: task.title, error: error.message });
      }
    }
  }

  return { migrated, errors };
}

/**
 * Migrate Financial data to Supabase
 */
async function migrateFinancial(financialData) {
  if (!financialData) return { migrated: 0, errors: [] };

  const errors = [];
  let migrated = 0;

  // Migrate accounts
  if (financialData.accounts?.length) {
    for (const account of financialData.accounts) {
      try {
        await supabase.from('financial_accounts').upsert({
          id: account.id,
          user_id: DEV_USER_ID,
          account_name: account.name,
          account_type: account.type || 'checking',
          institution: account.institution,
          current_balance: account.balance || 0,
        }, { onConflict: 'id' });
        migrated++;
      } catch (error) {
        errors.push({ type: 'account', name: account.name, error: error.message });
      }
    }
  }

  // Migrate transactions
  if (financialData.transactions?.length) {
    for (const tx of financialData.transactions) {
      try {
        await supabase.from('financial_transactions').upsert({
          id: tx.id,
          user_id: DEV_USER_ID,
          account_id: tx.accountId,
          transaction_date: tx.date,
          amount: tx.amount,
          transaction_type: tx.type || 'expense',
          category: tx.category,
          merchant: tx.merchant,
          description: tx.description,
        }, { onConflict: 'id' });
        migrated++;
      } catch (error) {
        errors.push({ type: 'transaction', name: tx.description, error: error.message });
      }
    }
  }

  // Migrate goals
  if (financialData.savingsGoals?.length) {
    for (const goal of financialData.savingsGoals) {
      try {
        await supabase.from('financial_goals').upsert({
          id: goal.id,
          user_id: DEV_USER_ID,
          goal_name: goal.name,
          goal_type: 'savings',
          target_amount: goal.target || goal.targetAmount,
          current_amount: goal.current || goal.currentAmount || 0,
          deadline: goal.deadline,
          status: goal.status || 'active',
        }, { onConflict: 'id' });
        migrated++;
      } catch (error) {
        errors.push({ type: 'goal', name: goal.name, error: error.message });
      }
    }
  }

  return { migrated, errors };
}

/**
 * Migrate Health/Nutrition data to Supabase
 */
async function migrateHealth(healthData) {
  if (!healthData) return { migrated: 0, errors: [] };

  const errors = [];
  let migrated = 0;

  // Migrate meals
  if (healthData.meals?.length) {
    for (const meal of healthData.meals) {
      try {
        await supabase.from('health_nutrition_logs').upsert({
          id: meal.id,
          user_id: DEV_USER_ID,
          log_date: meal.timestamp?.split('T')[0] || new Date().toISOString().split('T')[0],
          meal_type: meal.type || 'meal',
          food_items: meal.items || [],
          calories: meal.totalCalories || 0,
          protein_g: meal.totalProtein || 0,
          carbs_g: meal.totalCarbs || 0,
          fat_g: meal.totalFat || 0,
        }, { onConflict: 'id' });
        migrated++;
      } catch (error) {
        errors.push({ type: 'meal', name: meal.id, error: error.message });
      }
    }
  }

  return { migrated, errors };
}

/**
 * Migrate Workout data to Supabase
 */
async function migrateWorkouts(workoutData) {
  if (!workoutData) return { migrated: 0, errors: [] };

  const errors = [];
  let migrated = 0;

  // Migrate workouts
  if (workoutData.workouts?.length) {
    for (const workout of workoutData.workouts) {
      try {
        // Insert workout
        const { data: insertedWorkout, error: workoutError } = await supabase
          .from('health_workouts')
          .upsert({
            id: workout.id,
            user_id: DEV_USER_ID,
            workout_date: workout.date,
            workout_type: workout.type || 'strength',
            duration_minutes: workout.duration,
            notes: workout.notes,
          }, { onConflict: 'id' })
          .select()
          .single();

        if (workoutError) throw workoutError;

        // Insert exercises
        if (workout.exercises?.length) {
          for (const exercise of workout.exercises) {
            await supabase.from('health_exercises').upsert({
              workout_id: insertedWorkout.id,
              exercise_name: exercise.name,
              sets: exercise.sets?.length || exercise.sets,
              reps: exercise.sets?.[0]?.reps || exercise.reps,
              weight_kg: exercise.sets?.[0]?.weight || exercise.weight,
              notes: exercise.notes,
            });
          }
        }

        migrated++;
      } catch (error) {
        errors.push({ type: 'workout', name: workout.id, error: error.message });
      }
    }
  }

  // Migrate cardio workouts
  if (workoutData.cardioWorkouts?.length) {
    for (const cardio of workoutData.cardioWorkouts) {
      try {
        await supabase.from('health_workouts').upsert({
          id: cardio.id,
          user_id: DEV_USER_ID,
          workout_date: cardio.date,
          workout_type: 'cardio',
          duration_minutes: cardio.duration,
          notes: cardio.notes,
          cardio_type: cardio.type,
          distance_km: cardio.distance,
          calories_burned: cardio.calories,
        }, { onConflict: 'id' });
        migrated++;
      } catch (error) {
        errors.push({ type: 'cardio', name: cardio.id, error: error.message });
      }
    }
  }

  return { migrated, errors };
}

/**
 * Migrate Calendar data to Supabase
 */
async function migrateCalendar(calendarData) {
  if (!calendarData) return { migrated: 0, errors: [] };

  const errors = [];
  let migrated = 0;

  // Migrate time blocks
  if (calendarData.timeBlocks?.length) {
    for (const block of calendarData.timeBlocks) {
      try {
        await supabase.from('calendar_time_blocks').upsert({
          id: block.id,
          user_id: DEV_USER_ID,
          title: block.title,
          block_date: block.date,
          start_time: block.startTime,
          end_time: block.endTime,
          planned_duration_minutes: block.plannedDuration,
          actual_duration_minutes: block.actualDuration,
          module_id: block.module,
          status: block.status || 'planned',
          notes: block.notes,
        }, { onConflict: 'id' });
        migrated++;
      } catch (error) {
        errors.push({ type: 'timeBlock', name: block.title, error: error.message });
      }
    }
  }

  // Migrate events
  if (calendarData.events?.length) {
    for (const event of calendarData.events) {
      try {
        await supabase.from('calendar_events').upsert({
          id: event.id,
          user_id: DEV_USER_ID,
          title: event.title,
          description: event.description,
          start_time: event.start,
          end_time: event.end,
          all_day: event.allDay || false,
          is_recurring: event.recurring || false,
          color: event.color,
        }, { onConflict: 'id' });
        migrated++;
      } catch (error) {
        errors.push({ type: 'event', name: event.title, error: error.message });
      }
    }
  }

  return { migrated, errors };
}

/**
 * Migrate Knowledge (notes, media) to Supabase
 */
async function migrateKnowledge(knowledgeData) {
  if (!knowledgeData) return { migrated: 0, errors: [] };

  const errors = [];
  let migrated = 0;

  // Migrate notes
  if (knowledgeData.notes?.length) {
    for (const note of knowledgeData.notes) {
      try {
        await supabase.from('knowledge_notes').upsert({
          id: note.id,
          user_id: DEV_USER_ID,
          title: note.title,
          content: note.content,
          tags: note.tags || [],
          folder_path: note.folder || '/',
          pinned: note.pinned || false,
          is_favorite: note.favorite || false,
        }, { onConflict: 'id' });
        migrated++;
      } catch (error) {
        errors.push({ type: 'note', name: note.title, error: error.message });
      }
    }
  }

  // Migrate books/media
  if (knowledgeData.books?.length) {
    for (const book of knowledgeData.books) {
      try {
        await supabase.from('knowledge_media').upsert({
          id: book.id,
          user_id: DEV_USER_ID,
          media_type: 'book',
          title: book.title,
          author: book.author,
          status: book.status || 'want',
          progress_percentage: book.progress || 0,
          rating: book.rating,
          notes: book.notes,
        }, { onConflict: 'id' });
        migrated++;
      } catch (error) {
        errors.push({ type: 'book', name: book.title, error: error.message });
      }
    }
  }

  // Migrate other media
  if (knowledgeData.media?.length) {
    for (const media of knowledgeData.media) {
      try {
        await supabase.from('knowledge_media').upsert({
          id: media.id,
          user_id: DEV_USER_ID,
          media_type: media.type || 'video',
          title: media.title,
          url: media.url,
          status: media.status || 'want',
          progress_percentage: media.progress || 0,
          notes: media.notes,
        }, { onConflict: 'id' });
        migrated++;
      } catch (error) {
        errors.push({ type: 'media', name: media.title, error: error.message });
      }
    }
  }

  return { migrated, errors };
}

/**
 * Migrate Resolutions to Supabase
 */
async function migrateResolutions(resolutionData) {
  if (!resolutionData?.resolutions?.length) return { migrated: 0, errors: [] };

  const errors = [];
  let migrated = 0;

  for (const resolution of resolutionData.resolutions) {
    try {
      await supabase.from('resolutions').upsert({
        id: resolution.id,
        user_id: DEV_USER_ID,
        title: resolution.title,
        description: resolution.description,
        category: resolution.category,
        year: resolution.year || new Date().getFullYear(),
        status: resolution.status || 'active',
        current_streak: resolution.currentStreak || 0,
        longest_streak: resolution.longestStreak || 0,
        total_check_ins: resolution.totalCheckIns || 0,
        milestones: resolution.milestones || [],
      }, { onConflict: 'id' });
      migrated++;
    } catch (error) {
      errors.push({ type: 'resolution', name: resolution.title, error: error.message });
    }
  }

  return { migrated, errors };
}

/**
 * Run full migration from localStorage to Supabase
 */
export async function migrateAllDataToSupabase(options = {}) {
  const { onProgress, modules = 'all' } = options;

  console.log('🚀 Starting data migration to Supabase...');

  const results = {
    skills: { migrated: 0, errors: [] },
    productivity: { migrated: 0, errors: [] },
    financial: { migrated: 0, errors: [] },
    health: { migrated: 0, errors: [] },
    workouts: { migrated: 0, errors: [] },
    calendar: { migrated: 0, errors: [] },
    knowledge: { migrated: 0, errors: [] },
    resolutions: { migrated: 0, errors: [] },
  };

  const localData = exportLocalStorageData();

  // Skills
  if (modules === 'all' || modules.includes('skills')) {
    onProgress?.('Migrating skills...');
    results.skills = await migrateSkills(localData.skills);
    console.log(`✅ Skills: ${results.skills.migrated} migrated`);
  }

  // Productivity
  if (modules === 'all' || modules.includes('productivity')) {
    onProgress?.('Migrating productivity...');
    results.productivity = await migrateProductivity(localData.productivity);
    console.log(`✅ Productivity: ${results.productivity.migrated} migrated`);
  }

  // Financial
  if (modules === 'all' || modules.includes('financial')) {
    onProgress?.('Migrating financial...');
    results.financial = await migrateFinancial(localData.financial);
    console.log(`✅ Financial: ${results.financial.migrated} migrated`);
  }

  // Health
  if (modules === 'all' || modules.includes('health')) {
    onProgress?.('Migrating health...');
    results.health = await migrateHealth(localData.health);
    console.log(`✅ Health: ${results.health.migrated} migrated`);
  }

  // Workouts
  if (modules === 'all' || modules.includes('workouts')) {
    onProgress?.('Migrating workouts...');
    results.workouts = await migrateWorkouts(localData.workout);
    console.log(`✅ Workouts: ${results.workouts.migrated} migrated`);
  }

  // Calendar
  if (modules === 'all' || modules.includes('calendar')) {
    onProgress?.('Migrating calendar...');
    results.calendar = await migrateCalendar(localData.calendar);
    console.log(`✅ Calendar: ${results.calendar.migrated} migrated`);
  }

  // Knowledge
  if (modules === 'all' || modules.includes('knowledge')) {
    onProgress?.('Migrating knowledge...');
    results.knowledge = await migrateKnowledge(localData.knowledge);
    console.log(`✅ Knowledge: ${results.knowledge.migrated} migrated`);
  }

  // Resolutions
  if (modules === 'all' || modules.includes('resolutions')) {
    onProgress?.('Migrating resolutions...');
    results.resolutions = await migrateResolutions(localData.resolutions);
    console.log(`✅ Resolutions: ${results.resolutions.migrated} migrated`);
  }

  // Calculate totals
  const totalMigrated = Object.values(results).reduce((sum, r) => sum + r.migrated, 0);
  const totalErrors = Object.values(results).reduce((sum, r) => sum + r.errors.length, 0);

  console.log(`\n🎉 Migration complete!`);
  console.log(`   Total items migrated: ${totalMigrated}`);
  console.log(`   Total errors: ${totalErrors}`);

  if (totalErrors > 0) {
    console.log('\n⚠️ Errors encountered:');
    Object.entries(results).forEach(([module, result]) => {
      if (result.errors.length > 0) {
        console.log(`\n  ${module}:`);
        result.errors.forEach(err => {
          console.log(`    - ${err.type} "${err.name}": ${err.error}`);
        });
      }
    });
  }

  return {
    success: totalErrors === 0,
    totalMigrated,
    totalErrors,
    results,
  };
}

/**
 * Clear all localStorage data (use with caution!)
 */
export function clearLocalStorage() {
  Object.values(STORE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
  console.log('🗑️ localStorage cleared');
}

/**
 * Get migration status - compare localStorage vs Supabase counts
 */
export async function getMigrationStatus() {
  const localData = exportLocalStorageData();

  const status = {
    localStorage: {},
    supabase: {},
  };

  // Count localStorage items
  status.localStorage = {
    skills: localData.skills?.skills?.length || 0,
    tasks: localData.productivity?.tasks?.length || 0,
    projects: localData.productivity?.projects?.length || 0,
    transactions: localData.financial?.transactions?.length || 0,
    goals: localData.financial?.savingsGoals?.length || 0,
    meals: localData.health?.meals?.length || 0,
    workouts: (localData.workout?.workouts?.length || 0) + (localData.workout?.cardioWorkouts?.length || 0),
    timeBlocks: localData.calendar?.timeBlocks?.length || 0,
    notes: localData.knowledge?.notes?.length || 0,
    resolutions: localData.resolutions?.resolutions?.length || 0,
  };

  // Count Supabase items
  const [
    skillsCount,
    tasksCount,
    projectsCount,
    transactionsCount,
    goalsCount,
    mealsCount,
    workoutsCount,
    timeBlocksCount,
    notesCount,
    resolutionsCount,
  ] = await Promise.all([
    supabase.from('skills').select('id', { count: 'exact', head: true }).eq('user_id', DEV_USER_ID),
    supabase.from('productivity_tasks').select('id', { count: 'exact', head: true }).eq('user_id', DEV_USER_ID),
    supabase.from('productivity_projects').select('id', { count: 'exact', head: true }).eq('user_id', DEV_USER_ID),
    supabase.from('financial_transactions').select('id', { count: 'exact', head: true }).eq('user_id', DEV_USER_ID),
    supabase.from('financial_goals').select('id', { count: 'exact', head: true }).eq('user_id', DEV_USER_ID),
    supabase.from('health_nutrition_logs').select('id', { count: 'exact', head: true }).eq('user_id', DEV_USER_ID),
    supabase.from('health_workouts').select('id', { count: 'exact', head: true }).eq('user_id', DEV_USER_ID),
    supabase.from('calendar_time_blocks').select('id', { count: 'exact', head: true }).eq('user_id', DEV_USER_ID),
    supabase.from('knowledge_notes').select('id', { count: 'exact', head: true }).eq('user_id', DEV_USER_ID),
    supabase.from('resolutions').select('id', { count: 'exact', head: true }).eq('user_id', DEV_USER_ID),
  ]);

  status.supabase = {
    skills: skillsCount.count || 0,
    tasks: tasksCount.count || 0,
    projects: projectsCount.count || 0,
    transactions: transactionsCount.count || 0,
    goals: goalsCount.count || 0,
    meals: mealsCount.count || 0,
    workouts: workoutsCount.count || 0,
    timeBlocks: timeBlocksCount.count || 0,
    notes: notesCount.count || 0,
    resolutions: resolutionsCount.count || 0,
  };

  return status;
}

export default {
  exportLocalStorageData,
  downloadLocalStorageBackup,
  migrateAllDataToSupabase,
  getMigrationStatus,
  clearLocalStorage,
};
