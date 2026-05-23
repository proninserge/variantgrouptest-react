import { fileURLToPath, URL } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import svgr from 'vite-plugin-svgr';

export default defineConfig({
  plugins: [
    react(),
    svgr({
      svgrOptions: {
        icon: true,
      },
    }),
  ],

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },

  build: {
    target: 'es2020',
    cssCodeSplit: true,
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: ({ names }) => {
          const name = names[0] ?? '';
          if (/\.(png|jpe?g|gif|svg|webp|avif)$/i.test(name))
            return 'assets/images/[name]-[hash][extname]';
          return 'assets/[name]-[hash][extname]';
        },

        manualChunks(id) {
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/'))
            return 'vendor-react';
          if (id.includes('node_modules/react-router/')) return 'vendor-router';
          if (id.includes('node_modules/zustand/')) return 'vendor-store';
          if (id.includes('node_modules/@tanstack/')) return 'vendor-query';
          if (
            id.includes('node_modules/zod/') ||
            id.includes('node_modules/react-hook-form/') ||
            id.includes('node_modules/@hookform/')
          )
            return 'vendor-forms';
          return undefined;
        },
      },
    },
  },
});
