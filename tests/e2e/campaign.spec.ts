import {test,expect} from '@playwright/test';
test('four-mission campaign carries party progress and equipment through shop and victory',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.stack??e.message));await page.goto('/');await page.waitForFunction(()=>!(document.querySelector('#start') as HTMLButtonElement).disabled);await page.locator('#start').press('Enter');
 await expect.poll(()=>page.evaluate(async()=>{const entry='/src/main.ts';const {game}=await import(entry);return game.scene.isActive('Campaign');})).toBe(true);
 for(let mission=0;mission<4;mission++){
  for(let line=0;line<3;line++)await page.keyboard.press('Enter');
  await page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);game.events.emit('campaign-continue');});
  await expect.poll(()=>page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);return game.scene.getScene('Arena').missionIndex;})).toBe(mission);
  const battle=await page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);const a=game.scene.getScene('Arena');a.confirmDeployment();const launched=a.launchBattle();a.partyStates.get(a.hero).progress.xp=42;a.missionGold=30;a.finishTactical(true);return {launched,camp:!!a.camp};});expect(battle.launched).toBe(true);expect(battle.camp).toBe(mission===1||mission===2);
  await expect.poll(()=>page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);return game.scene.isActive('Campaign');})).toBe(true);
  const state=await page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);const c=game.scene.getScene('Campaign');return c.dataState;});expect(state.members[0].progress.xp).toBe(42);expect(state.gold).toBe(120+(mission+1)*130);expect(state.missionIndex).toBe(mission+1);
 }
 const done=await page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);return game.scene.getScene('Campaign').dataState.complete;});expect(done).toBe(true);expect(errors).toEqual([]);
});
test('traveling party cannot shove the controlled hero while attacking and wave progression does not require archer cleanup',async({page})=>{
 await page.goto('/');await page.waitForFunction(()=>!(document.querySelector('#start') as HTMLButtonElement).disabled);
 await page.locator('#party-mode').press('Enter');for(const hero of ['Virion','Sumia','Lissa'])await page.getByRole('button',{name:hero,exact:true}).press('Enter');await page.locator('#start').press('Enter');
 await page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);game.events.emit('campaign-continue');});
 await page.waitForFunction(async()=>{const entry='/src/main.ts';const{game}=await import(entry);return game.scene.getScene('Arena').deploying;});
 for(let i=0;i<4;i++)await page.keyboard.press('Space',{delay:70});await page.keyboard.press('r',{delay:70});
 const initial=await page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);const a=game.scene.getScene('Arena');return {x:a.player.x,y:a.player.y};});
 await page.keyboard.down('d');for(let i=0;i<4;i++){await page.keyboard.press('Space',{delay:80});await page.waitForTimeout(400);}await page.keyboard.up('d');
 const moved=await page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);const a=game.scene.getScene('Arena');return {x:a.player.x,y:a.player.y};});expect(moved.x).toBeGreaterThan(initial.x+70);expect(Math.abs(moved.y-initial.y)).toBeLessThan(5);
 const stage=await page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);const a=game.scene.getScene('Arena');game.scene.pause('Arena');a.stage.phase='wave';a.stage.wave=1;a.stage.waveStarted=0;a.releases=[];a.player.body.reset(447,a.map.objective.y);a.player.body.updateFromGameObject();a.createHostile(1100,448,'archer');a.updateStage(a.stage.settings.waveMinimum);return {phase:a.stage.phase,hostiles:a.enemies.countActive(),xp:a.partyStates.get('chrom').progress.xp};});expect(stage.phase).toBe('rest');expect(stage.hostiles).toBeGreaterThan(0);
});
test('an objective victory reached inside Arena update shuts down cleanly before publishing the old camera',async({page})=>{
 const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));await page.goto('/');await page.waitForFunction(()=>!(document.querySelector('#start') as HTMLButtonElement).disabled);await page.locator('#start').press('Enter');
 await page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);game.events.emit('campaign-continue');});await page.waitForFunction(async()=>{const entry='/src/main.ts';const{game}=await import(entry);return game.scene.getScene('Arena').deploying;});
 const victory=await page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);const a=game.scene.getScene('Arena');a.confirmDeployment();a.launchBattle();game.scene.pause('Arena');a.stage.phase='complete';a.player.body.reset(1184,a.map.objective.y);a.player.body.updateFromGameObject();a.update(a.time.now,0);return {ended:a.ended,next:game.scene.getScene('Campaign').dataState.missionIndex};});expect(victory).toEqual({ended:true,next:1});expect(errors).toEqual([]);
});
test('campaign defeat restores pre-mission HP equipment XP and exact treasury without duplicating pickups',async({page})=>{
 await page.goto('/');await page.waitForFunction(()=>!(document.querySelector('#start') as HTMLButtonElement).disabled);await page.locator('#start').press('Enter');
 await page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);game.events.emit('campaign-shop-upgrade',{hero:'chrom',slot:0});game.events.emit('campaign-continue');});
 await page.waitForFunction(async()=>{const entry='/src/main.ts';const{game}=await import(entry);return game.scene.getScene('Arena').deploying;});
 await page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);const a=game.scene.getScene('Arena');a.confirmDeployment();a.launchBattle();a.partyStates.get('chrom').progress.xp=99;a.missionGold=777;a.health=0;a.partyStates.get('chrom').health=0;a.finishTactical(false,'Party defeated.');});
 await page.locator('#restart').press('Enter');
 const restored=await page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);const a=game.scene.getScene('Arena'),s=a.partyStates.get('chrom');return {health:s.health,xp:s.progress.xp,forge:s.loadout.items[0].forge,gold:a.treasuryGold,earned:a.missionGold};});expect(restored).toEqual({health:100,xp:0,forge:1,gold:20,earned:0});
});
test('staff support ignores hostile retaliation and party companions share controlled hit grace',async({page})=>{
 await page.goto('/');await page.waitForFunction(()=>!(document.querySelector('#start') as HTMLButtonElement).disabled);await page.locator('#party-mode').press('Enter');await page.getByRole('button',{name:'Lissa',exact:true}).press('Enter');await page.locator('#start').press('Enter');
 await page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);game.events.emit('campaign-continue');});await page.waitForFunction(async()=>{const entry='/src/main.ts';const{game}=await import(entry);return game.scene.getScene('Arena').deploying;});
 const support=await page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);const a=game.scene.getScene('Arena');a.confirmDeployment();a.launchBattle();game.scene.pause('Arena');const healer=a.allies.getChildren().find((u:any)=>u.getData('companionHero')==='lissa');const foe=a.createHostile(healer.x+120,healer.y,'archer');healer.setData('retaliation',{unit:foe,until:a.time.now+6000});a.updateEnemy(healer,a.time.now);const target=a.chooseTarget(healer,foe);const before=healer.getData('health');a.damageEnemy(healer,20,'bow','enemy',undefined,foe);const once=healer.getData('health');a.damageEnemy(healer,20,'bow','enemy',undefined,foe);return {target:!!target,retaliation:!!healer.getData('retaliation'),before,once,twice:healer.getData('health')};});expect(support.target).toBe(false);expect(support.once).toBeLessThan(support.before);expect(support.twice).toBe(support.once);
});

test('posted archers can shoot outside their movement AOE without chasing beyond it',async({page})=>{
 await page.goto('/?mission=siege');await page.waitForFunction(()=>!(document.querySelector('#start') as HTMLButtonElement).disabled);await page.locator('#party-mode').press('Enter');await page.getByRole('button',{name:'Virion',exact:true}).press('Enter');await page.locator('#start').press('Enter');
 const reach=await page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);const a=game.scene.getScene('Arena');a.confirmDeployment();a.launchBattle();game.scene.pause('Arena');a.enemies.clear(true,true);const archer=a.allies.getChildren().find((u:any)=>u.getData('companionHero')==='virion');const home=archer.getData('home');const target=a.createHostile(home.x+300,home.y,'archer');archer.body.reset(home.x,home.y);archer.body.updateFromGameObject();const selected=a.chooseTarget(archer);target.body.reset(home.x+470,home.y);target.body.updateFromGameObject();const outside=a.chooseTarget(archer);return {selected:selected===target,outside:!!outside,homeDistance:Math.hypot(archer.x-home.x,archer.y-home.y)};});expect(reach.selected).toBe(true);expect(reach.outside).toBe(false);expect(reach.homeDistance).toBe(0);
});
