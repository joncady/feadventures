import {test,expect} from '@playwright/test';
test('native pause menu contains controls, blocks world actions and safely returns from audio',async({page})=>{
 await page.goto('/?mission=siege');await page.waitForFunction(()=>!(document.querySelector('#start') as HTMLButtonElement).disabled);await page.locator('#start').press('Enter');await page.keyboard.press('Space',{delay:70});await page.keyboard.press('r',{delay:70});await page.keyboard.press('p');
 const snapshot=()=>page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);const a=game.scene.getScene('Arena'),ui=game.scene.getScene('Interface');return {paused:game.scene.isPaused('Arena'),clock:a.battleClock,x:a.player.x,y:a.player.y,hero:a.hero,slot:a.weaponLoadout().equippedSlot,details:a.battleHud.expanded,controls:ui.pauseOverlay.list.filter((o:any)=>o.type==='Text').map((o:any)=>o.text).join('\n'),instructions:ui.instructions.visible,settings:ui.state.settingsOpen};});
 await expect.poll(async()=>(await snapshot()).paused).toBe(true);const before=await snapshot();expect(before.instructions).toBe(false);for(const key of ['WASD / Arrows','Q / E','F','I / Info','R','P'])expect(before.controls).toContain(key);
 for(const key of ['f','q','e','r','i'])await page.keyboard.press(key);await page.keyboard.down('d');await page.waitForTimeout(200);await page.keyboard.up('d');const after=await snapshot();expect([after.clock,after.x,after.y,after.hero,after.slot,after.details]).toEqual([before.clock,before.x,before.y,before.hero,before.slot,before.details]);
 // D moved the menu focus to Info, not the hero. Move once more to Settings.
 await page.keyboard.press('ArrowRight');
 await page.keyboard.press('Enter');await expect.poll(async()=>(await snapshot()).settings).toBe(true);await page.keyboard.press('Escape');await expect.poll(async()=>(await snapshot()).settings).toBe(false);expect((await snapshot()).paused).toBe(true);
 await page.keyboard.press('ArrowLeft');await page.keyboard.press('ArrowLeft');await page.keyboard.press('Enter');await expect.poll(async()=>(await snapshot()).paused).toBe(false);expect((await snapshot()).instructions).toBe(false);
});
