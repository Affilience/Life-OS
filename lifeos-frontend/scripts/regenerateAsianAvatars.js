import fs from 'fs';

const PIXELLAB_API_KEY = process.env.PIXELLAB_API_KEY || 'a611b2e1-f82b-41b4-b50a-4babde321f7d';

async function gen(filename, prompt) {
  console.log('Generating:', filename);
  const response = await fetch('https://api.pixellab.ai/v1/generate-image-pixflux', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + PIXELLAB_API_KEY,
    },
    body: JSON.stringify({
      description: prompt,
      negative_description: 'sword, weapon, side view, profile, 3/4 view, skinny, thin, slim, lanky, scrawny, underweight',
      image_size: { width: 128, height: 128 },
      text_guidance_scale: 8,
      no_background: true,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error('API error: ' + err);
  }

  const data = await response.json();
  const imgBuffer = Buffer.from(data.image.base64, 'base64');
  fs.writeFileSync('public/assets/avatar/diverse/' + filename, imgBuffer);
  console.log('Saved:', filename);
}

async function main() {
  // Asian male - muscular athletic build like the original hero
  await gen('hero_stage_10_asian.png',
    'EAST ASIAN SKIN man, Chinese Japanese Korean complexion, pixel art RPG warrior, short black hair, MUSCULAR ATHLETIC BUILD same as European warrior, brown sleeveless tunic and brown cloth pants, leather sandals, standing combat stance feet apart, FRONT FACING symmetrical pose, 128x128 sprite, transparent background');

  await new Promise(r => setTimeout(r, 3000));

  // Asian female - athletic build like the original heroine
  await gen('heroine_stage_10_asian.png',
    'EAST ASIAN SKIN woman, Chinese Japanese Korean complexion, pixel art RPG warrior, long black hair in ponytail, FIT ATHLETIC BUILD same as European warrior woman, brown sleeveless tunic and brown cloth pants, leather sandals, standing combat stance feet apart, FRONT FACING symmetrical pose, 128x128 sprite, transparent background');

  console.log('Done!');
}

main().catch(console.error);
