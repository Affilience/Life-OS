import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const envFile = readFileSync('.env.local', 'utf-8');
const env = Object.fromEntries(
  envFile.split('\n')
    .filter(line => line && !line.startsWith('#'))
    .map(line => {
      const [key, ...valueParts] = line.split('=');
      return [key.trim(), valueParts.join('=').trim()];
    })
);

const supabase = createClient(
  env.VITE_SUPABASE_URL,
  env.VITE_SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

const sql = readFileSync('./src/db/migrations/001_gamification_schema.sql', 'utf-8');

console.log('🚀 Executing schema...\n');

// Split by semicolons and execute each statement
const statements = sql
  .split(';')
  .map(s => s.trim())
  .filter(s => s.length > 0 && !s.startsWith('--'));

for (const statement of statements) {
  if (statement) {
    const { error } = await supabase.rpc('exec', { sql: statement + ';' });
    if (error) console.log('Statement:', statement.substring(0, 50) + '...', error);
  }
}

console.log('✅ Schema execution complete!');
