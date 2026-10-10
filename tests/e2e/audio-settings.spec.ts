import { test, expect } from '@playwright/test';

test('audio categories are independent, recorded voices load, and device speech is removed', async ({ page }) => {
  await page.goto('/'); await page.getByRole('button', { name: 'Begin battle' }).waitFor();
  await page.getByRole('button', { name: 'Audio settings', exact: true }).press('Enter');
  await expect(page.getByRole('dialog', { name: 'Audio settings' })).toBeVisible();
  await page.getByLabel('Enable audio', { exact: true }).check();
  await expect(page.locator('#spell-names, #device-voice')).toHaveCount(0);
  await page.locator('#music-volume').evaluate((input: HTMLInputElement) => { input.value = '0'; input.dispatchEvent(new Event('input', { bubbles: true })); });
  await page.locator('#effects-volume').evaluate((input: HTMLInputElement) => { input.value = '50'; input.dispatchEvent(new Event('input', { bubbles: true })); });
  const sounds = await page.evaluate(async () => {
    const entry = '/src/main.ts'; const { game, audioSettings } = await import(entry);
    const played: { key: string; volume: number }[] = [];
    const original = game.sound.play.bind(game.sound);
    game.sound.play = (key: string, options: any) => { played.push({ key, volume: options.volume }); return original(key, options); };
    game.events.emit('effect', 'attack', { volume: 0.4 });
    game.events.emit('hero-attack', { hero: 'morgan', spell: 'Fire' });
    return { settings: audioSettings, played, voiceReady: game.cache.audio.exists('voice-morgan-attack'), musicVolume: game.sound.get('music').volume };
  });
  expect(sounds.settings).toMatchObject({ music: 0, effects: 0.5, voices: 0.6 });
  expect(sounds.musicVolume).toBe(0); expect(sounds.voiceReady).toBe(true);
  expect(sounds.played).toContainEqual({ key: 'attack', volume: 0.2 });
  expect(sounds.played).toContainEqual({ key: 'voice-morgan-attack', volume: 0.6 });
  await page.getByLabel('Enable audio', { exact: true }).press('Space');
  expect(await page.evaluate(async () => {
    const entry = '/src/main.ts'; const { game } = await import(entry);
    const played: string[] = []; game.sound.play = (key: string) => { played.push(key); return true; };
    game.events.emit('hero-attack', { hero: 'morgan', spell: 'Fire' });
    return { played, muted: game.sound.mute };
  })).toEqual({ played: [], muted: true });
  await page.getByRole('button', { name: 'Close', exact: true }).press('Enter');
});

test('down diagonal movement selects the correct verified sprite rows', async ({ page }) => {
  await page.goto('/'); await page.getByRole('button', { name: 'Virion', exact: true }).click();
  await page.getByRole('button', { name: 'Begin battle' }).click();
  await page.locator('#game').focus(); await page.keyboard.down('s'); await page.keyboard.down('d');
  await expect.poll(() => page.evaluate(async () => {
    const entry = '/src/main.ts'; const { game } = await import(entry);
    const player = game.scene.getScene('Arena').player;
    return { animation: player.anims.currentAnim.key, row: Math.floor(Number(player.frame.name) / 4), flip: player.flipX };
  })).toEqual({ animation: 'virion-walk-down-right', row: 7, flip: false });
  await page.keyboard.up('d'); await page.keyboard.down('a');
  await expect.poll(() => page.evaluate(async () => {
    const entry = '/src/main.ts'; const { game } = await import(entry);
    return Math.floor(Number(game.scene.getScene('Arena').player.frame.name) / 4);
  })).toBe(6);
  await page.keyboard.up('a'); await page.keyboard.up('s');
});

test('melee attacks route sword, axe and lance to distinct loaded effects', async ({ page }) => {
  await page.goto('/'); await page.getByRole('button', { name: 'Begin battle' }).click();
  const result = await page.evaluate(async () => {
    const entry = '/src/main.ts'; const { game } = await import(entry);
    const scene = game.scene.getScene('Arena'); scene.allies.clear(true, true); scene.enemies.clear(true, true);
    const played: string[] = []; game.sound.play = (key: string) => { played.push(key); return true; };
    for (const hero of ['chrom', 'vaike', 'frederick']) { scene.hero = hero; scene.attack(); }
    game.events.emit('spell-effect');
    return { played, loaded: ['axe-impact', 'lance-thrust', 'fire-cast'].every(key => game.cache.audio.exists(key)) };
  });
  expect(result.loaded).toBe(true);
  expect(result.played.filter(key => !key.startsWith('voice-'))).toEqual(['attack', 'axe-impact', 'lance-thrust', 'fire-cast']);
});
