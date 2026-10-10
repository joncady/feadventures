import {test} from 'node:test';import assert from 'node:assert/strict';
import {newProgress,gainExperience,attackPower,attackCooldown,killExperience} from '../src/game/systems/progression';
test('XP crosses multiple levels with carryover and independent stat growth rolls',()=>{
 const p=newProgress();const gains=gainExperience(p,'frederick',225,()=>.99);
 assert.equal(p.level,3);assert.equal(p.xp,25);assert.equal(gains.length,2);assert.equal(p.stats.hp,102);assert.equal(p.stats.str,20);
 const fresh=newProgress();gainExperience(fresh,'morgan',100,()=>0);assert.equal(attackPower(fresh,'morgan'),31);assert.ok(attackCooldown(fresh,'morgan')<600);assert.ok(fresh.stats.res>0);assert.equal(newProgress().level,1);
});
test('kill XP scales with level difference and cannot drop below minimum or exceed cap',()=>{
 assert.equal(killExperience(1,1,'soldier'),25);assert.equal(killExperience(30,1,'soldier'),5);assert.equal(killExperience(1,30,'mage'),40);
});
