# Equipment Overlay System - Deep Research & Implementation Plan

## The Core Problem

We have two types of sprites that serve different purposes:

1. **Inventory Icons** - Standalone images of items (what we currently have)
   - Centered in their canvas
   - Various sizes (32x32, 48x48, 64x64)
   - Used for: inventory UI, shop displays, tooltips

2. **Character Overlays** - Equipment positioned to layer on a character (what we need)
   - Same canvas size as character (128x128)
   - Item positioned where it would appear on the body
   - Used for: rendering equipped items on avatar

**Our current equipment sprites are inventory icons, NOT character overlays.**

---

## How Professional Games Handle This

### Method 1: Paper Doll System (Recommended)
Used by: Stardew Valley, Terraria, most 2D RPGs

**How it works:**
- ALL sprites (character + equipment) share the same canvas size
- Equipment is pre-positioned within that canvas
- A helmet sprite is 128x128 but only has pixels where the head is
- Rendering = draw layers in order, they align automatically

**Pros:** Simple, fast, pixel-perfect alignment
**Cons:** Equipment tied to specific character proportions

### Method 2: Attachment Points
Used by: Some Unity/Godot games

**How it works:**
- Character defines anchor points: `head: (64, 25)`, `right_hand: (95, 60)`
- Equipment defines its anchor: `helmet_base: (32, 48)`
- Runtime: position equipment so anchors align

**Pros:** Flexible, works with different character sizes
**Cons:** More complex, can have alignment issues

### Method 3: Composite Character Generation
Used by: Some avatar systems

**How it works:**
- Generate the complete character with equipment as one image
- Pre-render common combinations
- Or generate on-demand via AI

**Pros:** Perfect integration
**Cons:** Combinatorial explosion, slow generation

---

## Equipment Slot Positioning (128x128 Canvas)

For a front-facing humanoid character on a 128x128 canvas:

```
┌─────────────────────────────────────────┐
│              HELMET ZONE                │
│            (x: 32-96, y: 0-45)          │
│                 ┌───┐                   │
│                 │ H │                   │
│                 └───┘                   │
├─────────────────────────────────────────┤
│  SHIELD    │    CHEST     │   WEAPON    │
│   ZONE     │     ZONE     │    ZONE     │
│ (0-45,     │  (28-100,    │  (83-128,   │
│  35-95)    │   35-85)     │   30-100)   │
│    ┌──┐    │   ┌─────┐    │    ┌──┐     │
│    │S │    │   │CHEST│    │    │W │     │
│    └──┘    │   └─────┘    │    └──┘     │
├─────────────────────────────────────────┤
│              LEGS ZONE                  │
│           (x: 35-93, y: 75-105)         │
│               ┌─────┐                   │
│               │LEGS │                   │
│               └─────┘                   │
├─────────────────────────────────────────┤
│              BOOTS ZONE                 │
│           (x: 35-93, y: 100-128)        │
│               ┌─────┐                   │
│               │BOOTS│                   │
│               └─────┘                   │
└─────────────────────────────────────────┘

CAPE: Behind character, x: 30-98, y: 20-128 (full body length)
```

### Exact Position Anchors (for 128x128 canvas)

| Slot | Anchor X | Anchor Y | Width | Height | Notes |
|------|----------|----------|-------|--------|-------|
| helmet | 64 (center) | 22 | ~50 | ~40 | Top of head |
| chest | 64 (center) | 58 | ~60 | ~45 | Torso area |
| legs | 64 (center) | 90 | ~50 | ~30 | Upper to mid legs |
| boots | 64 (center) | 115 | ~50 | ~25 | Feet area |
| mainHand | 100 | 65 | ~40 | ~60 | Right side, weapon |
| offHand | 28 | 65 | ~35 | ~50 | Left side, shield |
| cape | 64 (center) | 35 | ~70 | ~90 | Behind, full length |

---

## Layer Rendering Order

**Back to Front (z-index):**

```
1. CAPE (z: 0) - Behind everything
   └── Rendered first, appears behind character

2. BASE CHARACTER (z: 1)
   └── The avatar body itself

3. BOOTS (z: 2)
   └── On feet, partially covered by legs

4. LEGS (z: 3)
   └── Leg armor, covers lower body

5. CHEST (z: 4)
   └── Torso armor, main body coverage

6. OFF-HAND / SHIELD (z: 5)
   └── Left hand items, slightly in front

7. HELMET (z: 6)
   └── On head, near front

8. MAIN-HAND / WEAPON (z: 7)
   └── Right hand, frontmost layer
```

---

## The Solution: Generate Proper Overlay Sprites

### Option A: Re-generate with PixelLab (Recommended)

Generate each equipment piece as a **positioned overlay** using specific prompts:

**Helmet Example:**
```
Prompt: "pixel art iron viking helmet, positioned at TOP CENTER of frame,
designed to sit on humanoid character head, top-down RPG perspective,
helmet only - no character, transparent background, 128x128 sprite"

Position hint: "Place helmet in upper 40% of canvas, horizontally centered"
```

**Weapon Example:**
```
Prompt: "pixel art iron longsword held vertically, positioned on RIGHT SIDE
of frame, as if held in character's right hand, blade pointing up,
top-down RPG perspective, transparent background, 128x128 sprite"

Position hint: "Sword handle at y:70, blade extends to y:20, x centered at 100"
```

**Chest Armor Example:**
```
Prompt: "pixel art steel chestplate armor, front view, positioned at CENTER
of frame covering torso area, designed to overlay on humanoid character,
no arms/head visible, transparent background, 128x128 sprite"

Position hint: "Armor centered horizontally, y from 35 to 85"
```

### Option B: Post-process Existing Sprites

Take existing inventory icons and reposition them:

```javascript
// Position mapping for each slot
const SLOT_POSITIONS = {
  helmet: { x: 39, y: 0, scale: 0.6 },   // Top center
  chest: { x: 34, y: 35, scale: 0.7 },   // Center torso
  legs: { x: 39, y: 75, scale: 0.5 },    // Lower body
  boots: { x: 42, y: 103, scale: 0.4 },  // Bottom
  mainHand: { x: 80, y: 30, scale: 0.6 }, // Right side
  offHand: { x: 5, y: 40, scale: 0.5 },   // Left side
  cape: { x: 29, y: 20, scale: 0.8 },     // Behind, full
};

function createOverlayFromIcon(iconImage, slot) {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  const pos = SLOT_POSITIONS[slot];
  const width = iconImage.width * pos.scale;
  const height = iconImage.height * pos.scale;

  ctx.drawImage(iconImage, pos.x, pos.y, width, height);
  return canvas;
}
```

### Option C: Hybrid Approach

1. Use existing sprites as inventory icons (keep as-is)
2. Generate NEW overlay sprites specifically for character rendering
3. Store both: `sprite.path` for inventory, `overlay.path` for character

---

## Implementation Plan

### Phase 1: Create Overlay Generation Script

```javascript
// scripts/generateEquipmentOverlays.js

const EQUIPMENT_OVERLAYS = {
  helmets: [
    {
      id: 'helmet_iron',
      prompt: 'pixel art iron helmet, top center position, fits on humanoid head...',
      position: { anchor: 'top-center', yOffset: 5 }
    },
    // ... more helmets
  ],
  weapons: [
    {
      id: 'weapon_iron_sword',
      prompt: 'pixel art iron sword, right side position, held vertically...',
      position: { anchor: 'right', xOffset: 85, yOffset: 30 }
    },
    // ... more weapons
  ],
  // ... other slots
};

// Generate with PixelLab API
async function generateOverlay(item, slot) {
  const response = await fetch('https://api.pixellab.ai/v1/generate-image-pixflux', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      description: item.prompt,
      image_size: { width: 128, height: 128 },
      text_guidance_scale: 8.5,
      no_background: true
    })
  });
  // Save to overlays directory
}
```

### Phase 2: Update Equipment Database

```javascript
// Each item needs both icon and overlay paths
{
  id: 'helmet_iron',
  name: 'Iron Helmet',
  slot: 'helmet',

  // Inventory icon (for UI)
  sprite: {
    path: '/assets/equipment/helmets/helmet_iron.png',
    size: 48
  },

  // Character overlay (for avatar rendering)
  overlay: {
    path: '/assets/equipment/overlays/helmets/helmet_iron.png',
    size: 128,
    anchor: { x: 64, y: 22 }
  }
}
```

### Phase 3: Update Avatar Renderer

```javascript
// Simplified rendering logic
function renderEquippedAvatar(ctx, baseSprite, equippedItems) {
  const LAYER_ORDER = ['cape', 'boots', 'legs', 'chest', 'offHand', 'helmet', 'mainHand'];

  // Draw cape first (behind)
  if (equippedItems.cape?.overlay) {
    ctx.drawImage(equippedItems.cape.overlay, 0, 0, 128, 128);
  }

  // Draw base character
  ctx.drawImage(baseSprite, 0, 0, 128, 128);

  // Draw equipment layers (except cape)
  LAYER_ORDER.slice(1).forEach(slot => {
    const item = equippedItems[slot];
    if (item?.overlay) {
      ctx.drawImage(item.overlay, 0, 0, 128, 128);
    }
  });
}
```

---

## Key Insights

### Why Current System Doesn't Work

1. **Wrong sprite type**: We generated inventory icons, not positioned overlays
2. **Size mismatch**: Icons are 32-64px, character is 128px
3. **No positioning**: Icons are centered, not placed where body parts are

### What Makes Overlays Work

1. **Same canvas size**: All sprites 128x128
2. **Pre-positioned**: Equipment drawn where it appears on body
3. **Transparent padding**: Empty space around positioned item
4. **Consistent style**: Same pixel art style as character

### Generation Tips for PixelLab

When generating overlay sprites, include in prompt:
- "positioned at [LOCATION] of frame"
- "designed to overlay on humanoid character"
- "128x128 sprite with transparent background"
- "[SLOT]-specific positioning" (e.g., "top of frame for helmet")
- "RPG top-down perspective matching character view"

---

## File Structure

```
public/assets/equipment/
├── icons/                    # Inventory display (32-64px)
│   ├── helmets/
│   ├── weapons/
│   └── ...
│
└── overlays/                 # Character rendering (128x128)
    ├── helmets/              # Positioned at top-center
    │   ├── helmet_iron.png
    │   └── helmet_dragon.png
    ├── chest/                # Positioned at center-torso
    ├── legs/                 # Positioned at lower-body
    ├── boots/                # Positioned at bottom
    ├── weapons/              # Positioned at right-side
    ├── shields/              # Positioned at left-side
    └── capes/                # Full-body behind position
```

---

## Next Steps

1. **Test with manual positioning first**
   - Take one helmet icon
   - Manually position it on 128x128 canvas
   - Test if it aligns with character

2. **Create positioning script**
   - Automate icon → overlay conversion
   - Define positions per slot
   - Generate all overlays

3. **Re-generate critical items with PixelLab**
   - Use position-aware prompts
   - Generate as 128x128 overlays directly
   - Compare quality vs post-processed icons

4. **Update renderer and test**
   - Ensure layer order is correct
   - Test multiple equipment combinations
   - Add visual effects (glow, particles)
