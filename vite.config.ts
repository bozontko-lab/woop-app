import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { readFileSync } from 'node:fs';
import { defineConfig, type Plugin } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import { pl } from './src/content/pl.ts';

const { version } = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf-8')) as {
  version: string;
};

const LIGHT_BG = '#faf7f2';

/** Fills %APP_NAME% / %APP_DESCRIPTION% in index.html from the content file. */
function htmlContent(): Plugin {
  return {
    name: 'html-content',
    transformIndexHtml: (html) =>
      html.replaceAll('%APP_NAME%', pl.app.name).replaceAll('%APP_DESCRIPTION%', pl.app.description),
  };
}

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(version),
  },
  plugins: [
    react(),
    tailwindcss(),
    htmlContent(),
    VitePWA({
      registerType: 'prompt',
      injectRegister: false,
      includeAssets: ['favicon.svg', 'icons/apple-touch-icon.png'],
      manifest: {
        id: '/',
        name: pl.app.name,
        short_name: pl.app.name,
        description: pl.app.description,
        lang: 'pl',
        dir: 'ltr',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: LIGHT_BG,
        theme_color: LIGHT_BG,
        categories: ['health', 'lifestyle', 'productivity'],
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,webmanifest}'],
        navigateFallback: '/index.html',
        cleanupOutdatedCaches: true,
      },
    }),
  ],
  build: {
    rolldownOptions: {
      output: {
        // Libraries change rarely; separate chunks keep them cached across app updates.
        codeSplitting: {
          groups: [
            { name: 'react', test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/ },
            { name: 'router', test: /node_modules[\\/]react-router[\\/]/ },
            { name: 'dexie', test: /node_modules[\\/](dexie|dexie-react-hooks)[\\/]/ },
          ],
        },
      },
    },
  },
  server: { port: 5173 },
  preview: { port: 4173 },
});
