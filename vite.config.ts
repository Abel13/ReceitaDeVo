import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: false,
      manifestFilename: 'manifest.json',
      includeAssets: [
        'icon.png',
        'logo.png',
        'apple-icon-180.png',
        'manifest-icon-192.maskable.png',
        'manifest-icon-512.maskable.png',
        'ios/180.png',
        'ios/167.png',
        'ios/152.png',
        'ios/144.png',
        'ios/120.png',
        'ios/114.png',
        'ios/1024.png',
      ],
      manifest: {
        name: 'Receita de Vó',
        short_name: 'ReceitaVó',
        description: 'Sabores que atravessam gerações',
        lang: 'pt-BR',
        dir: 'ltr',
        theme_color: '#C4622D',
        background_color: '#FAF6F0',
        display: 'standalone',
        orientation: 'any',
        scope: '/',
        start_url: '/',
        categories: ['food', 'lifestyle'],
        icons: [
          {
            src: 'manifest-icon-192.maskable.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'manifest-icon-192.maskable.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: 'manifest-icon-512.maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'manifest-icon-512.maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
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
