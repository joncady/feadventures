import { defineConfig } from 'vite';

export default defineConfig({
  // Relative URLs work at both /feadventures/ and a github.io site root.
  base: './',
  build: { chunkSizeWarningLimit: 1600 },
});
