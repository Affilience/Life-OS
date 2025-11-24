/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      // Font Families
      fontFamily: {
        sans: ['Satoshi', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Monaco', 'Courier New', 'monospace'],
      },

      // Colors mapped to CSS variables
      colors: {
        bg: {
          0: 'var(--bg-0)',
          1: 'var(--bg-1)',
          2: 'var(--bg-2)',
          root: 'var(--bg-root)',
          surface: 'var(--bg-surface)',
          surfaceAlt: 'var(--bg-surface-alt)',
        },
        text: {
          high: 'var(--text-high)',
          med: 'var(--text-med)',
          dim: 'var(--text-dim)',
        },
        fg: {
          primary: 'var(--fg-primary)',
          secondary: 'var(--fg-secondary)',
          muted: 'var(--fg-muted)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          2: 'var(--accent-2)',
          3: 'var(--accent-3)',
          4: 'var(--accent-4)',
          main: 'var(--accent-main)',
          mainSoft: 'var(--accent-main-soft)',
          aux: 'var(--accent-aux)',
          auxSoft: 'var(--accent-aux-soft)',
          success: 'var(--accent-success)',
          warning: 'var(--accent-warning)',
          danger: 'var(--accent-danger)',
        },
        success: 'var(--success)',
        warning: 'var(--warning)',
        error: 'var(--error)',
        border: {
          DEFAULT: 'var(--border)',
          subtle: 'var(--border-subtle)',
          strong: 'var(--border-strong)',
        },
        muted: 'var(--muted)',
      },

      // Border Radius
      borderRadius: {
        'xs': 'var(--radius-xs)',
        'sm': 'var(--radius-sm)',
        'md': 'var(--radius-md)',
        'lg': 'var(--radius-lg)',
        'xl': 'var(--radius-xl)',
        'pill': 'var(--radius-pill)',
      },

      // Box Shadow
      boxShadow: {
        'z1': 'var(--shadow-z1)',
        'z2': 'var(--shadow-z2)',
        'glow': 'var(--shadow-glow)',
        'focus': 'var(--focus-ring)',
        'soft': 'var(--shadow-soft)',
        'glowSoft': 'var(--glow-soft)',
        'glowAux': 'var(--glow-aux)',
      },

      // Background Images
      backgroundImage: {
        'cosmic-root': 'var(--grad-cosmic-radial)',
        'cosmic-card': 'var(--grad-card)',
      },

      // Spacing (matches design tokens)
      spacing: {
        '1.5': 'var(--space-1-5)',
        '18': '4.5rem',
      },

      // Animation
      animation: {
        'fade-in': 'fadeIn var(--duration-enter) var(--ease-standard)',
        'slide-down': 'slideDown var(--duration-enter) var(--ease-standard)',
        'slide-up': 'slideUp var(--duration-enter) var(--ease-standard)',
        'scale-in': 'scaleIn var(--duration-enter) var(--ease-standard)',
        'pulse-subtle': 'pulse 120ms var(--ease-standard)',
        'glow': 'glow 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'xp-fill': 'xpFill 1.2s var(--ease-standard) forwards',
        'season-shift': 'seasonShift 20s ease infinite',
      },

      // Transition Duration
      transitionDuration: {
        'fast': 'var(--duration-fast)',
        'enter': 'var(--duration-enter)',
        'exit': 'var(--duration-exit)',
      },

      // Letter Spacing
      letterSpacing: {
        'tighter': 'var(--tracking-tight)',
      },
    },
  },
  plugins: [],
}