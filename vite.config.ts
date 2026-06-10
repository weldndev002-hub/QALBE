import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true
      },
      manifest: {
        name: 'QALBIE',
        short_name: 'Qalbie',
        theme_color: '#F375AE',
        background_color: '#FFC5DF',
        display: 'standalone',
        start_url: '/membership',
        icons: [
          {
            src: '/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ],
      },
      workbox: {
        runtimeCaching: [
          { urlPattern: /\/api\/articles/, handler: 'StaleWhileRevalidate' },
          { urlPattern: /\/audio\//, handler: 'CacheFirst' },
        ],
      },
    })
  ],

  // Proxy /api dan /callback ke wrangler dev saat development
  // Jalankan `npm run dev:worker` di terminal terpisah
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8787',
        changeOrigin: true,
      },
      '/callback': {
        target: 'http://localhost:8787',
        changeOrigin: true,
      },
    },
  },
})
