import {test,expect,type Page} from '@playwright/test';
async function clickCanvas(page:Page,x:number,y:number){const box=(await page.locator('canvas').boundingBox())!;await page.mouse.click(box.x+x*box.width/896,box.y+y*box.height/544);}
test('native HUD controls work, music defaults on and Begin battle plays the selected archive cue',async({page})=>{
 await page.goto('/?battle=legacy');await page.getByRole('button',{name:'Begin battle'}).waitFor();
 await page.getByRole('button',{name:'Morgan',exact:true}).press('Enter');
 await page.evaluate(async()=>{const entry='/src/main.ts';const {game}=await import(entry);const events:string[]=[];game.registry.set('uiSounds',events);game.events.on('effect',(key:string)=>events.push(key));});
 await page.getByRole('button',{name:'Begin battle'}).press('Enter');
 const initial=await page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);return {muted:game.sound.mute,music:game.sound.get('music').isPlaying,font:document.fonts.check('14px FE'),cue:game.registry.get('uiSounds').filter((x:string)=>x==='battle-start').length,frame:game.textures.exists('ui-parchment')};});
 expect(initial).toEqual({muted:false,music:true,font:true,cue:1,frame:true});
 await clickCanvas(page,768,17);
 await expect.poll(()=>page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);return game.scene.isPaused('Arena');})).toBe(true);
 await clickCanvas(page,263,421);
 await expect.poll(()=>page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);return game.scene.isPaused('Arena');})).toBe(false);
 await page.keyboard.press('p');await clickCanvas(page,523,421);
 await expect.poll(()=>page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);return game.scene.getScene('Interface').settings.visible;})).toBe(true);
 expect(await page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);return game.scene.isPaused('Arena');})).toBe(true);
 await clickCanvas(page,373,186);
 expect(await page.evaluate(async()=>{const entry='/src/main.ts';const{audioSettings}=await import(entry);return audioSettings.music;})).toBe(.25);
 await clickCanvas(page,448,148);
 expect(await page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);return game.sound.mute;})).toBe(true);
 await clickCanvas(page,530,425);await page.keyboard.press('p');
 await page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);const s=game.scene.getScene('Arena');s.enemies.clear(true,true);s.arrows.clear(true,true);s.time.removeAllEvents();s.spawning=1;});
 await clickCanvas(page,790,470);await page.waitForTimeout(350);
 expect(await page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);const s=game.scene.getScene('Arena');return {arrows:s.arrows.countActive(),shot:Boolean(s.playerShot)};})).toEqual({arrows:0,shot:false});
 await page.keyboard.press('p');await clickCanvas(page,633,421);await expect(page.locator('#menu')).toBeVisible();
});
