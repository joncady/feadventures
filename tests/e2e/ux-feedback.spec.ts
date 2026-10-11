import {test,expect} from '@playwright/test';
test('cursor sound, native rejection and repeated-input throttling',async({page})=>{
 await page.goto('/?mission=siege');await page.waitForFunction(()=>!(document.querySelector('#start') as HTMLButtonElement).disabled);
 const result=await page.evaluate(async()=>{
  const entry='/src/main.ts';const {game}=await import(entry);const seen:any[]=[];const effects:any[]=[];
  game.events.on('ux-feedback-visible',(e:any)=>seen.push(e));game.events.on('effect',(key:string)=>effects.push(key));
  game.events.emit('ux-feedback',{kind:'reject',message:'Choose an empty courtyard cell.'});
  game.events.emit('ux-feedback',{kind:'reject',message:'Should be throttled'});
  game.events.emit('ux-feedback',{kind:'cursor'});
  const ui=game.scene.getScene('Interface');return {seen,effects,text:ui.actionFeedback.text,visible:ui.actionFeedback.visible};
 });
 expect(result.seen).toHaveLength(2);expect(result.text).toBe('Choose an empty courtyard cell.');expect(result.visible).toBe(true);expect(result.effects).toContain('ui-cursor');expect(result.effects).toContain('ui-reject');
 await expect.poll(()=>page.evaluate(async()=>{const entry='/src/main.ts';const {game}=await import(entry);return game.scene.getScene('Interface').actionFeedback.visible;})).toBe(false);
});
