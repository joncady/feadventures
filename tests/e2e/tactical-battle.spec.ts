import {test,expect,type Page} from '@playwright/test';
async function point(page:Page,x:number,y:number){const b=(await page.locator('canvas').boundingBox())!;await page.mouse.click(b.x+x*b.width/896,b.y+y*b.height/544);}
async function deploy(page:Page){
 await page.goto('/');await page.waitForFunction(()=>!(document.querySelector('#start') as HTMLButtonElement).disabled);
 await point(page,534,96);
 const cards=await page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);return game.registry.get('character-card-centers');});
 for(const hero of ['morgan','virion','sumia'])await point(page,cards[hero].x,cards[hero].y);
 await point(page,448,506);
 await expect.poll(()=>page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);return game.scene.getScene('Arena').deploying;})).toBe(true);
}
test('deployment shows fixed camps, validates native placement and starts a larger battlefield',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await deploy(page);
 const planned=await page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);const s=game.scene.getScene('Arena');return {width:s.width,height:s.height,hostiles:s.enemies.countActive(),allies:s.allies.countActive(),paused:s.physics.world.isPaused,spawns:s.spawning,party:s.party,zoom:s.cameras.main.zoom,positions:s.enemies.getChildren().map((e:any)=>[e.texture.key,e.x,e.y])};});
 expect(planned).toMatchObject({width:1792,height:1088,hostiles:16,allies:7,paused:true,spawns:0,party:['chrom','morgan','virion','sumia'],zoom:.5});
 await point(page,80,87);await point(page,600,225);
 const placement=await page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);return game.scene.getScene('Arena').deployment.morgan;});expect(placement.x).toBeCloseTo(1200,-1);expect(placement.y).toBeCloseTo(450,-1);
 await point(page,755,450);
 expect(await page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);return game.scene.getScene('Arena').deployment.morgan;})).toEqual(placement);
 await point(page,117,509);
 expect(await page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);const s=game.scene.getScene('Arena');return {deployment:s.deploying,paused:s.physics.world.isPaused,zoom:s.cameras.main.zoom,phase:game.registry.get('interface-state').phase,minimap:game.scene.getScene('Interface').minimap.visible};})).toEqual({deployment:false,paused:false,zoom:1,phase:'battle',minimap:true});
 await page.locator('#game').focus();await page.keyboard.press('e',{delay:80});await expect(page.locator('#hero-name')).toHaveText('Morgan · tome');await page.keyboard.press('q',{delay:80});await expect(page.locator('#hero-name')).toHaveText('Chrom · sword');
 await page.getByRole('button',{name:'Main menu',exact:true}).press('Enter');await page.locator('#start').press('Enter');
 const reset=await page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);const s=game.scene.getScene('Arena');return s.enemies.getChildren().map((e:any)=>[e.texture.key,e.x,e.y]);});expect(reset).toEqual(planned.positions);expect(errors).toEqual([]);
});
test('party XP, health and cooldowns survive switching, pending magic belongs to its original character',async({page})=>{
 await deploy(page);await point(page,117,509);
 const state=await page.evaluate(async()=>{
  const entry='/src/main.ts';const{game}=await import(entry);game.scene.pause('Arena');const s=game.scene.getScene('Arena');s.time.removeAllEvents();s.enemies.clear(true,true);s.spawning=1;
  s.health=76;s.lastAttack=12345;
  for(let i=0;i<4;i++){const e=s.enemies.create(600,500,'soldier');e.setData({health:1,weapon:'sword'});s.damageEnemy(e,100,'tome','player');}
  const xp=s.party.map((hero:string)=>({hero,level:s.partyStates.get(hero).progress.level,xp:s.partyStates.get(hero).progress.xp}));
  s.switchCharacter(1);const morgan={hero:s.hero,level:s.progression.level,health:s.health};
  s.facing={x:1,y:0};s.attack();s.lastAttack=s.time.now;const due=s.playerShot.at;s.switchCharacter(1);
  const ally=s.allies.getChildren().find((a:any)=>a.getData('companionHero')==='morgan');s.updateEnemy(ally,due);
  const arrow=s.arrows.getChildren()[0];const pending={weapon:arrow.getData('weapon'),range:arrow.getData('maxRange'),damage:arrow.getData('damage'),faction:arrow.getData('faction')};
  s.switchCharacter(-1);const cooldown=s.lastAttack;s.switchCharacter(-1);
  const chrom={hero:s.hero,health:s.health,level:s.progression.level,lastAttack:s.lastAttack};
  s.switchCharacter(-1);const flyer={hero:s.hero,flying:s.unitFlying(s.player),weapon:s.playerWeapon.texture.key};
  s.player.body.reset(600,220);s.player.body.updateFromGameObject();s.recoverFromTerrain(s.player);const flyingX=s.player.x;
  s.switchCharacter(1);s.player.body.reset(600,220);s.player.body.updateFromGameObject();s.recoverFromTerrain(s.player);const groundX=s.player.x;
  return {xp,morgan,pending,cooldown,chrom,flyer,flyingX,groundX};
 });
 expect(state.xp.map((p:any)=>[p.level,p.xp])).toEqual([[2,0],[2,0],[2,0],[2,0]]);expect(state.morgan).toMatchObject({hero:'morgan',level:2});expect(state.pending).toMatchObject({weapon:'tome',range:300,faction:'ally'});expect(state.pending.damage).toBeGreaterThanOrEqual(30);expect(state.chrom).toMatchObject({hero:'chrom',level:2,lastAttack:12345});expect(state.chrom.health).toBeGreaterThanOrEqual(76);expect(state.cooldown).toBeGreaterThan(0);expect(state.flyer).toEqual({hero:'sumia',flying:true,weapon:'weapon-lance'});expect(state.flyingX).toBe(600);expect(state.groundX).not.toBe(600);
});
test('death skips fallen companions and victory waits for hostile projectiles',async({page})=>{
 await deploy(page);await point(page,117,509);
 const dead=await page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);game.scene.pause('Arena');const s=game.scene.getScene('Arena');s.progression.stats.speed=s.progression.base.speed;s.progression.stats.luck=s.progression.base.luck;s.lastDamage=-Infinity;s.takeDamage(999,'tome');return {hero:s.hero,chrom:s.partyStates.get('chrom').health,ended:s.ended};});expect(dead).toEqual({hero:'morgan',chrom:0,ended:false});
 const victory=await page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);const s=game.scene.getScene('Arena');s.enemies.clear(true,true);s.arrows.clear(true,true);const shooter=s.allies.getChildren()[0];s.fireArrow(shooter,{x:1,y:0},'enemy','bow');s.update(s.time.now);const before=s.ended;s.arrows.clear(true,true);s.update(s.time.now);return {before,after:s.ended,result:document.querySelector('#result')!.textContent};});expect(victory.before).toBe(false);expect(victory.after).toBe(true);expect(victory.result).toContain('Battle won');
 await page.getByRole('button',{name:'Try again',exact:true}).press('Enter');const reset=await page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);const s=game.scene.getScene('Arena');return {hero:s.hero,deploying:s.deploying,arrows:s.arrows.countActive(),states:[...s.partyStates.values()].map((u:any)=>[u.health,u.progress.level,u.progress.xp])};});expect(reset).toEqual({hero:'chrom',deploying:true,arrows:0,states:[[100,1,0],[100,1,0],[100,1,0],[100,1,0]]});
});
test('camera aim uses world coordinates and the minimap reports the controlled unit and live teams',async({page})=>{
 await deploy(page);await point(page,117,509);
 await page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);const s=game.scene.getScene('Arena');s.enemies.clear(true,true);s.time.removeAllEvents();const enemy=s.enemies.create(1650,80,'heavy');enemy.setSize(28,28).setOffset(11,15);enemy.body.updateFromGameObject();enemy.setData({health:999,maxHealth:999,speed:0,damage:0,weapon:'axe'});s.switchCharacter(1);s.switchCharacter(1);s.player.body.reset(1200,650);s.player.body.updateFromGameObject();s.cameras.main.stopFollow().setScroll(896,400);});
 await page.waitForTimeout(100);await point(page,500,230);
 const aim=await page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);const s=game.scene.getScene('Arena');const camera=s.cameras.main;return {hero:s.hero,aim:s.pointerAim,scroll:{x:camera.scrollX,y:camera.scrollY},world:camera.worldView.width,portrait:s.battleHud.title.text};});
 expect(aim.hero).toBe('virion');expect(aim.portrait).toBe('Virion');expect(aim.world).toBe(896);expect(aim.aim.x).toBeCloseTo(aim.scroll.x+500,-1);expect(aim.aim.y).toBeCloseTo(aim.scroll.y+230,-1);
 const map=await page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);const s=game.scene.getScene('Arena');let data:any;game.events.once('tactical-map',(snapshot:any)=>{data=snapshot;});s.publishTacticalMap();return data;});expect(map.controlled).toBe('virion');expect(map.enemies).toHaveLength(1);expect(map.allies).toHaveLength(8);expect(map.camera.width).toBe(896);expect(map.party).toHaveLength(4);
});
test('soldiers cannot keep a battle alive after every controllable party member falls',async({page})=>{
 await deploy(page);await point(page,117,509);
 const defeat=await page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);game.scene.pause('Arena');const s=game.scene.getScene('Arena');for(const ally of [...s.allies.getChildren()])if(ally.getData('companionHero'))s.damageEnemy(ally,999,'tome','enemy');s.lastDamage=-Infinity;s.takeDamage(999,'tome');return {ended:s.ended,soldiers:s.allies.countActive(),result:document.querySelector('#result')!.textContent,arrows:s.arrows.countActive()};});expect(defeat).toMatchObject({ended:true,soldiers:4,arrows:0});expect(defeat.result).toContain('Party defeated');
});
