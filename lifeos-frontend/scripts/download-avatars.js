/**
 * Script to download PixelLab generated avatars
 * Run with: node scripts/download-avatars.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Character IDs from PixelLab (in order from stage 1-40)
// NOTE: Stages 1-20 were deleted (old/stuck generations)
// Stages 21-25 are completed and downloaded
// Stages 26-40 are pending (awaiting trial limit reset or account upgrade)
const CHARACTER_IDS = {
  // Stages 1-20: DELETED - need to be regenerated
  // 1: 'PENDING',  // Stage 1 - Ordinary Human
  // 2: 'PENDING',  // Stage 2 - Trainee
  // ... (continue for stages 3-20)

  // Stages 21-25: COMPLETED & DOWNLOADED
  21: '385c3ff7-cefe-40c2-9ab2-2b86b909e29e', // Stage 21 - Quantum Entity ✅
  22: 'aa06cb80-3456-4cee-a78d-86881e11da4f', // Stage 22 - Holographic Avatar ✅
  23: '284acc5a-e0bf-4884-bb3a-ede1d9f30acb', // Stage 23 - Data Ghost ✅
  24: 'fa44ec26-d58d-4e5b-9386-bf137c440d3f', // Stage 24 - Void Walker ✅
  25: '6d86ebd3-356b-4bef-b6d2-02c003071ae4', // Stage 25 - Astral Projection ✅

  // Stages 26-40: PENDING (hit trial limit)
  26: '4740b4ca-f892-4040-b663-a1fcebff6e0e', // Stage 26 - Ethereal Sage (pending)
  27: '392264c7-5fad-4b6d-a365-42af23e1a63c', // Stage 27 - Digital God (pending)
  28: '1d01404c-ed9b-4f7e-ba84-4dffc2b81668', // Stage 28 - Nebula Born (pending)
  29: 'fb97b140-65bf-421f-a0cf-cd61aa67efd8', // Stage 29 - Star Forge (pending)
  30: '32596153-9e49-4e69-a840-7f3ac71e0174', // Stage 30 - Gravity Weaver (pending)
  31: '02197c42-3cb3-40a4-8e62-f11dfba782b0', // Stage 31 - Supernova Herald (pending)
  32: 'f87a548a-a72c-4a9d-99d5-6498b852cb0c', // Stage 32 - Black Hole Sovereign (pending)
  33: 'eef67676-03fa-46e4-96d7-4d09bac31b58', // Stage 33 - Galaxy Architect (pending)
  34: 'af81cdb2-b098-4d86-b4f6-0d99a2cd0406', // Stage 34 - Cosmic Weaver (pending)
  35: 'e613bd6e-77b0-40ce-a9e1-e0fbff155482', // Stage 35 - Universe Shepherd (pending)
  36: '0e4d246d-d233-4778-8c90-11d96dbf7918', // Stage 36 - Reality Bender (pending)
  37: 'bb172656-271a-4162-8f36-01a5b9722a89', // Stage 37 - Dimension Lord (pending)
  38: 'ffd70ef3-a177-42e7-b91d-0fdf9e8d1ac8', // Stage 38 - Time Eternal (pending)
  39: 'b2f2a918-5863-4845-86c6-20d3dd9fc63f', // Stage 39 - Omniversal Consciousness (pending)
  40: 'ce07f162-0c0b-45a1-9022-5c639c2afb70', // Stage 40 - The Infinite (pending)
};

const ASSETS_DIR = path.join(__dirname, '..', 'public', 'assets', 'avatar');

async function downloadAvatar(stage, characterId) {
  const stageDir = path.join(ASSETS_DIR, `stage-${stage}`);

  // Create directory if it doesn't exist
  if (!fs.existsSync(stageDir)) {
    fs.mkdirSync(stageDir, { recursive: true });
  }

  const directions = ['south', 'west', 'east', 'north'];

  console.log(`Downloading Stage ${stage}...`);

  // Add timestamp to bypass cache
  const timestamp = Date.now();

  for (const direction of directions) {
    const url = `https://backblaze.pixellab.ai/file/pixellab-characters/e823ea4f-74d5-45b8-a0fc-3e48ba202181/${characterId}/rotations/${direction}.png?t=${timestamp}`;
    const filepath = path.join(stageDir, `${direction}.png`);

    try {
      const response = await fetch(url);
      if (!response.ok) {
        console.error(`  ✗ ${direction}: HTTP ${response.status}`);
        continue;
      }

      const buffer = await response.arrayBuffer();
      fs.writeFileSync(filepath, Buffer.from(buffer));
      console.log(`  ✓ ${direction}.png`);
    } catch (error) {
      console.error(`  ✗ ${direction}: ${error.message}`);
    }
  }
}

async function main() {
  console.log('Downloading PixelLab avatars...\n');

  // Download all stages
  for (const [stage, characterId] of Object.entries(CHARACTER_IDS)) {
    await downloadAvatar(parseInt(stage), characterId);
  }

  console.log('\n✅ Download complete!');
}

main().catch(console.error);
