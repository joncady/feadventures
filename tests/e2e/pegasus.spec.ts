import { test, expect } from '@playwright/test';

test('Sumia flies across terrain, keeps world bounds and uses lance combat with bow weakness', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Sumia', exact: true }).click();
  await expect(page.locator('#hero-description')).toContainText('fly over terrain');
  await page.getByRole('button', { name: 'Begin battle' }).click();
  await expect(page.locator('#hero-name')).toHaveText('Sumia · lance');
  await page.evaluate(async () => {
    const entry = '/src/main.ts'; const { game } = await import(entry);
    const scene = game.scene.getScene('Arena'); scene.allies.clear(true, true); scene.enemies.clear(true, true); scene.time.removeAllEvents(); scene.spawning = 1;
    scene.player.body.reset(300, 190);
  });
  await page.locator('#game').focus(); await page.keyboard.down('w'); await page.waitForTimeout(650); await page.keyboard.up('w');
  const result = await page.evaluate(async () => {
    const entry = '/src/main.ts'; const { game } = await import(entry);
    const scene = game.scene.getScene('Arena'); scene.scene.pause();
    const y = scene.player.y, routes = scene.navigation.reachablePoints().length;
    scene.player.body.reset(190, 230); scene.facing = { x: 1, y: 0 };
    const enemy = scene.enemies.create(290, 230, 'soldier'); enemy.setSize(28, 28).setOffset(11, 15); enemy.body.reset(290, 230);
    enemy.setData({ weapon: 'sword', health: 100, maxHealth: 100 }); scene.attack();
    scene.lastDamage = -Infinity; scene.takeDamage(8, 'bow');
    return { y, routes, hp: scene.health, target: enemy.getData('health'), bounds: scene.player.body.collideWorldBounds, frameHeight: scene.player.frame.height, sheetHeight: game.textures.get('sumia').getSourceImage().height, icon: scene.playerWeapon.texture.key, shadow: scene.flightShadow.visible };
  });
  expect(result.y).toBeLessThan(130); expect(result.routes).toBeGreaterThan(0);
  expect(result).toMatchObject({ hp: 84, target: 58, bounds: true, frameHeight: 55, sheetHeight: 550, icon: 'weapon-lance', shadow: false });
});
