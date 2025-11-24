import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkEquipmentPaths() {
  // Fetch all equipment from database
  const { data: equipment, error } = await supabase
    .from('equipment_items')
    .select('id, name, slot, image_path')
    .order('slot', { ascending: true });

  if (error) {
    console.error('Error fetching equipment:', error);
    return;
  }

  console.log('\n🔍 Checking Equipment Image Paths...\n');

  const issues = [];

  for (const item of equipment) {
    if (!item.image_path) {
      issues.push({
        item: item.name,
        issue: 'No image_path in database',
        slot: item.slot
      });
      continue;
    }

    // Check if file exists
    const filePath = path.join(process.cwd(), 'public', item.image_path);

    if (!fs.existsSync(filePath)) {
      issues.push({
        item: item.name,
        issue: `File not found: ${item.image_path}`,
        slot: item.slot,
        path: item.image_path
      });
    }
  }

  if (issues.length === 0) {
    console.log('✅ All equipment paths are valid!');
  } else {
    console.log(`❌ Found ${issues.length} issues:\n`);
    issues.forEach(({ item, issue, slot, path }) => {
      console.log(`  [${slot}] ${item}`);
      console.log(`    Problem: ${issue}`);
      if (path) console.log(`    Path: ${path}`);
      console.log('');
    });
  }
}

checkEquipmentPaths();
