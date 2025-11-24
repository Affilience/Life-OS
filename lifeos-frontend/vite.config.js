import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Optimize chunk splitting
    rollupOptions: {
      output: {
        manualChunks: {
          // Core vendor chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'lucide': ['lucide-react'],

          // Heavy library chunks (lazy loaded)
          'three-vendor': ['three', '@react-three/fiber', '@react-three/drei'],
          'd3-vendor': ['d3'],
          'markdown-vendor': ['react-markdown', 'remark-gfm'],
          'recharts-vendor': ['recharts'],

          // Module chunks - split by route
          'health': [
            './src/pages/HealthNew.jsx',
            './src/components/health/WorkoutsTab.jsx',
            './src/components/health/NutritionTab.jsx',
            './src/components/health/SleepTab.jsx',
            './src/components/health/RecoveryTab.jsx'
          ],
          'knowledge': [
            './src/pages/KnowledgeNew.jsx',
            './src/components/knowledge/LearningLogTab.jsx',
            './src/components/knowledge/IdeasTab.jsx',
            './src/components/knowledge/NotesTab.jsx'
          ],
          'journal': [
            './src/pages/JournalNew.jsx',
            './src/components/journal/JournalEditor.jsx',
            './src/components/journal/EntryHistory.jsx'
          ],
          'calendar': [
            './src/pages/CalendarNew.jsx',
            './src/components/calendar/WeekView.jsx',
            './src/components/calendar/DayView.jsx',
            './src/components/calendar/MonthView.jsx'
          ],
          'skills': [
            './src/pages/Skills.jsx',
            './src/components/skills/SkillCard.jsx'
          ],
          'financial': [
            './src/pages/Financial.jsx',
            './src/components/financial/FinancialDashboard.jsx',
            './src/components/financial/OverviewTab.jsx',
            './src/components/financial/IncomeTab.jsx',
            './src/components/financial/ExpensesTab.jsx'
          ]
        }
      }
    },
    // Increase chunk size warning limit for large vendor chunks
    chunkSizeWarningLimit: 1000,
    // Enable minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true
      }
    },
    // Target modern browsers for smaller bundles
    target: 'es2020'
  },
  // Optimize dependencies - only include commonly used ones
  // Heavy deps (three, d3, react-markdown) are lazy loaded via code splitting
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'lucide-react',
      'react-reconciler/constants'
    ],
    exclude: ['d3', 'react-markdown', 'remark-gfm']
  }
})
