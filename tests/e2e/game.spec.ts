import { test, expect } from '@playwright/test';
test('loads assets, starts a wave, pauses, dies and restarts cleanly', async ({ page }) => {
  test.setTimeout(120000);
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
  await page.goto('/?battle=legacy');
  await page.getByRole('button', { name: 'Lucina', exact: true }).press('Enter');
  await page.getByRole('button', { name: 'Begin battle' }).press('Enter');
  await expect(page.locator('#hero-name')).toHaveText('Lucina · sword');
  await expect(page.locator('#game')).toHaveAttribute('data-enemies', '1');
  await page.getByRole('button', { name: 'Pause', exact: true }).press('Enter');
  await expect(page.locator('#notice')).toContainText('Paused');
  const pausedEnemyCount = await page.locator('#game').getAttribute('data-enemies');
  await page.waitForTimeout(1800);
  // A second staggered spawn can happen before the pause input is processed on
  // software-rendered CI. Assert that the observed paused state stays frozen.
  await expect(page.locator('#game')).toHaveAttribute('data-enemies', pausedEnemyCount!);
  await page.getByRole('button', { name: 'Resume', exact: true }).press('Enter');
  await page.locator('#game').focus();
  await page.keyboard.down('d'); await page.waitForTimeout(400); await page.keyboard.up('d');
  await page.keyboard.press('Space');
  // Exercise death deterministically; allied survival varies with enemy targets.
  await page.evaluate(async () => {
    const entry = '/src/main.ts'; const { game } = await import(entry);
    const scene = game.scene.getScene('Arena'); scene.lastDamage = -Infinity; scene.takeDamage(1000);
  });
  await expect(page.getByRole('button', { name: 'Try again' })).toBeVisible();
  await page.evaluate(async()=>{const {game}=await import(String('/src/main.ts'));const scene:any=game.scene.getScene('Arena');(window as any).__priorProjectiles=scene.arrows;(window as any).__priorEnemies=scene.enemies.getChildren().slice();});
  await page.getByRole('button', { name: 'Try again' }).press('Enter');
  await expect(page.locator('#health')).toHaveText('HP 100 / 100');
  await expect(page.locator('#wave')).toHaveText('Wave 1');
  await expect(page.locator('#kills')).toHaveText('Defeated 0');
  // Staggered spawns may have progressed by the time CI observes the new run. Verify reset identity instead.
  await expect.poll(()=>page.evaluate(async()=>{const {game}=await import(String('/src/main.ts'));const scene:any=game.scene.getScene('Arena');return scene.arrows!==(window as any).__priorProjectiles&&(window as any).__priorEnemies.every((enemy:any)=>!enemy.active)&&scene.enemies.countActive(true)>0;})).toBe(true);
  expect(errors).toEqual([]);
});
