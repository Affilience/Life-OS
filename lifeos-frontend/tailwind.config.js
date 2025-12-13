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

      // Colors mapped to CSS variables - comprehensive theme support
      colors: {
        // Background colors - these change with theme
        bg: {
          0: 'var(--bg-0)',
          1: 'var(--bg-1)',
          2: 'var(--bg-2)',
          elevated: 'var(--bg-elevated)',
          hover: 'var(--bg-hover)',
          tertiary: 'var(--bg-tertiary)',
          active: 'var(--bg-active)',
          root: 'var(--bg-0)',
          surface: 'var(--bg-1)',
          surfaceAlt: 'var(--bg-2)',
          card: 'var(--bg-1)',
          input: 'var(--bg-0)',
        },

        // Text colors
        text: {
          high: 'var(--text-primary)',
          med: 'var(--text-secondary)',
          dim: 'var(--text-muted)',
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
        },

        fg: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
        },

        // Primary accent colors (full scale)
        primary: {
          50: 'var(--primary-50)',
          100: 'var(--primary-100)',
          200: 'var(--primary-200)',
          300: 'var(--primary-300)',
          400: 'var(--primary-400)',
          500: 'var(--primary-500)',
          600: 'var(--primary-600)',
          700: 'var(--primary-700)',
          800: 'var(--primary-800)',
          900: 'var(--primary-900)',
          DEFAULT: 'var(--primary-500)',
        },

        // Accent colors (aliases)
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

        // Secondary accent
        secondary: {
          DEFAULT: 'var(--secondary)',
          soft: 'var(--secondary-soft)',
        },

        // Status colors
        success: {
          DEFAULT: 'var(--success)',
          50: 'var(--success-50, #ecfdf5)',
          500: 'var(--success)',
        },
        warning: {
          DEFAULT: 'var(--warning)',
          50: 'var(--warning-50, #fffbeb)',
          500: 'var(--warning)',
        },
        error: {
          DEFAULT: 'var(--error)',
          50: 'var(--error-50, #fff1f2)',
          500: 'var(--error)',
        },

        // Border colors
        border: {
          DEFAULT: 'var(--border)',
          subtle: 'var(--border-subtle)',
          strong: 'var(--border-strong)',
        },

        muted: 'var(--text-muted)',

        // Glow colors
        glow: {
          primary: 'var(--glow-primary)',
          secondary: 'var(--glow-secondary)',
        },
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
        'primary': 'var(--shadow-primary)',
      },

      // Background Images
      backgroundImage: {
        'cosmic-root': 'var(--grad-cosmic-radial)',
        'cosmic-card': 'var(--grad-card)',
        'grad-xp': 'var(--grad-xp)',
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
        'pulse-slow': 'pulse 3s ease-in-out infinite',
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
