import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    // evita "Invalid hook call" por cópias duplicadas do React no dep-bundle
    dedupe: ['react', 'react-dom'],
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'zustand'],
  },
  server: {
    host: '127.0.0.1',
    port: 5190,
    strictPort: true,
    open: false,
  },
});
