import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['firebase-admin']
  },
  server: {
    port: 5173,
    host: true
  }
});