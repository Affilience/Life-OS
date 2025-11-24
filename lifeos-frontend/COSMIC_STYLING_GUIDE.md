# Cosmic Styling Guide

All cosmic enhancements have been implemented! Here's how to use them throughout your app.

## Quick Start - Apply Cosmic Effects

### Phase 1: Backgrounds & Borders

**Aurora Animated Backgrounds:**
```jsx
// For large panels/sections
<div className="cosmic-panel p-6 rounded-xl">
  Your content
</div>

// For cards
<div className="cosmic-card p-4 rounded-lg">
  Card content
</div>
```

**Cosmic Gradient Borders:**
```jsx
<div className="cosmic-border rounded-lg p-4">
  Card with animated gradient border
</div>
```

**Enhanced Glows on Hover:**
```jsx
// Subtle glow
<button className="cosmic-glow px-4 py-2 rounded-lg">
  Hover me
</button>

// Strong glow with lift
<button className="cosmic-glow-strong px-6 py-3 rounded-lg">
  Primary Action
</button>
```

### Phase 2: Starfield & Text Effects

**Starfield Background:**
Already active! The subtle twinkling starfield appears behind all content automatically.

**Text Glow (automatic on h1, h2, h3):**
```jsx
// Automatically applied
<h1>This heading glows!</h1>
<h2>This too!</h2>

// Manual application
<div className="cosmic-title text-3xl font-bold">
  Custom title with glow
</div>
```

**Connection Lines (for progress indicators):**
```jsx
<div className="relative cosmic-connector py-4">
  Step content
</div>
```

### Phase 3: Advanced Interactions

**Lift Effect:**
```jsx
<div className="cosmic-lift rounded-xl p-6 cursor-pointer">
  Lifts smoothly on hover
</div>
```

**Loading Skeletons:**
```jsx
// Shimmering skeleton
<div className="cosmic-skeleton h-20 w-full"></div>

// Pulsing load effect
<div className="cosmic-loading-pulse h-40 w-full rounded-lg">
  Loading content...
</div>
```

**Particle Effects on Hover:**
```jsx
<div className="cosmic-particles rounded-lg p-8">
  Subtle particles appear on hover
</div>
```

**Cosmic Buttons:**
```jsx
<button className="cosmic-button px-6 py-3 rounded-lg">
  Enhanced Button
</button>
```

**Cosmic Input Fields:**
```jsx
<input
  type="text"
  className="cosmic-input px-4 py-2 rounded-lg w-full"
  placeholder="Type something..."
/>
```

## Combining Effects

You can combine multiple cosmic classes for layered effects:

```jsx
<div className="cosmic-card cosmic-border cosmic-lift p-6 rounded-xl">
  <h2>Fully Cosmic Card</h2>
  <p>Aurora background + gradient border + lift effect</p>
</div>
```

## Auto-Applied Effects

These are already active globally:

1. **Starfield background** - Subtle twinkling stars behind everything
2. **Cosmic scrollbar** - Gradient scrollbar with glow
3. **Text glow on headings** - All h1, h2, h3 have subtle glow
4. **Enhanced scrollbar** - Cosmic gradient thumb

## Usage Examples by Component Type

### Cards
```jsx
<div className="cosmic-card cosmic-border cosmic-lift rounded-xl p-6">
  Card with full cosmic treatment
</div>
```

### Buttons
```jsx
// Primary action
<button className="cosmic-button cosmic-glow-strong">
  Save Changes
</button>

// Secondary action
<button className="cosmic-button cosmic-glow">
  Cancel
</button>
```

### Panels/Sections
```jsx
<section className="cosmic-panel rounded-2xl p-8">
  <h2>Section Title</h2>
  <p>Content with aurora background</p>
</section>
```

### Form Inputs
```jsx
<input
  className="cosmic-input"
  type="text"
/>
<textarea
  className="cosmic-input"
  rows={4}
></textarea>
```

### Loading States
```jsx
// Skeleton loader
<div className="space-y-3">
  <div className="cosmic-skeleton h-4 w-3/4"></div>
  <div className="cosmic-skeleton h-4 w-full"></div>
  <div className="cosmic-skeleton h-4 w-5/6"></div>
</div>

// Content loader
<div className="cosmic-loading-pulse min-h-[200px] rounded-xl">
  <p className="text-center text-text-dim">Loading...</p>
</div>
```

## Performance Notes

- All animations use CSS `transform` and `opacity` for GPU acceleration
- Animations respect `prefers-reduced-motion` setting
- Background starfield is fixed position with low opacity (no performance impact)
- Aurora animations run at 20-25s duration (very smooth)

## Customization

All cosmic effects use your existing design tokens:
- `--accent` (#8a5cff) - Nebula Violet
- `--accent-2` (#4de8e4) - Plasma Teal
- `--accent-3` (#D064FF) - Magenta Glow
- `--bg-0`, `--bg-1`, `--bg-2` - Dark cosmic backgrounds

## Browser Support

All effects work in modern browsers:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

Gracefully degrades in older browsers (effects don't show, but content remains accessible).

---

**Pro Tip:** Start by adding `cosmic-card` and `cosmic-border` to your main cards, then gradually add `cosmic-lift` and `cosmic-glow` to interactive elements!
