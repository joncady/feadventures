import {test,expect} from '@playwright/test';

test('phone viewport fullscreen contains the entire canvas through orientation and browser chrome changes',async({browser})=>{
 const context=await browser.newContext({viewport:{width:844,height:390},isMobile:true,hasTouch:true});
 const page=await context.newPage();await page.goto('/');
 await page.waitForFunction(()=>!(document.querySelector('#start') as HTMLButtonElement).disabled);
 // Exercise the iPhone path where element fullscreen is unavailable.
 await page.evaluate(()=>{const shell=document.querySelector('.game-shell')!;Object.defineProperty(shell,'requestFullscreen',{value:undefined});(document.querySelector('#fullscreen') as HTMLButtonElement).click();});
 await expect(page.locator('body')).toHaveClass(/viewport-fullscreen/);
 for(const viewport of [{width:844,height:390},{width:932,height:430},{width:667,height:375},{width:390,height:844},{width:844,height:340}]){
  await page.setViewportSize(viewport);
  await expect.poll(()=>page.evaluate(()=>{const r=document.querySelector('canvas')!.getBoundingClientRect();const v=visualViewport!;return r.left>=-.5&&r.top>=-.5&&r.right<=v.width+.5&&r.bottom<=v.height+.5&&Math.abs(r.width/r.height-896/544)<.005;})).toBe(true);
 }
  const bounds=(await page.locator('canvas').boundingBox())!;
  // Primary action is at the bottom of the native picker, not a DOM control.
  await page.touchscreen.tap(bounds.x+791*bounds.width/896,bounds.y+458*bounds.height/544);
  await expect.poll(()=>page.evaluate(async()=>{const{game}=await import(String('/src/main.ts'));return game.registry.get('interface-state').selectionMode;})).toBe('companions');
 await page.evaluate(()=>(document.querySelector('#fullscreen') as HTMLButtonElement).click());
 await expect(page.locator('body')).not.toHaveClass(/viewport-fullscreen/);
 await context.close();
});
