import {test} from 'node:test';import assert from 'node:assert/strict';
import {createWeaponAttack,impactTargets,claimAttackTarget,realDamageDrain} from '../src/game/systems/weapon-attack';import {WEAPONS} from '../src/game/data/equipment';import {newProgress} from '../src/game/systems/progression';
test('delayed attack snapshots retain launch power, weapon and one critical across hot swaps',()=>{
 let rolls=0;const p=newProgress();const attack=createWeaponAttack('robin',p,WEAPONS.elfire,()=>{rolls++;return .9});p.stats.mag+=20;
 assert.equal(attack.power,30);assert.equal(attack.weapon.id,'elfire');assert.equal(rolls,1);assert.equal(attack.critical.claimFeedback(),false);
 assert.equal(claimAttackTarget(attack,'enemy'),true);assert.equal(claimAttackTarget(attack,'enemy'),false);
});
test('bounded impact harms opponents only and never structures or fallen units',()=>{
 const attack=createWeaponAttack('robin',newProgress(),WEAPONS.elfire);const target=(x:number,faction:'ally'|'enemy',health=100,structure=false)=>({x,y:0,faction,health,structure,active:true});
 const targets=[target(1,'ally'),target(2,'enemy',0),target(3,'enemy',100,true),target(10,'enemy'),target(12,'enemy'),target(14,'enemy'),target(16,'enemy'),target(18,'enemy'),target(60,'enemy')];
 assert.deepEqual(impactTargets(attack,'player',{x:0,y:0},targets).map(t=>t.x),[10,12,14,16]);
 assert.deepEqual(impactTargets(attack,'enemy',{x:0,y:0},targets).map(t=>t.x),[1]);
});
test('staff attacks cannot crit and drain excludes overkill',()=>{
 const staff=createWeaponAttack('lissa',newProgress(),WEAPONS.heal,()=>0);assert.equal(staff.critical.critical,false);
 assert.equal(realDamageDrain(10,-400,.5),5);assert.equal(realDamageDrain(10,10,.5),0);
});
test('forging widens an area tome without mutating the shared definition; comparisons disclose tradeoffs',async()=>{
 const {itemWeapon}=await import('../src/game/data/equipment');const {weaponSummary}=await import('../src/game/systems/weapon-summary');const forged=itemWeapon({weaponId:'elfire',uses:null,forge:2});
 assert.equal(forged.damage,34);assert.equal((forged.capabilities!.shape as {radius:number}).radius,56);assert.equal((WEAPONS.elfire.capabilities!.shape as {radius:number}).radius,48);
 assert.match(weaponSummary(forged),/AOE 56/);assert.match(weaponSummary(forged),/0.80s/);assert.match(weaponSummary(WEAPONS.thoron),/Piercing line/);const staffPreview=weaponSummary(WEAPONS.fortify,{hero:'lissa',progress:newProgress()});assert.match(staffPreview,/Heal \+2 · Area 240 \/ 4 allies/);assert.match(staffPreview,/Ready 14\.40s/);
});
