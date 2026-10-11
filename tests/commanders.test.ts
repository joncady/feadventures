import {test} from 'node:test';
import assert from 'node:assert/strict';
import {COMMANDERS,commanderDefinition} from '../src/game/data/commanders';
import {unitDefinition} from '../src/game/systems/unit-profile';
test('named commander texture keys resolve their weapon and readable attack profiles',()=>{
 for(const id of ['gangrel','walhart','validar'] as const){const profile=unitDefinition(id);assert.equal(profile.key,id);assert.equal(profile.weapon,COMMANDERS[id].weapon);assert.ok(profile.attack.windup>=650);assert.ok(profile.attack.recovery>=800);}
});
test('Gangrel has two sword openings before an aimed Levin strike',()=>{assert.equal(commanderDefinition('gangrel',0).attack.kind,'melee');assert.equal(commanderDefinition('gangrel',1).weapon,'sword');const levin=commanderDefinition('gangrel',2);assert.equal(levin.weapon,'tome');assert.equal(levin.attack.kind,'ranged');assert.ok(levin.attack.windup>=1100);assert.equal(commanderDefinition('gangrel',3).attack.kind,'melee');});
test('Walhart commits longer than Gangrel and Validar second phase does not remove his windup',()=>{assert.ok(COMMANDERS.walhart.attack.recovery>COMMANDERS.gangrel.attack.recovery);assert.equal(commanderDefinition('validar',3,.4).attack.windup,1100);assert.ok(commanderDefinition('validar',3,.4).attack.cooldown<commanderDefinition('validar',3,.8).attack.cooldown);});
