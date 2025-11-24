# Pets System Design - Mythological Companions

## Overview
A gamification feature where users can collect, nurture, and evolve mythological creature companions that provide passive bonuses and emotional engagement. Pets complement Nova (the AI advisor) by providing tangible progression rewards tied to real-world achievements.

---

## Mythological Creatures Database

### Tier 1: Common Companions (Starter & Easy Unlocks)
**Eastern:**
- **Kitsune Pup** (Japanese) - Baby fox spirit with single tail
- **Qilin Calf** (Chinese) - Young unicorn-like hooved chimerical creature
- **Naga Hatchling** (Hindu) - Small serpent deity with hood
- **Carbuncle** (South American) - Small creature with gem on forehead

**Western:**
- **Imp** (European) - Small mischievous familiar spirit
- **Faerie Dragon** (Celtic) - Tiny butterfly-winged dragon
- **Familiar Cat** (Medieval) - Black cat with mystical eyes
- **Púca Rabbit** (Irish) - Shapeshifting rabbit spirit

**Ancient:**
- **Scarab** (Egyptian) - Sacred beetle with glowing shell
- **Mushhushshu Wyrmling** (Mesopotamian) - Baby dragon-lion hybrid

### Tier 2: Uncommon Guardians (Medium Difficulty)
**Eastern:**
- **Bai Ze** (Chinese) - White beast that can speak and knows all creatures
- **Tanuki** (Japanese) - Raccoon dog shapeshifter with leaf on head
- **Makara** (Hindu) - Half-elephant, half-fish creature
- **Xiezhi** (Chinese) - Horned goat-like creature of justice

**Western:**
- **Griffin Chick** (Greek) - Young eagle-lion hybrid
- **Kelpie** (Scottish) - Water horse spirit
- **Domovoi** (Slavic) - Elderly bearded household spirit
- **Pixie** (Celtic) - Tiny humanoid with dragonfly wings

**Ancient:**
- **Sphinx Cub** (Egyptian) - Young lion with human face
- **Lamassu Calf** (Mesopotamian) - Winged bull with human head

### Tier 3: Rare Mystical Beings (High Difficulty)
**Eastern:**
- **Azure Dragon** (Chinese) - Eastern dragon of spring/east
- **Vermilion Bird** (Chinese) - Phoenix-like bird of summer/south
- **White Tiger** (Chinese) - Divine tiger of autumn/west
- **Black Tortoise** (Chinese) - Turtle-snake fusion of winter/north
- **Garuda** (Hindu) - Divine bird, mount of Vishnu
- **Raiju** (Japanese) - Lightning beast (wolf/weasel form)

**Western:**
- **Pegasus** (Greek) - Winged divine horse
- **Cerberus Pup** (Greek) - Three-headed guardian dog
- **Sleipnir Foal** (Norse) - Eight-legged horse of Odin
- **Basilisk** (European) - Serpent king with crown-like crest

**Ancient:**
- **Anubis Jackal** (Egyptian) - Divine jackal guide
- **Ammit** (Egyptian) - Crocodile-lion-hippo devourer hybrid

### Tier 4: Epic Legendary Beings (Very Rare)
**Eastern:**
- **Nine-Tailed Kitsune** (Japanese) - Ancient fox with nine tails
- **Shen Long** (Chinese) - Divine celestial dragon
- **Fenghuang** (Chinese) - Immortal phoenix empress
- **Qilin Adult** (Chinese) - Fully grown unicorn-dragon hybrid
- **Garuda King** (Hindu) - Fully mature divine eagle

**Western:**
- **Phoenix** (Greek) - Immortal fire bird
- **Ouroboros** (Greek/Norse) - World serpent eating its tail
- **Thunderbird** (Native American) - Storm-bringing divine eagle
- **Chimera** (Greek) - Lion-goat-serpent hybrid

**Ancient:**
- **Bennu** (Egyptian) - Original phoenix, creator deity bird
- **Tiamat Spawn** (Mesopotamian) - Chaos dragon descendant

### Tier 5: Mythic Divine Companions (Legendary Rare)
**Primordial Forces:**
- **Fafnir** (Norse) - Dragon of greed, guardian of treasure
- **Jörmungandr** (Norse) - World Serpent that encircles Midgard
- **Nidhogg** (Norse) - Dragon that gnaws at world tree roots
- **Fenrir Pup** (Norse) - Wolf destined to devour gods
- **Typhon** (Greek) - Storm giant father of monsters
- **Leviathan** (Hebrew) - Primordial sea serpent
- **Ziz** (Hebrew) - Primordial cosmic bird
- **Behemoth** (Hebrew) - Primordial land beast

---

## Unlock System

### Unlock Methods

#### 1. Level Milestones (Primary Method)
- **Level 5**: Choose starter pet (1 Common from 3 options)
- **Level 10**: Unlock second pet slot + 1 Uncommon pet
- **Level 15**: Unlock third pet slot
- **Level 20**: 1 Rare pet unlock
- **Level 25**: Unlock fourth pet slot + Pet Evolution unlocked
- **Level 30**: 1 Epic pet unlock
- **Level 40**: Unlock fifth pet slot
- **Level 50**: 1 Mythic pet unlock (choose from 3)
- **Level 75**: Unlock sixth pet slot (max)
- **Level 100**: Legendary pet egg (hatches into random Mythic)

#### 2. Achievement Unlocks
**Productivity Module:**
- Complete 100 tasks → Imp (tireless worker bonus)
- 30-day task streak → Griffin Chick (discipline bonus)
- Complete major project → Pegasus (creative flight bonus)

**Health & Fitness:**
- 7-day workout streak → Kelpie (vitality bonus)
- Log 50 workouts → Raiju (energy bonus)
- Achieve fitness goal → White Tiger (strength bonus)

**Knowledge Management:**
- Finish 10 books → Bai Ze (knows all creatures, wisdom bonus)
- 100 study sessions → Sphinx Cub (riddles and knowledge)
- Complete learning path → Garuda (soaring intellect bonus)

**Journal & Diary:**
- 30-day journaling streak → Domovoi (reflection bonus)
- 100 journal entries → Faerie Dragon (introspection bonus)

**Financial Tracking:**
- Achieve savings goal → Fafnir (wealth guardian bonus)
- Net worth milestone → Carbuncle (gem represents wealth)

**Skills Learning:**
- Master a skill (level 10) → Tanuki (adaptability bonus)
- Practice skill 100 times → Makara (persistence bonus)

**Time Management:**
- Perfect week (100% time blocking) → Azure Dragon (time mastery)
- 1000 hours logged → Phoenix (rebirth/renewal bonus)

#### 3. Quest Unlocks (Future System)
Special timed events or multi-step challenges:
- "Hunt the Golden Stag" → Unlock Kelpie
- "Solve the Sphinx's Riddle" → Unlock Sphinx Cub
- "Survive Ragnarok Week" (intense productivity) → Unlock Fenrir Pup

#### 4. Rare Random Drops
After completing any action, small chance (0.5%) for:
- Pet Egg (Common-Uncommon tier)
- Mystery Egg (Rare tier, hatches in 7 days)
- Legendary Egg (Epic tier, hatches in 30 days)
- Mythic Shard (collect 10 → choose 1 Mythic pet)

#### 5. Special Events
- **Birthday:** User gets to choose 1 pet from any tier
- **New Year:** Vermilion Bird (renewal and new beginnings)
- **Seasonal Events:** Culture-specific pets (Lunar New Year → Qilin, etc.)

---

## Rarity Tiers & Colors

Following [industry-standard color-coding](https://tvtropes.org/pmwiki/pmwiki.php/Main/ColorCodedItemTiers):

| Tier | Color | Border | Unlock Difficulty |
|------|-------|--------|-------------------|
| **Common** | White/Grey | `#9CA3AF` | Easy (Level 5+, basic achievements) |
| **Uncommon** | Green | `#10B981` | Medium (Level 10+, moderate achievements) |
| **Rare** | Blue | `#3B82F6` | Hard (Level 20+, difficult achievements) |
| **Epic** | Purple | `#8B5CF6` | Very Hard (Level 30+, major milestones) |
| **Mythic** | Gold/Orange | `#F59E0B` | Legendary (Level 50+, endgame content) |

---

## Pet Mechanics

### 1. Pet Slots
- Start with 1 slot (unlocked at level 5)
- Max 6 slots (unlocked by level 75)
- Can swap active pets anytime
- Only active pets provide bonuses

### 2. Pet Bonuses (Passive Effects)
Each pet provides small passive bonuses based on mythology:

**Productivity Bonuses:**
- Imp: +5% task completion XP
- Griffin: +10% XP during focus sessions
- Pegasus: +15% creative project XP

**Health Bonuses:**
- Kelpie: +5% workout XP
- Raiju: +10% energy recovery speed
- White Tiger: +15% strength training XP

**Learning Bonuses:**
- Bai Ze: +5% reading comprehension memory
- Sphinx: +10% study session XP
- Garuda: +15% skill learning speed

**Financial Bonuses:**
- Carbuncle: +5% savings goal progress visualization
- Fafnir: +10% investment tracking clarity
- Gold Dragon: +15% financial insights

**Universal Bonuses:**
- Phoenix: +10% XP to all modules (Epic tier)
- Ouroboros: +5% to all stats (Epic tier)
- Jörmungandr: +20% XP on weekly completion (Mythic tier)

### 3. Pet Care & Bonding (Optional - Can Skip for Simplicity)
**Simple Version (Recommended):**
- No feeding/care required
- Pets are permanent once unlocked
- Bonuses always active when equipped

**Complex Version (If Desired):**
- Pet happiness meter (0-100%)
- Interact once per day to maintain 100%
- Happiness affects bonus strength (50% happiness = 50% bonus)
- Neglect → pet sleeps (bonus disabled until interaction)
- Never dies or leaves

### 4. Pet Evolution
Unlocked at Level 25:
- Common → Uncommon (requires 30 days active + 100 interactions)
- Uncommon → Rare (requires 60 days active + 500 interactions)
- Rare → Epic (requires 90 days active + 1000 interactions)
- Epic → Mythic (requires 180 days active + 5000 interactions)

Evolution changes sprite, increases bonus, adds visual effects.

### 5. Pet Collection
- Collection page shows all pets (owned + locked silhouettes)
- Completion percentage
- Lore/mythology text for each pet
- "Where to unlock" hints for locked pets

---

## UI/UX Design

### Character Page Integration

**Pet Display Section (Below Avatar):**
```
┌─────────────────────────────────────┐
│  Active Companions (3/6 slots)      │
├─────────────────────────────────────┤
│  [Kitsune Pup]  [Imp]  [Empty Slot] │
│   +5% Learn XP  +5% Task  [Locked]  │
│                                      │
│  [Empty Slot]   [Empty]  [Empty]    │
│   [Locked L15]  [L40]    [L75]      │
└─────────────────────────────────────┘
```

**Pet Collection Button:**
- Opens full-screen pet codex
- Filter by: Owned, Locked, Tier, Culture
- Click pet → View lore, stats, unlock requirements

### Pet Unlock Animation
When unlocking new pet:
1. Screen flashes with tier color
2. Egg cracks open (if from egg)
3. Pet sprite appears with sparkle effect
4. Lore card displays
5. "Add to Active Companions?" prompt

### Active Pet Display
- Small pet sprites float next to Nova widget
- Subtle idle animations (breathing, floating)
- Click pet → Quick stats tooltip
- Right-click → Swap out for different pet

---

## Technical Implementation

### Database Schema

```sql
-- User Pets Table
CREATE TABLE user_pets (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  pet_id VARCHAR(50), -- e.g., 'kitsune_pup'
  tier VARCHAR(20), -- common, uncommon, rare, epic, mythic
  unlocked_at TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT false,
  evolution_stage INTEGER DEFAULT 1,
  total_interactions INTEGER DEFAULT 0,
  happiness INTEGER DEFAULT 100,
  days_owned INTEGER DEFAULT 0
);

-- Pets Master Table
CREATE TABLE pets (
  pet_id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100),
  culture VARCHAR(50), -- greek, norse, chinese, etc.
  tier VARCHAR(20),
  sprite_path VARCHAR(255),
  lore TEXT,
  bonus_type VARCHAR(50), -- productivity, health, learning, etc.
  bonus_amount DECIMAL,
  unlock_method TEXT -- level_10, achievement_100_tasks, etc.
);
```

### localStorage Structure (For Now)
```javascript
{
  "user_pets": [
    {
      "pet_id": "kitsune_pup",
      "tier": "common",
      "unlocked_at": 1234567890,
      "is_active": true,
      "evolution_stage": 1
    }
  ],
  "active_pet_slots": ["kitsune_pup", "imp", null, null, null, null]
}
```

---

## Sprite Generation Plan

### Sprite Specifications
- **Size:** 48x48px (consistent with Nova avatar size)
- **Style:** Pixel art, mythological advisor aesthetic
- **Background:** Transparent
- **Palette:** Vibrant but harmonious with dark mode UI
- **Shading:** Medium shading for depth
- **Outline:** Single color outline for clarity

### Priority Sprite Generation (Phase 1)
Generate 3 pets per tier for initial launch (15 total):

**Common (3):**
1. Kitsune Pup (Japanese fox spirit)
2. Imp (European familiar)
3. Scarab (Egyptian sacred beetle)

**Uncommon (3):**
4. Griffin Chick (Greek eagle-lion)
5. Tanuki (Japanese raccoon dog)
6. Domovoi (Slavic household spirit)

**Rare (3):**
7. Azure Dragon (Chinese divine dragon)
8. Pegasus (Greek winged horse)
9. Anubis Jackal (Egyptian guide)

**Epic (3):**
10. Nine-Tailed Kitsune (Japanese ancient fox)
11. Phoenix (Greek fire bird)
12. Fenghuang (Chinese empress phoenix)

**Mythic (3):**
13. Fenrir Pup (Norse wolf)
14. Jörmungandr (Norse world serpent)
15. Leviathan (Hebrew sea serpent)

---

## Gamification Psychology

### Why Pets Work ([Yu-kai Chou Research](https://yukaichou.com/advanced-gamification/the-pet-companion-design-in-gamification/))

1. **Ownership & Possession** (Core Drive #4) - "This is MY creature"
2. **Development & Accomplishment** (Core Drive #2) - Watching pets evolve
3. **Unpredictability & Curiosity** (Core Drive #7) - Egg hatches, rare drops
4. **Social Influence & Relatedness** (Core Drive #5) - Collection completion
5. **Meaning & Calling** (Core Drive #1) - Mythological connection to real-world progress

### Avoiding Pitfalls
- **NO mandatory care** (reduces to chore)
- **NO pet death** (creates negative association)
- **NO pay-to-win** (all pets earnable through play)
- **NO pressure** (pets are bonus, not requirement)

---

## Future Expansions

### Phase 2: Advanced Features
- Pet interactions (play, feed, pet)
- Pet expeditions (send pet on quest, returns with rewards)
- Pet breeding (combine two pets → new variant)
- Seasonal exclusive pets
- Pet cosmetics (hats, collars, effects)

### Phase 3: Social Features
- Pet trading between users
- Pet battles (friendly competition)
- Pet showcase (share collection)
- Global pet leaderboard

### Phase 4: Cross-Module Integration
- Pets appear in module interfaces
- Module-specific pet animations (Imp organizes tasks, Pegasus flies over calendar)
- Pets react to Nova conversations
- Pets provide contextual tips

---

## Cost Estimate

### Sprite Generation (PixelLab API)
- 15 sprites @ ~$0.006-$0.008 each = **$0.09 - $0.12**
- Full catalog (60 sprites) = **$0.36 - $0.48**

### Development Time
- Database schema: 2 hours
- Unlock system logic: 4 hours
- UI components: 6 hours
- Sprite generation: 2 hours
- Testing & refinement: 4 hours
- **Total: ~18 hours** for Phase 1

---

## Success Metrics

### Engagement
- Pet collection completion rate
- Average active pets per user
- Daily pet interaction rate
- Time spent on pet collection page

### Retention
- Return rate after unlocking first pet
- Achievement completion increase
- Module usage increase (to unlock pets)

### Progression
- Average time to unlock each tier
- Evolution completion rate
- Rare drop excitement (qualitative feedback)

---

## Summary

The Pets System adds a layer of collectible progression to LifeOS that:
- ✅ Rewards real-world achievements with tangible companions
- ✅ Provides passive bonuses tied to mythology
- ✅ Creates long-term collection goals (months-years)
- ✅ Complements Nova without overshadowing her
- ✅ Low maintenance (no mandatory care)
- ✅ Culturally rich (10+ mythologies represented)
- ✅ Scalable (can add pets over time)

**Next Step:** Generate Phase 1 sprites (15 pets) and implement basic unlock/display system.

---

## Sources

**Research References:**
- [Animals in Mythology](https://www.encyclopedia.com/history/encyclopedias-almanacs-transcripts-and-maps/animals-mythology)
- [List of Legendary Creatures by Type - Wikipedia](https://en.wikipedia.org/wiki/List_of_legendary_creatures_by_type)
- [Chinese Mythical Creatures](https://www.chinafetching.com/mythical-animal-in-chinese-culture)
- [Top 50 Mythical Creatures in Folklore](https://littafi.com/blog/top-50-mythical-creatures-in-folklore-from-around-the-world/)
- [Pet Companion Design in Gamification - Yu-kai Chou](https://yukaichou.com/advanced-gamification/the-pet-companion-design-in-gamification/)
- [Virtual Pets and Gamification](https://inqubi.com/blog/virtual-pets-and-gamification/)
- [Color-Coded Item Tiers - TV Tropes](https://tvtropes.org/pmwiki/pmwiki.php/Main/ColorCodedItemTiers)
- [Familiar Spirit - Wikipedia](https://en.wikipedia.org/wiki/Familiar)
