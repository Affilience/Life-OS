#!/usr/bin/env node
/**
 * Quick database setup
 * Run: node src/db/setup.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load from .env.local
const envPath = join(__dirname, '../../.env.local');
const envContent = readFileSync(envPath, 'utf-8');
const env = Object.fromEntries(
  envContent.split('\n')
    .filter(line => line && !line.startsWith('#'))
    .map(line => line.split('='))
    .map(([key, value]) => [key.trim(), value.trim()])
);

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseKey = env.VITE_SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🚀 Setting up Cosmic Gamification database...\n');

// Read SQL file
const sqlPath = join(__dirname, 'migrations/001_gamification_schema.sql');
const sql = readFileSync(sqlPath, 'utf-8');

console.log('📄 Executing schema from:', sqlPath);
console.log('\n⚠️  Please copy the SQL from migrations/001_gamification_schema.sql');
console.log('    and run it in your Supabase SQL Editor at:');
console.log(`    ${supabaseUrl.replace('.supabase.co', '.supabase.co/project/_/sql')}\n`);
console.log('The schema is ready in: src/db/migrations/001_gamification_schema.sql');
