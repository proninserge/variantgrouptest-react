import { fileURLToPath, URL } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vite';
import svgr from 'vite-plugin-svgr';

function fontPreloadPlugin(): Plugin {
  return {
    name: 'font-preload',
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        if (!ctx.bundle) return html;

        const tags = Object.keys(ctx.bundle)
          .filter((file) => file.endsWith('.woff2'))
          .map((file) => ({
            tag: 'link' as const,
            attrs: {
              rel: 'preload',
              href: `/${file}`,
              as: 'font',
              type: 'font/woff2',
              crossorigin: 'anonymous',
            },
            injectTo: 'head' as const,
          }));

        return tags;
      },
    },
  };
}

export default defineConfig({
  plugins: [
    react(),
    svgr({
      svgrOptions: {
        icon: true,
      },
    }),
    fontPreloadPlugin(),
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
        // Cтруктура папок в dist
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: ({ names }) => {
          const name = names[0] ?? '';
          if (/\.(woff2?|ttf|eot)$/i.test(name)) return 'assets/fonts/[name]-[hash][extname]';
          if (/\.(png|jpe?g|gif|svg|webp|avif)$/i.test(name))
            return 'assets/images/[name]-[hash][extname]';
          return 'assets/[name]-[hash][extname]';
        },

        // Разделение вендоров на стабильные долгосрочные чанки
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
