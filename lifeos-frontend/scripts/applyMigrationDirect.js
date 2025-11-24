import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supabase configuration
const SUPABASE_URL = 'https://pynijtaxxcrdheyzoawv.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5bmlqdGF4eGNyZGhleXpvYXd2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzM2NjEyNywiZXhwIjoyMDc4OTQyMTI3fQ.fbeDGjs2WXYQX-92pUDJPpsvXUgll5faY71yJWX0lKA';

// Use postgres client for direct SQL execution
const { Client } = await import('pg');

// Extract connection details from Supabase URL
const connectionString = `postgresql://postgres.pynijtaxxcrdheyzoawv:${process.env.SUPABASE_DB_PASSWORD || 'LetMeCheckThePassword'}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`;

async function executeSQL(client, sql) {
  try {
    await client.query(sql);
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
}

async function applyMigration(client, migrationFile) {
  console.log(`\n📦 Applying migration: ${path.basename(migrationFile)}`);

  try {
    // Read migration file
    const migrationSQL = fs.readFileSync(migrationFile, 'utf8');

    console.log(`📄 Migration size: ${migrationSQL.length} characters`);
    console.log(`⏳ Executing migration...`);

    // Split by statement delimiter and execute
    const { success, error } = await executeSQL(client, migrationSQL);

    if (!success) {
      throw error;
    }

    console.log('✅ Migration applied successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  }
}

async function main() {
  console.log('🚀 Direct PostgreSQL Migration\n');
  console.log('❗ This requires the pg package. Installing if needed...\n');

  // Check if pg is installed
  try {
    const require = createRequire(import.meta.url);
    require.resolve('pg');
  } catch {
    console.log('📦 Installing pg package...');
    const { exec } = await import('child_process');
    await new Promise((resolve, reject) => {
      exec('npm install pg', (error, stdout, stderr) => {
        if (error) reject(error);
        else resolve();
      });
    });
  }

  console.log('\n💡 For direct SQL execution, use Supabase Dashboard SQL Editor:');
  console.log(`   https://supabase.com/dashboard/project/pynijtaxxcrdheyzoawv/sql\n`);

  console.log('📋 Migration files ready to paste:\n');

  const migrationFiles = [
    {
      name: '001_gamification_schema.sql',
      path: path.join(__dirname, '../src/db/migrations/001_gamification_schema.sql')
    },
    {
      name: '002_unified_gamification.sql',
      path: path.join(__dirname, '../src/db/migrations/002_unified_gamification.sql')
    }
  ];

  for (const { name, path: filePath } of migrationFiles) {
    if (fs.existsSync(filePath)) {
      const size = fs.statSync(filePath).size;
      console.log(`   ✓ ${name} (${Math.round(size / 1024)}KB)`);
    } else {
      console.log(`   ✗ ${name} (not found)`);
    }
  }

  console.log('\n📝 Instructions:');
  console.log('   1. Open Supabase Dashboard SQL Editor');
  console.log('   2. Copy contents of 001_gamification_schema.sql');
  console.log('   3. Run it in SQL Editor');
  console.log('   4. Copy contents of 002_unified_gamification.sql');
  console.log('   5. Run it in SQL Editor');
  console.log('\n   OR run: cat src/db/migrations/*.sql | pbcopy (Mac) to copy all\n');

  // Output the actual SQL for easy copying
  console.log('═'.repeat(80));
  console.log('MIGRATION 002 (UNIFIED GAMIFICATION) - COPY THIS TO SQL EDITOR:');
  console.log('═'.repeat(80));

  const migration002 = fs.readFileSync(
    path.join(__dirname, '../src/db/migrations/002_unified_gamification.sql'),
    'utf8'
  );
  console.log(migration002);
  console.log('\n═'.repeat(80));
}

main().catch(console.error);
