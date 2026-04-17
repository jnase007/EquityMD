import { defineConfig, type UserConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
  plugins: [react()],
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@supabase/supabase-js',
      'lucide-react'
    ]
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router-dom')) return 'react-vendor';
          if (id.includes('node_modules/lucide-react')) return 'ui-vendor';
          if (id.includes('node_modules/@supabase')) return 'supabase-vendor';
          if (id.includes('node_modules/@stripe')) return 'stripe-vendor';
          if (id.includes('node_modules/mapbox-gl')) return 'mapbox-vendor';
          if (id.includes('node_modules/recharts')) return 'chart-vendor';
          if (id.includes('node_modules/date-fns')) return 'date-vendor';
          if (id.includes('node_modules/papaparse') || id.includes('node_modules/zustand')) return 'utils-vendor';
        }
      },
    },
    outDir: 'dist',
    // Ensure _redirects and netlify.toml are copied to build output
    copyPublicDir: true,
    chunkSizeWarningLimit: 1000,
    sourcemap: false, // Disable sourcemaps in production
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true
      }
    }
  },
});