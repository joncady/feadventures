import { test, expect } from '@playwright/test';

test('every roster hero loads, idles, and returns to menu without retained battle state', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('response', r => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`); });
  await page.goto('/');
  const names = await page.locator('.hero').allTextContents();
  expect(names).toHaveLength(17);
  for (const name of names) {
    await page.getByRole('button', { name, exact: true }).click();
    await page.getByRole('button', { name: 'Begin battle' }).click();
    await expect.poll(() => page.evaluate(async () => {
      const entry = '/src/main.ts'; const { game } = await import(entry);
      const scene = game.scene.getScene('Arena');
      return scene.player.anims.currentAnim?.key;
    })).toMatch(/-idle$/);
    const state = await page.evaluate(async () => {
      const entry = '/src/main.ts'; const { game } = await import(entry);
      const scene = game.scene.getScene('Arena');
      scene.time.removeAllEvents(); scene.spawning = 1; scene.allies.clear(true, true); scene.enemies.clear(true, true);
      return { hero: scene.hero, idle: scene.player.anims.currentAnim.frames.length, portrait: [...document.querySelectorAll<HTMLImageElement>('.hero > img')].every(img => img.complete && img.naturalWidth > 0) };
    });
    expect(state.idle).toBe(4); expect(state.portrait).toBe(true);
    if (name === 'Morgan') {
      const frames: number[] = [];
      for (let i = 0; i < 5; i++) {
        await page.waitForTimeout(120);
        frames.push(await page.evaluate(async () => {
          const entry = '/src/main.ts'; const { game } = await import(entry);
          return game.scene.getScene('Arena').player.anims.currentFrame.index;
        }));
      }
      expect(new Set(frames).size).toBeGreaterThan(1);
    }
    await page.locator('#game').focus();
    for (const [key, direction] of [['ArrowRight', 'down-right'], ['ArrowLeft', 'down-left']]) {
      await page.keyboard.down('ArrowDown'); await page.keyboard.down(key);
      await expect.poll(() => page.evaluate(async () => {
        const entry = '/src/main.ts'; const { game } = await import(entry);
        const player = game.scene.getScene('Arena').player;
        return { animation: player.anims.currentAnim?.key, flipped: player.flipX };
      })).toEqual({ animation: `${state.hero}-walk-${direction}`, flipped: false });
      await page.keyboard.up(key); await page.keyboard.up('ArrowDown');
    }
    await page.getByRole('button', { name: 'Pause', exact: true }).press('Enter');
    await page.getByRole('button', { name: 'Main menu', exact: true }).press('Enter');
    await expect(page.locator('#menu')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Pause', exact: true })).toBeDisabled();
    expect(await page.evaluate(async () => {
      const entry = '/src/main.ts'; const { game } = await import(entry);
      return { active: game.scene.isActive('Arena'), boot: game.scene.isActive('Boot') };
    })).toEqual({ active: false, boot: true });
  }
  expect(errors).toEqual([]);
});

test('Morgan casts Fire with windup, resistance damage, cover collision and menu cleanup', async ({ page }) => {
  await page.goto('/'); await page.getByRole('button', { name: 'Morgan', exact: true }).click();
  await page.getByRole('button', { name: 'Begin battle' }).click();
  await expect(page.locator('#hero-name')).toHaveText('Morgan · tome');
  await page.evaluate(async () => {
    const entry = '/src/main.ts'; const { game } = await import(entry);
    const scene = game.scene.getScene('Arena'); scene.allies.clear(true, true); scene.enemies.clear(true, true); scene.time.removeAllEvents(); scene.spawning = 1;
    scene.player.body.reset(190, 230);
    const enemy = scene.enemies.create(310, 230, 'soldier'); enemy.setSize(28, 28).setOffset(11, 15);
    enemy.setData({ health: 100, maxHealth: 100, speed: 0, damage: 0, weapon: 'axe', defense: 20, resistance: 4 });
  });
  await page.locator('#game').focus(); await page.keyboard.down('Space'); await page.waitForTimeout(80); await page.keyboard.up('Space');
  await expect.poll(() => page.evaluate(async () => {
    const entry = '/src/main.ts'; const { game } = await import(entry);
    return game.scene.getScene('Arena').enemies.getChildren()[0].getData('health');
  })).toBe(74);
  await page.evaluate(async () => {
    const entry = '/src/main.ts'; const { game } = await import(entry);
    const scene = game.scene.getScene('Arena'); scene.arrows.clear(true, true); scene.player.body.reset(245, 230);
    scene.fireArrow(scene.player, { x: 0, y: -1 }, 'player', 'tome');
  });
  await expect.poll(() => page.evaluate(async () => {
    const entry = '/src/main.ts'; const { game } = await import(entry);
    return game.scene.getScene('Arena').arrows.countActive();
  })).toBe(0);
  await page.getByRole('button', { name: 'Main menu', exact: true }).press('Enter');
  await page.getByRole('button', { name: 'Begin battle' }).click();
  expect(await page.evaluate(async () => {
    const entry = '/src/main.ts'; const { game } = await import(entry);
    const scene = game.scene.getScene('Arena'); return { arrows: scene.arrows.countActive(), pending: Boolean(scene.playerShot), hp: scene.health };
  })).toEqual({ arrows: 0, pending: false, hp: 100 });
});
