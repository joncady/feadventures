import {test} from 'node:test';
import assert from 'node:assert/strict';
import {weaponSummary,forgeBenefit} from '../src/game/systems/weapon-summary';
import {WEAPONS,itemWeapon} from '../src/game/data/equipment';
import {newProgress,attackCooldown} from '../src/game/systems/progression';
test('shop compares actual tactical staff cooldown and group healing constraints',()=>{
 const member={hero:'lissa' as const,progress:newProgress()};
 assert.match(weaponSummary(WEAPONS.fortify,member),/Heal \+2 · Area 240 \/ 4 allies/);
 assert.match(weaponSummary(WEAPONS.fortify,member),/Ready 14\.40s/);
 assert.match(weaponSummary(WEAPONS.physic,member),/Ready 6\.72s/);
 assert.match(weaponSummary(itemWeapon({weaponId:'heal',forge:3,uses:null}),member),/Heal \+6.*Ready 4\.32s/);
 member.progress.stats.speed+=12;
 assert.ok(weaponSummary(WEAPONS.fortify,member).includes(`Ready ${(attackCooldown(member.progress,member.hero,WEAPONS.fortify)*2.4/1000).toFixed(2)}s`));
});
test('staff forge preview describes healing benefit while attack forge retains power and area',()=>{
 assert.equal(forgeBenefit(WEAPONS.heal,itemWeapon({weaponId:'heal',forge:1,uses:null})),'Heal bonus +0 → +2');
 assert.equal(forgeBenefit(WEAPONS.elfire,itemWeapon({weaponId:'elfire',forge:1,uses:null})),'Power 30 → 32 · AOE 48 → 52');
});
