import { expect, type Page } from '@playwright/test';

/** waitForFunction treats a Promise as truthy rather than polling its resolved value. */
export async function waitForAsyncReady(page: Page, predicate: () => Promise<unknown>) {
  await expect.poll(async () => Boolean(await page.evaluate(predicate)), {
    message: 'Await the resolved game readiness predicate',
  }).toBe(true);
}
