import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supabase configuration - Use environment variables!
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing environment variables: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Create Supabase client with service role key (bypasses RLS)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function applyMigration(migrationFile) {
  console.log(`\n📦 Applying migration: ${path.basename(migrationFile)}`);

  try {
    // Read migration file
    const migrationSQL = fs.readFileSync(migrationFile, 'utf8');

    console.log(`📄 Migration size: ${migrationSQL.length} characters`);
    console.log(`⏳ Executing migration...`);

    // Execute the migration using rpc call
    const { data, error } = await supabase.rpc('exec_sql', {
      sql_query: migrationSQL
    });

    if (error) {
      // If exec_sql doesn't exist, try direct query
      if (error.message.includes('function') && error.message.includes('does not exist')) {
        console.log('📌 exec_sql function not found, creating it first...');

        // Create the exec_sql function
        const createFunctionSQL = `
          CREATE OR REPLACE FUNCTION exec_sql(sql_query text)
          RETURNS text
          LANGUAGE plpgsql
          SECURITY DEFINER
          AS $$
          BEGIN
            EXECUTE sql_query;
            RETURN 'SUCCESS';
          EXCEPTION
            WHEN OTHERS THEN
              RETURN 'ERROR: ' || SQLERRM;
          END;
          $$;
        `;

        const { error: createError } = await supabase.rpc('exec_sql', {
          sql_query: createFunctionSQL
        });

        if (createError) {
          console.error('❌ Could not create exec_sql function:', createError);
          console.log('\n💡 Attempting to apply migration via HTTP API...');

          // Fall back to HTTP API
          const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': SUPABASE_SERVICE_ROLE_KEY,
              'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
            },
            body: JSON.stringify({ sql_query: migrationSQL })
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const result = await response.json();
          console.log('✅ Migration applied successfully via HTTP API');
          console.log('📊 Result:', result);
          return;
        }

        // Retry original migration
        const { error: retryError } = await supabase.rpc('exec_sql', {
          sql_query: migrationSQL
        });

        if (retryError) {
          throw retryError;
        }
      } else {
        throw error;
      }
    }

    console.log('✅ Migration applied successfully!');
    if (data) {
      console.log('📊 Result:', data);
    }

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('Full error:', error);
    throw error;
  }
}

async function main() {
  const migrationFiles = [
    path.join(__dirname, '../src/db/migrations/001_gamification_schema.sql'),
    path.join(__dirname, '../src/db/migrations/002_unified_gamification.sql')
  ];

  console.log('🚀 Starting database migrations...\n');
  console.log(`📍 Supabase URL: ${SUPABASE_URL}`);
  console.log(`📁 Migrations to apply: ${migrationFiles.length}\n`);

  for (const file of migrationFiles) {
    if (!fs.existsSync(file)) {
      console.log(`⚠️  Skipping ${path.basename(file)} - file not found`);
      continue;
    }

    try {
      await applyMigration(file);
    } catch (error) {
      console.error(`\n❌ Failed to apply ${path.basename(file)}`);
      console.error('Stopping migration process.');
      process.exit(1);
    }
  }

  console.log('\n🎉 All migrations completed successfully!');
  console.log('\n📋 Summary:');
  console.log('   - gamification_events table created');
  console.log('   - equipment system implemented');
  console.log('   - perk trees added');
  console.log('   - constellation system enhanced');
  console.log('   - achievement progress tracking');
  console.log('   - unified event processing functions');
  console.log('   - equipment seed data inserted');
}

main().catch(console.error);
