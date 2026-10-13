import { test, expect } from '@playwright/test';
import { waitForAsyncReady } from './async-readiness';

test('async game readiness polls resolved false values until readiness is true', async ({ page }) => {
  await page.setContent('<script>window.readinessCalls = 0;</script>');
  // Document script variables are visible: waitForFunction defaults to the main world.
  const prematurelyResolved = await page.waitForFunction(async () => {
    (window as any).readinessCalls++;
    return false;
  });
  expect(await prematurelyResolved.jsonValue()).toBe(false);
  expect(await page.evaluate(() => (window as any).readinessCalls)).toBe(1);
  await waitForAsyncReady(page, async () => ++(window as any).readinessCalls >= 4);
  expect(await page.evaluate(() => (window as any).readinessCalls)).toBe(4);
});
