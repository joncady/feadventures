import {test,expect,type Page} from '@playwright/test';
async function point(page:Page,x:number,y:number){const b=(await page.locator('canvas').boundingBox())!;await page.mouse.click(b.x+x*b.width/896,b.y+y*b.height/544);}
async function worldPoint(page:Page,x:number,y:number){const screen=await page.evaluate(async({x,y})=>{const entry='/src/main.ts';const{game}=await import(entry);const c=game.scene.getScene('Arena').cameras.main;return {x:(x-c.worldView.x)*c.zoom,y:(y-c.worldView.y)*c.zoom};},{x,y});await point(page,screen.x,screen.y);}
async function deploy(page:Page){
 await page.goto('/?mission=siege');await page.waitForFunction(()=>!(document.querySelector('#start') as HTMLButtonElement).disabled);
 await point(page,78,154);
 const cards=await page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);return game.registry.get('character-card-centers');});
 for(const hero of ['morgan','virion','sumia'])await point(page,cards[hero].x,cards[hero].y);
 await point(page,791,458);
 await expect.poll(()=>page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);return game.scene.getScene('Arena').deploying;})).toBe(true);
 await page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);const s=game.scene.getScene('Arena');const ids=[...s.party,...s.allies.getChildren().filter((a:any)=>!a.getData('companionHero')).map((a:any)=>a.getData('deploymentId'))];for(const [i,id] of ids.entries()){s.selectedDeployment=id;if(!s.placeDeployment({x:480+(i%4)*128,y:352+Math.floor(i/4)*192}))throw Error(`Invalid fixture deployment ${id}`);}});
}
test('deployment shows fixed camps, validates native placement and starts a larger battlefield',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await deploy(page);
 const planned=await page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);const s=game.scene.getScene('Arena');return {width:s.width,height:s.height,hostiles:s.enemies.countActive(),allies:s.allies.countActive(),paused:s.physics.world.isPaused,spawns:s.spawning,party:s.party,zoom:s.cameras.main.zoom,positions:s.enemies.getChildren().map((e:any)=>[e.texture.key,e.x,e.y])};});
 expect(planned).toMatchObject({width:1280,height:896,hostiles:0,allies:7,paused:true,spawns:0,party:['chrom','morgan','virion','sumia'],zoom:.7});
 await point(page,80,87);await worldPoint(page,800,480);
 const placement=await page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);return game.scene.getScene('Arena').deployment.morgan;});expect(placement.x).toBeCloseTo(800,-1);expect(placement.y).toBeCloseTo(480,-1);
 await worldPoint(page,1056,480);
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
  s.player.body.reset(352,352);s.player.body.updateFromGameObject();s.recoverFromTerrain(s.player);const flyingX=s.player.x;
  s.switchCharacter(1);s.player.body.reset(352,352);s.player.body.updateFromGameObject();s.recoverFromTerrain(s.player);const groundX=s.player.x;
  return {xp,morgan,pending,cooldown,chrom,flyer,flyingX,groundX};
 });
 expect(state.xp.map((p:any)=>[p.level,p.xp])).toEqual([[2,0],[2,0],[2,0],[2,0]]);expect(state.morgan).toMatchObject({hero:'morgan',level:2});expect(state.pending).toMatchObject({weapon:'tome',range:300,faction:'ally'});expect(state.pending.damage).toBeGreaterThanOrEqual(30);expect(state.chrom).toMatchObject({hero:'chrom',level:2,lastAttack:12345});expect(state.chrom.health).toBeGreaterThanOrEqual(76);expect(state.cooldown).toBeGreaterThan(0);expect(state.flyer).toEqual({hero:'sumia',flying:true,weapon:'weapon-lance'});expect(state.flyingX).toBe(352);expect(state.groundX).not.toBe(352);
});
test('death skips fallen companions and victory waits for hostile projectiles',async({page})=>{
 await deploy(page);await point(page,117,509);
 const dead=await page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);game.scene.pause('Arena');const s=game.scene.getScene('Arena');s.progression.stats.speed=s.progression.base.speed;s.progression.stats.luck=s.progression.base.luck;s.lastDamage=-Infinity;s.takeDamage(999,'tome');return {hero:s.hero,chrom:s.partyStates.get('chrom').health,ended:s.ended};});expect(dead).toEqual({hero:'morgan',chrom:0,ended:false});
 const victory=await page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);const s=game.scene.getScene('Arena');s.enemies.clear(true,true);s.arrows.clear(true,true);s.releases=[];s.stage.phase='boss';const shooter=s.allies.getChildren()[0];s.fireArrow(shooter,{x:1,y:0},'enemy','bow');s.update(s.time.now);const before=s.ended;s.arrows.clear(true,true);s.update(s.time.now);return {before,after:s.ended,result:document.querySelector('#result')!.textContent};});expect(victory.before).toBe(false);expect(victory.after).toBe(true);expect(victory.result).toContain('Battle won');
 await page.getByRole('button',{name:'Try again',exact:true}).press('Enter');const reset=await page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);const s=game.scene.getScene('Arena');return {hero:s.hero,deploying:s.deploying,arrows:s.arrows.countActive(),states:[...s.partyStates.values()].map((u:any)=>[u.health,u.progress.level,u.progress.xp])};});expect(reset).toEqual({hero:'chrom',deploying:true,arrows:0,states:[[100,1,0],[100,1,0],[100,1,0],[100,1,0]]});
});
test('camera aim uses world coordinates and the minimap reports the controlled unit and live teams',async({page})=>{
 await deploy(page);await point(page,117,509);
 await page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);const s=game.scene.getScene('Arena');s.enemies.clear(true,true);s.time.removeAllEvents();const enemy=s.enemies.create(1650,80,'heavy');enemy.setSize(28,28).setOffset(11,15);enemy.body.updateFromGameObject();enemy.setData({health:999,maxHealth:999,speed:0,damage:0,weapon:'axe'});s.switchCharacter(1);s.switchCharacter(1);s.player.body.reset(1200,650);s.player.body.updateFromGameObject();s.cameras.main.stopFollow().setScroll(896,400);});
 await page.waitForTimeout(100);await point(page,500,230);
 const aim=await page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);const s=game.scene.getScene('Arena');const camera=s.cameras.main;return {hero:s.hero,aim:s.pointerAim,scroll:{x:camera.scrollX,y:camera.scrollY},world:camera.worldView.width,portrait:s.battleHud.title.text};});
 expect(aim.hero).toBe('virion');expect(aim.portrait).toBe('Virion');expect(aim.world).toBe(896);expect(aim.aim.x).toBeCloseTo(aim.scroll.x+500,-1);expect(aim.aim.y).toBeCloseTo(aim.scroll.y+230,-1);
 const map=await page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);const s=game.scene.getScene('Arena');let data:any;game.events.once('tactical-map',(snapshot:any)=>{data=snapshot;});s.publishTacticalMap();return data;});expect(map.controlled).toBe('virion');expect(map.enemies).toHaveLength(0);expect(map.allies).toHaveLength(8);expect(map.camera.width).toBe(896);expect(map.party).toHaveLength(4);
});
test('soldiers cannot keep a battle alive after every controllable party member falls',async({page})=>{
 await deploy(page);await point(page,117,509);
 const defeat=await page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);game.scene.pause('Arena');const s=game.scene.getScene('Arena');for(const ally of [...s.allies.getChildren()])if(ally.getData('companionHero'))s.damageEnemy(ally,999,'tome','enemy');s.lastDamage=-Infinity;s.takeDamage(999,'tome');return {ended:s.ended,soldiers:s.allies.countActive(),result:document.querySelector('#result')!.textContent,arrows:s.arrows.countActive()};});expect(defeat).toMatchObject({ended:true,soldiers:4,arrows:0});expect(defeat.result).toContain('Party defeated');
});

test('keyboard party selection, placement feedback and shared damage pacing',async({page})=>{
 await page.goto('/?mission=siege');await page.waitForFunction(()=>!(document.querySelector('#start') as HTMLButtonElement).disabled);await page.locator('#game').focus();
 await page.keyboard.press('d');await page.keyboard.press('Enter');
 expect(await page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);return game.registry.get('interface-state').hero;})).toBe('lucina');
 await page.keyboard.press('r');await page.keyboard.press('r');
 await expect.poll(()=>page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);return game.scene.getScene('Arena').deploying;})).toBe(true);
 const before=await page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);return {...game.scene.getScene('Arena').deployment.lucina};});
 await page.keyboard.press('d');await page.keyboard.press('Space');
 expect(await page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);return game.scene.getScene('Arena').deployment.lucina.x;})).toBe(544);
 expect(await page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);return game.scene.getScene('Interface').deploymentHint.text;})).toContain('Army ready');
 const health=await page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);const s=game.scene.getScene('Arena');const enemy=s.createHostile(220,480,'soldier');enemy.setData({health:100,defense:0,weapon:'sword'});s.damageEnemy(enemy,40,'sword');return enemy.getData('health');});expect(health).toBe(80);
 const damageY=await page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);return 208+game.scene.getScene('Interface').damageControls.y;});await point(page,185,damageY);
 expect(await page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);return game.registry.get('damage-scale');})).toBe(.6);
});

test('soldiers deploy automatically and the cursor stays within the courtyard',async({page})=>{
 await page.goto('/?mission=siege');await page.waitForFunction(()=>!(document.querySelector('#start') as HTMLButtonElement).disabled);await page.locator('#start').press('Enter');
 const initial=await page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);const s=game.scene.getScene('Arena');return {placed:Object.keys(s.deployment).length,visible:s.allies.getChildren().filter((a:any)=>a.visible).length,hero:s.player.visible,guards:s.allies.getChildren().map((a:any)=>({x:a.x,y:a.y}))};});expect(initial.placed).toBe(4);expect(initial.visible).toBe(4);expect(initial.hero).toBe(false);expect(new Set(initial.guards.map((p:any)=>`${p.x},${p.y}`)).size).toBe(4);
 await point(page,117,509);expect(await page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);return game.registry.get('interface-state').phase;})).toBe('deployment');
 const cursor=await page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);const s=game.scene.getScene('Arena');for(let i=0;i<30;i++)s.nudgeDeployment(-1,-1);const top={...s.deploymentCursor};for(let i=0;i<30;i++)s.nudgeDeployment(1,1);return {top,bottom:s.deploymentCursor};});expect(cursor).toEqual({top:{x:416,y:288},bottom:{x:864,y:608}});
 await page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);game.scene.getScene('Arena').deploymentCursor={x:480,y:352};});await page.locator('#game').focus();await page.keyboard.press('Space');await page.keyboard.press('r');expect(await page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);return game.scene.getScene('Arena').deploying;})).toBe(false);
});
test('distant combat fades and attacks on companions create a throttled native warning',async({page})=>{
 await deploy(page);await point(page,117,509);
 const result=await page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);game.scene.pause('Arena');const s=game.scene.getScene('Arena');const unit=s.allies.getChildren().find((a:any)=>a.getData('companionHero')==='morgan');let warnings=0;game.events.on('companion-warning',()=>warnings++);s.damageEnemy(unit,20,'sword','enemy');s.damageEnemy(unit,20,'sword','enemy');return {warnings,text:game.scene.getScene('Interface').warning.text,near:s.soundGain({x:s.player.x,y:s.player.y}),far:s.soundGain({x:s.player.x+800,y:s.player.y}),mid:s.soundGain({x:s.player.x+480,y:s.player.y})};});expect(result.warnings).toBe(1);expect(result.text).toContain('Morgan under attack');expect(result.near).toBe(1);expect(result.far).toBe(0);expect(result.mid).toBe(.25);
});

test('Space places the complete army in order and staged releases lead to boss reinforcements',async({page})=>{
 await page.goto('/?mission=siege');await page.waitForFunction(()=>!(document.querySelector('#start') as HTMLButtonElement).disabled);await page.locator('#start').press('Enter');await page.locator('#game').focus();
 await page.keyboard.press('Space');
 const placed=await page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);return Object.keys(game.scene.getScene('Arena').deployment);});expect(placed).toHaveLength(5);expect(placed).toContain('chrom');expect(placed).toContain('soldier-0');
 await page.keyboard.press('r');
 const stages=await page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);game.scene.pause('Arena');const s=game.scene.getScene('Arena');const opening=s.enemies.countActive();s.updateStage(5000);const queued=s.releases.length;s.updateStage(5001);const first=s.enemies.countActive();s.enemies.clear(true,true);s.releases=[];s.stage.waveStarted=5000;s.updateStage(50000);const rest=s.stage.phase;s.updateStage(60000);const wave2=s.stage.wave;s.releases=[];s.enemies.clear(true,true);s.updateStage(105000);s.updateStage(115000);const wave3=s.stage.wave;s.releases=[];s.enemies.clear(true,true);s.updateStage(160000);const warning=s.stage.phase;s.updateStage(168000);const hp=s.boss.getData('health');s.boss.setData('health',1000);s.updateStage(168001);const minions=s.releases.length;s.updateStage(168002);const noDuplicate=s.releases.length;s.updateStage(169501);const elite=s.enemies.getChildren().find((u:any)=>u.getData('level')===3);return {opening,queued,first,rest,wave2,wave3,warning,hp,minions,noDuplicate,elite:elite?.getData('level'),ended:s.ended};});
 expect(stages).toMatchObject({opening:0,queued:16,first:1,rest:'rest',wave2:2,wave3:3,warning:'boss-warning',hp:3600,minions:12,noDuplicate:12,elite:3,ended:false});
});
test('pause freezes stage time and occupied camps do not block other releases or exceed the cap',async({page})=>{
 await deploy(page);await point(page,117,509);await page.locator('#game').focus();await page.keyboard.press('p');
 const paused=await page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);return game.scene.getScene('Arena').battleClock;});await page.waitForTimeout(180);expect(await page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);return game.scene.getScene('Arena').battleClock;})).toBe(paused);
 const release=await page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);const s=game.scene.getScene('Arena');s.stage.start(0);s.updateStage(5000);const spawn=s.campSpawnPoint.bind(s);s.campSpawnPoint=(index:number)=>index===0?undefined:spawn(index);s.updateStage(5500);const first=s.enemies.getChildren()[0];const camp={x:first.x,y:first.y};for(let i=0;i<23;i++)s.createHostile(1100,750,'soldier');const queued=s.releases.length;s.updateStage(50000);return {camp,count:s.enemies.countActive(),queued,after:s.releases.length};});expect(release.camp.x).toBeGreaterThan(1000);expect(release.count).toBe(24);expect(release.after).toBe(release.queued);
});

test('camp pressure, hidden entry positions and attack recovery create risks',async({page})=>{
 await deploy(page);await point(page,117,509);await page.waitForTimeout(100);
 const state=await page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);game.scene.pause('Arena');const s=game.scene.getScene('Arena');s.enemies.clear(true,true);const enemy=s.createHostile(640,480,'soldier');const campTarget=s.chooseTarget(enemy)===s.camp;const companion=s.allies.getChildren().find((a:any)=>a.getData('companionHero')==='morgan');enemy.body.reset(750,450);enemy.body.updateFromGameObject();const aggressive=s.chooseTarget(companion)===enemy;s.enemies.clear(true,true);s.lastAttack=s.time.now;s.attack();s.keys.D.isDown=true;s.update(s.time.now+100);const recoveringSpeed=s.player.body.velocity.x;const delay=s.attackDelay();const view=s.cameras.main.worldView;const point=s.campSpawnPoint(1);const offscreen=point&&!view.contains(point.x,point.y);const portraits=game.scene.getScene('Interface').partyHeads.filter((p:any)=>p.visible).length;s.damageEnemy(s.camp,10000,'tome','enemy');return {campTarget,aggressive,recoveringSpeed,delay,offscreen,portraits,ended:s.ended,result:document.querySelector('#result')!.textContent};});expect(state.campTarget).toBe(true);expect(state.aggressive).toBe(true);expect(state.recoveringSpeed).toBeGreaterThan(0);expect(state.recoveringSpeed).toBeLessThan(50);expect(state.delay).toBeGreaterThanOrEqual(700);expect(state.offscreen).toBe(true);expect(state.portraits).toBe(4);expect(state.ended).toBe(true);expect(state.result).toContain('Hero camp destroyed');
});

test('siege walls block ground units, permit arrows and flyers, and become navigable breaches',async({page})=>{
 await deploy(page);await point(page,117,509);
 const state=await page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);game.scene.pause('Arena');const s=game.scene.getScene('Arena');s.enemies.clear(true,true);const wall=s.siegeWalls.find((w:any)=>w.getData('name')==='West north');const enemy=s.createHostile(300,352,'soldier');const target=s.chooseTarget(enemy)?.getData('structure');const closed=s.navigation.canTravel(s.bodyCenter(enemy),{x:480,y:352});const ground=s.hasLineOfSight({x:320,y:352},{x:480,y:352});const bow=s.hasLineOfSight({x:320,y:352},{x:480,y:352},true);s.selectedDeployment='sumia';const outside=s.placeDeployment({x:100,y:100});const count=s.siegeWalls.filter((w:any)=>w.active).length;s.damageEnemy(wall,10000,'sword','enemy');const opened=s.navigation.canTravel(s.bodyCenter(enemy),{x:480,y:352});s.switchCharacter(-1);s.player.body.reset(480,224);s.player.body.updateFromGameObject();s.recoverFromTerrain(s.player);const flyer=s.player.y;return {count,target,closed,ground,bow,outside,opened,flyer,walls:s.siegeWalls.filter((w:any)=>w.active).length,kills:s.kills};});
 expect(state).toEqual({count:8,target:true,closed:false,ground:false,bow:true,outside:false,opened:true,flyer:224,walls:7,kills:0});
});

test('a real arrow crosses an intact defense and enemy melee damages that wall',async({page})=>{
 await deploy(page);await point(page,117,509);
 await page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);const s=game.scene.getScene('Arena');s.enemies.clear(true,true);s.releases=[];s.stage.phase='rest';s.stage.deadline=999999;s.allies.getChildren().forEach((a:any)=>a.setData('speed',0));s.switchCharacter(1);s.switchCharacter(1);s.player.body.reset(480,352);s.player.body.updateFromGameObject();const e=s.createHostile(240,352,'soldier');e.setData({health:500,maxHealth:500,speed:0,damage:0});s.fireArrow(s.player,{x:-1,y:0},'player','bow');});
 await expect.poll(()=>page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);return game.scene.getScene('Arena').enemies.getChildren()[0].getData('health');})).toBeLessThan(500);
 const hit=await page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);game.scene.pause('Arena');const s=game.scene.getScene('Arena');const wall=s.siegeWalls.find((w:any)=>w.getData('name')==='West north');const enemy=s.enemies.getChildren()[0];enemy.setData('damage',20);enemy.body.reset(304,352);enemy.body.updateFromGameObject();s.updateEnemy(enemy,s.time.now+10000);const brain=s.brains.get(enemy);s.updateEnemy(enemy,brain.strikeAt+1);return wall.getData('health');});expect(hit).toBeLessThan(320);
});

 test('level-one companions guard their deployment radius and return without following the player',async({page})=>{
 await deploy(page);await point(page,117,509);
 const result=await page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);game.scene.pause('Arena');const s=game.scene.getScene('Arena');s.enemies.clear(true,true);const ally=s.allies.getChildren().find((a:any)=>a.getData('companionHero')==='morgan');const home=ally.getData('home');s.player.body.reset(1000,750);s.player.body.updateFromGameObject();s.updateEnemy(ally,s.time.now);const resting=ally.body.velocity.length();const enemy=s.createHostile(home.x+120,home.y,'soldier');const local=s.chooseTarget(ally)===enemy;enemy.body.reset(home.x+400,home.y);enemy.body.updateFromGameObject();const distant=s.chooseTarget(ally,enemy);s.enemies.clear(true,true);ally.body.reset(home.x+160,home.y);ally.body.updateFromGameObject();s.brains.delete(ally);s.updateEnemy(ally,s.time.now);const returning=ally.body.velocity.x<0;s.switchCharacter(1);s.switchCharacter(1);const morgan=s.allies.getChildren().find((a:any)=>a.getData('companionHero')==='morgan');return {resting,local,distant:!!distant,returning,anchor:morgan.getData('home'),home};});
 expect(result.resting).toBe(0);expect(result.local).toBe(true);expect(result.distant).toBe(false);expect(result.returning).toBe(true);expect(result.anchor).toEqual(result.home);
 });
