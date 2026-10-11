import {test,expect} from '@playwright/test';
test('shop portraits select the correct member once and keyboard cycling stays available',async({page})=>{
 await page.goto('/');await page.waitForFunction(()=>!(document.querySelector('#start') as HTMLButtonElement).disabled);
 await page.locator('#start').press('Enter');await expect.poll(()=>page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);return game.scene.isActive('Campaign');})).toBe(true);
 await page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);const scene:any=game.scene.getScene('Campaign');scene.dataState={missionIndex:0,gold:300,party:['chrom','lissa','miriel'],members:[]};scene.phase='shop';scene.render();(window as any).__shopSounds=0;game.events.on('ux-feedback',(event:any)=>{if(event.kind==='cursor')(window as any).__shopSounds++;});});
 const canvas=(await page.locator('canvas').boundingBox())!;
 await page.mouse.click(canvas.x+219*canvas.width/896,canvas.y+453*canvas.height/544);
 const state=()=>page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);const scene:any=game.scene.getScene('Campaign');return{index:scene.heroIndex,sounds:(window as any).__shopSounds,selected:scene.content.list.filter((o:any)=>o.getData('shop-party-selected')).map((o:any)=>o.getData('shop-party-hero')),legends:scene.content.list.filter((o:any)=>o.text?.includes('Q / E')).length};});
 await expect.poll(async()=>(await state()).index).toBe(1);expect((await state()).sounds).toBe(1);expect((await state()).selected).toEqual(['lissa']);expect((await state()).legends).toBe(0);
 await page.mouse.click(canvas.x+219*canvas.width/896,canvas.y+453*canvas.height/544);expect((await state()).sounds).toBe(1);
 await page.keyboard.press('e');await expect.poll(async()=>(await state()).index).toBe(2);expect((await state()).sounds).toBe(2);
});
