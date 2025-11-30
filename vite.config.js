import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Use relative paths for assets - required for live-server
  server: {
    port: 3002,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    assetsDir: 'assets'
  }
});


