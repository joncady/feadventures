import{test}from'node:test';import assert from'node:assert/strict';import{StageOne,STAGE_ONE}from'../src/game/systems/stage-one';
test('stage phases wait for clears and minimum wave windows before reaching the boss',()=>{
 const s=new StageOne();s.start(0);assert.equal(s.advance(4999,true),undefined);assert.equal(s.advance(5000,true),'wave');
 for(let i=1;i<=3;i++){assert.equal(s.wave,i);assert.equal(s.advance(s.waveStarted+44999,true),undefined);assert.equal(s.advance(s.waveStarted+45000,false),undefined);assert.equal(s.advance(s.waveStarted+45000,true),i<3?'rest':'boss-warning');assert.equal(s.advance(s.deadline-1,true),undefined);assert.equal(s.advance(s.deadline,true),i<3?'wave':'boss');}
 assert.equal(s.advance(200000,false),undefined);assert.equal(s.advance(200000,true),'complete');assert.equal(s.advance(200001,true),undefined);assert.equal(STAGE_ONE.hostileCap,24);
});
