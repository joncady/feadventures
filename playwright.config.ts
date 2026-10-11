import { defineConfig } from '@playwright/test';
export default defineConfig({
  // CI uses CPU-rendered WebGL; concurrent dense framebuffers starve game-clock checks.
  workers: process.env.CI ? 1 : undefined,
  timeout: process.env.CI ? 60000 : 30000,
  expect: { timeout: process.env.CI ? 10000 : 5000 },
  testDir: './tests/e2e', use: { baseURL: 'http://127.0.0.1:4173' },
  webServer: { command: 'npm run dev -- --port 4173 --strictPort', port: 4173, reuseExistingServer: false },
});
