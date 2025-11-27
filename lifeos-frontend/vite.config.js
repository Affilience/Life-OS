import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
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

          // Three.js and 3D - only used in demos, lazy loaded
          if (id.includes('node_modules/three') ||
              id.includes('node_modules/@react-three') ||
              id.includes('node_modules/@react-spring/three')) {
            return 'three-vendor';
          }

          // D3 - charts and visualizations
          if (id.includes('node_modules/d3')) {
            return 'd3-vendor';
          }

          // Recharts - dashboard charts
          if (id.includes('node_modules/recharts')) {
            return 'recharts-vendor';
          }

          // Markdown - knowledge base
          if (id.includes('node_modules/react-markdown') ||
              id.includes('node_modules/remark')) {
            return 'markdown-vendor';
          }

          // Framer Motion - animations
          if (id.includes('node_modules/framer-motion')) {
            return 'motion-vendor';
          }

          // Date utilities
          if (id.includes('node_modules/date-fns')) {
            return 'date-vendor';
          }

          // Zustand - state management (small, keep in main)
          // Query client
          if (id.includes('node_modules/@tanstack')) {
            return 'query-vendor';
          }

          // Particles - effects
          if (id.includes('node_modules/@tsparticles') ||
              id.includes('node_modules/tsparticles')) {
            return 'particles-vendor';
          }

          // Supabase client
          if (id.includes('node_modules/@supabase')) {
            return 'supabase-vendor';
          }

          // AI SDKs
          if (id.includes('node_modules/@anthropic-ai') ||
              id.includes('node_modules/openai')) {
            return 'ai-vendor';
          }

          // Lottie animations
          if (id.includes('node_modules/lottie')) {
            return 'lottie-vendor';
          }

          // Grid layout
          if (id.includes('node_modules/react-grid-layout') ||
              id.includes('node_modules/react-resizable') ||
              id.includes('node_modules/react-draggable')) {
            return 'grid-vendor';
          }
        }
      }
    },
    // Increase chunk size warning limit for large vendor chunks
    chunkSizeWarningLimit: 500,
    // Enable minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug']
      }
    },
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
      'lucide-react',
      'zustand',
      'date-fns'
    ],
    // Exclude heavy deps that are lazy loaded
    exclude: ['three', '@react-three/fiber', '@react-three/drei', 'd3']
  },
  // Enable CSS code splitting
  css: {
    devSourcemap: true
  }
})
