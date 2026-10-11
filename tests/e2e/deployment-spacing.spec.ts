import {test,expect} from '@playwright/test';
test.use({deviceScaleFactor:2});
for(const viewport of [{width:809,height:1066},{width:1440,height:1000}])test(`deployment panels leave all four courtyards clear at ${viewport.width}px`,async({page})=>{
 // Four high-DPI map transitions and screenshots need a broader wall-time budget.
 test.setTimeout(60000);
 await page.setViewportSize(viewport);await page.goto('/');await page.waitForFunction(()=>!(document.querySelector('#start') as HTMLButtonElement).disabled);
 for(let mission=0;mission<4;mission++){
  await page.evaluate(async(m)=>{const entry='/src/main.ts';const{game}=await import(entry);game.events.emit('dev-jump',m);game.events.emit('campaign-continue');game.scene.start('Arena',{hero:'chrom',companions:['virion','sumia','lissa'],tactical:true,missionIndex:m});},mission);await page.waitForTimeout(300);
  const layout=await page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);const a=game.scene.getScene('Arena') as any,u=game.scene.getScene('Interface') as any,c=a.map.courtyard,cam=a.cameras.main;
   const courtyard={x:(c.left-cam.worldView.x)*cam.zoom,y:(c.top-cam.worldView.y)*cam.zoom,width:(c.right-c.left)*cam.zoom,height:(c.bottom-c.top)*cam.zoom};
   const overlap=(r:any)=>r.x<courtyard.x+courtyard.width&&r.x+r.width>courtyard.x&&r.y<courtyard.y+courtyard.height&&r.y+r.height>courtyard.y;
   const bounds=[u.deploymentBackground.getBounds(),u.partyBackground.getBounds(),u.damageControls.getBounds(),u.miniTerrain.getBounds()];
   return {overlap:bounds.map(overlap),gap:u.deploymentBegin.y-(u.deploymentControls.y+u.deploymentControls.height),top:u.deploymentPanel.y,height:u.deploymentBackground.height,zoom:cam.zoom,hudResolution:u.deploymentHint.style.resolution,labels:a.campLabels.filter((o:any)=>o.type==='Text').map((o:any)=>o.style.resolution)};});
  expect(layout.overlap,`mission ${mission+1}`).toEqual([false,false,false,false]);expect(layout.gap).toBeGreaterThanOrEqual(16);expect(layout.top).toBeGreaterThanOrEqual(160);expect(layout.hudResolution).toBe(3);expect(layout.labels.every((r:number)=>r===3)).toBe(true);
  await page.keyboard.press('Space');
  const manual=await page.evaluate(async()=>{const e='/src/main.ts';const{game}=await import(e);return {...(game.scene.getScene('Arena') as any).deployment.chrom};});
  if(viewport.width===809)await page.keyboard.press('Enter');else{const point=await page.evaluate(async()=>{const e='/src/main.ts';const{game}=await import(e);const u=game.scene.getScene('Interface') as any,b=game.canvas.getBoundingClientRect();return{x:b.left+(u.deploymentPanel.x+12+66)*b.width/896,y:b.top+(u.deploymentPanel.y+u.deploymentBegin.y+14)*b.height/544};});await page.mouse.click(point.x,point.y);}await page.waitForTimeout(150);
  const placed=await page.evaluate(async()=>{const e='/src/main.ts';const{game}=await import(e);const a=game.scene.getScene('Arena') as any;return {manual:a.deployment.chrom,all:a.party.every((h:string)=>!!a.deployment[h]),unique:Object.values(a.deployment).map((p:any)=>`${p.x},${p.y}`),deploying:a.deploying};});
  expect(placed.manual).toEqual(manual);expect(placed.all,JSON.stringify({mission,placed,manual})).toBe(true);expect(new Set(placed.unique).size).toBe(placed.unique.length);expect(placed.deploying).toBe(true);
  if(mission===3)await page.screenshot({path:`docs/playtests/deployment-spacing-${viewport.width}.png`});
  await page.keyboard.press('r');await page.waitForTimeout(150);expect(await page.evaluate(async()=>{const e='/src/main.ts';const{game}=await import(e);const a=game.scene.getScene('Arena') as any;return a.deploying || a.deploymentGuide.visible || a.planningGrid.visible;})).toBe(false);
 }
});
