import {test} from 'node:test';
import assert from 'node:assert/strict';
import {healAmount,healingExperience,restoreHealth,selectHealingTarget,type HealingUnit} from '../src/game/systems/healing';

const unit=(x:number,health:number,maxHealth=100):HealingUnit=>({x,y:0,health,maxHealth,active:true});

test('staff targets endangered nearby allies and uses injured caster only as a fallback',()=>{
  const caster=unit(0,5),healthy=unit(10,100),dead=unit(10,0),distant=unit(181,1),injured=unit(100,20),near=unit(20,50),inactive={...unit(10,1),active:false};
  assert.equal(selectHealingTarget(caster,[caster,healthy,dead,distant,injured,near,inactive],180,caster),injured);
  assert.equal(selectHealingTarget(caster,[caster,healthy,dead,distant,inactive],180,caster),caster);
  caster.health=100;
  assert.equal(selectHealingTarget(caster,[caster,healthy,dead,distant,inactive],180,caster),undefined);
});

test('staff prioritizes percentage health and distance at equal severity, including exact range boundary',()=>{
  const a=unit(180,20),b=unit(50,40,200),c=unit(10,25);
  assert.equal(selectHealingTarget({x:0,y:0},[a,b,c],180),b);
  assert.equal(selectHealingTarget({x:0,y:0},[a],180),a);
});

test('healing scales with magic, caps at maximum health, never revives, and only successful heals grant XP',()=>{
  assert.equal(healAmount(15),15);
  assert.equal(healAmount(20),18);
  assert.deepEqual(restoreHealth(92,100,healAmount(15)),{health:100,restored:8});
  assert.deepEqual(restoreHealth(0,100,30),{health:0,restored:0});
  assert.deepEqual(restoreHealth(100,100,30),{health:100,restored:0});
  assert.equal(healingExperience(1,8),17);
  assert.equal(healingExperience(20,8),5);
  assert.equal(healingExperience(1,0),0);
});
