import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: 'https://real-state-xd5o.onrender.com',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'https://real-state-xd5o.onrender.com',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
  },
});
