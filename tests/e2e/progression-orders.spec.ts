import {test,expect} from '@playwright/test';
test('kills award shared XP, level growth affects damage/HP and restart resets native HUD',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'Morgan',exact:true}).press('Enter');await page.getByRole('button',{name:'Begin battle'}).press('Enter');
 const result=await page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);const s=game.scene.getScene('Arena');s.scene.pause();s.enemies.clear(true,true);s.time.removeAllEvents();s.spawning=1;
  for(let i=0;i<4;i++){const e=s.enemies.create(350,230,'soldier');e.setData({health:1,weapon:'sword'});s.damageEnemy(e,100,'tome','ally');}
  return {level:s.progression.level,xp:s.progression.xp,hp:s.progression.stats.hp,kills:s.kills,hud:s.battleHud.title.text,pending:s.battleHud.pendingXp};});
 expect(result.level).toBe(2);expect(result.xp).toBe(0);expect(result.kills).toBe(4);expect(result.hp).toBeGreaterThanOrEqual(100);expect(result.hud).toBe('Morgan');expect(result.pending).toBeGreaterThan(0);
 await page.getByRole('button',{name:'Main menu',exact:true}).press('Enter');await page.getByRole('button',{name:'Begin battle'}).press('Enter');
 expect(await page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);const s=game.scene.getScene('Arena');return {level:s.progression.level,xp:s.progression.xp,mode:s.allyMode};})).toEqual({level:1,xp:0,mode:'defend'});
});
test('Q toggles defend/attack; defend follows player and ignores distant enemies',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'Begin battle'}).press('Enter');
 const before=await page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);const s=game.scene.getScene('Arena');s.scene.pause();s.enemies.clear(true,true);s.time.removeAllEvents();s.spawning=1;s.brains=new WeakMap();const a=s.allies.getChildren()[0];a.body.reset(300,230);a.body.updateFromGameObject();const e=s.enemies.create(500,230,'soldier');e.setSize(28,28).setOffset(11,15);e.body.updateFromGameObject();e.setData({health:60,speed:0});s.updateEnemy(a,1000);const result={mode:s.allyMode,target:!!s.brains.get(a).targetUnit,follows:a.body.velocity.x<0};s.scene.resume();return result;});
 expect(before).toEqual({mode:'defend',target:false,follows:true});await page.locator('#game').focus();await page.keyboard.press('q',{delay:80});
 await expect.poll(()=>page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);const s=game.scene.getScene('Arena');return s.allyMode;})).toBe('attack');
 await page.keyboard.press('q',{delay:80});await expect.poll(()=>page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);return game.scene.getScene('Arena').allyMode;})).toBe('defend');
});
