# Equipment System Architecture

## Overview

The LifeOS equipment system provides deep RPG-style progression with visual customization, stat bonuses, and addictive set collecting mechanics.

## Core Components

### 1. Equipment Database (`/src/data/equipmentDatabase.js`)

**Features:**
- **10 Equipment Slots**: Helmet, Chest, Legs, Boots, Main Hand, Off Hand, Cape, Ring 1, Ring 2, Amulet
- **5 Rarity Tiers**: Common → Uncommon → Rare → Epic → Legendary
- **Set Bonuses**: Themed equipment sets with 2/3/4-piece bonuses
- **Stat System**: Defense, Strength, Vitality, Intelligence, Wisdom, Attack, Speed

**Equipment Structure:**
```javascript
{
  id: 'helmet_dragon',
  name: 'Dragon Helm',
  slot: 'helmet',
  rarity: 'legendary',
  description: 'Forged from dragon scales',
  stats: { defense: 15, vitality: 5, strength: 3 },
  levelRequired: 25,
  sprite: { path: '/assets/equipment/helmets/dragon.png' },
  effects: [
    { type: 'particle', name: 'flame_aura', color: '#ff4400' }
  ],
  setBonus: {
    setName: 'dragon_knight',
    pieces: ['helmet_dragon', 'chest_dragon', 'weapon_dragon_blade']
  }
}
```

### 2. Equipment Renderer (`/src/utils/equipmentRenderer.js`)

**Rendering System:**
- **Layered Sprite Composition**: Equipment renders in proper z-order
- **Direction-Based Ordering**: Different layer orders for facing up/down/left/right
- **Visual Effects**: Glow, particles, auras for rare equipment
- **Palette Swapping**: Dye system for color customization
- **Performance Optimization**: Pre-compositing for cached rendering

**Key Functions:**
```javascript
getEquipmentLayerOrder(facing, animationState)
renderEquipmentLayer(ctx, sprite, x, y, size, effects, dyeColor)
renderEquipmentParticles(ctx, x, y, particleConfig, time)
renderEquipmentAura(ctx, x, y, radius, color, time)
applyEquipmentDye(sourceImage, targetColor)
createEquipmentComposite(equippedItems, sprites, size, facing)
```

## Visual Systems

### Rarity Effects

| Rarity | Color | Visual Features |
|--------|-------|-----------------|
| **Common** | White | Simple design, no effects |
| **Uncommon** | Green | Minor decoration |
| **Rare** | Blue | Subtle glow effect |
| **Epic** | Purple | Medium glow + 2 sparkle particles |
| **Legendary** | Orange | Strong glow + 5 particles + pulsing aura |

### Layer Rendering Order

**Facing Down (Toward Camera):**
```
Back Layer:    Cape (back), Backpack
Middle Layer:  Body, Suit, Legs, Boots
Front Layer:   Main Hand, Off Hand, Helmet, Badge
```

**Facing Up (Away From Camera):**
```
Back Layer:    Main Hand, Off Hand, Backpack
Middle Layer:  Body, Suit, Legs, Boots, Cape
Front Layer:   Helmet
```

### Equipment Effects

**Glow Effect:**
- Subtle: 5px blur
- Medium: 10px blur
- Strong: 15px blur
- Intense: 20px blur

**Particle System:**
- Sparkles orbit equipment with sine wave movement
- Count varies by rarity (2-5 particles)
- Alpha pulsing for twinkling effect

**Aura Effect:**
- Radial gradient pulsing outward
- Radius varies with time (sine wave)
- Alpha between 0.1 and 0.3

## Set Bonus System

**Example: Dragon Knight Set**
```javascript
{
  name: 'Dragon Knight',
  pieces: ['helmet_dragon', 'chest_dragon', 'weapon_dragon_blade'],
  bonuses: {
    2: { // 2-piece bonus
      effects: [
        { type: 'stat', stat: 'fire_resistance', value: 25 },
        { type: 'stat', stat: 'defense', value: 5 }
      ]
    },
    3: { // 3-piece bonus (full set)
      effects: [
        { type: 'stat', stat: 'fire_resistance', value: 50 },
        { type: 'stat', stat: 'defense', value: 15 },
        { type: 'stat', stat: 'attack', value: 10 },
        { type: 'ability', name: 'dragon_aura', description: 'Fire aura damages enemies' }
      ]
    }
  }
}
```

## Transmog/Cosmetic System

**Dual-Slot Design (Terraria-inspired):**
- **Functional Slot**: Provides stats and bonuses
- **Cosmetic Slot**: Determines visual appearance
- **Dye Slot**: Color tint customization

**Implementation:**
```javascript
equipment = {
  helmet: {
    functional: 'helmet_dragon',    // Stats from dragon helm
    cosmetic: 'helmet_bunny_ears',  // Looks like bunny ears
    dye: '#ff69b4'                  // Pink tint
  }
}
```

## Performance Optimization

### 1. Pre-Compositing
When equipment doesn't change frequently, create a cached composite:
```javascript
const equipmentCache = createEquipmentComposite(equipped, sprites, size, 'down');
// Then just draw the cache each frame
ctx.drawImage(equipmentCache, x, y);
```

### 2. Layer-Based Updates
Only redraw equipment layer when equipment changes, not every frame.

### 3. Sprite Atlasing
Pack all equipment sprites into one texture atlas to reduce HTTP requests.

## Integration Points

### Avatar Store (`/src/stores/avatarStore.js`)

**Existing:**
```javascript
{
  equipped: {
    helmet: 'helmet_basic',
    suit: 'suit_basic',
    backpack: 'backpack_basic',
    tool: 'tool_scanner',
    badge: null
  }
}
```

**To Add:**
```javascript
{
  equipped: { /* ... functional equipment */ },
  cosmetic: { /* ... transmog overrides */ },
  dyes: { /* ... color customization */ },

  equipItem(slot, itemId),
  unequipItem(slot),
  setTransmog(slot, cosmeticItemId),
  setDye(slot, color),
  getEquipmentStats(),
  getSetBonuses()
}
```

### Avatar Renderer (`/src/components/avatar/AvatarRenderer.jsx`)

**Current:** Renders base character sprite only

**To Add:**
```javascript
// Import equipment renderer
import {
  getEquipmentLayerOrder,
  renderEquipmentLayer,
  renderEquipmentParticles,
  renderEquipmentAura
} from '../../utils/equipmentRenderer';

// In render loop:
const layerOrder = getEquipmentLayerOrder(character.facing);

layerOrder.forEach(layer => {
  const equipment = getEquipmentForLayer(layer);
  if (equipment) {
    renderEquipmentLayer(ctx, equipment.sprite, x, y, size, equipment.effects);

    if (equipment.hasParticles) {
      renderEquipmentParticles(ctx, x, y, equipment.particleConfig, timestamp);
    }

    if (equipment.hasAura) {
      renderEquipmentAura(ctx, x, y, 30, equipment.color, timestamp);
    }
  }
});
```

## UI Components Needed

### 1. Equipment Inventory Panel
- Grid display of all unlocked equipment
- Filter by slot, rarity, set
- Drag-and-drop to equip
- Hover tooltips with stats

### 2. Character Sheet
- Visual display of equipped items
- Slot-by-slot breakdown
- Total stats calculation
- Set bonus indicators

### 3. Transmog Panel
- Separate cosmetic selection
- "Match Stats" toggle
- Preview before applying

### 4. Dye Panel
- Color picker with HSV sliders
- 6 base color pots
- Preview on equipped item
- "Prismatic Shard" unlock for full spectrum

## Unlock Progression

Equipment unlocks tied to module progress:

```javascript
{
  module: 'productivity',
  requirement: 'complete_500_tasks'
}

{
  module: 'fitness',
  requirement: '90_day_workout_streak'
}

{
  module: 'knowledge',
  requirement: 'finish_10_books'
}
```

## Next Steps

### Phase 1: Visual Integration
1. ✅ Create equipment database
2. ✅ Build equipment renderer
3. ⏳ Integrate into AvatarRenderer
4. ⏳ Test layered rendering

### Phase 2: State Management
1. ⏳ Add cosmetic/dye slots to avatarStore
2. ⏳ Implement transmog functions
3. ⏳ Add set bonus calculation
4. ⏳ Connect to module progress

### Phase 3: UI Development
1. ⏳ Build equipment inventory grid
2. ⏳ Create character sheet display
3. ⏳ Add transmog panel
4. ⏳ Implement dye color picker

### Phase 4: Asset Creation
1. ⏳ Generate placeholder equipment sprites (10-20 pieces)
2. ⏳ Create equipment icons for UI
3. ⏳ Add particle effect sprites
4. ⏳ Design set-themed equipment

### Phase 5: Polish & Effects
1. ⏳ Add legendary particle systems
2. ⏳ Implement aura rendering
3. ⏳ Add equip sound effects
4. ⏳ Create "item obtained" animations

## Asset Requirements

### Equipment Sprites
- **Size**: 128x128 pixels (match character sprite size)
- **Format**: PNG with transparency
- **Layout**: Single static image (no animation frames for now)
- **Grayscale Option**: For palette swapping flexibility

### Folder Structure
```
/public/assets/equipment/
  /helmets/
    basic.png
    iron.png
    dragon.png
  /chest/
    basic.png
    iron.png
    dragon.png
  /weapons/
    basic_sword.png
    iron_sword.png
    dragon_blade.png
  /shields/
    basic.png
    iron.png
  /capes/
    basic.png
    shadow.png
  /rings/
    strength.png
    intelligence.png
  /amulets/
    vitality.png
```

## Research Insights Applied

Based on comprehensive research of top pixel art RPGs:

✅ **Terraria's dual-slot system** - Functional + Vanity separation
✅ **World of Warcraft's rarity colors** - Standard color scheme
✅ **Dead Cells' 3D-to-2D pipeline** - Can use for future asset generation
✅ **Stardew Valley's dye system** - HSV sliders + base color pots
✅ **The Binding of Isaac's transformations** - Set bonus inspiration
✅ **Layer-based rendering** - Industry standard for pixel art equipment
✅ **Performance optimization** - Pre-compositing and caching techniques

## Technical Notes

- All coordinates use `Math.floor()` for crisp pixel-perfect rendering
- `imageSmoothingEnabled = false` on all canvases
- Equipment sprites match character animation frame layout
- Z-ordering changes dynamically based on facing direction
- Particle effects use timestamp for smooth animation
- Aura uses radial gradients with alpha pulsing
- Dye system applies color multiplication to grayscale sprites

---

**Status**: Foundation Complete ✅
**Next Priority**: Integrate rendering into AvatarRenderer component
