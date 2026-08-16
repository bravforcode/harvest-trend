import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      includeAssets: ['icon.svg', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png', 'og-image.png'],
      manifest: {
        name: 'Harvest Trend · รู้ทันราคา',
        short_name: 'Harvest Trend',
        description: 'ตรวจราคาพืชผล 77 จังหวัด 25 พืชหลัก พร้อมคำแนะนำจังหวะเก็บเกี่ยว/ขาย ใช้ฟรี ใช้งานง่ายสำหรับเกษตรกร',
        lang: 'th',
        theme_color: '#2C4A24',
        background_color: '#F6F1E2',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }
        ]
      },
      workbox: {
        /* network-first shell + never-cache /api are implemented in
           src/sw.ts (injectManifest) — see the navigation fallback and the
           NetworkOnly /api route there. */
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024
      }
    })
  ],
  build: {
    target: 'es2020',
    outDir: 'dist'
  }
});