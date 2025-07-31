import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  css: {
    modules: {
      scopeBehaviour: 'local',
    },
  },
  server: {
    port: 5173,
  },
});
