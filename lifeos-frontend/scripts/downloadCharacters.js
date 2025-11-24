import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const jobsFile = path.join(__dirname, '../character_generation_jobs.json');
const jobs = JSON.parse(fs.readFileSync(jobsFile, 'utf8'));

console.log('🚀 DOWNLOADING GENERATED CHARACTERS');
console.log('========================================\n');

let completed = 0;
let pending = 0;
let failed = 0;

for (const char of jobs.characters) {
  console.log(`\n📥 Stage ${char.stage}: ${char.name}`);
  console.log(`   Character ID: ${char.characterId}`);

  try {
    // Check status first
    const statusResponse = await fetch(
      `https://api.pixellab.ai/mcp/characters/${char.characterId}`,
      {
        headers: {
          'Authorization': 'Bearer a611b2e1-f82b-41b4-b50a-4babde321f7d'
        }
      }
    );

    const status = await statusResponse.json();

    if (status.status === 'completed') {
      console.log(`   ✅ Ready! Downloading...`);

      // Download ZIP
      const zipResponse = await fetch(
        `https://api.pixellab.ai/mcp/characters/${char.characterId}/download`,
        {
          headers: {
            'Authorization': 'Bearer a611b2e1-f82b-41b4-b50a-4babde321f7d'
          }
        }
      );

      if (zipResponse.ok && zipResponse.status !== 423) {
        const buffer = Buffer.from(await zipResponse.arrayBuffer());

        // Save ZIP
        const outputDir = path.join(__dirname, '../public/assets/avatar/downloads');
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }

        const zipPath = path.join(outputDir, `stage_${char.stage.toString().padStart(2, '0')}.zip`);
        fs.writeFileSync(zipPath, buffer);

        console.log(`   💾 Saved: ${zipPath}`);
        completed++;
      } else {
        console.log(`   ⏳ Still processing (423)`);
        pending++;
      }
    } else if (status.status === 'pending' || status.status === 'processing') {
      console.log(`   ⏳ Status: ${status.status}`);
      pending++;
    } else if (status.status === 'failed') {
      console.log(`   ❌ Failed: ${status.error || 'Unknown error'}`);
      failed++;
    }

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 200));

  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    failed++;
  }
}

console.log('\n========================================');
console.log('📊 DOWNLOAD SUMMARY');
console.log(`✅ Completed: ${completed}`);
console.log(`⏳ Pending: ${pending}`);
console.log(`❌ Failed: ${failed}`);
console.log(`📦 Total: ${jobs.characters.length}`);
console.log('========================================\n');

if (pending > 0) {
  console.log('⏰ Some characters are still generating.');
  console.log('   Run this script again in a few minutes!\n');
}

if (completed > 0) {
  console.log('🎉 Downloaded characters are in: public/assets/avatar/downloads/');
  console.log('   Unzip them to use in the app!\n');
}
