// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],

  // ── Base URL ───────────────────────────────────────────────
  // Must be '/' for Vercel — do NOT change to './'
  // A relative base breaks absolute asset paths after deploy
  base: '/',

  // ── Path aliases ───────────────────────────────────────────
  // Lets you write:  import Foo from '@/components/Foo'
  // instead of:      import Foo from '../../components/Foo'
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  // ── Dev server ─────────────────────────────────────────────
  server: {
    port       : 5173,
    strictPort : true,   // fail fast if 5173 is taken
    open       : false,  // set true if you want the browser to auto-open

    // Proxy API calls in dev so you never hit CORS locally
    // e.g.  axios.get('/api/auth/me')  →  http://localhost:5000/api/auth/me
    proxy: {
      '/api': {
        target      : 'http://localhost:5000',
        changeOrigin: true,
        secure      : false,
      },
    },
  },

  // ── Preview server (vite preview) ─────────────────────────
  preview: {
    port      : 4173,
    strictPort: true,
  },

  // ── Build ──────────────────────────────────────────────────
  build: {
    outDir         : 'dist',
    emptyOutDir    : true,
    sourcemap      : false,   // flip to true when debugging production bundle
    chunkSizeWarningLimit: 600,

    rollupOptions: {
      output: {
        // Split vendor code into a separate chunk so the app chunk
        // stays small and browsers can cache vendor libs independently
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            // React core — always needed, cache forever
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react';
            }
            // Router
            if (id.includes('react-router')) {
              return 'vendor-router';
            }
            // Animation
            if (id.includes('framer-motion')) {
              return 'vendor-motion';
            }
            // i18n
            if (id.includes('i18next') || id.includes('react-i18next')) {
              return 'vendor-i18n';
            }
            // HTTP
            if (id.includes('axios')) {
              return 'vendor-axios';
            }
            // Charts
            if (id.includes('recharts') || id.includes('d3')) {
              return 'vendor-charts';
            }
            // Everything else in node_modules
            return 'vendor-misc';
          }
        },
      },
    },
  },

  // ── Optimise deps ──────────────────────────────────────────
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'axios',
      'framer-motion',
      'i18next',
      'react-i18next',
    ],
  },
});