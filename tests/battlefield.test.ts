import {test} from 'node:test';import assert from 'node:assert/strict';
import {BATTLEFIELD,defaultDeployment} from '../src/game/data/battlefield';import {NavigationField} from '../src/game/systems/navigation';
test('every fixed camp, soldier and default party deployment connects through the larger terrain',()=>{
 const field=new NavigationField(BATTLEFIELD.width,BATTLEFIELD.height,BATTLEFIELD.terrain);field.setTarget({x:800,y:450});
 const positions=[...BATTLEFIELD.soldiers,...Object.values(defaultDeployment(['chrom','morgan','virion','sumia']))];
 for(const camp of BATTLEFIELD.camps)for(const i of camp.units.keys())positions.push({x:camp.x+(i%2)*60-30,y:camp.y+Math.floor(i/2)*60-30});
 for(const point of positions){assert.ok(point);assert.ok(field.isWalkable(point),JSON.stringify(point));assert.ok(field.hasRoute(point),JSON.stringify(point));}
});

test('four entrances connect the courtyard while barricades still block direct paths',()=>{
 const field=new NavigationField(BATTLEFIELD.width,BATTLEFIELD.height,BATTLEFIELD.siegeWalls.map(w=>w.rect));field.setTarget({x:640,y:352});
 for(const point of [{x:640,y:180},{x:1000,y:448},{x:640,y:740},{x:280,y:448}])assert.equal(field.hasRoute(point),true);
 assert.equal(field.canTravel({x:300,y:352},{x:480,y:352}),false);
 const opened=new NavigationField(BATTLEFIELD.width,BATTLEFIELD.height,BATTLEFIELD.siegeWalls.filter(w=>w.name!=='West north').map(w=>w.rect));assert.equal(opened.canTravel({x:300,y:352},{x:480,y:352}),true);
});
