import {test,expect} from '@playwright/test';
test('reload resumes prep checkpoint and developer jumps preserve it',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');await page.waitForFunction(()=>!(document.querySelector('#start') as HTMLButtonElement).disabled);await page.locator('#start').press('Enter');
 await page.evaluate(async()=>{const entry='/src/main.ts';const {game}=await import(entry);game.events.emit('campaign-shop-upgrade',{hero:'chrom',slot:0});});
 const saved=await page.evaluate(()=>localStorage.getItem('feadventures.campaign.v1'));expect(saved).toBeTruthy();
 await page.reload();await page.waitForFunction(()=>!(document.querySelector('#start') as HTMLButtonElement).disabled);
 const resumePoint=await page.evaluate(async()=>{const entry='/src/main.ts';const {game}=await import(entry);const bounds=game.scene.getScene('Interface').resumeLabel.getBounds(),canvas=game.canvas.getBoundingClientRect();return {x:canvas.left+bounds.centerX*canvas.width/game.scale.width,y:canvas.top+bounds.centerY*canvas.height/game.scale.height};});await page.mouse.click(resumePoint.x,resumePoint.y);
 await expect.poll(()=>page.evaluate(async()=>{const entry='/src/main.ts';const {game}=await import(entry);return game.scene.isActive('Campaign');})).toBe(true);
 const resumed=await page.evaluate(async()=>{const entry='/src/main.ts';const {game}=await import(entry);return game.scene.getScene('Campaign').dataState;});expect(resumed.gold).toBe(20);expect(resumed.members[0].loadout.items[0].forge).toBe(1);
 await page.keyboard.press('F9');await expect.poll(()=>page.evaluate(async()=>{const entry='/src/main.ts';const {game}=await import(entry);return game.scene.isActive('Dev');})).toBe(true);
 await page.keyboard.press('Digit4');await expect.poll(()=>page.evaluate(async()=>{const entry='/src/main.ts';const {game}=await import(entry);return game.scene.getScene('Campaign').dataState.missionIndex;})).toBe(3);
 expect(await page.evaluate(()=>localStorage.getItem('feadventures.campaign.v1'))).toBe(saved);
 await page.keyboard.press('F9');await page.keyboard.press('Escape');await expect.poll(()=>page.evaluate(async()=>{const entry='/src/main.ts';const {game}=await import(entry);return game.scene.isActive('Dev');})).toBe(false);await page.keyboard.press('F9');await page.screenshot({path:'/tmp/campaign-dev-menu.png'});await page.keyboard.press('Escape');expect(errors).toEqual([]);
});

test('developer overlay pauses live battle and preserves a preexisting pause',async({page})=>{
 await page.goto('/?mission=siege');await page.waitForFunction(()=>!(document.querySelector('#start') as HTMLButtonElement).disabled);await page.locator('#start').press('Enter');
 await page.evaluate(async()=>{const entry='/src/main.ts';const {game}=await import(entry);const a=game.scene.getScene('Arena');a.confirmDeployment();game.events.emit('ui-launch');});
 await page.keyboard.press('F9');const before=await page.evaluate(async()=>{const entry='/src/main.ts';const {game}=await import(entry);return {clock:game.scene.getScene('Arena').battleClock,paused:game.scene.isPaused('Arena')};});expect(before.paused).toBe(true);await page.waitForTimeout(300);expect(await page.evaluate(async()=>{const entry='/src/main.ts';const {game}=await import(entry);return game.scene.getScene('Arena').battleClock;})).toBe(before.clock);
 await page.keyboard.press('Escape');expect(await page.evaluate(async()=>{const entry='/src/main.ts';const {game}=await import(entry);return game.scene.isActive('Arena');})).toBe(true);
 await page.keyboard.press('p');await page.keyboard.press('F9');await page.keyboard.press('Escape');expect(await page.evaluate(async()=>{const entry='/src/main.ts';const {game}=await import(entry);return game.scene.isPaused('Arena');})).toBe(true);
});

test('disabled browser storage does not prevent a fresh campaign',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw new DOMException('Storage blocked','SecurityError');}});});await page.goto('/');await page.waitForFunction(()=>!(document.querySelector('#start') as HTMLButtonElement).disabled);await page.locator('#start').press('Enter');await expect.poll(()=>page.evaluate(async()=>{const entry='/src/main.ts';const {game}=await import(entry);return game.scene.isActive('Campaign');})).toBe(true);expect(errors).toEqual([]);
});
