import {test,expect} from '@playwright/test';
test('scaled mouse aim is independent of movement, locks windup and resets on menu',async({page})=>{
  await page.setViewportSize({width:900,height:900}); await page.goto('/?battle=legacy');
  await page.getByRole('button',{name:'Morgan',exact:true}).press('Enter'); await page.getByRole('button',{name:'Begin battle'}).press('Enter');
  await page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);const s=game.scene.getScene('Arena');s.allies.clear(true,true);s.enemies.clear(true,true);s.time.removeAllEvents();s.spawning=1;});
  const canvas=page.locator('canvas'),bounds=(await canvas.boundingBox())!;
  await page.mouse.move(bounds.x+bounds.width*0.8,bounds.y+bounds.height*0.43);
  await expect.poll(()=>page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);return game.scene.getScene('Arena').pointerAim.x;})).toBeCloseTo(896*.8,0);
  await page.locator('#game').focus(); await page.keyboard.down('a');
  await expect.poll(()=>page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);const s=game.scene.getScene('Arena');return s.facing.x>0&&s.player.body.velocity.x<0;})).toBe(true);
  await page.keyboard.up('a');await page.mouse.click(bounds.x+bounds.width*.8,bounds.y+bounds.height*.43);
  await expect.poll(()=>page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);return !!game.scene.getScene('Arena').playerShot;}),{intervals:[10,20,30]}).toBe(true);
  await page.mouse.move(bounds.x+bounds.width*.05,bounds.y+bounds.height*.43);
  await expect.poll(()=>page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);return game.scene.getScene('Arena').arrows.getChildren()[0]?.body.velocity.x??0;})).toBeGreaterThan(0);
  await page.mouse.move(0,0);
  await expect.poll(()=>page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);return game.scene.getScene('Arena').facing.x;})).toBe(-1);
  await page.getByRole('button',{name:'Main menu',exact:true}).press('Enter');await page.getByRole('button',{name:'Begin battle'}).press('Enter');
  expect(await page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);const s=game.scene.getScene('Arena');return {pointer:s.pointerAim,shot:s.playerShot};})).toEqual({pointer:undefined,shot:undefined});
});
