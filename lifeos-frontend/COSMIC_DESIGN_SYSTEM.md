# Quanta - Cosmic Dark UI Design System

## Overview
This design system combines minimal design principles with subtle cosmic aesthetics to create a visually stunning, highly functional dark mode interface for the Quanta life operating system. Inspired by best-in-class dark mode implementations (Linear, Stripe, Vercel, GitHub) with cosmic visual elements that enhance rather than distract.

---

## 1. COLOR PALETTE

### Background Colors
```css
/* Base Backgrounds */
--bg-primary: #0a0a0a;           /* Main background - near-black for OLED optimization */
--bg-secondary: #121212;         /* Elevated surfaces - Material Design standard */
--bg-tertiary: #1a1a1a;          /* Higher elevation cards/modals */
--bg-quaternary: #222222;        /* Highest elevation elements */

/* Cosmic Background Overlays */
--bg-cosmic-overlay: linear-gradient(135deg,
  rgba(139, 92, 246, 0.03) 0%,   /* Violet tint */
  rgba(59, 130, 246, 0.02) 50%,  /* Blue tint */
  rgba(236, 72, 153, 0.02) 100%  /* Pink tint */
);

--bg-cosmic-subtle: linear-gradient(180deg,
  rgba(42, 0, 141, 0.05) 0%,     /* Deep space violet */
  rgba(10, 10, 10, 0) 100%
);
```

### Text Colors (Material Design Opacity System)
```css
/* White text with varying opacity levels */
--text-primary: rgba(255, 255, 255, 0.87);    /* High-emphasis (87%) */
--text-secondary: rgba(255, 255, 255, 0.60);  /* Medium-emphasis (60%) */
--text-tertiary: rgba(255, 255, 255, 0.38);   /* Disabled/subtle (38%) */
--text-inverse: rgba(0, 0, 0, 0.87);          /* For light backgrounds */

/* Off-white alternatives (softer on eyes) */
--text-soft: #e0e0e0;            /* Softer alternative to pure white */
--text-muted: #a0a0a0;           /* Muted text */
--text-disabled: #666666;        /* Disabled state */
```

### Cosmic Accent Colors
```css
/* Primary Cosmic Purple */
--cosmic-purple-50: #f5f3ff;
--cosmic-purple-100: #ede9fe;
--cosmic-purple-200: #ddd6fe;
--cosmic-purple-300: #c4b5fd;
--cosmic-purple-400: #a78bfa;
--cosmic-purple-500: #8b5cf6;    /* Primary accent */
--cosmic-purple-600: #7c3aed;
--cosmic-purple-700: #6d28d9;
--cosmic-purple-800: #5b21b6;
--cosmic-purple-900: #4c1d95;

/* Nebula Blue */
--nebula-blue-400: #60a5fa;
--nebula-blue-500: #3b82f6;      /* Secondary accent */
--nebula-blue-600: #2563eb;
--nebula-blue-700: #1d4ed8;

/* Stellar Pink */
--stellar-pink-400: #f472b6;
--stellar-pink-500: #ec4899;     /* Tertiary accent */
--stellar-pink-600: #db2777;

/* Galactic Teal */
--galactic-teal-400: #2dd4bf;
--galactic-teal-500: #14b8a6;    /* Quaternary accent */
--galactic-teal-600: #0d9488;
```

### Semantic Colors
```css
/* Success (Galactic Teal) */
--color-success: #14b8a6;
--color-success-bg: rgba(20, 184, 166, 0.1);
--color-success-border: rgba(20, 184, 166, 0.3);

/* Error (Stellar Pink) */
--color-error: #ef4444;
--color-error-bg: rgba(239, 68, 68, 0.1);
--color-error-border: rgba(239, 68, 68, 0.3);

/* Warning (Amber) */
--color-warning: #f59e0b;
--color-warning-bg: rgba(245, 158, 11, 0.1);
--color-warning-border: rgba(245, 158, 11, 0.3);

/* Info (Nebula Blue) */
--color-info: #3b82f6;
--color-info-bg: rgba(59, 130, 246, 0.1);
--color-info-border: rgba(59, 130, 246, 0.3);
```

### Border Colors
```css
--border-primary: rgba(255, 255, 255, 0.08);   /* Subtle borders */
--border-secondary: rgba(255, 255, 255, 0.12); /* More visible borders */
--border-focus: rgba(139, 92, 246, 0.5);       /* Focus state */
--border-hover: rgba(255, 255, 255, 0.16);     /* Hover state */
```

### WCAG Compliance Notes
- Background #121212 with text at 87% white opacity achieves 14.4:1 contrast ratio (exceeds AAA standard of 7:1)
- All accent colors tested against dark backgrounds maintain minimum 4.5:1 for normal text
- Focus indicators use 3:1 minimum contrast against adjacent colors

---

## 2. TYPOGRAPHY SYSTEM

### Font Families
```css
/* Primary: Inter - Modern, highly readable, variable font */
--font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Monospace: For code, data, timestamps */
--font-mono: 'JetBrains Mono', 'Fira Code', 'Monaco', 'Courier New', monospace;

/* Enable Inter's advanced features */
font-feature-settings: 'cv05' 1, 'cv08' 1, 'cv11' 1;
```

### Type Scale (1.25 Major Third Ratio, 16px base)
```css
--text-xs: 0.75rem;      /* 12px - Tiny labels, metadata */
--text-sm: 0.875rem;     /* 14px - Small body text, secondary info */
--text-base: 1rem;       /* 16px - Base body text */
--text-lg: 1.125rem;     /* 18px - Emphasized text */
--text-xl: 1.25rem;      /* 20px - Small headings */
--text-2xl: 1.5rem;      /* 24px - Section headings */
--text-3xl: 1.875rem;    /* 30px - Page headings */
--text-4xl: 2.25rem;     /* 36px - Hero headings */
--text-5xl: 3rem;        /* 48px - Large display text */
```

### Font Weights
```css
--font-light: 300;       /* Rarely used, only for very large text */
--font-regular: 400;     /* Body text */
--font-medium: 500;      /* Emphasized text, buttons */
--font-semibold: 600;    /* Headings, important labels */
--font-bold: 700;        /* Strong emphasis, hero text */
```

### Line Heights
```css
--leading-tight: 1.25;   /* For headings */
--leading-snug: 1.375;   /* For subheadings */
--leading-normal: 1.5;   /* For body text (optimal readability) */
--leading-relaxed: 1.625;/* For long-form content */
--leading-loose: 2;      /* For very spacious layouts */
```

### Letter Spacing (Dark Mode Optimized)
```css
/* Dark mode requires slightly increased letter spacing for readability */
--tracking-tighter: -0.05em;  /* For very large headings */
--tracking-tight: -0.025em;   /* For headings */
--tracking-normal: 0;         /* For most text */
--tracking-wide: 0.025em;     /* For body text in dark mode (recommended) */
--tracking-wider: 0.05em;     /* For uppercase text */
--tracking-widest: 0.1em;     /* For all-caps labels */
```

### Typography Usage Examples
```css
/* Hero Heading */
.hero-heading {
  font-size: var(--text-5xl);
  font-weight: var(--font-bold);
  line-height: var(--leading-tight);
  letter-spacing: var(--tracking-tight);
  color: var(--text-primary);
}

/* Section Heading */
.section-heading {
  font-size: var(--text-2xl);
  font-weight: var(--font-semibold);
  line-height: var(--leading-snug);
  letter-spacing: var(--tracking-normal);
  color: var(--text-primary);
}

/* Body Text */
.body-text {
  font-size: var(--text-base);
  font-weight: var(--font-regular);
  line-height: var(--leading-normal);
  letter-spacing: var(--tracking-wide);  /* Increased for dark mode */
  color: var(--text-primary);
}

/* Small Text / Caption */
.caption {
  font-size: var(--text-sm);
  font-weight: var(--font-regular);
  line-height: var(--leading-normal);
  letter-spacing: var(--tracking-wide);
  color: var(--text-secondary);
}
```

---

## 3. SPACING SYSTEM

### Base Unit: 4px
All spacing is a multiple of 4px for perfect visual harmony and consistent rhythm.

```css
--space-0: 0;
--space-1: 0.25rem;    /* 4px  - Minimal spacing */
--space-2: 0.5rem;     /* 8px  - Tight spacing */
--space-3: 0.75rem;    /* 12px - Small spacing */
--space-4: 1rem;       /* 16px - Base spacing */
--space-5: 1.25rem;    /* 20px - Medium spacing */
--space-6: 1.5rem;     /* 24px - Large spacing */
--space-8: 2rem;       /* 32px - XL spacing */
--space-10: 2.5rem;    /* 40px - 2XL spacing */
--space-12: 3rem;      /* 48px - 3XL spacing */
--space-16: 4rem;      /* 64px - 4XL spacing */
--space-20: 5rem;      /* 80px - 5XL spacing */
--space-24: 6rem;      /* 96px - 6XL spacing */
```

### Component Padding Standards
```css
/* Buttons */
--padding-btn-sm: var(--space-2) var(--space-3);      /* 8px 12px */
--padding-btn-md: var(--space-3) var(--space-4);      /* 12px 16px */
--padding-btn-lg: var(--space-4) var(--space-6);      /* 16px 24px */

/* Cards */
--padding-card-sm: var(--space-4);                    /* 16px */
--padding-card-md: var(--space-6);                    /* 24px */
--padding-card-lg: var(--space-8);                    /* 32px */

/* Input Fields */
--padding-input-sm: var(--space-2) var(--space-3);    /* 8px 12px */
--padding-input-md: var(--space-3) var(--space-4);    /* 12px 16px */
--padding-input-lg: var(--space-4) var(--space-5);    /* 16px 20px */

/* Modals */
--padding-modal: var(--space-6);                      /* 24px */
--padding-modal-lg: var(--space-8);                   /* 32px */
```

### Gap Sizes (for Flexbox/Grid)
```css
--gap-xs: var(--space-1);    /* 4px */
--gap-sm: var(--space-2);    /* 8px */
--gap-md: var(--space-4);    /* 16px */
--gap-lg: var(--space-6);    /* 24px */
--gap-xl: var(--space-8);    /* 32px */
```

---

## 4. COMPONENT STYLES

### Cards

#### Basic Card
```css
.card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  padding: var(--padding-card-md);
  transition: all 200ms var(--ease-out);
}

.card:hover {
  background: var(--bg-tertiary);
  border-color: var(--border-secondary);
  transform: translateY(-1px);
}
```

#### Elevated Card (Lighter Background for Depth)
```css
.card-elevated {
  background: var(--bg-tertiary);
  border: 1px solid var(--border-secondary);
  border-radius: var(--radius-lg);
  padding: var(--padding-card-md);
  /* In dark mode, use lighter backgrounds instead of shadows for elevation */
}

.card-elevated:hover {
  background: var(--bg-quaternary);
}
```

#### Cosmic Card (with subtle gradient)
```css
.card-cosmic {
  background: linear-gradient(
    135deg,
    var(--bg-secondary) 0%,
    var(--bg-tertiary) 100%
  );
  border: 1px solid rgba(139, 92, 246, 0.2);  /* Purple border */
  border-radius: var(--radius-lg);
  padding: var(--padding-card-md);
  position: relative;
  overflow: hidden;
}

.card-cosmic::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--bg-cosmic-overlay);
  pointer-events: none;
}
```

### Buttons

#### Primary Button
```css
.btn-primary {
  background: var(--cosmic-purple-500);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  padding: var(--padding-btn-md);
  font-weight: var(--font-medium);
  font-size: var(--text-sm);
  cursor: pointer;
  transition: all 150ms var(--ease-out);
}

.btn-primary:hover {
  background: var(--cosmic-purple-600);
  box-shadow: 0 0 20px rgba(139, 92, 246, 0.4);  /* Subtle glow */
  transform: translateY(-1px);
}

.btn-primary:active {
  transform: translateY(0);
}

.btn-primary:focus-visible {
  outline: 3px solid var(--border-focus);
  outline-offset: 2px;
}
```

#### Secondary Button
```css
.btn-secondary {
  background: transparent;
  color: var(--text-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  padding: var(--padding-btn-md);
  font-weight: var(--font-medium);
  font-size: var(--text-sm);
  cursor: pointer;
  transition: all 150ms var(--ease-out);
}

.btn-secondary:hover {
  background: var(--bg-tertiary);
  border-color: var(--border-secondary);
}
```

#### Ghost Button
```css
.btn-ghost {
  background: transparent;
  color: var(--text-secondary);
  border: none;
  border-radius: var(--radius-md);
  padding: var(--padding-btn-md);
  font-weight: var(--font-medium);
  font-size: var(--text-sm);
  cursor: pointer;
  transition: all 150ms var(--ease-out);
}

.btn-ghost:hover {
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-primary);
}
```

### Input Fields

#### Text Input
```css
.input {
  background: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  padding: var(--padding-input-md);
  font-size: var(--text-base);
  font-family: var(--font-primary);
  transition: all 150ms var(--ease-out);
  width: 100%;
}

.input::placeholder {
  color: var(--text-tertiary);
}

.input:hover {
  border-color: var(--border-hover);
}

.input:focus {
  outline: none;
  border-color: var(--cosmic-purple-500);
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
}

.input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Error State */
.input.error {
  border-color: var(--color-error);
}

.input.error:focus {
  box-shadow: 0 0 0 3px var(--color-error-bg);
}
```

### Badges/Tags/Pills

#### Basic Badge
```css
.badge {
  display: inline-flex;
  align-items: center;
  padding: var(--space-1) var(--space-3);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  border-radius: var(--radius-full);
  letter-spacing: var(--tracking-wider);
  text-transform: uppercase;
}

/* Variants */
.badge-primary {
  background: rgba(139, 92, 246, 0.15);
  color: var(--cosmic-purple-400);
  border: 1px solid rgba(139, 92, 246, 0.3);
}

.badge-success {
  background: var(--color-success-bg);
  color: var(--color-success);
  border: 1px solid var(--color-success-border);
}

.badge-error {
  background: var(--color-error-bg);
  color: var(--color-error);
  border: 1px solid var(--color-error-border);
}

.badge-warning {
  background: var(--color-warning-bg);
  color: var(--color-warning);
  border: 1px solid var(--color-warning-border);
}

/* Subtle variant (no border) */
.badge-subtle {
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-secondary);
  border: none;
}
```

### Modal/Dialog

#### Modal Container
```css
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);  /* Darker in dark mode */
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 200ms var(--ease-out);
}

.modal {
  background: var(--bg-tertiary);
  border: 1px solid var(--border-secondary);
  border-radius: var(--radius-xl);
  padding: var(--padding-modal-lg);
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideUp 300ms var(--ease-out);
}

.modal-header {
  font-size: var(--text-2xl);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin-bottom: var(--space-6);
}

.modal-content {
  color: var(--text-secondary);
  line-height: var(--leading-relaxed);
}

.modal-footer {
  margin-top: var(--space-6);
  display: flex;
  gap: var(--gap-md);
  justify-content: flex-end;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

---

## 5. COSMIC EFFECTS

### Subtle Background Gradient (Page Level)
```css
.cosmic-background {
  background: var(--bg-primary);
  position: relative;
}

.cosmic-background::before {
  content: '';
  position: fixed;
  inset: 0;
  background: radial-gradient(
    ellipse 80% 50% at 50% -20%,
    rgba(139, 92, 246, 0.08) 0%,
    transparent 60%
  );
  pointer-events: none;
  z-index: 0;
}
```

### Nebula Glow Effect (Hero Sections)
```css
.nebula-glow {
  position: relative;
}

.nebula-glow::before {
  content: '';
  position: absolute;
  top: -50%;
  left: 50%;
  transform: translateX(-50%);
  width: 200%;
  height: 200%;
  background: radial-gradient(
    circle,
    rgba(139, 92, 246, 0.15) 0%,
    rgba(59, 130, 246, 0.1) 30%,
    transparent 70%
  );
  filter: blur(60px);
  opacity: 0.4;
  pointer-events: none;
  z-index: -1;
}
```

### Subtle Button Glow (Hover State)
```css
.btn-cosmic-glow:hover {
  box-shadow:
    0 0 20px rgba(139, 92, 246, 0.3),
    0 0 40px rgba(139, 92, 246, 0.15);
}
```

### Card Border Glow (Hover State)
```css
.card-glow {
  border: 1px solid var(--border-primary);
  transition: all 300ms var(--ease-out);
}

.card-glow:hover {
  border-color: rgba(139, 92, 246, 0.5);
  box-shadow:
    0 0 20px rgba(139, 92, 246, 0.15),
    inset 0 0 20px rgba(139, 92, 246, 0.05);
}
```

### Particle/Star Background (Subtle, Canvas-based)
Use lightweight Canvas implementation for performance:

```javascript
// Minimal star field - max 50 stars on desktop, 25 on mobile
// Small stars (1-2px), slow movement (0.1-0.3px per frame)
// Opacity range: 0.2-0.6 for subtlety
// Color: white with slight purple tint (#f0e8ff)
// Performance: requestAnimationFrame, pause when tab inactive
```

### Glassmorphism (Use Sparingly)
```css
.glass {
  background: rgba(18, 18, 18, 0.4);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-lg);
}

/* Performance note: Use only for key UI elements (modals, dropdowns)
   Avoid on large surfaces or multiple elements */
```

---

## 6. ANIMATION STANDARDS

### Duration Values
```css
--duration-instant: 100ms;   /* Immediate feedback (tooltips) */
--duration-fast: 150ms;      /* Quick interactions (hover states) */
--duration-normal: 200ms;    /* Standard transitions (buttons) */
--duration-medium: 300ms;    /* Noticeable animations (modals) */
--duration-slow: 500ms;      /* Deliberate animations (page transitions) */
```

### Easing Functions
```css
--ease-linear: linear;
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);          /* Most common - natural deceleration */
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
--ease-smooth: cubic-bezier(0.4, 0, 0.6, 1);     /* Subtle, smooth */
```

### What Should Animate

**Always Animate:**
- Button hover states (150ms)
- Input focus states (150ms)
- Card hover elevation (200ms)
- Modal entrance/exit (300ms)
- Dropdown open/close (200ms)
- Page transitions (300ms)

**Never Animate:**
- Text color changes (instant)
- Layout shifts (jarring)
- Loading states that appear within 100ms
- Disabled state transitions

**Accessibility:**
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Common Animation Patterns

#### Fade In
```css
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.fade-in {
  animation: fadeIn var(--duration-medium) var(--ease-out);
}
```

#### Slide Up
```css
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.slide-up {
  animation: slideUp var(--duration-medium) var(--ease-out);
}
```

#### Pulse (Subtle, for notifications)
```css
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.pulse {
  animation: pulse 2s var(--ease-in-out) infinite;
}
```

---

## 7. CONSISTENCY RULES

### Border Radius Standards
```css
--radius-none: 0;
--radius-sm: 0.25rem;    /* 4px  - Small elements, badges */
--radius-md: 0.5rem;     /* 8px  - Buttons, inputs */
--radius-lg: 0.75rem;    /* 12px - Cards, large buttons */
--radius-xl: 1rem;       /* 16px - Modals, panels */
--radius-2xl: 1.5rem;    /* 24px - Hero cards */
--radius-full: 9999px;   /* Pills, circular buttons */
```

**Nested Border Radius Rule:**
If outer container has 16px radius with 8px padding, inner element should have 8px radius (outer - padding).

### Icon Sizes
```css
--icon-xs: 12px;
--icon-sm: 16px;
--icon-md: 20px;    /* Most common */
--icon-lg: 24px;
--icon-xl: 32px;
--icon-2xl: 48px;
```

Match icon size to adjacent text size:
- 12px text → 16px icon
- 14px text → 16px icon
- 16px text → 20px icon
- 20px text → 24px icon

### Elevation System (Dark Mode - Use Lighter Backgrounds)
Instead of shadows, use progressively lighter backgrounds:

```css
--elevation-0: var(--bg-primary);      /* #0a0a0a - Base surface */
--elevation-1: var(--bg-secondary);    /* #121212 - Raised 1 level */
--elevation-2: var(--bg-tertiary);     /* #1a1a1a - Raised 2 levels */
--elevation-3: var(--bg-quaternary);   /* #222222 - Raised 3 levels */
```

Shadows should be used sparingly and only for:
- Dropdowns/menus (subtle, for depth)
- Modals (to separate from content)
- Tooltips (to lift above content)

```css
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.3);
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.4);
--shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.5);
```

### Z-Index Scale
```css
--z-base: 0;
--z-dropdown: 1000;
--z-sticky: 1020;
--z-fixed: 1030;
--z-modal-backdrop: 1040;
--z-modal: 1050;
--z-popover: 1060;
--z-tooltip: 1070;
```

### Data Density Levels

**Compact (High Density)**
- Padding: var(--space-2) var(--space-3)
- Gap: var(--gap-xs)
- Font size: var(--text-sm)
- Line height: var(--leading-snug)
- Use for: Tables, lists with many items

**Normal (Medium Density)**
- Padding: var(--space-3) var(--space-4)
- Gap: var(--gap-sm)
- Font size: var(--text-base)
- Line height: var(--leading-normal)
- Use for: Standard forms, cards, most UI

**Comfortable (Low Density)**
- Padding: var(--space-4) var(--space-6)
- Gap: var(--gap-md)
- Font size: var(--text-lg)
- Line height: var(--leading-relaxed)
- Use for: Hero sections, featured content

---

## 8. NAVIGATION PATTERNS

### Sidebar Navigation
```css
.sidebar {
  width: 240px;
  background: var(--bg-secondary);
  border-right: 1px solid var(--border-primary);
  padding: var(--space-6);
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: var(--gap-sm);
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  transition: all var(--duration-fast) var(--ease-out);
  cursor: pointer;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-primary);
}

.nav-item.active {
  background: rgba(139, 92, 246, 0.15);
  color: var(--cosmic-purple-400);
}

.nav-item-icon {
  width: var(--icon-md);
  height: var(--icon-md);
}
```

### Top Bar
```css
.topbar {
  height: 64px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-primary);
  padding: 0 var(--space-6);
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
}
```

### Module Color Coding
Assign each of the 8 modules a subtle accent color:

```css
--module-dashboard: var(--cosmic-purple-500);     /* Purple */
--module-productivity: var(--nebula-blue-500);    /* Blue */
--module-fitness: var(--color-success);           /* Teal */
--module-knowledge: var(--stellar-pink-500);      /* Pink */
--module-journal: var(--color-warning);           /* Amber */
--module-calendar: var(--galactic-teal-500);      /* Teal */
--module-skills: var(--cosmic-purple-600);        /* Deep Purple */
--module-financial: var(--color-success);         /* Green */
```

Use as accent on:
- Active nav state
- Module page headers
- Data visualization colors
- Badge/tag colors for categorization

---

## 9. PERFORMANCE CONSIDERATIONS

### Expensive Effects to Minimize

**High Cost (Use Sparingly):**
- `backdrop-filter: blur()` - GPU intensive, limit to modals/dropdowns only
- `filter: blur()` with large radius - Use max 10px blur
- Multiple layered `box-shadow` - Maximum 2-3 shadows per element
- Animating `filter` or `backdrop-filter` - Use only for critical interactions

**Optimization Strategies:**
```css
/* Good: Animate transform and opacity (GPU accelerated) */
.optimized {
  transition: transform 200ms, opacity 200ms;
}

.optimized:hover {
  transform: translateY(-2px);
  opacity: 0.9;
}

/* Bad: Animate width, height, or margin (causes reflow) */
.not-optimized {
  transition: width 200ms, margin 200ms;
}
```

### Canvas Performance for Particles
- Desktop: Maximum 50 particles
- Mobile: Maximum 25 particles
- Particle size: 1-2px only
- Movement speed: 0.1-0.3px per frame
- Use `requestAnimationFrame`
- Pause animation when tab inactive
- Clear and redraw entire canvas each frame (faster than tracking individual particles)

### Image Optimization
- Use WebP format with fallback
- Lazy load images below fold
- Use CSS for simple gradients instead of images
- Optimize SVG icons (remove unnecessary paths)

### CSS Architecture
```css
/* Group related properties for better compression */
.component {
  /* Positioning */
  position: relative;
  top: 0;
  left: 0;

  /* Display & Box Model */
  display: flex;
  width: 100%;
  padding: var(--space-4);

  /* Visual */
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);

  /* Typography */
  font-size: var(--text-base);
  color: var(--text-primary);

  /* Animation */
  transition: all var(--duration-normal) var(--ease-out);
}
```

---

## 10. IMPLEMENTATION WITH TAILWIND CSS

### Configuration Setup

```javascript
// tailwind.config.js
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Backgrounds
        'bg-primary': '#0a0a0a',
        'bg-secondary': '#121212',
        'bg-tertiary': '#1a1a1a',
        'bg-quaternary': '#222222',

        // Cosmic Colors
        cosmic: {
          purple: {
            400: '#a78bfa',
            500: '#8b5cf6',
            600: '#7c3aed',
            700: '#6d28d9',
          },
          blue: {
            400: '#60a5fa',
            500: '#3b82f6',
            600: '#2563eb',
          },
          pink: {
            400: '#f472b6',
            500: '#ec4899',
            600: '#db2777',
          },
          teal: {
            400: '#2dd4bf',
            500: '#14b8a6',
            600: '#0d9488',
          },
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1.5' }],
        sm: ['0.875rem', { lineHeight: '1.5' }],
        base: ['1rem', { lineHeight: '1.5', letterSpacing: '0.025em' }],
        lg: ['1.125rem', { lineHeight: '1.5' }],
        xl: ['1.25rem', { lineHeight: '1.375' }],
        '2xl': ['1.5rem', { lineHeight: '1.375' }],
        '3xl': ['1.875rem', { lineHeight: '1.25' }],
        '4xl': ['2.25rem', { lineHeight: '1.25' }],
        '5xl': ['3rem', { lineHeight: '1.25' }],
      },
      spacing: {
        // 4px base
        0: '0',
        1: '0.25rem',
        2: '0.5rem',
        3: '0.75rem',
        4: '1rem',
        5: '1.25rem',
        6: '1.5rem',
        8: '2rem',
        10: '2.5rem',
        12: '3rem',
        16: '4rem',
        20: '5rem',
        24: '6rem',
      },
      borderRadius: {
        none: '0',
        sm: '0.25rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
        '2xl': '1.5rem',
        full: '9999px',
      },
      transitionDuration: {
        instant: '100ms',
        fast: '150ms',
        normal: '200ms',
        medium: '300ms',
        slow: '500ms',
      },
      transitionTimingFunction: {
        'ease-smooth': 'cubic-bezier(0.4, 0, 0.6, 1)',
      },
    },
  },
  plugins: [],
};
```

### CSS Variables Implementation

```css
/* globals.css */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

:root {
  /* Colors */
  --bg-primary: #0a0a0a;
  --bg-secondary: #121212;
  --bg-tertiary: #1a1a1a;
  --bg-quaternary: #222222;

  --text-primary: rgba(255, 255, 255, 0.87);
  --text-secondary: rgba(255, 255, 255, 0.60);
  --text-tertiary: rgba(255, 255, 255, 0.38);

  --border-primary: rgba(255, 255, 255, 0.08);
  --border-secondary: rgba(255, 255, 255, 0.12);
  --border-focus: rgba(139, 92, 246, 0.5);

  /* Spacing */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-6: 1.5rem;
  --space-8: 2rem;

  /* Animation */
  --duration-fast: 150ms;
  --duration-normal: 200ms;
  --duration-medium: 300ms;
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  background: var(--bg-primary);
  color: var(--text-primary);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 16px;
  line-height: 1.5;
  letter-spacing: 0.025em;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Inter font features for better readability */
@supports (font-variation-settings: normal) {
  body {
    font-family: 'Inter var', sans-serif;
    font-feature-settings: 'cv05' 1, 'cv08' 1, 'cv11' 1;
  }
}
```

---

## 11. EXAMPLES FROM RESEARCH

### What Works (Inspiration)

**Linear (Project Management)**
- Pure black sidebar (#000000) with subtle hover states
- Command+K modal slightly lighter than background for prominence
- Minimal color palette: mostly grays with purple accent
- Lightning-fast animations (sub-150ms)
- Perfect keyboard navigation
- **Takeaway:** Restraint in color usage, prioritize speed

**GitHub Dark Mode**
- Uses #0d1117 (very dark blue-tinted background)
- Primer color system with consistent naming
- Excellent contrast ratios (WCAG AAA compliant)
- Subtle borders instead of heavy shadows
- **Takeaway:** Professional, accessible, systematic approach

**Stripe Dashboard**
- Dark gray (#0A2540) with blue undertones
- Elevated cards use lighter backgrounds for depth
- Smooth, purposeful animations
- Data visualization with carefully chosen accent colors
- **Takeaway:** Financial data looks trustworthy and clear

**Vercel (Geist Design System)**
- True black (#000) for OLED optimization
- Stark black/white contrast for modern edge
- Minimal design, maximum clarity
- Clean typography hierarchy
- **Takeaway:** Modern, technical, developer-focused aesthetic

**Obsidian (Minimal Theme)**
- True black option for OLED
- High contrast and low contrast variants
- Customizable through settings plugin
- Clean, Apple-like aesthetic
- **Takeaway:** User customization options are valuable

**Raycast**
- Dynamic color system adapts to theme
- High contrast automatically applied
- Theme explorer with hundreds of options
- System appearance integration
- **Takeaway:** Flexibility in theming, respect user preferences

### What to Avoid

**Common Dark Mode Mistakes:**
1. Pure white text (#FFFFFF) on pure black (#000000) - causes visual vibration and eye strain
2. Using drop shadows instead of elevation with lighter backgrounds
3. Too many glow effects - looks cheap and dated
4. Overly saturated accent colors - painful on dark backgrounds
5. Ignoring WCAG contrast requirements
6. Animating everything - overwhelming and slow
7. Heavy blur effects everywhere - kills performance
8. Cosmic effects that distract from content
9. Inconsistent spacing and typography
10. No consideration for reduced motion preferences

**Brutalist/Maximalist Pitfalls:**
- Heavy dark outlines on dark backgrounds (invisible)
- Clashing neon colors (accessibility nightmare)
- Chaotic layouts that sacrifice usability
- **Remember:** Function over form. Cosmic aesthetics should enhance, not hinder.

---

## 12. DESIGN PRINCIPLES SUMMARY

1. **Contrast is King:** Maintain WCAG AAA standards (7:1 for body text, 4.5:1 minimum)
2. **Restraint in Effects:** Cosmic elements should be subtle, not overwhelming
3. **Performance Matters:** Optimize animations, minimize expensive CSS properties
4. **Consistency Creates Calm:** Systematic spacing, typography, and colors
5. **Accessibility First:** Support keyboard navigation, screen readers, reduced motion
6. **Dark Mode Best Practices:** Lighter backgrounds for elevation, softer text colors
7. **Speed is a Feature:** Fast transitions (<200ms) feel more responsive
8. **Content First:** UI should fade into the background, let data shine
9. **Progressive Enhancement:** Core experience works without JS/fancy effects
10. **Test in Reality:** Verify on actual dark backgrounds, different screen brightnesses

---

## 13. IMPLEMENTATION CHECKLIST

### Phase 1: Foundation
- [ ] Set up Tailwind config with custom colors
- [ ] Add Inter font with proper features
- [ ] Create CSS variables for all design tokens
- [ ] Implement base typography styles
- [ ] Set up spacing scale
- [ ] Configure dark mode (class-based)

### Phase 2: Core Components
- [ ] Build button variants (primary, secondary, ghost)
- [ ] Create card components (basic, elevated, cosmic)
- [ ] Design input fields with all states (normal, hover, focus, error, disabled)
- [ ] Implement badges/tags/pills
- [ ] Build modal/dialog system
- [ ] Create navigation components (sidebar, topbar)

### Phase 3: Cosmic Polish
- [ ] Add subtle background gradient to pages
- [ ] Implement glow effects on hover (buttons, cards)
- [ ] Create nebula effect for hero sections
- [ ] Build lightweight star field (Canvas)
- [ ] Add glassmorphism to modals (performance tested)
- [ ] Test all effects on low-end devices

### Phase 4: Polish & Testing
- [ ] Verify WCAG contrast ratios for all color combinations
- [ ] Test keyboard navigation throughout
- [ ] Implement reduced motion preferences
- [ ] Optimize animation performance (60fps)
- [ ] Test on OLED displays
- [ ] Cross-browser testing (Chrome, Firefox, Safari)
- [ ] Mobile responsiveness check
- [ ] Performance audit (Lighthouse)

### Phase 5: Documentation
- [ ] Document all component variants
- [ ] Create usage guidelines
- [ ] Build component playground/storybook
- [ ] Write accessibility guidelines
- [ ] Create color palette reference
- [ ] Document animation standards

---

## Conclusion

This design system balances minimal design principles with cosmic aesthetics to create a unique, functional, and visually stunning dark mode experience for Quanta. The key is restraint: cosmic elements enhance the interface without overwhelming it. Every decision prioritizes usability, performance, and accessibility while maintaining a modern, technical aesthetic that appeals to power users.

**Remember:** The best UI is invisible. Let the cosmic effects add subtle beauty, but always let the user's data and productivity take center stage.

---

**Version:** 1.0
**Last Updated:** 2025-11-19
**Maintained by:** Quanta Development Team
