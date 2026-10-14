import {test,expect} from '@playwright/test';
async function start(page:any){await page.goto('/?battle=legacy');await page.getByRole('button',{name:'Begin battle'}).press('Enter');await expect.poll(()=>page.evaluate(async()=>{const entry=document.querySelector<HTMLScriptElement>('script[type="module"][src*="/src/main.ts"]')!.src;const {game}=await import(entry);return game.scene.isActive('Arena');})).toBe(true);}
test('actual area and piercing hits preserve launch weapon, factions and one critical cue',async({page})=>{
 await start(page);
 const result=await page.evaluate(async()=>{
 const entry=document.querySelector<HTMLScriptElement>('script[type="module"][src*="/src/main.ts"]')!.src;const {game}=await import(entry);const scene=game.scene.getScene('Arena');const equipmentPath='/src/game/data/equipment.ts',attackPath='/src/game/systems/weapon-attack.ts';const equipment=await import(equipmentPath);const attacks=await import(attackPath);
 scene.scene.pause();scene.time.removeAllEvents();scene.enemies.clear(true,true);scene.allies.clear(true,true);scene.arrows.clear(true,true);scene.player.body.reset(180,230);scene.player.setVisible(true);
 const targets=[260,280,295,400].map(x=>{const u=scene.enemies.create(x,230,'soldier');u.setSize(28,28).setOffset(11,15);u.setData({faction:'enemy',health:500,maxHealth:500,weapon:'sword',defense:0,resistance:0,damage:0,speed:0});return u;});
 const friendly=scene.allies.create(270,230,'soldier');friendly.setData({faction:'ally',health:100,maxHealth:100,weapon:'sword'});
 const p=scene.partyStates.get(scene.hero).progress;p.stats.skill+=50;const launch=attacks.createWeaponAttack(scene.hero,p,equipment.WEAPONS.elfire,()=>0);let voices=0;game.events.on('hero-critical',()=>voices++);
 scene.fireArrow(scene.player,{x:1,y:0},'player','tome',launch);const arrow=scene.arrows.getChildren()[0];arrow.body.reset(260,230);scene.partyStates.get(scene.hero).loadout.items=[{weaponId:'iron-sword',uses:null}];scene.partyStates.get(scene.hero).loadout.equippedSlot=0;scene.projectileHit(arrow,targets[0]);
 const area=targets.map(u=>u.getData('health'));const allyHealth=friendly.getData('health');
 const line=attacks.createWeaponAttack(scene.hero,p,equipment.WEAPONS.thoron,()=>0);scene.fireArrow(scene.player,{x:1,y:0},'player','tome',line);const bolt=scene.arrows.getChildren()[0];bolt.body.reset(260,230);scene.projectileHit(bolt,targets[0]);scene.projectileHit(bolt,targets[0]);bolt.body.reset(280,230);scene.projectileHit(bolt,targets[1]);
 return {area,allyHealth,voices,lineHealth:targets.slice(0,2).map(u=>u.getData('health')),lineAlive:bolt.active};
 });
 expect(result.area).toEqual([410,410,410,500]);expect(result.allyHealth).toBe(100);expect(result.voices).toBe(2);expect(result.lineHealth).toEqual([278,278]);expect(result.lineAlive).toBe(true);
});
test('Fortify restores living nearby allies together and never overheals or revives',async({page})=>{
 await start(page);
 const result=await page.evaluate(async()=>{const entry=document.querySelector<HTMLScriptElement>('script[type="module"][src*="/src/main.ts"]')!.src;const {game}=await import(entry);const s=game.scene.getScene('Arena');s.scene.pause();s.time.removeAllEvents();s.enemies.clear(true,true);s.allies.clear(true,true);s.hero='lissa';s.partyStates.set('lissa',{progress:s.progression,health:100,lastAttack:-Infinity,lastDamage:-Infinity,loadout:{items:[{weaponId:'fortify',uses:null}],equippedSlot:0}});s.player.body.reset(200,230);s.health=100;s.lastAttack=-Infinity;
 const allies=[{x:220,hp:30},{x:240,hp:95},{x:250,hp:0},{x:700,hp:20}].map(v=>{const u=s.allies.create(v.x,230,'soldier');u.setData({faction:'ally',health:v.hp,maxHealth:100,weapon:'sword'});return u;});const cast=s.castHeal(s.player);return {cast,health:allies.map(u=>u.getData('health'))};});
 expect(result.cast).toBe(true);expect(result.health).toEqual([47,100,0,20]);
});
test('Brave melee makes two real strikes while sharing one critical voice event',async({page})=>{
 await start(page);
 const result=await page.evaluate(async()=>{const entry=document.querySelector<HTMLScriptElement>('script[type="module"][src*="/src/main.ts"]')!.src;const {game}=await import(entry);const s=game.scene.getScene('Arena');s.scene.pause();s.time.removeAllEvents();s.enemies.clear(true,true);s.allies.clear(true,true);s.arrows.clear(true,true);s.player.body.reset(180,230);s.facing={x:1,y:0};s.partyStates.get(s.hero).loadout={items:[{weaponId:'brave-sword',uses:null}],equippedSlot:0};s.progression.stats.skill+=50;
 const target=s.enemies.create(230,230,'soldier');target.setSize(28,28).setOffset(11,15);target.setData({faction:'enemy',health:500,maxHealth:500,weapon:'sword',defense:0,resistance:0,speed:0});let cues=0;game.events.on('hero-critical',()=>cues++);const oldRandom=Math.random;Math.random=()=>0;try{s.attack();}finally{Math.random=oldRandom;}const first=target.getData('health');s.time.preUpdate(0,0);s.time.update(s.time.now+150,150);return {first,second:target.getData('health'),cues};});
 expect(result.first).toBe(413);expect(result.second).toBe(326);expect(result.cues).toBe(1);
});
test('critical audio dispatch uses a sourced clip with pacing and mute; an empty attack stays silent',async({page})=>{
 await start(page);
 const result=await page.evaluate(async()=>{const entry=document.querySelector<HTMLScriptElement>('script[type="module"][src*="/src/main.ts"]')!.src;const main=await import(entry),{game}=main;const s=game.scene.getScene('Arena');s.scene.pause();s.time.removeAllEvents();s.enemies.clear(true,true);s.allies.clear(true,true);s.player.body.reset(180,230);s.facing={x:1,y:0};main.audioSettings.characterVoices=true;main.audioSettings.voices=1;
 const played:string[]=[];const oldPlay=game.sound.play;game.sound.play=(key:string)=>{played.push(key);return false;};let events=0;game.events.on('hero-critical',()=>events++);
 try {game.events.emit('hero-critical',{hero:s.hero,position:{x:180,y:230},controlled:true});game.events.emit('hero-critical',{hero:s.hero,position:{x:180,y:230},controlled:true});s.attack();main.audioSettings.voices=0;game.events.emit('hero-critical',{hero:s.hero,position:{x:180,y:230},controlled:true});}finally{game.sound.play=oldPlay;}
 return {events,clips:played.filter(key=>key.endsWith('-critical')),loaded:game.cache.audio.exists(`voice-${s.hero}-critical`)};});
 expect(result.loaded).toBe(true);expect(result.events).toBe(3);expect(result.clips).toEqual(['voice-chrom-critical']);
});
test('Brave Bow follows its launch hero through Q/E and cancels its second shot if that hero falls',async({page})=>{
 await start(page);
 const result=await page.evaluate(async()=>{
 const entry=document.querySelector<HTMLScriptElement>('script[type="module"][src*="/src/main.ts"]')!.src;const {game}=await import(entry),s=game.scene.getScene('Arena');const equipmentPath='/src/game/data/equipment.ts',attackPath='/src/game/systems/weapon-attack.ts';const {initialLoadout,WEAPONS}=await import(equipmentPath),{createWeaponAttack}=await import(attackPath);
 s.scene.pause();s.time.removeAllEvents();s.enemies.clear(true,true);s.allies.clear(true,true);s.arrows.clear(true,true);s.party=['virion','chrom'];s.companions=['chrom'];s.partyStates.set('virion',{health:100,progress:structuredClone(s.progression),lastAttack:-Infinity,lastDamage:-Infinity,loadout:{items:[{weaponId:'brave-bow',uses:null}],equippedSlot:0}});s.partyStates.set('chrom',{health:100,progress:structuredClone(s.progression),lastAttack:-Infinity,lastDamage:-Infinity,loadout:initialLoadout('chrom')});s.hero='virion';s.progression=s.partyStates.get('virion').progress;s.player.setTexture('virion');s.player.body.reset(200,230);s.spawnAllies();const chrom=s.allies.getChildren().find((u:any)=>u.getData('companionHero')==='chrom');chrom.body.reset(600,230);s.tactical=true;s.deploying=false;
 const launch=createWeaponAttack('virion',s.progression,WEAPONS['brave-bow'],()=>.9);s.fireArrow(s.player,{x:1,y:0},'player','bow',launch);const first=s.arrows.getChildren()[0];const switched=s.switchCharacter(1);s.time.preUpdate(0,0);s.time.update(s.time.now+190,190);
 const arrows=s.arrows.getChildren().map((a:any)=>({origin:a.getData('origin').x,source:a.getData('source')?.texture.key,hero:a.getData('attackingHero'),weapon:a.getData('weaponId'),power:a.getData('damage'),faction:a.getData('faction')}));const firstSource=first.getData('source')?.texture.key;
 s.arrows.clear(true,true);s.time.removeAllEvents();const virion=s.allies.getChildren().find((u:any)=>u.getData('companionHero')==='virion');s.fireArrow(virion,{x:1,y:0},'ally','bow',createWeaponAttack('virion',s.partyStates.get('virion').progress,WEAPONS['brave-bow'],()=>.9));s.partyStates.get('virion').health=0;virion.destroy();s.time.preUpdate(0,0);s.time.update(s.time.now+190,190);return {switched,arrows,firstSource,fallenShots:s.arrows.countActive()};
 });
 expect(result.switched).toBe(true);expect(result.firstSource).toBe('virion');expect(result.arrows).toHaveLength(2);expect(result.arrows.every((a:any)=>a.origin<220&&a.source==='virion'&&a.hero==='virion'&&a.weapon==='brave-bow'&&a.power===29)).toBe(true);expect(result.arrows.map((a:any)=>a.faction)).toEqual(['player','ally']);expect(result.fallenShots).toBe(1);
});
