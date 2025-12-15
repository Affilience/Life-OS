# Equipment Overlay System v2 - Simplified Implementation

## Quick Summary

Equipment overlays are 128x128 transparent PNG sprites that layer on top of the base character. One overlay per equipment item, positioned to work across all avatar stages.

## Active Equipment Slots

| Slot | Description | Layer Order |
|------|-------------|-------------|
| helmet | Headgear | 7 (top) |
| chest | Body armor | 5 |
| legs | Leg armor | 3 |
| boots | Footwear | 2 |
| mainHand | Weapons | 8 (front) |
| offHand | Shields | 6 |
| cape | Cloaks | 1 (back) |

**Removed**: rings, amulets, gloves (not in current system)

## Layer Rendering Order

```
1. Cape (behind character)
2. Boots
3. Legs
4. [Base Character Sprite]
5. Chest
6. Off-hand (shield)
7. Helmet
8. Main-hand (weapon)
```

## File Structure

```
public/assets/equipment/
├── overlays/                    # Character overlays (128x128)
│   ├── helmets/                 # Renders on character head
│   ├── chest/                   # Renders on character torso
│   ├── legs/                    # Renders on character legs
│   ├── boots/                   # Renders on character feet
│   ├── weapons/                 # Renders in character hand
│   ├── shields/                 # Renders on character off-hand
│   └── capes/                   # Renders behind character
│
├── helmets/                     # Inventory icons (32x32 or 48x48)
├── chests/
├── legs/
├── boots/
├── weapons/
├── shields/
└── capes/
```

## Database Structure

```javascript
{
  id: 'boots_leather',
  name: 'Leather Boots',
  slot: 'boots',
  rarity: 'common',

  // Inventory icon (equipment selection UI)
  sprite: {
    path: '/assets/equipment/boots/leather_boots.png'
  },

  // Character overlay (renders on avatar)
  overlay: {
    path: '/assets/equipment/overlays/boots/boots_leather.png'
  },

  stats: { defense: 1, vitality: 2 },
}
```

## Overlay Sprite Guidelines

### Size & Format
- **Dimensions**: 128x128 pixels (same as base character)
- **Format**: PNG with transparency
- **Background**: Fully transparent except equipment pixels

### Positioning Within 128x128 Canvas

```
┌────────────────────────────────┐
│      HELMET (y: 0-50)          │
│    ┌──────────────────┐        │
│    │    (head area)   │        │
│    └──────────────────┘        │
├────────────────────────────────┤
│ CAPE │   CHEST    │ WEAPON     │
│ back │ (y: 35-85) │ (right)    │
│      │            │            │
├────────────────────────────────┤
│ SHIELD│   LEGS    │            │
│ (left)│ (y: 70-105)│           │
├────────────────────────────────┤
│      BOOTS (y: 95-128)         │
└────────────────────────────────┘
```

### Per-Slot Guidelines

| Slot | Y-Range | X-Position | Notes |
|------|---------|------------|-------|
| helmet | 0-50px | center | Sits on head |
| chest | 35-85px | center | Covers torso |
| legs | 70-105px | center | Thigh to knee |
| boots | 95-128px | center | Feet area |
| mainHand | 20-100px | right side | Held weapon |
| offHand | 30-90px | left side | Shield/tome |
| cape | 20-128px | center-back | Behind character |

## Rendering Pipeline

### AvatarRenderer.jsx Flow

```javascript
// 1. Load base character sprite for current level
const baseSprite = await generateSpriteByLevel(level, prestige);

// 2. Get equipped items
const equipped = avatarStore.getVisualEquipment();

// 3. Render layers in order
const LAYER_ORDER = ['cape', 'boots', 'legs', 'chest', 'offHand', 'helmet', 'mainHand'];

for (const slot of LAYER_ORDER) {
  const item = equipped[slot];
  if (!item?.overlay?.path) continue;

  const overlaySprite = await loadImage(item.overlay.path);
  ctx.drawImage(overlaySprite, 0, 0, 128, 128);
}

// 4. Apply rarity effects (glow, particles) for epic/legendary
```

## Current Overlay Status

### Existing Overlays ✅
- helmets: 6 overlays
- chest: 7 overlays
- weapons: 5 overlays
- shields: 4 overlays
- capes: 5 overlays
- boots: 2 overlays

### Missing Overlays ❌
- **boots**: Need 5 more (cloth_shoes, steel_greaves, mage_slippers, dragon, phoenix)
- **legs**: Need ALL (0 exist) - 8 total needed

## Generation Prompts

### PixelLab API Parameters
```javascript
{
  description: "pixel art [ITEM] equipment overlay, 128x128 sprite, transparent background, designed to layer on humanoid RPG character, [POSITION] of character, [RARITY_STYLE]",
  image_size: { width: 128, height: 128 },
  text_guidance_scale: 8.5,
  no_background: true,
}
```

### Position Descriptions by Slot
- **helmet**: "on head area, top portion"
- **chest**: "on torso, center body"
- **legs**: "on lower body, thigh to knee area"
- **boots**: "on feet, bottom portion"
- **weapon**: "held in right hand, right side"
- **shield**: "held in left hand, left side"
- **cape**: "flowing behind, full body length"

### Rarity Style Modifiers
- **common**: "simple design, basic materials"
- **uncommon**: "quality crafted, subtle details"
- **rare**: "glowing blue accents, magical quality"
- **epic**: "purple glow, ornate details, magical aura"
- **legendary**: "golden orange glow, divine radiance, legendary quality"

## Implementation Checklist

### Phase 1: Missing Overlays
- [ ] Generate legs overlays (8 items)
- [ ] Generate remaining boots overlays (5 items)
- [ ] Update equipmentDatabase.js with overlay paths

### Phase 2: Verify Rendering
- [ ] Test AvatarRenderer loads overlays
- [ ] Verify layer order is correct
- [ ] Test with all slot combinations

### Phase 3: Polish
- [ ] Add rarity glow effects
- [ ] Test dye system with overlays
- [ ] Add fallback for missing overlays

## Equipment to Generate

### Boots (7 total, 2 exist)
| ID | Name | Rarity | Has Overlay |
|----|------|--------|-------------|
| boots_cloth_shoes | Cloth Shoes | common | ❌ |
| boots_leather | Leather Boots | common | ✅ |
| boots_iron | Iron Boots | uncommon | ✅ |
| boots_steel_greaves | Steel Greaves | rare | ❌ |
| boots_mage_slippers | Mage Slippers | rare | ❌ |
| boots_dragon | Dragon Scale Boots | legendary | ❌ |
| boots_phoenix | Phoenix Flame Boots | legendary | ❌ |

### Legs (8 total, 0 exist)
| ID | Name | Rarity | Has Overlay |
|----|------|--------|-------------|
| legs_cloth_pants | Cloth Pants | common | ❌ |
| legs_leather_leggings | Leather Leggings | common | ❌ |
| legs_chainmail | Chainmail Leggings | uncommon | ❌ |
| legs_iron_legguards | Iron Legguards | rare | ❌ |
| legs_steel_legplates | Steel Legplates | rare | ❌ |
| legs_mage_robes | Arcane Legwraps | epic | ❌ |
| legs_dragon | Dragon Scale Legguards | legendary | ❌ |
| legs_phoenix | Phoenix Flame Legguards | legendary | ❌ |
