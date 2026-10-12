import {test,expect} from '@playwright/test';
test('native guard prevents attacks, slows movement, protects front physical hits and resets',async({page})=>{
 await page.goto('/?battle=legacy');await page.getByRole('button',{name:'Chrom',exact:true}).press('Enter');await page.getByRole('button',{name:'Begin battle'}).press('Enter');
 await page.evaluate(async()=>{const{game}=await import(String('/src/main.ts'));const s:any=game.scene.getScene('Arena');s.allies.clear(true,true);s.enemies.clear(true,true);s.time.removeAllEvents();s.spawning=1;s.player.setPosition(448,288);s.progression.stats.speed=s.progression.base.speed;s.progression.stats.luck=s.progression.base.luck;});
 await page.locator('#game').focus();await page.keyboard.down('Control');await page.keyboard.down('d');
 await expect.poll(()=>page.evaluate(async()=>{const{game}=await import(String('/src/main.ts'));const s:any=game.scene.getScene('Arena');return s.guard.active&&s.player.body.velocity.x>0&&s.player.body.velocity.x<80;})).toBe(true);
 await page.keyboard.up('d');await page.keyboard.press('Space');
 expect(await page.evaluate(async()=>{const{game}=await import(String('/src/main.ts'));return (game.scene.getScene('Arena') as any).lastAttack;})).toBe(-Infinity);
 const result=await page.evaluate(async()=>{const{game}=await import(String('/src/main.ts'));const s:any=game.scene.getScene('Arena');s.facing={x:1,y:0};s.health=100;s.lastDamage=-Infinity;s.takeDamage(40,'sword',{x:s.player.x+100,y:s.player.y});const front=s.health;s.lastDamage=-Infinity;s.takeDamage(40,'sword',{x:s.player.x-100,y:s.player.y});const rear=s.health;s.lastDamage=-Infinity;s.takeDamage(40,'tome',{x:s.player.x+100,y:s.player.y});return {front,rear,magic:s.health};});
 expect(result).toEqual({front:86,rear:46,magic:6});await page.keyboard.up('Control');
 await expect.poll(()=>page.evaluate(async()=>{const{game}=await import(String('/src/main.ts'));return (game.scene.getScene('Arena') as any).guard.active;})).toBe(false);
 await page.getByRole('button',{name:'Main menu',exact:true}).press('Enter');await page.getByRole('button',{name:'Begin battle'}).press('Enter');
 expect(await page.evaluate(async()=>{const{game}=await import(String('/src/main.ts'));return (game.scene.getScene('Arena') as any).guard;})).toEqual({meter:100,active:false,broken:false});
});
test('Wind projectile retains weapon effectiveness after switching and ally resolver shares rules',async({page})=>{
 await page.goto('/?battle=legacy');await page.getByRole('button',{name:'Morgan',exact:true}).press('Enter');await page.getByRole('button',{name:'Begin battle'}).press('Enter');
 const result=await page.evaluate(async()=>{const{game}=await import(String('/src/main.ts'));const{WEAPONS}=await import(String('/src/game/data/equipment.ts'));const s:any=game.scene.getScene('Arena');s.allies.clear(true,true);s.enemies.clear(true,true);s.time.removeAllEvents();s.spawning=1;s.arrows.clear(true,true);s.weaponLoadout().items[0]={weaponId:'wind',uses:null};s.fireArrow(s.player,{x:1,y:0},'player','tome');const shot=s.arrows.getChildren()[0];s.weaponLoadout().items[0]={weaponId:'fire',uses:null};const target=s.enemies.create(600,300,'soldier').setData({health:200,weapon:'lance',flying:true,resistance:6,defense:20});s.damageEnemy(target,26,'tome','player',undefined,s.player,WEAPONS[shot.getData('weaponId')]);const wind=target.getData('health');s.damageEnemy(target,26,'tome','ally',undefined,undefined,WEAPONS.fire);return {wind,afterFire:target.getData('health'),weaponId:shot.getData('weaponId')};});
 expect(result).toEqual({wind:160,afterFire:140,weaponId:'wind'});
});
