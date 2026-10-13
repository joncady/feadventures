import { waitForAsyncReady } from './async-readiness';
import {test,expect} from '@playwright/test';

// Real renderer/physics timings, not a promise about frame rate on other hardware.
for(const mission of [0,1,2,3])test(`stage ${mission+1} capped pursuit remains legal and reports navigation cost`,async({page},testInfo)=>{
 test.setTimeout(60000);
 await page.goto('/');await page.waitForFunction(()=>!(document.querySelector('#start') as HTMLButtonElement).disabled);
 await page.evaluate(async(mission)=>{const entry='/src/main.ts';const{game}=await import(entry);game.events.emit('dev-jump',mission);game.events.emit('campaign-continue');},mission);
 await waitForAsyncReady(page, async()=>{const entry='/src/main.ts';const{game}=await import(entry);return game.scene.getScene('Arena').deploying;});
 await page.evaluate(async()=>{
  const entry='/src/main.ts';const{game}=await import(entry);const a=game.scene.getScene('Arena');a.autoPlaceDeployment();game.events.emit('ui-launch');
  a.releases=[];a.stage.phase='rest';a.stage.deadline=1e9;a.health=100000;a.player.setData('health',100000);
  a.allies.clear(true,true);a.enemies.clear(true,true);
  const nav=a.navigation.constructor,original=nav.prototype.setTarget;const metrics={calls:0,rebuilds:0,ms:0,updates:[] as number[],frames:[] as number[],start:performance.now(),last:performance.now(),positions:[] as any[]};
  nav.prototype.setTarget=function(...args:any[]){const prior=this.targetCell,start=performance.now();original.apply(this,args);metrics.calls++;metrics.ms+=performance.now()-start;if(prior!==this.targetCell)metrics.rebuilds++;};
  const originalUpdate=a.updateEnemy.bind(a);a.updateEnemy=(...args:any[])=>{const start=performance.now();originalUpdate(...args);metrics.updates.push(performance.now()-start);};
  const frame=()=>{const now=performance.now();metrics.frames.push(now-metrics.last);metrics.last=now;if(now-metrics.start<8500)requestAnimationFrame(frame);};requestAnimationFrame(frame);
  for(let i=0;i<a.map.waves.hostileCap;i++){
   const camp=a.map.camps[i%a.map.camps.length],offset=Math.floor(i/a.map.camps.length);let point={x:camp.x+(offset%3-1)*36,y:camp.y+Math.floor(offset/3)*36};point=a.navigation.recoveryPoint(point)??point;
   const unit=a.createHostile(point.x,point.y,'soldier');unit.setData({damage:0,health:100000,maxHealth:100000});metrics.positions.push({unit,x:unit.x,y:unit.y});
  }
  (window as any).__navigationLoad=metrics;
 });
 await page.waitForTimeout(8000);
 const result=await page.evaluate(async()=>{
  const entry='/src/main.ts';const{game}=await import(entry);const a=game.scene.getScene('Arena'),m=(window as any).__navigationLoad;
  const percentile=(xs:number[],p:number)=>{const sorted=xs.slice(5).sort((a,b)=>a-b);return sorted[Math.floor((sorted.length-1)*p)]??0;};
  return {stage:a.map.id,cap:a.map.waves.hostileCap,active:a.enemies.countActive(),elapsedMs:performance.now()-m.start,calls:m.calls,rebuilds:m.rebuilds,navigationMs:m.ms,frameP50:percentile(m.frames,.5),frameP95:percentile(m.frames,.95),enemyUpdateP95:percentile(m.updates,.95),moved:m.positions.filter((p:any)=>Math.hypot(p.unit.x-p.x,p.unit.y-p.y)>24).length,embedded:a.enemies.getChildren().filter((u:any)=>!a.navigation.isWalkable(a.bodyCenter(u))).length};
 });
 await testInfo.attach('navigation-profile',{body:JSON.stringify(result,null,2),contentType:'application/json'});
 console.log('NAVIGATION_PROFILE',JSON.stringify(result));
 expect(result.active).toBe(result.cap);expect(result.moved).toBeGreaterThan(result.cap/2);expect(result.embedded).toBe(0);
 await page.screenshot({path:`docs/playtests/navigation-cap-stage-${mission+1}.png`});
});

test('Black Keep capped crowd crosses both doorways toward a living target',async({page})=>{
 test.setTimeout(60000);await page.goto('/');await page.waitForFunction(()=>!(document.querySelector('#start') as HTMLButtonElement).disabled);
 await page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);game.events.emit('dev-jump',3);game.events.emit('campaign-continue');});
 await waitForAsyncReady(page, async()=>{const entry='/src/main.ts';const{game}=await import(entry);return game.scene.getScene('Arena').deploying;});
 await page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);const a=game.scene.getScene('Arena');a.autoPlaceDeployment();game.events.emit('ui-launch');a.allies.clear(true,true);a.enemies.clear(true,true);a.releases=[];a.stage.phase='rest';a.stage.deadline=1e9;a.player.body.reset(512,664);a.player.body.updateFromGameObject();a.health=100000;for(let i=0;i<24;i++){const e=a.createHostile(384+(i%8)*36,168+Math.floor(i/8)*36,'soldier');e.setData({damage:0,health:100000,maxHealth:100000,speed:100});}});
 await expect.poll(()=>page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);const a=game.scene.getScene('Arena');return a.enemies.getChildren().filter((u:any)=>u.y>550).length;}),{timeout:20000}).toBe(24);
 const state=await page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);const a=game.scene.getScene('Arena');return {embedded:a.enemies.getChildren().filter((u:any)=>!a.navigation.isWalkable(a.bodyCenter(u))).length};});expect(state.embedded).toBe(0);
 await page.screenshot({path:'docs/playtests/black-keep-crowd-doors.png'});
 await page.getByRole('button',{name:'Main menu',exact:true}).press('Enter');
 const cleanup=await page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);const a=game.scene.getScene('Arena');return {active:game.scene.isActive('Arena'),enemies:a.enemies.children?.size??0,arrows:a.arrows.children?.size??0};});expect(cleanup).toEqual({active:false,enemies:0,arrows:0});
});
