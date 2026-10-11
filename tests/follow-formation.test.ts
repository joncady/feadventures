import {test} from 'node:test';import assert from 'node:assert/strict';
import {FollowFormation} from '../src/game/systems/follow-formation';
test('followers keep distinct stable slots while small reversals neither retarget nor restart walking',()=>{
 const f=new FollowFormation(),leader={x:640,y:448};const a=f.anchor('sumia',1,leader,0),b=f.anchor('virion',2,leader,0);assert.ok(Math.hypot(a.x-b.x,a.y-b.y)>150);assert.ok(Math.hypot(a.x-leader.x,a.y-leader.y)>160);
 assert.equal(f.moving('sumia',a,a),false);
 for(let n=1;n<=20;n++){const next=f.anchor('sumia',1,{x:640+(n%2?20:-20),y:448},n*100);assert.deepEqual(next,a);assert.equal(f.moving('sumia',{x:a.x-60,y:a.y},next),false);}
 const moved=f.anchor('sumia',1,{x:840,y:448},2200);assert.ok(moved.x>a.x&&moved.x<a.x+80);assert.equal(f.moving('sumia',{x:moved.x-100,y:moved.y},moved),true);assert.equal(f.moving('sumia',{x:moved.x-60,y:moved.y},moved),true);assert.equal(f.moving('sumia',{x:moved.x-40,y:moved.y},moved),false);
 const reverse=f.anchor('sumia',1,{x:640,y:448},2300);assert.ok(Math.abs(reverse.x-moved.x)<70,'reversal eases the anchor instead of flipping a slot');
});
