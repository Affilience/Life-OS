/**
 * LifeOS Colour Themes
 *
 * A comprehensive collection of 10 color themes for the app.
 * Each theme transforms the ENTIRE visual look - backgrounds, cards, buttons, everything.
 * All themes are designed for accessibility (WCAG AA+) and visual harmony.
 *
 * DEPTH SYSTEM:
 * Each theme includes atmospheric elements for visual depth:
 * - Gradient backgrounds (multi-layer radial/linear gradients)
 * - Ambient glow orbs (positioned floating light sources)
 * - Noise texture opacity (subtle grain for depth)
 * - Vignette effects (edge darkening)
 */

export const THEMES = {
  // ============================================================================
  // 1. COSMIC VIOLET (Default) - High-energy, futuristic, gaming
  // ============================================================================
  'cosmic-violet': {
    id: 'cosmic-violet',
    name: 'Cosmic Violet',
    description: 'Premium purple aesthetic with cosmic vibes',
    preview: {
      primary: '#8b5cf6',
      secondary: '#06b6d4',
      background: '#0c0a10',
    },
    // Atmospheric depth elements
    atmosphere: {
      // Main page gradient (applied to body/main container)
      gradient: `
        radial-gradient(ellipse 80% 50% at 50% -20%, rgba(139, 92, 246, 0.15) 0%, transparent 50%),
        radial-gradient(ellipse 60% 40% at 100% 100%, rgba(6, 182, 212, 0.1) 0%, transparent 40%),
        radial-gradient(ellipse 40% 30% at 0% 80%, rgba(139, 92, 246, 0.08) 0%, transparent 35%)
      `,
      // Floating ambient orbs (CSS for pseudo-elements)
      orbs: [
        { color: 'rgba(139, 92, 246, 0.12)', size: '400px', x: '10%', y: '5%', blur: '80px' },
        { color: 'rgba(6, 182, 212, 0.08)', size: '350px', x: '85%', y: '60%', blur: '100px' },
        { color: 'rgba(139, 92, 246, 0.06)', size: '300px', x: '50%', y: '90%', blur: '120px' },
      ],
      // Noise texture opacity (0 = none, 0.05 = subtle)
      noiseOpacity: 0.02,
      // Edge vignette strength
      vignetteOpacity: 0.3,
      // Card glass effect
      cardGlass: 'rgba(139, 92, 246, 0.03)',
      cardGlassHover: 'rgba(139, 92, 246, 0.06)',
    },
    colors: {
      // Backgrounds - Deep purple-black with violet undertones
      bg0: '#0c0a10',
      bg1: '#12101a',
      bg2: '#1a1724',
      bgElevated: '#221e2e',
      bgHover: '#2a2538',
      bgTertiary: '#322c42',
      bgActive: '#3a3350',

      // Primary accent - Vibrant violet
      primary50: '#f3e8ff',
      primary100: '#e9d5ff',
      primary200: '#d8b4fe',
      primary300: '#c084fc',
      primary400: '#a855f7',
      primary500: '#8b5cf6',
      primary600: '#7c3aed',
      primary700: '#6d28d9',
      primary800: '#5b21b6',
      primary900: '#4c1d95',

      // Secondary accent - Cyan
      secondary: '#06b6d4',
      secondarySoft: 'rgba(6, 182, 212, 0.12)',

      // Status colors
      success: '#10b981',
      warning: '#f59e0b',
      error: '#f43f5e',

      // Text
      textPrimary: 'rgba(255, 255, 255, 0.92)',
      textSecondary: 'rgba(255, 255, 255, 0.64)',
      textMuted: 'rgba(255, 255, 255, 0.40)',

      // Borders
      border: 'rgba(255, 255, 255, 0.10)',
      borderSubtle: 'rgba(255, 255, 255, 0.05)',
      borderStrong: 'rgba(255, 255, 255, 0.15)',

      // Glows and shadows
      glowPrimary: 'rgba(139, 92, 246, 0.25)',
      glowSecondary: 'rgba(6, 182, 212, 0.15)',
      shadowColor: 'rgba(0, 0, 0, 0.5)',

      // Selection
      selection: 'rgba(139, 92, 246, 0.3)',

      // Button colors
      buttonPrimary: '#8b5cf6',
      buttonPrimaryHover: '#7c3aed',
      buttonSecondary: '#1a1724',
      buttonSecondaryHover: '#221e2e',

      // Card styling
      cardBorder: 'rgba(255, 255, 255, 0.10)',
      cardHoverBorder: 'rgba(139, 92, 246, 0.30)',

      // Input styling
      inputBg: '#0c0a10',
      inputBorder: 'rgba(255, 255, 255, 0.10)',
      inputFocusBorder: '#8b5cf6',

      // Scrollbar
      scrollbarTrack: '#0c0a10',
      scrollbarThumb: '#221e2e',
      scrollbarThumbHover: '#2a2538',

      // Progress bars
      progressBg: '#0c0a10',
      progressFill: '#8b5cf6',

      // Tags/badges
      tagBg: 'rgba(139, 92, 246, 0.15)',
      tagText: '#a855f7',
    },
  },

  // ============================================================================
  // 2. NEON SYNTHWAVE - 80s retro-futurism, bold, nostalgic
  // ============================================================================
  'neon-synthwave': {
    id: 'neon-synthwave',
    name: 'Neon Synthwave',
    description: '80s retro-futurism with bold neon colors',
    preview: {
      primary: '#ff006e',
      secondary: '#00f5ff',
      background: '#0a0e27',
    },
    atmosphere: {
      gradient: `
        linear-gradient(180deg, rgba(255, 0, 110, 0.08) 0%, transparent 30%),
        radial-gradient(ellipse 100% 60% at 50% 120%, rgba(0, 245, 255, 0.15) 0%, transparent 50%),
        linear-gradient(0deg, rgba(255, 0, 110, 0.05) 0%, transparent 40%)
      `,
      orbs: [
        { color: 'rgba(255, 0, 110, 0.15)', size: '500px', x: '20%', y: '0%', blur: '100px' },
        { color: 'rgba(0, 245, 255, 0.12)', size: '400px', x: '80%', y: '70%', blur: '120px' },
        { color: 'rgba(255, 0, 110, 0.08)', size: '300px', x: '0%', y: '100%', blur: '80px' },
      ],
      noiseOpacity: 0.03,
      vignetteOpacity: 0.4,
      cardGlass: 'rgba(255, 0, 110, 0.04)',
      cardGlassHover: 'rgba(0, 245, 255, 0.06)',
      // Synthwave-specific: scan lines effect
      scanLines: true,
    },
    colors: {
      // Backgrounds - Deep navy with neon glow potential
      bg0: '#0a0e27',
      bg1: '#0f1535',
      bg2: '#1a1a2e',
      bgElevated: '#16213e',
      bgHover: '#1f2b4d',
      bgTertiary: '#283657',
      bgActive: '#324166',

      // Primary accent - Hot pink
      primary50: '#ffe6f0',
      primary100: '#ffcce0',
      primary200: '#ff99c2',
      primary300: '#ff66a3',
      primary400: '#ff3385',
      primary500: '#ff006e',
      primary600: '#e60063',
      primary700: '#cc0058',
      primary800: '#b3004d',
      primary900: '#990042',

      // Secondary accent - Electric cyan
      secondary: '#00f5ff',
      secondarySoft: 'rgba(0, 245, 255, 0.12)',

      // Status colors
      success: '#00ff88',
      warning: '#ffaa00',
      error: '#ff4444',

      // Text
      textPrimary: 'rgba(255, 255, 255, 0.92)',
      textSecondary: 'rgba(255, 255, 255, 0.64)',
      textMuted: 'rgba(255, 255, 255, 0.40)',

      // Borders
      border: 'rgba(255, 255, 255, 0.10)',
      borderSubtle: 'rgba(255, 255, 255, 0.05)',
      borderStrong: 'rgba(255, 255, 255, 0.15)',

      // Glows
      glowPrimary: 'rgba(255, 0, 110, 0.3)',
      glowSecondary: 'rgba(0, 245, 255, 0.2)',
      shadowColor: 'rgba(0, 0, 0, 0.6)',

      selection: 'rgba(255, 0, 110, 0.3)',

      buttonPrimary: '#ff006e',
      buttonPrimaryHover: '#e60063',
      buttonSecondary: '#1a1a2e',
      buttonSecondaryHover: '#16213e',

      cardBorder: 'rgba(255, 255, 255, 0.10)',
      cardHoverBorder: 'rgba(255, 0, 110, 0.30)',

      inputBg: '#0a0e27',
      inputBorder: 'rgba(255, 255, 255, 0.10)',
      inputFocusBorder: '#ff006e',

      scrollbarTrack: '#0a0e27',
      scrollbarThumb: '#16213e',
      scrollbarThumbHover: '#1f2b4d',

      progressBg: '#0a0e27',
      progressFill: '#ff006e',

      tagBg: 'rgba(255, 0, 110, 0.15)',
      tagText: '#ff3385',
    },
  },

  // ============================================================================
  // 3. EMERALD ZEN - Calm, natural, growth-focused
  // ============================================================================
  'emerald-zen': {
    id: 'emerald-zen',
    name: 'Emerald Zen',
    description: 'Calm and natural with growth-focused greens',
    preview: {
      primary: '#10b981',
      secondary: '#8b5cf6',
      background: '#0f1512',
    },
    atmosphere: {
      gradient: `
        radial-gradient(ellipse 70% 50% at 30% 0%, rgba(16, 185, 129, 0.1) 0%, transparent 50%),
        radial-gradient(ellipse 50% 40% at 90% 80%, rgba(139, 92, 246, 0.06) 0%, transparent 40%),
        radial-gradient(ellipse 80% 30% at 50% 100%, rgba(16, 185, 129, 0.08) 0%, transparent 35%)
      `,
      orbs: [
        { color: 'rgba(16, 185, 129, 0.1)', size: '450px', x: '5%', y: '10%', blur: '100px' },
        { color: 'rgba(139, 92, 246, 0.06)', size: '300px', x: '90%', y: '50%', blur: '80px' },
        { color: 'rgba(16, 185, 129, 0.05)', size: '350px', x: '40%', y: '85%', blur: '90px' },
      ],
      noiseOpacity: 0.015,
      vignetteOpacity: 0.25,
      cardGlass: 'rgba(16, 185, 129, 0.02)',
      cardGlassHover: 'rgba(16, 185, 129, 0.05)',
    },
    colors: {
      // Backgrounds - Deep forest with green undertones
      bg0: '#0a120e',
      bg1: '#0f1a14',
      bg2: '#15231c',
      bgElevated: '#1c2d24',
      bgHover: '#23372c',
      bgTertiary: '#2a4134',
      bgActive: '#314b3c',

      // Primary accent - Emerald green
      primary50: '#ecfdf5',
      primary100: '#d1fae5',
      primary200: '#a7f3d0',
      primary300: '#6ee7b7',
      primary400: '#34d399',
      primary500: '#10b981',
      primary600: '#059669',
      primary700: '#047857',
      primary800: '#065f46',
      primary900: '#064e3b',

      // Secondary accent - Soft purple
      secondary: '#8b5cf6',
      secondarySoft: 'rgba(139, 92, 246, 0.12)',

      // Status colors
      success: '#22c55e',
      warning: '#f59e0b',
      error: '#ef4444',

      // Text - Slightly green tinted
      textPrimary: 'rgba(236, 253, 245, 0.92)',
      textSecondary: 'rgba(209, 250, 229, 0.64)',
      textMuted: 'rgba(167, 243, 208, 0.40)',

      // Borders
      border: 'rgba(255, 255, 255, 0.10)',
      borderSubtle: 'rgba(255, 255, 255, 0.05)',
      borderStrong: 'rgba(255, 255, 255, 0.15)',

      // Glows
      glowPrimary: 'rgba(16, 185, 129, 0.25)',
      glowSecondary: 'rgba(139, 92, 246, 0.15)',
      shadowColor: 'rgba(0, 0, 0, 0.5)',

      selection: 'rgba(16, 185, 129, 0.3)',

      buttonPrimary: '#10b981',
      buttonPrimaryHover: '#059669',
      buttonSecondary: '#15231c',
      buttonSecondaryHover: '#1c2d24',

      cardBorder: 'rgba(255, 255, 255, 0.10)',
      cardHoverBorder: 'rgba(16, 185, 129, 0.30)',

      inputBg: '#0a120e',
      inputBorder: 'rgba(255, 255, 255, 0.10)',
      inputFocusBorder: '#10b981',

      scrollbarTrack: '#0a120e',
      scrollbarThumb: '#1c2d24',
      scrollbarThumbHover: '#23372c',

      progressBg: '#0a120e',
      progressFill: '#10b981',

      tagBg: 'rgba(16, 185, 129, 0.15)',
      tagText: '#34d399',
    },
  },

  // ============================================================================
  // 4. SOLAR ORANGE - Energetic, warm, productive
  // ============================================================================
  'solar-orange': {
    id: 'solar-orange',
    name: 'Solar Orange',
    description: 'Warm and energetic with sunset vibes',
    preview: {
      primary: '#f97316',
      secondary: '#fbbf24',
      background: '#1c1917',
    },
    atmosphere: {
      gradient: `
        radial-gradient(ellipse 90% 50% at 50% -10%, rgba(249, 115, 22, 0.12) 0%, transparent 45%),
        radial-gradient(ellipse 60% 50% at 100% 30%, rgba(251, 191, 36, 0.08) 0%, transparent 40%),
        linear-gradient(180deg, transparent 60%, rgba(249, 115, 22, 0.05) 100%)
      `,
      orbs: [
        { color: 'rgba(249, 115, 22, 0.12)', size: '500px', x: '50%', y: '-5%', blur: '100px' },
        { color: 'rgba(251, 191, 36, 0.08)', size: '350px', x: '95%', y: '30%', blur: '90px' },
        { color: 'rgba(249, 115, 22, 0.06)', size: '400px', x: '10%', y: '70%', blur: '110px' },
      ],
      noiseOpacity: 0.02,
      vignetteOpacity: 0.35,
      cardGlass: 'rgba(249, 115, 22, 0.03)',
      cardGlassHover: 'rgba(251, 191, 36, 0.05)',
    },
    colors: {
      // Backgrounds - Warm dark browns
      bg0: '#141210',
      bg1: '#1c1917',
      bg2: '#25211e',
      bgElevated: '#2e2925',
      bgHover: '#38322c',
      bgTertiary: '#423b33',
      bgActive: '#4c443a',

      // Primary accent - Vibrant orange
      primary50: '#fff7ed',
      primary100: '#ffedd5',
      primary200: '#fed7aa',
      primary300: '#fdba74',
      primary400: '#fb923c',
      primary500: '#f97316',
      primary600: '#ea580c',
      primary700: '#c2410c',
      primary800: '#9a3412',
      primary900: '#7c2d12',

      // Secondary accent - Golden yellow
      secondary: '#fbbf24',
      secondarySoft: 'rgba(251, 191, 36, 0.12)',

      // Status colors
      success: '#22c55e',
      warning: '#eab308',
      error: '#dc2626',

      // Text - Warm tinted
      textPrimary: 'rgba(255, 251, 235, 0.92)',
      textSecondary: 'rgba(254, 243, 199, 0.64)',
      textMuted: 'rgba(253, 230, 138, 0.40)',

      // Borders
      border: 'rgba(255, 255, 255, 0.10)',
      borderSubtle: 'rgba(255, 255, 255, 0.05)',
      borderStrong: 'rgba(255, 255, 255, 0.15)',

      // Glows
      glowPrimary: 'rgba(249, 115, 22, 0.25)',
      glowSecondary: 'rgba(251, 191, 36, 0.2)',
      shadowColor: 'rgba(0, 0, 0, 0.5)',

      selection: 'rgba(249, 115, 22, 0.3)',

      buttonPrimary: '#f97316',
      buttonPrimaryHover: '#ea580c',
      buttonSecondary: '#25211e',
      buttonSecondaryHover: '#2e2925',

      cardBorder: 'rgba(255, 255, 255, 0.10)',
      cardHoverBorder: 'rgba(249, 115, 22, 0.30)',

      inputBg: '#141210',
      inputBorder: 'rgba(255, 255, 255, 0.10)',
      inputFocusBorder: '#f97316',

      scrollbarTrack: '#141210',
      scrollbarThumb: '#2e2925',
      scrollbarThumbHover: '#38322c',

      progressBg: '#141210',
      progressFill: '#f97316',

      tagBg: 'rgba(249, 115, 22, 0.15)',
      tagText: '#fb923c',
    },
  },

  // ============================================================================
  // 5. CYBER MIDNIGHT - Sleek, tech-forward, gaming
  // ============================================================================
  'cyber-midnight': {
    id: 'cyber-midnight',
    name: 'Cyber Midnight',
    description: 'Tech-forward with neon cyan accents',
    preview: {
      primary: '#00d9ff',
      secondary: '#00ff88',
      background: '#0d1117',
    },
    atmosphere: {
      gradient: `
        radial-gradient(ellipse 70% 40% at 80% 10%, rgba(0, 217, 255, 0.1) 0%, transparent 50%),
        radial-gradient(ellipse 50% 35% at 20% 90%, rgba(0, 255, 136, 0.08) 0%, transparent 40%),
        linear-gradient(135deg, rgba(0, 217, 255, 0.03) 0%, transparent 50%, rgba(0, 255, 136, 0.03) 100%)
      `,
      orbs: [
        { color: 'rgba(0, 217, 255, 0.1)', size: '400px', x: '85%', y: '5%', blur: '90px' },
        { color: 'rgba(0, 255, 136, 0.08)', size: '350px', x: '15%', y: '80%', blur: '100px' },
        { color: 'rgba(0, 217, 255, 0.05)', size: '300px', x: '50%', y: '40%', blur: '120px' },
      ],
      noiseOpacity: 0.025,
      vignetteOpacity: 0.35,
      cardGlass: 'rgba(0, 217, 255, 0.03)',
      cardGlassHover: 'rgba(0, 255, 136, 0.05)',
      // Tech grid effect
      gridLines: true,
    },
    colors: {
      // Backgrounds - GitHub-style dark
      bg0: '#0d1117',
      bg1: '#131920',
      bg2: '#161b22',
      bgElevated: '#1c232d',
      bgHover: '#21262d',
      bgTertiary: '#282e38',
      bgActive: '#30363d',

      // Primary accent - Neon cyan
      primary50: '#e6fbff',
      primary100: '#ccf7ff',
      primary200: '#99efff',
      primary300: '#66e7ff',
      primary400: '#33dfff',
      primary500: '#00d9ff',
      primary600: '#00c4e6',
      primary700: '#00a8cc',
      primary800: '#008cb3',
      primary900: '#007099',

      // Secondary accent - Neon green
      secondary: '#00ff88',
      secondarySoft: 'rgba(0, 255, 136, 0.12)',

      // Status colors
      success: '#00ff88',
      warning: '#ffcc00',
      error: '#ff4757',

      // Text
      textPrimary: 'rgba(201, 209, 217, 0.92)',
      textSecondary: 'rgba(139, 148, 158, 0.80)',
      textMuted: 'rgba(110, 118, 129, 0.60)',

      // Borders
      border: 'rgba(255, 255, 255, 0.10)',
      borderSubtle: 'rgba(255, 255, 255, 0.05)',
      borderStrong: 'rgba(255, 255, 255, 0.15)',

      // Glows
      glowPrimary: 'rgba(0, 217, 255, 0.3)',
      glowSecondary: 'rgba(0, 255, 136, 0.2)',
      shadowColor: 'rgba(0, 0, 0, 0.6)',

      selection: 'rgba(0, 217, 255, 0.3)',

      buttonPrimary: '#00d9ff',
      buttonPrimaryHover: '#00c4e6',
      buttonSecondary: '#161b22',
      buttonSecondaryHover: '#1c232d',

      cardBorder: 'rgba(255, 255, 255, 0.10)',
      cardHoverBorder: 'rgba(0, 217, 255, 0.30)',

      inputBg: '#0d1117',
      inputBorder: 'rgba(255, 255, 255, 0.10)',
      inputFocusBorder: '#00d9ff',

      scrollbarTrack: '#0d1117',
      scrollbarThumb: '#1c232d',
      scrollbarThumbHover: '#21262d',

      progressBg: '#0d1117',
      progressFill: '#00d9ff',

      tagBg: 'rgba(0, 217, 255, 0.15)',
      tagText: '#33dfff',
    },
  },

  // ============================================================================
  // 6. ROYAL INDIGO - Sophisticated, focused, professional
  // ============================================================================
  'royal-indigo': {
    id: 'royal-indigo',
    name: 'Royal Indigo',
    description: 'Sophisticated and focused for deep work',
    preview: {
      primary: '#4f46e5',
      secondary: '#ec4899',
      background: '#111827',
    },
    atmosphere: {
      gradient: `
        radial-gradient(ellipse 60% 45% at 70% 0%, rgba(79, 70, 229, 0.12) 0%, transparent 50%),
        radial-gradient(ellipse 50% 40% at 10% 70%, rgba(236, 72, 153, 0.08) 0%, transparent 45%),
        linear-gradient(180deg, transparent 50%, rgba(79, 70, 229, 0.04) 100%)
      `,
      orbs: [
        { color: 'rgba(79, 70, 229, 0.1)', size: '450px', x: '75%', y: '0%', blur: '100px' },
        { color: 'rgba(236, 72, 153, 0.07)', size: '350px', x: '5%', y: '65%', blur: '90px' },
        { color: 'rgba(79, 70, 229, 0.05)', size: '300px', x: '40%', y: '90%', blur: '110px' },
      ],
      noiseOpacity: 0.018,
      vignetteOpacity: 0.3,
      cardGlass: 'rgba(79, 70, 229, 0.03)',
      cardGlassHover: 'rgba(236, 72, 153, 0.05)',
    },
    colors: {
      // Backgrounds - Cool dark grays
      bg0: '#0c1018',
      bg1: '#111827',
      bg2: '#1f2937',
      bgElevated: '#273344',
      bgHover: '#374151',
      bgTertiary: '#404d5e',
      bgActive: '#4b5563',

      // Primary accent - Deep indigo
      primary50: '#eef2ff',
      primary100: '#e0e7ff',
      primary200: '#c7d2fe',
      primary300: '#a5b4fc',
      primary400: '#818cf8',
      primary500: '#6366f1',
      primary600: '#4f46e5',
      primary700: '#4338ca',
      primary800: '#3730a3',
      primary900: '#312e81',

      // Secondary accent - Magenta pink
      secondary: '#ec4899',
      secondarySoft: 'rgba(236, 72, 153, 0.12)',

      // Status colors
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',

      // Text
      textPrimary: 'rgba(243, 244, 246, 0.92)',
      textSecondary: 'rgba(209, 213, 219, 0.64)',
      textMuted: 'rgba(156, 163, 175, 0.50)',

      // Borders
      border: 'rgba(255, 255, 255, 0.10)',
      borderSubtle: 'rgba(255, 255, 255, 0.05)',
      borderStrong: 'rgba(255, 255, 255, 0.15)',

      // Glows
      glowPrimary: 'rgba(79, 70, 229, 0.3)',
      glowSecondary: 'rgba(236, 72, 153, 0.2)',
      shadowColor: 'rgba(0, 0, 0, 0.5)',

      selection: 'rgba(79, 70, 229, 0.3)',

      buttonPrimary: '#4f46e5',
      buttonPrimaryHover: '#4338ca',
      buttonSecondary: '#1f2937',
      buttonSecondaryHover: '#273344',

      cardBorder: 'rgba(255, 255, 255, 0.10)',
      cardHoverBorder: 'rgba(79, 70, 229, 0.30)',

      inputBg: '#0c1018',
      inputBorder: 'rgba(255, 255, 255, 0.10)',
      inputFocusBorder: '#4f46e5',

      scrollbarTrack: '#0c1018',
      scrollbarThumb: '#273344',
      scrollbarThumbHover: '#374151',

      progressBg: '#0c1018',
      progressFill: '#4f46e5',

      tagBg: 'rgba(79, 70, 229, 0.15)',
      tagText: '#818cf8',
    },
  },

  // ============================================================================
  // 7. OCEAN DEPTHS - Calm, meditative, flowing
  // ============================================================================
  'ocean-depths': {
    id: 'ocean-depths',
    name: 'Ocean Depths',
    description: 'Deep blues for calm focus and flow',
    preview: {
      primary: '#0ea5e9',
      secondary: '#06b6d4',
      background: '#0c1929',
    },
    atmosphere: {
      gradient: `
        radial-gradient(ellipse 80% 60% at 50% 110%, rgba(14, 165, 233, 0.15) 0%, transparent 50%),
        radial-gradient(ellipse 70% 40% at 30% -10%, rgba(6, 182, 212, 0.1) 0%, transparent 45%),
        linear-gradient(180deg, rgba(6, 182, 212, 0.05) 0%, transparent 30%, rgba(14, 165, 233, 0.08) 100%)
      `,
      orbs: [
        { color: 'rgba(14, 165, 233, 0.12)', size: '500px', x: '50%', y: '100%', blur: '120px' },
        { color: 'rgba(6, 182, 212, 0.08)', size: '400px', x: '20%', y: '0%', blur: '100px' },
        { color: 'rgba(14, 165, 233, 0.06)', size: '350px', x: '80%', y: '40%', blur: '90px' },
      ],
      noiseOpacity: 0.02,
      vignetteOpacity: 0.35,
      cardGlass: 'rgba(14, 165, 233, 0.03)',
      cardGlassHover: 'rgba(6, 182, 212, 0.05)',
      // Ocean caustics effect (light patterns)
      caustics: true,
    },
    colors: {
      // Backgrounds - Deep ocean blues
      bg0: '#081420',
      bg1: '#0c1929',
      bg2: '#132742',
      bgElevated: '#18304f',
      bgHover: '#1d395c',
      bgTertiary: '#244269',
      bgActive: '#2b4b76',

      // Primary accent - Sky blue
      primary50: '#f0f9ff',
      primary100: '#e0f2fe',
      primary200: '#bae6fd',
      primary300: '#7dd3fc',
      primary400: '#38bdf8',
      primary500: '#0ea5e9',
      primary600: '#0284c7',
      primary700: '#0369a1',
      primary800: '#075985',
      primary900: '#0c4a6e',

      // Secondary accent - Cyan
      secondary: '#06b6d4',
      secondarySoft: 'rgba(6, 182, 212, 0.12)',

      // Status colors
      success: '#10b981',
      warning: '#f59e0b',
      error: '#f43f5e',

      // Text - Light cyan tinted
      textPrimary: 'rgba(207, 240, 245, 0.92)',
      textSecondary: 'rgba(165, 243, 252, 0.64)',
      textMuted: 'rgba(103, 232, 249, 0.40)',

      // Borders
      border: 'rgba(255, 255, 255, 0.10)',
      borderSubtle: 'rgba(255, 255, 255, 0.05)',
      borderStrong: 'rgba(255, 255, 255, 0.15)',

      // Glows
      glowPrimary: 'rgba(14, 165, 233, 0.3)',
      glowSecondary: 'rgba(6, 182, 212, 0.2)',
      shadowColor: 'rgba(0, 0, 0, 0.6)',

      selection: 'rgba(14, 165, 233, 0.3)',

      buttonPrimary: '#0ea5e9',
      buttonPrimaryHover: '#0284c7',
      buttonSecondary: '#132742',
      buttonSecondaryHover: '#18304f',

      cardBorder: 'rgba(255, 255, 255, 0.10)',
      cardHoverBorder: 'rgba(14, 165, 233, 0.30)',

      inputBg: '#081420',
      inputBorder: 'rgba(255, 255, 255, 0.10)',
      inputFocusBorder: '#0ea5e9',

      scrollbarTrack: '#081420',
      scrollbarThumb: '#18304f',
      scrollbarThumbHover: '#1d395c',

      progressBg: '#081420',
      progressFill: '#0ea5e9',

      tagBg: 'rgba(14, 165, 233, 0.15)',
      tagText: '#38bdf8',
    },
  },

  // ============================================================================
  // 8. FOREST NIGHT - Natural, grounded, sustainable
  // ============================================================================
  'forest-night': {
    id: 'forest-night',
    name: 'Forest Night',
    description: 'Natural earth tones for grounded focus',
    preview: {
      primary: '#22c55e',
      secondary: '#f59e0b',
      background: '#151c13',
    },
    atmosphere: {
      gradient: `
        radial-gradient(ellipse 60% 50% at 20% 10%, rgba(34, 197, 94, 0.1) 0%, transparent 50%),
        radial-gradient(ellipse 50% 40% at 90% 80%, rgba(245, 158, 11, 0.07) 0%, transparent 40%),
        linear-gradient(180deg, rgba(34, 197, 94, 0.04) 0%, transparent 50%, rgba(34, 197, 94, 0.06) 100%)
      `,
      orbs: [
        { color: 'rgba(34, 197, 94, 0.1)', size: '400px', x: '15%', y: '10%', blur: '90px' },
        { color: 'rgba(245, 158, 11, 0.06)', size: '300px', x: '85%', y: '75%', blur: '80px' },
        { color: 'rgba(34, 197, 94, 0.05)', size: '350px', x: '50%', y: '95%', blur: '100px' },
      ],
      noiseOpacity: 0.025,
      vignetteOpacity: 0.4,
      cardGlass: 'rgba(34, 197, 94, 0.02)',
      cardGlassHover: 'rgba(245, 158, 11, 0.04)',
    },
    colors: {
      // Backgrounds - Deep forest greens
      bg0: '#10150e',
      bg1: '#151c13',
      bg2: '#1c2519',
      bgElevated: '#242f20',
      bgHover: '#2c3927',
      bgTertiary: '#34432e',
      bgActive: '#3c4d35',

      // Primary accent - Bright green
      primary50: '#f0fdf4',
      primary100: '#dcfce7',
      primary200: '#bbf7d0',
      primary300: '#86efac',
      primary400: '#4ade80',
      primary500: '#22c55e',
      primary600: '#16a34a',
      primary700: '#15803d',
      primary800: '#166534',
      primary900: '#14532d',

      // Secondary accent - Warm amber
      secondary: '#f59e0b',
      secondarySoft: 'rgba(245, 158, 11, 0.12)',

      // Status colors
      success: '#4ade80',
      warning: '#fbbf24',
      error: '#ef4444',

      // Text - Light green tinted
      textPrimary: 'rgba(240, 253, 244, 0.92)',
      textSecondary: 'rgba(220, 252, 231, 0.64)',
      textMuted: 'rgba(187, 247, 208, 0.40)',

      // Borders
      border: 'rgba(255, 255, 255, 0.10)',
      borderSubtle: 'rgba(255, 255, 255, 0.05)',
      borderStrong: 'rgba(255, 255, 255, 0.15)',

      // Glows
      glowPrimary: 'rgba(34, 197, 94, 0.25)',
      glowSecondary: 'rgba(245, 158, 11, 0.2)',
      shadowColor: 'rgba(0, 0, 0, 0.5)',

      selection: 'rgba(34, 197, 94, 0.3)',

      buttonPrimary: '#22c55e',
      buttonPrimaryHover: '#16a34a',
      buttonSecondary: '#1c2519',
      buttonSecondaryHover: '#242f20',

      cardBorder: 'rgba(255, 255, 255, 0.10)',
      cardHoverBorder: 'rgba(34, 197, 94, 0.30)',

      inputBg: '#10150e',
      inputBorder: 'rgba(255, 255, 255, 0.10)',
      inputFocusBorder: '#22c55e',

      scrollbarTrack: '#10150e',
      scrollbarThumb: '#242f20',
      scrollbarThumbHover: '#2c3927',

      progressBg: '#10150e',
      progressFill: '#22c55e',

      tagBg: 'rgba(34, 197, 94, 0.15)',
      tagText: '#4ade80',
    },
  },

  // ============================================================================
  // 9. ROSE GOLD - Elegant, modern, warm
  // ============================================================================
  'rose-gold': {
    id: 'rose-gold',
    name: 'Rose Gold',
    description: 'Elegant and warm with rose accents',
    preview: {
      primary: '#f43f5e',
      secondary: '#fbbf24',
      background: '#1a1216',
    },
    atmosphere: {
      gradient: `
        radial-gradient(ellipse 70% 50% at 80% 0%, rgba(244, 63, 94, 0.1) 0%, transparent 50%),
        radial-gradient(ellipse 60% 40% at 0% 100%, rgba(251, 191, 36, 0.08) 0%, transparent 45%),
        linear-gradient(135deg, rgba(244, 63, 94, 0.04) 0%, transparent 50%, rgba(251, 191, 36, 0.04) 100%)
      `,
      orbs: [
        { color: 'rgba(244, 63, 94, 0.1)', size: '450px', x: '85%', y: '5%', blur: '100px' },
        { color: 'rgba(251, 191, 36, 0.07)', size: '350px', x: '5%', y: '90%', blur: '90px' },
        { color: 'rgba(244, 63, 94, 0.05)', size: '300px', x: '30%', y: '50%', blur: '80px' },
      ],
      noiseOpacity: 0.02,
      vignetteOpacity: 0.3,
      cardGlass: 'rgba(244, 63, 94, 0.03)',
      cardGlassHover: 'rgba(251, 191, 36, 0.05)',
    },
    colors: {
      // Backgrounds - Warm dark with rose undertones
      bg0: '#140e11',
      bg1: '#1a1216',
      bg2: '#23181c',
      bgElevated: '#2d1f24',
      bgHover: '#37262c',
      bgTertiary: '#412d34',
      bgActive: '#4b343c',

      // Primary accent - Rose red
      primary50: '#fff1f2',
      primary100: '#ffe4e6',
      primary200: '#fecdd3',
      primary300: '#fda4af',
      primary400: '#fb7185',
      primary500: '#f43f5e',
      primary600: '#e11d48',
      primary700: '#be123c',
      primary800: '#9f1239',
      primary900: '#881337',

      // Secondary accent - Gold
      secondary: '#fbbf24',
      secondarySoft: 'rgba(251, 191, 36, 0.12)',

      // Status colors
      success: '#10b981',
      warning: '#f59e0b',
      error: '#dc2626',

      // Text - Warm tinted
      textPrimary: 'rgba(255, 241, 242, 0.92)',
      textSecondary: 'rgba(255, 228, 230, 0.64)',
      textMuted: 'rgba(254, 205, 211, 0.40)',

      // Borders
      border: 'rgba(255, 255, 255, 0.10)',
      borderSubtle: 'rgba(255, 255, 255, 0.05)',
      borderStrong: 'rgba(255, 255, 255, 0.15)',

      // Glows
      glowPrimary: 'rgba(244, 63, 94, 0.25)',
      glowSecondary: 'rgba(251, 191, 36, 0.2)',
      shadowColor: 'rgba(0, 0, 0, 0.5)',

      selection: 'rgba(244, 63, 94, 0.3)',

      buttonPrimary: '#f43f5e',
      buttonPrimaryHover: '#e11d48',
      buttonSecondary: '#23181c',
      buttonSecondaryHover: '#2d1f24',

      cardBorder: 'rgba(255, 255, 255, 0.10)',
      cardHoverBorder: 'rgba(244, 63, 94, 0.30)',

      inputBg: '#140e11',
      inputBorder: 'rgba(255, 255, 255, 0.10)',
      inputFocusBorder: '#f43f5e',

      scrollbarTrack: '#140e11',
      scrollbarThumb: '#2d1f24',
      scrollbarThumbHover: '#37262c',

      progressBg: '#140e11',
      progressFill: '#f43f5e',

      tagBg: 'rgba(244, 63, 94, 0.15)',
      tagText: '#fb7185',
    },
  },

  // ============================================================================
  // 10. SLATE MINIMAL - Clean, professional, accessible
  // ============================================================================
  'slate-minimal': {
    id: 'slate-minimal',
    name: 'Slate Minimal',
    description: 'Clean and professional with maximum readability',
    preview: {
      primary: '#64748b',
      secondary: '#3b82f6',
      background: '#0f172a',
    },
    atmosphere: {
      // Minimal theme has subtle, professional gradients
      gradient: `
        radial-gradient(ellipse 80% 40% at 50% 0%, rgba(59, 130, 246, 0.06) 0%, transparent 50%),
        linear-gradient(180deg, transparent 70%, rgba(59, 130, 246, 0.03) 100%)
      `,
      orbs: [
        { color: 'rgba(59, 130, 246, 0.05)', size: '400px', x: '50%', y: '0%', blur: '100px' },
        { color: 'rgba(100, 116, 139, 0.04)', size: '300px', x: '90%', y: '60%', blur: '80px' },
      ],
      noiseOpacity: 0.01,
      vignetteOpacity: 0.2,
      cardGlass: 'rgba(59, 130, 246, 0.02)',
      cardGlassHover: 'rgba(59, 130, 246, 0.04)',
    },
    colors: {
      // Backgrounds - Clean slate grays
      bg0: '#0a0f1a',
      bg1: '#0f172a',
      bg2: '#1e293b',
      bgElevated: '#273449',
      bgHover: '#334155',
      bgTertiary: '#3e4c63',
      bgActive: '#475569',

      // Primary accent - Slate (neutral)
      primary50: '#f8fafc',
      primary100: '#f1f5f9',
      primary200: '#e2e8f0',
      primary300: '#cbd5e1',
      primary400: '#94a3b8',
      primary500: '#64748b',
      primary600: '#475569',
      primary700: '#334155',
      primary800: '#1e293b',
      primary900: '#0f172a',

      // Secondary accent - Bright blue
      secondary: '#3b82f6',
      secondarySoft: 'rgba(59, 130, 246, 0.12)',

      // Status colors
      success: '#22c55e',
      warning: '#f59e0b',
      error: '#ef4444',

      // Text - High contrast
      textPrimary: 'rgba(241, 245, 249, 0.92)',
      textSecondary: 'rgba(203, 213, 225, 0.70)',
      textMuted: 'rgba(148, 163, 184, 0.50)',

      // Borders
      border: 'rgba(255, 255, 255, 0.10)',
      borderSubtle: 'rgba(255, 255, 255, 0.05)',
      borderStrong: 'rgba(255, 255, 255, 0.15)',

      // Glows
      glowPrimary: 'rgba(100, 116, 139, 0.2)',
      glowSecondary: 'rgba(59, 130, 246, 0.2)',
      shadowColor: 'rgba(0, 0, 0, 0.5)',

      selection: 'rgba(59, 130, 246, 0.3)',

      buttonPrimary: '#3b82f6',
      buttonPrimaryHover: '#2563eb',
      buttonSecondary: '#1e293b',
      buttonSecondaryHover: '#273449',

      cardBorder: 'rgba(255, 255, 255, 0.10)',
      cardHoverBorder: 'rgba(59, 130, 246, 0.30)',

      inputBg: '#0a0f1a',
      inputBorder: 'rgba(255, 255, 255, 0.10)',
      inputFocusBorder: '#3b82f6',

      scrollbarTrack: '#0a0f1a',
      scrollbarThumb: '#273449',
      scrollbarThumbHover: '#334155',

      progressBg: '#0a0f1a',
      progressFill: '#3b82f6',

      tagBg: 'rgba(59, 130, 246, 0.15)',
      tagText: '#60a5fa',
    },
  },
};

// Get theme by ID
export function getTheme(themeId) {
  return THEMES[themeId] || THEMES['cosmic-violet'];
}

// Get all theme IDs
export function getThemeIds() {
  return Object.keys(THEMES);
}

// Generate CSS variables from theme - COMPREHENSIVE version
export function generateThemeCSSVariables(themeId) {
  const theme = getTheme(themeId);
  const { colors, atmosphere } = theme;

  const cssVars = {
    // Atmosphere - Visual depth elements
    '--atmosphere-gradient': atmosphere?.gradient || 'none',
    '--atmosphere-noise-opacity': atmosphere?.noiseOpacity || 0,
    '--atmosphere-vignette-opacity': atmosphere?.vignetteOpacity || 0,
    '--atmosphere-card-glass': atmosphere?.cardGlass || 'transparent',
    '--atmosphere-card-glass-hover': atmosphere?.cardGlassHover || 'transparent',
    '--atmosphere-scan-lines': atmosphere?.scanLines ? '1' : '0',
    '--atmosphere-grid-lines': atmosphere?.gridLines ? '1' : '0',
    '--atmosphere-caustics': atmosphere?.caustics ? '1' : '0',

    // Backgrounds
    '--bg-0': colors.bg0,
    '--bg-1': colors.bg1,
    '--bg-2': colors.bg2,
    '--bg-elevated': colors.bgElevated,
    '--bg-hover': colors.bgHover,
    '--bg-tertiary': colors.bgTertiary,
    '--bg-active': colors.bgActive,

    // Legacy bg aliases
    '--bg-root': colors.bg0,
    '--bg-surface': colors.bg1,
    '--bg-surface-alt': colors.bg2,

    // Primary colors
    '--primary-50': colors.primary50,
    '--primary-100': colors.primary100,
    '--primary-200': colors.primary200,
    '--primary-300': colors.primary300,
    '--primary-400': colors.primary400,
    '--primary-500': colors.primary500,
    '--primary-600': colors.primary600,
    '--primary-700': colors.primary700,
    '--primary-800': colors.primary800,
    '--primary-900': colors.primary900,

    // Secondary
    '--secondary': colors.secondary,
    '--secondary-soft': colors.secondarySoft,

    // Status colors
    '--success': colors.success,
    '--warning': colors.warning,
    '--error': colors.error,
    '--accent-success': colors.success,
    '--accent-warning': colors.warning,
    '--accent-danger': colors.error,

    // Text
    '--text-primary': colors.textPrimary,
    '--text-secondary': colors.textSecondary,
    '--text-muted': colors.textMuted,
    '--text-high': colors.textPrimary,
    '--text-med': colors.textSecondary,
    '--text-dim': colors.textMuted,

    // Foreground aliases
    '--fg-primary': colors.textPrimary,
    '--fg-secondary': colors.textSecondary,
    '--fg-muted': colors.textMuted,

    // Borders
    '--border': colors.border,
    '--border-subtle': colors.borderSubtle,
    '--border-strong': colors.borderStrong,

    // Glows and shadows
    '--glow-primary': colors.glowPrimary,
    '--glow-secondary': colors.glowSecondary,
    '--glow-soft': `0 0 40px ${colors.glowPrimary}`,
    '--glow-aux': `0 0 40px ${colors.glowSecondary}`,
    '--shadow-glow': `0 4px 20px ${colors.glowPrimary}`,
    '--shadow-primary': `0 4px 16px ${colors.glowPrimary}`,
    '--shadow-soft': `0 8px 32px ${colors.shadowColor}`,
    '--shadow': colors.shadowColor,

    // Focus ring
    '--focus-ring': `0 0 0 3px ${colors.glowPrimary}`,

    // Selection
    '--selection-bg': colors.selection,

    // Accent aliases
    '--accent': colors.primary500,
    '--accent-2': colors.primary400,
    '--accent-3': colors.primary600,
    '--accent-4': colors.primary700,
    '--accent-main': colors.primary500,
    '--accent-main-soft': colors.glowPrimary,
    '--accent-aux': colors.secondary,
    '--accent-aux-soft': colors.secondarySoft,

    // Gradients
    '--grad-xp': `linear-gradient(90deg, ${colors.primary500} 0%, ${colors.secondary} 100%)`,
    '--grad-cosmic-radial': `radial-gradient(circle at 10% -10%, ${colors.glowPrimary}, transparent 50%), radial-gradient(circle at 90% 120%, ${colors.glowSecondary}, transparent 50%)`,
    '--grad-card': `linear-gradient(135deg, rgba(255, 255, 255, 0.02), rgba(255, 255, 255, 0.00))`,

    // Button colors
    '--button-primary': colors.buttonPrimary,
    '--button-primary-hover': colors.buttonPrimaryHover,
    '--button-secondary': colors.buttonSecondary,
    '--button-secondary-hover': colors.buttonSecondaryHover,

    // Card
    '--card-bg': colors.bg1,
    '--card-border': colors.cardBorder,
    '--card-hover-border': colors.cardHoverBorder,

    // Input
    '--input-bg': colors.inputBg,
    '--input-border': colors.inputBorder,
    '--input-focus-border': colors.inputFocusBorder,

    // Scrollbar
    '--scrollbar-track': colors.scrollbarTrack,
    '--scrollbar-thumb': colors.scrollbarThumb,
    '--scrollbar-thumb-hover': colors.scrollbarThumbHover,

    // Progress
    '--progress-bg': colors.progressBg,
    '--progress-fill': colors.progressFill,

    // Tags
    '--tag-bg': colors.tagBg,
    '--tag-text': colors.tagText,

    // Muted
    '--muted': colors.textMuted,
  };

  // Add orb CSS variables if atmosphere has orbs
  if (atmosphere?.orbs) {
    atmosphere.orbs.forEach((orb, index) => {
      cssVars[`--orb-${index + 1}-color`] = orb.color;
      cssVars[`--orb-${index + 1}-size`] = orb.size;
      cssVars[`--orb-${index + 1}-x`] = orb.x;
      cssVars[`--orb-${index + 1}-y`] = orb.y;
      cssVars[`--orb-${index + 1}-blur`] = orb.blur;
    });
  }

  return cssVars;
}

// Get theme atmosphere config (for components that need orb data)
export function getThemeAtmosphere(themeId) {
  const theme = getTheme(themeId);
  return theme.atmosphere || {};
}

export default THEMES;
