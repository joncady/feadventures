import {test,expect} from '@playwright/test';
test('chunk-built Black Keep deploys and ground hero crosses both doors toward boss',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');await page.waitForFunction(()=>!(document.querySelector('#start') as HTMLButtonElement).disabled);
 await page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);game.events.emit('dev-jump',3);game.events.emit('campaign-continue');});
 await page.waitForFunction(async()=>{const entry='/src/main.ts';const{game}=await import(entry);return game.scene.getScene('Arena').deploying;});
 const state=await page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);const a=game.scene.getScene('Arena');a.confirmDeployment();game.events.emit('ui-launch');a.player.body.reset(512,656);a.player.body.updateFromGameObject();a.releases=[];a.stage.phase='rest';a.stage.phaseStarted=1e8;return {width:a.map.width,height:a.map.height,boss:a.map.waves.bossHealth};});expect(state).toEqual({width:1024,height:768,boss:1400});
 await page.keyboard.down('w');await page.waitForTimeout(4300);await page.keyboard.up('w');
 const traveled=await page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);const a=game.scene.getScene('Arena');return {x:a.player.x,y:a.player.y,version:game.registry.get('app-version'),reinforcements:a.map.camps.map((_:unknown,i:number)=>a.campSpawnPoint(i))};});expect(traveled.y).toBeLessThan(240);expect(Math.abs(traveled.x-512)).toBeLessThan(30);expect(traveled.reinforcements.every(Boolean)).toBe(true);
 await page.screenshot({path:'docs/playtests/black-keep-1.0.6.png'});expect(errors).toEqual([]);
});
