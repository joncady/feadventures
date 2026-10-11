import {test,expect,type Page} from '@playwright/test';

async function battle(page:Page,hero='lissa'){
 await page.goto('/?mission=siege');await page.waitForFunction(()=>!(document.querySelector('#start') as HTMLButtonElement).disabled);
 await page.evaluate(async hero=>{const entry='/src/main.ts';const{game}=await import(entry);game.scene.start('Arena',{hero,companions:['chrom','sumia'],tactical:true});},hero);
 await page.waitForFunction(async()=>{const entry='/src/main.ts';const{game}=await import(entry);return game.scene.getScene('Arena').player?.active;});
 await page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);const s=game.scene.getScene('Arena');for(const [i,hero] of s.party.entries()){s.selectedDeployment=hero;if(!s.placeDeployment({x:480+i*128,y:352}))throw Error('Fixture deployment failed');}if(!s.launchBattle())throw Error('Fixture launch failed');game.scene.pause('Arena');});
}

test('Heal restores injured allies, awards healer XP, rejects cooldown bypass and idle casts',async({page})=>{
 await battle(page);
 const result=await page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);const s=game.scene.getScene('Arena');const ally=s.allies.getChildren().find((a:any)=>a.getData('companionHero')==='chrom');ally.setData('health',30);s.partyStates.get('chrom').health=30;const healed=s.castHeal(s.player),health=ally.getData('health'),xp=s.progression.xp,again=s.castHeal(s.player);s.lastAttack=-Infinity;for(const a of s.allies.getChildren())a.setData('health',a.getData('maxHealth'));const before=s.lastAttack,idle=s.castHeal(s.player);return {healed,health,xp,again,idle,uncommitted:s.lastAttack===before};});
 expect(result).toEqual({healed:true,health:45,xp:17,again:false,idle:false,uncommitted:true});
});

test('Sage Miriel can select staff and heal automatically when left guarding',async({page})=>{
 await battle(page,'miriel');
 const result=await page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);const s=game.scene.getScene('Arena');game.scene.resume('Arena');s.switchWeapon();s.switchWeapon();game.scene.pause('Arena');const type=s.profile().weapon;const ally=s.allies.getChildren().find((a:any)=>a.getData('companionHero')==='chrom');ally.setData('health',40);s.partyStates.get('chrom').health=40;s.switchCharacter(1);const miriel=s.allies.getChildren().find((a:any)=>a.getData('companionHero')==='miriel');s.updateEnemy(miriel,s.time.now);return {type,health:s.health,mirielXP:s.partyStates.get('miriel').progress.xp,staff:miriel.getData('weapon')};});
 expect(result).toEqual({type:'staff',health:55,mirielXP:17,staff:'staff'});
});

test('Pegasus companion physically flies across an intact barricade while ground ally is stopped',async({page})=>{
 await battle(page);
 await page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);const s=game.scene.getScene('Arena');s.updateEnemy=()=>{};const fly=s.allies.getChildren().find((a:any)=>a.getData('companionHero')==='sumia');const ground=s.allies.getChildren().find((a:any)=>a.getData('companionHero')==='chrom');fly.body.reset(480,320);ground.body.reset(500,320);fly.setVelocity(0,-100);ground.setVelocity(0,-100);game.scene.resume('Arena');});
 await expect.poll(()=>page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);return game.scene.getScene('Arena').allies.getChildren().find((a:any)=>a.getData('companionHero')==='sumia').y;})).toBeLessThan(200);
 const groundY=await page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);return game.scene.getScene('Arena').allies.getChildren().find((a:any)=>a.getData('companionHero')==='chrom').y;});expect(groundY).toBeGreaterThan(220);
});

test('hostile arrow attribution retaliates within the guard post and never pulls it beyond its AOE',async({page})=>{
 await battle(page);
 const result=await page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);const s=game.scene.getScene('Arena');const ally=s.allies.getChildren().find((a:any)=>a.getData('companionHero')==='chrom');const home=ally.getData('home');const shooter=s.createHostile(home.x+370,home.y,'archer');s.damageEnemy(ally,20,'bow','enemy',undefined,shooter);const outside=s.chooseTarget(ally);shooter.body.reset(home.x+180,home.y);shooter.body.updateFromGameObject();s.partyStates.get('chrom').lastDamage=-Infinity;s.fireArrow(shooter,{x:-1,y:0},'enemy','bow');const arrow=s.arrows.getChildren()[0];const center=s.bodyCenter(ally);arrow.body.reset(center.x,center.y);s.projectileHit(arrow,ally);const after=s.chooseTarget(ally);const attributed=ally.getData('retaliation')?.unit===shooter;return {outside:!!outside,retaliates:after===shooter,attributed,health:ally.getData('health')};});
 expect(result.outside).toBe(false);expect(result.retaliates).toBe(true);expect(result.attributed).toBe(true);expect(result.health).toBeLessThan(100);
});
