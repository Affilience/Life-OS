# ONYXOS Design System

**Dark Aurora Aesthetic** • Premium Life Operating System • "Become the upgraded version of yourself."

---

## 🎨 Design Philosophy

ONYXOS follows a **dark-mode-first**, **premium**, and **disciplined** design approach inspired by:
- **Arc Browser** (smooth, confident interactions)
- **Linear** (clean, purposeful UI)
- **Apple Vision Pro** (premium materials, subtle depth)
- **Biotech aesthetic** (progress, measurement, optimization)

**Tone:** Futuristic, disciplined, calm, premium
**No cringe.** Identity-focused, not childish.

---

## 📦 Project Structure

```
lifeos-frontend/
├── src/
│   ├── lib/
│   │   └── design-tokens.css          # Single source of truth for design tokens
│   ├── components/
│   │   ├── ui/                        # Core reusable components
│   │   │   ├── Button.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── Badge.jsx
│   │   │   ├── Stat.jsx
│   │   │   ├── Progress.jsx
│   │   │   └── index.js               # Centralized exports
│   │   └── app/                       # Domain-specific components
│   │       ├── XPBar.jsx              # Gamification: XP progression
│   │       ├── LevelBadge.jsx         # Gamification: Level display
│   │       ├── SeasonPill.jsx         # Gamification: Season indicator
│   │       ├── QuestCard.jsx          # Gamification: Quest/task cards
│   │       ├── StreakHeatmap.jsx      # Gamification: Consistency tracking
│   │       └── index.js
│   ├── pages/
│   │   └── DashboardNew.jsx           # ONYXOS hero dashboard
│   └── index.css                      # Imports design-tokens.css
└── tailwind.config.js                 # Maps CSS vars to Tailwind utilities
```

---

## 🎯 Color System: Dark Aurora

### Backgrounds (Layered Neutrals)
```css
--bg-0: #0B0B0F    /* Root background / app chrome */
--bg-1: #101014    /* Primary surface / page */
--bg-2: #18181F    /* Card surface */
```

### Text (White with Opacity)
```css
--text-high: rgba(255,255,255,0.90)  /* High emphasis */
--text-med:  rgba(255,255,255,0.65)  /* Medium emphasis */
--text-dim:  rgba(255,255,255,0.45)  /* Low emphasis */
```

### Accents (Neon, Restrained)
```css
--accent:   #7A5CFF  /* Electric Violet - brand primary */
--accent-2: #4F9DFF  /* Neon Blue */
--accent-3: #D064FF  /* Magenta Glow */
--accent-4: #5CE1E6  /* Cyan Edge */
```

### Semantic
```css
--success: #3EDC81
--warning: #F2C94C
--error:   #EB5757
```

### Structural
```css
--border: rgba(255,255,255,0.08)
--muted:  rgba(255,255,255,0.06)
--shadow: rgba(0,0,0,0.6)
```

---

## 🔤 Typography

**Primary Font:** Satoshi (fallback: Inter)
**Mono Font:** JetBrains Mono

### Scale
- **Display:** 56px / 40px / 32px
- **Headings:** 28px (H1), 24px (H2), 20px (H3)
- **Body:** 16px / 14px
- **Mono (data):** 13-14px

### Weights
- Regular: 400
- Medium: 500
- Semibold: 600
- Bold: 700

**Letter-spacing:** Tighten slightly for display text (`--tracking-tight: -0.02em`)

---

## 📐 Spacing & Radius

### Border Radius
```css
--radius-xs:   8px
--radius-sm:   12px
--radius-md:   16px
--radius-lg:   20px
--radius-xl:   24px
--radius-pill: 9999px
```

### Spacing (4px base)
```
4px, 6px, 8px, 12px, 16px, 20px, 24px, 32px, 40px, 48px, 64px
```

### Shadows
```css
--shadow-z1: 0 1px 2px var(--shadow)
--shadow-z2: 0 4px 16px var(--shadow)
--shadow-glow: 0 0 0 1px rgba(122,92,255,.25), 0 8px 40px rgba(122,92,255,.15)
```

---

## ⚡ Motion & Animation

### Easing
```css
--ease-standard: cubic-bezier(0.2, 0.8, 0.2, 1)
```

### Durations
- **Enter:** 240ms
- **Exit:** 180ms
- **Fast:** 160ms

### Signature Interactions
1. **XPBar:** Fills with gentle neon afterglow (1.2s)
2. **Season transitions:** Background gradient shifts subtly
3. **Quest completion:** Pulse at 6% scale for 120ms + glow animation
4. **Cards update:** Subtle lift + shadow

**Accessibility:** Respects `prefers-reduced-motion`

---

## 🎮 Gamification System

### XP & Levels
- **XPBar:** Global and domain-specific progress bars
- **LevelBadge:** Circular badge with gradient glow
- Fills animate on mount/update with neon glow effect

### Seasons
- 6-8 week cycles
- Each season has theme color (rotates through accent palette)
- **SeasonPill:** Displays current season compactly

### Quests
- Daily/weekly tasks with XP values
- Difficulty tags: easy / normal / hard
- Identity tags: Disciplined, Strong, Curious, etc.
- **QuestCard:** Interactive card with completion animation

### Achievements & Streaks
- **StreakHeatmap:** GitHub-style heatmap (90 days default)
- Tasteful badges named as identity markers (e.g., *Consistency II*)

---

## 🧩 Component Usage

### Button
```jsx
import { Button } from '../components/ui';

<Button variant="primary" size="md" leftIcon={<Plus />}>
  Quick Add
</Button>

// Variants: primary, secondary, ghost, danger
// Sizes: sm, md, lg
```

### Card
```jsx
import { Card } from '../components/ui';

<Card padding="md" hover glow>
  {children}
</Card>

// Padding: none, sm, md, lg
// Props: hover, glow
```

### XPBar
```jsx
import { XPBar } from '../components/app';

<XPBar
  currentXP={2840}
  maxXP={5000}
  level={7}
  animated={true}
  color="accent"
/>
```

### QuestCard
```jsx
import { QuestCard } from '../components/app';

<QuestCard
  title="Deep work session"
  xp={150}
  difficulty="hard"
  identityTag="Disciplined"
  onComplete={() => console.log('Done!')}
/>
```

---

## 🏗️ Layout System (AppShell)

### Structure
- **Sidebar:** Fixed left, 280px wide
- **TopBar:** Fixed top, 64px height
- **Content:** `ml-[280px] mt-16`, max-width 1440px, 16-24px gutters

### Files
- `src/components/layout/Sidebar.jsx`
- `src/components/layout/TopBar.jsx`
- `src/components/layout/MainLayout.jsx`

---

## 🎨 Using Design Tokens

Design tokens are defined in `src/lib/design-tokens.css` and mapped to Tailwind utilities via `tailwind.config.js`.

### Direct CSS Variables
```css
.my-component {
  background: var(--bg-2);
  color: var(--text-high);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
}
```

### Tailwind Classes
```jsx
<div className="bg-bg-2 text-text-high border border-border rounded-md">
  Premium card
</div>
```

### Animation Classes
```jsx
<div className="animate-fade-in">Fades in on mount</div>
<div className="animate-glow">Glows continuously</div>
```

---

## ✅ Acceptance Criteria

Before merging any feature:

1. ✅ Uses tokens from `design-tokens.css` (no hardcoded colors)
2. ✅ Follows spacing/radius/shadow rules
3. ✅ Keyboard accessible; visible focus states
4. ✅ Dark mode perfect (no light fringing; contrast checked)
5. ✅ Animations feel subtle and premium
6. ✅ Empty/loading/error states implemented
7. ✅ Respects `prefers-reduced-motion`

---

## 📚 Next Steps

1. **Storybook:** Component stories for visual testing
2. **Light Theme:** Derived by inverting neutrals and muting accents
3. **Collapsible Sidebar:** 72-88px collapsed state
4. **CommandK Palette:** Global search/quick actions
5. **Toast Notifications:** For quest completions, XP gains
6. **Cinematic Modals:** Monthly/seasonal summary with share export

---

## 🧠 Project Memory (Persist Across Sessions)

**Brand:** ONYXOS (renameable)
**Primary Accent:** #7A5CFF (Electric Violet)
**Core Neutrals:** #0B0B0F, #101014, #18181F
**Borders:** rgba(255,255,255,0.08)
**Type:** Satoshi > Inter, JetBrains Mono
**Radius:** 8-24px
**Shadows:** z1/z2/glow
**Focus Style:** Multi-layer ring (accessibility)
**Motion Curve:** (0.2,0.8,0.2,1)
**Durations:** 160-240ms
**Voice:** Supportive, firm, non-cringe. "Show up. Prove it."
**Components:** Button, Card, Badge, Stat, XPBar, QuestCard, SeasonPill, StreakHeatmap, LevelBadge
**Layout:** Fixed sidebar (280px), content max 1440px, 16-24px gutters
**Accessibility:** WCAG 2.1 AA target, keyboard-first
**Data viz:** Recharts, restrained accents, minimal series

---

**Developed with [Claude Code](https://claude.com/claude-code)**

*Keep building. Keep iterating. This is a marathon, not a sprint.*
