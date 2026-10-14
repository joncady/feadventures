import {test} from 'node:test';
import assert from 'node:assert/strict';
import {canEquip,WEAPONS,initialLoadout,migrateLegacyRestrictedLoadout,shopWeaponIds} from '../src/game/data/equipment';
import {criticalChance,CriticalAttack} from '../src/game/systems/critical';
import {newProgress} from '../src/game/systems/progression';
import {weaponCapabilities,attackSnapshot,targetsInImpact} from '../src/game/systems/weapon-capabilities';
test('personal and dark weapons enforce actual access, without barring normal tomes',()=>{
 assert.equal(canEquip('chrom',{weaponId:'falchion',uses:null}),true);
 assert.equal(canEquip('frederick',{weaponId:'falchion',uses:null}),false);
 assert.equal(canEquip('lucina',{weaponId:'parallel-falchion',uses:null}),true);
 assert.equal(canEquip('chrom',{weaponId:'parallel-falchion',uses:null}),false);
 assert.equal(canEquip('tharja',{weaponId:'nosferatu',uses:null}),true);
 for(const hero of ['robin','morgan','miriel','ricken'] as const){assert.equal(canEquip(hero,{weaponId:'nosferatu',uses:null}),false);assert.equal(canEquip(hero,{weaponId:'bolganone',uses:null}),true);}
 assert.equal(canEquip('ricken',{weaponId:'physic',uses:null}),false);
 assert.equal(canEquip('miriel',{weaponId:'physic',uses:null}),true);
});
test('shop tiers unlock specialists, veterans and finale choices deliberately',()=>{
 assert.ok(!shopWeaponIds(2).includes('elfire'));assert.ok(shopWeaponIds(3).includes('elfire'));
 assert.ok(!shopWeaponIds(5).includes('arcfire'));assert.ok(shopWeaponIds(6).includes('arcfire'));
 assert.ok(!shopWeaponIds(8).includes('thoron'));assert.ok(shopWeaponIds(9).includes('thoron'));
 assert.ok(!shopWeaponIds(10).includes('falchion'));
});
test('legacy repair preserves forge/equipment and leaves unrelated invalid gear detectable',()=>{
 const sword={weaponId:'iron-sword',uses:null,forge:2};
 const bag={items:[{weaponId:'nosferatu',uses:null},sword],equippedSlot:1};
 const migrated=migrateLegacyRestrictedLoadout('robin',bag);assert.deepEqual(migrated,{items:[sword],equippedSlot:0});assert.equal(bag.items.length,2);
 const bad={items:[{weaponId:'fire',uses:null}],equippedSlot:0};assert.equal(migrateLegacyRestrictedLoadout('chrom',bad),bad);
 assert.equal(migrateLegacyRestrictedLoadout('frederick',{items:[{weaponId:'falchion',uses:null}],equippedSlot:0}).items[0].weaponId,initialLoadout('frederick').items[0].weaponId);
});
test('critical probability preserves current rule and one roll/feedback per burst',()=>{
 const p=newProgress();assert.equal(criticalChance(p),0);assert.equal(criticalChance(p,20),.2);
 p.stats.skill+=10;p.stats.luck+=8;assert.equal(criticalChance(p),.07);assert.equal(criticalChance(p,20),.25);
 let rolls=0;const attack=new CriticalAttack(p,20,()=>{rolls++;return .1});assert.equal(rolls,1);assert.equal(attack.critical,true);assert.equal(attack.claimFeedback(),true);assert.equal(attack.claimFeedback(),false);
 assert.equal(new CriticalAttack(p,0,()=>.8).claimFeedback(),false);
});
test('capabilities are immutable snapshots with bounded nearest-target impacts',()=>{
 const snap=attackSnapshot(WEAPONS.arcfire);assert.equal(snap.capabilities.shape.kind,'impact');
 (snap.capabilities.shape as {radius:number}).radius=500;assert.equal((WEAPONS.arcfire.capabilities!.shape as {radius:number}).radius,64);
 assert.equal(weaponCapabilities(WEAPONS['iron-sword']).shape.kind,'cone');
 assert.deepEqual(targetsInImpact({x:0,y:0},[{x:5,y:0},{x:2,y:0},{x:9,y:0},{x:50,y:0}],10,2),[{x:2,y:0},{x:5,y:0}]);
 assert.equal(WEAPONS.bolganone.capabilities!.shape.kind,'impact');assert.ok(WEAPONS.bolganone.cooldown>WEAPONS.fire.cooldown);
});

test('critical candidate provenance covers every hero with indexed source hashes',async()=>{
 const {readFile}=await import('node:fs/promises');const {HEROES}=await import('../src/game/data/config');
 const rows=JSON.parse(await readFile('docs/critical-voice-candidate-index.json','utf8')) as {hero:string;sha256:string;durationSeconds:number}[];
 for(const hero of HEROES)assert.ok(rows.some(row=>row.hero===hero),hero);
 for(const row of rows){assert.match(row.sha256,/^[a-f0-9]{64}$/);assert.ok(row.durationSeconds>0);}
});
