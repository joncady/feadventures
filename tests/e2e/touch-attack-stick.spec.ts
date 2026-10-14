import { waitForAsyncReady } from './async-readiness';
import {test,expect} from '@playwright/test';
test.use({hasTouch:true,viewport:{width:844,height:390}});
test('dual touch sticks aim through all angles and retain independent pointer ownership',async({page})=>{
 // Twelve real CDP gesture sequences across two orientations exceed one-minute software-WebGL budgets.
 test.setTimeout(process.env.CI?120000:60000);
 await page.goto('/');await page.waitForFunction(()=>!(document.querySelector('#start') as HTMLButtonElement).disabled);
 await page.evaluate(async()=>{const{game}=await import(String('/src/main.ts'));game.scene.start('Arena',{hero:'chrom',tactical:true,companions:[],missionIndex:0});});
 await waitForAsyncReady(page, async()=>{const{game}=await import(String('/src/main.ts'));return game.scene.getScene('Arena').player?.active;});
 await page.evaluate(async()=>{const{game}=await import(String('/src/main.ts'));const a=game.scene.getScene('Arena');a.autoPlaceDeployment();a.launchBattle();a.releases=[];a.enemies.clear(true,true);a.updateEnemy=()=>{};game.events.emit('ui-state',{...game.registry.get('interface-state'),phase:'battle',playing:true,paused:false,settingsOpen:false});});
 // Isolate pointer ownership from random combat deaths; keep native inputs, frames and cooldowns live.
 const cdp=await page.context().newCDPSession(page);
 const snapshot=()=>page.evaluate(async()=>{const{game}=await import(String('/src/main.ts'));const a=game.scene.getScene('Arena');return{move:a.touchMovement,aim:a.touchAim,last:a.lastAttack,layout:game.registry.get('touch-control-layout')};});
 for(const viewport of [{width:844,height:390},{width:932,height:430}]){
  await page.setViewportSize(viewport);await expect.poll(async()=>{const s=await snapshot();const b=(await page.locator('canvas').boundingBox())!;return s.layout.actions[0].size*b.width/896;}).toBeGreaterThan(43.9);
  const b=(await page.locator('canvas').boundingBox())!,l=(await snapshot()).layout;
  const at=(x:number,y:number,id:number)=>({x:b.x+x*b.width/896,y:b.y+y*b.height/544,id});
  const move=at(l.joystick.x+l.radius*.7,l.joystick.y,1),aim=(x:number,y:number)=>at(l.attack.x+x*l.attack.radius*.8,l.attack.y+y*l.attack.radius*.8,2);
  expect(l.attack.radius*2.4*b.width/896).toBeGreaterThan(71);
  // Companion controls flank the wheel; the four lower commands remain below it.
  expect(new Set(l.actions.slice(0,6).map((action:any)=>action.y)).size).toBe(2);
  expect(l.actions[0].y).toBe(l.attack.y);expect(l.actions[1].y).toBe(l.attack.y);expect(l.actions[0].x).toBeLessThan(l.attack.x);expect(l.actions[1].x).toBeGreaterThan(l.attack.x);expect(new Set(l.actions.slice(2).map((action:any)=>action.y)).size).toBe(1);
  expect(l.actions[0].x-l.actions[0].size/2).toBeGreaterThan(480); // Cooldown remains unobstructed at the bottom center.
  for(const action of l.actions.slice(0,6)){const dx=Math.max(0,Math.abs(l.joystick.x-action.x)-action.size/2),dy=Math.max(0,Math.abs(l.joystick.y-action.y)-action.size/2);expect(Math.hypot(dx,dy)).toBeGreaterThan(l.radius*1.2);}
  const minimapBottom=await page.evaluate(async()=>{const{game}=await import(String('/src/main.ts'));return 58+(game.registry.get('touch-minimap-height')??100);});expect(l.attack.y-l.attack.radius*1.2).toBeGreaterThanOrEqual(minimapBottom+8-0.01);
  for(const action of l.actions){const dx=Math.max(0,Math.abs(l.attack.x-action.x)-action.size/2),dy=Math.max(0,Math.abs(l.attack.y-action.y)-action.size/2);expect(Math.hypot(dx,dy)).toBeGreaterThanOrEqual(l.attack.radius*1.2+10);}
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[move]});await expect.poll(async()=>(await snapshot()).move.x).toBeGreaterThan(0);
  for(const[x,y]of[[1,0],[0,1],[-1,0],[0,-1],[.707,.707],[-.707,-.707]]){
   await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[move,aim(x,y)]});
   await expect.poll(async()=>(await snapshot()).aim?.x).toBeCloseTo(x,1);await expect.poll(async()=>(await snapshot()).aim?.y).toBeCloseTo(y,1);
   await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[aim(x,y)]});expect((await snapshot()).move.x).toBeGreaterThan(0);
  }
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[move,aim(-1,0)]});const first=(await snapshot()).last;
  await expect.poll(async()=>(await snapshot()).last,{timeout:10000}).toBeGreaterThan(first);
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[move]});expect((await snapshot()).move.x).toBe(0);expect((await snapshot()).aim?.x).toBeLessThan(0);
  await cdp.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});expect((await snapshot()).move.x).toBe(0);expect((await snapshot()).aim).toBeUndefined();
 }
});

test('touch staff stick heals allies; self heal, guard, and pause remain separate actions',async({page})=>{
 await page.goto('/?mission=siege');await page.waitForFunction(()=>!(document.querySelector('#start') as HTMLButtonElement).disabled);
 // Initialize the actual application battle phase so Pause has its real state gate.
 await page.locator('#start').press('Enter');await page.keyboard.press('Space',{delay:70});await page.keyboard.press('r',{delay:70});
 await page.evaluate(async()=>{const{game}=await import(String('/src/main.ts'));game.scene.start('Arena',{hero:'lissa',tactical:true,companions:['chrom'],missionIndex:0});});
 await waitForAsyncReady(page, async()=>{const{game}=await import(String('/src/main.ts'));return game.scene.getScene('Arena').player?.active;});
 await page.evaluate(async()=>{const{game}=await import(String('/src/main.ts'));const a=game.scene.getScene('Arena');a.autoPlaceDeployment();a.launchBattle();a.releases=[];a.enemies.clear(true,true);a.updateEnemy=()=>{};a.health=50;a.partyStates.get('lissa').health=50;const u=a.allies.getChildren().find((u:any)=>u.getData('companionHero')==='chrom');u.body.reset(a.player.x+80,a.player.y);u.setData('health',20);a.partyStates.get('chrom').health=20;game.events.emit('ui-state',{...game.registry.get('interface-state'),phase:'battle',playing:true,paused:false,settingsOpen:false});});
 const cdp=await page.context().newCDPSession(page),b=(await page.locator('canvas').boundingBox())!;
 const l=await page.evaluate(async()=>{const{game}=await import(String('/src/main.ts'));return game.registry.get('touch-control-layout');});
 const at=(x:number,y:number,id:number)=>({x:b.x+x*b.width/896,y:b.y+y*b.height/544,id});
 const state=()=>page.evaluate(async()=>{const{game}=await import(String('/src/main.ts'));const a=game.scene.getScene('Arena');return{hp:a.health,ally:a.partyStates.get('chrom').health,aim:a.touchAim,move:a.touchMovement,guard:a.touchGuard,last:a.lastAttack,paused:game.scene.isPaused('Arena')};});
 const attack=at(l.attack.x+l.attack.radius*.8,l.attack.y,1);
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[attack]});await expect.poll(async()=>(await state()).ally).toBe(35);expect((await state()).hp).toBe(50);
 await cdp.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});
 await page.evaluate(async()=>{const{game}=await import(String('/src/main.ts'));game.scene.getScene('Arena').lastAttack=-Infinity;});
 await page.touchscreen.tap(b.x+l.actions[4].x*b.width/896,b.y+l.actions[4].y*b.height/544);await expect.poll(async()=>(await state()).hp).toBe(65);expect((await state()).ally).toBe(35);
 const guard=at(l.actions[5].x,l.actions[5].y,2);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[guard]});await expect.poll(async()=>(await state()).guard).toBe(true);await cdp.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});expect((await state()).guard).toBe(false);
 const move=at(l.joystick.x+l.radius*.7,l.joystick.y,3);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[move,attack]});await expect.poll(async()=>(await state()).aim?.x).toBeGreaterThan(0);
 expect(l.actions).toHaveLength(6);const pauseBounds=await page.evaluate(async()=>{const{game}=await import(String('/src/main.ts'));const ui=game.scene.getScene('Interface');const b=ui.pauseButton.list[0].getBounds();return{x:b.centerX,y:b.centerY};});const pause=at(pauseBounds.x,pauseBounds.y,4);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[move,attack,pause]});await expect.poll(async()=>(await state()).paused).toBe(true);expect((await state()).aim).toBeUndefined();expect((await state()).move.x).toBe(0);await cdp.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});
});
