import {test,expect} from '@playwright/test';
test('combat information is compact by default and I reveals equipment without changing F controls',async({page})=>{
 await page.goto('/?mission=siege');await page.waitForFunction(()=>!(document.querySelector('#start') as HTMLButtonElement).disabled);await page.locator('#start').press('Enter');await page.keyboard.press('Space',{delay:80});await page.keyboard.press('r',{delay:80});
 const hud=()=>page.evaluate(async()=>{const entry='/src/main.ts';const {game}=await import(entry);const a=game.scene.getScene('Arena');return {expanded:a.battleHud.expanded,items:a.battleHud.slots.filter((row:any)=>row.text.visible).map((row:any)=>row.text.text),weapon:a.weaponLoadout().equippedSlot};});
 await expect.poll(async()=>(await hud()).expanded).toBe(false);expect((await hud()).items).toEqual([]);
 await page.keyboard.press('i');await expect.poll(async()=>(await hud()).expanded).toBe(true);expect((await hud()).items).toHaveLength(2);
 await page.keyboard.press('f');await expect.poll(async()=>(await hud()).weapon).toBe(1);
 await page.keyboard.press('i');await expect.poll(async()=>(await hud()).expanded).toBe(false);expect((await hud()).items).toEqual([]);
});
