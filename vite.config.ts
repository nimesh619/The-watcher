import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  base: './',
  root: '.',
  
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@renderer': resolve(__dirname, 'src/renderer'),
      '@components': resolve(__dirname, 'src/renderer/components'),
      '@styles': resolve(__dirname, 'src/renderer/styles'),
    }
  },

  server: {
    port: 5173,
    strictPort: true,
  },

  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    target: 'esnext',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
    },
  },

  optimizeDeps: {
    exclude: ['electron']
  },
});