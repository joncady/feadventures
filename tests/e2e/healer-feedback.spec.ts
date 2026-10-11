import {test,expect,type Page} from '@playwright/test';
async function setup(page:Page,hero='lissa'){
 await page.goto('/?mission=siege');await page.waitForFunction(()=>!(document.querySelector('#start') as HTMLButtonElement).disabled);
 await page.evaluate(async hero=>{const entry='/src/main.ts';const{game}=await import(entry);game.scene.start('Arena',{hero,companions:['chrom'],tactical:true,missionIndex:2});},hero);
 await page.waitForFunction(async()=>{const entry='/src/main.ts';const{game}=await import(entry);return game.scene.getScene('Arena').player?.active;});
 await page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);const a=game.scene.getScene('Arena');a.autoPlaceDeployment();a.launchBattle();a.stage.deadline=Infinity;a.releases=[];a.enemies.clear(true,true);a.updateEnemy=()=>{};game.events.emit('ui-state',{...game.registry.get('interface-state'),playing:true,phase:'battle'});});await page.locator('#game').focus();
}
async function state(page:Page){return page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);const a=game.scene.getScene('Arena'),ui=game.scene.getScene('Interface');return {text:ui.actionFeedback.text,feedbackVisible:ui.actionFeedback.visible,guide:a.aimGuide.commandBuffer.length,patient:a.healingSelection(a.player).patient?.unit.getData('companionHero')??null,weapon:a.profile().weapon,icons:ui.partyWeaponIcons.map((i:any)=>({visible:i.visible,key:i.texture.key})),hp:a.allies.getChildren().find((u:any)=>u.getData('companionHero')==='chrom')?.getData('health'),lastAttack:a.lastAttack,selectionId:ui.state.hero};});}
test('native staff attack distinguishes full health and distance, and highlights exactly the healed ally',async({page})=>{
 await setup(page);await page.keyboard.press('Space');await expect.poll(async()=>(await state(page)).text).toBe('All allies at full HP');
 await page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);const a=game.scene.getScene('Arena'),u=a.allies.getChildren().find((u:any)=>u.getData('companionHero')==='chrom');u.setData('health',30);a.partyStates.get('chrom').health=30;u.body.reset(a.player.x+300,a.player.y);});
 await page.waitForTimeout(550);await page.keyboard.press('Space');await expect.poll(async()=>(await state(page)).text).toBe('Wounded ally out of range');expect((await state(page)).patient).toBe(null);
 await page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);const a=game.scene.getScene('Arena'),u=a.allies.getChildren().find((u:any)=>u.getData('companionHero')==='chrom');u.body.reset(a.player.x+80,a.player.y);});
 await expect.poll(async()=>(await state(page)).patient).toBe('chrom');const before=await state(page);expect(before.guide).toBeGreaterThan(0);expect(before.icons[0]).toMatchObject({visible:true,key:'weapon-staff'});await page.keyboard.press('Space');await expect.poll(async()=>(await state(page)).hp).toBe(45);expect((await state(page)).feedbackVisible).toBe(false);await page.screenshot({path:'/tmp/healer-feedback-after.png'});
});

test('native equipment and hero switching keep party ability icons current; staff still heals its caster',async({page})=>{
 await setup(page,'miriel');await page.keyboard.press('f');await page.keyboard.press('f');await expect.poll(async()=>(await state(page)).weapon).toBe('staff');await expect.poll(async()=>(await state(page)).icons[0].key).toBe('weapon-staff');
 await page.keyboard.down('Shift');await page.keyboard.press('e');await expect.poll(async()=>(await state(page)).weapon).toBe('sword');expect((await state(page)).icons[0].key).toBe('weapon-staff');
 await page.keyboard.press('q');await expect.poll(async()=>(await state(page)).weapon).toBe('staff');
 await page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);const a=game.scene.getScene('Arena');a.health=50;a.partyStates.get('miriel').health=50;});await page.keyboard.press('Shift+Space');
 await expect.poll(()=>page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);return game.scene.getScene('Arena').health;})).toBe(65);
 await page.keyboard.up('Shift');await page.waitForTimeout(450);await page.keyboard.press('f');await expect.poll(async()=>(await state(page)).weapon).toBe('tome');await expect.poll(async()=>(await state(page)).icons[0].key).toBe('weapon-tome');
});

test('Shift chooses self while normal Space heals allies, and full HP self never consumes a cast',async({page})=>{
 await setup(page);
 await page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);const a=game.scene.getScene('Arena'),u=a.allies.getChildren().find((u:any)=>u.getData('companionHero')==='chrom');u.setVelocity(0);u.body.reset(a.player.x+80,a.player.y);u.setData('health',20);a.partyStates.get('chrom').health=20;a.health=50;a.partyStates.get('lissa').health=50;});
 await expect.poll(async()=>(await state(page)).patient).toBe('chrom');
 await page.keyboard.down('Shift');await expect.poll(()=>page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);const a=game.scene.getScene('Arena');return a.healingSelection(a.player).patient?.unit===a.player;})).toBe(true);
 await page.keyboard.press('Space');await expect.poll(()=>page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);return game.scene.getScene('Arena').health;})).toBe(65);expect((await state(page)).hp).toBe(20);
 await page.keyboard.up('Shift');await expect.poll(async()=>(await state(page)).patient).toBe('chrom');
 await page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);game.scene.getScene('Arena').lastAttack=-Infinity;});await page.keyboard.press('Space');await expect.poll(async()=>(await state(page)).hp).toBe(35);
 await page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);const a=game.scene.getScene('Arena');a.health=a.progression.stats.hp;a.partyStates.get('lissa').health=a.health;a.lastAttack=-Infinity;});const before=await page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);return game.scene.getScene('Arena').progression.xp;});
 await page.keyboard.down('Shift');await page.keyboard.press('Space');await expect.poll(async()=>(await state(page)).text).toBe('You are at full HP');expect((await state(page)).lastAttack).toBe(-Infinity);expect((await state(page)).hp).toBe(35);expect(await page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);return game.scene.getScene('Arena').progression.xp;})).toBe(before);await page.keyboard.up('Shift');
});
