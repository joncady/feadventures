import {test,expect} from '@playwright/test';
test('phased party retains companions on Back and requires deliberate solo story confirmation',async({page})=>{
 await page.goto('/');await page.waitForFunction(()=>!(document.querySelector('#start') as HTMLButtonElement).disabled);await expect.poll(()=>page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);return !!game.registry.get('character-card-centers');})).toBe(true);
 await page.locator('#game').focus();await page.keyboard.press('Enter');
 const state=()=>page.evaluate(async()=>{const entry='/src/main.ts';const {game}=await import(entry);return game.registry.get('interface-state');});
 await expect.poll(async()=>(await state()).selectionMode).toBe('companions');
 await page.keyboard.press('d');await page.keyboard.press('Enter');await expect.poll(async()=>(await state()).companions.length).toBe(1);
 await page.keyboard.press('Escape');await expect.poll(async()=>(await state()).selectionMode).toBe('player');await expect.poll(async()=>(await state()).companions.length).toBe(1);
 await page.keyboard.press('a');await page.keyboard.press('Enter');await page.keyboard.press('d');await page.keyboard.press('Enter');
 await expect.poll(async()=>(await state()).companions.length).toBe(0);
 await page.keyboard.press('Tab');await page.keyboard.press('Enter');
 expect(await page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);return game.scene.isActive('Campaign');})).toBe(false);
 await page.keyboard.press('Enter');await expect.poll(()=>page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);return game.scene.isActive('Campaign');})).toBe(true);
});
