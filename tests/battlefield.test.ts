import {test} from 'node:test';import assert from 'node:assert/strict';
import {BATTLEFIELD,defaultDeployment} from '../src/game/data/battlefield';import {NavigationField} from '../src/game/systems/navigation';
test('every fixed camp, soldier and default party deployment connects through the larger terrain',()=>{
 const field=new NavigationField(BATTLEFIELD.width,BATTLEFIELD.height,BATTLEFIELD.terrain);field.setTarget({x:800,y:450});
 const positions=[...BATTLEFIELD.soldiers,...Object.values(defaultDeployment(['chrom','morgan','virion','sumia']))];
 for(const camp of BATTLEFIELD.camps)for(const i of camp.units.keys())positions.push({x:camp.x+(i%2)*60-30,y:camp.y+Math.floor(i/2)*60-30});
 for(const point of positions){assert.ok(point);assert.ok(field.isWalkable(point),JSON.stringify(point));assert.ok(field.hasRoute(point),JSON.stringify(point));}
});
