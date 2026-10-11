import {test,expect} from '@playwright/test';
test('five-column keyboard focus previews sourced portraits and native party health distinguishes fallen units',async({page})=>{
 await page.goto('/');await expect(page.locator('#start')).toBeEnabled();
 await page.keyboard.press('d');await page.keyboard.press('s');
 const focus=await page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);const ui=game.scene.getScene('Interface');return {hero:game.registry.get('character-focus'),name:ui.previewName.text,face:game.textures.get('portrait-robin').get('face').width};});
 expect(focus).toEqual({hero:'robin',name:'Robin (Male)',face:160});
 await page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);game.events.emit('ui-state',{...game.registry.get('interface-state'),playing:true,phase:'battle'});game.events.emit('tactical-map',{missionIndex:2,title:'Health display fixture',objective:'Defend the camp',width:1280,height:896,deploying:false,controlled:'chrom',selected:'chrom',placed:4,total:4,party:[{hero:'chrom',placed:true,health:100,maxHealth:100,level:1,xp:0},{hero:'miriel',placed:true,health:45,maxHealth:100,level:1,xp:0},{hero:'sumia',placed:true,health:15,maxHealth:100,level:1,xp:0},{hero:'virion',placed:true,health:0,maxHealth:100,level:1,xp:0}],allies:[],enemies:[],camera:{x:0,y:0,width:896,height:544},cooldown:{fraction:1,remaining:0,recovering:false},stagePhase:'wave',wave:2,elapsed:90,remaining:0,pending:0});});
 const rows=await page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);const ui=game.scene.getScene('Interface');return {texts:ui.partyRows.map((row:any)=>row.text),fallenAlpha:ui.partyHeads[3].alpha,bars:ui.partyHealth.commandBuffer.length};});
 expect(rows.texts[1]).toContain('45 / 100');expect(rows.texts[3]).toContain('Fallen');expect(rows.fallenAlpha).toBe(.3);expect(rows.bars).toBeGreaterThan(0);
 await page.screenshot({path:'/tmp/party-health-display-fixture.png'});
});
