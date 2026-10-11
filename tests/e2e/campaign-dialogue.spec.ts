import {test,expect} from '@playwright/test';
test('dialogue emphasizes the speaker and advances to preparations through keyboard and pointer',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/');await page.waitForFunction(()=>!(document.querySelector('#start') as HTMLButtonElement).disabled);await page.locator('#party-mode').press('Enter');await page.getByRole('button',{name:'Lissa',exact:true}).press('Enter');await page.locator('#start').press('Enter');
 const read=()=>page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);const scene=game.scene.getScene('Campaign') as any;return {phase:scene.phase,line:scene.line,portraits:scene.content.list.filter((o:any)=>o.getData('dialogue-side')!==undefined).map((o:any)=>({side:o.getData('dialogue-side'),active:o.getData('speaker-active'),alpha:o.alpha,width:o.displayWidth,height:o.displayHeight})),next:scene.content.list.some((o:any)=>o.getData('dialogue-next'))};});
 await expect.poll(async()=>(await read()).next).toBe(true);const first=await read();expect(first.portraits).toHaveLength(2);expect(first.portraits.filter((p:any)=>p.active)).toHaveLength(1);expect(first.portraits.every((p:any)=>p.width<=340&&p.height<=340)).toBe(true);
 await page.screenshot({path:'/tmp/campaign-dialogue-left.png'});await page.keyboard.press('Enter');await expect.poll(async()=>(await read()).line).toBe(1);await page.screenshot({path:'/tmp/campaign-dialogue-right.png'});
 const box=(await page.locator('canvas').boundingBox())!;await page.mouse.click(box.x+448*box.width/896,box.y+460*box.height/544);await expect.poll(async()=>(await read()).line).toBe(2);
 await page.keyboard.press('Space');await expect.poll(async()=>(await read()).phase).toBe('shop');await page.keyboard.press('s');expect(errors).toEqual([]);
});
