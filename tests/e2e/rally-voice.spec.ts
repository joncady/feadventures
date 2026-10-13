import { waitForAsyncReady } from './async-readiness';
import {test,expect} from '@playwright/test';
async function fixture(page:any){
 await page.goto('/');await page.waitForFunction(()=>!(document.querySelector('#start') as HTMLButtonElement).disabled);
 await page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);game.scene.start('Arena',{hero:'chrom',companions:['lissa'],tactical:true,missionIndex:1});});
 await waitForAsyncReady(page, async()=>{const entry='/src/main.ts';const{game}=await import(entry);return game.scene.getScene('Arena').allies?.getChildren().some((u:any)=>u.getData('companionHero'));});
 await page.locator('canvas').click({position:{x:10,y:10}});
 await page.keyboard.press('Shift');
 // Finish the unlocked menu selection voice before instrumenting battle-only audio.
 await page.waitForTimeout(1500);
 await page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);const a=game.scene.getScene('Arena');a.deploying=false;game.events.emit('ui-state',{...game.registry.get('interface-state'),playing:true,phase:'battle'});a.enemies.clear(true,true);a.player.setVisible(true);a.player.body.enable=true;const state:any={events:[],plays:[],stops:[]};(window as any).__rally=state;game.events.on('hero-voice',(x:any)=>{state.events.push(x);if(x.event==='rally')state.rallyAt=a.time.now;});game.sound.play=(key:string,options:any)=>{state.plays.push({key,volume:options?.volume});return true;};game.sound.stopByKey=(key:string)=>{state.stops.push(key);return true;};});
}
test('real R path emits once; repeated keys, cooldown, deployment, ended and no-companion paths do not call',async({page})=>{
 await fixture(page);await page.keyboard.press('r');await page.keyboard.press('r');await page.keyboard.press('r');
 const proof=await page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);const a=game.scene.getScene('Arena');game.scene.pause('Arena');const state=(window as any).__rally;const active=a.rallyUntil>a.time.now;const cooldown=a.rallyReadyAt-state.rallyAt;a.rallyReadyAt=0;a.deploying=true;const deploying=a.rallyCompanions();a.deploying=false;a.ended=true;const ended=a.rallyCompanions();a.ended=false;a.allies.clear(true,true);const alone=a.rallyCompanions();return{state,active,cooldown,deploying,ended,alone};});
 expect(proof.state.events).toEqual([{hero:'chrom',event:'rally'}]);expect(proof.state.plays.filter((p:any)=>p.key.startsWith('voice-'))).toHaveLength(1);expect(proof.state.plays.find((p:any)=>p.key.startsWith('voice-')).key).toMatch(/^voice-chrom-rally-/);expect(proof.active).toBe(true);expect(proof.cooldown).toBeCloseTo(20000,6);expect(proof.deploying).toBe(false);expect(proof.ended).toBe(false);expect(proof.alone).toBe(false);
});
test('all17 speakers play own randomized clips; volume, mute, overlap, repeat and missing-cache gates hold',async({page})=>{
 await fixture(page);
 const proof=await page.evaluate(async()=>{
  const entry='/src/main.ts';const{game,audioSettings}=await import(entry);
  const manifestEntry='/src/game/data/rally-voices.ts';const{RALLY_VOICES}=await import(manifestEntry);
  let clock=100000;Object.defineProperty(performance,'now',{value:()=>clock,configurable:true});
  const state=(window as any).__rally;audioSettings.voices=.27;
  const coverage:any[]=[];
  for(const hero of Object.keys(RALLY_VOICES)){
   const keys=[];for(let i=0;i<4;i++){clock+=20000;const before=state.plays.length;game.events.emit('hero-voice',{hero,event:'rally'});keys.push(state.plays[before]?.key);
    for(const event of ['rally','attack','select','damage'])game.events.emit('hero-voice',{hero,event});}
   coverage.push({hero,keys,loaded:RALLY_VOICES[hero].every((clip:any)=>game.cache.audio.exists(clip.key))});
  }
  const before=state.plays.slice();clock+=20000;audioSettings.characterVoices=false;game.events.emit('hero-voice',{hero:'chrom',event:'rally'});
  audioSettings.characterVoices=true;audioSettings.voices=0;game.events.emit('hero-voice',{hero:'chrom',event:'rally'});audioSettings.voices=.27;
  const exists=game.cache.audio.exists.bind(game.cache.audio);game.cache.audio.exists=()=>false;game.events.emit('hero-voice',{hero:'chrom',event:'rally'});game.cache.audio.exists=exists;
  const suppressed=state.plays.length;document.getElementById('music')!.dispatchEvent(new MouseEvent('click',{bubbles:true}));game.events.emit('hero-voice',{hero:'chrom',event:'rally'});
  await new Promise(resolve=>setTimeout(resolve,60));const muted={plays:state.plays.length,mute:game.sound.mute};document.getElementById('music')!.dispatchEvent(new MouseEvent('click',{bubbles:true}));game.events.emit('hero-voice',{hero:'chrom',event:'rally'});
  return{coverage,before,suppressed,muted,after:state.plays,stops:state.stops};
 });
 expect(proof.coverage).toHaveLength(17);for(const c of proof.coverage){expect(c.loaded).toBe(true);expect(c.keys).toHaveLength(4);for(let i=0;i<4;i++){expect(c.keys[i].startsWith('voice-'+c.hero+'-rally-')).toBe(true);if(i)expect(c.keys[i]).not.toBe(c.keys[i-1]);}}
 expect(proof.before).toHaveLength(68);expect(proof.before.every((p:any)=>p.volume===.27)).toBe(true);expect(proof.suppressed).toBe(68);expect(proof.muted).toEqual({plays:68,mute:true});expect(proof.after).toHaveLength(69);expect(proof.stops).toContain('voice-chrom-rally-1-1');
});

test('unavailable rally recordings do not block startup and fall back without borrowing a voice',async({page})=>{
 await page.route('**/assets/audio/chrom-rally-*.wav',route=>route.abort());
 await fixture(page);await page.keyboard.press('r');
 const proof=await page.evaluate(async()=>{const entry='/src/main.ts';const{game}=await import(entry);return{events:(window as any).__rally.events,plays:(window as any).__rally.plays,ready:!(document.getElementById('start') as HTMLButtonElement).disabled};});
 expect(proof.ready).toBe(true);expect(proof.events).toEqual([{hero:'chrom',event:'rally'}]);expect(proof.plays.some((p:any)=>p.key.startsWith('voice-'))).toBe(false);
});
