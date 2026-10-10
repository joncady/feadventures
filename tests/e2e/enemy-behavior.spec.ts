import { test, expect, type Page } from '@playwright/test';

async function fixture(page: Page, x: number, y: number, speed: number, texture = 'soldier') {
  await page.goto('/');
  await page.getByRole('button', { name: 'Begin battle' }).click();
  await page.evaluate(async ({ x, y, speed, texture }) => {
    const entry = '/src/main.ts'; const { game } = await import(entry);
    const scene = game.scene.getScene('Arena');
    scene.enemies.clear(true, true); scene.time.removeAllEvents(); scene.spawning = 0;
    scene.player.body.reset(190, 230);
    const enemy = scene.enemies.create(x, y, texture);
    enemy.setSize(28, 28).setOffset(11, 15).setCollideWorldBounds(true);
    enemy.setData({ health: 100, maxHealth: 100, damage: 10, speed });
  }, { x, y, speed, texture });
}
async function state(page: Page) {
  return page.evaluate(async () => {
    const entry = '/src/main.ts'; const { game } = await import(entry);
    const scene = game.scene.getScene('Arena');
    const enemy = scene.enemies.getChildren()[0];
    return { health: scene.health, phase: scene.brains.get(enemy)?.phase, arrows: scene.arrows.countActive(), x: enemy.x, y: enemy.y };
  });
}

test('melee has a dodgeable windup and a cooldown between hits', async ({ page }) => {
  await fixture(page, 240, 230, 0);
  await expect.poll(async () => (await state(page)).phase, { intervals: [16, 50] }).toBe('windup');
  expect((await state(page)).health).toBe(100);
  await page.evaluate(async () => {
    const entry = '/src/main.ts'; const { game } = await import(entry);
    game.scene.getScene('Arena').player.body.reset(190, 300);
  });
  await expect.poll(async () => (await state(page)).phase, { intervals: [16, 50] }).toBe('recover');
  expect((await state(page)).health).toBe(100);
  await page.evaluate(async () => {
    const entry = '/src/main.ts'; const { game } = await import(entry);
    game.scene.getScene('Arena').player.body.reset(190, 230);
  });
  await expect.poll(async () => (await state(page)).health).toBe(90);
  await page.waitForTimeout(750);
  expect((await state(page)).health).toBe(90);
});

test('melee navigates around the building and reaches attack range', async ({ page }) => {
  await fixture(page, 480, 80, 150);
  expect(await page.evaluate(async () => {
    const entry = '/src/main.ts'; const { game } = await import(entry);
    const scene = game.scene.getScene('Arena');
    return scene.hasLineOfSight(scene.bodyCenter(scene.enemies.getChildren()[0]), scene.bodyCenter(scene.player));
  })).toBe(false);
  await expect.poll(async () => (await state(page)).health, { timeout: 12000 }).toBeLessThan(100);
});

test('archer moves around cover before shooting', async ({ page }) => {
  await fixture(page, 480, 80, 150, 'archer');
  await page.waitForTimeout(500);
  expect((await state(page)).arrows).toBe(0);
  await expect.poll(async () => (await state(page)).arrows, { timeout: 10000 }).toBeGreaterThan(0);
  expect((await state(page)).y).toBeGreaterThan(100);
});
