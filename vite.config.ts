import { defineConfig } from 'vite';
import { readFileSync } from 'node:fs';

const { version } = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')) as { version: string };

export default defineConfig({
  // Relative URLs work at both /feadventures/ and a github.io site root.
  base: './',
  define: { __APP_VERSION__: JSON.stringify(version) },
  plugins: [{ name: 'frontend-version', transformIndexHtml: html => html.replaceAll('%APP_VERSION%', version) }],
  build: { chunkSizeWarningLimit: 1600 },
});
