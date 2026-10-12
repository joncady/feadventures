import {test,expect} from '@playwright/test';
test('portrait touch device gates menu and restores it after rotation; narrow desktop stays usable',async({browser})=>{
 const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});const page=await context.newPage();const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');
 await expect(page.locator('#landscape-required')).toBeVisible();await page.keyboard.press('Tab');expect(await page.evaluate(()=>document.activeElement===document.querySelector('#landscape-required button'))).toBe(true);await page.keyboard.press('Shift+Tab');expect(await page.evaluate(()=>document.activeElement===document.querySelector('#landscape-required button'))).toBe(true);await page.evaluate(()=>document.querySelector<HTMLButtonElement>('#landscape-required button')!.blur());
 await page.evaluate(()=>document.querySelector<HTMLElement>('#game')!.focus());await page.keyboard.press('Enter');await page.keyboard.press('Space');
 expect(await page.evaluate(async()=>{const{game}=await import(String('/src/main.ts'));return game.registry.get('landscape-required');})).toBe(true);
 await page.screenshot({path:'docs/playtests/landscape-1.1.3/portrait-gate.png'});
 await page.setViewportSize({width:844,height:390});await expect(page.locator('#landscape-required')).toBeHidden();await page.waitForFunction(()=>!(document.querySelector('#start') as HTMLButtonElement).disabled);
 expect(await page.evaluate(async()=>{const{game}=await import(String('/src/main.ts'));return game.registry.get('interface-state').selectionMode;})).toBe('player');
 await page.screenshot({path:'docs/playtests/landscape-1.1.3/landscape-picker.png'});expect(errors).toEqual([]);await context.close();
 const desktop=await browser.newContext({viewport:{width:390,height:844},hasTouch:false});const d=await desktop.newPage();await d.goto('/');await d.waitForFunction(()=>!(document.querySelector('#start') as HTMLButtonElement).disabled);await expect(d.locator('#landscape-required')).toBeHidden();await desktop.close();
});
test('rotation clears held sticks, resumes running battle and preserves manual pause',async({browser})=>{
 const context=await browser.newContext({viewport:{width:844,height:390},hasTouch:true,isMobile:true});const page=await context.newPage();await page.goto('/');await page.waitForFunction(()=>!(document.querySelector('#start') as HTMLButtonElement).disabled);
 await page.evaluate(async()=>{const{game}=await import(String('/src/main.ts'));game.scene.start('Arena',{hero:'chrom',tactical:true,companions:[],missionIndex:0});});
 await page.waitForFunction(async()=>{const{game}=await import(String('/src/main.ts'));return game.scene.getScene('Arena').player?.active;});
 await page.evaluate(async()=>{const{game}=await import(String('/src/main.ts'));const a=game.scene.getScene('Arena');a.autoPlaceDeployment();a.launchBattle();a.releases=[];a.enemies.clear(true,true);game.events.emit('ui-state',{...game.registry.get('interface-state'),phase:'battle',playing:true,paused:false,settingsOpen:false});});
 const cdp=await context.newCDPSession(page),b=(await page.locator('canvas').boundingBox())!,l=await page.evaluate(async()=>{const{game}=await import(String('/src/main.ts'));return game.registry.get('touch-control-layout');});
 const at=(x:number,y:number,id:number)=>({x:b.x+x*b.width/896,y:b.y+y*b.height/544,id});await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[at(l.joystick.x+l.radius*.7,l.joystick.y,1),at(l.attack.x+l.attack.radius*.8,l.attack.y,2)]});
 const state=()=>page.evaluate(async()=>{const{game}=await import(String('/src/main.ts'));const a=game.scene.getScene('Arena');return{paused:game.scene.isPaused('Arena'),move:a.touchMovement.x,aim:a.touchAim};});await expect.poll(async()=>(await state()).move).toBeGreaterThan(0);
 await page.setViewportSize({width:390,height:844});await expect.poll(async()=>(await state()).paused).toBe(true);expect((await state()).move).toBe(0);expect((await state()).aim).toBeUndefined();
 await cdp.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});await page.setViewportSize({width:844,height:390});await expect.poll(async()=>(await state()).paused).toBe(false);
 await page.evaluate(async()=>{const{game}=await import(String('/src/main.ts'));game.scene.pause('Arena');});await page.setViewportSize({width:390,height:844});await page.setViewportSize({width:844,height:390});expect((await state()).paused).toBe(true);await context.close();
});
test('orientation lock is fullscreen-only and rejected locks retain portrait guidance',async({page})=>{
 await page.goto('/');await page.waitForFunction(()=>!(document.querySelector('#start') as HTMLButtonElement).disabled);
 const result=await page.evaluate(async()=>{const{lockLandscape}=await import(String('/src/game/platform/mobile-landscape.ts'));let locks=0,unlocks=0;Object.defineProperty(screen.orientation,'lock',{configurable:true,value:async()=>{locks++;throw new Error('unsupported');}});Object.defineProperty(screen.orientation,'unlock',{configurable:true,value:()=>{unlocks++;}});await lockLandscape();const before=locks;Object.defineProperty(document,'fullscreenElement',{configurable:true,value:document.querySelector('.game-shell')});await lockLandscape();Object.defineProperty(document,'fullscreenElement',{configurable:true,value:null});document.dispatchEvent(new Event('fullscreenchange'));return{before,locks,unlocks};});
 expect(result).toEqual({before:0,locks:1,unlocks:1});
});
