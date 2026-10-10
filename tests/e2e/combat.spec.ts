import { test, expect } from '@playwright/test';

test('waits for audio assets, toggles mute, and restores ranged and hit audio', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  const begin = page.getByRole('button', { name: 'Begin battle' });
  await expect(begin).toBeEnabled();
  expect(await page.evaluate(async () => {
    const entry = '/src/main.ts'; const { game } = await import(entry);
    return ['music', 'attack', 'damage', 'arrow-fire', 'death'].every(key => game.cache.audio.exists(key));
  })).toBe(true);
  const audio = page.locator('#music');
  await expect(audio).toHaveAccessibleName('Unmute audio');
  await expect(audio).toHaveAttribute('aria-pressed', 'false');
  await expect(page.locator('.caption')).toHaveCount(0);
  await audio.click();
  await expect(audio).toHaveAccessibleName('Mute audio');
  await audio.click();
  await expect(audio).toHaveAccessibleName('Unmute audio');
  await begin.click();
  await expect.poll(() => page.evaluate(async () => {
    const entry = '/src/main.ts'; const { game } = await import(entry);
    return game.sound.mute;
  })).toBe(true);
  await page.evaluate(async () => {
    const entry = '/src/main.ts';
    const { game } = await import(entry);
    const scene = game.scene.getScene('Arena');
    scene.allies.clear(true, true); scene.enemies.clear(true, true);
    scene.time.removeAllEvents();
    scene.spawning = 0;
    const enemy = scene.enemies.create(350, 230, 'archer');
    enemy.setSize(28, 28).setOffset(11, 15);
    enemy.setData({ health: 100, maxHealth: 100, speed: 0, damage: 8, nextShot: scene.time.now + 200 });
    const played: string[] = [];
    const play = game.sound.play.bind(game.sound);
    game.sound.play = (key: string, config: unknown) => { played.push(key); return play(key, config); };
    scene.registry.set('testedSounds', played);
  });
  await expect.poll(() => page.evaluate(async () => {
    const entry = '/src/main.ts'; const { game } = await import(entry);
    return game.scene.getScene('Arena').registry.get('testedSounds').includes('arrow-fire');
  })).toBe(true);
  await expect.poll(() => page.evaluate(async () => {
    const entry = '/src/main.ts'; const { game } = await import(entry);
    return game.scene.getScene('Arena').health;
  })).toBeLessThan(100);
  const shotSounds = await page.evaluate(async () => {
    const entry = '/src/main.ts'; const { game } = await import(entry);
    return game.scene.getScene('Arena').registry.get('testedSounds') as string[];
  });
  expect(shotSounds).toContain('arrow-fire');
  expect(shotSounds).toContain('damage');
  await page.evaluate(async () => {
    const entry = '/src/main.ts'; const { game } = await import(entry);
    const scene = game.scene.getScene('Arena');
    scene.arrows.clear(true, true);
    const enemy = scene.enemies.getChildren()[0];
    enemy.setPosition(245, 230).setTexture('soldier').setData('nextShot', Infinity);
    scene.registry.get('testedSounds').length = 0;
  });
  await page.locator('#game').focus();
  await page.keyboard.down('Space');
  await page.waitForTimeout(80);
  await page.keyboard.up('Space');
  await expect.poll(() => page.evaluate(async () => {
    const entry = '/src/main.ts'; const { game } = await import(entry);
    return game.scene.getScene('Arena').enemies.getChildren()[0].getData('health');
  })).toBe(65);
  const hitSounds = await page.evaluate(async () => {
    const entry = '/src/main.ts'; const { game } = await import(entry);
    return game.scene.getScene('Arena').registry.get('testedSounds') as string[];
  });
  expect(hitSounds).toContain('attack');
  expect(hitSounds).toContain('damage');
  // An upward arrow meets the original map's building rectangle before reaching the edge.
  await page.evaluate(async () => {
    const entry = '/src/main.ts'; const { game } = await import(entry);
    const scene = game.scene.getScene('Arena');
    scene.fireArrow(scene.enemies.getChildren()[0], { x: 0, y: -1 });
  });
  await expect.poll(() => page.evaluate(async () => {
    const entry = '/src/main.ts'; const { game } = await import(entry);
    return game.scene.getScene('Arena').arrows.countActive();
  }), { timeout: 1200 }).toBe(0);
  expect(errors).toEqual([]);
});
