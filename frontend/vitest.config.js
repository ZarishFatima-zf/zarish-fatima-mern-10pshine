// vitest.config.js
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom', // simulates browser DOM for React tests
    setupFiles: './setupTests.js', // optional setup file (like Jest)
    css: true, // allow importing CSS in components
    alias: {
      '@': '/src',
    },
  },
});
