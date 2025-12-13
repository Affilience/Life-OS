# Gamification Mode Specification

## Overview

LifeOS supports three distinct gamification modes that change the **presentation layer** without affecting underlying mechanics. All modes earn the same XP/points, unlock the same features, and track the same progress - only the visual presentation and terminology differ.

---

## Mode 1: Cosmic (Default)

### Target Audience
- Users who enjoy RPG elements and fantasy aesthetics
- Those motivated by visual progression and character development
- Gaming enthusiasts who want a fun, immersive experience

### Visual Identity
- **Color Palette**: Purple, pink, cyan gradients with cosmic/space themes
- **Typography**: Fantasy-inspired with bold accents
- **Imagery**: Pixel art avatars, animated companions, equipment sprites
- **Effects**: Particle effects, glowing auras, celebration animations

### Terminology

| Generic | Cosmic Term |
|---------|-------------|
| Points | XP (Experience Points) |
| Progress Level | Level |
| Level Up | Level Up! |
| Profile | Avatar |
| Stage | Evolution |
| Tier | Prestige Realm |
| Rewards Currency | Cosmic Credits (CC) |
| Bonuses | Equipment |
| Enable Bonus | Equip |
| Disable Bonus | Unequip |
| Quality | Rarity |
| Basic | Common |
| Standard | Uncommon |
| Advanced | Rare |
| Premium | Epic |
| Elite | Legendary |
| Bonus Items | Companions |
| Task | Quest |
| Goal | Mission |
| Milestone | Achievement |
| Streak | Streak |
| Streak Protection | Streak Shield |
| Skills | Skill Constellation |
| Physical Stat | Strength |
| Energy Stat | Vitality |
| Mental Stat | Intelligence |
| Focus Stat | Wisdom |
| Consistency Stat | Defense |

### UI Elements

#### Character Page
- Full pixel art avatar display (224px)
- Companion pets displayed alongside avatar
- Equipment showcase with rarity glow effects
- Gender toggle (Hero/Heroine)
- "View Full Evolution Tree" button
- Stage names: Dreamer → Seeker → Recruit → ... → Avatar of Mastery

#### Dashboard
- Hero section widget with avatar and pet sprite
- XP bar with shimmer animation
- "Stage X • Warrior Path" subtitle

#### Navigation
- "Character" label
- "Quests" label
- "Social" label

#### Streaks
- Animated flame icons
- Fire color gradients based on streak length
- "Streak Shield" protection

#### Achievements
- Trophy icons with rarity glow animations
- Particle effects on legendary items
- Fantasy-themed badge names

#### Level Up Modal
- Full celebration animation
- Particle burst effects
- "LEVEL UP!" title
- "Continue Journey" button

### Visibility Settings (All ON)
- showAvatar: true
- showAvatarEffects: true
- showPets: true
- showPetSprites: true (pixel art)
- showEquipment: true
- showEquipmentEffects: true (glow, aura)
- showSkillTree: true
- showConstellationEffects: true
- showXPBar: true
- showLevel: true
- showStreaks: true
- showStreakFlame: true (animated)
- showAchievementPopups: true
- showLevelUpAnimation: true
- showParticleEffects: true
- showRarityGlow: true

---

## Mode 2: Professional

### Target Audience
- Users who want progress tracking without fantasy elements
- Professionals who might use the app in work contexts
- Those who prefer clean, business-friendly aesthetics

### Visual Identity
- **Color Palette**: Blues, greens, neutral grays - corporate-friendly
- **Typography**: Clean, modern, professional
- **Imagery**: Initials/icons instead of pixel art, progress charts
- **Effects**: Subtle transitions, clean animations (no particles)

### Terminology

| Generic | Professional Term |
|---------|-------------------|
| Points | Points |
| Progress Level | Milestone |
| Level Up | Milestone Reached! |
| Profile | Profile |
| Stage | Growth Stage |
| Tier | Mastery Level |
| Rewards Currency | Progress Points (PP) |
| Bonuses | Boosters |
| Enable Bonus | Activate |
| Disable Bonus | Deactivate |
| Quality | Tier |
| Basic | Basic |
| Standard | Standard |
| Advanced | Advanced |
| Premium | Premium |
| Elite | Elite |
| Bonus Items | Focus Boosters |
| Task | Goal |
| Goal | Objective |
| Milestone | Accomplishment |
| Streak | Consistency |
| Streak Protection | Buffer Day |
| Skills | Growth Map |
| Physical Stat | Physical |
| Energy Stat | Energy |
| Mental Stat | Learning |
| Focus Stat | Focus |
| Consistency Stat | Resilience |

### UI Elements

#### Character/Profile Page
- Simple profile display (no pixel art avatar by default)
- Level/milestone indicator with clean progress bar
- Stats displayed as clean progress bars
- No gender toggle visible
- Stage names: Beginner → Explorer → Learner → ... → Perfected

#### Dashboard
- Clean hero section with "Milestone X • Professional Stage"
- Progress bar without shimmer (clean fill)
- No pet sprites visible

#### Navigation
- "Profile" label
- "Goals" label
- "Network" label

#### Streaks
- Number display only (no flame animation)
- "14-day consistency" format
- "Buffer Day" protection

#### Achievements
- Clean badge design (no glow effects)
- "Accomplishment" terminology
- Business-appropriate badge names

#### Level Up Modal
- Clean notification/toast style
- "Milestone Reached!" title
- Subtle fade-in animation
- "Continue" button

### Visibility Settings
- showAvatar: true (simplified view)
- showAvatarEffects: false
- showPets: true (as icons, not sprites)
- showPetSprites: false
- showEquipment: true
- showEquipmentEffects: false
- showSkillTree: true (simplified)
- showConstellationEffects: false
- showXPBar: true
- showLevel: true
- showStreaks: true
- showStreakFlame: false
- showAchievementPopups: true (subtle toast)
- showLevelUpAnimation: false
- showParticleEffects: false
- showRarityGlow: false

---

## Mode 3: Minimal

### Target Audience
- Users who want data/metrics without any gamification visuals
- Those who find gamification distracting
- Users who prefer ultra-clean, functional interfaces

### Visual Identity
- **Color Palette**: Monochrome with subtle accent colors
- **Typography**: Simple, functional
- **Imagery**: None - pure data display
- **Effects**: None - instant state changes

### Terminology

| Generic | Minimal Term |
|---------|--------------|
| Points | Points |
| Progress Level | Level |
| Level Up | New Level |
| Profile | Profile |
| Stage | Stage |
| Tier | Tier |
| Rewards Currency | Points (pts) |
| Bonuses | Bonuses |
| Enable Bonus | Enable |
| Disable Bonus | Disable |
| Quality | Level |
| Basic | Level 1 |
| Standard | Level 2 |
| Advanced | Level 3 |
| Premium | Level 4 |
| Elite | Level 5 |
| Bonus Items | Bonuses |
| Task | Task |
| Goal | Task |
| Milestone | Level |
| Streak | Streak |
| Streak Protection | Grace Day |
| Skills | Skills |
| Physical Stat | Physical |
| Energy Stat | Energy |
| Mental Stat | Mental |
| Focus Stat | Focus |
| Consistency Stat | Consistency |

### UI Elements

#### Profile Page
- Level indicator with user icon
- Stats as simple number rows
- No avatar display
- Stage names: Stage 1, Stage 2, ... Stage 40

#### Dashboard
- Compact hero section with level/points
- Simple progress bar
- No decorative elements

#### Navigation
- "Profile" label
- "Tasks" label
- "Network" label

#### Streaks
- Plain number display "14 days"
- "Grace Day" protection
- No visual indicators

#### Achievements
- Hidden or shown as simple checkmarks
- No popups or notifications

#### Level Up
- No modal or animation
- Silent level increment
- Optional: Small inline notification

### Visibility Settings (Most OFF)
- showAvatar: false
- showAvatarEffects: false
- showPets: true (as text bonuses only)
- showPetSprites: false
- showEquipment: false (bonuses still apply silently)
- showEquipmentEffects: false
- showSkillTree: true (as simple list)
- showConstellationEffects: false
- showXPBar: true (simple bar)
- showLevel: true
- showStreaks: true (number only)
- showStreakFlame: false
- showAchievementPopups: false
- showLevelUpAnimation: false
- showParticleEffects: false
- showRarityGlow: false

---

## Implementation Checklist

### Components to Update

1. **Dashboard**
   - [ ] HeroSectionWidget - mode-specific avatar/profile display
   - [ ] StreakStatsWidget - flame vs number display
   - [ ] QuickActionsWidget - terminology updates
   - [ ] GoalsProgressWidget - quest vs goal terminology

2. **Character Page**
   - [ ] Avatar display logic per mode
   - [ ] Tab visibility per mode
   - [ ] Stage name display
   - [ ] Gender toggle (cosmic only)

3. **Navigation**
   - [ ] Sidebar labels per mode
   - [ ] BottomNav labels per mode

4. **Missions/Quests**
   - [ ] DailyQuests - terminology
   - [ ] Achievements - visual effects
   - [ ] Streaks - flame animation

5. **Gamification UI**
   - [ ] LevelUpModal - celebration vs notification
   - [ ] XPBar - effects toggle
   - [ ] AvatarRenderer - mode-specific display

6. **Settings Page**
   - [ ] Mode preview accuracy
   - [ ] Visibility toggle functionality

---

## Testing Scenarios

### Switch from Cosmic to Professional
- Avatar should simplify (no particle effects)
- "Quests" should become "Goals"
- "Character" should become "Profile"
- Streak flames should disappear
- Level up should show toast, not celebration

### Switch from Professional to Minimal
- Avatar section should hide completely
- Most decorative elements should disappear
- Equipment tab should hide (bonuses still work)
- Achievement popups should stop

### Data Consistency Across Modes
- XP/Points should remain the same value
- Level/Milestone should be the same number
- All unlocks should persist
- Progress tracking should be identical

---

## Future Considerations

1. **Custom Mode** - Allow users to mix and match visibility settings
2. **Theme Integration** - Different color schemes per mode
3. **Animation Intensity** - Slider for effect intensity
4. **Notification Preferences** - Granular control per achievement type
