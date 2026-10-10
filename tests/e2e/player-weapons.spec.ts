import { test, expect } from '@playwright/test';

test('Virion fires past the close dead zone, hits enemies, and cleans up on restart', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await page.getByRole('button', { name: 'Virion', exact: true }).click();
  await expect(page.locator('#hero-description')).toContainText('Bow');
  await page.getByRole('button', { name: 'Begin battle' }).click();
  await expect(page.locator('#hero-name')).toHaveText('Virion · bow');
  await page.evaluate(async () => {
    const entry = '/src/main.ts'; const { game } = await import(entry);
    const scene = game.scene.getScene('Arena');
    scene.allies.clear(true, true); scene.enemies.clear(true, true); scene.time.removeAllEvents(); scene.spawning = 0;
    scene.player.body.reset(190, 230);
    for (const x of [245, 350]) {
      const enemy = scene.enemies.create(x, 230, 'soldier');
      enemy.setSize(28, 28).setOffset(11, 15);
      enemy.setData({ health: 100, maxHealth: 100, speed: 0, damage: 10, weapon: 'sword' });
    }
  });
  await page.locator('#game').focus();
  await page.keyboard.down('Space'); await page.waitForTimeout(80); await page.keyboard.up('Space');
  await expect.poll(() => page.evaluate(async () => {
    const entry = '/src/main.ts'; const { game } = await import(entry);
    return game.scene.getScene('Arena').enemies.getChildren().map((enemy: any) => enemy.getData('health'));
  })).toEqual([100, 65]);
  // Source palette background is transparent rather than a magenta box.
  expect(await page.evaluate(async () => {
    const entry = '/src/main.ts'; const { game } = await import(entry);
    const texture = game.textures.get('virion').getSourceImage();
    const canvas = document.createElement('canvas'); canvas.width = texture.width; canvas.height = texture.height;
    const ctx = canvas.getContext('2d')!; ctx.drawImage(texture, 0, 0);
    return ctx.getImageData(0, 0, 1, 1).data[3];
  })).toBe(0);
  await page.evaluate(async () => {
    const entry = '/src/main.ts'; const { game } = await import(entry);
    const scene = game.scene.getScene('Arena');
    scene.arrows.clear(true, true);
    scene.player.body.reset(245, 230);
    scene.fireArrow(scene.player, { x: 0, y: -1 }, 'player', 'bow');
  });
  await expect.poll(() => page.evaluate(async () => {
    const entry = '/src/main.ts'; const { game } = await import(entry);
    return game.scene.getScene('Arena').arrows.countActive();
  }), { timeout: 1500 }).toBe(0);
  await page.evaluate(async () => {
    const entry = '/src/main.ts'; const { game } = await import(entry);
    const scene = game.scene.getScene('Arena'); scene.lastDamage = -Infinity; scene.takeDamage(100);
  });
  await page.getByRole('button', { name: 'Try again' }).click();
  await expect(page.locator('#health')).toHaveText('HP 100 / 100');
  expect(await page.evaluate(async () => {
    const entry = '/src/main.ts'; const { game } = await import(entry);
    const scene = game.scene.getScene('Arena');
    return { arrows: scene.arrows.countActive(), pending: Boolean(scene.playerShot), texture: scene.player.texture.key };
  })).toEqual({ arrows: 0, pending: false, texture: 'virion' });
  expect(errors).toEqual([]);
});

test('triangle applies in both directions and Frederick has longer lance reach', async ({ page }) => {
  await page.goto('/'); await page.getByRole('button', { name: 'Begin battle' }).click();
  const result = await page.evaluate(async () => {
    const entry = '/src/main.ts'; const { game } = await import(entry);
    const scene = game.scene.getScene('Arena'); scene.scene.pause();
    scene.allies.clear(true, true); scene.enemies.clear(true, true); scene.time.removeAllEvents(); scene.spawning = 0;
    scene.player.body.reset(190, 230); scene.facing = { x: 1, y: 0 };
    const targets = ['axe', 'lance', 'sword'].map(weapon => {
      const enemy = scene.enemies.create(245, 230, 'soldier'); enemy.setSize(28, 28).setOffset(11, 15); enemy.body.reset(245, 230);
      enemy.setData({ health: 100, maxHealth: 100, weapon }); return enemy;
    });
    scene.attack();
    const dealt = targets.map((e: any) => 100 - e.getData('health'));
    scene.lastDamage = -Infinity; scene.takeDamage(10, 'lance'); const incoming = 100 - scene.health;
    scene.allies.clear(true, true); scene.enemies.clear(true, true);
    const distant = scene.enemies.create(290, 230, 'soldier'); distant.setSize(28, 28).setOffset(11, 15); distant.body.reset(290, 230);
    distant.setData({ health: 100, maxHealth: 100, weapon: 'sword' });
    scene.attack(); const swordHealth = distant.getData('health');
    scene.hero = 'frederick'; scene.attack(); const lanceHealth = distant.getData('health');
    return { dealt, incoming, swordHealth, lanceHealth };
  });
  expect(result).toEqual({ dealt: [42, 28, 35], incoming: 12, swordHealth: 100, lanceHealth: 58 });
});
