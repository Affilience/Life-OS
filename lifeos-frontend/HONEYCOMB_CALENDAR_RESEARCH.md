# Honeycomb Calendar UI - Comprehensive Research Document

## Table of Contents
1. [Hexagon Geometry & Mathematics](#hexagon-geometry--mathematics)
2. [Honeycomb Layout Patterns](#honeycomb-layout-patterns)
3. [Implementation Approaches](#implementation-approaches)
4. [Calendar-Specific Design](#calendar-specific-design)
5. [Code Examples & Patterns](#code-examples--patterns)
6. [Performance & Best Practices](#performance--best-practices)
7. [Accessibility Considerations](#accessibility-considerations)
8. [Recommended Implementation Strategy](#recommended-implementation-strategy)

---

## 1. Hexagon Geometry & Mathematics

### 1.1 Basic Hexagon Properties

A regular hexagon has:
- **6 equal sides**
- **6 vertices (corners)**
- **Internal angles**: 120° each
- **External angles**: 60° each

### 1.2 Dimensional Formulas

For a hexagon with **outer radius (circumradius) = `size`**:

```
Inner radius (inradius) = size × √3/2
```

**Flat-top orientation:**
```
Width  = 2 × size
Height = √3 × size = size × 1.732
```

**Pointy-top orientation:**
```
Width  = √3 × size = size × 1.732
Height = 2 × size
```

### 1.3 Key Mathematical Constants

```javascript
// Core constants for hexagon calculations
const SQRT3 = Math.sqrt(3);        // ≈ 1.732
const COS_30 = Math.cos(Math.PI/6); // ≈ 0.866 = √3/2
const SIN_60 = Math.sin(Math.PI/3); // ≈ 0.866 = √3/2
const TAN_30 = Math.tan(Math.PI/6); // ≈ 0.577 = 1/√3

// Modern CSS uses these directly:
// cos(30deg) = 0.866
// 1/cos(30deg) = 1.1547
// tan(30deg)/2 = 0.2885
```

### 1.4 Grid Spacing Formulas

**Flat-top orientation spacing:**
```javascript
horizontal_spacing = 3/2 × size
vertical_spacing = √3 × size
```

**Pointy-top orientation spacing:**
```javascript
horizontal_spacing = √3 × size
vertical_spacing = 3/2 × size
```

### 1.5 Hexagon Corner Positions

Calculate corner coordinates using 60° wedges:

```javascript
// Flat-top corners at: 0°, 60°, 120°, 180°, 240°, 300°
// Pointy-top corners at: 30°, 90°, 150°, 210°, 270°, 330°

function getHexagonCorners(centerX, centerY, size, pointyTop = false) {
  const corners = [];
  const angleOffset = pointyTop ? 30 : 0;

  for (let i = 0; i < 6; i++) {
    const angleDeg = 60 * i + angleOffset;
    const angleRad = (Math.PI / 180) * angleDeg;
    corners.push({
      x: centerX + size * Math.cos(angleRad),
      y: centerY + size * Math.sin(angleRad)
    });
  }

  return corners;
}
```

### 1.6 SVG Polygon Point Calculation

**Pointy-top hexagon:**
```javascript
function getPointyTopPoints(x, y, r) {
  const points = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i; // 60° in radians
    points.push({
      x: x + r * Math.cos(angle),
      y: y + r * Math.sin(angle)
    });
  }
  return points;
}
```

**Flat-top hexagon:**
```javascript
function getFlatTopPoints(x, y, r) {
  const points = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - (Math.PI / 6); // Rotated 30°
    points.push({
      x: x + r * Math.cos(angle),
      y: y + r * Math.sin(angle)
    });
  }
  return points;
}
```

---

## 2. Honeycomb Layout Patterns

### 2.1 Coordinate Systems

There are several coordinate systems for hexagonal grids:

#### A. Offset Coordinates (Traditional Row/Column)
- **odd-r, even-r**: Pointy-top hexagons with vertical offset
- **odd-q, even-q**: Flat-top hexagons with horizontal offset
- **Limitation**: Cannot perform safe vector addition/subtraction

#### B. Axial Coordinates (Recommended)
- Uses two coordinates: `(q, r)`
- Allows vector operations
- More intuitive than cube coordinates
- Best for algorithms and storage

```javascript
// Offset to Axial conversion (horizontal alignment)
function offsetToAxial(col, row) {
  const q = col;
  const r = row - Math.floor(col / 2);
  return { q, r };
}

// Axial to Offset conversion
function axialToOffset(q, r) {
  const col = q;
  const row = r + Math.floor(q / 2);
  return { col, row };
}
```

#### C. Cube Coordinates (Mathematical)
- Uses three coordinates: `(q, r, s)` with constraint `q + r + s = 0`
- Enables standard 3D vector operations
- Best for algorithms requiring symmetry

```javascript
function axialToCube(q, r) {
  return {
    q: q,
    r: r,
    s: -q - r
  };
}

function cubeToAxial(q, r, s) {
  return { q, r };
}
```

### 2.2 Grid Arrangement Patterns

#### Rectangular Grid (Most Common for Calendars)
```javascript
// Generate rectangular hex grid
function createRectangleGrid(width, height, hexSize) {
  const hexagons = [];
  const h = hexSize * Math.sqrt(3);

  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      const x = col * 1.5 * hexSize + (row % 2) * 0.75 * hexSize;
      const y = row * h;
      hexagons.push({ x, y, col, row });
    }
  }

  return hexagons;
}
```

#### Spiral Pattern (Organic Look)
```javascript
// Generate spiral from center
function createSpiralGrid(radius) {
  const hexagons = [{ q: 0, r: 0 }]; // Start at center

  for (let ring = 1; ring <= radius; ring++) {
    let q = 0;
    let r = -ring;

    // Walk around the ring
    for (let side = 0; side < 6; side++) {
      for (let step = 0; step < ring; step++) {
        hexagons.push({ q, r });
        // Move to next hex based on direction
        const direction = DIRECTION_VECTORS[side];
        q += direction.q;
        r += direction.r;
      }
    }
  }

  return hexagons;
}
```

### 2.3 Organic/Scattered Patterns

For non-uniform honeycomb patterns:

```javascript
// Create organic cluster by varying sizes
function createOrganicPattern(count, baseSize) {
  const hexagons = [];
  const variations = [0.7, 0.85, 1.0, 1.15, 1.3]; // Size multipliers

  for (let i = 0; i < count; i++) {
    const sizeVariation = variations[Math.floor(Math.random() * variations.length)];
    const size = baseSize * sizeVariation;

    // Use Poisson disk sampling or similar for natural spacing
    const position = calculateNaturalPosition(i, hexagons);

    hexagons.push({
      ...position,
      size,
      sizeMultiplier: sizeVariation
    });
  }

  return hexagons;
}
```

### 2.4 Calendar-Optimized Layouts

For arranging 28-31 days:

**Option 1: 5×6 Rectangle Grid (30 hexagons)**
```
Week structure (5 columns × 6 rows)
Offset every other row for honeycomb effect
Disable unused hexagons for months < 30 days
```

**Option 2: Hexagonal Cluster (7 rings = 37 hexagons)**
```
Center: Day 1
Ring 1: Days 2-7 (6 hexagons)
Ring 2: Days 8-19 (12 hexagons)
Ring 3: Days 20-31 (12 hexagons)
```

**Option 3: Spiral Layout (Organic Feel)**
```
Start from center and spiral outward
Creates natural, flowing calendar
Each month can have different rotation/orientation
```

---

## 3. Implementation Approaches

### 3.1 CSS clip-path Method (Modern & Recommended)

**Modern 4-Point Technique:**
```css
.hexagon {
  /* Aspect ratio for perfect proportions */
  aspect-ratio: 1/cos(30deg);

  /* Simple 4-point polygon */
  clip-path: polygon(50% -50%, 100% 50%, 50% 150%, 0 50%);

  /* Allow overflow for content */
  overflow: hidden;
}

/* Rotated variant (flat-top) */
.hexagon-flat {
  aspect-ratio: cos(30deg);
  clip-path: polygon(-50% 50%, 50% 100%, 150% 50%, 50% 0);
}
```

**Traditional 6-Point Method:**
```css
.hexagon-traditional {
  width: 100px;
  height: 115.47px; /* width * 1.1547 */
  clip-path: polygon(
    50% 0%,     /* Top */
    100% 25%,   /* Top-right */
    100% 75%,   /* Bottom-right */
    50% 100%,   /* Bottom */
    0% 75%,     /* Bottom-left */
    0% 25%      /* Top-left */
  );
}
```

**Advantages:**
- Clean, modern approach
- No magic numbers (uses trigonometry)
- Works with any content type
- Perfect click/hover areas
- Mobile/touch-friendly

### 3.2 SVG Polygon Method

**React Component Example:**
```jsx
const Hexagon = ({ x, y, size, className, children, onClick }) => {
  const points = useMemo(() => {
    const pts = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i;
      pts.push([
        x + size * Math.cos(angle),
        y + size * Math.sin(angle)
      ]);
    }
    return pts.map(p => p.join(',')).join(' ');
  }, [x, y, size]);

  return (
    <g onClick={onClick}>
      <polygon
        points={points}
        className={className}
      />
      {children}
    </g>
  );
};

// Usage
<svg viewBox="0 0 800 600">
  <Hexagon x={100} y={100} size={50} className="day-hexagon">
    <text x={100} y={100} textAnchor="middle">15</text>
  </Hexagon>
</svg>
```

**Advantages:**
- Precise control
- Easy to add text/icons
- Scalable
- Good for 40 elements
- Clean event handling

### 3.3 Canvas Method

**Drawing Function:**
```javascript
function drawHexagon(ctx, x, y, size, fill = '#000') {
  const angle = 2 * Math.PI / 6;

  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const xPos = x + size * Math.cos(angle * i);
    const yPos = y + size * Math.sin(angle * i);

    if (i === 0) {
      ctx.moveTo(xPos, yPos);
    } else {
      ctx.lineTo(xPos, yPos);
    }
  }
  ctx.closePath();

  ctx.fillStyle = fill;
  ctx.fill();
  ctx.stroke();
}

// Drawing grid
function drawHexGrid(ctx, width, height, hexSize) {
  const h = hexSize * Math.sqrt(3);

  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      const x = col * 1.5 * hexSize + (row % 2) * 0.75 * hexSize;
      const y = row * h;
      drawHexagon(ctx, x, y, hexSize);
    }
  }
}
```

**Advantages:**
- Best for 100+ elements
- Smooth animations
- No DOM overhead

**Disadvantages:**
- No CSS styling
- Manual event handling
- Text rendering complexity

### 3.4 React Libraries

#### honeycomb-grid (Vanilla JS, React-compatible)
```javascript
import { defineHex, Grid, rectangle } from 'honeycomb-grid';

// Define hex properties
const Tile = defineHex({
  dimensions: 30,
  orientation: 'pointy'
});

// Create grid
const grid = new Grid(Tile, rectangle({
  width: 7,
  height: 5
}));

// Use with React
grid.forEach(hex => {
  console.log(hex.x, hex.y, hex.q, hex.r);
});
```

#### react-hexgrid (SVG-based React components)
```jsx
import { HexGrid, Layout, Hexagon, Text } from 'react-hexgrid';

<HexGrid width={800} height={600}>
  <Layout size={{ x: 10, y: 10 }} flat={true}>
    {days.map(day => (
      <Hexagon
        key={day}
        q={day.q}
        r={day.r}
        s={day.s}
        onClick={() => handleDayClick(day)}
      >
        <Text>{day.number}</Text>
      </Hexagon>
    ))}
  </Layout>
</HexGrid>
```

---

## 4. Calendar-Specific Design

### 4.1 Layout Strategies for 28-31 Days

#### Strategy 1: Flexible Grid (5 columns × 7 rows)
```
Pros:
- Accommodates all month lengths
- Familiar weekly structure
- Easy to understand

Cons:
- Some empty hexagons in short months
- Less visually organic
```

#### Strategy 2: Spiral from Center
```javascript
function createCalendarSpiral(daysInMonth) {
  const hexagons = [];
  let day = 1;

  // Center hex
  hexagons.push({ q: 0, r: 0, day: day++ });

  // Spiral outward
  let radius = 1;
  while (day <= daysInMonth) {
    const ring = getRingHexagons(radius);
    for (const hex of ring) {
      if (day > daysInMonth) break;
      hexagons.push({ ...hex, day: day++ });
    }
    radius++;
  }

  return hexagons;
}
```

#### Strategy 3: Organic Cluster (Unique per Month)
```javascript
// Each month gets a unique seed for variation
function createMonthLayout(year, month, daysInMonth) {
  const seed = year * 12 + month;
  const rng = seededRandom(seed);

  // Use seed to create unique arrangement
  return generateOrganicLayout(daysInMonth, rng);
}
```

### 4.2 Visual States for Days

```css
/* Base hexagon style */
.day-hexagon {
  transition: all 0.3s ease;
  cursor: pointer;
}

/* Has journal entry */
.day-hexagon.has-entry {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

/* No entry (empty state) */
.day-hexagon.no-entry {
  background: #1a1a2e;
  border: 2px solid #16213e;
  opacity: 0.7;
}

/* Selected/current day */
.day-hexagon.selected {
  background: #4ecca3;
  transform: scale(1.1);
  box-shadow: 0 8px 24px rgba(78, 204, 163, 0.6);
  z-index: 10;
}

/* Hover state */
.day-hexagon:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(255, 255, 255, 0.1);
}

/* Future date (disabled) */
.day-hexagon.future {
  opacity: 0.3;
  cursor: not-allowed;
  filter: grayscale(100%);
}

/* Multiple entries indicator */
.day-hexagon.multiple-entries::after {
  content: '';
  position: absolute;
  top: 5px;
  right: 5px;
  width: 8px;
  height: 8px;
  background: #ffd700;
  border-radius: 50%;
}
```

### 4.3 Interaction Patterns

```jsx
const CalendarHexagon = ({ day, hasEntry, isSelected, isFuture, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  const classNames = [
    'day-hexagon',
    hasEntry && 'has-entry',
    !hasEntry && 'no-entry',
    isSelected && 'selected',
    isFuture && 'future'
  ].filter(Boolean).join(' ');

  return (
    <div
      className={classNames}
      onClick={() => !isFuture && onClick(day)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="button"
      tabIndex={isFuture ? -1 : 0}
      aria-label={`Day ${day.number}${hasEntry ? ', has entry' : ''}`}
    >
      <span className="day-number">{day.number}</span>
      {isHovered && hasEntry && (
        <div className="preview-tooltip">
          View entry
        </div>
      )}
    </div>
  );
};
```

### 4.4 Entry Status Indicators

```jsx
// Visual indicators for entry status
const EntryIndicators = ({ entryCount, categories }) => (
  <div className="entry-indicators">
    {/* Dot indicator for entry count */}
    {entryCount > 0 && (
      <div className="entry-count-badge">
        {entryCount}
      </div>
    )}

    {/* Color bars for categories */}
    <div className="category-bars">
      {categories.map(cat => (
        <div
          key={cat}
          className="category-bar"
          style={{ background: CATEGORY_COLORS[cat] }}
        />
      ))}
    </div>
  </div>
);
```

---

## 5. Code Examples & Patterns

### 5.1 Responsive Hexagon Grid (CSS-Only)

```css
.calendar-grid {
  --hex-size: 80px;
  --hex-margin: 4px;
  --hex-height: calc(var(--hex-size) * 1.1547);
  --vertical-overlap: calc(var(--hex-margin) - var(--hex-size) * 0.2885);

  display: flex;
  flex-wrap: wrap;
  max-width: 600px;
}

.day-hexagon {
  width: var(--hex-size);
  height: var(--hex-height);
  margin: var(--hex-margin);
  margin-bottom: var(--vertical-overlap);

  /* Create hexagon shape */
  clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);

  /* Center content */
  display: flex;
  align-items: center;
  justify-content: center;

  /* Styling */
  background: #2d2d44;
  position: relative;
}

/* Offset every other row */
.calendar-grid::before {
  content: "";
  width: calc(var(--hex-size) / 2 + var(--hex-margin));
  float: left;
  height: 100%;

  /* Creates alternating row offset */
  shape-outside: repeating-linear-gradient(
    transparent 0 calc(var(--hex-height) * 2 - 3px),
    #fff 0 calc(var(--hex-height) * 2)
  );
}
```

### 5.2 React Calendar Component

```jsx
import React, { useState, useMemo } from 'react';

const HoneycombCalendar = ({ year, month, entries = {} }) => {
  const [selectedDay, setSelectedDay] = useState(null);

  // Calculate days in month
  const daysInMonth = useMemo(() => {
    return new Date(year, month + 1, 0).getDate();
  }, [year, month]);

  // Generate hexagon positions
  const hexagons = useMemo(() => {
    const hexes = [];
    const cols = 7;
    const hexSize = 50;
    const h = hexSize * Math.sqrt(3);

    for (let day = 1; day <= daysInMonth; day++) {
      const row = Math.floor((day - 1) / cols);
      const col = (day - 1) % cols;

      const x = col * 1.5 * hexSize + (row % 2) * 0.75 * hexSize;
      const y = row * h;

      hexes.push({
        day,
        x,
        y,
        hasEntry: !!entries[day],
        isToday: isToday(year, month, day)
      });
    }

    return hexes;
  }, [year, month, daysInMonth, entries]);

  const handleHexClick = (day) => {
    setSelectedDay(day);
    // Navigate to journal entry or create new
  };

  return (
    <div className="honeycomb-calendar">
      <svg viewBox="0 0 600 400">
        {hexagons.map(hex => (
          <HexagonDay
            key={hex.day}
            {...hex}
            isSelected={selectedDay === hex.day}
            onClick={() => handleHexClick(hex.day)}
          />
        ))}
      </svg>
    </div>
  );
};

const HexagonDay = ({ day, x, y, hasEntry, isToday, isSelected, onClick }) => {
  const points = useMemo(() => {
    const size = 40;
    const pts = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i;
      pts.push([
        x + size * Math.cos(angle),
        y + size * Math.sin(angle)
      ]);
    }
    return pts.map(p => p.join(',')).join(' ');
  }, [x, y]);

  const fill = hasEntry ? '#667eea' : '#2d2d44';
  const stroke = isSelected ? '#4ecca3' : '#444';
  const strokeWidth = isSelected ? 3 : 1;

  return (
    <g onClick={onClick} className="hex-day" style={{ cursor: 'pointer' }}>
      <polygon
        points={points}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
      <text
        x={x}
        y={y}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#fff"
        fontSize="14"
        fontWeight={isToday ? 'bold' : 'normal'}
      >
        {day}
      </text>
      {hasEntry && (
        <circle cx={x + 15} cy={y - 15} r="4" fill="#4ecca3" />
      )}
    </g>
  );
};

function isToday(year, month, day) {
  const today = new Date();
  return (
    today.getFullYear() === year &&
    today.getMonth() === month &&
    today.getDate() === day
  );
}

export default HoneycombCalendar;
```

### 5.3 Canvas-Based Implementation

```jsx
import React, { useRef, useEffect } from 'react';

const CanvasHoneycombCalendar = ({ year, month, entries }) => {
  const canvasRef = useRef(null);
  const hexagonsRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    // Set canvas size
    canvas.width = 800 * dpr;
    canvas.height = 600 * dpr;
    ctx.scale(dpr, dpr);

    // Generate hexagons
    const hexSize = 40;
    const cols = 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const hexagons = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const row = Math.floor((day - 1) / cols);
      const col = (day - 1) % cols;

      const x = 100 + col * hexSize * 1.5 + (row % 2) * hexSize * 0.75;
      const y = 100 + row * hexSize * Math.sqrt(3);

      hexagons.push({
        day,
        x,
        y,
        size: hexSize,
        hasEntry: !!entries[day]
      });
    }

    hexagonsRef.current = hexagons;

    // Draw
    drawCalendar(ctx, hexagons);
  }, [year, month, entries]);

  const drawCalendar = (ctx, hexagons) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    hexagons.forEach(hex => {
      drawHexagon(ctx, hex.x, hex.y, hex.size, hex.hasEntry);

      // Draw day number
      ctx.fillStyle = '#fff';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(hex.day, hex.x, hex.y);
    });
  };

  const drawHexagon = (ctx, x, y, size, filled) => {
    ctx.beginPath();

    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i;
      const xPos = x + size * Math.cos(angle);
      const yPos = y + size * Math.sin(angle);

      if (i === 0) ctx.moveTo(xPos, yPos);
      else ctx.lineTo(xPos, yPos);
    }

    ctx.closePath();

    // Fill
    ctx.fillStyle = filled ? '#667eea' : '#2d2d44';
    ctx.fill();

    // Stroke
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  const handleClick = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Find clicked hexagon
    const clicked = hexagonsRef.current.find(hex => {
      const dx = x - hex.x;
      const dy = y - hex.y;
      return Math.sqrt(dx * dx + dy * dy) < hex.size;
    });

    if (clicked) {
      console.log('Clicked day:', clicked.day);
    }
  };

  return (
    <canvas
      ref={canvasRef}
      onClick={handleClick}
      style={{ width: 800, height: 600 }}
    />
  );
};
```

---

## 6. Performance & Best Practices

### 6.1 Performance Comparison

**For 30-40 hexagons (calendar use case):**

| Approach | Performance | Interactivity | Styling | Recommendation |
|----------|-------------|---------------|---------|----------------|
| CSS clip-path | Excellent | Native | Full CSS | **Best for simple layouts** |
| SVG | Excellent | Native | CSS + SVG | **Best overall choice** |
| Canvas | Good | Manual | JavaScript | Overkill for this scale |
| React Libraries | Good | Built-in | Mixed | Good for complex grids |

**Winner: SVG** for 30-40 elements because:
- Excellent performance at this scale
- Native event handling
- Full CSS styling support
- Scalable and responsive
- Accessibility-friendly

### 6.2 Optimization Tips

```jsx
// Memoize hexagon calculations
const hexPositions = useMemo(() =>
  calculateHexPositions(days),
  [days]
);

// Use React.memo for individual hexagons
const HexagonDay = React.memo(({ day, onClick }) => {
  // Component implementation
}, (prev, next) => {
  // Only re-render if these props change
  return prev.day === next.day &&
         prev.isSelected === next.isSelected &&
         prev.hasEntry === next.hasEntry;
});

// Virtualize if showing multiple months
import { FixedSizeGrid } from 'react-window';
```

### 6.3 Responsive Design

```css
/* Mobile-first approach */
.honeycomb-calendar {
  --hex-size: 40px; /* Small on mobile */
}

@media (min-width: 768px) {
  .honeycomb-calendar {
    --hex-size: 60px;
  }
}

@media (min-width: 1024px) {
  .honeycomb-calendar {
    --hex-size: 80px;
  }
}

/* Container queries (modern browsers) */
@container (min-width: 600px) {
  .day-hexagon {
    --hex-size: 70px;
  }
}
```

### 6.4 Touch Optimization

```css
/* Larger touch targets */
@media (pointer: coarse) {
  .day-hexagon {
    --hex-size: 50px;
    --hex-margin: 8px;
  }

  /* Prevent zoom on double-tap */
  touch-action: manipulation;
}

/* Disable hover effects on touch devices */
@media (hover: none) {
  .day-hexagon:hover {
    transform: none;
  }
}
```

---

## 7. Accessibility Considerations

### 7.1 Keyboard Navigation

```jsx
const HoneycombCalendar = () => {
  const [focusedDay, setFocusedDay] = useState(1);
  const daysRef = useRef({});

  const handleKeyDown = (e, day) => {
    let nextDay = day;

    switch(e.key) {
      case 'ArrowRight':
        nextDay = day + 1;
        break;
      case 'ArrowLeft':
        nextDay = day - 1;
        break;
      case 'ArrowDown':
        nextDay = day + 7; // Next week
        break;
      case 'ArrowUp':
        nextDay = day - 7; // Previous week
        break;
      case 'Enter':
      case ' ':
        handleDaySelect(day);
        return;
      default:
        return;
    }

    e.preventDefault();

    // Focus next day if valid
    if (nextDay >= 1 && nextDay <= daysInMonth) {
      daysRef.current[nextDay]?.focus();
      setFocusedDay(nextDay);
    }
  };

  return (
    <div role="grid" aria-label={`Calendar for ${monthName} ${year}`}>
      {hexagons.map(hex => (
        <div
          key={hex.day}
          ref={el => daysRef.current[hex.day] = el}
          role="gridcell"
          tabIndex={hex.day === focusedDay ? 0 : -1}
          onKeyDown={(e) => handleKeyDown(e, hex.day)}
          aria-label={`Day ${hex.day}${hex.hasEntry ? ', has entry' : ''}`}
        >
          {hex.day}
        </div>
      ))}
    </div>
  );
};
```

### 7.2 ARIA Attributes

```jsx
<div
  role="grid"
  aria-label="Calendar grid"
  aria-rowcount={Math.ceil(daysInMonth / 7)}
  aria-colcount={7}
>
  <div
    role="gridcell"
    aria-colindex={col + 1}
    aria-rowindex={row + 1}
    aria-selected={isSelected}
    aria-disabled={isFuture}
    tabIndex={isFocusable ? 0 : -1}
  >
    <span aria-hidden="true">{day}</span>
    <span className="sr-only">
      Day {day}, {hasEntry ? 'has entry' : 'no entry'}
    </span>
  </div>
</div>
```

### 7.3 Screen Reader Support

```css
/* Visually hidden but screen-reader accessible */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

---

## 8. Recommended Implementation Strategy

### 8.1 Phase 1: Basic Structure (Week 1)

**Choose SVG-based approach:**
```jsx
// SimpleHoneycombCalendar.jsx
const HoneycombCalendar = ({ month, year }) => {
  const hexagons = calculateHexPositions(month, year);

  return (
    <svg viewBox="0 0 800 600" className="calendar-svg">
      {hexagons.map(hex => (
        <HexagonDay key={hex.day} {...hex} />
      ))}
    </svg>
  );
};
```

**Why:**
- Clean, maintainable code
- Excellent performance
- Easy styling with CSS
- Native event handling
- Scalable and responsive

### 8.2 Phase 2: Styling & States (Week 2)

Add visual states:
- Empty (no entry)
- Filled (has entry)
- Selected
- Today
- Hover effects
- Multiple entry indicators

### 8.3 Phase 3: Interactions (Week 3)

Implement:
- Click to view/create entry
- Keyboard navigation
- Touch gestures
- Entry previews on hover
- Day selection

### 8.4 Phase 4: Advanced Features (Week 4)

Add:
- Month transitions/animations
- Unique layout per month (optional)
- Entry count indicators
- Category color coding
- Accessibility enhancements

### 8.5 Final Recommendation

**Use SVG with React components:**

```jsx
import React, { useMemo } from 'react';

const HoneycombCalendar = ({
  year,
  month,
  entries = {},
  onDayClick
}) => {
  // Calculate hexagon positions
  const hexagons = useMemo(() =>
    generateMonthHexagons(year, month),
    [year, month]
  );

  return (
    <div className="honeycomb-calendar-container">
      <svg
        viewBox="0 0 800 600"
        className="honeycomb-calendar"
        role="grid"
        aria-label={`${getMonthName(month)} ${year} calendar`}
      >
        {hexagons.map(hex => (
          <HexagonDay
            key={hex.day}
            day={hex.day}
            x={hex.x}
            y={hex.y}
            size={hex.size}
            hasEntry={!!entries[hex.day]}
            entryCount={entries[hex.day]?.length || 0}
            isToday={isToday(year, month, hex.day)}
            onClick={() => onDayClick(hex.day)}
          />
        ))}
      </svg>
    </div>
  );
};

export default HoneycombCalendar;
```

**This approach provides:**
- Clean, maintainable code
- Excellent performance (30-40 SVG elements is trivial)
- Full CSS styling capabilities
- Native accessibility support
- Easy testing and debugging
- Responsive by default
- Touch-friendly
- Future-proof

---

## Additional Resources

### Documentation
- [Red Blob Games: Hexagonal Grids](https://www.redblobgames.com/grids/hexagons/) - The definitive guide
- [MDN: clip-path](https://developer.mozilla.org/en-US/docs/Web/CSS/clip-path)
- [CSS-Tricks: Hexagons](https://css-tricks.com/hexagons-and-beyond-flexible-responsive-grid-patterns-sans-media-queries/)

### Libraries
- [honeycomb-grid](https://github.com/flauwekeul/honeycomb) - Vanilla JS hexagon grid
- [react-hexgrid](https://github.com/Hellenic/react-hexgrid) - React SVG components

### Tools
- [CSS Hexagon Generator](https://css-tip.com/hexagon-shape/)
- [Hexagonal Graph Paper](https://incompetech.com/graphpaper/hexagonal/)

---

**Document compiled:** 2025-11-23
**For:** Quanta Personal Operating System - Calendar Module
**Status:** Ready for implementation
