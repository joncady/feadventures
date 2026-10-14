import {test,expect} from '@playwright/test';
import {waitForAsyncReady} from './async-readiness';
import {EXPANDED_CAMPAIGN_MAPS} from '../../src/game/data/campaign-expansion';
test('a fresh story chooses the expanded campaign and ten result boundaries reach its actual finale',async({page})=>{
 const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));await page.goto('/');await page.waitForFunction(()=>!(document.querySelector('#start') as HTMLButtonElement).disabled);await page.locator('#start').press('Enter');
 await waitForAsyncReady(page,async()=>{const entry=(document.querySelector('script[src*="/src/main.ts"]') as HTMLScriptElement).src;const {game}=await import(entry);return game.scene.isActive('Campaign');});
 const first=await page.evaluate(async()=>{const entry=(document.querySelector('script[src*="/src/main.ts"]') as HTMLScriptElement).src;const {game}=await import(entry);return game.scene.getScene('Campaign').dataState;});expect(first.campaignId).toBe('awakening-ten');expect(first.missionId).toBe('east-road');
 for(let index=0;index<10;index++){
  await page.evaluate(async()=>{const entry=(document.querySelector('script[src*="/src/main.ts"]') as HTMLScriptElement).src;const {game}=await import(entry);game.events.emit('campaign-continue');});
  await waitForAsyncReady(page,async()=>{const entry=(document.querySelector('script[src*="/src/main.ts"]') as HTMLScriptElement).src;const {game}=await import(entry);return game.scene.isActive('Arena')&&game.scene.getScene('Arena').deploying;});
  await page.evaluate(async()=>{const entry=(document.querySelector('script[src*="/src/main.ts"]') as HTMLScriptElement).src;const {game}=await import(entry);const arena=game.scene.getScene('Arena');arena.autoPlaceDeployment();arena.launchBattle();game.scene.pause('Arena');arena.finishTactical(true);});
  await waitForAsyncReady(page,async()=>{const entry=(document.querySelector('script[src*="/src/main.ts"]') as HTMLScriptElement).src;const {game}=await import(entry);return game.scene.isActive('Results');});
  const boundary=await page.evaluate(async()=>{const entry=(document.querySelector('script[src*="/src/main.ts"]') as HTMLScriptElement).src;const {game}=await import(entry);return game.scene.getScene('Results').dataState;});expect(boundary.result.missionId).toBe(EXPANDED_CAMPAIGN_MAPS[index].id);expect(boundary.result.reward).toBe(EXPANDED_CAMPAIGN_MAPS[index].chapter.rewardGold);
  await page.keyboard.press('Enter');await waitForAsyncReady(page,async()=>{const entry=(document.querySelector('script[src*="/src/main.ts"]') as HTMLScriptElement).src;const {game}=await import(entry);return game.scene.isActive('Campaign');});
  const next=await page.evaluate(async()=>{const entry=(document.querySelector('script[src*="/src/main.ts"]') as HTMLScriptElement).src;const {game}=await import(entry);return game.scene.getScene('Campaign').dataState;});expect(next.missionIndex).toBe(index+1);expect(next.complete).toBe(index===9);
 }
 expect(errors).toEqual([]);
});

// Structural scene fixtures, not a claimed natural campaign clear.
for(const [index,map] of EXPANDED_CAMPAIGN_MAPS.entries())test(`expanded chapter ${index+1} ${map.id} launches its authored map and objective`,async({page})=>{
 const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto('/');await page.waitForFunction(()=>!(document.querySelector('#start') as HTMLButtonElement).disabled);
 await page.locator('#party-mode').press('Enter');for(const hero of ['Virion','Sumia','Lissa'])await page.getByRole('button',{name:hero,exact:true}).press('Enter');
 await page.evaluate(async(index)=>{const entry=(document.querySelector('script[src*="/src/main.ts"]') as HTMLScriptElement).src;const {game}=await import(entry);game.events.emit('dev-jump',index,'awakening-ten');},index);
 await waitForAsyncReady(page,async()=>{const entry=(document.querySelector('script[src*="/src/main.ts"]') as HTMLScriptElement).src;const {game}=await import(entry);return game.scene.isActive('Campaign');});
 await page.evaluate(async()=>{const entry=(document.querySelector('script[src*="/src/main.ts"]') as HTMLScriptElement).src;const {game}=await import(entry);game.events.emit('campaign-continue');});
 await waitForAsyncReady(page,async()=>{const entry=(document.querySelector('script[src*="/src/main.ts"]') as HTMLScriptElement).src;const {game}=await import(entry);return game.scene.isActive('Arena')&&game.scene.getScene('Arena').deploying;});
 const state=await page.evaluate(async()=>{
  const entry=(document.querySelector('script[src*="/src/main.ts"]') as HTMLScriptElement).src;const {game}=await import(entry);const arena=game.scene.getScene('Arena');
  arena.autoPlaceDeployment();const launched=arena.launchBattle();game.scene.pause('Arena');
  const camera=arena.cameras.main;camera.stopFollow().setZoom(1);
  const poses=[{x:arena.player.x,y:arena.player.y},{x:arena.width/2,y:arena.height/2},arena.map.objective,{x:32,y:32},{x:arena.width-32,y:arena.height-32}];
  const entries=poses.flatMap((pose:any)=>{camera.centerOn(pose.x,pose.y);camera.preRender();return arena.map.camps.map((_camp:any,i:number)=>{const point=arena.campSpawnPoint(i),view=camera.worldView,margin=arena.map.spawnMargin??32;return {pose,camp:i,point,walkable:point&&arena.navigation.isWalkable(point),hidden:point&&!(point.x>view.x-margin&&point.x<view.right+margin&&point.y>view.y-margin&&point.y<view.bottom+margin)};});});
  return {id:arena.map.id,campaign:arena.campaignId,launched,width:arena.width,height:arena.height,objective:arena.map.objective,commander:arena.map.commander,background:game.textures.exists(arena.map.backgroundKey),placed:Object.keys(arena.deployment).length,party:arena.party.length,gates:arena.map.advanceGates,entries};
 });
 expect(state.id).toBe(map.id);expect(state.campaign).toBe('awakening-ten');expect(state.launched).toBe(true);expect(state.background).toBe(true);expect(state.party).toBe(4);expect(state.placed).toBeGreaterThanOrEqual(state.party);expect(state.objective).toEqual(map.objective);expect(state.commander).toBe(map.commander);expect(state.width).toBe(map.width);expect(state.height).toBe(map.height);expect(state.entries.filter((entry:any)=>!entry.point||!entry.walkable||!entry.hidden)).toEqual([]);expect(errors).toEqual([]);
 if(index===9){const cap=await page.evaluate(async()=>{const entry=(document.querySelector('script[src*="/src/main.ts"]') as HTMLScriptElement).src;const {game}=await import(entry);const a=game.scene.getScene('Arena');a.enemies.clear(true,true);a.releases=[];a.cameras.main.centerOn(512,384);a.cameras.main.preRender();a.stage.start(0);a.updateStage(5000);const queued=a.releases.length;for(let i=0;i<8;i++)a.createHostile(512,500,'knight');a.updateStage(5001);const blocked={count:a.enemies.countActive(),pending:a.releases.length};a.enemies.getChildren()[0].destroy();a.updateStage(5002);return{queued,blocked,after:{count:a.enemies.countActive(),pending:a.releases.length}};});expect(cap).toEqual({queued:8,blocked:{count:8,pending:8},after:{count:8,pending:7}});}
});
