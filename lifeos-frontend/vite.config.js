import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Optimize JSX transform
      jsxRuntime: 'automatic',
    }),
  ],

  // Important: Use relative paths for Capacitor iOS/Android builds
  base: './',

  // Resolve module compatibility issues
  resolve: {
    alias: {
      'lodash': 'lodash-es',
      // Force recharts to use root react-is instead of its nested copy
      'react-is': 'react-is',
    },
    dedupe: ['react', 'react-dom', 'react-is'],
  },

  build: {
    // Output directory (must match capacitor.config.ts webDir)
    outDir: 'dist',
    // Optimize chunk splitting
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Core React vendor chunk - loaded on every page
          if (id.includes('node_modules/react') ||
              id.includes('node_modules/react-dom') ||
              id.includes('node_modules/react-router')) {
            return 'react-vendor';
          }

          // Lucide icons - used everywhere
          if (id.includes('node_modules/lucide-react')) {
            return 'lucide';
          }

          // D3 - charts and visualizations (lazy loaded)
          if (id.includes('node_modules/d3')) {
            return 'd3-vendor';
          }

          // Recharts - dashboard charts
          if (id.includes('node_modules/recharts')) {
            return 'recharts-vendor';
          }

          // Framer Motion - animations
          if (id.includes('node_modules/framer-motion')) {
            return 'motion-vendor';
          }

          // Date utilities
          if (id.includes('node_modules/date-fns')) {
            return 'date-vendor';
          }

          // Query client
          if (id.includes('node_modules/@tanstack')) {
            return 'query-vendor';
          }

          // Canvas confetti - celebrations (lazy)
          if (id.includes('node_modules/canvas-confetti')) {
            return 'confetti-vendor';
          }

          // Supabase client
          if (id.includes('node_modules/@supabase')) {
            return 'supabase-vendor';
          }

          // AI SDKs (lazy - only loaded for Nova)
          if (id.includes('node_modules/@anthropic-ai') ||
              id.includes('node_modules/openai')) {
            return 'ai-vendor';
          }

          // Grid layout
          if (id.includes('node_modules/react-grid-layout') ||
              id.includes('node_modules/react-resizable') ||
              id.includes('node_modules/react-draggable')) {
            return 'grid-vendor';
          }

          // Anime.js - animations
          if (id.includes('node_modules/animejs') ||
              id.includes('node_modules/anime')) {
            return 'anime-vendor';
          }

          // GSAP - advanced animations
          if (id.includes('node_modules/gsap')) {
            return 'gsap-vendor';
          }

          // UUID - utilities
          if (id.includes('node_modules/uuid')) {
            return 'utils-vendor';
          }
        }
      },
      // Better tree-shaking
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
      },
    },
    // Increase chunk size warning limit for large vendor chunks
    chunkSizeWarningLimit: 500,
    // Enable minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
        passes: 2, // Multiple passes for better compression
      },
      mangle: {
        safari10: true, // Fix Safari 10/11 bugs
      },
      format: {
        comments: false, // Remove all comments
      },
    },
    // Enable CSS minification
    cssMinify: true,
    // Target modern browsers for smaller bundles
    target: 'es2020',
    // Enable source maps for debugging (can disable in prod)
    sourcemap: false
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'react-is',
      'lucide-react',
      'zustand',
      'date-fns',
      'framer-motion',
      'recharts'
    ],
  },
  // Enable tree-shaking for better dead code elimination
  esbuild: {
    treeShaking: true,
    legalComments: 'none',
  },
  // Enable CSS code splitting
  css: {
    devSourcemap: true
  },
  // Proxy API requests to backend server in development
  server: {
    host: true, // Allow external access for Capacitor live reload
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
