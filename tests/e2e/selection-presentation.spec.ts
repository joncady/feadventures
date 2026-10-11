import {test,expect} from '@playwright/test';
test('five-column keyboard focus previews sourced portraits and native party health distinguishes fallen units',async({page})=>{
 await page.goto('/');await expect(page.locator('#start')).toBeEnabled();
 await page.keyboard.press('d');await page.keyboard.press('s');
 const focus=await page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);const ui=game.scene.getScene('Interface');return {hero:game.registry.get('character-focus'),name:ui.previewName.text,face:game.textures.get('portrait-face-robin').get().width};});
 expect(focus).toEqual({hero:'robin',name:'Robin (Male)',face:160});
 await page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);game.events.emit('ui-state',{...game.registry.get('interface-state'),playing:true,phase:'battle'});game.events.emit('tactical-map',{missionIndex:2,title:'Health display fixture',objective:'Defend the camp',width:1280,height:896,deploying:false,controlled:'chrom',selected:'chrom',placed:4,total:4,party:[{hero:'chrom',placed:true,health:100,maxHealth:100,level:1,xp:0},{hero:'miriel',placed:true,health:45,maxHealth:100,level:1,xp:0},{hero:'sumia',placed:true,health:15,maxHealth:100,level:1,xp:0},{hero:'virion',placed:true,health:0,maxHealth:100,level:1,xp:0}],allies:[],enemies:[],camera:{x:0,y:0,width:896,height:544},cooldown:{fraction:1,remaining:0,recovering:false},stagePhase:'wave',wave:2,elapsed:90,remaining:0,pending:0});});
 const rows=await page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);const ui=game.scene.getScene('Interface');return {texts:ui.partyRows.map((row:any)=>row.text),fallenAlpha:ui.partyHeads[3].alpha,bars:ui.partyHealth.commandBuffer.length};});
 expect(rows.texts[1]).toContain('45 / 100');expect(rows.texts[3]).toContain('Fallen');expect(rows.fallenAlpha).toBe(.3);expect(rows.bars).toBeGreaterThan(0);
 await page.screenshot({path:'/tmp/party-health-display-fixture.png'});
});

test('roster keyboard navigation wraps through the current five-column grid',async({page})=>{
 await page.goto('/');await expect(page.locator('#start')).toBeEnabled();
 const focused=()=>page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);return game.registry.get('character-focus');});
 await expect.poll(focused).toBe('chrom');
 await page.keyboard.press('w',{delay:100});expect(await focused()).toBe('ricken');
 await page.keyboard.press('s');expect(await focused()).toBe('chrom');
 await page.keyboard.press('d');await page.keyboard.press('d');await page.keyboard.press('w');expect(await focused()).toBe('sully');
 await page.keyboard.press('s');expect(await focused()).toBe('frederick');
 const portraits=await page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);const config='/src/game/data/config.ts';const{HEROES}=await import(config);return HEROES.map((hero:string)=>{const t=game.textures.get(`portrait-face-${hero}`);return [hero,t.get().width,t.get().height];});});
 expect(portraits).toHaveLength(17);for(const [,w,h] of portraits){expect(w).toBe(160);expect(h).toBe(160);}
 await page.screenshot({path:'/tmp/portrait-centered-selection.png'});
});

test('Chrom and Lucina use centered face anchors in cards and focused previews',async({page})=>{
 await page.goto('/');await expect(page.locator('#start')).toBeEnabled();
 await expect.poll(()=>page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);return game.registry.get('character-focus');})).toBe('chrom');
 await page.screenshot({path:'/tmp/chrom-centered-1.0.2.png'});
 await page.keyboard.press('d',{delay:100});await page.keyboard.press('Enter',{delay:100});await page.screenshot({path:'/tmp/lucina-centered-1.0.2.png'});
 const framing=await page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);const ui=game.scene.getScene('Interface');return {focused:game.registry.get('character-focus'),selected:game.registry.get('interface-state').hero,previewKey:ui.previewPortrait.texture.key,width:ui.previewPortrait.displayWidth,height:ui.previewPortrait.displayHeight};});
 expect(framing).toEqual({focused:'lucina',selected:'lucina',previewKey:'portrait-lucina',width:174,height:174});
});
