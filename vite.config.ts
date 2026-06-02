import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
  plugins: [react(), tailwindcss(), VitePWA({
    registerType: 'autoUpdate',
    manifest: {
      name: 'QALBIE',
      short_name: 'Qalbie',
      theme_color: '#F375AE',
      background_color: '#FFC5DF',
      display: 'standalone',
      start_url: '/dashboard',
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
  }), cloudflare()],
})