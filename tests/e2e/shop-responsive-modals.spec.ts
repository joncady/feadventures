import {test,expect} from '@playwright/test';
import {returningPlayerStorageState} from './returning-player';
test.use({viewport:{width:667,height:375},hasTouch:true,isMobile:true,deviceScaleFactor:2,storageState:returningPlayerStorageState()});
async function prepare(page:any,kind:'replacement'|'migration'){
 await page.goto('/');await page.waitForFunction(()=>!(document.querySelector('#start') as HTMLButtonElement).disabled);
 await page.evaluate(async(kind:string)=>{
  const entry=(document.querySelector('script[src*="/src/main.ts"]') as HTMLScriptElement).src,{game}=await import(entry);const {newCampaign}=await import(String('/src/game/systems/campaign.ts'));const {HEROES}=await import(String('/src/game/data/config.ts'));
  const campaign=newCampaign(['frederick','lissa'],'awakening-ten');campaign.gold=10000;campaign.missionIndex=8;
  if(kind==='migration')campaign.migrationNotice={kind:'legacy-equipment',refundGold:5950,items:HEROES.map((hero:string)=>({hero,weaponId:'nosferatu',forge:2})),acknowledged:false};
  game.scene.stop('Boot');game.scene.start('Campaign',{...campaign,party:['frederick','lissa'],skipDialogue:true});const scene=game.scene.getScene('Campaign');scene.armoryPage=1;
  if(kind==='replacement')scene.replacement={hero:'frederick',itemId:'brave-sword'};scene.render();
  (window as any).__resizeSounds=0;game.events.on('ux-feedback',()=>{(window as any).__resizeSounds++;});
 },kind);
}
async function bounds(page:any){return page.evaluate(async()=>{
 const entry=(document.querySelector('script[src*="/src/main.ts"]') as HTMLScriptElement).src,{game}=await import(entry),scene=game.scene.getScene('Campaign'),scale=game.canvas.getBoundingClientRect().width/896;
 const frame=scene.content.list.find((object:any)=>object.getData('replacement-frame')||object.getData('migration-frame')),copy=scene.content.list.find((object:any)=>object.getData('replacement-copy')||object.getData('migration-copy'));
 return {font:parseFloat(copy.style.fontSize)*scale,copy:copy.text,copyBottom:copy.getBounds().bottom,frame:{x:frame.getBounds().x,right:frame.getBounds().right,bottom:frame.getBounds().bottom},buttons:scene.rows.map((row:any)=>({label:row.text,height:row.input.hitArea.height*scale,bounds:{x:row.getBounds().x,y:row.getBounds().y,right:row.getBounds().right,bottom:row.getBounds().bottom}})),hero:scene.heroIndex,page:scene.armoryPage,pending:scene.replacement,focus:scene.focus,sounds:(window as any).__resizeSounds};
 });}
for(const kind of ['replacement','migration'] as const)test(`${kind} remains readable and reachable across fullscreen, page and resizing`,async({page})=>{
 const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));await prepare(page,kind);
 await page.evaluate(()=>{Object.defineProperty(document.querySelector('.game-shell'),'requestFullscreen',{value:undefined});(document.querySelector('#fullscreen') as HTMLButtonElement).click();});await expect(page.locator('body')).toHaveClass(/viewport-fullscreen/);
 await expect.poll(async()=>Math.min(...(await bounds(page)).buttons.map((button:any)=>button.height))).toBeGreaterThanOrEqual(44);
 if(kind==='replacement')await page.keyboard.press('ArrowRight');const before=await bounds(page);
 await page.evaluate(()=>(document.querySelector('#fullscreen') as HTMLButtonElement).click());await expect(page.locator('body')).not.toHaveClass(/viewport-fullscreen/);
 for(const viewport of [{width:667,height:375},{width:844,height:390},{width:667,height:375}]){
  await page.setViewportSize(viewport);await expect.poll(async()=>(await bounds(page)).font).toBeGreaterThanOrEqual(12);await expect.poll(async()=>Math.min(...(await bounds(page)).buttons.map((button:any)=>button.height))).toBeGreaterThanOrEqual(44);
  const state=await bounds(page);expect(state.hero).toBe(before.hero);expect(state.page).toBe(before.page);expect(state.pending).toEqual(before.pending);expect(state.focus).toBe(before.focus);
  for(const button of state.buttons){expect(button.bounds.x).toBeGreaterThanOrEqual(state.frame.x);expect(button.bounds.right).toBeLessThanOrEqual(state.frame.right);expect(button.bounds.bottom).toBeLessThanOrEqual(state.frame.bottom);expect(state.copyBottom).toBeLessThan(button.bounds.y);}
 }
 expect((await bounds(page)).sounds).toBe(before.sounds);expect(errors).toEqual([]);
});
