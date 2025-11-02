/// <reference types="vitest" />
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    allowedHosts: [
      'fe-sipb.crulxproject.com',
      '127.0.0.2',
      '127.0.0.1'
    ]
  },
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    },
    // ✅ Ensure only one instance of these singletons is bundled
    dedupe: ['vue', 'pinia']
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      output: {
        // Better control over chunk splitting to avoid duplication and reduce initial payload
        manualChunks(id) {
          if (id.includes('node_modules')) return 'vendor'
          if (id.includes('/src/stores/')) return 'stores'
          if (id.includes('/src/utils/') || id.includes('/src/lib/')) return 'utils'
        }
      }
    }
  },
  test: {
    environment: 'happy-dom',
  },
})