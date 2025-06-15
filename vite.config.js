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
    ],
    cors: {
      origin: [
        'https://sipb.crulxproject.com', 
        'https://fe-sipb.crulxproject.com',
        'http://127.0.0.2:5173',
        'http://127.0.0.1',
      ],
      credentials: true
    },
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-XSRF-TOKEN'
    }
  },
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router', 'pinia'],
          api: ['axios']
        }
      }
    }
  }
})
