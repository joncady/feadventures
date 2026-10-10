import { test, expect, type Page } from '@playwright/test';

async function fixture(page: Page, x: number, y: number, speed: number, texture = 'soldier') {
  await page.goto('/');
  await page.getByRole('button', { name: 'Begin battle' }).click();
  await page.evaluate(async ({ x, y, speed, texture }) => {
    const entry = '/src/main.ts'; const { game } = await import(entry);
    const scene = game.scene.getScene('Arena');
    scene.allies.clear(true, true); scene.enemies.clear(true, true); scene.time.removeAllEvents(); scene.spawning = 0;
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
  const results = await page.evaluate(async () => {
    const entry = '/src/main.ts'; const { game } = await import(entry);
    const scene = game.scene.getScene('Arena');
    // Control scene time in one browser task so CI scheduling cannot consume the windup.
    scene.scene.pause();
    scene.brains = new WeakMap();
    scene.health = 100; scene.lastDamage = -Infinity;
    scene.player.body.reset(190, 230);
    const enemy = scene.enemies.getChildren()[0];
    enemy.body.reset(240, 230);
    const step = (time: number) => { scene.time.now = time; scene.updateEnemy(enemy, time); };
    step(1000); step(1250);
    const before = { phase: scene.brains.get(enemy).phase, health: scene.health };
    scene.player.body.reset(190, 300);
    step(1600);
    const dodged = { phase: scene.brains.get(enemy).phase, health: scene.health };
    scene.player.body.reset(190, 230);
    step(2700); step(3050);
    const hit = scene.health;
    step(3800);
    return { before, dodged, hit, duringCooldown: scene.health };
  });
  expect(results.before).toEqual({ phase: 'windup', health: 100 });
  expect(results.dodged).toEqual({ phase: 'recover', health: 100 });
  expect(results.hit).toBe(90);
  expect(results.duringCooldown).toBe(90);
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

test('an enemy embedded in the upper terrain edge recovers and can be hit by Fire', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Tharja', exact: true }).click();
  await page.getByRole('button', { name: 'Begin battle' }).click();
  const recovered = await page.evaluate(async () => {
    const entry = '/src/main.ts'; const { game } = await import(entry);
    const scene = game.scene.getScene('Arena'); scene.scene.pause();
    scene.allies.clear(true, true); scene.enemies.clear(true, true); scene.time.removeAllEvents(); scene.spawning = 0;
    scene.player.body.reset(350, 50); scene.player.body.updateFromGameObject();
    const enemy = scene.enemies.create(360, 100.5, 'soldier');
    enemy.setSize(28, 28).setOffset(11, 15).setCollideWorldBounds(true);
    enemy.setData({ health: 100, maxHealth: 100, damage: 10, speed: 0 });
    enemy.body.reset(360, 100.5); enemy.body.updateFromGameObject();
    const before = scene.navigation.isWalkable(scene.bodyCenter(enemy));
    scene.navigation.setTarget(scene.bodyCenter(scene.player));
    scene.updateEnemy(enemy, scene.time.now);
    const target = scene.bodyCenter(enemy), origin = scene.bodyCenter(scene.player);
    scene.fireArrow(scene.player, { x: (target.x-origin.x)/Math.hypot(target.x-origin.x,target.y-origin.y), y: (target.y-origin.y)/Math.hypot(target.x-origin.x,target.y-origin.y) }, 'player', 'tome');
    scene.scene.resume();
    return { before, after: scene.navigation.isWalkable(target), visible: scene.hasLineOfSight(origin,target) };
  });
  expect(recovered).toEqual({ before: false, after: true, visible: true });
  await expect.poll(() => page.evaluate(async () => {
    const entry = '/src/main.ts'; const { game } = await import(entry);
    return game.scene.getScene('Arena').enemies.getChildren()[0].getData('health');
  })).toBe(70);
});
