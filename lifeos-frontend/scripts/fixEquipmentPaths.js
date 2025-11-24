import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read environment variables from .env.local
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    envVars[match[1].trim()] = match[2].trim();
  }
});

const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseKey = envVars.VITE_SUPABASE_SERVICE_ROLE_KEY || envVars.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

console.log('Using Supabase URL:', supabaseUrl);
console.log('Using service role key for write access\n');

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixEquipmentPaths() {
  console.log('\n🔧 Fixing Equipment Image Paths...\n');

  // First check for any items with bad paths
  console.log('🔍 Searching for all items with incorrect paths...\n');

  const { data: badItems } = await supabase
    .from('equipment_items')
    .select('id, name, slot, image_path')
    .or('image_path.like.%/helmet/%,image_path.like.%/chest/%,image_path.like.%training-sword%,image_path.like.%iron-sword%,image_path.like.%dragon-blade%,image_path.like.%/shields/wooden.png%,image_path.like.%/helmets/training.png%')
    .order('slot', { ascending: true });

  if (badItems && badItems.length > 0) {
    console.log(`Found ${badItems.length} items with bad paths:\n`);
    badItems.forEach(item => {
      console.log(`  [${item.slot}] ${item.name}: ${item.image_path}`);
    });
    console.log('');
  }

  const updates = [
    { id: '04046934-61d8-4a76-91ce-bf0e41c51215', name: 'Training Vest', path: '/assets/equipment/chests/leather_vest.png' },
    { id: 'ca550af9-fda4-4de2-9ba6-de93d20ca6e0', name: 'Iron Chestplate', path: '/assets/equipment/chests/chainmail_shirt.png' },
    { id: 'ae0b89f5-6643-4b65-8e07-a91fd0f7890a', name: 'Dragon Scale Armor', path: '/assets/equipment/chests/dragon_cuirass.png' },
    { id: '3594bdff-18e4-4d45-b6f2-efe400b312e2', name: 'Wooden Shield', path: '/assets/equipment/shields/wooden_buckler.png' },
    { id: 'b0eb684c-b3b6-47c0-95c4-414c0c85cf01', name: 'Training Sword', path: '/assets/equipment/weapons/training_sword.png' },
    { id: '8bbffea5-e54f-422a-bb02-83dfb0cbafd1', name: 'Iron Sword', path: '/assets/equipment/weapons/iron_sword.png' },
    { id: 'ce16e877-472e-4951-b099-3c8ea02832ce', name: 'Dragon Blade', path: '/assets/equipment/weapons/dragon_blade.png' },
  ];

  // Add any additional bad items found
  if (badItems) {
    badItems.forEach(item => {
      // Check if not already in updates list
      if (!updates.find(u => u.id === item.id)) {
        // Try to infer correct path
        const slug = item.name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
        const slotFolder = item.slot === 'chest' ? 'chests' : `${item.slot}s`;
        const correctPath = `/assets/equipment/${slotFolder}/${slug}.png`;

        updates.push({
          id: item.id,
          name: item.name,
          path: correctPath
        });
      }
    });
  }

  let successCount = 0;
  let errorCount = 0;

  for (const { id, name, path } of updates) {
    const { data, error } = await supabase
      .from('equipment_items')
      .update({ image_path: path })
      .eq('id', id)
      .select();

    if (error) {
      console.error(`❌ Failed to update ${name}:`, error.message);
      errorCount++;
    } else if (data && data.length > 0) {
      console.log(`✅ Updated ${name} → ${path}`);
      successCount++;
    } else {
      console.warn(`⚠️  Item not found: ${name} (ID: ${id})`);
    }
  }

  console.log(`\n📊 Summary: ${successCount} updated, ${errorCount} errors\n`);

  // Verify the updates - show items with wrong paths
  console.log('🔍 Finding items with incorrect paths...\n');
  const { data: allItems } = await supabase
    .from('equipment_items')
    .select('id, name, slot, image_path')
    .or('image_path.like.%/chest/%,image_path.like.%training-sword%,image_path.like.%iron-sword%,image_path.like.%dragon-blade%,image_path.like.%/shields/wooden.png%')
    .order('slot', { ascending: true });

  if (allItems && allItems.length > 0) {
    console.log(`Found ${allItems.length} items with incorrect paths:\n`);
    allItems.forEach(item => {
      console.log(`  ID: ${item.id}`);
      console.log(`  [${item.slot}] ${item.name}`);
      console.log(`  Path: ${item.image_path}\n`);
    });
  } else {
    console.log('✅ No items with incorrect paths found!\n');
  }
}

fixEquipmentPaths().catch(console.error);
