import {test,expect} from '@playwright/test';
test('native remapping rejects conflicts, persists, and controls real combat without firing during capture',async({page})=>{
 await page.goto('/?battle=legacy');await page.getByRole('button',{name:'Begin battle',exact:true}).press('Enter');await page.locator('#game').focus();
 await page.evaluate(async()=>{const entry='/src/main.ts';const {game}=await import(entry);const arena=game.scene.getScene('Arena') as any;arena.enemies.clear(true,true);arena.allies.clear(true,true);arena.tactical=true;(window as any).__actions={attack:0,weapon:0,rally:0};for(const [method,key] of [['attack','attack'],['switchWeapon','weapon'],['rallyCompanions','rally']]){const old=arena[method].bind(arena);arena[method]=(...args:any[])=>{(window as any).__actions[key]++;return old(...args);};}const ui=game.scene.getScene('Interface') as any;ui.openControls();ui.captureControl('attack');});
 await page.keyboard.press('r');expect(await page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);return(game.scene.getScene('Interface') as any).controlMessage.text;})).toContain('already assigned');
 await page.keyboard.press('z');
 await page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);(game.scene.getScene('Interface') as any).captureControl('weapon');});await page.keyboard.press('x');
 await page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);(game.scene.getScene('Interface') as any).captureControl('rally');});await page.keyboard.press('v');
 expect(await page.evaluate(()=>(window as any).__actions)).toEqual({attack:0,weapon:0,rally:0});
 await page.keyboard.press('Escape');await page.keyboard.down('z');await expect.poll(()=>page.evaluate(()=>(window as any).__actions.attack)).toBe(1);await page.keyboard.up('z');await page.keyboard.press('x');await expect.poll(()=>page.evaluate(()=>(window as any).__actions.weapon)).toBe(1);await page.keyboard.down('v');await expect.poll(()=>page.evaluate(()=>(window as any).__actions.rally)).toBe(1);await page.keyboard.up('v');
 const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('feadventures.controls.v1')!));expect(stored.bindings).toMatchObject({attack:'KeyZ',weapon:'KeyX',rally:'KeyV'});
 await page.reload();await page.waitForFunction(()=>!(document.querySelector('#start') as HTMLButtonElement).disabled);expect(await page.evaluate(async()=>{const entry='/src/game/input/control-preferences.ts';const{keyFor}=await import(entry);return keyFor('attack');})).toBe('KeyZ');
});

test('dialogue input respects the shared controls capture guard',async({page})=>{
 await page.goto('/');await page.waitForFunction(()=>!(document.querySelector('#start') as HTMLButtonElement).disabled);
 await page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);game.events.emit('ui-action','start');});
 await expect.poll(()=>page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);return game.scene.isActive('Campaign');})).toBe(true);
 await page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);game.registry.set('controls-open',true);});
 await page.keyboard.press('Enter');await page.keyboard.press('Space');
 expect(await page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);const scene=game.scene.getScene('Campaign') as any;return{phase:scene.phase,line:scene.line};})).toEqual({phase:'dialogue',line:0});
 await page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);game.registry.set('controls-open',false);});await page.keyboard.press('Enter');
 await expect.poll(()=>page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);return(game.scene.getScene('Campaign') as any).line;})).toBe(1);
});
