import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.png', 'logo.png'],
      manifest: {
        name: 'Receita de Vó',
        short_name: 'ReceitaVó',
        description: 'Sabores que atravessam gerações',
        theme_color: '#C4622D',
        background_color: '#FAF6F0',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: 'icon.png', sizes: '1024x1024', type: 'image/png' },
          { src: 'icon.png', sizes: '1024x1024', type: 'image/png', purpose: 'any maskable' }
        ]
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/firebasestorage\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'firebase-images',
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 }
            }
          }
        ]
      }
    })
  ],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') }
  }
})
